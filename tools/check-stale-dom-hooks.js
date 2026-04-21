const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");

const checks = [
  { file: "app/core/runtime.js", snippet: 'document.getElementById("editModeWrap")', label: "editModeWrap DOM ref" },
  { file: "app/core/runtime.js", snippet: 'document.getElementById("boneModeWrap")', label: "boneModeWrap DOM ref" },
  { file: "app/core/runtime.js", snippet: 'document.getElementById("slotQuickAddBtn")', label: "slotQuickAddBtn DOM ref" },
  { file: "app/core/runtime.js", snippet: 'document.getElementById("slotQuickDupBtn")', label: "slotQuickDupBtn DOM ref" },
  { file: "app/core/runtime.js", snippet: 'document.getElementById("slotQuickDeleteBtn")', label: "slotQuickDeleteBtn DOM ref" },
  { file: "app/core/runtime.js", snippet: 'document.getElementById("workspaceMode")', label: "workspaceMode DOM ref" },
  { file: "app/core/runtime.js", snippet: 'document.getElementById("boneTreeHumanoidBoneBtn")', label: "boneTreeHumanoidBoneBtn DOM ref" },
  { file: "app/core/runtime.js", snippet: 'document.getElementById("boneWorkHidden")', label: "boneWorkHidden DOM ref" },
  { file: "app/core/runtime.js", snippet: 'document.getElementById("boneAnimHidden")', label: "boneAnimHidden DOM ref" },
  { file: "app/core/runtime.js", snippet: 'document.getElementById("boneAnimHideSetKeyBtn")', label: "boneAnimHideSetKeyBtn DOM ref" },
  { file: "app/core/runtime.js", snippet: 'document.getElementById("boneAnimHideDelKeyBtn")', label: "boneAnimHideDelKeyBtn DOM ref" },
  { file: "app/core/runtime.js", snippet: 'document.getElementById("pauseBtn")', label: "pauseBtn DOM ref" },
  { file: "app/core/runtime.js", snippet: 'document.getElementById("slotPlaceholderName")', label: "slotPlaceholderName DOM ref" },
  { file: "app/core/runtime.js", snippet: 'document.getElementById("slotAttachmentPlaceholderName")', label: "slotAttachmentPlaceholderName DOM ref" },
  { file: "app/core/runtime.js", snippet: 'document.getElementById("slotAttachmentRenameBtn")', label: "slotAttachmentRenameBtn DOM ref" },
  { file: "app/core/runtime.js", snippet: "play.pause", label: "stale pause command" },
  { file: "app/core/runtime.js", snippet: "bindBoneTreeHumanoidBoneButton", label: "stale bindBoneTreeHumanoidBoneButton helper" },
  { file: "app/ui/hotkeys.js", snippet: "els.pauseBtn", label: "stale pause button listener" },
  { file: "app/ui/editor-panels.js", snippet: "els.slotQuickAddBtn", label: "stale slot quick add listener" },
  { file: "app/ui/editor-panels.js", snippet: "els.slotQuickDupBtn", label: "stale slot quick duplicate listener" },
  { file: "app/ui/editor-panels.js", snippet: "els.slotQuickDeleteBtn", label: "stale slot quick delete listener" },
  { file: "app/ui/constraint-panels.js", snippet: "els.boneWorkHidden", label: "stale boneWorkHidden listener" },
  { file: "app/ui/constraint-panels.js", snippet: "els.boneAnimHidden", label: "stale boneAnimHidden listener" },
  { file: "app/ui/constraint-panels.js", snippet: "els.boneAnimHideSetKeyBtn", label: "stale boneAnimHideSetKeyBtn listener" },
  { file: "app/ui/constraint-panels.js", snippet: "els.boneAnimHideDelKeyBtn", label: "stale boneAnimHideDelKeyBtn listener" },
  { file: "app/io/tree-bindings.js", snippet: "els.slotPlaceholderName", label: "stale slotPlaceholderName binding" },
  { file: "app/io/tree-bindings.js", snippet: "els.slotAttachmentPlaceholderName", label: "stale slotAttachmentPlaceholderName binding" },
  { file: "app/io/tree-bindings.js", snippet: "els.slotAttachmentRenameBtn", label: "stale slotAttachmentRenameBtn binding" },
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

console.log(`Stale DOM hook check passed for ${checks.length} patterns.`);
