// Split from app.js
// Part: Bone modes, CRUD, object transforms, slot core
// Original lines: 3216-6852
// ============================================================
// SECTION: Bone System — Mode Transitions & Pose
// applyBoneModeTransition: handles edit↔pose↔object transitions,
//   syncs pose from rig, applies constraints.
// syncPoseFromRig: copies bind pose to pose bones.
// ============================================================
function applyBoneModeTransition(prevMode, nextMode) {
  if (prevMode === nextMode) return;
  if (!state.mesh) {
    state.rigCoordinateSpace = nextMode === "edit" ? "edit" : "runtime";
    if (nextMode === "edit") state.rigEditNeedsRuntimeNormalize = false;
    return;
  }

  if (nextMode === "edit") {
    if (state.rigCoordinateSpace !== "edit") {
      normalizeRigRuntimeForEdit(state.mesh);
    } else {
      state.rigEditNeedsRuntimeNormalize = false;
    }
    return;
  }

  if (state.rigCoordinateSpace !== "runtime") {
    normalizeRigEditForRuntime(state.mesh);
  } else if (prevMode === "edit") {
    state.rigEditNeedsRuntimeNormalize = false;
  }
}

function getParentMatrixForInherit(parentWorld, inheritMode) {
  const mode = normalizeBoneInheritValue(inheritMode);
  if (!parentWorld || mode === "normal") return parentWorld || createIdentity();
  const a = Number(parentWorld[0]) || 0;
  const b = Number(parentWorld[1]) || 0;
  const c = Number(parentWorld[2]) || 0;
  const d = Number(parentWorld[3]) || 0;
  const tx = Number(parentWorld[4]) || 0;
  const ty = Number(parentWorld[5]) || 0;

  if (mode === "onlyTranslation") return [1, 0, 0, 1, tx, ty];

  const lenX = Math.hypot(a, c);
  const lenY = Math.hypot(b, d);

  if (mode === "noRotationOrReflection") {
    const sx = lenX > 1e-8 ? lenX : 1;
    const sy = lenY > 1e-8 ? lenY : 1;
    return [sx, 0, 0, sy, tx, ty];
  }

  if (mode === "noScale" || mode === "noScaleOrReflection") {
    const ux = lenX > 1e-8 ? a / lenX : 1;
    const uy = lenX > 1e-8 ? c / lenX : 0;
    const det = a * d - b * c;
    const reflect = mode === "noScale" && det < 0 ? -1 : 1;
    const vx = -uy * reflect;
    const vy = ux * reflect;
    return [ux, vx, uy, vy, tx, ty];
  }

  return parentWorld;
}

function cloneBones(bones) {
  return bones.map((b) => ({ ...b }));
}

function enforceConnectedHeads(bones) {
  for (let i = 0; i < bones.length; i += 1) {
    const b = bones[i];
    if (!b) continue;
    normalizeBoneChannels(b);
    if (typeof b.poseLenEditable !== "boolean") {
      b.poseLenEditable = false;
    }
    if (b.parent >= 0 && typeof b.connected !== "boolean") {
      b.connected = true;
    }
    if (b.parent < 0 || !b.connected) continue;
    const parent = bones[b.parent];
    if (!parent) continue;
    b.tx = parent.length;
    b.ty = 0;
  }
}

function getRigBones(m) {
  return m.rigBones;
}

function getPoseBones(m) {
  return m.poseBones;
}

function getActiveBones(m) {
  return state.boneMode === "pose" ? getPoseBones(m) : getRigBones(m);
}

function isRootBoneIndex(bones, boneIndex) {
  if (!Array.isArray(bones) || !Number.isFinite(boneIndex) || boneIndex < 0 || boneIndex >= bones.length) return false;
  const bone = bones[boneIndex];
  const parent = bone ? Number(bone.parent) : NaN;
  return !!bone && (!Number.isFinite(parent) || parent < 0);
}

function isBoneWorkspaceHiddenDirect(m, boneIndex) {
  if (!m || !Number.isFinite(boneIndex) || boneIndex < 0) return false;
  const bones = Array.isArray(m.rigBones) ? m.rigBones : [];
  if (!isRootBoneIndex(bones, boneIndex)) return false;
  const rig = bones[boneIndex];
  normalizeBoneChannels(rig);
  return !!(rig && rig.workHidden);
}

function isBoneWorkspaceHidden(m, boneIndex) {
  if (!m || !Number.isFinite(boneIndex) || boneIndex < 0) return false;
  const bones = Array.isArray(m.rigBones) ? m.rigBones : [];
  let index = Number(boneIndex);
  while (index >= 0 && index < bones.length) {
    if (isBoneWorkspaceHiddenDirect(m, index)) return true;
    const bone = bones[index];
    const parent = bone ? Number(bone.parent) : NaN;
    index = Number.isFinite(parent) ? parent : -1;
  }
  return false;
}

function isBoneAnimationHiddenDirect(bones, boneIndex) {
  if (!Array.isArray(bones) || !Number.isFinite(boneIndex) || boneIndex < 0 || boneIndex >= bones.length) return false;
  if (!isRootBoneIndex(bones, boneIndex)) return false;
  const b = bones[boneIndex];
  normalizeBoneChannels(b);
  return !!(b && b.animHidden);
}

function isBoneAnimationHidden(bones, boneIndex) {
  if (!Array.isArray(bones) || !Number.isFinite(boneIndex) || boneIndex < 0 || boneIndex >= bones.length) return false;
  let index = Number(boneIndex);
  while (index >= 0 && index < bones.length) {
    if (isBoneAnimationHiddenDirect(bones, index)) return true;
    const bone = bones[index];
    const parent = bone ? Number(bone.parent) : NaN;
    index = Number.isFinite(parent) ? parent : -1;
  }
  return false;
}

function isBoneVisibleInWorkspace(m, bones, boneIndex) {
  if (isBoneWorkspaceHidden(m, boneIndex)) return false;
  if (state.boneMode === "pose" && isBoneAnimationHidden(bones, boneIndex)) return false;
  return true;
}

function syncPoseFromRig(m) {
  m.poseBones = cloneBones(m.rigBones);
  enforceConnectedHeads(m.poseBones);
}

function getVertexCount(m) {
  return m.positions.length / 2;
}

function allocWeights(vCount, boneCount) {
  return new Float32Array(vCount * boneCount);
}

function pointToSegmentDistanceSquared(px, py, ax, ay, bx, by) {
  const vx = bx - ax;
  const vy = by - ay;
  const wx = px - ax;
  const wy = py - ay;
  const vv = vx * vx + vy * vy;
  const t = vv > 1e-8 ? math.clamp((wx * vx + wy * vy) / vv, 0, 1) : 0;
  const cx = ax + vx * t;
  const cy = ay + vy * t;
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy;
}

function lineSegmentsIntersect(ax, ay, bx, by, cx, cy, dx, dy) {
  const cross = (ux, uy, vx, vy) => ux * vy - uy * vx;
  const abx = bx - ax;
  const aby = by - ay;
  const acx = cx - ax;
  const acy = cy - ay;
  const adx = dx - ax;
  const ady = dy - ay;
  const cdx = dx - cx;
  const cdy = dy - cy;
  const cax = ax - cx;
  const cay = ay - cy;
  const cbx = bx - cx;
  const cby = by - cy;
  const d1 = cross(abx, aby, acx, acy);
  const d2 = cross(abx, aby, adx, ady);
  const d3 = cross(cdx, cdy, cax, cay);
  const d4 = cross(cdx, cdy, cbx, cby);
  const onSeg = (px, py, qx, qy, rx, ry) =>
    Math.min(px, rx) - 1e-6 <= qx &&
    qx <= Math.max(px, rx) + 1e-6 &&
    Math.min(py, ry) - 1e-6 <= qy &&
    qy <= Math.max(py, ry) + 1e-6;
  if (Math.abs(d1) < 1e-6 && onSeg(ax, ay, cx, cy, bx, by)) return true;
  if (Math.abs(d2) < 1e-6 && onSeg(ax, ay, dx, dy, bx, by)) return true;
  if (Math.abs(d3) < 1e-6 && onSeg(cx, cy, ax, ay, dx, dy)) return true;
  if (Math.abs(d4) < 1e-6 && onSeg(cx, cy, bx, by, dx, dy)) return true;
  return (d1 > 0) !== (d2 > 0) && (d3 > 0) !== (d4 > 0);
}

function segmentIntersectsRect(ax, ay, bx, by, left, top, right, bottom) {
  const pointInside = (px, py) => px >= left && px <= right && py >= top && py <= bottom;
  if (pointInside(ax, ay) || pointInside(bx, by)) return true;
  const segLeft = Math.min(ax, bx);
  const segRight = Math.max(ax, bx);
  const segTop = Math.min(ay, by);
  const segBottom = Math.max(ay, by);
  if (segRight < left || segLeft > right || segBottom < top || segTop > bottom) return false;
  return (
    lineSegmentsIntersect(ax, ay, bx, by, left, top, right, top) ||
    lineSegmentsIntersect(ax, ay, bx, by, right, top, right, bottom) ||
    lineSegmentsIntersect(ax, ay, bx, by, right, bottom, left, bottom) ||
    lineSegmentsIntersect(ax, ay, bx, by, left, bottom, left, top)
  );
}

function getBoneWorldEndpointsFromBones(bones, i, world = null) {
  const w = world || getEditAwareWorld(bones);
  const b = bones[i];
  const head = transformPoint(w[i], 0, 0);
  const tip = transformPoint(w[i], b.length, 0);
  return { head, tip };
}

function captureEditBoneSnapshot(bones) {
  if (!Array.isArray(bones) || bones.length <= 0) return null;
  const world = getEditAwareWorld(bones);
  if (!Array.isArray(world) || world.length !== bones.length) return null;
  return {
    world,
    lengths: bones.map((b) => Math.max(1, Number(b && b.length) || 1)),
  };
}

function preserveConnectedChildTipsAfterEdit(bones, snapshot, excludeIndices = null) {
  if (state.boneMode !== "edit") return;
  if (!Array.isArray(bones) || bones.length <= 0) return;
  if (!snapshot || !Array.isArray(snapshot.world) || !Array.isArray(snapshot.lengths)) return;
  if (snapshot.world.length !== bones.length || snapshot.lengths.length !== bones.length) return;
  const exclude = new Set(
    (Array.isArray(excludeIndices) ? excludeIndices : [excludeIndices])
      .map((v) => Number(v))
      .filter((v) => Number.isFinite(v) && v >= 0 && v < bones.length)
  );
  const oldTips = snapshot.world.map((w, i) => transformPoint(w, Number(snapshot.lengths[i]) || 1, 0));
  for (let pass = 0; pass < bones.length; pass += 1) {
    for (let i = 0; i < bones.length; i += 1) {
      if (exclude.has(i)) continue;
      const b = bones[i];
      if (!b || !(b.parent >= 0 && b.connected)) continue;
      const parentIndex = Number(b.parent);
      if (!Number.isFinite(parentIndex) || parentIndex < 0 || parentIndex >= bones.length) continue;
      const parentEp = getBoneWorldEndpointsFromBones(bones, parentIndex);
      const oldTip = oldTips[i];
      if (!oldTip || !Number.isFinite(oldTip.x) || !Number.isFinite(oldTip.y)) continue;
      setBoneFromWorldEndpoints(bones, i, parentEp.tip, oldTip);
    }
  }
}

function setBoneFromWorldEndpoints(bones, boneIndex, head, tip) {
  const b = bones[boneIndex];
  const dx = tip.x - head.x;
  const dy = tip.y - head.y;
  b.length = Math.max(1, Math.hypot(dx, dy));
  const worldAngle = Math.atan2(dy, dx);
  if (state.boneMode === "edit") {
    if (b.parent >= 0 && b.connected) {
      const parent = bones[b.parent];
      b.tx = Number(parent && parent.length) || 0;
      b.ty = 0;
    } else {
      b.tx = Number(head && head.x) || 0;
      b.ty = Number(head && head.y) || 0;
    }
    b.rot = worldAngle;
    markRigEditDirty();
    return;
  }

  const world = computeRigWorldForCurrentSpace(bones);
  const parentWorld = b.parent >= 0 ? world[b.parent] : createIdentity();
  const invParent = invert(parentWorld);
  const localHead = transformPoint(invParent, head.x, head.y);
  b.tx = localHead.x;
  b.ty = localHead.y;
  b.rot = worldAngle - matrixAngle(parentWorld);
}

function getConnectedChildBoneIndices(bones, parentIndex) {
  if (!Array.isArray(bones)) return [];
  const out = [];
  for (let i = 0; i < bones.length; i += 1) {
    const b = bones[i];
    if (!b) continue;
    if (Number(b.parent) === Number(parentIndex) && b.connected) out.push(i);
  }
  return out;
}

function moveEditBoneEndpointAndConnectedJoint(bones, boneIndex, endpoint, worldTarget) {
  if (state.boneMode !== "edit" || !Array.isArray(bones)) return [];
  const bi = Number(boneIndex);
  const b = Number.isFinite(bi) && bi >= 0 && bi < bones.length ? bones[bi] : null;
  if (!b) return [];
  const target = {
    x: Number(worldTarget && worldTarget.x) || 0,
    y: Number(worldTarget && worldTarget.y) || 0,
  };
  const changed = new Set();
  const moveTailJoint = (parentIndex, jointTarget) => {
    const pi = Number(parentIndex);
    const parentBone = Number.isFinite(pi) && pi >= 0 && pi < bones.length ? bones[pi] : null;
    if (!parentBone) return;
    const childTips = new Map();
    for (const childIndex of getConnectedChildBoneIndices(bones, pi)) {
      const childEp = getBoneWorldEndpointsFromBones(bones, childIndex);
      childTips.set(childIndex, childEp.tip);
    }
    const parentEp = getBoneWorldEndpointsFromBones(bones, pi);
    setBoneFromWorldEndpoints(bones, pi, parentEp.head, jointTarget);
    changed.add(pi);
    for (const childIndex of getConnectedChildBoneIndices(bones, pi)) {
      const childEp = getBoneWorldEndpointsFromBones(bones, childIndex);
      const nextTip = childTips.get(childIndex) || childEp.tip;
      setBoneFromWorldEndpoints(bones, childIndex, jointTarget, nextTip);
      changed.add(childIndex);
    }
  };

  if (endpoint === "head") {
    if (b.parent >= 0 && b.connected) {
      moveTailJoint(Number(b.parent), target);
      return [...changed];
    }
    const ep = getBoneWorldEndpointsFromBones(bones, bi);
    setBoneFromWorldEndpoints(bones, bi, target, ep.tip);
    changed.add(bi);
    return [...changed];
  }

  if (endpoint === "tail") {
    moveTailJoint(bi, target);
    return [...changed];
  }

  return [];
}

function autoWeightMesh(m) {
  const vCount = getVertexCount(m);
  const bones = getRigBones(m);
  enforceConnectedHeads(bones);
  const boneCount = bones.length;
  if (boneCount === 0) {
    m.weights = new Float32Array(0);
    return;
  }
  m.weights = autoWeightForPositions(m.positions, bones, null, {
    indices: m.indices,
    maxInfluences: 4,
    nearestBoost: 7,
    sharpenPower: 2.4,
    distanceRatioCutoff: 5,
    smoothIters: 3,
    smoothLambda: 0.45,
    crossBranchPenalty: 0.2,
  });
}

function buildVertexComponents(vCount, indices) {
  if (!Number.isFinite(vCount) || vCount <= 0) return null;
  if (!indices || indices.length < 3) return null;
  const parent = new Int32Array(vCount);
  const rank = new Int8Array(vCount);
  for (let i = 0; i < vCount; i += 1) parent[i] = i;
  const find = (x) => {
    let r = x;
    while (parent[r] !== r) r = parent[r];
    while (parent[x] !== x) {
      const p = parent[x];
      parent[x] = r;
      x = p;
    }
    return r;
  };
  const unite = (a, b) => {
    if (a < 0 || b < 0 || a >= vCount || b >= vCount) return;
    let ra = find(a);
    let rb = find(b);
    if (ra === rb) return;
    if (rank[ra] < rank[rb]) {
      const t = ra;
      ra = rb;
      rb = t;
    }
    parent[rb] = ra;
    if (rank[ra] === rank[rb]) rank[ra] += 1;
  };
  for (let i = 0; i + 2 < indices.length; i += 3) {
    const i0 = Number(indices[i]);
    const i1 = Number(indices[i + 1]);
    const i2 = Number(indices[i + 2]);
    if (!Number.isFinite(i0) || !Number.isFinite(i1) || !Number.isFinite(i2)) continue;
    unite(i0, i1);
    unite(i1, i2);
    unite(i2, i0);
  }
  const map = new Map();
  const compIds = new Int32Array(vCount);
  let compCount = 0;
  for (let i = 0; i < vCount; i += 1) {
    const root = find(i);
    let id = map.get(root);
    if (!Number.isFinite(id)) {
      id = compCount;
      compCount += 1;
      map.set(root, id);
    }
    compIds[i] = id;
  }
  return { compIds, compCount };
}

function buildVertexAdjacency(vCount, indices) {
  if (!Number.isFinite(vCount) || vCount <= 0) return null;
  if (!indices || indices.length < 3) return null;
  const sets = Array.from({ length: vCount }, () => new Set());
  const connect = (a, b) => {
    if (a < 0 || b < 0 || a >= vCount || b >= vCount || a === b) return;
    sets[a].add(b);
    sets[b].add(a);
  };
  for (let i = 0; i + 2 < indices.length; i += 3) {
    const i0 = Number(indices[i]);
    const i1 = Number(indices[i + 1]);
    const i2 = Number(indices[i + 2]);
    if (!Number.isFinite(i0) || !Number.isFinite(i1) || !Number.isFinite(i2)) continue;
    connect(i0, i1);
    connect(i1, i2);
    connect(i2, i0);
  }
  return sets.map((s) => [...s]);
}

function buildBoneChildrenMap(bones) {
  const count = Array.isArray(bones) ? bones.length : 0;
  const map = Array.from({ length: count }, () => []);
  for (let i = 0; i < count; i += 1) {
    const p = Number(bones[i] && bones[i].parent);
    if (Number.isFinite(p) && p >= 0 && p < count) map[p].push(i);
  }
  return map;
}

function collectHierarchyInfluenceSet(bones, childrenMap, startBone, upDepth = 2, downDepth = 1) {
  const count = Array.isArray(bones) ? bones.length : 0;
  const root = Number(startBone);
  if (!Number.isFinite(root) || root < 0 || root >= count) return new Set();
  const set = new Set([root]);
  let p = Number(bones[root] && bones[root].parent);
  let steps = 0;
  while (Number.isFinite(p) && p >= 0 && p < count && steps < upDepth) {
    set.add(p);
    p = Number(bones[p] && bones[p].parent);
    steps += 1;
  }
  const q = [{ i: root, d: 0 }];
  while (q.length > 0) {
    const cur = q.shift();
    if (!cur || cur.d >= downDepth) continue;
    const kids = Array.isArray(childrenMap && childrenMap[cur.i]) ? childrenMap[cur.i] : [];
    for (const k of kids) {
      if (set.has(k)) continue;
      set.add(k);
      q.push({ i: k, d: cur.d + 1 });
    }
  }
  return set;
}

function hasTransparentGap(maskInfo, x0, y0, x1, y1, minGapPixels) {
  const gap = (minGapPixels != null && minGapPixels >= 1) ? minGapPixels : 3;
  const dx = x1 - x0, dy = y1 - y0;
  const pathLen = Math.sqrt(dx * dx + dy * dy);
  if (pathLen < 4) return false;
  const steps = Math.min(Math.ceil(pathLen), 512);
  let seenOpaque = false, gapRun = 0;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const px = Math.round(x0 + dx * t);
    const py = Math.round(y0 + dy * t);
    const inBounds = px >= 0 && px < maskInfo.width && py >= 0 && py < maskInfo.height;
    const opaque = inBounds && maskInfo.mask[py * maskInfo.width + px] > 0;
    if (opaque) {
      if (seenOpaque && gapRun >= gap) return true;
      seenOpaque = true;
      gapRun = 0;
    } else if (seenOpaque) {
      gapRun++;
    }
  }
  return false;
}

