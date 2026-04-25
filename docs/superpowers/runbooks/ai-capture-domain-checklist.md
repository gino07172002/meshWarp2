# AI Capture Domain Checklist

Use this checklist whenever adding a feature that changes editor state or introduces a new interaction mode.

## 1. Decide The Domain

Choose a short stable domain ID:

- `mesh`
- `timeline`
- `bone`
- `attachment`
- `render`
- `export`

If the feature belongs to an existing domain, extend that adapter instead of creating a new one.

## 2. Register The Domain

Add or update a domain adapter:

```js
registerAICaptureDomain("timeline", {
  snapshot: buildTimelineCaptureSnapshot,
  diff: buildTimelineCaptureDiffs,
  invariants: runTimelineCaptureInvariants,
  suspicions: buildTimelineCaptureSuspicions,
  commands: [
    "timeline.add_keyframe",
    "timeline.delete_keyframe"
  ],
});
```

Required adapter functions:

- `snapshot`: Return compact semantic state. Prefer counts, IDs, selected entity, and hashes over large arrays.
- `diff`: Compare start and final snapshots. Return stable `id`, `label`, `changed`, `before`, `after`.
- `invariants`: Return stable checks with `id`, `label`, `ok`, and evidence fields.
- `suspicions`: Return warnings when an operation pattern looks wrong even if invariants still pass.

## 3. Wrap Commands

Use `beginAICaptureCommand` for operations with multiple branches:

```js
const finishCapture = beginAICaptureCommand("timeline.delete_keyframe", {
  trackId,
  frame,
}, { domain: "timeline", topologyCommand: false });

if (!deleteSelectedOrCurrentKeyframe()) {
  finishCapture({ ok: false, reason: "nothing_selected" });
  return;
}

finishCapture({ ok: true });
```

Use `runAICaptureCommand` for simple synchronous mutations:

```js
runAICaptureCommand("timeline.add_keyframe", {
  trackId,
  frame,
}, { domain: "timeline" }, () => {
  addKeyframe(trackId, frame);
});
```

## 4. Keep Event IDs Stable

Use dotted IDs:

```text
domain.action.detail
```

Good:

```text
mesh.reset_to_grid
timeline.delete_keyframe
attachment.rename
```

Avoid prose:

```text
user clicked the button to reset the grid
```

## 5. Update Tests

Add the new command IDs to a focused check under `tools/`.

Always run:

```bash
node tools/check-ai-capture-registry.js
node tools/check-ai-capture-mesh.js
node tools/check-cache-busting-assets.js
node --check app/core/runtime.js
```

If you changed another JS file, also run `node --check <file>`.

## 6. Report Shape

A healthy `AI_DEBUG_CAPTURE v3` report is a Readable Summary first, with compact machine evidence at the end.

- `SUMMARY`: duration, domain, UI mode, raw/semantic/command counts.
- `GESTURES`: compressed pointer actions so AI can understand the user's operation without a huge event dump.
- `SUSPICIONS`: stable warning IDs and labels.
- `STATE_DIFF`: changed tracked state only.
- `MACHINE_DATA`: compact JSON for exact checks.

The internal capture may still use structured events with `id`, `domain`, `category`, `intent`, `entity`, and `data`, but Copy should prefer the v3 summary format over dumping the full raw timeline.

Compact machine evidence should include:

- `captureHealth`: raw/semantic/command event counts plus `likelyUseful`.
- `domains`: registered domain coverage and command catalog.
- `startSnapshot` and `finalSnapshot`: domain-specific semantic state.
- `diffs`: what changed.
- `invariants`: stable checks.
- `suspicions`: likely root-cause hints.

## 7. Raw Input Recorder

The Raw Input Recorder is the safety net for features that do not have semantic hooks yet. It records sanitized browser input while AI Capture is active:

- Pointer: `pointerdown`, throttled `pointermove`, `pointerup`, `click`, `dblclick`, `contextmenu`.
- Keyboard: `keydown`, `keyup`; ordinary typed characters are recorded as `character`, not the literal key.
- Form events: `input`, `change`; record `valueLength`, `checked`, and `selectedIndex`, never the raw input value.
- Other UI context: `focus`, `blur`, `wheel`, compact target metadata, and current editor mode.

If `captureHealth.rawEventCount > 0` but semantic/command events are empty, the report should raise `capture.raw_input_without_semantic_events`. If raw input is empty during a longer capture, it should raise `capture.no_raw_input_events_recorded`.
