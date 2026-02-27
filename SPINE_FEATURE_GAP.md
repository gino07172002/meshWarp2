# Spine2D Feature Gap (Current Prototype)

This document tracks parity status against Spine editor/runtime workflows.

Status note: synced to current code behavior as of `2026-02-27`.

## Baseline: Already Implemented

### 1. Authoring reliability

- Undo/redo command stack for major editor operations.
- Autosave snapshots + startup recovery prompt.
- Diagnostics panel with:
  - in-editor integrity checks
  - export validation checks
  - safe auto-fix actions
- Command palette and hotkey command discovery.

### 2. Rig and transforms

- Multi-bone hierarchy and parent/child chain editing.
- Rig edit vs pose animate mode.
- Bone inherit modes:
  - `normal`
  - `onlyTranslation`
  - `noRotationOrReflection`
  - `noScale`
  - `noScaleOrReflection`
- Bone channels:
  - `x/y`, `rotation`, `length`
  - `scaleX/scaleY`
  - `shearX/shearY`

### 3. Constraint stack

- IK constraints:
  - 1-bone / 2-bone
  - target bone
  - bend direction
  - mix, softness, compress, stretch, uniform
  - skin-required toggle
- Transform constraints:
  - target + constrained bones
  - local/relative
  - rotate/translate/scale/shear mixes and offsets
  - skin-required toggle
- Path constraints:
  - drawn path / slot contour source / bone-chain source
  - target slot generation for export
  - position/spacing/rotate/translate controls
  - skin-required toggle

### 4. Animation and runtime workflow

- Timeline tracks for bones, constraints, slots, deform, draw order, events.
- Key interpolation: linear/stepped/bezier.
- Animation mix and layered blending tracks.
- Loop helpers: seam/ping-pong tools.
- State machine authoring:
  - states
  - transitions
  - parameters
  - transition conditions/duration
- Runtime bridge export (state machine metadata + sample code).

### 5. Save/load and export

- Project save/load (JSON, embedded assets/metadata).
- Spine export pipeline (`json/skel/atlas/png`) with `4.1/4.2` presets.
- Preview export workflows (WebM/GIF/PNG sequence batch).
- Export-time diagnostics and compatibility warnings.
- Slot visual setup parity now includes:
  - slot blend mode (`normal`/`additive`/`multiply`/`screen`) authoring + export
  - dark color (two-color setup) authoring + save/load + export
  - slot color key export supporting `twoColor` rows in Spine JSON when dark tint is used

## High Priority Gaps (Spine Parity)

1. Slot rendering parity
- Add validation that slot visual channels are runtime-equivalent.
- Harden binary `.skel` slot visual timeline parity (especially `twoColor` animation path).

2. Spine import and round-trip
- Add import pipeline for Spine data (`.json/.skel/.atlas`) into editor scene.
- Preserve skins/attachments/constraints/events/state mapping during import.
- Add round-trip tests (import -> edit -> export).

3. Skin system parity depth
- Expand skin workflow beyond slot-attachment mapping to include bones/constraints skin behavior parity where needed.
- Strengthen linked mesh and per-skin attachment edge-case handling.

4. Sequence workflow parity
- Sequence metadata exists, but sequence-focused animation authoring/timeline controls are still limited.
- Add explicit sequence playback behavior tooling and validation.

5. Export robustness (path/deform/clip edge cases)
- Improve deterministic coverage for path+clip+deform combinations.
- Reduce skipped path export cases by stronger pre-export authoring guards.
- Harden binary `.skel` compatibility checks for deform-heavy assets (currently marked experimental in status text).

## Medium Priority Gaps

1. Production motion features
- Add Spine-like physics/secondary motion authoring workflow.
- Add optional spring/inertia helpers for rapid iteration.

2. Asset pipeline quality
- Improve atlas packing beyond current basic single-page strategy:
  - multi-page output
  - optional rotation
  - trim/padding/bleed controls
- Add attachment relink/repath tools for moved assets.

3. Audio workflow
- Add audio waveform-assisted timing workflow.
- Add lip-sync/event timing aids tied to timeline.

4. Maintainability and scale
- Break up monolithic `app.js` into domain modules.
- Expand deterministic fixture-based tests for export/import compatibility.

## Lower Priority UX Improvements

- Richer multi-selection and filter tools for large rigs.
- Bone visibility/selectability lock layers.
- Additional discoverability for advanced commands/hotkeys.

## Compatibility Notes

- Closest target format is Spine 4.1/4.2 style data, but editor behavior still has custom assumptions.
- Runtime parity should still be validated per project, especially for:
  - slot visual channels (blend/two-color across JSON and binary runtime paths)
  - clip + deform combinations
  - path constraints generated from contour data
  - layered animation blending assumptions

## Reference Docs

- Bones: https://esotericsoftware.com/spine-bones
- Constraints: https://esotericsoftware.com/spine-constraints
- IK constraints: https://esotericsoftware.com/spine-ik-constraints
- Transform constraints: https://esotericsoftware.com/spine-transform-constraints
- Path constraints: https://esotericsoftware.com/spine-path-constraints
- JSON format: https://esotericsoftware.com/spine-json-format
- API inherit modes: https://esotericsoftware.com/spine-api-reference
