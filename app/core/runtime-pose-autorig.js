// ROLE: Pose-based auto-rig — uses BlazePose / MediaPipe to detect a
// humanoid pose in the source image, then builds an initial bone
// hierarchy from the keypoints. Cleanly extracted because it pulls in
// an external script (TF.js or MediaPipe loaders) and has its own
// closed scope (BLAZEPOSE_KP, detector promises, template builders).
// Loaded after runtime.js so it can use els/state and call into
// runtime helpers like applyHumanoidTemplateToRig dependencies.
// EXPORTS: BLAZEPOSE_KP, ensurePoseAutoRigDetector,
//   getPoseAutoRigInputSource, buildHumanoidTemplateFromPose,
//   findBestHumanoidBoneForSlot, findHumanoidAutoBindRootBoneIndex,
//   autoBindUnassignedSlotsToHumanoidBones,
//   applyHumanoidTemplateToRig, rebuildHumanoidRig,
//   handleSetupHumanoidBoneBuild, bindSetupHumanoidBoneButton.
// 2D point helpers (pointLerp, pointMid, pointAdd, pointDist,
// averagePoints, getPosePointByIndex) are private to this subsystem.

const BLAZEPOSE_KP = Object.freeze({
  nose: 0,
  left_ear: 7,
  right_ear: 8,
  mouth_left: 9,
  mouth_right: 10,
  left_shoulder: 11,
  right_shoulder: 12,
  left_elbow: 13,
  right_elbow: 14,
  left_wrist: 15,
  right_wrist: 16,
  left_pinky: 17,
  right_pinky: 18,
  left_index: 19,
  right_index: 20,
  left_thumb: 21,
  right_thumb: 22,
  left_hip: 23,
  right_hip: 24,
  left_knee: 25,
  right_knee: 26,
  left_ankle: 27,
  right_ankle: 28,
  left_heel: 29,
  right_heel: 30,
  left_foot_index: 31,
  right_foot_index: 32,
});

let poseAutoRigDepsPromise = null;
let poseAutoRigDetectorPromise = null;
let poseAutoRigDetector = null;
let poseAutoRigDetectorConfigKey = "";
let poseAutoRigRuntimeInfo = null;
let poseAutoRigBusy = false;

