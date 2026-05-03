---
name: headless-spec-failures
description: Open list of recipes from test-spec-master.md that fail under tools/run-spec-headless.js for reasons other than runner/parser bugs. Each item is actionable.
type: runbook
status: living
---

# Headless spec failures — open list

## How this list was produced

`tools/run-spec-headless.js` was run on a freshly-loaded editor with no
imported image. We exclude:

- recipes whose verifies are pure prose (tracked separately as a spec-quality
  task; not actionable runtime evidence)
- recipes that fail because `tools/test-runner-browser.js`'s parser cannot
  read a particular DSL form (those are runner bugs — fix the parser, not
  the spec)

Everything below is something a person can chase: either the recipe is
missing a prereq, the spec author wrote ambiguous syntax, or the
implementation diverges from the spec's stated invariant.

Last refreshed: 2026-05-02 after wave-6 (selection step migration:
`call:state.selectedBone=0`, `call:setActiveVertexSelection([0])`, plus a
new `mesh-edit-mode` fixture preset). Wave-6 net was +3 PASS
(19 → 22 / 63), reaching a steady state where remaining failures are
substantively harder than "missing selection".

## Categories at a glance

| Category | Count | Fix shape |
| --- | --- | --- |
| A. Recipe needs state setup (mesh / bones / weights / 2 slots) | **resolved in wave-5/6** via fixture presets + selection migration; 8 recipes now PASS | — |
| B. Recipe uses a DSL form the runner doesn't support yet | 1 | extend the runner DSL; small per-feature additions |
| C. Spec uses local "let X" bindings the runner can't see across lines | 0 | **resolved in wave-4** via `set:` step + `scratch` object |
| D. Spec ↔ implementation real divergence (or harder-than-selection setup) | ~10 | investigate per recipe — these are the only "real" bug candidates left |
| E. **(new)** Recipe needs DOM focus, clipboard, or geometric correctness | ~5 | needs runner-level work or per-recipe rewrites; not "just selection" |
| F. **(new)** Recipe verifies are still prose (mid-recipe assertions, fuzzy compares) | ~15 | mechanical migration to DSL `set:` + `function_returns`, but each recipe is unique |

**Wave-5 net result**: headless 14 → 19 stable PASS (out of 63 AUTO recipes).
Of the 5 newly-passing: `mesh-auto-foreground`, `mesh-reset-to-grid`,
`bone-color-clear`, `timing-populated-after-frames`, and `weight-brush-stroke`
(the last one stacks all wave-3/4/5 wins: parser + scratch + cx/cy pointer +
mesh-with-weights fixture).

**Wave-6 net result**: 19 → 22 PASS via selection step migration. Three new
recipes flipped (`mesh-vertex-pin-unpin`, `mesh-delete-vertex`,
`bone-color-set`) by adding `call:setActiveVertexSelection([0])` or
`call:state.selectedBone=0`, plus a new `mesh-edit-mode` fixture preset
that puts the editor in slotmesh edit tab (most slot-mesh hotkeys are
gated on `isSlotMeshEditTabActive()`).

**What wave-6 did NOT solve**: tried `mesh-add-centroid`,
`mesh-subdivide-selected`, `weight-copy-paste`. Each fails for a reason
that is *not* about selection:

- `mesh-subdivide-selected` requires the 3 selected vertices to actually
  form an existing triangle in the mesh's triangulation. Naïve `[0,1,2]`
  doesn't satisfy. (Category E)
- `mesh-add-centroid` requires the selection to enclose a plausible region
  (tested 4 verts, but the action's geometric guard rejected). (Category E)
- `weight-copy-paste` Ctrl+C/V is gated on browser focus / clipboard which
  a plain `key:ctrl+c` doesn't fully replay. (Category E)

A `select-vertex:N` step DSL was considered and rejected — it would not
shorten any of the above cases meaningfully, since `call:setActiveVertexSelection([0])`
is already 1 line and the real blocker is geometric/event-flow correctness,
not verbosity.

## Category A — needs a prereq fixture (mesh/slot/skin)

These recipes require a loaded image / mesh / skin before they can run.
The headless runner spins up a clean editor with `state.mesh = null`.

The right fix is **wave-3+ scaffolding**: a `prereqs:` interpreter that, given
a recipe's `prereqs:` line, runs a deterministic setup (load a tiny synthetic
PNG, build a default mesh, select slot 0, etc.) before the steps run.

- `mesh-auto-foreground` — `ensureSlotContour(getActiveSlot())` on null slot
- `weight-auto-multi-bone` — `getActiveAttachment(getActiveSlot()).meshData` on null
- `bone-color-set` / `bone-color-clear` — `state.mesh.rigBones[0]` on null
- `gpu-weight-heatmap-program-compiles` — overlay program is lazily compiled by
  the render loop; with no mesh, render path that needs it never fires
