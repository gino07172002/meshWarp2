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

### shell-main-gl-context-restore
- **summary**: After webglcontextlost/restored, main render rebuilds shader+VBO+IBO+VAO+texture cache so the canvas is not stuck black.
- **impl**: app/core/runtime.js initMainGLResources / finishMainGLSetup / rebuildMainGLAfterRestore + glToolkit onContextRestored
- **prereqs**: app loaded with WebGL
- **steps**:
  1. dispatch `webglcontextlost` event on `#glCanvas` with preventDefault
  2. wait one tick
  3. dispatch `webglcontextrestored`
  4. wait two ticks for setTimeout-deferred rebuild + render
- **verify**:
  - rebuilt program exists (`program` global non-null)
  - no console error about lost context after step 4
- **manual_only**: true

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
- **fixture**: mesh-default
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
- **fixture**: mesh-default
- **steps**:
  1. `set_value:#autoFgAlphaThreshold=8`
  2. `set_value:#autoFgPadding=0`
  3. `set_value:#autoFgDetail=0.5`
  4. `click:#slotMeshAutoForegroundBtn`
  5. `set:L1=ensureSlotContour(getActiveSlot()).points.length`
  6. `set_value:#autoFgDetail=4`
  7. `click:#slotMeshAutoForegroundBtn`
  8. `set:L2=ensureSlotContour(getActiveSlot()).points.length`
- **verify**:
  - `function_returns` `scratch.L2 > scratch.L1` == `true` (higher detail → more points)

### mesh-reset-to-grid
- **summary**: Reset To Grid replaces contour with a 4-corner rect.
- **impl**: app/workspace/slots.js resetSlotMeshToGrid
- **ui_path**: Mesh tab → Generate
- **fixture**: mesh-default
- **steps**:
  1. `click:#slotMeshResetBtn`
- **verify**:
  - `function_returns` `(()=>{const c=ensureSlotContour(getActiveSlot());return c.points.length===4;})()` == `true`

### mesh-vertex-pin-unpin
- **summary**: P pins selected vertices; U unpins all.
- **impl**: app/ui/hotkeys.js (mesh editMode P/U)
- **prereqs**: mesh with selected vertices
- **fixture**: mesh-edit-mode
- **steps**:
  1. `call:setActiveVertexSelection([0])`
  2. `key:p`
  3. `set:pinnedAfterP=getActivePinnedVertexSet().size`
  4. `key:u`
  5. `set:pinnedAfterU=getActivePinnedVertexSet().size`
- **verify**:
  - `function_returns` `scratch.pinnedAfterP` == `1`
  - `function_returns` `scratch.pinnedAfterU` == `0`

### mesh-relax
- **summary**: M relaxes selected vertices toward neighbour average.
- **impl**: app/core/runtime.js relaxSelectedVertices
- **prereqs**: mesh with deformed selected vertex
- **fixture**: mesh-default
- **steps**:
  1. note vertex offset
  2. `key:m`
- **verify**:
  - `state_path` vertex offset magnitude smaller than before

### mesh-delete-vertex
- **summary**: Del / X removes selected vertex from contour.
- **impl**: app/ui/hotkeys.js (slot-mesh edit X/Delete)
- **prereqs**: mesh with selected vertex
- **fixture**: mesh-edit-mode
- **steps**:
  1. `call:setActiveVertexSelection([0])`
  2. `set:vCountBefore=ensureSlotContour(getActiveSlot()).points.length`
  3. `key:Delete`
- **verify**:
  - `function_returns` `ensureSlotContour(getActiveSlot()).points.length === scratch.vCountBefore - 1` == `true`

---

## Mesh micro-tools (Subdivide / Flip Edge / Add Centroid)

### mesh-subdivide-selected
- **summary**: Subdivide adds a centroid vertex inside each triangle whose 3 verts are all selected.
- **impl**: app/workspace/slots.js subdivideSelectedTriangles
- **prereqs**: a triangulated mesh with ≥1 triangle, all 3 of its verts in active selection
- **fixture**: mesh-edit-mode
- **steps**:
  1. `set:fillBefore=ensureSlotContour(getActiveSlot()).fillPoints.length`
  2. `call:(()=>{const s=getActiveSlot();const c=ensureSlotContour(s);const tri=c.triangles&&c.triangles[0]?c.triangles[0]:[0,1,2];setActiveVertexSelection(tri);})()`
  3. `click:#slotMeshSubdivideBtn`
- **verify**:
  - `function_returns` `ensureSlotContour(getActiveSlot()).fillPoints.length === scratch.fillBefore + 1` == `true`
  - `dom_text` `#status` contains `"Subdivided"`

### mesh-add-centroid
- **summary**: Add Centroid creates 1 fill vertex at the centroid of the selection.
- **impl**: app/workspace/slots.js addCentroidVertex
- **prereqs**: ≥1 vertex selected
- **fixture**: mesh-edit-mode
- **steps**:
  1. `set:fillBefore=ensureSlotContour(getActiveSlot()).fillPoints.length`
  2. `call:setActiveVertexSelection([0,1,2,3])`
  3. `click:#slotMeshAddCentroidBtn`
- **verify**:
  - `function_returns` `ensureSlotContour(getActiveSlot()).fillPoints.length === scratch.fillBefore + 1` == `true`

### mesh-generate-by-area
- **summary**: Generate Vertices iteratively splits triangles whose area exceeds (areaRatio × bounding-box area) until none remain or maxIters hit.
- **impl**: app/workspace/slots.js generateMeshVerticesByArea
- **prereqs**: a triangulated mesh with at least one triangle larger than the threshold
- **steps**:
  1. record `contour.fillPoints.length` as N
  2. `set_value:#slotMeshGenerateRatio=0.015`
  3. `click:#slotMeshGenerateBtn`
- **verify**:
  - `function_returns` `(getActiveSlot()._slotContour || ensureSlotContour(getActiveSlot())).fillPoints.length > N` == `true`
  - status text contains "Generated"
- **manual_only**: true

### mesh-flip-edge
- **summary**: Flip Edge swaps the diagonal of a quad formed by 2 triangles.
- **impl**: app/workspace/slots.js flipSelectedEdge
- **prereqs**: select exactly 2 verts forming a shared edge of 2 triangles
- **fixture**: mesh-default
- **steps**:
  1. select the 2 vertices of an internal edge
  2. `click:#slotMeshFlipEdgeBtn`
- **verify**:
  - status reports old → new edge index pair
  - the quad's diagonal switched (the original edge is no longer in any triangle)

