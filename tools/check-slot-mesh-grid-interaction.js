const path = require("path");
const fs = require("fs");
const { runInteractionChecks } = require("./lib/slot-mesh-grid-live-edit-checks");

const rootDir = path.resolve(__dirname, "..");
const failures = runInteractionChecks(rootDir);
const runtimeSource = fs.readFileSync(path.join(rootDir, "app", "core", "runtime.js"), "utf8");
const slotsSource = fs.readFileSync(path.join(rootDir, "app", "workspace", "slots.js"), "utf8");

if (!/toolRestoreTarget:\s*"/.test(runtimeSource)) {
  failures.push("app/core/runtime.js: slotMesh state must remember which edit target to restore after Add Vertex");
}

if (!/function\s+setSlotMeshToolMode\s*\([^)]*\)\s*\{[\s\S]*?next\s*===\s*"add"[\s\S]*?toolRestoreTarget[\s\S]*?setSlotMeshEditTarget\("boundary",\s*false\)[\s\S]*?else if\s*\(prevMode\s*===\s*"add"\s*&&\s*next\s*===\s*"select"\)[\s\S]*?setSlotMeshEditTarget\(restoreTarget,\s*false\)/.test(slotsSource)) {
  failures.push("app/workspace/slots.js: toggling Add Vertex back to Select must restore the previous Grid/Boundary edit target");
}

if (!/function\s+applyLiveGridPointsToSlotMesh\s*\(/.test(slotsSource)) {
  failures.push("app/workspace/slots.js: missing applyLiveGridPointsToSlotMesh() helper for live Grid dragging");
}

if (!/function\s+applyLiveGridPointsToSlotMesh\s*\([^)]*\)\s*\{[\s\S]*?meshData\.uvs[\s\S]*?meshData\.positions\[i \* 2\][\s\S]*?meshData\.positions\[i \* 2 \+ 1\]/.test(slotsSource)) {
  failures.push("app/workspace/slots.js: live Grid helper must update positions while preserving existing UV mapping");
}

const hotkeysSource = fs.readFileSync(path.join(rootDir, "app", "ui", "hotkeys.js"), "utf8");

if (!/if\s*\(state\.drag\.type === "slot_mesh_point"\)[\s\S]*?else\s*\{[\s\S]*?applyLiveGridPointsToSlotMesh\(slot\)/.test(hotkeysSource)) {
  failures.push("app/ui/hotkeys.js: single-point Grid drag must use live position sync instead of rebuilding UVs");
}

if (!/if\s*\(state\.drag\.type === "slot_mesh_multi_move"\)[\s\S]*?else\s*\{[\s\S]*?applyLiveGridPointsToSlotMesh\(slot\)/.test(hotkeysSource)) {
  failures.push("app/ui/hotkeys.js: multi-point Grid drag must use live position sync instead of rebuilding UVs");
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Slot mesh Grid interaction check passed.");
