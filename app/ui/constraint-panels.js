// Split from app.js
// Part: IK, transform/path constraints, slot mesh, bone property bindings
// Original source: app/06-bindings-editor-panels.js (segment 2)
if (els.ikAdd1Btn) {
  els.ikAdd1Btn.addEventListener("click", () => {
    if (!addIKConstraint(false)) {
      setStatus("Add IK 1-Bone failed. Need at least one bone.");
      return;
    }
    const c = getActiveIKConstraint();
    const m = state.mesh;
    if (c && m) {
      const a = Number(c.bones && c.bones[0]);
      const t = Number(c.target);
      setStatus(`IK 1-Bone added: ${m.rigBones[a]?.name || a} -> target ${m.rigBones[t]?.name || t}.`);
    } else {
      setStatus("IK 1-Bone added.");
    }
  });
}
if (els.ikAdd2Btn) {
  els.ikAdd2Btn.addEventListener("click", () => {
    if (!addIKConstraint(true)) {
      setStatus("Add IK 2-Bone failed. Select a bone in a valid parent-child chain.");
      return;
    }
    const c = getActiveIKConstraint();
    const m = state.mesh;
    if (c && m && Array.isArray(c.bones) && c.bones.length >= 2) {
      const a = Number(c.bones[0]);
      const b = Number(c.bones[1]);
      const t = Number(c.target);
      setStatus(
        `IK 2-Bone added: ${m.rigBones[a]?.name || a} -> ${m.rigBones[b]?.name || b}, target ${m.rigBones[t]?.name || t}.`
      );
    } else {
      setStatus("IK 2-Bone added.");
    }
  });
}
if (els.ikMoveUpBtn) {
  els.ikMoveUpBtn.addEventListener("click", () => {
    const m = state.mesh;
    if (!m) return;
    const list = ensureIKConstraints(m);
    const i = state.selectedIK;
    if (i <= 0 || i >= list.length) return;
    const current = list[i];
    swapConstraintOrder(list, i, i - 1);
    sortConstraintListByOrder(list);
    state.selectedIK = list.indexOf(current);
    refreshIKUI();
    setStatus("IK moved up.");
  });
}
if (els.ikMoveDownBtn) {
  els.ikMoveDownBtn.addEventListener("click", () => {
    const m = state.mesh;
    if (!m) return;
    const list = ensureIKConstraints(m);
    const i = state.selectedIK;
    if (i < 0 || i >= list.length - 1) return;
    const current = list[i];
    swapConstraintOrder(list, i, i + 1);
    sortConstraintListByOrder(list);
    state.selectedIK = list.indexOf(current);
    refreshIKUI();
    setStatus("IK moved down.");
  });
}
if (els.ikRemoveBtn) {
  els.ikRemoveBtn.addEventListener("click", () => {
    if (!removeSelectedIKConstraint()) {
      setStatus("No IK constraint selected.");
      return;
    }
    setStatus("IK removed.");
  });
}
if (els.ikList) {
  els.ikList.addEventListener("click", (ev) => {
    const row = ev.target.closest("[data-ik-index]");
    if (!row) return;
    const idx = Number(row.dataset.ikIndex);
    if (!Number.isFinite(idx)) return;
    state.selectedIK = idx;
    refreshIKUI();
    selectActiveIKEndBone(true);
  });
}
if (els.ikSelect) {
  els.ikSelect.addEventListener("change", () => {
    state.selectedIK = Number(els.ikSelect.value);
    refreshIKUI();
    selectActiveIKEndBone(true);
  });
}
if (els.ikName) {
  els.ikName.addEventListener("input", () => {
    const c = getActiveIKConstraint();
    if (!c) return;
    c.name = els.ikName.value.trim() || `ik_${state.selectedIK}`;
    refreshIKUI();
    refreshTrackSelect();
    renderTimelineTracks();
  });
}
if (els.ikPickTargetBtn) {
  els.ikPickTargetBtn.addEventListener("click", () => {
    const c = getActiveIKConstraint();
    if (!c) return;
    state.ikPickArmed = !state.ikPickArmed;
    state.ikHoverBone = -1;
    refreshIKUI();
    renderBoneTree();
    setStatus(state.ikPickArmed ? "IK target pick armed: click a bone in canvas." : "IK target pick canceled.");
  });
}
if (els.ikEnabled) els.ikEnabled.addEventListener("change", applyActiveIKFromUI);
if (els.ikTargetBone) els.ikTargetBone.addEventListener("change", applyActiveIKFromUI);
if (els.ikBoneA) els.ikBoneA.addEventListener("change", applyActiveIKFromUI);
if (els.ikBoneB) els.ikBoneB.addEventListener("change", applyActiveIKFromUI);
if (els.ikEndMode) els.ikEndMode.addEventListener("change", applyActiveIKFromUI);
if (els.ikMix) els.ikMix.addEventListener("input", applyActiveIKFromUI);
if (els.ikSoftness) els.ikSoftness.addEventListener("input", applyActiveIKFromUI);
if (els.ikCompress) els.ikCompress.addEventListener("change", applyActiveIKFromUI);
if (els.ikStretch) els.ikStretch.addEventListener("change", applyActiveIKFromUI);
if (els.ikUniform) els.ikUniform.addEventListener("change", applyActiveIKFromUI);
if (els.ikSkinRequired) els.ikSkinRequired.addEventListener("change", applyActiveIKFromUI);
if (els.ikBendDir) els.ikBendDir.addEventListener("change", applyActiveIKFromUI);
if (els.tfcAddBtn) {
  els.tfcAddBtn.addEventListener("click", () => {
    if (!addTransformConstraint()) {
      setStatus("Add Transform failed. Need at least 2 bones.");
      return;
    }
    setStatus("Transform constraint added.");
  });
}
if (els.tfcRemoveBtn) {
  els.tfcRemoveBtn.addEventListener("click", () => {
    if (!removeSelectedTransformConstraint()) {
      setStatus("No Transform constraint selected.");
      return;
    }
    setStatus("Transform constraint removed.");
  });
}
if (els.tfcMoveUpBtn) {
  els.tfcMoveUpBtn.addEventListener("click", () => {
    const m = state.mesh;
    if (!m) return;
    const list = ensureTransformConstraints(m);
    const i = state.selectedTransform;
    if (i <= 0 || i >= list.length) return;
    const current = list[i];
    swapConstraintOrder(list, i, i - 1);
    sortConstraintListByOrder(list);
    state.selectedTransform = list.indexOf(current);
    refreshTransformUI();
    refreshTrackSelect();
    renderTimelineTracks();
    setStatus("Transform moved up.");
  });
}
if (els.tfcMoveDownBtn) {
  els.tfcMoveDownBtn.addEventListener("click", () => {
    const m = state.mesh;
    if (!m) return;
    const list = ensureTransformConstraints(m);
    const i = state.selectedTransform;
    if (i < 0 || i >= list.length - 1) return;
    const current = list[i];
    swapConstraintOrder(list, i, i + 1);
    sortConstraintListByOrder(list);
    state.selectedTransform = list.indexOf(current);
    refreshTransformUI();
    refreshTrackSelect();
    renderTimelineTracks();
    setStatus("Transform moved down.");
  });
}
if (els.tfcList) {
  els.tfcList.addEventListener("click", (ev) => {
    const row = ev.target.closest("[data-tfc-index]");
    if (!row) return;
    const idx = Number(row.dataset.tfcIndex);
    if (!Number.isFinite(idx)) return;
    state.selectedTransform = idx;
    refreshTransformUI();
  });
}
if (els.tfcSelect) {
  els.tfcSelect.addEventListener("change", () => {
    state.selectedTransform = Number(els.tfcSelect.value);
    refreshTransformUI();
  });
}
if (els.tfcName) {
  els.tfcName.addEventListener("input", () => {
    const c = getActiveTransformConstraint();
    if (!c) return;
    c.name = els.tfcName.value.trim() || `transform_${state.selectedTransform}`;
    refreshTransformUI();
    refreshTrackSelect();
    renderTimelineTracks();
  });
}
if (els.tfcEnabled) els.tfcEnabled.addEventListener("change", () => applyActiveTransformFromUI(false));
if (els.tfcTargetBone) els.tfcTargetBone.addEventListener("change", () => applyActiveTransformFromUI(false));
if (els.tfcBones) els.tfcBones.addEventListener("change", () => applyActiveTransformFromUI(true));
if (els.tfcLocal) els.tfcLocal.addEventListener("change", () => applyActiveTransformFromUI(false));
if (els.tfcRelative) els.tfcRelative.addEventListener("change", () => applyActiveTransformFromUI(false));
if (els.tfcRotateMix) els.tfcRotateMix.addEventListener("input", () => applyActiveTransformFromUI(false));
if (els.tfcTranslateMix) els.tfcTranslateMix.addEventListener("input", () => applyActiveTransformFromUI(false));
if (els.tfcScaleMix) els.tfcScaleMix.addEventListener("input", () => applyActiveTransformFromUI(false));
if (els.tfcShearMix) els.tfcShearMix.addEventListener("input", () => applyActiveTransformFromUI(false));
if (els.tfcOffsetX) els.tfcOffsetX.addEventListener("input", () => applyActiveTransformFromUI(false));
if (els.tfcOffsetY) els.tfcOffsetY.addEventListener("input", () => applyActiveTransformFromUI(false));
if (els.tfcOffsetRot) els.tfcOffsetRot.addEventListener("input", () => applyActiveTransformFromUI(false));
if (els.tfcOffsetScaleX) els.tfcOffsetScaleX.addEventListener("input", () => applyActiveTransformFromUI(false));
if (els.tfcOffsetScaleY) els.tfcOffsetScaleY.addEventListener("input", () => applyActiveTransformFromUI(false));
if (els.tfcOffsetShearY) els.tfcOffsetShearY.addEventListener("input", () => applyActiveTransformFromUI(false));
if (els.tfcSkinRequired) els.tfcSkinRequired.addEventListener("change", () => applyActiveTransformFromUI(false));
if (els.tfcBoneSearch) {
  els.tfcBoneSearch.addEventListener("input", () => {
    refreshTransformUI();
  });
}
if (els.tfcBonesAllBtn) {
  els.tfcBonesAllBtn.addEventListener("click", () => {
    if (!els.tfcBones) return;
    for (const opt of els.tfcBones.options) opt.selected = true;
    applyActiveTransformFromUI(true);
  });
}
if (els.tfcBonesClearBtn) {
  els.tfcBonesClearBtn.addEventListener("click", () => {
    if (!els.tfcBones) return;
    for (const opt of els.tfcBones.options) opt.selected = false;
    applyActiveTransformFromUI(true);
  });
}
if (els.tfcBonesInvertBtn) {
  els.tfcBonesInvertBtn.addEventListener("click", () => {
    if (!els.tfcBones) return;
    for (const opt of els.tfcBones.options) opt.selected = !opt.selected;
    applyActiveTransformFromUI(true);
  });
}
if (els.pathAddBtn) {
  els.pathAddBtn.addEventListener("click", () => {
    if (!addPathConstraint()) {
      setStatus("Add Path failed. Need at least 1 bone.");
      return;
    }
    state.editMode = "skeleton";
    if (els.editMode) els.editMode.value = "skeleton";
    setLeftToolTab("path");
    state.pathEdit.drawArmed = true;
    state.workspaceMode = "rig";
    updateWorkspaceUI();
    refreshTrackSelect();
    renderTimelineTracks();
    setStatus("Path constraint added. Draw mode armed: click canvas to add path points.");
  });
}
if (els.pathRemoveBtn) {
  els.pathRemoveBtn.addEventListener("click", () => {
    if (!removeSelectedPathConstraint()) {
      setStatus("No Path constraint selected.");
      return;
    }
    refreshTrackSelect();
    renderTimelineTracks();
    setStatus("Path constraint removed.");
  });
}
if (els.pathMoveUpBtn) {
  els.pathMoveUpBtn.addEventListener("click", () => {
    const m = state.mesh;
    if (!m) return;
    const list = ensurePathConstraints(m);
    const i = state.selectedPath;
    if (i <= 0 || i >= list.length) return;
    const current = list[i];
    swapConstraintOrder(list, i, i - 1);
    sortConstraintListByOrder(list);
    state.selectedPath = list.indexOf(current);
    refreshPathUI();
    refreshTrackSelect();
    renderTimelineTracks();
    setStatus("Path moved up.");
  });
}
if (els.pathMoveDownBtn) {
  els.pathMoveDownBtn.addEventListener("click", () => {
    const m = state.mesh;
    if (!m) return;
    const list = ensurePathConstraints(m);
    const i = state.selectedPath;
    if (i < 0 || i >= list.length - 1) return;
    const current = list[i];
    swapConstraintOrder(list, i, i + 1);
    sortConstraintListByOrder(list);
    state.selectedPath = list.indexOf(current);
    refreshPathUI();
    refreshTrackSelect();
    renderTimelineTracks();
    setStatus("Path moved down.");
  });
}
if (els.pathList) {
  els.pathList.addEventListener("click", (ev) => {
    const row = ev.target.closest("[data-path-index]");
    if (!row) return;
    const idx = Number(row.dataset.pathIndex);
    if (!Number.isFinite(idx)) return;
    state.selectedPath = idx;
    refreshPathUI();
  });
}
if (els.pathSelect) {
  els.pathSelect.addEventListener("change", () => {
    state.selectedPath = Number(els.pathSelect.value);
    refreshPathUI();
  });
}
if (els.pathName) {
  els.pathName.addEventListener("input", () => {
    const c = getActivePathConstraint();
    if (!c) return;
    c.name = els.pathName.value.trim() || `path_${state.selectedPath}`;
    refreshPathUI();
    refreshTrackSelect();
    renderTimelineTracks();
  });
}
if (els.pathTargetBone) els.pathTargetBone.addEventListener("change", () => applyActivePathFromUI(false));
if (els.pathSourceType) els.pathSourceType.addEventListener("change", () => applyActivePathFromUI(false));
if (els.pathTargetSlot) els.pathTargetSlot.addEventListener("change", () => applyActivePathFromUI(false));
if (els.pathEnabled) els.pathEnabled.addEventListener("change", () => applyActivePathFromUI(false));
if (els.pathBones) els.pathBones.addEventListener("change", () => applyActivePathFromUI(true));
if (els.pathPositionMode) els.pathPositionMode.addEventListener("change", () => applyActivePathFromUI(false));
if (els.pathSpacingMode) els.pathSpacingMode.addEventListener("change", () => applyActivePathFromUI(false));
if (els.pathRotateMode) els.pathRotateMode.addEventListener("change", () => applyActivePathFromUI(false));
if (els.pathPosition) els.pathPosition.addEventListener("input", () => applyActivePathFromUI(false));
if (els.pathSpacing) els.pathSpacing.addEventListener("input", () => applyActivePathFromUI(false));
if (els.pathRotateMix) els.pathRotateMix.addEventListener("input", () => applyActivePathFromUI(false));
if (els.pathTranslateMix) els.pathTranslateMix.addEventListener("input", () => applyActivePathFromUI(false));
if (els.pathSkinRequired) els.pathSkinRequired.addEventListener("change", () => applyActivePathFromUI(false));
if (els.pathClosed) els.pathClosed.addEventListener("change", () => applyActivePathFromUI(false));
if (els.pathDrawBtn) {
  els.pathDrawBtn.addEventListener("click", () => {
    if (!state.mesh || !getActivePathConstraint()) {
      setStatus("Select a Path constraint first.");
      return;
    }
    state.pathEdit.drawArmed = true;
    state.editMode = "skeleton";
    if (els.editMode) els.editMode.value = "skeleton";
    setLeftToolTab("path");
    updateWorkspaceUI();
    setStatus("Path draw armed: click canvas to add points.");
  });
}
if (els.pathStopDrawBtn) {
  els.pathStopDrawBtn.addEventListener("click", () => {
    state.pathEdit.drawArmed = false;
    setStatus("Path draw stopped.");
  });
}
if (els.pathCloseShapeBtn) {
  els.pathCloseShapeBtn.addEventListener("click", () => {
    if (!closeActivePathShape()) {
      setStatus("Need at least 3 points to close path.");
      return;
    }
    setStatus("Path closed.");
  });
}
if (els.pathClearShapeBtn) {
  els.pathClearShapeBtn.addEventListener("click", () => {
    if (!clearActivePathShape()) {
      setStatus("No active path.");
      return;
    }
    setStatus("Path shape cleared.");
  });
}
if (els.pathApplyHandleModeBtn) {
  els.pathApplyHandleModeBtn.addEventListener("click", () => {
    const mode = els.pathHandleMode ? els.pathHandleMode.value : "aligned";
    if (!applyHandleModeToSelectedPathPoint(mode)) {
      setStatus("Select a drawn path point first.");
      return;
    }
    setStatus(`Handle mode applied: ${mode}.`);
  });
}
if (els.slotMeshNewBtn) {
  els.slotMeshNewBtn.addEventListener("click", () => {
    const finishCapture = beginAICaptureCommand("mesh.tool.toggle_add_vertex", { buttonId: "slotMeshNewBtn" });
    const next = normalizeSlotMeshToolMode(state.slotMesh.toolMode) === "add" ? "select" : "add";
    setSlotMeshToolMode(next, true);
    finishCapture({ ok: true, nextMode: next });
  });
}
if (els.slotMeshBoundaryEditBtn) {
  els.slotMeshBoundaryEditBtn.addEventListener("click", () => {
    const finishCapture = beginAICaptureCommand("mesh.edit_target.boundary", { buttonId: "slotMeshBoundaryEditBtn" });
    setSlotMeshEditTarget("boundary", true);
    setSlotMeshToolMode("select", false);
    finishCapture({ ok: true, nextTarget: "boundary" });
  });
}
if (els.slotMeshGridEditBtn) {
  els.slotMeshGridEditBtn.addEventListener("click", () => {
    const finishCapture = beginAICaptureCommand("mesh.edit_target.grid", { buttonId: "slotMeshGridEditBtn" });
    setSlotMeshEditTarget("grid", true);
    setSlotMeshToolMode("select", false);
    finishCapture({ ok: true, nextTarget: "grid" });
  });
}
if (els.slotMeshGridReplaceContour) {
  els.slotMeshGridReplaceContour.addEventListener("change", () => {
    state.slotMesh.gridReplaceContour = !!els.slotMeshGridReplaceContour.checked;
  });
}
if (els.slotMeshCloseBtn) {
  els.slotMeshCloseBtn.addEventListener("click", () => {
    const finishCapture = beginAICaptureCommand("mesh.close_loop", { buttonId: "slotMeshCloseBtn" }, { topologyCommand: true });
    const slot = getActiveSlot();
    if (!slot) {
      finishCapture({ ok: false, reason: "no_active_slot" });
      return;
    }
    const c = ensureSlotContour(slot);
    markSlotContourDirty(slot, true);
    if (c.points.length < 3) {
      setStatus("Need at least 3 points to close contour.");
      finishCapture({ ok: false, reason: "not_enough_points", pointCount: c.points.length });
      return;
    }
    c.closed = true;
    c.triangles = [];
    c.fillPoints = [];
    c.fillTriangles = [];
    c.fillManualEdges = [];
    clearSlotMeshSelection();
    setStatus("Contour closed.");
    finishCapture({ ok: true, pointCount: c.points.length });
  });
}
if (els.slotMeshTriangulateBtn) {
  els.slotMeshTriangulateBtn.addEventListener("click", () => {
    const finishCapture = beginAICaptureCommand("mesh.triangulate_preview", { buttonId: "slotMeshTriangulateBtn" }, { topologyCommand: true });
    const slot = getActiveSlot();
    if (!slot) {
      finishCapture({ ok: false, reason: "no_active_slot" });
      return;
    }
    const c = ensureSlotContour(slot);
    markSlotContourDirty(slot, true);
    if (!c.closed || c.points.length < 3) {
      setStatus("Close contour first, then triangulate.");
      finishCapture({ ok: false, reason: "invalid_contour", closed: !!c.closed, pointCount: c.points.length });
      return;
    }
    // Filter triangles outside the contour (using the reusable helper)
    c.triangles = triangulateContourPoints(c.points, c.contourEdges, c.manualEdges);
    c.fillPoints = [];
    c.fillTriangles = [];
    c.fillManualEdges = [];
    if (c.triangles.length < 3) {
      setStatus("Triangulation failed. Adjust contour (avoid self-intersection).");
      finishCapture({ ok: false, reason: "triangulation_failed", triangleCount: 0 });
      return;
    }
    clearSlotMeshSelection();
    setStatus(`Triangulated preview: ${c.triangles.length / 3} triangles. Use Apply Mesh to commit.`);
    finishCapture({ ok: true, triangleCount: c.triangles.length / 3 });
  });
}
if (els.slotMeshGridFillBtn) {
  els.slotMeshGridFillBtn.addEventListener("click", () => {
    const finishCapture = beginAICaptureCommand("mesh.grid_fill_preview", { buttonId: "slotMeshGridFillBtn" }, { topologyCommand: true });
    const slot = getActiveSlot();
    if (!slot) {
      finishCapture({ ok: false, reason: "no_active_slot" });
      return;
    }
    const c = ensureSlotContour(slot);
    markSlotContourDirty(slot, true);
    if (!c.closed || c.points.length < 3) {
      setStatus("Close contour first, then run Grid Fill.");
      finishCapture({ ok: false, reason: "invalid_contour", closed: !!c.closed, pointCount: c.points.length });
      return;
    }
    const replaceContour = !!state.slotMesh.gridReplaceContour;
    const sourceContourPoints = getSlotContourSourcePoints(c);
    if (sourceContourPoints.length < 3) {
      setStatus("Grid fill source contour is invalid. Re-draw contour points first.");
      finishCapture({ ok: false, reason: "invalid_source_contour", sourcePointCount: sourceContourPoints.length });
      return;
    }
    const fill = buildUniformGridFillForContour(
      { closed: true, points: sourceContourPoints },
      Number(els.gridX.value) || 24,
      Number(els.gridY.value) || 24,
      !replaceContour
    );
    c.fillPoints = fill.points;
    c.fillManualEdges = normalizeEdgePairs(c.fillManualEdges, c.fillPoints.length);
    c.fillTriangles = buildSafeFillTriangles(c.fillPoints, fill.triangles, sourceContourPoints, c.fillManualEdges);
    if (c.fillTriangles.length < 3) {
      setStatus("Grid fill failed. Increase Grid X/Y or adjust contour.");
      finishCapture({ ok: false, reason: "grid_fill_failed", fillPointCount: c.fillPoints.length });
      return;
    }
    if (replaceContour) {
      const nextContour = Array.isArray(fill.contourPoints) ? fill.contourPoints : [];
      let replaced = false;
      if (nextContour.length >= 3) {
        c.points = nextContour.map((p) => ({ x: Number(p.x) || 0, y: Number(p.y) || 0 }));
        c.manualEdges = [];
        c.contourEdges = [];
        for (let i = 0; i < c.points.length; i++) {
          c.contourEdges.push([i, (i + 1) % c.points.length]);
        }
        c.triangles = [];
        c.closed = true;
        // Keep fill anchored to author contour to avoid cumulative shrink.
        c.fillTriangles = buildSafeFillTriangles(c.fillPoints, c.fillTriangles, sourceContourPoints, c.fillManualEdges);
        if (c.fillTriangles.length < 3) {
          c.fillPoints = [];
          c.fillManualEdges = [];
          setStatus("Grid fill contour replacement failed. Increase Grid X/Y or adjust contour.");
          finishCapture({ ok: false, reason: "contour_replacement_failed" });
          return;
        }
        state.slotMesh.edgeSelection = [];
        setSlotMeshEditTarget("grid", false);
        state.slotMesh.activePoint = Math.max(0, Math.min(state.slotMesh.activePoint, c.fillPoints.length - 1));
        replaced = true;
      }
      clearSlotMeshSelection();
      setSlotMeshEditTarget("grid", false);
      setStatus(
        `Grid fill generated: ${c.fillPoints.length} points, ${c.fillTriangles.length / 3} triangles. ${replaced ? `Contour replaced: ${c.points.length} points.` : "Contour replacement skipped."
        } Preview updated. Use Apply Mesh to commit.`
      );
      finishCapture({
        ok: true,
        replaceContour,
        fillPointCount: c.fillPoints.length,
        triangleCount: c.fillTriangles.length / 3,
        replaced,
      });
      return;
    }
    clearSlotMeshSelection();
    setSlotMeshEditTarget("grid", false);
    setStatus(
      `Grid fill generated: ${c.fillPoints.length} points, ${c.fillTriangles.length / 3} triangles. Preview updated; use Apply Mesh to commit.`
    );
    finishCapture({
      ok: true,
      replaceContour,
      fillPointCount: c.fillPoints.length,
      triangleCount: c.fillTriangles.length / 3,
      replaced: false,
    });
  });
}
if (els.slotMeshAutoForegroundBtn) {
  els.slotMeshAutoForegroundBtn.addEventListener("click", () => {
    const finishCapture = beginAICaptureCommand("mesh.auto_foreground_preview", { buttonId: "slotMeshAutoForegroundBtn" }, { topologyCommand: true });
    const slot = getActiveSlot();
    if (!slot) {
      finishCapture({ ok: false, reason: "no_active_slot" });
      return;
    }
    markSlotContourDirty(slot, true);
    const autoFgOpts = {
      alphaThreshold: els.autoFgAlphaThreshold ? Number(els.autoFgAlphaThreshold.value) : 8,
      padding: els.autoFgPadding ? Number(els.autoFgPadding.value) : 1,
      detail: els.autoFgDetail ? Number(els.autoFgDetail.value) : 1,
    };
    const result = autoBuildForegroundMeshForSlot(slot, Number(els.gridX.value) || 24, Number(els.gridY.value) || 24, autoFgOpts);
    if (!result || !result.ok) {
      setStatus(`Auto Foreground failed: ${(result && result.reason) || "unknown error"}`);
      finishCapture({ ok: false, reason: (result && result.reason) || "unknown_error" });
      return;
    }
    clearSlotMeshSelection();
    setStatus(`Auto Foreground preview: contour ${result.contourPoints}, fill ${result.fillPoints}, triangles ${result.triangles}.`);
    finishCapture({
      ok: true,
      contourPointCount: result.contourPoints,
      fillPointCount: result.fillPoints,
      triangleCount: result.triangles,
    });
  });
}
if (els.slotMeshApplyBtn) {
  els.slotMeshApplyBtn.addEventListener("click", () => {
    const finishCapture = beginAICaptureCommand("mesh.apply", { buttonId: "slotMeshApplyBtn" }, { topologyCommand: true });
    const slot = getActiveSlot();
    if (!slot) {
      finishCapture({ ok: false, reason: "no_active_slot" });
      return;
    }
    const ok = applyContourMeshToSlot(slot);
    if (!ok) {
      setStatus("Apply failed. Need a closed contour with valid triangulation.");
      finishCapture({ ok: false, reason: "apply_failed" });
      return;
    }
    syncSlotContourFromMeshData(slot, true);
    clearSlotMeshSelection();
    setStatus("Slot mesh applied from contour.");
    finishCapture({ ok: true });
  });
}
if (els.slotMeshCreateApplyBtn) {
  els.slotMeshCreateApplyBtn.addEventListener("click", () => {
    const finishCapture = beginAICaptureCommand("mesh.create_slot_and_apply", { buttonId: "slotMeshCreateApplyBtn" }, { topologyCommand: true });
    const source = getActiveSlot();
    if (!source) {
      finishCapture({ ok: false, reason: "no_active_slot" });
      return;
    }
    const created = addContourSlotFromActiveSlot(source);
    if (!created) {
      setStatus("Create slot failed.");
      finishCapture({ ok: false, reason: "create_slot_failed" });
      return;
    }
    created.meshContour = cloneSlotMeshContour(source.meshContour);
    const ok = applyContourMeshToSlot(created);
    if (!ok) {
      deleteActiveSlotQuick();
      setStatus("Create slot + apply failed. Need a closed contour with valid triangulation.");
      finishCapture({ ok: false, reason: "apply_failed" });
      return;
    }
    syncSlotContourFromMeshData(created, true);
    clearSlotMeshSelection();
    setStatus(`Created slot "${created.name}" and applied contour mesh.`);
    finishCapture({ ok: true, createdSlotName: created.name || "" });
  });
}
if (els.slotMeshLinkEdgeBtn) {
  els.slotMeshLinkEdgeBtn.addEventListener("click", () => {
    const finishCapture = beginAICaptureCommand("mesh.link_edge", { buttonId: "slotMeshLinkEdgeBtn" }, { topologyCommand: true });
    const slot = getActiveSlot();
    if (!slot) {
      finishCapture({ ok: false, reason: "no_active_slot" });
      return;
    }
    const ok = linkSelectedSlotMeshEdge(true);
    const activeSet = getSlotMeshEditSetName();
    if (!ok) {
      setStatus("Select exactly 2 vertices, then Link Edge.");
      finishCapture({ ok: false, reason: "invalid_selection", activeSet });
      return;
    }
    markSlotContourDirty(slot, true);
    setStatus(`Edge linked (${activeSet}).`);
    finishCapture({ ok: true, activeSet });
  });
}
if (els.slotMeshUnlinkEdgeBtn) {
  els.slotMeshUnlinkEdgeBtn.addEventListener("click", () => {
    const finishCapture = beginAICaptureCommand("mesh.unlink_edge", { buttonId: "slotMeshUnlinkEdgeBtn" }, { topologyCommand: true });
    const slot = getActiveSlot();
    if (!slot) {
      finishCapture({ ok: false, reason: "no_active_slot" });
      return;
    }
    const ok = linkSelectedSlotMeshEdge(false);
    const activeSet = getSlotMeshEditSetName();
    if (!ok) {
      setStatus("Select exactly 2 vertices, then Unlink Edge.");
      finishCapture({ ok: false, reason: "invalid_selection", activeSet });
      return;
    }
    markSlotContourDirty(slot, true);
    setStatus(`Edge unlinked (${activeSet}).`);
    finishCapture({ ok: true, activeSet });
  });
}
if (els.slotBindBoneBtn) {
  els.slotBindBoneBtn.addEventListener("click", () => {
    const bound = bindActiveSlotToSelectedBone();
    if (!bound) {
      setStatus("Bind failed. Select one or more target slots and a bone first.");
      return;
    }
    setStatus(buildSingleBindStatusMessage(bound, getPrimarySelectedBoneIndex()));
  });
}
if (els.slotBindWeightedBtn) {
  els.slotBindWeightedBtn.addEventListener("click", () => {
    const bound = bindActiveSlotWeightedToSelectedBones();
    if (!bound) {
      setStatus("Weighted bind failed. Select one or more target slots and bones first.");
      return;
    }
    setStatus(buildWeightedBindStatusMessage(bound, getSelectedBonesForWeight(state.mesh)));
  });
}
if (els.slotMeshResetBtn) {
  els.slotMeshResetBtn.addEventListener("click", () => {
    const finishCapture = beginAICaptureCommand("mesh.reset_to_grid", { buttonId: "slotMeshResetBtn" }, { topologyCommand: true });
    const slot = getActiveSlot();
    if (!slot) {
      finishCapture({ ok: false, reason: "no_active_slot" });
      return;
    }
    if (resetSlotMeshToGrid(slot)) {
      clearSlotMeshSelection();
      setStatus("Slot mesh reset to square grid. Editing: Grid.");
      finishCapture({ ok: true });
      return;
    }
    finishCapture({ ok: false, reason: "reset_failed" });
  });
}
if (els.slotMeshCaptureStartBtn) {
  els.slotMeshCaptureStartBtn.addEventListener("click", () => {
    startAICapture("mesh");
  });
}
if (els.slotMeshCaptureMarkBtn) {
  els.slotMeshCaptureMarkBtn.addEventListener("click", () => {
    markAICaptureIssue("User marked issue");
  });
}
if (els.slotMeshCaptureCopyBtn) {
  els.slotMeshCaptureCopyBtn.addEventListener("click", async () => {
    await copyAICaptureReport();
  });
}

