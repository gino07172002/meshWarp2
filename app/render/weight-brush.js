// ROLE: Weight Paint Brush — paint per-vertex bone weights by dragging
// on canvas. 4 modes (add / remove / replace / smooth), bone-lock so
// locked bones aren't touched, neighbor-graph cache for smooth mode.
// Active when state.weightBrush.active is true and editMode === "mesh".
// EXPORTS:
//   - isWeightBrushActive, getWeightBrushScreenForActive,
//     applyWeightBrushStrokeAt, drawWeightBrushCursor
//   - setWeightBrushActive, setWeightBrushMode, toggleBrushBoneLock
//   - getLockedBoneSet, isBoneLockedForBrush
//   - renormalizeVertexRowWithLocks
// CONSUMERS: hotkeys.js (W toggle, pointer intercept), bootstrap.js
//   (UI wiring), drawOverlay (cursor preview).

function isWeightBrushActive() {
  return !!(state && state.weightBrush && state.weightBrush.active && state.editMode === "mesh");
}

function getWeightBrushScreenForActive() {
  const m = state.mesh;
  if (!m) return null;
  if (state.slots.length > 0) {
    const slot = getActiveSlot();
    if (!slot) return null;
    const att = getActiveAttachment(slot);
    if (!att || !att.meshData) return null;
    const poseWorld = getSolvedPoseWorld(m);
    const geom = buildSlotGeometry(slot, poseWorld);
    return {
      meshData: att.meshData,
      screen: geom && geom.screen ? geom.screen : att.meshData.deformedScreen || m.deformedScreen,
    };
  }
  return { meshData: m, screen: m.deformedScreen || null };
}

function weightBrushFalloff(t, feather) {
  // t in [0,1], feather in [0,1]; t=0 center → 1, t=1 edge → 0
  if (t >= 1) return 0;
  if (t <= 0) return 1;
  const f = Math.max(0, Math.min(1, Number(feather) || 0));
  // Hard core (radius * (1-f)) at full strength, then smooth fade to 0
  const core = 1 - f;
  if (t <= core) return 1;
  if (f <= 0) return 0;
  const u = (t - core) / f; // 0..1 across the feathered ring
  // smoothstep
  return 1 - u * u * (3 - 2 * u);
}

function normalizeWeightBrushMode(mode) {
  if (mode === "remove" || mode === "replace" || mode === "smooth") return mode;
  return "add";
}

function getLockedBoneSet() {
  const raw = state.weightBrush && state.weightBrush.lockedBones;
  if (!raw) return null;
  if (raw instanceof Set) return raw;
  if (Array.isArray(raw)) return new Set(raw.map((v) => Number(v)).filter((n) => Number.isFinite(n) && n >= 0));
  return null;
}

function isBoneLockedForBrush(boneIndex) {
  const set = getLockedBoneSet();
  return !!(set && set.has(Number(boneIndex)));
}

// Renormalise a vertex weight row so weights[base..base+boneCount] sums to 1.
// Locked bones keep their weight; the remaining weight (1 - sumLocked) is split
// among unlocked bones in proportion to their existing values.
function renormalizeVertexRowWithLocks(weights, base, boneCount, lockedSet, fallbackBone) {
  let lockedSum = 0;
  let unlockedSum = 0;
  for (let b = 0; b < boneCount; b += 1) {
    const w = Number(weights[base + b]) || 0;
    if (lockedSet && lockedSet.has(b)) lockedSum += w;
    else unlockedSum += w;
  }
  if (lockedSum >= 1) {
    // Locked bones already saturate the row; clamp them and zero unlocked.
    if (lockedSum > 1) {
      const scale = 1 / lockedSum;
      for (let b = 0; b < boneCount; b += 1) {
        if (lockedSet && lockedSet.has(b)) weights[base + b] = (Number(weights[base + b]) || 0) * scale;
        else weights[base + b] = 0;
      }
    } else {
      for (let b = 0; b < boneCount; b += 1) {
        if (!lockedSet || !lockedSet.has(b)) weights[base + b] = 0;
      }
    }
    return;
  }
  const remaining = 1 - lockedSum;
  if (unlockedSum <= 1e-6) {
    // No unlocked weight to redistribute. Drop into fallback bone if it's unlocked.
    const fb = Number(fallbackBone);
    if (Number.isFinite(fb) && fb >= 0 && fb < boneCount && !(lockedSet && lockedSet.has(fb))) {
      weights[base + fb] = remaining;
    } else {
      // Pick first unlocked bone.
      for (let b = 0; b < boneCount; b += 1) {
        if (!lockedSet || !lockedSet.has(b)) {
          weights[base + b] = remaining;
          break;
        }
      }
    }
    return;
  }
  const scale = remaining / unlockedSum;
  for (let b = 0; b < boneCount; b += 1) {
    if (lockedSet && lockedSet.has(b)) continue;
    weights[base + b] = (Number(weights[base + b]) || 0) * scale;
  }
}