function autoWeightForPositions(positions, bones, allowedBones = null, options = null) {
  const vCount = positions.length / 2;
  enforceConnectedHeads(bones);
  const boneCount = bones.length;
  if (boneCount === 0) return new Float32Array(0);
  const allowSet = allowedBones && allowedBones.length > 0 ? new Set(allowedBones) : null;
  const world = computeRigWorldForCurrentSpace(bones);
  const segments = bones.map((b, i) => {
    const a = transformPoint(world[i], 0, 0);
    const e = transformPoint(world[i], b.length, 0);
    return { ax: a.x, ay: a.y, bx: e.x, by: e.y, len: Math.max(10, b.length) };
  });
  const weights = allocWeights(vCount, boneCount);
  const hardMode = state.weightMode === "hard";
  const maxInfluences =
    hardMode
      ? 1
      : math.clamp(Math.round(Number(options && options.maxInfluences)), 1, 8) || 3;
  const nearestBoost = hardMode ? 1 : Math.max(1, Number(options && options.nearestBoost) || 6);
  const sharpenPower = hardMode ? 1 : Math.max(1, Number(options && options.sharpenPower) || 2.2);
  const distanceRatioCutoff = hardMode ? 1 : Math.max(1.2, Number(options && options.distanceRatioCutoff) || 4.5);
  const crossBranchPenalty = hardMode ? 1 : math.clamp(Number(options && options.crossBranchPenalty) || 0.28, 0.05, 1);
  const globalSmooth = !hardMode && (options && Object.prototype.hasOwnProperty.call(options, "globalSmooth") ? options.globalSmooth !== false : true);
  const smoothIters = globalSmooth ? math.clamp(Math.round(Number(options && options.smoothIters)) || 3, 1, 8) : 0;
  const smoothLambda = globalSmooth ? math.clamp(Number(options && options.smoothLambda) || 0.42, 0, 5) : 0;
  const influenceUpDepth = hardMode ? 0 : math.clamp(Math.round(Number(options && options.influenceUpDepth)) || 2, 0, 5);
  const influenceDownDepth = hardMode ? 0 : math.clamp(Math.round(Number(options && options.influenceDownDepth)) || 1, 0, 5);
  const indices = options && options.indices;
  const alphaMask = !hardMode && options && options.alphaMask ? options.alphaMask : null;
  const invSlotTm = !hardMode && options && options.invSlotTransform ? options.invSlotTransform : null;
  const slotRect = !hardMode && options && options.slotRect ? options.slotRect : null;
  const gapPenalty = !hardMode ? math.clamp(Number(options && options.transparencyGapPenalty) || 0.01, 0, 1) : 1;
  const checkTransparency = !!(alphaMask && invSlotTm && slotRect);
  const components = buildVertexComponents(vCount, indices);
  const adjacency = buildVertexAdjacency(vCount, indices);
  const componentAllowed =
    components && allowSet && allowSet.size > 1
      ? (() => {
        const allowedList = [...allowSet].filter((b) => Number.isFinite(b) && b >= 0 && b < boneCount);
        if (allowedList.length <= 1) return null;
        const compBest = Array.from({ length: components.compCount }, () => {
          const best = new Map();
          for (const bi of allowedList) best.set(bi, Number.POSITIVE_INFINITY);
          return best;
        });
        for (let vi = 0; vi < vCount; vi += 1) {
          const compId = components.compIds[vi];
          const px = positions[vi * 2];
          const py = positions[vi * 2 + 1];
          const best = compBest[compId];
          for (const bi of allowedList) {
            const s = segments[bi];
            const d2 = pointToSegmentDistanceSquared(px, py, s.ax, s.ay, s.bx, s.by);
            if (d2 < (best.get(bi) || Number.POSITIVE_INFINITY)) best.set(bi, d2);
          }
        }
        const perComp = Array.from({ length: components.compCount }, () => null);
        for (let ci = 0; ci < components.compCount; ci += 1) {
          const ranked = [...compBest[ci].entries()].sort((a, b) => a[1] - b[1]);
          const keepCount = hardMode ? 1 : Math.min(ranked.length, Math.max(maxInfluences * 6, 16));
          const keep = ranked
            .slice(0, keepCount)
            .map((it) => Number(it[0]))
            .filter((v) => Number.isFinite(v));
          perComp[ci] = keep.length > 0 ? new Set(keep) : null;
        }
        return perComp;
      })()
      : null;

  const bestBoneByVertex = new Int32Array(vCount);
  const bestD2ByVertex = new Float64Array(vCount);
  const candidatesByVertex = Array.from({ length: vCount }, () => []);

  let vCanvasX = null, vCanvasY = null;
  if (checkTransparency) {
    vCanvasX = new Float32Array(vCount);
    vCanvasY = new Float32Array(vCount);
    for (let i = 0; i < vCount; i++) {
      const wx = positions[i * 2], wy = positions[i * 2 + 1];
      const lx = invSlotTm[0] * wx + invSlotTm[1] * wy + invSlotTm[4];
      const ly = invSlotTm[2] * wx + invSlotTm[3] * wy + invSlotTm[5];
      vCanvasX[i] = (lx - slotRect.x) * alphaMask.width / slotRect.w;
      vCanvasY[i] = (ly - slotRect.y) * alphaMask.height / slotRect.h;
    }
    // Bone canvas coords are computed per-vertex-pair using the closest point on the
    // bone segment (not the root), so no per-bone precompute needed.
  }

  for (let i = 0; i < vCount; i += 1) {
    const px = positions[i * 2];
    const py = positions[i * 2 + 1];
    const compAllow =
      componentAllowed && components && Number.isFinite(components.compIds[i])
        ? componentAllowed[components.compIds[i]]
        : null;
    let bestBone = 0;
    let bestD2 = Number.POSITIVE_INFINITY;
    const pairs = [];
    for (let b = 0; b < boneCount; b += 1) {
      if (allowSet && !allowSet.has(b)) continue;
      if (compAllow && !compAllow.has(b)) continue;
      const s = segments[b];
      const d2 = pointToSegmentDistanceSquared(px, py, s.ax, s.ay, s.bx, s.by);
      if (d2 < bestD2) {
        bestD2 = d2;
        bestBone = b;
      }
      if (hardMode) continue;
      const falloff = 0.35 * s.len;
      let w = 1 / (1 + d2 / (falloff * falloff));
      if (checkTransparency) {
        // Use the closest point on the bone SEGMENT to the vertex (not just the root).
        // This ensures the transparency check reflects the actual bone-to-vertex path
        // even when the bone root is far away (e.g. hip bone root vs. lower-leg vertex).
        const sdx = s.bx - s.ax, sdy = s.by - s.ay;
        const sLenSq = sdx * sdx + sdy * sdy;
        let cpwx, cpwy;
        if (sLenSq < 1e-10) {
          cpwx = s.ax; cpwy = s.ay;
        } else {
          const t = Math.max(0, Math.min(1, ((px - s.ax) * sdx + (py - s.ay) * sdy) / sLenSq));
          cpwx = s.ax + t * sdx;
          cpwy = s.ay + t * sdy;
        }
        const clx = invSlotTm[0] * cpwx + invSlotTm[1] * cpwy + invSlotTm[4];
        const cly = invSlotTm[2] * cpwx + invSlotTm[3] * cpwy + invSlotTm[5];
        const bCx = (clx - slotRect.x) * alphaMask.width / slotRect.w;
        const bCy = (cly - slotRect.y) * alphaMask.height / slotRect.h;
        if (hasTransparentGap(alphaMask, vCanvasX[i], vCanvasY[i], bCx, bCy)) {
          w *= gapPenalty;
        }
      }
      pairs.push({ b, w, d2 });
    }
    bestBoneByVertex[i] = bestBone;
    bestD2ByVertex[i] = bestD2;
    if (hardMode) {
      const hb = allowSet && !allowSet.has(bestBone) ? [...allowSet][0] : bestBone;
      if (hb != null) weights[i * boneCount + hb] = 1;
      continue;
    }
    pairs.sort((a, b) => a.d2 - b.d2);
    candidatesByVertex[i] = pairs;
  }
  if (hardMode) return weights;

  let labels = new Int32Array(bestBoneByVertex);
  if (globalSmooth && adjacency) {
    const candLimit = Math.max(maxInfluences * 4, 10);
    for (let iter = 0; iter < smoothIters; iter += 1) {
      const next = new Int32Array(labels);
      for (let i = 0; i < vCount; i += 1) {
        const nbs = adjacency[i];
        if (!Array.isArray(nbs) || nbs.length === 0) continue;
        const candsRaw = candidatesByVertex[i];
        if (!Array.isArray(candsRaw) || candsRaw.length === 0) continue;
        const cands = candsRaw.slice(0, candLimit);
        let bestLabel = labels[i];
        let bestScore = Number.POSITIVE_INFINITY;
        const denomD2 = Math.max(1e-8, bestD2ByVertex[i]);
        for (const c of cands) {
          const b = Number(c && c.b);
          if (!Number.isFinite(b) || b < 0 || b >= boneCount) continue;
          const data = (Number(c.d2) || 0) / denomD2;
          let mismatch = 0;
          for (const ni of nbs) {
            if (labels[ni] !== b) mismatch += 1;
          }
          const smooth = mismatch / Math.max(1, nbs.length);
          const score = data + smoothLambda * smooth;
          if (score < bestScore) {
            bestScore = score;
            bestLabel = b;
          }
        }
        next[i] = bestLabel;
      }
      labels = next;
    }
  }

  const childrenMap = buildBoneChildrenMap(bones);
  for (let i = 0; i < vCount; i += 1) {
    const dominantRaw = Number(labels[i]);
    const dominant =
      Number.isFinite(dominantRaw) && dominantRaw >= 0 && dominantRaw < boneCount
        ? dominantRaw
        : Number(bestBoneByVertex[i]);
    const bestD2 = Math.max(1e-8, Number(bestD2ByVertex[i]) || 1e-8);
    const d2Gate = bestD2 * distanceRatioCutoff;
    const family = collectHierarchyInfluenceSet(bones, childrenMap, dominant, influenceUpDepth, influenceDownDepth);
    const cands = candidatesByVertex[i];
    const selected = [];

    for (const c of cands) {
      if (selected.length >= maxInfluences) break;
      const b = Number(c && c.b);
      const d2 = Number(c && c.d2);
      if (!Number.isFinite(b) || b < 0 || b >= boneCount) continue;
      if (b !== dominant) {
        if (d2 > d2Gate) continue;
        if (!family.has(b)) continue;
      }
      if (!selected.some((it) => Number(it && it.b) === b)) selected.push(c);
    }
    for (const c of cands) {
      if (selected.length >= maxInfluences) break;
      const b = Number(c && c.b);
      const d2 = Number(c && c.d2);
      if (!Number.isFinite(b) || b < 0 || b >= boneCount) continue;
      if (d2 > d2Gate) continue;
      if (selected.some((it) => Number(it && it.b) === b)) continue;
      selected.push(c);
    }
    if (!selected.some((it) => Number(it && it.b) === dominant)) {
      const dom = cands.find((it) => Number(it && it.b) === dominant);
      if (dom) {
        if (selected.length >= maxInfluences) selected[selected.length - 1] = dom;
        else selected.push(dom);
      }
    }

    let sum = 0;
    for (const c of selected) {
      const b = Number(c && c.b);
      const baseW = Number(c && c.w) || 0;
      if (!Number.isFinite(b) || b < 0 || b >= boneCount || baseW <= 0) continue;
      let w = Math.pow(baseW, sharpenPower);
      if (b === dominant) w *= nearestBoost;
      else if (!family.has(b)) w *= crossBranchPenalty;
      if (w <= 0) continue;
      weights[i * boneCount + b] = w;
      sum += w;
    }
    if (sum < 1e-8) {
      const fb = Number.isFinite(dominant) ? dominant : allowSet ? [...allowSet][0] : 0;
      if (fb != null) weights[i * boneCount + fb] = 1;
      continue;
    }
    for (let b = 0; b < boneCount; b += 1) {
      weights[i * boneCount + b] /= sum;
    }
  }
  return weights;
}

function setSlotSingleBoneWeight(slot, m, boneIndex) {
  if (!slot || !m) return;
  ensureSlotMeshData(slot, m);
  const att = getActiveAttachment(slot);
  if (!att || !att.meshData) return;
  const sm = att.meshData;
  const vCount = sm.positions.length / 2;
  const boneCount = m.rigBones.length;
  const weights = allocWeights(vCount, boneCount);
  if (boneIndex >= 0 && boneIndex < boneCount) {
    for (let i = 0; i < vCount; i += 1) {
      weights[i * boneCount + boneIndex] = 1;
    }
  }
  sm.weights = weights;
  att.useWeights = true;
  att.weightBindMode = "single";
  att.weightMode = "single";
  att.influenceBones = boneIndex >= 0 ? [boneIndex] : [];
}

function getSlotWeightMode(slot, attachment = null) {
  if (!slot) return "single";
  const att = attachment || getActiveAttachment(slot);
  if (!att) return "single";
  if (att.weightMode === "single" || att.weightMode === "weighted" || att.weightMode === "free") {
    return att.weightMode;
  }
  if (att.useWeights === false || att.weightBindMode === "none") return "free";
  if (att.weightBindMode === "auto") return "weighted";
  return "single";
}

function getSlotWeightModeHintText(mode) {
  const m = mode === "weighted" || mode === "free" ? mode : "single";
  if (m === "weighted") {
    return "Weighted Attachment (mesh): supports multiple influence bones and weighted deformation.";
  }
  if (m === "free") {
    return "Free attachment: no bone binding, behaves like editor-only free transform.";
  }
  return "Single Bone Attachment (region-style): follows one owner bone.";
}

function refreshSlotWeightQuickUI(slot = null) {
  const s = slot || getActiveSlot();
  const hasSlot = !!(s && state.mesh);
  const mode = hasSlot ? getSlotWeightMode(s) : "single";
  const setBtnState = (btn, active) => {
    if (!btn) return;
    btn.disabled = !hasSlot;
    btn.classList.toggle("active", !!active);
  };
  setBtnState(els.slotWeightQuickWeightedBtn, mode === "weighted");
  setBtnState(els.slotWeightQuickSingleBtn, mode === "single");
  setBtnState(els.slotWeightQuickFreeBtn, mode === "free");
  if (els.slotWeightQuickEditBtn) {
    els.slotWeightQuickEditBtn.disabled = !hasSlot;
    els.slotWeightQuickEditBtn.classList.toggle("active", state.editMode === "mesh");
  }
  if (els.slotWeightQuickBar) {
    els.slotWeightQuickBar.classList.toggle("disabled", !hasSlot);
  }
}

function switchToVertexWeightEditing() {
  if (!els.editMode) return;
  if (els.editMode.value !== "mesh") {
    els.editMode.value = "mesh";
    els.editMode.dispatchEvent(new Event("change", { bubbles: true }));
  }
  setLeftToolTab("skin");
  state.vertexDeform.weightViz = true;
  updateWorkspaceUI();
  refreshVertexDeformUI();
}

function syncWeightOverlayToBoneSelection() {
  if (state.editMode !== "mesh") return;
  if (!state.vertexDeform.weightViz) state.vertexDeform.weightViz = true;
  if (state.vertexDeform.weightVizMode !== "selected" && state.vertexDeform.weightVizMode !== "dominant") {
    state.vertexDeform.weightVizMode = "selected";
  }
  refreshVertexDeformUI();
}

function applyActiveSlotWeightMode(modeRaw, options = {}) {
  const s = getActiveSlot();
  if (!s || !state.mesh) return false;
  const att = getActiveAttachment(s);
  if (!att) return false;
  const mode = modeRaw === "weighted" || modeRaw === "free" ? modeRaw : "single";
  const focusWeighted = !!(options && options.focusWeighted);
  const boneCount = Array.isArray(state.mesh.rigBones) ? state.mesh.rigBones.length : 0;
  const isValidBone = (bi) => Number.isFinite(bi) && bi >= 0 && bi < boneCount;
  if (mode === "weighted") {
    const fallback = isValidBone(Number(s.bone))
      ? Number(s.bone)
      : Number.isFinite(getPrimarySelectedBoneIndex())
        ? getPrimarySelectedBoneIndex()
        : boneCount > 0
          ? 0
          : -1;
    if (isValidBone(fallback)) s.bone = fallback;
    att.useWeights = true;
    att.weightBindMode = "auto";
    att.weightMode = "weighted";
    const weightedInfluences = Array.isArray(att.influenceBones)
      ? att.influenceBones.filter((v) => isValidBone(Number(v))).map((v) => Number(v))
      : [];
    if (isValidBone(Number(s.bone)) && !weightedInfluences.includes(Number(s.bone))) {
      weightedInfluences.unshift(Number(s.bone));
    }
    att.influenceBones = weightedInfluences.length > 0 ? [...new Set(weightedInfluences)] : getSlotInfluenceBones(s, state.mesh, att);
    if (!isValidBone(Number(s.bone))) ensureSlotsHaveBoneBinding();
    if (focusWeighted) {
      switchToVertexWeightEditing();
      setStatus("Weighted Mesh enabled. Switched to Vertex mode for direct weight editing.");
    } else {
      setStatus("Attachment mode switched to Weighted Attachment (Mesh).");
    }
  } else if (mode === "single") {
    const weighted = getSlotInfluenceBones(s, state.mesh, att);
    const fallback = isValidBone(Number(s.bone))
      ? Number(s.bone)
      : weighted.length > 0 && isValidBone(Number(weighted[0]))
        ? Number(weighted[0])
        : Number.isFinite(getPrimarySelectedBoneIndex())
          ? getPrimarySelectedBoneIndex()
          : boneCount > 0
            ? 0
            : -1;
    s.bone = isValidBone(fallback) ? fallback : -1;
    att.useWeights = true;
    att.weightBindMode = "single";
    att.weightMode = "single";
    att.influenceBones = isValidBone(Number(s.bone)) ? [Number(s.bone)] : [];
    ensureSlotsHaveBoneBinding();
    setStatus("Attachment mode switched to Single Bone Attachment.");
  } else {
    att.useWeights = false;
    att.weightBindMode = "none";
    att.weightMode = "free";
    s.bone = -1;
    att.influenceBones = [];
    setStatus("Attachment mode switched to Free (No Bone).");
  }
  rebuildSlotWeights(s, state.mesh);
  refreshSlotUI();
  renderBoneTree();
  return true;
}

function getSlotInfluenceBones(slot, m, attachment = null) {
  if (!slot || !m) return [];
  const boneCount = m.rigBones.length;
  const att = attachment || getActiveAttachment(slot);
  if (Array.isArray(att && att.influenceBones) && att.influenceBones.length > 0) {
    const filtered = att.influenceBones.filter((i) => Number.isFinite(i) && i >= 0 && i < boneCount);
    if (filtered.length > 0) return [...new Set(filtered)];
  }
  const b = Number(slot.bone);
  if (Number.isFinite(b) && b >= 0 && b < boneCount) return [b];
  return [];
}

function hasCompatibleSlotWeights(slot, m) {
  if (!slot || !m) return false;
  const att = getActiveAttachment(slot);
  const md = att && att.meshData;
  if (!md || !md.positions) return false;
  const vCount = Math.floor((Number(md.positions.length) || 0) / 2);
  const boneCount = Array.isArray(m.rigBones) ? m.rigBones.length : 0;
  if (vCount <= 0 || boneCount <= 0) return false;
  return !!(md.weights && md.weights.length === vCount * boneCount);
}

// --- Vertex weight clipboard (copy/paste a vertex's influence vector) ---
const _vertexWeightClipboard = { values: null, boneCount: 0 };

function getActiveMeshDataForWeights() {
  const m = state.mesh;
  if (!m) return null;
  if (state.slots.length > 0) {
    const slot = getActiveSlot();
    if (!slot) return null;
    const att = getActiveAttachment(slot);
    if (!att || !att.meshData) return null;
    return { m, meshData: att.meshData, slot, att };
  }
  return { m, meshData: m, slot: null, att: null };
}

function copyVertexWeightsToClipboard() {
  const ctx = getActiveMeshDataForWeights();
  if (!ctx) return { ok: false, reason: "No mesh." };
  const { m, meshData } = ctx;
  const boneCount = Array.isArray(m.rigBones) ? m.rigBones.length : 0;
  const weights = meshData.weights;
  if (!weights || weights.length === 0 || boneCount <= 0) return { ok: false, reason: "No weights on active mesh." };
  const vCount = Math.floor(weights.length / boneCount);
  if (vCount <= 0) return { ok: false, reason: "No vertices." };
  const selected = getActiveVertexSelection(vCount);
  if (!Array.isArray(selected) || selected.length === 0) return { ok: false, reason: "Select a vertex first." };
  const src = selected[0];
  if (!Number.isFinite(src) || src < 0 || src >= vCount) return { ok: false, reason: "Invalid selected vertex." };
  const values = new Float32Array(boneCount);
  for (let b = 0; b < boneCount; b += 1) {
    values[b] = Number(weights[src * boneCount + b]) || 0;
  }
  _vertexWeightClipboard.values = values;
  _vertexWeightClipboard.boneCount = boneCount;
  return { ok: true, sourceVertex: src, boneCount };
}

function pasteVertexWeightsFromClipboard() {
  const clip = _vertexWeightClipboard;
  if (!clip.values || clip.boneCount <= 0) return { ok: false, reason: "No copied weights." };
  const ctx = getActiveMeshDataForWeights();
  if (!ctx) return { ok: false, reason: "No mesh." };
  const { m, meshData } = ctx;
  const boneCount = Array.isArray(m.rigBones) ? m.rigBones.length : 0;
  if (boneCount !== clip.boneCount) return { ok: false, reason: "Bone count differs from copied weights." };
  const weights = meshData.weights;
  if (!weights || weights.length === 0) return { ok: false, reason: "Target mesh has no weights." };
  const vCount = Math.floor(weights.length / boneCount);
  const selected = getActiveVertexSelection(vCount);
  if (!Array.isArray(selected) || selected.length === 0) return { ok: false, reason: "Select target vertex/vertices first." };
  let pasted = 0;
  for (const vi of selected) {
    if (!Number.isFinite(vi) || vi < 0 || vi >= vCount) continue;
    for (let b = 0; b < boneCount; b += 1) {
      weights[vi * boneCount + b] = clip.values[b];
    }
    pasted += 1;
  }
  return { ok: pasted > 0, count: pasted };
}

// Prune: count or apply removal of bone influences below `threshold` from the
// active slot's weighted mesh. Below threshold values are zeroed and the row
// is renormalised. With dryRun=true returns counts without mutating.
//
// Returns { ok, reason, threshold, droppedInfluences, affectedVertices,
//           emptiedBones (bones that have 0 weight everywhere after prune),
//           boneCount, vCount }.
function pruneVertexWeights(thresholdRaw, opts = {}) {
  const dryRun = !!(opts && opts.dryRun);
  const threshold = Math.max(0, Math.min(0.5, Number(thresholdRaw) || 0));
  const ctx = getActiveMeshDataForWeights();
  if (!ctx) return { ok: false, reason: "No active mesh." };
  const { m, meshData, slot, att } = ctx;
  const boneCount = Array.isArray(m.rigBones) ? m.rigBones.length : 0;
  const weights = meshData.weights;
  if (!weights || weights.length === 0 || boneCount <= 0) {
    return { ok: false, reason: "Active attachment has no weighted bind." };
  }
  const vCount = Math.floor(weights.length / boneCount);
  if (vCount <= 0) return { ok: false, reason: "No vertices." };
  // Snapshot before mutation in case caller wants undo on failure.
  const lockedSet = (typeof getLockedBoneSet === "function") ? getLockedBoneSet() : null;
  let droppedInfluences = 0;
  let affectedVertices = 0;
  // Track which bones become empty everywhere (for influence list trimming).
  const boneNonZero = new Uint8Array(boneCount);
  // Work on a copy if dryRun, else in-place.
  const target = dryRun ? new Float32Array(weights) : weights;
  for (let v = 0; v < vCount; v += 1) {
    const base = v * boneCount;
    let hadDrop = false;
    for (let b = 0; b < boneCount; b += 1) {
      const w = Number(target[base + b]) || 0;
      if (w === 0) continue;
      // Locked bones are never pruned.
      if (lockedSet && lockedSet.has(b)) {
        boneNonZero[b] = 1;
        continue;
      }
      if (w < threshold) {
        target[base + b] = 0;
        droppedInfluences += 1;
        hadDrop = true;
      } else {
        boneNonZero[b] = 1;
      }
    }
    if (hadDrop) {
      affectedVertices += 1;
      // Renormalise this row (locked bones preserved by helper).
      if (typeof renormalizeVertexRowWithLocks === "function") {
        renormalizeVertexRowWithLocks(target, base, boneCount, lockedSet, -1);
      } else {
        // Fallback: simple sum-rescale.
        let sum = 0;
        for (let b = 0; b < boneCount; b += 1) sum += Number(target[base + b]) || 0;
        if (sum > 1e-6 && Math.abs(sum - 1) > 1e-5) {
          const scale = 1 / sum;
          for (let b = 0; b < boneCount; b += 1) target[base + b] = (Number(target[base + b]) || 0) * scale;
        }
      }
    }
  }
  let emptiedBones = 0;
  const emptiedList = [];
  for (let b = 0; b < boneCount; b += 1) {
    if (!boneNonZero[b]) {
      emptiedBones += 1;
      emptiedList.push(b);
    }
  }
  // Note: we intentionally don't trim `att.influenceBones` here. Emptied bones
  // stay in the list with all-zero weight rows; rebuildSlotWeights / save logic
  // tolerates that, and it preserves the user's binding intent if they re-paint.
  return {
    ok: true,
    threshold,
    droppedInfluences,
    affectedVertices,
    emptiedBones,
    emptiedList,
    boneCount,
    vCount,
    dryRun,
    slotIndex: slot ? state.slots.indexOf(slot) : -1,
  };
}

function rebuildSlotWeights(slot, m) {
  if (!slot || !m) return;
  ensureSlotMeshData(slot, m);
  const att = getActiveAttachment(slot);
  if (!att || !att.meshData) return; // no attachment or no mesh — nothing to weight
  const mode = getSlotWeightMode(slot);
  if (mode === "free") {
    att.useWeights = false;
    att.weightBindMode = "none";
    att.weightMode = "free";
    att.meshData.weights = new Float32Array(0);
    return;
  }
  if (mode === "single") {
    const bi = Number(slot.bone);
    setSlotSingleBoneWeight(slot, m, Number.isFinite(bi) ? bi : -1);
    att.influenceBones = Number.isFinite(bi) && bi >= 0 && bi < m.rigBones.length ? [bi] : [];
    return;
  }
  att.useWeights = true;
  const allowed = getSlotInfluenceBones(slot, m);
  att.influenceBones = allowed;
  const transpOpts = buildTransparencyOptionsForSlot(slot, m);
  att.meshData.weights = autoWeightForPositions(
    getSlotWeightedAutoWeightPositions(slot, m),
    m.rigBones,
    allowed,
    {
      indices: att.meshData.indices,
      maxInfluences: 3,
      distanceRatioCutoff: 3.8,
      smoothIters: 3,
      smoothLambda: 0.5,
      crossBranchPenalty: 0.16,
      ...(transpOpts || {}),
    }
  );
  att.weightBindMode = "auto";
  att.weightMode = "weighted";
}

function buildTransparencyOptionsForSlot(slot, m) {
  const att = getActiveAttachment(slot);
  if (!att || !att.canvas) return null;
  const alphaMask = getCanvasAlphaMask(att.canvas, 8);
  if (!alphaMask) return null;
  const poseWorld = computeRigWorldForCurrentSpace(getRigBones(m));
  const invSlotTransform = invert(getSlotTransformMatrix(slot, poseWorld));
  const slotRect = att.rect || { x: 0, y: 0, w: state.imageWidth || 64, h: state.imageHeight || 64 };
  return { alphaMask, invSlotTransform, slotRect, transparencyGapPenalty: 0.01 };
}

