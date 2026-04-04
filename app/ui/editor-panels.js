// Split from app.js
// Part: Setup, diagnostics, workspace, bone/skin/slot quick bindings
// Original source: app/06-bindings-editor-panels.js (segment 1)
if (els.projectLoadInput) {
  els.projectLoadInput.addEventListener("change", handleProjectLoadInputChange);
}

if (els.diagnosticsRunBtn) {
  els.diagnosticsRunBtn.addEventListener("click", () => {
    const includeExport = els.diagnosticsExportCheck ? !!els.diagnosticsExportCheck.checked : true;
    runDiagnostics({ includeExport });
  });
}
if (els.diagnosticsAutoFixBtn) {
  els.diagnosticsAutoFixBtn.addEventListener("click", () => {
    applyDiagnosticsSafeFixes();
    const includeExport = els.diagnosticsExportCheck ? !!els.diagnosticsExportCheck.checked : true;
    runDiagnostics({ includeExport });
  });
}
if (els.diagnosticsClearBtn) {
  els.diagnosticsClearBtn.addEventListener("click", () => {
    state.diagnostics.issues = [];
    state.diagnostics.lastRunAt = Date.now();
    renderDiagnosticsUI();
    setStatus("Diagnostics list cleared.");
  });
}
if (els.diagnosticsList) {
  els.diagnosticsList.addEventListener("click", (ev) => {
    const row = ev.target.closest(".diag-item");
    if (!row || !row.dataset.action) return;
    try {
      const action = JSON.parse(row.dataset.action);
      focusDiagnosticsAction(action);
    } catch {
      // ignore
    }
  });
}

ensureSetupQuickUIElements();
els.remeshBtn.addEventListener("click", rebuildMesh);
if (els.setupAddBoneBtn) {
  els.setupAddBoneBtn.addEventListener("click", () => {
    if (els.addBoneBtn) els.addBoneBtn.click();
  });
}
if (els.setupDeleteBoneBtn) {
  els.setupDeleteBoneBtn.addEventListener("click", () => {
    if (els.deleteBoneBtn) els.deleteBoneBtn.click();
  });
}
bindSetupHumanoidBoneButton();
bindBoneTreeHumanoidBoneButton();
if (els.setupBindBoneBtn) {
  els.setupBindBoneBtn.addEventListener("click", () => {
    if (els.slotBindBoneBtn) els.slotBindBoneBtn.click();
  });
}
if (els.setupBindWeightedBtn) {
  els.setupBindWeightedBtn.addEventListener("click", () => {
    if (els.slotBindWeightedBtn) els.slotBindWeightedBtn.click();
  });
}
if (els.setupEditWeightsBtn) {
  els.setupEditWeightsBtn.addEventListener("click", () => {
    if (els.slotWeightQuickEditBtn) els.slotWeightQuickEditBtn.click();
  });
}
if (els.setupAutoWeightSingleBtn) {
  els.setupAutoWeightSingleBtn.addEventListener("click", () => {
    if (els.weightMode) {
      els.weightMode.value = "hard";
      els.weightMode.dispatchEvent(new Event("change"));
    } else {
      state.weightMode = "hard";
    }
    const updated = autoWeightActiveSlot("single");
    if (updated > 0) {
      const picked = state.mesh ? getSelectedBonesForWeight(state.mesh) : [];
      const targetLabel = state.slots.length > 0 ? `${updated} slot(s)` : "mesh";
      setStatus(
        `Auto weights updated (single) on ${targetLabel}; bones: ${picked.length > 0 ? picked.join(", ") : "(slot default)"}`
      );
    }
    refreshSetupQuickActions();
  });
}
if (els.setupAutoWeightMultiBtn) {
  els.setupAutoWeightMultiBtn.addEventListener("click", () => {
    if (els.weightMode) {
      els.weightMode.value = "soft";
      els.weightMode.dispatchEvent(new Event("change"));
    } else {
      state.weightMode = "soft";
    }
    const updated = autoWeightActiveSlot("weighted");
    if (updated > 0) {
      const picked = state.mesh ? getSelectedBonesForWeight(state.mesh) : [];
      const targetLabel = state.slots.length > 0 ? `${updated} slot(s)` : "mesh";
      setStatus(
        `Auto weights updated (multi) on ${targetLabel}; bones: ${picked.length > 0 ? picked.join(", ") : "(slot default)"}`
      );
    }
    refreshSetupQuickActions();
  });
}

