// Split from app.js
// Part: File import, bone tree, slot/tree bindings
// Original source: app/05-bindings-file-tree.js (segment 1)
els.fileInput.addEventListener("change", async (e) => {
  const files = Array.from(e.target.files || []);
  if (files.length === 0) return;
  try {
    const hadProject = !!state.mesh;
    const hadSlots = state.slots.length > 0;
    let added = 0;
    let importedPsd = false;
    for (const file of files) {
      if (file.name.toLowerCase().endsWith(".psd")) importedPsd = true;
      const slots = await loadFileSlots(file);
      for (const s of slots) {
        const wasEmpty = state.slots.length === 0;
        addSlotEntry(s, true);
        added += 1;
        if (wasEmpty) {
          const first = state.slots[state.activeSlot];
          if (first) {
            syncSourceCanvasToActiveAttachment(first);
            rebuildMesh();
          }
        }
      }
    }
    if (state.mesh) {
      ensureSlotsHaveBoneBinding();
      if (importedPsd) state.slotViewMode = "all";
      updateBoneUI();
    }
    if (state.activeSlot >= 0) {
      setActiveSlot(state.activeSlot);
    }
    const modeText = hadProject || hadSlots ? "Added" : "Imported";
    setStatus(`${modeText} ${added} slot(s). Current slot: ${state.slots[state.activeSlot]?.name || "-"}`);
  } catch (err) {
    console.error(err);
    setStatus(`Import failed: ${err.message}`);
  } finally {
    e.target.value = "";
  }
});

