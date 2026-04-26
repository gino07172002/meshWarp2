// ROLE: Native project export, Spine 4.x JSON / .skel binary / .atlas
// builder, atlas advanced packer, pre-export diagnostics + auto-fix.
// EXPORTS:
//   - buildProjectPayload (native .json bundle)
//   - buildSpineJsonData, exportSpineSkelBinary, validateSpineJsonForExport
//   - packSlotsToAtlasPage (shelf packer; multi-page, rotation, trim,
//     bleed) → returns { pages: [{canvas, name, ...}], atlas, scale }
//   - trimTransparentEdges, drawAtlasRegion, drawBleedRing
//   - exportSpineData (full pipeline: JSON + .atlas + N PNGs + .skel)
//   - sanitizeExportName, downloadBlobFile, canvasToBlob
//   - toSpineColor, colorHexToInt (color encoding helpers)
// EVENT WIRING: #fileExportSpineBtn, atlas-options inputs.
// HEAVY FILE (~3900 lines).
function sanitizeExportName(name, fallback) {
  const raw = String(name || "").trim();
  const cleaned = raw.replace(/[\\/:*?"<>|]+/g, "_").replace(/\s+/g, "_");
  return cleaned || fallback;
}

function makeUniqueName(base, used, fallback = "item") {
  const seed = sanitizeExportName(base, fallback);
  let out = seed;
  let i = 2;
  while (used.has(out)) {
    out = `${seed}_${i}`;
    i += 1;
  }
  used.add(out);
  return out;
}

function downloadBlobFile(blob, filename) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function canvasToBlob(canvas, type = "image/png") {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to encode canvas."));
        return;
      }
      resolve(blob);
    }, type);
  });
}

async function canvasFromDataUrl(dataUrl) {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const bmp = await createImageBitmap(blob);
  const c = makeCanvas(bmp.width, bmp.height);
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable.");
  ctx.drawImage(bmp, 0, 0);
  return c;
}

function buildProjectPayload() {
  const canvasIndexMap = new Map();
  const slotImages = [];
  const registerCanvas = (canvas) => {
    if (!canvas) return -1;
    if (!canvasIndexMap.has(canvas)) {
      canvasIndexMap.set(canvas, slotImages.length);
      slotImages.push(canvas.toDataURL("image/png"));
    }
    return canvasIndexMap.get(canvas);
  };
  const slotRecords = state.slots.map((s) => {
    ensureSlotAttachmentState(s);
    ensureSlotAttachments(s);
    let imageIndex = -1;
    const slotCanvas = getSlotCanvas(s);
    if (slotCanvas) {
      imageIndex = registerCanvas(slotCanvas);
    }
    const attachmentRecordsWithPlaceholder = ensureSlotAttachments(s).map((a) => ({
      name: a.name,
      placeholder: String(a && a.placeholder ? a.placeholder : s.placeholderName || s.attachmentName || "main"),
      imageIndex: registerCanvas(a.canvas),
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
            setupIndex: Math.max(0, Math.round(Number(a.sequence.setupIndex) || 0)),
            mode: Number(a.sequence.mode) || 0,
            path: String(a.sequence.path || ""),
            frameImageIndices: Array.isArray(a.sequence.frames)
              ? a.sequence.frames.map((cv) => registerCanvas(cv))
              : [],
          }
          : { enabled: false, count: 1, start: 0, digits: 2, setupIndex: 0, mode: 0, path: "", frameImageIndices: [] },
      useWeights: a && a.useWeights === true,
      weightBindMode: a && a.weightBindMode ? String(a.weightBindMode) : "none",
      weightMode: a && a.weightMode ? String(a.weightMode) : "free",
      influenceBones: Array.isArray(a && a.influenceBones) ? a.influenceBones.filter((v) => Number.isFinite(v)) : [],
      clipEnabled: !!(a && a.clipEnabled),
      clipSource: a && a.clipSource === "contour" ? "contour" : "fill",
      clipEndSlotId: a && a.clipEndSlotId ? String(a.clipEndSlotId) : null,
      rect: a && a.rect ? JSON.parse(JSON.stringify(a.rect)) : null,
      baseImageTransform: normalizeBaseImageTransform(a && a.baseImageTransform),
      meshData: serializeSlotMeshData(a && a.meshData),
      meshContour:
        a && a.meshContour && Array.isArray(a.meshContour.points)
          ? JSON.parse(JSON.stringify(a.meshContour))
          : null,
    }));
    // auto-weight stores weight data on the attachment object; prefer att.* over slot.* for serialization
    const sAtt = getActiveAttachment(s);
    return {
      id: s.id || makeSlotId(),
      name: s.name,
      attachmentName: s.attachmentName || "main",
      placeholderName: String(s.placeholderName || s.attachmentName || "main"),
      activeAttachment:
        s && Object.prototype.hasOwnProperty.call(s, "activeAttachment")
          ? s.activeAttachment == null
            ? null
            : String(s.activeAttachment)
          : String(s.attachmentName || "main"),
      editorVisible: isSlotEditorVisible(s),
      bone: s.bone,
      visible: isSlotEditorVisible(s),
      alpha: Number.isFinite(s.alpha) ? s.alpha : 1,
      r: Number.isFinite(s.r) ? s.r : 1,
      g: Number.isFinite(s.g) ? s.g : 1,
      b: Number.isFinite(s.b) ? s.b : 1,
      blend: normalizeSlotBlendMode(s && s.blend),
      darkEnabled: !!(s && s.darkEnabled),
      dr: Number.isFinite(s && s.dr) ? s.dr : 0,
      dg: Number.isFinite(s && s.dg) ? s.dg : 0,
      db: Number.isFinite(s && s.db) ? s.db : 0,
      tx: Number.isFinite(s.tx) ? s.tx : 0,
      ty: Number.isFinite(s.ty) ? s.ty : 0,
      rot: Number.isFinite(s.rot) ? s.rot : 0,
      baseImageTransform: normalizeBaseImageTransform(s && s.baseImageTransform),
      rect: s.rect || null,
      docWidth: s.docWidth || state.imageWidth,
      docHeight: s.docHeight || state.imageHeight,
      imageIndex,
      attachments: attachmentRecordsWithPlaceholder,
    };
  });

  return {
    projectVersion: 2,
    export: {
      spineCompat: getSpineCompatPreset(state.export && state.export.spineCompat).id,
    },
    slotMeshGridReplaceContour: !!state.slotMesh.gridReplaceContour,
    baseImageTransform: normalizeBaseImageTransform(state.baseImageTransform),
    imageWidth: state.imageWidth,
    imageHeight: state.imageHeight,
    gridX: Number(els.gridX.value) || 24,
    gridY: Number(els.gridY.value) || 24,
    rigBones: state.mesh ? state.mesh.rigBones : [],
    rigCoordinateSpace: state.rigCoordinateSpace === "edit" ? "edit" : "runtime",
    ikConstraints:
      state.mesh && Array.isArray(state.mesh.ikConstraints)
        ? state.mesh.ikConstraints.map((c, i) => ({
          name: c && c.name ? c.name : `ik_${i}`,
          bones: Array.isArray(c && c.bones) ? c.bones.map((v) => Number(v) || 0) : [],
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
        }))
        : [],
    transformConstraints:
      state.mesh && Array.isArray(state.mesh.transformConstraints)
        ? state.mesh.transformConstraints.map((c, i) => ({
          name: c && c.name ? c.name : `transform_${i}`,
          bones: Array.isArray(c && c.bones) ? c.bones.map((v) => Number(v) || 0) : [],
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
        }))
        : [],
    pathConstraints:
      state.mesh && Array.isArray(state.mesh.pathConstraints)
        ? state.mesh.pathConstraints.map((c, i) => ({
          name: c && c.name ? c.name : `path_${i}`,
          bones: Array.isArray(c && c.bones) ? c.bones.map((v) => Number(v) || 0) : [],
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
        }))
        : [],
    physicsConstraints:
      state.mesh && Array.isArray(state.mesh.physicsConstraints)
        ? state.mesh.physicsConstraints.map((c, i) => ({
          name: c && c.name ? c.name : `physics_${i}`,
          bone: Number(c && c.bone),
          x: !!(c && c.x),
          y: !!(c && c.y),
          rotate: c ? c.rotate !== false : true,
          scaleX: !!(c && c.scaleX),
          shearX: !!(c && c.shearX),
          mix: math.clamp(Number(c && c.mix) || 1, 0, 1),
          inertia: math.clamp(Number(c && c.inertia) || 1, 0, 1),
          strength: Math.max(0, Number(c && c.strength) || 100),
          damping: math.clamp(Number(c && c.damping) || 1, 0, 10),
          massInverse: Math.max(0.01, Number(c && c.massInverse) || 1),
          wind: Number(c && c.wind) || 0,
          gravity: Number(c && c.gravity) || 0,
          step: math.clamp(Number(c && c.step) || 1 / 60, 1 / 240, 1 / 15),
          limit: Math.max(0, Number(c && c.limit) || 5000),
          order: getConstraintOrder(c, i),
          skinRequired: !!(c && c.skinRequired),
          enabled: c ? c.enabled !== false : true,
        }))
        : [],
    animations: state.anim.animations,
    animationState: {
      layerTracks: ensureAnimLayerTracks().map((t) => ({
        id: t.id,
        name: t.name,
        enabled: t.enabled !== false,
        animId: t.animId || "",
        loop: t.loop !== false,
        speed: Number.isFinite(Number(t.speed)) ? math.clamp(Number(t.speed), -10, 10) : 1,
        offset: Number(t.offset) || 0,
        alpha: math.clamp(Number(t.alpha) || 0, 0, 1),
        mode: t.mode === "add" ? "add" : "replace",
        maskMode: t.maskMode === "include" ? "include" : t.maskMode === "exclude" ? "exclude" : "all",
        maskBones: Array.isArray(t.maskBones) ? t.maskBones.map((v) => Number(v) || 0) : [],
      })),
      selectedLayerTrackId: String(state.anim.selectedLayerTrackId || ""),
      batchExportOpen: !!state.anim.batchExportOpen,
      batchExport: {
        format:
          state.anim.batchExport && (state.anim.batchExport.format === "gif" || state.anim.batchExport.format === "pngseq")
            ? state.anim.batchExport.format
            : "webm",
        fps: Math.max(1, Math.min(60, Math.round(Number(state.anim.batchExport && state.anim.batchExport.fps) || 15))),
        prefix: String((state.anim.batchExport && state.anim.batchExport.prefix) || "batch"),
        retries: Math.max(0, Math.min(5, Math.round(Number(state.anim.batchExport && state.anim.batchExport.retries) || 1))),
        delayMs: Math.max(0, Math.min(5000, Math.round(Number(state.anim.batchExport && state.anim.batchExport.delayMs) || 120))),
        zipPng: !!(state.anim.batchExport && state.anim.batchExport.zipPng),
      },
      stateMachine: JSON.parse(JSON.stringify(ensureStateMachine())),
      onionSkin: JSON.parse(JSON.stringify(ensureOnionSkinSettings())),
    },
    skinSets: ensureSkinSets().map((s) => ({
      id: s.id,
      name: s.name,
      slotAttachments: { ...(s.slotAttachments || {}) },
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
      bones: Array.isArray(s.bones) ? s.bones.slice() : [],
      folder: typeof s.folder === "string" ? s.folder : "",
    })),
    selectedSkinSet: Number(state.selectedSkinSet) || 0,
    activeSkinSetId: state.activeSkinSetId || null,
    slotViewMode: state.slotViewMode,
    activeSlot: state.activeSlot,
    slotImages,
    slots: slotRecords,
  };
}

class SpineBinaryWriter {
  constructor() {
    this.bytes = [];
  }

  byte(v) {
    this.bytes.push(v & 0xff);
  }

  bool(v) {
    this.byte(v ? 1 : 0);
  }

  varint(value, optimizePositive = true) {
    let v = value | 0;
    if (!optimizePositive) v = (v << 1) ^ (v >> 31);
    while (v > 0x7f) {
      this.byte((v & 0x7f) | 0x80);
      v >>>= 7;
    }
    this.byte(v & 0x7f);
  }

  float(value) {
    const buf = new ArrayBuffer(4);
    const view = new DataView(buf);
    view.setFloat32(0, Number(value) || 0, false);
    this.byte(view.getUint8(0));
    this.byte(view.getUint8(1));
    this.byte(view.getUint8(2));
    this.byte(view.getUint8(3));
  }

