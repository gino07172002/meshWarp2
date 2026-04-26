// ROLE: Timeline pointer interactions — marquee selection of keyframes,
// keyframe drag (time scrub), playhead drag, ruler scrub.
// EXPORTS:
//   - ensureTimelineMarqueeEl, clearTimelineMarqueeEl, clearTimelineDrag
//   - rectsOverlap (helper)
// EVENT WIRING: timeline track lanes, ruler, playhead.
function ensureTimelineMarqueeEl() {
  if (state.anim.timelineMarqueeEl && state.anim.timelineMarqueeEl.isConnected) return state.anim.timelineMarqueeEl;
  const el = document.createElement("div");
  el.className = "timeline-marquee";
  state.anim.timelineMarqueeEl = el;
  els.timelineTracks.appendChild(el);
  return el;
}

function clearTimelineMarqueeEl() {
  const el = state.anim.timelineMarqueeEl;
  if (el && el.parentNode) el.parentNode.removeChild(el);
  state.anim.timelineMarqueeEl = null;
}

function rectsOverlap(a, b) {
  return a.left <= b.right && a.right >= b.left && a.top <= b.bottom && a.bottom >= b.top;
}

els.timelineTracks.addEventListener("pointerdown", (ev) => {
  if (state.anim.timelineContextMenuOpen) closeTimelineKeyContextMenu();
  if (ev.button !== 0) return;
  const anim = getCurrentAnimation();
  if (!anim) return;
  const timelineRange = getTimelineViewRange(anim);
  const editDuration = getTimelineDisplayDuration(anim);
  const groupBtn = ev.target.closest("[data-group-action][data-group-key]");
  if (groupBtn) {
    ev.preventDefault();
    const action = String(groupBtn.dataset.groupAction || "");
    const groupKey = String(groupBtn.dataset.groupKey || "");
    if (!groupKey) return;
    if (action === "mute") {
      const next = !(state.anim.groupMute && state.anim.groupMute[groupKey]);
      state.anim.groupMute[groupKey] = next;
      setStatus(next ? `Muted ${groupKey}` : `Unmuted ${groupKey}`);
    } else if (action === "solo") {
      const next = !(state.anim.groupSolo && state.anim.groupSolo[groupKey]);
      state.anim.groupSolo[groupKey] = next;
      setStatus(next ? `Solo ${groupKey}` : `Unsolo ${groupKey}`);
    }
    renderTimelineTracks();
    return;
  }
  const groupLabel = ev.target.closest(".track-label[data-group-key]");
  if (groupLabel) {
    const gk = String(groupLabel.dataset.groupKey || "");
    const num = Number(gk);
    const isNumKey = Number.isFinite(num) && String(num) === gk;
    const key = isNumKey ? num : gk;
    state.anim.trackExpanded[key] = !state.anim.trackExpanded[key];
    renderTimelineTracks();
    return;
  }
  const keyEl = ev.target.closest(".track-key");
  const playheadEl = ev.target.closest(".timeline-playhead.handle");
  const laneEl = ev.target.closest(".track-lane");
  if (!laneEl) return;
  ev.preventDefault();
  const trackId = laneEl.dataset.trackId;
  if (!trackId) return;

  const rect = laneEl.getBoundingClientRect();
  const x = ev.clientX - rect.left;
  const t = snapTimeIfNeeded(timeForTimelineX(x, rect.width, timelineRange));

  if (playheadEl || trackId === "__ruler__") {
    clearTimelineMarqueeEl();
    state.anim.timelineDrag = {
      mode: "playhead",
      laneTrackId: trackId,
      pointerId: ev.pointerId,
    };
    els.timelineTracks.setPointerCapture(ev.pointerId);
    setAnimTime(t);
    if (state.mesh) {
      samplePoseAtTime(state.mesh, state.anim.time);
      if (state.boneMode === "pose") updateBoneUI();
    }
    renderTimelineTracks();
    return;
  }

  if (keyEl) {
    clearTimelineMarqueeEl();
    normalizeSelectedKeys(anim);
    const currentSelection = Array.isArray(state.anim.selectedKeys) ? state.anim.selectedKeys.filter(Boolean) : [];
    const hasCurrentMultiSelection = currentSelection.length > 1;
    const wantToggle = ev.ctrlKey || ev.metaKey;
    const summaryScope = String(keyEl.dataset.summaryScope || "");
    if (summaryScope) {
      const summaryTime = Number(keyEl.dataset.summaryTime);
      const summaryGroupKey = String(keyEl.dataset.summaryGroupKey || "");
      const picked = collectSummaryKeyTargets(anim, summaryScope, summaryTime, summaryGroupKey);
      if (picked.length <= 0) return;
      // UX: if user already has multi-selection, clicking summary key should drag that set,
      // not collapse to one/few keys from the clicked summary point.
      const dragSelection = !wantToggle && hasCurrentMultiSelection ? currentSelection : picked;
      const selectedKeyRef = state.anim.selectedKey;
      const anchor =
        pickSelectionAnchorNearTime(anim, dragSelection, summaryTime, selectedKeyRef) || dragSelection[0] || picked[0];
      const seed = getDragSeedFromSelection(anim, dragSelection);
      state.anim.selectedKeys = dragSelection;
      state.anim.selectedKey = anchor ? { ...anchor } : null;
      setSelectedTimelineTrack(anchor ? anchor.trackId : picked[0].trackId);
      state.anim.timelineDrag = {
        mode: "key_set",
        laneTrackId: trackId,
        pointerId: ev.pointerId,
        anchorTime: summaryTime,
        keyAnchor: anchor ? { trackId: anchor.trackId, keyId: anchor.keyId } : null,
        seed,
        scaleSpan: getTimelineScaleSpanFromSeed(seed, summaryTime, editDuration),
      };
      els.timelineTracks.setPointerCapture(ev.pointerId);
      setAnimTime(summaryTime);
      renderTimelineTracks();
      return;
    }
    if (!parseTrackId(trackId)) return;
    setSelectedTimelineTrack(trackId);
    const keyId = keyEl.dataset.keyId;
    const keys = getTrackKeys(anim, trackId);
    const k = keys.find((kk) => kk.id === keyId);
    if (!k) return;
    const hasMultiSelection = hasCurrentMultiSelection;
    const clickedAlreadySelected = keySelectionHas(trackId, k.id);
    if (wantToggle) {
      toggleTimelineSelection(trackId, k.id);
    } else if (hasMultiSelection) {
      // Keep current multi-selection stable so pressing on a selected set can drag as a group.
      if (clickedAlreadySelected) state.anim.selectedKey = { trackId, keyId: k.id };
      else {
        state.anim.selectedKeys = [{ trackId, keyId: k.id }];
        state.anim.selectedKey = { trackId, keyId: k.id };
      }
    } else if (!clickedAlreadySelected) {
      setSingleTimelineSelection(trackId, k.id);
    } else {
      state.anim.selectedKey = { trackId, keyId: k.id };
    }
    const dragSelection = !wantToggle && hasMultiSelection ? state.anim.selectedKeys : [{ trackId, keyId: k.id }];
    const seed = getDragSeedFromSelection(anim, dragSelection);
    els.keyInterp.value = k.interp || "linear";
    state.anim.timelineDrag = {
      mode: "key_set",
      laneTrackId: trackId,
      pointerId: ev.pointerId,
      anchorTime: Number(k.time) || 0,
      keyAnchor: { trackId, keyId: k.id },
      seed,
      scaleSpan: getTimelineScaleSpanFromSeed(seed, Number(k.time) || 0, editDuration),
    };
    els.timelineTracks.setPointerCapture(ev.pointerId);
    setAnimTime(k.time);
    renderTimelineTracks();
    return;
  }

  if (trackId !== "__ruler__") {
    clearTimelineMarqueeEl();
    state.anim.timelineDrag = {
      mode: "marquee_pending",
      pointerId: ev.pointerId,
      startClientX: ev.clientX,
      startClientY: ev.clientY,
      trackId,
      time: t,
      append: !!(ev.ctrlKey || ev.metaKey),
      started: false,
    };
    els.timelineTracks.setPointerCapture(ev.pointerId);
    return;
  }

  if (parseTrackId(trackId)) {
    setSelectedTimelineTrack(trackId);
  }
  setAnimTime(t);
  clearTimelineKeySelection();
  if (state.mesh) {
    samplePoseAtTime(state.mesh, state.anim.time);
    if (state.boneMode === "pose") updateBoneUI();
  }
  renderTimelineTracks();
});