function loadExternalScriptOnce(url) {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error("Invalid script url."));
      return;
    }
    const existing = [...document.querySelectorAll("script[src]")].find((s) => String(s.src || "") === url || String(s.getAttribute("src") || "") === url);
    if (existing) {
      if (existing.dataset.loaded === "1") {
        resolve();
        return;
      }
      const looksReady =
        (url.includes("pose-detection") && !!window.poseDetection) ||
        (url.includes("tfjs") && !!window.tf);
      if (looksReady) {
        existing.dataset.loaded = "1";
        resolve();
        return;
      }
      existing.addEventListener("load", () => {
        existing.dataset.loaded = "1";
        resolve();
      }, { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed to load script: ${url}`)), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = url;
    script.async = false;
    script.defer = false;
    script.dataset.poseAutoRig = "1";
    script.addEventListener("load", () => {
      script.dataset.loaded = "1";
      resolve();
    }, { once: true });
    script.addEventListener("error", () => reject(new Error(`Failed to load script: ${url}`)), { once: true });
    document.head.appendChild(script);
  });
}

async function ensurePoseAutoRigRuntime() {
  if (poseAutoRigRuntimeInfo) return poseAutoRigRuntimeInfo;
  if (!poseAutoRigDepsPromise) {
    poseAutoRigDepsPromise = (async () => {
      const errors = [];
      for (const candidate of POSE_AUTO_RIG_RUNTIME_CANDIDATES) {
        try {
          for (const url of candidate.scriptUrls) {
            await loadExternalScriptOnce(url);
          }
          if (!window.poseDetection) throw new Error("pose-detection library is unavailable.");
          if (candidate.runtime === "mediapipe") {
            const hasPoseCtor = typeof window.Pose === "function" || !!(window.pose && typeof window.pose.Pose === "function");
            if (!hasPoseCtor) throw new Error("MediaPipe Pose runtime is unavailable.");
            if (!window.tf) throw new Error("TensorFlow.js runtime is unavailable.");
            poseAutoRigRuntimeInfo = candidate;
            return candidate;
          }
          if (!window.tf) throw new Error("TensorFlow.js runtime is unavailable.");
          if (typeof window.tf.ready === "function") {
            try {
              if (typeof window.tf.setBackend === "function") {
                try {
                  await window.tf.setBackend("webgl");
                } catch {
                  // Keep default backend.
                }
              }
              await window.tf.ready();
            } catch {
              // Continue; detector init will report final failure if runtime is still invalid.
            }
          }
          poseAutoRigRuntimeInfo = candidate;
          return candidate;
        } catch (err) {
          errors.push(`${candidate.label}: ${(err && err.message) || "unknown error"}`);
        }
      }
      throw new Error(
        `Pose runtime is unavailable. Tried local vendor files and CDN fallbacks. ${errors.join(" | ")}`
      );
    })().catch((err) => {
      poseAutoRigDepsPromise = null;
      poseAutoRigRuntimeInfo = null;
      throw err;
    });
  }
  return poseAutoRigDepsPromise;
}

async function ensurePoseAutoRigDetector(options = null) {
  const opts = options && typeof options === "object" ? options : {};
  const smoothing = opts.smoothing !== false;
  const runtimeInfo = await ensurePoseAutoRigRuntime();
  const runtimeKey = runtimeInfo && runtimeInfo.key ? runtimeInfo.key : "unknown";
  const detectorKey = `${runtimeKey}:smooth:${smoothing ? 1 : 0}`;
  if (poseAutoRigDetector && poseAutoRigDetectorConfigKey === detectorKey) return poseAutoRigDetector;
  if (poseAutoRigDetector && poseAutoRigDetectorConfigKey !== detectorKey) {
    try {
      if (typeof poseAutoRigDetector.dispose === "function") poseAutoRigDetector.dispose();
    } catch {
      // ignore dispose errors
    }
    poseAutoRigDetector = null;
    poseAutoRigDetectorPromise = null;
    poseAutoRigDetectorConfigKey = "";
  }
  await ensurePoseAutoRigRuntime();
  if (!poseAutoRigDetectorPromise) {
    poseAutoRigDetectorPromise = (async () => {
      const pd = window.poseDetection;
      if (!pd || !pd.SupportedModels || !pd.SupportedModels.BlazePose) {
        throw new Error("BlazePose runtime not found.");
      }
      const config = runtimeInfo && runtimeInfo.runtime === "mediapipe"
        ? {
          runtime: "mediapipe",
          enableSmoothing: smoothing,
          modelType: "heavy",
          solutionPath: runtimeInfo.solutionPath,
        }
        : {
          runtime: "tfjs",
          enableSmoothing: smoothing,
          modelType: "heavy",
        };
      const detector = await pd.createDetector(pd.SupportedModels.BlazePose, config);
      poseAutoRigDetector = detector;
      poseAutoRigDetectorConfigKey = detectorKey;
      return detector;
    })().catch((err) => {
      poseAutoRigDetectorPromise = null;
      throw err;
    });
  }
  return poseAutoRigDetectorPromise;
}

function getPoseAutoRigInputSource(sourceModeRaw = null) {
  const sourceMode = sanitizePoseAutoRigSourceMode(
    sourceModeRaw == null ? (state.poseAutoRig && state.poseAutoRig.sourceMode) : sourceModeRaw
  );
  const allowProject = sourceMode === "auto" || sourceMode === "project";
  const allowSlot = sourceMode === "auto" || sourceMode === "active_slot";
  if (allowProject && state.sourceCanvas && state.imageWidth > 0 && state.imageHeight > 0) {
    return {
      source: state.sourceCanvas,
      mapPoint: (p) => ({ x: Number(p.x) || 0, y: Number(p.y) || 0 }),
      docW: state.imageWidth,
      docH: state.imageHeight,
    };
  }
  if (!allowSlot) return null;
  const slot = getActiveSlot() || state.slots.find((s) => !!getSlotCanvas(s));
  if (!slot || !(getActiveAttachment(slot) || {}).canvas) return null;
  const rect = (getActiveAttachment(slot) || {}).rect || { x: 0, y: 0, w: (getActiveAttachment(slot) || {}).canvas.width, h: (getActiveAttachment(slot) || {}).canvas.height };
  const rw = Math.max(1, Number(rect.w) || (getActiveAttachment(slot) || {}).canvas.width || 1);
  const rh = Math.max(1, Number(rect.h) || (getActiveAttachment(slot) || {}).canvas.height || 1);
  const sx = rw / Math.max(1, Number((getActiveAttachment(slot) || {}).canvas.width) || 1);
  const sy = rh / Math.max(1, Number((getActiveAttachment(slot) || {}).canvas.height) || 1);
  return {
    source: (getActiveAttachment(slot) || {}).canvas,
    mapPoint: (p) => ({
      x: (Number(rect.x) || 0) + (Number(p.x) || 0) * sx,
      y: (Number(rect.y) || 0) + (Number(p.y) || 0) * sy,
    }),
    docW: Math.max(1, Number(state.imageWidth) || rw),
    docH: Math.max(1, Number(state.imageHeight) || rh),
  };
}

function pointLerp(a, b, t) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function pointMid(a, b) {
  return { x: (a.x + b.x) * 0.5, y: (a.y + b.y) * 0.5 };
}

function pointAdd(a, vx, vy, scale = 1) {
  return { x: a.x + vx * scale, y: a.y + vy * scale };
}

function pointDist(a, b) {
  return Math.hypot((b.x || 0) - (a.x || 0), (b.y || 0) - (a.y || 0));
}

function normalizeVec(dx, dy, fallbackX = 1, fallbackY = 0) {
  const len = Math.hypot(dx, dy);
  if (len <= 1e-6) {
    const fLen = Math.hypot(fallbackX, fallbackY) || 1;
    return { x: fallbackX / fLen, y: fallbackY / fLen };
  }
  return { x: dx / len, y: dy / len };
}

function averagePoints(points) {
  let sx = 0;
  let sy = 0;
  let count = 0;
  for (const p of Array.isArray(points) ? points : []) {
    if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y)) continue;
    sx += p.x;
    sy += p.y;
    count += 1;
  }
  if (count <= 0) return null;
  return { x: sx / count, y: sy / count };
}

function getPosePointByIndex(pose, idx, mapPoint, minScore = 0.2) {
  const list = Array.isArray(pose && pose.keypoints) ? pose.keypoints : [];
  const kp = list[idx];
  if (!kp) return null;
  const score = Number(kp.score);
  if (Number.isFinite(score) && score < minScore) return null;
  const x = Number(kp.x);
  const y = Number(kp.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  const mapped = typeof mapPoint === "function" ? mapPoint({ x, y }) : { x, y };
  if (!mapped || !Number.isFinite(mapped.x) || !Number.isFinite(mapped.y)) return null;
  return { x: mapped.x, y: mapped.y };
}

function buildHumanoidTemplateFromPose(pose, mapPoint, docW, docH, options = null) {
  const opts = options && typeof options === "object" ? options : {};
  const minScore = sanitizePoseAutoRigMinScore(opts.minScore);
  const allowFallback = opts.allowFallback !== false;
  const p = (idx) => getPosePointByIndex(pose, idx, mapPoint, minScore);
  const pick = (primary, fallback) => (primary ? primary : allowFallback ? fallback : null);
  const lShoulder = p(BLAZEPOSE_KP.left_shoulder);
  const rShoulder = p(BLAZEPOSE_KP.right_shoulder);
  const lHip = p(BLAZEPOSE_KP.left_hip);
  const rHip = p(BLAZEPOSE_KP.right_hip);
  if (!lShoulder || !rShoulder || !lHip || !rHip) return null;

  const shoulderMid = pointMid(lShoulder, rShoulder);
  const hipMid = pointMid(lHip, rHip);
  const torsoVec = normalizeVec(shoulderMid.x - hipMid.x, shoulderMid.y - hipMid.y, 0, -1);
  const down = { x: -torsoVec.x, y: -torsoVec.y };
  const sideRight = { x: -torsoVec.y, y: torsoVec.x };
  const sideLeft = { x: -sideRight.x, y: -sideRight.y };
  const shoulderWidth = Math.max(8, pointDist(lShoulder, rShoulder));
  const torsoLen = Math.max(16, pointDist(hipMid, shoulderMid));

  const spine0Tip = pointLerp(hipMid, shoulderMid, 1 / 3);
  const spine1Tip = pointLerp(hipMid, shoulderMid, 2 / 3);
  const spine2Tip = { x: shoulderMid.x, y: shoulderMid.y };

  const headRef =
    p(BLAZEPOSE_KP.nose) ||
    averagePoints([p(BLAZEPOSE_KP.left_ear), p(BLAZEPOSE_KP.right_ear)]) ||
    averagePoints([p(BLAZEPOSE_KP.mouth_left), p(BLAZEPOSE_KP.mouth_right)]) ||
    (allowFallback ? pointAdd(spine2Tip, torsoVec.x, torsoVec.y, torsoLen * 0.35) : null);
  if (!headRef) return null;
  const neckTip = pointLerp(spine2Tip, headRef, 0.38);
  const headDir = normalizeVec(headRef.x - neckTip.x, headRef.y - neckTip.y, torsoVec.x, torsoVec.y);
  const headLen = Math.max(18, shoulderWidth * 0.42, torsoLen * 0.24);
  const headTip = pointAdd(neckTip, headDir.x, headDir.y, headLen);

  const lElbow = pick(p(BLAZEPOSE_KP.left_elbow), pointAdd(lShoulder, sideLeft.x + down.x * 0.4, sideLeft.y + down.y * 0.4, shoulderWidth * 0.5));
  const lWrist = lElbow ? pick(p(BLAZEPOSE_KP.left_wrist), pointAdd(lElbow, sideLeft.x + down.x * 0.25, sideLeft.y + down.y * 0.25, shoulderWidth * 0.55)) : null;
  if (!lElbow || !lWrist) return null;
  const lHandRef = averagePoints([p(BLAZEPOSE_KP.left_pinky), p(BLAZEPOSE_KP.left_index), p(BLAZEPOSE_KP.left_thumb)]);
  const lForeDir = normalizeVec(lWrist.x - lElbow.x, lWrist.y - lElbow.y, sideLeft.x, sideLeft.y);
  const lHand = lHandRef || (allowFallback ? pointAdd(lWrist, lForeDir.x, lForeDir.y, Math.max(12, shoulderWidth * 0.22)) : null);
  if (!lHand) return null;

  const rElbow = pick(p(BLAZEPOSE_KP.right_elbow), pointAdd(rShoulder, sideRight.x + down.x * 0.4, sideRight.y + down.y * 0.4, shoulderWidth * 0.5));
  const rWrist = rElbow ? pick(p(BLAZEPOSE_KP.right_wrist), pointAdd(rElbow, sideRight.x + down.x * 0.25, sideRight.y + down.y * 0.25, shoulderWidth * 0.55)) : null;
  if (!rElbow || !rWrist) return null;
  const rHandRef = averagePoints([p(BLAZEPOSE_KP.right_pinky), p(BLAZEPOSE_KP.right_index), p(BLAZEPOSE_KP.right_thumb)]);
  const rForeDir = normalizeVec(rWrist.x - rElbow.x, rWrist.y - rElbow.y, sideRight.x, sideRight.y);
  const rHand = rHandRef || (allowFallback ? pointAdd(rWrist, rForeDir.x, rForeDir.y, Math.max(12, shoulderWidth * 0.22)) : null);
  if (!rHand) return null;

  const lKnee = pick(p(BLAZEPOSE_KP.left_knee), pointAdd(lHip, down.x, down.y, torsoLen * 0.58));
  const lAnkle = lKnee ? pick(p(BLAZEPOSE_KP.left_ankle), pointAdd(lKnee, down.x, down.y, torsoLen * 0.55)) : null;
  if (!lKnee || !lAnkle) return null;
  const lToe = p(BLAZEPOSE_KP.left_foot_index);
  const lHeel = p(BLAZEPOSE_KP.left_heel);
  const lFoot =
    lToe ||
    (lHeel
      ? pointAdd(lHeel, sideLeft.x, sideLeft.y, Math.max(12, shoulderWidth * 0.2))
      : allowFallback
        ? pointAdd(lAnkle, sideLeft.x + down.x * 0.08, sideLeft.y + down.y * 0.08, Math.max(12, shoulderWidth * 0.2))
        : null);
  if (!lFoot) return null;

  const rKnee = pick(p(BLAZEPOSE_KP.right_knee), pointAdd(rHip, down.x, down.y, torsoLen * 0.58));
  const rAnkle = rKnee ? pick(p(BLAZEPOSE_KP.right_ankle), pointAdd(rKnee, down.x, down.y, torsoLen * 0.55)) : null;
  if (!rKnee || !rAnkle) return null;
  const rToe = p(BLAZEPOSE_KP.right_foot_index);
  const rHeel = p(BLAZEPOSE_KP.right_heel);
  const rFoot =
    rToe ||
    (rHeel
      ? pointAdd(rHeel, sideRight.x, sideRight.y, Math.max(12, shoulderWidth * 0.2))
      : allowFallback
        ? pointAdd(rAnkle, sideRight.x + down.x * 0.08, sideRight.y + down.y * 0.08, Math.max(12, shoulderWidth * 0.2))
        : null);
  if (!rFoot) return null;

  const cx = Math.max(1, Number(docW) || 1) * 0.5;
  const cy = Math.max(1, Number(docH) || 1) * 0.5;
  const safe = (pt, fallback = { x: cx, y: cy }) => ({
    x: Number.isFinite(pt && pt.x) ? pt.x : fallback.x,
    y: Number.isFinite(pt && pt.y) ? pt.y : fallback.y,
  });

  const rootHead = safe(hipMid);
  const rootTip = pointAdd(rootHead, down.x, down.y, Math.max(10, torsoLen * 0.08));

  return [
    { name: "root", parent: -1, connected: false, head: rootHead, tip: rootTip },
    { name: "hips", parent: 0, connected: false, head: safe(hipMid), tip: safe(spine0Tip) },
    { name: "spine_1", parent: 1, connected: true, head: safe(spine0Tip), tip: safe(spine1Tip) },
    { name: "spine_2", parent: 2, connected: true, head: safe(spine1Tip), tip: safe(spine2Tip) },
    { name: "neck", parent: 3, connected: true, head: safe(spine2Tip), tip: safe(neckTip) },
    { name: "head", parent: 4, connected: true, head: safe(neckTip), tip: safe(headTip) },
    { name: "shoulder_l", parent: 3, connected: true, head: safe(spine2Tip), tip: safe(lShoulder) },
    { name: "upper_arm_l", parent: 6, connected: true, head: safe(lShoulder), tip: safe(lElbow) },
    { name: "lower_arm_l", parent: 7, connected: true, head: safe(lElbow), tip: safe(lWrist) },
    { name: "hand_l", parent: 8, connected: true, head: safe(lWrist), tip: safe(lHand) },
    { name: "shoulder_r", parent: 3, connected: true, head: safe(spine2Tip), tip: safe(rShoulder) },
    { name: "upper_arm_r", parent: 10, connected: true, head: safe(rShoulder), tip: safe(rElbow) },
    { name: "lower_arm_r", parent: 11, connected: true, head: safe(rElbow), tip: safe(rWrist) },
    { name: "hand_r", parent: 12, connected: true, head: safe(rWrist), tip: safe(rHand) },
    { name: "upper_leg_l", parent: 1, connected: false, head: safe(lHip), tip: safe(lKnee) },
    { name: "lower_leg_l", parent: 14, connected: true, head: safe(lKnee), tip: safe(lAnkle) },
    { name: "foot_l", parent: 15, connected: true, head: safe(lAnkle), tip: safe(lFoot) },
    { name: "upper_leg_r", parent: 1, connected: false, head: safe(rHip), tip: safe(rKnee) },
    { name: "lower_leg_r", parent: 17, connected: true, head: safe(rKnee), tip: safe(rAnkle) },
    { name: "foot_r", parent: 18, connected: true, head: safe(rAnkle), tip: safe(rFoot) },
  ];
}

function getSlotDocumentCenter(slot) {
  if (!slot) return null;
  if ((getActiveAttachment(slot) || {}).rect) {
    const x = Number((getActiveAttachment(slot) || {}).rect.x);
    const y = Number((getActiveAttachment(slot) || {}).rect.y);
    const w = Number((getActiveAttachment(slot) || {}).rect.w);
    const h = Number((getActiveAttachment(slot) || {}).rect.h);
    if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(w) && Number.isFinite(h)) {
      return { x: x + w * 0.5, y: y + h * 0.5 };
    }
  }
  const canvas = (getActiveAttachment(slot) || {}).canvas;
  const w = canvas ? Number(canvas.width) || 0 : 0;
  const h = canvas ? Number(canvas.height) || 0 : 0;
  return {
    x: (Number(slot.tx) || 0) + w * 0.5,
    y: (Number(slot.ty) || 0) + h * 0.5,
  };
}

function findBestHumanoidBoneForSlot(slot, bones) {
  if (!slot || !Array.isArray(bones) || bones.length === 0) return -1;
  const center = getSlotDocumentCenter(slot);
  if (!center) return -1;
  let bestIndex = -1;
  let bestDist = Infinity;
  for (let i = 0; i < bones.length; i += 1) {
    const ep = getBoneWorldEndpointsFromBones(bones, i);
    if (!ep || !ep.head || !ep.tip) continue;
    const dist = pointToSegmentDistanceSquared(
      Number(center.x) || 0,
      Number(center.y) || 0,
      Number(ep.head.x) || 0,
      Number(ep.head.y) || 0,
      Number(ep.tip.x) || 0,
      Number(ep.tip.y) || 0
    );
    if (dist < bestDist) {
      bestDist = dist;
      bestIndex = i;
    }
  }
  return bestIndex;
}

function findHumanoidAutoBindRootBoneIndex(bones) {
  if (!Array.isArray(bones) || bones.length === 0) return -1;
  const namedRoot = bones.findIndex((b) => {
    if (!b) return false;
    const name = String(b.name || "").trim().toLowerCase();
    return name === "root" && Number(b.parent) < 0;
  });
  if (namedRoot >= 0) return namedRoot;
  const firstRoot = bones.findIndex((b) => Number(b && b.parent) < 0);
  if (firstRoot >= 0) return firstRoot;
  return 0;
}

function autoBindUnassignedSlotsToHumanoidBones(m) {
  if (!m || !Array.isArray(m.rigBones) || m.rigBones.length === 0) return 0;
  const rootBone = findHumanoidAutoBindRootBoneIndex(m.rigBones);
  let bound = 0;
  for (const slot of state.slots) {
    if (!slot || getSlotTreeBoneIndex(slot, m) !== -1) continue;
    const targetBone =
      Number.isFinite(rootBone) && rootBone >= 0
        ? rootBone
        : findBestHumanoidBoneForSlot(slot, m.rigBones);
    if (!Number.isFinite(targetBone) || targetBone < 0) continue;
    if (!applySlotBoneAssignment(slot, targetBone, m)) continue;
    bound += 1;
  }
  return bound;
}

function applyHumanoidTemplateToRig(m, template, width, height) {
  if (!m || !Array.isArray(template) || template.length <= 0) return { ok: false, reason: "template" };
  const replaced = Array.isArray(m.rigBones) ? m.rigBones.length : 0;
  m.rigBones = [];
  state.boneTreeSelectedSlotByBone = Object.create(null);
  state.boneTreeSelectedUnassignedSlotIds = [];
  state.selectedBone = -1;
  state.selectedBonesForWeight = [];

  for (let i = 0; i < template.length; i += 1) {
    const spec = template[i] || {};
    const safeParent = Number.isFinite(spec.parent) && spec.parent >= 0 && spec.parent < m.rigBones.length ? spec.parent : -1;
    const connected = !!spec.connected && safeParent >= 0;
    m.rigBones.push({
      name: String(spec.name || `bone_${i}`),
      parent: safeParent,
      inherit: "normal",
      tx: 0,
      ty: 0,
      rot: 0,
      length: 32,
      sx: 1,
      sy: 1,
      shx: 0,
      shy: 0,
      connected,
      poseLenEditable: false,
    });
    const parentTip =
      safeParent >= 0 ? getBoneWorldEndpointsFromBones(m.rigBones, safeParent).tip : { x: width * 0.5, y: height * 0.5 };
    const head =
      connected
        ? parentTip
        : {
          x: Number(spec.head && spec.head.x),
          y: Number(spec.head && spec.head.y),
        };
    if (!Number.isFinite(head.x) || !Number.isFinite(head.y)) {
      head.x = parentTip.x;
      head.y = parentTip.y;
    }
    const tip = {
      x: Number(spec.tip && spec.tip.x),
      y: Number(spec.tip && spec.tip.y),
    };
    if (!Number.isFinite(tip.x) || !Number.isFinite(tip.y)) {
      tip.x = head.x + Math.max(1, Number(m.rigBones[i].length) || 1);
      tip.y = head.y;
    }
    setBoneFromWorldEndpoints(m.rigBones, i, head, tip);
  }

  enforceConnectedHeads(m.rigBones);
  ensureSlotsHaveBoneBinding();
  const autoBoundSlots = autoBindUnassignedSlotsToHumanoidBones(m);
  syncPoseFromRig(m);
  syncBindPose(m);
  refreshWeightsForBoneCount();
  state.selectedBone = m.rigBones.length > 0 ? 0 : -1;
  state.selectedBonesForWeight = state.selectedBone >= 0 ? [state.selectedBone] : [];
  updateBoneUI();
  pushUndoCheckpoint(true);
  return { ok: true, count: m.rigBones.length, replaced, autoBoundSlots };
}

async function rebuildHumanoidRig(options = null) {
  const opts = options && typeof options === "object" ? options : readPoseAutoRigOptionsFromUI();
  const m = state.mesh;
  if (!m || state.boneMode !== "edit") return { ok: false, reason: "mode" };
  const source = getPoseAutoRigInputSource(opts.sourceMode);
  if (!source || !source.source) return { ok: false, reason: "source" };
  const detector = await ensurePoseAutoRigDetector(opts);
  const poses = await detector.estimatePoses(source.source, { maxPoses: 1, flipHorizontal: false });
  if (!Array.isArray(poses) || poses.length <= 0) return { ok: false, reason: "no_pose" };
  const best = poses[0];
  const docW = Math.max(1, Number(source.docW) || Number(state.imageWidth) || 256);
  const docH = Math.max(1, Number(source.docH) || Number(state.imageHeight) || 256);
  const template = buildHumanoidTemplateFromPose(best, source.mapPoint, docW, docH, opts);
  if (!template || template.length <= 0) {
    return { ok: false, reason: opts.allowFallback === false ? "pose_incomplete_no_fallback" : "pose_incomplete" };
  }
  return applyHumanoidTemplateToRig(m, template, docW, docH);
}

async function handleSetupHumanoidBoneBuild() {
  if (poseAutoRigBusy) {
    setStatus("Humanoid bone: pose detection is already running...");
    return;
  }
  if (!state.mesh || state.boneMode !== "edit") {
    setStatus("Switch to Skeleton/Edit mode to build humanoid bones.");
    return;
  }
  const existing = Array.isArray(state.mesh.rigBones) ? state.mesh.rigBones.length : 0;
  if (existing > 0 && !window.confirm(`Replace current rig bones (${existing}) with detected humanoid bones?`)) {
    setStatus("Humanoid bone generation canceled.");
    return;
  }
  const opts = readPoseAutoRigOptionsFromUI();
  poseAutoRigBusy = true;
  setStatus("Humanoid bone: running BlazePose Heavy detection...");
  try {
    const result = await rebuildHumanoidRig(opts);
    if (!result.ok) {
      if (result.reason === "source") {
        if (opts.sourceMode === "project") setStatus("Humanoid bone failed: project image source unavailable. Switch source to Auto or Active Slot.");
        else if (opts.sourceMode === "active_slot") setStatus("Humanoid bone failed: active slot source unavailable.");
        else setStatus("Humanoid bone failed: no source image to detect. Import image first.");
      }
      else if (result.reason === "no_pose") setStatus("Humanoid bone failed: no clear human pose detected in image.");
      else if (result.reason === "pose_incomplete_no_fallback") setStatus("Humanoid bone failed: missing required keypoints (fallback disabled).");
      else if (result.reason === "pose_incomplete") setStatus("Humanoid bone failed: pose keypoints are incomplete.");
      else setStatus("Humanoid bone generation failed.");
      return;
    }
    const replacedText = result.replaced > 0 ? `, replaced ${result.replaced}` : "";
    const autoBindText = result.autoBoundSlots > 0 ? `, auto-bound ${result.autoBoundSlots} staging slot(s)` : "";
    setStatus(`Humanoid bone generated from pose: ${result.count} bones${replacedText}${autoBindText}.`);
  } catch (err) {
    setStatus(`Humanoid bone failed: ${(err && err.message) || "unknown error"}`);
  } finally {
    poseAutoRigBusy = false;
  }
}

function bindSetupHumanoidBoneButton() {
  const btn = document.getElementById("setupHumanoidBoneBtn");
  if (!btn) return;
  els.setupHumanoidBoneBtn = btn;
}
