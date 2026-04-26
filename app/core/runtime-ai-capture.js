// ROLE: AI Capture domain registry — records raw input events and
// command snapshots so AI agents can inspect rich context after a
// gesture / action. Exists in its own file because it's a sealed
// subsystem (registers, captures, summarizes; no consumers outside
// `runAICaptureCommand` and the report download UI).
// Loaded after runtime.js so it can use els/state/setStatus.
// EXPORTS: registerAICaptureDomain, runAICaptureCommand,
//   beginAICaptureCommand, listAICaptureDomains,
//   buildAICaptureReport, copyAICaptureReport,
//   startAICapture, markAICaptureIssue.
// Plus several `window.__*` aliases for console / external probe use.

const AI_CAPTURE_DOMAIN_REGISTRY = {};
const AI_CAPTURE_RAW_EVENT_LIMIT = 1000;
const AI_CAPTURE_RAW_MOVE_INTERVAL_MS = 120;
const MESH_DEBUG_EVENT_LIMIT = 500;

function registerAICaptureDomain(domain, adapter = {}) {
  const key = String(domain || "").trim();
  if (!key) return null;
  const normalized = {
    id: key,
    label: adapter.label || key,
    snapshot: typeof adapter.snapshot === "function" ? adapter.snapshot : () => null,
    diff: typeof adapter.diff === "function" ? adapter.diff : () => [],
    invariants: typeof adapter.invariants === "function" ? adapter.invariants : () => [],
    suspicions: typeof adapter.suspicions === "function" ? adapter.suspicions : () => [],
    commands: Array.isArray(adapter.commands) ? adapter.commands.slice() : [],
  };
  AI_CAPTURE_DOMAIN_REGISTRY[key] = normalized;
  return normalized;
}

function getAICaptureDomain(domain) {
  return AI_CAPTURE_DOMAIN_REGISTRY[String(domain || "")] || null;
}

function listAICaptureDomains() {
  return Object.keys(AI_CAPTURE_DOMAIN_REGISTRY).sort();
}

function getAICaptureDomainSnapshot(domain) {
  const adapter = getAICaptureDomain(domain);
  return adapter ? adapter.snapshot() : null;
}

function getAICaptureDomainDiffs(domain, startSnapshot = null, finalSnapshot = null, timeline = []) {
  const adapter = getAICaptureDomain(domain);
  return adapter ? adapter.diff(startSnapshot, finalSnapshot, timeline) : [];
}

function getAICaptureDomainInvariants(domain, finalSnapshot = null, context = {}) {
  const adapter = getAICaptureDomain(domain);
  return adapter ? adapter.invariants(finalSnapshot, context) : [];
}

function getAICaptureDomainSuspicions(domain, context = {}) {
  const adapter = getAICaptureDomain(domain);
  return adapter ? adapter.suspicions(context) : [];
}

function buildAICaptureDomainCoverage(timeline = []) {
  const capturedCommands = new Set(
    (Array.isArray(timeline) ? timeline : [])
      .filter((event) => event && event.category === "command")
      .map((event) => event.id)
  );
  const out = {};
  for (const domain of listAICaptureDomains()) {
    const adapter = getAICaptureDomain(domain);
    const commands = adapter.commands.slice();
    out[domain] = {
      label: adapter.label,
      capabilities: ["snapshot", "diff", "invariants", "suspicions"],
      commandCatalog: commands,
      capturedCommands: commands.filter((id) => capturedCommands.has(id)),
      capturedCommandCount: commands.filter((id) => capturedCommands.has(id)).length,
      registeredCommandCount: commands.length,
    };
  }
  return out;
}

function resolveAICaptureEventDomain(kind, details = {}) {
  if (details && details.domain) return String(details.domain);
  const text = String(kind || "");
  if (text.startsWith("mesh_") || text.startsWith("slot_mesh_")) return "mesh";
  if (text.startsWith("timeline_")) return "timeline";
  if (text.startsWith("bone_")) return "bone";
  if (text.startsWith("attachment_")) return "attachment";
  return "app";
}

function resolveAICaptureEventCategory(kind, details = {}) {
  const text = String(kind || "");
  if (text === "command" || text.endsWith("_command") || details.command) return "command";
  if (text.startsWith("capture_") || text.startsWith("ai_capture_")) return "capture";
  if (text.includes("pointer") || text.includes("pick")) return "pointer";
  if (text.includes("drag")) return "drag";
  if (text.includes("target") || text.includes("mode")) return "state_change";
  return "event";
}

function resolveAICaptureIntent(kind, details = {}) {
  if (details && details.command) return String(details.command);
  const text = String(kind || "");
  if (text === "mesh_pointerdown") return "begin_interaction";
  if (text === "slot_mesh_pick") return "pick_vertex";
  if (text === "mesh_drag_start") return "start_drag";
  if (text === "mesh_drag_first_move") return "move_vertex";
  if (text === "mesh_drag_end") return "finish_drag";
  if (text === "slot_mesh_reset_to_grid") return "reset_grid";
  if (text === "slot_mesh_edit_target") return "change_edit_target";
  if (text === "slot_mesh_tool_mode") return "change_tool_mode";
  if (text === "capture_start" || text === "ai_capture_start") return "capture_start";
  if (text === "capture_mark" || text === "ai_capture_mark") return "capture_mark";
  return text || "unknown";
}

