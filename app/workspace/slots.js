// Split from app.js
// Part: Slot attachment selection, binding helpers, contour/mesh tooling, renderable slot helpers
// Original source: app/02-workspace-slot-mesh.js (segment 2)
function getPrimarySelectedBoneIndex() {
  const m = state.mesh;
  if (!m || !Array.isArray(m.rigBones) || m.rigBones.length === 0) return -1;
  const primary = Number(state.selectedBone);
  if (Number.isFinite(primary) && primary >= 0 && primary < m.rigBones.length) return primary;
  const picked = getSelectedBonesForWeight(m);
  if (picked.length > 0) return picked[0];
  return -1;
}

function getActiveAttachment(slot) {
  if (!slot || !Array.isArray(slot.attachments) || slot.attachments.length === 0) return null;
  if (slot.activeAttachment == null) return null;
  const activeName = String(slot.activeAttachment).trim();
  if (!activeName) return null;
  const found = slot.attachments.find((a) => a.name === activeName);
  return found || null;
}

function getSlotCanvas(slot, options = {}) {
  if (!slot) return null;
  const allowAnyAttachment =
    options && Object.prototype.hasOwnProperty.call(options, "allowAnyAttachment")
      ? options.allowAnyAttachment !== false
      : true;
  const active = getActiveAttachment(slot);
  if (active && active.canvas) return active.canvas;
  if (!allowAnyAttachment || !Array.isArray(slot.attachments)) return null;
  const fallback = slot.attachments.find((a) => a && a.canvas);
  return fallback ? fallback.canvas : null;
}

function getSlotDisplayNameByIndex(index) {
  const si = Number(index);
  const slot = Number.isFinite(si) && si >= 0 && si < state.slots.length ? state.slots[si] : null;
  return slot && slot.name ? String(slot.name) : `slot_${Number.isFinite(si) ? si : "?"}`;
}

function getBoneDisplayName(m, index) {
  const bi = Number(index);
  const bones = m && Array.isArray(m.rigBones) ? m.rigBones : [];
  const bone = Number.isFinite(bi) && bi >= 0 && bi < bones.length ? bones[bi] : null;
  return bone && bone.name ? String(bone.name) : `bone_${Number.isFinite(bi) ? bi : "?"}`;
}

function summarizeSelectionNames(names, maxItems = 3, emptyLabel = "(none)") {
  const list = Array.isArray(names) ? names.filter((name) => String(name || "").trim().length > 0) : [];
  if (list.length <= 0) return emptyLabel;
  const shown = list.slice(0, Math.max(1, Number(maxItems) || 3)).join(", ");
  return list.length > maxItems ? `${shown}...` : shown;
}

function getBindSelectionState(m = state.mesh) {
  const hasMesh = !!(m && Array.isArray(m.rigBones));
  const slotIndices = hasMesh && state.slots.length > 0 ? getSelectedSlotIndicesForAutoWeight() : [];
  const boneIndices = hasMesh ? getSelectedBonesForWeight(m) : [];
  const primaryBone = hasMesh ? getPrimarySelectedBoneIndex() : -1;
  return {
    slotIndices,
    boneIndices,
    primaryBone,
    slotPreview: summarizeSelectionNames(slotIndices.map((si) => getSlotDisplayNameByIndex(si))),
    bonePreview: summarizeSelectionNames(
      boneIndices.map((bi) => getBoneDisplayName(m, bi)),
      3,
      "(slot default)"
    ),
  };
}

function bindSingleSlotToBone(slot, m, bone) {
  if (!slot || !m || !Number.isFinite(bone) || bone < 0 || bone >= m.rigBones.length) return false;
  slot.bone = bone;
  const att = getActiveAttachment(slot);
  const mode = getSlotWeightMode(slot);
  if (att) {
    if (mode === "single") {
      att.weightMode = "single";
      att.weightBindMode = "single";
      att.useWeights = true;
      att.influenceBones = [bone];
    } else if (mode === "weighted") {
      att.weightMode = "weighted";
      att.weightBindMode = "auto";
      att.useWeights = true;
      att.influenceBones = [...new Set([bone, ...(Array.isArray(att.influenceBones) ? att.influenceBones : [])])];
    } else {
      att.weightMode = "single";
      att.weightBindMode = "single";
      att.useWeights = true;
      att.influenceBones = [bone];
    }
  }
  ensureSlotsHaveBoneBinding();
  rebuildSlotWeights(slot, m);
  return true;
}

function bindSingleSlotWeightedToBones(slot, m, picked) {
  if (!slot || !m) return false;
  const expandedPicked = expandSelectedBonesToSubtrees(m, picked);
  if (!Array.isArray(expandedPicked) || expandedPicked.length === 0) return false;
  slot.bone = expandedPicked[0];
  const att = getActiveAttachment(slot);
  if (att) {
    att.weightMode = "weighted";
    att.weightBindMode = "auto";
    att.useWeights = true;
    att.influenceBones = [...new Set(expandedPicked)];
  }
  ensureSlotsHaveBoneBinding();
  rebuildSlotWeights(slot, m);
  return true;
}

function finalizeBatchSlotBinding(boundSlotIndices) {
  if (!Array.isArray(boundSlotIndices) || boundSlotIndices.length <= 0) return;
  const focusIndex = Number(boundSlotIndices[boundSlotIndices.length - 1]);
  if (Number.isFinite(focusIndex) && focusIndex >= 0 && focusIndex < state.slots.length) {
    if (state.activeSlot !== focusIndex) setActiveSlot(focusIndex);
    else refreshSlotUI();
  } else {
    refreshSlotUI();
  }
  renderBoneTree();
}

function buildSingleBindStatusMessage(boundCount, boneIndex, m = state.mesh) {
  const boneName = getBoneDisplayName(m, boneIndex);
  return `Bound ${boundCount} slot(s) -> ${boneName}.`;
}

function buildWeightedBindStatusMessage(boundCount, boneIndices, m = state.mesh) {
  const names = Array.isArray(boneIndices) ? boneIndices.map((bi) => getBoneDisplayName(m, bi)) : [];
  return `Weighted bound ${boundCount} slot(s) -> ${summarizeSelectionNames(names, 4, "(none)")}.`;
}

function bindSelectedSlotsToPrimaryBone() {
  const m = state.mesh;
  if (!m) return 0;
  const selection = getBindSelectionState(m);
  if (selection.slotIndices.length <= 0 || selection.primaryBone < 0) return 0;
  const boundSlotIndices = [];
  for (const si of selection.slotIndices) {
    const slot = state.slots[si];
    if (!slot) continue;
    if (!bindSingleSlotToBone(slot, m, selection.primaryBone)) continue;
    boundSlotIndices.push(si);
  }
  if (boundSlotIndices.length > 0) finalizeBatchSlotBinding(boundSlotIndices);
  return boundSlotIndices.length;
}

function bindSelectedSlotsToSelectedBones() {
  const m = state.mesh;
  if (!m) return 0;
  const selection = getBindSelectionState(m);
  if (selection.slotIndices.length <= 0 || selection.boneIndices.length <= 0) return 0;
  const boundSlotIndices = [];
  for (const si of selection.slotIndices) {
    const slot = state.slots[si];
    if (!slot) continue;
    if (!bindSingleSlotWeightedToBones(slot, m, selection.boneIndices)) continue;
    boundSlotIndices.push(si);
  }
  if (boundSlotIndices.length > 0) finalizeBatchSlotBinding(boundSlotIndices);
  return boundSlotIndices.length;
}

function bindActiveSlotToSelectedBone() {
  return bindSelectedSlotsToPrimaryBone();
}

function bindActiveSlotWeightedToSelectedBones() {
  return bindSelectedSlotsToSelectedBones();
}

function normalizeEdgePairs(edges, pointCount) {
  if (!Array.isArray(edges) || pointCount <= 1) return [];
  const out = [];
  const used = new Set();
  for (const e of edges) {
    if (!Array.isArray(e) || e.length < 2) continue;
    let a = Number(e[0]);
    let b = Number(e[1]);
    if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
    a = Math.floor(a);
    b = Math.floor(b);
    if (a === b || a < 0 || b < 0 || a >= pointCount || b >= pointCount) continue;
    if (a > b) [a, b] = [b, a];
    const key = `${a}:${b}`;
    if (used.has(key)) continue;
    used.add(key);
    out.push([a, b]);
  }
  return out;
}

