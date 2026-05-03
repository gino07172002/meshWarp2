---
name: harness-engineering
description: How d:\claude (the target) does its share of harness engineering — what tool to run, in what order, and how to read failures.
type: runbook
status: living
---

# Harness Engineering for d:\claude

This runbook is the d:\claude side of harness engineering. d:\harness owns
capture/replay/proxy. This repo owns:

- proving its own environment is sane (Doctor)
- running source-level invariants (Validation, layer 1)
- running runtime invariants in the live page (Validation, layer 2)
- consuming traces produced by d:\harness (Diagnostics)
- writing it all down so the next agent doesn't reinvent it (Runbooks)

If you arrived expecting capture/replay tooling, read d:\harness — that's its
job. This runbook covers the artifacts and tools that live inside d:\claude.

## Mapping to harness-engineering principles

| Principle | Tool | Layer |
| --- | --- | --- |
| Doctor | `tools/doctor.js` | env / setup |
| Validation (source) | `tools/run-checks.js` (driving every `check-*.js`) | static |
| Validation (runtime, manual) | `tools/dom-state-invariants.js` | live page |
| Validation (runtime, automated) | `tools/run-spec-headless.js` | Playwright-driven editor |
| Diagnostics | `tools/trace-inspect.js` | reading d:\harness traces |
| Regression (target-side) | `tools/check-trace-fingerprints.js` + `tools/golden/` | locked fingerprints over synthetic traces |
| Artifacts | `runs/*.jsonl` (via `--runlog`) | local run log |
| Run-log inspector | `tools/show-runs.js` | summarize / diff runs/*.jsonl |
| Runbooks | this file | docs |
| Boundary | trace files come from d:\harness; this repo never writes capture data | implicit |

Capture, Replay, and the golden traces of the harness itself live in
d:\harness. We don't shadow them here. What we do shadow:
target-side fingerprint regression (`check-trace-fingerprints.js`) — that's
about protecting our diagnostic tools from drift, not protecting d:\harness.

## Order of operations

```
doctor → run-checks → (work on code) → run-checks again → dom-state-invariants → trace-inspect (if a trace is involved)
```

If you skip Doctor and the rest fails, you don't know whether you broke the
code or the environment.

## The five wave-1 tools

### 1. `tools/doctor.js`

```
node tools/doctor.js
node tools/doctor.js --json                    # machine-readable
node tools/doctor.js --harness D:/harness      # also probe sibling harness via its own doctor
```

Verifies: Node version, `index.html` present, `tools/lib/version-floor.js`
loadable, every `check-*.js` parses, browser runner parses, test spec is
valid, `runs/` is writable.

Exit 0 = green. Exit 1 = at least one check is red; read the FAIL lines and
fix the most foundational one first (Node → files → check parsing).

### 2. `tools/run-checks.js`

```
node tools/run-checks.js                            # run all check-*.js
node tools/run-checks.js --filter workspace         # subset by name
node tools/run-checks.js --bail                     # stop on first failure
node tools/run-checks.js --json                     # machine summary
node tools/run-checks.js --runlog                   # also append runs/*.jsonl
```

Replaces the legacy `for f in tools/check-*.js; do node "$f"; done` line. On
Windows PowerShell that line does not work; this tool does. Each check runs
in its own node process so a `process.exit(1)` from one check cannot affect
the rest.

What a green run guarantees: every recorded source-level invariant
(asset cache versions, architectural patterns, mesh dirty-flag wiring, the
post-import `updateWorkspaceUI()` call, …) is still in place. It does **not**
guarantee runtime correctness — that's tool 3.

### 3. `tools/dom-state-invariants.js`

Two modes.

**Browser mode** (DevTools console while the app is loaded):

```js
fetch("/tools/dom-state-invariants.js").then(r => r.text()).then(eval);
const r = window.domStateInvariants.check();
console.table(r.violations);
```

Each rule is one DOM ↔ state invariant the app must maintain at runtime.
Current rules guard the workspace switcher (the area the
`#workspaceTabObject` failure trace exposed) plus the active-tab agreement.

**Node mode** (catalog only — does not run rules):

```
node tools/dom-state-invariants.js --list      # one rule id per line
node tools/dom-state-invariants.js --json      # full catalog with rationale
node tools/dom-state-invariants.js --validate  # rule shape sanity
```

#### Rule for adding a rule

Adding a rule = appending one entry to the `RULES` array with `id`, `when`,
`expect`, `describe`, `rationale`, `sources`. Keep rules single-fact and
self-justifying; if a rule needs more than two clauses to explain, split it.

**Hard rule (learned the hard way in wave-7):**

> **Every invariant must point to a concrete bug, trace path, or
> reproducible scenario in its `rationale`. Speculative "this would
> historically hint at..." rules get false-positives and waste runs.**

Concrete means one of:

- a path to a trace artifact that demonstrated the bug (e.g.
  `D:/harness/.../traces/20260501T060902560215Z.json`)
- a commit hash or PR number where the bug was fixed
- a step-by-step repro the rule would catch

If you can only write a rationale of the form "if X drifted from Y the user
would be confused" without naming what made you think of it, **don't add
the rule**. Speculative rules tend to false-positive on legitimate edge
cases (e.g. an "always visible" panel button being temporarily collapsed
inside a `<details>` element looks like a violation but isn't).

What we removed under this rule:

- `addBoneBtn-only-visible-in-rig-edit` — was added speculatively in
  wave-1; wave-7 found it false-positived because the button lives inside
  a `<details>` that can collapse, and the `display !== "none"` check did
  not look through ancestor visibility. No bug was actually being guarded.

If a future invariant violates this rule, delete it; do not patch its
predicate to dodge a specific false-positive. Patching a wrong premise
just hides it deeper.

### 4. `tools/trace-inspect.js`

Reads d:\harness trace JSON locally. Use this when you have a failing trace
and want to know what actually happened without spinning up the whole
harness toolchain.

```
node tools/trace-inspect.js <trace.json>                                    # summary
node tools/trace-inspect.js <trace.json> --selector '#workspaceTabObject'   # pointerdown/up/click sequence
node tools/trace-inspect.js <trace.json> --dead-end-clicks                  # find pointer-without-click pattern
node tools/trace-inspect.js <trace.json> --dom-state '#workspaceTabObject' --field disabled
node tools/trace-inspect.js <trace.json> --json                             # any of the above as JSON
```

`--dead-end-clicks` exits 1 if it finds the failure-trace fingerprint
(`pointerdown ≥ 3`, `pointerup ≥ 3`, `click = 0` on the same selector). That
makes it usable in CI as a regression check against any new trace.

### 5. This runbook

The map. If you find yourself running ad-hoc commands the runbook doesn't
mention, either you're solving a one-off (fine, throw the script away after)
or there's a missing entry here. In the latter case, edit this file.

## How to read failures

```
doctor red                    → environment / setup problem (don't trust anything else)
run-checks red                → source-level invariant broken; failing check
                                names what it was guarding
run-spec-headless red         → recipe execution diverged in a real browser;
                                the recipe's `errors[]` plus
                                `invariantViolations[]` say which contract
                                broke. --headed reproduces visually.
dom-state red                 → state and UI disagree at runtime; almost
                                always "someone forgot to call an update
                                function"
trace-inspect dead-end-clicks → user clicked something that consumed pointer
                                events but never fired click; usually a
                                disabled or re-rendered element. Cross-check
                                with --dom-state <selector> --field disabled.
check-trace-fingerprints red  → trace-inspect.js output drifted from the
                                pinned shape; either trace-inspect regressed
                                or someone edited a synthetic trace without
                                updating its fingerprint.
```

The order of suspicion when several layers fail at once: trust doctor first,
then source checks, then runtime invariants, then trace-derived findings.
Higher layers can mask lower-layer failures.

## What to commit, what to ignore

- `tools/doctor.js`, `run-checks.js`, `dom-state-invariants.js`,
  `trace-inspect.js` are committed.
- `tools/check-*.js` are committed — adding one is the standard way to
  capture a new source-level invariant after fixing a bug.
- `runs/*.jsonl` is generated and **gitignored**.
- Trace JSON files belong in d:\harness, not here. If you need a regression
  fixture in this repo, copy the relevant fields into a tiny synthetic JSON;
  full traces are too large to track here.

## What this layer does not cover (read d:\harness)

- recording user sessions (proxy + injected client)
- deterministic replay
- snapshot divergence diffing
- golden-trace regression

Those are the harness's job. Asking d:\claude to do them would violate the
boundary and duplicate effort.

## Wave-2 tools

### `tools/run-spec-headless.js`

Drives a real Playwright Chromium, loads `index.html` from a tiny built-in
static server, injects `tools/test-runner-browser.js`,
`tools/headless-fixtures.js`, and (by default)
`tools/dom-state-invariants.js`, then runs every AUTO recipe from
`docs/superpowers/specs/test-spec-master.md`.

Recipes that declare `- **fixture**: <preset>` get a deterministic state
setup before their steps run (e.g. `mesh-with-weights` builds a mesh +
two bones + auto-weighted bind). See `tools/headless-fixtures.js` for the
preset catalog.

```
node tools/run-spec-headless.js                            # all AUTO recipes
node tools/run-spec-headless.js --filter weight-           # by id substring
node tools/run-spec-headless.js --recipe import-image      # exact id
node tools/run-spec-headless.js --headed                   # visible browser
node tools/run-spec-headless.js --no-invariants            # skip post-recipe DOM-state check
node tools/run-spec-headless.js --json --runlog            # CI-friendly output
```

Why a real browser, not jsdom: the editor uses WebGL, OffscreenCanvas, and
many DOM APIs jsdom doesn't implement. Playwright already ships Chromium;
faking everything else is more work than spawning the real thing.

What a green run guarantees: every AUTO recipe whose verifies are expressed
in DSL passed, and no DOM-state invariant was violated at any recipe
boundary. (Recipes whose verifies are still in prose will report
`unparseable verify` — that's a spec-quality issue, not a runtime one.)

### `tools/check-trace-fingerprints.js` + `tools/golden/`

`tools/golden/` ships pairs of `*.synthetic.json` (a minimal hand-written
trace) and `*.fingerprint.json` (the expected output of `trace-inspect.js`
on it). The check runs `trace-inspect.js` over each fingerprint and fails
if the output drifts.

Two fixtures ship today:

- `disabled-button-failure.*` — the failure trace shape that motivated the
  whole tooling effort (pointerdown ≥ 3, pointerup ≥ 3, click = 0, with
  `disabled=true`). Locks in our ability to *recognize* that pattern.
- `healthy-claude-trace.*` — negative control. If this ever trips
  dead-end detection, our detector has become too aggressive.

This check is auto-discovered by `tools/run-checks.js` because it's named
`check-*.js`.

### `tools/show-runs.js`

```
node tools/show-runs.js                          # last 10 runs, one per line
node tools/show-runs.js --tool run-checks        # filter by tool name
node tools/show-runs.js --last                   # full detail of most recent
node tools/show-runs.js --failed                 # only failed runs
node tools/show-runs.js --diff                   # diff most recent two runs (same tool)
```

`--diff` is the highest-leverage flag: when a check or recipe goes red, it
tells you exactly which item flipped state since the last clean run.

## Adding more later

If the next bug requires:

- a runtime invariant that needs the editor to be live → add a rule to
  `tools/dom-state-invariants.js`. Don't fork.
- a new source-level guard → add a `tools/check-*.js`, then it's picked up
  automatically by `run-checks.js` and `doctor.js`.
- a new failure-trace shape we want to recognize → add a synthetic +
  fingerprint pair under `tools/golden/`. Auto-picked up by
  `check-trace-fingerprints.js`.
- a new recipe-prereq state shape → add a preset to
  `tools/headless-fixtures.js` and reference it via `- **fixture**: <name>`
  in the recipe.
