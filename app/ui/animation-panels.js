// Split from app.js
// Part: Animation, events, preview export, onion skin, state machine, layers
// Original source: app/06-bindings-editor-panels.js (segment 3)
els.animDuration.addEventListener("input", () => {
  const anim = getCurrentAnimation();
  if (!anim) return;
  anim.duration = Math.max(0.1, Number(els.animDuration.value) || anim.duration || 5);
  normalizeAnimationRecord(anim);
  setAnimTime(state.anim.time);
});
if (els.animRangeStart) {
  els.animRangeStart.addEventListener("input", () => {
    const anim = getCurrentAnimation();
    if (!anim) return;
    anim.rangeStart = Number(els.animRangeStart.value) || 0;
    normalizeAnimationRecord(anim);
    if (state.anim.time < anim.rangeStart) setAnimTime(anim.rangeStart);
    else {
      refreshAnimationUI();
      renderTimelineTracks();
    }
  });
}
if (els.animRangeEnd) {
  els.animRangeEnd.addEventListener("input", () => {
    const anim = getCurrentAnimation();
    if (!anim) return;
    anim.rangeEnd = Number(els.animRangeEnd.value) || anim.duration || 5;
    normalizeAnimationRecord(anim);
    if (state.anim.time > anim.rangeEnd) setAnimTime(anim.rangeEnd);
    else {
      refreshAnimationUI();
      renderTimelineTracks();
    }
  });
}
els.animTime.addEventListener("input", () => {
  setAnimTime(Number(els.animTime.value) || 0);
  if (state.mesh) {
    samplePoseAtTime(state.mesh, state.anim.time);
    if (state.boneMode === "pose") updateBoneUI();
  }
});
els.animSelect.addEventListener("change", () => {
  state.anim.mix.active = false;
  state.anim.currentAnimId = els.animSelect.value;
  const anim = getCurrentAnimation();
  if (!anim) return;
  const active = getAnimationActiveRange(anim);
  clearTimelineKeySelection();
  setAnimTime(active.start);
  refreshAnimationUI();
  if (state.mesh) {
    samplePoseAtTime(state.mesh, active.start);
    if (state.boneMode === "pose") updateBoneUI();
  }
});
els.animName.addEventListener("input", () => {
  const anim = getCurrentAnimation();
  if (!anim) return;
  anim.name = els.animName.value.trim() || "Anim";
  refreshAnimationUI();
});
if (els.animActionBtn) {
  els.animActionBtn.addEventListener("click", () => {
    const action = els.animActionSelect ? String(els.animActionSelect.value || "new") : "new";
    if (action === "duplicate") {
      if (els.duplicateAnimBtn) els.duplicateAnimBtn.click();
      return;
    }
    if (action === "delete") {
      if (els.deleteAnimBtn) els.deleteAnimBtn.click();
      return;
    }
    if (els.addAnimBtn) els.addAnimBtn.click();
  });
}
els.addAnimBtn.addEventListener("click", () => {
  const idx = state.anim.animations.length + 1;
  const a = createAnimation(`Anim ${idx}`);
  state.anim.animations.push(a);
  state.anim.currentAnimId = a.id;
  state.anim.mix.active = false;
  clearTimelineKeySelection();
  setAnimTime(0);
  refreshAnimationUI();
});
els.duplicateAnimBtn.addEventListener("click", () => {
  const curr = getCurrentAnimation();
  if (!curr) return;
  const dup = {
    id: makeAnimId(),
    name: `${curr.name} Copy`,
    duration: curr.duration,
    rangeStart: Number(curr.rangeStart) || 0,
    rangeEnd: Number(curr.rangeEnd) || curr.duration,
    tracks: JSON.parse(JSON.stringify(curr.tracks)),
  };
  state.anim.animations.push(normalizeAnimationRecord(dup));
  state.anim.currentAnimId = dup.id;
  state.anim.mix.active = false;
  clearTimelineKeySelection();
  refreshAnimationUI();
});
els.deleteAnimBtn.addEventListener("click", () => {
  if (state.anim.animations.length <= 1) return;
  state.anim.animations = state.anim.animations.filter((a) => a.id !== state.anim.currentAnimId);
  ensureCurrentAnimation();
  state.anim.mix.active = false;
  clearTimelineKeySelection();
  const active = getAnimationActiveRange(getCurrentAnimation());
  setAnimTime(active.start);
  refreshAnimationUI();
});
if (els.timelineFilter) {
  els.timelineFilter.addEventListener("input", () => {
    state.anim.filterText = String(els.timelineFilter.value || "");
    renderTimelineTracks();
  });
}
if (els.timelineOnlyKeyed) {
  els.timelineOnlyKeyed.addEventListener("change", () => {
    state.anim.onlyKeyed = !!els.timelineOnlyKeyed.checked;
    renderTimelineTracks();
  });
}
if (els.timelineClearSoloMuteBtn) {
  els.timelineClearSoloMuteBtn.addEventListener("click", () => {
    clearTimelineSoloMuteFlags();
  });
}
if (els.autoKeyBtn) {
  els.autoKeyBtn.addEventListener("click", () => {
    state.anim.autoKey = !state.anim.autoKey;
    refreshAutoKeyUI();
    if (state.anim.autoKey) {
      scheduleAutoKeyFromDirty();
      setStatus("Auto Key enabled.");
    } else {
      setStatus("Auto Key disabled.");
    }
  });
}
if (els.undoBtn) {
  els.undoBtn.addEventListener("click", async () => {
    await undoAction();
  });
}
if (els.redoBtn) {
  els.redoBtn.addEventListener("click", async () => {
    await redoAction();
  });
}
if (els.exportPreviewWebmBtn) {
  els.exportPreviewWebmBtn.addEventListener("click", async () => {
    try {
      await exportPreviewWebM();
    } catch (err) {
      setStatus(`Preview WebM failed: ${err.message}`);
    }
  });
}
if (els.exportPreviewGifBtn) {
  els.exportPreviewGifBtn.addEventListener("click", async () => {
    try {
      await exportPreviewGif();
    } catch (err) {
      setStatus(`Preview GIF failed: ${err.message}`);
    }
  });
}
if (els.batchExportToggleBtn) {
  els.batchExportToggleBtn.addEventListener("click", () => {
    state.anim.batchExportOpen = !state.anim.batchExportOpen;
    refreshBatchExportUI();
  });
}
if (els.batchExportFormat) {
  els.batchExportFormat.addEventListener("change", () => {
    syncBatchExportSettingsFromUI();
    refreshBatchExportUI();
  });
}
if (els.batchExportFps) {
  els.batchExportFps.addEventListener("input", () => {
    syncBatchExportSettingsFromUI();
  });
}
if (els.batchExportPrefix) {
  els.batchExportPrefix.addEventListener("input", () => {
    syncBatchExportSettingsFromUI();
  });
}
if (els.batchExportRetries) {
  els.batchExportRetries.addEventListener("input", () => {
    syncBatchExportSettingsFromUI();
  });
}
if (els.batchExportDelayMs) {
  els.batchExportDelayMs.addEventListener("input", () => {
    syncBatchExportSettingsFromUI();
  });
}
if (els.batchExportZipPng) {
  els.batchExportZipPng.addEventListener("change", () => {
    syncBatchExportSettingsFromUI();
  });
}
if (els.batchExportSelectAllBtn) {
  els.batchExportSelectAllBtn.addEventListener("click", () => {
    if (!els.batchExportAnimList) return;
    for (const opt of els.batchExportAnimList.options) opt.selected = true;
  });
}
if (els.batchExportSelectNoneBtn) {
  els.batchExportSelectNoneBtn.addEventListener("click", () => {
    if (!els.batchExportAnimList) return;
    for (const opt of els.batchExportAnimList.options) opt.selected = false;
  });
}
if (els.batchExportRunBtn) {
  els.batchExportRunBtn.addEventListener("click", async () => {
    await runBatchExport();
  });
}
if (els.smEnabled) {
  els.smEnabled.addEventListener("change", () => {
    const sm = ensureStateMachine();
    sm.enabled = !!els.smEnabled.checked;
    refreshStateMachineUI();
    pushUndoCheckpoint(true);
  });
}
if (els.smStateSelect) {
  els.smStateSelect.addEventListener("change", () => {
    const sm = ensureStateMachine();
    const id = String(els.smStateSelect.value || "");
    if (id && sm.states.some((s) => s.id === id)) {
      sm.currentStateId = id;
      sm.selectedTransitionId = "";
      sm.selectedConditionId = "";
    }
    refreshStateMachineUI();
  });
}
if (els.smStateAddBtn) {
  els.smStateAddBtn.addEventListener("click", () => {
    const sm = ensureStateMachine();
    const fallbackAnim = (state.anim.animations && state.anim.animations[0] && state.anim.animations[0].id) || "";
    const st = { id: makeStateId(), name: `State ${sm.states.length + 1}`, animId: fallbackAnim, transitions: [] };
    sm.states.push(st);
    sm.currentStateId = st.id;
    refreshStateMachineUI();
    pushUndoCheckpoint(true);
  });
}
if (els.smStateDeleteBtn) {
  els.smStateDeleteBtn.addEventListener("click", () => {
    const sm = ensureStateMachine();
    if (sm.states.length <= 1) return;
    const id = sm.currentStateId;
    sm.states = sm.states.filter((s) => s.id !== id);
    for (const s of sm.states) s.transitions = (s.transitions || []).filter((t) => t.toStateId !== id);
    sm.currentStateId = sm.states[0] ? sm.states[0].id : "";
    refreshStateMachineUI();
    pushUndoCheckpoint(true);
  });
}
if (els.smStateName) {
  els.smStateName.addEventListener("input", () => {
    const s = getCurrentStateMachineState();
    if (!s) return;
    s.name = String(els.smStateName.value || "").trim() || s.name || "State";
    refreshStateMachineUI();
    pushUndoCheckpoint(true);
  });
}
if (els.smStateAnim) {
  els.smStateAnim.addEventListener("change", () => {
    const s = getCurrentStateMachineState();
    if (!s) return;
    s.animId = String(els.smStateAnim.value || "");
    refreshStateMachineUI();
    pushUndoCheckpoint(true);
  });
}
if (els.smTransitionAddBtn) {
  els.smTransitionAddBtn.addEventListener("click", () => {
    const sm = ensureStateMachine();
    const from = getCurrentStateMachineState();
    const toId = String(els.smTransitionTo ? els.smTransitionTo.value : "");
    if (!from || !toId) return;
    const tr = {
      id: makeStateTransitionId(),
      toStateId: toId,
      duration: Math.max(0.01, Number(els.smTransitionDur ? els.smTransitionDur.value : 0.2) || 0.2),
      auto: false,
      conditions: [],
    };
    if (!Array.isArray(from.transitions)) from.transitions = [];
    from.transitions.push(tr);
    sm.selectedTransitionId = tr.id;
    sm.pendingDuration = tr.duration;
    refreshStateMachineUI();
    pushUndoCheckpoint(true);
  });
}
if (els.smTransitionDur) {
  els.smTransitionDur.addEventListener("input", () => {
    const sm = ensureStateMachine();
    sm.pendingDuration = Math.max(0.01, Number(els.smTransitionDur.value) || 0.2);
    els.smTransitionDur.value = String(sm.pendingDuration);
  });
}
if (els.smTransitionList) {
  els.smTransitionList.addEventListener("change", () => {
    const sm = ensureStateMachine();
    sm.selectedTransitionId = String(els.smTransitionList.value || "");
    sm.selectedConditionId = "";
    refreshStateMachineUI();
  });
}
if (els.smTransitionDeleteBtn) {
  els.smTransitionDeleteBtn.addEventListener("click", () => {
    const sm = ensureStateMachine();
    const from = getCurrentStateMachineState();
    if (!from || !sm.selectedTransitionId) return;
    from.transitions = (from.transitions || []).filter((t) => t.id !== sm.selectedTransitionId);
    sm.selectedTransitionId = "";
    sm.selectedConditionId = "";
    refreshStateMachineUI();
    pushUndoCheckpoint(true);
  });
}
if (els.smTransitionGoBtn) {
  els.smTransitionGoBtn.addEventListener("click", () => {
    const sm = ensureStateMachine();
    if (!sm.enabled) return;
    const from = getCurrentStateMachineState();
    if (!from) return;
    const tr = (from.transitions || []).find((t) => t.id === sm.selectedTransitionId);
    if (!tr) return;
    transitionToState(tr.toStateId, tr.duration, from);
    pushUndoCheckpoint(true);
  });
}
if (els.smParamSelect) {
  els.smParamSelect.addEventListener("change", () => {
    const sm = ensureStateMachine();
    sm.selectedParamId = String(els.smParamSelect.value || "");
    refreshStateMachineUI();
  });
}
if (els.smParamAddBtn) {
  els.smParamAddBtn.addEventListener("click", () => {
    const sm = ensureStateMachine();
    const p = {
      id: makeStateParamId(),
      name: `Param ${sm.parameters.length + 1}`,
      type: "float",
      defaultValue: 0,
      value: 0,
    };
    sm.parameters.push(p);
    sm.selectedParamId = p.id;
    refreshStateMachineUI();
    refreshTrackSelect();
    renderTimelineTracks();
    pushUndoCheckpoint(true);
  });
}
if (els.smParamDeleteBtn) {
  els.smParamDeleteBtn.addEventListener("click", () => {
    const sm = ensureStateMachine();
    const id = String(sm.selectedParamId || "");
    if (!id) return;
    sm.parameters = (sm.parameters || []).filter((p) => p.id !== id);
    for (const st of sm.states || []) {
      for (const tr of st.transitions || []) {
        tr.conditions = (tr.conditions || []).filter((c) => c.paramId !== id);
      }
    }
    for (const anim of state.anim.animations || []) {
      if (!anim || !anim.tracks) continue;
      delete anim.tracks[getStateParamTrackId(id)];
    }
    sm.selectedParamId = sm.parameters[0] ? sm.parameters[0].id : "";
    refreshStateMachineUI();
    refreshTrackSelect();
    renderTimelineTracks();
    pushUndoCheckpoint(true);
  });
}
if (els.smParamName) {
  els.smParamName.addEventListener("input", () => {
    const sm = ensureStateMachine();
    const p = getStateParamById(sm, sm.selectedParamId);
    if (!p) return;
    p.name = String(els.smParamName.value || "").trim() || p.name || "Param";
    refreshStateMachineUI();
    refreshTrackSelect();
    renderTimelineTracks();
    pushUndoCheckpoint(true);
  });
}
if (els.smParamType) {
  els.smParamType.addEventListener("change", () => {
    const sm = ensureStateMachine();
    const p = getStateParamById(sm, sm.selectedParamId);
    if (!p) return;
    p.type = els.smParamType.value === "bool" ? "bool" : "float";
    p.defaultValue = parseStateParamRawValue(p.defaultValue, p.type);
    p.value = parseStateParamRawValue(p.value, p.type);
    refreshStateMachineUI();
    refreshTrackSelect();
    renderTimelineTracks();
    pushUndoCheckpoint(true);
  });
}
if (els.smParamDefault) {
  els.smParamDefault.addEventListener("input", () => {
    const sm = ensureStateMachine();
    const p = getStateParamById(sm, sm.selectedParamId);
    if (!p) return;
    p.defaultValue = parseStateParamRawValue(els.smParamDefault.value, p.type);
  });
}
if (els.smParamSetBtn) {
  els.smParamSetBtn.addEventListener("click", () => {
    const sm = ensureStateMachine();
    const p = getStateParamById(sm, sm.selectedParamId);
    if (!p || !els.smParamValue) return;
    p.value = parseStateParamRawValue(els.smParamValue.value, p.type);
    refreshStateMachineUI();
    pushUndoCheckpoint(true);
  });
}
if (els.smParamKeyBtn) {
  els.smParamKeyBtn.addEventListener("click", () => {
    const sm = ensureStateMachine();
    const p = getStateParamById(sm, sm.selectedParamId);
    if (!p) return;
    const trackId = getStateParamTrackId(p.id);
    refreshTrackSelect();
    setSelectedTimelineTrack(trackId);
    addOrUpdateKeyframeForTrack(trackId);
  });
}
if (els.smTransitionAuto) {
  els.smTransitionAuto.addEventListener("change", () => {
    const tr = getSelectedStateTransition();
    if (!tr) return;
    tr.auto = !!els.smTransitionAuto.checked;
    refreshStateMachineUI();
    pushUndoCheckpoint(true);
  });
}
if (els.smCondAddBtn) {
  els.smCondAddBtn.addEventListener("click", () => {
    const sm = ensureStateMachine();
    const tr = getSelectedStateTransition();
    if (!tr || !els.smCondParam || !els.smCondOp || !els.smCondValue) return;
    const paramId = String(els.smCondParam.value || "");
    const p = getStateParamById(sm, paramId);
    if (!p) return;
    const cond = {
      id: makeStateConditionId(),
      paramId: p.id,
      op:
        els.smCondOp.value === "neq" || els.smCondOp.value === "gt" || els.smCondOp.value === "gte" || els.smCondOp.value === "lt" || els.smCondOp.value === "lte"
          ? els.smCondOp.value
          : "eq",
      value: parseStateParamRawValue(els.smCondValue.value, p.type),
    };
    if (!Array.isArray(tr.conditions)) tr.conditions = [];
    tr.conditions.push(cond);
    sm.selectedConditionId = cond.id;
    refreshStateMachineUI();
    pushUndoCheckpoint(true);
  });
}
if (els.smCondList) {
  els.smCondList.addEventListener("change", () => {
    const sm = ensureStateMachine();
    sm.selectedConditionId = String(els.smCondList.value || "");
    refreshStateMachineUI();
  });
}
if (els.smCondDeleteBtn) {
  els.smCondDeleteBtn.addEventListener("click", () => {
    const sm = ensureStateMachine();
    const tr = getSelectedStateTransition();
    if (!tr || !sm.selectedConditionId) return;
    tr.conditions = (tr.conditions || []).filter((c) => c.id !== sm.selectedConditionId);
    sm.selectedConditionId = "";
    refreshStateMachineUI();
    pushUndoCheckpoint(true);
  });
}
if (els.smBridgeExportBtn) {
  els.smBridgeExportBtn.addEventListener("click", () => {
    exportStateMachineBridgeJson();
  });
}
if (els.smBridgeCodeBtn) {
  els.smBridgeCodeBtn.addEventListener("click", () => {
    exportStateMachineBridgeCode();
  });
}
if (els.smBridgeParamSelect) {
  els.smBridgeParamSelect.addEventListener("change", () => {
    refreshStateMachineUI();
  });
}
if (els.smBridgeSetBtn) {
  els.smBridgeSetBtn.addEventListener("click", () => {
    const sm = ensureStateMachine();
    const id = String(els.smBridgeParamSelect ? els.smBridgeParamSelect.value : "");
    const p = getStateParamById(sm, id);
    if (!p || !els.smBridgeParamValue) return;
    const ok = window.setAnimParam ? window.setAnimParam(p.name, els.smBridgeParamValue.value) : false;
    if (ok) {
      pushUndoCheckpoint(true);
      setStatus(`Bridge param applied: ${p.name}=${String(els.smBridgeParamValue.value)}`);
    }
  });
}
els.addKeyBtn.addEventListener("click", () => {
  if (!state.mesh) return;
  addAutoKeyframeFromDirty();
});
if (els.addSpecialKeyBtn) {
  els.addSpecialKeyBtn.addEventListener("click", () => {
    if (!state.mesh) return;
    const sel = els.addSpecialKeySelect.value;

    if (sel === "drawOrder") {
      setSelectedTimelineTrack(DRAWORDER_TRACK_ID);
      addOrUpdateKeyframeForTrack(DRAWORDER_TRACK_ID);
      return;
    }

    if (sel === "clipCombo") {
      if (typeof addOrUpdateClipBundleKeyForActiveSlot === "function") {
        addOrUpdateClipBundleKeyForActiveSlot();
      }
      return;
    }

    if (state.activeSlot < 0) return;
    // Map the dropdown values to the track types if necessary (the values match exactly)
    const trackId = getSlotTrackId(state.activeSlot, sel);
    setSelectedTimelineTrack(trackId);
    addOrUpdateKeyframeForTrack(trackId);
  });
}
if (els.loopMakeSeamBtn) {
  els.loopMakeSeamBtn.addEventListener("click", () => {
    if (!state.mesh) return;
    if (!applyLoopSeamOnSelectedTrack()) {
      setStatus("Loop Seam failed: select a keyed track first.");
    }
  });
}
if (els.loopPingPongBtn) {
  els.loopPingPongBtn.addEventListener("click", () => {
    if (!state.mesh) return;
    if (!applyLoopPingPongOnSelectedTrack()) {
      setStatus("Loop PingPong failed: need at least 2 keys on selected track.");
    }
  });
}
if (els.timelineLoopToolBtn) {
  els.timelineLoopToolBtn.addEventListener("click", () => {
    const action = els.timelineLoopToolSelect ? String(els.timelineLoopToolSelect.value || "seam") : "seam";
    if (action === "pingpong") {
      if (els.loopPingPongBtn) els.loopPingPongBtn.click();
      return;
    }
    if (els.loopMakeSeamBtn) els.loopMakeSeamBtn.click();
  });
}
if (els.drawOrderToggleBtn) {
  els.drawOrderToggleBtn.addEventListener("click", () => {
    state.anim.drawOrderEditorOpen = !state.anim.drawOrderEditorOpen;
    refreshDrawOrderUI();
  });
}
if (els.drawOrderList) {
  els.drawOrderList.addEventListener("change", () => {
    refreshDrawOrderEditorButtonState();
    const id = String(els.drawOrderList.value || "");
    if (!id) return;
    const idx = state.slots.findIndex((s) => s && s.id && String(s.id) === id);
    if (idx >= 0) {
      state.activeSlot = idx;
      refreshSlotUI();
      renderBoneTree();
    } else {
      refreshDrawOrderUI();
    }
  });
}
if (els.drawOrderUpBtn) {
  els.drawOrderUpBtn.addEventListener("click", () => {
    moveDrawOrderSelection(-1);
  });
}
if (els.drawOrderDownBtn) {
  els.drawOrderDownBtn.addEventListener("click", () => {
    moveDrawOrderSelection(1);
  });
}
if (els.drawOrderApplyBtn) {
  els.drawOrderApplyBtn.addEventListener("click", () => {
    applyDrawOrderFromUI(false);
  });
}
if (els.drawOrderApplyKeyBtn) {
  els.drawOrderApplyKeyBtn.addEventListener("click", () => {
    applyDrawOrderFromUI(true);
  });
}
els.deleteKeyBtn.addEventListener("click", () => {
  deleteSelectedOrCurrentKeyframe();
});
if (els.cutKeyBtn) {
  els.cutKeyBtn.addEventListener("click", () => {
    cutSelectedKeyframe();
  });
}
els.copyKeyBtn.addEventListener("click", () => {
  copySelectedKeyframe();
});
els.pasteKeyBtn.addEventListener("click", () => {
  pasteKeyframeAtCurrentTime();
});
if (els.timelineCtxCutBtn) {
  els.timelineCtxCutBtn.addEventListener("click", () => {
    cutSelectedKeyframe();
    closeTimelineKeyContextMenu();
  });
}
if (els.timelineCtxCopyBtn) {
  els.timelineCtxCopyBtn.addEventListener("click", () => {
    copySelectedKeyframe();
    closeTimelineKeyContextMenu();
  });
}
if (els.timelineCtxPasteBtn) {
  els.timelineCtxPasteBtn.addEventListener("click", () => {
    pasteKeyframeAtCurrentTime();
    closeTimelineKeyContextMenu();
  });
}
if (els.timelineCtxDeleteBtn) {
  els.timelineCtxDeleteBtn.addEventListener("click", () => {
    deleteSelectedOrCurrentKeyframe();
    closeTimelineKeyContextMenu();
  });
}
if (els.addEventBtn) {
  els.addEventBtn.addEventListener("click", () => {
    addOrUpdateEventAtCurrentTime();
  });
}
if (els.deleteEventBtn) {
  els.deleteEventBtn.addEventListener("click", () => {
    const anim = getCurrentAnimation();
    if (!anim) return;
    const keys = getTrackKeys(anim, EVENT_TRACK_ID);
    const t = state.anim.time;
    const before = keys.length;
    anim.tracks[EVENT_TRACK_ID] = keys.filter((k) => Math.abs((Number(k.time) || 0) - t) >= 1e-4);
    if (anim.tracks[EVENT_TRACK_ID].length === before) {
      setStatus("No event key at current time.");
      return;
    }
    clearTimelineKeySelection();
    renderTimelineTracks();
    setStatus("Event key deleted at current time.");
  });
}
if (els.eventKeyList) {
  els.eventKeyList.addEventListener("change", () => {
    const anim = getCurrentAnimation();
    if (!anim) return;
    const id = els.eventKeyList.value;
    const keys = getTrackKeys(anim, EVENT_TRACK_ID);
    const k = keys.find((it) => it.id === id);
    if (!k) return;
    setSingleTimelineSelection(EVENT_TRACK_ID, k.id);
    setAnimTime(Number(k.time) || 0);
    if (state.mesh) {
      samplePoseAtTime(state.mesh, state.anim.time);
      if (state.boneMode === "pose") updateBoneUI();
    }
    renderTimelineTracks();
  });
}
if (els.eventJumpBtn) {
  els.eventJumpBtn.addEventListener("click", () => {
    if (!els.eventKeyList || !els.eventKeyList.value) return;
    const anim = getCurrentAnimation();
    if (!anim) return;
    const id = els.eventKeyList.value;
    const k = getTrackKeys(anim, EVENT_TRACK_ID).find((it) => it.id === id);
    if (!k) return;
    setSingleTimelineSelection(EVENT_TRACK_ID, k.id);
    setAnimTime(Number(k.time) || 0);
    if (state.mesh) {
      samplePoseAtTime(state.mesh, state.anim.time);
      if (state.boneMode === "pose") updateBoneUI();
    }
    renderTimelineTracks();
  });
}
if (els.eventDeleteSelBtn) {
  els.eventDeleteSelBtn.addEventListener("click", () => {
    if (!deleteSelectedEventKey()) {
      setStatus("No selected event key.");
      return;
    }
    setStatus("Selected event key deleted.");
  });
}
if (els.eventName) els.eventName.addEventListener("input", updateSelectedEventKeyFromUI);
if (els.eventInt) els.eventInt.addEventListener("input", updateSelectedEventKeyFromUI);
if (els.eventFloat) els.eventFloat.addEventListener("input", updateSelectedEventKeyFromUI);
if (els.eventString) els.eventString.addEventListener("input", updateSelectedEventKeyFromUI);
els.animLoop.addEventListener("change", () => {
  state.anim.loop = !!els.animLoop.checked;
});
els.animSnap.addEventListener("change", () => {
  state.anim.snap = !!els.animSnap.checked;
});
els.animFps.addEventListener("input", () => {
  state.anim.fps = Math.max(1, Number(els.animFps.value) || 30);
  const anim = getCurrentAnimation();
  if (anim) {
    for (const trackId of Object.keys(anim.tracks || {})) {
      normalizeTrackKeys(anim, trackId);
    }
  }
  setAnimTime(state.anim.time);
  renderTimelineTracks();
});
if (els.animTimeStep) {
  els.animTimeStep.addEventListener("input", () => {
    const step = Math.max(TIMELINE_MIN_STEP, Number(els.animTimeStep.value) || TIMELINE_MIN_STEP);
    state.anim.timeStep = step;
    els.animTimeStep.value = String(step);
    const anim = getCurrentAnimation();
    if (anim) {
      for (const trackId of Object.keys(anim.tracks || {})) {
        normalizeTrackKeys(anim, trackId);
      }
    }
    setAnimTime(state.anim.time);
    renderTimelineTracks();
  });
}
function applyInterpolationToPickedKeys(valueOverride = null) {
  const anim = getCurrentAnimation();
  if (!anim) return 0;
  const value = valueOverride || els.keyInterp.value || "linear";
  const picked = state.anim.selectedKeys && state.anim.selectedKeys.length > 0 ? state.anim.selectedKeys : [state.anim.selectedKey].filter(Boolean);
  if (picked.length === 0) return 0;
  let changed = 0;
  for (const sk of picked) {
    const keys = getTrackKeys(anim, sk.trackId);
    const k = keys.find((x) => x.id === sk.keyId);
    if (!k) continue;
    if (k.interp === value && !(value === "bezier" && (!Array.isArray(k.curve) || k.curve.length < 4))) continue;
    k.interp = value;
    if (value === "bezier") ensureBezierCurveOnKey(k);
    else delete k.curve;
    changed += 1;
  }
  if (changed > 0) {
    renderTimelineTracks();
    pushUndoCheckpoint(true);
  }
  return changed;
}

