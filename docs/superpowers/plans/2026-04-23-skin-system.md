# Plan: Skin System Completion

**Date:** 2026-04-23

---

## What Spine Skins Do

In Spine2D, a **skin** is a named set of slot→attachment overrides. The runtime loads the skeleton once; switching skins swaps which attachment is visible in each slot. Example use-cases:

- Character outfits (casual / armored / wizard)
- Face expressions if face parts are slots
- Multi-character variants from one skeleton
- Constraint toggles per skin (e.g., enable IK only when shoes are on)

Spine skins are **purely name-maps**: `{slotName: {placeholderName: attachmentObject}}`. They do *not* store per-skin mesh deforms (those go in the deform timeline), position overrides, or visibility states. Each attachment's geometry is global; skins just decide which attachment name is "active" in a slot.

---

## Current State

### What works
| Feature | Status |
|---------|--------|
| `state.skinSets[]` with id/name/slotAttachments/constraints | ✅ |
| `captureCurrentSkinMap()` / `captureCurrentSkinPlaceholderMap()` | ✅ |
| `applySkinSetToSlots(skin)` — swaps `slot.activeAttachment` + constraints | ✅ |
| `ensureSkinSets()` — ensures ≥1 skin, normalizes, creates "default" | ✅ |
| `addSkinSetFromCurrentState()` / `captureSelectedSkinSetFromCurrentState()` | ✅ |
| Export to Spine JSON `skins` array | ✅ |
| Import from Spine JSON (project-actions.js) | ✅ |
| Attachment rename/delete propagates into skin maps (tree-bindings.js) | ✅ |
| Constraint `skinRequired` flag + skin constraint enable/disable on apply | ✅ |
| Side-panel UI: select/add/delete/rename/capture/apply | ✅ |
| Topbar UI: activeSkinSelect + capture/apply/add buttons | ✅ |

### What's missing or broken
| Gap | Impact |
|-----|--------|
| **No "active skin" tracking at runtime** — `state.selectedSkinSet` tracks which skin is *selected in the panel*, not which is *currently applied*. Selecting vs applying are conflated. | UI shows wrong skin as "current" |
| **No auto-apply on skin select** (in left panel) — user must click Apply after selecting | Confusing UX |
| **`applySkinSetToSlots` skips slots with no canvas** (line 409: `if (!att || !att.canvas) continue`) — slots that have been assigned an attachment name but have no loaded image are silently skipped | Skins with image-free slots (bounding boxes, paths, points) don't fully apply |
| **Skin panel shows all slots' attachments, not skin-specific diff** — no visual diff between "what this skin overrides" vs "default" | Hard to understand what a skin changes |
| **No "add attachment to skin" action** — to add a new variant attachment for a skin, user must add it globally to the slot; there's no skin-scoped add | Missing workflow |
| **Skin not applied on project load** — `selectedSkinSet` is restored but `applySkinSetToSlots` is not called after load | Wrong attachments show after loading |
| **Skins not synced after attachment add/delete in tree** — `tree-bindings.js` syncs renames/deletes but not additions; new attachments are not automatically captured into the active skin | Skins can become stale |
| **Duplicate skin** missing | Minor convenience |
| **No status indicator** showing which skin is currently live on the canvas | Confusing when working with multiple skins |

---

## What We Will Build

Scope: close the UX/logic gaps. Do NOT add per-skin mesh deform variants (that belongs to the animation system). Do NOT add per-skin attachment transform overrides (not in Spine spec). Stay within what Spine's skin model means.

---

## Implementation Plan

### Phase 1 — Runtime: separate "selected" from "active" skin

**Problem:** `state.selectedSkinSet` does double-duty (which skin is highlighted in panel AND which is applied). These must be separate.

**Changes:**

**`app/core/runtime.js`**
- Add `state.activeSkinSetId: null` — the ID of the skin currently applied to slots
- Keep `state.selectedSkinSet` as the panel selection index

**`app/animation/model.js`**
- In `applySkinSetToSlots(skin)`: after applying, set `state.activeSkinSetId = skin.id`
- In `refreshSkinUI()`: mark the dropdown option that matches `state.activeSkinSetId` with a visual indicator (e.g., append `" ●"` to its label, or set a CSS class on the `<option>`)
- In `ensureSkinSets()`: if `state.activeSkinSetId` is null, set it to the first skin's id

### Phase 2 — Auto-apply on skin select in left panel

**`app/ui/editor-panels.js`**
- In the `skinSelect` change handler: after updating `state.selectedSkinSet`, call `applySelectedSkinSetWithStatus()`
- This makes the left panel behave like the topbar's `activeSkinSelect` (which already auto-applies)

