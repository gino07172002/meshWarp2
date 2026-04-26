// ROLE: Timeline UI — DOM-based track rendering, keyframe markers,
// curve editor, audio waveform overlay on event tracks.
// EXPORTS:
//   - renderTimelineTracks (main per-frame DOM rebuild)
//   - addOrUpdateKeyframeAtCurrentTime, deleteKeyframeAtCurrentTimeForTrack
//   - renderCurveEditor, ensureBezierCurveOnKey, getCurveEditTarget
//   - applyTimelineSelectionClasses, refreshTrackSelect
// CONSUMERS: animation-panels.js (refresh hooks), runtime.js (after
//   animation playback advances time), audio waveform decode callback.
// SECTION: Timeline UI — Track Rendering, Key Editing
// renderTimelineTracks: DOM-based timeline track list.
// Handles key insert, delete, bezier handle editing.
// ============================================================
function renderTimelineTracks() {
  const anim = getCurrentAnimation();
  refreshTrackSelect();
  syncTimelineZoomUI();
  const groups = getTimelineGroupsForView(anim);
  const otherRows = getTimelineOtherRowsForView(anim);
  const root = els.timelineTracks;
  root.innerHTML = "";
  if (!anim) return;
  normalizeAnimationRecord(anim);
  const timelineRange = getTimelineViewRange(anim);
  const activeRange = getAnimationActiveRange(anim);
  const ruler = document.createElement("div");
  ruler.className = "timeline-ruler";
  const rulerLabel = document.createElement("div");
  rulerLabel.className = "track-label";
  rulerLabel.textContent = "Time";
  const rulerLane = document.createElement("div");
  rulerLane.className = "track-lane selected";
  rulerLane.dataset.trackId = "__ruler__";
  const rulerPlayhead = document.createElement("div");
  rulerPlayhead.className = "timeline-playhead handle";
  rulerPlayhead.dataset.playhead = "1";
  rulerPlayhead.style.left = `${(timelineXForTime(state.anim.time, 100, timelineRange)).toFixed(4)}%`;
  const rulerBand = document.createElement("div");
  rulerBand.className = "timeline-active-range ruler";
  const rulerBandLeft = timelineXForTime(activeRange.start, 100, timelineRange);
  const rulerBandRight = timelineXForTime(activeRange.end, 100, timelineRange);
  rulerBand.style.left = `${rulerBandLeft.toFixed(4)}%`;
  rulerBand.style.width = `${Math.max(0, rulerBandRight - rulerBandLeft).toFixed(4)}%`;
  rulerLane.appendChild(rulerBand);
  const minorTickMarks = buildTimelineMinorRulerTicks(timelineRange);
  for (const tick of minorTickMarks) {
    const line = document.createElement("div");
    line.className = "timeline-tick minor";
    line.style.left = `${tick.left.toFixed(4)}%`;
    rulerLane.appendChild(line);
  }
  const tickMarks = buildTimelineTickMarks(timelineRange);
  appendTimelineGridToLane(rulerLane, tickMarks, { labels: true });
  const rulerPlayheadLabel = document.createElement("div");
  rulerPlayheadLabel.className = "timeline-playhead-label";
  rulerPlayheadLabel.style.left = `${(timelineXForTime(state.anim.time, 100, timelineRange)).toFixed(4)}%`;
  rulerPlayheadLabel.textContent = formatTimelineTimeLabel(state.anim.time);
  rulerLane.appendChild(rulerPlayheadLabel);
  rulerLane.appendChild(rulerPlayhead);
  ruler.appendChild(rulerLabel);
  ruler.appendChild(rulerLane);
  root.appendChild(ruler);

  const allTrackIds = [
    ...groups.flatMap((g) => (Array.isArray(g.children) ? g.children.map((c) => c.id) : [])),
    ...otherRows.map((r) => r.id),
  ];
  const allRow = document.createElement("div");
  allRow.className = "track-row track-group";
  const allLabel = document.createElement("div");
  allLabel.className = "track-label";
  allLabel.textContent = "All";
  const allLane = document.createElement("div");
  allLane.className = "track-lane";
  allLane.dataset.trackId = "__all__";
  const allBand = document.createElement("div");
  allBand.className = "timeline-active-range";
  allBand.style.left = `${rulerBandLeft.toFixed(4)}%`;
  allBand.style.width = `${Math.max(0, rulerBandRight - rulerBandLeft).toFixed(4)}%`;
  allLane.appendChild(allBand);
  appendTimelineGridToLane(allLane, tickMarks);
  const allPlayhead = document.createElement("div");
  allPlayhead.className = "timeline-playhead";
  allPlayhead.style.left = `${(timelineXForTime(state.anim.time, 100, timelineRange)).toFixed(4)}%`;
  allLane.appendChild(allPlayhead);
  for (const t of collectUniqueKeyTimes(anim, allTrackIds)) {
    const mk = document.createElement("div");
    mk.className = "track-key";
    mk.dataset.summaryScope = "all";
    mk.dataset.summaryTime = String(Number(t).toFixed(6));
    mk.style.left = `${(timelineXForTime(t, 100, timelineRange)).toFixed(4)}%`;
    mk.style.opacity = "0.55";
    allLane.appendChild(mk);
  }
  allRow.appendChild(allLabel);
  allRow.appendChild(allLane);
  root.appendChild(allRow);

  for (const g of groups) {
    const groupKey = String(g.groupKey ?? g.boneIndex ?? "");
    const groupPlayable = isGroupPlayable(groupKey);
    const groupMuted = !!(state.anim.groupMute && state.anim.groupMute[groupKey]);
    const groupSolo = !!(state.anim.groupSolo && state.anim.groupSolo[groupKey]);
    const row = document.createElement("div");
    row.className = "track-row track-group";
    if (groupSolo) row.classList.add("group-solo");
    if (groupMuted) row.classList.add("group-muted");
    if (!groupPlayable) row.classList.add("dimmed");
    const label = document.createElement("div");
    label.className = "track-label";
    label.dataset.groupKey = groupKey;
    const head = document.createElement("div");
    head.className = "track-group-head";
    const titleWrap = document.createElement("span");
    titleWrap.className = "track-group-title-wrap";
    const arrow = document.createElement("span");
    arrow.className = "track-group-arrow";
    arrow.textContent = g.expanded ? "▼" : "▶";
    const visDot = document.createElement("span");
    visDot.className = `track-group-visdot${groupSolo ? " solo" : ""}${groupMuted ? " muted" : ""}`;
    visDot.title = groupMuted ? "Muted group" : groupSolo ? "Solo group" : "Group visible";
    const title = document.createElement("span");
    title.className = "track-group-title";
    title.textContent = `${g.label}`;
    titleWrap.appendChild(arrow);
    titleWrap.appendChild(visDot);
    titleWrap.appendChild(title);
    const tools = document.createElement("span");
    tools.className = "track-group-tools";
    const soloBtn = document.createElement("button");
    soloBtn.type = "button";
    soloBtn.className = `track-group-dot solo-eye${groupSolo ? " active" : ""}`;
    soloBtn.dataset.groupAction = "solo";
    soloBtn.dataset.groupKey = groupKey;
    soloBtn.title = "Solo (show only this group)";
    soloBtn.setAttribute("aria-label", `Solo ${g.label}`);
    soloBtn.textContent = "";
    const muteBtn = document.createElement("button");
    muteBtn.type = "button";
    muteBtn.className = `track-group-dot mute-lock${groupMuted ? " active" : ""}`;
    muteBtn.dataset.groupAction = "mute";
    muteBtn.dataset.groupKey = groupKey;
    muteBtn.title = "Mute (hide this group)";
    muteBtn.setAttribute("aria-label", `Mute ${g.label}`);
    muteBtn.textContent = "";
    tools.appendChild(soloBtn);
    tools.appendChild(muteBtn);
    head.appendChild(titleWrap);
    head.appendChild(tools);
    label.appendChild(head);
    const lane = document.createElement("div");
    lane.className = "track-lane";
    lane.dataset.trackId = g.id;
    const groupBand = document.createElement("div");
    groupBand.className = "timeline-active-range";
    groupBand.style.left = `${rulerBandLeft.toFixed(4)}%`;
    groupBand.style.width = `${Math.max(0, rulerBandRight - rulerBandLeft).toFixed(4)}%`;
    lane.appendChild(groupBand);
    appendTimelineGridToLane(lane, tickMarks);
    const playhead = document.createElement("div");
    playhead.className = "timeline-playhead";
    playhead.style.left = `${(timelineXForTime(state.anim.time, 100, timelineRange)).toFixed(4)}%`;
    lane.appendChild(playhead);

    // Aggregate and render summary keys for the group
    const childTrackIds = g.children ? g.children.map((c) => c.id) : [];
    if (childTrackIds.length > 0) {
      for (const t of collectUniqueKeyTimes(anim, childTrackIds)) {
        const mk = document.createElement("div");
        mk.className = "track-key";
        mk.dataset.summaryScope = "group";
        mk.dataset.summaryGroupKey = groupKey;
        mk.dataset.summaryTime = String(Number(t).toFixed(6));
        mk.style.left = `${(timelineXForTime(t, 100, timelineRange)).toFixed(4)}%`;
        mk.style.opacity = "0.55";
        lane.appendChild(mk);
      }
    }

    row.appendChild(label);
    row.appendChild(lane);
    root.appendChild(row);

    if (!g.expanded) continue;
    for (const td of g.children) {
      const trackPlayable = isTrackPlayable(td.id);
      const crow = document.createElement("div");
      crow.className = "track-row child";
      if (!trackPlayable) crow.classList.add("dimmed");
      const clabel = document.createElement("div");
      clabel.className = "track-label";
      clabel.textContent = td.label;
      const clane = document.createElement("div");
      clane.className = `track-lane${state.anim.selectedTrack === td.id ? " selected" : ""}`;
      clane.dataset.trackId = td.id;
      const childBand = document.createElement("div");
      childBand.className = "timeline-active-range";
      childBand.style.left = `${rulerBandLeft.toFixed(4)}%`;
      childBand.style.width = `${Math.max(0, rulerBandRight - rulerBandLeft).toFixed(4)}%`;
      clane.appendChild(childBand);
      appendTimelineGridToLane(clane, tickMarks);

      const cplay = document.createElement("div");
      cplay.className = "timeline-playhead";
      cplay.style.left = `${(timelineXForTime(state.anim.time, 100, timelineRange)).toFixed(4)}%`;
      clane.appendChild(cplay);

      const keys = getTrackKeys(anim, td.id);
      for (const k of keys) {
        if (!k.id) k.id = `k_${Math.random().toString(36).slice(2, 10)}`;
        const mk = document.createElement("div");
        mk.className = "track-key";
        if (keySelectionHas(td.id, k.id)) mk.classList.add("selected");
        mk.dataset.trackId = td.id;
        mk.dataset.keyId = k.id;
        mk.style.left = `${(timelineXForTime(k.time, 100, timelineRange)).toFixed(4)}%`;
        clane.appendChild(mk);
      }

      crow.appendChild(clabel);
      crow.appendChild(clane);
      root.appendChild(crow);
    }
  }

  for (const td of otherRows) {
    const trackPlayable = isTrackPlayable(td.id);
    const row = document.createElement("div");
    row.className = "track-row child";
    if (!trackPlayable) row.classList.add("dimmed");
    const label = document.createElement("div");
    label.className = "track-label";
    label.textContent = td.label;
    const lane = document.createElement("div");
    lane.className = `track-lane${state.anim.selectedTrack === td.id ? " selected" : ""}`;
    lane.dataset.trackId = td.id;
    const otherBand = document.createElement("div");
    otherBand.className = "timeline-active-range";
    otherBand.style.left = `${rulerBandLeft.toFixed(4)}%`;
    otherBand.style.width = `${Math.max(0, rulerBandRight - rulerBandLeft).toFixed(4)}%`;
    lane.appendChild(otherBand);
    appendTimelineGridToLane(lane, tickMarks);

    const playhead = document.createElement("div");
    playhead.className = "timeline-playhead";
    playhead.style.left = `${(timelineXForTime(state.anim.time, 100, timelineRange)).toFixed(4)}%`;
    lane.appendChild(playhead);

    const keys = getTrackKeys(anim, td.id);
    // For audio-bearing event keys, draw a waveform polyline behind the
    // diamond marker so animators can sync to peaks visually.
    if (td.id === EVENT_TRACK_ID && typeof getTimelineAudioPeaks === "function") {
      for (const k of keys) {
        const audio = k && k.value && k.value.audio ? String(k.value.audio) : "";
        if (!audio) continue;
        const entry = getTimelineAudioPeaks(audio, () => {
          // Re-render once decode completes so the lane picks up the peaks.
          if (typeof renderTimelineTracks === "function") renderTimelineTracks();
        });
        if (!entry || entry.state !== "ready" || !entry.peaks) continue;
        const startPct = timelineXForTime(k.time, 100, timelineRange);
        const endPct = timelineXForTime(k.time + entry.duration, 100, timelineRange);
        const widthPct = endPct - startPct;
        if (widthPct <= 0.01) continue;
        const svg = renderWaveformSvg(entry.peaks);
        svg.classList.add("track-waveform");
        svg.style.left = `${startPct.toFixed(4)}%`;
        svg.style.width = `${widthPct.toFixed(4)}%`;
        lane.appendChild(svg);
      }
    }
    for (const k of keys) {
      if (!k.id) k.id = `k_${Math.random().toString(36).slice(2, 10)}`;
      const mk = document.createElement("div");
      mk.className = "track-key";
      if (keySelectionHas(td.id, k.id)) mk.classList.add("selected");
      mk.dataset.trackId = td.id;
      mk.dataset.keyId = k.id;
      mk.style.left = `${(timelineXForTime(k.time, 100, timelineRange)).toFixed(4)}%`;
      lane.appendChild(mk);
    }

    row.appendChild(label);
    row.appendChild(lane);
    root.appendChild(row);
  }

  applyTimelineSelectionClasses();

  if (state.anim.selectedKeys && state.anim.selectedKeys.length > 1) {
    els.keyInfo.value = `${state.anim.selectedKeys.length} keys selected`;
    if (els.keyInterp) els.keyInterp.disabled = false;
  } else if (state.anim.selectedKey) {
    els.keyInfo.value = `${state.anim.selectedKey.trackId} @ ${state.anim.time.toFixed(2)}s`;
    const keys = getTrackKeys(anim, state.anim.selectedKey.trackId);
    const k = keys.find((x) => x.id === state.anim.selectedKey.keyId);
    if (k) {
      els.keyInterp.value = k.interp || "linear";
      if (els.keyInterp) {
        const parsed = parseTrackId(state.anim.selectedKey.trackId);
        const slotAttachmentTrack = !!(parsed && parsed.type === "slot" && parsed.prop === "attachment");
        const slotClipTrack = !!(
          parsed &&
          parsed.type === "slot" &&
          (parsed.prop === "clip" || parsed.prop === "clipSource" || parsed.prop === "clipEnd")
        );
        const layerEnabledTrack = !!(parsed && parsed.type === "layer" && parsed.prop === "enabled");
        const boneAnimHideTrack = !!(parsed && parsed.type === "bone" && parsed.prop === "animHide");
        const smParamBoolTrack = !!(
          parsed &&
          parsed.type === "smparam" &&
          (() => {
            const sm = ensureStateMachine();
            const param = getStateParamById(sm, parsed.paramId);
            return !!(param && param.type === "bool");
          })()
        );
        els.keyInterp.disabled =
          state.anim.selectedKey.trackId === EVENT_TRACK_ID ||
          state.anim.selectedKey.trackId === DRAWORDER_TRACK_ID ||
          boneAnimHideTrack ||
          slotAttachmentTrack ||
          slotClipTrack ||
          layerEnabledTrack ||
          smParamBoolTrack;
      }
      if (state.anim.selectedKey.trackId === EVENT_TRACK_ID) {
        applyEventDraftToUI(k.value);
      }
    }
  } else {
    els.keyInfo.value = "(none)";
    if (els.keyInterp) {
      els.keyInterp.disabled = false;
      els.keyInterp.value = "linear";
    }
  }
  const selectionCount = getActiveTimelineKeySelection(anim).length;
  if (els.deleteKeyBtn) els.deleteKeyBtn.disabled = selectionCount <= 0;
  if (els.cutKeyBtn) els.cutKeyBtn.disabled = selectionCount <= 0;
  if (els.copyKeyBtn) els.copyKeyBtn.disabled = selectionCount <= 0;
  if (els.pasteKeyBtn) els.pasteKeyBtn.disabled = !hasTimelineClipboardData();
  if (state.anim.timelineContextMenuOpen) refreshTimelineKeyContextMenuUI();
  refreshEventKeyListUI();
  renderCurveEditor();
}