els.keyInterp.addEventListener("change", () => {
  applyInterpolationToPickedKeys();
});
if (els.keyInterpApplySelectedBtn) {
  els.keyInterpApplySelectedBtn.addEventListener("click", () => {
    const n = applyInterpolationToPickedKeys();
    setStatus(n > 0 ? `Applied interpolation to ${n} key(s).` : "No selected keys to apply interpolation.");
  });
}

function beginAnimationMix(toAnimId, durationSec) {
  const from = getCurrentAnimation();
  const to = state.anim.animations.find((a) => a.id === toAnimId);
  if (!state.mesh || !from || !to || from.id === to.id) return false;
  const toRange = getAnimationActiveRange(to);
  state.anim.mix.active = true;
  state.anim.mix.fromAnimId = from.id;
  state.anim.mix.toAnimId = to.id;
  state.anim.mix.duration = Math.max(0.01, Number(durationSec) || 0.2);
  state.anim.mix.elapsed = 0;
  state.anim.mix.fromTime = state.anim.time;
  state.anim.mix.toTime = toRange.start;
  state.anim.currentAnimId = to.id;
  setAnimTime(toRange.start);
  state.anim.playing = true;
  state.anim.lastTs = 0;
  updatePlaybackButtons();
  refreshAnimationMixUI();
  setStatus(`Mix start: ${from.name} -> ${to.name} (${state.anim.mix.duration.toFixed(2)}s)`);
  return true;
}

function waitForFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function sleepMs(ms) {
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, Number(ms) || 0)));
}

function buildGif332Palette() {
  const out = new Uint8Array(256 * 3);
  let n = 0;
  for (let i = 0; i < 256; i += 1) {
    const r = (i >> 5) & 0x07;
    const g = (i >> 2) & 0x07;
    const b = i & 0x03;
    out[n++] = Math.round((r / 7) * 255);
    out[n++] = Math.round((g / 7) * 255);
    out[n++] = Math.round((b / 3) * 255);
  }
  return out;
}

function lzwEncode8(indices) {
  const minCodeSize = 8;
  const clearCode = 1 << minCodeSize;
  const endCode = clearCode + 1;
  let codeSize = minCodeSize + 1;
  let nextCode = endCode + 1;

  const dict = new Map();
  const resetDict = () => {
    dict.clear();
    for (let i = 0; i < clearCode; i += 1) dict.set(String(i), i);
    codeSize = minCodeSize + 1;
    nextCode = endCode + 1;
  };
  resetDict();

  const outBytes = [];
  let bitBuffer = 0;
  let bitCount = 0;
  const writeCode = (code) => {
    bitBuffer |= Number(code) << bitCount;
    bitCount += codeSize;
    while (bitCount >= 8) {
      outBytes.push(bitBuffer & 0xff);
      bitBuffer >>= 8;
      bitCount -= 8;
    }
  };

  writeCode(clearCode);
  let prefix = String(indices[0] || 0);
  for (let i = 1; i < indices.length; i += 1) {
    const k = Number(indices[i]) & 0xff;
    const pk = `${prefix},${k}`;
    if (dict.has(pk)) {
      prefix = pk;
      continue;
    }
    writeCode(dict.get(prefix));
    if (nextCode < 4096) {
      dict.set(pk, nextCode++);
      if (nextCode === 1 << codeSize && codeSize < 12) codeSize += 1;
    } else {
      writeCode(clearCode);
      resetDict();
    }
    prefix = String(k);
  }
  writeCode(dict.get(prefix));
  writeCode(endCode);
  if (bitCount > 0) outBytes.push(bitBuffer & 0xff);
  return new Uint8Array(outBytes);
}

