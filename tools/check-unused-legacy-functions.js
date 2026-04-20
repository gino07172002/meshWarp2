const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");

const checks = [
  { file: "app/core/runtime.js", name: "moveCommandPaletteSelection" },
  { file: "app/core/runtime.js", name: "createDefaultBones" },
  { file: "app/render/canvas.js", name: "getRootBonePivotLocal" },
  { file: "app/render/canvas.js", name: "scalePointAroundPivot" },
  { file: "app/render/constraints.js", name: "applyPathConstraintsToBones" },
  { file: "app/render/constraints.js", name: "solveTwoBoneHeadTarget" },
  { file: "app/render/constraints.js", name: "applyTransformConstraintsToBones" },
  { file: "app/render/constraints.js", name: "applyIKConstraintsToBones" },
  { file: "app/render/constraints.js", name: "drawMesh2D" },
  { file: "app/render/state-machine.js", name: "getStateParamCurrentValue" },
  { file: "app/workspace/slots.js", name: "getGridPointListFromMeshData" },
  { file: "app/workspace/slots.js", name: "snapContourPointsToUniformGrid" },
  { file: "app/workspace/slots.js", name: "getSlotMeshDensityHints" },
  { file: "app/workspace/slots.js", name: "ensureDefaultSlotBone" },
];

const failures = [];

for (const check of checks) {
  const filePath = path.join(rootDir, check.file);
  const source = fs.readFileSync(filePath, "utf8");
  const pattern = new RegExp(`function\\s+${check.name}\\s*\\(`);
  if (pattern.test(source)) {
    failures.push(`${check.file}: found legacy unused function ${check.name}`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Legacy unused function check passed for ${checks.length} functions.`);
