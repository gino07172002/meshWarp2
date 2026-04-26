// ROLE: Side dock layout — manages docked panels (left/right/bottom),
// floating drag-out, snap zones, collapse/expand state. Layout
// preferences persisted to localStorage.
// EXPORTS:
//   - getDockSideHost, getDockSideResizer, getDockPanelEntry,
//     isDockPanelFloating, getDockSideForPanel, getDockPanelsInOrder
//   - setDockPanelFloat, setDockSideCollapsed, applyDockLayout
// EVENT WIRING: panel headers (drag), snap zones, collapse buttons,
//   resize handles.

let dockDragPanelId = "";

// ── Config ────────────────────────────────────────────────────
const SNAP_EDGE_PX     = 52;   // px from edge triggering snap preview
const SNAP_BOTTOM_PX   = 52;   // px from bottom edge
const FLOAT_DRAG_THR   = 14;   // px to drag before undocking
const FLOAT_MIN_W      = 200;
const FLOAT_MIN_H      = 120;
const FLOAT_Z_BASE     = 50;   // below menu-panel (140) so menus can appear above

// ── Host accessors ────────────────────────────────────────────
function getDockSideHost(side) {
  if (side === "left")   return els.leftDockSide;
  if (side === "bottom") return document.getElementById("bottomDockZone");
  return els.rightCol;
}

function getDockSideResizer(side) {
  if (side === "bottom") return document.getElementById("bottomDockResizer");
  return document.getElementById(side === "left" ? "leftResizer" : "rightResizer");
}

function getCollapsedDockWidth()   { return 36; }
function getCollapsedDockHeight()  { return 34; }

// ── Layout helpers ────────────────────────────────────────────
function getDockPanelEntry(layout, panelId) {
  return layout && layout.panels ? layout.panels[panelId] || null : null;
}

function isDockPanelFloating(panelId) {
  const layout = normalizeDockLayout(state.uiLayout);
  const entry = getDockPanelEntry(layout, panelId);
  return !!(entry && entry.float);
}

function getDockSideForPanel(panelId) {
  const layout = normalizeDockLayout(state.uiLayout);
  const entry = getDockPanelEntry(layout, panelId);
  return (entry && DOCK_VALID_SIDES.includes(entry.side)) ? entry.side : "right";
}

function getDockPanelsInOrder(side, options = null) {
  const opts = options && typeof options === "object" ? options : {};
  const excludeId = String(opts.excludeId || "");
  const layout = normalizeDockLayout(opts.layout || state.uiLayout);
  return Object.entries(layout.panels)
    .filter(([panelId, entry]) => entry.side === side && !entry.float && panelId !== excludeId)
    .sort((a, b) => a[1].order - b[1].order)
    .map(([panelId]) => document.getElementById(panelId))
    .filter(Boolean);
}

// Returns panels grouped by column: [ [{id,el,entry}, ...], [{id,el,entry}, ...] ]
function getDockColumnGroups(side, layout) {
  const normalized = normalizeDockLayout(layout || state.uiLayout);
  const entries = Object.entries(normalized.panels)
    .filter(([, e]) => e.side === side && !e.float)
    .sort((a, b) => a[1].column - b[1].column || a[1].order - b[1].order);

  const groups = [];
  for (const [panelId, entry] of entries) {
    const el = document.getElementById(panelId);
    if (!el) continue;
    const col = entry.column;
    if (!groups[col]) groups[col] = [];
    groups[col].push({ id: panelId, el, entry });
  }
  // compact: remove empty slots
  return groups.filter(Boolean);
}

// ── Drop indicator ────────────────────────────────────────────
function getOrCreateIndicator(id, className) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("div");
    el.id = id;
    el.className = className;
    el.hidden = true;
    document.body.appendChild(el);
  }
  return el;
}

function hideAllDockDropIndicators() {
  // row indicators inside col wrappers
  document.querySelectorAll(".dock-drop-indicator").forEach(el => {
    el.hidden = true;
    el.remove();
  });
  // column split indicator (vertical line, fixed positioned)
  const ci = document.getElementById("dockColSplitIndicator");
  if (ci) ci.hidden = true;
}

// Analyse drop target: returns { kind, side, colIndex, rowIndex }
// kind = "row"   → drop between rows inside a column
// kind = "col"   → split: create new column at colIndex (before/after)
// kind = "hrow"  → horizontal (bottom dock)
function getDockDropTarget(host, side, clientX, clientY) {
  const isBottom = side === "bottom";

  if (isBottom) {
    // bottom dock: panels laid out horizontally, drop between them
    const panels = [...host.querySelectorAll("[data-dock-panel]")]
      .filter(p => p.id !== dockDragPanelId);
    let rowIndex = panels.length;
    for (let i = 0; i < panels.length; i++) {
      const r = panels[i].getBoundingClientRect();
      if (clientX < r.left + r.width / 2) { rowIndex = i; break; }
    }
    return { kind: "hrow", side, colIndex: 0, rowIndex };
  }

  // For left/right: check which .dock-col the mouse is over
  const cols = [...host.querySelectorAll(".dock-col")];

  // If hovering outside all cols or no cols yet → row drop in col 0
  if (cols.length === 0) return { kind: "row", side, colIndex: 0, rowIndex: 0 };

  for (let ci = 0; ci < cols.length; ci++) {
    const colEl = cols[ci];
    const colRect = colEl.getBoundingClientRect();
    if (clientX < colRect.left || clientX > colRect.right) continue;

    const colW = colRect.width;
    const relX = clientX - colRect.left;
    const SPLIT_ZONE = Math.min(32, colW * 0.25); // px from edge → new column

    if (relX < SPLIT_ZONE) {
      // left edge → insert new column before ci
      return { kind: "col", side, colIndex: ci, rowIndex: 0, insertBefore: true };
    }
    if (relX > colW - SPLIT_ZONE) {
      // right edge → insert new column after ci
      return { kind: "col", side, colIndex: ci, rowIndex: 0, insertBefore: false };
    }

    // Middle → row drop within this column
    const panels = [...colEl.querySelectorAll("[data-dock-panel]")]
      .filter(p => p.id !== dockDragPanelId);
    let rowIndex = panels.length;
    for (let ri = 0; ri < panels.length; ri++) {
      const r = panels[ri].getBoundingClientRect();
      if (clientY < r.top + r.height / 2) { rowIndex = ri; break; }
    }
    return { kind: "row", side, colIndex: ci, rowIndex };
  }

  // Fell off right edge → col after last
  return { kind: "col", side, colIndex: cols.length - 1, rowIndex: 0, insertBefore: false };
}

function showDockDropVisual(host, target) {
  hideAllDockDropIndicators();
  if (!host || !target) return;

  if (target.kind === "hrow") {
    // horizontal indicator in bottom dock
    const ind = document.createElement("div");
    ind.className = "dock-drop-indicator dock-drop-indicator-h";
    const panels = [...host.querySelectorAll("[data-dock-panel]")]
      .filter(p => p.id !== dockDragPanelId);
    const refNode = panels[target.rowIndex] || null;
    host.insertBefore(ind, refNode);
    return;
  }

  if (target.kind === "row") {
    const cols = [...host.querySelectorAll(".dock-col")];
    const colEl = cols[target.colIndex] || host;
    const ind = document.createElement("div");
    ind.className = "dock-drop-indicator";
    const panels = [...colEl.querySelectorAll("[data-dock-panel]")]
      .filter(p => p.id !== dockDragPanelId);
    const refNode = panels[target.rowIndex] || null;
    colEl.insertBefore(ind, refNode);
    return;
  }

  if (target.kind === "col") {
    // Vertical line between columns (fixed overlay)
    const cols = [...host.querySelectorAll(".dock-col")];
    const colEl = cols[target.colIndex];
    if (!colEl) return;
    const colRect = colEl.getBoundingClientRect();
    const x = target.insertBefore ? colRect.left : colRect.right;
    const ind = getOrCreateIndicator("dockColSplitIndicator", "dock-col-split-indicator");
    ind.style.left   = `${x - 3}px`;
    ind.style.top    = `${colRect.top}px`;
    ind.style.height = `${colRect.height}px`;
    ind.hidden = false;
  }
}

