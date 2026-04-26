// ROLE: Constraint solvers (IK / Transform / Path), per-vertex mesh
// skinning (updateDeformation, buildSlotGeometry, with bone-palette
// cache), constraint UIs (refresh*UI + handlers), drawMeshOnContext for
// 2D fallback, viewport math (localToScreen/screenToLocal), backdrop
// grid/ruler, slot transform helpers.
// EXPORTS:
//   - applySingleIKConstraintToBones, applySingleTransformConstraintToBones
//   - solveOneBoneIK, solveTwoBoneIK
//   - getEditAwareWorld, getSolvedPoseWorld, computeWorld
//   - updateDeformation, buildSlotGeometry, buildBonePalette
//   - refreshIKUI, refreshTransformUI, refreshPathUI, refreshPhysicsUI
//   - localToScreen, screenToLocal, drawBackdrop
//   - drawMeshOnContext (Canvas2D triangle blit; used by onion + fallback)
// CONSUMERS: render() in canvas.js, animation runtime, hotkeys/edit
//   pointer handlers.
// HEAVY FILE (~3850 lines).
// Constraint apply order: Path → Transform → IK → Physics (matches Spine).
// ============================================================
function refreshPathUI() {
  const m = state.mesh;
  if (!els.pathSelect) return;
  if (!m || !Array.isArray(m.rigBones) || m.rigBones.length === 0) {
    els.pathSelect.innerHTML = "";
    if (els.pathList) els.pathList.innerHTML = "<div class='muted'>No bones.</div>";
    return;
  }
  const list = ensurePathConstraints(m);
  const prevSelected = state.selectedPath >= 0 && state.selectedPath < list.length ? list[state.selectedPath] : null;
  sortConstraintListByOrder(list);
  if (prevSelected) state.selectedPath = list.indexOf(prevSelected);
  if (state.selectedPath < 0 || state.selectedPath >= list.length) state.selectedPath = list.length > 0 ? 0 : -1;
  const fillBoneSelect = (sel, allowNone = false) => {
    if (!sel) return;
    sel.innerHTML = "";
    if (allowNone) {
      const none = document.createElement("option");
      none.value = "-1";
      none.textContent = "-1: None";
      sel.appendChild(none);
    }
    for (let i = 0; i < m.rigBones.length; i += 1) {
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = `${i}: ${m.rigBones[i].name}`;
      sel.appendChild(opt);
    }
  };
  fillBoneSelect(els.pathTargetBone, true);
  fillBoneSelect(els.pathBones, false);
  if (els.pathTargetSlot) {
    els.pathTargetSlot.innerHTML = "";
    for (let i = 0; i < state.slots.length; i += 1) {
      const s = state.slots[i];
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = `${i}: ${s && s.name ? s.name : `slot_${i}`}`;
      els.pathTargetSlot.appendChild(opt);
    }
  }
  els.pathSelect.innerHTML = "";
  for (let i = 0; i < list.length; i += 1) {
    const c = list[i];
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = `${i}: ${c.name}`;
    els.pathSelect.appendChild(opt);
  }
  if (els.pathList) {
    els.pathList.innerHTML = "";
    if (list.length === 0) {
      els.pathList.innerHTML = "<div class='muted'>No Path constraints yet.</div>";
    } else {
      for (let i = 0; i < list.length; i += 1) {
        const c = list[i];
        const row = document.createElement("div");
        row.className = `tree-item${state.selectedPath === i ? " selected" : ""}`;
        row.dataset.pathIndex = String(i);
        row.textContent = `${i}: ${c.name}${c.enabled === false ? " (off)" : ""}`;
        els.pathList.appendChild(row);
      }
    }
  }
  const c = getActivePathConstraint();
  if (els.pathMoveUpBtn) els.pathMoveUpBtn.disabled = !c || state.selectedPath <= 0;
  if (els.pathMoveDownBtn) els.pathMoveDownBtn.disabled = !c || state.selectedPath >= list.length - 1;
  if (els.pathRemoveBtn) els.pathRemoveBtn.disabled = !c;
  if (els.pathDrawBtn) els.pathDrawBtn.disabled = !c;
  if (els.pathStopDrawBtn) els.pathStopDrawBtn.disabled = !state.pathEdit.drawArmed;
  if (els.pathCloseShapeBtn) els.pathCloseShapeBtn.disabled = !c;
  if (els.pathClearShapeBtn) els.pathClearShapeBtn.disabled = !c;
  if (els.pathApplyHandleModeBtn) els.pathApplyHandleModeBtn.disabled = !c;
  if (!c) {
    if (els.pathTargetBone) els.pathTargetBone.disabled = true;
    if (els.pathTargetSlot) els.pathTargetSlot.disabled = true;
    if (els.pathPositionMode) els.pathPositionMode.disabled = true;
    if (els.pathSpacingMode) els.pathSpacingMode.disabled = true;
    if (els.pathRotateMode) els.pathRotateMode.disabled = true;
    if (els.pathSkinRequired) els.pathSkinRequired.disabled = true;
    if (els.pathHandleMode) els.pathHandleMode.disabled = true;
    if (els.pathApplyHandleModeBtn) els.pathApplyHandleModeBtn.disabled = true;
    if (els.pathHint) els.pathHint.textContent = "No Path constraint. Add one.";
    return;
  }
  if (els.pathSelect) els.pathSelect.value = String(state.selectedPath);
  if (els.pathName) els.pathName.value = c.name || `path_${state.selectedPath}`;
  if (els.pathTargetBone) els.pathTargetBone.value = String(c.target);
  if (els.pathSourceType) {
    if (c.sourceType === "bone_chain") els.pathSourceType.value = "bone_chain";
    else if (c.sourceType === "slot") els.pathSourceType.value = "slot";
    else els.pathSourceType.value = "drawn";
  }
  if (els.pathTargetSlot && state.slots.length > 0) {
    const si = Number.isFinite(Number(c.targetSlot)) ? Math.max(0, Math.min(state.slots.length - 1, Number(c.targetSlot))) : 0;
    els.pathTargetSlot.value = String(si);
  }
  if (els.pathTargetBone) els.pathTargetBone.disabled = c.sourceType !== "bone_chain";
  if (els.pathTargetSlot) els.pathTargetSlot.disabled = c.sourceType !== "slot";
  if (els.pathPositionMode) els.pathPositionMode.disabled = false;
  if (els.pathSpacingMode) els.pathSpacingMode.disabled = false;
  if (els.pathRotateMode) els.pathRotateMode.disabled = false;
  if (els.pathSkinRequired) els.pathSkinRequired.disabled = false;
  if (els.pathHandleMode) {
    const i = Number(state.pathEdit.activePoint);
    const hasPoint = c.sourceType === "drawn" && Array.isArray(c.points) && i >= 0 && i < c.points.length;
    els.pathHandleMode.disabled = !hasPoint;
    const mode = hasPoint ? normalizePathNode(c.points[i]).handleMode : "aligned";
    els.pathHandleMode.value = mode;
  }
  if (els.pathEnabled) els.pathEnabled.value = c.enabled === false ? "false" : "true";
  if (els.pathPositionMode) els.pathPositionMode.value = c.positionMode === "percent" ? "percent" : "fixed";
  if (els.pathSpacingMode) {
    els.pathSpacingMode.value =
      c.spacingMode === "fixed" ? "fixed" : c.spacingMode === "percent" ? "percent" : c.spacingMode === "proportional" ? "proportional" : "length";
  }
  if (els.pathRotateMode) {
    els.pathRotateMode.value = c.rotateMode === "chain" ? "chain" : c.rotateMode === "chainScale" ? "chainScale" : "tangent";
  }
  if (els.pathPosition) els.pathPosition.value = String(Number(c.position) || 0);
  if (els.pathSpacing) els.pathSpacing.value = String(Number(c.spacing) || 0);
  if (els.pathRotateMix) els.pathRotateMix.value = String(Number(c.rotateMix || 0).toFixed(3));
  if (els.pathTranslateMix) els.pathTranslateMix.value = String(Number(c.translateMix || 0).toFixed(3));
  if (els.pathSkinRequired) els.pathSkinRequired.checked = !!c.skinRequired;
  if (els.pathClosed) els.pathClosed.value = c.closed ? "true" : "false";
  if (els.pathBones) {
    const set = new Set((c.bones || []).map((v) => Number(v)));
    for (const opt of els.pathBones.options) opt.selected = set.has(Number(opt.value));
  }
  if (els.pathHint) {
    const tName = m.rigBones[c.target] ? m.rigBones[c.target].name : c.target;
    const slotName =
      Number.isFinite(Number(c.targetSlot)) && Number(c.targetSlot) >= 0 && Number(c.targetSlot) < state.slots.length
        ? state.slots[Number(c.targetSlot)]?.name || `slot_${Number(c.targetSlot)}`
        : "(none)";
    const bNames = (c.bones || []).map((bi) => m.rigBones[bi]?.name || bi).join(", ");
    const sourceText =
      c.sourceType === "bone_chain"
        ? `${tName} chain`
        : c.sourceType === "slot"
          ? `slot "${slotName}" contour`
          : `drawn path (${Array.isArray(c.points) ? c.points.length : 0} pts)`;
    const drawState = state.pathEdit.drawArmed ? " | draw: armed" : "";
    const selInfo =
      c.sourceType === "drawn" && Number.isFinite(Number(state.pathEdit.activePoint)) && Number(state.pathEdit.activePoint) >= 0
        ? ` | sel:${Number(state.pathEdit.activePoint)}`
        : "";
    els.pathHint.textContent = `Path ${c.name}: [${bNames}] along ${sourceText}, pos ${Number(c.position).toFixed(
      1
    )}, spacing ${Number(c.spacing).toFixed(1)} (${c.positionMode}/${c.spacingMode}/${c.rotateMode})${drawState}${selInfo}. Drag node/handles (orange=in, green=out).`;
  }
}

function applyActivePathFromUI(updateBones = false) {
  const m = state.mesh;
  const c = getActivePathConstraint();
  if (!m || !c) return false;
  const prev = {
    position: Number(c.position) || 0,
    spacing: Number(c.spacing) || 0,
    rotateMix: Number(c.rotateMix) || 0,
    translateMix: Number(c.translateMix) || 0,
  };
  c.name = els.pathName ? els.pathName.value.trim() || c.name : c.name;
  c.target = Number(els.pathTargetBone ? els.pathTargetBone.value : c.target);
  c.sourceType =
    els.pathSourceType && els.pathSourceType.value === "bone_chain"
      ? "bone_chain"
      : els.pathSourceType && els.pathSourceType.value === "slot"
        ? "slot"
        : "drawn";
  if (c.sourceType !== "drawn") {
    state.pathEdit.drawArmed = false;
    state.pathEdit.activePoint = -1;
    state.pathEdit.activeHandle = "";
  }
  c.targetSlot = Number(els.pathTargetSlot ? els.pathTargetSlot.value : c.targetSlot);
  c.enabled = !els.pathEnabled || els.pathEnabled.value !== "false";
  c.positionMode = els.pathPositionMode && els.pathPositionMode.value === "percent" ? "percent" : "fixed";
  c.spacingMode =
    els.pathSpacingMode && els.pathSpacingMode.value === "fixed"
      ? "fixed"
      : els.pathSpacingMode && els.pathSpacingMode.value === "percent"
        ? "percent"
        : els.pathSpacingMode && els.pathSpacingMode.value === "proportional"
          ? "proportional"
          : "length";
  c.rotateMode =
    els.pathRotateMode && els.pathRotateMode.value === "chain"
      ? "chain"
      : els.pathRotateMode && els.pathRotateMode.value === "chainScale"
        ? "chainScale"
        : "tangent";
  c.position = Number(els.pathPosition ? els.pathPosition.value : c.position) || 0;
  c.spacing = Number(els.pathSpacing ? els.pathSpacing.value : c.spacing) || 0;
  c.rotateMix = math.clamp(Number(els.pathRotateMix ? els.pathRotateMix.value : c.rotateMix) || 0, 0, 1);
  c.translateMix = math.clamp(Number(els.pathTranslateMix ? els.pathTranslateMix.value : c.translateMix) || 0, 0, 1);
  c.skinRequired = !!(els.pathSkinRequired && els.pathSkinRequired.checked);
  c.closed = !!(els.pathClosed && els.pathClosed.value === "true");
  if (updateBones && els.pathBones) {
    const picked = Array.from(els.pathBones.selectedOptions)
      .map((o) => Number(o.value))
      .filter((v) => Number.isFinite(v));
    c.bones = [...new Set(picked)].filter((bi) => (c.sourceType === "bone_chain" ? bi !== c.target : true));
  }
  ensurePathConstraints(m);
  if (Math.abs((Number(c.position) || 0) - prev.position) > 1e-6) markDirtyTrack(getPathTrackId(state.selectedPath, "position"));
  if (Math.abs((Number(c.spacing) || 0) - prev.spacing) > 1e-6) markDirtyTrack(getPathTrackId(state.selectedPath, "spacing"));
  if (Math.abs((Number(c.rotateMix) || 0) - prev.rotateMix) > 1e-6) markDirtyTrack(getPathTrackId(state.selectedPath, "rotateMix"));
  if (Math.abs((Number(c.translateMix) || 0) - prev.translateMix) > 1e-6)
    markDirtyTrack(getPathTrackId(state.selectedPath, "translateMix"));
  refreshPathUI();
  refreshTrackSelect();
  renderTimelineTracks();
  return true;
}

function addPointToActivePath(x, y) {
  const c = getActivePathConstraint();
  if (!c) return false;
  if (!Array.isArray(c.points)) c.points = [];
  const px = Number(x) || 0;
  const py = Number(y) || 0;
  if (c.points.length > 0) {
    const last = normalizePathNode(c.points[c.points.length - 1]);
    if (Math.hypot(px - (Number(last.x) || 0), py - (Number(last.y) || 0)) <= 0.5) return false;
    const dx = px - last.x;
    const dy = py - last.y;
    // Keep a visible 3-point node shape (in/anchor/out) like Spine.
    last.houtx = last.x + dx / 3;
    last.houty = last.y + dy / 3;
    if (!last.broken) {
      last.hinx = last.x - dx / 3;
      last.hiny = last.y - dy / 3;
    }
    c.points[c.points.length - 1] = last;
    c.points.push({
      x: px,
      y: py,
      hinx: px - dx / 3,
      hiny: py - dy / 3,
      houtx: px + dx / 3,
      houty: py + dy / 3,
      broken: false,
      handleMode: "aligned",
    });
  } else {
    c.points.push({ x: px, y: py, hinx: px, hiny: py, houtx: px, houty: py, broken: false, handleMode: "auto" });
  }
  if (c.points.length >= 2) c.sourceType = "drawn";
  applyAutoHandlesForConstraint(c);
  state.pathEdit.activePoint = c.points.length - 1;
  state.pathEdit.activeHandle = "point";
  refreshPathUI();
  return true;
}

function clearActivePathShape() {
  const c = getActivePathConstraint();
  if (!c) return false;
  c.points = [];
  c.closed = false;
  state.pathEdit.activePoint = -1;
  state.pathEdit.activeHandle = "";
  if (els.pathClosed) els.pathClosed.value = "false";
  refreshPathUI();
  renderTimelineTracks();
  return true;
}

function closeActivePathShape() {
  const c = getActivePathConstraint();
  if (!c) return false;
  const pts = Array.isArray(c.points) ? c.points : [];
  if (pts.length < 3) return false;
  c.closed = true;
  c.sourceType = "drawn";
  applyAutoHandlesForConstraint(c);
  if (els.pathClosed) els.pathClosed.value = "true";
  refreshPathUI();
  renderTimelineTracks();
  return true;
}

function applyHandleModeToSelectedPathPoint(mode) {
  const c = getActivePathConstraint();
  if (!c || c.sourceType !== "drawn" || !Array.isArray(c.points)) return false;
  const i = Number(state.pathEdit.activePoint);
  if (!Number.isFinite(i) || i < 0 || i >= c.points.length) return false;
  const p = normalizePathNode(c.points[i]);
  const m = mode === "auto" ? "auto" : mode === "broken" ? "broken" : "aligned";
  p.handleMode = m;
  p.broken = m === "broken";
  if (m === "auto") {
    c.points[i] = p;
    applyAutoHandlesForConstraint(c);
  } else {
    c.points[i] = p;
  }
  refreshPathUI();
  return true;
}

function normalizePathNode(p) {
  const x = Number(p && p.x) || 0;
  const y = Number(p && p.y) || 0;
  const hinx = Number.isFinite(Number(p && p.hinx)) ? Number(p.hinx) : x;
  const hiny = Number.isFinite(Number(p && p.hiny)) ? Number(p.hiny) : y;
  const houtx = Number.isFinite(Number(p && p.houtx)) ? Number(p.houtx) : x;
  const houty = Number.isFinite(Number(p && p.houty)) ? Number(p.houty) : y;
  const handleMode = p && p.handleMode === "auto" ? "auto" : p && p.handleMode === "broken" ? "broken" : "aligned";
  return { x, y, hinx, hiny, houtx, houty, broken: handleMode === "broken", handleMode };
}

function getDrawnPathNodes(pathConstraint) {
  const src = Array.isArray(pathConstraint && pathConstraint.points) ? pathConstraint.points : [];
  return src.map((p) => normalizePathNode(p));
}

function normalizeVec(x, y) {
  const l = Math.hypot(x, y);
  if (l <= 1e-6) return { x: 1, y: 0, len: 0 };
  return { x: x / l, y: y / l, len: l };
}

function applyAutoHandleForNode(nodes, i, closed) {
  if (!Array.isArray(nodes) || i < 0 || i >= nodes.length) return;
  const n = nodes.length;
  const curr = nodes[i];
  if (!curr || curr.handleMode !== "auto") return;
  const prevIndex = i > 0 ? i - 1 : closed ? n - 1 : -1;
  const nextIndex = i < n - 1 ? i + 1 : closed ? 0 : -1;
  if (prevIndex < 0 && nextIndex < 0) return;
  const prev = prevIndex >= 0 ? nodes[prevIndex] : null;
  const next = nextIndex >= 0 ? nodes[nextIndex] : null;
  const toPrev = prev ? normalizeVec(curr.x - prev.x, curr.y - prev.y) : null;
  const toNext = next ? normalizeVec(next.x - curr.x, next.y - curr.y) : null;
  let tx = 1;
  let ty = 0;
  if (toPrev && toNext) {
    tx = toPrev.x + toNext.x;
    ty = toPrev.y + toNext.y;
    const t = normalizeVec(tx, ty);
    tx = t.x;
    ty = t.y;
  } else if (toNext) {
    tx = toNext.x;
    ty = toNext.y;
  } else if (toPrev) {
    tx = toPrev.x;
    ty = toPrev.y;
  }
  const inLen = toPrev ? Math.max(8, toPrev.len / 3) : Math.max(8, (toNext ? toNext.len : 24) / 3);
  const outLen = toNext ? Math.max(8, toNext.len / 3) : Math.max(8, (toPrev ? toPrev.len : 24) / 3);
  curr.hinx = curr.x - tx * inLen;
  curr.hiny = curr.y - ty * inLen;
  curr.houtx = curr.x + tx * outLen;
  curr.houty = curr.y + ty * outLen;
}

function applyAutoHandlesForConstraint(c) {
  if (!c || !Array.isArray(c.points) || c.points.length === 0) return;
  const nodes = c.points.map((p) => normalizePathNode(p));
  for (let i = 0; i < nodes.length; i += 1) applyAutoHandleForNode(nodes, i, !!c.closed);
  c.points = nodes;
}

function cubicBezierPoint(p0, c1, c2, p1, t) {
  const u = 1 - t;
  const uu = u * u;
  const tt = t * t;
  const uuu = uu * u;
  const ttt = tt * t;
  return {
    x: uuu * p0.x + 3 * uu * t * c1.x + 3 * u * tt * c2.x + ttt * p1.x,
    y: uuu * p0.y + 3 * uu * t * c1.y + 3 * u * tt * c2.y + ttt * p1.y,
  };
}

function collectDrawnPathPoints(pathConstraint, closed = false) {
  const nodes = getDrawnPathNodes(pathConstraint);
  if (nodes.length < 2) return [];
  const out = [{ x: nodes[0].x, y: nodes[0].y }];
  const segCount = closed ? nodes.length : nodes.length - 1;
  const steps = 12;
  for (let i = 0; i < segCount; i += 1) {
    const a = nodes[i];
    const b = nodes[(i + 1) % nodes.length];
    const p0 = { x: a.x, y: a.y };
    const c1 = { x: a.houtx, y: a.houty };
    const c2 = { x: b.hinx, y: b.hiny };
    const p1 = { x: b.x, y: b.y };
    for (let s = 1; s <= steps; s += 1) {
      out.push(cubicBezierPoint(p0, c1, c2, p1, s / steps));
    }
  }
  return out;
}