// Build a per-vertex neighbour list from triangle indices. Cached on meshData.
function getMeshVertexNeighbours(meshData, vCount) {
  if (!meshData) return null;
  const indices = meshData.indices;
  if (!indices || indices.length < 3) return null;
  if (
    meshData.__brushNeighbours
    && meshData.__brushNeighboursVCount === vCount
    && meshData.__brushNeighboursLen === indices.length
    && meshData.__brushNeighboursIndicesRef === indices
  ) {
    return meshData.__brushNeighbours;
  }
  const neighbours = new Array(vCount);
  for (let i = 0; i < vCount; i += 1) neighbours[i] = new Set();
  for (let t = 0; t + 2 < indices.length; t += 3) {
    const a = Number(indices[t]);
    const b = Number(indices[t + 1]);
    const c = Number(indices[t + 2]);
    if (a < 0 || b < 0 || c < 0 || a >= vCount || b >= vCount || c >= vCount) continue;
    neighbours[a].add(b); neighbours[a].add(c);
    neighbours[b].add(a); neighbours[b].add(c);
    neighbours[c].add(a); neighbours[c].add(b);
  }
  const arrays = neighbours.map((s) => Array.from(s));
  meshData.__brushNeighbours = arrays;
  meshData.__brushNeighboursVCount = vCount;
  meshData.__brushNeighboursLen = indices.length;
  meshData.__brushNeighboursIndicesRef = indices;
  return arrays;
}

