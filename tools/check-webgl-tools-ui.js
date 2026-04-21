const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
const runtime = fs.readFileSync(path.join(rootDir, "app/core/runtime.js"), "utf8");
const bones = fs.readFileSync(path.join(rootDir, "app/core/bones.js"), "utf8");
const editorPanels = fs.readFileSync(path.join(rootDir, "app/ui/editor-panels.js"), "utf8");
const styles = fs.readFileSync(path.join(rootDir, "styles.css"), "utf8");

const checks = [
  { source: html, snippet: 'id="webglSupportDialogWrap"', label: "WebGL dialog wrap" },
  { source: html, snippet: 'id="webglSupportDialogBackdrop"', label: "WebGL dialog backdrop" },
  { source: html, snippet: 'id="webglSupportDialogPanel"', label: "WebGL dialog panel" },
  { source: html, snippet: 'id="webglSupportCloseBtn"', label: "WebGL dialog close button" },
  { source: html, snippet: 'id="webglSupportCheckBtn"', label: "WebGL check button" },
  { source: html, snippet: 'id="webglSupportCopyBtn"', label: "WebGL copy button" },
  { source: html, snippet: 'id="webglSupportVerdict"', label: "WebGL verdict node" },
  { source: html, snippet: 'id="webglSupportSummary"', label: "WebGL summary node" },
  { source: html, snippet: 'id="webglSupportBlockers"', label: "WebGL blockers node" },
  { source: html, snippet: 'id="webglSupportWarnings"', label: "WebGL warnings node" },
  { source: html, snippet: 'id="webglSupportReport"', label: "WebGL report node" },
  {
    source: html,
    snippet: 'data-menu-action="tools.webglsupport"',
    label: "Top tools menu WebGL action",
  },
  {
    source: runtime,
    snippet: 'webglSupportDialogWrap: document.getElementById("webglSupportDialogWrap")',
    label: "els.webglSupportDialogWrap",
  },
  {
    source: runtime,
    snippet: 'webglSupportDialogBackdrop: document.getElementById("webglSupportDialogBackdrop")',
    label: "els.webglSupportDialogBackdrop",
  },
  {
    source: runtime,
    snippet: 'webglSupportDialogPanel: document.getElementById("webglSupportDialogPanel")',
    label: "els.webglSupportDialogPanel",
  },
  {
    source: runtime,
    snippet: 'webglSupportCloseBtn: document.getElementById("webglSupportCloseBtn")',
    label: "els.webglSupportCloseBtn",
  },
  {
    source: runtime,
    snippet: 'webglSupportCheckBtn: document.getElementById("webglSupportCheckBtn")',
    label: "els.webglSupportCheckBtn",
  },
  {
    source: runtime,
    snippet: 'webglSupportCopyBtn: document.getElementById("webglSupportCopyBtn")',
    label: "els.webglSupportCopyBtn",
  },
  {
    source: runtime,
    snippet: 'webglSupportVerdict: document.getElementById("webglSupportVerdict")',
    label: "els.webglSupportVerdict",
  },
  {
    source: runtime,
    snippet: 'webglSupportSummary: document.getElementById("webglSupportSummary")',
    label: "els.webglSupportSummary",
  },
  {
    source: runtime,
    snippet: 'webglSupportBlockers: document.getElementById("webglSupportBlockers")',
    label: "els.webglSupportBlockers",
  },
  {
    source: runtime,
    snippet: 'webglSupportWarnings: document.getElementById("webglSupportWarnings")',
    label: "els.webglSupportWarnings",
  },
  {
    source: runtime,
    snippet: 'webglSupportReport: document.getElementById("webglSupportReport")',
    label: "els.webglSupportReport",
  },
  { source: runtime, snippet: "webglSupport: {", label: "state.webglSupport" },
  {
    source: runtime,
    snippet: "function collectWebGLSupportReport()",
    label: "collectWebGLSupportReport helper",
  },
  {
    source: runtime,
    snippet: "function formatWebGLSupportReport(report, analysis = analyzeWebGLSupportReport(report))",
    label: "formatWebGLSupportReport helper",
  },
  {
    source: runtime,
    snippet: "function analyzeWebGLSupportReport(report)",
    label: "analyzeWebGLSupportReport helper",
  },
  {
    source: runtime,
    snippet: "function refreshWebGLSupportUI()",
    label: "refreshWebGLSupportUI helper",
  },
  {
    source: runtime,
    snippet: "function runWebGLSupportCheck()",
    label: "runWebGLSupportCheck helper",
  },
  {
    source: runtime,
    snippet: "function copyWebGLSupportReport()",
    label: "copyWebGLSupportReport helper",
  },
  {
    source: runtime,
    snippet: "function openWebGLSupportDialog(runCheck = false)",
    label: "openWebGLSupportDialog helper",
  },
  {
    source: runtime,
    snippet: "function closeWebGLSupportDialog()",
    label: "closeWebGLSupportDialog helper",
  },
  {
    source: editorPanels,
    snippet: 'els.webglSupportCheckBtn.addEventListener("click"',
    label: "WebGL check button handler",
  },
  {
    source: editorPanels,
    snippet: 'els.webglSupportCopyBtn.addEventListener("click"',
    label: "WebGL copy button handler",
  },
  {
    source: editorPanels,
    snippet: 'els.webglSupportCloseBtn.addEventListener("click"',
    label: "WebGL close button handler",
  },
  {
    source: editorPanels,
    snippet: 'els.webglSupportDialogBackdrop.addEventListener("click"',
    label: "WebGL backdrop click handler",
  },
  {
    source: runtime,
    snippet: 'case "tools.webglsupport":',
    label: "Top tools menu WebGL action handler",
  },
  {
    source: bones,
    snippet: "refreshWebGLSupportUI();",
    label: "workspace refresh hook",
  },
  {
    source: styles,
    snippet: ".webgl-support-dialog-wrap",
    label: "WebGL dialog wrap styles",
  },
  {
    source: styles,
    snippet: ".webgl-support-dialog-panel",
    label: "WebGL dialog panel styles",
  },
  {
    source: styles,
    snippet: ".webgl-support-verdict",
    label: "WebGL verdict styles",
  },
  {
    source: styles,
    snippet: ".webgl-support-findings-grid",
    label: "WebGL findings grid styles",
  },
  {
    source: styles,
    snippet: ".webgl-support-report",
    label: "WebGL report styles",
  },
];

const forbiddenChecks = [
  { source: html, snippet: 'id="webglSupportSection"', label: "legacy WebGL tools section" },
  { source: styles, snippet: ".tools-subsection", label: "legacy tools subsection styles" },
];

const failures = checks.filter((check) => !check.source.includes(check.snippet));
const forbiddenMatches = forbiddenChecks.filter((check) => check.source.includes(check.snippet));
if (failures.length > 0) {
  console.error(failures.map((failure) => `Missing ${failure.label}`).join("\n"));
  process.exit(1);
}
if (forbiddenMatches.length > 0) {
  console.error(forbiddenMatches.map((failure) => `Unexpected ${failure.label}`).join("\n"));
  process.exit(1);
}

console.log(`WebGL tools UI check passed for ${checks.length} patterns.`);
