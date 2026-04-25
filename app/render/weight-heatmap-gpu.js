// GPU Weight Heatmap (Phase 1) — replaces drawContinuousWeightHeatmap with a
// fragment-shader implementation rendered to #glOverlayCanvas.
//
// Public API:
//   drawWeightHeatmapGPU(m, meshData, screenPoints, vertexInfos, mode,
//                       selectedBone, selectedValid, alphaBase) -> bool
//     Returns true when the GPU path was used; the legacy CPU fallback should
//     run only when this returns false.
//   clearWeightHeatmapGPU() — wipes the overlay canvas (used between frames).
//
// Phase 1 covers ONLY the per-pixel triangle rasterise that is the dominant
// CPU cost. Vertex dots / outline / legend stay on the 2D overlay.

(function () {
  if (typeof window === "undefined") return;
  if (window.weightHeatmapGPU) return;

  let inited = false;
  let progEntry = null;
  let vbo = null;
  let ibo = null;
  let vao = null;
  let lastVCount = 0;
  let lastIndicesLen = 0;
  let lastIndicesRef = null;

  function resetLocalGLState() {
    inited = false;
    progEntry = null;
    vbo = null;
    ibo = null;
    vao = null;
    lastVCount = 0;
    lastIndicesLen = 0;
    lastIndicesRef = null;
  }
  if (window.glToolkit && typeof window.glToolkit.onContextLost === "function") {
    window.glToolkit.onContextLost((label) => {
      // Both contexts share the same overlay-bound resources; a loss on either
      // makes our cached handles invalid (overlay specifically). Reset.
      if (label === "overlay" || label === "main") resetLocalGLState();
    });
  }

  // --- Shader sources (GLSL ES 3.00; toolkit translates for WebGL1) ---
  // Vertex carries: clip-space position, selectedW, domBone (as float), domW.
  const VS = `
precision highp float;
in vec2 aClip;
in vec3 aInfo; // selectedW, domBone, domW
out vec3 vInfo;
void main() {
  vInfo = aInfo;
  gl_Position = vec4(aClip, 0.0, 1.0);
}
`;

  const FS = `
precision highp float;
in vec3 vInfo;
uniform int uMode; // 0 = selected, 1 = dominant
uniform float uAlphaBase;
out vec4 outColor;

// Mirror of getBoneVizColorParts(): h = (index * 57) mod 360, s = ~62..92%, l = ~42..58%.
vec3 hsl2rgb(float h, float s, float l) {
  // h in [0,1), s in [0,1], l in [0,1]
  float c = (1.0 - abs(2.0 * l - 1.0)) * s;
  float hp = h * 6.0;
  float x = c * (1.0 - abs(mod(hp, 2.0) - 1.0));
  vec3 rgb;
  if (hp < 1.0) rgb = vec3(c, x, 0.0);
  else if (hp < 2.0) rgb = vec3(x, c, 0.0);
  else if (hp < 3.0) rgb = vec3(0.0, c, x);
  else if (hp < 4.0) rgb = vec3(0.0, x, c);
  else if (hp < 5.0) rgb = vec3(x, 0.0, c);
  else rgb = vec3(c, 0.0, x);
  float m = l - 0.5 * c;
  return rgb + vec3(m);
}

// 5-stop heatmap (matches getHeatmapColorParts).
vec3 heatColor(float t) {
  t = clamp(t, 0.0, 1.0);
  vec3 c0 = vec3( 34.0,  54.0, 186.0) / 255.0;
  vec3 c1 = vec3( 52.0, 136.0, 255.0) / 255.0;
  vec3 c2 = vec3( 44.0, 214.0, 176.0) / 255.0;
  vec3 c3 = vec3(237.0, 220.0,  72.0) / 255.0;
  vec3 c4 = vec3(236.0,  74.0,  54.0) / 255.0;
  if (t < 0.2)       return mix(c0, c1, t / 0.2);
  else if (t < 0.42) return mix(c1, c2, (t - 0.2) / 0.22);
  else if (t < 0.68) return mix(c2, c3, (t - 0.42) / 0.26);
  else               return mix(c3, c4, (t - 0.68) / 0.32);
}

void main() {
  float selectedW = clamp(vInfo.x, 0.0, 1.0);
  float domBone   = vInfo.y;            // not clamped: it's an index
  float domW      = clamp(vInfo.z, 0.0, 1.0);
  vec3 rgb;
  float a;
  if (uMode == 1) {
    // dominant
    float h = mod(domBone * 57.0, 360.0) / 360.0;
    float strength = domW;
    float s = (62.0 + 30.0 * strength) / 100.0;
    float l = (42.0 + 16.0 * strength) / 100.0;
    rgb = hsl2rgb(h, s, l);
    a = uAlphaBase * (0.16 + 0.56 * domW);
  } else {
    // selected
    rgb = heatColor(selectedW);
    a = uAlphaBase * (0.2 + 0.65 * selectedW);
  }
  outColor = vec4(rgb, clamp(a, 0.0, 1.0));
}
`;

  function getOverlayWrapper() {
    if (!window.glToolkit) return null;
    return window.glToolkit.overlay();
  }

  function ensureInit() {
    if (inited) return progEntry !== null;
    inited = true;
    const w = getOverlayWrapper();
    if (!w) return false;
    const g = w.ctx();
    if (!g) return false;
    try {
      progEntry = w.createProgram("weight-heatmap-v1", VS, FS);
    } catch (err) {
      console.error("[weightHeatmapGPU] program compile failed", err);
      progEntry = null;
      return false;
    }
    vbo = g.createBuffer();
    ibo = g.createBuffer();
    if (w.isWebGL2()) {
      vao = g.createVertexArray();
    }
    return true;
  }

  // Build a Float32Array of 5 floats per vertex: clipX, clipY, selectedW, domBone, domW
  // (clip space derived from screen px / canvas px).
  function buildVertexBuffer(screenPoints, vertexInfos, vCount, canvasW, canvasH) {
    const out = new Float32Array(vCount * 5);
    const invW = 2 / Math.max(1, canvasW);
    const invH = 2 / Math.max(1, canvasH);
    for (let i = 0; i < vCount; i += 1) {
      const sx = Number(screenPoints[i * 2]) || 0;
      const sy = Number(screenPoints[i * 2 + 1]) || 0;
      const info = vertexInfos[i];
      // Screen px -> clip space (-1..1). Y is flipped because overlay canvas
      // shares the main canvas orientation (y down in screen, y up in clip).
      out[i * 5 + 0] = sx * invW - 1;
      out[i * 5 + 1] = 1 - sy * invH;
      out[i * 5 + 2] = info ? Number(info.selectedW) || 0 : 0;
      out[i * 5 + 3] = info ? Number(info.domBone) || 0 : 0;
      out[i * 5 + 4] = info ? Number(info.domW) || 0 : 0;
    }
    return out;
  }

  function drawWeightHeatmapGPU(m, meshData, screenPoints, vertexInfos, mode, selectedBone, selectedValid, alphaBase) {
    if (!ensureInit()) return false;
    const w = getOverlayWrapper();
    const g = w.ctx();
    if (!g || !progEntry) return false;
    const cnv = document.getElementById("glOverlayCanvas");
    const main = document.getElementById("glCanvas");
    if (!cnv || !main) return false;
    if (cnv.width !== main.width || cnv.height !== main.height) {
      cnv.width = main.width;
      cnv.height = main.height;
    }
    const indices = meshData && meshData.indices;
    const vCount = vertexInfos.length;
    if (!indices || indices.length < 3 || vCount <= 0) return false;

    g.viewport(0, 0, cnv.width, cnv.height);
    g.clearColor(0, 0, 0, 0);
    g.clear(g.COLOR_BUFFER_BIT);
    g.enable(g.BLEND);
    g.blendFuncSeparate(g.SRC_ALPHA, g.ONE_MINUS_SRC_ALPHA, g.ONE, g.ONE_MINUS_SRC_ALPHA);

    const vertexData = buildVertexBuffer(screenPoints, vertexInfos, vCount, cnv.width, cnv.height);

    if (vao) g.bindVertexArray(vao);
    g.bindBuffer(g.ARRAY_BUFFER, vbo);
    g.bufferData(g.ARRAY_BUFFER, vertexData, g.DYNAMIC_DRAW);

    const aClip = progEntry.attribLocation("aClip");
    const aInfo = progEntry.attribLocation("aInfo");
    if (aClip >= 0) {
      g.enableVertexAttribArray(aClip);
      g.vertexAttribPointer(aClip, 2, g.FLOAT, false, 20, 0);
    }
    if (aInfo >= 0) {
      g.enableVertexAttribArray(aInfo);
      g.vertexAttribPointer(aInfo, 3, g.FLOAT, false, 20, 8);
    }

    // Indices may be Array, Uint16Array, Uint32Array; coerce to Uint16 (vCount fits 16-bit
    // in practical meshes; warn otherwise).
    let indexArray = indices;
    let needsUpload = indexArray !== lastIndicesRef || indices.length !== lastIndicesLen || vCount !== lastVCount;
    if (needsUpload) {
      let typed;
      if (vCount > 65535) {
        // Need Uint32; WebGL2 supports it natively, WebGL1 needs OES_element_index_uint.
        if (!w.isWebGL2()) {
          const ext = g.getExtension("OES_element_index_uint");
          if (!ext) return false;
        }
        typed = indexArray instanceof Uint32Array ? indexArray : new Uint32Array(indexArray);
      } else {
        typed = indexArray instanceof Uint16Array ? indexArray : new Uint16Array(indexArray);
      }
      g.bindBuffer(g.ELEMENT_ARRAY_BUFFER, ibo);
      g.bufferData(g.ELEMENT_ARRAY_BUFFER, typed, g.STATIC_DRAW);
      lastIndicesRef = indexArray;
      lastIndicesLen = indexArray.length;
      lastVCount = vCount;
    } else {
      g.bindBuffer(g.ELEMENT_ARRAY_BUFFER, ibo);
    }

    g.useProgram(progEntry.program);
    const uMode = progEntry.uniformLocation("uMode");
    const uAlphaBase = progEntry.uniformLocation("uAlphaBase");
    const isDominant = mode === "dominant" || !selectedValid;
    if (uMode) g.uniform1i(uMode, isDominant ? 1 : 0);
    if (uAlphaBase) g.uniform1f(uAlphaBase, Math.max(0.05, Math.min(1, Number(alphaBase) || 0.75)));

    const indexType = vCount > 65535 ? g.UNSIGNED_INT : g.UNSIGNED_SHORT;
    g.drawElements(g.TRIANGLES, indices.length, indexType, 0);

    g.bindBuffer(g.ARRAY_BUFFER, null);
    g.bindBuffer(g.ELEMENT_ARRAY_BUFFER, null);
    if (vao) g.bindVertexArray(null);
    g.disable(g.BLEND);
    return true;
  }

  function clearWeightHeatmapGPU() {
    const w = getOverlayWrapper();
    if (!w) return;
    const g = w.ctx();
    if (!g) return;
    const cnv = document.getElementById("glOverlayCanvas");
    if (!cnv) return;
    g.viewport(0, 0, cnv.width, cnv.height);
    g.clearColor(0, 0, 0, 0);
    g.clear(g.COLOR_BUFFER_BIT);
  }

  window.weightHeatmapGPU = {
    draw: drawWeightHeatmapGPU,
    clear: clearWeightHeatmapGPU,
  };
})();
