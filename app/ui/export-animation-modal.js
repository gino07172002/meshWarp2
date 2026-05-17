// ROLE: Export Animation modal — wires up #exportAnimModal* DOM elements,
// captures frames from glCanvas, encodes to GIF / WebM / PNG sequence / animated WebP.
// EXPORTS:
//   - openExportAnimationModal, closeExportAnimationModal, runExportAnimation
// CONSUMERS: timeline toolbar export button, export dock button.
// DEPENDS: export-animation-encoders.js (global pure functions), animation-panels.js
//   helpers (waitForFrame, sleepMs are already global).

const EXPORT_ANIM_DEFAULT_FPS = 30;
const EXPORT_ANIM_DEFAULT_PREFIX = "export";
const EXPORT_ANIM_SCALE_PRESETS = [0.25, 0.5, 1, 2];

let exportAnimRunning = false;
let exportAnimCancelRequested = false;

function ensureExportAnimState() {
  if (!state.anim) return;
  if (!state.anim.exportModal || typeof state.anim.exportModal !== "object") {
    state.anim.exportModal = {
      format: "gif",
      fps: EXPORT_ANIM_DEFAULT_FPS,
      scale: 1,
      width: 0,
      height: 0,
      lockAspect: true,
      bgTransparent: true,
      bgColor: "#000000",
      loopCount: 0,
      prefix: EXPORT_ANIM_DEFAULT_PREFIX,
      zipPng: true,
      animIds: [],
    };
  }
}

function getExportAnimSelectedFormat() {
  if (els.exportAnimFormatGif && els.exportAnimFormatGif.checked) return "gif";
  if (els.exportAnimFormatWebm && els.exportAnimFormatWebm.checked) return "webm";
  if (els.exportAnimFormatPngseq && els.exportAnimFormatPngseq.checked) return "pngseq";
  if (els.exportAnimFormatWebp && els.exportAnimFormatWebp.checked) return "webp";
  return "gif";
}

function setExportAnimSelectedFormat(format) {
  if (els.exportAnimFormatGif) els.exportAnimFormatGif.checked = format === "gif";
  if (els.exportAnimFormatWebm) els.exportAnimFormatWebm.checked = format === "webm";
  if (els.exportAnimFormatPngseq) els.exportAnimFormatPngseq.checked = format === "pngseq";
  if (els.exportAnimFormatWebp) els.exportAnimFormatWebp.checked = format === "webp";
  if (els.exportAnimZipPng) {
    els.exportAnimZipPng.parentElement && (els.exportAnimZipPng.parentElement.style.display = format === "pngseq" ? "" : "none");
  }
}

function getExportAnimBaseDimensions() {
  const gl = els.glCanvas;
  const w = Math.max(1, Number(gl && gl.width) || 512);
  const h = Math.max(1, Number(gl && gl.height) || 512);
  return { w, h };
}

function syncExportAnimDimensionInputs() {
  if (!els.exportAnimScalePreset || !els.exportAnimWidth || !els.exportAnimHeight) return;
  const preset = els.exportAnimScalePreset.value;
  const base = getExportAnimBaseDimensions();
  if (preset === "custom") {
    els.exportAnimWidth.disabled = false;
    els.exportAnimHeight.disabled = false;
    return;
  }
  const scale = Number(preset) || 1;
  els.exportAnimWidth.value = String(Math.max(1, Math.round(base.w * scale)));
  els.exportAnimHeight.value = String(Math.max(1, Math.round(base.h * scale)));
  els.exportAnimWidth.disabled = true;
  els.exportAnimHeight.disabled = true;
}

function refreshExportAnimAnimationList() {
  if (!els.exportAnimList) return;
  const list = els.exportAnimList;
  const prev = new Set(Array.from(list.selectedOptions || []).map((o) => String(o.value)));
  list.innerHTML = "";
  const anims = (state.anim && state.anim.animations) || [];
  const currentId = state.anim && state.anim.currentAnimId;
  for (const a of anims) {
    const opt = document.createElement("option");
    opt.value = String(a.id);
    opt.textContent = `${a.name || a.id}  (${(Number(a.duration) || 0).toFixed(2)}s)`;
    if (prev.size > 0) opt.selected = prev.has(String(a.id));
    else opt.selected = String(a.id) === String(currentId);
    list.appendChild(opt);
  }
}

