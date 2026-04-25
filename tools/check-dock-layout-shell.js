const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const indexPath = path.join(rootDir, "index.html");
const indexHtml = fs.readFileSync(indexPath, "utf8");
const failures = [];

if (!indexHtml.includes('data-menu-action="view.resetlayout"')) {
  failures.push("index.html: missing View > Reset Layout menu action");
}
if (!indexHtml.includes('id="leftDockSide"')) {
  failures.push("index.html: missing leftDockSide host");
}
if (!indexHtml.includes('src="app/ui/dock-layout.js?v=')) {
  failures.push("index.html: missing dock-layout.js script include");
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Dock layout shell check passed.");
