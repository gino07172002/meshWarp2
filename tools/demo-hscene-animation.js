// H-scene animation: real bone hierarchy + FK + non-sinusoidal motion
// Source: D:\newExport\seethrough_output.psd
// Strategy:
//   1. Build full bone hierarchy (root → spine → chest/head/arms/hip → thighs/calves)
//   2. Bind each slot to nearest bone via slot.bone BEFORE adding bones
//      (so setSlotSingleBoneWeight gives weight=1 to the correct bone)
//   3. Animate keyframes with ease-in-out + secondary motion delays
//   4. Capture frames inside browser, encode GIF with per-frame palette
//
// Usage: node tools/demo-hscene-animation.js

const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 5400;
const SS_DIR = path.resolve(__dirname, "..", "review-screenshots");
const OUT_DIR = path.resolve(__dirname, "..", "runs");
[SS_DIR, OUT_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });
const SOURCE_PSD = "D:\\newExport\\seethrough_output.psd";

let ssIdx = 0;
const results = [];
async function ss(page, name) {
  const file = path.join(SS_DIR, `hscene-${String(++ssIdx).padStart(2, "0")}-${name}.png`);
  await page.screenshot({ path: file });
  console.log(`  📷 ${path.basename(file)}`);
}
function note(phase, ok, msg) {
  console.log(`  ${ok ? "✅" : "❌"} [${phase}] ${msg}`);
  results.push({ phase, ok, msg });
}

function startStaticServer() {
  const root = path.resolve(__dirname, "..");
  const mime = { ".html": "text/html", ".js": "application/javascript", ".css": "text/css",
    ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".wasm": "application/wasm" };
  const server = http.createServer((req, res) => {
    let p = path.join(root, req.url.split("?")[0] === "/" ? "/index.html" : req.url.split("?")[0]);
    if (!p.startsWith(root)) { res.statusCode = 403; return res.end(); }
    fs.stat(p, (err, st) => {
      if (err) { res.statusCode = 404; return res.end(); }
      if (st.isDirectory()) p = path.join(p, "index.html");
      res.setHeader("Content-Type", mime[path.extname(p).toLowerCase()] || "application/octet-stream");
      res.setHeader("Cache-Control", "no-store");
      fs.createReadStream(p).pipe(res);
    });
  });
  return new Promise(r => server.listen(PORT, "127.0.0.1", () => r(server)));
}