function linkSelectedSlotMeshEdge(shouldLink) {
  const slot = getActiveSlot();
  if (!slot) return false;
  const contour = ensureSlotContour(slot);
  const activeSet = state.slotMesh.activeSet === "fill" ? "fill" : "contour";
  const activePoints = activeSet === "fill" ? contour.fillPoints : contour.points;
  const activeEdges = activeSet === "fill" ? contour.fillManualEdges : contour.manualEdges;

  const getTriangles = () => activeSet === "fill" ? contour.fillTriangles : contour.triangles;
  const setTriangles = (t) => { if (activeSet === "fill") contour.fillTriangles = t; else contour.triangles = t; };

  if (shouldLink) {
    // Link: require exactly 2 vertices
    let pair = null;
    if (state.slotMesh.edgeSelectionSet === activeSet && state.slotMesh.edgeSelection.length === 2) {
      pair = state.slotMesh.edgeSelection;
    } else {
      const sel = getSlotMeshSelection(activeSet, activePoints.length);
      if (sel.length === 2) pair = sel;
    }
    if (!pair) return false;
    const [a0, b0] = pair;
    const a = Math.min(a0, b0);
    const b = Math.max(a0, b0);
    if (a < 0 || b >= activePoints.length || a === b) return false;

    // Add to contourEdges (visual edge)
    if (activeSet === "contour" && Array.isArray(contour.contourEdges)) {
      const cHad = contour.contourEdges.some(e => Math.min(e[0], e[1]) === a && Math.max(e[0], e[1]) === b);
      if (!cHad) contour.contourEdges.push([a0, b0]);
    }
    // Persist as manual edge constraint (for re-triangulation)
    const key = `${a}:${b}`;
    const had = new Set(activeEdges.map((e) => `${Math.min(e[0], e[1])}:${Math.max(e[0], e[1])}`)).has(key);
    if (!had) activeEdges.push([a, b]);
    // Force into existing triangulation if present (don't create new one)
    let tris = getTriangles();
    if (tris.length >= 3) {
      tris = forceEdgeByFlip(activePoints, tris, a, b);
      setTriangles(tris);
    }
    return true;
  } else {
    // Unlink: support 2 or more selected vertices — remove ALL edges among them
    let sel = null;
    if (state.slotMesh.edgeSelectionSet === activeSet && state.slotMesh.edgeSelection.length >= 2) {
      sel = state.slotMesh.edgeSelection;
    }
    if (!sel || sel.length < 2) {
      sel = getSlotMeshSelection(activeSet, activePoints.length);
    }
    if (!sel || sel.length < 2) return false;

    // Build set of all edge pairs among selected vertices
    const selSet = new Set(sel);
    const edgePairs = [];
    const selArr = [...selSet].sort((x, y) => x - y);
    for (let i = 0; i < selArr.length; i++) {
      for (let j = i + 1; j < selArr.length; j++) {
        edgePairs.push([selArr[i], selArr[j]]);
      }
    }

    let didSomething = false;

    // Remove from contourEdges
    if (activeSet === "contour" && Array.isArray(contour.contourEdges)) {
      const before = contour.contourEdges.length;
      const pairSet = new Set(edgePairs.map(([a, b]) => `${a}:${b}`));
      const cFiltered = contour.contourEdges.filter(e => {
        const lo = Math.min(e[0], e[1]);
        const hi = Math.max(e[0], e[1]);
        return !pairSet.has(`${lo}:${hi}`);
      });
      if (cFiltered.length < before) {
        contour.contourEdges.length = 0;
        for (const e of cFiltered) contour.contourEdges.push(e);
        didSomething = true;
      }
    }

    // Remove from triangulation via edge flips
    let tris = getTriangles();
    if (tris.length >= 6) {
      for (const [a, b] of edgePairs) {
        tris = getTriangles();
        if (!hasTriangleEdge(tris, a, b)) continue;
        const triList = [];
        for (let i = 0; i + 2 < tris.length; i += 3) triList.push([tris[i], tris[i + 1], tris[i + 2]]);
        let flipped = false;
        for (let ti = 0; ti < triList.length && !flipped; ti++) {
          for (let tj = ti + 1; tj < triList.length && !flipped; tj++) {
            const ta = triList[ti];
            const tb = triList[tj];
            if (!ta.includes(a) || !ta.includes(b) || !tb.includes(a) || !tb.includes(b)) continue;
            const oa = ta.find((v) => v !== a && v !== b);
            const ob = tb.find((v) => v !== a && v !== b);
            if (oa == null || ob == null || oa === ob) continue;
            triList[ti] = [oa, ob, a];
            triList[tj] = [ob, oa, b];
            flipped = true;
          }
        }
        if (flipped) {
          const out = [];
          for (const tri of triList) out.push(tri[0], tri[1], tri[2]);
          setTriangles(out);
          didSomething = true;
        }
      }
    }

    if (!didSomething) return false;
    // Remove from manual edge constraints
    const pairSet = new Set(edgePairs.map(([a, b]) => `${a}:${b}`));
    const filtered = activeEdges.filter((e) => {
      const lo = Math.min(e[0], e[1]);
      const hi = Math.max(e[0], e[1]);
      return !pairSet.has(`${lo}:${hi}`);
    });
    activeEdges.length = 0;
    for (const e of filtered) activeEdges.push(e);
    return true;
  }
}

function ensureSlotContour(slot) {
  if (!slot) return { points: [], closed: false, triangles: [] };
  const att = getActiveAttachment(slot);
  if (!att) return { points: [], closed: false, triangles: [] };
  if (!att.meshContour || !Array.isArray(att.meshContour.points)) {
    att.meshContour = {
      points: [],
      sourcePoints: [],
      authorContourPoints: [],
      closed: false,
      contourEdges: [],
      triangles: [],
      fillPoints: [],
      fillTriangles: [],
      manualEdges: [],
      fillManualEdges: [],
      dirty: false,
      fillFromMeshData: false,
    };
  }
  const c = att.meshContour;
  if (!Array.isArray(c.sourcePoints)) c.sourcePoints = [];
  if (!Array.isArray(c.authorContourPoints)) c.authorContourPoints = [];
  if (c.authorContourPoints.length < 3 && c.sourcePoints.length >= 3) {
    c.authorContourPoints = cloneSlotMeshPoints(c.sourcePoints);
  }
  if (c.authorContourPoints.length < 3 && c.points.length >= 3) {
    c.authorContourPoints = cloneSlotMeshPoints(c.points);
  }
  if (c.sourcePoints.length < 3 && c.authorContourPoints.length >= 3) {
    c.sourcePoints = cloneSlotMeshPoints(c.authorContourPoints);
  }
  if (!Array.isArray(c.triangles)) c.triangles = [];
  if (!Array.isArray(c.fillPoints)) c.fillPoints = [];
  if (!Array.isArray(c.fillTriangles)) c.fillTriangles = [];
  if (!Array.isArray(c.manualEdges)) c.manualEdges = [];
  if (!Array.isArray(c.fillManualEdges)) c.fillManualEdges = [];
  if (typeof c.dirty !== "boolean") c.dirty = false;
  if (typeof c.fillFromMeshData !== "boolean") c.fillFromMeshData = false;
  c.manualEdges = normalizeEdgePairs(c.manualEdges, c.points.length);
  c.fillManualEdges = normalizeEdgePairs(c.fillManualEdges, c.fillPoints.length);
  c.closed = !!c.closed;
  if (!Array.isArray(c.contourEdges)) {
    // Backward compat: generate contourEdges from sequential points
    c.contourEdges = [];
    for (let i = 0; i + 1 < c.points.length; i++) {
      c.contourEdges.push([i, i + 1]);
    }
    if (c.closed && c.points.length >= 3) {
      c.contourEdges.push([c.points.length - 1, 0]);
    }
  }
  return c;
}

function markSlotContourDirty(slot, dirty = true) {
  if (!slot) return;
  const contour = ensureSlotContour(slot);
  contour.dirty = !!dirty;
  if (dirty) contour.fillFromMeshData = false;
}

// ============================================================
// SECTION: Mesh / FFD — Contour, Triangulation, Vertex Deform
// syncSlotContourFromMeshData: keeps slot contour in sync with mesh.
// triangulatePolygon / triangulateContourPoints: auto triangulation.
// ============================================================
function syncSlotContourFromMeshData(slot, force = false) {
  const m = state.mesh;
  if (!m || !slot) return false;
  ensureSlotMeshData(slot, m);
  const sm = (getActiveAttachment(slot) || {}).meshData;
  if (!sm || !sm.positions || !sm.indices) return false;
  const contour = ensureSlotContour(slot);
  if (!force && contour.dirty) return false;
  const vCount = Math.floor((Number(sm.positions.length) || 0) / 2);
  if (vCount <= 0) return false;
  if (
    !force &&
    contour.fillFromMeshData &&
    !contour.dirty &&
    Array.isArray(contour.fillPoints) &&
    contour.fillPoints.length === vCount &&
    Array.isArray(contour.fillTriangles) &&
    contour.fillTriangles.length === sm.indices.length
  ) {
    return false;
  }
  const normalizedGrid = normalizeGridMeshPreviewData(sm);
  contour.fillPoints = normalizedGrid
    ? normalizedGrid.points
    : Array.from({ length: vCount }, (_, i) => ({
      x: Number(sm.positions[i * 2]) || 0,
      y: Number(sm.positions[i * 2 + 1]) || 0,
    }));
  contour.fillTriangles = normalizedGrid
    ? normalizedGrid.triangles
    : Array.from(sm.indices || []);
  contour.fillManualEdges = [];
  contour.triangles = [];
  contour.fillFromMeshData = true;
  contour.dirty = false;
  if (!Array.isArray(contour.points) || contour.points.length < 3) {
    contour.points = cloneSlotMeshPoints(contour.fillPoints);
    contour.closed = contour.points.length >= 3;
    syncSlotContourSourcePoints(contour);
  }
  if (isSlotMeshEditTabActive()) {
    state.slotMesh.activeSet = "fill";
    state.slotMesh.activePoint = contour.fillPoints.length > 0 ? math.clamp(Number(state.slotMesh.activePoint) || 0, 0, contour.fillPoints.length - 1) : -1;
    state.slotMesh.edgeSelectionSet = "fill";
    const sel = getSlotMeshSelection("fill", contour.fillPoints.length);
    if (sel.length <= 0 && contour.fillPoints.length > 0) {
      state.slotMesh.edgeSelection = [0];
      setSlotMeshSelection("fill", [0], contour.fillPoints.length);
    }
  }
  return true;
}

function buildGridTrianglesFromCells(cols, rows) {
  const out = [];
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const i0 = y * (cols + 1) + x;
      const i1 = i0 + 1;
      const i2 = i0 + (cols + 1);
      const i3 = i2 + 1;
      if (((x + y) & 1) === 0) out.push(i0, i2, i3, i0, i3, i1);
      else out.push(i0, i2, i1, i1, i2, i3);
    }
  }
  return out;
}

function normalizeGridAxisValues(values, expectedCount) {
  if (!Array.isArray(values) || values.length <= 0 || expectedCount <= 0) return null;
  const sorted = values
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v))
    .sort((a, b) => a - b);
  if (sorted.length <= 0) return null;
  const span = Math.max(1e-6, sorted[sorted.length - 1] - sorted[0]);
  const eps = Math.max(1e-6, span / Math.max(1, expectedCount * 200));
  const out = [];
  for (const v of sorted) {
    const last = out[out.length - 1];
    if (last == null || Math.abs(v - last) > eps) out.push(v);
  }
  return out.length === expectedCount ? out : null;
}

