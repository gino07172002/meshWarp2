# AGENTS.md — AI agent quick reference

Authoritative reference for any AI agent (Claude Code, Codex, MCP tool, etc.)
working on this codebase. Read this before touching slot / attachment / render /
animation / constraint code.

---

## 1. Project overview

A browser-based 2D skeletal animation editor (Spine 4.x compatible).
Stack: vanilla JavaScript loaded via `<script>` tags (no modules, no bundler,
no build step). HTML5 Canvas 2D for overlay + WebGL for the main render path.
Entry: `index.html` loads scripts in dependency order.

**Critical**: every `function foo() {}` at top level in any file becomes a
global, accessible to every later script. There are no imports. Cross-file
references work because everything is in the same window scope.

**Diagnostics**: open the browser console and type `debug.help()` for the
full surface. Use `debug.snapshot()` before reasoning about state. Use
`debug.timing()` for render perf. Use `debug.actionLog()` for bug repro.

---

## 2. Slot → Attachment Architecture (Spine2D style)

**This is the core data model. Get it right.**

### Data hierarchy

```
state.slots[i]  (Slot)
  ├─ id, name, bone, visible, alpha, r/g/b, blend, dark*, tx/ty/rot
  ├─ activeAttachment: string | null   ← which attachment is currently shown
  └─ attachments: Attachment[]

Attachment (one of):
  region     { canvas, rect, baseImageTransform }
  mesh       { canvas, rect, meshData, meshContour, useWeights, weightMode,
               influenceBones, weightBindMode }
  linkedmesh { canvas, linkedParent (name), deformable }
  boundingbox{ meshContour, bboxSource:"fill"|"contour" }
  clipping   { meshContour, clipEnabled, clipSource, clipEndSlotId }
  point      { pointX, pointY, pointRot }
```

### Key constants & helpers (workspace.js)

