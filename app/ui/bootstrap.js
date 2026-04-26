// ROLE: App bootstrap — runs once at end of script load. Wires up
// remaining UI controls (mesh tools, weight brush, weight overlay,
// fullscreen, atlas options), reads URL params, restores autosave,
// schedules first render, sets initial workspace.
// EXPORTS:
//   - toggleFullscreen, setupFullscreenButton, setupMeshTopologyButtons,
//     setupWeightBrushUI, setupWeightOverlayQuickToggle,
//     setupWeightPruneUI, setupWeightWeldSwapUI, refreshWeightOverlayQuickBtn
//   - dispatchMeshHotkey
// SIDE EFFECTS: This file's top-level statements run on load and wire
// listeners. Anything in here changes app behavior immediately.
function toggleFullscreen() {
  const electronApi = typeof window !== "undefined" ? window.electronAPI : null;
  if (electronApi && typeof electronApi.toggleFullscreen === "function") {
    try { electronApi.toggleFullscreen(); } catch (err) { console.warn("[fullscreen] electron toggle failed", err); }
    return;
  }
  const doc = document;
  const isFs = !!(doc.fullscreenElement || doc.webkitFullscreenElement);
  if (isFs) {
    const exit = doc.exitFullscreen || doc.webkitExitFullscreen;
    if (!exit) { console.warn("[fullscreen] exitFullscreen not supported"); return; }
    const result = exit.call(doc);
    if (result && typeof result.catch === "function") result.catch((err) => console.warn("[fullscreen] exit failed", err));
  } else {
    const root = doc.documentElement;
    const req = root.requestFullscreen || root.webkitRequestFullscreen;
    if (!req) { console.warn("[fullscreen] requestFullscreen not supported"); return; }
    const result = req.call(root);
    if (result && typeof result.catch === "function") result.catch((err) => console.warn("[fullscreen] request failed", err));
  }
}

function setupFullscreenButton() {
  const btn = document.getElementById("fullscreenBtn");
  const syncState = () => {
    const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
    document.body.dataset.fullscreen = isFs ? "true" : "false";
    if (btn) {
      btn.textContent = isFs ? "⛌" : "⛶";
      btn.title = isFs ? "Exit Fullscreen (F11)" : "Fullscreen (F11)";
    }
  };
  if (btn) btn.addEventListener("click", toggleFullscreen);
  document.addEventListener("fullscreenchange", syncState);
  document.addEventListener("webkitfullscreenchange", syncState);
  syncState();
}

// Mesh topology buttons (Pin / Unpin / Relax / Add / Delete) dispatch synthetic
// keydown events so the existing hotkey handlers remain the single source of truth.
function dispatchMeshHotkey(key, modifiers = {}) {
  const ev = new KeyboardEvent("keydown", {
    key,
    bubbles: true,
    cancelable: true,
    shiftKey: !!modifiers.shift,
    ctrlKey: !!modifiers.ctrl,
    altKey: !!modifiers.alt,
    metaKey: !!modifiers.meta,
  });
  window.dispatchEvent(ev);
}

