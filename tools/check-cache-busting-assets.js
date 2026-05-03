const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");

const checks = [
  'href="styles.css?v=',
  'src="app/core/runtime-els.js?v=',
  'src="app/core/runtime.js?v=',
  'src="app/core/runtime-ai-capture.js?v=',
  'src="app/core/runtime-pose-autorig.js?v=',
  'src="app/core/debug.js?v=',
  'src="app/core/runtime-ai-bridge.js?v=',
  'src="app/core/bones.js?v=',
  'src="app/core/bones-tree-ui.js?v=',
  'src="app/workspace/workspace.js?v=',
  'src="app/workspace/slots.js?v=',
  'src="app/workspace/constraint-model.js?v=',
  'src="app/render/constraints.js?v=',
  'src="app/render/canvas.js?v=',
  'src="app/render/state-machine.js?v=',
  'src="app/animation/model.js?v=',
  'src="app/animation/timeline-ui.js?v=',
  'src="app/animation/runtime.js?v=',
  'src="app/io/tree-bindings.js?v=',
  'src="app/io/project-export.js?v=',
  'src="app/io/project-export-spine-json.js?v=',
  'src="app/io/project-actions.js?v=',
  'src="app/ui/editor-panels.js?v=',
  'src="app/ui/constraint-panels.js?v=',
  'src="app/ui/animation-panels.js?v=',
  'src="app/ui/timeline-pointer.js?v=',
  'src="app/ui/hotkeys.js?v=',
  'src="app/ui/bootstrap.js?v=',
];

const failures = checks.filter((snippet) => !html.includes(snippet));

if (failures.length > 0) {
  console.error("Missing cache-busting query params:\n" + failures.join("\n"));
  process.exit(1);
}

console.log(`Cache-busting asset check passed for ${checks.length} assets.`);
