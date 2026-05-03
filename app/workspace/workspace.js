// ROLE: Workspace switcher (Slot/Rig/Object/Animate × edit modes),
// slot lifecycle (addSlotEntry, normalizeSlotCanvas, slot CRUD),
// attachment state normalization, skin set normalization
// (ensureSkinSets), legacy attachment upgrade.
// EXPORTS:
//   - applyWorkspace, setupWorkspaceTabs, setupAnimateSubTabs,
//     mountAnimateAuxPanelsInLeftTools
//   - getCurrentWsType, getCurrentWsMode, setActiveSlot
//   - addSlotEntry, normalizeSlotCanvas
//   - ensureSkinSets, addSkinSetFromCurrentState, duplicateSkinSet,
//     captureSelectedSkinSetFromCurrentState, applySkinSetToSlots
//   - ensureSlotAttachments, ensureSlotAttachmentState,
//     ensureSlotClipState, getSlotClipPointsLocal
//   - syncSourceCanvasToActiveAttachment
// ============================================================
// SECTION: Workspace Switcher — Type × Mode
// Type buttons (Rig / Mesh / Object) and Mode select (Edit / Animate)
// are orthogonal: switching one does not reset the other.
//
// State mapping:
//   Rig   + Edit    → setup, skeleton, boneMode=edit,   page=rig
//   Rig   + Animate → animate, skeleton, boneMode=pose, page=anim
//   Mesh  + Edit    → setup, mesh,     page=slot
//   Mesh  + Animate → animate, mesh,   page=anim
//   Object+ Edit    → setup, skeleton, boneMode=object, page=object
//   Object+ Animate → animate, skeleton, boneMode=object, page=anim
// ============================================================

/** Derive the current "type" from state (rig / mesh / object). */
function getCurrentWsType() {
  if (state.editMode === "mesh") return "mesh";
  if (state.boneMode === "object") return "object";
  return "rig";
}

/** Derive the current "mode" from state (edit / animate). */
function getCurrentWsMode() {
  const sysMode = els.systemMode ? els.systemMode.value : "setup";
  return sysMode === "animate" ? "animate" : "edit";
}

const ATTACHMENT_TYPES = Object.freeze({
  REGION: "region",
  MESH: "mesh",
  LINKED_MESH: "linkedmesh",
  BOUNDING_BOX: "boundingbox",
  CLIPPING: "clipping",
  POINT: "point",
});

/**
 * Apply a (type, mode) combination.
 * type: "rig" | "mesh" | "object"
 * mode: "edit" | "animate"
 */
function applyWorkspace(type, mode) {
  // Silently update hidden selects so getCurrentSystemMode() etc. work correctly.
  if (els.systemMode) els.systemMode.value = mode === "animate" ? "animate" : "setup";
  if (els.editMode)   els.editMode.value   = type === "mesh" ? "mesh" : "skeleton";

  if (mode === "edit") {
    if (type === "rig") {
      setWorkspacePage("rig");
    } else if (type === "mesh") {
      state.editMode = "mesh";
      state.workspaceMode = "slotmesh";
      setWorkspacePage("slot");
    } else { // object
      if (!state.mesh) { setStatus("匯入專案後才能使用 Object workspace。"); return; }
      setWorkspacePage("object");
    }
  } else { // animate
    // For all types, page=anim; boneMode differs
    if (type === "mesh") {
      state.editMode = "mesh";
      state.workspaceMode = "slotmesh";
    } else {
      state.editMode = "skeleton";
      state.workspaceMode = "rig";
    }
    // boneMode: object stays object; rig→pose
    if (type !== "object") {
      const prevMode = state.boneMode;
      state.boneMode = "pose";
      applyBoneModeTransition(prevMode, state.boneMode);
    }
    setWorkspacePage("anim");
  }
}

function setupWorkspaceTabs() {
  // Type buttons
  if (els.workspaceTabRig) {
    els.workspaceTabRig.addEventListener("click", () => applyWorkspace("rig", getCurrentWsMode()));
  }
  if (els.workspaceTabSlot) {
    els.workspaceTabSlot.addEventListener("click", () => applyWorkspace("mesh", getCurrentWsMode()));
  }
  if (els.workspaceTabObject) {
    els.workspaceTabObject.addEventListener("click", () => applyWorkspace("object", getCurrentWsMode()));
  }

  // Self-healing fallback for the "disabled tab swallows click" failure mode:
  // disabled <button> elements still receive pointerdown/pointerup but never
  // dispatch 'click'. If the user lands a pointerup on a workspace tab whose
  // disabled flag is stale (state actually permits the switch), refresh the UI
  // and synthesize the workspace change instead of silently doing nothing.
  const wsTabFallback = (btn, type) => {
    if (!btn) return;
    btn.addEventListener("pointerup", (ev) => {
      if (ev.button !== 0) return;
      if (!btn.disabled) return;
      if (!state.mesh) {
        setStatus("匯入專案後才能使用 Object workspace。");
        return;
      }
      // disabled flag is stale (state.mesh exists). Resync and apply.
      updateWorkspaceUI();
      if (!btn.disabled) applyWorkspace(type, getCurrentWsMode());
    });
  };
  wsTabFallback(els.workspaceTabSlot, "mesh");
  wsTabFallback(els.workspaceTabObject, "object");

  // Mode dropdown
  if (els.wsModeSelect) {
    els.wsModeSelect.addEventListener("change", () => {
      applyWorkspace(getCurrentWsType(), els.wsModeSelect.value);
    });
  }
}

function setupAnimateSubTabs() {
  const bind = (el, panel) => {
    if (!el) return;
    el.addEventListener("click", () => {
      setWorkspacePage("anim");
      state.animSubPanel = panel;
      updateWorkspaceUI();
      renderTimelineTracks();
      if ((panel === "layers" || panel === "state") && els.leftTools) {
        const scrollHost = els.leftTools.querySelector(".dock-panel-body") || els.leftTools;
        scrollHost.scrollTop = 0;
      }
    });
  };
  bind(els.animSubTabTimeline, "timeline");
  bind(els.animSubTabLayers, "layers");
  bind(els.animSubTabState, "state");
  if (els.openExportPanelBtn) {
    els.openExportPanelBtn.addEventListener("click", () => {
      setWorkspacePage("anim");
      state.animSubPanel = "timeline";
      state.exportPanelOpen = !state.exportPanelOpen;
      updateWorkspaceUI();
    });
  }
}

function mountAnimateAuxPanelsInLeftTools() {
  if (!els.leftTools) return;
  const host = els.leftTools.querySelector(".dock-panel-body") || els.leftTools;
  const anchor = host.querySelector("#leftToolTabs") || host.querySelector("#leftMeshSetup") || null;
  if (els.stateDock && els.stateDock.parentElement !== host) {
    if (anchor) host.insertBefore(els.stateDock, anchor);
    else host.appendChild(els.stateDock);
  }
  if (els.layerDock && els.layerDock.parentElement !== host) {
    if (anchor) host.insertBefore(els.layerDock, anchor);
    else host.appendChild(els.layerDock);
  }
}

function setActiveSlot(index, options = null) {
  if (!Number.isFinite(index) || index < 0 || index >= state.slots.length) return;
  const opts = options && typeof options === "object" ? options : {};
  state.activeSlot = index;
  const slot = state.slots[index];
  if (opts.syncBindSelection !== false) syncBindSelectionToSingleSlot(index);
  setRightPropsFocus("slot");
  ensureSlotContour(slot);
  state.slotMesh.activePoint = -1;
  state.slotMesh.edgeSelection = [];
  clearSlotMeshSelection();
  setSlotMeshEditTarget("boundary", false);
  setSlotMeshToolMode("select", false);
  syncSourceCanvasToActiveAttachment(slot);
  refreshSlotUI();
  renderBoneTree();
}

function syncSourceCanvasToActiveAttachment(slot = null) {
  const targetSlot = slot || getActiveSlot();
  const slotAtt = targetSlot ? getActiveAttachment(targetSlot) : null;
  state.sourceCanvas = slotAtt ? slotAtt.canvas || null : null;
  if (targetSlot) {
    state.imageWidth = Number.isFinite(targetSlot.docWidth)
      ? targetSlot.docWidth
      : slotAtt && slotAtt.canvas
        ? slotAtt.canvas.width
        : state.imageWidth;
    state.imageHeight = Number.isFinite(targetSlot.docHeight)
      ? targetSlot.docHeight
      : slotAtt && slotAtt.canvas
        ? slotAtt.canvas.height
        : state.imageHeight;
  }
  if (state.sourceCanvas) updateTexture();
}

function clearActiveSlotSelection(options = null) {
  const opts = options && typeof options === "object" ? options : {};
  const clearTargets = opts.clearTargets !== false;
  state.activeSlot = -1;
  if (clearTargets) {
    state.boneTreeSelectedSlotByBone = Object.create(null);
    state.boneTreeSelectedUnassignedSlotIds = [];
  }
  state.treeSlotLastClickIndex = -1;
  state.treeSlotLastClickTs = 0;
  state.slotMesh.activePoint = -1;
  state.slotMesh.edgeSelection = [];
  clearSlotMeshSelection();
  setSlotMeshEditTarget("boundary", false);
  if (opts.clearSourceCanvas) state.sourceCanvas = null;
  if (state.selectedBone >= 0) setRightPropsFocus("bone");
  refreshSlotUI();
  renderBoneTree();
}