function getCurveEditTarget() {
  const anim = getCurrentAnimation();
  const sk = state.anim.selectedKey;
  if (!anim || !sk) return null;
  const keys = getTrackKeys(anim, sk.trackId).slice().sort((a, b) => a.time - b.time);
  const i = keys.findIndex((k) => k.id === sk.keyId);
  if (i < 0 || keys.length < 2) return null;
  if (i < keys.length - 1) {
    const k0 = keys[i];
    const k1 = keys[i + 1];
    return { anim, trackId: sk.trackId, key: k0, next: k1, segment: "forward" };
  }
  // If selecting the last key, edit the previous segment instead.
  const k0 = keys[i - 1];
  const k1 = keys[i];
  return { anim, trackId: sk.trackId, key: k0, next: k1, segment: "backward" };
}

function ensureBezierCurveOnKey(k) {
  if (!k) return;
  if (!Array.isArray(k.curve) || k.curve.length < 4) {
    k.curve = [0.25, 0.25, 0.75, 0.75];
  }
}

function renderCurveEditor() {
  const cv = els.curveEditor;
  if (!cv) return;
  const wrap = els.curveEditorWrap;
  if (wrap) wrap.classList.toggle("collapsed", !state.anim.curveOpen);
  if (els.curveToggleBtn) {
    els.curveToggleBtn.classList.toggle("active", !!state.anim.curveOpen);
    els.curveToggleBtn.textContent = state.anim.curveOpen ? "Curve On" : "Curve";
  }
  if (!state.anim.curveOpen) return;
  const ctx = cv.getContext("2d");
  if (!ctx) return;
  const target = getCurveEditTarget();
  const w = cv.width;
  const h = cv.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#0a1218";
  ctx.fillRect(0, 0, w, h);
  const pad = 16;
  const gx0 = pad;
  const gy0 = pad;
  const gw = w - pad * 2;
  const gh = h - pad * 2;
  ctx.strokeStyle = "rgba(120,150,168,0.35)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const x = gx0 + (gw * i) / 4;
    const y = gy0 + (gh * i) / 4;
    ctx.beginPath();
    ctx.moveTo(x, gy0);
    ctx.lineTo(x, gy0 + gh);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(gx0, y);
    ctx.lineTo(gx0 + gw, y);
    ctx.stroke();
  }
  if (!target) {
    ctx.fillStyle = "#9eb1ba";
    ctx.font = "12px Segoe UI";
    ctx.fillText("Select a key segment to edit curve.", 16, Math.floor(h * 0.52));
    return;
  }
  const k = target.key;
  const interp = k.interp || "linear";
  if (interp === "bezier") ensureBezierCurveOnKey(k);
  const curve = Array.isArray(k.curve) && k.curve.length >= 4 ? k.curve : [0.25, 0.25, 0.75, 0.75];
  const toX = (u) => gx0 + math.clamp(u, 0, 1) * gw;
  const toY = (v) => gy0 + (1 - math.clamp(v, 0, 1)) * gh;

  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.beginPath();
  ctx.moveTo(toX(0), toY(0));
  if (interp === "stepped") {
    ctx.lineTo(toX(1), toY(0));
    ctx.lineTo(toX(1), toY(1));
  } else if (interp === "bezier") {
    ctx.bezierCurveTo(toX(curve[0]), toY(curve[1]), toX(curve[2]), toY(curve[3]), toX(1), toY(1));
  } else {
    ctx.lineTo(toX(1), toY(1));
  }
  ctx.stroke();

  if (interp === "bezier") {
    const p0 = { x: toX(0), y: toY(0) };
    const p1 = { x: toX(curve[0]), y: toY(curve[1]) };
    const p2 = { x: toX(curve[2]), y: toY(curve[3]) };
    const p3 = { x: toX(1), y: toY(1) };
    ctx.strokeStyle = "rgba(125,211,252,0.55)";
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.moveTo(p3.x, p3.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.fillStyle = "#7dd3fc";
    for (const p of [p1, p2]) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.fillStyle = "#9eb1ba";
  ctx.font = "11px Segoe UI";
  ctx.fillText(`${target.trackId} | ${interp}`, 10, 12);
}

function addOrUpdateKeyframeAtCurrentTime() {
  const m = state.mesh;
  const anim = getCurrentAnimation();
  if (!m || !anim) return;
  if (!state.anim.selectedTrack) refreshTrackSelect();
  const trackId = state.anim.selectedTrack;
  addOrUpdateKeyframeForTrack(trackId, false);
}

function addOrUpdateClipBundleKeyForActiveSlot(silent = false) {
  if (!state.mesh || state.activeSlot < 0) return false;
  const clipTrackId = getSlotTrackId(state.activeSlot, "clip");
  const clipSourceTrackId = getSlotTrackId(state.activeSlot, "clipSource");
  const clipEndTrackId = getSlotTrackId(state.activeSlot, "clipEnd");
  addOrUpdateKeyframeForTrack(clipTrackId, true);
  addOrUpdateKeyframeForTrack(clipSourceTrackId, true);
  addOrUpdateKeyframeForTrack(clipEndTrackId, true);
  setSelectedTimelineTrack(clipTrackId);
  renderTimelineTracks();
  if (!silent) setStatus(`Clip+Src+End key saved @ ${state.anim.time.toFixed(2)}s`);
  return true;
}

function addOrUpdateKeyframeForTrack(trackId, silent = false) {
  const m = state.mesh;
  const anim = getCurrentAnimation();
  if (!anim) return;
  if (!trackId) return;
  const p = parseTrackId(trackId);
  if (!p) return;
  if (!m && p.type !== "smparam") return;
  const t = snapTimeIfNeeded(state.anim.time);
  const v = getTrackValue(m, p);
  const keys = getTrackKeys(anim, trackId);
  const vertexSlotIndex =
    p.type === "mesh"
      ? Number.isFinite(p.slotIndex)
        ? Number(p.slotIndex)
        : state.activeSlot
      : null;
  const existing = keys.find((k) => {
    if (Math.abs(k.time - t) >= 1e-4) return false;
    if (p.type !== "mesh") return true;
    if (!Number.isFinite(vertexSlotIndex) || vertexSlotIndex < 0) return true;
    return Number.isFinite(k.slotIndex) ? Number(k.slotIndex) === Number(vertexSlotIndex) : false;
  });
  const forceStepped =
    trackId === EVENT_TRACK_ID ||
    trackId === DRAWORDER_TRACK_ID ||
    (p.type === "bone" && p.prop === "animHide") ||
    (p.type === "slot" && (p.prop === "attachment" || p.prop === "clip" || p.prop === "clipSource" || p.prop === "clipEnd")) ||
    (p.type === "layer" && p.prop === "enabled") ||
    (p.type === "smparam" && (() => {
      const sm = ensureStateMachine();
      const param = getStateParamById(sm, p.paramId);
      return !!(param && param.type === "bool");
    })());
  const interp = forceStepped ? "stepped" : els.keyInterp.value || "linear";
  if (existing) {
    existing.value = cloneTrackValue(v);
    existing.interp = interp;
    if (interp === "bezier") {
      ensureBezierCurveOnKey(existing);
    } else {
      delete existing.curve;
    }
    if (Number.isFinite(vertexSlotIndex) && vertexSlotIndex >= 0) existing.slotIndex = Number(vertexSlotIndex);
    setSingleTimelineSelection(trackId, existing.id);
  } else {
    const nk = { id: `k_${Math.random().toString(36).slice(2, 10)}`, time: t, value: cloneTrackValue(v), interp };
    if (interp === "bezier") nk.curve = [0.25, 0.25, 0.75, 0.75];
    if (Number.isFinite(vertexSlotIndex) && vertexSlotIndex >= 0) nk.slotIndex = Number(vertexSlotIndex);
    keys.push(nk);
    setSingleTimelineSelection(trackId, nk.id);
  }
  normalizeTrackKeys(anim, trackId);
  setAnimTime(t);
  renderTimelineTracks();
  if (!silent) setStatus(`Key saved: ${trackId} @ ${t.toFixed(2)}s`);
}

function deleteKeyframeAtCurrentTimeForTrack(trackId) {
  const anim = getCurrentAnimation();
  if (!anim || !trackId) return false;
  const keys = getTrackKeys(anim, trackId);
  const t = state.anim.time;
  const before = keys.length;
  anim.tracks[trackId] = keys.filter((k) => Math.abs((Number(k.time) || 0) - t) >= 1e-4);
  if (anim.tracks[trackId].length === before) return false;
  clearTimelineKeySelection();
  renderTimelineTracks();
  return true;
}

function collectChangedTracksAtCurrentTime() {
  const m = state.mesh;
  const anim = getCurrentAnimation();
  if (!m || !anim) return [];
  ensureIKConstraints(m);
  const slotOffsetSnapshots = new Map();
  const slotStateSnapshots = new Map();
  if (state.slots.length > 0) {
    for (let si = 0; si < state.slots.length; si += 1) {
      const slot = state.slots[si];
      if (!slot) continue;
      slotStateSnapshots.set(si, {
        activeAttachment: slot.activeAttachment,
        clipEnabled: (getActiveAttachment(slot) || {}).clipEnabled,
        clipSource: (getActiveAttachment(slot) || {}).clipSource,
        clipEndSlotId: (getActiveAttachment(slot) || {}).clipEndSlotId,
        blend: slot.blend,
        darkEnabled: slot.darkEnabled,
        dr: slot.dr,
        dg: slot.dg,
        db: slot.db,
        r: slot.r,
        g: slot.g,
        b: slot.b,
        alpha: slot.alpha,
      });
      ensureSlotMeshData(slot, m);
      if ((getActiveAttachment(slot) || {}).meshData && (getActiveAttachment(slot) || {}).meshData.offsets) {
        slotOffsetSnapshots.set(si, new Float32Array((getActiveAttachment(slot) || {}).meshData.offsets));
      }
    }
  }
  const offsets = getActiveOffsets(m);
  const temp = {
    rigBones: cloneBones(m.rigBones),
    poseBones: cloneBones(m.rigBones),
    offsets: new Float32Array(offsets),
    baseOffsets: new Float32Array(offsets),
    ikConstraints: JSON.parse(JSON.stringify(m.ikConstraints || [])),
    transformConstraints: JSON.parse(JSON.stringify(m.transformConstraints || [])),
    pathConstraints: JSON.parse(JSON.stringify(m.pathConstraints || [])),
  };
  ensureIKConstraints(temp);
  ensureTransformConstraints(temp);
  ensurePathConstraints(temp);
  samplePoseAtTime(temp, state.anim.time);
  const out = [];
  const eps = 1e-4;
  for (let i = 0; i < m.poseBones.length; i += 1) {
    const cur = m.poseBones[i];
    const base = temp.poseBones[i];
    if (!cur || !base) continue;
    if (Math.abs(cur.tx - base.tx) > eps || Math.abs(cur.ty - base.ty) > eps) {
      out.push(getTrackId(i, "translate"));
    }
    if (Math.abs(cur.rot - base.rot) > eps) {
      out.push(getTrackId(i, "rotate"));
    }
    if (Math.abs(cur.length - base.length) > eps) {
      out.push(getTrackId(i, "scale"));
    }
    if (Math.abs((Number(cur.sx) || 1) - (Number(base.sx) || 1)) > eps) {
      out.push(getTrackId(i, "scaleX"));
    }
    if (Math.abs((Number(cur.sy) || 1) - (Number(base.sy) || 1)) > eps) {
      out.push(getTrackId(i, "scaleY"));
    }
    if (Math.abs((Number(cur.shx) || 0) - (Number(base.shx) || 0)) > eps) {
      out.push(getTrackId(i, "shearX"));
    }
    if (Math.abs((Number(cur.shy) || 0) - (Number(base.shy) || 0)) > eps) {
      out.push(getTrackId(i, "shearY"));
    }
    if (!!cur.animHidden !== !!base.animHidden) {
      out.push(getTrackId(i, "animHide"));
    }
  }
  if (state.slots.length > 0) {
    for (const [si, saved] of slotOffsetSnapshots.entries()) {
      const sampled = getModelSlotOffsets(temp, si);
      let changed = false;
      if (sampled && sampled.length === saved.length) {
        for (let i = 0; i < saved.length; i += 1) {
          if (Math.abs(saved[i] - sampled[i]) > eps) {
            changed = true;
            break;
          }
        }
      }
      if (changed) {
        const slot = state.slots[si];
        out.push(getVertexTrackId(si, slot ? getSlotCurrentAttachmentName(slot) || slot.attachmentName || "main" : null));
      }
      const slot = state.slots[si];
      const current = slot && (getActiveAttachment(slot) || {}).meshData ? (getActiveAttachment(slot) || {}).meshData.offsets : null;
      if (current && current.length === saved.length) current.set(saved);
    }
  } else if (temp.offsets && temp.offsets.length === offsets.length) {
    let changed = false;
    for (let i = 0; i < offsets.length; i += 1) {
      if (Math.abs(offsets[i] - temp.offsets[i]) > eps) {
        changed = true;
        break;
      }
    }
    if (changed) out.push(VERTEX_TRACK_ID);
  }
  const nowIK = ensureIKConstraints(m);
  const baseIK = ensureIKConstraints(temp);
  const ikN = Math.min(nowIK.length, baseIK.length);
  for (let i = 0; i < ikN; i += 1) {
    if (Math.abs((Number(nowIK[i].mix) || 0) - (Number(baseIK[i].mix) || 0)) > eps) {
      out.push(getIKTrackId(i, "mix"));
    }
    if (Math.abs((Math.max(0, Number(nowIK[i].softness) || 0)) - (Math.max(0, Number(baseIK[i].softness) || 0))) > eps) {
      out.push(getIKTrackId(i, "softness"));
    }
    if ((nowIK[i].bendPositive !== false) !== (baseIK[i].bendPositive !== false)) {
      out.push(getIKTrackId(i, "bend"));
    }
    if (!!nowIK[i].compress !== !!baseIK[i].compress) out.push(getIKTrackId(i, "compress"));
    if (!!nowIK[i].stretch !== !!baseIK[i].stretch) out.push(getIKTrackId(i, "stretch"));
    if (!!nowIK[i].uniform !== !!baseIK[i].uniform) out.push(getIKTrackId(i, "uniform"));
    const nx = Number(nowIK[i].targetX);
    const ny = Number(nowIK[i].targetY);
    const bx = Number(baseIK[i].targetX);
    const by = Number(baseIK[i].targetY);
    const xChanged =
      (Number.isFinite(nx) && !Number.isFinite(bx)) ||
      (!Number.isFinite(nx) && Number.isFinite(bx)) ||
      (Number.isFinite(nx) && Number.isFinite(bx) && Math.abs(nx - bx) > eps);
    const yChanged =
      (Number.isFinite(ny) && !Number.isFinite(by)) ||
      (!Number.isFinite(ny) && Number.isFinite(by)) ||
      (Number.isFinite(ny) && Number.isFinite(by) && Math.abs(ny - by) > eps);
    if (xChanged || yChanged) {
      out.push(getIKTrackId(i, "target"));
    }
  }
  const nowT = ensureTransformConstraints(m);
  const baseT = ensureTransformConstraints(temp);
  const tN = Math.min(nowT.length, baseT.length);
  for (let i = 0; i < tN; i += 1) {
    if (Math.abs((Number(nowT[i].rotateMix) || 0) - (Number(baseT[i].rotateMix) || 0)) > eps) out.push(getTransformTrackId(i, "rotateMix"));
    if (Math.abs((Number(nowT[i].translateMix) || 0) - (Number(baseT[i].translateMix) || 0)) > eps)
      out.push(getTransformTrackId(i, "translateMix"));
    if (Math.abs((Number(nowT[i].scaleMix) || 0) - (Number(baseT[i].scaleMix) || 0)) > eps) out.push(getTransformTrackId(i, "scaleMix"));
    if (Math.abs((Number(nowT[i].shearMix) || 0) - (Number(baseT[i].shearMix) || 0)) > eps) out.push(getTransformTrackId(i, "shearMix"));
  }
  const nowP = ensurePathConstraints(m);
  const baseP = ensurePathConstraints(temp);
  const pN = Math.min(nowP.length, baseP.length);
  for (let i = 0; i < pN; i += 1) {
    if (Math.abs((Number(nowP[i].position) || 0) - (Number(baseP[i].position) || 0)) > eps) out.push(getPathTrackId(i, "position"));
    if (Math.abs((Number(nowP[i].spacing) || 0) - (Number(baseP[i].spacing) || 0)) > eps) out.push(getPathTrackId(i, "spacing"));
    if (Math.abs((Number(nowP[i].rotateMix) || 0) - (Number(baseP[i].rotateMix) || 0)) > eps) out.push(getPathTrackId(i, "rotateMix"));
    if (Math.abs((Number(nowP[i].translateMix) || 0) - (Number(baseP[i].translateMix) || 0)) > eps)
      out.push(getPathTrackId(i, "translateMix"));
  }
  for (const [si, snap] of slotStateSnapshots.entries()) {
    const slot = state.slots[si];
    if (!slot || !snap) continue;
    slot.activeAttachment = snap.activeAttachment;
    const snapRestoreAtt = getActiveAttachment(slot);
    if (snapRestoreAtt) {
      snapRestoreAtt.clipEnabled = snap.clipEnabled;
      snapRestoreAtt.clipSource = snap.clipSource;
      snapRestoreAtt.clipEndSlotId = snap.clipEndSlotId;
    }
    slot.blend = snap.blend;
    slot.darkEnabled = snap.darkEnabled;
    slot.dr = snap.dr;
    slot.dg = snap.dg;
    slot.db = snap.db;
    slot.r = snap.r;
    slot.g = snap.g;
    slot.b = snap.b;
    slot.alpha = snap.alpha;
    ensureSlotVisualState(slot);
  }
  return [...new Set(out)];
}

function addAutoKeyframeFromDirty(silent = false) {
  if (!state.mesh) return;
  let dirty = [...state.anim.dirtyTracks];
  if (dirty.length === 0) dirty = collectChangedTracksAtCurrentTime();
  if (dirty.length === 0 && state.boneMode === "pose" && state.selectedIK >= 0) {
    const list = ensureIKConstraints(state.mesh);
    const ik = list[state.selectedIK];
    if (ik && (!Number.isFinite(Number(ik.target)) || Number(ik.target) < 0)) {
      dirty = [getIKTrackId(state.selectedIK, "target")];
    }
  }
  if (dirty.length === 0) dirty = [state.anim.selectedTrack].filter(Boolean);
  if (dirty.length === 0) {
    addOrUpdateKeyframeAtCurrentTime();
    return;
  }
  for (const trackId of dirty) {
    addOrUpdateKeyframeForTrack(trackId, true);
  }
  state.anim.dirtyTracks = [];
  if (!silent) setStatus(`Auto key on ${dirty.length} track(s) @ ${state.anim.time.toFixed(2)}s`);
}

function refreshAutoKeyUI() {
  if (!els.autoKeyBtn) return;
  const on = !!state.anim.autoKey;
  els.autoKeyBtn.classList.toggle("recording", on);
  els.autoKeyBtn.textContent = on ? "● Rec On" : "● Rec";
  els.autoKeyBtn.title = on ? "Auto Key: On" : "Auto Key: Off";
}

function updatePlaybackButtons() {
  const playing = !!state.anim.playing;
  if (els.playBtn) {
    els.playBtn.classList.toggle("playing", playing);
    els.playBtn.classList.toggle("paused", !playing);
    els.playBtn.textContent = playing ? "Pause" : "Play";
  }
  refreshAutoKeyUI();
  if (typeof requestRender === "function") requestRender("playback-ui");
}

function deleteSelectedOrCurrentKeyframe() {
  const removed = removeTimelineKeysBySelection(null, { silent: true });
  if (removed <= 0) {
    setStatus("No selected key.");
    return;
  }
  setStatus(removed > 1 ? `${removed} keys deleted.` : "Key deleted.");
}

function copySelectedKeyframe() {
  const anim = getCurrentAnimation();
  const selection = getActiveTimelineKeySelection(anim);
  const items = getTimelineClipboardItems(selection, anim);
  if (!anim || items.length <= 0) {
    setStatus("No selected key.");
    return 0;
  }
  state.anim.keyClipboard = buildTimelineClipboardPayload(items, state.anim.selectedKey);
  const count = items.length;
  setStatus(count > 1 ? `${count} keys copied.` : "Key copied.");
  return count;
}

function cutSelectedKeyframe() {
  const anim = getCurrentAnimation();
  const selection = getActiveTimelineKeySelection(anim);
  const items = getTimelineClipboardItems(selection, anim);
  if (!anim || items.length <= 0) {
    setStatus("No selected key.");
    return 0;
  }
  state.anim.keyClipboard = buildTimelineClipboardPayload(items, state.anim.selectedKey);
  const removed = removeTimelineKeysBySelection(selection, { silent: true });
  if (removed <= 0) {
    setStatus("No key removed.");
    return 0;
  }
  setStatus(removed > 1 ? `${removed} keys cut.` : "Key cut.");
  return removed;
}

function pasteKeyframeAtCurrentTime() {
  const anim = getCurrentAnimation();
  const clipItems = resolveTimelineClipboardItems();
  if (!anim || clipItems.length <= 0) {
    setStatus("Clipboard is empty.");
    return 0;
  }
  const anchorTime = snapTimeIfNeeded(state.anim.time);
  const touchedTracks = new Set();
  const pasted = [];
  for (const item of clipItems) {
    const targetTrackId =
      clipItems.length === 1
        ? String(state.anim.selectedTrack || item.trackId || state.anim.keyClipboard.sourceTrackId || "")
        : String(item.trackId || "");
    if (!targetTrackId) continue;
    const parsed = parseTrackId(targetTrackId);
    const pasteSlotIndex =
      parsed && parsed.type === "mesh"
        ? Number.isFinite(parsed.slotIndex)
          ? Number(parsed.slotIndex)
          : Number.isFinite(item.slotIndex)
            ? Number(item.slotIndex)
            : state.activeSlot
        : null;
    const keys = getTrackKeys(anim, targetTrackId);
    const t = sanitizeTimelineTime(snapTimeIfNeeded(anchorTime + (Number(item.relTime) || 0)), getTimelineDisplayDuration(anim));
    const existing = keys.find((k) => {
      if (Math.abs((Number(k.time) || 0) - t) >= 1e-4) return false;
      if (!(parsed && parsed.type === "mesh")) return true;
      if (!Number.isFinite(pasteSlotIndex) || pasteSlotIndex < 0) return true;
      return Number.isFinite(k.slotIndex) ? Number(k.slotIndex) === Number(pasteSlotIndex) : false;
    });
    if (existing) {
      existing.value = cloneTrackValue(item.value);
      existing.interp = item.interp || "linear";
      if (Array.isArray(item.curve) && item.curve.length >= 4) existing.curve = item.curve.slice(0, 4);
      else delete existing.curve;
      if (parsed && parsed.type === "mesh" && Number.isFinite(pasteSlotIndex) && pasteSlotIndex >= 0) {
        existing.slotIndex = Number(pasteSlotIndex);
      }
      pasted.push({ trackId: targetTrackId, keyId: existing.id });
    } else {
      const nk = {
        id: `k_${Math.random().toString(36).slice(2, 10)}`,
        time: t,
        value: cloneTrackValue(item.value),
        interp: item.interp || "linear",
      };
      if (Array.isArray(item.curve) && item.curve.length >= 4) nk.curve = item.curve.slice(0, 4);
      if (parsed && parsed.type === "mesh" && Number.isFinite(pasteSlotIndex) && pasteSlotIndex >= 0) {
        nk.slotIndex = Number(pasteSlotIndex);
      }
      keys.push(nk);
      pasted.push({ trackId: targetTrackId, keyId: nk.id });
    }
    touchedTracks.add(targetTrackId);
  }
  if (pasted.length <= 0) {
    setStatus("No valid key target to paste.");
    return 0;
  }
  for (const trackId of touchedTracks) normalizeTrackKeys(anim, trackId);
  state.anim.selectedKeys = pasted.map((s) => ({ trackId: s.trackId, keyId: s.keyId }));
  state.anim.selectedKey = pasted.length > 0 ? { ...pasted[0] } : null;
  setSelectedTimelineTrack(pasted[0].trackId);
  setAnimTime(anchorTime);
  renderTimelineTracks();
  setStatus(pasted.length > 1 ? `${pasted.length} keys pasted/overwritten.` : "Key pasted/overwritten.");
  return pasted.length;
}

function jumpToNeighborKey(direction) {
  const anim = getCurrentAnimation();
  if (!anim || !state.anim.selectedTrack) return;
  const keys = getTrackKeys(anim, state.anim.selectedTrack);
  if (!keys || keys.length === 0) return;
  const t = state.anim.time;
  const ordered = [...keys].sort((a, b) => a.time - b.time);
  let target = null;
  if (direction > 0) {
    target = ordered.find((k) => k.time > t + 1e-5) || ordered[0];
  } else {
    for (let i = ordered.length - 1; i >= 0; i -= 1) {
      if (ordered[i].time < t - 1e-5) {
        target = ordered[i];
        break;
      }
    }
    if (!target) target = ordered[ordered.length - 1];
  }
  setAnimTime(target.time);
  setSingleTimelineSelection(state.anim.selectedTrack, target.id);
  if (state.mesh) {
    samplePoseAtTime(state.mesh, state.anim.time);
    if (state.boneMode === "pose") updateBoneUI();
  }
  renderTimelineTracks();
}

function applyLoopSeamOnSelectedTrack() {
  const anim = getCurrentAnimation();
  if (!anim || !state.anim.selectedTrack) return false;
  const trackId = state.anim.selectedTrack;
  if (!parseTrackId(trackId)) return false;
  const keys = getTrackKeys(anim, trackId);
  if (!Array.isArray(keys) || keys.length <= 0) return false;
  normalizeTrackKeys(anim, trackId);
  const sorted = getTrackKeys(anim, trackId);
  if (sorted.length <= 0) return false;
  const duration = Math.max(0.1, Number(anim.duration) || 0.1);
  const first = sorted[0];
  let endKey = sorted.find((k) => Math.abs((Number(k.time) || 0) - duration) < 1e-4);
  if (!endKey) {
    endKey = { id: `k_${Math.random().toString(36).slice(2, 10)}`, time: duration, value: cloneTrackValue(first.value), interp: "linear" };
    sorted.push(endKey);
  } else {
    endKey.value = cloneTrackValue(first.value);
  }
  endKey.time = duration;
  endKey.value = cloneTrackValue(first.value);
  endKey.interp = first.interp || "linear";
  if (Array.isArray(first.curve) && first.curve.length >= 4) endKey.curve = first.curve.slice(0, 4);
  else delete endKey.curve;
  normalizeTrackKeys(anim, trackId);
  setSingleTimelineSelection(trackId, endKey.id);
  setStatus(`Loop seam applied on ${trackId}.`);
  renderTimelineTracks();
  return true;
}

function applyLoopPingPongOnSelectedTrack() {
  const anim = getCurrentAnimation();
  if (!anim || !state.anim.selectedTrack) return false;
  const trackId = state.anim.selectedTrack;
  if (!parseTrackId(trackId)) return false;
  const keys = getTrackKeys(anim, trackId);
  if (!Array.isArray(keys) || keys.length < 2) return false;
  normalizeTrackKeys(anim, trackId);
  const sorted = getTrackKeys(anim, trackId).slice().sort((a, b) => (Number(a.time) || 0) - (Number(b.time) || 0));
  const duration = Math.max(0.1, Number(anim.duration) || 0.1);
  const base = sorted.filter((k) => (Number(k.time) || 0) <= duration + 1e-4);
  if (base.length < 2) return false;
  const out = base.map((k) => ({
    id: String(k.id || `k_${Math.random().toString(36).slice(2, 10)}`),
    time: Number(k.time) || 0,
    value: cloneTrackValue(k.value),
    interp: k.interp || "linear",
    curve: Array.isArray(k.curve) && k.curve.length >= 4 ? k.curve.slice(0, 4) : undefined,
    slotIndex: Number.isFinite(k.slotIndex) ? Number(k.slotIndex) : undefined,
  }));
  for (let i = base.length - 2; i >= 1; i -= 1) {
    const src = base[i];
    const t = duration + (duration - (Number(src.time) || 0));
    out.push({
      id: `k_${Math.random().toString(36).slice(2, 10)}`,
      time: t,
      value: cloneTrackValue(src.value),
      interp: src.interp || "linear",
      curve: Array.isArray(src.curve) && src.curve.length >= 4 ? src.curve.slice(0, 4) : undefined,
      slotIndex: Number.isFinite(src.slotIndex) ? Number(src.slotIndex) : undefined,
    });
  }
  const first = base[0];
  out.push({
    id: `k_${Math.random().toString(36).slice(2, 10)}`,
    time: duration * 2,
    value: cloneTrackValue(first.value),
    interp: first.interp || "linear",
    curve: Array.isArray(first.curve) && first.curve.length >= 4 ? first.curve.slice(0, 4) : undefined,
    slotIndex: Number.isFinite(first.slotIndex) ? Number(first.slotIndex) : undefined,
  });
  anim.tracks[trackId] = out;
  anim.duration = duration * 2;
  state.anim.duration = anim.duration;
  if (els.animDuration) els.animDuration.value = String(anim.duration);
  normalizeTrackKeys(anim, trackId);
  setAnimTime(math.clamp(state.anim.time, 0, anim.duration), anim.duration);
  setStatus(`Loop pingpong applied on ${trackId}; duration ${anim.duration.toFixed(3)}s.`);
  renderTimelineTracks();
  return true;
}

function addOrUpdateEventAtCurrentTime() {
  const anim = getCurrentAnimation();
  if (!anim) return;
  const t = snapTimeIfNeeded(state.anim.time);
  const keys = getTrackKeys(anim, EVENT_TRACK_ID);
  const existing = keys.find((k) => Math.abs((Number(k.time) || 0) - t) < 1e-4);
  const value = getEventDraftFromUI();
  if (existing) {
    existing.value = value;
    existing.interp = "stepped";
    setSingleTimelineSelection(EVENT_TRACK_ID, existing.id);
  } else {
    const nk = { id: `k_${Math.random().toString(36).slice(2, 10)}`, time: t, value, interp: "stepped" };
    keys.push(nk);
    setSingleTimelineSelection(EVENT_TRACK_ID, nk.id);
  }
  normalizeTrackKeys(anim, EVENT_TRACK_ID);
  setAnimTime(t);
  renderTimelineTracks();
  setStatus(`Event key saved @ ${t.toFixed(3)}s`);
}

function updateSelectedEventKeyFromUI() {
  const anim = getCurrentAnimation();
  const sk = state.anim.selectedKey;
  if (!anim || !sk || sk.trackId !== EVENT_TRACK_ID) return;
  const keys = getTrackKeys(anim, EVENT_TRACK_ID);
  const k = keys.find((it) => it.id === sk.keyId);
  if (!k) return;
  k.value = getEventDraftFromUI();
  renderTimelineTracks();
}

function deleteSelectedEventKey() {
  const anim = getCurrentAnimation();
  const sk = state.anim.selectedKey;
  if (!anim || !sk || sk.trackId !== EVENT_TRACK_ID) return false;
  const keys = getTrackKeys(anim, EVENT_TRACK_ID);
  const before = keys.length;
  anim.tracks[EVENT_TRACK_ID] = keys.filter((k) => k.id !== sk.keyId);
  if (anim.tracks[EVENT_TRACK_ID].length === before) return false;
  clearTimelineKeySelection();
  renderTimelineTracks();
  return true;
}

function lerpAngle(a, b, t) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

function lerpArray(a, b, t) {
  const n = Math.min(Array.isArray(a) ? a.length : 0, Array.isArray(b) ? b.length : 0);
  const out = new Array(n);
  for (let i = 0; i < n; i += 1) {
    const av = Number(a[i]) || 0;
    const bv = Number(b[i]) || 0;
    out[i] = av + (bv - av) * t;
  }
  return out;
}

function evalBezier1D(u, p1, p2) {
  const omt = 1 - u;
  return 3 * omt * omt * u * p1 + 3 * omt * u * u * p2 + u * u * u;
}

function evalBezierEase(alpha, curve) {
  const c = Array.isArray(curve) && curve.length >= 4 ? curve : [0.25, 0.25, 0.75, 0.75];
  const x1 = math.clamp(Number(c[0]) || 0, 0, 1);
  const y1 = math.clamp(Number(c[1]) || 0, 0, 1);
  const x2 = math.clamp(Number(c[2]) || 1, 0, 1);
  const y2 = math.clamp(Number(c[3]) || 1, 0, 1);
  const x = math.clamp(alpha, 0, 1);
  let lo = 0;
  let hi = 1;
  let u = x;
  for (let i = 0; i < 18; i += 1) {
    const xu = evalBezier1D(u, x1, x2);
    if (Math.abs(xu - x) < 1e-5) break;
    if (xu > x) hi = u;
    else lo = u;
    u = (lo + hi) * 0.5;
  }
  return math.clamp(evalBezier1D(u, y1, y2), 0, 1);
}

function sampleTrackValueAtTime(keys, parsed, t) {
  if (!keys || keys.length === 0) return null;
  if (keys.length === 1 || t <= keys[0].time) return cloneTrackValue(keys[0].value);
  if (t >= keys[keys.length - 1].time) return cloneTrackValue(keys[keys.length - 1].value);
  let i1 = 1;
  while (i1 < keys.length && keys[i1].time < t) i1 += 1;
  const k0 = keys[i1 - 1];
  const k1 = keys[i1];
  const span = Math.max(1e-6, k1.time - k0.time);
  let alpha = (t - k0.time) / span;
  const interp = k0.interp || "linear";
  if (interp === "stepped") return cloneTrackValue(k0.value);
  if (interp === "bezier") alpha = evalBezierEase(alpha, k0.curve);
  if (parsed.type === "mesh") return lerpArray(k0.value, k1.value, alpha);
  if (parsed.type === "ik" && parsed.prop === "target") {
    return {
      x: (Number(k0.value && k0.value.x) || 0) + ((Number(k1.value && k1.value.x) || 0) - (Number(k0.value && k0.value.x) || 0)) * alpha,
      y: (Number(k0.value && k0.value.y) || 0) + ((Number(k1.value && k1.value.y) || 0) - (Number(k0.value && k0.value.y) || 0)) * alpha,
    };
  }
  if (parsed.type === "ik" && parsed.prop === "bend") return alpha < 0.5 ? k0.value : k1.value;
  if (parsed.type === "ik" && (parsed.prop === "compress" || parsed.prop === "stretch" || parsed.prop === "uniform")) {
    return alpha < 0.5 ? k0.value : k1.value;
  }
  if (parsed.type === "bone" && parsed.prop === "animHide") return alpha < 0.5 ? cloneTrackValue(k0.value) : cloneTrackValue(k1.value);
  if (parsed.type === "layer" && parsed.prop === "enabled") return alpha < 0.5 ? cloneTrackValue(k0.value) : cloneTrackValue(k1.value);
  if (parsed.type === "smparam") {
    const sm = ensureStateMachine();
    const param = getStateParamById(sm, parsed.paramId);
    if (param && param.type === "bool") return alpha < 0.5 ? cloneTrackValue(k0.value) : cloneTrackValue(k1.value);
  }
  if (parsed.type === "draworder") return alpha < 0.5 ? cloneTrackValue(k0.value) : cloneTrackValue(k1.value);
  if (parsed.type === "slot" && parsed.prop === "attachment") return alpha < 0.5 ? cloneTrackValue(k0.value) : cloneTrackValue(k1.value);
  if (parsed.type === "slot" && parsed.prop === "clip") return alpha < 0.5 ? cloneTrackValue(k0.value) : cloneTrackValue(k1.value);
  if (parsed.type === "slot" && parsed.prop === "clipSource") return alpha < 0.5 ? cloneTrackValue(k0.value) : cloneTrackValue(k1.value);
  if (parsed.type === "slot" && parsed.prop === "clipEnd") return alpha < 0.5 ? cloneTrackValue(k0.value) : cloneTrackValue(k1.value);
  if (parsed.type === "slot" && parsed.prop === "color") {
    const a0 = k0.value && typeof k0.value === "object" ? k0.value : {};
    const a1 = k1.value && typeof k1.value === "object" ? k1.value : {};
    const d0 = !!a0.darkEnabled;
    const d1 = !!a1.darkEnabled;
    return {
      r: (Number(a0.r) || 1) + ((Number(a1.r) || 1) - (Number(a0.r) || 1)) * alpha,
      g: (Number(a0.g) || 1) + ((Number(a1.g) || 1) - (Number(a0.g) || 1)) * alpha,
      b: (Number(a0.b) || 1) + ((Number(a1.b) || 1) - (Number(a0.b) || 1)) * alpha,
      a: (Number(a0.a) || 1) + ((Number(a1.a) || 1) - (Number(a0.a) || 1)) * alpha,
      darkEnabled: alpha < 0.5 ? d0 : d1,
      dr: (Number(a0.dr) || 0) + ((Number(a1.dr) || 0) - (Number(a0.dr) || 0)) * alpha,
      dg: (Number(a0.dg) || 0) + ((Number(a1.dg) || 0) - (Number(a0.dg) || 0)) * alpha,
      db: (Number(a0.db) || 0) + ((Number(a1.db) || 0) - (Number(a0.db) || 0)) * alpha,
    };
  }
  if (parsed.prop === "rotate") return lerpAngle(k0.value, k1.value, alpha);
  if (parsed.prop === "translate") {
    return { x: k0.value.x + (k1.value.x - k0.value.x) * alpha, y: k0.value.y + (k1.value.y - k0.value.y) * alpha };
  }
  return k0.value + (k1.value - k0.value) * alpha;
}

function sampleAnimationToModelAtTime(m, anim, t, opts = null) {
  if (!m || !anim) return;
  const options = opts && typeof opts === "object" ? opts : {};
  const applyLayerStateTracks = options.applyLayerStateTracks !== false;
  const applySlotTracks = options.applySlotTracks !== false;
  const applyStateParamTracks = options.applyStateParamTracks !== false;
  syncPoseFromRig(m);
  resetModelSlotOffsetsToBase(m);
  const tracks = anim.tracks;
  for (const trackId of Object.keys(tracks)) {
    if (!isTrackPlayable(trackId)) continue;
    const keys = tracks[trackId];
    if (!keys || keys.length === 0) continue;
    const parsed = parseTrackId(trackId);
    if (!parsed) continue;
    if (!applyLayerStateTracks && parsed.type === "layer") continue;
    if (!applySlotTracks && parsed.type === "slot") continue;
    if (!applyStateParamTracks && parsed.type === "smparam") continue;
    const sampled = sampleTrackValueAtTime(keys, parsed, t);
    setTrackValue(m, parsed, sampled);
  }
  for (let i = 0; i < m.poseBones.length; i += 1) {
    if (m.rigBones[i] && m.rigBones[i].poseLenEditable === false) {
      m.poseBones[i].length = m.rigBones[i].length;
    }
  }
  enforceConnectedHeads(m.poseBones);
}

function shortestAngleDelta(from, to) {
  let d = (Number(to) || 0) - (Number(from) || 0);
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

function isBoneAffectedByLayerMask(layer, boneIndex, bones) {
  if (!layer) return true;
  const mode = layer.maskMode || "all";
  if (mode === "all") return true;
  const set = new Set(Array.isArray(layer.maskBones) ? layer.maskBones : []);
  let hit = false;
  let curr = boneIndex;
  const visited = new Set();
  while (Number.isFinite(curr) && curr >= 0 && curr < bones.length && !visited.has(curr)) {
    visited.add(curr);
    if (set.has(curr)) {
      hit = true;
      break;
    }
    curr = Number(bones[curr] && bones[curr].parent);
  }
  return mode === "include" ? hit : !hit;
}

function blendBoneByMode(out, sampled, rig, alpha, mode) {
  const a = math.clamp(Number(alpha) || 0, 0, 1);
  if (!out || !sampled || a <= 0) return;
  if (mode === "add") {
    const base = rig || out;
    out.tx = (Number(out.tx) || 0) + ((Number(sampled.tx) || 0) - (Number(base.tx) || 0)) * a;
    out.ty = (Number(out.ty) || 0) + ((Number(sampled.ty) || 0) - (Number(base.ty) || 0)) * a;
    out.rot = (Number(out.rot) || 0) + shortestAngleDelta(base.rot, sampled.rot) * a;
    out.length = (Number(out.length) || 0) + ((Number(sampled.length) || 0) - (Number(base.length) || 0)) * a;
    out.sx = (Number(out.sx) || 0) + ((Number(sampled.sx) || 0) - (Number(base.sx) || 0)) * a;
    out.sy = (Number(out.sy) || 0) + ((Number(sampled.sy) || 0) - (Number(base.sy) || 0)) * a;
    out.shx = (Number(out.shx) || 0) + ((Number(sampled.shx) || 0) - (Number(base.shx) || 0)) * a;
    out.shy = (Number(out.shy) || 0) + ((Number(sampled.shy) || 0) - (Number(base.shy) || 0)) * a;
    return;
  }
  out.tx = (Number(out.tx) || 0) + ((Number(sampled.tx) || 0) - (Number(out.tx) || 0)) * a;
  out.ty = (Number(out.ty) || 0) + ((Number(sampled.ty) || 0) - (Number(out.ty) || 0)) * a;
  out.rot = lerpAngle(Number(out.rot) || 0, Number(sampled.rot) || 0, a);
  out.length = (Number(out.length) || 0) + ((Number(sampled.length) || 0) - (Number(out.length) || 0)) * a;
  out.sx = (Number(out.sx) || 0) + ((Number(sampled.sx) || 0) - (Number(out.sx) || 0)) * a;
  out.sy = (Number(out.sy) || 0) + ((Number(sampled.sy) || 0) - (Number(out.sy) || 0)) * a;
  out.shx = (Number(out.shx) || 0) + ((Number(sampled.shx) || 0) - (Number(out.shx) || 0)) * a;
  out.shy = (Number(out.shy) || 0) + ((Number(sampled.shy) || 0) - (Number(out.shy) || 0)) * a;
}

function wrapTime(t, duration) {
  const d = Math.max(0.001, Number(duration) || 0.001);
  let out = Number(t) || 0;
  out %= d;
  if (out < 0) out += d;
  return out;
}

function getLayerSampleTime(layer, anim, baseTime) {
  const dur = Math.max(0.001, Number(anim && anim.duration) || 0.001);
  const speed = Number(layer && layer.speed);
  const s = Number.isFinite(speed) ? math.clamp(speed, -10, 10) : 1;
  const offset = Number(layer && layer.offset) || 0;
  const raw = (Number(baseTime) || 0) * s + offset;
  if (layer && layer.loop !== false) return wrapTime(raw, dur);
  return math.clamp(raw, 0, dur);
}

function getPlaybackDurationForCurrentState(baseAnim) {
  let out = getAnimationActiveRange(baseAnim).end;
  for (const layer of ensureAnimLayerTracks()) {
    if (!layer || layer.enabled === false || layer.loop !== false) continue;
    const la = state.anim.animations.find((a) => a.id === layer.animId);
    if (!la) continue;
    const speed = Number(layer.speed);
    const absSpeed = Math.abs(Number.isFinite(speed) ? speed : 1);
    if (absSpeed < 1e-6) continue;
    const offset = Number(layer.offset) || 0;
    const doneTime = (Math.max(0, offset) + Math.max(0, Number(la.duration) || 0)) / absSpeed;
    out = Math.max(out, doneTime);
  }
  return Math.max(0.1, out);
}

function getPlaybackRangeForCurrentState(baseAnim) {
  const active = getAnimationActiveRange(baseAnim);
  return {
    start: active.start,
    end: Math.max(active.end, getPlaybackDurationForCurrentState(baseAnim)),
  };
}

function applyAnimationLayersToModelAtTime(m, baseAnim, t, opts = null) {
  if (!m || !baseAnim) return;
  const options = opts && typeof opts === "object" ? opts : {};
  const applyLayerStateTracks = options.applyLayerStateTracks !== false;
  sampleAnimationToModelAtTime(m, baseAnim, t, { applyLayerStateTracks });
  const layers = ensureAnimLayerTracks();
  if (!layers || layers.length === 0) return;
  const rig = cloneBones(m.rigBones || []);
  const bones = m.rigBones || [];
  const offsets = getActiveOffsets(m);
  for (const layer of layers) {
    if (!layer || layer.enabled === false) continue;
    const alpha = math.clamp(Number(layer.alpha) || 0, 0, 1);
    if (alpha <= 1e-6) continue;
    const anim = state.anim.animations.find((a) => a.id === layer.animId);
    if (!anim || anim.id === baseAnim.id) continue;
    const layerTime = getLayerSampleTime(layer, anim, t);
    const temp = {
      rigBones: cloneBones(m.rigBones),
      poseBones: cloneBones(m.rigBones),
      offsets: new Float32Array(offsets),
      baseOffsets: new Float32Array(offsets),
      ikConstraints: JSON.parse(JSON.stringify(m.ikConstraints || [])),
      transformConstraints: JSON.parse(JSON.stringify(m.transformConstraints || [])),
      pathConstraints: JSON.parse(JSON.stringify(m.pathConstraints || [])),
    };
    sampleAnimationToModelAtTime(temp, anim, layerTime, { applyLayerStateTracks: false, applySlotTracks: false, applyStateParamTracks: false });
    for (let i = 0; i < m.poseBones.length; i += 1) {
      if (!isBoneAffectedByLayerMask(layer, i, bones)) continue;
      blendBoneByMode(m.poseBones[i], temp.poseBones[i], rig[i], alpha, layer.mode || "replace");
    }
    if (layer.maskMode === "all") {
      if (state.slots.length > 0) {
        for (let si = 0; si < state.slots.length; si += 1) {
          const outOffsets = getModelSlotOffsets(m, si);
          const sampledOffsets = getModelSlotOffsets(temp, si);
          const slot = state.slots[si];
          const baseOffsets = slot && (getActiveAttachment(slot) || {}).meshData ? (getActiveAttachment(slot) || {}).meshData.baseOffsets : null;
          if (!outOffsets || !sampledOffsets || outOffsets.length !== sampledOffsets.length) continue;
          for (let i = 0; i < outOffsets.length; i += 1) {
            if ((layer.mode || "replace") === "add") {
              const base = Number(baseOffsets && baseOffsets[i]) || 0;
              outOffsets[i] = (Number(outOffsets[i]) || 0) + ((Number(sampledOffsets[i]) || 0) - base) * alpha;
            } else {
              outOffsets[i] = (Number(outOffsets[i]) || 0) + ((Number(sampledOffsets[i]) || 0) - (Number(outOffsets[i]) || 0)) * alpha;
            }
          }
        }
      } else if (m.offsets && temp.offsets && m.offsets.length === temp.offsets.length) {
        for (let i = 0; i < m.offsets.length; i += 1) {
          if ((layer.mode || "replace") === "add") {
            const base = Number(m.baseOffsets && m.baseOffsets[i]) || 0;
            m.offsets[i] = (Number(m.offsets[i]) || 0) + ((Number(temp.offsets[i]) || 0) - base) * alpha;
          } else {
            m.offsets[i] = (Number(m.offsets[i]) || 0) + ((Number(temp.offsets[i]) || 0) - (Number(m.offsets[i]) || 0)) * alpha;
          }
        }
      }
    }
  }
  enforceConnectedHeads(m.poseBones);
}

// ============================================================