if (els.boneTree) {
  els.boneTree.addEventListener("click", (ev) => {
    if (state.boneTreeMenuOpen) closeBoneTreeContextMenu();
    if (ev.target.closest(".tree-rename-input")) return;
    const foldBtn = ev.target.closest(".tree-bone-slot-toggle[data-bone-slot-toggle]");
    if (foldBtn) {
      state.treeSlotLastClickIndex = -1;
      state.treeSlotLastClickTs = 0;
      state.treeBoneLastClickIndex = -1;
      state.treeBoneLastClickTs = 0;
      const bi = Number(foldBtn.dataset.boneSlotToggle);
      if (Number.isFinite(bi) && bi >= 0) {
        state.boneTreeSlotCollapse[bi] = !state.boneTreeSlotCollapse[bi];
        renderBoneTree();
      }
      return;
    }
    const childFoldBtn = ev.target.closest(".tree-bone-child-toggle[data-bone-child-toggle]");
    if (childFoldBtn) {
      state.treeSlotLastClickIndex = -1;
      state.treeSlotLastClickTs = 0;
      state.treeBoneLastClickIndex = -1;
      state.treeBoneLastClickTs = 0;
      const bi = Number(childFoldBtn.dataset.boneChildToggle);
      if (Number.isFinite(bi) && bi >= 0) {
        state.boneTreeChildCollapse[bi] = !state.boneTreeChildCollapse[bi];
        renderBoneTree();
      }
      return;
    }
    const workHideBtn = ev.target.closest(".tree-bone-hide-toggle[data-bone-work-hide-toggle]");
    if (workHideBtn && state.mesh) {
      state.treeSlotLastClickIndex = -1;
      state.treeSlotLastClickTs = 0;
      state.treeBoneLastClickIndex = -1;
      state.treeBoneLastClickTs = 0;
      const bi = Number(workHideBtn.dataset.boneWorkHideToggle);
      const rig = state.mesh.rigBones && state.mesh.rigBones[bi];
      if (!Number.isFinite(bi) || bi < 0 || !rig) return;
      normalizeBoneChannels(rig);
      rig.workHidden = !rig.workHidden;
      if (state.mesh.poseBones && state.mesh.poseBones[bi]) {
        normalizeBoneChannels(state.mesh.poseBones[bi]);
        state.mesh.poseBones[bi].workHidden = rig.workHidden;
      }
      refreshSlotUI();
      renderBoneTree();
      if (state.selectedBone === bi) updateBoneUI();
      const hideScopeLabel = getGlobalBoneWorkHideMode() === "bone_and_slots" ? "bone+slots" : "bone only";
      setStatus(
        !rig.workHidden
          ? `Work hide off: ${rig.name}`
          : `Work hide on (${hideScopeLabel}, subtree): ${rig.name}`
      );
      return;
    }
    const animHideBtn = ev.target.closest(".tree-bone-anim-hide-toggle[data-bone-anim-hide-toggle]");
    if (animHideBtn && state.mesh) {
      state.treeSlotLastClickIndex = -1;
      state.treeSlotLastClickTs = 0;
      state.treeBoneLastClickIndex = -1;
      state.treeBoneLastClickTs = 0;
      if (state.boneMode !== "pose") {
        setStatus("Switch to Pose mode to set animation hide key.");
        return;
      }
      const bi = Number(animHideBtn.dataset.boneAnimHideToggle);
      const bones = getPoseBones(state.mesh);
      const b = bones && bones[bi];
      if (!Number.isFinite(bi) || bi < 0 || !b) return;
      normalizeBoneChannels(b);
      b.animHidden = !b.animHidden;
      markDirtyByBoneProp(bi, "animHide");
      addOrUpdateKeyframeForTrack(getTrackId(bi, "animHide"), true);
      refreshSlotUI();
      renderBoneTree();
      if (state.selectedBone === bi) updateBoneUI();
      setStatus(`${b.animHidden ? "Anim hide ON" : "Anim hide OFF"} (bone+slots subtree key): ${b.name} @ ${state.anim.time.toFixed(2)}s`);
      return;
    }
    const eyeBtn = ev.target.closest(".slot-eye[data-slot-eye]");
    if (eyeBtn) {
      state.treeSlotLastClickIndex = -1;
      state.treeSlotLastClickTs = 0;
      state.treeBoneLastClickIndex = -1;
      state.treeBoneLastClickTs = 0;
      const si = Number(eyeBtn.dataset.slotEye);
      if (Number.isFinite(si) && state.slots[si]) {
        const slot = state.slots[si];
        slot.editorVisible = !isSlotEditorVisible(slot);
        renderBoneTree();
        refreshSlotUI();
      }
      return;
    }
    /* --- Attachment fold toggle --- */
    const attFoldBtn = ev.target.closest(".tree-slot-att-toggle[data-slot-att-toggle]");
    if (attFoldBtn) {
      state.treeSlotLastClickIndex = -1;
      state.treeSlotLastClickTs = 0;
      const si = Number(attFoldBtn.dataset.slotAttToggle);
      if (Number.isFinite(si) && si >= 0) {
        state.boneTreeAttachmentCollapse[si] = !state.boneTreeAttachmentCollapse[si];
        renderBoneTree();
      }
      return;
    }
    /* --- Attachment row click --- */
    const attItem = ev.target.closest(".tree-item.tree-attachment[data-attachment-name]");
    if (attItem) {
      const si = Number(attItem.dataset.slotIndex);
      const attName = attItem.dataset.attachmentName;
      if (Number.isFinite(si) && si >= 0 && si < state.slots.length && attName) {
        const slot = state.slots[si];
        if (state.activeSlot !== si) setActiveSlot(si);
        else syncBindSelectionToSingleSlot(si);
        ensureSlotAttachmentState(slot);
        slot.activeAttachment = attName;
        const switchAtt = getActiveAttachment(slot);
        const switchEntry = getSlotAttachmentEntry(slot, attName);
        if (switchAtt && switchEntry) switchAtt.canvas = switchEntry.canvas || switchAtt.canvas;
        syncSourceCanvasToActiveAttachment(slot);
        setRightPropsFocus("attachment");
        refreshSlotUI();
        renderBoneTree();
        setStatus("Active attachment: " + attName);
      }
      return;
    }
    const slotItem = ev.target.closest(".tree-item[data-slot-index]");
    if (slotItem) {
      const si = Number(slotItem.dataset.slotIndex);
      if (!Number.isFinite(si) || si < 0 || si >= state.slots.length) return;
      const slot = state.slots[si];
      const slotTreeBone = slot ? getSlotTreeBoneIndex(slot, state.mesh) : -1;
      const isUnassigned = !!slot && slotTreeBone === -1;
      if (isUnassigned) {
        if (ev.ctrlKey || ev.metaKey) {
          const current = new Set(
            (Array.isArray(state.boneTreeSelectedUnassignedSlotIds) ? state.boneTreeSelectedUnassignedSlotIds : []).map((v) => String(v))
          );
          const sid = slot && slot.id != null ? String(slot.id) : "";
          if (sid) {
            if (current.has(sid)) current.delete(sid);
            else current.add(sid);
            state.boneTreeSelectedUnassignedSlotIds = [...current];
          }
          setActiveSlot(si, { syncBindSelection: false });
          renderBoneTree();
          return;
        }
        setSelectedUnassignedSlotIndices([si], false);
      } else {
        state.boneTreeSelectedUnassignedSlotIds = [];
        if (ev.ctrlKey || ev.metaKey) {
          const bi = slotTreeBone;
          if (Number.isFinite(bi) && bi >= 0) {
            const sid = slot && slot.id != null ? String(slot.id) : "";
            const pickedIndex = getSelectedSlotIndexForBone(bi);
            if (pickedIndex === si) delete state.boneTreeSelectedSlotByBone[bi];
            else if (sid) state.boneTreeSelectedSlotByBone[bi] = sid;
            setActiveSlot(si, { syncBindSelection: false });
            renderBoneTree();
            return;
          }
        }
      }
      state.treeSlotLastClickIndex = si;
      state.treeSlotLastClickTs = window.performance && typeof window.performance.now === "function" ? window.performance.now() : Date.now();
      state.treeBoneLastClickIndex = -1;
      state.treeBoneLastClickTs = 0;
      const changed = state.activeSlot !== si;
      setActiveSlot(si);
      if (changed) setStatus(`Switched to slot: ${state.slots[si].name}`);
      return;
    }
    state.treeSlotLastClickIndex = -1;
    state.treeSlotLastClickTs = 0;
    const item = ev.target.closest(".tree-item[data-bone-index]");
    if (!item || !state.mesh) {
      if (!ev.ctrlKey && !ev.metaKey && !ev.shiftKey && !ev.altKey) {
        clearActiveSlotSelection();
        setStatus("Slot selection cleared.");
      }
      return;
    }
    const i = Number(item.dataset.boneIndex);
    if (!Number.isFinite(i)) return;
    state.treeBoneLastClickIndex = i;
    state.treeBoneLastClickTs = window.performance && typeof window.performance.now === "function" ? window.performance.now() : Date.now();
    if (ev.ctrlKey || ev.metaKey) {
      state.treeBoneLastClickIndex = -1;
      state.treeBoneLastClickTs = 0;
      const set = new Set(getSelectedBonesForWeight(state.mesh));
      if (set.has(i)) set.delete(i);
      else set.add(i);
      state.selectedBonesForWeight = [...set];
      state.selectedBone = i;
      setRightPropsFocus("bone");
      syncWeightOverlayToBoneSelection();
      updateBoneUI();
      setStatus(`Weight bone selection: ${state.selectedBonesForWeight.join(", ") || "(none)"}`);
      return;
    }
    state.selectedBone = i;
    state.selectedBonesForWeight = [i];
    setRightPropsFocus("bone");
    syncWeightOverlayToBoneSelection();
    updateBoneUI();
  });

  els.boneTree.addEventListener("dblclick", (ev) => {
    if (ev.target.closest(".tree-rename-input")) return;
    const attachmentItem = ev.target.closest(".tree-item.tree-attachment[data-attachment-name]");
    if (attachmentItem) {
      const si = Number(attachmentItem.dataset.slotIndex);
      const attName = attachmentItem.dataset.attachmentName;
      if (Number.isFinite(si) && si >= 0 && si < state.slots.length && attName) {
        startBoneTreeInlineRename("attachment", si, attName);
      }
      return;
    }
    const slotItem = ev.target.closest(".tree-item[data-slot-index]");
    if (slotItem) {
      const si = Number(slotItem.dataset.slotIndex);
      if (Number.isFinite(si) && si >= 0 && si < state.slots.length) {
        renameSlotByIndexFromTree(si);
      }
      return;
    }
    const boneItem = ev.target.closest(".tree-item[data-bone-index]");
    if (!boneItem || !state.mesh) return;
    const bi = Number(boneItem.dataset.boneIndex);
    if (!Number.isFinite(bi) || bi < 0) return;
    startBoneTreeInlineRename("bone", bi);
  });

  els.boneTree.addEventListener("contextmenu", (ev) => {
    ev.preventDefault();
    state.boneTreeMenuContextKind = "";
    const attachmentItem = ev.target.closest(".tree-item.tree-attachment[data-attachment-name]");
    if (attachmentItem) {
      const si = Number(attachmentItem.dataset.slotIndex);
      const attName = attachmentItem.dataset.attachmentName;
      if (Number.isFinite(si) && si >= 0 && si < state.slots.length && attName) {
        setActiveSlot(si);
        state.slots[si].activeAttachment = attName;
        setRightPropsFocus("attachment");
        refreshSlotUI();
        state.boneTreeMenuContextKind = "attachment";
      }
    } else {
      const slotItem = ev.target.closest(".tree-item[data-slot-index]");
      if (slotItem) {
        const si = Number(slotItem.dataset.slotIndex);
        if (Number.isFinite(si) && si >= 0 && si < state.slots.length) {
          setActiveSlot(si);
          setRightPropsFocus("slot");
          state.boneTreeMenuContextKind = "slot";
        }
      } else {
        const boneItem = ev.target.closest(".tree-item[data-bone-index]");
        if (boneItem && state.mesh) {
          const bi = Number(boneItem.dataset.boneIndex);
          if (Number.isFinite(bi) && bi >= 0) {
            state.selectedBone = bi;
            state.selectedBonesForWeight = [bi];
            setRightPropsFocus("bone");
            updateBoneUI();
            state.boneTreeMenuContextKind = "bone";
          }
        }
      }
    }
    openBoneTreeContextMenu(ev.clientX, ev.clientY);
  });

  els.boneTree.addEventListener("dragstart", (ev) => {
    state.treeSlotLastClickIndex = -1;
    state.treeSlotLastClickTs = 0;
    /* --- Attachment drag takes priority over slot drag --- */
    const attachmentItem = ev.target.closest(".tree-item.tree-attachment[data-attachment-name]");
    if (attachmentItem) {
      const si = Number(attachmentItem.dataset.slotIndex);
      const attName = attachmentItem.dataset.attachmentName;
      if (!Number.isFinite(si) || si < 0 || si >= state.slots.length || !attName) {
        ev.preventDefault();
        return;
      }
      state.treeAttachmentDrag = { slotIndex: si, attachmentName: attName };
      attachmentItem.classList.add("dragging");
      if (ev.dataTransfer) {
        ev.dataTransfer.effectAllowed = "move";
        ev.dataTransfer.setData("text/plain", `att:${si}:${attName}`);
      }
      return;
    }

    const slotItem = ev.target.closest(".tree-item[data-slot-index]");
    if (!slotItem) {
      ev.preventDefault();
      return;
    }
    const si = Number(slotItem.dataset.slotIndex);
    if (!Number.isFinite(si) || si < 0 || si >= state.slots.length) {
      ev.preventDefault();
      return;
    }
    state.treeSlotDrag = { slotIndex: si };
    slotItem.classList.add("dragging");
    if (ev.dataTransfer) {
      ev.dataTransfer.effectAllowed = "move";
      ev.dataTransfer.setData("text/plain", String(si));
    }
  });

  els.boneTree.addEventListener("dragover", (ev) => {
    /* --- Attachment reorder --- */
    if (state.treeAttachmentDrag) {
      const attItem = ev.target.closest(".tree-item.tree-attachment[data-attachment-name]");
      if (attItem) {
        const tsi = Number(attItem.dataset.slotIndex);
        if (Number.isFinite(tsi) && tsi >= 0 && tsi < state.slots.length) {
          ev.preventDefault();
          if (ev.dataTransfer) ev.dataTransfer.dropEffect = "move";
          const rect = attItem.getBoundingClientRect();
          const placeAfter = ev.clientY >= rect.top + rect.height * 0.5;
          for (const row of els.boneTree.querySelectorAll(".tree-item.tree-attachment")) {
            row.classList.remove("att-drop-before", "att-drop-after");
          }
          attItem.classList.add(placeAfter ? "att-drop-after" : "att-drop-before");
        }
      }
      return;
    }

    if (!state.treeSlotDrag) return;
    const slotItem = ev.target.closest(".tree-item[data-slot-index]");
    if (slotItem) {
      const ti = Number(slotItem.dataset.slotIndex);
      if (!Number.isFinite(ti) || ti < 0 || ti >= state.slots.length) return;
      const rect = slotItem.getBoundingClientRect();
      const placeAfter = ev.clientY >= rect.top + rect.height * 0.5;
      ev.preventDefault();
      if (ev.dataTransfer) ev.dataTransfer.dropEffect = "move";
      setBoneTreeSlotDropIndicator(ti, placeAfter);
      return;
    }
    const boneItem = ev.target.closest(".tree-item[data-bone-index]");
    if (!boneItem) {
      const staging = ev.target.closest(".tree-item[data-slot-staging-drop]");
      if (!staging) {
        clearBoneTreeDropIndicators();
        return;
      }
      ev.preventDefault();
      if (ev.dataTransfer) ev.dataTransfer.dropEffect = "move";
      clearBoneTreeDropIndicators();
      staging.classList.add("drop-target");
      return;
    }
    const bi = Number(boneItem.dataset.boneIndex);
    if (!Number.isFinite(bi) || bi < 0) return;
    ev.preventDefault();
    if (ev.dataTransfer) ev.dataTransfer.dropEffect = "move";
    setBoneTreeDropIndicator(bi);
  });

  els.boneTree.addEventListener("drop", (ev) => {
    /* --- Attachment drop: reorder within slot or move to another slot --- */
    if (state.treeAttachmentDrag) {
      for (const row of els.boneTree.querySelectorAll(".tree-item.tree-attachment")) {
        row.classList.remove("att-drop-before", "att-drop-after", "dragging");
      }
      const { slotIndex: srcSi, attachmentName: srcAttName } = state.treeAttachmentDrag;
      state.treeAttachmentDrag = null;
      const attItem = ev.target.closest(".tree-item.tree-attachment[data-attachment-name]");
      if (!attItem) return;
      ev.preventDefault();
      const tsi = Number(attItem.dataset.slotIndex);
      const tAttName = attItem.dataset.attachmentName;
      if (!Number.isFinite(tsi) || tsi < 0 || tsi >= state.slots.length) return;
      const srcSlot = state.slots[srcSi];
      const tgtSlot = state.slots[tsi];
      if (!srcSlot || !tgtSlot) return;
      const rect = attItem.getBoundingClientRect();
      const placeAfter = ev.clientY >= rect.top + rect.height * 0.5;

      if (srcSi === tsi) {
        /* Same slot: reorder */
        const list = ensureSlotAttachments(srcSlot);
        const fromIdx = list.findIndex((a) => a.name === srcAttName);
        let toIdx = list.findIndex((a) => a.name === tAttName);
        if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return;
        if (placeAfter) toIdx = toIdx + (fromIdx < toIdx ? 0 : 1);
        else toIdx = toIdx - (fromIdx > toIdx ? 0 : 1);
        const [moved] = list.splice(fromIdx, 1);
        list.splice(Math.max(0, Math.min(toIdx, list.length)), 0, moved);
        pushUndoCheckpoint(true);
        setStatus(`Attachment "${srcAttName}" reordered.`);
      } else {
        /* Cross-slot move */
        const srcList = ensureSlotAttachments(srcSlot);
        const tgtList = ensureSlotAttachments(tgtSlot);
        const fromIdx = srcList.findIndex((a) => a.name === srcAttName);
        if (fromIdx < 0) return;
        const [moved] = srcList.splice(fromIdx, 1);
        /* Ensure unique name in target slot */
        const usedNames = new Set(tgtList.map((a) => a.name));
        if (usedNames.has(moved.name)) {
          let i = 2;
          let cand = `${moved.name}_${i}`;
          while (usedNames.has(cand)) { i += 1; cand = `${moved.name}_${i}`; }
          moved.name = cand;
        }
        let toIdx = tgtList.findIndex((a) => a.name === tAttName);
        if (toIdx < 0) toIdx = tgtList.length;
        else if (placeAfter) toIdx += 1;
        tgtList.splice(toIdx, 0, moved);
        /* Fix source slot active attachment if it was the moved one */
        if (srcSlot.activeAttachment === srcAttName) {
          const nextAtt = srcList[Math.max(0, fromIdx - 1)];
          srcSlot.activeAttachment = nextAtt ? nextAtt.name : (srcList[0] ? srcList[0].name : null);
          if (srcSlot.attachmentName === srcAttName) srcSlot.attachmentName = srcSlot.activeAttachment || "main";
        }
        /* Activate moved attachment in target */
        tgtSlot.activeAttachment = moved.name;
        setActiveSlot(tsi);
        pushUndoCheckpoint(true);
        setStatus(`Attachment "${moved.name}" moved to slot "${tgtSlot.name}".`);
      }
      refreshSlotUI();
      renderBoneTree();
      return;
    }

    if (!state.treeSlotDrag) return;
    const slotItem = ev.target.closest(".tree-item[data-slot-index]");
    clearBoneTreeDropIndicators();
    const si = Number(state.treeSlotDrag.slotIndex);
    if (!Number.isFinite(si) || si < 0 || si >= state.slots.length) return;

    if (slotItem) {
      const ti = Number(slotItem.dataset.slotIndex);
      if (!Number.isFinite(ti) || ti < 0 || ti >= state.slots.length) return;
      ev.preventDefault();
      const rect = slotItem.getBoundingClientRect();
      const placeAfter = ev.clientY >= rect.top + rect.height * 0.5;
      const sourceSlot = state.slots[si];
      const targetSlot = state.slots[ti];
      if (!sourceSlot || !targetSlot) return;
      const targetBone = Number(targetSlot.bone);
      let boneChanged = false;
      if (
        state.mesh &&
        Number.isFinite(targetBone) &&
        targetBone >= 0 &&
        sourceSlot.bone !== targetBone
      ) {
        boneChanged = applySlotBoneAssignment(sourceSlot, targetBone, state.mesh);
      }
      const movedIndex = moveSlotToIndex(si, ti + (placeAfter ? 1 : 0));
      const orderChanged = movedIndex !== si;
      if (!boneChanged && !orderChanged) return;
      setActiveSlot(orderChanged ? movedIndex : si);
      if (orderChanged) markDirtyDrawOrder();
      pushUndoCheckpoint(true);
      const slotLabel = state.slots[state.activeSlot] && state.slots[state.activeSlot].name ? state.slots[state.activeSlot].name : "slot";
      if (boneChanged && orderChanged) {
        setStatus(`Slot "${slotLabel}" moved and assigned to bone ${targetBone}.`);
      } else if (boneChanged) {
        setStatus(`Slot "${slotLabel}" assigned to bone ${targetBone}.`);
      } else {
        setStatus(`Slot "${slotLabel}" order moved.`);
      }
      return;
    }

    const boneItem = ev.target.closest(".tree-item[data-bone-index]");
    if (!boneItem) {
      const staging = ev.target.closest(".tree-item[data-slot-staging-drop]");
      if (!staging) return;
      ev.preventDefault();
      const ok = assignSlotToBone(si, -1);
      if (!ok) return;
      setActiveSlot(si);
      pushUndoCheckpoint(true);
      setStatus(`Slot "${state.slots[si] ? state.slots[si].name : si}" moved to staging (unassigned).`);
      return;
    }
    const bi = Number(boneItem.dataset.boneIndex);
    if (!Number.isFinite(bi)) return;
    ev.preventDefault();
    const ok = assignSlotToBone(si, bi);
    if (!ok) return;
    setActiveSlot(si);
    pushUndoCheckpoint(true);
    setStatus(`Slot "${state.slots[si] ? state.slots[si].name : si}" assigned to bone ${bi}.`);
  });

  els.boneTree.addEventListener("dragend", () => {
    clearBoneTreeDropIndicators();
    for (const row of els.boneTree.querySelectorAll(".tree-item.tree-slot.dragging")) {
      row.classList.remove("dragging");
    }
    for (const row of els.boneTree.querySelectorAll(".tree-item.tree-attachment")) {
      row.classList.remove("dragging", "att-drop-before", "att-drop-after");
    }
    state.treeSlotDrag = null;
    state.treeAttachmentDrag = null;
  });
}

