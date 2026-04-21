# WebGL Support Diagnostics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a detailed WebGL support checker inside the left `Tools` panel so users can compare browser support directly in the app.

**Architecture:** Add a dedicated `WebGL Support` subsection to the existing `Tools` panel, keep probe/format logic in `app/core/runtime.js`, and wire the buttons through `app/ui/editor-panels.js`. Store the latest report in `state.webglSupport` so the panel survives normal UI refreshes without re-probing.

**Tech Stack:** Static HTML/CSS, classic browser scripts, Canvas/WebGL APIs, clipboard API, small Node-based guard scripts for regression checks.

---

## File Map

- Modify: `index.html`
  - Add the `WebGL Support` subsection under the existing `Tools` panel.
- Modify: `styles.css`
  - Add compact layout and report styling for the new subsection.
- Modify: `app/core/runtime.js`
  - Add `els` refs, `state.webglSupport`, WebGL probe helpers, report formatter, and summary refresh helper.
- Modify: `app/ui/editor-panels.js`
  - Bind `Check WebGL Support` and `Copy Report`.
- Modify: `app/core/bones.js`
  - Refresh the `Tools` panel UI state so the new buttons/report stay in sync.
- Create: `tools/check-webgl-tools-ui.js`
  - Static regression check for the new `Tools` panel controls and runtime hooks.

### Task 1: Add the Tools panel UI skeleton and failing guard

**Files:**
- Create: `tools/check-webgl-tools-ui.js`
- Modify: `index.html`

- [ ] **Step 1: Write the failing guard script**

```js
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
const runtime = fs.readFileSync(path.join(rootDir, "app/core/runtime.js"), "utf8");

const checks = [
  { source: html, snippet: 'id="webglSupportSection"', label: "WebGL tools section" },
  { source: html, snippet: 'id="webglSupportCheckBtn"', label: "WebGL check button" },
  { source: html, snippet: 'id="webglSupportCopyBtn"', label: "WebGL copy button" },
  { source: html, snippet: 'id="webglSupportSummary"', label: "WebGL summary node" },
  { source: html, snippet: 'id="webglSupportReport"', label: "WebGL report node" },
  { source: runtime, snippet: 'webglSupportSection: document.getElementById("webglSupportSection")', label: "els.webglSupportSection" },
  { source: runtime, snippet: 'webglSupportCheckBtn: document.getElementById("webglSupportCheckBtn")', label: "els.webglSupportCheckBtn" },
  { source: runtime, snippet: 'webglSupportCopyBtn: document.getElementById("webglSupportCopyBtn")', label: "els.webglSupportCopyBtn" },
  { source: runtime, snippet: 'webglSupportSummary: document.getElementById("webglSupportSummary")', label: "els.webglSupportSummary" },
  { source: runtime, snippet: 'webglSupportReport: document.getElementById("webglSupportReport")', label: "els.webglSupportReport" },
];

const failures = checks.filter((check) => !check.source.includes(check.snippet));
if (failures.length > 0) {
  console.error(failures.map((failure) => `Missing ${failure.label}`).join("\\n"));
  process.exit(1);
}

console.log(`WebGL tools UI check passed for ${checks.length} patterns.`);
```

- [ ] **Step 2: Run guard to verify it fails**

Run: `node tools/check-webgl-tools-ui.js`

Expected: FAIL with missing `webglSupport*` controls.

- [ ] **Step 3: Add the minimal HTML and `els` wiring**

`index.html`

```html
      <section id="leftGeneralTools" class="group left-tab-panel" data-left-panel="tools">
        <h3>Tools</h3>
        <label>
          <span>Available in current mode</span>
        </label>
        <div class="field two-col">
          <button id="resetPoseBtn">Reset Pose</button>
          <button id="resetVertexBtn">Reset Vertex</button>
        </div>
        <section id="webglSupportSection" class="tools-subsection">
          <h4>WebGL Support</h4>
          <div class="field two-col">
            <button id="webglSupportCheckBtn" type="button">Check WebGL Support</button>
            <button id="webglSupportCopyBtn" type="button" disabled>Copy Report</button>
          </div>
          <p id="webglSupportSummary" class="muted">No WebGL support report yet.</p>
          <pre id="webglSupportReport" class="webgl-support-report muted">Run the check to inspect browser WebGL support.</pre>
        </section>
        <p class="muted">Available general tools and resets.</p>
      </section>
```

`app/core/runtime.js`

