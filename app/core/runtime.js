// ROLE: Foundation — shared mutable `state` object, GL context + program/
// VBO/IBO setup, math helpers, dock layout, command palette, status bar,
// rig math (computeWorld, getEditAwareWorld, normalizeRig*).
// Loaded after runtime-els.js (which declares the `els` registry).
// `els` is a global `const` declared in runtime-els.js — referenced here.
// EXPORTS (globals):
//   - state: single source of truth for editor state
//     (state.mesh, state.slots, state.anim, state.export, etc.)
//   - gl, hasGL, isWebGL2, hasVAO, program, vbo, ibo, vao, loc
//   - setStatus, requestRender, scheduleDraw, math.* (clamp, degToRad…)
//   - createProgram, ensureGLTextureForCanvas, applyGLBlendMode,
//     bindGeometry, setupVertexLayout, finishMainGLSetup,
//     initMainGLResources
//   - computeWorld, getEditAwareWorld, transformPoint, mul, invert,
//     matFromBone, matFromTR (rig math used by bones.js + others)
// (DOM `els` registry is in runtime-els.js. AI capture registry is in
//  runtime-ai-capture.js. Pose auto-rig is in runtime-pose-autorig.js.)

const gl =
  els.glCanvas.getContext("webgl2", { alpha: true, premultipliedAlpha: false, stencil: true, powerPreference: "high-performance", failIfMajorPerformanceCaveat: false, preserveDrawingBuffer: false, antialias: false }) ||
  els.glCanvas.getContext("webgl", { alpha: true, premultipliedAlpha: false, stencil: true, powerPreference: "high-performance", failIfMajorPerformanceCaveat: false, preserveDrawingBuffer: false, antialias: false }) ||
  els.glCanvas.getContext("experimental-webgl", { alpha: true, premultipliedAlpha: false, stencil: true, powerPreference: "high-performance", failIfMajorPerformanceCaveat: false, preserveDrawingBuffer: false, antialias: false });
const backdropCtx = els.backdropCanvas ? els.backdropCanvas.getContext("2d") : null;
const overlayCtx = els.overlay.getContext("2d");
const stage2dCtx = !gl ? els.glCanvas.getContext("2d") : null;
const AUTOSAVE_STORAGE_KEY = "mesh_deformer_autosave_v1";
const AUTOSAVE_INTERVAL_MS = 15000;
const AUTOSAVE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

if (!backdropCtx || !overlayCtx || (!gl && !stage2dCtx)) {
  throw new Error("2D canvas context unavailable.");
}
if (!gl) {
  console.warn("[runtime] main WebGL context unavailable on startup; running 2D fallback. GPU process may be exhausted -- close other WebGL tabs / try a fresh browser session.");
}

// Cache the WEBGL_lose_context extension so we can attempt to force a
// restore if Edge keeps the context in the lost state for too long
// (e.g. background tab GPU reclamation that never fires the
// webglcontextrestored event on its own).
const _glLoseExt = gl && gl.getExtension ? gl.getExtension("WEBGL_lose_context") : null;
function tryForceRestoreMainGL() {
  if (!gl) return false;
  if (!gl.isContextLost || !gl.isContextLost()) return false;
  if (!_glLoseExt || typeof _glLoseExt.restoreContext !== "function") return false;
  try {
    _glLoseExt.restoreContext();
    console.info("[main-gl] forced restoreContext() on stuck-lost context");
    return true;
  } catch (err) {
    console.warn("[main-gl] forced restoreContext failed", err);
    return false;
  }
}

const hasGL = !!gl;
const isWebGL2 = hasGL && typeof WebGL2RenderingContext !== "undefined" && gl instanceof WebGL2RenderingContext;
const hasVAO = hasGL && typeof gl.createVertexArray === "function";
const TIMELINE_MIN_STEP = 0.1;
const TIMELINE_ZOOM_MIN = 0.5;
const TIMELINE_ZOOM_MAX = 8;
const DOCK_LAYOUT_STORAGE_KEY = "uiLayout:v3";
const DOCK_PANEL_IDS = ["leftTools", "rightTree", "rightProps", "timelineDock"];

// "native" = timeline stays in its original CSS grid row (default state)
const DOCK_VALID_SIDES = ["left", "right", "bottom"];
const DOCK_ALL_SIDES   = ["left", "right", "bottom", "native"];

function getDefaultDockLayout() {
  return {
    version: 3,
    sides: {
      left:   { collapsed: false, expandedWidth: 260 },
      right:  { collapsed: false, expandedWidth: 340 },
      bottom: { collapsed: false, expandedHeight: 280 },
    },
    panels: {
      leftTools:    { side: "left",   order: 0, column: 0, colWidth: null, float: null },
      rightTree:    { side: "right",  order: 0, column: 0, colWidth: null, float: null },
      rightProps:   { side: "right",  order: 1, column: 0, colWidth: null, float: null },
      timelineDock: { side: "native", order: 0, column: 0, colWidth: null, float: null },
    },
  };
}

function normalizeDockLayout(raw) {
  const fallback = getDefaultDockLayout();
  const source = raw && typeof raw === "object" ? raw : null;
  const panelSource = source && source.panels && typeof source.panels === "object" ? source.panels : null;

  function normSide(key, minW, maxW, defaultW, isHeight) {
    const s = source && source.sides && source.sides[key] ? source.sides[key] : null;
    const dim = isHeight ? "expandedHeight" : "expandedWidth";
    const raw2 = s && Number.isFinite(s[dim]) ? s[dim] : defaultW;
    return {
      collapsed: !!(s && s.collapsed),
      [dim]: math.clamp(Math.round(raw2), minW, maxW),
    };
  }

  const normalized = {
    version: 3,
    sides: {
      left:   normSide("left",   150, 800, 260, false),
      right:  normSide("right",  200, 800, 340, false),
      bottom: normSide("bottom", 80,  600, 280, true),
    },
    panels: Object.create(null),
  };

  for (const id of DOCK_PANEL_IDS) {
    const base = fallback.panels[id];
    const entry = panelSource && panelSource[id] ? panelSource[id] : base;
    const floatEntry = entry && entry.float && typeof entry.float === "object" ? entry.float : null;
    const isFloat = !!(floatEntry);
    const rawSide = entry && entry.side;
    const side = (!isFloat && DOCK_ALL_SIDES.includes(rawSide)) ? rawSide : base.side;
    const order = Number.isFinite(entry && entry.order) ? Math.max(0, Math.floor(entry.order)) : base.order;
    const floatNorm = isFloat ? {
      x: Number.isFinite(floatEntry.x) ? Math.round(floatEntry.x) : 100,
      y: Number.isFinite(floatEntry.y) ? Math.round(floatEntry.y) : 100,
      w: Number.isFinite(floatEntry.w) ? math.clamp(Math.round(floatEntry.w), 180, 1200) : 640,
      h: Number.isFinite(floatEntry.h) ? math.clamp(Math.round(floatEntry.h), 120, 900) : 320,
    } : null;
    const column = Number.isFinite(entry && entry.column) ? Math.max(0, Math.floor(entry.column)) : 0;
    const colWidth = Number.isFinite(entry && entry.colWidth) ? math.clamp(Math.round(entry.colWidth), 80, 1200) : null;
    normalized.panels[id] = { side, order, column, colWidth, float: floatNorm };
  }
  return normalized;
}

function setDockPanelFloat(panelId, floatRect) {
  const layout = normalizeDockLayout(state.uiLayout);
  if (!layout.panels[panelId]) return layout;
  layout.panels[panelId].float = floatRect
    ? { x: Math.round(floatRect.x), y: Math.round(floatRect.y), w: Math.round(floatRect.w), h: Math.round(floatRect.h) }
    : null;
  writeDockLayout(layout);
  return layout;
}

function readDockLayout() {
  try {
    const raw = localStorage.getItem(DOCK_LAYOUT_STORAGE_KEY);
    return normalizeDockLayout(raw ? JSON.parse(raw) : null);
  } catch {
    return getDefaultDockLayout();
  }
}