## Weight tools

### weight-auto-multi-bone
- **summary**: Auto Weight (Multi Bone) creates weighted bind on active slot.
- **impl**: app/core/bones.js autoWeightActiveSlot("weighted")
- **ui_path**: Setup tab → Auto Weight
- **prereqs**: bones rigged, slot with mesh
- **fixture**: mesh-with-weights
- **steps**:
  1. `click:#setupAutoWeightMultiBtn`
- **verify**:
  - `function_returns` `(getActiveAttachment(getActiveSlot()).meshData.weights.length > 0)` == `true`
  - `state_path` `state.weightMode` == `"smooth"` (or weightMode UI matches "soft"/"smooth")

### weight-overlay-quick-toggle
- **summary**: Mesh tab top-right pill toggles Weight Overlay.
- **impl**: app/ui/bootstrap.js setupWeightOverlayQuickToggle
- **fixture**: mesh-default
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
- **fixture**: mesh-default
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
- **fixture**: mesh-with-bones
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
- **fixture**: mesh-with-weights
- **steps**:
  1. `set:weightsBefore=Array.from(getActiveAttachment(getActiveSlot()).meshData.weights)`
  2. `set:undoBefore=state.history.undo.length`
  3. `pointer:overlay@cx,cy:drag@cx+50,cy`
- **verify**:
  - `function_returns` `JSON.stringify(getActiveAttachment(getActiveSlot()).meshData.weights) !== JSON.stringify(scratch.weightsBefore)` == `true`
  - `function_returns` `state.history.undo.length > scratch.undoBefore` == `true`

### weight-bone-lock
- **summary**: Brush bone-lock toggle prevents weld/swap/brush from modifying that bone's weights.
- **impl**: app/render/weight-brush.js toggleBrushBoneLock; renormalize respects lockedBones
- **prereqs**: brush on, root bone in tree
- **fixture**: mesh-with-weights
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
- **fixture**: mesh-with-weights
- **steps**:
  1. `call:(()=>{state.editMode="mesh";state.leftToolTab="slotmesh";if(typeof updateWorkspaceUI==="function")updateWorkspaceUI();})()`
  2. `set:bc=getActiveAttachment(getActiveSlot()).meshData.weights.length / ensureSlotContour(getActiveSlot()).points.length`
  3. `set:rowA=Array.from(getActiveAttachment(getActiveSlot()).meshData.weights.slice(0, scratch.bc))`
  4. `call:setActiveVertexSelection([0])`
  5. `key:ctrl+c`
  6. `call:setActiveVertexSelection([Math.max(1, Math.floor(ensureSlotContour(getActiveSlot()).points.length / 2))])`
  7. `key:ctrl+v`
- **verify**:
  - `function_returns` `(()=>{const w=getActiveAttachment(getActiveSlot()).meshData.weights;const bi=Math.max(1,Math.floor(ensureSlotContour(getActiveSlot()).points.length/2));const rowB=Array.from(w.slice(bi*scratch.bc,(bi+1)*scratch.bc));return JSON.stringify(rowB)===JSON.stringify(scratch.rowA);})()` == `true`

### weight-prune
- **summary**: Prune Apply zeros weights below threshold and renormalises.
- **impl**: app/core/bones.js pruneVertexWeights
- **ui_path**: Mesh tab → Weights → Prune
- **prereqs**: weighted bind with some small weights present
- **fixture**: mesh-with-weights
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
- **fixture**: mesh-with-weights
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
- **fixture**: mesh-with-weights
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
- **fixture**: two-slots-linkedmesh
- **steps**:
  1. `set:slotB=state.slots[1]`
  2. `set:attB=getActiveAttachment(state.slots[1])`
- **verify**:
  - `function_returns` `resolveLinkedMeshSource(scratch.slotB, scratch.attB) !== null` == `true`

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

## Skin scope (Spine 4.x)

### skin-bones-add-remove
- **summary**: Skin's bones[] tracks bone indices that "belong to" the skin.
- **impl**: app/animation/model.js skin object + ensureSkinSets bones field; app/ui/editor-panels.js skinBoneAddBtn / skinBoneRemoveBtn handlers
- **prereqs**: ≥1 skin, ≥1 bone, selectedBone valid
- **steps**:
  1. set selectedBone to a valid index
  2. `click:#skinBoneAddBtn`
  3. `click:#skinBoneRemoveBtn`
- **verify**:
  - after step 2: selectedSkin.bones contains the bone index
  - after step 3: selectedSkin.bones does not contain it (or is empty)

### skin-folder-field
- **summary**: Skin folder field persists in skin.folder.
- **impl**: app/io/project-export.js (folder write); app/ui/editor-panels.js skinFolderInput handler
- **prereqs**: a skin selected
- **steps**:
  1. `set_value:#skinFolderInput=outfit/winter`
- **verify**:
  - `function_returns` `getSelectedSkinSet().folder` == `"outfit/winter"`

### skin-bones-survives-save-load
- **summary**: skin.bones round-trips through save/load.
- **impl**: app/io/project-export.js + app/animation/model.js ensureSkinSets normalisation
- **manual_only**: true

### skin-bone-hidden-when-not-active
- **summary**: A bone listed in skin A's bones[] is hidden when skin B (not owning it) is active.
- **impl**: app/core/bones.js isBoneHiddenBySkin / isBoneHiddenBySkinDirect; isBoneVisibleInWorkspace integration
- **prereqs**: ≥2 skins; skin A.bones = [3]; skin B.bones = []
- **fixture**: mesh-with-bones
- **steps**:
  1. apply skin B
  2. call `isBoneHiddenBySkin(state.mesh, 3)` 
- **verify**:
  - `function_returns` `isBoneHiddenBySkin(state.mesh, 3)` == `true`

### skin-bone-shown-when-its-skin-active
- **summary**: Same bone is visible when its owning skin is active.
- **impl**: same as above
- **prereqs**: same setup
- **steps**:
  1. apply skin A
  2. call `isBoneHiddenBySkin(state.mesh, 3)`
- **verify**:
  - `function_returns` `isBoneHiddenBySkin(state.mesh, 3)` == `false`

### skin-bone-hides-its-slots
- **summary**: A slot whose bone is skin-hidden is excluded from render via isSlotHiddenByBoneVisibility.
- **impl**: app/workspace/slots.js isSlotHiddenByBoneVisibility (skin branch)
- **prereqs**: skin A.bones contains a bone, skin B is active, a slot bound to that bone
- **verify**:
  - `function_returns` `isSlotHiddenByBoneVisibility(slotBoundToBone)` == `true`
