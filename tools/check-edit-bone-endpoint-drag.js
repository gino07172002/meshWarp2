const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const bonesPath = path.join(rootDir, "app", "core", "bones.js");
const hotkeysPath = path.join(rootDir, "app", "ui", "hotkeys.js");

const bonesSource = fs.readFileSync(bonesPath, "utf8");
const hotkeysSource = fs.readFileSync(hotkeysPath, "utf8");

const failures = [];

if (!/function\s+moveEditBoneEndpointAndConnectedJoint\s*\(/.test(bonesSource)) {
  failures.push("app/core/bones.js: missing moveEditBoneEndpointAndConnectedJoint()");
}

if (!/getConnectedChildBoneIndices/.test(bonesSource)) {
  failures.push("app/core/bones.js: missing connected-child joint helper");
}

if (!/moveEditBoneEndpointAndConnectedJoint\(bones,\s*state\.drag\.boneIndex,\s*"head",\s*local\)/.test(hotkeysSource)) {
  failures.push("app/ui/hotkeys.js: edit-mode head drag is not routed through joint-aware endpoint movement");
}

if (!/moveEditBoneEndpointAndConnectedJoint\(bones,\s*state\.drag\.boneIndex,\s*"tail",\s*local\)/.test(hotkeysSource)) {
  failures.push("app/ui/hotkeys.js: edit-mode tail drag is not routed through joint-aware endpoint movement");
}

if (/Head-only:\s*translate whole bone/.test(hotkeysSource)) {
  failures.push("app/ui/hotkeys.js: edit-mode multi-part drag still uses whole-bone translation semantics");
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Edit bone endpoint drag check passed.");
