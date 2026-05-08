// ROLE: Pure Image workspace canvas operations. Owns crop, rotate, flip,
// scale, and trim-transparency helpers. Functions never mutate input canvases.
//
// Loaded before image-workspace.js / image-io.js.
//
// EXPORTS (under window.ImageOps):
//   makeCanvas(w, h)
//   clone(canvas)
//   crop(canvas, rect)
//   rotate(canvas, degrees)
//   flip(canvas, axis)
//   scale(canvas, opts)
//   trimTransparency(canvas, threshold?)

(function buildImageOps() {
  if (typeof window === "undefined") return;
  if (window.ImageOps && window.ImageOps.__installed) return;

  function makeCanvas(w, h) {
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(Number(w) || 1));
    c.height = Math.max(1, Math.round(Number(h) || 1));
    return c;
  }

  function clone(canvas) {
    if (!canvas) return null;
    const c = makeCanvas(canvas.width, canvas.height);
    const ctx = c.getContext("2d");
    if (ctx) ctx.drawImage(canvas, 0, 0);
    return c;
  }

  function clampRect(canvas, rect) {
    const x = Math.max(0, Math.min(canvas.width, Math.floor(Number(rect && rect.x) || 0)));
    const y = Math.max(0, Math.min(canvas.height, Math.floor(Number(rect && rect.y) || 0)));
    const maxW = canvas.width - x;
    const maxH = canvas.height - y;
    const w = Math.max(1, Math.min(maxW, Math.round(Number(rect && rect.w) || maxW)));
    const h = Math.max(1, Math.min(maxH, Math.round(Number(rect && rect.h) || maxH)));
    return { x, y, w, h };
  }

  function crop(canvas, rect) {
    if (!canvas) return null;
    const r = clampRect(canvas, rect || { x: 0, y: 0, w: canvas.width, h: canvas.height });
    const c = makeCanvas(r.w, r.h);
    const ctx = c.getContext("2d");
    if (ctx) ctx.drawImage(canvas, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h);
    return c;
  }

  function normalizeDegrees(degrees) {
    const d = Number(degrees) || 0;
    return ((Math.round(d / 90) * 90) % 360 + 360) % 360;
  }

  function rotate(canvas, degrees) {
    if (!canvas) return null;
    const d = normalizeDegrees(degrees);
    if (d === 0) return clone(canvas);
    const swap = d === 90 || d === 270;
    const c = makeCanvas(swap ? canvas.height : canvas.width, swap ? canvas.width : canvas.height);
    const ctx = c.getContext("2d");
    if (!ctx) return c;
    if (d === 90) {
      ctx.translate(c.width, 0);
      ctx.rotate(Math.PI / 2);
    } else if (d === 180) {
      ctx.translate(c.width, c.height);
      ctx.rotate(Math.PI);
    } else if (d === 270) {
      ctx.translate(0, c.height);
      ctx.rotate(Math.PI * 1.5);
    }
    ctx.drawImage(canvas, 0, 0);
    return c;
  }

  function flip(canvas, axis) {
    if (!canvas) return null;
    const c = makeCanvas(canvas.width, canvas.height);
    const ctx = c.getContext("2d");
    if (!ctx) return c;
    const a = String(axis || "x").toLowerCase();
    if (a === "y" || a === "vertical") {
      ctx.translate(0, c.height);
      ctx.scale(1, -1);
    } else {
      ctx.translate(c.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(canvas, 0, 0);
    return c;
  }

  function scale(canvas, opts) {
    if (!canvas) return null;
    const o = opts || {};
    const factor = Number(o.factor);
    const targetW = Number.isFinite(Number(o.width)) && Number(o.width) > 0
      ? Number(o.width)
      : (Number.isFinite(factor) && factor > 0 ? canvas.width * factor : canvas.width);
    const targetH = Number.isFinite(Number(o.height)) && Number(o.height) > 0
      ? Number(o.height)
      : (Number.isFinite(factor) && factor > 0 ? canvas.height * factor : canvas.height);
    const c = makeCanvas(targetW, targetH);
    const ctx = c.getContext("2d");
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(canvas, 0, 0, c.width, c.height);
    }
    return c;
  }

  function trimTransparency(canvas, threshold) {
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return clone(canvas);
    const w = canvas.width;
    const h = canvas.height;
    const alphaMin = Math.max(0, Math.min(255, Math.round(Number(threshold) || 0)));
    const data = ctx.getImageData(0, 0, w, h).data;
    let minX = w;
    let minY = h;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < h; y += 1) {
      for (let x = 0; x < w; x += 1) {
        const a = data[(y * w + x) * 4 + 3];
        if (a > alphaMin) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < minX || maxY < minY) return makeCanvas(1, 1);
    return crop(canvas, { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 });
  }

  window.ImageOps = {
    __installed: true,
    version: 1,
    makeCanvas,
    clone,
    crop,
    rotate,
    flip,
    scale,
    trimTransparency,
  };
})();