if (els.boneTreeContextMenu) {
  els.boneTreeContextMenu.addEventListener("contextmenu", (ev) => {
    ev.preventDefault();
  });
}
if (els.timelineKeyContextMenu) {
  els.timelineKeyContextMenu.addEventListener("contextmenu", (ev) => {
    ev.preventDefault();
  });
}

document.addEventListener("pointerdown", (ev) => {
  const target = ev.target;
  if (!(target instanceof Element)) {
    if (state.boneTreeMenuOpen) closeBoneTreeContextMenu();
    if (state.anim.timelineContextMenuOpen) closeTimelineKeyContextMenu();
    closeBoneDeleteQuickMenu();
    return;
  }
  if (state.boneTreeMenuOpen && !target.closest("#boneTreeContextMenu")) {
    closeBoneTreeContextMenu();
  }
  if (state.anim.timelineContextMenuOpen && !target.closest("#timelineKeyContextMenu")) {
    closeTimelineKeyContextMenu();
  }
  if (!target.closest("#boneTreeDeleteBoneMenu") && !target.closest("#boneTreeDeleteBoneMenuBtn")) {
    closeBoneDeleteQuickMenu();
  }
});

document.addEventListener("click", (ev) => {
  const target = ev.target;
  if (!(target instanceof Element)) return;
  const btn = target.closest("#setupHumanoidBoneBtn");
  if (!btn) return;
  ev.preventDefault();
  void handleSetupHumanoidBoneBuild();
});

window.addEventListener("blur", () => {
  if (state.boneTreeMenuOpen) closeBoneTreeContextMenu();
  if (state.anim.timelineContextMenuOpen) closeTimelineKeyContextMenu();
  closeBoneDeleteQuickMenu();
});

if (els.fileOpenBtn) {
  els.fileOpenBtn.addEventListener("click", () => {
    els.fileInput.click();
  });
}

if (els.slotSelect) {
  els.slotSelect.addEventListener("change", () => {
    const i = Number(els.slotSelect.value);
    if (!Number.isFinite(i)) return;
    if (i < 0) {
      clearActiveSlotSelection();
      setStatus("Slot selection cleared.");
      return;
    }
    setActiveSlot(i);
    setStatus(`Switched to slot: ${state.slots[i]?.name || i}`);
  });
}

if (els.slotViewMode) {
  els.slotViewMode.addEventListener("change", () => {
    state.slotViewMode = els.slotViewMode.value === "all" ? "all" : "single";
    refreshSlotUI();
    renderBoneTree();
    setStatus(state.slotViewMode === "all" ? "Slot view: all visible (one slot per bone)." : "Slot view: single slot.");
  });
}

