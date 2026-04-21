// Split from app.js
// Part: Persistence, autosave, animation/state data model, track/timeline helpers
// Original source: app/04-persistence-animation-export.js (segment 1)
// ============================================================
// SECTION: Project Persistence — Save, Load, Autosave
// saveAutosave* functions: snapshot-based recovery.
// Project saved as JSON with embedded base64 assets.
// ============================================================
function saveAutosaveFromSnapshotText(snapshotText, reason = "checkpoint", force = false) {
  if (state.history.suspend) return false;
  const text = String(snapshotText || "");
  if (!text) return false;
  if (!force && text === state.autosave.lastSig) return false;
  try {
    const envelope = {
      version: 1,
      savedAt: Date.now(),
      reason: String(reason || "checkpoint"),
      project: JSON.parse(text),
    };
    localStorage.setItem(AUTOSAVE_STORAGE_KEY, JSON.stringify(envelope));
    state.autosave.lastSig = text;
    return true;
  } catch (err) {
    const now = Date.now();
    if (now - (Number(state.autosave.lastErrorAt) || 0) > 10000) {
      state.autosave.lastErrorAt = now;
      setStatus(`Autosave failed: ${err && err.message ? err.message : "storage unavailable/quota exceeded"}`);
    }
    return false;
  }
}

function saveAutosaveSnapshot(reason = "interval", force = false) {
  if (state.history.suspend) return false;
  try {
    const project = buildProjectPayload();
    const payloadText = JSON.stringify(project);
    if (!force && payloadText === state.autosave.lastSig) return false;
    const envelope = {
      version: 1,
      savedAt: Date.now(),
      reason: String(reason || "interval"),
      project,
    };
    localStorage.setItem(AUTOSAVE_STORAGE_KEY, JSON.stringify(envelope));
    state.autosave.lastSig = payloadText;
    return true;
  } catch (err) {
    const now = Date.now();
    if (now - (Number(state.autosave.lastErrorAt) || 0) > 10000) {
      state.autosave.lastErrorAt = now;
      setStatus(`Autosave failed: ${err && err.message ? err.message : "storage unavailable/quota exceeded"}`);
    }
    return false;
  }
}

function startAutosaveLoop() {
  if (state.autosave.timerId) clearInterval(state.autosave.timerId);
  state.autosave.timerId = window.setInterval(() => {
    saveAutosaveSnapshot("interval", false);
  }, AUTOSAVE_INTERVAL_MS);
}

async function tryRestoreAutosaveAtStartup() {
  const env = getAutosaveEnvelope();
  if (!env) return;
  const ts = Number(env.savedAt) || 0;
  if (ts <= 0 || Date.now() - ts > AUTOSAVE_MAX_AGE_MS) {
    clearAutosaveSnapshot();
    return;
  }
  const savedAtText = new Date(ts).toLocaleString();
  const ok = window.confirm(`Found autosave snapshot (${savedAtText}). Restore it now?`);
  if (!ok) {
    const discard = window.confirm("Discard this autosave snapshot?");
    if (discard) clearAutosaveSnapshot();
    return;
  }
  await loadProjectFromJsonText(JSON.stringify(env.project), false);
  state.autosave.lastSig = JSON.stringify(env.project);
  setStatus(`Recovered autosave from ${savedAtText}.`);
}

function pushUndoCheckpoint(force = false) {
  if (state.history.suspend) return;
  const snap = captureUndoSnapshot();
  if (!force && snap === state.history.lastSig) return;
  state.history.lastSig = snap;
  if (state.history.undo.length === 0 || state.history.undo[state.history.undo.length - 1] !== snap) {
    state.history.undo.push(snap);
    if (state.history.undo.length > 80) state.history.undo.shift();
  }
  state.history.redo = [];
  if (els.undoBtn) els.undoBtn.disabled = state.history.undo.length <= 1;
  if (els.redoBtn) els.redoBtn.disabled = state.history.redo.length <= 0;
  if (state.autosave.ready) saveAutosaveFromSnapshotText(snap, "checkpoint", false);
}

async function undoAction() {
  if (state.history.undo.length <= 1) return false;
  const current = state.history.undo.pop();
  if (current) state.history.redo.push(current);
  const prev = state.history.undo[state.history.undo.length - 1];
  if (!prev) return false;
  await restoreUndoSnapshot(prev);
  state.history.lastSig = prev;
  if (els.undoBtn) els.undoBtn.disabled = state.history.undo.length <= 1;
  if (els.redoBtn) els.redoBtn.disabled = state.history.redo.length <= 0;
  setStatus("Undo.");
  return true;
}

async function redoAction() {
  if (state.history.redo.length <= 0) return false;
  const snap = state.history.redo.pop();
  if (!snap) return false;
  state.history.undo.push(snap);
  await restoreUndoSnapshot(snap);
  state.history.lastSig = snap;
  if (els.undoBtn) els.undoBtn.disabled = state.history.undo.length <= 1;
  if (els.redoBtn) els.redoBtn.disabled = state.history.redo.length <= 0;
  setStatus("Redo.");
  return true;
}

function getCurrentAnimation() {
  if (!state.anim.currentAnimId) return null;
  return state.anim.animations.find((a) => a.id === state.anim.currentAnimId) || null;
}

function ensureCurrentAnimation() {
  if (state.anim.animations.length === 0) {
    const a = createAnimation("Anim 1");
    state.anim.animations.push(a);
    state.anim.currentAnimId = a.id;
  } else if (!getCurrentAnimation()) {
    state.anim.currentAnimId = state.anim.animations[0].id;
  }
  state.anim.animations = state.anim.animations.map((a, i) => normalizeAnimationRecord(a, `Anim ${i + 1}`));
  migrateLegacyVertexTracksAllAnimations();
  ensureStateMachine();
}

function ensureAnimLayerTracks() {
  if (!Array.isArray(state.anim.layerTracks)) state.anim.layerTracks = [];
  const validAnimIds = new Set((state.anim.animations || []).map((a) => a.id));
  const bones = state.mesh && Array.isArray(state.mesh.rigBones) ? state.mesh.rigBones : [];
  state.anim.layerTracks = state.anim.layerTracks
    .map((t, i) => ({
      id: t && t.id ? String(t.id) : makeLayerTrackId(),
      name: t && t.name ? String(t.name) : `Layer ${i + 1}`,
      enabled: t ? t.enabled !== false : true,
      animId: t && validAnimIds.has(t.animId) ? String(t.animId) : "",
      loop: t ? t.loop !== false : true,
      speed: Number.isFinite(Number(t && t.speed)) ? math.clamp(Number(t && t.speed), -10, 10) : 1,
      offset: Number(t && t.offset) || 0,
      alpha: math.clamp(Number(t && t.alpha) || 0, 0, 1),
      mode: t && t.mode === "add" ? "add" : "replace",
      maskMode: t && (t.maskMode === "include" || t.maskMode === "exclude") ? t.maskMode : "all",
      maskBones: Array.isArray(t && t.maskBones)
        ? [...new Set(t.maskBones.map((v) => Number(v)).filter((v) => Number.isFinite(v) && v >= 0 && v < bones.length))]
        : [],
    }))
    .filter((t) => !!t.id);
  if (state.anim.layerTracks.length === 0) {
    state.anim.selectedLayerTrackId = "";
    return state.anim.layerTracks;
  }
  if (!state.anim.layerTracks.some((t) => t.id === state.anim.selectedLayerTrackId)) {
    state.anim.selectedLayerTrackId = state.anim.layerTracks[0].id;
  }
  return state.anim.layerTracks;
}

function getSelectedLayerTrack() {
  ensureAnimLayerTracks();
  const id = String(state.anim.selectedLayerTrackId || "");
  if (!id) return null;
  return state.anim.layerTracks.find((t) => t.id === id) || null;
}

function getTrackId(boneIndex, prop) {
  return `bone:${boneIndex}:${prop}`;
}

function getSlotTrackId(slotIndex, prop) {
  return `slot:${slotIndex}:${prop}`;
}

function getIKTrackId(ikIndex, prop) {
  return `ik:${ikIndex}:${prop}`;
}

function getTransformTrackId(transformIndex, prop) {
  return `tfc:${transformIndex}:${prop}`;
}

function getPathTrackId(pathIndex, prop) {
  return `pth:${pathIndex}:${prop}`;
}

function getVertexTrackId(slotIndex, attachmentName = null) {
  const si = Number(slotIndex);
  const safeAttachment = attachmentName == null ? "" : String(attachmentName).trim();
  if (safeAttachment) return `slot:${si}:attachment:${safeAttachment}:deform`;
  return `deform:${si}`;
}

function getLayerTrackId(layerId, prop) {
  return `layer:${String(layerId || "")}:${prop}`;
}

function getAnimLayerTrackById(layerId) {
  const id = String(layerId || "");
  if (!id) return null;
  return ensureAnimLayerTracks().find((t) => t.id === id) || null;
}

const VERTEX_TRACK_ID = "vertex:deform";
const EVENT_TRACK_ID = "event:timeline";
const DRAWORDER_TRACK_ID = "draworder:timeline";

function migrateLegacyVertexTracksInAnimation(anim) {
  if (!anim || !anim.tracks || !Array.isArray(anim.tracks[VERTEX_TRACK_ID])) return;
  const legacy = anim.tracks[VERTEX_TRACK_ID];
  if (legacy.length <= 0) {
    delete anim.tracks[VERTEX_TRACK_ID];
    return;
  }
  const keepLegacy = [];
  const touched = new Set();
  for (const k of legacy) {
    const si = Number.isFinite(k && k.slotIndex) ? Number(k.slotIndex) : -1;
    if (si < 0 || si >= state.slots.length) {
      keepLegacy.push(k);
      continue;
    }
    const slot = state.slots[si];
    const trackId = getVertexTrackId(si, slot ? getSlotCurrentAttachmentName(slot) || slot.attachmentName || "main" : null);
    if (!anim.tracks[trackId]) anim.tracks[trackId] = [];
    anim.tracks[trackId].push({
      id: k && k.id ? String(k.id) : `k_${Math.random().toString(36).slice(2, 10)}`,
      time: Number(k && k.time) || 0,
      value: cloneTrackValue(k && k.value),
      interp: (k && k.interp) || "linear",
      curve: Array.isArray(k && k.curve) ? k.curve.slice(0, 4) : undefined,
      slotIndex: si,
    });
    touched.add(trackId);
  }
  if (keepLegacy.length > 0) anim.tracks[VERTEX_TRACK_ID] = keepLegacy;
  else delete anim.tracks[VERTEX_TRACK_ID];
  for (const trackId of touched) normalizeTrackKeys(anim, trackId);
}

function migrateLegacyVertexTracksAllAnimations() {
  for (const a of state.anim.animations || []) {
    migrateLegacyVertexTracksInAnimation(a);
  }
}

