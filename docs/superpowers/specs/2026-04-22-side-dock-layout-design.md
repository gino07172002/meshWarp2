# Side Dock Layout Design

**Date:** 2026-04-22
**Goal:** Let the left and right editor side panels be draggable between sides, reorderable within a side, and collapsible as whole side rails that free more canvas space, while preserving the current visual design language and persisting layout across reloads.

## Problem

The current editor layout has a fixed left tools column and a fixed right column split into tree and props. Widths are resizable, but panel placement is static:

- left-side tools cannot move to the right
- right-side tree/props cannot move to the left
- panels cannot be reordered within a side
- collapse behavior is currently interpreted as panel-body folding, not whole-side collapse
- there is no reset-to-default layout action

The requested behavior is a dock-style layout with persistence, but without redesigning the UI. Existing colors, borders, gradients, typography, control styling, and overall panel look should remain intact.

## Current Context

Relevant current structure:

- `index.html`
  - `#leftTools`
  - `#rightCol`
  - `#rightTree`
  - `#rightProps`
  - `#leftResizer`
  - `#rightResizer`
  - `#rightColResizer`
- `styles.css`
  - app grid and side-column layout
  - left/right panel styling
  - existing collapsed and resizer styles
- `app/core/runtime.js`
  - `els` DOM references
  - shared `state`
- `app/ui/hotkeys.js`
  - current left/right column width resizers

The existing center canvas/stage layout should stay fixed in the middle. This task only changes side-panel docking behavior.

## Proposed Approach

Adopt a two-side dock stack model:

- keep one dock stack on the left side of the canvas
- keep one dock stack on the right side of the canvas
- allow each dockable panel to move between those two stacks
- allow vertical reordering within a stack
- do not support floating windows
- do not support nested dock groups or arbitrary extra columns

This matches the requested flexibility while staying close to the current structure and minimizing risk to the existing UI.

## Dockable Panels

Initial dockable panel set:

- `leftTools`
- `rightTree`
- `rightProps`

Default layout:

- left stack: `leftTools`
- right stack: `rightTree`, then `rightProps`

The stage remains in the center. Existing width resizers keep working at the column level. The existing right-side internal height split becomes standard vertical ordering in the right dock stack.

## Side Collapse Model

Collapse is defined at the side level, not the individual panel-body level.

- collapsing the left side shrinks the whole left dock stack into a narrow vertical rail
- collapsing the right side shrinks the whole right dock stack into a narrow vertical rail
- the center stage immediately grows because the corresponding side width is reduced
- the rail remains visible as the restore affordance
- if a side has no dock panels, no rail should be shown and no collapsed width should be reserved

The recommended collapsed width is a small fixed rail such as `36px`, while expanded width restores the side's previous width.

## Interaction Design

Each dockable panel gets a lightweight dock header that uses existing panel styling tokens instead of introducing a new visual theme. The header contains:

- a drag handle area used exclusively for drag start
- the panel title
- a side collapse/expand toggle

Panel content remains unchanged below that header.

Drag behavior:

- dragging starts only from the dock handle area
- dragging over a stack shows a simple insertion indicator
- dropping on a stack moves the panel to that side and index
- dropping within the same stack reorders the panel

Collapse behavior:

- collapsing any panel on the left side collapses the whole left dock side into a narrow rail
- collapsing any panel on the right side collapses the whole right dock side into a narrow rail
- the rail uses the existing dark panel styling language, just reduced to a slim vertical strip
- expanding restores the whole side in place, including panel order
- expanding restores the side width that existed before collapse instead of forcing a default width

Drag and collapse should not fight each other:

- dragging still starts only from the drag handle
- side collapse/expand uses a separate button
- collapsing is not triggered by the drag handle or any drag gesture

To minimize visible UI change, reset is exposed through the existing `View` menu as `Reset Layout`. No new always-visible reset button is required.

## Persistence Model

Persist layout in `localStorage`, separate from project save data.

Suggested stored shape:

```js
{
  version: 1,
  sides: {
    left: { collapsed: false, expandedWidth: 260 },
    right: { collapsed: false, expandedWidth: 340 }
  },
  panels: {
    leftTools: { side: "left", order: 0 },
    rightTree: { side: "right", order: 0 },
    rightProps: { side: "right", order: 1 }
  }
}
```

Rules:

- load persisted layout during startup
- validate all stored panel ids and sides before applying
- validate stored side widths and clamp them to a sane range
- if data is missing or invalid, fall back to defaults
- if a side is collapsed, remember its last expanded width separately
- `Reset Layout` clears the saved layout and reapplies defaults immediately

This layout state does not belong in project JSON export/import. It is editor-local preference, not animation content.

## DOM / CSS Strategy

Preserve the existing look by reusing current panel classes and only adding minimal structural classes for docking.

Expected additions:

- dock stack wrappers for left and right sides
- dock panel wrapper class for each movable panel
- dock header and dock body sub-elements
- collapsed side rail class for left and right sides
- CSS classes for:
  - dragging state
  - drop indicator
  - collapsed dock side
  - collapsed rail label / restore affordance

Non-goals for styling:

- no new color system
- no panel redesign
- no typography changes
- no spacing overhaul

Any new controls should inherit the current button and panel treatment so they blend into the current UI.

## State and Helper Functions

Add a small layout subsystem responsible for:

- reading persisted layout
- normalizing it against known dock panel ids
- rendering the current dock order into DOM
- updating persistence after drag, side collapse, side expand, resize, or reset

This should stay isolated from slot/attachment/project data. It is UI state only.

Suggested responsibilities:

- `getDefaultDockLayout()`
- `readDockLayout()`
- `writeDockLayout(layout)`
- `resetDockLayout()`
- `applyDockLayout(layout)`
- `setDockSideCollapsed(side, collapsed)`
- `rememberDockSideWidth(side, width)`

## Compatibility Constraints

- do not change slot, attachment, bone, animation, or render data models
- do not break existing left/right width resizers
- do not break existing panel event bindings inside `leftTools`, `rightTree`, or `rightProps`
- do not change existing color and style language
- do not move the stage out of the center column
- do not leave collapsed sides occupying their previous expanded width

## Risks

- refactoring the right column from a fixed tree/props split into dock items can disturb existing sizing assumptions
- side collapse can conflict with width resizers if expanded width is not tracked separately
- drag interactions can interfere with panel controls if drag start is too broad
- invalid persisted layout can leave panels missing or duplicated if not normalized carefully

## Mitigations

- restrict drag start to a small explicit handle area
- keep dock rendering centralized and id-driven
- validate persisted layout against known panel ids on every load
- clamp and sanitize persisted expanded widths
- fall back to defaults on any invalid or partial layout state
- leave panel internals untouched and move only their outer wrappers
- if a user drags a resizer on a collapsed side, auto-expand first and then continue resizing

## Acceptance Criteria

- users can collapse and expand the whole left side into a narrow rail
- users can collapse and expand the whole right side into a narrow rail
- users can drag any of those panels to the left or right side
- users can reorder panels within the same side
- current layout persists after page reload via `localStorage`
- collapsed sides restore to their previous expanded width when reopened
- `View > Reset Layout` restores the default arrangement immediately
- the center stage remains in place
- collapsing a side visibly gives more width back to the center stage
- the existing visual style and color palette remain effectively unchanged
- current resizers and existing panel functionality still work