function addSlotEntry(entry, activate = true) {
  const entryCanvas =
    entry && entry.canvas
      ? entry.canvas
      : entry && Array.isArray(entry.attachments)
        ? ((entry.attachments.find((a) => a && a.canvas) || {}).canvas || null)
        : null;
  if (!entryCanvas) return;
  const hasProjectSize = state.imageWidth > 0 && state.imageHeight > 0;
  const docW = Number.isFinite(entry.docWidth) ? entry.docWidth : entryCanvas.width;
  const docH = Number.isFinite(entry.docHeight) ? entry.docHeight : entryCanvas.height;
  const targetW = hasProjectSize ? state.imageWidth : docW;
  const targetH = hasProjectSize ? state.imageHeight : docH;
  const sx = docW > 0 ? targetW / docW : 1;
  const sy = docH > 0 ? targetH / docH : 1;
  const srcRect = entry.rect || { x: 0, y: 0, w: docW, h: docH };
  const rect = {
    x: srcRect.x * sx,
    y: srcRect.y * sy,
    w: Math.max(1, srcRect.w * sx),
    h: Math.max(1, srcRect.h * sy),
  };
  const canvas = normalizeSlotCanvas(entryCanvas, Math.max(1, rect.w), Math.max(1, rect.h));
  const defaultAttachmentType =
    entry && entry.defaultAttachmentType ? normalizeAttachmentType(entry.defaultAttachmentType) : ATTACHMENT_TYPES.REGION;
  const defaultBone = -1;
  const slot = {
    id: entry.id || makeSlotId(),
    name: entry.name || `slot_${state.slots.length}`,
    attachmentName: String(entry.attachmentName || "main"),
    placeholderName: String(entry.placeholderName || entry.attachmentName || "main"),
    activeAttachment:
      entry && Object.prototype.hasOwnProperty.call(entry, "activeAttachment")
        ? entry.activeAttachment == null
          ? null
          : String(entry.activeAttachment)
        : String(entry.attachmentName || "main"),
    editorVisible:
      entry && Object.prototype.hasOwnProperty.call(entry, "editorVisible") ? entry.editorVisible !== false : entry.visible !== false,
    bone: Number.isFinite(entry.bone) ? entry.bone : defaultBone,
    visible: entry.visible !== false,
    alpha: Number.isFinite(entry.alpha) ? math.clamp(entry.alpha, 0, 1) : 1,
    r: Number.isFinite(entry.r) ? math.clamp(entry.r, 0, 1) : 1,
    g: Number.isFinite(entry.g) ? math.clamp(entry.g, 0, 1) : 1,
    b: Number.isFinite(entry.b) ? math.clamp(entry.b, 0, 1) : 1,
    blend: normalizeSlotBlendMode(entry && entry.blend),
    darkEnabled: !!(entry && entry.darkEnabled),
    dr: Number.isFinite(entry && entry.dr) ? math.clamp(entry.dr, 0, 1) : 0,
    dg: Number.isFinite(entry && entry.dg) ? math.clamp(entry.dg, 0, 1) : 0,
    db: Number.isFinite(entry && entry.db) ? math.clamp(entry.db, 0, 1) : 0,
    tx: Number.isFinite(entry.tx) ? entry.tx : 0,
    ty: Number.isFinite(entry.ty) ? entry.ty : 0,
    rot: Number.isFinite(entry.rot) ? entry.rot : 0,
    baseImageTransform: normalizeBaseImageTransform(entry && entry.baseImageTransform),
    rect,
    docWidth: targetW,
    docHeight: targetH,
    __legacyAttachmentState:
      entry &&
      (
        entry.meshData ||
        entry.meshContour ||
        Object.prototype.hasOwnProperty.call(entry, "useWeights") ||
        entry.weightBindMode ||
        entry.weightMode ||
        (Array.isArray(entry.influenceBones) && entry.influenceBones.length > 0) ||
        Object.prototype.hasOwnProperty.call(entry, "clipEnabled") ||
        entry.clipSource ||
        Object.prototype.hasOwnProperty.call(entry, "clipEndSlotId")
      )
        ? {
          meshData: entry.meshData ? cloneSlotMeshData(entry.meshData) : null,
          meshContour: entry.meshContour ? cloneSlotContourData(entry.meshContour) : null,
          useWeights: entry.useWeights === true,
          weightBindMode: entry.weightBindMode ? String(entry.weightBindMode) : "none",
          weightMode: entry.weightMode ? String(entry.weightMode) : "free",
          influenceBones: Array.isArray(entry.influenceBones) ? entry.influenceBones.filter((v) => Number.isFinite(v)) : [],
          clipEnabled: !!entry.clipEnabled,
          clipSource: entry && entry.clipSource === "contour" ? "contour" : "fill",
          clipEndSlotId:
            entry && Object.prototype.hasOwnProperty.call(entry, "clipEndSlotId")
              ? entry.clipEndSlotId == null
                ? null
                : String(entry.clipEndSlotId)
              : null,
        }
        : null,
    attachments: Array.isArray(entry.attachments)
      ? entry.attachments
        .map((a) => ({
          name: String(a && a.name ? a.name : "").trim(),
          placeholder: String(a && a.placeholder ? a.placeholder : entry.placeholderName || entry.attachmentName || "main").trim(),
          // Distinguish:
          //  - a.canvas explicitly null  -> caller is signalling "this visual
          //    attachment exists but its image failed to load"; keep null so
          //    renderers skip it and the user sees it's broken.
          //  - a.canvas undefined        -> not specified (import flow
          //    constructing fresh attachments); fall back to slot canvas.
          canvas:
            a && a.canvas ? normalizeSlotCanvas(a.canvas, Math.max(1, rect.w), Math.max(1, rect.h))
              : (a && Object.prototype.hasOwnProperty.call(a, "canvas") && a.canvas === null) ? null
                : canvas,
          type: normalizeAttachmentType(a && a.type),
          linkedParent: a && a.linkedParent != null ? String(a.linkedParent) : "",
          inheritTimelines: !!(a && a.inheritTimelines),
          pointX: Number(a && a.pointX) || 0,
          pointY: Number(a && a.pointY) || 0,
          pointRot: Number(a && a.pointRot) || 0,
          bboxSource: a && a.bboxSource === "contour" ? "contour" : "fill",
          sequence:
            a && a.sequence
              ? {
                enabled: !!a.sequence.enabled,
                count: Math.max(1, Math.round(Number(a.sequence.count) || 1)),
                start: Math.max(0, Math.round(Number(a.sequence.start) || 0)),
                digits: Math.max(1, Math.round(Number(a.sequence.digits) || 2)),
              }
              : { enabled: false, count: 1, start: 0, digits: 2 },
          useWeights: a && a.useWeights === true,
          weightBindMode: a && a.weightBindMode ? String(a.weightBindMode) : "none",
          weightMode: a && a.weightMode ? String(a.weightMode) : "free",
          influenceBones: Array.isArray(a && a.influenceBones) ? a.influenceBones.filter((v) => Number.isFinite(v)) : [],
          clipEnabled: !!(a && a.clipEnabled),
          clipSource: a && a.clipSource === "contour" ? "contour" : "fill",
          clipEndSlotId:
            a && Object.prototype.hasOwnProperty.call(a, "clipEndSlotId")
              ? a.clipEndSlotId == null
                ? null
                : String(a.clipEndSlotId)
              : null,
          rect: a && a.rect && Number.isFinite(a.rect.w) && Number.isFinite(a.rect.h)
            ? {
              x: Number(a.rect.x) || 0,
              y: Number(a.rect.y) || 0,
              w: Math.max(1, Number(a.rect.w) || 1),
              h: Math.max(1, Number(a.rect.h) || 1),
            }
            : null,
          baseImageTransform: normalizeBaseImageTransform(a && a.baseImageTransform),
          meshData: a && a.meshData ? cloneSlotMeshData(a.meshData) : null,
          meshContour: a && a.meshContour ? JSON.parse(JSON.stringify(a.meshContour)) : null,
        }))
        // Keep visual-but-canvas:null entries -- they represent attachments
        // whose source image failed to decode. Renderers skip drawing them
        // (hasRenderableAttachment); UI can show them as broken/empty.
        .filter((a) => a.name.length > 0)
      : [
        {
          name: String(entry.attachmentName || "main"),
          placeholder: String(entry.placeholderName || entry.attachmentName || "main"),
          canvas,
          type: defaultAttachmentType,
          linkedParent: "",
          pointX: 0,
          pointY: 0,
          pointRot: 0,
          bboxSource: "fill",
          sequence: { enabled: false, count: 1, start: 0, digits: 2 },
          useWeights: entry && entry.useWeights === true,
          weightBindMode: entry && entry.weightBindMode ? String(entry.weightBindMode) : "none",
          weightMode: entry && entry.weightMode ? String(entry.weightMode) : "free",
          influenceBones: Array.isArray(entry && entry.influenceBones) ? entry.influenceBones.filter((v) => Number.isFinite(v)) : [],
        },
      ],
  };
  ensureSlotAttachments(slot);
  ensureSlotAttachmentState(slot);
  if (state.mesh) {
    const activeAtt = getActiveAttachment(slot);
    if (activeAtt && !activeAtt.meshData) {
      activeAtt.meshData = createSlotMeshData(rect, targetW, targetH, state.mesh.cols, state.mesh.rows);
    }
    rebuildSlotWeights(slot, state.mesh);
  }
  ensureSlotClipState(slot);
  ensureSlotVisualState(slot);
  state.slots.push(slot);
  rebuildSlotTriangleIndices();
  if (activate) setActiveSlot(state.slots.length - 1);
}

function buildEmptySlotEntryForQuickAdd() {
  const source = getActiveSlot();
  const projectW = Math.max(
    1,
    Math.round(
      Number(state.imageWidth) ||
      Number(source && source.docWidth) ||
      Number(getSlotCanvas(source) && getSlotCanvas(source).width) ||
      512
    )
  );
  const projectH = Math.max(
    1,
    Math.round(
      Number(state.imageHeight) ||
      Number(source && source.docHeight) ||
      Number(getSlotCanvas(source) && getSlotCanvas(source).height) ||
      512
    )
  );
  const rectW = Math.max(
    1,
    Math.round(Number(source && source.rect && source.rect.w) || Math.min(256, projectW))
  );
  const rectH = Math.max(
    1,
    Math.round(Number(source && source.rect && source.rect.h) || Math.min(256, projectH))
  );
  const rectXBase = Number(source && source.rect && source.rect.x) || 0;
  const rectYBase = Number(source && source.rect && source.rect.y) || 0;
  const bindBone = -1;
  const canvas = makeCanvas(rectW, rectH);
  const placeholder = "main";
  const baseName = source && source.name ? `${source.name}_slot` : "slot";
  return {
    name: makeUniqueSlotName(baseName),
    canvas,
    docWidth: projectW,
    docHeight: projectH,
    rect: {
      x: rectXBase + 8,
      y: rectYBase + 8,
      w: rectW,
      h: rectH,
    },
    attachmentName: "main",
    placeholderName: placeholder,
    activeAttachment: "main",
    editorVisible: true,
    visible: true,
    bone: bindBone,
    alpha: 1,
    r: 1,
    g: 1,
    b: 1,
    blend: "normal",
    darkEnabled: false,
    dr: 0,
    dg: 0,
    db: 0,
    tx: Number(source && source.tx) || 0,
    ty: Number(source && source.ty) || 0,
    rot: Number(source && source.rot) || 0,
    useWeights: true,
    weightBindMode: "single",
    weightMode: "single",
    influenceBones: [],
    clipEnabled: false,
    clipSource: "fill",
    clipEndSlotId: null,
    attachments: [
      {
        name: "main",
        placeholder,
        canvas,
        type: "region",
        linkedParent: "",
        pointX: 0,
        pointY: 0,
        pointRot: 0,
        bboxSource: "fill",
        sequence: { enabled: false, count: 1, start: 0, digits: 2 },
      },
    ],
  };
}