function normalizeGridMeshPreviewData(meshData) {
  if (!meshData || !meshData.positions) return null;
  const cols = Math.floor(Number(meshData.cols));
  const rows = Math.floor(Number(meshData.rows));
  if (!Number.isFinite(cols) || !Number.isFinite(rows) || cols < 1 || rows < 1) return null;
  const vCount = Math.floor((Number(meshData.positions.length) || 0) / 2);
  if (vCount !== (cols + 1) * (rows + 1)) return null;
  const raw = [];
  const xs = [];
  const ys = [];
  for (let i = 0; i < vCount; i += 1) {
    const x = Number(meshData.positions[i * 2]) || 0;
    const y = Number(meshData.positions[i * 2 + 1]) || 0;
    raw.push({ x, y });
    xs.push(x);
    ys.push(y);
  }
  const xAxis = normalizeGridAxisValues(xs, cols + 1);
  const yAxis = normalizeGridAxisValues(ys, rows + 1);
  if (!xAxis || !yAxis) return null;
  const xStep = cols > 0 ? Math.max(1e-6, (xAxis[xAxis.length - 1] - xAxis[0]) / cols) : 1;
  const yStep = rows > 0 ? Math.max(1e-6, (yAxis[yAxis.length - 1] - yAxis[0]) / rows) : 1;
  const xTol = Math.max(1e-4, xStep * 0.25);
  const yTol = Math.max(1e-4, yStep * 0.25);
  const grid = new Array(vCount);
  for (const p of raw) {
    let xi = Math.round((p.x - xAxis[0]) / xStep);
    let yi = Math.round((p.y - yAxis[0]) / yStep);
    xi = math.clamp(xi, 0, cols);
    yi = math.clamp(yi, 0, rows);
    if (Math.abs(p.x - xAxis[xi]) > xTol || Math.abs(p.y - yAxis[yi]) > yTol) return null;
    const idx = yi * (cols + 1) + xi;
    if (grid[idx]) return null;
    grid[idx] = { x: p.x, y: p.y };
  }
  if (grid.some((p) => !p)) return null;
  return {
    cols,
    rows,
    points: grid,
    triangles: buildGridTrianglesFromCells(cols, rows),
  };
}

function cloneSlotMeshPoints(points) {
  if (!Array.isArray(points)) return [];
  return points.map((p) => ({ x: Number(p && p.x) || 0, y: Number(p && p.y) || 0 }));
}

function syncSlotContourSourcePoints(contour) {
  if (!contour) return [];
  contour.fillFromMeshData = false;
  contour.authorContourPoints = cloneSlotMeshPoints(contour.points);
  contour.sourcePoints = cloneSlotMeshPoints(contour.authorContourPoints);
  refreshSlotMeshContourReferenceHint();
  return contour.authorContourPoints;
}

function getSlotContourSourcePoints(contour) {
  if (!contour) return [];
  if (!Array.isArray(contour.authorContourPoints)) contour.authorContourPoints = [];
  if (!Array.isArray(contour.sourcePoints)) contour.sourcePoints = [];
  if (contour.authorContourPoints.length >= 3) return cloneSlotMeshPoints(contour.authorContourPoints);
  if (contour.sourcePoints.length >= 3) {
    contour.authorContourPoints = cloneSlotMeshPoints(contour.sourcePoints);
    return cloneSlotMeshPoints(contour.authorContourPoints);
  }
  contour.authorContourPoints = cloneSlotMeshPoints(contour.points);
  contour.sourcePoints = cloneSlotMeshPoints(contour.authorContourPoints);
  return cloneSlotMeshPoints(contour.authorContourPoints);
}

function pointInPolygon2D(p, poly) {
  if (!Array.isArray(poly) || poly.length < 3) return false;
  const x = Number(p.x) || 0;
  const y = Number(p.y) || 0;
  const onSeg = (ax, ay, bx, by, px, py) => {
    const vx = bx - ax;
    const vy = by - ay;
    const wx = px - ax;
    const wy = py - ay;
    const cross = vx * wy - vy * wx;
    if (Math.abs(cross) > 1e-6) return false;
    const dot = wx * vx + wy * vy;
    if (dot < -1e-6) return false;
    const vv = vx * vx + vy * vy;
    return dot <= vv + 1e-6;
  };
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const pi = poly[i];
    const pj = poly[j];
    const yi = Number(pi.y) || 0;
    const yj = Number(pj.y) || 0;
    const xi = Number(pi.x) || 0;
    const xj = Number(pj.x) || 0;
    if (onSeg(xi, yi, xj, yj, x, y)) return true;
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / ((yj - yi) || 1e-8) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function polygonSignedArea(points) {
  if (!Array.isArray(points) || points.length < 3) return 0;
  let sum = 0;
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    sum += a.x * b.y - b.x * a.y;
  }
  return sum * 0.5;
}

function pointInTriangle2D(p, a, b, c) {
  const s1 = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
  const s2 = (c.x - b.x) * (p.y - b.y) - (c.y - b.y) * (p.x - b.x);
  const s3 = (a.x - c.x) * (p.y - c.y) - (a.y - c.y) * (p.x - c.x);
  const hasNeg = s1 < 0 || s2 < 0 || s3 < 0;
  const hasPos = s1 > 0 || s2 > 0 || s3 > 0;
  return !(hasNeg && hasPos);
}

function triangulatePolygon(points) {
  if (!Array.isArray(points) || points.length < 3) return [];
  const n = points.length;
  const area = polygonSignedArea(points);
  const ccw = area >= 0;
  const verts = [];
  for (let i = 0; i < n; i += 1) verts.push(i);
  const out = [];
  let guard = 0;
  while (verts.length > 2 && guard < 10000) {
    guard += 1;
    let earFound = false;
    for (let i = 0; i < verts.length; i += 1) {
      const i0 = verts[(i - 1 + verts.length) % verts.length];
      const i1 = verts[i];
      const i2 = verts[(i + 1) % verts.length];
      const a = points[i0];
      const b = points[i1];
      const c = points[i2];
      const cross = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
      if ((ccw && cross <= 1e-7) || (!ccw && cross >= -1e-7)) continue;
      let hasInside = false;
      for (let j = 0; j < verts.length; j += 1) {
        const vi = verts[j];
        if (vi === i0 || vi === i1 || vi === i2) continue;
        if (pointInTriangle2D(points[vi], a, b, c)) {
          hasInside = true;
          break;
        }
      }
      if (hasInside) continue;
      if (ccw) out.push(i0, i1, i2);
      else out.push(i0, i2, i1);
      verts.splice(i, 1);
      earFound = true;
      break;
    }
  }
  return out;
}

function triangulateContourPoints(points, contourEdges, manualEdges) {
  if (!Array.isArray(points) || points.length < 3) return [];
  let tris = delaunayTriangulate(points);
  const pip = (px, py, pts, edges) => {
    let inside = false;
    for (const edge of edges) {
      if (!Array.isArray(edge) || edge.length < 2) continue;
      const p1 = pts[edge[0]], p2 = pts[edge[1]];
      if (!p1 || !p2) continue;
      const xi = p1.x, yi = p1.y;
      const xj = p2.x, yj = p2.y;
      if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    return inside;
  };
  const activeEdgesForPip = (Array.isArray(contourEdges) && contourEdges.length > 0)
    ? contourEdges
    : points.map((_, i) => [i, (i + 1) % points.length]);

  const filtered = [];
  for (let t = 0; t + 2 < tris.length; t += 3) {
    const a = points[tris[t]], b = points[tris[t + 1]], cc2 = points[tris[t + 2]];
    if (!a || !b || !cc2) continue;
    const cx = (a.x + b.x + cc2.x) / 3;
    const cy = (a.y + b.y + cc2.y) / 3;
    if (pip(cx, cy, points, activeEdgesForPip)) {
      filtered.push(tris[t], tris[t + 1], tris[t + 2]);
    }
  }
  return applyManualEdgesToTriangles(points, filtered, manualEdges);
}

function makePointKey(x, y) {
  return `${Math.round(x * 1000)}:${Math.round(y * 1000)}`;
}

function circumcircleContains(a, b, c, p) {
  const ax = a.x - p.x;
  const ay = a.y - p.y;
  const bx = b.x - p.x;
  const by = b.y - p.y;
  const cx = c.x - p.x;
  const cy = c.y - p.y;
  const det =
    (ax * ax + ay * ay) * (bx * cy - by * cx) -
    (bx * bx + by * by) * (ax * cy - ay * cx) +
    (cx * cx + cy * cy) * (ax * by - ay * bx);
  const orient = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  return orient >= 0 ? det > 1e-8 : det < -1e-8;
}

function delaunayTriangulate(points) {
  if (!Array.isArray(points) || points.length < 3) return [];
  const pts = points.map((p) => ({ x: Number(p.x) || 0, y: Number(p.y) || 0 }));
  let minX = pts[0].x;
  let minY = pts[0].y;
  let maxX = pts[0].x;
  let maxY = pts[0].y;
  for (const p of pts) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  const dx = maxX - minX;
  const dy = maxY - minY;
  const d = Math.max(dx, dy) || 1;
  const midX = (minX + maxX) * 0.5;
  const midY = (minY + maxY) * 0.5;
  const s0 = { x: midX - 20 * d, y: midY - d };
  const s1 = { x: midX, y: midY + 20 * d };
  const s2 = { x: midX + 20 * d, y: midY - d };
  const i0 = pts.length;
  const i1 = pts.length + 1;
  const i2 = pts.length + 2;
  pts.push(s0, s1, s2);
  let tris = [[i0, i1, i2]];
  for (let i = 0; i < points.length; i += 1) {
    const p = pts[i];
    const bad = [];
    for (let t = 0; t < tris.length; t += 1) {
      const tri = tris[t];
      if (circumcircleContains(pts[tri[0]], pts[tri[1]], pts[tri[2]], p)) bad.push(t);
    }
    const edgeMap = new Map();
    for (const bi of bad) {
      const tri = tris[bi];
      const edges = [
        [tri[0], tri[1]],
        [tri[1], tri[2]],
        [tri[2], tri[0]],
      ];
      for (const [a, b] of edges) {
        const lo = Math.min(a, b);
        const hi = Math.max(a, b);
        const key = `${lo}:${hi}`;
        edgeMap.set(key, (edgeMap.get(key) || 0) + 1);
      }
    }
    tris = tris.filter((_, idx) => !bad.includes(idx));
    for (const [key, count] of edgeMap.entries()) {
      if (count !== 1) continue;
      const [a, b] = key.split(":").map((v) => Number(v) || 0);
      tris.push([a, b, i]);
    }
  }
  const out = [];
  for (const tri of tris) {
    if (tri[0] >= points.length || tri[1] >= points.length || tri[2] >= points.length) continue;
    out.push(tri[0], tri[1], tri[2]);
  }
  return out;
}

function hasTriangleEdge(triangles, a, b) {
  if (!Array.isArray(triangles) || triangles.length < 3) return false;
  for (let i = 0; i + 2 < triangles.length; i += 3) {
    const t0 = triangles[i];
    const t1 = triangles[i + 1];
    const t2 = triangles[i + 2];
    if ((t0 === a && t1 === b) || (t1 === a && t0 === b)) return true;
    if ((t1 === a && t2 === b) || (t2 === a && t1 === b)) return true;
    if ((t2 === a && t0 === b) || (t0 === a && t2 === b)) return true;
  }
  return false;
}

function forceEdgeByFlip(points, triangles, edgeA, edgeB) {
  if (!Array.isArray(triangles) || triangles.length < 6 || edgeA === edgeB) return triangles;
  if (hasTriangleEdge(triangles, edgeA, edgeB)) return triangles;
  const triList = [];
  for (let i = 0; i + 2 < triangles.length; i += 3) triList.push([triangles[i], triangles[i + 1], triangles[i + 2]]);
  let changed = false;
  for (let i = 0; i < triList.length; i += 1) {
    for (let j = i + 1; j < triList.length; j += 1) {
      const ta = triList[i];
      const tb = triList[j];
      const common = [];
      for (const v of ta) {
        if (tb.includes(v)) common.push(v);
      }
      if (common.length !== 2) continue;
      const oa = ta.find((v) => v !== common[0] && v !== common[1]);
      const ob = tb.find((v) => v !== common[0] && v !== common[1]);
      if (oa == null || ob == null) continue;
      const match = (oa === edgeA && ob === edgeB) || (oa === edgeB && ob === edgeA);
      if (!match) continue;
      const c0 = common[0];
      const c1 = common[1];
      triList[i] = [edgeA, edgeB, c0];
      triList[j] = [edgeB, edgeA, c1];
      changed = true;
      break;
    }
    if (changed) break;
  }
  if (!changed) return triangles;
  const out = [];
  for (const tri of triList) out.push(tri[0], tri[1], tri[2]);
  return out;
}

function applyManualEdgesToTriangles(points, triangles, manualEdges) {
  if (!Array.isArray(triangles) || triangles.length < 3) return [];
  const edges = normalizeEdgePairs(manualEdges, Array.isArray(points) ? points.length : 0);
  let out = triangles.slice();
  for (const e of edges) {
    out = forceEdgeByFlip(points, out, e[0], e[1]);
  }
  return out;
}

function sanitizeTriangles(points, triangles, poly = null) {
  if (!Array.isArray(points) || points.length < 3 || !Array.isArray(triangles) || triangles.length < 3) return [];
  const out = [];
  const used = new Set();
  const triArea2 = (a, b, c) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  let minX = points[0].x;
  let minY = points[0].y;
  let maxX = points[0].x;
  let maxY = points[0].y;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  const span = Math.max(maxX - minX, maxY - minY, 1);
  // Keep very thin triangles to avoid visual cracks near constrained/manual edges.
  const areaEps = Math.max(1e-10, span * span * 1e-14);
  for (let i = 0; i + 2 < triangles.length; i += 3) {
    const a = Math.floor(Number(triangles[i]));
    const b = Math.floor(Number(triangles[i + 1]));
    const c = Math.floor(Number(triangles[i + 2]));
    if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)) continue;
    if (a < 0 || b < 0 || c < 0 || a >= points.length || b >= points.length || c >= points.length) continue;
    if (a === b || b === c || c === a) continue;
    const pa = points[a];
    const pb = points[b];
    const pc = points[c];
    if (!pa || !pb || !pc) continue;
    if (Math.abs(triArea2(pa, pb, pc)) < areaEps) continue;
    if (Array.isArray(poly) && poly.length >= 3) {
      const cen = { x: (pa.x + pb.x + pc.x) / 3, y: (pa.y + pb.y + pc.y) / 3 };
      if (!pointInPolygon2D(cen, poly)) continue;
    }
    const key = [a, b, c].sort((x, y) => x - y).join(":");
    if (used.has(key)) continue;
    used.add(key);
    out.push(a, b, c);
  }
  return out;
}

