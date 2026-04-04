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
    const next = normalizeSlotMeshToolMode(state.slotMesh.toolMode) === "add" ? "select" : "add";
    setSlotMeshToolMode(next, true);
  });
}
if (els.slotMeshGridReplaceContour) {
  els.slotMeshGridReplaceContour.addEventListener("change", () => {
    state.slotMesh.gridReplaceContour = !!els.slotMeshGridReplaceContour.checked;
  });
}
if (els.slotMeshCloseBtn) {
  els.slotMeshCloseBtn.addEventListener("click", () => {
    const slot = getActiveSlot();
    if (!slot) return;
    const c = ensureSlotContour(slot);
    markSlotContourDirty(slot, true);
    if (c.points.length < 3) {
      setStatus("Need at least 3 points to close contour.");
      return;
    }
    c.closed = true;
    c.triangles = [];
    c.fillPoints = [];
    c.fillTriangles = [];
    c.fillManualEdges = [];
    clearSlotMeshSelection();
    setStatus("Contour closed.");
  });
}
if (els.slotMeshTriangulateBtn) {
  els.slotMeshTriangulateBtn.addEventListener("click", () => {
    const slot = getActiveSlot();
    if (!slot) return;
    const c = ensureSlotContour(slot);
    markSlotContourDirty(slot, true);
    if (!c.closed || c.points.length < 3) {
      setStatus("Close contour first, then triangulate.");
      return;
    }
    // Filter triangles outside the contour (using the reusable helper)
    c.triangles = triangulateContourPoints(c.points, c.contourEdges, c.manualEdges);
    c.fillPoints = [];
    c.fillTriangles = [];
    c.fillManualEdges = [];
    if (c.triangles.length < 3) {
      setStatus("Triangulation failed. Adjust contour (avoid self-intersection).");
      return;
    }
    clearSlotMeshSelection();
    setStatus(`Triangulated preview: ${c.triangles.length / 3} triangles. Use Apply Mesh to commit.`);
  });
}
if (els.slotMeshGridFillBtn) {
  els.slotMeshGridFillBtn.addEventListener("click", () => {
    const slot = getActiveSlot();
    if (!slot) return;
    const c = ensureSlotContour(slot);
    markSlotContourDirty(slot, true);
    if (!c.closed || c.points.length < 3) {
      setStatus("Close contour first, then run Grid Fill.");
      return;
    }
    const replaceContour = !!state.slotMesh.gridReplaceContour;
    const sourceContourPoints = getSlotContourSourcePoints(c);
    if (sourceContourPoints.length < 3) {
      setStatus("Grid fill source contour is invalid. Re-draw contour points first.");
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
          return;
        }
        state.slotMesh.edgeSelection = [];
        state.slotMesh.edgeSelectionSet = "fill";
        state.slotMesh.activeSet = "fill";
        state.slotMesh.activePoint = Math.max(0, Math.min(state.slotMesh.activePoint, c.fillPoints.length - 1));
        replaced = true;
      }
      clearSlotMeshSelection();
      setStatus(
        `Grid fill generated: ${c.fillPoints.length} points, ${c.fillTriangles.length / 3} triangles. ${replaced ? `Contour replaced: ${c.points.length} points.` : "Contour replacement skipped."
        } Preview updated. Use Apply Mesh to commit.`
      );
      return;
    }
    clearSlotMeshSelection();
    setStatus(
      `Grid fill generated: ${c.fillPoints.length} points, ${c.fillTriangles.length / 3} triangles. Preview updated; use Apply Mesh to commit.`
    );
  });
}
if (els.slotMeshAutoForegroundBtn) {
  els.slotMeshAutoForegroundBtn.addEventListener("click", () => {
    const slot = getActiveSlot();
    if (!slot) return;
    markSlotContourDirty(slot, true);
    const result = autoBuildForegroundMeshForSlot(slot, Number(els.gridX.value) || 24, Number(els.gridY.value) || 24);
    if (!result || !result.ok) {
      setStatus(`Auto Foreground failed: ${(result && result.reason) || "unknown error"}`);
      return;
    }
    clearSlotMeshSelection();
    setStatus(`Auto Foreground preview: contour ${result.contourPoints}, fill ${result.fillPoints}, triangles ${result.triangles}.`);
  });
}
if (els.slotMeshApplyBtn) {
  els.slotMeshApplyBtn.addEventListener("click", () => {
    const slot = getActiveSlot();
    if (!slot) return;
    const ok = applyContourMeshToSlot(slot);
    if (!ok) {
      setStatus("Apply failed. Need a closed contour with valid triangulation.");
      return;
    }
    syncSlotContourFromMeshData(slot, true);
    clearSlotMeshSelection();
    setStatus("Slot mesh applied from contour.");
  });
}
if (els.slotMeshCreateApplyBtn) {
  els.slotMeshCreateApplyBtn.addEventListener("click", () => {
    const source = getActiveSlot();
    if (!source) return;
    const created = addContourSlotFromActiveSlot(source);
    if (!created) {
      setStatus("Create slot failed.");
      return;
    }
    created.meshContour = cloneSlotMeshContour(source.meshContour);
    const ok = applyContourMeshToSlot(created);
    if (!ok) {
      deleteActiveSlotQuick();
      setStatus("Create slot + apply failed. Need a closed contour with valid triangulation.");
      return;
    }
    syncSlotContourFromMeshData(created, true);
    clearSlotMeshSelection();
    setStatus(`Created slot "${created.name}" and applied contour mesh.`);
  });
}
if (els.slotMeshLinkEdgeBtn) {
  els.slotMeshLinkEdgeBtn.addEventListener("click", () => {
    const slot = getActiveSlot();
    if (!slot) return;
    const ok = linkSelectedSlotMeshEdge(true);
    const activeSet = state.slotMesh.activeSet === "fill" ? "fill" : "contour";
    if (!ok) {
      setStatus("Select exactly 2 vertices, then Link Edge.");
      return;
    }
    markSlotContourDirty(slot, true);
    setStatus(`Edge linked (${activeSet}).`);
  });
}
if (els.slotMeshUnlinkEdgeBtn) {
  els.slotMeshUnlinkEdgeBtn.addEventListener("click", () => {
    const slot = getActiveSlot();
    if (!slot) return;
    const ok = linkSelectedSlotMeshEdge(false);
    const activeSet = state.slotMesh.activeSet === "fill" ? "fill" : "contour";
    if (!ok) {
      setStatus("Select exactly 2 vertices, then Unlink Edge.");
      return;
    }
    markSlotContourDirty(slot, true);
    setStatus(`Edge unlinked (${activeSet}).`);
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
    const slot = getActiveSlot();
    if (!slot) return;
    markSlotContourDirty(slot, true);
    const c = ensureSlotContour(slot);
    const source = getSlotContourSourcePoints(c);
    if (Array.isArray(source) && source.length >= 3) {
      c.points = source.map((p) => ({ x: Number(p.x) || 0, y: Number(p.y) || 0 }));
      c.closed = true;
      c.manualEdges = [];
      c.triangles = applyManualEdgesToTriangles(c.points, triangulatePolygon(c.points), c.manualEdges);
      c.fillPoints = [];
      c.fillTriangles = [];
      c.fillManualEdges = [];
      clearSlotMeshSelection();
      setStatus("Slot mesh preview reset to source contour.");
      return;
    }
    if (resetSlotMeshToGrid(slot)) {
      clearSlotMeshSelection();
      setStatus("Slot mesh reset to grid.");
    }
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

if (els.boneWorkHidden) {
  els.boneWorkHidden.addEventListener("change", () => {
    const m = state.mesh;
    if (!m) return;
    const i = state.selectedBone;
    if (!Number.isFinite(i) || i < 0 || i >= m.rigBones.length) return;
    if (!isRootBoneIndex(m.rigBones, i)) {
      updateBoneUI();
      return;
    }
    const hidden = !!els.boneWorkHidden.checked;
    normalizeBoneChannels(m.rigBones[i]);
    m.rigBones[i].workHidden = hidden;
    if (m.poseBones[i]) {
      normalizeBoneChannels(m.poseBones[i]);
      m.poseBones[i].workHidden = hidden;
    }
    renderBoneTree();
    updateBoneUI();
    const hideScopeLabel = getGlobalBoneWorkHideMode() === "bone_and_slots" ? "bone+slots" : "bone only";
    setStatus(hidden ? `Work hide on (${hideScopeLabel}, subtree): ${m.rigBones[i].name}` : `Work hide off: ${m.rigBones[i].name}`);
  });
}

if (els.boneAnimHidden) {
  els.boneAnimHidden.addEventListener("change", () => {
    const m = state.mesh;
    if (!m || state.boneMode !== "pose") return;
    const i = state.selectedBone;
    const bones = getBonesForCurrentMode(m);
    if (!Number.isFinite(i) || i < 0 || i >= bones.length) return;
    if (!isRootBoneIndex(bones, i)) {
      updateBoneUI();
      return;
    }
    const hidden = !!els.boneAnimHidden.checked;
    normalizeBoneChannels(bones[i]);
    bones[i].animHidden = hidden;
    markDirtyByBoneProp(i, "animHide");
    renderBoneTree();
    updateBoneUI();
    setStatus(hidden ? `Anim hide on (subtree): ${bones[i].name}` : `Anim hide off: ${bones[i].name}`);
  });
}

if (els.boneAnimHideSetKeyBtn) {
  els.boneAnimHideSetKeyBtn.addEventListener("click", () => {
    if (!state.mesh || state.selectedBone < 0 || state.boneMode !== "pose") return;
    const trackId = getTrackId(state.selectedBone, "animHide");
    addOrUpdateKeyframeForTrack(trackId);
  });
}

if (els.boneAnimHideDelKeyBtn) {
  els.boneAnimHideDelKeyBtn.addEventListener("click", () => {
    if (!state.mesh || state.selectedBone < 0 || state.boneMode !== "pose") return;
    const trackId = getTrackId(state.selectedBone, "animHide");
    if (deleteKeyframeAtCurrentTimeForTrack(trackId)) {
      setStatus(`Hide key deleted: ${trackId} @ ${state.anim.time.toFixed(2)}s`);
    } else {
      setStatus(`No hide key at current time on ${trackId}.`);
    }
  });
}

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