function setupMeshTopologyButtons() {
  if (els.slotMeshAddVertexBtn) {
    els.slotMeshAddVertexBtn.addEventListener("click", () => dispatchMeshHotkey("v"));
  }
  if (els.slotMeshDeleteVertexBtn) {
    els.slotMeshDeleteVertexBtn.addEventListener("click", () => dispatchMeshHotkey("Delete"));
  }
  if (els.slotMeshPinBtn) {
    els.slotMeshPinBtn.addEventListener("click", () => dispatchMeshHotkey("p"));
  }
  if (els.slotMeshUnpinBtn) {
    els.slotMeshUnpinBtn.addEventListener("click", () => dispatchMeshHotkey("u"));
  }
  if (els.slotMeshRelaxBtn) {
    els.slotMeshRelaxBtn.addEventListener("click", (ev) => dispatchMeshHotkey("m", { shift: ev.shiftKey }));
  }
  if (els.slotMeshCopyWeightsBtn) {
    els.slotMeshCopyWeightsBtn.addEventListener("click", () => {
      const r = copyVertexWeightsToClipboard();
      setStatus(r.ok
        ? `Copied weights from vertex ${r.sourceVertex} (${r.boneCount} bones).`
        : `Copy weights: ${r.reason}`);
    });
  }
  if (els.slotMeshPasteWeightsBtn) {
    els.slotMeshPasteWeightsBtn.addEventListener("click", () => {
      const r = pasteVertexWeightsFromClipboard();
      if (r.ok) {
        setStatus(`Pasted weights to ${r.count} vertex(es).`);
        if (typeof requestRender === "function") requestRender("ui");
        if (typeof pushUndoCheckpoint === "function") pushUndoCheckpoint(true);
      } else {
        setStatus(`Paste weights: ${r.reason}`);
      }
    });
  }
  if (els.slotMeshSubdivideBtn) {
    els.slotMeshSubdivideBtn.addEventListener("click", () => {
      const slot = getActiveSlot();
      if (!slot) { setStatus("Subdivide: no active slot."); return; }
      if (typeof pushUndoCheckpoint === "function") pushUndoCheckpoint(true);
      const r = subdivideSelectedTriangles(slot);
      setStatus(r.ok ? `Subdivided ${r.added} triangle(s).` : `Subdivide: ${r.reason}`);
      if (r.ok) {
        if (typeof pushUndoCheckpoint === "function") pushUndoCheckpoint(true);
        if (typeof requestRender === "function") requestRender("subdivide");
      }
    });
  }
  if (els.slotMeshAddCentroidBtn) {
    els.slotMeshAddCentroidBtn.addEventListener("click", () => {
      const slot = getActiveSlot();
      if (!slot) { setStatus("Add Centroid: no active slot."); return; }
      if (typeof pushUndoCheckpoint === "function") pushUndoCheckpoint(true);
      const r = addCentroidVertex(slot);
      setStatus(r.ok ? `Added vertex at (${r.addedAt.x.toFixed(1)}, ${r.addedAt.y.toFixed(1)}).` : `Add Centroid: ${r.reason}`);
      if (r.ok) {
        if (typeof pushUndoCheckpoint === "function") pushUndoCheckpoint(true);
        if (typeof requestRender === "function") requestRender("add-centroid");
      }
    });
  }
  if (els.slotMeshFlipEdgeBtn) {
    els.slotMeshFlipEdgeBtn.addEventListener("click", () => {
      const slot = getActiveSlot();
      if (!slot) { setStatus("Flip Edge: no active slot."); return; }
      if (typeof pushUndoCheckpoint === "function") pushUndoCheckpoint(true);
      const r = flipSelectedEdge(slot);
      setStatus(r.ok ? `Flipped edge ${r.oldEdge.join("-")} → ${r.newEdge.join("-")}.` : `Flip Edge: ${r.reason}`);
      if (r.ok) {
        if (typeof pushUndoCheckpoint === "function") pushUndoCheckpoint(true);
        if (typeof requestRender === "function") requestRender("flip-edge");
      }
    });
  }
  if (els.slotMeshGenerateBtn) {
    els.slotMeshGenerateBtn.addEventListener("click", () => {
      const slot = getActiveSlot();
      if (!slot) { setStatus("Generate: no active slot."); return; }
      const ratio = els.slotMeshGenerateRatio ? Number(els.slotMeshGenerateRatio.value) : 0.015;
      if (typeof pushUndoCheckpoint === "function") pushUndoCheckpoint(true);
      const r = generateMeshVerticesByArea(slot, { areaRatio: ratio });
      if (r.ok) {
        setStatus(`Generated ${r.addedVertices} vertices (${r.iters} iter, ${r.finalTriangleCount} triangles).`);
        if (typeof pushUndoCheckpoint === "function") pushUndoCheckpoint(true);
        if (typeof requestRender === "function") requestRender("generate-verts");
      } else {
        setStatus(`Generate: ${r.reason || "no change"}`);
      }
    });
  }
}

function setupWeightBrushUI() {
  if (els.weightBrushToggle) {
    els.weightBrushToggle.addEventListener("change", () => {
      setWeightBrushActive(!!els.weightBrushToggle.checked);
    });
  }
  if (els.weightBrushAddBtn) {
    els.weightBrushAddBtn.addEventListener("click", () => setWeightBrushMode("add"));
  }
  if (els.weightBrushRemoveBtn) {
    els.weightBrushRemoveBtn.addEventListener("click", () => setWeightBrushMode("remove"));
  }
  if (els.weightBrushReplaceBtn) {
    els.weightBrushReplaceBtn.addEventListener("click", () => setWeightBrushMode("replace"));
  }
  if (els.weightBrushSmoothBtn) {
    els.weightBrushSmoothBtn.addEventListener("click", () => setWeightBrushMode("smooth"));
  }
  if (els.weightBrushSize) {
    els.weightBrushSize.addEventListener("input", () => {
      const v = Number(els.weightBrushSize.value);
      if (Number.isFinite(v)) state.weightBrush.size = Math.max(4, Math.min(400, v));
      if (typeof requestRender === "function") requestRender("weight-brush-size");
    });
  }
  if (els.weightBrushStrength) {
    els.weightBrushStrength.addEventListener("input", () => {
      const v = Number(els.weightBrushStrength.value);
      if (Number.isFinite(v)) state.weightBrush.strength = Math.max(0, Math.min(1, v));
    });
  }
  if (els.weightBrushFeather) {
    els.weightBrushFeather.addEventListener("input", () => {
      const v = Number(els.weightBrushFeather.value);
      if (Number.isFinite(v)) state.weightBrush.feather = Math.max(0, Math.min(1, v));
      if (typeof requestRender === "function") requestRender("weight-brush-feather");
    });
  }
  refreshWeightBrushUI();
  setupWeightPruneUI();
  setupWeightOverlayQuickToggle();
}