function addEmptySlotQuick() {
  if (!state.mesh && state.slots.length === 0 && !state.sourceCanvas) return null;
  const entry = buildEmptySlotEntryForQuickAdd();
  addSlotEntry(entry, true);
  if (state.mesh) ensureSlotsHaveBoneBinding();
  refreshAnimationUI();
  return getActiveSlot();
}

function cloneCanvasLike(src) {
  if (!src) return null;
  const out = makeCanvas(src.width, src.height);
  const ctx = out.getContext("2d");
  if (ctx) ctx.drawImage(src, 0, 0);
  return out;
}

function cloneSlotContourData(src) {
  const c = src && typeof src === "object" ? src : {};
  const clonePoints = (arr) =>
    Array.isArray(arr) ? arr.map((p) => ({ x: Number(p && p.x) || 0, y: Number(p && p.y) || 0 })) : [];
  const cloneEdges = (arr) =>
    Array.isArray(arr)
      ? arr
        .filter((e) => Array.isArray(e) && e.length >= 2)
        .map((e) => [Number(e[0]) || 0, Number(e[1]) || 0])
      : [];
  return {
    points: clonePoints(c.points),
    sourcePoints: clonePoints(c.sourcePoints),
    authorContourPoints: clonePoints(c.authorContourPoints),
    closed: !!c.closed,
    triangles: Array.isArray(c.triangles) ? c.triangles.map((v) => Number(v) || 0) : [],
    fillPoints: clonePoints(c.fillPoints),
    fillTriangles: Array.isArray(c.fillTriangles) ? c.fillTriangles.map((v) => Number(v) || 0) : [],
    manualEdges: cloneEdges(c.manualEdges),
    fillManualEdges: cloneEdges(c.fillManualEdges),
  };
}

function cloneSlotMeshData(src) {
  if (!src || typeof src !== "object") return null;
  return {
    cols: Number(src.cols) || 0,
    rows: Number(src.rows) || 0,
    positions: src.positions ? new Float32Array(src.positions) : new Float32Array(0),
    uvs: src.uvs ? new Float32Array(src.uvs) : new Float32Array(0),
    offsets: src.offsets ? new Float32Array(src.offsets) : new Float32Array(0),
    baseOffsets: src.baseOffsets ? new Float32Array(src.baseOffsets) : src.offsets ? new Float32Array(src.offsets) : new Float32Array(0),
    weights: src.weights ? new Float32Array(src.weights) : new Float32Array(0),
    indices: src.indices ? new Uint16Array(src.indices) : new Uint16Array(0),
    deformedScreen: null,
    interleaved: null,
  };
}

function serializeSlotMeshData(src) {
  if (!src || typeof src !== "object") return null;
  return {
    cols: Number(src.cols) || 0,
    rows: Number(src.rows) || 0,
    positions: src.positions ? Array.from(src.positions, (v) => Number(v) || 0) : [],
    uvs: src.uvs ? Array.from(src.uvs, (v) => Number(v) || 0) : [],
    offsets: src.offsets ? Array.from(src.offsets, (v) => Number(v) || 0) : [],
    baseOffsets: src.baseOffsets ? Array.from(src.baseOffsets, (v) => Number(v) || 0) : [],
    weights: src.weights ? Array.from(src.weights, (v) => Number(v) || 0) : [],
    indices: src.indices ? Array.from(src.indices, (v) => Number(v) || 0) : [],
  };
}

function restoreSlotMeshDataFromPayload(src, boneCount = 0) {
  const meshData = cloneSlotMeshData(src);
  if (!meshData) return null;
  const vCount = Math.floor((Number(meshData.positions.length) || 0) / 2);
  if (vCount <= 0 || meshData.positions.length !== vCount * 2) return null;
  if (!meshData.uvs || meshData.uvs.length !== vCount * 2) meshData.uvs = new Float32Array(vCount * 2);
  if (!meshData.offsets || meshData.offsets.length !== vCount * 2) meshData.offsets = new Float32Array(vCount * 2);
  if (!meshData.baseOffsets || meshData.baseOffsets.length !== vCount * 2) {
    meshData.baseOffsets = new Float32Array(meshData.offsets.length === vCount * 2 ? meshData.offsets : new Float32Array(vCount * 2));
  }
  const expectedWeights = boneCount > 0 ? vCount * boneCount : 0;
  if (!meshData.weights || (expectedWeights > 0 ? meshData.weights.length !== expectedWeights : meshData.weights.length > 0)) {
    meshData.weights = new Float32Array(0);
  }
  if (!meshData.indices) meshData.indices = new Uint16Array(0);
  meshData.deformedLocal = new Float32Array(vCount * 2);
  meshData.deformedScreen = new Float32Array(vCount * 2);
  meshData.interleaved = new Float32Array(vCount * 4);
  return meshData;
}

function isCanonicalAttachmentWeightMode(mode) {
  return mode === "single" || mode === "weighted" || mode === "free";
}

function clearLegacySlotMeshState(slot) {
  if (!slot || typeof slot !== "object") return;
  delete slot.__legacyAttachmentState;
}

function promoteLegacySlotMeshState(slot, options = {}) {
  if (!slot || typeof slot !== "object") return null;
  const att = getActiveAttachment(slot);
  if (!att) return null;
  const legacy = getLegacySlotAttachmentState(slot);
  if (!legacy) return att;
  const overwriteAttachment = !!(options && options.overwriteAttachment);
  const clearLegacy = options && Object.prototype.hasOwnProperty.call(options, "clearLegacy")
    ? options.clearLegacy !== false
    : true;
  const legacyMode = isCanonicalAttachmentWeightMode(legacy.weightMode) ? String(legacy.weightMode) : null;
  const legacyInfluences = Array.isArray(legacy.influenceBones)
    ? legacy.influenceBones.filter((v) => Number.isFinite(v)).map((v) => Number(v))
    : [];
  if (legacy.meshData && (overwriteAttachment || !att.meshData)) {
    att.meshData = cloneSlotMeshData(legacy.meshData);
  }
  if (
    legacy.meshContour &&
    Array.isArray(legacy.meshContour.points) &&
    (overwriteAttachment || !(att.meshContour && Array.isArray(att.meshContour.points) && att.meshContour.points.length > 0))
  ) {
    att.meshContour = cloneSlotContourData(legacy.meshContour);
  }
  if (overwriteAttachment || att.useWeights == null) {
    if (Object.prototype.hasOwnProperty.call(legacy, "useWeights")) att.useWeights = legacy.useWeights === true;
    else if (legacyMode) att.useWeights = legacyMode !== "free";
  }
  if (overwriteAttachment || !att.weightBindMode) {
    att.weightBindMode =
      legacy.weightBindMode ||
      (legacyMode === "weighted" ? "auto" : legacyMode === "single" ? "single" : legacyMode === "free" ? "none" : "none");
  }
  if (overwriteAttachment || !isCanonicalAttachmentWeightMode(att.weightMode)) {
    if (legacyMode) att.weightMode = legacyMode;
  }
  if (legacyInfluences.length > 0 && (overwriteAttachment || !Array.isArray(att.influenceBones) || att.influenceBones.length <= 0)) {
    att.influenceBones = legacyInfluences.slice();
  }
  if (clearLegacy) clearLegacySlotMeshState(slot);
  return att;
}

