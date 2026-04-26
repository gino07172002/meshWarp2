// ROLE: Constraint data model — normalize / ensure / add / remove for
// IK, Transform, Path, Physics constraints. Owns the execution-plan
// builder used by the render loop. Owns the Physics solver
// (semi-implicit Euler) so the data model and solver stay co-located.
// EXPORTS:
//   - ensureIKConstraints, ensureTransformConstraints, ensurePathConstraints,
//     ensurePhysicsConstraints
//   - get*ConstrainedBoneSet, get*TargetBoneSet (bone visibility marker
//     sources)
//   - getActiveIK/Transform/Path/PhysicsConstraint (selection getters)
//   - addPhysicsConstraint, removeSelectedPhysicsConstraint,
//     resetAllPhysicsConstraintState
//   - applySinglePhysicsConstraintToBones (the solver),
//     applySinglePathConstraintToBones
//   - buildConstraintExecutionPlan (called by getEditAwareWorld)
//   - sortConstraintListByOrder, swapConstraintOrder, getConstraintOrder
// CONSUMERS: render/constraints.js (apply step), bones.js (tree row
//   markers), io/project-export.js (serialization).
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

// Spine 4.2 Physics Constraints.
// A physics constraint drives a single bone's transform via semi-implicit
// Euler integration. The bone is "anchored" to its rest pose (in its
// parent's local frame) by springs (inertia) and damped over time.
// External forces come from gravity and from the bone's parent moving.
//
// Per-instance state is kept on `c.state`:
//  - x/y/rot/sx/sy: previous-frame integrated values
//  - vx/vy/vRot/vSx/vSy: velocities
//  - lastTime: timestamp of previous step (-1 = never stepped)
//  - reset: when true, next step re-seeds from current bone transform
function ensurePhysicsConstraints(m) {
  if (!m) return [];
  if (!Array.isArray(m.physicsConstraints)) m.physicsConstraints = [];
  const count = Array.isArray(m.rigBones) ? m.rigBones.length : 0;
  m.physicsConstraints = m.physicsConstraints
    .map((c, i) => {
      const bone = Number(c && c.bone);
      const prev = c && c.state && typeof c.state === "object" ? c.state : {};
      return {
        name: c && c.name ? String(c.name) : `physics_${i}`,
        bone: Number.isFinite(bone) && bone >= 0 && bone < count ? bone : -1,
        // What channels this constraint drives:
        x: !!(c && c.x),
        y: !!(c && c.y),
        rotate: c ? c.rotate !== false : true,
        scaleX: !!(c && c.scaleX),
        shearX: !!(c && c.shearX),
        // Mix amounts per channel (0..1).
        mix: math.clamp(Number(c && c.mix) || 1, 0, 1),
        // Physics parameters.
        inertia: math.clamp(Number(c && c.inertia) || 1, 0, 1),
        strength: Math.max(0, Number(c && c.strength) || 100),
        damping: math.clamp(Number(c && c.damping) || 1, 0, 10),
        massInverse: Math.max(0.01, Number(c && c.massInverse) || 1),
        wind: Number(c && c.wind) || 0,
        gravity: Number(c && c.gravity) || 0,
        // Step in seconds. 1/60 default; clamp to [1/240, 1/15].
        step: math.clamp(Number(c && c.step) || 1 / 60, 1 / 240, 1 / 15),
        limit: Math.max(0, Number(c && c.limit) || 5000),
        order: getConstraintOrder(c, i),
        skinRequired: !!(c && c.skinRequired),
        enabled: c ? c.enabled !== false : true,
        state: {
          x: Number.isFinite(Number(prev.x)) ? Number(prev.x) : 0,
          y: Number.isFinite(Number(prev.y)) ? Number(prev.y) : 0,
          rot: Number.isFinite(Number(prev.rot)) ? Number(prev.rot) : 0,
          sx: Number.isFinite(Number(prev.sx)) ? Number(prev.sx) : 1,
          sy: Number.isFinite(Number(prev.sy)) ? Number(prev.sy) : 1,
          vx: 0,
          vy: 0,
          vRot: 0,
          vSx: 0,
          vSy: 0,
          lastTime: -1,
          reset: true,
        },
      };
    })
    .filter((c) => c.bone >= 0);
  if (
    !Number.isFinite(state.selectedPhysics) ||
    state.selectedPhysics < 0 ||
    state.selectedPhysics >= m.physicsConstraints.length
  ) {
    state.selectedPhysics = m.physicsConstraints.length > 0 ? 0 : -1;
  }
  return m.physicsConstraints;
}

