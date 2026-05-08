// ROLE: Image workspace background removal. Owns lazy MediaPipe Selfie
// Segmentation loading, mask-to-alpha composition, threshold and feather.
//
// Loaded before image-io.js.
//
// EXPORTS (under window.ImageBgRemoval):
//   configure(opts)             inject createSegmenter for custom/offline use
//   removeBackground(canvas, opts?) -> Promise<HTMLCanvasElement>
//   getStatus()                 compact loading/status flags

(function buildImageBgRemoval() {
  if (typeof window === "undefined") return;
  if (window.ImageBgRemoval && window.ImageBgRemoval.__installed) return;

  const CDN_BASE = "https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1";
  let createSegmenterOverride = null;
  let segmenterPromise = null;
  let scriptPromise = null;
  const status = { modelLoaded: false, modelLoading: false, lastError: "" };

  function configure(opts) {
    const o = opts || {};
    if (typeof o.createSegmenter === "function") {
      createSegmenterOverride = o.createSegmenter;
      segmenterPromise = null;
      status.modelLoaded = false;
      status.lastError = "";
    }
  }

  function getStatus() {
    return {
      modelLoaded: !!status.modelLoaded,
      modelLoading: !!status.modelLoading,
      lastError: status.lastError || "",
    };
  }

  function loadScript(url) {
    if (scriptPromise) return scriptPromise;
    scriptPromise = new Promise((resolve, reject) => {
      if (window.SelfieSegmentation) {
        resolve();
        return;
      }
      const s = document.createElement("script");
      s.src = url;
      s.crossOrigin = "anonymous";
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Failed to load Selfie Segmentation."));
      document.head.appendChild(s);
    });
    return scriptPromise;
  }

  async function createMediaPipeSegmenter() {
    await loadScript(`${CDN_BASE}/selfie_segmentation.js`);
    if (!window.SelfieSegmentation) throw new Error("SelfieSegmentation unavailable.");
    const instance = new window.SelfieSegmentation({
      locateFile: (file) => `${CDN_BASE}/${file}`,
    });
    instance.setOptions({ modelSelection: 1 });
    return {
      segment(canvas) {
        return new Promise((resolve, reject) => {
          instance.onResults((results) => {
            if (!results || !results.segmentationMask) {
              reject(new Error("Segmentation mask unavailable."));
              return;
            }
            resolve(results.segmentationMask);
          });
          Promise.resolve(instance.send({ image: canvas })).catch(reject);
        });
      },
    };
  }

  async function getSegmenter() {
    if (!segmenterPromise) {
      status.modelLoading = true;
      status.lastError = "";
      const create = createSegmenterOverride || createMediaPipeSegmenter;
      segmenterPromise = Promise.resolve(create()).then((seg) => {
        status.modelLoaded = true;
        status.modelLoading = false;
        return seg;
      }).catch((err) => {
        status.modelLoading = false;
        status.lastError = err && err.message ? err.message : String(err);
        segmenterPromise = null;
        throw err;
      });
    }
    return segmenterPromise;
  }

  function makeCanvas(w, h) {
    if (window.ImageOps && window.ImageOps.makeCanvas) return window.ImageOps.makeCanvas(w, h);
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(Number(w) || 1));
    c.height = Math.max(1, Math.round(Number(h) || 1));
    return c;
  }

  function copyMaskToCanvas(mask, w, h) {
    const c = makeCanvas(w, h);
    const ctx = c.getContext("2d");
    if (!ctx) return c;
    ctx.drawImage(mask, 0, 0, w, h);
    return c;
  }

  function softenAlpha(alpha, threshold, feather) {
    const t = Math.max(0, Math.min(1, Number(threshold)));
    const f = Math.max(0, Math.min(0.5, Number(feather) || 0));
    const value = alpha / 255;
    if (f <= 0) return value >= t ? 255 : 0;
    const lo = Math.max(0, t - f);
    const hi = Math.min(1, t + f);
    const n = Math.max(0, Math.min(1, (value - lo) / Math.max(0.0001, hi - lo)));
    const smooth = n * n * (3 - 2 * n);
    return Math.round(smooth * 255);
  }

  async function removeBackground(canvas, opts) {
    if (!canvas) return null;
    const o = opts || {};
    const threshold = Number.isFinite(Number(o.threshold)) ? Number(o.threshold) : 0.5;
    const feather = Number.isFinite(Number(o.feather)) ? Number(o.feather) : 0.03;
    const segmenter = o.segmenter || await getSegmenter();
    const mask = await segmenter.segment(canvas, o);
    const maskCanvas = copyMaskToCanvas(mask, canvas.width, canvas.height);
    const out = makeCanvas(canvas.width, canvas.height);
    const outCtx = out.getContext("2d");
    const maskCtx = maskCanvas.getContext("2d");
    if (!outCtx || !maskCtx) return out;
    outCtx.drawImage(canvas, 0, 0);
    const src = outCtx.getImageData(0, 0, out.width, out.height);
    const maskData = maskCtx.getImageData(0, 0, out.width, out.height).data;
    for (let i = 0; i < src.data.length; i += 4) {
      src.data[i + 3] = softenAlpha(maskData[i], threshold, feather);
    }
    outCtx.putImageData(src, 0, 0);
    return out;
  }

  window.ImageBgRemoval = {
    __installed: true,
    version: 1,
    configure,
    removeBackground,
    getStatus,
  };
})();