function getSlotWeightedAutoWeightPositions(slot, m) {
  if (!slot || !m || !(getActiveAttachment(slot) || {}).meshData || !(getActiveAttachment(slot) || {}).meshData.positions) return new Float32Array(0);
  const src = (getActiveAttachment(slot) || {}).meshData.positions;
  const poseWorld = computeRigWorldForCurrentSpace(getRigBones(m));
  const tm = getSlotTransformMatrix(slot, poseWorld);
  const isIdentity =
    Math.abs((tm[0] || 1) - 1) < 1e-6 &&
    Math.abs(tm[1] || 0) < 1e-6 &&
    Math.abs(tm[2] || 0) < 1e-6 &&
    Math.abs((tm[3] || 1) - 1) < 1e-6 &&
    Math.abs(tm[4] || 0) < 1e-6 &&
    Math.abs(tm[5] || 0) < 1e-6;
  if (isIdentity) return src;
  const out = new Float32Array(src.length);
  for (let i = 0; i < src.length / 2; i += 1) {
    const p = transformPoint(tm, src[i * 2], src[i * 2 + 1]);
    out[i * 2] = Number(p.x) || 0;
    out[i * 2 + 1] = Number(p.y) || 0;
  }
  return out;
}

function createSlotMeshData(rect, docW, docH, baseCols, baseRows) {
  const cellW = Math.max(1, docW / Math.max(2, baseCols));
  const cellH = Math.max(1, docH / Math.max(2, baseRows));
  const cols = Math.max(1, Math.round(rect.w / cellW));
  const rows = Math.max(1, Math.round(rect.h / cellH));
  const vCount = (cols + 1) * (rows + 1);
  const positions = new Float32Array(vCount * 2);
  const uvs = new Float32Array(vCount * 2);
  const offsets = new Float32Array(vCount * 2);
  const index = [];
  let idx = 0;
  for (let y = 0; y <= rows; y += 1) {
    const ty = y / rows;
    for (let x = 0; x <= cols; x += 1) {
      const tx = x / cols;
      positions[idx * 2] = rect.x + tx * rect.w;
      positions[idx * 2 + 1] = rect.y + ty * rect.h;
      uvs[idx * 2] = tx;
      uvs[idx * 2 + 1] = ty;
      idx += 1;
    }
  }
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const i0 = y * (cols + 1) + x;
      const i1 = i0 + 1;
      const i2 = i0 + (cols + 1);
      const i3 = i2 + 1;
      if (((x + y) & 1) === 0) {
        index.push(i0, i2, i3, i0, i3, i1);
      } else {
        index.push(i0, i2, i1, i1, i2, i3);
      }
    }
  }
  return {
    cols,
    rows,
    positions,
    uvs,
    offsets,
    baseOffsets: new Float32Array(offsets),
    weights: new Float32Array(0),
    indices: new Uint16Array(index),
    deformedLocal: new Float32Array(vCount * 2),
    deformedScreen: new Float32Array(vCount * 2),
    interleaved: new Float32Array(vCount * 4),
  };
}

function createMesh(cols, rows, w, h) {
  const vCount = (cols + 1) * (rows + 1);
  const positions = new Float32Array(vCount * 2);
  const uvs = new Float32Array(vCount * 2);
  const offsets = new Float32Array(vCount * 2);

  let idx = 0;
  for (let y = 0; y <= rows; y += 1) {
    const ty = y / rows;
    for (let x = 0; x <= cols; x += 1) {
      const tx = x / cols;
      positions[idx * 2] = tx * w;
      positions[idx * 2 + 1] = ty * h;
      uvs[idx * 2] = tx;
      uvs[idx * 2 + 1] = ty;
      idx += 1;
    }
  }

  const index = [];
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const i0 = y * (cols + 1) + x;
      const i1 = i0 + 1;
      const i2 = i0 + (cols + 1);
      const i3 = i2 + 1;
      if (((x + y) & 1) === 0) {
        index.push(i0, i2, i3, i0, i3, i1);
      } else {
        index.push(i0, i2, i1, i1, i2, i3);
      }
    }
  }

  const rigBones = [];
  const mesh = {
    cols,
    rows,
    positions,
    uvs,
    offsets,
    baseOffsets: new Float32Array(offsets),
    weights: allocWeights(vCount, rigBones.length),
    indices: new Uint16Array(index),
    rigBones,
    poseBones: cloneBones(rigBones),
    bindWorld: null,
    invBind: null,
    deformedLocal: new Float32Array(vCount * 2),
    skinnedLocal: new Float32Array(vCount * 2),
    deformedScreen: new Float32Array(vCount * 2),
    interleaved: new Float32Array(vCount * 4),
    ikConstraints: [],
    transformConstraints: [],
    pathConstraints: [],
  };

  syncBindPose(mesh);
  return mesh;
}

function syncBindPose(m) {
  enforceConnectedHeads(m.rigBones);
  const world = computeRigWorldForCurrentSpace(m.rigBones);
  m.bindWorld = world;
  m.invBind = world.map(invert);
}

// Update Bindings (Spine-equivalent). Re-baselines the rest pose to the current
// posed appearance: vertex `positions` are baked to where they currently render
// under the live `poseWorld × invBindOld`, and then `invBind` is refreshed so
// the new `poseWorld × invBindNew` is identity. Net visual: zero change. Net
// editability: weights stay the same, but the rest pose is now the current
// posed rig, so further weight tweaks won't drag the mesh away from its
// painted-against position.
//
// Returns { ok, reason, slotsUpdated, vCountTotal }.
// Weld: add bone A's weights into bone B, then zero A. The row total is
// preserved (no renormalisation needed). Locked bones are protected: weld
// fails if A or B is locked.
function weldBoneWeights(fromBoneIndex, toBoneIndex) {
  const fb = Number(fromBoneIndex);
  const tb = Number(toBoneIndex);
  if (!Number.isFinite(fb) || !Number.isFinite(tb)) return { ok: false, reason: "Invalid bone index." };
  if (fb === tb) return { ok: false, reason: "From and To must differ." };
  const ctx = getActiveMeshDataForWeights();
  if (!ctx) return { ok: false, reason: "No active mesh." };
  const { m, meshData, att } = ctx;
  const boneCount = Array.isArray(m.rigBones) ? m.rigBones.length : 0;
  if (fb < 0 || fb >= boneCount || tb < 0 || tb >= boneCount) {
    return { ok: false, reason: "Bone index out of range." };
  }
  const lockedSet = (typeof getLockedBoneSet === "function") ? getLockedBoneSet() : null;
  if (lockedSet && (lockedSet.has(fb) || lockedSet.has(tb))) {
    return { ok: false, reason: "From or To bone is locked." };
  }
  const weights = meshData.weights;
  if (!weights || weights.length === 0) {
    return { ok: false, reason: "Active attachment has no weighted bind." };
  }
  const vCount = Math.floor(weights.length / boneCount);
  let merged = 0;
  for (let v = 0; v < vCount; v += 1) {
    const base = v * boneCount;
    const wf = Number(weights[base + fb]) || 0;
    if (wf <= 0) continue;
    weights[base + tb] = (Number(weights[base + tb]) || 0) + wf;
    weights[base + fb] = 0;
    merged += 1;
  }
  // Drop fromBone from influence list if it appears there (it has 0 weight everywhere now).
  if (att && Array.isArray(att.influenceBones)) {
    att.influenceBones = att.influenceBones.filter((bi) => Number(bi) !== fb);
  }
  return { ok: true, mergedVertices: merged, fromBone: fb, toBone: tb };
}

// Swap: exchange two bones' weight columns for every vertex. Row totals
// preserved automatically. Locked bones blocked.
function swapBoneWeights(boneAIndex, boneBIndex) {
  const a = Number(boneAIndex);
  const b = Number(boneBIndex);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return { ok: false, reason: "Invalid bone index." };
  if (a === b) return { ok: false, reason: "Bones must differ." };
  const ctx = getActiveMeshDataForWeights();
  if (!ctx) return { ok: false, reason: "No active mesh." };
  const { m, meshData } = ctx;
  const boneCount = Array.isArray(m.rigBones) ? m.rigBones.length : 0;
  if (a < 0 || a >= boneCount || b < 0 || b >= boneCount) return { ok: false, reason: "Bone index out of range." };
  const lockedSet = (typeof getLockedBoneSet === "function") ? getLockedBoneSet() : null;
  if (lockedSet && (lockedSet.has(a) || lockedSet.has(b))) {
    return { ok: false, reason: "One of the bones is locked." };
  }
  const weights = meshData.weights;
  if (!weights || weights.length === 0) return { ok: false, reason: "Active attachment has no weighted bind." };
  const vCount = Math.floor(weights.length / boneCount);
  let touched = 0;
  for (let v = 0; v < vCount; v += 1) {
    const base = v * boneCount;
    const wa = Number(weights[base + a]) || 0;
    const wb = Number(weights[base + b]) || 0;
    if (wa === 0 && wb === 0) continue;
    weights[base + a] = wb;
    weights[base + b] = wa;
    touched += 1;
  }
  return { ok: true, swappedVertices: touched, boneA: a, boneB: b };
}

function applyUpdateBindings(opts = {}) {
  const m = state.mesh;
  if (!m) return { ok: false, reason: "No mesh." };
  if (!Array.isArray(m.rigBones) || m.rigBones.length === 0) {
    return { ok: false, reason: "No bones to bind against." };
  }
  // We need the live solved pose (with IK / constraints applied) — that's what
  // the user sees on canvas right now.
  const poseWorld = (typeof getSolvedPoseWorld === "function")
    ? getSolvedPoseWorld(m)
    : (Array.isArray(m.bindWorld) ? m.bindWorld : null);
  const invBindOld = (typeof getDisplayInvBind === "function")
    ? getDisplayInvBind(m)
    : m.invBind;
  if (!Array.isArray(poseWorld) || !Array.isArray(invBindOld)) {
    return { ok: false, reason: "Pose data unavailable." };
  }
  const boneCount = m.rigBones.length;
  const targetSlots = Array.isArray(opts.slots) ? opts.slots : state.slots;
  let slotsUpdated = 0;
  let vCountTotal = 0;
  // Per-bone composite matrix: poseWorld × invBindOld. We need this to map
  // each vertex's old rest position → its current rendered position.
  const compose = new Array(boneCount);
  for (let b = 0; b < boneCount; b += 1) {
    const pw = poseWorld[b];
    const ib = invBindOld[b];
    compose[b] = (pw && ib) ? mul(pw, ib) : null;
  }
  for (const slot of targetSlots) {
    if (!slot) continue;
    const att = (typeof getActiveAttachment === "function") ? getActiveAttachment(slot) : null;
    const md = att && att.meshData;
    if (!md || !md.positions || md.positions.length < 2) continue;
    const weights = md.weights;
    const vCount = Math.floor(md.positions.length / 2);
    if (vCount <= 0) continue;
    // Skip non-weighted attachments — there's nothing to "rebake" for them
    // because their position is fixed in mesh-local space already.
    if (!weights || weights.length === 0 || weights.length !== vCount * boneCount) continue;
    const newPositions = new Float32Array(vCount * 2);
    for (let v = 0; v < vCount; v += 1) {
      const x = Number(md.positions[v * 2]) || 0;
      const y = Number(md.positions[v * 2 + 1]) || 0;
      let sx = 0;
      let sy = 0;
      let totalW = 0;
      for (let b = 0; b < boneCount; b += 1) {
        const w = Number(weights[v * boneCount + b]) || 0;
        if (w <= 0 || !compose[b]) continue;
        const skinned = transformPoint(compose[b], x, y);
        sx += skinned.x * w;
        sy += skinned.y * w;
        totalW += w;
      }
      if (totalW <= 1e-6) {
        // Unweighted vertex — keep its old position.
        newPositions[v * 2] = x;
        newPositions[v * 2 + 1] = y;
      } else {
        newPositions[v * 2] = sx;
        newPositions[v * 2 + 1] = sy;
      }
    }
    md.positions = newPositions;
    // Force buildSlotGeometry caches / dependent arrays to recompute.
    md.deformedScreen = null;
    md.deformedLocal = null;
    md.interleaved = null;
    slotsUpdated += 1;
    vCountTotal += vCount;
  }
  // Now refresh invBind to current pose. After this, poseWorld[b] × invBindNew[b]
  // is identity, so the mesh shows at its newly-baked positions.
  // We don't want syncBindPose to re-snap bones to their current rig (they're
  // already there); we just need invBind = inv(poseWorld).
  m.bindWorld = poseWorld.map((mat) => mat ? mat.slice(0, 6) : null);
  m.invBind = poseWorld.map((mat) => mat ? invert(mat) : null);
  // Mesh-level positions (used when no slots) — same treatment if there are weights.
  if (m.positions && m.weights && m.weights.length === Math.floor(m.positions.length / 2) * boneCount) {
    const vCount = Math.floor(m.positions.length / 2);
    const newP = new Float32Array(vCount * 2);
    for (let v = 0; v < vCount; v += 1) {
      const x = Number(m.positions[v * 2]) || 0;
      const y = Number(m.positions[v * 2 + 1]) || 0;
      let sx = 0;
      let sy = 0;
      let totalW = 0;
      for (let b = 0; b < boneCount; b += 1) {
        const w = Number(m.weights[v * boneCount + b]) || 0;
        if (w <= 0 || !compose[b]) continue;
        const sk = transformPoint(compose[b], x, y);
        sx += sk.x * w; sy += sk.y * w; totalW += w;
      }
      if (totalW <= 1e-6) { newP[v * 2] = x; newP[v * 2 + 1] = y; }
      else { newP[v * 2] = sx; newP[v * 2 + 1] = sy; }
    }
    m.positions = newP;
  }
  return { ok: true, slotsUpdated, vCountTotal, boneCount };
}

function rebuildMesh() {
  if (!state.sourceCanvas) return;
  const cols = math.clamp(Number(els.gridX.value) || 24, 2, 120);
  const rows = math.clamp(Number(els.gridY.value) || 24, 2, 120);
  state.mesh = createMesh(cols, rows, state.imageWidth, state.imageHeight);
  state.selectedBone = 0;
  state.selectedBonesForWeight = [];
  state.selectedIK = -1;
  state.selectedTransform = -1;
  state.selectedPath = -1;
  state.boneMode = (els.boneMode && els.boneMode.value) || "edit";
  state.rigCoordinateSpace = state.boneMode === "edit" ? "edit" : "runtime";
  state.rigEditNeedsRuntimeNormalize = false;
  state.weightMode = els.weightMode.value || "hard";
  state.anim.animations = [createAnimation("Anim 1")];
  state.anim.currentAnimId = state.anim.animations[0].id;
  state.anim.selectedTrack = "";
  state.anim.selectedKey = null;
  state.anim.selectedKeys = [];
  state.anim.trackExpanded = {};
  state.anim.playing = false;
  state.anim.mix.active = false;
  state.anim.dirtyTracks = [];
  state.addBoneArmed = false;
  state.addBoneDraft = null;
  els.addBoneBtn.textContent = "Add Bone";
  refreshSetupQuickActions();
  setAnimTime(0);
  refreshAnimationUI();
  updatePlaybackButtons();
  for (const s of state.slots) {
    if (!s) continue;
    const att = getActiveAttachment(s);
    if (att) att.meshData = null;
    ensureSlotMeshData(s, state.mesh);
  }
  rebuildSlotTriangleIndices();
  if (hasGL) {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, state.mesh.indices, gl.STATIC_DRAW);
  }
  updateBoneUI();
  setStatus(`Mesh rebuilt: ${cols} x ${rows}, bones: ${state.mesh.rigBones.length}`);
}

function refreshWeightsForBoneCount() {
  const m = state.mesh;
  if (!m) return;
  const vCount = getVertexCount(m);
  m.weights = allocWeights(vCount, m.rigBones.length);
  autoWeightMesh(m);
  for (const s of state.slots) {
    if (!s) continue;
    rebuildSlotWeights(s, m);
  }
}

function autoWeightActiveSlot(slotBindingMode = "weighted") {
  const m = state.mesh;
  if (!m) return 0;
  // Sync bind pose so invBind matches current bone positions before computing weights.
  syncBindPose(m);
  if (state.slots.length === 0) {
    autoWeightMesh(m);
    return 1;
  }
  const bindMode = slotBindingMode === "single" ? "single" : "weighted";
  const targetSlotIndices = getSelectedSlotIndicesForAutoWeight();
  if (targetSlotIndices.length <= 0) return 0;
  const picked = getSelectedBonesForWeight(m);
  const expandedPicked = expandSelectedBonesToSubtrees(m, picked);
  // When no bones are explicitly selected, use ALL bones so re-weighting starts fresh
  // instead of reusing the previous influence set (which would make old weights "sticky").
  const allBoneIndices = m.rigBones.map((_, i) => i);
  let updated = 0;
  for (const si of targetSlotIndices) {
    const slot = state.slots[si];
    if (!slot) continue;
    ensureSlotMeshData(slot, m);
    const currentBone = Number(slot.bone);
    const slotHadNoBone = !Number.isFinite(currentBone) || currentBone < 0 || currentBone >= m.rigBones.length;
    if (bindMode === "weighted" && slotHadNoBone) {
      const anchorBone = createTempBoneForSlot(slot, "slot_auto");
      if (Number.isFinite(anchorBone) && anchorBone >= 0 && anchorBone < m.rigBones.length) {
        slot.bone = anchorBone;
      }
    }
    // If bones explicitly selected use those; otherwise use ALL bones for a clean re-weight.
    const allowedBones = expandedPicked.length > 0 ? [...new Set(expandedPicked)] : [...allBoneIndices];
    if (bindMode === "weighted" && allowedBones.length <= 0) {
      const b = Number(slot.bone);
      if (Number.isFinite(b) && b >= 0 && b < m.rigBones.length) allowedBones.push(b);
    }
    const att = getActiveAttachment(slot);
    if (!att || !att.meshData) { updated += 1; continue; }
    // Clear weights fully so no residue from previous runs survives.
    const vCount = att.meshData.positions.length / 2;
    att.meshData.weights = new Float32Array(vCount * m.rigBones.length);
    att.influenceBones = allowedBones;
    att.useWeights = true;
    att.weightBindMode = "auto";
    att.weightMode = "weighted";
    const transpOpts = buildTransparencyOptionsForSlot(slot, m);
    att.meshData.weights = autoWeightForPositions(
      getSlotWeightedAutoWeightPositions(slot, m),
      m.rigBones,
      allowedBones,
      {
        indices: att.meshData.indices,
        maxInfluences: 3,
        distanceRatioCutoff: 3.8,
        smoothIters: 3,
        smoothLambda: 0.5,
        crossBranchPenalty: 0.16,
        ...(transpOpts || {}),
      }
    );
    if (bindMode === "single") {
      const dominant = getSlotBaseSpaceBoneIndex(slot, m);
      const fallbackBone = Number.isFinite(slot.bone) && slot.bone >= 0 && slot.bone < m.rigBones.length
        ? Number(slot.bone)
        : Number.isFinite(state.selectedBone) && state.selectedBone >= 0 && state.selectedBone < m.rigBones.length
          ? Number(state.selectedBone)
          : allowedBones.length > 0
            ? Number(allowedBones[0])
            : -1;
      const targetBone = Number.isFinite(dominant) && dominant >= 0 ? dominant : fallbackBone;
      slot.bone = Number.isFinite(targetBone) && targetBone >= 0 ? targetBone : -1;
      setSlotSingleBoneWeight(slot, m, slot.bone);
    } else {
      // For weighted mode, update slot.bone to the dominant bone so it appears under
      // the correct bone in the tree after re-weighting.
      const dominant = getSlotBaseSpaceBoneIndex(slot, m);
      if (Number.isFinite(dominant) && dominant >= 0 && dominant < m.rigBones.length) {
        slot.bone = dominant;
      }
    }
    updated += 1;
  }
  if (updated > 0) refreshSlotUI();
  return updated;
}

function isValidParent(bones, index, parent) {
  if (parent < 0 || parent >= bones.length) return true;
  if (parent === index) return false;
  let p = parent;
  while (p >= 0) {
    if (p === index) return false;
    p = bones[p].parent;
  }
  return true;
}

function ensureSelectedBoneInRange() {
  const m = state.mesh;
  if (!m) return;
  if (m.rigBones.length === 0) {
    state.selectedBone = -1;
    state.selectedBonesForWeight = [];
  } else {
    if (!Number.isFinite(state.selectedBone) || state.selectedBone < -1) {
      state.selectedBone = -1;
    } else if (state.selectedBone >= m.rigBones.length) {
      state.selectedBone = m.rigBones.length - 1;
    }
    state.selectedBonesForWeight = getSelectedBonesForWeight(m);
    if (state.selectedBone >= 0 && state.selectedBonesForWeight.length === 0) {
      state.selectedBonesForWeight = [state.selectedBone];
    }
  }
}

function updateBoneSelectors() {
  const m = state.mesh;
  els.boneSelect.innerHTML = "";
  els.boneParent.innerHTML = "";
  els.addBoneParent.innerHTML = "";
  if (!m) return;
  const bones = getActiveBones(m);

  for (let i = 0; i < bones.length; i += 1) {
    const b = bones[i];
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = `${i}: ${b.name}${b.connected ? " [C]" : " [D]"}`;
    els.boneSelect.appendChild(opt);
  }

  const none = document.createElement("option");
  none.value = "-1";
  none.textContent = "-1: None (Root)";
  els.boneParent.appendChild(none);
  const addNone = document.createElement("option");
  addNone.value = "-1";
  addNone.textContent = "-1: None (Root)";
  els.addBoneParent.appendChild(addNone);

  for (let i = 0; i < bones.length; i += 1) {
    const b = bones[i];
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = `${i}: ${b.name}`;
    els.boneParent.appendChild(opt);
    const addOpt = document.createElement("option");
    addOpt.value = String(i);
    addOpt.textContent = `${i}: ${b.name}`;
    els.addBoneParent.appendChild(addOpt);
  }
  // Weld / Swap selects (mesh tab → Weights → Weld). Empty + bone list.
  if (els.weightWeldFromBone) {
    const prev = els.weightWeldFromBone.value;
    els.weightWeldFromBone.innerHTML = "";
    for (let i = 0; i < bones.length; i += 1) {
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = `${i}: ${bones[i].name}`;
      els.weightWeldFromBone.appendChild(opt);
    }
    if (prev) els.weightWeldFromBone.value = prev;
  }
  if (els.weightWeldToBone) {
    const prev = els.weightWeldToBone.value;
    els.weightWeldToBone.innerHTML = "";
    for (let i = 0; i < bones.length; i += 1) {
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = `${i}: ${bones[i].name}`;
      els.weightWeldToBone.appendChild(opt);
    }
    if (prev) els.weightWeldToBone.value = prev;
  }
  refreshIKUI();
  refreshTransformUI();
  refreshPathUI();
}