function applyWeightBrushStrokeAt(mx, my, dtFactor = 1) {
  if (!isWeightBrushActive()) return false;
  const m = state.mesh;
  if (!m) return false;
  const ctx = getWeightBrushScreenForActive();
  if (!ctx || !ctx.meshData || !ctx.screen) return false;
  const meshData = ctx.meshData;
  const weights = meshData.weights;
  const boneCount = Array.isArray(m.rigBones) ? m.rigBones.length : 0;
  if (!weights || weights.length === 0 || boneCount <= 0) return false;
  const screen = ctx.screen;
  const vCount = Math.floor(screen.length / 2);
  if (vCount <= 0 || weights.length !== vCount * boneCount) return false;
  const brush = state.weightBrush;
  const mode = normalizeWeightBrushMode(brush.mode);
  const targetBone = getPrimarySelectedBoneIndex();
  // Smooth doesn't need a target bone; the others do.
  if (mode !== "smooth") {
    if (!Number.isFinite(targetBone) || targetBone < 0 || targetBone >= boneCount) return false;
  }
  const radius = Math.max(2, Number(brush.size) || 80);
  const r2 = radius * radius;
  const feather = Math.max(0, Math.min(1, Number(brush.feather) || 0));
  const baseStrength = Math.max(0, Math.min(1, Number(brush.strength) || 0));
  const stepStrength = baseStrength * Math.max(0.01, Math.min(2, Number(dtFactor) || 1)) * 0.25;
  const lockedSet = getLockedBoneSet();
  // Block target bone == locked combination for add/remove/replace.
  if (mode !== "smooth" && lockedSet && lockedSet.has(targetBone)) {
    if (typeof setStatus === "function") setStatus("Weight brush: target bone is locked.");
    return false;
  }

  let touched = 0;

  if (mode === "smooth") {
    const neighbours = getMeshVertexNeighbours(meshData, vCount);
    if (!neighbours) return false;
    // Snapshot current weights so all vertices are smoothed against the same source.
    const snapshot = new Float32Array(weights);
    for (let v = 0; v < vCount; v += 1) {
      const sx = Number(screen[v * 2]);
      const sy = Number(screen[v * 2 + 1]);
      if (!Number.isFinite(sx) || !Number.isFinite(sy)) continue;
      const dx = sx - mx;
      const dy = sy - my;
      const d2 = dx * dx + dy * dy;
      if (d2 > r2) continue;
      const t = Math.sqrt(d2) / radius;
      const f = weightBrushFalloff(t, feather);
      if (f <= 0) continue;
      const alpha = stepStrength * f;
      if (alpha <= 0) continue;
      const nbrs = neighbours[v];
      if (!nbrs || nbrs.length === 0) continue;
      const base = v * boneCount;
      const cnt = nbrs.length;
      for (let b = 0; b < boneCount; b += 1) {
        if (lockedSet && lockedSet.has(b)) continue;
        let sum = 0;
        for (let k = 0; k < cnt; k += 1) sum += Number(snapshot[nbrs[k] * boneCount + b]) || 0;
        const avg = sum / cnt;
        const old = Number(weights[base + b]) || 0;
        weights[base + b] = old * (1 - alpha) + avg * alpha;
      }
      renormalizeVertexRowWithLocks(weights, base, boneCount, lockedSet, -1);
      touched += 1;
    }
    return touched > 0;
  }

  for (let v = 0; v < vCount; v += 1) {
    const sx = Number(screen[v * 2]);
    const sy = Number(screen[v * 2 + 1]);
    if (!Number.isFinite(sx) || !Number.isFinite(sy)) continue;
    const dx = sx - mx;
    const dy = sy - my;
    const d2 = dx * dx + dy * dy;
    if (d2 > r2) continue;
    const t = Math.sqrt(d2) / radius;
    const f = weightBrushFalloff(t, feather);
    if (f <= 0) continue;
    const delta = stepStrength * f;
    const base = v * boneCount;
    const oldW = Number(weights[base + targetBone]) || 0;
    let newW;
    if (mode === "remove") newW = Math.max(0, oldW - delta);
    else if (mode === "replace") newW = oldW + (1 - oldW) * Math.min(1, delta * 4);
    else newW = Math.min(1, oldW + delta); // add
    if (newW === oldW) continue;
    weights[base + targetBone] = newW;
    renormalizeVertexRowWithLocks(weights, base, boneCount, lockedSet, targetBone);
    touched += 1;
  }
  return touched > 0;
}