function writeDockLayout(layout) {
  const normalized = normalizeDockLayout(layout);
  state.uiLayout = normalized;
  try {
    localStorage.setItem(DOCK_LAYOUT_STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    // localStorage full or disabled (QuotaExceededError, private mode, etc.)
    // Keep in-memory state anyway so the current session works
  }
  return normalized;
}

function resetDockLayout() {
  const layout = getDefaultDockLayout();
  localStorage.removeItem(DOCK_LAYOUT_STORAGE_KEY);
  // Also clear any legacy storage keys from previous versions
  try { localStorage.removeItem("uiLayout:v1"); } catch { /**/ }
  try { localStorage.removeItem("uiLayout:v2"); } catch { /**/ }
  state.uiLayout = layout;
  // Force-strip any residual float / inline styling from all dock panels
  if (typeof DOCK_PANEL_IDS !== "undefined") {
    for (const id of DOCK_PANEL_IDS) {
      const el = document.getElementById(id);
      if (!el) continue;
      el.classList.remove("dock-panel-floating", "dragging-float", "dragging");
      el.style.position = "";
      el.style.left = "";
      el.style.top = "";
      el.style.width = "";
      el.style.height = "";
      el.style.zIndex = "";
      el.style.order = "";
      el.style.flex = "";
      const rh = el.querySelector(".dock-float-resize-handle");
      if (rh) rh.remove();
    }
  }
  if (typeof applyDockLayout === "function") applyDockLayout(layout);
  return layout;
}

function setDockSideCollapsed(side, collapsed) {
  const layout = normalizeDockLayout(state.uiLayout);
  const key = DOCK_VALID_SIDES.includes(side) ? side : "right";
  layout.sides[key].collapsed = !!collapsed;
  writeDockLayout(layout);
  return layout;
}

function rememberDockSideWidth(side, width) {
  const layout = normalizeDockLayout(state.uiLayout);
  const key = side === "left" ? "left" : "right";
  const next = key === "left"
    ? math.clamp(Math.round(width), 150, 800)
    : math.clamp(Math.round(width), 200, 800);
  layout.sides[key].expandedWidth = next;
  writeDockLayout(layout);
  return layout;
}

function rememberDockBottomHeight(height) {
  const layout = normalizeDockLayout(state.uiLayout);
  layout.sides.bottom.expandedHeight = math.clamp(Math.round(height), 80, 600);
  writeDockLayout(layout);
  return layout;
}

// ============================================================
// SECTION: Application State
// Central state object. All persistent UI and runtime data lives here.
// ============================================================
const state = {
  sourceCanvas: null,
  texture: null,
  imageWidth: 0,
  imageHeight: 0,
  slots: [],
  activeSlot: -1,
  slotViewMode: "all",
  leftToolTab: "setup",
  leftToolTabBySystemMode: {
    setup: "setup",
    animate: "canvas",
  },
  currentSystemMode: "setup",
  workspaceMode: "rig",
  uiPage: "rig",
  animSubPanel: "timeline",
  exportPanelOpen: false,
  uiLayout: getDefaultDockLayout(),
  uiResizing: null,
  mesh: null,
  editMode: "skeleton",
  selectedBone: 0,
  selectedBonesForWeight: [],
  selectedBoneParts: [],
  selectedIK: -1,
  selectedTransform: -1,
  selectedPath: -1,
  selectedPhysics: -1,
  skinSets: [],
  selectedSkinSet: -1,
  activeSkinSetId: null,
  ikPickArmed: false,
  ikHoverBone: -1,
  grabArmed: false,
  grabLive: false,
  boneMode: "edit",
  weightMode: "hard",
  dragTool: "auto",
  parentPickArmed: false,
  parentHoverBone: -1,
  objectHoverRoot: -1,
  objectScaleHoverRoot: -1,
  addBoneArmed: false,
  addBoneDraft: null,
  treeSlotDrag: null,
  treeAttachmentDrag: null,
  treeSlotLastClickIndex: -1,
  treeSlotLastClickTs: 0,
  treeBoneLastClickIndex: -1,
  treeBoneLastClickTs: 0,
  boneTreeOnlyActiveSlot: false,
  boneTreeWorkHideMode: "bone_only",
  boneTreeSelectedUnassignedSlotIds: [],
  boneTreeSelectedSlotByBone: Object.create(null),
  boneTreeSlotCollapse: Object.create(null),
  boneTreeChildCollapse: Object.create(null),
  boneTreeAttachmentCollapse: Object.create(null),
  boneTreeInlineRename: { kind: "", index: -1, attachmentName: "" },
  boneTreeMenuOpen: false,
  boneTreeMenuContextKind: "",
  rightPropsFocus: "slot",
  rigEditPreviewWorld: null,
  rigEditPreviewInvBind: null,
  rigEditNeedsRuntimeNormalize: false,
  rigCoordinateSpace: "runtime",
  anim: {
    duration: 5,
    time: 0,
    playing: false,
    lastTs: 0,
    animations: [],
    currentAnimId: null,
    selectedTrack: "",
    selectedKey: null,
    selectedKeys: [],
    keyClipboard: null,
    timelineContextMenuOpen: false,
    timelineContextTrackId: "",
    timelineContextTime: 0,
    timelineDrag: null,
    timelineMarqueeEl: null,
    timelineScaleHeld: false,
    timelineMinimized: false,
    drawOrderEditorOpen: false,
    dirtyTracks: [],
    trackExpanded: {},
    groupMute: {},
    groupSolo: {},
    onlyKeyed: false,
    filterText: "",
    loop: true,
    snap: false,
    onionSkin: {
      enabled: false,
      prevFrames: 2,
      nextFrames: 2,
      alpha: 0.22,
    },
    autoKey: false,
    autoKeyPending: false,
    fps: 30,
    timeStep: TIMELINE_MIN_STEP,
    timelineZoom: 1,
    mix: {
      active: false,
      fromAnimId: null,
      toAnimId: null,
      duration: 0.2,
      elapsed: 0,
      fromTime: 0,
      toTime: 0,
    },
    curveOpen: false,
    curveDrag: null,
    batchExportOpen: false,
    batchExport: {
      format: "webm",
      fps: 15,
      prefix: "batch",
      retries: 1,
      delayMs: 120,
      zipPng: true,
    },
    resizing: null,
    layerTracks: [],
    selectedLayerTrackId: "",
    stateMachine: {
      enabled: true,
      states: [],
      parameters: [],
      currentStateId: "",
      selectedParamId: "",
      selectedTransitionId: "",
      selectedConditionId: "",
      pendingStateId: "",
      pendingDuration: 0.2,
    },
  },
  history: {
    undo: [],
    redo: [],
    lastSig: "",
    lastCaptureTs: 0,
    suspend: false,
  },
  autosave: {
    ready: false,
    lastSig: "",
    timerId: 0,
    lastErrorAt: 0,
    failing: false,
  },
  diagnostics: {
    issues: [],
    lastRunAt: 0,
  },
  aiCapture: {
    active: false,
    domain: "",
    startedAt: 0,
    endedAt: 0,
    eventSeq: 0,
    events: [],
    marks: [],
    rawEventCount: 0,
    rawDroppedCount: 0,
    lastRawMoveAt: Object.create(null),
    startSnapshot: null,
    lastReportText: "",
  },
  webglSupport: {
    lastCheckedAt: 0,
    summary: "No WebGL support report yet.",
    reportText: "Run the check to inspect browser WebGL support.",
    analysis: {
      verdict: "neutral",
      verdictLabel: "Not checked",
      summary: "No WebGL support report yet.",
      blockers: [],
      warnings: [],
    },
    raw: null,
    open: false,
    lastFocus: null,
  },
  commandPalette: {
    open: false,
    hotkeysOnly: false,
    query: "",
    selectedIndex: 0,
    filtered: [],
    lastFocus: null,
  },
  view: { scale: 1, cx: 0, cy: 0, fitScale: 1, initialized: false, lastW: 0, lastH: 0, panMode: false },
  renderPerf: {
    maxPixelRatio: hasGL ? 1.5 : 2,
    needsResize: true,
    stageCssWidth: 0,
    stageCssHeight: 0,
    stagePixelRatio: 1,
    backdropSig: "",
    // Per-frame timing rolled up over a 60-frame ring buffer so we can
    // report stable averages instead of per-frame jitter. Each phase
    // measured with performance.now() bracketing.
    timing: {
      enabled: true, // cheap; can be turned off via debug.setTimingEnabled(false)
      ringSize: 60,
      ringIdx: 0,
      // Each ring slot stores [deformMs, slotDrawMs, overlayMs, totalMs].
      ring: new Float32Array(60 * 4),
      lastFrame: { deform: 0, slotDraw: 0, overlay: 0, total: 0 },
    },
  },
  renderLoop: {
    rafId: 0,
    requested: false,
  },
  baseImageTransform: {
    enabled: false,
    tx: 0,
    ty: 0,
    rot: 0,
    scale: 1,
  },
  drag: null,
  slotMesh: {
    activePoint: -1,
    activeSet: "contour",
    edgeSelection: [],
    edgeSelectionSet: "contour",
    selectedPoints: { contour: [], fill: [] },
    toolMode: "select",
    editTarget: "boundary",
    toolRestoreTarget: "boundary",
    gridReplaceContour: false,
  },
  pathEdit: {
    drawArmed: false,
    activePoint: -1,
    activeHandle: "",
  },
  vertexDeform: {
    proportional: true,
    mirror: false,
    heatmap: false,
    weightViz: false,
    weightVizMode: "selected",
    weightVizOpacity: 0.75,
    radius: 80,
    falloff: "smooth",
    cursorX: 0,
    cursorY: 0,
    hasCursor: false,
    selectionByKey: {},
    pinnedByKey: {},
  },
  weightBrush: {
    active: false,
    mode: "add",
    size: 80,
    strength: 0.5,
    feather: 0.5,
    lockedBones: [],
  },
  // Spine "Bone compensation": when ON, edit-mode bone drag preserves the
  // world transforms of all descendants so they don't visually move with
  // the parent. OFF (default) keeps the legacy behaviour where children
  // inherit parent motion.
  boneCompensation: false,
  overlayScene: {
    canvas: null,
    ctx: null,
    enabled: false,
  },
  glTextureCache: hasGL ? new WeakMap() : null,
  glTextureHandles: hasGL ? new Set() : null,
  export: {
    spineCompat: "4.2",
    atlas: {
      maxWidth: 2048,
      maxHeight: 2048,
      padding: 2,
      bleed: 0,
      allowRotate: false,
      allowTrim: false,
      allowMultiPage: true,
    },
  },
  poseAutoRig: {
    sourceMode: "auto",
    minScore: 0.2,
    smoothing: true,
    allowFallback: true,
  },
};

// ============================================================
// SECTION: Math Utilities & Left Tool Tab Helpers
// ============================================================
const math = {
  degToRad: (d) => (d * Math.PI) / 180,
  radToDeg: (r) => (r * 180) / Math.PI,
  clamp: (v, lo, hi) => Math.max(lo, Math.min(hi, v)),
};

const LEFT_TOOL_TABS = new Set(["canvas", "setup", "rig", "object", "ik", "constraint", "path", "skin", "tools", "slotmesh"]);

function getCurrentSystemMode() {
  return els.systemMode && els.systemMode.value === "animate" ? "animate" : "setup";
}

function getDefaultLeftToolTab(systemMode = getCurrentSystemMode()) {
  return systemMode === "animate" ? "canvas" : "setup";
}

function normalizeLeftToolTab(tab, systemMode = getCurrentSystemMode()) {
  const value = typeof tab === "string" ? tab : "";
  return LEFT_TOOL_TABS.has(value) ? value : getDefaultLeftToolTab(systemMode);
}

function persistLeftToolTabForSystemMode(systemMode, tab) {
  if (systemMode !== "setup" && systemMode !== "animate") return;
  state.leftToolTabBySystemMode[systemMode] = normalizeLeftToolTab(tab, systemMode);
}

function restoreLeftToolTabForSystemMode(systemMode) {
  const mode = systemMode === "animate" ? "animate" : "setup";
  state.leftToolTab = normalizeLeftToolTab(state.leftToolTabBySystemMode[mode], mode);
  return state.leftToolTab;
}

function setLeftToolTab(tab, systemMode = getCurrentSystemMode()) {
  const next = normalizeLeftToolTab(tab, systemMode);
  state.leftToolTab = next;
  persistLeftToolTabForSystemMode(systemMode, next);
  return next;
}

function normalizeBaseImageTransform(raw) {
  const src = raw && typeof raw === "object" ? raw : {};
  const scaleRaw = Number(src.scale);
  return {
    enabled: src.enabled === true,
    tx: Number(src.tx) || 0,
    ty: Number(src.ty) || 0,
    rot: Number(src.rot) || 0,
    scale: math.clamp(Number.isFinite(scaleRaw) ? scaleRaw : 1, 0.01, 100),
  };
}

function getSlotBaseImageTransform(slot = null) {
  const targetSlot = slot || getActiveSlot();
  if (targetSlot && typeof targetSlot === "object") {
    const tr = normalizeBaseImageTransform(targetSlot.baseImageTransform);
    targetSlot.baseImageTransform = tr;
    return tr;
  }
  const fallback = normalizeBaseImageTransform(state.baseImageTransform);
  state.baseImageTransform = fallback;
  return fallback;
}

function setSlotBaseImageTransform(next, slot = null) {
  const tr = normalizeBaseImageTransform(next);
  const targetSlot = slot || getActiveSlot();
  if (targetSlot && typeof targetSlot === "object") {
    targetSlot.baseImageTransform = tr;
    return tr;
  }
  state.baseImageTransform = tr;
  return tr;
}

function isSlotMeshModeActive() {
  return state.editMode === "mesh";
}

function isSlotMeshEditTabActive() {
  return state.editMode === "mesh" && state.leftToolTab === "slotmesh" && state.uiPage !== "anim";
}

function isBaseImageEditTabActive() {
  return state.editMode === "mesh" && state.leftToolTab === "canvas";
}

function isVertexDeformInteractionActive() {
  return state.editMode === "mesh" && !isBaseImageEditTabActive() && !isSlotMeshEditTabActive();
}

function isBaseImageTransformEditable() {
  return isBaseImageEditTabActive();
}

function getSlotBaseSpaceBoneIndex(slot, m = state.mesh) {
  if (!slot || !m || !Array.isArray(m.rigBones)) return -1;
  const boneCount = m.rigBones.length;
  const mode = getSlotWeightMode(slot);
  const inf = getSlotInfluenceBones(slot, m);
  const pickDominantWeightedBone = () => {
    const sm = slot && (getActiveAttachment(slot) || {}).meshData ? (getActiveAttachment(slot) || {}).meshData : null;
    if (!sm || !sm.weights || !sm.positions) return -1;
    const vCount = Math.floor((Number(sm.positions.length) || 0) / 2);
    if (vCount <= 0) return -1;
    const weights = sm.weights;
    if ((Number(weights.length) || 0) !== vCount * boneCount) return -1;
    const candidateSet = new Set();
    if (Array.isArray(inf) && inf.length > 0) {
      for (const biRaw of inf) {
        const bi = Number(biRaw);
        if (Number.isFinite(bi) && bi >= 0 && bi < boneCount) candidateSet.add(bi);
      }
    }
    if (candidateSet.size <= 0) {
      for (let bi = 0; bi < boneCount; bi += 1) candidateSet.add(bi);
    }
    let best = -1;
    let bestSum = 1e-8;
    for (const bi of candidateSet) {
      let sum = 0;
      for (let vi = 0; vi < vCount; vi += 1) {
        sum += Number(weights[vi * boneCount + bi]) || 0;
      }
      if (sum > bestSum) {
        bestSum = sum;
        best = bi;
      }
    }
    return best;
  };
  if (mode === "weighted") {
    const dominant = pickDominantWeightedBone();
    if (dominant >= 0) return dominant;
    for (const biRaw of inf) {
      const bi = Number(biRaw);
      if (Number.isFinite(bi) && bi >= 0 && bi < boneCount) return bi;
    }
  }
  const direct = Number(slot.bone);
  if (Number.isFinite(direct) && direct >= 0 && direct < boneCount) return direct;
  for (const biRaw of inf) {
    const bi = Number(biRaw);
    if (Number.isFinite(bi) && bi >= 0 && bi < boneCount) return bi;
  }
  return -1;
}

function getSlotTreeBoneIndex(slot, m = state.mesh) {
  if (!slot || !m || !Array.isArray(m.rigBones)) return -1;
  const bi = getSlotBaseSpaceBoneIndex(slot, m);
  return Number.isFinite(bi) && bi >= 0 && bi < m.rigBones.length ? bi : -1;
}

function shouldRenderBaseImageReference() {
  // Base image is the same source used for slot binding, always visible when source exists.
  if (!state.sourceCanvas) return false;
  if (!(Number(state.imageWidth) > 0 && Number(state.imageHeight) > 0)) return false;
  return true;
}

function drawBaseImageReference2D(ctx) {
  if (!ctx || !shouldRenderBaseImageReference()) return false;
  const docW = Math.max(1, Number(state.imageWidth) || Number(state.sourceCanvas && state.sourceCanvas.width) || 1);
  const docH = Math.max(1, Number(state.imageHeight) || Number(state.sourceCanvas && state.sourceCanvas.height) || 1);
  const activeSlot = getActiveSlot();
  const poseWorld = state.mesh ? getSolvedPoseWorld(state.mesh) : null;

  let drawTm = getBaseImageTransformMatrix(activeSlot, poseWorld, docW, docH);
  if (state.mesh && activeSlot) {
    const bi = getSlotBaseSpaceBoneIndex(activeSlot, state.mesh);
    const invBind = getDisplayInvBind(state.mesh);
    if (Number.isFinite(bi) && bi >= 0 && Array.isArray(poseWorld) && poseWorld[bi] && invBind && invBind[bi]) {
      const delta = mul(poseWorld[bi], invBind[bi]);
      drawTm = mul(drawTm, delta);
    }
  }

  const scale = Math.max(1e-6, Number(state.view.scale) || 1);
  const alpha = isBaseImageEditTabActive() ? 1 : state.slots.length > 0 ? 0.35 : 1;

  ctx.save();
  ctx.translate(state.view.cx, state.view.cy);
  ctx.scale(scale, scale);
  ctx.translate(-docW * 0.5, -docH * 0.5);
  ctx.transform(drawTm[0], drawTm[2], drawTm[1], drawTm[3], drawTm[4], drawTm[5]);
  ctx.globalAlpha = alpha;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(state.sourceCanvas, 0, 0, docW, docH);
  ctx.restore();
  return true;
}

function refreshBaseImageTransformUI() {
  const tr = getSlotBaseImageTransform();
  const hasSource = !!state.sourceCanvas && Number(state.imageWidth) > 0 && Number(state.imageHeight) > 0;
  const editable = hasSource && isBaseImageTransformEditable();
  if (els.baseImageTx) {
    els.baseImageTx.value = String(Math.round(tr.tx));
    els.baseImageTx.disabled = !editable;
  }
  if (els.baseImageTy) {
    els.baseImageTy.value = String(Math.round(tr.ty));
    els.baseImageTy.disabled = !editable;
  }
  if (els.baseImageScale) {
    els.baseImageScale.value = String(Number(tr.scale).toFixed(3));
    els.baseImageScale.disabled = !editable;
  }
  if (els.baseImageRot) {
    els.baseImageRot.value = String(Math.round(math.radToDeg(tr.rot)));
    els.baseImageRot.disabled = !editable;
  }
  if (els.baseImageTransformResetBtn) {
    els.baseImageTransformResetBtn.disabled = !editable;
  }
  if (els.baseImageTransformHint) {
    if (!hasSource) {
      els.baseImageTransformHint.textContent = "Import image/PSD first.";
    } else if (!editable) {
      els.baseImageTransformHint.textContent = "Switch to Slot Mesh mode and open Base Transform tab to edit base image transform.";
    } else {
      els.baseImageTransformHint.textContent =
        "Setup-style base transform in owner-bone local space: directly affects bound slot rendering, not keyed in animation timeline.";
    }
  }
}

function applyBaseImageTransformFromInputs() {
  const tr = getSlotBaseImageTransform();
  tr.enabled = true;
  tr.tx = Number(els.baseImageTx && els.baseImageTx.value) || 0;
  tr.ty = Number(els.baseImageTy && els.baseImageTy.value) || 0;
  tr.scale = math.clamp(Number(els.baseImageScale && els.baseImageScale.value) || 1, 0.01, 100);
  tr.rot = math.degToRad(Number(els.baseImageRot && els.baseImageRot.value) || 0);
  setSlotBaseImageTransform(tr);
  refreshBaseImageTransformUI();
}

function syncBaseImageTransformInputs() {
  const tr = getSlotBaseImageTransform();
  if (els.baseImageTx) els.baseImageTx.value = String(Math.round(tr.tx));
  if (els.baseImageTy) els.baseImageTy.value = String(Math.round(tr.ty));
  if (els.baseImageScale) els.baseImageScale.value = String(Number(tr.scale).toFixed(3));
  if (els.baseImageRot) els.baseImageRot.value = String(Math.round(math.radToDeg(tr.rot)));
}

function syncActiveSlotTransformInputs() {
  const s = getActiveSlot();
  if (!s) return;
  if (els.slotTx) els.slotTx.value = String(Math.round(Number(s.tx) || 0));
  if (els.slotTy) els.slotTy.value = String(Math.round(Number(s.ty) || 0));
  if (els.slotRot) els.slotRot.value = String(Math.round(math.radToDeg(Number(s.rot) || 0)));
}

function isVertexWeightVizActive() {
  if (state.editMode !== "mesh") return false;
  if (state.leftToolTab !== "slotmesh") return false;
  return !!state.vertexDeform.weightViz;
}

function isCanvasTransformGizmoAllowed() {
  if (state.uiPage === "anim") return false;
  if (state.editMode === "mesh" && isVertexWeightVizActive()) return false; // Added condition
  if (state.editMode === "skeleton" && state.leftToolTab === "path") return false;
  const baseTab = isBaseImageEditTabActive();
  if (!baseTab && !state.mesh) return false;
  if (!baseTab && (state.ikPickArmed || state.parentPickArmed || state.pathEdit.drawArmed || state.addBoneArmed)) return false;
  return true;
}

function getSlotBoneOriginLocal(slot, poseWorld = null) {
  if (!slot || !state.mesh) return null;
  const bi = getSlotBaseSpaceBoneIndex(slot, state.mesh);
  if (!Number.isFinite(bi) || bi < 0) return null;
  const world = Array.isArray(poseWorld) ? poseWorld : getSolvedPoseWorld(state.mesh);
  if (!Array.isArray(world) || bi >= world.length || !world[bi]) return null;
  const p = transformPoint(world[bi], 0, 0);
  return { x: Number(p.x) || 0, y: Number(p.y) || 0 };
}

function getBaseImagePivotLocal(slot = null, poseWorld = null, docW = null, docH = null) {
  const width = Math.max(1, Number(docW) || Number(state.imageWidth) || Number(state.sourceCanvas && state.sourceCanvas.width) || 1);
  const height = Math.max(1, Number(docH) || Number(state.imageHeight) || Number(state.sourceCanvas && state.sourceCanvas.height) || 1);
  const targetSlot = slot || getActiveSlot();
  const bonePivot = getSlotBoneOriginLocal(targetSlot, poseWorld);
  if (bonePivot) return bonePivot;
  return { x: width * 0.5, y: height * 0.5 };
}

function getBaseImageSpaceWorldMatrix(slot = null, poseWorld = null, docW = null, docH = null) {
  const width = Math.max(1, Number(docW) || Number(state.imageWidth) || Number(state.sourceCanvas && state.sourceCanvas.width) || 1);
  const height = Math.max(1, Number(docH) || Number(state.imageHeight) || Number(state.sourceCanvas && state.sourceCanvas.height) || 1);
  const targetSlot = slot || getActiveSlot();
  const bi = getSlotBaseSpaceBoneIndex(targetSlot, state.mesh);
  const world = Array.isArray(poseWorld) ? poseWorld : state.mesh ? getSolvedPoseWorld(state.mesh) : null;
  if (Array.isArray(world) && Number.isFinite(bi) && bi >= 0 && bi < world.length && world[bi]) {
    return world[bi].slice(0, 6);
  }
  const pivot = getBaseImagePivotLocal(targetSlot, world, width, height);
  return matFromTR(Number(pivot.x) || width * 0.5, Number(pivot.y) || height * 0.5, 0);
}

function getBaseImageLocalTransformMatrix(slot = null) {
  const tr = getSlotBaseImageTransform(slot);
  const scale = Number(tr && tr.scale) || 1;
  const rot = Number(tr && tr.rot) || 0;
  const tx = Number(tr && tr.tx) || 0;
  const ty = Number(tr && tr.ty) || 0;
  if (Math.abs(tx) < 1e-6 && Math.abs(ty) < 1e-6 && Math.abs(rot) < 1e-6 && Math.abs(scale - 1) < 1e-6) {
    return createIdentity();
  }
  const scaleM = [scale, 0, 0, scale, 0, 0];
  return mul(matFromTR(tx, ty, rot), scaleM);
}

function transformBaseImageLocalPoint(x, y, baseMatrix) {
  return transformPoint(baseMatrix, Number(x) || 0, Number(y) || 0);
}

function getBaseImageTransformMatrix(slot = null, poseWorld = null, docW = null, docH = null) {
  if (!state.sourceCanvas) return createIdentity();
  const spaceWorld = getBaseImageSpaceWorldMatrix(slot, poseWorld, docW, docH);
  const local = getBaseImageLocalTransformMatrix(slot);
  return mul(mul(spaceWorld, local), invert(spaceWorld));
}

function worldDeltaToBaseLocal(delta, spaceWorld = null) {
  const dx = Number(delta && delta.x) || 0;
  const dy = Number(delta && delta.y) || 0;
  const space = Array.isArray(spaceWorld) ? spaceWorld : null;
  if (!space) return { x: dx, y: dy };
  const inv = invert(space);
  return {
    x: inv[0] * dx + inv[1] * dy,
    y: inv[2] * dx + inv[3] * dy,
  };
}

function getCanvasTransformGizmos(poseWorld = null) {
  const out = { slot: null, base: null };
  if (!isCanvasTransformGizmoAllowed()) return out;
  if (isBaseImageEditTabActive() && shouldRenderBaseImageReference() && isBaseImageTransformEditable()) {
    const activeSlot = getActiveSlot();
    const docW = Math.max(1, Number(state.imageWidth) || Number(state.sourceCanvas && state.sourceCanvas.width) || 1);
    const docH = Math.max(1, Number(state.imageHeight) || Number(state.sourceCanvas && state.sourceCanvas.height) || 1);
    const pivotBase = getBaseImagePivotLocal(activeSlot, poseWorld, docW, docH);

    let drawTm = getBaseImageTransformMatrix(activeSlot, poseWorld, docW, docH);
    if (state.mesh && activeSlot) {
      const bi = getSlotBaseSpaceBoneIndex(activeSlot, state.mesh);
      const invBind = getDisplayInvBind(state.mesh);
      if (Number.isFinite(bi) && bi >= 0 && Array.isArray(poseWorld) && poseWorld[bi] && invBind && invBind[bi]) {
        const delta = mul(poseWorld[bi], invBind[bi]);
        drawTm = mul(drawTm, delta);
      }
    }

    const pivotLocal = transformPoint(drawTm, Number(pivotBase.x) || 0, Number(pivotBase.y) || 0);
    const pivot = localToScreen(pivotLocal.x, pivotLocal.y);
    const cornersLocal = [
      transformBaseImageLocalPoint(0, 0, drawTm),
      transformBaseImageLocalPoint(docW, 0, drawTm),
      transformBaseImageLocalPoint(docW, docH, drawTm),
      transformBaseImageLocalPoint(0, docH, drawTm),
    ];
    const cornersScreen = cornersLocal.map((p) => localToScreen(p.x, p.y));
    const topMidScreen = {
      x: (cornersScreen[0].x + cornersScreen[1].x) * 0.5,
      y: (cornersScreen[0].y + cornersScreen[1].y) * 0.5,
    };
    const vx = topMidScreen.x - pivot.x;
    const vy = topMidScreen.y - pivot.y;
    const vLen = Math.hypot(vx, vy);
    const ux = vLen > 1e-6 ? vx / vLen : 0;
    const uy = vLen > 1e-6 ? vy / vLen : -1;
    const stemLen = 28;
    const rotateStemEnd = {
      x: topMidScreen.x + ux * stemLen,
      y: topMidScreen.y + uy * stemLen,
    };
    out.base = {
      pivotLocal,
      pivot,
      spaceWorld: getBaseImageSpaceWorldMatrix(activeSlot, poseWorld, docW, docH),
      cornersLocal,
      cornersScreen,
      cornerHandles: cornersScreen.map((p, index) => ({ x: p.x, y: p.y, size: 10, index })),
      rotateStemStart: topMidScreen,
      rotateStemEnd,
      rotateHandle: { x: rotateStemEnd.x, y: rotateStemEnd.y, r: 9 },
    };
  }
  return out;
}

function pickCanvasTransformHandle(mx, my, poseWorld = null) {
  const giz = getCanvasTransformGizmos(poseWorld);
  const local = screenToLocal(mx, my);
  const picks = [];
  const pushCirclePick = (key, handle, meta, priority) => {
    if (!handle) return;
    const dx = Number(handle.x) - mx;
    const dy = Number(handle.y) - my;
    const r = Number(handle.r) || 8;
    const d2 = dx * dx + dy * dy;
    if (d2 > r * r) return;
    picks.push({ key, h: handle, meta, priority, d2 });
  };
  const pushSquarePick = (key, handle, meta, priority) => {
    if (!handle) return;
    const half = Math.max(3, (Number(handle.size) || 10) * 0.5);
    const dx = Math.abs(Number(handle.x) - mx);
    const dy = Math.abs(Number(handle.y) - my);
    if (dx > half || dy > half) return;
    picks.push({ key, h: handle, meta, priority, d2: dx * dx + dy * dy });
  };
  if (giz.base) {
    pushCirclePick("base_rotate", giz.base.rotateHandle, giz.base, 8);
    if (Array.isArray(giz.base.cornerHandles)) {
      for (const c of giz.base.cornerHandles) {
        pushSquarePick("base_scale", c, { ...giz.base, cornerIndex: Number(c.index) || 0 }, 7);
      }
    }
    if (Array.isArray(giz.base.cornersLocal) && giz.base.cornersLocal.length >= 3 && pointInPolygon2D(local, giz.base.cornersLocal)) {
      picks.push({ key: "base_move", h: null, meta: giz.base, priority: 4, d2: 0 });
    }
  }
  let best = null;
  for (const p of picks) {
    if (!best || p.priority > best.priority || (p.priority === best.priority && p.d2 < best.d2)) {
      best = p;
    }
  }
  return best;
}

function drawCanvasTransformGizmos(ctx, poseWorld = null) {
  if (!ctx) return;
  const giz = getCanvasTransformGizmos(poseWorld);
  const drawBase = (g, color) => {
    if (!g || !Array.isArray(g.cornersScreen) || g.cornersScreen.length < 4) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1.8;
    ctx.globalAlpha = 0.96;
    ctx.beginPath();
    ctx.moveTo(g.cornersScreen[0].x, g.cornersScreen[0].y);
    for (let i = 1; i < g.cornersScreen.length; i += 1) {
      ctx.lineTo(g.cornersScreen[i].x, g.cornersScreen[i].y);
    }
    ctx.closePath();
    ctx.stroke();
    if (g.rotateStemStart && g.rotateStemEnd) {
      ctx.beginPath();
      ctx.moveTo(g.rotateStemStart.x, g.rotateStemStart.y);
      ctx.lineTo(g.rotateStemEnd.x, g.rotateStemEnd.y);
      ctx.stroke();
    }
    if (Array.isArray(g.cornerHandles)) {
      for (const h of g.cornerHandles) {
        const size = Number(h.size) || 10;
        const half = size * 0.5;
        ctx.fillStyle = "rgba(24, 31, 39, 0.95)";
        ctx.fillRect(h.x - half, h.y - half, size, size);
        ctx.strokeStyle = color;
        ctx.strokeRect(h.x - half, h.y - half, size, size);
      }
    }
    if (g.rotateHandle) {
      ctx.beginPath();
      ctx.arc(g.rotateHandle.x, g.rotateHandle.y, g.rotateHandle.r || 8, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(24, 31, 39, 0.96)";
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.stroke();
    }
    ctx.fillStyle = color;
    ctx.font = "10px Segoe UI, sans-serif";
    ctx.fillText("BASE", g.cornersScreen[0].x + 8, g.cornersScreen[0].y - 10);
    ctx.restore();
  };
  drawBase(giz.base, "rgba(255, 184, 92, 0.92)");
}

function setStatus(text) {
  els.status.textContent = text;
  if (typeof requestRender === "function") requestRender("status");
  // Mirror to the action log so bug repros include the user-visible
  // status messages in chronological context.
  if (typeof window !== "undefined" && window.debug && typeof window.debug.recordAction === "function") {
    window.debug.recordAction("status", String(text || ""));
  }
}


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
    // Release the probe context immediately. Chromium caps WebGL contexts per
    // page (~16) and force-loses the oldest when new ones are created — leaving
    // probe contexts alive can knock out the main render context.
    try {
      const lose = ctx.getExtension("WEBGL_lose_context");
      if (lose) lose.loseContext();
    } catch { /* ignore */ }
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
  const webgl1 = contexts.find(
    (item) => (item.contextName === "webgl" || item.contextName === "experimental-webgl") && item.ok
  );
  if (webgl1) return "WebGL1 available, WebGL2 unavailable.";
  return "No WebGL context available.";
}

function getPrimaryWebGLSupportContext(report) {
  const contexts = report && Array.isArray(report.contexts) ? report.contexts : [];
  return (
    contexts.find((item) => item.contextName === "webgl2" && item.ok) ||
    contexts.find((item) => (item.contextName === "webgl" || item.contextName === "experimental-webgl") && item.ok) ||
    null
  );
}

function isLikelySoftwareRenderer(entry) {
  if (!entry || !entry.ok) return false;
  const rendererText = [
    entry.unmaskedRenderer,
    entry.unmaskedVendor,
    entry.renderer,
    entry.vendor,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return [
    "swiftshader",
    "llvmpipe",
    "software rasterizer",
    "softpipe",
    "lavapipe",
    "basic render driver",
  ].some((keyword) => rendererText.includes(keyword));
}

function getWebGLSupportExtension(entry, name) {
  return !!(entry && Array.isArray(entry.extensions) && entry.extensions.some((ext) => ext && ext.name === name && ext.supported));
}

function analyzeWebGLSupportReport(report) {
  const contexts = report && Array.isArray(report.contexts) ? report.contexts : [];
  const okContexts = contexts.filter((entry) => entry && entry.ok);
  const best = getPrimaryWebGLSupportContext(report);
  const blockers = [];
  const warnings = [];

  if (!report.bootstrap.hasGL) {
    if (okContexts.length > 0) {
      blockers.push(
        "This browser can create WebGL in the diagnostic probe, but the app did not start with WebGL in this session. The app is currently running on its 2D fallback instead of the WebGL rendering path."
      );
    } else {
      blockers.push(
        "This browser session could not create any WebGL context for the app, so the WebGL rendering path is blocked here."
      );
    }
  }

  if (okContexts.length <= 0) {
    warnings.push(
      "Likely causes: hardware acceleration disabled, GPU/driver blocklist, privacy/security policy, or a remote desktop / virtualization path."
    );
  }

  if (best && best.contextName !== "webgl2") {
    warnings.push("This browser is limited to the older WebGL1 path, so rendering compatibility is lower than a normal WebGL2 session.");
  }

  if (report.bootstrap.hasGL && !report.bootstrap.hasVAO) {
    warnings.push("Vertex array objects are unavailable in this session, so the app falls back to a legacy vertex setup path that may be slower.");
  }

  if (best && isLikelySoftwareRenderer(best)) {
    const rendererName = best.unmaskedRenderer || best.renderer || "software renderer";
    warnings.push(`WebGL is running through ${rendererName}, so interaction and larger scenes may feel noticeably slower.`);
  }

  if (best) {
    const maxTextureSize = Number(best.maxTextureSize);
    if (Number.isFinite(maxTextureSize) && maxTextureSize > 0) {
      if (maxTextureSize < 2048) {
        warnings.push("MAX_TEXTURE_SIZE is below 2048, so larger source images are likely to fail outright or look heavily downscaled.");
      } else if (maxTextureSize < 4096) {
        warnings.push("MAX_TEXTURE_SIZE is below 4096, so larger source images may hit upload limits or reduced quality.");
      }
    }

    const maxTextureImageUnits = Number(best.maxTextureImageUnits);
    if (Number.isFinite(maxTextureImageUnits) && maxTextureImageUnits > 0 && maxTextureImageUnits < 8) {
      warnings.push("MAX_TEXTURE_IMAGE_UNITS is low, which suggests a weaker GPU path with less headroom for heavier rendering workloads.");
    }

    if (best.contextName !== "webgl2" && !getWebGLSupportExtension(best, "OES_vertex_array_object")) {
      warnings.push("WebGL1 is available without OES_vertex_array_object, so this browser is on an older compatibility path that may perform worse.");
    }

    const hasMaskedDetails = !!(best.renderer || best.vendor);
    const hasUnmaskedDetails = !!(best.unmaskedRenderer || best.unmaskedVendor);
    if (!hasMaskedDetails && !hasUnmaskedDetails) {
      warnings.push("Renderer and vendor details are hidden, so driver-specific root causes will be harder to identify in this browser.");
    }
  }

  const verdict = blockers.length > 0 ? "blocked" : warnings.length > 0 ? "degraded" : "supported";
  const verdictLabel = verdict === "blocked" ? "Blocked" : verdict === "degraded" ? "Degraded" : "Supported";
  let summary = "";
  if (verdict === "blocked") {
    summary = blockers[0];
  } else if (verdict === "degraded") {
    summary = warnings[0];
  } else if (report.bootstrap.isWebGL2) {
    summary = "This browser is running the app on its normal WebGL2 path with no obvious blocker detected.";
  } else if (report.bootstrap.hasGL) {
    summary = "This browser is running the app on a compatible WebGL path with no obvious blocker detected.";
  } else {
    summary = summarizeWebGLSupport(report);
  }

  return {
    verdict,
    verdictLabel,
    summary,
    blockers,
    warnings,
  };
}

function formatWebGLSupportReport(report, analysis = analyzeWebGLSupportReport(report)) {
  const lines = [
    `Checked: ${report.checkedAt}`,
    `User agent: ${report.userAgent}`,
    `Platform: ${report.platform}`,
    `Bootstrap: hasGL=${report.bootstrap.hasGL}, isWebGL2=${report.bootstrap.isWebGL2}, hasVAO=${report.bootstrap.hasVAO}`,
    "",
    `Verdict: ${analysis.verdictLabel}`,
    `Summary: ${analysis.summary}`,
    "",
  ];
  if (analysis.blockers.length > 0) {
    lines.push("Critical blockers:");
    for (const item of analysis.blockers) lines.push(`  - ${item}`);
    lines.push("");
  }
  if (analysis.warnings.length > 0) {
    lines.push("Warnings / degraded experience:");
    for (const item of analysis.warnings) lines.push(`  - ${item}`);
    lines.push("");
  }
  lines.push("Raw capability report:");
  lines.push("");
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
  lines.push(`Conclusion: ${summarizeWebGLSupport(report)}`);
  return lines.join("\n");
}

function renderWebGLSupportFindings(listEl, items, emptyText) {
  if (!listEl) return;
  listEl.innerHTML = "";
  listEl.classList.toggle("muted", !items || items.length <= 0);
  const sourceItems = Array.isArray(items) && items.length > 0 ? items : [emptyText];
  for (const item of sourceItems) {
    const li = document.createElement("li");
    li.textContent = item;
    listEl.appendChild(li);
  }
}

function refreshWebGLSupportUI() {
  const analysis = state.webglSupport.analysis || {
    verdict: "neutral",
    verdictLabel: "Not checked",
    summary: "No WebGL support report yet.",
    blockers: [],
    warnings: [],
  };
  if (els.webglSupportVerdict) {
    els.webglSupportVerdict.textContent = analysis.verdictLabel || "Not checked";
    els.webglSupportVerdict.className = `webgl-support-verdict webgl-support-verdict-${analysis.verdict || "neutral"}`;
  }
  if (els.webglSupportSummary) {
    els.webglSupportSummary.textContent = analysis.summary || state.webglSupport.summary || "No WebGL support report yet.";
  }
  renderWebGLSupportFindings(
    els.webglSupportBlockers,
    analysis.blockers,
    "No critical blocker is highlighted for this browser session."
  );
  renderWebGLSupportFindings(
    els.webglSupportWarnings,
    analysis.warnings,
    "No obvious degraded-experience warning is highlighted for this browser session."
  );
  if (els.webglSupportReport) {
    els.webglSupportReport.textContent =
      state.webglSupport.reportText || "Run the check to inspect browser WebGL support.";
    els.webglSupportReport.classList.toggle("muted", !state.webglSupport.raw);
  }
  if (els.webglSupportCopyBtn) {
    els.webglSupportCopyBtn.disabled = !state.webglSupport.raw;
  }
}

function runWebGLSupportCheck() {
  try {
    const report = collectWebGLSupportReport();
    const analysis = analyzeWebGLSupportReport(report);
    state.webglSupport.lastCheckedAt = Date.now();
    state.webglSupport.summary = analysis.summary;
    state.webglSupport.analysis = analysis;
    state.webglSupport.reportText = formatWebGLSupportReport(report, analysis);
    state.webglSupport.raw = report;
    refreshWebGLSupportUI();
    setStatus(`WebGL support checked. ${analysis.verdictLabel}. ${analysis.summary}`);
    return report;
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    console.warn("WebGL support check failed.", err);
    state.webglSupport.lastCheckedAt = Date.now();
    state.webglSupport.summary = "WebGL support check failed.";
    state.webglSupport.analysis = {
      verdict: "blocked",
      verdictLabel: "Blocked",
      summary: "WebGL support check failed before the browser capabilities could be analyzed.",
      blockers: [`Diagnostic failure: ${message}`],
      warnings: [],
    };
    state.webglSupport.reportText = `Failed to inspect WebGL support.\nError: ${message}`;
    state.webglSupport.raw = null;
    refreshWebGLSupportUI();
    setStatus("WebGL support check failed. See report for details.");
    return null;
  }
}

async function copyWebGLSupportReport() {
  if (!state.webglSupport.raw || !state.webglSupport.reportText) {
    setStatus("Run the WebGL support check first.");
    return false;
  }
  if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
    setStatus("Clipboard API unavailable in this browser.");
    return false;
  }
  try {
    await navigator.clipboard.writeText(state.webglSupport.reportText);
    setStatus("WebGL support report copied.");
    return true;
  } catch (err) {
    console.warn("WebGL support report copy failed.", err);
    setStatus("WebGL support report copy failed.");
    return false;
  }
}

function openWebGLSupportDialog(runCheck = false) {
  if (!els.webglSupportDialogWrap) return;
  if (!state.webglSupport.open) {
    state.webglSupport.lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  }
  state.webglSupport.open = true;
  refreshWebGLSupportUI();
  els.webglSupportDialogWrap.classList.remove("collapsed");
  els.webglSupportDialogWrap.setAttribute("aria-hidden", "false");
  if (runCheck) {
    runWebGLSupportCheck();
  } else if (els.webglSupportCheckBtn && typeof els.webglSupportCheckBtn.focus === "function") {
    els.webglSupportCheckBtn.focus();
  }
}

function closeWebGLSupportDialog() {
  if (!state.webglSupport.open || !els.webglSupportDialogWrap) return;
  state.webglSupport.open = false;
  els.webglSupportDialogWrap.classList.add("collapsed");
  els.webglSupportDialogWrap.setAttribute("aria-hidden", "true");
  const prevFocus = state.webglSupport.lastFocus;
  state.webglSupport.lastFocus = null;
  if (prevFocus && typeof prevFocus.focus === "function") prevFocus.focus();
}

function getRenderLoopState() {
  return state.renderLoop || (state.renderLoop = { rafId: 0, requested: false });
}

function requestRender(reason = "") {
  const loop = getRenderLoopState();
  loop.requested = true;
  if (loop.rafId) return;
  if (typeof render !== "function") return;
  loop.rafId = requestAnimationFrame(render);
}

function triggerButtonAction(btn) {
  if (!btn || btn.disabled) return;
  btn.click();
}

function setSelectValueAndTrigger(selectEl, value) {
  if (!selectEl) return;
  selectEl.value = String(value);
  selectEl.dispatchEvent(new Event("change", { bubbles: true }));
}

function buildCommandPaletteItems() {
  return [
    { id: "file.new", label: "File: New Project", group: "File", hotkey: "", action: () => triggerButtonAction(els.fileNewBtn) },
    { id: "file.open", label: "File: Import Image/PSD", group: "File", hotkey: "", action: () => triggerButtonAction(els.fileOpenBtn) },
    { id: "file.save", label: "File: Save Project JSON", group: "File", hotkey: "", action: () => triggerButtonAction(els.fileSaveBtn) },
    { id: "file.load", label: "File: Load Project JSON", group: "File", hotkey: "", action: () => triggerButtonAction(els.fileLoadBtn) },
    { id: "file.export", label: "File: Export Spine Bundle", group: "File", hotkey: "", action: () => triggerButtonAction(els.fileExportSpineBtn) },
    { id: "edit.undo", label: "Edit: Undo", group: "Edit", hotkey: "Ctrl/Cmd+Z", action: async () => undoAction() },
    { id: "edit.redo", label: "Edit: Redo", group: "Edit", hotkey: "Ctrl/Cmd+Y", action: async () => redoAction() },
    { id: "mode.skeleton", label: "Mode: Skeleton", group: "Mode", hotkey: "", action: () => setSelectValueAndTrigger(els.editMode, "skeleton") },
    {
      id: "mode.mesh.canvas",
      label: "Mode: Mesh (Base Transform)",
      group: "Mode",
      hotkey: "",
      action: () => {
        setSelectValueAndTrigger(els.editMode, "mesh");
        setLeftToolTab("canvas");
        updateWorkspaceUI();
      },
    },
    { id: "mode.mesh", label: "Mode: Mesh", group: "Mode", hotkey: "", action: () => setSelectValueAndTrigger(els.editMode, "mesh") },
    { id: "mode.rig", label: "Bone Mode: Edit Rig", group: "Mode", hotkey: "", action: () => { const prevMode = state.boneMode; state.boneMode = "edit"; applyBoneModeTransition(prevMode, state.boneMode); if (els.systemMode) els.systemMode.value = "setup"; updateWorkspaceUI(); updateBoneUI(); } },
    { id: "mode.object", label: "Bone Mode: Object", group: "Mode", hotkey: "", action: () => { if (els.editMode) setSelectValueAndTrigger(els.editMode, "object"); else { const prevMode = state.boneMode; state.editMode = "object"; state.boneMode = "object"; applyBoneModeTransition(prevMode, state.boneMode); updateWorkspaceUI(); updateBoneUI(); } } },
    { id: "mode.pose", label: "Bone Mode: Pose Animate", group: "Mode", hotkey: "", action: () => { const prevMode = state.boneMode; state.boneMode = "pose"; applyBoneModeTransition(prevMode, state.boneMode); if (els.systemMode) els.systemMode.value = "animate"; if (state.mesh) { syncPoseFromRig(state.mesh); samplePoseAtTime(state.mesh, state.anim.time); } updateWorkspaceUI(); updateBoneUI(); } },
    { id: "view.fit", label: "View: Fit (100%)", group: "View", hotkey: "0", action: () => resetViewToFit() },
    {
      id: "view.zoom.in",
      label: "View: Zoom In",
      group: "View",
      hotkey: "+",
      action: () => {
        const sx = Math.max(1, Number(els.overlay.width) || 1) * 0.5;
        const sy = Math.max(1, Number(els.overlay.height) || 1) * 0.5;
        zoomViewBy(1.12, sx, sy);
      },
    },
    {
      id: "view.zoom.out",
      label: "View: Zoom Out",
      group: "View",
      hotkey: "-",
      action: () => {
        const sx = Math.max(1, Number(els.overlay.width) || 1) * 0.5;
        const sy = Math.max(1, Number(els.overlay.height) || 1) * 0.5;
        zoomViewBy(1 / 1.12, sx, sy);
      },
    },
    { id: "play.play", label: "Playback: Play", group: "Timeline", hotkey: "Space", action: () => triggerButtonAction(els.playBtn) },
    { id: "play.stop", label: "Playback: Stop", group: "Timeline", hotkey: "", action: () => triggerButtonAction(els.stopBtn) },
    { id: "key.add", label: "Key: Add/Update Key", group: "Timeline", hotkey: "I", action: () => triggerButtonAction(els.addKeyBtn) },
    { id: "key.delete", label: "Key: Delete Selected", group: "Timeline", hotkey: "Delete / K", action: () => triggerButtonAction(els.deleteKeyBtn) },
    { id: "key.cut", label: "Key: Cut", group: "Timeline", hotkey: "Ctrl/Cmd+X", action: () => triggerButtonAction(els.cutKeyBtn) },
    { id: "key.copy", label: "Key: Copy", group: "Timeline", hotkey: "Ctrl/Cmd+C", action: () => triggerButtonAction(els.copyKeyBtn) },
    { id: "key.paste", label: "Key: Paste", group: "Timeline", hotkey: "Ctrl/Cmd+V", action: () => triggerButtonAction(els.pasteKeyBtn) },
    {
      id: "onion.toggle",
      label: `Onion Skin: ${ensureOnionSkinSettings().enabled ? "Disable" : "Enable"}`,
      group: "Timeline",
      hotkey: "",
      action: () => {
        if (!els.onionEnabled) return;
        els.onionEnabled.checked = !els.onionEnabled.checked;
        els.onionEnabled.dispatchEvent(new Event("change", { bubbles: true }));
      },
    },
    { id: "batch.toggle", label: "Batch Export: Toggle Panel", group: "Timeline", hotkey: "", action: () => triggerButtonAction(els.batchExportToggleBtn) },
    { id: "diag.run", label: "Diagnostics: Run", group: "Diagnostics", hotkey: "", action: () => triggerButtonAction(els.diagnosticsRunBtn) },
    { id: "diag.fix", label: "Diagnostics: Auto Fix (Safe)", group: "Diagnostics", hotkey: "", action: () => triggerButtonAction(els.diagnosticsAutoFixBtn) },
    { id: "diag.clear", label: "Diagnostics: Clear", group: "Diagnostics", hotkey: "", action: () => triggerButtonAction(els.diagnosticsClearBtn) },
    { id: "help.hotkeys", label: "Help: Hotkeys Only View", group: "Help", hotkey: "?", action: () => openCommandPalette(true) },
  ];
}

function getFilteredCommandPaletteItems() {
  const cfg = state.commandPalette || {};
  const q = String(cfg.query || "").trim().toLowerCase();
  const hotkeysOnly = !!cfg.hotkeysOnly;
  const items = buildCommandPaletteItems().map((item) => ({
    ...item,
    _search: `${item.label} ${item.group} ${item.hotkey || ""} ${item.id}`.toLowerCase(),
  }));
  return items.filter((item) => {
    if (hotkeysOnly && !item.hotkey) return false;
    if (!q) return true;
    return item._search.includes(q);
  });
}

function ensureCommandPaletteSelectionVisible() {
  if (!els.commandPaletteList) return;
  const i = state.commandPalette.selectedIndex | 0;
  const row = els.commandPaletteList.querySelector(`.command-item[data-cp-index="${i}"]`);
  if (row && typeof row.scrollIntoView === "function") row.scrollIntoView({ block: "nearest" });
}

function renderCommandPalette() {
  if (!els.commandPaletteList) return;
  const items = getFilteredCommandPaletteItems();
  state.commandPalette.filtered = items;
  if (!Number.isFinite(state.commandPalette.selectedIndex)) state.commandPalette.selectedIndex = 0;
  if (items.length <= 0) state.commandPalette.selectedIndex = 0;
  else state.commandPalette.selectedIndex = math.clamp(state.commandPalette.selectedIndex | 0, 0, items.length - 1);
  if (els.commandPaletteMode) els.commandPaletteMode.textContent = state.commandPalette.hotkeysOnly ? "Hotkeys Only" : "All Commands";
  if (els.commandPaletteHint) {
    els.commandPaletteHint.textContent = state.commandPalette.hotkeysOnly
      ? "Showing commands with hotkeys. Enter run, Esc close."
      : "Enter run, Esc close, ? hotkeys only.";
  }
  els.commandPaletteList.innerHTML = "";
  if (items.length <= 0) {
    const empty = document.createElement("div");
    empty.className = "muted";
    empty.style.padding = "10px";
    empty.textContent = "No commands match.";
    els.commandPaletteList.appendChild(empty);
    return;
  }
  const frag = document.createDocumentFragment();
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    const row = document.createElement("button");
    row.type = "button";
    row.className = `command-item${i === state.commandPalette.selectedIndex ? " active" : ""}`;
    row.dataset.cpIndex = String(i);
    const left = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = item.label;
    left.appendChild(title);
    const sub = document.createElement("small");
    sub.textContent = item.group;
    left.appendChild(sub);
    row.appendChild(left);
    const hot = document.createElement("kbd");
    hot.textContent = item.hotkey || "-";
    row.appendChild(hot);
    row.addEventListener("mouseenter", () => {
      state.commandPalette.selectedIndex = i;
      renderCommandPalette();
    });
    row.addEventListener("click", async () => {
      state.commandPalette.selectedIndex = i;
      await runCommandPaletteSelected();
    });
    frag.appendChild(row);
  }
  els.commandPaletteList.appendChild(frag);
  ensureCommandPaletteSelectionVisible();
}