function encodeGifFrames(frames, width, height, fps = 15) {
  const bytes = [];
  const pushByte = (b) => bytes.push(b & 0xff);
  const pushWord = (w) => {
    pushByte(w & 0xff);
    pushByte((w >> 8) & 0xff);
  };
  const pushString = (s) => {
    for (let i = 0; i < s.length; i += 1) pushByte(s.charCodeAt(i));
  };

  const palette = buildGif332Palette();
  pushString("GIF89a");
  pushWord(width);
  pushWord(height);
  pushByte(0xf7);
  pushByte(0);
  pushByte(0);
  for (let i = 0; i < palette.length; i += 1) pushByte(palette[i]);

  pushByte(0x21);
  pushByte(0xff);
  pushByte(0x0b);
  pushString("NETSCAPE2.0");
  pushByte(0x03);
  pushByte(0x01);
  pushWord(0);
  pushByte(0x00);

  const delay = Math.max(1, Math.round(100 / Math.max(1, fps)));

  for (const frame of frames) {
    const rgba = frame.data;
    const idx = new Uint8Array(width * height);
    let p = 0;
    for (let i = 0; i < rgba.length; i += 4) {
      const r = rgba[i] >> 5;
      const g = rgba[i + 1] >> 5;
      const b = rgba[i + 2] >> 6;
      idx[p++] = (r << 5) | (g << 2) | b;
    }

    pushByte(0x21);
    pushByte(0xf9);
    pushByte(0x04);
    pushByte(0x04);
    pushWord(delay);
    pushByte(0x00);
    pushByte(0x00);

    pushByte(0x2c);
    pushWord(0);
    pushWord(0);
    pushWord(width);
    pushWord(height);
    pushByte(0x00);

    pushByte(0x08);
    const lzw = lzwEncode8(idx);
    let off = 0;
    while (off < lzw.length) {
      const n = Math.min(255, lzw.length - off);
      pushByte(n);
      for (let i = 0; i < n; i += 1) pushByte(lzw[off + i]);
      off += n;
    }
    pushByte(0x00);
  }

  pushByte(0x3b);
  return new Blob([new Uint8Array(bytes)], { type: "image/gif" });
}