function pickActivePathDrawControl(mx, my) {
  if (state.editMode !== "skeleton" || state.leftToolTab !== "path") return null;
  const c = getActivePathConstraint();
  if (!c || c.sourceType !== "drawn") return null;
  const nodes = getDrawnPathNodes(c);
  if (nodes.length === 0) return null;
  const maxD2 = 10 * 10;
  let best = null;
  const test = (kind, index, x, y, pri) => {
    const s = localToScreen(x, y);
    const dx = s.x - mx;
    const dy = s.y - my;
    const d2 = dx * dx + dy * dy;
    if (d2 > maxD2) return;
    if (!best || d2 < best.d2 || (Math.abs(d2 - best.d2) < 0.001 && pri < best.pri)) {
      best = { kind, index, d2, pri };
    }
  };
  for (let i = 0; i < nodes.length; i += 1) {
    const p = nodes[i];
    // Prefer handle picking over anchor when overlap is close.
    test("in", i, p.hinx, p.hiny, 0);
    test("out", i, p.houtx, p.houty, 0);
    test("point", i, p.x, p.y, 1);
  }
  return best;
}

function getActiveIKConstraint() {
  const m = state.mesh;
  if (!m) return null;
  const list = ensureIKConstraints(m);
  sortConstraintListByOrder(list);
  if (state.selectedIK < 0 || state.selectedIK >= list.length) return null;
  return list[state.selectedIK];
}

function getIkConstrainedBoneSet(m) {
  const out = new Set();
  if (!m) return out;
  const list = ensureIKConstraints(m);
  for (const ik of list) {
    if (!ik || ik.enabled === false) continue;
    for (const bi of ik.bones || []) out.add(bi);
  }
  return out;
}

function getIkTargetBoneSet(m) {
  const out = new Set();
  if (!m) return out;
  const list = ensureIKConstraints(m);
  for (const ik of list) {
    if (!ik || ik.enabled === false) continue;
    const t = Number(ik.target);
    if (Number.isFinite(t) && t >= 0) out.add(t);
  }
  return out;
}

function resolveTwoBoneChain(m, selectedIndex) {
  if (!m || !Array.isArray(m.rigBones) || m.rigBones.length === 0) return null;
  const bones = m.rigBones;
  const sel = Number.isFinite(selectedIndex) ? selectedIndex : -1;
  if (sel < 0 || sel >= bones.length) return null;
  const parent = Number(bones[sel] && bones[sel].parent);
  if (Number.isFinite(parent) && parent >= 0 && parent < bones.length) {
    // Prefer parent->selected, so selecting a mid-chain bone gives the expected upper segment IK.
    return [parent, sel];
  }
  for (let i = 0; i < bones.length; i += 1) {
    if (Number(bones[i] && bones[i].parent) === sel) return [sel, i];
  }
  return null;
}

function addIKConstraint(twoBone = false) {
  const m = state.mesh;
  if (!m || !Array.isArray(m.rigBones) || m.rigBones.length === 0) return false;
  const nextOrder = getNextGlobalConstraintOrder(m);
  const list = ensureIKConstraints(m);
  const uiSel = Number(els.boneSelect ? els.boneSelect.value : state.selectedBone);
  const sel = Number.isFinite(uiSel) ? uiSel : Number(state.selectedBone);
  let a = Number.isFinite(sel) && sel >= 0 && sel < m.rigBones.length ? sel : 0;
  let b = -1;
  if (twoBone) {
    const chain = resolveTwoBoneChain(m, a);
    if (!chain) return false;
    a = chain[0];
    b = chain[1];
  }
  const chain = twoBone ? [a, b] : [a];
  const target = Number.isFinite(sel) && sel >= 0 && sel < m.rigBones.length && !chain.includes(sel) ? sel : -1;
  const pose = getPoseBones(m);
  const tempIK = { bones: chain, endMode: twoBone ? "head" : "tail" };
  const tp = getIKConstraintEndPointWorld(pose, tempIK) || { x: 0, y: 0 };
  const ik = {
    name: `ik_${list.length}`,
    bones: chain,
    target,
    targetX: tp.x,
    targetY: tp.y,
    mix: 1,
    softness: 0,
    bendPositive: true,
    compress: false,
    stretch: false,
    uniform: false,
    order: nextOrder,
    skinRequired: false,
    enabled: true,
    endMode: twoBone ? "head" : "tail",
  };
  list.push(ik);
  state.selectedIK = list.length - 1;
  refreshIKUI();
  refreshTrackSelect();
  renderTimelineTracks();
  renderBoneTree();
  return true;
}

function removeSelectedIKConstraint() {
  const m = state.mesh;
  if (!m) return false;
  const list = ensureIKConstraints(m);
  if (state.selectedIK < 0 || state.selectedIK >= list.length) return false;
  list.splice(state.selectedIK, 1);
  state.selectedIK = list.length > 0 ? Math.min(state.selectedIK, list.length - 1) : -1;
  refreshIKUI();
  refreshTrackSelect();
  renderTimelineTracks();
  renderBoneTree();
  return true;
}

function remapIKAfterBoneRemoved(m, removed) {
  if (!m || !Array.isArray(m.ikConstraints)) return;
  const out = [];
  for (const c of m.ikConstraints) {
    if (!c) continue;
    const bones = (c.bones || []).map((bi) => {
      if (bi === removed) return -1;
      return bi > removed ? bi - 1 : bi;
    });
    const target = c.target === removed ? -1 : c.target > removed ? c.target - 1 : c.target;
    if (bones.some((bi) => bi < 0)) continue;
    if (bones.length >= 2 && Number(m.rigBones[bones[1]] && m.rigBones[bones[1]].parent) !== bones[0]) continue;
    out.push({ ...c, bones, target });
  }
  m.ikConstraints = out;
  if (state.selectedIK >= out.length) state.selectedIK = out.length - 1;
}

function solveOneBoneIK(bones, boneIndex, target, mix = 1) {
  if (!bones || boneIndex < 0 || boneIndex >= bones.length) return;
  const b = bones[boneIndex];
  if (!b) return;
  normalizeBoneChannels(b);
  const world = computeWorld(bones);
  const head = transformPoint(world[boneIndex], 0, 0);
  const parentWorld = b.parent >= 0 ? world[b.parent] : createIdentity();
  const desiredWorld = Math.atan2(target.y - head.y, target.x - head.x);
  const desiredLocal = desiredWorld - matrixAngle(parentWorld) - (Number(b.shx) || 0);
  b.rot = lerpAngle(Number(b.rot) || 0, desiredLocal, math.clamp(mix, 0, 1));
}

function solveTwoBoneIK(bones, parentIndex, childIndex, target, mix = 1, bendPositive = true) {
  if (!bones || parentIndex < 0 || childIndex < 0 || parentIndex >= bones.length || childIndex >= bones.length) return;
  const parent = bones[parentIndex];
  const child = bones[childIndex];
  if (!parent || !child) return;
  if (Number(child.parent) !== parentIndex) return;
  normalizeBoneChannels(parent);
  normalizeBoneChannels(child);
  const world = computeWorld(bones);
  const head = transformPoint(world[parentIndex], 0, 0);
  const joint = transformPoint(world[parentIndex], Number(parent.length) || 0, 0);
  const tip = transformPoint(world[childIndex], Number(child.length) || 0, 0);
  const l1 = Math.max(1e-6, Math.hypot(joint.x - head.x, joint.y - head.y));
  const l2 = Math.max(1e-6, Math.hypot(tip.x - joint.x, tip.y - joint.y));
  const dx = target.x - head.x;
  const dy = target.y - head.y;
  const dd = Math.hypot(dx, dy);
  const d = math.clamp(dd, Math.abs(l1 - l2) + 1e-6, l1 + l2 - 1e-6);
  const cos2 = math.clamp((d * d - l1 * l1 - l2 * l2) / (2 * l1 * l2), -1, 1);
  const a2 = Math.acos(cos2) * (bendPositive ? 1 : -1);
  const base = Math.atan2(dy, dx);
  const cosOff = math.clamp((d * d + l1 * l1 - l2 * l2) / (2 * Math.max(1e-6, d) * l1), -1, 1);
  const off = Math.acos(cosOff);
  const a1 = bendPositive ? base - off : base + off;
  const ppWorld = parent.parent >= 0 ? world[parent.parent] : createIdentity();
  const desiredParentLocal = a1 - matrixAngle(ppWorld) - (Number(parent.shx) || 0);
  parent.rot = lerpAngle(Number(parent.rot) || 0, desiredParentLocal, math.clamp(mix, 0, 1));
  const world2 = computeWorld(bones);
  const pWorld = world2[parentIndex];
  const desiredChildLocal = a1 + a2 - matrixAngle(pWorld) - (Number(child.shx) || 0);
  child.rot = lerpAngle(Number(child.rot) || 0, desiredChildLocal, math.clamp(mix, 0, 1));
}

function headTargetToTailTarget(bones, childIndex, headTarget) {
  if (!bones || childIndex < 0 || childIndex >= bones.length || !headTarget) return headTarget;
  const child = bones[childIndex];
  if (!child) return headTarget;
  const world = computeWorld(bones);
  const m = world[childIndex];
  const ang = matrixAngle(m);
  const len = Number(child.length) || 0;
  return {
    x: headTarget.x + Math.cos(ang) * len,
    y: headTarget.y + Math.sin(ang) * len,
  };
}

function applySingleTransformConstraintToBones(m, bones, c) {
  if (!m || !bones || !c || c.enabled === false) return;
  const ti = Number(c.target);
  if (!Number.isFinite(ti) || ti < 0 || ti >= bones.length) return;
  const tb = bones[ti];
  if (!tb) return;
  normalizeBoneChannels(tb);
  const rMix = math.clamp(Number(c.rotateMix) || 0, 0, 1);
  const tMix = math.clamp(Number(c.translateMix) || 0, 0, 1);
  const sMix = math.clamp(Number(c.scaleMix) || 0, 0, 1);
  const shMix = math.clamp(Number(c.shearMix) || 0, 0, 1);
  const offRot = math.degToRad(Number(c.offsetRot) || 0);
  const offShearY = math.degToRad(Number(c.offsetShearY) || 0);
  const offX = Number(c.offsetX) || 0;
  const offY = Number(c.offsetY) || 0;
  const offSX = Number(c.offsetScaleX) || 0;
  const offSY = Number(c.offsetScaleY) || 0;
  const relative = !!c.relative;
  const useLocal = !!c.local;
  for (const bi of c.bones || []) {
    if (!Number.isFinite(bi) || bi < 0 || bi >= bones.length || bi === ti) continue;
    const b = bones[bi];
    if (!b) continue;
    normalizeBoneChannels(b);
    if (!useLocal) {
      const world = computeWorld(bones);
      const tw = world[ti];
      const pw = Number(b.parent) >= 0 ? world[b.parent] : createIdentity();
      const targetHead = transformPoint(tw, 0, 0);
      const targetRotW = matrixAngle(tw);
      if (relative) {
        if (tMix > 0) {
          b.tx += (targetHead.x + offX) * tMix;
          b.ty += (targetHead.y + offY) * tMix;
        }
        if (rMix > 0) b.rot += (targetRotW + offRot) * rMix;
      } else {
        if (tMix > 0) {
          const desiredWorld = { x: targetHead.x + offX, y: targetHead.y + offY };
          const desiredLocal = transformPoint(invert(pw), desiredWorld.x, desiredWorld.y);
          b.tx += (desiredLocal.x - b.tx) * tMix;
          b.ty += (desiredLocal.y - b.ty) * tMix;
        }
        if (rMix > 0) {
          const desiredLocalRot = targetRotW + offRot - matrixAngle(pw) - (Number(b.shx) || 0);
          b.rot = lerpAngle(b.rot, desiredLocalRot, rMix);
        }
      }
      if (sMix > 0) {
        b.sx += ((tb.sx + offSX) - b.sx) * sMix;
        b.sy += ((tb.sy + offSY) - b.sy) * sMix;
      }
      if (shMix > 0) {
        b.shx += (tb.shx - b.shx) * shMix;
        b.shy += ((tb.shy + offShearY) - b.shy) * shMix;
      }
      continue;
    }
    if (relative) {
      if (tMix > 0) {
        b.tx += (tb.tx + offX) * tMix;
        b.ty += (tb.ty + offY) * tMix;
      }
      if (rMix > 0) b.rot += (tb.rot + offRot) * rMix;
      if (sMix > 0) {
        b.sx += ((tb.sx - 1) + offSX) * sMix;
        b.sy += ((tb.sy - 1) + offSY) * sMix;
      }
      if (shMix > 0) {
        b.shx += tb.shx * shMix;
        b.shy += (tb.shy + offShearY) * shMix;
      }
    } else {
      if (tMix > 0) {
        b.tx += ((tb.tx + offX) - b.tx) * tMix;
        b.ty += ((tb.ty + offY) - b.ty) * tMix;
      }
      if (rMix > 0) b.rot = lerpAngle(b.rot, tb.rot + offRot, rMix);
      if (sMix > 0) {
        b.sx += ((tb.sx + offSX) - b.sx) * sMix;
        b.sy += ((tb.sy + offSY) - b.sy) * sMix;
      }
      if (shMix > 0) {
        b.shx += (tb.shx - b.shx) * shMix;
        b.shy += ((tb.shy + offShearY) - b.shy) * shMix;
      }
    }
  }
}

function applySingleIKConstraintToBones(bones, ik) {
  if (!bones || !ik || ik.enabled === false) return;
  const tp = getIKSolveTargetWorld(bones, ik);
  if (!tp) return;
  const mix = math.clamp(Number(ik.mix) || 0, 0, 1);
  if (mix <= 0) return;
  const softness = Math.max(0, Number(ik.softness) || 0);
  const compress = !!ik.compress;
  const stretch = !!ik.stretch;
  const uniform = !!ik.uniform;
  const softenDistance = (dist, limit) => {
    if (!(softness > 1e-6) || dist <= limit) return dist;
    const over = dist - limit;
    const softened = limit + over * (1 - Math.exp(-over / Math.max(1e-6, softness)));
    return softened;
  };
  if ((ik.bones || []).length >= 2) {
    const aIdx = Number(ik.bones[0]);
    const bIdx = Number(ik.bones[1]);
    if (Number.isFinite(aIdx) && Number.isFinite(bIdx) && aIdx >= 0 && bIdx >= 0 && aIdx < bones.length && bIdx < bones.length) {
      const world = computeWorld(bones);
      const head = transformPoint(world[aIdx], 0, 0);
      const l1 = Math.max(1e-6, Number(bones[aIdx].length) || 0);
      const l2 = Math.max(1e-6, Number(bones[bIdx].length) || 0);
      const dx = tp.x - head.x;
      const dy = tp.y - head.y;
      const rawDist = Math.hypot(dx, dy);
      const total = l1 + l2;
      const minD = Math.abs(l1 - l2);
      const dist = softenDistance(rawDist, total);
      if (stretch && dist > total + 1e-6) {
        const s = dist / Math.max(1e-6, total);
        if (uniform) {
          bones[aIdx].length = l1 * s;
          bones[bIdx].length = l2 * s;
        } else {
          bones[bIdx].length = l2 * s;
        }
      } else if (compress && dist < minD - 1e-6) {
        const denom = Math.max(1e-6, minD);
        const s = dist / denom;
        if (uniform) {
          bones[aIdx].length = l1 * s;
          bones[bIdx].length = l2 * s;
        } else {
          bones[bIdx].length = l2 * s;
        }
      }
    }
    if (ik.endMode === "tail") {
      solveTwoBoneIK(bones, Number(ik.bones[0]), Number(ik.bones[1]), tp, mix, ik.bendPositive !== false);
    } else {
      const childIndex = Number(ik.bones[1]);
      const tailTarget = headTargetToTailTarget(bones, childIndex, tp);
      solveTwoBoneIK(bones, Number(ik.bones[0]), childIndex, tailTarget, mix, ik.bendPositive !== false);
    }
  } else if ((ik.bones || []).length === 1) {
    const bi = Number(ik.bones[0]);
    if (Number.isFinite(bi) && bi >= 0 && bi < bones.length) {
      const world = computeWorld(bones);
      const head = transformPoint(world[bi], 0, 0);
      const len = Math.max(1e-6, Number(bones[bi].length) || 0);
      const rawDist = Math.hypot(tp.x - head.x, tp.y - head.y);
      const dist = softenDistance(rawDist, len);
      if (stretch && dist > len + 1e-6) bones[bi].length = len * (dist / len);
      else if (compress && dist < len - 1e-6) bones[bi].length = dist;
    }
    solveOneBoneIK(bones, bi, tp, mix);
  }
}

function findEnabledIKForBone(m, boneIndex) {
  if (!m) return null;
  const active = getActiveIKConstraint();
  if (active && active.enabled !== false && Array.isArray(active.bones) && active.bones.includes(boneIndex)) {
    return active;
  }
  const list = ensureIKConstraints(m);
  for (const ik of list) {
    if (!ik || ik.enabled === false) continue;
    if (Array.isArray(ik.bones) && ik.bones.includes(boneIndex)) return ik;
  }
  return null;
}

function getIKTargetPointWorld(bones, boneIndex) {
  if (!bones || boneIndex < 0 || boneIndex >= bones.length) return null;
  const b = bones[boneIndex];
  if (!b) return null;
  const world = computeWorld(bones);
  const mat = world[boneIndex];
  if (!mat) return null;
  // Connected targets cannot move their head independently; use tip as effective IK target point.
  if (Number(b.parent) >= 0 && b.connected) {
    return transformPoint(mat, Number(b.length) || 0, 0);
  }
  return transformPoint(mat, 0, 0);
}

function getIKConstraintEndPointWorld(bones, ik) {
  if (!bones || !ik) return null;
  const chain = Array.isArray(ik.bones) ? ik.bones : [];
  const endBi = chain.length >= 2 ? chain[1] : chain[0];
  if (!Number.isFinite(endBi) || endBi < 0 || endBi >= bones.length) return null;
  const world = computeWorld(bones);
  if (chain.length >= 2 && ik.endMode !== "tail") {
    return transformPoint(world[endBi], 0, 0);
  }
  return transformPoint(world[endBi], Number(bones[endBi].length) || 0, 0);
}

function getIKSolveTargetWorld(bones, ik) {
  if (!bones || !ik) return null;
  const tIdx = Number(ik.target);
  if (Number.isFinite(tIdx) && tIdx >= 0 && tIdx < bones.length) {
    return getIKTargetPointWorld(bones, tIdx);
  }
  const tx = ik.targetX;
  const ty = ik.targetY;
  if (Number.isFinite(tx) && Number.isFinite(ty)) return { x: tx, y: ty };
  return getIKConstraintEndPointWorld(bones, ik);
}

function setPoseBoneHeadWorld(bones, boneIndex, headWorld) {
  if (!bones || boneIndex < 0 || boneIndex >= bones.length) return false;
  const ep = getBoneWorldEndpointsFromBones(bones, boneIndex);
  const dx = ep.tip.x - ep.head.x;
  const dy = ep.tip.y - ep.head.y;
  const nextTip = { x: headWorld.x + dx, y: headWorld.y + dy };
  setBoneFromWorldEndpoints(bones, boneIndex, headWorld, nextTip);
  return true;
}

function setPoseBoneTipWorld(bones, boneIndex, tipWorld) {
  if (!bones || boneIndex < 0 || boneIndex >= bones.length) return false;
  const ep = getBoneWorldEndpointsFromBones(bones, boneIndex);
  setBoneFromWorldEndpoints(bones, boneIndex, ep.head, tipWorld);
  return true;
}

