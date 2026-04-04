// Split from app.js
// Part: Constraint model normalization and execution-plan helpers
// Original source: app/02-workspace-slot-mesh.js (segment 3)
function ensureIKConstraints(m) {
  if (!m) return [];
  if (!Array.isArray(m.ikConstraints)) m.ikConstraints = [];
  const count = Array.isArray(m.rigBones) ? m.rigBones.length : 0;
  m.ikConstraints = m.ikConstraints
    .map((c, i) => {
      const bones = Array.isArray(c && c.bones) ? c.bones.map((v) => Number(v)).filter((v) => Number.isFinite(v)) : [];
      const target = Number(c && c.target);
      const targetX = Number(c && c.targetX);
      const targetY = Number(c && c.targetY);
      const name = c && c.name ? String(c.name) : `ik_${i}`;
      return {
        name,
        bones: bones.slice(0, 2),
        target: Number.isFinite(target) && target >= 0 && target < count ? target : -1,
        targetX: Number.isFinite(targetX) ? targetX : null, // legacy project compatibility
        targetY: Number.isFinite(targetY) ? targetY : null, // legacy project compatibility
        mix: math.clamp(Number(c && c.mix) || 1, 0, 1),
        softness: Math.max(0, Number(c && c.softness) || 0),
        bendPositive: c && c.bendPositive !== false,
        compress: !!(c && c.compress),
        stretch: !!(c && c.stretch),
        uniform: !!(c && c.uniform),
        order: getConstraintOrder(c, i),
        skinRequired: !!(c && c.skinRequired),
        enabled: c ? c.enabled !== false : true,
        endMode: c && c.endMode === "tail" ? "tail" : "head",
      };
    })
    .filter((c) => c.bones.length >= 1 && c.bones.every((b) => b >= 0 && b < count));
  if (!Number.isFinite(state.selectedIK) || state.selectedIK < 0 || state.selectedIK >= m.ikConstraints.length) {
    state.selectedIK = m.ikConstraints.length > 0 ? 0 : -1;
  }
  return m.ikConstraints;
}

function ensureTransformConstraints(m) {
  if (!m) return [];
  if (!Array.isArray(m.transformConstraints)) m.transformConstraints = [];
  const count = Array.isArray(m.rigBones) ? m.rigBones.length : 0;
  m.transformConstraints = m.transformConstraints
    .map((c, i) => {
      const bones = Array.isArray(c && c.bones) ? c.bones.map((v) => Number(v)).filter((v) => Number.isFinite(v)) : [];
      const target = Number(c && c.target);
      return {
        name: c && c.name ? String(c.name) : `transform_${i}`,
        bones: [...new Set(bones)].filter((b) => b >= 0 && b < count),
        target: Number.isFinite(target) && target >= 0 && target < count ? target : -1,
        rotateMix: math.clamp(Number(c && c.rotateMix) || 0, 0, 1),
        translateMix: math.clamp(Number(c && c.translateMix) || 0, 0, 1),
        scaleMix: math.clamp(Number(c && c.scaleMix) || 0, 0, 1),
        shearMix: math.clamp(Number(c && c.shearMix) || 0, 0, 1),
        offsetX: Number(c && c.offsetX) || 0,
        offsetY: Number(c && c.offsetY) || 0,
        offsetRot: Number(c && c.offsetRot) || 0,
        offsetScaleX: Number(c && c.offsetScaleX) || 0,
        offsetScaleY: Number(c && c.offsetScaleY) || 0,
        offsetShearY: Number(c && c.offsetShearY) || 0,
        local: !!(c && c.local),
        relative: !!(c && c.relative),
        order: getConstraintOrder(c, i),
        skinRequired: !!(c && c.skinRequired),
        enabled: c ? c.enabled !== false : true,
      };
    })
    .filter((c) => c.bones.length > 0 && c.target >= 0);
  if (
    !Number.isFinite(state.selectedTransform) ||
    state.selectedTransform < 0 ||
    state.selectedTransform >= m.transformConstraints.length
  ) {
    state.selectedTransform = m.transformConstraints.length > 0 ? 0 : -1;
  }
  return m.transformConstraints;
}

function getActiveTransformConstraint() {
  const m = state.mesh;
  if (!m) return null;
  const list = ensureTransformConstraints(m);
  sortConstraintListByOrder(list);
  if (state.selectedTransform < 0 || state.selectedTransform >= list.length) return null;
  return list[state.selectedTransform];
}