const crc32Table = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let j = 0; j < 8; j += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32OfBytes(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    c = crc32Table[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

async function buildZipBlobFromNamedBlobs(items) {
  const files = [];
  for (const it of items) {
    if (!it || !it.blob || !it.name) continue;
    const data = new Uint8Array(await it.blob.arrayBuffer());
    const nameBytes = new TextEncoder().encode(String(it.name));
    files.push({ name: String(it.name), data, nameBytes, crc32: crc32OfBytes(data) });
  }
  const chunks = [];
  const central = [];
  let offset = 0;
  const pushU16 = (arr, v) => {
    arr.push(v & 0xff, (v >>> 8) & 0xff);
  };
  const pushU32 = (arr, v) => {
    arr.push(v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff);
  };
  for (const f of files) {
    const local = [];
    pushU32(local, 0x04034b50);
    pushU16(local, 20);
    pushU16(local, 0);
    pushU16(local, 0);
    pushU16(local, 0);
    pushU16(local, 0);
    pushU32(local, f.crc32 >>> 0);
    pushU32(local, f.data.length >>> 0);
    pushU32(local, f.data.length >>> 0);
    pushU16(local, f.nameBytes.length);
    pushU16(local, 0);
    local.push(...f.nameBytes);
    chunks.push(new Uint8Array(local), f.data);

    const cent = [];
    pushU32(cent, 0x02014b50);
    pushU16(cent, 20);
    pushU16(cent, 20);
    pushU16(cent, 0);
    pushU16(cent, 0);
    pushU16(cent, 0);
    pushU16(cent, 0);
    pushU32(cent, f.crc32 >>> 0);
    pushU32(cent, f.data.length >>> 0);
    pushU32(cent, f.data.length >>> 0);
    pushU16(cent, f.nameBytes.length);
    pushU16(cent, 0);
    pushU16(cent, 0);
    pushU16(cent, 0);
    pushU16(cent, 0);
    pushU32(cent, 0);
    pushU32(cent, offset >>> 0);
    cent.push(...f.nameBytes);
    central.push(new Uint8Array(cent));

    offset += local.length + f.data.length;
  }
  let centralSize = 0;
  for (const c of central) centralSize += c.length;
  const end = [];
  pushU32(end, 0x06054b50);
  pushU16(end, 0);
  pushU16(end, 0);
  pushU16(end, files.length);
  pushU16(end, files.length);
  pushU32(end, centralSize >>> 0);
  pushU32(end, offset >>> 0);
  pushU16(end, 0);
  return new Blob([...chunks, ...central, new Uint8Array(end)], { type: "application/zip" });
}

function syncBatchExportSettingsFromUI() {
  if (!state.anim.batchExport || typeof state.anim.batchExport !== "object") {
    state.anim.batchExport = { format: "webm", fps: 15, prefix: "batch", retries: 1, delayMs: 120, zipPng: true };
  }
  const be = state.anim.batchExport;
  be.format = els.batchExportFormat && (els.batchExportFormat.value === "gif" || els.batchExportFormat.value === "pngseq") ? els.batchExportFormat.value : "webm";
  be.fps = Math.max(1, Math.min(60, Math.round(Number(els.batchExportFps && els.batchExportFps.value) || 15)));
  be.prefix = String((els.batchExportPrefix && els.batchExportPrefix.value) || "batch");
  be.retries = Math.max(0, Math.min(5, Math.round(Number(els.batchExportRetries && els.batchExportRetries.value) || 1)));
  be.delayMs = Math.max(0, Math.min(5000, Math.round(Number(els.batchExportDelayMs && els.batchExportDelayMs.value) || 120)));
  be.zipPng = els.batchExportZipPng ? !!els.batchExportZipPng.checked : true;
  if (els.batchExportFps) els.batchExportFps.value = String(be.fps);
  if (els.batchExportRetries) els.batchExportRetries.value = String(be.retries);
  if (els.batchExportDelayMs) els.batchExportDelayMs.value = String(be.delayMs);
}

async function exportPreviewWebM() {
  if (!window.MediaRecorder || !els.glCanvas || !els.glCanvas.captureStream) {
    setStatus("Preview WebM failed: MediaRecorder/captureStream not supported.");
    return;
  }
  const curr = getCurrentAnimation();
  if (!curr) {
    setStatus("Preview WebM failed: no animation selected.");
    return;
  }
  const fps = Math.max(1, Number(state.anim.fps) || 30);
  const dur = Math.max(0.1, Number(curr.duration) || 1);
  const asked = window.prompt("Preview export filename (without extension)", `${curr.name || "preview"}_preview`);
  const base = sanitizeExportName(asked, "preview");

  const prevPlaying = state.anim.playing;
  const prevTime = state.anim.time;
  const stream = els.glCanvas.captureStream(fps);
  const chunks = [];
  const rec = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9" });
  rec.ondataavailable = (ev) => {
    if (ev.data && ev.data.size > 0) chunks.push(ev.data);
  };

  rec.start();
  setAnimTime(0);
  state.anim.playing = true;
  state.anim.lastTs = 0;
  await sleepMs(Math.ceil(dur * 1000) + 120);
  state.anim.playing = false;
  rec.stop();
  await new Promise((resolve) => (rec.onstop = resolve));

  const blob = new Blob(chunks, { type: "video/webm" });
  downloadBlobFile(blob, `${base}.webm`);
  state.anim.playing = prevPlaying;
  setAnimTime(prevTime);
  if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time);
  setStatus(`Preview exported: ${base}.webm`);
}

async function exportPreviewGif() {
  const curr = getCurrentAnimation();
  if (!curr || !els.glCanvas) {
    setStatus("Preview GIF failed: no animation selected.");
    return;
  }
  const fps = Math.max(8, Math.min(20, Number(state.anim.fps) || 15));
  const dur = Math.max(0.1, Number(curr.duration) || 1);
  const frameCount = Math.max(2, Math.round(dur * fps));
  const asked = window.prompt("Preview export filename (without extension)", `${curr.name || "preview"}_preview`);
  const base = sanitizeExportName(asked, "preview");

  const prevPlaying = state.anim.playing;
  const prevTime = state.anim.time;
  state.anim.playing = false;
  state.anim.lastTs = 0;

  const w = Math.max(1, Number(els.glCanvas.width) || 1);
  const h = Math.max(1, Number(els.glCanvas.height) || 1);
  const capture = makeCanvas(w, h);
  const cctx = capture.getContext("2d");
  if (!cctx) throw new Error("Preview GIF failed: offscreen 2D context unavailable.");

  const frames = [];
  for (let i = 0; i < frameCount; i += 1) {
    const t = (i / Math.max(1, frameCount - 1)) * dur;
    setAnimTime(t);
    if (state.mesh) samplePoseAtTime(state.mesh, t);
    await waitForFrame();
    cctx.clearRect(0, 0, w, h);
    cctx.drawImage(els.glCanvas, 0, 0, w, h);
    frames.push(cctx.getImageData(0, 0, w, h));
  }

  const gif = encodeGifFrames(frames, w, h, fps);
  downloadBlobFile(gif, `${base}.gif`);
  state.anim.playing = prevPlaying;
  setAnimTime(prevTime);
  if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time);
  setStatus(`Preview exported: ${base}.gif`);
}

