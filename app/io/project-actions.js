// Split from app.js
// Part: Save/load/export action bindings
// Original source: app/05-bindings-file-tree.js (segment 3)
if (els.fileSaveBtn) {
  els.fileSaveBtn.addEventListener("click", () => {
    const payload = buildProjectPayload();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "mesh_deformer_project.json";
    a.click();
    URL.revokeObjectURL(a.href);
    saveAutosaveSnapshot("manual_save", true);
    setStatus(`Project saved (JSON, ${payload.slotImages.length} embedded image(s)).`);
  });
}

if (els.fileLoadBtn) {
  els.fileLoadBtn.addEventListener("click", () => {
    els.projectLoadInput.click();
  });
}

if (els.fileExportSpineBtn) {
  els.fileExportSpineBtn.addEventListener("click", async () => {
    try {
      await exportSpineData();
    } catch (err) {
      setStatus(`Spine export failed: ${err.message}`);
      console.error(err);
    }
  });
}

async function handleProjectLoadInputChange(e) {
  const f = e.target.files?.[0];
  if (!f) return;
  try {
    const data = JSON.parse(await f.text());
    if (Number.isFinite(Number(data.gridX))) els.gridX.value = String(math.clamp(Number(data.gridX), 2, 120));
    if (Number.isFinite(Number(data.gridY))) els.gridY.value = String(math.clamp(Number(data.gridY), 2, 120));
    state.slotMesh.gridReplaceContour = !!(data && data.slotMeshGridReplaceContour);
    if (els.slotMeshGridReplaceContour) els.slotMeshGridReplaceContour.checked = !!state.slotMesh.gridReplaceContour;
    state.baseImageTransform = normalizeBaseImageTransform(data && data.baseImageTransform);
    const loadedCompat = getSpineCompatPreset(
      (data && data.export && data.export.spineCompat) || (data && data.spineCompat) || (state.export && state.export.spineCompat)
    );
    state.export.spineCompat = loadedCompat.id;
    if (els.spineCompat) els.spineCompat.value = loadedCompat.id;
    const hasEmbeddedImages = Array.isArray(data.slotImages) && data.slotImages.length > 0;
    if (hasEmbeddedImages) {
      const decoded = [];
      for (const src of data.slotImages) {
        if (typeof src !== "string" || src.length === 0) continue;
        decoded.push(await canvasFromDataUrl(src));
      }
      if (decoded.length === 0) throw new Error("Project has slotImages but none could be decoded.");
      state.mesh = null;
      state.slots = [];
      state.activeSlot = -1;
      state.sourceCanvas = null;
      state.imageWidth = Number(data.imageWidth) || decoded[0].width;
      state.imageHeight = Number(data.imageHeight) || decoded[0].height;
      const srcSlots = Array.isArray(data.slots) ? data.slots : [];
      if (srcSlots.length === 0) {
        addSlotEntry(
          {
            name: "base",
            canvas: decoded[0],
            docWidth: state.imageWidth,
            docHeight: state.imageHeight,
            rect: { x: 0, y: 0, w: decoded[0].width, h: decoded[0].height },
          },
          false
        );
      } else {
        for (const src of srcSlots) {
          const imgIdx = Number(src && src.imageIndex);
          const c = Number.isFinite(imgIdx) && imgIdx >= 0 && imgIdx < decoded.length ? decoded[imgIdx] : decoded[0];
          addSlotEntry(
            {
              name: src && src.name ? src.name : undefined,
              id: src && src.id ? String(src.id) : undefined,
              attachmentName: src && src.attachmentName ? String(src.attachmentName) : undefined,
              placeholderName: src && src.placeholderName ? String(src.placeholderName) : undefined,
              attachments:
                src && Array.isArray(src.attachments)
                  ? src.attachments
                    .map((a) => {
                      const ai = Number(a && a.imageIndex);
                      const ac =
                        Number.isFinite(ai) && ai >= 0 && ai < decoded.length
                          ? decoded[ai]
                          : c;
                      return {
                        name: String(a && a.name ? a.name : "").trim(),
                        placeholder: String(a && a.placeholder ? a.placeholder : src && src.placeholderName ? src.placeholderName : src && src.attachmentName ? src.attachmentName : "main").trim(),
                        canvas: ac,
                        type: normalizeAttachmentType(a && a.type),
                        linkedParent: a && a.linkedParent != null ? String(a.linkedParent) : "",
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
                        useWeights: !!(a && a.useWeights),
                        weightBindMode: a && a.weightBindMode ? String(a.weightBindMode) : "none",
                        weightMode: a && a.weightMode ? String(a.weightMode) : "free",
                        influenceBones: Array.isArray(a && a.influenceBones) ? a.influenceBones : [],
                        clipEnabled: !!(a && a.clipEnabled),
                        clipSource: a && a.clipSource === "contour" ? "contour" : "fill",
                        clipEndSlotId:
                          a && Object.prototype.hasOwnProperty.call(a, "clipEndSlotId")
                            ? a.clipEndSlotId == null
                              ? null
                              : String(a.clipEndSlotId)
                            : null,
                        meshData: a && a.meshData ? cloneSlotMeshData(a.meshData) : null,
                        meshContour: a && a.meshContour ? JSON.parse(JSON.stringify(a.meshContour)) : undefined,
                        baseImageTransform: normalizeBaseImageTransform(a && a.baseImageTransform),
                        rect:
                          a && a.rect && Number.isFinite(a.rect.w) && Number.isFinite(a.rect.h)
                            ? {
                              x: Number(a.rect.x) || 0,
                              y: Number(a.rect.y) || 0,
                              w: Math.max(1, Number(a.rect.w) || 1),
                              h: Math.max(1, Number(a.rect.h) || 1),
                            }
                            : null,
                      };
                    })
                    .filter((a) => a.name.length > 0 && !!a.canvas)
                  : undefined,
              activeAttachment:
                src && Object.prototype.hasOwnProperty.call(src, "activeAttachment")
                  ? src.activeAttachment == null
                    ? null
                    : String(src.activeAttachment)
                  : undefined,
              editorVisible:
                src && Object.prototype.hasOwnProperty.call(src, "editorVisible")
                  ? src.editorVisible !== false
                  : src
                    ? src.visible !== false
                    : true,
              canvas: c,
              bone: Number(src && src.bone),
              visible: src ? src.visible !== false : true,
              alpha: src ? Number(src.alpha) : 1,
              r: src ? Number(src.r) : 1,
              g: src ? Number(src.g) : 1,
              b: src ? Number(src.b) : 1,
              blend: src ? normalizeSlotBlendMode(src.blend) : "normal",
              darkEnabled: !!(src && src.darkEnabled),
              dr: src ? Number(src.dr) : 0,
              dg: src ? Number(src.dg) : 0,
              db: src ? Number(src.db) : 0,
              tx: src ? Number(src.tx) : 0,
              ty: src ? Number(src.ty) : 0,
              rot: src ? Number(src.rot) : 0,
              baseImageTransform: normalizeBaseImageTransform(src && src.baseImageTransform),
              useWeights: !!(src && src.useWeights),
              weightBindMode: src && src.weightBindMode ? src.weightBindMode : "none",
              weightMode: src && src.weightMode ? src.weightMode : "free",
              influenceBones: Array.isArray(src && src.influenceBones) ? src.influenceBones : [],
              clipEnabled: !!(src && src.clipEnabled),
              clipSource: src && src.clipSource === "contour" ? "contour" : "fill",
              clipEndSlotId:
                src && Object.prototype.hasOwnProperty.call(src, "clipEndSlotId")
                  ? src.clipEndSlotId == null
                    ? null
                    : String(src.clipEndSlotId)
                  : null,
              meshContour: src && src.meshContour ? JSON.parse(JSON.stringify(src.meshContour)) : undefined,
              rect:
                src && src.rect && Number.isFinite(src.rect.w) && Number.isFinite(src.rect.h)
                  ? {
                    x: Number(src.rect.x) || 0,
                    y: Number(src.rect.y) || 0,
                    w: Math.max(1, Number(src.rect.w) || 1),
                    h: Math.max(1, Number(src.rect.h) || 1),
                  }
                  : { x: 0, y: 0, w: c.width, h: c.height },
              docWidth: Number(src && src.docWidth) || state.imageWidth,
              docHeight: Number(src && src.docHeight) || state.imageHeight,
            },
            false
          );
        }
      }
      if (srcSlots.length > 0) {
        const hasPerSlotBaseTransform = srcSlots.some((s) => s && s.baseImageTransform && typeof s.baseImageTransform === "object");
        if (!hasPerSlotBaseTransform && data && data.baseImageTransform && typeof data.baseImageTransform === "object") {
          const legacyBase = normalizeBaseImageTransform(data.baseImageTransform);
          for (const s of state.slots) {
            if (!s) continue;
            s.baseImageTransform = normalizeBaseImageTransform(legacyBase);
          }
        }
      }
      const targetSlot = Number.isFinite(Number(data.activeSlot))
        ? math.clamp(Number(data.activeSlot), 0, Math.max(0, state.slots.length - 1))
        : 0;
      setActiveSlot(targetSlot);
    } else if (!state.sourceCanvas && state.slots.length === 0) {
      setStatus("No embedded images in file. Import image/PSD first, then load this legacy project json.");
      return;
    }

    const loadedRigCoordinateSpace =
      data && data.rigCoordinateSpace === "edit"
        ? "edit"
        : data && data.rigCoordinateSpace === "runtime"
          ? "runtime"
          : state.boneMode === "edit"
            ? "edit"
            : "runtime";

    rebuildMesh();
    if (state.mesh) {
      state.rigCoordinateSpace = loadedRigCoordinateSpace;
      state.rigEditNeedsRuntimeNormalize = false;
      clearRigEditPreviewCache();
    }
    if (state.mesh && Array.isArray(data.rigBones)) {
      state.mesh.rigBones = cloneBones(data.rigBones);
      syncPoseFromRig(state.mesh);
      syncBindPose(state.mesh);
    }
    if (state.mesh && Array.isArray(data.ikConstraints)) {
      state.mesh.ikConstraints = data.ikConstraints.map((c, i) => ({
        name: c && c.name ? String(c.name) : `ik_${i}`,
        bones: Array.isArray(c && c.bones) ? c.bones.map((v) => Number(v)).filter((v) => Number.isFinite(v)) : [],
        target: Number(c && c.target),
        targetX: Number(c && c.targetX),
        targetY: Number(c && c.targetY),
        mix: math.clamp(Number(c && c.mix) || 1, 0, 1),
        softness: Math.max(0, Number(c && c.softness) || 0),
        bendPositive: c ? c.bendPositive !== false : true,
        compress: !!(c && c.compress),
        stretch: !!(c && c.stretch),
        uniform: !!(c && c.uniform),
        order: getConstraintOrder(c, i),
        skinRequired: !!(c && c.skinRequired),
        enabled: c ? c.enabled !== false : true,
        endMode: c && c.endMode === "tail" ? "tail" : "head",
      }));
      ensureIKConstraints(state.mesh);
    }
    if (state.mesh && Array.isArray(data.transformConstraints)) {
      state.mesh.transformConstraints = data.transformConstraints.map((c, i) => ({
        name: c && c.name ? String(c.name) : `transform_${i}`,
        bones: Array.isArray(c && c.bones) ? c.bones.map((v) => Number(v)).filter((v) => Number.isFinite(v)) : [],
        target: Number(c && c.target),
        rotateMix: math.clamp(Number(c && c.rotateMix) || 0, 0, 1),
        translateMix: math.clamp(Number(c && c.translateMix) || 0, 0, 1),
        scaleMix: math.clamp(Number(c && c.scaleMix) || 0, 0, 1),
        shearMix: math.clamp(Number(c && c.shearMix) || 0, 0, 1),
        offsetX: Number(c && c.offsetX) || 0,
        offsetY: Number(c && c.offsetY) || 0,
        offsetRot: Number(c && c.offsetRot) || 0,
        offsetScaleX: Number(c && c.offsetScaleX) || 0,
        offsetScaleY: Number(c && c.offsetScaleY) || 0,
        offsetShearY: Number(c && c.offsetShearY) || 0,
        local: !!(c && c.local),
        relative: !!(c && c.relative),
        order: getConstraintOrder(c, i),
        skinRequired: !!(c && c.skinRequired),
        enabled: c ? c.enabled !== false : true,
      }));
      ensureTransformConstraints(state.mesh);
    }
    if (state.mesh && Array.isArray(data.pathConstraints)) {
      state.mesh.pathConstraints = data.pathConstraints.map((c, i) => ({
        name: c && c.name ? String(c.name) : `path_${i}`,
        bones: Array.isArray(c && c.bones) ? c.bones.map((v) => Number(v)).filter((v) => Number.isFinite(v)) : [],
        target: Number(c && c.target),
        sourceType: c && c.sourceType === "bone_chain" ? "bone_chain" : c && c.sourceType === "slot" ? "slot" : "drawn",
        targetSlot: Number(c && c.targetSlot),
        points: Array.isArray(c && c.points)
          ? c.points.map((p) => ({
            x: Number(p && p.x) || 0,
            y: Number(p && p.y) || 0,
            hinx: Number.isFinite(Number(p && p.hinx)) ? Number(p.hinx) : Number(p && p.x) || 0,
            hiny: Number.isFinite(Number(p && p.hiny)) ? Number(p.hiny) : Number(p && p.y) || 0,
            houtx: Number.isFinite(Number(p && p.houtx)) ? Number(p.houtx) : Number(p && p.x) || 0,
            houty: Number.isFinite(Number(p && p.houty)) ? Number(p.houty) : Number(p && p.y) || 0,
            broken: !!(p && p.broken),
            handleMode: p && p.handleMode === "auto" ? "auto" : p && p.handleMode === "broken" ? "broken" : "aligned",
          }))
          : [],
        positionMode: c && c.positionMode === "percent" ? "percent" : "fixed",
        spacingMode:
          c && c.spacingMode === "fixed"
            ? "fixed"
            : c && c.spacingMode === "percent"
              ? "percent"
              : c && c.spacingMode === "proportional"
                ? "proportional"
                : "length",
        rotateMode: c && c.rotateMode === "chain" ? "chain" : c && c.rotateMode === "chainScale" ? "chainScale" : "tangent",
        position: Number(c && c.position) || 0,
        spacing: Number(c && c.spacing) || 0,
        rotateMix: math.clamp(Number(c && c.rotateMix) || 0, 0, 1),
        translateMix: math.clamp(Number(c && c.translateMix) || 0, 0, 1),
        skinRequired: !!(c && c.skinRequired),
        closed: !!(c && c.closed),
        order: getConstraintOrder(c, i),
        enabled: c ? c.enabled !== false : true,
      }));
      ensurePathConstraints(state.mesh);
    }
    if (Array.isArray(data.animations) && data.animations.length > 0) {
      state.anim.animations = data.animations.map((a, i) => normalizeAnimationRecord(a, `Anim ${i + 1}`));
      state.anim.currentAnimId = state.anim.animations[0].id;
    }
    if (data && data.animationState && Array.isArray(data.animationState.layerTracks)) {
      state.anim.layerTracks = data.animationState.layerTracks.map((t, i) => ({
        id: t && t.id ? String(t.id) : makeLayerTrackId(),
        name: t && t.name ? String(t.name) : `Layer ${i + 1}`,
        enabled: t ? t.enabled !== false : true,
        animId: t && t.animId ? String(t.animId) : "",
        loop: t ? t.loop !== false : true,
        speed: Number.isFinite(Number(t && t.speed)) ? math.clamp(Number(t && t.speed), -10, 10) : 1,
        offset: Number(t && t.offset) || 0,
        alpha: math.clamp(Number(t && t.alpha) || 0, 0, 1),
        mode: t && t.mode === "add" ? "add" : "replace",
        maskMode: t && (t.maskMode === "include" || t.maskMode === "exclude") ? t.maskMode : "all",
        maskBones: Array.isArray(t && t.maskBones) ? t.maskBones.map((v) => Number(v)).filter((v) => Number.isFinite(v)) : [],
      }));
      state.anim.selectedLayerTrackId = String(data.animationState.selectedLayerTrackId || "");
      state.anim.batchExportOpen = !!data.animationState.batchExportOpen;
      if (data.animationState.batchExport && typeof data.animationState.batchExport === "object") {
        const be = data.animationState.batchExport;
        state.anim.batchExport = {
          format: be.format === "gif" || be.format === "pngseq" ? be.format : "webm",
          fps: Math.max(1, Math.min(60, Math.round(Number(be.fps) || 15))),
          prefix: String(be.prefix || "batch"),
          retries: Math.max(0, Math.min(5, Math.round(Number(be.retries) || 1))),
          delayMs: Math.max(0, Math.min(5000, Math.round(Number(be.delayMs) || 120))),
          zipPng: be.zipPng !== false,
        };
      } else {
        state.anim.batchExport = {
          format: "webm",
          fps: 15,
          prefix: "batch",
          retries: 1,
          delayMs: 120,
          zipPng: true,
        };
      }
    } else {
      state.anim.layerTracks = [];
      state.anim.selectedLayerTrackId = "";
      state.anim.batchExportOpen = false;
      state.anim.batchExport = {
        format: "webm",
        fps: 15,
        prefix: "batch",
        retries: 1,
        delayMs: 120,
        zipPng: true,
      };
    }
    if (data && data.animationState && data.animationState.stateMachine && typeof data.animationState.stateMachine === "object") {
      state.anim.stateMachine = data.animationState.stateMachine;
    } else {
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
    }
    if (data && data.animationState && data.animationState.onionSkin && typeof data.animationState.onionSkin === "object") {
      state.anim.onionSkin = data.animationState.onionSkin;
    } else {
      state.anim.onionSkin = {
        enabled: false,
        prevFrames: 2,
        nextFrames: 2,
        alpha: 0.22,
      };
    }
    ensureOnionSkinSettings();
    state.anim.groupMute = {};
    state.anim.groupSolo = {};
    state.anim.filterText = "";
    state.anim.onlyKeyed = false;
    if (Array.isArray(data.slots) && state.slots.length > 0) {
      for (let i = 0; i < state.slots.length && i < data.slots.length; i += 1) {
        const src = data.slots[i] || {};
        const dst = state.slots[i];
        dst.name = src.name || dst.name;
        dst.id = src.id ? String(src.id) : dst.id || makeSlotId();
        dst.attachmentName = src.attachmentName ? String(src.attachmentName) : dst.attachmentName || "main";
        dst.placeholderName = src.placeholderName ? String(src.placeholderName) : dst.placeholderName || dst.attachmentName || "main";
        dst.activeAttachment =
          Object.prototype.hasOwnProperty.call(src, "activeAttachment")
            ? src.activeAttachment == null
              ? null
              : String(src.activeAttachment)
            : String(dst.attachmentName || "main");
        if (Array.isArray(src.attachments) && Array.isArray(dst.attachments)) {
          const srcByName = new Map(
            src.attachments
              .filter((a) => a && a.name)
              .map((a) => [
                String(a.name),
                {
                  placeholder: String(a.placeholder || dst.placeholderName || dst.attachmentName || "main"),
                  type: normalizeAttachmentType(a.type),
                  linkedParent: a.linkedParent != null ? String(a.linkedParent) : "",
                  pointX: Number(a.pointX) || 0,
                  pointY: Number(a.pointY) || 0,
                  pointRot: Number(a.pointRot) || 0,
                  bboxSource: a && a.bboxSource === "contour" ? "contour" : "fill",
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
                  meshData: a && a.meshData ? restoreSlotMeshDataFromPayload(a.meshData, state.mesh ? state.mesh.rigBones.length : 0) : null,
                  meshContour: a && a.meshContour && Array.isArray(a.meshContour.points) ? JSON.parse(JSON.stringify(a.meshContour)) : null,
                  baseImageTransform: normalizeBaseImageTransform(a && a.baseImageTransform),
                  rect:
                    a && a.rect && Number.isFinite(a.rect.w) && Number.isFinite(a.rect.h)
                      ? {
                        x: Number(a.rect.x) || 0,
                        y: Number(a.rect.y) || 0,
                        w: Math.max(1, Number(a.rect.w) || 1),
                        h: Math.max(1, Number(a.rect.h) || 1),
                      }
                      : null,
                  sequence:
                    a && a.sequence
                      ? {
                        enabled: !!a.sequence.enabled,
                        count: Math.max(1, Math.round(Number(a.sequence.count) || 1)),
                        start: Math.max(0, Math.round(Number(a.sequence.start) || 0)),
                        digits: Math.max(1, Math.round(Number(a.sequence.digits) || 2)),
                        setupIndex: Math.max(0, Math.round(Number(a.sequence.setupIndex) || 0)),
                        mode: Number(a.sequence.mode) || 0,
                        path: String(a.sequence.path || ""),
                      }
                      : { enabled: false, count: 1, start: 0, digits: 2, setupIndex: 0, mode: 0, path: "" },
                },
              ])
          );
          for (const a of dst.attachments) {
            if (!a || !a.name) continue;
            const meta = srcByName.get(String(a.name));
            a.placeholder = meta ? meta.placeholder : String(a.placeholder || dst.placeholderName || dst.attachmentName || "main");
            if (meta) {
              a.type = meta.type;
              a.linkedParent = meta.linkedParent;
              a.pointX = meta.pointX;
              a.pointY = meta.pointY;
              a.pointRot = meta.pointRot;
              a.bboxSource = meta.bboxSource;
              a.useWeights = meta.useWeights;
              a.weightBindMode = meta.weightBindMode;
              a.weightMode = meta.weightMode;
              a.influenceBones = Array.isArray(meta.influenceBones) ? meta.influenceBones.slice() : [];
              a.clipEnabled = meta.clipEnabled;
              a.clipSource = meta.clipSource;
              a.clipEndSlotId = meta.clipEndSlotId;
              if (meta.meshData) a.meshData = meta.meshData;
              if (meta.meshContour) a.meshContour = JSON.parse(JSON.stringify(meta.meshContour));
              if (meta.baseImageTransform) a.baseImageTransform = normalizeBaseImageTransform(meta.baseImageTransform);
              if (meta.rect) a.rect = JSON.parse(JSON.stringify(meta.rect));
              a.sequence = meta.sequence;
            }
          }
        }
        dst.editorVisible = Object.prototype.hasOwnProperty.call(src, "editorVisible")
          ? src.editorVisible !== false
          : src.visible !== false;
        dst.bone = Number.isFinite(src.bone) ? src.bone : dst.bone;
        dst.visible = dst.editorVisible;
        dst.alpha = Number.isFinite(src.alpha) ? math.clamp(src.alpha, 0, 1) : 1;
        dst.r = Number.isFinite(src.r) ? math.clamp(src.r, 0, 1) : 1;
        dst.g = Number.isFinite(src.g) ? math.clamp(src.g, 0, 1) : 1;
        dst.b = Number.isFinite(src.b) ? math.clamp(src.b, 0, 1) : 1;
        dst.blend = normalizeSlotBlendMode(src && src.blend);
        dst.darkEnabled = !!(src && src.darkEnabled);
        dst.dr = Number.isFinite(src && src.dr) ? math.clamp(src.dr, 0, 1) : 0;
        dst.dg = Number.isFinite(src && src.dg) ? math.clamp(src.dg, 0, 1) : 0;
        dst.db = Number.isFinite(src && src.db) ? math.clamp(src.db, 0, 1) : 0;
        dst.tx = Number.isFinite(src.tx) ? src.tx : 0;
        dst.ty = Number.isFinite(src.ty) ? src.ty : 0;
        dst.rot = Number.isFinite(src.rot) ? src.rot : 0;
        dst.useWeights = src.useWeights === true;
        dst.weightBindMode = src.weightBindMode || (dst.useWeights ? "single" : "none");
        dst.weightMode =
          src.weightMode ||
          (dst.weightBindMode === "auto" ? "weighted" : dst.useWeights ? "single" : "free");
        dst.influenceBones = Array.isArray(src.influenceBones)
          ? src.influenceBones.filter((v) => Number.isFinite(v))
          : [];
        // propagate weight fields to the active attachment (auto-weight reads/writes att.* not slot.*)
        { const _dstAtt = getActiveAttachment(dst); if (_dstAtt) { _dstAtt.useWeights = dst.useWeights; _dstAtt.weightBindMode = dst.weightBindMode; _dstAtt.weightMode = dst.weightMode; _dstAtt.influenceBones = dst.influenceBones.slice(); } }
        dst.clipEnabled = !!src.clipEnabled;
        dst.clipSource = src && src.clipSource === "contour" ? "contour" : "fill";
        dst.clipEndSlotId =
          Object.prototype.hasOwnProperty.call(src, "clipEndSlotId")
            ? src.clipEndSlotId == null
              ? null
              : String(src.clipEndSlotId)
            : null;
        if (src.rect && Number.isFinite(src.rect.w) && Number.isFinite(src.rect.h)) {
          dst.rect = {
            x: Number(src.rect.x) || 0,
            y: Number(src.rect.y) || 0,
            w: Math.max(1, Number(src.rect.w) || 1),
            h: Math.max(1, Number(src.rect.h) || 1),
          };
        }
        if (src.meshContour && Array.isArray(src.meshContour.points)) {
          const restoredContour = {
            points: src.meshContour.points.map((p) => ({ x: Number(p.x) || 0, y: Number(p.y) || 0 })),
            sourcePoints: Array.isArray(src.meshContour.sourcePoints)
              ? src.meshContour.sourcePoints.map((p) => ({ x: Number(p.x) || 0, y: Number(p.y) || 0 }))
              : [],
            authorContourPoints: Array.isArray(src.meshContour.authorContourPoints)
              ? src.meshContour.authorContourPoints.map((p) => ({ x: Number(p.x) || 0, y: Number(p.y) || 0 }))
              : [],
            closed: !!src.meshContour.closed,
            triangles: Array.isArray(src.meshContour.triangles)
              ? src.meshContour.triangles.map((v) => Number(v) || 0)
              : [],
            fillPoints: Array.isArray(src.meshContour.fillPoints)
              ? src.meshContour.fillPoints.map((p) => ({ x: Number(p.x) || 0, y: Number(p.y) || 0 }))
              : [],
            fillTriangles: Array.isArray(src.meshContour.fillTriangles)
              ? src.meshContour.fillTriangles.map((v) => Number(v) || 0)
              : [],
            manualEdges: Array.isArray(src.meshContour.manualEdges)
              ? src.meshContour.manualEdges
                .filter((e) => Array.isArray(e) && e.length >= 2)
                .map((e) => [Number(e[0]) || 0, Number(e[1]) || 0])
              : [],
            fillManualEdges: Array.isArray(src.meshContour.fillManualEdges)
              ? src.meshContour.fillManualEdges
                .filter((e) => Array.isArray(e) && e.length >= 2)
                .map((e) => [Number(e[0]) || 0, Number(e[1]) || 0])
              : [],
          };
          dst.meshContour = restoredContour;
          const dstAttContour = getActiveAttachment(dst);
          if (dstAttContour) dstAttContour.meshContour = JSON.parse(JSON.stringify(restoredContour));
          if (restoredContour.closed &&
            ((restoredContour.fillPoints && restoredContour.fillPoints.length >= 3) ||
              (restoredContour.points && restoredContour.points.length >= 3))) {
            applyContourMeshToSlot(dst);
          }
        } else {
          ensureSlotContour(dst);
        }
        dst.docWidth = Number.isFinite(src.docWidth) ? src.docWidth : state.imageWidth;
        dst.docHeight = Number.isFinite(src.docHeight) ? src.docHeight : state.imageHeight;
        if (state.mesh) {
          const restoredMeshData = restoreSlotMeshDataFromPayload(src.meshData, state.mesh.rigBones.length);
          if (restoredMeshData) {
            dst.meshData = restoredMeshData;
            // propagate to active attachment so att.meshData.weights is available for rendering
            const _dstAtt2 = getActiveAttachment(dst);
            if (_dstAtt2) _dstAtt2.meshData = restoredMeshData;
          } else {
            ensureSlotMeshData(dst, state.mesh);
          }
        }
        ensureSlotVisualState(dst);
      }
      if (Number.isFinite(data.activeSlot)) {
        state.activeSlot = math.clamp(Number(data.activeSlot), 0, state.slots.length - 1);
      }
      rebuildSlotTriangleIndices();
    }
    state.slotViewMode = "all";
    state.boneTreeSelectedSlotByBone = Object.create(null);
    state.skinSets = Array.isArray(data.skinSets)
      ? data.skinSets.map((s, i) => ({
        id: s && s.id ? String(s.id) : makeSkinSetId(),
        name: s && s.name ? String(s.name) : `skin_${i}`,
        slotAttachments:
          s && s.slotAttachments && typeof s.slotAttachments === "object"
            ? Object.fromEntries(
              Object.entries(s.slotAttachments).map(([k, v]) => [String(k), v == null ? null : String(v)])
            )
            : {},
        slotPlaceholderAttachments:
          s && s.slotPlaceholderAttachments && typeof s.slotPlaceholderAttachments === "object"
            ? Object.fromEntries(
              Object.entries(s.slotPlaceholderAttachments).map(([slotId, map]) => [
                String(slotId),
                map && typeof map === "object"
                  ? Object.fromEntries(Object.entries(map).map(([ph, v]) => [String(ph), v == null ? null : String(v)]))
                  : {},
              ])
            )
            : {},
      }))
      : [];
    state.selectedSkinSet = Number.isFinite(Number(data.selectedSkinSet)) ? Number(data.selectedSkinSet) : 0;
    ensureSkinSets();
    const sysModeAfterLoad = els.systemMode ? String(els.systemMode.value || "setup") : "setup";
    if (state.mesh) {
      if (sysModeAfterLoad === "animate") {
        state.uiPage = "anim";
        state.animSubPanel = "timeline";
        state.boneMode = state.editMode === "object" ? "object" : "pose";
        if (state.boneMode === "pose") {
          if (state.rigCoordinateSpace !== "runtime") {
            if (!normalizeRigEditForRuntime(state.mesh)) state.rigCoordinateSpace = "runtime";
          } else {
            syncPoseFromRig(state.mesh);
            syncBindPose(state.mesh);
          }
          samplePoseAtTime(state.mesh, state.anim.time);
        }
      } else {
        state.boneMode = state.editMode === "object" ? "object" : "edit";
        if (state.boneMode === "edit") {
          if (state.rigCoordinateSpace !== "edit") {
            if (!normalizeRigRuntimeForEdit(state.mesh)) state.rigCoordinateSpace = "edit";
          } else {
            syncPoseFromRig(state.mesh);
            syncBindPose(state.mesh);
          }
        } else if (state.rigCoordinateSpace !== "runtime") {
          if (!normalizeRigEditForRuntime(state.mesh)) state.rigCoordinateSpace = "runtime";
        } else {
          syncPoseFromRig(state.mesh);
          syncBindPose(state.mesh);
        }
      }
    }
    ensureSlotsHaveBoneBinding();
    if (!state.mesh) {
      state.rigCoordinateSpace = state.boneMode === "edit" ? "edit" : "runtime";
    }
    state.rigEditNeedsRuntimeNormalize = false;
    clearRigEditPreviewCache();
    rebuildSlotTriangleIndices();
    state.selectedBone = state.mesh && state.mesh.rigBones.length > 0 ? 0 : -1;
    refreshAnimationUI();
    refreshSlotUI();
    updateBoneUI();
    const restoredWeightIssues = collectWeightedAttachmentIssues();
    if (restoredWeightIssues.length > 0) {
      console.warn("Weighted attachment restore issues:", restoredWeightIssues);
      const first = restoredWeightIssues[0];
      setStatus(
        `Project loaded, but ${restoredWeightIssues.length} weighted attachment(s) restored with missing/incompatible weights. First: ${first.slotName}/${first.attachmentName || "(attachment)"}.`
      );
    } else {
      setStatus(`Project loaded${hasEmbeddedImages ? " (with embedded images)" : ""}.`);
    }
    if (!state.history.suspend) {
      state.history.undo = [];
      state.history.redo = [];
      state.history.lastSig = "";
      pushUndoCheckpoint(true);
    }
    saveAutosaveSnapshot("project_load", true);
  } catch (err) {
    setStatus(`Project load failed: ${err.message}`);
  } finally {
    e.target.value = "";
  }
}