els.boneName.addEventListener("input", () => {
  const m = state.mesh;
  if (!m || state.boneMode !== "edit") return;
  const b = m.rigBones[state.selectedBone];
  if (!b) return;
  b.name = els.boneName.value.trim() || `bone_${state.selectedBone}`;
  if (m.poseBones[state.selectedBone]) {
    m.poseBones[state.selectedBone].name = b.name;
  }
  updateBoneSelectors();
  els.boneSelect.value = String(state.selectedBone);
  els.boneParent.value = String(b.parent);
});

if (els.boneColor) {
  els.boneColor.addEventListener("input", () => {
    const m = state.mesh;
    if (!m) return;
    const b = m.rigBones[state.selectedBone];
    if (!b) return;
    const v = String(els.boneColor.value || "").trim();
    b.color = v && /^#?[0-9a-fA-F]{6}$/.test(v) ? (v.startsWith("#") ? v : "#" + v) : "";
    if (m.poseBones && m.poseBones[state.selectedBone]) {
      m.poseBones[state.selectedBone].color = b.color;
    }
    if (els.boneColor) els.boneColor.classList.toggle("color-active", !!b.color);
    if (typeof requestRender === "function") requestRender("bone-color");
  });
}
if (els.boneColorClearBtn) {
  els.boneColorClearBtn.addEventListener("click", () => {
    const m = state.mesh;
    if (!m) return;
    const b = m.rigBones[state.selectedBone];
    if (!b) return;
    b.color = "";
    if (m.poseBones && m.poseBones[state.selectedBone]) {
      m.poseBones[state.selectedBone].color = "";
    }
    if (els.boneColor) {
      els.boneColor.value = "#7dd3fc";
      els.boneColor.classList.remove("color-active");
    }
    if (typeof requestRender === "function") requestRender("bone-color-clear");
  });
}