function getTransformConstrainedBoneSet(m) {
  const out = new Set();
  if (!m) return out;
  for (const c of ensureTransformConstraints(m)) {
    if (!c || c.enabled === false) continue;
    for (const bi of c.bones || []) out.add(bi);
  }
  return out;
}

function getTransformTargetBoneSet(m) {
  const out = new Set();
  if (!m) return out;
  for (const c of ensureTransformConstraints(m)) {
    if (!c || c.enabled === false) continue;
    const t = Number(c.target);
    if (Number.isFinite(t) && t >= 0) out.add(t);
  }
  return out;
}

function ensurePathConstraints(m) {
  if (!m) return [];
  if (!Array.isArray(m.pathConstraints)) m.pathConstraints = [];
  const count = Array.isArray(m.rigBones) ? m.rigBones.length : 0;
  m.pathConstraints = m.pathConstraints
    .map((c, i) => {
      const bones = Array.isArray(c && c.bones) ? c.bones.map((v) => Number(v)).filter((v) => Number.isFinite(v)) : [];
      const target = Number(c && c.target);
      return {
        name: c && c.name ? String(c.name) : `path_${i}`,
        bones: [...new Set(bones)].filter((b) => b >= 0 && b < count),
        target: Number.isFinite(target) && target >= 0 && target < count ? target : -1,
        sourceType:
          c && c.sourceType === "bone_chain"
            ? "bone_chain"
            : c && c.sourceType === "slot"
              ? "slot"
              : "drawn",
        targetSlot: Number.isFinite(Number(c && c.targetSlot)) ? Number(c.targetSlot) : -1,
        points: Array.isArray(c && c.points)
          ? c.points.map((p) => normalizePathNode(p)).filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y))
          : [],
        positionMode: c && c.positionMode === "percent" ? "percent" : "fixed",
        spacingMode:
          c && c.spacingMode === "fixed"
            ? "fixed"
            : c && c.spacingMode === "percent"
              ? "percent"
              : c && c.spacingMode === "proportional"
                ? "proportional"
                : "length",
        rotateMode: c && c.rotateMode === "chain" ? "chain" : c && c.rotateMode === "chainScale" ? "chainScale" : "tangent",
        position: Number(c && c.position) || 0,
        spacing: Number(c && c.spacing) || 40,
        rotateMix: math.clamp(Number(c && c.rotateMix) || 0, 0, 1),
        translateMix: math.clamp(Number(c && c.translateMix) || 0, 0, 1),
        skinRequired: !!(c && c.skinRequired),
        closed: !!(c && c.closed),
        order: getConstraintOrder(c, i),
        enabled: c ? c.enabled !== false : true,
      };
    })
    .filter((c) => c.bones.length > 0 && (c.sourceType !== "bone_chain" || c.target >= 0));
  if (!Number.isFinite(state.selectedPath) || state.selectedPath < 0 || state.selectedPath >= m.pathConstraints.length) {
    state.selectedPath = m.pathConstraints.length > 0 ? 0 : -1;
  }
  return m.pathConstraints;
}

function getActivePathConstraint() {
  const m = state.mesh;
  if (!m) return null;
  const list = ensurePathConstraints(m);
  sortConstraintListByOrder(list);
  if (state.selectedPath < 0 || state.selectedPath >= list.length) return null;
  return list[state.selectedPath];
}

function getPathConstrainedBoneSet(m) {
  const out = new Set();
  if (!m) return out;
  for (const c of ensurePathConstraints(m)) {
    if (!c || c.enabled === false) continue;
    for (const bi of c.bones || []) out.add(bi);
  }
  return out;
}

function getPathTargetBoneSet(m) {
  const out = new Set();
  if (!m) return out;
  for (const c of ensurePathConstraints(m)) {
    if (!c || c.enabled === false) continue;
    if (c.sourceType !== "bone_chain") continue;
    const t = Number(c.target);
    if (Number.isFinite(t) && t >= 0) out.add(t);
  }
  return out;
}