function refreshBoneTreeFilterUI() {
  const deleteInfo = getSelectedBoneDeleteInfo();
  const canDeleteBone = deleteInfo.canDelete;
  if (els.boneTreeAddBoneBtn) {
    els.boneTreeAddBoneBtn.disabled = !state.mesh || state.boneMode !== "edit";
  }
  if (els.boneTreeDeleteBoneBtn) {
    els.boneTreeDeleteBoneBtn.disabled = !canDeleteBone;
    const boundCount = deleteInfo.slotIndices.length;
    els.boneTreeDeleteBoneBtn.title =
      deleteInfo.mode === "subtree"
        ? boundCount > 0
          ? `Delete selected root bone tree and move ${boundCount} bound slot(s) to staging.`
          : "Delete selected root bone tree (slots -> staging)."
        : boundCount > 0
          ? `Delete selected bone and move ${boundCount} bound slot(s) to staging.`
          : "Delete selected bone (slots -> staging).";
  }
  if (els.boneTreeDeleteBoneMenuBtn) {
    els.boneTreeDeleteBoneMenuBtn.disabled = !canDeleteBone;
  }
  if (els.boneTreeOnlyActiveSlotBtn) {
    const on = !!state.boneTreeOnlyActiveSlot;
    els.boneTreeOnlyActiveSlotBtn.classList.toggle("active", on);
    els.boneTreeOnlyActiveSlotBtn.textContent = on ? "Show All Slots" : "Only Active Slot";
    els.boneTreeOnlyActiveSlotBtn.title = on ? "Currently showing only active slot in tree." : "Show only current active slot in tree.";
    els.boneTreeOnlyActiveSlotBtn.disabled = state.slots.length <= 1;
  }
  if (els.boneTreeHideScopeBtn) {
    const mode = getGlobalBoneWorkHideMode();
    const slotMode = mode === "bone_and_slots";
    els.boneTreeHideScopeBtn.classList.toggle("active", slotMode);
    els.boneTreeHideScopeBtn.textContent = slotMode ? "Hide Scope: Bone+Slot" : "Hide Scope: Bone";
    els.boneTreeHideScopeBtn.title = slotMode
      ? "Global hide scope: hidden bones also hide their slots."
      : "Global hide scope: hidden bones do not hide slots.";
    els.boneTreeHideScopeBtn.disabled = !state.mesh;
  }
  if (els.boneTreeBindSelectedUnassignedBtn) {
    const selected = getSelectedUnassignedSlotIndices();
    els.boneTreeBindSelectedUnassignedBtn.disabled = !state.mesh || selected.length <= 0;
    els.boneTreeBindSelectedUnassignedBtn.textContent =
      selected.length > 1 ? `Bind Staging (${selected.length})` : "Bind Staging";
    els.boneTreeBindSelectedUnassignedBtn.style.display = "";
  }
  refreshBoneDeleteQuickMenuUI();
}

function closeBoneDeleteQuickMenu() {
  if (els.boneTreeDeleteBoneMenu) els.boneTreeDeleteBoneMenu.classList.add("collapsed");
  if (els.boneTreeDeleteBoneMenuBtn) els.boneTreeDeleteBoneMenuBtn.setAttribute("aria-expanded", "false");
}

function openBoneDeleteQuickMenu() {
  refreshBoneDeleteQuickMenuUI();
  if (els.boneTreeDeleteBoneMenu) els.boneTreeDeleteBoneMenu.classList.remove("collapsed");
  if (els.boneTreeDeleteBoneMenuBtn) els.boneTreeDeleteBoneMenuBtn.setAttribute("aria-expanded", "true");
}

function toggleBoneDeleteQuickMenu() {
  if (!els.boneTreeDeleteBoneMenu) return;
  const open = !els.boneTreeDeleteBoneMenu.classList.contains("collapsed");
  if (open) closeBoneDeleteQuickMenu();
  else openBoneDeleteQuickMenu();
}

function refreshBoneDeleteQuickMenuUI() {
  const deleteInfo = getSelectedBoneDeleteInfo();
  const canDeleteBone = deleteInfo.canDelete;
  const boundCount = deleteInfo.slotIndices.length;
  if (els.boneTreeDeleteBoneToStagingBtn) {
    els.boneTreeDeleteBoneToStagingBtn.disabled = !canDeleteBone;
    els.boneTreeDeleteBoneToStagingBtn.textContent =
      deleteInfo.mode === "subtree"
        ? boundCount > 0 ? `Delete Bone Tree (Slots -> Staging, ${boundCount})` : "Delete Bone Tree (Slots -> Staging)"
        : boundCount > 0 ? `Delete Bone (Slots -> Staging, ${boundCount})` : "Delete Bone (Slots -> Staging)";
  }
  if (els.boneTreeDeleteBoneWithSlotsBtn) {
    els.boneTreeDeleteBoneWithSlotsBtn.disabled = !canDeleteBone;
    els.boneTreeDeleteBoneWithSlotsBtn.textContent =
      deleteInfo.mode === "subtree"
        ? boundCount > 0 ? `Delete Bone Tree + Delete Slots (${boundCount})` : "Delete Bone Tree + Delete Slots"
        : boundCount > 0 ? `Delete Bone + Delete Slots (${boundCount})` : "Delete Bone + Delete Slots";
  }
}

function isBoneTreeInlineRename(kind, index, attachmentName) {
  const rename = state.boneTreeInlineRename || { kind: "", index: -1 };
  if (rename.kind !== kind) return false;
  if (kind === "attachment") {
    return Number(rename.index) === Number(index) && rename.attachmentName === attachmentName;
  }
  return Number(rename.index) === Number(index);
}

function focusBoneTreeInlineRenameInput(kind, index, attachmentName) {
  if (!els.boneTree) return;
  const idx = Number(index);
  if (!Number.isFinite(idx)) return;
  let selector;
  if (kind === "attachment") {
    selector = `input.tree-rename-input[data-rename-kind="attachment"][data-rename-index="${idx}"][data-rename-att="${CSS.escape(String(attachmentName || ""))}"]`;
  } else {
    selector = `input.tree-rename-input[data-rename-kind="${kind}"][data-rename-index="${idx}"]`;
  }
  const input = els.boneTree.querySelector(selector);
  if (!(input instanceof HTMLInputElement)) return;
  input.focus();
  input.select();
}

function clearBoneTreeInlineRename(skipRender = false) {
  state.boneTreeInlineRename = { kind: "", index: -1, attachmentName: "" };
  if (!skipRender) renderBoneTree();
}

function commitBoneTreeInlineRename(kind, index, nextRaw, attachmentName) {
  const idx = Number(index);
  if (!Number.isFinite(idx) || idx < 0) {
    clearBoneTreeInlineRename();
    return false;
  }
  const next = String(nextRaw || "").trim();
  if (!next) {
    setStatus("Name cannot be empty.");
    requestAnimationFrame(() => focusBoneTreeInlineRenameInput(kind, idx, attachmentName));
    return false;
  }

  if (kind === "slot") {
    if (idx >= state.slots.length || !state.slots[idx]) {
      clearBoneTreeInlineRename();
      return false;
    }
    const slot = state.slots[idx];
    const current = String(slot.name || "").trim() || `slot_${idx}`;
    if (next === current) {
      clearBoneTreeInlineRename();
      return false;
    }
    slot.name = next;
    clearBoneTreeInlineRename(true);
    refreshSlotUI();
    renderBoneTree();
    pushUndoCheckpoint(true);
    setStatus(`Slot renamed: ${next}`);
    return true;
  }

  if (kind === "bone") {
    const m = state.mesh;
    if (!m || !Array.isArray(m.rigBones) || idx >= m.rigBones.length || !m.rigBones[idx]) {
      clearBoneTreeInlineRename();
      return false;
    }
    const bone = m.rigBones[idx];
    const current = String(bone.name || "").trim() || `bone_${idx}`;
    if (next === current) {
      clearBoneTreeInlineRename();
      return false;
    }
    bone.name = next;
    clearBoneTreeInlineRename(true);
    updateBoneUI();
    pushUndoCheckpoint(true);
    setStatus(`Bone renamed: ${next}`);
    return true;
  }

  if (kind === "attachment") {
    if (idx >= state.slots.length || !state.slots[idx]) {
      clearBoneTreeInlineRename();
      return false;
    }
    const slot = state.slots[idx];
    const currentAttName = String(attachmentName || "");
    const att = getSlotAttachmentEntry(slot, currentAttName);
    if (!att) {
      clearBoneTreeInlineRename();
      return false;
    }
    if (next === currentAttName) {
      clearBoneTreeInlineRename();
      return false;
    }
    const used = new Set(ensureSlotAttachments(slot).map((a) => a.name).filter((n) => n !== currentAttName));
    let finalName = next;
    if (used.has(finalName)) {
      let i = 2;
      let cand = `${finalName}_${i}`;
      while (used.has(cand)) { i += 1; cand = `${finalName}_${i}`; }
      finalName = cand;
    }
    att.name = finalName;
    if (slot.attachmentName === currentAttName) slot.attachmentName = finalName;
    if (slot.activeAttachment === currentAttName) slot.activeAttachment = finalName;
    if (slot.id) {
      for (const skin of ensureSkinSets()) {
        if (!skin) continue;
        if (skin.slotAttachments && skin.slotAttachments[slot.id] === currentAttName) skin.slotAttachments[slot.id] = finalName;
        const phMap = skin.slotPlaceholderAttachments && skin.slotPlaceholderAttachments[slot.id];
        if (phMap && typeof phMap === "object") {
          for (const [ph, val] of Object.entries(phMap)) {
            if (val === currentAttName) phMap[ph] = finalName;
          }
        }
      }
    }
    const anim = getCurrentAnimation();
    if (anim && anim.tracks) {
      for (const trackId of Object.keys(anim.tracks)) {
        const p = parseTrackId(trackId);
        if (!p || p.type !== "slot" || p.prop !== "attachment" || p.slotIndex !== idx) continue;
        const keys = getTrackKeys(anim, trackId);
        for (const k of keys) {
          if (k && typeof k.value === "string" && k.value === currentAttName) k.value = finalName;
        }
        normalizeTrackKeys(anim, trackId);
      }
    }
    clearBoneTreeInlineRename(true);
    refreshSlotUI();
    renderBoneTree();
    renderTimelineTracks();
    pushUndoCheckpoint(true);
    setStatus(`Attachment renamed: ${currentAttName} -> ${finalName}`);
    return true;
  }

  clearBoneTreeInlineRename();
  return false;
}

function startBoneTreeInlineRename(kind, index, attachmentName) {
  const idx = Number(index);
  if (!Number.isFinite(idx) || idx < 0) return false;
  if (kind === "slot") {
    if (idx >= state.slots.length || !state.slots[idx]) return false;
    if (state.activeSlot !== idx) setActiveSlot(idx);
    setRightPropsFocus("slot");
  } else if (kind === "bone") {
    const m = state.mesh;
    if (!m || !Array.isArray(m.rigBones) || idx >= m.rigBones.length || !m.rigBones[idx]) return false;
    if (state.selectedBone !== idx) {
      state.selectedBone = idx;
      state.selectedBonesForWeight = [idx];
      updateBoneUI();
    }
    setRightPropsFocus("bone");
  } else if (kind === "attachment") {
    if (idx >= state.slots.length || !state.slots[idx]) return false;
    const slot = state.slots[idx];
    if (!getSlotAttachmentEntry(slot, String(attachmentName || ""))) return false;
    if (state.activeSlot !== idx) setActiveSlot(idx);
    slot.activeAttachment = String(attachmentName);
    setRightPropsFocus("attachment");
  } else {
    return false;
  }
  state.boneTreeInlineRename = { kind, index: idx, attachmentName: String(attachmentName || "") };
  renderBoneTree();
  requestAnimationFrame(() => focusBoneTreeInlineRenameInput(kind, idx, attachmentName));
  return true;
}

function renderBoneTree() {
  const m = state.mesh;
  if (!els.boneTree) return;
  if (els.boneTreeBindSelectedUnassignedBtn && els.boneTreeBindSelectedUnassignedBtn.parentNode) {
    els.boneTreeBindSelectedUnassignedBtn.remove();
  }
  els.boneTree.innerHTML = "";
  refreshBoneTreeFilterUI();
  const bones = m && m.rigBones ? m.rigBones : [];
  const hasBones = bones.length > 0;
  const activeBones = m ? getActiveBones(m) : [];
  if (!hasBones && state.slots.length === 0) {
    els.boneTree.innerHTML = "<div class='muted'>No bones or slots yet.</div>";
    return;
  }

  const slotsByBone = new Map();
  const selectedUnassignedIds = new Set(
    (Array.isArray(state.boneTreeSelectedUnassignedSlotIds) ? state.boneTreeSelectedUnassignedSlotIds : []).map((v) => String(v))
  );
  const autoWeightTargetSlots = new Set(getSelectedSlotIndicesForAutoWeight());
  for (let i = 0; i < state.slots.length; i += 1) {
    const s = state.slots[i];
    const b = getSlotTreeBoneIndex(s, m);
    if (!slotsByBone.has(b)) slotsByBone.set(b, []);
    slotsByBone.get(b).push(i);
  }
  const byParent = new Map();
  const ikBones = getIkConstrainedBoneSet(m);
  const ikTargets = getIkTargetBoneSet(m);
  const tfcBones = getTransformConstrainedBoneSet(m);
  const tfcTargets = getTransformTargetBoneSet(m);
  const pathBones = getPathConstrainedBoneSet(m);
  const pathTargets = getPathTargetBoneSet(m);
  for (let i = 0; i < bones.length; i += 1) {
    const p = bones[i].parent;
    if (!byParent.has(p)) byParent.set(p, []);
    byParent.get(p).push(i);
  }

  const isTreeSlotVisible = (slotIndex) => {
    if (!state.boneTreeOnlyActiveSlot) return true;
    return Number(slotIndex) === Number(state.activeSlot);
  };

  const makeRenameInput = (kind, index, currentValue, attachmentName) => {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "tree-rename-input";
    input.dataset.renameKind = kind;
    input.dataset.renameIndex = String(index);
    if (kind === "attachment") input.dataset.renameAtt = String(attachmentName || "");
    input.value = String(currentValue || "");
    input.autocomplete = "off";
    input.spellcheck = false;
    input.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") {
        ev.preventDefault();
        commitBoneTreeInlineRename(kind, index, input.value, attachmentName);
        return;
      }
      if (ev.key === "Escape") {
        ev.preventDefault();
        clearBoneTreeInlineRename();
      }
    });
    input.addEventListener("blur", () => {
      commitBoneTreeInlineRename(kind, index, input.value, attachmentName);
    });
    return input;
  };

  function appendSlotRows(parentBone, depth) {
    const list = slotsByBone.get(parentBone) || [];
    for (const si of list) {
      if (!isTreeSlotVisible(si)) continue;
      const s = state.slots[si];
      const isActiveSlot = state.activeSlot === si;
      const selectedForBone = getSelectedSlotIndexForBone(parentBone) === si;
      const stagedSelected = parentBone < 0 && s && s.id != null && selectedUnassignedIds.has(String(s.id));
      const autoWeightTargeted = autoWeightTargetSlots.has(si);
      const hiddenByBone = isSlotHiddenByBoneVisibility(s);
      const row = document.createElement("div");
      row.className = `tree-item tree-slot${isActiveSlot ? " active-slot" : ""}${selectedForBone ? " bone-slot-picked" : ""}${stagedSelected ? " staging-slot-picked" : ""
        }${autoWeightTargeted ? " auto-weight-target" : ""
        }${hiddenByBone ? " slot-hidden-by-bone" : ""
        }`;
      row.style.setProperty("--tree-row-depth", String(depth));
      row.style.setProperty("--tree-row-extra", "16");
      row.dataset.slotIndex = String(si);
      row.dataset.slotDraggable = "1";
      row.draggable = true;
      row.title = "A = active slot, B = selected slot for this bone, orange highlight = Auto Weight target. Drag to reorder/reassign, double-click to rename.";
      const eye = document.createElement("button");
      eye.type = "button";
      eye.className = "slot-eye";
      eye.dataset.slotEye = String(si);
      eye.title = isSlotEditorVisible(s) ? "Hide slot in editor" : "Show slot in editor";
      eye.textContent = isSlotEditorVisible(s) ? "👁ˢ" : "👁̶ˢ";
      const editing = isBoneTreeInlineRename("slot", si);
      const slotIcon = document.createElement("span");
      slotIcon.className = "tree-type-icon tree-type-icon-slot";
      slotIcon.textContent = "◆";
      slotIcon.title = "Slot";
      const prefix = document.createElement("span");
      prefix.className = "tree-slot-prefix";
      if (parentBone < 0) {
        prefix.textContent = isActiveSlot ? "A" : "·";
      } else {
        prefix.textContent = isActiveSlot && selectedForBone ? "A/B" : isActiveSlot ? "A" : selectedForBone ? "B" : "";
      }
      row.appendChild(eye);
      row.appendChild(slotIcon);
      if (prefix.textContent) row.appendChild(prefix);
      if (editing) {
        const input = makeRenameInput("slot", si, s.name || `slot_${si}`);
        row.appendChild(input);
      } else {
        const name = document.createElement("span");
        name.className = "tree-slot-name";
        name.textContent = s.name;
        row.appendChild(name);
      }

      /* --- Attachment toggle button on slot row --- */
      const attList = ensureSlotAttachments(s);
      if (attList.length > 1) {
        const attCollapsed = !!state.boneTreeAttachmentCollapse[si];
        const attToggle = document.createElement("button");
        attToggle.type = "button";
        attToggle.className = "tree-slot-att-toggle";
        attToggle.dataset.slotAttToggle = String(si);
        attToggle.textContent = attCollapsed ? `▸${attList.length}` : `▾${attList.length}`;
        attToggle.title = attCollapsed
          ? `Expand ${attList.length} attachment(s)`
          : `Collapse ${attList.length} attachment(s)`;
        row.appendChild(attToggle);
      }

      /* --- Hover quick actions on slot row (Spine-style) --- */
      const slotHoverActions = document.createElement("span");
      slotHoverActions.className = "tree-row-actions";
      const addAttBtn = document.createElement("button");
      addAttBtn.type = "button";
      addAttBtn.className = "tree-row-action-btn";
      addAttBtn.dataset.slotAddAttachment = String(si);
      addAttBtn.textContent = "+";
      addAttBtn.title = "Add attachment to this slot";
      slotHoverActions.appendChild(addAttBtn);
      const renameSlotBtn = document.createElement("button");
      renameSlotBtn.type = "button";
      renameSlotBtn.className = "tree-row-action-btn";
      renameSlotBtn.dataset.slotRename = String(si);
      renameSlotBtn.textContent = "✎";
      renameSlotBtn.title = "Rename slot";
      slotHoverActions.appendChild(renameSlotBtn);
      row.appendChild(slotHoverActions);

      els.boneTree.appendChild(row);

      /* --- Attachment child rows --- */
      const attCollapsed = !!state.boneTreeAttachmentCollapse[si];
      if (!attCollapsed) {
        const slotAttachments = ensureSlotAttachments(s);
        const currentAttName = getSlotCurrentAttachmentName(s);
        const typeMap = { region: "R", mesh: "M", linkedmesh: "LM", boundingbox: "BB", clipping: "CL", point: "PT" };
        const iconMap = { region: "□", mesh: "◇", linkedmesh: "◈", boundingbox: "▭", clipping: "✂", point: "•" };
        for (let ai = 0; ai < slotAttachments.length; ai += 1) {
          const att = slotAttachments[ai];
          const isActive = att.name === currentAttName;
          const isRenaming = isBoneTreeInlineRename("attachment", si, att.name);
          const attRow = document.createElement("div");
          attRow.className = `tree-item tree-attachment${isActive ? " active-attachment" : ""}`;
          attRow.style.setProperty("--tree-row-depth", String(depth));
          attRow.style.setProperty("--tree-row-extra", "32");
          attRow.dataset.slotIndex = String(si);
          attRow.dataset.attachmentName = att.name;
          attRow.dataset.attachmentIndex = String(ai);
          attRow.draggable = true;
          attRow.title = `Attachment: ${att.name} (${normalizeAttachmentType(att.type)})${isActive ? " — ACTIVE" : ""}. Drag to reorder. Double-click to rename.`;

          const dot = document.createElement("span");
          dot.className = "att-active-dot";
          attRow.appendChild(dot);

          const attType = normalizeAttachmentType(att.type);
          const typeIcon = document.createElement("span");
          typeIcon.className = "tree-type-icon tree-type-icon-attachment";
          typeIcon.textContent = iconMap[attType] || "□";
          typeIcon.title = typeMap[attType] || "R";
          attRow.appendChild(typeIcon);

          const typeBadge = document.createElement("span");
          typeBadge.className = "att-type-badge";
          typeBadge.textContent = typeMap[attType] || "R";
          attRow.appendChild(typeBadge);

          if (isRenaming) {
            const input = makeRenameInput("attachment", si, att.name, att.name);
            attRow.appendChild(input);
          } else {
            const attNameSpan = document.createElement("span");
            attNameSpan.className = "att-name";
            attNameSpan.textContent = att.name;
            attRow.appendChild(attNameSpan);
          }

          /* --- Hover quick actions on attachment row (Spine-style) --- */
          const attHoverActions = document.createElement("span");
          attHoverActions.className = "tree-row-actions";
          const renameAttBtn = document.createElement("button");
          renameAttBtn.type = "button";
          renameAttBtn.className = "tree-row-action-btn";
          renameAttBtn.dataset.attRename = String(si);
          renameAttBtn.dataset.attName = att.name;
          renameAttBtn.textContent = "✎";
          renameAttBtn.title = "Rename attachment";
          attHoverActions.appendChild(renameAttBtn);
          if (slotAttachments.length > 1) {
            const delAttBtn = document.createElement("button");
            delAttBtn.type = "button";
            delAttBtn.className = "tree-row-action-btn tree-row-action-danger";
            delAttBtn.dataset.attDelete = String(si);
            delAttBtn.dataset.attName = att.name;
            delAttBtn.textContent = "✕";
            delAttBtn.title = "Delete attachment";
            attHoverActions.appendChild(delAttBtn);
          }
          attRow.appendChild(attHoverActions);

          els.boneTree.appendChild(attRow);
        }
      }
    }
  }


  function appendUnassignedSection() {
    const list = (slotsByBone.get(-1) || []).filter((si) => isTreeSlotVisible(si));
    if (list.length <= 0) {
      if (els.boneTreeBindSelectedUnassignedBtn) els.boneTreeBindSelectedUnassignedBtn.style.display = "none";
      return;
    }
    const head = document.createElement("div");
    head.className = "tree-item tree-unassigned-head";
    head.dataset.slotStagingDrop = "1";
    head.title = "Unassigned slots staging area. Drag slot here to unbind from bone.";
    const name = document.createElement("span");
    name.className = "tree-unassigned-title";
    name.textContent = `Unassigned / Staging Slots (${list.length})`;
    head.appendChild(name);
    if (els.boneTreeBindSelectedUnassignedBtn) {
      head.appendChild(els.boneTreeBindSelectedUnassignedBtn);
    }
    els.boneTree.appendChild(head);
    appendSlotRows(-1, 0);
  }

  function walk(parent, depth) {
    const kids = byParent.get(parent) || [];
    for (const i of kids) {
      const b = bones[i];
      const row = document.createElement("div");
      const picked = state.selectedBonesForWeight && state.selectedBonesForWeight.includes(i);
      const parentCandidate = state.parentPickArmed && state.parentHoverBone === i;
      const ikTargetCandidate = state.ikPickArmed && state.ikHoverBone === i;
      const isIK = ikBones.has(i);
      const isIKTarget = ikTargets.has(i);
      const isTFC = tfcBones.has(i);
      const isTFCTarget = tfcTargets.has(i);
      const isPath = pathBones.has(i);
      const isPathTarget = pathTargets.has(i);
      const hiddenWork = isBoneWorkspaceHidden(m, i);
      const hiddenWorkSlots = hiddenWork && getGlobalBoneWorkHideMode() === "bone_and_slots";
      const hiddenAnim = state.boneMode === "pose" && isBoneAnimationHidden(activeBones, i);
      row.className = `tree-item${state.selectedBone === i ? " selected" : ""}${picked ? " weight-picked" : ""}${parentCandidate ? " parent-candidate" : ""
        }${ikTargetCandidate ? " ik-target-candidate" : ""}${isIK ? " ik-bone" : ""}${isIKTarget ? " ik-target-bone" : ""}${isTFC ? " ik-bone" : ""
        }${isTFCTarget ? " ik-target-bone" : ""}${isPath ? " ik-bone" : ""}${isPathTarget ? " ik-target-bone" : ""}${hiddenWork || hiddenAnim ? " bone-hidden" : ""
        }`;
      row.style.setProperty("--tree-row-depth", String(depth));
      row.style.setProperty("--tree-row-extra", "0");
      row.dataset.boneIndex = String(i);
      row.dataset.rootBone = isRootBoneIndex(bones, i) ? "1" : "0";
      const slotCount = (slotsByBone.get(i) || []).length;
      const childCount = (byParent.get(i) || []).length;
      const isRootBone = isRootBoneIndex(bones, i);
      const slotCollapsed = !!state.boneTreeSlotCollapse[i];
      const childCollapsed = !!state.boneTreeChildCollapse[i];
      const childBtn = document.createElement("button");
      childBtn.type = "button";
      childBtn.className = "tree-bone-child-toggle";
      childBtn.dataset.boneChildToggle = String(i);
      childBtn.textContent = childCollapsed ? "+" : "-";
      childBtn.title =
        childCount > 0
          ? childCollapsed
            ? `Expand ${childCount} child bone(s)`
            : `Collapse ${childCount} child bone(s)`
          : "No child bones";
      childBtn.disabled = childCount <= 0;
      row.appendChild(childBtn);

      normalizeBoneChannels(b);
      const workBtn = document.createElement("button");
      workBtn.type = "button";
      workBtn.className = `tree-bone-hide-toggle ${b.workHidden ? "active" : ""}`.trim();
      workBtn.dataset.boneWorkHideToggle = String(i);
      workBtn.textContent = b.workHidden ? "👁̶" : "👁";
      const hideScopeLabel = getGlobalBoneWorkHideMode() === "bone_and_slots" ? "bone+slots" : "bone only";
      workBtn.title =
        b.workHidden
          ? `Work eye: hidden (${hideScopeLabel}, subtree, click to show)`
          : `Work eye: visible (click to hide subtree, scope=${hideScopeLabel})`;

      const animHiddenNow = state.boneMode === "pose" && isBoneAnimationHidden(activeBones, i);
      const animBtn = document.createElement("button");
      animBtn.type = "button";
      animBtn.className = `tree-bone-anim-hide-toggle ${animHiddenNow ? "active" : ""}`.trim();
      animBtn.dataset.boneAnimHideToggle = String(i);
      animBtn.textContent = animHiddenNow ? "👁̶ᵃ" : "👁ᵃ";
      animBtn.title =
        state.boneMode === "pose"
          ? "Anim eye key at current time (bone + child bones + slots)"
          : "Switch to Pose mode to set anim eye key";
      animBtn.disabled = state.boneMode !== "pose";

      const slotBtn = document.createElement("button");
      slotBtn.type = "button";
      slotBtn.className = "tree-bone-slot-toggle";
      slotBtn.dataset.boneSlotToggle = String(i);
      slotBtn.textContent = slotCollapsed ? `▸ ${slotCount}` : `▾ ${slotCount}`;
      slotBtn.title =
        slotCount > 0
          ? slotCollapsed
            ? `Expand ${slotCount} slot(s) under this bone`
            : `Collapse ${slotCount} slot(s) under this bone`
          : "No slots under this bone";
      slotBtn.disabled = slotCount <= 0;

      const badgeText = `${isIK ? " [IK]" : ""}${isIKTarget ? " [IK-T]" : ""}${isTFC ? " [TC]" : ""}${isTFCTarget ? " [TC-T]" : ""
        }${isPath ? " [PATH]" : ""}${isPathTarget ? " [PATH-T]" : ""}${hiddenWork ? (hiddenWorkSlots ? " [HS]" : " [H]") : ""}${hiddenAnim ? " [AH]" : ""
        }`;
      const boneIcon = document.createElement("span");
      boneIcon.className = "tree-type-icon tree-type-icon-bone";
      boneIcon.textContent = isRootBone ? "★" : "▸";
      boneIcon.title = isRootBone ? "Root Bone" : "Bone";
      row.appendChild(boneIcon);
      if (isBoneTreeInlineRename("bone", i)) {
        const input = makeRenameInput("bone", i, b.name || `bone_${i}`);
        row.appendChild(input);
        if (badgeText) {
          const badges = document.createElement("span");
          badges.className = "tree-bone-badges";
          badges.textContent = badgeText;
          row.appendChild(badges);
        }
      } else {
        const label = document.createElement("span");
        label.className = "tree-bone-name";
        label.textContent = `${b.name}${badgeText}`;
        row.appendChild(label);
      }
      const post = document.createElement("span");
      post.className = "tree-bone-post-controls";
      post.appendChild(slotBtn);
      if (isRootBone) {
        post.appendChild(workBtn);
        post.appendChild(animBtn);
      }
      // Brush bone-lock toggle (visible only while weight brush is active)
      if (state.weightBrush && state.weightBrush.active) {
        const isLocked = isBoneLockedForBrush(i);
        const lockBtn = document.createElement("button");
        lockBtn.type = "button";
        lockBtn.className = `tree-bone-lock-toggle${isLocked ? " active" : ""}`;
        lockBtn.dataset.boneLockToggle = String(i);
        lockBtn.textContent = isLocked ? "🔒" : "🔓";
        lockBtn.title = isLocked
          ? "Brush lock: weights for this bone are protected"
          : "Click to lock this bone's weights from brush";
        post.appendChild(lockBtn);
      }
      row.appendChild(post);

      els.boneTree.appendChild(row);
      if (!slotCollapsed) appendSlotRows(i, depth);
      if (!childCollapsed) walk(i, depth + 1);
    }
  }

  if (hasBones) {
    walk(-1, 0);
    appendUnassignedSection();
  } else {
    appendUnassignedSection();
  }
}