- **manual_only**: true

### skin-bone-tree-row-marker
- **summary**: Bone-tree row of a skin-hidden bone gets the bone-hidden-skin class with ·skin· marker.
- **impl**: app/core/bones.js renderBoneTree className branch
- **prereqs**: skin A owns bone idx N, skin B applied
- **steps**:
  1. apply skin B
  2. `call:renderBoneTree()`
- **verify**:
  - the row `.tree-item[data-bone-index="N"]` has class `bone-hidden-skin`
- **manual_only**: true

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

### anim-onion-keyframes-only
- **summary**: getOnionSkinFrameOffsets respects keyFramesOnly = true and returns only offsets that match a key time on any track.
- **impl**: app/animation/model.js getOnionSkinFrameOffsets
- **prereqs**: anim with keys at frames 5 and 10; current time at frame 5; prevFrames=2, nextFrames=2
- **steps**:
  1. set onionSkin.keyFramesOnly = true
  2. call `getOnionSkinFrameOffsets(getCurrentAnimation())`
- **verify**:
  - returned offsets is `[5]` (frame 5 → 10 is +5)

### anim-onion-px-per-frame
- **summary**: pxPerFrameX shifts each ghost frame proportionally for in-place walk-cycle preview.
- **impl**: app/render/canvas.js drawOnionSkins2D (ctx.translate)
- **prereqs**: enabled onion skin, prev=2, next=2, pxPerFrameX = 16
- **manual_only**: true

### anim-bezier-interp
- **summary**: Curve editor changes a key's curve attribute.
- **impl**: app/animation/timeline-ui.js
- **manual_only**: true

### anim-event-audio-preview
- **summary**: Timeline events with an audio field play during animation playback.
- **impl**: app/animation/runtime.js emitTimelineEventsBetween + playTimelineEventAudio
- **prereqs**: animation with at least one event keyframe whose value has audio: "some/path.wav"
- **steps**:
  1. start playback (`click:#playBtn`)
  2. wait for the event time to pass
  3. inspect that an HTMLAudioElement was created and `play()` was attempted
- **verify**:
  - `function_returns` `__timelineAudioCache.has("some/path.wav")` == `true`
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

## Sequence attachments (image sequence frame timeline)

### sequence-frame-index-loop
- **summary**: Loop mode advances frame index (frame % count) over time.
- **impl**: app/workspace/slots.js computeSequenceFrameIndex (mode 2)
- **prereqs**: an attachment with sequence.enabled=true, count=4, mode=2 (loop), fps=30
- **steps**:
  1. call `computeSequenceFrameIndex({enabled:true,count:4,mode:2,setupIndex:0}, 0)` → expect 0
  2. call with t=0.034 (1 frame at 30fps) → expect 1
  3. call with t=4/30 (full cycle) → expect 0
  4. call with t=5/30 → expect 1
- **verify**:
  - all four expected values match

### sequence-frame-index-pingpong
- **summary**: Pingpong mode bounces between 0..count-1..0..count-1.
- **impl**: app/workspace/slots.js computeSequenceFrameIndex (mode 3)
- **prereqs**: count=3, mode=3 → period 4 (0,1,2,1,0,1,2,...)
- **steps**: call computeSequenceFrameIndex at frame indices 0..6
- **verify**:
  - sequence is [0,1,2,1,0,1,2]

### sequence-effective-canvas
- **summary**: getEffectiveAttachmentCanvas returns the right frame for the current time.
- **impl**: app/workspace/slots.js getEffectiveAttachmentCanvas
- **prereqs**: att.sequence.frames = [c0,c1,c2], enabled=true, mode=2
- **steps**:
  1. set anim.time so frame index === 1
  2. call getEffectiveAttachmentCanvas(att, anim.time)
- **verify**:
  - returned canvas is c1 (not c0, not att.canvas)

### sequence-load-frames-button
- **summary**: Load Frames... loads N images and stores them in att.sequence.frames.
- **impl**: app/io/tree-bindings.js #slotSequenceLoadFramesBtn handler
- **manual_only**: true

### sequence-persists-via-image-indices
- **summary**: Save → load round-trip preserves sequence frames via slotImages dataURLs.
- **impl**: app/io/project-export.js (sequence.frameImageIndices write) + app/io/project-actions.js (read)
- **prereqs**: project with attachment whose sequence has 3 loaded frames
- **steps**:
  1. trigger save → capture exported `slotImages.length` and `attachments[0].sequence.frameImageIndices`
  2. clear in-memory state, load the saved JSON
  3. inspect `att.sequence.frames.length`
- **verify**:
  - exported frameImageIndices.length === 3
  - after load, frames.length === 3 and frames[0] is a canvas

## Bone color (editor visualisation)

### bone-color-shows-in-tree
- **summary**: A bone with .color set tints its row in the bone tree (left bar).
- **impl**: app/core/bones.js renderBoneTree (sets --tree-type-color-bone inline)
- **prereqs**: ≥1 bone with color="#ff8800"
- **steps**:
  1. set `state.mesh.rigBones[0].color = "#ff8800"`
  2. `call:renderBoneTree()`
- **verify**:
  - the first `.tree-item[data-bone-index="0"]` element has `--tree-type-color-bone` set on its inline style
- **manual_only**: true

### bone-color-set
- **summary**: Setting a bone color tints the bone shape on canvas (no runtime effect).
- **impl**: app/core/bones.js (b.color field); app/render/constraints.js userBoneTint branch
- **ui_path**: Right Properties → Selected Bone → Bone Color
- **prereqs**: ≥1 bone, edit mode
- **fixture**: mesh-with-bones
- **steps**:
  1. `call:state.selectedBone=0`
  2. `set_value:#boneColor=#ff8800`
- **verify**:
  - `state_path` `state.mesh.rigBones[0].color` == `"#ff8800"`
  - `dom_class` `#boneColor` has `"color-active"`

### bone-color-clear
- **summary**: × button clears the bone color.
- **impl**: app/ui/constraint-panels.js boneColorClearBtn handler
- **fixture**: mesh-with-bones
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
- **fixture**: render-warmed
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

## Bone compensation (Spine equivalent)

### bone-compensation-toggle
- **summary**: Toggle Setup → Bone Compensation flips state.boneCompensation.
- **impl**: app/ui/editor-panels.js boneCompensationToggle handler
- **steps**:
  1. `set_checked:#boneCompensationToggle=true`
