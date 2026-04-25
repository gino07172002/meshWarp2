# Mesh Weight Heatmap Design

**Date:** 2026-04-22
**Goal:** Make rig weight visualization on mesh read like a continuous full-mesh heatmap instead of visibly triangle-by-triangle patches.

## Problem

The current weight overlay is not discrete per vertex, but it is still rendered triangle-by-triangle. Each triangle is filled with layered radial gradients derived from its three vertices, then vertex dots are drawn on top. This produces visible patch boundaries, especially on coarse meshes or sharp weight transitions.

Current implementation lives in:
- `app/core/runtime.js`
  - `drawWeightTriangleGradient()`
  - `drawWeightOverlayForMesh()`
- `app/render/constraints.js`
  - calls `drawWeightOverlayForMesh()`

## Desired Result

The overlay should feel like one continuous heatmap across the whole mesh:
- smooth weight falloff across triangle boundaries
- no obvious per-triangle painted look
- existing mesh outline, legend, and vertex dots stay intact
- existing `selected` and `dominant` modes remain available

## Proposed Approach

Replace the per-triangle radial-gradient fill with per-pixel barycentric rasterization into an offscreen canvas:

1. For each triangle, rasterize its screen-space bounding box.
2. For each covered pixel, compute barycentric weights.
3. Interpolate the visualization scalar:
   - `selected` mode: selected bone weight
   - `dominant` mode: interpolate full bone weights first, then pick dominant bone and strength per pixel
4. Convert the interpolated scalar to a color:
   - `selected`: existing heatmap palette
   - `dominant`: existing bone hue family, but resolved per pixel instead of per triangle
5. Write into an offscreen image/canvas and composite it once back onto the main overlay canvas.

This keeps rendering in Canvas 2D and does not require changing the WebGL path.

## Non-Goals

- No UI changes to weight overlay controls
- No change to actual rig weights
- No change to vertex selection, pinning, or legend behavior
- No WebGL implementation in this task

## Risks

- Per-pixel rasterization can be slower on very dense meshes
- Dominant-mode color transitions may become visually noisy if not slightly alpha-softened

## Mitigations

- Rasterize only within each triangle bounding box
- Reuse one offscreen canvas per draw call size when practical
- Keep mesh outline and vertex dots so precision editing remains readable

## Acceptance Criteria

- Weight overlay appears visually continuous across triangle boundaries
- `selected` mode reads like a smooth thermal map over the whole mesh
- `dominant` mode reads smoother than before without losing bone identity
- Existing legend and vertex dots still render correctly
- No regressions in syntax or existing attachment/mesh verification scripts
