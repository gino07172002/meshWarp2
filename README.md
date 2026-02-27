# Web Spine-like Mesh Deformer

A Spine-like 2D animation editor prototype built with `WebGL + HTML + JavaScript`.

Status note: this document is synced to the current codebase as of `2026-02-27`.

## Quick Start

1. Run a static server in this folder:
   - `python -m http.server 5173`
2. Open:
   - `http://localhost:5173`
3. Use top toolbar:
   - `File`: New / Import Image-PSD
   - `Project`: Save Project / Load Project
   - `Export`: Spine runtime compatibility + Export Spine

## Current Capabilities

### 1. Workspace and edit modes

- Workspace tabs: `Slot Build`, `Rig`, `Animate`.
- Tool tabs: `Setup`, `Rig`, `IK`, `Constraint`, `Path`, `Skin`, `Tools`, `Slot Mesh`.
- Edit modes:
  - `Skeleton`
  - `Vertex`
  - `Slot Mesh`

### 2. Rig and constraints

- Multi-bone hierarchy and parent editing.
- Rig edit vs pose animate workflow.
- Bone inherit modes:
  - `normal`
  - `onlyTranslation`
  - `noRotationOrReflection`
  - `noScale`
  - `noScaleOrReflection`
- IK constraints:
  - 1-bone and 2-bone
  - target bone picking
  - bend direction
  - mix, softness, compress, stretch, uniform, skin-required
- Transform constraints:
  - constrained bone list
  - local/relative options
  - rotate/translate/scale/shear mix + offsets
- Path constraints:
  - drawn path and slot-based source
  - target slot or target bone chain
  - position/spacing/rotate/translate mix

### 3. Slot, attachment, and mesh authoring

- Slot-based authoring with attachment management:
  - add / delete / rename / load image
  - placeholder assignment
  - linked mesh attachment options
  - sequence metadata
- Slot clipping controls:
  - enable clipping
  - clip source (`fill`/`contour`)
  - clip end slot
  - clip-related timeline keys
- Slot visual controls:
  - blend mode (`normal` / `additive` / `multiply` / `screen`)
  - dark tint toggle + dark color
- Slot mesh workflow:
  - contour drawing
  - triangulate
  - grid fill
  - edge link/unlink
  - apply/reset
- Slot weighting:
  - single-bone
  - weighted auto bind
  - free mode

### 4. Timeline and animation

- Multi-animation timeline with grouped track list.
- Keyframe operations:
  - add/update/delete
  - move (drag)
  - copy/paste
  - jump previous/next key
- Interpolation:
  - linear
  - stepped
  - bezier curve editor
- Track coverage:
  - bone transforms (`translate`, `rotate`, `length`, `scaleX/Y`, `shearX/Y`)
  - vertex deform
  - IK / transform / path constraint properties
  - slot attachment / clip / color
  - draw order
  - event track
  - animation layer tracks
  - state machine parameter tracks
- Animation blending:
  - `Mix To` crossfade
  - layer tracks with alpha, speed, offset, mode, and bone mask
- Loop helpers:
  - `Loop Seam`
  - `Loop PingPong`

### 5. Reliability and tooling

- Undo / redo stack (toolbar and hotkeys).
- Autosave interval snapshots with startup recovery prompt.
- Diagnostics panel:
  - run project checks
  - include export checks
  - safe auto-fix for selected issues
- Command palette for commands/hotkeys discovery.

### 6. State machine workflow

- Animation state machine authoring:
  - states
  - transitions
  - parameters (`float` / `bool`)
  - conditions and transition duration
- Runtime bridge metadata/code export:
  - bridge JSON
  - integration sample snippets

### 7. Save/load and export

- Project JSON save/load with embedded slot images.
- Spine export:
  - `.json`
  - `.skel` (binary)
  - `.atlas`
  - `.png` (atlas page)
- Spine compatibility presets:
  - `4.2`
  - `4.1`
- Preview export:
  - WebM
  - GIF
  - PNG sequence (batch)
- Built-in export validation and warning messages.

## Hotkeys (core)

- View: `+/-` zoom, `0` fit view.
- Bone tools: `G`/`T`/`R`, `C`, `P`, `Shift+A`, `[`/`]`.
- Timeline: `I`/`K`, `Space`, `,`/`.`.
- Vertex/mesh helpers: proportional edit toggle, edge link/unlink, triangulate, selection helpers.

## Limitations

- Prototype architecture is still mostly single-file (`app.js`).
- No Spine project import pipeline yet (`.json/.skel/.atlas` to editor scene).
- No Spine physics constraints workflow yet.
- Slot visual parity is partial: setup blend/dark + JSON two-color export are in place, but full runtime equivalence validation (especially `.skel` timeline path) is still ongoing.
- No audio waveform/lip-sync authoring workflow yet.
- Mesh generation is mostly contour/grid-driven (not full automatic alpha cutout pipeline).
- Atlas packing is currently basic single-page packing (no advanced multi-page/rotation/trim options).
- PSD import depends on CDN availability (`ag-psd`).

## Next Priorities

1. Spine parity gaps:
   - stronger deform/path/clip edge-case parity
   - slot visual runtime-equivalence validation (`blend`/`twoColor`, including binary path)
2. Pipeline interoperability:
   - Spine import pipeline (`json/skel/atlas`)
   - asset relink/repath workflow for large projects
3. Production features:
   - physics/secondary motion helpers
   - audio waveform/lip-sync tooling
4. Export quality and maintainability:
   - advanced atlas packing options
   - modularization of monolithic `app.js`
   - deterministic export fixture tests

## Development Docs

- Gap tracking: `SPINE_FEATURE_GAP.md`
- Verification checklist/playbook: `DEVELOPMENT_VERIFICATION_GUIDE.md`
- PR template: `.github/PULL_REQUEST_TEMPLATE.md`
