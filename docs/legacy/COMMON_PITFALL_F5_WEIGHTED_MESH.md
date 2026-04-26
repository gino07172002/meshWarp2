# Common Pitfall: F5 After Reload, Weighted Mesh Stops Following Bones

## Symptom

- Before reload, weighted mesh deforms with bones normally.
- After pressing `F5`, mesh no longer follows bone deformation in animate mode.
- Sometimes selection overlay / weight heat map / bind target UI also looks inconsistent.

## What Actually Happened

The main failure was **not** that weights were missing.

The real issue was:

- weight data could still exist after reload
- but the project load flow did **not always restore the rig into the correct runtime pose state**
- so weighted skinning was evaluated against the wrong rig/pose/bind-space state

In practice this meant:

- `meshData.weights` looked valid
- `poseWorld` could differ from `rigWorld`
- but the final deformation delta was still effectively zero

That combination usually means:

- skinning data exists
- but runtime pose / bind state is wrong

## Key Debug Signal

This debug output was the clue:

- `weightCount === expectedWeightCount`
- `poseMovedFromRig === true`
- `sampleVertex.delta = { x: 0, y: 0 }`

That means:

- weights are present
- pose is changing
- but runtime skinning is not actually applying the pose deformation

## Root Cause

### 1. Load Order / Runtime Normalization Problem

After project load:

- rig bones were restored
- slot / attachment data was restored
- but the rig was not always normalized into the correct `pose/runtime` state for animate mode

So after `F5`, animate mode could visually be active while internal skinning still behaved like edit/setup-side data.

### 2. Slot -> Attachment Migration Made This Easier To Break

This codebase is migrating from:

- slot-owned mesh/bind data

to:

- attachment-owned mesh/bind data

That means mixed logic like these is dangerous:

- reading `slot.meshData` in one place
- reading `getActiveAttachment(slot).meshData` in another
- using `slot.bone` in one place
- using attachment-derived influence/owner resolution elsewhere

If those paths disagree after reload, the UI and runtime deformation can drift apart.

## What Fixed It

### 1. Restore Attachment-Owned Weight Data Correctly

Project/autosave save/load must preserve attachment-owned data such as:

- `meshData`
- `weights`
- `weightMode`
- `weightBindMode`
- `influenceBones`
- `meshContour`
- related attachment state

Do not assume slot-root copies are enough.

### 2. Normalize Rig State After Load Based On Current Mode

After loading:

- if current system mode is `animate`
  - ensure rig is normalized into runtime space
  - ensure pose mode is active
  - sample pose at current time

- if current system mode is `setup`
  - keep edit-space behavior

Do not rely on later UI interaction to fix this implicitly.

### 3. Avoid Render-Time “Force Pose Runtime” Hacks

A temporary hack that forced render logic to always use runtime pose in animate view did make deformation happen,
but it also caused the whole mesh to rotate incorrectly by about 90 degrees.

That proved the bug was in the rig runtime state layer, but the correct fix was:

- normalize the rig after load
- not override the render path blindly

## Fast Debug Checklist

When this bug comes back, check these in order:

1. `collectAutosaveWeightDebug()`
   Verify weights are actually present in autosave/project payload.

2. `collectWeightedAttachmentIssues()`
   If this returns issues, weights or attachment mesh payload are broken.

3. `collectSlotBindingDebug()`
   Pay special attention to:
   - `mode`
   - `treeBone`
   - `influenceBones`
   - `weightCount`
   - `expectedWeightCount`
   - `poseMovedFromRig`
   - `sampleVertex.delta`

If:

- `weightCount` is valid
- `poseMovedFromRig` is true
- `sampleVertex.delta` is zero

then the likely problem is runtime pose / bind-state restoration, not missing weights.

## Important Guidance For Future AI

- Do not assume “mesh does not deform” means “weights were not saved”.
- First separate:
  - weight persistence problems
  - attachment restore problems
  - rig runtime normalization problems

- In this codebase, attachment-level state is the safer source of truth for mesh/weight data.
- Be careful with any fix that mixes:
  - `slot.meshData`
  - `slot.bone`
  - `attachment.meshData`
  - attachment-derived owner bone logic

- If a fix restores deformation but rotates the whole mesh strangely, it is probably using the wrong world/bind space rather than truly solving the bug.
