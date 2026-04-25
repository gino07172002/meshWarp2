const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const runtimeSource = fs.readFileSync(path.join(rootDir, "app", "core", "runtime.js"), "utf8");
const agentsSource = fs.readFileSync(path.join(rootDir, "AGENTS.md"), "utf8");
const indexSource = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
const failures = [];

for (const snippet of [
  "const AI_CAPTURE_DOMAIN_REGISTRY",
  "function registerAICaptureDomain",
  "function getAICaptureDomain",
  "function listAICaptureDomains",
  "function getAICaptureDomainSnapshot",
  "function getAICaptureDomainDiffs",
  "function getAICaptureDomainInvariants",
  "function getAICaptureDomainSuspicions",
  "function buildAICaptureDomainCoverage",
  "function runAICaptureCommand",
  "registerAICaptureDomain(\"mesh\"",
  "snapshot: buildMeshCaptureSnapshot",
  "diff: buildMeshCaptureDiffs",
  "invariants: runMeshCaptureInvariants",
  "suspicions: buildAICaptureSuspicions",
  "domains: buildAICaptureDomainCoverage",
  "window.__registerAICaptureDomain = registerAICaptureDomain",
  "window.__listAICaptureDomains = listAICaptureDomains",
]) {
  if (!runtimeSource.includes(snippet)) {
    failures.push(`app/core/runtime.js: missing ${snippet}`);
  }
}

if (/state\.aiCapture\.domain === "mesh"\s*\?\s*buildMeshCaptureSnapshot/.test(runtimeSource)) {
  failures.push("app/core/runtime.js: start/mark/report snapshot flow must use the registry, not a mesh-only conditional");
}

for (const commandId of [
  "mesh.tool.toggle_add_vertex",
  "mesh.edit_target.boundary",
  "mesh.edit_target.grid",
  "mesh.reset_to_grid",
  "mesh.hotkey.delete_vertex",
]) {
  if (!runtimeSource.includes(`"${commandId}"`)) {
    failures.push(`app/core/runtime.js: mesh domain command catalog missing ${commandId}`);
  }
}

for (const docPath of [
  "docs/superpowers/specs/2026-04-24-ai-capture-registry-design.md",
  "docs/superpowers/runbooks/ai-capture-domain-checklist.md",
]) {
  const fullPath = path.join(rootDir, docPath);
  if (!fs.existsSync(fullPath)) {
    failures.push(`${docPath}: missing AI Capture registry documentation`);
    continue;
  }
  const text = fs.readFileSync(fullPath, "utf8");
  for (const required of ["registerAICaptureDomain", "runAICaptureCommand", "snapshot", "diff", "invariants", "suspicions"]) {
    if (!text.includes(required)) {
      failures.push(`${docPath}: missing ${required}`);
    }
  }
}

if (!/AI Capture Observability/.test(agentsSource) || !/runbooks\/ai-capture-domain-checklist\.md/.test(agentsSource)) {
  failures.push("AGENTS.md: missing AI Capture Observability instructions and checklist link");
}

{
  const { ensureAssetVersionAtLeast } = require("./lib/version-floor");
  ensureAssetVersionAtLeast(failures, indexSource, "app/core/runtime.js", "20260424-6", "AI Capture registry changes are not hidden by browser cache");
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("AI capture registry check passed.");
