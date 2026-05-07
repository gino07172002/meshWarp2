# Puppet Warp — Feature Specification

> Read this before touching any puppet-warp code. It is the authoritative
> reference for future AI agents and contributors.

---

## What it is

Puppet Warp is an **editor-only** mesh deformation tool that lets users
place "pins" on a mesh attachment, drag them, and have the rest of the
mesh follow in an as-rigid-as-possible (ARAP) manner — the same feature
found in Adobe Photoshop ("Puppet Warp") and After Effects ("Puppet Pin
Tool"). It is **not a Spine 4.x runtime feature**. On Spine export,
pin keyframes are baked into standard `deform` timeline keyframes that
every Spine runtime understands.

---

## Files

| File | What it owns |
|---|---|
| `vendor/sparse-cholesky.js` | Float64 LDLᵀ solver (no deps). `window.SparseCholesky`. |
| `app/core/puppet-warp.js` | ARAP math. `window.PuppetWarp`. |
| `app/core/puppet-warp-runtime.js` | Editor glue. `window.PuppetWarpRuntime`. |

Supporting changes across the codebase:

| File | Change |
|---|---|
| `app/core/bones.js` | `getSlotWeightMode`: short-circuits to `"free"` for standalone attachments |
| `app/render/constraints.js` | `drawPuppetWarpPins`, `pickPuppetWarpVertex`, pin hit-test in `pickAttachmentGizmoHandle` |
| `app/animation/model.js` | Pin track helpers: `getPuppetPinTrackId`, `parsePuppetPinTrackId`, `samplePuppetPinTrack`, `writePuppetPinKeyframe`, `deletePuppetPinKeyframe` |
| `app/animation/runtime.js` | `samplePoseAtTime` calls `PuppetWarpRuntime.onAnimationFrame()` |
| `app/workspace/workspace.js` | `normalizeSlotAttachmentRecord` + `addSlotEntry`: carry `puppetWarp` field |
| `app/workspace/slots.js` | `normalizeSlotMeshToolMode`: recognises `"puppetwarp"` mode |
| `app/io/project-export.js` | `buildProjectPayload`: serialises `att.puppetWarp` |
| `app/io/project-actions.js` | Load path: hydrates `att.puppetWarp` from JSON |
| `app/ui/hotkeys.js` | Alt+Click add pin, gizmo drag, Shift+Click remove, V-key exits puppet mode |
| `app/ui/bootstrap.js` | `clearDrag`: pin drag-end writes pin keyframe + undo checkpoint |
| `app/core/runtime-els.js` | `els.puppetWarpToolBtn` + all `els.puppetWarp*` ids |
| `index.html` | `#puppetWarpGroup` panel, `#puppetWarpToolBtn` |
| `styles.css` | `.pw-group`, `.pw-editor-badge`, `.pw-pin-list`, `.pw-pin-row`, etc. |

---

## Data model

### `att.puppetWarp` (on mesh / linkedmesh attachments)

```js
att.puppetWarp = {
  mode: "standalone" | "post_skin",   // default "standalone"
  pins: [
    {
      id: "pin_<short>",              // stable, used as part of track id
      vertexIndex: <int>,             // index into att.meshData.positions
      restX: <float>,                 // slot-local position at pin creation
      restY: <float>,
      label: "",
    }
  ],
  bake: {
    dirty: <bool>,                    // written on topology/pin changes
    lastTopologyHash: "",             // drives Cholesky factor invalidation
  },
  lastTargets: {                      // transient live-drag state
    "<pinId>": { x, y }              // standalone: absolute slot-local
                                     // post_skin: { dx, dy } skinned-relative
  } | null,
}
```

**Invariants:**
- `att.puppetWarp.pins[i].vertexIndex < att.meshData.positions.length / 2`
- `att.puppetWarp` is `null` when puppet warp is disabled (not missing key)
- Carried through `normalizeSlotAttachmentRecord`, `addSlotEntry`, and the
  load/save paths — never dropped silently

---

## Pin timeline tracks

- **Track id format**: `slot:<slotIndex>:attachment:<attName>:puppetpin:<pinId>`
- **Keyframe value shape**:
  - `standalone` mode: `{ x, y }` — absolute slot-local target
  - `post_skin` mode: `{ dx, dy }` — relative to current bone-skinned vertex
- Tracks live in `state.anim.tracks` alongside all other animation data
- `parsePuppetPinTrackId(id)` → `{ slotIndex, attachmentName, pinId }`
- When a pin is removed (`removePin`, `disableForAttachment`, or
  Clear All Pins), its track is deleted from `anim.tracks` immediately.
  This prevents orphan tracks accumulating.

---

## Two deformation modes

### Standalone (default)
- `getSlotWeightMode` returns `"free"` → bone palette is skipped in
  `buildSlotGeometry`.
- Render: `final = positions[i] + offsets[i]` (no skinning).
- ARAP is solved against the mesh **rest positions**.
- Use when the attachment has no bone weights, or when you want puppet
  warp to fully replace bone influence.

### Post-skin (After Effects style)
- Bone palette stays active → `final = skinned[i] + offsets[i]`.
- ARAP is solved against the **current bone-skinned positions** (from
  `meshData.deformedLocal`), so pins follow bone motion adaptively.
- Pin keyframe values are `{ dx, dy }` relative to the current skinned
  vertex, so a pin set to `{ dx: 10, dy: 0 }` always pushes "10 units
  in the direction the vertex is currently pointing".
- `getDynamicRest(att)` recovers the pure-skinned reference by subtracting
  `meshData.offsets` from `meshData.deformedLocal`.

---

## ARAP solver

`window.PuppetWarp` exposes:

```
precompute(att)
  → cache {topoHash, pinHash, vCount, triCount, triA/B/C,
           triCotA/B/C, L, restX, restY, pinVertices, factor}
  Builds cotangent Laplacian, sets up penalty rows for pins,
  runs LDLᵀ factorisation. Cached by attachment WeakMap.
  Re-runs on mesh topology or pin set change.

solve(att, pinTargets, iters=2) → Float32Array[vCount*2]
  ARAP against the mesh rest positions.
  pinTargets: { vertexIndex: { x, y } } or Map<vertexIndex, {x,y}>

solveAdaptive(att, dynamicRest, pinTargets, iters=2) → Float32Array[vCount*2]
  Same algorithm but uses dynamicRest as the per-frame reference.
  The Cholesky factor is reused (only RHS changes).

invalidate(att, reason)
  Drops the cached factor. Call when mesh topology changes.
```

The solver uses a **dense** LDLᵀ (O(n²) factor, O(n²) solve). This is
correct for n ≤ ~2k (< 2ms factor, < 1ms solve). If you ever target
10k+ vertex meshes, replace `vendor/sparse-cholesky.js` with a real
sparse factoriser; the API is identical.

---

## Rendering pipeline hook

`buildSlotGeometry` (constraints.js:1472) is the only render path change.
The guard is a **single line** in `getSlotWeightMode` (bones.js:891):

```js
if (att.puppetWarp && att.puppetWarp.mode === "standalone") return "free";
```

`"free"` mode skips the bone palette loop; the existing `positions + offsets`
composition is unchanged. For `post_skin`, weightMode falls through normally
(`single` / `weighted`) so bone skinning runs as usual, and ARAP offsets
layer on top via the same `offsets` array.

---

## Animation flow (what happens when user drags a pin)

```
pointerdown on pin gizmo (hotkeys.js)
  → state.drag = { type: "puppet_warp_pin", pinId, startLocal, startTarget }

pointermove (hotkeys.js)
  → PuppetWarpRuntime.dragPin(slot, att, pinId, targetX, targetY)
      → makeTarget(att, pin, tx, ty)   // {x,y} or {dx,dy} per mode
      → buildTargets(pw, overrides, dynamicRest)
      → applyTargetsToOffsets(att, overrides)
           → getDynamicRest(att)       // post_skin: deformedLocal − offsets
           → PuppetWarp.solve / solveAdaptive
           → write meshData.offsets

pointerup (bootstrap.js clearDrag)
  → PuppetWarpRuntime.commitDrag()    // undo checkpoint
  → writePuppetPinKeyframe(si, attName, pinId, time, lastTarget)
      → writes { x,y } or { dx,dy } keyframe to pin track
      → PuppetWarpRuntime.bakeDeformKeyframeForTime(si, attName, time)
           → applyTargetsToOffsets(att, overrides at t)
           → snapshots meshData.offsets → writes to deform track key
```

**Playback (every animation frame):**
```
samplePoseAtTime (animation/runtime.js)
  → PuppetWarpRuntime.onAnimationFrame()
      → guard: skip if time unchanged since last call
      → for each slot with pins: samplePuppetPinTracksAtTime(i, att, t)
           → samplePuppetPinTrack(anim, trackId, t) → { x,y } | { dx,dy }
           → applyTargetsToOffsets(att, overrides)
```

---

## Serialisation

### Native project JSON (`buildProjectPayload`)

`att.puppetWarp` is written under `slot.attachments[i].puppetWarp`:

```json
{
  "puppetWarp": {
    "mode": "standalone",
    "pins": [{ "id": "pin_abc", "vertexIndex": 100, "restX": 12.5, "restY": 8.0, "label": "" }]
  }
}
```

Pin timeline tracks are serialised as part of `state.anim.tracks`
automatically (the same path as bone/deform/event tracks).

### Spine JSON export

**Pins and pin tracks are NOT exported.** Spine has no concept of ARAP
pins. The export pipeline only writes the `deform` timeline, which
contains the pre-baked vertex offsets (written by
`bakeDeformKeyframeForTime`). This means Spine runtimes play back the
correct deformation without knowing about puppet warp.

**Spine JSON MUST NOT contain the strings `puppetWarp` or `puppetpin`.**
If they appear, something is leaking attachment metadata into the Spine
builder — this is a regression.

### Re-import from Spine JSON

After a Spine JSON → re-import cycle, `att.puppetWarp === null`. The
deformation is preserved (via the deform timeline), but pins are gone.
The native project JSON is lossless; always save that if you need to
re-edit pins.

---

## UI

### Left panel — Puppet Pin button

`#puppetWarpToolBtn` in `#slotMeshTools` (Mesh workspace left panel).
Same `mesh-quick-btn` pill style as Weight Overlay. Warm orange when active.

Clicking:
1. Toggles `puppetwarp` tool mode in `state.slotMesh.toolMode`.
2. Auto-enables `att.puppetWarp` on the active attachment if not set.
3. Sets status bar hint (Alt+Click, Drag, Shift+Click).

### Right panel — `#puppetWarpGroup`

Visible when active attachment is `mesh` or `linkedmesh`, in **both** Mesh
and Rig workspaces.

Contents:
- Enable checkbox (creates / nulls `att.puppetWarp`)
- Mode dropdown (Standalone / Post-skin)
- Pin list (`.pw-pin-list` with `.pw-pin-row` items; click selects, × deletes)
- Clear All Pins + Rebake buttons
- Status line (pin count + user-friendly mode label)

The panel carries an `editor only` badge on its heading — a visual cue
that this section is not Spine-native.

### Gestures (in mesh workspace with puppet warp enabled)

| Gesture | Action |
|---|---|
| **Alt+Click** on mesh vertex | Add pin at that vertex |
| **Click+Drag** on pin diamond | ARAP solve preview; keyframe on release |
| **Shift+Click** on pin | Remove pin (+ deletes its timeline track) |
| **I** with pin selected | Insert keyframe for selected pin at current time |
| **V** | Exit puppet warp mode, switch to vertex select |

---

## Known limitations

1. **Solver is dense O(n²)**. Adequate for meshes up to ~2k vertices.
   For larger meshes replace `vendor/sparse-cholesky.js` (same API).
2. **Post-skin bakes against rest mesh topology** (not a per-frame
   bone-aware ARAP). The adaptive path uses the most recent
   `deformedLocal` frame as the dynamic rest, so pins track bone motion
   on each frame, but the Cholesky factor is still built on the static
   cot-Laplacian of the rest mesh.
3. **Spine export deform bake requires a keyed pin** before it writes
   a deform keyframe. Dragging without pressing I / pointerup will not
   generate a deform track entry (only live preview offsets).
4. **Mode switch mid-animation produces mixed-shape keyframes** (`{x,y}`
   and `{dx,dy}` on the same track). The sampler interpolates them
   gracefully, but the conceptual mismatch means old keyframes should be
   deleted after a mode switch.

---

## Testing

```bash
node tools/check-sparse-cholesky.js          # LDLᵀ correctness
node tools/check-puppet-warp-arap.js         # ARAP solver behaviour
node tools/demo-puppet-warp.js               # Phase 1: pins + drag + native round-trip
node tools/demo-puppet-warp-phase2.js        # Phase 2: animated pins, ARAP playback
node tools/demo-puppet-warp-spine-roundtrip.js  # Phase 3: Spine export contract
node tools/demo-puppet-warp-adaptive.js      # Phase 4: post-skin {dx,dy} shape
node tools/audit-puppet-warp.js              # 12-category lifecycle + perf audit
node tools/run-checks.js                     # All 29+ static checks (must stay green)
```

---

## What NOT to do

- **Do not call `slot.puppetWarp`** — puppet warp is on the attachment,
  not the slot. `tools/check-puppetwarp-attachment-shape.js` will catch
  this (future check, not yet wired into run-checks).
- **Do not write `puppetWarp` or `puppetpin` into Spine JSON.** The Spine
  builder in `project-export-spine-json.js` never reads `att.puppetWarp`;
  if it starts appearing in output, something is passing raw attachment
  objects into the Spine builder's skin map instead of the pre-built
  Spine attachment descriptor.
- **Do not add `mode: "post_skin"` to lightweight attachments** (region,
  point, boundingbox). `getSlotWeightMode` only special-cases
  `standalone`; post_skin attachments are expected to have bone weights.
- **Do not skip `pushUndoCheckpoint(true)` after mutating pins.** Without
  it, Ctrl+Z won't work properly.