els.editMode.addEventListener("change", () => {
  const prevMode = state.boneMode;
  const v = els.editMode.value;
  const sysMode = els.systemMode ? els.systemMode.value : "setup";
  state.editMode = v === "mesh" ? "mesh" : v === "object" ? "object" : "skeleton";
  if (state.editMode === "object") {
    state.boneMode = "object";
    state.uiPage = sysMode === "animate" ? "anim" : "object";
    if (sysMode === "animate") state.animSubPanel = "timeline";
    setLeftToolTab("object");
  } else if (state.editMode === "mesh") {
    state.uiPage = sysMode === "animate" ? "anim" : "slot";
    if (sysMode === "animate") state.animSubPanel = "timeline";
    if (state.leftToolTab !== "slotmesh" && state.leftToolTab !== "canvas") setLeftToolTab("slotmesh");
  } else {
    state.uiPage = sysMode === "animate" ? "anim" : "rig";
    state.boneMode = sysMode === "animate" ? "pose" : "edit";
    if (sysMode === "animate") state.animSubPanel = "timeline";
    if (state.leftToolTab === "slotmesh" || state.leftToolTab === "canvas" || state.leftToolTab === "object") {
      setLeftToolTab("setup");
    }
  }
  if (state.editMode !== "skeleton" && state.editMode !== "object") state.pathEdit.drawArmed = false;
  state.workspaceMode = state.editMode === "mesh" ? "slotmesh" : "rig";
  applyBoneModeTransition(prevMode, state.boneMode);
  updateWorkspaceUI();
});
if (els.systemMode) els.systemMode.addEventListener("change", () => {
  const prevMode = state.boneMode;
  const sysMode = els.systemMode.value;
  if (sysMode === "animate") {
    state.uiPage = "anim";
    state.animSubPanel = "timeline";
    state.boneMode = state.editMode === "object" ? "object" : "pose";
    if (state.mesh && state.boneMode === "pose") {
      syncPoseFromRig(state.mesh);
      samplePoseAtTime(state.mesh, state.anim.time);
    }
  } else {
    if (state.uiPage === "anim") {
      if (state.editMode === "mesh") state.uiPage = "slot";
      else if (state.editMode === "object") state.uiPage = "object";
      else state.uiPage = "rig";
    }
    state.boneMode = state.editMode === "object" ? "object" : "edit";
    state.addBoneArmed = false;
    state.addBoneDraft = null;
    els.addBoneBtn.textContent = "Add Bone";
    refreshSetupQuickActions();
  }
  applyBoneModeTransition(prevMode, state.boneMode);
  updateWorkspaceUI();
  updateBoneUI();
});

els.boneSelect.addEventListener("change", () => {
  if (!state.mesh) return;
  const v = Number(els.boneSelect.value);
  state.selectedBone = Number.isFinite(v) ? v : -1;
  state.selectedBonesForWeight = state.selectedBone >= 0 ? [state.selectedBone] : [];
  setRightPropsFocus("bone");
  updateBoneUI();
});