function openExportAnimationModal() {
  ensureExportAnimState();
  if (!els.exportAnimModalWrap) return;
  const cfg = state.anim.exportModal;
  setExportAnimSelectedFormat(cfg.format || "gif");
  if (els.exportAnimFps) els.exportAnimFps.value = String(cfg.fps || EXPORT_ANIM_DEFAULT_FPS);
  if (els.exportAnimScalePreset) els.exportAnimScalePreset.value = String(cfg.scale || 1);
  syncExportAnimDimensionInputs();
  if (cfg.scale === "custom" && els.exportAnimWidth && els.exportAnimHeight) {
    const base = getExportAnimBaseDimensions();
    els.exportAnimWidth.value = String(Math.max(1, Math.round(Number(cfg.width) || base.w)));
    els.exportAnimHeight.value = String(Math.max(1, Math.round(Number(cfg.height) || base.h)));
  }
  if (els.exportAnimLockAspect) els.exportAnimLockAspect.checked = cfg.lockAspect !== false;
  if (els.exportAnimBgTransparent) els.exportAnimBgTransparent.checked = cfg.bgTransparent !== false;
  if (els.exportAnimBgSolid) els.exportAnimBgSolid.checked = cfg.bgTransparent === false;
  if (els.exportAnimBgColor) els.exportAnimBgColor.value = cfg.bgColor || "#000000";
  if (els.exportAnimLoopCount) els.exportAnimLoopCount.value = String(cfg.loopCount || 0);
  if (els.exportAnimPrefix) els.exportAnimPrefix.value = String(cfg.prefix || EXPORT_ANIM_DEFAULT_PREFIX);
  if (els.exportAnimZipPng) els.exportAnimZipPng.checked = cfg.zipPng !== false;
  refreshExportAnimAnimationList();
  if (els.exportAnimStatus) els.exportAnimStatus.textContent = "";
  els.exportAnimModalWrap.classList.remove("collapsed");
  els.exportAnimModalWrap.setAttribute("aria-hidden", "false");
}

function closeExportAnimationModal() {
  if (exportAnimRunning) return;
  if (!els.exportAnimModalWrap) return;
  els.exportAnimModalWrap.classList.add("collapsed");
  els.exportAnimModalWrap.setAttribute("aria-hidden", "true");
}

function setExportAnimUiLocked(locked) {
  const inputs = [
    els.exportAnimFps, els.exportAnimScalePreset, els.exportAnimWidth, els.exportAnimHeight,
    els.exportAnimLockAspect, els.exportAnimBgTransparent, els.exportAnimBgSolid, els.exportAnimBgColor,
    els.exportAnimLoopCount, els.exportAnimPrefix, els.exportAnimZipPng, els.exportAnimList,
    els.exportAnimFormatGif, els.exportAnimFormatWebm, els.exportAnimFormatPngseq, els.exportAnimFormatWebp,
    els.exportAnimSelectAllBtn, els.exportAnimSelectNoneBtn, els.exportAnimCloseBtn,
  ];
  for (const el of inputs) {
    if (el) el.disabled = !!locked;
  }
  if (els.exportAnimRunBtn) els.exportAnimRunBtn.disabled = !!locked;
  if (els.exportAnimCancelBtn) {
    els.exportAnimCancelBtn.disabled = false;
    els.exportAnimCancelBtn.textContent = locked ? "Stop" : "Cancel";
  }
}

function setExportAnimStatus(text) {
  if (els.exportAnimStatus) els.exportAnimStatus.textContent = String(text || "");
}