function updateBoneUI() {
  const m = state.mesh;
  if (!m) return;

  ensureSelectedBoneInRange();
  updateBoneSelectors();
  const bones = getActiveBones(m);

  const i = state.selectedBone;
  const b = bones[i];
  if (!b) {
    els.boneName.value = "";
    els.boneParent.value = "-1";
    if (els.boneInherit) els.boneInherit.value = "normal";
    els.boneConnect.value = "true";
    els.bonePoseLen.value = "false";
    els.boneTx.value = "0";
    els.boneTy.value = "0";
    els.boneRot.value = "0";
    els.boneLen.value = "1";
    if (els.boneScaleX) els.boneScaleX.value = "1";
    if (els.boneScaleY) els.boneScaleY.value = "1";
    if (els.boneShearX) els.boneShearX.value = "0";
    if (els.boneShearY) els.boneShearY.value = "0";
    els.boneHeadX.value = "0";
    els.boneHeadY.value = "0";
    els.boneTipX.value = "0";
    els.boneTipY.value = "0";
    refreshIKUI();
    refreshAnimationLayerUI();
    refreshTrackSelect();
    renderTimelineTracks();
    refreshSlotUI();
    renderBoneTree();
    return;
  }
  normalizeBoneChannels(b);
  state.anim.trackExpanded[i] = true;
  const isRootBone = isRootBoneIndex(bones, i);

  els.boneSelect.value = String(i);
  els.boneName.value = b.name;
  if (els.boneColor) {
    const col = typeof b.color === "string" ? b.color.trim() : "";
    els.boneColor.value = col && /^#?[0-9a-fA-F]{6}$/.test(col) ? (col.startsWith("#") ? col : "#" + col) : "#7dd3fc";
    els.boneColor.classList.toggle("color-active", !!col);
  }
  els.boneParent.value = String(b.parent);
  if (els.boneInherit) els.boneInherit.value = normalizeBoneInheritValue(b.inherit);
  if (!els.addBoneParent.value) {
    els.addBoneParent.value = String(i);
  }
  els.boneConnect.value = b.connected ? "true" : "false";
  els.bonePoseLen.value = b.poseLenEditable === false ? "false" : "true";
  els.boneTx.value = String(Math.round(b.tx));
  els.boneTy.value = String(Math.round(b.ty));
  els.boneRot.value = String(Math.round(math.radToDeg(b.rot)));
  els.boneLen.value = String(Math.max(1, Math.round(b.length)));
  if (els.boneScaleX) els.boneScaleX.value = String((Number(b.sx) || 1).toFixed(3));
  if (els.boneScaleY) els.boneScaleY.value = String((Number(b.sy) || 1).toFixed(3));
  if (els.boneShearX) els.boneShearX.value = String(math.radToDeg(Number(b.shx) || 0).toFixed(2));
  if (els.boneShearY) els.boneShearY.value = String(math.radToDeg(Number(b.shy) || 0).toFixed(2));
  const ep = getBoneWorldEndpointsFromBones(bones, i);
  els.boneHeadX.value = String(Math.round(ep.head.x));
  els.boneHeadY.value = String(Math.round(ep.head.y));
  els.boneTipX.value = String(Math.round(ep.tip.x));
  els.boneTipY.value = String(Math.round(ep.tip.y));

  const poseMode = state.boneMode === "pose";
  const deleteInfo = getSelectedBoneDeleteInfo();
  const connectedToParent = b.parent >= 0 && b.connected;
  const poseLenLocked = poseMode && b.poseLenEditable === false;
  els.boneConnect.disabled = b.parent < 0;
  els.boneParent.disabled = poseMode;
  if (els.boneInherit) els.boneInherit.disabled = poseMode;
  els.addBoneBtn.disabled = poseMode;
  els.addBoneParent.disabled = poseMode;
  els.addBoneConnect.disabled = poseMode;
  els.deleteBoneBtn.disabled = poseMode || !deleteInfo.canDelete;
  els.weightMode.disabled = poseMode;
  els.autoWeightBtn.disabled = poseMode;
  els.boneTx.disabled = connectedToParent;
  els.boneTy.disabled = connectedToParent;
  els.boneHeadX.disabled = poseMode && connectedToParent;
  els.boneHeadY.disabled = poseMode && connectedToParent;
  els.boneLen.disabled = poseLenLocked;
  if (els.boneScaleX) els.boneScaleX.disabled = false;
  if (els.boneScaleY) els.boneScaleY.disabled = false;
  if (els.boneShearX) els.boneShearX.disabled = false;
  if (els.boneShearY) els.boneShearY.disabled = false;
  refreshIKUI();
  refreshAnimationLayerUI();
  refreshTrackSelect();
  renderTimelineTracks();
  refreshSlotUI();
  renderBoneTree();
  refreshBoneEditHintBar();
}

function refreshBoneEditHintBar() {
  const bar = els.boneEditHintBar;
  const txt = els.boneEditHintText;
  if (!bar || !txt) return;
  const inBoneEdit = state.editMode === "skeleton" && state.boneMode === "edit";
  if (!inBoneEdit) { bar.hidden = true; return; }
  bar.hidden = false;
  const parts = state.selectedBoneParts || [];
  if (parts.length > 0) {
    const n = parts.length;
    txt.textContent = `${n} part${n > 1 ? "s" : ""} selected  |  drag to move  |  Alt+click: add to selection  |  click empty: deselect`;
  } else {
    txt.textContent = "Click head/tail to select + drag  |  Alt+click: multi-select  |  drag empty: box-select";
  }
}

function resetPose() {
  if (!state.mesh) return;
  if (state.boneMode === "edit") {
    state.mesh.rigBones = [];
    state.rigCoordinateSpace = "edit";
    state.rigEditNeedsRuntimeNormalize = false;
    clearRigEditPreviewCache();
    syncPoseFromRig(state.mesh);
    syncBindPose(state.mesh);
    refreshWeightsForBoneCount();
    state.selectedBone = -1;
    updateBoneUI();
    return;
  }
  syncPoseFromRig(state.mesh);
  updateBoneUI();
}

function resetVertexOffsets() {
  if (!state.mesh) return;
  if (state.slots.length > 0) {
    const slot = getActiveSlot();
    if (!slot) return;
    ensureSlotMeshData(slot, state.mesh);
    const att = getActiveAttachment(slot);
    if (!att || !att.meshData) return;
    att.meshData.offsets.set(att.meshData.baseOffsets);
  } else {
    state.mesh.offsets.set(state.mesh.baseOffsets);
  }
  markDirtyVertexTrack();
}

function addBone(opts = null) {
  const m = state.mesh;
  if (!m || state.boneMode !== "edit") return;
  const bones = getRigBones(m);

  const parent =
    opts && typeof opts.parent === "number"
      ? opts.parent
      : state.selectedBone >= 0
        ? state.selectedBone
        : -1;
  const safeParent = parent >= 0 && parent < bones.length ? parent : -1;
  const parentBone = safeParent >= 0 ? bones[safeParent] : null;
  const len = Math.max(16, Math.round(state.imageWidth * 0.16));
  const connected = opts && typeof opts.connected === "boolean" ? opts.connected : parent >= 0;

  bones.push({
    name: `bone_${bones.length}`,
    parent: safeParent,
    inherit: "normal",
    tx: parentBone ? parentBone.length : state.imageWidth * 0.5,
    ty: 0,
    rot: 0,
    length: len,
    sx: 1,
    sy: 1,
    shx: 0,
    shy: 0,
    connected,
    poseLenEditable: false,
    color: "", // Editor-only visualization tint, e.g. "#ff8800" (empty = default)
  });

  const idx = bones.length - 1;
  if (opts && opts.head && opts.tail) {
    const world = state.boneMode === "edit" ? getEditAwareWorld(bones) : computeWorld(bones);
    const head = safeParent >= 0 && connected ? transformPoint(world[safeParent], bones[safeParent].length, 0) : opts.head;
    setBoneFromWorldEndpoints(bones, idx, head, opts.tail);
  }

  state.selectedBone = idx;
  markRigEditDirty();
  syncPoseFromRig(m);
  syncBindPose(m);
  refreshWeightsForBoneCount();
  updateBoneUI();
  pushUndoCheckpoint(true);
  return idx;
}

function getSlotIndicesBoundToBone(boneIndex) {
  const bi = Number(boneIndex);
  if (!Number.isFinite(bi) || bi < 0) return [];
  const out = [];
  for (let i = 0; i < state.slots.length; i += 1) {
    const s = state.slots[i];
    if (!s) continue;
    if (Number(s.bone) === bi) out.push(i);
  }
  return out;
}

function deleteSlotsByIndices(indices) {
  const list = [...new Set((Array.isArray(indices) ? indices : []).map((v) => Number(v)).filter((v) => Number.isFinite(v) && v >= 0 && v < state.slots.length))].sort((a, b) => b - a);
  if (list.length <= 0) return { removed: 0, names: [] };
  const names = [];
  let nextActive = Number(state.activeSlot);
  for (const idx of list) {
    const removed = state.slots[idx];
    if (!removed) continue;
    const removedId = removed && removed.id ? String(removed.id) : "";
    names.push(removed.name || `slot_${idx}`);
    state.slots.splice(idx, 1);
    removeSlotReferencesFromSkins(removedId);
    remapAnimationTracksForRemovedSlot(idx, removedId);
    if (removedId) {
      for (const s of state.slots) {
        if (!s) continue;
        const att = getActiveAttachment(s);
        if (att && att.clipEndSlotId && String(att.clipEndSlotId) === removedId) att.clipEndSlotId = null;
      }
    }
    if (Number.isFinite(nextActive)) {
      if (nextActive === idx) nextActive = Math.max(0, idx - 1);
      else if (nextActive > idx) nextActive -= 1;
    }
  }
  clearTimelineKeySelection();
  state.anim.selectedTrack = "";
  state.anim.dirtyTracks = [];
  state.boneTreeSelectedUnassignedSlotIds = [];
  if (state.slots.length > 0) {
    const ai = Number.isFinite(nextActive) ? math.clamp(nextActive, 0, state.slots.length - 1) : 0;
    setActiveSlot(ai);
  } else {
    state.activeSlot = -1;
    state.sourceCanvas = null;
    refreshSlotUI();
    renderBoneTree();
  }
  refreshAnimationUI();
  return { removed: list.length, names };
}

function remapBoneTreeSelectionAfterBoneRemoval(indexMap) {
  const selectedByBone = state.boneTreeSelectedSlotByBone || Object.create(null);
  const remappedSelectedByBone = Object.create(null);
  for (const [k, v] of Object.entries(selectedByBone)) {
    const oldIndex = Number(k);
    if (!Number.isFinite(oldIndex) || oldIndex < 0 || !indexMap.has(oldIndex)) continue;
    remappedSelectedByBone[indexMap.get(oldIndex)] = v;
  }
  state.boneTreeSelectedSlotByBone = remappedSelectedByBone;
}

function remapConstraintsAfterBoneRemovalMap(m, indexMap) {
  if (!m) return;
  if (Array.isArray(m.ikConstraints)) {
    m.ikConstraints = m.ikConstraints.map((c) => ({
      ...c,
      bones: Array.isArray(c && c.bones) ? c.bones.map((bi) => indexMap.get(Number(bi))).filter((bi) => Number.isFinite(bi)) : [],
      target: indexMap.has(Number(c && c.target)) ? indexMap.get(Number(c.target)) : -1,
    }));
    ensureIKConstraints(m);
  }
  if (Array.isArray(m.transformConstraints)) {
    m.transformConstraints = m.transformConstraints.map((c) => ({
      ...c,
      bones: Array.isArray(c && c.bones) ? c.bones.map((bi) => indexMap.get(Number(bi))).filter((bi) => Number.isFinite(bi)) : [],
      target: indexMap.has(Number(c && c.target)) ? indexMap.get(Number(c.target)) : -1,
    }));
    ensureTransformConstraints(m);
  }
  if (Array.isArray(m.pathConstraints)) {
    m.pathConstraints = m.pathConstraints.map((c) => ({
      ...c,
      bones: Array.isArray(c && c.bones) ? c.bones.map((bi) => indexMap.get(Number(bi))).filter((bi) => Number.isFinite(bi)) : [],
      target: indexMap.has(Number(c && c.target)) ? indexMap.get(Number(c.target)) : -1,
    }));
    ensurePathConstraints(m);
  }
}

function getSelectedBoneDeleteInfo() {
  const m = state.mesh;
  if (!m || !Array.isArray(m.rigBones)) return { canDelete: false, boneIndex: -1, subtree: [], slotIndices: [], mode: "" };
  const objectDeleteMode = state.editMode === "object" || state.boneMode === "object";
  let selectedIndex = Number(state.selectedBone);
  if (!Number.isFinite(selectedIndex) || selectedIndex < 0 || selectedIndex >= m.rigBones.length) {
    if (objectDeleteMode && m.rigBones.length > 0) selectedIndex = 0;
    else return { canDelete: false, boneIndex: -1, subtree: [], slotIndices: [], mode: "" };
  }
  if (objectDeleteMode) {
    const rootIndex = getBoneRootIndexFromBones(m.rigBones, selectedIndex);
    if (!Number.isFinite(rootIndex) || rootIndex < 0 || rootIndex >= m.rigBones.length) {
      return { canDelete: false, boneIndex: selectedIndex, subtree: [], slotIndices: [], mode: "" };
    }
    const subtree = getBoneSubtreeIndices(m.rigBones, rootIndex);
    const subtreeSet = new Set(subtree);
    const slotIndices = [];
    for (let i = 0; i < state.slots.length; i += 1) {
      const slot = state.slots[i];
      if (!slot) continue;
      if (subtreeSet.has(Number(slot.bone))) slotIndices.push(i);
    }
    return {
      canDelete: subtree.length > 0,
      boneIndex: rootIndex,
      subtree,
      slotIndices,
      mode: "subtree",
    };
  }
  if (state.boneMode === "edit") {
    return {
      canDelete: m.rigBones.length > 0,
      boneIndex: selectedIndex,
      subtree: [selectedIndex],
      slotIndices: getSlotIndicesBoundToBone(selectedIndex),
      mode: "single",
    };
  }
  return { canDelete: false, boneIndex: selectedIndex, subtree: [], slotIndices: [], mode: "" };
}

// ============================================================
// SECTION: Bone CRUD — Add, Delete, Reparent
// ============================================================
function deleteBoneWithSlotPolicy(slotPolicy = "to_staging") {
  const m = state.mesh;
  if (!m || state.boneMode !== "edit") return false;
  const bones = getRigBones(m);
  if (bones.length <= 0) return false;

  const removed = state.selectedBone;
  if (!Number.isFinite(removed) || removed < 0 || removed >= bones.length) return false;
  const boundSlotIndices = getSlotIndicesBoundToBone(removed);
  if (slotPolicy === "delete_slots" && boundSlotIndices.length > 0) {
    deleteSlotsByIndices(boundSlotIndices);
  }
  bones.splice(removed, 1);

  for (const b of bones) {
    if (b.parent === removed) {
      b.parent = -1;
    } else if (b.parent > removed) {
      b.parent -= 1;
    }
  }
  for (const s of state.slots) {
    if (!s) continue;
    if (s.bone === removed) s.bone = -1;
    else if (s.bone > removed) s.bone -= 1;
  }
  const selectedByBone = state.boneTreeSelectedSlotByBone || Object.create(null);
  const remappedSelectedByBone = Object.create(null);
  for (const [k, v] of Object.entries(selectedByBone)) {
    const bi = Number(k);
    if (!Number.isFinite(bi) || bi < 0 || bi === removed) continue;
    remappedSelectedByBone[bi > removed ? bi - 1 : bi] = v;
  }
  state.boneTreeSelectedSlotByBone = remappedSelectedByBone;
  remapIKAfterBoneRemoved(m, removed);
  ensureSlotsHaveBoneBinding();

  if (bones.length > 0) {
    state.selectedBone = Math.min(Math.max(0, removed - 1), bones.length - 1);
    state.selectedBonesForWeight = [state.selectedBone];
  } else {
    state.selectedBone = -1;
    state.selectedBonesForWeight = [];
  }
  markRigEditDirty();
  syncPoseFromRig(m);
  syncBindPose(m);
  refreshWeightsForBoneCount();
  updateBoneUI();
  pushUndoCheckpoint(true);
  return true;
}

function deleteSelectedBoneTreeWithSlotPolicy(slotPolicy = "to_staging") {
  const m = state.mesh;
  if (!m || !Array.isArray(m.rigBones)) return false;
  const info = getSelectedBoneDeleteInfo();
  if (!info.canDelete) return false;
  if (info.mode === "single") return deleteBoneWithSlotPolicy(slotPolicy);
  if (info.mode !== "subtree") return false;

  const removeSet = new Set(info.subtree);
  if (slotPolicy === "delete_slots" && info.slotIndices.length > 0) {
    deleteSlotsByIndices(info.slotIndices);
  }

  for (const slot of state.slots) {
    if (!slot) continue;
    if (removeSet.has(Number(slot.bone))) slot.bone = -1;
  }

  const oldBones = m.rigBones.slice();
  const keptBones = [];
  const indexMap = new Map();
  for (let oldIndex = 0; oldIndex < oldBones.length; oldIndex += 1) {
    if (removeSet.has(oldIndex)) continue;
    indexMap.set(oldIndex, keptBones.length);
    keptBones.push(oldBones[oldIndex]);
  }
  for (const bone of keptBones) {
    const parent = Number(bone && bone.parent);
    bone.parent = indexMap.has(parent) ? indexMap.get(parent) : -1;
  }
  for (const slot of state.slots) {
    if (!slot) continue;
    const oldBone = Number(slot.bone);
    slot.bone = indexMap.has(oldBone) ? indexMap.get(oldBone) : -1;
  }

  m.rigBones = keptBones;
  remapBoneTreeSelectionAfterBoneRemoval(indexMap);
  remapConstraintsAfterBoneRemovalMap(m, indexMap);
  ensureSlotsHaveBoneBinding();

  state.selectedBone = m.rigBones.length > 0 ? 0 : -1;
  state.selectedBonesForWeight = state.selectedBone >= 0 ? [state.selectedBone] : [];
  state.selectedBoneParts = [];
  markRigEditDirty();
  syncPoseFromRig(m);
  syncBindPose(m);
  refreshWeightsForBoneCount();
  updateBoneUI();
  pushUndoCheckpoint(true);
  return true;
}

function deleteBone() {
  return deleteSelectedBoneTreeWithSlotPolicy("to_staging");
}

