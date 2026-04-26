// ROLE: Per-frame animation runtime — pose sampling, layer blending,
// playback advance, timeline event emission, audio playback + waveform
// peak extraction.
// EXPORTS:
//   - samplePoseAtTime, blendTwoAnimationSamples, updateAnimationPlayback
//   - emitTimelineEventsBetween, playTimelineEventAudio
//   - getTimelineAudioPeaks, decodeAudioToPeaks, renderWaveformSvg
//     (audio waveform pipeline; cached per audio URL)
// CONSUMERS: render() in canvas.js, animation-panels.js (play/stop),
//   timeline-ui.js (waveform).
// SECTION: Animation Runtime — Pose Sampling
// samplePoseAtTime: evaluates all timeline tracks at time t,
//   applies interpolated values to poseBones / slot state.
//   Called every frame during playback and on seek.
// ============================================================
function samplePoseAtTime(m, t, opts = null) {
  const anim = getCurrentAnimation();
  if (!m || !anim) return;
  applyAnimationLayersToModelAtTime(m, anim, t, opts);
}

function blendTwoAnimationSamples(m, fromAnim, fromTime, toAnim, toTime, alpha) {
  if (!m || !fromAnim || !toAnim) return;
  const mixAlpha = math.clamp(alpha, 0, 1);
  const offsets = getActiveOffsets(m);
  const tempA = {
    rigBones: cloneBones(m.rigBones),
    poseBones: cloneBones(m.rigBones),
    offsets: new Float32Array(offsets),
    baseOffsets: new Float32Array(offsets),
    ikConstraints: JSON.parse(JSON.stringify(m.ikConstraints || [])),
    transformConstraints: JSON.parse(JSON.stringify(m.transformConstraints || [])),
    pathConstraints: JSON.parse(JSON.stringify(m.pathConstraints || [])),
  };
  const tempB = {
    rigBones: cloneBones(m.rigBones),
    poseBones: cloneBones(m.rigBones),
    offsets: new Float32Array(offsets),
    baseOffsets: new Float32Array(offsets),
    ikConstraints: JSON.parse(JSON.stringify(m.ikConstraints || [])),
    transformConstraints: JSON.parse(JSON.stringify(m.transformConstraints || [])),
    pathConstraints: JSON.parse(JSON.stringify(m.pathConstraints || [])),
  };
  sampleAnimationToModelAtTime(tempA, fromAnim, fromTime, { applyLayerStateTracks: false, applySlotTracks: false, applyStateParamTracks: false });
  sampleAnimationToModelAtTime(tempB, toAnim, toTime, { applyLayerStateTracks: false, applySlotTracks: false, applyStateParamTracks: false });

  const n = Math.min(m.poseBones.length, tempA.poseBones.length, tempB.poseBones.length);
  for (let i = 0; i < n; i += 1) {
    const out = m.poseBones[i];
    const a = tempA.poseBones[i];
    const b = tempB.poseBones[i];
    if (!out || !a || !b) continue;
    normalizeBoneChannels(out);
    out.tx = a.tx + (b.tx - a.tx) * mixAlpha;
    out.ty = a.ty + (b.ty - a.ty) * mixAlpha;
    out.rot = lerpAngle(a.rot, b.rot, mixAlpha);
    out.length = a.length + (b.length - a.length) * mixAlpha;
    out.sx = a.sx + (b.sx - a.sx) * mixAlpha;
    out.sy = a.sy + (b.sy - a.sy) * mixAlpha;
    out.shx = a.shx + (b.shx - a.shx) * mixAlpha;
    out.shy = a.shy + (b.shy - a.shy) * mixAlpha;
  }
  if (state.slots.length > 0) {
    for (let si = 0; si < state.slots.length; si += 1) {
      const outOffsets = getModelSlotOffsets(m, si);
      const aOffsets = getModelSlotOffsets(tempA, si);
      const bOffsets = getModelSlotOffsets(tempB, si);
      if (!outOffsets || !aOffsets || !bOffsets) continue;
      const n = Math.min(outOffsets.length, aOffsets.length, bOffsets.length);
      for (let i = 0; i < n; i += 1) {
        outOffsets[i] = aOffsets[i] + (bOffsets[i] - aOffsets[i]) * mixAlpha;
      }
    }
  } else if (m.offsets && tempA.offsets && tempB.offsets && m.offsets.length === tempA.offsets.length && m.offsets.length === tempB.offsets.length) {
    for (let i = 0; i < m.offsets.length; i += 1) {
      m.offsets[i] = tempA.offsets[i] + (tempB.offsets[i] - tempA.offsets[i]) * mixAlpha;
    }
  }
  const ikOut = ensureIKConstraints(m);
  const ikA = ensureIKConstraints(tempA);
  const ikB = ensureIKConstraints(tempB);
  const ikN = Math.min(ikOut.length, ikA.length, ikB.length);
  for (let i = 0; i < ikN; i += 1) {
    ikOut[i].mix = (Number(ikA[i].mix) || 0) + ((Number(ikB[i].mix) || 0) - (Number(ikA[i].mix) || 0)) * mixAlpha;
    ikOut[i].bendPositive = mixAlpha < 0.5 ? ikA[i].bendPositive !== false : ikB[i].bendPositive !== false;
    const ax = Number(ikA[i].targetX);
    const ay = Number(ikA[i].targetY);
    const bx = Number(ikB[i].targetX);
    const by = Number(ikB[i].targetY);
    if (Number.isFinite(ax) && Number.isFinite(bx)) ikOut[i].targetX = ax + (bx - ax) * mixAlpha;
    if (Number.isFinite(ay) && Number.isFinite(by)) ikOut[i].targetY = ay + (by - ay) * mixAlpha;
  }
  const tOut = ensureTransformConstraints(m);
  const tA = ensureTransformConstraints(tempA);
  const tB = ensureTransformConstraints(tempB);
  const tN = Math.min(tOut.length, tA.length, tB.length);
  for (let i = 0; i < tN; i += 1) {
    tOut[i].rotateMix = (Number(tA[i].rotateMix) || 0) + ((Number(tB[i].rotateMix) || 0) - (Number(tA[i].rotateMix) || 0)) * mixAlpha;
    tOut[i].translateMix =
      (Number(tA[i].translateMix) || 0) + ((Number(tB[i].translateMix) || 0) - (Number(tA[i].translateMix) || 0)) * mixAlpha;
    tOut[i].scaleMix = (Number(tA[i].scaleMix) || 0) + ((Number(tB[i].scaleMix) || 0) - (Number(tA[i].scaleMix) || 0)) * mixAlpha;
    tOut[i].shearMix = (Number(tA[i].shearMix) || 0) + ((Number(tB[i].shearMix) || 0) - (Number(tA[i].shearMix) || 0)) * mixAlpha;
  }
  const pOut = ensurePathConstraints(m);
  const pA = ensurePathConstraints(tempA);
  const pB = ensurePathConstraints(tempB);
  const pN = Math.min(pOut.length, pA.length, pB.length);
  for (let i = 0; i < pN; i += 1) {
    pOut[i].position = (Number(pA[i].position) || 0) + ((Number(pB[i].position) || 0) - (Number(pA[i].position) || 0)) * mixAlpha;
    pOut[i].spacing = (Number(pA[i].spacing) || 0) + ((Number(pB[i].spacing) || 0) - (Number(pA[i].spacing) || 0)) * mixAlpha;
    pOut[i].rotateMix = (Number(pA[i].rotateMix) || 0) + ((Number(pB[i].rotateMix) || 0) - (Number(pA[i].rotateMix) || 0)) * mixAlpha;
    pOut[i].translateMix =
      (Number(pA[i].translateMix) || 0) + ((Number(pB[i].translateMix) || 0) - (Number(pA[i].translateMix) || 0)) * mixAlpha;
  }
  enforceConnectedHeads(m.poseBones);
}

