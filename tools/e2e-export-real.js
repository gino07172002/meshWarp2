// End-to-end Playwright run: opens the editor, imports the user-provided
// portrait, builds a 2-bone idle rig (sway + breathe), and exports the
// animation to GIF / WebM / PNG-sequence ZIP / animated WebP. Output goes
// to D:/newExport/.
//
// Run with:  node tools/e2e-export-real.js
"use strict";

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const SOURCE_IMAGE = "D:/newExport/1e60b72e-7f69-4564-927e-7c8fcd4ae19a.jpg";
const OUTPUT_DIR = "D:/newExport";

function loadImageAsDataUrl(file) {
  const buf = fs.readFileSync(file);
  const ext = path.extname(file).toLowerCase();
  const mime = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : ext === ".png" ? "image/png" : "application/octet-stream";
  return `data:${mime};base64,${buf.toString("base64")}`;
}

function parseGifFrameCount(buf) {
  const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  if (u8.length < 13) return { error: "too small" };
  const magic = String.fromCharCode(u8[0], u8[1], u8[2], u8[3], u8[4], u8[5]);
  const sw = u8[6] | (u8[7] << 8);
  const sh = u8[8] | (u8[9] << 8);
  let pos = 13;
  if (u8[10] & 0x80) pos += 3 * (1 << ((u8[10] & 0x07) + 1));
  let frames = 0;
  while (pos < u8.length) {
    const tag = u8[pos++];
    if (tag === 0x3b) break;
    if (tag === 0x21) {
      pos += 1;
      while (pos < u8.length) {
        const n = u8[pos++];
        if (n === 0) break;
        pos += n;
      }
      continue;
    }
    if (tag === 0x2c) {
      frames += 1;
      pos += 8;
      const packed = u8[pos++];
      if (packed & 0x80) pos += 3 * (1 << ((packed & 0x07) + 1));
      pos += 1;
      while (pos < u8.length) {
        const n = u8[pos++];
        if (n === 0) break;
        pos += n;
      }
      continue;
    }
    return { magic, width: sw, height: sh, frames, error: `unknown block 0x${tag.toString(16)} @ ${pos - 1}` };
  }
  return { magic, width: sw, height: sh, frames };
}