if (els.boneTreeOnlyActiveSlotBtn) {
  els.boneTreeOnlyActiveSlotBtn.addEventListener("click", () => {
    state.boneTreeOnlyActiveSlot = !state.boneTreeOnlyActiveSlot;
    renderBoneTree();
    setStatus(state.boneTreeOnlyActiveSlot ? "Bone tree: showing active slot only." : "Bone tree: showing all slots.");
  });
}
if (els.boneTreeHideScopeBtn) {
  els.boneTreeHideScopeBtn.addEventListener("click", () => {
    state.boneTreeWorkHideMode = getGlobalBoneWorkHideMode() === "bone_and_slots" ? "bone_only" : "bone_and_slots";
    refreshSlotUI();
    renderBoneTree();
    setStatus(
      getGlobalBoneWorkHideMode() === "bone_and_slots"
        ? "Bone tree hide scope: bone+slots."
        : "Bone tree hide scope: bone only."
    );
  });
}
if (els.boneTreeAddBoneBtn) {
  els.boneTreeAddBoneBtn.addEventListener("click", () => {
    if (!state.mesh || state.boneMode !== "edit") {
      setStatus("Switch to Skeleton/Edit mode to add bone.");
      return;
    }
    const idx = addBone({ parent: -1, connected: false });
    if (!Number.isFinite(idx) || idx < 0) {
      setStatus("Add bone failed.");
      return;
    }
    setStatus(`Bone added: ${state.mesh.rigBones[idx] ? state.mesh.rigBones[idx].name : idx}`);
  });
}
if (els.boneTreeDeleteBoneBtn) {
  els.boneTreeDeleteBoneBtn.addEventListener("click", () => {
    closeBoneDeleteQuickMenu();
    const info = getSelectedBoneDeleteInfo();
    const m = state.mesh;
    if (!m || !info.canDelete) {
      setStatus("Delete bone failed.");
      return;
    }
    const bi = Number(info.boneIndex);
    const name = Number.isFinite(bi) && bi >= 0 && bi < m.rigBones.length ? String(m.rigBones[bi].name || `bone_${bi}`) : "bone";
    if (!deleteSelectedBoneTreeWithSlotPolicy("to_staging")) {
      setStatus("Delete bone failed.");
      return;
    }
    setStatus(info.mode === "subtree" ? `Bone tree deleted: ${name} (slots moved to staging).` : `Bone deleted: ${name} (slots moved to staging).`);
  });
}
if (els.boneTreeDeleteBoneMenuBtn) {
  els.boneTreeDeleteBoneMenuBtn.addEventListener("click", (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    toggleBoneDeleteQuickMenu();
  });
}
if (els.boneTreeDeleteBoneToStagingBtn) {
  els.boneTreeDeleteBoneToStagingBtn.addEventListener("click", () => {
    closeBoneDeleteQuickMenu();
    const info = getSelectedBoneDeleteInfo();
    const m = state.mesh;
    if (!m || !info.canDelete) {
      setStatus("Delete bone failed.");
      return;
    }
    const bi = Number(info.boneIndex);
    const name = Number.isFinite(bi) && bi >= 0 && bi < m.rigBones.length ? String(m.rigBones[bi].name || `bone_${bi}`) : "bone";
    if (!deleteSelectedBoneTreeWithSlotPolicy("to_staging")) {
      setStatus("Delete bone failed.");
      return;
    }
    setStatus(info.mode === "subtree" ? `Bone tree deleted: ${name} (slots moved to staging).` : `Bone deleted: ${name} (slots moved to staging).`);
  });
}
if (els.boneTreeDeleteBoneWithSlotsBtn) {
  els.boneTreeDeleteBoneWithSlotsBtn.addEventListener("click", () => {
    closeBoneDeleteQuickMenu();
    const info = getSelectedBoneDeleteInfo();
    const m = state.mesh;
    if (!m || !info.canDelete) {
      setStatus("Delete bone failed.");
      return;
    }
    const bi = Number(info.boneIndex);
    const name = Number.isFinite(bi) && bi >= 0 && bi < m.rigBones.length ? String(m.rigBones[bi].name || `bone_${bi}`) : "bone";
    if (!deleteSelectedBoneTreeWithSlotPolicy("delete_slots")) {
      setStatus("Delete bone failed.");
      return;
    }
    setStatus(info.mode === "subtree" ? `Bone tree deleted: ${name} (bound slots deleted).` : `Bone deleted: ${name} (bound slots deleted).`);
  });
}
if (els.boneTreeBindSelectedUnassignedBtn) {
  els.boneTreeBindSelectedUnassignedBtn.addEventListener("click", () => {
    const count = bindSelectedUnassignedSlotsToDefaultBones();
    if (count <= 0) {
      setStatus("No selected staging slot to bind.");
      return;
    }
    pushUndoCheckpoint(true);
    setStatus(`Bound ${count} staging slot(s) to new default bone(s).`);
  });
}

if (els.spineCompat) {
  els.spineCompat.addEventListener("change", () => {
    const compat = getSpineCompatPreset(els.spineCompat.value);
    state.export.spineCompat = compat.id;
    setStatus(`Spine export compatibility: ${compat.version}`);
  });
}

if (els.viewZoomOutBtn) {
  els.viewZoomOutBtn.addEventListener("click", () => {
    const sx = Math.max(1, Number(els.overlay.width) || 1) * 0.5;
    const sy = Math.max(1, Number(els.overlay.height) || 1) * 0.5;
    zoomViewBy(1 / 1.15, sx, sy);
  });
}
if (els.viewZoomInBtn) {
  els.viewZoomInBtn.addEventListener("click", () => {
    const sx = Math.max(1, Number(els.overlay.width) || 1) * 0.5;
    const sy = Math.max(1, Number(els.overlay.height) || 1) * 0.5;
    zoomViewBy(1.15, sx, sy);
  });
}
if (els.viewZoomResetBtn) {
  els.viewZoomResetBtn.addEventListener("click", () => {
    resetViewToFit();
  });
}
if (els.viewPanToggleBtn) {
  els.viewPanToggleBtn.addEventListener("click", () => {
    state.view.panMode = !state.view.panMode;
    refreshViewPanUI();
    setStatus(state.view.panMode ? "Pan canvas mode enabled." : "Pan canvas mode disabled.");
  });
}
if (els.viewFitAllBtn) {
  els.viewFitAllBtn.addEventListener("click", () => {
    fitViewToAllVisible();
    setStatus("View centered to all visible content.");
  });
}
function ensureObjectModeWorkspaceFromToolClick() {
  if (!state.mesh) return false;
  if (state.editMode !== "skeleton" && state.editMode !== "object") {
    setStatus("Object tools require Skeleton or Object edit mode.");
    return false;
  }
  const prevMode = state.boneMode;
  let changed = false;
  if (state.boneMode !== "object") {
    state.boneMode = "object";
    if (els.boneMode) els.boneMode.value = "object";
    changed = true;
  }
  if (state.uiPage !== "object") {
    state.uiPage = "object";
    changed = true;
  }
  applyBoneModeTransition(prevMode, state.boneMode);
  if (changed) {
    updateWorkspaceUI();
    updateBoneUI();
  }
  return true;
}

const bindObjectToolButton = (btn, mode) => {
  if (!btn) return;
  btn.addEventListener("click", () => {
    if (!ensureObjectModeWorkspaceFromToolClick()) return;
    setDragTool(mode === "rotate" ? "rotate" : "move_head");
  });
};
bindObjectToolButton(els.objectPanelMoveBtn, "move");
bindObjectToolButton(els.objectPanelRotateBtn, "rotate");

if (els.baseImageTx) {
  els.baseImageTx.addEventListener("input", () => {
    applyBaseImageTransformFromInputs();
  });
}
if (els.baseImageTy) {
  els.baseImageTy.addEventListener("input", () => {
    applyBaseImageTransformFromInputs();
  });
}
if (els.baseImageScale) {
  els.baseImageScale.addEventListener("input", () => {
    applyBaseImageTransformFromInputs();
  });
}
if (els.baseImageRot) {
  els.baseImageRot.addEventListener("input", () => {
    applyBaseImageTransformFromInputs();
  });
}
if (els.baseImageTransformResetBtn) {
  els.baseImageTransformResetBtn.addEventListener("click", () => {
    setSlotBaseImageTransform({ enabled: true, tx: 0, ty: 0, rot: 0, scale: 1 });
    refreshBaseImageTransformUI();
    setStatus("Base image transform reset.");
  });
}

if (els.slotName) {
  els.slotName.addEventListener("input", () => {
    const s = getActiveSlot();
    if (!s) return;
    s.name = els.slotName.value.trim() || `slot_${state.activeSlot}`;
    refreshSlotUI();
    renderBoneTree();
  });
}

if (els.slotBone) {
  els.slotBone.addEventListener("change", () => {
    const s = getActiveSlot();
    if (!s || !state.mesh) return;
    const bone = Number(els.slotBone.value);
    const targetBone = Number.isFinite(bone) ? bone : -1;
    if (!applySlotBoneAssignment(s, targetBone, state.mesh)) {
      refreshSlotUI();
      setStatus("Slot bone change failed.");
      return;
    }
    syncBindSelectionToSingleSlot(state.activeSlot);
    refreshSlotUI();
    renderBoneTree();
    const mode = getSlotWeightMode(s);
    const boneName =
      targetBone >= 0 && state.mesh.rigBones[targetBone]
        ? String(state.mesh.rigBones[targetBone].name || `bone_${targetBone}`)
        : "staging";
    setStatus(`Slot owner updated (${mode}) -> ${boneName}.`);
  });
}

if (els.slotVisible) {
  els.slotVisible.addEventListener("change", () => {
    const s = getActiveSlot();
    if (!s) return;
    s.editorVisible = !!els.slotVisible.checked;
    refreshSlotUI();
    renderBoneTree();
  });
}

