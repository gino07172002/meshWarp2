// ROLE: Diagnostics + introspection surface for humans and AI assistants.
// Everything lives under `window.debug` so it's discoverable from a fresh
// console without having to grep the codebase. Functions here are read-
// mostly: they observe state, never mutate it (with one exception:
// debug.clear() resets debug-owned buffers like errors/warnings).
//
// Conventions:
//   - Every function returns a plain JS value (not a string) so console
//     output is structured + filterable, and AI tooling can JSON.stringify it.
//   - Side-effect-free unless the function name says otherwise.
//   - Never throw; on missing state return `null` or {}.
//
// EXPORTS (under window.debug):
//   - snapshot()           Compact JSON-friendly view of the major state.
//   - mesh()               state.mesh detail (bones, slots, attachments).
//   - slots()              Per-slot summary (name, bone, attachments).
//   - bones()              Per-bone summary (parent, transform, color).
//   - constraints()        IK / Transform / Path / Physics counts + names.
//   - animations()         Animation list (id, name, duration, track count).
//   - errors()             Recent errors logged via debug.recordError.
//   - warnings()           Recent warnings logged via debug.recordWarning.
//   - findSlot(name)       Slot index by name.
//   - findBone(name)       Bone index by name.
//   - help()               One-screen list of available debug.* methods.
//   - clear()              Resets debug-owned buffers.
// CONSUMERS: humans typing in the browser console; AI tools generating
//   diagnostic queries; future debug-overlay UI.

