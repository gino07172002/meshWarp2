# Architecture Guide

This document is for future AI agents and maintainers working in this project.

The codebase started as a single very large `app.js`. It has now been split into ordered classic browser scripts under [`app/`](/d:/claude/app/README.md). This is still a global-scope application, not an ES module application. Script order matters.

## What This App Is

This project is a browser-based 2D rigging / mesh deformation / animation editor inspired by Spine workflows.

Core capabilities:
- Slot and attachment management
- Bone rig editing and pose editing
- IK / Transform / Path constraints
- Mesh contour editing and weighted deformation
- Timeline editing, events, onion skin, animation layers
- State machine authoring and export bridge
- Project save/load/autosave
- Spine-oriented export helpers

## First Mental Model

Think of the app as six layers loaded in order:

1. `core`
Purpose:
- DOM references
- shared state
- math helpers
- base runtime / canvas setup
- bone system primitives

Files:
- [`app/core/runtime.js`](/d:/claude/app/core/runtime.js)
- [`app/core/bones.js`](/d:/claude/app/core/bones.js)

2. `workspace`
Purpose:
- workspace mode switching
- slot lifecycle
- attachment helpers
- mesh / contour authoring helpers
- constraint model normalization

Files:
- [`app/workspace/workspace.js`](/d:/claude/app/workspace/workspace.js)
- [`app/workspace/slots.js`](/d:/claude/app/workspace/slots.js)
- [`app/workspace/constraint-model.js`](/d:/claude/app/workspace/constraint-model.js)

3. `render`
Purpose:
- applying constraints to bones
- viewport and backdrop logic
- rendering to canvas
- canvas interaction helpers
- state machine bridge export helpers

Files:
- [`app/render/constraints.js`](/d:/claude/app/render/constraints.js)
- [`app/render/canvas.js`](/d:/claude/app/render/canvas.js)
- [`app/render/state-machine.js`](/d:/claude/app/render/state-machine.js)

4. `animation`
Purpose:
- animation data model
- track and timeline helpers
- timeline UI rendering and editing
- playback runtime and blending

Files:
- [`app/animation/model.js`](/d:/claude/app/animation/model.js)
- [`app/animation/timeline-ui.js`](/d:/claude/app/animation/timeline-ui.js)
- [`app/animation/runtime.js`](/d:/claude/app/animation/runtime.js)

5. `io`
Purpose:
- project import/export
- Spine export helpers
- diagnostics
- tree and file related bindings

Files:
- [`app/io/tree-bindings.js`](/d:/claude/app/io/tree-bindings.js)
- [`app/io/project-export.js`](/d:/claude/app/io/project-export.js)
- [`app/io/project-actions.js`](/d:/claude/app/io/project-actions.js)

6. `ui`
Purpose:
- editor panel bindings
- panel-specific actions
- hotkeys
- final bootstrap and pointer wiring

Files:
- [`app/ui/editor-panels.js`](/d:/claude/app/ui/editor-panels.js)
- [`app/ui/constraint-panels.js`](/d:/claude/app/ui/constraint-panels.js)
- [`app/ui/animation-panels.js`](/d:/claude/app/ui/animation-panels.js)
- [`app/ui/timeline-pointer.js`](/d:/claude/app/ui/timeline-pointer.js)
- [`app/ui/hotkeys.js`](/d:/claude/app/ui/hotkeys.js)
- [`app/ui/bootstrap.js`](/d:/claude/app/ui/bootstrap.js)

## Global Architecture Rules

This app still relies on shared globals. The most important ones are:
- `els`: all important DOM nodes
- `state`: app-wide mutable runtime and editor state
- `math`: shared helper math

Many functions assume these globals already exist. Do not move later-layer files above earlier-layer files without checking dependencies.

## Main State Buckets

The central state lives in [`app/core/runtime.js`](/d:/claude/app/core/runtime.js).

Important sections inside `state`:
- `state.mesh`
  Main rig/constraint/bone model.
- `state.slots`
  Visual slots, attachments, mesh contour data, per-slot transforms.
- `state.anim`
  Animations, tracks, playback, selection, timeline UI state, layers, state machine.
- `state.view`
  Zoom/pan and viewport placement.
- `state.vertexDeform`
  Vertex edit modes and temporary selection/pinning state.
- `state.history`
  Undo/redo snapshots.
- `state.autosave`
  Autosave lifecycle and last signature.

If you are changing behavior, first ask: is this persistent model state, transient UI state, or transient interaction state? Put it in the right bucket.

## How Data Flows

The common runtime loop is:

1. User action updates `state` or model objects.
2. UI binding calls helper functions.
3. Helpers may mark animation tracks dirty, rebuild geometry, or normalize constraints.
4. Rendering or playback samples current state.
5. UI refresh functions repaint panels/tree/timeline.

The common animation flow is:

1. Timeline or playback changes `state.anim.time`
2. [`samplePoseAtTime()`](/d:/claude/app/animation/runtime.js) applies animation values to the live model
3. Constraints are evaluated
4. Render functions draw the current scene

The common project I/O flow is:

1. Build project payload
2. Serialize to JSON or autosave envelope
3. Restore by routing through project load helpers rather than manually patching pieces

## Read This First For Common Tasks

If you need to work on these areas, start here:

- Workspace switching:
  [`app/workspace/workspace.js`](/d:/claude/app/workspace/workspace.js)

- Slot CRUD / attachments / slot mesh:
  [`app/workspace/slots.js`](/d:/claude/app/workspace/slots.js)

- Constraint data normalization:
  [`app/workspace/constraint-model.js`](/d:/claude/app/workspace/constraint-model.js)

- Constraint solving and viewport math:
  [`app/render/constraints.js`](/d:/claude/app/render/constraints.js)

- Canvas rendering:
  [`app/render/canvas.js`](/d:/claude/app/render/canvas.js)

- Timeline and animation data model:
  [`app/animation/model.js`](/d:/claude/app/animation/model.js)

- Timeline DOM rendering and key editing:
  [`app/animation/timeline-ui.js`](/d:/claude/app/animation/timeline-ui.js)

- Playback, blending, pose sampling:
  [`app/animation/runtime.js`](/d:/claude/app/animation/runtime.js)

- Project export / diagnostics:
  [`app/io/project-export.js`](/d:/claude/app/io/project-export.js)

- Button bindings / panel behavior:
  [`app/ui/editor-panels.js`](/d:/claude/app/ui/editor-panels.js)
  [`app/ui/constraint-panels.js`](/d:/claude/app/ui/constraint-panels.js)
  [`app/ui/animation-panels.js`](/d:/claude/app/ui/animation-panels.js)

- Bootstrap and canvas pointer wiring:
  [`app/ui/bootstrap.js`](/d:/claude/app/ui/bootstrap.js)

## Where To Put New Code

Use this rule of thumb:

- New shared state or base helpers:
  `app/core`

- Workspace, slot, mesh authoring, constraint model objects:
  `app/workspace`

- Rendering, viewport, draw overlays, interaction geometry:
  `app/render`

- Tracks, timeline logic, playback logic:
  `app/animation`

- Save/load/export/diagnostics:
  `app/io`

- DOM event handlers, panel-specific UI wiring, keyboard shortcuts:
  `app/ui`

Avoid putting new business logic directly into the final bootstrap file unless it is truly startup-only.

## Important Design Constraints

This project is intentionally still using classic scripts, not imports/exports.

That means:
- Top-level declaration order matters
- Globals are shared across files
- Renaming or moving functions can break later files silently if load order changes

When changing structure:
- update [`index.html`](/d:/claude/index.html)
- update [`app/README.md`](/d:/claude/app/README.md)
- keep load order stable unless you intentionally restructure dependencies

## Safe Editing Strategy

When making behavior changes:

1. Find the domain file first.
2. Confirm whether the change affects only UI bindings, only model logic, or both.
3. Prefer changing lower-level helpers first, then adjusting UI bindings.
4. If a change affects persistence, verify save/load and autosave together.
5. If a change affects animation, verify both manual key editing and playback.

## High-Risk Areas

Be extra careful in these areas:

- Attachment and slot mesh data copying
  Reason: multiple helpers propagate state between slot-level and attachment-level fields.

- Constraint order and normalization
  Reason: Path / Transform / IK interaction depends on consistent ordering and valid references.

- Timeline key mutation
  Reason: selection, clipboard, key normalization, and playback all depend on consistent track data.

- Undo / autosave / project load
  Reason: many workflows route through serialized project payloads.

- Canvas pointer interaction
  Reason: drag state is shared and mode-dependent.

## Bootstrap Sequence

Startup effectively ends in [`app/ui/bootstrap.js`](/d:/claude/app/ui/bootstrap.js).

That file:
- binds canvas pointer handlers
- binds wheel / resize behavior
- initializes workspace and panel setup
- seeds initial runtime values from DOM
- installs autosave restore
- starts render loop

If the app "starts broken", check the final load order and this file first.

## Recommended Verification After Changes

For any non-trivial change, verify at least:

1. Page loads without `ReferenceError`
2. Workspace switching still works
3. Slot selection and bone selection still update right-side panels
4. Timeline rendering still appears
5. Save/load still works for the edited feature
6. If render logic changed, pan/zoom and selection overlays still behave

## Current Structural Goal

The current structure is intentionally "modular enough to navigate" but not micro-split.

The stopping rule used in this refactor was:
- each file should have a clear primary responsibility
- most files should stay roughly in the few-hundred to low-thousand line range
- avoid over-fragmenting tightly coupled logic

If you want to modernize further in the future, the next major step would be real ES module boundaries. That would be a larger refactor and should be treated separately from normal feature work.
