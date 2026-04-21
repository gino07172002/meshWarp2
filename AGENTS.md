# AGENTS.md — AI/MCP Agent Reference

This file is the authoritative quick-reference for any AI agent (Claude Code, Codex, MCP tool, etc.) working on this codebase.
Read this before touching any slot/attachment/render/animation code.

---

## 1. Project Overview

A browser-based 2D skeletal animation editor (Spine2D-compatible).
Stack: vanilla JS ES modules (no bundler), HTML5 Canvas 2D, WebGL (in progress).
Entry: `index.html` → loads scripts in order via `<script type="module">`.

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

## 3. Key Files & Responsibilities

| File | Responsibility |
|------|---------------|
| `app/workspace/workspace.js` | Slot & attachment data model, normalization, ATTACHMENT_TYPES, helpers |
| `app/workspace/slots.js` | Slot operations: ensureSlotMeshData, getActiveAttachment, weight helpers |
| `app/core/bones.js` | UI refresh: `refreshSlotUI()`, `refreshSlotPanel()`, `refreshAttachmentPanel()`, bone tree render, inline rename |
| `app/core/runtime.js` | DOM element refs (`els`), global `state` object, initial state values |
| `app/io/tree-bindings.js` | Bone tree event handlers: click, dblclick, contextmenu, drag (slot + attachment), attachment CRUD |
| `app/io/project-export.js` | Save/export, schema v2 |
| `app/io/project-actions.js` | Load, legacy upgrade |
| `app/render/canvas.js` | Main 2D render loop: `renderSlots2DWithClipping`, `buildRenderableAttachmentGeometry` |
| `app/render/constraints.js` | `buildSlotGeometry` (mesh deform), `buildRegionAttachmentGeometry`, weight skinning |
| `app/animation/model.js` | Track ID format: `slot:<idx>:attachment:<name>:deform` |
| `app/animation/timeline-ui.js` | Timeline track labels |
| `app/ui/editor-panels.js` | Attachment context menu button bindings |
| `app/ui/hotkeys.js` | Keyboard shortcuts: A=add att, Shift+A=dup, Tab=cycle, Del=delete |
| `index.html` | Panel HTML: `#slotPropsGroup` (slot) + `#attachmentPropsGroup` (attachment) |
| `styles.css` | CSS type-gating: `#attachmentPropsGroup.att-type-<type> [data-att-type~="<type>"]` |

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

## 10. Validation Tools

Run after any change to verify no regressions:

```bash
node tools/check-legacy-slot-mesh.js         # no direct slot.meshData access
node tools/check-legacy-project-upgrade.js   # v1→v2 upgrade works
node tools/check-region-attachment-render-path.js
node tools/check-import-default-mesh.js
node tools/check-stale-dom-hooks.js
node tools/check-cache-busting-assets.js
node --check app/core/bones.js               # (repeat for any modified JS)
```

All of the above must pass before committing.

---

## 11. Remaining Work (as of 2026-04-21)

| Area | Status | Notes |
|------|--------|-------|
| Phase 4: panel split | Done | `refreshAttachmentPanel` + CSS type-gating |
| Phase 5: attachment tree UX | Done | inline rename, drag reorder (same+cross slot) |
| Phase 6: hotkeys | Done | A/Shift+A/Tab/Delete |
| Phase 7: deform tracks | Done | `slot:<i>:attachment:<n>:deform` format |
| `openAttachmentTypePicker` | Done | async modal popup with 6 button grid |
| LinkedMesh cross-slot parent | Done | `slotId::attachmentName` format, backward-compat |
| BoundingBox/Clipping gizmos | Done | draggable vertex handles on contour.points |
| Point attachment gizmo | Done | move handle + rotation tip handle |
| Ghost attachment outlines | Done | non-active attachments shown as dashed outlines |
| Browser smoke test | Not done | Must manually verify mesh display, attachment switching, linkedmesh, clipping, timeline sync |
| WebGL render path | Separate spec | See `docs/superpowers/specs/2026-04-20-webgl-support-diagnostics-design.md` |

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
