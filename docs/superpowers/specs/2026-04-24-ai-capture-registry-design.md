# AI Capture Registry Design

## Goal

Create a stable AI-observability layer for editor features. The report should tell an AI what the user intended, what domain state changed, which invariants failed, and which suspicious patterns were detected.

## Architecture

AI Capture has a small core plus domain adapters.

```js
registerAICaptureDomain("mesh", {
  snapshot,
  diff,
  invariants,
  suspicions,
  commands,
});
```

The core owns capture lifecycle, event shape, command wrapping, report building, clipboard export, and registry lookup. Domain adapters own semantic knowledge: what to snapshot, how to diff it, which invariants matter, and which suspicions should be raised.

## Command Flow

Feature code should capture meaningful user operations with:

```js
const finishCapture = beginAICaptureCommand("mesh.reset_to_grid", {
  buttonId: "slotMeshResetBtn",
}, { topologyCommand: true });

// mutate editor state

finishCapture({ ok: true });
```

For simple synchronous commands, `runAICaptureCommand` can wrap the mutation:

```js
runAICaptureCommand("mesh.reset_to_grid", {
  buttonId: "slotMeshResetBtn",
}, { domain: "mesh", topologyCommand: true }, () => {
  resetSlotMeshToGrid(slot);
});
```

The report stores stable IDs, not prose-only logs:

```json
{
  "id": "mesh.reset_to_grid",
  "category": "command",
  "domain": "mesh",
  "intent": "mesh.reset_to_grid",
  "topologyCommand": true,
  "data": { "ok": true }
}
```

## Mesh Adapter

Mesh is the first registered domain. It provides:

- `snapshot`: UI mode, slot, attachment, mesh vertex/UV/index counts and hashes, contour/fill summaries.
- `diff`: vertex count, triangle count, position hash, UV hash, index hash, grid metadata, topology command count.
- `invariants`: meshData presence, UV count matches vertex count, sampled indices are in range, nonzero triangles, grid drag preserves topology when no topology command ran.
- `suspicions`: grid drag changed vertex count/UV/index without a topology command.

## Memory Drift Protection

The design is intentionally stored in repo files instead of relying on chat memory.

- `AGENTS.md` links to the AI Capture checklist.
- `tools/check-ai-capture-registry.js` requires the registry, mesh adapter, report coverage, and documentation.
- `docs/superpowers/runbooks/ai-capture-domain-checklist.md` gives the exact steps for adding new domains.

When a future AI adds a feature, the expected workflow is: read `AGENTS.md`, use the checklist, add or update a domain adapter, wrap commands, and run the registry check.
