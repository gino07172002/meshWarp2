const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");

const checks = [
  { file: "styles.css", snippet: "#editModeWrap", label: "stale #editModeWrap selector" },
  { file: "styles.css", snippet: "#boneModeWrap", label: "stale #boneModeWrap selector" },
  { file: "styles.css", snippet: "#addAttachmentKeyBtn", label: "stale #addAttachmentKeyBtn selector" },
  { file: "styles.css", snippet: "#addClipKeyBtn", label: "stale #addClipKeyBtn selector" },
  { file: "styles.css", snippet: "#addDrawOrderKeyBtn", label: "stale #addDrawOrderKeyBtn selector" },
  { file: "styles.css", snippet: "#addClipSourceKeyBtn", label: "stale #addClipSourceKeyBtn selector" },
  { file: "styles.css", snippet: "#addClipComboKeyBtn", label: "stale #addClipComboKeyBtn selector" },
  { file: "styles.css", snippet: "#addClipEndKeyBtn", label: "stale #addClipEndKeyBtn selector" },
];

const failures = [];

for (const check of checks) {
  const filePath = path.join(rootDir, check.file);
  const source = fs.readFileSync(filePath, "utf8");
  if (source.includes(check.snippet)) {
    failures.push(`${check.file}: found ${check.label}`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Stale CSS selector check passed for ${checks.length} patterns.`);