  int(value) {
    const buf = new ArrayBuffer(4);
    const view = new DataView(buf);
    view.setInt32(0, value | 0, false);
    this.byte(view.getUint8(0));
    this.byte(view.getUint8(1));
    this.byte(view.getUint8(2));
    this.byte(view.getUint8(3));
  }

  short(value) {
    const buf = new ArrayBuffer(2);
    const view = new DataView(buf);
    view.setInt16(0, value | 0, false);
    this.byte(view.getUint8(0));
    this.byte(view.getUint8(1));
  }

  long(value) {
    let v = BigInt(value);
    if (v < 0n) v = (1n << 64n) + v;
    for (let shift = 56n; shift >= 0n; shift -= 8n) {
      this.byte(Number((v >> shift) & 0xffn));
    }
  }

  string(text) {
    if (text == null) {
      this.byte(0);
      return;
    }
    const s = String(text);
    if (s.length === 0) {
      this.byte(1);
      return;
    }
    const data = new TextEncoder().encode(s);
    this.varint(data.length + 1, true);
    for (let i = 0; i < data.length; i += 1) this.byte(data[i]);
  }

  refString(text, sharedMap) {
    if (text == null) {
      this.varint(0, true);
      return;
    }
    const idx = sharedMap.get(String(text));
    if (!Number.isFinite(idx) || idx < 0) {
      this.varint(0, true);
      return;
    }
    this.varint(idx + 1, true);
  }

  toUint8Array() {
    return new Uint8Array(this.bytes);
  }
}

function toSpineColor(r, g, b, a, visible = true) {
  const rr = Math.round(math.clamp(Number(r), 0, 1) * 255)
    .toString(16)
    .padStart(2, "0");
  const gg = Math.round(math.clamp(Number(g), 0, 1) * 255)
    .toString(16)
    .padStart(2, "0");
  const bb = Math.round(math.clamp(Number(b), 0, 1) * 255)
    .toString(16)
    .padStart(2, "0");
  const aa = Math.round((visible === false ? 0 : math.clamp(Number(a), 0, 1)) * 255)
    .toString(16)
    .padStart(2, "0");
  return `${rr}${gg}${bb}${aa}`;
}

function toSpineRgb(r, g, b) {
  const rr = Math.round(math.clamp(Number(r) || 0, 0, 1) * 255)
    .toString(16)
    .padStart(2, "0");
  const gg = Math.round(math.clamp(Number(g) || 0, 0, 1) * 255)
    .toString(16)
    .padStart(2, "0");
  const bb = Math.round(math.clamp(Number(b) || 0, 0, 1) * 255)
    .toString(16)
    .padStart(2, "0");
  return `${rr}${gg}${bb}`;
}

function colorHexToInt(color) {
  const c = String(color || "").trim();
  if (!/^[0-9a-fA-F]{8}$/.test(c)) return 0xffffffff;
  return Number.parseInt(c, 16) >>> 0;
}

function darkColorHexToInt(color) {
  const c = String(color || "").trim();
  if (/^[0-9a-fA-F]{6}$/.test(c)) return Number.parseInt(`${c}ff`, 16) >>> 0;
  if (/^[0-9a-fA-F]{8}$/.test(c)) return Number.parseInt(c, 16) >>> 0;
  return -1;
}

function getSkinEntries(spineJson) {
  const skins = spineJson && spineJson.skins ? spineJson.skins : null;
  if (Array.isArray(skins)) {
    return skins.map((s, i) => ({
      name: s && s.name ? s.name : `skin_${i}`,
      attachments: (s && s.attachments) || {},
    }));
  }
  if (skins && typeof skins === "object") {
    return Object.entries(skins).map(([name, v]) => ({
      name,
      attachments: v && typeof v === "object" && v.attachments ? v.attachments : v || {},
    }));
  }
  return [];
}

function buildSharedStrings(spineJson) {
  const out = [];
  const map = new Map();
  function add(v) {
    if (v == null) return;
    const s = String(v);
    if (!s || map.has(s)) return;
    map.set(s, out.length);
    out.push(s);
  }
  for (const b of spineJson.bones || []) {
    add(b.name);
    add(b.parent);
  }
  for (const s of spineJson.slots || []) {
    add(s.name);
    add(s.bone);
    add(s.attachment);
  }
  for (const ik of spineJson.ik || []) {
    add(ik && ik.name);
    add(ik && ik.target);
    for (const bn of (ik && ik.bones) || []) add(bn);
  }
  for (const tc of spineJson.transform || []) {
    add(tc && tc.name);
    add(tc && tc.target);
    for (const bn of (tc && tc.bones) || []) add(bn);
  }
  for (const pc of spineJson.path || []) {
    add(pc && pc.name);
    add(pc && pc.target);
    for (const bn of (pc && pc.bones) || []) add(bn);
  }
  const skinEntries = getSkinEntries(spineJson);
  for (const skinEntry of skinEntries) {
    add(skinEntry.name);
    const skin = skinEntry.attachments || {};
    for (const slotName of Object.keys(skin)) {
      add(slotName);
      const attMap = skin[slotName] || {};
      for (const attName of Object.keys(attMap)) {
        add(attName);
        const att = attMap[attName] || {};
        add(att.name);
        add(att.path);
        add(att.skin);
        add(att.parent);
      }
    }
  }
  const events = spineJson && spineJson.events && typeof spineJson.events === "object" ? spineJson.events : {};
  for (const [eventName] of Object.entries(events)) add(eventName);
  const anims = spineJson.animations || {};
  for (const animName of Object.keys(anims)) {
    add(animName);
    const a = anims[animName] || {};
    const bones = a.bones || {};
    for (const bName of Object.keys(bones)) add(bName);
    const ik = a.ik || {};
    for (const ikName of Object.keys(ik)) add(ikName);
    const tfc = a.transform || {};
    for (const tfcName of Object.keys(tfc)) add(tfcName);
    const pth = a.paths || {};
    for (const pthName of Object.keys(pth)) add(pthName);
  }
  return { strings: out, index: map };
}

function writeCurve(writer, key) {
  writer.byte(key && key.curve === "stepped" ? 1 : 0);
}

function writeBoneTimelineList(writer, tl) {
  const keys = [];
  if (Array.isArray(tl.rotate) && tl.rotate.length > 0) keys.push({ type: 0, list: tl.rotate });
  if (Array.isArray(tl.translate) && tl.translate.length > 0) keys.push({ type: 1, list: tl.translate });
  if (Array.isArray(tl.scale) && tl.scale.length > 0) keys.push({ type: 2, list: tl.scale });
  if (Array.isArray(tl.shear) && tl.shear.length > 0) keys.push({ type: 3, list: tl.shear });
  writer.varint(keys.length, true);
  for (const k of keys) {
    const typeCode = { 0: 0, 1: 1, 2: 4, 3: 7 }[k.type] ?? 0;
    writer.byte(typeCode);
    writer.varint(k.list.length, true);
    if (typeCode !== 10) writer.varint(0, true);
    for (let i = 0; i < k.list.length; i += 1) {
      const row = k.list[i] || {};
      writer.float(Number(row.time) || 0);
      if (typeCode === 0) {
        writer.float(Number(row.value) || 0);
      } else {
        writer.float(Number(row.x) || 0);
        writer.float(Number(row.y) || 0);
      }
      if (i < k.list.length - 1) writeCurve(writer, row);
    }
  }
}

function writeSlotTimelineList(writer, tl, sharedMap) {
  const keys = [];
  if (Array.isArray(tl.attachment) && tl.attachment.length > 0) keys.push({ type: 0, list: tl.attachment });
  if (Array.isArray(tl.color) && tl.color.length > 0) keys.push({ type: 1, list: tl.color });
  if (Array.isArray(tl.twoColor) && tl.twoColor.length > 0) keys.push({ type: 2, list: tl.twoColor });
  writer.varint(keys.length, true);
  for (const k of keys) {
    const typeCode = { 0: 0, 1: 1, 2: 3 }[k.type] ?? 0;
    writer.byte(typeCode);
    writer.varint(k.list.length, true);
    if (typeCode !== 0) writer.varint(0, true);
    for (let i = 0; i < k.list.length; i += 1) {
      const row = k.list[i] || {};
      writer.float(Number(row.time) || 0);
      if (typeCode === 0) {
        writer.refString(row.name != null ? String(row.name) : null, sharedMap);
      } else if (typeCode === 1) {
        const rgba = String(row.color || "ffffffff").trim();
        const safe = /^[0-9a-fA-F]{8}$/.test(rgba) ? rgba : "ffffffff";
        writer.byte(Number.parseInt(safe.slice(0, 2), 16));
        writer.byte(Number.parseInt(safe.slice(2, 4), 16));
        writer.byte(Number.parseInt(safe.slice(4, 6), 16));
        writer.byte(Number.parseInt(safe.slice(6, 8), 16));
        if (i < k.list.length - 1) writeCurve(writer, row);
      } else {
        const light = String(row.light || "ffffffff").trim();
        const dark = String(row.dark || "000000").trim();
        const safeLight = /^[0-9a-fA-F]{8}$/.test(light) ? light : "ffffffff";
        const safeDark = /^[0-9a-fA-F]{6}$/.test(dark) ? dark : "000000";
        writer.byte(Number.parseInt(safeLight.slice(0, 2), 16));
        writer.byte(Number.parseInt(safeLight.slice(2, 4), 16));
        writer.byte(Number.parseInt(safeLight.slice(4, 6), 16));
        writer.byte(Number.parseInt(safeLight.slice(6, 8), 16));
        writer.byte(Number.parseInt(safeDark.slice(0, 2), 16));
        writer.byte(Number.parseInt(safeDark.slice(2, 4), 16));
        writer.byte(Number.parseInt(safeDark.slice(4, 6), 16));
        if (i < k.list.length - 1) writeCurve(writer, row);
      }
    }
  }
}

function writeSkelVertices(writer, vertices, vertexCount) {
  const arr = Array.isArray(vertices) ? vertices : [];
  writer.varint(vertexCount, true);
  if (arr.length === vertexCount * 2) {
    for (let i = 0; i < arr.length; i += 1) writer.float(Number(arr[i]) || 0);
    return;
  }
  let p = 0;
  for (let i = 0; i < vertexCount; i += 1) {
    const boneCount = Math.max(0, Number(arr[p++]) || 0);
    writer.varint(boneCount, true);
    for (let b = 0; b < boneCount; b += 1) {
      writer.varint(Math.max(0, Number(arr[p++]) || 0), true);
      writer.float(Number(arr[p++]) || 0);
      writer.float(Number(arr[p++]) || 0);
      writer.float(Number(arr[p++]) || 0);
    }
  }
}

function writeSkelSequence(writer, seq) {
  const s = seq && typeof seq === "object" ? seq : {};
  writer.varint(Math.max(1, Math.round(Number(s.count) || 1)), true);
  writer.varint(Math.max(0, Math.round(Number(s.start) || 0)), true);
  writer.varint(Math.max(1, Math.round(Number(s.digits) || 1)), true);
  writer.varint(Math.max(0, Math.round(Number(s.setup != null ? s.setup : s.setupIndex) || 0)), true);
}

function isWeightedSkelVertices(vertices, vertexCount) {
  return !(Array.isArray(vertices) && vertices.length === vertexCount * 2);
}