function openCommandPalette(hotkeysOnly = false) {
  if (!els.commandPaletteWrap) return;
  if (!state.commandPalette.open) {
    state.commandPalette.lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  }
  state.commandPalette.open = true;
  state.commandPalette.hotkeysOnly = !!hotkeysOnly;
  state.commandPalette.query = "";
  state.commandPalette.selectedIndex = 0;
  els.commandPaletteWrap.classList.remove("collapsed");
  els.commandPaletteWrap.setAttribute("aria-hidden", "false");
  if (els.commandPaletteInput) els.commandPaletteInput.value = "";
  renderCommandPalette();
  if (els.commandPaletteInput && typeof els.commandPaletteInput.focus === "function") els.commandPaletteInput.focus();
}

function closeCommandPalette() {
  if (!state.commandPalette.open || !els.commandPaletteWrap) return;
  state.commandPalette.open = false;
  state.commandPalette.hotkeysOnly = false;
  state.commandPalette.query = "";
  state.commandPalette.filtered = [];
  els.commandPaletteWrap.classList.add("collapsed");
  els.commandPaletteWrap.setAttribute("aria-hidden", "true");
  const prevFocus = state.commandPalette.lastFocus;
  state.commandPalette.lastFocus = null;
  if (prevFocus && typeof prevFocus.focus === "function") prevFocus.focus();
}