(function buildDebugNamespace() {
  if (typeof window === "undefined") return;
  const MAX_BUFFER = 200;

  // Internal ring buffers. Owned only by this file; everything else
  // pushes to them via debug.recordError / debug.recordWarning.
  const errorBuf = [];
  const warningBuf = [];

  function pushBuffered(buf, entry) {
    buf.push(entry);
    if (buf.length > MAX_BUFFER) buf.splice(0, buf.length - MAX_BUFFER);
  }

  // Capture window.onerror + unhandled rejections automatically. This is
  // the floor; modules can also call debug.recordError for context-rich
  // entries (with a `code` and `where`).
  window.addEventListener("error", (ev) => {
    pushBuffered(errorBuf, {
      ts: Date.now(),
      source: "window.onerror",
      message: String(ev.message || "unknown"),
      filename: ev.filename || "",
      line: ev.lineno || 0,
      col: ev.colno || 0,
    });
  });
  window.addEventListener("unhandledrejection", (ev) => {
    pushBuffered(errorBuf, {
      ts: Date.now(),
      source: "unhandledrejection",
      message: String(ev.reason && ev.reason.message ? ev.reason.message : ev.reason || "rejection"),
      stack: ev.reason && ev.reason.stack ? String(ev.reason.stack) : "",
    });
  });

  function safeArr(v) { return Array.isArray(v) ? v : []; }

  function snapshot() {
    const m = (typeof state !== "undefined" && state.mesh) ? state.mesh : null;
    const slots = (typeof state !== "undefined") ? safeArr(state.slots) : [];
    return {
      hasMesh: !!m,
      bones: m && Array.isArray(m.rigBones) ? m.rigBones.length : 0,
      slots: slots.length,
      activeSlot: typeof state !== "undefined" ? state.activeSlot : -1,
      selectedBone: typeof state !== "undefined" ? state.selectedBone : -1,
      animations: (typeof state !== "undefined" && state.anim && Array.isArray(state.anim.animations))
        ? state.anim.animations.length : 0,
      currentAnimId: (typeof state !== "undefined" && state.anim) ? state.anim.currentAnimId : null,
      animTime: (typeof state !== "undefined" && state.anim) ? state.anim.time : 0,
      playing: (typeof state !== "undefined" && state.anim) ? !!state.anim.playing : false,
      workspace: (typeof state !== "undefined") ? {
        ws: typeof getCurrentWsType === "function" ? getCurrentWsType() : "?",
        mode: typeof getCurrentWsMode === "function" ? getCurrentWsMode() : "?",
        boneMode: typeof state !== "undefined" ? state.boneMode : "?",
      } : null,
      gl: typeof hasGL !== "undefined" ? {
        available: !!hasGL,
        webgl2: typeof isWebGL2 !== "undefined" ? !!isWebGL2 : false,
        contextLost: typeof gl !== "undefined" && gl && gl.isContextLost ? gl.isContextLost() : false,
      } : null,
      errors: errorBuf.length,
      warnings: warningBuf.length,
    };
  }

  function mesh() {
    const m = (typeof state !== "undefined" && state.mesh) ? state.mesh : null;
    if (!m) return null;
    return {
      bones: safeArr(m.rigBones).length,
      vertices: m.positions ? m.positions.length / 2 : 0,
      indices: m.indices ? m.indices.length : 0,
      ikConstraints: safeArr(m.ikConstraints).length,
      transformConstraints: safeArr(m.transformConstraints).length,
      pathConstraints: safeArr(m.pathConstraints).length,
      physicsConstraints: safeArr(m.physicsConstraints).length,
      imageWidth: typeof state !== "undefined" ? state.imageWidth : 0,
      imageHeight: typeof state !== "undefined" ? state.imageHeight : 0,
    };
  }

  function slots() {
    if (typeof state === "undefined") return [];
    return safeArr(state.slots).map((s, i) => ({
      i,
      id: s && s.id ? String(s.id) : null,
      name: s && s.name ? String(s.name) : "",
      bone: s ? Number(s.bone) : -1,
      attachments: s && Array.isArray(s.attachments) ? s.attachments.length : 0,
      activeAttachment: s ? s.activeAttachment : null,
      visible: s ? s.editorVisible !== false : true,
    }));
  }

  function bones() {
    const m = (typeof state !== "undefined" && state.mesh) ? state.mesh : null;
    if (!m || !Array.isArray(m.rigBones)) return [];
    return m.rigBones.map((b, i) => ({
      i,
      name: b && b.name ? String(b.name) : "",
      parent: b ? Number(b.parent) : -1,
      length: b ? Number(b.length) || 0 : 0,
      tx: b ? Number(b.tx) || 0 : 0,
      ty: b ? Number(b.ty) || 0 : 0,
      rot: b ? Number(b.rot) || 0 : 0,
      color: b && b.color ? String(b.color) : "",
    }));
  }

  function constraints() {
    const m = (typeof state !== "undefined" && state.mesh) ? state.mesh : null;
    if (!m) return null;
    const summarize = (list) => safeArr(list).map((c) => ({
      name: c && c.name ? String(c.name) : "",
      enabled: c ? c.enabled !== false : true,
      order: c ? Number(c.order) || 0 : 0,
    }));
    return {
      ik: summarize(m.ikConstraints),
      transform: summarize(m.transformConstraints),
      path: summarize(m.pathConstraints),
      physics: summarize(m.physicsConstraints),
    };
  }

  function animations() {
    if (typeof state === "undefined" || !state.anim) return [];
    return safeArr(state.anim.animations).map((a) => ({
      id: a && a.id ? String(a.id) : "",
      name: a && a.name ? String(a.name) : "",
      duration: a ? Number(a.duration) || 0 : 0,
      tracks: a && a.tracks ? Object.keys(a.tracks).length : 0,
    }));
  }

  function errors() { return errorBuf.slice(); }
  function warnings() { return warningBuf.slice(); }

  function findSlot(name) {
    if (typeof state === "undefined") return -1;
    return safeArr(state.slots).findIndex((s) => s && s.name === name);
  }
  function findBone(name) {
    const m = (typeof state !== "undefined" && state.mesh) ? state.mesh : null;
    if (!m || !Array.isArray(m.rigBones)) return -1;
    return m.rigBones.findIndex((b) => b && b.name === name);
  }

  function recordError(code, message, context) {
    pushBuffered(errorBuf, {
      ts: Date.now(),
      source: "manual",
      code: String(code || "unknown"),
      message: String(message || ""),
      context: context || null,
    });
  }
  function recordWarning(code, message, context) {
    pushBuffered(warningBuf, {
      ts: Date.now(),
      code: String(code || "unknown"),
      message: String(message || ""),
      context: context || null,
    });
  }

  function clear() {
    errorBuf.length = 0;
    warningBuf.length = 0;
    return { errors: 0, warnings: 0 };
  }

  function help() {
    return [
      "debug.snapshot()       — major state at a glance",
      "debug.mesh()           — current mesh stats",
      "debug.slots()          — per-slot summary",
      "debug.bones()          — per-bone summary",
      "debug.constraints()    — IK/Transform/Path/Physics summary",
      "debug.animations()     — animation list",
      "debug.errors()         — recent errors (most recent last)",
      "debug.warnings()       — recent warnings (most recent last)",
      "debug.findSlot(name)   — slot index by name",
      "debug.findBone(name)   — bone index by name",
      "debug.recordError(code, message, context?) — log an error",
      "debug.recordWarning(code, message, context?) — log a warning",
      "debug.clear()          — clear errors + warnings buffers",
      "",
      "AI tip: prefer debug.snapshot() before reasoning about state;",
      "everything else is a drill-down.",
    ].join("\n");
  }

  window.debug = {
    snapshot,
    mesh,
    slots,
    bones,
    constraints,
    animations,
    errors,
    warnings,
    findSlot,
    findBone,
    recordError,
    recordWarning,
    clear,
    help,
  };
})();