if (els.slotClipEnabled) {
  els.slotClipEnabled.addEventListener("change", () => {
    const s = getActiveSlot();
    const att = s ? getActiveAttachment(s) : null;
    if (!s || !att) return;
    att.clipEnabled = !!els.slotClipEnabled.checked;
    ensureSlotClipState(s);
    markDirtyBySlotProp(state.activeSlot, "clip");
    refreshSlotUI();
    setStatus(att.clipEnabled ? "Slot clipping enabled." : "Slot clipping disabled.");
  });
}
if (els.slotClipSource) {
  els.slotClipSource.addEventListener("change", () => {
    const s = getActiveSlot();
    const att = s ? getActiveAttachment(s) : null;
    if (!s || !att) return;
    att.clipSource = els.slotClipSource.value === "contour" ? "contour" : "fill";
    ensureSlotClipState(s);
    markDirtyBySlotProp(state.activeSlot, "clipSource");
    refreshSlotUI();
  });
}
if (els.slotClipEnd) {
  els.slotClipEnd.addEventListener("change", () => {
    const s = getActiveSlot();
    const att = s ? getActiveAttachment(s) : null;
    if (!s || !att) return;
    const v = String(els.slotClipEnd.value || "").trim();
    att.clipEndSlotId = v ? v : null;
    ensureSlotClipState(s);
    markDirtyBySlotProp(state.activeSlot, "clipEnd");
    refreshSlotUI();
  });
}
if (els.slotClipSetKeyBtn) {
  els.slotClipSetKeyBtn.addEventListener("click", () => {
    if (!state.mesh || state.activeSlot < 0) return;
    const trackId = getSlotTrackId(state.activeSlot, "clip");
    setSelectedTimelineTrack(trackId);
    addOrUpdateKeyframeForTrack(trackId);
  });
}
if (els.slotClipSourceSetKeyBtn) {
  els.slotClipSourceSetKeyBtn.addEventListener("click", () => {
    if (!state.mesh || state.activeSlot < 0) return;
    const trackId = getSlotTrackId(state.activeSlot, "clipSource");
    setSelectedTimelineTrack(trackId);
    addOrUpdateKeyframeForTrack(trackId);
  });
}
if (els.slotClipComboSetKeyBtn) {
  els.slotClipComboSetKeyBtn.addEventListener("click", () => {
    addOrUpdateClipBundleKeyForActiveSlot();
  });
}
if (els.slotClipSourceDelKeyBtn) {
  els.slotClipSourceDelKeyBtn.addEventListener("click", () => {
    if (!state.mesh || state.activeSlot < 0) return;
    const trackId = getSlotTrackId(state.activeSlot, "clipSource");
    if (deleteKeyframeAtCurrentTimeForTrack(trackId)) {
      setStatus(`Clip source key deleted @ ${state.anim.time.toFixed(2)}s`);
    } else {
      setStatus("No clip source key at current time.");
    }
  });
}
if (els.slotClipDelKeyBtn) {
  els.slotClipDelKeyBtn.addEventListener("click", () => {
    if (!state.mesh || state.activeSlot < 0) return;
    const trackId = getSlotTrackId(state.activeSlot, "clip");
    if (deleteKeyframeAtCurrentTimeForTrack(trackId)) {
      setStatus(`Clip key deleted @ ${state.anim.time.toFixed(2)}s`);
    } else {
      setStatus("No clip key at current time.");
    }
  });
}
if (els.slotClipEndSetKeyBtn) {
  els.slotClipEndSetKeyBtn.addEventListener("click", () => {
    if (!state.mesh || state.activeSlot < 0) return;
    const trackId = getSlotTrackId(state.activeSlot, "clipEnd");
    setSelectedTimelineTrack(trackId);
    addOrUpdateKeyframeForTrack(trackId);
  });
}
if (els.slotClipEndDelKeyBtn) {
  els.slotClipEndDelKeyBtn.addEventListener("click", () => {
    if (!state.mesh || state.activeSlot < 0) return;
    const trackId = getSlotTrackId(state.activeSlot, "clipEnd");
    if (deleteKeyframeAtCurrentTimeForTrack(trackId)) {
      setStatus(`Clip end key deleted @ ${state.anim.time.toFixed(2)}s`);
    } else {
      setStatus("No clip end key at current time.");
    }
  });
}

function applyActiveSlotAttachmentMetaFromUI() {
  const s = getActiveSlot();
  if (!s) return false;
  const current = getSlotCurrentAttachmentName(s);
  if (!current) return false;
  const att = getSlotAttachmentEntry(s, current);
  if (!att) return false;
  att.linkedParent = String(els.slotAttachmentLinkedParent ? els.slotAttachmentLinkedParent.value || "" : att.linkedParent || "");
  att.pointX = Number(els.slotAttachmentPointX ? els.slotAttachmentPointX.value : att.pointX) || 0;
  att.pointY = Number(els.slotAttachmentPointY ? els.slotAttachmentPointY.value : att.pointY) || 0;
  att.pointRot = Number(els.slotAttachmentPointRot ? els.slotAttachmentPointRot.value : att.pointRot) || 0;
  att.bboxSource = els.slotAttachmentBBoxSource && els.slotAttachmentBBoxSource.value === "contour" ? "contour" : "fill";
  const seqEnabled = !!(els.slotAttachmentSequenceEnabled && els.slotAttachmentSequenceEnabled.checked);
  const seqCount = Math.max(1, Math.round(Number(els.slotAttachmentSequenceCount ? els.slotAttachmentSequenceCount.value : 1) || 1));
  const seqStart = Math.max(0, Math.round(Number(els.slotAttachmentSequenceStart ? els.slotAttachmentSequenceStart.value : 0) || 0));
  const seqDigits = Math.max(1, Math.round(Number(els.slotAttachmentSequenceDigits ? els.slotAttachmentSequenceDigits.value : 2) || 2));
  const seqSetupIndex = Math.max(0, Math.round(Number(els.slotAttachmentSequenceSetupIndex ? els.slotAttachmentSequenceSetupIndex.value : 0) || 0));
  const seqMode = Number(els.slotAttachmentSequenceMode ? els.slotAttachmentSequenceMode.value : 0) || 0;
  const seqPath = String(els.slotAttachmentSequencePath ? els.slotAttachmentSequencePath.value : "").trim();
  att.sequence = { enabled: seqEnabled, count: seqCount, start: seqStart, digits: seqDigits, setupIndex: seqSetupIndex, mode: seqMode, path: seqPath };
  refreshSlotUI();
  renderBoneTree();
  return true;
}

if (els.slotAttachment) {
  els.slotAttachment.addEventListener("change", () => {
    const s = getActiveSlot();
    if (!s) return;
    ensureSlotAttachments(s);
    const v = String(els.slotAttachment.value || "__none__");
    if (v === "__none__") {
      s.activeAttachment = null;
    } else {
      s.activeAttachment = v;
      const att = getSlotAttachmentEntry(s, v);
      if (att && att.canvas) {
        if (att.placeholder) s.placeholderName = String(att.placeholder);
        // Keep setup attachment stable; selection here is for editing/preview.
        if (!getSlotAttachmentEntry(s, s.attachmentName)) {
          s.attachmentName = att.name;
        }
      }
    }
    ensureSlotAttachmentState(s);
    syncSourceCanvasToActiveAttachment(s);
    markDirtyBySlotProp(state.activeSlot, "attachment");
    refreshSlotUI();
    renderBoneTree();
  });
}
if (els.slotAttachmentVisible) {
  els.slotAttachmentVisible.addEventListener("change", () => {
    const s = getActiveSlot();
    if (!s) return;
    const list = ensureSlotAttachments(s);
    if (!Array.isArray(list) || list.length <= 0) {
      refreshSlotUI();
      return;
    }
    const currentName = getSlotCurrentAttachmentName(s);
    if (els.slotAttachmentVisible.checked) {
      const requested = String((els.slotAttachment && els.slotAttachment.value) || "").trim();
      const restoreName =
        requested && requested !== "__none__" && getSlotAttachmentEntry(s, requested)
          ? requested
          : s.editorHiddenAttachmentName && getSlotAttachmentEntry(s, s.editorHiddenAttachmentName)
            ? String(s.editorHiddenAttachmentName)
            : getSlotAttachmentEntry(s, s.attachmentName)
              ? String(s.attachmentName)
              : String(list[0].name);
      s.activeAttachment = restoreName;
    } else {
      if (currentName) s.editorHiddenAttachmentName = currentName;
      s.activeAttachment = null;
    }
    ensureSlotAttachmentState(s);
    syncSourceCanvasToActiveAttachment(s);
    markDirtyBySlotProp(state.activeSlot, "attachment");
    refreshSlotUI();
    renderBoneTree();
  });
}
if (els.slotAttachmentName) {
  const applyName = () => {
    if (!getActiveSlot()) return;
    renameActiveAttachmentInSlot();
  };
  els.slotAttachmentName.addEventListener("change", applyName);
  els.slotAttachmentName.addEventListener("keydown", (ev) => {
    if (ev.key !== "Enter") return;
    ev.preventDefault();
    applyName();
  });
}
if (els.slotAttachmentType) {
  els.slotAttachmentType.addEventListener("change", () => {
    const s = getActiveSlot();
    const current = s ? getSlotCurrentAttachmentName(s) : null;
    if (!s || !current) return;
    const nextType = normalizeAttachmentType(els.slotAttachmentType.value);
    const converted = convertAttachmentType(s, current, nextType);
    if (!converted) refreshSlotUI();
  });
}
if (els.slotAttachmentLinkedParent) {
  els.slotAttachmentLinkedParent.addEventListener("change", applyActiveSlotAttachmentMetaFromUI);
}
if (els.slotAttachmentPointX) {
  els.slotAttachmentPointX.addEventListener("input", applyActiveSlotAttachmentMetaFromUI);
}
if (els.slotAttachmentPointY) {
  els.slotAttachmentPointY.addEventListener("input", applyActiveSlotAttachmentMetaFromUI);
}
if (els.slotAttachmentPointRot) {
  els.slotAttachmentPointRot.addEventListener("input", applyActiveSlotAttachmentMetaFromUI);
}
if (els.slotAttachmentBBoxSource) {
  els.slotAttachmentBBoxSource.addEventListener("change", applyActiveSlotAttachmentMetaFromUI);
}
if (els.slotAttachmentSequenceEnabled) {
  els.slotAttachmentSequenceEnabled.addEventListener("change", applyActiveSlotAttachmentMetaFromUI);
}
if (els.slotAttachmentSequenceCount) {
  els.slotAttachmentSequenceCount.addEventListener("input", applyActiveSlotAttachmentMetaFromUI);
}
if (els.slotAttachmentSequenceStart) {
  els.slotAttachmentSequenceStart.addEventListener("input", applyActiveSlotAttachmentMetaFromUI);
}
if (els.slotAttachmentSequenceDigits) {
  els.slotAttachmentSequenceDigits.addEventListener("input", applyActiveSlotAttachmentMetaFromUI);
}
if (els.slotAttachmentSequenceSetupIndex) {
  els.slotAttachmentSequenceSetupIndex.addEventListener("input", applyActiveSlotAttachmentMetaFromUI);
}
if (els.slotAttachmentSequenceMode) {
  els.slotAttachmentSequenceMode.addEventListener("change", applyActiveSlotAttachmentMetaFromUI);
}
if (els.slotAttachmentSequencePath) {
  els.slotAttachmentSequencePath.addEventListener("input", applyActiveSlotAttachmentMetaFromUI);
}