function addPathConstraint() {
  const m = state.mesh;
  if (!m || !Array.isArray(m.rigBones) || m.rigBones.length < 1) return false;
  const nextOrder = getNextGlobalConstraintOrder(m);
  const list = ensurePathConstraints(m);
  const target = Number.isFinite(state.selectedBone) && state.selectedBone >= 0 ? state.selectedBone : 0;
  const bone = Number.isFinite(target) && target >= 0 && target < m.rigBones.length ? target : 0;
  list.push({
    name: `path_${list.length}`,
    bones: [bone],
    target,
    sourceType: "drawn",
    targetSlot: state.activeSlot >= 0 ? state.activeSlot : 0,
    points: [],
    positionMode: "fixed",
    spacingMode: "length",
    rotateMode: "tangent",
    position: 0,
    spacing: 40,
    rotateMix: 1,
    translateMix: 1,
    skinRequired: false,
    closed: false,
    order: nextOrder,
    enabled: true,
  });
  state.selectedPath = list.length - 1;
  refreshPathUI();
  refreshTrackSelect();
  renderTimelineTracks();
  return true;
}

function removeSelectedPathConstraint() {
  const m = state.mesh;
  if (!m) return false;
  const list = ensurePathConstraints(m);
  if (state.selectedPath < 0 || state.selectedPath >= list.length) return false;
  list.splice(state.selectedPath, 1);
  state.selectedPath = list.length > 0 ? Math.min(state.selectedPath, list.length - 1) : -1;
  refreshPathUI();
  refreshTrackSelect();
  renderTimelineTracks();
  return true;
}

function getConstraintOrder(c, fallback = 0) {
  const o = Number(c && c.order);
  return Math.max(0, Number.isFinite(o) ? o : fallback);
}

function getNextGlobalConstraintOrder(m) {
  if (!m) return 0;
  let maxOrder = -1;
  const take = (list) => {
    for (const c of list || []) {
      if (!c) continue;
      const o = getConstraintOrder(c, 0);
      if (o > maxOrder) maxOrder = o;
    }
  };
  take(ensureIKConstraints(m));
  take(ensureTransformConstraints(m));
  take(ensurePathConstraints(m));
  return Math.max(0, maxOrder + 1);
}

function sortConstraintListByOrder(list) {
  if (!Array.isArray(list) || list.length <= 1) return;
  list.sort((a, b) => {
    const ao = getConstraintOrder(a, 0);
    const bo = getConstraintOrder(b, 0);
    if (ao !== bo) return ao - bo;
    return 0;
  });
}

function swapConstraintOrder(list, i, j) {
  if (!Array.isArray(list)) return false;
  if (!Number.isFinite(i) || !Number.isFinite(j) || i < 0 || j < 0 || i >= list.length || j >= list.length) return false;
  const a = list[i];
  const b = list[j];
  if (!a || !b) return false;
  const ao = Number.isFinite(Number(a.order)) ? Number(a.order) : i;
  const bo = Number.isFinite(Number(b.order)) ? Number(b.order) : j;
  a.order = bo;
  b.order = ao;
  return true;
}

function buildConstraintExecutionPlan(m) {
  if (!m) return [];
  const ikList = ensureIKConstraints(m);
  const tfcList = ensureTransformConstraints(m);
  const pthList = ensurePathConstraints(m);
  const out = [];
  let seq = 0;
  for (let i = 0; i < ikList.length; i += 1) {
    const c = ikList[i];
    if (!c || c.enabled === false) continue;
    out.push({ type: "ik", order: getConstraintOrder(c, i), seq: seq++, ref: c });
  }
  for (let i = 0; i < tfcList.length; i += 1) {
    const c = tfcList[i];
    if (!c || c.enabled === false) continue;
    out.push({ type: "tfc", order: getConstraintOrder(c, i), seq: seq++, ref: c });
  }
  for (let i = 0; i < pthList.length; i += 1) {
    const c = pthList[i];
    if (!c || c.enabled === false) continue;
    out.push({ type: "pth", order: getConstraintOrder(c, i), seq: seq++, ref: c });
  }
  out.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.seq - b.seq;
  });
  return out;
}

function collectPathChainPoints(bones, targetBone, closed = false) {
  const pts = [];
  const world = computeWorld(bones);
  let curr = targetBone;
  const visited = new Set();
  while (Number.isFinite(curr) && curr >= 0 && curr < bones.length && !visited.has(curr)) {
    visited.add(curr);
    const head = transformPoint(world[curr], 0, 0);
    const tip = transformPoint(world[curr], Number(bones[curr].length) || 0, 0);
    if (pts.length === 0) pts.push(head);
    pts.push(tip);
    let next = -1;
    for (let i = 0; i < bones.length; i += 1) {
      if (Number(bones[i] && bones[i].parent) === curr) {
        next = i;
        break;
      }
    }
    if (next < 0) break;
    curr = next;
  }
  if (closed && pts.length >= 2) pts.push({ ...pts[0] });
  return pts;
}

