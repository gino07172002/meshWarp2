// ROLE: File I/O action bindings — save/load native project JSON,
// import Spine 4.x JSON skeletons, upgrade legacy project schemas.
// EXPORTS:
//   - upgradeLegacyProject (legacy schema migration)
//   - importSpineJsonInto, applySpineAttachmentToSlot,
//     importSpineAnimations, spineCurveToInterp (Spine import pipeline)
//   - handleProjectLoadInputChange (native .json file input handler)
// EVENT WIRING: #fileSaveBtn, #fileLoadBtn, #projectLoadInput,
//   #spineImportBtn, #spineImportInput.
// CONSUMERS: triggered via UI; produces side-effects on state.mesh,
//   state.slots, state.anim. Calls rebuildMesh / scheduleDraw after.
// ----------------------------------------------------------------
// Recent Projects
// Index (metadata only) → localStorage RECENT_PROJECTS_KEY
//   Each entry: { id, name, savedAt, slotCount, imageCount }
// Full payload → IndexedDB "mesh_deformer_db" / store "recent_payloads", key = id
//
// Keeping only metadata in localStorage means autosave quota is not affected
// by recent entries. Full payloads live in IndexedDB which has a much larger
// quota and does not compete with autosave.
// ----------------------------------------------------------------

function _openRecentDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("mesh_deformer_db", 1);
    req.onupgradeneeded = (ev) => {
      const db = ev.target.result;
      if (!db.objectStoreNames.contains("recent_payloads")) {
        db.createObjectStore("recent_payloads", { keyPath: "id" });
      }
    };
    req.onsuccess = (ev) => resolve(ev.target.result);
    req.onerror = () => reject(req.error);
  });
}

function _idbPut(db, id, payload) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("recent_payloads", "readwrite");
    tx.objectStore("recent_payloads").put({ id, payload });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function _idbGet(db, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("recent_payloads", "readonly");
    const req = tx.objectStore("recent_payloads").get(id);
    req.onsuccess = () => resolve(req.result ? req.result.payload : null);
    req.onerror = () => reject(req.error);
  });
}