function buildSafeFillTriangles(points, triangles, clipPoly = null, manualEdges = []) {
  if (!Array.isArray(points) || points.length < 3) return [];
  let out = applyManualEdgesToTriangles(points, Array.isArray(triangles) ? triangles : [], manualEdges);
  out = sanitizeTriangles(points, out, clipPoly);
  if (out.length >= 3) return out;
  // Fallback: Delaunay over generated fill points, then clip back into polygon.
  out = applyManualEdgesToTriangles(points, delaunayTriangulate(points), manualEdges);
  out = sanitizeTriangles(points, out, clipPoly);
  return out;
}

function dilateBinaryMask(mask, w, h, radius = 1) {
  const r = Math.max(0, Math.floor(Number(radius) || 0));
  if (!mask || r <= 0) return mask;
  let src = new Uint8Array(mask);
  for (let pass = 0; pass < r; pass += 1) {
    const dst = new Uint8Array(src.length);
    for (let y = 0; y < h; y += 1) {
      const y0 = Math.max(0, y - 1);
      const y1 = Math.min(h - 1, y + 1);
      for (let x = 0; x < w; x += 1) {
        let on = 0;
        const x0 = Math.max(0, x - 1);
        const x1 = Math.min(w - 1, x + 1);
        for (let yy = y0; yy <= y1 && !on; yy += 1) {
          const row = yy * w;
          for (let xx = x0; xx <= x1; xx += 1) {
            if (src[row + xx]) {
              on = 1;
              break;
            }
          }
        }
        if (on) dst[y * w + x] = 1;
      }
    }
    src = dst;
  }
  return src;
}

function extractLargestBoundaryLoopFromTriangles(points, triangles) {
  if (!Array.isArray(points) || points.length < 3 || !Array.isArray(triangles) || triangles.length < 3) return [];
  const edgeCount = new Map();
  const edges = [];
  const addEdge = (a, b) => {
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    const key = `${lo}:${hi}`;
    edgeCount.set(key, (edgeCount.get(key) || 0) + 1);
    edges.push([a, b, key]);
  };
  for (let i = 0; i + 2 < triangles.length; i += 3) {
    const a = Number(triangles[i]);
    const b = Number(triangles[i + 1]);
    const c = Number(triangles[i + 2]);
    if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)) continue;
    addEdge(a, b);
    addEdge(b, c);
    addEdge(c, a);
  }
  const boundary = edges.filter((e) => edgeCount.get(e[2]) === 1).map((e) => [e[0], e[1]]);
  if (boundary.length < 3) return [];
  const adj = new Map();
  const pushAdj = (a, b) => {
    const list = adj.get(a);
    if (list) list.push(b);
    else adj.set(a, [b]);
  };
  for (const [a, b] of boundary) {
    pushAdj(a, b);
    pushAdj(b, a);
  }
  const used = new Set();
  const loops = [];
  const edgeKey = (a, b) => `${Math.min(a, b)}:${Math.max(a, b)}`;
  for (const [sa, sb] of boundary) {
    const firstKey = edgeKey(sa, sb);
    if (used.has(firstKey)) continue;
    const loopIdx = [sa];
    let prev = sa;
    let curr = sb;
    used.add(firstKey);
    let guard = 0;
    while (guard < boundary.length * 3) {
      guard += 1;
      loopIdx.push(curr);
      if (curr === sa) break;
      const nextList = (adj.get(curr) || []).filter((n) => !used.has(edgeKey(curr, n)));
      if (nextList.length <= 0) break;
      let next = nextList[0];
      if (nextList.length > 1) {
        const alt = nextList.find((n) => n !== prev);
        if (alt != null) next = alt;
      }
      used.add(edgeKey(curr, next));
      prev = curr;
      curr = next;
    }
    if (loopIdx.length >= 4 && loopIdx[0] === loopIdx[loopIdx.length - 1]) {
      const pts = loopIdx.slice(0, -1).map((i) => points[i]).filter(Boolean);
      if (pts.length >= 3) loops.push(pts);
    }
  }
  if (loops.length <= 0) return [];
  let best = loops[0];
  let bestArea = Math.abs(polygonSignedArea(best));
  for (let i = 1; i < loops.length; i += 1) {
    const area = Math.abs(polygonSignedArea(loops[i]));
    if (area > bestArea) {
      best = loops[i];
      bestArea = area;
    }
  }
  return best.map((p) => ({ x: Number(p.x) || 0, y: Number(p.y) || 0 }));
}