function getBatchSelectedAnimations() {
  const out = [];
  if (els.batchExportAnimList) {
    const ids = new Set(Array.from(els.batchExportAnimList.selectedOptions || []).map((o) => String(o.value)));
    for (const a of state.anim.animations || []) {
      if (ids.has(String(a.id))) out.push(a);
    }
  }
  if (out.length === 0) {
    const curr = getCurrentAnimation();
    if (curr) out.push(curr);
  }
  return out;
}

async function runBatchExportForAnimation(anim, index, total, format, fps, prefix, options = null) {
  if (!anim) return;
  const opts = options && typeof options === "object" ? options : {};
  const retries = Math.max(0, Math.min(5, Math.round(Number(opts.retries) || 0)));
  const delayMs = Math.max(0, Math.min(5000, Math.round(Number(opts.delayMs) || 0)));
  const zipPng = !!opts.zipPng;
  const prevAnimId = state.anim.currentAnimId;
  const prevPlaying = state.anim.playing;
  const prevTime = state.anim.time;
  const prevLastTs = state.anim.lastTs;
  const safePrefix = sanitizeExportName(prefix, "batch");
  const safeAnim = sanitizeExportName(anim.name || "anim", `anim_${index + 1}`);
  const fileBase = `${safePrefix}_${String(index + 1).padStart(2, "0")}_${safeAnim}`;
  const dur = Math.max(0.1, Number(anim.duration) || 0.1);

  state.anim.playing = false;
  state.anim.lastTs = 0;
  state.anim.currentAnimId = anim.id;
  refreshAnimationUI();
  setAnimTime(0);
  if (state.mesh) samplePoseAtTime(state.mesh, 0);
  await waitForFrame();

  try {
    const exportOnce = async () => {
      if (format === "webm") {
        if (!window.MediaRecorder || !els.glCanvas || !els.glCanvas.captureStream) {
          throw new Error("MediaRecorder/captureStream not supported.");
        }
        const stream = els.glCanvas.captureStream(fps);
        const chunks = [];
        const rec = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9" });
        rec.ondataavailable = (ev) => {
          if (ev.data && ev.data.size > 0) chunks.push(ev.data);
        };
        rec.start();
        state.anim.playing = true;
        state.anim.lastTs = 0;
        await sleepMs(Math.ceil(dur * 1000) + 120);
        state.anim.playing = false;
        rec.stop();
        await new Promise((resolve) => (rec.onstop = resolve));
        downloadBlobFile(new Blob(chunks, { type: "video/webm" }), `${fileBase}.webm`);
      } else if (format === "gif") {
        if (!els.glCanvas) throw new Error("canvas unavailable.");
        const frameCount = Math.max(2, Math.round(dur * fps));
        const w = Math.max(1, Number(els.glCanvas.width) || 1);
        const h = Math.max(1, Number(els.glCanvas.height) || 1);
        const capture = makeCanvas(w, h);
        const cctx = capture.getContext("2d");
        if (!cctx) throw new Error("offscreen 2D context unavailable.");
        const frames = [];
        for (let i = 0; i < frameCount; i += 1) {
          const t = (i / Math.max(1, frameCount - 1)) * dur;
          setAnimTime(t);
          if (state.mesh) samplePoseAtTime(state.mesh, t);
          await waitForFrame();
          cctx.clearRect(0, 0, w, h);
          cctx.drawImage(els.glCanvas, 0, 0, w, h);
          frames.push(cctx.getImageData(0, 0, w, h));
        }
        const gif = encodeGifFrames(frames, w, h, fps);
        downloadBlobFile(gif, `${fileBase}.gif`);
      } else {
        if (!els.glCanvas) throw new Error("canvas unavailable.");
        const frameCount = Math.max(2, Math.round(dur * fps));
        const w = Math.max(1, Number(els.glCanvas.width) || 1);
        const h = Math.max(1, Number(els.glCanvas.height) || 1);
        const capture = makeCanvas(w, h);
        const cctx = capture.getContext("2d");
        if (!cctx) throw new Error("offscreen 2D context unavailable.");
        const pngItems = [];
        for (let i = 0; i < frameCount; i += 1) {
          const t = (i / Math.max(1, frameCount - 1)) * dur;
          setAnimTime(t);
          if (state.mesh) samplePoseAtTime(state.mesh, t);
          await waitForFrame();
          cctx.clearRect(0, 0, w, h);
          cctx.drawImage(els.glCanvas, 0, 0, w, h);
          const blob = await canvasToBlob(capture, "image/png");
          const name = `${fileBase}_${String(i + 1).padStart(4, "0")}.png`;
          if (zipPng) pngItems.push({ name, blob });
          else downloadBlobFile(blob, name);
          await sleepMs(0);
        }
        if (zipPng) {
          const zip = await buildZipBlobFromNamedBlobs(pngItems);
          downloadBlobFile(zip, `${fileBase}.zip`);
        }
      }
    };

    let attempt = 0;
    while (true) {
      try {
        await exportOnce();
        break;
      } catch (err) {
        if (attempt >= retries) throw err;
        attempt += 1;
        setStatus(`Batch ${index + 1}/${total} retry ${attempt}/${retries}...`);
        state.anim.playing = false;
        await sleepMs(200);
      }
    }
    setStatus(`Batch ${index + 1}/${total}: ${anim.name}`);
    if (delayMs > 0) await sleepMs(delayMs);
  } finally {
    state.anim.currentAnimId = prevAnimId;
    state.anim.playing = prevPlaying;
    state.anim.lastTs = prevLastTs;
    refreshAnimationUI();
    setAnimTime(prevTime);
    if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time);
  }
}

