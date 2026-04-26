const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const runtimeSource = [
  fs.readFileSync(path.join(rootDir, "app", "core", "runtime.js"), "utf8"),
  fs.readFileSync(path.join(rootDir, "app", "core", "runtime-ai-capture.js"), "utf8"),
].join("\n");
const slotsSource = fs.readFileSync(path.join(rootDir, "app", "workspace", "slots.js"), "utf8");
const hotkeysSource = fs.readFileSync(path.join(rootDir, "app", "ui", "hotkeys.js"), "utf8");
const bootstrapSource = fs.readFileSync(path.join(rootDir, "app", "ui", "bootstrap.js"), "utf8");
const indexSource = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");

const failures = [];

if (!/function\s+pushMeshDebugEvent\s*\(/.test(runtimeSource)) {
  failures.push("app/core/runtime.js: missing pushMeshDebugEvent()");
}

if (!/__meshDebugEvents/.test(runtimeSource) || !/__dumpMeshDebugLog/.test(runtimeSource) || !/__clearMeshDebugLog/.test(runtimeSource)) {
  failures.push("app/core/runtime.js: missing mesh debug window helpers");
}

if (!/pushMeshDebugEvent\("slot_mesh_reset_to_grid"/.test(slotsSource)) {
  failures.push("app/workspace/slots.js: Reset To Grid must emit slot_mesh_reset_to_grid log");
}

if (!/pushMeshDebugEvent\("slot_mesh_edit_target"/.test(slotsSource)) {
  failures.push("app/workspace/slots.js: edit target changes must emit slot_mesh_edit_target log");
}

if (!/pushMeshDebugEvent\("slot_mesh_tool_mode"/.test(slotsSource)) {
  failures.push("app/workspace/slots.js: tool mode changes must emit slot_mesh_tool_mode log");
}

if (!/pushMeshDebugEvent\("slot_mesh_pick"/.test(slotsSource)) {
  failures.push("app/workspace/slots.js: mesh point picking must emit slot_mesh_pick log");
}

if (!/pushMeshDebugEvent\("mesh_pointerdown"/.test(hotkeysSource)) {
  failures.push("app/ui/hotkeys.js: mesh pointerdown path must emit mesh_pointerdown log");
}

if (!/pushMeshDebugEvent\("mesh_drag_start"/.test(hotkeysSource)) {
  failures.push("app/ui/hotkeys.js: mesh drag start must emit mesh_drag_start log");
}

if (!/pushMeshDebugEvent\("mesh_drag_first_move"/.test(hotkeysSource)) {
  failures.push("app/ui/hotkeys.js: mesh drag move must emit mesh_drag_first_move log");
}

if (!/pushMeshDebugEvent\("mesh_drag_end"/.test(bootstrapSource)) {
  failures.push("app/ui/bootstrap.js: mesh drag end must emit mesh_drag_end log");
}

const { ensureAssetVersionAtLeast } = require("./lib/version-floor");
ensureAssetVersionAtLeast(failures, indexSource, "app/ui/bootstrap.js", "20260423-2", "mesh debug instrumentation is not hidden by browser cache");
ensureAssetVersionAtLeast(failures, indexSource, "app/core/runtime.js", "20260424-6", "mesh debug instrumentation is not hidden by browser cache");
ensureAssetVersionAtLeast(failures, indexSource, "app/workspace/slots.js", "20260423-4", "mesh debug instrumentation is not hidden by browser cache");
ensureAssetVersionAtLeast(failures, indexSource, "app/ui/hotkeys.js", "20260424-5", "live Grid edit changes are not hidden by browser cache");

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Mesh debug instrumentation check passed.");
