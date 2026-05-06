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

  function disableForAttachment(att, slotIndex) {
    if (!att) return;
    // Clean up any pin tracks before nulling out puppetWarp
    if (att.puppetWarp && Number.isFinite(slotIndex) && slotIndex >= 0
        && typeof getCurrentAnimation === "function" && typeof getPuppetPinTrackId === "function") {
      const anim = getCurrentAnimation();
      if (anim && anim.tracks) {
        for (const pin of att.puppetWarp.pins) {
          const trackId = getPuppetPinTrackId(slotIndex, att.name, pin.id);
          if (anim.tracks[trackId]) delete anim.tracks[trackId];
        }
      }
    }
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

  function removePin(att, pinId, slotIndex) {
    if (!att || !att.puppetWarp) return false;
    const i = att.puppetWarp.pins.findIndex((p) => p.id === pinId);
    if (i < 0) return false;
    att.puppetWarp.pins.splice(i, 1);
    if (att.puppetWarp.lastTargets) delete att.puppetWarp.lastTargets[pinId];
    att.puppetWarp.bake.dirty = true;
    if (window.PuppetWarp) window.PuppetWarp.invalidate(att, "remove_pin");
    // Clean up the pin's timeline track if we know which slot/attachment.
    if (Number.isFinite(slotIndex) && slotIndex >= 0 && typeof getCurrentAnimation === "function" && typeof getPuppetPinTrackId === "function") {
      const anim = getCurrentAnimation();
      if (anim && anim.tracks) {
        const trackId = getPuppetPinTrackId(slotIndex, att.name, pinId);
        if (anim.tracks[trackId]) delete anim.tracks[trackId];
      }
    }
    return true;
  }

  // Resolve a "pin target" to absolute slot-local coordinates given the
  // current dynamic-rest reference (skinned vertex positions for post_skin,
  // mesh.positions for standalone). A target may be:
  //   { x, y } — absolute, always.
  //   { dx, dy } — relative to dynamicRest[vertexIndex].
  function resolveTargetAbs(target, vertexIndex, dynamicRest, fallbackX, fallbackY) {
    if (!target) return { x: fallbackX, y: fallbackY };
    if (typeof target.x === "number" && typeof target.y === "number") return { x: target.x, y: target.y };
    if (typeof target.dx === "number" && typeof target.dy === "number") {
      const baseX = dynamicRest ? dynamicRest[vertexIndex * 2] : fallbackX;
      const baseY = dynamicRest ? dynamicRest[vertexIndex * 2 + 1] : fallbackY;
      return { x: baseX + target.dx, y: baseY + target.dy };
    }
    return { x: fallbackX, y: fallbackY };
  }

  // Build a target map for the solver. For any pin without an explicit
  // target in `overrides`, its current target is its rest position
  // (standalone) or its skinned position (post_skin: zero relative offset).
  function buildTargets(pw, overrides, dynamicRest) {
    const targets = {};
    for (const pin of pw.pins) {
      const vi = pin.vertexIndex;
      const fallbackX = dynamicRest ? dynamicRest[vi * 2] : pin.restX;
      const fallbackY = dynamicRest ? dynamicRest[vi * 2 + 1] : pin.restY;
      const o = overrides && overrides[pin.id];
      targets[vi] = resolveTargetAbs(o, vi, dynamicRest, fallbackX, fallbackY);
    }
    return targets;
  }

  // Solve and write into meshData.offsets at current pose.
  //
  // The "offsets" interpretation depends on mode:
  //   standalone: offsets[i] = arapDeformed[i] - rest_position[i]
  //               render: getSlotWeightMode short-circuits to "free", so
  //               final = positions[i] + offsets[i] = arapDeformed[i].
  //   post_skin:  offsets[i] = arapDeformed[i] - skinned_position[i]
  //               render: leaves bone skinning intact; final = skinned[i]
  //               + offsets[i] = arapDeformed[i] (composed atop the
  //               bone-driven pose).
  //
  // For post_skin we need the current per-frame skinned positions. We
  // rely on the most recent buildSlotGeometry pass (available as
  // meshData.deformedLocal). If unavailable we fall back to rest.
  // For post_skin we need the current per-frame skinned positions. They
  // live in meshData.deformedLocal, populated by buildSlotGeometry every
  // render frame. If the cache is stale (e.g. before the first render)
  // we proactively build it once. We then subtract previous offsets to
  // recover the pure-skinned-only reference (without our own ARAP layer).
  // Find which slot owns this attachment. O(slots × atts) but slots are
  // usually < 50 in practice. Used to populate deformedLocal lazily for
  // post_skin's getDynamicRest.
  function findSlotIndexForAttachment(att) {
    if (!att) return -1;
    const slots = state.slots || [];
    for (let i = 0; i < slots.length; i += 1) {
      const s = slots[i];
      if (!s || !Array.isArray(s.attachments)) continue;
      if (s.attachments.indexOf(att) >= 0) return i;
    }
    return -1;
  }

  function getDynamicRest(att, slotIndex) {
    if (!Number.isFinite(slotIndex)) slotIndex = findSlotIndexForAttachment(att);
    if (!att || !att.meshData) return null;
    if (!att.puppetWarp || att.puppetWarp.mode !== "post_skin") return att.meshData.positions;

    // Lazy populate deformedLocal if missing. buildSlotGeometry may write
    // to a different attachment object than `att` if state.slots got
    // re-normalized between calls; re-read after building.
    const needsLen = att.meshData.positions.length;
    let md = att.meshData;
    const stale = !md.deformedLocal || md.deformedLocal.length !== needsLen;
    if (stale && Number.isFinite(slotIndex) && slotIndex >= 0
        && typeof buildSlotGeometry === "function" && typeof getSolvedPoseWorld === "function") {
      const slot = state.slots[slotIndex];
      if (slot && state.mesh) {
        try {
          const poseWorld = getSolvedPoseWorld(state.mesh);
          buildSlotGeometry(slot, Array.isArray(poseWorld) ? poseWorld : []);
        } catch (_) { /* tolerate */ }
        // Re-fetch in case slot.attachments was rebuilt during the call.
        const freshAtt = (typeof getActiveAttachment === "function") ? getActiveAttachment(slot) : null;
        if (freshAtt && freshAtt.meshData) md = freshAtt.meshData;
      }
    }
    if (!md.deformedLocal || md.deformedLocal.length !== needsLen) return att.meshData.positions;
    const out = new Float32Array(needsLen);
    for (let i = 0; i < needsLen; i += 1) {
      out[i] = md.deformedLocal[i] - (md.offsets ? md.offsets[i] : 0);
    }
    return out;
  }

  function applyTargetsToOffsets(att, overrides) {
    if (!att || !att.puppetWarp || !att.meshData) return false;
    const md = att.meshData;
    const pw = att.puppetWarp;
    if (pw.pins.length === 0) {
      if (md.offsets) for (let i = 0; i < md.offsets.length; i += 1) md.offsets[i] = 0;
      return true;
    }
    const dynamicRest = getDynamicRest(att);
    const targets = buildTargets(pw, overrides, dynamicRest);
    let deformed;
    if (pw.mode === "post_skin" && dynamicRest !== md.positions) {
      // Adaptive: solve in skinned-space. Output is in skinned-space.
      deformed = window.PuppetWarp.solveAdaptive(att, dynamicRest, targets, 2);
    } else {
      // Standalone (or post_skin fallback when no skinned cache): solve
      // against rest mesh.
      deformed = window.PuppetWarp.solve(att, targets, 2);
    }
    const n = (md.positions.length / 2) | 0;
    if (!md.offsets || md.offsets.length !== n * 2) md.offsets = new Float32Array(n * 2);
    if (pw.mode === "post_skin" && dynamicRest !== md.positions) {
      // post_skin offsets: render does final = skinned + offset.
      // We want final = arapDeformed (in skinned-space).
      // So offset = arapDeformed - skinned.
      for (let i = 0; i < n; i += 1) {
        md.offsets[i * 2] = deformed[i * 2] - dynamicRest[i * 2];
        md.offsets[i * 2 + 1] = deformed[i * 2 + 1] - dynamicRest[i * 2 + 1];
      }
    } else {
      // standalone offsets: render does final = positions + offset.
      // We want final = arapDeformed (in rest-space).
      // So offset = arapDeformed - positions.
      for (let i = 0; i < n; i += 1) {
        md.offsets[i * 2] = deformed[i * 2] - md.positions[i * 2];
        md.offsets[i * 2 + 1] = deformed[i * 2 + 1] - md.positions[i * 2 + 1];
      }
    }
    return true;
  }

  // Convert a drag-target in slot-local absolute coords to the right
  // target shape for the current mode:
  //   standalone: { x, y }
  //   post_skin:  { dx, dy } relative to the current skinned vertex pos
  function makeTarget(att, pin, targetX, targetY) {
    if (att.puppetWarp.mode === "post_skin") {
      const dr = getDynamicRest(att);
      const baseX = dr ? dr[pin.vertexIndex * 2] : pin.restX;
      const baseY = dr ? dr[pin.vertexIndex * 2 + 1] : pin.restY;
      return { dx: Number(targetX) - baseX, dy: Number(targetY) - baseY };
    }
    return { x: Number(targetX), y: Number(targetY) };
  }

  function dragPin(slot, att, pinId, targetX, targetY) {
    if (!att || !att.puppetWarp) return false;
    const pin = att.puppetWarp.pins.find((p) => p.id === pinId);
    if (!pin) return false;
    const overrides = {};
    overrides[pinId] = makeTarget(att, pin, targetX, targetY);
    if (att.puppetWarp.lastTargets) {
      for (const [otherId, t] of Object.entries(att.puppetWarp.lastTargets)) {
        if (otherId !== pinId && !overrides[otherId]) overrides[otherId] = t;
      }
    }
    if (!att.puppetWarp.lastTargets) att.puppetWarp.lastTargets = {};
    att.puppetWarp.lastTargets[pinId] = overrides[pinId];
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

  // Bake the current ARAP solution at `time` into a deform-track keyframe.
  // This is what Spine sees on export — pin tracks are editor-only, but
  // deform tracks are first-class Spine animation timelines. We resolve
  // pin targets at `time`, run ARAP, capture the resulting offsets, and
  // write them as a deform keyframe.
  function bakeDeformKeyframeForTime(slotIndex, attName, time) {
    const slot = state.slots[slotIndex];
    if (!slot) return;
    const att = (typeof getActiveAttachment === "function") ? getActiveAttachment(slot) : null;
    if (!att || (attName && att.name !== attName) || !att.puppetWarp) return;
    if (typeof getCurrentAnimation !== "function") return;
    const anim = getCurrentAnimation();
    if (!anim) return;
    if (typeof getVertexTrackId !== "function" || typeof getTrackKeys !== "function") return;
    // Resolve all pin targets at this time. If a pin has no keyframe,
    // fall back to "no displacement" — represented as rest absolute for
    // standalone, or zero relative for post_skin.
    const overrides = {};
    for (const pin of att.puppetWarp.pins) {
      const trackId = getPuppetPinTrackId(slotIndex, att.name, pin.id);
      const sampled = samplePuppetPinTrack(anim, trackId, time);
      if (sampled) overrides[pin.id] = sampled;
      else if (att.puppetWarp.mode === "post_skin") overrides[pin.id] = { dx: 0, dy: 0 };
      else overrides[pin.id] = { x: pin.restX, y: pin.restY };
    }
    applyTargetsToOffsets(att, overrides);
    // Snapshot current offsets to a deform-track keyframe
    const md = att.meshData;
    if (!md || !md.offsets) return;
    const offsetsCopy = new Float32Array(md.offsets.length);
    offsetsCopy.set(md.offsets);
    const deformTrackId = getVertexTrackId(slotIndex, att.name);
    const keys = getTrackKeys(anim, deformTrackId);
    const epsilon = 1e-4;
    const existing = keys.findIndex((k) => Math.abs((Number(k.time) || 0) - time) < epsilon && (!Number.isFinite(k.slotIndex) || Number(k.slotIndex) === slotIndex));
    const id = `pwd_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
    const keyframe = {
      id: existing >= 0 ? keys[existing].id : id,
      time,
      value: offsetsCopy,
      interp: "linear",
      slotIndex,
    };
    if (existing >= 0) keys[existing] = keyframe;
    else keys.push(keyframe);
    keys.sort((a, b) => (Number(a.time) || 0) - (Number(b.time) || 0));
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

  // -- Property panel UI ----------------------------------------------------
  function refreshPuppetWarpPanel() {
    if (!els.puppetWarpGroup) return;
    const slot = (typeof getActiveSlot === "function") ? getActiveSlot() : null;
    const att = slot ? getActiveAttachment(slot) : null;
    const isMesh = att && (att.type === "mesh" || att.type === "linkedmesh");
    if (!isMesh) {
      els.puppetWarpGroup.style.display = "none";
      return;
    }
    els.puppetWarpGroup.style.display = "";
    const enabled = !!(att && att.puppetWarp);
    if (els.puppetWarpEnabled) els.puppetWarpEnabled.checked = enabled;
    if (els.puppetWarpControls) els.puppetWarpControls.style.display = enabled ? "" : "none";
    if (!enabled) return;
    const pw = att.puppetWarp;
    if (els.puppetWarpMode) els.puppetWarpMode.value = pw.mode === "post_skin" ? "post_skin" : "standalone";
    if (els.puppetWarpPinList) {
      if (pw.pins.length === 0) {
        els.puppetWarpPinList.innerHTML = '<div style="opacity:0.6">No pins. Alt-click on a vertex to add.</div>';
      } else {
        const selectedId = state.puppetWarp && state.puppetWarp.selectedPinId;
        els.puppetWarpPinList.innerHTML = pw.pins.map((p) => {
          const isSel = p.id === selectedId;
          return `<div data-pin-id="${p.id}" style="padding:2px 4px;cursor:pointer;${isSel ? "background:rgba(255,170,68,0.2);" : ""}">
            <span style="color:#ff9966">●</span>
            v${p.vertexIndex} <small style="opacity:0.5">(${Math.round(p.restX)}, ${Math.round(p.restY)})</small>
            <button data-pin-del="${p.id}" type="button" style="float:right;font-size:10px;padding:0 6px">×</button>
          </div>`;
        }).join("");
      }
    }
    if (els.puppetWarpStatus) {
      els.puppetWarpStatus.textContent = `${pw.pins.length} pin${pw.pins.length === 1 ? "" : "s"} · mode: ${pw.mode}`;
    }
  }

  function wirePuppetWarpPanel() {
    if (!els.puppetWarpGroup || els.puppetWarpGroup.dataset.wired === "1") return;
    els.puppetWarpGroup.dataset.wired = "1";

    if (els.puppetWarpEnabled) {
      els.puppetWarpEnabled.addEventListener("change", () => {
        const slot = getActiveSlot();
        const att = slot ? getActiveAttachment(slot) : null;
        if (!att) return;
        if (els.puppetWarpEnabled.checked) {
          enableForAttachment(att, "standalone");
        } else {
          disableForAttachment(att, Number(state.activeSlot));
        }
        if (typeof pushUndoCheckpoint === "function") pushUndoCheckpoint(true);
        refreshPuppetWarpPanel();
        if (typeof requestRender === "function") requestRender("puppet_warp_toggle");
      });
    }

    if (els.puppetWarpMode) {
      els.puppetWarpMode.addEventListener("change", () => {
        const slot = getActiveSlot();
        const att = slot ? getActiveAttachment(slot) : null;
        if (!att || !att.puppetWarp) return;
        const newMode = els.puppetWarpMode.value === "post_skin" ? "post_skin" : "standalone";
        att.puppetWarp.mode = newMode;
        att.puppetWarp.bake.dirty = true;
        if (window.PuppetWarp) window.PuppetWarp.invalidate(att, "mode_change");
        rebakeOffsets(att);
        if (typeof pushUndoCheckpoint === "function") pushUndoCheckpoint(true);
        refreshPuppetWarpPanel();
        if (typeof requestRender === "function") requestRender("puppet_warp_mode");
      });
    }

    if (els.puppetWarpClearPinsBtn) {
      els.puppetWarpClearPinsBtn.addEventListener("click", () => {
        const slot = getActiveSlot();
        const att = slot ? getActiveAttachment(slot) : null;
        if (!att || !att.puppetWarp) return;
        const slotIdx = Number(state.activeSlot);
        // Drop pin tracks so they don't dangle
        if (Number.isFinite(slotIdx) && slotIdx >= 0
            && typeof getCurrentAnimation === "function" && typeof getPuppetPinTrackId === "function") {
          const anim = getCurrentAnimation();
          if (anim && anim.tracks) {
            for (const pin of att.puppetWarp.pins) {
              const trackId = getPuppetPinTrackId(slotIdx, att.name, pin.id);
              if (anim.tracks[trackId]) delete anim.tracks[trackId];
            }
          }
        }
        att.puppetWarp.pins = [];
        att.puppetWarp.lastTargets = null;
        att.puppetWarp.bake.dirty = true;
        if (window.PuppetWarp) window.PuppetWarp.invalidate(att, "clear_pins");
        rebakeOffsets(att);
        if (typeof pushUndoCheckpoint === "function") pushUndoCheckpoint(true);
        refreshPuppetWarpPanel();
        if (typeof requestRender === "function") requestRender("puppet_warp_clear");
      });
    }

    if (els.puppetWarpRebakeBtn) {
      els.puppetWarpRebakeBtn.addEventListener("click", () => {
        const slot = getActiveSlot();
        const att = slot ? getActiveAttachment(slot) : null;
        if (!att || !att.puppetWarp) return;
        if (window.PuppetWarp) window.PuppetWarp.invalidate(att, "manual_rebake");
        rebakeOffsets(att);
        refreshPuppetWarpPanel();
        if (typeof requestRender === "function") requestRender("puppet_warp_rebake");
      });
    }

    if (els.puppetWarpPinList) {
      els.puppetWarpPinList.addEventListener("click", (ev) => {
        const target = ev.target;
        if (!target) return;
        const delId = target.getAttribute && target.getAttribute("data-pin-del");
        if (delId) {
          const slot = getActiveSlot();
          const att = slot ? getActiveAttachment(slot) : null;
          if (att) {
            removePin(att, delId, Number(state.activeSlot));
            if (state.puppetWarp && state.puppetWarp.selectedPinId === delId) state.puppetWarp.selectedPinId = null;
            if (typeof pushUndoCheckpoint === "function") pushUndoCheckpoint(true);
            refreshPuppetWarpPanel();
            if (typeof requestRender === "function") requestRender("puppet_warp_remove_pin_panel");
          }
          return;
        }
        // Click row → select pin
        const row = target.closest && target.closest("[data-pin-id]");
        if (row) {
          const pinId = row.getAttribute("data-pin-id");
          if (!state.puppetWarp) state.puppetWarp = {};
          state.puppetWarp.selectedPinId = pinId;
          refreshPuppetWarpPanel();
          if (typeof requestRender === "function") requestRender("puppet_warp_select_pin");
        }
      });
    }
  }

  // Wire on next tick so els is fully populated
  if (typeof window !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", wirePuppetWarpPanel);
    } else {
      setTimeout(wirePuppetWarpPanel, 0);
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
    bakeDeformKeyframeForTime,
    refreshPanel: refreshPuppetWarpPanel,
  };
})();
