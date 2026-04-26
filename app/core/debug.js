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
  // pushes to them via debug.recordError / debug.recordWarning /
  // debug.recordAction.
  const errorBuf = [];
  const warningBuf = [];
  const actionBuf = [];

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

  // Render-phase timing summary. Reads the renderPerf.timing ring populated
  // by canvas.js render(). Returns averages + last-frame snapshot in
  // milliseconds so AI / humans can spot which phase regresses.
  function timing() {
    if (typeof state === "undefined" || !state.renderPerf || !state.renderPerf.timing) return null;
    const t = state.renderPerf.timing;
    if (!t.ring) return null;
    const sampleCount = Math.min(t.ringIdx, t.ringSize);
    if (sampleCount === 0) return { samples: 0, last: t.lastFrame };
    let sumD = 0, sumS = 0, sumO = 0, sumT = 0;
    let maxD = 0, maxS = 0, maxO = 0, maxT = 0;
    for (let i = 0; i < sampleCount; i += 1) {
      const off = i * 4;
      const d = t.ring[off];
      const s = t.ring[off + 1];
      const o = t.ring[off + 2];
      const tt = t.ring[off + 3];
      sumD += d; sumS += s; sumO += o; sumT += tt;
      if (d > maxD) maxD = d;
      if (s > maxS) maxS = s;
      if (o > maxO) maxO = o;
      if (tt > maxT) maxT = tt;
    }
    return {
      samples: sampleCount,
      enabled: !!t.enabled,
      avg: {
        deform: +(sumD / sampleCount).toFixed(3),
        slotDraw: +(sumS / sampleCount).toFixed(3),
        overlay: +(sumO / sampleCount).toFixed(3),
        total: +(sumT / sampleCount).toFixed(3),
      },
      max: {
        deform: +maxD.toFixed(3),
        slotDraw: +maxS.toFixed(3),
        overlay: +maxO.toFixed(3),
        total: +maxT.toFixed(3),
      },
      last: {
        deform: +t.lastFrame.deform.toFixed(3),
        slotDraw: +t.lastFrame.slotDraw.toFixed(3),
        overlay: +t.lastFrame.overlay.toFixed(3),
        total: +t.lastFrame.total.toFixed(3),
      },
      // Estimated max sustainable FPS from the average total frame time;
      // useful as a quick "are we headroom-bound?" signal.
      estFps: sumT > 0 ? Math.round(1000 / (sumT / sampleCount)) : 0,
    };
  }
  function setTimingEnabled(on) {
    if (typeof state !== "undefined" && state.renderPerf && state.renderPerf.timing) {
      state.renderPerf.timing.enabled = !!on;
    }
    return !!on;
  }

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
    actionBuf.length = 0;
    return { errors: 0, warnings: 0, actions: 0 };
  }

  // Action log — appended to by setStatus + runAICaptureCommand hooks
  // (see runtime.js) and any site calling debug.recordAction directly.
  // Each entry: { ts, source, name, args?, status? }.
  // Goal: enable bug repro by reading the last 50-200 actions before a
  // glitch. Cheap (no JSON.stringify until read), capped at 200 entries.
  function recordAction(source, name, args) {
    pushBuffered(actionBuf, {
      ts: Date.now(),
      source: String(source || "manual"),
      name: String(name || ""),
      args: args == null ? null : args,
    });
  }
  function actionLog(limit) {
    const n = Number.isFinite(Number(limit)) ? Math.max(1, Math.min(MAX_BUFFER, Number(limit))) : 50;
    return actionBuf.slice(-n);
  }
  // Convenience: dump the action log as a formatted string for easy
  // copy-paste from console into a bug report.
  function actionLogText(limit) {
    const log = actionLog(limit);
    if (log.length === 0) return "(action log empty)";
    const t0 = log[0].ts;
    return log.map((e) => {
      const dt = ((e.ts - t0) / 1000).toFixed(2).padStart(7);
      const src = e.source.padEnd(10);
      const args = e.args ? " " + JSON.stringify(e.args).slice(0, 120) : "";
      return `${dt}s [${src}] ${e.name}${args}`;
    }).join("\n");
  }

  function help() {
    return [
      "debug.snapshot()       — major state at a glance",
      "debug.mesh()           — current mesh stats",
      "debug.slots()          — per-slot summary",
      "debug.bones()          — per-bone summary",
      "debug.constraints()    — IK/Transform/Path/Physics summary",
      "debug.animations()     — animation list",
      "debug.timing()         — render phase ms (deform/slotDraw/overlay/total)",
      "debug.setTimingEnabled(bool) — toggle perf timing instrumentation",
      "debug.errors()         — recent errors (most recent last)",
      "debug.warnings()       — recent warnings (most recent last)",
      "debug.actionLog(n=50)  — recent actions (status / commands / manual)",
      "debug.actionLogText(n) — same, formatted for copy-paste",
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
    timing,
    setTimingEnabled,
    errors,
    warnings,
    actionLog,
    actionLogText,
    findSlot,
    findBone,
    recordError,
    recordWarning,
    recordAction,
    clear,
    help,
  };
})();