function buildAICaptureEventId(kind, details = {}, domain = "app") {
  if (details && details.command) return String(details.command);
  const safeDomain = String(domain || "app").replace(/[^a-z0-9_]+/gi, "_").toLowerCase();
  const safeKind = String(kind || "event").replace(/[^a-z0-9_]+/gi, "_").toLowerCase();
  return `${safeDomain}.${safeKind}`;
}

function buildAICaptureEntity(details = {}) {
  const entity = {};
  if (Number.isFinite(Number(details.slotIndex))) entity.slotIndex = Number(details.slotIndex);
  if (details.pointSet) entity.pointSet = String(details.pointSet);
  if (Number.isFinite(Number(details.pointIndex))) entity.pointIndex = Number(details.pointIndex);
  if (Array.isArray(details.pointIndices)) entity.pointCount = details.pointIndices.length;
  if (details.targetSet) entity.targetSet = String(details.targetSet);
  if (details.activeSet) entity.activeSet = String(details.activeSet);
  if (Number.isFinite(Number(details.activePoint))) entity.activePoint = Number(details.activePoint);
  return entity;
}

function sanitizeAICaptureRawTarget(target) {
  const el = target && target.nodeType === 1 ? target : null;
  if (!el) return { tag: "" };
  const rect = typeof el.getBoundingClientRect === "function" ? el.getBoundingClientRect() : null;
  const text = String(el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();
  return {
    tag: String(el.tagName || "").toLowerCase(),
    id: String(el.id || ""),
    classes: String(el.className || "").split(/\s+/).filter(Boolean).slice(0, 6),
    role: String(el.getAttribute && el.getAttribute("role") || ""),
    ariaLabel: String(el.getAttribute && el.getAttribute("aria-label") || ""),
    name: String(el.getAttribute && el.getAttribute("name") || ""),
    type: String(el.getAttribute && el.getAttribute("type") || ""),
    text: text.slice(0, 40),
    rect: rect ? {
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      w: Math.round(rect.width),
      h: Math.round(rect.height),
    } : null,
  };
}

function sanitizeAICaptureKey(event) {
  if (!event) return "";
  if (event.key && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) return "character";
  return String(event.key || "");
}

function summarizeAICaptureRawEvent(event) {
  const type = String(event && event.type || "");
  const data = {
    target: sanitizeAICaptureRawTarget(event && event.target),
    ui: {
      workspaceMode: state.workspaceMode,
      uiPage: state.uiPage,
      editMode: state.editMode,
      toolMode: state.slotMesh && state.slotMesh.toolMode,
      editTarget: state.slotMesh && state.slotMesh.editTarget,
    },
  };
  if (type.startsWith("pointer") || type === "click" || type === "dblclick" || type === "contextmenu") {
    data.pointer = {
      x: Math.round(Number(event.clientX) || 0),
      y: Math.round(Number(event.clientY) || 0),
      button: Number(event.button) || 0,
      buttons: Number(event.buttons) || 0,
      pointerType: String(event.pointerType || ""),
    };
  }
  if (type === "wheel") {
    data.wheel = {
      x: Math.round(Number(event.clientX) || 0),
      y: Math.round(Number(event.clientY) || 0),
      deltaX: Math.round(Number(event.deltaX) || 0),
      deltaY: Math.round(Number(event.deltaY) || 0),
    };
  }
  if (type === "keydown" || type === "keyup") {
    data.key = {
      key: sanitizeAICaptureKey(event),
      ctrlKey: !!event.ctrlKey,
      shiftKey: !!event.shiftKey,
      altKey: !!event.altKey,
      metaKey: !!event.metaKey,
    };
  }
  if (type === "input" || type === "change") {
    const target = event && event.target;
    data.input = {
      valueLength: target && target.value != null ? String(target.value).length : 0,
      checked: target && "checked" in target ? !!target.checked : undefined,
      selectedIndex: target && "selectedIndex" in target ? Number(target.selectedIndex) : undefined,
    };
  }
  return data;
}

function pushAICaptureRawInputEvent(event) {
  if (!state || !state.aiCapture || !state.aiCapture.active || !event) return null;
  const type = String(event.type || "");
  const now = Date.now();
  if ((type === "pointermove" || type === "wheel") && now - (Number(state.aiCapture.lastRawMoveAt[type]) || 0) < AI_CAPTURE_RAW_MOVE_INTERVAL_MS) {
    state.aiCapture.rawDroppedCount += 1;
    return null;
  }
  if (type === "pointermove" || type === "wheel") state.aiCapture.lastRawMoveAt[type] = now;
  if (state.aiCapture.rawEventCount >= AI_CAPTURE_RAW_EVENT_LIMIT) {
    state.aiCapture.rawDroppedCount += 1;
    return null;
  }
  state.aiCapture.rawEventCount += 1;
  return pushAICaptureEvent(`raw_${type}`, summarizeAICaptureRawEvent(event), {
    id: `raw.${type}`,
    category: "raw_input",
    domain: state.aiCapture.domain || "app",
    intent: type,
  });
}

function installAICaptureRawInputRecorder() {
  if (window.__aiCaptureRawInputRecorderInstalled) return;
  window.__aiCaptureRawInputRecorderInstalled = true;
  for (const eventName of [
    "pointerdown",
    "pointermove",
    "pointerup",
    "click",
    "dblclick",
    "contextmenu",
    "keydown",
    "keyup",
    "wheel",
    "change",
    "input",
    "focus",
    "blur",
  ]) {
    document.addEventListener(eventName, pushAICaptureRawInputEvent, true);
  }
}

function sanitizeAICaptureData(details = {}) {
  const data = {};
  for (const [key, value] of Object.entries(details || {})) {
    if (key === "before" || key === "after") continue;
    if (key === "ok" || key === "error" || key === "reason") continue;
    if (typeof value === "function") continue;
    data[key] = value;
  }
  return data;
}

function pushAICaptureEvent(kind, details = {}, options = {}) {
  if (!state || !state.aiCapture || !state.aiCapture.active) return null;
  const domain = options.domain || resolveAICaptureEventDomain(kind, details);
  const captureDomain = state.aiCapture.domain || domain;
  if (captureDomain !== "all" && captureDomain !== domain) return null;
  const now = Date.now();
  const seq = Number(options.seq) || ((Number(state.aiCapture.eventSeq) || 0) + 1);
  state.aiCapture.eventSeq = Math.max(Number(state.aiCapture.eventSeq) || 0, seq);
  const event = {
    t: now - (Number(state.aiCapture.startedAt) || now),
    seq,
    at: options.at || new Date(now).toISOString(),
    id: options.id || buildAICaptureEventId(kind, details, domain),
    kind: String(kind || ""),
    category: options.category || resolveAICaptureEventCategory(kind, details),
    domain,
    entity: options.entity || buildAICaptureEntity(details),
    intent: options.intent || resolveAICaptureIntent(kind, details),
    topologyCommand: !!(options.topologyCommand || details.topologyCommand),
    data: sanitizeAICaptureData(details),
  };
  const okSource = options.ok !== undefined ? options : details;
  if (okSource.ok !== undefined) event.ok = !!okSource.ok;
  if (okSource.error !== undefined) event.error = String(okSource.error);
  if (okSource.reason !== undefined) event.reason = String(okSource.reason);
  if (Number.isFinite(options.duration)) event.duration = options.duration;
  if (options.before) event.before = options.before;
  if (options.after) event.after = options.after;
  state.aiCapture.events.push(event);
  return event;
}

function beginAICaptureCommand(command, details = {}, options = {}) {
  const domain = options.domain || "mesh";
  const before = state.aiCapture && state.aiCapture.active ? getAICaptureDomainSnapshot(domain) : null;
  const startedAt = Date.now();
  return (result = {}) => pushAICaptureEvent("command", {
    command,
    ...details,
  }, {
    category: "command",
    domain,
    intent: command,
    topologyCommand: !!options.topologyCommand,
    before,
    after: state.aiCapture && state.aiCapture.active ? getAICaptureDomainSnapshot(domain) : null,
    ok: result.ok,
    error: result.error,
    reason: result.reason,
    duration: Date.now() - startedAt,
  });
}

function runAICaptureCommand(command, details = {}, options = {}, action = null) {
  const run = typeof action === "function" ? action : options;
  const captureOptions = typeof action === "function" ? options : {};
  // Action log: every named command flows through here, so this is a
  // good central hook. Records before the action runs (so we see "this
  // happened" even if the action throws).
  if (typeof window !== "undefined" && window.debug && typeof window.debug.recordAction === "function") {
    window.debug.recordAction("command", String(command || "?"), details && typeof details === "object" ? details : null);
  }
  const finishCapture = beginAICaptureCommand(command, details, captureOptions);
  try {
    const result = typeof run === "function" ? run() : undefined;
    if (result && typeof result.then === "function") {
      return result.then(
        (value) => {
          finishCapture({ ok: true });
          return value;
        },
        (err) => {
          finishCapture({ ok: false, error: err && err.message || String(err) });
          throw err;
        }
      );
    }
    finishCapture({ ok: true });
    return result;
  } catch (err) {
    finishCapture({ ok: false, error: err && err.message || String(err) });
    throw err;
  }
}

function pushMeshDebugEvent(kind, details = {}) {
  const list = Array.isArray(window.__meshDebugEvents) ? window.__meshDebugEvents : [];
  if (list !== window.__meshDebugEvents) window.__meshDebugEvents = list;
  const seq = (Number(window.__meshDebugSeq) || 0) + 1;
  window.__meshDebugSeq = seq;
  const entry = {
    seq,
    at: new Date().toISOString(),
    kind: String(kind || ""),
    ...details,
  };
  list.push(entry);
  if (list.length > MESH_DEBUG_EVENT_LIMIT) {
    list.splice(0, list.length - MESH_DEBUG_EVENT_LIMIT);
  }
  pushAICaptureEvent(kind, details, { domain: "mesh", seq, at: entry.at });
  if (window.__meshDebugEnabled !== false && typeof console !== "undefined" && typeof console.debug === "function") {
    console.debug("[mesh-debug]", entry);
  }
  return entry;
}

if (!Array.isArray(window.__meshDebugEvents)) window.__meshDebugEvents = [];
if (!Number.isFinite(window.__meshDebugSeq)) window.__meshDebugSeq = 0;
if (typeof window.__meshDebugEnabled !== "boolean") window.__meshDebugEnabled = true;
window.__dumpMeshDebugLog = function __dumpMeshDebugLog() {
  return JSON.stringify(window.__meshDebugEvents, null, 2);
};
window.__clearMeshDebugLog = function __clearMeshDebugLog() {
  window.__meshDebugEvents.length = 0;
  window.__meshDebugSeq = 0;
  return 0;
};

function summarizeNumericArray(values, sampleSize = 8) {
  if (!values || typeof values.length !== "number") return { length: 0, sample: [] };
  const length = Number(values.length) || 0;
  const sample = [];
  for (let i = 0; i < Math.min(length, sampleSize); i += 1) {
    sample.push(Number(values[i]) || 0);
  }
  let hash = 2166136261;
  for (let i = 0; i < length; i += 1) {
    hash ^= Math.round((Number(values[i]) || 0) * 1000);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return { length, sample, hash: hash.toString(16).padStart(8, "0") };
}

function summarizePoints(points, sampleSize = 6) {
  const list = Array.isArray(points) ? points : [];
  return {
    count: list.length,
    sample: list.slice(0, sampleSize).map((p) => ({
      x: Number(p && p.x) || 0,
      y: Number(p && p.y) || 0,
    })),
  };
}

function buildMeshCaptureSnapshot() {
  const slot = typeof getActiveSlot === "function" ? getActiveSlot() : null;
  const att = slot && typeof getActiveAttachment === "function" ? getActiveAttachment(slot) : null;
  const contour = slot && typeof ensureSlotContour === "function" ? ensureSlotContour(slot) : null;
  const meshData = att && att.meshData ? att.meshData : null;
  const positions = meshData && meshData.positions;
  const uvs = meshData && meshData.uvs;
  const indices = meshData && meshData.indices;
  return {
    ui: {
      workspaceMode: state.workspaceMode,
      uiPage: state.uiPage,
      editMode: state.editMode,
      toolMode: typeof normalizeSlotMeshToolMode === "function"
        ? normalizeSlotMeshToolMode(state.slotMesh && state.slotMesh.toolMode)
        : state.slotMesh && state.slotMesh.toolMode,
      editTarget: typeof normalizeSlotMeshEditTarget === "function"
        ? normalizeSlotMeshEditTarget(state.slotMesh && state.slotMesh.editTarget)
        : state.slotMesh && state.slotMesh.editTarget,
      activeSet: state.slotMesh && state.slotMesh.activeSet,
      activePoint: state.slotMesh && state.slotMesh.activePoint,
      selectedPoints: state.slotMesh && state.slotMesh.selectedPoints,
      view: {
        scale: Number(state.view && state.view.scale) || 1,
        cx: Number(state.view && state.view.cx) || 0,
        cy: Number(state.view && state.view.cy) || 0,
      },
    },
    slot: slot ? {
      index: Number(state.activeSlot),
      id: slot.id || "",
      name: slot.name || "",
      activeAttachment: slot.activeAttachment || "",
    } : null,
    attachment: att ? {
      name: att.name || "",
      type: att.type || "",
      rect: att.rect || null,
    } : null,
    mesh: meshData ? {
      cols: Number(meshData.cols) || 0,
      rows: Number(meshData.rows) || 0,
      vertexCount: positions ? Math.floor(positions.length / 2) : 0,
      uvCount: uvs ? Math.floor(uvs.length / 2) : 0,
      triangleCount: indices ? Math.floor(indices.length / 3) : 0,
      positions: summarizeNumericArray(positions),
      uvs: summarizeNumericArray(uvs),
      indices: summarizeNumericArray(indices, 12),
    } : null,
    contour: contour ? {
      closed: !!contour.closed,
      dirty: !!contour.dirty,
      fillFromMeshData: !!contour.fillFromMeshData,
      boundary: summarizePoints(contour.points),
      fill: summarizePoints(contour.fillPoints),
      fillTriangles: summarizeNumericArray(contour.fillTriangles, 12),
    } : null,
  };
}

function buildMeshCaptureDiffs(startSnapshot = null, finalSnapshot = null, timeline = []) {
  const startMesh = startSnapshot && startSnapshot.mesh;
  const finalMesh = finalSnapshot && finalSnapshot.mesh;
  if (!startMesh || !finalMesh) return [];
  const topologyCommandCount = Array.isArray(timeline) ? timeline.filter((e) => e && e.topologyCommand).length : 0;
  const add = (id, label, before, after) => ({
    id,
    label,
    changed: before !== after,
    before,
    after,
  });
  return [
    add("mesh.vertex_count_changed", "Vertex count changed", startMesh.vertexCount, finalMesh.vertexCount),
    add("mesh.triangle_count_changed", "Triangle count changed", startMesh.triangleCount, finalMesh.triangleCount),
    add("mesh.position_hash_changed", "Position hash changed", startMesh.positions && startMesh.positions.hash, finalMesh.positions && finalMesh.positions.hash),
    add("mesh.uv_hash_changed", "UV hash changed", startMesh.uvs && startMesh.uvs.hash, finalMesh.uvs && finalMesh.uvs.hash),
    add("mesh.index_hash_changed", "Index hash changed", startMesh.indices && startMesh.indices.hash, finalMesh.indices && finalMesh.indices.hash),
    add("mesh.grid_cols_changed", "Grid column metadata changed", startMesh.cols, finalMesh.cols),
    add("mesh.grid_rows_changed", "Grid row metadata changed", startMesh.rows, finalMesh.rows),
    {
      id: "capture.topology_command_count",
      label: "Topology command count",
      changed: topologyCommandCount > 0,
      before: 0,
      after: topologyCommandCount,
    },
  ];
}

function hasAICaptureGridDrag(timeline = []) {
  return Array.isArray(timeline) && timeline.some((event) => {
    const data = event && event.data || {};
    return event && event.domain === "mesh"
      && event.category === "drag"
      && data.pointSet === "fill"
      && (data.dragType === "slot_mesh_point" || data.dragType === "slot_mesh_multi_move");
  });
}

function buildAICaptureSuspicions({ timeline = [], diffs = [] } = {}) {
  const topologyCommandCount = Array.isArray(timeline) ? timeline.filter((e) => e && e.topologyCommand).length : 0;
  const changed = (id) => diffs.some((d) => d && d.id === id && d.changed);
  const suspicions = [];
  if (hasAICaptureGridDrag(timeline) && topologyCommandCount === 0
    && (changed("mesh.vertex_count_changed") || changed("mesh.uv_hash_changed") || changed("mesh.index_hash_changed"))) {
    suspicions.push({
      id: "mesh.grid_drag_changed_topology_without_command",
      severity: "warning",
      label: "Grid drag changed topology-like data without a topology command",
      evidence: {
        vertexCountChanged: changed("mesh.vertex_count_changed"),
        uvHashChanged: changed("mesh.uv_hash_changed"),
        indexHashChanged: changed("mesh.index_hash_changed"),
      },
    });
  }
  return suspicions;
}

function buildAICaptureHealth(timeline = [], captureDomain = "mesh", startSnapshot = null, finalSnapshot = null) {
  const list = Array.isArray(timeline) ? timeline : [];
  const rawEvents = list.filter((e) => e && e.category === "raw_input");
  const commandEvents = list.filter((e) => e && e.category === "command");
  const captureEvents = list.filter((e) => e && e.category === "capture");
  const semanticEvents = list.filter((e) => e && e.category !== "raw_input" && e.category !== "capture");
  const pointerEvents = rawEvents.filter((e) => String(e.intent || "").startsWith("pointer") || e.intent === "click" || e.intent === "dblclick").length;
  const keyEvents = rawEvents.filter((e) => String(e.intent || "").startsWith("key")).length;
  const durationMs = (Number(state.aiCapture.endedAt) || Date.now()) - (Number(state.aiCapture.startedAt) || Date.now());
  const startUi = startSnapshot && startSnapshot.ui || {};
  const finalUi = finalSnapshot && finalSnapshot.ui || {};
  const meshModeActive = captureDomain !== "mesh"
    || startUi.workspaceMode === "slotmesh"
    || startUi.uiPage === "slot"
    || startUi.editMode === "mesh"
    || finalUi.workspaceMode === "slotmesh"
    || finalUi.uiPage === "slot"
    || finalUi.editMode === "mesh";
  return {
    durationMs: Math.max(0, Math.round(durationMs)),
    rawEventCount: rawEvents.length,
    rawDroppedCount: Number(state.aiCapture.rawDroppedCount) || 0,
    semanticEventCount: semanticEvents.length,
    commandCount: commandEvents.length,
    captureEventCount: captureEvents.length,
    pointerEventCount: pointerEvents,
    keyEventCount: keyEvents,
    likelyUseful: rawEvents.length > 0 || semanticEvents.length > 1 || commandEvents.length > 0,
    domainModeMatches: meshModeActive,
  };
}

function buildAICaptureHealthSuspicions(captureHealth, captureDomain = "mesh") {
  const suspicions = [];
  if (!captureHealth) return suspicions;
  if (captureHealth.rawEventCount === 0 && captureHealth.durationMs > 1000) {
    suspicions.push({
      id: "capture.no_raw_input_events_recorded",
      severity: "warning",
      label: "Capture recorded no raw input events after start",
      evidence: {
        durationMs: captureHealth.durationMs,
        rawEventCount: captureHealth.rawEventCount,
        semanticEventCount: captureHealth.semanticEventCount,
        commandCount: captureHealth.commandCount,
      },
    });
  }
  if (captureHealth.rawEventCount > 0 && captureHealth.semanticEventCount <= 1 && captureHealth.commandCount === 0) {
    suspicions.push({
      id: "capture.raw_input_without_semantic_events",
      severity: "warning",
      label: "Raw input was recorded, but no semantic command or feature events were captured",
      evidence: {
        rawEventCount: captureHealth.rawEventCount,
        semanticEventCount: captureHealth.semanticEventCount,
        commandCount: captureHealth.commandCount,
      },
    });
  }
  if (captureDomain === "mesh" && !captureHealth.domainModeMatches) {
    suspicions.push({
      id: "capture.domain_mode_mismatch",
      severity: "warning",
      label: "Capture domain is mesh, but snapshots do not show Mesh edit mode",
      evidence: {
        domain: captureDomain,
        domainModeMatches: captureHealth.domainModeMatches,
      },
    });
  }
  return suspicions;
}

function runMeshCaptureInvariants(snapshot = buildMeshCaptureSnapshot(), context = {}) {
  const mesh = snapshot && snapshot.mesh;
  const checks = [];
  const add = (id, label, ok, details = {}) => checks.push({ id, label, ok: !!ok, ...details });
  if (!mesh) {
    add("mesh.active_attachment_has_mesh_data", "Active attachment has meshData", false);
    return checks;
  }
  add("mesh.active_attachment_has_mesh_data", "Active attachment has meshData", true);
  add("mesh.uv_count_matches_vertex_count", "UV count matches vertex count", mesh.uvCount === mesh.vertexCount, {
    vertexCount: mesh.vertexCount,
    uvCount: mesh.uvCount,
  });
  const indexLength = mesh.indices && Number(mesh.indices.length) || 0;
  const indexSample = mesh.indices && Array.isArray(mesh.indices.sample) ? mesh.indices.sample : [];
  const sampleInRange = indexSample.every((v) => Number(v) >= 0 && Number(v) < mesh.vertexCount);
  add("mesh.sampled_indices_in_range", "Sampled indices are in range", sampleInRange, { sampled: indexSample.length, vertexCount: mesh.vertexCount });
  add("mesh.triangle_count_nonzero", "Triangle count is nonzero", mesh.triangleCount > 0, { triangleCount: mesh.triangleCount, indexLength });
  const timeline = Array.isArray(context.timeline) ? context.timeline : [];
  const diffs = Array.isArray(context.diffs) ? context.diffs : [];
  const topologyCommandCount = timeline.filter((e) => e && e.topologyCommand).length;
  const changed = (id) => diffs.some((d) => d && d.id === id && d.changed);
  const shouldCheckTopologyPreserve = hasAICaptureGridDrag(timeline) && topologyCommandCount === 0;
  add(
    "mesh.grid_drag_preserves_topology_without_topology_command",
    "Grid drag preserves topology when no topology command ran",
    !shouldCheckTopologyPreserve || (!changed("mesh.vertex_count_changed") && !changed("mesh.uv_hash_changed") && !changed("mesh.index_hash_changed")),
    {
      skipped: !shouldCheckTopologyPreserve,
      topologyCommandCount,
      vertexCountChanged: changed("mesh.vertex_count_changed"),
      uvHashChanged: changed("mesh.uv_hash_changed"),
      indexHashChanged: changed("mesh.index_hash_changed"),
    }
  );
  return checks;
}

registerAICaptureDomain("mesh", {
  label: "Slot Mesh Editor",
  snapshot: buildMeshCaptureSnapshot,
  diff: buildMeshCaptureDiffs,
  invariants: runMeshCaptureInvariants,
  suspicions: buildAICaptureSuspicions,
  commands: [
    "mesh.tool.toggle_add_vertex",
    "mesh.edit_target.boundary",
    "mesh.edit_target.grid",
    "mesh.close_loop",
    "mesh.triangulate_preview",
    "mesh.grid_fill_preview",
    "mesh.auto_foreground_preview",
    "mesh.apply",
    "mesh.create_slot_and_apply",
    "mesh.link_edge",
    "mesh.unlink_edge",
    "mesh.reset_to_grid",
    "mesh.hotkey.toggle_add_vertex",
    "mesh.hotkey.triangulate_preview",
    "mesh.hotkey.delete_vertex",
  ],
});

function startAICapture(domain = "mesh") {
  state.aiCapture.active = true;
  state.aiCapture.domain = String(domain || "mesh");
  state.aiCapture.startedAt = Date.now();
  state.aiCapture.endedAt = 0;
  state.aiCapture.events = [];
  state.aiCapture.marks = [];
  state.aiCapture.eventSeq = 0;
  state.aiCapture.rawEventCount = 0;
  state.aiCapture.rawDroppedCount = 0;
  state.aiCapture.lastRawMoveAt = Object.create(null);
  state.aiCapture.startSnapshot = getAICaptureDomainSnapshot(domain);
  state.aiCapture.lastReportText = "";
  pushAICaptureEvent("capture_start", { domain }, { category: "capture", domain, intent: "capture_start" });
  setStatus("AI Capture started.");
  return state.aiCapture;
}

function markAICaptureIssue(label = "Issue marked") {
  if (!state.aiCapture.active) startAICapture("mesh");
  const mark = {
    t: Date.now() - (Number(state.aiCapture.startedAt) || Date.now()),
    label: String(label || "Issue marked"),
    snapshot: getAICaptureDomainSnapshot(state.aiCapture.domain || "mesh"),
  };
  state.aiCapture.marks.push(mark);
  pushAICaptureEvent("capture_mark", { label: mark.label }, {
    category: "capture",
    domain: state.aiCapture.domain || "mesh",
    intent: "capture_mark",
  });
  setStatus("AI Capture mark added.");
  return mark;
}

function formatAICaptureTargetLabel(target = {}) {
  const tag = target.tag || "unknown";
  const id = target.id ? `#${target.id}` : "";
  const text = target.text ? ` "${target.text}"` : "";
  return `${tag}${id}${text}`;
}

function buildAICaptureGestureSummary(timeline = []) {
  const gestures = [];
  let current = null;
  const raw = (Array.isArray(timeline) ? timeline : []).filter((ev) => ev && ev.category === "raw_input");
  const point = (ev) => {
    const p = ev && ev.data && ev.data.pointer || {};
    return { x: Number(p.x) || 0, y: Number(p.y) || 0, t: Number(ev.t) || 0 };
  };
  const closeCurrent = (fallbackKind = "pointer_drag") => {
    if (!current) return;
    const dx = current.end.x - current.start.x;
    const dy = current.end.y - current.start.y;
    const distance = Math.round(Math.hypot(dx, dy));
    gestures.push({
      id: `raw.gesture.${distance > 3 ? fallbackKind : "pointer_click"}`,
      kind: distance > 3 ? fallbackKind : "pointer_click",
      target: current.target,
      start: current.start,
      end: current.end,
      durationMs: Math.max(0, current.end.t - current.start.t),
      distance,
      sampleCount: current.sampleCount,
      samples: current.samples,
      ui: current.ui,
    });
    current = null;
  };
  for (const ev of raw) {
    const intent = String(ev.intent || "");
    if (intent === "pointerdown") {
      closeCurrent();
      current = {
        target: ev.data && ev.data.target || {},
        start: point(ev),
        end: point(ev),
        sampleCount: 1,
        samples: [point(ev)],
        ui: ev.data && ev.data.ui || {},
      };
      continue;
    }
    if (intent === "pointermove" && current) {
      current.end = point(ev);
      current.sampleCount += 1;
      if (current.samples.length < 5) current.samples.push(point(ev));
      continue;
    }
    if (intent === "pointerup" && current) {
      current.end = point(ev);
      current.sampleCount += 1;
      closeCurrent();
      continue;
    }
    if (intent === "click" && !current) {
      gestures.push({
        id: "raw.gesture.click",
        kind: "click",
        target: ev.data && ev.data.target || {},
        at: point(ev),
        durationMs: 0,
        distance: 0,
        sampleCount: 1,
        ui: ev.data && ev.data.ui || {},
      });
    }
  }
  closeCurrent();
  return gestures;
}

function buildAICaptureCompactMachineData(report, rawGestures = []) {
  const changedDiffs = (report.diffs || []).filter((d) => d && d.changed);
  return {
    version: 3,
    schemaVersion: 3,
    domain: report.capture && report.capture.domain,
    durationMs: report.captureHealth && report.captureHealth.durationMs,
    health: report.captureHealth,
    commandIds: (report.operationLog || []).map((op) => op.id),
    gestureCount: rawGestures.length,
    rawGestureCount: rawGestures.length,
    rawDroppedCount: report.capture && report.capture.rawDroppedCount,
    compressionRatio: report.capture && report.capture.rawEventCount
      ? Number((rawGestures.length / report.capture.rawEventCount).toFixed(3))
      : 0,
    changedDiffs,
    suspicionIds: (report.suspicions || []).map((s) => s.id),
    invariantFailures: (report.invariants || []).filter((i) => i && !i.ok).map((i) => i.id),
  };
}

function formatAICaptureSummaryReport(report, rawGestures = []) {
  const health = report.captureHealth || {};
  const startUi = report.startSnapshot && report.startSnapshot.ui || {};
  const finalUi = report.finalSnapshot && report.finalSnapshot.ui || {};
  const changedDiffs = (report.diffs || []).filter((d) => d && d.changed);
  const machineData = buildAICaptureCompactMachineData(report, rawGestures);
  const lines = [
    "AI_DEBUG_CAPTURE v3",
    "",
    "SUMMARY",
    `- Duration: ${Math.round(Number(health.durationMs) || 0)}ms`,
    `- Domain: ${report.capture && report.capture.domain || ""}`,
    `- UI: ${startUi.workspaceMode || "?"}/${startUi.editMode || "?"} -> ${finalUi.workspaceMode || "?"}/${finalUi.editMode || "?"}`,
    `- Raw input: ${report.capture && report.capture.rawEventCount || 0} events compressed into ${rawGestures.length} gestures; dropped ${report.capture && report.capture.rawDroppedCount || 0}`,
    `- Commands: ${report.capture && report.capture.commandCount || 0}`,
    `- Semantic events: ${health.semanticEventCount || 0}`,
    `- Likely useful: ${health.likelyUseful ? "yes" : "no"}`,
    "",
    "GESTURES",
  ];
  if (rawGestures.length === 0) {
    lines.push("- none");
  } else {
    rawGestures.slice(0, 20).forEach((g, index) => {
      const target = formatAICaptureTargetLabel(g.target);
      if (g.kind === "click") {
        lines.push(`${index + 1}. click ${target} at ${g.at.x},${g.at.y}`);
      } else {
        lines.push(`${index + 1}. ${g.kind} ${target} ${g.start.x},${g.start.y} -> ${g.end.x},${g.end.y}, ${g.durationMs}ms, distance ${g.distance}`);
      }
    });
    if (rawGestures.length > 20) lines.push(`- ${rawGestures.length - 20} more gestures omitted`);
  }
  lines.push("", "SUSPICIONS");
  if ((report.suspicions || []).length === 0) {
    lines.push("- none");
  } else {
    for (const s of report.suspicions || []) lines.push(`- ${s.id}: ${s.label}`);
  }
  lines.push("", "STATE_DIFF");
  if (changedDiffs.length === 0) {
    lines.push("- no tracked state diffs changed");
  } else {
    for (const d of changedDiffs) lines.push(`- ${d.id}: ${d.before} -> ${d.after}`);
  }
  lines.push("", "MACHINE_DATA", JSON.stringify(machineData));
  return lines.join("\n");
}

function buildAICaptureReport({ stop = true } = {}) {
  if (!state.aiCapture.startedAt) startAICapture("mesh");
  if (stop) {
    state.aiCapture.active = false;
    state.aiCapture.endedAt = Date.now();
  }
  const captureDomain = state.aiCapture.domain || "mesh";
  const finalSnapshot = getAICaptureDomainSnapshot(captureDomain);
  const timeline = state.aiCapture.events.slice();
  const diffs = getAICaptureDomainDiffs(captureDomain, state.aiCapture.startSnapshot, finalSnapshot, timeline);
  const captureHealth = buildAICaptureHealth(timeline, captureDomain, state.aiCapture.startSnapshot, finalSnapshot);
  const suspicions = [
    ...getAICaptureDomainSuspicions(captureDomain, { timeline, diffs, startSnapshot: state.aiCapture.startSnapshot, finalSnapshot }),
    ...buildAICaptureHealthSuspicions(captureHealth, captureDomain),
  ];
  const invariants = getAICaptureDomainInvariants(captureDomain, finalSnapshot, {
    timeline,
    diffs,
    startSnapshot: state.aiCapture.startSnapshot,
    finalSnapshot,
  });
  const operationLog = timeline
    .filter((ev) => ev && ev.category === "command")
    .map((ev) => {
      const entry = {
        seq: ev.seq,
        t: ev.t,
        id: ev.id,
        domain: ev.domain,
        intent: ev.intent,
        topologyCommand: ev.topologyCommand,
        ok: ev.ok,
      };
      if (ev.duration !== undefined) entry.duration = ev.duration;
      if (ev.error !== undefined) entry.error = ev.error;
      if (ev.reason !== undefined) entry.reason = ev.reason;
      if (ev.entity && Object.keys(ev.entity).length) entry.entity = ev.entity;
      return entry;
    });
  const rawGestures = buildAICaptureGestureSummary(timeline);
  captureHealth.rawGestureCount = rawGestures.length;
  captureHealth.compressionRatio = captureHealth.rawEventCount
    ? Number((rawGestures.length / captureHealth.rawEventCount).toFixed(3))
    : 0;
  const report = {
    version: 3,
    schemaVersion: 3,
    header: "AI_DEBUG_CAPTURE v3",
    project: "skeletal-editor",
    capture: {
      domain: captureDomain,
      startedAt: new Date(Number(state.aiCapture.startedAt) || Date.now()).toISOString(),
      endedAt: new Date(Number(state.aiCapture.endedAt) || Date.now()).toISOString(),
      eventCount: state.aiCapture.events.length,
      commandCount: operationLog.length,
      markCount: state.aiCapture.marks.length,
      rawEventCount: captureHealth.rawEventCount,
      rawDroppedCount: captureHealth.rawDroppedCount,
    },
    environment: {
      url: String(location && location.href || ""),
      viewport: { w: window.innerWidth, h: window.innerHeight },
      devicePixelRatio: Number(window.devicePixelRatio) || 1,
    },
    operationLog,
    captureHealth,
    rawGestures,
    marks: state.aiCapture.marks.slice(),
    domains: buildAICaptureDomainCoverage(timeline),
    startSnapshot: state.aiCapture.startSnapshot,
    finalSnapshot,
    diffs,
    suspicions,
    invariants,
  };
  const text = formatAICaptureSummaryReport(report, rawGestures);
  state.aiCapture.lastReportText = text;
  return text;
}

async function copyAICaptureReport() {
  const text = buildAICaptureReport({ stop: true });
  if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
    setStatus("Clipboard API unavailable. AI Capture report built in memory.");
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    setStatus("AI Capture report copied.");
    return true;
  } catch (err) {
    console.warn("AI Capture report copy failed.", err);
    setStatus("AI Capture report copy failed.");
    return false;
  }
}

window.__buildAICaptureReport = buildAICaptureReport;
window.__copyAICaptureReport = copyAICaptureReport;
window.__registerAICaptureDomain = registerAICaptureDomain;
window.__listAICaptureDomains = listAICaptureDomains;
installAICaptureRawInputRecorder();
