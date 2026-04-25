---
name: master-test-spec
description: Machine-readable test recipes for every implemented Spine-equivalent feature. Designed to be consumed by an AI agent that drives the editor (browser/headless) and verifies outcomes.
type: spec
status: living
last_updated: 2026-04-25
---

# Master Test Spec — Spine-equivalent Features

Each entry follows this schema. AI agents consuming this file should be able to pick any single recipe and execute it.

```
### <feature_id>
- **summary**: one-line description
- **impl**: source file(s):line(s) of the main implementation
- **ui_path**: where in the UI the feature lives (panel → section)
- **prereqs**: ordered list of state needed before steps run
- **steps**: numbered ordered actions (DOM clicks / inputs / hotkeys / state mutations)
- **verify**: list of assertions; each is `{kind, target, expected}`
- **cleanup**: optional teardown
- **manual_only**: optional flag set when the test cannot yet be automated
```

`verify.kind` is one of:
- `dom_text` — element textContent matches expected
- `dom_class` — element has expected class
- `dom_attr` — element attribute equals expected
- `dom_exists` — element exists and is visible
- `state_path` — `state.foo.bar` equals expected
- `function_returns` — calling `globalFn(args)` returns expected
- `array_length` — `state.foo.bar.length` equals expected
- `console_no_error` — no error logged during the steps
- `visual_*` — manual visual check (still requires human or screenshot diff agent)

Steps use:
- `click:#elemId` — click element by id
- `set_value:#elemId=VALUE` — set input value + dispatch input event
- `set_checked:#elemId=BOOL` — set checkbox + dispatch change
- `select_option:#elemId=VALUE` — set select value + dispatch change
- `key:HOTKEY` — dispatch keydown (e.g. `key:w`, `key:ctrl+c`)
- `wait:Nms` — wait for N milliseconds
- `call:globalFn(args)` — call a global function
- `pointer:overlay@x,y[:drag@x,y]` — pointer event on canvas overlay (single-click or click+drag)

---

## Foundation / Shell

### shell-fullscreen-button
- **summary**: F11 button toggles browser fullscreen and updates icon.
- **impl**: app/ui/bootstrap.js setupFullscreenButton; app/ui/hotkeys.js F11 handler
- **ui_path**: top-bar right edge `#fullscreenBtn`
- **prereqs**: app loaded
- **steps**:
  1. `click:#fullscreenBtn`
  2. `wait:200`
- **verify**:
  - `dom_attr` `body[data-fullscreen]` == `"true"`
  - `dom_text` `#fullscreenBtn` == `"⛌"`
- **cleanup**: `key:F11`
- **manual_only**: true (Fullscreen API requires user gesture; headless typically blocks)