async function runCommandPaletteSelected() {
  const items = Array.isArray(state.commandPalette.filtered) ? state.commandPalette.filtered : [];
  const i = state.commandPalette.selectedIndex | 0;
  if (i < 0 || i >= items.length) return;
  const item = items[i];
  closeCommandPalette();
  try {
    const ret = item && typeof item.action === "function" ? item.action() : null;
    if (ret && typeof ret.then === "function") await ret;
    if (item && item.label) setStatus(`Command: ${item.label}`);
  } catch (err) {
    console.warn(err);
    setStatus("Command failed. Check console.");
  }
}

function sanitizeVertexFalloff(v) {
  const s = String(v || "").toLowerCase();
  return s === "linear" || s === "sharp" ? s : "smooth";
}

function sanitizeWeightVizMode(v) {
  const s = String(v || "").toLowerCase();
  return s === "dominant" ? "dominant" : "selected";
}

function sanitizePoseAutoRigSourceMode(v) {
  const s = String(v || "").toLowerCase();
  if (s === "project") return "project";
  if (s === "active_slot") return "active_slot";
  return "auto";
}

function sanitizePoseAutoRigMinScore(v) {
  const n = Number(v);
  return math.clamp(Number.isFinite(n) ? n : 0.2, 0.05, 0.95);
}