els.boneParent.addEventListener("change", () => {
  const m = state.mesh;
  if (!m || state.boneMode !== "edit") return;
  const i = state.selectedBone;
  const newParent = Number(els.boneParent.value);
  if (!isValidParent(m.rigBones, i, newParent)) {
    updateBoneUI();
    setStatus("Invalid parent: would create a cycle.");
    return;
  }
  m.rigBones[i].parent = newParent;
  if (newParent >= 0) {
    m.rigBones[i].connected = true;
  }
  if (m.poseBones[i]) {
    m.poseBones[i].parent = newParent;
  }
  commitRigEdit(m, true);
  updateBoneUI();
});

if (els.boneInherit) {
  els.boneInherit.addEventListener("change", () => {
    const m = state.mesh;
    if (!m || state.boneMode !== "edit") return;
    const i = state.selectedBone;
    const b = m.rigBones[i];
    if (!b) return;
    b.inherit = normalizeBoneInheritValue(els.boneInherit.value);
    if (m.poseBones[i]) m.poseBones[i].inherit = b.inherit;
    commitRigEdit(m, false);
    updateBoneUI();
  });
}

els.boneTx.addEventListener("input", () => {
  const m = state.mesh;
  if (!m) return;
  const bones = getBonesForCurrentMode(m);
  const b = bones[state.selectedBone];
  if (!b) return;
  if (b.parent >= 0 && b.connected) return;
  const snapshot = state.boneMode === "edit" ? captureEditBoneSnapshot(bones) : null;
  b.tx = Number(els.boneTx.value) || 0;
  if (state.boneMode === "edit") {
    preserveConnectedChildTipsAfterEdit(bones, snapshot, [state.selectedBone]);
  }
  markDirtyByBoneProp(state.selectedBone, "translate");
  if (state.boneMode === "edit") {
    commitRigEdit(m, true);
  }
  updateBoneUI();
});