function writeSkelAttachment(writer, attName, att, sharedMap, skinNameToIndex, currentSkinIndex) {
  const a = att || {};
  const type = String(a.type || "region");
  const typeCode = {
    region: 0,
    boundingbox: 1,
    mesh: 2,
    linkedmesh: 3,
    path: 4,
    point: 5,
    clipping: 6,
  }[type];
  writer.refString(attName, sharedMap);
  const effectiveName = a.name && String(a.name).trim() ? String(a.name) : String(attName || "");
  let flags = Number.isFinite(typeCode) ? typeCode : 0;
  if (effectiveName !== String(attName || "")) flags |= 8;

  if (type === "region") {
    const path = a.path != null && String(a.path).length > 0 ? String(a.path) : effectiveName;
    const color = String(a.color || "").trim().toLowerCase();
    if (path !== effectiveName) flags |= 16;
    if (color && color !== "ffffffff") flags |= 32;
    if (a.sequence && a.sequence.enabled) flags |= 64;
    if (Math.abs(Number(a.rotation) || 0) > 1e-6) flags |= 128;
    writer.byte(flags);
    if (flags & 8) writer.refString(effectiveName, sharedMap);
    if (flags & 16) writer.refString(path, sharedMap);
    if (flags & 32) writer.int(colorHexToInt(color || "ffffffff"));
    if (flags & 64) writeSkelSequence(writer, a.sequence);
    if (flags & 128) writer.float(Number(a.rotation) || 0);
    writer.float(Number(a.x) || 0);
    writer.float(Number(a.y) || 0);
    writer.float(Number(a.scaleX) || 1);
    writer.float(Number(a.scaleY) || 1);
    writer.float(Number(a.width) || 0);
    writer.float(Number(a.height) || 0);
    return;
  }

  if (type === "boundingbox") {
    const vertexCount = Math.max(0, Number(a.vertexCount) || Math.floor((Array.isArray(a.vertices) ? a.vertices.length : 0) / 2));
    if (isWeightedSkelVertices(a.vertices, vertexCount)) flags |= 16;
    writer.byte(flags);
    if (flags & 8) writer.refString(effectiveName, sharedMap);
    writeSkelVertices(writer, a.vertices, vertexCount);
    return;
  }

  if (type === "mesh") {
    const uvs = Array.isArray(a.uvs) ? a.uvs : [];
    const triangles = Array.isArray(a.triangles) ? a.triangles : [];
    const vertexCount = Math.floor(uvs.length / 2);
    const path = a.path != null && String(a.path).length > 0 ? String(a.path) : effectiveName;
    const color = String(a.color || "").trim().toLowerCase();
    const hull = Math.max(0, Number(a.hull) || 0);
    const expectedTriangleCount = Math.max(0, (vertexCount * 2 - hull - 2) * 3);
    if (path !== effectiveName) flags |= 16;
    if (color && color !== "ffffffff") flags |= 32;
    if (a.sequence && a.sequence.enabled) flags |= 64;
    if (isWeightedSkelVertices(a.vertices, vertexCount)) flags |= 128;
    writer.byte(flags);
    if (flags & 8) writer.refString(effectiveName, sharedMap);
    if (flags & 16) writer.refString(path, sharedMap);
    if (flags & 32) writer.int(colorHexToInt(color || "ffffffff"));
    if (flags & 64) writeSkelSequence(writer, a.sequence);
    writer.varint(hull, true);
    for (let i = 0; i < uvs.length; i += 1) writer.float(Number(uvs[i]) || 0);
    writeSkelVertices(writer, a.vertices, vertexCount);
    for (let i = 0; i < expectedTriangleCount; i += 1) writer.varint(Math.max(0, Number(triangles[i]) || 0), true);
    return;
  }

  if (type === "linkedmesh") {
    const path = a.path != null && String(a.path).length > 0 ? String(a.path) : effectiveName;
    const color = String(a.color || "").trim().toLowerCase();
    if (path !== effectiveName) flags |= 16;
    if (color && color !== "ffffffff") flags |= 32;
    if (a.sequence && a.sequence.enabled) flags |= 64;
    if (a.deform !== false) flags |= 128;
    writer.byte(flags);
    if (flags & 8) writer.refString(effectiveName, sharedMap);
    if (flags & 16) writer.refString(path, sharedMap);
    if (flags & 32) writer.int(colorHexToInt(color || "ffffffff"));
    if (flags & 64) writeSkelSequence(writer, a.sequence);
    const linkedSkinIndex = a.skin != null && String(a.skin).length > 0
      ? Math.max(0, skinNameToIndex.get(String(a.skin)) || 0)
      : Math.max(0, currentSkinIndex || 0);
    writer.varint(linkedSkinIndex, true);
    writer.refString(a.parent || null, sharedMap);
    return;
  }

  if (type === "path") {
    const arr = Array.isArray(a.vertices) ? a.vertices : [];
    const vertexCount = Math.max(0, Number(a.vertexCount) || Math.floor(arr.length / 2));
    const expectedLengths = Math.floor(vertexCount / 3);
    const lens = Array.isArray(a.lengths) ? a.lengths : [];
    if (a.closed) flags |= 16;
    if (a.constantSpeed !== false) flags |= 32;
    if (isWeightedSkelVertices(arr, vertexCount)) flags |= 64;
    writer.byte(flags);
    if (flags & 8) writer.refString(effectiveName, sharedMap);
    writeSkelVertices(writer, arr, vertexCount);
    for (let i = 0; i < expectedLengths; i += 1) writer.float(Number(lens[i]) || 0);
    return;
  }

  if (type === "point") {
    writer.byte(flags);
    if (flags & 8) writer.refString(effectiveName, sharedMap);
    writer.float(Number(a.rotation) || 0);
    writer.float(Number(a.x) || 0);
    writer.float(Number(a.y) || 0);
    return;
  }

  if (type === "clipping") {
    const vertexCount = Math.max(0, Number(a.vertexCount) || Math.floor((Array.isArray(a.vertices) ? a.vertices.length : 0) / 2));
    if (isWeightedSkelVertices(a.vertices, vertexCount)) flags |= 16;
    writer.byte(flags);
    if (flags & 8) writer.refString(effectiveName, sharedMap);
    writer.varint(Math.max(0, Number(a.end) || 0), true);
    writeSkelVertices(writer, a.vertices, vertexCount);
    return;
  }
}

const SPINE_COMPAT_PRESETS = {
  "4.2": {
    id: "4.2",
    version: "4.2.22",
    stripIkUniform: false,
  },
  "4.1": {
    id: "4.1",
    version: "4.1.24",
    stripIkUniform: true,
  },
};

function getSpineCompatPreset(mode) {
  const key = String(mode || "");
  return SPINE_COMPAT_PRESETS[key] || SPINE_COMPAT_PRESETS["4.2"];
}

