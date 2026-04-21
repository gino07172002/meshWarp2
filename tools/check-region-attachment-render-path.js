const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const constraintsPath = path.join(rootDir, "app", "render", "constraints.js");
const canvasPath = path.join(rootDir, "app", "render", "canvas.js");

const constraintsSource = fs.readFileSync(constraintsPath, "utf8");
const canvasSource = fs.readFileSync(canvasPath, "utf8");

const failures = [];

if (!/function\s+buildRegionAttachmentGeometry\s*\(/.test(constraintsSource)) {
  failures.push("app/render/constraints.js: missing buildRegionAttachmentGeometry()");
}

if (!/function\s+buildRenderableAttachmentGeometry\s*\(/.test(canvasSource)) {
  failures.push("app/render/canvas.js: missing buildRenderableAttachmentGeometry()");
}

if (!/ATTACHMENT_TYPES\.REGION/.test(canvasSource) || !/buildRegionAttachmentGeometry\(slot,\s*poseWorld\)/.test(canvasSource)) {
  failures.push("app/render/canvas.js: region attachments are not routed through a dedicated render geometry path");
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Region attachment render path check passed.");