function steerIKTargetFromBoneEdit(m, editedBoneIndex, desiredPointWorld = null, handle = "tip") {
  if (!m || state.boneMode !== "pose") return false;
  const ik = findEnabledIKForBone(m, editedBoneIndex);
  if (!ik) return false;
  const targetIndex = Number(ik.target);
  const hasTargetBone = Number.isFinite(targetIndex) && targetIndex >= 0 && targetIndex < m.poseBones.length;
  if (hasTargetBone && targetIndex === editedBoneIndex) return false;
  const bones = getPoseBones(m);
  const world = computeWorld(bones);
  const chain = Array.isArray(ik.bones) ? ik.bones : [];
  const endBi = chain.length >= 2 ? chain[1] : chain[0];
  let desired = desiredPointWorld;
  if (!desired) {
    if (!Number.isFinite(endBi) || endBi < 0 || endBi >= bones.length) return false;
    if ((ik.bones || []).length >= 2 && ik.endMode !== "tail") {
      desired = transformPoint(world[endBi], 0, 0);
    } else {
      desired = transformPoint(world[endBi], Number(bones[endBi].length) || 0, 0);
    }
  }
  if ((ik.bones || []).length >= 2 && ik.endMode !== "tail" && handle === "tip") {
    if (!Number.isFinite(endBi) || endBi < 0 || endBi >= bones.length) return false;
    const ep = getBoneWorldEndpointsFromBones(bones, endBi, world);
    const dx = desired.x - ep.tip.x;
    const dy = desired.y - ep.tip.y;
    desired = { x: ep.head.x + dx, y: ep.head.y + dy };
  }
  if (!desired) return false;
  if (!hasTargetBone) {
    ik.targetX = desired.x;
    ik.targetY = desired.y;
    const ikIdx = getIKIndexByRef(m, ik);
    markDirtyByIKProp(ikIdx, "target");
    return true;
  }
  const target = bones[targetIndex];
  if (!target) return false;
  const connectedTarget = Number(target.parent) >= 0 && target.connected;
  const ok = connectedTarget
    ? setPoseBoneTipWorld(bones, targetIndex, desired)
    : setPoseBoneHeadWorld(bones, targetIndex, desired);
  if (!ok) return false;
  markDirtyByBoneProp(targetIndex, connectedTarget ? "rotate" : "translate");
  return true;
}

function refreshIKUI() {
  const m = state.mesh;
  if (!els.ikTools) return;
  if (!m || !Array.isArray(m.rigBones) || m.rigBones.length === 0) {
    els.ikTools.style.opacity = "0.65";
    if (els.ikSelect) els.ikSelect.innerHTML = "";
    return;
  }
  els.ikTools.style.opacity = "1";
  const list = ensureIKConstraints(m);
  const prevSelected = state.selectedIK >= 0 && state.selectedIK < list.length ? list[state.selectedIK] : null;
  sortConstraintListByOrder(list);
  if (prevSelected) state.selectedIK = list.indexOf(prevSelected);
  const fillBoneSelect = (sel, allowNone = false) => {
    if (!sel) return;
    sel.innerHTML = "";
    if (allowNone) {
      const none = document.createElement("option");
      none.value = "-1";
      none.textContent = "-1: None";
      sel.appendChild(none);
    }
    for (let i = 0; i < m.rigBones.length; i += 1) {
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = `${i}: ${m.rigBones[i].name}`;
      sel.appendChild(opt);
    }
  };
  fillBoneSelect(els.ikTargetBone, true);
  fillBoneSelect(els.ikBoneA, false);
  fillBoneSelect(els.ikBoneB, true);
  if (els.ikSelect) {
    els.ikSelect.innerHTML = "";
    for (let i = 0; i < list.length; i += 1) {
      const c = list[i];
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = `${i}: ${c.name} (${(c.bones || []).length >= 2 ? "2-bone" : "1-bone"})`;
      els.ikSelect.appendChild(opt);
    }
  }
  if (els.ikList) {
    els.ikList.innerHTML = "";
    if (list.length === 0) {
      els.ikList.innerHTML = "<div class='muted'>No IK constraints yet.</div>";
    } else {
      for (let i = 0; i < list.length; i += 1) {
        const c = list[i];
        const row = document.createElement("div");
        row.className = `tree-item${state.selectedIK === i ? " selected" : ""}`;
        row.dataset.ikIndex = String(i);
        row.textContent = `${i}: ${c.name} [${(c.bones || []).length >= 2 ? "2-bone" : "1-bone"}] ${c.enabled === false ? "(off)" : ""
          }`;
        els.ikList.appendChild(row);
      }
    }
  }
  if (state.selectedIK < 0 || state.selectedIK >= list.length) state.selectedIK = list.length > 0 ? 0 : -1;
  const c = getActiveIKConstraint();
  if (els.ikRemoveBtn) els.ikRemoveBtn.disabled = !c;
  if (els.ikMoveUpBtn) els.ikMoveUpBtn.disabled = !c || state.selectedIK <= 0;
  if (els.ikMoveDownBtn) {
    const len = ensureIKConstraints(m).length;
    els.ikMoveDownBtn.disabled = !c || state.selectedIK < 0 || state.selectedIK >= len - 1;
  }
  if (els.ikPickTargetBtn) {
    els.ikPickTargetBtn.disabled = !c;
    els.ikPickTargetBtn.textContent = state.ikPickArmed ? "Cancel Target Pick" : "Pick Target in Canvas";
  }
  if (!c) {
    if (els.ikName) els.ikName.value = "";
    if (els.ikSkinRequired) els.ikSkinRequired.disabled = true;
    if (els.ikHint) els.ikHint.textContent = "No IK constraint. Add IK 1-Bone or 2-Bone.";
    return;
  }
  if (els.ikSkinRequired) els.ikSkinRequired.disabled = false;
  if (els.ikSelect) els.ikSelect.value = String(state.selectedIK);
  if (els.ikName) els.ikName.value = c.name || `ik_${state.selectedIK}`;
  if (els.ikEnabled) els.ikEnabled.value = c.enabled === false ? "false" : "true";
  if (els.ikTargetBone) els.ikTargetBone.value = String(Number.isFinite(Number(c.target)) ? Number(c.target) : -1);
  if (els.ikBoneA) els.ikBoneA.value = String(Number((c.bones || [0])[0]));
  if (els.ikBoneB) els.ikBoneB.value = (c.bones || []).length >= 2 ? String(Number(c.bones[1])) : "-1";
  if (els.ikEndMode) {
    const twoBone = (c.bones || []).length >= 2;
    els.ikEndMode.disabled = !twoBone;
    els.ikEndMode.value = c.endMode === "tail" ? "tail" : "head";
    const wrap = els.ikEndMode.closest("label");
    if (wrap) wrap.style.display = "";
  }
  if (els.ikMix) els.ikMix.value = String(math.clamp(Number(c.mix) || 0, 0, 1));
  if (els.ikSoftness) els.ikSoftness.value = String(Math.max(0, Number(c.softness) || 0));
  if (els.ikCompress) els.ikCompress.checked = !!c.compress;
  if (els.ikStretch) els.ikStretch.checked = !!c.stretch;
  if (els.ikUniform) els.ikUniform.checked = !!c.uniform;
  if (els.ikSkinRequired) els.ikSkinRequired.checked = !!c.skinRequired;
  if (els.ikBendDir) els.ikBendDir.value = c.bendPositive === false ? "-1" : "1";
  if (els.ikHint) {
    const bList = (c.bones || []).map((bi) => m.rigBones[bi]?.name || bi).join(" -> ");
    const tName =
      Number.isFinite(Number(c.target)) && Number(c.target) >= 0 && Number(c.target) < m.rigBones.length
        ? m.rigBones[c.target]?.name || c.target
        : `point(${Number(c.targetX || 0).toFixed(1)}, ${Number(c.targetY || 0).toFixed(1)})`;
    els.ikHint.textContent = `IK ${c.name}: ${bList} -> target ${tName}, mix ${Number(c.mix).toFixed(2)} (${c.enabled === false ? "off" : "on"})${state.ikPickArmed ? " | target-pick: click a bone in canvas" : ""
      }`;
  }
}

function addTransformConstraint() {
  const m = state.mesh;
  if (!m || !Array.isArray(m.rigBones) || m.rigBones.length < 2) return false;
  const nextOrder = getNextGlobalConstraintOrder(m);
  const list = ensureTransformConstraints(m);
  const selected = Number.isFinite(state.selectedBone) && state.selectedBone >= 0 ? state.selectedBone : 0;
  const target = Math.max(0, Math.min(m.rigBones.length - 1, selected));
  let bone = target;
  if (Number.isFinite(m.rigBones[target] && m.rigBones[target].parent) && Number(m.rigBones[target].parent) >= 0) {
    bone = Number(m.rigBones[target].parent);
  } else {
    for (let i = 0; i < m.rigBones.length; i += 1) {
      if (i !== target) {
        bone = i;
        break;
      }
    }
  }
  const c = {
    name: `transform_${list.length}`,
    bones: bone === target ? [] : [bone],
    target,
    rotateMix: 1,
    translateMix: 1,
    scaleMix: 0,
    shearMix: 0,
    offsetX: 0,
    offsetY: 0,
    offsetRot: 0,
    offsetScaleX: 0,
    offsetScaleY: 0,
    offsetShearY: 0,
    local: false,
    relative: false,
    order: nextOrder,
    skinRequired: false,
    enabled: true,
  };
  if (c.bones.length === 0) return false;
  list.push(c);
  state.selectedTransform = list.length - 1;
  refreshTransformUI();
  refreshTrackSelect();
  renderTimelineTracks();
  renderBoneTree();
  return true;
}

function removeSelectedTransformConstraint() {
  const m = state.mesh;
  if (!m) return false;
  const list = ensureTransformConstraints(m);
  if (state.selectedTransform < 0 || state.selectedTransform >= list.length) return false;
  list.splice(state.selectedTransform, 1);
  state.selectedTransform = list.length > 0 ? Math.min(state.selectedTransform, list.length - 1) : -1;
  refreshTransformUI();
  refreshTrackSelect();
  renderTimelineTracks();
  renderBoneTree();
  return true;
}

function refreshTransformUI() {
  const m = state.mesh;
  if (!els.tfcSelect) return;
  if (!m || !Array.isArray(m.rigBones) || m.rigBones.length === 0) {
    els.tfcSelect.innerHTML = "";
    if (els.tfcList) els.tfcList.innerHTML = "<div class='muted'>No bones.</div>";
    return;
  }
  const list = ensureTransformConstraints(m);
  const prevSelected = state.selectedTransform >= 0 && state.selectedTransform < list.length ? list[state.selectedTransform] : null;
  sortConstraintListByOrder(list);
  if (prevSelected) state.selectedTransform = list.indexOf(prevSelected);
  if (state.selectedTransform < 0 || state.selectedTransform >= list.length) {
    state.selectedTransform = list.length > 0 ? 0 : -1;
  }
  const filterText = (els.tfcBoneSearch && els.tfcBoneSearch.value ? els.tfcBoneSearch.value : "").trim().toLowerCase();
  const fillBoneSelect = (sel, allowNone = false, withFilter = false) => {
    if (!sel) return;
    const prevSelected = new Set(Array.from(sel.selectedOptions || []).map((o) => String(o.value)));
    sel.innerHTML = "";
    if (allowNone) {
      const none = document.createElement("option");
      none.value = "-1";
      none.textContent = "-1: None";
      sel.appendChild(none);
    }
    for (let i = 0; i < m.rigBones.length; i += 1) {
      const label = `${i}: ${m.rigBones[i].name}`;
      if (withFilter && filterText.length > 0 && !label.toLowerCase().includes(filterText)) continue;
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = label;
      if (prevSelected.has(opt.value)) opt.selected = true;
      sel.appendChild(opt);
    }
  };
  fillBoneSelect(els.tfcTargetBone, true, false);
  fillBoneSelect(els.tfcBones, false, true);
  els.tfcSelect.innerHTML = "";
  for (let i = 0; i < list.length; i += 1) {
    const c = list[i];
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = `${i}: ${c.name}`;
    els.tfcSelect.appendChild(opt);
  }
  if (els.tfcList) {
    els.tfcList.innerHTML = "";
    if (list.length === 0) {
      els.tfcList.innerHTML = "<div class='muted'>No Transform constraints yet.</div>";
    } else {
      for (let i = 0; i < list.length; i += 1) {
        const c = list[i];
        const row = document.createElement("div");
        row.className = `tree-item${state.selectedTransform === i ? " selected" : ""}`;
        row.dataset.tfcIndex = String(i);
        row.textContent = `${i}: ${c.name}${c.enabled === false ? " (off)" : ""}`;
        els.tfcList.appendChild(row);
      }
    }
  }
  const c = getActiveTransformConstraint();
  if (els.tfcMoveUpBtn) els.tfcMoveUpBtn.disabled = !c || state.selectedTransform <= 0;
  if (els.tfcMoveDownBtn) els.tfcMoveDownBtn.disabled = !c || state.selectedTransform >= list.length - 1;
  if (els.tfcRemoveBtn) els.tfcRemoveBtn.disabled = !c;
  if (!c) {
    if (els.tfcName) els.tfcName.value = "";
    if (els.tfcSkinRequired) els.tfcSkinRequired.disabled = true;
    if (els.tfcHint) els.tfcHint.textContent = "No Transform constraint. Add one.";
    return;
  }
  if (els.tfcSkinRequired) els.tfcSkinRequired.disabled = false;
  if (els.tfcSelect) els.tfcSelect.value = String(state.selectedTransform);
  if (els.tfcName) els.tfcName.value = c.name || `transform_${state.selectedTransform}`;
  if (els.tfcEnabled) els.tfcEnabled.value = c.enabled === false ? "false" : "true";
  if (els.tfcTargetBone) els.tfcTargetBone.value = String(c.target);
  if (els.tfcLocal) els.tfcLocal.value = c.local ? "true" : "false";
  if (els.tfcRelative) els.tfcRelative.value = c.relative ? "true" : "false";
  if (els.tfcRotateMix) els.tfcRotateMix.value = String(Number(c.rotateMix || 0).toFixed(3));
  if (els.tfcTranslateMix) els.tfcTranslateMix.value = String(Number(c.translateMix || 0).toFixed(3));
  if (els.tfcScaleMix) els.tfcScaleMix.value = String(Number(c.scaleMix || 0).toFixed(3));
  if (els.tfcShearMix) els.tfcShearMix.value = String(Number(c.shearMix || 0).toFixed(3));
  if (els.tfcOffsetX) els.tfcOffsetX.value = String(Number(c.offsetX) || 0);
  if (els.tfcOffsetY) els.tfcOffsetY.value = String(Number(c.offsetY) || 0);
  if (els.tfcOffsetRot) els.tfcOffsetRot.value = String(Number(c.offsetRot) || 0);
  if (els.tfcOffsetScaleX) els.tfcOffsetScaleX.value = String(Number(c.offsetScaleX) || 0);
  if (els.tfcOffsetScaleY) els.tfcOffsetScaleY.value = String(Number(c.offsetScaleY) || 0);
  if (els.tfcOffsetShearY) els.tfcOffsetShearY.value = String(Number(c.offsetShearY) || 0);
  if (els.tfcSkinRequired) els.tfcSkinRequired.checked = !!c.skinRequired;
  if (els.tfcBones) {
    const set = new Set((c.bones || []).map((v) => Number(v)));
    for (const opt of els.tfcBones.options) opt.selected = set.has(Number(opt.value));
  }
  if (els.tfcHint) {
    const tName = m.rigBones[c.target] ? m.rigBones[c.target].name : c.target;
    const bNames = (c.bones || []).map((bi) => m.rigBones[bi]?.name || bi).join(", ");
    els.tfcHint.textContent = `Transform ${c.name}: [${bNames}] -> ${tName}, mix r${Number(c.rotateMix).toFixed(
      2
    )}/t${Number(c.translateMix).toFixed(2)}/s${Number(c.scaleMix).toFixed(2)}/h${Number(c.shearMix).toFixed(2)}`;
  }
}

function applyActiveTransformFromUI(updateBones = false) {
  const m = state.mesh;
  const c = getActiveTransformConstraint();
  if (!m || !c) return false;
  const prev = {
    rotateMix: Number(c.rotateMix) || 0,
    translateMix: Number(c.translateMix) || 0,
    scaleMix: Number(c.scaleMix) || 0,
    shearMix: Number(c.shearMix) || 0,
  };
  c.enabled = !els.tfcEnabled || els.tfcEnabled.value !== "false";
  c.name = els.tfcName ? els.tfcName.value.trim() || c.name : c.name;
  c.target = Number(els.tfcTargetBone ? els.tfcTargetBone.value : c.target);
  c.local = !!(els.tfcLocal && els.tfcLocal.value === "true");
  c.relative = !!(els.tfcRelative && els.tfcRelative.value === "true");
  c.rotateMix = math.clamp(Number(els.tfcRotateMix ? els.tfcRotateMix.value : c.rotateMix) || 0, 0, 1);
  c.translateMix = math.clamp(Number(els.tfcTranslateMix ? els.tfcTranslateMix.value : c.translateMix) || 0, 0, 1);
  c.scaleMix = math.clamp(Number(els.tfcScaleMix ? els.tfcScaleMix.value : c.scaleMix) || 0, 0, 1);
  c.shearMix = math.clamp(Number(els.tfcShearMix ? els.tfcShearMix.value : c.shearMix) || 0, 0, 1);
  c.offsetX = Number(els.tfcOffsetX ? els.tfcOffsetX.value : c.offsetX) || 0;
  c.offsetY = Number(els.tfcOffsetY ? els.tfcOffsetY.value : c.offsetY) || 0;
  c.offsetRot = Number(els.tfcOffsetRot ? els.tfcOffsetRot.value : c.offsetRot) || 0;
  c.offsetScaleX = Number(els.tfcOffsetScaleX ? els.tfcOffsetScaleX.value : c.offsetScaleX) || 0;
  c.offsetScaleY = Number(els.tfcOffsetScaleY ? els.tfcOffsetScaleY.value : c.offsetScaleY) || 0;
  c.offsetShearY = Number(els.tfcOffsetShearY ? els.tfcOffsetShearY.value : c.offsetShearY) || 0;
  c.skinRequired = !!(els.tfcSkinRequired && els.tfcSkinRequired.checked);
  if (updateBones && els.tfcBones) {
    const picked = Array.from(els.tfcBones.selectedOptions)
      .map((o) => Number(o.value))
      .filter((v) => Number.isFinite(v));
    c.bones = [...new Set(picked)].filter((bi) => bi !== c.target);
  }
  if (!Number.isFinite(c.target) || c.target < 0 || c.target >= m.rigBones.length || (c.bones || []).length === 0) {
    ensureTransformConstraints(m);
  }
  if (Math.abs((Number(c.rotateMix) || 0) - prev.rotateMix) > 1e-6) markDirtyTrack(getTransformTrackId(state.selectedTransform, "rotateMix"));
  if (Math.abs((Number(c.translateMix) || 0) - prev.translateMix) > 1e-6)
    markDirtyTrack(getTransformTrackId(state.selectedTransform, "translateMix"));
  if (Math.abs((Number(c.scaleMix) || 0) - prev.scaleMix) > 1e-6) markDirtyTrack(getTransformTrackId(state.selectedTransform, "scaleMix"));
  if (Math.abs((Number(c.shearMix) || 0) - prev.shearMix) > 1e-6) markDirtyTrack(getTransformTrackId(state.selectedTransform, "shearMix"));
  refreshTransformUI();
  refreshTrackSelect();
  renderTimelineTracks();
  renderBoneTree();
  return true;
}

function applyActiveIKFromUI() {
  const m = state.mesh;
  const c = getActiveIKConstraint();
  if (!m || !c) return false;
  const prevMix = Number(c.mix) || 0;
  const prevSoftness = Math.max(0, Number(c.softness) || 0);
  const prevBend = c.bendPositive !== false;
  const prevCompress = !!c.compress;
  const prevStretch = !!c.stretch;
  const prevUniform = !!c.uniform;
  c.enabled = !els.ikEnabled || els.ikEnabled.value !== "false";
  c.target = Number(els.ikTargetBone ? els.ikTargetBone.value : c.target);
  c.mix = math.clamp(Number(els.ikMix ? els.ikMix.value : c.mix) || 0, 0, 1);
  c.softness = Math.max(0, Number(els.ikSoftness ? els.ikSoftness.value : c.softness) || 0);
  c.compress = !!(els.ikCompress && els.ikCompress.checked);
  c.stretch = !!(els.ikStretch && els.ikStretch.checked);
  c.uniform = !!(els.ikUniform && els.ikUniform.checked);
  c.skinRequired = !!(els.ikSkinRequired && els.ikSkinRequired.checked);
  c.bendPositive = !els.ikBendDir || els.ikBendDir.value !== "-1";
  c.endMode = !els.ikEndMode || els.ikEndMode.value !== "tail" ? "head" : "tail";
  const a = Number(els.ikBoneA ? els.ikBoneA.value : c.bones[0]);
  const b = Number(els.ikBoneB ? els.ikBoneB.value : -1);
  if (Number.isFinite(a) && a >= 0 && a < m.rigBones.length) {
    if (Number.isFinite(b) && b >= 0 && b < m.rigBones.length && Number(m.rigBones[b] && m.rigBones[b].parent) === a) {
      c.bones = [a, b];
    } else {
      c.bones = [a];
    }
  }
  if (Array.isArray(c.bones) && c.bones.includes(c.target)) {
    c.target = -1;
  }
  if (!Number.isFinite(c.target) || c.target < 0 || c.target >= m.rigBones.length) {
    c.target = -1;
    if (!Number.isFinite(c.targetX) || !Number.isFinite(c.targetY)) {
      const tp = getIKConstraintEndPointWorld(getPoseBones(m), c);
      if (tp) {
        c.targetX = tp.x;
        c.targetY = tp.y;
      } else {
        c.targetX = 0;
        c.targetY = 0;
      }
    }
  }
  if ((c.bones || []).length < 2) c.endMode = "tail";
  if (Math.abs((Number(c.mix) || 0) - prevMix) > 1e-6) markDirtyByIKProp(state.selectedIK, "mix");
  if (Math.abs((Number(c.softness) || 0) - prevSoftness) > 1e-6) markDirtyByIKProp(state.selectedIK, "softness");
  if ((c.bendPositive !== false) !== prevBend) markDirtyByIKProp(state.selectedIK, "bend");
  if (c.compress !== prevCompress) markDirtyByIKProp(state.selectedIK, "compress");
  if (c.stretch !== prevStretch) markDirtyByIKProp(state.selectedIK, "stretch");
  if (c.uniform !== prevUniform) markDirtyByIKProp(state.selectedIK, "uniform");
  ensureIKConstraints(m);
  refreshIKUI();
  refreshTrackSelect();
  renderTimelineTracks();
  renderBoneTree();
  return true;
}