// ── Snap ghost ────────────────────────────────────────────────
function getSnapGhost() {
  let g = document.getElementById("dockSnapGhost");
  if (!g) {
    g = document.createElement("div");
    g.id = "dockSnapGhost";
    g.className = "dock-snap-ghost";
    g.hidden = true;
    document.body.appendChild(g);
  }
  return g;
}

function showSnapGhost(side) {
  const g = getSnapGhost();
  g.dataset.side = side;
  g.hidden = false;
}

function hideSnapGhost() {
  const g = document.getElementById("dockSnapGhost");
  if (g) g.hidden = true;
}

function getSnapZone(clientX, clientY) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (clientX <= SNAP_EDGE_PX)            return "left";
  if (clientX >= vw - SNAP_EDGE_PX)       return "right";
  if (clientY >= vh - SNAP_BOTTOM_PX)     return "bottom";
  return null;
}

// ── Dock chrome (header + body wrapper) ──────────────────────
function updateDockPanelToggle(panelEl) {
  if (!panelEl) return;
  const toggle = panelEl.querySelector("[data-dock-toggle]");
  const titleEl = panelEl.querySelector(".dock-panel-title");
  if (!toggle) return;
  const layout = normalizeDockLayout(state.uiLayout);
  const entry = getDockPanelEntry(layout, panelEl.id);
  const isFloat = !!(entry && entry.float);
  if (isFloat) {
    if (titleEl) titleEl.textContent = String(panelEl.dataset.dockTitle || panelEl.id);
    toggle.textContent = "Dock";
    toggle.setAttribute("aria-expanded", "true");
    return;
  }
  // Timeline has a special "native" home position
  if (panelEl.id === "timelineDock") {
    if (entry && entry.side !== "native") {
      // Docked elsewhere (left/right/bottom) → Restore button sends it back
      if (titleEl) titleEl.textContent = String(panelEl.dataset.dockTitle || panelEl.id);
      toggle.textContent = "Restore";
      toggle.setAttribute("aria-expanded", "true");
      toggle.hidden = false;
    } else {
      // In native position — Collapse button toggles timeline minimize state
      if (titleEl) titleEl.textContent = String(panelEl.dataset.dockTitle || panelEl.id);
      const minimized = !!(state.anim && state.anim.timelineMinimized);
      toggle.textContent = minimized ? "Expand" : "Collapse";
      toggle.setAttribute("aria-expanded", minimized ? "false" : "true");
      toggle.hidden = false;
    }
    return;
  }
  toggle.hidden = false;
  const side = getDockSideForPanel(panelEl.id);
  const collapsed = !!(layout.sides && layout.sides[side] && layout.sides[side].collapsed);
  if (titleEl) {
    titleEl.textContent = collapsed
      ? String(panelEl.dataset.dockRailTitle || panelEl.dataset.dockTitle || panelEl.id)
      : String(panelEl.dataset.dockTitle || panelEl.id);
  }
  toggle.textContent = collapsed ? "Expand" : "Collapse";
  toggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
}

function ensureDockChrome(panelEl) {
  if (!panelEl || panelEl.dataset.dockReady === "1") return;
  const title = String(panelEl.dataset.dockTitle || panelEl.querySelector("h2, h3")?.textContent || panelEl.id);

  const head = document.createElement("div");
  head.className = "dock-panel-head";

  const headLeft = document.createElement("div");
  headLeft.className = "dock-panel-head-left";

  const handle = document.createElement("span");
  handle.className = "dock-panel-handle";
  handle.draggable = false;  // we handle drag via pointer events for consistency
  handle.setAttribute("data-dock-handle", panelEl.id);
  handle.textContent = "⠿";
  headLeft.appendChild(handle);

  const titleEl = document.createElement("strong");
  titleEl.className = "dock-panel-title";
  titleEl.textContent = title;
  headLeft.appendChild(titleEl);
  head.appendChild(headLeft);

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "dock-panel-toggle";
  toggle.setAttribute("data-dock-toggle", panelEl.id);
  toggle.textContent = "Collapse";
  head.appendChild(toggle);

  const body = document.createElement("div");
  body.className = "dock-panel-body";
  while (panelEl.firstChild) body.appendChild(panelEl.firstChild);

  panelEl.classList.add("dock-panel");
  panelEl.dataset.dockPanel = "1";
  panelEl.appendChild(head);
  panelEl.appendChild(body);
  panelEl.dataset.dockReady = "1";
}

// ── Width / height sync ───────────────────────────────────────
function computeSideTotalWidth(side, layout) {
  // Sum of all col widths + resizers (for multi-col sides)
  const sideDefaultW = side === "left"
    ? (layout.sides.left.expandedWidth || 260)
    : (layout.sides.right.expandedWidth || 340);

  // Group panels by column
  const colMap = new Map();
  for (const id of DOCK_PANEL_IDS) {
    const e = layout.panels[id];
    if (!e || e.side !== side || e.float) continue;
    if (!colMap.has(e.column)) colMap.set(e.column, []);
    colMap.get(e.column).push(e);
  }
  if (colMap.size <= 1) return sideDefaultW; // single col → use default width

  let total = 0;
  for (const items of colMap.values()) {
    items.sort((a, b) => a.order - b.order);
    const w = Number.isFinite(items[0].colWidth) ? items[0].colWidth : sideDefaultW;
    total += w;
  }
  // Add resizer widths (5px each, between cols)
  total += (colMap.size - 1) * 5;
  return total;
}

function syncDockSideWidthsFromLayout() {
  const layout = normalizeDockLayout(state.uiLayout);

  const lw = layout.sides.left.collapsed   ? getCollapsedDockWidth()  : computeSideTotalWidth("left",  layout);
  const rw = layout.sides.right.collapsed  ? getCollapsedDockWidth()  : computeSideTotalWidth("right", layout);

  document.documentElement.style.setProperty("--left-w",  `${lw}px`);
  document.documentElement.style.setProperty("--right-w", `${rw}px`);

  // bottom height: only set if bottom actually has panels; otherwise applyDockSideState sets 0px
  const hasBottomPanels = getDockPanelsInOrder("bottom", { layout }).length > 0;
  if (hasBottomPanels) {
    const bh = layout.sides.bottom.collapsed ? getCollapsedDockHeight() : layout.sides.bottom.expandedHeight;
    document.documentElement.style.setProperty("--bottom-dock-h", `${bh}px`);
  }
}