els.boneTy.addEventListener("input", () => {
  const m = state.mesh;
  if (!m) return;
  const bones = getBonesForCurrentMode(m);
  const b = bones[state.selectedBone];
  if (!b) return;
  if (b.parent >= 0 && b.connected) return;
  const snapshot = state.boneMode === "edit" ? captureEditBoneSnapshot(bones) : null;
  b.ty = Number(els.boneTy.value) || 0;
  if (state.boneMode === "edit") {
    preserveConnectedChildTipsAfterEdit(bones, snapshot, [state.selectedBone]);
  }
  markDirtyByBoneProp(state.selectedBone, "translate");
  if (state.boneMode === "edit") {
    commitRigEdit(m, true);
  }
  updateBoneUI();
});

els.boneRot.addEventListener("input", () => {
  const m = state.mesh;
  if (!m) return;
  const bones = getBonesForCurrentMode(m);
  const b = bones[state.selectedBone];
  if (!b) return;
  const snapshot = state.boneMode === "edit" ? captureEditBoneSnapshot(bones) : null;
  b.rot = math.degToRad(Number(els.boneRot.value) || 0);
  if (state.boneMode === "edit") {
    preserveConnectedChildTipsAfterEdit(bones, snapshot, [state.selectedBone]);
  }
  if (state.boneMode === "pose") {
    steerIKTargetFromBoneEdit(m, state.selectedBone, null);
  }
  markDirtyByBoneProp(state.selectedBone, "rotate");
  if (state.boneMode === "edit") {
    commitRigEdit(m, true);
  }
  updateBoneUI();
});