- **verify**:
  - `state_path` `state.boneCompensation` == `true`

### bone-compensation-preserves-children
- **summary**: With Bone Compensation ON, dragging a parent bone in Edit mode preserves descendants' world endpoints (within ~1px).
- **impl**: app/core/bones.js applyBoneCompensationAfterEdit
- **prereqs**: 2-bone chain (parent → connected child)
- **steps**:
  1. enable Bone Compensation
  2. record child bone's world tip position (call `getBoneWorldEndpointsFromBones(bones, childIdx).tip`)
  3. drag parent's tail handle
  4. record again
- **verify**:
  - tip_after.x ≈ tip_before.x (delta < 2px), same for y
- **manual_only**: true

## Bone length lock in animate mode

### bone-length-locked-in-animate-pose
- **summary**: In Animate workspace + Rig (pose) mode, dragging a bone tail must NOT change bone length unless the per-bone Pose Length is explicitly set to Allow.
- **impl**: app/render/canvas.js canEditLengthInCurrentMode (animate-mode branch); rotateBoneTipToLocal projects nextTip to original radius when locked
- **prereqs**: ≥1 bone, switch to Animate workspace + Rig (pose mode), default poseLenEditable = false
- **steps**:
  1. record `state.mesh.rigBones[0].length` as L0
  2. drag bone 0's tail handle far from its head
- **verify**:
  - `function_returns` `Math.abs(state.mesh.rigBones[0].length - L0) < 0.5` == `true`
- **manual_only**: true

### bone-length-locked-in-animate-object
- **summary**: Animate + Object workspace cannot change rest length via any UI surface (drag uses bone_object_move which preserves; length input is gated).
- **impl**: app/ui/constraint-panels.js boneLen input handler (animate-mode guard)
- **prereqs**: Animate workspace + Object boneMode
- **steps**:
  1. record `state.mesh.rigBones[0].length` as L0
  2. `set_value:#boneLen=999`
- **verify**:
  - `state_path` `state.mesh.rigBones[0].length` == `L0`
- **manual_only**: true

### bone-length-still-editable-in-setup
- **summary**: Setup workspace + Edit mode still allows full length edits — this is the rigging mode.
- **impl**: app/render/canvas.js canEditLengthInCurrentMode returns true when sysMode==="setup"
- **prereqs**: Setup workspace + Edit boneMode
- **steps**:
  1. drag bone 0's tail to a new position
- **verify**:
  - `state.mesh.rigBones[0].length` reflects the new tip distance
- **manual_only**: true

## Physics constraints (Spine 4.2)

### physics-add-defaults
- **summary**: Add Physics from the Physics tab creates a constraint on the currently selected bone with rotate-only channel and 100% mix/strength.
- **impl**: app/workspace/constraint-model.js addPhysicsConstraint / ensurePhysicsConstraints; app/render/constraints.js refreshPhysicsUI
- **prereqs**: ≥1 bone, Rig (or Animate) workspace, Physics tab open
- **steps**:
  1. `click:#physicsAddBtn`
- **verify**:
  - `function_returns` `state.mesh.physicsConstraints.length >= 1` == `true`
  - `function_returns` `state.mesh.physicsConstraints[0].rotate === true && state.mesh.physicsConstraints[0].mix === 1` == `true`
- **manual_only**: true

### physics-bone-rotates-toward-rest
- **summary**: With rotate=true, mix=1, damping=1, strength=100, when the bone is rotated away from rest pose, the simulator pulls it back over time.
- **impl**: app/workspace/constraint-model.js applySinglePhysicsConstraintToBones (semi-implicit Euler, rotation channel)
- **prereqs**: 1 physics constraint on bone 0, b.rot=0 at rest, simulator state seeded; Animate playing
- **steps**:
  1. set bone 0 `rot` to math.degToRad(45)
  2. tick render loop ~30 frames (call `scheduleDraw()` in a loop)
- **verify**:
  - `function_returns` `Math.abs(state.mesh.rigBones[0].rot) < math.degToRad(45)` == `true`
- **manual_only**: true

### physics-reset-state-zeroes-velocity
- **summary**: Reset State button clears each constraint's velocity & flags reset; next step re-seeds from current bone transform.
- **impl**: app/workspace/constraint-model.js resetAllPhysicsConstraintState; constraints.js Reset button handler
- **prereqs**: ≥1 physics constraint with non-zero state.vRot from prior simulation
- **steps**:
  1. `click:#physicsResetBtn`
- **verify**:
  - `function_returns` `state.mesh.physicsConstraints[0].state.reset === true` == `true`
  - `function_returns` `state.mesh.physicsConstraints[0].state.vRot === 0` == `true`
- **manual_only**: true

### physics-disabled-no-effect
- **summary**: With Enabled=Off the constraint is skipped in buildConstraintExecutionPlan, so the bone is unaffected.
- **impl**: app/workspace/constraint-model.js buildConstraintExecutionPlan (filter on enabled); app/render/constraints.js plan loop
- **prereqs**: Physics tab; one constraint on bone 0
- **steps**:
  1. `select_option:#physicsEnabled=false`
  2. set bone 0 rot to math.degToRad(45)
  3. tick render
- **verify**:
  - `function_returns` `Math.abs(state.mesh.rigBones[0].rot - math.degToRad(45)) < 0.001` == `true`
- **manual_only**: true

### physics-export-spine-json
- **summary**: Spine JSON export emits a `physics` array entry per enabled physics constraint, with the bone resolved to its name.
- **impl**: app/io/project-export.js outPhysics serialization
- **prereqs**: Physics constraint on bone "head" with rotate=true, mix=1, strength=100
- **steps**:
  1. open the Spine JSON export preview / dump (call buildSpineExportObject)
- **verify**:
  - `function_returns` `Array.isArray(buildSpineExportObject().skeleton.physics) && buildSpineExportObject().skeleton.physics.length >= 1` == `true`
  - `function_returns` `buildSpineExportObject().skeleton.physics[0].bone === "head"` == `true`
- **manual_only**: true

### physics-roundtrip-project-save-load
- **summary**: Saving and loading the project preserves all physics constraint fields and re-seeds simulator state.
- **impl**: app/io/project-export.js (physicsConstraints field); app/io/project-actions.js load handler; ensurePhysicsConstraints normalizer
- **prereqs**: 1 physics constraint with non-default mix/strength/inertia
- **steps**:
  1. dump project JSON; reset mesh; reload from the dump