| Symbol | Location | Notes |
|--------|----------|-------|
| `ATTACHMENT_TYPES` | [workspace.js:31](app/workspace/workspace.js#L31) | Frozen object: REGION/MESH/LINKED_MESH/BOUNDING_BOX/CLIPPING/POINT |
| `isDeformableAttachment(att)` | [workspace.js:1319](app/workspace/workspace.js#L1319) | true for mesh/linkedmesh |
| `attachmentHasMesh(att)` | [workspace.js:1329](app/workspace/workspace.js#L1329) | true for mesh/linkedmesh/bbox/clipping |
| `readSlotMeshData(slot)` | [workspace.js:1345](app/workspace/workspace.js#L1345) | safe getter via active attachment |
| `readSlotMeshContour(slot)` | [workspace.js:1352](app/workspace/workspace.js#L1352) | safe getter via active attachment |
| `getActiveAttachment(slot)` | [slots.js:14](app/workspace/slots.js#L14) | returns the live attachment object |
| `getSlotAttachmentEntry(slot, name)` | slots.js | returns attachment by name |
| `ensureSlotAttachments(slot)` | slots.js | guarantees slot.attachments is an array |
| `normalizeAttachmentType(t)` | workspace.js | normalises string to ATTACHMENT_TYPES value |

### NEVER do this

```js
// WRONG — slot no longer holds mesh data directly
slot.meshData = ...
slot.meshContour = ...
slot._indices = ...

// RIGHT
getActiveAttachment(slot).meshData = ...
```

`tools/check-legacy-slot-mesh.js` will fail CI if any direct `slot.meshData` access is found.

### Serialization

- Save: `buildProjectPayload()` ([project-export.js:53](app/io/project-export.js#L53)) — outputs `projectVersion: 2`; mesh data is under `slot.attachments[i].meshData` only.
- Load: `upgradeLegacyProject(payload)` ([project-actions.js:35](app/io/project-actions.js#L35)) — upgrades v1 (slot-level meshData) to v2.
- Legacy promote helper: `promoteLegacySlotMeshState(slot)` ([workspace.js:553](app/workspace/workspace.js#L553)) — called during load only.

---

## 3. Key files and responsibilities

Every file's first ~20 lines is a `// ROLE: ... // EXPORTS: ...` header
listing what it owns. **Read that header first** — it answers "what does this
file do" without grepping.

### Core (foundation, loaded before everything)

| File | What it owns |
|------|---------------|
| `app/core/runtime-els.js` | `const els = {...}` — DOM ref registry. Add new ids here when wiring HTML. |
| `app/core/runtime.js` | `state` object, GL setup, math helpers, dock layout, command palette, status bar, rig math (`computeWorld`, `getEditAwareWorld`, `transformPoint`, `mul`, etc). |
| `app/core/runtime-ai-capture.js` | `registerAICaptureDomain`, `runAICaptureCommand`, AI capture report builder. |
| `app/core/runtime-pose-autorig.js` | BlazePose / MediaPipe humanoid auto-rig (loads TF.js / MediaPipe at runtime). |
| `app/core/debug.js` | `window.debug.*` diagnostic namespace. Action log + error/warning ring buffers. |
| `app/core/bones.js` | Rig math, pose evaluation, weight ops (alloc/prune/weld/swap), bone CRUD, constraint remapping after bone removal. |
| `app/core/bones-tree-ui.js` | `renderBoneTree` (DOM build), inline rename, `updateBoneSelectors`/`updateBoneUI`/`updateWorkspaceUI` workspace tab visibility. |

### Workspace (slot data model)

| File | What it owns |
|------|---------------|
| `app/workspace/workspace.js` | Slot + attachment data model, `ATTACHMENT_TYPES`, normalization, skin sets, legacy slot-meshData upgrade path. |
| `app/workspace/slots.js` | Slot operations: `getActiveAttachment`, `ensureSlotMeshData`, sequence frame runtime, mesh micro-tools (subdivide/centroid/flip/generate). |
| `app/workspace/constraint-model.js` | IK / Transform / Path / **Physics** constraint data + ensureXxxConstraints + the Physics solver + `buildConstraintExecutionPlan`. |

### Render

| File | What it owns |
|------|---------------|
| `app/render/canvas.js` | Per-frame `render()` entry. WebGL slot draw, stencil clipping (`beginGLStencilClip`/`endGLStencilClip`), base ref textured quad, onion skin overlay, `drawOverlay`. |
| `app/render/constraints.js` | IK / Transform / Path solvers, `updateDeformation` + `buildSlotGeometry` (CPU skinning with per-frame bone-palette cache), constraint UI (refreshIKUI/TransformUI/PathUI/PhysicsUI), localToScreen / screenToLocal. |
| `app/render/weight-brush.js` | Weight paint brush (4 modes + bone lock + smooth). |
| `app/render/weight-heatmap-gpu.js` | GPU weight visualization fragment shader. |
| `app/render/gl-toolkit.js` | Phase 0 WebGL infra (context lost/restored, shader cache, fullscreen quad). |
| `app/render/state-machine.js` | State machine bridge JSON / sample code export. |

### Animation

| File | What it owns |
|------|---------------|
| `app/animation/model.js` | Persistence, autosave, animation/track data model, track keyframe helpers, `EVENT_TRACK_ID` etc. |
| `app/animation/timeline-ui.js` | DOM-based timeline track render, keyframe markers, curve editor, **audio waveform overlay** on event tracks. |
| `app/animation/runtime.js` | `samplePoseAtTime`, layer blending, playback advance, timeline event emission, audio playback, **audio peak decode + cache**. |

### IO

| File | What it owns |
|------|---------------|
| `app/io/project-actions.js` | Native project load (`handleProjectLoadInputChange`), legacy v1→v2 upgrade, **Spine JSON import** (`importSpineJsonInto`). |
| `app/io/project-export.js` | Native project save, atlas advanced packer (`packSlotsToAtlasPage` — multi-page / rotation / trim / bleed), Spine SKEL binary writer, diagnostics auto-fix, `exportSpineData` entry. |
| `app/io/project-export-spine-json.js` | `buildSpineJsonData` (the full Spine 4.x JSON tree builder, ~1500 lines) + `validateSpineJsonForExport`. |
| `app/io/tree-bindings.js` | Image/PSD import, bone tree drag-drop wiring, slot row context menus, attachment type picker, attachment CRUD. |

### UI

| File | What it owns |
|------|---------------|
| `app/ui/editor-panels.js` | Setup tab + skin panel (add/dup/del/reorder), bone-compensation toggle, weight overlay toggle, diagnostics auto-fix. |
| `app/ui/constraint-panels.js` | Right-Properties IK / Transform / Path constraint controls + bone property fields + relative numeric entry parser (`+10`, `*2`). Note: Physics UI lives next to its solver in `render/constraints.js`. |
| `app/ui/animation-panels.js` | Animation list controls (add/dup/del/**reorder**), onion skin / event dialog wiring, layer mixer, preview export (WebM/GIF), batch export. |
| `app/ui/timeline-pointer.js` | Timeline marquee selection, keyframe drag, playhead/ruler scrub. |
| `app/ui/dock-layout.js` | Side dock panels (left/right/bottom), floating drag-out, snap zones, collapse, localStorage persistence. |
| `app/ui/hotkeys.js` | Global keyboard hotkeys + canvas pointer event dispatch (drag start/move/end), pan/zoom, weight brush intercept. |
| `app/ui/bootstrap.js` | App bootstrap — runs once at script-load tail. Wires final UI controls (mesh tools, weight brush, fullscreen, atlas options), restores autosave, schedules first render. |

### Static assets

| File | What it owns |
|------|---------------|
| `index.html` | Markup + script load order. Atlas options panel, every constraint panel, the export dock. |
| `styles.css` | All styles. CSS type-gating for `#attachmentPropsGroup.att-type-<type>`. |

---

## 4. UI Panel Architecture

### Right-side panels

```
#slotPropsGroup          ← Slot: name, bone, color, alpha, blend, dark tint
#attachmentPropsGroup    ← Attachment: selector, type, name, type-specific fields
```

`#attachmentPropsGroup` carries a CSS class `att-type-<type>` (e.g. `att-type-mesh`) set by `refreshAttachmentPanel()`.
Elements with `data-att-type="mesh"` (or space-separated types) are shown/hidden purely via CSS — **no inline `style.display` needed**.

### UI refresh functions (bones.js)

- `refreshSlotUI()` — full refresh (calls both below + sidebar stuff). Use when unsure.
- `refreshSlotPanel(s)` — slot-level fields only (bone, color, alpha, etc.)
- `refreshAttachmentPanel(s)` — attachment fields + CSS type-class update

`setRightPropsFocus(mode)` — `"slot" | "attachment" | "bone"` — controls which panel group is visible.

---

## 5. Bone Tree Inline Rename

Supports `kind = "slot" | "bone" | "attachment"`.

```js
// Start inline rename on a tree row
startBoneTreeInlineRename("attachment", slotIndex, attachmentName)

// Commit (called by Enter/blur)
commitBoneTreeInlineRename("attachment", slotIndex, inputValue, attachmentName)
```

State stored in `state.boneTreeInlineRename = { kind, index, attachmentName }`.

---

## 6. Attachment Drag & Drop in Tree

`state.treeAttachmentDrag = { slotIndex, attachmentName }` — set on dragstart of a `.tree-attachment` row.

- **Same slot drop**: reorders `slot.attachments[]` array.
- **Cross-slot drop**: moves the attachment object to the target slot; fixes `activeAttachment` on both.

CSS indicators: `.att-drop-before` / `.att-drop-after` classes on target row.

---

## 7. Attachment CRUD Functions

All in `app/io/tree-bindings.js`:

| Function | Location | Notes |
|----------|----------|-------|
| `addAttachmentToActiveSlot()` | [tree-bindings.js:1000](app/io/tree-bindings.js#L1000) | clones current canvas; sets activeAttachment |
| `renameActiveAttachmentInSlot()` | tree-bindings.js | syncs skin/animation tracks |
| `deleteActiveAttachmentInSlot()` | tree-bindings.js | min 1 must remain |
| `duplicateAttachment(slot, name)` | [tree-bindings.js:1300](app/io/tree-bindings.js#L1300) | deep clone |
| `convertAttachmentType(slot, name, nextType)` | [tree-bindings.js:1313](app/io/tree-bindings.js#L1313) | type change, clears incompatible data |
| `openAttachmentTypePicker(initialType, title)` | [tree-bindings.js](app/io/tree-bindings.js) | async Promise-based modal popup (button grid, Escape/backdrop cancel); replaces old `window.prompt` |
| `copyAttachmentToSlot(srcSlot, attName, destSlot)` | [tree-bindings.js](app/io/tree-bindings.js) | deep-clones attachment into a different slot via `addAttachmentOfType`; returns the new record |
| `openSlotPickerPopup(excludeSlotIndex, title)` | [tree-bindings.js](app/io/tree-bindings.js) | async Promise → slot index; reuses `#attTypePickerWrap` modal, replaces grid with slot buttons |

---

## 8. Animation / Deform Track Format

Deform track ID: `slot:<slotIndex>:attachment:<attachmentName>:deform`
Attachment-switch track: `slot:<slotIndex>:slot:attachment`

When renaming an attachment, **always update**:
1. `slot.attachmentName` / `slot.activeAttachment`
2. Skin `slotAttachments[slot.id]`
3. All animation tracks matching the old name

`renameActiveAttachmentInSlot()` already does all of this correctly — call it rather than mutating `att.name` directly.

---

## 9. Render Pipeline

```
renderSlots2DWithClipping()          [canvas.js]
  └─ per slot: buildRenderableAttachmentGeometry(slot, poseWorld)
       ├─ type === region   → buildRegionAttachmentGeometry()   (fast path, no deform)
       ├─ type === mesh     → buildSlotGeometry()               (bone deform)
       ├─ type === linkedmesh → resolveLinkedMeshSource() then buildSlotGeometry()
       ├─ type === clipping  → push clip path, apply to following slots
       └─ other             → null (not rendered, editor gizmos only)
```

`buildSlotGeometry` ([constraints.js:1417](app/render/constraints.js#L1417)) returns null for non-deformable attachments.
`ensureSlotMeshData` ([slots.js:1716](app/workspace/slots.js#L1716)) early-returns if attachment type is not mesh/linkedmesh.

### Overlay Canvas (drawOverlay in constraints.js)

At end of `drawOverlay()`, before `drawCanvasTransformGizmos`:

1. **`drawGhostAttachments(ctx, poseWorld)`** — draws non-active attachments in active slot as semi-transparent dashed outlines:
   - `region/mesh/linkedmesh` with canvas: dashed rect of image bounds
   - `boundingbox/clipping`: dashed polygon from `att.meshContour.points`
   - `point`: ⊕ crosshair circle

2. **`drawAttachmentGizmos(ctx, poseWorld)`** — draws interactive handles on the **active** attachment:
   - `point`: yellow circle at `(att.pointX, att.pointY)` + rotation tip dot; both draggable
   - `boundingbox/clipping`: square vertex handles on `meshContour.points`; each draggable

3. **`pickAttachmentGizmoHandle(mx, my, poseWorld)`** — returns `{ kind: "point_move"|"point_rotate"|"vertex", pointIndex? }` or `null`; used by `hotkeys.js` pointerdown.

### Gizmo Drag State

Three drag types set by `hotkeys.js` pointerdown (after `isSlotMeshEditTabActive()` block, before bone pick):

| `state.drag.type` | Fields | Mutates |
|---|---|---|
| `att_gizmo_point_move` | `slotIndex, startLocal, startX, startY` | `att.pointX/Y` |
| `att_gizmo_point_rotate` | `slotIndex, pivotLocal, startRot, startAngle` | `att.pointRot` |
| `att_gizmo_vertex` | `slotIndex, pointIndex, startSlotLocal, origPt` | `meshContour.points[i]` |

All three call `refreshAttachmentPanel(slot)` on move, and `pushUndoCheckpoint(true)` in `clearDrag()` (bootstrap.js).

### LinkedMesh Cross-Slot Parent Format

`att.linkedParent` stores `"slotId::attachmentName"` for cross-slot references.
`resolveLinkedMeshSource(raw)` in `slots.js` parses this format first, falls back to plain name for legacy compatibility.

---

## 10. Validation tools

Run before committing. All 25 checks must pass.

```bash
# All checks at once:
for f in tools/check-*.js; do node "$f"; done

# Test recipe spec (115 recipes across 31 sections):
node tools/test-spec-runner.js --validate

# Syntax for any JS file you edited:
node --check app/<path>/<file>.js
```

The check tools live in `tools/check-*.js`. Several read multiple source
files concatenated (so post-split function name lookups still work) — see
`tools/check-cache-busting-assets.js` for the canonical asset list.

If you add a new top-level `app/**/*.js` file, you must also:
1. Add a `<script src="...?v=...">` tag to `index.html`
2. Add the path to the asset list in `tools/check-cache-busting-assets.js`
3. Bump the cache-buster query when changing the file

See [TESTING.md](TESTING.md) for the full validation flow.

---

## 11. Diagnostic surface (`window.debug.*`)

Live in `app/core/debug.js`. Use these in the browser console — and in bug
repros, copy-paste `debug.actionLogText()` output.

| Method | Returns |
|---|---|
| `debug.snapshot()` | Major state at a glance (bone count, slot count, gl status, timing, etc) |
| `debug.mesh()` | Current `state.mesh` stats (vertex count, constraint counts) |
| `debug.slots()` | Per-slot summary `[{i, name, bone, attachments, ...}]` |
| `debug.bones()` | Per-bone summary `[{i, name, parent, tx, ty, rot, color}]` |
| `debug.constraints()` | IK / Transform / Path / Physics counts + names |
| `debug.animations()` | Animation list `[{id, name, duration, tracks}]` |
| `debug.timing()` | Render phase ms `{avg, max, last, estFps}` (60-frame ring) |
| `debug.actionLog(n=50)` | Last N user-visible actions (`status` + `command`) |
| `debug.actionLogText(n)` | Same, formatted for copy-paste |
| `debug.errors()` | Auto-captured exceptions + manual `recordError` |
| `debug.findSlot(name)` / `debug.findBone(name)` | Index by name (-1 if missing) |
| `debug.recordError(code, msg, ctx?)` | Manual error log |
| `debug.help()` | Print all of the above |

**AI tip**: prefer `debug.snapshot()` before reasoning; everything else is
a drill-down. For bug repros, ask the user for `debug.actionLogText()` —
that's a chronological replay of "what they clicked + what status messages
fired" with `+S.SSs` deltas.

---

## 12. State Shape (relevant fields)

```js
state = {
  slots: Slot[],
  activeSlot: number,          // index into state.slots, -1 if none
  mesh: RigMesh | null,        // bone rig
  rightPropsFocus: "slot" | "attachment" | "bone",
  boneTreeInlineRename: { kind: ""|"slot"|"bone"|"attachment", index: number, attachmentName: string },
  treeSlotDrag: { slotIndex: number } | null,
  treeAttachmentDrag: { slotIndex: number, attachmentName: string } | null,
  boneTreeAttachmentCollapse: { [slotIndex]: boolean },
  boneTreeMenuContextKind: ""|"slot"|"bone"|"attachment",
  // animations:
  anim: { tracks: { [trackId]: Track }, ... },
}
```

---

## 13. Conventions

- **No comments explaining what code does** — only add a comment if the *why* is non-obvious.
- **No backward-compat shims** — if something is removed, delete it; don't re-export.
- **Trust the tools**: after any change run `node --check <file>` and the tools in §10.
- **One undo checkpoint per user action**: call `pushUndoCheckpoint(true)` after mutations.
- **Always call `refreshSlotUI()` or `refreshAttachmentPanel(s)` after mutating slot/attachment data** so the right panel stays in sync.
- **Always call `renderBoneTree()` after mutating slot/attachment structure** so the tree stays in sync.

---

## 14. AI Capture Observability

AI Capture is the repo-owned way to give future AI agents runtime context without relying on chat memory.

When adding a UI feature that changes editor state, add semantic capture coverage:

1. Register or extend a domain with `registerAICaptureDomain(...)`.
2. Wrap meaningful operations with `beginAICaptureCommand(...)` or `runAICaptureCommand(...)`.
3. Add stable dotted command IDs such as `mesh.reset_to_grid`, not prose IDs.
4. Provide compact `snapshot`, `diff`, `invariants`, and `suspicions` functions for new domains.
5. Update focused checks under `tools/`.

Checklist: `docs/superpowers/runbooks/ai-capture-domain-checklist.md`

Validation:

```bash
node tools/check-ai-capture-registry.js
node tools/check-ai-capture-mesh.js
```

---

## 15. Puppet Warp (ARAP)

Adobe Photoshop / OpenToonz / After Effects-style puppet warp. Pin a mesh
vertex, drag it; rest of the mesh follows in an as-rigid-as-possible
deformation.

### Files

| File | Owns |
|---|---|
| `vendor/sparse-cholesky.js` | Float64 LDLᵀ solver (analyze / factor / solve) |
| `app/core/puppet-warp.js` | ARAP solver. Cot-Laplacian + pin penalty + 2-iter local-global. WeakMap cache by attachment. |
| `app/core/puppet-warp-runtime.js` | Editor glue: enable / addPin / dragPin / commitDrag, bake driver, panel UI |

### Data invariants

- `att.puppetWarp` shape:
  ```
  { mode: "standalone" | "post_skin",
    pins: [{ id, vertexIndex, restX, restY, label }],
    bake: { dirty, lastTopologyHash },
    lastTargets: { [pinId]: { x, y } } | null }
  ```
- `att.puppetWarp.pins[i].vertexIndex` MUST be < `att.meshData.positions.length / 2`.
- Pin id format: `pin_<short>` — used as the suffix of the timeline track id.
- Pin track id format: `slot:<slotIndex>:attachment:<attName>:puppetpin:<pinId>`. Track value = `{ x, y }`.

### Rendering invariants

- `getSlotWeightMode(slot, att)` short-circuits to `"free"` when `att.puppetWarp.mode === "standalone"`. This bypasses the bone palette in `buildSlotGeometry`. The render path is otherwise unchanged: `final = positions[i] + offsets[i]`.
- Post-skin mode leaves bone skinning intact; offsets compose on top.
- `meshData.offsets` is the only cross-cutting surface — Spine deform export reads it, runtime composes it, animation tracks bake into it.

### Animation flow

1. User adds a pin (alt-click or `ai.puppetwarp_add_pin`).
2. User drags the pin (gizmo drag or `ai.puppetwarp_drag_pin`). ARAP solves; `meshData.offsets` updated for live preview.
3. On pointerup or `ai.puppetwarp_set_pin_keyframe`: pin track gets a `{x, y}` keyframe at the current animation time. **Also** `bakeDeformKeyframeForTime` writes the corresponding deform track keyframe.
4. Playback: `samplePoseAtTime` calls `PuppetWarpRuntime.onAnimationFrame()` → samples pin tracks at current time → re-solves ARAP → writes `offsets` for the live frame.

### Spine export contract

- Spine JSON output MUST NOT contain `"puppetWarp"` or `"puppetpin"` substrings.
- Pin metadata is editor-only. The deformation travels via standard Spine deform timelines (the `bakeDeformKeyframeForTime` path).
- Native project JSON DOES preserve pins and pin tracks — round-trip is lossless editor↔editor, lossy editor→Spine.

### AI bridge tools (under `window.ai`)

- `ai.puppetwarp_enable / disable / add_pin / remove_pin / drag_pin / get_state`
- `ai.puppetwarp_set_pin_keyframe / delete_pin_keyframe / list_pin_keyframes`

### Validation

```bash
node tools/check-sparse-cholesky.js
node tools/check-puppet-warp-arap.js
node tools/demo-puppet-warp.js              # Phase 1 (pins + drag + native round-trip)
node tools/demo-puppet-warp-phase2.js       # Phase 2 (animated pins, ARAP playback)
node tools/demo-puppet-warp-spine-roundtrip.js  # Phase 3 (Spine export contract)
```

---

## 16. Image Workspace

Image Workspace is a 2D raster editor for imported images and attachment
canvases. It is intentionally separate from the mesh/render pipeline: edits
happen on a plain 2D work canvas, then the result is either downloaded, sent to
a new slot, or applied back to the source attachment.

### Files

| File | Owns |
|---|---|
| `app/image/image-workspace.js` | workspace state, work canvas, history, crop state, zoom/pan, image AI Capture domain |
| `app/image/image-ops.js` | pure canvas operations: rotate, flip, scale, crop, trim transparency |
| `app/image/image-bg-removal.js` | lazy MediaPipe SelfieSegmentation loader and alpha-mask background removal |
| `app/image/image-io.js` | drag/drop, file picker, PNG download, Edit in Image, Apply to attachment, Send to new slot |
| `tools/test-image-ops.js` | pure canvas operation tests |
| `tools/test-image-bg-removal.js` | background-removal masking tests |
| `tools/test-image-attachment-ai.js` | attachment round-trip and `window.ai` image tool tests |

### State

`state.imageEditor` stores:

```
{
  active,
  source: { canvas, width, height, origin, slotIndex, attachmentName },
  workCanvas,
  history, historyIndex,
  view: { scale, cx, cy },
  tool: "select" | "crop",
  cropRect, cropDrag,
  bgRemoval: { modelLoaded, modelLoading, threshold, feather }
}
```

If `source.origin === "attachment"`, Apply writes `workCanvas` back to
`getSlotAttachmentEntry(state.slots[source.slotIndex], source.attachmentName)`.
After mutating an attachment canvas, release the old GL texture when available,
call `syncSourceCanvasToActiveAttachment(slot)`, `refreshSlotUI()`,
`pushUndoCheckpoint(true)`, and `requestRender(...)`.

### AI bridge tools

The `window.ai` bridge exposes:

- `ai.image_load`
- `ai.image_crop`
- `ai.image_rotate`
- `ai.image_flip`
- `ai.image_scale`
- `ai.image_remove_bg`
- `ai.image_apply_to_attachment`
- `ai.image_export_png`

Image Workspace also registers the AI Capture domain `"image"` with snapshot,
diff, invariants, suspicions, and command coverage for UI operations such as
`image.load`, `image.crop`, `image.scale`, `image.remove_background`, and
`image.apply_to_attachment`.

### Validation

```bash
node tools/test-image-ops.js
node tools/test-image-bg-removal.js
node tools/test-image-attachment-ai.js
node tools/smoke-image-workspace.js
node tools/check-ai-capture-image.js
```
