# Side Dock Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace panel-body folding with true left/right side-rail collapse so the canvas becomes wider, while keeping dock reordering, persistence, reset, and the existing visual style.

**Architecture:** Keep `leftTools`, `rightTree`, and `rightProps` as dockable panels, but move collapse state to the side level. The dock layout model should track panel order plus per-side `collapsed` and `expandedWidth`, and the DOM/CSS should shrink the whole left or right side to a narrow rail when collapsed.

**Tech Stack:** Vanilla JS, HTML, CSS, existing global-script app structure, `localStorage`, Node-based verification scripts

---

### Task 1: Replace The Contract Tests With Side-Rail Expectations

**Files:**
- Modify: `tools/check-dock-layout-runtime.js`
- Modify: `tools/check-dock-layout-behavior.js`
- Test: `tools/check-dock-layout-runtime.js`
- Test: `tools/check-dock-layout-behavior.js`

- [ ] **Step 1: Write the failing test**

Update `tools/check-dock-layout-runtime.js` to require side-level state instead of panel-level `collapsed` flags:

```js
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const runtimePath = path.join(rootDir, "app", "core", "runtime.js");
const runtimeJs = fs.readFileSync(runtimePath, "utf8");
const failures = [];

if (!/function\s+getDefaultDockLayout\s*\(/.test(runtimeJs)) {
  failures.push("app/core/runtime.js: missing getDefaultDockLayout()");
}
if (!/left:\s*\{\s*collapsed:\s*false,\s*expandedWidth:\s*260\s*\}/.test(runtimeJs)) {
  failures.push("app/core/runtime.js: missing default left side layout");
}
if (!/right:\s*\{\s*collapsed:\s*false,\s*expandedWidth:\s*340\s*\}/.test(runtimeJs)) {
  failures.push("app/core/runtime.js: missing default right side layout");
}
if (!/function\s+setDockSideCollapsed\s*\(/.test(runtimeJs)) {
  failures.push("app/core/runtime.js: missing setDockSideCollapsed()");
}
if (!/function\s+rememberDockSideWidth\s*\(/.test(runtimeJs)) {
  failures.push("app/core/runtime.js: missing rememberDockSideWidth()");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Dock layout runtime check passed.");
```

Update `tools/check-dock-layout-behavior.js` to require side-collapse behavior helpers:

```js
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const dockPath = path.join(rootDir, "app", "ui", "dock-layout.js");
const hotkeysPath = path.join(rootDir, "app", "ui", "hotkeys.js");
const failures = [];

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
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
node tools/check-dock-layout-runtime.js
node tools/check-dock-layout-behavior.js
```

Expected: FAIL because runtime still uses panel-level collapse and the dock UI does not expose side-rail helpers

- [ ] **Step 3: Commit**

```bash
git add tools/check-dock-layout-runtime.js tools/check-dock-layout-behavior.js
git commit -m "test: update dock checks for side rail collapse"
```

### Task 2: Move Collapse State To The Side-Level Layout Model

**Files:**
- Modify: `app/core/runtime.js`
- Test: `tools/check-dock-layout-runtime.js`

- [ ] **Step 1: Write the failing test**

Use `tools/check-dock-layout-runtime.js` from Task 1 without modification.

- [ ] **Step 2: Run test to verify it fails**

Run: `node tools/check-dock-layout-runtime.js`  
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

Change the dock layout model in `app/core/runtime.js` to side-level collapse:

```js
const DOCK_LAYOUT_STORAGE_KEY = "uiLayout:v1";
const DOCK_PANEL_IDS = ["leftTools", "rightTree", "rightProps"];

function getDefaultDockLayout() {
  return {
    version: 1,
    sides: {
      left: { collapsed: false, expandedWidth: 260 },
      right: { collapsed: false, expandedWidth: 340 },
    },
    panels: {
      leftTools: { side: "left", order: 0 },
      rightTree: { side: "right", order: 0 },
      rightProps: { side: "right", order: 1 },
    },
  };
}

function normalizeDockLayout(raw) {
  const fallback = getDefaultDockLayout();
  const source = raw && typeof raw === "object" ? raw : null;
  const normalized = {
    version: 1,
    sides: {
      left: {
        collapsed: !!(source && source.sides && source.sides.left && source.sides.left.collapsed),
        expandedWidth: Number.isFinite(source && source.sides && source.sides.left && source.sides.left.expandedWidth)
          ? math.clamp(Math.round(source.sides.left.expandedWidth), 150, 800)
          : fallback.sides.left.expandedWidth,
      },
      right: {
        collapsed: !!(source && source.sides && source.sides.right && source.sides.right.collapsed),
        expandedWidth: Number.isFinite(source && source.sides && source.sides.right && source.sides.right.expandedWidth)
          ? math.clamp(Math.round(source.sides.right.expandedWidth), 200, 800)
          : fallback.sides.right.expandedWidth,
      },
    },
    panels: Object.create(null),
  };
  const panelSource = source && source.panels ? source.panels : null;
  for (const id of DOCK_PANEL_IDS) {
    const base = fallback.panels[id];
    const entry = panelSource && panelSource[id] ? panelSource[id] : base;
    normalized.panels[id] = {
      side: entry && entry.side === "left" ? "left" : "right",
      order: Number.isFinite(entry && entry.order) ? Math.max(0, Math.floor(entry.order)) : base.order,
    };
  }
  return normalized;
}

function setDockSideCollapsed(side, collapsed) {
  const layout = normalizeDockLayout(state.uiLayout);
  const key = side === "left" ? "left" : "right";
  layout.sides[key].collapsed = !!collapsed;
  writeDockLayout(layout);
  return layout;
}

function rememberDockSideWidth(side, width) {
  const layout = normalizeDockLayout(state.uiLayout);
  const key = side === "left" ? "left" : "right";
  const next = key === "left" ? math.clamp(Math.round(width), 150, 800) : math.clamp(Math.round(width), 200, 800);
  layout.sides[key].expandedWidth = next;
  writeDockLayout(layout);
  return layout;
}
```

Keep `readDockLayout()`, `writeDockLayout()`, and `resetDockLayout()` but update them to use the new shape. Leave `View > Reset Layout` wired to `resetDockLayout()` as-is.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tools/check-dock-layout-runtime.js`  
Expected: PASS

- [ ] **Step 5: Run syntax verification**

Run: `node --check app/core/runtime.js`  
Expected: no output

- [ ] **Step 6: Commit**

```bash
git add app/core/runtime.js tools/check-dock-layout-runtime.js
git commit -m "feat: move dock collapse state to side rails"
```

### Task 3: Convert The Dock UI From Body-Folding To Side Rails

**Files:**
- Modify: `app/ui/dock-layout.js`
- Modify: `styles.css`
- Modify: `index.html`
- Test: `tools/check-dock-layout-behavior.js`

- [ ] **Step 1: Write the failing test**

Use `tools/check-dock-layout-behavior.js` from Task 1 without modification.

- [ ] **Step 2: Run test to verify it fails**

Run: `node tools/check-dock-layout-behavior.js`  
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

Refactor `app/ui/dock-layout.js` so panel toggles collapse a side, not the panel body:

```js
function getCollapsedDockWidth() {
  return 36;
}

function getDockSideForPanel(panelId) {
  const layout = normalizeDockLayout(state.uiLayout);
  return layout.panels[panelId] && layout.panels[panelId].side === "left" ? "left" : "right";
}

function toggleDockSideCollapsed(side) {
  const layout = normalizeDockLayout(state.uiLayout);
  const key = side === "left" ? "left" : "right";
  const nextCollapsed = !layout.sides[key].collapsed;
  setDockSideCollapsed(key, nextCollapsed);
  applyDockLayout(state.uiLayout);
}