function duplicateActiveSlotQuick() {
  const source = getActiveSlot();
  if (!source) return null;
  const sourceWeightMode = getSlotWeightMode(source);
  const sourceAtt = getActiveAttachment(source);
  ensureSlotAttachmentState(source);
  const sourceCanvas = getSlotCanvas(source);
  const rect = source.rect || { x: 0, y: 0, w: sourceCanvas ? sourceCanvas.width : 1, h: sourceCanvas ? sourceCanvas.height : 1 };
  const canvasMap = new Map();
  const getClonedCanvas = (cv) => {
    if (!cv) return null;
    if (canvasMap.has(cv)) return canvasMap.get(cv);
    const copied = cloneCanvasLike(cv);
    canvasMap.set(cv, copied);
    return copied;
  };
  const sourceCanvasClone = getClonedCanvas(sourceCanvas) || makeCanvas(Math.max(1, Number(rect.w) || 1), Math.max(1, Number(rect.h) || 1));
  const entry = {
    name: makeUniqueSlotName(`${source.name || "slot"}_copy`),
    attachmentName: String(source.attachmentName || "main"),
    placeholderName: String(source.placeholderName || source.attachmentName || "main"),
    activeAttachment:
      Object.prototype.hasOwnProperty.call(source, "activeAttachment")
        ? source.activeAttachment == null
          ? null
          : String(source.activeAttachment)
        : String(source.attachmentName || "main"),
    editorVisible: isSlotEditorVisible(source),
    bone: sourceWeightMode === "weighted" ? Number(source.bone) : -1,
    visible: source.visible !== false,
    alpha: Number(source.alpha),
    r: Number(source.r),
    g: Number(source.g),
    b: Number(source.b),
    blend: normalizeSlotBlendMode(source.blend),
    darkEnabled: !!source.darkEnabled,
    dr: Number(source.dr),
    dg: Number(source.dg),
    db: Number(source.db),
    tx: Number(source.tx) || 0,
    ty: Number(source.ty) || 0,
    rot: Number(source.rot) || 0,
    rect: {
      x: Number(rect.x) || 0,
      y: Number(rect.y) || 0,
      w: Math.max(1, Number(rect.w) || 1),
      h: Math.max(1, Number(rect.h) || 1),
    },
    docWidth: Number(source.docWidth) || Math.max(1, Number(state.imageWidth) || sourceCanvasClone.width),
    docHeight: Number(source.docHeight) || Math.max(1, Number(state.imageHeight) || sourceCanvasClone.height),
    useWeights: !!(sourceAtt && sourceAtt.useWeights),
    weightBindMode: sourceAtt && sourceAtt.weightBindMode ? String(sourceAtt.weightBindMode) : sourceWeightMode === "weighted" ? "auto" : sourceWeightMode === "single" ? "single" : "none",
    weightMode: sourceAtt && sourceAtt.weightMode ? String(sourceAtt.weightMode) : sourceWeightMode,
    influenceBones:
      sourceWeightMode === "weighted"
        ? Array.isArray(sourceAtt && sourceAtt.influenceBones)
          ? sourceAtt.influenceBones.filter((v) => Number.isFinite(v))
          : []
        : [],
    clipEnabled: !!(sourceAtt && sourceAtt.clipEnabled),
    clipSource: sourceAtt && sourceAtt.clipSource === "contour" ? "contour" : "fill",
    clipEndSlotId:
      sourceAtt && Object.prototype.hasOwnProperty.call(sourceAtt, "clipEndSlotId")
        ? sourceAtt.clipEndSlotId == null
          ? null
          : String(sourceAtt.clipEndSlotId)
        : null,
    attachments: ensureSlotAttachments(source).map((a) => ({
      name: String(a && a.name ? a.name : "").trim(),
      placeholder: String(a && a.placeholder ? a.placeholder : source.placeholderName || source.attachmentName || "main").trim(),
      // If the source attachment is a broken visual (canvas: null), keep
      // null in the duplicate so the user still sees the broken entry --
      // don't silently substitute the slot's primary clone.
      canvas:
        a && a.canvas ? getClonedCanvas(a.canvas)
          : (a && Object.prototype.hasOwnProperty.call(a, "canvas") && a.canvas === null) ? null
            : sourceCanvasClone,
      type: normalizeAttachmentType(a && a.type),
      linkedParent: a && a.linkedParent != null ? String(a.linkedParent) : "",
      inheritTimelines: !!(a && a.inheritTimelines),
      pointX: Number(a && a.pointX) || 0,
      pointY: Number(a && a.pointY) || 0,
      pointRot: Number(a && a.pointRot) || 0,
      bboxSource: a && a.bboxSource === "contour" ? "contour" : "fill",
      sequence:
        a && a.sequence
          ? {
            enabled: !!a.sequence.enabled,
            count: Math.max(1, Math.round(Number(a.sequence.count) || 1)),
              start: Math.max(0, Math.round(Number(a.sequence.start) || 0)),
              digits: Math.max(1, Math.round(Number(a.sequence.digits) || 2)),
            }
          : { enabled: false, count: 1, start: 0, digits: 2 },
      useWeights: a && a.useWeights === true,
      weightBindMode: a && a.weightBindMode ? String(a.weightBindMode) : "none",
      weightMode: a && a.weightMode ? String(a.weightMode) : "free",
      influenceBones: Array.isArray(a && a.influenceBones) ? a.influenceBones.filter((v) => Number.isFinite(v)) : [],
      clipEnabled: !!(a && a.clipEnabled),
      clipSource: a && a.clipSource === "contour" ? "contour" : "fill",
      clipEndSlotId:
        a && Object.prototype.hasOwnProperty.call(a, "clipEndSlotId")
          ? a.clipEndSlotId == null
            ? null
            : String(a.clipEndSlotId)
          : null,
      rect: a && a.rect ? JSON.parse(JSON.stringify(a.rect)) : null,
      baseImageTransform: normalizeBaseImageTransform(a && a.baseImageTransform),
      meshData: a && a.meshData ? cloneSlotMeshData(a.meshData) : null,
      meshContour: a && a.meshContour ? cloneSlotContourData(a.meshContour) : null,
    })),
  };
  addSlotEntry(entry, true);
  const dst = getActiveSlot();
  if (!dst) return null;
  if (state.mesh) {
    const dstAtt = getActiveAttachment(dst);
    if (!(dstAtt && dstAtt.meshData)) {
      ensureSlotMeshData(dst, state.mesh);
      rebuildSlotWeights(dst, state.mesh);
    }
  }
  ensureSlotClipState(dst);
  ensureSlotVisualState(dst);
  if (state.mesh) ensureSlotsHaveBoneBinding();
  rebuildSlotTriangleIndices();
  refreshSlotUI();
  renderBoneTree();
  refreshAnimationUI();
  return dst;
}

function remapTrackIdAfterSlotRemoved(trackId, removedSlotIndex) {
  const parsed = parseTrackId(trackId);
  if (!parsed) return trackId;
  if (parsed.type === "slot") {
    const si = Number(parsed.slotIndex);
    if (!Number.isFinite(si)) return trackId;
    if (si === removedSlotIndex) return null;
    return getSlotTrackId(si > removedSlotIndex ? si - 1 : si, parsed.prop);
  }
  if (parsed.type === "mesh" && Number.isFinite(parsed.slotIndex)) {
    const si = Number(parsed.slotIndex);
    if (si === removedSlotIndex) return null;
    return getVertexTrackId(si > removedSlotIndex ? si - 1 : si, parsed.attachmentName || null);
  }
  return trackId;
}

function remapAnimationTracksForRemovedSlot(removedSlotIndex, removedSlotId) {
  const removedId = removedSlotId == null ? "" : String(removedSlotId);
  for (const anim of state.anim.animations || []) {
    if (!anim || !anim.tracks || typeof anim.tracks !== "object") continue;
    const outTracks = {};
    for (const [trackId, rawKeys] of Object.entries(anim.tracks)) {
      const nextTrackId = remapTrackIdAfterSlotRemoved(trackId, removedSlotIndex);
      if (!nextTrackId) continue;
      const parsed = parseTrackId(trackId);
      const keys = Array.isArray(rawKeys) ? rawKeys : [];
      const remappedKeys = [];
      for (const src of keys) {
        if (!src || typeof src !== "object") continue;
        const row = { ...src };
        if (trackId === VERTEX_TRACK_ID || (parsed && parsed.type === "mesh" && !Number.isFinite(parsed.slotIndex))) {
          const ksi = Number(row.slotIndex);
          if (Number.isFinite(ksi)) {
            if (ksi === removedSlotIndex) continue;
            if (ksi > removedSlotIndex) row.slotIndex = ksi - 1;
          }
        }
        if (trackId === DRAWORDER_TRACK_ID && Array.isArray(row.value) && removedId) {
          row.value = row.value.map((v) => String(v)).filter((id) => id !== removedId);
        }
        if (parsed && parsed.type === "slot" && parsed.prop === "clipEnd" && removedId) {
          if (row.value != null && String(row.value) === removedId) row.value = "";
        }
        remappedKeys.push(row);
      }
      if (remappedKeys.length <= 0) continue;
      if (!outTracks[nextTrackId]) outTracks[nextTrackId] = [];
      outTracks[nextTrackId].push(...remappedKeys);
    }
    anim.tracks = outTracks;
    for (const trackId of Object.keys(anim.tracks)) {
      normalizeTrackKeys(anim, trackId);
    }
  }
}

function removeSlotReferencesFromSkins(removedSlotId) {
  const sid = removedSlotId == null ? "" : String(removedSlotId);
  if (!sid) return;
  for (const skin of ensureSkinSets()) {
    if (!skin || typeof skin !== "object") continue;
    if (skin.slotAttachments && typeof skin.slotAttachments === "object") {
      delete skin.slotAttachments[sid];
    }
    if (skin.slotPlaceholderAttachments && typeof skin.slotPlaceholderAttachments === "object") {
      delete skin.slotPlaceholderAttachments[sid];
    }
  }
}

function deleteActiveSlotQuick() {
  if (!Array.isArray(state.slots) || state.slots.length <= 0) return null;
  const idxRaw = Number(state.activeSlot);
  const idx = Number.isFinite(idxRaw) && idxRaw >= 0 && idxRaw < state.slots.length ? idxRaw : state.slots.length - 1;
  const removed = state.slots[idx];
  const removedId = removed && removed.id ? String(removed.id) : "";
  if (typeof releaseGLTexturesForSlot === "function") releaseGLTexturesForSlot(removed);
  state.slots.splice(idx, 1);
  removeSlotReferencesFromSkins(removedId);
  remapAnimationTracksForRemovedSlot(idx, removedId);
  if (removedId) {
    for (const s of state.slots) {
      if (!s) continue;
      const att = getActiveAttachment(s);
      if (att && att.clipEndSlotId && String(att.clipEndSlotId) === removedId) att.clipEndSlotId = null;
    }
  }
  clearTimelineKeySelection();
  state.anim.selectedTrack = "";
  state.anim.dirtyTracks = [];
  if (state.slots.length > 0) {
    setActiveSlot(Math.max(0, Math.min(idx, state.slots.length - 1)));
    ensureSlotsHaveBoneBinding();
  } else {
    state.activeSlot = -1;
    state.sourceCanvas = null;
    refreshSlotUI();
    renderBoneTree();
  }
  refreshAnimationUI();
  return removed || null;
}

function assignSlotToBone(slotIndex, boneIndex) {
  const si = Number(slotIndex);
  const bi = Number(boneIndex);
  const m = state.mesh;
  if (!Number.isFinite(si) || si < 0 || si >= state.slots.length) return false;
  const slot = state.slots[si];
  if (!slot) return false;
  const ok = applySlotBoneAssignment(slot, bi, m);
  if (!ok) return false;
  if (state.activeSlot === si) refreshSlotUI();
  renderBoneTree();
  return true;
}

