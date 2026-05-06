// ROLE: Editor-side glue for puppet-warp. Provides attachment-level
// operations (enable / add pin / remove pin / drag pin) that wrap the
// raw ARAP solver and write results into meshData.offsets so the existing
// render path (buildSlotGeometry) picks them up unchanged.
//
// Loaded after puppet-warp.js (depends on window.PuppetWarp).
//
// EXPORTS (under window.PuppetWarpRuntime):
//   enableForAttachment(att, mode?)
//   disableForAttachment(att)
//   addPin(att, vertexIndex, label?) -> pin
//   removePin(att, pinId)
//   dragPin(slot, att, pinId, targetX, targetY)   // live preview, writes offsets
//   commitDrag(slot, att, pinId)                  // bake into deform offsets at current time
//   ensurePuppetWarp(att, mode?)                  // returns attachment.puppetWarp, creating it if missing

(function buildPuppetWarpRuntime() {
  if (typeof window === "undefined") return;
  if (window.PuppetWarpRuntime && window.PuppetWarpRuntime.__installed) return;

  function uuid() {
    // Short collision-resistant id; not cryptographic
    return "pin_" + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
  }

  function ensurePuppetWarp(att, mode) {
    if (!att) return null;
    if (!att.puppetWarp) {
      att.puppetWarp = {
        mode: mode === "post_skin" ? "post_skin" : "standalone",
        pins: [],
        bake: { dirty: true, lastTopologyHash: "" },
      };
    } else if (mode && att.puppetWarp.mode !== mode) {
      att.puppetWarp.mode = mode === "post_skin" ? "post_skin" : "standalone";
      att.puppetWarp.bake.dirty = true;
      if (window.PuppetWarp) window.PuppetWarp.invalidate(att, "mode_change");
    }
    return att.puppetWarp;
  }

  function enableForAttachment(att, mode) {
    return ensurePuppetWarp(att, mode);
  }

  function disableForAttachment(att) {
    if (!att) return;
    att.puppetWarp = null;
    if (window.PuppetWarp) window.PuppetWarp.invalidate(att, "disable");
    // Clear any baked offsets so the mesh returns to rest visually
    const md = att.meshData;
    if (md && md.offsets) {
      for (let i = 0; i < md.offsets.length; i += 1) md.offsets[i] = 0;
    }
  }

  function addPin(att, vertexIndex, label) {
    if (!att || !att.meshData) return null;
    const pw = ensurePuppetWarp(att);
    const md = att.meshData;
    const vCount = (md.positions.length / 2) | 0;
    if (vertexIndex < 0 || vertexIndex >= vCount) return null;
    if (pw.pins.some((p) => p.vertexIndex === vertexIndex)) return null; // no duplicate
    const pin = {
      id: uuid(),
      vertexIndex,
      restX: md.positions[vertexIndex * 2],
      restY: md.positions[vertexIndex * 2 + 1],
      label: label ? String(label) : "",
    };
    pw.pins.push(pin);
    pw.bake.dirty = true;
    if (window.PuppetWarp) window.PuppetWarp.invalidate(att, "add_pin");
    return pin;
  }

  function removePin(att, pinId) {
    if (!att || !att.puppetWarp) return false;
    const i = att.puppetWarp.pins.findIndex((p) => p.id === pinId);
    if (i < 0) return false;
    att.puppetWarp.pins.splice(i, 1);
    att.puppetWarp.bake.dirty = true;
    if (window.PuppetWarp) window.PuppetWarp.invalidate(att, "remove_pin");
    return true;
  }

  // Build a target map for the solver: for any pin without an explicit
  // target in `overrides`, its current target is its rest position.
  function buildTargets(pw, overrides) {
    const targets = {};
    for (const pin of pw.pins) {
      const o = overrides && overrides[pin.id];
      if (o) {
        targets[pin.vertexIndex] = { x: o.x, y: o.y };
      } else {
        targets[pin.vertexIndex] = { x: pin.restX, y: pin.restY };
      }
    }
    return targets;
  }

  // Solve and write into meshData.offsets at current pose. This is what
  // the live drag preview calls. The "offsets" interpretation depends on
  // mode:
  //   standalone: offsets[i] = arapDeformed[i] - rest_position[i]
  //   post_skin:  offsets[i] = arapDeformed[i] - rest_position[i]
  //     (post-skin path uses the same offsets layer; runtime adds offsets
  //     on top of skinned position. For Phase 1 we treat both the same —
  //     post_skin's bone-pose-aware variant is Phase 3.)
  function applyTargetsToOffsets(att, overrides) {
    if (!att || !att.puppetWarp || !att.meshData) return false;
    const md = att.meshData;
    const pw = att.puppetWarp;
    if (pw.pins.length === 0) {
      // No pins → clear
      if (md.offsets) for (let i = 0; i < md.offsets.length; i += 1) md.offsets[i] = 0;
      return true;
    }
    const targets = buildTargets(pw, overrides);
    const deformed = window.PuppetWarp.solve(att, targets, 2);
    const n = (md.positions.length / 2) | 0;
    if (!md.offsets || md.offsets.length !== n * 2) md.offsets = new Float32Array(n * 2);
    for (let i = 0; i < n; i += 1) {
      md.offsets[i * 2] = deformed[i * 2] - md.positions[i * 2];
      md.offsets[i * 2 + 1] = deformed[i * 2 + 1] - md.positions[i * 2 + 1];
    }
    return true;
  }

  function dragPin(slot, att, pinId, targetX, targetY) {
    if (!att || !att.puppetWarp) return false;
    const pin = att.puppetWarp.pins.find((p) => p.id === pinId);
    if (!pin) return false;
    const overrides = {};
    overrides[pinId] = { x: Number(targetX), y: Number(targetY) };
    // Also keep all OTHER pins at whatever target they were last solved for.
    // For Phase 1 (no animation) the "last target" is the pin's rest position
    // unless this drag has previously moved them. We track the active drag
    // offsets transiently on att.puppetWarp.lastTargets.
    if (att.puppetWarp.lastTargets) {
      for (const [otherId, t] of Object.entries(att.puppetWarp.lastTargets)) {
        if (otherId !== pinId && !overrides[otherId]) overrides[otherId] = t;
      }
    }
    if (!att.puppetWarp.lastTargets) att.puppetWarp.lastTargets = {};
    att.puppetWarp.lastTargets[pinId] = { x: Number(targetX), y: Number(targetY) };
    return applyTargetsToOffsets(att, overrides);
  }

  function commitDrag(slot, att, pinId) {
    // Phase 1: just leave offsets where they are. Phase 2 will write a
    // pin-track keyframe + a deform keyframe here.
    if (!att || !att.puppetWarp) return false;
    if (typeof pushUndoCheckpoint === "function") {
      try { pushUndoCheckpoint(true); } catch (_) { /* non-fatal */ }
    }
    return true;
  }

  // Re-bake offsets from current pin targets. Used when mesh topology or
  // pin set changes invalidates the cache.
  function rebakeOffsets(att) {
    if (!att || !att.puppetWarp) return false;
    return applyTargetsToOffsets(att, att.puppetWarp.lastTargets || {});
  }

  // -- Bake driver (Phase 2) -------------------------------------------------
  //
  // When pin tracks change, the deform offsets need to be regenerated for
  // the affected attachment at every keyed time. We don't bake into a deform
  // track yet (Phase 1 writes offsets directly for the current frame); for
  // playback the runtime samples pin tracks live and resolves ARAP each
  // frame the pose is sampled. That's expensive but in Phase 2 we accept
  // it — the optimisation (bake into deform track) is a Phase 3 task.
  //
  // queueBake(slotIndex, attName) marks an attachment dirty; a microtask /
  // idle callback flushes by re-applying the current animation time's pin
  // targets to offsets so the editor preview is correct.

  const bakeQueue = new Set();
  let bakeFlushScheduled = false;

  function bakeKey(slotIndex, attName) { return `${slotIndex}::${String(attName || "")}`; }

  function queueBake(slotIndex, attName) {
    bakeQueue.add(bakeKey(slotIndex, attName));
    scheduleBakeFlush();
  }

  function scheduleBakeFlush() {
    if (bakeFlushScheduled) return;
    bakeFlushScheduled = true;
    const fire = () => {
      bakeFlushScheduled = false;
      flushBakeQueue();
    };
    if (typeof requestIdleCallback === "function") requestIdleCallback(fire, { timeout: 100 });
    else setTimeout(fire, 0);
  }

  function flushBakeQueue() {
    if (bakeQueue.size === 0) return;
    const keys = Array.from(bakeQueue);
    bakeQueue.clear();
    for (const key of keys) {
      const sep = key.indexOf("::");
      if (sep < 0) continue;
      const slotIndex = Number(key.slice(0, sep));
      const attName = key.slice(sep + 2);
      bakeAttachmentForCurrentTime(slotIndex, attName);
    }
    if (typeof requestRender === "function") requestRender("puppet_warp_bake_flush");
  }

  function bakeAttachmentForCurrentTime(slotIndex, attName) {
    const slot = state.slots[slotIndex];
    if (!slot) return;
    const att = (typeof getActiveAttachment === "function") ? getActiveAttachment(slot) : null;
    if (!att || (attName && att.name !== attName) || !att.puppetWarp) return;
    samplePuppetPinTracksAtTime(slotIndex, att, state.anim ? state.anim.time : 0);
  }

  function samplePuppetPinTracksAtTime(slotIndex, att, time) {
    if (!att || !att.puppetWarp) return;
    if (typeof getCurrentAnimation !== "function" || typeof samplePuppetPinTrack !== "function") return;
    const anim = getCurrentAnimation();
    if (!anim) return;
    const overrides = {};
    let anyKeyed = false;
    for (const pin of att.puppetWarp.pins) {
      const trackId = (typeof getPuppetPinTrackId === "function")
        ? getPuppetPinTrackId(slotIndex, att.name, pin.id)
        : null;
      const sampled = trackId ? samplePuppetPinTrack(anim, trackId, time) : null;
      if (sampled) {
        overrides[pin.id] = sampled;
        anyKeyed = true;
      }
    }
    if (!anyKeyed) {
      // No keyframes yet: keep manual lastTargets (e.g. mid-drag preview)
      return applyTargetsToOffsets(att, att.puppetWarp.lastTargets || {});
    }
    if (!att.puppetWarp.lastTargets) att.puppetWarp.lastTargets = {};
    Object.assign(att.puppetWarp.lastTargets, overrides);
    return applyTargetsToOffsets(att, overrides);
  }

  // Called by the global animation playback loop on every frame.
  function onAnimationFrame() {
    const slots = state.slots || [];
    for (let i = 0; i < slots.length; i += 1) {
      const slot = slots[i];
      if (!slot) continue;
      const att = (typeof getActiveAttachment === "function") ? getActiveAttachment(slot) : null;
      if (!att || !att.puppetWarp || !Array.isArray(att.puppetWarp.pins) || att.puppetWarp.pins.length === 0) continue;
      samplePuppetPinTracksAtTime(i, att, state.anim ? state.anim.time : 0);
    }
  }

  window.PuppetWarpRuntime = {
    __installed: true,
    version: 1,
    ensurePuppetWarp,
    enableForAttachment,
    disableForAttachment,
    addPin,
    removePin,
    dragPin,
    commitDrag,
    rebakeOffsets,
    queueBake,
    flushBakeQueue,
    samplePuppetPinTracksAtTime,
    onAnimationFrame,
  };
})();