(async () => {
  if (!fs.existsSync(SOURCE_IMAGE)) {
    console.error("source image not found:", SOURCE_IMAGE);
    process.exit(1);
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const dataUrl = loadImageAsDataUrl(SOURCE_IMAGE);
  console.log(`source: ${SOURCE_IMAGE}  (${(fs.statSync(SOURCE_IMAGE).size / 1024).toFixed(1)} KB)`);

  const browser = await chromium.launch({
    headless: false, // need real GL — headless Chromium often falls back
  });
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => { errors.push(e.message); console.error("[pageerror]", e.message); });
  page.on("console", (m) => {
    const txt = m.text();
    if (m.type() === "error") console.error("[browser err]", txt);
  });

  // Capture downloads.
  const downloads = {};
  ctx.on("page", (p) => p.on("download", () => {}));
  page.on("download", async (dl) => {
    const suggested = dl.suggestedFilename();
    const dest = path.join(OUTPUT_DIR, suggested);
    await dl.saveAs(dest);
    downloads[suggested] = dest;
    console.log(`  saved download: ${suggested} -> ${dest}`);
  });

  await page.goto("http://localhost:5273/index.html", { waitUntil: "load" });
  await page.waitForFunction(() => window.ai && window.ai.__installed, { timeout: 15000 });
  await page.waitForTimeout(500);

  // -- Import source image --------------------------------------------------
  console.log("step 1: import source portrait");
  const imp = await page.evaluate(async (du) => {
    const r = await window.ai.invoke("ai.import_image", { dataUrl: du, name: "portrait.jpg" });
    return { ok: r.ok, error: r.error, result: r.result };
  }, dataUrl);
  console.log("  import result:", JSON.stringify(imp).slice(0, 200));
  if (!imp.ok) throw new Error("import_image failed: " + imp.error);
  await page.waitForTimeout(500);

  // -- Build rig & animation directly via project globals -------------------
  console.log("step 2: build 2-bone rig + idle animation");
  const rigInfo = await page.evaluate(() => {
    // Switch to Rig workspace so bone edits are valid.
    if (typeof setWorkspace === "function") setWorkspace("rig");
    state.boneMode = "edit";

    const diagnostic = { steps: [] };

    diagnostic.steps.push({ has_mesh: !!state.mesh, has_addBone: typeof addBone, boneMode: state.boneMode, imageW: state.imageWidth, imageH: state.imageHeight });

    if (!state.mesh) {
      diagnostic.steps.push("mesh-null-after-import");
      return diagnostic;
    }
    const m = state.mesh;
    const bones = typeof getRigBones === "function" ? getRigBones(m) : (m.bones || []);
    diagnostic.steps.push({ bonesBefore: bones.length });

    // Single root bone anchored at the image CENTER. Slot follows this bone,
    // so rotate/scale will pivot about the center rather than throwing the
    // image off-canvas.
    bones.length = 0;
    state.selectedBone = -1;
    addBone();
    if (bones.length < 1) return diagnostic;
    bones[0].name = "root";
    bones[0].tx = state.imageWidth * 0.5;
    bones[0].ty = state.imageHeight * 0.5;  // center
    bones[0].rot = 0;
    bones[0].length = Math.round(Math.min(state.imageWidth, state.imageHeight) * 0.4);
    diagnostic.steps.push({ root: { ...bones[0] } });

    // Bind every slot to the root bone so the image follows it.
    for (const s of state.slots) s.bone = 0;

    // Mark dirty + render.
    if (typeof refreshSlotUI === "function") refreshSlotUI();
    if (typeof renderBoneTree === "function") renderBoneTree();
    if (typeof requestRender === "function") requestRender();
    pushUndoCheckpoint(true);

    // Switch to Animate workspace and create animation.
    if (typeof setWorkspace === "function") setWorkspace("animate");
    const anim = createAnimation("idle");
    anim.duration = 1.0;
    anim.rangeStart = 0;
    anim.rangeEnd = 1.0;
    if (Array.isArray(state.anim.animations)) {
      state.anim.currentAnimId = anim.id;
    }

    // Make sure the slot canvas remembers its image rect; some import paths
    // leave att.rect undefined which makes the region quad degenerate.
    for (const slot of state.slots) {
      const att = getActiveAttachment(slot);
      if (att && (!att.rect || !att.rect.w || !att.rect.h) && att.canvas) {
        att.rect = { x: 0, y: 0, w: att.canvas.width, h: att.canvas.height };
      }
    }
    diagnostic.bones = bones.map((b, i) => ({ i, name: b.name, parent: b.parent, rot: b.rot, len: b.length, sx: b.sx, sy: b.sy }));
    diagnostic.slotCount = state.slots.length;
    diagnostic.animId = anim.id;
    diagnostic.animDuration = anim.duration;
    return diagnostic;
  });
  console.log("  rig:", JSON.stringify(rigInfo));

  // -- Add keyframes via setAnimTime + direct property mutation + addOrUpdateKeyframe
  console.log("step 3: add keyframes (rotate sway + scale breathe)");
  const keyResult = await page.evaluate(async (animIdFromStep2) => {
    const m = state.mesh;
    const rootIdx = 0;

    // Re-establish current animation: step 2's anim id may have been
    // unset by later setWorkspace calls. Pick by id, then fall back to
    // first animation, then create one.
    let anim = (state.anim.animations || []).find((a) => String(a.id) === String(animIdFromStep2));
    if (!anim && (state.anim.animations || []).length > 0) anim = state.anim.animations[0];
    if (!anim) anim = createAnimation("idle");
    state.anim.currentAnimId = anim.id;

    // Write keyframes directly into anim.tracks with the schema that
    // getTrackValueFromBones / setTrackValueToBones expect:
    //   rotate -> Number
    //   scaleX -> Number  (multiplier on rest sx)
    //   scaleY -> Number
    function pushKey(tid, time, value) {
      anim.tracks = anim.tracks || {};
      anim.tracks[tid] = anim.tracks[tid] || [];
      const keys = anim.tracks[tid];
      const existing = keys.findIndex((k) => Math.abs(k.time - time) < 1e-4);
      const kf = {
        id: `k_${Math.random().toString(36).slice(2, 8)}`,
        time,
        value,
        interp: "linear",
      };
      if (existing >= 0) keys[existing] = kf; else keys.push(kf);
      keys.sort((a, b) => a.time - b.time);
    }

    const rotTrack = `bone:${rootIdx}:rotate`;
    const sxTrack = `bone:${rootIdx}:scaleX`;
    const syTrack = `bone:${rootIdx}:scaleY`;

    // Idle: subtle sway around the image center + gentle breathe scale.
    pushKey(rotTrack, 0.00, -4);
    pushKey(rotTrack, 0.25,  0);
    pushKey(rotTrack, 0.50, +4);
    pushKey(rotTrack, 0.75,  0);
    pushKey(rotTrack, 1.00, -4);

    pushKey(sxTrack, 0.00, 0.97);
    pushKey(sxTrack, 0.50, 1.03);
    pushKey(sxTrack, 1.00, 0.97);

    pushKey(syTrack, 0.00, 0.97);
    pushKey(syTrack, 0.50, 1.03);
    pushKey(syTrack, 1.00, 0.97);

    // Force duration to 1.0s and active range to match.
    anim.duration = 1.0;
    anim.rangeStart = 0;
    anim.rangeEnd = 1.0;
    if (typeof normalizeAnimationRecord === "function") normalizeAnimationRecord(anim);

    // Switch to pose/animate mode so render samples poseBones (the path
    // affected by samplePoseAtTime), not rigBones at edit time.
    state.boneMode = "pose";
    if (typeof syncPoseFromRig === "function") syncPoseFromRig(m);
    setAnimTime(0);
    samplePoseAtTime(m, 0);
    if (typeof requestRender === "function") requestRender("e2e-setup");
    pushUndoCheckpoint(true);

    const populatedTracks = Object.entries(anim.tracks || {}).filter(([, v]) => v.length > 0);
    if (typeof refreshAnimationUI === "function") refreshAnimationUI();
    return {
      animId: anim.id,
      animDuration: anim.duration,
      animRange: { start: anim.rangeStart, end: anim.rangeEnd },
      tracks: populatedTracks.map(([k]) => k),
      keyframeCounts: Object.fromEntries(populatedTracks.map(([k, v]) => [k, v.length])),
      sampleValues: Object.fromEntries(populatedTracks.map(([k, v]) => [k, v.map((kf) => ({ t: kf.time, v: kf.value }))])),
    };
  }, rigInfo.animId);
  console.log("  keys:", JSON.stringify(keyResult));

  // -- Configure export modal preset and run each format --------------------
  async function runExport(format, label) {
    console.log(`step 4.${label}: export as ${format}`);
    const meta = await page.evaluate((fmt) => {
      // Find the animation that actually has keyframes — there may be more
      // than one in state.anim.animations from earlier createAnimation calls.
      const animWithKeys = (state.anim.animations || []).find((a) => {
        const tracks = a.tracks || {};
        return Object.values(tracks).some((v) => Array.isArray(v) && v.length > 0);
      }) || (state.anim.animations || [])[0];
      if (animWithKeys) {
        state.anim.currentAnimId = animWithKeys.id;
        animWithKeys.duration = 1.0;
        animWithKeys.rangeStart = 0;
        animWithKeys.rangeEnd = 1.0;
      }
      state.anim.exportModal = {
        format: fmt,
        fps: 24,
        scale: 1,
        width: 0,
        height: 0,
        lockAspect: true,
        // Force opaque dark-grey background so the rendered portrait is
        // visible in the exported files (transparent canvas readback from
        // GL came out almost-fully transparent in this rig).
        bgTransparent: false,
        bgColor: "#222831",
        loopCount: 0,
        prefix: `portrait_${fmt}`,
        zipPng: true,
        animIds: animWithKeys ? [String(animWithKeys.id)] : [],
      };
      const btn = document.getElementById("exportAnimModalBtn") || document.getElementById("exportAnimDockBtn");
      btn.click();
      const list = document.getElementById("exportAnimList");
      if (list && animWithKeys) {
        for (const opt of list.options) opt.selected = String(opt.value) === String(animWithKeys.id);
      }
      return {
        selected: list ? Array.from(list.selectedOptions).map((o) => o.value) : null,
        animId: animWithKeys && animWithKeys.id,
        duration: animWithKeys && animWithKeys.duration,
      };
    }, format);
    console.log(`  modal opened, selected anims:`, meta.selected);

    // Click Run.
    await page.click("#exportAnimRunBtn");

    // Wait for download (~per frame work). Timeout 60s.
    const expectedExt = format === "pngseq" ? "zip" : format === "webp" ? "webp" : format;
    await page.waitForFunction(
      (ext) => {
        // Any new file with that extension recorded by our download listener?
        return true; // Polled via Node side downloads dict
      },
      expectedExt,
      { timeout: 1000 },
    ).catch(() => {});

    // Poll Node-side downloads dict
    const deadline = Date.now() + 120000;
    while (Date.now() < deadline) {
      const found = Object.keys(downloads).find((n) => n.startsWith(`portrait_${format}`));
      if (found) {
        // Close modal
        await page.evaluate(() => {
          const wrap = document.getElementById("exportAnimModalWrap");
          if (wrap) wrap.classList.add("collapsed");
        });
        return downloads[found];
      }
      await page.waitForTimeout(500);
    }
    throw new Error(`timeout waiting for ${format} download`);
  }

  const out = {};
  out.gif    = await runExport("gif", "1");
  out.webm   = await runExport("webm", "2");
  out.pngseq = await runExport("pngseq", "3");
  out.webp   = await runExport("webp", "4");

  console.log("\n=== Results ===");
  for (const [fmt, file] of Object.entries(out)) {
    const sz = fs.statSync(file).size;
    let extra = "";
    if (fmt === "gif") {
      const meta = parseGifFrameCount(fs.readFileSync(file));
      extra = ` magic=${meta.magic} ${meta.width}x${meta.height} frames=${meta.frames}${meta.error ? " err=" + meta.error : ""}`;
    }
    console.log(`  ${fmt.padEnd(7)} ${(sz / 1024).toFixed(1).padStart(8)} KB  ${file}${extra}`);
  }

  await browser.close();
  if (errors.length) {
    console.error("\nPageErrors encountered:");
    for (const e of errors) console.error("  " + e);
  }
})().catch((e) => { console.error("FATAL", e); process.exit(1); });