function updateAnimationPlayback(ts) {
  if (!state.anim.playing) {
    state.anim.lastTs = ts;
    updatePlaybackButtons();
    refreshAnimationMixUI();
    return;
  }
  const anim = getCurrentAnimation();
  if (!state.mesh || !anim) {
    state.anim.playing = false;
    updatePlaybackButtons();
    refreshAnimationMixUI();
    return;
  }
  const dt = state.anim.lastTs > 0 ? (ts - state.anim.lastTs) * 0.001 : 0;
  state.anim.lastTs = ts;

  if (state.anim.mix.active) {
    const fromAnim = state.anim.animations.find((a) => a.id === state.anim.mix.fromAnimId);
    const toAnim = state.anim.animations.find((a) => a.id === state.anim.mix.toAnimId);
    if (!fromAnim || !toAnim) {
      state.anim.mix.active = false;
      refreshAnimationMixUI();
      return;
    }
    const advanceTime = (curr, animRef) => {
      const range = getAnimationActiveRange(animRef);
      let next = curr + dt;
      if (next > range.end) next = state.anim.loop ? range.start : range.end;
      return next;
    };
    const prevFrom = state.anim.mix.fromTime;
    const prevTo = state.anim.mix.toTime;
    const fromRange = getAnimationActiveRange(fromAnim);
    const toRange = getAnimationActiveRange(toAnim);
    state.anim.mix.fromTime = advanceTime(prevFrom, fromAnim);
    state.anim.mix.toTime = advanceTime(prevTo, toAnim);
    emitTimelineEventsBetween(fromAnim, prevFrom, state.anim.mix.fromTime, state.anim.mix.fromTime < prevFrom, "mix_from", fromRange.start, fromRange.end);
    emitTimelineEventsBetween(toAnim, prevTo, state.anim.mix.toTime, state.anim.mix.toTime < prevTo, "mix_to", toRange.start, toRange.end);
    state.anim.mix.elapsed += dt;
    const alpha = math.clamp(state.anim.mix.elapsed / Math.max(1e-6, state.anim.mix.duration), 0, 1);
    blendTwoAnimationSamples(state.mesh, fromAnim, state.anim.mix.fromTime, toAnim, state.anim.mix.toTime, alpha);
    setAnimTime(state.anim.mix.toTime);
    if (state.boneMode === "pose") updateBoneUI();
    if (alpha >= 1) {
      state.anim.mix.active = false;
      if (state.anim.stateMachine && state.anim.stateMachine.pendingStateId) {
        state.anim.stateMachine.currentStateId = String(state.anim.stateMachine.pendingStateId);
        state.anim.stateMachine.pendingStateId = "";
        refreshStateMachineUI();
      }
      setStatus(`Mix done: ${fromAnim.name} -> ${toAnim.name}`);
    }
    refreshAnimationMixUI();
    return;
  }

  const sm = ensureStateMachine();
  if (sm.enabled) {
    const smState = getCurrentStateMachineState();
    if (smState && smState.animId && smState.animId !== state.anim.currentAnimId) {
      transitionToState(smState.id, sm.pendingDuration || 0.2);
      refreshAnimationMixUI();
      return;
    }
  }

  let hasAnyKey = false;
  for (const k of Object.keys(anim.tracks)) {
    if (anim.tracks[k] && anim.tracks[k].length > 0) {
      hasAnyKey = true;
      break;
    }
  }
  if (!hasAnyKey) {
    const layers = ensureAnimLayerTracks();
    for (const layer of layers) {
      if (!layer || layer.enabled === false) continue;
      const la = state.anim.animations.find((a) => a.id === layer.animId);
      if (!la || !la.tracks) continue;
      if (Object.values(la.tracks).some((rows) => Array.isArray(rows) && rows.length > 0)) {
        hasAnyKey = true;
        break;
      }
    }
  }
  if (!hasAnyKey) {
    state.anim.playing = false;
    updatePlaybackButtons();
    refreshAnimationMixUI();
    return;
  }
  const prevTime = state.anim.time;
  const playbackRange = getPlaybackRangeForCurrentState(anim);
  let next = prevTime + dt;
  let looped = false;
  let reachedEnd = false;
  if (next > playbackRange.end) {
    if (state.anim.loop) next = playbackRange.start;
    else {
      next = playbackRange.end;
      state.anim.playing = false;
      updatePlaybackButtons();
      reachedEnd = true;
    }
    looped = state.anim.loop;
  }
  setAnimTime(next, playbackRange.end);
  emitTimelineEventsBetween(anim, prevTime, next, next < prevTime, "play", playbackRange.start, playbackRange.end);
  for (const layer of ensureAnimLayerTracks()) {
    if (!layer || layer.enabled === false) continue;
    const la = state.anim.animations.find((a) => a.id === layer.animId);
    if (!la) continue;
    const prevLt = getLayerSampleTime(layer, la, prevTime);
    const nextLt = getLayerSampleTime(layer, la, next);
    const loopedLt = layer.loop !== false && nextLt < prevLt;
    emitTimelineEventsBetween(la, prevLt, nextLt, loopedLt, `layer:${layer.name || layer.id}`);
  }
  samplePoseAtTime(state.mesh, state.anim.time);
  if (state.boneMode === "pose") {
    updateBoneUI();
  }
  if (sm.enabled && tryRunAutoOrConditionalTransition({ looped, reachedEnd })) {
    refreshAnimationMixUI();
    return;
  }
  refreshAnimationMixUI();
}

