// Split from app.js
// Part: Canvas pointer interactions and app bootstrap
// Original lines: 29899-30158
function clearDrag(ev) {
  const drag = state.drag;
  const shiftHeld = !!(ev && ev.shiftKey);
  if (!state.drag) return;
  if (ev && ev.pointerId != null) {
    try {
      els.overlay.releasePointerCapture(ev.pointerId);
    } catch {
      // ignore
    }
  }
  state.drag = null;
  refreshCanvasInteractionAffordance();
  if (drag.type === "bone_object_scale") {
    state.objectScaleHoverRoot = -1;
    if (els.overlay) els.overlay.style.cursor = "";
  }
  if (drag.type === "view_pan") {
    if (els.stage) els.stage.classList.remove("dragging-pan");
    return;
  }
  if (drag.type === "base_transform_move" || drag.type === "base_transform_rotate" || drag.type === "base_transform_scale") {
    refreshBaseImageTransformUI();
    pushUndoCheckpoint(true);
    return;
  }
  if (drag.type === "slot_transform_move" || drag.type === "slot_transform_rotate") {
    syncActiveSlotTransformInputs();
    pushUndoCheckpoint(true);
    return;
  }
  if (drag.type === "path_point" || drag.type === "path_handle") {
    pushUndoCheckpoint(true);
    return;
  }
  if (drag.type === "slot_mesh_point") {
    const slot = getActiveSlot();
    if (slot) {
      const contour = ensureSlotContour(slot);
      if (drag.pointSet === "contour") contour.triangles = [];
    }
    pushUndoCheckpoint(true);
    return;
  }
  if (drag.type === "slot_mesh_multi_move") {
    const slot = getActiveSlot();
    if (slot && drag.pointSet === "contour") {
      const contour = ensureSlotContour(slot);
      contour.triangles = [];
    }
    pushUndoCheckpoint(true);
    return;
  }
  if (drag.type === "slot_mesh_marquee") {
    const slot = getActiveSlot();
    if (!slot) return;
    const contour = ensureSlotContour(slot);
    const setName = state.slotMesh.activeSet === "fill" ? "fill" : "contour";
    const points = setName === "fill" ? contour.fillPoints : contour.points;
    const x0 = Math.min(Number(drag.startX) || 0, Number(drag.curX) || 0);
    const y0 = Math.min(Number(drag.startY) || 0, Number(drag.curY) || 0);
    const x1 = Math.max(Number(drag.startX) || 0, Number(drag.curX) || 0);
    const y1 = Math.max(Number(drag.startY) || 0, Number(drag.curY) || 0);
    const picked = [];
    const poseWorld = getSolvedPoseWorld(state.mesh);
    for (let i = 0; i < points.length; i += 1) {
      const s = slotMeshLocalToScreen(slot, points[i], poseWorld);
      if (s.x >= x0 && s.x <= x1 && s.y >= y0 && s.y <= y1) picked.push(i);
    }
    const base = drag.append ? getSlotMeshSelection(setName, points.length) : [];
    setSlotMeshSelection(setName, [...base, ...picked], points.length);
    state.slotMesh.activePoint = picked.length > 0 ? picked[picked.length - 1] : state.slotMesh.activePoint;
    setStatus(`${setName === "fill" ? "Fill" : "Contour"} selected: ${getSlotMeshSelection(setName, points.length).length}`);
    return;
  }
  if (drag.type === "bone_marquee") {
    const dx = drag.curX - drag.startX;
    const dy = drag.curY - drag.startY;
    if (dx * dx + dy * dy > 16) {
      selectBonesByRect(drag.startX, drag.startY, drag.curX, drag.curY, !!drag.append);
      setStatus(`Selected bones: ${state.selectedBonesForWeight.join(", ") || "(none)"}`);
    } else if (!drag.append) {
      clearBoneSelection(true);
    }
  }
  if (drag.type === "vertex_marquee") {
    const dx = drag.curX - drag.startX;
    const dy = drag.curY - drag.startY;
    if (dx * dx + dy * dy > 16) {
      const count = selectVerticesByRect(drag.startX, drag.startY, drag.curX, drag.curY, !!drag.append);
      setStatus(`Vertex selection: ${count} selected.`);
    } else if (!drag.append) {
      clearActiveVertexSelection();
      setStatus("Vertex selection cleared.");
    }
    return;
  }
  if (drag.type === "add_bone_drag" && state.addBoneDraft && state.mesh && state.boneMode === "edit") {
    const draft = state.addBoneDraft;
    const dx = draft.tail.x - draft.head.x;
    const dy = draft.tail.y - draft.head.y;
    let createdIdx = -1;
    if (dx * dx + dy * dy > 4) {
      createdIdx = addBone({
        parent: Number.isFinite(draft.parent) ? draft.parent : -1,
        connected: !!draft.connected,
        head: draft.head,
        tail: draft.tail,
      });
      setStatus("Bone created from canvas drag.");
    }
    state.addBoneDraft = null;
    if (shiftHeld && createdIdx >= 0) {
      state.addBoneArmed = true;
      els.addBoneParent.value = String(createdIdx);
      els.addBoneConnect.value = "true";
      els.addBoneBtn.textContent = "Cancel Add";
      refreshSetupQuickActions();
      setStatus(`Chain add: parent set to bone ${createdIdx}. Drag next tail.`);
    } else {
      state.addBoneArmed = false;
      els.addBoneBtn.textContent = "Add Bone";
      refreshSetupQuickActions();
    }
  }
  if (state.mesh && drag.type !== "vertex" && drag.needsReweight) {
    autoWeightMesh(state.mesh);
    for (const s of state.slots) {
      if (!s) continue;
      rebuildSlotWeights(s, state.mesh);
    }
  }
  if (
    drag.type === "bone_head" ||
    drag.type === "bone_tip" ||
    drag.type === "bone_multi_move" ||
    drag.type === "bone_object_move" ||
    drag.type === "bone_object_scale" ||
    drag.type === "bone_object_rotate" ||
    drag.type === "vertex"
  ) {
    pushUndoCheckpoint(true);
  }
}