function buildUniformGridFillForContour(contour, colsHint, rowsHint, includeContourPoints = true) {
  if (!contour || !contour.closed || contour.points.length < 3) return { points: [], triangles: [] };
  const poly = contour.points;
  let minX = poly[0].x;
  let minY = poly[0].y;
  let maxX = poly[0].x;
  let maxY = poly[0].y;
  for (const p of poly) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  const cols = math.clamp(Number(colsHint) || 24, 3, 120);
  const rows = math.clamp(Number(rowsHint) || 24, 3, 120);
  const spanX = Math.max(1e-6, maxX - minX);
  const spanY = Math.max(1e-6, maxY - minY);
  // Triangular lattice: edge length s, row spacing h = s * sqrt(3)/2
  const s = Math.max(1e-6, Math.max(spanX / cols, (2 * spanY) / (Math.sqrt(3) * rows)));
  const h = s * Math.sqrt(3) * 0.5;
  const pts = [];
  const used = new Set();
  const rowMin = Math.floor(minY / h) - 2;
  const rowMax = Math.ceil(maxY / h) + 2;
  const colMin = Math.floor(minX / s) - 3;
  const colMax = Math.ceil(maxX / s) + 3;
  const idxByRowCol = new Map();
  const rowCols = new Map();
  const putPoint = (r, c) => {
    const x = c * s + (r & 1 ? s * 0.5 : 0);
    const y = r * h;
    const k = makePointKey(x, y);
    if (used.has(k)) return null;
    used.add(k);
    const idx = pts.length;
    pts.push({ x, y });
    idxByRowCol.set(`${r}:${c}`, idx);
    const list = rowCols.get(r);
    if (list) list.push(c);
    else rowCols.set(r, [c]);
    return idx;
  };
  for (let r = rowMin; r <= rowMax; r += 1) {
    const rowOffset = r & 1 ? s * 0.5 : 0;
    for (let c = colMin; c <= colMax; c += 1) {
      const x = c * s + rowOffset;
      const y = r * h;
      if (!pointInPolygon2D({ x, y }, poly)) continue;
      putPoint(r, c);
    }
  }
  if (pts.length < 3) return { points: [], triangles: [], contourPoints: [] };
  let filtered = [];
  const idxAt = (r, c) => idxByRowCol.get(`${r}:${c}`);
  for (let r = rowMin; r < rowMax; r += 1) {
    const colsA = rowCols.get(r);
    const colsB = rowCols.get(r + 1);
    if (!Array.isArray(colsA) || !Array.isArray(colsB)) continue;
    const cStart = Math.min(...colsA, ...colsB) - 1;
    const cEnd = Math.max(...colsA, ...colsB) + 1;
    for (let c = cStart; c <= cEnd; c += 1) {
      const a = idxAt(r, c);
      const b = idxAt(r, c + 1);
      const c0 = idxAt(r + 1, c);
      const d = idxAt(r + 1, c + 1);
      if ((r & 1) === 0) {
        if (a != null && c0 != null && b != null) filtered.push(a, c0, b);
        if (b != null && c0 != null && d != null) filtered.push(b, c0, d);
      } else {
        if (a != null && c0 != null && d != null) filtered.push(a, c0, d);
        if (a != null && d != null && b != null) filtered.push(a, d, b);
      }
    }
  }
  filtered = sanitizeTriangles(pts, filtered, poly);
  if (filtered.length < 3) {
    filtered = sanitizeTriangles(pts, delaunayTriangulate(pts), poly);
  }
  let contourPoints = includeContourPoints
    ? poly.map((p) => ({ x: Number(p.x) || 0, y: Number(p.y) || 0 }))
    : extractLargestBoundaryLoopFromTriangles(pts, filtered);
  if (!includeContourPoints && contourPoints.length < 3) {
    // Fallback: snap source contour to nearest triangular lattice nodes.
    const snapped = [];
    const seen = new Set();
    for (const p of poly) {
      const py = Number(p.y) || 0;
      const px = Number(p.x) || 0;
      const r0 = Math.round(py / h);
      let best = null;
      let bestD2 = Infinity;
      for (let dr = -1; dr <= 1; dr += 1) {
        const r = r0 + dr;
        const rowOffset = r & 1 ? s * 0.5 : 0;
        const c = Math.round((px - rowOffset) / s);
        for (let dc = -1; dc <= 1; dc += 1) {
          const x = (c + dc) * s + rowOffset;
          const y = r * h;
          const dx = x - px;
          const dy = y - py;
          const d2 = dx * dx + dy * dy;
          if (d2 < bestD2) {
            bestD2 = d2;
            best = { x, y };
          }
        }
      }
      if (!best) continue;
      const k = makePointKey(best.x, best.y);
      if (seen.has(k)) continue;
      seen.add(k);
      snapped.push(best);
    }
    if (snapped.length >= 3) contourPoints = snapped;
  }
  if (includeContourPoints && Array.isArray(contourPoints) && contourPoints.length >= 3) {
    // Keep final applied mesh boundary faithful to author contour:
    // merge contour vertices into fill set, then rebuild triangles clipped by contour.
    const merged = pts.slice();
    const seen = new Set(merged.map((p) => makePointKey(Number(p.x) || 0, Number(p.y) || 0)));
    for (const cp of contourPoints) {
      const x = Number(cp && cp.x) || 0;
      const y = Number(cp && cp.y) || 0;
      const k = makePointKey(x, y);
      if (seen.has(k)) continue;
      seen.add(k);
      merged.push({ x, y });
    }
    const rebuilt = sanitizeTriangles(merged, delaunayTriangulate(merged), contourPoints);
    if (rebuilt.length >= 3) {
      return { points: merged, triangles: rebuilt, contourPoints };
    }
  }
  return { points: pts, triangles: filtered, contourPoints };
}

function getCanvasAlphaMask(canvas, alphaThreshold = 8) {
  if (!canvas) return null;
  const w = Math.max(1, Number(canvas.width) || 1);
  const h = Math.max(1, Number(canvas.height) || 1);
  const ctx = canvas.getContext("2d", { willReadFrequently: true }) || canvas.getContext("2d");
  if (!ctx) return null;
  let img = null;
  try {
    img = ctx.getImageData(0, 0, w, h);
  } catch {
    return null;
  }
  if (!img || !img.data) return null;
  const data = img.data;
  const mask = new Uint8Array(w * h);
  let count = 0;
  for (let i = 0; i < w * h; i += 1) {
    const a = Number(data[i * 4 + 3]) || 0;
    if (a > alphaThreshold) {
      mask[i] = 1;
      count += 1;
    }
  }
  if (count <= 0) return null;
  return { width: w, height: h, mask, opaqueCount: count };
}

function pickForegroundComponent(maskInfo) {
  if (!maskInfo || !maskInfo.mask) return null;
  const w = maskInfo.width;
  const h = maskInfo.height;
  const mask = maskInfo.mask;
  const visited = new Uint8Array(mask.length);
  const components = [];
  const centerX = Math.floor((w - 1) * 0.5);
  const centerY = Math.floor((h - 1) * 0.5);
  const centerIdx = centerY * w + centerX;
  for (let i = 0; i < mask.length; i += 1) {
    if (!mask[i] || visited[i]) continue;
    const stack = [i];
    visited[i] = 1;
    const pixels = [];
    let area = 0;
    let sx = 0;
    let sy = 0;
    let containsCenter = false;
    while (stack.length > 0) {
      const idx = stack.pop();
      pixels.push(idx);
      area += 1;
      if (idx === centerIdx) containsCenter = true;
      const x = idx % w;
      const y = Math.floor(idx / w);
      sx += x + 0.5;
      sy += y + 0.5;
      const up = idx - w;
      const dn = idx + w;
      const lf = idx - 1;
      const rt = idx + 1;
      if (y > 0 && mask[up] && !visited[up]) {
        visited[up] = 1;
        stack.push(up);
      }
      if (y + 1 < h && mask[dn] && !visited[dn]) {
        visited[dn] = 1;
        stack.push(dn);
      }
      if (x > 0 && mask[lf] && !visited[lf]) {
        visited[lf] = 1;
        stack.push(lf);
      }
      if (x + 1 < w && mask[rt] && !visited[rt]) {
        visited[rt] = 1;
        stack.push(rt);
      }
    }
    if (area <= 0) continue;
    components.push({
      pixels,
      area,
      cx: sx / area,
      cy: sy / area,
      containsCenter,
    });
  }
  if (components.length === 0) return null;
  const centerComps = components.filter((c) => c.containsCenter);
  if (centerComps.length > 0) {
    centerComps.sort((a, b) => b.area - a.area);
    return centerComps[0];
  }
  let best = null;
  let bestScore = Number.POSITIVE_INFINITY;
  const cx = (w - 1) * 0.5;
  const cy = (h - 1) * 0.5;
  for (const c of components) {
    const dx = c.cx - cx;
    const dy = c.cy - cy;
    const dist2 = dx * dx + dy * dy;
    const score = dist2 - c.area * 0.001;
    if (!best || score < bestScore || (Math.abs(score - bestScore) < 1e-6 && c.area > best.area)) {
      best = c;
      bestScore = score;
    }
  }
  return best;
}

function buildMaskBoundaryLoops(mask, w, h) {
  const edges = [];
  const starts = new Map();
  const addEdge = (ax, ay, bx, by) => {
    const idx = edges.length;
    edges.push({ ax, ay, bx, by });
    const key = `${ax},${ay}`;
    const list = starts.get(key);
    if (list) list.push(idx);
    else starts.set(key, [idx]);
  };
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = y * w + x;
      if (!mask[i]) continue;
      if (y === 0 || !mask[i - w]) addEdge(x, y, x + 1, y);
      if (x + 1 >= w || !mask[i + 1]) addEdge(x + 1, y, x + 1, y + 1);
      if (y + 1 >= h || !mask[i + w]) addEdge(x + 1, y + 1, x, y + 1);
      if (x === 0 || !mask[i - 1]) addEdge(x, y + 1, x, y);
    }
  }
  if (edges.length === 0) return [];
  const used = new Uint8Array(edges.length);
  const loops = [];
  for (let i = 0; i < edges.length; i += 1) {
    if (used[i]) continue;
    const e0 = edges[i];
    const startX = e0.ax;
    const startY = e0.ay;
    const loop = [{ x: startX, y: startY }];
    let edgeIdx = i;
    let guard = 0;
    while (edgeIdx >= 0 && guard < edges.length + 8) {
      guard += 1;
      if (used[edgeIdx]) break;
      used[edgeIdx] = 1;
      const e = edges[edgeIdx];
      loop.push({ x: e.bx, y: e.by });
      if (e.bx === startX && e.by === startY) break;
      const key = `${e.bx},${e.by}`;
      const nextList = starts.get(key) || [];
      let next = -1;
      for (const ni of nextList) {
        if (!used[ni]) {
          next = ni;
          break;
        }
      }
      if (next < 0) break;
      edgeIdx = next;
    }
    if (
      loop.length >= 4 &&
      loop[0].x === loop[loop.length - 1].x &&
      loop[0].y === loop[loop.length - 1].y
    ) {
      loops.push(loop);
    }
  }
  return loops;
}

function simplifyClosedPolygon(points, maxPoints = 240) {
  if (!Array.isArray(points) || points.length < 4) return [];
  const ring = points.map((p) => ({ x: Number(p.x) || 0, y: Number(p.y) || 0 }));
  if (ring.length > 1 && ring[0].x === ring[ring.length - 1].x && ring[0].y === ring[ring.length - 1].y) {
    ring.pop();
  }
  if (ring.length < 3) return [];
  const reduced = [];
  const n = ring.length;
  for (let i = 0; i < n; i += 1) {
    const prev = ring[(i - 1 + n) % n];
    const curr = ring[i];
    const next = ring[(i + 1) % n];
    const v1x = curr.x - prev.x;
    const v1y = curr.y - prev.y;
    const v2x = next.x - curr.x;
    const v2y = next.y - curr.y;
    const cross = Math.abs(v1x * v2y - v1y * v2x);
    const dot = v1x * v2x + v1y * v2y;
    if (cross < 1e-6 && dot >= 0) continue;
    reduced.push(curr);
  }
  let out = reduced.length >= 3 ? reduced : ring;
  const maxN = math.clamp(Number(maxPoints) || 240, 24, 600);
  if (out.length > maxN) {
    const sampled = [];
    const step = out.length / maxN;
    for (let i = 0; i < maxN; i += 1) {
      const idx = Math.floor(i * step);
      sampled.push(out[idx]);
    }
    out = sampled;
  }
  return out;
}