function commitRigEdit(m, reweight = false) {
  markRigEditDirty();
  syncPoseFromRig(m);
  syncBindPose(m);
  if (reweight) {
    autoWeightMesh(m);
    for (const s of state.slots) {
      if (!s) continue;
      rebuildSlotWeights(s, m);
    }
  }
}

function commitRigEditPreserveCurrentLook(m) {
  if (!m) return;
  markRigEditDirty();
  // Keep current slot appearance stable while editing rig by rebaking slot-local weights,
  // without running global auto-weight redistribution.
  syncPoseFromRig(m);
  syncBindPose(m);
  // While the user is mid-drag, skip rebuildSlotWeights: every pointermove
  // would re-run autoWeightForPositions (weighted slots), which can shift the
  // dominant bone and make slots jump around in the bone tree. Defer the
  // rebuild to the drag-end path (clearDrag). For non-drag callers we still
  // rebuild as before.
  if (state.drag) return;
  for (const s of state.slots) {
    if (!s) continue;
    rebuildSlotWeights(s, m);
  }
}

function getBonesForCurrentMode(m) {
  return state.boneMode === "pose" ? getPoseBones(m) : getRigBones(m);
}

function getBoneSubtreeIndices(bones, rootIndex) {
  if (!Array.isArray(bones) || !Number.isFinite(rootIndex) || rootIndex < 0 || rootIndex >= bones.length) return [];
  const root = Math.floor(rootIndex);
  const out = [root];
  for (let i = 0; i < out.length; i += 1) {
    const parent = out[i];
    for (let bi = 0; bi < bones.length; bi += 1) {
      if (Number(bones[bi] && bones[bi].parent) === parent && !out.includes(bi)) {
        out.push(bi);
      }
    }
  }
  return out;
}

function getBoneRootIndexFromBones(bones, boneIndex) {
  if (!Array.isArray(bones)) return -1;
  let i = Number(boneIndex);
  if (!Number.isFinite(i) || i < 0 || i >= bones.length) return -1;
  i = Math.floor(i);
  let guard = 0;
  while (guard < bones.length) {
    const parent = Number(bones[i] && bones[i].parent);
    if (!Number.isFinite(parent) || parent < 0 || parent >= bones.length) return i;
    i = Math.floor(parent);
    guard += 1;
  }
  return i;
}

function collectObjectModeTargets(m, bones, world, poseWorld) {
  if (!m || !Array.isArray(bones) || bones.length <= 0 || !Array.isArray(world)) return [];
  const targetsByRoot = new Map();
  const ensureTarget = (rootIndex) => {
    if (!Number.isFinite(rootIndex) || rootIndex < 0 || rootIndex >= bones.length) return null;
    const key = Math.floor(rootIndex);
    let t = targetsByRoot.get(key);
    if (!t) {
      const rootHead = transformPoint(world[key], 0, 0);
      const rootScreen = localToScreen(rootHead.x, rootHead.y);
      t = {
        rootIndex: key,
        rootScreen,
        minX: Number.POSITIVE_INFINITY,
        minY: Number.POSITIVE_INFINITY,
        maxX: Number.NEGATIVE_INFINITY,
        maxY: Number.NEGATIVE_INFINITY,
        zOrder: -1,
        slotGeometries: [],
      };
      targetsByRoot.set(key, t);
    }
    return t;
  };
  const includePoint = (target, x, y) => {
    if (!target || !Number.isFinite(x) || !Number.isFinite(y)) return;
    if (x < target.minX) target.minX = x;
    if (y < target.minY) target.minY = y;
    if (x > target.maxX) target.maxX = x;
    if (y > target.maxY) target.maxY = y;
  };

  for (let i = 0; i < bones.length; i += 1) {
    if (!isBoneVisibleInWorkspace(m, bones, i)) continue;
    const rootIndex = getBoneRootIndexFromBones(bones, i);
    const target = ensureTarget(rootIndex);
    if (!target) continue;
    const ep = getBoneWorldEndpointsFromBones(bones, i, world);
    if (!ep) continue;
    const hs = localToScreen(ep.head.x, ep.head.y);
    const ts = localToScreen(ep.tip.x, ep.tip.y);
    includePoint(target, hs.x, hs.y);
    includePoint(target, ts.x, ts.y);
  }

  const items = getRenderableSlotItems();
  const pose = Array.isArray(poseWorld) ? poseWorld : getSolvedPoseWorld(m);
  for (const it of items) {
    if (!it || !it.slot || !hasRenderableAttachment(it.slot)) continue;
    const slot = it.slot;
    const roots = new Set();
    const primary = Number(slot.bone);
    if (Number.isFinite(primary) && primary >= 0 && primary < bones.length) {
      const root = getBoneRootIndexFromBones(bones, primary);
      if (root >= 0) roots.add(root);
    }
    const inf = getSlotInfluenceBones(slot, m);
    for (const biRaw of inf) {
      const bi = Number(biRaw);
      if (!Number.isFinite(bi) || bi < 0 || bi >= bones.length) continue;
      const root = getBoneRootIndexFromBones(bones, bi);
      if (root >= 0) roots.add(root);
    }
    if (roots.size <= 0) continue;
    const geom = buildSlotGeometry(slot, pose);
    const screen = geom && geom.screen;
    if (!screen || screen.length < 6) continue;
    const indices = (geom && geom.indices) || ((getActiveAttachment(slot) || {}).meshData && (getActiveAttachment(slot) || {}).meshData.indices) || m.indices || [];
    for (const root of roots) {
      const target = ensureTarget(root);
      if (!target) continue;
      if (Number.isFinite(it.idx)) target.zOrder = Math.max(target.zOrder, Number(it.idx));
      target.slotGeometries.push({ screen, indices });
      for (let i = 0; i < screen.length; i += 2) {
        includePoint(target, Number(screen[i]) || 0, Number(screen[i + 1]) || 0);
      }
    }
  }

  const out = [];
  for (const target of targetsByRoot.values()) {
    const pad = 10;
    const pivot = target.rootScreen || { x: 0, y: 0 };
    const hasBounds =
      Number.isFinite(target.minX) && Number.isFinite(target.minY) && Number.isFinite(target.maxX) && Number.isFinite(target.maxY);
    const minX = hasBounds ? target.minX - pad : (Number(pivot.x) || 0) - 16;
    const minY = hasBounds ? target.minY - pad : (Number(pivot.y) || 0) - 16;
    const maxX = hasBounds ? target.maxX + pad : (Number(pivot.x) || 0) + 16;
    const maxY = hasBounds ? target.maxY + pad : (Number(pivot.y) || 0) + 16;
    out.push({
      rootIndex: target.rootIndex,
      rootScreen: pivot,
      zOrder: target.zOrder,
      slotGeometries: target.slotGeometries,
      bounds: { minX, minY, maxX, maxY },
      label: (bones[target.rootIndex] && bones[target.rootIndex].name) || `bone_${target.rootIndex}`,
    });
  }
  return out;
}

function getSlotObjectRootIndex(slot, m, bones = null) {
  if (!slot || !m || !Array.isArray(m.rigBones)) return -1;
  const rigBones = Array.isArray(bones) ? bones : m.rigBones;
  const primary = Number(slot.bone);
  if (Number.isFinite(primary) && primary >= 0 && primary < rigBones.length) {
    const root = getBoneRootIndexFromBones(rigBones, primary);
    if (root >= 0) return root;
  }
  for (const biRaw of getSlotInfluenceBones(slot, m)) {
    const bi = Number(biRaw);
    if (!Number.isFinite(bi) || bi < 0 || bi >= rigBones.length) continue;
    const root = getBoneRootIndexFromBones(rigBones, bi);
    if (root >= 0) return root;
  }
  return -1;
}

function toObjectLocalPoint(rootInverse, point) {
  if (!Array.isArray(rootInverse) || !point) return { x: 0, y: 0 };
  return transformPoint(rootInverse, Number(point.x) || 0, Number(point.y) || 0);
}

function captureObjectSpaceSlotSnapshot(m, bones, rootIndices, world = null) {
  if (!m || !Array.isArray(m.rigBones) || !Array.isArray(rootIndices) || rootIndices.length <= 0) {
    return { roots: new Map(), slots: [] };
  }
  const rigBones = Array.isArray(bones) ? bones : m.rigBones;
  const rootSet = new Set(
    rootIndices
      .map((v) => Number(v))
      .filter((v) => Number.isFinite(v) && v >= 0 && v < rigBones.length)
  );
  const worldNow = Array.isArray(world) ? world : computeWorld(rigBones);
  const roots = new Map();
  for (const rootIndex of rootSet) {
    const rootWorld = worldNow[rootIndex];
    if (!rootWorld) continue;
    roots.set(rootIndex, {
      rootIndex,
      world: rootWorld.slice(),
      inverse: invert(rootWorld),
      pivot: transformPoint(rootWorld, 0, 0),
    });
  }
  const slots = [];
  for (const slot of state.slots) {
    if (!slot) continue;
    const rootIndex = getSlotObjectRootIndex(slot, m, rigBones);
    const rootState = roots.get(rootIndex);
    if (!rootState) continue;
    ensureSlotMeshData(slot, m);
    const contour = ensureSlotContour(slot);
    const slotTm = getSlotTransformMatrix(slot, worldNow);
    const captureWorldPoints = (points) =>
      cloneSlotMeshPoints(points).map((p) => transformPoint(slotTm, Number(p.x) || 0, Number(p.y) || 0));
    const toLocalPoints = (points) => points.map((p) => toObjectLocalPoint(rootState.inverse, p));
    const rectCornersWorld =
      (getActiveAttachment(slot) || {}).rect && typeof (getActiveAttachment(slot) || {}).rect === "object"
        ? [
            { x: Number((getActiveAttachment(slot) || {}).rect.x) || 0, y: Number((getActiveAttachment(slot) || {}).rect.y) || 0 },
            { x: (Number((getActiveAttachment(slot) || {}).rect.x) || 0) + (Number((getActiveAttachment(slot) || {}).rect.w) || 0), y: Number((getActiveAttachment(slot) || {}).rect.y) || 0 },
            { x: (Number((getActiveAttachment(slot) || {}).rect.x) || 0) + (Number((getActiveAttachment(slot) || {}).rect.w) || 0), y: (Number((getActiveAttachment(slot) || {}).rect.y) || 0) + (Number((getActiveAttachment(slot) || {}).rect.h) || 0) },
            { x: Number((getActiveAttachment(slot) || {}).rect.x) || 0, y: (Number((getActiveAttachment(slot) || {}).rect.y) || 0) + (Number((getActiveAttachment(slot) || {}).rect.h) || 0) },
          ]
        : [];
    const positions =
      (getActiveAttachment(slot) || {}).meshData && (getActiveAttachment(slot) || {}).meshData.positions
        ? Array.from({ length: (getActiveAttachment(slot) || {}).meshData.positions.length / 2 }, (_, i) =>
            toObjectLocalPoint(rootState.inverse, {
              x: Number((getActiveAttachment(slot) || {}).meshData.positions[i * 2]) || 0,
              y: Number((getActiveAttachment(slot) || {}).meshData.positions[i * 2 + 1]) || 0,
            })
          )
        : [];
    slots.push({
      slot,
      rootIndex,
      rectCorners: toLocalPoints(rectCornersWorld),
      positions,
      fillPoints: toLocalPoints(captureWorldPoints(contour.fillPoints)),
      points: toLocalPoints(captureWorldPoints(contour.points)),
      sourcePoints: toLocalPoints(captureWorldPoints(contour.sourcePoints)),
      authorContourPoints: toLocalPoints(captureWorldPoints(contour.authorContourPoints)),
    });
  }
  return { roots, slots };
}

function makeTranslationMatrix(dx, dy) {
  return [1, 0, 0, 1, Number(dx) || 0, Number(dy) || 0];
}

function makeRotationAroundPointMatrix(pivot, delta) {
  const px = Number(pivot && pivot.x) || 0;
  const py = Number(pivot && pivot.y) || 0;
  return mul(matFromTR(px, py, 0), mul(matFromTR(0, 0, Number(delta) || 0), matFromTR(-px, -py, 0)));
}

function makeScaleAroundPointMatrix(pivot, scale) {
  const px = Number(pivot && pivot.x) || 0;
  const py = Number(pivot && pivot.y) || 0;
  const s = Number(scale) || 1;
  return [s, 0, 0, s, px - s * px, py - s * py];
}

function applyObjectSpaceSlotSnapshot(snapshot, deltaByRoot, bonesWorld) {
  if (!snapshot || !(snapshot.roots instanceof Map) || !Array.isArray(snapshot.slots) || snapshot.slots.length <= 0) return;
  const worldNow = Array.isArray(bonesWorld) ? bonesWorld : computeWorld(getRigBones(state.mesh));
  const rootWorldByRoot = new Map();
  for (const [rootIndex, rootState] of snapshot.roots.entries()) {
    const delta = deltaByRoot instanceof Map ? deltaByRoot.get(rootIndex) : null;
    rootWorldByRoot.set(rootIndex, delta ? mul(delta, rootState.world) : rootState.world);
  }
  for (const snap of snapshot.slots) {
    const slot = snap && snap.slot;
    const rootWorld = rootWorldByRoot.get(Number(snap && snap.rootIndex));
    if (!slot || !rootWorld) continue;
    ensureSlotMeshData(slot, state.mesh);
    const snapAtt = getActiveAttachment(slot);
    if (snapAtt && snapAtt.meshData && snapAtt.meshData.positions) {
      const expected = snapAtt.meshData.positions.length / 2;
      if (Array.isArray(snap.positions) && snap.positions.length === expected) {
        for (let i = 0; i < expected; i += 1) {
          const p = transformPoint(rootWorld, Number(snap.positions[i] && snap.positions[i].x) || 0, Number(snap.positions[i] && snap.positions[i].y) || 0);
          snapAtt.meshData.positions[i * 2] = Number(p.x) || 0;
          snapAtt.meshData.positions[i * 2 + 1] = Number(p.y) || 0;
        }
      }
    }
    if (snapAtt && Array.isArray(snap.rectCorners) && snap.rectCorners.length >= 4) {
      const corners = snap.rectCorners.map((p) => transformPoint(rootWorld, Number(p.x) || 0, Number(p.y) || 0));
      const xs = corners.map((p) => Number(p.x) || 0);
      const ys = corners.map((p) => Number(p.y) || 0);
      snapAtt.rect = {
        x: Math.min(...xs),
        y: Math.min(...ys),
        w: Math.max(...xs) - Math.min(...xs),
        h: Math.max(...ys) - Math.min(...ys),
      };
    }
    const slotTm = getSlotTransformMatrix(slot, worldNow);
    const invSlotTm = invert(slotTm);
    const toSlotLocalPoints = (points) =>
      points.map((p) => {
        const worldPoint = transformPoint(rootWorld, Number(p && p.x) || 0, Number(p && p.y) || 0);
        return transformPoint(invSlotTm, Number(worldPoint.x) || 0, Number(worldPoint.y) || 0);
      });
    const contour = ensureSlotContour(slot);
    contour.fillPoints = toSlotLocalPoints(Array.isArray(snap.fillPoints) ? snap.fillPoints : []);
    contour.points = toSlotLocalPoints(Array.isArray(snap.points) ? snap.points : []);
    contour.sourcePoints = toSlotLocalPoints(Array.isArray(snap.sourcePoints) ? snap.sourcePoints : []);
    contour.authorContourPoints = toSlotLocalPoints(Array.isArray(snap.authorContourPoints) ? snap.authorContourPoints : []);
  }
}

function pointInScreenTriangles(mx, my, screen, indices) {
  if (!screen || screen.length < 6 || !indices || indices.length < 3) return false;
  const p = { x: Number(mx) || 0, y: Number(my) || 0 };
  for (let i = 0; i + 2 < indices.length; i += 3) {
    const i0 = Number(indices[i]);
    const i1 = Number(indices[i + 1]);
    const i2 = Number(indices[i + 2]);
    if (!Number.isFinite(i0) || !Number.isFinite(i1) || !Number.isFinite(i2)) continue;
    const a = { x: Number(screen[i0 * 2]) || 0, y: Number(screen[i0 * 2 + 1]) || 0 };
    const b = { x: Number(screen[i1 * 2]) || 0, y: Number(screen[i1 * 2 + 1]) || 0 };
    const c = { x: Number(screen[i2 * 2]) || 0, y: Number(screen[i2 * 2 + 1]) || 0 };
    if (pointInTriangle2D(p, a, b, c)) return true;
  }
  return false;
}

function getSelectedObjectRootSet(m, bones) {
  const out = new Set();
  if (!m || !Array.isArray(bones) || bones.length <= 0) return out;
  const picked = getSelectedBonesForWeight(m);
  for (const biRaw of picked) {
    const bi = Number(biRaw);
    if (!Number.isFinite(bi) || bi < 0 || bi >= bones.length) continue;
    const root = getBoneRootIndexFromBones(bones, bi);
    if (root >= 0) out.add(root);
  }
  if (out.size <= 0 && Number.isFinite(state.selectedBone) && state.selectedBone >= 0 && state.selectedBone < bones.length) {
    const root = getBoneRootIndexFromBones(bones, state.selectedBone);
    if (root >= 0) out.add(root);
  }
  return out;
}

function pickObjectModeRootAtCanvas(mx, my) {
  const m = state.mesh;
  if (!m || (state.editMode !== "skeleton" && state.editMode !== "object") || state.boneMode !== "object") return -1;
  const bones = getBonesForCurrentMode(m);
  if (!Array.isArray(bones) || bones.length <= 0) return -1;
  enforceConnectedHeads(bones);
  const world = computeWorld(bones);
  const poseWorld = getSolvedPoseWorld(m);
  const targets = collectObjectModeTargets(m, bones, world, poseWorld);
  if (targets.length <= 0) return -1;

  const ordered = [...targets].sort((a, b) => (Number(b.zOrder) || -1) - (Number(a.zOrder) || -1));
  for (const t of ordered) {
    const b = t.bounds;
    if (!b) continue;
    if (mx < b.minX || mx > b.maxX || my < b.minY || my > b.maxY) continue;
    for (const g of t.slotGeometries || []) {
      if (pointInScreenTriangles(mx, my, g.screen, g.indices)) return t.rootIndex;
    }
  }
  for (const t of ordered) {
    const b = t.bounds;
    if (b && mx >= b.minX && mx <= b.maxX && my >= b.minY && my <= b.maxY) return t.rootIndex;
  }
  let bestRoot = -1;
  let bestD2 = 14 * 14;
  for (const t of targets) {
    const p = t.rootScreen || { x: 0, y: 0 };
    const dx = (Number(p.x) || 0) - mx;
    const dy = (Number(p.y) || 0) - my;
    const d2 = dx * dx + dy * dy;
    if (d2 < bestD2) {
      bestD2 = d2;
      bestRoot = t.rootIndex;
    }
  }
  return bestRoot;
}

function getObjectModeScaleHandle(target) {
  const b = target && target.bounds;
  if (!b) return null;
  const anchorX = Number(b.maxX) || 0;
  const anchorY = Number(b.minY) || 0;
  const x = anchorX + 14;
  const y = anchorY - 14;
  return {
    x,
    y,
    anchorX,
    anchorY,
    size: 7,
    hitR: 12,
  };
}

function collectObjectScaleHandleRoots(m, bones) {
  const roots = getSelectedObjectRootSet(m, bones);
  if (roots.size > 0) return roots;
  const bi = Number(state.selectedBone);
  if (Number.isFinite(bi) && bi >= 0 && bi < bones.length) {
    const root = getBoneRootIndexFromBones(bones, bi);
    if (root >= 0) roots.add(root);
  }
  return roots;
}

function pickObjectModeScaleHandleAtCanvas(mx, my) {
  const m = state.mesh;
  if (!m || (state.editMode !== "skeleton" && state.editMode !== "object") || state.boneMode !== "object") return -1;
  const bones = getBonesForCurrentMode(m);
  if (!Array.isArray(bones) || bones.length <= 0) return -1;
  enforceConnectedHeads(bones);
  const world = computeWorld(bones);
  const poseWorld = getSolvedPoseWorld(m);
  const targets = collectObjectModeTargets(m, bones, world, poseWorld);
  if (targets.length <= 0) return -1;
  const handleRoots = collectObjectScaleHandleRoots(m, bones);
  if (handleRoots.size <= 0) return -1;
  const ordered = [...targets].sort((a, b) => (Number(b.zOrder) || -1) - (Number(a.zOrder) || -1));
  let bestRoot = -1;
  let bestD2 = Number.POSITIVE_INFINITY;
  for (const t of ordered) {
    if (!handleRoots.has(t.rootIndex)) continue;
    const h = getObjectModeScaleHandle(t);
    if (!h) continue;
    const dx = (Number(h.x) || 0) - mx;
    const dy = (Number(h.y) || 0) - my;
    const d2 = dx * dx + dy * dy;
    const hitR = Number(h.hitR) || 12;
    if (d2 <= hitR * hitR && d2 < bestD2) {
      bestD2 = d2;
      bestRoot = t.rootIndex;
    }
  }
  return bestRoot;
}

function drawObjectModeTargetsOverlay(ctx, m, bones, world) {
  if (!ctx || !m || (state.editMode !== "skeleton" && state.editMode !== "object") || state.boneMode !== "object") return;
  const poseWorld = getSolvedPoseWorld(m);
  const targets = collectObjectModeTargets(m, bones, world, poseWorld);
  if (targets.length <= 0) return;
  const selectedRoots = getSelectedObjectRootSet(m, bones);
  const hoverRoot = Number(state.objectHoverRoot);
  const hoverScaleRoot = Number(state.objectScaleHoverRoot);
  const handleRoots = collectObjectScaleHandleRoots(m, bones);
  const activeScaleDrag = state.drag && state.drag.type === "bone_object_scale" ? state.drag : null;
  const activeScaleRoots = new Set();
  if (activeScaleDrag && Array.isArray(activeScaleDrag.items)) {
    for (const it of activeScaleDrag.items) {
      const ri = Number(it && it.rootIndex);
      if (Number.isFinite(ri) && ri >= 0) activeScaleRoots.add(ri);
    }
  }
  for (const t of targets) {
    const b = t.bounds;
    if (!b) continue;
    const isSelected = selectedRoots.has(t.rootIndex);
    const isHover = hoverRoot === t.rootIndex;
    ctx.save();
    ctx.setLineDash(isSelected ? [] : [5, 4]);
    ctx.strokeStyle = isSelected ? "rgba(255, 228, 110, 0.95)" : isHover ? "rgba(166, 236, 255, 0.9)" : "rgba(120, 210, 255, 0.45)";
    ctx.lineWidth = isSelected ? 2.4 : isHover ? 2 : 1.2;
    ctx.strokeRect(b.minX, b.minY, Math.max(1, b.maxX - b.minX), Math.max(1, b.maxY - b.minY));
    ctx.setLineDash([]);
    const p = t.rootScreen || { x: b.minX, y: b.minY };
    ctx.beginPath();
    ctx.fillStyle = isSelected ? "rgba(255, 228, 110, 0.95)" : isHover ? "rgba(180, 245, 255, 0.95)" : "rgba(125, 211, 252, 0.88)";
    ctx.arc(Number(p.x) || 0, Number(p.y) || 0, isSelected ? 5.2 : 4.4, 0, Math.PI * 2);
    ctx.fill();
    const tag = `${isSelected ? "Selected" : "Object"}: ${t.label}`;
    ctx.font = "11px Segoe UI, sans-serif";
    const tw = Math.ceil(ctx.measureText(tag).width);
    const tx = (Number(p.x) || 0) + 9;
    const ty = (Number(p.y) || 0) - 10;
    ctx.fillStyle = isSelected ? "rgba(60, 50, 20, 0.88)" : "rgba(17, 34, 42, 0.84)";
    ctx.fillRect(tx - 4, ty - 11, tw + 8, 14);
    ctx.fillStyle = isSelected ? "#ffe46e" : "#bdefff";
    ctx.fillText(tag, tx, ty);
    if (handleRoots.has(t.rootIndex)) {
      const h = getObjectModeScaleHandle(t);
      if (h) {
        const isScaleHover = hoverScaleRoot === t.rootIndex;
        const isScaleActive = activeScaleRoots.has(t.rootIndex);
        ctx.strokeStyle = isScaleActive
          ? "rgba(255, 228, 110, 0.98)"
          : isScaleHover
            ? "rgba(166, 236, 255, 0.98)"
            : "rgba(141, 224, 255, 0.86)";
        ctx.lineWidth = isScaleActive ? 2.2 : 1.4;
        ctx.beginPath();
        ctx.moveTo(Number(h.anchorX) || 0, Number(h.anchorY) || 0);
        ctx.lineTo(Number(h.x) || 0, Number(h.y) || 0);
        ctx.stroke();
        const hs = Number(h.size) || 7;
        const hx = (Number(h.x) || 0) - hs;
        const hy = (Number(h.y) || 0) - hs;
        const side = hs * 2;
        ctx.fillStyle = isScaleActive
          ? "rgba(66, 52, 18, 0.95)"
          : isScaleHover
            ? "rgba(13, 38, 50, 0.95)"
            : "rgba(15, 34, 44, 0.88)";
        ctx.fillRect(hx, hy, side, side);
        ctx.strokeRect(hx, hy, side, side);
        ctx.fillStyle = isScaleActive ? "#ffe46e" : "#c8f4ff";
        ctx.font = "9px Segoe UI, sans-serif";
        ctx.fillText("S", hx + 2.2, hy + side - 2.3);
      }
    }
    ctx.restore();
  }
}