function applyDockSideState(side) {
  const layout = normalizeDockLayout(state.uiLayout);
  const key = side === "left" ? "left" : "right";
  const host = getDockSideHost(key);
  const entry = layout.sides[key];
  const hasPanels = getDockPanelsInOrder(key, { layout }).length > 0;
  host.classList.toggle("dock-side-collapsed", hasPanels && !!entry.collapsed);
  host.classList.toggle("dock-side-empty", !hasPanels);
  if (hasPanels) {
    const width = entry.collapsed ? getCollapsedDockWidth() : entry.expandedWidth;
    document.documentElement.style.setProperty(key === "left" ? "--left-w" : "--right-w", `${width}px`);
  }
}
```

Update the click handler so the button finds the side and toggles the whole side:

```js
document.addEventListener("click", (ev) => {
  const toggle = ev.target instanceof Element ? ev.target.closest("[data-dock-toggle]") : null;
  if (!toggle) return;
  const panelId = String(toggle.getAttribute("data-dock-toggle") || "");
  if (!panelId) return;
  toggleDockSideCollapsed(getDockSideForPanel(panelId));
});
```

Update `applyDockLayout()` so it no longer uses `panel.classList.toggle("collapsed", ...)`, and instead finishes with:

```js
applyDockSideState("left");
applyDockSideState("right");
```

Keep drag/reorder behavior unchanged except for one rule: when a side has no panels after a drag, it should not reserve the collapsed rail width.

Update `styles.css` to turn the side itself into the collapsed unit:

```css
.dock-side-collapsed {
  overflow: hidden;
}

.dock-side-collapsed .dock-panel {
  min-height: 0;
}

.dock-side-collapsed .dock-panel:not(:first-of-type) {
  display: none;
}

.dock-side-collapsed .dock-panel-head {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 8px 4px;
}

.dock-side-collapsed .dock-panel-head-left {
  flex-direction: column;
}

.dock-side-collapsed .dock-panel-body,
.dock-side-collapsed .dock-panel-handle {
  display: none;
}

.dock-side-empty {
  padding: 0;
  border: 0;
}
```

Update `index.html` only if needed to add a rail label target, for example:

```html
<aside id="leftTools" class="left-tools" data-dock-panel="leftTools" data-dock-title="Tools" data-dock-rail-title="Tools">
...
<aside id="rightTree" class="right-tree" data-dock-panel="rightTree" data-dock-title="Bone / Slot Tree" data-dock-rail-title="Tree / Props">
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node tools/check-dock-layout-behavior.js`  
Expected: PASS

- [ ] **Step 5: Run syntax verification**

Run:

```bash
node --check app/ui/dock-layout.js
```

Expected: no output

- [ ] **Step 6: Commit**

```bash
git add app/ui/dock-layout.js styles.css index.html tools/check-dock-layout-behavior.js
git commit -m "feat: convert dock collapse to side rails"
```

### Task 4: Persist Expanded Widths And Make Resizers Auto-Expand

**Files:**
- Modify: `app/ui/hotkeys.js`
- Modify: `app/ui/dock-layout.js`
- Test: `tools/check-dock-layout-behavior.js`

- [ ] **Step 1: Write the failing test**

Use `tools/check-dock-layout-behavior.js` from Task 1 without modification.

- [ ] **Step 2: Run test to verify it fails**

Run: `node tools/check-dock-layout-behavior.js`  
Expected: FAIL until `hotkeys.js` stores left/right widths with `rememberDockSideWidth(...)`

- [ ] **Step 3: Write minimal implementation**

Patch the left and right width resizers in `app/ui/hotkeys.js` so they remember expanded widths and auto-expand collapsed sides:

```js
if (leftResizer) {
  leftResizer.addEventListener("pointerdown", (ev) => {
    const layout = normalizeDockLayout(state.uiLayout);
    if (layout.sides.left.collapsed) {
      setDockSideCollapsed("left", false);
      applyDockLayout(state.uiLayout);
    }
    state.uiResizing = {
      type: "left",
      pointerId: ev.pointerId,
      startX: ev.clientX,
      startW: parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--left-w")) || layout.sides.left.expandedWidth,
    };
    leftResizer.setPointerCapture(ev.pointerId);
  });
  leftResizer.addEventListener("pointermove", (ev) => {
    if (!state.uiResizing || state.uiResizing.type !== "left") return;
    const next = math.clamp(state.uiResizing.startW + (ev.clientX - state.uiResizing.startX), 150, 800);
    document.documentElement.style.setProperty("--left-w", `${Math.round(next)}px`);
    rememberDockSideWidth("left", next);
  });
}
```

Mirror the same pattern for the right side:

```js
if (rightResizer) {
  rightResizer.addEventListener("pointerdown", (ev) => {
    const layout = normalizeDockLayout(state.uiLayout);
    if (layout.sides.right.collapsed) {
      setDockSideCollapsed("right", false);
      applyDockLayout(state.uiLayout);
    }
    state.uiResizing = {
      type: "right",
      pointerId: ev.pointerId,
      startX: ev.clientX,
      startW: parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--right-w")) || layout.sides.right.expandedWidth,
    };
    rightResizer.setPointerCapture(ev.pointerId);
  });
  rightResizer.addEventListener("pointermove", (ev) => {
    if (!state.uiResizing || state.uiResizing.type !== "right") return;
    const next = math.clamp(state.uiResizing.startW - (ev.clientX - state.uiResizing.startX), 200, 800);
    document.documentElement.style.setProperty("--right-w", `${Math.round(next)}px`);
    rememberDockSideWidth("right", next);
  });
}
```

If `app/ui/dock-layout.js` needs a helper to apply remembered widths after reset or reload, add:

```js
function syncDockSideWidthsFromLayout() {
  const layout = normalizeDockLayout(state.uiLayout);
  document.documentElement.style.setProperty("--left-w", `${layout.sides.left.collapsed ? getCollapsedDockWidth() : layout.sides.left.expandedWidth}px`);
  document.documentElement.style.setProperty("--right-w", `${layout.sides.right.collapsed ? getCollapsedDockWidth() : layout.sides.right.expandedWidth}px`);
}
```

Call it from `applyDockLayout()` before `applyDockSideState("left")`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tools/check-dock-layout-behavior.js`  
Expected: PASS

