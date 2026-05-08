// ROLE: Image workspace coordinator. Owns workspace activation/deactivation,
// the work canvas, history (undo/redo per-image), view (zoom/pan), and the
// "active tool" state. Pure state + helpers; rendering lives elsewhere
// (image-workspace render is just `drawImage(workCanvas, ...)` on a 2D
// context, no GL).
//
// Loaded after runtime.js (uses state, els, math, setStatus).
//
// EXPORTS (under window.ImageWorkspace):
//   activate(opts?)            enter the workspace; sets state.imageEditor.active
//   deactivate()               leave; releases work canvas reference
//   loadFromCanvas(c, origin)  install a source canvas (origin: "attachment" | "drop" | "file")
//   loadFromBlob(blob, origin) wrap blob → ImageBitmap → canvas, then loadFromCanvas
//   getWorkCanvas()            current edited canvas (history head)
//   replaceWorkCanvas(c, op?)  push a new canvas + op tag onto history
//   undo() / redo()            move historyIndex; restore that canvas
//   canUndo() / canRedo()
//   resetToSource()            wipe history, reload source as work canvas
//   setTool(tool)              set active tool ("select" | "crop")
//   applyCrop() / cancelCrop()
//   setZoom100() / zoomAtCanvasPoint(x, y, factor) / panByScreenDelta(dx, dy)
//   refreshUI()                redraw image canvas + sync panels
//   isActive()                 boolean

