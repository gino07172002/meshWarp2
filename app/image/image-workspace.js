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
      const x = (cv.width - w) / 2;
      const y = (cv.height - h) / 2;
      ctx.imageSmoothingEnabled = s < 1;
      ctx.drawImage(ie.workCanvas, x, y, w, h);
    }
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
    if (els.imageInfoLabel) {
      if (!has) els.imageInfoLabel.textContent = "No image loaded";
      else els.imageInfoLabel.textContent = `${ie.workCanvas.width} × ${ie.workCanvas.height}px · ${ie.source.origin || "unknown"}`;
    }
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
    refreshUI,
    fitView: fitViewToCanvas,
    _makeCanvas: makeCanvas,
    _cloneCanvas: cloneCanvas,
  };
})();