- **verify**:
  - `function_returns` `state.mesh.physicsConstraints.length === 1 && state.mesh.physicsConstraints[0].state.reset === true` == `true`
- **manual_only**: true

## Action log

### action-log-captures-status
- **summary**: setStatus("...") writes a row into debug.actionLog with source "status".
- **impl**: app/core/runtime.js setStatus + app/core/debug.js recordAction
- **prereqs**: page loaded
- **steps**:
  1. `call:debug.clear()`
  2. `call:setStatus("test status row")`
- **verify**:
  - `function_returns` `(function(){ const a = window.debug.actionLog(); return a.length === 1 && a[0].source === "status" && a[0].name === "test status row"; })()` == `true`

### action-log-captures-runaicapture
- **summary**: runAICaptureCommand("foo.bar", {x:1}, …) writes a row into debug.actionLog with source "command".
- **impl**: app/core/runtime.js runAICaptureCommand hook
- **prereqs**: page loaded; an AI capture domain registered with at least one command
- **steps**:
  1. `call:debug.clear()`
  2. invoke any registered AI capture command (e.g. via timeline.add_keyframe pathway)
- **verify**:
  - `function_returns` `(function(){ const a = window.debug.actionLog(); return a.some(e => e.source === "command"); })()` == `true`
- **manual_only**: true

### action-log-text-format
- **summary**: debug.actionLogText() returns a copy-pastable string with "+0.00s [source    ] name args".
- **impl**: app/core/debug.js actionLogText
- **prereqs**: ≥1 action recorded
- **steps**:
  1. `call:debug.clear()`
  2. `call:debug.recordAction("test", "demo_action", {a: 1})`
- **verify**:
  - `function_returns` `/\[test\s*\] demo_action/.test(window.debug.actionLogText())` == `true`

### action-log-ring-cap
- **summary**: The action log holds at most 200 entries; older entries are evicted FIFO.
- **impl**: app/core/debug.js pushBuffered ring eviction
- **prereqs**: page loaded
- **steps**:
  1. `call:debug.clear()`
  2. (push 250 entries via `for(let i=0;i<250;i++) debug.recordAction("loop", "row_"+i)`)
- **verify**:
  - `function_returns` `(function(){ const a = window.debug.actionLog(200); return a.length === 200 && a[0].name === "row_50"; })()` == `true`
- **manual_only**: true

## Render perf instrumentation

### timing-populated-after-frames
- **summary**: After several render frames, debug.timing() reports a samples count > 0 and an avg.total > 0.
- **impl**: app/render/canvas.js recordRenderTiming + render() bracketing; app/core/debug.js timing()
- **prereqs**: project loaded with at least one slot; a few rAF ticks elapsed
- **fixture**: render-warmed
- **steps**:
  1. (no-op — timing is rolled by the running render loop)
- **verify**:
  - `function_returns` `(function(){ const t = window.debug.timing(); return t && t.samples > 0 && t.avg && t.avg.total >= 0; })()` == `true`

### timing-toggle
- **summary**: debug.setTimingEnabled(false) disables instrumentation; subsequent frames don't update lastFrame.
- **impl**: app/core/debug.js setTimingEnabled; app/render/canvas.js perfTimingEnabled gate
- **prereqs**: project loaded
- **steps**:
  1. `call:debug.setTimingEnabled(false)`
  2. record `debug.timing().last.total` as L0
  3. (wait one frame)
- **verify**:
  - `function_returns` `Math.abs(window.debug.timing().last.total - L0) < 0.001` == `true`
  - `call:debug.setTimingEnabled(true)`  (restore for other tests)
- **manual_only**: true

## Debug namespace + per-file API headers

### debug-namespace-installed
- **summary**: window.debug exists with the documented method set after page load.
- **impl**: app/core/debug.js (loaded right after runtime.js)
- **prereqs**: page loaded
- **steps**:
  1. (no-op)
- **verify**:
  - `function_returns` `(typeof window.debug === "object" && typeof window.debug.snapshot === "function" && typeof window.debug.help === "function" && typeof window.debug.errors === "function")` == `true`

### debug-snapshot-shape
- **summary**: debug.snapshot() returns a stable JSON-friendly object with the documented keys.
- **impl**: app/core/debug.js snapshot()
- **prereqs**: project with at least one slot
- **steps**:
  1. (no-op)
- **verify**:
  - `function_returns` `(function(){ const s = window.debug.snapshot(); return typeof s.bones === "number" && typeof s.slots === "number" && typeof s.errors === "number"; })()` == `true`

### debug-record-error-buffered
- **summary**: debug.recordError(code, message) adds an entry to debug.errors() (most recent last) capped at 200.
- **impl**: app/core/debug.js recordError + ring buffer
- **prereqs**: page loaded
- **steps**:
  1. `call:debug.clear()`
  2. `call:debug.recordError("TEST_CODE", "test message", {foo: 1})`
- **verify**:
  - `function_returns` `(function(){ const e = window.debug.errors(); return e.length === 1 && e[0].code === "TEST_CODE" && e[0].context && e[0].context.foo === 1; })()` == `true`

### debug-find-slot-by-name
- **summary**: debug.findSlot(name) returns the slot index, -1 if missing.
- **impl**: app/core/debug.js findSlot
- **prereqs**: project with a slot named "head"
- **steps**:
  1. (no-op)
- **verify**:
  - `function_returns` `window.debug.findSlot("head") >= 0` == `true`
  - `function_returns` `window.debug.findSlot("__not_a_slot__") === -1` == `true`
- **manual_only**: true

## Atlas advanced packing

### atlas-multipage-overflow
- **summary**: When the total atlas content exceeds the configured page size, packSlotsToAtlasPage spills onto additional pages instead of erroring.
- **impl**: app/io/project-export.js packSlotsToAtlasPage shelf packer, allowMultiPage gate
- **prereqs**: 4 slot canvases each 600×600; atlas options `{maxWidth: 1024, maxHeight: 1024, allowMultiPage: true}`
- **steps**:
  1. call packSlotsToAtlasPage with the canvases
- **verify**:
  - `function_returns` `(function(){ const r = packSlotsToAtlasPage(window.__atlasFixtures, "spine_export.png", 1, {maxWidth:1024, maxHeight:1024, allowMultiPage:true}); return Array.isArray(r.pages) && r.pages.length >= 2; })()` == `true`
- **manual_only**: true