// ============================================================
// SECTION: Export — Spine SKEL Binary
// Writes Spine 4.1/4.2 binary .skel format.
// Known issue: large deform vertex offsets may have edge cases.
// ============================================================
function exportSpineSkelBinary(spineJson) {
  const writer = new SpineBinaryWriter();
  const skel = spineJson.skeleton || {};
  const shared = buildSharedStrings(spineJson);
  const sharedMap = shared.index;
  const hashValue =
    typeof skel.hash === "number"
      ? BigInt(Math.trunc(skel.hash))
      : typeof skel.hash === "string" && /^-?\d+$/.test(skel.hash.trim())
        ? BigInt(skel.hash.trim())
        : 0n;
  writer.long(hashValue);
  writer.string(skel.spine || getSpineCompatPreset(state.export && state.export.spineCompat).version);
  writer.float(Number(skel.x) || 0);
  writer.float(Number(skel.y) || 0);
  writer.float(Number(skel.width) || 0);
  writer.float(Number(skel.height) || 0);
  writer.float(1);
  writer.bool(false);

  writer.varint(shared.strings.length, true);
  for (const s of shared.strings) writer.string(s);

  const bones = spineJson.bones || [];
  const boneNameToIndex = new Map();
  for (let i = 0; i < bones.length; i += 1) {
    boneNameToIndex.set(String(bones[i] && bones[i].name ? bones[i].name : `bone_${i}`), i);
  }
  writer.varint(bones.length, true);
  for (let i = 0; i < bones.length; i += 1) {
    const b = bones[i] || {};
    writer.string(b.name || `bone_${i}`);
    if (i > 0) {
      const parentIndex = boneNameToIndex.get(String(b.parent || ""));
      writer.varint(Number.isFinite(parentIndex) ? parentIndex : 0, true);
    }
    writer.float(Number(b.rotation) || 0);
    writer.float(Number(b.x) || 0);
    writer.float(Number(b.y) || 0);
    writer.float(Number(b.scaleX) || 1);
    writer.float(Number(b.scaleY) || 1);
    writer.float(Number(b.shearX) || 0);
    writer.float(Number(b.shearY) || 0);
    writer.float(Number(b.length) || 0);
    const inherit = normalizeBoneInheritValue(b.inherit);
    const inheritMap = {
      normal: 0,
      onlyTranslation: 1,
      noRotationOrReflection: 2,
      noScale: 3,
      noScaleOrReflection: 4,
    };
    writer.varint(inheritMap[inherit] ?? 0, true);
    writer.bool(!!b.skin);
    writer.int(colorHexToInt(b.color || "9b9b9bff"));
  }

  const slots = spineJson.slots || [];
  const slotNameToIndex = new Map();
  for (let i = 0; i < slots.length; i += 1) {
    const sn = slots[i] && slots[i].name ? slots[i].name : `slot_${i}`;
    slotNameToIndex.set(sn, i);
  }
  writer.varint(slots.length, true);
  for (let i = 0; i < slots.length; i += 1) {
    const s = slots[i] || {};
    writer.string(s.name || `slot_${i}`);
    const boneIndex = boneNameToIndex.get(String(s.bone || ""));
    writer.varint(Number.isFinite(boneIndex) ? boneIndex : 0, true);
    writer.int(colorHexToInt(s.color || "ffffffff"));
    writer.int(darkColorHexToInt(s.dark));
    writer.refString(s.attachment || null, sharedMap);
    const blendMode = normalizeSlotBlendMode(s.blend);
    const blendIndex = blendMode === "additive" ? 1 : blendMode === "multiply" ? 2 : blendMode === "screen" ? 3 : 0;
    writer.varint(blendIndex, true);
  }

  const ikList = Array.isArray(spineJson.ik) ? spineJson.ik : [];
  const ikNameToIndex = new Map();
  writer.varint(ikList.length, true);
  for (let i = 0; i < ikList.length; i += 1) {
    const ik = ikList[i] || {};
    ikNameToIndex.set(String(ik.name || `ik_${i}`), i);
    const chain = Array.isArray(ik.bones) ? ik.bones : [];
    writer.string(ik.name || `ik_${i}`);
    writer.varint(getConstraintOrder(ik, i), true);
    writer.bool(!!ik.skin);
    writer.varint(chain.length, true);
    for (const bn of chain) {
      const bi = boneNameToIndex.get(String(bn));
      writer.varint(Number.isFinite(bi) ? bi : 0, true);
    }
    const targetIndex = boneNameToIndex.get(String(ik.target || ""));
    writer.varint(Number.isFinite(targetIndex) ? targetIndex : 0, true);
    let flags = 0;
    flags |= 32 | 64;
    if (ik.skin) flags |= 1;
    if (ik.bendPositive !== false) flags |= 2;
    if (ik.compress) flags |= 4;
    if (ik.stretch) flags |= 8;
    if (ik.uniform) flags |= 16;
    if (Math.abs(Number(ik.softness) || 0) > 1e-6) flags |= 128;
    writer.byte(flags);
    writer.float(Math.max(0, Number(ik.mix) || 0));
    if (flags & 128) writer.float(Math.max(0, Number(ik.softness) || 0));
  }
  const tfcList = Array.isArray(spineJson.transform) ? spineJson.transform : [];
  const tfcNameToIndex = new Map();
  writer.varint(tfcList.length, true);
  for (let i = 0; i < tfcList.length; i += 1) {
    const tc = tfcList[i] || {};
    tfcNameToIndex.set(String(tc.name || `transform_${i}`), i);
    const chain = Array.isArray(tc.bones) ? tc.bones : [];
    writer.string(tc.name || `transform_${i}`);
    writer.varint(getConstraintOrder(tc, i), true);
    writer.bool(!!tc.skin);
    writer.varint(chain.length, true);
    for (const bn of chain) {
      const bi = boneNameToIndex.get(String(bn));
      writer.varint(Number.isFinite(bi) ? bi : 0, true);
    }
    const targetIndex = boneNameToIndex.get(String(tc.target || ""));
    writer.varint(Number.isFinite(targetIndex) ? targetIndex : 0, true);
    let flags1 = 0;
    let flags2 = 0;
    if (tc.skin) flags1 |= 1;
    if (tc.local) flags1 |= 2;
    if (tc.relative) flags1 |= 4;
    if (Math.abs(Number(tc.rotation) || 0) > 1e-6) flags1 |= 8;
    if (Math.abs(Number(tc.x) || 0) > 1e-6) flags1 |= 16;
    if (Math.abs(Number(tc.y) || 0) > 1e-6) flags1 |= 32;
    if (Math.abs(Number(tc.scaleX) || 0) > 1e-6) flags1 |= 64;
    if (Math.abs(Number(tc.scaleY) || 0) > 1e-6) flags1 |= 128;
    if (Math.abs(Number(tc.shearY) || 0) > 1e-6) flags2 |= 1;
    flags2 |= 2 | 4 | 8 | 16 | 32 | 64;
    writer.byte(flags1);
    writer.byte(flags2);
    if (flags1 & 8) writer.float(Number(tc.rotation) || 0);
    if (flags1 & 16) writer.float(Number(tc.x) || 0);
    if (flags1 & 32) writer.float(Number(tc.y) || 0);
    if (flags1 & 64) writer.float(Number(tc.scaleX) || 0);
    if (flags1 & 128) writer.float(Number(tc.scaleY) || 0);
    if (flags2 & 1) writer.float(Number(tc.shearY) || 0);
    writer.float(math.clamp(Number(tc.rotateMix) || 0, 0, 1));
    writer.float(math.clamp(Number(tc.translateMix) || 0, 0, 1));
    writer.float(math.clamp(Number(tc.translateMix) || 0, 0, 1));
    writer.float(math.clamp(Number(tc.scaleMix) || 0, 0, 1));
    writer.float(math.clamp(Number(tc.scaleMix) || 0, 0, 1));
    writer.float(math.clamp(Number(tc.shearMix) || 0, 0, 1));
  }
  const pathList = Array.isArray(spineJson.path) ? spineJson.path : [];
  const pathNameToIndex = new Map();
  writer.varint(pathList.length, true);
  for (let i = 0; i < pathList.length; i += 1) {
    const pc = pathList[i] || {};
    pathNameToIndex.set(String(pc.name || `path_${i}`), i);
    const chain = Array.isArray(pc.bones) ? pc.bones : [];
    writer.string(pc.name || `path_${i}`);
    writer.varint(getConstraintOrder(pc, i), true);
    writer.bool(!!pc.skin);
    writer.varint(chain.length, true);
    for (const bn of chain) {
      const bi = boneNameToIndex.get(String(bn));
      writer.varint(Number.isFinite(bi) ? bi : 0, true);
    }
    const targetSlotIndex = slotNameToIndex.get(String(pc.target || ""));
    writer.varint(Number.isFinite(targetSlotIndex) ? targetSlotIndex : 0, true);
    const positionModeMap = { fixed: 0, percent: 1 };
    const spacingModeMap = { length: 0, fixed: 1, percent: 2, proportional: 3 };
    const rotateModeMap = { tangent: 0, chain: 1, chainScale: 2 };
    let flags = (positionModeMap[pc.positionMode] ?? 0) & 1;
    flags |= ((spacingModeMap[pc.spacingMode] ?? 0) & 3) << 1;
    flags |= ((rotateModeMap[pc.rotateMode] ?? 0) & 3) << 3;
    if (Math.abs(Number(pc.rotation) || 0) > 1e-6) flags |= 128;
    writer.byte(flags);
    if (flags & 128) writer.float(Number(pc.rotation) || 0);
    writer.float(Number(pc.position) || 0);
    writer.float(Number(pc.spacing) || 0);
    writer.float(math.clamp(Number(pc.rotateMix) || 0, 0, 1));
    writer.float(math.clamp(Number(pc.translateMix) || 0, 0, 1));
    writer.float(math.clamp(Number(pc.translateMix) || 0, 0, 1));
  }
  writer.varint(0, true);

  const skinEntries = getSkinEntries(spineJson);
  const skinNameToIndex = new Map();
  for (let i = 0; i < skinEntries.length; i += 1) {
    skinNameToIndex.set(skinEntries[i].name, i);
  }
  const defaultEntry = skinEntries.find((s) => s.name === "default") || skinEntries[0] || { name: "default", attachments: {} };
  const defaultSkin = defaultEntry.attachments || {};
  const defaultSlots = Object.keys(defaultSkin);
  writer.varint(defaultSlots.length, true);
  for (const slotName of defaultSlots) {
    const attMap = defaultSkin[slotName] || {};
    const attNames = Object.keys(attMap);
    writer.varint(Math.max(0, slotNameToIndex.get(String(slotName)) || 0), true);
    writer.varint(attNames.length, true);
    for (const attName of attNames) {
      const att = { ...(attMap[attName] || {}) };
      if (att.type === "clipping") {
        const endIndex = slotNameToIndex.get(String(att.end || ""));
        att.end = Number.isFinite(endIndex) ? endIndex : 0;
      }
      writeSkelAttachment(writer, attName, att, sharedMap, skinNameToIndex, skinNameToIndex.get(defaultEntry.name) || 0);
    }
  }

  const extraSkins = skinEntries.filter((s) => s.name !== defaultEntry.name);
  writer.varint(extraSkins.length, true);
  for (const skinEntry of extraSkins) {
    const skin = skinEntry.attachments || {};
    writer.refString(skinEntry.name, sharedMap);
    writer.varint(0, true);
    writer.varint(0, true);
    writer.varint(0, true);
    writer.varint(0, true);
    writer.varint(0, true);
    const slotNames = Object.keys(skin);
    writer.varint(slotNames.length, true);
    for (const slotName of slotNames) {
      const attMap = skin[slotName] || {};
      const attNames = Object.keys(attMap);
      writer.varint(Math.max(0, slotNameToIndex.get(String(slotName)) || 0), true);
      writer.varint(attNames.length, true);
      for (const attName of attNames) {
        const att = { ...(attMap[attName] || {}) };
        if (att.type === "clipping") {
          const endIndex = slotNameToIndex.get(String(att.end || ""));
          att.end = Number.isFinite(endIndex) ? endIndex : 0;
        }
        writeSkelAttachment(writer, attName, att, sharedMap, skinNameToIndex, skinNameToIndex.get(skinEntry.name) || 0);
      }
    }
  }

  const eventDefs = spineJson && spineJson.events && typeof spineJson.events === "object" ? spineJson.events : {};
  const eventNames = Object.keys(eventDefs);
  const eventNameToIndex = new Map();
  writer.varint(eventNames.length, true);
  for (let i = 0; i < eventNames.length; i += 1) {
    const name = eventNames[i];
    const ev = eventDefs[name] || {};
    eventNameToIndex.set(String(name), i);
    writer.string(name);
    writer.varint(Number(ev.int) || 0, false);
    writer.float(Number(ev.float) || 0);
    writer.string(ev.string != null ? String(ev.string) : "");
    const audioPath = ev.audio != null && String(ev.audio).length > 0 ? String(ev.audio) : null;
    writer.string(audioPath);
    if (audioPath != null) {
      writer.float(Number(ev.volume) || 0);
      writer.float(Number(ev.balance) || 0);
    }
  }

  const anims = spineJson.animations || {};
  const animNames = Object.keys(anims);
  writer.varint(animNames.length, true);
  for (const animName of animNames) {
    writer.string(animName);
    const a = anims[animName] || {};

    const slotTimelines = a.slots || {};
    const slotEntries = Object.entries(slotTimelines).filter(([, tl]) => tl && typeof tl === "object");
    writer.varint(slotEntries.length, true);
    for (const [slotName, tl] of slotEntries) {
      writer.varint(Math.max(0, slotNameToIndex.get(String(slotName)) || 0), true);
      writeSlotTimelineList(writer, tl, sharedMap);
    }

    const boneTimelines = a.bones || {};
    const boneEntries = Object.entries(boneTimelines).filter(([, tl]) => tl && typeof tl === "object");
    writer.varint(boneEntries.length, true);
    for (const [boneName, tl] of boneEntries) {
      writer.varint(Math.max(0, boneNameToIndex.get(String(boneName)) || 0), true);
      writeBoneTimelineList(writer, tl);
    }

    const ikTimelines = a.ik || {};
    const ikEntries = Object.entries(ikTimelines).filter(([, rows]) => Array.isArray(rows) && rows.length > 0);
    writer.varint(ikEntries.length, true);
    for (const [ikName, rows] of ikEntries) {
      const setupIk = ikList[Number(ikNameToIndex.get(String(ikName)) || 0)] || {};
      let currentMix = math.clamp(Number(setupIk.mix) || 0, 0, 1);
      let currentSoftness = Math.max(0, Number(setupIk.softness) || 0);
      let currentBend = setupIk.bendPositive !== false;
      let currentCompress = !!setupIk.compress;
      let currentStretch = !!setupIk.stretch;
      writer.varint(Math.max(0, ikNameToIndex.get(String(ikName)) || 0), true);
      writer.varint(rows.length, true);
      writer.varint(0, true);
      for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i] || {};
        if ("mix" in row) currentMix = math.clamp(Number(row.mix) || 0, 0, 1);
        if ("softness" in row) currentSoftness = Math.max(0, Number(row.softness) || 0);
        if ("bendPositive" in row) currentBend = row.bendPositive !== false;
        if ("compress" in row) currentCompress = !!row.compress;
        if ("stretch" in row) currentStretch = !!row.stretch;
        let flags = 0;
        flags |= 1 | 2;
        if (currentSoftness > 1e-6) flags |= 4;
        if (currentBend) flags |= 8;
        if (currentCompress) flags |= 16;
        if (currentStretch) flags |= 32;
        if (i > 0 && rows[i - 1] && rows[i - 1].curve === "stepped") flags |= 64;
        writer.byte(flags);
        writer.float(Number(row.time) || 0);
        if (flags & 1) {
          if (flags & 2) writer.float(currentMix);
        }
        if (flags & 4) writer.float(currentSoftness);
      }
    }
    const tfcTimelines = a.transform || {};
    const tfcEntries = Object.entries(tfcTimelines).filter(([, rows]) => Array.isArray(rows) && rows.length > 0);
    writer.varint(tfcEntries.length, true);
    for (const [tfcName, rows] of tfcEntries) {
      writer.varint(Math.max(0, tfcNameToIndex.get(String(tfcName)) || 0), true);
      writer.varint(rows.length, true);
      writer.varint(0, true);
      for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i] || {};
        writer.float(Number(row.time) || 0);
        writer.float(math.clamp(Number(row.rotateMix) || 0, 0, 1));
        writer.float(math.clamp(Number(row.translateMix) || 0, 0, 1));
        writer.float(math.clamp(Number(row.translateMix) || 0, 0, 1));
        writer.float(math.clamp(Number(row.scaleMix) || 0, 0, 1));
        writer.float(math.clamp(Number(row.scaleMix) || 0, 0, 1));
        writer.float(math.clamp(Number(row.shearMix) || 0, 0, 1));
        if (i < rows.length - 1) writeCurve(writer, row);
      }
    }
    const pathTimelines = a.paths || {};
    const pathEntries = Object.entries(pathTimelines).filter(([, tl]) => tl && typeof tl === "object");
    writer.varint(pathEntries.length, true);
    for (const [pathName, tl] of pathEntries) {
      writer.varint(Math.max(0, pathNameToIndex.get(String(pathName)) || 0), true);
      const timelines = [];
      if (Array.isArray(tl.position) && tl.position.length > 0) timelines.push({ type: 0, rows: tl.position });
      if (Array.isArray(tl.spacing) && tl.spacing.length > 0) timelines.push({ type: 1, rows: tl.spacing });
      if (Array.isArray(tl.mix) && tl.mix.length > 0) timelines.push({ type: 2, rows: tl.mix });
      else if (
        (Array.isArray(tl.rotateMix) && tl.rotateMix.length > 0) ||
        (Array.isArray(tl.translateMix) && tl.translateMix.length > 0)
      ) {
        const byTime = new Map();
        for (const row of tl.rotateMix || []) {
          const item = byTime.get(row.time) || { time: row.time };
          item.rotateMix = Number(row.value) || 0;
          if (row.interp === "stepped") item.curve = "stepped";
          byTime.set(row.time, item);
        }
        for (const row of tl.translateMix || []) {
          const item = byTime.get(row.time) || { time: row.time };
          item.translateMix = Number(row.value) || 0;
          if (row.interp === "stepped") item.curve = "stepped";
          byTime.set(row.time, item);
        }
        if (byTime.size > 0) timelines.push({ type: 2, rows: [...byTime.values()].sort((aa, bb) => aa.time - bb.time) });
      }
      writer.varint(timelines.length, true);
      for (const t of timelines) {
        writer.byte(t.type === 2 ? 2 : t.type);
        writer.varint(t.rows.length, true);
        writer.varint(0, true);
        for (let i = 0; i < t.rows.length; i += 1) {
          const row = t.rows[i] || {};
          writer.float(Number(row.time) || 0);
          if (t.type === 2) {
            writer.float(math.clamp(Number(row.rotateMix) || 0, 0, 1));
            writer.float(math.clamp(Number(row.translateMix) || 0, 0, 1));
            writer.float(math.clamp(Number(row.translateMix) || 0, 0, 1));
          } else {
            writer.float(Number(row.value) || 0);
          }
          if (i < t.rows.length - 1) writeCurve(writer, row);
        }
      }
    }
    writer.varint(0, true);
    const deform = a.deform || a.ffd || {};
    const deformSkinEntries = Object.entries(deform).filter(([, v]) => v && typeof v === "object");
    writer.varint(deformSkinEntries.length, true);
    for (const [skinName, slotMap] of deformSkinEntries) {
      writer.varint(Math.max(0, skinNameToIndex.get(skinName) || 0), true);
      const deformSlots = Object.entries(slotMap || {}).filter(([, v]) => v && typeof v === "object");
      writer.varint(deformSlots.length, true);
      for (const [slotName, attMap] of deformSlots) {
        writer.varint(Math.max(0, slotNameToIndex.get(slotName) || 0), true);
        const deformAtts = Object.entries(attMap || {}).filter(([, rows]) => Array.isArray(rows));
        writer.varint(deformAtts.length, true);
        for (const [attName, rows] of deformAtts) {
          writer.refString(attName, sharedMap);
          writer.byte(0);
          writer.varint(rows.length, true);
          writer.varint(0, true);
          for (let i = 0; i < rows.length; i += 1) {
            const row = rows[i] || {};
            writer.float(Number(row.time) || 0);
            const verts = Array.isArray(row.vertices) ? row.vertices : [];
            if (verts.length === 0) {
              writer.varint(0, true);
            } else {
              const off = Math.max(0, Number(row.offset) || 0);
              writer.varint(off + verts.length, true);
              if (off > 0) writer.varint(off, true);
              for (let j = 0; j < verts.length; j += 1) writer.float(Number(verts[j]) || 0);
            }
            if (i < rows.length - 1) writeCurve(writer, row);
          }
        }
      }
    }
    const drawOrderRows = Array.isArray(a.drawOrder) ? a.drawOrder : [];
    writer.varint(drawOrderRows.length, true);
    for (const row of drawOrderRows) {
      const offsets = Array.isArray(row && row.offsets) ? row.offsets : [];
      writer.float(Number(row && row.time) || 0);
      writer.varint(offsets.length, true);
      for (const off of offsets) {
        writer.varint(Math.max(0, slotNameToIndex.get(String(off && off.slot ? off.slot : "")) || 0), true);
        writer.varint(Number(off && off.offset) || 0, false);
      }
    }
    const eventRows = Array.isArray(a.events) ? a.events : [];
    writer.varint(eventRows.length, true);
    for (const row of eventRows) {
      const eventIndex = eventNameToIndex.get(String(row && row.name ? row.name : ""));
      const ev = Number.isFinite(eventIndex) ? eventDefs[eventNames[eventIndex]] || {} : {};
      writer.float(Number(row && row.time) || 0);
      writer.varint(Number.isFinite(eventIndex) ? eventIndex : 0, true);
      writer.varint(row && "int" in row ? Number(row.int) || 0 : Number(ev.int) || 0, false);
      writer.float(row && "float" in row ? Number(row.float) || 0 : Number(ev.float) || 0);
      writer.string(row && row.string != null ? String(row.string) : null);
      const audioPath = ev.audio != null && String(ev.audio).length > 0 ? String(ev.audio) : null;
      if (audioPath != null) {
        writer.float(row && "volume" in row ? Number(row.volume) || 0 : Number(ev.volume) || 0);
        writer.float(row && "balance" in row ? Number(row.balance) || 0 : Number(ev.balance) || 0);
      }
    }
  }

  return writer.toUint8Array();
}

