---
name: 2026-04-25-spine-feature-batch
description: Changelog for the Spine-feature catch-up sprint that landed the weight brush, GPU heatmap, prune/weld/swap, update bindings, linkedmesh inheritTimelines, two-color tint runtime, bone color, tree visual differentiation, and the master test spec.
type: changelog
status: shipped
date: 2026-04-25
---

# Spine Feature Batch — 2026-04-25

A multi-session sprint that brought the editor much closer to feature parity
with Spine 2D Pro for mesh + weight workflows. Landed in one commit cluster.

## Highlights

### Mesh / Weight workflow
- **Weight Paint Brush** with Add / Remove / Replace / Smooth modes, configurable
  size / strength / feather, per-mode cursor colour and glyph (`+ − → ~`).
- **Bone Lock** for the brush — protects locked bones from any brush op or weld
  / swap. Toggle from the bone tree row when brush is active.
- **Prune** — one-click drop of low-weight influences below a threshold, with
  preview + apply, locked-bone aware.
- **Weld** — merge bone A's weights into bone B for every vertex.
- **Swap** — exchange two bones' weight columns.
- **Update Bindings** — re-bake the rest pose to the current posed appearance
  while keeping weights and visual identical (Spine equivalent). Pose/Animate
  mode pops a confirmation because deform key semantics shift.
- **Copy / Paste vertex weights** with `Ctrl+C` / `Ctrl+V` and panel buttons.
- **Auto Foreground parameters** — alpha threshold, padding, detail multiplier
  exposed in Mesh → Generate → Advanced.

### Linked Mesh
- New `inheritTimelines` boolean on linkedmesh attachments. When on, the
  linked mesh's deform timeline follows the source mesh's, even across slots.
- Spine JSON export's `deform` flag now respects this property (was hardcoded
  to `true`).

### Rendering
- **WebGL infrastructure (Phase 0)**: `app/render/gl-toolkit.js` provides a
  shared toolkit for adding extra GL passes — context wrappers, shader cache,
  texture helpers, fullscreen quad. New `#glOverlayCanvas` for overlay GL.
- **GPU Weight Heatmap (Phase 1)**: per-pixel triangle rasterise moved from CPU
  (`drawContinuousWeightHeatmap`) to a fragment shader on `#glOverlayCanvas`.
  Brush-stroke heatmap now smooth at full resolution.
- **Two-Color Tint (Spine Pro parity)**: main fragment shader now composites
  `slot.dark` into the shadow channel using Spine's `tex.rgb*light + (1-tex.rgb)*dark*tex.a`
  formula. Disabled slots get `dark = (0,0,0)` so output is identical to the
  pre-change single-color path.
- **Context-loss safety**: gl-toolkit registers `webglcontextlost`/`restored`
  listeners on both canvases, drops cached programs on loss, and fires
  consumer callbacks. `app/render/canvas.js` early-returns while context is
  lost. (Full main-render rebuild on restore is left as a TODO for the next
  major GPU phase.)

### UI / UX
- **Mesh panel reorganised** into Edit Target / Generate / Topology / Weights
  / Weight Paint / Deform Preview sections, plus a sticky Apply / Create+Apply
  bar.
- **Mesh quick-toggle bar** at the top of the Mesh panel: a high-visibility
  pill that toggles the Weight Overlay (auto-syncs with the brush).
- **Bone tree visual differentiation**: type colour bars (bone / slot /
  attachment), Unicode type icons (`▸ ★ ◆ □ ◇ ◈ ▭ ✂ •`), font-weight + size
  + italic separation per row type, active states highlighted.
- **Hover row actions**: `+ / ✎ / ✕` icons on tree rows for Add / Rename /
  Delete, Spine-style.
- **Bone color** field in bone properties for editor-only visualisation
  tinting; `b.color` persists via `cloneBones` spread.
- **Hotkeys**: `A` is now select-all (Blender-style). Add-attachment hotkey
  removed (use right-click menu / panel button). `W` toggles weight brush.
  `F11` button + hotkey added for fullscreen.
- **Panel section unification**: every left-side tool panel uses the same
  `.panel-section` collapsible card with arrow indicator. The "advanced"
  sub-disclosure becomes a tinted blue card when open so the active tool is
  obvious.

### Bug fixes
- **Tree stable during bone edit drag** — dragging a bone head/tail no longer
  triggers per-pointer-move `rebuildSlotWeights`, which previously caused
  weighted slots to flicker between bones in the tree mid-drag. Rebuild now
  runs once on drag end.
- **Weight Overlay was sticky** — toggling the Mesh-panel quick button or
  unchecking the Deform Preview checkbox now immediately clears the GPU
  heatmap canvas. Brush off no longer leaves the overlay running.
- **Spine JSON export** for linked meshes was always writing `deform: true`;
  now follows `inheritTimelines`.

### Tooling / testing
- **Master test spec** (`docs/superpowers/specs/test-spec-master.md`) — 45
  machine-readable test recipes covering every shipped feature, plus a
  coverage-gaps section for the Spine features still to land (physics
  constraints, sequence frame timeline, skin scope expansion, audio preview,
  ghosting breadth, project import). A future agent can drive these recipes
  directly.
- **`tools/test-spec-runner.js`** — node parser + validator for the spec.
  `--json` emits machine-readable output for headless runners to consume.
- **`tools/lib/version-floor.js`** — replaces the brittle
  `must-equal-version-XYZ` checks across six static-analysis tools with
  `must-be-at-least-version-XYZ`, so cache-buster bumps stop breaking CI.
- **All 25 `tools/check-*.js`** pass on the new state.

## Files touched

```
docs/superpowers/specs/test-spec-master.md (NEW)
docs/superpowers/specs/2026-04-25-spine-feature-batch-changelog.md (NEW, this file)
tools/test-spec-runner.js (NEW)
tools/lib/version-floor.js (NEW)
tools/check-mesh-debug-instrumentation.js
tools/check-slot-mesh-contour-editing.js
tools/check-ai-capture-mesh.js
tools/check-ai-capture-raw-input.js
tools/check-ai-capture-registry.js
tools/check-ai-capture-summary-report.js
app/render/weight-brush.js (NEW)
app/render/weight-heatmap-gpu.js (NEW)
app/render/gl-toolkit.js (NEW)
app/render/constraints.js
app/render/canvas.js
app/core/runtime.js
app/core/bones.js
app/animation/model.js
app/io/tree-bindings.js
app/io/project-export.js
app/io/project-actions.js
app/workspace/workspace.js
app/workspace/slots.js
app/ui/hotkeys.js
app/ui/bootstrap.js
app/ui/editor-panels.js
app/ui/constraint-panels.js
index.html
styles.css
```

## What's next (parked, not in this batch)

Critical gaps still missing — see `test-spec-master.md` Coverage gaps section C:

1. Physics constraints (Spine 4.2)
2. Spine project import
3. Sequence frame-index timeline runtime
4. Skin scope: skin bones + folders
5. Audio events preview / waveform on timeline
6. Ghosting feature breadth (motion vectors, key-frame ghosts, anchor mode)
7. Pose-tool compensation modes
8. Mesh "Generate" vertex tool

These are all sized M / L and were skipped in this sprint to keep risk
contained. The test spec is the source of truth for what's still pending.
