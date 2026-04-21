const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const scanDirs = ["app"];
const allowed = new Set([
  "app/io/project-actions.js",
]);
const banned = [
  { pattern: /\bslot\.meshData\b/g, label: "slot.meshData" },
  { pattern: /\bslot\.meshContour\b/g, label: "slot.meshContour" },
  { pattern: /\bslot\._indices\b/g, label: "slot._indices" },
];

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, out);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".js")) continue;
    out.push(fullPath);
  }
}

const files = [];
for (const dir of scanDirs) {
  walk(path.join(rootDir, dir), files);
}

const failures = [];
for (const filePath of files) {
  const relPath = path.relative(rootDir, filePath).replace(/\\/g, "/");
  if (allowed.has(relPath)) continue;
  const source = fs.readFileSync(filePath, "utf8");
  for (const check of banned) {
    const matches = source.match(check.pattern);
    if (!matches) continue;
    failures.push(`${relPath}: found ${matches.length} direct ${check.label} access(es)`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Legacy slot mesh access check passed.");