function emitTimelineEventsBetween(anim, fromTime, toTime, looped = false, phase = "play", rangeStart = 0, rangeEnd = null) {
  if (!anim) return;
  const rows = getTrackKeys(anim, EVENT_TRACK_ID);
  if (!rows || rows.length === 0) return;
  const out = [];
  const t0 = Number(fromTime) || 0;
  const t1 = Number(toTime) || 0;
  const lo = Math.max(0, Number(rangeStart) || 0);
  const hi = rangeEnd == null ? Math.max(0.1, Number(anim.duration) || 0.1) : Math.max(lo, Number(rangeEnd) || lo);
  for (const r of rows) {
    const tr = Number(r.time) || 0;
    if (tr < lo - 1e-6 || tr > hi + 1e-6) continue;
    if (!looped) {
      if (tr > t0 + 1e-6 && tr <= t1 + 1e-6) out.push(r);
    } else if (tr > t0 + 1e-6 || tr <= t1 + 1e-6) {
      out.push(r);
    }
  }
  if (out.length === 0) return;
  for (const r of out) {
    const v = r.value && typeof r.value === "object" ? r.value : {};
    const detail = {
      animationId: anim.id,
      animationName: anim.name,
      time: Number(r.time) || 0,
      name: String(v.name || "event"),
      int: Number(v.int) || 0,
      float: Number(v.float) || 0,
      string: v.string != null ? String(v.string) : "",
      audio: v.audio != null ? String(v.audio) : "",
      volume: Number(v.volume) || 1,
      balance: Number(v.balance) || 0,
      phase,
    };
    // Audio preview: if the event has an audio path, schedule playback. Phase
    // is "play" during normal playback; we don't fire on scrub.
    if (detail.audio && phase === "play" && typeof playTimelineEventAudio === "function") {
      try { playTimelineEventAudio(detail); } catch (err) { console.warn("[timeline-audio]", err); }
    }
    window.dispatchEvent(new CustomEvent("timeline-event", { detail }));
  }
  const last = out[out.length - 1];
  const lv = last.value && typeof last.value === "object" ? last.value : {};
  setStatus(`Event: ${(lv.name || "event").toString()} @ ${(Number(last.time) || 0).toFixed(3)}s`);
}