els.addBoneBtn.addEventListener("click", () => {
  if (!state.mesh || state.boneMode !== "edit") return;
  state.addBoneArmed = !state.addBoneArmed;
  state.addBoneDraft = null;
  els.addBoneBtn.textContent = state.addBoneArmed ? "Cancel Add" : "Add Bone";
  refreshSetupQuickActions();
  setStatus(state.addBoneArmed ? "Add bone armed: drag in canvas to create." : "Add bone canceled.");
});
els.deleteBoneBtn.addEventListener("click", () => {
  const info = getSelectedBoneDeleteInfo();
  const m = state.mesh;
  if (!m || !info.canDelete) {
    setStatus("Delete bone failed.");
    return;
  }
  const bi = Number(info.boneIndex);
  const name = Number.isFinite(bi) && bi >= 0 && bi < m.rigBones.length ? String(m.rigBones[bi].name || `bone_${bi}`) : "bone";
  if (!deleteBone()) {
    setStatus("Delete bone failed.");
    return;
  }
  setStatus(info.mode === "subtree" ? `Bone tree deleted: ${name} (slots moved to staging).` : `Bone deleted: ${name} (slots moved to staging).`);
});
els.autoWeightBtn.addEventListener("click", () => {
  if (!state.mesh) return;
  if (state.boneMode !== "edit") return;
  const updated = autoWeightActiveSlot();
  if (updated > 0) {
    const picked = getSelectedBonesForWeight(state.mesh);
    const targetLabel = state.slots.length > 0 ? `${updated} slot(s)` : "mesh";
    setStatus(
      `Auto weights updated (${state.weightMode}) on ${targetLabel}; bones: ${picked.length > 0 ? picked.join(", ") : "(slot default)"
      }.`
    );
  }
});
els.weightMode.addEventListener("change", () => {
  state.weightMode = els.weightMode.value;
  refreshSetupQuickActions();
});
if (els.skinSelect) {
  els.skinSelect.addEventListener("change", () => {
    state.selectedSkinSet = Number(els.skinSelect.value) || 0;
    refreshSkinUI();
  });
}
if (els.activeSkinSelect) {
  els.activeSkinSelect.addEventListener("change", () => {
    state.selectedSkinSet = Number(els.activeSkinSelect.value) || 0;
    refreshSkinUI();
    applySelectedSkinSetWithStatus();
  });
}
if (els.skinName) {
  els.skinName.addEventListener("input", () => {
    const skin = getSelectedSkinSet();
    if (!skin) return;
    skin.name = String(els.skinName.value || "").trim() || skin.name || "skin";
    refreshSkinUI();
  });
}
if (els.skinAddBtn) {
  els.skinAddBtn.addEventListener("click", () => {
    const skin = addSkinSetFromCurrentState();
    setStatus(`Skin added: ${skin.name}`);
  });
}
if (els.activeSkinAddBtn) {
  els.activeSkinAddBtn.addEventListener("click", () => {
    const skin = addSkinSetFromCurrentState();
    setStatus(`Skin added: ${skin.name}`);
  });
}
if (els.skinDeleteBtn) {
  els.skinDeleteBtn.addEventListener("click", () => {
    const list = ensureSkinSets();
    if (list.length <= 1) {
      setStatus("Keep at least one skin.");
      return;
    }
    const idx = Number(state.selectedSkinSet) || 0;
    const removed = list.splice(Math.max(0, Math.min(idx, list.length - 1)), 1)[0];
    state.selectedSkinSet = Math.max(0, Math.min(idx, list.length - 1));
    refreshSkinUI();
    setStatus(`Skin deleted: ${removed && removed.name ? removed.name : "skin"}`);
  });
}
if (els.skinCaptureBtn) {
  els.skinCaptureBtn.addEventListener("click", () => {
    const skin = captureSelectedSkinSetFromCurrentState();
    if (!skin) return;
    setStatus(`Skin captured: ${skin.name}`);
  });
}
if (els.activeSkinCaptureBtn) {
  els.activeSkinCaptureBtn.addEventListener("click", () => {
    const skin = captureSelectedSkinSetFromCurrentState();
    if (!skin) return;
    setStatus(`Skin captured: ${skin.name}`);
  });
}
if (els.skinApplyBtn) {
  els.skinApplyBtn.addEventListener("click", () => {
    applySelectedSkinSetWithStatus();
  });
}
if (els.activeSkinApplyBtn) {
  els.activeSkinApplyBtn.addEventListener("click", () => {
    applySelectedSkinSetWithStatus();
  });
}
if (els.slotQuickAddBtn) {
  els.slotQuickAddBtn.addEventListener("click", () => {
    const slot = addEmptySlotQuick();
    if (!slot) {
      setStatus("Import image/PSD first, then add slot.");
      return;
    }
    pushUndoCheckpoint(true);
    setStatus(`Empty slot added: ${slot.name}`);
  });
}
if (els.treeCtxSlotAddBtn) {
  els.treeCtxSlotAddBtn.addEventListener("click", () => {
    const slot = addEmptySlotQuick();
    if (!slot) {
      setStatus("Import image/PSD first, then add slot.");
      closeBoneTreeContextMenu();
      return;
    }
    pushUndoCheckpoint(true);
    setStatus(`Empty slot added: ${slot.name}`);
    closeBoneTreeContextMenu();
  });
}
if (els.slotQuickDupBtn) {
  els.slotQuickDupBtn.addEventListener("click", () => {
    const slot = duplicateActiveSlotQuick();
    if (!slot) {
      setStatus("No active slot to duplicate.");
      return;
    }
    pushUndoCheckpoint(true);
    setStatus(`Slot duplicated: ${slot.name}`);
  });
}
if (els.treeCtxSlotDupBtn) {
  els.treeCtxSlotDupBtn.addEventListener("click", () => {
    const slot = duplicateActiveSlotQuick();
    if (!slot) {
      setStatus("No active slot to duplicate.");
      closeBoneTreeContextMenu();
      return;
    }
    pushUndoCheckpoint(true);
    setStatus(`Slot duplicated: ${slot.name}`);
    closeBoneTreeContextMenu();
  });
}
if (els.treeCtxSlotRenameBtn) {
  els.treeCtxSlotRenameBtn.addEventListener("click", () => {
    const active = getActiveSlot();
    if (!active) {
      setStatus("Select an active slot to rename.");
      closeBoneTreeContextMenu();
      return;
    }
    renameSlotByIndexFromTree(state.activeSlot);
    closeBoneTreeContextMenu();
  });
}
if (els.slotQuickDeleteBtn) {
  els.slotQuickDeleteBtn.addEventListener("click", () => {
    const removed = deleteActiveSlotQuick();
    if (!removed) {
      setStatus("No active slot to delete.");
      return;
    }
    pushUndoCheckpoint(true);
    setStatus(`Slot deleted: ${removed.name || "slot"}`);
  });
}
if (els.treeCtxSlotDeleteBtn) {
  els.treeCtxSlotDeleteBtn.addEventListener("click", () => {
    const removed = deleteActiveSlotQuick();
    if (!removed) {
      setStatus("No active slot to delete.");
      closeBoneTreeContextMenu();
      return;
    }
    pushUndoCheckpoint(true);
    setStatus(`Slot deleted: ${removed.name || "slot"}`);
    closeBoneTreeContextMenu();
  });
}
if (els.treeCtxBoneDeleteBtn) {
  els.treeCtxBoneDeleteBtn.addEventListener("click", () => {
    const info = getSelectedBoneDeleteInfo();
    const m = state.mesh;
    if (!m || state.boneTreeMenuContextKind !== "bone") {
      setStatus("Right-click a bone row first.");
      closeBoneTreeContextMenu();
      return;
    }
    const bi = Number(info.boneIndex);
    const name =
      Number.isFinite(bi) && bi >= 0 && bi < m.rigBones.length ? String(m.rigBones[bi].name || `bone_${bi}`) : "bone";
    if (!deleteSelectedBoneTreeWithSlotPolicy("to_staging")) {
      setStatus("Delete bone failed.");
      closeBoneTreeContextMenu();
      return;
    }
    setStatus(info.mode === "subtree" ? `Bone tree deleted: ${name} (slots moved to staging).` : `Bone deleted: ${name} (slots moved to staging).`);
    closeBoneTreeContextMenu();
  });
}
if (els.treeCtxBoneDeleteWithSlotsBtn) {
  els.treeCtxBoneDeleteWithSlotsBtn.addEventListener("click", () => {
    const info = getSelectedBoneDeleteInfo();
    const m = state.mesh;
    if (!m || state.boneTreeMenuContextKind !== "bone") {
      setStatus("Right-click a bone row first.");
      closeBoneTreeContextMenu();
      return;
    }
    const bi = Number(info.boneIndex);
    const name =
      Number.isFinite(bi) && bi >= 0 && bi < m.rigBones.length ? String(m.rigBones[bi].name || `bone_${bi}`) : "bone";
    if (!deleteSelectedBoneTreeWithSlotPolicy("delete_slots")) {
      setStatus("Delete bone failed.");
      closeBoneTreeContextMenu();
      return;
    }
    setStatus(info.mode === "subtree" ? `Bone tree deleted: ${name} (bound slots deleted).` : `Bone deleted: ${name} (bound slots deleted).`);
    closeBoneTreeContextMenu();
  });
}
if (els.treeCtxSlotLoadImageBtn) {
  els.treeCtxSlotLoadImageBtn.addEventListener("click", () => {
    if (!openLoadImageForActiveSlotFromTree()) {
      setStatus("Select an active slot with a valid attachment first.");
    }
    closeBoneTreeContextMenu();
  });
}
els.resetPoseBtn.addEventListener("click", resetPose);
els.resetVertexBtn.addEventListener("click", resetVertexOffsets);
if (els.vertexProportionalToggle) {
  els.vertexProportionalToggle.addEventListener("change", () => {
    state.vertexDeform.proportional = !!els.vertexProportionalToggle.checked;
    refreshVertexDeformUI();
    setStatus(`Vertex proportional edit ${state.vertexDeform.proportional ? "ON" : "OFF"}.`);
  });
}
if (els.vertexMirrorToggle) {
  els.vertexMirrorToggle.addEventListener("change", () => {
    state.vertexDeform.mirror = !!els.vertexMirrorToggle.checked;
    refreshVertexDeformUI();
    setStatus(`Vertex mirror edit ${state.vertexDeform.mirror ? "ON" : "OFF"}.`);
  });
}
if (els.vertexHeatmapToggle) {
  els.vertexHeatmapToggle.addEventListener("change", () => {
    state.vertexDeform.heatmap = !!els.vertexHeatmapToggle.checked;
    refreshVertexDeformUI();
    setStatus(`Vertex heatmap preview ${state.vertexDeform.heatmap ? "ON" : "OFF"}.`);
  });
}
if (els.vertexWeightVizToggle) {
  els.vertexWeightVizToggle.addEventListener("change", () => {
    state.vertexDeform.weightViz = !!els.vertexWeightVizToggle.checked;
    refreshVertexDeformUI();
    setStatus(`Weight overlay ${state.vertexDeform.weightViz ? "ON" : "OFF"}.`);
  });
}
if (els.vertexWeightVizMode) {
  els.vertexWeightVizMode.addEventListener("change", () => {
    state.vertexDeform.weightVizMode = sanitizeWeightVizMode(els.vertexWeightVizMode.value);
    refreshVertexDeformUI();
    setStatus(`Weight overlay mode: ${state.vertexDeform.weightVizMode}.`);
  });
}
if (els.vertexWeightVizOpacity) {
  const applyWeightVizOpacity = () => {
    state.vertexDeform.weightVizOpacity = math.clamp(Number(els.vertexWeightVizOpacity.value) || 0.75, 0.05, 1);
    refreshVertexDeformUI();
  };
  els.vertexWeightVizOpacity.addEventListener("input", applyWeightVizOpacity);
  els.vertexWeightVizOpacity.addEventListener("change", applyWeightVizOpacity);
}
if (els.vertexProportionalRadius) {
  const applyVertexRadius = () => {
    state.vertexDeform.radius = math.clamp(Number(els.vertexProportionalRadius.value) || 80, 4, 400);
    refreshVertexDeformUI();
  };
  els.vertexProportionalRadius.addEventListener("input", applyVertexRadius);
  els.vertexProportionalRadius.addEventListener("change", applyVertexRadius);
}
if (els.vertexProportionalFalloff) {
  els.vertexProportionalFalloff.addEventListener("change", () => {
    state.vertexDeform.falloff = sanitizeVertexFalloff(els.vertexProportionalFalloff.value);
    refreshVertexDeformUI();
    setStatus(`Vertex falloff: ${state.vertexDeform.falloff}.`);
  });
}