- `waveform-svg-rendered-on-event-track` — needs a project with timeline events
- `timing-populated-after-frames` — needs the render loop to have ticked at
  least once, which only happens after import (this one is also flaky:
  passes/fails depending on Chromium scheduling)

Workaround until the scaffolding exists: skip these in headless via
`--filter` exclusions, or guard the recipes' verifies with a "if no mesh,
skip" preamble. Long-term: build the scaffolding.

## Category B — runner DSL gap

- ~~`weight-brush-stroke` uses `pointer:overlay@cx,cy:drag@cx+50,cy`~~ —
  **resolved in wave-4** by extending the pointer-step DSL to accept `cx`,
  `cy`, and `±N` offsets. Recipe was also migrated to use `set:` for the
  before/after weights snapshot. The recipe is now blocked only by the
  Category A "no mesh / no attachment" prereq.

- `mesh-relax` writes `state_path \`vertex offset magnitude smaller than before\``
  — verb-style English instead of an evaluable expression. The runner sees
  `vertex offset magnitude smaller than before` as a JS expression and throws
  `Unexpected identifier 'offset'`. This is really a Category C/D mix:
  either rewrite the verify with a cross-line scratch (Category C) or add a
  built-in helper that captures a numeric scalar before steps and compares
  after (small, useful runner extension).

## Category C — cross-line "local variable" bindings

**Resolved in wave-4.** The runner now exposes a fresh `scratch` object per
recipe, and a `set:NAME=expr` step stashes values into it. Steps and verifies
both see `scratch.NAME`. Three recipes were migrated:

- `mesh-auto-foreground-params` — uses `set:L1` / `set:L2` (was `record … as L1/L2`)
- `linkedmesh-create` — uses `set:slotB` / `set:attB`
- `weight-brush-stroke` — uses `set:weightsBefore` / `set:undoBefore`

Each migrated recipe now fails (only) on its real prereq (`getActiveSlot()`
returning null), which is exactly Category A. They will pass once Category A
scaffolding lands.

**Still in this category**: `weight-brush-modes` is *not* a cross-line binding
issue; it's a parameterized test the spec forgot to spell out. Its `mode`
bareword is meant to be the loop variable across each click of the four
mode buttons. **Fix shape**: rewrite the recipe as four sub-cases (one per
mode), or extend the runner with a per-recipe loop construct (overkill).
Recommended: rewrite manually.

## Category D — possible spec ↔ implementation divergence

These are the only items where the recipe and the runner are both sound but
they disagree. Each deserves a short investigation:

- **`mesh-reset-to-grid`** — recipe expects `c.points.length === 4` after
  Reset To Grid (4 corner points = a rect). Runner sees something else.
  Either the action does not produce a 4-corner rect under the no-mesh
  default state, or the recipe was written assuming a different starting
  shape.

- **`weight-brush-toggle-W`** — `key:w` does not flip `state.weightBrush.active`
  to `true`. Possible causes: the W hotkey handler requires a focused mesh
  edit area, requires a mesh to exist, or fires off an `els.brushBtn.click()`
  that itself bails out. Worth following the hotkey through
  `app/ui/hotkeys.js` and checking guards.

- **`weight-bone-lock`** — clicking the lock toggle does not push into
  `state.weightBrush.lockedBones`. Lock-row buttons may require a selected
  bone first, which the recipe doesn't establish.

- **`weight-prune`** — UI says "Prune: No active mesh." which is a real
  guard message. Same root cause as Category A — but the user-visible label
  also exists, so it's worth adding a `prereqs: mesh` flag the runner could
  honor.

- **`skin-bone-hidden-when-not-active`** — `isBoneHiddenBySkin(state.mesh, 3)`
  returns false; recipe expects true. With no skin set up, this collapses to
  Category A. After scaffolding lands, re-check.

## Suggested order

1. ~~Category B (runner DSL gaps)~~ — **done in wave-4** (1 of 2 resolved;
   the remaining `mesh-relax` item needs a spec helper, not a runner
   change).
2. ~~Category C (cross-line bindings)~~ — **done in wave-4** via `set:` +
   `scratch`. 3 of 4 recipes migrated; `weight-brush-modes` still needs a
   manual rewrite into per-mode sub-cases.
3. **Next: Category A** — build the prereq scaffolding. This is the
   highest-leverage remaining work: 9 recipes are blocked on it, and the
   runner shape is now stable enough to layer scaffolding on top without
   rework.
4. **Last** — once Category A lands, Category D is the only one left, and
   those are the items most likely to be real bugs worth investigating.

## What this list is NOT

- It is not a list of bugs in `d:\claude` source code. Items in Category D
  are *candidate* divergences that need investigation; the others are
  tooling and spec-authoring gaps.
- It is not a checklist for `tools/run-checks.js` to enforce. These items
  surface only via `tools/run-spec-headless.js`, which is run on demand,
  not as a hard gate.