function refreshWeightOverlayQuickBtn() {
  if (!els.weightOverlayQuickBtn) return;
  const on = !!(state.vertexDeform && state.vertexDeform.weightViz);
  els.weightOverlayQuickBtn.classList.toggle("active", on);
  els.weightOverlayQuickBtn.setAttribute("aria-pressed", on ? "true" : "false");
  const label = els.weightOverlayQuickBtn.querySelector(".mesh-quick-label");
  if (label) label.textContent = on ? "Weight Overlay (ON)" : "Weight Overlay";
}

function setupWeightOverlayQuickToggle() {
  if (!els.weightOverlayQuickBtn) return;
  els.weightOverlayQuickBtn.addEventListener("click", () => {
    const next = !(state.vertexDeform && state.vertexDeform.weightViz);
    state.vertexDeform.weightViz = next;
    if (els.vertexWeightVizToggle) els.vertexWeightVizToggle.checked = next;
    if (typeof refreshVertexDeformUI === "function") refreshVertexDeformUI();
    if (!next && typeof weightHeatmapGPU !== "undefined" && weightHeatmapGPU && typeof weightHeatmapGPU.clear === "function") {
      weightHeatmapGPU.clear();
    }
    refreshWeightOverlayQuickBtn();
    if (typeof requestRender === "function") requestRender("weight-overlay-quick");
    setStatus(`Weight overlay ${next ? "ON" : "OFF"}.`);
  });
  refreshWeightOverlayQuickBtn();
}

function getPruneThreshold() {
  if (!els.weightPruneThreshold) return 0.02;
  const v = Number(els.weightPruneThreshold.value);
  if (!Number.isFinite(v)) return 0.02;
  return Math.max(0, Math.min(0.5, v));
}

function setupWeightPruneUI() {
  if (els.weightPrunePreviewBtn) {
    els.weightPrunePreviewBtn.addEventListener("click", () => {
      const t = getPruneThreshold();
      const r = pruneVertexWeights(t, { dryRun: true });
      if (!els.weightPrunePreview) return;
      if (!r.ok) {
        els.weightPrunePreview.textContent = `Prune preview: ${r.reason}`;
        return;
      }
      els.weightPrunePreview.textContent =
        `Threshold ${t.toFixed(3)} → drop ${r.droppedInfluences} influences across ${r.affectedVertices} vertex(es); ${r.emptiedBones} bone(s) become unused.`;
    });
  }
  if (els.weightPruneApplyBtn) {
    els.weightPruneApplyBtn.addEventListener("click", () => {
      const t = getPruneThreshold();
      // Capture the BEFORE state so undo restores pre-prune weights.
      if (typeof pushUndoCheckpoint === "function") pushUndoCheckpoint(true);
      const r = pruneVertexWeights(t, { dryRun: false });
      if (!r.ok) {
        setStatus(`Prune: ${r.reason}`);
        if (els.weightPrunePreview) els.weightPrunePreview.textContent = `Prune: ${r.reason}`;
        return;
      }
      setStatus(`Pruned ${r.droppedInfluences} influences across ${r.affectedVertices} vertex(es); ${r.emptiedBones} bone(s) emptied.`);
      if (els.weightPrunePreview) {
        els.weightPrunePreview.textContent =
          `Applied threshold ${t.toFixed(3)} — dropped ${r.droppedInfluences}, affected ${r.affectedVertices}, emptied ${r.emptiedBones}.`;
      }
      if (typeof pushUndoCheckpoint === "function") pushUndoCheckpoint(true);
      if (typeof requestRender === "function") requestRender("weight-prune-apply");
    });
  }
  if (els.weightPruneThreshold) {
    els.weightPruneThreshold.addEventListener("input", () => {
      // Live label update without re-running preview (preview can be heavy on big meshes).
      if (els.weightPrunePreview) {
        const t = getPruneThreshold();
        els.weightPrunePreview.textContent = `Threshold ${t.toFixed(3)} — preview to count removable influences.`;
      }
    });
  }
  setupWeightWeldSwapUI();
}