function applySlotBoneAssignment(slot, boneIndex, mesh = state.mesh) {
  const bi = Number(boneIndex);
  const m = mesh;
  if (!slot) return false;
  const att = getActiveAttachment(slot);
  if (bi === -1) {
    // Unbind path: rewrite tx/ty/rot so the on-screen position stays put
    // when slot.bone changes from a real bone to -1 (the coord space
    // switches from bone-local conjugate to image-pivot conjugate).
    const applyUnbind = () => {
      slot.bone = -1;
      if (!m) {
        if (att) att.influenceBones = [];
        return;
      }
      const mode = getSlotWeightMode(slot);
      if (mode === "single") {
        setSlotSingleBoneWeight(slot, m, -1);
        if (att) att.influenceBones = [];
      } else if (mode === "weighted") {
        if (att) {
          att.weightMode = "weighted";
          att.weightBindMode = "auto";
          att.useWeights = true;
          att.influenceBones = [];
        }
        rebuildSlotWeights(slot, m);
      } else {
        if (att) {
          att.weightMode = "free";
          att.weightBindMode = "none";
          att.useWeights = false;
          att.influenceBones = [];
        }
        rebuildSlotWeights(slot, m);
      }
    };
    if (typeof preserveSlotWorldTransformAcrossBind === "function") {
      preserveSlotWorldTransformAcrossBind(slot, m, applyUnbind);
    } else {
      applyUnbind();
    }
    return true;
  }
  if (!m || !Array.isArray(m.rigBones) || m.rigBones.length <= 0) return false;
  if (!Number.isFinite(bi) || bi < 0 || bi >= m.rigBones.length) return false;
  const applyBind = () => {
    slot.bone = bi;
    const mode = getSlotWeightMode(slot);
    if (mode === "single") {
      if (att) {
        att.weightMode = "single";
        att.weightBindMode = "single";
        att.useWeights = true;
        att.influenceBones = [bi];
      }
    } else if (mode === "weighted") {
      if (att) {
        att.weightMode = "weighted";
        att.weightBindMode = "auto";
        att.useWeights = true;
        const current = Array.isArray(att.influenceBones) ? att.influenceBones.filter((v) => Number.isFinite(v)) : [];
        att.influenceBones = current.length > 0 ? current : [bi];
      }
    }
  };
  if (typeof preserveSlotWorldTransformAcrossBind === "function") {
    preserveSlotWorldTransformAcrossBind(slot, m, applyBind);
  } else {
    applyBind();
  }
  rebuildSlotWeights(slot, m);
  return true;
}

function moveSlotToIndex(sourceIndex, insertIndex) {
  const from = Number(sourceIndex);
  const rawInsert = Number(insertIndex);
  if (!Number.isFinite(from) || !Number.isFinite(rawInsert)) return from;
  if (from < 0 || from >= state.slots.length) return from;
  const len = state.slots.length;
  let insert = math.clamp(Math.round(rawInsert), 0, len);
  // Same visual position (drop before itself / after itself) -> no-op.
  if (insert === from || insert === from + 1) return from;
  const [moved] = state.slots.splice(from, 1);
  if (!moved) return from;
  if (from < insert) insert -= 1;
  insert = math.clamp(insert, 0, state.slots.length);
  state.slots.splice(insert, 0, moved);

  const active = Number(state.activeSlot);
  if (Number.isFinite(active) && active >= 0 && active < len) {
    if (active === from) {
      state.activeSlot = insert;
    } else if (from < active && active <= insert) {
      state.activeSlot = active - 1;
    } else if (insert <= active && active < from) {
      state.activeSlot = active + 1;
    }
  }
  return insert;
}

function clearBoneTreeDropIndicators() {
  if (!els.boneTree) return;
  for (const row of els.boneTree.querySelectorAll(".tree-item.drop-target")) {
    row.classList.remove("drop-target");
    row.classList.remove("drop-before");
    row.classList.remove("drop-after");
  }
}

function setBoneTreeDropIndicator(boneIndex) {
  clearBoneTreeDropIndicators();
  if (!els.boneTree) return;
  const idx = Number(boneIndex);
  if (!Number.isFinite(idx) || idx < 0) return;
  const row = els.boneTree.querySelector(`.tree-item[data-bone-index="${idx}"]`);
  if (row) row.classList.add("drop-target");
}

function setBoneTreeSlotDropIndicator(slotIndex, placeAfter) {
  clearBoneTreeDropIndicators();
  if (!els.boneTree) return;
  const idx = Number(slotIndex);
  if (!Number.isFinite(idx) || idx < 0) return;
  const row = els.boneTree.querySelector(`.tree-item[data-slot-index="${idx}"]`);
  if (!row) return;
  row.classList.add("drop-target");
  row.classList.add(placeAfter ? "drop-after" : "drop-before");
}

function renameSlotByIndexFromTree(slotIndex) {
  const si = Number(slotIndex);
  return startBoneTreeInlineRename("slot", si);
}

function openLoadImageForActiveSlotFromTree() {
  const slot = getActiveSlot();
  if (!slot) return false;
  ensureSlotAttachmentState(slot);
  ensureSlotAttachments(slot);
  let current = getSlotCurrentAttachmentName(slot);
  if (!current) {
    current = String(slot.attachmentName || (slot.attachments[0] && slot.attachments[0].name) || "").trim();
    if (!current) return false;
    slot.activeAttachment = current;
  }
  refreshSlotUI();
  if (!els.slotAttachmentFileInput) return false;
  els.slotAttachmentFileInput.click();
  return true;
}

function refreshBoneTreeContextMenuUI() {
  const active = getActiveSlot();
  const isBoneCtx = state.boneTreeMenuContextKind === "bone";
  const isSlotCtx = state.boneTreeMenuContextKind === "slot";
  const isAttachmentCtx = state.boneTreeMenuContextKind === "attachment";
  const deleteInfo = getSelectedBoneDeleteInfo();
  const boundCount = deleteInfo.slotIndices.length;
  const canDeleteBone = isBoneCtx && deleteInfo.canDelete;
  if (els.treeCtxSlotAddBtn) {
    els.treeCtxSlotAddBtn.disabled = !state.mesh && state.slots.length === 0 && !state.sourceCanvas;
    els.treeCtxSlotAddBtn.hidden = false;
  }
  if (els.treeCtxSlotDupBtn) {
    els.treeCtxSlotDupBtn.disabled = !active;
    els.treeCtxSlotDupBtn.hidden = !isSlotCtx;
  }
  if (els.treeCtxSlotRenameBtn) {
    els.treeCtxSlotRenameBtn.disabled = !active;
    els.treeCtxSlotRenameBtn.hidden = !isSlotCtx;
  }
  if (els.treeCtxSlotDeleteBtn) {
    els.treeCtxSlotDeleteBtn.disabled = !active;
    els.treeCtxSlotDeleteBtn.hidden = !isSlotCtx;
  }
  if (els.treeCtxAttachmentAddBtn) {
    els.treeCtxAttachmentAddBtn.disabled = !active;
    els.treeCtxAttachmentAddBtn.hidden = !isAttachmentCtx;
  }
  if (els.treeCtxAttachmentDupBtn) {
    els.treeCtxAttachmentDupBtn.disabled = !active || !getSlotCurrentAttachmentName(active);
    els.treeCtxAttachmentDupBtn.hidden = !isAttachmentCtx;
  }
  if (els.treeCtxAttachmentChangeTypeBtn) {
    els.treeCtxAttachmentChangeTypeBtn.disabled = !active || !getSlotCurrentAttachmentName(active);
    els.treeCtxAttachmentChangeTypeBtn.hidden = !isAttachmentCtx;
  }
  if (els.treeCtxAttachmentDeleteBtn) {
    els.treeCtxAttachmentDeleteBtn.disabled = !active || ensureSlotAttachments(active).length <= 1 || !getSlotCurrentAttachmentName(active);
    els.treeCtxAttachmentDeleteBtn.hidden = !isAttachmentCtx;
  }
  if (els.treeCtxAttachmentRenameBtn) {
    els.treeCtxAttachmentRenameBtn.disabled = !active || !getSlotCurrentAttachmentName(active);
    els.treeCtxAttachmentRenameBtn.hidden = !isAttachmentCtx;
  }
  if (els.treeCtxAttachmentSetActiveBtn) {
    els.treeCtxAttachmentSetActiveBtn.disabled = !active || !getSlotCurrentAttachmentName(active);
    els.treeCtxAttachmentSetActiveBtn.hidden = !isAttachmentCtx;
  }
  if (els.treeCtxAttachmentCopyToSlotBtn) {
    els.treeCtxAttachmentCopyToSlotBtn.disabled = !active || !getSlotCurrentAttachmentName(active) || state.slots.filter(Boolean).length < 2;
    els.treeCtxAttachmentCopyToSlotBtn.hidden = !isAttachmentCtx;
  }
  if (els.treeCtxAttachmentLoadImageBtn) {
    const attForLoad = active ? getActiveAttachment(active) : null;
    const attTypeForLoad = attForLoad ? normalizeAttachmentType(attForLoad.type) : "";
    const canLoadImg = attTypeForLoad === "region" || attTypeForLoad === "mesh";
    els.treeCtxAttachmentLoadImageBtn.disabled = !canLoadImg;
    els.treeCtxAttachmentLoadImageBtn.hidden = !isAttachmentCtx;
  }
  if (els.treeCtxSlotLoadImageBtn) {
    els.treeCtxSlotLoadImageBtn.disabled = !active;
    els.treeCtxSlotLoadImageBtn.hidden = !isSlotCtx;
  }
  if (els.treeCtxBoneDeleteBtn) {
    els.treeCtxBoneDeleteBtn.disabled = !canDeleteBone;
    els.treeCtxBoneDeleteBtn.hidden = !isBoneCtx;
    els.treeCtxBoneDeleteBtn.textContent =
      deleteInfo.mode === "subtree"
        ? boundCount > 0 ? `Delete Bone Tree (Slots -> Staging, ${boundCount})` : "Delete Bone Tree (Slots -> Staging)"
        : boundCount > 0 ? `Delete Bone (Slots -> Staging, ${boundCount})` : "Delete Bone (Slots -> Staging)";
  }
  if (els.treeCtxBoneDeleteWithSlotsBtn) {
    els.treeCtxBoneDeleteWithSlotsBtn.disabled = !canDeleteBone;
    els.treeCtxBoneDeleteWithSlotsBtn.hidden = !isBoneCtx;
    els.treeCtxBoneDeleteWithSlotsBtn.textContent =
      deleteInfo.mode === "subtree"
        ? boundCount > 0 ? `Delete Bone Tree + Delete Slots (${boundCount})` : "Delete Bone Tree + Delete Slots"
        : boundCount > 0 ? `Delete Bone + Delete Slots (${boundCount})` : "Delete Bone + Delete Slots";
  }
}

function closeBoneTreeContextMenu() {
  state.boneTreeMenuOpen = false;
  state.boneTreeMenuContextKind = "";
  if (els.boneTreeContextMenu) {
    els.boneTreeContextMenu.classList.add("collapsed");
  }
}