els.overlay.addEventListener("pointerup", clearDrag);
els.overlay.addEventListener("pointercancel", clearDrag);
els.overlay.addEventListener("pointerleave", () => {
  state.vertexDeform.hasCursor = false;
  state.objectHoverRoot = -1;
  state.objectScaleHoverRoot = -1;
  if (els.overlay) els.overlay.style.cursor = "";
});
els.overlay.addEventListener("contextmenu", (ev) => {
  ev.preventDefault();
});
els.overlay.addEventListener("dragstart", (ev) => {
  ev.preventDefault();
});
els.overlay.addEventListener(
  "wheel",
  (ev) => {
    if (!state.mesh && !(state.imageWidth > 0 && state.imageHeight > 0)) return;
    ev.preventDefault();
    const adjustVertexRadius =
      isVertexDeformInteractionActive() &&
      state.vertexDeform.proportional &&
      ev.altKey &&
      !ev.ctrlKey &&
      !ev.metaKey;
    if (adjustVertexRadius) {
      const step = ev.shiftKey ? 20 : 8;
      const dir = ev.deltaY > 0 ? -1 : 1;
      state.vertexDeform.radius = math.clamp((Number(state.vertexDeform.radius) || 80) + dir * step, 4, 400);
      refreshVertexDeformUI();
      setStatus(`Vertex proportional radius: ${Math.round(state.vertexDeform.radius)}px`);
      return;
    }
    const rect = els.overlay.getBoundingClientRect();
    const dpr = els.overlay.width / Math.max(1, rect.width);
    const sx = (ev.clientX - rect.left) * dpr;
    const sy = (ev.clientY - rect.top) * dpr;
    const factor = ev.deltaY > 0 ? 1 / 1.1 : 1.1;
    zoomViewBy(factor, sx, sy);
  },
  { passive: false }
);
window.addEventListener("resize", resize);
window.addEventListener("resize", () => {
  if (state.boneTreeMenuOpen) closeBoneTreeContextMenu();
  closeBoneDeleteQuickMenu();
});

setupLeftToolTabs();
setupWorkspaceTabs();
setupAnimateSubTabs();
mountAnimateAuxPanelsInLeftTools();
setupApplicationMenuBar();
render();
state.editMode =
  els.editMode && (els.editMode.value === "skeleton" || els.editMode.value === "mesh")
    ? els.editMode.value
    : "skeleton";