async function runBatchExport() {
  syncBatchExportSettingsFromUI();
  const list = getBatchSelectedAnimations();
  if (list.length <= 0) {
    setStatus("Batch export: no animation selected.");
    return;
  }
  const be = state.anim.batchExport || {};
  const format = be.format === "gif" || be.format === "pngseq" ? be.format : "webm";
  const fps = Math.max(1, Math.min(60, Math.round(Number(be.fps) || state.anim.fps || 15)));
  const prefix = String(be.prefix || "batch");
  const retries = Math.max(0, Math.min(5, Math.round(Number(be.retries) || 0)));
  const delayMs = Math.max(0, Math.min(5000, Math.round(Number(be.delayMs) || 0)));
  const zipPng = be.zipPng !== false;
  if (els.batchExportRunBtn) els.batchExportRunBtn.disabled = true;
  let done = 0;
  let failed = 0;
  try {
    for (let i = 0; i < list.length; i += 1) {
      try {
        await runBatchExportForAnimation(list[i], i, list.length, format, fps, prefix, {
          retries,
          delayMs,
          zipPng,
        });
        done += 1;
      } catch (err) {
        failed += 1;
        setStatus(`Batch ${i + 1}/${list.length} failed: ${err && err.message ? err.message : "unknown error"}`);
      }
    }
    setStatus(`Batch export done: ${done} ok, ${failed} failed, format ${format}.`);
  } catch (err) {
    setStatus(`Batch export failed: ${err && err.message ? err.message : "unknown error"}`);
  } finally {
    if (els.batchExportRunBtn) els.batchExportRunBtn.disabled = false;
  }
}

if (els.animMixDur) {
  els.animMixDur.addEventListener("input", () => {
    state.anim.mix.duration = Math.max(0.01, Number(els.animMixDur.value) || 0.2);
    els.animMixDur.value = String(state.anim.mix.duration);
    refreshAnimationMixUI();
  });
}
if (els.animMixBtn) {
  els.animMixBtn.addEventListener("click", () => {
    const toId = els.animMixTo ? els.animMixTo.value : "";
    const dur = els.animMixDur ? Number(els.animMixDur.value) : 0.2;
    if (!beginAnimationMix(toId, dur)) {
      setStatus("Mix failed: choose another animation as target.");
    }
  });
}

function applyOnionSkinInputs(commitUndo = false) {
  const onion = ensureOnionSkinSettings();
  if (els.onionEnabled) onion.enabled = !!els.onionEnabled.checked;
  if (els.onionPrev) onion.prevFrames = math.clamp(Math.round(Number(els.onionPrev.value) || 0), 0, 12);
  if (els.onionNext) onion.nextFrames = math.clamp(Math.round(Number(els.onionNext.value) || 0), 0, 12);
  if (els.onionAlpha) onion.alpha = math.clamp(Number(els.onionAlpha.value) || 0.22, 0.01, 1);
  if (els.onionPrev) els.onionPrev.value = String(onion.prevFrames);
  if (els.onionNext) els.onionNext.value = String(onion.nextFrames);
  if (els.onionAlpha) els.onionAlpha.value = String(onion.alpha);
  if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time);
  if (commitUndo) pushUndoCheckpoint(true);
}

if (els.onionEnabled) {
  els.onionEnabled.addEventListener("change", () => {
    applyOnionSkinInputs(true);
  });
}
if (els.onionPrev) {
  els.onionPrev.addEventListener("input", () => {
    applyOnionSkinInputs(false);
  });
  els.onionPrev.addEventListener("change", () => {
    applyOnionSkinInputs(true);
  });
}
if (els.onionNext) {
  els.onionNext.addEventListener("input", () => {
    applyOnionSkinInputs(false);
  });
  els.onionNext.addEventListener("change", () => {
    applyOnionSkinInputs(true);
  });
}
if (els.onionAlpha) {
  els.onionAlpha.addEventListener("input", () => {
    applyOnionSkinInputs(false);
  });
  els.onionAlpha.addEventListener("change", () => {
    applyOnionSkinInputs(true);
  });
}