// ----------------------------------------------------------------
// Atlas advanced packer (Spine 4.x .atlas v4 format).
//
// Replaces the old single-page row-fill packer. Supports:
//   - Multi-page: when an item doesn't fit the current page, start a new one
//   - Rotation: when allowed, try the 90°-rotated orientation if it fits better
//   - Trim: strip fully-transparent edges; emit `orig`/`offset` so runtimes
//     can reconstruct the original visual size
//   - Bleed: copy edge pixels outward (configurable px) to prevent bilinear
//     filter bleed at region boundaries
//   - Configurable padding, page size, format, filter
//
// Layout algorithm: shelf packer.
//   - Sort items by height descending (bigger items go first; classic shelf
//     heuristic that gets close to MaxRects on real-world atlas content
//     with a fraction of the code).
//   - For each item, place on current shelf if it fits horizontally; else
//     start a new shelf (next y-row); else start a new page.
//
// Return shape (extended): { pages: [{ canvas, name, width, height }, ...],
//                            atlas: text, scale: number }
// Single-page output is byte-compatible with the old packer's first page.
// ----------------------------------------------------------------
function packSlotsToAtlasPage(slotExportInfos, pageName, textureScale = 1, options = {}) {
  const atlasSlots = slotExportInfos.filter(
    (it) => it && it.canvas && it.canvas.width > 0 && it.canvas.height > 0
  );
  if (atlasSlots.length === 0) throw new Error("No slot images to export.");

  const scale = math.clamp(Number(textureScale) || 1, 0.1, 1);
  const opts = options && typeof options === "object" ? options : {};
  const padding = Math.max(0, Math.min(64, Number.isFinite(Number(opts.padding)) ? Number(opts.padding) : 2));
  const bleed = Math.max(0, Math.min(8, Number.isFinite(Number(opts.bleed)) ? Number(opts.bleed) : 0));
  const maxW = Math.max(64, Math.min(8192, Number(opts.maxWidth) || 2048));
  const maxH = Math.max(64, Math.min(8192, Number(opts.maxHeight) || maxW));
  const allowRotate = !!opts.allowRotate;
  const allowTrim = !!opts.allowTrim;
  const allowMultiPage = opts.allowMultiPage !== false; // default true
  const format = String(opts.format || "RGBA8888");
  const filter = String(opts.filter || "Linear, Linear");
  const repeat = String(opts.repeat || "none");

  // Per-item prep: scale, optional trim. Result keeps a `srcCanvas` to blit
  // from + intrinsic w/h plus `origW/origH` and `offX/offY` for the trim
  // reconstruction. Edge = padding + bleed (a region's effective footprint
  // includes both its padding gutter and its bleed apron).
  const prepped = atlasSlots.map((it, i) => {
    const orig = it.canvas;
    const sw = Math.max(1, Math.round(orig.width * scale));
    const sh = Math.max(1, Math.round(orig.height * scale));
    let srcCanvas = orig;
    let w = sw;
    let h = sh;
    let offX = 0;
    let offY = 0;
    let origW = sw;
    let origH = sh;
    if (allowTrim) {
      const trimmed = trimTransparentEdges(orig, scale);
      if (trimmed) {
        srcCanvas = trimmed.canvas;
        w = trimmed.w;
        h = trimmed.h;
        offX = trimmed.offX;
        offY = trimmed.offY;
        origW = sw;
        origH = sh;
      }
    }
    return { ...it, srcCanvas, w, h, offX, offY, origW, origH, idxInOrder: i };
  });

  // Sort by max(w, h) desc — the height-aware shelf heuristic. Stable for
  // ties via the original index so output is deterministic.
  prepped.sort((a, b) => {
    const am = Math.max(a.w, a.h);
    const bm = Math.max(b.w, b.h);
    if (am !== bm) return bm - am;
    return a.idxInOrder - b.idxInOrder;
  });

  const pages = [];
  let currentPage = null;
  const newPage = () => {
    const p = {
      regions: [], // { item, x, y, w, h, rotated }
      shelfY: padding,
      shelfX: padding,
      shelfH: 0,
      usedW: 0,
      usedH: 0,
    };
    pages.push(p);
    currentPage = p;
  };
  newPage();

  // Try to place an item with the given footprint on the current page's
  // current shelf, else open a new shelf, else return false (caller decides
  // whether to open a new page).
  const tryPlace = (page, w, h) => {
    const stride = padding;
    if (page.shelfX + w + stride > maxW) {
      // wrap to next shelf
      const newY = page.shelfY + page.shelfH + stride;
      if (newY + h + stride > maxH) return null;
      page.shelfY = newY;
      page.shelfX = padding;
      page.shelfH = 0;
    }
    if (page.shelfY + h + stride > maxH) return null;
    const x = page.shelfX;
    const y = page.shelfY;
    page.shelfX = x + w + stride;
    page.shelfH = Math.max(page.shelfH, h);
    page.usedW = Math.max(page.usedW, x + w + stride);
    page.usedH = Math.max(page.usedH, y + h + stride);
    return { x, y };
  };

  for (const item of prepped) {
    const { w, h } = item;
    if (w + padding * 2 > maxW || h + padding * 2 > maxH) {
      throw new Error(`Slot "${item.attachmentName || "?"}" (${w}×${h}) exceeds atlas max page size (${maxW}×${maxH}). Reduce texture scale or raise max size.`);
    }
    let placed = tryPlace(currentPage, w, h);
    let rotated = false;
    if (!placed && allowRotate && w !== h) {
      const r = tryPlace(currentPage, h, w);
      if (r) { placed = r; rotated = true; }
    }
    if (!placed) {
      if (!allowMultiPage) {
        throw new Error(`Atlas does not fit on a single ${maxW}×${maxH} page. Enable multi-page or raise size.`);
      }
      newPage();
      placed = tryPlace(currentPage, w, h);
      if (!placed && allowRotate && w !== h) {
        const r = tryPlace(currentPage, h, w);
        if (r) { placed = r; rotated = true; }
      }
      if (!placed) {
        throw new Error(`Slot "${item.attachmentName || "?"}" (${w}×${h}) cannot be placed even on a fresh page. Internal error.`);
      }
    }
    currentPage.regions.push({
      item,
      x: placed.x,
      y: placed.y,
      w: rotated ? h : w,
      h: rotated ? w : h,
      rotated,
    });
  }

  // Render each page canvas. Bleed is applied per-region by drawing the
  // source canvas a few extra times offset by ±1..bleed px on each side.
  for (const page of pages) {
    const pageW = Math.max(1, Math.ceil(page.usedW));
    const pageH = Math.max(1, Math.ceil(page.usedH));
    const canvas = document.createElement("canvas");
    canvas.width = pageW;
    canvas.height = pageH;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas context unavailable for atlas export.");
    for (const r of page.regions) {
      drawAtlasRegion(ctx, r, bleed);
    }
    page.canvas = canvas;
    page.width = pageW;
    page.height = pageH;
  }

  // Name pages: page 1 keeps the original pageName; subsequent pages append
  // a numeric suffix before the extension (Spine convention).
  const dotIdx = pageName.lastIndexOf(".");
  const baseName = dotIdx > 0 ? pageName.slice(0, dotIdx) : pageName;
  const ext = dotIdx > 0 ? pageName.slice(dotIdx) : ".png";
  for (let i = 0; i < pages.length; i += 1) {
    pages[i].name = i === 0 ? pageName : `${baseName}_${i + 1}${ext}`;
  }

  // Emit the .atlas text. v4 format: page block, then region blocks. Pages
  // are separated by a blank line.
  let atlas = "";
  for (let i = 0; i < pages.length; i += 1) {
    const page = pages[i];
    if (i > 0) atlas += "\n";
    atlas += `${page.name}\n`;
    atlas += `\tsize: ${page.width}, ${page.height}\n`;
    atlas += `\tformat: ${format}\n`;
    atlas += `\tfilter: ${filter}\n`;
    atlas += `\trepeat: ${repeat}\n`;
    // Stable region order within a page: by (y, x) for readability.
    const ordered = page.regions.slice().sort((a, b) => (a.y - b.y) || (a.x - b.x));
    for (const r of ordered) {
      const it = r.item;
      atlas += `${it.attachmentName}\n`;
      atlas += `\tbounds: ${r.x}, ${r.y}, ${r.w}, ${r.h}\n`;
      if (r.rotated) atlas += "\trotate: 90\n";
      // Trim metadata: orig is the un-trimmed scaled size; offset is the
      // (x, y) of the trimmed bbox inside the original. Spine runtimes use
      // these to draw the region back at its original visual position.
      if (it.origW !== it.w || it.origH !== it.h || it.offX !== 0 || it.offY !== 0) {
        atlas += `\torig: ${it.origW}, ${it.origH}\n`;
        atlas += `\toffset: ${it.offX}, ${it.offY}\n`;
      }
    }
  }
  return { pages, atlas, scale };
}

