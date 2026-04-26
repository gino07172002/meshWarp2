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
  "AI_DEBUG_CAPTURE v3",
  "function buildAICaptureGestureSummary",
  "function formatAICaptureTargetLabel",
  "function formatAICaptureSummaryReport",
  "function buildAICaptureCompactMachineData",
  "SUMMARY",
  "GESTURES",
  "SUSPICIONS",
  "STATE_DIFF",
  "MACHINE_DATA",
  "schemaVersion: 3",
  "rawGestureCount",
  "compressionRatio",
]) {
  if (!runtimeSource.includes(snippet)) {
    failures.push(`app/core/runtime.js: missing ${snippet}`);
  }
}

if (!/buildAICaptureReport[\s\S]*?formatAICaptureSummaryReport/.test(runtimeSource)) {
  failures.push("app/core/runtime.js: buildAICaptureReport() must emit the v3 summary report");
}

if (/timeline:\s*state\.aiCapture\.events\.slice\(\)/.test(runtimeSource)) {
  failures.push("app/core/runtime.js: v3 report should not dump the full raw timeline by default");
}

if (!/rawGestures/.test(runtimeSource) || !/machineData/.test(runtimeSource)) {
  failures.push("app/core/runtime.js: v3 report must include rawGestures and compact machineData");
}

{
  const { ensureAssetVersionAtLeast } = require("./lib/version-floor");
  ensureAssetVersionAtLeast(failures, indexSource, "app/core/runtime.js", "20260424-6", "v3 summary report changes are not hidden by browser cache");
}

if (!/AI_DEBUG_CAPTURE v3/.test(runbookSource) || !/Readable Summary/.test(runbookSource) || !/MACHINE_DATA/.test(runbookSource)) {
  failures.push("ai-capture-domain-checklist.md: missing v3 summary report guidance");
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("AI capture summary report check passed.");
