const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const bonesPath = path.join(rootDir, "app", "core", "bones.js");
const source = fs.readFileSync(bonesPath, "utf8");

const failures = [];

if (!/const childTips = new Map\(\);/.test(source)) {
  failures.push("app/core/bones.js: moveEditBoneEndpointAndConnectedJoint() must snapshot child tips before moving the shared joint");
}

if (!/childTips\.set\(childIndex,\s*childEp\.tip\);/.test(source)) {
  failures.push("app/core/bones.js: connected child tip snapshots are not captured before parent joint movement");
}

if (!/const nextTip = childTips\.get\(childIndex\) \|\| childEp\.tip;/.test(source)) {
  failures.push("app/core/bones.js: connected child endpoint update must preserve the pre-move tip");
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Edit bone joint tip preservation check passed.");