function makeSlotId() {
  return `slot_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function makeSkinSetId() {
  return `skin_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function captureCurrentSkinMap() {
  const out = {};
  for (const s of state.slots || []) {
    if (!s || !s.id) continue;
    const name = getSlotCurrentAttachmentName(s);
    if (!name) continue;
    out[String(s.id)] = String(name);
  }
  return out;
}

function captureCurrentSkinPlaceholderMap() {
  const out = {};
  for (const s of state.slots || []) {
    if (!s || !s.id) continue;
    const name = getSlotCurrentAttachmentName(s);
    if (!name) continue;
    const ph = String(s.placeholderName || s.attachmentName || "main");
    if (!out[String(s.id)] || typeof out[String(s.id)] !== "object") out[String(s.id)] = {};
    out[String(s.id)][ph] = String(name);
  }
  return out;
}

function captureCurrentSkinConstraintMap() {
  const out = { ik: [], transform: [], path: [] };
  const m = state.mesh;
  if (!m) return out;
  const ikList = ensureIKConstraints(m);
  for (const c of ikList) {
    if (!c || !c.name || !c.skinRequired) continue;
    if (c.enabled !== false) out.ik.push(String(c.name));
  }
  const tfcList = ensureTransformConstraints(m);
  for (const c of tfcList) {
    if (!c || !c.name || !c.skinRequired) continue;
    if (c.enabled !== false) out.transform.push(String(c.name));
  }
  const pathList = ensurePathConstraints(m);
  for (const c of pathList) {
    if (!c || !c.name || !c.skinRequired) continue;
    if (c.enabled !== false) out.path.push(String(c.name));
  }
  return out;
}

function normalizeSkinConstraintMap(src) {
  const map = src && typeof src === "object" ? src : {};
  return {
    ik: Array.isArray(map.ik) ? map.ik.map((v) => String(v || "").trim()).filter(Boolean) : [],
    transform: Array.isArray(map.transform) ? map.transform.map((v) => String(v || "").trim()).filter(Boolean) : [],
    path: Array.isArray(map.path) ? map.path.map((v) => String(v || "").trim()).filter(Boolean) : [],
  };
}

function ensureSkinSets() {
  if (!Array.isArray(state.skinSets)) state.skinSets = [];
  state.skinSets = state.skinSets
    .map((s, i) => ({
      id: s && s.id ? String(s.id) : makeSkinSetId(),
      name: s && s.name ? String(s.name) : `skin_${i}`,
      slotAttachments:
        s && s.slotAttachments && typeof s.slotAttachments === "object" ? { ...s.slotAttachments } : {},
      slotPlaceholderAttachments:
        s && s.slotPlaceholderAttachments && typeof s.slotPlaceholderAttachments === "object"
          ? Object.fromEntries(
            Object.entries(s.slotPlaceholderAttachments).map(([slotId, map]) => [
              String(slotId),
              map && typeof map === "object"
                ? Object.fromEntries(Object.entries(map).map(([ph, v]) => [String(ph), v == null ? null : String(v)]))
                : {},
            ])
          )
          : {},
      constraints: normalizeSkinConstraintMap(s && s.constraints),
    }))
    .filter((s) => !!s.id);
  for (const s of state.skinSets) {
    if (!s.slotPlaceholderAttachments || typeof s.slotPlaceholderAttachments !== "object") s.slotPlaceholderAttachments = {};
    if (s.slotAttachments && typeof s.slotAttachments === "object") {
      for (const [slotId, att] of Object.entries(s.slotAttachments)) {
        if (att == null || att === "") continue;
        if (!s.slotPlaceholderAttachments[slotId] || typeof s.slotPlaceholderAttachments[slotId] !== "object") {
          s.slotPlaceholderAttachments[slotId] = {};
        }
        if (!s.slotPlaceholderAttachments[slotId].main) s.slotPlaceholderAttachments[slotId].main = String(att);
      }
    }
  }
  if (state.skinSets.length === 0) {
    state.skinSets.push({
      id: makeSkinSetId(),
      name: "default",
      slotAttachments: captureCurrentSkinMap(),
      slotPlaceholderAttachments: captureCurrentSkinPlaceholderMap(),
      constraints: captureCurrentSkinConstraintMap(),
    });
  }
  if (
    !Number.isFinite(state.selectedSkinSet) ||
    state.selectedSkinSet < 0 ||
    state.selectedSkinSet >= state.skinSets.length
  ) {
    state.selectedSkinSet = 0;
  }
  return state.skinSets;
}

function getSelectedSkinSet() {
  const list = ensureSkinSets();
  const i = Number(state.selectedSkinSet);
  if (!Number.isFinite(i) || i < 0 || i >= list.length) return null;
  return list[i];
}

function applySkinSetToSlots(skin) {
  if (!skin) return false;
  const bySlot = skin.slotPlaceholderAttachments && typeof skin.slotPlaceholderAttachments === "object"
    ? skin.slotPlaceholderAttachments
    : null;
  const legacy = skin.slotAttachments && typeof skin.slotAttachments === "object" ? skin.slotAttachments : null;
  if (!bySlot && !legacy) return false;
  let changed = false;
  for (const s of state.slots || []) {
    if (!s || !s.id) continue;
    ensureSlotAttachmentState(s);
    const slotId = String(s.id);
    const ph = String(s.placeholderName || s.attachmentName || "main");
    const map = bySlot && bySlot[slotId] && typeof bySlot[slotId] === "object" ? bySlot[slotId] : null;
    const target = map && Object.prototype.hasOwnProperty.call(map, ph)
      ? map[ph]
      : legacy && Object.prototype.hasOwnProperty.call(legacy, slotId)
        ? legacy[slotId]
        : null;
    const next = target == null ? null : String(target);
    if (!next) continue;
    const att = getSlotAttachmentEntry(s, next);
    if (!att || !att.canvas) continue;
    if (s.activeAttachment !== next) changed = true;
    s.activeAttachment = next;
  }
  if (changed) {
    refreshSlotUI();
    renderBoneTree();
  }
  const m = state.mesh;
  if (m && skin && skin.constraints && typeof skin.constraints === "object") {
    const cs = normalizeSkinConstraintMap(skin.constraints);
    const ikSet = new Set(cs.ik);
    const tfcSet = new Set(cs.transform);
    const pathSet = new Set(cs.path);
    for (const c of ensureIKConstraints(m)) {
      if (!c || !c.skinRequired) continue;
      c.enabled = ikSet.has(String(c.name || ""));
    }
    for (const c of ensureTransformConstraints(m)) {
      if (!c || !c.skinRequired) continue;
      c.enabled = tfcSet.has(String(c.name || ""));
    }
    for (const c of ensurePathConstraints(m)) {
      if (!c || !c.skinRequired) continue;
      c.enabled = pathSet.has(String(c.name || ""));
    }
    refreshIKUI();
    refreshTransformUI();
    refreshPathUI();
  }
  return changed;
}

function refreshSkinUI() {
  const list = ensureSkinSets();
  const active = getSelectedSkinSet();
  if (els.skinSelect) {
    els.skinSelect.innerHTML = "";
    for (let i = 0; i < list.length; i += 1) {
      const s = list[i];
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = s.name || `skin_${i}`;
      els.skinSelect.appendChild(opt);
    }
    els.skinSelect.value = String(Math.max(0, Number(state.selectedSkinSet) || 0));
  }
  if (els.activeSkinSelect) {
    els.activeSkinSelect.innerHTML = "";
    for (let i = 0; i < list.length; i += 1) {
      const s = list[i];
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = s.name || `skin_${i}`;
      els.activeSkinSelect.appendChild(opt);
    }
    els.activeSkinSelect.value = String(Math.max(0, Number(state.selectedSkinSet) || 0));
  }
  if (els.skinName) {
    els.skinName.value = active ? active.name || "" : "";
    els.skinName.disabled = !active;
  }
  if (els.skinDeleteBtn) els.skinDeleteBtn.disabled = list.length <= 1;
  if (els.skinCaptureBtn) els.skinCaptureBtn.disabled = !active || state.slots.length === 0;
  if (els.skinApplyBtn) els.skinApplyBtn.disabled = !active || state.slots.length === 0;
  if (els.activeSkinCaptureBtn) els.activeSkinCaptureBtn.disabled = !active || state.slots.length === 0;
  if (els.activeSkinApplyBtn) els.activeSkinApplyBtn.disabled = !active || state.slots.length === 0;
}

function addSkinSetFromCurrentState() {
  const list = ensureSkinSets();
  const skin = {
    id: makeSkinSetId(),
    name: `skin_${list.length}`,
    slotAttachments: captureCurrentSkinMap(),
    slotPlaceholderAttachments: captureCurrentSkinPlaceholderMap(),
    constraints: captureCurrentSkinConstraintMap(),
  };
  list.push(skin);
  state.selectedSkinSet = list.length - 1;
  refreshSkinUI();
  return skin;
}

function captureSelectedSkinSetFromCurrentState() {
  const skin = getSelectedSkinSet();
  if (!skin) return null;
  skin.slotAttachments = captureCurrentSkinMap();
  skin.slotPlaceholderAttachments = captureCurrentSkinPlaceholderMap();
  skin.constraints = captureCurrentSkinConstraintMap();
  refreshSkinUI();
  return skin;
}

function applySelectedSkinSetWithStatus() {
  const skin = getSelectedSkinSet();
  if (!skin) {
    setStatus("No active skin.");
    return false;
  }
  if (applySkinSetToSlots(skin)) {
    setStatus(`Skin applied: ${skin.name}`);
    return true;
  }
  setStatus(`Skin apply: no slot attachment changed (${skin.name}).`);
  return false;
}

function colorHexToRgb01(hex) {
  const s = String(hex || "#ffffff").trim();
  const m = s.match(/^#?([0-9a-fA-F]{6})$/);
  if (!m) return { r: 1, g: 1, b: 1 };
  const n = Number.parseInt(m[1], 16);
  return {
    r: ((n >> 16) & 0xff) / 255,
    g: ((n >> 8) & 0xff) / 255,
    b: (n & 0xff) / 255,
  };
}

function rgb01ToHex(r, g, b) {
  const to = (v) => Math.max(0, Math.min(255, Math.round((Number(v) || 0) * 255)));
  const n = (to(r) << 16) | (to(g) << 8) | to(b);
  return `#${n.toString(16).padStart(6, "0")}`;
}

function markDirtyTrack(trackId) {
  if (!trackId) return;
  if (!state.anim.dirtyTracks.includes(trackId)) {
    state.anim.dirtyTracks.push(trackId);
  }
  scheduleAutoKeyFromDirty();
}

function scheduleAutoKeyFromDirty() {
  if (!state.anim.autoKey || state.anim.playing || state.anim.autoKeyPending) return;
  state.anim.autoKeyPending = true;
  requestAnimationFrame(() => {
    state.anim.autoKeyPending = false;
    if (!state.anim.autoKey || state.anim.playing || !state.mesh) return;
    const anim = getCurrentAnimation();
    if (!anim) return;
    addAutoKeyframeFromDirty(true);
  });
}

function markDirtyByBoneProp(boneIndex, prop) {
  if (!Number.isFinite(boneIndex) || boneIndex < 0) return;
  markDirtyTrack(getTrackId(boneIndex, prop));
}

function markDirtyByIKProp(ikIndex, prop) {
  if (!Number.isFinite(ikIndex) || ikIndex < 0) return;
  markDirtyTrack(getIKTrackId(ikIndex, prop));
}

function markDirtyBySlotProp(slotIndex, prop) {
  if (!Number.isFinite(slotIndex) || slotIndex < 0) return;
  markDirtyTrack(getSlotTrackId(slotIndex, prop));
}

function markDirtyVertexTrack(slotIndex = state.activeSlot) {
  const si = Number(slotIndex);
  if (state.slots.length > 0 && Number.isFinite(si) && si >= 0 && si < state.slots.length) {
    const slot = state.slots[si];
    markDirtyTrack(getVertexTrackId(si, slot ? getSlotCurrentAttachmentName(slot) || slot.attachmentName || "main" : null));
    return;
  }
  markDirtyTrack(VERTEX_TRACK_ID);
}

function markDirtyDrawOrder() {
  markDirtyTrack(DRAWORDER_TRACK_ID);
}

function markDirtyByLayerProp(layerId, prop) {
  if (!layerId) return;
  markDirtyTrack(getLayerTrackId(layerId, prop));
}

function getIKIndexByRef(m, ikRef) {
  if (!m || !ikRef) return -1;
  const list = ensureIKConstraints(m);
  return list.indexOf(ikRef);
}

function parseTrackId(trackId) {
  const p = String(trackId || "").split(":");
  if (p.length === 5 && p[0] === "slot" && p[2] === "attachment" && p[4] === "deform") {
    const slotIndex = Number(p[1]);
    const attachmentName = String(p[3] || "");
    if (!Number.isFinite(slotIndex) || !attachmentName) return null;
    return { type: "mesh", prop: "deform", slotIndex, attachmentName };
  }
  if (p.length === 2 && p[0] === "deform") {
    const slotIndex = Number(p[1]);
    if (Number.isFinite(slotIndex)) return { type: "mesh", prop: "deform", slotIndex };
    return null;
  }
  if (p.length === 2 && (p[0] === "mesh" || p[0] === "vertex" || p[0] === "ffd") && p[1] === "deform") {
    return { type: "mesh", prop: "deform" };
  }
  if (p.length === 2 && p[0] === "event" && p[1] === "timeline") {
    return { type: "event", prop: "timeline" };
  }
  if (p.length === 2 && p[0] === "draworder" && p[1] === "timeline") {
    return { type: "draworder", prop: "timeline" };
  }
  if (p.length === 2 && p[0] === "smparam") {
    const paramId = String(p[1] || "");
    if (!paramId) return null;
    return { type: "smparam", paramId, prop: "value" };
  }
  if (p.length === 3 && p[0] === "slot") {
    const slotIndex = Number(p[1]);
    const prop = p[2];
    if (!Number.isFinite(slotIndex)) return null;
    return { type: "slot", slotIndex, prop };
  }
  if (p.length === 3 && p[0] === "bone") {
    const boneIndex = Number(p[1]);
    const prop = p[2];
    if (!Number.isFinite(boneIndex)) return null;
    return { type: "bone", boneIndex, prop };
  }
  if (p.length === 3 && p[0] === "ik") {
    const ikIndex = Number(p[1]);
    const prop = p[2];
    if (!Number.isFinite(ikIndex)) return null;
    return { type: "ik", ikIndex, prop };
  }
  if (p.length === 3 && p[0] === "tfc") {
    const transformIndex = Number(p[1]);
    const prop = p[2];
    if (!Number.isFinite(transformIndex)) return null;
    return { type: "tfc", transformIndex, prop };
  }
  if (p.length === 3 && p[0] === "pth") {
    const pathIndex = Number(p[1]);
    const prop = p[2];
    if (!Number.isFinite(pathIndex)) return null;
    return { type: "pth", pathIndex, prop };
  }
  if (p.length === 3 && p[0] === "layer") {
    const layerId = String(p[1] || "");
    const prop = p[2];
    if (!layerId) return null;
    return { type: "layer", layerId, prop };
  }
  return null;
}

function getTrackValueFromBones(bones, boneIndex, prop) {
  const b = bones[boneIndex];
  if (!b) return null;
  normalizeBoneChannels(b);
  if (prop === "translate") return { x: b.tx, y: b.ty };
  if (prop === "rotate") return b.rot;
  if (prop === "scale" || prop === "length") return b.length;
  if (prop === "scaleX") return b.sx;
  if (prop === "scaleY") return b.sy;
  if (prop === "shearX") return b.shx;
  if (prop === "shearY") return b.shy;
  if (prop === "animHide") return !!b.animHidden;
  return 0;
}

function setTrackValueToBones(bones, boneIndex, prop, value) {
  const b = bones[boneIndex];
  if (!b) return;
  normalizeBoneChannels(b);
  if (prop === "translate" && value && typeof value === "object") {
    b.tx = Number(value.x) || 0;
    b.ty = Number(value.y) || 0;
  } else if (prop === "rotate") b.rot = Number(value) || 0;
  else if (prop === "scale" || prop === "length") b.length = Math.max(1, Number(value) || 1);
  else if (prop === "scaleX") b.sx = Number(value) || 1;
  else if (prop === "scaleY") b.sy = Number(value) || 1;
  else if (prop === "shearX") b.shx = Number(value) || 0;
  else if (prop === "shearY") b.shy = Number(value) || 0;
  else if (prop === "animHide") b.animHidden = value === true || Number(value) > 0;
}

function getEventDraftFromUI() {
  return {
    name: (els.eventName && els.eventName.value ? els.eventName.value : "event").trim() || "event",
    int: Number(els.eventInt && els.eventInt.value) || 0,
    float: Number(els.eventFloat && els.eventFloat.value) || 0,
    string: (els.eventString && els.eventString.value ? els.eventString.value : "").trim(),
  };
}

function applyEventDraftToUI(v) {
  const e = v && typeof v === "object" ? v : {};
  if (els.eventName) els.eventName.value = (e.name || "event").trim() || "event";
  if (els.eventInt) els.eventInt.value = String(Number(e.int) || 0);
  if (els.eventFloat) els.eventFloat.value = String(Number(e.float) || 0);
  if (els.eventString) els.eventString.value = e.string != null ? String(e.string) : "";
}

function refreshEventKeyListUI() {
  if (!els.eventKeyList) return;
  const anim = getCurrentAnimation();
  els.eventKeyList.innerHTML = "";
  if (!anim) return;
  const keys = getTrackKeys(anim, EVENT_TRACK_ID).slice().sort((a, b) => (Number(a.time) || 0) - (Number(b.time) || 0));
  for (const k of keys) {
    if (!k.id) k.id = `k_${Math.random().toString(36).slice(2, 10)}`;
    const v = k.value && typeof k.value === "object" ? k.value : {};
    const t = Number(k.time) || 0;
    const opt = document.createElement("option");
    opt.value = k.id;
    opt.textContent = `${t.toFixed(3)}s  ${(v.name || "event").toString()}`;
    if (state.anim.selectedKey && state.anim.selectedKey.trackId === EVENT_TRACK_ID && state.anim.selectedKey.keyId === k.id) {
      opt.selected = true;
    }
    els.eventKeyList.appendChild(opt);
  }
}

function getTrackValue(m, parsed) {
  if (!parsed) return null;
  if (parsed.type === "smparam") {
    const sm = ensureStateMachine();
    const param = getStateParamById(sm, parsed.paramId);
    if (!param) return null;
    return param.type === "bool" ? (param.value === true) : (Number(param.value) || 0);
  }
  if (!m) return null;
  if (parsed.type === "bone") {
    return getTrackValueFromBones(m.poseBones, parsed.boneIndex, parsed.prop);
  }
  if (parsed.type === "ik") {
    const list = ensureIKConstraints(m);
    const c = list[parsed.ikIndex];
    if (!c) return null;
    if (parsed.prop === "mix") return math.clamp(Number(c.mix) || 0, 0, 1);
    if (parsed.prop === "softness") return Math.max(0, Number(c.softness) || 0);
    if (parsed.prop === "bend") return c.bendPositive !== false;
    if (parsed.prop === "compress") return !!c.compress;
    if (parsed.prop === "stretch") return !!c.stretch;
    if (parsed.prop === "uniform") return !!c.uniform;
    if (parsed.prop === "target") {
      const tx = Number(c.targetX);
      const ty = Number(c.targetY);
      if (Number.isFinite(tx) && Number.isFinite(ty)) return { x: tx, y: ty };
      const p = getIKConstraintEndPointWorld(getPoseBones(m), c);
      return p ? { x: p.x, y: p.y } : { x: 0, y: 0 };
    }
    return null;
  }
  if (parsed.type === "tfc") {
    const list = ensureTransformConstraints(m);
    const c = list[parsed.transformIndex];
    if (!c) return null;
    if (parsed.prop === "rotateMix") return math.clamp(Number(c.rotateMix) || 0, 0, 1);
    if (parsed.prop === "translateMix") return math.clamp(Number(c.translateMix) || 0, 0, 1);
    if (parsed.prop === "scaleMix") return math.clamp(Number(c.scaleMix) || 0, 0, 1);
    if (parsed.prop === "shearMix") return math.clamp(Number(c.shearMix) || 0, 0, 1);
    return null;
  }
  if (parsed.type === "pth") {
    const list = ensurePathConstraints(m);
    const c = list[parsed.pathIndex];
    if (!c) return null;
    if (parsed.prop === "position") return Number(c.position) || 0;
    if (parsed.prop === "spacing") return Number(c.spacing) || 0;
    if (parsed.prop === "rotateMix") return math.clamp(Number(c.rotateMix) || 0, 0, 1);
    if (parsed.prop === "translateMix") return math.clamp(Number(c.translateMix) || 0, 0, 1);
    return null;
  }
  if (parsed.type === "layer") {
    const layer = getAnimLayerTrackById(parsed.layerId);
    if (!layer) return null;
    if (parsed.prop === "alpha") return math.clamp(Number(layer.alpha) || 0, 0, 1);
    if (parsed.prop === "enabled") return layer.enabled !== false;
    if (parsed.prop === "speed") return math.clamp(Number(layer.speed) || 0, -10, 10);
    if (parsed.prop === "offset") return math.clamp(Number(layer.offset) || 0, -9999, 9999);
    return null;
  }
  if (parsed.type === "mesh") {
    const si = Number.isFinite(parsed.slotIndex) ? Number(parsed.slotIndex) : state.activeSlot;
    if (state.slots.length > 0 && Number.isFinite(si) && si >= 0 && si < state.slots.length) {
      const offsets = getModelSlotOffsets(m, si);
      return offsets ? Array.from(offsets) : null;
    }
    return Array.from(getActiveOffsets(m));
  }
  if (parsed.type === "event") {
    return getEventDraftFromUI();
  }
  if (parsed.type === "draworder") {
    return state.slots.map((s, i) => (s && s.id ? s.id : `slot_i_${i}`));
  }
  if (parsed.type === "slot") {
    const s = state.slots[parsed.slotIndex];
    if (!s) return null;
    const activeAttachment = getActiveAttachment(s);
    if (parsed.prop === "attachment") {
      return getSlotCurrentAttachmentName(s);
    }
    if (parsed.prop === "clip") {
      return !!(activeAttachment && activeAttachment.clipEnabled);
    }
    if (parsed.prop === "clipSource") {
      return activeAttachment && activeAttachment.clipSource === "contour" ? "contour" : "fill";
    }
    if (parsed.prop === "clipEnd") {
      return activeAttachment && activeAttachment.clipEndSlotId ? String(activeAttachment.clipEndSlotId) : "";
    }
    if (parsed.prop === "color") {
      return {
        r: math.clamp(Number(s.r) || 1, 0, 1),
        g: math.clamp(Number(s.g) || 1, 0, 1),
        b: math.clamp(Number(s.b) || 1, 0, 1),
        a: math.clamp(Number(s.alpha) || 1, 0, 1),
        darkEnabled: !!s.darkEnabled,
        dr: math.clamp(Number(s.dr) || 0, 0, 1),
        dg: math.clamp(Number(s.dg) || 0, 0, 1),
        db: math.clamp(Number(s.db) || 0, 0, 1),
      };
    }
  }
  return null;
}

function setTrackValue(m, parsed, value) {
  if (!parsed) return;
  if (parsed.type === "smparam") {
    const sm = ensureStateMachine();
    const param = getStateParamById(sm, parsed.paramId);
    if (!param) return;
    param.value = parseStateParamRawValue(value, param.type);
    return;
  }
  if (!m) return;
  if (parsed.type === "bone") {
    setTrackValueToBones(m.poseBones, parsed.boneIndex, parsed.prop, value);
    return;
  }
  if (parsed.type === "ik") {
    const list = ensureIKConstraints(m);
    const c = list[parsed.ikIndex];
    if (!c) return;
    if (parsed.prop === "mix") {
      c.mix = math.clamp(Number(value) || 0, 0, 1);
    } else if (parsed.prop === "softness") {
      c.softness = Math.max(0, Number(value) || 0);
    } else if (parsed.prop === "bend") {
      c.bendPositive = value === true || Number(value) >= 0;
    } else if (parsed.prop === "compress") {
      c.compress = value === true || Number(value) > 0;
    } else if (parsed.prop === "stretch") {
      c.stretch = value === true || Number(value) > 0;
    } else if (parsed.prop === "uniform") {
      c.uniform = value === true || Number(value) > 0;
    } else if (parsed.prop === "target" && value && typeof value === "object") {
      c.targetX = Number(value.x) || 0;
      c.targetY = Number(value.y) || 0;
    }
    return;
  }
  if (parsed.type === "tfc") {
    const list = ensureTransformConstraints(m);
    const c = list[parsed.transformIndex];
    if (!c) return;
    if (parsed.prop === "rotateMix") c.rotateMix = math.clamp(Number(value) || 0, 0, 1);
    else if (parsed.prop === "translateMix") c.translateMix = math.clamp(Number(value) || 0, 0, 1);
    else if (parsed.prop === "scaleMix") c.scaleMix = math.clamp(Number(value) || 0, 0, 1);
    else if (parsed.prop === "shearMix") c.shearMix = math.clamp(Number(value) || 0, 0, 1);
    return;
  }
  if (parsed.type === "pth") {
    const list = ensurePathConstraints(m);
    const c = list[parsed.pathIndex];
    if (!c) return;
    if (parsed.prop === "position") c.position = Number(value) || 0;
    else if (parsed.prop === "spacing") c.spacing = Number(value) || 0;
    else if (parsed.prop === "rotateMix") c.rotateMix = math.clamp(Number(value) || 0, 0, 1);
    else if (parsed.prop === "translateMix") c.translateMix = math.clamp(Number(value) || 0, 0, 1);
    return;
  }
  if (parsed.type === "layer") {
    const layer = getAnimLayerTrackById(parsed.layerId);
    if (!layer) return;
    if (parsed.prop === "alpha") {
      layer.alpha = math.clamp(Number(value) || 0, 0, 1);
    } else if (parsed.prop === "enabled") {
      layer.enabled = value === true || Number(value) > 0;
    } else if (parsed.prop === "speed") {
      layer.speed = math.clamp(Number(value) || 0, -10, 10);
    } else if (parsed.prop === "offset") {
      layer.offset = math.clamp(Number(value) || 0, -9999, 9999);
    }
    return;
  }
  if (parsed.type === "mesh" && Array.isArray(value)) {
    const si = Number.isFinite(parsed.slotIndex) ? Number(parsed.slotIndex) : state.activeSlot;
    const slot = Number.isFinite(si) && si >= 0 && si < state.slots.length ? state.slots[si] : null;
    if (slot && parsed.attachmentName && getSlotCurrentAttachmentName(slot) !== parsed.attachmentName) return;
    let offsets = null;
    if (state.slots.length > 0 && Number.isFinite(si) && si >= 0 && si < state.slots.length) {
      offsets = getModelSlotOffsets(m, si);
    }
    if (!offsets) offsets = getActiveOffsets(m);
    const n = Math.min(offsets.length, value.length);
    for (let i = 0; i < n; i += 1) {
      offsets[i] = Number(value[i]) || 0;
    }
    for (let i = n; i < offsets.length; i += 1) {
      offsets[i] = 0;
    }
  }
  if (parsed.type === "event") {
    // Event track does not directly drive pose values.
  }
  if (parsed.type === "draworder" && Array.isArray(value) && value.length > 0) {
    const activeSlotObj = getActiveSlot();
    const idToSlot = new Map();
    for (const s of state.slots) {
      if (!s) continue;
      if (!s.id) s.id = makeSlotId();
      idToSlot.set(s.id, s);
    }
    const out = [];
    const used = new Set();
    for (const id of value) {
      const s = idToSlot.get(String(id));
      if (!s || used.has(s)) continue;
      used.add(s);
      out.push(s);
    }
    for (const s of state.slots) {
      if (!s || used.has(s)) continue;
      out.push(s);
    }
    if (out.length === state.slots.length) {
      state.slots = out;
      if (activeSlotObj) {
        const idx = state.slots.indexOf(activeSlotObj);
        if (idx >= 0) state.activeSlot = idx;
      }
    }
    return;
  }
  if (parsed.type === "layer") {
    const layer = getAnimLayerTrackById(parsed.layerId);
    if (!layer) return;
    if (parsed.prop === "alpha") {
      layer.alpha = math.clamp(Number(value) || 0, 0, 1);
    } else if (parsed.prop === "enabled") {
      layer.enabled = value === true || Number(value) > 0;
    } else if (parsed.prop === "speed") {
      layer.speed = math.clamp(Number(value) || 0, -10, 10);
    } else if (parsed.prop === "offset") {
      layer.offset = math.clamp(Number(value) || 0, -9999, 9999);
    }
    return;
  }
  if (parsed.type === "slot") {
    const s = state.slots[parsed.slotIndex];
    if (!s) return;
    const activeAttachment = getActiveAttachment(s);
    if (parsed.prop === "attachment") {
      if (value == null || value === false || value === "") {
        s.activeAttachment = null;
      } else if (value === true) {
        s.activeAttachment = String(s.attachmentName || "main");
      } else {
        s.activeAttachment = String(value);
      }
      ensureSlotAttachmentState(s);
      return;
    }
    if (parsed.prop === "clip") {
      if (!activeAttachment) return;
      activeAttachment.clipEnabled = value === true || Number(value) > 0;
      ensureSlotClipState(s);
      return;
    }
    if (parsed.prop === "clipSource") {
      if (!activeAttachment) return;
      activeAttachment.clipSource = String(value || "") === "contour" ? "contour" : "fill";
      ensureSlotClipState(s);
      return;
    }
    if (parsed.prop === "clipEnd") {
      if (!activeAttachment) return;
      if (value == null || value === false || value === "") activeAttachment.clipEndSlotId = null;
      else activeAttachment.clipEndSlotId = String(value);
      ensureSlotClipState(s);
      return;
    }
    if (parsed.prop === "color" && value && typeof value === "object") {
      s.r = math.clamp(Number(value.r) || 1, 0, 1);
      s.g = math.clamp(Number(value.g) || 1, 0, 1);
      s.b = math.clamp(Number(value.b) || 1, 0, 1);
      s.alpha = math.clamp(Number(value.a) || 1, 0, 1);
      if (Object.prototype.hasOwnProperty.call(value, "darkEnabled")) {
        s.darkEnabled = !!value.darkEnabled;
      }
      if (Object.prototype.hasOwnProperty.call(value, "dr")) {
        s.dr = math.clamp(Number(value.dr) || 0, 0, 1);
      }
      if (Object.prototype.hasOwnProperty.call(value, "dg")) {
        s.dg = math.clamp(Number(value.dg) || 0, 0, 1);
      }
      if (Object.prototype.hasOwnProperty.call(value, "db")) {
        s.db = math.clamp(Number(value.db) || 0, 0, 1);
      }
      ensureSlotVisualState(s);
    }
    return;
  }
}

function getTrackKeys(anim, trackId) {
  if (!anim.tracks[trackId]) anim.tracks[trackId] = [];
  return anim.tracks[trackId];
}

function sortTrackKeys(anim, trackId) {
  getTrackKeys(anim, trackId).sort((a, b) => a.time - b.time);
}

function normalizeTrackKeys(anim, trackId) {
  sortTrackKeys(anim, trackId);
  const keys = getTrackKeys(anim, trackId);
  const parsed = parseTrackId(trackId);
  const parsedVertexSlot = parsed && parsed.type === "mesh" && Number.isFinite(parsed.slotIndex) ? Number(parsed.slotIndex) : null;
  const duration = getTimelineDisplayDuration(anim);
  if (keys.length <= 1) {
    if (keys[0]) {
      keys[0].time = sanitizeTimelineTime(snapTimeIfNeeded(Number(keys[0].time) || 0), duration);
      if (parsedVertexSlot != null) keys[0].slotIndex = parsedVertexSlot;
    }
    return;
  }
  const out = [];
  for (const k of keys) {
    if (!k.id) k.id = `k_${Math.random().toString(36).slice(2, 10)}`;
    k.time = sanitizeTimelineTime(snapTimeIfNeeded(Number(k.time) || 0), duration);
    const prev = out[out.length - 1];
    const prevSlot = Number.isFinite(prev && prev.slotIndex) ? Number(prev.slotIndex) : null;
    const curSlot = Number.isFinite(k && k.slotIndex) ? Number(k.slotIndex) : parsedVertexSlot;
    const canMerge = !(parsed && parsed.type === "mesh") || prevSlot === curSlot;
    if (prev && Math.abs(prev.time - k.time) < 1e-4 && canMerge) {
      prev.value = k.value;
      prev.interp = k.interp || prev.interp || "linear";
      if (Array.isArray(k.curve) && k.curve.length >= 4) prev.curve = k.curve.slice(0, 4);
      if (Number.isFinite(curSlot)) prev.slotIndex = Number(curSlot);
    } else {
      const nk = { id: k.id, time: k.time, value: k.value, interp: k.interp || "linear" };
      if (Array.isArray(k.curve) && k.curve.length >= 4) nk.curve = k.curve.slice(0, 4);
      if (Number.isFinite(curSlot)) nk.slotIndex = Number(curSlot);
      out.push(nk);
    }
  }
  anim.tracks[trackId] = out;
}

function cloneTrackValue(v) {
  if (Array.isArray(v)) return v.slice();
  if (v && typeof v === "object") return { ...v };
  return v;
}

function ensureOnionSkinSettings() {
  if (!state.anim.onionSkin || typeof state.anim.onionSkin !== "object") {
    state.anim.onionSkin = { enabled: false, prevFrames: 2, nextFrames: 2, alpha: 0.22 };
  }
  const o = state.anim.onionSkin;
  o.enabled = !!o.enabled;
  o.prevFrames = math.clamp(Math.round(Number(o.prevFrames) || 0), 0, 12);
  o.nextFrames = math.clamp(Math.round(Number(o.nextFrames) || 0), 0, 12);
  o.alpha = math.clamp(Number(o.alpha) || 0.22, 0.01, 1);
  return o;
}

function getOnionSampleTime(baseTime, frameOffset, duration) {
  const d = Math.max(0.1, Number(duration) || 0.1);
  const step = Math.max(TIMELINE_MIN_STEP, getTimelineTimeStep());
  const t = Number(baseTime) + Number(frameOffset) * step;
  if (state.anim.loop) return wrapTime(t, d);
  return math.clamp(t, 0, d);
}

function clampTimelineZoom(value) {
  return math.clamp(Number(value) || 1, TIMELINE_ZOOM_MIN, TIMELINE_ZOOM_MAX);
}

function formatTimelineTimeLabel(t) {
  const digits = Math.max(1, getTimelineTimeDigits());
  return `${(Number(t) || 0).toFixed(digits).replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1")}s`;
}

function syncTimelineZoomUI() {
  const zoom = clampTimelineZoom(state.anim.timelineZoom);
  if (els.timelineZoomResetBtn) els.timelineZoomResetBtn.textContent = `${Math.round(zoom * 100)}%`;
  if (els.timelineZoomOutBtn) els.timelineZoomOutBtn.disabled = zoom <= TIMELINE_ZOOM_MIN + 1e-6;
  if (els.timelineZoomInBtn) els.timelineZoomInBtn.disabled = zoom >= TIMELINE_ZOOM_MAX - 1e-6;
}

function zoomTimelineBy(factor) {
  const next = clampTimelineZoom(clampTimelineZoom(state.anim.timelineZoom) * (Number(factor) || 1));
  if (Math.abs(next - clampTimelineZoom(state.anim.timelineZoom)) < 1e-6) {
    syncTimelineZoomUI();
    return;
  }
  state.anim.timelineZoom = next;
  syncTimelineZoomUI();
  renderTimelineTracks();
}

function resetTimelineZoom() {
  state.anim.timelineZoom = 1;
  syncTimelineZoomUI();
  renderTimelineTracks();
}

function getTimelineViewRange(anim) {
  const active = getAnimationActiveRange(anim);
  const span = Math.max(0.1, active.end - active.start);
  const padBefore = Math.max(0.5, span * 0.25);
  const padAfter = Math.max(0.9, span * 0.4);
  const unclampedStart = active.start - padBefore;
  const baseStart = Math.max(0, unclampedStart);
  const lostBefore = Math.max(0, baseStart - unclampedStart);
  const contentEnd = Math.max(active.duration, active.end);
  const baseEnd = Math.max(baseStart + 0.1, contentEnd + padAfter + lostBefore);
  const baseSpan = Math.max(0.1, baseEnd - baseStart);
  const zoom = clampTimelineZoom(state.anim.timelineZoom);
  const targetSpan = math.clamp(baseSpan / zoom, Math.max(TIMELINE_MIN_STEP * 4, 0.4), baseSpan / TIMELINE_ZOOM_MIN);
  const center = math.clamp(Number(state.anim.time) || active.start, baseStart, baseEnd);
  let start = center - targetSpan * 0.5;
  let end = center + targetSpan * 0.5;
  if (start < 0) {
    end += -start;
    start = 0;
  }
  if (end < start + targetSpan) end = start + targetSpan;
  return { start, end };
}

function normalizeTimelineRange(rangeOrDuration) {
  if (rangeOrDuration && typeof rangeOrDuration === "object") {
    const start = Number(rangeOrDuration.start) || 0;
    const end = Math.max(start + 0.1, Number(rangeOrDuration.end) || start + 0.1);
    return { start, end };
  }
  return { start: 0, end: Math.max(0.1, Number(rangeOrDuration) || 0.1) };
}

function getTimelineRulerTickStep(rangeOrDuration) {
  const range = normalizeTimelineRange(rangeOrDuration);
  const span = Math.max(0.1, range.end - range.start);
  const target = span / 10;
  const minStep = getTimelineTimeStep();
  const raw = Math.max(target, minStep);
  const pow = 10 ** Math.floor(Math.log10(raw));
  const ratio = raw / pow;
  let nice = 10;
  if (ratio <= 1) nice = 1;
  else if (ratio <= 2) nice = 2;
  else if (ratio <= 2.5) nice = 2.5;
  else if (ratio <= 5) nice = 5;
  return Math.max(minStep, nice * pow);
}

function getTimelineTimeStep() {
  const base = Math.max(TIMELINE_MIN_STEP, Number(state.anim.timeStep) || TIMELINE_MIN_STEP);
  const frameStep = 1 / Math.max(1, Number(state.anim.fps) || 30);
  return Math.max(base, frameStep);
}

function quantizeTimelineTime(t) {
  const step = getTimelineTimeStep();
  return Math.round((Number(t) || 0) / step) * step;
}

function getTimelineTimeDigits() {
  const step = getTimelineTimeStep();
  const s = step.toFixed(6).replace(/0+$/, "");
  const dot = s.indexOf(".");
  return dot < 0 ? 0 : s.length - dot - 1;
}

function sanitizeTimelineTime(t, duration) {
  const d = Math.max(0.1, Number(duration) || 5);
  const clamped = math.clamp(Number(t) || 0, 0, d);
  const q = quantizeTimelineTime(clamped);
  return math.clamp(q, 0, d);
}

function snapTimeIfNeeded(t) {
  let out = Number(t) || 0;
  if (state.anim.snap) {
    const fps = Math.max(1, state.anim.fps || 30);
    out = Math.round(out * fps) / fps;
  }
  return quantizeTimelineTime(out);
}

function setAnimTime(value, durationOverride = null) {
  ensureCurrentAnimation();
  const anim = getCurrentAnimation();
  if (!anim) return;
  normalizeAnimationRecord(anim);
  const baseDuration = Math.max(0.1, Number(els.animDuration.value) || anim.duration || 5);
  anim.duration = baseDuration;
  const active = getAnimationActiveRange(anim);
  const effectiveDuration = Number.isFinite(Number(durationOverride))
    ? Math.max(baseDuration, Number(durationOverride))
    : Math.max(baseDuration, Number(state.anim.duration) || baseDuration);
  state.anim.duration = effectiveDuration;
  state.anim.time = sanitizeTimelineTime(value, effectiveDuration);
  els.animDuration.value = String(baseDuration);
  if (els.animRangeStart) els.animRangeStart.value = active.start.toFixed(getTimelineTimeDigits());
  if (els.animRangeEnd) els.animRangeEnd.value = active.end.toFixed(getTimelineTimeDigits());
  els.animTime.step = String(getTimelineTimeStep());
  els.animTime.value = state.anim.time.toFixed(getTimelineTimeDigits());
  syncTimelineZoomUI();
  renderTimelineTracks();
  if (typeof requestRender === "function") requestRender("anim-time");
}

function getTimelineDisplayDuration(anim) {
  const base = Math.max(0.1, Number(anim && anim.duration) || 0.1);
  const curr = Math.max(0.1, Number(state.anim.duration) || base);
  return Math.max(base, curr);
}

function getTimelineBoneGroupKeyForSlotIndex(slotIndex) {
  const si = Number(slotIndex);
  if (!Number.isFinite(si) || si < 0 || si >= state.slots.length) return "slot:unassigned";
  const slot = state.slots[si];
  const bi = getSlotTreeBoneIndex(slot, state.mesh);
  return Number.isFinite(bi) && bi >= 0 && state.mesh && bi < state.mesh.rigBones.length ? String(bi) : "slot:unassigned";
}

function buildTimelineSlotTrackChildren(slot, slotIndex) {
  const si = Number(slotIndex);
  const name = slot && slot.name ? slot.name : `slot_${si}`;
  const activeAttachmentName = slot ? getSlotCurrentAttachmentName(slot) || slot.attachmentName || "main" : "main";
  return [
    { id: `slot:${si}:attachment`, kind: "track", slotIndex: si, prop: "attachment", label: `${name}.Attachment` },
    { id: `slot:${si}:color`, kind: "track", slotIndex: si, prop: "color", label: `${name}.Color/Alpha` },
    { id: getVertexTrackId(si, activeAttachmentName), kind: "track", slotIndex: si, prop: "deform", label: `${name}.${activeAttachmentName}.Deform` },
    { id: `slot:${si}:clip`, kind: "track", slotIndex: si, prop: "clip", label: `${name}.Clip` },
    { id: `slot:${si}:clipSource`, kind: "track", slotIndex: si, prop: "clipSource", label: `${name}.Clip Source` },
    { id: `slot:${si}:clipEnd`, kind: "track", slotIndex: si, prop: "clipEnd", label: `${name}.Clip End` },
  ];
}

function getVisibleTrackDefinitions() {
  const m = state.mesh;
  if (!m) return [];
  const out = [];
  const boneGroups = [];
  for (let idx = 0; idx < m.rigBones.length; idx += 1) {
    const b = m.rigBones[idx];
    boneGroups.push({
      id: `group:${idx}`,
      kind: "group",
      groupKey: String(idx),
      boneIndex: idx,
      label: b.name,
      expanded: !!state.anim.trackExpanded[idx],
      children: [
        { id: getTrackId(idx, "translate"), kind: "track", boneIndex: idx, prop: "translate", label: "Translate" },
        { id: getTrackId(idx, "rotate"), kind: "track", boneIndex: idx, prop: "rotate", label: "Rotate" },
        { id: getTrackId(idx, "scale"), kind: "track", boneIndex: idx, prop: "scale", label: "Length" },
        { id: getTrackId(idx, "scaleX"), kind: "track", boneIndex: idx, prop: "scaleX", label: "Scale X" },
        { id: getTrackId(idx, "scaleY"), kind: "track", boneIndex: idx, prop: "scaleY", label: "Scale Y" },
        { id: getTrackId(idx, "shearX"), kind: "track", boneIndex: idx, prop: "shearX", label: "Shear X" },
        { id: getTrackId(idx, "shearY"), kind: "track", boneIndex: idx, prop: "shearY", label: "Shear Y" },
        { id: getTrackId(idx, "animHide"), kind: "track", boneIndex: idx, prop: "animHide", label: "Anim Hide" },
      ],
    });
  }
  const unassignedSlotChildren = [];
  if (state.slots && state.slots.length > 0) {
    for (let si = 0; si < state.slots.length; si += 1) {
      const slot = state.slots[si];
      const groupKey = getTimelineBoneGroupKeyForSlotIndex(si);
      const slotChildren = buildTimelineSlotTrackChildren(slot, si);
      if (groupKey === "slot:unassigned") {
        unassignedSlotChildren.push(...slotChildren);
        continue;
      }
      const bi = Number(groupKey);
      if (Number.isFinite(bi) && boneGroups[bi]) boneGroups[bi].children.push(...slotChildren);
      else unassignedSlotChildren.push(...slotChildren);
    }
  } else {
    unassignedSlotChildren.push({ id: VERTEX_TRACK_ID, kind: "track", label: "deform" });
  }
  out.push(...boneGroups);
  if (unassignedSlotChildren.length > 0) {
    out.push({
      id: "group:slot:unassigned",
      kind: "group",
      groupKey: "slot:unassigned",
      label: "Unassigned Slots",
      expanded: state.anim.trackExpanded["slot:unassigned"] === true,
      children: unassignedSlotChildren,
    });
  }
  const ikList = ensureIKConstraints(m);
  if (ikList.length > 0) {
    out.push({
      id: "group:ik",
      kind: "group",
      groupKey: "ik",
      label: "IK",
      expanded: state.anim.trackExpanded.ik !== false,
      children: ikList.flatMap((c, i) => {
        const name = c && c.name ? c.name : `ik_${i}`;
        return [
          { id: getIKTrackId(i, "mix"), kind: "track", ikIndex: i, prop: "mix", label: `${name}.Mix` },
          { id: getIKTrackId(i, "softness"), kind: "track", ikIndex: i, prop: "softness", label: `${name}.Softness` },
          { id: getIKTrackId(i, "bend"), kind: "track", ikIndex: i, prop: "bend", label: `${name}.Bend` },
          { id: getIKTrackId(i, "compress"), kind: "track", ikIndex: i, prop: "compress", label: `${name}.Compress` },
          { id: getIKTrackId(i, "stretch"), kind: "track", ikIndex: i, prop: "stretch", label: `${name}.Stretch` },
          { id: getIKTrackId(i, "uniform"), kind: "track", ikIndex: i, prop: "uniform", label: `${name}.Uniform` },
          { id: getIKTrackId(i, "target"), kind: "track", ikIndex: i, prop: "target", label: `${name}.Target` },
        ];
      }),
    });
  }
  const tfcList = ensureTransformConstraints(m);
  if (tfcList.length > 0) {
    out.push({
      id: "group:tfc",
      kind: "group",
      groupKey: "tfc",
      label: "Transform",
      expanded: state.anim.trackExpanded.tfc !== false,
      children: tfcList.flatMap((c, i) => {
        const name = c && c.name ? c.name : `transform_${i}`;
        return [
          { id: getTransformTrackId(i, "rotateMix"), kind: "track", transformIndex: i, prop: "rotateMix", label: `${name}.RotateMix` },
          { id: getTransformTrackId(i, "translateMix"), kind: "track", transformIndex: i, prop: "translateMix", label: `${name}.TranslateMix` },
          { id: getTransformTrackId(i, "scaleMix"), kind: "track", transformIndex: i, prop: "scaleMix", label: `${name}.ScaleMix` },
          { id: getTransformTrackId(i, "shearMix"), kind: "track", transformIndex: i, prop: "shearMix", label: `${name}.ShearMix` },
        ];
      }),
    });
  }
  const pthList = ensurePathConstraints(m);
  if (pthList.length > 0) {
    out.push({
      id: "group:pth",
      kind: "group",
      groupKey: "pth",
      label: "Path",
      expanded: state.anim.trackExpanded.pth !== false,
      children: pthList.flatMap((c, i) => {
        const name = c && c.name ? c.name : `path_${i}`;
        return [
          { id: getPathTrackId(i, "position"), kind: "track", pathIndex: i, prop: "position", label: `${name}.Position` },
          { id: getPathTrackId(i, "spacing"), kind: "track", pathIndex: i, prop: "spacing", label: `${name}.Spacing` },
          { id: getPathTrackId(i, "rotateMix"), kind: "track", pathIndex: i, prop: "rotateMix", label: `${name}.RotateMix` },
          { id: getPathTrackId(i, "translateMix"), kind: "track", pathIndex: i, prop: "translateMix", label: `${name}.TranslateMix` },
        ];
      }),
    });
  }
  const layerList = ensureAnimLayerTracks();
  if (layerList.length > 0) {
    out.push({
      id: "group:layer",
      kind: "group",
      groupKey: "layer",
      label: "Layers",
      expanded: state.anim.trackExpanded.layer !== false,
      children: layerList.flatMap((l) => [
        {
          id: getLayerTrackId(l.id, "alpha"),
          kind: "track",
          layerId: l.id,
          prop: "alpha",
          label: `${l.name || "Layer"}.Alpha`,
        },
        {
          id: getLayerTrackId(l.id, "enabled"),
          kind: "track",
          layerId: l.id,
          prop: "enabled",
          label: `${l.name || "Layer"}.On`,
        },
        {
          id: getLayerTrackId(l.id, "speed"),
          kind: "track",
          layerId: l.id,
          prop: "speed",
          label: `${l.name || "Layer"}.Speed`,
        },
        {
          id: getLayerTrackId(l.id, "offset"),
          kind: "track",
          layerId: l.id,
          prop: "offset",
          label: `${l.name || "Layer"}.Offset`,
        },
      ]),
    });
  }
  const sm = ensureStateMachine();
  if (Array.isArray(sm.parameters) && sm.parameters.length > 0) {
    out.push({
      id: "group:smparam",
      kind: "group",
      groupKey: "smparam",
      label: "State Params",
      expanded: state.anim.trackExpanded.smparam !== false,
      children: sm.parameters.map((p) => ({
        id: getStateParamTrackId(p.id),
        kind: "track",
        paramId: p.id,
        prop: "value",
        label: `${p.name}.${p.type}`,
      })),
    });
  }
  return out;
}

function getTimelineOtherTrackDefinitions() {
  return [
    { id: DRAWORDER_TRACK_ID, kind: "track", label: "Draw Order" },
    { id: EVENT_TRACK_ID, kind: "track", label: "Events" },
  ];
}

function getTrackGroupKey(trackId) {
  if (!trackId) return "";
  if (trackId === EVENT_TRACK_ID || trackId === DRAWORDER_TRACK_ID) return "";
  const p = parseTrackId(trackId);
  if (!p) return "";
  if (p.type === "mesh") return getTimelineBoneGroupKeyForSlotIndex(p.slotIndex);
  if (p.type === "slot") return getTimelineBoneGroupKeyForSlotIndex(p.slotIndex);
  if (p.type === "bone") return String(p.boneIndex);
  if (p.type === "ik") return "ik";
  if (p.type === "tfc") return "tfc";
  if (p.type === "pth") return "pth";
  if (p.type === "layer") return "layer";
  if (p.type === "smparam") return "smparam";
  return "";
}

function hasAnySoloGroups() {
  const s = state.anim.groupSolo || {};
  return Object.keys(s).some((k) => s[k]);
}

function isGroupPlayable(groupKey) {
  const gk = String(groupKey || "");
  if (!gk) return true;
  const muted = !!(state.anim.groupMute && state.anim.groupMute[gk]);
  if (muted) return false;
  if (hasAnySoloGroups()) {
    return !!(state.anim.groupSolo && state.anim.groupSolo[gk]);
  }
  return true;
}

function isTrackPlayable(trackId) {
  return isGroupPlayable(getTrackGroupKey(trackId));
}

function clearTimelineSoloMuteFlags(silent = false) {
  state.anim.groupMute = {};
  state.anim.groupSolo = {};
  renderTimelineTracks();
  if (!silent) setStatus("Cleared all Solo/Mute groups.");
}

function getTimelineGroupsForView(anim) {
  const query = String(state.anim.filterText || "").trim().toLowerCase();
  const onlyKeyed = !!state.anim.onlyKeyed;
  const src = getVisibleTrackDefinitions();
  const out = [];
  for (const g of src) {
    const baseChildren = Array.isArray(g.children) ? g.children : [];
    let children = baseChildren;
    if (onlyKeyed && anim) {
      children = children.filter((c) => {
        const keys = getTrackKeys(anim, c.id);
        return Array.isArray(keys) && keys.length > 0;
      });
    }
    if (query) {
      const gMatch = String(g.label || "").toLowerCase().includes(query);
      if (gMatch) {
        // keep children as-is after only-keyed filtering
      } else {
        children = children.filter((c) => {
          const t = `${String(c.label || "")} ${String(c.id || "")}`.toLowerCase();
          return t.includes(query);
        });
      }
    }
    if (children.length <= 0) continue;
    out.push({ ...g, children });
  }
  return out;
}

function getTimelineOtherRowsForView(anim) {
  const query = String(state.anim.filterText || "").trim().toLowerCase();
  const onlyKeyed = !!state.anim.onlyKeyed;
  const rows = [];
  for (const track of getTimelineOtherTrackDefinitions()) {
    if (!track || !track.id) continue;
    const keys = anim ? getTrackKeys(anim, track.id) : [];
    const isSelected = state.anim.selectedTrack === track.id;
    if (onlyKeyed && !isSelected && (!Array.isArray(keys) || keys.length <= 0)) continue;
    if (query) {
      const hay = `${String(track.label || "")} ${String(track.id || "")}`.toLowerCase();
      if (!hay.includes(query)) continue;
    }
    rows.push(track);
  }
  return rows;
}

function getAvailableTimelineTracks() {
  const groups = getVisibleTrackDefinitions();
  const tracks = [];
  for (const g of groups) {
    if (!g || !Array.isArray(g.children)) continue;
    for (const c of g.children) {
      if (c && c.id) tracks.push(c);
    }
  }
  for (const t of getTimelineOtherTrackDefinitions()) {
    if (t && t.id) tracks.push(t);
  }
  return tracks;
}

function getTimelineTrackDisplayLabel(track) {
  const t = track && typeof track === "object" ? track : null;
  if (!t || !t.id) return "";
  const parsed = parseTrackId(t.id);
  if (parsed && parsed.type === "mesh") {
    if (Number.isFinite(parsed.slotIndex)) {
      const s = state.slots[parsed.slotIndex];
      const slotName = s && s.name ? s.name : `slot_${parsed.slotIndex}`;
      return `${slotName}.deform`;
    }
    return "deform";
  }
  if (t.id === DRAWORDER_TRACK_ID) return "Draw Order";
  if (t.id === EVENT_TRACK_ID) return "Events";
  if (t.id.startsWith("slot:")) {
    const s = state.slots[t.slotIndex];
    const slotName = s && s.name ? s.name : `slot_${t.slotIndex}`;
    return `${slotName}.${t.label}`;
  }
  if (t.id.startsWith("ik:") || t.id.startsWith("tfc:") || t.id.startsWith("pth:") || t.id.startsWith("layer:") || t.id.startsWith("smparam:")) {
    return t.label;
  }
  const boneName = state.mesh && state.mesh.rigBones[t.boneIndex] ? state.mesh.rigBones[t.boneIndex].name : `bone_${t.boneIndex}`;
  return `${boneName}.${t.label}`;
}

function refreshTimelineContextualTools() {
  const drawOrderSelected = state.anim.selectedTrack === DRAWORDER_TRACK_ID;
  if (els.drawOrderToggleBtn) {
    els.drawOrderToggleBtn.classList.toggle("hidden", !drawOrderSelected);
    els.drawOrderToggleBtn.textContent = state.anim.drawOrderEditorOpen ? "Hide Draw Order" : "Draw Order";
  }
  if (!drawOrderSelected && state.anim.drawOrderEditorOpen) {
    state.anim.drawOrderEditorOpen = false;
  }
  if (els.drawOrderEditor) {
    els.drawOrderEditor.classList.toggle("collapsed", !drawOrderSelected || !state.anim.drawOrderEditorOpen);
  }
}

function refreshTrackSelect() {
  if (!els.trackSelect) return;
  const tracks = getAvailableTimelineTracks();
  if (tracks.length === 0) {
    state.anim.selectedTrack = "";
    els.trackSelect.value = "";
    els.trackSelect.placeholder = "No tracks available";
    els.trackSelect.title = "No tracks available";
    refreshTimelineContextualTools();
    return;
  }
  let selected = tracks.find((t) => t.id === state.anim.selectedTrack) || null;
  if (!selected) {
    state.anim.selectedTrack = tracks[0].id;
    selected = tracks[0];
  }
  const label = getTimelineTrackDisplayLabel(selected);
  els.trackSelect.value = label;
  els.trackSelect.placeholder = "Select a track in timeline";
  els.trackSelect.title = label ? `Selected Track: ${label}` : "Select a track in the timeline below";
  refreshTimelineContextualTools();
}

function setSelectedTimelineTrack(trackId, options = {}) {
  state.anim.selectedTrack = trackId ? String(trackId) : "";
  refreshTrackSelect();
  if (options.syncLayer !== false) syncLayerPanelFromSelectedTrack();
  if (options.clearKeys) clearTimelineKeySelection();
  if (options.render) renderTimelineTracks();
}

function refreshAnimationUI() {
  ensureCurrentAnimation();
  const current = getCurrentAnimation();
  els.animSelect.innerHTML = "";
  for (const a of state.anim.animations) {
    const opt = document.createElement("option");
    opt.value = a.id;
    opt.textContent = a.name;
    els.animSelect.appendChild(opt);
  }
  if (current) {
    normalizeAnimationRecord(current);
    const active = getAnimationActiveRange(current);
    els.animSelect.value = current.id;
    els.animName.value = current.name;
    els.animDuration.value = String(current.duration);
    if (els.animRangeStart) els.animRangeStart.value = active.start.toFixed(getTimelineTimeDigits());
    if (els.animRangeEnd) els.animRangeEnd.value = active.end.toFixed(getTimelineTimeDigits());
    state.anim.duration = current.duration;
  }
  els.animLoop.checked = !!state.anim.loop;
  els.animSnap.checked = !!state.anim.snap;
  const onion = ensureOnionSkinSettings();
  if (els.onionEnabled) els.onionEnabled.checked = !!onion.enabled;
  if (els.onionPrev) els.onionPrev.value = String(onion.prevFrames);
  if (els.onionNext) els.onionNext.value = String(onion.nextFrames);
  if (els.onionAlpha) els.onionAlpha.value = String(onion.alpha);
  els.animFps.value = String(Math.max(1, state.anim.fps || 30));
  if (els.animTimeStep) {
    els.animTimeStep.value = String(getTimelineTimeStep());
    els.animTimeStep.step = String(TIMELINE_MIN_STEP);
  }
  syncTimelineZoomUI();
  if (els.timelineFilter) els.timelineFilter.value = String(state.anim.filterText || "");
  if (els.timelineOnlyKeyed) els.timelineOnlyKeyed.checked = !!state.anim.onlyKeyed;
  refreshAnimationMixUI();
  refreshAnimationLayerUI();
  refreshStateMachineUI();
  refreshAutoKeyUI();
  refreshEventKeyListUI();
  refreshDrawOrderUI();
  refreshBatchExportUI();
  refreshTrackSelect();
  if (els.undoBtn) els.undoBtn.disabled = state.history.undo.length <= 1;
  if (els.redoBtn) els.redoBtn.disabled = state.history.redo.length <= 0;
  renderTimelineTracks();
  renderCurveEditor();
}

function refreshBatchExportUI() {
  if (!els.batchExportPanel) return;
  els.batchExportPanel.classList.toggle("collapsed", !state.anim.batchExportOpen);
  const be = state.anim.batchExport || {};
  if (els.batchExportFormat) els.batchExportFormat.value = be.format === "gif" || be.format === "pngseq" ? be.format : "webm";
  if (els.batchExportFps) els.batchExportFps.value = String(Math.max(1, Math.min(60, Math.round(Number(be.fps) || 15))));
  if (els.batchExportPrefix) els.batchExportPrefix.value = String(be.prefix || "batch");
  if (els.batchExportRetries) els.batchExportRetries.value = String(Math.max(0, Math.min(5, Math.round(Number(be.retries) || 1))));
  if (els.batchExportDelayMs) els.batchExportDelayMs.value = String(Math.max(0, Math.min(5000, Math.round(Number(be.delayMs) || 120))));
  if (els.batchExportZipPng) {
    els.batchExportZipPng.checked = be.zipPng !== false;
    els.batchExportZipPng.disabled = (els.batchExportFormat ? els.batchExportFormat.value : be.format) !== "pngseq";
  }
  if (!els.batchExportAnimList) return;
  const prevSelected = new Set(Array.from(els.batchExportAnimList.selectedOptions || []).map((o) => String(o.value)));
  const currentAnimId = getCurrentAnimation() ? String(getCurrentAnimation().id) : "";
  els.batchExportAnimList.innerHTML = "";
  for (const a of state.anim.animations || []) {
    const opt = document.createElement("option");
    opt.value = a.id;
    opt.textContent = `${a.name} (${Math.max(0.1, Number(a.duration) || 0.1).toFixed(2)}s)`;
    if (prevSelected.has(String(a.id)) || (!prevSelected.size && currentAnimId && String(a.id) === currentAnimId)) {
      opt.selected = true;
    }
    els.batchExportAnimList.appendChild(opt);
  }
}

function refreshStateMachineUI() {
  if (!els.smStateSelect) return;
  const sm = ensureStateMachine();
  const states = sm.states || [];
  const selectedState = getCurrentStateMachineState();
  const params = sm.parameters || [];

  if (els.smEnabled) els.smEnabled.checked = sm.enabled !== false;

  els.smStateSelect.innerHTML = "";
  for (const s of states) {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = s.name || s.id;
    els.smStateSelect.appendChild(opt);
  }
  els.smStateSelect.value = selectedState ? selectedState.id : "";
  if (els.smStateDeleteBtn) els.smStateDeleteBtn.disabled = states.length <= 1;

  if (els.smStateName) {
    els.smStateName.value = selectedState ? selectedState.name : "";
    els.smStateName.disabled = !selectedState;
  }

  if (els.smStateAnim) {
    els.smStateAnim.innerHTML = "";
    const none = document.createElement("option");
    none.value = "";
    none.textContent = "(none)";
    els.smStateAnim.appendChild(none);
    for (const a of state.anim.animations || []) {
      const opt = document.createElement("option");
      opt.value = a.id;
      opt.textContent = a.name;
      els.smStateAnim.appendChild(opt);
    }
    els.smStateAnim.value = selectedState && selectedState.animId ? selectedState.animId : "";
    els.smStateAnim.disabled = !selectedState;
  }

  if (els.smTransitionTo) {
    els.smTransitionTo.innerHTML = "";
    for (const s of states) {
      if (selectedState && s.id === selectedState.id) continue;
      const opt = document.createElement("option");
      opt.value = s.id;
      opt.textContent = s.name || s.id;
      els.smTransitionTo.appendChild(opt);
    }
    if (!els.smTransitionTo.value && els.smTransitionTo.options.length > 0) {
      els.smTransitionTo.value = els.smTransitionTo.options[0].value;
    }
    els.smTransitionTo.disabled = !selectedState || els.smTransitionTo.options.length <= 0;
  }

  if (els.smTransitionDur) {
    els.smTransitionDur.value = String(sm.pendingDuration || 0.2);
    els.smTransitionDur.disabled = !selectedState;
  }

  if (els.smTransitionList) {
    els.smTransitionList.innerHTML = "";
    const rows = selectedState && Array.isArray(selectedState.transitions) ? selectedState.transitions : [];
    for (const t of rows) {
      const to = states.find((s) => s.id === t.toStateId);
      const opt = document.createElement("option");
      opt.value = t.id;
      const condCount = Array.isArray(t.conditions) ? t.conditions.length : 0;
      const autoTag = t.auto === true ? " auto" : "";
      opt.textContent = `${selectedState.name} -> ${(to && to.name) || t.toStateId} (${Number(t.duration || 0.2).toFixed(2)}s${autoTag}, c${condCount})`;
      els.smTransitionList.appendChild(opt);
    }
    if (rows.length > 0) {
      const has = rows.some((t) => t.id === sm.selectedTransitionId);
      els.smTransitionList.value = has ? sm.selectedTransitionId : rows[0].id;
      sm.selectedTransitionId = els.smTransitionList.value;
    } else {
      sm.selectedTransitionId = "";
    }
    els.smTransitionList.disabled = rows.length <= 0;
  }

  const selectedTransition =
    selectedState && Array.isArray(selectedState.transitions)
      ? selectedState.transitions.find((t) => t.id === sm.selectedTransitionId) || null
      : null;

  if (els.smTransitionAddBtn) els.smTransitionAddBtn.disabled = !selectedState || !els.smTransitionTo || !els.smTransitionTo.value;
  if (els.smTransitionDeleteBtn) els.smTransitionDeleteBtn.disabled = !sm.selectedTransitionId;
  if (els.smTransitionGoBtn) els.smTransitionGoBtn.disabled = !sm.selectedTransitionId || sm.enabled === false;

  if (els.smParamSelect) {
    els.smParamSelect.innerHTML = "";
    for (const p of params) {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = `${p.name} (${p.type})`;
      els.smParamSelect.appendChild(opt);
    }
    if (params.length > 0) {
      const has = params.some((p) => p.id === sm.selectedParamId);
      els.smParamSelect.value = has ? sm.selectedParamId : params[0].id;
      sm.selectedParamId = els.smParamSelect.value;
    } else {
      sm.selectedParamId = "";
    }
    els.smParamSelect.disabled = params.length <= 0;
  }

  const selectedParam = getStateParamById(sm, sm.selectedParamId);
  if (els.smParamDeleteBtn) els.smParamDeleteBtn.disabled = !selectedParam;
  if (els.smParamName) {
    els.smParamName.value = selectedParam ? selectedParam.name : "";
    els.smParamName.disabled = !selectedParam;
  }
  if (els.smParamType) {
    els.smParamType.value = selectedParam ? selectedParam.type : "float";
    els.smParamType.disabled = !selectedParam;
  }
  if (els.smParamDefault) {
    els.smParamDefault.value = selectedParam
      ? (selectedParam.type === "bool" ? (selectedParam.defaultValue ? "true" : "false") : String(Number(selectedParam.defaultValue) || 0))
      : "0";
    els.smParamDefault.disabled = !selectedParam;
  }
  if (els.smParamValue) {
    els.smParamValue.value = selectedParam
      ? (selectedParam.type === "bool" ? (selectedParam.value === true ? "true" : "false") : String(Number(selectedParam.value) || 0))
      : "0";
    els.smParamValue.disabled = !selectedParam;
  }
  if (els.smParamSetBtn) els.smParamSetBtn.disabled = !selectedParam;
  if (els.smParamKeyBtn) els.smParamKeyBtn.disabled = !selectedParam;

  if (els.smTransitionAuto) {
    els.smTransitionAuto.checked = !!(selectedTransition && selectedTransition.auto === true);
    els.smTransitionAuto.disabled = !selectedTransition;
  }

  if (els.smCondParam) {
    els.smCondParam.innerHTML = "";
    for (const p of params) {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.name;
      els.smCondParam.appendChild(opt);
    }
    if (params.length > 0 && !els.smCondParam.value) els.smCondParam.value = params[0].id;
    els.smCondParam.disabled = !selectedTransition || params.length <= 0;
  }
  if (els.smCondOp) els.smCondOp.disabled = !selectedTransition;
  if (els.smCondValue) els.smCondValue.disabled = !selectedTransition;
  if (els.smCondAddBtn) els.smCondAddBtn.disabled = !selectedTransition || params.length <= 0;

  if (els.smCondList) {
    els.smCondList.innerHTML = "";
    const rows = selectedTransition && Array.isArray(selectedTransition.conditions) ? selectedTransition.conditions : [];
    for (const c of rows) {
      const p = getStateParamById(sm, c.paramId);
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = `${p ? p.name : c.paramId} ${c.op || "eq"} ${String(c.value)}`;
      els.smCondList.appendChild(opt);
    }
    if (rows.length > 0) {
      const has = rows.some((c) => c.id === sm.selectedConditionId);
      els.smCondList.value = has ? sm.selectedConditionId : rows[0].id;
      sm.selectedConditionId = els.smCondList.value;
    } else {
      sm.selectedConditionId = "";
    }
    els.smCondList.disabled = rows.length <= 0;
  }
  if (els.smCondDeleteBtn) els.smCondDeleteBtn.disabled = !sm.selectedConditionId;
  if (els.smBridgeExportBtn) els.smBridgeExportBtn.disabled = params.length <= 0;
  if (els.smBridgeCodeBtn) els.smBridgeCodeBtn.disabled = params.length <= 0;
  if (els.smBridgeParamSelect) {
    els.smBridgeParamSelect.innerHTML = "";
    for (const p of params) {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.name;
      els.smBridgeParamSelect.appendChild(opt);
    }
    const bridgeParamId = selectedParam ? selectedParam.id : (params[0] ? params[0].id : "");
    if (bridgeParamId && params.some((p) => p.id === bridgeParamId)) els.smBridgeParamSelect.value = bridgeParamId;
    els.smBridgeParamSelect.disabled = params.length <= 0;
  }
  if (els.smBridgeParamValue) {
    const bridgeParam = getStateParamById(sm, String(els.smBridgeParamSelect ? els.smBridgeParamSelect.value : ""));
    if (bridgeParam) {
      els.smBridgeParamValue.value =
        bridgeParam.type === "bool" ? (bridgeParam.value === true ? "true" : "false") : String(Number(bridgeParam.value) || 0);
    }
    els.smBridgeParamValue.disabled = params.length <= 0;
  }
  if (els.smBridgeSetBtn) els.smBridgeSetBtn.disabled = params.length <= 0;
  if (els.smBridgeApiInfo) {
    els.smBridgeApiInfo.value = "window.setAnimParam(name, value), getAnimParam(name), listAnimParams()";
  }
}

function refreshAnimationMixUI() {
  if (!els.animMixTo) return;
  const current = getCurrentAnimation();
  const currentId = current ? current.id : "";
  els.animMixTo.innerHTML = "";
  for (const a of state.anim.animations) {
    const opt = document.createElement("option");
    opt.value = a.id;
    opt.textContent = a.name;
    els.animMixTo.appendChild(opt);
  }
  const fallback = state.anim.animations.find((a) => a.id !== currentId) || state.anim.animations[0] || null;
  if (fallback) els.animMixTo.value = fallback.id;
  if (els.animMixDur) {
    const dur = Math.max(0.01, Number(state.anim.mix.duration) || 0.2);
    state.anim.mix.duration = dur;
    els.animMixDur.value = String(dur);
  }
  if (els.animMixInfo) {
    if (state.anim.mix.active) {
      const p = Math.round(math.clamp((state.anim.mix.elapsed / Math.max(1e-6, state.anim.mix.duration)) * 100, 0, 100));
      els.animMixInfo.value = `Mixing ${p}%`;
    } else {
      els.animMixInfo.value = "State: idle";
    }
  }
}

function refreshAnimationLayerUI() {
  if (!els.layerTrackSelect) return;
  const layers = ensureAnimLayerTracks();
  const bones = state.mesh && Array.isArray(state.mesh.rigBones) ? state.mesh.rigBones : [];
  const currentAnim = getCurrentAnimation();
  const selected = getSelectedLayerTrack();

  els.layerTrackSelect.innerHTML = "";
  for (const t of layers) {
    const opt = document.createElement("option");
    opt.value = t.id;
    opt.textContent = t.name || "Layer";
    els.layerTrackSelect.appendChild(opt);
  }
  els.layerTrackSelect.value = selected ? selected.id : "";
  els.layerTrackSelect.disabled = layers.length === 0;
  if (els.layerTrackDeleteBtn) els.layerTrackDeleteBtn.disabled = layers.length === 0;

  if (els.layerTrackAnim) {
    els.layerTrackAnim.innerHTML = "";
    const none = document.createElement("option");
    none.value = "";
    none.textContent = "(none)";
    els.layerTrackAnim.appendChild(none);
    for (const a of state.anim.animations) {
      const opt = document.createElement("option");
      opt.value = a.id;
      opt.textContent = a.name;
      els.layerTrackAnim.appendChild(opt);
    }
    const fallbackAnim = state.anim.animations.find((a) => a.id !== (currentAnim && currentAnim.id)) || state.anim.animations[0];
    const val = selected && selected.animId ? selected.animId : fallbackAnim ? fallbackAnim.id : "";
    els.layerTrackAnim.value = val;
    if (selected && !selected.animId && val) selected.animId = val;
    els.layerTrackAnim.disabled = !selected;
  }

  if (els.layerTrackEnabled) {
    els.layerTrackEnabled.checked = selected ? selected.enabled !== false : false;
    els.layerTrackEnabled.disabled = !selected;
  }
  if (els.layerTrackLoop) {
    els.layerTrackLoop.checked = selected ? selected.loop !== false : true;
    els.layerTrackLoop.disabled = !selected;
  }
  if (els.layerTrackSpeed) {
    els.layerTrackSpeed.value = selected ? String(Number(selected.speed) || 1) : "1";
    els.layerTrackSpeed.disabled = !selected;
  }
  if (els.layerTrackOffset) {
    els.layerTrackOffset.value = selected ? String(Number(selected.offset) || 0) : "0";
    els.layerTrackOffset.disabled = !selected;
  }
  if (els.layerTrackAlpha) {
    els.layerTrackAlpha.value = selected ? String(math.clamp(Number(selected.alpha) || 0, 0, 1)) : "1";
    els.layerTrackAlpha.disabled = !selected;
  }
  if (els.layerTrackMode) {
    els.layerTrackMode.value = selected && selected.mode === "add" ? "add" : "replace";
    els.layerTrackMode.disabled = !selected;
  }
  if (els.layerTrackMaskMode) {
    els.layerTrackMaskMode.value =
      selected && (selected.maskMode === "include" || selected.maskMode === "exclude") ? selected.maskMode : "all";
    els.layerTrackMaskMode.disabled = !selected;
  }

  if (els.layerTrackBone) {
    els.layerTrackBone.innerHTML = "";
    for (let i = 0; i < bones.length; i += 1) {
      const b = bones[i];
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = b && b.name ? `${i}: ${b.name}` : `bone_${i}`;
      els.layerTrackBone.appendChild(opt);
    }
    els.layerTrackBone.disabled = !selected || bones.length === 0;
  }
  if (els.layerTrackBoneAddBtn) {
    els.layerTrackBoneAddBtn.disabled = !selected || bones.length === 0;
  }
  if (els.layerTrackBoneClearBtn) {
    els.layerTrackBoneClearBtn.disabled = !selected || !selected.maskBones || selected.maskBones.length === 0;
  }
  if (els.layerTrackBoneList) {
    const names = selected
      ? (selected.maskBones || []).map((bi) => (bones[bi] && bones[bi].name ? bones[bi].name : `bone_${bi}`))
      : [];
    els.layerTrackBoneList.value = names.join(", ");
    els.layerTrackBoneList.disabled = !selected;
  }
}

function refreshDrawOrderUI() {
  if (!els.drawOrderList) return;
  const prevSel = String(els.drawOrderList.value || "");
  const selectedSlot = getActiveSlot();
  const selectedId = selectedSlot && selectedSlot.id ? String(selectedSlot.id) : "";
  els.drawOrderList.innerHTML = "";
  for (let i = 0; i < state.slots.length; i += 1) {
    const s = state.slots[i];
    if (!s) continue;
    if (!s.id) s.id = makeSlotId();
    const opt = document.createElement("option");
    opt.value = String(s.id);
    opt.textContent = `${i}. ${s.name || `slot_${i}`}`;
    els.drawOrderList.appendChild(opt);
  }
  const preferred = prevSel || selectedId;
  if (preferred && [...els.drawOrderList.options].some((o) => o.value === preferred)) {
    els.drawOrderList.value = preferred;
  } else if (els.drawOrderList.options.length > 0) {
    els.drawOrderList.selectedIndex = 0;
  }
  refreshDrawOrderEditorButtonState();
  refreshTimelineContextualTools();
}

function refreshDrawOrderEditorButtonState() {
  if (!els.drawOrderList) return;
  const hasSel = els.drawOrderList.selectedIndex >= 0;
  const hasItems = els.drawOrderList.options.length > 0;
  if (els.drawOrderUpBtn) els.drawOrderUpBtn.disabled = !hasSel || els.drawOrderList.selectedIndex <= 0;
  if (els.drawOrderDownBtn) {
    els.drawOrderDownBtn.disabled =
      !hasSel || els.drawOrderList.selectedIndex < 0 || els.drawOrderList.selectedIndex >= els.drawOrderList.options.length - 1;
  }
  if (els.drawOrderApplyBtn) els.drawOrderApplyBtn.disabled = !hasItems;
  if (els.drawOrderApplyKeyBtn) els.drawOrderApplyKeyBtn.disabled = !hasItems;
}

function moveDrawOrderSelection(dir) {
  if (!els.drawOrderList) return;
  const list = els.drawOrderList;
  const idx = list.selectedIndex;
  if (idx < 0) return;
  const next = idx + dir;
  if (next < 0 || next >= list.options.length) return;
  const opt = list.options[idx];
  const ref = dir < 0 ? list.options[next] : list.options[next].nextSibling;
  list.insertBefore(opt, ref || null);
  list.selectedIndex = next;
  refreshDrawOrderEditorButtonState();
}

function applyDrawOrderFromUI(writeKey = false) {
  if (!els.drawOrderList || els.drawOrderList.options.length <= 0) return false;
  const ids = [...els.drawOrderList.options].map((o) => String(o.value || ""));
  const activeSlotObj = getActiveSlot();
  const idMap = new Map();
  for (const s of state.slots) {
    if (!s) continue;
    if (!s.id) s.id = makeSlotId();
    idMap.set(String(s.id), s);
  }
  const out = [];
  const used = new Set();
  for (const id of ids) {
    const s = idMap.get(id);
    if (!s || used.has(s)) continue;
    used.add(s);
    out.push(s);
  }
  for (const s of state.slots) {
    if (!s || used.has(s)) continue;
    out.push(s);
  }
  if (out.length !== state.slots.length) return false;
  state.slots = out;
  if (activeSlotObj) {
    const idx = state.slots.indexOf(activeSlotObj);
    if (idx >= 0) state.activeSlot = idx;
  }
  markDirtyDrawOrder();
  renderBoneTree();
  refreshSlotUI();
  refreshTrackSelect();
  renderTimelineTracks();
  if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time);
  if (writeKey) {
    setSelectedTimelineTrack(DRAWORDER_TRACK_ID);
    addOrUpdateKeyframeForTrack(DRAWORDER_TRACK_ID, false);
  } else {
    setStatus("Draw order applied.");
  }
  return true;
}

function addAnimationLayerTrack() {
  ensureAnimLayerTracks();
  const current = getCurrentAnimation();
  const fallback = state.anim.animations.find((a) => !current || a.id !== current.id) || state.anim.animations[0] || null;
  const layer = createAnimLayerTrack(`Layer ${state.anim.layerTracks.length + 1}`);
  if (fallback) layer.animId = fallback.id;
  state.anim.layerTracks.push(layer);
  state.anim.selectedLayerTrackId = layer.id;
  refreshAnimationLayerUI();
  return layer;
}

function removeSelectedAnimationLayerTrack() {
  ensureAnimLayerTracks();
  const sel = getSelectedLayerTrack();
  if (!sel) return false;
  state.anim.layerTracks = state.anim.layerTracks.filter((t) => t.id !== sel.id);
  if (state.anim.layerTracks.length > 0) {
    state.anim.selectedLayerTrackId = state.anim.layerTracks[Math.max(0, state.anim.layerTracks.length - 1)].id;
  } else {
    state.anim.selectedLayerTrackId = "";
  }
  refreshAnimationLayerUI();
  return true;
}

function timelineXForTime(t, width, duration) {
  const range = normalizeTimelineRange(duration);
  const span = Math.max(0.1, range.end - range.start);
  return math.clamp((((Number(t) || 0) - range.start) / span) * width, 0, width);
}

function timeForTimelineX(x, width, duration) {
  const range = normalizeTimelineRange(duration);
  const span = Math.max(0.1, range.end - range.start);
  if (width <= 1) return range.start;
  return math.clamp(range.start + (x / width) * span, range.start, range.end);
}

function collectUniqueKeyTimes(anim, trackIds) {
  const bag = [];
  for (const trackId of trackIds) {
    for (const k of getTrackKeys(anim, trackId)) bag.push(k.time);
  }
  bag.sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i < bag.length; i += 1) {
    if (i > 0 && Math.abs(bag[i] - bag[i - 1]) < 1e-4) continue;
    out.push(bag[i]);
  }
  return out;
}

