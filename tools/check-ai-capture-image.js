const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const indexSource = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
const workspaceSource = fs.readFileSync(path.join(rootDir, "app", "image", "image-workspace.js"), "utf8");
const ioSource = fs.readFileSync(path.join(rootDir, "app", "image", "image-io.js"), "utf8");
const bridgeSource = fs.readFileSync(path.join(rootDir, "app", "core", "runtime-ai-bridge.js"), "utf8");
const agentsSource = fs.readFileSync(path.join(rootDir, "AGENTS.md"), "utf8");

const failures = [];

for (const snippet of [
  'registerAICaptureDomain("image"',
  "snapshot: buildImageCaptureSnapshot",
  "diff: buildImageCaptureDiffs",
  "invariants: runImageCaptureInvariants",
  "suspicions: buildImageCaptureSuspicions",
]) {
  if (!workspaceSource.includes(snippet)) {
    failures.push(`app/image/image-workspace.js: missing ${snippet}`);
  }
}

for (const commandId of [
  "image.load",
  "image.crop",
  "image.rotate",
  "image.flip",
  "image.scale",
  "image.remove_background",
  "image.apply_to_attachment",
  "image.send_to_new_slot",
  "image.edit_attachment",
]) {
  if (!workspaceSource.includes(`"${commandId}"`)) {
    failures.push(`app/image/image-workspace.js: image domain command catalog missing ${commandId}`);
  }
}

for (const commandId of [
  "image.rotate",
  "image.flip",
  "image.scale",
  "image.remove_background",
  "image.apply_to_attachment",
  "image.send_to_new_slot",
  "image.edit_attachment",
  "image.load",
]) {
  if (!ioSource.includes(`runImageCaptureCommand("${commandId}"`)) {
    failures.push(`app/image/image-io.js: missing AI capture wrapper for ${commandId}`);
  }
}

for (const toolId of [
  "ai.image_load",
  "ai.image_crop",
  "ai.image_rotate",
  "ai.image_flip",
  "ai.image_scale",
  "ai.image_remove_bg",
  "ai.image_apply_to_attachment",
  "ai.image_export_png",
]) {
  if (!bridgeSource.includes(`id: "${toolId}"`) && !bridgeSource.includes(`"${toolId}":`)) {
    failures.push(`app/core/runtime-ai-bridge.js: missing ${toolId}`);
  }
}

if (!/domain:\s*"image"/.test(bridgeSource)) {
  failures.push("app/core/runtime-ai-bridge.js: image bridge tools must use the image capture domain");
}

if (!/Image Workspace/.test(agentsSource) || !/ai\.image_load/.test(agentsSource)) {
  failures.push("AGENTS.md: missing Image Workspace AI bridge notes");
}

{
  const { ensureAssetVersionAtLeast } = require("./lib/version-floor");
  for (const [asset, floor] of Object.entries({
    "app/core/runtime-els.js": "20260509-2",
    "app/image/image-workspace.js": "20260509-5",
    "app/image/image-io.js": "20260509-5",
    "app/core/runtime-ai-bridge.js": "20260509-1",
  })) {
    ensureAssetVersionAtLeast(failures, indexSource, asset, floor, "Image Workspace capture and AI bridge changes are not hidden by browser cache");
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("AI image capture check passed.");