function getActivePhysicsConstraint() {
  const m = state.mesh;
  if (!m) return null;
  const list = ensurePhysicsConstraints(m);
  sortConstraintListByOrder(list);
  if (state.selectedPhysics < 0 || state.selectedPhysics >= list.length) return null;
  return list[state.selectedPhysics];
}

function getPhysicsConstrainedBoneSet(m) {
  const out = new Set();
  if (!m) return out;
  for (const c of ensurePhysicsConstraints(m)) {
    if (!c || c.enabled === false) continue;
    if (c.bone >= 0) out.add(c.bone);
  }
  return out;
}

function addPhysicsConstraint() {
  const m = state.mesh;
  if (!m || !Array.isArray(m.rigBones) || m.rigBones.length < 1) return false;
  const list = ensurePhysicsConstraints(m);
  const bone = Number.isFinite(state.selectedBone) && state.selectedBone >= 0 ? state.selectedBone : 0;
  list.push({
    name: `physics_${list.length}`,
    bone,
    x: false,
    y: false,
    rotate: true,
    scaleX: false,
    shearX: false,
    mix: 1,
    inertia: 1,
    strength: 100,
    damping: 1,
    massInverse: 1,
    wind: 0,
    gravity: 0,
    step: 1 / 60,
    limit: 5000,
    order: getNextGlobalConstraintOrder(m),
    skinRequired: false,
    enabled: true,
  });
  ensurePhysicsConstraints(m);
  state.selectedPhysics = list.length - 1;
  if (typeof refreshPhysicsUI === "function") refreshPhysicsUI();
  return true;
}

function removeSelectedPhysicsConstraint() {
  const m = state.mesh;
  if (!m) return false;
  const list = ensurePhysicsConstraints(m);
  if (state.selectedPhysics < 0 || state.selectedPhysics >= list.length) return false;
  list.splice(state.selectedPhysics, 1);
  state.selectedPhysics = list.length > 0 ? Math.min(state.selectedPhysics, list.length - 1) : -1;
  if (typeof refreshPhysicsUI === "function") refreshPhysicsUI();
  return true;
}