function syncPoseAutoRigOptionsToUI() {
  if (els.setupHumanoidSourceMode) {
    els.setupHumanoidSourceMode.value = sanitizePoseAutoRigSourceMode(state.poseAutoRig && state.poseAutoRig.sourceMode);
  }
  if (els.setupHumanoidMinScore) {
    const ms = sanitizePoseAutoRigMinScore(state.poseAutoRig && state.poseAutoRig.minScore);
    els.setupHumanoidMinScore.value = ms.toFixed(2);
  }
  if (els.setupHumanoidSmoothing) {
    els.setupHumanoidSmoothing.checked = state.poseAutoRig ? state.poseAutoRig.smoothing !== false : true;
  }
  if (els.setupHumanoidFallback) {
    els.setupHumanoidFallback.checked = state.poseAutoRig ? state.poseAutoRig.allowFallback !== false : true;
  }
}

function readPoseAutoRigOptionsFromUI() {
  const curr = state.poseAutoRig && typeof state.poseAutoRig === "object" ? state.poseAutoRig : {};
  const next = {
    sourceMode: sanitizePoseAutoRigSourceMode(els.setupHumanoidSourceMode ? els.setupHumanoidSourceMode.value : curr.sourceMode),
    minScore: sanitizePoseAutoRigMinScore(els.setupHumanoidMinScore ? els.setupHumanoidMinScore.value : curr.minScore),
    smoothing: els.setupHumanoidSmoothing ? !!els.setupHumanoidSmoothing.checked : curr.smoothing !== false,
    allowFallback: els.setupHumanoidFallback ? !!els.setupHumanoidFallback.checked : curr.allowFallback !== false,
  };
  state.poseAutoRig = next;
  syncPoseAutoRigOptionsToUI();
  return { ...next };
}

function bindPoseAutoRigOptionListeners() {
  if (els.setupHumanoidSourceMode && els.setupHumanoidSourceMode.dataset.poseAutoRigBound !== "1") {
    els.setupHumanoidSourceMode.dataset.poseAutoRigBound = "1";
    els.setupHumanoidSourceMode.addEventListener("change", () => {
      readPoseAutoRigOptionsFromUI();
    });
  }
  if (els.setupHumanoidMinScore && els.setupHumanoidMinScore.dataset.poseAutoRigBound !== "1") {
    els.setupHumanoidMinScore.dataset.poseAutoRigBound = "1";
    els.setupHumanoidMinScore.addEventListener("input", () => {
      readPoseAutoRigOptionsFromUI();
    });
    els.setupHumanoidMinScore.addEventListener("change", () => {
      readPoseAutoRigOptionsFromUI();
    });
  }
  if (els.setupHumanoidSmoothing && els.setupHumanoidSmoothing.dataset.poseAutoRigBound !== "1") {
    els.setupHumanoidSmoothing.dataset.poseAutoRigBound = "1";
    els.setupHumanoidSmoothing.addEventListener("change", () => {
      readPoseAutoRigOptionsFromUI();
    });
  }
  if (els.setupHumanoidFallback && els.setupHumanoidFallback.dataset.poseAutoRigBound !== "1") {
    els.setupHumanoidFallback.dataset.poseAutoRigBound = "1";
    els.setupHumanoidFallback.addEventListener("change", () => {
      readPoseAutoRigOptionsFromUI();
    });
  }
}

function setupApplicationMenuBar() {
  const bar = document.getElementById("appMenuBar");
  if (!bar) return;
  const triggers = [...bar.querySelectorAll("[data-menu-trigger]")];
  const panels = [...bar.querySelectorAll("[data-menu-panel]")];
  let openKey = "";
  const setOpen = (key = "") => {
    openKey = String(key || "");
    for (const t of triggers) {
      const k = String(t.getAttribute("data-menu-trigger") || "");
      const active = !!openKey && k === openKey;
      t.classList.toggle("active", active);
      t.setAttribute("aria-expanded", active ? "true" : "false");
    }
    for (const p of panels) {
      const k = String(p.getAttribute("data-menu-panel") || "");
      p.classList.toggle("open", !!openKey && k === openKey);
    }
  };
  const runAction = (action) => {
    const click = (el) => {
      if (el && !el.disabled) el.click();
    };
    switch (String(action || "")) {
      case "file.new":
        click(els.fileNewBtn);
        return;
      case "file.import":
        click(els.fileOpenBtn);
        return;
      case "file.save":
        click(els.fileSaveBtn);
        return;
      case "file.load":
        click(els.fileLoadBtn);
        return;
      case "file.export":
        click(els.fileExportSpineBtn);
        return;
      case "edit.undo":
        click(els.undoBtn);
        return;
      case "edit.redo":
        click(els.redoBtn);
        return;
      case "edit.palette":
        click(els.commandPaletteBtn);
        return;
      case "view.zoomin":
        click(els.viewZoomInBtn);
        return;
      case "view.zoomout":
        click(els.viewZoomOutBtn);
        return;
      case "view.zoomreset":
        click(els.viewZoomResetBtn);
        return;
      case "view.resetlayout":
        resetDockLayout();
        setStatus("Layout reset.");
        return;
      case "tools.resetpose":
        click(els.resetPoseBtn);
        return;
      case "tools.resetvertex":
        click(els.resetVertexBtn);
        return;
      case "tools.webglsupport":
        openWebGLSupportDialog(true);
        return;
      case "help.quick":
        setStatus("Quick Help: File/Edit/View/Tools menus are available from the top menu bar.");
        return;
      default:
        return;
    }
  };
  for (const t of triggers) {
    t.addEventListener("click", (ev) => {
      ev.preventDefault();
      const key = String(t.getAttribute("data-menu-trigger") || "");
      if (!key) return;
      setOpen(openKey === key ? "" : key);
    });
    t.addEventListener("mouseenter", () => {
      const key = String(t.getAttribute("data-menu-trigger") || "");
      if (!openKey || !key) return;
      if (openKey !== key) setOpen(key);
    });
  }
  bar.addEventListener("click", (ev) => {
    const item = ev.target instanceof Element ? ev.target.closest("[data-menu-action]") : null;
    if (!item) return;
    ev.preventDefault();
    const action = String(item.getAttribute("data-menu-action") || "");
    if (!action) return;
    setOpen("");
    runAction(action);
  });
  document.addEventListener("pointerdown", (ev) => {
    const target = ev.target;
    if (!(target instanceof Element)) {
      setOpen("");
      return;
    }
    if (target.closest("#appMenuBar")) return;
    setOpen("");
  });
  window.addEventListener("blur", () => {
    setOpen("");
  });
  window.addEventListener("keydown", (ev) => {
    if (String(ev.key || "").toLowerCase() === "escape") {
      if (openKey) setOpen("");
      if (state.webglSupport && state.webglSupport.open) closeWebGLSupportDialog();
    }
  });
}

function getVertexFalloffWeight(normDist, mode = state.vertexDeform.falloff) {
  const t = math.clamp(Number(normDist) || 0, 0, 1);
  const k = sanitizeVertexFalloff(mode);
  if (k === "linear") return 1 - t;
  if (k === "sharp") return (1 - t) * (1 - t);
  // Smoothstep-like falloff (Blender proportional-like smooth response).
  return 1 - (3 * t * t - 2 * t * t * t);
}

function refreshVertexDeformUI() {
  if (els.vertexProportionalToggle) els.vertexProportionalToggle.checked = !!state.vertexDeform.proportional;
  if (els.vertexMirrorToggle) els.vertexMirrorToggle.checked = !!state.vertexDeform.mirror;
  if (els.vertexHeatmapToggle) els.vertexHeatmapToggle.checked = !!state.vertexDeform.heatmap;
  if (els.vertexWeightVizToggle) els.vertexWeightVizToggle.checked = !!state.vertexDeform.weightViz;
  if (els.vertexWeightVizMode) els.vertexWeightVizMode.value = sanitizeWeightVizMode(state.vertexDeform.weightVizMode);
  if (els.vertexWeightVizOpacity) els.vertexWeightVizOpacity.value = String((Number(state.vertexDeform.weightVizOpacity) || 0.75).toFixed(2));
  if (els.vertexProportionalRadius) els.vertexProportionalRadius.value = String(Math.round(state.vertexDeform.radius));
  if (els.vertexProportionalFalloff) els.vertexProportionalFalloff.value = sanitizeVertexFalloff(state.vertexDeform.falloff);
  if (els.vertexWeightVizMode) els.vertexWeightVizMode.disabled = !state.vertexDeform.weightViz;
  if (els.vertexWeightVizOpacity) els.vertexWeightVizOpacity.disabled = !state.vertexDeform.weightViz;
  if (els.vertexDeformTools) {
    const show = state.editMode === "mesh" && (state.uiPage === "rig" || state.uiPage === "anim");
    els.vertexDeformTools.style.display = show ? "" : "none";
  }
  if (typeof refreshWeightOverlayQuickBtn === "function") refreshWeightOverlayQuickBtn();
}

function gatherVertexDragInfluences(anchorIndex, mx, my) {
  const m = state.mesh;
  if (!m) return [];
  const idx = Number(anchorIndex);
  if (!Number.isFinite(idx) || idx < 0) return [];
  const proportional = !!state.vertexDeform.proportional;
  const radius = Math.max(4, Number(state.vertexDeform.radius) || 80);
  const r2 = radius * radius;
  if (!proportional) return [{ index: idx, weight: 1 }];

  let screen = null;
  if (state.slots.length > 0) {
    const slot = getActiveSlot();
    if (!slot) return [{ index: idx, weight: 1 }];
    const poseWorld = getSolvedPoseWorld(m);
    const geom = buildSlotGeometry(slot, poseWorld);
    screen = geom.screen || ((getActiveAttachment(slot) || {}).meshData && (getActiveAttachment(slot) || {}).meshData.deformedScreen) || null;
  } else {
    screen = m.deformedScreen || null;
  }
  if (!screen || screen.length < 2) return [{ index: idx, weight: 1 }];

  const out = [];
  for (let i = 0; i < screen.length / 2; i += 1) {
    const dx = screen[i * 2] - mx;
    const dy = screen[i * 2 + 1] - my;
    const d2 = dx * dx + dy * dy;
    if (d2 > r2) continue;
    const w = getVertexFalloffWeight(Math.sqrt(d2) / radius);
    if (w <= 1e-4) continue;
    out.push({ index: i, weight: w });
  }
  if (!out.some((it) => it.index === idx)) out.push({ index: idx, weight: 1 });
  return out;
}

function getActiveVertexSelectionKey() {
  if (state.slots.length > 0 && Number.isFinite(state.activeSlot) && state.activeSlot >= 0) {
    const slot = getActiveSlot();
    const slotId = slot && slot.id != null ? String(slot.id) : String(Number(state.activeSlot));
    const attName = slot ? String(getSlotCurrentAttachmentName(slot) || "__none__") : "__none__";
    return `slot:${slotId}:attachment:${attName}`;
  }
  return "mesh";
}

function getActiveVertexContext(m = state.mesh) {
  if (!m) return { screen: null, indices: null, vCount: 0 };
  if (state.slots.length > 0) {
    const slot = getActiveSlot();
    if (!slot) return { screen: m.deformedScreen || null, indices: m.indices || null, vCount: (m.deformedScreen || []).length / 2 };
    ensureSlotMeshData(slot, m);
    const poseWorld = getSolvedPoseWorld(m);
    const geom = buildSlotGeometry(slot, poseWorld);
    const screen = geom.screen || ((getActiveAttachment(slot) || {}).meshData && (getActiveAttachment(slot) || {}).meshData.deformedScreen) || m.deformedScreen || null;
    const indices = ((getActiveAttachment(slot) || {}).meshData && (getActiveAttachment(slot) || {}).meshData.indices) || m.indices || null;
    return { screen, indices, vCount: screen ? Math.floor(screen.length / 2) : 0 };
  }
  const screen = m.deformedScreen || null;
  return { screen, indices: m.indices || null, vCount: screen ? Math.floor(screen.length / 2) : 0 };
}

