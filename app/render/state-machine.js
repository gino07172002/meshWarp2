// ROLE: State machine bridge — export the editor's state-machine
// graph as JSON + sample wrapper code for runtime integration. Also
// houses transition condition evaluation used during animation playback.
// EXPORTS:
//   - exportStateMachineBridgeJson, exportStateMachineBridgeCode
//   - installStateMachineBridgeApi
//   - evaluateStateTransitionCondition, transitionIsTriggered
//   - ensureStateMachine, getCurrentStateMachineState
// EVENT WIRING: #smBridgeExportBtn, #smParam* / #smCond* in state dock.
// SECTION: State Machine Export
// Builds JSON + sample bridge code for runtime integration.
// ============================================================
function exportStateMachineBridgeJson() {
  const payload = buildStateMachineBridgePayload();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const name = "stateMachineBridge.json";
  downloadBlobFile(blob, name);
  setStatus(`Bridge exported: ${name}`);
}

function exportStateMachineBridgeCode() {
  const payload = buildStateMachineBridgePayload();
  const names = payload.stateMachine.parameters.map((p) => p.name);
  const jsSample = `// Web runtime sample
// Available params: ${names.join(", ") || "(none)"}
window.setAnimParam("speed", 1.0);
window.setAnimParam("isExcited", true);
`;
  const unitySample = `// Unity C# sample (conceptual bridge)
// Available params: ${names.join(", ") || "(none)"}
public void SetParam(string name, object value) {
    // Call into your WebView / bridge binding:
    // webView.EvaluateJS($\"window.setAnimParam('{name}', {value});\");
}
`;
  const content = `# State Machine Bridge Samples\n\n## JavaScript\n\`\`\`js\n${jsSample}\`\`\`\n\n## Unity (C#)\n\`\`\`csharp\n${unitySample}\`\`\`\n`;
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const name = "stateMachineBridgeSamples.txt";
  downloadBlobFile(blob, name);
  setStatus(`Bridge code exported: ${name}`);
}

function installStateMachineBridgeApi() {
  const api = {
    setAnimParam: (name, value) => {
      const ok = setStateMachineParamValue(name, value, { refresh: true, sample: true });
      if (!ok) {
        setStatus(`Bridge setAnimParam failed: "${String(name || "")}" not found.`);
        return false;
      }
      return true;
    },
    getAnimParam: (name) => {
      const sm = ensureStateMachine();
      const p = getStateParamByName(sm, name);
      if (!p) return null;
      return p.type === "bool" ? (p.value === true) : (Number(p.value) || 0);
    },
    listAnimParams: () => {
      const sm = ensureStateMachine();
      return (sm.parameters || []).map((p) => ({
        id: String(p.id || ""),
        name: String(p.name || ""),
        type: p.type === "bool" ? "bool" : "float",
        defaultValue: p.defaultValue,
        value: p.value,
      }));
    },
  };
  window.setAnimParam = api.setAnimParam;
  window.getAnimParam = api.getAnimParam;
  window.listAnimParams = api.listAnimParams;
  window.animBridge = api;
}

function evaluateStateTransitionCondition(cond, sm) {
  if (!cond || !sm) return false;
  const param = getStateParamById(sm, cond.paramId);
  if (!param) return false;
  const op = String(cond.op || "eq");
  const left = param.type === "bool" ? (param.value === true) : (Number(param.value) || 0);
  const right = parseStateParamRawValue(cond.value, param.type);
  if (param.type === "bool") {
    if (op === "neq") return left !== right;
    return left === right;
  }
  if (op === "gt") return left > right;
  if (op === "gte") return left >= right;
  if (op === "lt") return left < right;
  if (op === "lte") return left <= right;
  if (op === "neq") return left !== right;
  return left === right;
}

function transitionIsTriggered(tr, sm, playbackInfo = null) {
  if (!tr || !sm) return false;
  const conditions = Array.isArray(tr.conditions) ? tr.conditions : [];
  const byCondition = conditions.length > 0 && conditions.every((c) => evaluateStateTransitionCondition(c, sm));
  const info = playbackInfo && typeof playbackInfo === "object" ? playbackInfo : {};
  const byAuto = tr.auto === true && (info.looped === true || info.reachedEnd === true);
  return byCondition || byAuto;
}