function resetAllPhysicsConstraintState(m) {
  if (!m) return;
  const list = ensurePhysicsConstraints(m);
  for (const c of list) {
    if (!c || !c.state) continue;
    c.state.reset = true;
    c.state.lastTime = -1;
    c.state.vx = 0;
    c.state.vy = 0;
    c.state.vRot = 0;
    c.state.vSx = 0;
    c.state.vSy = 0;
  }
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
  take(ensurePhysicsConstraints(m));
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
  const physList = ensurePhysicsConstraints(m);
  for (let i = 0; i < physList.length; i += 1) {
    const c = physList[i];
    if (!c || c.enabled === false) continue;
    out.push({ type: "phy", order: getConstraintOrder(c, i), seq: seq++, ref: c });
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

// Physics solver — semi-implicit Euler integration.
//
// `target` is the bone's current rest-pose value for the channel (what the
// bone *would* be without physics). `current` is the value after the previous
// step. `velocity` is the current per-second rate.
//
// On each step: spring force pulls current toward target (Hooke), damping
// removes energy. External forces (wind/gravity for translate, etc.) push
// the velocity. Result is integrated forward by `dt`.
function _physicsStepChannel(target, current, velocity, dt, params, externalForce) {
  const { strength, damping, massInverse, limit } = params;
  // Spring towards target, damped.
  const accel = (target - current) * strength * massInverse - velocity * damping + externalForce;
  let vNext = velocity + accel * dt;
  // Clamp velocity so a misconfigured rig can't explode.
  if (vNext > limit) vNext = limit;
  else if (vNext < -limit) vNext = -limit;
  const cNext = current + vNext * dt;
  return { value: cNext, velocity: vNext };
}

function _physicsBlendAngle(a, b, t) {
  // Wrap-aware lerp (in radians). Equivalent to lerpAngle if available.
  if (typeof lerpAngle === "function") return lerpAngle(a, b, t);
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

// Apply a single physics constraint. Mutates the bone in-place.
//
// `nowSec` should be the current animation/render time in seconds. If the
// constraint hasn't been stepped before (or was reset), it re-seeds from
// the bone's current transform and sets velocities to zero.
function applySinglePhysicsConstraintToBones(m, bones, c, nowSec) {
  if (!m || !bones || !c || c.enabled === false) return;
  const bi = Number(c.bone);
  if (!Number.isFinite(bi) || bi < 0 || bi >= bones.length) return;
  const b = bones[bi];
  if (!b) return;
  const s = c.state;
  if (!s) return;
  const tNow = Number.isFinite(nowSec) ? nowSec : 0;
  if (s.reset || s.lastTime < 0) {
    s.x = Number(b.tx) || 0;
    s.y = Number(b.ty) || 0;
    s.rot = Number(b.rot) || 0;
    s.sx = Number(b.sx) || 1;
    s.sy = Number(b.sy) || 1;
    s.vx = s.vy = s.vRot = s.vSx = s.vSy = 0;
    s.lastTime = tNow;
    s.reset = false;
    return;
  }
  let elapsed = tNow - s.lastTime;
  if (!Number.isFinite(elapsed) || elapsed <= 0) return;
  // Cap a long pause (eg tab unfocused) so we don't spin forever.
  if (elapsed > 0.5) elapsed = 0.5;
  s.lastTime = tNow;
  const dt = c.step;
  const params = {
    strength: c.strength,
    damping: c.damping,
    massInverse: c.massInverse,
    limit: c.limit,
  };
  // External forces: wind acts on x velocity, gravity on y velocity.
  const fx = c.wind;
  const fy = c.gravity;
  const mix = c.mix;
  // Read current rest-pose targets before mutating the bone.
  const targetX = Number(b.tx) || 0;
  const targetY = Number(b.ty) || 0;
  const targetRot = Number(b.rot) || 0;
  const targetSx = Number(b.sx) || 1;
  const targetSy = Number(b.sy) || 1;
  // Inertia: 0 = bone always tracks rest pose (springs immediately re-seed
  // toward it). 1 = full drift (springs only). Apply by lerping the
  // simulator's current value toward the new rest target before stepping.
  if (c.inertia < 1) {
    const k = 1 - c.inertia;
    s.x += (targetX - s.x) * k;
    s.y += (targetY - s.y) * k;
    s.rot = _physicsBlendAngle(s.rot, targetRot, k);
    s.sx += (targetSx - s.sx) * k;
    s.sy += (targetSy - s.sy) * k;
  }
  // Substep until we've consumed `elapsed`.
  let remaining = elapsed;
  let iter = 0;
  while (remaining > 0 && iter < 16) {
    const useDt = Math.min(dt, remaining);
    if (c.x) {
      const r = _physicsStepChannel(targetX, s.x, s.vx, useDt, params, fx);
      s.x = r.value;
      s.vx = r.velocity;
    }
    if (c.y) {
      const r = _physicsStepChannel(targetY, s.y, s.vy, useDt, params, fy);
      s.y = r.value;
      s.vy = r.velocity;
    }
    if (c.rotate) {
      // For rotation we drive the wrapped delta to zero rather than the
      // absolute angle (avoids 360° wrap surprises).
      let delta = targetRot - s.rot;
      while (delta > Math.PI) delta -= Math.PI * 2;
      while (delta < -Math.PI) delta += Math.PI * 2;
      const r = _physicsStepChannel(delta, 0, s.vRot, useDt, params, 0);
      s.rot = s.rot + r.value;
      s.vRot = r.velocity;
    }
    if (c.scaleX) {
      const r = _physicsStepChannel(targetSx, s.sx, s.vSx, useDt, params, 0);
      s.sx = r.value;
      s.vSx = r.velocity;
    }
    if (c.shearX) {
      // Reuse sy state slot for shear (mutually exclusive in UI).
      const r = _physicsStepChannel(targetSy, s.sy, s.vSy, useDt, params, 0);
      s.sy = r.value;
      s.vSy = r.velocity;
    }
    remaining -= useDt;
    iter += 1;
  }
  // Mix the simulated values back onto the bone.
  if (c.x) b.tx = targetX + (s.x - targetX) * mix;
  if (c.y) b.ty = targetY + (s.y - targetY) * mix;
  if (c.rotate) b.rot = _physicsBlendAngle(targetRot, s.rot, mix);
  if (c.scaleX) b.sx = targetSx + (s.sx - targetSx) * mix;
  if (c.shearX) b.shx = (Number(b.shx) || 0) + (s.sy - targetSy) * mix;
}

