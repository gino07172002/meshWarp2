// Regression check for the "image import leaves #workspaceTabObject disabled,
// swallowing pointer clicks without producing a click event" bug.
//
// Trace evidence (D:/harness traces 20260501T060902560215Z.json):
//   - After image import, hasMesh became true and slots became 1.
//   - The user pressed #workspaceTabObject 26 times.
//   - 26 pointerdown + 26 pointerup were recorded; 0 click events fired.
//   - Snapshot probe showed #workspaceTabObject.disabled = true throughout.
//   - Root cause: the file-import handler in app/io/tree-bindings.js never
//     called updateWorkspaceUI(), so the disabled flag set at first paint
//     (when state.mesh was null) was never refreshed. Disabled <button>
//     elements still receive pointer events but never dispatch 'click', so
//     the user gets no feedback.
//
// This check enforces two invariants:
//   1. The file-import handler MUST call updateWorkspaceUI() so the workspace
//      tab disabled state reconciles with the new state.mesh.
//   2. setupWorkspaceTabs() MUST install a pointerup safety net on the gated
//      tabs so a stale disabled flag cannot dead-end the user without an
//      observable status message.

const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const importPath = path.join(rootDir, "app", "io", "tree-bindings.js");
const workspacePath = path.join(rootDir, "app", "workspace", "workspace.js");
const bonesUiPath = path.join(rootDir, "app", "core", "bones-tree-ui.js");

const importSrc = fs.readFileSync(importPath, "utf8");
const workspaceSrc = fs.readFileSync(workspacePath, "utf8");
const bonesUiSrc = fs.readFileSync(bonesUiPath, "utf8");

const failures = [];

// Invariant: the disabled toggle still gates on state.mesh (so the bug is
// reproducible if updateWorkspaceUI is not called).
if (!/workspaceTabObject\.disabled\s*=\s*!state\.mesh/.test(bonesUiSrc)) {
  failures.push(
    "app/core/bones-tree-ui.js: expected `els.workspaceTabObject.disabled = !state.mesh;` toggle. " +
    "If this changed, re-evaluate the regression test."
  );
}

// Invariant 1: import handler refreshes workspace UI after mutating state.mesh.
const importHandlerMatch = importSrc.match(
  /els\.fileInput\.addEventListener\("change"[\s\S]*?\n\}\);/
);
if (!importHandlerMatch) {
  failures.push("app/io/tree-bindings.js: could not locate fileInput change handler.");
} else if (!/\bupdateWorkspaceUI\s*\(\s*\)/.test(importHandlerMatch[0])) {
  failures.push(
    "app/io/tree-bindings.js: fileInput change handler must call updateWorkspaceUI() " +
    "after import so #workspaceTabObject.disabled reflects state.mesh. " +
    "Without this, pointerdown/pointerup land on a disabled tab and no 'click' fires."
  );
}

// Invariant 2: pointerup safety net on the gated workspace tabs.
const setupMatch = workspaceSrc.match(/function setupWorkspaceTabs\s*\(\s*\)\s*\{[\s\S]*?\n\}/);
if (!setupMatch) {
  failures.push("app/workspace/workspace.js: could not locate setupWorkspaceTabs().");
} else {
  const setup = setupMatch[0];
  if (!/workspaceTabObject[\s\S]*?addEventListener\(\s*["']pointerup["']/.test(setup)
      && !/wsTabFallback[\s\S]*workspaceTabObject/.test(setup)) {
    failures.push(
      "app/workspace/workspace.js: setupWorkspaceTabs() must install a pointerup fallback " +
      "on #workspaceTabObject so a stale disabled flag does not silently swallow user input."
    );
  }
  if (!/btn\.disabled/.test(setup) || !/applyWorkspace\([^)]+\)/.test(setup)) {
    failures.push(
      "app/workspace/workspace.js: pointerup fallback must check btn.disabled and recover by " +
      "calling updateWorkspaceUI() + applyWorkspace() (or surface an explicit status)."
    );
  }
  if (!/setStatus\(/.test(setup)) {
    failures.push(
      "app/workspace/workspace.js: pointerup fallback must surface a setStatus(...) message " +
      "when the click cannot be honoured (no fallback path), so the user is not stuck silently."
    );
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Workspace tab Object after-import check passed.");