function _idbDelete(db, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("recent_payloads", "readwrite");
    tx.objectStore("recent_payloads").delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function getRecentProjects() {
  try {
    const raw = localStorage.getItem(RECENT_PROJECTS_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function _saveRecentIndex(list) {
  try {
    localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(list));
  } catch { /* ignore — metadata is tiny, quota errors here are unexpected */ }
}

async function saveRecentProject(name, payload) {
  try {
    const id = `recent_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const meta = {
      id,
      name: String(name || "Untitled"),
      savedAt: Date.now(),
      slotCount: Array.isArray(payload.slots) ? payload.slots.length : 0,
      imageCount: Array.isArray(payload.slotImages) ? payload.slotImages.length : 0,
    };
    // Persist full payload to IndexedDB (large quota, no autosave competition).
    const db = await _openRecentDB();
    // Remove IDB entries for any existing records with the same name.
    let list = getRecentProjects();
    const displaced = list.filter((e) => e.name === meta.name);
    for (const old of displaced) {
      _idbDelete(db, old.id).catch(() => {});
    }
    await _idbPut(db, id, payload);
    // Evict oldest entries beyond the cap (delete their IDB payloads too).
    list = list.filter((e) => e.name !== meta.name);
    list.unshift(meta);
    while (list.length > RECENT_PROJECTS_MAX) {
      const evicted = list.pop();
      _idbDelete(db, evicted.id).catch(() => {});
    }
    _saveRecentIndex(list);
  } catch { /* non-fatal */ }
}

async function clearRecentProject(id) {
  try {
    let list = getRecentProjects();
    list = list.filter((e) => e.id !== id);
    _saveRecentIndex(list);
    const db = await _openRecentDB();
    _idbDelete(db, id).catch(() => {});
  } catch { /* ignore */ }
}

async function loadFromRecentProject(meta) {
  if (!meta || !meta.id) return;
  try {
    const db = await _openRecentDB();
    const payload = await _idbGet(db, meta.id);
    if (!payload) {
      setStatus("Recent project not found (may have been cleared). Please load from file.");
      return;
    }
    const data = upgradeLegacyProject(payload);
    const ok = await applyProjectPayload(data);
    if (ok) {
      // Promote this entry to top (MRU behaviour): always update savedAt,
      // even when the entry is already first (timestamp reflects last use).
      let list = getRecentProjects();
      const idx = list.findIndex((e) => e.id === meta.id);
      if (idx >= 0) {
        const [promoted] = list.splice(idx, 1);
        promoted.savedAt = Date.now();
        list.unshift(promoted);
        _saveRecentIndex(list);
      }
      updateRecentProjectsMenu();
    }
  } catch (err) {
    setStatus(`Recent project load failed: ${err.message}`);
  }
}

function updateRecentProjectsMenu() {
  const listEl = document.getElementById("recentProjectsList");
  const emptyEl = document.getElementById("recentProjectsEmpty");
  const itemEl = document.getElementById("recentProjectsItem");
  if (!listEl || !emptyEl) return;
  const list = getRecentProjects();
  listEl.innerHTML = "";
  if (list.length === 0) {
    emptyEl.style.display = "";
    if (itemEl) itemEl.style.opacity = "0.5";
    return;
  }
  emptyEl.style.display = "none";
  if (itemEl) itemEl.style.opacity = "";
  for (let i = 0; i < list.length; i += 1) {
    const entry = list[i];
    const dateStr = new Date(entry.savedAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    const btn = document.createElement("button");
    btn.type = "button";
    btn.role = "menuitem";
    btn.className = "menu-recent-item";
    btn.innerHTML = `<span class="menu-recent-name">${entry.name.replace(/</g, "&lt;")}</span><span class="menu-recent-meta">${entry.slotCount} slot${entry.slotCount !== 1 ? "s" : ""} &middot; ${dateStr}</span>`;
    btn.addEventListener("click", () => { loadFromRecentProject(entry); });
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "menu-recent-remove";
    removeBtn.title = "Remove from list";
    removeBtn.textContent = "×";
    removeBtn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      clearRecentProject(entry.id);
      updateRecentProjectsMenu();
    });
    const row = document.createElement("div");
    row.className = "menu-recent-row";
    row.appendChild(btn);
    row.appendChild(removeBtn);
    listEl.appendChild(row);
  }
}

if (els.fileSaveBtn) {
  els.fileSaveBtn.addEventListener("click", async () => {
    const payload = buildProjectPayload();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const fileName = `mesh_deformer_project_${new Date().toISOString().slice(0, 10)}.json`;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
    saveAutosaveSnapshot("manual_save", true);
    setStatus(`Project saved (JSON, ${payload.slotImages.length} embedded image(s)).`);
    await saveRecentProject(fileName, payload);
    updateRecentProjectsMenu();
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

function upgradeLegacyProject(payload) {
  const data = payload && typeof payload === "object" ? payload : {};
  const version = Number(data.projectVersion ?? data.version ?? 1);
  if (!Array.isArray(data.slots)) {
    data.projectVersion = 2;
    return data;
  }
  if (version >= 2) {
    data.projectVersion = 2;
    return data;
  }

  data.slots = data.slots.map((slot, slotIndex) => {
    const src = slot && typeof slot === "object" ? slot : {};
    const baseAttachmentName = String(src.attachmentName || "main").trim() || "main";
    const basePlaceholder = String(src.placeholderName || baseAttachmentName || "main").trim() || "main";
    const legacyType = src.meshData ? ATTACHMENT_TYPES.MESH : ATTACHMENT_TYPES.REGION;
    const attachments = Array.isArray(src.attachments) && src.attachments.length > 0
      ? src.attachments.map((att, attIndex) => {
          const rec = att && typeof att === "object" ? { ...att } : {};
          rec.name = String(rec.name || (attIndex === 0 ? baseAttachmentName : `attachment_${slotIndex}_${attIndex + 1}`)).trim() || `attachment_${slotIndex}_${attIndex + 1}`;
          rec.placeholder = String(rec.placeholder || basePlaceholder).trim() || basePlaceholder;
          rec.type = normalizeAttachmentType(rec.type || (rec.meshData ? ATTACHMENT_TYPES.MESH : legacyType));
          return rec;
        })
      : [
          {
            name: baseAttachmentName,
            placeholder: basePlaceholder,
            type: legacyType,
          },
        ];

    const activeName = String(src.activeAttachment || src.attachmentName || attachments[0].name || baseAttachmentName).trim() || attachments[0].name;
    const activeIndex = Math.max(0, attachments.findIndex((att) => att && att.name === activeName));
    const target = attachments[activeIndex] || attachments[0];
    if (target) {
      if (src.meshData && !target.meshData) target.meshData = src.meshData;
      if (src.meshContour && !target.meshContour) target.meshContour = src.meshContour;
      if (Object.prototype.hasOwnProperty.call(src, "useWeights") && !Object.prototype.hasOwnProperty.call(target, "useWeights")) {
        target.useWeights = src.useWeights;
      }
      if (src.weightBindMode && !target.weightBindMode) target.weightBindMode = src.weightBindMode;
      if (src.weightMode && !target.weightMode) target.weightMode = src.weightMode;
      if (Array.isArray(src.influenceBones) && (!Array.isArray(target.influenceBones) || target.influenceBones.length <= 0)) {
        target.influenceBones = src.influenceBones.slice();
      }
      if (Object.prototype.hasOwnProperty.call(src, "clipEnabled") && !Object.prototype.hasOwnProperty.call(target, "clipEnabled")) {
        target.clipEnabled = src.clipEnabled;
      }
      if (src.clipSource && !target.clipSource) target.clipSource = src.clipSource;
      if (Object.prototype.hasOwnProperty.call(src, "clipEndSlotId") && !Object.prototype.hasOwnProperty.call(target, "clipEndSlotId")) {
        target.clipEndSlotId = src.clipEndSlotId;
      }
      if (target.meshData && normalizeAttachmentType(target.type) === ATTACHMENT_TYPES.REGION) {
        target.type = ATTACHMENT_TYPES.MESH;
      }
    }

    const {
      meshData,
      meshContour,
      useWeights,
      weightBindMode,
      weightMode,
      influenceBones,
      clipEnabled,
      clipSource,
      clipEndSlotId,
      version: legacyVersion,
      ...rest
    } = src;

    return {
      ...rest,
      attachmentName: baseAttachmentName,
      placeholderName: basePlaceholder,
      activeAttachment: target ? target.name : activeName,
      attachments,
    };
  });

  data.projectVersion = 2;
  return data;
}

async function applyProjectPayload(data) {
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
      // Decode each image individually; never let a single bad entry abort
      // the entire restore. Bad entries become null so downstream
      // imageIndex lookups can fall back to a placeholder canvas.
      const decoded = [];
      let decodeFailures = 0;
      for (const src of data.slotImages) {
        if (typeof src !== "string" || src.length === 0) {
          decoded.push(null);
          continue;
        }
        try {
          decoded.push(await canvasFromDataUrl(src));
        } catch (decodeErr) {
          decodeFailures += 1;
          console.warn("[load] failed to decode embedded image", decodeErr);
          decoded.push(null);
        }
      }
      const okCount = decoded.filter((c) => !!c).length;
      if (okCount === 0) throw new Error("Project has slotImages but none could be decoded.");
      if (decodeFailures > 0) {
        setStatus(`Warning: ${decodeFailures} embedded image(s) could not be decoded; affected attachments will be empty.`);
      }
      // Release GL textures for the previous project's slot canvases before
      // we drop the references. Without this, repeatedly loading projects
      // (or restoring autosaves) accumulates GPU textures and eventually
      // pushes Edge over its WebGL context budget.
      if (typeof resetGLTextureCache === "function") {
        resetGLTextureCache();
      } else if (typeof releaseGLTexturesForSlot === "function") {
        for (const oldSlot of state.slots) releaseGLTexturesForSlot(oldSlot);
      }
      state.mesh = null;
      state.slots = [];
      state.activeSlot = -1;
      state.sourceCanvas = null;
      const firstDecoded = decoded.find((c) => !!c) || null;
      state.imageWidth = Number(data.imageWidth) || (firstDecoded ? firstDecoded.width : 1);
      state.imageHeight = Number(data.imageHeight) || (firstDecoded ? firstDecoded.height : 1);
      const srcSlots = Array.isArray(data.slots) ? data.slots : [];
      if (srcSlots.length === 0) {
        addSlotEntry(
          {
            name: "base",
            canvas: firstDecoded,
            docWidth: state.imageWidth,
            docHeight: state.imageHeight,
            rect: { x: 0, y: 0, w: firstDecoded ? firstDecoded.width : state.imageWidth, h: firstDecoded ? firstDecoded.height : state.imageHeight },
          },
          false
        );
      } else {
        for (const src of srcSlots) {
          const imgIdx = Number(src && src.imageIndex);
          const slotHasOwnImageIndex = Number.isFinite(imgIdx) && imgIdx >= 0 && imgIdx < decoded.length;
          // For the slot-level c: if the saved record explicitly references an
          // imageIndex, use exactly that (null when decode failed -- don't lie
          // to the user). Otherwise fall back to firstDecoded so legacy slots
          // without imageIndex still get a sane canvas to display.
          const c = slotHasOwnImageIndex ? decoded[imgIdx] : firstDecoded;
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
                      // Distinguish three cases:
                      //  (1) attachment had a valid imageIndex AND decode succeeded -> use that canvas
                      //  (2) attachment had a valid imageIndex BUT decode failed -> keep null
                      //      (don't silently substitute the slot's primary canvas, which
                      //       would mislead the user about which image is broken)
                      //  (3) attachment had no imageIndex (legacy / non-visual) -> fall back to slot c
                      const hasOwnImageIndex = Number.isFinite(ai) && ai >= 0 && ai < decoded.length;
                      const ac = hasOwnImageIndex ? decoded[ai] : c;
                      return {
                        name: String(a && a.name ? a.name : "").trim(),
                        placeholder: String(a && a.placeholder ? a.placeholder : src && src.placeholderName ? src.placeholderName : src && src.attachmentName ? src.attachmentName : "main").trim(),
                        canvas: isVisualAttachment({ type: a && a.type }) ? ac : null,
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
                              frames: Array.isArray(a.sequence.frameImageIndices)
                                ? a.sequence.frameImageIndices
                                    .map((idx) => {
                                      const i = Number(idx);
                                      return Number.isFinite(i) && i >= 0 && i < decoded.length ? decoded[i] : null;
                                    })
                                    .filter((cv) => !!cv)
                                : [],
                            }
                            : { enabled: false, count: 1, start: 0, digits: 2, setupIndex: 0, mode: 0, path: "", frames: [] },
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
                        puppetWarp:
                          a && a.puppetWarp && Array.isArray(a.puppetWarp.pins)
                            ? {
                                mode: a.puppetWarp.mode === "post_skin" ? "post_skin" : "standalone",
                                pins: a.puppetWarp.pins.map((p) => ({
                                  id: String(p.id),
                                  vertexIndex: Number(p.vertexIndex),
                                  restX: Number(p.restX),
                                  restY: Number(p.restY),
                                  label: String(p.label || ""),
                                })),
                                bake: { dirty: true, lastTopologyHash: "" },
                              }
                            : null,
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
                    // Keep visual-but-canvas:null entries so the user can
                    // see exactly which attachment is broken (decode failed
                    // upstream). Renderers / hasRenderableAttachment will
                    // skip drawing them; UI can show a placeholder.
                    .filter((a) => a.name.length > 0)
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
                  : {
                    x: 0,
                    y: 0,
                    // c may be null when this slot's image failed to decode;
                    // fall back to firstDecoded then to project image dims.
                    w: Math.max(1, (c && c.width) || (firstDecoded && firstDecoded.width) || state.imageWidth || 1),
                    h: Math.max(1, (c && c.height) || (firstDecoded && firstDecoded.height) || state.imageHeight || 1),
                  },
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
      // Fallback: if the chosen active slot's active attachment has no
      // canvas (e.g. it's a boundingbox/clipping/point, or its visual
      // attachment was filtered out for missing canvas), source-canvas
      // will be null and rebuildMesh() bails out, leaving state.mesh = null
      // and the Object workspace tab disabled. Walk slots/attachments and
      // pick the first one with a canvas so the mesh can be rebuilt.
      if (!state.sourceCanvas) {
        let recovered = false;
        outer: for (let si = 0; si < state.slots.length; si += 1) {
          const s = state.slots[si];
          const list = s && Array.isArray(s.attachments) ? s.attachments : [];
          for (const a of list) {
            if (a && a.canvas) {
              s.activeAttachment = a.name;
              setActiveSlot(si);
              if (!state.sourceCanvas && typeof syncSourceCanvasToActiveAttachment === "function") {
                syncSourceCanvasToActiveAttachment(s);
              }
              if (state.sourceCanvas) {
                recovered = true;
                break outer;
              }
            }
          }
        }
        if (!recovered) {
          console.warn("[load] no slot attachment with a canvas found; mesh cannot be rebuilt");
        }
      }
    } else if (!state.sourceCanvas && state.slots.length === 0) {
      setStatus("No embedded images in file. Import image/PSD first, then load this legacy project json.");
      return false;
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
    if (state.mesh && Array.isArray(data.physicsConstraints)) {
      state.mesh.physicsConstraints = data.physicsConstraints.map((c, i) => ({
        name: c && c.name ? String(c.name) : `physics_${i}`,
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
      }));
      ensurePhysicsConstraints(state.mesh);
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
      if (data.animationState.exportModal && typeof data.animationState.exportModal === "object") {
        const em = data.animationState.exportModal;
        state.anim.exportModal = {
          format: ["gif", "webm", "pngseq", "webp"].indexOf(String(em.format)) >= 0 ? String(em.format) : "gif",
          fps: Math.max(1, Math.min(60, Math.round(Number(em.fps) || 30))),
          scale: em.scale === "custom" ? "custom" : (Number(em.scale) || 1),
          width: Math.max(0, Math.min(4096, Math.round(Number(em.width) || 0))),
          height: Math.max(0, Math.min(4096, Math.round(Number(em.height) || 0))),
          lockAspect: em.lockAspect !== false,
          bgTransparent: em.bgTransparent !== false,
          bgColor: String(em.bgColor || "#000000"),
          loopCount: Math.max(0, Math.min(0xffff, Math.round(Number(em.loopCount) || 0))),
          prefix: String(em.prefix || "export"),
          zipPng: em.zipPng !== false,
        };
      } else if (data.animationState.batchExport && typeof data.animationState.batchExport === "object") {
        const be = data.animationState.batchExport;
        const beFormat = String(be.format || "");
        state.anim.exportModal = {
          format: beFormat === "gif" || beFormat === "pngseq" || beFormat === "webm" ? beFormat : "gif",
          fps: Math.max(1, Math.min(60, Math.round(Number(be.fps) || 30))),
          scale: 1,
          width: 0,
          height: 0,
          lockAspect: true,
          bgTransparent: true,
          bgColor: "#000000",
          loopCount: 0,
          prefix: String(be.prefix || "export"),
          zipPng: be.zipPng !== false,
        };
      } else {
        state.anim.exportModal = {
          format: "gif", fps: 30, scale: 1, width: 0, height: 0, lockAspect: true,
          bgTransparent: true, bgColor: "#000000", loopCount: 0, prefix: "export", zipPng: true,
        };
      }
    } else {
      state.anim.layerTracks = [];
      state.anim.selectedLayerTrackId = "";
      state.anim.exportModal = {
        format: "gif", fps: 30, scale: 1, width: 0, height: 0, lockAspect: true,
        bgTransparent: true, bgColor: "#000000", loopCount: 0, prefix: "export", zipPng: true,
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
                  inheritTimelines: !!a.inheritTimelines,
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
              a.inheritTimelines = !!meta.inheritTimelines;
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
          const dstAttContour = getActiveAttachment(dst);
          if (dstAttContour && !(dstAttContour.meshContour && Array.isArray(dstAttContour.meshContour.points) && dstAttContour.meshContour.points.length > 0)) {
            dstAttContour.meshContour = cloneSlotContourData(restoredContour);
          }
          if (
            dstAttContour &&
            !src.meshData &&
            !(dstAttContour.meshData && dstAttContour.meshData.positions && dstAttContour.meshData.positions.length > 0) &&
            restoredContour.closed &&
            ((restoredContour.fillPoints && restoredContour.fillPoints.length >= 3) ||
              (restoredContour.points && restoredContour.points.length >= 3))
          ) {
            applyContourMeshToSlot(dst);
          }
        } else {
          ensureSlotContour(dst);
        }
        dst.docWidth = Number.isFinite(src.docWidth) ? src.docWidth : state.imageWidth;
        dst.docHeight = Number.isFinite(src.docHeight) ? src.docHeight : state.imageHeight;
        if (state.mesh) {
          const restoredMeshData = restoreSlotMeshDataFromPayload(src.meshData, state.mesh.rigBones.length);
          const dstAttMesh = getActiveAttachment(dst);
          if (restoredMeshData) {
            if (dstAttMesh && !dstAttMesh.meshData) dstAttMesh.meshData = restoredMeshData;
          } else {
            ensureSlotMeshData(dst, state.mesh);
          }
        }
        promoteLegacySlotMeshState(dst, { clearLegacy: true, overwriteAttachment: false });
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
        constraints: normalizeSkinConstraintMap(s && s.constraints),
      }))
      : [];
    state.selectedSkinSet = Number.isFinite(Number(data.selectedSkinSet)) ? Number(data.selectedSkinSet) : 0;
    state.activeSkinSetId = data.activeSkinSetId ? String(data.activeSkinSetId) : null;
    ensureSkinSets();
    const skinToApply = getSelectedSkinSet();
    if (skinToApply) applySkinSetToSlots(skinToApply);
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
    // Re-sync workspace switcher (Rig/Mesh/Object tab disabled-state etc.).
    // Without this, the Object tab's `disabled = !state.mesh` stays at its
    // pre-load value until the user clicks any other tab.
    if (typeof updateWorkspaceUI === "function") updateWorkspaceUI();
    // Reset the viewport so the loaded image is centred and fit to the
    // canvas. Without this, state.view can be stuck at (0,0) with
    // scale=1 from before the load (e.g. when restoring from autosave),
    // leaving the image drawn off-screen even though render() succeeded.
    if (state.imageWidth > 0 && state.imageHeight > 0) {
      if (typeof markStageResizeDirty === "function") markStageResizeDirty();
      if (typeof resize === "function") resize(true);
      const overlayW = els.overlay ? els.overlay.width : 0;
      const overlayH = els.overlay ? els.overlay.height : 0;
      console.info(`[load] before resetViewToFit: imageW=${state.imageWidth} imageH=${state.imageHeight} overlayW=${overlayW} overlayH=${overlayH}`);
      if (typeof resetViewToFit === "function") resetViewToFit();
      console.info(`[load] after resetViewToFit: viewC=(${Math.round(state.view.cx)},${Math.round(state.view.cy)}) viewScale=${(Number(state.view.scale) || 0).toFixed(3)}`);
    } else {
      console.warn(`[load] skipped resetViewToFit: imageW=${state.imageWidth} imageH=${state.imageHeight}`);
    }
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
    // Diagnostic: count attachments that ended up without a usable canvas.
    // Helps debug "restore but no images" reports -- if this prints non-zero
    // after a restore, the project payload was already missing/broken
    // images (autosave probably failed to write before reload).
    try {
      let totalAtt = 0;
      let attWithCanvas = 0;
      for (const s of state.slots) {
        const list = Array.isArray(s && s.attachments) ? s.attachments : [];
        for (const a of list) {
          if (!a) continue;
          totalAtt += 1;
          if (a.canvas) attWithCanvas += 1;
        }
      }
      console.info(`[load] slots=${state.slots.length} attachments=${totalAtt} withCanvas=${attWithCanvas} embeddedImages=${Array.isArray(data.slotImages) ? data.slotImages.length : 0}`);
    } catch { /* ignore */ }
    if (!state.history.suspend) {
      state.history.undo = [];
      state.history.redo = [];
      state.history.lastSig = "";
      pushUndoCheckpoint(true);
    }
    saveAutosaveSnapshot("project_load", true);
    return true;
}

async function handleProjectLoadInputChange(e) {
  const f = e.target.files?.[0];
  if (!f) return;
  try {
    const data = upgradeLegacyProject(JSON.parse(await f.text()));
    const ok = await applyProjectPayload(data);
    if (ok) {
      await saveRecentProject(f.name, data);
      updateRecentProjectsMenu();
    }
  } catch (err) {
    setStatus(`Project load failed: ${err.message}`);
  } finally {
    e.target.value = "";
  }
}

// ----------------------------------------------------------------
// Spine JSON import (4.x format).
//
// Scope (v1):
//   - bones, slots, weighted/unweighted mesh + region attachments,
//     bone animations (rotate / translate / scale), deform timelines.
//   - Round-trip with our exporter is the primary supported case:
//     detects the synthetic `__export_root_yup` root and unwraps it,
//     so coords come back into our Y-down space verbatim.
//   - For 3rd-party Spine projects without that root, we Y-negate
//     every bone's y on import (rough Y-up→down conversion).
//
// Out of scope for v1 (logged as warnings, not errors):
//   - Linkedmesh inheritance (parent/skin lookup chain)
//   - Clipping / boundingbox / point attachments
//   - IK / Transform / Path / Physics constraint import
//   - Events, drawOrder timelines, slot color timelines
//   - Atlas references (we expect the user to have already created
//     slots; we match Spine slot names to existing slots by name).
//
// Returns { ok: true, warnings: [...] } or { ok: false, error: "..." }.
function importSpineJsonInto(spineJson) {
  if (!spineJson || typeof spineJson !== "object") {
    return { ok: false, error: "Not a JSON object." };
  }
  const skel = spineJson.skeleton || {};
  const srcBones = Array.isArray(spineJson.bones) ? spineJson.bones : [];
  if (srcBones.length === 0) return { ok: false, error: "No bones in skeleton." };

  const warnings = [];
  // Detect the synthetic root our exporter inserts. If present, drop it
  // and reparent its direct children to "no parent". Spine y-flip is
  // already encoded as scaleY=-1 on that root; once removed, child bone
  // coords are already in our Y-down space.
  const EXPORT_ROOT_NAME = "__export_root_yup";
  const hasSyntheticRoot = !!srcBones.find((b) => b && b.name === EXPORT_ROOT_NAME);
  const filteredBones = srcBones.filter((b) => b && b.name !== EXPORT_ROOT_NAME);

  // Build name→index map and convert each bone. parent is by name in
  // Spine, by index in our model.
  const nameToIndex = new Map();
  for (let i = 0; i < filteredBones.length; i += 1) {
    nameToIndex.set(String(filteredBones[i].name), i);
  }
  const yFlip = hasSyntheticRoot ? 1 : -1; // 3rd-party Spine: invert Y
  const newBones = filteredBones.map((b, i) => {
    const parentName = b.parent && b.parent !== EXPORT_ROOT_NAME ? String(b.parent) : null;
    const parentIdx = parentName != null && nameToIndex.has(parentName) ? nameToIndex.get(parentName) : -1;
    return {
      name: String(b.name || `bone_${i}`),
      parent: parentIdx,
      length: Math.max(0, Number(b.length) || 0),
      tx: Number(b.x) || 0,
      ty: (Number(b.y) || 0) * yFlip,
      rot: math.degToRad(Number(b.rotation) || 0),
      sx: Number.isFinite(Number(b.scaleX)) ? Number(b.scaleX) : 1,
      sy: Number.isFinite(Number(b.scaleY)) ? Number(b.scaleY) : 1,
      shx: math.degToRad(Number(b.shearX) || 0),
      shy: math.degToRad(Number(b.shearY) || 0),
      inherit: b.inherit === "onlyTranslation" || b.inherit === "noScale" || b.inherit === "noScaleOrReflection" || b.inherit === "noRotationOrReflection" ? b.inherit : "normal",
      connected: false,
      poseLenEditable: false,
    };
  });

  // Apply onto the mesh. We require state.mesh to exist (slots created).
  if (!state.mesh) {
    return { ok: false, error: "Import requires an existing project (open or import an image first)." };
  }
  state.mesh.rigBones = newBones;
  enforceConnectedHeads(state.mesh.rigBones);
  syncPoseFromRig(state.mesh);
  syncBindPose(state.mesh);

  // Map slot names → existing internal slot indices. Skip Spine slots
  // that don't have a matching internal slot.
  const slotNameToIndex = new Map();
  for (let i = 0; i < state.slots.length; i += 1) {
    const s = state.slots[i];
    if (s && s.name) slotNameToIndex.set(String(s.name), i);
  }
  const srcSlots = Array.isArray(spineJson.slots) ? spineJson.slots : [];
  let slotsMatched = 0;
  for (const ss of srcSlots) {
    if (!ss || !ss.name) continue;
    const idx = slotNameToIndex.get(String(ss.name));
    if (idx == null) {
      warnings.push(`Slot "${ss.name}" in Spine JSON has no matching internal slot; skipped.`);
      continue;
    }
    const s = state.slots[idx];
    if (ss.bone && nameToIndex.has(String(ss.bone))) s.bone = nameToIndex.get(String(ss.bone));
    if (typeof ss.attachment === "string") s.attachmentName = ss.attachment;
    if (typeof ss.color === "string" && ss.color.length >= 6) {
      const r = parseInt(ss.color.slice(0, 2), 16) / 255;
      const g = parseInt(ss.color.slice(2, 4), 16) / 255;
      const b2 = parseInt(ss.color.slice(4, 6), 16) / 255;
      if (Number.isFinite(r)) s.r = r;
      if (Number.isFinite(g)) s.g = g;
      if (Number.isFinite(b2)) s.b = b2;
      if (ss.color.length >= 8) {
        const a = parseInt(ss.color.slice(6, 8), 16) / 255;
        if (Number.isFinite(a)) s.alpha = a;
      }
    }
    if (typeof ss.dark === "string" && ss.dark.length >= 6) {
      s.darkEnabled = true;
      s.dark = ss.dark.slice(0, 6);
    }
    if (typeof ss.blend === "string") s.blend = ss.blend;
    slotsMatched += 1;
  }

  // Skin attachments: walk { skinName: { slotName: { attName: def } } }
  // and update mesh geometry on matching slot+attachment pairs.
  // Spine 4.x uses an array of skins each with `attachments`; pre-4.x
  // uses an object keyed by skin name. Handle both.
  const skinsRaw = spineJson.skins;
  let skinList = [];
  if (Array.isArray(skinsRaw)) {
    skinList = skinsRaw;
  } else if (skinsRaw && typeof skinsRaw === "object") {
    skinList = Object.entries(skinsRaw).map(([name, attachments]) => ({ name, attachments }));
  }
  let attachmentsApplied = 0;
  for (const skin of skinList) {
    if (skin.name !== "default") {
      warnings.push(`Skin "${skin.name}" import is not yet supported (only "default" is applied); skipped.`);
      continue;
    }
    const atts = skin.attachments || {};
    for (const [slotName, slotAtts] of Object.entries(atts)) {
      const sIdx = slotNameToIndex.get(slotName);
      if (sIdx == null || !slotAtts || typeof slotAtts !== "object") continue;
      for (const [attName, def] of Object.entries(slotAtts)) {
        if (!def || typeof def !== "object") continue;
        const result = applySpineAttachmentToSlot(state.slots[sIdx], attName, def, nameToIndex);
        if (result.applied) attachmentsApplied += 1;
        if (result.warning) warnings.push(result.warning);
      }
    }
  }

  // Animations.
  const animSrc = spineJson.animations;
  if (animSrc && typeof animSrc === "object") {
    importSpineAnimations(animSrc, slotNameToIndex, nameToIndex, warnings);
  }

  return {
    ok: true,
    warnings,
    summary: { bones: newBones.length, slotsMatched, attachmentsApplied, animations: animSrc ? Object.keys(animSrc).length : 0 },
  };
}

// Apply a Spine attachment definition onto a slot's matching attachment
// entry. Handles region (no geometry change beyond position/size) and
// mesh (vertices + uvs + triangles, weighted or not). Returns
// { applied: bool, warning: string | null }.
function applySpineAttachmentToSlot(slot, attName, def, boneNameToIndex) {
  if (!slot) return { applied: false, warning: null };
  const type = String(def.type || "region").toLowerCase();
  // Find the matching attachment by name on this slot. We don't create
  // new attachment entries on import — caller must have set them up.
  const attList = Array.isArray(slot.attachments) ? slot.attachments : [];
  const target = attList.find((a) => a && String(a.name) === String(attName));
  if (!target) return { applied: false, warning: `Slot "${slot.name}": no attachment "${attName}"; skipped.` };

  if (type === "region") {
    // Spine region: x, y, scaleX, scaleY, rotation, width, height. We
    // don't have a comparable "region transform" field in our model
    // (regions are placed by the slot's bone), so we just record name.
    // No-op beyond the existing entry.
    return { applied: true, warning: null };
  }
  if (type === "mesh") {
    const uvsArr = Array.isArray(def.uvs) ? def.uvs : null;
    const trisArr = Array.isArray(def.triangles) ? def.triangles : null;
    const versArr = Array.isArray(def.vertices) ? def.vertices : null;
    if (!uvsArr || !trisArr || !versArr) {
      return { applied: false, warning: `Mesh "${attName}" missing uvs/triangles/vertices; skipped.` };
    }
    const vCount = uvsArr.length / 2;
    const positions = new Float32Array(vCount * 2);
    const isWeighted = versArr.length !== uvsArr.length; // unweighted = same length as uvs (just x,y pairs)
    let weights = null;
    const boneCount = state.mesh && Array.isArray(state.mesh.rigBones) ? state.mesh.rigBones.length : 0;
    if (isWeighted && boneCount > 0) {
      weights = new Float32Array(vCount * boneCount);
      let p = 0;
      for (let i = 0; i < vCount; i += 1) {
        const n = Number(versArr[p++]) | 0;
        let acc = 0;
        for (let k = 0; k < n; k += 1) {
          const bi = Number(versArr[p++]) | 0;
          const bx = Number(versArr[p++]) || 0;
          const by = Number(versArr[p++]) || 0;
          const w = Number(versArr[p++]) || 0;
          if (bi >= 0 && bi < boneCount) {
            // Spine packs bind-space coords per bone influence; we
            // store the vertex's authoritative position as the
            // weighted sum (matches how our exporter went the other way).
            const bone = state.mesh.rigBones[bi];
            const cosR = Math.cos(bone.rot || 0);
            const sinR = Math.sin(bone.rot || 0);
            const wx = (bone.tx || 0) + cosR * bx - sinR * by;
            const wy = (bone.ty || 0) + sinR * bx + cosR * by;
            positions[i * 2] += wx * w;
            positions[i * 2 + 1] += wy * w;
            weights[i * boneCount + bi] += w;
            acc += w;
          }
        }
        if (acc <= 0) {
          // No valid influence — leave at origin to avoid NaN.
          positions[i * 2] = 0;
          positions[i * 2 + 1] = 0;
        }
      }
    } else {
      // Unweighted: vertices array is just x,y pairs in slot-local space.
      for (let i = 0; i < vCount; i += 1) {
        positions[i * 2] = Number(versArr[i * 2]) || 0;
        positions[i * 2 + 1] = Number(versArr[i * 2 + 1]) || 0;
      }
    }
    // Apply onto the attachment's meshData.
    if (!target.meshData || typeof target.meshData !== "object") target.meshData = {};
    target.meshData.positions = positions;
    target.meshData.uvs = new Float32Array(uvsArr);
    target.meshData.indices = new Uint16Array(trisArr);
    if (weights) target.meshData.weights = weights;
    return { applied: true, warning: null };
  }
  if (type === "linkedmesh" || type === "clipping" || type === "boundingbox" || type === "point") {
    return { applied: false, warning: `Attachment type "${type}" import is not yet supported; skipped.` };
  }
  return { applied: false, warning: `Unknown attachment type "${type}"; skipped.` };
}

// Animations: convert each Spine animation into our internal
// {id, name, length, tracks{}} record. Tracks live as flat arrays of
// keyframes keyed by track id strings (e.g. `bone:N:rot`).
function importSpineAnimations(animSrc, slotNameToIndex, boneNameToIndex, warnings) {
  if (!Array.isArray(state.anim.animations)) state.anim.animations = [];
  for (const [animName, animDef] of Object.entries(animSrc)) {
    if (!animDef || typeof animDef !== "object") continue;
    const tracks = Object.create(null);
    let maxTime = 0;
    const noteTime = (t) => { if (t > maxTime) maxTime = t; };
    // Bone animations.
    const boneAnims = animDef.bones && typeof animDef.bones === "object" ? animDef.bones : {};
    for (const [boneName, channels] of Object.entries(boneAnims)) {
      const bi = boneNameToIndex.get(String(boneName));
      if (bi == null) continue;
      if (Array.isArray(channels.rotate)) {
        const rows = channels.rotate.map((k) => ({
          time: Number(k.time) || 0,
          value: math.degToRad(Number(k.value != null ? k.value : k.angle) || 0),
          interp: spineCurveToInterp(k.curve),
        }));
        rows.forEach((r) => noteTime(r.time));
        tracks[`bone:${bi}:rot`] = rows;
      }
      if (Array.isArray(channels.translate)) {
        const xs = [];
        const ys = [];
        for (const k of channels.translate) {
          const t = Number(k.time) || 0;
          const interp = spineCurveToInterp(k.curve);
          xs.push({ time: t, value: Number(k.x) || 0, interp });
          ys.push({ time: t, value: Number(k.y) || 0, interp });
          noteTime(t);
        }
        tracks[`bone:${bi}:tx`] = xs;
        tracks[`bone:${bi}:ty`] = ys;
      }
      if (Array.isArray(channels.scale)) {
        const xs = [];
        const ys = [];
        for (const k of channels.scale) {
          const t = Number(k.time) || 0;
          const interp = spineCurveToInterp(k.curve);
          xs.push({ time: t, value: Number(k.x != null ? k.x : 1), interp });
          ys.push({ time: t, value: Number(k.y != null ? k.y : 1), interp });
          noteTime(t);
        }
        tracks[`bone:${bi}:sx`] = xs;
        tracks[`bone:${bi}:sy`] = ys;
      }
    }
    // Deform timelines: { skinName: { slotName: { attName: [{time, vertices: [...]}] } } }
    const deformAll = animDef.deform && typeof animDef.deform === "object" ? animDef.deform : {};
    for (const [skinName, slotsByName] of Object.entries(deformAll)) {
      if (skinName !== "default") {
        warnings.push(`Animation "${animName}" deform under skin "${skinName}" not imported (only "default").`);
        continue;
      }
      for (const [slotName, attsByName] of Object.entries(slotsByName || {})) {
        const sIdx = slotNameToIndex.get(slotName);
        if (sIdx == null) continue;
        for (const [attName, frames] of Object.entries(attsByName || {})) {
          if (!Array.isArray(frames)) continue;
          const rows = frames.map((k) => ({
            time: Number(k.time) || 0,
            vertices: Array.isArray(k.vertices) ? k.vertices.slice() : [],
            offset: Number(k.offset) || 0,
            interp: spineCurveToInterp(k.curve),
          }));
          rows.forEach((r) => noteTime(r.time));
          tracks[`deform:${sIdx}:${attName}`] = rows;
        }
      }
    }
    state.anim.animations.push({
      id: `anim_${state.anim.animations.length}`,
      name: animName,
      length: maxTime,
      tracks,
    });
  }
}

function spineCurveToInterp(curve) {
  if (curve === "stepped") return "stepped";
  if (Array.isArray(curve)) return "bezier"; // we don't import the cps yet; visual only
  return "linear";
}

if (els.spineImportInput) {
  els.spineImportInput.addEventListener("change", async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    try {
      const text = await f.text();
      const json = JSON.parse(text);
      const result = importSpineJsonInto(json);
      if (!result.ok) {
        setStatus(`Spine import failed: ${result.error}`);
        return;
      }
      const s = result.summary;
      const warnCount = result.warnings.length;
      setStatus(
        `Spine JSON imported: ${s.bones} bones, ${s.slotsMatched} slots matched, ${s.attachmentsApplied} attachments, ${s.animations} animations${warnCount > 0 ? ` (${warnCount} warnings — see console)` : ""}.`
      );
      if (warnCount > 0 && typeof console !== "undefined") {
        console.warn("Spine import warnings:", result.warnings);
      }
      pushUndoCheckpoint(true);
      if (typeof rebuildMesh === "function") rebuildMesh();
      if (typeof scheduleDraw === "function") scheduleDraw();
      if (typeof renderTimelineTracks === "function") renderTimelineTracks();
      if (typeof refreshTrackSelect === "function") refreshTrackSelect();
    } catch (err) {
      setStatus(`Spine import failed: ${err.message}`);
    } finally {
      e.target.value = "";
    }
  });
}
if (els.spineImportBtn) {
  els.spineImportBtn.addEventListener("click", () => {
    if (els.spineImportInput) els.spineImportInput.click();
  });
}