function getActiveVertexBasePositions(m = state.mesh) {
  if (!m) return null;
  if (state.slots.length > 0) {
    const slot = getActiveSlot();
    if (!slot || !(getActiveAttachment(slot) || {}).meshData || !(getActiveAttachment(slot) || {}).meshData.positions) return null;
    return (getActiveAttachment(slot) || {}).meshData.positions;
  }
  return m.positions || null;
}

function getMirrorAxisX() {
  return (Number(state.imageWidth) || 0) * 0.5;
}

function buildMirrorIndexMap(vCount = null) {
  const positions = getActiveVertexBasePositions(state.mesh);
  if (!positions) return new Map();
  const count = Number.isFinite(vCount) ? Number(vCount) : Math.floor(positions.length / 2);
  if (count <= 0) return new Map();
  const axisX = getMirrorAxisX();
  const map = new Map();
  for (let i = 0; i < count; i += 1) {
    const x = Number(positions[i * 2]) || 0;
    const y = Number(positions[i * 2 + 1]) || 0;
    const tx = axisX * 2 - x;
    let best = -1;
    let bestD2 = Infinity;
    for (let j = 0; j < count; j += 1) {
      const jx = Number(positions[j * 2]) || 0;
      const jy = Number(positions[j * 2 + 1]) || 0;
      const dx = jx - tx;
      const dy = jy - y;
      const d2 = dx * dx + dy * dy;
      if (d2 < bestD2) {
        bestD2 = d2;
        best = j;
      }
    }
    if (best >= 0) map.set(i, best);
  }
  return map;
}

function getHeatmapColorParts(t) {
  const u = math.clamp(Number(t) || 0, 0, 1);
  const stops = [
    { t: 0.0, c: [34, 54, 186] },
    { t: 0.2, c: [52, 136, 255] },
    { t: 0.42, c: [44, 214, 176] },
    { t: 0.68, c: [237, 220, 72] },
    { t: 1.0, c: [236, 74, 54] },
  ];
  let a = stops[0];
  let b = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i += 1) {
    if (u >= stops[i].t && u <= stops[i + 1].t) {
      a = stops[i];
      b = stops[i + 1];
      break;
    }
  }
  const span = Math.max(1e-6, b.t - a.t);
  const f = math.clamp((u - a.t) / span, 0, 1);
  const lerp = (x, y) => Math.round(x + (y - x) * f);
  return {
    r: lerp(a.c[0], b.c[0]),
    g: lerp(a.c[1], b.c[1]),
    b: lerp(a.c[2], b.c[2]),
    value: u,
  };
}

function getHeatmapColor(t) {
  const parts = getHeatmapColorParts(t);
  return `rgba(${parts.r}, ${parts.g}, ${parts.b}, ${0.2 + 0.65 * parts.value})`;
}

function getHeatmapColorWithAlpha(t, alphaScale = 1) {
  const parts = getHeatmapColorParts(t);
  const scale = Number(alphaScale) || 0;
  if (scale <= 0) return `rgba(${parts.r}, ${parts.g}, ${parts.b}, 0)`;
  const a = math.clamp((0.2 + 0.65 * parts.value) * scale, 0.05, 1);
  return `rgba(${parts.r}, ${parts.g}, ${parts.b}, ${a})`;
}

function getBoneVizColorParts(index, strength = 1) {
  const i = Number(index);
  const s = math.clamp(Number(strength) || 0, 0, 1);
  return {
    h: ((Number.isFinite(i) ? i : 0) * 57) % 360,
    s: Math.round(62 + 30 * s),
    l: Math.round(42 + 16 * s),
  };
}

function getBoneVizColor(index, alpha = 0.72, strength = 1) {
  const parts = getBoneVizColorParts(index, strength);
  const a = math.clamp(Number(alpha) || 0.72, 0, 1);
  return `hsla(${parts.h}, ${parts.s}%, ${parts.l}%, ${a})`;
}

function getWeightOverlayVertexInfo(weights, vertexIndex, boneCount, selectedBone) {
  let domBone = 0;
  let domW = -1;
  let selectedW = 0;
  for (let b = 0; b < boneCount; b += 1) {
    const w = Number(weights[vertexIndex * boneCount + b]) || 0;
    if (w > domW) {
      domW = w;
      domBone = b;
    }
    if (b === selectedBone) selectedW = w;
  }
  return {
    domBone,
    domW: math.clamp(domW, 0, 1),
    selectedW: math.clamp(selectedW, 0, 1),
  };
}

function clampOverlayByte(value) {
  return math.clamp(Math.round(Number(value) || 0), 0, 255);
}

function hslToRgbParts(h, s, l) {
  const hue = ((((Number(h) || 0) % 360) + 360) % 360) / 360;
  const sat = math.clamp(Number(s) || 0, 0, 100) / 100;
  const light = math.clamp(Number(l) || 0, 0, 100) / 100;
  if (sat <= 1e-6) {
    const gray = clampOverlayByte(light * 255);
    return { r: gray, g: gray, b: gray };
  }
  const q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat;
  const p = 2 * light - q;
  const hueToRgb = (t) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  return {
    r: clampOverlayByte(hueToRgb(hue + 1 / 3) * 255),
    g: clampOverlayByte(hueToRgb(hue) * 255),
    b: clampOverlayByte(hueToRgb(hue - 1 / 3) * 255),
  };
}

function getWeightOverlayAlphaByte(value, alphaScale = 1) {
  const scale = Number(alphaScale) || 0;
  if (scale <= 0) return 0;
  const clampedValue = math.clamp(Number(value) || 0, 0, 1);
  const alpha = math.clamp((0.2 + 0.65 * clampedValue) * scale, 0.05, 1);
  return clampOverlayByte(alpha * 255);
}

function getHeatmapColorRgba(t, alphaScale = 1) {
  const parts = getHeatmapColorParts(t);
  return {
    r: parts.r,
    g: parts.g,
    b: parts.b,
    a: getWeightOverlayAlphaByte(parts.value, alphaScale),
  };
}

function getBoneVizColorRgba(index, alpha = 0.72, strength = 1) {
  const parts = getBoneVizColorParts(index, strength);
  const rgb = hslToRgbParts(parts.h, parts.s, parts.l);
  return {
    r: rgb.r,
    g: rgb.g,
    b: rgb.b,
    a: clampOverlayByte(math.clamp(Number(alpha) || 0, 0, 1) * 255),
  };
}

function getWeightHeatmapCanvas(width, height) {
  const w = Math.max(1, Math.ceil(Number(width) || 1));
  const h = Math.max(1, Math.ceil(Number(height) || 1));
  if (!state.weightHeatmapCanvas) state.weightHeatmapCanvas = makeCanvas(w, h);
  if (state.weightHeatmapCanvas.width !== w) state.weightHeatmapCanvas.width = w;
  if (state.weightHeatmapCanvas.height !== h) state.weightHeatmapCanvas.height = h;
  return state.weightHeatmapCanvas;
}

function rasterizeWeightHeatmapTriangle(imageData, stride, bounds, points, colorize) {
  if (!imageData || !bounds || !Array.isArray(points) || points.length !== 3 || typeof colorize !== "function") return;
  const edge = (ax, ay, bx, by, px, py) => (px - ax) * (by - ay) - (py - ay) * (bx - ax);
  const p0 = points[0];
  const p1 = points[1];
  const p2 = points[2];
  const area = edge(p0.x, p0.y, p1.x, p1.y, p2.x, p2.y);
  if (!Number.isFinite(area) || Math.abs(area) < 1e-6) return;
  const invArea = 1 / area;
  for (let y = bounds.minY; y <= bounds.maxY; y += 1) {
    for (let x = bounds.minX; x <= bounds.maxX; x += 1) {
      const px = x + 0.5;
      const py = y + 0.5;
      const w0 = edge(p1.x, p1.y, p2.x, p2.y, px, py) * invArea;
      const w1 = edge(p2.x, p2.y, p0.x, p0.y, px, py) * invArea;
      const w2 = edge(p0.x, p0.y, p1.x, p1.y, px, py) * invArea;
      if (w0 < -1e-5 || w1 < -1e-5 || w2 < -1e-5) continue;
      const rgba = colorize(w0, w1, w2, px, py);
      if (!rgba) continue;
      const alpha = clampOverlayByte(rgba.a);
      if (alpha <= 0) continue;
      const idx = (y * stride + x) * 4;
      imageData[idx] = clampOverlayByte(rgba.r);
      imageData[idx + 1] = clampOverlayByte(rgba.g);
      imageData[idx + 2] = clampOverlayByte(rgba.b);
      imageData[idx + 3] = alpha;
    }
  }
}

function drawContinuousWeightHeatmap(ctx, m, meshData, screenPoints, vertexInfos, mode, selectedBone, selectedValid, alphaBase) {
  if (!ctx || !m || !meshData || !screenPoints || !Array.isArray(vertexInfos) || vertexInfos.length === 0) return;
  const triIndices = getMeshTriangleIndexArray(meshData);
  const weights = meshData.weights;
  const boneCount = Array.isArray(m.rigBones) ? m.rigBones.length : 0;
  const vCount = Math.floor((Number(screenPoints.length) || 0) / 2);
  if (!triIndices || triIndices.length < 3 || !weights || boneCount <= 0 || vCount <= 0) return;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < vCount; i += 1) {
    const sx = Number(screenPoints[i * 2]);
    const sy = Number(screenPoints[i * 2 + 1]);
    if (!Number.isFinite(sx) || !Number.isFinite(sy)) continue;
    if (sx < minX) minX = sx;
    if (sy < minY) minY = sy;
    if (sx > maxX) maxX = sx;
    if (sy > maxY) maxY = sy;
  }
  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) return;
  const originX = Math.floor(minX);
  const originY = Math.floor(minY);
  const width = Math.max(1, Math.ceil(maxX) - originX + 1);
  const height = Math.max(1, Math.ceil(maxY) - originY + 1);
  const canvas = getWeightHeatmapCanvas(width, height);
  const heatCtx = canvas && typeof canvas.getContext === "function" ? canvas.getContext("2d") : null;
  if (!heatCtx || typeof heatCtx.createImageData !== "function") return;
  const image = heatCtx.createImageData(width, height);
  const data = image.data;
  const isDominant = mode === "dominant" || !selectedValid;
  for (let t = 0; t + 2 < triIndices.length; t += 3) {
    const i0 = Number(triIndices[t]);
    const i1 = Number(triIndices[t + 1]);
    const i2 = Number(triIndices[t + 2]);
    if (!Number.isFinite(i0) || !Number.isFinite(i1) || !Number.isFinite(i2)) continue;
    if (i0 < 0 || i1 < 0 || i2 < 0 || i0 >= vCount || i1 >= vCount || i2 >= vCount) continue;
    const points = [
      { x: (Number(screenPoints[i0 * 2]) || 0) - originX, y: (Number(screenPoints[i0 * 2 + 1]) || 0) - originY },
      { x: (Number(screenPoints[i1 * 2]) || 0) - originX, y: (Number(screenPoints[i1 * 2 + 1]) || 0) - originY },
      { x: (Number(screenPoints[i2 * 2]) || 0) - originX, y: (Number(screenPoints[i2 * 2 + 1]) || 0) - originY },
    ];
    const bounds = {
      minX: Math.max(0, Math.floor(Math.min(points[0].x, points[1].x, points[2].x))),
      minY: Math.max(0, Math.floor(Math.min(points[0].y, points[1].y, points[2].y))),
      maxX: Math.min(width - 1, Math.ceil(Math.max(points[0].x, points[1].x, points[2].x))),
      maxY: Math.min(height - 1, Math.ceil(Math.max(points[0].y, points[1].y, points[2].y))),
    };
    if (bounds.maxX < bounds.minX || bounds.maxY < bounds.minY) continue;
    if (isDominant) {
      rasterizeWeightHeatmapTriangle(data, width, bounds, points, (w0, w1, w2) => {
        let domBone = 0;
        let domWeight = -1;
        for (let b = 0; b < boneCount; b += 1) {
          const weight =
            (Number(weights[i0 * boneCount + b]) || 0) * w0 +
            (Number(weights[i1 * boneCount + b]) || 0) * w1 +
            (Number(weights[i2 * boneCount + b]) || 0) * w2;
          if (weight > domWeight) {
            domWeight = weight;
            domBone = b;
          }
        }
        const alpha = alphaBase * (0.16 + 0.56 * math.clamp(domWeight, 0, 1));
        return getBoneVizColorRgba(domBone, alpha, domWeight);
      });
    } else {
      const values = [vertexInfos[i0].selectedW, vertexInfos[i1].selectedW, vertexInfos[i2].selectedW];
      rasterizeWeightHeatmapTriangle(data, width, bounds, points, (w0, w1, w2) => {
        const value = values[0] * w0 + values[1] * w1 + values[2] * w2;
        return getHeatmapColorRgba(value, alphaBase);
      });
    }
  }
  heatCtx.putImageData(image, 0, 0);
  ctx.drawImage(canvas, originX, originY);
}

function drawWeightOverlayLegend(ctx, mode, selectedBone, selectedValid, m, alphaBase) {
  if (!ctx) return;
  const x = 14;
  const y = 44;
  const w = 172;
  const h = 12;
  ctx.save();
  ctx.fillStyle = "rgba(8, 13, 20, 0.82)";
  ctx.fillRect(x - 8, y - 20, w + 16, 54);
  ctx.strokeStyle = "rgba(160, 176, 194, 0.28)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x - 8, y - 20, w + 16, 54);
  ctx.font = "12px Segoe UI, sans-serif";
  ctx.fillStyle = "rgba(235,245,255,0.96)";
  if (mode === "dominant" || !selectedValid) {
    ctx.fillText("Weight Gradient: Dominant Bone", x, y - 8);
  } else {
    const name =
      Number.isFinite(selectedBone) &&
      selectedBone >= 0 &&
      selectedBone < m.rigBones.length &&
      m.rigBones[selectedBone]
        ? String(m.rigBones[selectedBone].name || `bone_${selectedBone}`)
        : "None";
    ctx.fillText(`Weight Gradient: ${name}`, x, y - 8);
  }
  const g = ctx.createLinearGradient(x, y, x + w, y);
  for (let i = 0; i <= 8; i += 1) {
    const t = i / 8;
    g.addColorStop(t, getHeatmapColorWithAlpha(t, Math.max(0.9, alphaBase)));
  }
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "rgba(255,255,255,0.24)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = "rgba(215, 226, 237, 0.92)";
  ctx.fillText("0.0", x, y + 25);
  ctx.fillText("1.0", x + w - 18, y + 25);
  ctx.restore();
}