function mapImagePolygonToSlotSpace(slot, points, imageW, imageH) {
  const rect = slot && (getActiveAttachment(slot) || {}).rect ? (getActiveAttachment(slot) || {}).rect : { x: 0, y: 0, w: imageW, h: imageH };
  const rw = Math.max(1, Number(rect.w) || imageW || 1);
  const rh = Math.max(1, Number(rect.h) || imageH || 1);
  const sx = rw / Math.max(1, Number(imageW) || 1);
  const sy = rh / Math.max(1, Number(imageH) || 1);
  const ox = Number(rect.x) || 0;
  const oy = Number(rect.y) || 0;
  return (Array.isArray(points) ? points : []).map((p) => ({
    x: ox + (Number(p.x) || 0) * sx,
    y: oy + (Number(p.y) || 0) * sy,
  }));
}

function buildAutoForegroundContourForSlot(slot, colsHint, rowsHint) {
  if (!slot || !(getActiveAttachment(slot) || {}).canvas) return null;
  const alphaMask = getCanvasAlphaMask((getActiveAttachment(slot) || {}).canvas, 8);
  if (!alphaMask) return null;
  const comp = pickForegroundComponent(alphaMask);
  if (!comp || !Array.isArray(comp.pixels) || comp.pixels.length < 3) return null;
  const selectedMask = new Uint8Array(alphaMask.mask.length);
  for (const idx of comp.pixels) {
    if (Number.isFinite(idx) && idx >= 0 && idx < selectedMask.length) selectedMask[idx] = 1;
  }
  // Slight outward dilation to avoid clipping into opaque foreground edges.
  const safeMask = dilateBinaryMask(selectedMask, alphaMask.width, alphaMask.height, 1);
  const loops = buildMaskBoundaryLoops(safeMask, alphaMask.width, alphaMask.height);
  if (!Array.isArray(loops) || loops.length === 0) return null;
  let bestLoop = loops[0];
  let bestArea = Math.abs(polygonSignedArea(bestLoop));
  for (let i = 1; i < loops.length; i += 1) {
    const a = Math.abs(polygonSignedArea(loops[i]));
    if (a > bestArea) {
      bestArea = a;
      bestLoop = loops[i];
    }
  }
  const contourMaxPoints = math.clamp(((Number(colsHint) || 24) + (Number(rowsHint) || 24)) * 4, 24, 600);
  const simplified = simplifyClosedPolygon(bestLoop, contourMaxPoints);
  if (!Array.isArray(simplified) || simplified.length < 3) return null;
  const contourPoints = mapImagePolygonToSlotSpace(slot, simplified, alphaMask.width, alphaMask.height);
  if (contourPoints.length < 3) return null;
  return {
    contourPoints,
    area: comp.area,
  };
}

function autoBuildForegroundMeshForSlot(slot, colsHint, rowsHint) {
  if (!slot) return { ok: false, reason: "No active slot." };
  const auto = buildAutoForegroundContourForSlot(slot, colsHint, rowsHint);
  if (!auto || !Array.isArray(auto.contourPoints) || auto.contourPoints.length < 3) {
    return { ok: false, reason: "No opaque foreground region found." };
  }
  const c = ensureSlotContour(slot);
  c.points = auto.contourPoints.map((p) => ({ x: Number(p.x) || 0, y: Number(p.y) || 0 }));
  syncSlotContourSourcePoints(c);
  c.closed = true;
  c.manualEdges = [];
  c.triangles = [];
  c.fillManualEdges = [];
  c.fillPoints = [];
  c.fillTriangles = [];

  const fill = buildUniformGridFillForContour(c, colsHint, rowsHint, true);
  c.fillPoints = Array.isArray(fill.points) ? fill.points : [];
  c.fillManualEdges = normalizeEdgePairs(c.fillManualEdges, c.fillPoints.length);
  c.fillTriangles = buildSafeFillTriangles(c.fillPoints, Array.isArray(fill.triangles) ? fill.triangles : [], c.points, c.fillManualEdges);
  if (c.fillTriangles.length < 3) {
    c.fillPoints = [];
    c.fillManualEdges = [];
    c.fillTriangles = [];
    c.triangles = applyManualEdgesToTriangles(c.points, triangulatePolygon(c.points), c.manualEdges);
  }
  state.slotMesh.activeSet = c.fillPoints.length >= 3 ? "fill" : "contour";
  state.slotMesh.activePoint = -1;
  state.slotMesh.edgeSelection = [];
  state.slotMesh.edgeSelectionSet = state.slotMesh.activeSet;
  const triCount =
    c.fillPoints.length >= 3 && c.fillTriangles.length >= 3 ? c.fillTriangles.length / 3 : c.triangles.length / 3;
  return {
    ok: true,
    contourPoints: c.points.length,
    fillPoints: c.fillPoints.length,
    triangles: Math.max(0, Math.round(triCount)),
  };
}

function reindexTrianglesAfterPointRemoved(triangles, index) {
  if (!Array.isArray(triangles) || triangles.length < 3) return [];
  const out = [];
  for (let i = 0; i + 2 < triangles.length; i += 3) {
    const a = Number(triangles[i]);
    const b = Number(triangles[i + 1]);
    const c = Number(triangles[i + 2]);
    if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)) continue;
    if (a === index || b === index || c === index) continue;
    out.push(a > index ? a - 1 : a, b > index ? b - 1 : b, c > index ? c - 1 : c);
  }
  return out;
}

function removePointAtIndex(points, index) {
  if (!Array.isArray(points) || index < 0 || index >= points.length) return false;
  points.splice(index, 1);
  return true;
}

function getSlotMeshSetKey(setName) {
  return setName === "fill" ? "fill" : "contour";
}

function getSlotMeshSelection(setName, maxCount = null) {
  const key = getSlotMeshSetKey(setName);
  const store = state.slotMesh && state.slotMesh.selectedPoints && typeof state.slotMesh.selectedPoints === "object"
    ? state.slotMesh.selectedPoints
    : (state.slotMesh.selectedPoints = { contour: [], fill: [] });
  const raw = Array.isArray(store[key]) ? store[key] : [];
  const out = [];
  const max = Number.isFinite(maxCount) ? Number(maxCount) : null;
  for (const v of raw) {
    const i = Number(v);
    if (!Number.isFinite(i) || i < 0) continue;
    if (max != null && i >= max) continue;
    if (!out.includes(i)) out.push(i);
  }
  out.sort((a, b) => a - b);
  store[key] = out;
  return out;
}

function setSlotMeshSelection(setName, list, maxCount = null) {
  const key = getSlotMeshSetKey(setName);
  const store = state.slotMesh && state.slotMesh.selectedPoints && typeof state.slotMesh.selectedPoints === "object"
    ? state.slotMesh.selectedPoints
    : (state.slotMesh.selectedPoints = { contour: [], fill: [] });
  const max = Number.isFinite(maxCount) ? Number(maxCount) : null;
  const out = [];
  for (const raw of Array.isArray(list) ? list : []) {
    const i = Number(raw);
    if (!Number.isFinite(i) || i < 0) continue;
    if (max != null && i >= max) continue;
    if (!out.includes(i)) out.push(i);
  }
  out.sort((a, b) => a - b);
  store[key] = out;
  return out;
}

function clearSlotMeshSelection(setName = "") {
  if (!state.slotMesh) return;
  const store = state.slotMesh.selectedPoints && typeof state.slotMesh.selectedPoints === "object"
    ? state.slotMesh.selectedPoints
    : (state.slotMesh.selectedPoints = { contour: [], fill: [] });
  if (setName === "contour" || setName === "fill") {
    store[setName] = [];
    return;
  }
  store.contour = [];
  store.fill = [];
}

function normalizeSlotMeshToolMode(mode) {
  return String(mode || "").toLowerCase() === "add" ? "add" : "select";
}

function cloneSlotMeshContour(contour) {
  const src = contour && typeof contour === "object" ? contour : {};
  return {
    points: Array.isArray(src.points) ? src.points.map((p) => ({ x: Number(p && p.x) || 0, y: Number(p && p.y) || 0 })) : [],
    sourcePoints: Array.isArray(src.sourcePoints)
      ? src.sourcePoints.map((p) => ({ x: Number(p && p.x) || 0, y: Number(p && p.y) || 0 }))
      : [],
    authorContourPoints: Array.isArray(src.authorContourPoints)
      ? src.authorContourPoints.map((p) => ({ x: Number(p && p.x) || 0, y: Number(p && p.y) || 0 }))
      : [],
    closed: !!src.closed,
    contourEdges: Array.isArray(src.contourEdges)
      ? src.contourEdges.filter((e) => Array.isArray(e) && e.length >= 2).map((e) => [Number(e[0]) || 0, Number(e[1]) || 0])
      : [],
    triangles: Array.isArray(src.triangles) ? src.triangles.map((v) => Number(v) || 0) : [],
    fillPoints: Array.isArray(src.fillPoints) ? src.fillPoints.map((p) => ({ x: Number(p && p.x) || 0, y: Number(p && p.y) || 0 })) : [],
    fillTriangles: Array.isArray(src.fillTriangles) ? src.fillTriangles.map((v) => Number(v) || 0) : [],
    manualEdges: Array.isArray(src.manualEdges)
      ? src.manualEdges.filter((e) => Array.isArray(e) && e.length >= 2).map((e) => [Number(e[0]) || 0, Number(e[1]) || 0])
      : [],
    fillManualEdges: Array.isArray(src.fillManualEdges)
      ? src.fillManualEdges.filter((e) => Array.isArray(e) && e.length >= 2).map((e) => [Number(e[0]) || 0, Number(e[1]) || 0])
      : [],
    dirty: !!src.dirty,
    fillFromMeshData: !!src.fillFromMeshData,
  };
}