els.timelineTracks.addEventListener("contextmenu", (ev) => {
  ev.preventDefault();
  const anim = getCurrentAnimation();
  if (!anim) return;
  const laneEl = ev.target.closest(".track-lane");
  const keyEl = ev.target.closest(".track-key");
  if (!laneEl) return;
  const trackId = String(laneEl.dataset.trackId || "");
  if (!trackId) return;
  const timelineRange = getTimelineViewRange(anim);
  const rect = laneEl.getBoundingClientRect();
  const x = ev.clientX - rect.left;
  const t = snapTimeIfNeeded(timeForTimelineX(x, rect.width, timelineRange));
  state.anim.timelineContextTrackId = trackId;
  state.anim.timelineContextTime = t;
  if (keyEl) {
    const summaryScope = String(keyEl.dataset.summaryScope || "");
    if (summaryScope) {
      const summaryTime = Number(keyEl.dataset.summaryTime);
      const summaryGroupKey = String(keyEl.dataset.summaryGroupKey || "");
      const picked = collectSummaryKeyTargets(anim, summaryScope, summaryTime, summaryGroupKey);
      if (picked.length > 0) {
        state.anim.selectedKeys = picked.map((s) => ({ trackId: s.trackId, keyId: s.keyId }));
        state.anim.selectedKey = { ...picked[0] };
        setSelectedTimelineTrack(picked[0].trackId);
        setAnimTime(summaryTime);
      }
    } else if (parseTrackId(trackId)) {
      const keyId = String(keyEl.dataset.keyId || "");
      if (!keySelectionHas(trackId, keyId)) setSingleTimelineSelection(trackId, keyId);
      else state.anim.selectedKey = { trackId, keyId };
      setSelectedTimelineTrack(trackId);
      const keys = getTrackKeys(anim, trackId);
      const k = keys.find((kk) => kk.id === keyId);
      if (k) setAnimTime(Number(k.time) || 0);
    }
  } else {
    if (parseTrackId(trackId)) setSelectedTimelineTrack(trackId, { syncLayer: false });
    clearTimelineKeySelection();
    setAnimTime(t);
  }
  renderTimelineTracks();
  openTimelineKeyContextMenu(ev.clientX, ev.clientY);
});
els.timelineTracks.addEventListener("dragstart", (ev) => {
  ev.preventDefault();
});
els.timelineTracks.addEventListener("pointermove", (ev) => {
  const drag = state.anim.timelineDrag;
  const anim = getCurrentAnimation();
  if (!drag || !anim) return;
  const timelineRange = getTimelineViewRange(anim);
  const editDuration = getTimelineDisplayDuration(anim);
  if (drag.mode === "marquee_pending" || drag.mode === "marquee") {
    ev.preventDefault();
  }
  if (drag.mode === "marquee_pending") {
    const dx = ev.clientX - drag.startClientX;
    const dy = ev.clientY - drag.startClientY;
    if (dx * dx + dy * dy < 9) return;
    const baseSelection = drag.append ? [...(state.anim.selectedKeys || [])] : [];
    if (!drag.append) clearTimelineKeySelection();
    drag.mode = "marquee";
    drag.baseSelection = baseSelection;
    const rootRect = els.timelineTracks.getBoundingClientRect();
    const scrollLeft = els.timelineTracks.scrollLeft;
    const scrollTop = els.timelineTracks.scrollTop;
    const x = drag.startClientX - rootRect.left + scrollLeft;
    const y = drag.startClientY - rootRect.top + scrollTop;
    const mq = ensureTimelineMarqueeEl();
    mq.style.left = `${x}px`;
    mq.style.top = `${y}px`;
    mq.style.width = "0px";
    mq.style.height = "0px";
    applyTimelineSelectionClasses();
  }
  if (drag.mode === "marquee") {
    const rootRect = els.timelineTracks.getBoundingClientRect();
    const scrollLeft = els.timelineTracks.scrollLeft;
    const scrollTop = els.timelineTracks.scrollTop;
    const x0 = drag.startClientX - rootRect.left + scrollLeft;
    const y0 = drag.startClientY - rootRect.top + scrollTop;
    const x1 = ev.clientX - rootRect.left + scrollLeft;
    const y1 = ev.clientY - rootRect.top + scrollTop;
    const left = Math.min(x0, x1);
    const top = Math.min(y0, y1);
    const width = Math.abs(x1 - x0);
    const height = Math.abs(y1 - y0);
    const mq = ensureTimelineMarqueeEl();
    mq.style.left = `${left}px`;
    mq.style.top = `${top}px`;
    mq.style.width = `${width}px`;
    mq.style.height = `${height}px`;
    const pickRect = {
      left: Math.min(drag.startClientX, ev.clientX),
      right: Math.max(drag.startClientX, ev.clientX),
      top: Math.min(drag.startClientY, ev.clientY),
      bottom: Math.max(drag.startClientY, ev.clientY),
    };
    const hit = [];
    for (const keyNode of els.timelineTracks.querySelectorAll(".track-key")) {
      const r = keyNode.getBoundingClientRect();
      if (!rectsOverlap(pickRect, r)) continue;
      const trackId = String(keyNode.dataset.trackId || "");
      const keyId = String(keyNode.dataset.keyId || "");
      if (trackId && keyId) {
        hit.push({ trackId: keyNode.dataset.trackId, keyId: keyNode.dataset.keyId });
        continue;
      }
      const summaryScope = String(keyNode.dataset.summaryScope || "");
      const summaryTime = Number(keyNode.dataset.summaryTime);
      const summaryGroupKey = String(keyNode.dataset.summaryGroupKey || "");
      if (!summaryScope || !Number.isFinite(summaryTime)) continue;
      const picked = collectSummaryKeyTargets(anim, summaryScope, summaryTime, summaryGroupKey);
      for (const s of picked) hit.push(s);
    }
    const out = [];
    const seen = new Set();
    for (const s of [...(drag.baseSelection || []), ...hit]) {
      const k = `${s.trackId}::${s.keyId}`;
      if (seen.has(k)) continue;
      seen.add(k);
      out.push({ trackId: s.trackId, keyId: s.keyId });
    }
    state.anim.selectedKeys = out;
    state.anim.selectedKey = out.length > 0 ? { ...out[0] } : null;
    applyTimelineSelectionClasses();
    return;
  }
  const laneEl = els.timelineTracks.querySelector(`.track-lane[data-track-id='${drag.laneTrackId}']`);
  if (!laneEl) return;
  const rect = laneEl.getBoundingClientRect();
  const x = ev.clientX - rect.left;
  const t = snapTimeIfNeeded(timeForTimelineX(x, rect.width, timelineRange));
  if (drag.mode === "playhead") {
    setAnimTime(t);
    if (state.mesh) {
      samplePoseAtTime(state.mesh, state.anim.time);
      if (state.boneMode === "pose") updateBoneUI();
    }
    renderTimelineTracks();
    return;
  }
  const delta = t - (Number(drag.anchorTime) || 0);
  const scaleMode = !!state.anim.timelineScaleHeld;
  const touched = new Set();
  const preferredAnchor = drag.keyAnchor && drag.keyAnchor.trackId && drag.keyAnchor.keyId ? drag.keyAnchor : null;
  let anchorSelection = null;
  let fallbackSelection = null;
  for (const it of drag.seed || []) {
    const keys = getTrackKeys(anim, it.trackId);
    const keyObj = keys.find((kk) => kk.id === it.keyId);
    if (!keyObj) continue;
    let nextTime = (Number(it.time) || 0) + delta;
    if (scaleMode) {
      const span = Math.max(1e-4, Number(drag.scaleSpan) || 1);
      const factor = math.clamp(1 + delta / span, 0.01, 100);
      nextTime = (Number(drag.anchorTime) || 0) + ((Number(it.time) || 0) - (Number(drag.anchorTime) || 0)) * factor;
    }
    keyObj.time = sanitizeTimelineTime(snapTimeIfNeeded(nextTime), editDuration);
    touched.add(it.trackId);
    if (!fallbackSelection) fallbackSelection = { trackId: it.trackId, keyId: it.keyId, time: keyObj.time };
    if (preferredAnchor && it.trackId === preferredAnchor.trackId && it.keyId === preferredAnchor.keyId) {
      anchorSelection = { trackId: it.trackId, keyId: it.keyId, time: keyObj.time };
    }
  }
  if (!anchorSelection && fallbackSelection) anchorSelection = fallbackSelection;
  drag.touchedTracks = [...touched];
  if (anchorSelection) {
    state.anim.selectedKey = { trackId: anchorSelection.trackId, keyId: anchorSelection.keyId };
    drag.keyAnchor = { trackId: anchorSelection.trackId, keyId: anchorSelection.keyId };
  }
  setAnimTime(t);
  renderTimelineTracks();
});
function clearTimelineDrag(ev) {
  const drag = state.anim.timelineDrag;
  if (!drag) return;
  try {
    els.timelineTracks.releasePointerCapture(ev.pointerId);
  } catch {
    // ignore
  }
  const anim = getCurrentAnimation();
  if (drag.mode === "marquee_pending") {
    if (anim && parseTrackId(drag.trackId)) {
      setSelectedTimelineTrack(drag.trackId, { syncLayer: false });
    }
    if (!drag.append) clearTimelineKeySelection();
    setAnimTime(Number(drag.time) || 0);
    if (state.mesh) {
      samplePoseAtTime(state.mesh, state.anim.time);
      if (state.boneMode === "pose") updateBoneUI();
    }
    state.anim.timelineScaleHeld = false;
    state.anim.timelineDrag = null;
    renderTimelineTracks();
    return;
  }
  if (anim && drag.mode === "key_set") {
    const touched = Array.isArray(drag.touchedTracks) ? drag.touchedTracks : [];
    for (const trackId of touched) {
      if (!trackId) continue;
      normalizeTrackKeys(anim, trackId);
    }
    normalizeSelectedKeys(anim);
  }
  if (drag.mode === "marquee" || drag.mode === "marquee_pending") {
    clearTimelineMarqueeEl();
  }
  state.anim.timelineScaleHeld = false;
  state.anim.timelineDrag = null;
  renderTimelineTracks();
}
els.timelineTracks.addEventListener("pointerup", clearTimelineDrag);
els.timelineTracks.addEventListener("pointercancel", clearTimelineDrag);