function drawWeightMeshOutline(ctx, meshData, screenPoints) {
  if (!ctx || !meshData || !screenPoints) return;
  const idx = meshData.indices;
  if (!Array.isArray(idx) && !(idx && typeof idx.length === "number")) return;
  if (!idx || idx.length < 3) return;
  ctx.save();
  ctx.strokeStyle = "rgba(245, 249, 255, 0.22)";
  ctx.lineWidth = 1;
  for (let t = 0; t + 2 < idx.length; t += 3) {
    const i0 = Number(idx[t]);
    const i1 = Number(idx[t + 1]);
    const i2 = Number(idx[t + 2]);
    if (!Number.isFinite(i0) || !Number.isFinite(i1) || !Number.isFinite(i2)) continue;
    ctx.beginPath();
    ctx.moveTo(Number(screenPoints[i0 * 2]) || 0, Number(screenPoints[i0 * 2 + 1]) || 0);
    ctx.lineTo(Number(screenPoints[i1 * 2]) || 0, Number(screenPoints[i1 * 2 + 1]) || 0);
    ctx.lineTo(Number(screenPoints[i2 * 2]) || 0, Number(screenPoints[i2 * 2 + 1]) || 0);
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();
}

function getMeshTriangleIndexArray(meshData) {
  const idx = meshData && meshData.indices;
  if (Array.isArray(idx)) return idx;
  if (idx instanceof Uint16Array || idx instanceof Uint32Array || idx instanceof Int32Array) return idx;
  if (idx && typeof idx.length === "number") return idx;
  return null;
}

function drawWeightOverlayForMesh(ctx, m, meshData, screenPoints) {
  if (!ctx || !m || !meshData || !screenPoints) return;
  const weights = meshData.weights;
  const boneCount = Array.isArray(m.rigBones) ? m.rigBones.length : 0;
  const vCount = Math.floor((Number(screenPoints.length) || 0) / 2);
  if (!weights || boneCount <= 0 || vCount <= 0 || weights.length !== vCount * boneCount) return;
  const mode = sanitizeWeightVizMode(state.vertexDeform.weightVizMode);
  const alphaBase = math.clamp(Number(state.vertexDeform.weightVizOpacity) || 0.75, 0.05, 1);
  const selectedBone = getPrimarySelectedBoneIndex();
  const selectedValid = Number.isFinite(selectedBone) && selectedBone >= 0 && selectedBone < boneCount;
  const vertexInfos = new Array(vCount);
  for (let i = 0; i < vCount; i += 1) {
    vertexInfos[i] = getWeightOverlayVertexInfo(weights, i, boneCount, selectedBone);
  }
  // Prefer the GPU heatmap (dedicated #glOverlayCanvas). It handles both brush
  // strokes and steady state at full resolution; the legacy CPU fallbacks
  // remain only for the no-WebGL case.
  let gpuOk = false;
  if (typeof weightHeatmapGPU !== "undefined" && weightHeatmapGPU && typeof weightHeatmapGPU.draw === "function") {
    try {
      gpuOk = weightHeatmapGPU.draw(m, meshData, screenPoints, vertexInfos, mode, selectedBone, selectedValid, alphaBase);
    } catch (err) {
      console.warn("[weightHeatmapGPU] draw failed; falling back to CPU", err);
      gpuOk = false;
    }
  }
  if (!gpuOk) {
    const stroking = !!(state.drag && state.drag.type === "weight_brush");
    if (stroking) {
      drawWeightOverlayFastTriangles(ctx, meshData, screenPoints, vertexInfos, mode, selectedValid, alphaBase);
    } else {
      drawContinuousWeightHeatmap(ctx, m, meshData, screenPoints, vertexInfos, mode, selectedBone, selectedValid, alphaBase);
    }
  }
  drawWeightMeshOutline(ctx, meshData, screenPoints);
  for (let i = 0; i < vCount; i += 1) {
    const info = vertexInfos[i];
    const sx = Number(screenPoints[i * 2]) || 0;
    const sy = Number(screenPoints[i * 2 + 1]) || 0;
    if (mode === "dominant" || !selectedValid) {
      const a = alphaBase * (0.14 + 0.42 * info.domW);
      ctx.fillStyle = getBoneVizColor(info.domBone, a, info.domW);
    } else {
      ctx.fillStyle = getHeatmapColorWithAlpha(info.selectedW, alphaBase * 0.75);
    }
    ctx.beginPath();
    ctx.arc(sx, sy, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  drawWeightOverlayLegend(ctx, mode, selectedBone, selectedValid, m, alphaBase);
}

// Cheap fallback: one fill per triangle using averaged corner colour.
// O(triangles), no per-pixel work. Used during brush strokes.
function drawWeightOverlayFastTriangles(ctx, meshData, screenPoints, vertexInfos, mode, selectedValid, alphaBase) {
  const triIndices = getMeshTriangleIndexArray(meshData);
  const vCount = vertexInfos.length;
  if (!triIndices || triIndices.length < 3) return;
  const isDominant = mode === "dominant" || !selectedValid;
  ctx.save();
  for (let t = 0; t + 2 < triIndices.length; t += 3) {
    const i0 = Number(triIndices[t]);
    const i1 = Number(triIndices[t + 1]);
    const i2 = Number(triIndices[t + 2]);
    if (!Number.isFinite(i0) || !Number.isFinite(i1) || !Number.isFinite(i2)) continue;
    if (i0 < 0 || i1 < 0 || i2 < 0 || i0 >= vCount || i1 >= vCount || i2 >= vCount) continue;
    const a0 = vertexInfos[i0];
    const a1 = vertexInfos[i1];
    const a2 = vertexInfos[i2];
    let fill;
    if (isDominant) {
      // Pick the dominant bone of the corner with the highest weight (cheap; biased toward strongest).
      const winner = a0.domW >= a1.domW && a0.domW >= a2.domW ? a0 : a1.domW >= a2.domW ? a1 : a2;
      const avgW = (a0.domW + a1.domW + a2.domW) / 3;
      const alpha = alphaBase * (0.14 + 0.42 * avgW);
      fill = getBoneVizColor(winner.domBone, alpha, avgW);
    } else {
      const avg = (a0.selectedW + a1.selectedW + a2.selectedW) / 3;
      fill = getHeatmapColorWithAlpha(avg, alphaBase * 0.75);
    }
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(Number(screenPoints[i0 * 2]) || 0, Number(screenPoints[i0 * 2 + 1]) || 0);
    ctx.lineTo(Number(screenPoints[i1 * 2]) || 0, Number(screenPoints[i1 * 2 + 1]) || 0);
    ctx.lineTo(Number(screenPoints[i2 * 2]) || 0, Number(screenPoints[i2 * 2 + 1]) || 0);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function sanitizeVertexIndexArray(list, vCount) {
  const out = [];
  const max = Math.max(0, Number(vCount) || 0);
  for (const raw of Array.isArray(list) ? list : []) {
    const i = Number(raw);
    if (!Number.isFinite(i) || i < 0 || i >= max) continue;
    if (!out.includes(i)) out.push(i);
  }
  out.sort((a, b) => a - b);
  return out;
}

function getActiveVertexSelection(vCount = null) {
  const key = getActiveVertexSelectionKey();
  const max = Number.isFinite(vCount) ? Number(vCount) : getActiveVertexContext().vCount;
  const curr = sanitizeVertexIndexArray(state.vertexDeform.selectionByKey[key], max);
  state.vertexDeform.selectionByKey[key] = curr;
  return curr;
}

function setActiveVertexSelection(indices, vCount = null) {
  const key = getActiveVertexSelectionKey();
  const max = Number.isFinite(vCount) ? Number(vCount) : getActiveVertexContext().vCount;
  state.vertexDeform.selectionByKey[key] = sanitizeVertexIndexArray(indices, max);
}

function clearActiveVertexSelection() {
  const key = getActiveVertexSelectionKey();
  state.vertexDeform.selectionByKey[key] = [];
}

function toggleVertexSelectionIndex(index, vCount = null) {
  const curr = getActiveVertexSelection(vCount);
  if (curr.includes(index)) {
    setActiveVertexSelection(curr.filter((v) => v !== index), vCount);
  } else {
    curr.push(index);
    setActiveVertexSelection(curr, vCount);
  }
  return getActiveVertexSelection(vCount);
}

function getActivePinnedVertexSet(vCount = null) {
  const key = getActiveVertexSelectionKey();
  const max = Number.isFinite(vCount) ? Number(vCount) : getActiveVertexContext().vCount;
  const curr = sanitizeVertexIndexArray(state.vertexDeform.pinnedByKey[key], max);
  state.vertexDeform.pinnedByKey[key] = curr;
  return new Set(curr);
}

function setActivePinnedVertices(indices, vCount = null) {
  const key = getActiveVertexSelectionKey();
  const max = Number.isFinite(vCount) ? Number(vCount) : getActiveVertexContext().vCount;
  state.vertexDeform.pinnedByKey[key] = sanitizeVertexIndexArray(indices, max);
}

function selectVerticesByRect(x0, y0, x1, y1, append = false) {
  const m = state.mesh;
  if (!m) return 0;
  const ctx = getActiveVertexContext(m);
  const screen = ctx.screen;
  const vCount = ctx.vCount;
  if (!screen || vCount <= 0) {
    if (!append) clearActiveVertexSelection();
    return 0;
  }
  const left = Math.min(x0, x1);
  const right = Math.max(x0, x1);
  const top = Math.min(y0, y1);
  const bottom = Math.max(y0, y1);
  const picked = [];
  for (let i = 0; i < vCount; i += 1) {
    const sx = screen[i * 2];
    const sy = screen[i * 2 + 1];
    if (sx >= left && sx <= right && sy >= top && sy <= bottom) picked.push(i);
  }
  if (picked.length === 0) {
    if (!append) clearActiveVertexSelection();
    return 0;
  }
  if (append) {
    setActiveVertexSelection([...getActiveVertexSelection(vCount), ...picked], vCount);
  } else {
    setActiveVertexSelection(picked, vCount);
  }
  return getActiveVertexSelection(vCount).length;
}

function toggleSelectAllVertices() {
  const ctx = getActiveVertexContext();
  const vCount = ctx.vCount;
  if (vCount <= 0) return;
  const curr = getActiveVertexSelection(vCount);
  if (curr.length === vCount) {
    clearActiveVertexSelection();
    setStatus("Vertex selection cleared.");
    return;
  }
  setActiveVertexSelection(Array.from({ length: vCount }, (_, i) => i), vCount);
  setStatus(`All vertices selected (${vCount}).`);
}

function relaxSelectedVertices(strength = 0.45) {
  const m = state.mesh;
  if (!m) return 0;
  const ctx = getActiveVertexContext(m);
  const indices = Array.isArray(ctx.indices) || ctx.indices instanceof Uint16Array ? ctx.indices : null;
  const vCount = ctx.vCount;
  if (!indices || vCount <= 0) return 0;
  const selected = getActiveVertexSelection(vCount);
  if (selected.length === 0) return 0;
  const pinned = getActivePinnedVertexSet(vCount);
  const offsets = getActiveOffsets(m);
  const neighbors = Array.from({ length: vCount }, () => new Set());
  for (let t = 0; t + 2 < indices.length; t += 3) {
    const a = Number(indices[t]);
    const b = Number(indices[t + 1]);
    const c = Number(indices[t + 2]);
    if (a < 0 || b < 0 || c < 0 || a >= vCount || b >= vCount || c >= vCount) continue;
    neighbors[a].add(b).add(c);
    neighbors[b].add(a).add(c);
    neighbors[c].add(a).add(b);
  }
  let moved = 0;
  const alpha = math.clamp(Number(strength) || 0, 0, 1);
  const next = new Float32Array(offsets);
  for (const i of selected) {
    if (pinned.has(i)) continue;
    const ring = neighbors[i];
    if (!ring || ring.size === 0) continue;
    let sx = 0;
    let sy = 0;
    let c = 0;
    for (const n of ring) {
      sx += offsets[n * 2] || 0;
      sy += offsets[n * 2 + 1] || 0;
      c += 1;
    }
    if (c <= 0) continue;
    const ax = sx / c;
    const ay = sy / c;
    const ox = offsets[i * 2] || 0;
    const oy = offsets[i * 2 + 1] || 0;
    next[i * 2] = ox + (ax - ox) * alpha;
    next[i * 2 + 1] = oy + (ay - oy) * alpha;
    moved += 1;
  }
  if (moved > 0) {
    offsets.set(next);
    markDirtyVertexTrack(state.activeSlot);
  }
  return moved;
}

function createShader(type, src) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) || "Shader compilation failed");
  }
  return shader;
}

function createProgram(vsSrc, fsSrc) {
  const program = gl.createProgram();
  const vs = createShader(gl.VERTEX_SHADER, vsSrc);
  const fs = createShader(gl.FRAGMENT_SHADER, fsSrc);
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) || "Program link failed");
  }
  return program;
}

let program = null;

// ============================================================
// SECTION: UI Refresh — Mode & Workspace
// updateWorkspaceUI / refreshWorkspacePageUI: full UI state sync,
//   controls workspace tab active state, left panel tab visibility,
//   timeline/layer/state dock visibility.
// ============================================================
let loc = null;
let vbo = null;
let ibo = null;
let vao = null;

// Wrapped so we can rebuild after a webglcontextlost/webglcontextrestored cycle.
function initMainGLResources() {
  if (!hasGL) return;
  program = createProgram(
    isWebGL2
      ? `#version 300 es
  in vec2 aPos;
  in vec2 aUv;
  uniform vec2 uResolution;
  out vec2 vUv;
  void main() {
    vec2 z = aPos / uResolution;
    vec2 clip = z * 2.0 - 1.0;
    gl_Position = vec4(clip * vec2(1.0, -1.0), 0.0, 1.0);
    vUv = aUv;
  }`
      : `
  attribute vec2 aPos;
  attribute vec2 aUv;
  uniform vec2 uResolution;
  varying vec2 vUv;
  void main() {
    vec2 z = aPos / uResolution;
    vec2 clip = z * 2.0 - 1.0;
    gl_Position = vec4(clip * vec2(1.0, -1.0), 0.0, 1.0);
    vUv = aUv;
  }`,
    isWebGL2
      ? `#version 300 es
  precision highp float;
  in vec2 vUv;
  uniform sampler2D uTex;
  uniform float uAlpha;
  uniform vec3 uTint;
  uniform vec3 uDark;
  out vec4 outColor;
  void main() {
    vec4 c = texture(uTex, vUv);
    // Spine-style two-color tint: light*tex.rgb + (1-tex.rgb)*dark*tex.a
    // When dark = (0,0,0) this collapses to tex.rgb * light, so legacy slots
    // (no dark color set) render identically to the original single-color path.
    vec3 rgb = c.rgb * uTint + (vec3(1.0) - c.rgb) * uDark * c.a;
    outColor = vec4(rgb, c.a * uAlpha);
  }`
      : `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTex;
  uniform float uAlpha;
  uniform vec3 uTint;
  uniform vec3 uDark;
  void main() {
    vec4 c = texture2D(uTex, vUv);
    vec3 rgb = c.rgb * uTint + (vec3(1.0) - c.rgb) * uDark * c.a;
    gl_FragColor = vec4(rgb, c.a * uAlpha);
  }`
  );

  gl.useProgram(program);

  loc = {
    aPos: gl.getAttribLocation(program, "aPos"),
    aUv: gl.getAttribLocation(program, "aUv"),
    uResolution: gl.getUniformLocation(program, "uResolution"),
    uTex: gl.getUniformLocation(program, "uTex"),
    uAlpha: gl.getUniformLocation(program, "uAlpha"),
    uTint: gl.getUniformLocation(program, "uTint"),
    uDark: gl.getUniformLocation(program, "uDark"),
  };

  vbo = gl.createBuffer();
  ibo = gl.createBuffer();
  vao = hasVAO ? gl.createVertexArray() : null;
}
initMainGLResources();