function collectSlotContourPathPoints(m, bones, slotIndex, closed = false) {
  if (!m || !Array.isArray(state.slots) || slotIndex < 0 || slotIndex >= state.slots.length) return [];
  const slot = state.slots[slotIndex];
  if (!slot) return [];
  const contour = ensureSlotContour(slot);
  const src = Array.isArray(contour && contour.fillPoints) && contour.fillPoints.length >= 2 ? contour.fillPoints : contour.points;
  if (!Array.isArray(src) || src.length < 2) return [];
  const world = computeWorld(bones);
  const tm = getSlotTransformMatrix(slot, world);
  const pts = src.map((p) => transformPoint(tm, Number(p.x) || 0, Number(p.y) || 0));
  if (closed && pts.length >= 2) pts.push({ ...pts[0] });
  return pts;
}

function samplePolylineAtDistance(points, d, closed = false) {
  if (!Array.isArray(points) || points.length < 2) return null;
  const segs = [];
  let total = 0;
  const n = points.length - 1;
  for (let i = 0; i < n; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    if (len <= 1e-6) continue;
    segs.push({ a, b, len, start: total, end: total + len });
    total += len;
  }
  if (total <= 1e-6 || segs.length === 0) return null;
  let t = Number(d) || 0;
  if (closed) {
    t = ((t % total) + total) % total;
  } else {
    t = math.clamp(t, 0, total);
  }
  let seg = segs[segs.length - 1];
  for (const s of segs) {
    if (t >= s.start && t <= s.end) {
      seg = s;
      break;
    }
  }
  const u = math.clamp((t - seg.start) / Math.max(1e-6, seg.len), 0, 1);
  const x = seg.a.x + (seg.b.x - seg.a.x) * u;
  const y = seg.a.y + (seg.b.y - seg.a.y) * u;
  const ang = Math.atan2(seg.b.y - seg.a.y, seg.b.x - seg.a.x);
  return { x, y, angle: ang, total };
}

function applySinglePathConstraintToBones(m, bones, c) {
  if (!m || !bones || !c || c.enabled === false) return;
  const ti = Number(c.target);
  if (c.sourceType === "bone_chain" && (!Number.isFinite(ti) || ti < 0 || ti >= bones.length)) return;
  const pathPts =
    c.sourceType === "bone_chain"
      ? collectPathChainPoints(bones, ti, !!c.closed)
      : c.sourceType === "slot"
        ? collectSlotContourPathPoints(m, bones, Number(c.targetSlot), !!c.closed)
        : collectDrawnPathPoints(c, !!c.closed);
  if (!pathPts || pathPts.length < 2) return;
  const tMix = math.clamp(Number(c.translateMix) || 0, 0, 1);
  const rMix = math.clamp(Number(c.rotateMix) || 0, 0, 1);
  for (let k = 0; k < c.bones.length; k += 1) {
    const bi = Number(c.bones[k]);
    if (!Number.isFinite(bi) || bi < 0 || bi >= bones.length || (c.sourceType === "bone_chain" && bi === ti)) continue;
    const smp = samplePolylineAtDistance(pathPts, (Number(c.position) || 0) + k * (Number(c.spacing) || 0), !!c.closed);
    if (!smp) continue;
    const world = computeWorld(bones);
    const ep = getBoneWorldEndpointsFromBones(bones, bi, world);
    const currAngle = Math.atan2(ep.tip.y - ep.head.y, ep.tip.x - ep.head.x);
    const len = Math.max(1, Number(bones[bi].length) || Math.hypot(ep.tip.x - ep.head.x, ep.tip.y - ep.head.y));
    const nx = ep.head.x + (smp.x - ep.head.x) * tMix;
    const ny = ep.head.y + (smp.y - ep.head.y) * tMix;
    const na = lerpAngle(currAngle, smp.angle, rMix);
    const tip = { x: nx + Math.cos(na) * len, y: ny + Math.sin(na) * len };
    setBoneFromWorldEndpoints(bones, bi, { x: nx, y: ny }, tip);
  }
}


