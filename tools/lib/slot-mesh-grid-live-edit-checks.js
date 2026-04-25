const fs = require("fs");
const path = require("path");

function loadSources(rootDir) {
  return {
    hotkeysSource: fs.readFileSync(path.join(rootDir, "app", "ui", "hotkeys.js"), "utf8"),
    slotsSource: fs.readFileSync(path.join(rootDir, "app", "workspace", "slots.js"), "utf8"),
    constraintsSource: fs.readFileSync(path.join(rootDir, "app", "render", "constraints.js"), "utf8"),
    indexSource: fs.readFileSync(path.join(rootDir, "index.html"), "utf8"),
  };
}

function runInteractionChecks(rootDir) {
  const { hotkeysSource, slotsSource, indexSource } = loadSources(rootDir);
  const failures = [];

  if (!/function\s+resetSlotMeshToGrid\s*\([^)]*\)\s*\{[\s\S]*?syncSlotContourFromMeshData\(slot,\s*true\)[\s\S]*?setSlotMeshEditTarget\("grid",\s*false\)/.test(slotsSource)) {
    failures.push("app/workspace/slots.js: Reset To Grid must rebuild the preview from meshData and enter Grid edit mode");
  }

  if (!/if\s*\(\(ev\.key === "Backspace"[\s\S]*?activeSet === "fill"[\s\S]*?applyContourMeshToSlot\(slot\)/.test(hotkeysSource)) {
    failures.push("app/ui/hotkeys.js: deleting Grid vertices must sync fill edits back into live meshData");
  }

  if (!/if\s*\(state\.drag\.type === "slot_mesh_point"\)[\s\S]*?else\s*\{[\s\S]*?applyLiveGridPointsToSlotMesh\(slot\)/.test(hotkeysSource)) {
    failures.push("app/ui/hotkeys.js: single-point Grid drag must sync fill edits into live meshData without rebuilding UVs");
  }

  if (!/if\s*\(state\.drag\.type === "slot_mesh_multi_move"\)[\s\S]*?else\s*\{[\s\S]*?applyLiveGridPointsToSlotMesh\(slot\)/.test(hotkeysSource)) {
    failures.push("app/ui/hotkeys.js: multi-point Grid drag must sync fill edits into live meshData without rebuilding UVs");
  }

  if (!/Reset\s+To\s+Grid seeds an editable live Grid/.test(indexSource)) {
    failures.push("index.html: Mesh help text must explain that Reset To Grid enters editable live Grid mode");
  }

  return failures;
}

function runRenderingChecks(rootDir) {
  const { constraintsSource, indexSource } = loadSources(rootDir);
  const failures = [];

  if (!/const\s+previewGrid\s*=\s*getSlotMeshPreviewGridInfo\(slot,\s*contour\)[\s\S]*?const\s+drewGridPreview\s*=\s*drawSlotMeshPreviewGrid\(ctx,\s*slot,\s*previewGrid,\s*slotPoseWorld\)/.test(constraintsSource)) {
    failures.push("app/render/constraints.js: Grid overlay must render the editable preview grid before fallback triangulation");
  }

  if (!/for\s*\(let\s+i\s*=\s*0;\s*i\s*<\s*contour\.fillPoints\.length;\s*i\s*\+=\s*1\)[\s\S]*?getSlotMeshSelection\("fill",\s*contour\.fillPoints\.length\)/.test(constraintsSource)) {
    failures.push("app/render/constraints.js: Grid overlay must render fill vertices with active/selected state");
  }

  if (!/ctx\.strokeStyle = contour\.closed \? "#f0c46a" : "#f3b86b"/.test(constraintsSource)) {
    failures.push("app/render/constraints.js: Boundary edges must use the warm gold palette for clearer contrast against Grid");
  }

  if (!/ctx\.fillStyle = active \? "#ffd27a" : selected \? "#ffe2a8" : i === 0 \? "#f3b86b" : "#e7dcc2"/.test(constraintsSource)) {
    failures.push("app/render/constraints.js: Boundary vertices must use the warm gold palette for active/selected/normal states");
  }

  if (!/Grid\s+mode edits the current mesh live;\s+Boundary edits still use Apply\s+Mesh to rebuild topology/.test(indexSource)) {
    failures.push("index.html: Mesh help text must explain the live Grid edit vs Boundary Apply Mesh split");
  }

  return failures;
}

module.exports = {
  runInteractionChecks,
  runRenderingChecks,
};