### atlas-rotation-emits-rotate-flag
- **summary**: With allowRotate=true, regions that fit better rotated emit `rotate: 90` in the atlas text and have w/h swapped.
- **impl**: app/io/project-export.js packSlotsToAtlasPage tryPlace + atlas text emit
- **prereqs**: a tall canvas (e.g. 200×800) on a wide page (e.g. 1024×400) where rotation fits
- **steps**:
  1. pack with `{allowRotate: true, maxWidth: 1024, maxHeight: 400}`
- **verify**:
  - `function_returns` `(function(){ const r = packSlotsToAtlasPage([{attachmentName:"a", canvas: window.__tallCanvas}], "spine_export.png", 1, {allowRotate:true, maxWidth:1024, maxHeight:400}); return /rotate: 90/.test(r.atlas); })()` == `true`
- **manual_only**: true

### atlas-trim-emits-orig-offset
- **summary**: With allowTrim=true, transparent edges are stripped and the .atlas text records the original size and trim offset.
- **impl**: app/io/project-export.js trimTransparentEdges; atlas text emit `orig:` / `offset:`
- **prereqs**: a canvas with 100×100 visible content centered in a 200×200 transparent canvas
- **steps**:
  1. pack with `{allowTrim: true}`
- **verify**:
  - `function_returns` `(function(){ const r = packSlotsToAtlasPage([{attachmentName:"a", canvas: window.__paddedCanvas}], "spine_export.png", 1, {allowTrim:true}); return /orig: 200, 200/.test(r.atlas) && /offset: 50, 50/.test(r.atlas); })()` == `true`
- **manual_only**: true

### atlas-page-naming
- **summary**: Page 1 keeps the supplied page name; subsequent pages append `_2`, `_3`, ... before the extension (Spine convention).
- **impl**: app/io/project-export.js page-naming loop after pack
- **prereqs**: 3 canvases, page size that fits exactly one each
- **steps**:
  1. pack with multi-page enabled
- **verify**:
  - `function_returns` `(function(){ const r = packSlotsToAtlasPage(window.__threeCanvases, "spine_export.png", 1, {maxWidth:128, maxHeight:128, allowMultiPage:true}); return r.pages[0].name === "spine_export.png" && r.pages[1].name === "spine_export_2.png"; })()` == `true`
- **manual_only**: true

### atlas-options-persist-to-state
- **summary**: Changing the atlas option inputs in the export panel writes to `state.export.atlas`.
- **impl**: app/ui/bootstrap.js _syncAtlasOption change handlers
- **prereqs**: export panel open with atlas inputs visible
- **steps**:
  1. `set_value:#atlasPadding=8`
  2. fire change on `#atlasPadding`
- **verify**:
  - `function_returns` `state.export.atlas.padding === 8` == `true`
- **manual_only**: true

## Drag-reorder coverage parity

### physics-move-down-symmetry
- **summary**: Physics constraints have a Move Down button mirroring Move Up — parity with IK / Transform / Path. Clicking it swaps the selected constraint with the one after it.
- **impl**: app/render/constraints.js physicsMoveDownBtn handler; refreshPhysicsUI disabled-state; index.html `#physicsMoveDownBtn`
- **prereqs**: 2+ physics constraints, the first selected
- **steps**:
  1. record `state.mesh.physicsConstraints[0].name` as N0
  2. `click:#physicsMoveDownBtn`
- **verify**:
  - `function_returns` `state.mesh.physicsConstraints[1].name === N0` == `true`
- **manual_only**: true

### animation-reorder-up-down
- **summary**: The animation action dropdown gained "Move Up" / "Move Down". Reorders state.anim.animations without losing the current selection.
- **impl**: app/ui/animation-panels.js reorderCurrentAnimation
- **prereqs**: 2+ animations, first one selected as currentAnimId
- **steps**:
  1. record `state.anim.animations[0].id` as ID0
  2. set `els.animActionSelect.value = "moveDown"`; `click:#animActionBtn`
- **verify**:
  - `function_returns` `state.anim.animations[1].id === ID0` == `true`
  - `function_returns` `state.anim.currentAnimId === ID0` == `true`  (selection preserved across reorder)
- **manual_only**: true

### skin-set-reorder-up-down
- **summary**: The skin panel has Move Up / Move Down buttons. Reorders skinSets without altering contents or the active skin.
- **impl**: app/ui/editor-panels.js reorderSelectedSkinSet
- **prereqs**: 2+ skins; the first selected
- **steps**:
  1. record `ensureSkinSets()[0].id` as SID0
  2. `click:#skinMoveDownBtn`
- **verify**:
  - `function_returns` `ensureSkinSets()[1].id === SID0` == `true`
  - `function_returns` `state.selectedSkinSet === 1` == `true`  (selection follows the moved skin)
- **manual_only**: true

## Spine JSON import (4.x)

### spine-import-bones-roundtrip
- **summary**: Importing a Spine JSON that we exported (with the synthetic `__export_root_yup` root) produces bones whose tx/ty match the original within 0.001.
- **impl**: app/io/project-actions.js importSpineJsonInto — detects `__export_root_yup`, strips it, leaves child bone coords in our Y-down space.
- **prereqs**: an existing project with bones; export to Spine JSON; re-import the same JSON via the file input
- **steps**:
  1. record `state.mesh.rigBones[1].tx` as TX0 (skip root)
  2. export → re-import
- **verify**:
  - `function_returns` `Math.abs(state.mesh.rigBones[1].tx - TX0) < 0.001` == `true`
- **manual_only**: true

### spine-import-slot-name-matching
- **summary**: Spine slots are matched to existing internal slots by name. Slots with no internal counterpart are skipped (warning logged).
- **impl**: app/io/project-actions.js importSpineJsonInto slotNameToIndex map
- **prereqs**: project with slot named "torso"; Spine JSON with slot named "torso" + slot named "missing_slot"
- **steps**:
  1. import Spine JSON
- **verify**:
  - `function_returns` `state.slots.find(s => s && s.name === "torso") != null` == `true`
  - `function_returns` `Array.isArray(window.__lastSpineImportWarnings) ? window.__lastSpineImportWarnings.some(w => w.includes("missing_slot")) : true` == `true`
- **manual_only**: true

### spine-import-mesh-weighted-vertices
- **summary**: Weighted mesh attachments (Spine packed format `[boneCount, boneIdx, x, y, w, ...]`) are unpacked and applied as positions+weights on the matching attachment.
- **impl**: app/io/project-actions.js applySpineAttachmentToSlot mesh branch (weighted detection by `vertices.length !== uvs.length`)
- **prereqs**: Spine JSON with one weighted mesh attachment matching an existing attachment name
- **steps**:
  1. import
