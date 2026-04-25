// GL Toolkit — utilities for adding extra WebGL passes / off-screen renders
// without touching the existing main render pipeline. Designed to be loaded
// after runtime.js and to share the existing `gl` global where possible, but
// also creates a dedicated overlay context bound to #glOverlayCanvas.
//
// Provided helpers:
//   glToolkit.context() / glToolkit.overlay()  — get GLContextWrapper
//   glToolkit.createProgram(name, vsBody, fsBody) — cached, version-prefixed
//   glToolkit.createTexture2D({width, height, format, ...}) — clamped + nearest
//   glToolkit.uploadFloatTexture(tex, w, h, dataF32, channels)
//   glToolkit.drawFullscreenQuad(program, setUniforms)
//   glToolkit.report() — prints caps + cache stats
//
// Phase 0: this file is *only* infrastructure. No existing draw call is changed.

(function () {
  if (typeof window === "undefined") return;
  if (window.glToolkit) return; // idempotent

  // --- Detect main GL context (from runtime.js); we don't recreate it. ---
  const mainGL = typeof gl !== "undefined" ? gl : null;
  const mainHasGL = !!mainGL;
  const mainIsWebGL2 =
    mainHasGL &&
    typeof WebGL2RenderingContext !== "undefined" &&
    mainGL instanceof WebGL2RenderingContext;

  // --- Overlay GL context (lazy) ---
  let overlayGL = null;
  let overlayIsWebGL2 = false;
  function ensureOverlayContext() {
    if (overlayGL !== null) return overlayGL;
    const cnv = document.getElementById("glOverlayCanvas");
    if (!cnv) return null;
    const ctx =
      cnv.getContext("webgl2", { alpha: true, premultipliedAlpha: false }) ||
      cnv.getContext("webgl", { alpha: true, premultipliedAlpha: false }) ||
      cnv.getContext("experimental-webgl", { alpha: true, premultipliedAlpha: false });
    if (!ctx) {
      console.warn("[glToolkit] overlay canvas: WebGL unavailable");
      overlayGL = false; // mark as failed, don't retry
      return null;
    }
    overlayGL = ctx;
    overlayIsWebGL2 =
      typeof WebGL2RenderingContext !== "undefined" &&
      ctx instanceof WebGL2RenderingContext;
    return ctx;
  }

  // --- Wrapper -------------------------------------------------------------
  function makeWrapper(getCtx, isV2Getter, label) {
    const programs = new Map(); // name -> { program, locs, vs, fs }
    const textures = new Map(); // optional registry (for diagnostics)

    function ctx() {
      return getCtx();
    }

    function isWebGL2() {
      return !!isV2Getter();
    }

    function versionPrefix() {
      return isWebGL2() ? "#version 300 es\n" : "";
    }

    // Translate a GLSL ES 3.00 shader body into a WebGL1-compatible one when
    // running on WebGL1. Bodies should be written for WebGL2 (in/out, texture()).
    function compatBody(body, stage) {
      if (isWebGL2()) return versionPrefix() + body;
      let s = body;
      if (stage === "vs") {
        s = s.replace(/\bin\s+/g, "attribute ").replace(/\bout\s+/g, "varying ");
      } else {
        s = s.replace(/\bin\s+/g, "varying ");
        // Replace the OpenGL ES 3 `out vec4 outColor` declaration; assume that
        // the shader writes to `outColor` and convert to `gl_FragColor`.
        s = s.replace(/^\s*out\s+vec4\s+(\w+)\s*;\s*$/m, "");
        s = s.replace(/\boutColor\b/g, "gl_FragColor");
        s = s.replace(/\btexture\s*\(/g, "texture2D(");
      }
      return s;
    }

    function compileShader(g, type, src) {
      const sh = g.createShader(type);
      g.shaderSource(sh, src);
      g.compileShader(sh);
      if (!g.getShaderParameter(sh, g.COMPILE_STATUS)) {
        const log = g.getShaderInfoLog(sh) || "(no log)";
        g.deleteShader(sh);
        throw new Error(`[glToolkit:${label}] shader compile failed:\n${log}\n--- source ---\n${src}`);
      }
      return sh;
    }

    function createProgram(name, vsBody, fsBody) {
      const cached = programs.get(name);
      if (cached) return cached;
      const g = ctx();
      if (!g) throw new Error(`[glToolkit:${label}] no GL context for program "${name}"`);
      const vsSrc = compatBody(vsBody, "vs");
      const fsSrc = compatBody(fsBody, "fs");
      const vs = compileShader(g, g.VERTEX_SHADER, vsSrc);
      const fs = compileShader(g, g.FRAGMENT_SHADER, fsSrc);
      const program = g.createProgram();
      g.attachShader(program, vs);
      g.attachShader(program, fs);
      g.linkProgram(program);
      if (!g.getProgramParameter(program, g.LINK_STATUS)) {
        const log = g.getProgramInfoLog(program) || "(no log)";
        g.deleteProgram(program);
        throw new Error(`[glToolkit:${label}] program "${name}" link failed:\n${log}`);
      }
      const entry = {
        program,
        attribLocation: (n) => g.getAttribLocation(program, n),
        uniformLocation: (n) => g.getUniformLocation(program, n),
        vsSrc,
        fsSrc,
      };
      programs.set(name, entry);
      return entry;
    }

    function createTexture2D(opts = {}) {
      const g = ctx();
      if (!g) return null;
      const tex = g.createTexture();
      g.bindTexture(g.TEXTURE_2D, tex);
      const minFilter = opts.minFilter != null ? opts.minFilter : g.NEAREST;
      const magFilter = opts.magFilter != null ? opts.magFilter : g.NEAREST;
      const wrapS = opts.wrapS != null ? opts.wrapS : g.CLAMP_TO_EDGE;
      const wrapT = opts.wrapT != null ? opts.wrapT : g.CLAMP_TO_EDGE;
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, minFilter);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, magFilter);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, wrapS);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, wrapT);
      g.bindTexture(g.TEXTURE_2D, null);
      if (opts.label) textures.set(opts.label, tex);
      return tex;
    }

    // Upload float data into a texture. Channels = 1 (R) or 4 (RGBA).
    // WebGL2: uses R32F / RGBA32F. WebGL1: uses RGBA + UNSIGNED_BYTE packing
    // (caller is responsible for packing if WebGL1; we just upload as-is here).
    function uploadFloatTexture(tex, w, h, dataF32, channels = 1) {
      const g = ctx();
      if (!g || !tex) return false;
      g.bindTexture(g.TEXTURE_2D, tex);
      if (isWebGL2()) {
        const internalFormat = channels === 1 ? g.R32F : g.RGBA32F;
        const format = channels === 1 ? g.RED : g.RGBA;
        // Enable float textures (WebGL2 has it natively, but linear filter needs the float-linear ext).
        g.texImage2D(g.TEXTURE_2D, 0, internalFormat, w, h, 0, format, g.FLOAT, dataF32);
      } else {
        // WebGL1 fallback: needs OES_texture_float; some devices don't filter it.
        const ext = g.getExtension("OES_texture_float");
        if (!ext) {
          console.warn(`[glToolkit:${label}] OES_texture_float unavailable; caller must pack to UNSIGNED_BYTE`);
          g.bindTexture(g.TEXTURE_2D, null);
          return false;
        }
        g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, w, h, 0, g.RGBA, g.FLOAT, dataF32);
      }
      g.bindTexture(g.TEXTURE_2D, null);
      return true;
    }

    // Cached fullscreen quad geometry (positions in clip space, uvs 0..1)
    let fullscreenQuad = null;
    function ensureFullscreenQuad() {
      if (fullscreenQuad) return fullscreenQuad;
      const g = ctx();
      if (!g) return null;
      const vbo = g.createBuffer();
      g.bindBuffer(g.ARRAY_BUFFER, vbo);
      // Two triangles covering [-1, 1] in clip space, with uv [0, 1].
      const data = new Float32Array([
        -1, -1, 0, 0,
        1, -1, 1, 0,
        -1, 1, 0, 1,
        -1, 1, 0, 1,
        1, -1, 1, 0,
        1, 1, 1, 1,
      ]);
      g.bufferData(g.ARRAY_BUFFER, data, g.STATIC_DRAW);
      g.bindBuffer(g.ARRAY_BUFFER, null);
      fullscreenQuad = { vbo, vertexCount: 6 };
      return fullscreenQuad;
    }

    function drawFullscreenQuad(programEntry, attribNames = { aPos: "aPos", aUv: "aUv" }) {
      const g = ctx();
      if (!g) return;
      const quad = ensureFullscreenQuad();
      if (!quad) return;
      const aPos = programEntry.attribLocation(attribNames.aPos);
      const aUv = attribNames.aUv ? programEntry.attribLocation(attribNames.aUv) : -1;
      g.bindBuffer(g.ARRAY_BUFFER, quad.vbo);
      if (aPos >= 0) {
        g.enableVertexAttribArray(aPos);
        g.vertexAttribPointer(aPos, 2, g.FLOAT, false, 16, 0);
      }
      if (aUv >= 0) {
        g.enableVertexAttribArray(aUv);
        g.vertexAttribPointer(aUv, 2, g.FLOAT, false, 16, 8);
      }
      g.drawArrays(g.TRIANGLES, 0, quad.vertexCount);
      g.bindBuffer(g.ARRAY_BUFFER, null);
    }

    function caps() {
      const g = ctx();
      if (!g) return { available: false };
      // Prefer the standard RENDERER/VENDOR (WebGL2 spec).
      // WEBGL_debug_renderer_info is deprecated in Firefox and may return masked
      // strings in browsers with privacy mitigations; keep it as a fallback.
      let renderer = "(unknown)";
      let vendor = "(unknown)";
      try { renderer = g.getParameter(g.RENDERER) || renderer; } catch { /* ignore */ }
      try { vendor = g.getParameter(g.VENDOR) || vendor; } catch { /* ignore */ }
      if (renderer === "WebKit WebGL" || renderer === "Mozilla" || renderer.indexOf("ANGLE") < 0) {
        const debug = g.getExtension("WEBGL_debug_renderer_info");
        if (debug) {
          try { renderer = g.getParameter(debug.UNMASKED_RENDERER_WEBGL) || renderer; } catch { /* ignore */ }
          try { vendor = g.getParameter(debug.UNMASKED_VENDOR_WEBGL) || vendor; } catch { /* ignore */ }
        }
      }
      return {
        available: true,
        webgl2: isWebGL2(),
        maxTextureSize: g.getParameter(g.MAX_TEXTURE_SIZE),
        maxVertexAttribs: g.getParameter(g.MAX_VERTEX_ATTRIBS),
        renderer,
        vendor,
        extensions: g.getSupportedExtensions ? g.getSupportedExtensions() : [],
      };
    }

    function report() {
      const c = caps();
      console.group(`[glToolkit:${label}]`);
      console.log("caps", c);
      console.log("programs", Array.from(programs.keys()));
      console.log("textures", Array.from(textures.keys()));
      console.groupEnd();
      return c;
    }

    // Discard cached GPU resources (programs, textures, fullscreen quad).
    // Called from the context-lost handler — these GL handles are now invalid
    // and we shouldn't try to gl.deleteX() them; just drop the references so
    // the next call rebuilds.
    function resetCachedResources() {
      programs.clear();
      textures.clear();
      fullscreenQuad = null;
    }

    return {
      label,
      ctx,
      isWebGL2,
      versionPrefix,
      createProgram,
      createTexture2D,
      uploadFloatTexture,
      drawFullscreenQuad,
      caps,
      report,
      resetCachedResources,
      _programs: programs,
      _textures: textures,
    };
  }

  const mainWrapper = mainHasGL
    ? makeWrapper(() => mainGL, () => mainIsWebGL2, "main")
    : null;
  const overlayWrapper = makeWrapper(
    () => ensureOverlayContext() || null,
    () => overlayIsWebGL2,
    "overlay"
  );

  function syncOverlayCanvasSize() {
    const cnv = document.getElementById("glOverlayCanvas");
    const main = document.getElementById("glCanvas");
    if (!cnv || !main) return;
    if (cnv.width !== main.width || cnv.height !== main.height) {
      cnv.width = main.width;
      cnv.height = main.height;
      const g = ensureOverlayContext();
      if (g) g.viewport(0, 0, cnv.width, cnv.height);
    }
  }

  // External listeners for context lost/restored. Modules that hold GL
  // handles (e.g. weight-heatmap-gpu) register here so they can drop refs
  // on lost and rebuild lazily on restored.
  const lostListeners = new Set();
  const restoredListeners = new Set();

  function onContextLost(fn) { if (typeof fn === "function") lostListeners.add(fn); }
  function offContextLost(fn) { lostListeners.delete(fn); }
  function onContextRestored(fn) { if (typeof fn === "function") restoredListeners.add(fn); }
  function offContextRestored(fn) { restoredListeners.delete(fn); }

  function dispatch(set, label) {
    for (const fn of set) {
      try { fn(label); } catch (err) { console.warn("[glToolkit] listener error", err); }
    }
  }

  function attachContextLossHandler(canvas, wrapper, label) {
    if (!canvas || !canvas.addEventListener) return;
    canvas.addEventListener("webglcontextlost", (ev) => {
      // Calling preventDefault tells the browser we'll restore the context.
      ev.preventDefault();
      console.warn(`[glToolkit:${label}] context lost`);
      if (wrapper && typeof wrapper.resetCachedResources === "function") {
        wrapper.resetCachedResources();
      }
      dispatch(lostListeners, label);
    }, false);
    canvas.addEventListener("webglcontextrestored", () => {
      console.info(`[glToolkit:${label}] context restored`);
      dispatch(restoredListeners, label);
      // Trigger a render so the screen comes back without user input.
      if (typeof window !== "undefined" && typeof window.requestRender === "function") {
        window.requestRender("gl-restored");
      } else if (typeof requestRender === "function") {
        requestRender("gl-restored");
      }
    }, false);
  }

  // Hook up both canvases. Main canvas is created in runtime.js so it already
  // exists by the time this IIFE runs; overlay canvas exists in the DOM but
  // its GL context is lazy.
  attachContextLossHandler(document.getElementById("glCanvas"), mainWrapper, "main");
  attachContextLossHandler(document.getElementById("glOverlayCanvas"), overlayWrapper, "overlay");

  window.glToolkit = {
    main: () => mainWrapper,
    overlay: () => overlayWrapper,
    syncOverlayCanvasSize,
    onContextLost,
    offContextLost,
    onContextRestored,
    offContextRestored,
    report() {
      const out = {};
      if (mainWrapper) out.main = mainWrapper.report();
      out.overlay = overlayWrapper.report();
      return out;
    },
  };
})();