function getSlotTransformMatrix(slot, poseWorld) {
  const m = state.mesh;
  if (!m || !slot) return createIdentity();
  const baseTm = getBaseImageTransformMatrix(slot, poseWorld);
  const tx = Number(slot.tx) || 0;
  const ty = Number(slot.ty) || 0;
  const rot = Number(slot.rot) || 0;
  if (Math.abs(tx) < 1e-6 && Math.abs(ty) < 1e-6 && Math.abs(rot) < 1e-6) return baseTm;
  let slotTm = null;
  const boneIdx = getSlotBaseSpaceBoneIndex(slot, m);
  if (Number.isFinite(boneIdx) && boneIdx >= 0 && boneIdx < poseWorld.length) {
    const bw = poseWorld[boneIdx];
    slotTm = mul(mul(bw, matFromTR(tx, ty, rot)), invert(bw));
  } else {
    const pivot = matFromTR((state.imageWidth || 0) * 0.5, (state.imageHeight || 0) * 0.5, 0);
    slotTm = mul(mul(pivot, matFromTR(tx, ty, rot)), invert(pivot));
  }
  return mul(baseTm, slotTm);
}

function getSlotMeshEditMatrix(slot, poseWorld = null) {
  if (!slot) return createIdentity();
  const m = state.mesh;
  if (!m) return getBaseImageTransformMatrix(slot, null);
  const world = Array.isArray(poseWorld) ? poseWorld : getSolvedPoseWorld(m);
  return getSlotTransformMatrix(slot, world);
}

function slotMeshLocalToWorld(slot, point, poseWorld = null) {
  const tm = getSlotMeshEditMatrix(slot, poseWorld);
  return transformPoint(tm, Number(point && point.x) || 0, Number(point && point.y) || 0);
}

function worldToSlotMeshLocal(slot, point, poseWorld = null) {
  const tm = getSlotMeshEditMatrix(slot, poseWorld);
  const inv = invert(tm);
  return transformPoint(inv, Number(point && point.x) || 0, Number(point && point.y) || 0);
}

function slotMeshLocalToScreen(slot, point, poseWorld = null) {
  const w = slotMeshLocalToWorld(slot, point, poseWorld);
  return localToScreen(w.x, w.y);
}

function getSlotMeshPreviewGridInfo(slot, contour) {
  const att = getActiveAttachment(slot);
  const meshData = att && att.meshData;
  if (!meshData) return null;
  const cols = Math.floor(Number(meshData.cols));
  const rows = Math.floor(Number(meshData.rows));
  const points = contour && Array.isArray(contour.fillPoints) ? contour.fillPoints : null;
  if (!Number.isFinite(cols) || !Number.isFinite(rows) || cols < 1 || rows < 1) return null;
  if (!Array.isArray(points) || points.length !== (cols + 1) * (rows + 1)) return null;
  if (!(contour && contour.fillFromMeshData && !contour.dirty)) return null;
  return { cols, rows, points };
}

function drawSlotMeshPreviewGrid(ctx, slot, gridInfo, poseWorld) {
  if (!ctx || !slot || !gridInfo) return false;
  const { cols, rows, points } = gridInfo;
  const idxAt = (x, y) => y * (cols + 1) + x;

  ctx.save();
  ctx.strokeStyle = "rgba(63, 208, 162, 0.72)";
  ctx.lineWidth = 1.15;

  for (let y = 0; y <= rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const a = points[idxAt(x, y)];
      const b = points[idxAt(x + 1, y)];
      if (!a || !b) continue;
      const sa = slotMeshLocalToScreen(slot, a, poseWorld);
      const sb = slotMeshLocalToScreen(slot, b, poseWorld);
      ctx.beginPath();
      ctx.moveTo(sa.x, sa.y);
      ctx.lineTo(sb.x, sb.y);
      ctx.stroke();
    }
  }

  for (let x = 0; x <= cols; x += 1) {
    for (let y = 0; y < rows; y += 1) {
      const a = points[idxAt(x, y)];
      const b = points[idxAt(x, y + 1)];
      if (!a || !b) continue;
      const sa = slotMeshLocalToScreen(slot, a, poseWorld);
      const sb = slotMeshLocalToScreen(slot, b, poseWorld);
      ctx.beginPath();
      ctx.moveTo(sa.x, sa.y);
      ctx.lineTo(sb.x, sb.y);
      ctx.stroke();
    }
  }

  ctx.strokeStyle = "rgba(63, 208, 162, 0.24)";
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const i0 = idxAt(x, y);
      const i1 = idxAt(x + 1, y);
      const i2 = idxAt(x, y + 1);
      const i3 = idxAt(x + 1, y + 1);
      const a = points[i0];
      const b = points[i1];
      const c = points[i2];
      const d = points[i3];
      if (!a || !b || !c || !d) continue;
      const p0 = slotMeshLocalToScreen(slot, a, poseWorld);
      const p1 = slotMeshLocalToScreen(slot, b, poseWorld);
      const p2 = slotMeshLocalToScreen(slot, c, poseWorld);
      const p3 = slotMeshLocalToScreen(slot, d, poseWorld);
      ctx.beginPath();
      if (((x + y) & 1) === 0) {
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p3.x, p3.y);
      } else {
        ctx.moveTo(p2.x, p2.y);
        ctx.lineTo(p1.x, p1.y);
      }
      ctx.stroke();
    }
  }

  ctx.restore();
  return true;
}

function screenToSlotMeshLocal(slot, mx, my, poseWorld = null) {
  const w = screenToLocal(mx, my);
  return worldToSlotMeshLocal(slot, w, poseWorld);
}

function rebuildSlotTriangleIndices() {
  const m = state.mesh;
  if (!m) return;
  for (const s of state.slots) {
    if (!s) continue;
    ensureSlotMeshData(s, m);
    s._indices = null;
  }
}

function buildRegionAttachmentGeometry(slot, poseWorld) {
  const att = getActiveAttachment(slot);
  if (!slot || !att || !att.canvas) return { interleaved: null, screen: null, indices: null, uvs: null };
  const rect =
    att.rect && Number.isFinite(att.rect.w) && Number.isFinite(att.rect.h)
      ? att.rect
      : slot.rect && Number.isFinite(slot.rect.w) && Number.isFinite(slot.rect.h)
        ? slot.rect
        : {
          x: 0,
          y: 0,
          w: Math.max(1, Number(att.canvas.width) || 1),
          h: Math.max(1, Number(att.canvas.height) || 1),
        };
  const rw = Math.max(1, Number(rect.w) || Number(att.canvas.width) || 1);
  const rh = Math.max(1, Number(rect.h) || Number(att.canvas.height) || 1);
  const x0 = Number(rect.x) || 0;
  const y0 = Number(rect.y) || 0;
  const corners = [
    { x: x0, y: y0 },
    { x: x0 + rw, y: y0 },
    { x: x0 + rw, y: y0 + rh },
    { x: x0, y: y0 + rh },
  ];
  const tm = getSlotTransformMatrix(slot, Array.isArray(poseWorld) ? poseWorld : []);
  const screen = new Float32Array(8);
  const interleaved = new Float32Array(16);
  const uvs = new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]);
  const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);

  for (let i = 0; i < corners.length; i += 1) {
    const worldPoint = transformPoint(tm, corners[i].x, corners[i].y);
    const screenPoint = localToScreen(worldPoint.x, worldPoint.y);
    screen[i * 2] = screenPoint.x;
    screen[i * 2 + 1] = screenPoint.y;
    interleaved[i * 4] = screenPoint.x;
    interleaved[i * 4 + 1] = screenPoint.y;
    interleaved[i * 4 + 2] = uvs[i * 2];
    interleaved[i * 4 + 3] = uvs[i * 2 + 1];
  }

  return { interleaved, screen, indices, uvs };
}

function buildSlotGeometry(slot, poseWorld) {
  const m = state.mesh;
  if (!m) return { interleaved: null, screen: null };
  ensureSlotMeshData(slot, m);
  const sm = slot && (getActiveAttachment(slot) || {}).meshData ? (getActiveAttachment(slot) || {}).meshData : null;
  if (!sm) return { interleaved: null, screen: null };
  const offsets = sm.offsets;
  const tm = getSlotTransformMatrix(slot, poseWorld);
  const vCount = sm.positions.length / 2;
  const mode = getSlotWeightMode(slot);
  const boneCount = mode === "free" ? 0 : m.rigBones.length;
  const invBind = getDisplayInvBind(m);
  if (!sm.interleaved || sm.interleaved.length !== vCount * 4) sm.interleaved = new Float32Array(vCount * 4);
  if (!sm.deformedScreen || sm.deformedScreen.length !== vCount * 2) sm.deformedScreen = new Float32Array(vCount * 2);
  if (!sm.deformedLocal || sm.deformedLocal.length !== vCount * 2) sm.deformedLocal = new Float32Array(vCount * 2);
  // Build per-slot bone palette once. Different from _palette.mesh because
  // poseWorld is the constraint-resolved pose (not the edit-aware variant).
  _palette.slot = boneCount > 0 ? buildBonePalette(poseWorld, invBind, _palette.slot) : null;
  const palette = _palette.slot;
  for (let i = 0; i < vCount; i += 1) {
    const x = sm.positions[i * 2];
    const y = sm.positions[i * 2 + 1];
    let sx = x;
    let sy = y;
    if (boneCount > 0 && palette) {
      sx = 0;
      sy = 0;
      const wRowBase = i * boneCount;
      for (let b = 0; b < boneCount; b += 1) {
        const w = sm.weights[wRowBase + b];
        if (w <= 0) continue;
        const o = b * 6;
        const px = palette[o] * x + palette[o + 1] * y + palette[o + 4];
        const py = palette[o + 2] * x + palette[o + 3] * y + palette[o + 5];
        sx += px * w;
        sy += py * w;
      }
    }
    const lx = sx + (offsets[i * 2] || 0);
    const ly = sy + (offsets[i * 2 + 1] || 0);
    sm.deformedLocal[i * 2] = lx;
    sm.deformedLocal[i * 2 + 1] = ly;
    const p = transformPoint(tm, lx, ly);
    const s = localToScreen(p.x, p.y);
    sm.deformedScreen[i * 2] = s.x;
    sm.deformedScreen[i * 2 + 1] = s.y;
    sm.interleaved[i * 4] = s.x;
    sm.interleaved[i * 4 + 1] = s.y;
    sm.interleaved[i * 4 + 2] = sm.uvs[i * 2];
    sm.interleaved[i * 4 + 3] = sm.uvs[i * 2 + 1];
  }
  return { interleaved: sm.interleaved, screen: sm.deformedScreen, indices: sm.indices, uvs: sm.uvs };
}

function buildImportedAttachmentDefaults() {
  const m = state.mesh;
  const bones = m && Array.isArray(m.rigBones) ? m.rigBones : [];
  const boneCount = bones.length;
  const selectedBones =
    boneCount > 0 && typeof getSelectedBonesForWeight === "function"
      ? getSelectedBonesForWeight(m).filter((bi) => Number.isFinite(bi) && bi >= 0 && bi < boneCount)
      : [];
  const primaryCandidate =
    boneCount > 0 && typeof getPrimarySelectedBoneIndex === "function" ? Number(getPrimarySelectedBoneIndex()) : -1;
  const primaryBone =
    Number.isFinite(primaryCandidate) && primaryCandidate >= 0 && primaryCandidate < boneCount
      ? primaryCandidate
      : boneCount > 0
        ? 0
        : -1;
  const influenceBones =
    boneCount > 1
      ? (selectedBones.length > 1 ? selectedBones : bones.map((_, index) => index))
      : primaryBone >= 0
        ? [primaryBone]
        : [];
  const weighted = influenceBones.length > 1;
  return {
    bone: primaryBone,
    useWeights: true,
    weightBindMode: weighted ? "auto" : "single",
    weightMode: weighted ? "weighted" : "single",
    influenceBones,
    defaultAttachmentType: ATTACHMENT_TYPES.MESH,
  };
}

function collectPsdLayerSlots(children, out, docW, docH, prefix = "") {
  if (!Array.isArray(children)) return;
  for (const layer of children) {
    const layerName = layer && layer.name ? layer.name : "Layer";
    const fullName = prefix ? `${prefix}/${layerName}` : layerName;
    if (Array.isArray(layer.children) && layer.children.length > 0) {
      collectPsdLayerSlots(layer.children, out, docW, docH, fullName);
    }
    if (layer && layer.canvas) {
      const b = getCanvasAlphaBounds(layer.canvas);
      if (!b) continue;
      const cropped = makeCanvas(b.w, b.h);
      const cctx = cropped.getContext("2d");
      if (!cctx) continue;
      cctx.drawImage(layer.canvas, b.x, b.y, b.w, b.h, 0, 0, b.w, b.h);
      const lx = Number.isFinite(layer.left) ? layer.left : 0;
      const ly = Number.isFinite(layer.top) ? layer.top : 0;
      out.push({
        name: fullName,
        canvas: cropped,
        ...buildImportedAttachmentDefaults(),
        docWidth: docW,
        docHeight: docH,
        rect: { x: lx + b.x, y: ly + b.y, w: b.w, h: b.h },
      });
    }
  }
}

async function loadFileSlots(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".psd")) {
    setStatus("Loading PSD via ag-psd from CDN...");
    const mod = await import("https://esm.sh/ag-psd@28.4.1");
    const psd = mod.readPsd(await file.arrayBuffer());
    const docW =
      (Number.isFinite(psd.width) ? psd.width : 0) ||
      (psd.canvas ? psd.canvas.width : 0) ||
      (psd.imageData ? psd.imageData.width : 0);
    const docH =
      (Number.isFinite(psd.height) ? psd.height : 0) ||
      (psd.canvas ? psd.canvas.height : 0) ||
      (psd.imageData ? psd.imageData.height : 0);
    const slots = [];
    collectPsdLayerSlots(psd.children, slots, docW, docH);
    if (slots.length > 0) return slots;
    let src = psd.canvas;
    if (!src && psd.imageData) {
      src = makeCanvas(psd.imageData.width, psd.imageData.height);
      src.getContext("2d").putImageData(psd.imageData, 0, 0);
    }
    if (!src) throw new Error("PSD loaded but no raster canvas found.");
    return [
      {
        name: file.name.replace(/\.psd$/i, ""),
        canvas: src,
        ...buildImportedAttachmentDefaults(),
        docWidth: src.width,
        docHeight: src.height,
        rect: { x: 0, y: 0, w: src.width, h: src.height },
      },
    ];
  }

  const bmp = await createImageBitmap(file);
  const c = makeCanvas(bmp.width, bmp.height);
  c.width = bmp.width;
  c.height = bmp.height;
  c.getContext("2d").drawImage(bmp, 0, 0);
  const base = file.name.replace(/\.[^.]+$/, "");
  return [
    {
      name: base,
      canvas: c,
      ...buildImportedAttachmentDefaults(),
      docWidth: c.width,
      docHeight: c.height,
      rect: { x: 0, y: 0, w: c.width, h: c.height },
    },
  ];
}

function getCanvasRenderPixelRatio() {
  const raw = Math.max(1, Number(window.devicePixelRatio) || 1);
  const cap = Math.max(1, Number(state.renderPerf && state.renderPerf.maxPixelRatio) || raw);
  return Math.min(raw, cap);
}

function markStageResizeDirty() {
  if (!state.renderPerf) return;
  state.renderPerf.needsResize = true;
  state.renderPerf.backdropSig = "";
  if (typeof requestRender === "function") requestRender("resize");
}

function resize(force = false) {
  const perf = state.renderPerf || (state.renderPerf = {
    maxPixelRatio: hasGL ? 1.5 : 2,
    needsResize: true,
    stageCssWidth: 0,
    stageCssHeight: 0,
    stagePixelRatio: 1,
    backdropSig: "",
  });
  const dpr = getCanvasRenderPixelRatio();
  if (!force && !perf.needsResize && perf.stagePixelRatio === dpr) return false;
  const rect = els.stage.getBoundingClientRect();
  const cssW = Math.max(1, Number(rect.width) || 1);
  const cssH = Math.max(1, Number(rect.height) || 1);
  const w = Math.max(1, Math.floor(cssW * dpr));
  const h = Math.max(1, Math.floor(cssH * dpr));
  const prevW = Math.max(1, Number(els.glCanvas.width) || 1);
  const prevH = Math.max(1, Number(els.glCanvas.height) || 1);
  const canvasSizeChanged = els.glCanvas.width !== w || els.glCanvas.height !== h;

  if (canvasSizeChanged) {
    els.backdropCanvas.width = w;
    els.backdropCanvas.height = h;
    els.glCanvas.width = w;
    els.glCanvas.height = h;
    els.overlay.width = w;
    els.overlay.height = h;
    if (typeof window !== "undefined" && window.glToolkit && typeof window.glToolkit.syncOverlayCanvasSize === "function") {
      window.glToolkit.syncOverlayCanvasSize();
    }
    perf.backdropSig = "";
  }

  if (hasGL && (canvasSizeChanged || force || perf.needsResize)) {
    gl.viewport(0, 0, w, h);
  }

  if (state.imageWidth > 0 && state.imageHeight > 0) {
    const fit = Math.min(w / state.imageWidth, h / state.imageHeight) * 0.92;
    state.view.fitScale = fit;
    if (!state.view.initialized || !Number.isFinite(state.view.scale) || state.view.scale <= 0) {
      state.view.scale = fit;
      state.view.cx = w * 0.5;
      state.view.cy = h * 0.5;
      state.view.initialized = true;
    } else {
      state.view.cx += (w - prevW) * 0.5;
      state.view.cy += (h - prevH) * 0.5;
    }
  }
  state.view.lastW = w;
  state.view.lastH = h;
  perf.needsResize = false;
  perf.stageCssWidth = cssW;
  perf.stageCssHeight = cssH;
  perf.stagePixelRatio = dpr;
  refreshViewZoomUI();
  return canvasSizeChanged;
}

function refreshViewZoomUI() {
  if (!els.viewZoomResetBtn) return;
  const fit = Math.max(1e-6, Number(state.view.fitScale) || 1);
  const scale = Math.max(1e-6, Number(state.view.scale) || fit);
  const percent = Math.round((scale / fit) * 100);
  els.viewZoomResetBtn.textContent = `${percent}%`;
}

function refreshViewPanUI() {
  const panMode = !!(state.view && state.view.panMode);
  if (els.viewPanToggleBtn) {
    els.viewPanToggleBtn.classList.toggle("active", panMode);
    els.viewPanToggleBtn.setAttribute("aria-pressed", panMode ? "true" : "false");
    els.viewPanToggleBtn.title = panMode ? "Pan Canvas: ON (click to return)" : "Pan Canvas";
  }
  if (els.stage) {
    els.stage.classList.toggle("pan-mode", panMode);
    if (!panMode) {
      els.stage.classList.remove("dragging-pan");
    }
  }
  refreshCanvasInteractionAffordance();
}

function clampViewScale(nextScale) {
  const fit = Math.max(1e-6, Number(state.view.fitScale) || 1);
  return math.clamp(Number(nextScale) || fit, fit * 0.1, fit * 40);
}

function setViewScaleAtScreenPoint(nextScale, sx, sy) {
  const prev = Math.max(1e-6, Number(state.view.scale) || 1);
  const scale = clampViewScale(nextScale);
  if (!Number.isFinite(scale) || scale <= 0) return;
  const ax = Number.isFinite(sx) ? sx : state.view.cx;
  const ay = Number.isFinite(sy) ? sy : state.view.cy;
  const local = screenToLocal(ax, ay);
  state.view.scale = scale;
  state.view.cx = ax - (local.x - state.imageWidth * 0.5) * scale;
  state.view.cy = ay - (local.y - state.imageHeight * 0.5) * scale;
  refreshViewZoomUI();
}

