# Spine2D Bone Feature Gap (for this prototype)

## Already implemented

- Multi-bone hierarchy (parent/child).
- Edit rig vs pose animate mode.
- Per-bone lock toggle for pose mode.
- Bone head/tip direct editing.
- Hard/smooth mesh weight modes.

## High priority (next)

1. IK constraints (1-bone, 2-bone)
- Add target bone, bend direction, mix.
- Then add compress/stretch/uniform/softness controls.

2. Transform inheritance modes
- Support: `normal`, `onlyTranslation`, `noRotationOrReflection`, `noScale`, `noScaleOrReflection`.

3. Bone transform channels parity
- Add `scaleX/scaleY` and `shearX/shearY` per bone.

4. Constraint system and order
- Add IK / Transform / Path constraint stacks.
- Add explicit constraint order and mix sliders.

## Medium priority

1. Constraint folders + skin-required toggles.
2. Multi-bone selection and pose tool behavior (drag selected chain).
3. Bone visibility/selectability toggles in viewport.

## Export compatibility

1. JSON-compatible bone fields
- `name,parent,length,transform,skin,x,y,rotation,scaleX,scaleY,shearX,shearY`.

2. Runtime order constraints
- Parent-before-child bone ordering.
- Deterministic constraint execution order.

## Sources

- Bones: https://esotericsoftware.com/spine-bones
- Constraints: https://esotericsoftware.com/spine-constraints
- IK constraints: https://esotericsoftware.com/spine-ik-constraints
- Transform constraints: https://esotericsoftware.com/spine-transform-constraints
- Tools (Pose / Bone length): https://esotericsoftware.com/spine-tools
- JSON format: https://esotericsoftware.com/spine-json-format
- API inherit modes: https://esotericsoftware.com/spine-api-reference