function refreshSlotMeshToolModeUI() {
  if (!els.slotMeshNewBtn) return;
  const mode = normalizeSlotMeshToolMode(state.slotMesh && state.slotMesh.toolMode);
  const isAdd = mode === "add";
  els.slotMeshNewBtn.textContent = isAdd ? "Tool: ADD VERTEX (V)" : "Tool: SELECT (V)";
  els.slotMeshNewBtn.classList.add("slotmesh-tool-toggle");
  els.slotMeshNewBtn.classList.toggle("mode-add", isAdd);
  els.slotMeshNewBtn.classList.toggle("mode-select", !isAdd);
  els.slotMeshNewBtn.classList.toggle("active", isAdd);
  els.slotMeshNewBtn.title = isAdd
    ? "Add mode: click empty area to add contour vertex."
    : "Select mode: click/drag to select and move vertices.";
  if (els.slotMeshToolModeHint) {
    els.slotMeshToolModeHint.textContent = isAdd ? "Tool: Add Vertex (V)" : "Tool: Select (V)";
  }
}

function refreshSlotMeshContourReferenceHint() {
  if (!els.slotMeshContourRefHint) return;
  const slot = getActiveSlot();
  if (!slot) {
    els.slotMeshContourRefHint.textContent = "Ref: Source contour";
    return;
  }
  const contour = ensureSlotContour(slot);
  const source = getSlotContourSourcePoints(contour);
  els.slotMeshContourRefHint.textContent = `Ref: Source contour (${source.length})`;
}

function setSlotMeshToolMode(mode, withStatus = false) {
  if (!state.slotMesh) return;
  const next = normalizeSlotMeshToolMode(mode);
  state.slotMesh.toolMode = next;
  refreshSlotMeshToolModeUI();
  if (withStatus) {
    setStatus(next === "add" ? "Slot Mesh tool: Add Vertex mode." : "Slot Mesh tool: Select mode.");
  }
}

function removeSlotMeshPointsByIndices(contour, setName, indices) {
  if (!contour) return { removed: 0, remain: 0 };
  const key = getSlotMeshSetKey(setName);
  const points = key === "fill" ? contour.fillPoints : contour.points;
  if (!Array.isArray(points) || points.length === 0) return { removed: 0, remain: 0 };
  const toRemove = [...new Set((Array.isArray(indices) ? indices : []).map((v) => Number(v)).filter((v) => Number.isFinite(v) && v >= 0 && v < points.length))].sort((a, b) => b - a);
  if (toRemove.length === 0) return { removed: 0, remain: points.length };
  for (const index of toRemove) {
    removePointAtIndex(points, index);
    if (key === "contour") {
      contour.triangles = [];
      contour.fillPoints = [];
      contour.fillTriangles = [];
      contour.fillManualEdges = [];
      contour.manualEdges = normalizeEdgePairs(
        contour.manualEdges
          .filter((e) => e[0] !== index && e[1] !== index)
          .map((e) => [e[0] > index ? e[0] - 1 : e[0], e[1] > index ? e[1] - 1 : e[1]]),
        contour.points.length
      );
      if (Array.isArray(contour.contourEdges)) {
        const nextContourEdges = contour.contourEdges
          .filter(e => e[0] !== index && e[1] !== index)
          .map(e => [e[0] > index ? e[0] - 1 : e[0], e[1] > index ? e[1] - 1 : e[1]]);
        contour.contourEdges = nextContourEdges;
      }
      if (contour.points.length < 3) contour.closed = false;
      syncSlotContourSourcePoints(contour);
    } else {
      contour.fillTriangles = reindexTrianglesAfterPointRemoved(contour.fillTriangles, index);
      contour.fillManualEdges = normalizeEdgePairs(
        contour.fillManualEdges
          .filter((e) => e[0] !== index && e[1] !== index)
          .map((e) => [e[0] > index ? e[0] - 1 : e[0], e[1] > index ? e[1] - 1 : e[1]]),
        contour.fillPoints.length
      );
      contour.fillTriangles = applyManualEdgesToTriangles(contour.fillPoints, contour.fillTriangles, contour.fillManualEdges);
    }
  }
  return { removed: toRemove.length, remain: points.length };
}

function applyContourMeshToSlot(slot) {
  const m = state.mesh;
  if (!m || !slot) return false;
  const contour = ensureSlotContour(slot);
  if (!contour.closed || contour.points.length < 3) return false;
  const useFill = Array.isArray(contour.fillPoints) && contour.fillPoints.length >= 3;
  const pts = useFill ? contour.fillPoints : contour.points;
  const manualEdges = useFill ? contour.fillManualEdges : contour.manualEdges;
  const clipPolygon = useFill ? getSlotContourSourcePoints(contour) : contour.points;
  if (useFill && Array.isArray(clipPolygon) && clipPolygon.length >= 3) {
    // Ensure applied fill mesh contains boundary vertices, so silhouette stays consistent.
    const seen = new Set((Array.isArray(pts) ? pts : []).map((p) => makePointKey(Number(p.x) || 0, Number(p.y) || 0)));
    for (const cp of clipPolygon) {
      const x = Number(cp && cp.x) || 0;
      const y = Number(cp && cp.y) || 0;
      const k = makePointKey(x, y);
      if (seen.has(k)) continue;
      seen.add(k);
      pts.push({ x, y });
    }
  }
  let triangles = useFill ? contour.fillTriangles : contour.triangles;
  if (!Array.isArray(triangles) || triangles.length < 3) {
    if (useFill) {
      triangles = applyManualEdgesToTriangles(pts, triangulatePolygon(pts), manualEdges);
    } else {
      triangles = triangulateContourPoints(pts, contour.contourEdges, manualEdges);
    }
    if (useFill) contour.fillTriangles = triangles;
    else contour.triangles = triangles;
  }
  triangles = applyManualEdgesToTriangles(pts, triangles, manualEdges);
  triangles = sanitizeTriangles(pts, triangles, clipPolygon);
  if (!Array.isArray(triangles) || triangles.length < 3) return false;
  const contourAtt = getActiveAttachment(slot);
  if (!contourAtt) return false;
  const rect = contourAtt.rect || { x: 0, y: 0, w: Math.max(1, state.imageWidth), h: Math.max(1, state.imageHeight) };
  const rw = Math.max(1, Number(rect.w) || 1);
  const rh = Math.max(1, Number(rect.h) || 1);
  const positions = new Float32Array(pts.length * 2);
  const uvs = new Float32Array(pts.length * 2);
  for (let i = 0; i < pts.length; i += 1) {
    const p = pts[i];
    positions[i * 2] = Number(p.x) || 0;
    positions[i * 2 + 1] = Number(p.y) || 0;
    uvs[i * 2] = ((Number(p.x) || 0) - (Number(rect.x) || 0)) / rw;
    uvs[i * 2 + 1] = ((Number(p.y) || 0) - (Number(rect.y) || 0)) / rh;
  }
  const vCount = pts.length;
  contourAtt.meshData = {
    cols: 0,
    rows: 0,
    positions,
    uvs,
    offsets: new Float32Array(vCount * 2),
    baseOffsets: new Float32Array(vCount * 2),
    weights: new Float32Array(0),
    indices: new Uint16Array(triangles),
    deformedLocal: new Float32Array(vCount * 2),
    deformedScreen: new Float32Array(vCount * 2),
    interleaved: new Float32Array(vCount * 4),
  };
  rebuildSlotWeights(slot, m);
  rebuildSlotTriangleIndices();
  const contourAfter = ensureSlotContour(slot);
  contourAfter.dirty = false;
  contourAfter.fillFromMeshData = false;
  return true;
}

function resetSlotMeshToGrid(slot) {
  const m = state.mesh;
  if (!m || !slot) return false;
  const gridAtt = getActiveAttachment(slot);
  if (!gridAtt) return false;
  const r = gridAtt.rect || { x: 0, y: 0, w: state.imageWidth || 64, h: state.imageHeight || 64 };
  gridAtt.meshData = createSlotMeshData(r, state.imageWidth || r.w, state.imageHeight || r.h, m.cols, m.rows);
  rebuildSlotWeights(slot, m);
  const contour = ensureSlotContour(slot);
  contour.points = [
    { x: Number(r.x) || 0, y: Number(r.y) || 0 },
    { x: (Number(r.x) || 0) + (Number(r.w) || 0), y: Number(r.y) || 0 },
    { x: (Number(r.x) || 0) + (Number(r.w) || 0), y: (Number(r.y) || 0) + (Number(r.h) || 0) },
    { x: Number(r.x) || 0, y: (Number(r.y) || 0) + (Number(r.h) || 0) },
  ];
  contour.closed = true;
  contour.manualEdges = [];
  contour.contourEdges = [[0, 1], [1, 2], [2, 3], [3, 0]];
  contour.triangles = [];
  contour.fillPoints = [];
  contour.fillTriangles = [];
  contour.fillManualEdges = [];
  syncSlotContourSourcePoints(contour);
  syncSlotContourFromMeshData(slot, true);
  return true;
}

function pickSlotContourPoint(slot, mx, my, radius = 10, poseWorld = null) {
  const contour = ensureSlotContour(slot);
  const r2 = radius * radius;
  let best = { set: "contour", index: -1 };
  let bestD2 = r2;
  const sets = [];
  const preferFill = state.slotMesh.activeSet === "fill";
  if (preferFill) sets.push(["fill", contour.fillPoints || []], ["contour", contour.points || []]);
  else sets.push(["contour", contour.points || []], ["fill", contour.fillPoints || []]);
  for (const [setName, list] of sets) {
    for (let i = 0; i < list.length; i += 1) {
      const p = list[i];
      const s = slotMeshLocalToScreen(slot, p, poseWorld);
      const dx = s.x - mx;
      const dy = s.y - my;
      const d2 = dx * dx + dy * dy;
      if (d2 <= bestD2) {
        bestD2 = d2;
        best = { set: setName, index: i };
      }
    }
  }
  return best.index >= 0 ? best : null;
}