function cloneCanvas(src) {
  if (!src) return null;
  const c = makeCanvas(src.width, src.height);
  const cx = c.getContext("2d");
  if (!cx) return null;
  cx.drawImage(src, 0, 0);
  return c;
}

function makeUniqueAttachmentName(slot, base = "attachment") {
  const list = ensureSlotAttachments(slot);
  const used = new Set(list.map((a) => a.name));
  let stem = String(base || "attachment").trim() || "attachment";
  if (!used.has(stem)) return stem;
  let i = 2;
  let next = `${stem}_${i}`;
  while (used.has(next)) {
    i += 1;
    next = `${stem}_${i}`;
  }
  return next;
}

function listAttachmentTypes() {
  return [
    ATTACHMENT_TYPES.REGION,
    ATTACHMENT_TYPES.MESH,
    ATTACHMENT_TYPES.LINKED_MESH,
    ATTACHMENT_TYPES.BOUNDING_BOX,
    ATTACHMENT_TYPES.CLIPPING,
    ATTACHMENT_TYPES.POINT,
  ];
}

/* openAttachmentTypePicker — async popup, returns Promise<string|null>.
   Replaces the old synchronous window.prompt approach. */
function openAttachmentTypePicker(initialType = ATTACHMENT_TYPES.REGION, title = "Choose Attachment Type") {
  return new Promise((resolve) => {
    const wrap = els.attTypePickerWrap;
    const grid = els.attTypePickerGrid;
    const titleEl = els.attTypePickerTitle;
    const closeBtn = els.attTypePickerCloseBtn;
    const backdrop = els.attTypePickerBackdrop;
    if (!wrap || !grid) { resolve(null); return; }

    if (titleEl) titleEl.textContent = title;

    /* Highlight initial selection */
    const normalised = normalizeAttachmentType(initialType);
    for (const btn of grid.querySelectorAll(".att-type-picker-btn")) {
      btn.classList.toggle("selected", btn.dataset.type === normalised);
    }

    wrap.classList.remove("collapsed");
    wrap.setAttribute("aria-hidden", "false");

    const cleanup = () => {
      wrap.classList.add("collapsed");
      wrap.setAttribute("aria-hidden", "true");
      grid.removeEventListener("click", onGridClick);
      closeBtn && closeBtn.removeEventListener("click", onClose);
      backdrop && backdrop.removeEventListener("click", onClose);
      document.removeEventListener("keydown", onKey);
    };

    const onGridClick = (ev) => {
      const btn = ev.target.closest(".att-type-picker-btn[data-type]");
      if (!btn) return;
      cleanup();
      resolve(normalizeAttachmentType(btn.dataset.type));
    };

    const onClose = () => { cleanup(); resolve(null); };
    const onKey = (ev) => { if (ev.key === "Escape") { ev.preventDefault(); onClose(); } };

    grid.addEventListener("click", onGridClick);
    closeBtn && closeBtn.addEventListener("click", onClose);
    backdrop && backdrop.addEventListener("click", onClose);
    document.addEventListener("keydown", onKey);
  });
}

/* Legacy sync shim — kept for any remaining call sites;
   callers should migrate to openAttachmentTypePicker() */
function openAttachmentTypeDialog(initialType = ATTACHMENT_TYPES.REGION) {
  const fallback = normalizeAttachmentType(initialType);
  const raw = window.prompt(
    `Attachment type (${listAttachmentTypes().join(", ")})`,
    fallback
  );
  if (raw == null) return null;
  const nextType = normalizeAttachmentType(raw);
  if (!listAttachmentTypes().includes(nextType)) {
    setStatus(`Unknown attachment type: ${raw}`);
    return null;
  }
  return nextType;
}

function buildDefaultAttachmentContour(slot) {
  const rect = slot && slot.rect
    ? slot.rect
    : { x: 0, y: 0, w: Math.max(1, Number(state.imageWidth) || 64), h: Math.max(1, Number(state.imageHeight) || 64) };
  const x = Number(rect.x) || 0;
  const y = Number(rect.y) || 0;
  const w = Math.max(1, Number(rect.w) || 1);
  const h = Math.max(1, Number(rect.h) || 1);
  const points = [
    { x, y },
    { x: x + w, y },
    { x: x + w, y: y + h },
    { x, y: y + h },
  ];
  return {
    points: points.map((p) => ({ ...p })),
    sourcePoints: points.map((p) => ({ ...p })),
    authorContourPoints: points.map((p) => ({ ...p })),
    closed: true,
    triangles: [],
    fillPoints: [],
    fillTriangles: [],
    manualEdges: [],
    fillManualEdges: [],
    contourEdges: [[0, 1], [1, 2], [2, 3], [3, 0]],
  };
}

function getAttachmentSeedData(slot, type, sourceAttachment = null) {
  const attType = normalizeAttachmentType(type);
  const current = sourceAttachment || getActiveAttachment(slot);
  const rect = slot && slot.rect ? JSON.parse(JSON.stringify(slot.rect)) : null;
  const sourceCanvas = current && current.canvas ? current.canvas : getSlotCanvas(slot);
  const sourceContour = current && current.meshContour ? cloneSlotContourData(current.meshContour) : buildDefaultAttachmentContour(slot);
  const pointCenter = rect
    ? {
        x: (Number(rect.x) || 0) + (Number(rect.w) || 0) * 0.5,
        y: (Number(rect.y) || 0) + (Number(rect.h) || 0) * 0.5,
      }
    : { x: 0, y: 0 };
  const data = {
    type: attType,
    canvas: isVisualAttachment({ type: attType }) ? cloneCanvas(sourceCanvas) || sourceCanvas || null : null,
    rect,
    baseImageTransform: normalizeBaseImageTransform(current && current.baseImageTransform),
    meshData: current && current.meshData ? cloneSlotMeshData(current.meshData) : null,
    meshContour: attachmentHasMesh({ type: attType }) ? sourceContour : null,
    linkedParent: current && current.linkedParent ? String(current.linkedParent) : "",
    bboxSource: current && current.bboxSource === "contour" ? "contour" : "fill",
    pointX: current && Number.isFinite(Number(current.pointX)) ? Number(current.pointX) : pointCenter.x,
    pointY: current && Number.isFinite(Number(current.pointY)) ? Number(current.pointY) : pointCenter.y,
    pointRot: current && Number.isFinite(Number(current.pointRot)) ? Number(current.pointRot) : 0,
    useWeights: current ? current.useWeights === true : false,
    weightBindMode: current && current.weightBindMode ? String(current.weightBindMode) : "none",
    weightMode: current && current.weightMode ? String(current.weightMode) : "free",
    influenceBones: Array.isArray(current && current.influenceBones) ? current.influenceBones.filter((v) => Number.isFinite(v)) : [],
    clipEnabled: attType === ATTACHMENT_TYPES.CLIPPING,
    clipSource: current && current.clipSource === "contour" ? "contour" : "fill",
    clipEndSlotId: current && current.clipEndSlotId ? String(current.clipEndSlotId) : null,
    sequence: current && current.sequence ? { ...current.sequence } : { enabled: false, count: 1, start: 0, digits: 2 },
  };
  if (attType === ATTACHMENT_TYPES.LINKED_MESH && !data.linkedParent) {
    const fallbackParent = ensureSlotAttachments(slot).find((att) => att && att.name !== (current && current.name) && isVisualAttachment(att));
    data.linkedParent = fallbackParent ? String(fallbackParent.name) : "";
  }
  if (attType === ATTACHMENT_TYPES.BOUNDING_BOX) {
    data.canvas = null;
    data.meshData = null;
    data.clipEnabled = false;
    data.clipEndSlotId = null;
  }
  if (attType === ATTACHMENT_TYPES.CLIPPING) {
    data.canvas = null;
    data.meshData = null;
  }
  if (attType === ATTACHMENT_TYPES.POINT) {
    data.canvas = null;
    data.meshData = null;
    data.meshContour = null;
    data.clipEnabled = false;
    data.clipEndSlotId = null;
  }
  return data;
}