function collectExportAnimOptions() {
  ensureExportAnimState();
  const cfg = state.anim.exportModal;
  cfg.format = getExportAnimSelectedFormat();
  cfg.fps = Math.max(1, Math.min(60, Math.round(Number(els.exportAnimFps && els.exportAnimFps.value) || EXPORT_ANIM_DEFAULT_FPS)));
  const presetVal = els.exportAnimScalePreset && els.exportAnimScalePreset.value;
  cfg.scale = presetVal === "custom" ? "custom" : (Number(presetVal) || 1);
  cfg.width = Math.max(1, Math.min(4096, Math.round(Number(els.exportAnimWidth && els.exportAnimWidth.value) || 0)));
  cfg.height = Math.max(1, Math.min(4096, Math.round(Number(els.exportAnimHeight && els.exportAnimHeight.value) || 0)));
  cfg.lockAspect = !!(els.exportAnimLockAspect && els.exportAnimLockAspect.checked);
  cfg.bgTransparent = !!(els.exportAnimBgTransparent && els.exportAnimBgTransparent.checked);
  cfg.bgColor = String((els.exportAnimBgColor && els.exportAnimBgColor.value) || "#000000");
  cfg.loopCount = Math.max(0, Math.min(0xffff, Math.round(Number(els.exportAnimLoopCount && els.exportAnimLoopCount.value) || 0)));
  cfg.prefix = sanitizeExportName(els.exportAnimPrefix && els.exportAnimPrefix.value, EXPORT_ANIM_DEFAULT_PREFIX);
  cfg.zipPng = !!(els.exportAnimZipPng && els.exportAnimZipPng.checked);
  cfg.animIds = els.exportAnimList
    ? Array.from(els.exportAnimList.selectedOptions || []).map((o) => String(o.value))
    : [];
  return cfg;
}

function getExportAnimDuration(anim) {
  const range = (typeof getPlaybackRangeForCurrentState === "function" && anim)
    ? getPlaybackRangeForCurrentState(anim)
    : null;
  if (range && Number.isFinite(range.end - range.start) && range.end > range.start) {
    return { start: Number(range.start) || 0, end: Number(range.end) || 0 };
  }
  const dur = Math.max(0.1, Number(anim && anim.duration) || 1);
  return { start: 0, end: dur };
}

function drawFrameToScaledCanvas(targetCanvas, targetCtx, srcCanvas, opts) {
  const tw = targetCanvas.width;
  const th = targetCanvas.height;
  if (opts.bgTransparent) {
    targetCtx.clearRect(0, 0, tw, th);
  } else {
    targetCtx.fillStyle = opts.bgColor || "#000000";
    targetCtx.fillRect(0, 0, tw, th);
  }
  const sw = srcCanvas.width;
  const sh = srcCanvas.height;
  const sr = sw / sh;
  const tr = tw / th;
  let dx, dy, dw, dh;
  if (sr > tr) {
    dw = tw;
    dh = Math.round(tw / sr);
    dx = 0;
    dy = Math.round((th - dh) / 2);
  } else {
    dh = th;
    dw = Math.round(th * sr);
    dy = 0;
    dx = Math.round((tw - dw) / 2);
  }
  if (!opts.bgTransparent) {
    // Opaque export: GL canvas readback may carry premultiplied alpha.
    // Composite the source onto an opaque scratch first so the final
    // RGBA is fully opaque with correct colors, then draw scratch onto
    // the target so the background-fill stays intact.
    const scratch = makeCanvas(dw, dh);
    const sctx = scratch.getContext("2d");
    sctx.fillStyle = opts.bgColor || "#000000";
    sctx.fillRect(0, 0, dw, dh);
    sctx.drawImage(srcCanvas, 0, 0, sw, sh, 0, 0, dw, dh);
    // Force alpha=255 in case the GL readback left it < 255.
    const img = sctx.getImageData(0, 0, dw, dh);
    const d = img.data;
    for (let i = 3; i < d.length; i += 4) d[i] = 255;
    sctx.putImageData(img, 0, 0);
    targetCtx.drawImage(scratch, dx, dy);
  } else {
    targetCtx.drawImage(srcCanvas, 0, 0, sw, sh, dx, dy, dw, dh);
  }
}

async function captureScaledFramesAsImageData(anim, opts) {
  const range = getExportAnimDuration(anim);
  const dur = Math.max(0.001, range.end - range.start);
  const frameCount = Math.max(2, Math.round(dur * opts.fps));
  const W = opts.width;
  const H = opts.height;
  const work = makeCanvas(W, H);
  const ctx = work.getContext("2d");
  if (!ctx) throw new Error("2D context unavailable for export.");
  const frames = [];
  for (let i = 0; i < frameCount; i += 1) {
    if (exportAnimCancelRequested) break;
    const t = range.start + (i / Math.max(1, frameCount - 1)) * dur;
    setAnimTime(t);
    if (state.mesh) samplePoseAtTime(state.mesh, t);
    if (typeof requestRender === "function") requestRender("export-frame");
    await waitForFrame();
    await waitForFrame();
    drawFrameToScaledCanvas(work, ctx, els.glCanvas, opts);
    const imgData = ctx.getImageData(0, 0, W, H);
    frames.push({ data: imgData.data });
    setExportAnimStatus(`Frame ${i + 1}/${frameCount} (${anim.name})`);
    await sleepMs(0);
  }
  return { frames, frameCount, dur, work };
}