async function main() {
  console.log("🎬 H-Scene Animation v2: real bones + FK + ease curves\n");
  const server = await startStaticServer();
  const browser = await chromium.launch({ headless: false, slowMo: 30 });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.route("**/*.js", async route => {
    const response = await route.fetch();
    await route.fulfill({ response, headers: { ...response.headers(), "Cache-Control": "no-store" } });
  });
  const page = await ctx.newPage();
  page.on("pageerror", e => { if (!e.message.includes("WebGL")) console.warn("  ⚠", e.message.slice(0, 100)); });

  try {
    // 1. Load app
    console.log("1. Loading app...");
    await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    // 2. Import PSD
    console.log("\n2. Importing PSD...");
    await page.click('button[data-menu-trigger="file"]');
    await page.waitForSelector('.menu-panel[data-menu-panel="file"].open');
    await page.click('[data-menu-action="file.import"]');
    await page.waitForTimeout(400);
    await page.locator("input[type=file]").first().setInputFiles(SOURCE_PSD);
    await page.waitForTimeout(7000);
    await ss(page, "psd-imported");
    const slotCount = await page.evaluate(() => state.slots.length);
    note("import", slotCount >= 1, `${slotCount} slots`);

    // 3. Switch to Rig workspace
    console.log("\n3. Setting up bone hierarchy + slot bindings...");
    await page.locator("#workspaceTabRig").click();
    await page.waitForTimeout(600);

    // KEY STEP: classify slots into body parts FIRST, then build bones,
    // then assign slot.bone, then call refreshWeightsForBoneCount so each
    // slot's weights point to its correct bone (weight=1 on assigned bone).
    const rigResult = await page.evaluate(() => {
      state.boneMode = "edit";
      const W = state.imageWidth, H = state.imageHeight;

      // Classify each slot by NAME first (most reliable), then by rect position.
      const classify = (s) => {
        const r = (s.attachments && s.attachments[0] && s.attachments[0].rect) || s.rect ||
                  { x: 0, y: 0, w: W, h: H };
        const cy = r.y + r.h / 2;
        const ry = cy / H;
        const name = (s.name || "").toLowerCase().trim();

        // Head parts (face, eyes, mouth, ears, hair, headwear)
        if (/^(hair|head|face|ear|nose|mouth|eye|brow|lash|iris|irid|pupil|headwear)/.test(name)) return "head";
        if (/hair|頭|臉|耳|眼|口|嘴/.test(name)) return "head";

        // Torso/chest (topwear, dress, shirt, robe)
        if (/^(top|chest|shirt|dress|robe|cloak|cape|outfit)/.test(name)) return "chest";
        if (/上衣|胸|衣服/.test(name)) return "chest";

        // Hip/waist (skirt, belt, pants top)
        if (/^(skirt|belt|hip|waist|panty|panties|underwear|legwear)/.test(name)) return "hip";

        // Handwear / armwear / gloves — go with arms but defaults to chest if name is generic
        if (/^(hand|arm|glove|sleeve|handwear|armwear)/.test(name)) return "torso";

        // Legs (thighs, calves, boots, socks)
        if (/^(leg|thigh|calf|knee|shin|boot|sock|footwear|shoe)/.test(name)) return "leg";

        // Fallback by position
        if (ry < 0.30) return "head";
        if (ry < 0.50) return "chest";
        if (ry < 0.72) return "hip";
        return "leg";
      };

      const groups = {};
      for (let i = 0; i < state.slots.length; i++) {
        const s = state.slots[i];
        const part = classify(s);
        if (!groups[part]) groups[part] = [];
        groups[part].push(i);
      }

      // All bones placed in image-space, parent=root (flat hierarchy with
      // connected=false). This avoids enforceConnectedHeads overwriting tx/ty.
      // Each slot binds to one of these bones; animation moves the bone in
      // pose-space and the slot follows.
      const bones = state.mesh.rigBones;

      function addB(name, parentIdx, worldX, worldY, length = 50) {
        bones.push({
          name, parent: parentIdx, inherit: "normal",
          tx: worldX, ty: worldY, rot: 0, length,
          sx: 1, sy: 1, shx: 0, shy: 0,
          connected: false, // critical: prevents enforceConnectedHeads from clobbering tx/ty
          poseLenEditable: false,
          color: "",
        });
        return bones.length - 1;
      }

      const cx = W * 0.5;
      // ALL bones parent=-1 so tx/ty are absolute image-space coords in both
      // edit and runtime modes (computeWorld treats parent<0 as direct world).
      const root  = addB("root",      -1, cx,        H * 0.62, H * 0.06);
      const spine = addB("spine",     -1, cx,        H * 0.48, H * 0.10);
      const chest = addB("chest",     -1, cx,        H * 0.36, H * 0.08);
      const neck  = addB("neck",      -1, cx,        H * 0.22, H * 0.05);
      const head  = addB("head",      -1, cx,        H * 0.14, H * 0.10);
      const armL  = addB("arm_l",     -1, W * 0.28,  H * 0.34, H * 0.10);
      const faL   = addB("forearm_l", -1, W * 0.28,  H * 0.45, H * 0.10);
      const armR  = addB("arm_r",     -1, W * 0.72,  H * 0.34, H * 0.10);
      const faR   = addB("forearm_r", -1, W * 0.72,  H * 0.45, H * 0.10);
      const hip   = addB("hip",       -1, cx,        H * 0.68, H * 0.05);
      const thighL = addB("thigh_l",  -1, W * 0.42,  H * 0.78, H * 0.12);
      const calfL  = addB("calf_l",   -1, W * 0.42,  H * 0.90, H * 0.10);
      const thighR = addB("thigh_r",  -1, W * 0.58,  H * 0.78, H * 0.12);
      const calfR  = addB("calf_r",   -1, W * 0.58,  H * 0.90, H * 0.10);

      // Assign slot.bone based on classified part
      const partToBone = {
        head: head,
        chest: chest,
        torso: spine,
        arm_l: armL,
        arm_r: armR,
        hip: hip,
        leg: thighL, // both legs to thigh_l for simplicity
      };

      for (const [part, slotIndices] of Object.entries(groups)) {
        const bIdx = partToBone[part];
        if (bIdx == null) continue;
        for (const si of slotIndices) {
          state.slots[si].bone = bIdx;
        }
      }

      // Now run rebind so weights propagate (each slot gets weight=1 on its bone)
      enforceConnectedHeads(bones);
      syncPoseFromRig(state.mesh);
      syncBindPose(state.mesh);
      refreshWeightsForBoneCount();

      if (typeof updateBoneUI === "function") updateBoneUI();
      if (typeof requestRender === "function") requestRender("rig-setup");

      return {
        bones: bones.length,
        groups: Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, v.length])),
      };
    });
    await page.waitForTimeout(800);
    await ss(page, "rigged");
    note("rig", rigResult.bones >= 10, `${rigResult.bones} bones built, slots by part: ${JSON.stringify(rigResult.groups)}`);

    // Sanity check: slot 0 has non-zero weights now?
    const wcheck = await page.evaluate(() => {
      const s = state.slots[0];
      const w = s.attachments[0].meshData.weights;
      const nonZero = Array.from(w).filter(x => x > 0).length;
      return { totalW: w.length, nonZero, sample: Array.from(w.slice(0, 14)) };
    });
    note("weights", wcheck.nonZero > 0, `Slot 0 weights: ${wcheck.nonZero}/${wcheck.totalW} non-zero`);

    // Verify image is still visible (geometry not collapsed)
    const geomCheck = await page.evaluate(() => {
      const s = state.slots[0];
      const poseWorld = getSolvedPoseWorld(state.mesh);
      const geom = buildRenderableAttachmentGeometry(s, poseWorld);
      if (!geom || !geom.interleaved) return "no geom";
      const a = geom.interleaved;
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (let i = 0; i < a.length; i += 4) {
        if (a[i] < minX) minX = a[i]; if (a[i] > maxX) maxX = a[i];
        if (a[i + 1] < minY) minY = a[i + 1]; if (a[i + 1] > maxY) maxY = a[i + 1];
      }
      return { minX: Math.round(minX), maxX: Math.round(maxX), minY: Math.round(minY), maxY: Math.round(maxY), spread: Math.round(Math.max(maxX - minX, maxY - minY)) };
    });
    note("geometry", geomCheck.spread > 10, `Slot 0 screen spread: ${JSON.stringify(geomCheck)}`);

    // 4. Switch to Animate mode
    console.log("\n4. Switching to Animate mode...");
    await page.locator("#wsModeSelect").selectOption("animate");
    await page.waitForTimeout(800);
    await page.evaluate(() => {
      const prevMode = state.boneMode;
      state.boneMode = "pose";
      // Force rigCoordinateSpace to runtime BEFORE syncBindPose so invBind
      // is computed against the runtime-space bindWorld (matches POSE-mode rendering)
      state.rigCoordinateSpace = "runtime";
      if (typeof applyBoneModeTransition === "function") applyBoneModeTransition(prevMode, "pose");
      if (typeof syncPoseFromRig === "function") syncPoseFromRig(state.mesh);
      // Re-bind in runtime space so invBind matches what computeWorld produces
      if (typeof syncBindPose === "function") syncBindPose(state.mesh);
      if (typeof requestRender === "function") requestRender("anim-mode");
    });
    await page.waitForTimeout(600);
    await ss(page, "animate-mode");

    // 5. Capture frames inside browser, animating via bone pose
    console.log("\n5. Capturing 30 frames (1.25s @ 24fps) with FK + ease curves...");

    const gifBase64 = await page.evaluate(async () => {
      const FPS = 24;
      const FRAME_COUNT = 30;
      const DUR = FRAME_COUNT / FPS;
      const glCanvas = document.getElementById("glCanvas");
      const W = glCanvas.width, H = glCanvas.height;
      const work = document.createElement("canvas");
      work.width = W; work.height = H;
      const wctx = work.getContext("2d");

      const bones = state.mesh.rigBones;
      const boneByName = {};
      bones.forEach((b, i) => { boneByName[b.name] = { idx: i, baseTx: b.tx, baseTy: b.ty, baseRot: b.rot }; });

      // Pose bones is the animated copy (rigBones = bind pose; poseBones = current)
      if (!state.mesh.poseBones || state.mesh.poseBones.length !== bones.length) {
        state.mesh.poseBones = bones.map(b => ({...b}));
      }
      const pose = state.mesh.poseBones;

      // Non-sinusoidal "thrust" curve: fast strike + slow return + small overshoot
      // Returns -1..1 amplitude over 0..1 phase
      function thrustCurve(phase) {
        // Two-beat cycle: strike at 0.25 + 0.75
        // Each beat: ease-out for strike (fast deceleration), ease-in for recoil
        const beatPhase = (phase * 2) % 1; // two beats per loop
        // Strike phase 0..0.35: ease-out fast hit (cube)
        // Recoil 0.35..1: smooth return with slight overshoot
        if (beatPhase < 0.35) {
          const t = beatPhase / 0.35;
          // ease-out cubic, peak at t=1
          return 1 - Math.pow(1 - t, 3);
        } else {
          const t = (beatPhase - 0.35) / 0.65;
          // ease-in-out back to 0, slight overshoot
          const ease = 0.5 - 0.5 * Math.cos(t * Math.PI);
          return (1 - ease) - Math.sin(t * Math.PI) * 0.15;
        }
      }

      // Secondary motion: delayed by phase offset (head/chest follow-through)
      function delayedCurve(phase, delayFrac) {
        return thrustCurve((phase - delayFrac + 1) % 1);
      }

      const frames = [];

      for (let f = 0; f < FRAME_COUNT; f++) {
        const phase = f / FRAME_COUNT;

        // Primary thrust (root/hip): big amplitude
        const rootThrust = thrustCurve(phase);        // -1..1
        // Secondary: spine lags 2 frames behind
        const spineLag = delayedCurve(phase, 2 / FRAME_COUNT);
        // Tertiary: chest lags 3 frames behind
        const chestLag = delayedCurve(phase, 3 / FRAME_COUNT);
        // Head lags 4 frames
        const headLag = delayedCurve(phase, 4 / FRAME_COUNT);

        // Apply to pose bones (relative to base values)
        function setBone(name, dty, drot) {
          const info = boneByName[name];
          if (!info) return;
          pose[info.idx].tx = info.baseTx;
          pose[info.idx].ty = info.baseTy + (dty || 0);
          pose[info.idx].rot = info.baseRot + (drot || 0);
        }

        // Reset all pose bones to bind first
        for (let i = 0; i < bones.length; i++) {
          pose[i].tx = bones[i].tx;
          pose[i].ty = bones[i].ty;
          pose[i].rot = bones[i].rot;
        }

        // Root drops down on thrust (gets pushed), recoils back
        setBone("root", rootThrust * 14, rootThrust * -0.06);
        // Spine arches with delay
        setBone("spine", spineLag * 8, spineLag * 0.10);
        // Chest follows
        setBone("chest", chestLag * 5, chestLag * 0.08);
        // Head bobs forward & nods
        setBone("head", headLag * 4, headLag * 0.14);
        setBone("neck", headLag * 3, headLag * 0.08);
        // Arms react: shoulders rotate slightly (being held)
        setBone("arm_l", 0, rootThrust * 0.08);
        setBone("arm_r", 0, rootThrust * -0.08);
        // Hip absorbs impact
        setBone("hip", rootThrust * -10, 0);
        // Thighs/calves jiggle with secondary motion
        setBone("thigh_l", chestLag * 4, chestLag * -0.05);
        setBone("thigh_r", chestLag * 4, chestLag * 0.05);

        // Trigger render
        if (typeof requestRender === "function") requestRender("frame-" + f);
        // Wait two RAFs so GL actually draws
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

        // Capture
        wctx.clearRect(0, 0, W, H);
        wctx.drawImage(glCanvas, 0, 0);
        const imgData = wctx.getImageData(0, 0, W, H);
        frames.push({ data: imgData.data });
      }

      // Reset pose to bind
      for (let i = 0; i < bones.length; i++) {
        pose[i].tx = bones[i].tx;
        pose[i].ty = bones[i].ty;
        pose[i].rot = bones[i].rot;
      }
      if (typeof requestRender === "function") requestRender("reset");

      // Encode GIF
      const gifBytes = encodeGifFromImageDataFrames(frames, W, H, FPS, 0, { transparent: false });
      let binary = "";
      for (let i = 0; i < gifBytes.length; i += 8192) {
        binary += String.fromCharCode(...gifBytes.subarray(i, i + 8192));
      }
      return btoa(binary);
    }, { timeout: 180000 });

    const gifPath = path.join(OUT_DIR, "hscene_seethrough.gif");
    fs.writeFileSync(gifPath, Buffer.from(gifBase64, "base64"));
    const gSize = fs.statSync(gifPath).size;
    note("gif", gSize > 50000, `GIF: ${(gSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`\n  🎉 GIF saved: ${gifPath}`);

    await ss(page, "capture-done");

    // 6. Verify animation variance
    const gifBuf = fs.readFileSync(gifPath);
    let fCount = 0, localCTs = 0, lzwSizes = [], pos = 13;
    while (pos < gifBuf.length - 1 && fCount < 200) {
      const b = gifBuf[pos];
      if (b === 0x3B) break;
      if (b === 0x21) { pos += 2; while (pos < gifBuf.length) { const s = gifBuf[pos++]; if (s === 0) break; pos += s; } }
      else if (b === 0x2C) {
        pos++; pos += 8;
        const lp = gifBuf[pos++];
        if (lp & 0x80) { localCTs++; pos += Math.pow(2, (lp & 7) + 1) * 3; }
        pos++;
        let lzw = 0;
        while (pos < gifBuf.length) { const s = gifBuf[pos++]; if (s === 0) break; lzw += s; pos += s; }
        lzwSizes.push(lzw);
        fCount++;
      } else pos++;
    }
    const variance = Math.max(...lzwSizes) - Math.min(...lzwSizes);
    note("gif-quality", localCTs > 0 && variance > 500, `${fCount} frames, ${localCTs} local palettes, LZW variance=${variance} ${variance > 500 ? "✓" : "(low — animation may be subtle)"}`);

    // 7. Save project
    console.log("\n6. Saving project...");
    const [pDL] = await Promise.all([
      page.waitForEvent("download", { timeout: 30000 }),
      (async () => {
        await page.click('button[data-menu-trigger="file"]');
        await page.waitForSelector('.menu-panel[data-menu-panel="file"].open');
        await page.click('[data-menu-action="file.save"]');
      })(),
    ]);
    const pPath = path.join(OUT_DIR, "hscene_seethrough.json");
    await pDL.saveAs(pPath);
    note("save", fs.statSync(pPath).size > 10000, `Project: ${(fs.statSync(pPath).size / 1024 / 1024).toFixed(2)} MB`);

    // 8. Preview GIF
    console.log("\n  Previewing GIF...");
    const gifPage = await ctx.newPage();
    await gifPage.goto("file:///" + gifPath.replace(/\\/g, "/"));
    await gifPage.waitForTimeout(1500);
    for (let i = 0; i < 5; i++) {
      await gifPage.screenshot({ path: path.join(SS_DIR, `hscene-preview-${i}.png`) });
      await gifPage.waitForTimeout(300);
    }
    await gifPage.close();
    await ss(page, "final");

  } finally {
    await page.waitForTimeout(2000);
    await browser.close();
    server.close();
  }

  console.log("\n─────────────────────────────────────");
  const p = results.filter(r => r.ok).length, f = results.filter(r => !r.ok).length;
  console.log(`Results: ${p} passed, ${f} failed`);
  if (f > 0) results.filter(r => !r.ok).forEach(r => console.log(`  ❌ [${r.phase}] ${r.msg}`));
}

main().catch(err => { console.error("Fatal:", err); process.exit(1); });