function openBoneTreeContextMenu(clientX, clientY) {
  if (!els.boneTreeContextMenu) return;
  closeBoneDeleteQuickMenu();
  refreshBoneTreeContextMenuUI();
  els.boneTreeContextMenu.classList.remove("collapsed");
  state.boneTreeMenuOpen = true;
  const menuRect = els.boneTreeContextMenu.getBoundingClientRect();
  const vw = window.innerWidth || document.documentElement.clientWidth || 0;
  const vh = window.innerHeight || document.documentElement.clientHeight || 0;
  const margin = 8;
  let left = Number(clientX) || 0;
  let top = Number(clientY) || 0;
  if (left + menuRect.width + margin > vw) left = Math.max(margin, vw - menuRect.width - margin);
  if (top + menuRect.height + margin > vh) top = Math.max(margin, vh - menuRect.height - margin);
  els.boneTreeContextMenu.style.left = `${Math.round(left)}px`;
  els.boneTreeContextMenu.style.top = `${Math.round(top)}px`;
}

function closeTimelineKeyContextMenu() {
  state.anim.timelineContextMenuOpen = false;
  state.anim.timelineContextTrackId = "";
  if (els.timelineKeyContextMenu) els.timelineKeyContextMenu.classList.add("collapsed");
}

function refreshTimelineKeyContextMenuUI() {
  const hasSelection = getActiveTimelineKeySelection().length > 0;
  const hasClipboard = hasTimelineClipboardData();
  if (els.timelineCtxCutBtn) els.timelineCtxCutBtn.disabled = !hasSelection;
  if (els.timelineCtxCopyBtn) els.timelineCtxCopyBtn.disabled = !hasSelection;
  if (els.timelineCtxDeleteBtn) els.timelineCtxDeleteBtn.disabled = !hasSelection;
  if (els.timelineCtxPasteBtn) els.timelineCtxPasteBtn.disabled = !hasClipboard;
}

function openTimelineKeyContextMenu(clientX, clientY) {
  if (!els.timelineKeyContextMenu) return;
  closeBoneTreeContextMenu();
  closeBoneDeleteQuickMenu();
  refreshTimelineKeyContextMenuUI();
  els.timelineKeyContextMenu.classList.remove("collapsed");
  state.anim.timelineContextMenuOpen = true;
  const menuRect = els.timelineKeyContextMenu.getBoundingClientRect();
  const vw = window.innerWidth || document.documentElement.clientWidth || 0;
  const vh = window.innerHeight || document.documentElement.clientHeight || 0;
  const margin = 8;
  let left = Number(clientX) || 0;
  let top = Number(clientY) || 0;
  if (left + menuRect.width + margin > vw) left = Math.max(margin, vw - menuRect.width - margin);
  if (top + menuRect.height + margin > vh) top = Math.max(margin, vh - menuRect.height - margin);
  els.timelineKeyContextMenu.style.left = `${Math.round(left)}px`;
  els.timelineKeyContextMenu.style.top = `${Math.round(top)}px`;
}

function normalizeSlotBlendMode(mode) {
  const v = String(mode || "").toLowerCase();
  if (v === "additive") return "additive";
  if (v === "multiply") return "multiply";
  if (v === "screen") return "screen";
  return "normal";
}

function ensureSlotVisualState(slot) {
  if (!slot) return;
  slot.blend = normalizeSlotBlendMode(slot.blend);
  slot.darkEnabled = !!slot.darkEnabled;
  slot.dr = math.clamp(Number(slot.dr) || 0, 0, 1);
  slot.dg = math.clamp(Number(slot.dg) || 0, 0, 1);
  slot.db = math.clamp(Number(slot.db) || 0, 0, 1);
}

function getCanvasCompositeForBlendMode(mode) {
  const v = normalizeSlotBlendMode(mode);
  if (v === "additive") return "lighter";
  if (v === "multiply") return "multiply";
  if (v === "screen") return "screen";
  return "source-over";
}

function applyGLBlendMode(mode) {
  if (!hasGL || !gl) return;
  const v = normalizeSlotBlendMode(mode);
  if (v === "additive") {
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    return;
  }
  if (v === "multiply") {
    gl.blendFunc(gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA);
    return;
  }
  if (v === "screen") {
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_COLOR);
    return;
  }
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
}

function getActiveSlot() {
  if (state.activeSlot < 0 || state.activeSlot >= state.slots.length) return null;
  return state.slots[state.activeSlot];
}

function getSelectedSlotIndexForBone(boneIndex) {
  const bi = Number(boneIndex);
  if (!Number.isFinite(bi) || bi < 0) return -1;
  const pickedId = state.boneTreeSelectedSlotByBone ? state.boneTreeSelectedSlotByBone[bi] : null;
  if (!pickedId) return -1;
  const idx = state.slots.findIndex((s) => s && s.id != null && String(s.id) === String(pickedId));
  if (idx < 0) {
    delete state.boneTreeSelectedSlotByBone[bi];
    return -1;
  }
  const slot = state.slots[idx];
  if (!slot || getSlotTreeBoneIndex(slot, state.mesh) !== bi) {
    delete state.boneTreeSelectedSlotByBone[bi];
    return -1;
  }
  return idx;
}

function getSelectedUnassignedSlotIndices() {
  const selectedIds = Array.isArray(state.boneTreeSelectedUnassignedSlotIds) ? state.boneTreeSelectedUnassignedSlotIds : [];
  const out = [];
  for (const id of selectedIds) {
    const idx = state.slots.findIndex((s) => s && s.id != null && String(s.id) === String(id) && getSlotTreeBoneIndex(s, state.mesh) === -1);
    if (idx >= 0 && !out.includes(idx)) out.push(idx);
  }
  if (out.length <= 0) {
    const ai = Number(state.activeSlot);
    if (Number.isFinite(ai) && ai >= 0 && ai < state.slots.length) {
      const s = state.slots[ai];
      if (s && getSlotTreeBoneIndex(s, state.mesh) === -1) out.push(ai);
    }
  }
  state.boneTreeSelectedUnassignedSlotIds = out.map((i) => String(state.slots[i] && state.slots[i].id != null ? state.slots[i].id : ""));
  return out;
}

function getExplicitSelectedUnassignedSlotIndices() {
  const selectedIds = Array.isArray(state.boneTreeSelectedUnassignedSlotIds) ? state.boneTreeSelectedUnassignedSlotIds : [];
  const out = [];
  for (const id of selectedIds) {
    const idx = state.slots.findIndex((s) => s && s.id != null && String(s.id) === String(id) && getSlotTreeBoneIndex(s, state.mesh) === -1);
    if (idx >= 0 && !out.includes(idx)) out.push(idx);
  }
  state.boneTreeSelectedUnassignedSlotIds = out.map((i) => String(state.slots[i] && state.slots[i].id != null ? state.slots[i].id : ""));
  return out;
}

function setSelectedUnassignedSlotIndices(indices, append = false) {
  const next = [];
  const base = append ? getSelectedUnassignedSlotIndices() : [];
  for (const i of base) {
    const s = state.slots[i];
    if (!s || getSlotTreeBoneIndex(s, state.mesh) !== -1 || s.id == null) continue;
    const sid = String(s.id);
    if (!next.includes(sid)) next.push(sid);
  }
  for (const raw of Array.isArray(indices) ? indices : []) {
    const i = Number(raw);
    if (!Number.isFinite(i) || i < 0 || i >= state.slots.length) continue;
    const s = state.slots[i];
    if (!s || getSlotTreeBoneIndex(s, state.mesh) !== -1 || s.id == null) continue;
    const sid = String(s.id);
    if (!next.includes(sid)) next.push(sid);
  }
  state.boneTreeSelectedUnassignedSlotIds = next;
}

function syncBindSelectionToSingleSlot(index) {
  const si = Number(index);
  if (!Number.isFinite(si) || si < 0 || si >= state.slots.length) return false;
  const slot = state.slots[si];
  if (!slot) return false;
  state.boneTreeSelectedSlotByBone = Object.create(null);
  state.boneTreeSelectedUnassignedSlotIds = [];
  const bi = getSlotTreeBoneIndex(slot, state.mesh);
  if (bi === -1) {
    setSelectedUnassignedSlotIndices([si], false);
    return true;
  }
  const sid = slot.id != null ? String(slot.id) : "";
  if (Number.isFinite(bi) && bi >= 0 && sid) {
    state.boneTreeSelectedSlotByBone[bi] = sid;
    return true;
  }
  return false;
}

function getSelectedSlotIndicesForAutoWeight() {
  const out = [];
  const pushIndex = (idx) => {
    const i = Number(idx);
    if (!Number.isFinite(i) || i < 0 || i >= state.slots.length) return;
    if (!out.includes(i)) out.push(i);
  };

  const selectedByBone = state.boneTreeSelectedSlotByBone || Object.create(null);
  for (const boneKey of Object.keys(selectedByBone)) {
    const bi = Number(boneKey);
    if (!Number.isFinite(bi) || bi < 0) continue;
    pushIndex(getSelectedSlotIndexForBone(bi));
  }

  for (const si of getExplicitSelectedUnassignedSlotIndices()) {
    pushIndex(si);
  }

  if (out.length === 0) {
    const ai = Number(state.activeSlot);
    if (Number.isFinite(ai) && ai >= 0 && ai < state.slots.length) pushIndex(ai);
  }
  return out;
}

function bindSelectedUnassignedSlotsToDefaultBones() {
  const m = state.mesh;
  if (!m) return 0;
  const selected = getSelectedUnassignedSlotIndices();
  if (selected.length <= 0) return 0;
  let bound = 0;
  for (const si of selected) {
    const slot = state.slots[si];
    if (!slot || getSlotTreeBoneIndex(slot, m) !== -1) continue;
    const bi = createTempBoneForSlot(slot, "slot_stage");
    if (!Number.isFinite(bi) || bi < 0) continue;
    if (!applySlotBoneAssignment(slot, bi, m)) continue;
    bound += 1;
  }
  if (bound > 0) {
    state.boneTreeSelectedUnassignedSlotIds = [];
    updateBoneUI();
    refreshSlotUI();
    renderBoneTree();
  }
  return bound;
}

