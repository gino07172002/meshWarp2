// ROLE: Spine JSON builder + pre-export validator. Walks state.mesh /
// state.slots / state.anim and produces the Spine 4.x skeleton JSON
// tree used by the .json file export, the .skel binary writer, and
// the in-app preview. Validation runs the result through compat-aware
// rule checks before write.
// EXPORTS:
//   - buildSpineJsonData(compatMode) → { json, slotExportInfos,
//       hasVertexTrack, hasWeightedSlot, skippedPathForExport, ... }
//   - validateSpineJsonForExport(spineJson, compatMode) → { errors, warnings }
// CONSUMERS: exportSpineData (in project-export.js), state-machine
//   bridge JSON, batch export.
// Loaded after project-export.js so it can use makeUniqueName,
//   colorHexToInt, getSkinEntries, and the SKEL helpers.

function buildSpineJsonData(compatMode = state.export && state.export.spineCompat) {
  const compat = getSpineCompatPreset(compatMode);
  if (!state.mesh) throw new Error("No mesh data. Import image/PSD first.");
  const bones = Array.isArray(state.mesh.rigBones) ? state.mesh.rigBones : [];
  if (bones.length === 0) throw new Error("No bones to export.");
  if (!Array.isArray(state.slots) || state.slots.length === 0) throw new Error("No slots to export.");

  const boneUsed = new Set();
  const slotUsed = new Set();
  const attachmentUsed = new Set();
  const animUsed = new Set();
  const boneNames = bones.map((b, i) => makeUniqueName(b && b.name ? b.name : `bone_${i}`, boneUsed, `bone_${i}`));
  const slotInfos = state.slots.map((s, i) => {
    ensureSlotAttachmentState(s);
    const list = ensureSlotAttachments(s);
    const si = {
      slot: s,
      index: i,
      name: makeUniqueName(s && s.name ? s.name : `slot_${i}`, slotUsed, `slot_${i}`),
      attachments: [],
      sourceToExport: new Map(),
      exportToSource: new Map(),
      placeholderToExport: new Map(),
      setupAttachmentName: null,
      setupAttachmentKey: null,
      setupPlaceholderName: null,
      activeAttachmentName: null,
    };
    for (const a of list) {
      const srcName = String(a && a.name ? a.name : "").trim();
      if (!srcName) continue;
      const expName = makeUniqueName(srcName, attachmentUsed, `${si.name}_att`);
      const srcPlaceholder = String(a && a.placeholder ? a.placeholder : s && s.placeholderName ? s.placeholderName : srcName).trim() || srcName;
      si.attachments.push({
        sourceName: srcName,
        exportName: expName,
        sourcePlaceholder: srcPlaceholder,
        canvas: a.canvas,
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
      });
      si.sourceToExport.set(srcName, expName);
      si.exportToSource.set(expName, srcName);
      if (srcPlaceholder && !si.placeholderToExport.has(srcPlaceholder)) si.placeholderToExport.set(srcPlaceholder, expName);
    }
    const setupSrc = String(s && s.attachmentName ? s.attachmentName : "").trim();
    const activeSrc = getSlotCurrentAttachmentName(s);
    si.setupAttachmentName =
      si.sourceToExport.get(setupSrc) || (si.attachments[0] ? si.attachments[0].exportName : null);
    const setupPlaceholderFromAttachment =
      (setupSrc && si.attachments.find((ae) => ae.sourceName === setupSrc)?.sourcePlaceholder) || "";
    si.setupPlaceholderName = String(s && s.placeholderName ? s.placeholderName : setupPlaceholderFromAttachment || setupSrc || "main");
    si.setupAttachmentKey = si.setupPlaceholderName || si.setupAttachmentName;
    si.activeAttachmentName = activeSrc ? si.sourceToExport.get(String(activeSrc)) || null : null;
    return si;
  });
  const clipTrackUsageBySlot = new Set();
  const clipEndTrackUsageBySlot = new Set();
  const clipEndValuesBySlot = new Map();
  for (const a of state.anim.animations || []) {
    const tracks = a && a.tracks ? a.tracks : {};
    for (const [trackId, keys] of Object.entries(tracks)) {
      const p = parseTrackId(trackId);
      if (!p || p.type !== "slot" || !Array.isArray(keys) || keys.length === 0) continue;
      if (p.prop === "clip") {
        clipTrackUsageBySlot.add(Number(p.slotIndex));
        continue;
      }
      if (p.prop === "clipEnd") {
        const si = Number(p.slotIndex);
        clipEndTrackUsageBySlot.add(si);
        if (!clipEndValuesBySlot.has(si)) clipEndValuesBySlot.set(si, new Set());
        const bucket = clipEndValuesBySlot.get(si);
        for (const k of keys) {
          const raw = k ? k.value : null;
          const endId = raw == null || raw === false || raw === "" ? "" : String(raw);
          bucket.add(endId);
        }
      }
    }
  }

  const outBones = bones.map((b, i) => {
    normalizeBoneChannels(b);
    const bone = { name: boneNames[i] };
    if (Number.isFinite(b.parent) && b.parent >= 0 && b.parent < bones.length) bone.parent = boneNames[b.parent];
    if (Number.isFinite(b.tx) && Math.abs(b.tx) > 1e-6) bone.x = Number(b.tx.toFixed(3));
    if (Number.isFinite(b.ty) && Math.abs(b.ty) > 1e-6) bone.y = Number(b.ty.toFixed(3));
    if (Number.isFinite(b.rot) && Math.abs(b.rot) > 1e-6) bone.rotation = Number(math.radToDeg(b.rot).toFixed(3));
    if (Number.isFinite(b.length) && b.length > 0) bone.length = Number(b.length.toFixed(3));
    if (Math.abs((Number(b.sx) || 1) - 1) > 1e-6) bone.scaleX = Number((Number(b.sx) || 1).toFixed(4));
    if (Math.abs((Number(b.sy) || 1) - 1) > 1e-6) bone.scaleY = Number((Number(b.sy) || 1).toFixed(4));
    if (Math.abs(Number(b.shx) || 0) > 1e-6) bone.shearX = Number(math.radToDeg(Number(b.shx) || 0).toFixed(4));
    if (Math.abs(Number(b.shy) || 0) > 1e-6) bone.shearY = Number(math.radToDeg(Number(b.shy) || 0).toFixed(4));
    const inheritMode = normalizeBoneInheritValue(b.inherit);
    if (inheritMode !== "normal") bone.inherit = inheritMode;
    return bone;
  });

  // Convert from canvas-style Y-down space to Spine Y-up space using a synthetic export root.
  const exportRootName = "__export_root_yup";
  outBones.unshift({
    name: exportRootName,
    y: Number((state.imageHeight || 0).toFixed(3)),
    scaleY: -1,
  });
  for (let i = 1; i < outBones.length; i += 1) {
    if (!outBones[i].parent) outBones[i].parent = exportRootName;
  }

  const outSlots = [];
  const outIk = [];
  const outTransform = [];
  const outPath = [];
  const outPhysics = [];
  const slotExportInfos = [];
  let skippedPathForExport = 0;
  let skippedPathAttachmentForExport = 0;
  const skinDefault = {};
  const slotNameByIndex = new Map();
  const slotNameById = new Map();
  const clipVirtualBySlotIndex = new Map();
  const ikNameByIndex = new Map();
  const transformNameByIndex = new Map();
  const pathNameByIndex = new Map();
  const slotInfoByName = new Map();
  const ikUsed = new Set();
  const tfcUsed = new Set();
  const pthUsed = new Set();
  const virtualPathSlotUsed = new Set();
  const m = state.mesh;
  syncBindPose(m);
  const setupWorld = computeWorld(m.rigBones);
  const setupInvBind = setupWorld.map(invert);
  const hasVertexTrackByAnim = new Map();

  function round4(v) {
    return Number((Number(v) || 0).toFixed(4));
  }
  function applyCurveFromKey(row, key) {
    if (!row || !key) return;
    if (key.interp === "stepped") {
      row.curve = "stepped";
      return;
    }
    if (key.interp === "bezier" && Array.isArray(key.curve) && key.curve.length >= 4) {
      row.curve = [
        round4(math.clamp(Number(key.curve[0]) || 0, 0, 1)),
        round4(math.clamp(Number(key.curve[1]) || 0, 0, 1)),
        round4(math.clamp(Number(key.curve[2]) || 0, 0, 1)),
        round4(math.clamp(Number(key.curve[3]) || 0, 0, 1)),
      ];
    }
  }

  function getBoundaryHullCount(cols, rows) {
    const c = Math.max(1, Number(cols) || 1);
    const r = Math.max(1, Number(rows) || 1);
    return 2 * (c + r);
  }

  function canUseMeshAttachment(slot, sm, boneCount, attachment = null) {
    if (!slot || !sm) return false;
    const mode = getSlotWeightMode(slot, attachment);
    if (mode === "weighted") return true;
    if (mode === "single" && boneCount > 0 && sm.weights && sm.weights.length === (sm.positions.length / 2) * boneCount) {
      return true;
    }
    return false;
  }
  function buildPathAttachmentFromPoints(srcPoints, name, closed) {
    const src = Array.isArray(srcPoints) ? srcPoints : [];
    const pts = [];
    for (const p of src) {
      if (!p) continue;
      const np = normalizePathNode(p);
      const x = Number(np.x);
      const y = Number(np.y);
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      if (pts.length > 0) {
        const prev = pts[pts.length - 1];
        if (Math.hypot(x - prev.x, y - prev.y) <= 1e-4) continue;
      }
      pts.push(np);
    }
    if (pts.length < 2) return null;
    const useClosed = !!closed;
    const curves = useClosed ? pts.length : pts.length - 1;
    if (curves <= 0) return null;
    const vertices = [round4(pts[0].x), round4(pts[0].y)];
    const lengths = [];
    for (let i = 0; i < curves; i += 1) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      const c1x = Number.isFinite(Number(a.houtx)) ? Number(a.houtx) : a.x;
      const c1y = Number.isFinite(Number(a.houty)) ? Number(a.houty) : a.y;
      const c2x = Number.isFinite(Number(b.hinx)) ? Number(b.hinx) : b.x;
      const c2y = Number.isFinite(Number(b.hiny)) ? Number(b.hiny) : b.y;
      vertices.push(round4(c1x), round4(c1y), round4(c2x), round4(c2y), round4(b.x), round4(b.y));
      const l0 = Math.hypot(c1x - a.x, c1y - a.y);
      const l1 = Math.hypot(c2x - c1x, c2y - c1y);
      const l2 = Math.hypot(b.x - c2x, b.y - c2y);
      lengths.push(round4(l0 + l1 + l2));
    }
    return {
      name,
      type: "path",
      closed: useClosed,
      constantSpeed: false,
      vertexCount: 1 + curves * 3,
      vertices,
      lengths,
    };
  }
  function buildPathAttachmentFromSlotContour(slot, name, closed) {
    if (!slot) return null;
    const contour = ensureSlotContour(slot);
    const srcPointsLocal =
      Array.isArray(contour && contour.fillPoints) && contour.fillPoints.length >= 2
        ? contour.fillPoints
        : Array.isArray(contour && contour.points)
          ? contour.points
          : [];
    if (!Array.isArray(srcPointsLocal) || srcPointsLocal.length < 2) return null;
    // Convert slot-local contour to setup world (canvas space), then store under export-root path slot.
    const tm = getSlotTransformMatrix(slot, setupWorld);
    const srcPointsWorld = srcPointsLocal.map((p) => transformPoint(tm, Number(p && p.x) || 0, Number(p && p.y) || 0));
    return buildPathAttachmentFromPoints(srcPointsWorld, name, closed);
  }
  function buildPathAttachmentFromBoneChain(rigBones, targetBone, name, closed) {
    const pts = collectPathChainPoints(rigBones, Number(targetBone), !!closed);
    if (!Array.isArray(pts) || pts.length < 2) return null;
    return buildPathAttachmentFromPoints(pts, name, closed);
  }
  function buildBoundingBoxAttachmentFromSlot(slot, name, sourceMode = "fill") {
    if (!slot) return null;
    const contour = ensureSlotContour(slot);
    const srcLocal =
      sourceMode === "contour"
        ? Array.isArray(contour && contour.points)
          ? contour.points
          : []
        : Array.isArray(contour && contour.fillPoints) && contour.fillPoints.length >= 3
          ? contour.fillPoints
          : Array.isArray(contour && contour.points)
            ? contour.points
            : [];
    const tm = getSlotTransformMatrix(slot, setupWorld);
    const vertices = [];
    if (Array.isArray(srcLocal) && srcLocal.length >= 3) {
      for (const p of srcLocal) {
        const w = transformPoint(tm, Number(p && p.x) || 0, Number(p && p.y) || 0);
        vertices.push(round4(w.x), round4(w.y));
      }
    } else {
      const r = (getActiveAttachment(slot) || {}).rect || { x: 0, y: 0, w: (getActiveAttachment(slot) || {}).canvas ? (getActiveAttachment(slot) || {}).canvas.width : 1, h: (getActiveAttachment(slot) || {}).canvas ? (getActiveAttachment(slot) || {}).canvas.height : 1 };
      const pts = [
        { x: Number(r.x) || 0, y: Number(r.y) || 0 },
        { x: (Number(r.x) || 0) + (Number(r.w) || 1), y: Number(r.y) || 0 },
        { x: (Number(r.x) || 0) + (Number(r.w) || 1), y: (Number(r.y) || 0) + (Number(r.h) || 1) },
        { x: Number(r.x) || 0, y: (Number(r.y) || 0) + (Number(r.h) || 1) },
      ];
      for (const p of pts) {
        const w = transformPoint(tm, p.x, p.y);
        vertices.push(round4(w.x), round4(w.y));
      }
    }
    return {
      type: "boundingbox",
      vertexCount: Math.floor(vertices.length / 2),
      vertices,
    };
  }
  function buildPointAttachmentFromMeta(meta) {
    return {
      type: "point",
      x: round4(Number(meta && meta.pointX) || 0),
      y: round4(Number(meta && meta.pointY) || 0),
      rotation: round4(Number(meta && meta.pointRot) || 0),
      color: "ffd700ff",
    };
  }
  function applySequenceToAttachment(att, meta) {
    if (!att || !meta || !meta.sequence || !meta.sequence.enabled) return;
    const seq = {
      count: Math.max(1, Math.round(Number(meta.sequence.count) || 1)),
      start: Math.max(0, Math.round(Number(meta.sequence.start) || 0)),
      digits: Math.max(1, Math.round(Number(meta.sequence.digits) || 2)),
      setup: Math.max(0, Math.round(Number(meta.sequence.setupIndex) || 0)),
    };
    const mode = Number(meta.sequence.mode) || 0;
    if (mode !== 0) seq.mode = mode;
    const path = String(meta.sequence.path || "").trim();
    if (path) att.path = path;
    att.sequence = seq;
  }
  function buildClippingAttachmentFromSlot(slot, endSlotName, name) {
    const ptsLocal = getSlotClipPointsLocal(slot);
    if (!Array.isArray(ptsLocal) || ptsLocal.length < 3) return null;
    const tm = getSlotTransformMatrix(slot, setupWorld);
    const vertices = [];
    for (const p of ptsLocal) {
      const w = transformPoint(tm, Number(p.x) || 0, Number(p.y) || 0);
      vertices.push(round4(w.x), round4(w.y));
    }
    const out = {
      name,
      type: "clipping",
      end: endSlotName || null,
      vertexCount: ptsLocal.length,
      vertices,
    };
    return out;
  }

  function buildMeshAttachment(slot, si, boneCount, boneIndexOffset = 0, canvasOverride = null, attachment = null) {
    const attState = attachment || getActiveAttachment(slot);
    if (!attState) return null;
    if (!attState.meshData) {
      const attName = attState.name ? String(attState.name) : null;
      if (!attachment || (attName && attName === getSlotCurrentAttachmentName(slot))) ensureSlotMeshData(slot, m);
    }
    const sm = attState.meshData;
    if (!sm) return null;
    const slotTm = getSlotTransformMatrix(slot, setupWorld);
    const vCount = sm.positions.length / 2;
    const weighted = boneCount > 0 && sm.weights && sm.weights.length === vCount * boneCount;
    const vertices = [];
    for (let i = 0; i < vCount; i += 1) {
      const x = sm.positions[i * 2];
      const y = sm.positions[i * 2 + 1];
      const p = transformPoint(slotTm, x, y);
      if (!weighted) {
        const boneIdx = Number.isFinite(slot.bone) && slot.bone >= 0 && slot.bone < boneCount ? slot.bone : 0;
        const local = boneCount > 0 ? transformPoint(setupInvBind[boneIdx], p.x, p.y) : p;
        vertices.push(round4(local.x), round4(local.y));
        continue;
      }
      const influences = [];
      let sum = 0;
      for (let b = 0; b < boneCount; b += 1) {
        const w = Number(sm.weights[i * boneCount + b]) || 0;
        if (w <= 1e-6) continue;
        const local = transformPoint(setupInvBind[b], p.x, p.y);
        influences.push({ bone: b, x: local.x, y: local.y, w });
        sum += w;
      }
      if (influences.length === 0) {
        const boneIdx = Number.isFinite(slot.bone) && slot.bone >= 0 && slot.bone < boneCount ? slot.bone : 0;
        const local = boneCount > 0 ? transformPoint(setupInvBind[boneIdx], p.x, p.y) : p;
        vertices.push(1, boneIdx + boneIndexOffset, round4(local.x), round4(local.y), 1);
      } else {
        const inv = sum > 1e-6 ? 1 / sum : 1;
        vertices.push(influences.length);
        for (const it of influences) {
          vertices.push(it.bone + boneIndexOffset, round4(it.x), round4(it.y), round4(it.w * inv));
        }
      }
    }
    const att = {
      type: "mesh",
      uvs: Array.from(sm.uvs, (v) => round4(v)),
      triangles: Array.from(sm.indices || [], (v) => Number(v) || 0),
      vertices,
      hull: getBoundaryHullCount(sm.cols, sm.rows),
      width: round4((canvasOverride || attState.canvas)?.width || (attState.rect?.w || 0)),
      height: round4((canvasOverride || attState.canvas)?.height || (attState.rect?.h || 0)),
    };
    slotInfoByName.set(si.name, { slot, si, sm, meshAttachment: att });
    return att;
  }

  for (const si of slotInfos) {
    const s = si.slot;
    if (s && s.id) slotNameById.set(String(s.id), si.name);
  }

  for (const si of slotInfos) {
    const s = si.slot;
    const bIdx = Number.isFinite(s.bone) && s.bone >= 0 && s.bone < bones.length ? s.bone : 0;
    const b = bones[bIdx] || bones[0];
    const slotCanvas = getSlotCanvas(s);
    const rect = s.rect || { x: 0, y: 0, w: slotCanvas ? slotCanvas.width : 0, h: slotCanvas ? slotCanvas.height : 0 };
    const slotOut = {
      name: si.name,
      bone: boneNames[bIdx] || boneNames[0],
    };
    ensureSlotClipState(s);
    const clipAttachment = getActiveAttachment(s);
    if ((clipAttachment && clipAttachment.clipEnabled) || clipTrackUsageBySlot.has(si.index) || clipEndTrackUsageBySlot.has(si.index)) {
      const clipSlotName = makeUniqueName(`${si.name}_clip`, slotUsed, `${si.name}_clip`);
      const setupEndId = clipAttachment && clipAttachment.clipEndSlotId ? String(clipAttachment.clipEndSlotId) : "";
      const endIds = new Set([setupEndId]);
      const trackEndIds = clipEndValuesBySlot.get(si.index);
      if (trackEndIds) {
        for (const id of trackEndIds) endIds.add(String(id || ""));
      }
      const attachmentsByEnd = new Map();
      for (const endId of endIds) {
        const endSlotName = endId ? slotNameById.get(String(endId)) || null : null;
        const endToken = endSlotName || (endId ? `slot_${String(endId)}` : "end");
        const baseAttName = `${clipSlotName}_${endToken}_clip`;
        const clipAttName = makeUniqueName(baseAttName, attachmentUsed, `${clipSlotName}_clip`);
        const clipAtt = buildClippingAttachmentFromSlot(s, endSlotName, clipAttName);
        if (!clipAtt) continue;
        if (!skinDefault[clipSlotName]) skinDefault[clipSlotName] = {};
        skinDefault[clipSlotName][clipAttName] = clipAtt;
        attachmentsByEnd.set(String(endId || ""), clipAttName);
      }
      const defaultAttachmentName =
        attachmentsByEnd.get(setupEndId) || attachmentsByEnd.get("") || [...attachmentsByEnd.values()][0] || null;
      if (defaultAttachmentName) {
        clipVirtualBySlotIndex.set(si.index, {
          slotName: clipSlotName,
          setupEndId,
          defaultAttachmentName,
          attachmentsByEnd,
        });
        outSlots.push({
          name: clipSlotName,
          bone: exportRootName,
          attachment: defaultAttachmentName,
        });
      }
    }
    if (si.setupAttachmentKey) {
      slotOut.attachment = si.setupAttachmentKey;
    } else if (si.setupAttachmentName) {
      slotOut.attachment = si.setupAttachmentName;
    }
    const color = toSpineColor(
      Number.isFinite(s.r) ? s.r : 1,
      Number.isFinite(s.g) ? s.g : 1,
      Number.isFinite(s.b) ? s.b : 1,
      Number.isFinite(s.alpha) ? s.alpha : 1,
      true
    );
    if (color !== "ffffffff") slotOut.color = color;
    if (s.darkEnabled) {
      slotOut.dark = toSpineRgb(Number(s.dr) || 0, Number(s.dg) || 0, Number(s.db) || 0);
    }
    const slotBlend = normalizeSlotBlendMode(s && s.blend);
    if (slotBlend !== "normal") slotOut.blend = slotBlend;
    outSlots.push(slotOut);
    slotNameByIndex.set(si.index, si.name);

    if (!skinDefault[si.name]) skinDefault[si.name] = {};
    ensureSlotMeshData(s, m);
    for (const ae of si.attachments) {
      const canvas = ae && ae.canvas ? ae.canvas : slotCanvas;
      const aeType = normalizeAttachmentType(ae && ae.type);
      const useMesh = canUseMeshAttachment(s, ae && ae.meshData ? ae.meshData : null, m.rigBones.length, ae);
      let att = null;
      if (aeType === "point") {
        att = buildPointAttachmentFromMeta(ae);
      } else if (aeType === "boundingbox") {
        att = buildBoundingBoxAttachmentFromSlot(s, ae.exportName, ae && ae.bboxSource === "contour" ? "contour" : "fill");
      } else if (aeType === "linkedmesh") {
        const parentSrc = String((ae && ae.linkedParent) || "").trim();
        const parentExport = parentSrc ? si.sourceToExport.get(parentSrc) || null : null;
        if (parentExport) {
          const width = canvas && canvas.width > 0 ? canvas.width : Math.max(1, rect.w || 1);
          const height = canvas && canvas.height > 0 ? canvas.height : Math.max(1, rect.h || 1);
          att = {
            type: "linkedmesh",
            parent: parentExport,
            skin: "default",
            deform: !!(ae && ae.inheritTimelines),
            width: Number(width.toFixed(3)),
            height: Number(height.toFixed(3)),
          };
        }
      } else if ((aeType === "mesh" || aeType === "region") && useMesh) {
        att = buildMeshAttachment(s, si, m.rigBones.length, 1, canvas, ae);
      }
      if (!att && (aeType === "region" || aeType === "mesh" || aeType === "linkedmesh")) {
        if (!canvas) continue;
        const width = canvas.width > 0 ? canvas.width : Math.max(1, rect.w || 1);
        const height = canvas.height > 0 ? canvas.height : Math.max(1, rect.h || 1);
        const cx = (Number(rect.x) || 0) + (Number(rect.w) || width) * 0.5 + (Number(s.tx) || 0);
        const cy = (Number(rect.y) || 0) + (Number(rect.h) || height) * 0.5 + (Number(s.ty) || 0);
        att = {
          x: Number((cx - (Number(b.tx) || 0)).toFixed(3)),
          y: Number((cy - (Number(b.ty) || 0)).toFixed(3)),
          rotation: Number(math.radToDeg(Number(s.rot) || 0).toFixed(3)),
          width: Number(width.toFixed(3)),
          height: Number(height.toFixed(3)),
        };
      }
      if (!att) continue;
      applySequenceToAttachment(att, ae);
      skinDefault[si.name][ae.exportName] = att;
      const phKey = String(ae.sourcePlaceholder || "").trim();
      if (phKey && !skinDefault[si.name][phKey]) {
        const aliasAtt = JSON.parse(JSON.stringify(att));
        if (phKey !== ae.exportName && aliasAtt && typeof aliasAtt === "object" && !Array.isArray(aliasAtt) && !aliasAtt.type) {
          aliasAtt.name = ae.exportName;
        }
        skinDefault[si.name][phKey] = aliasAtt;
      }
      if (canvas && (aeType === "region" || aeType === "mesh" || aeType === "linkedmesh")) {
        slotExportInfos.push({ slot: s, slotInfo: si, canvas, attachmentName: ae.exportName });
      }
    }
    if (si.setupAttachmentName && si.setupPlaceholderName && skinDefault[si.name][si.setupAttachmentName]) {
      const setupAlias = JSON.parse(JSON.stringify(skinDefault[si.name][si.setupAttachmentName]));
      if (
        si.setupPlaceholderName !== si.setupAttachmentName &&
        setupAlias &&
        typeof setupAlias === "object" &&
        !Array.isArray(setupAlias) &&
        !setupAlias.type
      ) {
        setupAlias.name = si.setupAttachmentName;
      }
      skinDefault[si.name][si.setupPlaceholderName] = setupAlias;
    }
  }

  if (Array.isArray(m.ikConstraints)) {
    for (let i = 0; i < m.ikConstraints.length; i += 1) {
      const c = m.ikConstraints[i];
      if (!c || c.enabled === false) continue;
      const chain = Array.isArray(c.bones) ? c.bones.filter((bi) => Number.isFinite(bi) && bi >= 0 && bi < bones.length) : [];
      const targetIdx = Number(c.target);
      if (chain.length === 0) continue;
      if (!Number.isFinite(targetIdx) || targetIdx < 0 || targetIdx >= bones.length) continue;
      if (chain.includes(targetIdx)) continue;
      const rawName = c.name || `ik_${i}`;
      const name = makeUniqueName(rawName, ikUsed, `ik_${i}`);
      ikNameByIndex.set(i, name);
      const item = {
        name,
        order: getConstraintOrder(c, i),
        bones: chain.map((bi) => boneNames[bi]),
        target: boneNames[targetIdx],
        mix: round4(math.clamp(Number(c.mix) || 0, 0, 1)),
        bendPositive: c.bendPositive !== false,
      };
      const softness = Math.max(0, Number(c.softness) || 0);
      if (softness > 1e-6) item.softness = round4(softness);
      if (c.compress) item.compress = true;
      if (c.stretch) item.stretch = true;
      if (!compat.stripIkUniform && c.uniform) item.uniform = true;
      if (c.skinRequired) item.skin = true;
      outIk.push(item);
    }
    outIk.sort((a, b) => getConstraintOrder(a, 0) - getConstraintOrder(b, 0));
  }
  if (Array.isArray(m.transformConstraints)) {
    const tList = ensureTransformConstraints(m);
    for (let i = 0; i < tList.length; i += 1) {
      const c = tList[i];
      if (!c || c.enabled === false) continue;
      const targetIdx = Number(c.target);
      if (!Number.isFinite(targetIdx) || targetIdx < 0 || targetIdx >= bones.length) continue;
      const chain = Array.isArray(c.bones) ? c.bones.filter((bi) => Number.isFinite(bi) && bi >= 0 && bi < bones.length) : [];
      if (chain.length === 0 || chain.includes(targetIdx)) continue;
      const name = makeUniqueName(c.name || `transform_${i}`, tfcUsed, `transform_${i}`);
      transformNameByIndex.set(i, name);
      outTransform.push({
        name,
        order: getConstraintOrder(c, i),
        skin: !!c.skinRequired,
        bones: chain.map((bi) => boneNames[bi]),
        target: boneNames[targetIdx],
        local: !!c.local,
        relative: !!c.relative,
        rotation: round4(Number(c.offsetRot) || 0),
        x: round4(Number(c.offsetX) || 0),
        y: round4(Number(c.offsetY) || 0),
        scaleX: round4(Number(c.offsetScaleX) || 0),
        scaleY: round4(Number(c.offsetScaleY) || 0),
        shearY: round4(Number(c.offsetShearY) || 0),
        rotateMix: round4(math.clamp(Number(c.rotateMix) || 0, 0, 1)),
        translateMix: round4(math.clamp(Number(c.translateMix) || 0, 0, 1)),
        scaleMix: round4(math.clamp(Number(c.scaleMix) || 0, 0, 1)),
        shearMix: round4(math.clamp(Number(c.shearMix) || 0, 0, 1)),
      });
    }
    outTransform.sort((a, b) => getConstraintOrder(a, 0) - getConstraintOrder(b, 0));
  }
  if (Array.isArray(m.pathConstraints)) {
    const pList = ensurePathConstraints(m);
    for (let i = 0; i < pList.length; i += 1) {
      const c = pList[i];
      if (!c || c.enabled === false) continue;
      const chain = Array.isArray(c.bones) ? c.bones.filter((bi) => Number.isFinite(bi) && bi >= 0 && bi < bones.length) : [];
      if (chain.length === 0) {
        skippedPathForExport += 1;
        continue;
      }
      const targetBoneIndex = Number(c.target);
      if (
        c.sourceType === "bone_chain" &&
        (!Number.isFinite(targetBoneIndex) || targetBoneIndex < 0 || targetBoneIndex >= bones.length)
      ) {
        skippedPathForExport += 1;
        continue;
      }
      const targetSlotIndex = Number(c.targetSlot);
      if (c.sourceType === "slot" && (!Number.isFinite(targetSlotIndex) || targetSlotIndex < 0 || targetSlotIndex >= slotInfos.length)) {
        skippedPathForExport += 1;
        continue;
      }
      const name = makeUniqueName(c.name || `path_${i}`, pthUsed, `path_${i}`);
      pathNameByIndex.set(i, name);
      const pathAttName = `${name}_path`;
      const srcSlotInfo =
        Number.isFinite(targetSlotIndex) && targetSlotIndex >= 0 && targetSlotIndex < slotInfos.length ? slotInfos[targetSlotIndex] : null;
      const pathSlotName = makeUniqueName(`${name}_slot`, virtualPathSlotUsed, `${name}_slot`);
      // Keep path data in a stable export-root space (Spine Y-up root inversion handled by exportRoot transform).
      const pathSlotBone = exportRootName;
      const pathAtt =
        c.sourceType === "drawn"
          ? buildPathAttachmentFromPoints(c.points, pathAttName, !!c.closed)
          : c.sourceType === "bone_chain"
            ? buildPathAttachmentFromBoneChain(m.rigBones, targetBoneIndex, pathAttName, !!c.closed)
            : srcSlotInfo
              ? buildPathAttachmentFromSlotContour(srcSlotInfo.slot, pathAttName, !!c.closed)
              : null;
      if (!pathAtt) {
        skippedPathAttachmentForExport += 1;
        skippedPathForExport += 1;
        continue;
      }
      outPath.push({
        name,
        order: getConstraintOrder(c, i),
        skin: !!c.skinRequired,
        bones: chain.map((bi) => boneNames[bi]),
        target: pathSlotName,
        positionMode: c.positionMode === "percent" ? "percent" : "fixed",
        spacingMode:
          c.spacingMode === "fixed"
            ? "fixed"
            : c.spacingMode === "percent"
              ? "percent"
              : c.spacingMode === "proportional"
                ? "proportional"
                : "length",
        rotateMode: c.rotateMode === "chain" ? "chain" : c.rotateMode === "chainScale" ? "chainScale" : "tangent",
        rotation: 0,
        position: round4(Number(c.position) || 0),
        spacing: round4(Number(c.spacing) || 0),
        rotateMix: round4(math.clamp(Number(c.rotateMix) || 0, 0, 1)),
        translateMix: round4(math.clamp(Number(c.translateMix) || 0, 0, 1)),
      });
      outSlots.push({
        name: pathSlotName,
        bone: pathSlotBone,
        attachment: pathAttName,
      });
      if (!skinDefault[pathSlotName]) skinDefault[pathSlotName] = {};
      skinDefault[pathSlotName][pathAttName] = pathAtt;
    }
    outPath.sort((a, b) => getConstraintOrder(a, 0) - getConstraintOrder(b, 0));
  }
  if (Array.isArray(m.physicsConstraints)) {
    const phList = ensurePhysicsConstraints(m);
    for (let i = 0; i < phList.length; i += 1) {
      const c = phList[i];
      if (!c || c.enabled === false) continue;
      const bi = Number(c.bone);
      if (!Number.isFinite(bi) || bi < 0 || bi >= bones.length) continue;
      outPhysics.push({
        name: c.name || `physics_${i}`,
        order: getConstraintOrder(c, i),
        skin: !!c.skinRequired,
        bone: boneNames[bi],
        x: !!c.x,
        y: !!c.y,
        rotate: c.rotate !== false,
        scaleX: !!c.scaleX,
        shearX: !!c.shearX,
        mix: round4(math.clamp(Number(c.mix) || 1, 0, 1)),
        inertia: round4(math.clamp(Number(c.inertia) || 1, 0, 1)),
        strength: round4(Math.max(0, Number(c.strength) || 0)),
        damping: round4(math.clamp(Number(c.damping) || 1, 0, 10)),
        massInverse: round4(Math.max(0.01, Number(c.massInverse) || 1)),
        wind: round4(Number(c.wind) || 0),
        gravity: round4(Number(c.gravity) || 0),
        step: round4(math.clamp(Number(c.step) || 1 / 60, 1 / 240, 1 / 15)),
        limit: round4(Math.max(0, Number(c.limit) || 5000)),
      });
    }
    outPhysics.sort((a, b) => getConstraintOrder(a, 0) - getConstraintOrder(b, 0));
  }

  const animations = {};
  const eventDefs = {};
  let hasVertexTrack = false;
  let hasWeightedSlot = false;
  for (const s of state.slots || []) {
    if (!s) continue;
    const wm = getSlotWeightMode(s);
    if (wm === "weighted") {
      hasWeightedSlot = true;
      break;
    }
  }

  function pruneTimeline(rows, isDefault) {
    const list = Array.isArray(rows) ? rows : [];
    if (list.length === 0) return [];
    const EPS = 1e-4;
    const allDefault = list.every((r) => isDefault(r, EPS));
    if (allDefault) return [];
    if (list.length === 1) {
      const r = list[0];
      if ((Number(r.time) || 0) <= EPS && isDefault(r, EPS)) return [];
    }
    return list;
  }

  for (const a of state.anim.animations || []) {
    const animName = makeUniqueName(a && a.name ? a.name : "Anim", animUsed, "Anim");
    const animOut = {};
    const bonesOut = {};
    const eventRows = [];
    const tracks = a && a.tracks ? a.tracks : {};
    const vertexRowsBySlot = new Map();
    const ikRowsByConstraint = new Map();
    const tfcRowsByConstraint = new Map();
    const pthRowsByConstraint = new Map();
    const slotColorRowsBySlot = new Map();
    const slotAttachmentRowsBySlot = new Map();
    const slotClipRowsBySlot = new Map();
    const slotClipEndRowsBySlot = new Map();
    const drawOrderRows = [];
    for (const [trackId, keys] of Object.entries(tracks)) {
      const parsed = parseTrackId(trackId);
      if (parsed && parsed.type === "mesh" && Array.isArray(keys) && keys.length > 0) {
        hasVertexTrack = true;
        for (const k of keys) {
          const si = Number.isFinite(k.slotIndex)
            ? Number(k.slotIndex)
            : Number.isFinite(parsed.slotIndex)
              ? Number(parsed.slotIndex)
              : -1;
          if (si < 0 || si >= slotInfos.length) continue;
          if (!vertexRowsBySlot.has(si)) vertexRowsBySlot.set(si, []);
          vertexRowsBySlot.get(si).push(k);
        }
      }
      if (parsed && parsed.type === "ik" && Array.isArray(keys) && keys.length > 0) {
        const ikIdx = parsed.ikIndex;
        if (!Number.isFinite(ikIdx) || ikIdx < 0 || ikIdx >= m.ikConstraints.length) continue;
        const ikName = ikNameByIndex.get(ikIdx);
        if (!ikName) continue;
        if (!ikRowsByConstraint.has(ikName)) {
          ikRowsByConstraint.set(ikName, { mix: [], softness: [], bend: [], compress: [], stretch: [], uniform: [] });
        }
        const bucket = ikRowsByConstraint.get(ikName);
        const rows = keys
          .map((k) => ({
            time: Number((Number(k.time) || 0).toFixed(4)),
            value:
              parsed.prop === "mix"
                ? math.clamp(Number(k.value) || 0, 0, 1)
                : parsed.prop === "softness"
                  ? Math.max(0, Number(k.value) || 0)
                  : parsed.prop === "bend"
                    ? k.value === true || Number(k.value) >= 0
                    : parsed.prop === "compress" || parsed.prop === "stretch" || parsed.prop === "uniform"
                      ? k.value === true || Number(k.value) > 0
                      : null,
            interp: k.interp === "stepped" ? "stepped" : k.interp === "bezier" ? "bezier" : "linear",
            curve: Array.isArray(k.curve) && k.curve.length >= 4 ? k.curve.slice(0, 4) : null,
          }))
          .filter((r) => r.value != null)
          .sort((a, b) => a.time - b.time);
        if (parsed.prop === "mix") bucket.mix.push(...rows);
        else if (parsed.prop === "softness") bucket.softness.push(...rows);
        else if (parsed.prop === "bend") bucket.bend.push(...rows);
        else if (parsed.prop === "compress") bucket.compress.push(...rows);
        else if (parsed.prop === "stretch") bucket.stretch.push(...rows);
        else if (parsed.prop === "uniform") bucket.uniform.push(...rows);
      }
      if (parsed && parsed.type === "tfc" && Array.isArray(keys) && keys.length > 0) {
        const tIdx = parsed.transformIndex;
        const cName = transformNameByIndex.get(tIdx);
        if (!cName) continue;
        if (!tfcRowsByConstraint.has(cName)) {
          tfcRowsByConstraint.set(cName, { rotateMix: [], translateMix: [], scaleMix: [], shearMix: [] });
        }
        const bucket = tfcRowsByConstraint.get(cName);
        const rows = keys
          .map((k) => ({
            time: Number((Number(k.time) || 0).toFixed(4)),
            value: math.clamp(Number(k.value) || 0, 0, 1),
            interp: k.interp === "stepped" ? "stepped" : k.interp === "bezier" ? "bezier" : "linear",
            curve: Array.isArray(k.curve) && k.curve.length >= 4 ? k.curve.slice(0, 4) : null,
          }))
          .sort((a, b) => a.time - b.time);
        if (parsed.prop === "rotateMix") bucket.rotateMix.push(...rows);
        else if (parsed.prop === "translateMix") bucket.translateMix.push(...rows);
        else if (parsed.prop === "scaleMix") bucket.scaleMix.push(...rows);
        else if (parsed.prop === "shearMix") bucket.shearMix.push(...rows);
      }
      if (parsed && parsed.type === "pth" && Array.isArray(keys) && keys.length > 0) {
        const pIdx = parsed.pathIndex;
        const cName = pathNameByIndex.get(pIdx);
        if (!cName) continue;
        if (!pthRowsByConstraint.has(cName)) {
          pthRowsByConstraint.set(cName, { position: [], spacing: [], rotateMix: [], translateMix: [] });
        }
        const bucket = pthRowsByConstraint.get(cName);
        const rows = keys
          .map((k) => ({
            time: Number((Number(k.time) || 0).toFixed(4)),
            value:
              parsed.prop === "rotateMix" || parsed.prop === "translateMix"
                ? math.clamp(Number(k.value) || 0, 0, 1)
                : Number(k.value) || 0,
            interp: k.interp === "stepped" ? "stepped" : k.interp === "bezier" ? "bezier" : "linear",
            curve: Array.isArray(k.curve) && k.curve.length >= 4 ? k.curve.slice(0, 4) : null,
          }))
          .sort((a, b) => a.time - b.time);
        if (parsed.prop === "position") bucket.position.push(...rows);
        else if (parsed.prop === "spacing") bucket.spacing.push(...rows);
        else if (parsed.prop === "rotateMix") bucket.rotateMix.push(...rows);
        else if (parsed.prop === "translateMix") bucket.translateMix.push(...rows);
      }
      if (parsed && parsed.type === "event" && Array.isArray(keys) && keys.length > 0) {
        const rows = keys
          .map((k) => {
            const v = k && k.value && typeof k.value === "object" ? k.value : {};
            const name = String(v.name || "event").trim() || "event";
            const row = { time: Number((Number(k.time) || 0).toFixed(4)), name };
            if (Number(v.int) || 0) row.int = Number(v.int) || 0;
            if (Math.abs(Number(v.float) || 0) > 1e-6) row.float = Number((Number(v.float) || 0).toFixed(4));
            if (v.string != null && String(v.string).length > 0) row.string = String(v.string);
            eventDefs[name] = eventDefs[name] || {};
            if ("int" in row) eventDefs[name].int = row.int;
            if ("float" in row) eventDefs[name].float = row.float;
            if ("string" in row) eventDefs[name].string = row.string;
            return row;
          })
          .sort((aa, bb) => aa.time - bb.time);
        eventRows.push(...rows);
      }
      if (parsed && parsed.type === "draworder" && Array.isArray(keys) && keys.length > 0) {
        const rows = keys
          .map((k) => ({
            time: Number((Number(k.time) || 0).toFixed(4)),
            value: Array.isArray(k.value) ? k.value.map((id) => String(id)) : [],
          }))
          .sort((aa, bb) => aa.time - bb.time);
        drawOrderRows.push(...rows);
      }
      if (parsed && parsed.type === "slot" && parsed.prop === "color" && Array.isArray(keys) && keys.length > 0) {
        const si = parsed.slotIndex;
        if (!Number.isFinite(si) || si < 0 || si >= slotInfos.length) continue;
        if (!slotColorRowsBySlot.has(si)) slotColorRowsBySlot.set(si, []);
        const rows = keys
          .map((k) => {
            const v = k && typeof k.value === "object" ? k.value : {};
            const row = {
              time: Number((Number(k.time) || 0).toFixed(4)),
              color: toSpineColor(Number(v.r) || 1, Number(v.g) || 1, Number(v.b) || 1, Number(v.a) || 1, true),
              darkEnabled: !!v.darkEnabled,
              dark: toSpineRgb(Number(v.dr) || 0, Number(v.dg) || 0, Number(v.db) || 0),
            };
            applyCurveFromKey(row, k);
            return row;
          })
          .sort((aa, bb) => aa.time - bb.time);
        slotColorRowsBySlot.get(si).push(...rows);
      }
      if (parsed && parsed.type === "slot" && parsed.prop === "attachment" && Array.isArray(keys) && keys.length > 0) {
        const si = parsed.slotIndex;
        if (!Number.isFinite(si) || si < 0 || si >= slotInfos.length) continue;
        if (!slotAttachmentRowsBySlot.has(si)) slotAttachmentRowsBySlot.set(si, []);
        const siInfo = slotInfos[si];
        const setupAttachment = siInfo ? siInfo.setupAttachmentKey || siInfo.setupAttachmentName : null;
        const rows = keys
          .map((k) => {
            const raw = k ? k.value : null;
            let name = null;
            if (raw == null || raw === false || raw === "") {
              name = null;
            } else if (raw === true) {
              name = setupAttachment;
            } else {
              const as = String(raw);
              name =
                (siInfo && siInfo.sourceToExport && siInfo.sourceToExport.get(as)) ||
                (siInfo && siInfo.placeholderToExport && siInfo.placeholderToExport.has(as) ? as : null) ||
                (siInfo && siInfo.exportToSource && siInfo.exportToSource.has(as) ? as : null);
            }
            return {
              time: Number((Number(k.time) || 0).toFixed(4)),
              name,
            };
          })
          .sort((aa, bb) => aa.time - bb.time);
        slotAttachmentRowsBySlot.get(si).push(...rows);
      }
      if (parsed && parsed.type === "slot" && parsed.prop === "clip" && Array.isArray(keys) && keys.length > 0) {
        const si = parsed.slotIndex;
        if (!Number.isFinite(si) || si < 0 || si >= slotInfos.length) continue;
        if (!slotClipRowsBySlot.has(si)) slotClipRowsBySlot.set(si, []);
        const rows = keys
          .map((k) => ({
            time: Number((Number(k.time) || 0).toFixed(4)),
            enabled: k && (k.value === true || Number(k.value) > 0),
          }))
          .sort((aa, bb) => aa.time - bb.time);
        slotClipRowsBySlot.get(si).push(...rows);
      }
      if (parsed && parsed.type === "slot" && parsed.prop === "clipEnd" && Array.isArray(keys) && keys.length > 0) {
        const si = parsed.slotIndex;
        if (!Number.isFinite(si) || si < 0 || si >= slotInfos.length) continue;
        if (!slotClipEndRowsBySlot.has(si)) slotClipEndRowsBySlot.set(si, []);
        const rows = keys
          .map((k) => {
            const raw = k ? k.value : null;
            const endId = raw == null || raw === false || raw === "" ? "" : String(raw);
            return {
              time: Number((Number(k.time) || 0).toFixed(4)),
              endId,
            };
          })
          .sort((aa, bb) => aa.time - bb.time);
        slotClipEndRowsBySlot.get(si).push(...rows);
      }
      if (!parsed || parsed.type !== "bone" || !Array.isArray(keys) || keys.length === 0) continue;
      const bi = parsed.boneIndex;
      if (!Number.isFinite(bi) || bi < 0 || bi >= bones.length) continue;
      const bName = boneNames[bi];
      if (!bonesOut[bName]) bonesOut[bName] = {};
      if (parsed.prop === "translate") {
        const setupX = Number(bones[bi].tx) || 0;
        const setupY = Number(bones[bi].ty) || 0;
        const rows = keys.map((k) => {
          const v = k && typeof k.value === "object" ? k.value : {};
          const row = {
            time: Number((Number(k.time) || 0).toFixed(4)),
            x: Number(((Number(v.x) || 0) - setupX).toFixed(4)),
            y: Number(((Number(v.y) || 0) - setupY).toFixed(4)),
          };
          applyCurveFromKey(row, k);
          return row;
        });
        const pruned = pruneTimeline(rows, (r, eps) => Math.abs(Number(r.x) || 0) <= eps && Math.abs(Number(r.y) || 0) <= eps);
        if (pruned.length > 0) bonesOut[bName].translate = pruned;
      } else if (parsed.prop === "rotate") {
        const setupRotDeg = math.radToDeg(Number(bones[bi].rot) || 0);
        const rows = keys.map((k) => {
          const row = {
            time: Number((Number(k.time) || 0).toFixed(4)),
            value: Number((math.radToDeg(Number(k.value) || 0) - setupRotDeg).toFixed(4)),
          };
          applyCurveFromKey(row, k);
          return row;
        });
        const pruned = pruneTimeline(rows, (r, eps) => Math.abs(Number(r.value) || 0) <= eps);
        if (pruned.length > 0) bonesOut[bName].rotate = pruned;
      } else if (parsed.prop === "scale") {
        const baseLen = Math.max(1e-6, Number(bones[bi].length) || 1);
        const rows = keys.map((k) => {
          const ratio = (Number(k.value) || baseLen) / baseLen;
          const row = {
            time: Number((Number(k.time) || 0).toFixed(4)),
            x: Number(ratio.toFixed(4)),
            y: Number(ratio.toFixed(4)),
          };
          applyCurveFromKey(row, k);
          return row;
        });
        const pruned = pruneTimeline(rows, (r, eps) => Math.abs((Number(r.x) || 1) - 1) <= eps && Math.abs((Number(r.y) || 1) - 1) <= eps);
        if (pruned.length > 0) bonesOut[bName].scale = pruned;
      } else if (parsed.prop === "scaleX" || parsed.prop === "scaleY") {
        const axis = parsed.prop === "scaleX" ? "x" : "y";
        const other = axis === "x" ? "y" : "x";
        const setup = Number(axis === "x" ? bones[bi].sx : bones[bi].sy);
        const setupSafe = Math.abs(setup) > 1e-6 ? setup : 1;
        const existing = Array.isArray(bonesOut[bName].scale) ? [...bonesOut[bName].scale] : [];
        const byTime = new Map(existing.map((r) => [Number((Number(r.time) || 0).toFixed(4)), { ...r }]));
        for (const k of keys) {
          const t = Number((Number(k.time) || 0).toFixed(4));
          const row = byTime.get(t) || { time: t, x: 1, y: 1 };
          row[axis] = Number(((Number(k.value) || setupSafe) / setupSafe).toFixed(4));
          applyCurveFromKey(row, k);
          byTime.set(t, row);
        }
        const merged = [...byTime.values()].sort((a, b) => a.time - b.time).map((r) => {
          const nr = { ...r };
          if (!Number.isFinite(nr[other])) nr[other] = 1;
          return nr;
        });
        const pruned = pruneTimeline(
          merged,
          (r, eps) => Math.abs((Number(r.x) || 1) - 1) <= eps && Math.abs((Number(r.y) || 1) - 1) <= eps
        );
        if (pruned.length > 0) bonesOut[bName].scale = pruned;
      } else if (parsed.prop === "shearX" || parsed.prop === "shearY") {
        const axis = parsed.prop === "shearX" ? "x" : "y";
        const other = axis === "x" ? "y" : "x";
        const setupDeg = math.radToDeg(Number(axis === "x" ? bones[bi].shx : bones[bi].shy) || 0);
        const existing = Array.isArray(bonesOut[bName].shear) ? [...bonesOut[bName].shear] : [];
        const byTime = new Map(existing.map((r) => [Number((Number(r.time) || 0).toFixed(4)), { ...r }]));
        for (const k of keys) {
          const t = Number((Number(k.time) || 0).toFixed(4));
          const row = byTime.get(t) || { time: t, x: 0, y: 0 };
          row[axis] = Number((math.radToDeg(Number(k.value) || 0) - setupDeg).toFixed(4));
          applyCurveFromKey(row, k);
          byTime.set(t, row);
        }
        const merged = [...byTime.values()].sort((a, b) => a.time - b.time).map((r) => {
          const nr = { ...r };
          if (!Number.isFinite(nr[other])) nr[other] = 0;
          return nr;
        });
        const pruned = pruneTimeline(
          merged,
          (r, eps) => Math.abs(Number(r.x) || 0) <= eps && Math.abs(Number(r.y) || 0) <= eps
        );
        if (pruned.length > 0) bonesOut[bName].shear = pruned;
      }
    }
    for (const [bn, t] of Object.entries(bonesOut)) {
      if (!t || Object.keys(t).length === 0) delete bonesOut[bn];
    }
    if (Object.keys(bonesOut).length > 0) animOut.bones = bonesOut;
    if (eventRows.length > 0) {
      const byTime = new Map();
      for (const r of eventRows) {
        const k = `${r.time}::${r.name}`;
        byTime.set(k, r);
      }
      animOut.events = [...byTime.values()].sort((aa, bb) => (Number(aa.time) || 0) - (Number(bb.time) || 0));
    }
    if (slotColorRowsBySlot.size > 0 || slotAttachmentRowsBySlot.size > 0 || slotClipRowsBySlot.size > 0 || slotClipEndRowsBySlot.size > 0) {
      const slotsOut = {};
      for (const [si, rows] of slotColorRowsBySlot.entries()) {
        const slotName = slotNameByIndex.get(si);
        if (!slotName) continue;
        const slotSetup = slotInfos[si] ? slotInfos[si].slot : null;
        const setupDarkEnabled = !!(slotSetup && slotSetup.darkEnabled);
        const setupDark = toSpineRgb(
          Number(slotSetup && slotSetup.dr) || 0,
          Number(slotSetup && slotSetup.dg) || 0,
          Number(slotSetup && slotSetup.db) || 0
        );
        const sorted = [...rows].sort((aa, bb) => (Number(aa.time) || 0) - (Number(bb.time) || 0));
        if (sorted.length > 0) {
          const byTime = new Map();
          for (const r of sorted) byTime.set(`${r.time}`, r);
          const uniq = [...byTime.values()];
          const hasDarkKeys = setupDarkEnabled || uniq.some((r) => r && r.darkEnabled);
          if (!slotsOut[slotName]) slotsOut[slotName] = {};
          if (hasDarkKeys) {
            slotsOut[slotName].twoColor = uniq.map((r) => {
              const row = {
                time: Number((Number(r.time) || 0).toFixed(4)),
                light: String(r && r.color ? r.color : "ffffffff"),
                dark: String(
                  r && r.darkEnabled ? (r.dark || setupDark || "000000") : (setupDarkEnabled ? setupDark : "000000")
                ),
              };
              if (r && r.curve != null) row.curve = r.curve;
              return row;
            });
          } else {
            slotsOut[slotName].color = uniq;
          }
        }
      }
      for (const [si, rows] of slotAttachmentRowsBySlot.entries()) {
        const slotName = slotNameByIndex.get(si);
        if (!slotName) continue;
        const sorted = [...rows].sort((aa, bb) => (Number(aa.time) || 0) - (Number(bb.time) || 0));
        if (sorted.length > 0) {
          const byTime = new Map();
          for (const r of sorted) byTime.set(`${r.time}`, r);
          if (!slotsOut[slotName]) slotsOut[slotName] = {};
          slotsOut[slotName].attachment = [...byTime.values()];
        }
      }
      const clipSlotsToProcess = new Set([...slotClipRowsBySlot.keys(), ...slotClipEndRowsBySlot.keys()]);
      for (const si of clipSlotsToProcess) {
        const clipRef = clipVirtualBySlotIndex.get(si);
        if (!clipRef) continue;
        const clipRows = [...(slotClipRowsBySlot.get(si) || [])].sort((aa, bb) => (Number(aa.time) || 0) - (Number(bb.time) || 0));
        const endRows = [...(slotClipEndRowsBySlot.get(si) || [])].sort((aa, bb) => (Number(aa.time) || 0) - (Number(bb.time) || 0));
        if (clipRows.length <= 0 && endRows.length <= 0) continue;
        const setupSlot = slotInfos[si] ? slotInfos[si].slot : null;
        const setupClipEnabled = !!(setupSlot && getActiveAttachment(setupSlot) && getActiveAttachment(setupSlot).clipEnabled);
        const setupEndId = clipRef.setupEndId != null ? String(clipRef.setupEndId) : "";
        const sampleStepped = (rows, t, fallback, valueKey) => {
          let out = fallback;
          for (const row of rows) {
            const tt = Number(row && row.time);
            if (!Number.isFinite(tt) || tt > t + 1e-6) break;
            out = row[valueKey];
          }
          return out;
        };
        const times = [...new Set([...clipRows.map((r) => Number((Number(r.time) || 0).toFixed(4))), ...endRows.map((r) => Number((Number(r.time) || 0).toFixed(4)))])]
          .sort((a, b) => a - b);
        const outRows = [];
        let prevName = Symbol("init");
        for (const t of times) {
          const enabled = sampleStepped(clipRows, t, setupClipEnabled, "enabled");
          const endId = String(sampleStepped(endRows, t, setupEndId, "endId") || "");
          const clipAttName =
            clipRef.attachmentsByEnd.get(endId) ||
            clipRef.attachmentsByEnd.get("") ||
            clipRef.defaultAttachmentName ||
            null;
          const name = enabled ? clipAttName : null;
          if (name === prevName) continue;
          outRows.push({ time: Number((Number(t) || 0).toFixed(4)), name });
          prevName = name;
        }
        if (outRows.length <= 0) continue;
        if (!slotsOut[clipRef.slotName]) slotsOut[clipRef.slotName] = {};
        slotsOut[clipRef.slotName].attachment = outRows;
      }
      if (Object.keys(slotsOut).length > 0) animOut.slots = slotsOut;
    }
    if (drawOrderRows.length > 0) {
      const setupOrder = slotInfos.map((si) => si.slot && si.slot.id).filter(Boolean);
      const setupNameById = new Map();
      for (const si of slotInfos) {
        if (si && si.slot && si.slot.id) setupNameById.set(si.slot.id, si.name);
      }
      const outRows = [];
      for (const r of drawOrderRows.sort((aa, bb) => aa.time - bb.time)) {
        const ids = Array.isArray(r.value) ? r.value : [];
        const targetIds = ids.filter((id) => setupNameById.has(id));
        if (targetIds.length !== setupOrder.length) continue;
        const offsets = [];
        for (let ti = 0; ti < targetIds.length; ti += 1) {
          const id = targetIds[ti];
          const oi = setupOrder.indexOf(id);
          if (oi < 0 || oi === ti) continue;
          offsets.push({ slot: setupNameById.get(id), offset: ti - oi });
        }
        const row = { time: Number((Number(r.time) || 0).toFixed(4)) };
        if (offsets.length > 0) row.offsets = offsets;
        outRows.push(row);
      }
      if (outRows.length > 0) animOut.drawOrder = outRows;
    }

    if (ikRowsByConstraint.size > 0) {
      const ikOut = {};
      for (const [ikName, data] of ikRowsByConstraint.entries()) {
        const ikSetup = (m.ikConstraints || []).find((c) => c && c.name === ikName);
        const setupMix = math.clamp(Number(ikSetup && ikSetup.mix) || 0, 0, 1);
        const setupSoftness = Math.max(0, Number(ikSetup && ikSetup.softness) || 0);
        const setupBend = ikSetup ? ikSetup.bendPositive !== false : true;
        const setupCompress = !!(ikSetup && ikSetup.compress);
        const setupStretch = !!(ikSetup && ikSetup.stretch);
        const setupUniform = !!(ikSetup && ikSetup.uniform);
        const byTime = new Map();
        for (const r of data.mix || []) {
          const row = byTime.get(r.time) || { time: r.time };
          row.mix = Number((Number(r.value) || 0).toFixed(4));
          if (r.interp === "stepped") row.curve = "stepped";
          else if (r.interp === "bezier" && Array.isArray(r.curve) && r.curve.length >= 4) row.curve = r.curve.slice(0, 4);
          byTime.set(r.time, row);
        }
        for (const r of data.softness || []) {
          const row = byTime.get(r.time) || { time: r.time };
          row.softness = Number((Math.max(0, Number(r.value) || 0)).toFixed(4));
          if (r.interp === "stepped") row.curve = "stepped";
          else if (r.interp === "bezier" && Array.isArray(r.curve) && r.curve.length >= 4) row.curve = r.curve.slice(0, 4);
          byTime.set(r.time, row);
        }
        for (const r of data.bend || []) {
          const row = byTime.get(r.time) || { time: r.time };
          row.bendPositive = r.value === true;
          if (r.interp === "stepped") row.curve = "stepped";
          else if (r.interp === "bezier" && Array.isArray(r.curve) && r.curve.length >= 4) row.curve = r.curve.slice(0, 4);
          byTime.set(r.time, row);
        }
        for (const r of data.compress || []) {
          const row = byTime.get(r.time) || { time: r.time };
          row.compress = r.value === true;
          row.curve = "stepped";
          byTime.set(r.time, row);
        }
        for (const r of data.stretch || []) {
          const row = byTime.get(r.time) || { time: r.time };
          row.stretch = r.value === true;
          row.curve = "stepped";
          byTime.set(r.time, row);
        }
        for (const r of data.uniform || []) {
          const row = byTime.get(r.time) || { time: r.time };
          row.uniform = r.value === true;
          row.curve = "stepped";
          byTime.set(r.time, row);
        }
        const merged = [...byTime.values()]
          .sort((a, b) => a.time - b.time)
          .map((r) => {
            const out = { time: Number((Number(r.time) || 0).toFixed(4)) };
            if (r.mix != null) out.mix = Number((Number(r.mix) || 0).toFixed(4));
            if (r.softness != null) out.softness = Number(Math.max(0, Number(r.softness) || 0).toFixed(4));
            if (r.bendPositive != null) out.bendPositive = !!r.bendPositive;
            if (r.compress != null) out.compress = !!r.compress;
            if (r.stretch != null) out.stretch = !!r.stretch;
            if (r.uniform != null) out.uniform = !!r.uniform;
            if (r.curve === "stepped") out.curve = "stepped";
            else if (Array.isArray(r.curve) && r.curve.length >= 4) out.curve = r.curve.slice(0, 4);
            return out;
          });
        const pruned = pruneTimeline(
          merged,
          (r, eps) =>
            Math.abs((r.mix != null ? Number(r.mix) : setupMix) - setupMix) <= eps &&
            Math.abs((r.softness != null ? Number(r.softness) : setupSoftness) - setupSoftness) <= eps &&
            ((r.bendPositive != null ? !!r.bendPositive : setupBend) === setupBend) &&
            ((r.compress != null ? !!r.compress : setupCompress) === setupCompress) &&
            ((r.stretch != null ? !!r.stretch : setupStretch) === setupStretch) &&
            ((r.uniform != null ? !!r.uniform : setupUniform) === setupUniform)
        );
        if (pruned.length > 0) ikOut[ikName] = pruned;
      }
      if (Object.keys(ikOut).length > 0) animOut.ik = ikOut;
    }
    if (tfcRowsByConstraint.size > 0) {
      const tfcOut = {};
      for (const [name, data] of tfcRowsByConstraint.entries()) {
        const setup = (m.transformConstraints || []).find((c) => c && c.name === name);
        const byTime = new Map();
        const fold = (list, field, setupValue) => {
          for (const r of list || []) {
            const row = byTime.get(r.time) || { time: r.time };
            row[field] = Number((Number(r.value) || 0).toFixed(4));
            if (r.interp === "stepped") row.curve = "stepped";
            else if (r.interp === "bezier" && Array.isArray(r.curve) && r.curve.length >= 4) row.curve = r.curve.slice(0, 4);
            byTime.set(r.time, row);
          }
          return setupValue;
        };
        const sR = fold(data.rotateMix, "rotateMix", Number(setup && setup.rotateMix) || 0);
        const sT = fold(data.translateMix, "translateMix", Number(setup && setup.translateMix) || 0);
        const sS = fold(data.scaleMix, "scaleMix", Number(setup && setup.scaleMix) || 0);
        const sH = fold(data.shearMix, "shearMix", Number(setup && setup.shearMix) || 0);
        let cr = sR;
        let ct = sT;
        let cs = sS;
        let ch = sH;
        const merged = [...byTime.values()]
          .sort((a, b) => a.time - b.time)
          .map((r) => {
            if (r.rotateMix != null) cr = Number(r.rotateMix) || 0;
            if (r.translateMix != null) ct = Number(r.translateMix) || 0;
            if (r.scaleMix != null) cs = Number(r.scaleMix) || 0;
            if (r.shearMix != null) ch = Number(r.shearMix) || 0;
            const out = {
              time: Number((Number(r.time) || 0).toFixed(4)),
              rotateMix: Number(cr.toFixed(4)),
              translateMix: Number(ct.toFixed(4)),
              scaleMix: Number(cs.toFixed(4)),
              shearMix: Number(ch.toFixed(4)),
            };
            if (r.curve === "stepped") out.curve = "stepped";
            else if (Array.isArray(r.curve) && r.curve.length >= 4) out.curve = r.curve.slice(0, 4);
            return out;
          });
        const pruned = pruneTimeline(
          merged,
          (r, eps) =>
            Math.abs((Number(r.rotateMix) || 0) - sR) <= eps &&
            Math.abs((Number(r.translateMix) || 0) - sT) <= eps &&
            Math.abs((Number(r.scaleMix) || 0) - sS) <= eps &&
            Math.abs((Number(r.shearMix) || 0) - sH) <= eps
        );
        if (pruned.length > 0) tfcOut[name] = pruned;
      }
      if (Object.keys(tfcOut).length > 0) animOut.transform = tfcOut;
    }
    if (pthRowsByConstraint.size > 0) {
      const pthOut = {};
      for (const [name, data] of pthRowsByConstraint.entries()) {
        const setup = (outPath || []).find((c) => c && c.name === name);
        if (!setup) continue;
        const toScalar = (list, setupValue) => {
          const rows = (list || [])
            .map((r) => {
              const row = {
                time: Number((Number(r.time) || 0).toFixed(4)),
                value: Number((Number(r.value) || 0).toFixed(4)),
              };
              if (r.interp === "stepped") row.curve = "stepped";
              else if (r.interp === "bezier" && Array.isArray(r.curve) && r.curve.length >= 4) row.curve = r.curve.slice(0, 4);
              return row;
            })
            .sort((a, b) => a.time - b.time);
          return pruneTimeline(rows, (r, eps) => Math.abs((Number(r.value) || 0) - (Number(setupValue) || 0)) <= eps);
        };
        const posRows = toScalar(data.position, Number(setup.position) || 0);
        const spcRows = toScalar(data.spacing, Number(setup.spacing) || 0);

        const byTime = new Map();
        for (const r of data.rotateMix || []) {
          const row = byTime.get(r.time) || { time: Number((Number(r.time) || 0).toFixed(4)) };
          row.rotateMix = Number((Number(r.value) || 0).toFixed(4));
          if (r.interp === "stepped") row.curve = "stepped";
          else if (r.interp === "bezier" && Array.isArray(r.curve) && r.curve.length >= 4) row.curve = r.curve.slice(0, 4);
          byTime.set(r.time, row);
        }
        for (const r of data.translateMix || []) {
          const row = byTime.get(r.time) || { time: Number((Number(r.time) || 0).toFixed(4)) };
          row.translateMix = Number((Number(r.value) || 0).toFixed(4));
          if (r.interp === "stepped") row.curve = "stepped";
          else if (r.interp === "bezier" && Array.isArray(r.curve) && r.curve.length >= 4) row.curve = r.curve.slice(0, 4);
          byTime.set(r.time, row);
        }
        let cr = Number(setup.rotateMix) || 0;
        let ct = Number(setup.translateMix) || 0;
        const mixRows = [...byTime.values()]
          .sort((a, b) => a.time - b.time)
          .map((r) => {
            if (r.rotateMix != null) cr = Number(r.rotateMix) || 0;
            if (r.translateMix != null) ct = Number(r.translateMix) || 0;
            const out = {
              time: Number((Number(r.time) || 0).toFixed(4)),
              rotateMix: Number(cr.toFixed(4)),
              translateMix: Number(ct.toFixed(4)),
            };
            if (r.curve === "stepped") out.curve = "stepped";
            else if (Array.isArray(r.curve) && r.curve.length >= 4) out.curve = r.curve.slice(0, 4);
            return out;
          });
        const prunedMix = pruneTimeline(
          mixRows,
          (r, eps) =>
            Math.abs((Number(r.rotateMix) || 0) - (Number(setup.rotateMix) || 0)) <= eps &&
            Math.abs((Number(r.translateMix) || 0) - (Number(setup.translateMix) || 0)) <= eps
        );

        const block = {};
        if (posRows.length > 0) block.position = posRows;
        if (spcRows.length > 0) block.spacing = spcRows;
        if (prunedMix.length > 0) block.mix = prunedMix;
        if (Object.keys(block).length > 0) pthOut[name] = block;
      }
      if (Object.keys(pthOut).length > 0) animOut.paths = pthOut;
    }

    if (vertexRowsBySlot.size > 0) {
      const deformDefaultSkin = {};
      const eps = 1e-5;
      for (const [slotIdx, list] of vertexRowsBySlot.entries()) {
        const si = slotInfos[slotIdx];
        if (!si) continue;
        const slotName = si.name;
        const s = si.slot;
        const setupAttachmentName = si.setupAttachmentName || null;
        const attachmentRows = [...(slotAttachmentRowsBySlot.get(slotIdx) || [])].sort(
          (aa, bb) => (Number(aa.time) || 0) - (Number(bb.time) || 0)
        );
        const resolveAttachmentAtTime = (t) => {
          let out = setupAttachmentName;
          for (const row of attachmentRows) {
            const rt = Number(row && row.time);
            if (!Number.isFinite(rt) || rt > t + 1e-6) break;
            out = row.name == null ? null : String(row.name);
          }
          return out;
        };
        const sorted = [...list].sort((a, b) => (Number(a.time) || 0) - (Number(b.time) || 0));
        const rowsByAttachment = new Map();
        for (const key of sorted) {
          const keyTime = round4(Number(key.time) || 0);
          const attName = resolveAttachmentAtTime(keyTime);
          if (!attName) continue;
          const arr = Array.isArray(key.value) ? key.value : null;
          const slotAtt = getSlotAttachmentEntry(s, attName);
          const sm = slotAtt && slotAtt.meshData ? slotAtt.meshData : null;
          if (!arr || !sm) continue;
          const expectedLen = sm.positions.length;
          if (arr.length !== expectedLen) continue;
          const att = skinDefault[slotName] && skinDefault[slotName][attName] ? skinDefault[slotName][attName] : null;
          if (!att || att.type !== "mesh") continue;
          const base = sm.baseOffsets || new Float32Array(expectedLen);
          const delta = new Array(expectedLen);
          let first = -1;
          let last = -1;
          for (let i = 0; i < expectedLen; i += 1) {
            const v = (Number(arr[i]) || 0) - (Number(base[i]) || 0);
            delta[i] = round4(v);
            if (Math.abs(v) > eps) {
              if (first < 0) first = i;
              last = i;
            }
          }
          const row = { time: keyTime };
          if (first >= 0 && last >= first) {
            if (first > 0) row.offset = first;
            row.vertices = delta.slice(first, last + 1);
          }
          applyCurveFromKey(row, key);
          if (!rowsByAttachment.has(attName)) rowsByAttachment.set(attName, []);
          rowsByAttachment.get(attName).push(row);
        }
        if (rowsByAttachment.size > 0) {
          if (!deformDefaultSkin[slotName]) deformDefaultSkin[slotName] = {};
          for (const [attName, rows] of rowsByAttachment.entries()) {
            if (rows.length > 0) deformDefaultSkin[slotName][attName] = rows;
          }
        }
      }
      if (Object.keys(deformDefaultSkin).length > 0) {
        animOut.deform = { default: deformDefaultSkin };
      }
    }

    if (Object.keys(animOut).length > 0) animations[animName] = animOut;
    if (vertexRowsBySlot.size > 0) hasVertexTrackByAnim.set(animName, true);
  }

  const outSkins = [{ name: "default", attachments: skinDefault }];
  const slotInfoById = new Map();
  for (const si of slotInfos) {
    if (si && si.slot && si.slot.id) slotInfoById.set(String(si.slot.id), si);
  }
  for (const skin of ensureSkinSets()) {
    const nameRaw = String((skin && skin.name) || "").trim();
    if (!nameRaw || nameRaw === "default") continue;
    const map = skin && skin.slotAttachments && typeof skin.slotAttachments === "object" ? skin.slotAttachments : null;
    const mapByPh =
      skin && skin.slotPlaceholderAttachments && typeof skin.slotPlaceholderAttachments === "object"
        ? skin.slotPlaceholderAttachments
        : null;
    if (!map && !mapByPh) continue;
    const attachments = {};
    if (mapByPh) {
      for (const [slotId, phMap] of Object.entries(mapByPh)) {
        const si = slotInfoById.get(String(slotId));
        if (!si || !phMap || typeof phMap !== "object") continue;
        const srcMap = skinDefault[si.name];
        if (!srcMap) continue;
        for (const [ph, srcAtt] of Object.entries(phMap)) {
          const key = String(ph || "").trim();
          if (!key) continue;
          const expAtt = si.sourceToExport.get(String(srcAtt || ""));
          if (!expAtt || !srcMap[expAtt]) continue;
          if (!attachments[si.name]) attachments[si.name] = {};
          const cloned = JSON.parse(JSON.stringify(srcMap[expAtt]));
          if (key !== expAtt && cloned && typeof cloned === "object" && !Array.isArray(cloned) && !cloned.type) {
            cloned.name = expAtt;
          }
          attachments[si.name][key] = cloned;
          if (key !== expAtt && !attachments[si.name][expAtt]) {
            attachments[si.name][expAtt] = JSON.parse(JSON.stringify(srcMap[expAtt]));
          }
        }
      }
    } else {
      for (const [slotId, srcAtt] of Object.entries(map)) {
        const si = slotInfoById.get(String(slotId));
        if (!si) continue;
        const expAtt = si.sourceToExport.get(String(srcAtt || ""));
        if (!expAtt) continue;
        const srcMap = skinDefault[si.name];
        if (!srcMap || !srcMap[expAtt]) continue;
        if (!attachments[si.name]) attachments[si.name] = {};
        attachments[si.name][expAtt] = JSON.parse(JSON.stringify(srcMap[expAtt]));
      }
    }
    if (Object.keys(attachments).length > 0) {
      outSkins.push({ name: nameRaw, attachments });
    }
  }

  return {
    json: {
      skeleton: {
        hash: "",
        spine: compat.version,
        x: 0,
        y: 0,
        width: Number((state.imageWidth || 0).toFixed(3)),
        height: Number((state.imageHeight || 0).toFixed(3)),
        images: "./",
        audio: "",
      },
      bones: outBones,
      slots: outSlots,
      ik: outIk,
      transform: outTransform,
      path: outPath,
      physics: outPhysics.length > 0 ? outPhysics : undefined,
      events: Object.keys(eventDefs).length > 0 ? eventDefs : undefined,
      skins: outSkins,
      animations,
    },
    slotExportInfos,
    hasVertexTrack,
    hasWeightedSlot,
    hasVertexTrackByAnim,
    skippedPathForExport,
    skippedPathAttachmentForExport,
  };
}

