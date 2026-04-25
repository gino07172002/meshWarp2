---
name: 2026-04-25-spine-feature-batch-3
description: Third-batch changelog. Skin runtime visibility filtering, ghosting breadth, mesh Generate, bone compensation, plus the bone-length-lock fix in Animate mode that the user reported.
type: changelog
status: shipped
date: 2026-04-25
---

# Spine Feature Batch 3 — 2026-04-25 (evening)

Continues from `2026-04-25-spine-feature-batch-2-changelog.md`. Five
commits pushed today (evening session) covering the remaining Critical
and Important Spine gaps that were sized M and self-contained.

## Bug fix the user found
- **Bone length stayed editable in Animate mode** when it shouldn't —
  Blender and Spine both lock length once you're animating because vertices
  are bound in the bone's local frame. Fixed in two places:
  - [`canEditLengthInCurrentMode`](app/render/canvas.js) now consults
    `getCurrentSystemMode()` so Animate + Object workspace also locks length
    (previously only `boneMode === "pose"` was checked).
  - The right-Properties Bone Length numeric input has the same gate. The
    field snaps back to the current length when blocked.
  - Per-bone "Pose Length: Allow" still opts in to length editing.

## Skin runtime visibility filtering
Previous batch added `skin.bones[]` data + UI persistence; this batch wires
runtime behaviour:
- New `isBoneHiddenBySkin(m, boneIndex)` walks parent chain like the existing
  hide helpers; bone is hidden when SOME skin owns it but the active skin
  doesn't.
- `isBoneVisibleInWorkspace` and `isSlotHiddenByBoneVisibility` consult it
  → bone-tree rows, canvas bone draw, slot rendering all respect the skin.
- `applySkinSetToSlots` always re-renders after apply (previously only when
  attachment map changed).
- Bone-tree row gets a new `bone-hidden-skin` class with a small ·skin·
  marker (purple, italic) so users can tell why a bone faded out vs the
  existing work-hide opacity.

## Ghosting breadth (onion skin)
- **Keys-only mode**: `keyFramesOnly` flag on onionSkin settings. New
  `getOnionSkinFrameOffsets(anim)` filters offsets to those that hit a key
  on any track at the project's time step. Lets animators preview only
  posed frames, not interpolated ones.
- **Pixels-per-frame X/Y**: `pxPerFrameX/Y` shifts each ghost frame for
  in-place walk-cycle preview. Each ghost translates by `(offset *
  pxPerFrame)` during draw.
- UI: 3 new mini-controls in the Onion Opt popover (Keys only checkbox,
  +X numeric, +Y numeric).

## Mesh "Generate Vertices"
Spine's Generate auto-densifies a mesh where deformation needs it.
First-pass heuristic shipped: iteratively split any triangle whose area
exceeds `(areaRatio × bbox area)` (default 1.5%) by inserting a centroid
point and re-triangulating. Stops when all triangles are under threshold
or maxIters (8).
- `generateMeshVerticesByArea(slot, opts)` in slots.js, sibling of the
  existing Subdivide / Add Centroid / Flip Edge tools.
- UI: Mesh tab → Topology → Advanced → "Generate Vertices" button + Area
  Ratio numeric input.

## Bone Compensation
Spine lets users reposition a parent bone in Edit mode without dragging
children visually with it. New behaviour:
- `state.boneCompensation` toggle (Setup tab → "Bone Compensation"
  checkbox, default off).
- New `applyBoneCompensationAfterEdit(bones, snapshot, draggedIndex)` BFS-
  walks the dragged bone's subtree and rewrites each descendant's local
  transform so its world head/tip match the drag-start snapshot.
- Drag-start sites in `hotkeys.js` capture the snapshot when the toggle is
  on; bone_joint / bone_tip pointermove handlers apply compensation
  alongside the existing connected-tip preservation.

## Test infrastructure progress
- 73 recipes total now (up from 60 at the start of the day, 45 a session ago).
- All 25 static-analysis check tools still green.
- `test-spec-runner.js --validate` passes.
- Pointer DSL added in batch-2 unlocks recipes that need canvas drag emulation.

## Files touched (this batch)
```
app/animation/model.js
app/core/bones.js
app/core/runtime.js
app/render/canvas.js
app/ui/animation-panels.js
app/ui/bootstrap.js
app/ui/constraint-panels.js
app/ui/editor-panels.js
app/ui/hotkeys.js
app/workspace/slots.js
docs/superpowers/specs/test-spec-master.md
docs/superpowers/specs/2026-04-25-spine-feature-batch-3-changelog.md (NEW, this file)
index.html
styles.css
.gitignore  (now also excludes warrior_*/, *.webm, *.png demo outputs)
```

## What's still parked (test-spec-master.md Coverage gaps section C)

| Gap | Why parked |
|---|---|
| Physics constraints (Spine 4.2) | L — new constraint solver + per-frame integration loop. Big refactor. |
| Spine project import | L — new IO surface for .json/.skel/.atlas. |
| Atlas advanced packing | L — multi-page, rotation, trim, padding, bleed. Out of scope for this push. |
| Pose-tool numeric ops + axes | M — coupled to property panel; needs careful UX. |
| Audio waveform on timeline | M — playback works (batch-2); waveform visualisation needs new render path. |

## Repo log
```
git log --oneline -10
4f375da Bone Compensation toggle (Spine equivalent)
1427f2c Mesh "Generate Vertices" — auto-densify large triangles
4f5e443 Onion-skin breadth: keyframes-only + pixels-per-frame
3838470 Skin-scoped bone visibility filtering at render time
e61c2d1 Remove accidentally committed warrior_* demo outputs
84d6ef9 Lock bone length in Animate mode (Spine 2D / Blender semantics)
e5f01b9 Document batch-2 changelog
6534cd0 Bone color in tree row, audio/volume/balance fields on event drafts
2287f6a Skin scope: skin-level bones + folder fields
8d7e5ff Browser test runner pointer DSL + audio event preview
```
