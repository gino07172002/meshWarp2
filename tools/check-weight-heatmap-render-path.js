const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const runtimePath = path.join(rootDir, "app", "core", "runtime.js");
const source = fs.readFileSync(runtimePath, "utf8");
const failures = [];

if (!/function\s+rasterizeWeightHeatmapTriangle\s*\(/.test(source)) {
  failures.push("app/core/runtime.js: missing rasterizeWeightHeatmapTriangle()");
}
if (!/function\s+drawContinuousWeightHeatmap\s*\(/.test(source)) {
  failures.push("app/core/runtime.js: missing drawContinuousWeightHeatmap()");
}
if (!/drawContinuousWeightHeatmap\(ctx,\s*m,\s*meshData,\s*screenPoints,\s*vertexInfos,\s*mode,\s*selectedBone,\s*selectedValid,\s*alphaBase\)/.test(source)) {
  failures.push("app/core/runtime.js: drawWeightOverlayForMesh() is not using the continuous heatmap path");
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Weight heatmap render path check passed.");
