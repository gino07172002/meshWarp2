const els = {
  fileNewBtn: document.getElementById("fileNewBtn"),
  fileOpenBtn: document.getElementById("fileOpenBtn"),
  fileSaveBtn: document.getElementById("fileSaveBtn"),
  fileLoadBtn: document.getElementById("fileLoadBtn"),
  fileExportSpineBtn: document.getElementById("fileExportSpineBtn"),
  fileInput: document.getElementById("fileInput"),
  projectLoadInput: document.getElementById("projectLoadInput"),
  workspaceMode: document.getElementById("workspaceMode"),
  leftToolModeHint: document.getElementById("leftToolModeHint"),
  leftToolTabs: document.getElementById("leftToolTabs"),
  leftTabSetup: document.getElementById("leftTabSetup"),
  leftTabRig: document.getElementById("leftTabRig"),
  leftTabIK: document.getElementById("leftTabIK"),
  leftTabConstraint: document.getElementById("leftTabConstraint"),
  leftTabPath: document.getElementById("leftTabPath"),
  leftTabSkin: document.getElementById("leftTabSkin"),
  leftTabTools: document.getElementById("leftTabTools"),
  leftTabSlotMesh: document.getElementById("leftTabSlotMesh"),
  leftMeshSetup: document.getElementById("leftMeshSetup"),
  leftRigBuild: document.getElementById("leftRigBuild"),
  leftIKTools: document.getElementById("leftIKTools"),
  leftConstraintTools: document.getElementById("leftConstraintTools"),
  leftPathTools: document.getElementById("leftPathTools"),
  leftSkinTools: document.getElementById("leftSkinTools"),
  leftGeneralTools: document.getElementById("leftGeneralTools"),
  slotSelect: document.getElementById("slotSelect"),
  slotViewMode: document.getElementById("slotViewMode"),
  gridX: document.getElementById("gridX"),
  gridY: document.getElementById("gridY"),
  remeshBtn: document.getElementById("remeshBtn"),
  editMode: document.getElementById("editMode"),
  boneMode: document.getElementById("boneMode"),
  boneSelect: document.getElementById("boneSelect"),
  addBoneBtn: document.getElementById("addBoneBtn"),
  deleteBoneBtn: document.getElementById("deleteBoneBtn"),
  addBoneParent: document.getElementById("addBoneParent"),
  addBoneConnect: document.getElementById("addBoneConnect"),
  ikTools: document.getElementById("leftIKTools"),
  ikAdd1Btn: document.getElementById("ikAdd1Btn"),
  ikAdd2Btn: document.getElementById("ikAdd2Btn"),
  ikMoveUpBtn: document.getElementById("ikMoveUpBtn"),
  ikMoveDownBtn: document.getElementById("ikMoveDownBtn"),
  ikPickTargetBtn: document.getElementById("ikPickTargetBtn"),
  ikRemoveBtn: document.getElementById("ikRemoveBtn"),
  ikList: document.getElementById("ikList"),
  ikSelect: document.getElementById("ikSelect"),
  ikName: document.getElementById("ikName"),
  ikEnabled: document.getElementById("ikEnabled"),
  ikTargetBone: document.getElementById("ikTargetBone"),
  ikBendDir: document.getElementById("ikBendDir"),
  ikEndMode: document.getElementById("ikEndMode"),
  ikBoneA: document.getElementById("ikBoneA"),
  ikBoneB: document.getElementById("ikBoneB"),
  ikMix: document.getElementById("ikMix"),
  ikHint: document.getElementById("ikHint"),
  tfcAddBtn: document.getElementById("tfcAddBtn"),
  tfcRemoveBtn: document.getElementById("tfcRemoveBtn"),
  tfcMoveUpBtn: document.getElementById("tfcMoveUpBtn"),
  tfcMoveDownBtn: document.getElementById("tfcMoveDownBtn"),
  tfcList: document.getElementById("tfcList"),
  tfcSelect: document.getElementById("tfcSelect"),
  tfcName: document.getElementById("tfcName"),
  tfcEnabled: document.getElementById("tfcEnabled"),
  tfcTargetBone: document.getElementById("tfcTargetBone"),
  tfcBoneSearch: document.getElementById("tfcBoneSearch"),
  tfcBones: document.getElementById("tfcBones"),
  tfcBonesAllBtn: document.getElementById("tfcBonesAllBtn"),
  tfcBonesClearBtn: document.getElementById("tfcBonesClearBtn"),
  tfcBonesInvertBtn: document.getElementById("tfcBonesInvertBtn"),
  tfcLocal: document.getElementById("tfcLocal"),
  tfcRelative: document.getElementById("tfcRelative"),
  tfcRotateMix: document.getElementById("tfcRotateMix"),
  tfcTranslateMix: document.getElementById("tfcTranslateMix"),
  tfcScaleMix: document.getElementById("tfcScaleMix"),
  tfcShearMix: document.getElementById("tfcShearMix"),
  tfcOffsetX: document.getElementById("tfcOffsetX"),
  tfcOffsetY: document.getElementById("tfcOffsetY"),
  tfcOffsetRot: document.getElementById("tfcOffsetRot"),
  tfcOffsetScaleX: document.getElementById("tfcOffsetScaleX"),
  tfcOffsetScaleY: document.getElementById("tfcOffsetScaleY"),
  tfcOffsetShearY: document.getElementById("tfcOffsetShearY"),
  tfcHint: document.getElementById("tfcHint"),
  pathAddBtn: document.getElementById("pathAddBtn"),
  pathRemoveBtn: document.getElementById("pathRemoveBtn"),
  pathMoveUpBtn: document.getElementById("pathMoveUpBtn"),
  pathMoveDownBtn: document.getElementById("pathMoveDownBtn"),
  pathList: document.getElementById("pathList"),
  pathSelect: document.getElementById("pathSelect"),
  pathName: document.getElementById("pathName"),
  pathTargetBone: document.getElementById("pathTargetBone"),
  pathSourceType: document.getElementById("pathSourceType"),
  pathTargetSlot: document.getElementById("pathTargetSlot"),
  pathEnabled: document.getElementById("pathEnabled"),
  pathBones: document.getElementById("pathBones"),
  pathPosition: document.getElementById("pathPosition"),
  pathSpacing: document.getElementById("pathSpacing"),
  pathRotateMix: document.getElementById("pathRotateMix"),
  pathTranslateMix: document.getElementById("pathTranslateMix"),
  pathClosed: document.getElementById("pathClosed"),
  pathHint: document.getElementById("pathHint"),
  boneName: document.getElementById("boneName"),
  boneParent: document.getElementById("boneParent"),
  boneConnect: document.getElementById("boneConnect"),
  bonePoseLen: document.getElementById("bonePoseLen"),
  boneTx: document.getElementById("boneTx"),
  boneTy: document.getElementById("boneTy"),
  boneRot: document.getElementById("boneRot"),
  boneLen: document.getElementById("boneLen"),
  boneScaleX: document.getElementById("boneScaleX"),
  boneScaleY: document.getElementById("boneScaleY"),
  boneShearX: document.getElementById("boneShearX"),
  boneShearY: document.getElementById("boneShearY"),
  boneHeadX: document.getElementById("boneHeadX"),
  boneHeadY: document.getElementById("boneHeadY"),
  boneTipX: document.getElementById("boneTipX"),
  boneTipY: document.getElementById("boneTipY"),
  weightMode: document.getElementById("weightMode"),
  autoWeightBtn: document.getElementById("autoWeightBtn"),
  resetPoseBtn: document.getElementById("resetPoseBtn"),
  resetVertexBtn: document.getElementById("resetVertexBtn"),
  animTime: document.getElementById("animTime"),
  animDuration: document.getElementById("animDuration"),
  animSelect: document.getElementById("animSelect"),
  animName: document.getElementById("animName"),
  animLoop: document.getElementById("animLoop"),
  animSnap: document.getElementById("animSnap"),
  animFps: document.getElementById("animFps"),
  animTimeStep: document.getElementById("animTimeStep"),
  addAnimBtn: document.getElementById("addAnimBtn"),
  deleteAnimBtn: document.getElementById("deleteAnimBtn"),
  duplicateAnimBtn: document.getElementById("duplicateAnimBtn"),
  trackSelect: document.getElementById("trackSelect"),
  keyInterp: document.getElementById("keyInterp"),
  curveToggleBtn: document.getElementById("curveToggleBtn"),
  keyInfo: document.getElementById("keyInfo"),
  animMixTo: document.getElementById("animMixTo"),
  animMixDur: document.getElementById("animMixDur"),
  animMixBtn: document.getElementById("animMixBtn"),
  animMixInfo: document.getElementById("animMixInfo"),
  eventName: document.getElementById("eventName"),
  eventInt: document.getElementById("eventInt"),
  eventFloat: document.getElementById("eventFloat"),
  eventString: document.getElementById("eventString"),
  eventKeyList: document.getElementById("eventKeyList"),
  eventJumpBtn: document.getElementById("eventJumpBtn"),
  eventDeleteSelBtn: document.getElementById("eventDeleteSelBtn"),
  addEventBtn: document.getElementById("addEventBtn"),
  deleteEventBtn: document.getElementById("deleteEventBtn"),
  curveEditorWrap: document.getElementById("curveEditorWrap"),
  curveEditor: document.getElementById("curveEditor"),
  timelineTracks: document.getElementById("timelineTracks"),
  timelineResizer: document.getElementById("timelineResizer"),
  addKeyBtn: document.getElementById("addKeyBtn"),
  deleteKeyBtn: document.getElementById("deleteKeyBtn"),
  copyKeyBtn: document.getElementById("copyKeyBtn"),
  pasteKeyBtn: document.getElementById("pasteKeyBtn"),
  playBtn: document.getElementById("playBtn"),
  pauseBtn: document.getElementById("pauseBtn"),
  stopBtn: document.getElementById("stopBtn"),
  status: document.getElementById("status"),
  boneTree: document.getElementById("boneTree"),
  slotName: document.getElementById("slotName"),
  slotBone: document.getElementById("slotBone"),
  slotBindBoneBtn: document.getElementById("slotBindBoneBtn"),
  slotBindWeightedBtn: document.getElementById("slotBindWeightedBtn"),
  slotVisible: document.getElementById("slotVisible"),
  slotAlpha: document.getElementById("slotAlpha"),
  slotColor: document.getElementById("slotColor"),
  slotWeightMode: document.getElementById("slotWeightMode"),
  slotInfluenceBones: document.getElementById("slotInfluenceBones"),
  slotTx: document.getElementById("slotTx"),
  slotTy: document.getElementById("slotTy"),
  slotRot: document.getElementById("slotRot"),
  slotOrderUp: document.getElementById("slotOrderUp"),
  slotOrderDown: document.getElementById("slotOrderDown"),
  slotMeshTools: document.getElementById("slotMeshTools"),
  slotMeshNewMode: document.getElementById("slotMeshNewMode"),
  slotMeshNewBtn: document.getElementById("slotMeshNewBtn"),
  slotMeshCloseBtn: document.getElementById("slotMeshCloseBtn"),
  slotMeshTriangulateBtn: document.getElementById("slotMeshTriangulateBtn"),
  slotMeshGridFillBtn: document.getElementById("slotMeshGridFillBtn"),
  slotMeshLinkEdgeBtn: document.getElementById("slotMeshLinkEdgeBtn"),
  slotMeshUnlinkEdgeBtn: document.getElementById("slotMeshUnlinkEdgeBtn"),
  slotMeshApplyBtn: document.getElementById("slotMeshApplyBtn"),
  slotMeshResetBtn: document.getElementById("slotMeshResetBtn"),
  stage: document.getElementById("stage"),
  glCanvas: document.getElementById("glCanvas"),
  overlay: document.getElementById("overlay"),
};

const gl =
  els.glCanvas.getContext("webgl2", { alpha: true, premultipliedAlpha: false }) ||
  els.glCanvas.getContext("webgl", { alpha: true, premultipliedAlpha: false }) ||
  els.glCanvas.getContext("experimental-webgl", { alpha: true, premultipliedAlpha: false });
const overlayCtx = els.overlay.getContext("2d");
const stage2dCtx = !gl ? els.glCanvas.getContext("2d") : null;

if (!overlayCtx || (!gl && !stage2dCtx)) {
  throw new Error("2D canvas context unavailable.");
}

const hasGL = !!gl;
const isWebGL2 = hasGL && typeof WebGL2RenderingContext !== "undefined" && gl instanceof WebGL2RenderingContext;
const hasVAO = hasGL && typeof gl.createVertexArray === "function";

const state = {
  sourceCanvas: null,
  texture: null,
  imageWidth: 0,
  imageHeight: 0,
  slots: [],
  activeSlot: -1,
  slotViewMode: "single",
  leftToolTab: "setup",
  workspaceMode: "rig",
  mesh: null,
  editMode: "skeleton",
  selectedBone: 0,
  selectedBonesForWeight: [],
  selectedIK: -1,
  selectedTransform: -1,
  selectedPath: -1,
  ikPickArmed: false,
  ikHoverBone: -1,
  boneMode: "edit",
  weightMode: "hard",
  dragTool: "auto",
  parentPickArmed: false,
  parentHoverBone: -1,
  addBoneArmed: false,
  addBoneDraft: null,
  anim: {
    duration: 5,
    time: 0,
    playing: false,
    lastTs: 0,
    animations: [],
    currentAnimId: null,
    selectedTrack: "",
    selectedKey: null,
    selectedKeys: [],
    keyClipboard: null,
    timelineDrag: null,
    timelineMarqueeEl: null,
    dirtyTracks: [],
    trackExpanded: {},
    loop: true,
    snap: false,
    fps: 30,
    timeStep: 0.01,
    mix: {
      active: false,
      fromAnimId: null,
      toAnimId: null,
      duration: 0.2,
      elapsed: 0,
      fromTime: 0,
      toTime: 0,
    },
    curveOpen: false,
    curveDrag: null,
    resizing: null,
  },
  view: { scale: 1, cx: 0, cy: 0 },
  drag: null,
  slotMesh: {
    activePoint: -1,
    activeSet: "contour",
    edgeSelection: [],
    edgeSelectionSet: "contour",
    newContourMode: "new_slot",
  },
};

const math = {
  degToRad: (d) => (d * Math.PI) / 180,
  radToDeg: (r) => (r * 180) / Math.PI,
  clamp: (v, lo, hi) => Math.max(lo, Math.min(hi, v)),
};

function setStatus(text) {
  els.status.textContent = text;
}

function createShader(type, src) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) || "Shader compilation failed");
  }
  return shader;
}

function createProgram(vsSrc, fsSrc) {
  const program = gl.createProgram();
  const vs = createShader(gl.VERTEX_SHADER, vsSrc);
  const fs = createShader(gl.FRAGMENT_SHADER, fsSrc);
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) || "Program link failed");
  }
  return program;
}

let program = null;
let loc = null;
let vbo = null;
let ibo = null;
let vao = null;

if (hasGL) {
  program = createProgram(
    isWebGL2
      ? `#version 300 es
  in vec2 aPos;
  in vec2 aUv;
  uniform vec2 uResolution;
  out vec2 vUv;
  void main() {
    vec2 z = aPos / uResolution;
    vec2 clip = z * 2.0 - 1.0;
    gl_Position = vec4(clip * vec2(1.0, -1.0), 0.0, 1.0);
    vUv = aUv;
  }`
      : `
  attribute vec2 aPos;
  attribute vec2 aUv;
  uniform vec2 uResolution;
  varying vec2 vUv;
  void main() {
    vec2 z = aPos / uResolution;
    vec2 clip = z * 2.0 - 1.0;
    gl_Position = vec4(clip * vec2(1.0, -1.0), 0.0, 1.0);
    vUv = aUv;
  }`,
    isWebGL2
      ? `#version 300 es
  precision highp float;
  in vec2 vUv;
  uniform sampler2D uTex;
  uniform float uAlpha;
  uniform vec3 uTint;
  out vec4 outColor;
  void main() {
    vec4 c = texture(uTex, vUv);
    outColor = vec4(c.rgb * uTint, c.a * uAlpha);
  }`
      : `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTex;
  uniform float uAlpha;
  uniform vec3 uTint;
  void main() {
    vec4 c = texture2D(uTex, vUv);
    gl_FragColor = vec4(c.rgb * uTint, c.a * uAlpha);
  }`
  );

  gl.useProgram(program);

  loc = {
    aPos: gl.getAttribLocation(program, "aPos"),
    aUv: gl.getAttribLocation(program, "aUv"),
    uResolution: gl.getUniformLocation(program, "uResolution"),
    uTex: gl.getUniformLocation(program, "uTex"),
    uAlpha: gl.getUniformLocation(program, "uAlpha"),
    uTint: gl.getUniformLocation(program, "uTint"),
  };

  vbo = gl.createBuffer();
  ibo = gl.createBuffer();
  vao = hasVAO ? gl.createVertexArray() : null;
}

function setupVertexLayout() {
  if (!hasGL) return;
  if (hasVAO) {
    gl.bindVertexArray(vao);
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.enableVertexAttribArray(loc.aPos);
  gl.vertexAttribPointer(loc.aPos, 2, gl.FLOAT, false, 16, 0);
  gl.enableVertexAttribArray(loc.aUv);
  gl.vertexAttribPointer(loc.aUv, 2, gl.FLOAT, false, 16, 8);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
}

if (hasGL) {
  setupVertexLayout();
  if (hasVAO) {
    gl.bindVertexArray(null);
  }
  gl.uniform1i(loc.uTex, 0);
  gl.uniform1f(loc.uAlpha, 1);
  if (loc.uTint) gl.uniform3f(loc.uTint, 1, 1, 1);
}

function bindGeometry() {
  if (!hasGL) return;
  if (hasVAO) {
    gl.bindVertexArray(vao);
  } else {
    setupVertexLayout();
  }
}

function createIdentity() {
  return [1, 0, 0, 1, 0, 0];
}

function matFromTR(tx, ty, r) {
  const c = Math.cos(r);
  const s = Math.sin(r);
  return [c, -s, s, c, tx, ty];
}

function normalizeBoneChannels(b) {
  if (!b) return b;
  if (!Number.isFinite(b.sx)) b.sx = 1;
  if (!Number.isFinite(b.sy)) b.sy = 1;
  if (!Number.isFinite(b.shx)) b.shx = 0;
  if (!Number.isFinite(b.shy)) b.shy = 0;
  return b;
}

function matFromBone(b) {
  const tx = Number(b.tx) || 0;
  const ty = Number(b.ty) || 0;
  const rot = Number(b.rot) || 0;
  const sx = Number(b.sx) || 0;
  const sy = Number(b.sy) || 0;
  const shx = Number(b.shx) || 0;
  const shy = Number(b.shy) || 0;
  const rx = rot + shx;
  const ry = rot + Math.PI * 0.5 + shy;
  return [Math.cos(rx) * sx, Math.cos(ry) * sy, Math.sin(rx) * sx, Math.sin(ry) * sy, tx, ty];
}

function mul(a, b) {
  return [
    a[0] * b[0] + a[1] * b[2],
    a[0] * b[1] + a[1] * b[3],
    a[2] * b[0] + a[3] * b[2],
    a[2] * b[1] + a[3] * b[3],
    a[0] * b[4] + a[1] * b[5] + a[4],
    a[2] * b[4] + a[3] * b[5] + a[5],
  ];
}

function invert(m) {
  const det = m[0] * m[3] - m[1] * m[2];
  if (Math.abs(det) < 1e-8) return createIdentity();
  const inv = 1 / det;
  const a = m[3] * inv;
  const b = -m[1] * inv;
  const c = -m[2] * inv;
  const d = m[0] * inv;
  const tx = -(a * m[4] + b * m[5]);
  const ty = -(c * m[4] + d * m[5]);
  return [a, b, c, d, tx, ty];
}

function transformPoint(m, x, y) {
  return {
    x: m[0] * x + m[1] * y + m[4],
    y: m[2] * x + m[3] * y + m[5],
  };
}

function matrixAngle(m) {
  return Math.atan2(m[2], m[0]);
}

function createDefaultBones(w, h) {
  const len = Math.max(24, Math.round(w * 0.22));
  return [
    { name: "root", parent: -1, tx: w * 0.2, ty: h * 0.55, rot: 0, length: len, sx: 1, sy: 1, shx: 0, shy: 0, connected: true, poseLenEditable: false },
    { name: "bone_1", parent: 0, tx: len, ty: 0, rot: 0, length: len, sx: 1, sy: 1, shx: 0, shy: 0, connected: true, poseLenEditable: false },
    { name: "bone_2", parent: 1, tx: len, ty: 0, rot: 0, length: len, sx: 1, sy: 1, shx: 0, shy: 0, connected: true, poseLenEditable: false },
  ];
}

function computeWorld(bones) {
  const world = bones.map(() => createIdentity());
  for (let i = 0; i < bones.length; i += 1) {
    const b = normalizeBoneChannels(bones[i]);
    const local = matFromBone(b);
    world[i] = b.parent >= 0 ? mul(world[b.parent], local) : local;
  }
  return world;
}

function cloneBones(bones) {
  return bones.map((b) => ({ ...b }));
}

function enforceConnectedHeads(bones) {
  for (let i = 0; i < bones.length; i += 1) {
    const b = bones[i];
    if (!b) continue;
    normalizeBoneChannels(b);
    if (typeof b.poseLenEditable !== "boolean") {
      b.poseLenEditable = false;
    }
    if (b.parent >= 0 && typeof b.connected !== "boolean") {
      b.connected = true;
    }
    if (b.parent < 0 || !b.connected) continue;
    const parent = bones[b.parent];
    if (!parent) continue;
    b.tx = parent.length;
    b.ty = 0;
  }
}

function getRigBones(m) {
  return m.rigBones;
}

function getPoseBones(m) {
  return m.poseBones;
}

function getActiveBones(m) {
  return state.boneMode === "pose" ? getPoseBones(m) : getRigBones(m);
}

function syncPoseFromRig(m) {
  m.poseBones = cloneBones(m.rigBones);
  enforceConnectedHeads(m.poseBones);
}

function getVertexCount(m) {
  return m.positions.length / 2;
}

function allocWeights(vCount, boneCount) {
  return new Float32Array(vCount * boneCount);
}

function pointToSegmentDistanceSquared(px, py, ax, ay, bx, by) {
  const vx = bx - ax;
  const vy = by - ay;
  const wx = px - ax;
  const wy = py - ay;
  const vv = vx * vx + vy * vy;
  const t = vv > 1e-8 ? math.clamp((wx * vx + wy * vy) / vv, 0, 1) : 0;
  const cx = ax + vx * t;
  const cy = ay + vy * t;
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy;
}

function getBoneWorldEndpointsFromBones(bones, i, world = null) {
  const w = world || computeWorld(bones);
  const b = bones[i];
  const head = transformPoint(w[i], 0, 0);
  const tip = transformPoint(w[i], b.length, 0);
  return { head, tip };
}

function setBoneFromWorldEndpoints(bones, boneIndex, head, tip) {
  const b = bones[boneIndex];
  const world = computeWorld(bones);
  const parentWorld = b.parent >= 0 ? world[b.parent] : createIdentity();
  const invParent = invert(parentWorld);

  const localHead = transformPoint(invParent, head.x, head.y);
  b.tx = localHead.x;
  b.ty = localHead.y;

  const dx = tip.x - head.x;
  const dy = tip.y - head.y;
  b.length = Math.max(1, Math.hypot(dx, dy));
  const worldAngle = Math.atan2(dy, dx);
  b.rot = worldAngle - matrixAngle(parentWorld);
}

function autoWeightMesh(m) {
  const vCount = getVertexCount(m);
  const bones = getRigBones(m);
  enforceConnectedHeads(bones);
  const boneCount = bones.length;
  if (boneCount === 0) {
    m.weights = new Float32Array(0);
    return;
  }
  const world = computeWorld(bones);
  const segments = bones.map((b, i) => {
    const a = transformPoint(world[i], 0, 0);
    const e = transformPoint(world[i], b.length, 0);
    return { ax: a.x, ay: a.y, bx: e.x, by: e.y, len: Math.max(10, b.length) };
  });

  m.weights = allocWeights(vCount, boneCount);

  const hardMode = state.weightMode === "hard";
  for (let i = 0; i < vCount; i += 1) {
    const px = m.positions[i * 2];
    const py = m.positions[i * 2 + 1];

    let bestBone = 0;
    let bestD2 = Number.POSITIVE_INFINITY;
    let sum = 0;
    for (let b = 0; b < boneCount; b += 1) {
      const s = segments[b];
      const d2 = pointToSegmentDistanceSquared(px, py, s.ax, s.ay, s.bx, s.by);
      if (d2 < bestD2) {
        bestD2 = d2;
        bestBone = b;
      }
      if (hardMode) continue;
      const falloff = 0.35 * s.len;
      const w = 1 / (1 + d2 / (falloff * falloff));
      m.weights[i * boneCount + b] = w;
      sum += w;
    }

    if (hardMode) {
      m.weights[i * boneCount + bestBone] = 1;
      continue;
    }

    if (sum < 1e-8) {
      m.weights[i * boneCount] = 1;
      continue;
    }

    for (let b = 0; b < boneCount; b += 1) {
      m.weights[i * boneCount + b] /= sum;
    }
  }
}

function autoWeightForPositions(positions, bones, allowedBones = null) {
  const vCount = positions.length / 2;
  enforceConnectedHeads(bones);
  const boneCount = bones.length;
  if (boneCount === 0) return new Float32Array(0);
  const allowSet = allowedBones && allowedBones.length > 0 ? new Set(allowedBones) : null;
  const world = computeWorld(bones);
  const segments = bones.map((b, i) => {
    const a = transformPoint(world[i], 0, 0);
    const e = transformPoint(world[i], b.length, 0);
    return { ax: a.x, ay: a.y, bx: e.x, by: e.y, len: Math.max(10, b.length) };
  });
  const weights = allocWeights(vCount, boneCount);
  const hardMode = state.weightMode === "hard";
  for (let i = 0; i < vCount; i += 1) {
    const px = positions[i * 2];
    const py = positions[i * 2 + 1];
    let bestBone = 0;
    let bestD2 = Number.POSITIVE_INFINITY;
    let sum = 0;
    for (let b = 0; b < boneCount; b += 1) {
      if (allowSet && !allowSet.has(b)) continue;
      const s = segments[b];
      const d2 = pointToSegmentDistanceSquared(px, py, s.ax, s.ay, s.bx, s.by);
      if (d2 < bestD2) {
        bestD2 = d2;
        bestBone = b;
      }
      if (hardMode) continue;
      const falloff = 0.35 * s.len;
      const w = 1 / (1 + d2 / (falloff * falloff));
      weights[i * boneCount + b] = w;
      sum += w;
    }
    if (hardMode) {
      const hb = allowSet && !allowSet.has(bestBone) ? [...allowSet][0] : bestBone;
      if (hb != null) weights[i * boneCount + hb] = 1;
      continue;
    }
    if (sum < 1e-8) {
      const fb = allowSet ? [...allowSet][0] : 0;
      if (fb != null) weights[i * boneCount + fb] = 1;
      continue;
    }
    for (let b = 0; b < boneCount; b += 1) {
      weights[i * boneCount + b] /= sum;
    }
  }
  return weights;
}

function setSlotSingleBoneWeight(slot, m, boneIndex) {
  if (!slot || !m) return;
  ensureSlotMeshData(slot, m);
  const sm = slot.meshData;
  const vCount = sm.positions.length / 2;
  const boneCount = m.rigBones.length;
  const weights = allocWeights(vCount, boneCount);
  if (boneIndex >= 0 && boneIndex < boneCount) {
    for (let i = 0; i < vCount; i += 1) {
      weights[i * boneCount + boneIndex] = 1;
    }
  }
  sm.weights = weights;
  slot.useWeights = true;
  slot.weightBindMode = "single";
  slot.weightMode = "single";
  slot.influenceBones = boneIndex >= 0 ? [boneIndex] : [];
}

function getSlotWeightMode(slot) {
  if (!slot) return "single";
  if (slot.weightMode === "single" || slot.weightMode === "weighted" || slot.weightMode === "free") {
    return slot.weightMode;
  }
  if (slot.useWeights === false || slot.weightBindMode === "none") return "free";
  if (slot.weightBindMode === "auto") return "weighted";
  return "single";
}

function getSlotInfluenceBones(slot, m) {
  if (!slot || !m) return [];
  const boneCount = m.rigBones.length;
  if (Array.isArray(slot.influenceBones) && slot.influenceBones.length > 0) {
    const filtered = slot.influenceBones.filter((i) => Number.isFinite(i) && i >= 0 && i < boneCount);
    if (filtered.length > 0) return [...new Set(filtered)];
  }
  const b = Number(slot.bone);
  if (Number.isFinite(b) && b >= 0 && b < boneCount) return [b];
  return boneCount > 0 ? [0] : [];
}

function rebuildSlotWeights(slot, m) {
  if (!slot || !m) return;
  ensureSlotMeshData(slot, m);
  const mode = getSlotWeightMode(slot);
  if (mode === "free") {
    slot.useWeights = false;
    slot.weightBindMode = "none";
    slot.weightMode = "free";
    slot.meshData.weights = new Float32Array(0);
    return;
  }
  if (mode === "single") {
    const bi = Number(slot.bone);
    setSlotSingleBoneWeight(slot, m, Number.isFinite(bi) ? bi : -1);
    slot.influenceBones = Number.isFinite(bi) && bi >= 0 && bi < m.rigBones.length ? [bi] : [];
    return;
  }
  slot.useWeights = true;
  const allowed = getSlotInfluenceBones(slot, m);
  slot.influenceBones = allowed;
  slot.meshData.weights = autoWeightForPositions(slot.meshData.positions, m.rigBones, allowed);
  slot.weightBindMode = "auto";
  slot.weightMode = "weighted";
}

function createSlotMeshData(rect, docW, docH, baseCols, baseRows) {
  const cellW = Math.max(1, docW / Math.max(2, baseCols));
  const cellH = Math.max(1, docH / Math.max(2, baseRows));
  const cols = Math.max(1, Math.round(rect.w / cellW));
  const rows = Math.max(1, Math.round(rect.h / cellH));
  const vCount = (cols + 1) * (rows + 1);
  const positions = new Float32Array(vCount * 2);
  const uvs = new Float32Array(vCount * 2);
  const offsets = new Float32Array(vCount * 2);
  const index = [];
  let idx = 0;
  for (let y = 0; y <= rows; y += 1) {
    const ty = y / rows;
    for (let x = 0; x <= cols; x += 1) {
      const tx = x / cols;
      positions[idx * 2] = rect.x + tx * rect.w;
      positions[idx * 2 + 1] = rect.y + ty * rect.h;
      uvs[idx * 2] = tx;
      uvs[idx * 2 + 1] = ty;
      idx += 1;
    }
  }
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const i0 = y * (cols + 1) + x;
      const i1 = i0 + 1;
      const i2 = i0 + (cols + 1);
      const i3 = i2 + 1;
      index.push(i0, i2, i1, i1, i2, i3);
    }
  }
  return {
    cols,
    rows,
    positions,
    uvs,
    offsets,
    baseOffsets: new Float32Array(offsets),
    weights: new Float32Array(0),
    indices: new Uint16Array(index),
    deformedLocal: new Float32Array(vCount * 2),
    deformedScreen: new Float32Array(vCount * 2),
    interleaved: new Float32Array(vCount * 4),
  };
}

function createMesh(cols, rows, w, h) {
  const vCount = (cols + 1) * (rows + 1);
  const positions = new Float32Array(vCount * 2);
  const uvs = new Float32Array(vCount * 2);
  const offsets = new Float32Array(vCount * 2);

  let idx = 0;
  for (let y = 0; y <= rows; y += 1) {
    const ty = y / rows;
    for (let x = 0; x <= cols; x += 1) {
      const tx = x / cols;
      positions[idx * 2] = tx * w;
      positions[idx * 2 + 1] = ty * h;
      uvs[idx * 2] = tx;
      uvs[idx * 2 + 1] = ty;
      idx += 1;
    }
  }

  const index = [];
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const i0 = y * (cols + 1) + x;
      const i1 = i0 + 1;
      const i2 = i0 + (cols + 1);
      const i3 = i2 + 1;
      index.push(i0, i2, i1, i1, i2, i3);
    }
  }

  const rigBones = [];
  const mesh = {
    cols,
    rows,
    positions,
    uvs,
    offsets,
    baseOffsets: new Float32Array(offsets),
    weights: allocWeights(vCount, rigBones.length),
    indices: new Uint16Array(index),
    rigBones,
    poseBones: cloneBones(rigBones),
    bindWorld: null,
    invBind: null,
    deformedLocal: new Float32Array(vCount * 2),
    skinnedLocal: new Float32Array(vCount * 2),
    deformedScreen: new Float32Array(vCount * 2),
    interleaved: new Float32Array(vCount * 4),
    ikConstraints: [],
    transformConstraints: [],
    pathConstraints: [],
  };

  syncBindPose(mesh);
  return mesh;
}

function syncBindPose(m) {
  enforceConnectedHeads(m.rigBones);
  const world = computeWorld(m.rigBones);
  m.bindWorld = world;
  m.invBind = world.map(invert);
}

function rebuildMesh() {
  if (!state.sourceCanvas) return;
  const cols = math.clamp(Number(els.gridX.value) || 24, 2, 120);
  const rows = math.clamp(Number(els.gridY.value) || 24, 2, 120);
  state.mesh = createMesh(cols, rows, state.imageWidth, state.imageHeight);
  state.selectedBone = 0;
  state.selectedBonesForWeight = [];
  state.selectedIK = -1;
  state.selectedTransform = -1;
  state.selectedPath = -1;
  state.boneMode = els.boneMode.value || "edit";
  state.weightMode = els.weightMode.value || "hard";
  state.anim.animations = [createAnimation("Anim 1")];
  state.anim.currentAnimId = state.anim.animations[0].id;
  state.anim.selectedTrack = "";
  state.anim.selectedKey = null;
  state.anim.selectedKeys = [];
  state.anim.trackExpanded = {};
  state.anim.playing = false;
  state.anim.mix.active = false;
  state.anim.dirtyTracks = [];
  state.addBoneArmed = false;
  state.addBoneDraft = null;
  els.addBoneBtn.textContent = "Add Bone";
  setAnimTime(0);
  refreshAnimationUI();
  updatePlaybackButtons();
  for (const s of state.slots) {
    if (!s) continue;
    s.meshData = null;
    ensureSlotMeshData(s, state.mesh);
  }
  rebuildSlotTriangleIndices();
  if (hasGL) {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, state.mesh.indices, gl.STATIC_DRAW);
  }
  updateBoneUI();
  setStatus(`Mesh rebuilt: ${cols} x ${rows}, bones: ${state.mesh.rigBones.length}`);
}

function refreshWeightsForBoneCount() {
  const m = state.mesh;
  if (!m) return;
  const vCount = getVertexCount(m);
  m.weights = allocWeights(vCount, m.rigBones.length);
  autoWeightMesh(m);
  for (const s of state.slots) {
    if (!s) continue;
    rebuildSlotWeights(s, m);
  }
}

function autoWeightActiveSlot() {
  const m = state.mesh;
  if (!m) return false;
  if (state.slots.length === 0) {
    autoWeightMesh(m);
    return true;
  }
  const slot = getActiveSlot();
  if (!slot) return false;
  ensureSlotMeshData(slot, m);
  const picked = getSelectedBonesForWeight(m);
  // Auto-bind should follow current multi-selection explicitly.
  // If no multi-selection exists, fallback to slot's current influence set.
  slot.influenceBones = picked.length > 0 ? [...new Set(picked)] : getSlotInfluenceBones(slot, m);
  slot.useWeights = true;
  slot.weightBindMode = "auto";
  slot.weightMode = "weighted";
  slot.meshData.weights = autoWeightForPositions(slot.meshData.positions, m.rigBones, getSlotInfluenceBones(slot, m));
  refreshSlotUI();
  return true;
}

function isValidParent(bones, index, parent) {
  if (parent < 0 || parent >= bones.length) return true;
  if (parent === index) return false;
  let p = parent;
  while (p >= 0) {
    if (p === index) return false;
    p = bones[p].parent;
  }
  return true;
}

function ensureSelectedBoneInRange() {
  const m = state.mesh;
  if (!m) return;
  if (m.rigBones.length === 0) {
    state.selectedBone = -1;
    state.selectedBonesForWeight = [];
  } else {
    if (!Number.isFinite(state.selectedBone) || state.selectedBone < -1) {
      state.selectedBone = -1;
    } else if (state.selectedBone >= m.rigBones.length) {
      state.selectedBone = m.rigBones.length - 1;
    }
    state.selectedBonesForWeight = getSelectedBonesForWeight(m);
    if (state.selectedBone >= 0 && state.selectedBonesForWeight.length === 0) {
      state.selectedBonesForWeight = [state.selectedBone];
    }
  }
}

function updateBoneSelectors() {
  const m = state.mesh;
  els.boneSelect.innerHTML = "";
  els.boneParent.innerHTML = "";
  els.addBoneParent.innerHTML = "";
  if (!m) return;
  const bones = getActiveBones(m);

  for (let i = 0; i < bones.length; i += 1) {
    const b = bones[i];
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = `${i}: ${b.name}${b.connected ? " [C]" : " [D]"}`;
    els.boneSelect.appendChild(opt);
  }

  const none = document.createElement("option");
  none.value = "-1";
  none.textContent = "-1: None (Root)";
  els.boneParent.appendChild(none);
  const addNone = document.createElement("option");
  addNone.value = "-1";
  addNone.textContent = "-1: None (Root)";
  els.addBoneParent.appendChild(addNone);

  for (let i = 0; i < bones.length; i += 1) {
    const b = bones[i];
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = `${i}: ${b.name}`;
    els.boneParent.appendChild(opt);
    const addOpt = document.createElement("option");
    addOpt.value = String(i);
    addOpt.textContent = `${i}: ${b.name}`;
    els.addBoneParent.appendChild(addOpt);
  }
  refreshIKUI();
  refreshTransformUI();
  refreshPathUI();
}

function renderBoneTree() {
  const m = state.mesh;
  if (!els.boneTree) return;
  els.boneTree.innerHTML = "";
  const bones = m && m.rigBones ? m.rigBones : [];
  const hasBones = bones.length > 0;
  if (!hasBones && state.slots.length === 0) {
    els.boneTree.innerHTML = "<div class='muted'>No bones or slots yet.</div>";
    return;
  }

  const slotsByBone = new Map();
  for (let i = 0; i < state.slots.length; i += 1) {
    const s = state.slots[i];
    const b = Number.isFinite(s.bone) && s.bone >= 0 && s.bone < bones.length ? s.bone : -1;
    if (!slotsByBone.has(b)) slotsByBone.set(b, []);
    slotsByBone.get(b).push(i);
  }
  const byParent = new Map();
  const ikBones = getIkConstrainedBoneSet(m);
  const ikTargets = getIkTargetBoneSet(m);
  const tfcBones = getTransformConstrainedBoneSet(m);
  const tfcTargets = getTransformTargetBoneSet(m);
  const pathBones = getPathConstrainedBoneSet(m);
  const pathTargets = getPathTargetBoneSet(m);
  for (let i = 0; i < bones.length; i += 1) {
    const p = bones[i].parent;
    if (!byParent.has(p)) byParent.set(p, []);
    byParent.get(p).push(i);
  }

  function appendSlotRows(parentBone, depth) {
    const list = slotsByBone.get(parentBone) || [];
    for (const si of list) {
      const s = state.slots[si];
      const row = document.createElement("div");
      row.className = `tree-item tree-slot${state.activeSlot === si ? " selected" : ""}`;
      row.style.marginLeft = `${depth * 14 + 16}px`;
      row.dataset.slotIndex = String(si);
      const eye = document.createElement("button");
      eye.type = "button";
      eye.className = "slot-eye";
      eye.dataset.slotEye = String(si);
      eye.title = s.visible === false ? "Show slot" : "Hide slot";
      eye.textContent = s.visible === false ? "◌" : "◉";
      const name = document.createElement("span");
      name.textContent = ` Slot: ${s.name}`;
      row.appendChild(eye);
      row.appendChild(name);
      els.boneTree.appendChild(row);
    }
  }

  function walk(parent, depth) {
    const kids = byParent.get(parent) || [];
    for (const i of kids) {
      const b = bones[i];
      const row = document.createElement("div");
      const picked = state.selectedBonesForWeight && state.selectedBonesForWeight.includes(i);
      const parentCandidate = state.parentPickArmed && state.parentHoverBone === i;
      const ikTargetCandidate = state.ikPickArmed && state.ikHoverBone === i;
      const isIK = ikBones.has(i);
      const isIKTarget = ikTargets.has(i);
      const isTFC = tfcBones.has(i);
      const isTFCTarget = tfcTargets.has(i);
      const isPath = pathBones.has(i);
      const isPathTarget = pathTargets.has(i);
      row.className = `tree-item${state.selectedBone === i ? " selected" : ""}${picked ? " weight-picked" : ""}${
        parentCandidate ? " parent-candidate" : ""
      }${ikTargetCandidate ? " ik-target-candidate" : ""}${isIK ? " ik-bone" : ""}${isIKTarget ? " ik-target-bone" : ""}${
        isTFC ? " ik-bone" : ""
      }${isTFCTarget ? " ik-target-bone" : ""}${isPath ? " ik-bone" : ""}${isPathTarget ? " ik-target-bone" : ""}`;
      row.style.marginLeft = `${depth * 14}px`;
      row.dataset.boneIndex = String(i);
      row.textContent = `Bone: ${b.name}${isIK ? " [IK]" : ""}${isIKTarget ? " [IK-T]" : ""}${isTFC ? " [TC]" : ""}${
        isTFCTarget ? " [TC-T]" : ""
      }${isPath ? " [PATH]" : ""}${isPathTarget ? " [PATH-T]" : ""}`;
      els.boneTree.appendChild(row);
      appendSlotRows(i, depth);
      walk(i, depth + 1);
    }
  }

  if (hasBones) {
    walk(-1, 0);
    appendSlotRows(-1, 0);
  } else {
    appendSlotRows(-1, 0);
  }
}

function updateBoneUI() {
  const m = state.mesh;
  if (!m) return;

  ensureSelectedBoneInRange();
  updateBoneSelectors();
  const bones = getActiveBones(m);

  const i = state.selectedBone;
  const b = bones[i];
  if (!b) {
    els.boneName.value = "";
    els.boneParent.value = "-1";
    els.boneConnect.value = "true";
    els.bonePoseLen.value = "false";
    els.boneTx.value = "0";
    els.boneTy.value = "0";
    els.boneRot.value = "0";
    els.boneLen.value = "1";
    if (els.boneScaleX) els.boneScaleX.value = "1";
    if (els.boneScaleY) els.boneScaleY.value = "1";
    if (els.boneShearX) els.boneShearX.value = "0";
    if (els.boneShearY) els.boneShearY.value = "0";
    els.boneHeadX.value = "0";
    els.boneHeadY.value = "0";
    els.boneTipX.value = "0";
    els.boneTipY.value = "0";
    refreshIKUI();
    refreshTrackSelect();
    renderTimelineTracks();
    refreshSlotUI();
    renderBoneTree();
    return;
  }
  normalizeBoneChannels(b);
  state.anim.trackExpanded[i] = true;

  els.boneSelect.value = String(i);
  els.boneName.value = b.name;
  els.boneParent.value = String(b.parent);
  if (!els.addBoneParent.value) {
    els.addBoneParent.value = String(i);
  }
  els.boneConnect.value = b.connected ? "true" : "false";
  els.bonePoseLen.value = b.poseLenEditable === false ? "false" : "true";
  els.boneTx.value = String(Math.round(b.tx));
  els.boneTy.value = String(Math.round(b.ty));
  els.boneRot.value = String(Math.round(math.radToDeg(b.rot)));
  els.boneLen.value = String(Math.max(1, Math.round(b.length)));
  if (els.boneScaleX) els.boneScaleX.value = String((Number(b.sx) || 1).toFixed(3));
  if (els.boneScaleY) els.boneScaleY.value = String((Number(b.sy) || 1).toFixed(3));
  if (els.boneShearX) els.boneShearX.value = String(math.radToDeg(Number(b.shx) || 0).toFixed(2));
  if (els.boneShearY) els.boneShearY.value = String(math.radToDeg(Number(b.shy) || 0).toFixed(2));
  const ep = getBoneWorldEndpointsFromBones(bones, i);
  els.boneHeadX.value = String(Math.round(ep.head.x));
  els.boneHeadY.value = String(Math.round(ep.head.y));
  els.boneTipX.value = String(Math.round(ep.tip.x));
  els.boneTipY.value = String(Math.round(ep.tip.y));

  const poseMode = state.boneMode === "pose";
  const connectedToParent = b.parent >= 0 && b.connected;
  const poseLenLocked = poseMode && b.poseLenEditable === false;
  els.boneConnect.disabled = b.parent < 0;
  els.boneParent.disabled = poseMode;
  els.addBoneBtn.disabled = poseMode;
  els.addBoneParent.disabled = poseMode;
  els.addBoneConnect.disabled = poseMode;
  els.deleteBoneBtn.disabled = poseMode;
  els.weightMode.disabled = poseMode;
  els.autoWeightBtn.disabled = poseMode;
  els.boneTx.disabled = connectedToParent;
  els.boneTy.disabled = connectedToParent;
  els.boneHeadX.disabled = connectedToParent;
  els.boneHeadY.disabled = connectedToParent;
  els.boneLen.disabled = poseLenLocked;
  if (els.boneScaleX) els.boneScaleX.disabled = false;
  if (els.boneScaleY) els.boneScaleY.disabled = false;
  if (els.boneShearX) els.boneShearX.disabled = false;
  if (els.boneShearY) els.boneShearY.disabled = false;
  refreshIKUI();
  refreshTrackSelect();
  renderTimelineTracks();
  refreshSlotUI();
  renderBoneTree();
}

function resetPose() {
  if (!state.mesh) return;
  if (state.boneMode === "edit") {
    state.mesh.rigBones = [];
    syncPoseFromRig(state.mesh);
    syncBindPose(state.mesh);
    refreshWeightsForBoneCount();
    state.selectedBone = -1;
    updateBoneUI();
    return;
  }
  syncPoseFromRig(state.mesh);
  updateBoneUI();
}

function resetVertexOffsets() {
  if (!state.mesh) return;
  if (state.slots.length > 0) {
    const slot = getActiveSlot();
    if (!slot) return;
    ensureSlotMeshData(slot, state.mesh);
    slot.meshData.offsets.set(slot.meshData.baseOffsets);
  } else {
    state.mesh.offsets.set(state.mesh.baseOffsets);
  }
  markDirtyTrack(VERTEX_TRACK_ID);
}

function addBone(opts = null) {
  const m = state.mesh;
  if (!m || state.boneMode !== "edit") return;
  const bones = getRigBones(m);

  const parent =
    opts && typeof opts.parent === "number"
      ? opts.parent
      : state.selectedBone >= 0
        ? state.selectedBone
        : -1;
  const safeParent = parent >= 0 && parent < bones.length ? parent : -1;
  const parentBone = safeParent >= 0 ? bones[safeParent] : null;
  const len = Math.max(16, Math.round(state.imageWidth * 0.16));
  const connected = opts && typeof opts.connected === "boolean" ? opts.connected : parent >= 0;

  bones.push({
    name: `bone_${bones.length}`,
    parent: safeParent,
    tx: parentBone ? parentBone.length : state.imageWidth * 0.5,
    ty: 0,
    rot: 0,
    length: len,
    sx: 1,
    sy: 1,
    shx: 0,
    shy: 0,
    connected,
    poseLenEditable: false,
  });

  const idx = bones.length - 1;
  if (opts && opts.head && opts.tail) {
    const world = computeWorld(bones);
    const head = safeParent >= 0 && connected ? transformPoint(world[safeParent], bones[safeParent].length, 0) : opts.head;
    setBoneFromWorldEndpoints(bones, idx, head, opts.tail);
  }

  state.selectedBone = idx;
  syncPoseFromRig(m);
  syncBindPose(m);
  refreshWeightsForBoneCount();
  updateBoneUI();
  return idx;
}

function deleteBone() {
  const m = state.mesh;
  if (!m || state.boneMode !== "edit") return;
  const bones = getRigBones(m);
  if (bones.length <= 1) return;

  const removed = state.selectedBone;
  bones.splice(removed, 1);

  for (const b of bones) {
    if (b.parent === removed) {
      b.parent = -1;
    } else if (b.parent > removed) {
      b.parent -= 1;
    }
  }
  for (const s of state.slots) {
    if (!s) continue;
    if (s.bone === removed) s.bone = -1;
    else if (s.bone > removed) s.bone -= 1;
  }
  remapIKAfterBoneRemoved(m, removed);
  ensureSlotsHaveBoneBinding();

  state.selectedBone = Math.max(0, removed - 1);
  state.selectedBonesForWeight = [state.selectedBone];
  syncPoseFromRig(m);
  syncBindPose(m);
  refreshWeightsForBoneCount();
  updateBoneUI();
}

function commitRigEdit(m, reweight = false) {
  syncPoseFromRig(m);
  syncBindPose(m);
  if (reweight) {
    autoWeightMesh(m);
    for (const s of state.slots) {
      if (!s) continue;
      rebuildSlotWeights(s, m);
    }
  }
}

function getBonesForCurrentMode(m) {
  return state.boneMode === "pose" ? getPoseBones(m) : getRigBones(m);
}

function updateTexture() {
  if (!state.sourceCanvas) return;
  if (!hasGL) return;
  if (!state.texture) state.texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, state.texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, state.sourceCanvas);
}

function makeCanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}

function normalizeSlotCanvas(src, targetW, targetH) {
  const c = makeCanvas(targetW, targetH);
  const ctx = c.getContext("2d");
  if (!ctx) return c;
  if (src.width === targetW && src.height === targetH) {
    ctx.drawImage(src, 0, 0);
    return c;
  }
  ctx.drawImage(src, 0, 0, src.width, src.height, 0, 0, targetW, targetH);
  return c;
}

function getCanvasAlphaBounds(canvas) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const w = canvas.width;
  const h = canvas.height;
  const img = ctx.getImageData(0, 0, w, h).data;
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const a = img[(y * w + x) * 4 + 3];
      if (a <= 0) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < minX || maxY < minY) return null;
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

function refreshSlotUI() {
  if (els.slotSelect) {
    els.slotSelect.innerHTML = "";
    for (let i = 0; i < state.slots.length; i += 1) {
      const s = state.slots[i];
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = `${i}: ${s.name}`;
      els.slotSelect.appendChild(opt);
    }
    if (state.activeSlot >= 0 && state.activeSlot < state.slots.length) {
      els.slotSelect.value = String(state.activeSlot);
    }
  }
  if (els.slotViewMode) {
    els.slotViewMode.value = state.slotViewMode;
  }
  if (els.slotMeshNewMode) {
    els.slotMeshNewMode.value = state.slotMesh.newContourMode === "reset_current" ? "reset_current" : "new_slot";
  }
  if (els.slotBone) {
    els.slotBone.innerHTML = "";
    const none = document.createElement("option");
    none.value = "-1";
    none.textContent = "-1: Unbound";
    els.slotBone.appendChild(none);
    if (state.mesh && state.mesh.rigBones) {
      for (let i = 0; i < state.mesh.rigBones.length; i += 1) {
        const b = state.mesh.rigBones[i];
        const opt = document.createElement("option");
        opt.value = String(i);
        opt.textContent = `${i}: ${b.name}`;
        els.slotBone.appendChild(opt);
      }
    }
  }
  if (els.slotInfluenceBones) {
    els.slotInfluenceBones.innerHTML = "";
    if (state.mesh && state.mesh.rigBones) {
      for (let i = 0; i < state.mesh.rigBones.length; i += 1) {
        const b = state.mesh.rigBones[i];
        const opt = document.createElement("option");
        opt.value = String(i);
        opt.textContent = `${i}: ${b.name}`;
        els.slotInfluenceBones.appendChild(opt);
      }
    }
  }
  const s = getActiveSlot();
  if (els.slotName) els.slotName.value = s ? s.name : "";
  if (els.slotBone) els.slotBone.value = String(s ? s.bone : -1);
  if (els.slotVisible) els.slotVisible.checked = !!(s ? s.visible !== false : true);
  if (els.slotAlpha) els.slotAlpha.value = String(s ? math.clamp(Number(s.alpha) || 1, 0, 1) : 1);
  if (els.slotColor) {
    els.slotColor.value = s ? rgb01ToHex(Number(s.r) || 1, Number(s.g) || 1, Number(s.b) || 1) : "#ffffff";
  }
  if (els.slotWeightMode) els.slotWeightMode.value = getSlotWeightMode(s);
  if (els.slotInfluenceBones && s && state.mesh) {
    const allow = new Set(getSlotInfluenceBones(s, state.mesh).map((x) => String(x)));
    for (const opt of els.slotInfluenceBones.options) {
      opt.selected = allow.has(opt.value);
    }
    els.slotInfluenceBones.disabled = getSlotWeightMode(s) !== "weighted";
  } else if (els.slotInfluenceBones) {
    els.slotInfluenceBones.disabled = true;
  }
  if (els.slotTx) els.slotTx.value = String(Math.round(s ? Number(s.tx) || 0 : 0));
  if (els.slotTy) els.slotTy.value = String(Math.round(s ? Number(s.ty) || 0 : 0));
  if (els.slotRot) els.slotRot.value = String(Math.round(math.radToDeg(s ? Number(s.rot) || 0 : 0)));
}

function updateWorkspaceUI() {
  const isSlotMesh = state.editMode === "slotmesh";
  const setVisible = (el, show) => {
    if (!el) return;
    el.style.display = show ? "" : "none";
  };
  if (els.editMode) els.editMode.value = state.editMode;
  const isSkeleton = state.editMode === "skeleton";
  const isVertex = state.editMode === "vertex";
  const isRigEdit = !isSlotMesh && isSkeleton && state.boneMode === "edit";
  const isRigPose = !isSlotMesh && isSkeleton && state.boneMode === "pose";
  const isRigVertex = !isSlotMesh && isVertex;

  const tabVisible = {
    setup: !isSlotMesh,
    rig: isRigEdit,
    ik: !isSlotMesh && isSkeleton,
    constraint: !isSlotMesh && isSkeleton,
    path: !isSlotMesh && isSkeleton,
    skin: isRigEdit || isRigVertex,
    tools: !isSlotMesh,
    slotmesh: isSlotMesh,
  };
  const visibleTabs = Object.keys(tabVisible).filter((k) => tabVisible[k]);
  if (!visibleTabs.includes(state.leftToolTab)) state.leftToolTab = visibleTabs[0] || "setup";

  const tabButtonById = {
    setup: els.leftTabSetup,
    rig: els.leftTabRig,
    ik: els.leftTabIK,
    constraint: els.leftTabConstraint,
    path: els.leftTabPath,
    skin: els.leftTabSkin,
    tools: els.leftTabTools,
    slotmesh: els.leftTabSlotMesh,
  };
  const tabPanelById = {
    setup: els.leftMeshSetup,
    rig: els.leftRigBuild,
    ik: els.leftIKTools,
    constraint: els.leftConstraintTools,
    path: els.leftPathTools,
    skin: els.leftSkinTools,
    tools: els.leftGeneralTools,
    slotmesh: els.slotMeshTools,
  };
  if (els.leftToolTabs) setVisible(els.leftToolTabs, visibleTabs.length > 1);
  for (const [tab, btn] of Object.entries(tabButtonById)) {
    const show = !!tabVisible[tab];
    setVisible(btn, show);
    if (btn) btn.classList.toggle("active", show && tab === state.leftToolTab);
  }
  for (const [tab, panel] of Object.entries(tabPanelById)) {
    setVisible(panel, !!tabVisible[tab] && tab === state.leftToolTab);
  }

  if (els.leftToolModeHint) {
    if (isSlotMesh) {
      els.leftToolModeHint.textContent = "Slot Mesh mode: only slot mesh related tabs are shown.";
    } else if (isRigEdit) {
      els.leftToolModeHint.textContent = "Rig Edit mode: rig, IK, constraint, path, skin, and tools tabs are shown.";
    } else if (isRigPose) {
      els.leftToolModeHint.textContent = "Pose mode: IK, constraint, path, setup, and tools tabs are shown.";
    } else if (isRigVertex) {
      els.leftToolModeHint.textContent = "Vertex mode: skin/tools tabs are shown.";
    } else {
      els.leftToolModeHint.textContent = "Mode-aware tabs";
    }
  }
}

function setupLeftToolTabs() {
  const bind = (el, tab) => {
    if (!el) return;
    el.addEventListener("click", () => {
      state.leftToolTab = tab;
      updateWorkspaceUI();
    });
  };
  bind(els.leftTabSetup, "setup");
  bind(els.leftTabRig, "rig");
  bind(els.leftTabIK, "ik");
  bind(els.leftTabConstraint, "constraint");
  bind(els.leftTabPath, "path");
  bind(els.leftTabSkin, "skin");
  bind(els.leftTabTools, "tools");
  bind(els.leftTabSlotMesh, "slotmesh");
}

function setActiveSlot(index) {
  if (!Number.isFinite(index) || index < 0 || index >= state.slots.length) return;
  state.activeSlot = index;
  const slot = state.slots[index];
  ensureSlotContour(slot);
  state.slotMesh.activePoint = -1;
  state.slotMesh.activeSet = "contour";
  state.slotMesh.edgeSelection = [];
  state.slotMesh.edgeSelectionSet = "contour";
  state.sourceCanvas = slot.canvas;
  state.imageWidth = Number.isFinite(slot.docWidth) ? slot.docWidth : slot.canvas.width;
  state.imageHeight = Number.isFinite(slot.docHeight) ? slot.docHeight : slot.canvas.height;
  updateTexture();
  refreshSlotUI();
  renderBoneTree();
}

function addSlotEntry(entry, activate = true) {
  const hasProjectSize = state.imageWidth > 0 && state.imageHeight > 0;
  const docW = Number.isFinite(entry.docWidth) ? entry.docWidth : entry.canvas.width;
  const docH = Number.isFinite(entry.docHeight) ? entry.docHeight : entry.canvas.height;
  const targetW = hasProjectSize ? state.imageWidth : docW;
  const targetH = hasProjectSize ? state.imageHeight : docH;
  const sx = docW > 0 ? targetW / docW : 1;
  const sy = docH > 0 ? targetH / docH : 1;
  const srcRect = entry.rect || { x: 0, y: 0, w: docW, h: docH };
  const rect = {
    x: srcRect.x * sx,
    y: srcRect.y * sy,
    w: Math.max(1, srcRect.w * sx),
    h: Math.max(1, srcRect.h * sy),
  };
  const canvas = normalizeSlotCanvas(entry.canvas, Math.max(1, rect.w), Math.max(1, rect.h));
  const defaultBone = state.mesh && state.selectedBone >= 0 ? state.selectedBone : -1;
  const slot = {
    id: entry.id || makeSlotId(),
    name: entry.name || `slot_${state.slots.length}`,
    attachmentName: String(entry.attachmentName || "main"),
    canvas,
    bone: Number.isFinite(entry.bone) ? entry.bone : defaultBone,
    visible: entry.visible !== false,
    alpha: Number.isFinite(entry.alpha) ? math.clamp(entry.alpha, 0, 1) : 1,
    r: Number.isFinite(entry.r) ? math.clamp(entry.r, 0, 1) : 1,
    g: Number.isFinite(entry.g) ? math.clamp(entry.g, 0, 1) : 1,
    b: Number.isFinite(entry.b) ? math.clamp(entry.b, 0, 1) : 1,
    tx: Number.isFinite(entry.tx) ? entry.tx : 0,
    ty: Number.isFinite(entry.ty) ? entry.ty : 0,
    rot: Number.isFinite(entry.rot) ? entry.rot : 0,
    rect,
    docWidth: targetW,
    docHeight: targetH,
    _indices: null,
    meshData: null,
    useWeights: entry.useWeights === true,
    weightBindMode: entry.weightBindMode || (entry.useWeights ? "single" : "none"),
    weightMode:
      entry.weightMode ||
      (entry.weightBindMode === "auto" ? "weighted" : entry.useWeights === false ? "free" : "single"),
    influenceBones: Array.isArray(entry.influenceBones) ? entry.influenceBones.filter((v) => Number.isFinite(v)) : [],
  };
  if (state.mesh) {
    slot.meshData = createSlotMeshData(rect, targetW, targetH, state.mesh.cols, state.mesh.rows);
    rebuildSlotWeights(slot, state.mesh);
  }
  state.slots.push(slot);
  rebuildSlotTriangleIndices();
  if (activate) setActiveSlot(state.slots.length - 1);
}

function getActiveSlot() {
  if (state.activeSlot < 0 || state.activeSlot >= state.slots.length) return null;
  return state.slots[state.activeSlot];
}

function makeUniqueSlotName(base) {
  const used = new Set((state.slots || []).map((s) => (s && s.name ? s.name : "")));
  const stem = (base || "slot").trim() || "slot";
  if (!used.has(stem)) return stem;
  let i = 1;
  let next = `${stem}_${i}`;
  while (used.has(next)) {
    i += 1;
    next = `${stem}_${i}`;
  }
  return next;
}

function addContourSlotFromActiveSlot(sourceSlot) {
  if (!sourceSlot) return null;
  const rectSrc = sourceSlot.rect || { x: 0, y: 0, w: sourceSlot.canvas.width, h: sourceSlot.canvas.height };
  const rect = {
    x: Number(rectSrc.x) || 0,
    y: Number(rectSrc.y) || 0,
    w: Math.max(1, Number(rectSrc.w) || 1),
    h: Math.max(1, Number(rectSrc.h) || 1),
  };
  const slot = {
    id: makeSlotId(),
    name: makeUniqueSlotName(`${sourceSlot.name || "slot"}_contour`),
    attachmentName: String(sourceSlot.attachmentName || "main"),
    canvas: sourceSlot.canvas,
    bone: Number.isFinite(sourceSlot.bone) ? sourceSlot.bone : -1,
    visible: sourceSlot.visible !== false,
    alpha: Number.isFinite(sourceSlot.alpha) ? math.clamp(sourceSlot.alpha, 0, 1) : 1,
    r: Number.isFinite(sourceSlot.r) ? math.clamp(sourceSlot.r, 0, 1) : 1,
    g: Number.isFinite(sourceSlot.g) ? math.clamp(sourceSlot.g, 0, 1) : 1,
    b: Number.isFinite(sourceSlot.b) ? math.clamp(sourceSlot.b, 0, 1) : 1,
    tx: Number(sourceSlot.tx) || 0,
    ty: Number(sourceSlot.ty) || 0,
    rot: Number(sourceSlot.rot) || 0,
    rect,
    docWidth: Number.isFinite(sourceSlot.docWidth) ? sourceSlot.docWidth : state.imageWidth,
    docHeight: Number.isFinite(sourceSlot.docHeight) ? sourceSlot.docHeight : state.imageHeight,
    _indices: null,
    meshData: null,
    useWeights: sourceSlot.useWeights !== false,
    weightBindMode: sourceSlot.weightBindMode || "single",
    weightMode: sourceSlot.weightMode || getSlotWeightMode(sourceSlot),
    influenceBones: Array.isArray(sourceSlot.influenceBones) ? sourceSlot.influenceBones.filter((v) => Number.isFinite(v)) : [],
    meshContour: {
      points: [],
      closed: false,
      triangles: [],
      fillPoints: [],
      fillTriangles: [],
      manualEdges: [],
      fillManualEdges: [],
    },
  };
  if (state.mesh) {
    slot.meshData = createSlotMeshData(rect, slot.docWidth || rect.w, slot.docHeight || rect.h, state.mesh.cols, state.mesh.rows);
    rebuildSlotWeights(slot, state.mesh);
  }
  state.slots.push(slot);
  rebuildSlotTriangleIndices();
  setActiveSlot(state.slots.length - 1);
  return slot;
}

function getPrimarySelectedBoneIndex() {
  const m = state.mesh;
  if (!m || !Array.isArray(m.rigBones) || m.rigBones.length === 0) return -1;
  const primary = Number(state.selectedBone);
  if (Number.isFinite(primary) && primary >= 0 && primary < m.rigBones.length) return primary;
  const picked = getSelectedBonesForWeight(m);
  if (picked.length > 0) return picked[0];
  return -1;
}

function bindActiveSlotToSelectedBone() {
  const m = state.mesh;
  const slot = getActiveSlot();
  if (!m || !slot) return false;
  const bone = getPrimarySelectedBoneIndex();
  if (bone < 0) return false;
  slot.bone = bone;
  const mode = getSlotWeightMode(slot);
  if (mode === "single") {
    slot.weightMode = "single";
    slot.weightBindMode = "single";
    slot.useWeights = true;
    slot.influenceBones = [bone];
  } else if (mode === "weighted") {
    slot.weightMode = "weighted";
    slot.weightBindMode = "auto";
    slot.useWeights = true;
    slot.influenceBones = [...new Set([bone, ...(Array.isArray(slot.influenceBones) ? slot.influenceBones : [])])];
  } else {
    slot.influenceBones = [bone];
  }
  rebuildSlotWeights(slot, m);
  refreshSlotUI();
  renderBoneTree();
  return true;
}

function bindActiveSlotWeightedToSelectedBones() {
  const m = state.mesh;
  const slot = getActiveSlot();
  if (!m || !slot) return false;
  const picked = getSelectedBonesForWeight(m);
  if (!Array.isArray(picked) || picked.length === 0) return false;
  slot.bone = picked[0];
  slot.weightMode = "weighted";
  slot.weightBindMode = "auto";
  slot.useWeights = true;
  slot.influenceBones = [...new Set(picked)];
  rebuildSlotWeights(slot, m);
  refreshSlotUI();
  renderBoneTree();
  return true;
}

function normalizeEdgePairs(edges, pointCount) {
  if (!Array.isArray(edges) || pointCount <= 1) return [];
  const out = [];
  const used = new Set();
  for (const e of edges) {
    if (!Array.isArray(e) || e.length < 2) continue;
    let a = Number(e[0]);
    let b = Number(e[1]);
    if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
    a = Math.floor(a);
    b = Math.floor(b);
    if (a === b || a < 0 || b < 0 || a >= pointCount || b >= pointCount) continue;
    if (a > b) [a, b] = [b, a];
    const key = `${a}:${b}`;
    if (used.has(key)) continue;
    used.add(key);
    out.push([a, b]);
  }
  return out;
}

function linkSelectedSlotMeshEdge(shouldLink) {
  const slot = getActiveSlot();
  if (!slot) return false;
  const contour = ensureSlotContour(slot);
  const activeSet = state.slotMesh.activeSet === "fill" ? "fill" : "contour";
  const activeEdges = activeSet === "fill" ? contour.fillManualEdges : contour.manualEdges;
  if (state.slotMesh.edgeSelectionSet !== activeSet || state.slotMesh.edgeSelection.length !== 2) return false;
  const [a0, b0] = state.slotMesh.edgeSelection;
  const a = Math.min(a0, b0);
  const b = Math.max(a0, b0);
  if (!shouldLink) {
    const prevLen = activeEdges.length;
    const filtered = activeEdges.filter((e) => {
      const lo = Math.min(e[0], e[1]);
      const hi = Math.max(e[0], e[1]);
      return lo !== a || hi !== b;
    });
    activeEdges.length = 0;
    for (const e of filtered) activeEdges.push(e);
    if (activeSet === "contour" && contour.triangles.length >= 3) {
      contour.triangles = applyManualEdgesToTriangles(contour.points, contour.triangles, contour.manualEdges);
    } else if (activeSet === "fill" && contour.fillTriangles.length >= 3) {
      contour.fillTriangles = applyManualEdgesToTriangles(contour.fillPoints, contour.fillTriangles, contour.fillManualEdges);
    }
    return prevLen !== activeEdges.length;
  }
  const key = `${a}:${b}`;
  const had = new Set(activeEdges.map((e) => `${Math.min(e[0], e[1])}:${Math.max(e[0], e[1])}`)).has(key);
  if (!had) activeEdges.push([a, b]);
  if (activeSet === "contour" && contour.triangles.length >= 3) {
    contour.triangles = applyManualEdgesToTriangles(contour.points, contour.triangles, contour.manualEdges);
  } else if (activeSet === "fill" && contour.fillTriangles.length >= 3) {
    contour.fillTriangles = applyManualEdgesToTriangles(contour.fillPoints, contour.fillTriangles, contour.fillManualEdges);
  }
  return !had;
}

function ensureSlotContour(slot) {
  if (!slot) return { points: [], closed: false, triangles: [] };
  if (!slot.meshContour || !Array.isArray(slot.meshContour.points)) {
    slot.meshContour = { points: [], closed: false, triangles: [], fillPoints: [], fillTriangles: [], manualEdges: [], fillManualEdges: [] };
  }
  if (!Array.isArray(slot.meshContour.triangles)) slot.meshContour.triangles = [];
  if (!Array.isArray(slot.meshContour.fillPoints)) slot.meshContour.fillPoints = [];
  if (!Array.isArray(slot.meshContour.fillTriangles)) slot.meshContour.fillTriangles = [];
  if (!Array.isArray(slot.meshContour.manualEdges)) slot.meshContour.manualEdges = [];
  if (!Array.isArray(slot.meshContour.fillManualEdges)) slot.meshContour.fillManualEdges = [];
  slot.meshContour.manualEdges = normalizeEdgePairs(slot.meshContour.manualEdges, slot.meshContour.points.length);
  slot.meshContour.fillManualEdges = normalizeEdgePairs(slot.meshContour.fillManualEdges, slot.meshContour.fillPoints.length);
  slot.meshContour.closed = !!slot.meshContour.closed;
  return slot.meshContour;
}

function pointInPolygon2D(p, poly) {
  if (!Array.isArray(poly) || poly.length < 3) return false;
  const x = Number(p.x) || 0;
  const y = Number(p.y) || 0;
  const onSeg = (ax, ay, bx, by, px, py) => {
    const vx = bx - ax;
    const vy = by - ay;
    const wx = px - ax;
    const wy = py - ay;
    const cross = vx * wy - vy * wx;
    if (Math.abs(cross) > 1e-6) return false;
    const dot = wx * vx + wy * vy;
    if (dot < -1e-6) return false;
    const vv = vx * vx + vy * vy;
    return dot <= vv + 1e-6;
  };
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const pi = poly[i];
    const pj = poly[j];
    const yi = Number(pi.y) || 0;
    const yj = Number(pj.y) || 0;
    const xi = Number(pi.x) || 0;
    const xj = Number(pj.x) || 0;
    if (onSeg(xi, yi, xj, yj, x, y)) return true;
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / ((yj - yi) || 1e-8) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function polygonSignedArea(points) {
  if (!Array.isArray(points) || points.length < 3) return 0;
  let sum = 0;
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    sum += a.x * b.y - b.x * a.y;
  }
  return sum * 0.5;
}

function pointInTriangle2D(p, a, b, c) {
  const s1 = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
  const s2 = (c.x - b.x) * (p.y - b.y) - (c.y - b.y) * (p.x - b.x);
  const s3 = (a.x - c.x) * (p.y - c.y) - (a.y - c.y) * (p.x - c.x);
  const hasNeg = s1 < 0 || s2 < 0 || s3 < 0;
  const hasPos = s1 > 0 || s2 > 0 || s3 > 0;
  return !(hasNeg && hasPos);
}

function triangulatePolygon(points) {
  if (!Array.isArray(points) || points.length < 3) return [];
  const n = points.length;
  const area = polygonSignedArea(points);
  const ccw = area >= 0;
  const verts = [];
  for (let i = 0; i < n; i += 1) verts.push(i);
  const out = [];
  let guard = 0;
  while (verts.length > 2 && guard < 10000) {
    guard += 1;
    let earFound = false;
    for (let i = 0; i < verts.length; i += 1) {
      const i0 = verts[(i - 1 + verts.length) % verts.length];
      const i1 = verts[i];
      const i2 = verts[(i + 1) % verts.length];
      const a = points[i0];
      const b = points[i1];
      const c = points[i2];
      const cross = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
      if ((ccw && cross <= 1e-7) || (!ccw && cross >= -1e-7)) continue;
      let hasInside = false;
      for (let j = 0; j < verts.length; j += 1) {
        const vi = verts[j];
        if (vi === i0 || vi === i1 || vi === i2) continue;
        if (pointInTriangle2D(points[vi], a, b, c)) {
          hasInside = true;
          break;
        }
      }
      if (hasInside) continue;
      if (ccw) out.push(i0, i1, i2);
      else out.push(i0, i2, i1);
      verts.splice(i, 1);
      earFound = true;
      break;
    }
    if (!earFound) return [];
  }
  return out;
}

function makePointKey(x, y) {
  return `${Math.round(x * 1000)}:${Math.round(y * 1000)}`;
}

function circumcircleContains(a, b, c, p) {
  const ax = a.x - p.x;
  const ay = a.y - p.y;
  const bx = b.x - p.x;
  const by = b.y - p.y;
  const cx = c.x - p.x;
  const cy = c.y - p.y;
  const det =
    (ax * ax + ay * ay) * (bx * cy - by * cx) -
    (bx * bx + by * by) * (ax * cy - ay * cx) +
    (cx * cx + cy * cy) * (ax * by - ay * bx);
  const orient = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  return orient >= 0 ? det > 1e-8 : det < -1e-8;
}

function delaunayTriangulate(points) {
  if (!Array.isArray(points) || points.length < 3) return [];
  const pts = points.map((p) => ({ x: Number(p.x) || 0, y: Number(p.y) || 0 }));
  let minX = pts[0].x;
  let minY = pts[0].y;
  let maxX = pts[0].x;
  let maxY = pts[0].y;
  for (const p of pts) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  const dx = maxX - minX;
  const dy = maxY - minY;
  const d = Math.max(dx, dy) || 1;
  const midX = (minX + maxX) * 0.5;
  const midY = (minY + maxY) * 0.5;
  const s0 = { x: midX - 20 * d, y: midY - d };
  const s1 = { x: midX, y: midY + 20 * d };
  const s2 = { x: midX + 20 * d, y: midY - d };
  const i0 = pts.length;
  const i1 = pts.length + 1;
  const i2 = pts.length + 2;
  pts.push(s0, s1, s2);
  let tris = [[i0, i1, i2]];
  for (let i = 0; i < points.length; i += 1) {
    const p = pts[i];
    const bad = [];
    for (let t = 0; t < tris.length; t += 1) {
      const tri = tris[t];
      if (circumcircleContains(pts[tri[0]], pts[tri[1]], pts[tri[2]], p)) bad.push(t);
    }
    const edgeMap = new Map();
    for (const bi of bad) {
      const tri = tris[bi];
      const edges = [
        [tri[0], tri[1]],
        [tri[1], tri[2]],
        [tri[2], tri[0]],
      ];
      for (const [a, b] of edges) {
        const lo = Math.min(a, b);
        const hi = Math.max(a, b);
        const key = `${lo}:${hi}`;
        edgeMap.set(key, (edgeMap.get(key) || 0) + 1);
      }
    }
    tris = tris.filter((_, idx) => !bad.includes(idx));
    for (const [key, count] of edgeMap.entries()) {
      if (count !== 1) continue;
      const [a, b] = key.split(":").map((v) => Number(v) || 0);
      tris.push([a, b, i]);
    }
  }
  const out = [];
  for (const tri of tris) {
    if (tri[0] >= points.length || tri[1] >= points.length || tri[2] >= points.length) continue;
    out.push(tri[0], tri[1], tri[2]);
  }
  return out;
}

function hasTriangleEdge(triangles, a, b) {
  if (!Array.isArray(triangles) || triangles.length < 3) return false;
  for (let i = 0; i + 2 < triangles.length; i += 3) {
    const t0 = triangles[i];
    const t1 = triangles[i + 1];
    const t2 = triangles[i + 2];
    if ((t0 === a && t1 === b) || (t1 === a && t0 === b)) return true;
    if ((t1 === a && t2 === b) || (t2 === a && t1 === b)) return true;
    if ((t2 === a && t0 === b) || (t0 === a && t2 === b)) return true;
  }
  return false;
}

function forceEdgeByFlip(points, triangles, edgeA, edgeB) {
  if (!Array.isArray(triangles) || triangles.length < 6 || edgeA === edgeB) return triangles;
  if (hasTriangleEdge(triangles, edgeA, edgeB)) return triangles;
  const triList = [];
  for (let i = 0; i + 2 < triangles.length; i += 3) triList.push([triangles[i], triangles[i + 1], triangles[i + 2]]);
  let changed = false;
  for (let i = 0; i < triList.length; i += 1) {
    for (let j = i + 1; j < triList.length; j += 1) {
      const ta = triList[i];
      const tb = triList[j];
      const common = [];
      for (const v of ta) {
        if (tb.includes(v)) common.push(v);
      }
      if (common.length !== 2) continue;
      const oa = ta.find((v) => v !== common[0] && v !== common[1]);
      const ob = tb.find((v) => v !== common[0] && v !== common[1]);
      if (oa == null || ob == null) continue;
      const match = (oa === edgeA && ob === edgeB) || (oa === edgeB && ob === edgeA);
      if (!match) continue;
      const c0 = common[0];
      const c1 = common[1];
      triList[i] = [edgeA, edgeB, c0];
      triList[j] = [edgeB, edgeA, c1];
      changed = true;
      break;
    }
    if (changed) break;
  }
  if (!changed) return triangles;
  const out = [];
  for (const tri of triList) out.push(tri[0], tri[1], tri[2]);
  return out;
}

function applyManualEdgesToTriangles(points, triangles, manualEdges) {
  if (!Array.isArray(triangles) || triangles.length < 3) return [];
  const edges = normalizeEdgePairs(manualEdges, Array.isArray(points) ? points.length : 0);
  let out = triangles.slice();
  for (const e of edges) {
    out = forceEdgeByFlip(points, out, e[0], e[1]);
  }
  return out;
}

function sanitizeTriangles(points, triangles, poly = null) {
  if (!Array.isArray(points) || points.length < 3 || !Array.isArray(triangles) || triangles.length < 3) return [];
  const out = [];
  const used = new Set();
  const triArea2 = (a, b, c) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  let minX = points[0].x;
  let minY = points[0].y;
  let maxX = points[0].x;
  let maxY = points[0].y;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  const span = Math.max(maxX - minX, maxY - minY, 1);
  // Keep very thin triangles to avoid visual cracks near constrained/manual edges.
  const areaEps = Math.max(1e-10, span * span * 1e-14);
  for (let i = 0; i + 2 < triangles.length; i += 3) {
    const a = Math.floor(Number(triangles[i]));
    const b = Math.floor(Number(triangles[i + 1]));
    const c = Math.floor(Number(triangles[i + 2]));
    if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)) continue;
    if (a < 0 || b < 0 || c < 0 || a >= points.length || b >= points.length || c >= points.length) continue;
    if (a === b || b === c || c === a) continue;
    const pa = points[a];
    const pb = points[b];
    const pc = points[c];
    if (!pa || !pb || !pc) continue;
    if (Math.abs(triArea2(pa, pb, pc)) < areaEps) continue;
    if (Array.isArray(poly) && poly.length >= 3) {
      const cen = { x: (pa.x + pb.x + pc.x) / 3, y: (pa.y + pb.y + pc.y) / 3 };
      if (!pointInPolygon2D(cen, poly)) continue;
    }
    const key = [a, b, c].sort((x, y) => x - y).join(":");
    if (used.has(key)) continue;
    used.add(key);
    out.push(a, b, c);
  }
  return out;
}

function buildUniformGridFillForContour(contour, colsHint, rowsHint) {
  if (!contour || !contour.closed || contour.points.length < 3) return { points: [], triangles: [] };
  const poly = contour.points;
  let minX = poly[0].x;
  let minY = poly[0].y;
  let maxX = poly[0].x;
  let maxY = poly[0].y;
  for (const p of poly) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  const cols = math.clamp(Number(colsHint) || 24, 3, 80);
  const rows = math.clamp(Number(rowsHint) || 24, 3, 80);
  const stepX = (maxX - minX) / cols || 1;
  const stepY = (maxY - minY) / rows || 1;
  const pts = [];
  const used = new Set();
  for (const p of poly) {
    const k = makePointKey(p.x, p.y);
    if (used.has(k)) continue;
    used.add(k);
    pts.push({ x: p.x, y: p.y });
  }
  for (let iy = 0; iy <= rows; iy += 1) {
    for (let ix = 0; ix <= cols; ix += 1) {
      const x = minX + ix * stepX;
      const y = minY + iy * stepY;
      if (!pointInPolygon2D({ x, y }, poly)) continue;
      const k = makePointKey(x, y);
      if (used.has(k)) continue;
      used.add(k);
      pts.push({ x, y });
    }
  }
  if (pts.length < 3) return { points: [], triangles: [] };
  const raw = delaunayTriangulate(pts);
  let filtered = [];
  for (let i = 0; i + 2 < raw.length; i += 3) {
    const a = pts[raw[i]];
    const b = pts[raw[i + 1]];
    const c = pts[raw[i + 2]];
    const cen = { x: (a.x + b.x + c.x) / 3, y: (a.y + b.y + c.y) / 3 };
    const m0 = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const m1 = { x: (b.x + c.x) / 2, y: (b.y + c.y) / 2 };
    const m2 = { x: (c.x + a.x) / 2, y: (c.y + a.y) / 2 };
    if (!pointInPolygon2D(cen, poly)) continue;
    if (!pointInPolygon2D(m0, poly)) continue;
    if (!pointInPolygon2D(m1, poly)) continue;
    if (!pointInPolygon2D(m2, poly)) continue;
    filtered.push(raw[i], raw[i + 1], raw[i + 2]);
  }
  filtered = sanitizeTriangles(pts, filtered, poly);
  if (filtered.length < 3) {
    const fallback = [];
    for (let i = 0; i + 2 < raw.length; i += 3) {
      const a = pts[raw[i]];
      const b = pts[raw[i + 1]];
      const c = pts[raw[i + 2]];
      if (!a || !b || !c) continue;
      const cen = { x: (a.x + b.x + c.x) / 3, y: (a.y + b.y + c.y) / 3 };
      if (!pointInPolygon2D(cen, poly)) continue;
      fallback.push(raw[i], raw[i + 1], raw[i + 2]);
    }
    filtered = sanitizeTriangles(pts, fallback, poly);
  }
  return { points: pts, triangles: filtered };
}

function reindexTrianglesAfterPointRemoved(triangles, index) {
  if (!Array.isArray(triangles) || triangles.length < 3) return [];
  const out = [];
  for (let i = 0; i + 2 < triangles.length; i += 3) {
    const a = Number(triangles[i]);
    const b = Number(triangles[i + 1]);
    const c = Number(triangles[i + 2]);
    if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)) continue;
    if (a === index || b === index || c === index) continue;
    out.push(a > index ? a - 1 : a, b > index ? b - 1 : b, c > index ? c - 1 : c);
  }
  return out;
}

function removePointAtIndex(points, index) {
  if (!Array.isArray(points) || index < 0 || index >= points.length) return false;
  points.splice(index, 1);
  return true;
}

function applyContourMeshToSlot(slot) {
  const m = state.mesh;
  if (!m || !slot) return false;
  const contour = ensureSlotContour(slot);
  if (!contour.closed || contour.points.length < 3) return false;
  const useFill = Array.isArray(contour.fillPoints) && contour.fillPoints.length >= 3;
  const pts = useFill ? contour.fillPoints : contour.points;
  const manualEdges = useFill ? contour.fillManualEdges : contour.manualEdges;
  let triangles = useFill ? contour.fillTriangles : contour.triangles;
  if (!Array.isArray(triangles) || triangles.length < 3) {
    triangles = applyManualEdgesToTriangles(pts, triangulatePolygon(pts), manualEdges);
    if (useFill) contour.fillTriangles = triangles;
    else contour.triangles = triangles;
  }
  triangles = applyManualEdgesToTriangles(pts, triangles, manualEdges);
  triangles = sanitizeTriangles(pts, triangles, contour.points);
  if (!Array.isArray(triangles) || triangles.length < 3) return false;
  const rect = slot.rect || { x: 0, y: 0, w: Math.max(1, state.imageWidth), h: Math.max(1, state.imageHeight) };
  const rw = Math.max(1, Number(rect.w) || 1);
  const rh = Math.max(1, Number(rect.h) || 1);
  const positions = new Float32Array(pts.length * 2);
  const uvs = new Float32Array(pts.length * 2);
  for (let i = 0; i < pts.length; i += 1) {
    const p = pts[i];
    positions[i * 2] = Number(p.x) || 0;
    positions[i * 2 + 1] = Number(p.y) || 0;
    uvs[i * 2] = math.clamp(((Number(p.x) || 0) - (Number(rect.x) || 0)) / rw, 0, 1);
    uvs[i * 2 + 1] = math.clamp(((Number(p.y) || 0) - (Number(rect.y) || 0)) / rh, 0, 1);
  }
  const vCount = pts.length;
  slot.meshData = {
    cols: 0,
    rows: 0,
    positions,
    uvs,
    offsets: new Float32Array(vCount * 2),
    baseOffsets: new Float32Array(vCount * 2),
    weights: new Float32Array(0),
    indices: new Uint16Array(triangles),
    deformedLocal: new Float32Array(vCount * 2),
    deformedScreen: new Float32Array(vCount * 2),
    interleaved: new Float32Array(vCount * 4),
  };
  rebuildSlotWeights(slot, m);
  rebuildSlotTriangleIndices();
  return true;
}

function resetSlotMeshToGrid(slot) {
  const m = state.mesh;
  if (!m || !slot) return false;
  const r = slot.rect || { x: 0, y: 0, w: state.imageWidth || 64, h: state.imageHeight || 64 };
  slot.meshData = createSlotMeshData(r, state.imageWidth || r.w, state.imageHeight || r.h, m.cols, m.rows);
  rebuildSlotWeights(slot, m);
  return true;
}

function pickSlotContourPoint(slot, mx, my, radius = 10) {
  const contour = ensureSlotContour(slot);
  const r2 = radius * radius;
  let best = { set: "contour", index: -1 };
  let bestD2 = r2;
  const sets = [];
  const preferFill = state.slotMesh.activeSet === "fill";
  if (preferFill) sets.push(["fill", contour.fillPoints || []], ["contour", contour.points || []]);
  else sets.push(["contour", contour.points || []], ["fill", contour.fillPoints || []]);
  for (const [setName, list] of sets) {
    for (let i = 0; i < list.length; i += 1) {
      const p = list[i];
      const s = localToScreen(p.x, p.y);
      const dx = s.x - mx;
      const dy = s.y - my;
      const d2 = dx * dx + dy * dy;
      if (d2 <= bestD2) {
        bestD2 = d2;
        best = { set: setName, index: i };
      }
    }
  }
  return best.index >= 0 ? best : null;
}

function ensureSlotMeshData(slot, m) {
  if (!slot || !m) return;
  if (!slot.meshData) {
    const r = slot.rect || { x: 0, y: 0, w: state.imageWidth || 64, h: state.imageHeight || 64 };
    slot.meshData = createSlotMeshData(r, state.imageWidth || r.w, state.imageHeight || r.h, m.cols, m.rows);
  }
  if (!slot.meshData.weights || slot.meshData.weights.length !== (slot.meshData.positions.length / 2) * m.rigBones.length) {
    const mode = getSlotWeightMode(slot);
    if (mode === "free") {
      slot.useWeights = false;
      slot.weightBindMode = "none";
      slot.weightMode = "free";
      slot.meshData.weights = new Float32Array(0);
      return;
    }
    if (mode === "single") {
      const vCount = slot.meshData.positions.length / 2;
      const boneCount = m.rigBones.length;
      const bi = Number(slot.bone);
      const weights = allocWeights(vCount, boneCount);
      if (Number.isFinite(bi) && bi >= 0 && bi < boneCount) {
        for (let i = 0; i < vCount; i += 1) {
          weights[i * boneCount + bi] = 1;
        }
      }
      slot.meshData.weights = weights;
      slot.weightBindMode = "single";
      slot.weightMode = "single";
    } else {
      const allowed = getSlotInfluenceBones(slot, m);
      slot.influenceBones = allowed;
      slot.meshData.weights = autoWeightForPositions(slot.meshData.positions, m.rigBones, allowed);
      slot.weightBindMode = "auto";
      slot.weightMode = "weighted";
    }
  }
}

function getSlotOffsets(slot, m) {
  ensureSlotMeshData(slot, m);
  return slot && slot.meshData ? slot.meshData.offsets : null;
}

function getActiveOffsets(m) {
  if (state.slots.length === 0) return m.offsets;
  const slot = getActiveSlot();
  if (!slot) return m.offsets;
  return getSlotOffsets(slot, m) || m.offsets;
}

function getRenderableSlots() {
  if (state.slots.length === 0) {
    if (!state.sourceCanvas) return [];
    return [{ name: "base", canvas: state.sourceCanvas, alpha: 1, visible: true }];
  }
  if (state.slotViewMode !== "all") {
    const s = getActiveSlot();
    return s ? [s] : [];
  }
  return state.slots.filter((s) => s && s.visible !== false);
}

function ensureDefaultSlotBone() {
  const m = state.mesh;
  if (!m) return -1;
  if (m.rigBones.length > 0) return 0;
  const len = Math.max(24, Math.round((state.imageWidth || 256) * 0.22));
  m.rigBones.push({
    name: "slot_root",
    parent: -1,
    tx: (state.imageWidth || 256) * 0.5,
    ty: (state.imageHeight || 256) * 0.5,
    rot: -Math.PI * 0.5,
    length: len,
    sx: 1,
    sy: 1,
    shx: 0,
    shy: 0,
    connected: true,
    poseLenEditable: false,
  });
  state.selectedBone = 0;
  syncPoseFromRig(m);
  syncBindPose(m);
  refreshWeightsForBoneCount();
  return 0;
}

function createTempBoneForSlot(slot, label = "slot_bone") {
  const m = state.mesh;
  if (!m) return -1;
  const r = slot && slot.rect ? slot.rect : { x: state.imageWidth * 0.5, y: state.imageHeight * 0.5, w: 48, h: 48 };
  const cx = r.x + r.w * 0.5;
  const cy = r.y + r.h * 0.5;
  const len = Math.max(16, Math.min(120, Math.max(r.w, r.h) * 0.4));
  m.rigBones.push({
    name: `${label}_${m.rigBones.length}`,
    parent: -1,
    tx: cx,
    ty: cy,
    rot: -Math.PI * 0.5,
    length: len,
    sx: 1,
    sy: 1,
    shx: 0,
    shy: 0,
    connected: true,
    poseLenEditable: false,
  });
  const idx = m.rigBones.length - 1;
  syncPoseFromRig(m);
  syncBindPose(m);
  refreshWeightsForBoneCount();
  return idx;
}

function ensureSlotsHaveBoneBinding() {
  if (state.slots.length === 0) return;
  const m = state.mesh;
  if (!m) return;
  if (m.rigBones.length === 0) {
    for (const s of state.slots) {
      if (!s) continue;
      const bi = createTempBoneForSlot(s, "slot_root");
      s.bone = bi;
      if (getSlotWeightMode(s) === "single") {
        setSlotSingleBoneWeight(s, m, bi);
      } else {
        rebuildSlotWeights(s, m);
      }
    }
    return;
  }
  const defaultBone = ensureDefaultSlotBone();
  for (const s of state.slots) {
    if (!s) continue;
    const valid = Number.isFinite(s.bone) && s.bone >= 0 && s.bone < m.rigBones.length;
    if (!valid) {
      const bi = createTempBoneForSlot(s, "slot_auto");
      s.bone = bi;
      if (getSlotWeightMode(s) === "single") {
        setSlotSingleBoneWeight(s, m, bi);
      } else {
        rebuildSlotWeights(s, m);
      }
    }
  }
  if (state.slots.length > 0 && state.slots.every((s) => !Number.isFinite(s.bone) || s.bone < 0)) {
    state.slots[0].bone = defaultBone;
  }
}

function ensureIKConstraints(m) {
  if (!m) return [];
  if (!Array.isArray(m.ikConstraints)) m.ikConstraints = [];
  const count = Array.isArray(m.rigBones) ? m.rigBones.length : 0;
  m.ikConstraints = m.ikConstraints
    .map((c, i) => {
      const bones = Array.isArray(c && c.bones) ? c.bones.map((v) => Number(v)).filter((v) => Number.isFinite(v)) : [];
      const target = Number(c && c.target);
      const targetX = Number(c && c.targetX);
      const targetY = Number(c && c.targetY);
      const name = c && c.name ? String(c.name) : `ik_${i}`;
      return {
        name,
        bones: bones.slice(0, 2),
        target: Number.isFinite(target) && target >= 0 && target < count ? target : -1,
        targetX: Number.isFinite(targetX) ? targetX : null, // legacy project compatibility
        targetY: Number.isFinite(targetY) ? targetY : null, // legacy project compatibility
        mix: math.clamp(Number(c && c.mix) || 1, 0, 1),
        softness: Math.max(0, Number(c && c.softness) || 0),
        bendPositive: c && c.bendPositive !== false,
        compress: !!(c && c.compress),
        stretch: !!(c && c.stretch),
        uniform: !!(c && c.uniform),
        order: Math.max(0, Number(c && c.order) || i),
        skinRequired: !!(c && c.skinRequired),
        enabled: c ? c.enabled !== false : true,
        endMode: c && c.endMode === "tail" ? "tail" : "head",
      };
    })
    .filter((c) => c.bones.length >= 1 && c.bones.every((b) => b >= 0 && b < count));
  for (let i = 0; i < m.ikConstraints.length; i += 1) {
    m.ikConstraints[i].order = i;
  }
  if (!Number.isFinite(state.selectedIK) || state.selectedIK < 0 || state.selectedIK >= m.ikConstraints.length) {
    state.selectedIK = m.ikConstraints.length > 0 ? 0 : -1;
  }
  return m.ikConstraints;
}

function ensureTransformConstraints(m) {
  if (!m) return [];
  if (!Array.isArray(m.transformConstraints)) m.transformConstraints = [];
  const count = Array.isArray(m.rigBones) ? m.rigBones.length : 0;
  m.transformConstraints = m.transformConstraints
    .map((c, i) => {
      const bones = Array.isArray(c && c.bones) ? c.bones.map((v) => Number(v)).filter((v) => Number.isFinite(v)) : [];
      const target = Number(c && c.target);
      return {
        name: c && c.name ? String(c.name) : `transform_${i}`,
        bones: [...new Set(bones)].filter((b) => b >= 0 && b < count),
        target: Number.isFinite(target) && target >= 0 && target < count ? target : -1,
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
        order: Math.max(0, Number(c && c.order) || i),
        skinRequired: !!(c && c.skinRequired),
        enabled: c ? c.enabled !== false : true,
      };
    })
    .filter((c) => c.bones.length > 0 && c.target >= 0);
  for (let i = 0; i < m.transformConstraints.length; i += 1) {
    m.transformConstraints[i].order = i;
  }
  if (
    !Number.isFinite(state.selectedTransform) ||
    state.selectedTransform < 0 ||
    state.selectedTransform >= m.transformConstraints.length
  ) {
    state.selectedTransform = m.transformConstraints.length > 0 ? 0 : -1;
  }
  return m.transformConstraints;
}

function getActiveTransformConstraint() {
  const m = state.mesh;
  if (!m) return null;
  const list = ensureTransformConstraints(m);
  if (state.selectedTransform < 0 || state.selectedTransform >= list.length) return null;
  return list[state.selectedTransform];
}

function getTransformConstrainedBoneSet(m) {
  const out = new Set();
  if (!m) return out;
  for (const c of ensureTransformConstraints(m)) {
    if (!c || c.enabled === false) continue;
    for (const bi of c.bones || []) out.add(bi);
  }
  return out;
}

function getTransformTargetBoneSet(m) {
  const out = new Set();
  if (!m) return out;
  for (const c of ensureTransformConstraints(m)) {
    if (!c || c.enabled === false) continue;
    const t = Number(c.target);
    if (Number.isFinite(t) && t >= 0) out.add(t);
  }
  return out;
}

function ensurePathConstraints(m) {
  if (!m) return [];
  if (!Array.isArray(m.pathConstraints)) m.pathConstraints = [];
  const count = Array.isArray(m.rigBones) ? m.rigBones.length : 0;
  m.pathConstraints = m.pathConstraints
    .map((c, i) => {
      const bones = Array.isArray(c && c.bones) ? c.bones.map((v) => Number(v)).filter((v) => Number.isFinite(v)) : [];
      const target = Number(c && c.target);
      return {
        name: c && c.name ? String(c.name) : `path_${i}`,
        bones: [...new Set(bones)].filter((b) => b >= 0 && b < count),
        target: Number.isFinite(target) && target >= 0 && target < count ? target : -1,
        sourceType: c && c.sourceType === "bone_chain" ? "bone_chain" : "slot",
        targetSlot: Number.isFinite(Number(c && c.targetSlot)) ? Number(c.targetSlot) : -1,
        position: Number(c && c.position) || 0,
        spacing: Number(c && c.spacing) || 40,
        rotateMix: math.clamp(Number(c && c.rotateMix) || 0, 0, 1),
        translateMix: math.clamp(Number(c && c.translateMix) || 0, 0, 1),
        closed: !!(c && c.closed),
        order: Math.max(0, Number(c && c.order) || i),
        enabled: c ? c.enabled !== false : true,
      };
    })
    .filter((c) => c.bones.length > 0 && c.target >= 0);
  for (let i = 0; i < m.pathConstraints.length; i += 1) m.pathConstraints[i].order = i;
  if (!Number.isFinite(state.selectedPath) || state.selectedPath < 0 || state.selectedPath >= m.pathConstraints.length) {
    state.selectedPath = m.pathConstraints.length > 0 ? 0 : -1;
  }
  return m.pathConstraints;
}

function getActivePathConstraint() {
  const m = state.mesh;
  if (!m) return null;
  const list = ensurePathConstraints(m);
  if (state.selectedPath < 0 || state.selectedPath >= list.length) return null;
  return list[state.selectedPath];
}

function getPathConstrainedBoneSet(m) {
  const out = new Set();
  if (!m) return out;
  for (const c of ensurePathConstraints(m)) {
    if (!c || c.enabled === false) continue;
    for (const bi of c.bones || []) out.add(bi);
  }
  return out;
}

function getPathTargetBoneSet(m) {
  const out = new Set();
  if (!m) return out;
  for (const c of ensurePathConstraints(m)) {
    if (!c || c.enabled === false) continue;
    const t = Number(c.target);
    if (Number.isFinite(t) && t >= 0) out.add(t);
  }
  return out;
}

function addPathConstraint() {
  const m = state.mesh;
  if (!m || !Array.isArray(m.rigBones) || m.rigBones.length < 2) return false;
  const list = ensurePathConstraints(m);
  const target = Number.isFinite(state.selectedBone) && state.selectedBone >= 0 ? state.selectedBone : 0;
  let bone = -1;
  for (let i = 0; i < m.rigBones.length; i += 1) {
    if (i !== target) {
      bone = i;
      break;
    }
  }
  if (bone < 0) return false;
  list.push({
    name: `path_${list.length}`,
    bones: [bone],
    target,
    sourceType: "slot",
    targetSlot: state.activeSlot >= 0 ? state.activeSlot : 0,
    position: 0,
    spacing: 40,
    rotateMix: 1,
    translateMix: 1,
    closed: false,
    order: list.length,
    enabled: true,
  });
  state.selectedPath = list.length - 1;
  refreshPathUI();
  return true;
}

function removeSelectedPathConstraint() {
  const m = state.mesh;
  if (!m) return false;
  const list = ensurePathConstraints(m);
  if (state.selectedPath < 0 || state.selectedPath >= list.length) return false;
  list.splice(state.selectedPath, 1);
  state.selectedPath = list.length > 0 ? Math.min(state.selectedPath, list.length - 1) : -1;
  refreshPathUI();
  return true;
}

function collectPathChainPoints(bones, targetBone, closed = false) {
  const pts = [];
  const world = computeWorld(bones);
  let curr = targetBone;
  const visited = new Set();
  while (Number.isFinite(curr) && curr >= 0 && curr < bones.length && !visited.has(curr)) {
    visited.add(curr);
    const head = transformPoint(world[curr], 0, 0);
    const tip = transformPoint(world[curr], Number(bones[curr].length) || 0, 0);
    if (pts.length === 0) pts.push(head);
    pts.push(tip);
    let next = -1;
    for (let i = 0; i < bones.length; i += 1) {
      if (Number(bones[i] && bones[i].parent) === curr) {
        next = i;
        break;
      }
    }
    if (next < 0) break;
    curr = next;
  }
  if (closed && pts.length >= 2) pts.push({ ...pts[0] });
  return pts;
}

function collectSlotContourPathPoints(m, bones, slotIndex, closed = false) {
  if (!m || !Array.isArray(state.slots) || slotIndex < 0 || slotIndex >= state.slots.length) return [];
  const slot = state.slots[slotIndex];
  if (!slot) return [];
  const contour = ensureSlotContour(slot);
  const src = Array.isArray(contour && contour.fillPoints) && contour.fillPoints.length >= 2 ? contour.fillPoints : contour.points;
  if (!Array.isArray(src) || src.length < 2) return [];
  const world = computeWorld(bones);
  const tm = getSlotTransformMatrix(slot, world);
  const pts = src.map((p) => transformPoint(tm, Number(p.x) || 0, Number(p.y) || 0));
  if (closed && pts.length >= 2) pts.push({ ...pts[0] });
  return pts;
}

function samplePolylineAtDistance(points, d, closed = false) {
  if (!Array.isArray(points) || points.length < 2) return null;
  const segs = [];
  let total = 0;
  const n = points.length - 1;
  for (let i = 0; i < n; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    if (len <= 1e-6) continue;
    segs.push({ a, b, len, start: total, end: total + len });
    total += len;
  }
  if (total <= 1e-6 || segs.length === 0) return null;
  let t = Number(d) || 0;
  if (closed) {
    t = ((t % total) + total) % total;
  } else {
    t = math.clamp(t, 0, total);
  }
  let seg = segs[segs.length - 1];
  for (const s of segs) {
    if (t >= s.start && t <= s.end) {
      seg = s;
      break;
    }
  }
  const u = math.clamp((t - seg.start) / Math.max(1e-6, seg.len), 0, 1);
  const x = seg.a.x + (seg.b.x - seg.a.x) * u;
  const y = seg.a.y + (seg.b.y - seg.a.y) * u;
  const ang = Math.atan2(seg.b.y - seg.a.y, seg.b.x - seg.a.x);
  return { x, y, angle: ang, total };
}

function applyPathConstraintsToBones(m, bones) {
  if (!m || !bones || bones.length === 0) return;
  const list = ensurePathConstraints(m);
  if (list.length === 0) return;
  for (const c of list) {
    if (!c || c.enabled === false) continue;
    const ti = Number(c.target);
    if (!Number.isFinite(ti) || ti < 0 || ti >= bones.length) continue;
    const pathPts =
      c.sourceType === "bone_chain"
        ? collectPathChainPoints(bones, ti, !!c.closed)
        : collectSlotContourPathPoints(m, bones, Number(c.targetSlot), !!c.closed);
    if (!pathPts || pathPts.length < 2) continue;
    const tMix = math.clamp(Number(c.translateMix) || 0, 0, 1);
    const rMix = math.clamp(Number(c.rotateMix) || 0, 0, 1);
    for (let k = 0; k < c.bones.length; k += 1) {
      const bi = Number(c.bones[k]);
      if (!Number.isFinite(bi) || bi < 0 || bi >= bones.length || bi === ti) continue;
      const smp = samplePolylineAtDistance(pathPts, (Number(c.position) || 0) + k * (Number(c.spacing) || 0), !!c.closed);
      if (!smp) continue;
      const world = computeWorld(bones);
      const ep = getBoneWorldEndpointsFromBones(bones, bi, world);
      const currAngle = Math.atan2(ep.tip.y - ep.head.y, ep.tip.x - ep.head.x);
      const len = Math.max(1, Number(bones[bi].length) || Math.hypot(ep.tip.x - ep.head.x, ep.tip.y - ep.head.y));
      const nx = ep.head.x + (smp.x - ep.head.x) * tMix;
      const ny = ep.head.y + (smp.y - ep.head.y) * tMix;
      const na = lerpAngle(currAngle, smp.angle, rMix);
      const tip = { x: nx + Math.cos(na) * len, y: ny + Math.sin(na) * len };
      setBoneFromWorldEndpoints(bones, bi, { x: nx, y: ny }, tip);
    }
  }
}

function refreshPathUI() {
  const m = state.mesh;
  if (!els.pathSelect) return;
  if (!m || !Array.isArray(m.rigBones) || m.rigBones.length === 0) {
    els.pathSelect.innerHTML = "";
    if (els.pathList) els.pathList.innerHTML = "<div class='muted'>No bones.</div>";
    return;
  }
  const list = ensurePathConstraints(m);
  if (state.selectedPath < 0 || state.selectedPath >= list.length) state.selectedPath = list.length > 0 ? 0 : -1;
  const fillBoneSelect = (sel, allowNone = false) => {
    if (!sel) return;
    sel.innerHTML = "";
    if (allowNone) {
      const none = document.createElement("option");
      none.value = "-1";
      none.textContent = "-1: None";
      sel.appendChild(none);
    }
    for (let i = 0; i < m.rigBones.length; i += 1) {
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = `${i}: ${m.rigBones[i].name}`;
      sel.appendChild(opt);
    }
  };
  fillBoneSelect(els.pathTargetBone, true);
  fillBoneSelect(els.pathBones, false);
  if (els.pathTargetSlot) {
    els.pathTargetSlot.innerHTML = "";
    for (let i = 0; i < state.slots.length; i += 1) {
      const s = state.slots[i];
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = `${i}: ${s && s.name ? s.name : `slot_${i}`}`;
      els.pathTargetSlot.appendChild(opt);
    }
  }
  els.pathSelect.innerHTML = "";
  for (let i = 0; i < list.length; i += 1) {
    const c = list[i];
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = `${i}: ${c.name}`;
    els.pathSelect.appendChild(opt);
  }
  if (els.pathList) {
    els.pathList.innerHTML = "";
    if (list.length === 0) {
      els.pathList.innerHTML = "<div class='muted'>No Path constraints yet.</div>";
    } else {
      for (let i = 0; i < list.length; i += 1) {
        const c = list[i];
        const row = document.createElement("div");
        row.className = `tree-item${state.selectedPath === i ? " selected" : ""}`;
        row.dataset.pathIndex = String(i);
        row.textContent = `${i}: ${c.name}${c.enabled === false ? " (off)" : ""}`;
        els.pathList.appendChild(row);
      }
    }
  }
  const c = getActivePathConstraint();
  if (els.pathMoveUpBtn) els.pathMoveUpBtn.disabled = !c || state.selectedPath <= 0;
  if (els.pathMoveDownBtn) els.pathMoveDownBtn.disabled = !c || state.selectedPath >= list.length - 1;
  if (els.pathRemoveBtn) els.pathRemoveBtn.disabled = !c;
  if (!c) {
    if (els.pathHint) els.pathHint.textContent = "No Path constraint. Add one.";
    return;
  }
  if (els.pathSelect) els.pathSelect.value = String(state.selectedPath);
  if (els.pathName) els.pathName.value = c.name || `path_${state.selectedPath}`;
  if (els.pathTargetBone) els.pathTargetBone.value = String(c.target);
  if (els.pathSourceType) els.pathSourceType.value = c.sourceType === "bone_chain" ? "bone_chain" : "slot";
  if (els.pathTargetSlot && state.slots.length > 0) {
    const si = Number.isFinite(Number(c.targetSlot)) ? Math.max(0, Math.min(state.slots.length - 1, Number(c.targetSlot))) : 0;
    els.pathTargetSlot.value = String(si);
  }
  if (els.pathEnabled) els.pathEnabled.value = c.enabled === false ? "false" : "true";
  if (els.pathPosition) els.pathPosition.value = String(Number(c.position) || 0);
  if (els.pathSpacing) els.pathSpacing.value = String(Number(c.spacing) || 0);
  if (els.pathRotateMix) els.pathRotateMix.value = String(Number(c.rotateMix || 0).toFixed(3));
  if (els.pathTranslateMix) els.pathTranslateMix.value = String(Number(c.translateMix || 0).toFixed(3));
  if (els.pathClosed) els.pathClosed.value = c.closed ? "true" : "false";
  if (els.pathBones) {
    const set = new Set((c.bones || []).map((v) => Number(v)));
    for (const opt of els.pathBones.options) opt.selected = set.has(Number(opt.value));
  }
  if (els.pathHint) {
    const tName = m.rigBones[c.target] ? m.rigBones[c.target].name : c.target;
    const slotName =
      Number.isFinite(Number(c.targetSlot)) && Number(c.targetSlot) >= 0 && Number(c.targetSlot) < state.slots.length
        ? state.slots[Number(c.targetSlot)]?.name || `slot_${Number(c.targetSlot)}`
        : "(none)";
    const bNames = (c.bones || []).map((bi) => m.rigBones[bi]?.name || bi).join(", ");
    const sourceText = c.sourceType === "bone_chain" ? `${tName} chain` : `slot "${slotName}" contour`;
    els.pathHint.textContent = `Path ${c.name}: [${bNames}] along ${sourceText}, pos ${Number(c.position).toFixed(1)}, spacing ${Number(
      c.spacing
    ).toFixed(1)}`;
  }
}

function applyActivePathFromUI(updateBones = false) {
  const m = state.mesh;
  const c = getActivePathConstraint();
  if (!m || !c) return false;
  const prev = {
    position: Number(c.position) || 0,
    spacing: Number(c.spacing) || 0,
    rotateMix: Number(c.rotateMix) || 0,
    translateMix: Number(c.translateMix) || 0,
  };
  c.name = els.pathName ? els.pathName.value.trim() || c.name : c.name;
  c.target = Number(els.pathTargetBone ? els.pathTargetBone.value : c.target);
  c.sourceType = els.pathSourceType && els.pathSourceType.value === "bone_chain" ? "bone_chain" : "slot";
  c.targetSlot = Number(els.pathTargetSlot ? els.pathTargetSlot.value : c.targetSlot);
  c.enabled = !els.pathEnabled || els.pathEnabled.value !== "false";
  c.position = Number(els.pathPosition ? els.pathPosition.value : c.position) || 0;
  c.spacing = Number(els.pathSpacing ? els.pathSpacing.value : c.spacing) || 0;
  c.rotateMix = math.clamp(Number(els.pathRotateMix ? els.pathRotateMix.value : c.rotateMix) || 0, 0, 1);
  c.translateMix = math.clamp(Number(els.pathTranslateMix ? els.pathTranslateMix.value : c.translateMix) || 0, 0, 1);
  c.closed = !!(els.pathClosed && els.pathClosed.value === "true");
  if (updateBones && els.pathBones) {
    const picked = Array.from(els.pathBones.selectedOptions)
      .map((o) => Number(o.value))
      .filter((v) => Number.isFinite(v));
    c.bones = [...new Set(picked)].filter((bi) => bi !== c.target);
  }
  ensurePathConstraints(m);
  if (Math.abs((Number(c.position) || 0) - prev.position) > 1e-6) markDirtyTrack(getPathTrackId(state.selectedPath, "position"));
  if (Math.abs((Number(c.spacing) || 0) - prev.spacing) > 1e-6) markDirtyTrack(getPathTrackId(state.selectedPath, "spacing"));
  if (Math.abs((Number(c.rotateMix) || 0) - prev.rotateMix) > 1e-6) markDirtyTrack(getPathTrackId(state.selectedPath, "rotateMix"));
  if (Math.abs((Number(c.translateMix) || 0) - prev.translateMix) > 1e-6)
    markDirtyTrack(getPathTrackId(state.selectedPath, "translateMix"));
  refreshPathUI();
  refreshTrackSelect();
  renderTimelineTracks();
  return true;
}

function getActiveIKConstraint() {
  const m = state.mesh;
  if (!m) return null;
  const list = ensureIKConstraints(m);
  if (state.selectedIK < 0 || state.selectedIK >= list.length) return null;
  return list[state.selectedIK];
}

function getIkConstrainedBoneSet(m) {
  const out = new Set();
  if (!m) return out;
  const list = ensureIKConstraints(m);
  for (const ik of list) {
    if (!ik || ik.enabled === false) continue;
    for (const bi of ik.bones || []) out.add(bi);
  }
  return out;
}

function getIkTargetBoneSet(m) {
  const out = new Set();
  if (!m) return out;
  const list = ensureIKConstraints(m);
  for (const ik of list) {
    if (!ik || ik.enabled === false) continue;
    const t = Number(ik.target);
    if (Number.isFinite(t) && t >= 0) out.add(t);
  }
  return out;
}

function resolveTwoBoneChain(m, selectedIndex) {
  if (!m || !Array.isArray(m.rigBones) || m.rigBones.length === 0) return null;
  const bones = m.rigBones;
  const sel = Number.isFinite(selectedIndex) ? selectedIndex : -1;
  if (sel < 0 || sel >= bones.length) return null;
  const parent = Number(bones[sel] && bones[sel].parent);
  if (Number.isFinite(parent) && parent >= 0 && parent < bones.length) {
    // Prefer parent->selected, so selecting a mid-chain bone gives the expected upper segment IK.
    return [parent, sel];
  }
  for (let i = 0; i < bones.length; i += 1) {
    if (Number(bones[i] && bones[i].parent) === sel) return [sel, i];
  }
  return null;
}

function addIKConstraint(twoBone = false) {
  const m = state.mesh;
  if (!m || !Array.isArray(m.rigBones) || m.rigBones.length === 0) return false;
  const list = ensureIKConstraints(m);
  const uiSel = Number(els.boneSelect ? els.boneSelect.value : state.selectedBone);
  const sel = Number.isFinite(uiSel) ? uiSel : Number(state.selectedBone);
  let a = Number.isFinite(sel) && sel >= 0 && sel < m.rigBones.length ? sel : 0;
  let b = -1;
  if (twoBone) {
    const chain = resolveTwoBoneChain(m, a);
    if (!chain) return false;
    a = chain[0];
    b = chain[1];
  }
  const chain = twoBone ? [a, b] : [a];
  const target = Number.isFinite(sel) && sel >= 0 && sel < m.rigBones.length && !chain.includes(sel) ? sel : -1;
  const pose = getPoseBones(m);
  const tempIK = { bones: chain, endMode: twoBone ? "head" : "tail" };
  const tp = getIKConstraintEndPointWorld(pose, tempIK) || { x: 0, y: 0 };
  const ik = {
    name: `ik_${list.length}`,
    bones: chain,
    target,
    targetX: tp.x,
    targetY: tp.y,
    mix: 1,
    softness: 0,
    bendPositive: true,
    compress: false,
    stretch: false,
    uniform: false,
    order: list.length,
    skinRequired: false,
    enabled: true,
    endMode: twoBone ? "head" : "tail",
  };
  list.push(ik);
  state.selectedIK = list.length - 1;
  refreshIKUI();
  renderBoneTree();
  return true;
}

function removeSelectedIKConstraint() {
  const m = state.mesh;
  if (!m) return false;
  const list = ensureIKConstraints(m);
  if (state.selectedIK < 0 || state.selectedIK >= list.length) return false;
  list.splice(state.selectedIK, 1);
  state.selectedIK = list.length > 0 ? Math.min(state.selectedIK, list.length - 1) : -1;
  refreshIKUI();
  renderBoneTree();
  return true;
}

function remapIKAfterBoneRemoved(m, removed) {
  if (!m || !Array.isArray(m.ikConstraints)) return;
  const out = [];
  for (const c of m.ikConstraints) {
    if (!c) continue;
    const bones = (c.bones || []).map((bi) => {
      if (bi === removed) return -1;
      return bi > removed ? bi - 1 : bi;
    });
    const target = c.target === removed ? -1 : c.target > removed ? c.target - 1 : c.target;
    if (bones.some((bi) => bi < 0)) continue;
    if (bones.length >= 2 && Number(m.rigBones[bones[1]] && m.rigBones[bones[1]].parent) !== bones[0]) continue;
    out.push({ ...c, bones, target });
  }
  m.ikConstraints = out;
  if (state.selectedIK >= out.length) state.selectedIK = out.length - 1;
}

function solveOneBoneIK(bones, boneIndex, target, mix = 1) {
  if (!bones || boneIndex < 0 || boneIndex >= bones.length) return;
  const b = bones[boneIndex];
  if (!b) return;
  normalizeBoneChannels(b);
  const world = computeWorld(bones);
  const head = transformPoint(world[boneIndex], 0, 0);
  const parentWorld = b.parent >= 0 ? world[b.parent] : createIdentity();
  const desiredWorld = Math.atan2(target.y - head.y, target.x - head.x);
  const desiredLocal = desiredWorld - matrixAngle(parentWorld) - (Number(b.shx) || 0);
  b.rot = lerpAngle(Number(b.rot) || 0, desiredLocal, math.clamp(mix, 0, 1));
}

function solveTwoBoneIK(bones, parentIndex, childIndex, target, mix = 1, bendPositive = true) {
  if (!bones || parentIndex < 0 || childIndex < 0 || parentIndex >= bones.length || childIndex >= bones.length) return;
  const parent = bones[parentIndex];
  const child = bones[childIndex];
  if (!parent || !child) return;
  if (Number(child.parent) !== parentIndex) return;
  normalizeBoneChannels(parent);
  normalizeBoneChannels(child);
  const world = computeWorld(bones);
  const head = transformPoint(world[parentIndex], 0, 0);
  const joint = transformPoint(world[parentIndex], Number(parent.length) || 0, 0);
  const tip = transformPoint(world[childIndex], Number(child.length) || 0, 0);
  const l1 = Math.max(1e-6, Math.hypot(joint.x - head.x, joint.y - head.y));
  const l2 = Math.max(1e-6, Math.hypot(tip.x - joint.x, tip.y - joint.y));
  const dx = target.x - head.x;
  const dy = target.y - head.y;
  const dd = Math.hypot(dx, dy);
  const d = math.clamp(dd, Math.abs(l1 - l2) + 1e-6, l1 + l2 - 1e-6);
  const cos2 = math.clamp((d * d - l1 * l1 - l2 * l2) / (2 * l1 * l2), -1, 1);
  const a2 = Math.acos(cos2) * (bendPositive ? 1 : -1);
  const base = Math.atan2(dy, dx);
  const cosOff = math.clamp((d * d + l1 * l1 - l2 * l2) / (2 * Math.max(1e-6, d) * l1), -1, 1);
  const off = Math.acos(cosOff);
  const a1 = bendPositive ? base - off : base + off;
  const ppWorld = parent.parent >= 0 ? world[parent.parent] : createIdentity();
  const desiredParentLocal = a1 - matrixAngle(ppWorld) - (Number(parent.shx) || 0);
  parent.rot = lerpAngle(Number(parent.rot) || 0, desiredParentLocal, math.clamp(mix, 0, 1));
  const world2 = computeWorld(bones);
  const pWorld = world2[parentIndex];
  const desiredChildLocal = a1 + a2 - matrixAngle(pWorld) - (Number(child.shx) || 0);
  child.rot = lerpAngle(Number(child.rot) || 0, desiredChildLocal, math.clamp(mix, 0, 1));
}

function solveTwoBoneHeadTarget(bones, parentIndex, childIndex, target, mix = 1) {
  if (!bones || parentIndex < 0 || childIndex < 0 || parentIndex >= bones.length || childIndex >= bones.length) return;
  const parent = bones[parentIndex];
  const child = bones[childIndex];
  if (!parent || !child) return;
  if (Number(child.parent) !== parentIndex) return;
  normalizeBoneChannels(parent);
  const world = computeWorld(bones);
  const head = transformPoint(world[parentIndex], 0, 0);
  const ppWorld = parent.parent >= 0 ? world[parent.parent] : createIdentity();
  const desiredWorld = Math.atan2(target.y - head.y, target.x - head.x);
  const desiredParentLocal = desiredWorld - matrixAngle(ppWorld) - (Number(parent.shx) || 0);
  parent.rot = lerpAngle(Number(parent.rot) || 0, desiredParentLocal, math.clamp(mix, 0, 1));
}

function headTargetToTailTarget(bones, childIndex, headTarget) {
  if (!bones || childIndex < 0 || childIndex >= bones.length || !headTarget) return headTarget;
  const child = bones[childIndex];
  if (!child) return headTarget;
  const world = computeWorld(bones);
  const m = world[childIndex];
  const ang = matrixAngle(m);
  const len = Number(child.length) || 0;
  return {
    x: headTarget.x + Math.cos(ang) * len,
    y: headTarget.y + Math.sin(ang) * len,
  };
}

function applyTransformConstraintsToBones(m, bones) {
  if (!m || !bones || bones.length === 0) return;
  const list = ensureTransformConstraints(m);
  if (list.length === 0) return;
  for (const c of list) {
    if (!c || c.enabled === false) continue;
    const ti = Number(c.target);
    if (!Number.isFinite(ti) || ti < 0 || ti >= bones.length) continue;
    const tb = bones[ti];
    if (!tb) continue;
    normalizeBoneChannels(tb);
    const rMix = math.clamp(Number(c.rotateMix) || 0, 0, 1);
    const tMix = math.clamp(Number(c.translateMix) || 0, 0, 1);
    const sMix = math.clamp(Number(c.scaleMix) || 0, 0, 1);
    const shMix = math.clamp(Number(c.shearMix) || 0, 0, 1);
    const offRot = math.degToRad(Number(c.offsetRot) || 0);
    const offShearY = math.degToRad(Number(c.offsetShearY) || 0);
    const offX = Number(c.offsetX) || 0;
    const offY = Number(c.offsetY) || 0;
    const offSX = Number(c.offsetScaleX) || 0;
    const offSY = Number(c.offsetScaleY) || 0;
    const relative = !!c.relative;
    const useLocal = !!c.local;
    for (const bi of c.bones || []) {
      if (!Number.isFinite(bi) || bi < 0 || bi >= bones.length || bi === ti) continue;
      const b = bones[bi];
      if (!b) continue;
      normalizeBoneChannels(b);
      if (!useLocal) {
        const world = computeWorld(bones);
        const tw = world[ti];
        const pw = Number(b.parent) >= 0 ? world[b.parent] : createIdentity();
        const targetHead = transformPoint(tw, 0, 0);
        const targetRotW = matrixAngle(tw);
        if (relative) {
          if (tMix > 0) {
            b.tx += (targetHead.x + offX) * tMix;
            b.ty += (targetHead.y + offY) * tMix;
          }
          if (rMix > 0) b.rot += (targetRotW + offRot) * rMix;
        } else {
          if (tMix > 0) {
            const desiredWorld = { x: targetHead.x + offX, y: targetHead.y + offY };
            const desiredLocal = transformPoint(invert(pw), desiredWorld.x, desiredWorld.y);
            b.tx += (desiredLocal.x - b.tx) * tMix;
            b.ty += (desiredLocal.y - b.ty) * tMix;
          }
          if (rMix > 0) {
            const desiredLocalRot = targetRotW + offRot - matrixAngle(pw) - (Number(b.shx) || 0);
            b.rot = lerpAngle(b.rot, desiredLocalRot, rMix);
          }
        }
        if (sMix > 0) {
          b.sx += ((tb.sx + offSX) - b.sx) * sMix;
          b.sy += ((tb.sy + offSY) - b.sy) * sMix;
        }
        if (shMix > 0) {
          b.shx += (tb.shx - b.shx) * shMix;
          b.shy += ((tb.shy + offShearY) - b.shy) * shMix;
        }
        continue;
      }
      if (relative) {
        if (tMix > 0) {
          b.tx += (tb.tx + offX) * tMix;
          b.ty += (tb.ty + offY) * tMix;
        }
        if (rMix > 0) b.rot += (tb.rot + offRot) * rMix;
        if (sMix > 0) {
          b.sx += ((tb.sx - 1) + offSX) * sMix;
          b.sy += ((tb.sy - 1) + offSY) * sMix;
        }
        if (shMix > 0) {
          b.shx += tb.shx * shMix;
          b.shy += (tb.shy + offShearY) * shMix;
        }
      } else {
        if (tMix > 0) {
          b.tx += ((tb.tx + offX) - b.tx) * tMix;
          b.ty += ((tb.ty + offY) - b.ty) * tMix;
        }
        if (rMix > 0) b.rot = lerpAngle(b.rot, tb.rot + offRot, rMix);
        if (sMix > 0) {
          b.sx += ((tb.sx + offSX) - b.sx) * sMix;
          b.sy += ((tb.sy + offSY) - b.sy) * sMix;
        }
        if (shMix > 0) {
          b.shx += (tb.shx - b.shx) * shMix;
          b.shy += ((tb.shy + offShearY) - b.shy) * shMix;
        }
      }
    }
  }
}

function applyIKConstraintsToBones(m, bones) {
  if (!m || !bones || bones.length === 0) return;
  const list = ensureIKConstraints(m);
  if (list.length === 0) return;
  for (const ik of list) {
    if (!ik || ik.enabled === false) continue;
    const tp = getIKSolveTargetWorld(bones, ik);
    if (!tp) continue;
    const mix = math.clamp(Number(ik.mix) || 0, 0, 1);
    if (mix <= 0) continue;
    if ((ik.bones || []).length >= 2) {
      if (ik.endMode === "tail") {
        solveTwoBoneIK(bones, Number(ik.bones[0]), Number(ik.bones[1]), tp, mix, ik.bendPositive !== false);
      } else {
        const childIndex = Number(ik.bones[1]);
        const tailTarget = headTargetToTailTarget(bones, childIndex, tp);
        solveTwoBoneIK(bones, Number(ik.bones[0]), childIndex, tailTarget, mix, ik.bendPositive !== false);
      }
    } else if ((ik.bones || []).length === 1) {
      solveOneBoneIK(bones, Number(ik.bones[0]), tp, mix);
    }
  }
}

function findEnabledIKForBone(m, boneIndex) {
  if (!m) return null;
  const active = getActiveIKConstraint();
  if (active && active.enabled !== false && Array.isArray(active.bones) && active.bones.includes(boneIndex)) {
    return active;
  }
  const list = ensureIKConstraints(m);
  for (const ik of list) {
    if (!ik || ik.enabled === false) continue;
    if (Array.isArray(ik.bones) && ik.bones.includes(boneIndex)) return ik;
  }
  return null;
}

function getIKTargetPointWorld(bones, boneIndex) {
  if (!bones || boneIndex < 0 || boneIndex >= bones.length) return null;
  const b = bones[boneIndex];
  if (!b) return null;
  const world = computeWorld(bones);
  const mat = world[boneIndex];
  if (!mat) return null;
  // Connected targets cannot move their head independently; use tip as effective IK target point.
  if (Number(b.parent) >= 0 && b.connected) {
    return transformPoint(mat, Number(b.length) || 0, 0);
  }
  return transformPoint(mat, 0, 0);
}

function getIKConstraintEndPointWorld(bones, ik) {
  if (!bones || !ik) return null;
  const chain = Array.isArray(ik.bones) ? ik.bones : [];
  const endBi = chain.length >= 2 ? chain[1] : chain[0];
  if (!Number.isFinite(endBi) || endBi < 0 || endBi >= bones.length) return null;
  const world = computeWorld(bones);
  if (chain.length >= 2 && ik.endMode !== "tail") {
    return transformPoint(world[endBi], 0, 0);
  }
  return transformPoint(world[endBi], Number(bones[endBi].length) || 0, 0);
}

function getIKSolveTargetWorld(bones, ik) {
  if (!bones || !ik) return null;
  const tIdx = Number(ik.target);
  if (Number.isFinite(tIdx) && tIdx >= 0 && tIdx < bones.length) {
    return getIKTargetPointWorld(bones, tIdx);
  }
  const tx = ik.targetX;
  const ty = ik.targetY;
  if (Number.isFinite(tx) && Number.isFinite(ty)) return { x: tx, y: ty };
  return getIKConstraintEndPointWorld(bones, ik);
}

function setPoseBoneHeadWorld(bones, boneIndex, headWorld) {
  if (!bones || boneIndex < 0 || boneIndex >= bones.length) return false;
  const ep = getBoneWorldEndpointsFromBones(bones, boneIndex);
  const dx = ep.tip.x - ep.head.x;
  const dy = ep.tip.y - ep.head.y;
  const nextTip = { x: headWorld.x + dx, y: headWorld.y + dy };
  setBoneFromWorldEndpoints(bones, boneIndex, headWorld, nextTip);
  return true;
}

function setPoseBoneTipWorld(bones, boneIndex, tipWorld) {
  if (!bones || boneIndex < 0 || boneIndex >= bones.length) return false;
  const ep = getBoneWorldEndpointsFromBones(bones, boneIndex);
  setBoneFromWorldEndpoints(bones, boneIndex, ep.head, tipWorld);
  return true;
}

function steerIKTargetFromBoneEdit(m, editedBoneIndex, desiredPointWorld = null, handle = "tip") {
  if (!m || state.boneMode !== "pose") return false;
  const ik = findEnabledIKForBone(m, editedBoneIndex);
  if (!ik) return false;
  const targetIndex = Number(ik.target);
  const hasTargetBone = Number.isFinite(targetIndex) && targetIndex >= 0 && targetIndex < m.poseBones.length;
  if (hasTargetBone && targetIndex === editedBoneIndex) return false;
  const bones = getPoseBones(m);
  const world = computeWorld(bones);
  const chain = Array.isArray(ik.bones) ? ik.bones : [];
  const endBi = chain.length >= 2 ? chain[1] : chain[0];
  let desired = desiredPointWorld;
  if (!desired) {
    if (!Number.isFinite(endBi) || endBi < 0 || endBi >= bones.length) return false;
    if ((ik.bones || []).length >= 2 && ik.endMode !== "tail") {
      desired = transformPoint(world[endBi], 0, 0);
    } else {
      desired = transformPoint(world[endBi], Number(bones[endBi].length) || 0, 0);
    }
  }
  if ((ik.bones || []).length >= 2 && ik.endMode !== "tail" && handle === "tip") {
    if (!Number.isFinite(endBi) || endBi < 0 || endBi >= bones.length) return false;
    const ep = getBoneWorldEndpointsFromBones(bones, endBi, world);
    const dx = desired.x - ep.tip.x;
    const dy = desired.y - ep.tip.y;
    desired = { x: ep.head.x + dx, y: ep.head.y + dy };
  }
  if (!desired) return false;
  if (!hasTargetBone) {
    ik.targetX = desired.x;
    ik.targetY = desired.y;
    const ikIdx = getIKIndexByRef(m, ik);
    markDirtyByIKProp(ikIdx, "target");
    return true;
  }
  const target = bones[targetIndex];
  if (!target) return false;
  const connectedTarget = Number(target.parent) >= 0 && target.connected;
  const ok = connectedTarget
    ? setPoseBoneTipWorld(bones, targetIndex, desired)
    : setPoseBoneHeadWorld(bones, targetIndex, desired);
  if (!ok) return false;
  markDirtyByBoneProp(targetIndex, connectedTarget ? "rotate" : "translate");
  return true;
}

function refreshIKUI() {
  const m = state.mesh;
  if (!els.ikTools) return;
  if (!m || !Array.isArray(m.rigBones) || m.rigBones.length === 0) {
    els.ikTools.style.opacity = "0.65";
    if (els.ikSelect) els.ikSelect.innerHTML = "";
    return;
  }
  els.ikTools.style.opacity = "1";
  const list = ensureIKConstraints(m);
  const fillBoneSelect = (sel, allowNone = false) => {
    if (!sel) return;
    sel.innerHTML = "";
    if (allowNone) {
      const none = document.createElement("option");
      none.value = "-1";
      none.textContent = "-1: None";
      sel.appendChild(none);
    }
    for (let i = 0; i < m.rigBones.length; i += 1) {
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = `${i}: ${m.rigBones[i].name}`;
      sel.appendChild(opt);
    }
  };
  fillBoneSelect(els.ikTargetBone, true);
  fillBoneSelect(els.ikBoneA, false);
  fillBoneSelect(els.ikBoneB, true);
  if (els.ikSelect) {
    els.ikSelect.innerHTML = "";
    for (let i = 0; i < list.length; i += 1) {
      const c = list[i];
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = `${i}: ${c.name} (${(c.bones || []).length >= 2 ? "2-bone" : "1-bone"})`;
      els.ikSelect.appendChild(opt);
    }
  }
  if (els.ikList) {
    els.ikList.innerHTML = "";
    if (list.length === 0) {
      els.ikList.innerHTML = "<div class='muted'>No IK constraints yet.</div>";
    } else {
      for (let i = 0; i < list.length; i += 1) {
        const c = list[i];
        const row = document.createElement("div");
        row.className = `tree-item${state.selectedIK === i ? " selected" : ""}`;
        row.dataset.ikIndex = String(i);
        row.textContent = `${i}: ${c.name} [${(c.bones || []).length >= 2 ? "2-bone" : "1-bone"}] ${
          c.enabled === false ? "(off)" : ""
        }`;
        els.ikList.appendChild(row);
      }
    }
  }
  if (state.selectedIK < 0 || state.selectedIK >= list.length) state.selectedIK = list.length > 0 ? 0 : -1;
  const c = getActiveIKConstraint();
  if (els.ikRemoveBtn) els.ikRemoveBtn.disabled = !c;
  if (els.ikMoveUpBtn) els.ikMoveUpBtn.disabled = !c || state.selectedIK <= 0;
  if (els.ikMoveDownBtn) {
    const len = ensureIKConstraints(m).length;
    els.ikMoveDownBtn.disabled = !c || state.selectedIK < 0 || state.selectedIK >= len - 1;
  }
  if (els.ikPickTargetBtn) {
    els.ikPickTargetBtn.disabled = !c;
    els.ikPickTargetBtn.textContent = state.ikPickArmed ? "Cancel Target Pick" : "Pick Target in Canvas";
  }
  if (!c) {
    if (els.ikName) els.ikName.value = "";
    if (els.ikHint) els.ikHint.textContent = "No IK constraint. Add IK 1-Bone or 2-Bone.";
    return;
  }
  if (els.ikSelect) els.ikSelect.value = String(state.selectedIK);
  if (els.ikName) els.ikName.value = c.name || `ik_${state.selectedIK}`;
  if (els.ikEnabled) els.ikEnabled.value = c.enabled === false ? "false" : "true";
  if (els.ikTargetBone) els.ikTargetBone.value = String(Number.isFinite(Number(c.target)) ? Number(c.target) : -1);
  if (els.ikBoneA) els.ikBoneA.value = String(Number((c.bones || [0])[0]));
  if (els.ikBoneB) els.ikBoneB.value = (c.bones || []).length >= 2 ? String(Number(c.bones[1])) : "-1";
  if (els.ikEndMode) {
    const twoBone = (c.bones || []).length >= 2;
    els.ikEndMode.disabled = !twoBone;
    els.ikEndMode.value = c.endMode === "tail" ? "tail" : "head";
    const wrap = els.ikEndMode.closest("label");
    if (wrap) wrap.style.display = "";
  }
  if (els.ikMix) els.ikMix.value = String(math.clamp(Number(c.mix) || 0, 0, 1));
  if (els.ikBendDir) els.ikBendDir.value = c.bendPositive === false ? "-1" : "1";
  if (els.ikHint) {
    const bList = (c.bones || []).map((bi) => m.rigBones[bi]?.name || bi).join(" -> ");
    const tName =
      Number.isFinite(Number(c.target)) && Number(c.target) >= 0 && Number(c.target) < m.rigBones.length
        ? m.rigBones[c.target]?.name || c.target
        : `point(${Number(c.targetX || 0).toFixed(1)}, ${Number(c.targetY || 0).toFixed(1)})`;
    els.ikHint.textContent = `IK ${c.name}: ${bList} -> target ${tName}, mix ${Number(c.mix).toFixed(2)} (${c.enabled === false ? "off" : "on"})${
      state.ikPickArmed ? " | target-pick: click a bone in canvas" : ""
    }`;
  }
}

function addTransformConstraint() {
  const m = state.mesh;
  if (!m || !Array.isArray(m.rigBones) || m.rigBones.length < 2) return false;
  const list = ensureTransformConstraints(m);
  const selected = Number.isFinite(state.selectedBone) && state.selectedBone >= 0 ? state.selectedBone : 0;
  const target = Math.max(0, Math.min(m.rigBones.length - 1, selected));
  let bone = target;
  if (Number.isFinite(m.rigBones[target] && m.rigBones[target].parent) && Number(m.rigBones[target].parent) >= 0) {
    bone = Number(m.rigBones[target].parent);
  } else {
    for (let i = 0; i < m.rigBones.length; i += 1) {
      if (i !== target) {
        bone = i;
        break;
      }
    }
  }
  const c = {
    name: `transform_${list.length}`,
    bones: bone === target ? [] : [bone],
    target,
    rotateMix: 1,
    translateMix: 1,
    scaleMix: 0,
    shearMix: 0,
    offsetX: 0,
    offsetY: 0,
    offsetRot: 0,
    offsetScaleX: 0,
    offsetScaleY: 0,
    offsetShearY: 0,
    local: false,
    relative: false,
    order: list.length,
    skinRequired: false,
    enabled: true,
  };
  if (c.bones.length === 0) return false;
  list.push(c);
  state.selectedTransform = list.length - 1;
  refreshTransformUI();
  renderBoneTree();
  return true;
}

function removeSelectedTransformConstraint() {
  const m = state.mesh;
  if (!m) return false;
  const list = ensureTransformConstraints(m);
  if (state.selectedTransform < 0 || state.selectedTransform >= list.length) return false;
  list.splice(state.selectedTransform, 1);
  state.selectedTransform = list.length > 0 ? Math.min(state.selectedTransform, list.length - 1) : -1;
  refreshTransformUI();
  renderBoneTree();
  return true;
}

function refreshTransformUI() {
  const m = state.mesh;
  if (!els.tfcSelect) return;
  if (!m || !Array.isArray(m.rigBones) || m.rigBones.length === 0) {
    els.tfcSelect.innerHTML = "";
    if (els.tfcList) els.tfcList.innerHTML = "<div class='muted'>No bones.</div>";
    return;
  }
  const list = ensureTransformConstraints(m);
  if (state.selectedTransform < 0 || state.selectedTransform >= list.length) {
    state.selectedTransform = list.length > 0 ? 0 : -1;
  }
  const filterText = (els.tfcBoneSearch && els.tfcBoneSearch.value ? els.tfcBoneSearch.value : "").trim().toLowerCase();
  const fillBoneSelect = (sel, allowNone = false, withFilter = false) => {
    if (!sel) return;
    const prevSelected = new Set(Array.from(sel.selectedOptions || []).map((o) => String(o.value)));
    sel.innerHTML = "";
    if (allowNone) {
      const none = document.createElement("option");
      none.value = "-1";
      none.textContent = "-1: None";
      sel.appendChild(none);
    }
    for (let i = 0; i < m.rigBones.length; i += 1) {
      const label = `${i}: ${m.rigBones[i].name}`;
      if (withFilter && filterText.length > 0 && !label.toLowerCase().includes(filterText)) continue;
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = label;
      if (prevSelected.has(opt.value)) opt.selected = true;
      sel.appendChild(opt);
    }
  };
  fillBoneSelect(els.tfcTargetBone, true, false);
  fillBoneSelect(els.tfcBones, false, true);
  els.tfcSelect.innerHTML = "";
  for (let i = 0; i < list.length; i += 1) {
    const c = list[i];
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = `${i}: ${c.name}`;
    els.tfcSelect.appendChild(opt);
  }
  if (els.tfcList) {
    els.tfcList.innerHTML = "";
    if (list.length === 0) {
      els.tfcList.innerHTML = "<div class='muted'>No Transform constraints yet.</div>";
    } else {
      for (let i = 0; i < list.length; i += 1) {
        const c = list[i];
        const row = document.createElement("div");
        row.className = `tree-item${state.selectedTransform === i ? " selected" : ""}`;
        row.dataset.tfcIndex = String(i);
        row.textContent = `${i}: ${c.name}${c.enabled === false ? " (off)" : ""}`;
        els.tfcList.appendChild(row);
      }
    }
  }
  const c = getActiveTransformConstraint();
  if (els.tfcMoveUpBtn) els.tfcMoveUpBtn.disabled = !c || state.selectedTransform <= 0;
  if (els.tfcMoveDownBtn) els.tfcMoveDownBtn.disabled = !c || state.selectedTransform >= list.length - 1;
  if (els.tfcRemoveBtn) els.tfcRemoveBtn.disabled = !c;
  if (!c) {
    if (els.tfcName) els.tfcName.value = "";
    if (els.tfcHint) els.tfcHint.textContent = "No Transform constraint. Add one.";
    return;
  }
  if (els.tfcSelect) els.tfcSelect.value = String(state.selectedTransform);
  if (els.tfcName) els.tfcName.value = c.name || `transform_${state.selectedTransform}`;
  if (els.tfcEnabled) els.tfcEnabled.value = c.enabled === false ? "false" : "true";
  if (els.tfcTargetBone) els.tfcTargetBone.value = String(c.target);
  if (els.tfcLocal) els.tfcLocal.value = c.local ? "true" : "false";
  if (els.tfcRelative) els.tfcRelative.value = c.relative ? "true" : "false";
  if (els.tfcRotateMix) els.tfcRotateMix.value = String(Number(c.rotateMix || 0).toFixed(3));
  if (els.tfcTranslateMix) els.tfcTranslateMix.value = String(Number(c.translateMix || 0).toFixed(3));
  if (els.tfcScaleMix) els.tfcScaleMix.value = String(Number(c.scaleMix || 0).toFixed(3));
  if (els.tfcShearMix) els.tfcShearMix.value = String(Number(c.shearMix || 0).toFixed(3));
  if (els.tfcOffsetX) els.tfcOffsetX.value = String(Number(c.offsetX) || 0);
  if (els.tfcOffsetY) els.tfcOffsetY.value = String(Number(c.offsetY) || 0);
  if (els.tfcOffsetRot) els.tfcOffsetRot.value = String(Number(c.offsetRot) || 0);
  if (els.tfcOffsetScaleX) els.tfcOffsetScaleX.value = String(Number(c.offsetScaleX) || 0);
  if (els.tfcOffsetScaleY) els.tfcOffsetScaleY.value = String(Number(c.offsetScaleY) || 0);
  if (els.tfcOffsetShearY) els.tfcOffsetShearY.value = String(Number(c.offsetShearY) || 0);
  if (els.tfcBones) {
    const set = new Set((c.bones || []).map((v) => Number(v)));
    for (const opt of els.tfcBones.options) opt.selected = set.has(Number(opt.value));
  }
  if (els.tfcHint) {
    const tName = m.rigBones[c.target] ? m.rigBones[c.target].name : c.target;
    const bNames = (c.bones || []).map((bi) => m.rigBones[bi]?.name || bi).join(", ");
    els.tfcHint.textContent = `Transform ${c.name}: [${bNames}] -> ${tName}, mix r${Number(c.rotateMix).toFixed(
      2
    )}/t${Number(c.translateMix).toFixed(2)}/s${Number(c.scaleMix).toFixed(2)}/h${Number(c.shearMix).toFixed(2)}`;
  }
}

function applyActiveTransformFromUI(updateBones = false) {
  const m = state.mesh;
  const c = getActiveTransformConstraint();
  if (!m || !c) return false;
  const prev = {
    rotateMix: Number(c.rotateMix) || 0,
    translateMix: Number(c.translateMix) || 0,
    scaleMix: Number(c.scaleMix) || 0,
    shearMix: Number(c.shearMix) || 0,
  };
  c.enabled = !els.tfcEnabled || els.tfcEnabled.value !== "false";
  c.name = els.tfcName ? els.tfcName.value.trim() || c.name : c.name;
  c.target = Number(els.tfcTargetBone ? els.tfcTargetBone.value : c.target);
  c.local = !!(els.tfcLocal && els.tfcLocal.value === "true");
  c.relative = !!(els.tfcRelative && els.tfcRelative.value === "true");
  c.rotateMix = math.clamp(Number(els.tfcRotateMix ? els.tfcRotateMix.value : c.rotateMix) || 0, 0, 1);
  c.translateMix = math.clamp(Number(els.tfcTranslateMix ? els.tfcTranslateMix.value : c.translateMix) || 0, 0, 1);
  c.scaleMix = math.clamp(Number(els.tfcScaleMix ? els.tfcScaleMix.value : c.scaleMix) || 0, 0, 1);
  c.shearMix = math.clamp(Number(els.tfcShearMix ? els.tfcShearMix.value : c.shearMix) || 0, 0, 1);
  c.offsetX = Number(els.tfcOffsetX ? els.tfcOffsetX.value : c.offsetX) || 0;
  c.offsetY = Number(els.tfcOffsetY ? els.tfcOffsetY.value : c.offsetY) || 0;
  c.offsetRot = Number(els.tfcOffsetRot ? els.tfcOffsetRot.value : c.offsetRot) || 0;
  c.offsetScaleX = Number(els.tfcOffsetScaleX ? els.tfcOffsetScaleX.value : c.offsetScaleX) || 0;
  c.offsetScaleY = Number(els.tfcOffsetScaleY ? els.tfcOffsetScaleY.value : c.offsetScaleY) || 0;
  c.offsetShearY = Number(els.tfcOffsetShearY ? els.tfcOffsetShearY.value : c.offsetShearY) || 0;
  if (updateBones && els.tfcBones) {
    const picked = Array.from(els.tfcBones.selectedOptions)
      .map((o) => Number(o.value))
      .filter((v) => Number.isFinite(v));
    c.bones = [...new Set(picked)].filter((bi) => bi !== c.target);
  }
  if (!Number.isFinite(c.target) || c.target < 0 || c.target >= m.rigBones.length || (c.bones || []).length === 0) {
    ensureTransformConstraints(m);
  }
  if (Math.abs((Number(c.rotateMix) || 0) - prev.rotateMix) > 1e-6) markDirtyTrack(getTransformTrackId(state.selectedTransform, "rotateMix"));
  if (Math.abs((Number(c.translateMix) || 0) - prev.translateMix) > 1e-6)
    markDirtyTrack(getTransformTrackId(state.selectedTransform, "translateMix"));
  if (Math.abs((Number(c.scaleMix) || 0) - prev.scaleMix) > 1e-6) markDirtyTrack(getTransformTrackId(state.selectedTransform, "scaleMix"));
  if (Math.abs((Number(c.shearMix) || 0) - prev.shearMix) > 1e-6) markDirtyTrack(getTransformTrackId(state.selectedTransform, "shearMix"));
  refreshTransformUI();
  refreshTrackSelect();
  renderTimelineTracks();
  renderBoneTree();
  return true;
}

function applyActiveIKFromUI() {
  const m = state.mesh;
  const c = getActiveIKConstraint();
  if (!m || !c) return false;
  const prevMix = Number(c.mix) || 0;
  const prevBend = c.bendPositive !== false;
  c.enabled = !els.ikEnabled || els.ikEnabled.value !== "false";
  c.target = Number(els.ikTargetBone ? els.ikTargetBone.value : c.target);
  c.mix = math.clamp(Number(els.ikMix ? els.ikMix.value : c.mix) || 0, 0, 1);
  c.bendPositive = !els.ikBendDir || els.ikBendDir.value !== "-1";
  c.endMode = !els.ikEndMode || els.ikEndMode.value !== "tail" ? "head" : "tail";
  const a = Number(els.ikBoneA ? els.ikBoneA.value : c.bones[0]);
  const b = Number(els.ikBoneB ? els.ikBoneB.value : -1);
  if (Number.isFinite(a) && a >= 0 && a < m.rigBones.length) {
    if (Number.isFinite(b) && b >= 0 && b < m.rigBones.length && Number(m.rigBones[b] && m.rigBones[b].parent) === a) {
      c.bones = [a, b];
    } else {
      c.bones = [a];
    }
  }
  if (Array.isArray(c.bones) && c.bones.includes(c.target)) {
    c.target = -1;
  }
  if (!Number.isFinite(c.target) || c.target < 0 || c.target >= m.rigBones.length) {
    c.target = -1;
    if (!Number.isFinite(c.targetX) || !Number.isFinite(c.targetY)) {
      const tp = getIKConstraintEndPointWorld(getPoseBones(m), c);
      if (tp) {
        c.targetX = tp.x;
        c.targetY = tp.y;
      } else {
        c.targetX = 0;
        c.targetY = 0;
      }
    }
  }
  if ((c.bones || []).length < 2) c.endMode = "tail";
  if (Math.abs((Number(c.mix) || 0) - prevMix) > 1e-6) markDirtyByIKProp(state.selectedIK, "mix");
  if ((c.bendPositive !== false) !== prevBend) markDirtyByIKProp(state.selectedIK, "bend");
  ensureIKConstraints(m);
  refreshIKUI();
  renderBoneTree();
  return true;
}

function getSlotTransformMatrix(slot, poseWorld) {
  const m = state.mesh;
  if (!m || !slot) return createIdentity();
  const tx = Number(slot.tx) || 0;
  const ty = Number(slot.ty) || 0;
  const rot = Number(slot.rot) || 0;
  if (Math.abs(tx) < 1e-6 && Math.abs(ty) < 1e-6 && Math.abs(rot) < 1e-6) return createIdentity();
  const boneIdx = Number(slot.bone);
  if (Number.isFinite(boneIdx) && boneIdx >= 0 && boneIdx < poseWorld.length) {
    const bw = poseWorld[boneIdx];
    return mul(mul(bw, matFromTR(tx, ty, rot)), invert(bw));
  }
  const pivot = matFromTR((state.imageWidth || 0) * 0.5, (state.imageHeight || 0) * 0.5, 0);
  return mul(mul(pivot, matFromTR(tx, ty, rot)), invert(pivot));
}

function rebuildSlotTriangleIndices() {
  const m = state.mesh;
  if (!m) return;
  for (const s of state.slots) {
    if (!s) continue;
    ensureSlotMeshData(s, m);
    s._indices = null;
  }
}

function buildSlotGeometry(slot, poseWorld) {
  const m = state.mesh;
  if (!m) return { interleaved: null, screen: null };
  ensureSlotMeshData(slot, m);
  const sm = slot && slot.meshData ? slot.meshData : null;
  if (!sm) return { interleaved: null, screen: null };
  const offsets = sm.offsets;
  const tm = getSlotTransformMatrix(slot, poseWorld);
  const vCount = sm.positions.length / 2;
  const mode = getSlotWeightMode(slot);
  const boneCount = mode === "free" ? 0 : m.rigBones.length;
  if (!sm.interleaved || sm.interleaved.length !== vCount * 4) sm.interleaved = new Float32Array(vCount * 4);
  if (!sm.deformedScreen || sm.deformedScreen.length !== vCount * 2) sm.deformedScreen = new Float32Array(vCount * 2);
  if (!sm.deformedLocal || sm.deformedLocal.length !== vCount * 2) sm.deformedLocal = new Float32Array(vCount * 2);
  for (let i = 0; i < vCount; i += 1) {
    const x = sm.positions[i * 2];
    const y = sm.positions[i * 2 + 1];
    let sx = x;
    let sy = y;
    if (boneCount > 0) {
      sx = 0;
      sy = 0;
      for (let b = 0; b < boneCount; b += 1) {
        const w = sm.weights[i * boneCount + b];
        if (w <= 0) continue;
        const skinned = transformPoint(mul(poseWorld[b], m.invBind[b]), x, y);
        sx += skinned.x * w;
        sy += skinned.y * w;
      }
    }
    const lx = sx + (offsets[i * 2] || 0);
    const ly = sy + (offsets[i * 2 + 1] || 0);
    sm.deformedLocal[i * 2] = lx;
    sm.deformedLocal[i * 2 + 1] = ly;
    const p = transformPoint(tm, lx, ly);
    const s = localToScreen(p.x, p.y);
    sm.deformedScreen[i * 2] = s.x;
    sm.deformedScreen[i * 2 + 1] = s.y;
    sm.interleaved[i * 4] = s.x;
    sm.interleaved[i * 4 + 1] = s.y;
    sm.interleaved[i * 4 + 2] = sm.uvs[i * 2];
    sm.interleaved[i * 4 + 3] = sm.uvs[i * 2 + 1];
  }
  return { interleaved: sm.interleaved, screen: sm.deformedScreen, indices: sm.indices, uvs: sm.uvs };
}

function collectPsdLayerSlots(children, out, docW, docH, prefix = "") {
  if (!Array.isArray(children)) return;
  for (const layer of children) {
    const layerName = layer && layer.name ? layer.name : "Layer";
    const fullName = prefix ? `${prefix}/${layerName}` : layerName;
    if (Array.isArray(layer.children) && layer.children.length > 0) {
      collectPsdLayerSlots(layer.children, out, docW, docH, fullName);
    }
    if (layer && layer.canvas) {
      const b = getCanvasAlphaBounds(layer.canvas);
      if (!b) continue;
      const cropped = makeCanvas(b.w, b.h);
      const cctx = cropped.getContext("2d");
      if (!cctx) continue;
      cctx.drawImage(layer.canvas, b.x, b.y, b.w, b.h, 0, 0, b.w, b.h);
      const lx = Number.isFinite(layer.left) ? layer.left : 0;
      const ly = Number.isFinite(layer.top) ? layer.top : 0;
      out.push({
        name: fullName,
        canvas: cropped,
        useWeights: true,
        weightBindMode: "single",
        weightMode: "single",
        docWidth: docW,
        docHeight: docH,
        rect: { x: lx + b.x, y: ly + b.y, w: b.w, h: b.h },
      });
    }
  }
}

async function loadFileSlots(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".psd")) {
    setStatus("Loading PSD via ag-psd from CDN...");
    const mod = await import("https://esm.sh/ag-psd@28.4.1");
    const psd = mod.readPsd(await file.arrayBuffer());
    const docW =
      (Number.isFinite(psd.width) ? psd.width : 0) ||
      (psd.canvas ? psd.canvas.width : 0) ||
      (psd.imageData ? psd.imageData.width : 0);
    const docH =
      (Number.isFinite(psd.height) ? psd.height : 0) ||
      (psd.canvas ? psd.canvas.height : 0) ||
      (psd.imageData ? psd.imageData.height : 0);
    const slots = [];
    collectPsdLayerSlots(psd.children, slots, docW, docH);
    if (slots.length > 0) return slots;
    let src = psd.canvas;
    if (!src && psd.imageData) {
      src = makeCanvas(psd.imageData.width, psd.imageData.height);
      src.getContext("2d").putImageData(psd.imageData, 0, 0);
    }
    if (!src) throw new Error("PSD loaded but no raster canvas found.");
    return [
      {
        name: file.name.replace(/\.psd$/i, ""),
        canvas: src,
        useWeights: true,
        weightBindMode: "single",
        weightMode: "single",
        docWidth: src.width,
        docHeight: src.height,
        rect: { x: 0, y: 0, w: src.width, h: src.height },
      },
    ];
  }

  const bmp = await createImageBitmap(file);
  const c = makeCanvas(bmp.width, bmp.height);
  c.width = bmp.width;
  c.height = bmp.height;
  c.getContext("2d").drawImage(bmp, 0, 0);
  const base = file.name.replace(/\.[^.]+$/, "");
  return [
    {
      name: base,
      canvas: c,
      bone: -1,
      useWeights: true,
      weightBindMode: "auto",
      weightMode: "weighted",
      docWidth: c.width,
      docHeight: c.height,
      rect: { x: 0, y: 0, w: c.width, h: c.height },
    },
  ];
}

function resize() {
  const rect = els.stage.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const w = Math.max(1, Math.floor(rect.width * dpr));
  const h = Math.max(1, Math.floor(rect.height * dpr));

  if (els.glCanvas.width !== w || els.glCanvas.height !== h) {
    els.glCanvas.width = w;
    els.glCanvas.height = h;
    els.overlay.width = w;
    els.overlay.height = h;
  }

  if (hasGL) {
    gl.viewport(0, 0, w, h);
  }

  if (state.imageWidth > 0 && state.imageHeight > 0) {
    const fit = Math.min(w / state.imageWidth, h / state.imageHeight) * 0.92;
    state.view.scale = fit;
    state.view.cx = w * 0.5;
    state.view.cy = h * 0.5;
  }
}

function localToScreen(x, y) {
  return {
    x: state.view.cx + (x - state.imageWidth * 0.5) * state.view.scale,
    y: state.view.cy + (y - state.imageHeight * 0.5) * state.view.scale,
  };
}

function screenToLocal(x, y) {
  return {
    x: (x - state.view.cx) / state.view.scale + state.imageWidth * 0.5,
    y: (y - state.view.cy) / state.view.scale + state.imageHeight * 0.5,
  };
}

function updateDeformation(offsetsOverride = null) {
  const m = state.mesh;
  if (!m) return;
  const offsets = offsetsOverride || getActiveOffsets(m);

  const poseBones = getPoseBones(m);
  enforceConnectedHeads(poseBones);
  const world = state.boneMode === "pose" ? getSolvedPoseWorld(m) : computeWorld(poseBones);
  const vCount = getVertexCount(m);
  const boneCount = poseBones.length;

  for (let i = 0; i < vCount; i += 1) {
    const x = m.positions[i * 2];
    const y = m.positions[i * 2 + 1];
    let sx = x;
    let sy = y;
    if (boneCount > 0) {
      sx = 0;
      sy = 0;
      for (let b = 0; b < boneCount; b += 1) {
        const w = m.weights[i * boneCount + b];
        if (w <= 0) continue;
        const skinned = transformPoint(mul(world[b], m.invBind[b]), x, y);
        sx += skinned.x * w;
        sy += skinned.y * w;
      }
    }

    m.skinnedLocal[i * 2] = sx;
    m.skinnedLocal[i * 2 + 1] = sy;

    const lx = sx + (offsets[i * 2] || 0);
    const ly = sy + (offsets[i * 2 + 1] || 0);

    m.deformedLocal[i * 2] = lx;
    m.deformedLocal[i * 2 + 1] = ly;

    const s = localToScreen(lx, ly);
    m.deformedScreen[i * 2] = s.x;
    m.deformedScreen[i * 2 + 1] = s.y;

    m.interleaved[i * 4] = s.x;
    m.interleaved[i * 4 + 1] = s.y;
    m.interleaved[i * 4 + 2] = m.uvs[i * 2];
    m.interleaved[i * 4 + 3] = m.uvs[i * 2 + 1];
  }
}

function getSolvedPoseWorld(m) {
  if (!m) return [];
  const pose = cloneBones(getPoseBones(m));
  enforceConnectedHeads(pose);
  if (state.boneMode === "pose") {
    applyPathConstraintsToBones(m, pose);
    enforceConnectedHeads(pose);
    applyTransformConstraintsToBones(m, pose);
    enforceConnectedHeads(pose);
    applyIKConstraintsToBones(m, pose);
    enforceConnectedHeads(pose);
  }
  return computeWorld(pose);
}

function drawOverlay() {
  const m = state.mesh;
  const ctx = overlayCtx;
  ctx.clearRect(0, 0, els.overlay.width, els.overlay.height);
  if (!m) return;

  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(80, 180, 220, 0.28)";
  let meshForOverlay = m;
  let screenForOverlay = m.deformedScreen;
  if (state.slots.length > 0) {
    const slot = getActiveSlot();
    if (slot) {
      const poseWorld = getSolvedPoseWorld(m);
      const geom = buildSlotGeometry(slot, poseWorld);
      if (slot.meshData && geom.screen) {
        meshForOverlay = slot.meshData;
        screenForOverlay = geom.screen;
      }
    }
  }
  const isGridMesh =
    Number.isFinite(meshForOverlay.cols) &&
    Number.isFinite(meshForOverlay.rows) &&
    meshForOverlay.cols > 0 &&
    meshForOverlay.rows > 0 &&
    (meshForOverlay.cols + 1) * (meshForOverlay.rows + 1) === screenForOverlay.length / 2;

  if (state.editMode === "slotmesh") {
    const slot = getActiveSlot();
    if (slot) {
      const contour = ensureSlotContour(slot);
      if (contour.closed && contour.points.length >= 3) {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.42)";
        ctx.fillRect(0, 0, els.overlay.width, els.overlay.height);
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        for (let i = 0; i < contour.points.length; i += 1) {
          const p = contour.points[i];
          const s = localToScreen(p.x, p.y);
          if (i === 0) ctx.moveTo(s.x, s.y);
          else ctx.lineTo(s.x, s.y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
  }

  if (isGridMesh) {
    for (let y = 0; y <= meshForOverlay.rows; y += 1) {
      ctx.beginPath();
      for (let x = 0; x <= meshForOverlay.cols; x += 1) {
        const i = y * (meshForOverlay.cols + 1) + x;
        const px = screenForOverlay[i * 2];
        const py = screenForOverlay[i * 2 + 1];
        if (x === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    for (let x = 0; x <= meshForOverlay.cols; x += 1) {
      ctx.beginPath();
      for (let y = 0; y <= meshForOverlay.rows; y += 1) {
        const i = y * (meshForOverlay.cols + 1) + x;
        const px = screenForOverlay[i * 2];
        const py = screenForOverlay[i * 2 + 1];
        if (y === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  } else if (meshForOverlay.indices && meshForOverlay.indices.length > 0) {
    const idx = meshForOverlay.indices;
    for (let t = 0; t + 2 < idx.length; t += 3) {
      const i0 = idx[t];
      const i1 = idx[t + 1];
      const i2 = idx[t + 2];
      const p0x = screenForOverlay[i0 * 2];
      const p0y = screenForOverlay[i0 * 2 + 1];
      const p1x = screenForOverlay[i1 * 2];
      const p1y = screenForOverlay[i1 * 2 + 1];
      const p2x = screenForOverlay[i2 * 2];
      const p2y = screenForOverlay[i2 * 2 + 1];
      ctx.beginPath();
      ctx.moveTo(p0x, p0y);
      ctx.lineTo(p1x, p1y);
      ctx.lineTo(p2x, p2y);
      ctx.closePath();
      ctx.stroke();
    }
  }

  if (state.editMode !== "slotmesh") {
    const bones = getActiveBones(m);
    const world = state.boneMode === "pose" ? getSolvedPoseWorld(m) : (enforceConnectedHeads(bones), computeWorld(bones));
    const ikBones = getIkConstrainedBoneSet(m);
    const ikTargets = getIkTargetBoneSet(m);
    const tfcBones = getTransformConstrainedBoneSet(m);
    const tfcTargets = getTransformTargetBoneSet(m);
    const pathBones = getPathConstrainedBoneSet(m);
    const pathTargets = getPathTargetBoneSet(m);
    for (let i = 0; i < bones.length; i += 1) {
      const b = bones[i];
      const start = transformPoint(world[i], 0, 0);
      const end = transformPoint(world[i], b.length, 0);
      const ss = localToScreen(start.x, start.y);
      const es = localToScreen(end.x, end.y);

    const isPrimarySelected = i === state.selectedBone;
    const isMultiSelected = Array.isArray(state.selectedBonesForWeight) && state.selectedBonesForWeight.includes(i);
    const isParentCandidate = state.parentPickArmed && state.parentHoverBone === i;
    const isIkTargetCandidate = state.ikPickArmed && state.ikHoverBone === i;
    const isIKBone = ikBones.has(i);
    const isIKTarget = ikTargets.has(i);
    const isTFCBone = tfcBones.has(i);
    const isTFCTarget = tfcTargets.has(i);
    const isPathBone = pathBones.has(i);
    const isPathTarget = pathTargets.has(i);
    if (isPrimarySelected) {
      ctx.strokeStyle = "rgba(255, 236, 153, 0.28)";
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(ss.x, ss.y);
      ctx.lineTo(es.x, es.y);
      ctx.stroke();
    } else if (isMultiSelected) {
      ctx.strokeStyle = "rgba(125, 211, 252, 0.25)";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(ss.x, ss.y);
      ctx.lineTo(es.x, es.y);
      ctx.stroke();
    }

    ctx.strokeStyle = isParentCandidate
      ? "#ff7ad9"
      : isPrimarySelected
        ? "#ffe46e"
        : isMultiSelected
          ? "#7dd3fc"
          : isIKBone
            ? "#5df5ff"
          : isIKTarget
            ? "#6effd8"
          : isTFCBone
            ? "#f8a3ff"
          : isTFCTarget
            ? "#ffcc66"
          : isPathBone
            ? "#7ea4ff"
          : isPathTarget
            ? "#9ac4ff"
          : state.addBoneArmed
            ? "rgba(246,184,76,0.55)"
            : b.connected
              ? "#f6b84c"
              : "#7dd3fc";
    ctx.lineWidth = isPrimarySelected || isParentCandidate ? 4 : isMultiSelected ? 3 : 2;
    ctx.beginPath();
    ctx.moveTo(ss.x, ss.y);
    ctx.lineTo(es.x, es.y);
    ctx.stroke();

    ctx.fillStyle = isParentCandidate
      ? "#ffd0f5"
      : isPrimarySelected
        ? "#fff0b8"
        : isMultiSelected
          ? "#d3f2ff"
          : isIKTarget
            ? "#b8ffea"
            : "#ffd9a0";
    ctx.beginPath();
    ctx.arc(ss.x, ss.y, isPrimarySelected || isParentCandidate ? 6 : isMultiSelected ? 5.5 : 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(es.x, es.y, isPrimarySelected || isParentCandidate ? 8 : isMultiSelected ? 7 : 6, 0, Math.PI * 2);
    ctx.fill();

      if (isIkTargetCandidate) {
        ctx.strokeStyle = "#6effd8";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(es.x, es.y, 12, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (isPrimarySelected) {
        ctx.fillStyle = "#ffe46e";
        ctx.font = "12px Segoe UI, sans-serif";
        ctx.fillText("SEL", es.x + 10, es.y - 8);
      } else if (isIkTargetCandidate) {
        ctx.fillStyle = "#84ffe0";
        ctx.font = "12px Segoe UI, sans-serif";
        ctx.fillText("IK TARGET", es.x + 10, es.y - 8);
      } else if (isIKBone) {
        ctx.fillStyle = "#8cf7ff";
        ctx.font = "12px Segoe UI, sans-serif";
        ctx.fillText("IK", es.x + 10, es.y - 8);
      } else if (isIKTarget) {
        ctx.fillStyle = "#9effee";
        ctx.font = "12px Segoe UI, sans-serif";
        ctx.fillText("IK-T", es.x + 10, es.y - 8);
      } else if (isTFCBone) {
        ctx.fillStyle = "#ffc1ff";
        ctx.font = "12px Segoe UI, sans-serif";
        ctx.fillText("TC", es.x + 10, es.y - 8);
      } else if (isTFCTarget) {
        ctx.fillStyle = "#ffe3a8";
        ctx.font = "12px Segoe UI, sans-serif";
        ctx.fillText("TC-T", es.x + 10, es.y - 8);
      } else if (isPathBone) {
        ctx.fillStyle = "#b7c9ff";
        ctx.font = "12px Segoe UI, sans-serif";
        ctx.fillText("PATH", es.x + 10, es.y - 8);
      } else if (isPathTarget) {
        ctx.fillStyle = "#cde0ff";
        ctx.font = "12px Segoe UI, sans-serif";
        ctx.fillText("PTH-T", es.x + 10, es.y - 8);
      } else if (isParentCandidate) {
        ctx.fillStyle = "#ff9de3";
        ctx.font = "12px Segoe UI, sans-serif";
        ctx.fillText("PARENT", es.x + 10, es.y - 8);
      }
    }

    if (state.boneMode === "pose") {
      const list = ensureIKConstraints(m).filter((c) => c && c.enabled !== false);
      const selected = getActiveIKConstraint();
      for (let ci = 0; ci < list.length; ci += 1) {
        const ik = list[ci];
        const tw = getIKSolveTargetWorld(bones, ik);
        if (!tw) continue;
        const ts = localToScreen(tw.x, tw.y);
        const isActive = selected && selected === ik;
        ctx.strokeStyle = isActive ? "#6effd8" : "rgba(110, 255, 216, 0.7)";
        ctx.fillStyle = isActive ? "#6effd8" : "rgba(110, 255, 216, 0.5)";
        ctx.lineWidth = isActive ? 2.2 : 1.4;
        ctx.beginPath();
        ctx.arc(ts.x, ts.y, isActive ? 7 : 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ts.x - 8, ts.y);
        ctx.lineTo(ts.x + 8, ts.y);
        ctx.moveTo(ts.x, ts.y - 8);
        ctx.lineTo(ts.x, ts.y + 8);
        ctx.stroke();
        const chain = Array.isArray(ik.bones) ? ik.bones : [];
        if (chain.length > 0) {
          const endBi = chain[chain.length - 1];
          if (Number.isFinite(endBi) && endBi >= 0 && endBi < bones.length) {
            const ep =
              chain.length >= 2 && ik.endMode !== "tail"
                ? transformPoint(world[endBi], 0, 0)
                : transformPoint(world[endBi], Number(bones[endBi].length) || 0, 0);
            const es = localToScreen(ep.x, ep.y);
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = isActive ? "rgba(110,255,216,0.95)" : "rgba(110,255,216,0.6)";
            ctx.beginPath();
            ctx.moveTo(es.x, es.y);
            ctx.lineTo(ts.x, ts.y);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
        if (isActive) {
          ctx.fillStyle = "#9effee";
          ctx.font = "12px Segoe UI, sans-serif";
          ctx.fillText(
            `IK ${ik.name} | mix ${Number(ik.mix).toFixed(2)} | ${ik.bendPositive === false ? "bend -" : "bend +"}`,
            ts.x + 10,
            ts.y + 16
          );
        }
      }
      const tList = ensureTransformConstraints(m).filter((c) => c && c.enabled !== false);
      const tSelected = getActiveTransformConstraint();
      for (const tc of tList) {
        if (!tc) continue;
        const ti = Number(tc.target);
        if (!Number.isFinite(ti) || ti < 0 || ti >= bones.length) continue;
        const tHead = transformPoint(world[ti], 0, 0);
        const ts = localToScreen(tHead.x, tHead.y);
        const isActive = !!(tSelected && tSelected === tc);
        ctx.strokeStyle = isActive ? "#ffc1ff" : "rgba(255, 193, 255, 0.65)";
        ctx.lineWidth = isActive ? 2 : 1.2;
        ctx.beginPath();
        ctx.rect(ts.x - 5, ts.y - 5, 10, 10);
        ctx.stroke();
        for (const bi of tc.bones || []) {
          if (!Number.isFinite(bi) || bi < 0 || bi >= bones.length) continue;
          const bh = transformPoint(world[bi], 0, 0);
          const bs = localToScreen(bh.x, bh.y);
          ctx.setLineDash([4, 3]);
          ctx.strokeStyle = isActive ? "rgba(255,193,255,0.95)" : "rgba(255,193,255,0.55)";
          ctx.beginPath();
          ctx.moveTo(ts.x, ts.y);
          ctx.lineTo(bs.x, bs.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    }
  }

  if (state.editMode === "vertex") {
    ctx.fillStyle = "rgba(220, 245, 255, 0.92)";
    for (let i = 0; i < screenForOverlay.length / 2; i += 1) {
      ctx.beginPath();
      ctx.arc(screenForOverlay[i * 2], screenForOverlay[i * 2 + 1], 2.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (state.editMode === "slotmesh") {
    const slot = getActiveSlot();
    if (slot) {
      const contour = ensureSlotContour(slot);
      const activeSet = state.slotMesh.activeSet === "fill" ? "fill" : "contour";
      const triIdx =
        Array.isArray(contour.fillTriangles) && contour.fillTriangles.length >= 3 ? contour.fillTriangles : contour.triangles;
      const triPts =
        Array.isArray(contour.fillPoints) && contour.fillPoints.length >= 3 ? contour.fillPoints : contour.points;
      if (Array.isArray(triIdx) && triIdx.length >= 3) {
        ctx.strokeStyle = "rgba(63, 208, 162, 0.65)";
        ctx.lineWidth = 1.2;
        for (let t = 0; t + 2 < triIdx.length; t += 3) {
          const a = triPts[triIdx[t]];
          const b = triPts[triIdx[t + 1]];
          const c = triPts[triIdx[t + 2]];
          if (!a || !b || !c) continue;
          const sa = localToScreen(a.x, a.y);
          const sb = localToScreen(b.x, b.y);
          const sc = localToScreen(c.x, c.y);
          ctx.beginPath();
          ctx.moveTo(sa.x, sa.y);
          ctx.lineTo(sb.x, sb.y);
          ctx.lineTo(sc.x, sc.y);
          ctx.closePath();
          ctx.stroke();
        }
      }
      const drawManualEdges = (points, edges, color) => {
        if (!Array.isArray(points) || !Array.isArray(edges) || points.length === 0) return;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.2;
        for (const e of edges) {
          if (!Array.isArray(e) || e.length < 2) continue;
          const a = points[e[0]];
          const b = points[e[1]];
          if (!a || !b) continue;
          const sa = localToScreen(a.x, a.y);
          const sb = localToScreen(b.x, b.y);
          ctx.beginPath();
          ctx.moveTo(sa.x, sa.y);
          ctx.lineTo(sb.x, sb.y);
          ctx.stroke();
        }
      };
      drawManualEdges(contour.points, contour.manualEdges, "rgba(255, 158, 80, 0.95)");
      drawManualEdges(contour.fillPoints, contour.fillManualEdges, "rgba(255, 120, 168, 0.95)");

      ctx.strokeStyle = contour.closed ? "#66f2cc" : "#7dd3fc";
      ctx.lineWidth = 2;
      if (contour.points.length > 0) {
        ctx.beginPath();
        for (let i = 0; i < contour.points.length; i += 1) {
          const p = contour.points[i];
          const s = localToScreen(p.x, p.y);
          if (i === 0) ctx.moveTo(s.x, s.y);
          else ctx.lineTo(s.x, s.y);
        }
        if (contour.closed) ctx.closePath();
        ctx.stroke();
      }
      for (let i = 0; i < contour.fillPoints.length; i += 1) {
        const p = contour.fillPoints[i];
        const s = localToScreen(p.x, p.y);
        const active = activeSet === "fill" && i === state.slotMesh.activePoint;
        ctx.fillStyle = active ? "#ff8fd0" : "#88e9ff";
        ctx.beginPath();
        ctx.arc(s.x, s.y, active ? 5.8 : 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
      for (let i = 0; i < contour.points.length; i += 1) {
        const p = contour.points[i];
        const s = localToScreen(p.x, p.y);
        const active = activeSet === "contour" && i === state.slotMesh.activePoint;
        ctx.fillStyle = active ? "#ffe46e" : i === 0 ? "#66f2cc" : "#d3f2ff";
        ctx.beginPath();
        ctx.arc(s.x, s.y, active ? 6 : 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
      if (state.slotMesh.edgeSelectionSet && state.slotMesh.edgeSelection.length > 0) {
        const points = state.slotMesh.edgeSelectionSet === "fill" ? contour.fillPoints : contour.points;
        for (const i of state.slotMesh.edgeSelection) {
          const p = points[i];
          if (!p) continue;
          const s = localToScreen(p.x, p.y);
          ctx.strokeStyle = "#ff8a55";
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.arc(s.x, s.y, 8.5, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }
  }

  if (state.drag && state.drag.type === "vertex") {
    const i = state.drag.index;
    ctx.strokeStyle = "#ff7272";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(screenForOverlay[i * 2], screenForOverlay[i * 2 + 1], 8, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (state.drag && state.drag.type === "bone_marquee") {
    const x = Math.min(state.drag.startX, state.drag.curX);
    const y = Math.min(state.drag.startY, state.drag.curY);
    const w = Math.abs(state.drag.curX - state.drag.startX);
    const h = Math.abs(state.drag.curY - state.drag.startY);
    ctx.fillStyle = "rgba(125, 211, 252, 0.12)";
    ctx.strokeStyle = "rgba(125, 211, 252, 0.9)";
    ctx.lineWidth = 1.5;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
  }

  if (state.addBoneDraft) {
    const hs = localToScreen(state.addBoneDraft.head.x, state.addBoneDraft.head.y);
    const ts = localToScreen(state.addBoneDraft.tail.x, state.addBoneDraft.tail.y);
    ctx.strokeStyle = "#7dd3fc";
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(hs.x, hs.y);
    ctx.lineTo(ts.x, ts.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#d1f4ff";
    ctx.beginPath();
    ctx.arc(hs.x, hs.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ts.x, ts.y, 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawMesh2D(drawCanvas = state.sourceCanvas, alpha = 1, tint = null, screen = null, indices = null, uvs = null) {
  if (!stage2dCtx) return;
  const ctx = stage2dCtx;
  const m = state.mesh;
  if (!m || !drawCanvas) return;
  const tr = tint && Number.isFinite(tint.r) ? math.clamp(Number(tint.r), 0, 1) : 1;
  const tg = tint && Number.isFinite(tint.g) ? math.clamp(Number(tint.g), 0, 1) : 1;
  const tb = tint && Number.isFinite(tint.b) ? math.clamp(Number(tint.b), 0, 1) : 1;
  const useTint = Math.abs(tr - 1) > 1e-4 || Math.abs(tg - 1) > 1e-4 || Math.abs(tb - 1) > 1e-4;

  const iw = drawCanvas.width;
  const ih = drawCanvas.height;
  const index = indices || m.indices;
  const uvData = uvs || m.uvs;
  const expandForClip = (x0, y0, x1, y1, x2, y2, overlapPx = 0.6) => {
    const cx = (x0 + x1 + x2) / 3;
    const cy = (y0 + y1 + y2) / 3;
    const v0x = x0 - cx;
    const v0y = y0 - cy;
    const v1x = x1 - cx;
    const v1y = y1 - cy;
    const v2x = x2 - cx;
    const v2y = y2 - cy;
    const l0 = Math.hypot(v0x, v0y) || 1;
    const l1 = Math.hypot(v1x, v1y) || 1;
    const l2 = Math.hypot(v2x, v2y) || 1;
    return {
      x0: x0 + (v0x / l0) * overlapPx,
      y0: y0 + (v0y / l0) * overlapPx,
      x1: x1 + (v1x / l1) * overlapPx,
      y1: y1 + (v1y / l1) * overlapPx,
      x2: x2 + (v2x / l2) * overlapPx,
      y2: y2 + (v2y / l2) * overlapPx,
    };
  };

  for (let t = 0; t < index.length; t += 3) {
    const i0 = index[t];
    const i1 = index[t + 1];
    const i2 = index[t + 2];

    const sp = screen || m.deformedScreen;
    const sx0 = sp[i0 * 2];
    const sy0 = sp[i0 * 2 + 1];
    const sx1 = sp[i1 * 2];
    const sy1 = sp[i1 * 2 + 1];
    const sx2 = sp[i2 * 2];
    const sy2 = sp[i2 * 2 + 1];
    const screenArea2 = (sx1 - sx0) * (sy2 - sy0) - (sy1 - sy0) * (sx2 - sx0);
    if (Math.abs(screenArea2) < 1e-4) continue;

    const u0 = uvData[i0 * 2] * iw;
    const v0 = uvData[i0 * 2 + 1] * ih;
    const u1 = uvData[i1 * 2] * iw;
    const v1 = uvData[i1 * 2 + 1] * ih;
    const u2 = uvData[i2 * 2] * iw;
    const v2 = uvData[i2 * 2 + 1] * ih;

    const den = u0 * (v1 - v2) + u1 * (v2 - v0) + u2 * (v0 - v1);
    if (Math.abs(den) < 1e-8) continue;

    const a = (sx0 * (v1 - v2) + sx1 * (v2 - v0) + sx2 * (v0 - v1)) / den;
    const b = (sx0 * (u2 - u1) + sx1 * (u0 - u2) + sx2 * (u1 - u0)) / den;
    const c = (sx0 * (u1 * v2 - u2 * v1) + sx1 * (u2 * v0 - u0 * v2) + sx2 * (u0 * v1 - u1 * v0)) / den;
    const d = (sy0 * (v1 - v2) + sy1 * (v2 - v0) + sy2 * (v0 - v1)) / den;
    const e = (sy0 * (u2 - u1) + sy1 * (u0 - u2) + sy2 * (u1 - u0)) / den;
    const f = (sy0 * (u1 * v2 - u2 * v1) + sy1 * (u2 * v0 - u0 * v2) + sy2 * (u0 * v1 - u1 * v0)) / den;
    const exp = expandForClip(sx0, sy0, sx1, sy1, sx2, sy2, 0.55);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(exp.x0, exp.y0);
    ctx.lineTo(exp.x1, exp.y1);
    ctx.lineTo(exp.x2, exp.y2);
    ctx.closePath();
    ctx.clip();
    ctx.setTransform(a, d, b, e, c, f);
    ctx.globalAlpha = math.clamp(alpha, 0, 1);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(drawCanvas, 0, 0);
    if (useTint) {
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = `rgb(${Math.round(tr * 255)}, ${Math.round(tg * 255)}, ${Math.round(tb * 255)})`;
      ctx.fillRect(0, 0, iw, ih);
      ctx.globalCompositeOperation = "destination-atop";
      ctx.drawImage(drawCanvas, 0, 0);
      ctx.globalCompositeOperation = "source-over";
    }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
}

function render(ts = 0) {
  updateAnimationPlayback(ts);
  resize();
  if (state.mesh) {
    updateDeformation();
  }

  if (hasGL) {
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0.04, 0.06, 0.08, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (state.mesh && state.texture) {
      gl.useProgram(program);
      bindGeometry();
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.uniform2f(loc.uResolution, els.glCanvas.width, els.glCanvas.height);
      const slots = getRenderableSlots();
      const poseWorld = getSolvedPoseWorld(state.mesh);
      for (const slot of slots) {
        if (!slot || !slot.canvas || slot.visible === false) continue;
        const geom = buildSlotGeometry(slot, poseWorld);
        if (!geom.interleaved) continue;
        gl.bufferData(gl.ARRAY_BUFFER, geom.interleaved, gl.DYNAMIC_DRAW);
        const drawIndices = geom.indices || state.mesh.indices;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, drawIndices, gl.DYNAMIC_DRAW);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, state.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, slot.canvas);
        gl.uniform1f(loc.uAlpha, math.clamp(Number(slot.alpha) || 1, 0, 1));
        if (loc.uTint) {
          gl.uniform3f(
            loc.uTint,
            math.clamp(Number(slot.r) || 1, 0, 1),
            math.clamp(Number(slot.g) || 1, 0, 1),
            math.clamp(Number(slot.b) || 1, 0, 1)
          );
        }
        gl.drawElements(gl.TRIANGLES, drawIndices.length, gl.UNSIGNED_SHORT, 0);
      }
    }
  } else {
    const ctx = stage2dCtx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, els.glCanvas.width, els.glCanvas.height);
    ctx.fillStyle = "rgb(10, 15, 20)";
    ctx.fillRect(0, 0, els.glCanvas.width, els.glCanvas.height);
    const slots = getRenderableSlots();
    const poseWorld = state.mesh ? getSolvedPoseWorld(state.mesh) : [];
    for (const slot of slots) {
      if (!slot || !slot.canvas || slot.visible === false) continue;
      const geom = buildSlotGeometry(slot, poseWorld);
      drawMesh2D(
        slot.canvas,
        slot.alpha,
        { r: Number(slot.r) || 1, g: Number(slot.g) || 1, b: Number(slot.b) || 1 },
        geom.screen,
        geom.indices || state.mesh.indices,
        geom.uvs || state.mesh.uvs
      );
    }
  }

  drawOverlay();
  requestAnimationFrame(render);
}

function pickVertex(mx, my) {
  const m = state.mesh;
  if (!m) return -1;
  if (state.slots.length > 0) {
    const poseWorld = getSolvedPoseWorld(m);
    let best = -1;
    let bestDist2 = 11 * 11;
    let bestSlotIndex = -1;
    const searchSlots =
      state.slotViewMode === "all" ? state.slots.map((slot, idx) => ({ slot, idx })) : [{ slot: getActiveSlot(), idx: state.activeSlot }];
    for (const it of searchSlots) {
      if (!it || !it.slot || it.slot.visible === false) continue;
      const slot = it.slot;
      ensureSlotMeshData(slot, m);
      const geom = buildSlotGeometry(slot, poseWorld);
      const screen = geom.screen || m.deformedScreen;
      for (let i = 0; i < screen.length / 2; i += 1) {
        const dx = screen[i * 2] - mx;
        const dy = screen[i * 2 + 1] - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < bestDist2) {
          bestDist2 = d2;
          best = i;
          bestSlotIndex = it.idx;
        }
      }
    }
    if (best >= 0 && Number.isFinite(bestSlotIndex) && bestSlotIndex >= 0 && bestSlotIndex !== state.activeSlot) {
      setActiveSlot(bestSlotIndex);
    }
    return best;
  }
  let best = -1;
  let bestDist2 = 11 * 11;
  for (let i = 0; i < m.deformedScreen.length / 2; i += 1) {
    const dx = m.deformedScreen[i * 2] - mx;
    const dy = m.deformedScreen[i * 2 + 1] - my;
    const d2 = dx * dx + dy * dy;
    if (d2 < bestDist2) {
      bestDist2 = d2;
      best = i;
    }
  }
  return best;
}

function angleTo(a, b) {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

function pickSkeletonHandle(mx, my) {
  const m = state.mesh;
  if (!m) return null;
  const bones = getActiveBones(m);
  enforceConnectedHeads(bones);

  const world = state.boneMode === "pose" ? getSolvedPoseWorld(m) : computeWorld(bones);
  let best = 11 * 11;
  let hit = null;

  for (let i = 0; i < bones.length; i += 1) {
    const b = bones[i];
    const s = transformPoint(world[i], 0, 0);
    const t = transformPoint(world[i], b.length, 0);
    const ss = localToScreen(s.x, s.y);
    const ts = localToScreen(t.x, t.y);

    const dsx = ss.x - mx;
    const dsy = ss.y - my;
    const dtx = ts.x - mx;
    const dty = ts.y - my;
    const ds2 = dsx * dsx + dsy * dsy;
    const dt2 = dtx * dtx + dty * dty;

    if (dt2 < best) {
      best = dt2;
      hit = { type: "bone_tip", boneIndex: i };
    }

    if (ds2 < best) {
      best = ds2;
      hit = { type: "bone_joint", boneIndex: i };
    }
  }

  return hit;
}

function selectBonesByRect(x0, y0, x1, y1, append = false) {
  const m = state.mesh;
  if (!m) return;
  const bones = getActiveBones(m);
  if (!bones || bones.length === 0) return;
  const left = Math.min(x0, x1);
  const right = Math.max(x0, x1);
  const top = Math.min(y0, y1);
  const bottom = Math.max(y0, y1);
  const world = computeWorld(bones);
  const picked = [];
  for (let i = 0; i < bones.length; i += 1) {
    const ep = getBoneWorldEndpointsFromBones(bones, i, world);
    const hs = localToScreen(ep.head.x, ep.head.y);
    const ts = localToScreen(ep.tip.x, ep.tip.y);
    const cx = (hs.x + ts.x) * 0.5;
    const cy = (hs.y + ts.y) * 0.5;
    const inside =
      (hs.x >= left && hs.x <= right && hs.y >= top && hs.y <= bottom) ||
      (ts.x >= left && ts.x <= right && ts.y >= top && ts.y <= bottom) ||
      (cx >= left && cx <= right && cy >= top && cy <= bottom);
    if (inside) picked.push(i);
  }
  if (picked.length === 0) {
    if (!append) {
      state.selectedBonesForWeight = [];
      state.selectedBone = -1;
      updateBoneUI();
    }
    return 0;
  }
  if (append) {
    state.selectedBonesForWeight = [...new Set([...getSelectedBonesForWeight(m), ...picked])];
  } else {
    state.selectedBonesForWeight = picked;
  }
  state.selectedBone = picked[picked.length - 1];
  updateBoneUI();
  return picked.length;
}

function toggleSelectAllBones() {
  const m = state.mesh;
  if (!m || !m.rigBones || m.rigBones.length === 0) return;
  const all = m.rigBones.map((_, i) => i);
  const curr = getSelectedBonesForWeight(m);
  if (curr.length === all.length) {
    state.selectedBonesForWeight = [];
    state.selectedBone = -1;
    setStatus("Bone selection cleared.");
  } else {
    state.selectedBonesForWeight = all;
    state.selectedBone = all[all.length - 1];
    setStatus(`All bones selected (${all.length}).`);
  }
  updateBoneUI();
}

function moveBoneJointToLocal(bones, boneIndex, localTarget) {
  const b = bones[boneIndex];
  if (!b) return false;
  if (b.parent >= 0 && b.connected) {
    if (state.boneMode === "pose" && state.mesh) {
      return !!steerIKTargetFromBoneEdit(state.mesh, boneIndex, localTarget, "head");
    }
    return false;
  }
  if (b.parent < 0) {
    b.tx = localTarget.x;
    b.ty = localTarget.y;
    return false;
  }

  const parentWorld = computeWorld(bones)[b.parent];
  const invParent = invert(parentWorld);
  const p = transformPoint(invParent, localTarget.x, localTarget.y);
  b.tx = p.x;
  b.ty = p.y;
  return false;
}

function canEditLengthInCurrentMode(bones, boneIndex) {
  if (state.boneMode !== "pose") return true;
  const b = bones[boneIndex];
  return !!(b && b.poseLenEditable !== false);
}

function rotateBoneTipToLocal(bones, boneIndex, localTarget) {
  const ik = state.mesh ? findEnabledIKForBone(state.mesh, boneIndex) : null;
  if (state.boneMode === "pose" && ik && (ik.bones || []).length === 1) {
    return !!steerIKTargetFromBoneEdit(state.mesh, boneIndex, localTarget, "tip");
  }
  if (state.boneMode === "pose" && ik && (ik.bones || []).length >= 2) {
    const a = Number((ik.bones || [])[0]);
    const bEnd = Number((ik.bones || [])[1]);
    if (boneIndex === bEnd) {
      // For 2-bone IK, end-bone interaction should drive IK target, not directly rewrite child local pose.
      return !!steerIKTargetFromBoneEdit(state.mesh, boneIndex, localTarget, "tip");
    }
    if (boneIndex === a && ik.endMode !== "tail") {
      // Parent tip overlaps child head; treat as end-head manipulation in head mode.
      return !!steerIKTargetFromBoneEdit(state.mesh, bEnd, localTarget, "head");
    }
  }
  const b = bones[boneIndex];
  if (!b) return;
  const ep = getBoneWorldEndpointsFromBones(bones, boneIndex);
  const nextTip = canEditLengthInCurrentMode(bones, boneIndex)
    ? localTarget
    : (() => {
        const a = angleTo(ep.head, localTarget);
        return {
          x: ep.head.x + Math.cos(a) * b.length,
          y: ep.head.y + Math.sin(a) * b.length,
        };
      })();
  setBoneFromWorldEndpoints(bones, boneIndex, ep.head, nextTip);
  steerIKTargetFromBoneEdit(state.mesh, boneIndex, nextTip, "tip");
  return false;
}

function setDragTool(tool) {
  state.dragTool = tool;
  const label =
    tool === "move_head"
      ? "Tool: Move Head (G)"
      : tool === "move_tail"
        ? "Tool: Move Tail (T)"
        : tool === "rotate"
          ? "Tool: Rotate/Length (R)"
          : "Tool: Auto";
  setStatus(label);
}

function getIKEndBoneIndex(ik) {
  if (!ik || !Array.isArray(ik.bones) || ik.bones.length === 0) return -1;
  const bi = Number(ik.bones[ik.bones.length - 1]);
  return Number.isFinite(bi) ? bi : -1;
}

function selectActiveIKEndBone(updateUI = true) {
  const m = state.mesh;
  const ik = getActiveIKConstraint();
  if (!m || !ik) return false;
  const endBi = getIKEndBoneIndex(ik);
  if (!Number.isFinite(endBi) || endBi < 0 || endBi >= m.rigBones.length) return false;
  state.selectedBone = endBi;
  state.selectedBonesForWeight = [endBi];
  if (updateUI) updateBoneUI();
  return true;
}

function toggleSelectedConnect() {
  const m = state.mesh;
  if (!m) return;
  const i = state.selectedBone;
  if (i < 0) return;
  const rig = m.rigBones[i];
  const pose = m.poseBones[i];
  if (!rig || rig.parent < 0) return;
  const next = !rig.connected;
  rig.connected = next;
  if (pose) pose.connected = next;
  enforceConnectedHeads(m.rigBones);
  enforceConnectedHeads(m.poseBones);
  if (state.boneMode === "edit") {
    commitRigEdit(m, true);
  }
  updateBoneUI();
  setStatus(`Bone ${i} link: ${next ? "Connected" : "Disconnected"}`);
}

function selectBoneDelta(delta) {
  const m = state.mesh;
  if (!m) return;
  const count = getActiveBones(m).length;
  if (count <= 0) return;
  state.selectedBone = (state.selectedBone + delta + count) % count;
  state.selectedBonesForWeight = [state.selectedBone];
  updateBoneUI();
}

function getSelectedBonesForWeight(m) {
  if (!m || !m.rigBones) return [];
  const count = m.rigBones.length;
  const raw =
    Array.isArray(state.selectedBonesForWeight) && state.selectedBonesForWeight.length > 0
      ? state.selectedBonesForWeight
      : [state.selectedBone];
  const out = [];
  for (const i of raw) {
    if (Number.isFinite(i) && i >= 0 && i < count && !out.includes(i)) {
      out.push(i);
    }
  }
  return out;
}

function makeAnimId() {
  return `anim_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function createAnimation(name = "Anim") {
  return {
    id: makeAnimId(),
    name,
    duration: 5,
    tracks: {},
  };
}

function getCurrentAnimation() {
  if (!state.anim.currentAnimId) return null;
  return state.anim.animations.find((a) => a.id === state.anim.currentAnimId) || null;
}

function ensureCurrentAnimation() {
  if (state.anim.animations.length === 0) {
    const a = createAnimation("Anim 1");
    state.anim.animations.push(a);
    state.anim.currentAnimId = a.id;
  } else if (!getCurrentAnimation()) {
    state.anim.currentAnimId = state.anim.animations[0].id;
  }
}

function getTrackId(boneIndex, prop) {
  return `bone:${boneIndex}:${prop}`;
}

function getSlotTrackId(slotIndex, prop) {
  return `slot:${slotIndex}:${prop}`;
}

function getIKTrackId(ikIndex, prop) {
  return `ik:${ikIndex}:${prop}`;
}

function getTransformTrackId(transformIndex, prop) {
  return `tfc:${transformIndex}:${prop}`;
}

function getPathTrackId(pathIndex, prop) {
  return `pth:${pathIndex}:${prop}`;
}

const VERTEX_TRACK_ID = "vertex:deform";
const EVENT_TRACK_ID = "event:timeline";
const DRAWORDER_TRACK_ID = "draworder:timeline";

function makeSlotId() {
  return `slot_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function colorHexToRgb01(hex) {
  const s = String(hex || "#ffffff").trim();
  const m = s.match(/^#?([0-9a-fA-F]{6})$/);
  if (!m) return { r: 1, g: 1, b: 1 };
  const n = Number.parseInt(m[1], 16);
  return {
    r: ((n >> 16) & 0xff) / 255,
    g: ((n >> 8) & 0xff) / 255,
    b: (n & 0xff) / 255,
  };
}

function rgb01ToHex(r, g, b) {
  const to = (v) => Math.max(0, Math.min(255, Math.round((Number(v) || 0) * 255)));
  const n = (to(r) << 16) | (to(g) << 8) | to(b);
  return `#${n.toString(16).padStart(6, "0")}`;
}

function markDirtyTrack(trackId) {
  if (!trackId) return;
  if (!state.anim.dirtyTracks.includes(trackId)) {
    state.anim.dirtyTracks.push(trackId);
  }
}

function markDirtyByBoneProp(boneIndex, prop) {
  if (!Number.isFinite(boneIndex) || boneIndex < 0) return;
  markDirtyTrack(getTrackId(boneIndex, prop));
}

function markDirtyByIKProp(ikIndex, prop) {
  if (!Number.isFinite(ikIndex) || ikIndex < 0) return;
  markDirtyTrack(getIKTrackId(ikIndex, prop));
}

function markDirtyBySlotProp(slotIndex, prop) {
  if (!Number.isFinite(slotIndex) || slotIndex < 0) return;
  markDirtyTrack(getSlotTrackId(slotIndex, prop));
}

function markDirtyDrawOrder() {
  markDirtyTrack(DRAWORDER_TRACK_ID);
}

function getIKIndexByRef(m, ikRef) {
  if (!m || !ikRef) return -1;
  const list = ensureIKConstraints(m);
  return list.indexOf(ikRef);
}

function parseTrackId(trackId) {
  const p = String(trackId || "").split(":");
  if (p.length === 2 && p[0] === "vertex" && p[1] === "deform") {
    return { type: "vertex", prop: "deform" };
  }
  if (p.length === 2 && p[0] === "event" && p[1] === "timeline") {
    return { type: "event", prop: "timeline" };
  }
  if (p.length === 2 && p[0] === "draworder" && p[1] === "timeline") {
    return { type: "draworder", prop: "timeline" };
  }
  if (p.length === 3 && p[0] === "slot") {
    const slotIndex = Number(p[1]);
    const prop = p[2];
    if (!Number.isFinite(slotIndex)) return null;
    return { type: "slot", slotIndex, prop };
  }
  if (p.length === 3 && p[0] === "bone") {
    const boneIndex = Number(p[1]);
    const prop = p[2];
    if (!Number.isFinite(boneIndex)) return null;
    return { type: "bone", boneIndex, prop };
  }
  if (p.length === 3 && p[0] === "ik") {
    const ikIndex = Number(p[1]);
    const prop = p[2];
    if (!Number.isFinite(ikIndex)) return null;
    return { type: "ik", ikIndex, prop };
  }
  if (p.length === 3 && p[0] === "tfc") {
    const transformIndex = Number(p[1]);
    const prop = p[2];
    if (!Number.isFinite(transformIndex)) return null;
    return { type: "tfc", transformIndex, prop };
  }
  if (p.length === 3 && p[0] === "pth") {
    const pathIndex = Number(p[1]);
    const prop = p[2];
    if (!Number.isFinite(pathIndex)) return null;
    return { type: "pth", pathIndex, prop };
  }
  return null;
}

function getTrackValueFromBones(bones, boneIndex, prop) {
  const b = bones[boneIndex];
  if (!b) return null;
  normalizeBoneChannels(b);
  if (prop === "translate") return { x: b.tx, y: b.ty };
  if (prop === "rotate") return b.rot;
  if (prop === "scale" || prop === "length") return b.length;
  if (prop === "scaleX") return b.sx;
  if (prop === "scaleY") return b.sy;
  if (prop === "shearX") return b.shx;
  if (prop === "shearY") return b.shy;
  return 0;
}

function setTrackValueToBones(bones, boneIndex, prop, value) {
  const b = bones[boneIndex];
  if (!b) return;
  normalizeBoneChannels(b);
  if (prop === "translate" && value && typeof value === "object") {
    b.tx = Number(value.x) || 0;
    b.ty = Number(value.y) || 0;
  } else if (prop === "rotate") b.rot = Number(value) || 0;
  else if (prop === "scale" || prop === "length") b.length = Math.max(1, Number(value) || 1);
  else if (prop === "scaleX") b.sx = Number(value) || 1;
  else if (prop === "scaleY") b.sy = Number(value) || 1;
  else if (prop === "shearX") b.shx = Number(value) || 0;
  else if (prop === "shearY") b.shy = Number(value) || 0;
}

function getEventDraftFromUI() {
  return {
    name: (els.eventName && els.eventName.value ? els.eventName.value : "event").trim() || "event",
    int: Number(els.eventInt && els.eventInt.value) || 0,
    float: Number(els.eventFloat && els.eventFloat.value) || 0,
    string: (els.eventString && els.eventString.value ? els.eventString.value : "").trim(),
  };
}

function applyEventDraftToUI(v) {
  const e = v && typeof v === "object" ? v : {};
  if (els.eventName) els.eventName.value = (e.name || "event").trim() || "event";
  if (els.eventInt) els.eventInt.value = String(Number(e.int) || 0);
  if (els.eventFloat) els.eventFloat.value = String(Number(e.float) || 0);
  if (els.eventString) els.eventString.value = e.string != null ? String(e.string) : "";
}

function refreshEventKeyListUI() {
  if (!els.eventKeyList) return;
  const anim = getCurrentAnimation();
  els.eventKeyList.innerHTML = "";
  if (!anim) return;
  const keys = getTrackKeys(anim, EVENT_TRACK_ID).slice().sort((a, b) => (Number(a.time) || 0) - (Number(b.time) || 0));
  for (const k of keys) {
    if (!k.id) k.id = `k_${Math.random().toString(36).slice(2, 10)}`;
    const v = k.value && typeof k.value === "object" ? k.value : {};
    const t = Number(k.time) || 0;
    const opt = document.createElement("option");
    opt.value = k.id;
    opt.textContent = `${t.toFixed(3)}s  ${(v.name || "event").toString()}`;
    if (state.anim.selectedKey && state.anim.selectedKey.trackId === EVENT_TRACK_ID && state.anim.selectedKey.keyId === k.id) {
      opt.selected = true;
    }
    els.eventKeyList.appendChild(opt);
  }
}

function getTrackValue(m, parsed) {
  if (!m || !parsed) return null;
  if (parsed.type === "bone") {
    return getTrackValueFromBones(m.poseBones, parsed.boneIndex, parsed.prop);
  }
  if (parsed.type === "ik") {
    const list = ensureIKConstraints(m);
    const c = list[parsed.ikIndex];
    if (!c) return null;
    if (parsed.prop === "mix") return math.clamp(Number(c.mix) || 0, 0, 1);
    if (parsed.prop === "bend") return c.bendPositive !== false;
    if (parsed.prop === "target") {
      const tx = Number(c.targetX);
      const ty = Number(c.targetY);
      if (Number.isFinite(tx) && Number.isFinite(ty)) return { x: tx, y: ty };
      const p = getIKConstraintEndPointWorld(getPoseBones(m), c);
      return p ? { x: p.x, y: p.y } : { x: 0, y: 0 };
    }
    return null;
  }
  if (parsed.type === "tfc") {
    const list = ensureTransformConstraints(m);
    const c = list[parsed.transformIndex];
    if (!c) return null;
    if (parsed.prop === "rotateMix") return math.clamp(Number(c.rotateMix) || 0, 0, 1);
    if (parsed.prop === "translateMix") return math.clamp(Number(c.translateMix) || 0, 0, 1);
    if (parsed.prop === "scaleMix") return math.clamp(Number(c.scaleMix) || 0, 0, 1);
    if (parsed.prop === "shearMix") return math.clamp(Number(c.shearMix) || 0, 0, 1);
    return null;
  }
  if (parsed.type === "pth") {
    const list = ensurePathConstraints(m);
    const c = list[parsed.pathIndex];
    if (!c) return null;
    if (parsed.prop === "position") return Number(c.position) || 0;
    if (parsed.prop === "spacing") return Number(c.spacing) || 0;
    if (parsed.prop === "rotateMix") return math.clamp(Number(c.rotateMix) || 0, 0, 1);
    if (parsed.prop === "translateMix") return math.clamp(Number(c.translateMix) || 0, 0, 1);
    return null;
  }
  if (parsed.type === "vertex") {
    return Array.from(getActiveOffsets(m));
  }
  if (parsed.type === "event") {
    return getEventDraftFromUI();
  }
  if (parsed.type === "draworder") {
    return state.slots.map((s, i) => (s && s.id ? s.id : `slot_i_${i}`));
  }
  if (parsed.type === "slot") {
    const s = state.slots[parsed.slotIndex];
    if (!s) return null;
    if (parsed.prop === "attachment") {
      return s.visible !== false;
    }
    if (parsed.prop === "color") {
      return {
        r: math.clamp(Number(s.r) || 1, 0, 1),
        g: math.clamp(Number(s.g) || 1, 0, 1),
        b: math.clamp(Number(s.b) || 1, 0, 1),
        a: math.clamp(Number(s.alpha) || 1, 0, 1),
      };
    }
  }
  return null;
}

function setTrackValue(m, parsed, value) {
  if (!m || !parsed) return;
  if (parsed.type === "bone") {
    setTrackValueToBones(m.poseBones, parsed.boneIndex, parsed.prop, value);
    return;
  }
  if (parsed.type === "ik") {
    const list = ensureIKConstraints(m);
    const c = list[parsed.ikIndex];
    if (!c) return;
    if (parsed.prop === "mix") {
      c.mix = math.clamp(Number(value) || 0, 0, 1);
    } else if (parsed.prop === "bend") {
      c.bendPositive = value === true || Number(value) >= 0;
    } else if (parsed.prop === "target" && value && typeof value === "object") {
      c.targetX = Number(value.x) || 0;
      c.targetY = Number(value.y) || 0;
    }
    return;
  }
  if (parsed.type === "tfc") {
    const list = ensureTransformConstraints(m);
    const c = list[parsed.transformIndex];
    if (!c) return;
    if (parsed.prop === "rotateMix") c.rotateMix = math.clamp(Number(value) || 0, 0, 1);
    else if (parsed.prop === "translateMix") c.translateMix = math.clamp(Number(value) || 0, 0, 1);
    else if (parsed.prop === "scaleMix") c.scaleMix = math.clamp(Number(value) || 0, 0, 1);
    else if (parsed.prop === "shearMix") c.shearMix = math.clamp(Number(value) || 0, 0, 1);
    return;
  }
  if (parsed.type === "pth") {
    const list = ensurePathConstraints(m);
    const c = list[parsed.pathIndex];
    if (!c) return;
    if (parsed.prop === "position") c.position = Number(value) || 0;
    else if (parsed.prop === "spacing") c.spacing = Number(value) || 0;
    else if (parsed.prop === "rotateMix") c.rotateMix = math.clamp(Number(value) || 0, 0, 1);
    else if (parsed.prop === "translateMix") c.translateMix = math.clamp(Number(value) || 0, 0, 1);
    return;
  }
  if (parsed.type === "vertex" && Array.isArray(value)) {
    const offsets = getActiveOffsets(m);
    const n = Math.min(offsets.length, value.length);
    for (let i = 0; i < n; i += 1) {
      offsets[i] = Number(value[i]) || 0;
    }
    for (let i = n; i < offsets.length; i += 1) {
      offsets[i] = 0;
    }
  }
  if (parsed.type === "event") {
    // Event track does not directly drive pose values.
  }
  if (parsed.type === "draworder" && Array.isArray(value) && value.length > 0) {
    const activeSlotObj = getActiveSlot();
    const idToSlot = new Map();
    for (const s of state.slots) {
      if (!s) continue;
      if (!s.id) s.id = makeSlotId();
      idToSlot.set(s.id, s);
    }
    const out = [];
    const used = new Set();
    for (const id of value) {
      const s = idToSlot.get(String(id));
      if (!s || used.has(s)) continue;
      used.add(s);
      out.push(s);
    }
    for (const s of state.slots) {
      if (!s || used.has(s)) continue;
      out.push(s);
    }
    if (out.length === state.slots.length) {
      state.slots = out;
      if (activeSlotObj) {
        const idx = state.slots.indexOf(activeSlotObj);
        if (idx >= 0) state.activeSlot = idx;
      }
    }
    return;
  }
  if (parsed.type === "slot") {
    const s = state.slots[parsed.slotIndex];
    if (!s) return;
    if (parsed.prop === "attachment") {
      s.visible = value !== false;
      return;
    }
    if (parsed.prop === "color" && value && typeof value === "object") {
      s.r = math.clamp(Number(value.r) || 1, 0, 1);
      s.g = math.clamp(Number(value.g) || 1, 0, 1);
      s.b = math.clamp(Number(value.b) || 1, 0, 1);
      s.alpha = math.clamp(Number(value.a) || 1, 0, 1);
    }
    return;
  }
}

function getTrackKeys(anim, trackId) {
  if (!anim.tracks[trackId]) anim.tracks[trackId] = [];
  return anim.tracks[trackId];
}

function sortTrackKeys(anim, trackId) {
  getTrackKeys(anim, trackId).sort((a, b) => a.time - b.time);
}

function normalizeTrackKeys(anim, trackId) {
  sortTrackKeys(anim, trackId);
  const keys = getTrackKeys(anim, trackId);
  const duration = Math.max(0.1, Number(anim.duration) || Number(state.anim.duration) || 5);
  if (keys.length <= 1) {
    if (keys[0]) keys[0].time = sanitizeTimelineTime(snapTimeIfNeeded(Number(keys[0].time) || 0), duration);
    return;
  }
  const out = [];
  for (const k of keys) {
    if (!k.id) k.id = `k_${Math.random().toString(36).slice(2, 10)}`;
    k.time = sanitizeTimelineTime(snapTimeIfNeeded(Number(k.time) || 0), duration);
    const prev = out[out.length - 1];
    if (prev && Math.abs(prev.time - k.time) < 1e-4) {
      prev.value = k.value;
      prev.interp = k.interp || prev.interp || "linear";
      if (Array.isArray(k.curve) && k.curve.length >= 4) prev.curve = k.curve.slice(0, 4);
      if (Number.isFinite(k.slotIndex)) prev.slotIndex = Number(k.slotIndex);
    } else {
      const nk = { id: k.id, time: k.time, value: k.value, interp: k.interp || "linear" };
      if (Array.isArray(k.curve) && k.curve.length >= 4) nk.curve = k.curve.slice(0, 4);
      if (Number.isFinite(k.slotIndex)) nk.slotIndex = Number(k.slotIndex);
      out.push(nk);
    }
  }
  anim.tracks[trackId] = out;
}

function cloneTrackValue(v) {
  if (Array.isArray(v)) return v.slice();
  if (v && typeof v === "object") return { ...v };
  return v;
}

function getTimelineTimeStep() {
  const base = Math.max(0.001, Number(state.anim.timeStep) || 0.01);
  const frameStep = 1 / Math.max(1, Number(state.anim.fps) || 30);
  return Math.max(base, frameStep);
}

function quantizeTimelineTime(t) {
  const step = getTimelineTimeStep();
  return Math.round((Number(t) || 0) / step) * step;
}

function getTimelineTimeDigits() {
  const step = getTimelineTimeStep();
  const s = step.toFixed(6).replace(/0+$/, "");
  const dot = s.indexOf(".");
  return dot < 0 ? 0 : s.length - dot - 1;
}

function sanitizeTimelineTime(t, duration) {
  const d = Math.max(0.1, Number(duration) || 5);
  const clamped = math.clamp(Number(t) || 0, 0, d);
  const q = quantizeTimelineTime(clamped);
  return math.clamp(q, 0, d);
}

function snapTimeIfNeeded(t) {
  let out = Number(t) || 0;
  if (state.anim.snap) {
    const fps = Math.max(1, state.anim.fps || 30);
    out = Math.round(out * fps) / fps;
  }
  return quantizeTimelineTime(out);
}

function setAnimTime(value) {
  ensureCurrentAnimation();
  const anim = getCurrentAnimation();
  if (!anim) return;
  const d = Math.max(0.1, Number(els.animDuration.value) || anim.duration || 5);
  anim.duration = d;
  state.anim.duration = d;
  state.anim.time = sanitizeTimelineTime(value, d);
  els.animDuration.value = String(d);
  els.animTime.step = String(getTimelineTimeStep());
  els.animTime.value = state.anim.time.toFixed(getTimelineTimeDigits());
  renderTimelineTracks();
}

function getVisibleTrackDefinitions() {
  const m = state.mesh;
  if (!m) return [];
  const out = [];
  out.push({
    id: "group:vertex",
    kind: "group",
    groupKey: "vertex",
    label: "Vertex",
    expanded: state.anim.trackExpanded.vertex !== false,
    children: [{ id: VERTEX_TRACK_ID, kind: "track", label: "Deform" }],
  });
  out.push({
    id: "group:event",
    kind: "group",
    groupKey: "event",
    label: "Event",
    expanded: state.anim.trackExpanded.event !== false,
    children: [{ id: EVENT_TRACK_ID, kind: "track", label: "Events" }],
  });
  out.push({
    id: "group:draworder",
    kind: "group",
    groupKey: "draworder",
    label: "Draw Order",
    expanded: state.anim.trackExpanded.draworder !== false,
    children: [{ id: DRAWORDER_TRACK_ID, kind: "track", label: "Timeline" }],
  });
  if (state.slots && state.slots.length > 0) {
    for (let si = 0; si < state.slots.length; si += 1) {
      const s = state.slots[si];
      out.push({
        id: `group:slot:${si}`,
        kind: "group",
        groupKey: `slot:${si}`,
        label: `Slot ${si}: ${s && s.name ? s.name : `slot_${si}`}`,
        expanded: state.anim.trackExpanded[`slot:${si}`] === true,
        children: [
          { id: `slot:${si}:attachment`, kind: "track", slotIndex: si, prop: "attachment", label: "Attachment" },
          { id: `slot:${si}:color`, kind: "track", slotIndex: si, prop: "color", label: "Color/Alpha" },
        ],
      });
    }
  }
  for (let idx = 0; idx < m.rigBones.length; idx += 1) {
    const b = m.rigBones[idx];
    out.push({
      id: `group:${idx}`,
      kind: "group",
      groupKey: String(idx),
      boneIndex: idx,
      label: b.name,
      expanded: !!state.anim.trackExpanded[idx],
      children: [
        { id: getTrackId(idx, "translate"), kind: "track", boneIndex: idx, prop: "translate", label: "Translate" },
        { id: getTrackId(idx, "rotate"), kind: "track", boneIndex: idx, prop: "rotate", label: "Rotate" },
        { id: getTrackId(idx, "scale"), kind: "track", boneIndex: idx, prop: "scale", label: "Length" },
        { id: getTrackId(idx, "scaleX"), kind: "track", boneIndex: idx, prop: "scaleX", label: "Scale X" },
        { id: getTrackId(idx, "scaleY"), kind: "track", boneIndex: idx, prop: "scaleY", label: "Scale Y" },
        { id: getTrackId(idx, "shearX"), kind: "track", boneIndex: idx, prop: "shearX", label: "Shear X" },
        { id: getTrackId(idx, "shearY"), kind: "track", boneIndex: idx, prop: "shearY", label: "Shear Y" },
      ],
    });
  }
  const ikList = ensureIKConstraints(m);
  if (ikList.length > 0) {
    out.push({
      id: "group:ik",
      kind: "group",
      groupKey: "ik",
      label: "IK",
      expanded: state.anim.trackExpanded.ik !== false,
      children: ikList.flatMap((c, i) => {
        const name = c && c.name ? c.name : `ik_${i}`;
        return [
          { id: getIKTrackId(i, "mix"), kind: "track", ikIndex: i, prop: "mix", label: `${name}.Mix` },
          { id: getIKTrackId(i, "bend"), kind: "track", ikIndex: i, prop: "bend", label: `${name}.Bend` },
          { id: getIKTrackId(i, "target"), kind: "track", ikIndex: i, prop: "target", label: `${name}.Target` },
        ];
      }),
    });
  }
  const tfcList = ensureTransformConstraints(m);
  if (tfcList.length > 0) {
    out.push({
      id: "group:tfc",
      kind: "group",
      groupKey: "tfc",
      label: "Transform",
      expanded: state.anim.trackExpanded.tfc !== false,
      children: tfcList.flatMap((c, i) => {
        const name = c && c.name ? c.name : `transform_${i}`;
        return [
          { id: getTransformTrackId(i, "rotateMix"), kind: "track", transformIndex: i, prop: "rotateMix", label: `${name}.RotateMix` },
          { id: getTransformTrackId(i, "translateMix"), kind: "track", transformIndex: i, prop: "translateMix", label: `${name}.TranslateMix` },
          { id: getTransformTrackId(i, "scaleMix"), kind: "track", transformIndex: i, prop: "scaleMix", label: `${name}.ScaleMix` },
          { id: getTransformTrackId(i, "shearMix"), kind: "track", transformIndex: i, prop: "shearMix", label: `${name}.ShearMix` },
        ];
      }),
    });
  }
  const pthList = ensurePathConstraints(m);
  if (pthList.length > 0) {
    out.push({
      id: "group:pth",
      kind: "group",
      groupKey: "pth",
      label: "Path",
      expanded: state.anim.trackExpanded.pth !== false,
      children: pthList.flatMap((c, i) => {
        const name = c && c.name ? c.name : `path_${i}`;
        return [
          { id: getPathTrackId(i, "position"), kind: "track", pathIndex: i, prop: "position", label: `${name}.Position` },
          { id: getPathTrackId(i, "spacing"), kind: "track", pathIndex: i, prop: "spacing", label: `${name}.Spacing` },
          { id: getPathTrackId(i, "rotateMix"), kind: "track", pathIndex: i, prop: "rotateMix", label: `${name}.RotateMix` },
          { id: getPathTrackId(i, "translateMix"), kind: "track", pathIndex: i, prop: "translateMix", label: `${name}.TranslateMix` },
        ];
      }),
    });
  }
  return out;
}

function refreshTrackSelect() {
  const groups = getVisibleTrackDefinitions();
  const tracks = [];
  for (const g of groups) {
    for (const c of g.children) tracks.push(c);
  }
  els.trackSelect.innerHTML = "";
  for (const t of tracks) {
    const opt = document.createElement("option");
    opt.value = t.id;
    if (t.id === VERTEX_TRACK_ID) {
      opt.textContent = "vertex.deform";
    } else if (t.id === DRAWORDER_TRACK_ID) {
      opt.textContent = "drawOrder.timeline";
    } else if (t.id.startsWith("slot:")) {
      const s = state.slots[t.slotIndex];
      const slotName = s && s.name ? s.name : `slot_${t.slotIndex}`;
      opt.textContent = `${slotName}.${t.label}`;
    } else if (t.id === EVENT_TRACK_ID) {
      opt.textContent = "event.timeline";
    } else if (t.id.startsWith("ik:")) {
      opt.textContent = t.label;
    } else if (t.id.startsWith("tfc:")) {
      opt.textContent = t.label;
    } else if (t.id.startsWith("pth:")) {
      opt.textContent = t.label;
    } else {
      const boneName = state.mesh && state.mesh.rigBones[t.boneIndex] ? state.mesh.rigBones[t.boneIndex].name : `bone_${t.boneIndex}`;
      opt.textContent = `${boneName}.${t.label}`;
    }
    els.trackSelect.appendChild(opt);
  }
  if (tracks.length === 0) {
    state.anim.selectedTrack = "";
    return;
  }
  if (!tracks.find((t) => t.id === state.anim.selectedTrack)) {
    state.anim.selectedTrack = tracks[0].id;
  }
  els.trackSelect.value = state.anim.selectedTrack;
}

function refreshAnimationUI() {
  ensureCurrentAnimation();
  const current = getCurrentAnimation();
  els.animSelect.innerHTML = "";
  for (const a of state.anim.animations) {
    const opt = document.createElement("option");
    opt.value = a.id;
    opt.textContent = a.name;
    els.animSelect.appendChild(opt);
  }
  if (current) {
    els.animSelect.value = current.id;
    els.animName.value = current.name;
    els.animDuration.value = String(current.duration);
    state.anim.duration = current.duration;
  }
  els.animLoop.checked = !!state.anim.loop;
  els.animSnap.checked = !!state.anim.snap;
  els.animFps.value = String(Math.max(1, state.anim.fps || 30));
  if (els.animTimeStep) {
    els.animTimeStep.value = String(getTimelineTimeStep());
    els.animTimeStep.step = "0.001";
  }
  refreshAnimationMixUI();
  refreshEventKeyListUI();
  refreshTrackSelect();
  renderTimelineTracks();
  renderCurveEditor();
}

function refreshAnimationMixUI() {
  if (!els.animMixTo) return;
  const current = getCurrentAnimation();
  const currentId = current ? current.id : "";
  els.animMixTo.innerHTML = "";
  for (const a of state.anim.animations) {
    const opt = document.createElement("option");
    opt.value = a.id;
    opt.textContent = a.name;
    els.animMixTo.appendChild(opt);
  }
  const fallback = state.anim.animations.find((a) => a.id !== currentId) || state.anim.animations[0] || null;
  if (fallback) els.animMixTo.value = fallback.id;
  if (els.animMixDur) {
    const dur = Math.max(0.01, Number(state.anim.mix.duration) || 0.2);
    state.anim.mix.duration = dur;
    els.animMixDur.value = String(dur);
  }
  if (els.animMixInfo) {
    if (state.anim.mix.active) {
      const p = Math.round(math.clamp((state.anim.mix.elapsed / Math.max(1e-6, state.anim.mix.duration)) * 100, 0, 100));
      els.animMixInfo.value = `Mixing ${p}%`;
    } else {
      els.animMixInfo.value = "State: idle";
    }
  }
}

function timelineXForTime(t, width, duration) {
  return math.clamp((t / Math.max(0.1, duration)) * width, 0, width);
}

function timeForTimelineX(x, width, duration) {
  if (width <= 1) return 0;
  return math.clamp((x / width) * Math.max(0.1, duration), 0, Math.max(0.1, duration));
}

function collectUniqueKeyTimes(anim, trackIds) {
  const bag = [];
  for (const trackId of trackIds) {
    for (const k of getTrackKeys(anim, trackId)) bag.push(k.time);
  }
  bag.sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i < bag.length; i += 1) {
    if (i > 0 && Math.abs(bag[i] - bag[i - 1]) < 1e-4) continue;
    out.push(bag[i]);
  }
  return out;
}

function clearTimelineKeySelection() {
  state.anim.selectedKeys = [];
  state.anim.selectedKey = null;
}

function keySelectionHas(trackId, keyId) {
  return state.anim.selectedKeys.some((s) => s && s.trackId === trackId && s.keyId === keyId);
}

function normalizeSelectedKeys(anim) {
  const out = [];
  for (const s of state.anim.selectedKeys || []) {
    if (!s || !s.trackId || !s.keyId) continue;
    const keys = getTrackKeys(anim, s.trackId);
    if (keys.some((k) => k.id === s.keyId)) out.push({ trackId: s.trackId, keyId: s.keyId });
  }
  state.anim.selectedKeys = out;
  if (state.anim.selectedKey && !keySelectionHas(state.anim.selectedKey.trackId, state.anim.selectedKey.keyId)) {
    state.anim.selectedKey = out.length > 0 ? { ...out[0] } : null;
  }
}

function setSingleTimelineSelection(trackId, keyId) {
  state.anim.selectedKeys = [{ trackId, keyId }];
  state.anim.selectedKey = { trackId, keyId };
}

function toggleTimelineSelection(trackId, keyId) {
  if (keySelectionHas(trackId, keyId)) {
    state.anim.selectedKeys = state.anim.selectedKeys.filter((s) => !(s.trackId === trackId && s.keyId === keyId));
    if (state.anim.selectedKey && state.anim.selectedKey.trackId === trackId && state.anim.selectedKey.keyId === keyId) {
      state.anim.selectedKey = state.anim.selectedKeys.length > 0 ? { ...state.anim.selectedKeys[0] } : null;
    }
    return;
  }
  state.anim.selectedKeys.push({ trackId, keyId });
  state.anim.selectedKey = { trackId, keyId };
}

function getDragSeedFromSelection(anim, selected) {
  const seed = [];
  for (const s of selected) {
    const keys = getTrackKeys(anim, s.trackId);
    const k = keys.find((it) => it.id === s.keyId);
    if (!k) continue;
    seed.push({ trackId: s.trackId, keyId: s.keyId, time: Number(k.time) || 0 });
  }
  return seed;
}

function collectKeysAtTime(anim, t) {
  const out = [];
  for (const trackId of Object.keys(anim.tracks || {})) {
    if (!parseTrackId(trackId)) continue;
    const keys = getTrackKeys(anim, trackId);
    for (const k of keys) {
      if (Math.abs((Number(k.time) || 0) - t) < 1e-4) out.push({ trackId, keyId: k.id });
    }
  }
  return out;
}

function applyTimelineSelectionClasses() {
  const selected = new Set((state.anim.selectedKeys || []).map((s) => `${s.trackId}::${s.keyId}`));
  const nodes = els.timelineTracks.querySelectorAll(".track-key[data-track-id][data-key-id]");
  for (const el of nodes) {
    const key = `${el.dataset.trackId || ""}::${el.dataset.keyId || ""}`;
    el.classList.toggle("selected", selected.has(key));
  }
}

function renderTimelineTracks() {
  const anim = getCurrentAnimation();
  const groups = getVisibleTrackDefinitions();
  const root = els.timelineTracks;
  root.innerHTML = "";
  if (!anim) return;
  const ruler = document.createElement("div");
  ruler.className = "timeline-ruler";
  const rulerLabel = document.createElement("div");
  rulerLabel.className = "track-label";
  rulerLabel.textContent = "Time";
  const rulerLane = document.createElement("div");
  rulerLane.className = "track-lane selected";
  rulerLane.dataset.trackId = "__ruler__";
  const rulerPlayhead = document.createElement("div");
  rulerPlayhead.className = "timeline-playhead handle";
  rulerPlayhead.dataset.playhead = "1";
  rulerPlayhead.style.left = `${(timelineXForTime(state.anim.time, 100, anim.duration)).toFixed(4)}%`;
  const tickStep = getTimelineTimeStep();
  const tickCount = Math.floor(anim.duration / tickStep) + 1;
  const majorEvery = Math.max(1, Math.round(1 / tickStep));
  if (tickCount <= 600) {
    for (let i = 0; i <= tickCount; i += 1) {
      const tt = i * tickStep;
      if (tt > anim.duration + 1e-6) break;
      const tick = document.createElement("div");
      tick.className = `timeline-tick${i % majorEvery === 0 ? " major" : ""}`;
      tick.style.left = `${(timelineXForTime(tt, 100, anim.duration)).toFixed(4)}%`;
      rulerLane.appendChild(tick);
    }
  }
  rulerLane.appendChild(rulerPlayhead);
  ruler.appendChild(rulerLabel);
  ruler.appendChild(rulerLane);
  root.appendChild(ruler);

  const allTrackIds = Object.keys(anim.tracks).filter((k) => parseTrackId(k));
  const allRow = document.createElement("div");
  allRow.className = "track-row track-group";
  const allLabel = document.createElement("div");
  allLabel.className = "track-label";
  allLabel.textContent = "All";
  const allLane = document.createElement("div");
  allLane.className = "track-lane";
  allLane.dataset.trackId = "__all__";
  const allPlayhead = document.createElement("div");
  allPlayhead.className = "timeline-playhead";
  allPlayhead.style.left = `${(timelineXForTime(state.anim.time, 100, anim.duration)).toFixed(4)}%`;
  allLane.appendChild(allPlayhead);
  for (const t of collectUniqueKeyTimes(anim, allTrackIds)) {
    const mk = document.createElement("div");
    mk.className = "track-key";
    mk.dataset.allTime = String(Number(t).toFixed(6));
    mk.style.left = `${(timelineXForTime(t, 100, anim.duration)).toFixed(4)}%`;
    mk.style.opacity = "0.55";
    allLane.appendChild(mk);
  }
  allRow.appendChild(allLabel);
  allRow.appendChild(allLane);
  root.appendChild(allRow);

  for (const g of groups) {
    const row = document.createElement("div");
    row.className = "track-row track-group";
    const label = document.createElement("div");
    label.className = "track-label";
    label.dataset.groupKey = String(g.groupKey ?? g.boneIndex);
    label.textContent = `${g.expanded ? "▼" : "▶"} ${g.label}`;
    const lane = document.createElement("div");
    lane.className = "track-lane";
    lane.dataset.trackId = g.id;
    const playhead = document.createElement("div");
    playhead.className = "timeline-playhead";
    playhead.style.left = `${(timelineXForTime(state.anim.time, 100, anim.duration)).toFixed(4)}%`;
    lane.appendChild(playhead);
    row.appendChild(label);
    row.appendChild(lane);
    root.appendChild(row);

    if (!g.expanded) continue;
    for (const td of g.children) {
      const crow = document.createElement("div");
      crow.className = "track-row child";
      const clabel = document.createElement("div");
      clabel.className = "track-label";
      clabel.textContent = td.label;
      const clane = document.createElement("div");
      clane.className = `track-lane${state.anim.selectedTrack === td.id ? " selected" : ""}`;
      clane.dataset.trackId = td.id;

      const cplay = document.createElement("div");
      cplay.className = "timeline-playhead";
      cplay.style.left = `${(timelineXForTime(state.anim.time, 100, anim.duration)).toFixed(4)}%`;
      clane.appendChild(cplay);

      const keys = getTrackKeys(anim, td.id);
      for (const k of keys) {
        if (!k.id) k.id = `k_${Math.random().toString(36).slice(2, 10)}`;
        const mk = document.createElement("div");
        mk.className = "track-key";
        if (keySelectionHas(td.id, k.id)) mk.classList.add("selected");
        mk.dataset.trackId = td.id;
        mk.dataset.keyId = k.id;
        mk.style.left = `${(timelineXForTime(k.time, 100, anim.duration)).toFixed(4)}%`;
        clane.appendChild(mk);
      }

      crow.appendChild(clabel);
      crow.appendChild(clane);
      root.appendChild(crow);
    }
  }

  if (state.anim.selectedKeys && state.anim.selectedKeys.length > 1) {
    els.keyInfo.value = `${state.anim.selectedKeys.length} keys selected`;
    if (els.keyInterp) els.keyInterp.disabled = false;
  } else if (state.anim.selectedKey) {
    els.keyInfo.value = `${state.anim.selectedKey.trackId} @ ${state.anim.time.toFixed(2)}s`;
    const keys = getTrackKeys(anim, state.anim.selectedKey.trackId);
    const k = keys.find((x) => x.id === state.anim.selectedKey.keyId);
    if (k) {
      els.keyInterp.value = k.interp || "linear";
      if (els.keyInterp) {
        const parsed = parseTrackId(state.anim.selectedKey.trackId);
        const slotAttachmentTrack = !!(parsed && parsed.type === "slot" && parsed.prop === "attachment");
        els.keyInterp.disabled =
          state.anim.selectedKey.trackId === EVENT_TRACK_ID ||
          state.anim.selectedKey.trackId === DRAWORDER_TRACK_ID ||
          slotAttachmentTrack;
      }
      if (state.anim.selectedKey.trackId === EVENT_TRACK_ID) {
        applyEventDraftToUI(k.value);
      }
    }
  } else {
    els.keyInfo.value = "(none)";
    if (els.keyInterp) els.keyInterp.disabled = false;
  }
  refreshEventKeyListUI();
  renderCurveEditor();
}

function getCurveEditTarget() {
  const anim = getCurrentAnimation();
  const sk = state.anim.selectedKey;
  if (!anim || !sk) return null;
  const keys = getTrackKeys(anim, sk.trackId).slice().sort((a, b) => a.time - b.time);
  const i = keys.findIndex((k) => k.id === sk.keyId);
  if (i < 0 || keys.length < 2) return null;
  if (i < keys.length - 1) {
    const k0 = keys[i];
    const k1 = keys[i + 1];
    return { anim, trackId: sk.trackId, key: k0, next: k1, segment: "forward" };
  }
  // If selecting the last key, edit the previous segment instead.
  const k0 = keys[i - 1];
  const k1 = keys[i];
  return { anim, trackId: sk.trackId, key: k0, next: k1, segment: "backward" };
}

function ensureBezierCurveOnKey(k) {
  if (!k) return;
  if (!Array.isArray(k.curve) || k.curve.length < 4) {
    k.curve = [0.25, 0.25, 0.75, 0.75];
  }
}

function renderCurveEditor() {
  const cv = els.curveEditor;
  if (!cv) return;
  const wrap = els.curveEditorWrap;
  if (wrap) wrap.classList.toggle("collapsed", !state.anim.curveOpen);
  if (els.curveToggleBtn) {
    els.curveToggleBtn.classList.toggle("active", !!state.anim.curveOpen);
    els.curveToggleBtn.textContent = state.anim.curveOpen ? "Curve On" : "Curve";
  }
  if (!state.anim.curveOpen) return;
  const ctx = cv.getContext("2d");
  if (!ctx) return;
  const target = getCurveEditTarget();
  const w = cv.width;
  const h = cv.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#0a1218";
  ctx.fillRect(0, 0, w, h);
  const pad = 16;
  const gx0 = pad;
  const gy0 = pad;
  const gw = w - pad * 2;
  const gh = h - pad * 2;
  ctx.strokeStyle = "rgba(120,150,168,0.35)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const x = gx0 + (gw * i) / 4;
    const y = gy0 + (gh * i) / 4;
    ctx.beginPath();
    ctx.moveTo(x, gy0);
    ctx.lineTo(x, gy0 + gh);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(gx0, y);
    ctx.lineTo(gx0 + gw, y);
    ctx.stroke();
  }
  if (!target) {
    ctx.fillStyle = "#9eb1ba";
    ctx.font = "12px Segoe UI";
    ctx.fillText("Select a key segment to edit curve.", 16, Math.floor(h * 0.52));
    return;
  }
  const k = target.key;
  const interp = k.interp || "linear";
  if (interp === "bezier") ensureBezierCurveOnKey(k);
  const curve = Array.isArray(k.curve) && k.curve.length >= 4 ? k.curve : [0.25, 0.25, 0.75, 0.75];
  const toX = (u) => gx0 + math.clamp(u, 0, 1) * gw;
  const toY = (v) => gy0 + (1 - math.clamp(v, 0, 1)) * gh;

  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.beginPath();
  ctx.moveTo(toX(0), toY(0));
  if (interp === "stepped") {
    ctx.lineTo(toX(1), toY(0));
    ctx.lineTo(toX(1), toY(1));
  } else if (interp === "bezier") {
    ctx.bezierCurveTo(toX(curve[0]), toY(curve[1]), toX(curve[2]), toY(curve[3]), toX(1), toY(1));
  } else {
    ctx.lineTo(toX(1), toY(1));
  }
  ctx.stroke();

  if (interp === "bezier") {
    const p0 = { x: toX(0), y: toY(0) };
    const p1 = { x: toX(curve[0]), y: toY(curve[1]) };
    const p2 = { x: toX(curve[2]), y: toY(curve[3]) };
    const p3 = { x: toX(1), y: toY(1) };
    ctx.strokeStyle = "rgba(125,211,252,0.55)";
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.moveTo(p3.x, p3.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.fillStyle = "#7dd3fc";
    for (const p of [p1, p2]) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.fillStyle = "#9eb1ba";
  ctx.font = "11px Segoe UI";
  ctx.fillText(`${target.trackId} | ${interp}`, 10, 12);
}

function addOrUpdateKeyframeAtCurrentTime() {
  const m = state.mesh;
  const anim = getCurrentAnimation();
  if (!m || !anim) return;
  if (!state.anim.selectedTrack) refreshTrackSelect();
  const trackId = state.anim.selectedTrack;
  addOrUpdateKeyframeForTrack(trackId);
}

function addOrUpdateKeyframeForTrack(trackId) {
  const m = state.mesh;
  const anim = getCurrentAnimation();
  if (!m || !anim) return;
  if (!trackId) return;
  const p = parseTrackId(trackId);
  if (!p) return;
  const t = snapTimeIfNeeded(state.anim.time);
  const v = getTrackValue(m, p);
  const keys = getTrackKeys(anim, trackId);
  const existing = keys.find((k) => Math.abs(k.time - t) < 1e-4);
  const forceStepped =
    trackId === EVENT_TRACK_ID ||
    trackId === DRAWORDER_TRACK_ID ||
    (p.type === "slot" && p.prop === "attachment");
  const interp = forceStepped ? "stepped" : els.keyInterp.value || "linear";
  const vertexSlotIndex = p.type === "vertex" ? state.activeSlot : null;
  if (existing) {
    existing.value = cloneTrackValue(v);
    existing.interp = interp;
    if (interp === "bezier") {
      ensureBezierCurveOnKey(existing);
    } else {
      delete existing.curve;
    }
    if (Number.isFinite(vertexSlotIndex) && vertexSlotIndex >= 0) existing.slotIndex = Number(vertexSlotIndex);
    setSingleTimelineSelection(trackId, existing.id);
  } else {
    const nk = { id: `k_${Math.random().toString(36).slice(2, 10)}`, time: t, value: cloneTrackValue(v), interp };
    if (interp === "bezier") nk.curve = [0.25, 0.25, 0.75, 0.75];
    if (Number.isFinite(vertexSlotIndex) && vertexSlotIndex >= 0) nk.slotIndex = Number(vertexSlotIndex);
    keys.push(nk);
    setSingleTimelineSelection(trackId, nk.id);
  }
  normalizeTrackKeys(anim, trackId);
  setAnimTime(t);
  renderTimelineTracks();
  setStatus(`Key saved: ${trackId} @ ${t.toFixed(2)}s`);
}

function collectChangedTracksAtCurrentTime() {
  const m = state.mesh;
  const anim = getCurrentAnimation();
  if (!m || !anim) return [];
  ensureIKConstraints(m);
  const offsets = getActiveOffsets(m);
  const temp = {
    rigBones: cloneBones(m.rigBones),
    poseBones: cloneBones(m.rigBones),
    offsets: new Float32Array(offsets),
    baseOffsets: new Float32Array(offsets),
    ikConstraints: JSON.parse(JSON.stringify(m.ikConstraints || [])),
    transformConstraints: JSON.parse(JSON.stringify(m.transformConstraints || [])),
    pathConstraints: JSON.parse(JSON.stringify(m.pathConstraints || [])),
  };
  ensureIKConstraints(temp);
  ensureTransformConstraints(temp);
  ensurePathConstraints(temp);
  samplePoseAtTime(temp, state.anim.time);
  const out = [];
  const eps = 1e-4;
  for (let i = 0; i < m.poseBones.length; i += 1) {
    const cur = m.poseBones[i];
    const base = temp.poseBones[i];
    if (!cur || !base) continue;
    if (Math.abs(cur.tx - base.tx) > eps || Math.abs(cur.ty - base.ty) > eps) {
      out.push(getTrackId(i, "translate"));
    }
    if (Math.abs(cur.rot - base.rot) > eps) {
      out.push(getTrackId(i, "rotate"));
    }
    if (Math.abs(cur.length - base.length) > eps) {
      out.push(getTrackId(i, "scale"));
    }
    if (Math.abs((Number(cur.sx) || 1) - (Number(base.sx) || 1)) > eps) {
      out.push(getTrackId(i, "scaleX"));
    }
    if (Math.abs((Number(cur.sy) || 1) - (Number(base.sy) || 1)) > eps) {
      out.push(getTrackId(i, "scaleY"));
    }
    if (Math.abs((Number(cur.shx) || 0) - (Number(base.shx) || 0)) > eps) {
      out.push(getTrackId(i, "shearX"));
    }
    if (Math.abs((Number(cur.shy) || 0) - (Number(base.shy) || 0)) > eps) {
      out.push(getTrackId(i, "shearY"));
    }
  }
  if (temp.offsets && temp.offsets.length === offsets.length) {
    let changed = false;
    for (let i = 0; i < offsets.length; i += 1) {
      if (Math.abs(offsets[i] - temp.offsets[i]) > eps) {
        changed = true;
        break;
      }
    }
    if (changed) out.push(VERTEX_TRACK_ID);
  }
  const nowIK = ensureIKConstraints(m);
  const baseIK = ensureIKConstraints(temp);
  const ikN = Math.min(nowIK.length, baseIK.length);
  for (let i = 0; i < ikN; i += 1) {
    if (Math.abs((Number(nowIK[i].mix) || 0) - (Number(baseIK[i].mix) || 0)) > eps) {
      out.push(getIKTrackId(i, "mix"));
    }
    if ((nowIK[i].bendPositive !== false) !== (baseIK[i].bendPositive !== false)) {
      out.push(getIKTrackId(i, "bend"));
    }
    const nx = Number(nowIK[i].targetX);
    const ny = Number(nowIK[i].targetY);
    const bx = Number(baseIK[i].targetX);
    const by = Number(baseIK[i].targetY);
    const xChanged =
      (Number.isFinite(nx) && !Number.isFinite(bx)) ||
      (!Number.isFinite(nx) && Number.isFinite(bx)) ||
      (Number.isFinite(nx) && Number.isFinite(bx) && Math.abs(nx - bx) > eps);
    const yChanged =
      (Number.isFinite(ny) && !Number.isFinite(by)) ||
      (!Number.isFinite(ny) && Number.isFinite(by)) ||
      (Number.isFinite(ny) && Number.isFinite(by) && Math.abs(ny - by) > eps);
    if (xChanged || yChanged) {
      out.push(getIKTrackId(i, "target"));
    }
  }
  const nowT = ensureTransformConstraints(m);
  const baseT = ensureTransformConstraints(temp);
  const tN = Math.min(nowT.length, baseT.length);
  for (let i = 0; i < tN; i += 1) {
    if (Math.abs((Number(nowT[i].rotateMix) || 0) - (Number(baseT[i].rotateMix) || 0)) > eps) out.push(getTransformTrackId(i, "rotateMix"));
    if (Math.abs((Number(nowT[i].translateMix) || 0) - (Number(baseT[i].translateMix) || 0)) > eps)
      out.push(getTransformTrackId(i, "translateMix"));
    if (Math.abs((Number(nowT[i].scaleMix) || 0) - (Number(baseT[i].scaleMix) || 0)) > eps) out.push(getTransformTrackId(i, "scaleMix"));
    if (Math.abs((Number(nowT[i].shearMix) || 0) - (Number(baseT[i].shearMix) || 0)) > eps) out.push(getTransformTrackId(i, "shearMix"));
  }
  const nowP = ensurePathConstraints(m);
  const baseP = ensurePathConstraints(temp);
  const pN = Math.min(nowP.length, baseP.length);
  for (let i = 0; i < pN; i += 1) {
    if (Math.abs((Number(nowP[i].position) || 0) - (Number(baseP[i].position) || 0)) > eps) out.push(getPathTrackId(i, "position"));
    if (Math.abs((Number(nowP[i].spacing) || 0) - (Number(baseP[i].spacing) || 0)) > eps) out.push(getPathTrackId(i, "spacing"));
    if (Math.abs((Number(nowP[i].rotateMix) || 0) - (Number(baseP[i].rotateMix) || 0)) > eps) out.push(getPathTrackId(i, "rotateMix"));
    if (Math.abs((Number(nowP[i].translateMix) || 0) - (Number(baseP[i].translateMix) || 0)) > eps)
      out.push(getPathTrackId(i, "translateMix"));
  }
  return [...new Set(out)];
}

function addAutoKeyframeFromDirty() {
  if (!state.mesh) return;
  let dirty = [...state.anim.dirtyTracks];
  if (dirty.length === 0) dirty = collectChangedTracksAtCurrentTime();
  if (dirty.length === 0 && state.boneMode === "pose" && state.selectedIK >= 0) {
    const list = ensureIKConstraints(state.mesh);
    const ik = list[state.selectedIK];
    if (ik && (!Number.isFinite(Number(ik.target)) || Number(ik.target) < 0)) {
      dirty = [getIKTrackId(state.selectedIK, "target")];
    }
  }
  if (dirty.length === 0) dirty = [state.anim.selectedTrack].filter(Boolean);
  if (dirty.length === 0) {
    addOrUpdateKeyframeAtCurrentTime();
    return;
  }
  for (const trackId of dirty) {
    addOrUpdateKeyframeForTrack(trackId);
  }
  state.anim.dirtyTracks = [];
  setStatus(`Auto key on ${dirty.length} track(s) @ ${state.anim.time.toFixed(2)}s`);
}

function updatePlaybackButtons() {
  const playing = !!state.anim.playing;
  if (els.playBtn) {
    els.playBtn.classList.toggle("playing", playing);
    els.playBtn.classList.toggle("paused", !playing);
    els.playBtn.textContent = playing ? "Pause" : "Play";
  }
}

function deleteSelectedOrCurrentKeyframe() {
  const anim = getCurrentAnimation();
  if (!anim) return;
  const sk = state.anim.selectedKey;
  if (!sk) {
    setStatus("No selected key.");
    return;
  }
  const selectedSet = new Set((state.anim.selectedKeys || []).map((s) => `${s.trackId}::${s.keyId}`));
  const keySet = new Set([...selectedSet, `${sk.trackId}::${sk.keyId}`]);
  let removed = 0;
  for (const trackId of Object.keys(anim.tracks || {})) {
    const list = getTrackKeys(anim, trackId);
    const next = list.filter((k) => {
      const keep = !keySet.has(`${trackId}::${k.id}`);
      if (!keep) removed += 1;
      return keep;
    });
    anim.tracks[trackId] = next;
  }
  if (removed <= 0) {
    setStatus("No key removed.");
    return;
  }
  clearTimelineKeySelection();
  renderTimelineTracks();
  setStatus(removed > 1 ? `${removed} keys deleted.` : "Key deleted.");
}

function copySelectedKeyframe() {
  const anim = getCurrentAnimation();
  const sk = state.anim.selectedKey;
  if (!anim || !sk) return;
  const keys = getTrackKeys(anim, sk.trackId);
  const k = keys.find((x) => x.id === sk.keyId);
  if (!k) return;
  state.anim.keyClipboard = {
    trackId: sk.trackId,
    value: cloneTrackValue(k.value),
    interp: k.interp || "linear",
    curve: Array.isArray(k.curve) && k.curve.length >= 4 ? k.curve.slice(0, 4) : null,
  };
  setStatus("Key copied.");
}

function pasteKeyframeAtCurrentTime() {
  const anim = getCurrentAnimation();
  if (!anim || !state.anim.keyClipboard) return;
  const trackId = state.anim.selectedTrack || state.anim.keyClipboard.trackId;
  const keys = getTrackKeys(anim, trackId);
  const t = snapTimeIfNeeded(state.anim.time);
  const existing = keys.find((k) => Math.abs(k.time - t) < 1e-4);
  if (existing) {
    existing.value = cloneTrackValue(state.anim.keyClipboard.value);
    existing.interp = state.anim.keyClipboard.interp || "linear";
    if (Array.isArray(state.anim.keyClipboard.curve) && state.anim.keyClipboard.curve.length >= 4) {
      existing.curve = state.anim.keyClipboard.curve.slice(0, 4);
    } else {
      delete existing.curve;
    }
    setSingleTimelineSelection(trackId, existing.id);
  } else {
    const nk = {
      id: `k_${Math.random().toString(36).slice(2, 10)}`,
      time: t,
      value: cloneTrackValue(state.anim.keyClipboard.value),
      interp: state.anim.keyClipboard.interp || "linear",
    };
    if (Array.isArray(state.anim.keyClipboard.curve) && state.anim.keyClipboard.curve.length >= 4) {
      nk.curve = state.anim.keyClipboard.curve.slice(0, 4);
    }
    keys.push(nk);
    setSingleTimelineSelection(trackId, nk.id);
  }
  normalizeTrackKeys(anim, trackId);
  setAnimTime(t);
  renderTimelineTracks();
  setStatus("Key pasted/overwritten.");
}

function jumpToNeighborKey(direction) {
  const anim = getCurrentAnimation();
  if (!anim || !state.anim.selectedTrack) return;
  const keys = getTrackKeys(anim, state.anim.selectedTrack);
  if (!keys || keys.length === 0) return;
  const t = state.anim.time;
  const ordered = [...keys].sort((a, b) => a.time - b.time);
  let target = null;
  if (direction > 0) {
    target = ordered.find((k) => k.time > t + 1e-5) || ordered[0];
  } else {
    for (let i = ordered.length - 1; i >= 0; i -= 1) {
      if (ordered[i].time < t - 1e-5) {
        target = ordered[i];
        break;
      }
    }
    if (!target) target = ordered[ordered.length - 1];
  }
  setAnimTime(target.time);
  setSingleTimelineSelection(state.anim.selectedTrack, target.id);
  if (state.mesh) {
    samplePoseAtTime(state.mesh, state.anim.time);
    if (state.boneMode === "pose") updateBoneUI();
  }
  renderTimelineTracks();
}

function addOrUpdateEventAtCurrentTime() {
  const anim = getCurrentAnimation();
  if (!anim) return;
  const t = snapTimeIfNeeded(state.anim.time);
  const keys = getTrackKeys(anim, EVENT_TRACK_ID);
  const existing = keys.find((k) => Math.abs((Number(k.time) || 0) - t) < 1e-4);
  const value = getEventDraftFromUI();
  if (existing) {
    existing.value = value;
    existing.interp = "stepped";
    setSingleTimelineSelection(EVENT_TRACK_ID, existing.id);
  } else {
    const nk = { id: `k_${Math.random().toString(36).slice(2, 10)}`, time: t, value, interp: "stepped" };
    keys.push(nk);
    setSingleTimelineSelection(EVENT_TRACK_ID, nk.id);
  }
  normalizeTrackKeys(anim, EVENT_TRACK_ID);
  setAnimTime(t);
  renderTimelineTracks();
  setStatus(`Event key saved @ ${t.toFixed(3)}s`);
}

function updateSelectedEventKeyFromUI() {
  const anim = getCurrentAnimation();
  const sk = state.anim.selectedKey;
  if (!anim || !sk || sk.trackId !== EVENT_TRACK_ID) return;
  const keys = getTrackKeys(anim, EVENT_TRACK_ID);
  const k = keys.find((it) => it.id === sk.keyId);
  if (!k) return;
  k.value = getEventDraftFromUI();
  renderTimelineTracks();
}

function deleteSelectedEventKey() {
  const anim = getCurrentAnimation();
  const sk = state.anim.selectedKey;
  if (!anim || !sk || sk.trackId !== EVENT_TRACK_ID) return false;
  const keys = getTrackKeys(anim, EVENT_TRACK_ID);
  const before = keys.length;
  anim.tracks[EVENT_TRACK_ID] = keys.filter((k) => k.id !== sk.keyId);
  if (anim.tracks[EVENT_TRACK_ID].length === before) return false;
  clearTimelineKeySelection();
  renderTimelineTracks();
  return true;
}

function lerpAngle(a, b, t) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

function lerpArray(a, b, t) {
  const n = Math.min(Array.isArray(a) ? a.length : 0, Array.isArray(b) ? b.length : 0);
  const out = new Array(n);
  for (let i = 0; i < n; i += 1) {
    const av = Number(a[i]) || 0;
    const bv = Number(b[i]) || 0;
    out[i] = av + (bv - av) * t;
  }
  return out;
}

function evalBezier1D(u, p1, p2) {
  const omt = 1 - u;
  return 3 * omt * omt * u * p1 + 3 * omt * u * u * p2 + u * u * u;
}

function evalBezierEase(alpha, curve) {
  const c = Array.isArray(curve) && curve.length >= 4 ? curve : [0.25, 0.25, 0.75, 0.75];
  const x1 = math.clamp(Number(c[0]) || 0, 0, 1);
  const y1 = math.clamp(Number(c[1]) || 0, 0, 1);
  const x2 = math.clamp(Number(c[2]) || 1, 0, 1);
  const y2 = math.clamp(Number(c[3]) || 1, 0, 1);
  const x = math.clamp(alpha, 0, 1);
  let lo = 0;
  let hi = 1;
  let u = x;
  for (let i = 0; i < 18; i += 1) {
    const xu = evalBezier1D(u, x1, x2);
    if (Math.abs(xu - x) < 1e-5) break;
    if (xu > x) hi = u;
    else lo = u;
    u = (lo + hi) * 0.5;
  }
  return math.clamp(evalBezier1D(u, y1, y2), 0, 1);
}

function sampleTrackValueAtTime(keys, parsed, t) {
  if (!keys || keys.length === 0) return null;
  if (keys.length === 1 || t <= keys[0].time) return cloneTrackValue(keys[0].value);
  if (t >= keys[keys.length - 1].time) return cloneTrackValue(keys[keys.length - 1].value);
  let i1 = 1;
  while (i1 < keys.length && keys[i1].time < t) i1 += 1;
  const k0 = keys[i1 - 1];
  const k1 = keys[i1];
  const span = Math.max(1e-6, k1.time - k0.time);
  let alpha = (t - k0.time) / span;
  const interp = k0.interp || "linear";
  if (interp === "stepped") return cloneTrackValue(k0.value);
  if (interp === "bezier") alpha = evalBezierEase(alpha, k0.curve);
  if (parsed.type === "vertex") return lerpArray(k0.value, k1.value, alpha);
  if (parsed.type === "ik" && parsed.prop === "target") {
    return {
      x: (Number(k0.value && k0.value.x) || 0) + ((Number(k1.value && k1.value.x) || 0) - (Number(k0.value && k0.value.x) || 0)) * alpha,
      y: (Number(k0.value && k0.value.y) || 0) + ((Number(k1.value && k1.value.y) || 0) - (Number(k0.value && k0.value.y) || 0)) * alpha,
    };
  }
  if (parsed.type === "ik" && parsed.prop === "bend") return alpha < 0.5 ? k0.value : k1.value;
  if (parsed.type === "draworder") return alpha < 0.5 ? cloneTrackValue(k0.value) : cloneTrackValue(k1.value);
  if (parsed.type === "slot" && parsed.prop === "attachment") return alpha < 0.5 ? !!k0.value : !!k1.value;
  if (parsed.type === "slot" && parsed.prop === "color") {
    const a0 = k0.value && typeof k0.value === "object" ? k0.value : {};
    const a1 = k1.value && typeof k1.value === "object" ? k1.value : {};
    return {
      r: (Number(a0.r) || 1) + ((Number(a1.r) || 1) - (Number(a0.r) || 1)) * alpha,
      g: (Number(a0.g) || 1) + ((Number(a1.g) || 1) - (Number(a0.g) || 1)) * alpha,
      b: (Number(a0.b) || 1) + ((Number(a1.b) || 1) - (Number(a0.b) || 1)) * alpha,
      a: (Number(a0.a) || 1) + ((Number(a1.a) || 1) - (Number(a0.a) || 1)) * alpha,
    };
  }
  if (parsed.prop === "rotate") return lerpAngle(k0.value, k1.value, alpha);
  if (parsed.prop === "translate") {
    return { x: k0.value.x + (k1.value.x - k0.value.x) * alpha, y: k0.value.y + (k1.value.y - k0.value.y) * alpha };
  }
  return k0.value + (k1.value - k0.value) * alpha;
}

function sampleAnimationToModelAtTime(m, anim, t) {
  if (!m || !anim) return;
  syncPoseFromRig(m);
  if (state.slots.length > 0) {
    const slot = getActiveSlot();
    if (slot) {
      ensureSlotMeshData(slot, m);
      if (slot.meshData && slot.meshData.offsets && slot.meshData.baseOffsets) {
        slot.meshData.offsets.set(slot.meshData.baseOffsets);
      }
    }
  } else if (m.baseOffsets && m.offsets) {
    m.offsets.set(m.baseOffsets);
  }
  const tracks = anim.tracks;
  for (const trackId of Object.keys(tracks)) {
    const keys = tracks[trackId];
    if (!keys || keys.length === 0) continue;
    const parsed = parseTrackId(trackId);
    if (!parsed) continue;
    const sampled = sampleTrackValueAtTime(keys, parsed, t);
    setTrackValue(m, parsed, sampled);
  }
  for (let i = 0; i < m.poseBones.length; i += 1) {
    if (m.rigBones[i] && m.rigBones[i].poseLenEditable === false) {
      m.poseBones[i].length = m.rigBones[i].length;
    }
  }
  enforceConnectedHeads(m.poseBones);
}

function samplePoseAtTime(m, t) {
  const anim = getCurrentAnimation();
  if (!m || !anim) return;
  sampleAnimationToModelAtTime(m, anim, t);
}

function blendTwoAnimationSamples(m, fromAnim, fromTime, toAnim, toTime, alpha) {
  if (!m || !fromAnim || !toAnim) return;
  const mixAlpha = math.clamp(alpha, 0, 1);
  const offsets = getActiveOffsets(m);
  const tempA = {
    rigBones: cloneBones(m.rigBones),
    poseBones: cloneBones(m.rigBones),
    offsets: new Float32Array(offsets),
    baseOffsets: new Float32Array(offsets),
    ikConstraints: JSON.parse(JSON.stringify(m.ikConstraints || [])),
    transformConstraints: JSON.parse(JSON.stringify(m.transformConstraints || [])),
    pathConstraints: JSON.parse(JSON.stringify(m.pathConstraints || [])),
  };
  const tempB = {
    rigBones: cloneBones(m.rigBones),
    poseBones: cloneBones(m.rigBones),
    offsets: new Float32Array(offsets),
    baseOffsets: new Float32Array(offsets),
    ikConstraints: JSON.parse(JSON.stringify(m.ikConstraints || [])),
    transformConstraints: JSON.parse(JSON.stringify(m.transformConstraints || [])),
    pathConstraints: JSON.parse(JSON.stringify(m.pathConstraints || [])),
  };
  sampleAnimationToModelAtTime(tempA, fromAnim, fromTime);
  sampleAnimationToModelAtTime(tempB, toAnim, toTime);

  const n = Math.min(m.poseBones.length, tempA.poseBones.length, tempB.poseBones.length);
  for (let i = 0; i < n; i += 1) {
    const out = m.poseBones[i];
    const a = tempA.poseBones[i];
    const b = tempB.poseBones[i];
    if (!out || !a || !b) continue;
    normalizeBoneChannels(out);
    out.tx = a.tx + (b.tx - a.tx) * mixAlpha;
    out.ty = a.ty + (b.ty - a.ty) * mixAlpha;
    out.rot = lerpAngle(a.rot, b.rot, mixAlpha);
    out.length = a.length + (b.length - a.length) * mixAlpha;
    out.sx = a.sx + (b.sx - a.sx) * mixAlpha;
    out.sy = a.sy + (b.sy - a.sy) * mixAlpha;
    out.shx = a.shx + (b.shx - a.shx) * mixAlpha;
    out.shy = a.shy + (b.shy - a.shy) * mixAlpha;
  }
  if (m.offsets && tempA.offsets && tempB.offsets && m.offsets.length === tempA.offsets.length && m.offsets.length === tempB.offsets.length) {
    for (let i = 0; i < m.offsets.length; i += 1) {
      m.offsets[i] = tempA.offsets[i] + (tempB.offsets[i] - tempA.offsets[i]) * mixAlpha;
    }
  }
  const ikOut = ensureIKConstraints(m);
  const ikA = ensureIKConstraints(tempA);
  const ikB = ensureIKConstraints(tempB);
  const ikN = Math.min(ikOut.length, ikA.length, ikB.length);
  for (let i = 0; i < ikN; i += 1) {
    ikOut[i].mix = (Number(ikA[i].mix) || 0) + ((Number(ikB[i].mix) || 0) - (Number(ikA[i].mix) || 0)) * mixAlpha;
    ikOut[i].bendPositive = mixAlpha < 0.5 ? ikA[i].bendPositive !== false : ikB[i].bendPositive !== false;
    const ax = Number(ikA[i].targetX);
    const ay = Number(ikA[i].targetY);
    const bx = Number(ikB[i].targetX);
    const by = Number(ikB[i].targetY);
    if (Number.isFinite(ax) && Number.isFinite(bx)) ikOut[i].targetX = ax + (bx - ax) * mixAlpha;
    if (Number.isFinite(ay) && Number.isFinite(by)) ikOut[i].targetY = ay + (by - ay) * mixAlpha;
  }
  const tOut = ensureTransformConstraints(m);
  const tA = ensureTransformConstraints(tempA);
  const tB = ensureTransformConstraints(tempB);
  const tN = Math.min(tOut.length, tA.length, tB.length);
  for (let i = 0; i < tN; i += 1) {
    tOut[i].rotateMix = (Number(tA[i].rotateMix) || 0) + ((Number(tB[i].rotateMix) || 0) - (Number(tA[i].rotateMix) || 0)) * mixAlpha;
    tOut[i].translateMix =
      (Number(tA[i].translateMix) || 0) + ((Number(tB[i].translateMix) || 0) - (Number(tA[i].translateMix) || 0)) * mixAlpha;
    tOut[i].scaleMix = (Number(tA[i].scaleMix) || 0) + ((Number(tB[i].scaleMix) || 0) - (Number(tA[i].scaleMix) || 0)) * mixAlpha;
    tOut[i].shearMix = (Number(tA[i].shearMix) || 0) + ((Number(tB[i].shearMix) || 0) - (Number(tA[i].shearMix) || 0)) * mixAlpha;
  }
  const pOut = ensurePathConstraints(m);
  const pA = ensurePathConstraints(tempA);
  const pB = ensurePathConstraints(tempB);
  const pN = Math.min(pOut.length, pA.length, pB.length);
  for (let i = 0; i < pN; i += 1) {
    pOut[i].position = (Number(pA[i].position) || 0) + ((Number(pB[i].position) || 0) - (Number(pA[i].position) || 0)) * mixAlpha;
    pOut[i].spacing = (Number(pA[i].spacing) || 0) + ((Number(pB[i].spacing) || 0) - (Number(pA[i].spacing) || 0)) * mixAlpha;
    pOut[i].rotateMix = (Number(pA[i].rotateMix) || 0) + ((Number(pB[i].rotateMix) || 0) - (Number(pA[i].rotateMix) || 0)) * mixAlpha;
    pOut[i].translateMix =
      (Number(pA[i].translateMix) || 0) + ((Number(pB[i].translateMix) || 0) - (Number(pA[i].translateMix) || 0)) * mixAlpha;
  }
  enforceConnectedHeads(m.poseBones);
}

function updateAnimationPlayback(ts) {
  if (!state.anim.playing) {
    state.anim.lastTs = ts;
    updatePlaybackButtons();
    refreshAnimationMixUI();
    return;
  }
  const anim = getCurrentAnimation();
  if (!state.mesh || !anim) {
    state.anim.playing = false;
    updatePlaybackButtons();
    refreshAnimationMixUI();
    return;
  }
  const dt = state.anim.lastTs > 0 ? (ts - state.anim.lastTs) * 0.001 : 0;
  state.anim.lastTs = ts;

  if (state.anim.mix.active) {
    const fromAnim = state.anim.animations.find((a) => a.id === state.anim.mix.fromAnimId);
    const toAnim = state.anim.animations.find((a) => a.id === state.anim.mix.toAnimId);
    if (!fromAnim || !toAnim) {
      state.anim.mix.active = false;
      refreshAnimationMixUI();
      return;
    }
    const advanceTime = (curr, duration) => {
      const d = Math.max(0.1, Number(duration) || 0.1);
      let next = curr + dt;
      if (next > d) next = state.anim.loop ? 0 : d;
      return next;
    };
    const prevFrom = state.anim.mix.fromTime;
    const prevTo = state.anim.mix.toTime;
    state.anim.mix.fromTime = advanceTime(prevFrom, fromAnim.duration);
    state.anim.mix.toTime = advanceTime(prevTo, toAnim.duration);
    emitTimelineEventsBetween(fromAnim, prevFrom, state.anim.mix.fromTime, state.anim.mix.fromTime < prevFrom, "mix_from");
    emitTimelineEventsBetween(toAnim, prevTo, state.anim.mix.toTime, state.anim.mix.toTime < prevTo, "mix_to");
    state.anim.mix.elapsed += dt;
    const alpha = math.clamp(state.anim.mix.elapsed / Math.max(1e-6, state.anim.mix.duration), 0, 1);
    blendTwoAnimationSamples(state.mesh, fromAnim, state.anim.mix.fromTime, toAnim, state.anim.mix.toTime, alpha);
    setAnimTime(state.anim.mix.toTime);
    if (state.boneMode === "pose") updateBoneUI();
    if (alpha >= 1) {
      state.anim.mix.active = false;
      setStatus(`Mix done: ${fromAnim.name} -> ${toAnim.name}`);
    }
    refreshAnimationMixUI();
    return;
  }

  let hasAnyKey = false;
  for (const k of Object.keys(anim.tracks)) {
    if (anim.tracks[k] && anim.tracks[k].length > 0) {
      hasAnyKey = true;
      break;
    }
  }
  if (!hasAnyKey) {
    state.anim.playing = false;
    updatePlaybackButtons();
    refreshAnimationMixUI();
    return;
  }
  const prevTime = state.anim.time;
  let next = prevTime + dt;
  if (next > anim.duration) {
    if (state.anim.loop) next = 0;
    else {
      next = anim.duration;
      state.anim.playing = false;
      updatePlaybackButtons();
    }
  }
  setAnimTime(next);
  emitTimelineEventsBetween(anim, prevTime, next, next < prevTime, "play");
  samplePoseAtTime(state.mesh, state.anim.time);
  if (state.boneMode === "pose") {
    updateBoneUI();
  }
  refreshAnimationMixUI();
}

function emitTimelineEventsBetween(anim, fromTime, toTime, looped = false, phase = "play") {
  if (!anim) return;
  const rows = getTrackKeys(anim, EVENT_TRACK_ID);
  if (!rows || rows.length === 0) return;
  const out = [];
  const t0 = Number(fromTime) || 0;
  const t1 = Number(toTime) || 0;
  for (const r of rows) {
    const tr = Number(r.time) || 0;
    if (!looped) {
      if (tr > t0 + 1e-6 && tr <= t1 + 1e-6) out.push(r);
    } else if (tr > t0 + 1e-6 || tr <= t1 + 1e-6) {
      out.push(r);
    }
  }
  if (out.length === 0) return;
  for (const r of out) {
    const v = r.value && typeof r.value === "object" ? r.value : {};
    const detail = {
      animationId: anim.id,
      animationName: anim.name,
      time: Number(r.time) || 0,
      name: String(v.name || "event"),
      int: Number(v.int) || 0,
      float: Number(v.float) || 0,
      string: v.string != null ? String(v.string) : "",
      phase,
    };
    window.dispatchEvent(new CustomEvent("timeline-event", { detail }));
  }
  const last = out[out.length - 1];
  const lv = last.value && typeof last.value === "object" ? last.value : {};
  setStatus(`Event: ${(lv.name || "event").toString()} @ ${(Number(last.time) || 0).toFixed(3)}s`);
}

els.fileInput.addEventListener("change", async (e) => {
  const files = Array.from(e.target.files || []);
  if (files.length === 0) return;
  try {
    const hadProject = !!state.mesh;
    const hadSlots = state.slots.length > 0;
    let added = 0;
    let importedPsd = false;
    for (const file of files) {
      if (file.name.toLowerCase().endsWith(".psd")) importedPsd = true;
      const slots = await loadFileSlots(file);
      for (const s of slots) {
        const wasEmpty = state.slots.length === 0;
        addSlotEntry(s, true);
        added += 1;
        if (wasEmpty) {
          const first = state.slots[state.activeSlot];
          state.sourceCanvas = first.canvas;
          state.imageWidth = Number.isFinite(first.docWidth) ? first.docWidth : first.canvas.width;
          state.imageHeight = Number.isFinite(first.docHeight) ? first.docHeight : first.canvas.height;
          updateTexture();
          rebuildMesh();
        }
      }
    }
    if (state.mesh) {
      ensureSlotsHaveBoneBinding();
      if (importedPsd) state.slotViewMode = "all";
      updateBoneUI();
    }
    if (state.activeSlot >= 0) {
      setActiveSlot(state.activeSlot);
    }
    const modeText = hadProject || hadSlots ? "Added" : "Imported";
    setStatus(`${modeText} ${added} slot(s). Current slot: ${state.slots[state.activeSlot]?.name || "-"}`);
  } catch (err) {
    console.error(err);
    setStatus(`Import failed: ${err.message}`);
  } finally {
    e.target.value = "";
  }
});

if (els.boneTree) {
  els.boneTree.addEventListener("click", (ev) => {
    const eyeBtn = ev.target.closest(".slot-eye[data-slot-eye]");
    if (eyeBtn) {
      const si = Number(eyeBtn.dataset.slotEye);
      if (Number.isFinite(si) && state.slots[si]) {
        state.slots[si].visible = state.slots[si].visible === false;
        markDirtyBySlotProp(si, "attachment");
        renderBoneTree();
        refreshSlotUI();
      }
      return;
    }
    const slotItem = ev.target.closest(".tree-item[data-slot-index]");
    if (slotItem) {
      const si = Number(slotItem.dataset.slotIndex);
      if (Number.isFinite(si)) {
        setActiveSlot(si);
        setStatus(`Switched to slot: ${state.slots[si].name}`);
      }
      return;
    }
    const item = ev.target.closest(".tree-item[data-bone-index]");
    if (!item || !state.mesh) return;
    const i = Number(item.dataset.boneIndex);
    if (!Number.isFinite(i)) return;
    if (ev.ctrlKey || ev.metaKey) {
      const set = new Set(getSelectedBonesForWeight(state.mesh));
      if (set.has(i)) set.delete(i);
      else set.add(i);
      state.selectedBonesForWeight = [...set];
      state.selectedBone = i;
      updateBoneUI();
      setStatus(`Weight bone selection: ${state.selectedBonesForWeight.join(", ") || "(none)"}`);
      return;
    }
    state.selectedBone = i;
    state.selectedBonesForWeight = [i];
    updateBoneUI();
  });
}

if (els.fileOpenBtn) {
  els.fileOpenBtn.addEventListener("click", () => {
    els.fileInput.click();
  });
}

if (els.slotSelect) {
  els.slotSelect.addEventListener("change", () => {
    const i = Number(els.slotSelect.value);
    if (!Number.isFinite(i)) return;
    setActiveSlot(i);
    setStatus(`Switched to slot: ${state.slots[i]?.name || i}`);
  });
}

if (els.slotViewMode) {
  els.slotViewMode.addEventListener("change", () => {
    state.slotViewMode = els.slotViewMode.value === "all" ? "all" : "single";
    refreshSlotUI();
    renderBoneTree();
    setStatus(state.slotViewMode === "all" ? "Slot view: all visible." : "Slot view: single slot.");
  });
}

if (els.slotName) {
  els.slotName.addEventListener("input", () => {
    const s = getActiveSlot();
    if (!s) return;
    s.name = els.slotName.value.trim() || `slot_${state.activeSlot}`;
    refreshSlotUI();
    renderBoneTree();
  });
}

if (els.slotBone) {
  els.slotBone.addEventListener("change", () => {
    const s = getActiveSlot();
    if (!s) return;
    const bone = Number(els.slotBone.value);
    s.bone = Number.isFinite(bone) ? bone : -1;
    if (!Number.isFinite(s.bone) || s.bone < 0) {
      ensureSlotsHaveBoneBinding();
    }
    if (state.mesh) {
      if (getSlotWeightMode(s) === "single") {
        s.weightBindMode = "single";
        s.influenceBones = Number.isFinite(s.bone) && s.bone >= 0 ? [s.bone] : [];
      } else if (!Array.isArray(s.influenceBones) || s.influenceBones.length === 0) {
        s.influenceBones = Number.isFinite(s.bone) && s.bone >= 0 ? [s.bone] : getSlotInfluenceBones(s, state.mesh);
      }
      rebuildSlotWeights(s, state.mesh);
    }
    refreshSlotUI();
    renderBoneTree();
  });
}

if (els.slotVisible) {
  els.slotVisible.addEventListener("change", () => {
    const s = getActiveSlot();
    if (!s) return;
    s.visible = !!els.slotVisible.checked;
    markDirtyBySlotProp(state.activeSlot, "attachment");
    renderBoneTree();
  });
}

if (els.slotAlpha) {
  els.slotAlpha.addEventListener("input", () => {
    const s = getActiveSlot();
    if (!s) return;
    s.alpha = math.clamp(Number(els.slotAlpha.value) || 1, 0, 1);
    markDirtyBySlotProp(state.activeSlot, "color");
  });
}
if (els.slotColor) {
  els.slotColor.addEventListener("input", () => {
    const s = getActiveSlot();
    if (!s) return;
    const c = colorHexToRgb01(els.slotColor.value || "#ffffff");
    s.r = c.r;
    s.g = c.g;
    s.b = c.b;
    markDirtyBySlotProp(state.activeSlot, "color");
  });
}

if (els.slotWeightMode) {
  els.slotWeightMode.addEventListener("change", () => {
    const s = getActiveSlot();
    if (!s || !state.mesh) return;
    const mode = els.slotWeightMode.value;
    s.weightMode = mode === "weighted" ? "weighted" : mode === "free" ? "free" : "single";
    if (s.weightMode === "weighted") {
      s.useWeights = true;
      s.weightBindMode = "auto";
    } else if (s.weightMode === "single") {
      s.useWeights = true;
      s.weightBindMode = "single";
    } else {
      s.useWeights = false;
      s.weightBindMode = "none";
    }
    rebuildSlotWeights(s, state.mesh);
    refreshSlotUI();
  });
}

if (els.slotInfluenceBones) {
  els.slotInfluenceBones.addEventListener("change", () => {
    const s = getActiveSlot();
    if (!s || !state.mesh) return;
    const mode = getSlotWeightMode(s);
    if (mode !== "weighted") return;
    const selected = Array.from(els.slotInfluenceBones.selectedOptions)
      .map((o) => Number(o.value))
      .filter((v) => Number.isFinite(v));
    s.influenceBones = selected.length > 0 ? [...new Set(selected)] : getSlotInfluenceBones(s, state.mesh);
    rebuildSlotWeights(s, state.mesh);
  });
}

function applySlotTransformFromInputs() {
  const s = getActiveSlot();
  if (!s) return;
  s.tx = Number(els.slotTx.value) || 0;
  s.ty = Number(els.slotTy.value) || 0;
  s.rot = math.degToRad(Number(els.slotRot.value) || 0);
}

if (els.slotTx) {
  els.slotTx.addEventListener("input", applySlotTransformFromInputs);
}
if (els.slotTy) {
  els.slotTy.addEventListener("input", applySlotTransformFromInputs);
}
if (els.slotRot) {
  els.slotRot.addEventListener("input", applySlotTransformFromInputs);
}

function moveActiveSlot(delta) {
  const i = state.activeSlot;
  const j = i + delta;
  if (i < 0 || j < 0 || j >= state.slots.length) return;
  const tmp = state.slots[i];
  state.slots[i] = state.slots[j];
  state.slots[j] = tmp;
  state.activeSlot = j;
  markDirtyDrawOrder();
  refreshSlotUI();
  renderBoneTree();
}

if (els.slotOrderUp) {
  els.slotOrderUp.addEventListener("click", () => {
    moveActiveSlot(-1);
  });
}
if (els.slotOrderDown) {
  els.slotOrderDown.addEventListener("click", () => {
    moveActiveSlot(1);
  });
}

  if (els.fileNewBtn) {
  els.fileNewBtn.addEventListener("click", () => {
    state.sourceCanvas = null;
    state.texture = null;
    state.imageWidth = 0;
    state.imageHeight = 0;
    state.slots = [];
    state.activeSlot = -1;
    state.slotViewMode = "single";
    state.mesh = null;
    state.selectedBone = -1;
    state.selectedBonesForWeight = [];
    state.selectedIK = -1;
    state.selectedTransform = -1;
    state.selectedPath = -1;
    state.anim.animations = [createAnimation("Anim 1")];
    state.anim.currentAnimId = state.anim.animations[0].id;
    state.anim.selectedTrack = "";
    state.anim.selectedKey = null;
    state.anim.selectedKeys = [];
    state.anim.playing = false;
    state.anim.mix.active = false;
    state.anim.dirtyTracks = [];
    setAnimTime(0);
    refreshAnimationUI();
    refreshSlotUI();
    updatePlaybackButtons();
    renderBoneTree();
    setStatus("New project created.");
  });
}

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
  const slotRecords = state.slots.map((s) => {
    let imageIndex = -1;
    if (s && s.canvas) {
      if (!canvasIndexMap.has(s.canvas)) {
        canvasIndexMap.set(s.canvas, slotImages.length);
        slotImages.push(s.canvas.toDataURL("image/png"));
      }
      imageIndex = canvasIndexMap.get(s.canvas);
    }
    return {
      id: s.id || makeSlotId(),
      name: s.name,
      attachmentName: s.attachmentName || "main",
      bone: s.bone,
      visible: s.visible !== false,
      alpha: Number.isFinite(s.alpha) ? s.alpha : 1,
      r: Number.isFinite(s.r) ? s.r : 1,
      g: Number.isFinite(s.g) ? s.g : 1,
      b: Number.isFinite(s.b) ? s.b : 1,
      tx: Number.isFinite(s.tx) ? s.tx : 0,
      ty: Number.isFinite(s.ty) ? s.ty : 0,
      rot: Number.isFinite(s.rot) ? s.rot : 0,
      useWeights: s.useWeights === true,
      weightBindMode: s.weightBindMode || (s.useWeights ? "single" : "none"),
      weightMode: getSlotWeightMode(s),
      influenceBones: Array.isArray(s.influenceBones) ? s.influenceBones : [],
      rect: s.rect || null,
      docWidth: s.docWidth || state.imageWidth,
      docHeight: s.docHeight || state.imageHeight,
      imageIndex,
      meshContour:
        s.meshContour && Array.isArray(s.meshContour.points)
          ? {
              points: s.meshContour.points.map((p) => ({ x: Number(p.x) || 0, y: Number(p.y) || 0 })),
              closed: !!s.meshContour.closed,
              triangles: Array.isArray(s.meshContour.triangles) ? s.meshContour.triangles.map((v) => Number(v) || 0) : [],
              fillPoints: Array.isArray(s.meshContour.fillPoints)
                ? s.meshContour.fillPoints.map((p) => ({ x: Number(p.x) || 0, y: Number(p.y) || 0 }))
                : [],
              fillTriangles: Array.isArray(s.meshContour.fillTriangles)
                ? s.meshContour.fillTriangles.map((v) => Number(v) || 0)
                : [],
              manualEdges: Array.isArray(s.meshContour.manualEdges)
                ? s.meshContour.manualEdges
                    .filter((e) => Array.isArray(e) && e.length >= 2)
                    .map((e) => [Number(e[0]) || 0, Number(e[1]) || 0])
                : [],
              fillManualEdges: Array.isArray(s.meshContour.fillManualEdges)
                ? s.meshContour.fillManualEdges
                    .filter((e) => Array.isArray(e) && e.length >= 2)
                    .map((e) => [Number(e[0]) || 0, Number(e[1]) || 0])
                : [],
            }
          : null,
    };
  });

  return {
    version: 2,
    imageWidth: state.imageWidth,
    imageHeight: state.imageHeight,
    gridX: Number(els.gridX.value) || 24,
    gridY: Number(els.gridY.value) || 24,
    rigBones: state.mesh ? state.mesh.rigBones : [],
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
            order: Math.max(0, Number(c && c.order) || i),
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
            order: Math.max(0, Number(c && c.order) || i),
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
            sourceType: c && c.sourceType === "bone_chain" ? "bone_chain" : "slot",
            targetSlot: Number(c && c.targetSlot),
            position: Number(c && c.position) || 0,
            spacing: Number(c && c.spacing) || 0,
            rotateMix: math.clamp(Number(c && c.rotateMix) || 0, 0, 1),
            translateMix: math.clamp(Number(c && c.translateMix) || 0, 0, 1),
            closed: !!(c && c.closed),
            order: Math.max(0, Number(c && c.order) || i),
            enabled: c ? c.enabled !== false : true,
          }))
        : [],
    animations: state.anim.animations,
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

function colorHexToInt(color) {
  const c = String(color || "").trim();
  if (!/^[0-9a-fA-F]{8}$/.test(c)) return 0xffffffff;
  return Number.parseInt(c, 16) >>> 0;
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
        add(att.path);
      }
    }
  }
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
  if (key && key.curve === "stepped") writer.byte(1);
  else writer.byte(0);
}

function writeBoneTimelineList(writer, tl) {
  const keys = [];
  if (Array.isArray(tl.rotate) && tl.rotate.length > 0) keys.push({ type: 0, list: tl.rotate });
  if (Array.isArray(tl.translate) && tl.translate.length > 0) keys.push({ type: 1, list: tl.translate });
  if (Array.isArray(tl.scale) && tl.scale.length > 0) keys.push({ type: 2, list: tl.scale });
  if (Array.isArray(tl.shear) && tl.shear.length > 0) keys.push({ type: 3, list: tl.shear });
  writer.varint(keys.length, true);
  for (const k of keys) {
    writer.byte(k.type);
    writer.varint(k.list.length, true);
    writer.varint(0, true);
    for (let i = 0; i < k.list.length; i += 1) {
      const row = k.list[i] || {};
      writer.float(Number(row.time) || 0);
      if (k.type === 0) {
        writer.float(Number(row.value) || 0);
      } else {
        writer.float(Number(row.x) || 0);
        writer.float(Number(row.y) || 0);
      }
      if (i < k.list.length - 1) writeCurve(writer, row);
    }
  }
}

function writeSkelVertices(writer, vertices, vertexCount) {
  const arr = Array.isArray(vertices) ? vertices : [];
  if (arr.length === vertexCount * 2) {
    writer.bool(false);
    for (let i = 0; i < arr.length; i += 1) writer.float(Number(arr[i]) || 0);
    return;
  }
  writer.bool(true);
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

function writeSkelAttachment(writer, attName, att, sharedMap) {
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
  writer.string(a.name || attName);
  writer.byte(Number.isFinite(typeCode) ? typeCode : 0);

  if (type === "mesh") {
    writer.refString(a.path || null, sharedMap);
    writer.int(colorHexToInt(a.color || "ffffffff"));
    const uvs = Array.isArray(a.uvs) ? a.uvs : [];
    const triangles = Array.isArray(a.triangles) ? a.triangles : [];
    const vertexCount = Math.floor(uvs.length / 2);
    writer.varint(vertexCount, true);
    for (let i = 0; i < uvs.length; i += 1) writer.float(Number(uvs[i]) || 0);
    writer.varint(triangles.length, true);
    for (let i = 0; i < triangles.length; i += 1) writer.varint(Math.max(0, Number(triangles[i]) || 0), true);
    writeSkelVertices(writer, a.vertices, vertexCount);
    writer.varint(Math.max(0, Number(a.hull) || 0), true);
    writer.varint(0, true);
    writer.float(Number(a.width) || 0);
    writer.float(Number(a.height) || 0);
    return;
  }

  writer.refString(a.path || null, sharedMap);
  writer.float(Number(a.rotation) || 0);
  writer.float(Number(a.x) || 0);
  writer.float(Number(a.y) || 0);
  writer.float(Number(a.scaleX) || 1);
  writer.float(Number(a.scaleY) || 1);
  writer.float(Number(a.width) || 0);
  writer.float(Number(a.height) || 0);
  writer.int(colorHexToInt(a.color || "ffffffff"));
}

function exportSpineSkelBinary(spineJson) {
  const writer = new SpineBinaryWriter();
  const skel = spineJson.skeleton || {};
  const shared = buildSharedStrings(spineJson);
  const sharedMap = shared.index;

  writer.string(skel.hash || "");
  writer.string(skel.spine || "4.2.22");
  writer.float(Number(skel.x) || 0);
  writer.float(Number(skel.y) || 0);
  writer.float(Number(skel.width) || 0);
  writer.float(Number(skel.height) || 0);
  writer.bool(true);
  writer.float(30);
  writer.string(skel.images || "./");
  writer.string(skel.audio || "");

  writer.varint(shared.strings.length, true);
  for (const s of shared.strings) writer.string(s);

  const bones = spineJson.bones || [];
  writer.varint(bones.length, true);
  for (let i = 0; i < bones.length; i += 1) {
    const b = bones[i] || {};
    writer.string(b.name || `bone_${i}`);
    if (i > 0) writer.refString(b.parent || null, sharedMap);
    writer.float(Number(b.rotation) || 0);
    writer.float(Number(b.x) || 0);
    writer.float(Number(b.y) || 0);
    writer.float(Number(b.scaleX) || 1);
    writer.float(Number(b.scaleY) || 1);
    writer.float(Number(b.shearX) || 0);
    writer.float(Number(b.shearY) || 0);
    writer.float(Number(b.length) || 0);
    const inherit = b.inherit || "normal";
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
    writer.refString(s.bone || null, sharedMap);
    writer.int(colorHexToInt(s.color || "ffffffff"));
    writer.int(-1);
    writer.refString(s.attachment || null, sharedMap);
    writer.varint(0, true);
  }

  const boneNameToIndex = new Map();
  for (let i = 0; i < bones.length; i += 1) {
    boneNameToIndex.set(String(bones[i] && bones[i].name ? bones[i].name : `bone_${i}`), i);
  }
  const ikList = Array.isArray(spineJson.ik) ? spineJson.ik : [];
  writer.varint(ikList.length, true);
  for (let i = 0; i < ikList.length; i += 1) {
    const ik = ikList[i] || {};
    const chain = Array.isArray(ik.bones) ? ik.bones : [];
    writer.string(ik.name || `ik_${i}`);
    writer.varint(Math.max(0, Number(ik.order) || i), true);
    writer.bool(!!ik.skin);
    writer.varint(chain.length, true);
    for (const bn of chain) {
      const bi = boneNameToIndex.get(String(bn));
      writer.varint(Number.isFinite(bi) ? bi : 0, true);
    }
    const targetIndex = boneNameToIndex.get(String(ik.target || ""));
    writer.varint(Number.isFinite(targetIndex) ? targetIndex : 0, true);
    writer.float(Math.max(0, Number(ik.mix) || 0));
    writer.float(Math.max(0, Number(ik.softness) || 0));
    writer.byte(ik.bendPositive === false ? -1 : 1);
    writer.bool(!!ik.compress);
    writer.bool(!!ik.stretch);
    writer.bool(!!ik.uniform);
  }
  const tfcList = Array.isArray(spineJson.transform) ? spineJson.transform : [];
  writer.varint(tfcList.length, true);
  for (let i = 0; i < tfcList.length; i += 1) {
    const tc = tfcList[i] || {};
    const chain = Array.isArray(tc.bones) ? tc.bones : [];
    writer.string(tc.name || `transform_${i}`);
    writer.varint(Math.max(0, Number(tc.order) || i), true);
    writer.bool(!!tc.skin);
    writer.varint(chain.length, true);
    for (const bn of chain) {
      const bi = boneNameToIndex.get(String(bn));
      writer.varint(Number.isFinite(bi) ? bi : 0, true);
    }
    const targetIndex = boneNameToIndex.get(String(tc.target || ""));
    writer.varint(Number.isFinite(targetIndex) ? targetIndex : 0, true);
    writer.bool(!!tc.local);
    writer.bool(!!tc.relative);
    writer.float(Number(tc.rotation) || 0);
    writer.float(Number(tc.x) || 0);
    writer.float(Number(tc.y) || 0);
    writer.float(Number(tc.scaleX) || 0);
    writer.float(Number(tc.scaleY) || 0);
    writer.float(Number(tc.shearY) || 0);
    writer.float(math.clamp(Number(tc.rotateMix) || 0, 0, 1));
    writer.float(math.clamp(Number(tc.translateMix) || 0, 0, 1));
    writer.float(math.clamp(Number(tc.scaleMix) || 0, 0, 1));
    writer.float(math.clamp(Number(tc.shearMix) || 0, 0, 1));
  }
  const pathList = Array.isArray(spineJson.path) ? spineJson.path : [];
  writer.varint(pathList.length, true);
  for (let i = 0; i < pathList.length; i += 1) {
    const pc = pathList[i] || {};
    const chain = Array.isArray(pc.bones) ? pc.bones : [];
    writer.string(pc.name || `path_${i}`);
    writer.varint(Math.max(0, Number(pc.order) || i), true);
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
    writer.varint(positionModeMap[pc.positionMode] ?? 0, true);
    writer.varint(spacingModeMap[pc.spacingMode] ?? 0, true);
    writer.varint(rotateModeMap[pc.rotateMode] ?? 0, true);

    writer.float(Number(pc.rotation) || 0);
    writer.float(Number(pc.position) || 0);
    writer.float(Number(pc.spacing) || 0);
    writer.float(math.clamp(Number(pc.rotateMix) || 0, 0, 1));
    writer.float(math.clamp(Number(pc.translateMix) || 0, 0, 1));
  }

  const skinEntries = getSkinEntries(spineJson);
  const defaultEntry = skinEntries.find((s) => s.name === "default") || skinEntries[0] || { name: "default", attachments: {} };
  const defaultSkin = defaultEntry.attachments || {};
  const defaultSlots = Object.keys(defaultSkin);
  writer.varint(defaultSlots.length, true);
  for (const slotName of defaultSlots) {
    const attMap = defaultSkin[slotName] || {};
    const attNames = Object.keys(attMap);
    writer.refString(slotName, sharedMap);
    writer.varint(attNames.length, true);
    for (const attName of attNames) {
      const att = attMap[attName] || {};
      writeSkelAttachment(writer, attName, att, sharedMap);
    }
  }

  const extraSkins = skinEntries.filter((s) => s.name !== defaultEntry.name);
  writer.varint(extraSkins.length, true);
  for (const skinEntry of extraSkins) {
    const skin = skinEntry.attachments || {};
    writer.string(skinEntry.name);
    const slotNames = Object.keys(skin);
    writer.varint(slotNames.length, true);
    for (const slotName of slotNames) {
      const attMap = skin[slotName] || {};
      const attNames = Object.keys(attMap);
      writer.refString(slotName, sharedMap);
      writer.varint(attNames.length, true);
      for (const attName of attNames) {
        const att = attMap[attName] || {};
        writeSkelAttachment(writer, attName, att, sharedMap);
      }
    }
  }

  writer.varint(0, true);

  const anims = spineJson.animations || {};
  const animNames = Object.keys(anims);
  const skinNameToIndex = new Map();
  for (let i = 0; i < skinEntries.length; i += 1) {
    skinNameToIndex.set(skinEntries[i].name, i);
  }
  writer.varint(animNames.length, true);
  for (const animName of animNames) {
    writer.string(animName);
    const a = anims[animName] || {};

    writer.varint(0, true);

    const boneTimelines = a.bones || {};
    const boneEntries = Object.entries(boneTimelines).filter(([, tl]) => tl && typeof tl === "object");
    writer.varint(boneEntries.length, true);
    for (const [boneName, tl] of boneEntries) {
      writer.refString(boneName, sharedMap);
      writeBoneTimelineList(writer, tl);
    }

    const ikTimelines = a.ik || {};
    const ikEntries = Object.entries(ikTimelines).filter(([, rows]) => Array.isArray(rows) && rows.length > 0);
    writer.varint(ikEntries.length, true);
    for (const [ikName, rows] of ikEntries) {
      writer.refString(ikName, sharedMap);
      writer.varint(rows.length, true);
      for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i] || {};
        writer.float(Number(row.time) || 0);
        writer.float(math.clamp(Number(row.mix) || 0, 0, 1));
        writer.float(Math.max(0, Number(row.softness) || 0));
        writer.byte(row.bendPositive === false ? -1 : 1);
        writer.bool(!!row.compress);
        writer.bool(!!row.stretch);
        writer.bool(!!row.uniform);
        if (i < rows.length - 1) writeCurve(writer, row);
      }
    }
    const tfcTimelines = a.transform || {};
    const tfcEntries = Object.entries(tfcTimelines).filter(([, rows]) => Array.isArray(rows) && rows.length > 0);
    writer.varint(tfcEntries.length, true);
    for (const [tfcName, rows] of tfcEntries) {
      writer.refString(tfcName, sharedMap);
      writer.varint(rows.length, true);
      for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i] || {};
        writer.float(Number(row.time) || 0);
        writer.float(math.clamp(Number(row.rotateMix) || 0, 0, 1));
        writer.float(math.clamp(Number(row.translateMix) || 0, 0, 1));
        writer.float(math.clamp(Number(row.scaleMix) || 0, 0, 1));
        writer.float(math.clamp(Number(row.shearMix) || 0, 0, 1));
        if (i < rows.length - 1) writeCurve(writer, row);
      }
    }
    const pathTimelines = a.paths || {};
    const pathEntries = Object.entries(pathTimelines).filter(([, tl]) => tl && typeof tl === "object");
    writer.varint(pathEntries.length, true);
    for (const [pathName, tl] of pathEntries) {
      writer.refString(pathName, sharedMap);
      const timelines = [];
      if (Array.isArray(tl.position) && tl.position.length > 0) timelines.push({ type: 0, rows: tl.position });
      if (Array.isArray(tl.spacing) && tl.spacing.length > 0) timelines.push({ type: 1, rows: tl.spacing });
      if (Array.isArray(tl.mix) && tl.mix.length > 0) timelines.push({ type: 2, rows: tl.mix });
      writer.varint(timelines.length, true);
      for (const t of timelines) {
        writer.byte(t.type);
        writer.varint(t.rows.length, true);
        for (let i = 0; i < t.rows.length; i += 1) {
          const row = t.rows[i] || {};
          writer.float(Number(row.time) || 0);
          if (t.type === 2) {
            writer.float(math.clamp(Number(row.rotateMix) || 0, 0, 1));
            writer.float(math.clamp(Number(row.translateMix) || 0, 0, 1));
          } else {
            writer.float(Number(row.value) || 0);
          }
          if (i < t.rows.length - 1) writeCurve(writer, row);
        }
      }
    }
    const deform = a.deform || {};
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
          writer.varint(rows.length, true);
          for (let i = 0; i < rows.length; i += 1) {
            const row = rows[i] || {};
            writer.float(Number(row.time) || 0);
            const verts = Array.isArray(row.vertices) ? row.vertices : [];
            if (verts.length === 0) {
              writer.varint(0, true);
            } else {
              writer.varint(verts.length, true);
              const off = Math.max(0, Number(row.offset) || 0);
              if (off > 0) writer.varint(off + 1, true);
              for (let j = 0; j < verts.length; j += 1) writer.float(Number(verts[j]) || 0);
            }
            if (i < rows.length - 1) writeCurve(writer, row);
          }
        }
      }
    }
    writer.varint(0, true);
    writer.varint(0, true);
  }

  return writer.toUint8Array();
}

function packSlotsToAtlasPage(slotExportInfos, pageName, textureScale = 1) {
  const atlasSlots = slotExportInfos.filter(
    (it) => it && it.slot && it.slot.canvas && it.slot.canvas.width > 0 && it.slot.canvas.height > 0
  );
  if (atlasSlots.length === 0) throw new Error("No slot images to export.");

  const scale = math.clamp(Number(textureScale) || 1, 0.1, 1);
  const padding = 2;
  const maxW = 2048;
  let x = padding;
  let y = padding;
  let rowH = 0;
  let usedW = 0;
  let usedH = 0;
  const regions = [];
  for (const it of atlasSlots) {
    const w = Math.max(1, Math.round(it.slot.canvas.width * scale));
    const h = Math.max(1, Math.round(it.slot.canvas.height * scale));
    if (x + w + padding > maxW) {
      x = padding;
      y += rowH + padding;
      rowH = 0;
    }
    regions.push({ ...it, x, y, w, h });
    x += w + padding;
    rowH = Math.max(rowH, h);
    usedW = Math.max(usedW, x);
    usedH = Math.max(usedH, y + h + padding);
  }
  const pageW = Math.max(1, Math.ceil(usedW));
  const pageH = Math.max(1, Math.ceil(usedH));
  const canvas = document.createElement("canvas");
  canvas.width = pageW;
  canvas.height = pageH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas context unavailable for atlas export.");
  for (const r of regions) {
    ctx.drawImage(r.slot.canvas, 0, 0, r.slot.canvas.width, r.slot.canvas.height, r.x, r.y, r.w, r.h);
  }
  let atlas = `${pageName}\n`;
  atlas += `\tsize: ${pageW}, ${pageH}\n`;
  atlas += "\tformat: RGBA8888\n";
  atlas += "\tfilter: Linear, Linear\n";
  atlas += "\trepeat: none\n";
  for (const r of regions) {
    atlas += `${r.attachmentName}\n`;
    atlas += `\tbounds: ${r.x}, ${r.y}, ${r.w}, ${r.h}\n`;
  }
  return { canvas, atlas, scale };
}

function buildSpineJsonData() {
  if (!state.mesh) throw new Error("No mesh data. Import image/PSD first.");
  const bones = Array.isArray(state.mesh.rigBones) ? state.mesh.rigBones : [];
  if (bones.length === 0) throw new Error("No bones to export.");
  if (!Array.isArray(state.slots) || state.slots.length === 0) throw new Error("No slots to export.");

  const boneUsed = new Set();
  const slotUsed = new Set();
  const attachmentUsed = new Set();
  const animUsed = new Set();
  const boneNames = bones.map((b, i) => makeUniqueName(b && b.name ? b.name : `bone_${i}`, boneUsed, `bone_${i}`));
  const slotInfos = state.slots.map((s, i) => ({
    slot: s,
    index: i,
    name: makeUniqueName(s && s.name ? s.name : `slot_${i}`, slotUsed, `slot_${i}`),
  }));
  for (const si of slotInfos) {
    const baseAttName = si && si.slot && si.slot.attachmentName ? String(si.slot.attachmentName) : si.name;
    si.attachmentName = makeUniqueName(baseAttName, attachmentUsed, si.name);
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
    if (typeof b.inherit === "string" && b.inherit && b.inherit !== "normal") bone.inherit = b.inherit;
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
  let skippedPathForExport = 0;
  const skinDefault = {};
  const slotNameByIndex = new Map();
  const transformNameByIndex = new Map();
  const pathNameByIndex = new Map();
  const slotInfoByName = new Map();
  const m = state.mesh;
  syncBindPose(m);
  const setupWorld = computeWorld(m.rigBones);
  const setupInvBind = setupWorld.map(invert);
  const hasVertexTrackByAnim = new Map();

  function round4(v) {
    return Number((Number(v) || 0).toFixed(4));
  }

  function getBoundaryHullCount(cols, rows) {
    const c = Math.max(1, Number(cols) || 1);
    const r = Math.max(1, Number(rows) || 1);
    return 2 * (c + r);
  }

  function canUseMeshAttachment(slot, sm, boneCount) {
    if (!slot || !sm) return false;
    const mode = getSlotWeightMode(slot);
    if (mode === "weighted") return true;
    if (mode === "single" && boneCount > 0 && sm.weights && sm.weights.length === (sm.positions.length / 2) * boneCount) {
      return true;
    }
    return false;
  }

  function buildMeshAttachment(slot, si, boneCount, boneIndexOffset = 0) {
    ensureSlotMeshData(slot, m);
    const sm = slot.meshData;
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
      width: round4(slot.canvas?.width || (slot.rect?.w || 0)),
      height: round4(slot.canvas?.height || (slot.rect?.h || 0)),
    };
    slotInfoByName.set(si.name, { slot, si, sm, meshAttachment: att });
    return att;
  }

  for (const si of slotInfos) {
    const s = si.slot;
    const bIdx = Number.isFinite(s.bone) && s.bone >= 0 && s.bone < bones.length ? s.bone : 0;
    const b = bones[bIdx] || bones[0];
    const rect = s.rect || { x: 0, y: 0, w: s.canvas.width, h: s.canvas.height };
    const slotOut = {
      name: si.name,
      bone: boneNames[bIdx] || boneNames[0],
    };
    if (s.visible !== false) {
      slotOut.attachment = si.attachmentName;
    }
    const color = toSpineColor(
      Number.isFinite(s.r) ? s.r : 1,
      Number.isFinite(s.g) ? s.g : 1,
      Number.isFinite(s.b) ? s.b : 1,
      Number.isFinite(s.alpha) ? s.alpha : 1,
      s.visible !== false
    );
    if (color !== "ffffffff") slotOut.color = color;
    outSlots.push(slotOut);
    slotNameByIndex.set(si.index, si.name);

    ensureSlotMeshData(s, m);
    const sm = s.meshData;
    const useMesh = canUseMeshAttachment(s, sm, m.rigBones.length);
    let att = null;
    if (useMesh) {
      att = buildMeshAttachment(s, si, m.rigBones.length, 1);
    }
    if (!att) {
      const width = s.canvas && s.canvas.width > 0 ? s.canvas.width : Math.max(1, rect.w || 1);
      const height = s.canvas && s.canvas.height > 0 ? s.canvas.height : Math.max(1, rect.h || 1);
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
    if (!skinDefault[si.name]) skinDefault[si.name] = {};
    skinDefault[si.name][si.attachmentName] = att;
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
      const item = {
        name: c.name || `ik_${i}`,
        order: Math.max(0, Number(c.order) || i),
        bones: chain.map((bi) => boneNames[bi]),
        target: boneNames[targetIdx],
        mix: round4(math.clamp(Number(c.mix) || 0, 0, 1)),
        bendPositive: c.bendPositive !== false,
      };
      const softness = Math.max(0, Number(c.softness) || 0);
      if (softness > 1e-6) item.softness = round4(softness);
      if (c.compress) item.compress = true;
      if (c.stretch) item.stretch = true;
      if (c.uniform) item.uniform = true;
      if (c.skinRequired) item.skin = true;
      outIk.push(item);
    }
    outIk.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
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
      const name = c.name || `transform_${i}`;
      transformNameByIndex.set(i, name);
      outTransform.push({
        name,
        order: Math.max(0, Number(c.order) || i),
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
    outTransform.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
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
      if (c.sourceType === "bone_chain") {
        // Runtime helper mode (non-Spine native). Skip in Spine export.
        skippedPathForExport += 1;
        continue;
      }
      const targetSlotIndex = Number(c.targetSlot);
      if (!Number.isFinite(targetSlotIndex) || targetSlotIndex < 0 || targetSlotIndex >= slotInfos.length) {
        skippedPathForExport += 1;
        continue;
      }
      const targetSlotName = slotNameByIndex.get(targetSlotIndex);
      if (!targetSlotName) {
        skippedPathForExport += 1;
        continue;
      }
      const name = c.name || `path_${i}`;
      pathNameByIndex.set(i, name);
      outPath.push({
        name,
        order: Math.max(0, Number(c.order) || i),
        skin: false,
        bones: chain.map((bi) => boneNames[bi]),
        target: targetSlotName,
        positionMode: "fixed",
        spacingMode: "length",
        rotateMode: "tangent",
        rotation: 0,
        position: round4(Number(c.position) || 0),
        spacing: round4(Number(c.spacing) || 0),
        rotateMix: round4(math.clamp(Number(c.rotateMix) || 0, 0, 1)),
        translateMix: round4(math.clamp(Number(c.translateMix) || 0, 0, 1)),
      });
    }
    outPath.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
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
    const drawOrderRows = [];
    for (const [trackId, keys] of Object.entries(tracks)) {
      const parsed = parseTrackId(trackId);
      if (parsed && parsed.type === "vertex" && Array.isArray(keys) && keys.length > 0) {
        hasVertexTrack = true;
        for (const k of keys) {
          const si = Number.isFinite(k.slotIndex) ? Number(k.slotIndex) : -1;
          if (si < 0 || si >= slotInfos.length) continue;
          if (!vertexRowsBySlot.has(si)) vertexRowsBySlot.set(si, []);
          vertexRowsBySlot.get(si).push(k);
        }
      }
      if (parsed && parsed.type === "ik" && Array.isArray(keys) && keys.length > 0) {
        const ikIdx = parsed.ikIndex;
        if (!Number.isFinite(ikIdx) || ikIdx < 0 || ikIdx >= m.ikConstraints.length) continue;
        const ikc = m.ikConstraints[ikIdx];
        if (!ikc || ikc.enabled === false || !ikc.name) continue;
        if (!ikRowsByConstraint.has(ikc.name)) ikRowsByConstraint.set(ikc.name, { mix: [], bend: [], target: [] });
        const bucket = ikRowsByConstraint.get(ikc.name);
        const rows = keys
          .map((k) => ({
            time: Number((Number(k.time) || 0).toFixed(4)),
            value:
              parsed.prop === "mix"
                ? math.clamp(Number(k.value) || 0, 0, 1)
                : parsed.prop === "bend"
                  ? k.value === true || Number(k.value) >= 0
                  : k && k.value && typeof k.value === "object"
                    ? { x: Number(k.value.x) || 0, y: Number(k.value.y) || 0 }
                    : null,
            interp: k.interp === "stepped" ? "stepped" : "linear",
          }))
          .filter((r) => r.value != null)
          .sort((a, b) => a.time - b.time);
        if (parsed.prop === "mix") bucket.mix.push(...rows);
        else if (parsed.prop === "bend") bucket.bend.push(...rows);
        else if (parsed.prop === "target") bucket.target.push(...rows);
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
            interp: k.interp === "stepped" ? "stepped" : "linear",
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
            interp: k.interp === "stepped" ? "stepped" : "linear",
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
            };
            if (k.interp === "stepped") row.curve = "stepped";
            return row;
          })
          .sort((aa, bb) => aa.time - bb.time);
        slotColorRowsBySlot.get(si).push(...rows);
      }
      if (parsed && parsed.type === "slot" && parsed.prop === "attachment" && Array.isArray(keys) && keys.length > 0) {
        const si = parsed.slotIndex;
        if (!Number.isFinite(si) || si < 0 || si >= slotInfos.length) continue;
        if (!slotAttachmentRowsBySlot.has(si)) slotAttachmentRowsBySlot.set(si, []);
        const setupAttachment = slotInfos[si] && slotInfos[si].attachmentName ? slotInfos[si].attachmentName : null;
        const rows = keys
          .map((k) => {
            const visible = k.value !== false;
            return {
              time: Number((Number(k.time) || 0).toFixed(4)),
              name: visible ? setupAttachment : null,
            };
          })
          .sort((aa, bb) => aa.time - bb.time);
        slotAttachmentRowsBySlot.get(si).push(...rows);
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
          if (k.interp === "stepped") row.curve = "stepped";
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
          if (k.interp === "stepped") row.curve = "stepped";
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
          if (k.interp === "stepped") row.curve = "stepped";
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
          if (k.interp === "stepped") row.curve = "stepped";
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
          if (k.interp === "stepped") row.curve = "stepped";
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
    if (slotColorRowsBySlot.size > 0 || slotAttachmentRowsBySlot.size > 0) {
      const slotsOut = {};
      for (const [si, rows] of slotColorRowsBySlot.entries()) {
        const slotName = slotNameByIndex.get(si);
        if (!slotName) continue;
        const sorted = [...rows].sort((aa, bb) => (Number(aa.time) || 0) - (Number(bb.time) || 0));
        if (sorted.length > 0) {
          const byTime = new Map();
          for (const r of sorted) byTime.set(`${r.time}`, r);
          slotsOut[slotName] = { color: [...byTime.values()] };
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
        const setupBend = ikSetup ? ikSetup.bendPositive !== false : true;
        const byTime = new Map();
        for (const r of data.mix || []) {
          const row = byTime.get(r.time) || { time: r.time };
          row.mix = Number((Number(r.value) || 0).toFixed(4));
          if (r.interp === "stepped") row.curve = "stepped";
          byTime.set(r.time, row);
        }
        for (const r of data.bend || []) {
          const row = byTime.get(r.time) || { time: r.time };
          row.bendPositive = r.value === true;
          if (r.interp === "stepped") row.curve = "stepped";
          byTime.set(r.time, row);
        }
        for (const r of data.target || []) {
          const row = byTime.get(r.time) || { time: r.time };
          row.targetX = Number((Number(r.value && r.value.x) || 0).toFixed(4));
          row.targetY = Number((Number(r.value && r.value.y) || 0).toFixed(4));
          if (r.interp === "stepped") row.curve = "stepped";
          byTime.set(r.time, row);
        }
        const merged = [...byTime.values()]
          .sort((a, b) => a.time - b.time)
          .map((r) => {
            const out = { time: Number((Number(r.time) || 0).toFixed(4)) };
            if (r.mix != null) out.mix = Number((Number(r.mix) || 0).toFixed(4));
            if (r.bendPositive != null) out.bendPositive = !!r.bendPositive;
            if (r.targetX != null) out.targetX = Number((Number(r.targetX) || 0).toFixed(4));
            if (r.targetY != null) out.targetY = Number((Number(r.targetY) || 0).toFixed(4));
            if (r.curve === "stepped") out.curve = "stepped";
            return out;
          });
        const pruned = pruneTimeline(
          merged,
          (r, eps) =>
            Math.abs((r.mix != null ? Number(r.mix) : setupMix) - setupMix) <= eps &&
            ((r.bendPositive != null ? !!r.bendPositive : setupBend) === setupBend) &&
            Math.abs((r.targetX != null ? Number(r.targetX) : Number(ikSetup && ikSetup.targetX) || 0) - (Number(ikSetup && ikSetup.targetX) || 0)) <= eps &&
            Math.abs((r.targetY != null ? Number(r.targetY) : Number(ikSetup && ikSetup.targetY) || 0) - (Number(ikSetup && ikSetup.targetY) || 0)) <= eps
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
          byTime.set(r.time, row);
        }
        for (const r of data.translateMix || []) {
          const row = byTime.get(r.time) || { time: Number((Number(r.time) || 0).toFixed(4)) };
          row.translateMix = Number((Number(r.value) || 0).toFixed(4));
          if (r.interp === "stepped") row.curve = "stepped";
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
        const sm = s && s.meshData ? s.meshData : null;
        if (!sm) continue;
        const attName = si.attachmentName;
        const isMesh = !!(skinDefault[slotName] && skinDefault[slotName][attName] && skinDefault[slotName][attName].type === "mesh");
        if (!isMesh) continue;
        const expectedLen = sm.positions.length;
        const sorted = [...list].sort((a, b) => (Number(a.time) || 0) - (Number(b.time) || 0));
        const rows = [];
        for (const key of sorted) {
          const arr = Array.isArray(key.value) ? key.value : null;
          if (!arr || arr.length !== expectedLen) continue;
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
          const row = { time: round4(Number(key.time) || 0) };
          if (first >= 0 && last >= first) {
            if (first > 0) row.offset = first;
            row.vertices = delta.slice(first, last + 1);
          }
          if (key.interp === "stepped") row.curve = "stepped";
          rows.push(row);
        }
        if (rows.length > 0) {
          if (!deformDefaultSkin[slotName]) deformDefaultSkin[slotName] = {};
          deformDefaultSkin[slotName][attName] = rows;
        }
      }
      if (Object.keys(deformDefaultSkin).length > 0) {
        animOut.deform = { default: deformDefaultSkin };
      }
    }

    if (Object.keys(animOut).length > 0) animations[animName] = animOut;
    if (vertexRowsBySlot.size > 0) hasVertexTrackByAnim.set(animName, true);
  }

  return {
    json: {
      skeleton: {
        hash: "",
        spine: "4.1.24",
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
      events: Object.keys(eventDefs).length > 0 ? eventDefs : undefined,
      skins: [{ name: "default", attachments: skinDefault }],
      animations,
    },
    slotExportInfos: slotInfos,
    hasVertexTrack,
    hasWeightedSlot,
    hasVertexTrackByAnim,
    skippedPathForExport,
  };
}

async function exportSpineData() {
  const asked = window.prompt("Export base name", "spine_export");
  if (asked == null) return;
  const baseName = sanitizeExportName(asked, "spine_export");
  const scaleAsked = window.prompt("Atlas texture scale (0.1~1.0, default 0.75)", "0.75");
  if (scaleAsked == null) return;
  const textureScale = math.clamp(Number(scaleAsked) || 0.75, 0.1, 1);
  const pageName = `${baseName}.png`;
  const { json, slotExportInfos, hasVertexTrack, hasWeightedSlot, skippedPathForExport } = buildSpineJsonData();
  const { canvas, atlas, scale } = packSlotsToAtlasPage(slotExportInfos, pageName, textureScale);
  const pngBlob = await canvasToBlob(canvas, "image/png");
  const skelBytes = exportSpineSkelBinary(json);
  const jsonBlob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
  const atlasBlob = new Blob([atlas], { type: "text/plain;charset=utf-8" });
  const skelBlob = new Blob([skelBytes], { type: "application/octet-stream" });
  downloadBlobFile(jsonBlob, `${baseName}.json`);
  downloadBlobFile(atlasBlob, `${baseName}.atlas`);
  downloadBlobFile(pngBlob, pageName);
  downloadBlobFile(skelBlob, `${baseName}.skel`);
  if (hasVertexTrack) {
    setStatus(
      `Exported ${baseName}.json/.atlas/.png/.skel (atlas scale ${scale.toFixed(
        2
      )}; mesh/deform exported in JSON and SKEL (experimental compatibility).`
    );
  } else if (hasWeightedSlot) {
    setStatus(
      `Exported ${baseName}.json/.atlas/.png/.skel (atlas scale ${scale.toFixed(
        2
      )}; weighted slot needs mesh export for multi-bone motion).`
    );
  } else {
    setStatus(`Exported ${baseName}.json/.atlas/.png/.skel (atlas scale ${scale.toFixed(2)}).`);
  }
  if ((Number(skippedPathForExport) || 0) > 0) {
    setStatus(
      `Export note: ${Number(skippedPathForExport)} path constraint(s) not written to Spine export (non-slot path source or invalid target).`
    );
  }
}

if (els.fileSaveBtn) {
  els.fileSaveBtn.addEventListener("click", () => {
    const payload = buildProjectPayload();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "mesh_deformer_project.json";
    a.click();
    URL.revokeObjectURL(a.href);
    setStatus(`Project saved (JSON, ${payload.slotImages.length} embedded image(s)).`);
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

if (els.projectLoadInput) {
  els.projectLoadInput.addEventListener("change", async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (Number.isFinite(Number(data.gridX))) els.gridX.value = String(math.clamp(Number(data.gridX), 2, 120));
      if (Number.isFinite(Number(data.gridY))) els.gridY.value = String(math.clamp(Number(data.gridY), 2, 120));
      const hasEmbeddedImages = Array.isArray(data.slotImages) && data.slotImages.length > 0;
      if (hasEmbeddedImages) {
        const decoded = [];
        for (const src of data.slotImages) {
          if (typeof src !== "string" || src.length === 0) continue;
          decoded.push(await canvasFromDataUrl(src));
        }
        if (decoded.length === 0) throw new Error("Project has slotImages but none could be decoded.");
        state.mesh = null;
        state.slots = [];
        state.activeSlot = -1;
        state.sourceCanvas = null;
        state.imageWidth = Number(data.imageWidth) || decoded[0].width;
        state.imageHeight = Number(data.imageHeight) || decoded[0].height;
        const srcSlots = Array.isArray(data.slots) ? data.slots : [];
        if (srcSlots.length === 0) {
          addSlotEntry(
            {
              name: "base",
              canvas: decoded[0],
              docWidth: state.imageWidth,
              docHeight: state.imageHeight,
              rect: { x: 0, y: 0, w: decoded[0].width, h: decoded[0].height },
            },
            false
          );
        } else {
          for (const src of srcSlots) {
            const imgIdx = Number(src && src.imageIndex);
            const c = Number.isFinite(imgIdx) && imgIdx >= 0 && imgIdx < decoded.length ? decoded[imgIdx] : decoded[0];
            addSlotEntry(
              {
                name: src && src.name ? src.name : undefined,
                id: src && src.id ? String(src.id) : undefined,
                attachmentName: src && src.attachmentName ? String(src.attachmentName) : undefined,
                canvas: c,
                bone: Number(src && src.bone),
                visible: src ? src.visible !== false : true,
                alpha: src ? Number(src.alpha) : 1,
                r: src ? Number(src.r) : 1,
                g: src ? Number(src.g) : 1,
                b: src ? Number(src.b) : 1,
                tx: src ? Number(src.tx) : 0,
                ty: src ? Number(src.ty) : 0,
                rot: src ? Number(src.rot) : 0,
                useWeights: !!(src && src.useWeights),
                weightBindMode: src && src.weightBindMode ? src.weightBindMode : "none",
                weightMode: src && src.weightMode ? src.weightMode : "free",
                influenceBones: Array.isArray(src && src.influenceBones) ? src.influenceBones : [],
                rect:
                  src && src.rect && Number.isFinite(src.rect.w) && Number.isFinite(src.rect.h)
                    ? {
                        x: Number(src.rect.x) || 0,
                        y: Number(src.rect.y) || 0,
                        w: Math.max(1, Number(src.rect.w) || 1),
                        h: Math.max(1, Number(src.rect.h) || 1),
                      }
                    : { x: 0, y: 0, w: c.width, h: c.height },
                docWidth: Number(src && src.docWidth) || state.imageWidth,
                docHeight: Number(src && src.docHeight) || state.imageHeight,
              },
              false
            );
          }
        }
        const targetSlot = Number.isFinite(Number(data.activeSlot))
          ? math.clamp(Number(data.activeSlot), 0, Math.max(0, state.slots.length - 1))
          : 0;
        setActiveSlot(targetSlot);
      } else if (!state.sourceCanvas && state.slots.length === 0) {
        setStatus("No embedded images in file. Import image/PSD first, then load this legacy project json.");
        return;
      }

      rebuildMesh();
      if (state.mesh && Array.isArray(data.rigBones)) {
        state.mesh.rigBones = data.rigBones;
        syncPoseFromRig(state.mesh);
        syncBindPose(state.mesh);
        refreshWeightsForBoneCount();
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
          order: Math.max(0, Number(c && c.order) || i),
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
          order: Math.max(0, Number(c && c.order) || i),
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
          sourceType: c && c.sourceType === "bone_chain" ? "bone_chain" : "slot",
          targetSlot: Number(c && c.targetSlot),
          position: Number(c && c.position) || 0,
          spacing: Number(c && c.spacing) || 0,
          rotateMix: math.clamp(Number(c && c.rotateMix) || 0, 0, 1),
          translateMix: math.clamp(Number(c && c.translateMix) || 0, 0, 1),
          closed: !!(c && c.closed),
          order: Math.max(0, Number(c && c.order) || i),
          enabled: c ? c.enabled !== false : true,
        }));
        ensurePathConstraints(state.mesh);
      }
      if (Array.isArray(data.animations) && data.animations.length > 0) {
        state.anim.animations = data.animations;
        state.anim.currentAnimId = data.animations[0].id;
      }
      if (Array.isArray(data.slots) && state.slots.length > 0) {
        for (let i = 0; i < state.slots.length && i < data.slots.length; i += 1) {
          const src = data.slots[i] || {};
          const dst = state.slots[i];
          dst.name = src.name || dst.name;
          dst.id = src.id ? String(src.id) : dst.id || makeSlotId();
          dst.attachmentName = src.attachmentName ? String(src.attachmentName) : dst.attachmentName || "main";
          dst.bone = Number.isFinite(src.bone) ? src.bone : dst.bone;
          dst.visible = src.visible !== false;
          dst.alpha = Number.isFinite(src.alpha) ? math.clamp(src.alpha, 0, 1) : 1;
          dst.r = Number.isFinite(src.r) ? math.clamp(src.r, 0, 1) : 1;
          dst.g = Number.isFinite(src.g) ? math.clamp(src.g, 0, 1) : 1;
          dst.b = Number.isFinite(src.b) ? math.clamp(src.b, 0, 1) : 1;
          dst.tx = Number.isFinite(src.tx) ? src.tx : 0;
          dst.ty = Number.isFinite(src.ty) ? src.ty : 0;
          dst.rot = Number.isFinite(src.rot) ? src.rot : 0;
          dst.useWeights = src.useWeights === true;
          dst.weightBindMode = src.weightBindMode || (dst.useWeights ? "single" : "none");
          dst.weightMode =
            src.weightMode ||
            (dst.weightBindMode === "auto" ? "weighted" : dst.useWeights ? "single" : "free");
          dst.influenceBones = Array.isArray(src.influenceBones)
            ? src.influenceBones.filter((v) => Number.isFinite(v))
            : [];
          if (src.rect && Number.isFinite(src.rect.w) && Number.isFinite(src.rect.h)) {
            dst.rect = {
              x: Number(src.rect.x) || 0,
              y: Number(src.rect.y) || 0,
              w: Math.max(1, Number(src.rect.w) || 1),
              h: Math.max(1, Number(src.rect.h) || 1),
            };
          }
          if (src.meshContour && Array.isArray(src.meshContour.points)) {
            dst.meshContour = {
              points: src.meshContour.points.map((p) => ({ x: Number(p.x) || 0, y: Number(p.y) || 0 })),
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
          } else {
            ensureSlotContour(dst);
          }
          dst.docWidth = Number.isFinite(src.docWidth) ? src.docWidth : state.imageWidth;
          dst.docHeight = Number.isFinite(src.docHeight) ? src.docHeight : state.imageHeight;
        }
        if (Number.isFinite(data.activeSlot)) {
          state.activeSlot = math.clamp(Number(data.activeSlot), 0, state.slots.length - 1);
        }
      }
      state.slotViewMode = data.slotViewMode === "all" ? "all" : "single";
      ensureSlotsHaveBoneBinding();
      rebuildSlotTriangleIndices();
      state.selectedBone = state.mesh && state.mesh.rigBones.length > 0 ? 0 : -1;
      refreshAnimationUI();
      refreshSlotUI();
      updateBoneUI();
      setStatus(`Project loaded${hasEmbeddedImages ? " (with embedded images)" : ""}.`);
    } catch (err) {
      setStatus(`Project load failed: ${err.message}`);
    } finally {
      e.target.value = "";
    }
  });
}

els.remeshBtn.addEventListener("click", rebuildMesh);
els.editMode.addEventListener("change", () => {
  const v = els.editMode.value;
  state.editMode = v === "vertex" ? "vertex" : v === "slotmesh" ? "slotmesh" : "skeleton";
  state.workspaceMode = state.editMode === "slotmesh" ? "slotmesh" : "rig";
  updateWorkspaceUI();
});
els.boneMode.addEventListener("change", () => {
  if (!state.mesh) return;
  state.boneMode = els.boneMode.value;
  if (state.boneMode !== "edit") {
    state.addBoneArmed = false;
    state.addBoneDraft = null;
    els.addBoneBtn.textContent = "Add Bone";
  }
  if (state.boneMode === "pose") {
    syncPoseFromRig(state.mesh);
    samplePoseAtTime(state.mesh, state.anim.time);
  }
  updateWorkspaceUI();
  updateBoneUI();
});

els.boneSelect.addEventListener("change", () => {
  if (!state.mesh) return;
  const v = Number(els.boneSelect.value);
  state.selectedBone = Number.isFinite(v) ? v : -1;
  state.selectedBonesForWeight = state.selectedBone >= 0 ? [state.selectedBone] : [];
  updateBoneUI();
});

els.addBoneBtn.addEventListener("click", () => {
  if (!state.mesh || state.boneMode !== "edit") return;
  state.addBoneArmed = !state.addBoneArmed;
  state.addBoneDraft = null;
  els.addBoneBtn.textContent = state.addBoneArmed ? "Cancel Add" : "Add Bone";
  setStatus(state.addBoneArmed ? "Add bone armed: drag in canvas to create." : "Add bone canceled.");
});
els.deleteBoneBtn.addEventListener("click", deleteBone);
els.autoWeightBtn.addEventListener("click", () => {
  if (!state.mesh) return;
  if (state.boneMode !== "edit") return;
  if (autoWeightActiveSlot()) {
    const picked = getSelectedBonesForWeight(state.mesh);
    setStatus(
      `Auto weights updated (${state.weightMode}) on ${state.slots.length > 0 ? "active slot" : "mesh"}; bones: ${
        picked.length > 0 ? picked.join(", ") : "(slot default)"
      }.`
    );
  }
});
els.weightMode.addEventListener("change", () => {
  state.weightMode = els.weightMode.value;
});
els.resetPoseBtn.addEventListener("click", resetPose);
els.resetVertexBtn.addEventListener("click", resetVertexOffsets);
if (els.ikAdd1Btn) {
  els.ikAdd1Btn.addEventListener("click", () => {
    if (!addIKConstraint(false)) {
      setStatus("Add IK 1-Bone failed. Need at least one bone.");
      return;
    }
    const c = getActiveIKConstraint();
    const m = state.mesh;
    if (c && m) {
      const a = Number(c.bones && c.bones[0]);
      const t = Number(c.target);
      setStatus(`IK 1-Bone added: ${m.rigBones[a]?.name || a} -> target ${m.rigBones[t]?.name || t}.`);
    } else {
      setStatus("IK 1-Bone added.");
    }
  });
}
if (els.ikAdd2Btn) {
  els.ikAdd2Btn.addEventListener("click", () => {
    if (!addIKConstraint(true)) {
      setStatus("Add IK 2-Bone failed. Select a bone in a valid parent-child chain.");
      return;
    }
    const c = getActiveIKConstraint();
    const m = state.mesh;
    if (c && m && Array.isArray(c.bones) && c.bones.length >= 2) {
      const a = Number(c.bones[0]);
      const b = Number(c.bones[1]);
      const t = Number(c.target);
      setStatus(
        `IK 2-Bone added: ${m.rigBones[a]?.name || a} -> ${m.rigBones[b]?.name || b}, target ${m.rigBones[t]?.name || t}.`
      );
    } else {
      setStatus("IK 2-Bone added.");
    }
  });
}
if (els.ikMoveUpBtn) {
  els.ikMoveUpBtn.addEventListener("click", () => {
    const m = state.mesh;
    if (!m) return;
    const list = ensureIKConstraints(m);
    const i = state.selectedIK;
    if (i <= 0 || i >= list.length) return;
    const t = list[i - 1];
    list[i - 1] = list[i];
    list[i] = t;
    state.selectedIK = i - 1;
    refreshIKUI();
    setStatus("IK moved up.");
  });
}
if (els.ikMoveDownBtn) {
  els.ikMoveDownBtn.addEventListener("click", () => {
    const m = state.mesh;
    if (!m) return;
    const list = ensureIKConstraints(m);
    const i = state.selectedIK;
    if (i < 0 || i >= list.length - 1) return;
    const t = list[i + 1];
    list[i + 1] = list[i];
    list[i] = t;
    state.selectedIK = i + 1;
    refreshIKUI();
    setStatus("IK moved down.");
  });
}
if (els.ikRemoveBtn) {
  els.ikRemoveBtn.addEventListener("click", () => {
    if (!removeSelectedIKConstraint()) {
      setStatus("No IK constraint selected.");
      return;
    }
    setStatus("IK removed.");
  });
}
if (els.ikList) {
  els.ikList.addEventListener("click", (ev) => {
    const row = ev.target.closest("[data-ik-index]");
    if (!row) return;
    const idx = Number(row.dataset.ikIndex);
    if (!Number.isFinite(idx)) return;
    state.selectedIK = idx;
    refreshIKUI();
    selectActiveIKEndBone(true);
  });
}
if (els.ikSelect) {
  els.ikSelect.addEventListener("change", () => {
    state.selectedIK = Number(els.ikSelect.value);
    refreshIKUI();
    selectActiveIKEndBone(true);
  });
}
if (els.ikName) {
  els.ikName.addEventListener("input", () => {
    const c = getActiveIKConstraint();
    if (!c) return;
    c.name = els.ikName.value.trim() || `ik_${state.selectedIK}`;
    refreshIKUI();
    refreshTrackSelect();
    renderTimelineTracks();
  });
}
if (els.ikPickTargetBtn) {
  els.ikPickTargetBtn.addEventListener("click", () => {
    const c = getActiveIKConstraint();
    if (!c) return;
    state.ikPickArmed = !state.ikPickArmed;
    state.ikHoverBone = -1;
    refreshIKUI();
    renderBoneTree();
    setStatus(state.ikPickArmed ? "IK target pick armed: click a bone in canvas." : "IK target pick canceled.");
  });
}
if (els.ikEnabled) els.ikEnabled.addEventListener("change", applyActiveIKFromUI);
if (els.ikTargetBone) els.ikTargetBone.addEventListener("change", applyActiveIKFromUI);
if (els.ikBoneA) els.ikBoneA.addEventListener("change", applyActiveIKFromUI);
if (els.ikBoneB) els.ikBoneB.addEventListener("change", applyActiveIKFromUI);
if (els.ikEndMode) els.ikEndMode.addEventListener("change", applyActiveIKFromUI);
if (els.ikMix) els.ikMix.addEventListener("input", applyActiveIKFromUI);
if (els.ikBendDir) els.ikBendDir.addEventListener("change", applyActiveIKFromUI);
if (els.tfcAddBtn) {
  els.tfcAddBtn.addEventListener("click", () => {
    if (!addTransformConstraint()) {
      setStatus("Add Transform failed. Need at least 2 bones.");
      return;
    }
    setStatus("Transform constraint added.");
  });
}
if (els.tfcRemoveBtn) {
  els.tfcRemoveBtn.addEventListener("click", () => {
    if (!removeSelectedTransformConstraint()) {
      setStatus("No Transform constraint selected.");
      return;
    }
    setStatus("Transform constraint removed.");
  });
}
if (els.tfcMoveUpBtn) {
  els.tfcMoveUpBtn.addEventListener("click", () => {
    const m = state.mesh;
    if (!m) return;
    const list = ensureTransformConstraints(m);
    const i = state.selectedTransform;
    if (i <= 0 || i >= list.length) return;
    const t = list[i - 1];
    list[i - 1] = list[i];
    list[i] = t;
    state.selectedTransform = i - 1;
    refreshTransformUI();
    refreshTrackSelect();
    renderTimelineTracks();
    setStatus("Transform moved up.");
  });
}
if (els.tfcMoveDownBtn) {
  els.tfcMoveDownBtn.addEventListener("click", () => {
    const m = state.mesh;
    if (!m) return;
    const list = ensureTransformConstraints(m);
    const i = state.selectedTransform;
    if (i < 0 || i >= list.length - 1) return;
    const t = list[i + 1];
    list[i + 1] = list[i];
    list[i] = t;
    state.selectedTransform = i + 1;
    refreshTransformUI();
    refreshTrackSelect();
    renderTimelineTracks();
    setStatus("Transform moved down.");
  });
}
if (els.tfcList) {
  els.tfcList.addEventListener("click", (ev) => {
    const row = ev.target.closest("[data-tfc-index]");
    if (!row) return;
    const idx = Number(row.dataset.tfcIndex);
    if (!Number.isFinite(idx)) return;
    state.selectedTransform = idx;
    refreshTransformUI();
  });
}
if (els.tfcSelect) {
  els.tfcSelect.addEventListener("change", () => {
    state.selectedTransform = Number(els.tfcSelect.value);
    refreshTransformUI();
  });
}
if (els.tfcName) {
  els.tfcName.addEventListener("input", () => {
    const c = getActiveTransformConstraint();
    if (!c) return;
    c.name = els.tfcName.value.trim() || `transform_${state.selectedTransform}`;
    refreshTransformUI();
    refreshTrackSelect();
    renderTimelineTracks();
  });
}
if (els.tfcEnabled) els.tfcEnabled.addEventListener("change", () => applyActiveTransformFromUI(false));
if (els.tfcTargetBone) els.tfcTargetBone.addEventListener("change", () => applyActiveTransformFromUI(false));
if (els.tfcBones) els.tfcBones.addEventListener("change", () => applyActiveTransformFromUI(true));
if (els.tfcLocal) els.tfcLocal.addEventListener("change", () => applyActiveTransformFromUI(false));
if (els.tfcRelative) els.tfcRelative.addEventListener("change", () => applyActiveTransformFromUI(false));
if (els.tfcRotateMix) els.tfcRotateMix.addEventListener("input", () => applyActiveTransformFromUI(false));
if (els.tfcTranslateMix) els.tfcTranslateMix.addEventListener("input", () => applyActiveTransformFromUI(false));
if (els.tfcScaleMix) els.tfcScaleMix.addEventListener("input", () => applyActiveTransformFromUI(false));
if (els.tfcShearMix) els.tfcShearMix.addEventListener("input", () => applyActiveTransformFromUI(false));
if (els.tfcOffsetX) els.tfcOffsetX.addEventListener("input", () => applyActiveTransformFromUI(false));
if (els.tfcOffsetY) els.tfcOffsetY.addEventListener("input", () => applyActiveTransformFromUI(false));
if (els.tfcOffsetRot) els.tfcOffsetRot.addEventListener("input", () => applyActiveTransformFromUI(false));
if (els.tfcOffsetScaleX) els.tfcOffsetScaleX.addEventListener("input", () => applyActiveTransformFromUI(false));
if (els.tfcOffsetScaleY) els.tfcOffsetScaleY.addEventListener("input", () => applyActiveTransformFromUI(false));
if (els.tfcOffsetShearY) els.tfcOffsetShearY.addEventListener("input", () => applyActiveTransformFromUI(false));
if (els.tfcBoneSearch) {
  els.tfcBoneSearch.addEventListener("input", () => {
    refreshTransformUI();
  });
}
if (els.tfcBonesAllBtn) {
  els.tfcBonesAllBtn.addEventListener("click", () => {
    if (!els.tfcBones) return;
    for (const opt of els.tfcBones.options) opt.selected = true;
    applyActiveTransformFromUI(true);
  });
}
if (els.tfcBonesClearBtn) {
  els.tfcBonesClearBtn.addEventListener("click", () => {
    if (!els.tfcBones) return;
    for (const opt of els.tfcBones.options) opt.selected = false;
    applyActiveTransformFromUI(true);
  });
}
if (els.tfcBonesInvertBtn) {
  els.tfcBonesInvertBtn.addEventListener("click", () => {
    if (!els.tfcBones) return;
    for (const opt of els.tfcBones.options) opt.selected = !opt.selected;
    applyActiveTransformFromUI(true);
  });
}
if (els.pathAddBtn) {
  els.pathAddBtn.addEventListener("click", () => {
    if (!addPathConstraint()) {
      setStatus("Add Path failed. Need at least 2 bones.");
      return;
    }
    refreshTrackSelect();
    renderTimelineTracks();
    setStatus("Path constraint added.");
  });
}
if (els.pathRemoveBtn) {
  els.pathRemoveBtn.addEventListener("click", () => {
    if (!removeSelectedPathConstraint()) {
      setStatus("No Path constraint selected.");
      return;
    }
    refreshTrackSelect();
    renderTimelineTracks();
    setStatus("Path constraint removed.");
  });
}
if (els.pathMoveUpBtn) {
  els.pathMoveUpBtn.addEventListener("click", () => {
    const m = state.mesh;
    if (!m) return;
    const list = ensurePathConstraints(m);
    const i = state.selectedPath;
    if (i <= 0 || i >= list.length) return;
    const t = list[i - 1];
    list[i - 1] = list[i];
    list[i] = t;
    state.selectedPath = i - 1;
    refreshPathUI();
    refreshTrackSelect();
    renderTimelineTracks();
    setStatus("Path moved up.");
  });
}
if (els.pathMoveDownBtn) {
  els.pathMoveDownBtn.addEventListener("click", () => {
    const m = state.mesh;
    if (!m) return;
    const list = ensurePathConstraints(m);
    const i = state.selectedPath;
    if (i < 0 || i >= list.length - 1) return;
    const t = list[i + 1];
    list[i + 1] = list[i];
    list[i] = t;
    state.selectedPath = i + 1;
    refreshPathUI();
    refreshTrackSelect();
    renderTimelineTracks();
    setStatus("Path moved down.");
  });
}
if (els.pathList) {
  els.pathList.addEventListener("click", (ev) => {
    const row = ev.target.closest("[data-path-index]");
    if (!row) return;
    const idx = Number(row.dataset.pathIndex);
    if (!Number.isFinite(idx)) return;
    state.selectedPath = idx;
    refreshPathUI();
  });
}
if (els.pathSelect) {
  els.pathSelect.addEventListener("change", () => {
    state.selectedPath = Number(els.pathSelect.value);
    refreshPathUI();
  });
}
if (els.pathName) {
  els.pathName.addEventListener("input", () => {
    const c = getActivePathConstraint();
    if (!c) return;
    c.name = els.pathName.value.trim() || `path_${state.selectedPath}`;
    refreshPathUI();
    refreshTrackSelect();
    renderTimelineTracks();
  });
}
if (els.pathTargetBone) els.pathTargetBone.addEventListener("change", () => applyActivePathFromUI(false));
if (els.pathSourceType) els.pathSourceType.addEventListener("change", () => applyActivePathFromUI(false));
if (els.pathTargetSlot) els.pathTargetSlot.addEventListener("change", () => applyActivePathFromUI(false));
if (els.pathEnabled) els.pathEnabled.addEventListener("change", () => applyActivePathFromUI(false));
if (els.pathBones) els.pathBones.addEventListener("change", () => applyActivePathFromUI(true));
if (els.pathPosition) els.pathPosition.addEventListener("input", () => applyActivePathFromUI(false));
if (els.pathSpacing) els.pathSpacing.addEventListener("input", () => applyActivePathFromUI(false));
if (els.pathRotateMix) els.pathRotateMix.addEventListener("input", () => applyActivePathFromUI(false));
if (els.pathTranslateMix) els.pathTranslateMix.addEventListener("input", () => applyActivePathFromUI(false));
if (els.pathClosed) els.pathClosed.addEventListener("change", () => applyActivePathFromUI(false));
if (els.slotMeshNewBtn) {
  els.slotMeshNewBtn.addEventListener("click", () => {
    const source = getActiveSlot();
    if (!source) return;
    const mode = state.slotMesh.newContourMode === "reset_current" ? "reset_current" : "new_slot";
    if (mode === "reset_current") {
      source.meshContour = {
        points: [],
        closed: false,
        triangles: [],
        fillPoints: [],
        fillTriangles: [],
        manualEdges: [],
        fillManualEdges: [],
      };
      state.slotMesh.activePoint = -1;
      state.slotMesh.activeSet = "contour";
      state.slotMesh.edgeSelection = [];
      state.slotMesh.edgeSelectionSet = "contour";
      setStatus("Current slot contour reset. Click canvas to add contour points.");
      return;
    }
    const created = addContourSlotFromActiveSlot(source);
    if (!created) return;
    setStatus(`Created contour slot "${created.name}" from shared base texture.`);
  });
}
if (els.slotMeshNewMode) {
  els.slotMeshNewMode.addEventListener("change", () => {
    state.slotMesh.newContourMode = els.slotMeshNewMode.value === "reset_current" ? "reset_current" : "new_slot";
  });
}
if (els.slotMeshCloseBtn) {
  els.slotMeshCloseBtn.addEventListener("click", () => {
    const slot = getActiveSlot();
    if (!slot) return;
    const c = ensureSlotContour(slot);
    if (c.points.length < 3) {
      setStatus("Need at least 3 points to close contour.");
      return;
    }
    c.closed = true;
    c.triangles = [];
    c.fillPoints = [];
    c.fillTriangles = [];
    c.fillManualEdges = [];
    setStatus("Contour closed.");
  });
}
if (els.slotMeshTriangulateBtn) {
  els.slotMeshTriangulateBtn.addEventListener("click", () => {
    const slot = getActiveSlot();
    if (!slot) return;
    const c = ensureSlotContour(slot);
    if (!c.closed || c.points.length < 3) {
      setStatus("Close contour first, then triangulate.");
      return;
    }
    c.triangles = applyManualEdgesToTriangles(c.points, triangulatePolygon(c.points), c.manualEdges);
    c.fillPoints = [];
    c.fillTriangles = [];
    c.fillManualEdges = [];
    if (c.triangles.length < 3) {
      setStatus("Triangulation failed. Adjust contour (avoid self-intersection).");
      return;
    }
    setStatus(`Triangulated: ${c.triangles.length / 3} triangles.`);
  });
}
if (els.slotMeshGridFillBtn) {
  els.slotMeshGridFillBtn.addEventListener("click", () => {
    const slot = getActiveSlot();
    if (!slot) return;
    const c = ensureSlotContour(slot);
    if (!c.closed || c.points.length < 3) {
      setStatus("Close contour first, then run Grid Fill.");
      return;
    }
    const fill = buildUniformGridFillForContour(c, Number(els.gridX.value) || 24, Number(els.gridY.value) || 24);
    c.fillPoints = fill.points;
    c.fillManualEdges = normalizeEdgePairs(c.fillManualEdges, c.fillPoints.length);
    c.fillTriangles = applyManualEdgesToTriangles(c.fillPoints, fill.triangles, c.fillManualEdges);
    c.fillTriangles = sanitizeTriangles(c.fillPoints, c.fillTriangles, c.points);
    if (c.fillTriangles.length < 3) {
      setStatus("Grid fill failed. Increase Grid X/Y or adjust contour.");
      return;
    }
    setStatus(`Grid fill generated: ${c.fillPoints.length} points, ${c.fillTriangles.length / 3} triangles.`);
  });
}
if (els.slotMeshApplyBtn) {
  els.slotMeshApplyBtn.addEventListener("click", () => {
    const slot = getActiveSlot();
    if (!slot) return;
    const ok = applyContourMeshToSlot(slot);
    if (!ok) {
      setStatus("Apply failed. Need a closed contour with valid triangulation.");
      return;
    }
    setStatus("Slot mesh applied from contour.");
  });
}
if (els.slotMeshLinkEdgeBtn) {
  els.slotMeshLinkEdgeBtn.addEventListener("click", () => {
    const slot = getActiveSlot();
    if (!slot) return;
    const ok = linkSelectedSlotMeshEdge(true);
    const activeSet = state.slotMesh.activeSet === "fill" ? "fill" : "contour";
    if (!ok) {
      setStatus("Select 2 vertices (Shift+Click) in the same set, then Link Edge.");
      return;
    }
    const [a0, b0] = state.slotMesh.edgeSelection;
    const a = Math.min(a0, b0);
    const b = Math.max(a0, b0);
    setStatus(`Edge linked (${activeSet}: ${a}-${b}).`);
  });
}
if (els.slotMeshUnlinkEdgeBtn) {
  els.slotMeshUnlinkEdgeBtn.addEventListener("click", () => {
    const slot = getActiveSlot();
    if (!slot) return;
    const ok = linkSelectedSlotMeshEdge(false);
    const activeSet = state.slotMesh.activeSet === "fill" ? "fill" : "contour";
    if (!ok) {
      setStatus("Select 2 linked vertices (Shift+Click) in the same set, then Unlink Edge.");
      return;
    }
    const [a0, b0] = state.slotMesh.edgeSelection;
    const a = Math.min(a0, b0);
    const b = Math.max(a0, b0);
    setStatus(`Edge unlinked (${activeSet}: ${a}-${b}).`);
  });
}
if (els.slotBindBoneBtn) {
  els.slotBindBoneBtn.addEventListener("click", () => {
    const ok = bindActiveSlotToSelectedBone();
    if (!ok) {
      setStatus("Bind failed. Select a bone first, and ensure an active slot exists.");
      return;
    }
    const slot = getActiveSlot();
    setStatus(`Slot "${slot ? slot.name : ""}" bound to bone ${slot ? slot.bone : -1}.`);
  });
}
if (els.slotBindWeightedBtn) {
  els.slotBindWeightedBtn.addEventListener("click", () => {
    const ok = bindActiveSlotWeightedToSelectedBones();
    if (!ok) {
      setStatus("Weighted bind failed. Select one or more bones first.");
      return;
    }
    const slot = getActiveSlot();
    setStatus(
      `Slot "${slot ? slot.name : ""}" weighted to bones: ${(slot && slot.influenceBones && slot.influenceBones.join(", ")) || "(none)"}`
    );
  });
}
if (els.slotMeshResetBtn) {
  els.slotMeshResetBtn.addEventListener("click", () => {
    const slot = getActiveSlot();
    if (!slot) return;
    if (resetSlotMeshToGrid(slot)) {
      setStatus("Slot mesh reset to grid.");
    }
  });
}

els.boneName.addEventListener("input", () => {
  const m = state.mesh;
  if (!m || state.boneMode !== "edit") return;
  const b = m.rigBones[state.selectedBone];
  if (!b) return;
  b.name = els.boneName.value.trim() || `bone_${state.selectedBone}`;
  if (m.poseBones[state.selectedBone]) {
    m.poseBones[state.selectedBone].name = b.name;
  }
  updateBoneSelectors();
  els.boneSelect.value = String(state.selectedBone);
  els.boneParent.value = String(b.parent);
});

els.boneParent.addEventListener("change", () => {
  const m = state.mesh;
  if (!m || state.boneMode !== "edit") return;
  const i = state.selectedBone;
  const newParent = Number(els.boneParent.value);
  if (!isValidParent(m.rigBones, i, newParent)) {
    updateBoneUI();
    setStatus("Invalid parent: would create a cycle.");
    return;
  }
  m.rigBones[i].parent = newParent;
  if (newParent >= 0) {
    m.rigBones[i].connected = true;
  }
  if (m.poseBones[i]) {
    m.poseBones[i].parent = newParent;
  }
  commitRigEdit(m, true);
  updateBoneUI();
});

els.boneTx.addEventListener("input", () => {
  const m = state.mesh;
  if (!m) return;
  const b = getBonesForCurrentMode(m)[state.selectedBone];
  if (!b) return;
  if (b.parent >= 0 && b.connected) return;
  b.tx = Number(els.boneTx.value) || 0;
  markDirtyByBoneProp(state.selectedBone, "translate");
  if (state.boneMode === "edit") {
    commitRigEdit(m, true);
  }
  updateBoneUI();
});

els.boneTy.addEventListener("input", () => {
  const m = state.mesh;
  if (!m) return;
  const b = getBonesForCurrentMode(m)[state.selectedBone];
  if (!b) return;
  if (b.parent >= 0 && b.connected) return;
  b.ty = Number(els.boneTy.value) || 0;
  markDirtyByBoneProp(state.selectedBone, "translate");
  if (state.boneMode === "edit") {
    commitRigEdit(m, true);
  }
  updateBoneUI();
});

els.boneRot.addEventListener("input", () => {
  const m = state.mesh;
  if (!m) return;
  const b = getBonesForCurrentMode(m)[state.selectedBone];
  if (!b) return;
  b.rot = math.degToRad(Number(els.boneRot.value) || 0);
  if (state.boneMode === "pose") {
    steerIKTargetFromBoneEdit(m, state.selectedBone, null);
  }
  markDirtyByBoneProp(state.selectedBone, "rotate");
  if (state.boneMode === "edit") {
    commitRigEdit(m, true);
  }
  updateBoneUI();
});

els.boneLen.addEventListener("input", () => {
  const m = state.mesh;
  if (!m) return;
  const b = getBonesForCurrentMode(m)[state.selectedBone];
  if (!b) return;
  if (state.boneMode === "pose" && b.poseLenEditable === false) return;
  b.length = Math.max(1, Number(els.boneLen.value) || 1);
  if (state.boneMode === "pose") {
    steerIKTargetFromBoneEdit(m, state.selectedBone, null);
  }
  markDirtyByBoneProp(state.selectedBone, "scale");
  if (state.boneMode === "edit") {
    commitRigEdit(m, true);
  }
  updateBoneUI();
});

if (els.boneScaleX) {
  els.boneScaleX.addEventListener("input", () => {
    const m = state.mesh;
    if (!m) return;
    const b = getBonesForCurrentMode(m)[state.selectedBone];
    if (!b) return;
    normalizeBoneChannels(b);
    b.sx = Number(els.boneScaleX.value) || 1;
    markDirtyByBoneProp(state.selectedBone, "scaleX");
    if (state.boneMode === "edit") commitRigEdit(m, true);
    updateBoneUI();
  });
}
if (els.boneScaleY) {
  els.boneScaleY.addEventListener("input", () => {
    const m = state.mesh;
    if (!m) return;
    const b = getBonesForCurrentMode(m)[state.selectedBone];
    if (!b) return;
    normalizeBoneChannels(b);
    b.sy = Number(els.boneScaleY.value) || 1;
    markDirtyByBoneProp(state.selectedBone, "scaleY");
    if (state.boneMode === "edit") commitRigEdit(m, true);
    updateBoneUI();
  });
}
if (els.boneShearX) {
  els.boneShearX.addEventListener("input", () => {
    const m = state.mesh;
    if (!m) return;
    const b = getBonesForCurrentMode(m)[state.selectedBone];
    if (!b) return;
    normalizeBoneChannels(b);
    b.shx = math.degToRad(Number(els.boneShearX.value) || 0);
    markDirtyByBoneProp(state.selectedBone, "shearX");
    if (state.boneMode === "edit") commitRigEdit(m, true);
    updateBoneUI();
  });
}
if (els.boneShearY) {
  els.boneShearY.addEventListener("input", () => {
    const m = state.mesh;
    if (!m) return;
    const b = getBonesForCurrentMode(m)[state.selectedBone];
    if (!b) return;
    normalizeBoneChannels(b);
    b.shy = math.degToRad(Number(els.boneShearY.value) || 0);
    markDirtyByBoneProp(state.selectedBone, "shearY");
    if (state.boneMode === "edit") commitRigEdit(m, true);
    updateBoneUI();
  });
}

els.boneConnect.addEventListener("change", () => {
  const m = state.mesh;
  if (!m) return;
  const i = state.selectedBone;
  const connected = els.boneConnect.value === "true";
  if (m.rigBones[i]) m.rigBones[i].connected = connected;
  if (m.poseBones[i]) m.poseBones[i].connected = connected;
  enforceConnectedHeads(m.rigBones);
  enforceConnectedHeads(m.poseBones);
  if (state.boneMode === "edit") {
    commitRigEdit(m, true);
  }
  updateBoneUI();
});

els.bonePoseLen.addEventListener("change", () => {
  const m = state.mesh;
  if (!m) return;
  const i = state.selectedBone;
  const editable = els.bonePoseLen.value === "true";
  if (m.rigBones[i]) m.rigBones[i].poseLenEditable = editable;
  if (m.poseBones[i]) m.poseBones[i].poseLenEditable = editable;
  updateBoneUI();
});

function applyHeadTipFromInputs() {
  const m = state.mesh;
  if (!m) return;
  const i = state.selectedBone;
  const bones = getBonesForCurrentMode(m);
  const b = bones[i];
  if (!b) return;
  const hx = Number(els.boneHeadX.value);
  const hy = Number(els.boneHeadY.value);
  const tx = Number(els.boneTipX.value);
  const ty = Number(els.boneTipY.value);
  const head = {
    x: Number.isFinite(hx) ? hx : 0,
    y: Number.isFinite(hy) ? hy : 0,
  };
  const tip = {
    x: Number.isFinite(tx) ? tx : head.x + Math.max(1, b.length),
    y: Number.isFinite(ty) ? ty : head.y,
  };
  const resolvedHead = b.parent >= 0 && b.connected ? getBoneWorldEndpointsFromBones(bones, i).head : head;
  if (state.boneMode === "pose" && b.poseLenEditable === false) {
    const a = angleTo(resolvedHead, tip);
    tip.x = resolvedHead.x + Math.cos(a) * b.length;
    tip.y = resolvedHead.y + Math.sin(a) * b.length;
  }
  setBoneFromWorldEndpoints(bones, i, resolvedHead, tip);
  if (state.boneMode === "pose") {
    steerIKTargetFromBoneEdit(m, i, tip);
  }
  markDirtyByBoneProp(i, "translate");
  markDirtyByBoneProp(i, "rotate");
  markDirtyByBoneProp(i, "scale");
  if (state.boneMode === "edit") {
    commitRigEdit(m, true);
  }
  updateBoneUI();
}

els.boneHeadX.addEventListener("input", applyHeadTipFromInputs);
els.boneHeadY.addEventListener("input", applyHeadTipFromInputs);
els.boneTipX.addEventListener("input", applyHeadTipFromInputs);
els.boneTipY.addEventListener("input", applyHeadTipFromInputs);

els.animDuration.addEventListener("input", () => {
  const anim = getCurrentAnimation();
  if (!anim) return;
  anim.duration = Math.max(0.1, Number(els.animDuration.value) || anim.duration || 5);
  setAnimTime(state.anim.time);
});
els.animTime.addEventListener("input", () => {
  setAnimTime(Number(els.animTime.value) || 0);
  if (state.mesh) {
    samplePoseAtTime(state.mesh, state.anim.time);
    if (state.boneMode === "pose") updateBoneUI();
  }
});
els.animSelect.addEventListener("change", () => {
  state.anim.mix.active = false;
  state.anim.currentAnimId = els.animSelect.value;
  const anim = getCurrentAnimation();
  if (!anim) return;
  clearTimelineKeySelection();
  setAnimTime(0);
  refreshAnimationUI();
  if (state.mesh) {
    samplePoseAtTime(state.mesh, 0);
    if (state.boneMode === "pose") updateBoneUI();
  }
});
els.animName.addEventListener("input", () => {
  const anim = getCurrentAnimation();
  if (!anim) return;
  anim.name = els.animName.value.trim() || "Anim";
  refreshAnimationUI();
});
els.addAnimBtn.addEventListener("click", () => {
  const idx = state.anim.animations.length + 1;
  const a = createAnimation(`Anim ${idx}`);
  state.anim.animations.push(a);
  state.anim.currentAnimId = a.id;
  state.anim.mix.active = false;
  clearTimelineKeySelection();
  setAnimTime(0);
  refreshAnimationUI();
});
els.duplicateAnimBtn.addEventListener("click", () => {
  const curr = getCurrentAnimation();
  if (!curr) return;
  const dup = {
    id: makeAnimId(),
    name: `${curr.name} Copy`,
    duration: curr.duration,
    tracks: JSON.parse(JSON.stringify(curr.tracks)),
  };
  state.anim.animations.push(dup);
  state.anim.currentAnimId = dup.id;
  state.anim.mix.active = false;
  clearTimelineKeySelection();
  refreshAnimationUI();
});
els.deleteAnimBtn.addEventListener("click", () => {
  if (state.anim.animations.length <= 1) return;
  state.anim.animations = state.anim.animations.filter((a) => a.id !== state.anim.currentAnimId);
  ensureCurrentAnimation();
  state.anim.mix.active = false;
  clearTimelineKeySelection();
  setAnimTime(0);
  refreshAnimationUI();
});
els.trackSelect.addEventListener("change", () => {
  state.anim.selectedTrack = els.trackSelect.value;
  clearTimelineKeySelection();
  renderTimelineTracks();
});
els.addKeyBtn.addEventListener("click", () => {
  if (!state.mesh) return;
  addAutoKeyframeFromDirty();
});
els.deleteKeyBtn.addEventListener("click", () => {
  deleteSelectedOrCurrentKeyframe();
});
els.copyKeyBtn.addEventListener("click", () => {
  copySelectedKeyframe();
});
els.pasteKeyBtn.addEventListener("click", () => {
  pasteKeyframeAtCurrentTime();
});
if (els.addEventBtn) {
  els.addEventBtn.addEventListener("click", () => {
    addOrUpdateEventAtCurrentTime();
  });
}
if (els.deleteEventBtn) {
  els.deleteEventBtn.addEventListener("click", () => {
    const anim = getCurrentAnimation();
    if (!anim) return;
    const keys = getTrackKeys(anim, EVENT_TRACK_ID);
    const t = state.anim.time;
    const before = keys.length;
    anim.tracks[EVENT_TRACK_ID] = keys.filter((k) => Math.abs((Number(k.time) || 0) - t) >= 1e-4);
    if (anim.tracks[EVENT_TRACK_ID].length === before) {
      setStatus("No event key at current time.");
      return;
    }
    clearTimelineKeySelection();
    renderTimelineTracks();
    setStatus("Event key deleted at current time.");
  });
}
if (els.eventKeyList) {
  els.eventKeyList.addEventListener("change", () => {
    const anim = getCurrentAnimation();
    if (!anim) return;
    const id = els.eventKeyList.value;
    const keys = getTrackKeys(anim, EVENT_TRACK_ID);
    const k = keys.find((it) => it.id === id);
    if (!k) return;
    setSingleTimelineSelection(EVENT_TRACK_ID, k.id);
    setAnimTime(Number(k.time) || 0);
    if (state.mesh) {
      samplePoseAtTime(state.mesh, state.anim.time);
      if (state.boneMode === "pose") updateBoneUI();
    }
    renderTimelineTracks();
  });
}
if (els.eventJumpBtn) {
  els.eventJumpBtn.addEventListener("click", () => {
    if (!els.eventKeyList || !els.eventKeyList.value) return;
    const anim = getCurrentAnimation();
    if (!anim) return;
    const id = els.eventKeyList.value;
    const k = getTrackKeys(anim, EVENT_TRACK_ID).find((it) => it.id === id);
    if (!k) return;
    setSingleTimelineSelection(EVENT_TRACK_ID, k.id);
    setAnimTime(Number(k.time) || 0);
    if (state.mesh) {
      samplePoseAtTime(state.mesh, state.anim.time);
      if (state.boneMode === "pose") updateBoneUI();
    }
    renderTimelineTracks();
  });
}
if (els.eventDeleteSelBtn) {
  els.eventDeleteSelBtn.addEventListener("click", () => {
    if (!deleteSelectedEventKey()) {
      setStatus("No selected event key.");
      return;
    }
    setStatus("Selected event key deleted.");
  });
}
if (els.eventName) els.eventName.addEventListener("input", updateSelectedEventKeyFromUI);
if (els.eventInt) els.eventInt.addEventListener("input", updateSelectedEventKeyFromUI);
if (els.eventFloat) els.eventFloat.addEventListener("input", updateSelectedEventKeyFromUI);
if (els.eventString) els.eventString.addEventListener("input", updateSelectedEventKeyFromUI);
els.animLoop.addEventListener("change", () => {
  state.anim.loop = !!els.animLoop.checked;
});
els.animSnap.addEventListener("change", () => {
  state.anim.snap = !!els.animSnap.checked;
});
els.animFps.addEventListener("input", () => {
  state.anim.fps = Math.max(1, Number(els.animFps.value) || 30);
  const anim = getCurrentAnimation();
  if (anim) {
    for (const trackId of Object.keys(anim.tracks || {})) {
      normalizeTrackKeys(anim, trackId);
    }
  }
  setAnimTime(state.anim.time);
  renderTimelineTracks();
});
if (els.animTimeStep) {
  els.animTimeStep.addEventListener("input", () => {
    const step = Math.max(0.001, Number(els.animTimeStep.value) || 0.01);
    state.anim.timeStep = step;
    els.animTimeStep.value = String(step);
    const anim = getCurrentAnimation();
    if (anim) {
      for (const trackId of Object.keys(anim.tracks || {})) {
        normalizeTrackKeys(anim, trackId);
      }
    }
    setAnimTime(state.anim.time);
    renderTimelineTracks();
  });
}
els.keyInterp.addEventListener("change", () => {
  const anim = getCurrentAnimation();
  if (!anim) return;
  const value = els.keyInterp.value || "linear";
  const picked = state.anim.selectedKeys && state.anim.selectedKeys.length > 0 ? state.anim.selectedKeys : [state.anim.selectedKey].filter(Boolean);
  if (picked.length === 0) return;
  for (const sk of picked) {
    const keys = getTrackKeys(anim, sk.trackId);
    const k = keys.find((x) => x.id === sk.keyId);
    if (!k) continue;
    k.interp = value;
    if (value === "bezier") ensureBezierCurveOnKey(k);
  }
  renderTimelineTracks();
});

function beginAnimationMix(toAnimId, durationSec) {
  const from = getCurrentAnimation();
  const to = state.anim.animations.find((a) => a.id === toAnimId);
  if (!state.mesh || !from || !to || from.id === to.id) return false;
  state.anim.mix.active = true;
  state.anim.mix.fromAnimId = from.id;
  state.anim.mix.toAnimId = to.id;
  state.anim.mix.duration = Math.max(0.01, Number(durationSec) || 0.2);
  state.anim.mix.elapsed = 0;
  state.anim.mix.fromTime = state.anim.time;
  state.anim.mix.toTime = 0;
  state.anim.currentAnimId = to.id;
  setAnimTime(0);
  state.anim.playing = true;
  state.anim.lastTs = 0;
  updatePlaybackButtons();
  refreshAnimationMixUI();
  setStatus(`Mix start: ${from.name} -> ${to.name} (${state.anim.mix.duration.toFixed(2)}s)`);
  return true;
}

if (els.animMixDur) {
  els.animMixDur.addEventListener("input", () => {
    state.anim.mix.duration = Math.max(0.01, Number(els.animMixDur.value) || 0.2);
    els.animMixDur.value = String(state.anim.mix.duration);
    refreshAnimationMixUI();
  });
}
if (els.animMixBtn) {
  els.animMixBtn.addEventListener("click", () => {
    const toId = els.animMixTo ? els.animMixTo.value : "";
    const dur = els.animMixDur ? Number(els.animMixDur.value) : 0.2;
    if (!beginAnimationMix(toId, dur)) {
      setStatus("Mix failed: choose another animation as target.");
    }
  });
}
if (els.curveToggleBtn) {
  els.curveToggleBtn.addEventListener("click", () => {
    state.anim.curveOpen = !state.anim.curveOpen;
    renderCurveEditor();
  });
}

if (els.curveEditor) {
  const cv = els.curveEditor;
  const fromScreen = (ev) => {
    const r = cv.getBoundingClientRect();
    const sx = (ev.clientX - r.left) * (cv.width / Math.max(1, r.width));
    const sy = (ev.clientY - r.top) * (cv.height / Math.max(1, r.height));
    const pad = 16;
    const x = math.clamp((sx - pad) / Math.max(1, cv.width - pad * 2), 0, 1);
    const y = math.clamp(1 - (sy - pad) / Math.max(1, cv.height - pad * 2), 0, 1);
    return { x, y };
  };
  const hitHandle = (ev) => {
    const t = getCurveEditTarget();
    if (!t || (t.key.interp || "linear") !== "bezier") return null;
    ensureBezierCurveOnKey(t.key);
    const r = cv.getBoundingClientRect();
    const sx = (ev.clientX - r.left) * (cv.width / Math.max(1, r.width));
    const sy = (ev.clientY - r.top) * (cv.height / Math.max(1, r.height));
    const pad = 16;
    const gw = cv.width - pad * 2;
    const gh = cv.height - pad * 2;
    const p1 = { x: pad + t.key.curve[0] * gw, y: pad + (1 - t.key.curve[1]) * gh };
    const p2 = { x: pad + t.key.curve[2] * gw, y: pad + (1 - t.key.curve[3]) * gh };
    const d1 = (sx - p1.x) * (sx - p1.x) + (sy - p1.y) * (sy - p1.y);
    const d2 = (sx - p2.x) * (sx - p2.x) + (sy - p2.y) * (sy - p2.y);
    if (d1 <= 64) return "c1";
    if (d2 <= 64) return "c2";
    return null;
  };
  cv.addEventListener("pointerdown", (ev) => {
    const t = getCurveEditTarget();
    if (!t) return;
    if ((t.key.interp || "linear") !== "bezier") {
      t.key.interp = "bezier";
      ensureBezierCurveOnKey(t.key);
      if (els.keyInterp) els.keyInterp.value = "bezier";
      renderTimelineTracks();
    }
    const handle = hitHandle(ev) || "c2";
    state.anim.curveDrag = { handle, trackId: t.trackId, keyId: t.key.id, pointerId: ev.pointerId };
    try {
      cv.setPointerCapture(ev.pointerId);
    } catch {
      // ignore
    }
    ev.preventDefault();
  });
  cv.addEventListener("pointermove", (ev) => {
    const drag = state.anim.curveDrag;
    if (!drag) return;
    const t = getCurveEditTarget();
    if (!t || t.trackId !== drag.trackId || t.key.id !== drag.keyId) return;
    ensureBezierCurveOnKey(t.key);
    const p = fromScreen(ev);
    if (drag.handle === "c1") {
      t.key.curve[0] = p.x;
      t.key.curve[1] = p.y;
    } else {
      t.key.curve[2] = p.x;
      t.key.curve[3] = p.y;
    }
    t.key.curve[0] = math.clamp(t.key.curve[0], 0, 1);
    t.key.curve[1] = math.clamp(t.key.curve[1], 0, 1);
    t.key.curve[2] = math.clamp(t.key.curve[2], 0, 1);
    t.key.curve[3] = math.clamp(t.key.curve[3], 0, 1);
    if (state.mesh) {
      samplePoseAtTime(state.mesh, state.anim.time);
      if (state.boneMode === "pose") updateBoneUI();
    }
    renderCurveEditor();
    ev.preventDefault();
  });
  const stopCurveDrag = (ev) => {
    if (!state.anim.curveDrag) return;
    try {
      cv.releasePointerCapture(ev.pointerId);
    } catch {
      // ignore
    }
    state.anim.curveDrag = null;
    renderTimelineTracks();
  };
  cv.addEventListener("pointerup", stopCurveDrag);
  cv.addEventListener("pointercancel", stopCurveDrag);
}
function ensureTimelineMarqueeEl() {
  if (state.anim.timelineMarqueeEl && state.anim.timelineMarqueeEl.isConnected) return state.anim.timelineMarqueeEl;
  const el = document.createElement("div");
  el.className = "timeline-marquee";
  state.anim.timelineMarqueeEl = el;
  els.timelineTracks.appendChild(el);
  return el;
}

function clearTimelineMarqueeEl() {
  const el = state.anim.timelineMarqueeEl;
  if (el && el.parentNode) el.parentNode.removeChild(el);
  state.anim.timelineMarqueeEl = null;
}

function rectsOverlap(a, b) {
  return a.left <= b.right && a.right >= b.left && a.top <= b.bottom && a.bottom >= b.top;
}

els.timelineTracks.addEventListener("pointerdown", (ev) => {
  const anim = getCurrentAnimation();
  if (!anim) return;
  const groupLabel = ev.target.closest(".track-label[data-group-key]");
  if (groupLabel) {
    const gk = String(groupLabel.dataset.groupKey || "");
    const num = Number(gk);
    const isNumKey = Number.isFinite(num) && String(num) === gk;
    const key = isNumKey ? num : gk;
    state.anim.trackExpanded[key] = !state.anim.trackExpanded[key];
    renderTimelineTracks();
    return;
  }
  const keyEl = ev.target.closest(".track-key");
  const playheadEl = ev.target.closest(".timeline-playhead.handle");
  const laneEl = ev.target.closest(".track-lane");
  if (!laneEl) return;
  ev.preventDefault();
  const trackId = laneEl.dataset.trackId;
  if (!trackId) return;

  const rect = laneEl.getBoundingClientRect();
  const x = ev.clientX - rect.left;
  const t = snapTimeIfNeeded(timeForTimelineX(x, rect.width, anim.duration));

  if (playheadEl || trackId === "__ruler__") {
    clearTimelineMarqueeEl();
    state.anim.timelineDrag = {
      mode: "playhead",
      laneTrackId: trackId,
      pointerId: ev.pointerId,
    };
    els.timelineTracks.setPointerCapture(ev.pointerId);
    setAnimTime(t);
    if (state.mesh) {
      samplePoseAtTime(state.mesh, state.anim.time);
      if (state.boneMode === "pose") updateBoneUI();
    }
    renderTimelineTracks();
    return;
  }

  if (keyEl) {
    clearTimelineMarqueeEl();
    if (trackId === "__all__") {
      const allTime = Number(keyEl.dataset.allTime);
      if (!Number.isFinite(allTime)) return;
      const picked = collectKeysAtTime(anim, allTime);
      if (picked.length <= 0) return;
      state.anim.selectedKeys = picked;
      state.anim.selectedKey = { ...picked[0] };
      state.anim.timelineDrag = {
        mode: "key_set",
        laneTrackId: trackId,
        pointerId: ev.pointerId,
        anchorTime: allTime,
        seed: getDragSeedFromSelection(anim, picked),
      };
      els.timelineTracks.setPointerCapture(ev.pointerId);
      setAnimTime(allTime);
      renderTimelineTracks();
      return;
    }
    if (!parseTrackId(trackId)) return;
    state.anim.selectedTrack = trackId;
    els.trackSelect.value = trackId;
    const keyId = keyEl.dataset.keyId;
    const keys = getTrackKeys(anim, trackId);
    const k = keys.find((kk) => kk.id === keyId);
    if (!k) return;
    const wantToggle = ev.ctrlKey || ev.metaKey;
    if (wantToggle) {
      toggleTimelineSelection(trackId, k.id);
    } else if (!keySelectionHas(trackId, k.id) || !(state.anim.selectedKeys && state.anim.selectedKeys.length > 1)) {
      setSingleTimelineSelection(trackId, k.id);
    } else {
      state.anim.selectedKey = { trackId, keyId: k.id };
    }
    const dragSelection =
      !wantToggle && keySelectionHas(trackId, k.id) && state.anim.selectedKeys && state.anim.selectedKeys.length > 1
        ? state.anim.selectedKeys
        : [{ trackId, keyId: k.id }];
    els.keyInterp.value = k.interp || "linear";
    state.anim.timelineDrag = {
      mode: "key_set",
      laneTrackId: trackId,
      pointerId: ev.pointerId,
      anchorTime: Number(k.time) || 0,
      seed: getDragSeedFromSelection(anim, dragSelection),
    };
    els.timelineTracks.setPointerCapture(ev.pointerId);
    setAnimTime(k.time);
    renderTimelineTracks();
    return;
  }

  if (trackId !== "__ruler__") {
    clearTimelineMarqueeEl();
    state.anim.timelineDrag = {
      mode: "marquee_pending",
      pointerId: ev.pointerId,
      startClientX: ev.clientX,
      startClientY: ev.clientY,
      trackId,
      time: t,
      append: !!(ev.ctrlKey || ev.metaKey),
      started: false,
    };
    els.timelineTracks.setPointerCapture(ev.pointerId);
    return;
  }

  if (parseTrackId(trackId)) {
    state.anim.selectedTrack = trackId;
    els.trackSelect.value = trackId;
  }
  setAnimTime(t);
  clearTimelineKeySelection();
  if (state.mesh) {
    samplePoseAtTime(state.mesh, state.anim.time);
    if (state.boneMode === "pose") updateBoneUI();
  }
  renderTimelineTracks();
});
els.timelineTracks.addEventListener("pointermove", (ev) => {
  const drag = state.anim.timelineDrag;
  const anim = getCurrentAnimation();
  if (!drag || !anim) return;
  if (drag.mode === "marquee_pending" || drag.mode === "marquee") {
    ev.preventDefault();
  }
  if (drag.mode === "marquee_pending") {
    const dx = ev.clientX - drag.startClientX;
    const dy = ev.clientY - drag.startClientY;
    if (dx * dx + dy * dy < 9) return;
    const baseSelection = drag.append ? [...(state.anim.selectedKeys || [])] : [];
    if (!drag.append) clearTimelineKeySelection();
    drag.mode = "marquee";
    drag.baseSelection = baseSelection;
    const rootRect = els.timelineTracks.getBoundingClientRect();
    const scrollLeft = els.timelineTracks.scrollLeft;
    const scrollTop = els.timelineTracks.scrollTop;
    const x = drag.startClientX - rootRect.left + scrollLeft;
    const y = drag.startClientY - rootRect.top + scrollTop;
    const mq = ensureTimelineMarqueeEl();
    mq.style.left = `${x}px`;
    mq.style.top = `${y}px`;
    mq.style.width = "0px";
    mq.style.height = "0px";
    applyTimelineSelectionClasses();
  }
  if (drag.mode === "marquee") {
    const rootRect = els.timelineTracks.getBoundingClientRect();
    const scrollLeft = els.timelineTracks.scrollLeft;
    const scrollTop = els.timelineTracks.scrollTop;
    const x0 = drag.startClientX - rootRect.left + scrollLeft;
    const y0 = drag.startClientY - rootRect.top + scrollTop;
    const x1 = ev.clientX - rootRect.left + scrollLeft;
    const y1 = ev.clientY - rootRect.top + scrollTop;
    const left = Math.min(x0, x1);
    const top = Math.min(y0, y1);
    const width = Math.abs(x1 - x0);
    const height = Math.abs(y1 - y0);
    const mq = ensureTimelineMarqueeEl();
    mq.style.left = `${left}px`;
    mq.style.top = `${top}px`;
    mq.style.width = `${width}px`;
    mq.style.height = `${height}px`;
    const pickRect = {
      left: Math.min(drag.startClientX, ev.clientX),
      right: Math.max(drag.startClientX, ev.clientX),
      top: Math.min(drag.startClientY, ev.clientY),
      bottom: Math.max(drag.startClientY, ev.clientY),
    };
    const hit = [];
    for (const keyNode of els.timelineTracks.querySelectorAll(".track-key[data-track-id][data-key-id]")) {
      const r = keyNode.getBoundingClientRect();
      if (rectsOverlap(pickRect, r)) {
        hit.push({ trackId: keyNode.dataset.trackId, keyId: keyNode.dataset.keyId });
      }
    }
    const out = [];
    const seen = new Set();
    for (const s of [...(drag.baseSelection || []), ...hit]) {
      const k = `${s.trackId}::${s.keyId}`;
      if (seen.has(k)) continue;
      seen.add(k);
      out.push({ trackId: s.trackId, keyId: s.keyId });
    }
    state.anim.selectedKeys = out;
    state.anim.selectedKey = out.length > 0 ? { ...out[0] } : null;
    applyTimelineSelectionClasses();
    return;
  }
  const laneEl = els.timelineTracks.querySelector(`.track-lane[data-track-id='${drag.laneTrackId}']`);
  if (!laneEl) return;
  const rect = laneEl.getBoundingClientRect();
  const x = ev.clientX - rect.left;
  const t = snapTimeIfNeeded(timeForTimelineX(x, rect.width, anim.duration));
  if (drag.mode === "playhead") {
    setAnimTime(t);
    if (state.mesh) {
      samplePoseAtTime(state.mesh, state.anim.time);
      if (state.boneMode === "pose") updateBoneUI();
    }
    renderTimelineTracks();
    return;
  }
  const delta = t - (Number(drag.anchorTime) || 0);
  const touched = new Set();
  let anchorSelection = null;
  for (const it of drag.seed || []) {
    const keys = getTrackKeys(anim, it.trackId);
    const keyObj = keys.find((kk) => kk.id === it.keyId);
    if (!keyObj) continue;
    keyObj.time = sanitizeTimelineTime(snapTimeIfNeeded((Number(it.time) || 0) + delta), anim.duration);
    touched.add(it.trackId);
    if (!anchorSelection) anchorSelection = { trackId: it.trackId, keyId: it.keyId, time: keyObj.time };
  }
  drag.touchedTracks = [...touched];
  if (anchorSelection) {
    state.anim.selectedKey = { trackId: anchorSelection.trackId, keyId: anchorSelection.keyId };
  }
  setAnimTime(t);
  renderTimelineTracks();
});
function clearTimelineDrag(ev) {
  const drag = state.anim.timelineDrag;
  if (!drag) return;
  try {
    els.timelineTracks.releasePointerCapture(ev.pointerId);
  } catch {
    // ignore
  }
  const anim = getCurrentAnimation();
  if (drag.mode === "marquee_pending") {
    if (anim && parseTrackId(drag.trackId)) {
      state.anim.selectedTrack = drag.trackId;
      if (els.trackSelect) els.trackSelect.value = drag.trackId;
    }
    if (!drag.append) clearTimelineKeySelection();
    setAnimTime(Number(drag.time) || 0);
    if (state.mesh) {
      samplePoseAtTime(state.mesh, state.anim.time);
      if (state.boneMode === "pose") updateBoneUI();
    }
    state.anim.timelineDrag = null;
    renderTimelineTracks();
    return;
  }
  if (anim && drag.mode === "key_set") {
    const touched = Array.isArray(drag.touchedTracks) ? drag.touchedTracks : [];
    for (const trackId of touched) {
      if (!trackId) continue;
      normalizeTrackKeys(anim, trackId);
    }
    normalizeSelectedKeys(anim);
  }
  if (drag.mode === "marquee" || drag.mode === "marquee_pending") {
    clearTimelineMarqueeEl();
  }
  state.anim.timelineDrag = null;
  renderTimelineTracks();
}
els.timelineTracks.addEventListener("pointerup", clearTimelineDrag);
els.timelineTracks.addEventListener("pointercancel", clearTimelineDrag);
els.timelineResizer.addEventListener("pointerdown", (ev) => {
  state.anim.resizing = {
    pointerId: ev.pointerId,
    startY: ev.clientY,
    startH: parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--timeline-h")) || 280,
  };
  els.timelineResizer.setPointerCapture(ev.pointerId);
});
els.timelineResizer.addEventListener("pointermove", (ev) => {
  const r = state.anim.resizing;
  if (!r) return;
  const delta = r.startY - ev.clientY;
  const next = math.clamp(r.startH + delta, 140, Math.max(180, window.innerHeight * 0.6));
  document.documentElement.style.setProperty("--timeline-h", `${Math.round(next)}px`);
});
function clearResize(ev) {
  if (!state.anim.resizing) return;
  try {
    els.timelineResizer.releasePointerCapture(ev.pointerId);
  } catch {
    // ignore
  }
  state.anim.resizing = null;
}
els.timelineResizer.addEventListener("pointerup", clearResize);
els.timelineResizer.addEventListener("pointercancel", clearResize);
if (els.playBtn) {
  els.playBtn.addEventListener("click", () => {
    state.anim.playing = !state.anim.playing;
    state.anim.lastTs = 0;
    updatePlaybackButtons();
  });
}
if (els.pauseBtn) {
  els.pauseBtn.addEventListener("click", () => {
    state.anim.playing = false;
    updatePlaybackButtons();
  });
}
els.stopBtn.addEventListener("click", () => {
  state.anim.playing = false;
  state.anim.lastTs = 0;
  updatePlaybackButtons();
  setAnimTime(0);
  if (state.mesh) {
    samplePoseAtTime(state.mesh, 0);
    if (state.boneMode === "pose") updateBoneUI();
  }
});

window.addEventListener("keydown", (ev) => {
  const tag = ev.target && ev.target.tagName ? ev.target.tagName.toLowerCase() : "";
  if (tag === "input" || tag === "textarea" || tag === "select") return;
  if (state.editMode === "slotmesh") {
    const slot = getActiveSlot();
    if (!slot) return;
    const contour = ensureSlotContour(slot);
    const activeSet = state.slotMesh.activeSet === "fill" ? "fill" : "contour";
    const activePoints = activeSet === "fill" ? contour.fillPoints : contour.points;
    if (ev.key === "Enter") {
      if (!contour.closed && contour.points.length >= 3) contour.closed = true;
      contour.triangles = applyManualEdgesToTriangles(contour.points, triangulatePolygon(contour.points), contour.manualEdges);
      contour.fillPoints = [];
      contour.fillTriangles = [];
      contour.fillManualEdges = [];
      state.slotMesh.activeSet = "contour";
      setStatus(contour.triangles.length >= 3 ? `Triangulated: ${contour.triangles.length / 3} triangles.` : "Triangulation failed.");
      ev.preventDefault();
      return;
    }
    if ((ev.key === "Backspace" || ev.key === "Delete" || ev.key.toLowerCase() === "x") && activePoints.length > 0) {
      const index = state.slotMesh.activePoint >= 0 ? state.slotMesh.activePoint : activePoints.length - 1;
      if (removePointAtIndex(activePoints, index)) {
        if (activeSet === "contour") {
          contour.triangles = [];
          contour.fillPoints = [];
          contour.fillTriangles = [];
          contour.fillManualEdges = [];
          contour.manualEdges = normalizeEdgePairs(
            contour.manualEdges
              .filter((e) => e[0] !== index && e[1] !== index)
              .map((e) => [e[0] > index ? e[0] - 1 : e[0], e[1] > index ? e[1] - 1 : e[1]]),
            contour.points.length
          );
          if (contour.points.length < 3) contour.closed = false;
        } else {
          contour.fillTriangles = reindexTrianglesAfterPointRemoved(contour.fillTriangles, index);
          contour.fillManualEdges = normalizeEdgePairs(
            contour.fillManualEdges
              .filter((e) => e[0] !== index && e[1] !== index)
              .map((e) => [e[0] > index ? e[0] - 1 : e[0], e[1] > index ? e[1] - 1 : e[1]]),
            contour.fillPoints.length
          );
          contour.fillTriangles = applyManualEdgesToTriangles(contour.fillPoints, contour.fillTriangles, contour.fillManualEdges);
        }
      }
      state.slotMesh.edgeSelection = state.slotMesh.edgeSelection
        .filter((v) => v !== index)
        .map((v) => (v > index ? v - 1 : v));
      state.slotMesh.activePoint = Math.min(state.slotMesh.activePoint, activePoints.length - 1);
      setStatus(`${activeSet === "fill" ? "Fill" : "Contour"} vertex removed (${activePoints.length}).`);
      ev.preventDefault();
      return;
    }
    if (ev.key.toLowerCase() === "l") {
      if (!linkSelectedSlotMeshEdge(true)) {
        setStatus("Select 2 vertices (Shift+Click) in the same set, then press L.");
        ev.preventDefault();
        return;
      }
      const [a0, b0] = state.slotMesh.edgeSelection;
      const a = Math.min(a0, b0);
      const b = Math.max(a0, b0);
      setStatus(`Edge linked (${activeSet}: ${a}-${b}).`);
      ev.preventDefault();
      return;
    }
    if (ev.key.toLowerCase() === "u") {
      if (!linkSelectedSlotMeshEdge(false)) {
        setStatus("Select 2 linked vertices (Shift+Click) in the same set, then press U.");
        ev.preventDefault();
        return;
      }
      const [a0, b0] = state.slotMesh.edgeSelection;
      const a = Math.min(a0, b0);
      const b = Math.max(a0, b0);
      setStatus(`Edge unlinked (${activeSet}: ${a}-${b}).`);
      ev.preventDefault();
      return;
    }
    if (ev.key.toLowerCase() === "b" && !ev.shiftKey) {
      if (!bindActiveSlotToSelectedBone()) {
        setStatus("Bind failed. Select a bone first.");
      } else {
        const s = getActiveSlot();
        setStatus(`Slot "${s ? s.name : ""}" bound to bone ${s ? s.bone : -1}.`);
      }
      ev.preventDefault();
      return;
    }
    if (ev.key.toLowerCase() === "b" && ev.shiftKey) {
      if (!bindActiveSlotWeightedToSelectedBones()) {
        setStatus("Weighted bind failed. Select one or more bones first.");
      } else {
        const s = getActiveSlot();
        setStatus(
          `Slot "${s ? s.name : ""}" weighted to bones: ${(s && s.influenceBones && s.influenceBones.join(", ")) || "(none)"}`
        );
      }
      ev.preventDefault();
      return;
    }
    if (ev.key === "Escape") {
      state.drag = null;
      state.slotMesh.activePoint = -1;
      state.slotMesh.edgeSelection = [];
      state.ikPickArmed = false;
      state.ikHoverBone = -1;
      refreshIKUI();
      ev.preventDefault();
      return;
    }
  }
  if (!state.mesh || state.editMode !== "skeleton") return;

  const key = ev.key.toLowerCase();
  if (ev.ctrlKey && key === "c") {
    copySelectedKeyframe();
    ev.preventDefault();
    return;
  }
  if (ev.ctrlKey && key === "v") {
    pasteKeyframeAtCurrentTime();
    ev.preventDefault();
    return;
  }
  if (key === "shift" && state.boneMode === "edit" && state.selectedBone >= 0) {
    state.addBoneArmed = true;
    state.addBoneDraft = null;
    els.addBoneParent.value = String(state.selectedBone);
    els.addBoneConnect.value = "true";
    els.addBoneBtn.textContent = "Cancel Add";
    setStatus(`Chain add armed from parent bone ${state.selectedBone}. Drag in canvas to set new tail.`);
    ev.preventDefault();
    return;
  }
  if (key === "g") {
    setDragTool("move_head");
    ev.preventDefault();
    return;
  }
  if (key === "t") {
    setDragTool("move_tail");
    ev.preventDefault();
    return;
  }
  if (key === "r") {
    setDragTool("rotate");
    ev.preventDefault();
    return;
  }
  if (key === "escape") {
    state.parentPickArmed = false;
    state.parentHoverBone = -1;
    state.ikPickArmed = false;
    state.ikHoverBone = -1;
    refreshIKUI();
    renderBoneTree();
    setDragTool("auto");
    ev.preventDefault();
    return;
  }
  if (key === "c") {
    toggleSelectedConnect();
    ev.preventDefault();
    return;
  }
  if (key === "b" && !ev.shiftKey) {
    if (!bindActiveSlotToSelectedBone()) {
      setStatus("Bind failed. Need active slot and selected bone.");
    } else {
      const s = getActiveSlot();
      setStatus(`Slot "${s ? s.name : ""}" bound to bone ${s ? s.bone : -1}.`);
    }
    ev.preventDefault();
    return;
  }
  if (key === "b" && ev.shiftKey) {
    if (!bindActiveSlotWeightedToSelectedBones()) {
      setStatus("Weighted bind failed. Select one or more bones first.");
    } else {
      const s = getActiveSlot();
      setStatus(`Slot "${s ? s.name : ""}" weighted to bones: ${(s && s.influenceBones && s.influenceBones.join(", ")) || "(none)"}`);
    }
    ev.preventDefault();
    return;
  }
  if (key === "a" && !ev.shiftKey) {
    toggleSelectAllBones();
    ev.preventDefault();
    return;
  }
  if ((key === "a" && ev.shiftKey) || (key === "n" && state.boneMode === "edit")) {
    state.addBoneArmed = !state.addBoneArmed;
    state.addBoneDraft = null;
    els.addBoneBtn.textContent = state.addBoneArmed ? "Cancel Add" : "Add Bone";
    setStatus(state.addBoneArmed ? "Add bone armed: drag in canvas to create." : "Add bone canceled.");
    ev.preventDefault();
    return;
  }
  if ((ev.key === "Delete" || ev.key === "Backspace") && state.boneMode === "edit") {
    deleteBone();
    ev.preventDefault();
    return;
  }
  if (key === "w" && state.boneMode === "edit") {
    if (autoWeightActiveSlot()) {
      const picked = getSelectedBonesForWeight(state.mesh);
      setStatus(
        `Auto weights updated (${state.weightMode}) on ${state.slots.length > 0 ? "active slot" : "mesh"}; bones: ${
          picked.length > 0 ? picked.join(", ") : "(slot default)"
        }.`
      );
    }
    ev.preventDefault();
    return;
  }
  if (key === "i" && state.boneMode === "pose") {
    addAutoKeyframeFromDirty();
    ev.preventDefault();
    return;
  }
  if (key === "k") {
    addAutoKeyframeFromDirty();
    ev.preventDefault();
    return;
  }
  if (ev.key === ",") {
    jumpToNeighborKey(-1);
    ev.preventDefault();
    return;
  }
  if (ev.key === ".") {
    jumpToNeighborKey(1);
    ev.preventDefault();
    return;
  }
  if (key === " ") {
    state.anim.playing = !state.anim.playing;
    state.anim.lastTs = 0;
    updatePlaybackButtons();
    ev.preventDefault();
    return;
  }
  if (key === "p" && state.boneMode === "edit") {
    state.parentPickArmed = true;
    state.parentHoverBone = -1;
    renderBoneTree();
    setStatus("Parent pick armed: click target bone in canvas.");
    ev.preventDefault();
    return;
  }
  if (ev.key === "[") {
    selectBoneDelta(-1);
    ev.preventDefault();
    return;
  }
  if (ev.key === "]") {
    selectBoneDelta(1);
    ev.preventDefault();
    return;
  }
  if (key === "1") {
    state.boneMode = "edit";
    els.boneMode.value = "edit";
    updateBoneUI();
    ev.preventDefault();
    return;
  }
  if (key === "2") {
    state.boneMode = "pose";
    els.boneMode.value = "pose";
    syncPoseFromRig(state.mesh);
    updateBoneUI();
    ev.preventDefault();
  }
});

els.overlay.addEventListener("pointerdown", (ev) => {
  if (!state.mesh) return;

  const rect = els.overlay.getBoundingClientRect();
  const dpr = els.overlay.width / rect.width;
  const mx = (ev.clientX - rect.left) * dpr;
  const my = (ev.clientY - rect.top) * dpr;
  const local = screenToLocal(mx, my);

  if (state.editMode === "slotmesh") {
    const slot = getActiveSlot();
    if (!slot) return;
    const contour = ensureSlotContour(slot);
    const hit = pickSlotContourPoint(slot, mx, my, 10);
    if (hit && hit.index >= 0) {
      state.slotMesh.activeSet = hit.set;
      state.slotMesh.activePoint = hit.index;
      if (ev.shiftKey) {
        if (state.slotMesh.edgeSelectionSet !== hit.set) {
          state.slotMesh.edgeSelection = [];
          state.slotMesh.edgeSelectionSet = hit.set;
        }
        if (state.slotMesh.edgeSelection.includes(hit.index)) {
          state.slotMesh.edgeSelection = state.slotMesh.edgeSelection.filter((v) => v !== hit.index);
        } else if (state.slotMesh.edgeSelection.length >= 2) {
          state.slotMesh.edgeSelection = [state.slotMesh.edgeSelection[1], hit.index];
        } else {
          state.slotMesh.edgeSelection.push(hit.index);
        }
        setStatus(
          `Selected ${state.slotMesh.edgeSelection.length}/2 vertex for edge link (${hit.set}). Use L to link, U to unlink.`
        );
        return;
      }
      state.slotMesh.edgeSelection = [hit.index];
      state.slotMesh.edgeSelectionSet = hit.set;
      state.drag = { type: "slot_mesh_point", pointerId: ev.pointerId, pointIndex: hit.index, pointSet: hit.set };
      els.overlay.setPointerCapture(ev.pointerId);
      return;
    }
    if (!contour.closed && contour.points.length >= 3) {
      const first = contour.points[0];
      const fs = localToScreen(first.x, first.y);
      const dx = fs.x - mx;
      const dy = fs.y - my;
      if (dx * dx + dy * dy <= 11 * 11) {
        contour.closed = true;
        contour.triangles = [];
        contour.fillPoints = [];
        contour.fillTriangles = [];
        contour.fillManualEdges = [];
        state.slotMesh.activeSet = "contour";
        state.slotMesh.activePoint = 0;
        setStatus("Contour closed. Triangulate to preview and Apply Mesh to commit.");
        return;
      }
    }
    if (contour.closed) {
      contour.closed = false;
      contour.triangles = [];
      contour.fillPoints = [];
      contour.fillTriangles = [];
      contour.fillManualEdges = [];
    }
    contour.points.push({ x: local.x, y: local.y });
    contour.manualEdges = normalizeEdgePairs(contour.manualEdges, contour.points.length);
    state.slotMesh.activeSet = "contour";
    state.slotMesh.activePoint = contour.points.length - 1;
    state.slotMesh.edgeSelection = [state.slotMesh.activePoint];
    state.slotMesh.edgeSelectionSet = "contour";
    setStatus(`Contour point added (${contour.points.length}).`);
    return;
  }

  if (state.addBoneArmed && state.editMode === "skeleton" && state.boneMode === "edit") {
    const parent = Number(els.addBoneParent.value);
    const connected = els.addBoneConnect.value === "true";
    const rigBones = state.mesh.rigBones;
    let head = { ...local };
    if (parent >= 0 && connected && rigBones[parent]) {
      const world = computeWorld(rigBones);
      head = transformPoint(world[parent], rigBones[parent].length, 0);
    }
    state.addBoneDraft = { parent, connected, head, tail: { ...local } };
    state.drag = { type: "add_bone_drag", pointerId: ev.pointerId };
    els.overlay.setPointerCapture(ev.pointerId);
    return;
  }

  if (state.editMode === "vertex") {
    const index = pickVertex(mx, my);
    if (index >= 0) {
      state.drag = { type: "vertex", index, prevX: mx, prevY: my };
      els.overlay.setPointerCapture(ev.pointerId);
    }
    return;
  }

  const hit = pickSkeletonHandle(mx, my);
  if (state.ikPickArmed && hit) {
    const c = getActiveIKConstraint();
    if (!c) {
      state.ikPickArmed = false;
      refreshIKUI();
      return;
    }
    c.target = hit.boneIndex;
    const tp = getIKSolveTargetWorld(getPoseBones(state.mesh), c);
    if (tp) {
      c.targetX = tp.x;
      c.targetY = tp.y;
    }
    state.ikPickArmed = false;
    state.ikHoverBone = -1;
    refreshIKUI();
    renderBoneTree();
    setStatus(`IK target set to bone ${hit.boneIndex}.`);
    return;
  }
  if (state.parentPickArmed && hit && state.boneMode === "edit") {
    const child = state.selectedBone;
    const parent = hit.boneIndex;
    if (child !== parent && isValidParent(state.mesh.rigBones, child, parent)) {
      state.mesh.rigBones[child].parent = parent;
      state.mesh.rigBones[child].connected = true;
      commitRigEdit(state.mesh, true);
      updateBoneUI();
      setStatus(`Parent set: bone ${child} -> ${parent}`);
    } else {
      setStatus("Invalid parent pick.");
    }
    state.parentPickArmed = false;
    state.parentHoverBone = -1;
    renderBoneTree();
    return;
  }

  if (state.dragTool !== "auto") {
    const targetBone = hit ? hit.boneIndex : state.selectedBone;
    if (targetBone >= 0) {
      state.selectedBone = targetBone;
      state.selectedBonesForWeight = [targetBone];
      updateBoneUI();
      const forcedType = state.dragTool === "move_head" ? "bone_joint" : "bone_tip";
      state.drag = { type: forcedType, boneIndex: targetBone, pointerId: ev.pointerId, needsReweight: state.boneMode === "edit" };
      els.overlay.setPointerCapture(ev.pointerId);
      return;
    }
  }

  if (hit) {
    if (ev.ctrlKey || ev.metaKey) {
      const set = new Set(getSelectedBonesForWeight(state.mesh));
      if (set.has(hit.boneIndex)) set.delete(hit.boneIndex);
      else set.add(hit.boneIndex);
      state.selectedBonesForWeight = [...set];
      state.selectedBone = hit.boneIndex;
      updateBoneUI();
      return;
    }
    state.selectedBone = hit.boneIndex;
    const selected = getSelectedBonesForWeight(state.mesh);
    // Node editing should stay responsive even under multi-select.
    // Hold Alt to move the whole selected bone set instead.
    const wantGroupMove = !!ev.altKey;
    if (!wantGroupMove || selected.length <= 1 || !selected.includes(hit.boneIndex)) {
      state.selectedBonesForWeight = [hit.boneIndex];
      updateBoneUI();
      state.drag = { ...hit, pointerId: ev.pointerId, needsReweight: state.boneMode === "edit" };
      els.overlay.setPointerCapture(ev.pointerId);
      return;
    }
    const bones = getBonesForCurrentMode(state.mesh);
    const world = computeWorld(bones);
    state.drag = {
      type: "bone_multi_move",
      pointerId: ev.pointerId,
      startLocal: local,
      needsReweight: state.boneMode === "edit",
      items: selected.map((bi) => {
        const ep = getBoneWorldEndpointsFromBones(bones, bi, world);
        return { boneIndex: bi, head: ep.head, tip: ep.tip };
      }),
    };
    els.overlay.setPointerCapture(ev.pointerId);
    updateBoneUI();
    return;
  }

  if (state.editMode === "skeleton") {
    state.drag = {
      type: "bone_marquee",
      pointerId: ev.pointerId,
      startX: mx,
      startY: my,
      curX: mx,
      curY: my,
      append: !!(ev.ctrlKey || ev.metaKey),
    };
    els.overlay.setPointerCapture(ev.pointerId);
  }
});

els.overlay.addEventListener("pointermove", (ev) => {
  if (!state.mesh) return;

  const rect = els.overlay.getBoundingClientRect();
  const dpr = els.overlay.width / rect.width;
  const mx = (ev.clientX - rect.left) * dpr;
  const my = (ev.clientY - rect.top) * dpr;
  const local = screenToLocal(mx, my);
  const m = state.mesh;
  if (!state.ikPickArmed && state.ikHoverBone !== -1) {
    state.ikHoverBone = -1;
    renderBoneTree();
  }
  if (state.ikPickArmed && !state.drag) {
    const h = pickSkeletonHandle(mx, my);
    const next = h ? h.boneIndex : -1;
    if (next !== state.ikHoverBone) {
      state.ikHoverBone = next;
      renderBoneTree();
    }
  }
  if (!state.parentPickArmed && state.parentHoverBone !== -1) {
    state.parentHoverBone = -1;
    renderBoneTree();
  }
  if (state.parentPickArmed && !state.drag) {
    const h = pickSkeletonHandle(mx, my);
    const next = h ? h.boneIndex : -1;
    if (next !== state.parentHoverBone) {
      state.parentHoverBone = next;
      renderBoneTree();
    }
  }
  if (!state.drag) return;

  if (state.drag.type === "slot_mesh_point") {
    const slot = getActiveSlot();
    if (!slot) return;
    const contour = ensureSlotContour(slot);
    const setName = state.drag.pointSet === "fill" ? "fill" : "contour";
    const points = setName === "fill" ? contour.fillPoints : contour.points;
    const i = state.drag.pointIndex;
    if (i >= 0 && i < points.length) {
      points[i] = { x: local.x, y: local.y };
      if (setName === "contour") {
        contour.triangles = [];
        contour.fillPoints = [];
        contour.fillTriangles = [];
        contour.fillManualEdges = [];
      }
      state.slotMesh.activeSet = setName;
      state.slotMesh.activePoint = i;
    }
    return;
  }

  if (state.drag.type === "add_bone_drag") {
    const local = screenToLocal(mx, my);
    if (state.addBoneDraft) {
      state.addBoneDraft.tail = { ...local };
    }
    return;
  }

  if (state.drag.type === "vertex") {
    const dx = (mx - state.drag.prevX) / state.view.scale;
    const dy = (my - state.drag.prevY) / state.view.scale;
    const i = state.drag.index;
    const offsets = getActiveOffsets(m);
    offsets[i * 2] += dx;
    offsets[i * 2 + 1] += dy;
    markDirtyTrack(VERTEX_TRACK_ID);
    state.drag.prevX = mx;
    state.drag.prevY = my;
    return;
  }

  if (state.drag.type === "bone_marquee") {
    state.drag.curX = mx;
    state.drag.curY = my;
    return;
  }

  const bones = getBonesForCurrentMode(m);
  if (state.drag.type === "bone_joint") {
    const ikDriven = moveBoneJointToLocal(bones, state.drag.boneIndex, local);
    if (!ikDriven) {
      markDirtyByBoneProp(state.drag.boneIndex, "translate");
    }
    if (state.boneMode === "edit") {
      commitRigEdit(m, false);
    }
    updateBoneUI();
    return;
  }

  if (state.drag.type === "bone_tip") {
    const ikDriven = rotateBoneTipToLocal(bones, state.drag.boneIndex, local);
    if (!ikDriven) {
      markDirtyByBoneProp(state.drag.boneIndex, "rotate");
      markDirtyByBoneProp(state.drag.boneIndex, "scale");
    }
    if (state.boneMode === "edit") {
      commitRigEdit(m, false);
    }
    updateBoneUI();
    return;
  }

  if (state.drag.type === "bone_multi_move") {
    const d = state.drag;
    const dx = local.x - d.startLocal.x;
    const dy = local.y - d.startLocal.y;
    for (const it of d.items) {
      const nh = { x: it.head.x + dx, y: it.head.y + dy };
      const nt = { x: it.tip.x + dx, y: it.tip.y + dy };
      setBoneFromWorldEndpoints(bones, it.boneIndex, nh, nt);
      markDirtyByBoneProp(it.boneIndex, "translate");
    }
    if (state.boneMode === "edit") {
      commitRigEdit(m, false);
    }
    updateBoneUI();
  }
});

function clearDrag(ev) {
  const drag = state.drag;
  const shiftHeld = !!(ev && ev.shiftKey);
  if (!state.drag) return;
  if (ev && ev.pointerId != null) {
    try {
      els.overlay.releasePointerCapture(ev.pointerId);
    } catch {
      // ignore
    }
  }
  state.drag = null;
  if (drag.type === "slot_mesh_point") {
    const slot = getActiveSlot();
    if (slot) {
      const contour = ensureSlotContour(slot);
      if (drag.pointSet === "contour") contour.triangles = [];
    }
    return;
  }
  if (drag.type === "bone_marquee") {
    const dx = drag.curX - drag.startX;
    const dy = drag.curY - drag.startY;
    if (dx * dx + dy * dy > 16) {
      selectBonesByRect(drag.startX, drag.startY, drag.curX, drag.curY, !!drag.append);
      setStatus(`Selected bones: ${state.selectedBonesForWeight.join(", ") || "(none)"}`);
    }
  }
  if (drag.type === "add_bone_drag" && state.addBoneDraft && state.mesh && state.boneMode === "edit") {
    const draft = state.addBoneDraft;
    const dx = draft.tail.x - draft.head.x;
    const dy = draft.tail.y - draft.head.y;
    let createdIdx = -1;
    if (dx * dx + dy * dy > 4) {
      createdIdx = addBone({
        parent: Number.isFinite(draft.parent) ? draft.parent : -1,
        connected: !!draft.connected,
        head: draft.head,
        tail: draft.tail,
      });
      setStatus("Bone created from canvas drag.");
    }
    state.addBoneDraft = null;
    if (shiftHeld && createdIdx >= 0) {
      state.addBoneArmed = true;
      els.addBoneParent.value = String(createdIdx);
      els.addBoneConnect.value = "true";
      els.addBoneBtn.textContent = "Cancel Add";
      setStatus(`Chain add: parent set to bone ${createdIdx}. Drag next tail.`);
    } else {
      state.addBoneArmed = false;
      els.addBoneBtn.textContent = "Add Bone";
    }
  }
  if (state.mesh && drag.type !== "vertex" && drag.needsReweight) {
    autoWeightMesh(state.mesh);
    for (const s of state.slots) {
      if (!s) continue;
      rebuildSlotWeights(s, state.mesh);
    }
  }
}

els.overlay.addEventListener("pointerup", clearDrag);
els.overlay.addEventListener("pointercancel", clearDrag);
window.addEventListener("resize", resize);

setupLeftToolTabs();
render();
state.editMode = els.editMode ? els.editMode.value || "skeleton" : "skeleton";
state.workspaceMode = state.editMode === "slotmesh" ? "slotmesh" : "rig";
state.boneMode = els.boneMode.value || "edit";
state.weightMode = els.weightMode.value || "hard";
state.anim.loop = !!els.animLoop.checked;
state.anim.snap = !!els.animSnap.checked;
state.anim.fps = Math.max(1, Number(els.animFps.value) || 30);
state.anim.timeStep = Math.max(0.001, Number(els.animTimeStep && els.animTimeStep.value) || 0.01);
state.slotViewMode = els.slotViewMode ? els.slotViewMode.value || "single" : "single";
ensureCurrentAnimation();
setAnimTime(Number(els.animTime.value) || 0);
refreshAnimationUI();
refreshSlotUI();
updateWorkspaceUI();
updatePlaybackButtons();
setStatus(
  `${hasGL ? "WebGL" : "2D fallback"} ready. Hotkeys: A select all, Shift+A add bone, Alt+drag selected bones move group, G/T/R tools, C connect, B bind slot to selected bone, Shift+B weighted bind, P parent pick, Enter triangulate contour, Shift+Click vertex select, L/U link edge, Del/X delete vertex, I key, Space play, ,/. jump keys.`
);


