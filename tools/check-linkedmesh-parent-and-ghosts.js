const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const bonesPath = path.join(rootDir, "app", "core", "bones.js");
const treeBindingsPath = path.join(rootDir, "app", "io", "tree-bindings.js");
const constraintsPath = path.join(rootDir, "app", "render", "constraints.js");

const bonesSource = fs.readFileSync(bonesPath, "utf8");
const treeBindingsSource = fs.readFileSync(treeBindingsPath, "utf8");
const constraintsSource = fs.readFileSync(constraintsPath, "utf8");

const failures = [];

if (!/if \(t !== "mesh" && t !== "linkedmesh"\) continue;/.test(bonesSource)) {
  failures.push("app/core/bones.js: linkedmesh parent picker must only list mesh/linkedmesh attachments");
}

if (!/const fallbackParent = ensureSlotAttachments\(slot\)\.find\(\(att\) => att && att\.name !== \(current && current\.name\) && isDeformableAttachment\(att\)\);/.test(treeBindingsSource)) {
  failures.push("app/io/tree-bindings.js: linkedmesh fallback parent must only use deformable attachments");
}

if (!/const rect =\s*att\.rect[\s\S]*?slot\.rect[\s\S]*?const corners = \[\s*\{ x: Number\(rect\.x\) \|\| 0, y: Number\(rect\.y\) \|\| 0 \}/.test(constraintsSource)) {
  failures.push("app/render/constraints.js: ghost attachment outlines must be based on attachment rect geometry");
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Linkedmesh parent and ghost outline checks passed.");