### Phase 3 — Fix `applySkinSetToSlots` skipping non-canvas attachments

**`app/animation/model.js` — `applySkinSetToSlots`**

Current guard `if (!att || !att.canvas) continue` is wrong for non-image attachment types (bounding box, path, point, clipping). These attachments are valid without a canvas.

Replace with a type-aware check: skip only if the attachment entry doesn't exist at all.

```js
// before:
const att = getSlotAttachmentEntry(s, next);
if (!att || !att.canvas) continue;

// after:
const att = getSlotAttachmentEntry(s, next);
if (!att) continue;
```

### Phase 4 — Apply active skin on project load

**`app/io/project-actions.js`** (or wherever project load completes)

After `state.skinSets` and `state.selectedSkinSet` are restored from the project file, call:
```js
const skin = getSelectedSkinSet();
if (skin) applySkinSetToSlots(skin);
```

This ensures the correct skin is visible immediately after load, matching the saved state.

### Phase 5 — Skin diff view in left panel

**Goal:** show which slots are overridden by the selected skin vs the "default" skin, so the user can see what a skin changes at a glance.

**`index.html`** — inside `#leftSkinTools`, add a `<div id="skinDiffList">` below the capture/apply buttons.

**`app/animation/model.js` — new function `renderSkinDiffList()`**
- Get the selected skin and the default skin
- For each slot: compare `skin.slotAttachments[slotId]` vs `defaultSkin.slotAttachments[slotId]`
- Render rows: slot name → attachment name. Highlight rows where the skin overrides the default. Grey out rows where the skin matches default or has no override.
- Called from `refreshSkinUI()`

**`styles.css`** — minimal diff-list styling: monospace rows, highlight color for overrides, muted for matches.

### Phase 6 — Duplicate skin action

**`index.html`** — add `<button id="skinDupBtn">Dup Skin</button>` next to skinAddBtn/skinDeleteBtn

**`app/animation/model.js`**
```js
function duplicateSkinSet() {
  const skin = getSelectedSkinSet();
  if (!skin) return null;
  const copy = {
    id: makeSkinSetId(),
    name: skin.name + "_copy",
    slotAttachments: { ...skin.slotAttachments },
    slotPlaceholderAttachments: JSON.parse(JSON.stringify(skin.slotPlaceholderAttachments || {})),
    constraints: JSON.parse(JSON.stringify(skin.constraints || {})),
  };
  ensureSkinSets().push(copy);
  state.selectedSkinSet = state.skinSets.length - 1;
  refreshSkinUI();
  return copy;
}
```

**`app/ui/editor-panels.js`** — wire `skinDupBtn` click → `duplicateSkinSet()`

### Phase 7 — Active skin status indicator (topbar)

**Goal:** user always knows which skin is applied to the canvas.

**`index.html`** — add a `<span id="activeSkinLabel">` in the topbar workspace group next to the `activeSkinSelect`, showing "Active: {name}" or "(no skin)" in a muted style.

**`app/animation/model.js` — `refreshSkinUI()`**
- Set `els.activeSkinLabel.textContent` to the active skin's name (looked up via `state.activeSkinSetId`)
- If no skin is applied yet, show a muted "(none applied)" text

**`styles.css`** — `.active-skin-label { color: #94a3b8; font-size: 11px; }`

---

## Files Changed

| File | Changes |
|------|---------|
| `app/core/runtime.js` | Add `state.activeSkinSetId` |
| `app/animation/model.js` | `applySkinSetToSlots` fix + set activeSkinSetId; `refreshSkinUI` add active indicator; `duplicateSkinSet`; `renderSkinDiffList`; auto-apply on load |
| `app/io/project-actions.js` | Call `applySkinSetToSlots` after project load |
| `app/ui/editor-panels.js` | Auto-apply on skinSelect change; wire skinDupBtn |
| `index.html` | Add `#skinDupBtn`, `#skinDiffList`, `#activeSkinLabel` |
| `styles.css` | Diff-list styles, active skin label style |

---

## Out of Scope

- Per-skin mesh deform variants (store different vertex positions per skin) — this requires the animation deform timeline, not skin data
- Per-skin attachment transform overrides — not in Spine spec
- Per-skin attachment roster (attachment exists in skin A but not B) — needs deeper architecture change
- Skin constraint UI (manually toggle which constraints per skin) — can follow separately

---

## Verification

1. `node --check` on all modified JS files
2. Manual: create 2 skins with different active attachments → switch between them → both apply correctly, including non-canvas attachments
3. Manual: save project → reload → correct skin is visible immediately
4. Manual: duplicate skin → rename → capture → apply; verify it's independent from the original
5. Manual: diff list shows correct overrides vs default