function collectKeysAtTimeForTracks(anim, t, trackIds) {
  const out = [];
  if (!anim || !Array.isArray(trackIds) || trackIds.length <= 0) return out;
  for (const trackId of trackIds) {
    const keys = getTrackKeys(anim, trackId);
    for (const k of keys) {
      if (Math.abs((Number(k.time) || 0) - t) < 1e-4) out.push({ trackId, keyId: k.id });
    }
  }
  return out;
}

function clearTimelineKeySelection() {
  state.anim.selectedKeys = [];
  state.anim.selectedKey = null;
}

function getActiveTimelineKeySelection(anim = null) {
  const currentAnim = anim || getCurrentAnimation();
  if (!currentAnim) return [];
  normalizeSelectedKeys(currentAnim);
  const selected = Array.isArray(state.anim.selectedKeys) ? state.anim.selectedKeys.filter(Boolean) : [];
  if (selected.length > 0) return selected.map((s) => ({ trackId: s.trackId, keyId: s.keyId }));
  const sk = state.anim.selectedKey;
  if (!sk || !sk.trackId || !sk.keyId) return [];
  const keys = getTrackKeys(currentAnim, sk.trackId);
  if (!keys.some((k) => k.id === sk.keyId)) return [];
  return [{ trackId: sk.trackId, keyId: sk.keyId }];
}