els.boneLen.addEventListener("input", () => {
  const m = state.mesh;
  if (!m) return;
  const bones = getBonesForCurrentMode(m);
  const b = bones[state.selectedBone];
  if (!b) return;
  // Length is part of the rest pose. Block edits whenever we're in any
  // animate sub-mode (pose / object), unless the user has explicitly opted
  // in via Pose Length: Allow on this bone.
  const sysMode = typeof getCurrentSystemMode === "function" ? getCurrentSystemMode() : "setup";
  if (sysMode === "animate" && b.poseLenEditable !== true) {
    if (els.boneLen) els.boneLen.value = String(Math.max(1, Math.round(b.length)));
    return;
  }
  if (state.boneMode === "pose" && b.poseLenEditable === false) return;
  const snapshot = state.boneMode === "edit" ? captureEditBoneSnapshot(bones) : null;
  b.length = Math.max(1, Number(els.boneLen.value) || 1);
  if (state.boneMode === "edit") {
    preserveConnectedChildTipsAfterEdit(bones, snapshot, [state.selectedBone]);
  }
  if (state.boneMode === "pose") {
    steerIKTargetFromBoneEdit(m, state.selectedBone, null);
  }
  markDirtyByBoneProp(state.selectedBone, "scale");
  if (state.boneMode === "edit") {
    commitRigEdit(m, true);
  }
  updateBoneUI();
});