function makeUniqueSlotName(base) {
  const used = new Set((state.slots || []).map((s) => (s && s.name ? s.name : "")));
  const stem = (base || "slot").trim() || "slot";
  if (!used.has(stem)) return stem;
  let i = 1;
  let next = `${stem}_${i}`;
  while (used.has(next)) {
    i += 1;
    next = `${stem}_${i}`;
  }
  return next;
}

function ensureSlotAttachmentState(slot) {
  if (!slot) return null;
  const base = String(slot.attachmentName || "main").trim() || "main";
  slot.attachmentName = base;
  const ph = String(slot.placeholderName || slot.attachmentName || "main").trim() || "main";
  slot.placeholderName = ph;
  if (!("activeAttachment" in slot)) {
    slot.activeAttachment = base;
  }
  if (slot.activeAttachment != null) {
    const name = String(slot.activeAttachment).trim();
    slot.activeAttachment = name.length > 0 ? name : base;
  }
  return slot.activeAttachment != null ? String(slot.activeAttachment) : null;
}

function normalizeAttachmentType(type) {
  const t = String(type || "").toLowerCase();
  if (t === ATTACHMENT_TYPES.MESH) return ATTACHMENT_TYPES.MESH;
  if (t === ATTACHMENT_TYPES.LINKED_MESH) return ATTACHMENT_TYPES.LINKED_MESH;
  if (t === ATTACHMENT_TYPES.BOUNDING_BOX) return ATTACHMENT_TYPES.BOUNDING_BOX;
  if (t === ATTACHMENT_TYPES.CLIPPING) return ATTACHMENT_TYPES.CLIPPING;
  if (t === ATTACHMENT_TYPES.POINT) return ATTACHMENT_TYPES.POINT;
  return ATTACHMENT_TYPES.REGION;
}

function isDeformableAttachment(att) {
  const type = normalizeAttachmentType(att && att.type);
  return type === ATTACHMENT_TYPES.MESH || type === ATTACHMENT_TYPES.LINKED_MESH;
}

function isVisualAttachment(att) {
  const type = normalizeAttachmentType(att && att.type);
  return type === ATTACHMENT_TYPES.REGION || type === ATTACHMENT_TYPES.MESH || type === ATTACHMENT_TYPES.LINKED_MESH;
}

function attachmentHasMesh(att) {
  const type = normalizeAttachmentType(att && att.type);
  return (
    type === ATTACHMENT_TYPES.MESH ||
    type === ATTACHMENT_TYPES.LINKED_MESH ||
    type === ATTACHMENT_TYPES.BOUNDING_BOX ||
    type === ATTACHMENT_TYPES.CLIPPING
  );
}

function getLegacySlotAttachmentState(slot) {
  return slot && slot.__legacyAttachmentState && typeof slot.__legacyAttachmentState === "object"
    ? slot.__legacyAttachmentState
    : null;
}

function readSlotMeshData(slot) {
  const active = getActiveAttachment(slot);
  if (active && active.meshData) return active.meshData;
  const legacy = getLegacySlotAttachmentState(slot);
  return legacy && legacy.meshData ? legacy.meshData : null;
}

function readSlotMeshContour(slot) {
  const active = getActiveAttachment(slot);
  if (active && active.meshContour) return active.meshContour;
  const legacy = getLegacySlotAttachmentState(slot);
  return legacy && legacy.meshContour ? legacy.meshContour : null;
}

function normalizeSlotAttachmentRecord(slot, a, fallbackName, fallbackPlaceholder, fallbackCanvas) {
  const rec = a && typeof a === "object" ? a : {};
  const legacy = getLegacySlotAttachmentState(slot);
  const name = String(rec.name || fallbackName || "att").trim() || String(fallbackName || "att");
  const placeholder = String(rec.placeholder || fallbackPlaceholder || "main").trim() || "main";
  const type = normalizeAttachmentType(rec.type);
  // Canvas resolution rules:
  //   rec.canvas truthy            -> use it
  //   rec.canvas === null AND
  //   rec has own "canvas" prop    -> caller explicitly said "broken / no
  //                                  image" -- keep null (don't lie with
  //                                  fallbackCanvas)
  //   otherwise (no own prop)      -> unspecified -> fall back
  const recHasOwnCanvas = a && typeof a === "object" && Object.prototype.hasOwnProperty.call(a, "canvas");
  const explicitlyNullCanvas = recHasOwnCanvas && rec.canvas === null;
  const out = {
    name,
    placeholder,
    type,
    canvas: rec.canvas || (explicitlyNullCanvas ? null : (fallbackCanvas || null)),
    linkedParent: rec && rec.linkedParent != null ? String(rec.linkedParent) : "",
    inheritTimelines: !!(rec && rec.inheritTimelines),
    pointX: Number(rec && rec.pointX) || 0,
    pointY: Number(rec && rec.pointY) || 0,
    pointRot: Number(rec && rec.pointRot) || 0,
    bboxSource: rec && rec.bboxSource === "contour" ? "contour" : "fill",
    sequence:
      rec && rec.sequence && typeof rec.sequence === "object"
        ? {
          enabled: !!rec.sequence.enabled,
          count: Math.max(1, Math.round(Number(rec.sequence.count) || 1)),
          start: Math.max(0, Math.round(Number(rec.sequence.start) || 0)),
          digits: Math.max(1, Math.round(Number(rec.sequence.digits) || 2)),
        }
        : { enabled: false, count: 1, start: 0, digits: 2 },
    meshData: rec.meshData ? cloneSlotMeshData(rec.meshData) : legacy && legacy.meshData ? cloneSlotMeshData(legacy.meshData) : null,
    meshContour: rec.meshContour ? cloneSlotContourData(rec.meshContour) : legacy && legacy.meshContour ? cloneSlotContourData(legacy.meshContour) : {
      points: [], sourcePoints: [], authorContourPoints: [],
      closed: false, triangles: [], fillPoints: [], fillTriangles: [],
      manualEdges: [], fillManualEdges: []
    },
    baseImageTransform: normalizeBaseImageTransform(rec.baseImageTransform || (slot && slot.baseImageTransform)),
    useWeights: rec.useWeights !== undefined ? rec.useWeights : legacy ? legacy.useWeights === true : false,
    weightBindMode: rec.weightBindMode || (legacy && legacy.weightBindMode ? legacy.weightBindMode : "none"),
    weightMode: rec.weightMode || (legacy && legacy.weightMode ? legacy.weightMode : "free"),
    influenceBones: Array.isArray(rec.influenceBones)
      ? rec.influenceBones.filter((v) => Number.isFinite(v))
      : Array.isArray(legacy && legacy.influenceBones)
        ? legacy.influenceBones.filter((v) => Number.isFinite(v))
        : [],
    clipEnabled: !!rec.clipEnabled || !!(legacy && legacy.clipEnabled),
    clipSource: rec.clipSource || (legacy && legacy.clipSource ? legacy.clipSource : "fill"),
    clipEndSlotId: rec.clipEndSlotId || (legacy && legacy.clipEndSlotId ? legacy.clipEndSlotId : null),
    rect: rec.rect || (slot && slot.rect ? JSON.parse(JSON.stringify(slot.rect)) : null)
  };
  // Only synthesize a slot-canvas fallback when the caller didn't
  // explicitly mark this attachment as broken (canvas: null). Broken
  // visual attachments stay null so renderers / UI can flag them.
  if (isVisualAttachment(out) && !out.canvas && !explicitlyNullCanvas) {
    out.canvas = slot ? getSlotCanvas(slot) : null;
  }
  if (!attachmentHasMesh(out)) {
    out.meshData = null;
    if (type === ATTACHMENT_TYPES.REGION || type === ATTACHMENT_TYPES.POINT) out.meshContour = null;
  }
  if (type === ATTACHMENT_TYPES.BOUNDING_BOX) {
    out.canvas = null;
    out.meshData = null;
    out.clipEnabled = false;
    out.clipEndSlotId = null;
  }
  if (type === ATTACHMENT_TYPES.CLIPPING) {
    out.canvas = null;
    out.meshData = null;
  }
  if (type === ATTACHMENT_TYPES.POINT) {
    out.canvas = null;
    out.meshContour = null;
    out.clipEnabled = false;
    out.clipEndSlotId = null;
  }
  return out;
}

function ensureSlotAttachments(slot) {
  if (!slot) return [];
  const base = String(slot.attachmentName || "main").trim() || "main";
  const basePh = String(slot.placeholderName || base || "main").trim() || "main";
  const slotCanvas = getSlotCanvas(slot);
  if (!Array.isArray(slot.attachments) || slot.attachments.length === 0) {
    slot.attachments = [normalizeSlotAttachmentRecord(slot, { name: String(slot.attachmentName || "main"), placeholder: basePh, canvas: slotCanvas }, base, basePh, slotCanvas)];
  }
  const out = [];
  const used = new Set();
  for (const a of slot.attachments) {
    const rawName = String(a && a.name ? a.name : "").trim();
    let name = rawName || `att_${out.length}`;
    if (used.has(name)) {
      let i = 2;
      let next = `${name}_${i}`;
      while (used.has(next)) {
        i += 1;
        next = `${name}_${i}`;
      }
      name = next;
    }
    used.add(name);
    const rec = normalizeSlotAttachmentRecord(slot, a, name, basePh, slotCanvas);
    rec.name = name;
    // Keep visual-but-null-canvas attachments -- they represent broken
    // images from a failed restore. hasRenderableAttachment / renderers
    // skip drawing them; the UI shows them so the user knows what's
    // missing. (Previously `continue` silently dropped them.)
    out.push(rec);
  }
  if (out.length === 0 && slotCanvas) {
    out.push(normalizeSlotAttachmentRecord(slot, { name: base, placeholder: basePh, canvas: slotCanvas }, base, basePh, slotCanvas));
  }
  slot.attachments = out;
  if (!slot.attachments.some((a) => a.name === slot.attachmentName)) {
    slot.attachmentName = slot.attachments[0] ? slot.attachments[0].name : base;
  }
  if (slot.activeAttachment != null && !slot.attachments.some((a) => a.name === String(slot.activeAttachment))) {
    slot.activeAttachment = slot.attachmentName || (slot.attachments[0] ? slot.attachments[0].name : null);
  }
  promoteLegacySlotMeshState(slot, { clearLegacy: true, overwriteAttachment: false });
  const active = slot.activeAttachment != null ? String(slot.activeAttachment) : null;
  const activeEntry = active ? slot.attachments.find((a) => a.name === active) : null;
  if (activeEntry) { const syncAtt = getActiveAttachment(slot); if (syncAtt) syncAtt.canvas = activeEntry.canvas; }
  if (Object.prototype.hasOwnProperty.call(slot, "canvas")) delete slot["canvas"];
  return slot.attachments;
}

