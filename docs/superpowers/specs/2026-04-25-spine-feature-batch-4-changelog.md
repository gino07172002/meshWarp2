---
name: 2026-04-25-spine-feature-batch-4
description: Fourth-batch changelog. Pose-tool numeric ops (+N/-N/*N/N) on bone fields, then full Spine 4.2 Physics Constraints (data model, semi-implicit Euler solver, panel UI, project save/load, Spine JSON export).
type: changelog
status: shipped
date: 2026-04-25
---

# Spine Feature Batch 4 — 2026-04-25 (late evening)

Continues from `2026-04-25-spine-feature-batch-3-changelog.md`. Two
features in this push: pose-tool relative numeric entry, and Spine 4.2
Physics Constraints — the largest remaining "Important" gap from
`test-spec-master.md` Section C.

## Pose-tool relative numeric entry
Spine lets you type `+10`, `*2`, `/3`, `-15` into bone numeric fields
and the field commits the *relative* update on blur or Enter. We now
match that.

- All bone numeric fields (`#boneTx`, `#boneTy`, `#boneRot`, `#boneLen`,
  `#boneScaleX/Y`, `#boneShearX/Y`) are `type="text"` with
  `data-relative-numeric` and a parser that runs on blur/Enter.
- Each input handler bails when the live value isn't finite
  (Number.isFinite check), so partial typing like `+`, `-`, `*` doesn't
  zero out the bone mid-keystroke.
- 3 test recipes added: relative-numeric-add / -multiply /
  -mid-typing-no-corruption.

Files: `app/ui/constraint-panels.js`, `index.html`,
`docs/superpowers/specs/test-spec-master.md`.

Commit: `d65e791 Pose-tool relative numeric entry (+N / -N / *N / /N)
on bone fields`.

## Physics Constraints (Spine 4.2)

### Data model
`m.physicsConstraints[]` — each entry has:
- `bone` (single index — physics is one-bone-per-constraint, unlike the
  others)
- channel flags: `x`, `y`, `rotate`, `scaleX`, `shearX`
- spring params: `mix` (0..1), `inertia` (0..1), `strength`,
  `damping` (0..10), `massInverse`, `step` (1/240..1/15)
- external forces: `wind` (X), `gravity` (Y), `limit` (vel cap)
- per-instance simulator state on `c.state` — current values + per-channel
  velocity + `lastTime`/`reset` flags. Lives on the runtime instance, not
  serialized to the dump beyond seed flags.

`ensurePhysicsConstraints(m)` normalizer in
`app/workspace/constraint-model.js` matches the IK/Transform/Path
pattern.

### Solver
Semi-implicit Euler in `applySinglePhysicsConstraintToBones`:
1. Read rest-pose targets (the bone's current channel values, which
   include any animation timeline + earlier constraints).
2. If `inertia < 1`, lerp the simulator's stored value toward the new
   target by `(1 - inertia)` first — this is what "inertia" means in
   Spine: 1.0 = full drift, 0.0 = bone always tracks the rest pose.
3. Substep until `elapsed` is consumed (cap 16 substeps so a long pause
   doesn't burn CPU): each step applies spring force toward target +
   damping + external force, integrates velocity, then position.
4. Mix the simulator's value back onto the bone by `mix`.
5. Rotation handles wrap correctly — we drive the wrapped delta to zero
   instead of the absolute angle, so a 359° → 1° transition doesn't
   spring the long way around.

Velocity is clamped to `±limit` so a misconfigured rig (zero damping,
huge strength) can't NaN out.

### Pipeline integration
`buildConstraintExecutionPlan` now emits `phy` step types after `pth`,
and `getEditAwareWorld` dispatches to `applySinglePhysicsConstraintToBones`
with `getCurrentRenderTime()` as the time base. Single integration point
keeps it consistent with Path/Transform/IK.

### UI
New Physics tab between Path and Skin (visible whenever IK/Transform/Path
are visible — Rig + Animate workspaces with a skeleton). Five collapsible
sections:
- **List** — Add / Remove / Reset State / Move Up + the constraint list
- **Properties** — Constraint select + Name + Bone + Enabled
- **Channels** — X/Y/Rotate/ScaleX/ShearX checkboxes
- **Spring** — Mix, Inertia, Strength, Damping, Mass⁻¹, Step
- **External Forces** (collapsed by default) — Wind, Gravity, Velocity Limit, Skin Required

`refreshPhysicsUI()` is wired into `refreshConstraintUIs()` so
project load + bone count changes refresh the panel.

### Serialization
Both directions:
- `app/io/project-export.js` writes `physicsConstraints[]` to project
  JSON and `skeleton.physics[]` to Spine JSON export (with bone name
  resolution + clamping).
- `app/io/project-actions.js` reads `physicsConstraints[]` on load and
  re-normalizes through `ensurePhysicsConstraints`.

### Tests
6 new recipes added:
- physics-add-defaults
- physics-bone-rotates-toward-rest
- physics-reset-state-zeroes-velocity
- physics-disabled-no-effect
- physics-export-spine-json
- physics-roundtrip-project-save-load

`test-spec-master.md` now has 82 recipes across 21 sections; all
validate.

## Files touched (this batch)
```
app/core/bones.js                          (refresh hook + tab visibility)
app/core/runtime.js                        (DOM refs + selectedPhysics)
app/io/project-actions.js                  (load handler)
app/io/project-export.js                   (project + Spine JSON export)
app/render/constraints.js                  (refreshPhysicsUI + handlers + plan dispatch)
app/ui/constraint-panels.js                (relative numeric ops finishing)
app/workspace/constraint-model.js          (data model + solver + plan emit)
docs/superpowers/specs/test-spec-master.md (3 + 6 recipes)
docs/superpowers/specs/2026-04-25-spine-feature-batch-4-changelog.md (NEW)
index.html                                 (Physics tab markup + cache-busts)
```

## What's still parked

| Gap | Why parked |
|---|---|
| Spine project import (.json/.skel/.atlas) | L — new IO surface |
| Atlas advanced packing | L — multi-page, rotation, trim, padding, bleed |
| Audio waveform on timeline | M — playback works; waveform is a render path |

Pose-tool numeric axes/handles is now closed (this batch).

## Repo log
```
git log --oneline -5
d65e791 Pose-tool relative numeric entry (+N / -N / *N / /N) on bone fields
087112a Document batch-3 changelog (today's evening session)
4f375da Bone Compensation toggle (Spine equivalent)
1427f2c Mesh "Generate Vertices" — auto-densify large triangles
4f5e443 Onion-skin breadth: keyframes-only mode + pixels-per-frame X/Y offset
```
