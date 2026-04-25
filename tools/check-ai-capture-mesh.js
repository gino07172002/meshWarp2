const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const indexSource = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
const runtimeSource = fs.readFileSync(path.join(rootDir, "app", "core", "runtime.js"), "utf8");
const panelsSource = fs.readFileSync(path.join(rootDir, "app", "ui", "constraint-panels.js"), "utf8");

const failures = [];

for (const id of ["slotMeshCaptureStartBtn", "slotMeshCaptureMarkBtn", "slotMeshCaptureCopyBtn"]) {
  if (!indexSource.includes(`id="${id}"`)) {
    failures.push(`index.html: missing ${id} AI capture control`);
  }
  if (!new RegExp(`${id}:\\s*document\\.getElementById\\("${id}"\\)`).test(runtimeSource)) {
    failures.push(`app/core/runtime.js: missing ${id} DOM ref`);
  }
}

if (!/class="topbar-right"[\s\S]*?class="ai-capture-bar"/.test(indexSource)) {
  failures.push("index.html: AI Capture controls must live in the topbar right area");
}

if (!/\.ai-capture-bar/.test(fs.readFileSync(path.join(rootDir, "styles.css"), "utf8"))) {
  failures.push("styles.css: missing AI Capture topbar styling");
}

for (const snippet of [
  "aiCapture:",
  "function pushAICaptureEvent",
  "function beginAICaptureCommand",
  "function startAICapture",
  "function markAICaptureIssue",
  "function buildAICaptureReport",
  "function copyAICaptureReport",
  "function buildMeshCaptureSnapshot",
  "function buildMeshCaptureDiffs",
  "function buildAICaptureSuspicions",
  "function runMeshCaptureInvariants",
  "AI_DEBUG_CAPTURE v3",
  "schemaVersion: 3",
]) {
  if (!runtimeSource.includes(snippet)) {
    failures.push(`app/core/runtime.js: missing ${snippet}`);
  }
}

if (!/id:\s*(?:options\.id\s*\|\|\s*)?buildAICaptureEventId/.test(runtimeSource)) {
  failures.push("app/core/runtime.js: AI capture event id must use buildAICaptureEventId(), with optional explicit override");
}

for (const [field, resolver] of [
  ["category", "resolveAICaptureEventCategory"],
  ["entity", "buildAICaptureEntity"],
  ["intent", "resolveAICaptureIntent"],
]) {
  if (!new RegExp(`${field}:\\s*(?:options\\.${field}\\s*\\|\\|\\s*)?${resolver}`).test(runtimeSource)) {
    failures.push(`app/core/runtime.js: AI capture event field ${field} must use ${resolver}()`);
  }
}
if (!/const\s+domain\s*=\s*options\.domain\s*\|\|\s*resolveAICaptureEventDomain/.test(runtimeSource)) {
  failures.push("app/core/runtime.js: AI capture event domain must use resolveAICaptureEventDomain()");
}

if (!/pushMeshDebugEvent[\s\S]*?pushAICaptureEvent/.test(runtimeSource)) {
  failures.push("app/core/runtime.js: mesh debug events must feed the active AI capture timeline through pushAICaptureEvent()");
}

for (const invariantId of [
  "mesh.active_attachment_has_mesh_data",
  "mesh.uv_count_matches_vertex_count",
  "mesh.sampled_indices_in_range",
  "mesh.triangle_count_nonzero",
  "mesh.grid_drag_preserves_topology_without_topology_command",
]) {
  if (!runtimeSource.includes(invariantId)) {
    failures.push(`app/core/runtime.js: missing invariant id ${invariantId}`);
  }
}

for (const commandId of [
  "mesh.tool.toggle_add_vertex",
  "mesh.edit_target.boundary",
  "mesh.edit_target.grid",
  "mesh.close_loop",
  "mesh.triangulate_preview",
  "mesh.grid_fill_preview",
  "mesh.auto_foreground_preview",
  "mesh.apply",
  "mesh.create_slot_and_apply",
  "mesh.link_edge",
  "mesh.unlink_edge",
  "mesh.reset_to_grid",
]) {
  if (!panelsSource.includes(`beginAICaptureCommand("${commandId}"`)) {
    failures.push(`app/ui/constraint-panels.js: missing AI command capture for ${commandId}`);
  }
}

for (const commandId of [
  "mesh.hotkey.toggle_add_vertex",
  "mesh.hotkey.triangulate_preview",
  "mesh.hotkey.delete_vertex",
]) {
  if (!fs.readFileSync(path.join(rootDir, "app", "ui", "hotkeys.js"), "utf8").includes(`beginAICaptureCommand("${commandId}"`)) {
    failures.push(`app/ui/hotkeys.js: missing AI command capture for ${commandId}`);
  }
}

if (!/rawGestures/.test(runtimeSource) || !/diffs,\s*\n\s*suspicions,/.test(runtimeSource)) {
  failures.push("app/core/runtime.js: AI capture report must include rawGestures, diffs, and suspicions");
}

if (!/navigator\.clipboard\.writeText/.test(runtimeSource)) {
  failures.push("app/core/runtime.js: AI capture report must be copyable without opening DevTools");
}

if (!/slotMeshCaptureStartBtn[\s\S]*?startAICapture\("mesh"\)/.test(panelsSource)) {
  failures.push("app/ui/constraint-panels.js: Start Capture button must start mesh capture");
}

if (!/slotMeshCaptureMarkBtn[\s\S]*?markAICaptureIssue/.test(panelsSource)) {
  failures.push("app/ui/constraint-panels.js: Mark Issue button must add a capture marker");
}

if (!/slotMeshCaptureCopyBtn[\s\S]*?copyAICaptureReport/.test(panelsSource)) {
  failures.push("app/ui/constraint-panels.js: Copy Report button must copy the capture report");
}

{
  const { ensureAssetVersionAtLeast } = require("./lib/version-floor");
  for (const [asset, floor] of Object.entries({
    "app/core/runtime.js": "20260424-6",
    "app/ui/constraint-panels.js": "20260424-2",
    "app/ui/hotkeys.js": "20260424-5",
  })) {
    ensureAssetVersionAtLeast(failures, indexSource, asset, floor, "AI Capture controls are not hidden by browser cache");
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("AI mesh capture check passed.");