- **verify**:
  - `function_returns` `(function(){ const s = state.slots.find(s => s.attachments && s.attachments.find(a => a.meshData && a.meshData.weights)); return !!s; })()` == `true`
- **manual_only**: true

### spine-import-animation-bone-rotate
- **summary**: A Spine animation with a bone `rotate` channel becomes an internal animation with track `bone:N:rot` containing keys with `value` in radians.
- **impl**: app/io/project-actions.js importSpineAnimations bone-rotate branch (math.degToRad)
- **prereqs**: Spine JSON with one animation containing a single rotate keyframe at time 0, value 90deg, on a known bone
- **steps**:
  1. import
- **verify**:
  - `function_returns` `(function(){ const a = state.anim.animations.find(a => a.tracks && Object.keys(a.tracks).some(k => /^bone:\\d+:rot$/.test(k))); if (!a) return false; const tk = Object.keys(a.tracks).find(k => /^bone:\\d+:rot$/.test(k)); return Math.abs(a.tracks[tk][0].value - Math.PI/2) < 0.001; })()` == `true`
- **manual_only**: true

### spine-import-third-party-y-flip
- **summary**: Spine JSON without our synthetic root (3rd-party project) gets each bone's y negated to convert from Spine Y-up to our Y-down.
- **impl**: app/io/project-actions.js importSpineJsonInto yFlip = hasSyntheticRoot ? 1 : -1
- **prereqs**: Spine JSON with a single root bone at y=50, no `__export_root_yup` root
- **steps**:
  1. import
- **verify**:
  - `function_returns` `Math.abs(state.mesh.rigBones[0].ty + 50) < 0.001` == `true`
- **manual_only**: true

## Audio waveform on timeline (event track)

### waveform-decode-on-audio-event
- **summary**: Adding an audio event to the events track triggers an async decode that produces a 256-bucket peak Float32Array, cached by audio URL.
- **impl**: app/animation/runtime.js getTimelineAudioPeaks / decodeAudioToPeaks
- **prereqs**: ≥1 event keyframe with `value.audio` set to a fetchable audio URL (data URI works for tests)
- **steps**:
  1. call `getTimelineAudioPeaks("/path/to/audio.wav", () => { window.__waveformReady = true; })`
  2. await window.__waveformReady or 2s timeout
- **verify**:
  - `function_returns` `(function(){ const e = getTimelineAudioPeaks("/path/to/audio.wav"); return e && e.state === "ready" && e.peaks instanceof Float32Array && e.peaks.length === 256; })()` == `true`
- **manual_only**: true

### waveform-svg-rendered-on-event-track
- **summary**: When peaks are ready, the events lane in the timeline contains an `.track-waveform` SVG positioned at the event's time, sized by audio duration.
- **impl**: app/animation/timeline-ui.js renderTimelineTracks() event-track branch; renderWaveformSvg in runtime.js
- **prereqs**: ready peaks for the active event keyframe's audio URL
- **fixture**: render-warmed
- **steps**:
  1. trigger `renderTimelineTracks()`
- **verify**:
  - `dom_exists` `.track-lane[data-track-id="event:timeline"] .track-waveform` == `true`

### waveform-cache-survives-second-call
- **summary**: A second call for the same URL returns the cached entry without re-fetching; only the first call triggers a network round-trip.
- **impl**: app/animation/runtime.js __timelineAudioPeaks Map check at top of getTimelineAudioPeaks
- **prereqs**: getTimelineAudioPeaks already invoked once for URL X
- **steps**:
  1. record cache size: `window.__sz0 = __timelineAudioPeaks.size`
  2. call getTimelineAudioPeaks(X)
- **verify**:
  - `function_returns` `__timelineAudioPeaks.size === window.__sz0` == `true`
- **manual_only**: true

## CPU skinning hot loop optimization (Phase 5)

### skinning-bone-palette-cached
- **summary**: After Phase 5, `mul(world[b], invBind[b])` is computed once per bone per frame (cached as a flat 6-float palette), not once per vertex × bone. The skinned output positions must remain bit-identical to the pre-optimization algorithm.
- **impl**: app/render/constraints.js buildBonePalette(); updateDeformation + buildSlotGeometry inline matrix math
- **prereqs**: 1 mesh with ≥3 bones, ≥10 vertices, weights present (auto-weighted is fine)
- **steps**:
  1. trigger render; record `state.mesh.deformedScreen[0..3]` as Sx0,Sy0,Sx1,Sy1
  2. set bone[0].rot to math.degToRad(15); trigger render
  3. set it back to 0; trigger render
- **verify**:
  - `function_returns` `Math.abs(state.mesh.deformedScreen[0] - Sx0) < 0.001 && Math.abs(state.mesh.deformedScreen[1] - Sy0) < 0.001` == `true`
- **manual_only**: true

### skinning-no-object-alloc-in-inner-loop
- **summary**: The optimized inner loop inlines transformPoint to avoid `{x,y}` object allocation per vertex×bone. This is observable indirectly: a long deformation run shouldn't spike the heap.
- **impl**: app/render/constraints.js updateDeformation + buildSlotGeometry inner loops (inline math vs transformPoint)
- **prereqs**: large mesh (≥200 vertices, ≥10 bones)
- **steps**:
  1. (visual / profiler check; no scripted assertion)
- **verify**:
  - `function_returns` `typeof buildBonePalette === "function"` == `true`
- **manual_only**: true

## GL base image reference (Phase 3 — reference image stays on GL)

### gl-base-reference-drawn-on-gl
- **summary**: When a source image is loaded and no slots exist, the base reference is drawn through the WebGL pipeline (textured quad), not via Canvas2D fallback.
- **impl**: app/render/canvas.js drawBaseImageReferenceGL() called inline in the GL render branch
- **prereqs**: `state.sourceCanvas` set, `state.imageWidth > 0`, `state.slots.length === 0`, WebGL available
- **steps**:
  1. trigger render: `requestRender("test"); await one rAF tick`
- **verify**:
  - `function_returns` `state.overlayScene.enabled === false` == `true`  (GL path taken; 2D scene overlay not used)
  - `function_returns` `drawBaseImageReferenceGL() === true` == `true`  (the helper runs and draws)
- **manual_only**: true

