# AI Handoff: F5 Weighted Mesh Deform Bug

## Short Version

If the user says:

- weighted mesh worked before reload
- after `F5`, mesh no longer follows bones

do **not** assume weights were lost.

In this project, the more likely root cause is:

- weights are still present
- but load flow left the rig in the wrong runtime state
- so skinning runs against the wrong pose/bind space

## First Things To Check

Run these in console:

```js
collectAutosaveWeightDebug()
collectWeightedAttachmentIssues()
collectSlotBindingDebug()
```

## How To Read The Results

### If `collectWeightedAttachmentIssues()` is non-empty

Then attachment mesh/weight payload is broken.

Look at:

- attachment-level `meshData`
- attachment-level `weightMode`
- attachment-level `influenceBones`
- restore path in project/autosave load

### If `collectWeightedAttachmentIssues()` is empty

And `collectSlotBindingDebug()` shows:

- `weightCount === expectedWeightCount`
- `poseMovedFromRig === true`
- `sampleVertex.delta` is still zero

Then the problem is probably:

- rig runtime normalization
- pose/bind state after load
- not missing weights

## Known Safe Direction

Prefer fixing:

- project load order
- rig normalization after load
- animate/setup mode transition correctness

Do **not** jump straight to render-time hacks that force pose runtime everywhere.

That previously caused:

- mesh deform to reappear
- but the whole mesh to rotate incorrectly by about 90 degrees

## Important Code Reality

This repo is in the middle of migrating from:

- slot-owned mesh/bind data

to:

- attachment-owned mesh/bind data

So always verify whether code is reading:

- `slot.meshData`
- `slot.bone`

or:

- `getActiveAttachment(slot).meshData`
- attachment-derived owner/influence data

Mixed use of both is a common source of regressions.

## Good Fix Pattern

1. Restore attachment-owned weight data correctly.
2. After project load, normalize rig state based on current system mode.
3. If current mode is animate:
   - enter runtime/pose state correctly
   - sample pose at current time
4. Only then validate deformation.

## Related Docs

Full write-up:

[COMMON_PITFALL_F5_WEIGHTED_MESH.md](d:\claude\COMMON_PITFALL_F5_WEIGHTED_MESH.md)