(function buildImageWorkspace() {
  if (typeof window === "undefined") return;
  if (window.ImageWorkspace && window.ImageWorkspace.__installed) return;

  const HISTORY_LIMIT = 12;

  // -- Canvas helpers --------------------------------------------------------
  function makeCanvas(w, h) {
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.floor(w) || 1);
    c.height = Math.max(1, Math.floor(h) || 1);
    return c;
  }

  function cloneCanvas(src) {
    if (!src) return null;
    const c = makeCanvas(src.width, src.height);
    const ctx = c.getContext("2d");
    if (ctx) ctx.drawImage(src, 0, 0);
    return c;
  }

  function makeThumbnail(src, maxDim = 64) {
    if (!src || !src.width || !src.height) return null;
    const ratio = Math.max(src.width, src.height) / maxDim;
    const w = Math.max(1, Math.floor(src.width / Math.max(1, ratio)));
    const h = Math.max(1, Math.floor(src.height / Math.max(1, ratio)));
    const t = makeCanvas(w, h);
    const ctx = t.getContext("2d");
    if (ctx) ctx.drawImage(src, 0, 0, w, h);
    return t;
  }

  // -- Source / work / history -----------------------------------------------
  function ensureState() {
    if (!state.imageEditor) {
      state.imageEditor = {
        active: false,
        source: { canvas: null, width: 0, height: 0, origin: "", slotIndex: -1, attachmentName: "" },
        workCanvas: null,
        history: [],
        historyIndex: -1,
        view: { scale: 1, cx: 0, cy: 0 },
        tool: "select",
        cropRect: null,
        cropDrag: null,
        bgRemoval: { modelLoaded: false, modelLoading: false, threshold: 0.5, feather: 1 },
      };
    }
    return state.imageEditor;
  }

  function activate(opts) {
    const ie = ensureState();
    ie.active = true;
    if (opts && typeof opts === "object") {
      // Caller may pass { canvas, origin, slotIndex, attachmentName }
      if (opts.canvas) loadFromCanvas(opts.canvas, opts.origin || "attachment", opts.slotIndex, opts.attachmentName);
    }
    refreshUI();
  }

  function deactivate() {
    const ie = ensureState();
    ie.active = false;
    // Keep canvas references so coming back resumes the session. Caller
    // can call resetToSource() if a clean slate is wanted.
  }

  function isActive() {
    return !!(state.imageEditor && state.imageEditor.active);
  }

  function loadFromCanvas(canvas, origin, slotIndex, attachmentName) {
    if (!canvas) return false;
    const ie = ensureState();
    const fresh = cloneCanvas(canvas);
    ie.source.canvas = fresh;
    ie.source.width = fresh.width;
    ie.source.height = fresh.height;
    ie.source.origin = String(origin || "drop");
    ie.source.slotIndex = Number.isFinite(slotIndex) ? Number(slotIndex) : -1;
    ie.source.attachmentName = attachmentName ? String(attachmentName) : "";
    ie.workCanvas = cloneCanvas(fresh);
    ie.history = [{
      op: "source",
      canvas: cloneCanvas(fresh),
      thumbnail: makeThumbnail(fresh),
      params: null,
    }];
    ie.historyIndex = 0;
    ie.cropRect = null;
    ie.cropDrag = null;
    ie.tool = "select";
    fitViewToCanvas();
    refreshUI();
    return true;
  }

  async function loadFromBlob(blob, origin) {
    if (!blob || typeof blob !== "object") return false;
    let bmp = null;
    try {
      bmp = await createImageBitmap(blob);
    } catch (e) {
      if (typeof setStatus === "function") setStatus(`Image load failed: ${e.message}`);
      return false;
    }
    const c = makeCanvas(bmp.width, bmp.height);
    const ctx = c.getContext("2d");
    if (ctx) ctx.drawImage(bmp, 0, 0);
    if (typeof bmp.close === "function") bmp.close();
    return loadFromCanvas(c, origin || "drop", -1, "");
  }

  function getWorkCanvas() {
    const ie = ensureState();
    return ie.workCanvas;
  }

  function replaceWorkCanvas(newCanvas, op, params) {
    if (!newCanvas) return;
    const ie = ensureState();
    // Truncate any redo-future when a new branch is created
    if (ie.historyIndex < ie.history.length - 1) {
      ie.history = ie.history.slice(0, ie.historyIndex + 1);
    }
    ie.workCanvas = newCanvas;
    ie.cropRect = null;
    ie.cropDrag = null;
    ie.history.push({
      op: String(op || "edit"),
      canvas: cloneCanvas(newCanvas),
      thumbnail: makeThumbnail(newCanvas),
      params: params || null,
    });
    if (ie.history.length > HISTORY_LIMIT) {
      // Drop the oldest non-source entry; keep the source entry at index 0.
      ie.history.splice(1, 1);
    } else {
      ie.historyIndex = ie.history.length - 1;
    }
    refreshUI();
  }

  function canUndo() {
    const ie = ensureState();
    return ie.historyIndex > 0;
  }

  function canRedo() {
    const ie = ensureState();
    return ie.historyIndex < ie.history.length - 1;
  }

  function undo() {
    if (!canUndo()) return false;
    const ie = ensureState();
    ie.historyIndex -= 1;
    ie.workCanvas = cloneCanvas(ie.history[ie.historyIndex].canvas);
    refreshUI();
    return true;
  }

  function redo() {
    if (!canRedo()) return false;
    const ie = ensureState();
    ie.historyIndex += 1;
    ie.workCanvas = cloneCanvas(ie.history[ie.historyIndex].canvas);
    refreshUI();
    return true;
  }

  function resetToSource() {
    const ie = ensureState();
    if (!ie.source.canvas) return false;
    ie.workCanvas = cloneCanvas(ie.source.canvas);
    ie.history = [{
      op: "source",
      canvas: cloneCanvas(ie.source.canvas),
      thumbnail: makeThumbnail(ie.source.canvas),
      params: null,
    }];
    ie.historyIndex = 0;
    ie.cropRect = null;
    ie.cropDrag = null;
    ie.tool = "select";
    refreshUI();
    return true;
  }

  // -- View ------------------------------------------------------------------
  function fitViewToCanvas() {
    const ie = ensureState();
    if (!ie.workCanvas || !els.imageCanvas) return;
    const host = els.imageCanvas.parentElement;
    if (!host) return;
    const hw = host.clientWidth || 800;
    const hh = host.clientHeight || 600;
    const cw = ie.workCanvas.width;
    const ch = ie.workCanvas.height;
    const margin = 0.9;
    const sx = (hw / cw) * margin;
    const sy = (hh / ch) * margin;
    ie.view.scale = Math.max(0.05, Math.min(8, Math.min(sx, sy)));
    ie.view.cx = cw / 2;
    ie.view.cy = ch / 2;
  }

  function setZoom100() {
    const ie = ensureState();
    if (!ie.workCanvas) return false;
    ie.view.scale = 1;
    ie.view.cx = ie.workCanvas.width / 2;
    ie.view.cy = ie.workCanvas.height / 2;
    refreshUI();
    return true;
  }

  function canvasPointFromEvent(ev) {
    const cv = els.imageCanvas;
    const r = cv.getBoundingClientRect();
    return { x: ev.clientX - r.left, y: ev.clientY - r.top };
  }

  function canvasToImage(x, y) {
    const ie = ensureState();
    const cv = els.imageCanvas;
    const s = ie.view.scale || 1;
    return {
      x: ie.view.cx + (x - cv.width / 2) / s,
      y: ie.view.cy + (y - cv.height / 2) / s,
    };
  }

  function imageToCanvas(x, y) {
    const ie = ensureState();
    const cv = els.imageCanvas;
    const s = ie.view.scale || 1;
    return {
      x: cv.width / 2 + (x - ie.view.cx) * s,
      y: cv.height / 2 + (y - ie.view.cy) * s,
    };
  }

  function clampImagePoint(pt) {
    const ie = ensureState();
    if (!ie.workCanvas) return { x: 0, y: 0 };
    return {
      x: Math.max(0, Math.min(ie.workCanvas.width, pt.x)),
      y: Math.max(0, Math.min(ie.workCanvas.height, pt.y)),
    };
  }

  function normalizeCropRect(a, b) {
    const p0 = clampImagePoint(a);
    const p1 = clampImagePoint(b);
    const x = Math.min(p0.x, p1.x);
    const y = Math.min(p0.y, p1.y);
    const w = Math.abs(p1.x - p0.x);
    const h = Math.abs(p1.y - p0.y);
    return { x, y, w, h };
  }

  function zoomAtCanvasPoint(x, y, factor) {
    const ie = ensureState();
    if (!ie.workCanvas) return false;
    const before = canvasToImage(x, y);
    const nextScale = Math.max(0.05, Math.min(16, ie.view.scale * Number(factor || 1)));
    ie.view.scale = nextScale;
    ie.view.cx = before.x - (x - els.imageCanvas.width / 2) / nextScale;
    ie.view.cy = before.y - (y - els.imageCanvas.height / 2) / nextScale;
    refreshUI();
    return true;
  }

  function panByScreenDelta(dx, dy) {
    const ie = ensureState();
    if (!ie.workCanvas) return false;
    const s = ie.view.scale || 1;
    ie.view.cx -= dx / s;
    ie.view.cy -= dy / s;
    refreshUI();
    return true;
  }

  function setTool(tool) {
    const ie = ensureState();
    ie.tool = tool === "crop" ? "crop" : "select";
    if (ie.tool !== "crop") {
      ie.cropRect = null;
      ie.cropDrag = null;
    }
    refreshUI();
  }

  function applyCrop() {
    const ie = ensureState();
    if (!ie.workCanvas || !ie.cropRect || !window.ImageOps) return false;
    const r = {
      x: Math.floor(ie.cropRect.x),
      y: Math.floor(ie.cropRect.y),
      w: Math.max(1, Math.round(ie.cropRect.w)),
      h: Math.max(1, Math.round(ie.cropRect.h)),
    };
    if (r.w < 1 || r.h < 1) return false;
    replaceWorkCanvas(window.ImageOps.crop(ie.workCanvas, r), "crop", r);
    ie.tool = "select";
    fitViewToCanvas();
    refreshUI();
    return true;
  }

  function cancelCrop() {
    const ie = ensureState();
    ie.cropRect = null;
    ie.cropDrag = null;
    ie.tool = "select";
    refreshUI();
  }

  // -- Render ----------------------------------------------------------------
  // Draws the workCanvas onto #imageCanvas with current view transform.
  // Called whenever state changes; cheap because it's a single drawImage.
  function renderImageCanvas() {
    const ie = ensureState();
    const cv = els.imageCanvas;
    if (!cv) return;
    const host = cv.parentElement;
    if (host) {
      const dw = host.clientWidth | 0;
      const dh = host.clientHeight | 0;
      if (cv.width !== dw) cv.width = dw;
      if (cv.height !== dh) cv.height = dh;
    }
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.save();
    // Checkerboard so users see transparency
    drawCheckerboard(ctx, cv.width, cv.height);
    if (ie.workCanvas) {
      const s = ie.view.scale;
      const w = ie.workCanvas.width * s;
      const h = ie.workCanvas.height * s;
      const origin = imageToCanvas(0, 0);
      const x = origin.x;
      const y = origin.y;
      ctx.imageSmoothingEnabled = s < 1;
      ctx.drawImage(ie.workCanvas, x, y, w, h);
      drawCropOverlay(ctx);
    }
    ctx.restore();
  }

  function drawCropOverlay(ctx) {
    const ie = ensureState();
    if (!ie.cropRect || ie.cropRect.w < 1 || ie.cropRect.h < 1) return;
    const a = imageToCanvas(ie.cropRect.x, ie.cropRect.y);
    const b = imageToCanvas(ie.cropRect.x + ie.cropRect.w, ie.cropRect.y + ie.cropRect.h);
    const x = Math.min(a.x, b.x);
    const y = Math.min(a.y, b.y);
    const w = Math.abs(b.x - a.x);
    const h = Math.abs(b.y - a.y);
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.fillRect(0, 0, els.imageCanvas.width, y);
    ctx.fillRect(0, y + h, els.imageCanvas.width, els.imageCanvas.height - (y + h));
    ctx.fillRect(0, y, x, h);
    ctx.fillRect(x + w, y, els.imageCanvas.width - (x + w), h);
    ctx.strokeStyle = "#f7d85b";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 5]);
    ctx.strokeRect(x + 0.5, y + 0.5, w, h);
    ctx.setLineDash([]);
    ctx.fillStyle = "#f7d85b";
    const size = 6;
    [[x, y], [x + w, y], [x, y + h], [x + w, y + h]].forEach((p) => {
      ctx.fillRect(p[0] - size / 2, p[1] - size / 2, size, size);
    });
    ctx.restore();
  }

  function drawCheckerboard(ctx, w, h) {
    const sz = 12;
    ctx.fillStyle = "#1a1f24";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#252b30";
    for (let y = 0; y < h; y += sz) {
      for (let x = (y / sz) % 2 === 0 ? 0 : sz; x < w; x += sz * 2) {
        ctx.fillRect(x, y, sz, sz);
      }
    }
  }

  // -- UI sync ---------------------------------------------------------------
  function refreshUI() {
    renderImageCanvas();
    refreshDropZone();
    refreshHistoryList();
    refreshControls();
  }

  function refreshDropZone() {
    if (!els.imageDropZone) return;
    const ie = ensureState();
    const showDrop = ie.active && !ie.workCanvas;
    els.imageDropZone.style.display = showDrop ? "" : "none";
  }

  function refreshHistoryList() {
    if (!els.imageHistoryList) return;
    const ie = ensureState();
    if (!ie.history.length) {
      els.imageHistoryList.innerHTML = '<div class="img-history-empty">No edits yet.</div>';
      return;
    }
    els.imageHistoryList.innerHTML = ie.history.map((h, i) => {
      const cur = i === ie.historyIndex ? " img-history-current" : "";
      const op = h.op === "source" ? "Source" : h.op;
      return `<div class="img-history-row${cur}" data-history-index="${i}">${i + 1}. ${op}</div>`;
    }).join("");
  }

  function refreshControls() {
    const ie = ensureState();
    const has = !!ie.workCanvas;
    const hasAttachmentSource = has && ie.source.origin === "attachment";
    if (els.imageUndoBtn) els.imageUndoBtn.disabled = !canUndo();
    if (els.imageRedoBtn) els.imageRedoBtn.disabled = !canRedo();
    if (els.imageDownloadBtn) els.imageDownloadBtn.disabled = !has;
    if (els.imageRemoveBgBtn) els.imageRemoveBgBtn.disabled = !has;
    // Apply only makes sense when this image came from a mesh attachment.
    if (els.imageApplyBtn) els.imageApplyBtn.style.display = hasAttachmentSource ? "" : "none";
    // "Send to New Slot" only makes sense when there's a project (state.mesh)
    // and the image isn't already an attachment we could just apply to.
    const canSendToNewSlot = has && !!state.mesh && !hasAttachmentSource;
    if (els.imageSendNewSlotBtn) els.imageSendNewSlotBtn.style.display = canSendToNewSlot ? "" : "none";
    // Hint text: explain why Apply / New Slot may be hidden
    if (els.imageOutputHint) {
      if (hasAttachmentSource) {
        els.imageOutputHint.textContent = "Apply writes the edits back to the source attachment.";
      } else if (canSendToNewSlot) {
        els.imageOutputHint.textContent = "Send creates a new slot in the current project.";
      } else if (has) {
        els.imageOutputHint.textContent = "Standalone mode — download the result, or import a project first to send back.";
      } else {
        els.imageOutputHint.textContent = "";
      }
    }
    if (els.imageResetBtn) els.imageResetBtn.disabled = !has || ie.history.length <= 1;
    if (els.imageCropToolBtn) els.imageCropToolBtn.classList.toggle("active", ie.tool === "crop");
    if (els.imageCropApplyBtn) els.imageCropApplyBtn.disabled = !has || !ie.cropRect || ie.cropRect.w < 1 || ie.cropRect.h < 1;
    if (els.imageCropCancelBtn) els.imageCropCancelBtn.disabled = !has || ie.tool !== "crop";
    if (els.imageFitBtn) els.imageFitBtn.disabled = !has;
    if (els.imageZoom100Btn) els.imageZoom100Btn.disabled = !has;
    if (els.imageScaleWidth && has && document.activeElement !== els.imageScaleWidth) {
      els.imageScaleWidth.value = String(ie.workCanvas.width);
    }
    if (els.imageScaleHeight && has && document.activeElement !== els.imageScaleHeight) {
      els.imageScaleHeight.value = String(ie.workCanvas.height);
    }
    if (els.imageScaleApplyBtn) els.imageScaleApplyBtn.disabled = !has;
    if (els.imageInfoLabel) {
      if (!has) els.imageInfoLabel.textContent = "No image loaded";
      else els.imageInfoLabel.textContent = `${ie.workCanvas.width} × ${ie.workCanvas.height}px · ${ie.source.origin || "unknown"}`;
    }
  }

  function wireCanvasInteractions() {
    const cv = els.imageCanvas;
    if (!cv || cv.__imageWorkspaceWired) return;
    cv.__imageWorkspaceWired = true;
    let panDrag = null;

    cv.addEventListener("wheel", (ev) => {
      const ie = ensureState();
      if (!ie.active || !ie.workCanvas) return;
      ev.preventDefault();
      const pt = canvasPointFromEvent(ev);
      zoomAtCanvasPoint(pt.x, pt.y, ev.deltaY < 0 ? 1.12 : 1 / 1.12);
    }, { passive: false });

    cv.addEventListener("mousedown", (ev) => {
      const ie = ensureState();
      if (!ie.active || !ie.workCanvas) return;
      const pt = canvasPointFromEvent(ev);
      if (ev.button === 1) {
        ev.preventDefault();
        panDrag = { x: ev.clientX, y: ev.clientY };
        return;
      }
      if (ev.button === 0 && ie.tool === "crop") {
        ev.preventDefault();
        const img = clampImagePoint(canvasToImage(pt.x, pt.y));
        ie.cropDrag = { start: img };
        ie.cropRect = { x: img.x, y: img.y, w: 0, h: 0 };
        refreshUI();
      }
    });

    window.addEventListener("mousemove", (ev) => {
      const ie = ensureState();
      if (panDrag) {
        const dx = ev.clientX - panDrag.x;
        const dy = ev.clientY - panDrag.y;
        panDrag = { x: ev.clientX, y: ev.clientY };
        panByScreenDelta(dx, dy);
        return;
      }
      if (ie.cropDrag) {
        const pt = canvasPointFromEvent(ev);
        ie.cropRect = normalizeCropRect(ie.cropDrag.start, canvasToImage(pt.x, pt.y));
        refreshUI();
      }
    });

    window.addEventListener("mouseup", () => {
      const ie = ensureState();
      panDrag = null;
      if (ie.cropDrag) {
        ie.cropDrag = null;
        refreshUI();
      }
    });
  }

  function buildImageCaptureSnapshot() {
    const ie = ensureState();
    const work = ie.workCanvas;
    const source = ie.source || {};
    return {
      active: !!ie.active,
      hasWorkCanvas: !!work,
      workSize: work ? { width: work.width, height: work.height } : null,
      source: {
        origin: source.origin || "",
        width: Number(source.width) || 0,
        height: Number(source.height) || 0,
        slotIndex: Number.isFinite(source.slotIndex) ? source.slotIndex : -1,
        attachmentName: source.attachmentName || "",
      },
      history: {
        length: Array.isArray(ie.history) ? ie.history.length : 0,
        index: Number.isFinite(ie.historyIndex) ? ie.historyIndex : -1,
        ops: Array.isArray(ie.history) ? ie.history.map((h) => h && h.op || "") : [],
      },
      view: {
        scale: Number(ie.view && ie.view.scale) || 0,
        cx: Number(ie.view && ie.view.cx) || 0,
        cy: Number(ie.view && ie.view.cy) || 0,
      },
      tool: ie.tool || "select",
      cropRect: ie.cropRect ? {
        x: Number(ie.cropRect.x) || 0,
        y: Number(ie.cropRect.y) || 0,
        w: Number(ie.cropRect.w) || 0,
        h: Number(ie.cropRect.h) || 0,
      } : null,
      bgRemoval: {
        modelLoaded: !!(ie.bgRemoval && ie.bgRemoval.modelLoaded),
        modelLoading: !!(ie.bgRemoval && ie.bgRemoval.modelLoading),
        threshold: Number(ie.bgRemoval && ie.bgRemoval.threshold) || 0,
        feather: Number(ie.bgRemoval && ie.bgRemoval.feather) || 0,
      },
    };
  }

  function buildImageCaptureDiffs(before, after) {
    const b = before || {};
    const a = after || buildImageCaptureSnapshot();
    const diffs = [];
    function add(id, from, to) {
      if (JSON.stringify(from) !== JSON.stringify(to)) diffs.push({ id, before: from, after: to });
    }
    add("image.active", b.active, a.active);
    add("image.work_size", b.workSize, a.workSize);
    add("image.source", b.source, a.source);
    add("image.history_index", b.history && b.history.index, a.history && a.history.index);
    add("image.history_ops", b.history && b.history.ops, a.history && a.history.ops);
    add("image.tool", b.tool, a.tool);
    add("image.crop_rect", b.cropRect, a.cropRect);
    add("image.bg_removal", b.bgRemoval, a.bgRemoval);
    return diffs;
  }

  function runImageCaptureInvariants(snapshot) {
    const snap = snapshot || buildImageCaptureSnapshot();
    const issues = [];
    const hist = snap.history || {};
    const work = snap.workSize;
    if (snap.hasWorkCanvas && (!work || work.width < 1 || work.height < 1)) {
      issues.push({ id: "image.work_canvas_has_positive_size", severity: "error", message: "Work canvas has no positive dimensions." });
    }
    if (hist.length > 0 && (hist.index < 0 || hist.index >= hist.length)) {
      issues.push({ id: "image.history_index_in_range", severity: "error", message: "History index is outside the history array." });
    }
    if (snap.source && snap.source.origin === "attachment") {
      if (snap.source.slotIndex < 0 || !snap.source.attachmentName) {
        issues.push({ id: "image.attachment_source_identified", severity: "error", message: "Attachment source is missing slot index or attachment name." });
      }
    }
    if (snap.cropRect && (snap.cropRect.w < 0 || snap.cropRect.h < 0)) {
      issues.push({ id: "image.crop_rect_nonnegative", severity: "error", message: "Crop rectangle has negative dimensions." });
    }
    return issues;
  }

  function buildImageCaptureSuspicions(context) {
    const snap = context && context.snapshot ? context.snapshot : buildImageCaptureSnapshot();
    const out = [];
    if (snap.active && !snap.hasWorkCanvas) {
      out.push({ id: "image.active_without_canvas", severity: "info", message: "Image workspace is active with no loaded image." });
    }
    if (snap.hasWorkCanvas && snap.history && snap.history.length === 0) {
      out.push({ id: "image.canvas_without_history", severity: "warning", message: "Work canvas exists but history is empty." });
    }
    return out;
  }

  if (typeof registerAICaptureDomain === "function") {
    registerAICaptureDomain("image", {
      label: "Image Workspace",
      snapshot: buildImageCaptureSnapshot,
      diff: buildImageCaptureDiffs,
      invariants: runImageCaptureInvariants,
      suspicions: buildImageCaptureSuspicions,
      commands: [
        "image.load",
        "image.crop",
        "image.rotate",
        "image.flip",
        "image.scale",
        "image.trim_transparency",
        "image.remove_background",
        "image.apply_to_attachment",
        "image.send_to_new_slot",
        "image.edit_attachment",
        "ai.image_load",
        "ai.image_crop",
        "ai.image_rotate",
        "ai.image_flip",
        "ai.image_scale",
        "ai.image_remove_bg",
        "ai.image_apply_to_attachment",
        "ai.image_export_png",
      ],
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wireCanvasInteractions);
  } else {
    setTimeout(wireCanvasInteractions, 0);
  }

  window.ImageWorkspace = {
    __installed: true,
    version: 1,
    activate,
    deactivate,
    isActive,
    loadFromCanvas,
    loadFromBlob,
    getWorkCanvas,
    replaceWorkCanvas,
    canUndo,
    canRedo,
    undo,
    redo,
    resetToSource,
    setTool,
    applyCrop,
    cancelCrop,
    setZoom100,
    zoomAtCanvasPoint,
    panByScreenDelta,
    refreshUI,
    fitView: fitViewToCanvas,
    canvasToImage,
    imageToCanvas,
    _makeCanvas: makeCanvas,
    _cloneCanvas: cloneCanvas,
  };
})();