function ensureStateMachine() {
  const sm = state.anim.stateMachine || {};
  if (!Array.isArray(sm.states)) sm.states = [];
  if (!Array.isArray(sm.parameters)) sm.parameters = [];
  const validAnimIds = new Set((state.anim.animations || []).map((a) => String(a.id)));
  const validParamIds = new Set();
  sm.parameters = sm.parameters
    .map((p, i) => {
      const type = p && p.type === "bool" ? "bool" : "float";
      const id = p && p.id ? String(p.id) : makeStateParamId();
      const defaultValue = parseStateParamRawValue(p && p.defaultValue, type);
      const value = parseStateParamRawValue(
        p && Object.prototype.hasOwnProperty.call(p, "value") ? p.value : defaultValue,
        type
      );
      validParamIds.add(id);
      return {
        id,
        name: p && p.name ? String(p.name) : `Param ${i + 1}`,
        type,
        defaultValue,
        value,
      };
    })
    .filter((p) => !!p.id);
  sm.states = sm.states
    .map((s, i) => ({
      id: s && s.id ? String(s.id) : makeStateId(),
      name: s && s.name ? String(s.name) : `State ${i + 1}`,
      animId: s && validAnimIds.has(String(s.animId || "")) ? String(s.animId) : "",
      transitions: Array.isArray(s && s.transitions)
        ? s.transitions
          .map((t) => ({
            id: t && t.id ? String(t.id) : makeStateTransitionId(),
            toStateId: t && t.toStateId ? String(t.toStateId) : "",
            duration: Math.max(0.01, Number(t && t.duration) || 0.2),
            auto: !!(t && t.auto),
            conditions: Array.isArray(t && t.conditions)
              ? t.conditions
                .map((c) => ({
                  id: c && c.id ? String(c.id) : makeStateConditionId(),
                  paramId: c && c.paramId ? String(c.paramId) : "",
                  op:
                    c && (c.op === "eq" || c.op === "neq" || c.op === "gt" || c.op === "gte" || c.op === "lt" || c.op === "lte")
                      ? c.op
                      : "eq",
                  value: c && Object.prototype.hasOwnProperty.call(c, "value") ? c.value : 0,
                }))
                .filter((c) => validParamIds.has(c.paramId))
              : [],
          }))
          .filter((t) => !!t.toStateId)
        : [],
    }))
    .filter((s) => !!s.id);

  if (sm.states.length === 0) {
    const current = getCurrentAnimation() || (state.anim.animations && state.anim.animations[0]) || null;
    sm.states.push({
      id: makeStateId(),
      name: "State 1",
      animId: current ? String(current.id) : "",
      transitions: [],
    });
  }

  if (!sm.currentStateId || !sm.states.some((s) => s.id === sm.currentStateId)) {
    sm.currentStateId = sm.states[0].id;
  }
  if (!sm.selectedParamId || !sm.parameters.some((p) => p.id === sm.selectedParamId)) {
    sm.selectedParamId = sm.parameters[0] ? sm.parameters[0].id : "";
  }
  if (!sm.selectedTransitionId) sm.selectedTransitionId = "";
  if (!sm.selectedConditionId) sm.selectedConditionId = "";
  sm.enabled = sm.enabled !== false;
  sm.pendingDuration = Math.max(0.01, Number(sm.pendingDuration) || 0.2);
  if (!sm.pendingStateId || !sm.states.some((s) => s.id === sm.pendingStateId)) sm.pendingStateId = "";
  state.anim.stateMachine = sm;
  return sm;
}

function getCurrentStateMachineState() {
  const sm = ensureStateMachine();
  return sm.states.find((s) => s.id === sm.currentStateId) || sm.states[0] || null;
}

function getSelectedStateTransition() {
  const sm = ensureStateMachine();
  const st = getCurrentStateMachineState();
  if (!st || !Array.isArray(st.transitions)) return null;
  return st.transitions.find((t) => t.id === sm.selectedTransitionId) || null;
}

function transitionToState(stateId, durationSec = 0.2, fromState = null) {
  const sm = ensureStateMachine();
  const toState = sm.states.find((s) => s.id === stateId);
  if (!toState) return false;
  const prev = fromState || getCurrentStateMachineState();
  sm.currentStateId = toState.id;
  sm.pendingStateId = toState.id;
  sm.pendingDuration = Math.max(0.01, Number(durationSec) || 0.2);
  if (toState.animId && toState.animId !== state.anim.currentAnimId) {
    if (!beginAnimationMix(toState.animId, sm.pendingDuration)) {
      state.anim.currentAnimId = toState.animId;
      setAnimTime(0);
      if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time);
      refreshAnimationUI();
    }
  } else {
    setAnimTime(0);
    if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time);
    refreshAnimationUI();
  }
  setStatus(`State: ${(prev && prev.name) || "(none)"} -> ${toState.name}`);
  return true;
}

function tryRunAutoOrConditionalTransition(playbackInfo = null) {
  const sm = ensureStateMachine();
  if (!sm.enabled) return false;
  const from = getCurrentStateMachineState();
  if (!from || !Array.isArray(from.transitions) || from.transitions.length <= 0) return false;
  const tr = from.transitions.find((row) => transitionIsTriggered(row, sm, playbackInfo));
  if (!tr) return false;
  return transitionToState(tr.toStateId, tr.duration, from);
}

function captureUndoSnapshot() {
  return JSON.stringify(buildProjectPayload());
}

async function loadProjectFromJsonText(jsonText, suspendHistory = false) {
  const text = String(jsonText || "{}");
  const fakeInput = {
    value: "",
    files: [
      {
        text: async () => text,
      },
    ],
  };
  const prevSuspend = state.history.suspend;
  state.history.suspend = suspendHistory ? true : prevSuspend;
  try {
    await handleProjectLoadInputChange({ target: fakeInput });
  } finally {
    state.history.suspend = prevSuspend;
  }
}

async function restoreUndoSnapshot(text) {
  await loadProjectFromJsonText(text, true);
}

function getAutosaveEnvelope() {
  try {
    const raw = localStorage.getItem(AUTOSAVE_STORAGE_KEY);
    if (!raw) return null;
    const env = JSON.parse(raw);
    if (!env || typeof env !== "object") return null;
    if (!env.project || typeof env.project !== "object") return null;
    return env;
  } catch {
    return null;
  }
}

function clearAutosaveSnapshot() {
  try {
    localStorage.removeItem(AUTOSAVE_STORAGE_KEY);
  } catch {
    // ignore
  }
}