function applyDockSideState(side) {
  const layout = normalizeDockLayout(state.uiLayout);
  const host = getDockSideHost(side);
  if (!host) return;
  const resizer = getDockSideResizer(side);
  const hasPanels = getDockPanelsInOrder(side, { layout }).length > 0;
  const collapsed = hasPanels && !!(layout.sides[side] && layout.sides[side].collapsed);
  host.classList.toggle("dock-side-collapsed", collapsed);
  host.classList.toggle("dock-side-empty", !hasPanels);
  if (!hasPanels) {
    if (side === "bottom") {
      document.documentElement.style.setProperty("--bottom-dock-h", "0px");
    } else {
      document.documentElement.style.setProperty(side === "left" ? "--left-w" : "--right-w", "0px");
    }
  }
  if (resizer) resizer.hidden = !hasPanels;
}

// Move a "native" panel back to its original grid position inside #appRoot
const NATIVE_PANEL_ANCHORS = {
  timelineDock: "timelineResizer", // insert after this element
};

function restoreNativePanelPosition(panelEl) {
  if (!panelEl) return;
  const anchor = NATIVE_PANEL_ANCHORS[panelEl.id];
  if (!anchor) return;
  const anchorEl = document.getElementById(anchor);
  if (!anchorEl) return;
  const appRoot = anchorEl.parentElement;
  if (!appRoot) return;
  // Already in the right place
  if (panelEl.parentElement === appRoot && panelEl.previousElementSibling === anchorEl) return;
  // Insert after anchor
  anchorEl.after(panelEl);
}

// ── Apply full layout ─────────────────────────────────────────
function applyDockLayout(layout = state.uiLayout) {
  const normalized = writeDockLayout(layout);
  hideAllDockDropIndicators();
  for (const panelId of DOCK_PANEL_IDS) ensureDockChrome(document.getElementById(panelId));

  // Handle float / native panels first
  for (const panelId of DOCK_PANEL_IDS) {
    const panelEl = document.getElementById(panelId);
    const entry = getDockPanelEntry(normalized, panelId);
    if (!panelEl || !entry) continue;
    if (entry.float) {
      applyFloatPanel(panelEl, entry.float);
    } else if (entry.side === "native") {
      undoFloatPanel(panelEl);
      restoreNativePanelPosition(panelEl);
    }
    updateDockPanelToggle(panelEl);
  }

  // Phase 1: cache panel refs and rescue them into a holding fragment.
  // Using a DocumentFragment keeps them in memory so getElementById keeps working
  // (DocumentFragment participates in getElementById lookups when attached,
  //  but detached panels are lost — so we also build a Map as fallback).
  const panelCache = new Map();
  for (const panelId of DOCK_PANEL_IDS) {
    const panelEl = document.getElementById(panelId);
    if (panelEl) panelCache.set(panelId, panelEl);
  }

  // Detach panels that are on a dock side (left/right/bottom); keep float/native alone
  for (const panelId of DOCK_PANEL_IDS) {
    const panelEl = panelCache.get(panelId);
    const entry = getDockPanelEntry(normalized, panelId);
    if (!panelEl || !entry) continue;
    if (entry.float) continue;
    if (entry.side === "native") continue;
    if (panelEl.parentElement) panelEl.parentElement.removeChild(panelEl);
  }

  // Phase 2: remove stale col wrappers from every dock side
  for (const side of DOCK_VALID_SIDES) {
    const host = getDockSideHost(side);
    if (!host) continue;
    host.querySelectorAll(".dock-col, .dock-col-resizer").forEach(el => el.remove());
  }

  // Phase 3: render column layout for each dock side (pass cached panels)
  for (const side of DOCK_VALID_SIDES) {
    const host = getDockSideHost(side);
    if (!host) continue;
    renderDockColumns(host, side, normalized, panelCache);
  }

  syncDockSideWidthsFromLayout();
  for (const side of DOCK_VALID_SIDES) applyDockSideState(side);
  syncTimelineGridRow(normalized);
}

function renderDockColumns(host, side, layout, panelCache) {
  const isBottom = side === "bottom";

  // Collect panels belonging to this side using cached refs (panels are detached)
  const sidePanels = [];
  for (const panelId of DOCK_PANEL_IDS) {
    const panelEl = panelCache ? panelCache.get(panelId) : document.getElementById(panelId);
    const entry = getDockPanelEntry(layout, panelId);
    if (!panelEl || !entry || entry.float || entry.side !== side) continue;
    undoFloatPanel(panelEl);
    sidePanels.push({ panelId, panelEl, entry });
  }

  if (sidePanels.length === 0) return;

  if (isBottom) {
    // Bottom dock: single row, all panels directly in host ordered by order
    sidePanels.sort((a, b) => a.entry.order - b.entry.order);
    for (const { panelEl } of sidePanels) host.appendChild(panelEl);
    return;
  }

  // Left / right: group by column index
  const colMap = new Map(); // column → [{panelId, panelEl, entry}]
  for (const item of sidePanels) {
    const col = Number.isFinite(item.entry.column) ? item.entry.column : 0;
    if (!colMap.has(col)) colMap.set(col, []);
    colMap.get(col).push(item);
  }

  // Sort columns and panels within each column
  const sortedCols = [...colMap.keys()].sort((a, b) => a - b);
  for (const col of sortedCols) {
    colMap.get(col).sort((a, b) => a.entry.order - b.entry.order);
  }

  // Determine default col width for this side (used when a col has no explicit colWidth)
  const sideDefaultW = side === "left"
    ? (layout.sides.left.expandedWidth || 260)
    : (layout.sides.right.expandedWidth || 340);
  const multipleCols = sortedCols.length > 1;

  sortedCols.forEach((col, i) => {
    // Column resizer before every column after the first
    if (i > 0) {
      const resizerEl = document.createElement("div");
      resizerEl.className = "dock-col-resizer";
      resizerEl.dataset.dockColResizer = side;
      resizerEl.dataset.colIndex = String(i);
      setupColResizer(resizerEl, host, side, i);
      host.appendChild(resizerEl);
    }

    const colEl = document.createElement("div");
    colEl.className = "dock-col";
    colEl.dataset.dockCol = String(col);
    colEl.dataset.dockSide = side;

    const items = colMap.get(col);

    // Set col width:
    // - single col → flex:1 (fills the side, width controlled by --left-w/--right-w)
    // - multiple cols → fixed width per col, widths sum up (additive)
    if (multipleCols) {
      const firstPanelWidth = items[0] && items[0].entry && Number.isFinite(items[0].entry.colWidth)
        ? items[0].entry.colWidth
        : sideDefaultW;
      colEl.style.flex = `0 0 ${firstPanelWidth}px`;
    } else {
      colEl.style.flex = "1 1 0";
    }

    // Column handle (only shown when col has 2+ panels) - drag whole column
    if (items.length > 1) {
      const colHandle = document.createElement("div");
      colHandle.className = "dock-col-handle";
      colHandle.setAttribute("data-dock-col-handle", side);
      colHandle.dataset.colIndex = String(col);
      colHandle.title = "Drag entire column";
      colHandle.textContent = "═══";
      colEl.appendChild(colHandle);
    }

    items.forEach(({ panelEl }, idx) => {
      colEl.appendChild(panelEl);
      // Row resizer between adjacent panels
      if (idx < items.length - 1) {
        const rowResizer = document.createElement("div");
        rowResizer.className = "dock-row-resizer";
        setupRowResizer(rowResizer, colEl);
        colEl.appendChild(rowResizer);
      }
    });
    host.appendChild(colEl);
  });
}

// Default timeline height when in native position (used to restore)
const TIMELINE_DEFAULT_H = 280;

