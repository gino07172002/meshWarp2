const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const exportSource = fs.readFileSync(path.join(rootDir, "app/io/project-export.js"), "utf8");
const loadSource = fs.readFileSync(path.join(rootDir, "app/io/project-actions.js"), "utf8");

const failures = [];

if (!/projectVersion\s*:\s*2/.test(exportSource)) {
  failures.push('app/io/project-export.js: expected payload to write "projectVersion: 2".');
}

if (/(?:^|[,{])\s*meshData\s*:\s*null\b/m.test(exportSource) || /(?:^|[,{])\s*meshContour\s*:\s*null\b/m.test(exportSource)) {
  failures.push("app/io/project-export.js: slot payload still carries legacy mesh placeholders.");
}

if (!/function\s+upgradeLegacyProject\s*\(/.test(loadSource)) {
  failures.push("app/io/project-actions.js: missing upgradeLegacyProject(payload) helper.");
}

if (!/projectVersion/.test(loadSource)) {
  failures.push("app/io/project-actions.js: load path does not inspect projectVersion.");
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Legacy project upgrade structure check passed.");