if (els.boneScaleX) {
  els.boneScaleX.addEventListener("input", () => {
    const m = state.mesh;
    if (!m) return;
    const b = getBonesForCurrentMode(m)[state.selectedBone];
    if (!b) return;
    normalizeBoneChannels(b);
    b.sx = Number(els.boneScaleX.value) || 1;
    markDirtyByBoneProp(state.selectedBone, "scaleX");
    if (state.boneMode === "edit") commitRigEdit(m, true);
    updateBoneUI();
  });
}
if (els.boneScaleY) {
  els.boneScaleY.addEventListener("input", () => {
    const m = state.mesh;
    if (!m) return;
    const b = getBonesForCurrentMode(m)[state.selectedBone];
    if (!b) return;
    normalizeBoneChannels(b);
    b.sy = Number(els.boneScaleY.value) || 1;
    markDirtyByBoneProp(state.selectedBone, "scaleY");
    if (state.boneMode === "edit") commitRigEdit(m, true);
    updateBoneUI();
  });
}
if (els.boneShearX) {
  els.boneShearX.addEventListener("input", () => {
    const m = state.mesh;
    if (!m) return;
    const b = getBonesForCurrentMode(m)[state.selectedBone];
    if (!b) return;
    normalizeBoneChannels(b);
    b.shx = math.degToRad(Number(els.boneShearX.value) || 0);
    markDirtyByBoneProp(state.selectedBone, "shearX");
    if (state.boneMode === "edit") commitRigEdit(m, true);
    updateBoneUI();
  });
}
if (els.boneShearY) {
  els.boneShearY.addEventListener("input", () => {
    const m = state.mesh;
    if (!m) return;
    const b = getBonesForCurrentMode(m)[state.selectedBone];
    if (!b) return;
    normalizeBoneChannels(b);
    b.shy = math.degToRad(Number(els.boneShearY.value) || 0);
    markDirtyByBoneProp(state.selectedBone, "shearY");
    if (state.boneMode === "edit") commitRigEdit(m, true);
    updateBoneUI();
  });
}