// The #timelineDock lives in the CSS grid row-4 by default.
// When it's anywhere other than native, we need to collapse grid row 4 to 0
// so there's no empty black space below the canvas.
function syncTimelineGridRow(layout) {
  const tlEl     = document.getElementById("timelineDock");
  const tlResizer = document.getElementById("timelineResizer");
  if (!tlEl) return;

  const entry    = getDockPanelEntry(layout, "timelineDock");
  const isNative = !entry.float && entry.side === "native";
  const inBottom = !entry.float && entry.side === "bottom";

  // native → stays in grid row 4, original resizer visible, normal height
  // non-native → suppress grid row 4 class AND collapse --timeline-h to 0
  tlEl.classList.toggle("timeline-dock-managed", !isNative);
  if (tlResizer) tlResizer.hidden = !isNative;

  if (isNative) {
    // Restore default timeline height if it was collapsed
    const current = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--timeline-h")) || 0;
    if (current < 50) {
      document.documentElement.style.setProperty("--timeline-h", `${TIMELINE_DEFAULT_H}px`);
    }
    document.documentElement.style.setProperty("--timeline-resizer-h", "8px");
  } else {
    document.documentElement.style.setProperty("--timeline-h", "0px");
    document.documentElement.style.setProperty("--timeline-resizer-h", "0px");
  }

  const bottomResizer = document.getElementById("bottomDockResizer");
  if (bottomResizer) bottomResizer.hidden = !inBottom;
}

// ── Floating panel management ─────────────────────────────────
let _floatZCounter = FLOAT_Z_BASE;
function getNextFloatZ() { return ++_floatZCounter; }

function applyFloatPanel(panelEl, floatRect) {
  if (!panelEl) return;
  panelEl.classList.add("dock-panel-floating");
  panelEl.style.position = "fixed";
  panelEl.style.left     = `${floatRect.x}px`;
  panelEl.style.top      = `${floatRect.y}px`;
  panelEl.style.width    = `${floatRect.w}px`;
  panelEl.style.height   = `${floatRect.h}px`;
  panelEl.style.zIndex   = String(getNextFloatZ());
  panelEl.style.order    = "";
  panelEl.style.flex     = "";
  if (panelEl.parentElement !== document.body) document.body.appendChild(panelEl);
  ensureFloatResizeHandle(panelEl);
}

function undoFloatPanel(panelEl) {
  if (!panelEl) return;
  panelEl.classList.remove("dock-panel-floating");
  panelEl.classList.remove("dragging-float");
  panelEl.style.position = "";
  panelEl.style.left     = "";
  panelEl.style.top      = "";
  panelEl.style.width    = "";
  panelEl.style.height   = "";
  panelEl.style.zIndex   = "";
  panelEl.style.order    = "";
  panelEl.style.flex     = "";
  panelEl.querySelector(".dock-float-resize-handle")?.remove();
}

function ensureFloatResizeHandle(panelEl) {
  if (panelEl.querySelector(".dock-float-resize-handle")) return;
  const rh = document.createElement("div");
  rh.className = "dock-float-resize-handle";
  rh.setAttribute("data-dock-float-resize", panelEl.id);
  panelEl.appendChild(rh);
}

function undockPanel(panelId) {
  const panelEl = document.getElementById(panelId);
  if (!panelEl) return;
  const rect = panelEl.getBoundingClientRect();
  const floatRect = {
    x: Math.round(rect.left),
    y: Math.round(rect.top),
    w: Math.max(FLOAT_MIN_W, Math.round(rect.width)),
    h: Math.max(FLOAT_MIN_H, Math.round(rect.height)),
  };
  // Remember original side so we can compact that side's columns
  const layout = normalizeDockLayout(state.uiLayout);
  const origEntry = getDockPanelEntry(layout, panelId);
  const origSide = origEntry ? origEntry.side : null;

  const nextLayout = setDockPanelFloat(panelId, floatRect);
  // Compact column indices on the side the panel left (avoid sparse columns)
  if (origSide && DOCK_VALID_SIDES.includes(origSide)) {
    compactDockColumns(nextLayout, origSide);
    writeDockLayout(nextLayout);
  }
  applyDockLayout(nextLayout);
}

function redockPanel(panelId, side, order) {
  const layout = normalizeDockLayout(state.uiLayout);
  if (!getDockPanelEntry(layout, panelId)) return;

  // "native" side: just clear float, restore to native grid row
  if (side === "native") {
    layout.panels[panelId].float = null;
    layout.panels[panelId].side  = "native";
    applyDockLayout(layout);
    return;
  }

  const targetSide = DOCK_VALID_SIDES.includes(side) ? side : "right";
  const orderedIds = {};
  for (const s of DOCK_VALID_SIDES) {
    orderedIds[s] = getDockPanelsInOrder(s, { layout }).map(p => p.id).filter(id => id !== panelId);
  }
  const insertAt = Math.min(Math.max(0, Number(order) || 0), orderedIds[targetSide].length);
  orderedIds[targetSide].splice(insertAt, 0, panelId);
  for (const s of DOCK_VALID_SIDES) {
    orderedIds[s].forEach((id, idx) => {
      if (!layout.panels[id]) return;
      layout.panels[id].side  = s;
      layout.panels[id].order = idx;
      layout.panels[id].float = null;
    });
  }
  applyDockLayout(layout);
}

// ── Column resizer (drag to resize columns horizontally) ──────
let _colResize = null;

function setupColResizer(resizerEl, host, side, colIndex) {
  resizerEl.addEventListener("pointerdown", (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    const cols = [...host.querySelectorAll(".dock-col")];
    const leftCol  = cols[colIndex - 1];  // the col whose right edge we're dragging
    if (!leftCol) return;
    _colResize = {
      side, colIndex,
      startX: ev.clientX,
      startLeftW: leftCol.getBoundingClientRect().width,
      leftCol,
      host,
      pointerId: ev.pointerId,
    };
    try { resizerEl.setPointerCapture(ev.pointerId); } catch { /**/ }
  });
}

function onColResizeMove(ev) {
  if (!_colResize) return;
  const dx = ev.clientX - _colResize.startX;
  // If dragging the first-side resizer, moving right should grow the col (add dx).
  // For right-side dock, the col is on the right of the side; our col-resizer sits
  // between cols, so leftCol always refers to the col whose right edge is dragged.
  const newLeft = Math.max(80, _colResize.startLeftW + dx);
  _colResize.leftCol.style.flex = `0 0 ${newLeft}px`;

  // Recompute side total width live — sum up all cols + resizers
  const cols = [..._colResize.host.querySelectorAll(".dock-col")];
  const resizers = [..._colResize.host.querySelectorAll(".dock-col-resizer")];
  let total = 0;
  for (const c of cols) total += c.getBoundingClientRect().width;
  total += resizers.length * 5;
  document.documentElement.style.setProperty(
    _colResize.side === "left" ? "--left-w" : "--right-w",
    `${total}px`
  );
}

function onColResizeEnd() {
  if (!_colResize) return;
  // Persist the new width into the layout entry of the first panel of leftCol
  const { side, leftCol } = _colResize;
  _colResize = null;
  if (!leftCol) return;
  const newWidth = Math.round(leftCol.getBoundingClientRect().width);
  // Find which column index this col is (read dataset)
  const colIdx = Number(leftCol.dataset.dockCol || 0);
  const layout = normalizeDockLayout(state.uiLayout);
  for (const id of DOCK_PANEL_IDS) {
    const e = layout.panels[id];
    if (e && e.side === side && e.column === colIdx && !e.float) {
      e.colWidth = newWidth;
    }
  }
  writeDockLayout(layout);
}

// ── Row resizer (drag to resize panels vertically within a column) ──
let _rowResize = null;