state.workspaceMode = state.editMode === "mesh" ? "slotmesh" : "rig";
state.uiPage = state.editMode === "mesh" ? "slot" : "rig";
state.boneMode = (els.boneMode && els.boneMode.value) || "edit";
state.weightMode = els.weightMode.value || "hard";
state.anim.loop = !!els.animLoop.checked;
state.anim.snap = !!els.animSnap.checked;
state.anim.fps = Math.max(1, Number(els.animFps.value) || 30);
state.anim.timeStep = Math.max(TIMELINE_MIN_STEP, Number(els.animTimeStep && els.animTimeStep.value) || TIMELINE_MIN_STEP);
state.slotViewMode = els.slotViewMode ? els.slotViewMode.value || "all" : "all";
state.slotMesh.toolMode = normalizeSlotMeshToolMode(state.slotMesh.toolMode);
state.view.panMode = !!state.view.panMode;
state.vertexDeform.proportional = els.vertexProportionalToggle ? !!els.vertexProportionalToggle.checked : true;
state.vertexDeform.mirror = els.vertexMirrorToggle ? !!els.vertexMirrorToggle.checked : false;
state.vertexDeform.heatmap = els.vertexHeatmapToggle ? !!els.vertexHeatmapToggle.checked : false;
state.vertexDeform.weightViz = els.vertexWeightVizToggle ? !!els.vertexWeightVizToggle.checked : false;
state.vertexDeform.weightVizMode = sanitizeWeightVizMode(els.vertexWeightVizMode && els.vertexWeightVizMode.value);
state.vertexDeform.weightVizOpacity = math.clamp(Number(els.vertexWeightVizOpacity && els.vertexWeightVizOpacity.value) || 0.75, 0.05, 1);
state.vertexDeform.radius = math.clamp(Number(els.vertexProportionalRadius && els.vertexProportionalRadius.value) || 80, 4, 400);
state.vertexDeform.falloff = sanitizeVertexFalloff(els.vertexProportionalFalloff && els.vertexProportionalFalloff.value);
state.poseAutoRig.sourceMode = sanitizePoseAutoRigSourceMode(els.setupHumanoidSourceMode && els.setupHumanoidSourceMode.value);
state.poseAutoRig.minScore = sanitizePoseAutoRigMinScore(els.setupHumanoidMinScore && els.setupHumanoidMinScore.value);
state.poseAutoRig.smoothing = els.setupHumanoidSmoothing ? !!els.setupHumanoidSmoothing.checked : true;
state.poseAutoRig.allowFallback = els.setupHumanoidFallback ? !!els.setupHumanoidFallback.checked : true;
syncPoseAutoRigOptionsToUI();
state.export.spineCompat = getSpineCompatPreset(els.spineCompat && els.spineCompat.value).id;
if (els.spineCompat) els.spineCompat.value = state.export.spineCompat;
ensureCurrentAnimation();
ensureOnionSkinSettings();
installStateMachineBridgeApi();
setAnimTime(Number(els.animTime.value) || 0);
refreshAnimationUI();
refreshSlotUI();
updateWorkspaceUI();
refreshViewPanUI();
refreshVertexDeformUI();
updatePlaybackButtons();
renderDiagnosticsUI();
pushUndoCheckpoint(true);
window.collectSlotBindingDebug = collectSlotBindingDebug;
window.collectAutosaveWeightDebug = collectAutosaveWeightDebug;
window.collectWeightedAttachmentIssues = collectWeightedAttachmentIssues;
window.addEventListener("beforeunload", () => {
  saveAutosaveSnapshot("beforeunload", true);
});
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") saveAutosaveSnapshot("hidden", true);
});
setStatus(
  `${hasGL ? "WebGL" : "2D fallback"} ready. Hotkeys: +/- zoom, 0 fit view, wheel zoom at cursor (vertex mode: Alt+wheel radius), A select all, Shift+A add bone, drag a selected handle to move all selected bones, Alt+drag force bone marquee, G/T/R tools, C connect, B bind slot to selected bone, Shift+B weighted bind, P parent pick, O proportional vertex toggle, [ ] radius, Vertex: H mirror, J heatmap, Shift/Ctrl+Click multi-select, drag box select, P pin, U unpin, M relax, Enter triangulate contour, L/U link edge, Del/X delete vertex, I/K key, Shift+K clip key, Shift+Alt+K clip end key, Space play, ,/. jump keys.`
);

void (async () => {
  await tryRestoreAutosaveAtStartup();
  state.autosave.ready = true;
  startAutosaveLoop();
})();