function ensureSlotMeshData(slot, m) {
  if (!slot || !m) return;
  const att = getActiveAttachment(slot);
  if (!att) return; // slot has no attachment — nothing to initialize
  if (!att.meshData) {
    const r = att.rect || { x: 0, y: 0, w: state.imageWidth || 64, h: state.imageHeight || 64 };
    att.meshData = createSlotMeshData(r, state.imageWidth || r.w, state.imageHeight || r.h, m.cols, m.rows);
  }
  const md = att.meshData;
  if (!md) return;
  const vCount = md.positions ? md.positions.length / 2 : 0;
  const boneCount = m.rigBones.length;
  if (!md.weights || md.weights.length !== vCount * boneCount) {
    const mode = getSlotWeightMode(slot);
    if (mode === "free") {
      att.useWeights = false;
      att.weightBindMode = "none";
      att.weightMode = "free";
      md.weights = new Float32Array(0);
      return;
    }
    if (mode === "single") {
      const bi = Number(slot.bone);
      const weights = allocWeights(vCount, boneCount);
      if (Number.isFinite(bi) && bi >= 0 && bi < boneCount) {
        for (let i = 0; i < vCount; i += 1) weights[i * boneCount + bi] = 1;
      }
      md.weights = weights;
      att.weightBindMode = "single";
      att.weightMode = "single";
    } else {
      const allowed = getSlotInfluenceBones(slot, m);
      att.influenceBones = allowed;
      md.weights = autoWeightForPositions(
        getSlotWeightedAutoWeightPositions(slot, m),
        m.rigBones,
        allowed,
        { indices: md.indices, maxInfluences: 3, distanceRatioCutoff: 3.8, smoothIters: 3, smoothLambda: 0.5, crossBranchPenalty: 0.16 }
      );
      att.weightBindMode = "auto";
      att.weightMode = "weighted";
    }
  }
}

const modelSlotOffsetsStore = new WeakMap();

function getModelSlotOffsetMap(m) {
  let map = modelSlotOffsetsStore.get(m);
  if (!map) {
    map = new Map();
    modelSlotOffsetsStore.set(m, map);
  }
  return map;
}

function getModelSlotOffsets(m, slotIndex) {
  if (!m || !Number.isFinite(slotIndex) || slotIndex < 0 || slotIndex >= state.slots.length) return null;
  const si = Number(slotIndex);
  const slot = state.slots[si];
  if (!slot) return null;
  ensureSlotMeshData(slot, m);
  const src = (getActiveAttachment(slot) || {}).meshData && (getActiveAttachment(slot) || {}).meshData.offsets ? (getActiveAttachment(slot) || {}).meshData.offsets : null;
  const base = (getActiveAttachment(slot) || {}).meshData && (getActiveAttachment(slot) || {}).meshData.baseOffsets ? (getActiveAttachment(slot) || {}).meshData.baseOffsets : null;
  if (!src || !base) return null;
  if (m === state.mesh) return src;
  const map = getModelSlotOffsetMap(m);
  const existing = map.get(si);
  if (existing && existing.length === src.length) return existing;
  const created = new Float32Array(src.length);
  created.set(base);
  map.set(si, created);
  return created;
}

function resetModelSlotOffsetsToBase(m) {
  if (!m) return;
  if (state.slots.length > 0) {
    if (m === state.mesh) {
      for (const slot of state.slots) {
        if (!slot) continue;
        ensureSlotMeshData(slot, m);
        if ((getActiveAttachment(slot) || {}).meshData && (getActiveAttachment(slot) || {}).meshData.offsets && (getActiveAttachment(slot) || {}).meshData.baseOffsets) {
          (getActiveAttachment(slot) || {}).meshData.offsets.set((getActiveAttachment(slot) || {}).meshData.baseOffsets);
        }
      }
      return;
    }
    for (let si = 0; si < state.slots.length; si += 1) {
      const slot = state.slots[si];
      if (!slot) continue;
      ensureSlotMeshData(slot, m);
      const dst = getModelSlotOffsets(m, si);
      if (dst && (getActiveAttachment(slot) || {}).meshData && (getActiveAttachment(slot) || {}).meshData.baseOffsets && dst.length === (getActiveAttachment(slot) || {}).meshData.baseOffsets.length) {
        dst.set((getActiveAttachment(slot) || {}).meshData.baseOffsets);
      }
    }
    return;
  }
  if (m.baseOffsets && m.offsets) m.offsets.set(m.baseOffsets);
}

function getSlotOffsets(slot, m) {
  ensureSlotMeshData(slot, m);
  return slot && (getActiveAttachment(slot) || {}).meshData ? (getActiveAttachment(slot) || {}).meshData.offsets : null;
}

function getActiveOffsets(m) {
  if (state.slots.length === 0) return m.offsets;
  const slot = getActiveSlot();
  if (!slot) return m.offsets;
  if (m === state.mesh) return getSlotOffsets(slot, m) || m.offsets;
  const si = state.activeSlot;
  return getModelSlotOffsets(m, si) || m.offsets;
}

function canRenderSlotInViewport(slot) {
  if (!slot || !isSlotEditorVisible(slot)) return false;
  if (isSlotHiddenByBoneVisibility(slot)) return false;
  if ((getActiveAttachment(slot) || {}).clipEnabled) return true;
  return hasActiveAttachment(slot);
}

function getGlobalBoneWorkHideMode() {
  return state.boneTreeWorkHideMode === "bone_and_slots" ? "bone_and_slots" : "bone_only";
}

function isSlotHiddenByBoneVisibility(slot) {
  const m = state.mesh;
  if (!m || !slot) return false;
  const bi = getSlotTreeBoneIndex(slot, m);
  if (!Number.isFinite(bi) || bi < 0 || bi >= (Array.isArray(m.rigBones) ? m.rigBones.length : 0)) return false;
  if (getGlobalBoneWorkHideMode() === "bone_and_slots" && isBoneWorkspaceHidden(m, bi)) return true;
  if (state.boneMode === "pose") {
    const bones = getActiveBones(m);
    if (isBoneAnimationHidden(bones, bi)) return true;
  }
  return false;
}

function getRenderableSlotItems() {
  if (state.slots.length === 0) {
    return [];
  }
  const allItems = state.slots
    .map((slot, idx) => ({ slot, idx }))
    .filter((it) => canRenderSlotInViewport(it.slot));
  if (state.slotViewMode !== "all") {
    const i = Number(state.activeSlot);
    if (!Number.isFinite(i) || i < 0) return [];
    const active = allItems.find((it) => it.idx === i);
    return active ? [active] : [];
  }
  const preferredByBone = new Map();
  for (const it of allItems) {
    if (it.slot && (getActiveAttachment(it.slot) || {}).clipEnabled) continue;
    const bi = getSlotTreeBoneIndex(it.slot, state.mesh);
    if (!Number.isFinite(bi) || bi < 0) continue;
    preferredByBone.set(bi, it.idx);
  }
  const selectedByBone = state.boneTreeSelectedSlotByBone || Object.create(null);
  for (const boneKey of Object.keys(selectedByBone)) {
    const bi = Number(boneKey);
    if (!Number.isFinite(bi) || bi < 0) continue;
    const pickedIndex = getSelectedSlotIndexForBone(bi);
    if (pickedIndex < 0) continue;
    const picked = state.slots[pickedIndex];
    if (!picked || (getActiveAttachment(picked) || {}).clipEnabled || !canRenderSlotInViewport(picked)) continue;
    preferredByBone.set(bi, pickedIndex);
  }

  const keep = new Set();
  const activeIdx = Number(state.activeSlot);
  for (const it of allItems) {
    if (Number.isFinite(activeIdx) && activeIdx >= 0 && it.idx === activeIdx) {
      keep.add(it.idx);
      continue;
    }
    if (it.slot && (getActiveAttachment(it.slot) || {}).clipEnabled) {
      keep.add(it.idx);
      continue;
    }
    const bi = getSlotTreeBoneIndex(it.slot, state.mesh);
    if (!Number.isFinite(bi) || bi < 0) {
      keep.add(it.idx);
      continue;
    }
    if (preferredByBone.get(bi) === it.idx) keep.add(it.idx);
  }
  return allItems.filter((it) => keep.has(it.idx));
}

function getRenderableSlots() {
  if (state.slots.length === 0) {
    if (!state.sourceCanvas) return [];
    return [{ name: "base", canvas: state.sourceCanvas, alpha: 1, visible: true }];
  }
  return getRenderableSlotItems().map((it) => it.slot);
}

function createTempBoneForSlot(slot, label = "slot_bone") {
  const m = state.mesh;
  if (!m) return -1;
  const r = slot && (getActiveAttachment(slot) || {}).rect ? (getActiveAttachment(slot) || {}).rect : { x: state.imageWidth * 0.5, y: state.imageHeight * 0.5, w: 48, h: 48 };
  const cx = r.x + r.w * 0.5;
  const cy = r.y + r.h * 0.5;
  const len = Math.max(16, Math.min(120, Math.max(r.w, r.h) * 0.4));
  m.rigBones.push({
    name: `${label}_${m.rigBones.length}`,
    parent: -1,
    inherit: "normal",
    tx: cx,
    ty: cy,
    rot: -Math.PI * 0.5,
    length: len,
    sx: 1,
    sy: 1,
    shx: 0,
    shy: 0,
    connected: true,
    poseLenEditable: false,
  });
  const idx = m.rigBones.length - 1;
  syncPoseFromRig(m);
  syncBindPose(m);
  refreshWeightsForBoneCount();
  return idx;
}

function ensureSlotsHaveBoneBinding() {
  if (state.slots.length === 0) return;
  const m = state.mesh;
  if (!m) return;
  const isValidBone = (bi) => Number.isFinite(bi) && bi >= 0 && bi < m.rigBones.length;
  for (const s of state.slots) {
    if (!s) continue;
    const att = getActiveAttachment(s);
    ensureSlotClipState(s);
    const mode = getSlotWeightMode(s);
    if (mode === "free") {
      s.bone = -1;
      if (att) att.influenceBones = [];
      rebuildSlotWeights(s, m);
      continue;
    }
    const valid = isValidBone(Number(s.bone));
    if (!valid) {
      s.bone = -1;
      if (mode === "single") {
        setSlotSingleBoneWeight(s, m, -1);
        if (att) att.influenceBones = [];
      } else {
        if (att) att.influenceBones = [];
        rebuildSlotWeights(s, m);
      }
      continue;
    }
    if (mode === "single") {
      setSlotSingleBoneWeight(s, m, Number(s.bone));
      continue;
    }
    if (!att) continue;
    if (!Array.isArray(att.influenceBones) || att.influenceBones.length === 0) {
      att.influenceBones = [Number(s.bone)];
    } else {
      att.influenceBones = att.influenceBones.filter((v) => isValidBone(Number(v)));
      if (att.influenceBones.length <= 0) att.influenceBones = [Number(s.bone)];
    }
    if (!hasCompatibleSlotWeights(s, m)) rebuildSlotWeights(s, m);
  }
}
