// ROLE: Image workspace background removal using @imgly/background-removal
// (BRIA RMBG-1.4). Works on illustrations, anime characters, objects, photos
// — unlike MediaPipe Selfie Segmentation which only works on real humans.
//
// The library is loaded lazily via ESM dynamic import on first use (~170 MB
// model cached by the browser after the first download). It returns a
// transparent PNG Blob which we convert to a canvas.
//
// Loaded before image-io.js.
//
// EXPORTS (under window.ImageBgRemoval):
//   removeBackground(canvas, opts?) -> Promise<HTMLCanvasElement>
//   getStatus()                     -> { modelLoaded, modelLoading, lastError }

(function buildImageBgRemoval() {
  if (typeof window === "undefined") return;
  if (window.ImageBgRemoval && window.ImageBgRemoval.__installed) return;

  const IMGLY_CDN = "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.5/+esm";

  let removeBackgroundFn = null;
  let loadPromise = null;
  const status = { modelLoaded: false, modelLoading: false, lastError: "" };

  // Lazy-import the library once on first use
  async function loadLibrary() {
    if (loadPromise) return loadPromise;
    status.modelLoading = true;
    status.lastError = "";
    if (typeof setStatus === "function") setStatus("Downloading background-removal model (first use, ~170 MB)…");
    loadPromise = import(IMGLY_CDN).then((mod) => {
      removeBackgroundFn = mod.removeBackground;
      status.modelLoaded = true;
      status.modelLoading = false;
      if (typeof setStatus === "function") setStatus("Background-removal model ready.");
      return removeBackgroundFn;
    }).catch((err) => {
      status.modelLoading = false;
      status.lastError = err && err.message ? err.message : String(err);
      loadPromise = null;
      throw err;
    });
    return loadPromise;
  }

  function makeCanvas(w, h) {
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(Number(w) || 1));
    c.height = Math.max(1, Math.round(Number(h) || 1));
    return c;
  }

  // Convert the source canvas to a Blob, run removeBackground, then
  // decode the result Blob back to a canvas.
  async function removeBackground(canvas, opts) {
    if (!canvas) return null;
    const fn = await loadLibrary();

    // Convert the source canvas to a Blob (JPEG for speed, library handles it)
    const sourceBlob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => b ? resolve(b) : reject(new Error("canvas.toBlob failed")), "image/jpeg", 0.95);
    });

    if (typeof setStatus === "function") setStatus("Removing background…");

    // @imgly/background-removal accepts a Blob and returns a transparent PNG Blob.
    // No publicPath — the library auto-resolves its WASM + model assets from
    // the same CDN it was imported from (jsdelivr). Explicitly setting
    // publicPath breaks this because the models live at a different sub-path
    // than the JS bundle.
    const resultBlob = await fn(sourceBlob);

    // Decode the result Blob back to an ImageBitmap and paint onto a canvas
    const bmp = await createImageBitmap(resultBlob);
    const out = makeCanvas(bmp.width, bmp.height);
    const ctx = out.getContext("2d");
    if (ctx) ctx.drawImage(bmp, 0, 0);
    if (typeof bmp.close === "function") bmp.close();
    if (typeof setStatus === "function") setStatus("Background removed.");
    return out;
  }

  function getStatus() {
    return {
      modelLoaded: !!status.modelLoaded,
      modelLoading: !!status.modelLoading,
      lastError: status.lastError || "",
    };
  }

  window.ImageBgRemoval = {
    __installed: true,
    version: 2,
    removeBackground,
    getStatus,
  };
})();