- [ ] **Step 5: Run syntax verification**

Run:

```bash
node --check app/ui/hotkeys.js
node --check app/ui/dock-layout.js
```

Expected: no output

- [ ] **Step 6: Commit**

```bash
git add app/ui/hotkeys.js app/ui/dock-layout.js tools/check-dock-layout-behavior.js
git commit -m "feat: persist dock widths and auto-expand resizers"
```

### Task 5: Verify Side-Rail Collapse End-To-End

**Files:**
- Test: `tools/check-dock-layout-shell.js`
- Test: `tools/check-dock-layout-runtime.js`
- Test: `tools/check-dock-layout-behavior.js`
- Test: `tools/check-stale-dom-hooks.js`
- Test: `tools/check-cache-busting-assets.js`
- Test: `app/core/runtime.js`
- Test: `app/ui/dock-layout.js`
- Test: `app/ui/hotkeys.js`
- Test: `app/ui/bootstrap.js`

- [ ] **Step 1: Run automated verification**

Run:

```bash
node tools/check-dock-layout-shell.js
node tools/check-dock-layout-runtime.js
node tools/check-dock-layout-behavior.js
node tools/check-stale-dom-hooks.js
node tools/check-cache-busting-assets.js
node --check app/core/runtime.js
node --check app/ui/dock-layout.js
node --check app/ui/hotkeys.js
node --check app/ui/bootstrap.js
```

Expected: all PASS or no output for `node --check`

- [ ] **Step 2: Run manual browser verification**

Verify in the browser:

```text
1. Collapse the left side and confirm the canvas gets wider.
2. Expand the left side and confirm it restores to the previous width.
3. Collapse the right side and confirm the canvas gets wider.
4. Drag a panel between sides, then collapse/expand that side and confirm panel order is preserved.
5. Drag the left or right resizer while that side is collapsed and confirm the side auto-expands first.
6. Reload the page and confirm collapsed state plus expanded widths persist.
7. Use View > Reset Layout and confirm:
   - left side is expanded at 260px
   - right side is expanded at 340px
   - Tools is on the left
   - Bone / Slot Tree and Properties are on the right
8. Move every panel off one side and confirm that empty side does not leave a collapsed rail behind.
```

Expected: every step succeeds without changing the existing color/style language

- [ ] **Step 3: Commit**

```bash
git add app/core/runtime.js app/ui/dock-layout.js app/ui/hotkeys.js styles.css index.html tools/check-dock-layout-shell.js tools/check-dock-layout-runtime.js tools/check-dock-layout-behavior.js
git commit -m "test: verify side rail dock collapse flow"
```