function setupRowResizer(resizerEl, colEl) {
  resizerEl.addEventListener("pointerdown", (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    const prev = resizerEl.previousElementSibling;
    const next = resizerEl.nextElementSibling;
    if (!prev || !next) return;
    if (!prev.classList.contains("dock-panel") || !next.classList.contains("dock-panel")) return;
    _rowResize = {
      pointerId: ev.pointerId,
      startY: ev.clientY,
      startTopH: prev.getBoundingClientRect().height,
      startBotH: next.getBoundingClientRect().height,
      topEl: prev,
      botEl: next,
      resizerEl,
    };
    try { resizerEl.setPointerCapture(ev.pointerId); } catch { /**/ }
  });
}

function onRowResizeMove(ev) {
  if (!_rowResize) return;
  const dy = ev.clientY - _rowResize.startY;
  const newTop = Math.max(60, _rowResize.startTopH + dy);
  const newBot = Math.max(60, _rowResize.startBotH - dy);
  _rowResize.topEl.style.flex = `0 0 ${newTop}px`;
  _rowResize.botEl.style.flex = `0 0 ${newBot}px`;
}

function onRowResizeEnd() {
  if (!_rowResize) return;
  const { resizerEl, pointerId } = _rowResize;
  if (resizerEl && pointerId !== undefined) {
    try { resizerEl.releasePointerCapture(pointerId); } catch { /**/ }
  }
  _rowResize = null;
}

// ── Docked panel move (with column support) ───────────────────
function moveDockPanel(panelId, target) {
  // target = { kind, side, colIndex, rowIndex, insertBefore? }
  const layout = normalizeDockLayout(state.uiLayout);
  if (!getDockPanelEntry(layout, panelId)) return;

  const targetSide = DOCK_VALID_SIDES.includes(target.side) ? target.side : "right";

  if (target.kind === "col") {
    // Create a new column
    const groups = getDockColumnGroups(targetSide, layout);
    const insertColIdx = target.insertBefore ? target.colIndex : target.colIndex + 1;

    // Shift existing columns that are at or after insertColIdx
    for (const id of DOCK_PANEL_IDS) {
      const e = layout.panels[id];
      if (!e || e.side !== targetSide || e.float) continue;
      if (e.column >= insertColIdx) e.column += 1;
    }
    layout.panels[panelId].side   = targetSide;
    layout.panels[panelId].column = insertColIdx;
    layout.panels[panelId].order  = 0;
    layout.panels[panelId].float  = null;
  } else {
    // Row drop within existing column (or bottom dock row)
    const targetCol = (target.kind === "hrow") ? 0 : target.colIndex;

    // Gather panels in the target column (excluding dragged panel)
    const inCol = Object.entries(layout.panels)
      .filter(([id, e]) => id !== panelId && e.side === targetSide && !e.float &&
        (target.kind === "hrow" || e.column === targetCol))
      .sort((a, b) => a[1].order - b[1].order)
      .map(([id]) => id);

    // Insert at rowIndex
    const insertAt = Math.min(Math.max(0, target.rowIndex), inCol.length);
    inCol.splice(insertAt, 0, panelId);

    // Re-assign orders; move dragged panel to this column
    layout.panels[panelId].side   = targetSide;
    layout.panels[panelId].column = targetCol;
    layout.panels[panelId].float  = null;
    inCol.forEach((id, idx) => {
      if (!layout.panels[id]) return;
      layout.panels[id].order = idx;
    });
  }

  // Normalise column indices (compact)
  compactDockColumns(layout, targetSide);
  applyDockLayout(layout);
}

function compactDockColumns(layout, side) {
  const used = new Set();
  for (const id of DOCK_PANEL_IDS) {
    const e = layout.panels[id];
    if (e && e.side === side && !e.float) used.add(e.column);
  }
  const sorted = [...used].sort((a, b) => a - b);
  const remap = new Map(sorted.map((col, i) => [col, i]));
  for (const id of DOCK_PANEL_IDS) {
    const e = layout.panels[id];
    if (e && e.side === side && !e.float) e.column = remap.get(e.column) ?? 0;
  }
}

// ── Collapse toggle ───────────────────────────────────────────
function toggleDockSideCollapsed(side) {
  const layout = normalizeDockLayout(state.uiLayout);
  const key = DOCK_VALID_SIDES.includes(side) ? side : "right";
  const nextCollapsed = !(layout.sides[key] && layout.sides[key].collapsed);
  setDockSideCollapsed(key, nextCollapsed);
  applyDockLayout(state.uiLayout);
}

// ── Float drag (move floating panel) ─────────────────────────
let _floatDrag = null;

function startFloatDrag(panelEl, ev) {
  const rect = panelEl.getBoundingClientRect();
  panelEl.style.zIndex = String(getNextFloatZ());
  _floatDrag = {
    panelId: panelEl.id,
    startMouseX: ev.clientX,
    startMouseY: ev.clientY,
    startPanelX: rect.left,
    startPanelY: rect.top,
    snapping: null,
    dropTarget: null,
    pointerId: Number.isFinite(ev.pointerId) ? ev.pointerId : null,
  };
  panelEl.classList.add("dragging-float");
  // Capture pointer so we keep getting move/up events even if cursor leaves panel
  if (_floatDrag.pointerId !== null) {
    try { panelEl.setPointerCapture(_floatDrag.pointerId); } catch { /**/ }
  }
}

function onFloatDragMove(ev) {
  if (!_floatDrag) return;
  const dx = ev.clientX - _floatDrag.startMouseX;
  const dy = ev.clientY - _floatDrag.startMouseY;
  const panelEl = document.getElementById(_floatDrag.panelId);
  if (!panelEl) return;
  panelEl.style.left = `${_floatDrag.startPanelX + dx}px`;
  panelEl.style.top  = `${_floatDrag.startPanelY + dy}px`;

  // Priority 1: hovering over another dock panel's edge → show insertion preview
  const innerTarget = getFloatDragInnerTarget(ev.clientX, ev.clientY, _floatDrag.panelId);
  if (innerTarget) {
    hideSnapGhost();
    const host = getDockSideHost(innerTarget.side);
    if (host) showDockDropVisual(host, innerTarget);
    _floatDrag.snapping  = null;
    _floatDrag.dropTarget = innerTarget;
    return;
  }
  _floatDrag.dropTarget = null;

  // Priority 2: near window edge → full-side snap ghost
  const zone = getSnapZone(ev.clientX, ev.clientY);
  _floatDrag.snapping = zone;
  hideAllDockDropIndicators();
  if (zone) showSnapGhost(zone); else hideSnapGhost();
}

