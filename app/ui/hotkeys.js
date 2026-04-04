// Split from app.js
// Part: Hotkeys, timeline drag interactions, keyboard control
// Original lines: 28129-29898
window.addEventListener("keydown", (ev) => {
  if (String(ev.key || "").toLowerCase() !== "s") return;
  if (isEditableHotkeyTarget(ev.target)) return;
  const drag = state.anim.timelineDrag;
  if (!drag || drag.mode !== "key_set") return;
  state.anim.timelineScaleHeld = true;
  ev.preventDefault();
});
window.addEventListener("keyup", (ev) => {
  if (String(ev.key || "").toLowerCase() !== "s") return;
  state.anim.timelineScaleHeld = false;
});
window.addEventListener("blur", () => {
  state.anim.timelineScaleHeld = false;
});
if (els.timelineZoomOutBtn) {
  els.timelineZoomOutBtn.addEventListener("click", () => {
    zoomTimelineBy(1 / 1.25);
  });
}
if (els.timelineZoomResetBtn) {
  els.timelineZoomResetBtn.addEventListener("click", () => {
    resetTimelineZoom();
  });
}
if (els.timelineZoomInBtn) {
  els.timelineZoomInBtn.addEventListener("click", () => {
    zoomTimelineBy(1.25);
  });
}
els.timelineTracks.addEventListener(
  "wheel",
  (ev) => {
    if (!(ev.ctrlKey || ev.metaKey)) return;
    ev.preventDefault();
    zoomTimelineBy(ev.deltaY > 0 ? 1 / 1.15 : 1.15);
  },
  { passive: false }
);
els.timelineResizer.addEventListener("pointerdown", (ev) => {
  state.anim.resizing = {
    pointerId: ev.pointerId,
    startY: ev.clientY,
    startH: parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--timeline-h")) || 280,
  };
  els.timelineResizer.setPointerCapture(ev.pointerId);
});
els.timelineResizer.addEventListener("pointermove", (ev) => {
  const r = state.anim.resizing;
  if (!r) return;
  const delta = r.startY - ev.clientY;
  const next = math.clamp(r.startH + delta, 140, Math.max(180, window.innerHeight * 0.6));
  document.documentElement.style.setProperty("--timeline-h", `${Math.round(next)}px`);
});
function clearResize(ev) {
  if (!state.anim.resizing) return;
  try {
    els.timelineResizer.releasePointerCapture(ev.pointerId);
  } catch {
    // ignore
  }
  state.anim.resizing = null;
}
els.timelineResizer.addEventListener("pointerup", clearResize);
els.timelineResizer.addEventListener("pointercancel", clearResize);

const leftResizer = document.getElementById("leftResizer");
const rightResizer = document.getElementById("rightResizer");
const rightColResizer = document.getElementById("rightColResizer");

if (leftResizer) {
  leftResizer.addEventListener("pointerdown", (ev) => {
    state.uiResizing = {
      type: "left",
      pointerId: ev.pointerId,
      startX: ev.clientX,
      startW: parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--left-w")) || 260,
    };
    leftResizer.setPointerCapture(ev.pointerId);
  });
  leftResizer.addEventListener("pointermove", (ev) => {
    if (!state.uiResizing || state.uiResizing.type !== "left") return;
    const next = math.clamp(state.uiResizing.startW + (ev.clientX - state.uiResizing.startX), 150, 800);
    document.documentElement.style.setProperty("--left-w", `${Math.round(next)}px`);
  });
  const clearLeft = (ev) => {
    if (state.uiResizing && state.uiResizing.type === "left") {
      try { leftResizer.releasePointerCapture(ev.pointerId); } catch {}
      state.uiResizing = null;
    }
  };
  leftResizer.addEventListener("pointerup", clearLeft);
  leftResizer.addEventListener("pointercancel", clearLeft);
}

if (rightResizer) {
  rightResizer.addEventListener("pointerdown", (ev) => {
    state.uiResizing = {
      type: "right",
      pointerId: ev.pointerId,
      startX: ev.clientX,
      startW: parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--right-w")) || 340,
    };
    rightResizer.setPointerCapture(ev.pointerId);
  });
  rightResizer.addEventListener("pointermove", (ev) => {
    if (!state.uiResizing || state.uiResizing.type !== "right") return;
    const next = math.clamp(state.uiResizing.startW - (ev.clientX - state.uiResizing.startX), 200, 800);
    document.documentElement.style.setProperty("--right-w", `${Math.round(next)}px`);
  });
  const clearRight = (ev) => {
    if (state.uiResizing && state.uiResizing.type === "right") {
      try { rightResizer.releasePointerCapture(ev.pointerId); } catch {}
      state.uiResizing = null;
    }
  };
  rightResizer.addEventListener("pointerup", clearRight);
  rightResizer.addEventListener("pointercancel", clearRight);
}

if (rightColResizer) {
  rightColResizer.addEventListener("pointerdown", (ev) => {
    const defaultH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--tree-h"));
    state.uiResizing = {
      type: "tree",
      pointerId: ev.pointerId,
      startY: ev.clientY,
      startH: !Number.isNaN(defaultH) ? defaultH : (document.getElementById("rightTree")?.offsetHeight || 160),
    };
    rightColResizer.setPointerCapture(ev.pointerId);
  });
  rightColResizer.addEventListener("pointermove", (ev) => {
    if (!state.uiResizing || state.uiResizing.type !== "tree") return;
    const delta = ev.clientY - state.uiResizing.startY;
    const next = Math.max(100, state.uiResizing.startH + delta);
    document.documentElement.style.setProperty("--tree-h", `${Math.round(next)}px`);
  });
  const clearTree = (ev) => {
    if (state.uiResizing && state.uiResizing.type === "tree") {
      try { rightColResizer.releasePointerCapture(ev.pointerId); } catch {}
      state.uiResizing = null;
    }
  };
  rightColResizer.addEventListener("pointerup", clearTree);
  rightColResizer.addEventListener("pointercancel", clearTree);
}
if (els.timelineCollapseBtn) {
  els.timelineCollapseBtn.addEventListener("click", () => {
    state.anim.timelineMinimized = !state.anim.timelineMinimized;
    updateWorkspaceUI();
  });
}
if (els.playBtn) {
  els.playBtn.addEventListener("click", () => {
    const anim = getCurrentAnimation();
    if (anim) {
      const active = getAnimationActiveRange(anim);
      if (state.anim.time < active.start - 1e-6 || state.anim.time > active.end + 1e-6) {
        setAnimTime(active.start);
        if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time);
      }
    }
    state.anim.playing = !state.anim.playing;
    state.anim.lastTs = 0;
    updatePlaybackButtons();
  });
}
if (els.pauseBtn) {
  els.pauseBtn.addEventListener("click", () => {
    state.anim.playing = false;
    updatePlaybackButtons();
  });
}
els.stopBtn.addEventListener("click", () => {
  state.anim.playing = false;
  state.anim.lastTs = 0;
  updatePlaybackButtons();
  const active = getAnimationActiveRange(getCurrentAnimation());
  setAnimTime(active.start);
  if (state.mesh) {
    samplePoseAtTime(state.mesh, active.start);
    if (state.boneMode === "pose") updateBoneUI();
  }
});

