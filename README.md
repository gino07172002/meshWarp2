# Web Spine-like 2D Mesh & Animation Editor

A browser-based 2D skeletal animation editor with workflow modeled on Spine 2D.
Vanilla JavaScript + WebGL + HTML5 Canvas. No bundler, no build step — open
`index.html` (over a local server) and you're running.

Supports the full Spine 4.x rigging pipeline: bones, slots, mesh attachments
with weighted skinning, four constraint types (IK, Transform, Path, Physics),
skins with bone scope, animation timeline with deform / event / draw-order
tracks, and round-trip Spine JSON / .skel binary / .atlas export.

## Quick start

```bash
python -m http.server 5173
# then open http://localhost:5173
```

That's it — no `npm install`, no bundler.

## Project layout

```
app/
  core/            els registry, state, math, GL setup, rig math, debug surface
  workspace/       slot data model, attachments, constraint normalization
  render/          per-frame render loop, constraint solvers, weight tools
  animation/       timeline UI, animation runtime, autosave/persistence
  io/              project save/load, Spine import / export, atlas packer
  ui/              panels, hotkeys, dock layout, bootstrap
docs/
  superpowers/
    specs/         feature specs + the master test recipe list
    runbooks/      operational guides (testing, AI capture)
    plans/         design plans (kept for traceability)
  legacy/          older handoff notes kept for git history context
tools/             25+ Node static check tools (run with `node tools/check-*.js`)
```

## What works

**Skeleton**: bones with all 5 inheritance modes, all transform channels,
hierarchical parenting, drag-drop reordering.

**Slots & attachments**: 6 attachment types — Region, Mesh, Linked Mesh,
Bounding Box, Clipping, Point. Two-color tint (light + dark). 4 blend modes.
Skin scope with skin-level bone visibility.

**Mesh editing**: vertex editing with proportional and mirror modes,
auto-foreground tracing from alpha, auto-triangulation, grid fill,
subdivide / centroid / flip-edge / generate-by-area micro-tools, weighted
binding, weight paint brush (4 modes + bone lock + smooth), prune / weld /
swap / update bindings.

**Constraints**: IK 1-bone & 2-bone, Transform, Path (drawn / slot / bone-chain
sources), and Spine 4.2 Physics constraints (semi-implicit Euler solver with
spring + damping + wind/gravity + per-bone state reset).

**Animation**: timeline with bone / slot / constraint / deform / drawOrder /
event tracks. Linear, stepped, and bezier interpolation. Auto-key. Onion
skin with keyframe-only mode and pixels-per-frame motion vectors. Animation
layers with bone masking. State machine with parameters and conditions plus
runtime bridge code export. Audio events with **waveform rendering on the
event track lane**.

**Rendering** (WebGL primary path):
- Stencil-based clip-slot masking — no Canvas2D fallback
- Base reference image as a textured quad
- Two-color tint shader
- GPU weight heatmap

**Import / export**:
- Native project JSON (with embedded image data URLs)
- Spine 4.x JSON export — bones, slots, weighted meshes, all 4 constraint
  types, deform timelines, two-color tint, sequence frames
- Spine SKEL binary export
- Atlas advanced packing — multi-page, rotation, trim, bleed, configurable
  padding (shelf packer)
- Spine 4.x JSON import (v1) — bones, slots, weighted meshes, animations
- WebM / GIF / PNG sequence preview export, batch export

**Diagnostics** (open browser console, type `debug.help()`):
- `debug.snapshot()` — major state at a glance
- `debug.timing()` — per-frame phase timing (deform / slotDraw / overlay)
- `debug.actionLog()` — last N user-visible actions for bug repro
- `debug.errors()` — auto-captured exceptions + manual reports
- `debug.findSlot(name)` / `debug.findBone(name)` — quick lookups

## Known caveats

- **Spine import v1** matches slots by name onto an existing project — it
  doesn't create slots from atlas refs. Linked-mesh inheritance, IK /
  Transform / Path / Physics constraint import, and skins other than
  `default` log warnings rather than fully importing.
- **Audio waveform** uses Web Audio's `decodeAudioData` — first-frame
  decode is async, the SVG appears once decode completes.
- **Constraint Move Up / Down** uses an `order` field; the runtime resolve
  order matches Spine's (Path → Transform → IK → Physics) but UI ordering
  is per-list within each type.
- **Pose Auto-Rig** (humanoid template builder) requires fetching
  TensorFlow.js / MediaPipe at runtime — first run downloads ~5 MB.

## Testing

See [TESTING.md](TESTING.md) for the full validation flow.

Quick version:

```bash
# 25 static checks, all must pass
for f in tools/check-*.js; do node "$f"; done

# Test recipe spec validates (115 recipes across 31 sections)
node tools/test-spec-runner.js --validate
```

Browser-side test runner DSL is documented in [TESTING.md](TESTING.md) §
"Running test recipes".

## Documentation map

| Audience | Read this |
|---|---|
| AI agents working on the code | [AGENTS.md](AGENTS.md) |
| Contributors | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Testing & validation | [TESTING.md](TESTING.md) |
| Spine feature parity tracking | [SPINE_FEATURE_GAP.md](SPINE_FEATURE_GAP.md) |
| Feature specs + test recipes | [docs/superpowers/specs/](docs/superpowers/specs/) |
| Architectural decisions | [docs/superpowers/plans/](docs/superpowers/plans/) |
| Older handoff notes | [docs/legacy/](docs/legacy/) |

## Suggested workflow

1. **Import** an image or PSD (`Import Image/PSD` in the topbar)
2. **Mesh** workspace — outline + auto-triangulate the slot meshes
3. **Rig** workspace — build the bone hierarchy, set up IK / constraints
4. **Object** workspace — global pose adjustments (optional)
5. **Animate** workspace — timeline, layers, state machine
6. **Export Spine** — JSON / .skel / .atlas / PNG bundle

## Hotkeys

| Category | Keys |
|---|---|
| View | `+` / `-` / `0` zoom · middle-mouse drag pan |
| Bone edit | `G` move head · `T` move tail · `R` rotate · `C` connect · `P` parent picker |
| Add bone | `Shift+A` |
| Mesh edit | `V` select/add toggle · `L` link edge · `U` unlink · `Del` / `X` delete vertex |
| Vertex tweak | `O` proportional · `H` mirror · `P` pin · `M` relax |
| Animation | `I` insert key · `K` delete key · `Space` play/pause · `,` `.` prev/next frame |
| Weight brush | `W` toggle |
| Global | `Ctrl+Z` / `Ctrl+Y` · `Ctrl+K` command palette · `F11` fullscreen |
| Selection | `A` select-all (Blender style) |

## License

See [LICENSE](LICENSE).