// Trim fully-transparent rows/cols from the canvas. Returns
// { canvas, w, h, offX, offY } where offX/offY are the trimmed bbox top-
// left in the *scaled* original. If nothing transparent, returns null so
// caller skips trimming entirely.
function trimTransparentEdges(srcCanvas, scale) {
  const sw = Math.max(1, Math.round(srcCanvas.width * scale));
  const sh = Math.max(1, Math.round(srcCanvas.height * scale));
  // Render at scaled size into a temp canvas so we trim post-scale.
  const work = document.createElement("canvas");
  work.width = sw;
  work.height = sh;
  const wctx = work.getContext("2d");
  if (!wctx) return null;
  wctx.drawImage(srcCanvas, 0, 0, srcCanvas.width, srcCanvas.height, 0, 0, sw, sh);
  const data = wctx.getImageData(0, 0, sw, sh).data;
  let minX = sw, minY = sh, maxX = -1, maxY = -1;
  for (let y = 0; y < sh; y += 1) {
    for (let x = 0; x < sw; x += 1) {
      const a = data[(y * sw + x) * 4 + 3];
      if (a !== 0) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0 || maxY < 0) {
    // Fully transparent — return a 1×1 canvas to keep packing happy.
    const tiny = document.createElement("canvas");
    tiny.width = 1;
    tiny.height = 1;
    return { canvas: tiny, w: 1, h: 1, offX: 0, offY: 0 };
  }
  const tw = maxX - minX + 1;
  const th = maxY - minY + 1;
  if (tw === sw && th === sh) return null; // nothing to trim
  const out = document.createElement("canvas");
  out.width = tw;
  out.height = th;
  const octx = out.getContext("2d");
  if (!octx) return null;
  octx.drawImage(work, minX, minY, tw, th, 0, 0, tw, th);
  return { canvas: out, w: tw, h: th, offX: minX, offY: minY };
}

// Blit a region with optional bleed. Bleed extends edge pixels by drawing
// the source canvas scaled to ±bleed px on each side; that costs 4 extra
// drawImage calls per region with bleed > 0. The actual region pixels are
// drawn last so they overwrite the spread.
function drawAtlasRegion(ctx, r, bleed) {
  const it = r.item;
  const src = it.srcCanvas;
  const dx = r.x;
  const dy = r.y;
  const dw = r.w;
  const dh = r.h;
  ctx.save();
  if (r.rotated) {
    ctx.translate(dx + dw, dy);
    ctx.rotate(Math.PI / 2);
    // After rotation, the source is drawn into a (h × w) target — draw
    // dimensions swap.
    if (bleed > 0) drawBleedRing(ctx, src, 0, 0, dh, dw, bleed);
    ctx.drawImage(src, 0, 0, src.width, src.height, 0, 0, dh, dw);
  } else {
    if (bleed > 0) drawBleedRing(ctx, src, dx, dy, dw, dh, bleed);
    ctx.drawImage(src, 0, 0, src.width, src.height, dx, dy, dw, dh);
  }
  ctx.restore();
}

function drawBleedRing(ctx, src, dx, dy, dw, dh, bleed) {
  // Cheap bleed: draw the source at ±bleed in 4 cardinal directions. For
  // typical bleed=1..2 this is plenty (corner pixels are correctly covered
  // by the cardinal stretches since each draw uses the full src extent).
  ctx.drawImage(src, 0, 0, src.width, src.height, dx - bleed, dy, dw, dh);
  ctx.drawImage(src, 0, 0, src.width, src.height, dx + bleed, dy, dw, dh);
  ctx.drawImage(src, 0, 0, src.width, src.height, dx, dy - bleed, dw, dh);
  ctx.drawImage(src, 0, 0, src.width, src.height, dx, dy + bleed, dw, dh);
}

// ============================================================
// SECTION: Export — Spine JSON Builder
// buildSpineJsonData: main export entry point.
// Serializes skeleton, slots, attachments, skins, constraints,
//   animations, and events into Spine-compatible JSON.
// validateSpineJsonForExport: pre-export integrity check.
// ============================================================
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

function makeDiagnosticIssue(severity, message, action = null) {
  const s = severity === "error" ? "error" : "warning";
  return {
    severity: s,
    message: String(message || ""),
    action: action && typeof action === "object" ? action : null,
  };
}

function renderDiagnosticsUI() {
  if (!els.diagnosticsList) return;
  const rows = Array.isArray(state.diagnostics.issues) ? state.diagnostics.issues : [];
  let errors = 0;
  let warnings = 0;
  for (const r of rows) {
    if (!r) continue;
    if (r.severity === "error") errors += 1;
    else warnings += 1;
  }
  if (els.diagnosticsErrorsCount) els.diagnosticsErrorsCount.textContent = String(errors);
  if (els.diagnosticsWarningsCount) els.diagnosticsWarningsCount.textContent = String(warnings);
  els.diagnosticsList.innerHTML = "";
  if (rows.length === 0) {
    els.diagnosticsList.classList.add("muted");
    els.diagnosticsList.textContent = "No issues found.";
    return;
  }
  els.diagnosticsList.classList.remove("muted");
  const frag = document.createDocumentFragment();
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    if (!row) continue;
    const item = document.createElement("div");
    item.className = `diag-item ${row.severity === "error" ? "error" : "warning"}`;
    if (row.action) {
      item.dataset.action = JSON.stringify(row.action);
      item.title = "Click to focus related object.";
    }
    const head = document.createElement("div");
    head.className = "diag-head";
    head.textContent = `${row.severity === "error" ? "Error" : "Warning"} ${i + 1}`;
    const msg = document.createElement("div");
    msg.className = "diag-msg";
    msg.textContent = row.message;
    item.appendChild(head);
    item.appendChild(msg);
    frag.appendChild(item);
  }
  els.diagnosticsList.appendChild(frag);
}

function focusDiagnosticsAction(action) {
  if (!action || typeof action !== "object") return false;
  const kind = String(action.kind || "");
  if (kind === "slot") {
    const si = Number(action.slotIndex);
    if (!Number.isFinite(si) || si < 0 || si >= state.slots.length) return false;
    setActiveSlot(si);
    setStatus(`Diagnostics focus: slot ${state.slots[si] && state.slots[si].name ? state.slots[si].name : si}`);
    return true;
  }
  if (kind === "bone") {
    const bi = Number(action.boneIndex);
    if (!state.mesh || !Number.isFinite(bi) || bi < 0 || bi >= state.mesh.rigBones.length) return false;
    state.selectedBone = bi;
    state.selectedBonesForWeight = [bi];
    updateBoneUI();
    renderBoneTree();
    setStatus(`Diagnostics focus: bone ${state.mesh.rigBones[bi] && state.mesh.rigBones[bi].name ? state.mesh.rigBones[bi].name : bi}`);
    return true;
  }
  if (kind === "track") {
    const trackId = String(action.trackId || "");
    if (!trackId) return false;
    focusTimelineTrack(trackId, true);
    setStatus(`Diagnostics focus: track ${trackId}`);
    return true;
  }
  if (kind === "animation") {
    const animId = String(action.animId || "");
    if (!animId) return false;
    const anim = state.anim.animations.find((a) => a.id === animId);
    if (!anim) return false;
    state.anim.currentAnimId = anim.id;
    refreshAnimationUI();
    if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time);
    setStatus(`Diagnostics focus: animation ${anim.name}`);
    return true;
  }
  return false;
}

function collectSlotBindingDebug(slotIndex = state.activeSlot) {
  const si = Number(slotIndex);
  const slot = Number.isFinite(si) && si >= 0 && si < state.slots.length ? state.slots[si] : null;
  const m = state.mesh;
  const att = slot ? getActiveAttachment(slot) : null;
  const md = att && att.meshData ? att.meshData : null;
  const boneCount = m && Array.isArray(m.rigBones) ? m.rigBones.length : 0;
  const vCount = md && md.positions ? Math.floor((Number(md.positions.length) || 0) / 2) : 0;
  const weightCount = md && md.weights ? Number(md.weights.length) || 0 : 0;
  const expectedWeightCount = vCount > 0 && boneCount > 0 ? vCount * boneCount : 0;
  const mode = slot ? getSlotWeightMode(slot) : "single";
  const ownerBone = slot ? getSlotTreeBoneIndex(slot, m) : -1;
  const influenceBones = slot && m ? getSlotInfluenceBones(slot, m) : [];
  const poseWorld = m ? getSolvedPoseWorld(m) : [];
  const rigWorld = m ? computeWorld(getRigBones(m)) : [];
  const invBind = m ? getDisplayInvBind(m) : [];
  const poseBone = Number.isFinite(ownerBone) && ownerBone >= 0 ? poseWorld[ownerBone] || null : null;
  const rigBone = Number.isFinite(ownerBone) && ownerBone >= 0 ? rigWorld[ownerBone] || null : null;
  const poseOrigin = poseBone ? transformPoint(poseBone, 0, 0) : null;
  const rigOrigin = rigBone ? transformPoint(rigBone, 0, 0) : null;
  let totalWeight = 0;
  let firstVertexWeights = [];
  let sampleVertex = null;
  if (md && md.weights && boneCount > 0 && vCount > 0 && weightCount === expectedWeightCount) {
    for (let i = 0; i < md.weights.length; i += 1) totalWeight += Number(md.weights[i]) || 0;
    const limit = Math.min(boneCount, 8);
    for (let bi = 0; bi < limit; bi += 1) {
      const w = Number(md.weights[bi]) || 0;
      if (w > 0) firstVertexWeights.push({ bone: bi, weight: w });
    }
    const sampleIndex = (() => {
      for (let vi = 0; vi < vCount; vi += 1) {
        for (let bi = 0; bi < boneCount; bi += 1) {
          if ((Number(md.weights[vi * boneCount + bi]) || 0) > 1e-4) return vi;
        }
      }
      return -1;
    })();
    if (sampleIndex >= 0) {
      const x = Number(md.positions[sampleIndex * 2]) || 0;
      const y = Number(md.positions[sampleIndex * 2 + 1]) || 0;
      let deformedX = x;
      let deformedY = y;
      if (mode !== "free" && Array.isArray(poseWorld) && Array.isArray(invBind) && poseWorld.length === invBind.length) {
        deformedX = 0;
        deformedY = 0;
        for (let bi = 0; bi < boneCount; bi += 1) {
          const w = Number(md.weights[sampleIndex * boneCount + bi]) || 0;
          if (w <= 0 || !poseWorld[bi] || !invBind[bi]) continue;
          const skinned = transformPoint(mul(poseWorld[bi], invBind[bi]), x, y);
          deformedX += skinned.x * w;
          deformedY += skinned.y * w;
        }
      }
      sampleVertex = {
        index: sampleIndex,
        rest: { x, y },
        deformed: { x: deformedX, y: deformedY },
        delta: { x: deformedX - x, y: deformedY - y },
      };
    }
  }
  return {
    editMode: state.editMode,
    boneMode: state.boneMode,
    uiPage: state.uiPage,
    systemMode: els.systemMode ? String(els.systemMode.value || "") : "",
    slotIndex: si,
    slotName: slot && slot.name ? String(slot.name) : null,
    activeAttachment: slot ? getSlotCurrentAttachmentName(slot) : null,
    attachmentType: att ? normalizeAttachmentType(att.type) : null,
    mode,
    slotBone: slot ? Number(slot.bone) : null,
    treeBone: ownerBone,
    influenceBones,
    boneCount,
    invBindCount: Array.isArray(invBind) ? invBind.length : 0,
    vertexCount: vCount,
    weightCount,
    expectedWeightCount,
    totalWeight,
    poseOrigin,
    rigOrigin,
    poseMovedFromRig:
      !!(poseOrigin && rigOrigin && (Math.abs((poseOrigin.x || 0) - (rigOrigin.x || 0)) > 1e-4 || Math.abs((poseOrigin.y || 0) - (rigOrigin.y || 0)) > 1e-4)),
    firstVertexWeights,
    sampleVertex,
  };
}

