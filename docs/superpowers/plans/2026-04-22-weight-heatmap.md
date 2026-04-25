# Weight Heatmap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current triangle-patch weight overlay with a smoother full-mesh heatmap visualization.

**Architecture:** Keep the existing Canvas 2D overlay entry point, but change the fill stage inside `drawWeightOverlayForMesh()` from triangle-local radial painting to per-pixel barycentric rasterization on an offscreen canvas. Preserve the existing legend, outline, and vertex dots so the UX stays familiar while the fill becomes visually continuous.

**Tech Stack:** Vanilla JS ES modules, Canvas 2D, existing mesh/weight overlay helpers in `app/core/runtime.js`

---

### Task 1: Lock In The Regression Check

**Files:**
- Create: `tools/check-weight-heatmap-render-path.js`
- Test: `tools/check-weight-heatmap-render-path.js`

- [ ] **Step 1: Write the failing test**

```js
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const runtimePath = path.join(rootDir, "app", "core", "runtime.js");
const source = fs.readFileSync(runtimePath, "utf8");
const failures = [];

if (!/function\\s+rasterizeWeightHeatmapTriangle\\s*\\(/.test(source)) {
  failures.push("app/core/runtime.js: missing rasterizeWeightHeatmapTriangle()");
}
if (!/function\\s+drawContinuousWeightHeatmap\\s*\\(/.test(source)) {
  failures.push("app/core/runtime.js: missing drawContinuousWeightHeatmap()");
}
if (!/drawContinuousWeightHeatmap\\(ctx,\\s*m,\\s*meshData,\\s*screenPoints,\\s*vertexInfos,\\s*mode,\\s*selectedBone,\\s*selectedValid,\\s*alphaBase\\)/.test(source)) {
  failures.push("app/core/runtime.js: drawWeightOverlayForMesh() is not using the continuous heatmap path");
}

if (failures.length > 0) {
  console.error(failures.join("\\n"));
  process.exit(1);
}

console.log("Weight heatmap render path check passed.");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tools/check-weight-heatmap-render-path.js`
Expected: FAIL with missing `rasterizeWeightHeatmapTriangle()` / `drawContinuousWeightHeatmap()`

- [ ] **Step 3: Commit**

```bash
git add tools/check-weight-heatmap-render-path.js
git commit -m "test: add weight heatmap render path check"
```

### Task 2: Add Continuous Heatmap Rasterization

**Files:**
- Modify: `app/core/runtime.js`
- Test: `tools/check-weight-heatmap-render-path.js`

- [ ] **Step 1: Write the failing test**

Use the test from Task 1 without modification.

- [ ] **Step 2: Run test to verify it fails**

Run: `node tools/check-weight-heatmap-render-path.js`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

Add helper structure like:

```js
function getWeightHeatmapCanvas(width, height) {
  const w = Math.max(1, Math.ceil(Number(width) || 1));
  const h = Math.max(1, Math.ceil(Number(height) || 1));
  if (!state.weightHeatmapCanvas) state.weightHeatmapCanvas = makeCanvas(w, h);
  const canvas = state.weightHeatmapCanvas;
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  return canvas;
}

function rasterizeWeightHeatmapTriangle(imageData, stride, bounds, points, values, colorize) {
  const edge = (ax, ay, bx, by, px, py) => (px - ax) * (by - ay) - (py - ay) * (bx - ax);
  const [p0, p1, p2] = points;
  const area = edge(p0.x, p0.y, p1.x, p1.y, p2.x, p2.y);
  if (Math.abs(area) < 1e-6) return;
  const invArea = 1 / area;
  for (let y = bounds.minY; y <= bounds.maxY; y += 1) {
    for (let x = bounds.minX; x <= bounds.maxX; x += 1) {
      const px = x + 0.5;
      const py = y + 0.5;
      const w0 = edge(p1.x, p1.y, p2.x, p2.y, px, py) * invArea;
      const w1 = edge(p2.x, p2.y, p0.x, p0.y, px, py) * invArea;
      const w2 = edge(p0.x, p0.y, p1.x, p1.y, px, py) * invArea;
      if (w0 < 0 || w1 < 0 || w2 < 0) continue;
      const value = values[0] * w0 + values[1] * w1 + values[2] * w2;
      const rgba = colorize(value, w0, w1, w2);
      const idx = (y * stride + x) * 4;
      imageData[idx] = rgba.r;
      imageData[idx + 1] = rgba.g;
      imageData[idx + 2] = rgba.b;
      imageData[idx + 3] = rgba.a;
    }
  }
}

function drawContinuousWeightHeatmap(ctx, m, meshData, screenPoints, vertexInfos, mode, selectedBone, selectedValid, alphaBase) {
  // compute mesh bbox
  // create offscreen canvas + image buffer
  // rasterize every triangle with barycentric interpolation
  // putImageData once
  // draw offscreen back to ctx
}
```

Then replace the triangle-loop fill call inside `drawWeightOverlayForMesh()` with:

```js
drawContinuousWeightHeatmap(ctx, m, meshData, screenPoints, vertexInfos, mode, selectedBone, selectedValid, alphaBase);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node tools/check-weight-heatmap-render-path.js`
Expected: PASS

- [ ] **Step 5: Run syntax verification**

Run: `node --check app/core/runtime.js`
Expected: no output

- [ ] **Step 6: Commit**

```bash
git add app/core/runtime.js tools/check-weight-heatmap-render-path.js
git commit -m "feat: rasterize continuous mesh weight heatmap"
```

### Task 3: Re-run Existing Regression Checks

**Files:**
- Test: `tools/check-legacy-slot-mesh.js`
- Test: `tools/check-legacy-project-upgrade.js`
- Test: `tools/check-region-attachment-render-path.js`
- Test: `tools/check-import-default-mesh.js`
- Test: `tools/check-linkedmesh-parent-and-ghosts.js`
- Test: `tools/check-edit-bone-endpoint-drag.js`
- Test: `tools/check-edit-bone-joint-tip-preservation.js`

- [ ] **Step 1: Run attachment/mesh checks**

Run:

```bash
node tools/check-legacy-slot-mesh.js
node tools/check-legacy-project-upgrade.js
node tools/check-region-attachment-render-path.js
node tools/check-import-default-mesh.js
node tools/check-linkedmesh-parent-and-ghosts.js
node tools/check-edit-bone-endpoint-drag.js
node tools/check-edit-bone-joint-tip-preservation.js
```

Expected: all PASS

- [ ] **Step 2: Commit**

```bash
git add app/core/runtime.js tools/check-weight-heatmap-render-path.js
git commit -m "test: verify continuous weight heatmap against existing regressions"
```
