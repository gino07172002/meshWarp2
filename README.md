# Web Spine-like Mesh Deformer (Prototype)

WebUI prototype using `WebGL + HTML + JavaScript`.

## Features

- Load `PNG/JPG/WebP/...` image files.
- Try loading `PSD` files (using `ag-psd` dynamic import from CDN).
- Generate a 2D triangle mesh grid.
- Multi-bone skeleton deformation (add/remove/select/parent/edit).
- Bone workflow modes:
  - `Edit Rig`: set bind/head/tip/parent and rebuild rig
  - `Pose Animate`: manipulate pose without changing bind rig
- Per-bone link mode (`Connected/Disconnected`):
  - `Connected`: child head sticks to parent tail
  - `Disconnected`: child head can move independently
- Per-bone pose length option:
  - `Allow`: bone length can change in pose mode
  - `Lock`: pose mode keeps rig length
- Auto weight assignment for all bones.
- Weight modes: `Hard (Single Bone)` or `Smooth Blend`.
- Direct per-bone world-space `Head(X/Y)` and `Tip(X/Y)` editing.
- Canvas hotkeys for rigging/posing:
  - `G/T/R`: drag tool (head/tail/rotate+length)
  - `C`: toggle connect/disconnect
  - `P`: parent pick in canvas
  - `Shift+A`: arm add bone, then drag in canvas to create (Spine/Blender-like)
  - `[ / ]`: previous/next bone
  - `1/2`: switch Edit/Pose
  - `I`: insert/update keyframe at current time (pose mode)
  - `K`: insert/update keyframe at current time
  - `Ctrl+C / Ctrl+V`: copy/paste selected keyframe
  - `, / .`: jump to previous/next keyframe on selected track
  - `Space`: play/pause timeline

## Timeline

- Pose changes can be stored as keyframes and played back.
- Interpolation is linear for `tx/ty/length` and shortest-path for `rotation`.
- Timeline dock is placed at the bottom of the app layout (DCC-style).
- Multi-animation support with independent timelines.
- Hierarchical bone tracks with fold/unfold:
  - Bone group row (overview)
  - child tracks: `Translate`, `Rotate`, `Scale` (`tx/ty` merged in Translate)
- Keyframe operations from timeline lanes:
  - move (drag key marker)
  - delete
  - copy
  - paste/overwrite at current time
- Timeline extras (Blender/Spine style):
  - draggable playhead on ruler
  - dedicated play / pause / stop controls
  - loop playback toggle
  - snap-to-frame toggle with FPS
  - per-key interpolation (`Linear` / `Stepped`)
  - resizable timeline height
- Auto-key behavior:
  - `Add Key` inserts keys on recently edited properties (auto track detect)
  - if no recent edited property, it keys the currently selected track
- Vertex deformation (drag mesh points directly).
- Overlay view for mesh and bones.

## Run

1. Start a static server in this folder:
   - `python -m http.server 5173`
2. Open:
   - `http://localhost:5173`
3. Load your image/PSD from the left panel.

## Notes

- PSD loading depends on CDN availability for `ag-psd`.
- Current implementation is a focused prototype:
  - N-bone skinning (CPU side)
  - grid-based meshing (not alpha-aware auto cutout)
  - direct vertex offset editing