function clearAttachmentAnimationTracks(slotIndex, attachmentName) {
  const anim = getCurrentAnimation();
  if (!anim || !anim.tracks) return;
  const deformTrackId = getVertexTrackId(slotIndex, attachmentName);
  if (anim.tracks[deformTrackId]) delete anim.tracks[deformTrackId];
}

function addAttachmentOfType(slot, type, opts = {}) {
  const s = slot || getActiveSlot();
  if (!s) return null;
  const attType = normalizeAttachmentType(type);
  const base = String(opts.baseName || getSlotCurrentAttachmentName(s) || s.attachmentName || attType || "attachment");
  const name = makeUniqueAttachmentName(s, base);
  const seed = getAttachmentSeedData(s, attType, opts.sourceAttachment || null);
  const placeholder = String(opts.placeholder || s.placeholderName || s.attachmentName || "main");
  const record = normalizeSlotAttachmentRecord(
    s,
    {
      ...seed,
      name,
      placeholder,
      linkedParent: opts.linkedParent != null ? String(opts.linkedParent) : seed.linkedParent,
    },
    name,
    placeholder,
    seed.canvas
  );
  ensureSlotAttachments(s).push(record);
  s.activeAttachment = record.name;
  ensureSlotAttachmentState(s);
  if (state.mesh && (attType === ATTACHMENT_TYPES.MESH || attType === ATTACHMENT_TYPES.LINKED_MESH)) {
    ensureSlotMeshData(s, state.mesh);
    rebuildSlotWeights(s, state.mesh);
  }
  syncSourceCanvasToActiveAttachment(s);
  refreshSlotUI();
  renderBoneTree();
  renderTimelineTracks();
  return record;
}

function duplicateAttachment(slot, name) {
  const s = slot || getActiveSlot();
  if (!s) return null;
  const source = getSlotAttachmentEntry(s, name || getSlotCurrentAttachmentName(s));
  if (!source) return null;
  return addAttachmentOfType(s, source.type, {
    baseName: `${source.name}_copy`,
    placeholder: source.placeholder,
    sourceAttachment: source,
    linkedParent: source.linkedParent || "",
  });
}

function convertAttachmentType(slot, name, nextType) {
  const s = slot || getActiveSlot();
  if (!s) return null;
  const current = getSlotAttachmentEntry(s, name || getSlotCurrentAttachmentName(s));
  if (!current) return null;
  const targetType = normalizeAttachmentType(nextType);
  if (targetType === normalizeAttachmentType(current.type)) return current;
  const idx = ensureSlotAttachments(s).findIndex((att) => att && att.name === current.name);
  if (idx < 0) return null;
  const dataLoss =
    isDeformableAttachment(current) &&
    !isDeformableAttachment({ type: targetType }) &&
    current.meshData;
  if (dataLoss && !window.confirm(`Switch "${current.name}" to ${targetType}? Mesh deformation data may stop applying.`)) {
    refreshSlotUI();
    return current;
  }
  const replacement = normalizeSlotAttachmentRecord(
    s,
    {
      ...getAttachmentSeedData(s, targetType, current),
      name: current.name,
      placeholder: current.placeholder,
    },
    current.name,
    current.placeholder,
    current.canvas || getSlotCanvas(s)
  );
  ensureSlotAttachments(s)[idx] = replacement;
  if (!isDeformableAttachment(replacement)) clearAttachmentAnimationTracks(state.activeSlot, replacement.name);
  s.activeAttachment = replacement.name;
  ensureSlotAttachmentState(s);
  if (state.mesh && (targetType === ATTACHMENT_TYPES.MESH || targetType === ATTACHMENT_TYPES.LINKED_MESH)) {
    ensureSlotMeshData(s, state.mesh);
    rebuildSlotWeights(s, state.mesh);
  }
  syncSourceCanvasToActiveAttachment(s);
  refreshSlotUI();
  renderBoneTree();
  renderTimelineTracks();
  return replacement;
}

async function addAttachmentToActiveSlot() {
  const s = getActiveSlot();
  if (!s) return false;
  const pickedType = await openAttachmentTypePicker(ATTACHMENT_TYPES.REGION, "Add Attachment");
  if (!pickedType) return false;
  const created = addAttachmentOfType(s, pickedType);
  if (!created) return false;
  if (els.slotAttachmentName) {
    els.slotAttachmentName.focus();
    els.slotAttachmentName.select();
  }
  setStatus(`Attachment added: ${created.name} (${pickedType})`);
  return true;
}

function renameActiveAttachmentInSlot() {
  const s = getActiveSlot();
  if (!s) return false;
  const current = getSlotCurrentAttachmentName(s);
  if (!current) return false;
  const rawNext = String((els.slotAttachmentName && els.slotAttachmentName.value) || "").trim();
  if (!rawNext || rawNext === current) return false;
  const used = new Set(ensureSlotAttachments(s).map((a) => a.name).filter((n) => n !== current));
  let nextName = rawNext;
  if (used.has(nextName)) {
    let i = 2;
    let cand = `${rawNext}_${i}`;
    while (used.has(cand)) {
      i += 1;
      cand = `${rawNext}_${i}`;
    }
    nextName = cand;
  }
  const att = getSlotAttachmentEntry(s, current);
  if (!att) return false;
  att.name = nextName;
  if (s.attachmentName === current) s.attachmentName = nextName;
  if (s.activeAttachment === current) s.activeAttachment = nextName;
  if (s.id) {
    for (const skin of ensureSkinSets()) {
      if (!skin || !skin.slotAttachments || typeof skin.slotAttachments !== "object") continue;
      if (skin.slotAttachments[s.id] === current) skin.slotAttachments[s.id] = nextName;
    }
  }
  const anim = getCurrentAnimation();
  if (anim && anim.tracks) {
    for (const trackId of Object.keys(anim.tracks)) {
      const p = parseTrackId(trackId);
      if (!p || p.type !== "slot" || p.prop !== "attachment" || p.slotIndex !== state.activeSlot) continue;
      const keys = getTrackKeys(anim, trackId);
      for (const k of keys) {
        if (k && typeof k.value === "string" && k.value === current) k.value = nextName;
      }
      normalizeTrackKeys(anim, trackId);
    }
    const oldDeformTrackId = getVertexTrackId(state.activeSlot, current);
    const newDeformTrackId = getVertexTrackId(state.activeSlot, nextName);
    if (anim.tracks[oldDeformTrackId]) {
      anim.tracks[newDeformTrackId] = Array.isArray(anim.tracks[oldDeformTrackId])
        ? anim.tracks[oldDeformTrackId].map((key) => ({ ...key }))
        : [];
      delete anim.tracks[oldDeformTrackId];
      normalizeTrackKeys(anim, newDeformTrackId);
    }
  }
  refreshSlotUI();
  renderTimelineTracks();
  setStatus(`Attachment renamed: ${current} -> ${nextName}`);
  return true;
}

function deleteActiveAttachmentInSlot() {
  const s = getActiveSlot();
  if (!s) return false;
  const current = getSlotCurrentAttachmentName(s);
  if (!current) return false;
  const list = ensureSlotAttachments(s);
  if (list.length <= 1) {
    setStatus("Keep at least one attachment.");
    return false;
  }
  const idx = list.findIndex((a) => a.name === current);
  if (idx < 0) return false;
  list.splice(idx, 1);
  const next = list[Math.max(0, Math.min(idx, list.length - 1))];
  s.activeAttachment = next ? next.name : null;
  if (s.attachmentName === current) s.attachmentName = next ? next.name : "main";
  if (s.id) {
    for (const skin of ensureSkinSets()) {
      if (!skin || !skin.slotAttachments || typeof skin.slotAttachments !== "object") continue;
      if (skin.slotAttachments[s.id] === current) {
        skin.slotAttachments[s.id] = next ? next.name : null;
      }
    }
  }
  const anim = getCurrentAnimation();
  if (anim && anim.tracks) {
    for (const trackId of Object.keys(anim.tracks)) {
      const p = parseTrackId(trackId);
      if (!p || p.type !== "slot" || p.prop !== "attachment" || p.slotIndex !== state.activeSlot) continue;
      const keys = getTrackKeys(anim, trackId);
      for (const k of keys) {
        if (k && typeof k.value === "string" && k.value === current) k.value = null;
      }
      normalizeTrackKeys(anim, trackId);
    }
  }
  clearAttachmentAnimationTracks(state.activeSlot, current);
  syncSourceCanvasToActiveAttachment(s);
  refreshSlotUI();
  renderTimelineTracks();
  setStatus(`Attachment deleted: ${current}`);
  return true;
}

if (els.slotAttachmentAddBtn) {
  els.slotAttachmentAddBtn.addEventListener("click", () => {
    addAttachmentToActiveSlot();
  });
}
if (els.slotAttachmentDuplicateBtn) {
  els.slotAttachmentDuplicateBtn.addEventListener("click", () => {
    const s = getActiveSlot();
    const current = s ? getSlotCurrentAttachmentName(s) : null;
    if (!s || !current) return;
    const created = duplicateAttachment(s, current);
    if (!created) return;
    setStatus(`Attachment duplicated: ${created.name}`);
  });
}
if (els.slotAttachmentDeleteBtn) {
  els.slotAttachmentDeleteBtn.addEventListener("click", () => {
    deleteActiveAttachmentInSlot();
  });
}