function setupWeightWeldSwapUI() {
  if (els.weightWeldApplyBtn) {
    els.weightWeldApplyBtn.addEventListener("click", () => {
      const fb = Number(els.weightWeldFromBone ? els.weightWeldFromBone.value : -1);
      const tb = Number(els.weightWeldToBone ? els.weightWeldToBone.value : -1);
      if (typeof weldBoneWeights !== "function") {
        setStatus("Weld unavailable.");
        return;
      }
      if (typeof pushUndoCheckpoint === "function") pushUndoCheckpoint(true);
      const r = weldBoneWeights(fb, tb);
      if (!r.ok) {
        setStatus(`Weld: ${r.reason}`);
        if (els.weightWeldHint) els.weightWeldHint.textContent = `Weld failed: ${r.reason}`;
        return;
      }
      const fromName = state.mesh && state.mesh.rigBones && state.mesh.rigBones[r.fromBone] ? state.mesh.rigBones[r.fromBone].name : `bone ${r.fromBone}`;
      const toName = state.mesh && state.mesh.rigBones && state.mesh.rigBones[r.toBone] ? state.mesh.rigBones[r.toBone].name : `bone ${r.toBone}`;
      setStatus(`Welded: ${fromName} → ${toName} (${r.mergedVertices} vertices touched)`);
      if (els.weightWeldHint) els.weightWeldHint.textContent = `Welded ${fromName} → ${toName} on ${r.mergedVertices} vertex(es).`;
      if (typeof pushUndoCheckpoint === "function") pushUndoCheckpoint(true);
      if (typeof requestRender === "function") requestRender("weight-weld");
    });
  }
  if (els.weightSwapApplyBtn) {
    els.weightSwapApplyBtn.addEventListener("click", () => {
      const fb = Number(els.weightWeldFromBone ? els.weightWeldFromBone.value : -1);
      const tb = Number(els.weightWeldToBone ? els.weightWeldToBone.value : -1);
      if (typeof swapBoneWeights !== "function") {
        setStatus("Swap unavailable.");
        return;
      }
      if (typeof pushUndoCheckpoint === "function") pushUndoCheckpoint(true);
      const r = swapBoneWeights(fb, tb);
      if (!r.ok) {
        setStatus(`Swap: ${r.reason}`);
        if (els.weightWeldHint) els.weightWeldHint.textContent = `Swap failed: ${r.reason}`;
        return;
      }
      const aName = state.mesh && state.mesh.rigBones && state.mesh.rigBones[r.boneA] ? state.mesh.rigBones[r.boneA].name : `bone ${r.boneA}`;
      const bName = state.mesh && state.mesh.rigBones && state.mesh.rigBones[r.boneB] ? state.mesh.rigBones[r.boneB].name : `bone ${r.boneB}`;
      setStatus(`Swapped: ${aName} ↔ ${bName} (${r.swappedVertices} vertices)`);
      if (els.weightWeldHint) els.weightWeldHint.textContent = `Swapped ${aName} ↔ ${bName} on ${r.swappedVertices} vertex(es).`;
      if (typeof pushUndoCheckpoint === "function") pushUndoCheckpoint(true);
      if (typeof requestRender === "function") requestRender("weight-swap");
    });
  }
}

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
  if (drag.type === "slot_mesh_point" || drag.type === "slot_mesh_multi_move" || drag.type === "slot_mesh_marquee") {
    pushMeshDebugEvent("mesh_drag_end", {
      slotIndex: Number.isFinite(state.activeSlot) ? Number(state.activeSlot) : -1,
      dragType: drag.type,
      pointSet: drag.pointSet || getSlotMeshEditSetName(),
      pointIndex: Number.isFinite(drag.pointIndex) ? Number(drag.pointIndex) : -1,
      pointIndices: Array.isArray(drag.pointIndices) ? [...drag.pointIndices] : [],
      moved: !!drag.debugMoved,
      shiftHeld,
    });
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
  if (drag.type === "weight_brush") {
    if (drag.changed) {
      setStatus(`Weight brush stroke (${state.weightBrush.mode}) → bone ${getPrimarySelectedBoneIndex()}`);
      pushUndoCheckpoint(true);
    }
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
  if (drag.type === "att_gizmo_point_move" || drag.type === "att_gizmo_point_rotate") {
    const si = Number(drag.slotIndex);
    const slot = Number.isFinite(si) && si >= 0 && si < state.slots.length ? state.slots[si] : getActiveSlot();
    if (slot) refreshAttachmentPanel(slot);
    pushUndoCheckpoint(true);
    return;
  }
  if (drag.type === "att_gizmo_vertex") {
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
    const setName = getSlotMeshEditSetName();
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
  // Bone-edit drags (bone_joint / bone_tip / bone_part_multi_move) skip the
  // per-frame slot weight rebuild while dragging (see commitRigEditPreserveCurrentLook
  // guard). Run it once now that the drag has finished so the final pose is
  // reflected in the slot weights / tree positioning.
  const wasBoneEditDrag =
    state.mesh &&
    state.boneMode === "edit" &&
    (drag.type === "bone_joint" || drag.type === "bone_tip" || drag.type === "bone_part_multi_move");
  if (wasBoneEditDrag) {
    for (const s of state.slots) {
      if (!s) continue;
      rebuildSlotWeights(s, state.mesh);
    }
    if (typeof renderBoneTree === "function") renderBoneTree();
  }
  if (
    drag.type === "bone_head" ||
    drag.type === "bone_tip" ||
    drag.type === "bone_multi_move" ||
    drag.type === "bone_object_move" ||
    drag.type === "bone_object_scale" ||
    drag.type === "bone_object_rotate" ||
    drag.type === "vertex" ||
    drag.type === "bone_joint" ||
    drag.type === "bone_part_multi_move"
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
els.overlay.addEventListener("mousedown", (ev) => {
  if (ev.button === 1) ev.preventDefault();
});
els.overlay.addEventListener("auxclick", (ev) => {
  if (ev.button === 1) ev.preventDefault();
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
window.addEventListener("resize", () => {
  markStageResizeDirty();
  resize();
  if (state.boneTreeMenuOpen) closeBoneTreeContextMenu();
  closeBoneDeleteQuickMenu();
});
if (typeof ResizeObserver !== "undefined" && els.stage) {
  const stageResizeObserver = new ResizeObserver(() => {
    markStageResizeDirty();
  });
  stageResizeObserver.observe(els.stage);
}
const requestRenderFromUI = () => {
  if (typeof requestRender === "function") requestRender("ui");
};
for (const evt of ["click", "change", "input", "keydown", "keyup"]) {
  document.addEventListener(evt, requestRenderFromUI, true);
}
if (els.overlay) {
  for (const evt of ["pointerdown", "pointermove", "pointerup", "pointercancel", "pointerleave", "wheel"]) {
    els.overlay.addEventListener(evt, requestRenderFromUI, { passive: evt === "wheel" ? false : true });
  }
}
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) requestRenderFromUI();
});
markStageResizeDirty();

setupLeftToolTabs();
setupWorkspaceTabs();
setupAnimateSubTabs();
mountAnimateAuxPanelsInLeftTools();
setupDockLayout();
setupApplicationMenuBar();
setupFullscreenButton();
setupMeshTopologyButtons();
setupWeightBrushUI();
requestRender("bootstrap");
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

// Atlas option inputs: each writes back to state.export.atlas on change.
// Initial DOM values mirror state.export.atlas defaults; we sync DOM →
// state once on startup to be safe and then keep it in sync via change.
function _syncAtlasOption(el, key, kind) {
  if (!el) return;
  // initial pull (DOM → state) so user-saved DOM values (if any) win.
  if (kind === "bool") state.export.atlas[key] = !!el.checked;
  else state.export.atlas[key] = Number(el.value) || state.export.atlas[key];
  el.addEventListener("change", () => {
    if (kind === "bool") state.export.atlas[key] = !!el.checked;
    else state.export.atlas[key] = Number(el.value) || state.export.atlas[key];
  });
}
_syncAtlasOption(els.atlasMaxWidth, "maxWidth", "num");
_syncAtlasOption(els.atlasMaxHeight, "maxHeight", "num");
_syncAtlasOption(els.atlasPadding, "padding", "num");
_syncAtlasOption(els.atlasBleed, "bleed", "num");
_syncAtlasOption(els.atlasAllowRotate, "allowRotate", "bool");
_syncAtlasOption(els.atlasAllowTrim, "allowTrim", "bool");
_syncAtlasOption(els.atlasMultiPage, "allowMultiPage", "bool");
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