function getGLTextureCache() {
  if (!hasGL) return null;
  if (!state.glTextureCache || typeof state.glTextureCache.get !== "function") {
    state.glTextureCache = new WeakMap();
  }
  return state.glTextureCache;
}

function createGLTextureEntry(canvas) {
  if (!hasGL || !canvas) return null;
  const texture = gl.createTexture();
  if (!texture) return null;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
  return {
    texture,
    width: Math.max(1, Number(canvas.width) || 1),
    height: Math.max(1, Number(canvas.height) || 1),
  };
}

function ensureGLTextureForCanvas(canvas) {
  if (!hasGL || !canvas) return null;
  const cache = getGLTextureCache();
  if (!cache) return null;
  const width = Math.max(1, Number(canvas.width) || 1);
  const height = Math.max(1, Number(canvas.height) || 1);
  let entry = cache.get(canvas);
  if (!entry) {
    entry = createGLTextureEntry(canvas);
    if (!entry) return null;
    cache.set(canvas, entry);
    return entry.texture;
  }
  if (entry.width !== width || entry.height !== height) {
    gl.bindTexture(gl.TEXTURE_2D, entry.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    entry.width = width;
    entry.height = height;
  }
  return entry.texture;
}

function resetGLTextureCache() {
  if (!hasGL) {
    state.texture = null;
    return;
  }
  state.glTextureCache = new WeakMap();
  state.texture = null;
}

function updateTexture() {
  if (!state.sourceCanvas) return;
  if (!hasGL) return;
  state.texture = ensureGLTextureForCanvas(state.sourceCanvas);
  if (typeof requestRender === "function") requestRender("texture");
}

function makeCanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}

function normalizeSlotCanvas(src, targetW, targetH) {
  const c = makeCanvas(targetW, targetH);
  const ctx = c.getContext("2d");
  if (!ctx) return c;
  if (src.width === targetW && src.height === targetH) {
    ctx.drawImage(src, 0, 0);
    return c;
  }
  ctx.drawImage(src, 0, 0, src.width, src.height, 0, 0, targetW, targetH);
  return c;
}

function getCanvasAlphaBounds(canvas) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const w = canvas.width;
  const h = canvas.height;
  const img = ctx.getImageData(0, 0, w, h).data;
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const a = img[(y * w + x) * 4 + 3];
      if (a <= 0) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < minX || maxY < minY) return null;
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

function refreshAttachmentPanel(s) {
  const activeAttachmentEntry = s ? getSlotAttachmentEntry(s, getSlotCurrentAttachmentName(s)) : null;
  const activeAttachmentState = s ? getActiveAttachment(s) : null;

  /* --- CSS type-gating: set att-type-* class on #attachmentPropsGroup --- */
  const attGroup = document.getElementById("attachmentPropsGroup");
  if (attGroup) {
    const t = activeAttachmentEntry ? normalizeAttachmentType(activeAttachmentEntry.type) : "region";
    for (const c of [...attGroup.classList]) {
      if (c.startsWith("att-type-")) attGroup.classList.remove(c);
    }
    attGroup.classList.add(`att-type-${t}`);
  }

  if (els.slotAttachment) {
    els.slotAttachment.innerHTML = "";
    const none = document.createElement("option");
    none.value = "__none__";
    none.textContent = "(none)";
    els.slotAttachment.appendChild(none);
    if (s) {
      for (const a of ensureSlotAttachments(s)) {
        const opt = document.createElement("option");
        opt.value = a.name;
        opt.textContent = a.name;
        els.slotAttachment.appendChild(opt);
      }
    } else {
      const opt = document.createElement("option");
      opt.value = "main";
      opt.textContent = "main";
      els.slotAttachment.appendChild(opt);
    }
    const current = s ? getSlotCurrentAttachmentName(s) : null;
    els.slotAttachment.value = current ? current : "__none__";
    els.slotAttachment.disabled = !s;
  }
  if (els.slotAttachmentVisible) {
    const attachmentCount = s ? ensureSlotAttachments(s).length : 0;
    els.slotAttachmentVisible.checked = !!(s && getSlotCurrentAttachmentName(s));
    els.slotAttachmentVisible.disabled = !s || attachmentCount <= 0;
  }
  if (els.slotAttachmentAddBtn) els.slotAttachmentAddBtn.disabled = !s;
  if (els.slotAttachmentDuplicateBtn) els.slotAttachmentDuplicateBtn.disabled = !s || !getSlotCurrentAttachmentName(s);
  if (els.slotAttachmentDeleteBtn) {
    const canDelete = !!(s && ensureSlotAttachments(s).length > 1 && getSlotCurrentAttachmentName(s));
    els.slotAttachmentDeleteBtn.disabled = !canDelete;
  }
  if (els.slotAttachmentLoadBtn) els.slotAttachmentLoadBtn.disabled = !s || !getSlotCurrentAttachmentName(s);
  if (els.slotAttachmentName) {
    const name = s ? getSlotCurrentAttachmentName(s) || "" : "";
    els.slotAttachmentName.value = name;
    els.slotAttachmentName.disabled = !s || !name;
  }
  if (els.slotAttachmentType) {
    const t = activeAttachmentEntry ? normalizeAttachmentType(activeAttachmentEntry.type) : "region";
    els.slotAttachmentType.value = t;
    els.slotAttachmentType.disabled = !activeAttachmentEntry;
  }
  if (els.slotAttachmentLinkedParent) {
    els.slotAttachmentLinkedParent.innerHTML = "";
    const none = document.createElement("option");
    none.value = "";
    none.textContent = "(none)";
    els.slotAttachmentLinkedParent.appendChild(none);
    if (s && activeAttachmentEntry) {
      /* Enumerate ALL slots' deformable attachments as candidates.
         Value format: "slotId::attachmentName" for unambiguous cross-slot reference. */
      let currentGroup = null;
      for (const candidateSlot of state.slots || []) {
        if (!candidateSlot) continue;
        const isSameSlot = candidateSlot === s;
        const groupLabel = isSameSlot ? `${candidateSlot.name} (this slot)` : candidateSlot.name;
        let groupEl = null;
        for (const a of ensureSlotAttachments(candidateSlot)) {
          if (!a) continue;
          if (isSameSlot && a.name === activeAttachmentEntry.name) continue;
          const t = normalizeAttachmentType(a.type);
          if (t !== "mesh" && t !== "linkedmesh") continue;
          if (!groupEl) {
            groupEl = document.createElement("optgroup");
            groupEl.label = groupLabel;
            els.slotAttachmentLinkedParent.appendChild(groupEl);
          }
          const opt = document.createElement("option");
          const val = `${candidateSlot.id}::${a.name}`;
          opt.value = val;
          opt.textContent = `${a.name} [${t}]`;
          groupEl.appendChild(opt);
        }
      }
      /* Resolve current value — support both "slotId::name" and legacy plain name */
      const raw = activeAttachmentEntry.linkedParent ? String(activeAttachmentEntry.linkedParent) : "";
      const hasExact = raw && [...els.slotAttachmentLinkedParent.options].some((o) => o.value === raw);
      if (hasExact) {
        els.slotAttachmentLinkedParent.value = raw;
      } else if (raw && raw.indexOf("::") === -1) {
        /* Legacy plain name: find first matching option across all slots */
        const match = [...els.slotAttachmentLinkedParent.options].find((o) => o.value.endsWith(`::${raw}`));
        if (match) {
          els.slotAttachmentLinkedParent.value = match.value;
          activeAttachmentEntry.linkedParent = match.value;
        } else {
          els.slotAttachmentLinkedParent.value = "";
        }
      } else {
        els.slotAttachmentLinkedParent.value = "";
      }
    } else {
      els.slotAttachmentLinkedParent.value = "";
    }
    const can = !!(activeAttachmentEntry && normalizeAttachmentType(activeAttachmentEntry.type) === "linkedmesh");
    els.slotAttachmentLinkedParent.disabled = !can;
  }
  if (els.slotAttachmentInheritTimelines) {
    const can = !!(activeAttachmentEntry && normalizeAttachmentType(activeAttachmentEntry.type) === "linkedmesh");
    els.slotAttachmentInheritTimelines.checked = !!(activeAttachmentEntry && activeAttachmentEntry.inheritTimelines);
    els.slotAttachmentInheritTimelines.disabled = !can;
  }
  if (els.slotAttachmentPointX) {
    els.slotAttachmentPointX.value = String(activeAttachmentEntry ? Number(activeAttachmentEntry.pointX) || 0 : 0);
    els.slotAttachmentPointX.disabled = !(activeAttachmentEntry && normalizeAttachmentType(activeAttachmentEntry.type) === "point");
  }
  if (els.slotAttachmentPointY) {
    els.slotAttachmentPointY.value = String(activeAttachmentEntry ? Number(activeAttachmentEntry.pointY) || 0 : 0);
    els.slotAttachmentPointY.disabled = !(activeAttachmentEntry && normalizeAttachmentType(activeAttachmentEntry.type) === "point");
  }
  if (els.slotAttachmentPointRot) {
    els.slotAttachmentPointRot.value = String(activeAttachmentEntry ? Number(activeAttachmentEntry.pointRot) || 0 : 0);
    els.slotAttachmentPointRot.disabled = !(activeAttachmentEntry && normalizeAttachmentType(activeAttachmentEntry.type) === "point");
  }
  if (els.slotAttachmentBBoxSource) {
    els.slotAttachmentBBoxSource.value = activeAttachmentEntry && activeAttachmentEntry.bboxSource === "contour" ? "contour" : "fill";
    els.slotAttachmentBBoxSource.disabled = !(activeAttachmentEntry && normalizeAttachmentType(activeAttachmentEntry.type) === "boundingbox");
  }
  const isSeqCapable = !!(activeAttachmentEntry && (
    normalizeAttachmentType(activeAttachmentEntry.type) === "region" ||
    normalizeAttachmentType(activeAttachmentEntry.type) === "mesh" ||
    normalizeAttachmentType(activeAttachmentEntry.type) === "linkedmesh"
  ));
  if (els.slotAttachmentSequenceEnabled) {
    const seq = activeAttachmentEntry && activeAttachmentEntry.sequence ? activeAttachmentEntry.sequence : { enabled: false };
    els.slotAttachmentSequenceEnabled.checked = !!seq.enabled;
    els.slotAttachmentSequenceEnabled.disabled = !isSeqCapable;
  }
  if (els.slotAttachmentSequenceCount) {
    const seq = activeAttachmentEntry && activeAttachmentEntry.sequence ? activeAttachmentEntry.sequence : { count: 1 };
    els.slotAttachmentSequenceCount.value = String(Math.max(1, Math.round(Number(seq.count) || 1)));
    els.slotAttachmentSequenceCount.disabled = !isSeqCapable;
  }
  if (els.slotAttachmentSequenceStart) {
    const seq = activeAttachmentEntry && activeAttachmentEntry.sequence ? activeAttachmentEntry.sequence : { start: 0 };
    els.slotAttachmentSequenceStart.value = String(Math.max(0, Math.round(Number(seq.start) || 0)));
    els.slotAttachmentSequenceStart.disabled = !isSeqCapable;
  }
  if (els.slotAttachmentSequenceDigits) {
    const seq = activeAttachmentEntry && activeAttachmentEntry.sequence ? activeAttachmentEntry.sequence : { digits: 2 };
    els.slotAttachmentSequenceDigits.value = String(Math.max(1, Math.round(Number(seq.digits) || 2)));
    els.slotAttachmentSequenceDigits.disabled = !isSeqCapable;
  }
  if (els.slotAttachmentSequenceSetupIndex) {
    const seq = activeAttachmentEntry && activeAttachmentEntry.sequence ? activeAttachmentEntry.sequence : { setupIndex: 0 };
    els.slotAttachmentSequenceSetupIndex.value = String(Math.max(0, Math.round(Number(seq.setupIndex) || 0)));
    els.slotAttachmentSequenceSetupIndex.disabled = !isSeqCapable;
  }
  if (els.slotAttachmentSequenceMode) {
    const seq = activeAttachmentEntry && activeAttachmentEntry.sequence ? activeAttachmentEntry.sequence : { mode: 0 };
    els.slotAttachmentSequenceMode.value = String(Number(seq.mode) || 0);
    els.slotAttachmentSequenceMode.disabled = !isSeqCapable;
  }
  if (els.slotAttachmentSequencePath) {
    const seq = activeAttachmentEntry && activeAttachmentEntry.sequence ? activeAttachmentEntry.sequence : { path: "" };
    els.slotAttachmentSequencePath.value = String(seq.path || "");
    els.slotAttachmentSequencePath.disabled = !isSeqCapable;
  }
  if (els.slotSequenceFramesHint) {
    const seq = activeAttachmentEntry && activeAttachmentEntry.sequence ? activeAttachmentEntry.sequence : null;
    const n = seq && Array.isArray(seq.frames) ? seq.frames.length : 0;
    if (n > 0) {
      const setupIdx = Math.max(0, Math.min(n - 1, Math.round(Number(seq.setupIndex) || 0)));
      els.slotSequenceFramesHint.textContent = `Loaded ${n} frame(s). Setup index ${setupIdx}.`;
    } else {
      els.slotSequenceFramesHint.textContent = "No sequence frames loaded.";
    }
  }
  if (els.slotSequenceLoadFramesBtn) els.slotSequenceLoadFramesBtn.disabled = !isSeqCapable;
  if (els.slotSequenceClearFramesBtn) {
    const seq = activeAttachmentEntry && activeAttachmentEntry.sequence ? activeAttachmentEntry.sequence : null;
    const hasFrames = !!(seq && Array.isArray(seq.frames) && seq.frames.length > 0);
    els.slotSequenceClearFramesBtn.disabled = !hasFrames;
  }
  if (els.slotClipEnabled) {
    els.slotClipEnabled.checked = !!(activeAttachmentState && activeAttachmentState.clipEnabled);
    els.slotClipEnabled.disabled = !s;
  }
  if (els.slotClipSource) {
    els.slotClipSource.value = activeAttachmentState && activeAttachmentState.clipSource === "contour" ? "contour" : "fill";
    els.slotClipSource.disabled = !s || !(activeAttachmentState && activeAttachmentState.clipEnabled);
  }
  if (els.slotClipEnd) {
    els.slotClipEnd.innerHTML = "";
    const none = document.createElement("option");
    none.value = "";
    none.textContent = "(to end)";
    els.slotClipEnd.appendChild(none);
    const activeIdx = Number(state.activeSlot);
    for (let i = 0; i < (state.slots || []).length; i += 1) {
      if (Number.isFinite(activeIdx) && activeIdx >= 0 && i <= activeIdx) continue;
      const sl = state.slots[i];
      if (!sl || !sl.id) continue;
      const opt = document.createElement("option");
      opt.value = String(sl.id);
      opt.textContent = sl.name || String(sl.id);
      els.slotClipEnd.appendChild(opt);
    }
    const endId = activeAttachmentState && activeAttachmentState.clipEndSlotId ? String(activeAttachmentState.clipEndSlotId) : "";
    const hasEnd = endId && [...els.slotClipEnd.options].some((o) => o.value === endId);
    els.slotClipEnd.value = hasEnd ? endId : "";
    if (activeAttachmentState && !hasEnd) activeAttachmentState.clipEndSlotId = null;
    els.slotClipEnd.disabled = !s || !(activeAttachmentState && activeAttachmentState.clipEnabled);
  }
  if (els.slotClipSetKeyBtn) els.slotClipSetKeyBtn.disabled = !s || state.activeSlot < 0;
  if (els.slotClipDelKeyBtn) els.slotClipDelKeyBtn.disabled = !s || state.activeSlot < 0;
  if (els.slotClipSourceSetKeyBtn) els.slotClipSourceSetKeyBtn.disabled = !s || state.activeSlot < 0;
  if (els.slotClipSourceDelKeyBtn) els.slotClipSourceDelKeyBtn.disabled = !s || state.activeSlot < 0;
  if (els.slotClipComboSetKeyBtn) els.slotClipComboSetKeyBtn.disabled = !s || state.activeSlot < 0;
  if (els.slotClipEndSetKeyBtn) els.slotClipEndSetKeyBtn.disabled = !s || state.activeSlot < 0;
  if (els.slotClipEndDelKeyBtn) els.slotClipEndDelKeyBtn.disabled = !s || state.activeSlot < 0;
}

function refreshSlotPanel(s) {
  if (els.slotBone) {
    els.slotBone.innerHTML = "";
    const none = document.createElement("option");
    none.value = "-1";
    none.textContent = "-1: Unbound";
    els.slotBone.appendChild(none);
    if (state.mesh && state.mesh.rigBones) {
      for (let i = 0; i < state.mesh.rigBones.length; i += 1) {
        const b = state.mesh.rigBones[i];
        const opt = document.createElement("option");
        opt.value = String(i);
        opt.textContent = `${i}: ${b.name}`;
        els.slotBone.appendChild(opt);
      }
    }
    els.slotBone.value = String(s && state.mesh ? getSlotTreeBoneIndex(s, state.mesh) : -1);
  }
  if (els.slotInfluenceBones) {
    els.slotInfluenceBones.innerHTML = "";
    if (state.mesh && state.mesh.rigBones) {
      for (let i = 0; i < state.mesh.rigBones.length; i += 1) {
        const b = state.mesh.rigBones[i];
        const opt = document.createElement("option");
        opt.value = String(i);
        opt.textContent = `${i}: ${b.name}`;
        els.slotInfluenceBones.appendChild(opt);
      }
    }
  }
  if (els.slotName) els.slotName.value = s ? s.name : "";
  if (els.slotVisible) els.slotVisible.checked = !!(s ? isSlotEditorVisible(s) : true);
  if (els.slotAlpha) els.slotAlpha.value = String(s ? math.clamp(Number(s.alpha) || 1, 0, 1) : 1);
  if (els.slotColor) {
    els.slotColor.value = s ? rgb01ToHex(Number(s.r) || 1, Number(s.g) || 1, Number(s.b) || 1) : "#ffffff";
  }
  if (els.slotBlend) {
    els.slotBlend.value = s ? normalizeSlotBlendMode(s.blend) : "normal";
    els.slotBlend.disabled = !s;
  }
  if (els.slotDarkEnabled) {
    els.slotDarkEnabled.checked = !!(s && s.darkEnabled);
    els.slotDarkEnabled.disabled = !s;
  }
  if (els.slotDarkColor) {
    els.slotDarkColor.value = s ? rgb01ToHex(Number(s.dr) || 0, Number(s.dg) || 0, Number(s.db) || 0) : "#000000";
    els.slotDarkColor.disabled = !s || !(s && s.darkEnabled);
  }
  const slotWeightMode = getSlotWeightMode(s);
  if (els.slotWeightMode) {
    els.slotWeightMode.value = slotWeightMode;
    els.slotWeightMode.disabled = !s;
  }
  refreshSlotWeightQuickUI(s);
  if (els.slotWeightModeHint) {
    els.slotWeightModeHint.textContent = getSlotWeightModeHintText(slotWeightMode);
  }
  const bindSelection = state.mesh
    ? getBindSelectionState(state.mesh)
    : { slotIndices: [], boneIndices: [], primaryBone: -1, slotPreview: "(none)", bonePreview: "(slot default)" };
  if (els.slotBindBoneBtn) {
    els.slotBindBoneBtn.disabled = !(state.mesh && bindSelection.slotIndices.length > 0 && bindSelection.primaryBone >= 0);
    els.slotBindBoneBtn.textContent =
      bindSelection.slotIndices.length > 1 ? `Bind ${bindSelection.slotIndices.length} Slot(s) -> Bone` : "Bind to Selected Bone";
  }
  if (els.slotBindWeightedBtn) {
    els.slotBindWeightedBtn.disabled = !(state.mesh && bindSelection.slotIndices.length > 0 && bindSelection.boneIndices.length > 0);
    els.slotBindWeightedBtn.textContent =
      bindSelection.slotIndices.length > 1 || bindSelection.boneIndices.length > 1
        ? `Use ${bindSelection.boneIndices.length} Bone(s) on ${bindSelection.slotIndices.length} Slot(s)`
        : "Use Selected Bones";
  }
  if (els.slotBindSelectionSummary) {
    els.slotBindSelectionSummary.textContent = state.mesh
      ? `Bind target: ${bindSelection.slotIndices.length} slot(s) | Slots: ${bindSelection.slotPreview} | Bones: ${bindSelection.bonePreview}`
      : "Bind target: no mesh.";
  }
  if (els.slotInfluenceBones && s && state.mesh) {
    const allow = new Set(getSlotInfluenceBones(s, state.mesh).map((x) => String(x)));
    for (const opt of els.slotInfluenceBones.options) {
      opt.selected = allow.has(opt.value);
    }
    els.slotInfluenceBones.disabled = slotWeightMode !== "weighted";
  } else if (els.slotInfluenceBones) {
    els.slotInfluenceBones.disabled = true;
  }
  const infWrap = document.getElementById("slotInfluenceWrap");
  if (infWrap) infWrap.style.display = slotWeightMode === "weighted" ? "" : "none";
  if (els.slotTx) els.slotTx.value = String(Math.round(s ? Number(s.tx) || 0 : 0));
  if (els.slotTy) els.slotTy.value = String(Math.round(s ? Number(s.ty) || 0 : 0));
  if (els.slotRot) els.slotRot.value = String(Math.round(math.radToDeg(s ? Number(s.rot) || 0 : 0)));
}

function refreshSlotUI() {
  const activeSlot = getActiveSlot();
  refreshBoneTreeContextMenuUI();
  if (els.slotSelect) {
    els.slotSelect.innerHTML = "";
    const none = document.createElement("option");
    none.value = "-1";
    none.textContent = "(none)";
    els.slotSelect.appendChild(none);
    for (let i = 0; i < state.slots.length; i += 1) {
      const s = state.slots[i];
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = `${i}: ${s.name}`;
      els.slotSelect.appendChild(opt);
    }
    if (state.activeSlot >= 0 && state.activeSlot < state.slots.length) {
      els.slotSelect.value = String(state.activeSlot);
    } else {
      els.slotSelect.value = "-1";
    }
  }
  if (els.slotViewMode) {
    els.slotViewMode.value = state.slotViewMode;
  }
  if (els.slotMeshGridReplaceContour) {
    els.slotMeshGridReplaceContour.checked = !!state.slotMesh.gridReplaceContour;
  }
  const s = activeSlot;
  if (s) {
    ensureSlotAttachmentState(s);
    ensureSlotAttachments(s);
    ensureSlotVisualState(s);
  }
  refreshSlotPanel(s);
  refreshAttachmentPanel(s);
  refreshBaseImageTransformUI();
  refreshSlotMeshContourReferenceHint();
  refreshSkinUI();
  refreshDrawOrderUI();
  refreshRightPropsPanelVisibility();
  refreshBoneTreeFilterUI();
  refreshSetupQuickActions();
}