if (els.slotAttachmentLoadBtn && els.slotAttachmentFileInput) {
  els.slotAttachmentLoadBtn.addEventListener("click", () => {
    if (!getActiveSlot()) return;
    els.slotAttachmentFileInput.click();
  });
  els.slotAttachmentFileInput.addEventListener("change", async () => {
    const s = getActiveSlot();
    const f = els.slotAttachmentFileInput.files && els.slotAttachmentFileInput.files[0];
    els.slotAttachmentFileInput.value = "";
    if (!s || !f) return;
    const current = getSlotCurrentAttachmentName(s);
    if (!current) {
      setStatus("Select an attachment (not none) first.");
      return;
    }
    try {
      const bmp = await createImageBitmap(f);
      const targetRect = s.rect || { w: bmp.width, h: bmp.height };
      const cv = makeCanvas(Math.max(1, Number(targetRect.w) || bmp.width), Math.max(1, Number(targetRect.h) || bmp.height));
      const cx = cv.getContext("2d");
      if (!cx) return;
      cx.drawImage(bmp, 0, 0, bmp.width, bmp.height, 0, 0, cv.width, cv.height);
      const att = getSlotAttachmentEntry(s, current);
      if (!att) return;
      att.canvas = cv;
      syncSourceCanvasToActiveAttachment(s);
      refreshSlotUI();
      setStatus(`Attachment image updated: ${current}`);
    } catch (err) {
      setStatus(`Load attachment image failed: ${err.message}`);
    }
  });
}

if (els.slotAlpha) {
  els.slotAlpha.addEventListener("input", () => {
    const s = getActiveSlot();
    if (!s) return;
    s.alpha = math.clamp(Number(els.slotAlpha.value) || 1, 0, 1);
    markDirtyBySlotProp(state.activeSlot, "color");
  });
}
if (els.slotColor) {
  els.slotColor.addEventListener("input", () => {
    const s = getActiveSlot();
    if (!s) return;
    const c = colorHexToRgb01(els.slotColor.value || "#ffffff");
    s.r = c.r;
    s.g = c.g;
    s.b = c.b;
    markDirtyBySlotProp(state.activeSlot, "color");
  });
}
if (els.slotBlend) {
  els.slotBlend.addEventListener("change", () => {
    const s = getActiveSlot();
    if (!s) return;
    s.blend = normalizeSlotBlendMode(els.slotBlend.value);
    refreshSlotUI();
  });
}
if (els.slotDarkEnabled) {
  els.slotDarkEnabled.addEventListener("change", () => {
    const s = getActiveSlot();
    if (!s) return;
    s.darkEnabled = !!els.slotDarkEnabled.checked;
    markDirtyBySlotProp(state.activeSlot, "color");
    refreshSlotUI();
  });
}
if (els.slotDarkColor) {
  els.slotDarkColor.addEventListener("input", () => {
    const s = getActiveSlot();
    if (!s) return;
    const c = colorHexToRgb01(els.slotDarkColor.value || "#000000");
    s.dr = c.r;
    s.dg = c.g;
    s.db = c.b;
    if (els.slotDarkEnabled && els.slotDarkEnabled.checked) s.darkEnabled = true;
    markDirtyBySlotProp(state.activeSlot, "color");
    refreshSlotUI();
  });
}

if (els.slotWeightMode) {
  els.slotWeightMode.addEventListener("change", () => {
    const mode = els.slotWeightMode.value === "weighted" ? "weighted" : els.slotWeightMode.value === "free" ? "free" : "single";
    applyActiveSlotWeightMode(mode, { focusWeighted: false });
  });
}

if (els.slotWeightQuickWeightedBtn) {
  els.slotWeightQuickWeightedBtn.addEventListener("click", () => {
    applyActiveSlotWeightMode("weighted", { focusWeighted: true });
  });
}
if (els.slotWeightQuickSingleBtn) {
  els.slotWeightQuickSingleBtn.addEventListener("click", () => {
    applyActiveSlotWeightMode("single", { focusWeighted: false });
  });
}
if (els.slotWeightQuickFreeBtn) {
  els.slotWeightQuickFreeBtn.addEventListener("click", () => {
    applyActiveSlotWeightMode("free", { focusWeighted: false });
  });
}
if (els.slotWeightQuickEditBtn) {
  els.slotWeightQuickEditBtn.addEventListener("click", () => {
    const s = getActiveSlot();
    if (!s || !state.mesh) return;
    if (getSlotWeightMode(s) !== "weighted") {
      applyActiveSlotWeightMode("weighted", { focusWeighted: true });
      return;
    }
    switchToVertexWeightEditing();
    setStatus("Weight editing mode ready. Gradient weights are shown on the canvas.");
  });
}

if (els.slotInfluenceBones) {
  els.slotInfluenceBones.addEventListener("change", () => {
    const s = getActiveSlot();
    if (!s || !state.mesh) return;
    const att = getActiveAttachment(s);
    if (!att) return;
    const mode = getSlotWeightMode(s);
    if (mode !== "weighted") return;
    const selected = Array.from(els.slotInfluenceBones.selectedOptions)
      .map((o) => Number(o.value))
      .filter((v) => Number.isFinite(v));
    att.influenceBones = selected.length > 0 ? [...new Set(selected)] : getSlotInfluenceBones(s, state.mesh, att);
    rebuildSlotWeights(s, state.mesh);
  });
}

function applySlotTransformFromInputs() {
  const s = getActiveSlot();
  if (!s) return;
  s.tx = Number(els.slotTx.value) || 0;
  s.ty = Number(els.slotTy.value) || 0;
  s.rot = math.degToRad(Number(els.slotRot.value) || 0);
}

if (els.slotTx) {
  els.slotTx.addEventListener("input", applySlotTransformFromInputs);
}
if (els.slotTy) {
  els.slotTy.addEventListener("input", applySlotTransformFromInputs);
}
if (els.slotRot) {
  els.slotRot.addEventListener("input", applySlotTransformFromInputs);
}

function moveActiveSlot(delta) {
  const i = state.activeSlot;
  const j = i + delta;
  if (i < 0 || j < 0 || j >= state.slots.length) return;
  const tmp = state.slots[i];
  state.slots[i] = state.slots[j];
  state.slots[j] = tmp;
  state.activeSlot = j;
  markDirtyDrawOrder();
  refreshSlotUI();
  renderBoneTree();
}

if (els.slotOrderUp) {
  els.slotOrderUp.addEventListener("click", () => {
    moveActiveSlot(-1);
  });
}
if (els.slotOrderDown) {
  els.slotOrderDown.addEventListener("click", () => {
    moveActiveSlot(1);
  });
}

if (els.fileNewBtn) {
  els.fileNewBtn.addEventListener("click", () => {
    state.sourceCanvas = null;
    resetGLTextureCache();
    state.imageWidth = 0;
    state.imageHeight = 0;
    state.slots = [];
    state.activeSlot = -1;
    state.slotViewMode = "all";
    state.boneTreeSelectedSlotByBone = Object.create(null);
    state.baseImageTransform = normalizeBaseImageTransform({ enabled: false, tx: 0, ty: 0, rot: 0, scale: 1 });
    state.mesh = null;
    state.rigCoordinateSpace = "runtime";
    state.rigEditNeedsRuntimeNormalize = false;
    clearRigEditPreviewCache();
    state.selectedBone = -1;
    state.selectedBonesForWeight = [];
    state.selectedIK = -1;
    state.selectedTransform = -1;
    state.selectedPath = -1;
    state.skinSets = [];
    state.selectedSkinSet = -1;
    state.anim.animations = [createAnimation("Anim 1")];
    state.anim.currentAnimId = state.anim.animations[0].id;
    state.anim.selectedTrack = "";
    state.anim.selectedKey = null;
    state.anim.selectedKeys = [];
    state.anim.playing = false;
    state.anim.mix.active = false;
    state.anim.dirtyTracks = [];
    state.anim.groupMute = {};
    state.anim.groupSolo = {};
    state.anim.filterText = "";
    state.anim.onlyKeyed = false;
    state.anim.autoKey = false;
    state.anim.autoKeyPending = false;
    state.anim.batchExportOpen = false;
    state.anim.batchExport = {
      format: "webm",
      fps: 15,
      prefix: "batch",
      retries: 1,
      delayMs: 120,
      zipPng: true,
    };
    state.anim.onionSkin = {
      enabled: false,
      prevFrames: 2,
      nextFrames: 2,
      alpha: 0.22,
    };
    state.anim.layerTracks = [];
    state.anim.selectedLayerTrackId = "";
    state.anim.stateMachine = {
      enabled: true,
      states: [],
      parameters: [],
      currentStateId: "",
      selectedParamId: "",
      selectedTransitionId: "",
      selectedConditionId: "",
      pendingStateId: "",
      pendingDuration: 0.2,
    };
    state.history.undo = [];
    state.history.redo = [];
    state.history.lastSig = "";
    setAnimTime(0);
    refreshAnimationUI();
    pushUndoCheckpoint(true);
    refreshSlotUI();
    updatePlaybackButtons();
    renderBoneTree();
    saveAutosaveSnapshot("new_project", true);
    setStatus("New project created.");
  });
}
