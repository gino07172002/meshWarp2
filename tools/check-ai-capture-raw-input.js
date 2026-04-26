const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const runtimeSource = [
  fs.readFileSync(path.join(rootDir, "app", "core", "runtime.js"), "utf8"),
  fs.readFileSync(path.join(rootDir, "app", "core", "runtime-ai-capture.js"), "utf8"),
].join("\n");
const indexSource = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
const runbookSource = fs.readFileSync(path.join(rootDir, "docs", "superpowers", "runbooks", "ai-capture-domain-checklist.md"), "utf8");
const failures = [];

for (const snippet of [
  "AI_CAPTURE_RAW_EVENT_LIMIT",
  "AI_CAPTURE_RAW_MOVE_INTERVAL_MS",
  "function sanitizeAICaptureRawTarget",
  "function sanitizeAICaptureKey",
  "function summarizeAICaptureRawEvent",
  "function pushAICaptureRawInputEvent",
  "function installAICaptureRawInputRecorder",
  "function buildAICaptureHealth",
  "captureHealth",
  "rawEventCount",
  "rawDroppedCount",
  "semanticEventCount",
  "likelyUseful",
  "capture.no_raw_input_events_recorded",
  "capture.raw_input_without_semantic_events",
  "capture.domain_mode_mismatch",
]) {
  if (!runtimeSource.includes(snippet)) {
    failures.push(`app/core/runtime.js: missing ${snippet}`);
  }
}

for (const eventName of [
  "pointerdown",
  "pointermove",
  "pointerup",
  "click",
  "dblclick",
  "contextmenu",
  "keydown",
  "keyup",
  "wheel",
  "change",
  "input",
  "focus",
  "blur",
]) {
  if (!runtimeSource.includes(`"${eventName}"`)) {
    failures.push(`app/core/runtime.js: raw recorder must listen for ${eventName}`);
  }
}

if (!/category:\s*"raw_input"/.test(runtimeSource)) {
  failures.push("app/core/runtime.js: raw input events must use category raw_input");
}

if (!/id:\s*`raw\.\$\{/.test(runtimeSource) && !/id:\s*"raw\./.test(runtimeSource)) {
  failures.push("app/core/runtime.js: raw input events must use raw.* IDs");
}

if (!/valueLength/.test(runtimeSource) || /value:\s*target\.value/.test(runtimeSource)) {
  failures.push("app/core/runtime.js: input raw events must record valueLength, not raw input value");
}

if (!/event\.key\.length\s*===\s*1/.test(runtimeSource) || !/\"character\"/.test(runtimeSource)) {
  failures.push("app/core/runtime.js: key sanitization must hide ordinary typed characters");
}

if (!/slotMeshCaptureCopyBtn[\s\S]*?Copy & Stop/.test(indexSource)) {
  failures.push("index.html: Copy button should be labeled Copy & Stop");
}

if (!/Raw Input Recorder/.test(runbookSource) || !/captureHealth/.test(runbookSource)) {
  failures.push("ai-capture-domain-checklist.md: missing Raw Input Recorder and captureHealth guidance");
}

{
  const { ensureAssetVersionAtLeast } = require("./lib/version-floor");
  ensureAssetVersionAtLeast(failures, indexSource, "app/core/runtime.js", "20260424-6", "raw input recorder changes are not hidden by browser cache");
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("AI capture raw input check passed.");
