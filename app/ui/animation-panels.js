// ROLE: Animation panel UI — anim list controls (add/dup/del/reorder),
// onion skin / event dialog wiring, layer mixer track UI.
// EXPORTS:
//   - reorderCurrentAnimation
//   - applyInterpolationToPickedKeys, beginAnimationMix
//   - waitForFrame, sleepMs (shared async helpers)
// EVENT WIRING: timeline toolbar (#playBtn, #stopBtn, #animActionBtn,
//   #animTime, #animDuration), event dialog, onion-skin popover,
//   state-machine bridge.
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
    if (action === "moveUp" || action === "moveDown") {
      reorderCurrentAnimation(action === "moveUp" ? -1 : 1);
      return;
    }
    if (els.addAnimBtn) els.addAnimBtn.click();
  });
}

// Reorders the current animation up/down in state.anim.animations.
// Animation order is the order shown in the dropdown and (when iterated)
// any "next animation" semantics; reordering doesn't affect track data.
function reorderCurrentAnimation(delta) {
  const list = state.anim.animations;
  if (!Array.isArray(list) || list.length < 2) return;
  const i = list.findIndex((a) => a && a.id === state.anim.currentAnimId);
  const j = i + delta;
  if (i < 0 || j < 0 || j >= list.length) return;
  const tmp = list[i];
  list[i] = list[j];
  list[j] = tmp;
  refreshAnimationUI();
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
  if (els.onionKeyFramesOnly) onion.keyFramesOnly = !!els.onionKeyFramesOnly.checked;
  if (els.onionPxPerFrameX) onion.pxPerFrameX = Number(els.onionPxPerFrameX.value) || 0;
  if (els.onionPxPerFrameY) onion.pxPerFrameY = Number(els.onionPxPerFrameY.value) || 0;
  if (els.onionPrev) els.onionPrev.value = String(onion.prevFrames);
  if (els.onionNext) els.onionNext.value = String(onion.nextFrames);
  if (els.onionAlpha) els.onionAlpha.value = String(onion.alpha);
  if (els.onionPxPerFrameX) els.onionPxPerFrameX.value = String(onion.pxPerFrameX);
  if (els.onionPxPerFrameY) els.onionPxPerFrameY.value = String(onion.pxPerFrameY);
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
if (els.onionKeyFramesOnly) {
  els.onionKeyFramesOnly.addEventListener("change", () => applyOnionSkinInputs(true));
}
if (els.onionPxPerFrameX) {
  els.onionPxPerFrameX.addEventListener("input", () => applyOnionSkinInputs(false));
  els.onionPxPerFrameX.addEventListener("change", () => applyOnionSkinInputs(true));
}
if (els.onionPxPerFrameY) {
  els.onionPxPerFrameY.addEventListener("input", () => applyOnionSkinInputs(false));
  els.onionPxPerFrameY.addEventListener("change", () => applyOnionSkinInputs(true));
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