function collectAutosaveWeightDebug() {
  const env = getAutosaveEnvelope();
  const slots = Array.isArray(env && env.project && env.project.slots) ? env.project.slots : [];
  return slots.map((slot, si) => {
    const attachments = Array.isArray(slot && slot.attachments) ? slot.attachments : [];
    return {
      slotIndex: si,
      slotName: slot && slot.name ? String(slot.name) : `slot_${si}`,
      activeAttachment: slot && Object.prototype.hasOwnProperty.call(slot, "activeAttachment") ? slot.activeAttachment : null,
      rootWeightMode: slot && slot.weightMode ? String(slot.weightMode) : null,
      rootInfluenceBones: Array.isArray(slot && slot.influenceBones) ? slot.influenceBones.slice() : [],
      rootWeightCount:
        slot && readSlotMeshData(slot) && Array.isArray(readSlotMeshData(slot).weights)
          ? readSlotMeshData(slot).weights.length
          : 0,
      attachments: attachments.map((att) => ({
        name: att && att.name ? String(att.name) : "",
        weightMode: att && att.weightMode ? String(att.weightMode) : null,
        influenceBones: Array.isArray(att && att.influenceBones) ? att.influenceBones.slice() : [],
        weightCount:
          att && att.meshData && Array.isArray(att.meshData.weights)
            ? att.meshData.weights.length
            : 0,
      })),
    };
  });
}

function collectWeightedAttachmentIssues() {
  const issues = [];
  const m = state.mesh;
  const boneCount = m && Array.isArray(m.rigBones) ? m.rigBones.length : 0;
  for (let si = 0; si < state.slots.length; si += 1) {
    const slot = state.slots[si];
    if (!slot || !Array.isArray(slot.attachments)) continue;
    for (const att of slot.attachments) {
      if (!att) continue;
      const mode =
        att.weightMode === "single" || att.weightMode === "weighted" || att.weightMode === "free"
          ? att.weightMode
          : att.useWeights === false || att.weightBindMode === "none"
            ? "free"
            : att.weightBindMode === "auto"
              ? "weighted"
              : "single";
      if (mode !== "weighted") continue;
      const md = att.meshData;
      const vCount = md && md.positions ? Math.floor((Number(md.positions.length) || 0) / 2) : 0;
      const expectedWeights = vCount > 0 && boneCount > 0 ? vCount * boneCount : 0;
      const actualWeights = md && md.weights ? Number(md.weights.length) || 0 : 0;
      if (!md || vCount <= 0) {
        issues.push({
          slotIndex: si,
          slotName: slot.name || `slot_${si}`,
          attachmentName: att.name || "",
          reason: "missing_mesh",
        });
        continue;
      }
      if (expectedWeights > 0 && actualWeights !== expectedWeights) {
        issues.push({
          slotIndex: si,
          slotName: slot.name || `slot_${si}`,
          attachmentName: att.name || "",
          reason: "bad_weight_count",
          expectedWeights,
          actualWeights,
        });
        continue;
      }
      let maxWeight = 0;
      if (md && md.weights) {
        for (let i = 0; i < md.weights.length; i += 1) {
          const w = Number(md.weights[i]) || 0;
          if (w > maxWeight) maxWeight = w;
        }
      }
      if (actualWeights > 0 && maxWeight <= 1e-6) {
        issues.push({
          slotIndex: si,
          slotName: slot.name || `slot_${si}`,
          attachmentName: att.name || "",
          reason: "all_zero_weights",
          actualWeights,
        });
      }
    }
  }
  return issues;
}

function runDiagnostics(options = null) {
  const opts = options && typeof options === "object" ? options : {};
  const includeExport = opts.includeExport !== false;
  const issues = [];
  const push = (severity, message, action = null) => {
    issues.push(makeDiagnosticIssue(severity, message, action));
  };
  const bones = state.mesh && Array.isArray(state.mesh.rigBones) ? state.mesh.rigBones : [];
  const slots = Array.isArray(state.slots) ? state.slots : [];
  const isBoneIndexValid = (v) => Number.isFinite(v) && Number(v) >= 0 && Number(v) < bones.length;
  const slotIdSet = new Set(slots.map((s) => (s && s.id ? String(s.id) : "")));

  if (!state.mesh) push("error", "Mesh is not initialized. Import image/PSD and rebuild mesh first.");
  if (bones.length <= 0) push("error", "No bones found.");
  if (slots.length <= 0) push("error", "No slots found.");

  for (let si = 0; si < slots.length; si += 1) {
    const slot = slots[si];
    if (!slot) continue;
    const att = getActiveAttachment(slot);
    const mode = getSlotWeightMode(slot);
    const treeBone = getSlotTreeBoneIndex(slot, state.mesh);
    const md = att && att.meshData ? att.meshData : null;
    const vCount = md && md.positions ? Math.floor((Number(md.positions.length) || 0) / 2) : 0;
    const expectedWeights = vCount > 0 && bones.length > 0 ? vCount * bones.length : 0;
    const slotBone = Number(slot.bone);
    if (slotBone === -1) {
      push("warning", `Slot "${slot.name || si}" is currently unassigned (staging).`, {
        kind: "slot",
        slotIndex: si,
      });
    } else if (!isBoneIndexValid(slot.bone)) {
      push("error", `Slot "${slot.name || si}" is bound to an invalid bone index (${slot.bone}).`, {
        kind: "slot",
        slotIndex: si,
      });
    }
    if (slot.activeAttachment != null) {
      const hasAttachment = Array.isArray(slot.attachments) && slot.attachments.some((a) => a && a.name === slot.activeAttachment);
      if (!hasAttachment) {
        push("warning", `Slot "${slot.name || si}" active attachment "${String(slot.activeAttachment)}" is missing.`, {
          kind: "slot",
          slotIndex: si,
        });
      }
    }
    if (!att) {
      push("error", `Slot "${slot.name || si}" has no active attachment state.`, { kind: "slot", slotIndex: si });
      continue;
    }
    if ((mode === "single" || mode === "weighted") && (!md || vCount <= 0)) {
      push("error", `Slot "${slot.name || si}" is ${mode} but has no meshData vertices on the active attachment.`, {
        kind: "slot",
        slotIndex: si,
      });
    }
    if (mode === "weighted" && md && expectedWeights > 0) {
      const actualWeights = md.weights ? Number(md.weights.length) || 0 : 0;
      if (actualWeights !== expectedWeights) {
        push("error", `Slot "${slot.name || si}" weighted mesh has invalid weight buffer size (${actualWeights} != ${expectedWeights}).`, {
          kind: "slot",
          slotIndex: si,
        });
      } else {
        let maxWeight = 0;
        for (let i = 0; i < md.weights.length; i += 1) {
          const w = Number(md.weights[i]) || 0;
          if (w > maxWeight) maxWeight = w;
        }
        if (maxWeight <= 1e-6) {
          push("error", `Slot "${slot.name || si}" weighted mesh has all-zero weights, so it cannot follow bones.`, {
            kind: "slot",
            slotIndex: si,
          });
        }
      }
    }
    if ((mode === "single" || mode === "weighted") && treeBone < 0) {
      push("warning", `Slot "${slot.name || si}" has no resolvable owner bone for its current active attachment.`, {
        kind: "slot",
        slotIndex: si,
      });
    }
    if ((getActiveAttachment(slot) || {}).clipEnabled && (getActiveAttachment(slot) || {}).clipEndSlotId) {
      const id = String((getActiveAttachment(slot) || {}).clipEndSlotId);
      if (!slotIdSet.has(id)) {
        push("error", `Slot "${slot.name || si}" clip end slot id "${id}" does not exist.`, { kind: "slot", slotIndex: si });
      } else if (slot.id && String(slot.id) === id) {
        push("warning", `Slot "${slot.name || si}" clip end points to itself.`, { kind: "slot", slotIndex: si });
      }
    }
    if ((getActiveAttachment(slot) || {}).clipEnabled && (getActiveAttachment(slot) || {}).clipSource === "contour") {
      const contour = ensureSlotContour(slot);
      if (!contour.closed || !Array.isArray(contour.points) || contour.points.length < 3) {
        push("warning", `Slot "${slot.name || si}" uses contour clipping but contour is not closed/valid.`, {
          kind: "slot",
          slotIndex: si,
        });
      }
    }
  }

  for (let bi = 0; bi < bones.length; bi += 1) {
    const bone = bones[bi];
    const p = Number(bone && bone.parent);
    if (Number.isFinite(p) && p >= bones.length) {
      push("error", `Bone "${bone && bone.name ? bone.name : bi}" has invalid parent index ${p}.`, { kind: "bone", boneIndex: bi });
    }
  }

  const ikList = state.mesh ? ensureIKConstraints(state.mesh) : [];
  for (let i = 0; i < ikList.length; i += 1) {
    const c = ikList[i];
    if (!c) continue;
    if (!isBoneIndexValid(c.target)) {
      push("error", `IK "${c.name || i}" has invalid target bone index ${c.target}.`);
    }
    const bs = Array.isArray(c.bones) ? c.bones : [];
    if (bs.length <= 0 || bs.some((b) => !isBoneIndexValid(b))) {
      push("error", `IK "${c.name || i}" has invalid constrained bones.`);
    }
  }

  const tfcList = state.mesh ? ensureTransformConstraints(state.mesh) : [];
  for (let i = 0; i < tfcList.length; i += 1) {
    const c = tfcList[i];
    if (!c) continue;
    if (!isBoneIndexValid(c.target)) push("error", `Transform "${c.name || i}" has invalid target bone index ${c.target}.`);
    const bs = Array.isArray(c.bones) ? c.bones : [];
    if (bs.length <= 0 || bs.some((b) => !isBoneIndexValid(b))) push("error", `Transform "${c.name || i}" has invalid constrained bones.`);
  }

  const pathList = state.mesh ? ensurePathConstraints(state.mesh) : [];
  for (let i = 0; i < pathList.length; i += 1) {
    const c = pathList[i];
    if (!c) continue;
    if (!isBoneIndexValid(c.target)) push("error", `Path "${c.name || i}" has invalid target bone index ${c.target}.`);
    const bs = Array.isArray(c.bones) ? c.bones : [];
    if (bs.length <= 0 || bs.some((b) => !isBoneIndexValid(b))) push("error", `Path "${c.name || i}" has invalid constrained bones.`);
    if (c.sourceType === "slot") {
      const tsi = Number(c.targetSlot);
      if (!Number.isFinite(tsi) || tsi < 0 || tsi >= slots.length) {
        push("error", `Path "${c.name || i}" source slot index is invalid (${c.targetSlot}).`);
      }
    }
  }

  for (const layer of ensureAnimLayerTracks()) {
    if (!layer) continue;
    if (layer.enabled !== false && layer.animId && !state.anim.animations.some((a) => a.id === layer.animId)) {
      push("warning", `Layer "${layer.name || layer.id}" references missing animation "${layer.animId}".`, {
        kind: "track",
        trackId: getLayerTrackId(layer.id, "alpha"),
      });
    }
  }

  const sm = ensureStateMachine();
  for (const st of sm.states || []) {
    if (!st) continue;
    if (st.animId && !state.anim.animations.some((a) => a.id === st.animId)) {
      push("warning", `State "${st.name || st.id}" references missing animation "${st.animId}".`);
    }
    for (const tr of st.transitions || []) {
      if (!tr) continue;
      if (!sm.states.some((x) => x && x.id === tr.toStateId)) {
        push("error", `State "${st.name || st.id}" has transition to missing state "${tr.toStateId}".`);
      }
    }
  }

  if (includeExport) {
    try {
      const compat = getSpineCompatPreset(state.export && state.export.spineCompat);
      const { json, skippedPathForExport, skippedPathAttachmentForExport } = buildSpineJsonData(compat.id);
      const v = validateSpineJsonForExport(json, compat.id);
      for (const e of v.errors) push("error", `[Export] ${e}`);
      for (const w of v.warnings) push("warning", `[Export] ${w}`);
      if ((Number(skippedPathForExport) || 0) > 0) {
        push("warning", `[Export] ${Number(skippedPathForExport)} path constraint(s) were skipped.`);
      }
      if ((Number(skippedPathAttachmentForExport) || 0) > 0) {
        push("warning", `[Export] ${Number(skippedPathAttachmentForExport)} path attachment(s) could not be generated.`);
      }
    } catch (err) {
      push("error", `[Export] ${err && err.message ? err.message : "Export build failed."}`);
    }
  }

  state.diagnostics.issues = issues;
  state.diagnostics.lastRunAt = Date.now();
  renderDiagnosticsUI();
  const errorCount = issues.filter((r) => r && r.severity === "error").length;
  const warnCount = issues.filter((r) => r && r.severity !== "error").length;
  setStatus(`Diagnostics done: ${errorCount} error(s), ${warnCount} warning(s).`);
  return issues;
}