function getTimelineClipboardItems(selection = null, anim = null) {
  const currentAnim = anim || getCurrentAnimation();
  const selected = Array.isArray(selection) ? selection : getActiveTimelineKeySelection(currentAnim);
  if (!currentAnim || selected.length <= 0) return [];
  const out = [];
  const seen = new Set();
  for (const s of selected) {
    if (!s || !s.trackId || !s.keyId) continue;
    const key = `${s.trackId}::${s.keyId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const item = getTrackKeys(currentAnim, s.trackId).find((k) => k.id === s.keyId);
    if (!item) continue;
    out.push({
      trackId: s.trackId,
      keyId: s.keyId,
      time: Number(item.time) || 0,
      value: cloneTrackValue(item.value),
      interp: item.interp || "linear",
      curve: Array.isArray(item.curve) && item.curve.length >= 4 ? item.curve.slice(0, 4) : null,
      slotIndex: Number.isFinite(item.slotIndex) ? Number(item.slotIndex) : null,
    });
  }
  out.sort((a, b) => {
    const dt = (Number(a.time) || 0) - (Number(b.time) || 0);
    if (Math.abs(dt) > 1e-6) return dt;
    return String(a.trackId || "").localeCompare(String(b.trackId || ""));
  });
  return out;
}

function buildTimelineClipboardPayload(items, anchorSelection = null) {
  if (!Array.isArray(items) || items.length <= 0) return null;
  const anchorKey =
    anchorSelection && anchorSelection.trackId && anchorSelection.keyId
      ? `${anchorSelection.trackId}::${anchorSelection.keyId}`
      : "";
  const anchorItem = items.find((it) => `${it.trackId}::${it.keyId}` === anchorKey) || items[0];
  const anchorTime = Number(anchorItem && anchorItem.time);
  return {
    type: "timeline_keys",
    sourceTrackId: String(anchorItem && anchorItem.trackId ? anchorItem.trackId : items[0].trackId || ""),
    anchorTime: Number.isFinite(anchorTime) ? anchorTime : Number(items[0].time) || 0,
    items: items.map((it) => ({
      trackId: String(it.trackId || ""),
      relTime: (Number(it.time) || 0) - (Number.isFinite(anchorTime) ? anchorTime : Number(items[0].time) || 0),
      value: cloneTrackValue(it.value),
      interp: it.interp || "linear",
      curve: Array.isArray(it.curve) && it.curve.length >= 4 ? it.curve.slice(0, 4) : null,
      slotIndex: Number.isFinite(it.slotIndex) ? Number(it.slotIndex) : null,
    })),
  };
}

function hasTimelineClipboardData() {
  const clip = state.anim.keyClipboard;
  return !!(
    clip &&
    Array.isArray(clip.items) &&
    clip.items.length > 0 &&
    (clip.type === "timeline_keys" || clip.value != null)
  );
}

function resolveTimelineClipboardItems() {
  const clip = state.anim.keyClipboard;
  if (!clip) return [];
  if (Array.isArray(clip.items) && clip.items.length > 0) {
    return clip.items.map((it) => ({
      trackId: String(it.trackId || clip.sourceTrackId || ""),
      relTime: Number(it.relTime) || 0,
      value: cloneTrackValue(it.value),
      interp: it.interp || "linear",
      curve: Array.isArray(it.curve) && it.curve.length >= 4 ? it.curve.slice(0, 4) : null,
      slotIndex: Number.isFinite(it.slotIndex) ? Number(it.slotIndex) : null,
    }));
  }
  return [
    {
      trackId: String(clip.trackId || clip.sourceTrackId || ""),
      relTime: 0,
      value: cloneTrackValue(clip.value),
      interp: clip.interp || "linear",
      curve: Array.isArray(clip.curve) && clip.curve.length >= 4 ? clip.curve.slice(0, 4) : null,
      slotIndex: Number.isFinite(clip.slotIndex) ? Number(clip.slotIndex) : null,
    },
  ];
}

function removeTimelineKeysBySelection(selection, options = {}) {
  const anim = getCurrentAnimation();
  const picked = Array.isArray(selection) ? selection.filter(Boolean) : getActiveTimelineKeySelection(anim);
  if (!anim || picked.length <= 0) {
    if (!options.silent) setStatus("No selected key.");
    return 0;
  }
  const keySet = new Set(picked.map((s) => `${s.trackId}::${s.keyId}`));
  let removed = 0;
  for (const trackId of Object.keys(anim.tracks || {})) {
    const list = getTrackKeys(anim, trackId);
    const next = list.filter((k) => {
      const keep = !keySet.has(`${trackId}::${k.id}`);
      if (!keep) removed += 1;
      return keep;
    });
    anim.tracks[trackId] = next;
  }
  if (removed > 0) {
    clearTimelineKeySelection();
    renderTimelineTracks();
  } else if (!options.silent) {
    setStatus("No key removed.");
  }
  return removed;
}

function isTimelineEditingActive() {
  const systemMode = els.systemMode ? String(els.systemMode.value || "").toLowerCase() : "";
  return systemMode === "animate" && state.uiPage === "anim" && state.animSubPanel === "timeline";
}

function keySelectionHas(trackId, keyId) {
  return state.anim.selectedKeys.some((s) => s && s.trackId === trackId && s.keyId === keyId);
}

function normalizeSelectedKeys(anim) {
  const out = [];
  for (const s of state.anim.selectedKeys || []) {
    if (!s || !s.trackId || !s.keyId) continue;
    const keys = getTrackKeys(anim, s.trackId);
    if (keys.some((k) => k.id === s.keyId)) out.push({ trackId: s.trackId, keyId: s.keyId });
  }
  state.anim.selectedKeys = out;
  if (state.anim.selectedKey && !keySelectionHas(state.anim.selectedKey.trackId, state.anim.selectedKey.keyId)) {
    state.anim.selectedKey = out.length > 0 ? { ...out[0] } : null;
  }
}

function setSingleTimelineSelection(trackId, keyId) {
  state.anim.selectedKeys = [{ trackId, keyId }];
  state.anim.selectedKey = { trackId, keyId };
}

function getBoneJointSelectionParts(boneIndex) {
  return [
    { index: boneIndex, type: "head" },
    { index: boneIndex, type: "tail" },
  ];
}

function hasBonePartSelection(boneIndex, partType) {
  return !!(state.selectedBoneParts || []).some((p) => p.index === boneIndex && p.type === partType);
}

function hasBoneJointSelection(boneIndex) {
  return hasBonePartSelection(boneIndex, "head") && hasBonePartSelection(boneIndex, "tail");
}

function focusTimelineTrack(trackId, preferNearestKey = true) {
  const anim = getCurrentAnimation();
  if (!anim || !trackId) return;
  setSelectedTimelineTrack(trackId);
  if (!preferNearestKey) {
    clearTimelineKeySelection();
    renderTimelineTracks();
    return;
  }
  const keys = getTrackKeys(anim, trackId).slice().sort((a, b) => (Number(a.time) || 0) - (Number(b.time) || 0));
  if (keys.length <= 0) {
    clearTimelineKeySelection();
    renderTimelineTracks();
    return;
  }
  const t = Number(state.anim.time) || 0;
  let best = keys[0];
  let bestDist = Math.abs((Number(best.time) || 0) - t);
  for (let i = 1; i < keys.length; i += 1) {
    const d = Math.abs((Number(keys[i].time) || 0) - t);
    if (d < bestDist) {
      best = keys[i];
      bestDist = d;
    }
  }
  setSingleTimelineSelection(trackId, best.id);
  renderTimelineTracks();
}

function syncLayerPanelFromSelectedTrack() {
  const parsed = parseTrackId(state.anim.selectedTrack);
  if (!parsed || parsed.type !== "layer") return;
  state.anim.selectedLayerTrackId = parsed.layerId;
  refreshAnimationLayerUI();
}

function toggleTimelineSelection(trackId, keyId) {
  if (keySelectionHas(trackId, keyId)) {
    state.anim.selectedKeys = state.anim.selectedKeys.filter((s) => !(s.trackId === trackId && s.keyId === keyId));
    if (state.anim.selectedKey && state.anim.selectedKey.trackId === trackId && state.anim.selectedKey.keyId === keyId) {
      state.anim.selectedKey = state.anim.selectedKeys.length > 0 ? { ...state.anim.selectedKeys[0] } : null;
    }
    return;
  }
  state.anim.selectedKeys.push({ trackId, keyId });
  state.anim.selectedKey = { trackId, keyId };
}

function getDragSeedFromSelection(anim, selected) {
  const seed = [];
  for (const s of selected) {
    const keys = getTrackKeys(anim, s.trackId);
    const k = keys.find((it) => it.id === s.keyId);
    if (!k) continue;
    seed.push({ trackId: s.trackId, keyId: s.keyId, time: Number(k.time) || 0 });
  }
  return seed;
}

function getTimelineScaleSpanFromSeed(seed, anchorTime, timelineDuration) {
  let span = 0;
  for (const it of seed || []) {
    span = Math.max(span, Math.abs((Number(it.time) || 0) - (Number(anchorTime) || 0)));
  }
  if (span < 1e-4) {
    span = Math.max(0.05, Math.min(Math.max(0.1, Number(timelineDuration) || 5) * 0.2, 2.0));
  }
  return span;
}

function pickSelectionAnchorNearTime(anim, selection, t, prefer = null) {
  if (!anim || !Array.isArray(selection) || selection.length <= 0) return null;
  const target = Number(t) || 0;
  let best = null;
  let bestDist = Infinity;
  const preferKey = prefer && prefer.trackId && prefer.keyId ? `${prefer.trackId}::${prefer.keyId}` : "";
  for (const s of selection) {
    if (!s || !s.trackId || !s.keyId) continue;
    const keyObj = getTrackKeys(anim, s.trackId).find((kk) => kk.id === s.keyId);
    if (!keyObj) continue;
    const dist = Math.abs((Number(keyObj.time) || 0) - target);
    const sk = `${s.trackId}::${s.keyId}`;
    if (dist < bestDist - 1e-6) {
      best = { trackId: s.trackId, keyId: s.keyId };
      bestDist = dist;
      continue;
    }
    if (Math.abs(dist - bestDist) < 1e-6 && preferKey && sk === preferKey) {
      best = { trackId: s.trackId, keyId: s.keyId };
    }
  }
  return best;
}

function collectKeysAtTime(anim, t) {
  const out = [];
  for (const trackId of Object.keys(anim.tracks || {})) {
    if (!parseTrackId(trackId)) continue;
    const keys = getTrackKeys(anim, trackId);
    for (const k of keys) {
      if (Math.abs((Number(k.time) || 0) - t) < 1e-4) out.push({ trackId, keyId: k.id });
    }
  }
  return out;
}

function collectSummaryKeyTargets(anim, scope, time, groupKey = "") {
  if (!anim || !Number.isFinite(time)) return [];
  if (scope === "all") return collectKeysAtTime(anim, time);
  if (scope !== "group") return [];
  const groups = getTimelineGroupsForView(anim);
  const g = groups.find((it) => String(it.groupKey ?? "") === String(groupKey));
  if (!g || !Array.isArray(g.children) || g.children.length <= 0) return [];
  const trackIds = g.children.map((c) => c.id).filter(Boolean);
  return collectKeysAtTimeForTracks(anim, time, trackIds);
}

function applyTimelineSelectionClasses() {
  const anim = getCurrentAnimation();
  const selected = new Set((state.anim.selectedKeys || []).map((s) => `${s.trackId}::${s.keyId}`));
  const nodes = els.timelineTracks.querySelectorAll(".track-key");
  for (const el of nodes) {
    const trackId = String(el.dataset.trackId || "");
    const keyId = String(el.dataset.keyId || "");
    if (trackId && keyId) {
      const key = `${trackId}::${keyId}`;
      el.classList.toggle("selected", selected.has(key));
      continue;
    }
    const scope = String(el.dataset.summaryScope || "");
    const time = Number(el.dataset.summaryTime);
    const groupKey = String(el.dataset.summaryGroupKey || "");
    const targets = collectSummaryKeyTargets(anim, scope, time, groupKey);
    const allSelected = targets.length > 0 && targets.every((s) => selected.has(`${s.trackId}::${s.keyId}`));
    el.classList.toggle("selected", allSelected);
  }
}

function buildTimelineTickMarks(timelineRange) {
  const tickStep = getTimelineRulerTickStep(timelineRange);
  const tickStart = Math.ceil(timelineRange.start / tickStep) * tickStep;
  const tickCount = Math.floor((timelineRange.end - tickStart) / tickStep) + 1;
  const majorEvery = tickStep >= 0.5 ? 1 : 5;
  const labelEvery = tickStep >= 0.5 ? 1 : 5;
  const out = [];
  if (tickCount > 600) return out;
  for (let i = 0; i <= tickCount; i += 1) {
    const tt = tickStart + i * tickStep;
    if (tt > timelineRange.end + 1e-6) break;
    out.push({
      time: tt,
      left: timelineXForTime(tt, 100, timelineRange),
      major: i % majorEvery === 0,
      label: i % labelEvery === 0,
    });
  }
  return out;
}

function buildTimelineMinorRulerTicks(timelineRange) {
  const minorStep = 0.1;
  const majorStep = getTimelineRulerTickStep(timelineRange);
  if (majorStep <= minorStep + 1e-6) return [];
  const span = Math.max(0.1, Number(timelineRange.end) - Number(timelineRange.start));
  const tickCount = Math.floor(span / minorStep) + 2;
  if (tickCount > 400) return [];
  const tickStart = Math.ceil(timelineRange.start / minorStep) * minorStep;
  const out = [];
  for (let i = 0; i <= tickCount; i += 1) {
    const tt = tickStart + i * minorStep;
    if (tt > timelineRange.end + 1e-6) break;
    const snappedMajor = Math.round(tt / majorStep) * majorStep;
    if (Math.abs(tt - snappedMajor) < 1e-4) continue;
    out.push({
      time: tt,
      left: timelineXForTime(tt, 100, timelineRange),
    });
  }
  return out;
}

function appendTimelineGridToLane(lane, ticks, options = {}) {
  const opts = options && typeof options === "object" ? options : {};
  for (const tick of ticks || []) {
    const line = document.createElement("div");
    line.className = `timeline-tick timeline-grid-line${tick.major ? " major" : ""}`;
    line.style.left = `${tick.left.toFixed(4)}%`;
    lane.appendChild(line);
    if (!opts.labels || !tick.label) continue;
    const label = document.createElement("div");
    label.className = `timeline-tick-label${tick.major ? " major" : ""}`;
    label.style.left = `${tick.left.toFixed(4)}%`;
    label.textContent = formatTimelineTimeLabel(tick.time);
    lane.appendChild(label);
  }
}

// ============================================================