async function exportAnimAsGif(anim, opts, fileBase) {
  const { frames } = await captureScaledFramesAsImageData(anim, opts);
  if (exportAnimCancelRequested) return;
  setExportAnimStatus(`Encoding GIF (${anim.name})...`);
  const bytes = encodeGifFromImageDataFrames(frames, opts.width, opts.height, opts.fps, opts.loopCount, {
    transparent: !!opts.bgTransparent,
  });
  const blob = new Blob([bytes], { type: "image/gif" });
  downloadBlobFile(blob, `${fileBase}.gif`);
}

async function exportAnimAsPngSeq(anim, opts, fileBase) {
  const range = getExportAnimDuration(anim);
  const dur = Math.max(0.001, range.end - range.start);
  const frameCount = Math.max(2, Math.round(dur * opts.fps));
  const W = opts.width;
  const H = opts.height;
  const work = makeCanvas(W, H);
  const ctx = work.getContext("2d");
  if (!ctx) throw new Error("2D context unavailable for export.");
  const items = [];
  for (let i = 0; i < frameCount; i += 1) {
    if (exportAnimCancelRequested) return;
    const t = range.start + (i / Math.max(1, frameCount - 1)) * dur;
    setAnimTime(t);
    if (state.mesh) samplePoseAtTime(state.mesh, t);
    if (typeof requestRender === "function") requestRender("export-frame");
    await waitForFrame();
    await waitForFrame();
    drawFrameToScaledCanvas(work, ctx, els.glCanvas, opts);
    const blob = await canvasToBlob(work, "image/png");
    const name = `${fileBase}_${String(i + 1).padStart(4, "0")}.png`;
    if (opts.zipPng) {
      const ab = await blob.arrayBuffer();
      items.push({ name, data: new Uint8Array(ab) });
    } else {
      downloadBlobFile(blob, name);
    }
    setExportAnimStatus(`PNG ${i + 1}/${frameCount} (${anim.name})`);
    await sleepMs(0);
  }
  if (opts.zipPng && items.length > 0) {
    setExportAnimStatus(`Zipping ${items.length} PNGs (${anim.name})...`);
    const zipBytes = buildZipFromNamedParts(items);
    const zipBlob = new Blob([zipBytes], { type: "application/zip" });
    downloadBlobFile(zipBlob, `${fileBase}.zip`);
  }
}

async function exportAnimAsWebM(anim, opts, fileBase) {
  if (!window.MediaRecorder) throw new Error("MediaRecorder not supported in this browser.");
  const range = getExportAnimDuration(anim);
  const dur = Math.max(0.001, range.end - range.start);
  const frameCount = Math.max(2, Math.round(dur * opts.fps));
  const W = opts.width;
  const H = opts.height;
  const work = makeCanvas(W, H);
  const ctx = work.getContext("2d");
  if (!ctx) throw new Error("2D context unavailable for export.");
  if (typeof work.captureStream !== "function") {
    throw new Error("captureStream not supported on offscreen canvas.");
  }
  const stream = work.captureStream(opts.fps);
  const chunks = [];
  let mime = "video/webm;codecs=vp9";
  if (!MediaRecorder.isTypeSupported(mime)) mime = "video/webm;codecs=vp8";
  if (!MediaRecorder.isTypeSupported(mime)) mime = "video/webm";
  const rec = new MediaRecorder(stream, { mimeType: mime });
  rec.ondataavailable = (ev) => { if (ev.data && ev.data.size > 0) chunks.push(ev.data); };
  rec.start();
  const frameDelay = 1000 / opts.fps;
  const startTs = performance.now();
  for (let i = 0; i < frameCount; i += 1) {
    if (exportAnimCancelRequested) break;
    const t = range.start + (i / Math.max(1, frameCount - 1)) * dur;
    setAnimTime(t);
    if (state.mesh) samplePoseAtTime(state.mesh, t);
    if (typeof requestRender === "function") requestRender("export-frame");
    await waitForFrame();
    await waitForFrame();
    drawFrameToScaledCanvas(work, ctx, els.glCanvas, opts);
    setExportAnimStatus(`Recording ${i + 1}/${frameCount} (${anim.name})`);
    const targetTs = startTs + (i + 1) * frameDelay;
    const wait = targetTs - performance.now();
    if (wait > 0) await sleepMs(wait);
  }
  rec.stop();
  await new Promise((resolve) => { rec.onstop = resolve; });
  if (exportAnimCancelRequested) return;
  const blob = new Blob(chunks, { type: "video/webm" });
  downloadBlobFile(blob, `${fileBase}.webm`);
}

