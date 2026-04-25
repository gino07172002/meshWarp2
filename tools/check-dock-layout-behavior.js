const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const dockPath = path.join(rootDir, "app", "ui", "dock-layout.js");
const hotkeysPath = path.join(rootDir, "app", "ui", "hotkeys.js");
const failures = [];

if (!fs.existsSync(dockPath)) {
  failures.push("app/ui/dock-layout.js: file missing");
} else {
  const dockJs = fs.readFileSync(dockPath, "utf8");
  if (!/function\s+applyDockSideState\s*\(/.test(dockJs)) {
    failures.push("app/ui/dock-layout.js: missing applyDockSideState()");
  }
  if (!/function\s+toggleDockSideCollapsed\s*\(/.test(dockJs)) {
    failures.push("app/ui/dock-layout.js: missing toggleDockSideCollapsed()");
  }
  if (!/function\s+getCollapsedDockWidth\s*\(/.test(dockJs)) {
    failures.push("app/ui/dock-layout.js: missing getCollapsedDockWidth()");
  }
  if (!/function\s+getDockSideForPanel\s*\(/.test(dockJs)) {
    failures.push("app/ui/dock-layout.js: missing getDockSideForPanel()");
  }
}

const hotkeysJs = fs.readFileSync(hotkeysPath, "utf8");
if (!/rememberDockSideWidth\("left"/.test(hotkeysJs)) {
  failures.push("app/ui/hotkeys.js: missing left width persistence hook");
}
if (!/rememberDockSideWidth\("right"/.test(hotkeysJs)) {
  failures.push("app/ui/hotkeys.js: missing right width persistence hook");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Dock layout behavior check passed.");