function getSlotAttachmentEntry(slot, name) {
  if (!slot) return null;
  const list = ensureSlotAttachments(slot);
  const key = name == null ? null : String(name);
  if (key == null) return null;
  return list.find((a) => a.name === key) || null;
}

function getSlotCurrentAttachmentName(slot) {
  ensureSlotAttachmentState(slot);
  ensureSlotAttachments(slot);
  return slot.activeAttachment != null ? String(slot.activeAttachment) : null;
}

function isSlotEditorVisible(slot) {
  if (!slot) return false;
  if (Object.prototype.hasOwnProperty.call(slot, "editorVisible")) return slot.editorVisible !== false;
  return slot.visible !== false;
}

function hasActiveAttachment(slot) {
  return !!(slot && getSlotCurrentAttachmentName(slot));
}

function hasRenderableAttachment(slot) {
  if (!slot || !isSlotEditorVisible(slot)) return false;
  const name = getSlotCurrentAttachmentName(slot);
  if (!name) return false;
  const att = getSlotAttachmentEntry(slot, name);
  if (!att) return false;
  const type = normalizeAttachmentType(att.type);
  if (type === "point" || type === "boundingbox") return false;
  return !!att.canvas;
}

function ensureSlotClipState(slot) {
  if (!slot) return;
  const att = getActiveAttachment(slot);
  if (!att) return;
  att.clipEnabled = !!att.clipEnabled;
  att.clipSource = att.clipSource === "contour" ? "contour" : "fill";
  if (att.clipEndSlotId == null || att.clipEndSlotId === "") att.clipEndSlotId = null;
  else att.clipEndSlotId = String(att.clipEndSlotId);
}

function getSlotClipPointsLocal(slot) {
  if (!slot) return [];
  const att = getActiveAttachment(slot);
  if (!att || !att.clipEnabled) return [];
  ensureSlotClipState(slot);
  const c = ensureSlotContour(slot);
  if (!c || !c.closed) return [];
  const src =
    att.clipSource === "contour"
      ? Array.isArray(c.points)
        ? c.points
        : []
      : Array.isArray(c.fillPoints) && c.fillPoints.length >= 3
        ? c.fillPoints
        : Array.isArray(c.points)
          ? c.points
          : [];
  if (!Array.isArray(src) || src.length < 3) return [];
  return src.map((p) => ({ x: Number(p && p.x) || 0, y: Number(p && p.y) || 0 }));
}

function addContourSlotFromActiveSlot(sourceSlot) {
  if (!sourceSlot) return null;
  const sourceWeightMode = getSlotWeightMode(sourceSlot);
  const sourceAtt = getActiveAttachment(sourceSlot);
  const sourceCanvas = getSlotCanvas(sourceSlot);
  const rectSrc = sourceSlot.rect || { x: 0, y: 0, w: sourceCanvas ? sourceCanvas.width : 1, h: sourceCanvas ? sourceCanvas.height : 1 };
  const rect = {
    x: Number(rectSrc.x) || 0,
    y: Number(rectSrc.y) || 0,
    w: Math.max(1, Number(rectSrc.w) || 1),
    h: Math.max(1, Number(rectSrc.h) || 1),
  };
  const slot = {
    id: makeSlotId(),
    name: makeUniqueSlotName(`${sourceSlot.name || "slot"}_contour`),
    attachmentName: String(sourceSlot.attachmentName || "main"),
    placeholderName: String(sourceSlot.placeholderName || sourceSlot.attachmentName || "main"),
    activeAttachment:
      sourceSlot && Object.prototype.hasOwnProperty.call(sourceSlot, "activeAttachment")
        ? sourceSlot.activeAttachment == null
          ? null
          : String(sourceSlot.activeAttachment)
        : String(sourceSlot.attachmentName || "main"),
    editorVisible:
      sourceSlot && Object.prototype.hasOwnProperty.call(sourceSlot, "editorVisible")
        ? sourceSlot.editorVisible !== false
        : sourceSlot.visible !== false,
    bone: sourceWeightMode === "weighted" ? (Number.isFinite(sourceSlot.bone) ? sourceSlot.bone : -1) : -1,
    visible: sourceSlot.visible !== false,
    alpha: Number.isFinite(sourceSlot.alpha) ? math.clamp(sourceSlot.alpha, 0, 1) : 1,
    r: Number.isFinite(sourceSlot.r) ? math.clamp(sourceSlot.r, 0, 1) : 1,
    g: Number.isFinite(sourceSlot.g) ? math.clamp(sourceSlot.g, 0, 1) : 1,
    b: Number.isFinite(sourceSlot.b) ? math.clamp(sourceSlot.b, 0, 1) : 1,
    blend: normalizeSlotBlendMode(sourceSlot && sourceSlot.blend),
    darkEnabled: !!(sourceSlot && sourceSlot.darkEnabled),
    dr: Number.isFinite(sourceSlot && sourceSlot.dr) ? math.clamp(sourceSlot.dr, 0, 1) : 0,
    dg: Number.isFinite(sourceSlot && sourceSlot.dg) ? math.clamp(sourceSlot.dg, 0, 1) : 0,
    db: Number.isFinite(sourceSlot && sourceSlot.db) ? math.clamp(sourceSlot.db, 0, 1) : 0,
    tx: Number(sourceSlot.tx) || 0,
    ty: Number(sourceSlot.ty) || 0,
    rot: Number(sourceSlot.rot) || 0,
    baseImageTransform: normalizeBaseImageTransform(sourceSlot && sourceSlot.baseImageTransform),
    rect,
    docWidth: Number.isFinite(sourceSlot.docWidth) ? sourceSlot.docWidth : state.imageWidth,
    docHeight: Number.isFinite(sourceSlot.docHeight) ? sourceSlot.docHeight : state.imageHeight,
    _indices: null,
    meshData: null,
    attachments: Array.isArray(sourceSlot.attachments) && sourceSlot.attachments.length > 0
      ? sourceSlot.attachments
        .map((a) => ({
          name: String(a && a.name ? a.name : "").trim(),
          placeholder: String(a && a.placeholder ? a.placeholder : sourceSlot.placeholderName || sourceSlot.attachmentName || "main").trim(),
          // Preserve explicitly-null canvas (broken attachment); only
          // fall back to sourceCanvas when the attachment had no canvas
          // property at all.
          canvas:
            a && a.canvas ? a.canvas
              : (a && Object.prototype.hasOwnProperty.call(a, "canvas") && a.canvas === null) ? null
                : sourceCanvas,
          type: normalizeAttachmentType(a && a.type),
          linkedParent: a && a.linkedParent != null ? String(a.linkedParent) : "",
          inheritTimelines: !!(a && a.inheritTimelines),
          pointX: Number(a && a.pointX) || 0,
          pointY: Number(a && a.pointY) || 0,
          pointRot: Number(a && a.pointRot) || 0,
          bboxSource: a && a.bboxSource === "contour" ? "contour" : "fill",
          sequence:
            a && a.sequence
              ? {
                enabled: !!a.sequence.enabled,
                count: Math.max(1, Math.round(Number(a.sequence.count) || 1)),
                start: Math.max(0, Math.round(Number(a.sequence.start) || 0)),
                digits: Math.max(1, Math.round(Number(a.sequence.digits) || 2)),
              }
              : { enabled: false, count: 1, start: 0, digits: 2 },
        }))
        // Keep visual-but-canvas:null entries (broken attachments visible
        // to the user); renderers skip them via hasRenderableAttachment.
        .filter((a) => a.name.length > 0)
      : [
        {
          name: String(sourceSlot.attachmentName || "main"),
          placeholder: String(sourceSlot.placeholderName || sourceSlot.attachmentName || "main"),
          canvas: sourceCanvas,
          type: "region",
          linkedParent: "",
          pointX: 0,
          pointY: 0,
          pointRot: 0,
          bboxSource: "fill",
          sequence: { enabled: false, count: 1, start: 0, digits: 2 },
        },
      ],
    useWeights: sourceWeightMode !== "free",
    weightBindMode: sourceAtt && sourceAtt.weightBindMode ? String(sourceAtt.weightBindMode) : sourceWeightMode === "weighted" ? "auto" : sourceWeightMode === "single" ? "single" : "none",
    weightMode: sourceAtt && sourceAtt.weightMode ? String(sourceAtt.weightMode) : sourceWeightMode,
    influenceBones:
      sourceWeightMode === "weighted"
        ? Array.isArray(sourceAtt && sourceAtt.influenceBones)
          ? sourceAtt.influenceBones.filter((v) => Number.isFinite(v))
          : []
        : [],
    clipEnabled: !!(sourceAtt && sourceAtt.clipEnabled),
    clipSource: sourceAtt && sourceAtt.clipSource === "contour" ? "contour" : "fill",
    clipEndSlotId:
      sourceAtt && Object.prototype.hasOwnProperty.call(sourceAtt, "clipEndSlotId")
        ? sourceAtt.clipEndSlotId == null
          ? null
          : String(sourceAtt.clipEndSlotId)
        : null,
    meshContour: {
      points: [],
      sourcePoints: [],
      authorContourPoints: [],
      closed: false,
      triangles: [],
      fillPoints: [],
      fillTriangles: [],
      manualEdges: [],
      fillManualEdges: [],
    },
  };
  ensureSlotAttachments(slot);
  ensureSlotAttachmentState(slot);
  if (state.mesh) {
    const activeAtt = getActiveAttachment(slot);
    if (activeAtt && !activeAtt.meshData) {
      activeAtt.meshData = createSlotMeshData(rect, slot.docWidth || rect.w, slot.docHeight || rect.h, state.mesh.cols, state.mesh.rows);
    }
    rebuildSlotWeights(slot, state.mesh);
  }
  ensureSlotClipState(slot);
  ensureSlotVisualState(slot);
  state.slots.push(slot);
  if (state.mesh) ensureSlotsHaveBoneBinding();
  rebuildSlotTriangleIndices();
  setActiveSlot(state.slots.length - 1);
  return slot;
}