async function exportAnimAsWebP(anim, opts, fileBase) {
  const range = getExportAnimDuration(anim);
  const dur = Math.max(0.001, range.end - range.start);
  const frameCount = Math.max(2, Math.round(dur * opts.fps));
  const W = opts.width;
  const H = opts.height;
  const work = makeCanvas(W, H);
  const ctx = work.getContext("2d");
  if (!ctx) throw new Error("2D context unavailable for export.");
  const stills = [];
  for (let i = 0; i < frameCount; i += 1) {
    if (exportAnimCancelRequested) return;
    const t = range.start + (i / Math.max(1, frameCount - 1)) * dur;
    setAnimTime(t);
    if (state.mesh) samplePoseAtTime(state.mesh, t);
    if (typeof requestRender === "function") requestRender("export-frame");
    await waitForFrame();
    await waitForFrame();
    drawFrameToScaledCanvas(work, ctx, els.glCanvas, opts);
    const blob = await new Promise((resolve, reject) => {
      work.toBlob((b) => b ? resolve(b) : reject(new Error("WebP encoding not supported in this browser.")), "image/webp", 0.9);
    });
    const ab = await blob.arrayBuffer();
    stills.push(new Uint8Array(ab));
    setExportAnimStatus(`WebP frame ${i + 1}/${frameCount} (${anim.name})`);
    await sleepMs(0);
  }
  if (exportAnimCancelRequested) return;
  setExportAnimStatus(`Assembling animated WebP (${anim.name})...`);
  const bytes = encodeAnimatedWebPFromStillBlobs(stills, W, H, opts.fps, opts.loopCount);
  const blob = new Blob([bytes], { type: "image/webp" });
  downloadBlobFile(blob, `${fileBase}.webp`);
}

async function runExportAnimation() {
  if (exportAnimRunning) return;
  const opts = collectExportAnimOptions();
  const anims = (state.anim.animations || []).filter((a) => opts.animIds.indexOf(String(a.id)) >= 0);
  if (anims.length === 0) {
    setExportAnimStatus("Select at least one animation.");
    return;
  }
  if (!state.mesh) {
    setExportAnimStatus("No rig loaded.");
    return;
  }
  exportAnimRunning = true;
  exportAnimCancelRequested = false;
  setExportAnimUiLocked(true);
  const prev = {
    animId: state.anim.currentAnimId,
    time: state.anim.time,
    playing: state.anim.playing,
    lastTs: state.anim.lastTs,
  };
  state.anim.playing = false;
  state.anim.lastTs = 0;

  let done = 0;
  let failed = 0;
  try {
    for (let i = 0; i < anims.length; i += 1) {
      if (exportAnimCancelRequested) break;
      const anim = anims[i];
      state.anim.currentAnimId = anim.id;
      refreshAnimationUI();
      setAnimTime(getExportAnimDuration(anim).start);
      if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time);
      await waitForFrame();
      const safeAnim = sanitizeExportName(anim.name || `anim_${i + 1}`, `anim_${i + 1}`);
      const fileBase = anims.length > 1
        ? `${opts.prefix}_${String(i + 1).padStart(2, "0")}_${safeAnim}`
        : `${opts.prefix}_${safeAnim}`;
      try {
        if (opts.format === "gif") await exportAnimAsGif(anim, opts, fileBase);
        else if (opts.format === "webm") await exportAnimAsWebM(anim, opts, fileBase);
        else if (opts.format === "pngseq") await exportAnimAsPngSeq(anim, opts, fileBase);
        else if (opts.format === "webp") await exportAnimAsWebP(anim, opts, fileBase);
        done += 1;
      } catch (err) {
        failed += 1;
        const msg = err && err.message ? err.message : "unknown error";
        setExportAnimStatus(`Failed (${anim.name}): ${msg}`);
        setStatus(`Export failed (${anim.name}): ${msg}`);
      }
    }
    const summary = exportAnimCancelRequested
      ? `Export stopped: ${done} ok, ${failed} failed.`
      : `Export complete: ${done} ok, ${failed} failed.`;
    setExportAnimStatus(summary);
    setStatus(summary);
  } finally {
    state.anim.currentAnimId = prev.animId;
    state.anim.playing = prev.playing;
    state.anim.lastTs = prev.lastTs;
    refreshAnimationUI();
    setAnimTime(prev.time);
    if (state.mesh) samplePoseAtTime(state.mesh, prev.time);
    exportAnimRunning = false;
    exportAnimCancelRequested = false;
    setExportAnimUiLocked(false);
  }
}

