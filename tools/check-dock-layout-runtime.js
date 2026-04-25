const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const runtimePath = path.join(rootDir, "app", "core", "runtime.js");
const runtimeJs = fs.readFileSync(runtimePath, "utf8");
const failures = [];

if (!/function\s+getDefaultDockLayout\s*\(/.test(runtimeJs)) {
  failures.push("app/core/runtime.js: missing getDefaultDockLayout()");
}
if (!/left:\s*\{\s*collapsed:\s*false,\s*expandedWidth:\s*260\s*\}/.test(runtimeJs)) {
  failures.push("app/core/runtime.js: missing default left side layout");
}
if (!/right:\s*\{\s*collapsed:\s*false,\s*expandedWidth:\s*340\s*\}/.test(runtimeJs)) {
  failures.push("app/core/runtime.js: missing default right side layout");
}
if (!/function\s+setDockSideCollapsed\s*\(/.test(runtimeJs)) {
  failures.push("app/core/runtime.js: missing setDockSideCollapsed()");
}
if (!/function\s+rememberDockSideWidth\s*\(/.test(runtimeJs)) {
  failures.push("app/core/runtime.js: missing rememberDockSideWidth()");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Dock layout runtime check passed.");
