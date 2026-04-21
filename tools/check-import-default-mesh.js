const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const constraintsPath = path.join(rootDir, "app", "render", "constraints.js");
const workspacePath = path.join(rootDir, "app", "workspace", "workspace.js");

const constraintsSource = fs.readFileSync(constraintsPath, "utf8");
const workspaceSource = fs.readFileSync(workspacePath, "utf8");

const failures = [];

if (!/function\s+buildImportedAttachmentDefaults\s*\(/.test(constraintsSource)) {
  failures.push("app/render/constraints.js: missing buildImportedAttachmentDefaults()");
}

if (!/defaultAttachmentType:\s*ATTACHMENT_TYPES\.MESH/.test(constraintsSource)) {
  failures.push("app/render/constraints.js: imported slot defaults do not force mesh attachments");
}

if (!/weightMode:\s*weighted\s*\?\s*"weighted"\s*:\s*"single"/.test(constraintsSource)) {
  failures.push("app/render/constraints.js: imported slot defaults do not switch to weighted mode for multi-bone rigs");
}

if (!/\.\.\.buildImportedAttachmentDefaults\(\)/.test(constraintsSource)) {
  failures.push("app/render/constraints.js: import payloads are not using buildImportedAttachmentDefaults()");
}

if (!/defaultAttachmentType/.test(workspaceSource)) {
  failures.push("app/workspace/workspace.js: addSlotEntry fallback attachment does not read entry.defaultAttachmentType");
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Import default mesh attachment check passed.");