function wireExportAnimationModalEvents() {
  if (els.exportAnimModalBtn) {
    els.exportAnimModalBtn.addEventListener("click", openExportAnimationModal);
  }
  if (els.exportAnimDockBtn) {
    els.exportAnimDockBtn.addEventListener("click", openExportAnimationModal);
  }
  if (els.exportAnimCloseBtn) {
    els.exportAnimCloseBtn.addEventListener("click", closeExportAnimationModal);
  }
  if (els.exportAnimModalBackdrop) {
    els.exportAnimModalBackdrop.addEventListener("click", closeExportAnimationModal);
  }
  if (els.exportAnimCancelBtn) {
    els.exportAnimCancelBtn.addEventListener("click", () => {
      if (exportAnimRunning) {
        exportAnimCancelRequested = true;
        setExportAnimStatus("Cancelling...");
      } else {
        closeExportAnimationModal();
      }
    });
  }
  if (els.exportAnimRunBtn) {
    els.exportAnimRunBtn.addEventListener("click", () => { runExportAnimation(); });
  }
  if (els.exportAnimScalePreset) {
    els.exportAnimScalePreset.addEventListener("change", syncExportAnimDimensionInputs);
  }
  if (els.exportAnimWidth) {
    els.exportAnimWidth.addEventListener("input", () => {
      if (!els.exportAnimLockAspect || !els.exportAnimLockAspect.checked) return;
      if (els.exportAnimScalePreset && els.exportAnimScalePreset.value !== "custom") return;
      const base = getExportAnimBaseDimensions();
      const w = Math.max(1, Math.round(Number(els.exportAnimWidth.value) || base.w));
      const h = Math.max(1, Math.round((w / base.w) * base.h));
      if (els.exportAnimHeight) els.exportAnimHeight.value = String(h);
    });
  }
  if (els.exportAnimHeight) {
    els.exportAnimHeight.addEventListener("input", () => {
      if (!els.exportAnimLockAspect || !els.exportAnimLockAspect.checked) return;
      if (els.exportAnimScalePreset && els.exportAnimScalePreset.value !== "custom") return;
      const base = getExportAnimBaseDimensions();
      const h = Math.max(1, Math.round(Number(els.exportAnimHeight.value) || base.h));
      const w = Math.max(1, Math.round((h / base.h) * base.w));
      if (els.exportAnimWidth) els.exportAnimWidth.value = String(w);
    });
  }
  for (const radio of [els.exportAnimFormatGif, els.exportAnimFormatWebm, els.exportAnimFormatPngseq, els.exportAnimFormatWebp]) {
    if (radio) radio.addEventListener("change", () => setExportAnimSelectedFormat(getExportAnimSelectedFormat()));
  }
  if (els.exportAnimSelectAllBtn) {
    els.exportAnimSelectAllBtn.addEventListener("click", () => {
      if (!els.exportAnimList) return;
      for (const opt of els.exportAnimList.options) opt.selected = true;
    });
  }
  if (els.exportAnimSelectNoneBtn) {
    els.exportAnimSelectNoneBtn.addEventListener("click", () => {
      if (!els.exportAnimList) return;
      for (const opt of els.exportAnimList.options) opt.selected = false;
    });
  }
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && els.exportAnimModalWrap && !els.exportAnimModalWrap.classList.contains("collapsed")) {
      closeExportAnimationModal();
    }
  });
}

wireExportAnimationModalEvents();
