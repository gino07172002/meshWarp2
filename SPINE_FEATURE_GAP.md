# Spine 4.x feature parity

Tracks parity status against Spine editor + runtime workflows.
Last updated: `2026-04-26`.

## Implemented

### Authoring
- Undo/redo command stack
- Autosave snapshots + startup recovery
- Diagnostics panel (integrity checks + export validation + auto-fix)
- Command palette (Ctrl/Cmd+K)
- Pose-tool relative numeric entry (`+10`, `-5`, `*2`, `/3` on bone fields)

### Skeleton
- Multi-bone hierarchy with drag-drop reorder
- All 5 inherit modes: `normal` / `onlyTranslation` / `noRotationOrReflection` / `noScale` / `noScaleOrReflection`
- Full bone channels: x/y, rotation, length, scaleX/Y, shearX/Y
- Rig edit vs pose animate separation
- Bone color (editor visualisation)
- Bone Compensation toggle (preserve descendant world transforms when parent moves)
- Bone length lock in animate mode (Spine / Blender semantics)

### Slots & attachments
- Slot management (create/delete/z-order, drag-drop reorder)
- Slot alpha, color, dark color (two-color tint, runtime shader)
- 4 blend modes: normal / additive / multiply / screen
- 6 attachment types: Region, Mesh, Linked Mesh (with `inheritTimelines`),
  Bounding Box, Clipping Path, Point
- Sequence attachments — frame index timeline (Hold / Once / Loop / Pingpong)

### Mesh / FFD
- Vertex editing: Proportional Edit, Mirror Edit, pin/unpin, relax, delete
- Auto-Foreground tracing from alpha (with thresholds + detail)
- Auto-triangulate, Grid Fill, Reset to Grid
- Mesh micro-tools: Subdivide, Centroid, Flip Edge, Generate by Area
- Hard / Soft / Free vertex binding
- Auto Weight (single bone / multi-bone strategies)
- Weight paint brush — 4 modes (add / remove / replace / smooth) + bone lock
- Weight heatmap (GPU)
- Prune / Weld / Swap / Update Bindings

### Constraints
- **IK** — 1-bone & 2-bone; mix / softness / compress / stretch / uniform
- **Transform** — per-channel mix, offsets, local mode, relative mode
- **Path** — Bezier path; drawn / slot-contour / bone-chain sources;
  position / spacing / rotation mix
- **Physics (Spine 4.2)** — semi-implicit Euler solver; spring + damping
  + wind/gravity; per-bone state reset; full UI

### Animation
- Tracks: bone / slot / constraint / deform / drawOrder / event
- Interpolation: linear / stepped / bezier (with control handles)
- Auto-key
- **Onion skin** — keyframes-only mode, pixels-per-frame motion vectors
- Loop helpers (seam / ping-pong)
- Animation Layers (with bone mask blending)
- State Machine — states / transitions / parameters / conditions + bridge export
- Animation list reorder (Move Up / Move Down)
- **Audio events with waveform render** on the event track lane

### Skins
- Create, delete, apply, capture, **reorder**
- Skin scope: skin-level bones + folder fields, runtime visibility filtering

### Export
- Spine JSON (4.1 / 4.2 compat presets)
- Spine SKEL binary
- **Atlas advanced packing**: shelf packer with multi-page, rotation,
  trim, bleed, configurable padding
- PNG (one per atlas page)
- Preview: WebM, GIF, PNG sequence (batch)

### Import
- Native project JSON (with embedded image data URLs)
- **Spine JSON import (v1)** — bones, slots, weighted meshes, animations
  (matches slots by name onto an existing project)
- PNG / JPG / WebP / PSD (via ag-psd)
- Humanoid Auto-Rig (TensorFlow.js + MediaPipe pose detection)

### Rendering
- WebGL primary path: stencil-based clip-slot masking, base reference
  textured quad, two-color tint shader, GPU weight heatmap
- Per-frame render perf instrumentation (`debug.timing()`)

### Diagnostics
- `window.debug.*` namespace for state introspection
- Action log ring buffer (200 entries) for bug repro
- Auto-captured exceptions (window.onerror + unhandledrejection)

## Caveats / partial

| Area | Status | Notes |
|---|---|---|
| Spine import — linked meshes | partial | Logs warning instead of resolving the parent attachment chain |
| Spine import — IK / Transform / Path / Physics | partial | Constraint *export* fully works; *import* skips constraints (warning only) |
| Spine import — non-default skins | partial | Only `default` skin is applied; others warn and skip |
| Spine import — bezier curve cps | partial | Curve type is recognized but control points aren't preserved (becomes linear) |
| Spine import — atlas refs | partial | v1 expects existing internal slots; doesn't auto-create from atlas |
| Audio waveform — first decode | by design | Async via `decodeAudioData`; SVG appears once decode completes |

## Skipped (deliberately, with rationale)

- **Bone tree drag-reparent** — interacts with slot drag-reorder UX in
  ways that need design work; existing parent dropdown is functional.
- **Layer track reorder UI** — layer mix order affects composition; UX
  needs more thought before exposing reorder controls.
- **Same-time event reorder** — events at identical timestamps are rare
  and the data structure doesn't currently distinguish their order.
- **Sparse top-N weight format** — bone palette cache (Phase 5) closed
  the perf gap for typical scenes; sparse weights would help only at
  64+ bones, deferred until a real workload demands it.
- **GPU vertex skinning** — `deformedScreen` is consumed by hit testing,
  overlay drawing, contour computation, weight brush; pure GPU skinning
  would require transform-feedback round-trip or duplicate work.
  CPU loop with palette cache is the right design here.

## Reference

- Bones: https://esotericsoftware.com/spine-bones
- Constraints: https://esotericsoftware.com/spine-constraints
- IK / Transform / Path / Physics: https://esotericsoftware.com/spine-ik-constraints
- JSON format: https://esotericsoftware.com/spine-json-format
- Atlas format: https://esotericsoftware.com/spine-atlas-format