function zoomViewBy(factor, sx = null, sy = null) {
  if (!state.mesh && !(state.imageWidth > 0 && state.imageHeight > 0)) return;
  const k = Number(factor);
  if (!Number.isFinite(k) || k <= 0) return;
  setViewScaleAtScreenPoint(state.view.scale * k, sx, sy);
}

function resetViewToFit() {
  const w = Math.max(1, Number(els.overlay.width) || 1);
  const h = Math.max(1, Number(els.overlay.height) || 1);
  if (!(state.imageWidth > 0 && state.imageHeight > 0)) return;
  state.view.fitScale = Math.min(w / state.imageWidth, h / state.imageHeight) * 0.92;
  state.view.scale = state.view.fitScale;
  state.view.cx = w * 0.5;
  state.view.cy = h * 0.5;
  state.view.initialized = true;
  refreshViewZoomUI();
}

function computeSceneBoundsLocal() {
  const add = (b, x, y) => {
    const nx = Number(x);
    const ny = Number(y);
    if (!Number.isFinite(nx) || !Number.isFinite(ny)) return;
    b.minX = Math.min(b.minX, nx);
    b.minY = Math.min(b.minY, ny);
    b.maxX = Math.max(b.maxX, nx);
    b.maxY = Math.max(b.maxY, ny);
  };
  const b = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };

  if (state.sourceCanvas && Number(state.imageWidth) > 0 && Number(state.imageHeight) > 0) {
    const poseWorld = state.mesh ? getSolvedPoseWorld(state.mesh) : null;
    const activeSlot = getActiveSlot();
    const docW = Math.max(1, Number(state.imageWidth) || Number(state.sourceCanvas.width) || 1);
    const docH = Math.max(1, Number(state.imageHeight) || Number(state.sourceCanvas.height) || 1);
    const baseTm = getBaseImageTransformMatrix(activeSlot, poseWorld, docW, docH);
    const c0 = transformBaseImageLocalPoint(0, 0, baseTm);
    const c1 = transformBaseImageLocalPoint(docW, 0, baseTm);
    const c2 = transformBaseImageLocalPoint(docW, docH, baseTm);
    const c3 = transformBaseImageLocalPoint(0, docH, baseTm);
    add(b, c0.x, c0.y);
    add(b, c1.x, c1.y);
    add(b, c2.x, c2.y);
    add(b, c3.x, c3.y);
  }

  const m = state.mesh;
  if (m) {
    const poseWorld = getSolvedPoseWorld(m);
    const slots = getRenderableSlots();
    for (const slot of slots) {
      if (!slot || !(getActiveAttachment(slot) || {}).canvas || !hasRenderableAttachment(slot)) continue;
      const geom = buildSlotGeometry(slot, poseWorld);
      if (!geom || !(getActiveAttachment(slot) || {}).meshData || !Array.isArray((getActiveAttachment(slot) || {}).meshData.indices) && !((getActiveAttachment(slot) || {}).meshData.indices instanceof Uint16Array)) {
        continue;
      }
      const sm = (getActiveAttachment(slot) || {}).meshData;
      const local = sm.deformedLocal;
      if (!local || local.length < 2) continue;
      const tm = getSlotTransformMatrix(slot, poseWorld);
      for (let i = 0; i + 1 < local.length; i += 2) {
        const p = transformPoint(tm, local[i], local[i + 1]);
        add(b, p.x, p.y);
      }
    }

    const bones = getBonesForCurrentMode(m);
    enforceConnectedHeads(bones);
    const world = state.boneMode === "pose" ? getSolvedPoseWorld(m) : getEditAwareWorld(bones);
    for (let i = 0; i < bones.length; i += 1) {
      const ep = getBoneWorldEndpointsFromBones(bones, i, world);
      if (!ep) continue;
      add(b, ep.head.x, ep.head.y);
      add(b, ep.tip.x, ep.tip.y);
    }

    if (isSlotMeshEditTabActive()) {
      const slot = getActiveSlot();
      if (slot) {
        const contour = ensureSlotContour(slot);
        for (const p of contour.points || []) {
          const w = slotMeshLocalToWorld(slot, p, poseWorld);
          add(b, w.x, w.y);
        }
        for (const p of contour.fillPoints || []) {
          const w = slotMeshLocalToWorld(slot, p, poseWorld);
          add(b, w.x, w.y);
        }
      }
    }
  }

  if (!Number.isFinite(b.minX) || !Number.isFinite(b.minY) || !Number.isFinite(b.maxX) || !Number.isFinite(b.maxY)) {
    return null;
  }
  return b;
}

function fitViewToAllVisible() {
  const bounds = computeSceneBoundsLocal();
  if (!bounds) {
    resetViewToFit();
    return;
  }
  const w = Math.max(1, Number(els.overlay.width) || 1);
  const h = Math.max(1, Number(els.overlay.height) || 1);
  const pad = 44;
  const bw = Math.max(1e-3, bounds.maxX - bounds.minX);
  const bh = Math.max(1e-3, bounds.maxY - bounds.minY);
  const targetScale = clampViewScale(Math.min((w - pad * 2) / bw, (h - pad * 2) / bh));
  const cxLocal = (bounds.minX + bounds.maxX) * 0.5;
  const cyLocal = (bounds.minY + bounds.maxY) * 0.5;
  state.view.scale = targetScale;
  state.view.cx = w * 0.5 - (cxLocal - state.imageWidth * 0.5) * targetScale;
  state.view.cy = h * 0.5 - (cyLocal - state.imageHeight * 0.5) * targetScale;
  state.view.initialized = true;
  refreshViewZoomUI();
}

function ensureOverlaySceneCanvas() {
  if (!state.overlayScene.canvas) {
    state.overlayScene.canvas = makeCanvas(1, 1);
    state.overlayScene.ctx = state.overlayScene.canvas.getContext("2d");
  }
  if (!state.overlayScene.ctx) return null;
  const w = Math.max(1, Number(els.overlay.width) || 1);
  const h = Math.max(1, Number(els.overlay.height) || 1);
  if (state.overlayScene.canvas.width !== w || state.overlayScene.canvas.height !== h) {
    state.overlayScene.canvas.width = w;
    state.overlayScene.canvas.height = h;
  }
  return state.overlayScene.ctx;
}

function localToScreen(x, y) {
  return {
    x: state.view.cx + (x - state.imageWidth * 0.5) * state.view.scale,
    y: state.view.cy + (y - state.imageHeight * 0.5) * state.view.scale,
  };
}

function screenToLocal(x, y) {
  return {
    x: (x - state.view.cx) / state.view.scale + state.imageWidth * 0.5,
    y: (y - state.view.cy) / state.view.scale + state.imageHeight * 0.5,
  };
}

function getGridMajorStepLocal() {
  // Keep background grid scale fixed in local space so zoom is visually continuous
  // (no 1/2/5 step snapping jumps while zooming in/out).
  return 50;
}

function getBackdropGridMetrics() {
  const w = Math.max(1, Number(els.overlay.width) || 1);
  const h = Math.max(1, Number(els.overlay.height) || 1);
  if (!Number.isFinite(state.view.scale) || state.view.scale <= 0) return null;
  const ruler = 22;
  const contentLeft = ruler;
  const contentTop = ruler;
  const contentRight = w;
  const contentBottom = h;
  if (contentRight <= contentLeft || contentBottom <= contentTop) return null;
  const major = getGridMajorStepLocal();
  const minor = major / 5;
  const minL = screenToLocal(contentLeft, contentBottom).x;
  const maxL = screenToLocal(contentRight, contentTop).x;
  const minT = screenToLocal(contentLeft, contentTop).y;
  const maxT = screenToLocal(contentRight, contentBottom).y;
  const x0 = Math.min(minL, maxL);
  const x1 = Math.max(minL, maxL);
  const y0 = Math.min(minT, maxT);
  const y1 = Math.max(minT, maxT);
  const firstMinorX = Math.floor(x0 / minor) * minor;
  const firstMinorY = Math.floor(y0 / minor) * minor;
  const firstMajorX = Math.floor(x0 / major) * major;
  const firstMajorY = Math.floor(y0 / major) * major;
  const minorXs = [];
  const minorYs = [];
  const majorXs = [];
  const majorYs = [];
  for (let x = firstMinorX; x <= x1 + 1e-6; x += minor) {
    minorXs.push({ local: x, screen: Math.round(localToScreen(x, 0).x) + 0.5 });
  }
  for (let y = firstMinorY; y <= y1 + 1e-6; y += minor) {
    minorYs.push({ local: y, screen: Math.round(localToScreen(0, y).y) + 0.5 });
  }
  for (let x = firstMajorX; x <= x1 + 1e-6; x += major) {
    majorXs.push({ local: x, screen: Math.round(localToScreen(x, 0).x) + 0.5 });
  }
  for (let y = firstMajorY; y <= y1 + 1e-6; y += major) {
    majorYs.push({ local: y, screen: Math.round(localToScreen(0, y).y) + 0.5 });
  }
  return {
    w,
    h,
    ruler,
    contentLeft,
    contentTop,
    contentRight,
    contentBottom,
    major,
    minor,
    minorXs,
    minorYs,
    majorXs,
    majorYs,
    axisX: Math.round(localToScreen(0, 0).x) + 0.5,
    axisY: Math.round(localToScreen(0, 0).y) + 0.5,
  };
}

function drawBackdropGridAndRuler(ctx, options = null) {
  const opts = options && typeof options === "object" ? options : {};
  const drawGrid = opts.drawGrid !== false;
  const drawRuler = opts.drawRuler !== false;
  const metrics = getBackdropGridMetrics();
  if (!metrics) return;
  const {
    w,
    h,
    ruler,
    contentLeft,
    contentTop,
    contentRight,
    contentBottom,
    major,
    minor,
    minorXs,
    minorYs,
    majorXs,
    majorYs,
    axisX,
    axisY,
  } = metrics;

  if (drawGrid) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(contentLeft, contentTop, contentRight - contentLeft, contentBottom - contentTop);
    ctx.clip();

  // Spine-like checker backdrop.
  const checkerDark = "rgba(36, 38, 42, 0.9)";
  const checkerLight = "rgba(46, 48, 53, 0.9)";
  for (const row of minorYs) {
    const y = row.local;
    const sy0 = row.screen - 0.5;
    const sy1 = Math.round(localToScreen(0, y + minor).y) + 0.5;
    const top = Math.min(sy0, sy1);
    const cellH = Math.abs(sy1 - sy0);
    if (cellH < 0.5) continue;
    for (const col of minorXs) {
      const x = col.local;
      const sx0 = col.screen - 0.5;
      const sx1 = Math.round(localToScreen(x + minor, 0).x) + 0.5;
      const left = Math.min(sx0, sx1);
      const cellW = Math.abs(sx1 - sx0);
      if (cellW < 0.5) continue;
      const gx = Math.round(x / minor);
      const gy = Math.round(y / minor);
      ctx.fillStyle = ((gx + gy) & 1) === 0 ? checkerDark : checkerLight;
      ctx.fillRect(left, top, cellW + 1, cellH + 1);
    }
  }

  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(148, 158, 168, 0.2)";
  for (const line of minorXs) {
    const sx = line.screen;
    ctx.beginPath();
    ctx.moveTo(sx, contentTop);
    ctx.lineTo(sx, contentBottom);
    ctx.stroke();
  }
  for (const line of minorYs) {
    const sy = line.screen;
    ctx.beginPath();
    ctx.moveTo(contentLeft, sy);
    ctx.lineTo(contentRight, sy);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(186, 199, 212, 0.3)";
  ctx.lineWidth = 1.2;
  for (const line of majorXs) {
    const sx = line.screen;
    ctx.beginPath();
    ctx.moveTo(sx, contentTop);
    ctx.lineTo(sx, contentBottom);
    ctx.stroke();
  }
  for (const line of majorYs) {
    const sy = line.screen;
    ctx.beginPath();
    ctx.moveTo(contentLeft, sy);
    ctx.lineTo(contentRight, sy);
    ctx.stroke();
  }
  ctx.lineWidth = 2;
  if (axisX >= contentLeft - 2 && axisX <= contentRight + 2) {
    ctx.strokeStyle = "rgba(112, 214, 166, 0.92)";
    ctx.beginPath();
    ctx.moveTo(axisX, contentTop);
    ctx.lineTo(axisX, contentBottom);
    ctx.stroke();
  }
  if (axisY >= contentTop - 2 && axisY <= contentBottom + 2) {
    ctx.strokeStyle = "rgba(236, 124, 124, 0.92)";
    ctx.beginPath();
    ctx.moveTo(contentLeft, axisY);
    ctx.lineTo(contentRight, axisY);
    ctx.stroke();
  }
    ctx.restore();
  }

  if (drawRuler) {
  // Draw ruler last to avoid visual overlap with the grid.
    ctx.save();
    ctx.fillStyle = "rgba(29, 31, 35, 0.98)";
    ctx.fillRect(0, 0, w, ruler);
    ctx.fillRect(0, 0, ruler, h);
    ctx.fillStyle = "rgba(24, 26, 30, 1)";
    ctx.fillRect(0, 0, ruler, ruler);
    ctx.strokeStyle = "rgba(188, 198, 208, 0.7)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, ruler + 0.5);
    ctx.lineTo(w, ruler + 0.5);
    ctx.moveTo(ruler + 0.5, 0);
    ctx.lineTo(ruler + 0.5, h);
    ctx.stroke();

    ctx.fillStyle = "rgba(214, 222, 230, 0.96)";
    ctx.font = "11px Segoe UI, sans-serif";
    ctx.strokeStyle = "rgba(168, 178, 188, 0.8)";
    ctx.lineWidth = 1;
    for (const line of minorXs) {
      const sx = line.screen;
      if (sx < ruler + 2 || sx > w - 2) continue;
      const ratio = Math.abs((line.local / major) - Math.round(line.local / major));
      if (ratio <= 1e-4) continue;
      ctx.beginPath();
      ctx.moveTo(sx, ruler - 5);
      ctx.lineTo(sx, ruler);
      ctx.stroke();
    }
    for (const line of minorYs) {
      const sy = line.screen;
      if (sy < ruler + 2 || sy > h - 2) continue;
      const ratio = Math.abs((line.local / major) - Math.round(line.local / major));
      if (ratio <= 1e-4) continue;
      ctx.beginPath();
      ctx.moveTo(ruler - 5, sy);
      ctx.lineTo(ruler, sy);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(222, 230, 238, 0.96)";
    ctx.lineWidth = 1.4;
    for (const line of majorXs) {
      const sx = line.screen;
      if (sx < ruler + 2 || sx > w - 2) continue;
      ctx.beginPath();
      ctx.moveTo(sx, ruler - 10);
      ctx.lineTo(sx, ruler);
      ctx.stroke();
      ctx.fillText(`${Math.round(line.local)}`, sx + 3, 14);
    }
    for (const line of majorYs) {
      const sy = line.screen;
      if (sy < ruler + 2 || sy > h - 2) continue;
      ctx.beginPath();
      ctx.moveTo(ruler - 10, sy);
      ctx.lineTo(ruler, sy);
      ctx.stroke();
      ctx.fillText(`${Math.round(line.local)}`, 3, sy - 3);
    }
    ctx.fillStyle = "rgba(242, 248, 253, 0.98)";
    ctx.fillText("0", 4, 14);
    ctx.restore();
  }
}

function drawRulerOverlayFromBackdrop(ctx) {
  if (!ctx || !els.backdropCanvas) return;
  const src = els.backdropCanvas;
  const w = Math.max(1, Number(src.width) || 1);
  const h = Math.max(1, Number(src.height) || 1);
  const ruler = 22;
  ctx.drawImage(src, 0, 0, w, ruler, 0, 0, w, ruler);
  ctx.drawImage(src, 0, 0, ruler, h, 0, 0, ruler, h);
}

function getBackdropRenderSignature() {
  const w = Math.max(1, Number(els.backdropCanvas && els.backdropCanvas.width) || 1);
  const h = Math.max(1, Number(els.backdropCanvas && els.backdropCanvas.height) || 1);
  return [
    w,
    h,
    Number(state.imageWidth) || 0,
    Number(state.imageHeight) || 0,
    (Number(state.view.cx) || 0).toFixed(2),
    (Number(state.view.cy) || 0).toFixed(2),
    (Number(state.view.scale) || 0).toFixed(4),
  ].join("|");
}

function drawBackdrop() {
  if (!backdropCtx || !els.backdropCanvas) return;
  const sig = getBackdropRenderSignature();
  if (state.renderPerf && state.renderPerf.backdropSig === sig) return;
  const ctx = backdropCtx;
  ctx.clearRect(0, 0, els.backdropCanvas.width, els.backdropCanvas.height);
  drawBackdropGridAndRuler(ctx, { drawGrid: true, drawRuler: true });
  if (state.renderPerf) state.renderPerf.backdropSig = sig;
}

// Per-frame bone palette cache: precompute `mul(world[b], invBind[b])`
// once per bone per frame. Without this, the inner skinning loop recomputes
// the same 6-float matrix for every vertex × every bone, which is the
// dominant cost for medium-to-large meshes.
//
// Layout: flat Float32Array of 6 floats per bone [a, b, c, d, tx, ty].
// Caller passes their own scratch storage so updateDeformation and
// buildSlotGeometry don't fight for one global.
function buildBonePalette(world, invBind, scratch) {
  const n = world ? world.length : 0;
  const need = n * 6;
  if (!scratch || scratch.length < need) scratch = new Float32Array(Math.max(need, 64));
  for (let b = 0; b < n; b += 1) {
    const m = mul(world[b], invBind[b]);
    const o = b * 6;
    scratch[o]     = m[0];
    scratch[o + 1] = m[1];
    scratch[o + 2] = m[2];
    scratch[o + 3] = m[3];
    scratch[o + 4] = m[4];
    scratch[o + 5] = m[5];
  }
  return scratch;
}

// Cached bone palettes — one per skinning context. Reset/grown per frame.
const _palette = { mesh: null, slot: null };

function updateDeformation(offsetsOverride = null) {
  const m = state.mesh;
  if (!m) return;
  const offsets = offsetsOverride || getActiveOffsets(m);

  const bones = state.boneMode === "pose" ? getPoseBones(m) : getRigBones(m);
  enforceConnectedHeads(bones);
  const world = state.boneMode === "pose" ? getSolvedPoseWorld(m) : getEditAwareWorld(bones);
  const invBind = getDisplayInvBind(m);
  const vCount = getVertexCount(m);
  const boneCount = bones.length;
  // Build the bone palette once for this frame; reuse across all vertices.
  _palette.mesh = boneCount > 0 ? buildBonePalette(world, invBind, _palette.mesh) : null;
  const palette = _palette.mesh;

  for (let i = 0; i < vCount; i += 1) {
    const x = m.positions[i * 2];
    const y = m.positions[i * 2 + 1];
    let sx = x;
    let sy = y;
    if (boneCount > 0 && palette) {
      sx = 0;
      sy = 0;
      const wRowBase = i * boneCount;
      for (let b = 0; b < boneCount; b += 1) {
        const w = m.weights[wRowBase + b];
        if (w <= 0) continue;
        const o = b * 6;
        // transformPoint inlined: avoids creating a {x,y} object per vertex×bone.
        const px = palette[o] * x + palette[o + 1] * y + palette[o + 4];
        const py = palette[o + 2] * x + palette[o + 3] * y + palette[o + 5];
        sx += px * w;
        sy += py * w;
      }
    }

    m.skinnedLocal[i * 2] = sx;
    m.skinnedLocal[i * 2 + 1] = sy;

    const lx = sx + (offsets[i * 2] || 0);
    const ly = sy + (offsets[i * 2 + 1] || 0);

    m.deformedLocal[i * 2] = lx;
    m.deformedLocal[i * 2 + 1] = ly;

    const s = localToScreen(lx, ly);
    m.deformedScreen[i * 2] = s.x;
    m.deformedScreen[i * 2 + 1] = s.y;

    m.interleaved[i * 4] = s.x;
    m.interleaved[i * 4 + 1] = s.y;
    m.interleaved[i * 4 + 2] = m.uvs[i * 2];
    m.interleaved[i * 4 + 3] = m.uvs[i * 2 + 1];
  }
}

function getSolvedPoseWorld(m) {
  if (!m) return [];
  if (state.boneMode !== "pose") {
    if (state.boneMode === "edit") {
      ensureRigEditPreviewCache(false);
      if (Array.isArray(state.rigEditPreviewWorld) && state.rigEditPreviewWorld.length === getRigBones(m).length) {
        return state.rigEditPreviewWorld;
      }
    }
    const rig = cloneBones(getRigBones(m));
    enforceConnectedHeads(rig);
    return getEditAwareWorld(rig);
  }
  const pose = cloneBones(getPoseBones(m));
  enforceConnectedHeads(pose);
  const plan = buildConstraintExecutionPlan(m);
  const nowSec = (typeof getCurrentRenderTime === "function" ? getCurrentRenderTime() : (performance.now() / 1000));
  for (const step of plan) {
    if (!step || !step.ref) continue;
    if (step.type === "pth") applySinglePathConstraintToBones(m, pose, step.ref);
    else if (step.type === "tfc") applySingleTransformConstraintToBones(m, pose, step.ref);
    else if (step.type === "ik") applySingleIKConstraintToBones(pose, step.ref);
    else if (step.type === "phy") applySinglePhysicsConstraintToBones(m, pose, step.ref, nowSec);
    enforceConnectedHeads(pose);
  }
  return computeWorld(pose);
}

function getScreenBoundsFromPoints(screenPoints) {
  if (!screenPoints || screenPoints.length < 2) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let i = 0; i + 1 < screenPoints.length; i += 2) {
    const x = Number(screenPoints[i]);
    const y = Number(screenPoints[i + 1]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) return null;
  return { minX, minY, maxX, maxY };
}

function drawBindingSelectionOverlay(ctx, m) {
  if (!ctx || !m) return;
  const supportsBindOverlay =
    (state.editMode === "skeleton" && state.boneMode === "edit") ||
    state.editMode === "mesh";
  if (!supportsBindOverlay) return;
  const selection = getBindSelectionState(m);
  if (selection.slotIndices.length <= 0) return;
  const poseWorld = getSolvedPoseWorld(m);
  ctx.save();
  ctx.font = "12px Segoe UI, sans-serif";
  for (const si of selection.slotIndices) {
    const slot = state.slots[si];
    if (!slot) continue;
    const geom = buildSlotGeometry(slot, poseWorld);
    const bounds = getScreenBoundsFromPoints(geom && geom.screen);
    if (!bounds) continue;
    const active = Number(si) === Number(state.activeSlot);
    const pad = active ? 10 : 8;
    const x = bounds.minX - pad;
    const y = bounds.minY - pad;
    const w = (bounds.maxX - bounds.minX) + pad * 2;
    const h = (bounds.maxY - bounds.minY) + pad * 2;
    ctx.fillStyle = active ? "rgba(255, 228, 110, 0.08)" : "rgba(125, 211, 252, 0.06)";
    ctx.strokeStyle = active ? "rgba(255, 228, 110, 0.92)" : "rgba(125, 211, 252, 0.82)";
    ctx.lineWidth = active ? 2.1 : 1.5;
    ctx.setLineDash(active ? [] : [8, 5]);
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = active ? "#fff0b8" : "#d8f4ff";
    const slotLabel = getSlotDisplayNameByIndex(si);
    const attName = slot ? getSlotCurrentAttachmentName(slot) : "";
    ctx.fillText(attName ? `${slotLabel} / ${attName}` : slotLabel, x + 6, Math.max(44, y - 6));
  }
  const header = `Bind Target: ${selection.slotIndices.length} slot(s)`;
  const detail = `Slots: ${selection.slotPreview} | Bones: ${selection.bonePreview}`;
  const boxW = Math.max(ctx.measureText(header).width, ctx.measureText(detail).width) + 18;
  ctx.fillStyle = "rgba(9, 15, 22, 0.78)";
  ctx.fillRect(12, 52, boxW, 34);
  ctx.fillStyle = "#eaf7ff";
  ctx.fillText(header, 20, 66);
  ctx.fillStyle = "#9fd8ff";
  ctx.fillText(detail, 20, 82);
  ctx.restore();
}

function getBoneScreenShapePoints(headScreen, tipScreen) {
  const head = headScreen || { x: 0, y: 0 };
  const tip = tipScreen || head;
  const dx = (Number(tip.x) || 0) - (Number(head.x) || 0);
  const dy = (Number(tip.y) || 0) - (Number(head.y) || 0);
  const len = Math.max(1, Math.hypot(dx, dy));
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const neckOffset = Math.min(16, Math.max(6, len * 0.13));
  const wingOffset = Math.min(34, Math.max(10, len * 0.3));
  const neckHalf = Math.min(5.5, Math.max(2.1, len * 0.045));
  const wingHalf = Math.min(13, Math.max(4.2, len * 0.105));
  const tailInset = Math.min(8, Math.max(2, len * 0.05));
  const tailHalf = Math.min(3.4, Math.max(1.1, len * 0.02));
  const neckCenterX = (Number(head.x) || 0) + ux * neckOffset;
  const neckCenterY = (Number(head.y) || 0) + uy * neckOffset;
  const wingCenterX = (Number(head.x) || 0) + ux * wingOffset;
  const wingCenterY = (Number(head.y) || 0) + uy * wingOffset;
  const tailBaseX = (Number(tip.x) || 0) - ux * tailInset;
  const tailBaseY = (Number(tip.y) || 0) - uy * tailInset;
  return [
    { x: Number(head.x) || 0, y: Number(head.y) || 0 },
    { x: neckCenterX + px * neckHalf, y: neckCenterY + py * neckHalf },
    { x: wingCenterX + px * wingHalf, y: wingCenterY + py * wingHalf },
    { x: tailBaseX + px * tailHalf, y: tailBaseY + py * tailHalf },
    { x: Number(tip.x) || 0, y: Number(tip.y) || 0 },
    { x: tailBaseX - px * tailHalf, y: tailBaseY - py * tailHalf },
    { x: wingCenterX - px * wingHalf, y: wingCenterY - py * wingHalf },
    { x: neckCenterX - px * neckHalf, y: neckCenterY - py * neckHalf },
  ];
}

function traceBoneScreenShapePath(ctx, points) {
  if (!ctx || !Array.isArray(points) || points.length < 3) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i += 1) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
}