// Audio preview cache. Maps audio path → HTMLAudioElement. Reused across
// events with the same path. Uses a single lazily-created element per path.
const __timelineAudioCache = new Map();

// Waveform peaks cache. Each entry per audio path:
//   { state: "loading" | "ready" | "error",
//     duration: seconds,
//     peaks: Float32Array of normalized [0..1] amplitudes (one per bucket),
//     pending: Set<callback> awaiting decode }
// Decoding is async; the timeline UI listens for the "ready" callback to
// re-render the lane with the waveform polyline.
const __timelineAudioPeaks = new Map();
const WAVEFORM_BUCKETS = 256; // peak count per audio file
let __waveformAudioCtx = null;

function getOrCreateWaveformAudioCtx() {
  if (__waveformAudioCtx) return __waveformAudioCtx;
  const Ctor = typeof AudioContext !== "undefined"
    ? AudioContext
    : (typeof window !== "undefined" ? (window.AudioContext || window.webkitAudioContext) : null);
  if (!Ctor) return null;
  try { __waveformAudioCtx = new Ctor(); } catch { __waveformAudioCtx = null; }
  return __waveformAudioCtx;
}

// Public: returns the cache entry, kicking off async decode the first time.
// Callers pass `onReady` to be notified when decode finishes (so the timeline
// can re-render). The cache shape is stable so callers can poll if they want.
function getTimelineAudioPeaks(audioUrl, onReady) {
  if (!audioUrl) return null;
  const key = String(audioUrl);
  let entry = __timelineAudioPeaks.get(key);
  if (entry) {
    if (entry.state !== "ready" && typeof onReady === "function") entry.pending.add(onReady);
    return entry;
  }
  entry = { state: "loading", duration: 0, peaks: null, pending: new Set() };
  if (typeof onReady === "function") entry.pending.add(onReady);
  __timelineAudioPeaks.set(key, entry);
  // Decode async; if anything fails, mark error so future polls don't retry.
  decodeAudioToPeaks(key)
    .then((res) => {
      entry.state = "ready";
      entry.duration = res.duration;
      entry.peaks = res.peaks;
      for (const cb of entry.pending) try { cb(entry); } catch { /* ignore */ }
      entry.pending.clear();
    })
    .catch(() => {
      entry.state = "error";
      entry.pending.clear();
    });
  return entry;
}

