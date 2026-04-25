const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const slotsPath = path.join(rootDir, "app", "workspace", "slots.js");
const constraintsPath = path.join(rootDir, "app", "render", "constraints.js");
const runtimePath = path.join(rootDir, "app", "core", "runtime.js");
const constraintPanelsPath = path.join(rootDir, "app", "ui", "constraint-panels.js");
const hotkeysPath = path.join(rootDir, "app", "ui", "hotkeys.js");
const indexPath = path.join(rootDir, "index.html");
const stylesPath = path.join(rootDir, "styles.css");

const slotsSource = fs.readFileSync(slotsPath, "utf8");
const constraintsSource = fs.readFileSync(constraintsPath, "utf8");
const runtimeSource = fs.readFileSync(runtimePath, "utf8");
const constraintPanelsSource = fs.readFileSync(constraintPanelsPath, "utf8");
const hotkeysSource = fs.readFileSync(hotkeysPath, "utf8");
const indexSource = fs.readFileSync(indexPath, "utf8");
const stylesSource = fs.readFileSync(stylesPath, "utf8");

const failures = [];

if (!/function\s+buildSlotMeshDefaultContourPoints\s*\(/.test(slotsSource)) {
  failures.push("app/workspace/slots.js: missing default contour bounds helper");
}

if (/contour\.points\s*=\s*cloneSlotMeshPoints\(contour\.fillPoints\)/.test(slotsSource)) {
  failures.push("app/workspace/slots.js: syncSlotContourFromMeshData must not seed author contour from every fill/grid point");
}

if (/state\.slotMesh\.activeSet\s*=\s*"fill"/.test(slotsSource)) {
  failures.push("app/workspace/slots.js: mesh edit sync must not force activeSet to fill/grid vertices");
}

if (/const\s+showContourLayer\s*=\s*!\(contour\.fillFromMeshData\s*&&\s*!contour\.dirty\)/.test(constraintsSource)) {
  failures.push("app/render/constraints.js: slot mesh contour layer must stay visible while clean grid preview is shown");
}

if (!/function\s+setSlotMeshToolMode\s*\([^)]*\)\s*\{[\s\S]*?if\s*\(next\s*===\s*"add"\)[\s\S]*?setSlotMeshEditTarget\("boundary",\s*false\)/.test(slotsSource)) {
  failures.push("app/workspace/slots.js: Add Vertex tool mode must switch interaction focus to boundary vertices");
}

if (!/editTarget:\s*"boundary"/.test(runtimeSource)) {
  failures.push("app/core/runtime.js: slotMesh state must default editTarget to boundary");
}

if (!/slotMeshBoundaryEditBtn:\s*document\.getElementById\("slotMeshBoundaryEditBtn"\)/.test(runtimeSource)) {
  failures.push("app/core/runtime.js: missing Boundary edit target DOM ref");
}

if (!/slotMeshGridEditBtn:\s*document\.getElementById\("slotMeshGridEditBtn"\)/.test(runtimeSource)) {
  failures.push("app/core/runtime.js: missing Grid edit target DOM ref");
}

if (!/function\s+normalizeSlotMeshEditTarget\s*\(/.test(slotsSource)) {
  failures.push("app/workspace/slots.js: missing normalizeSlotMeshEditTarget()");
}

if (!/function\s+setSlotMeshEditTarget\s*\(/.test(slotsSource)) {
  failures.push("app/workspace/slots.js: missing setSlotMeshEditTarget()");
}

if (!/function\s+setSlotMeshEditTarget\s*\([^)]*\)\s*\{[\s\S]*?next\s*===\s*"grid"[\s\S]*?state\.slotMesh\.toolMode\s*=\s*"select"[\s\S]*?refreshSlotMeshToolModeUI\(\)/.test(slotsSource)) {
  failures.push("app/workspace/slots.js: switching to Grid edit target must force Select tool so grid vertices can be picked");
}

if (!/function\s+getSlotMeshEditSetName\s*\(/.test(slotsSource)) {
  failures.push("app/workspace/slots.js: missing getSlotMeshEditSetName()");
}

if (!/pickSlotContourPoint[\s\S]*?const\s+targetSet\s*=\s*getSlotMeshEditSetName\(\)/.test(slotsSource)) {
  failures.push("app/workspace/slots.js: point picking must be limited by current Boundary/Grid edit target");
}

if (!/function\s+setSlotMeshToolMode\s*\([^)]*\)[\s\S]*?setSlotMeshEditTarget\("boundary",\s*false\)/.test(slotsSource)) {
  failures.push("app/workspace/slots.js: Add Vertex mode must switch to Boundary edit target");
}

if (!/resetSlotMeshToGrid[\s\S]*?setSlotMeshEditTarget\("grid",\s*false\)/.test(slotsSource)) {
  failures.push("app/workspace/slots.js: Reset To Grid must switch to Grid edit target");
}

if (!/slotMeshBoundaryEditBtn/.test(indexSource) || !/slotMeshGridEditBtn/.test(indexSource)) {
  failures.push("index.html: missing Boundary/Grid edit target UI buttons");
}

{
  const { ensureAssetVersionAtLeast } = require("./lib/version-floor");
  for (const [asset, floor] of Object.entries({
    "styles.css": "20260424-2",
    "app/core/runtime.js": "20260424-6",
    "app/core/bones.js": "20260423-1",
    "app/workspace/workspace.js": "20260423-1",
    "app/workspace/slots.js": "20260423-4",
    "app/render/constraints.js": "20260424-1",
    "app/ui/constraint-panels.js": "20260424-2",
    "app/ui/hotkeys.js": "20260424-5",
    "app/ui/bootstrap.js": "20260423-2",
  })) {
    ensureAssetVersionAtLeast(failures, indexSource, asset, floor, "Mesh Grid edit changes are not hidden by browser cache");
  }
}

if (!/slotmesh-edit-target/.test(stylesSource)) {
  failures.push("styles.css: missing slot mesh edit target UI styling");
}

if (!/slotMeshBoundaryEditBtn[\s\S]*?setSlotMeshEditTarget\("boundary",\s*true\)/.test(constraintPanelsSource)) {
  failures.push("app/ui/constraint-panels.js: Boundary edit button must switch edit target");
}

if (!/slotMeshGridEditBtn[\s\S]*?setSlotMeshEditTarget\("grid",\s*true\)/.test(constraintPanelsSource)) {
  failures.push("app/ui/constraint-panels.js: Grid edit button must switch edit target");
}

if (!/slotMeshGridFillBtn[\s\S]*?setSlotMeshEditTarget\("grid",\s*false\)/.test(constraintPanelsSource)) {
  failures.push("app/ui/constraint-panels.js: Grid Fill must switch to Grid edit target");
}

if (!/const\s+activeSet\s*=\s*getSlotMeshEditSetName\(\)/.test(hotkeysSource)) {
  failures.push("app/ui/hotkeys.js: keyboard deletion must use editTarget-derived active set");
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Slot mesh contour editing check passed.");