function drawOverlay() {
  const m = state.mesh;
  const ctx = overlayCtx;
  ctx.clearRect(0, 0, els.overlay.width, els.overlay.height);
  if (state.overlayScene.enabled && state.overlayScene.canvas) {
    ctx.drawImage(state.overlayScene.canvas, 0, 0);
  }
  drawRulerOverlayFromBackdrop(ctx);
  if (!m) return;

  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(80, 180, 220, 0.28)";
  let meshForOverlay = m;
  let screenForOverlay = m.deformedScreen;
  if (state.slots.length > 0) {
    const slot = getActiveSlot();
    if (slot) {
      const poseWorld = getSolvedPoseWorld(m);
      const geom = buildSlotGeometry(slot, poseWorld);
      if ((getActiveAttachment(slot) || {}).meshData && geom.screen) {
        meshForOverlay = (getActiveAttachment(slot) || {}).meshData;
        screenForOverlay = geom.screen;
      }
    }
  }
  const isGridMesh =
    Number.isFinite(meshForOverlay.cols) &&
    Number.isFinite(meshForOverlay.rows) &&
    meshForOverlay.cols > 0 &&
    meshForOverlay.rows > 0 &&
    (meshForOverlay.cols + 1) * (meshForOverlay.rows + 1) === screenForOverlay.length / 2;
  const showMeshWireframe = state.editMode === "mesh";

  if (isSlotMeshEditTabActive()) {
    const slot = getActiveSlot();
    if (slot) {
      const contour = ensureSlotContour(slot);
      if (contour.closed && contour.points.length >= 3) {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.42)";
        ctx.fillRect(0, 0, els.overlay.width, els.overlay.height);
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        for (let i = 0; i < contour.points.length; i += 1) {
          const p = contour.points[i];
          const s = localToScreen(p.x, p.y);
          if (i === 0) ctx.moveTo(s.x, s.y);
          else ctx.lineTo(s.x, s.y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
  }

  const poseWorldForClip = getSolvedPoseWorld(m);
  for (const s of state.slots || []) {
    const att = getActiveAttachment(s);
    if (!s || !att || !att.clipEnabled || !isSlotEditorVisible(s)) continue;
    const poly = getSlotClipPolygonScreen(s, poseWorldForClip);
    if (poly.length < 3) continue;
    ctx.save();
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = "rgba(255, 120, 200, 0.92)";
    ctx.lineWidth = 1.8;
    if (drawClipPath2D(ctx, poly)) ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(255, 140, 210, 0.95)";
    ctx.font = "12px Segoe UI, sans-serif";
    const p0 = poly[0];
    const endName =
      att.clipEndSlotId && state.slots.find((x) => x && x.id && String(x.id) === String(att.clipEndSlotId))
        ? state.slots.find((x) => x && x.id && String(x.id) === String(att.clipEndSlotId)).name
        : "end";
    ctx.fillText(`CLIP ${s.name || ""} -> ${endName}`, p0.x + 8, p0.y - 8);
    ctx.restore();
  }

  drawBindingSelectionOverlay(ctx, m);

  if (showMeshWireframe && isGridMesh) {
    for (let y = 0; y <= meshForOverlay.rows; y += 1) {
      ctx.beginPath();
      for (let x = 0; x <= meshForOverlay.cols; x += 1) {
        const i = y * (meshForOverlay.cols + 1) + x;
        const px = screenForOverlay[i * 2];
        const py = screenForOverlay[i * 2 + 1];
        if (x === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    for (let x = 0; x <= meshForOverlay.cols; x += 1) {
      ctx.beginPath();
      for (let y = 0; y <= meshForOverlay.rows; y += 1) {
        const i = y * (meshForOverlay.cols + 1) + x;
        const px = screenForOverlay[i * 2];
        const py = screenForOverlay[i * 2 + 1];
        if (y === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  } else if (showMeshWireframe && meshForOverlay.indices && meshForOverlay.indices.length > 0) {
    const idx = meshForOverlay.indices;
    for (let t = 0; t + 2 < idx.length; t += 3) {
      const i0 = idx[t];
      const i1 = idx[t + 1];
      const i2 = idx[t + 2];
      const p0x = screenForOverlay[i0 * 2];
      const p0y = screenForOverlay[i0 * 2 + 1];
      const p1x = screenForOverlay[i1 * 2];
      const p1y = screenForOverlay[i1 * 2 + 1];
      const p2x = screenForOverlay[i2 * 2];
      const p2y = screenForOverlay[i2 * 2 + 1];
      ctx.beginPath();
      ctx.moveTo(p0x, p0y);
      ctx.lineTo(p1x, p1y);
      ctx.lineTo(p2x, p2y);
      ctx.closePath();
      ctx.stroke();
    }
  }

  if (state.editMode !== "mesh") {
    const bones = getActiveBones(m);
    const world = state.boneMode === "pose" ? getSolvedPoseWorld(m) : (enforceConnectedHeads(bones), getEditAwareWorld(bones));
    const focusedBoneSet = new Set(getSelectedBonesForWeight(m));
    const dimUnselectedBones = state.boneMode === "edit";
    const ikBones = getIkConstrainedBoneSet(m);
    const ikTargets = getIkTargetBoneSet(m);
    const tfcBones = getTransformConstrainedBoneSet(m);
    const tfcTargets = getTransformTargetBoneSet(m);
    const pathBones = getPathConstrainedBoneSet(m);
    const pathTargets = getPathTargetBoneSet(m);
    const pList = ensurePathConstraints(m);
    const activePathIndex = Number.isFinite(state.selectedPath) ? Number(state.selectedPath) : -1;
    for (let pi = 0; pi < pList.length; pi += 1) {
      const p = pList[pi];
      if (!p || p.enabled === false) continue;
      const isActive = pi === activePathIndex;
      if (p.sourceType === "drawn") {
        const nodes = getDrawnPathNodes(p);
        if (nodes.length < 2) continue;
        ctx.strokeStyle = isActive ? "rgba(125, 211, 252, 0.95)" : "rgba(125, 211, 252, 0.55)";
        ctx.lineWidth = isActive ? 2.6 : 1.4;
        ctx.beginPath();
        const s0 = localToScreen(nodes[0].x, nodes[0].y);
        ctx.moveTo(s0.x, s0.y);
        const segCount = p.closed ? nodes.length : nodes.length - 1;
        for (let i = 0; i < segCount; i += 1) {
          const a = nodes[i];
          const b = nodes[(i + 1) % nodes.length];
          const c1 = localToScreen(a.houtx, a.houty);
          const c2 = localToScreen(b.hinx, b.hiny);
          const e = localToScreen(b.x, b.y);
          ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, e.x, e.y);
        }
        ctx.stroke();
        for (let i = 0; i < nodes.length; i += 1) {
          const s = localToScreen(nodes[i].x, nodes[i].y);
          const activePoint = isActive && state.pathEdit.activePoint === i && state.pathEdit.activeHandle === "point";
          ctx.fillStyle = activePoint ? "#ffe46e" : isActive ? "#9ed8ff" : "rgba(158,216,255,0.6)";
          ctx.beginPath();
          ctx.arc(s.x, s.y, activePoint ? 5.1 : isActive ? 4.2 : 3.1, 0, Math.PI * 2);
          ctx.fill();
        }
        if (isActive) {
          for (let i = 0; i < nodes.length; i += 1) {
            const n = nodes[i];
            const ps = localToScreen(n.x, n.y);
            const ins = localToScreen(n.hinx, n.hiny);
            const outs = localToScreen(n.houtx, n.houty);
            ctx.strokeStyle = "rgba(158,216,255,0.45)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(ps.x, ps.y);
            ctx.lineTo(ins.x, ins.y);
            ctx.moveTo(ps.x, ps.y);
            ctx.lineTo(outs.x, outs.y);
            ctx.stroke();
            const inActive = state.pathEdit.activePoint === i && state.pathEdit.activeHandle === "in";
            const outActive = state.pathEdit.activePoint === i && state.pathEdit.activeHandle === "out";
            ctx.fillStyle = inActive ? "#ffb36a" : "rgba(255,179,106,0.85)";
            ctx.beginPath();
            ctx.arc(ins.x, ins.y, inActive ? 4.4 : 3.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = outActive ? "#90ff9b" : "rgba(144,255,155,0.85)";
            ctx.beginPath();
            ctx.arc(outs.x, outs.y, outActive ? 4.4 : 3.4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else {
        const pts =
          p.sourceType === "bone_chain"
            ? collectPathChainPoints(bones, Number(p.target), !!p.closed)
            : collectSlotContourPathPoints(m, bones, Number(p.targetSlot), !!p.closed);
        if (!Array.isArray(pts) || pts.length < 2) continue;
        ctx.strokeStyle = isActive ? "rgba(125, 211, 252, 0.95)" : "rgba(125, 211, 252, 0.55)";
        ctx.lineWidth = isActive ? 2.6 : 1.4;
        ctx.beginPath();
        for (let i = 0; i < pts.length; i += 1) {
          const s = localToScreen(Number(pts[i].x) || 0, Number(pts[i].y) || 0);
          if (i === 0) ctx.moveTo(s.x, s.y);
          else ctx.lineTo(s.x, s.y);
        }
        ctx.stroke();
      }
    }
    if (state.boneMode === "object") {
      drawObjectModeTargetsOverlay(ctx, m, bones, world);
    }
    for (let i = 0; i < bones.length; i += 1) {
      const b = bones[i];
      if (!isBoneVisibleInWorkspace(m, bones, i)) continue;
      const start = transformPoint(world[i], 0, 0);
      const end = transformPoint(world[i], b.length, 0);
      const ss = localToScreen(start.x, start.y);
      const es = localToScreen(end.x, end.y);
      const boneShape = getBoneScreenShapePoints(ss, es);

      const isPrimarySelected = i === state.selectedBone;
      const isMultiSelected = Array.isArray(state.selectedBonesForWeight) && state.selectedBonesForWeight.includes(i);
      const isParentCandidate = state.parentPickArmed && state.parentHoverBone === i;
      const isIkTargetCandidate = state.ikPickArmed && state.ikHoverBone === i;
      const isIKBone = ikBones.has(i);
      const isIKTarget = ikTargets.has(i);
      const isTFCBone = tfcBones.has(i);
      const isTFCTarget = tfcTargets.has(i);
      const isPathBone = pathBones.has(i);
      const isPathTarget = pathTargets.has(i);
      const isHeadSelected = state.selectedBoneParts && state.selectedBoneParts.some(p => p.index === i && p.type === "head");
      const isTailSelected = state.selectedBoneParts && state.selectedBoneParts.some(p => p.index === i && p.type === "tail");
      const isJointSelected = !!(isHeadSelected && isTailSelected && state.boneMode === "edit");
      const bodyPartSelectionActive = state.boneMode === "edit" && (isHeadSelected || isTailSelected);
      const isBodyPrimarySelected = !!(isPrimarySelected && (!bodyPartSelectionActive || isJointSelected));
      const shouldDimBone =
        dimUnselectedBones &&
        (
          focusedBoneSet.size <= 0
            ? !isParentCandidate && !isIkTargetCandidate
            : !isPrimarySelected && !isMultiSelected && !isParentCandidate && !isIkTargetCandidate
        );
      const boneOutline = shouldDimBone
        ? (b.connected ? "rgba(142, 147, 154, 0.78)" : "rgba(112, 118, 126, 0.72)")
        : isParentCandidate
          ? "#ff7ad9"
          : isBodyPrimarySelected
            ? "#ffe46e"
            : isMultiSelected
              ? "#7dd3fc"
              : isIKBone
                ? "#5df5ff"
                : isIKTarget
                  ? "#6effd8"
                  : isTFCBone
                    ? "#f8a3ff"
                    : isTFCTarget
                      ? "#ffcc66"
                      : isPathBone
                        ? "#7ea4ff"
                        : isPathTarget
                          ? "#9ac4ff"
                          : state.addBoneArmed
                            ? "rgba(246,184,76,0.7)"
                            : b.connected
                              ? "#f6b84c"
                              : "#7dd3fc";
      // Editor-only bone tint (b.color, e.g. "#ff8800"). Used as base fill
      // ONLY when there is no overriding semantic state (selected, IK, parent
      // candidate, etc.) — those need to stay visually distinct.
      let userBoneTint = "";
      if (b && typeof b.color === "string" && b.color.trim().length > 0) {
        const c = b.color.trim();
        const hex = c.startsWith("#") ? c.slice(1) : c;
        if (/^[0-9a-fA-F]{6}$/.test(hex)) {
          const r = parseInt(hex.slice(0, 2), 16);
          const g = parseInt(hex.slice(2, 4), 16);
          const bl = parseInt(hex.slice(4, 6), 16);
          userBoneTint = `rgba(${r}, ${g}, ${bl}, 0.22)`;
        }
      }
      const boneFill = shouldDimBone
        ? "rgba(98, 103, 111, 0.28)"
        : isParentCandidate
          ? "rgba(255, 122, 217, 0.18)"
          : isBodyPrimarySelected
            ? "rgba(255, 228, 110, 0.24)"
            : isMultiSelected
              ? "rgba(125, 211, 252, 0.2)"
              : isIKBone
                ? "rgba(93, 245, 255, 0.16)"
                : isIKTarget
                  ? "rgba(110, 255, 216, 0.16)"
                  : isTFCBone
                    ? "rgba(248, 163, 255, 0.16)"
                    : isTFCTarget
                      ? "rgba(255, 204, 102, 0.16)"
                      : isPathBone
                        ? "rgba(126, 164, 255, 0.15)"
                        : isPathTarget
                          ? "rgba(154, 196, 255, 0.15)"
                          : state.addBoneArmed
                            ? "rgba(246,184,76,0.12)"
                            : userBoneTint
                              ? userBoneTint
                              : b.connected
                                ? "rgba(246,184,76,0.12)"
                                : "rgba(125,211,252,0.1)";
      if (isBodyPrimarySelected) {
        ctx.strokeStyle = "rgba(255, 236, 153, 0.24)";
        ctx.lineWidth = 5.5;
        ctx.lineJoin = "round";
        traceBoneScreenShapePath(ctx, boneShape);
        ctx.stroke();
      } else if (isMultiSelected) {
        ctx.strokeStyle = "rgba(125, 211, 252, 0.2)";
        ctx.lineWidth = 4.2;
        ctx.lineJoin = "round";
        traceBoneScreenShapePath(ctx, boneShape);
        ctx.stroke();
      }

      ctx.fillStyle = boneFill;
      traceBoneScreenShapePath(ctx, boneShape);
      ctx.fill();
      ctx.strokeStyle = boneOutline;
      ctx.lineWidth = shouldDimBone ? 1.1 : isBodyPrimarySelected || isParentCandidate ? 2.1 : isMultiSelected ? 1.8 : 1.45;
      ctx.lineJoin = "round";
      traceBoneScreenShapePath(ctx, boneShape);
      ctx.stroke();
      ctx.strokeStyle = shouldDimBone ? "rgba(214, 219, 224, 0.2)" : "rgba(245, 248, 252, 0.24)";
      ctx.lineWidth = shouldDimBone ? 0.7 : 0.8;
      ctx.beginPath();
      ctx.moveTo(ss.x, ss.y);
      ctx.lineTo(es.x, es.y);
      ctx.stroke();

      ctx.fillStyle = shouldDimBone
        ? "rgba(176, 181, 188, 0.82)"
        : isParentCandidate
          ? "#ffd0f5"
          : isHeadSelected || isJointSelected || isBodyPrimarySelected
            ? "#fff0b8"
            : isMultiSelected
              ? "#d3f2ff"
              : isIKTarget
                ? "#b8ffea"
                : "#ffd9a0";
      ctx.beginPath();
      ctx.arc(ss.x, ss.y, isHeadSelected || isJointSelected || isBodyPrimarySelected || isParentCandidate ? 4 : isMultiSelected ? 3.7 : 3.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = shouldDimBone
        ? "rgba(176, 181, 188, 0.82)"
        : isParentCandidate
          ? "#ffd0f5"
          : isTailSelected || isJointSelected || isBodyPrimarySelected
            ? "#fff0b8"
            : isMultiSelected
              ? "#d3f2ff"
              : isIKTarget
                ? "#b8ffea"
                : "#ffd9a0";
      ctx.beginPath();
      ctx.arc(es.x, es.y, isTailSelected || isJointSelected || isBodyPrimarySelected || isParentCandidate ? 4.7 : isMultiSelected ? 4.3 : 4, 0, Math.PI * 2);
      ctx.fill();

      if (isJointSelected) {
        const midX = (ss.x + es.x) * 0.5;
        const midY = (ss.y + es.y) * 0.5;
        ctx.strokeStyle = "rgba(255, 228, 110, 0.92)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(midX, midY, 6.4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "rgba(255, 228, 110, 0.18)";
        ctx.beginPath();
        ctx.arc(midX, midY, 4.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffe46e";
        ctx.font = "10px Segoe UI, sans-serif";
        ctx.fillText("JOINT", midX + 9, midY + 3);
      }

      if (isIkTargetCandidate) {
        ctx.strokeStyle = "#6effd8";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(es.x, es.y, 12, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (isBodyPrimarySelected) {
        ctx.fillStyle = "#ffe46e";
        ctx.font = "12px Segoe UI, sans-serif";
        ctx.fillText("SEL", es.x + 10, es.y - 8);
      } else if (isIkTargetCandidate) {
        ctx.fillStyle = "#84ffe0";
        ctx.font = "12px Segoe UI, sans-serif";
        ctx.fillText("IK TARGET", es.x + 10, es.y - 8);
      } else if (isIKBone) {
        ctx.fillStyle = "#8cf7ff";
        ctx.font = "12px Segoe UI, sans-serif";
        ctx.fillText("IK", es.x + 10, es.y - 8);
      } else if (isIKTarget) {
        ctx.fillStyle = "#9effee";
        ctx.font = "12px Segoe UI, sans-serif";
        ctx.fillText("IK-T", es.x + 10, es.y - 8);
      } else if (isTFCBone) {
        ctx.fillStyle = "#ffc1ff";
        ctx.font = "12px Segoe UI, sans-serif";
        ctx.fillText("TC", es.x + 10, es.y - 8);
      } else if (isTFCTarget) {
        ctx.fillStyle = "#ffe3a8";
        ctx.font = "12px Segoe UI, sans-serif";
        ctx.fillText("TC-T", es.x + 10, es.y - 8);
      } else if (isPathBone) {
        ctx.fillStyle = "#b7c9ff";
        ctx.font = "12px Segoe UI, sans-serif";
        ctx.fillText("PATH", es.x + 10, es.y - 8);
      } else if (isPathTarget) {
        ctx.fillStyle = "#cde0ff";
        ctx.font = "12px Segoe UI, sans-serif";
        ctx.fillText("PTH-T", es.x + 10, es.y - 8);
      } else if (isParentCandidate) {
        ctx.fillStyle = "#ff9de3";
        ctx.font = "12px Segoe UI, sans-serif";
        ctx.fillText("PARENT", es.x + 10, es.y - 8);
      }
    }

    if (state.boneMode === "pose") {
      const list = ensureIKConstraints(m).filter((c) => c && c.enabled !== false);
      const selected = getActiveIKConstraint();
      for (let ci = 0; ci < list.length; ci += 1) {
        const ik = list[ci];
        const tw = getIKSolveTargetWorld(bones, ik);
        if (!tw) continue;
        const ts = localToScreen(tw.x, tw.y);
        const isActive = selected && selected === ik;
        ctx.strokeStyle = isActive ? "#6effd8" : "rgba(110, 255, 216, 0.7)";
        ctx.fillStyle = isActive ? "#6effd8" : "rgba(110, 255, 216, 0.5)";
        ctx.lineWidth = isActive ? 2.2 : 1.4;
        ctx.beginPath();
        ctx.arc(ts.x, ts.y, isActive ? 7 : 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ts.x - 8, ts.y);
        ctx.lineTo(ts.x + 8, ts.y);
        ctx.moveTo(ts.x, ts.y - 8);
        ctx.lineTo(ts.x, ts.y + 8);
        ctx.stroke();
        const chain = Array.isArray(ik.bones) ? ik.bones : [];
        if (chain.length > 0) {
          const endBi = chain[chain.length - 1];
          if (Number.isFinite(endBi) && endBi >= 0 && endBi < bones.length) {
            const ep =
              chain.length >= 2 && ik.endMode !== "tail"
                ? transformPoint(world[endBi], 0, 0)
                : transformPoint(world[endBi], Number(bones[endBi].length) || 0, 0);
            const es = localToScreen(ep.x, ep.y);
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = isActive ? "rgba(110,255,216,0.95)" : "rgba(110,255,216,0.6)";
            ctx.beginPath();
            ctx.moveTo(es.x, es.y);
            ctx.lineTo(ts.x, ts.y);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
        if (isActive) {
          ctx.fillStyle = "#9effee";
          ctx.font = "12px Segoe UI, sans-serif";
          ctx.fillText(
            `IK ${ik.name} | mix ${Number(ik.mix).toFixed(2)} | ${ik.bendPositive === false ? "bend -" : "bend +"}`,
            ts.x + 10,
            ts.y + 16
          );
        }
      }
      const tList = ensureTransformConstraints(m).filter((c) => c && c.enabled !== false);
      const tSelected = getActiveTransformConstraint();
      for (const tc of tList) {
        if (!tc) continue;
        const ti = Number(tc.target);
        if (!Number.isFinite(ti) || ti < 0 || ti >= bones.length) continue;
        const tHead = transformPoint(world[ti], 0, 0);
        const ts = localToScreen(tHead.x, tHead.y);
        const isActive = !!(tSelected && tSelected === tc);
        ctx.strokeStyle = isActive ? "#ffc1ff" : "rgba(255, 193, 255, 0.65)";
        ctx.lineWidth = isActive ? 2 : 1.2;
        ctx.beginPath();
        ctx.rect(ts.x - 5, ts.y - 5, 10, 10);
        ctx.stroke();
        for (const bi of tc.bones || []) {
          if (!Number.isFinite(bi) || bi < 0 || bi >= bones.length) continue;
          const bh = transformPoint(world[bi], 0, 0);
          const bs = localToScreen(bh.x, bh.y);
          ctx.setLineDash([4, 3]);
          ctx.strokeStyle = isActive ? "rgba(255,193,255,0.95)" : "rgba(255,193,255,0.55)";
          ctx.beginPath();
          ctx.moveTo(ts.x, ts.y);
          ctx.lineTo(bs.x, bs.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    }
  }

  if (state.editMode !== "mesh" && typeof weightHeatmapGPU !== "undefined" && weightHeatmapGPU && typeof weightHeatmapGPU.clear === "function") {
    weightHeatmapGPU.clear();
  }
  if (state.editMode === "mesh") {
    const vCount = Math.floor((screenForOverlay && screenForOverlay.length ? screenForOverlay.length : 0) / 2);
    if (state.vertexDeform.weightViz && vCount > 0) {
      const activeSlot = getActiveSlot();
      const weightMesh = state.slots.length > 0 ? (activeSlot ? (getActiveAttachment(activeSlot) || {}).meshData : null) : m;
      drawWeightOverlayForMesh(ctx, m, weightMesh, screenForOverlay);
    } else if (typeof weightHeatmapGPU !== "undefined" && weightHeatmapGPU && typeof weightHeatmapGPU.clear === "function") {
      weightHeatmapGPU.clear();
    }
    const selectedVerts = getActiveVertexSelection(vCount);
    const selectedSet = new Set(selectedVerts);
    const pinnedSet = getActivePinnedVertexSet(vCount);
    if (state.vertexDeform.heatmap && state.vertexDeform.hasCursor && vCount > 0) {
      const r = Math.max(4, Number(state.vertexDeform.radius) || 80);
      for (let i = 0; i < vCount; i += 1) {
        const dx = screenForOverlay[i * 2] - state.vertexDeform.cursorX;
        const dy = screenForOverlay[i * 2 + 1] - state.vertexDeform.cursorY;
        const d2 = dx * dx + dy * dy;
        if (d2 > r * r) continue;
        const w = getVertexFalloffWeight(Math.sqrt(d2) / r);
        if (w <= 1e-4) continue;
        ctx.fillStyle = getHeatmapColor(w);
        ctx.beginPath();
        ctx.arc(screenForOverlay[i * 2], screenForOverlay[i * 2 + 1], 5.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (state.vertexDeform.proportional && state.vertexDeform.hasCursor && !(state.weightBrush && state.weightBrush.active)) {
      const r = Math.max(4, Number(state.vertexDeform.radius) || 80);
      ctx.strokeStyle = "rgba(122, 214, 255, 0.85)";
      ctx.lineWidth = 1.4;
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      ctx.arc(state.vertexDeform.cursorX, state.vertexDeform.cursorY, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    if (typeof drawWeightBrushCursor === "function") drawWeightBrushCursor(ctx);
    ctx.fillStyle = "rgba(220, 245, 255, 0.92)";
    for (let i = 0; i < screenForOverlay.length / 2; i += 1) {
      ctx.beginPath();
      ctx.arc(screenForOverlay[i * 2], screenForOverlay[i * 2 + 1], 2.1, 0, Math.PI * 2);
      ctx.fill();
      if (selectedSet.has(i)) {
        ctx.strokeStyle = "rgba(255, 224, 112, 0.96)";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(screenForOverlay[i * 2], screenForOverlay[i * 2 + 1], 5.6, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (pinnedSet.has(i)) {
        ctx.strokeStyle = "rgba(255, 146, 92, 0.95)";
        ctx.lineWidth = 2.1;
        ctx.beginPath();
        ctx.arc(screenForOverlay[i * 2], screenForOverlay[i * 2 + 1], 8.2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  if (isSlotMeshEditTabActive()) {
    const slot = getActiveSlot();
    if (slot) {
      syncSlotContourFromMeshData(slot, false);
      const slotPoseWorld = getSolvedPoseWorld(m);
      const contour = ensureSlotContour(slot);
      const showContourLayer = Array.isArray(contour.points) && contour.points.length > 0;
      const activeSet = getSlotMeshEditSetName();
      const triIdx =
        Array.isArray(contour.fillTriangles) && contour.fillTriangles.length >= 3 ? contour.fillTriangles : contour.triangles;
      const triPts =
        Array.isArray(contour.fillPoints) && contour.fillPoints.length >= 3 ? contour.fillPoints : contour.points;
      const previewGrid = getSlotMeshPreviewGridInfo(slot, contour);
      const drewGridPreview = drawSlotMeshPreviewGrid(ctx, slot, previewGrid, slotPoseWorld);
      if (!drewGridPreview && Array.isArray(triIdx) && triIdx.length >= 3) {
        ctx.strokeStyle = "rgba(63, 208, 162, 0.65)";
        ctx.lineWidth = 1.2;
        for (let t = 0; t + 2 < triIdx.length; t += 3) {
          const a = triPts[triIdx[t]];
          const b = triPts[triIdx[t + 1]];
          const c = triPts[triIdx[t + 2]];
          if (!a || !b || !c) continue;
          const sa = slotMeshLocalToScreen(slot, a, slotPoseWorld);
          const sb = slotMeshLocalToScreen(slot, b, slotPoseWorld);
          const sc = slotMeshLocalToScreen(slot, c, slotPoseWorld);
          ctx.beginPath();
          ctx.moveTo(sa.x, sa.y);
          ctx.lineTo(sb.x, sb.y);
          ctx.lineTo(sc.x, sc.y);
          ctx.closePath();
          ctx.stroke();
        }
      }
      // Manual edges are now applied directly to triangulation, no separate rendering needed

      if (showContourLayer) {
        ctx.strokeStyle = contour.closed ? "#f0c46a" : "#f3b86b";
        ctx.lineWidth = 2;
        if (Array.isArray(contour.contourEdges) && contour.contourEdges.length > 0) {
          for (const edge of contour.contourEdges) {
            const pa = contour.points[edge[0]];
            const pb = contour.points[edge[1]];
            if (!pa || !pb) continue;
            const sa = slotMeshLocalToScreen(slot, pa, slotPoseWorld);
            const sb = slotMeshLocalToScreen(slot, pb, slotPoseWorld);
            ctx.beginPath();
            ctx.moveTo(sa.x, sa.y);
            ctx.lineTo(sb.x, sb.y);
            ctx.stroke();
          }
        }
      }
      for (let i = 0; i < contour.fillPoints.length; i += 1) {
        const p = contour.fillPoints[i];
        const s = slotMeshLocalToScreen(slot, p, slotPoseWorld);
        const active = activeSet === "fill" && i === state.slotMesh.activePoint;
        const selected = getSlotMeshSelection("fill", contour.fillPoints.length).includes(i);
        ctx.globalAlpha = activeSet === "fill" ? 1 : 0.38;
        ctx.fillStyle = active ? "#ff8fd0" : selected ? "#ffd9ec" : "#88e9ff";
        ctx.beginPath();
        ctx.arc(s.x, s.y, active ? 5.8 : selected ? 4.4 : 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (showContourLayer) {
        for (let i = 0; i < contour.points.length; i += 1) {
          const p = contour.points[i];
          const s = slotMeshLocalToScreen(slot, p, slotPoseWorld);
          const active = activeSet === "contour" && i === state.slotMesh.activePoint;
          const selected = getSlotMeshSelection("contour", contour.points.length).includes(i);
          ctx.globalAlpha = activeSet === "contour" ? 1 : 0.55;
          ctx.fillStyle = active ? "#ffd27a" : selected ? "#ffe2a8" : i === 0 ? "#f3b86b" : "#e7dcc2";
          ctx.beginPath();
          ctx.arc(s.x, s.y, active ? 6 : selected ? 5.4 : 4.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      if (state.slotMesh.edgeSelectionSet && state.slotMesh.edgeSelection.length > 0) {
        const points = state.slotMesh.edgeSelectionSet === "fill" ? contour.fillPoints : contour.points;
        for (const i of state.slotMesh.edgeSelection) {
          const p = points[i];
          if (!p) continue;
          const s = slotMeshLocalToScreen(slot, p, slotPoseWorld);
          ctx.strokeStyle = "#ff8a55";
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.arc(s.x, s.y, 8.5, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }
  }
  if (state.drag && state.drag.type === "slot_mesh_marquee") {
    const d = state.drag;
    const x = Math.min(Number(d.startX) || 0, Number(d.curX) || 0);
    const y = Math.min(Number(d.startY) || 0, Number(d.curY) || 0);
    const w = Math.abs((Number(d.curX) || 0) - (Number(d.startX) || 0));
    const h = Math.abs((Number(d.curY) || 0) - (Number(d.startY) || 0));
    ctx.save();
    ctx.strokeStyle = "rgba(125, 211, 252, 0.95)";
    ctx.fillStyle = "rgba(125, 211, 252, 0.12)";
    ctx.lineWidth = 1.4;
    ctx.setLineDash([6, 4]);
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
    ctx.restore();
  }

  if (state.drag && state.drag.type === "mesh") {
    const i = state.drag.index;
    const influences = Array.isArray(state.drag.influences) ? state.drag.influences : [];
    if (influences.length > 1) {
      for (const it of influences) {
        const vi = Number(it && it.index);
        if (!Number.isFinite(vi) || vi < 0 || vi >= screenForOverlay.length / 2 || vi === i) continue;
        const w = math.clamp(Number(it && it.weight) || 0, 0, 1);
        ctx.strokeStyle = `rgba(122, 214, 255, ${0.2 + w * 0.6})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(screenForOverlay[vi * 2], screenForOverlay[vi * 2 + 1], 4.2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.strokeStyle = "#ff7272";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(screenForOverlay[i * 2], screenForOverlay[i * 2 + 1], 8, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (state.drag && state.drag.type === "bone_marquee") {
    const x = Math.min(state.drag.startX, state.drag.curX);
    const y = Math.min(state.drag.startY, state.drag.curY);
    const w = Math.abs(state.drag.curX - state.drag.startX);
    const h = Math.abs(state.drag.curY - state.drag.startY);
    ctx.fillStyle = "rgba(125, 211, 252, 0.12)";
    ctx.strokeStyle = "rgba(125, 211, 252, 0.9)";
    ctx.lineWidth = 1.5;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
  }

  if (state.drag && state.drag.type === "vertex_marquee") {
    const x = Math.min(state.drag.startX, state.drag.curX);
    const y = Math.min(state.drag.startY, state.drag.curY);
    const w = Math.abs(state.drag.curX - state.drag.startX);
    const h = Math.abs(state.drag.curY - state.drag.startY);
    ctx.fillStyle = "rgba(255, 214, 112, 0.12)";
    ctx.strokeStyle = "rgba(255, 214, 112, 0.92)";
    ctx.lineWidth = 1.5;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
  }

  if (state.addBoneDraft) {
    const hs = localToScreen(state.addBoneDraft.head.x, state.addBoneDraft.head.y);
    const ts = localToScreen(state.addBoneDraft.tail.x, state.addBoneDraft.tail.y);
    ctx.strokeStyle = "#7dd3fc";
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(hs.x, hs.y);
    ctx.lineTo(ts.x, ts.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#d1f4ff";
    ctx.beginPath();
    ctx.arc(hs.x, hs.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ts.x, ts.y, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  const poseWorld = state.mesh ? getSolvedPoseWorld(state.mesh) : [];
  drawGhostAttachments(ctx, poseWorld);
  drawAttachmentGizmos(ctx, poseWorld);
  drawCanvasTransformGizmos(ctx, poseWorld);
}

function drawGhostAttachments(ctx, poseWorld) {
  const slot = getActiveSlot();
  if (!slot || !Array.isArray(slot.attachments) || slot.attachments.length <= 1) return;
  const activeName = slot.activeAttachment ? String(slot.activeAttachment) : null;
  const tm = getSlotTransformMatrix(slot, poseWorld);

  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.setLineDash([5, 4]);
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = "rgba(200, 200, 255, 0.85)";

  for (const att of slot.attachments) {
    if (!att || att.name === activeName) continue;
    const attType = normalizeAttachmentType(att.type);

    if (attType === "point") {
      const px = Number(att.pointX) || 0;
      const py = Number(att.pointY) || 0;
      const w = transformPoint(tm, px, py);
      const s = localToScreen(w.x, w.y);
      const R = 6;
      ctx.beginPath();
      ctx.moveTo(s.x - R, s.y);
      ctx.lineTo(s.x + R, s.y);
      ctx.moveTo(s.x, s.y - R);
      ctx.lineTo(s.x, s.y + R);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(s.x, s.y, R, 0, Math.PI * 2);
      ctx.stroke();
      continue;
    }

    if (attType === "boundingbox" || attType === "clipping") {
      const mc = att.meshContour;
      const pts = mc && Array.isArray(mc.points) ? mc.points : [];
      if (pts.length >= 2) {
        ctx.beginPath();
        for (let i = 0; i < pts.length; i += 1) {
          const w2 = transformPoint(tm, Number(pts[i].x) || 0, Number(pts[i].y) || 0);
          const s = localToScreen(w2.x, w2.y);
          if (i === 0) ctx.moveTo(s.x, s.y);
          else ctx.lineTo(s.x, s.y);
        }
        if (mc.closed) ctx.closePath();
        ctx.stroke();
      }
      continue;
    }

    if ((attType === "region" || attType === "mesh" || attType === "linkedmesh") && att.canvas) {
      const rect =
        att.rect && Number.isFinite(att.rect.w) && Number.isFinite(att.rect.h)
          ? att.rect
          : slot.rect && Number.isFinite(slot.rect.w) && Number.isFinite(slot.rect.h)
            ? slot.rect
            : {
                x: 0,
                y: 0,
                w: Math.max(1, Number(att.canvas.width) || 1),
                h: Math.max(1, Number(att.canvas.height) || 1),
              };
      if (Number(rect.w) > 0 && Number(rect.h) > 0) {
        const corners = [
          { x: Number(rect.x) || 0, y: Number(rect.y) || 0 },
          { x: (Number(rect.x) || 0) + (Number(rect.w) || 0), y: Number(rect.y) || 0 },
          { x: (Number(rect.x) || 0) + (Number(rect.w) || 0), y: (Number(rect.y) || 0) + (Number(rect.h) || 0) },
          { x: Number(rect.x) || 0, y: (Number(rect.y) || 0) + (Number(rect.h) || 0) },
        ];
        ctx.beginPath();
        for (let i = 0; i < corners.length; i += 1) {
          const w2 = transformPoint(tm, corners[i].x, corners[i].y);
          const s = localToScreen(w2.x, w2.y);
          if (i === 0) ctx.moveTo(s.x, s.y);
          else ctx.lineTo(s.x, s.y);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }
  }

  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawAttachmentGizmos(ctx, poseWorld) {
  const slot = getActiveSlot();
  if (!slot) return;
  const att = getActiveAttachment(slot);
  if (!att) return;
  const attType = normalizeAttachmentType(att.type);
  const HANDLE_R = 5;

  if (attType === "point") {
    const px = Number(att.pointX) || 0;
    const py = Number(att.pointY) || 0;
    const rot = Number(att.pointRot) || 0;
    const tm = getSlotTransformMatrix(slot, poseWorld);
    const wCenter = transformPoint(tm, px, py);
    const sc = localToScreen(wCenter.x, wCenter.y);
    const rotRad = rot * (Math.PI / 180);
    const lineLen = 22;
    const wTip = transformPoint(tm, px + Math.cos(rotRad) * lineLen, py + Math.sin(rotRad) * lineLen);
    const stip = localToScreen(wTip.x, wTip.y);

    ctx.save();
    ctx.strokeStyle = "rgba(255, 220, 80, 0.95)";
    ctx.lineWidth = 1.8;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    ctx.moveTo(sc.x, sc.y);
    ctx.lineTo(stip.x, stip.y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#ffd840";
    ctx.strokeStyle = "#fff3a0";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(sc.x, sc.y, HANDLE_R + 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#fff0a0";
    ctx.strokeStyle = "#ffd840";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(stip.x, stip.y, HANDLE_R - 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (attType === "boundingbox" || attType === "clipping") {
    const contour = ensureSlotContour(slot);
    const pts = Array.isArray(contour.points) ? contour.points : [];
    if (pts.length === 0) return;
    const drag = state.drag;
    const draggingIdx = drag && drag.type === "att_gizmo_vertex" ? drag.pointIndex : -1;

    ctx.save();
    for (let i = 0; i < pts.length; i += 1) {
      const s = slotMeshLocalToScreen(slot, pts[i], poseWorld);
      const isDragging = i === draggingIdx;
      ctx.fillStyle = isDragging ? "#ffe46e" : attType === "boundingbox" ? "#88ffcc" : "#ff88cc";
      ctx.strokeStyle = isDragging ? "#fff0b0" : "#ffffff";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.rect(s.x - HANDLE_R, s.y - HANDLE_R, HANDLE_R * 2, HANDLE_R * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }
}

function pickAttachmentGizmoHandle(mx, my, poseWorld) {
  const slot = getActiveSlot();
  if (!slot) return null;
  const att = getActiveAttachment(slot);
  if (!att) return null;
  const attType = normalizeAttachmentType(att.type);
  const HIT_R = 7;

  if (attType === "point") {
    const px = Number(att.pointX) || 0;
    const py = Number(att.pointY) || 0;
    const rot = Number(att.pointRot) || 0;
    const tm = getSlotTransformMatrix(slot, poseWorld);
    const wCenter = transformPoint(tm, px, py);
    const sc = localToScreen(wCenter.x, wCenter.y);
    const rotRad = rot * (Math.PI / 180);
    const lineLen = 22;
    const wTip = transformPoint(tm, px + Math.cos(rotRad) * lineLen, py + Math.sin(rotRad) * lineLen);
    const stip = localToScreen(wTip.x, wTip.y);

    const dTip = Math.hypot(mx - stip.x, my - stip.y);
    if (dTip <= HIT_R) return { kind: "point_rotate" };
    const dCenter = Math.hypot(mx - sc.x, my - sc.y);
    if (dCenter <= HIT_R + 1) return { kind: "point_move" };
    return null;
  }

  if (attType === "boundingbox" || attType === "clipping") {
    const contour = ensureSlotContour(slot);
    const pts = Array.isArray(contour.points) ? contour.points : [];
    for (let i = 0; i < pts.length; i += 1) {
      const s = slotMeshLocalToScreen(slot, pts[i], poseWorld);
      if (Math.abs(mx - s.x) <= HIT_R && Math.abs(my - s.y) <= HIT_R) {
        return { kind: "vertex", pointIndex: i };
      }
    }
    return null;
  }

  return null;
}

function drawMeshOnContext(ctx, drawCanvas = state.sourceCanvas, alpha = 1, tint = null, screen = null, indices = null, uvs = null, blendMode = "normal") {
  if (!ctx) return;
  const m = state.mesh;
  if (!m || !drawCanvas) return;
  const tr = tint && Number.isFinite(tint.r) ? math.clamp(Number(tint.r), 0, 1) : 1;
  const tg = tint && Number.isFinite(tint.g) ? math.clamp(Number(tint.g), 0, 1) : 1;
  const tb = tint && Number.isFinite(tint.b) ? math.clamp(Number(tint.b), 0, 1) : 1;
  const useTint = Math.abs(tr - 1) > 1e-4 || Math.abs(tg - 1) > 1e-4 || Math.abs(tb - 1) > 1e-4;
  const composite = getCanvasCompositeForBlendMode(blendMode);

  const iw = drawCanvas.width;
  const ih = drawCanvas.height;
  const index = indices || m.indices;
  const uvData = uvs || m.uvs;
  const expandForClip = (x0, y0, x1, y1, x2, y2, overlapPx = 0.6) => {
    const cx = (x0 + x1 + x2) / 3;
    const cy = (y0 + y1 + y2) / 3;
    const v0x = x0 - cx;
    const v0y = y0 - cy;
    const v1x = x1 - cx;
    const v1y = y1 - cy;
    const v2x = x2 - cx;
    const v2y = y2 - cy;
    const l0 = Math.hypot(v0x, v0y) || 1;
    const l1 = Math.hypot(v1x, v1y) || 1;
    const l2 = Math.hypot(v2x, v2y) || 1;
    return {
      x0: x0 + (v0x / l0) * overlapPx,
      y0: y0 + (v0y / l0) * overlapPx,
      x1: x1 + (v1x / l1) * overlapPx,
      y1: y1 + (v1y / l1) * overlapPx,
      x2: x2 + (v2x / l2) * overlapPx,
      y2: y2 + (v2y / l2) * overlapPx,
    };
  };

  for (let t = 0; t < index.length; t += 3) {
    const i0 = index[t];
    const i1 = index[t + 1];
    const i2 = index[t + 2];

    const sp = screen || m.deformedScreen;
    const sx0 = sp[i0 * 2];
    const sy0 = sp[i0 * 2 + 1];
    const sx1 = sp[i1 * 2];
    const sy1 = sp[i1 * 2 + 1];
    const sx2 = sp[i2 * 2];
    const sy2 = sp[i2 * 2 + 1];
    const screenArea2 = (sx1 - sx0) * (sy2 - sy0) - (sy1 - sy0) * (sx2 - sx0);
    if (Math.abs(screenArea2) < 1e-4) continue;

    const u0 = uvData[i0 * 2] * iw;
    const v0 = uvData[i0 * 2 + 1] * ih;
    const u1 = uvData[i1 * 2] * iw;
    const v1 = uvData[i1 * 2 + 1] * ih;
    const u2 = uvData[i2 * 2] * iw;
    const v2 = uvData[i2 * 2 + 1] * ih;

    const den = u0 * (v1 - v2) + u1 * (v2 - v0) + u2 * (v0 - v1);
    if (Math.abs(den) < 1e-8) continue;

    const a = (sx0 * (v1 - v2) + sx1 * (v2 - v0) + sx2 * (v0 - v1)) / den;
    const b = (sx0 * (u2 - u1) + sx1 * (u0 - u2) + sx2 * (u1 - u0)) / den;
    const c = (sx0 * (u1 * v2 - u2 * v1) + sx1 * (u2 * v0 - u0 * v2) + sx2 * (u0 * v1 - u1 * v0)) / den;
    const d = (sy0 * (v1 - v2) + sy1 * (v2 - v0) + sy2 * (v0 - v1)) / den;
    const e = (sy0 * (u2 - u1) + sy1 * (u0 - u2) + sy2 * (u1 - u0)) / den;
    const f = (sy0 * (u1 * v2 - u2 * v1) + sy1 * (u2 * v0 - u0 * v2) + sy2 * (u0 * v1 - u1 * v0)) / den;
    const exp = expandForClip(sx0, sy0, sx1, sy1, sx2, sy2, 0.55);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(exp.x0, exp.y0);
    ctx.lineTo(exp.x1, exp.y1);
    ctx.lineTo(exp.x2, exp.y2);
    ctx.closePath();
    ctx.clip();
    ctx.setTransform(a, d, b, e, c, f);
    ctx.globalAlpha = math.clamp(alpha, 0, 1);
    ctx.globalCompositeOperation = composite;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(drawCanvas, 0, 0);
    if (useTint) {
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = `rgb(${Math.round(tr * 255)}, ${Math.round(tg * 255)}, ${Math.round(tb * 255)})`;
      ctx.fillRect(0, 0, iw, ih);
      ctx.globalCompositeOperation = "destination-atop";
      ctx.drawImage(drawCanvas, 0, 0);
      ctx.globalCompositeOperation = "source-over";
    }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
}

function getSlotClipPolygonScreen(slot, poseWorld) {
  const localPts = getSlotClipPointsLocal(slot);
  if (!Array.isArray(localPts) || localPts.length < 3) return [];
  const tm = getSlotTransformMatrix(slot, poseWorld);
  const out = [];
  for (const p of localPts) {
    const w = transformPoint(tm, Number(p.x) || 0, Number(p.y) || 0);
    const s = localToScreen(w.x, w.y);
    out.push(s);
  }
  return out.length >= 3 ? out : [];
}

function drawClipPath2D(ctx, points) {
  if (!ctx || !Array.isArray(points) || points.length < 3) return false;
  ctx.beginPath();
  for (let i = 0; i < points.length; i += 1) {
    const p = points[i];
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
  return true;
}

// ============================================================

// ----------------------------------------------------------------
// Physics Constraints UI (Spine 4.2 equivalent)
// ----------------------------------------------------------------
function refreshPhysicsUI() {
  if (!els.physicsSelect) return;
  const m = state.mesh;
  if (!m || !Array.isArray(m.rigBones) || m.rigBones.length === 0) {
    els.physicsSelect.innerHTML = "";
    if (els.physicsList) els.physicsList.innerHTML = "<div class='muted'>No bones.</div>";
    return;
  }
  const list = ensurePhysicsConstraints(m);
  const prev = state.selectedPhysics >= 0 && state.selectedPhysics < list.length ? list[state.selectedPhysics] : null;
  sortConstraintListByOrder(list);
  if (prev) state.selectedPhysics = list.indexOf(prev);
  if (state.selectedPhysics < 0 || state.selectedPhysics >= list.length) {
    state.selectedPhysics = list.length > 0 ? 0 : -1;
  }
  if (els.physicsBone) {
    els.physicsBone.innerHTML = "";
    for (let i = 0; i < m.rigBones.length; i += 1) {
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = `${i}: ${m.rigBones[i].name}`;
      els.physicsBone.appendChild(opt);
    }
  }
  els.physicsSelect.innerHTML = "";
  for (let i = 0; i < list.length; i += 1) {
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = `${i}: ${list[i].name}`;
    els.physicsSelect.appendChild(opt);
  }
  if (els.physicsList) {
    els.physicsList.innerHTML = "";
    if (list.length === 0) {
      els.physicsList.innerHTML = "<div class='muted'>No Physics constraints yet.</div>";
    } else {
      for (let i = 0; i < list.length; i += 1) {
        const c = list[i];
        const row = document.createElement("div");
        row.className = `tree-item${state.selectedPhysics === i ? " selected" : ""}`;
        row.dataset.physicsIndex = String(i);
        row.textContent = `${i}: ${c.name}${c.enabled === false ? " (off)" : ""}`;
        els.physicsList.appendChild(row);
      }
    }
  }
  const c = state.selectedPhysics >= 0 ? list[state.selectedPhysics] : null;
  const setDis = (el, dis) => { if (el) el.disabled = dis; };
  if (els.physicsRemoveBtn) els.physicsRemoveBtn.disabled = !c;
  if (els.physicsResetBtn) els.physicsResetBtn.disabled = !c;
  if (els.physicsMoveUpBtn) els.physicsMoveUpBtn.disabled = !c || state.selectedPhysics <= 0;
  if (els.physicsMoveDownBtn) els.physicsMoveDownBtn.disabled = !c || state.selectedPhysics >= list.length - 1;
  const fields = [
    els.physicsName, els.physicsBone, els.physicsEnabled,
    els.physicsX, els.physicsY, els.physicsRotate, els.physicsScaleX, els.physicsShearX,
    els.physicsMix, els.physicsInertia, els.physicsStrength, els.physicsDamping,
    els.physicsMassInverse, els.physicsStep,
    els.physicsWind, els.physicsGravity, els.physicsLimit, els.physicsSkinRequired,
  ];
  for (const f of fields) setDis(f, !c);
  if (!c) {
    if (els.physicsHint) els.physicsHint.textContent = "No Physics constraint. Add one.";
    return;
  }
  if (els.physicsSelect) els.physicsSelect.value = String(state.selectedPhysics);
  if (els.physicsName) els.physicsName.value = c.name || `physics_${state.selectedPhysics}`;
  if (els.physicsBone) els.physicsBone.value = String(c.bone);
  if (els.physicsEnabled) els.physicsEnabled.value = c.enabled === false ? "false" : "true";
  if (els.physicsX) els.physicsX.checked = !!c.x;
  if (els.physicsY) els.physicsY.checked = !!c.y;
  if (els.physicsRotate) els.physicsRotate.checked = c.rotate !== false;
  if (els.physicsScaleX) els.physicsScaleX.checked = !!c.scaleX;
  if (els.physicsShearX) els.physicsShearX.checked = !!c.shearX;
  if (els.physicsMix) els.physicsMix.value = String(c.mix);
  if (els.physicsInertia) els.physicsInertia.value = String(c.inertia);
  if (els.physicsStrength) els.physicsStrength.value = String(c.strength);
  if (els.physicsDamping) els.physicsDamping.value = String(c.damping);
  if (els.physicsMassInverse) els.physicsMassInverse.value = String(c.massInverse);
  if (els.physicsStep) els.physicsStep.value = String(c.step);
  if (els.physicsWind) els.physicsWind.value = String(c.wind);
  if (els.physicsGravity) els.physicsGravity.value = String(c.gravity);
  if (els.physicsLimit) els.physicsLimit.value = String(c.limit);
  if (els.physicsSkinRequired) els.physicsSkinRequired.checked = !!c.skinRequired;
  if (els.physicsHint) els.physicsHint.textContent = `Editing "${c.name}" — bone ${m.rigBones[c.bone] ? m.rigBones[c.bone].name : "?"}.`;
}

function _physicsBumpAndRefresh() {
  refreshPhysicsUI();
  if (typeof scheduleDraw === "function") scheduleDraw();
}

if (els.physicsAddBtn) {
  els.physicsAddBtn.addEventListener("click", () => {
    if (!addPhysicsConstraint()) {
      if (typeof setStatus === "function") setStatus("Add Physics failed. Need at least one bone.");
      return;
    }
    _physicsBumpAndRefresh();
  });
}
if (els.physicsRemoveBtn) {
  els.physicsRemoveBtn.addEventListener("click", () => {
    if (!removeSelectedPhysicsConstraint()) return;
    _physicsBumpAndRefresh();
  });
}
if (els.physicsResetBtn) {
  els.physicsResetBtn.addEventListener("click", () => {
    const m = state.mesh;
    if (!m) return;
    resetAllPhysicsConstraintState(m);
    if (typeof setStatus === "function") setStatus("Physics simulator state reset.");
    _physicsBumpAndRefresh();
  });
}
if (els.physicsMoveUpBtn) {
  els.physicsMoveUpBtn.addEventListener("click", () => {
    const m = state.mesh;
    if (!m) return;
    const list = ensurePhysicsConstraints(m);
    const i = state.selectedPhysics;
    if (i <= 0 || i >= list.length) return;
    const curr = list[i];
    swapConstraintOrder(list, i, i - 1);
    sortConstraintListByOrder(list);
    state.selectedPhysics = list.indexOf(curr);
    _physicsBumpAndRefresh();
  });
}
if (els.physicsMoveDownBtn) {
  els.physicsMoveDownBtn.addEventListener("click", () => {
    const m = state.mesh;
    if (!m) return;
    const list = ensurePhysicsConstraints(m);
    const i = state.selectedPhysics;
    if (i < 0 || i >= list.length - 1) return;
    const curr = list[i];
    swapConstraintOrder(list, i, i + 1);
    sortConstraintListByOrder(list);
    state.selectedPhysics = list.indexOf(curr);
    _physicsBumpAndRefresh();
  });
}
if (els.physicsList) {
  els.physicsList.addEventListener("click", (ev) => {
    const row = ev.target.closest("[data-physics-index]");
    if (!row) return;
    const idx = Number(row.dataset.physicsIndex);
    if (!Number.isFinite(idx)) return;
    state.selectedPhysics = idx;
    refreshPhysicsUI();
  });
}
if (els.physicsSelect) {
  els.physicsSelect.addEventListener("change", () => {
    state.selectedPhysics = Number(els.physicsSelect.value);
    refreshPhysicsUI();
  });
}
if (els.physicsName) {
  els.physicsName.addEventListener("input", () => {
    const c = getActivePhysicsConstraint();
    if (!c) return;
    c.name = String(els.physicsName.value || "");
  });
}
if (els.physicsBone) {
  els.physicsBone.addEventListener("change", () => {
    const c = getActivePhysicsConstraint();
    if (!c) return;
    const v = Number(els.physicsBone.value);
    const m = state.mesh;
    if (Number.isFinite(v) && v >= 0 && m && v < m.rigBones.length) {
      c.bone = v;
      if (c.state) c.state.reset = true;
      _physicsBumpAndRefresh();
    }
  });
}
if (els.physicsEnabled) {
  els.physicsEnabled.addEventListener("change", () => {
    const c = getActivePhysicsConstraint();
    if (!c) return;
    c.enabled = els.physicsEnabled.value !== "false";
    _physicsBumpAndRefresh();
  });
}
function _wirePhysicsCheckbox(el, key) {
  if (!el) return;
  el.addEventListener("change", () => {
    const c = getActivePhysicsConstraint();
    if (!c) return;
    c[key] = !!el.checked;
    _physicsBumpAndRefresh();
  });
}
_wirePhysicsCheckbox(els.physicsX, "x");
_wirePhysicsCheckbox(els.physicsY, "y");
_wirePhysicsCheckbox(els.physicsRotate, "rotate");
_wirePhysicsCheckbox(els.physicsScaleX, "scaleX");
_wirePhysicsCheckbox(els.physicsShearX, "shearX");
_wirePhysicsCheckbox(els.physicsSkinRequired, "skinRequired");
function _wirePhysicsNumeric(el, key, lo, hi) {
  if (!el) return;
  el.addEventListener("input", () => {
    const c = getActivePhysicsConstraint();
    if (!c) return;
    const v = Number(el.value);
    if (!Number.isFinite(v)) return;
    let nv = v;
    if (Number.isFinite(lo)) nv = Math.max(lo, nv);
    if (Number.isFinite(hi)) nv = Math.min(hi, nv);
    c[key] = nv;
    if (typeof scheduleDraw === "function") scheduleDraw();
  });
}
_wirePhysicsNumeric(els.physicsMix, "mix", 0, 1);
_wirePhysicsNumeric(els.physicsInertia, "inertia", 0, 1);
_wirePhysicsNumeric(els.physicsStrength, "strength", 0, Infinity);
_wirePhysicsNumeric(els.physicsDamping, "damping", 0, 10);
_wirePhysicsNumeric(els.physicsMassInverse, "massInverse", 0.01, Infinity);
_wirePhysicsNumeric(els.physicsStep, "step", 1 / 240, 1 / 15);
_wirePhysicsNumeric(els.physicsWind, "wind", -Infinity, Infinity);
_wirePhysicsNumeric(els.physicsGravity, "gravity", -Infinity, Infinity);
_wirePhysicsNumeric(els.physicsLimit, "limit", 0, Infinity);