function isEditableHotkeyTarget(target) {
  if (!target || !(target instanceof Element)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName ? target.tagName.toLowerCase() : "";
  if (tag === "textarea" || tag === "select") return true;
  if (tag !== "input") return false;
  const input = target;
  if (input.disabled) return true;
  const t = String(input.type || "text").toLowerCase();
  const nonTextTypes = new Set(["button", "checkbox", "radio", "range", "color", "file", "image", "submit", "reset"]);
  if (nonTextTypes.has(t)) return false;
  return !input.readOnly;
}

window.addEventListener("keydown", async (ev) => {
  if (ev.isComposing) return;
  if (isEditableHotkeyTarget(ev.target)) return;
  const keyLower = String(ev.key || "").toLowerCase();
  if (keyLower === "escape" && (state.boneTreeMenuOpen || (els.boneTreeDeleteBoneMenu && !els.boneTreeDeleteBoneMenu.classList.contains("collapsed")))) {
    if (state.boneTreeMenuOpen) closeBoneTreeContextMenu();
    closeBoneDeleteQuickMenu();
    ev.preventDefault();
    return;
  }
  const modKey = (ev.ctrlKey || ev.metaKey) && !ev.altKey;
  if (modKey && keyLower === "z") {
    ev.preventDefault();
    if (ev.shiftKey) {
      if (state.history.redo.length > 0) await redoAction();
    } else if (state.history.undo.length > 1) {
      await undoAction();
    }
    return;
  }
  if (modKey && keyLower === "y") {
    ev.preventDefault();
    if (state.history.redo.length > 0) await redoAction();
    return;
  }
  if (ev.key === "+" || ev.key === "=") {
    const sx = Math.max(1, Number(els.overlay.width) || 1) * 0.5;
    const sy = Math.max(1, Number(els.overlay.height) || 1) * 0.5;
    zoomViewBy(1.12, sx, sy);
    ev.preventDefault();
    return;
  }
  if (ev.key === "-" || ev.key === "_") {
    const sx = Math.max(1, Number(els.overlay.width) || 1) * 0.5;
    const sy = Math.max(1, Number(els.overlay.height) || 1) * 0.5;
    zoomViewBy(1 / 1.12, sx, sy);
    ev.preventDefault();
    return;
  }
  if (ev.key === "0") {
    resetViewToFit();
    ev.preventDefault();
    return;
  }
  const hotkey = String(ev.key || "").toLowerCase();
  if (state.editMode === "mesh") {
    if (hotkey === "h" && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
      state.vertexDeform.mirror = !state.vertexDeform.mirror;
      refreshVertexDeformUI();
      setStatus(`Vertex mirror edit ${state.vertexDeform.mirror ? "ON" : "OFF"}.`);
      ev.preventDefault();
      return;
    }
    if (hotkey === "j" && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
      state.vertexDeform.heatmap = !state.vertexDeform.heatmap;
      refreshVertexDeformUI();
      setStatus(`Vertex heatmap preview ${state.vertexDeform.heatmap ? "ON" : "OFF"}.`);
      ev.preventDefault();
      return;
    }
    if (hotkey === "a" && !ev.ctrlKey && !ev.metaKey) {
      toggleSelectAllVertices();
      ev.preventDefault();
      return;
    }
    if (hotkey === "escape") {
      clearActiveVertexSelection();
      setStatus("Vertex selection cleared.");
      ev.preventDefault();
      return;
    }
    if (hotkey === "p" && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
      const ctx = getActiveVertexContext();
      const selected = getActiveVertexSelection(ctx.vCount);
      if (selected.length > 0) {
        const pinned = getActivePinnedVertexSet(ctx.vCount);
        const hasUnpinned = selected.some((i) => !pinned.has(i));
        if (hasUnpinned) {
          for (const i of selected) pinned.add(i);
          setStatus(`Pinned ${selected.length} vertex(es).`);
        } else {
          for (const i of selected) pinned.delete(i);
          setStatus(`Unpinned ${selected.length} vertex(es).`);
        }
        setActivePinnedVertices([...pinned], ctx.vCount);
      } else {
        setStatus("No selected vertices to pin/unpin.");
      }
      ev.preventDefault();
      return;
    }
    if (hotkey === "u" && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
      const ctx = getActiveVertexContext();
      const selected = getActiveVertexSelection(ctx.vCount);
      if (selected.length > 0) {
        const pinned = getActivePinnedVertexSet(ctx.vCount);
        for (const i of selected) pinned.delete(i);
        setActivePinnedVertices([...pinned], ctx.vCount);
        setStatus(`Unpinned ${selected.length} selected vertex(es).`);
      } else {
        setActivePinnedVertices([], ctx.vCount);
        setStatus("Cleared all pinned vertices.");
      }
      ev.preventDefault();
      return;
    }
    if (hotkey === "m" && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
      const moved = relaxSelectedVertices(ev.shiftKey ? 0.75 : 0.45);
      setStatus(moved > 0 ? `Relaxed ${moved} selected vertex(es).` : "Relax did nothing (select vertices first).");
      ev.preventDefault();
      return;
    }
    if (hotkey === "o" && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
      state.vertexDeform.proportional = !state.vertexDeform.proportional;
      refreshVertexDeformUI();
      setStatus(`Vertex proportional edit ${state.vertexDeform.proportional ? "ON" : "OFF"}.`);
      ev.preventDefault();
      return;
    }
    if (ev.key === "[" || ev.key === "{" || ev.key === "]" || ev.key === "}") {
      const step = ev.shiftKey ? 20 : 8;
      const dir = ev.key === "[" || ev.key === "{" ? -1 : 1;
      state.vertexDeform.radius = math.clamp((Number(state.vertexDeform.radius) || 80) + dir * step, 4, 400);
      refreshVertexDeformUI();
      setStatus(`Vertex proportional radius: ${Math.round(state.vertexDeform.radius)}px`);
      ev.preventDefault();
      return;
    }
  }
  if (state.editMode === "skeleton" && state.leftToolTab === "path") {
    if (ev.key === "Delete" || ev.key === "Backspace" || hotkey === "x") {
      const c = getActivePathConstraint();
      const i = Number(state.pathEdit.activePoint);
      if (c && c.sourceType === "drawn" && Array.isArray(c.points) && i >= 0 && i < c.points.length) {
        c.points.splice(i, 1);
        state.pathEdit.activePoint = Math.max(0, Math.min(i, c.points.length - 1));
        if (c.points.length === 0) state.pathEdit.activePoint = -1;
        state.pathEdit.activeHandle = c.points.length > 0 ? "point" : "";
        if (c.points.length < 3) c.closed = false;
        applyAutoHandlesForConstraint(c);
        refreshPathUI();
        setStatus(`Path point removed (${c.points.length}).`);
        ev.preventDefault();
        return;
      }
    }
  }
  if (isSlotMeshEditTabActive()) {
    const slot = getActiveSlot();
    if (!slot) return;
    syncSlotContourFromMeshData(slot, false);
    const contour = ensureSlotContour(slot);
    const activeSet = state.slotMesh.activeSet === "fill" ? "fill" : "contour";
    const activePoints = activeSet === "fill" ? contour.fillPoints : contour.points;
    if (hotkey === "v" && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
      const next = normalizeSlotMeshToolMode(state.slotMesh.toolMode) === "add" ? "select" : "add";
      setSlotMeshToolMode(next, true);
      ev.preventDefault();
      return;
    }
    if (ev.key === "Enter") {
      markSlotContourDirty(slot, true);
      if (!contour.closed && contour.points.length >= 3) contour.closed = true;
      contour.triangles = triangulateContourPoints(contour.points, contour.contourEdges, contour.manualEdges);
      contour.fillPoints = [];
      contour.fillTriangles = [];
      contour.fillManualEdges = [];
      state.slotMesh.activeSet = "contour";
      clearSlotMeshSelection();
      setStatus(
        contour.triangles.length >= 3
          ? `Triangulated preview: ${contour.triangles.length / 3} triangles. Use Apply Mesh to commit.`
          : "Triangulation failed."
      );
      ev.preventDefault();
      return;
    }
    if ((ev.key === "Backspace" || ev.key === "Delete" || ev.key.toLowerCase() === "x") && activePoints.length > 0) {
      markSlotContourDirty(slot, true);
      const selected = getSlotMeshSelection(activeSet, activePoints.length);
      const indices = selected.length > 0 ? selected : [state.slotMesh.activePoint >= 0 ? state.slotMesh.activePoint : activePoints.length - 1];
      const removed = removeSlotMeshPointsByIndices(contour, activeSet, indices);
      const maxCount = activeSet === "fill" ? contour.fillPoints.length : contour.points.length;
      setSlotMeshSelection(activeSet, [], maxCount);
      const removedSorted = [...indices].sort((a, b) => a - b);
      state.slotMesh.edgeSelection = state.slotMesh.edgeSelection
        .filter((v) => !removedSorted.includes(v))
        .map((v) => v - removedSorted.filter((x) => x < v).length);
      state.slotMesh.activePoint = maxCount > 0 ? Math.min(state.slotMesh.activePoint, maxCount - 1) : -1;
      setStatus(`${activeSet === "fill" ? "Fill" : "Contour"} vertex removed (${removed.remain}).`);
      ev.preventDefault();
      return;
    }
    if (ev.key.toLowerCase() === "l") {
      if (!linkSelectedSlotMeshEdge(true)) {
        setStatus("Select 2 vertices (Shift+Click) in the same set, then press L.");
        ev.preventDefault();
        return;
      }
      markSlotContourDirty(slot, true);
      const [a0, b0] = state.slotMesh.edgeSelection;
      const a = Math.min(a0, b0);
      const b = Math.max(a0, b0);
      setStatus(`Edge linked (${activeSet}: ${a}-${b}).`);
      ev.preventDefault();
      return;
    }
    if (ev.key.toLowerCase() === "u") {
      if (!linkSelectedSlotMeshEdge(false)) {
        setStatus("Select 2 linked vertices (Shift+Click) in the same set, then press U.");
        ev.preventDefault();
        return;
      }
      markSlotContourDirty(slot, true);
      const [a0, b0] = state.slotMesh.edgeSelection;
      const a = Math.min(a0, b0);
      const b = Math.max(a0, b0);
      setStatus(`Edge unlinked (${activeSet}: ${a}-${b}).`);
      ev.preventDefault();
      return;
    }
    if (ev.key.toLowerCase() === "b" && !ev.shiftKey) {
      const bound = bindActiveSlotToSelectedBone();
      if (!bound) {
        setStatus("Bind failed. Select one or more target slots and a bone first.");
      } else {
        setStatus(buildSingleBindStatusMessage(bound, getPrimarySelectedBoneIndex()));
      }
      ev.preventDefault();
      return;
    }
    if (ev.key.toLowerCase() === "b" && ev.shiftKey) {
      const bound = bindActiveSlotWeightedToSelectedBones();
      if (!bound) {
        setStatus("Weighted bind failed. Select one or more target slots and bones first.");
      } else {
        setStatus(buildWeightedBindStatusMessage(bound, getSelectedBonesForWeight(state.mesh)));
      }
      ev.preventDefault();
      return;
    }
    if (ev.key === "Escape") {
      state.drag = null;
      state.slotMesh.activePoint = -1;
      state.slotMesh.edgeSelection = [];
      clearSlotMeshSelection();
      setSlotMeshToolMode("select", false);
      state.ikPickArmed = false;
      state.ikHoverBone = -1;
      refreshIKUI();
      ev.preventDefault();
      return;
    }
  }
  if (isTimelineEditingActive()) {
    if (modKey && keyLower === "c") {
      copySelectedKeyframe();
      ev.preventDefault();
      return;
    }
    if (modKey && keyLower === "x") {
      cutSelectedKeyframe();
      ev.preventDefault();
      return;
    }
    if (modKey && keyLower === "v") {
      pasteKeyframeAtCurrentTime();
      ev.preventDefault();
      return;
    }
    if ((ev.key === "Delete" || ev.key === "Backspace") && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
      deleteSelectedOrCurrentKeyframe();
      ev.preventDefault();
      return;
    }
    if (keyLower === "k" && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
      deleteSelectedOrCurrentKeyframe();
      ev.preventDefault();
      return;
    }
  }
  if (!state.mesh || state.editMode !== "skeleton") return;

  const key = ev.key.toLowerCase();
  if (ev.ctrlKey && key === "c") {
    copySelectedKeyframe();
    ev.preventDefault();
    return;
  }
  if (ev.ctrlKey && key === "v") {
    pasteKeyframeAtCurrentTime();
    ev.preventDefault();
    return;
  }
  if (key === "shift" && state.boneMode === "edit" && state.selectedBone >= 0) {
    state.addBoneArmed = true;
    state.addBoneDraft = null;
    els.addBoneParent.value = String(state.selectedBone);
    els.addBoneConnect.value = "true";
    els.addBoneBtn.textContent = "Cancel Add";
    refreshSetupQuickActions();
    setStatus(`Chain add armed from parent bone ${state.selectedBone}. Drag in canvas to set new tail.`);
    ev.preventDefault();
    return;
  }
  if (key === "g") {
    setDragTool("move_head");
    ev.preventDefault();
    return;
  }
  if (key === "t") {
    setDragTool("move_tail");
    ev.preventDefault();
    return;
  }
  if (key === "r") {
    setDragTool("rotate");
    ev.preventDefault();
    return;
  }
  if (key === "escape") {
    state.parentPickArmed = false;
    state.parentHoverBone = -1;
    state.ikPickArmed = false;
    state.ikHoverBone = -1;
    refreshIKUI();
    renderBoneTree();
    setDragTool("auto");
    ev.preventDefault();
    return;
  }
  if (key === "c") {
    toggleSelectedConnect();
    ev.preventDefault();
    return;
  }
  if (key === "b" && !ev.shiftKey) {
    const bound = bindActiveSlotToSelectedBone();
    if (!bound) {
      setStatus("Bind failed. Select one or more target slots and a bone first.");
    } else {
      setStatus(buildSingleBindStatusMessage(bound, getPrimarySelectedBoneIndex()));
    }
    ev.preventDefault();
    return;
  }
  if (key === "b" && ev.shiftKey) {
    const bound = bindActiveSlotWeightedToSelectedBones();
    if (!bound) {
      setStatus("Weighted bind failed. Select one or more target slots and bones first.");
    } else {
      setStatus(buildWeightedBindStatusMessage(bound, getSelectedBonesForWeight(state.mesh)));
    }
    ev.preventDefault();
    return;
  }
  if (key === "a" && !ev.shiftKey) {
    toggleSelectAllBones();
    ev.preventDefault();
    return;
  }
  if ((key === "a" && ev.shiftKey) || (key === "n" && state.boneMode === "edit")) {
    state.addBoneArmed = !state.addBoneArmed;
    state.addBoneDraft = null;
    els.addBoneBtn.textContent = state.addBoneArmed ? "Cancel Add" : "Add Bone";
    refreshSetupQuickActions();
    setStatus(state.addBoneArmed ? "Add bone armed: drag in canvas to create." : "Add bone canceled.");
    ev.preventDefault();
    return;
  }
  if ((ev.key === "Delete" || ev.key === "Backspace") && (state.boneMode === "edit" || state.boneMode === "object")) {
    if (!deleteBone()) {
      setStatus(state.boneMode === "object" ? "Delete bone failed. Select a root bone in Object mode." : "Delete bone failed.");
    }
    ev.preventDefault();
    return;
  }
  if (key === "w" && state.boneMode === "edit") {
    const updated = autoWeightActiveSlot();
    if (updated > 0) {
      const picked = getSelectedBonesForWeight(state.mesh);
      const targetLabel = state.slots.length > 0 ? `${updated} slot(s)` : "mesh";
      setStatus(
        `Auto weights updated (${state.weightMode}) on ${targetLabel}; bones: ${picked.length > 0 ? picked.join(", ") : "(slot default)"
        }.`
      );
    }
    ev.preventDefault();
    return;
  }
  if (key === "i" && state.boneMode === "pose") {
    addAutoKeyframeFromDirty();
    ev.preventDefault();
    return;
  }
  if (key === "k" && ev.shiftKey && ev.altKey) {
    if (state.activeSlot >= 0) {
      const trackId = getSlotTrackId(state.activeSlot, "clipEnd");
      setSelectedTimelineTrack(trackId);
      addOrUpdateKeyframeForTrack(trackId);
    }
    ev.preventDefault();
    return;
  }
  if (key === "k" && ev.shiftKey) {
    if (state.activeSlot >= 0) {
      const trackId = getSlotTrackId(state.activeSlot, "clip");
      setSelectedTimelineTrack(trackId);
      addOrUpdateKeyframeForTrack(trackId);
    }
    ev.preventDefault();
    return;
  }
  if (key === "k") {
    addAutoKeyframeFromDirty();
    ev.preventDefault();
    return;
  }
  if (ev.key === ",") {
    jumpToNeighborKey(-1);
    ev.preventDefault();
    return;
  }
  if (ev.key === ".") {
    jumpToNeighborKey(1);
    ev.preventDefault();
    return;
  }
  if (key === " ") {
    state.anim.playing = !state.anim.playing;
    state.anim.lastTs = 0;
    updatePlaybackButtons();
    ev.preventDefault();
    return;
  }
  if (key === "p" && state.boneMode === "edit") {
    state.parentPickArmed = true;
    state.parentHoverBone = -1;
    renderBoneTree();
    setStatus("Parent pick armed: click target bone in canvas.");
    ev.preventDefault();
    return;
  }
  if (ev.key === "[") {
    selectBoneDelta(-1);
    ev.preventDefault();
    return;
  }
  if (ev.key === "]") {
    selectBoneDelta(1);
    ev.preventDefault();
    return;
  }
  if (key === "1") {
    const prevMode = state.boneMode;
    state.boneMode = "edit";
    applyBoneModeTransition(prevMode, state.boneMode);
    if (els.systemMode) els.systemMode.value = "setup";
    if (state.editMode === "object") { state.editMode = "skeleton"; if (els.editMode) els.editMode.value = "skeleton"; }
    updateWorkspaceUI();
    updateBoneUI();
    ev.preventDefault();
    return;
  }
  if (key === "2") {
    const prevMode = state.boneMode;
    state.boneMode = "pose";
    applyBoneModeTransition(prevMode, state.boneMode);
    if (els.systemMode) els.systemMode.value = "animate";
    if (state.editMode === "object") { state.editMode = "skeleton"; if (els.editMode) els.editMode.value = "skeleton"; }
    syncPoseFromRig(state.mesh);
    updateWorkspaceUI();
    updateBoneUI();
    ev.preventDefault();
    return;
  }
  if (key === "3") {
    const prevMode = state.boneMode;
    state.boneMode = "object";
    state.editMode = "object";
    applyBoneModeTransition(prevMode, state.boneMode);
    if (els.editMode) els.editMode.value = "object";
    updateWorkspaceUI();
    updateBoneUI();
    ev.preventDefault();
  }
});

els.overlay.addEventListener("pointerdown", (ev) => {
  const panMode = !!(state.view && state.view.panMode);
  if (!state.mesh && !isBaseImageEditTabActive() && !panMode) return;

  const rect = els.overlay.getBoundingClientRect();
  const dpr = els.overlay.width / rect.width;
  const mx = (ev.clientX - rect.left) * dpr;
  const my = (ev.clientY - rect.top) * dpr;
  const local = screenToLocal(mx, my);

  if (panMode) {
    if (ev.button !== 0) return;
    state.drag = {
      type: "view_pan",
      pointerId: ev.pointerId,
      prevX: mx,
      prevY: my,
    };
    if (els.stage) els.stage.classList.add("dragging-pan");
    els.overlay.setPointerCapture(ev.pointerId);
    return;
  }

  const poseWorldForGizmo = getSolvedPoseWorld(state.mesh);
  let gizmoHit = pickCanvasTransformHandle(mx, my, poseWorldForGizmo);
  if (gizmoHit) {
    const activeSlot = getActiveSlot();
    const slotIndex = Number.isFinite(state.activeSlot) ? Number(state.activeSlot) : -1;
    if (gizmoHit.key === "base_move") {
      const tr = getSlotBaseImageTransform(activeSlot);
      const spaceWorld =
        gizmoHit.meta && Array.isArray(gizmoHit.meta.spaceWorld) ? gizmoHit.meta.spaceWorld.slice(0, 6) : null;
      state.drag = {
        type: "base_transform_move",
        pointerId: ev.pointerId,
        slotIndex,
        startLocal: { x: local.x, y: local.y },
        startTx: Number(tr.tx) || 0,
        startTy: Number(tr.ty) || 0,
        spaceWorld,
      };
      els.overlay.setPointerCapture(ev.pointerId);
      return;
    }
    if (gizmoHit.key === "base_rotate") {
      const tr = getSlotBaseImageTransform(activeSlot);
      const pivot = gizmoHit.meta && gizmoHit.meta.pivotLocal ? gizmoHit.meta.pivotLocal : { x: local.x, y: local.y };
      state.drag = {
        type: "base_transform_rotate",
        pointerId: ev.pointerId,
        slotIndex,
        pivotLocal: { x: Number(pivot.x) || 0, y: Number(pivot.y) || 0 },
        startRot: Number(tr.rot) || 0,
        startAngle: Math.atan2(local.y - (Number(pivot.y) || 0), local.x - (Number(pivot.x) || 0)),
      };
      els.overlay.setPointerCapture(ev.pointerId);
      return;
    }
    if (gizmoHit.key === "base_scale") {
      const tr = getSlotBaseImageTransform(activeSlot);
      const pivot = gizmoHit.meta && gizmoHit.meta.pivotLocal ? gizmoHit.meta.pivotLocal : { x: local.x, y: local.y };
      state.drag = {
        type: "base_transform_scale",
        pointerId: ev.pointerId,
        slotIndex,
        pivotLocal: { x: Number(pivot.x) || 0, y: Number(pivot.y) || 0 },
        startScale: Number(tr.scale) || 1,
        startDist: Math.max(1e-6, Math.hypot(local.x - (Number(pivot.x) || 0), local.y - (Number(pivot.y) || 0))),
      };
      els.overlay.setPointerCapture(ev.pointerId);
      return;
    }
  }

  if (isBaseImageEditTabActive()) return;

  if (state.editMode === "skeleton" && state.leftToolTab === "path") {
    const picked = pickActivePathDrawControl(mx, my);
    if (picked) {
      const c = getActivePathConstraint();
      const nodes = c ? getDrawnPathNodes(c) : [];
      if (c && picked.index >= 0 && picked.index < nodes.length) {
        c.points[picked.index] = nodes[picked.index];
        state.pathEdit.activePoint = picked.index;
        state.pathEdit.activeHandle = picked.kind;
        refreshPathUI();
        state.drag = {
          type: picked.kind === "point" ? "path_point" : "path_handle",
          handle: picked.kind === "point" ? "" : picked.kind,
          index: picked.index,
          pointerId: ev.pointerId,
          prevLocal: { x: local.x, y: local.y },
        };
        els.overlay.setPointerCapture(ev.pointerId);
        return;
      }
    }
    if (state.pathEdit.drawArmed) {
      const added = addPointToActivePath(local.x, local.y);
      if (added) {
        setStatus("Path point added.");
      } else {
        setStatus("Path point ignored.");
      }
      return;
    }
  }

  if (isSlotMeshEditTabActive()) {
    const slot = getActiveSlot();
    if (!slot) return;
    syncSlotContourFromMeshData(slot, false);
    const contour = ensureSlotContour(slot);
    const toolMode = normalizeSlotMeshToolMode(state.slotMesh.toolMode);
    const slotLocal = screenToSlotMeshLocal(slot, mx, my, poseWorldForGizmo);
    const hit = pickSlotContourPoint(slot, mx, my, 10, poseWorldForGizmo);
    if (hit && hit.index >= 0) {
      const hitSet = hit.set === "fill" ? "fill" : "contour";
      const hitPoints = hitSet === "fill" ? contour.fillPoints : contour.points;
      state.slotMesh.activeSet = hitSet;
      state.slotMesh.activePoint = hit.index;
      if (ev.shiftKey) {
        if (state.slotMesh.edgeSelectionSet !== hitSet) {
          state.slotMesh.edgeSelection = [];
          state.slotMesh.edgeSelectionSet = hitSet;
        }
        if (state.slotMesh.edgeSelection.includes(hit.index)) {
          state.slotMesh.edgeSelection = state.slotMesh.edgeSelection.filter((v) => v !== hit.index);
        } else if (state.slotMesh.edgeSelection.length >= 2) {
          state.slotMesh.edgeSelection = [state.slotMesh.edgeSelection[1], hit.index];
        } else {
          state.slotMesh.edgeSelection.push(hit.index);
        }
        setStatus(
          `Selected ${state.slotMesh.edgeSelection.length}/2 vertex for edge link (${hitSet}). Use L to link, U to unlink.`
        );
        return;
      }
      if (ev.altKey) {
        const toggled = getSlotMeshSelection(hitSet, hitPoints.length);
        const next = toggled.includes(hit.index) ? toggled.filter((v) => v !== hit.index) : [...toggled, hit.index];
        setSlotMeshSelection(hitSet, next, hitPoints.length);
        state.slotMesh.edgeSelection = [hit.index];
        state.slotMesh.edgeSelectionSet = hitSet;
        setStatus(`Selected ${getSlotMeshSelection(hitSet, hitPoints.length).length} ${hitSet} vertices.`);
        return;
      }
      const selected = getSlotMeshSelection(hitSet, hitPoints.length);
      const shouldDragMulti = selected.length > 1 && selected.includes(hit.index);
      if (!shouldDragMulti) {
        setSlotMeshSelection(hitSet, [hit.index], hitPoints.length);
      }
      state.slotMesh.edgeSelection = [hit.index];
      state.slotMesh.edgeSelectionSet = hitSet;
      if (shouldDragMulti) {
        state.drag = {
          type: "slot_mesh_multi_move",
          pointerId: ev.pointerId,
          pointSet: hitSet,
          pointIndices: [...selected],
          prevSlotLocal: { x: slotLocal.x, y: slotLocal.y },
        };
      } else {
        state.drag = { type: "slot_mesh_point", pointerId: ev.pointerId, pointIndex: hit.index, pointSet: hitSet };
      }
      els.overlay.setPointerCapture(ev.pointerId);
      return;
    }
    if (toolMode !== "add") {
      state.drag = {
        type: "slot_mesh_marquee",
        pointerId: ev.pointerId,
        startX: mx,
        startY: my,
        curX: mx,
        curY: my,
        append: !!(ev.altKey || ev.shiftKey || ev.ctrlKey || ev.metaKey),
      };
      els.overlay.setPointerCapture(ev.pointerId);
      return;
    }
    if (!contour.closed && contour.points.length >= 3) {
      const first = contour.points[0];
      const fs = slotMeshLocalToScreen(slot, first, poseWorldForGizmo);
      const dx = fs.x - mx;
      const dy = fs.y - my;
      if (dx * dx + dy * dy <= 11 * 11) {
        markSlotContourDirty(slot, true);
        contour.closed = true;
        // If they close by shift-clicking the first point, add exactly one connecting edge
        if (ev.shiftKey) {
          if (!Array.isArray(contour.contourEdges)) contour.contourEdges = [];
          const lastIdx = contour.points.length - 1;
          const hasClosing = contour.contourEdges.some(e => (Math.min(e[0], e[1]) === 0 && Math.max(e[0], e[1]) === lastIdx));
          if (!hasClosing) contour.contourEdges.push([lastIdx, 0]);
        }
        contour.triangles = [];
        contour.fillPoints = [];
        contour.fillTriangles = [];
        contour.fillManualEdges = [];
        state.slotMesh.activeSet = "contour";
        state.slotMesh.activePoint = 0;
        setStatus("Contour closed. Triangulate to preview and Apply Mesh to commit.");
        return;
      }
    }
    if (contour.closed) {
      markSlotContourDirty(slot, true);
      contour.closed = false;
      contour.triangles = [];
      contour.fillPoints = [];
      contour.fillTriangles = [];
      contour.fillManualEdges = [];
    }
    const prevActive = state.slotMesh.activePoint;
    contour.points.push({ x: slotLocal.x, y: slotLocal.y });
    markSlotContourDirty(slot, true);
    const newIdx = contour.points.length - 1;
    if (!Array.isArray(contour.contourEdges)) contour.contourEdges = [];
    // Shift held: auto-connect from previous active point to new point
    if (ev.shiftKey && prevActive >= 0 && prevActive !== newIdx && prevActive < contour.points.length) {
      const lo = Math.min(prevActive, newIdx);
      const hi = Math.max(prevActive, newIdx);
      const exists = contour.contourEdges.some(e => Math.min(e[0], e[1]) === lo && Math.max(e[0], e[1]) === hi);
      if (!exists) contour.contourEdges.push([prevActive, newIdx]);
    }
    contour.manualEdges = normalizeEdgePairs(contour.manualEdges, contour.points.length);
    syncSlotContourSourcePoints(contour);
    state.slotMesh.activeSet = "contour";
    state.slotMesh.activePoint = newIdx;
    setSlotMeshSelection("contour", [state.slotMesh.activePoint], contour.points.length);
    state.slotMesh.edgeSelection = [state.slotMesh.activePoint];
    state.slotMesh.edgeSelectionSet = "contour";
    setStatus(ev.shiftKey ? `Contour point added & linked (${contour.points.length}).` : `Contour point added (${contour.points.length}). Hold Shift to auto-link.`);
    return;
  }

  if (state.addBoneArmed && state.editMode === "skeleton" && state.boneMode === "edit") {
    const parent = Number(els.addBoneParent.value);
    const connected = els.addBoneConnect.value === "true";
    const rigBones = state.mesh.rigBones;
    let head = { ...local };
    if (parent >= 0 && connected && rigBones[parent]) {
      const world = getEditAwareWorld(rigBones);
      head = transformPoint(world[parent], rigBones[parent].length, 0);
    }
    state.addBoneDraft = { parent, connected, head, tail: { ...local } };
    state.drag = { type: "add_bone_drag", pointerId: ev.pointerId };
    els.overlay.setPointerCapture(ev.pointerId);
    return;
  }

  if (isVertexDeformInteractionActive()) {
    state.vertexDeform.cursorX = mx;
    state.vertexDeform.cursorY = my;
    state.vertexDeform.hasCursor = true;
    const ctx = getActiveVertexContext(state.mesh);
    const vCount = ctx.vCount;
    const index = pickVertex(mx, my);
    if (index >= 0) {
      if (ev.shiftKey || ev.ctrlKey || ev.metaKey) {
        const next = toggleVertexSelectionIndex(index, vCount);
        setStatus(`Vertex selection: ${next.length} selected.`);
        return;
      }
      let selected = getActiveVertexSelection(vCount);
      if (!selected.includes(index)) {
        selected = [index];
        setActiveVertexSelection(selected, vCount);
      }
      const selectedForDrag = selected.length > 1 ? selected : [index];
      state.drag = {
        type: "vertex",
        index,
        prevX: mx,
        prevY: my,
        selectedIndices: selectedForDrag,
        mirrorMap: state.vertexDeform.mirror ? buildMirrorIndexMap(vCount) : null,
        influences: selectedForDrag.length > 1 ? null : gatherVertexDragInfluences(index, mx, my),
      };
      els.overlay.setPointerCapture(ev.pointerId);
    } else {
      state.drag = {
        type: "vertex_marquee",
        pointerId: ev.pointerId,
        startX: mx,
        startY: my,
        curX: mx,
        curY: my,
        append: !!(ev.shiftKey || ev.ctrlKey || ev.metaKey),
      };
      els.overlay.setPointerCapture(ev.pointerId);
    }
    return;
  }

  const forceMarquee = state.editMode === "skeleton" && state.boneMode !== "object" && !!ev.altKey;
  const dragPickRadius = forceMarquee ? 0 : 8;
  let hit = pickSkeletonHandle(mx, my, dragPickRadius);
  if ((state.editMode === "skeleton" || state.editMode === "object") && state.boneMode === "object") {
    const objectScaleRoot = pickObjectModeScaleHandleAtCanvas(mx, my);
    if (objectScaleRoot >= 0) {
      hit = { type: "object_scale_handle", boneIndex: objectScaleRoot };
    } else {
      const objectRoot = pickObjectModeRootAtCanvas(mx, my);
      if (objectRoot >= 0) {
        hit = { type: "bone_joint", boneIndex: objectRoot };
      }
    }
  }
  if (state.ikPickArmed && hit) {
    const c = getActiveIKConstraint();
    if (!c) {
      state.ikPickArmed = false;
      refreshIKUI();
      return;
    }
    c.target = hit.boneIndex;
    const tp = getIKSolveTargetWorld(getPoseBones(state.mesh), c);
    if (tp) {
      c.targetX = tp.x;
      c.targetY = tp.y;
    }
    state.ikPickArmed = false;
    state.ikHoverBone = -1;
    refreshIKUI();
    renderBoneTree();
    setStatus(`IK target set to bone ${hit.boneIndex}.`);
    return;
  }
  if (state.parentPickArmed && hit && state.boneMode === "edit") {
    const child = state.selectedBone;
    const parent = hit.boneIndex;
    if (child !== parent && isValidParent(state.mesh.rigBones, child, parent)) {
      state.mesh.rigBones[child].parent = parent;
      state.mesh.rigBones[child].connected = true;
      commitRigEdit(state.mesh, true);
      updateBoneUI();
      setStatus(`Parent set: bone ${child} -> ${parent}`);
    } else {
      setStatus("Invalid parent pick.");
    }
    state.parentPickArmed = false;
    state.parentHoverBone = -1;
    renderBoneTree();
    return;
  }

  if (state.dragTool !== "auto" && state.boneMode !== "object") {
    const targetBone = hit ? hit.boneIndex : state.selectedBone;
    if (targetBone >= 0) {
      state.selectedBone = targetBone;
      state.selectedBonesForWeight = [targetBone];
      updateBoneUI();
      const forcedType = state.dragTool === "move_head" ? "bone_joint" : "bone_tip";
      state.drag = { type: forcedType, boneIndex: targetBone, pointerId: ev.pointerId, needsReweight: false };
      els.overlay.setPointerCapture(ev.pointerId);
      return;
    }
  }

  if (hit) {
    if (state.boneMode === "object") {
      state.selectedBone = hit.boneIndex;
      const forceScale = hit.type === "object_scale_handle";
      const bones = getBonesForCurrentMode(state.mesh);
      if (!forceScale && (ev.ctrlKey || ev.metaKey)) {
        const picked = new Set(getSelectedBonesForWeight(state.mesh));
        if (picked.has(hit.boneIndex)) picked.delete(hit.boneIndex);
        else picked.add(hit.boneIndex);
        state.selectedBonesForWeight = [...picked];
        updateBoneUI();
        return;
      }
      let roots = [hit.boneIndex];
      if (!forceScale && ev.altKey) {
        const selectedRoots = getSelectedBonesForWeight(state.mesh).filter((bi) => Number.isFinite(bi) && bi >= 0 && bi < bones.length);
        if (selectedRoots.length > 0 && selectedRoots.includes(hit.boneIndex)) {
          roots = [...new Set(selectedRoots)];
        }
      }
      const objectItems = [];
      const selectedUnion = [];
      const world = computeWorld(bones);
      for (const rootIndex of roots) {
        const rootEp = getBoneWorldEndpointsFromBones(bones, rootIndex, world);
        if (!rootEp) continue;
        const subtree = getBoneSubtreeIndices(bones, rootIndex);
        for (const bi of subtree) {
          if (!selectedUnion.includes(bi)) selectedUnion.push(bi);
          const ep = getBoneWorldEndpointsFromBones(bones, bi, world);
          if (!ep) continue;
          objectItems.push({
            boneIndex: bi,
            rootIndex,
            rootPivot: { x: rootEp.head.x, y: rootEp.head.y },
            head: ep.head,
            tip: ep.tip,
          });
        }
      }
      state.selectedBonesForWeight = selectedUnion.length > 0 ? selectedUnion : [hit.boneIndex];
      let dragType = state.dragTool === "rotate" ? "bone_object_rotate" : "bone_object_move";
      if (forceScale) dragType = "bone_object_scale";
      else if (dragType === "bone_object_move" && ev.shiftKey) dragType = "bone_object_scale";
      state.drag = {
        type: dragType,
        pointerId: ev.pointerId,
        startLocal: local,
        needsReweight: false,
        items: objectItems,
        objectSnapshot: captureObjectSpaceSlotSnapshot(state.mesh, bones, roots, world),
      };
      if (dragType === "bone_object_rotate") {
        const angleByRoot = Object.create(null);
        for (const it of objectItems) {
          const rk = String(it.rootIndex);
          if (angleByRoot[rk] != null) continue;
          const pivot = it.rootPivot || { x: local.x, y: local.y };
          angleByRoot[rk] = Math.atan2(local.y - (Number(pivot.y) || 0), local.x - (Number(pivot.x) || 0));
        }
        state.drag.startAngleByRoot = angleByRoot;
      } else if (dragType === "bone_object_scale") {
        const distByRoot = Object.create(null);
        const startSxByRoot = Object.create(null);
        const startSyByRoot = Object.create(null);
        for (const it of objectItems) {
          const rk = String(it.rootIndex);
          if (distByRoot[rk] != null) continue;
          const pivot = it.rootPivot || { x: local.x, y: local.y };
          let startDist = Math.hypot(local.x - (Number(pivot.x) || 0), local.y - (Number(pivot.y) || 0));
          if (startDist < 1e-6) {
            let fallback = 0;
            for (const pt of objectItems) {
              if (String(pt.rootIndex) !== rk) continue;
              fallback = Math.max(
                fallback,
                Math.hypot((Number(pt.head && pt.head.x) || 0) - (Number(pivot.x) || 0), (Number(pt.head && pt.head.y) || 0) - (Number(pivot.y) || 0)),
                Math.hypot((Number(pt.tip && pt.tip.x) || 0) - (Number(pivot.x) || 0), (Number(pt.tip && pt.tip.y) || 0) - (Number(pivot.y) || 0))
              );
            }
            startDist = Math.max(12, fallback);
          }
          distByRoot[rk] = startDist;
          const rootBone = bones[it.rootIndex];
          if (rootBone) {
            normalizeBoneChannels(rootBone);
            startSxByRoot[rk] = Number(rootBone.sx) || 1;
            startSyByRoot[rk] = Number(rootBone.sy) || 1;
          }
        }
        state.drag.startDistByRoot = distByRoot;
        state.drag.startSxByRoot = startSxByRoot;
        state.drag.startSyByRoot = startSyByRoot;
      }
      els.overlay.setPointerCapture(ev.pointerId);
      refreshCanvasInteractionAffordance();
      updateBoneUI();
      return;
    }
    if (ev.ctrlKey || ev.metaKey) {
      const set = new Set(getSelectedBonesForWeight(state.mesh));
      if (set.has(hit.boneIndex)) set.delete(hit.boneIndex);
      else set.add(hit.boneIndex);
      state.selectedBonesForWeight = [...set];
      const parts = state.selectedBoneParts || [];
      if (state.boneMode === "edit" && hit.type === "bone_joint") {
        const jointSelected = hasBoneJointSelection(hit.boneIndex);
        for (let i = parts.length - 1; i >= 0; i -= 1) {
          if (parts[i].index === hit.boneIndex && (parts[i].type === "head" || parts[i].type === "tail")) {
            parts.splice(i, 1);
          }
        }
        if (!jointSelected) parts.push(...getBoneJointSelectionParts(hit.boneIndex));
      } else {
        const partType = hit.type === "bone_joint" ? "head" : "tail";
        const partIdx = parts.findIndex(p => p.index === hit.boneIndex && p.type === partType);
        if (partIdx >= 0) parts.splice(partIdx, 1);
        else parts.push({ index: hit.boneIndex, type: partType });
      }
      state.selectedBoneParts = parts;
      state.selectedBone = hit.boneIndex;
      updateBoneUI();
      return;
    }
    state.selectedBone = hit.boneIndex;
    const selectedParts = state.selectedBoneParts || [];
    const hitPartTypes = state.boneMode === "edit" && hit.type === "bone_joint" ? ["head", "tail"] : [hit.type === "bone_joint" ? "head" : "tail"];
    const dragWholeSelection =
      selectedParts.length > 1 &&
      hitPartTypes.every((partType) => selectedParts.some(p => p.index === hit.boneIndex && p.type === partType));
    if (!dragWholeSelection) {
      state.selectedBonesForWeight = [hit.boneIndex];
      state.selectedBoneParts =
        state.boneMode === "edit" && hit.type === "bone_joint"
          ? getBoneJointSelectionParts(hit.boneIndex)
          : [{ index: hit.boneIndex, type: hitPartTypes[0] }];
      updateBoneUI();
      if (state.boneMode === "edit" && hit.type === "bone_joint") {
        const bones = getBonesForCurrentMode(state.mesh);
        const world = getEditAwareWorld(bones);
        state.drag = {
          type: "bone_part_multi_move",
          pointerId: ev.pointerId,
          startLocal: local,
          needsReweight: false,
          items: getBoneJointSelectionParts(hit.boneIndex).map((p) => {
            const ep = getBoneWorldEndpointsFromBones(bones, p.index, world);
            return { boneIndex: p.index, type: p.type, head: ep.head, tip: ep.tip };
          })
        };
      } else {
        state.drag = { ...hit, pointerId: ev.pointerId, needsReweight: false };
      }
      els.overlay.setPointerCapture(ev.pointerId);
      return;
    }
    const bones = getBonesForCurrentMode(state.mesh);
    const world = state.boneMode === "pose" ? getSolvedPoseWorld(state.mesh) : getEditAwareWorld(bones);
    state.drag = {
      type: "bone_part_multi_move",
      pointerId: ev.pointerId,
      startLocal: local,
      needsReweight: false,
      items: selectedParts.map(p => {
        const ep = getBoneWorldEndpointsFromBones(bones, p.index, world);
        return { boneIndex: p.index, type: p.type, head: ep.head, tip: ep.tip };
      })
    };
    els.overlay.setPointerCapture(ev.pointerId);
    updateBoneUI();
    return;
  }

  if (state.editMode === "skeleton") {
    state.drag = {
      type: "bone_marquee",
      pointerId: ev.pointerId,
      startX: mx,
      startY: my,
      curX: mx,
      curY: my,
      append: !!(ev.ctrlKey || ev.metaKey),
    };
    els.overlay.setPointerCapture(ev.pointerId);
    return;
  }

  if (!ev.ctrlKey && !ev.metaKey && !ev.shiftKey && !ev.altKey) {
    clearBoneSelection(true);
  }
});

els.overlay.addEventListener("pointermove", (ev) => {
  const allowNoMesh =
    isBaseImageEditTabActive() ||
    (state.drag &&
      (String(state.drag.type || "").startsWith("base_transform_") || state.drag.type === "view_pan"));
  if (!state.mesh && !allowNoMesh) return;

  const rect = els.overlay.getBoundingClientRect();
  const dpr = els.overlay.width / rect.width;
  const mx = (ev.clientX - rect.left) * dpr;
  const my = (ev.clientY - rect.top) * dpr;
  const local = screenToLocal(mx, my);
  const m = state.mesh;
  if (isVertexDeformInteractionActive()) {
    state.vertexDeform.cursorX = mx;
    state.vertexDeform.cursorY = my;
    state.vertexDeform.hasCursor = true;
  }
  if (m && !state.ikPickArmed && state.ikHoverBone !== -1) {
    state.ikHoverBone = -1;
    renderBoneTree();
  }
  if (m && state.ikPickArmed && !state.drag) {
    const h = pickSkeletonHandle(mx, my);
    const next = h ? h.boneIndex : -1;
    if (next !== state.ikHoverBone) {
      state.ikHoverBone = next;
      renderBoneTree();
    }
  }
  if (m && !state.parentPickArmed && state.parentHoverBone !== -1) {
    state.parentHoverBone = -1;
    renderBoneTree();
  }
  if (m && state.parentPickArmed && !state.drag) {
    const h = pickSkeletonHandle(mx, my);
    const next = h ? h.boneIndex : -1;
    if (next !== state.parentHoverBone) {
      state.parentHoverBone = next;
      renderBoneTree();
    }
  }
  if (m && (state.editMode === "skeleton" || state.editMode === "object") && state.boneMode === "object" && !state.drag) {
    const scaleRoot = pickObjectModeScaleHandleAtCanvas(mx, my);
    if (scaleRoot !== state.objectScaleHoverRoot) state.objectScaleHoverRoot = scaleRoot;
    if (scaleRoot >= 0) {
      if (scaleRoot !== state.objectHoverRoot) state.objectHoverRoot = scaleRoot;
      if (els.overlay) els.overlay.style.cursor = "nwse-resize";
    } else {
      const next = pickObjectModeRootAtCanvas(mx, my);
      if (next !== state.objectHoverRoot) state.objectHoverRoot = next;
      if (els.overlay) els.overlay.style.cursor = "";
    }
  } else if (!state.drag && (state.objectHoverRoot !== -1 || state.objectScaleHoverRoot !== -1 || (els.overlay && els.overlay.style.cursor))) {
    state.objectHoverRoot = -1;
    state.objectScaleHoverRoot = -1;
    if (els.overlay) els.overlay.style.cursor = "";
  }
  if (!state.drag) return;

  if (state.drag.type === "view_pan") {
    const dx = mx - (Number(state.drag.prevX) || mx);
    const dy = my - (Number(state.drag.prevY) || my);
    state.view.cx += dx;
    state.view.cy += dy;
    state.drag.prevX = mx;
    state.drag.prevY = my;
    return;
  }

  if (state.drag.type === "base_transform_move") {
    const si = Number(state.drag.slotIndex);
    const slot =
      Number.isFinite(si) && si >= 0 && si < state.slots.length ? state.slots[si] : getActiveSlot();
    const tr = getSlotBaseImageTransform(slot);
    const dx = local.x - (Number(state.drag.startLocal && state.drag.startLocal.x) || local.x);
    const dy = local.y - (Number(state.drag.startLocal && state.drag.startLocal.y) || local.y);
    const localDelta = worldDeltaToBaseLocal({ x: dx, y: dy }, state.drag.spaceWorld);
    tr.tx = (Number(state.drag.startTx) || 0) + (Number(localDelta.x) || 0);
    tr.ty = (Number(state.drag.startTy) || 0) + (Number(localDelta.y) || 0);
    setSlotBaseImageTransform(tr, slot);
    if (!Number.isFinite(si) || si === state.activeSlot) syncBaseImageTransformInputs();
    return;
  }

  if (state.drag.type === "base_transform_rotate") {
    const si = Number(state.drag.slotIndex);
    const slot =
      Number.isFinite(si) && si >= 0 && si < state.slots.length ? state.slots[si] : getActiveSlot();
    const tr = getSlotBaseImageTransform(slot);
    const pivot = state.drag.pivotLocal || { x: local.x, y: local.y };
    const angle = Math.atan2(local.y - (Number(pivot.y) || 0), local.x - (Number(pivot.x) || 0));
    tr.rot = (Number(state.drag.startRot) || 0) + shortestAngleDelta(Number(state.drag.startAngle) || 0, angle);
    setSlotBaseImageTransform(tr, slot);
    if (!Number.isFinite(si) || si === state.activeSlot) syncBaseImageTransformInputs();
    return;
  }

  if (state.drag.type === "base_transform_scale") {
    const si = Number(state.drag.slotIndex);
    const slot =
      Number.isFinite(si) && si >= 0 && si < state.slots.length ? state.slots[si] : getActiveSlot();
    const tr = getSlotBaseImageTransform(slot);
    const pivot = state.drag.pivotLocal || { x: local.x, y: local.y };
    const dist = Math.max(1e-6, Math.hypot(local.x - (Number(pivot.x) || 0), local.y - (Number(pivot.y) || 0)));
    const ratio = dist / Math.max(1e-6, Number(state.drag.startDist) || 1);
    tr.scale = math.clamp((Number(state.drag.startScale) || 1) * ratio, 0.01, 100);
    setSlotBaseImageTransform(tr, slot);
    if (!Number.isFinite(si) || si === state.activeSlot) syncBaseImageTransformInputs();
    return;
  }

  if (state.drag.type === "slot_transform_move") {
    const si = Number(state.drag.slotIndex);
    const slot = Number.isFinite(si) && si >= 0 && si < state.slots.length ? state.slots[si] : null;
    if (!slot) return;
    const dx = local.x - (Number(state.drag.startLocal && state.drag.startLocal.x) || local.x);
    const dy = local.y - (Number(state.drag.startLocal && state.drag.startLocal.y) || local.y);
    if (state.drag.boneWorld) {
      const inv = invert(state.drag.boneWorld);
      const lx = inv[0] * dx + inv[1] * dy;
      const ly = inv[2] * dx + inv[3] * dy;
      slot.tx = (Number(state.drag.startTx) || 0) + lx;
      slot.ty = (Number(state.drag.startTy) || 0) + ly;
    } else {
      slot.tx = (Number(state.drag.startTx) || 0) + dx;
      slot.ty = (Number(state.drag.startTy) || 0) + dy;
    }
    if (si === state.activeSlot) syncActiveSlotTransformInputs();
    return;
  }

  if (state.drag.type === "slot_transform_rotate") {
    const si = Number(state.drag.slotIndex);
    const slot = Number.isFinite(si) && si >= 0 && si < state.slots.length ? state.slots[si] : null;
    if (!slot) return;
    const pivot = state.drag.pivotLocal || { x: local.x, y: local.y };
    const angle = Math.atan2(local.y - (Number(pivot.y) || 0), local.x - (Number(pivot.x) || 0));
    slot.rot = (Number(state.drag.startRot) || 0) + shortestAngleDelta(Number(state.drag.startAngle) || 0, angle);
    if (si === state.activeSlot) syncActiveSlotTransformInputs();
    return;
  }

  if (state.drag.type === "path_point") {
    const c = getActivePathConstraint();
    if (!c || c.sourceType !== "drawn" || !Array.isArray(c.points)) return;
    const i = Number(state.drag.index);
    if (!Number.isFinite(i) || i < 0 || i >= c.points.length) return;
    const p = normalizePathNode(c.points[i]);
    const dx = local.x - (Number(state.drag.prevLocal && state.drag.prevLocal.x) || local.x);
    const dy = local.y - (Number(state.drag.prevLocal && state.drag.prevLocal.y) || local.y);
    p.x += dx;
    p.y += dy;
    p.hinx += dx;
    p.hiny += dy;
    p.houtx += dx;
    p.houty += dy;
    c.points[i] = p;
    applyAutoHandlesForConstraint(c);
    state.drag.prevLocal = { x: local.x, y: local.y };
    return;
  }

  if (state.drag.type === "path_handle") {
    const c = getActivePathConstraint();
    if (!c || c.sourceType !== "drawn" || !Array.isArray(c.points)) return;
    const i = Number(state.drag.index);
    if (!Number.isFinite(i) || i < 0 || i >= c.points.length) return;
    const p = normalizePathNode(c.points[i]);
    const h = state.drag.handle === "in" ? "in" : "out";
    const mode = p.handleMode || (p.broken ? "broken" : "aligned");
    if (h === "in") {
      p.hinx = local.x;
      p.hiny = local.y;
      if (mode === "aligned" && !ev.altKey) {
        const vx = p.x - p.hinx;
        const vy = p.y - p.hiny;
        const dir = normalizeVec(vx, vy);
        const ox = p.houtx - p.x;
        const oy = p.houty - p.y;
        const olen = Math.max(1e-6, Math.hypot(ox, oy));
        p.houtx = p.x + dir.x * olen;
        p.houty = p.y + dir.y * olen;
      } else if (mode === "auto" || ev.altKey) {
        p.broken = true;
        p.handleMode = "broken";
      }
    } else {
      p.houtx = local.x;
      p.houty = local.y;
      if (mode === "aligned" && !ev.altKey) {
        const vx = p.x - p.houtx;
        const vy = p.y - p.houty;
        const dir = normalizeVec(vx, vy);
        const ix = p.hinx - p.x;
        const iy = p.hiny - p.y;
        const ilen = Math.max(1e-6, Math.hypot(ix, iy));
        p.hinx = p.x + dir.x * ilen;
        p.hiny = p.y + dir.y * ilen;
      } else if (mode === "auto" || ev.altKey) {
        p.broken = true;
        p.handleMode = "broken";
      }
    }
    c.points[i] = p;
    applyAutoHandlesForConstraint(c);
    return;
  }

  if (state.drag.type === "slot_mesh_point") {
    const slot = getActiveSlot();
    if (!slot) return;
    const contour = ensureSlotContour(slot);
    const poseWorld = getSolvedPoseWorld(state.mesh);
    const slotLocal = worldToSlotMeshLocal(slot, local, poseWorld);
    const setName = state.drag.pointSet === "fill" ? "fill" : "contour";
    const points = setName === "fill" ? contour.fillPoints : contour.points;
    const i = state.drag.pointIndex;
    if (i >= 0 && i < points.length) {
      points[i] = { x: slotLocal.x, y: slotLocal.y };
      markSlotContourDirty(slot, true);
      if (setName === "contour") {
        contour.triangles = [];
        contour.fillPoints = [];
        contour.fillTriangles = [];
        contour.fillManualEdges = [];
        syncSlotContourSourcePoints(contour);
      }
      state.slotMesh.activeSet = setName;
      state.slotMesh.activePoint = i;
    }
    return;
  }

  if (state.drag.type === "slot_mesh_multi_move") {
    const slot = getActiveSlot();
    if (!slot) return;
    const contour = ensureSlotContour(slot);
    const poseWorld = getSolvedPoseWorld(state.mesh);
    const slotLocal = worldToSlotMeshLocal(slot, local, poseWorld);
    const prev = state.drag.prevSlotLocal || slotLocal;
    const dx = (Number(slotLocal.x) || 0) - (Number(prev.x) || 0);
    const dy = (Number(slotLocal.y) || 0) - (Number(prev.y) || 0);
    if (Math.abs(dx) > 1e-8 || Math.abs(dy) > 1e-8) {
      const setName = state.drag.pointSet === "fill" ? "fill" : "contour";
      const points = setName === "fill" ? contour.fillPoints : contour.points;
      const list = setSlotMeshSelection(setName, state.drag.pointIndices, points.length);
      for (const i of list) {
        const p = points[i];
        if (!p) continue;
        p.x = (Number(p.x) || 0) + dx;
        p.y = (Number(p.y) || 0) + dy;
      }
      markSlotContourDirty(slot, true);
      if (setName === "contour") {
        contour.triangles = [];
        contour.fillPoints = [];
        contour.fillTriangles = [];
        contour.fillManualEdges = [];
        syncSlotContourSourcePoints(contour);
      }
      state.slotMesh.activeSet = setName;
      if (list.length > 0) state.slotMesh.activePoint = list[list.length - 1];
    }
    state.drag.prevSlotLocal = { x: slotLocal.x, y: slotLocal.y };
    return;
  }

  if (state.drag.type === "slot_mesh_marquee") {
    state.drag.curX = mx;
    state.drag.curY = my;
    return;
  }

  if (state.drag.type === "add_bone_drag") {
    const local = screenToLocal(mx, my);
    if (state.addBoneDraft) {
      state.addBoneDraft.tail = { ...local };
    }
    return;
  }

  if (state.drag.type === "vertex") {
    const dx = (mx - state.drag.prevX) / state.view.scale;
    const dy = (my - state.drag.prevY) / state.view.scale;
    const offsets = getActiveOffsets(m);
    const ctx = getActiveVertexContext(m);
    const pinned = getActivePinnedVertexSet(ctx.vCount);
    const mirrorMap = state.vertexDeform.mirror && state.drag.mirrorMap instanceof Map ? state.drag.mirrorMap : null;
    const applyDelta = (i, ddx, ddy) => {
      if (!Number.isFinite(i) || i < 0 || i >= ctx.vCount) return;
      if (pinned.has(i)) return;
      offsets[i * 2] += ddx;
      offsets[i * 2 + 1] += ddy;
      if (mirrorMap) {
        const mi = Number(mirrorMap.get(i));
        if (!Number.isFinite(mi) || mi < 0 || mi >= ctx.vCount || mi === i || pinned.has(mi)) return;
        offsets[mi * 2] += -ddx;
        offsets[mi * 2 + 1] += ddy;
      }
    };
    const selected = sanitizeVertexIndexArray(state.drag.selectedIndices, ctx.vCount);
    if (selected.length > 1) {
      for (const i of selected) {
        applyDelta(i, dx, dy);
      }
    } else {
      const influences =
        Array.isArray(state.drag.influences) && state.drag.influences.length > 0
          ? state.drag.influences
          : [{ index: state.drag.index, weight: 1 }];
      for (const it of influences) {
        const i = Number(it && it.index);
        if (!Number.isFinite(i) || i < 0) continue;
        const w = math.clamp(Number(it && it.weight) || 0, 0, 1);
        if (w <= 1e-5) continue;
        applyDelta(i, dx * w, dy * w);
      }
    }
    markDirtyVertexTrack(state.activeSlot);
    state.drag.prevX = mx;
    state.drag.prevY = my;
    return;
  }

  if (state.drag.type === "vertex_marquee") {
    state.drag.curX = mx;
    state.drag.curY = my;
    return;
  }

  if (state.drag.type === "bone_marquee") {
    state.drag.curX = mx;
    state.drag.curY = my;
    return;
  }

  const bones = getBonesForCurrentMode(m);
  if (state.drag.type === "bone_joint") {
    if (state.boneMode === "edit") {
      const snapshot = captureEditBoneSnapshot(bones);
      const ep = getBoneWorldEndpointsFromBones(bones, state.drag.boneIndex);
      setBoneFromWorldEndpoints(bones, state.drag.boneIndex, local, ep.tip);
      preserveConnectedChildTipsAfterEdit(bones, snapshot, [state.drag.boneIndex]);
      markDirtyByBoneProp(state.drag.boneIndex, "translate");
      markDirtyByBoneProp(state.drag.boneIndex, "rotate");
      markDirtyByBoneProp(state.drag.boneIndex, "scale");
      commitRigEditPreserveCurrentLook(m);
      updateBoneUI();
      return;
    }
    const ikDriven = moveBoneJointToLocal(bones, state.drag.boneIndex, local);
    if (!ikDriven) {
      markDirtyByBoneProp(state.drag.boneIndex, "translate");
    }
    updateBoneUI();
    return;
  }

  if (state.drag.type === "bone_tip") {
    const rotateResult = rotateBoneTipToLocal(bones, state.drag.boneIndex, local) || {
      ikDriven: false,
      movedHead: false,
    };
    const ikDriven = !!rotateResult.ikDriven;
    if (!ikDriven) {
      if (rotateResult.movedHead) {
        markDirtyByBoneProp(state.drag.boneIndex, "translate");
      }
      markDirtyByBoneProp(state.drag.boneIndex, "rotate");
      markDirtyByBoneProp(state.drag.boneIndex, "scale");
    }
    if (state.boneMode === "edit") {
      commitRigEditPreserveCurrentLook(m);
    }
    updateBoneUI();
    return;
  }

  if (state.drag.type === "bone_part_multi_move") {
    const d = state.drag;
    const dx = local.x - d.startLocal.x;
    const dy = local.y - d.startLocal.y;
    const snapshot = state.boneMode === "edit" ? captureEditBoneSnapshot(bones) : null;

    const movesByBone = new Map();
    for (const it of d.items) {
      const b = movesByBone.get(it.boneIndex) || { headMove: false, tailMove: false, origHead: it.head, origTip: it.tip };
      if (it.type === "head") b.headMove = true;
      if (it.type === "tail") b.tailMove = true;
      movesByBone.set(it.boneIndex, b);
    }

    const editedIndices = [];
    for (const [bi, bData] of movesByBone.entries()) {
      const nh = bData.headMove ? { x: bData.origHead.x + dx, y: bData.origHead.y + dy } : bData.origHead;
      const nt = bData.tailMove ? { x: bData.origTip.x + dx, y: bData.origTip.y + dy } : bData.origTip;
      setBoneFromWorldEndpoints(bones, bi, nh, nt);
      markDirtyByBoneProp(bi, "translate");
      markDirtyByBoneProp(bi, "rotate");
      markDirtyByBoneProp(bi, "scale");
      editedIndices.push(bi);
    }

    if (state.boneMode === "edit" && snapshot) {
      preserveConnectedChildTipsAfterEdit(bones, snapshot, editedIndices);
      commitRigEditPreserveCurrentLook(m);
    }
    updateBoneUI();
    return;
  }

  if (state.drag.type === "bone_multi_move") {
    const d = state.drag;
    const dx = local.x - d.startLocal.x;
    const dy = local.y - d.startLocal.y;
    for (const it of d.items) {
      const nh = { x: it.head.x + dx, y: it.head.y + dy };
      const nt = { x: it.tip.x + dx, y: it.tip.y + dy };
      setBoneFromWorldEndpoints(bones, it.boneIndex, nh, nt);
      markDirtyByBoneProp(it.boneIndex, "translate");
    }
    if (state.boneMode === "edit") {
      commitRigEditPreserveCurrentLook(m);
    }
    updateBoneUI();
    return;
  }

  if (state.drag.type === "bone_object_move") {
    const d = state.drag;
    const dx = local.x - d.startLocal.x;
    const dy = local.y - d.startLocal.y;
    for (const it of d.items) {
      const nh = { x: it.head.x + dx, y: it.head.y + dy };
      const nt = { x: it.tip.x + dx, y: it.tip.y + dy };
      setBoneFromWorldEndpoints(bones, it.boneIndex, nh, nt);
      markDirtyByBoneProp(it.boneIndex, "translate");
    }
    const deltaByRoot = new Map();
    for (const [rootIndex, rootState] of (d.objectSnapshot && d.objectSnapshot.roots) || []) {
      deltaByRoot.set(rootIndex, makeTranslationMatrix(dx, dy));
    }
    const nextWorld = computeWorld(bones);
    applyObjectSpaceSlotSnapshot(d.objectSnapshot, deltaByRoot, nextWorld);
    if (state.boneMode === "edit") commitRigEdit(m, false);
    else if (state.boneMode === "object") commitRigEdit(m, false);
    updateBoneUI();
    return;
  }

  if (state.drag.type === "bone_object_scale") {
    const d = state.drag;
    const startDistByRoot =
      d.startDistByRoot && typeof d.startDistByRoot === "object" ? d.startDistByRoot : Object.create(null);
    const startSxByRoot =
      d.startSxByRoot && typeof d.startSxByRoot === "object" ? d.startSxByRoot : Object.create(null);
    const startSyByRoot =
      d.startSyByRoot && typeof d.startSyByRoot === "object" ? d.startSyByRoot : Object.create(null);
    const processedRoots = new Set();
    for (const it of d.items) {
      const rk = String(it.rootIndex);
      if (processedRoots.has(rk)) continue;
      processedRoots.add(rk);
      const pivot = it.rootPivot || { x: local.x, y: local.y };
      const startDist = Math.max(1e-6, Number(startDistByRoot[rk]) || 1);
      const currDist = Math.max(1e-6, Math.hypot(local.x - (Number(pivot.x) || 0), local.y - (Number(pivot.y) || 0)));
      const scaleRatio = math.clamp(currDist / startDist, 0.05, 40);
      const rootBone = bones[it.rootIndex];
      if (rootBone) {
        normalizeBoneChannels(rootBone);
        const origSx = Number(startSxByRoot[rk]) || 1;
        const origSy = Number(startSyByRoot[rk]) || 1;
        rootBone.sx = origSx * scaleRatio;
        rootBone.sy = origSy * scaleRatio;
        markDirtyByBoneProp(it.rootIndex, "scale");
      }
    }
    enforceConnectedHeads(bones);
    const deltaByRoot = new Map();
    for (const [rootIndex, rootState] of (d.objectSnapshot && d.objectSnapshot.roots) || []) {
      const rk = String(rootIndex);
      const startDist = Math.max(1e-6, Number(startDistByRoot[rk]) || 1);
      const currDist = Math.max(1e-6, Math.hypot(local.x - (Number(rootState.pivot && rootState.pivot.x) || 0), local.y - (Number(rootState.pivot && rootState.pivot.y) || 0)));
      const scaleRatio = math.clamp(currDist / startDist, 0.05, 40);
      deltaByRoot.set(rootIndex, makeScaleAroundPointMatrix(rootState.pivot, scaleRatio));
    }
    const nextWorld = computeWorld(bones);
    applyObjectSpaceSlotSnapshot(d.objectSnapshot, deltaByRoot, nextWorld);
    if (state.boneMode === "edit") commitRigEdit(m, false);
    else if (state.boneMode === "object") commitRigEdit(m, false);
    updateBoneUI();
    return;
  }

  if (state.drag.type === "bone_object_rotate") {
    const d = state.drag;
    const startMap = d.startAngleByRoot && typeof d.startAngleByRoot === "object" ? d.startAngleByRoot : Object.create(null);
    const deltaByRoot = Object.create(null);
    for (const it of d.items) {
      const rk = String(it.rootIndex);
      if (deltaByRoot[rk] != null) continue;
      const pivot = it.rootPivot || { x: local.x, y: local.y };
      const startA = Number(startMap[rk]);
      const currA = Math.atan2(local.y - (Number(pivot.y) || 0), local.x - (Number(pivot.x) || 0));
      deltaByRoot[rk] = Number.isFinite(startA) ? shortestAngleDelta(startA, currA) : 0;
    }
    for (const it of d.items) {
      const rk = String(it.rootIndex);
      const delta = Number(deltaByRoot[rk]) || 0;
      const pivot = it.rootPivot || { x: 0, y: 0 };
      const nh = rotatePointAroundPivot(it.head, pivot, delta);
      const nt = rotatePointAroundPivot(it.tip, pivot, delta);
      setBoneFromWorldEndpoints(bones, it.boneIndex, nh, nt);
      markDirtyByBoneProp(it.boneIndex, "translate");
      markDirtyByBoneProp(it.boneIndex, "rotate");
    }
    const slotDeltaByRoot = new Map();
    for (const [rootIndex, rootState] of (d.objectSnapshot && d.objectSnapshot.roots) || []) {
      const delta = Number(deltaByRoot[String(rootIndex)]) || 0;
      slotDeltaByRoot.set(rootIndex, makeRotationAroundPointMatrix(rootState.pivot, delta));
    }
    const nextWorld = computeWorld(bones);
    applyObjectSpaceSlotSnapshot(d.objectSnapshot, slotDeltaByRoot, nextWorld);
    if (state.boneMode === "edit") commitRigEdit(m, false);
    else if (state.boneMode === "object") commitRigEdit(m, false);
    updateBoneUI();
  }
});