function getRightPropsFocus() {
  const preferred = state.rightPropsFocus === "bone" ? "bone" : "slot";
  const hasSlot = Number.isFinite(state.activeSlot) && state.activeSlot >= 0 && state.activeSlot < state.slots.length;
  const hasBone = !!(state.mesh && Number.isFinite(state.selectedBone) && state.selectedBone >= 0);
  if (preferred === "bone" && hasBone) return "bone";
  if (preferred === "slot" && hasSlot) return "slot";
  if (hasSlot) return "slot";
  if (hasBone) return "bone";
  return "slot";
}

function refreshRightPropsPanelVisibility() {
  const focus = getRightPropsFocus();
  const showBone = focus === "bone" && state.uiPage !== "slot";
  const showSlot = focus === "slot" || focus === "attachment";
  if (els.slotPropsGroup) els.slotPropsGroup.style.display = showSlot ? "" : "none";
  if (els.bonePropsGroup) els.bonePropsGroup.style.display = showBone ? "" : "none";
  const attGroup = document.getElementById("attachmentPropsGroup");
  if (attGroup) attGroup.style.display = showSlot ? "" : "none";
}

function setRightPropsFocus(mode) {
  if (mode === "bone") state.rightPropsFocus = "bone";
  else if (mode === "attachment") state.rightPropsFocus = "attachment";
  else state.rightPropsFocus = "slot";
  refreshRightPropsPanelVisibility();
}

function ensureSetupQuickUIElements() {
  if (!els.leftMeshSetup) return;
  const hasAll =
    !!els.setupHumanoidBoneBtn &&
    !!els.setupHumanoidSourceMode &&
    !!els.setupHumanoidMinScore &&
    !!els.setupHumanoidSmoothing &&
    !!els.setupHumanoidFallback &&
    !!els.setupAutoWeightSingleBtn &&
    !!els.setupAutoWeightMultiBtn &&
    !!els.setupEditWeightsBtn &&
    !!els.setupAutoWeightSelectionSummary;
  if (hasAll) {
    bindSetupHumanoidBoneButton();
    bindPoseAutoRigOptionListeners();
    syncPoseAutoRigOptionsToUI();
    return;
  }
  const existing = els.leftMeshSetup.querySelector(".setup-quick-wrap");
  if (existing && !existing.querySelector("#setupHumanoidBoneBtn")) {
    const humanoidSection = existing.querySelector("#setupHumanoidRigSection");
    const field = document.createElement("div");
    field.className = "field";
    field.innerHTML = `<button id="setupHumanoidBoneBtn" type="button" title="Auto-generate humanoid parent-child rig">humanoid bone</button>`;
    if (humanoidSection) humanoidSection.appendChild(field);
    else existing.appendChild(field);
  }
  if (existing && !existing.querySelector("#setupHumanoidOptions")) {
    const humanoidSection = existing.querySelector("#setupHumanoidRigSection");
    const optsField = document.createElement("div");
    optsField.id = "setupHumanoidOptions";
    optsField.className = "field";
    optsField.innerHTML = `
      <div class="field two-col">
        <label>
          <span>Pose Source</span>
          <select id="setupHumanoidSourceMode">
            <option value="auto" selected>Auto</option>
            <option value="project">Project Image</option>
            <option value="active_slot">Active Slot</option>
          </select>
        </label>
        <label>
          <span>Min Score</span>
          <input id="setupHumanoidMinScore" type="number" min="0.05" max="0.95" step="0.05" value="0.20" />
        </label>
      </div>
      <label class="slot-inline-check">
        <input id="setupHumanoidSmoothing" type="checkbox" checked />
        <span>Detector Smoothing</span>
      </label>
      <label class="slot-inline-check">
        <input id="setupHumanoidFallback" type="checkbox" checked />
        <span>Allow Missing-Point Fallback</span>
      </label>
    `;
    const humanoidBtn = existing.querySelector("#setupHumanoidBoneBtn");
    const humanoidField = humanoidBtn ? humanoidBtn.closest(".field") : null;
    if (humanoidSection) {
      if (humanoidField && humanoidField.parentElement === humanoidSection && humanoidField.nextSibling) {
        humanoidSection.insertBefore(optsField, humanoidField.nextSibling);
      } else {
        humanoidSection.appendChild(optsField);
      }
    } else if (humanoidField && humanoidField.nextSibling) {
      existing.insertBefore(optsField, humanoidField.nextSibling);
    } else {
      existing.appendChild(optsField);
    }
  }
  if (existing && !existing.querySelector("#setupAutoWeightSelectionSummary")) {
    const summary = document.createElement("p");
    summary.id = "setupAutoWeightSelectionSummary";
    summary.className = "muted";
    const hint = existing.querySelector("p.muted:last-of-type");
    if (hint && hint.parentElement === existing) existing.insertBefore(summary, hint);
    else existing.appendChild(summary);
  }
  if (!existing) {
    const wrap = document.createElement("div");
    wrap.className = "setup-quick-wrap";
    wrap.innerHTML = `
      <div class="field two-col">
        <button id="setupAutoWeightSingleBtn" type="button">Auto Weight (Single Bone)</button>
        <button id="setupAutoWeightMultiBtn" type="button">Auto Weight (Multi Bone)</button>
      </div>
      <div class="field">
        <button id="setupEditWeightsBtn" type="button">Edit Weights (Vertex)</button>
      </div>
      <p id="setupAutoWeightSelectionSummary" class="muted"></p>
      <details id="setupHumanoidRigSection" class="panel-section setup-subsection" open>
        <summary class="panel-section-head">
          <span class="panel-section-title">Humanoid Auto Rig</span>
        </summary>
        <div class="panel-section-body">
          <div class="field">
            <button id="setupHumanoidBoneBtn" type="button" title="Auto-generate humanoid parent-child rig">Auto Rig Humanoid</button>
          </div>
          <div id="setupHumanoidOptions" class="field">
            <div class="field two-col">
              <label>
                <span>Pose Source</span>
                <select id="setupHumanoidSourceMode">
                  <option value="auto" selected>Auto</option>
                  <option value="project">Project Image</option>
                  <option value="active_slot">Active Slot</option>
                </select>
              </label>
              <label>
                <span>Min Score</span>
                <input id="setupHumanoidMinScore" type="number" min="0.05" max="0.95" step="0.05" value="0.20" />
              </label>
            </div>
            <label class="slot-inline-check">
              <input id="setupHumanoidSmoothing" type="checkbox" checked />
              <span>Detector Smoothing</span>
            </label>
            <label class="slot-inline-check">
              <input id="setupHumanoidFallback" type="checkbox" checked />
              <span>Allow Missing-Point Fallback</span>
            </label>
          </div>
        </div>
      </details>
    `;
    const remesh = els.remeshBtn && els.remeshBtn.parentElement === els.leftMeshSetup ? els.remeshBtn : null;
    if (remesh && remesh.nextSibling) els.leftMeshSetup.insertBefore(wrap, remesh.nextSibling);
    else els.leftMeshSetup.appendChild(wrap);
  }
  els.setupHumanoidBoneBtn = document.getElementById("setupHumanoidBoneBtn");
  els.setupHumanoidSourceMode = document.getElementById("setupHumanoidSourceMode");
  els.setupHumanoidMinScore = document.getElementById("setupHumanoidMinScore");
  els.setupHumanoidSmoothing = document.getElementById("setupHumanoidSmoothing");
  els.setupHumanoidFallback = document.getElementById("setupHumanoidFallback");
  els.setupAutoWeightSingleBtn = document.getElementById("setupAutoWeightSingleBtn");
  els.setupAutoWeightMultiBtn = document.getElementById("setupAutoWeightMultiBtn");
  els.setupEditWeightsBtn = document.getElementById("setupEditWeightsBtn");
  els.setupAutoWeightSelectionSummary = document.getElementById("setupAutoWeightSelectionSummary");
  bindSetupHumanoidBoneButton();
  bindPoseAutoRigOptionListeners();
  syncPoseAutoRigOptionsToUI();
}

function refreshSetupQuickActions() {
  ensureSetupQuickUIElements();
  const hasMesh = !!state.mesh;
  const editMode = state.boneMode === "edit";
  const hasSlot = !!getActiveSlot();
  const bindSelection = hasMesh ? getBindSelectionState(state.mesh) : { slotIndices: [], boneIndices: [], primaryBone: -1, slotPreview: "(none)", bonePreview: "(slot default)" };
  const selectedBones = bindSelection.boneIndices;
  const selectedSlots = bindSelection.slotIndices;
  if (els.setupHumanoidBoneBtn) {
    const ready = hasMesh && editMode;
    els.setupHumanoidBoneBtn.disabled = false;
    els.setupHumanoidBoneBtn.title = ready
      ? "Auto-generate humanoid parent-child rig"
      : "Need mesh + Skeleton/Edit mode";
  }
  if (els.setupHumanoidSourceMode) els.setupHumanoidSourceMode.disabled = false;
  if (els.setupHumanoidMinScore) els.setupHumanoidMinScore.disabled = false;
  if (els.setupHumanoidSmoothing) els.setupHumanoidSmoothing.disabled = false;
  if (els.setupHumanoidFallback) els.setupHumanoidFallback.disabled = false;
  if (els.setupAutoWeightSingleBtn) {
    const singleOn = (state.weightMode || "hard") === "hard";
    els.setupAutoWeightSingleBtn.disabled = !hasMesh || !editMode;
    els.setupAutoWeightSingleBtn.classList.toggle("active", singleOn);
  }
  if (els.setupAutoWeightMultiBtn) {
    const multiOn = (state.weightMode || "hard") === "soft";
    els.setupAutoWeightMultiBtn.disabled = !hasMesh || !editMode;
    els.setupAutoWeightMultiBtn.classList.toggle("active", multiOn);
  }
  if (els.setupEditWeightsBtn) els.setupEditWeightsBtn.disabled = !hasMesh || !hasSlot;
  if (els.setupAutoWeightSelectionSummary) {
    if (!hasMesh) {
      els.setupAutoWeightSelectionSummary.textContent = "Bind / Auto Weight target: no mesh.";
    } else {
      els.setupAutoWeightSelectionSummary.textContent =
        `Bind / Auto Weight target: ${selectedSlots.length} slot(s) x ${selectedBones.length} bone(s) | ` +
        `Slots: ${bindSelection.slotPreview} | Bones: ${bindSelection.bonePreview}`;
    }
  }
}

function updateWorkspaceUI() {
  const systemMode = getCurrentSystemMode();
  if (state.currentSystemMode !== systemMode) {
    persistLeftToolTabForSystemMode(state.currentSystemMode, state.leftToolTab);
    state.currentSystemMode = systemMode;
    restoreLeftToolTabForSystemMode(systemMode);
  }
  const canBuildPages = state.boneMode === "edit";
  const isSysAnimate = systemMode === "animate";
  const canObjectPage = state.boneMode === "object" && (state.editMode === "skeleton" || state.editMode === "object");
  let page = state.uiPage === "slot" || state.uiPage === "anim" || state.uiPage === "object" ? state.uiPage : "rig";
  if (isSysAnimate && page !== "anim") {
    page = "anim";
    state.uiPage = page;
  } else if (page === "anim" && !isSysAnimate) {
    page = "rig";
    state.uiPage = page;
  }
  if (page === "slot" && !canBuildPages && state.editMode !== "mesh") {
    page = "rig";
    state.uiPage = page;
  }
  if (page === "object" && !canObjectPage) {
    page = "rig";
    state.uiPage = page;
  }
  const sub = state.animSubPanel === "layers" || state.animSubPanel === "state" ? state.animSubPanel : "timeline";
  const animAuxMode = page === "anim" && (sub === "layers" || sub === "state");
  const timelineVisible = page === "anim" && sub === "timeline";
  const timelineMinimized = timelineVisible && !!state.anim.timelineMinimized;
  const isSlotMesh = isSlotMeshModeActive();
  const setVisible = (el, show) => {
    if (!el) return;
    el.style.display = show ? "" : "none";
  };
  if (els.appRoot) {
    els.appRoot.classList.toggle("page-slot", page === "slot");
    els.appRoot.classList.toggle("page-rig", page === "rig");
    els.appRoot.classList.toggle("page-object", page === "object");
    els.appRoot.classList.toggle("page-anim", page === "anim");
    els.appRoot.classList.toggle("timeline-minimized", timelineMinimized);
  }
  if (els.slotSelectWrap) setVisible(els.slotSelectWrap, false);
  if (els.slotViewWrap) setVisible(els.slotViewWrap, true);
  if (els.editMode) els.editMode.value = state.editMode;
  const isSkeleton = state.editMode === "skeleton";
  const isMeshEdit = state.editMode === "mesh";
  // Sync type buttons and mode dropdown (must be after isMeshEdit is declared)
  const wsType = isMeshEdit ? "mesh" : (state.boneMode === "object" ? "object" : "rig");
  const wsMode = isSysAnimate ? "animate" : "edit";
  if (els.workspaceTabRig)    { els.workspaceTabRig.classList.toggle("active",    wsType === "rig");    }
  if (els.workspaceTabSlot)   { els.workspaceTabSlot.classList.toggle("active",   wsType === "mesh");   }
  if (els.workspaceTabObject) { els.workspaceTabObject.classList.toggle("active", wsType === "object"); els.workspaceTabObject.disabled = !state.mesh; }
  if (els.wsModeSelect) {
    els.wsModeSelect.value = wsMode;
    els.wsModeSelect.dataset.mode = wsMode;
  }
  const isRigEdit = !isMeshEdit && isSkeleton && state.boneMode === "edit";
  const isRigObject = !isMeshEdit && (isSkeleton || state.editMode === "object") && state.boneMode === "object";
  const isRigPose = !isMeshEdit && isSkeleton && state.boneMode === "pose";
  const isAnimTimelinePage = page === "anim" && !animAuxMode;

  // Left tool tabs: per-workspace fixed sets for clarity.
  // Rig workspace (page=rig):        bones, rig, ik, constraint, path, skin, tools
  // Mesh workspace (page=slot/mesh): slotmesh, canvas
  // Object workspace (page=object):  object, tools
  // Animate workspace (page=anim):   canvas, bones, ik, constraint, path, skin, tools
  const isRigPage   = page === "rig";
  const isMeshPage  = page === "slot" || isMeshEdit;
  const isObjPage   = page === "object";
  const isAnimPage  = page === "anim" && !animAuxMode;
  const tabVisible = animAuxMode
    ? { canvas: false, setup: false, rig: false, object: false, ik: false, constraint: false, path: false, skin: false, tools: false, slotmesh: false }
    : {
      canvas:     isMeshPage || isAnimPage,
      setup:      isRigPage || isAnimPage,   // "Bones" tab
      rig:        isRigPage && isRigEdit,
      object:     isObjPage,
      ik:         (isRigPage || isAnimPage) && isSkeleton,
      constraint: (isRigPage || isAnimPage) && isSkeleton,
      path:       (isRigPage || isAnimPage) && isSkeleton,
      skin:       (isRigPage || isAnimPage) && (isRigEdit || isRigPose),
      tools:      isRigPage || isObjPage || isAnimPage,
      slotmesh:   isMeshPage,
    };
  const visibleTabs = Object.keys(tabVisible).filter((k) => tabVisible[k]);
  if (!animAuxMode && !visibleTabs.includes(state.leftToolTab)) {
    setLeftToolTab(visibleTabs[0] || getDefaultLeftToolTab(systemMode), systemMode);
  } else {
    persistLeftToolTabForSystemMode(systemMode, state.leftToolTab);
  }

  const tabButtonById = {
    canvas: els.leftTabCanvas,
    setup: els.leftTabSetup,
    rig: els.leftTabRig,
    object: els.leftTabObject,
    ik: els.leftTabIK,
    constraint: els.leftTabConstraint,
    path: els.leftTabPath,
    skin: els.leftTabSkin,
    tools: els.leftTabTools,
    slotmesh: els.leftTabSlotMesh,
  };
  const tabPanelById = {
    canvas: els.leftCanvasTools,
    setup: els.leftMeshSetup,
    rig: els.leftRigBuild,
    object: els.leftObjectTools,
    ik: els.leftIKTools,
    constraint: els.leftConstraintTools,
    path: els.leftPathTools,
    skin: els.leftSkinTools,
    tools: els.leftGeneralTools,
    slotmesh: els.slotMeshTools,
  };
  if (els.leftToolTabs) setVisible(els.leftToolTabs, !animAuxMode && visibleTabs.length > 1);
  for (const [tab, btn] of Object.entries(tabButtonById)) {
    const show = !!tabVisible[tab];
    setVisible(btn, show);
    if (btn) btn.classList.toggle("active", show && tab === state.leftToolTab);
  }
  for (const [tab, panel] of Object.entries(tabPanelById)) {
    const show = !animAuxMode && !!tabVisible[tab] && tab === state.leftToolTab;
    if (panel) {
      panel.classList.toggle("active", show);
      panel.style.display = show ? "flex" : "none";
    }
  }
  if (els.timelineDock) {
    setVisible(els.timelineDock, timelineVisible);
    els.timelineDock.classList.toggle("minimized", timelineMinimized);
  }
  if (els.layerDock) els.layerDock.style.display = page === "anim" && sub === "layers" ? "flex" : "none";
  if (els.stateDock) els.stateDock.style.display = page === "anim" && sub === "state" ? "flex" : "none";
  if (els.timelineResizer) setVisible(els.timelineResizer, page === "anim" && !timelineMinimized);
  if (els.timelineCollapseBtn) {
    els.timelineCollapseBtn.textContent = timelineMinimized ? "Restore" : "Min";
    els.timelineCollapseBtn.title = timelineMinimized ? "Restore timeline" : "Minimize timeline";
    els.timelineCollapseBtn.setAttribute("aria-pressed", timelineMinimized ? "true" : "false");
  }
  if (els.exportDock) els.exportDock.style.display = state.exportPanelOpen ? "flex" : "none";
  if (els.animSubTabTimeline) els.animSubTabTimeline.classList.toggle("active", page === "anim" && sub === "timeline");
  if (els.animSubTabLayers) els.animSubTabLayers.classList.toggle("active", page === "anim" && sub === "layers");
  if (els.animSubTabState) els.animSubTabState.classList.toggle("active", page === "anim" && sub === "state");
  if (els.animateSubTabs) setVisible(els.animateSubTabs, page === "anim");
  refreshRightPropsPanelVisibility();

  if (els.leftToolModeHint) {
    if (page === "slot") {
      els.leftToolModeHint.textContent = "Mesh workspace: Base Transform tab for image offset, Mesh tab for vertex/weight editing.";
    } else if (page === "anim" && sub === "layers") {
      els.leftToolModeHint.textContent = "Animate > Animation Layers";
    } else if (page === "anim" && sub === "state") {
      els.leftToolModeHint.textContent = "Animate > State Machine";
    } else if (page === "anim" && isMeshEdit) {
      els.leftToolModeHint.textContent = "Animate Mesh: drag vertices on canvas to key FFD deformation.";
    } else if (isMeshEdit) {
      els.leftToolModeHint.textContent = "Mesh workspace: Base Transform tab for image offset, Mesh tab for vertex/weight editing.";
    } else if (isRigEdit) {
      els.leftToolModeHint.textContent = "Rig workspace: bones, IK, constraints, skin tabs available.";
    } else if (isRigObject) {
      els.leftToolModeHint.textContent = "Object workspace: move / scale / rotate whole object chains.";
    } else if (isRigPose) {
      els.leftToolModeHint.textContent = "Animate workspace: IK, constraints, skin, and tools tabs available.";
    } else {
      els.leftToolModeHint.textContent = "";
    }
  }
  // Sync data-workspace on appRoot for CSS theming
  if (els.appRoot) {
    els.appRoot.dataset.workspace = isSysAnimate ? "animate" : "build";
  }
  // Badge: show sub-info (e.g. "Pose" or "Object Anim") when in animate mode
  if (els.workspaceModeLabel) {
    if (isSysAnimate) {
      const label = isMeshEdit ? "Mesh Animate" : isRigObject ? "Object Animate" : "Pose";
      els.workspaceModeLabel.textContent = "● " + label;
    } else {
      els.workspaceModeLabel.textContent = "";
    }
  }
  refreshBaseImageTransformUI();
  refreshVertexDeformUI();
  refreshWebGLSupportUI();
  refreshSlotMeshToolModeUI();
  refreshSlotMeshEditTargetUI();
  refreshCanvasInteractionAffordance();
  refreshSetupQuickActions();
  if (isSlotMeshEditTabActive()) {
    const slot = getActiveSlot();
    if (slot) syncSlotContourFromMeshData(slot, false);
  }
  if (state.boneMode === "edit") ensureRigEditPreviewCache(false);
  else clearRigEditPreviewCache();
}

function setWorkspacePage(page) {
  const prevMode = state.boneMode;
  const systemMode = getCurrentSystemMode();
  const requested = page === "slot" || page === "anim" || page === "object" ? page : "rig";
  const next = systemMode === "animate" && requested === "object" ? "anim" : requested;
  state.uiPage = next;
  if (requested === "object") {
    state.editMode = "skeleton";
    state.boneMode = "object";
    if (els.boneMode) els.boneMode.value = "object";
    if (systemMode === "animate") state.animSubPanel = "timeline";
    if (state.leftToolTab === "slotmesh" || (systemMode === "animate" && state.leftToolTab !== "object")) setLeftToolTab("object");
  } else if (next === "slot") {
    state.editMode = "mesh";
    if (state.leftToolTab !== "slotmesh" && state.leftToolTab !== "canvas") setLeftToolTab("slotmesh");
  } else if (next === "anim" && state.editMode === "mesh") {
    state.animSubPanel = "timeline";
    if (state.leftToolTab !== "slotmesh" && state.leftToolTab !== "canvas") setLeftToolTab("slotmesh");
  } else if (next === "anim") {
    state.animSubPanel = "timeline";
    if (state.editMode === "skeleton" && state.boneMode !== "object") state.boneMode = "pose";
  } else if (state.editMode === "mesh") {
    state.editMode = "skeleton";
    if (state.leftToolTab === "slotmesh" || state.leftToolTab === "canvas") setLeftToolTab("setup");
    if (systemMode === "setup") {
      state.boneMode = "edit";
      if (els.boneMode) els.boneMode.value = "edit";
    }
  } else if (next === "rig" && systemMode === "setup") {
    state.boneMode = "edit";
    if (els.boneMode) els.boneMode.value = "edit";
  }
  if (els.editMode) els.editMode.value = state.editMode;
  state.workspaceMode = state.editMode === "mesh" ? "slotmesh" : "rig";
  if (state.editMode !== "skeleton") state.pathEdit.drawArmed = false;
  if (next !== "anim") {
    state.animSubPanel = "timeline";
    state.exportPanelOpen = false;
  }
  applyBoneModeTransition(prevMode, state.boneMode);
  updateWorkspaceUI();
  renderTimelineTracks();
}

function setupLeftToolTabs() {
  const bind = (el, tab) => {
    if (!el) return;
    el.addEventListener("click", () => {
      setLeftToolTab(tab);
      updateWorkspaceUI();
    });
  };
  bind(els.leftTabSetup, "setup");
  bind(els.leftTabCanvas, "canvas");
  bind(els.leftTabRig, "rig");
  bind(els.leftTabObject, "object");
  bind(els.leftTabIK, "ik");
  bind(els.leftTabConstraint, "constraint");
  bind(els.leftTabPath, "path");
  bind(els.leftTabSkin, "skin");
  bind(els.leftTabTools, "tools");
  bind(els.leftTabSlotMesh, "slotmesh");
}
