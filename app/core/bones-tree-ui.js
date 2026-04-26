// ROLE: Bone tree DOM render + property-panel UI updates + workspace
// tab visibility wiring. Extracted from bones.js to keep the rig-math
// core (cloneBones, computeWorld, weight ops, pose sync) under one
// file and the heavy DOM-building UI under another.
// EXPORTS:
//   - updateBoneSelectors, updateBoneUI, refreshBoneEditHintBar
//   - renderBoneTree (the main bone tree DOM rebuild — 400+ lines)
//   - commitBoneTreeInlineRename, startBoneTreeInlineRename,
//     clearBoneTreeInlineRename, isBoneTreeInlineRename,
//     focusBoneTreeInlineRenameInput
//   - openBoneDeleteQuickMenu, toggleBoneDeleteQuickMenu,
//     refreshBoneDeleteQuickMenuUI, closeBoneDeleteQuickMenu
//   - refreshBoneTreeFilterUI, isValidParent, ensureSelectedBoneInRange
//   - updateWorkspaceUI (workspace tab visibility per mode/page)
//   - setWorkspacePage, setupLeftToolTabs
// CONSUMERS: triggered after every state change that affects bones,
// slots, attachments, animations, or workspace mode.

// ---- Block A: bone tree + property panel UI (was bones.js 1744-2480)

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
  if (typeof refreshPhysicsUI === "function") refreshPhysicsUI();
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
  const physicsBones = typeof getPhysicsConstrainedBoneSet === "function" ? getPhysicsConstrainedBoneSet(m) : new Set();
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
      const isPhysics = physicsBones.has(i);
      const hiddenWork = isBoneWorkspaceHidden(m, i);
      const hiddenWorkSlots = hiddenWork && getGlobalBoneWorkHideMode() === "bone_and_slots";
      const hiddenAnim = state.boneMode === "pose" && isBoneAnimationHidden(activeBones, i);
      const hiddenSkin = typeof isBoneHiddenBySkin === "function" ? isBoneHiddenBySkin(m, i) : false;
      row.className = `tree-item${state.selectedBone === i ? " selected" : ""}${picked ? " weight-picked" : ""}${parentCandidate ? " parent-candidate" : ""
        }${ikTargetCandidate ? " ik-target-candidate" : ""}${isIK ? " ik-bone" : ""}${isIKTarget ? " ik-target-bone" : ""}${isTFC ? " ik-bone" : ""
        }${isTFCTarget ? " ik-target-bone" : ""}${isPath ? " ik-bone" : ""}${isPathTarget ? " ik-target-bone" : ""}${isPhysics ? " ik-bone" : ""}${hiddenWork || hiddenAnim ? " bone-hidden" : ""
        }${hiddenSkin ? " bone-hidden-skin" : ""}`;
      row.style.setProperty("--tree-row-depth", String(depth));
      row.style.setProperty("--tree-row-extra", "0");
      row.dataset.boneIndex = String(i);
      row.dataset.rootBone = isRootBoneIndex(bones, i) ? "1" : "0";
      // Apply user bone color to the left type bar via inline custom property,
      // overriding the default --tree-type-color-bone for this row only.
      if (typeof b.color === "string" && /^#?[0-9a-fA-F]{6}$/.test(b.color.trim())) {
        const c = b.color.trim();
        row.style.setProperty("--tree-type-color-bone", c.startsWith("#") ? c : "#" + c);
      }
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


// ---- Block B: workspace UI (was bones.js 4144-end)

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
    ? { canvas: false, setup: false, rig: false, object: false, ik: false, constraint: false, path: false, physics: false, skin: false, tools: false, slotmesh: false }
    : {
      canvas:     isMeshPage || isAnimPage,
      setup:      isRigPage || isAnimPage,   // "Bones" tab
      rig:        isRigPage && isRigEdit,
      object:     isObjPage,
      ik:         (isRigPage || isAnimPage) && isSkeleton,
      constraint: (isRigPage || isAnimPage) && isSkeleton,
      path:       (isRigPage || isAnimPage) && isSkeleton,
      physics:    (isRigPage || isAnimPage) && isSkeleton,
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
    physics: els.leftTabPhysics,
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
    physics: els.leftPhysicsTools,
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
  bind(els.leftTabPhysics, "physics");
  bind(els.leftTabSkin, "skin");
  bind(els.leftTabTools, "tools");
  bind(els.leftTabSlotMesh, "slotmesh");
}
