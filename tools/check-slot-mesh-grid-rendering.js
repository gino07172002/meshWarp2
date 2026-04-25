const path = require("path");
const { runRenderingChecks } = require("./lib/slot-mesh-grid-live-edit-checks");

const rootDir = path.resolve(__dirname, "..");
const failures = runRenderingChecks(rootDir);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Slot mesh Grid rendering check passed.");