// Check if the floating panel is hovering over a docked panel's edge.
// draggedPanelId can be a string or an array of panel ids to exclude.
// Returns a moveDockPanel target or null.
function getFloatDragInnerTarget(clientX, clientY, draggedPanelId) {
  const excluded = Array.isArray(draggedPanelId) ? new Set(draggedPanelId) : new Set([draggedPanelId]);
  const docked = [];
  for (const panelId of DOCK_PANEL_IDS) {
    if (excluded.has(panelId)) continue;
    const el = document.getElementById(panelId);
    if (!el || el.classList.contains("dock-panel-floating")) continue;
    const entry = getDockPanelEntry(normalizeDockLayout(state.uiLayout), panelId);
    if (!entry || entry.float || entry.side === "native") continue;
    docked.push({ panelId, el, entry });
  }

  for (const { panelId, el, entry } of docked) {
    const r = el.getBoundingClientRect();
    if (clientX < r.left || clientX > r.right || clientY < r.top || clientY > r.bottom) continue;

    const EDGE = 0.3; // 30% of the panel dimension triggers edge insertion
    const relX = (clientX - r.left) / r.width;
    const relY = (clientY - r.top) / r.height;
    const side = entry.side;
    const host = getDockSideHost(side);
    if (!host) continue;

    const isBottom = side === "bottom";
    const cols = [...host.querySelectorAll(".dock-col")];

    // Find the column containing this panel (left/right only)
    let colIndex = 0;
    if (!isBottom) {
      for (let i = 0; i < cols.length; i++) {
        if (cols[i].contains(el)) { colIndex = i; break; }
      }
    }

    // Left edge → new column before this panel's column
    if (!isBottom && relX < EDGE) {
      return { kind: "col", side, colIndex, rowIndex: 0, insertBefore: true };
    }
    // Right edge → new column after
    if (!isBottom && relX > 1 - EDGE) {
      return { kind: "col", side, colIndex, rowIndex: 0, insertBefore: false };
    }
    // Top edge → insert as row above in same column
    if (relY < EDGE) {
      return isBottom
        ? { kind: "hrow", side, colIndex: 0, rowIndex: entry.order }
        : { kind: "row", side, colIndex, rowIndex: entry.order };
    }
    // Bottom edge → insert below
    if (relY > 1 - EDGE) {
      return isBottom
        ? { kind: "hrow", side, colIndex: 0, rowIndex: entry.order + 1 }
        : { kind: "row", side, colIndex, rowIndex: entry.order + 1 };
    }
    // Middle — no insertion preview (keep floating)
    return null;
  }
  return null;
}

function onFloatDragEnd(ev) {
  if (!_floatDrag) return;
  const { panelId, snapping, dropTarget, pointerId } = _floatDrag;
  hideSnapGhost();
  hideAllDockDropIndicators();
  _floatDrag = null;
  const panelEl = document.getElementById(panelId);
  if (panelEl) {
    panelEl.classList.remove("dragging-float");
    if (pointerId !== null && pointerId !== undefined) {
      try { panelEl.releasePointerCapture(pointerId); } catch { /**/ }
    }
  }

  // Priority 1: precise inner drop target (over another panel's edge)
  if (dropTarget) {
    moveDockPanel(panelId, dropTarget);
    return;
  }

  // Priority 2: window-edge snap
  if (snapping) {
    redockPanel(panelId, snapping, 9999);
    return;
  }

  // Otherwise: persist new float position
  const rect = panelEl ? panelEl.getBoundingClientRect() : null;
  if (rect) {
    setDockPanelFloat(panelId, { x: Math.round(rect.left), y: Math.round(rect.top), w: Math.round(rect.width), h: Math.round(rect.height) });
  }
}

// ── Float resize (bottom-right corner) ───────────────────────
let _floatResize = null;

function startFloatResize(panelEl, ev) {
  const rect = panelEl.getBoundingClientRect();
  panelEl.style.zIndex = String(getNextFloatZ());
  _floatResize = { panelId: panelEl.id, startMouseX: ev.clientX, startMouseY: ev.clientY, startW: rect.width, startH: rect.height };
}

function onFloatResizeMove(ev) {
  if (!_floatResize) return;
  const panelEl = document.getElementById(_floatResize.panelId);
  if (!panelEl) return;
  panelEl.style.width  = `${Math.max(FLOAT_MIN_W, _floatResize.startW + ev.clientX - _floatResize.startMouseX)}px`;
  panelEl.style.height = `${Math.max(FLOAT_MIN_H, _floatResize.startH + ev.clientY - _floatResize.startMouseY)}px`;
}

function onFloatResizeEnd() {
  if (!_floatResize) return;
  const { panelId } = _floatResize;
  _floatResize = null;
  const panelEl = document.getElementById(panelId);
  if (!panelEl) return;
  const rect = panelEl.getBoundingClientRect();
  setDockPanelFloat(panelId, { x: Math.round(rect.left), y: Math.round(rect.top), w: Math.round(rect.width), h: Math.round(rect.height) });
}

// ── Column group drag (drag entire column as a unit) ─────────
let _colGroupDrag = null;

function startColGroupDrag(side, colIndex, ev) {
  // Collect all panels in this column
  const layout = normalizeDockLayout(state.uiLayout);
  const panelIds = [];
  for (const id of DOCK_PANEL_IDS) {
    const e = layout.panels[id];
    if (!e || e.side !== side || e.float || e.column !== colIndex) continue;
    panelIds.push(id);
  }
  if (panelIds.length === 0) return;
  panelIds.sort((a, b) => (layout.panels[a].order || 0) - (layout.panels[b].order || 0));

  // Find the col wrapper in the DOM
  const host = getDockSideHost(side);
  const colEl = host ? host.querySelector(`.dock-col[data-dock-col="${colIndex}"]`) : null;
  if (!colEl) return;
  const rect = colEl.getBoundingClientRect();

  // Float the column: turn the colEl into a floating overlay carrying all panels
  colEl.classList.add("dock-col-floating");
  colEl.style.position = "fixed";
  colEl.style.left   = `${rect.left}px`;
  colEl.style.top    = `${rect.top}px`;
  colEl.style.width  = `${rect.width}px`;
  colEl.style.height = `${rect.height}px`;
  colEl.style.zIndex = String(getNextFloatZ());
  document.body.appendChild(colEl);

  _colGroupDrag = {
    panelIds,
    side,
    colIndex,
    colEl,
    startMouseX: ev.clientX,
    startMouseY: ev.clientY,
    startLeft: rect.left,
    startTop: rect.top,
    pointerId: Number.isFinite(ev.pointerId) ? ev.pointerId : null,
    dropTarget: null,
    snapping: null,
  };
  if (_colGroupDrag.pointerId !== null) {
    try { colEl.setPointerCapture(_colGroupDrag.pointerId); } catch { /**/ }
  }
}

function onColGroupDragMove(ev) {
  if (!_colGroupDrag) return;
  const dx = ev.clientX - _colGroupDrag.startMouseX;
  const dy = ev.clientY - _colGroupDrag.startMouseY;
  const colEl = _colGroupDrag.colEl;
  if (!colEl) return;
  colEl.style.left = `${_colGroupDrag.startLeft + dx}px`;
  colEl.style.top  = `${_colGroupDrag.startTop + dy}px`;

  // Priority 1: inner target on a docked panel's edge
  // (exclude all panels in the group being dragged)
  const innerTarget = getFloatDragInnerTarget(ev.clientX, ev.clientY, _colGroupDrag.panelIds);
  if (innerTarget) {
    hideSnapGhost();
    const host = getDockSideHost(innerTarget.side);
    if (host) showDockDropVisual(host, innerTarget);
    _colGroupDrag.dropTarget = innerTarget;
    _colGroupDrag.snapping = null;
    return;
  }
  _colGroupDrag.dropTarget = null;

  // Priority 2: window-edge snap
  const zone = getSnapZone(ev.clientX, ev.clientY);
  _colGroupDrag.snapping = zone;
  hideAllDockDropIndicators();
  if (zone) showSnapGhost(zone); else hideSnapGhost();
}

