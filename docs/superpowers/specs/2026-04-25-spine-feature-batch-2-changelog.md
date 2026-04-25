---
name: 2026-04-25-spine-feature-batch-2
description: Second-day changelog. Sequence runtime, mesh micro-tools, GL restore, browser test runner, audio events, skin scope, bone-color-in-tree.
type: changelog
status: shipped
date: 2026-04-25
---

# Spine Feature Batch 2 — 2026-04-25 (afternoon)

Builds on the earlier `2026-04-25-spine-feature-batch-changelog.md`. Five
commits pushed. See test-spec-master.md (now 61 recipes) for the testable
contracts these features expose.

## Mesh

- **Subdivide Selected Triangles** — for every triangle whose 3 vertices are
  all in the active selection, add a centroid as a new fill point and
  re-triangulate. ([slots.js subdivideSelectedTriangles](app/workspace/slots.js))
- **Add Centroid Vertex** — add 1 fill vertex at the centroid of the active
  selection. Useful for densifying low-detail areas. ([slots.js addCentroidVertex](app/workspace/slots.js))
- **Flip Edge** — with exactly 2 selected vertices forming a shared edge of 2
  triangles, swap the diagonal. Records a manual edge constraint so the new
  diagonal survives later auto-triangulation. ([slots.js flipSelectedEdge](app/workspace/slots.js))

UI lives in Mesh tab → Topology → "Advanced topology ops" disclosure.

## Sequence attachments (Spine 4.x)

- Runtime frame-index computation for **all 7 modes** (Hold / Once / Loop /
  Pingpong + Reverse variants) at the project's anim FPS.
- Multi-frame canvas storage on `att.sequence.frames` (HTMLCanvasElement[]).
- "Load Frames…" multi-file picker in the Sequence sub-section. Files are
  sorted by name to keep frame order predictable.
- Save/load round-trips the frames via `slotImages` dataURL indices
  (`sequence.frameImageIndices`).
- Render path uses `getEffectiveAttachmentCanvas(att, time)` which picks the
  right frame; non-sequence attachments fall through to `att.canvas`
  unchanged.

## WebGL infrastructure

- **Main render context-restore rebuild path**. The shader program / VBO /
  IBO / VAO init is now wrapped in `initMainGLResources()` +
  `finishMainGLSetup()`. After `webglcontextlost` → `webglcontextrestored`
  the toolkit's listener calls `rebuildMainGLAfterRestore()`, which rebuilds
  resources and resets the texture cache. Previously the main canvas would
  stay black until reload.

## Audio events

- Timeline events now carry **audio / volume / balance** fields. Pre-existing
  data path was export-only; the runtime side previewed nothing.
- `emitTimelineEventsBetween` now calls `playTimelineEventAudio(detail)` for
  events with audio when `phase === "play"`. Lazy `HTMLAudioElement` cache
  per audio path. StereoPannerNode wired when balance ≠ 0.
- Event side panel grid gets 3 new fields (audio path / volume / balance) so
  users can attach audio without hand-editing the project JSON.
- Caveat: first play of any audio path may show the browser's "user gesture
  required" warning silently. Subsequent plays after any user click work.

## Skin scope

- New `skin.bones: number[]` (bone indices owned by this skin) and
  `skin.folder: string` (display folder for organising skins) fields.
  Normalised in `ensureSkinSets`.
- Skin tab gets a "Skin scope (bones / folder)" advanced disclosure.
- Folder text input persists immediately.
- Bone list shows current skin-scoped bones; "+ Selected Bone" adds the
  currently selected bone (from the bone tree) to the skin's list. "Remove
  Bone" pops the last; clicking a row removes that specific bone.
- **Runtime visibility filtering NOT yet wired** — bones in the list still
  render even when their skin isn't applied. That requires render-pipeline
  coordination and is deferred. Data + UI persistence are complete.

## Bone color in tree

- The bone color field added in the previous batch (data only) now drives
  the **left type colour bar** of bone rows in the bone tree, by setting
  `--tree-type-color-bone` inline on the row element.

## Test infrastructure (the priority you flagged)

- **`tools/test-runner-browser.js`** — browser-side runner that consumes the
  recipe JSON produced by `tools/test-spec-runner.js`. Step DSL: `click`,
  `set_value`, `set_checked`, `select_option`, `key`, `wait`, `call`, plus
  the new `pointer:overlay@x,y[:drag@x2,y2]` for canvas drag emulation.
  Verify DSL: `state_path`, `function_returns`, `dom_text`, `dom_class`,
  `dom_attr`, `dom_exists`, `array_length`, with `==` and `contains` ops.
- **`docs/superpowers/runbooks/running-tests.md`** — runbook covering how to
  run the static-analysis tools and the browser runner together.
- 14 new test recipes added (sequence × 5, mesh-tools × 3, gl-restore × 1,
  audio × 1, skin-scope × 3, bone-color-in-tree × 1, runner self-checks ×
  2). **61 recipes total**, all validate.

## Files touched

```
app/animation/model.js
app/animation/runtime.js
app/core/bones.js
app/core/runtime.js
app/io/project-actions.js
app/io/project-export.js
app/io/tree-bindings.js
app/render/canvas.js
app/ui/bootstrap.js
app/ui/editor-panels.js
app/workspace/slots.js
docs/superpowers/runbooks/running-tests.md (NEW)
docs/superpowers/specs/2026-04-25-spine-feature-batch-2-changelog.md (NEW)
docs/superpowers/specs/test-spec-master.md
index.html
styles.css
tools/test-runner-browser.js (NEW)
```

## What's still parked (Coverage gaps section C of test-spec-master.md)

- **Physics constraints (Spine 4.2)** — L, separate runtime + integration loop
- **Spine project import (.json/.skel/.atlas)** — L, big new IO surface
- **Pose-tool compensation modes** — M, tightly coupled to existing IK/transform
  solver; deferred to keep auto-mode risk contained
- **Skin runtime visibility filtering** — coupled to render pipeline, needs
  coordinated render + transform-skipping work
- **Mesh "Generate" vertex tool** (auto-place verts at high-deformation regions)
  — needs deformation gradient analysis
- **Ghosting feature breadth** (motion vectors, key-frame-only ghosts, anchor
  mode, per-bone filter)
- **Atlas advanced packing** (multi-page, rotation, trim, padding, bleed)

## Repository state

```
git log --oneline -8
6534cd0 Bone color in tree row, audio/volume/balance fields on event drafts
2287f6a Skin scope: skin-level bones + folder fields, save/load persistence, UI list with click-to-remove
8d7e5ff Browser test runner pointer DSL + audio event preview + skin-side test recipes
bf7601e Sequence frame timeline runtime, mesh subdivide/flip-edge/centroid, WebGL context-restore rebuild, browser test runner
d5dc747 Spine feature batch: weight brush, GPU heatmap, prune/weld/swap/update bindings, two-color tint, master test spec
1931403 mesh attachment
4972429 Ignore local worktrees directory
5c29f6c Add WebGL support diagnostics design spec
```
