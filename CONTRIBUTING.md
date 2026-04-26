# Contributing

Thanks for considering a contribution. The project is single-author + AI agents
today; outside contributions are welcome but please read the conventions below
first — they're enforced.

## Setup

```bash
# Just clone and serve. No npm install. No bundler.
git clone <this-repo>
cd <this-repo>
python -m http.server 5173
# open http://localhost:5173
```

If you want to run the static check tools (recommended before any commit):

```bash
# Node 18+ required
for f in tools/check-*.js; do node "$f"; done
```

## Code conventions

These are **enforced** — most by static check tools, some by code review.

### No build step, no modules, no imports

Every file is loaded via `<script src=...>` in `index.html`. Top-level
`function foo() {}` and `const bar = ...` declarations become globals
accessible to every later script. There are no imports or exports.

When you add a new file:
1. Add a `<script src="app/<path>?v=<datestamp>-N">` to `index.html` in
   the right load-order position.
2. Add the path to `tools/check-cache-busting-assets.js`.

### Per-file ROLE / EXPORTS header

Every `app/**/*.js` file starts with a comment block:

```js
// ROLE: one-paragraph statement of what this file owns
// EXPORTS: foo, bar, baz (the major top-level functions)
// CONSUMERS: where these get called from
```

When you add or remove top-level functions, update the EXPORTS list.

### `els` registry, not `getElementById`

DOM refs live in `app/core/runtime-els.js` as `const els = {...}`.
Use `els.foo`. Don't sprinkle `document.getElementById(...)` in business
logic. New ids must be registered there.

### `slot.attachments[i]`, not `slot.meshData`

Mesh data lives on the active attachment, not on the slot. Use
`getActiveAttachment(slot).meshData` (or the safe getter
`readSlotMeshData(slot)`). The `tools/check-legacy-slot-mesh.js` check
will fail CI if it finds direct `slot.meshData` access.

### No comments explaining WHAT

Only add a comment if the *why* is non-obvious — a hidden constraint, a
subtle invariant, a workaround for a specific bug. Don't write
"increment i" or "this is the loop" — well-named identifiers should
already say that.

### One undo checkpoint per user action

After mutating state via a user-triggered action, call
`pushUndoCheckpoint(true)`. Don't checkpoint inside drag move handlers —
only at drag end.

### Refresh after mutating

After mutating slot/attachment data: call `refreshSlotUI()` or
`refreshAttachmentPanel()`.
After mutating slot/attachment structure: call `renderBoneTree()`.
After mutating bones: call `updateBoneUI()`.

### Cache-buster query on script tags

Every `<script src="app/...">` needs a `?v=<datestamp>-N` suffix. Bump
the suffix when you change the file. The static check tool enforces
presence; convention enforces freshness.

## Commits

Style: short subject (under 72 chars) summarising the *change*, then a
body explaining *why* and any caveats. Reference test recipes if you
added them.

Example:

```
Spine 4.2 Physics Constraints: data model + Euler solver + Physics tab UI

Bone-driven dynamics constraint that springs the bone toward its rest
pose with damping. Closes the largest remaining "Important" gap in
test-spec-master.md Section C.

Implementation:
- ensurePhysicsConstraints normalizer (workspace/constraint-model.js)
- applySinglePhysicsConstraintToBones — semi-implicit Euler with
  substepping, wrapped-angle rotation, velocity clamp, inertia lerp
- New Physics tab in the constraint panel (between Path and Skin)
- Project save/load + Spine JSON export

Tests: 6 new recipes (physics-add-defaults, ...).
```

Don't squash unrelated changes. One concept per commit.

## Pre-commit checklist

```bash
# 1. Syntax check anything you edited
node --check app/<file>.js

# 2. Run all 25 static checks
for f in tools/check-*.js; do node "$f"; done

# 3. Validate the test spec
node tools/test-spec-runner.js --validate

# 4. Manually exercise the feature in the browser
#    (the runner DSL doesn't replace human verification)
```

See [TESTING.md](TESTING.md) for the full validation guide.

## Adding a new feature

1. Sketch the design in `docs/superpowers/plans/<date>-<feature>.md`
   (optional but encouraged for non-trivial features).
2. Implement.
3. Add a section to `docs/superpowers/specs/test-spec-master.md` with at
   least one recipe per public-facing user action.
4. Update `SPINE_FEATURE_GAP.md` if it touches Spine parity.
5. If the feature exposes new diagnostic state, add it to `debug.*` in
   `app/core/debug.js` so AI agents can introspect it.
6. Commit.

## Reporting bugs

The fastest path to a fix:

1. Open browser DevTools.
2. `debug.clear()` to wipe the action log.
3. Reproduce the bug.
4. `copy(debug.actionLogText())` to copy the chronological replay.
5. `copy(JSON.stringify(debug.snapshot(), null, 2))` for state context.
6. `copy(JSON.stringify(debug.errors(), null, 2))` if anything blew up.
7. Paste all three into the issue.

## License

Contributions are accepted under the project's [LICENSE](LICENSE).