function applyDiagnosticsSafeFixes() {
  let fixed = 0;
  const bones = state.mesh && Array.isArray(state.mesh.rigBones) ? state.mesh.rigBones : [];
  const slots = Array.isArray(state.slots) ? state.slots : [];
  const validBone = (v) => Number.isFinite(v) && Number(v) >= 0 && Number(v) < bones.length;
  const slotIdSet = new Set(slots.map((s) => (s && s.id ? String(s.id) : "")));

  for (let bi = 0; bi < bones.length; bi += 1) {
    const b = bones[bi];
    if (!b) continue;
    const p = Number(b.parent);
    if (!Number.isFinite(p) || p < 0) continue;
    if (p >= bones.length || p === bi) {
      b.parent = -1;
      fixed += 1;
    }
  }

  for (let si = 0; si < slots.length; si += 1) {
    const s = slots[si];
    if (!s) continue;
    if (!validBone(s.bone)) {
      if (Number(s.bone) !== -1) {
        s.bone = -1;
        fixed += 1;
      }
    }
    if (s.activeAttachment != null) {
      const has = Array.isArray(s.attachments) && s.attachments.some((a) => a && a.name === s.activeAttachment);
      if (!has) {
        const first = Array.isArray(s.attachments) && s.attachments[0] && s.attachments[0].name ? String(s.attachments[0].name) : null;
        s.activeAttachment = first;
        if (first) s.attachmentName = first;
        fixed += 1;
      }
    }
    const activeAttachment = getActiveAttachment(s);
    if (activeAttachment && activeAttachment.clipEnabled && activeAttachment.clipEndSlotId) {
      const id = String(activeAttachment.clipEndSlotId);
      if (!slotIdSet.has(id) || (s.id && String(s.id) === id)) {
        activeAttachment.clipEndSlotId = null;
        fixed += 1;
      }
    }
    if (activeAttachment && activeAttachment.clipEnabled && activeAttachment.clipSource === "contour") {
      const c = ensureSlotContour(s);
      if (!c.closed || !Array.isArray(c.points) || c.points.length < 3) {
        activeAttachment.clipSource = "fill";
        fixed += 1;
      }
    }
  }

  if (state.mesh) {
    const ikList = ensureIKConstraints(state.mesh);
    for (const c of ikList) {
      if (!c) continue;
      const prevTarget = c.target;
      if (!validBone(c.target)) c.target = fallbackBone;
      const cleaned = Array.isArray(c.bones) ? [...new Set(c.bones.map((v) => Number(v)).filter((v) => validBone(v)))] : [];
      if (!Array.isArray(c.bones) || cleaned.length !== c.bones.length || cleaned.some((v, i) => v !== c.bones[i])) c.bones = cleaned;
      const shouldEnable = c.bones.length > 0 && validBone(c.target);
      if (c.enabled !== shouldEnable) c.enabled = shouldEnable;
      if (prevTarget !== c.target || !shouldEnable) fixed += 1;
    }

    const tfcList = ensureTransformConstraints(state.mesh);
    for (const c of tfcList) {
      if (!c) continue;
      const prevTarget = c.target;
      if (!validBone(c.target)) c.target = fallbackBone;
      const cleaned = Array.isArray(c.bones) ? [...new Set(c.bones.map((v) => Number(v)).filter((v) => validBone(v)))] : [];
      if (!Array.isArray(c.bones) || cleaned.length !== c.bones.length || cleaned.some((v, i) => v !== c.bones[i])) c.bones = cleaned;
      const shouldEnable = c.bones.length > 0 && validBone(c.target);
      if (c.enabled !== shouldEnable) c.enabled = shouldEnable;
      if (prevTarget !== c.target || !shouldEnable) fixed += 1;
    }

    const pathList = ensurePathConstraints(state.mesh);
    for (const c of pathList) {
      if (!c) continue;
      const prevTarget = c.target;
      if (!validBone(c.target)) c.target = fallbackBone;
      const cleaned = Array.isArray(c.bones) ? [...new Set(c.bones.map((v) => Number(v)).filter((v) => validBone(v)))] : [];
      if (!Array.isArray(c.bones) || cleaned.length !== c.bones.length || cleaned.some((v, i) => v !== c.bones[i])) c.bones = cleaned;
      if (c.sourceType === "slot") {
        const tsi = Number(c.targetSlot);
        if (!Number.isFinite(tsi) || tsi < 0 || tsi >= slots.length) {
          c.sourceType = "drawn";
          c.targetSlot = slots.length > 0 ? 0 : -1;
          fixed += 1;
        }
      }
      const shouldEnable = c.bones.length > 0 && validBone(c.target);
      if (c.enabled !== shouldEnable) c.enabled = shouldEnable;
      if (prevTarget !== c.target || !shouldEnable) fixed += 1;
    }
  }

  const animIds = new Set((state.anim.animations || []).map((a) => String(a.id)));
  for (const layer of ensureAnimLayerTracks()) {
    if (!layer) continue;
    if (layer.animId && !animIds.has(String(layer.animId))) {
      layer.animId = "";
      layer.enabled = false;
      fixed += 1;
    }
  }

  const sm = ensureStateMachine();
  const stateIds = new Set((sm.states || []).map((s) => String(s.id)));
  const paramIds = new Set((sm.parameters || []).map((p) => String(p.id)));
  for (const st of sm.states || []) {
    if (!st) continue;
    if (st.animId && !animIds.has(String(st.animId))) {
      st.animId = "";
      fixed += 1;
    }
    const beforeN = Array.isArray(st.transitions) ? st.transitions.length : 0;
    st.transitions = (Array.isArray(st.transitions) ? st.transitions : []).filter((tr) => tr && stateIds.has(String(tr.toStateId)));
    for (const tr of st.transitions) {
      if (!tr || !Array.isArray(tr.conditions)) continue;
      const prev = tr.conditions.length;
      tr.conditions = tr.conditions.filter((c) => c && paramIds.has(String(c.paramId || "")));
      if (tr.conditions.length !== prev) fixed += 1;
    }
    if (st.transitions.length !== beforeN) fixed += 1;
  }

  const validLayerIds = new Set(ensureAnimLayerTracks().map((l) => String(l.id)));
  const validParamIds = new Set((sm.parameters || []).map((p) => String(p.id)));
  const validTrackRef = (trackId) => {
    const p = parseTrackId(trackId);
    if (!p) return false;
    if (p.type === "bone") return Number.isFinite(p.boneIndex) && p.boneIndex >= 0 && p.boneIndex < bones.length;
    if (p.type === "mesh") return p.slotIndex == null || (Number.isFinite(p.slotIndex) && p.slotIndex >= 0 && p.slotIndex < slots.length);
    if (p.type === "slot") return Number.isFinite(p.slotIndex) && p.slotIndex >= 0 && p.slotIndex < slots.length;
    if (p.type === "ik") return state.mesh && Number.isFinite(p.ikIndex) && p.ikIndex >= 0 && p.ikIndex < ensureIKConstraints(state.mesh).length;
    if (p.type === "tfc") return state.mesh && Number.isFinite(p.transformIndex) && p.transformIndex >= 0 && p.transformIndex < ensureTransformConstraints(state.mesh).length;
    if (p.type === "pth") return state.mesh && Number.isFinite(p.pathIndex) && p.pathIndex >= 0 && p.pathIndex < ensurePathConstraints(state.mesh).length;
    if (p.type === "layer") return validLayerIds.has(String(p.layerId || ""));
    if (p.type === "smparam") return validParamIds.has(String(p.paramId || ""));
    if (p.type === "draworder" || p.type === "event") return true;
    return true;
  };
  for (const anim of state.anim.animations || []) {
    if (!anim || !anim.tracks || typeof anim.tracks !== "object") continue;
    for (const trackId of Object.keys(anim.tracks)) {
      if (!validTrackRef(trackId)) {
        delete anim.tracks[trackId];
        fixed += 1;
      }
    }
  }

  ensureSlotsHaveBoneBinding();
  refreshAnimationUI();
  refreshSlotUI();
  updateBoneUI();
  renderBoneTree();
  if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time);

  if (fixed > 0) {
    pushUndoCheckpoint(true);
    setStatus(`Diagnostics auto-fix applied: ${fixed} change(s).`);
  } else {
    setStatus("Diagnostics auto-fix: no safe changes needed.");
  }
  return fixed;
}

async function exportSpineData() {
  const compat = getSpineCompatPreset(state.export && state.export.spineCompat);
  const asked = window.prompt("Export base name", "spine_export");
  if (asked == null) return;
  const baseName = sanitizeExportName(asked, "spine_export");
  const scaleAsked = window.prompt("Atlas texture scale (0.1~1.0, default 0.75)", "0.75");
  if (scaleAsked == null) return;
  const textureScale = math.clamp(Number(scaleAsked) || 0.75, 0.1, 1);
  const pageName = `${baseName}.png`;
  const { json, slotExportInfos, hasVertexTrack, hasWeightedSlot, skippedPathForExport, skippedPathAttachmentForExport } =
    buildSpineJsonData(compat.id);
  const validation = validateSpineJsonForExport(json, compat.id);
  if (validation.errors.length > 0) {
    throw new Error(`Spine JSON validation failed: ${validation.errors[0]}`);
  }
  // Atlas options: read from state.export.atlas if set, otherwise defaults.
  // (UI control wiring lives in the export panel; here we just consume.)
  const atlasOpts = (state.export && state.export.atlas && typeof state.export.atlas === "object") ? state.export.atlas : {};
  const { pages, atlas, scale } = packSlotsToAtlasPage(slotExportInfos, pageName, textureScale, atlasOpts);
  const skelBytes = exportSpineSkelBinary(json);
  const jsonBlob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
  const atlasBlob = new Blob([atlas], { type: "text/plain;charset=utf-8" });
  const skelBlob = new Blob([skelBytes], { type: "application/octet-stream" });
  downloadBlobFile(jsonBlob, `${baseName}.json`);
  downloadBlobFile(atlasBlob, `${baseName}.atlas`);
  for (const page of pages) {
    const blob = await canvasToBlob(page.canvas, "image/png");
    downloadBlobFile(blob, page.name);
  }
  downloadBlobFile(skelBlob, `${baseName}.skel`);
  const pagesNote = pages.length > 1 ? ` across ${pages.length} atlas page(s)` : "";
  if (hasVertexTrack) {
    setStatus(
      `Exported ${baseName}.json/.atlas/.png/.skel (Spine ${compat.version}, atlas scale ${scale.toFixed(2)}${pagesNote}); mesh deform exported in JSON and SKEL (experimental compatibility).`
    );
  } else if (hasWeightedSlot) {
    setStatus(
      `Exported ${baseName}.json/.atlas/.png/.skel (Spine ${compat.version}, atlas scale ${scale.toFixed(2)}${pagesNote}); weighted slot needs mesh export for multi-bone motion).`
    );
  } else {
    setStatus(`Exported ${baseName}.json/.atlas/.png/.skel (Spine ${compat.version}, atlas scale ${scale.toFixed(2)}${pagesNote}).`);
  }
  if ((Number(skippedPathForExport) || 0) > 0) {
    setStatus(
      `Export note: ${Number(skippedPathForExport)} path constraint(s) not written to Spine export (invalid target/source).`
    );
  }
  if ((Number(skippedPathAttachmentForExport) || 0) > 0) {
    setStatus(`Export note: ${Number(skippedPathAttachmentForExport)} path attachment(s) could not be generated from slot contour.`);
  }
  if (validation.warnings.length > 0) {
    setStatus(`Export warning: ${validation.warnings[0]}`);
  }
}