function onColGroupDragEnd(ev) {
  if (!_colGroupDrag) return;
  const { panelIds, snapping, dropTarget, colEl, pointerId } = _colGroupDrag;
  hideSnapGhost();
  hideAllDockDropIndicators();
  _colGroupDrag = null;

  // STEP 1: rescue panels FIRST (before any DOM manipulation that could fail).
  // Use document.getElementById in case the col wrapper is somehow detached.
  for (const id of panelIds) {
    const panelEl = document.getElementById(id) || (colEl && colEl.querySelector(`#${CSS.escape(id)}`));
    if (!panelEl) continue;
    panelEl.classList.remove("dock-panel-floating", "dragging-float");
    panelEl.style.position = "";
    panelEl.style.left = "";
    panelEl.style.top = "";
    panelEl.style.width = "";
    panelEl.style.height = "";
    panelEl.style.zIndex = "";
    panelEl.style.order = "";
    panelEl.style.flex = "";
    panelEl.querySelector(".dock-float-resize-handle")?.remove();
    // Ensure panel lives in document (not only inside a detached col wrapper)
    if (panelEl.parentElement !== document.body) {
      document.body.appendChild(panelEl);
    }
  }

  // STEP 2: release pointer capture, remove the floating col wrapper
  if (colEl) {
    try {
      if (pointerId !== null && pointerId !== undefined) {
        colEl.releasePointerCapture(pointerId);
      }
    } catch { /**/ }
    colEl.classList.remove("dock-col-floating");
    colEl.style.cssText = "";
    if (colEl.parentElement) colEl.parentElement.removeChild(colEl);
  }

  if (dropTarget) {
    moveDockColumn(panelIds, dropTarget);
    return;
  }
  if (snapping) {
    moveDockColumn(panelIds, { kind: "col", side: snapping, colIndex: 0, rowIndex: 0, insertBefore: true });
    return;
  }
  // No drop target — just re-render to restore
  applyDockLayout(state.uiLayout);
}

// Move multiple panels (a whole column) to a new target location
function moveDockColumn(panelIds, target) {
  if (!panelIds || panelIds.length === 0) return;
  const layout = normalizeDockLayout(state.uiLayout);
  const targetSide = DOCK_VALID_SIDES.includes(target.side) ? target.side : "right";

  if (target.kind === "col") {
    // Create a new column for the whole group
    const insertColIdx = target.insertBefore ? target.colIndex : target.colIndex + 1;
    // Shift existing columns on target side
    for (const id of DOCK_PANEL_IDS) {
      const e = layout.panels[id];
      if (!e || e.side !== targetSide || e.float) continue;
      if (panelIds.includes(id)) continue;
      if (e.column >= insertColIdx) e.column += 1;
    }
    panelIds.forEach((id, idx) => {
      layout.panels[id].side   = targetSide;
      layout.panels[id].column = insertColIdx;
      layout.panels[id].order  = idx;
      layout.panels[id].float  = null;
    });
  } else {
    // Row drop: insert all panels into one column (stack them)
    const targetCol = (target.kind === "hrow") ? 0 : target.colIndex;
    const inCol = Object.entries(layout.panels)
      .filter(([id, e]) => !panelIds.includes(id) && e.side === targetSide && !e.float &&
        (target.kind === "hrow" || e.column === targetCol))
      .sort((a, b) => a[1].order - b[1].order)
      .map(([id]) => id);
    const insertAt = Math.min(Math.max(0, target.rowIndex), inCol.length);
    const newOrder = [...inCol.slice(0, insertAt), ...panelIds, ...inCol.slice(insertAt)];
    newOrder.forEach((id, idx) => {
      if (!layout.panels[id]) return;
      layout.panels[id].order = idx;
    });
    panelIds.forEach(id => {
      layout.panels[id].side   = targetSide;
      layout.panels[id].column = targetCol;
      layout.panels[id].float  = null;
    });
  }

  compactDockColumns(layout, targetSide);
  applyDockLayout(layout);
}

// ── Drag-out-to-undock (docked handle mousedown → drag away) ──
let _dockToFloatDrag = null;

function onDockedHandleMouseMove(ev) {
  if (!_dockToFloatDrag || _dockToFloatDrag.triggered) return;
  const dx = ev.clientX - _dockToFloatDrag.startX;
  const dy = ev.clientY - _dockToFloatDrag.startY;
  if (Math.sqrt(dx * dx + dy * dy) < FLOAT_DRAG_THR) return;
  _dockToFloatDrag.triggered = true;
  const { panelId, pointerId } = _dockToFloatDrag;
  _dockToFloatDrag = null;

  undockPanel(panelId);
  const panelEl = document.getElementById(panelId);
  if (panelEl) {
    const rect = panelEl.getBoundingClientRect();
    // Pass real pointerId so setPointerCapture works
    startFloatDrag(panelEl, { clientX: ev.clientX, clientY: ev.clientY, pointerId });
    if (_floatDrag) {
      _floatDrag.startMouseX = ev.clientX;
      _floatDrag.startMouseY = ev.clientY;
      _floatDrag.startPanelX = rect.left;
      _floatDrag.startPanelY = rect.top;
    }
  }
}

function onDockedHandleMouseUp() { _dockToFloatDrag = null; }

// ── Bottom dock resizer ───────────────────────────────────────
let _bottomResize = null;

function setupBottomDockResizer() {
  const resizer = document.getElementById("bottomDockResizer");
  if (!resizer) return;
  resizer.addEventListener("pointerdown", (ev) => {
    _bottomResize = { pointerId: ev.pointerId, startY: ev.clientY, startH: normalizeDockLayout(state.uiLayout).sides.bottom.expandedHeight };
    resizer.setPointerCapture(ev.pointerId);
  });
  resizer.addEventListener("pointermove", (ev) => {
    if (!_bottomResize) return;
    const delta = _bottomResize.startY - ev.clientY;
    rememberDockBottomHeight(_bottomResize.startH + delta);
    syncDockSideWidthsFromLayout();
  });
  function endBottomResize(ev) {
    if (!_bottomResize) return;
    try { resizer.releasePointerCapture(ev.pointerId); } catch { /**/ }
    _bottomResize = null;
  }
  resizer.addEventListener("pointerup", endBottomResize);
  resizer.addEventListener("pointercancel", endBottomResize);
}

