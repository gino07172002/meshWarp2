const path = require("path");
const {
  runInteractionChecks,
  runRenderingChecks,
} = require("./lib/slot-mesh-grid-live-edit-checks");

const rootDir = path.resolve(__dirname, "..");
const failures = [
  ...runInteractionChecks(rootDir).map((msg) => `[interaction] ${msg}`),
  ...runRenderingChecks(rootDir).map((msg) => `[rendering] ${msg}`),
];

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Slot mesh Grid live-edit check passed.");