if (els.layerTrackSelect) {
  els.layerTrackSelect.addEventListener("change", () => {
    state.anim.selectedLayerTrackId = String(els.layerTrackSelect.value || "");
    if (state.anim.selectedLayerTrackId) focusTimelineTrack(getLayerTrackId(state.anim.selectedLayerTrackId, "alpha"), true);
    refreshAnimationLayerUI();
    refreshTrackSelect();
    if (state.mesh) {
      samplePoseAtTime(state.mesh, state.anim.time);
      if (state.boneMode === "pose") updateBoneUI();
    }
  });
}
if (els.layerTrackAddBtn) {
  els.layerTrackAddBtn.addEventListener("click", () => {
    const layer = addAnimationLayerTrack();
    focusTimelineTrack(getLayerTrackId(layer.id, "alpha"), true);
    refreshTrackSelect();
    setStatus(`Layer added: ${layer.name}`);
    if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time);
  });
}
if (els.layerTrackDeleteBtn) {
  els.layerTrackDeleteBtn.addEventListener("click", () => {
    if (!removeSelectedAnimationLayerTrack()) return;
    setStatus("Layer removed.");
    if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time);
  });
}
if (els.layerTrackEnabled) {
  els.layerTrackEnabled.addEventListener("change", () => {
    const layer = getSelectedLayerTrack();
    if (!layer) return;
    layer.enabled = !!els.layerTrackEnabled.checked;
    markDirtyByLayerProp(layer.id, "enabled");
    if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time, { applyLayerStateTracks: false });
  });
}
if (els.layerTrackLoop) {
  els.layerTrackLoop.addEventListener("change", () => {
    const layer = getSelectedLayerTrack();
    if (!layer) return;
    layer.loop = !!els.layerTrackLoop.checked;
    if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time);
  });
}
if (els.layerTrackSpeed) {
  els.layerTrackSpeed.addEventListener("input", () => {
    const layer = getSelectedLayerTrack();
    if (!layer) return;
    const v = Number(els.layerTrackSpeed.value);
    layer.speed = Number.isFinite(v) ? math.clamp(v, -10, 10) : 1;
    if (Math.abs(layer.speed) < 1e-4) layer.speed = 0;
    els.layerTrackSpeed.value = String(layer.speed);
    markDirtyByLayerProp(layer.id, "speed");
    if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time, { applyLayerStateTracks: false });
  });
}
if (els.layerTrackOffset) {
  els.layerTrackOffset.addEventListener("input", () => {
    const layer = getSelectedLayerTrack();
    if (!layer) return;
    const v = Number(els.layerTrackOffset.value);
    layer.offset = Number.isFinite(v) ? math.clamp(v, -9999, 9999) : 0;
    els.layerTrackOffset.value = String(layer.offset);
    markDirtyByLayerProp(layer.id, "offset");
    if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time, { applyLayerStateTracks: false });
  });
}
if (els.layerTrackAnim) {
  els.layerTrackAnim.addEventListener("change", () => {
    const layer = getSelectedLayerTrack();
    if (!layer) return;
    layer.animId = String(els.layerTrackAnim.value || "");
    if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time);
  });
}
if (els.layerTrackAlpha) {
  els.layerTrackAlpha.addEventListener("input", () => {
    const layer = getSelectedLayerTrack();
    if (!layer) return;
    layer.alpha = math.clamp(Number(els.layerTrackAlpha.value) || 0, 0, 1);
    els.layerTrackAlpha.value = String(layer.alpha);
    markDirtyByLayerProp(layer.id, "alpha");
    if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time, { applyLayerStateTracks: false });
  });
}
if (els.layerTrackMode) {
  els.layerTrackMode.addEventListener("change", () => {
    const layer = getSelectedLayerTrack();
    if (!layer) return;
    layer.mode = els.layerTrackMode.value === "add" ? "add" : "replace";
    if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time);
  });
}
if (els.layerTrackMaskMode) {
  els.layerTrackMaskMode.addEventListener("change", () => {
    const layer = getSelectedLayerTrack();
    if (!layer) return;
    layer.maskMode = els.layerTrackMaskMode.value === "include" ? "include" : els.layerTrackMaskMode.value === "exclude" ? "exclude" : "all";
    refreshAnimationLayerUI();
    if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time);
  });
}
if (els.layerTrackBoneAddBtn) {
  els.layerTrackBoneAddBtn.addEventListener("click", () => {
    const layer = getSelectedLayerTrack();
    if (!layer) return;
    const bi = Number(els.layerTrackBone ? els.layerTrackBone.value : -1);
    if (!Number.isFinite(bi) || bi < 0) return;
    if (!Array.isArray(layer.maskBones)) layer.maskBones = [];
    if (!layer.maskBones.includes(bi)) layer.maskBones.push(bi);
    refreshAnimationLayerUI();
    if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time);
  });
}
if (els.layerTrackBoneClearBtn) {
  els.layerTrackBoneClearBtn.addEventListener("click", () => {
    const layer = getSelectedLayerTrack();
    if (!layer) return;
    layer.maskBones = [];
    refreshAnimationLayerUI();
    if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time);
  });
}
if (els.curveToggleBtn) {
  els.curveToggleBtn.addEventListener("click", () => {
    state.anim.curveOpen = !state.anim.curveOpen;
    renderCurveEditor();
  });
}

if (els.curveEditor) {
  const cv = els.curveEditor;
  const fromScreen = (ev) => {
    const r = cv.getBoundingClientRect();
    const sx = (ev.clientX - r.left) * (cv.width / Math.max(1, r.width));
    const sy = (ev.clientY - r.top) * (cv.height / Math.max(1, r.height));
    const pad = 16;
    const x = math.clamp((sx - pad) / Math.max(1, cv.width - pad * 2), 0, 1);
    const y = math.clamp(1 - (sy - pad) / Math.max(1, cv.height - pad * 2), 0, 1);
    return { x, y };
  };
  const hitHandle = (ev) => {
    const t = getCurveEditTarget();
    if (!t || (t.key.interp || "linear") !== "bezier") return null;
    ensureBezierCurveOnKey(t.key);
    const r = cv.getBoundingClientRect();
    const sx = (ev.clientX - r.left) * (cv.width / Math.max(1, r.width));
    const sy = (ev.clientY - r.top) * (cv.height / Math.max(1, r.height));
    const pad = 16;
    const gw = cv.width - pad * 2;
    const gh = cv.height - pad * 2;
    const p1 = { x: pad + t.key.curve[0] * gw, y: pad + (1 - t.key.curve[1]) * gh };
    const p2 = { x: pad + t.key.curve[2] * gw, y: pad + (1 - t.key.curve[3]) * gh };
    const d1 = (sx - p1.x) * (sx - p1.x) + (sy - p1.y) * (sy - p1.y);
    const d2 = (sx - p2.x) * (sx - p2.x) + (sy - p2.y) * (sy - p2.y);
    if (d1 <= 64) return "c1";
    if (d2 <= 64) return "c2";
    return null;
  };
  cv.addEventListener("pointerdown", (ev) => {
    const t = getCurveEditTarget();
    if (!t) return;
    if ((t.key.interp || "linear") !== "bezier") {
      t.key.interp = "bezier";
      ensureBezierCurveOnKey(t.key);
      if (els.keyInterp) els.keyInterp.value = "bezier";
      renderTimelineTracks();
    }
    const handle = hitHandle(ev) || "c2";
    state.anim.curveDrag = { handle, trackId: t.trackId, keyId: t.key.id, pointerId: ev.pointerId };
    try {
      cv.setPointerCapture(ev.pointerId);
    } catch {
      // ignore
    }
    ev.preventDefault();
  });
  cv.addEventListener("pointermove", (ev) => {
    const drag = state.anim.curveDrag;
    if (!drag) return;
    const t = getCurveEditTarget();
    if (!t || t.trackId !== drag.trackId || t.key.id !== drag.keyId) return;
    ensureBezierCurveOnKey(t.key);
    const p = fromScreen(ev);
    if (drag.handle === "c1") {
      t.key.curve[0] = p.x;
      t.key.curve[1] = p.y;
    } else {
      t.key.curve[2] = p.x;
      t.key.curve[3] = p.y;
    }
    t.key.curve[0] = math.clamp(t.key.curve[0], 0, 1);
    t.key.curve[1] = math.clamp(t.key.curve[1], 0, 1);
    t.key.curve[2] = math.clamp(t.key.curve[2], 0, 1);
    t.key.curve[3] = math.clamp(t.key.curve[3], 0, 1);
    if (state.mesh) {
      samplePoseAtTime(state.mesh, state.anim.time);
      if (state.boneMode === "pose") updateBoneUI();
    }
    renderCurveEditor();
    ev.preventDefault();
  });
  const stopCurveDrag = (ev) => {
    if (!state.anim.curveDrag) return;
    try {
      cv.releasePointerCapture(ev.pointerId);
    } catch {
      // ignore
    }
    state.anim.curveDrag = null;
    renderTimelineTracks();
  };
  cv.addEventListener("pointerup", stopCurveDrag);
  cv.addEventListener("pointercancel", stopCurveDrag);
}