els.boneConnect.addEventListener("change", () => {
  const m = state.mesh;
  if (!m) return;
  const i = state.selectedBone;
  const connected = els.boneConnect.value === "true";
  if (m.rigBones[i]) m.rigBones[i].connected = connected;
  if (m.poseBones[i]) m.poseBones[i].connected = connected;
  enforceConnectedHeads(m.rigBones);
  enforceConnectedHeads(m.poseBones);
  if (state.boneMode === "edit") {
    commitRigEdit(m, true);
  }
  updateBoneUI();
});

els.bonePoseLen.addEventListener("change", () => {
  const m = state.mesh;
  if (!m) return;
  const i = state.selectedBone;
  const editable = els.bonePoseLen.value === "true";
  if (m.rigBones[i]) m.rigBones[i].poseLenEditable = editable;
  if (m.poseBones[i]) m.poseBones[i].poseLenEditable = editable;
  updateBoneUI();
});


function applyHeadTipFromInputs() {
  const m = state.mesh;
  if (!m) return;
  const i = state.selectedBone;
  const bones = getBonesForCurrentMode(m);
  const b = bones[i];
  if (!b) return;
  const snapshot = state.boneMode === "edit" ? captureEditBoneSnapshot(bones) : null;
  const hx = Number(els.boneHeadX.value);
  const hy = Number(els.boneHeadY.value);
  const tx = Number(els.boneTipX.value);
  const ty = Number(els.boneTipY.value);
  const head = {
    x: Number.isFinite(hx) ? hx : 0,
    y: Number.isFinite(hy) ? hy : 0,
  };
  const tip = {
    x: Number.isFinite(tx) ? tx : head.x + Math.max(1, b.length),
    y: Number.isFinite(ty) ? ty : head.y,
  };
  if (state.boneMode === "edit" && b.parent >= 0 && b.connected) {
    const parentIndex = Number(b.parent);
    if (Number.isFinite(parentIndex) && parentIndex >= 0 && parentIndex < bones.length) {
      const parentEp = getBoneWorldEndpointsFromBones(bones, parentIndex);
      setBoneFromWorldEndpoints(bones, parentIndex, parentEp.head, head);
      markRigEditDirty();
    }
  }
  const resolvedHead = b.parent >= 0 && b.connected ? getBoneWorldEndpointsFromBones(bones, i).head : head;
  if (state.boneMode === "pose" && b.poseLenEditable === false) {
    const a = angleTo(resolvedHead, tip);
    tip.x = resolvedHead.x + Math.cos(a) * b.length;
    tip.y = resolvedHead.y + Math.sin(a) * b.length;
  }
  setBoneFromWorldEndpoints(bones, i, resolvedHead, tip);
  if (state.boneMode === "edit") {
    const activeId = document.activeElement && document.activeElement.id ? String(document.activeElement.id) : "";
    const editingTip = activeId === "boneTipX" || activeId === "boneTipY";
    const editingHead = activeId === "boneHeadX" || activeId === "boneHeadY";
    let exclude = [i];
    if (b.parent >= 0 && b.connected && editingHead) {
      exclude = [Number(b.parent)];
    } else if (editingTip) {
      exclude = [i];
    }
    preserveConnectedChildTipsAfterEdit(bones, snapshot, exclude);
  }
  if (state.boneMode === "pose") {
    steerIKTargetFromBoneEdit(m, i, tip);
  }
  markDirtyByBoneProp(i, "translate");
  markDirtyByBoneProp(i, "rotate");
  markDirtyByBoneProp(i, "scale");
  if (state.boneMode === "edit") {
    commitRigEdit(m, true);
  }
  updateBoneUI();
}

els.boneHeadX.addEventListener("input", applyHeadTipFromInputs);
els.boneHeadY.addEventListener("input", applyHeadTipFromInputs);
els.boneTipX.addEventListener("input", applyHeadTipFromInputs);
els.boneTipY.addEventListener("input", applyHeadTipFromInputs);