function drawWeightBrushCursor(ctx) {
  if (!isWeightBrushActive()) return;
  if (!state.vertexDeform || !state.vertexDeform.hasCursor) return;
  const radius = Math.max(2, Number(state.weightBrush.size) || 80);
  const feather = Math.max(0, Math.min(1, Number(state.weightBrush.feather) || 0));
  const cx = state.vertexDeform.cursorX;
  const cy = state.vertexDeform.cursorY;
  const mode = normalizeWeightBrushMode(state.weightBrush.mode);
  // Color per mode: green=add, red=remove, cyan=replace, purple=smooth
  let stroke, mark;
  if (mode === "remove") { stroke = "rgba(255, 130, 130, 0.95)"; mark = "rgba(255, 200, 200, 0.9)"; }
  else if (mode === "replace") { stroke = "rgba(120, 200, 255, 0.95)"; mark = "rgba(180, 220, 255, 0.9)"; }
  else if (mode === "smooth") { stroke = "rgba(200, 150, 240, 0.95)"; mark = "rgba(220, 190, 250, 0.9)"; }
  else { stroke = "rgba(120, 230, 170, 0.95)"; mark = "rgba(180, 255, 210, 0.9)"; }
  ctx.save();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = stroke;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
  if (feather > 0 && feather < 1) {
    const inner = radius * (1 - feather);
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = stroke.replace(/0\.95\)/, "0.4)");
    ctx.beginPath();
    ctx.arc(cx, cy, inner, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  // Mode glyph at center
  ctx.strokeStyle = mark;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  if (mode === "add") {
    ctx.moveTo(cx - 6, cy); ctx.lineTo(cx + 6, cy);
    ctx.moveTo(cx, cy - 6); ctx.lineTo(cx, cy + 6);
  } else if (mode === "remove") {
    ctx.moveTo(cx - 6, cy); ctx.lineTo(cx + 6, cy);
  } else if (mode === "replace") {
    ctx.moveTo(cx - 5, cy); ctx.lineTo(cx + 5, cy);
    ctx.moveTo(cx + 1, cy - 4); ctx.lineTo(cx + 5, cy);
    ctx.lineTo(cx + 1, cy + 4);
  } else if (mode === "smooth") {
    // wavy ~
    ctx.moveTo(cx - 6, cy);
    ctx.quadraticCurveTo(cx - 3, cy - 3, cx, cy);
    ctx.quadraticCurveTo(cx + 3, cy + 3, cx + 6, cy);
  }
  ctx.stroke();
  ctx.restore();
}

function setWeightBrushActive(on, opts = {}) {
  const next = !!on;
  const wasActive = !!state.weightBrush.active;
  state.weightBrush.active = next;
  if (document && document.body) {
    document.body.dataset.weightBrush = next ? "on" : "off";
  }
  // Symmetric overlay handling: when the brush turns on we auto-enable the
  // weight overlay (so you can see what you're painting), and remember that
  // we did. When the brush turns off we only auto-disable the overlay if we
  // were the ones who turned it on — leaving an overlay the user manually
  // enabled before brushing untouched.
  if (state.vertexDeform) {
    if (next && !wasActive) {
      if (!state.vertexDeform.weightViz) {
        state.vertexDeform.weightViz = true;
        state.weightBrush.__autoEnabledOverlay = true;
      } else {
        state.weightBrush.__autoEnabledOverlay = false;
      }
      if (typeof refreshVertexDeformUI === "function") refreshVertexDeformUI();
    } else if (!next && wasActive && state.weightBrush.__autoEnabledOverlay) {
      state.vertexDeform.weightViz = false;
      state.weightBrush.__autoEnabledOverlay = false;
      if (typeof weightHeatmapGPU !== "undefined" && weightHeatmapGPU && typeof weightHeatmapGPU.clear === "function") {
        weightHeatmapGPU.clear();
      }
      if (typeof refreshVertexDeformUI === "function") refreshVertexDeformUI();
    }
  }
  if (typeof refreshWeightBrushUI === "function") refreshWeightBrushUI();
  if (typeof renderBoneTree === "function") renderBoneTree();
  if (typeof requestRender === "function") requestRender("weight-brush-toggle");
  if (!opts.silent && typeof setStatus === "function") {
    const modeLabel = normalizeWeightBrushMode(state.weightBrush.mode);
    setStatus(next
      ? `Weight brush: ${modeLabel} — overlay on (W to toggle).`
      : "Weight brush off.");
  }
}

function setWeightBrushMode(mode) {
  state.weightBrush.mode = normalizeWeightBrushMode(mode);
  if (typeof refreshWeightBrushUI === "function") refreshWeightBrushUI();
  if (typeof requestRender === "function") requestRender("weight-brush-mode");
}

function refreshWeightBrushUI() {
  const brush = state.weightBrush;
  const mode = normalizeWeightBrushMode(brush.mode);
  if (els.weightBrushToggle) els.weightBrushToggle.checked = !!brush.active;
  if (els.weightBrushAddBtn) els.weightBrushAddBtn.classList.toggle("active", mode === "add");
  if (els.weightBrushRemoveBtn) els.weightBrushRemoveBtn.classList.toggle("active", mode === "remove");
  if (els.weightBrushReplaceBtn) els.weightBrushReplaceBtn.classList.toggle("active", mode === "replace");
  if (els.weightBrushSmoothBtn) els.weightBrushSmoothBtn.classList.toggle("active", mode === "smooth");
  if (els.weightBrushSize) els.weightBrushSize.value = String(Math.round(Number(brush.size) || 80));
  if (els.weightBrushStrength) els.weightBrushStrength.value = String(Number(brush.strength).toFixed(2));
  if (els.weightBrushFeather) els.weightBrushFeather.value = String(Number(brush.feather).toFixed(2));
}

function toggleBrushBoneLock(boneIndex) {
  const idx = Number(boneIndex);
  if (!Number.isFinite(idx) || idx < 0) return false;
  if (!Array.isArray(state.weightBrush.lockedBones)) state.weightBrush.lockedBones = [];
  const arr = state.weightBrush.lockedBones;
  const pos = arr.indexOf(idx);
  if (pos >= 0) arr.splice(pos, 1);
  else arr.push(idx);
  if (typeof renderBoneTree === "function") renderBoneTree();
  return pos < 0; // returns true if now locked
}