### shell-overlay-canvas-exists
- **summary**: GL overlay canvas (#glOverlayCanvas) is sized to match main GL canvas.
- **impl**: app/render/gl-toolkit.js syncOverlayCanvasSize; index.html canvas tag
- **prereqs**: app loaded
- **verify**:
  - `dom_exists` `#glOverlayCanvas`
  - `function_returns` `(()=>{const a=document.getElementById('glCanvas');const b=document.getElementById('glOverlayCanvas');return a.width===b.width && a.height===b.height;})()` == `true`

---

## Mesh editing

### mesh-edit-target-toggle
- **summary**: Boundary / Grid edit target buttons toggle correctly.
- **impl**: app/workspace/slots.js setSlotMeshEditTarget; app/ui/constraint-panels.js bindings
- **ui_path**: Mesh tab → Edit Target section
- **prereqs**: load image, create slot with mesh
- **steps**:
  1. `click:#slotMeshGridEditBtn`
- **verify**:
  - `state_path` `state.slotMesh.editTarget` == `"grid"`
  - `dom_text` `#slotMeshEditTargetHint` contains `"Grid"`

### mesh-tool-mode-add-vertex
- **summary**: V toggles Select ↔ Add Vertex tool.
- **impl**: app/ui/hotkeys.js (mesh-edit V handler)
- **prereqs**: mesh edit tab active
- **steps**:
  1. `key:v`
- **verify**:
  - `state_path` `state.slotMesh.toolMode` in `["add","select"]` (toggled from previous)

### mesh-auto-foreground
- **summary**: Auto Foreground generates contour from image alpha; Advanced params control output.
- **impl**: app/workspace/slots.js buildAutoForegroundContourForSlot; UI #slotMeshAutoForegroundBtn
- **ui_path**: Mesh tab → Generate
- **prereqs**: image loaded, slot active with non-empty canvas
- **steps**:
  1. `click:#slotMeshAutoForegroundBtn`
- **verify**:
  - `function_returns` `(()=>{const s=getActiveSlot();const c=s&&ensureSlotContour(s);return Array.isArray(c.points)&&c.points.length>=3;})()` == `true`
  - `dom_text` `#status` contains `"Auto Foreground"`

### mesh-auto-foreground-params
- **summary**: Alpha threshold / padding / detail controls affect output point count.
- **impl**: app/workspace/slots.js opts param
- **ui_path**: Mesh tab → Generate → Advanced
- **prereqs**: same as above
- **steps**:
  1. `set_value:#autoFgAlphaThreshold=8`
  2. `set_value:#autoFgPadding=0`
  3. `set_value:#autoFgDetail=0.5`
  4. `click:#slotMeshAutoForegroundBtn`
  5. record contour length as L1
  6. `set_value:#autoFgDetail=4`
  7. `click:#slotMeshAutoForegroundBtn`
  8. record contour length as L2
- **verify**:
  - `function_returns` `L2 > L1` == `true` (higher detail → more points)

### mesh-reset-to-grid
- **summary**: Reset To Grid replaces contour with a 4-corner rect.
- **impl**: app/workspace/slots.js resetSlotMeshToGrid
- **ui_path**: Mesh tab → Generate
- **steps**:
  1. `click:#slotMeshResetBtn`
- **verify**:
  - `function_returns` `(()=>{const c=ensureSlotContour(getActiveSlot());return c.points.length===4;})()` == `true`

### mesh-vertex-pin-unpin
- **summary**: P pins selected vertices; U unpins all.
- **impl**: app/ui/hotkeys.js (mesh editMode P/U)
- **prereqs**: mesh with selected vertices
- **steps**:
  1. select a vertex
  2. `key:p`
  3. `key:u`
- **verify**:
  - after step 2: pinned set has 1 vertex
  - after step 3: pinned set is empty

### mesh-relax
- **summary**: M relaxes selected vertices toward neighbour average.
- **impl**: app/core/runtime.js relaxSelectedVertices
- **prereqs**: mesh with deformed selected vertex
- **steps**:
  1. note vertex offset
  2. `key:m`
- **verify**:
  - `state_path` vertex offset magnitude smaller than before

### mesh-delete-vertex
- **summary**: Del / X removes selected vertex from contour.
- **impl**: app/ui/hotkeys.js (slot-mesh edit X/Delete)
- **prereqs**: mesh with selected vertex
- **steps**:
  1. record `vCount` before
  2. `key:Delete`
- **verify**:
  - `vCountAfter === vCountBefore - 1`

---

## Weight tools

### weight-auto-multi-bone
- **summary**: Auto Weight (Multi Bone) creates weighted bind on active slot.
- **impl**: app/core/bones.js autoWeightActiveSlot("weighted")
- **ui_path**: Setup tab → Auto Weight
- **prereqs**: bones rigged, slot with mesh
- **steps**:
  1. `click:#setupAutoWeightMultiBtn`
- **verify**:
  - `function_returns` `(getActiveAttachment(getActiveSlot()).meshData.weights.length > 0)` == `true`
  - `state_path` `state.weightMode` == `"smooth"` (or weightMode UI matches "soft"/"smooth")

### weight-overlay-quick-toggle
- **summary**: Mesh tab top-right pill toggles Weight Overlay.
- **impl**: app/ui/bootstrap.js setupWeightOverlayQuickToggle
- **ui_path**: Mesh tab top
- **steps**:
  1. `click:#weightOverlayQuickBtn`
- **verify**:
  - `state_path` `state.vertexDeform.weightViz` == `true`
  - `dom_class` `#weightOverlayQuickBtn` has `"active"`
  - `dom_text` `#weightOverlayQuickBtn .mesh-quick-label` contains `"ON"`

### weight-brush-toggle-W
- **summary**: W toggles brush; auto-enables overlay when first turned on.
- **impl**: app/render/weight-brush.js setWeightBrushActive; app/ui/hotkeys.js W
- **prereqs**: mesh mode, weighted bind
- **steps**:
  1. record `vertexDeform.weightViz` before as B
  2. `key:w`
- **verify**:
  - `state_path` `state.weightBrush.active` == `true`
  - `state_path` `state.vertexDeform.weightViz` == `true`
  - `dom_attr` `body[data-weight-brush]` == `"on"`
- **cleanup**: `key:w`

### weight-brush-modes
- **summary**: Add/Remove/Replace/Smooth buttons set mode and recolor cursor.
- **impl**: app/render/weight-brush.js setWeightBrushMode
- **ui_path**: Mesh tab → Weight Paint
- **steps** (for each mode in [add, remove, replace, smooth]):
  1. ensure brush on
  2. `click:#weightBrush<MODE>Btn`
- **verify**:
  - `state_path` `state.weightBrush.mode` == mode

### weight-brush-stroke
- **summary**: Dragging on canvas with brush ON modifies weights of selected bone.
- **impl**: app/render/weight-brush.js applyWeightBrushStrokeAt; app/ui/hotkeys.js pointerdown intercept
- **prereqs**: brush on, weighted bind, a bone selected
- **steps**:
  1. record `attachment.meshData.weights[v*boneCount+selectedBone]` for some vertex `v` near canvas centre
  2. `pointer:overlay@cx,cy:drag@cx+50,cy`
- **verify**:
  - `function_returns` `weightsAfter !== weightsBefore` == `true`
  - undo stack pushed (history.undo length increased)

### weight-bone-lock
- **summary**: Brush bone-lock toggle prevents weld/swap/brush from modifying that bone's weights.
- **impl**: app/render/weight-brush.js toggleBrushBoneLock; renormalize respects lockedBones
- **prereqs**: brush on, root bone in tree
- **steps**:
  1. find a bone tree row with `[data-bone-lock-toggle]`
  2. click that lock button
- **verify**:
  - `array_length` `state.weightBrush.lockedBones` == `1`
  - `dom_class` lock button has `"active"`

### weight-copy-paste
- **summary**: Ctrl+C copies vertex weights, Ctrl+V pastes to selected verts.
- **impl**: app/core/bones.js copy/pasteVertexWeightsFromClipboard; hotkeys.js Ctrl+C/V mesh path
- **prereqs**: mesh weighted, in mesh mode, two vertices with different weights
- **steps**:
  1. select vertex A
  2. `key:ctrl+c`
  3. select vertex B
  4. `key:ctrl+v`
- **verify**:
  - vertex B's weight row equals vertex A's weight row (sample first/last bone)

### weight-prune
- **summary**: Prune Apply zeros weights below threshold and renormalises.
- **impl**: app/core/bones.js pruneVertexWeights
- **ui_path**: Mesh tab → Weights → Prune
- **prereqs**: weighted bind with some small weights present
- **steps**:
  1. `set_value:#weightPruneThreshold=0.1`
  2. `click:#weightPrunePreviewBtn`
  3. record dropped count from `#weightPrunePreview`
  4. `click:#weightPruneApplyBtn`
- **verify**:
  - count weights below 0.1 in `meshData.weights` after — should be 0
  - `dom_text` `#weightPrunePreview` contains `"Applied"`

### weight-weld
- **summary**: Weld merges From bone's weights into To bone, From goes to 0.
- **impl**: app/core/bones.js weldBoneWeights
- **ui_path**: Mesh tab → Weights → Weld / Swap
- **prereqs**: weighted bind, ≥2 bones
- **steps**:
  1. `select_option:#weightWeldFromBone=0`
  2. `select_option:#weightWeldToBone=1`
  3. record sum of weights for bone 0 across all verts (should be > 0)
  4. `click:#weightWeldApplyBtn`
- **verify**:
  - sum of weights for bone 0 after == 0
  - sum of weights for bone 1 after == sum_before(bone0) + sum_before(bone1)

### weight-swap
- **summary**: Swap exchanges two bones' weight columns.
- **impl**: app/core/bones.js swapBoneWeights
- **steps**:
  1. record bone-0 row and bone-1 row for vertex 0
  2. `click:#weightSwapApplyBtn`
- **verify**:
  - bone-0 row vertex 0 == old bone-1 row
  - bone-1 row vertex 0 == old bone-0 row

### weight-update-bindings
- **summary**: Update Bindings rebakes positions to current pose; visual unchanged, invBind reset.
- **impl**: app/core/bones.js applyUpdateBindings
- **ui_path**: Setup tab → Auto Weight → Update Bindings
- **prereqs**: weighted bind, bone moved from rest
- **steps**:
  1. record `meshData.deformedScreen` snapshot (sample 4 verts)
  2. `click:#setupUpdateBindingsBtn`
  3. record again post-action
- **verify**:
  - sampled screen positions ≈ unchanged (within 1px)
  - `m.invBind` array updated (compare to old by reference)

---

## Linked mesh

### linkedmesh-create
- **summary**: Linked mesh attachment created from sibling resolves source.
- **impl**: app/workspace/slots.js resolveLinkedMeshSource
- **prereqs**: two slots, slot A has mesh, slot B has linkedmesh attachment with linkedParent set
- **verify**:
  - `function_returns` `(resolveLinkedMeshSource(slotB, attB) !== null)` == `true`

### linkedmesh-inherit-timelines-on
- **summary**: When inheritTimelines=true, deform key on source plays on linked target.
- **impl**: app/animation/model.js mesh deform track loop
- **prereqs**: source has deform key at t=0.5; linked mesh has inheritTimelines=true
- **steps**:
  1. set animation time to 0.5
  2. trigger sample
- **verify**:
  - linked mesh's slot offsets ≈ source's offsets (vector compare)

### linkedmesh-inherit-timelines-off
- **summary**: When inheritTimelines=false, linked mesh has independent zero offsets.
- **impl**: app/animation/model.js mesh deform track inheritance loop
- **steps**:
  1. set inheritTimelines=false
  2. set animation time to 0.5 (source has key)
- **verify**:
  - linked mesh's slot offsets are zero (no own keys)

---

## Bone tree

### tree-row-types-have-color-bar
- **summary**: Bone / Slot / Attachment rows have left color bar via type variant.
- **impl**: app/core/bones.js renderBoneTree; styles.css `.tree-item::before`
- **verify**:
  - first bone row's `::before` background-color matches `--tree-type-color-bone`
  - first slot row's matches `--tree-type-color-slot`
  - first attachment row's matches `--tree-type-color-attachment`

### tree-icon-prefix-attachment-type
- **summary**: Attachment row shows type icon glyph (□◇◈▭✂•).
- **impl**: app/core/bones.js iconMap
- **verify**:
  - `dom_text` `.tree-attachment .tree-type-icon-attachment` is one of `["□","◇","◈","▭","✂","•"]`

### tree-context-menu-attachment-ops
- **summary**: Right-click on attachment row exposes Add/Duplicate/Rename/Delete/Set Active/Copy.
- **impl**: app/io/tree-bindings.js contextmenu handler
- **prereqs**: tree shows ≥1 attachment
- **steps**:
  1. right-click first `.tree-attachment` row
- **verify**:
  - `#boneTreeContextMenu` not collapsed
  - `#treeCtxAttachmentRenameBtn` visible (hidden==false)

### tree-hover-quick-add-attachment
- **summary**: Hovering slot row shows `+` button that adds an attachment.
- **impl**: app/core/bones.js renderBoneTree; addAttachmentToActiveSlot
- **prereqs**: slot row visible
- **steps**:
  1. hover slot row (DOM hover sim)
  2. click `[data-slot-add-attachment]` button
- **verify**:
  - attachment count increased by 1

---

## Skin

### skin-capture-apply
- **summary**: Capture current state to skin, change attachments, Apply restores.
- **impl**: app/workspace/slots.js skin capture / apply
- **steps**:
  1. record active attachment of slot 0
  2. `click:#skinCaptureBtn`
  3. switch slot 0 to a different attachment
  4. `click:#skinApplyBtn`
- **verify**:
  - active attachment of slot 0 == originally captured

---

## Animation

### anim-deform-key-add
- **summary**: I adds keyframe for current pose at current time.
- **impl**: app/ui/hotkeys.js key handler; app/animation/model.js
- **prereqs**: animate mode, mesh selected, deform offset present
- **steps**:
  1. `key:i`
- **verify**:
  - keys length on the active deform track increased

### anim-onion-skin-toggle
- **summary**: Onion skin toggle shows ghosted previous frames.
- **impl**: app/animation/model.js / state.anim.onionSkin
- **manual_only**: true

### anim-bezier-interp
- **summary**: Curve editor changes a key's curve attribute.
- **impl**: app/animation/timeline-ui.js
- **manual_only**: true

---

## Export

### export-spine-json-linkedmesh-deform-flag
- **summary**: Spine JSON `deform: true/false` follows the inheritTimelines flag.
- **impl**: app/io/project-export.js (linkedmesh export branch)
- **prereqs**: project with linkedmesh attachment
- **steps**:
  1. set linked attachment `inheritTimelines = true`
  2. trigger Spine JSON export, capture output
  3. set `inheritTimelines = false`
  4. export again
- **verify**:
  - first export's linked mesh has `"deform": true`
  - second export's linked mesh has `"deform": false`

### export-spine-binary
- **summary**: .skel binary export emits non-empty buffer.
- **impl**: app/io/project-export.js exportSpineSkelBinary
- **steps**:
  1. trigger binary export
- **verify**:
  - returned ArrayBuffer length > 100

---

## Bone color (editor visualisation)

### bone-color-set
- **summary**: Setting a bone color tints the bone shape on canvas (no runtime effect).
- **impl**: app/core/bones.js (b.color field); app/render/constraints.js userBoneTint branch
- **ui_path**: Right Properties → Selected Bone → Bone Color
- **prereqs**: ≥1 bone, edit mode
- **steps**:
  1. select bone 0
  2. `set_value:#boneColor=#ff8800`
- **verify**:
  - `state_path` `state.mesh.rigBones[0].color` == `"#ff8800"`
  - `dom_class` `#boneColor` has `"color-active"`

### bone-color-clear
- **summary**: × button clears the bone color.
- **impl**: app/ui/constraint-panels.js boneColorClearBtn handler
- **steps**:
  1. set color to a value
  2. `click:#boneColorClearBtn`
- **verify**:
  - `state_path` `state.mesh.rigBones[0].color` == `""`

### bone-color-persists
- **summary**: Bone color survives save/load via cloneBones spread.
- **impl**: app/core/bones.js cloneBones uses {...b}
- **steps**:
  1. set bone color
  2. trigger autosave snapshot
  3. clear in-memory state
  4. restore snapshot
- **verify**:
  - bone color value preserved after restore
- **manual_only**: false (state-mutating)

## Slot color / two-color tint

### slot-light-color-tint
- **summary**: Slot light color (r,g,b,a) modulates rendered texture.
- **impl**: app/render/canvas.js (uTint uniform); fragment shader in app/core/runtime.js
- **prereqs**: slot with visible attachment
- **steps**:
  1. set `slot.r=1, slot.g=0, slot.b=0` (red tint)
  2. trigger render
- **verify**:
  - `function_returns` `glToolkit.main()._programs` not necessary; main shader has uTint
  - manual visual: rendered slot looks red
- **manual_only**: true (visual)

### slot-two-color-dark-tint
- **summary**: Slot dark color is composited into "shadow" channel via two-color shader.
- **impl**: app/render/canvas.js (uDark uniform binding); fragment shader (added 2026-04-25)
- **prereqs**: slot with attachment, darkEnabled=true, dark="800000"
- **steps**:
  1. `set_checked:#slotDarkEnabled=true`
  2. set slot.dark to "800000" via colour input
  3. trigger render
- **verify**:
  - per-pixel test (manual / screenshot diff): dark areas of texture (low rgb, high alpha) get tinted toward red
  - shader uniform `uDark` set to (0.5, 0, 0)
- **manual_only**: true (visual / screenshot diff)

### slot-dark-default-zero
- **summary**: When darkEnabled=false, uDark is forced to (0,0,0) so render matches original single-color path.
- **impl**: app/render/canvas.js darkEnabled branch
- **prereqs**: any slot
- **verify**:
  - with darkEnabled=false, render output identical to pre-2026-04-25 baseline (regression guard)
- **manual_only**: true

## Mesh visualization (GPU)

### gpu-weight-heatmap-program-compiles
- **summary**: weight-heatmap-v1 program compiles on overlay context.
- **impl**: app/render/weight-heatmap-gpu.js
- **prereqs**: weighted mesh, overlay on
- **verify**:
  - `function_returns` `glToolkit.overlay()._programs.has("weight-heatmap-v1")` == `true` after first render

### gpu-overlay-clears-on-mode-leave
- **summary**: Leaving mesh mode clears the overlay GL canvas.
- **impl**: app/render/constraints.js clear branch
- **steps**:
  1. enter mesh mode + weight overlay on
  2. switch to skeleton mode
- **verify**:
  - manual visual: heatmap gone (or check `gl.RGBA` pixel = 0,0,0,0 via readPixels)

---

## Tree stability during edits (regression guards)

### tree-stable-during-bone-edit-drag
- **summary**: Dragging a bone head/tail in Edit mode must NOT cause weighted slots to jump between bones in the tree mid-drag.
- **impl**: app/core/bones.js commitRigEditPreserveCurrentLook (drag guard); app/ui/bootstrap.js clearDrag (final rebuild)
- **prereqs**: 3 bones, 1 slot weighted across them, all visible in the bone tree
- **steps**:
  1. capture the slot's tree parent bone index (call `getSlotTreeBoneIndex(slot, mesh)`)
  2. start dragging bone head/tail (`pointer:overlay@x,y`)
  3. during drag at 5 intermediate positions: `pointer:overlay@x+10*i, y` and call `getSlotTreeBoneIndex` again — record values
  4. finish drag
  5. capture again post-drag
- **verify**:
  - all values during drag are equal (no flicker)
  - post-drag may differ if topology change is significant — that's OK
  - no console error about reweighting
- **manual_only**: false (drives pointer events on overlay)

## Hotkeys (Blender-style A semantics)

### hotkey-A-selects-all
- **summary**: A toggles select-all in the active editing context.
- **impl**: app/ui/hotkeys.js (mesh `a`, skeleton `a`)
- **prereqs**: at least 2 vertices (or bones)
- **steps**:
  1. `key:a`
- **verify**:
  - vertex selection size == vCount (or bone selection == bones.length)

### hotkey-A-does-not-add-attachment
- **summary**: A no longer triggers Add Attachment dialog.
- **impl**: removed from app/ui/hotkeys.js
- **steps**:
  1. ensure no attachment-type-picker visible
  2. `key:a`
  3. `wait:200`
- **verify**:
  - `dom_class` `#attTypePickerPanel` does NOT have visible state

---

# Static-analysis test tools (already exist)

These are node scripts that lint source structure. AI agent should run these in addition to functional tests:

```
node tools/check-cache-busting-assets.js
node tools/check-dock-layout-runtime.js
node tools/check-dock-layout-shell.js
node tools/check-edit-bone-endpoint-drag.js
node tools/check-edit-bone-joint-tip-preservation.js
node tools/check-import-default-mesh.js
node tools/check-legacy-project-upgrade.js
node tools/check-legacy-slot-mesh.js
node tools/check-linkedmesh-parent-and-ghosts.js
node tools/check-mesh-debug-instrumentation.js
node tools/check-region-attachment-render-path.js
node tools/check-slot-mesh-contour-editing.js
node tools/check-slot-mesh-grid-interaction.js
node tools/check-slot-mesh-grid-live-edit.js
node tools/check-slot-mesh-grid-rendering.js
node tools/check-weight-heatmap-render-path.js
node tools/check-ai-capture-mesh.js
node tools/check-ai-capture-raw-input.js
node tools/check-ai-capture-registry.js
node tools/check-ai-capture-summary-report.js
```

A green run = build is structurally sound but does NOT guarantee functional correctness. Functional tests above are the source of truth for end-user behaviour.

---

# Coverage gaps

## A. Implemented but no functional test spec yet
- IK / Transform / Path constraints behaviour (UI exists, no functional spec)
- State machine transitions
- Animation layers blend math
- Multi-slot draworder timeline keys
- Skin folders / drag-reorder (partial)
- Region attachment render path (existing static-analysis check covers structure, not behaviour)

## B. Manual-only / visual-only — needs screenshot-diff agent
- Onion skin pixel-correct preview
- Bezier curve editor handles
- Two-color tint visual composite
- WebGL heatmap pixel correctness

## C. Not yet implemented (feature gaps vs Spine Pro)
Ordered Critical → Important → Niche. Add these as new specs once shipped.

| Feature | Class | Size |
|---|---|---|
| Physics constraints (Spine 4.2) | Critical | L |
| Spine project import (.json/.skel/.atlas round-trip) | Critical | L |
| Sequence attachment frame-index timeline (Hold/Once/Loop/Pingpong) | Critical | M |
| Skin scope: skin bones + skin folders | Critical | M |
| Audio events preview / waveform on timeline | Important | M |
| Ghosting feature breadth (motion vectors, key-frame ghosts, anchor mode, per-bone filter) | Important | M |
| Pose-tool compensation modes (Image/Bone) + relative numeric ops | Important | M |
| Mesh "Generate" vertex tool (auto-place verts where deformation needs them) | Important | M |
| Two-color tint runtime parity (data exports; runtime visual unverified) | Important | S–M |
| Drag-reorder coverage audit across slots/draw-order/animations/events | Important | S–M |
| Bone color (editor-only visual aid) | Niche | S |
| Atlas advanced packing (multi-page, rotation, trim, padding, bleed) | Niche | L |

## D. WebGL infrastructure / safety
- WebGL context lost / restored cycle: defensive `isContextLost()` guard added in app/render/canvas.js, but full main-render program rebuild path not implemented yet — add when Phase 2 (GPU skinning or batcher) is undertaken.

---

# Conventions for adding new specs

1. New feature added → append a new `### feature_id` block in the appropriate section.
2. **Always** include `impl` line pointing at primary source file:line.
3. Steps must be deterministic (no "until" loops without max attempts).
4. Each `verify` line must be unambiguous; prefer `state_path` / `function_returns` over `dom_text` when possible (DOM text is locale-sensitive).
5. If a feature genuinely cannot be auto-tested, set `manual_only: true` and skip `verify`. Document why.
6. Keep recipe atomic — one feature per recipe. Cross-feature flows go in a separate `# Integration flows` section (none yet).

---

# How a future test-runner agent should consume this

Pseudocode:

```
specs = parseTestSpecMaster(this_file)
for spec in specs:
    if spec.manual_only: continue
    setup_clean_state()
    run_prereqs(spec.prereqs)
    for step in spec.steps:
        execute_step(step)
    for v in spec.verify:
        assert_verify(v)  # raises on mismatch
    cleanup(spec.cleanup)
report_results()
```

The runner must be able to:
- Inject scripts into the loaded page (Playwright / Puppeteer / WebDriver style)
- Read `state.*` global
- Call any global `function_*` exposed on `window`
- Dispatch synthetic pointer/keyboard events on `#overlay`
- Diff a reference screenshot for `manual_only` cases (optional)