```js
  leftGeneralTools: document.getElementById("leftGeneralTools"),
  webglSupportSection: document.getElementById("webglSupportSection"),
  webglSupportCheckBtn: document.getElementById("webglSupportCheckBtn"),
  webglSupportCopyBtn: document.getElementById("webglSupportCopyBtn"),
  webglSupportSummary: document.getElementById("webglSupportSummary"),
  webglSupportReport: document.getElementById("webglSupportReport"),
```

- [ ] **Step 4: Run guard to verify it passes**

Run: `node tools/check-webgl-tools-ui.js`

Expected: PASS with `WebGL tools UI check passed`.

- [ ] **Step 5: Commit**

```bash
git add index.html app/core/runtime.js tools/check-webgl-tools-ui.js
git commit -m "feat: add WebGL tools panel skeleton"
```

### Task 2: Add runtime WebGL probe state and formatter

**Files:**
- Modify: `app/core/runtime.js`
- Modify: `tools/check-webgl-tools-ui.js`

- [ ] **Step 1: Extend the guard with failing runtime expectations**

Append these checks inside `tools/check-webgl-tools-ui.js`:

```js
checks.push(
  { source: runtime, snippet: "webglSupport: {", label: "state.webglSupport" },
  { source: runtime, snippet: "function collectWebGLSupportReport()", label: "collectWebGLSupportReport helper" },
  { source: runtime, snippet: "function formatWebGLSupportReport(report)", label: "formatWebGLSupportReport helper" },
  { source: runtime, snippet: "function refreshWebGLSupportUI()", label: "refreshWebGLSupportUI helper" },
);
```

- [ ] **Step 2: Run guard to verify it fails**

Run: `node tools/check-webgl-tools-ui.js`

Expected: FAIL with missing `state.webglSupport` and helper functions.

- [ ] **Step 3: Write the minimal runtime implementation**

Add `state.webglSupport` in `app/core/runtime.js`:

```js
  webglSupport: {
    lastCheckedAt: 0,
    summary: "No WebGL support report yet.",
    reportText: "Run the check to inspect browser WebGL support.",
    raw: null,
  },
```

Add helper skeletons in `app/core/runtime.js` near the other runtime utilities:

```js
function collectWebGLSupportContextInfo(canvas, contextName) {
  const result = {
    contextName,
    ok: false,
    error: "",
    version: "",
    shadingLanguageVersion: "",
    vendor: "",
    renderer: "",
    unmaskedVendor: "",
    unmaskedRenderer: "",
    maxTextureSize: "unavailable",
    maxViewportDims: "unavailable",
    maxVertexAttribs: "unavailable",
    maxTextureImageUnits: "unavailable",
    extensions: [],
  };
  try {
    const ctx = canvas.getContext(contextName, { alpha: true, premultipliedAlpha: false });
    if (!ctx) {
      result.error = "Context creation returned null.";
      return result;
    }
    result.ok = true;
    result.version = String(ctx.getParameter(ctx.VERSION) || "");
    result.shadingLanguageVersion = String(ctx.getParameter(ctx.SHADING_LANGUAGE_VERSION) || "");
    result.vendor = String(ctx.getParameter(ctx.VENDOR) || "");
    result.renderer = String(ctx.getParameter(ctx.RENDERER) || "");
    result.maxTextureSize = Number(ctx.getParameter(ctx.MAX_TEXTURE_SIZE) || 0);
    result.maxViewportDims = Array.from(ctx.getParameter(ctx.MAX_VIEWPORT_DIMS) || []).join(" x ");
    result.maxVertexAttribs = Number(ctx.getParameter(ctx.MAX_VERTEX_ATTRIBS) || 0);
    result.maxTextureImageUnits = Number(ctx.getParameter(ctx.MAX_TEXTURE_IMAGE_UNITS) || 0);
    const extNames = [
      "WEBGL_debug_renderer_info",
      "OES_element_index_uint",
      "OES_standard_derivatives",
      "OES_vertex_array_object",
      "WEBGL_lose_context",
    ];
    result.extensions = extNames.map((name) => ({ name, supported: !!ctx.getExtension(name) }));
    const dbg = ctx.getExtension("WEBGL_debug_renderer_info");
    if (dbg) {
      result.unmaskedVendor = String(ctx.getParameter(dbg.UNMASKED_VENDOR_WEBGL) || "");
      result.unmaskedRenderer = String(ctx.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || "");
    }
    return result;
  } catch (err) {
    result.error = err && err.message ? err.message : String(err);
    return result;
  }
}

function collectWebGLSupportReport() {
  const canvas = document.createElement("canvas");
  const contexts = ["webgl2", "webgl", "experimental-webgl"].map((name) =>
    collectWebGLSupportContextInfo(canvas, name)
  );
  return {
    checkedAt: new Date().toISOString(),
    userAgent: navigator.userAgent || "",
    platform: navigator.platform || "",
    bootstrap: {
      hasGL,
      isWebGL2,
      hasVAO,
    },
    contexts,
  };
}

function summarizeWebGLSupport(report) {
  const contexts = report && Array.isArray(report.contexts) ? report.contexts : [];
  const webgl2 = contexts.find((item) => item.contextName === "webgl2" && item.ok);
  if (webgl2) return "WebGL2 available.";
  const webgl1 = contexts.find((item) => (item.contextName === "webgl" || item.contextName === "experimental-webgl") && item.ok);
  if (webgl1) return "WebGL1 available, WebGL2 unavailable.";
  return "No WebGL context available.";
}

function formatWebGLSupportReport(report) {
  const lines = [
    `Checked: ${report.checkedAt}`,
    `User agent: ${report.userAgent}`,
    `Platform: ${report.platform}`,
    `Bootstrap: hasGL=${report.bootstrap.hasGL}, isWebGL2=${report.bootstrap.isWebGL2}, hasVAO=${report.bootstrap.hasVAO}`,
    "",
  ];
  for (const entry of report.contexts) {
    lines.push(`[${entry.contextName}] ${entry.ok ? "OK" : "FAIL"}`);
    if (entry.error) lines.push(`  Error: ${entry.error}`);
    if (entry.ok) {
      lines.push(`  Version: ${entry.version}`);
      lines.push(`  GLSL: ${entry.shadingLanguageVersion}`);
      lines.push(`  Vendor: ${entry.vendor}`);
      lines.push(`  Renderer: ${entry.renderer}`);
      lines.push(`  Unmasked Vendor: ${entry.unmaskedVendor || "unavailable"}`);
      lines.push(`  Unmasked Renderer: ${entry.unmaskedRenderer || "unavailable"}`);
      lines.push(`  MAX_TEXTURE_SIZE: ${entry.maxTextureSize}`);
      lines.push(`  MAX_VIEWPORT_DIMS: ${entry.maxViewportDims}`);
      lines.push(`  MAX_VERTEX_ATTRIBS: ${entry.maxVertexAttribs}`);
      lines.push(`  MAX_TEXTURE_IMAGE_UNITS: ${entry.maxTextureImageUnits}`);
      lines.push("  Extensions:");
      for (const ext of entry.extensions) {
        lines.push(`    - ${ext.name}: ${ext.supported ? "yes" : "no"}`);
      }
    }
    lines.push("");
  }
  if (!report.contexts.some((entry) => entry.ok)) {
    lines.push("Conclusion: No WebGL context could be created.");
    lines.push("Likely causes (inference): hardware acceleration disabled, driver blocklist, privacy/security policy, or virtualization/remote desktop path.");
  } else {
    lines.push(`Conclusion: ${summarizeWebGLSupport(report)}`);
  }
  return lines.join("\\n");
}

function refreshWebGLSupportUI() {
  if (els.webglSupportSummary) {
    els.webglSupportSummary.textContent = state.webglSupport.summary || "No WebGL support report yet.";
  }
  if (els.webglSupportReport) {
    els.webglSupportReport.textContent = state.webglSupport.reportText || "Run the check to inspect browser WebGL support.";
    els.webglSupportReport.classList.toggle("muted", !state.webglSupport.raw);
  }
  if (els.webglSupportCopyBtn) {
    els.webglSupportCopyBtn.disabled = !state.webglSupport.raw;
  }
}
```

- [ ] **Step 4: Run guard to verify it passes**

Run: `node tools/check-webgl-tools-ui.js`

Expected: PASS with `WebGL tools UI check passed`.

- [ ] **Step 5: Commit**

```bash
git add app/core/runtime.js tools/check-webgl-tools-ui.js
git commit -m "feat: add WebGL support probe helpers"
```

### Task 3: Wire the buttons and panel refresh

**Files:**
- Modify: `app/ui/editor-panels.js`
- Modify: `app/core/bones.js`
- Modify: `app/core/runtime.js`
- Modify: `tools/check-webgl-tools-ui.js`

- [ ] **Step 1: Extend the guard with failing binding expectations**

Append these checks inside `tools/check-webgl-tools-ui.js`:

```js
const editorPanels = fs.readFileSync(path.join(rootDir, "app/ui/editor-panels.js"), "utf8");
const bones = fs.readFileSync(path.join(rootDir, "app/core/bones.js"), "utf8");

checks.push(
  { source: editorPanels, snippet: 'els.webglSupportCheckBtn.addEventListener("click"', label: "WebGL check button binding" },
  { source: editorPanels, snippet: 'els.webglSupportCopyBtn.addEventListener("click"', label: "WebGL copy button binding" },
  { source: bones, snippet: "refreshWebGLSupportUI();", label: "WebGL support UI refresh hook" },
);
```

- [ ] **Step 2: Run guard to verify it fails**

Run: `node tools/check-webgl-tools-ui.js`

Expected: FAIL with missing button bindings and refresh hook.

- [ ] **Step 3: Write the minimal UI binding implementation**

`app/ui/editor-panels.js`

```js
if (els.webglSupportCheckBtn) {
  els.webglSupportCheckBtn.addEventListener("click", () => {
    const report = collectWebGLSupportReport();
    state.webglSupport.lastCheckedAt = Date.now();
    state.webglSupport.raw = report;
    state.webglSupport.summary = summarizeWebGLSupport(report);
    state.webglSupport.reportText = formatWebGLSupportReport(report);
    refreshWebGLSupportUI();
    setStatus(`WebGL support checked: ${state.webglSupport.summary}`);
  });
}

if (els.webglSupportCopyBtn) {
  els.webglSupportCopyBtn.addEventListener("click", async () => {
    const text = state.webglSupport.reportText || "";
    if (!text) {
      setStatus("No WebGL support report to copy.");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setStatus("WebGL support report copied.");
    } catch (err) {
      console.warn(err);
      setStatus("Clipboard copy failed. Check browser permissions.");
    }
  });
}
```

`app/core/bones.js`

```js
  refreshWebGLSupportUI();
```

Add that line inside the existing general UI refresh path near other tool-panel refresh calls in `updateWorkspaceUI()`.

`app/core/runtime.js`

```js
refreshWebGLSupportUI();
```

Call it once during bootstrap after other UI refresh calls so the initial summary renders correctly.

- [ ] **Step 4: Run guard to verify it passes**

Run: `node tools/check-webgl-tools-ui.js`

Expected: PASS with `WebGL tools UI check passed`.

- [ ] **Step 5: Commit**

```bash
git add app/ui/editor-panels.js app/core/bones.js app/core/runtime.js tools/check-webgl-tools-ui.js
git commit -m "feat: wire WebGL support tools actions"
```

### Task 4: Style the report and verify behavior

**Files:**
- Modify: `styles.css`
- Test: `tools/check-webgl-tools-ui.js`

- [ ] **Step 1: Add a failing style expectation to the guard**

Append these checks inside `tools/check-webgl-tools-ui.js`:

```js
const styles = fs.readFileSync(path.join(rootDir, "styles.css"), "utf8");

checks.push(
  { source: styles, snippet: ".tools-subsection", label: "tools subsection styles" },
  { source: styles, snippet: ".webgl-support-report", label: "WebGL report styles" },
);
```

- [ ] **Step 2: Run guard to verify it fails**

Run: `node tools/check-webgl-tools-ui.js`

Expected: FAIL with missing WebGL tools styles.

- [ ] **Step 3: Write the minimal styling**

`styles.css`

```css
.tools-subsection {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--line);
}

.tools-subsection h4 {
  margin: 0 0 8px;
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.webgl-support-report {
  max-height: 240px;
  overflow: auto;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: rgba(8, 13, 17, 0.72);
  padding: 8px;
  font-size: 12px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
}
```

- [ ] **Step 4: Run verification**

Run:

```bash
node tools/check-webgl-tools-ui.js
node --check app/core/runtime.js
node --check app/core/bones.js
node --check app/ui/editor-panels.js
node tools/check-stale-dom-hooks.js
node tools/check-stale-css-selectors.js
node tools/check-unused-legacy-functions.js
```

Expected:

- all commands exit `0`
- `WebGL tools UI check passed ...`
- no syntax errors

- [ ] **Step 5: Manual browser verification**

Run the app, open the `Tools` tab, and verify:

1. Clicking `Check WebGL Support` fills the summary and report.
2. Clicking `Copy Report` copies the report text.
3. The report still renders if WebGL2 fails but WebGL1 succeeds.
4. The report still renders if all WebGL contexts fail.

- [ ] **Step 6: Commit**

```bash
git add styles.css tools/check-webgl-tools-ui.js app/core/runtime.js app/core/bones.js app/ui/editor-panels.js
git commit -m "feat: add WebGL support diagnostics tool"
```