### gl-base-reference-faded-once-slots-exist
- **summary**: Once at least one slot exists, the base reference draws at 0.35 alpha (unless on the Canvas tab) — matching the pre-migration 2D behavior.
- **impl**: app/render/canvas.js drawBaseImageReferenceGL alpha branch
- **prereqs**: 1 slot present; not in Canvas/Base Image edit tab
- **steps**:
  1. (visual only — checked via the alpha uniform sent to the shader)
- **verify**:
  - `function_returns` `(function(){ drawBaseImageReferenceGL(); return true; })()` == `true`
- **manual_only**: true

## GL stencil clipping (Phase 2 — clip slots stay on GL)

### gl-stencil-clip-context-has-stencil
- **summary**: The WebGL context is requested with `stencil: true` so stencil ops actually work.
- **impl**: app/core/runtime.js gl context attributes
- **prereqs**: WebGL available
- **steps**:
  1. (no-op — context attrs are set at startup)
- **verify**:
  - `function_returns` `gl.getContextAttributes().stencil === true` == `true`
- **manual_only**: true

### gl-stencil-clip-engaged-when-clip-slot-present
- **summary**: When a clip slot is present, render() takes the GL path (not Canvas2D fallback) and sets `_glStencilClip.active` while drawing the clipped range.
- **impl**: app/render/canvas.js render() loop (no longer gated on `hasClipSlot`); beginGLStencilClip / endGLStencilClip helpers
- **prereqs**: at least 2 slots (one with `clipEnabled=true`, plus a normal slot in its clip range); WebGL available
- **steps**:
  1. trigger a single render: `requestRender("test"); await one rAF tick`
- **verify**:
  - `function_returns` `state.overlayScene.enabled === false` == `true`  (stayed on GL — overlay scene not used)
  - `function_returns` `_glStencilClip.active === false` == `true`  (cleaned up after the loop)
- **manual_only**: true

### gl-stencil-clip-end-slot-closes-mask
- **summary**: When the slot whose id matches `clipEndSlotId` is reached, the stencil mask is torn down.
- **impl**: app/render/canvas.js render() loop (`isClipEnd` branch calling `endGLStencilClip()`)
- **prereqs**: clip slot at index 0 with `clipEndSlotId` referencing the slot at index 2
- **steps**:
  1. instrument: `window.__clipDebug = []; const orig = endGLStencilClip; endGLStencilClip = function(){ window.__clipDebug.push("end"); orig(); };`
  2. trigger render
- **verify**:
  - `function_returns` `Array.isArray(window.__clipDebug) && window.__clipDebug.length >= 1` == `true`
- **manual_only**: true

## Pose-tool numeric ops (relative entry: +N / -N / *N / /N)

### relative-numeric-add
- **summary**: Typing `+10` in `#boneTx` adds 10 to the bone's current tx on commit (blur or Enter).
- **impl**: app/ui/constraint-panels.js resolveRelativeNumeric / initRelativeNumericInputs; index.html data-relative-numeric attribute on bone numeric inputs
- **prereqs**: ≥1 bone selected, parent connected = false (so tx is editable), record `state.mesh.rigBones[state.selectedBone].tx` as TX0
- **steps**:
  1. `set_value:#boneTx=+10`
  2. `key:#boneTx=Enter`
- **verify**:
  - `function_returns` `Math.abs(state.mesh.rigBones[state.selectedBone].tx - (TX0 + 10)) < 0.001` == `true`
- **manual_only**: true

### relative-numeric-multiply
- **summary**: Typing `*2` in `#boneScaleX` doubles the current scale on commit.
- **impl**: app/ui/constraint-panels.js resolveRelativeNumeric (multiplicative branch)
- **prereqs**: ≥1 bone selected; record `state.mesh.rigBones[state.selectedBone].sx` as SX0
- **steps**:
  1. `set_value:#boneScaleX=*2`
  2. `key:#boneScaleX=Enter`
- **verify**:
  - `function_returns` `Math.abs(state.mesh.rigBones[state.selectedBone].sx - (SX0 * 2)) < 0.001` == `true`
- **manual_only**: true

### relative-numeric-mid-typing-no-corruption
- **summary**: While the user is mid-typing an operator (e.g. `+`, `-`, `*`), the input handler must NOT zero out or corrupt the current value — it should bail until a parsable number is present.
- **impl**: app/ui/constraint-panels.js bone input handlers (Number.isFinite bail-out before mutating)
- **prereqs**: ≥1 bone selected; record TX0 = state.mesh.rigBones[state.selectedBone].tx
- **steps**:
  1. `set_value:#boneTx=+`  (no commit, simulates partial typing — fires `input` event)
- **verify**:
  - `state_path` `state.mesh.rigBones[state.selectedBone].tx` == `TX0`
- **manual_only**: true

## Tree stability during edits (regression guards)

### tree-stable-during-bone-edit-drag
- **summary**: Dragging a bone head/tail in Edit mode must NOT cause weighted slots to jump between bones in the tree mid-drag.
- **impl**: app/core/bones.js commitRigEditPreserveCurrentLook (drag guard); app/ui/bootstrap.js clearDrag (final rebuild)
- **prereqs**: 3 bones, 1 slot weighted across them, all visible in the bone tree; mode = Edit; selectedBone is on a bone whose head is near (300,300) in canvas px
- **steps**:
  1. `pointer:overlay@300,300:drag@400,300`
- **verify**:
  - `function_returns` `(typeof window.__lastTreeJump === "undefined" || window.__lastTreeJump === false)` == `true`
- **manual_only**: true

## Test infra self-checks

### test-runner-pointer-step
- **summary**: The pointer:overlay@x,y step dispatches a synthetic pointerdown/up on the canvas overlay.
- **impl**: tools/test-runner-browser.js execPointerStep
- **prereqs**: app loaded, overlay visible, no panel modal blocking
- **steps**:
  1. `call:(window.__pointerSteps = 0, els.overlay.addEventListener("pointerdown", () => { window.__pointerSteps += 1; }, { once: true }))`
  2. `pointer:overlay@100,100`
- **verify**:
  - `state_path` `window.__pointerSteps` == `1`

### test-runner-set-value
- **summary**: set_value:#id=VALUE writes input.value and dispatches input + change.
- **impl**: tools/test-runner-browser.js execStep "set_value"
- **prereqs**: a known input element exists, e.g. #weightPruneThreshold
- **steps**:
  1. `set_value:#weightPruneThreshold=0.123`
- **verify**:
  - `function_returns` `els.weightPruneThreshold.value` == `"0.123"`

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