// ── Main setup ────────────────────────────────────────────────
function setupDockLayout() {
  if (!els.leftDockSide || !els.rightCol) return;

  // Inject bottom dock zone into the DOM if not already there
  ensureBottomDockZone();

  state.uiLayout = readDockLayout();
  applyDockLayout(state.uiLayout);
  setupBottomDockResizer();

  if (document.body.dataset.dockLayoutBound === "1") return;
  document.body.dataset.dockLayoutBound = "1";

  // Click anywhere on a collapsed rail → expand that side
  document.addEventListener("click", (ev) => {
    if (!(ev.target instanceof Element)) return;
    const collapsedSide = ev.target.closest(".dock-side-collapsed");
    if (!collapsedSide) return;
    // Empty side has nothing to show when expanded — ignore
    if (collapsedSide.classList.contains("dock-side-empty")) return;
    if (ev.target.closest("[data-dock-toggle]")) return; // toggle has its own handler
    const isLeft   = collapsedSide.classList.contains("dock-side-left");
    const isRight  = collapsedSide.classList.contains("dock-side-right");
    const isBottom = collapsedSide.classList.contains("dock-side-bottom");
    const side = isLeft ? "left" : isRight ? "right" : isBottom ? "bottom" : null;
    if (!side) return;
    toggleDockSideCollapsed(side);
  });

  // Collapse / Dock-back button
  document.addEventListener("click", (ev) => {
    const toggle = ev.target instanceof Element ? ev.target.closest("[data-dock-toggle]") : null;
    if (!toggle) return;
    const panelId = String(toggle.getAttribute("data-dock-toggle") || "");
    if (!panelId) return;
    const layout = normalizeDockLayout(state.uiLayout);
    const entry = getDockPanelEntry(layout, panelId);

    // Timeline special cases
    if (panelId === "timelineDock") {
      if (entry && entry.side !== "native" && !entry.float) {
        // Restore button → send to native
        redockPanel(panelId, "native", 0);
        return;
      }
      if (entry && entry.side === "native") {
        // Native timeline: Collapse button toggles minimize (uses the existing
        // #timelineCollapseBtn logic for a unified behaviour)
        if (els && els.timelineCollapseBtn) {
          els.timelineCollapseBtn.click();
        } else if (state.anim) {
          state.anim.timelineMinimized = !state.anim.timelineMinimized;
          if (typeof updateWorkspaceUI === "function") updateWorkspaceUI();
        }
        // Refresh the dock toggle label to reflect the new state
        if (typeof updateDockPanelToggle === "function") {
          updateDockPanelToggle(document.getElementById("timelineDock"));
        }
        return;
      }
      // Fall through for float case below
    }

    if (isDockPanelFloating(panelId)) {
      // timeline defaults back to native grid row when docked back
      const targetSide = (panelId === "timelineDock") ? "native" : (entry ? entry.side : "right");
      redockPanel(panelId, targetSide, 9999);
    } else {
      toggleDockSideCollapsed(getDockSideForPanel(panelId));
    }
  });

  // Bring floating panel to front
  document.addEventListener("pointerdown", (ev) => {
    const panelEl = ev.target instanceof Element ? ev.target.closest(".dock-panel-floating") : null;
    if (panelEl) panelEl.style.zIndex = String(getNextFloatZ());
  }, true);

  // Float-panel header drag
  document.addEventListener("pointerdown", (ev) => {
    const head = ev.target instanceof Element ? ev.target.closest(".dock-panel-head") : null;
    if (!head) return;
    const panelEl = head.closest(".dock-panel-floating");
    if (!panelEl) return;
    if (ev.target instanceof Element && ev.target.closest("[data-dock-toggle]")) return;
    ev.preventDefault();
    startFloatDrag(panelEl, ev);
  });

  // Float-panel resize handle
  document.addEventListener("pointerdown", (ev) => {
    const rh = ev.target instanceof Element ? ev.target.closest("[data-dock-float-resize]") : null;
    if (!rh) return;
    const panelEl = document.getElementById(String(rh.getAttribute("data-dock-float-resize") || ""));
    if (!panelEl) return;
    ev.preventDefault();
    startFloatResize(panelEl, ev);
  });

  // Column handle drag (drags entire column as a unit)
  document.addEventListener("pointerdown", (ev) => {
    const handle = ev.target instanceof Element ? ev.target.closest("[data-dock-col-handle]") : null;
    if (!handle) return;
    const side = String(handle.getAttribute("data-dock-col-handle") || "");
    const colIndex = Number(handle.dataset.colIndex || 0);
    if (!DOCK_VALID_SIDES.includes(side)) return;
    ev.preventDefault();
    ev.stopPropagation();
    startColGroupDrag(side, colIndex, ev);
  });

  document.addEventListener("pointermove", (ev) => {
    onFloatDragMove(ev);
    onFloatResizeMove(ev);
    onColResizeMove(ev);
    onRowResizeMove(ev);
    onDockedHandleMouseMove(ev);
    onColGroupDragMove(ev);
  });

  document.addEventListener("pointerup", (ev) => {
    onFloatDragEnd(ev);
    onFloatResizeEnd();
    onColResizeEnd();
    onRowResizeEnd();
    onDockedHandleMouseUp(ev);
    onColGroupDragEnd(ev);
  });

  document.addEventListener("pointercancel", (ev) => {
    onFloatDragEnd(ev);
    onFloatResizeEnd();
    onColResizeEnd();
    onRowResizeEnd();
    onDockedHandleMouseUp(ev);
    onColGroupDragEnd(ev);
  });

  // Native drag (docked panel reorder / column split)
  document.addEventListener("dragstart", (ev) => {
    const handle = ev.target instanceof Element ? ev.target.closest("[data-dock-handle]") : null;
    if (!handle || !ev.dataTransfer) return;
    const panelId = String(handle.getAttribute("data-dock-handle") || "");
    if (!panelId || isDockPanelFloating(panelId)) { ev.preventDefault(); return; }
    dockDragPanelId = panelId;
    ev.dataTransfer.effectAllowed = "move";
    ev.dataTransfer.setData("text/dock-panel", panelId);
    document.getElementById(panelId)?.classList.add("dragging");
  });

  document.addEventListener("dragend", () => {
    if (dockDragPanelId) document.getElementById(dockDragPanelId)?.classList.remove("dragging");
    dockDragPanelId = "";
    hideAllDockDropIndicators();
    hideSnapGhost();
  });

  // Track last known drop target for drop event
  let _lastDropTarget = null;

  for (const side of DOCK_VALID_SIDES) {
    const host = getDockSideHost(side);
    if (!host) continue;
    host.addEventListener("dragover", (ev) => {
      if (!dockDragPanelId) return;
      ev.preventDefault();
      if (ev.dataTransfer) ev.dataTransfer.dropEffect = "move";
      const target = getDockDropTarget(host, side, ev.clientX, ev.clientY);
      _lastDropTarget = target;
      showDockDropVisual(host, target);
    });
    host.addEventListener("dragleave", (ev) => {
      if (!dockDragPanelId) return;
      if (ev.relatedTarget instanceof Element && host.contains(ev.relatedTarget)) return;
      hideAllDockDropIndicators();
      _lastDropTarget = null;
    });
    host.addEventListener("drop", (ev) => {
      if (!dockDragPanelId) return;
      ev.preventDefault();
      const panelId = ev.dataTransfer ? ev.dataTransfer.getData("text/dock-panel") : dockDragPanelId;
      const target = _lastDropTarget || getDockDropTarget(host, side, ev.clientX, ev.clientY);
      moveDockPanel(panelId, target);
      document.getElementById(panelId)?.classList.remove("dragging");
      dockDragPanelId = "";
      _lastDropTarget = null;
      hideAllDockDropIndicators();
    });
  }

  // Drag-out-to-undock via pointer
  document.addEventListener("pointerdown", (ev) => {
    const handle = ev.target instanceof Element ? ev.target.closest("[data-dock-handle]") : null;
    if (!handle) return;
    const panelId = String(handle.getAttribute("data-dock-handle") || "");
    if (!panelId || isDockPanelFloating(panelId)) return;
    _dockToFloatDrag = { panelId, startX: ev.clientX, startY: ev.clientY, triggered: false, pointerId: ev.pointerId };
  }, true);
}

// ── Bottom dock zone injection ────────────────────────────────
function ensureBottomDockZone() {
  if (document.getElementById("bottomDockZone")) return;

  const resizer = document.createElement("div");
  resizer.id = "bottomDockResizer";
  resizer.className = "bottom-dock-resizer";
  resizer.title = "Drag to resize bottom dock";

  const zone = document.createElement("section");
  zone.id = "bottomDockZone";
  zone.className = "dock-side dock-side-bottom";

  const appRoot = document.getElementById("appRoot");
  if (!appRoot) return;
  appRoot.appendChild(resizer);
  appRoot.appendChild(zone);
}
