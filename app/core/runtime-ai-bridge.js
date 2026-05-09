// ROLE: AI agent façade. Exposes window.ai with a uniform tool surface
// auto-generated from the existing command palette + AI Capture domain
// registry, so every command Claude/MCP/Playwright can already trigger
// from the UI is reachable as a JSON-friendly tool. New palette entries
// are picked up automatically — no dual registry to maintain.
//
// Loaded after runtime.js, runtime-ai-capture.js and debug.js so all
// three are available when window.ai is built.
//
// EXPORTS (under window.ai):
//   tools(opts?)            -> ToolSpec[]   JSON-schema list of every callable
//   invoke(id, args?)       -> Promise<{ok, id, durationMs, result?, error?, before?, after?}>
//   query(domain?)          -> snapshot(s) from debug.* + AI Capture domains
//   diff(domain, before)    -> changes between a captured snapshot and now
//   invariants(domain?)     -> issues from registered domain invariants()
//   help()                  -> { tools, queries, examples }
//   waitFor(predicateName, opts?) -> Promise that resolves when the named
//                              ready-signal fires (e.g. "render", "idle").

(function buildAIBridge() {
  if (typeof window === "undefined") return;
  if (window.ai && window.ai.__installed) return;

  // -- Argument schemas for palette commands that need them ----------------
  // Most palette commands are no-arg (just trigger a button). Any command
  // that wants to accept structured args from AI declares its schema here,
  // keyed by command id. The action receives the resolved args object.
  const ARG_SCHEMAS = {
    "ai.select_slot": {
      args: [
        { name: "name", type: "string", required: false, description: "Slot name to activate" },
        { name: "index", type: "integer", required: false, description: "Slot index, alternative to name" },
      ],
    },
    "ai.select_bone": {
      args: [
        { name: "name", type: "string", required: false, description: "Bone name to select" },
        { name: "index", type: "integer", required: false, description: "Bone index, alternative to name" },
      ],
    },
    "ai.set_animation_time": {
      args: [
        { name: "time", type: "number", required: true, description: "Animation time in seconds" },
      ],
    },
    "ai.set_active_animation": {
      args: [
        { name: "name", type: "string", required: false, description: "Animation name" },
        { name: "index", type: "integer", required: false, description: "Animation index, alternative to name" },
      ],
    },
    "ai.import_image": {
      args: [
        { name: "dataUrl", type: "string", required: false, description: "Image as data: URL (preferred for headless)" },
        { name: "url", type: "string", required: false, description: "HTTP(S) URL to fetch" },
        { name: "name", type: "string", required: false, description: "File name; default 'image.png'" },
      ],
    },
    "ai.load_project": {
      args: [
        { name: "json", type: "object", required: false, description: "Project payload object" },
        { name: "jsonString", type: "string", required: false, description: "Project payload as JSON string" },
      ],
    },
    "ai.image_load": {
      args: [
        { name: "dataUrl", type: "string", required: true, description: "Image as data: URL" },
        { name: "name", type: "string", required: false, description: "Optional image name" },
      ],
    },
    "ai.image_crop": {
      args: [
        { name: "x", type: "number", required: true },
        { name: "y", type: "number", required: true },
        { name: "w", type: "number", required: true },
        { name: "h", type: "number", required: true },
      ],
    },
    "ai.image_rotate": {
      args: [
        { name: "degrees", type: "number", required: true, description: "Rotation in degrees, rounded to nearest 90" },
      ],
    },
    "ai.image_flip": {
      args: [
        { name: "axis", type: "string", required: true, description: "'x'/'horizontal' or 'y'/'vertical'" },
      ],
    },
    "ai.image_scale": {
      args: [
        { name: "width", type: "number", required: false },
        { name: "height", type: "number", required: false },
        { name: "factor", type: "number", required: false },
      ],
    },
    "ai.image_remove_bg": {
      args: [
        { name: "threshold", type: "number", required: false },
        { name: "feather", type: "number", required: false },
      ],
    },
    "ai.image_trim": {
      args: [],
    },
    "ai.image_send_to_new_slot": {
      args: [],
    },
    "ai.image_apply_to_attachment": {
      args: [],
    },
    "ai.image_export_png": {
      args: [],
    },
    "ai.screenshot": {
      args: [
        { name: "format", type: "string", required: false, description: "'png' (default) or 'jpeg'" },
      ],
    },
    "ai.export_animation_frame": {
      args: [
        { name: "time", type: "number", required: true, description: "Animation time in seconds" },
        { name: "format", type: "string", required: false, description: "'png' (default) or 'jpeg'" },
      ],
    },
    "ai.puppetwarp_enable": {
      args: [
        { name: "slotIndex", type: "integer", required: false },
        { name: "slotName", type: "string", required: false },
        { name: "mode", type: "string", required: false, description: "'standalone' (default) or 'post_skin'" },
      ],
    },
    "ai.puppetwarp_disable": {
      args: [
        { name: "slotIndex", type: "integer", required: false },
        { name: "slotName", type: "string", required: false },
      ],
    },
    "ai.puppetwarp_add_pin": {
      args: [
        { name: "slotIndex", type: "integer", required: false },
        { name: "slotName", type: "string", required: false },
        { name: "vertexIndex", type: "integer", required: true },
        { name: "label", type: "string", required: false },
      ],
    },
    "ai.puppetwarp_remove_pin": {
      args: [
        { name: "slotIndex", type: "integer", required: false },
        { name: "slotName", type: "string", required: false },
        { name: "pinId", type: "string", required: true },
      ],
    },
    "ai.puppetwarp_drag_pin": {
      args: [
        { name: "slotIndex", type: "integer", required: false },
        { name: "slotName", type: "string", required: false },
        { name: "pinId", type: "string", required: true },
        { name: "x", type: "number", required: true },
        { name: "y", type: "number", required: true },
        { name: "commit", type: "boolean", required: false, description: "If true, calls commitDrag (undo checkpoint)" },
      ],
    },
    "ai.puppetwarp_get_state": {
      args: [
        { name: "slotIndex", type: "integer", required: false },
        { name: "slotName", type: "string", required: false },
      ],
    },
    "ai.puppetwarp_set_pin_keyframe": {
      args: [
        { name: "slotIndex", type: "integer", required: false },
        { name: "slotName", type: "string", required: false },
        { name: "pinId", type: "string", required: true },
        { name: "time", type: "number", required: true },
        { name: "x", type: "number", required: false, description: "Absolute slot-local X (for standalone or legacy)" },
        { name: "y", type: "number", required: false, description: "Absolute slot-local Y" },
        { name: "dx", type: "number", required: false, description: "Skinned-relative dX (for post_skin adaptive)" },
        { name: "dy", type: "number", required: false, description: "Skinned-relative dY" },
      ],
    },
    "ai.puppetwarp_delete_pin_keyframe": {
      args: [
        { name: "slotIndex", type: "integer", required: false },
        { name: "slotName", type: "string", required: false },
        { name: "pinId", type: "string", required: true },
        { name: "time", type: "number", required: true },
      ],
    },
    "ai.puppetwarp_list_pin_keyframes": {
      args: [
        { name: "slotIndex", type: "integer", required: false },
        { name: "slotName", type: "string", required: false },
        { name: "pinId", type: "string", required: false, description: "Optional: list keys for one pin only" },
      ],
    },
  };

  // -- Lightweight write-side commands the AI bridge owns directly ---------
  // These wrap state mutations in pushUndoCheckpoint + runAICaptureCommand
  // and become tools alongside the palette items. They live here (not in
  // buildCommandPaletteItems) because they take args, while the palette is
  // designed for keyboard-trigger UX.
  function aiSelectSlot(args) {
    const slots = Array.isArray(state.slots) ? state.slots : [];
    let idx = -1;
    if (Number.isFinite(args.index)) idx = Math.trunc(args.index);
    else if (typeof args.name === "string") {
      idx = slots.findIndex((s) => s && s.name === args.name);
    }
    if (idx < 0 || idx >= slots.length) {
      return { ok: false, error: `slot not found (name=${args.name}, index=${args.index})` };
    }
    state.activeSlot = idx;
    if (typeof refreshSlotUI === "function") refreshSlotUI();
    if (typeof renderBoneTree === "function") renderBoneTree();
    if (typeof requestRender === "function") requestRender("ai.select_slot");
    return { ok: true, activeSlot: idx, name: slots[idx].name };
  }

  function aiSelectBone(args) {
    const m = state.mesh;
    const bones = m && Array.isArray(m.rigBones) ? m.rigBones : [];
    let idx = -1;
    if (Number.isFinite(args.index)) idx = Math.trunc(args.index);
    else if (typeof args.name === "string") idx = bones.findIndex((b) => b && b.name === args.name);
    if (idx < 0 || idx >= bones.length) {
      return { ok: false, error: `bone not found (name=${args.name}, index=${args.index})` };
    }
    state.selectedBone = idx;
    if (typeof updateBoneUI === "function") updateBoneUI();
    if (typeof requestRender === "function") requestRender("ai.select_bone");
    return { ok: true, selectedBone: idx, name: bones[idx].name };
  }

  function aiSetAnimationTime(args) {
    if (!state.anim) return { ok: false, error: "no animation state" };
    const t = Number(args.time);
    if (!Number.isFinite(t)) return { ok: false, error: "time must be a finite number" };
    state.anim.time = Math.max(0, t);
    if (state.mesh && typeof samplePoseAtTime === "function") {
      samplePoseAtTime(state.mesh, state.anim.time);
    }
    if (typeof requestRender === "function") requestRender("ai.set_animation_time");
    return { ok: true, time: state.anim.time };
  }

  function aiSetActiveAnimation(args) {
    if (!state.anim) return { ok: false, error: "no animation state" };
    const list = Array.isArray(state.anim.animations) ? state.anim.animations : [];
    let pick = null;
    if (Number.isFinite(args.index)) pick = list[Math.trunc(args.index)] || null;
    else if (typeof args.name === "string") pick = list.find((a) => a && a.name === args.name) || null;
    if (!pick) return { ok: false, error: `animation not found (name=${args.name}, index=${args.index})` };
    state.anim.currentAnimId = pick.id;
    if (typeof requestRender === "function") requestRender("ai.set_active_animation");
    return { ok: true, currentAnimId: pick.id, name: pick.name };
  }

  // -- Headless I/O commands ----------------------------------------------
  function dataUrlToBlob(dataUrl) {
    const m = /^data:([^;,]+)(?:;base64)?,(.*)$/.exec(String(dataUrl || ""));
    if (!m) throw new Error("invalid data URL");
    const mime = m[1] || "application/octet-stream";
    const isBase64 = /;base64,/.test(dataUrl);
    const body = isBase64 ? atob(m[2]) : decodeURIComponent(m[2]);
    const bytes = new Uint8Array(body.length);
    for (let i = 0; i < body.length; i += 1) bytes[i] = body.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  }

  async function aiImportImage(args) {
    if (typeof loadFileSlots !== "function") return { ok: false, error: "loadFileSlots unavailable" };
    let blob = null;
    let name = args.name && typeof args.name === "string" ? args.name : "image.png";
    if (args.dataUrl) {
      try { blob = dataUrlToBlob(args.dataUrl); } catch (e) { return { ok: false, error: e.message }; }
    } else if (args.url) {
      try {
        const resp = await fetch(args.url);
        if (!resp.ok) return { ok: false, error: `fetch failed: ${resp.status}` };
        blob = await resp.blob();
      } catch (e) { return { ok: false, error: `fetch failed: ${e.message}` }; }
    } else {
      return { ok: false, error: "provide dataUrl or url" };
    }
    const file = new File([blob], name, { type: blob.type || "image/png" });
    const slots = await loadFileSlots(file);
    let added = 0;
    for (const s of slots) {
      const wasEmpty = state.slots.length === 0;
      addSlotEntry(s, true);
      added += 1;
      if (wasEmpty) {
        const first = state.slots[state.activeSlot];
        if (first) {
          if (typeof syncSourceCanvasToActiveAttachment === "function") syncSourceCanvasToActiveAttachment(first);
          if (typeof rebuildMesh === "function") rebuildMesh();
        }
      }
    }
    if (state.mesh && typeof ensureSlotsHaveBoneBinding === "function") ensureSlotsHaveBoneBinding();
    if (typeof updateBoneUI === "function") updateBoneUI();
    if (typeof updateWorkspaceUI === "function") updateWorkspaceUI();
    if (typeof requestRender === "function") requestRender("ai.import_image");
    return { ok: true, addedSlots: added, totalSlots: state.slots.length, activeSlot: state.activeSlot };
  }

  function requireImageWorkspace() {
    if (!window.ImageWorkspace) return { ok: false, error: "ImageWorkspace unavailable" };
    const canvas = window.ImageWorkspace.getWorkCanvas();
    if (!canvas) return { ok: false, error: "no image loaded" };
    return { ok: true, canvas };
  }

  async function aiImageLoad(args) {
    if (!window.ImageWorkspace) return { ok: false, error: "ImageWorkspace unavailable" };
    let blob = null;
    try { blob = dataUrlToBlob(args.dataUrl); } catch (e) { return { ok: false, error: e.message }; }
    if (typeof applyWorkspace === "function") applyWorkspace("image", "edit");
    const ok = await window.ImageWorkspace.loadFromBlob(blob, "file");
    const canvas = window.ImageWorkspace.getWorkCanvas();
    return {
      ok: !!ok,
      width: canvas ? canvas.width : 0,
      height: canvas ? canvas.height : 0,
      name: args.name || "",
    };
  }

  function aiImageReplace(next, op, params) {
    if (!next) return { ok: false, error: "operation returned no canvas" };
    window.ImageWorkspace.replaceWorkCanvas(next, op, params || null);
    return { ok: true, width: next.width, height: next.height, op };
  }

  function aiImageCrop(args) {
    const r = requireImageWorkspace();
    if (!r.ok) return r;
    if (!window.ImageOps) return { ok: false, error: "ImageOps unavailable" };
    const rect = { x: Number(args.x), y: Number(args.y), w: Number(args.w), h: Number(args.h) };
    return aiImageReplace(window.ImageOps.crop(r.canvas, rect), "crop", rect);
  }

  function aiImageRotate(args) {
    const r = requireImageWorkspace();
    if (!r.ok) return r;
    if (!window.ImageOps) return { ok: false, error: "ImageOps unavailable" };
    const degrees = Number(args.degrees);
    return aiImageReplace(window.ImageOps.rotate(r.canvas, degrees), `rotate ${degrees}`, { degrees });
  }

  function aiImageFlip(args) {
    const r = requireImageWorkspace();
    if (!r.ok) return r;
    if (!window.ImageOps) return { ok: false, error: "ImageOps unavailable" };
    const axis = String(args.axis || "x");
    const op = axis === "y" || axis === "vertical" ? "flip vertical" : "flip horizontal";
    return aiImageReplace(window.ImageOps.flip(r.canvas, axis), op, { axis });
  }

  function aiImageScale(args) {
    const r = requireImageWorkspace();
    if (!r.ok) return r;
    if (!window.ImageOps) return { ok: false, error: "ImageOps unavailable" };
    const opts = {};
    if (Number.isFinite(Number(args.width))) opts.width = Number(args.width);
    if (Number.isFinite(Number(args.height))) opts.height = Number(args.height);
    if (Number.isFinite(Number(args.factor))) opts.factor = Number(args.factor);
    return aiImageReplace(window.ImageOps.scale(r.canvas, opts), "scale", opts);
  }

  async function aiImageRemoveBg(args) {
    const r = requireImageWorkspace();
    if (!r.ok) return r;
    if (!window.ImageBgRemoval) return { ok: false, error: "ImageBgRemoval unavailable" };
    const opts = {};
    if (Number.isFinite(Number(args.threshold))) opts.threshold = Number(args.threshold);
    if (Number.isFinite(Number(args.feather))) opts.feather = Number(args.feather);
    const next = await window.ImageBgRemoval.removeBackground(r.canvas, opts);
    return aiImageReplace(next, "remove background", opts);
  }

  function aiImageTrim() {
    const r = requireImageWorkspace();
    if (!r.ok) return r;
    if (!window.ImageOps) return { ok: false, error: "ImageOps unavailable" };
    const next = window.ImageOps.trimTransparency(r.canvas);
    if (!next) return { ok: false, error: "Trim produced no result (image may be fully opaque)" };
    return aiImageReplace(next, "trim transparency", {});
  }

  function aiImageSendToNewSlot() {
    if (!window.ImageIO || typeof window.ImageIO.sendToNewSlot !== "function") {
      return { ok: false, error: "ImageIO.sendToNewSlot unavailable" };
    }
    const result = window.ImageIO.sendToNewSlot();
    return { ok: !!result };
  }

  function aiImageApplyToAttachment() {
    if (!window.ImageIO || typeof window.ImageIO.applyToAttachment !== "function") {
      return { ok: false, error: "ImageIO.applyToAttachment unavailable" };
    }
    return { ok: !!window.ImageIO.applyToAttachment() };
  }

  function aiImageExportPng() {
    const r = requireImageWorkspace();
    if (!r.ok) return r;
    return {
      ok: true,
      dataUrl: r.canvas.toDataURL("image/png"),
      width: r.canvas.width,
      height: r.canvas.height,
    };
  }

  function aiExportSpineJson() {
    if (typeof buildSpineJsonData !== "function") return { ok: false, error: "buildSpineJsonData unavailable" };
    try {
      const built = buildSpineJsonData();
      // buildSpineJsonData returns an envelope; the actual Spine JSON is .json.
      // Older callers expect the whole envelope, so return both for compat.
      const data = built && built.json ? built.json : built;
      return { ok: true, data };
    } catch (e) {
      return { ok: false, error: e && e.message || String(e) };
    }
  }

  function aiExportProjectJson() {
    if (typeof buildProjectPayload !== "function") return { ok: false, error: "buildProjectPayload unavailable" };
    try {
      const data = buildProjectPayload();
      return { ok: true, data };
    } catch (e) {
      return { ok: false, error: e && e.message || String(e) };
    }
  }

  async function aiLoadProject(args) {
    if (typeof handleProjectLoadInputChange !== "function") return { ok: false, error: "load handler unavailable" };
    let payload = null;
    if (args && typeof args.json === "object" && args.json !== null) payload = args.json;
    else if (args && typeof args.jsonString === "string") {
      try { payload = JSON.parse(args.jsonString); } catch (e) { return { ok: false, error: "jsonString is not valid JSON" }; }
    } else {
      return { ok: false, error: "provide json or jsonString" };
    }
    const text = JSON.stringify(payload);
    const file = new File([text], "project.json", { type: "application/json" });
    const fakeInput = { files: [file], value: "" };
    try {
      await handleProjectLoadInputChange({ target: fakeInput });
    } catch (e) {
      return { ok: false, error: e && e.message || String(e) };
    }
    if (typeof requestRender === "function") requestRender("ai.load_project");
    return { ok: true, slots: state.slots ? state.slots.length : 0, hasMesh: !!state.mesh };
  }

  function captureCompositeCanvas() {
    // Force a synchronous render so the back-buffer contains the latest frame,
    // then composite both layers (WebGL slots + 2D overlay) onto a fresh
    // canvas. WebGL preserveDrawingBuffer may be off, so we render directly
    // before reading.
    if (typeof render === "function") {
      try { render(); } catch (_) { /* tolerate */ }
    }
    const overlay = els && els.overlay;
    const glCanvas = els && els.gl;
    const w = (overlay && overlay.width) || (glCanvas && glCanvas.width) || 512;
    const h = (overlay && overlay.height) || (glCanvas && glCanvas.height) || 512;
    const out = document.createElement("canvas");
    out.width = w;
    out.height = h;
    const ctx = out.getContext("2d");
    if (glCanvas) {
      try { ctx.drawImage(glCanvas, 0, 0, w, h); } catch (_) { /* GL canvas may need preserveDrawingBuffer */ }
    }
    if (overlay && overlay !== glCanvas) {
      try { ctx.drawImage(overlay, 0, 0, w, h); } catch (_) { /* tolerate */ }
    }
    return out;
  }

  function aiScreenshot(args) {
    const format = (args && args.format === "jpeg") ? "image/jpeg" : "image/png";
    const c = captureCompositeCanvas();
    const dataUrl = c.toDataURL(format);
    return { ok: true, format, width: c.width, height: c.height, dataUrl };
  }

  // -- Puppet warp -----------------------------------------------------------
  function resolveSlotAndAttachment(args) {
    const slots = Array.isArray(state.slots) ? state.slots : [];
    let idx = -1;
    if (Number.isFinite(args.slotIndex)) idx = Math.trunc(args.slotIndex);
    else if (typeof args.slotName === "string") idx = slots.findIndex((s) => s && s.name === args.slotName);
    else idx = state.activeSlot;
    if (idx < 0 || idx >= slots.length) return { ok: false, error: `slot not found (slotIndex=${args.slotIndex}, slotName=${args.slotName})` };
    const slot = slots[idx];
    const att = (typeof getActiveAttachment === "function") ? getActiveAttachment(slot) : null;
    if (!att) return { ok: false, error: "no active attachment on slot" };
    if (!att.meshData) return { ok: false, error: "attachment has no mesh data" };
    return { ok: true, slot, att, slotIndex: idx };
  }

  function aiPuppetWarpEnable(args) {
    if (!window.PuppetWarpRuntime) return { ok: false, error: "PuppetWarpRuntime not loaded" };
    const r = resolveSlotAndAttachment(args);
    if (!r.ok) return r;
    const pw = window.PuppetWarpRuntime.enableForAttachment(r.att, args.mode);
    if (typeof requestRender === "function") requestRender("ai.puppetwarp_enable");
    return { ok: true, slotIndex: r.slotIndex, mode: pw.mode, pinCount: pw.pins.length };
  }

  function aiPuppetWarpDisable(args) {
    if (!window.PuppetWarpRuntime) return { ok: false, error: "PuppetWarpRuntime not loaded" };
    const r = resolveSlotAndAttachment(args);
    if (!r.ok) return r;
    window.PuppetWarpRuntime.disableForAttachment(r.att, r.slotIndex);
    if (typeof requestRender === "function") requestRender("ai.puppetwarp_disable");
    return { ok: true, slotIndex: r.slotIndex };
  }

  function aiPuppetWarpAddPin(args) {
    if (!window.PuppetWarpRuntime) return { ok: false, error: "PuppetWarpRuntime not loaded" };
    const r = resolveSlotAndAttachment(args);
    if (!r.ok) return r;
    const pin = window.PuppetWarpRuntime.addPin(r.att, args.vertexIndex, args.label);
    if (!pin) return { ok: false, error: "addPin failed (duplicate or out-of-range vertexIndex?)" };
    if (typeof requestRender === "function") requestRender("ai.puppetwarp_add_pin");
    return { ok: true, slotIndex: r.slotIndex, pin };
  }

  function aiPuppetWarpRemovePin(args) {
    if (!window.PuppetWarpRuntime) return { ok: false, error: "PuppetWarpRuntime not loaded" };
    const r = resolveSlotAndAttachment(args);
    if (!r.ok) return r;
    const removed = window.PuppetWarpRuntime.removePin(r.att, args.pinId, r.slotIndex);
    if (!removed) return { ok: false, error: `pin not found: ${args.pinId}` };
    if (typeof requestRender === "function") requestRender("ai.puppetwarp_remove_pin");
    return { ok: true, slotIndex: r.slotIndex, pinId: args.pinId };
  }

  function aiPuppetWarpDragPin(args) {
    if (!window.PuppetWarpRuntime) return { ok: false, error: "PuppetWarpRuntime not loaded" };
    const r = resolveSlotAndAttachment(args);
    if (!r.ok) return r;
    const ok = window.PuppetWarpRuntime.dragPin(r.slot, r.att, args.pinId, args.x, args.y);
    if (!ok) return { ok: false, error: "dragPin failed (no pin or solver error)" };
    if (args.commit) window.PuppetWarpRuntime.commitDrag(r.slot, r.att, args.pinId);
    if (typeof requestRender === "function") requestRender("ai.puppetwarp_drag_pin");
    return { ok: true, slotIndex: r.slotIndex, pinId: args.pinId, target: { x: args.x, y: args.y } };
  }

  function aiPuppetWarpSetPinKeyframe(args) {
    if (typeof writePuppetPinKeyframe !== "function") return { ok: false, error: "writePuppetPinKeyframe unavailable" };
    const r = resolveSlotAndAttachment(args);
    if (!r.ok) return r;
    const pin = r.att.puppetWarp ? r.att.puppetWarp.pins.find((p) => p.id === args.pinId) : null;
    if (!pin) return { ok: false, error: `pin not found: ${args.pinId}` };
    let value;
    if (typeof args.dx === "number" && typeof args.dy === "number") {
      value = { dx: args.dx, dy: args.dy };
    } else if (typeof args.x === "number" && typeof args.y === "number") {
      value = { x: args.x, y: args.y };
    } else {
      return { ok: false, error: "must provide either (x, y) or (dx, dy)" };
    }
    const trackId = writePuppetPinKeyframe(r.slotIndex, r.att.name, args.pinId, args.time, value);
    if (!trackId) return { ok: false, error: "no current animation" };
    return { ok: true, trackId, time: args.time, value };
  }

  function aiPuppetWarpDeletePinKeyframe(args) {
    if (typeof deletePuppetPinKeyframe !== "function") return { ok: false, error: "deletePuppetPinKeyframe unavailable" };
    const r = resolveSlotAndAttachment(args);
    if (!r.ok) return r;
    const ok = deletePuppetPinKeyframe(r.slotIndex, r.att.name, args.pinId, args.time);
    if (!ok) return { ok: false, error: "no keyframe to delete at that time" };
    return { ok: true };
  }

  function aiPuppetWarpListPinKeyframes(args) {
    const r = resolveSlotAndAttachment(args);
    if (!r.ok) return r;
    if (!r.att.puppetWarp) return { ok: true, tracks: [] };
    if (typeof getCurrentAnimation !== "function") return { ok: false, error: "no animation" };
    const anim = getCurrentAnimation();
    if (!anim) return { ok: true, tracks: [] };
    const out = [];
    const pins = args.pinId ? r.att.puppetWarp.pins.filter((p) => p.id === args.pinId) : r.att.puppetWarp.pins;
    for (const pin of pins) {
      const trackId = getPuppetPinTrackId(r.slotIndex, r.att.name, pin.id);
      const keys = anim.tracks[trackId] || [];
      out.push({
        pinId: pin.id,
        trackId,
        keyframes: keys.map((k) => ({ time: Number(k.time) || 0, value: k.value || {} })),
      });
    }
    return { ok: true, tracks: out };
  }

  function aiPuppetWarpGetState(args) {
    const r = resolveSlotAndAttachment(args);
    if (!r.ok) return r;
    const pw = r.att.puppetWarp;
    if (!pw) return { ok: true, slotIndex: r.slotIndex, enabled: false };
    return {
      ok: true,
      slotIndex: r.slotIndex,
      enabled: true,
      mode: pw.mode,
      pinCount: pw.pins.length,
      pins: pw.pins.map((p) => ({ id: p.id, vertexIndex: p.vertexIndex, restX: p.restX, restY: p.restY, label: p.label })),
      lastTargets: pw.lastTargets || null,
      bake: pw.bake,
    };
  }

  function aiExportAnimationFrame(args) {
    const t = Number(args && args.time);
    if (!Number.isFinite(t)) return { ok: false, error: "time must be a number" };
    if (state.anim) state.anim.time = Math.max(0, t);
    if (state.mesh && typeof samplePoseAtTime === "function") {
      try { samplePoseAtTime(state.mesh, state.anim.time); } catch (e) { return { ok: false, error: e.message }; }
    }
    return aiScreenshot({ format: args && args.format });
  }

  const BRIDGE_OWNED_COMMANDS = [
    {
      id: "ai.select_slot",
      label: "AI: Select Slot",
      group: "AI",
      domain: "attachment",
      action: aiSelectSlot,
      mutates: true,
    },
    {
      id: "ai.select_bone",
      label: "AI: Select Bone",
      group: "AI",
      domain: "bone",
      action: aiSelectBone,
      mutates: true,
    },
    {
      id: "ai.set_animation_time",
      label: "AI: Set Animation Time",
      group: "AI",
      domain: "timeline",
      action: aiSetAnimationTime,
      mutates: true,
    },
    {
      id: "ai.set_active_animation",
      label: "AI: Set Active Animation",
      group: "AI",
      domain: "timeline",
      action: aiSetActiveAnimation,
      mutates: true,
    },
    {
      id: "ai.import_image",
      label: "AI: Import Image (headless)",
      group: "AI",
      domain: "io",
      action: aiImportImage,
      mutates: true,
    },
    {
      id: "ai.image_load",
      label: "AI: Image Workspace - Load Image",
      group: "AI",
      domain: "image",
      action: aiImageLoad,
      mutates: true,
    },
    {
      id: "ai.image_crop",
      label: "AI: Image Workspace - Crop",
      group: "AI",
      domain: "image",
      action: aiImageCrop,
      mutates: true,
    },
    {
      id: "ai.image_rotate",
      label: "AI: Image Workspace - Rotate",
      group: "AI",
      domain: "image",
      action: aiImageRotate,
      mutates: true,
    },
    {
      id: "ai.image_flip",
      label: "AI: Image Workspace - Flip",
      group: "AI",
      domain: "image",
      action: aiImageFlip,
      mutates: true,
    },
    {
      id: "ai.image_scale",
      label: "AI: Image Workspace - Scale",
      group: "AI",
      domain: "image",
      action: aiImageScale,
      mutates: true,
    },
    {
      id: "ai.image_remove_bg",
      label: "AI: Image Workspace - Remove Background",
      group: "AI",
      domain: "image",
      action: aiImageRemoveBg,
      mutates: true,
    },
    {
      id: "ai.image_trim",
      label: "AI: Image Workspace - Trim Transparency",
      group: "AI",
      domain: "image",
      action: aiImageTrim,
      mutates: true,
    },
    {
      id: "ai.image_send_to_new_slot",
      label: "AI: Image Workspace - Send to New Slot",
      group: "AI",
      domain: "image",
      action: aiImageSendToNewSlot,
      mutates: true,
    },
    {
      id: "ai.image_apply_to_attachment",
      label: "AI: Image Workspace - Apply to Attachment",
      group: "AI",
      domain: "image",
      action: aiImageApplyToAttachment,
      mutates: true,
    },
    {
      id: "ai.image_export_png",
      label: "AI: Image Workspace - Export PNG",
      group: "AI",
      domain: "image",
      action: aiImageExportPng,
      mutates: false,
    },
    {
      id: "ai.export_spine_json",
      label: "AI: Export Spine JSON (headless)",
      group: "AI",
      domain: "io",
      action: () => aiExportSpineJson(),
      mutates: false,
    },
    {
      id: "ai.export_project_json",
      label: "AI: Export Project JSON (headless)",
      group: "AI",
      domain: "io",
      action: () => aiExportProjectJson(),
      mutates: false,
    },
    {
      id: "ai.load_project",
      label: "AI: Load Project (headless)",
      group: "AI",
      domain: "io",
      action: aiLoadProject,
      mutates: true,
    },
    {
      id: "ai.screenshot",
      label: "AI: Screenshot (composite)",
      group: "AI",
      domain: "view",
      action: aiScreenshot,
      mutates: false,
    },
    {
      id: "ai.export_animation_frame",
      label: "AI: Export Animation Frame",
      group: "AI",
      domain: "timeline",
      action: aiExportAnimationFrame,
      mutates: false,
    },
    {
      id: "ai.puppetwarp_enable",
      label: "AI: Puppet Warp - Enable on Attachment",
      group: "AI",
      domain: "mesh",
      action: aiPuppetWarpEnable,
      mutates: true,
    },
    {
      id: "ai.puppetwarp_disable",
      label: "AI: Puppet Warp - Disable",
      group: "AI",
      domain: "mesh",
      action: aiPuppetWarpDisable,
      mutates: true,
    },
    {
      id: "ai.puppetwarp_add_pin",
      label: "AI: Puppet Warp - Add Pin",
      group: "AI",
      domain: "mesh",
      action: aiPuppetWarpAddPin,
      mutates: true,
    },
    {
      id: "ai.puppetwarp_remove_pin",
      label: "AI: Puppet Warp - Remove Pin",
      group: "AI",
      domain: "mesh",
      action: aiPuppetWarpRemovePin,
      mutates: true,
    },
    {
      id: "ai.puppetwarp_drag_pin",
      label: "AI: Puppet Warp - Drag Pin",
      group: "AI",
      domain: "mesh",
      action: aiPuppetWarpDragPin,
      mutates: false,
    },
    {
      id: "ai.puppetwarp_get_state",
      label: "AI: Puppet Warp - Get State",
      group: "AI",
      domain: "mesh",
      action: aiPuppetWarpGetState,
      mutates: false,
    },
    {
      id: "ai.puppetwarp_set_pin_keyframe",
      label: "AI: Puppet Warp - Set Pin Keyframe",
      group: "AI",
      domain: "timeline",
      action: aiPuppetWarpSetPinKeyframe,
      mutates: true,
    },
    {
      id: "ai.puppetwarp_delete_pin_keyframe",
      label: "AI: Puppet Warp - Delete Pin Keyframe",
      group: "AI",
      domain: "timeline",
      action: aiPuppetWarpDeletePinKeyframe,
      mutates: true,
    },
    {
      id: "ai.puppetwarp_list_pin_keyframes",
      label: "AI: Puppet Warp - List Pin Keyframes",
      group: "AI",
      domain: "timeline",
      action: aiPuppetWarpListPinKeyframes,
      mutates: false,
    },
  ];

  // -- Tool catalog assembly ----------------------------------------------
  function paletteSafeBuild() {
    if (typeof buildCommandPaletteItems !== "function") return [];
    try { return buildCommandPaletteItems() || []; } catch (e) { return []; }
  }

  function inferDomain(id) {
    const s = String(id || "");
    if (s.startsWith("file.")) return "io";
    if (s.startsWith("edit.")) return "app";
    if (s.startsWith("mode.")) return "app";
    if (s.startsWith("view.")) return "view";
    if (s.startsWith("play.") || s.startsWith("key.") || s.startsWith("onion.") || s.startsWith("batch.")) return "timeline";
    if (s.startsWith("diag.")) return "diagnostics";
    if (s.startsWith("ai.")) return "ai";
    return "app";
  }

  function tools(opts = {}) {
    const filterDomain = opts && opts.domain ? String(opts.domain) : "";
    const out = [];

    for (const item of paletteSafeBuild()) {
      const id = String(item.id || "");
      if (!id) continue;
      const domain = inferDomain(id);
      if (filterDomain && filterDomain !== domain) continue;
      const schema = ARG_SCHEMAS[id] || { args: [] };
      out.push({
        id,
        label: item.label || id,
        group: item.group || "",
        hotkey: item.hotkey || "",
        domain,
        source: "palette",
        args: schema.args.slice(),
      });
    }

    for (const cmd of BRIDGE_OWNED_COMMANDS) {
      if (filterDomain && filterDomain !== cmd.domain) continue;
      const schema = ARG_SCHEMAS[cmd.id] || { args: [] };
      out.push({
        id: cmd.id,
        label: cmd.label,
        group: cmd.group,
        hotkey: "",
        domain: cmd.domain,
        source: "bridge",
        args: schema.args.slice(),
      });
    }

    if (Array.isArray(window.aiBridgeExtraTools)) out.push(...window.aiBridgeExtraTools);
    return out;
  }

  // -- Argument validation -------------------------------------------------
  function validateArgs(spec, raw) {
    const args = (raw && typeof raw === "object") ? raw : {};
    const list = (spec && spec.args) || [];
    for (const def of list) {
      const present = Object.prototype.hasOwnProperty.call(args, def.name) && args[def.name] !== undefined;
      if (def.required && !present) {
        return { ok: false, error: `missing required arg: ${def.name}` };
      }
      if (!present) continue;
      const v = args[def.name];
      if (def.type === "string" && typeof v !== "string") return { ok: false, error: `arg ${def.name} must be string` };
      if (def.type === "number" && typeof v !== "number") return { ok: false, error: `arg ${def.name} must be number` };
      if (def.type === "integer" && (!Number.isFinite(v) || Math.trunc(v) !== v)) return { ok: false, error: `arg ${def.name} must be integer` };
      if (def.type === "boolean" && typeof v !== "boolean") return { ok: false, error: `arg ${def.name} must be boolean` };
      if (def.type === "object" && (typeof v !== "object" || v === null)) return { ok: false, error: `arg ${def.name} must be object` };
    }
    return { ok: true };
  }

  // -- Invocation entry point ---------------------------------------------
  async function invoke(id, args = {}) {
    const startedAt = Date.now();
    const meta = { id: String(id || ""), durationMs: 0 };
    if (!meta.id) return { ...meta, ok: false, error: "missing tool id" };

    // 1. Bridge-owned commands (with args + mutation discipline)
    const owned = BRIDGE_OWNED_COMMANDS.find((c) => c.id === meta.id);
    if (owned) {
      const schema = ARG_SCHEMAS[meta.id] || { args: [] };
      const valid = validateArgs(schema, args);
      if (!valid.ok) return { ...meta, ok: false, error: valid.error, durationMs: Date.now() - startedAt };

      const before = (typeof getAICaptureDomainSnapshot === "function")
        ? safeCall(() => getAICaptureDomainSnapshot(owned.domain)) : null;
      let result;
      try {
        result = (typeof runAICaptureCommand === "function")
          ? runAICaptureCommand(meta.id, args, { domain: owned.domain }, () => owned.action(args))
          : owned.action(args);
        if (result && typeof result.then === "function") result = await result;
      } catch (err) {
        return { ...meta, ok: false, error: err && err.message || String(err), durationMs: Date.now() - startedAt };
      }
      if (owned.mutates && typeof pushUndoCheckpoint === "function") {
        try { pushUndoCheckpoint(true); } catch (_) { /* non-fatal */ }
      }
      const after = (typeof getAICaptureDomainSnapshot === "function")
        ? safeCall(() => getAICaptureDomainSnapshot(owned.domain)) : null;
      const ok = !result || result.ok !== false;
      return {
        ...meta,
        ok,
        error: ok ? undefined : (result && result.error) || "command failed",
        result,
        before,
        after,
        durationMs: Date.now() - startedAt,
      };
    }

    // 2. Palette commands (no args, but may be async)
    const palette = paletteSafeBuild();
    const item = palette.find((p) => p && p.id === meta.id);
    if (!item || typeof item.action !== "function") {
      return { ...meta, ok: false, error: `unknown tool: ${meta.id}`, durationMs: Date.now() - startedAt };
    }
    try {
      const r = item.action();
      if (r && typeof r.then === "function") await r;
      return { ...meta, ok: true, durationMs: Date.now() - startedAt };
    } catch (err) {
      return { ...meta, ok: false, error: err && err.message || String(err), durationMs: Date.now() - startedAt };
    }
  }

  function safeCall(fn) { try { return fn(); } catch (_) { return null; } }

  // -- Read-side façade ----------------------------------------------------
  function query(domain) {
    if (!domain || domain === "all") {
      const dbg = (window.debug && typeof window.debug.snapshot === "function") ? safeCall(() => window.debug.snapshot()) : null;
      const captureDomains = (typeof listAICaptureDomains === "function") ? listAICaptureDomains() : [];
      const captures = {};
      for (const d of captureDomains) captures[d] = safeCall(() => getAICaptureDomainSnapshot(d));
      return { app: dbg, domains: captures };
    }
    const dbg = (window.debug && typeof window.debug[domain] === "function")
      ? safeCall(() => window.debug[domain]())
      : null;
    const cap = (typeof getAICaptureDomainSnapshot === "function")
      ? safeCall(() => getAICaptureDomainSnapshot(domain)) : null;
    return { debug: dbg, capture: cap };
  }

  function diff(domain, before, after) {
    if (!domain) return [];
    const finalSnap = after !== undefined
      ? after
      : (typeof getAICaptureDomainSnapshot === "function" ? safeCall(() => getAICaptureDomainSnapshot(domain)) : null);
    if (typeof getAICaptureDomainDiffs === "function") {
      return safeCall(() => getAICaptureDomainDiffs(domain, before, finalSnap, [])) || [];
    }
    return [];
  }

  function invariants(domain) {
    const domains = domain ? [domain] : (typeof listAICaptureDomains === "function" ? listAICaptureDomains() : []);
    const out = [];
    for (const d of domains) {
      const snap = safeCall(() => getAICaptureDomainSnapshot(d));
      const issues = (typeof getAICaptureDomainInvariants === "function")
        ? safeCall(() => getAICaptureDomainInvariants(d, snap, {})) || []
        : [];
      for (const it of issues) out.push({ domain: d, ...it });
    }
    return out;
  }

  // -- waitFor: a predicate-based "render finished" hook ------------------
  function waitFor(name, opts = {}) {
    const timeoutMs = Number(opts.timeoutMs || 2000);
    return new Promise((resolve, reject) => {
      const started = Date.now();
      function check() {
        if (name === "render") {
          // proxy: a single rAF tick is enough for the editor's render loop
          requestAnimationFrame(() => requestAnimationFrame(() => resolve({ ok: true, after: Date.now() - started })));
          return;
        }
        if (name === "idle") {
          if (typeof requestIdleCallback === "function") {
            requestIdleCallback(() => resolve({ ok: true, after: Date.now() - started }), { timeout: timeoutMs });
          } else {
            setTimeout(() => resolve({ ok: true, after: Date.now() - started }), 32);
          }
          return;
        }
        if (Date.now() - started > timeoutMs) return reject(new Error(`waitFor ${name} timed out`));
        setTimeout(check, 32);
      }
      check();
    });
  }

  function help() {
    const list = tools();
    const byDomain = {};
    for (const t of list) {
      byDomain[t.domain] = byDomain[t.domain] || [];
      byDomain[t.domain].push({ id: t.id, label: t.label, args: t.args.length });
    }
    return {
      version: 1,
      toolCount: list.length,
      domains: byDomain,
      queries: ["query()", "query('mesh')", "diff('mesh', before)", "invariants()"],
      examples: [
        "ai.invoke('mode.skeleton')",
        "ai.invoke('ai.select_slot', { name: 'head' })",
        "ai.invoke('ai.set_animation_time', { time: 0.25 })",
        "await ai.waitFor('render')",
      ],
    };
  }

  window.ai = {
    __installed: true,
    version: 1,
    tools,
    invoke,
    query,
    diff,
    invariants,
    waitFor,
    help,
  };
})();