function setupVertexLayout() {
  if (!hasGL) return;
  if (hasVAO) {
    gl.bindVertexArray(vao);
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.enableVertexAttribArray(loc.aPos);
  gl.vertexAttribPointer(loc.aPos, 2, gl.FLOAT, false, 16, 0);
  gl.enableVertexAttribArray(loc.aUv);
  gl.vertexAttribPointer(loc.aUv, 2, gl.FLOAT, false, 16, 8);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
}

function finishMainGLSetup() {
  if (!hasGL) return;
  setupVertexLayout();
  if (hasVAO) {
    gl.bindVertexArray(null);
  }
  gl.uniform1i(loc.uTex, 0);
  gl.uniform1f(loc.uAlpha, 1);
  if (loc.uTint) gl.uniform3f(loc.uTint, 1, 1, 1);
  if (loc.uDark) gl.uniform3f(loc.uDark, 0, 0, 0);
}
finishMainGLSetup();

// Rebuild path on context restore — runs after webglcontextrestored fires and
// the toolkit has cleared its caches. The texture cache is invalidated too,
// so subsequent ensureGLTextureForCanvas() calls will re-upload.
// Set to true on webglcontextlost; render() consults it before drawing so
// that even if the restored-listener hasn't fired/wasn't registered yet,
// the very next frame after restore self-heals by rebuilding GL handles.
let _mainGLNeedsRebuild = false;
function markMainGLNeedsRebuild() {
  _mainGLNeedsRebuild = true;
}
function isMainGLNeedingRebuild() {
  return _mainGLNeedsRebuild;
}
function rebuildMainGLAfterRestore() {
  if (!hasGL) return;
  if (gl.isContextLost && gl.isContextLost()) {
    // Context still lost -- can't rebuild yet. Retry on next render.
    _mainGLNeedsRebuild = true;
    return;
  }
  try {
    initMainGLResources();
    finishMainGLSetup();
    if (typeof resetGLTextureCache === "function") resetGLTextureCache(true);
    // Force a backdrop redraw: the gl-lost fallback renders slot images
    // straight onto the backdrop canvas. Without invalidating the
    // backdrop signature, that stale fallback content would linger after
    // the GL path resumes.
    if (state.renderPerf) state.renderPerf.backdropSig = "";
    // Re-upload the active source-canvas texture immediately. Without
    // this, ensureGLTextureForCanvas() lazily uploads on the next render
    // call, which is fine in most cases -- but pre-warming avoids a
    // one-frame blank flash and makes recovery deterministic.
    if (state.sourceCanvas && typeof ensureGLTextureForCanvas === "function") {
      try {
        const tex = ensureGLTextureForCanvas(state.sourceCanvas);
        if (tex) state.texture = tex;
      } catch { /* ignore */ }
    }
    _mainGLNeedsRebuild = false;
    console.info("[main-gl] resources rebuilt after context restore");
    // Schedule a render so the freshly-restored context is used right
    // away, regardless of whether anything else is driving the loop.
    if (typeof requestRender === "function") requestRender("gl-rebuild");
  } catch (err) {
    console.error("[main-gl] rebuild after restore failed", err);
  }
}
// Register the restore callback. gl-toolkit.js loads AFTER this file, so
// window.glToolkit isn't populated yet when this code runs. We poll: try
// every macrotask until it appears (and don't lose any restored events
// that happen in the meantime, by also installing a direct canvas listener
// as a backup).
function _installGLRestoreListener() {
  if (typeof window === "undefined" || !hasGL) return;
  const tryAttach = () => {
    if (window.glToolkit && typeof window.glToolkit.onContextRestored === "function") {
      window.glToolkit.onContextRestored((label) => {
        if (label === "main") rebuildMainGLAfterRestore();
      });
      return true;
    }
    return false;
  };
  if (!tryAttach()) {
    // Backup: direct canvas listener so we never miss a restored event
    // even if gl-toolkit somehow fails to load. This fires alongside
    // toolkit dispatch when both are wired up; rebuildMainGLAfterRestore
    // is idempotent on its own state and only rebuilds GL handles.
    if (els && els.glCanvas && els.glCanvas.addEventListener) {
      els.glCanvas.addEventListener("webglcontextrestored", () => {
        rebuildMainGLAfterRestore();
      }, false);
    }
    // Keep retrying until toolkit shows up (it loads next on the page).
    let attempts = 0;
    const retry = () => {
      if (tryAttach()) return;
      attempts += 1;
      if (attempts < 50) setTimeout(retry, 20);
    };
    setTimeout(retry, 0);
  }
}
_installGLRestoreListener();

function bindGeometry() {
  if (!hasGL) return;
  if (hasVAO) {
    gl.bindVertexArray(vao);
  } else {
    setupVertexLayout();
  }
}

function createIdentity() {
  return [1, 0, 0, 1, 0, 0];
}

function matFromTR(tx, ty, r) {
  const c = Math.cos(r);
  const s = Math.sin(r);
  return [c, -s, s, c, tx, ty];
}

function normalizeBoneChannels(b) {
  if (!b) return b;
  if (!Number.isFinite(b.sx)) b.sx = 1;
  if (!Number.isFinite(b.sy)) b.sy = 1;
  if (!Number.isFinite(b.shx)) b.shx = 0;
  if (!Number.isFinite(b.shy)) b.shy = 0;
  if (typeof b.workHidden !== "boolean") b.workHidden = false;
  if (typeof b.workHideSlots !== "boolean") b.workHideSlots = false;
  if (typeof b.animHidden !== "boolean") b.animHidden = false;
  b.inherit = normalizeBoneInheritValue(b.inherit);
  return b;
}

const BONE_INHERIT_MODES = new Set(["normal", "onlyTranslation", "noRotationOrReflection", "noScale", "noScaleOrReflection"]);

function normalizeBoneInheritValue(v) {
  const s = String(v || "normal");
  return BONE_INHERIT_MODES.has(s) ? s : "normal";
}

function matFromBone(b) {
  const tx = Number(b.tx) || 0;
  const ty = Number(b.ty) || 0;
  const rot = Number(b.rot) || 0;
  const sx = Number(b.sx) || 0;
  const sy = Number(b.sy) || 0;
  const shx = Number(b.shx) || 0;
  const shy = Number(b.shy) || 0;
  const rx = rot + shx;
  const ry = rot + Math.PI * 0.5 + shy;
  return [Math.cos(rx) * sx, Math.cos(ry) * sy, Math.sin(rx) * sx, Math.sin(ry) * sy, tx, ty];
}

function mul(a, b) {
  return [
    a[0] * b[0] + a[1] * b[2],
    a[0] * b[1] + a[1] * b[3],
    a[2] * b[0] + a[3] * b[2],
    a[2] * b[1] + a[3] * b[3],
    a[0] * b[4] + a[1] * b[5] + a[4],
    a[2] * b[4] + a[3] * b[5] + a[5],
  ];
}

function invert(m) {
  const det = m[0] * m[3] - m[1] * m[2];
  if (Math.abs(det) < 1e-8) return createIdentity();
  const inv = 1 / det;
  const a = m[3] * inv;
  const b = -m[1] * inv;
  const c = -m[2] * inv;
  const d = m[0] * inv;
  const tx = -(a * m[4] + b * m[5]);
  const ty = -(c * m[4] + d * m[5]);
  return [a, b, c, d, tx, ty];
}

function transformPoint(m, x, y) {
  return {
    x: m[0] * x + m[1] * y + m[4],
    y: m[2] * x + m[3] * y + m[5],
  };
}

function matrixAngle(m) {
  return Math.atan2(m[2], m[0]);
}

const POSE_AUTO_RIG_RUNTIME_CANDIDATES = [
  {
    key: "mediapipe-local",
    runtime: "mediapipe",
    label: "MediaPipe local",
    solutionPath: "./vendor/mediapipe/pose",
    scriptUrls: [
      "./vendor/pose-runtime/tfjs-core.js",
      "./vendor/pose-runtime/tfjs-converter.js",
      "./vendor/pose-runtime/tfjs-backend-webgl.js",
      "./vendor/mediapipe/pose/pose.js",
      "./vendor/pose-runtime/pose-detection.js",
    ],
  },
  {
    key: "mediapipe-cdn",
    runtime: "mediapipe",
    label: "MediaPipe CDN",
    solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/pose",
    scriptUrls: [
      "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core",
      "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter",
      "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl",
      "https://cdn.jsdelivr.net/npm/@mediapipe/pose",
      "https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection",
    ],
  },
  {
    key: "tfjs-local",
    runtime: "tfjs",
    label: "TFJS local",
    scriptUrls: [
      "./vendor/pose-runtime/tfjs-core.js",
      "./vendor/pose-runtime/tfjs-converter.js",
      "./vendor/pose-runtime/tfjs-backend-webgl.js",
      "./vendor/pose-runtime/pose-detection.js",
    ],
  },
  {
    key: "tfjs-cdn",
    runtime: "tfjs",
    label: "TFJS CDN",
    scriptUrls: [
      "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core",
      "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter",
      "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl",
      "https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection",
    ],
  },
];


function computeWorld(bones) {
  const world = bones.map(() => createIdentity());
  for (let i = 0; i < bones.length; i += 1) {
    const b = normalizeBoneChannels(bones[i]);
    const local = matFromBone(b);
    if (b.parent >= 0 && b.parent < bones.length) {
      const parentWorld = world[b.parent];
      const parentForInherit = getParentMatrixForInherit(parentWorld, b.inherit);
      world[i] = mul(parentForInherit, local);
    } else {
      world[i] = local;
    }
  }
  return world;
}

function computeWorldEditNoInheritRotation(bones) {
  const world = bones.map(() => createIdentity());
  for (let i = 0; i < bones.length; i += 1) {
    const b = normalizeBoneChannels(bones[i]);
    if (b.parent >= 0 && b.parent < bones.length) {
      const parentWorld = world[b.parent];
      let head;
      if (b.connected) {
        const parent = bones[b.parent];
        const parentLen = Number(parent && parent.length) || 0;
        head = transformPoint(parentWorld, parentLen, 0);
      } else {
        head = {
          x: Number(b.tx) || 0,
          y: Number(b.ty) || 0,
        };
      }
      const localNoTrans = matFromBone({ ...b, tx: 0, ty: 0 });
      world[i] = [localNoTrans[0], localNoTrans[1], localNoTrans[2], localNoTrans[3], head.x, head.y];
    } else {
      world[i] = matFromBone(b);
    }
  }
  return world;
}

function computeRigWorldForCurrentSpace(bones) {
  if (!Array.isArray(bones)) return [];
  return state.rigCoordinateSpace === "edit" ? computeWorldEditNoInheritRotation(bones) : computeWorld(bones);
}

function getEditAwareWorld(bones) {
  if (!Array.isArray(bones)) return [];
  if (state.boneMode === "edit") return computeWorldEditNoInheritRotation(bones);
  return computeWorld(bones);
}

function clearRigEditPreviewCache() {
  state.rigEditPreviewWorld = null;
  state.rigEditPreviewInvBind = null;
}

function markRigEditDirty() {
  if (state.boneMode === "edit") {
    state.rigEditNeedsRuntimeNormalize = true;
    state.rigCoordinateSpace = "edit";
  }
}

function ensureRigEditPreviewCache(force = false) {
  if (!state.mesh || state.boneMode !== "edit") return;
  const rig = getRigBones(state.mesh);
  if (!Array.isArray(rig)) return;
  const needRebuild =
    force ||
    !Array.isArray(state.rigEditPreviewWorld) ||
    !Array.isArray(state.rigEditPreviewInvBind) ||
    state.rigEditPreviewWorld.length !== rig.length ||
    state.rigEditPreviewInvBind.length !== rig.length;
  if (!needRebuild) return;
  const clone = cloneBones(rig);
  enforceConnectedHeads(clone);
  const world = computeWorldEditNoInheritRotation(clone);
  state.rigEditPreviewWorld = world;
  state.rigEditPreviewInvBind = world.map(invert);
}

function getDisplayInvBind(m) {
  if (!m) return [];
  if (
    state.boneMode === "edit" &&
    Array.isArray(state.rigEditPreviewInvBind) &&
    state.rigEditPreviewInvBind.length === (Array.isArray(m.rigBones) ? m.rigBones.length : 0)
  ) {
    return state.rigEditPreviewInvBind;
  }
  return m.invBind;
}

function normalizeRigEditForRuntime(m) {
  if (!m) return false;
  const bones = getRigBones(m);
  if (!Array.isArray(bones) || bones.length <= 0) return false;
  enforceConnectedHeads(bones);
  const editWorld = computeWorldEditNoInheritRotation(bones);
  for (let i = 0; i < bones.length; i += 1) {
    const b = bones[i];
    if (!b) continue;
    normalizeBoneChannels(b);
    const worldAngle = matrixAngle(editWorld[i]);
    if (b.parent >= 0 && b.parent < bones.length) {
      const parentAngle = matrixAngle(editWorld[b.parent]);
      b.rot = shortestAngleDelta(parentAngle, worldAngle);
      if (b.connected) {
        const parent = bones[b.parent];
        b.tx = Number(parent && parent.length) || 0;
        b.ty = 0;
      } else {
        const parentWorld = editWorld[b.parent];
        const parentForInherit = getParentMatrixForInherit(parentWorld, b.inherit);
        const inv = invert(parentForInherit);
        const localHead = transformPoint(inv, b.tx, b.ty);
        b.tx = localHead.x;
        b.ty = localHead.y;
      }
    } else {
      b.rot = worldAngle;
    }
  }
  clearRigEditPreviewCache();
  state.rigEditNeedsRuntimeNormalize = false;
  state.rigCoordinateSpace = "runtime";
  syncPoseFromRig(m);
  syncBindPose(m);
  return true;
}

function normalizeRigRuntimeForEdit(m) {
  if (!m) return false;
  const bones = getRigBones(m);
  if (!Array.isArray(bones) || bones.length <= 0) return false;
  enforceConnectedHeads(bones);
  const runtimeWorld = computeWorld(bones);
  for (let i = 0; i < bones.length; i += 1) {
    const b = bones[i];
    if (!b) continue;
    normalizeBoneChannels(b);
    const ep = getBoneWorldEndpointsFromBones(bones, i, runtimeWorld);
    const worldAngle = Math.atan2(ep.tip.y - ep.head.y, ep.tip.x - ep.head.x);
    b.rot = worldAngle;
    if (b.parent >= 0 && b.connected) {
      const parent = bones[b.parent];
      b.tx = Number(parent && parent.length) || 0;
      b.ty = 0;
    } else {
      b.tx = Number(ep.head.x) || 0;
      b.ty = Number(ep.head.y) || 0;
    }
  }
  clearRigEditPreviewCache();
  state.rigEditNeedsRuntimeNormalize = false;
  state.rigCoordinateSpace = "edit";
  syncPoseFromRig(m);
  syncBindPose(m);
  return true;
}