function validateSpineJsonForExport(spineJson, compatMode = state.export && state.export.spineCompat) {
  const errors = [];
  const warnings = [];
  const json = spineJson || {};
  const compat = getSpineCompatPreset(compatMode);
  const spineVersion = String((json.skeleton && json.skeleton.spine) || "");
  if (spineVersion && spineVersion !== compat.version) {
    warnings.push(
      `Skeleton spine version "${spineVersion}" differs from exporter version "${compat.version}".`
    );
  }
  const slots = Array.isArray(json.slots) ? json.slots : [];
  const slotNames = new Set(slots.map((s) => String(s && s.name ? s.name : "")));
  const skins = getSkinEntries(json);
  const skinByName = new Map(skins.map((s) => [String(s && s.name ? s.name : ""), s]));
  const defaultSkin = (skins.find((s) => s.name === "default") || skins[0] || { attachments: {} }).attachments || {};
  const pathList = Array.isArray(json.path) ? json.path : [];

  for (const p of pathList) {
    const name = String(p && p.name ? p.name : "(unnamed)");
    const target = String(p && p.target ? p.target : "");
    if (!target || !slotNames.has(target)) {
      errors.push(`Path constraint "${name}" target slot is missing.`);
      continue;
    }
    const attMap = defaultSkin[target] || {};
    const pathAtt = Object.values(attMap).find((a) => a && String(a.type || "region") === "path");
    if (!pathAtt) {
      errors.push(`Path constraint "${name}" target slot "${target}" has no path attachment in default skin.`);
    }
  }

  const anims = json.animations && typeof json.animations === "object" ? json.animations : {};
  const pathConstraintNames = new Set(pathList.map((p) => String(p && p.name ? p.name : "")));
  for (const [animName, anim] of Object.entries(anims)) {
    const pth = anim && anim.paths && typeof anim.paths === "object" ? anim.paths : null;
    if (pth) {
      for (const key of Object.keys(pth)) {
        if (!pathConstraintNames.has(String(key))) {
          warnings.push(`Animation "${animName}" references missing path constraint "${key}".`);
        }
      }
    }

    const ik = anim && anim.ik && typeof anim.ik === "object" ? anim.ik : null;
    if (ik) {
      for (const [ikName, rows] of Object.entries(ik)) {
        if (!Array.isArray(rows)) continue;
        for (const row of rows) {
          if (!row || typeof row !== "object") continue;
          if (Object.prototype.hasOwnProperty.call(row, "targetX") || Object.prototype.hasOwnProperty.call(row, "targetY")) {
            warnings.push(
              `Animation "${animName}" ik "${ikName}" contains targetX/targetY, which Spine runtime IK timelines do not use.`
            );
            break;
          }
        }
      }
    }

    const hasLegacyFfd = !!(anim && anim.ffd && !anim.deform);
    const deform =
      anim && typeof anim.deform === "object"
        ? anim.deform
        : hasLegacyFfd && typeof anim.ffd === "object"
          ? anim.ffd
          : null;
    if (deform) {
      for (const [skinName, slotMap] of Object.entries(deform)) {
        const skinEntry = skinByName.get(String(skinName));
        if (!skinEntry) {
          errors.push(`Animation "${animName}" deform references missing skin "${skinName}".`);
          continue;
        }
        if (!slotMap || typeof slotMap !== "object") continue;
        const skinAttachments = (skinEntry && skinEntry.attachments) || {};
        for (const [slotName, attMap] of Object.entries(slotMap)) {
          if (!slotNames.has(String(slotName))) {
            errors.push(`Animation "${animName}" deform references missing slot "${slotName}".`);
            continue;
          }
          if (!attMap || typeof attMap !== "object") continue;
          const slotAttMap = (skinAttachments && skinAttachments[slotName]) || null;
          if (!slotAttMap || typeof slotAttMap !== "object") {
            errors.push(`Animation "${animName}" deform slot "${slotName}" has no attachments in skin "${skinName}".`);
            continue;
          }
          for (const [attName, rows] of Object.entries(attMap)) {
            const att = slotAttMap[attName];
            if (!att || typeof att !== "object") {
              errors.push(
                `Animation "${animName}" deform references missing attachment "${slotName}/${attName}" in skin "${skinName}".`
              );
              continue;
            }
            if (!Array.isArray(rows)) {
              errors.push(`Animation "${animName}" deform "${slotName}/${attName}" must be an array of keyframes.`);
              continue;
            }
            const maxValues = Array.isArray(att.uvs) ? att.uvs.length : null;
            let prevTime = -Infinity;
            for (let i = 0; i < rows.length; i += 1) {
              const row = rows[i];
              if (!row || typeof row !== "object") {
                errors.push(`Animation "${animName}" deform "${slotName}/${attName}" key ${i} is invalid.`);
                continue;
              }
              const t = Number(row.time);
              if (!Number.isFinite(t) || t < 0) {
                errors.push(`Animation "${animName}" deform "${slotName}/${attName}" key ${i} has invalid time.`);
              }
              if (Number.isFinite(t) && t + 1e-6 < prevTime) {
                errors.push(`Animation "${animName}" deform "${slotName}/${attName}" keyframes are not time-sorted.`);
              }
              if (Number.isFinite(t)) prevTime = t;
              const off = Math.max(0, Number(row.offset) || 0);
              if (row.offset != null && (!Number.isInteger(Number(row.offset)) || Number(row.offset) < 0)) {
                errors.push(`Animation "${animName}" deform "${slotName}/${attName}" key ${i} has invalid offset.`);
              }
              const verts = Array.isArray(row.vertices) ? row.vertices : [];
              for (let vi = 0; vi < verts.length; vi += 1) {
                if (!Number.isFinite(Number(verts[vi]))) {
                  errors.push(`Animation "${animName}" deform "${slotName}/${attName}" key ${i} has non-numeric vertex data.`);
                  break;
                }
              }
              if (Number.isFinite(maxValues) && maxValues >= 0 && off + verts.length > maxValues) {
                errors.push(
                  `Animation "${animName}" deform "${slotName}/${attName}" key ${i} exceeds vertex range (${off + verts.length} > ${maxValues}).`
                );
              }
            }
          }
        }
      }
    }
    if (hasLegacyFfd) {
      warnings.push(`Animation "${animName}" uses legacy "ffd" timeline name; runtime-standard is "deform".`);
    }
  }

  return { errors, warnings };
}
