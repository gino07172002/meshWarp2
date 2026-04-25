---
name: running-tests
description: How to run the master test spec, both the static-analysis tools and the browser functional runner.
type: runbook
status: living
---

# Running the editor test suite

Two layers, both already in the repo:

## 1. Static-analysis tools (Node, headless)

These check source structure, never load the browser. Run once:

```
for f in tools/check-*.js; do node "$f"; done
```

CI script equivalent:

```
fail=0
for t in tools/check-*.js; do
  node "$t" || fail=$((fail+1))
done
exit $fail
```

A green run guarantees:
- All asset cache versions are at-or-above the documented floor (via `tools/lib/version-floor.js`).
- The required architectural patterns (e.g. `pushMeshDebugEvent` is present, the
  attachment context menu exists, mesh dirty-flag is wired) are still in place.

It does **not** guarantee runtime correctness — see layer 2.

## 2. Functional runner (Browser)

The master spec lives at `docs/superpowers/specs/test-spec-master.md`. The
node-side parser turns it into JSON; a browser-side runner executes the
recipes against the live editor.

### Step 1: parse the spec

```
node tools/test-spec-runner.js --json > /tmp/test-recipes.json
```

(`--json` prints the array; without it you get a human-readable index.)

### Step 2: open the editor in a browser, load the runner

In DevTools console:

```js
// Inject the runner code
fetch("/tools/test-runner-browser.js").then(r => r.text()).then(eval);

// Paste the recipes JSON (output of step 1)
const recipes = /* paste here */;

// Run all
await editorTestRunner.runAll(recipes);

// Or filter by id substring
await editorTestRunner.runAll(recipes, { filter: "weight-" });
```

### Step 3: read results

Each recipe logs `[PASS|FAIL|SKIP]` with errors. Skip = `manual_only:true`.
The summary at the end shows totals.

## Step DSL reference (browser runner)

Recipe `steps` understands:

| step | meaning |
|---|---|
| `click:#id` | click an element by id |
| `set_value:#id=VALUE` | set input.value, fire input + change |
| `set_checked:#id=true` | set checkbox checked, fire change |
| `select_option:#id=VALUE` | set select.value, fire change |
| `key:v` / `key:ctrl+c` / `key:Delete` | dispatch keydown on window |
| `wait:200` / `wait:200ms` | sleep N milliseconds |
| `call:expr()` | eval a JS expression in the page (be careful) |

Steps that are pure prose (e.g. "select 3 vertices forming a triangle") are
**logged and skipped** in phase 1; they need a human or a higher-level
automation. The runner reports them in the recipe's `errors` list with a
`SKIPPED (prose only)` prefix.

## Verify DSL reference

Each `verify` line is parsed as `<kind> <target> <op> <expected>`:

| kind | target | example |
|---|---|---|
| `state_path` | JS expression on `state` | `state.weightBrush.active == true` |
| `function_returns` | a function call | `getActiveSlot() != null == true` |
| `dom_text` | css selector | `#status contains "Pruned"` (use `contains`) |
| `dom_class` | css selector + `has`/`contains` op + class | `#weightOverlayQuickBtn has active` |
| `dom_attr` | `selector[attr]` | `body[data-fullscreen] == "true"` |
| `dom_exists` | css selector | (any value, just truthy) |
| `array_length` | JS expression returning an array | `state.slots == 3` |

`==` is loose; it tries JSON-parse on the expected token first.

## What's missing (phase 2)

- **`pointer:overlay@x,y`** drag emulation on the canvas overlay (would let us
  test brush strokes, vertex drag, bone drag, mesh-edit pointer flows).
- **Screenshot diff** for `manual_only: true` visual cases.
- **Setup state isolation** between recipes — currently recipes inherit each
  other's mutations. Either run only one at a time, or call a `resetEditor()`
  helper between runs (TODO in the runner).

## Adding a new recipe

1. Edit `docs/superpowers/specs/test-spec-master.md`.
2. Append a `### feature_id` block under the right `## Section`.
3. Run `node tools/test-spec-runner.js --validate` — it'll flag any missing
   fields.
4. Test by passing the JSON into the browser runner.

## Pre-commit check (suggested)

```
node tools/test-spec-runner.js --validate && for f in tools/check-*.js; do node "$f" || exit 1; done
```

If both pass, the structural side of the codebase is sound. Functional
correctness still requires the browser pass.