// Build a self-contained SVG element showing the peaks as a vertical-symmetric
// filled waveform. Caller positions the SVG; viewBox is unit-rectangle so CSS
// width/height controls the final size.
function renderWaveformSvg(peaks) {
  const svgNs = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNs, "svg");
  svg.setAttribute("viewBox", `0 0 ${peaks.length} 100`);
  svg.setAttribute("preserveAspectRatio", "none");
  const path = document.createElementNS(svgNs, "path");
  // Top half: trace peaks downward; bottom half: mirror.
  const cmds = [];
  cmds.push("M 0 50");
  for (let i = 0; i < peaks.length; i += 1) {
    const y = 50 - peaks[i] * 48;
    cmds.push(`L ${i} ${y}`);
  }
  cmds.push(`L ${peaks.length - 1} 50`);
  for (let i = peaks.length - 1; i >= 0; i -= 1) {
    const y = 50 + peaks[i] * 48;
    cmds.push(`L ${i} ${y}`);
  }
  cmds.push("Z");
  path.setAttribute("d", cmds.join(" "));
  svg.appendChild(path);
  return svg;
}

async function decodeAudioToPeaks(url) {
  const ctx = getOrCreateWaveformAudioCtx();
  if (!ctx) throw new Error("no AudioContext");
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`fetch failed: ${resp.status}`);
  const buf = await resp.arrayBuffer();
  // decodeAudioData has both promise and callback APIs; promise form preferred.
  const audioBuf = await new Promise((resolve, reject) => {
    const p = ctx.decodeAudioData(buf, resolve, reject);
    if (p && typeof p.then === "function") p.then(resolve, reject);
  });
  // Mix to mono by averaging channels, then bucket-reduce to WAVEFORM_BUCKETS
  // peaks. Each bucket stores max(|sample|) — visually faithful for music.
  const len = audioBuf.length;
  const channels = audioBuf.numberOfChannels;
  const peaks = new Float32Array(WAVEFORM_BUCKETS);
  const samplesPerBucket = Math.max(1, Math.floor(len / WAVEFORM_BUCKETS));
  // Pull channel data refs once (decoded buffers expose typed arrays).
  const chans = [];
  for (let c = 0; c < channels; c += 1) chans.push(audioBuf.getChannelData(c));
  for (let i = 0; i < WAVEFORM_BUCKETS; i += 1) {
    const start = i * samplesPerBucket;
    const end = Math.min(len, start + samplesPerBucket);
    let peak = 0;
    for (let j = start; j < end; j += 1) {
      let sum = 0;
      for (let c = 0; c < channels; c += 1) sum += chans[c][j];
      const avg = Math.abs(sum / channels);
      if (avg > peak) peak = avg;
    }
    peaks[i] = peak;
  }
  return { duration: audioBuf.duration, peaks };
}

function playTimelineEventAudio(detail) {
  if (!detail || !detail.audio) return false;
  const key = String(detail.audio);
  let el = __timelineAudioCache.get(key);
  if (!el) {
    el = new Audio();
    el.src = key;
    __timelineAudioCache.set(key, el);
  }
  // Restart from beginning to allow the same key to fire repeatedly during
  // looped playback.
  try { el.currentTime = 0; } catch { /* some browsers may throw on src not yet loaded */ }
  el.volume = Math.max(0, Math.min(1, Number(detail.volume) || 1));
  // balance: -1=left, 0=center, 1=right. Use StereoPannerNode lazily.
  // Only setup if balance ≠ 0 (most events).
  const balance = Math.max(-1, Math.min(1, Number(detail.balance) || 0));
  if (balance !== 0 && typeof AudioContext !== "undefined") {
    try {
      if (!el.__audioCtx) {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const src = ctx.createMediaElementSource(el);
        const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        if (panner) {
          src.connect(panner).connect(ctx.destination);
          el.__audioCtx = ctx;
          el.__audioPanner = panner;
        } else {
          src.connect(ctx.destination);
          el.__audioCtx = ctx;
        }
      }
      if (el.__audioPanner) el.__audioPanner.pan.value = balance;
    } catch (err) {
      // fallback: ignore balance, just play
    }
  }
  const p = el.play();
  if (p && typeof p.catch === "function") p.catch(() => { /* user-gesture-required errors are silent */ });
  return true;
}


