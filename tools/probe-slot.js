"use strict";
const { chromium } = require("playwright");
const fs = require("fs");

(async () => {
  const dataUrl = "data:image/jpeg;base64," + fs.readFileSync("D:/newExport/1e60b72e-7f69-4564-927e-7c8fcd4ae19a.jpg").toString("base64");
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  await page.goto("http://localhost:5273/index.html", { waitUntil: "load" });
  await page.waitForFunction(() => window.ai && window.ai.__installed, { timeout: 15000 });
  await page.evaluate(async (du) => { await window.ai.invoke("ai.import_image", { dataUrl: du, name: "p.jpg" }); }, dataUrl);
  await page.waitForTimeout(800);

  // Build single root, bind slot, render, then read GL canvas pixel at center.
  const probe = await page.evaluate(() => {
    state.boneMode = "edit";
    const m = state.mesh;
    if (m.rigBones.length === 0) { addBone(); }
    m.rigBones[0].tx = state.imageWidth * 0.5;
    m.rigBones[0].ty = state.imageHeight * 0.5;
    for (const s of state.slots) s.bone = 0;
    if (typeof setWorkspace === "function") setWorkspace("animate");
    state.boneMode = "pose";
    syncPoseFromRig(m);
    requestRender("probe");
    return null;
  });
  await page.waitForTimeout(1500);

  // Grab pixel sample from glCanvas
  const sample = await page.evaluate(() => {
    const c = document.getElementById("glCanvas");
    const w = c.width, h = c.height;
    // Pixel at center
    const t2 = document.createElement("canvas");
    t2.width = w; t2.height = h;
    const tc = t2.getContext("2d");
    tc.drawImage(c, 0, 0);
    const cx = Math.floor(w / 2), cy = Math.floor(h / 2);
    const px = tc.getImageData(cx, cy, 1, 1).data;
    // Stats: count non-zero alpha pixels & mean alpha
    const all = tc.getImageData(0, 0, w, h).data;
    let nonZero = 0, sumA = 0, sumR = 0, count = w * h;
    for (let i = 0; i < all.length; i += 4) {
      if (all[i + 3] > 0) nonZero += 1;
      sumA += all[i + 3];
      sumR += all[i];
    }
    return {
      w, h,
      centerRGBA: [px[0], px[1], px[2], px[3]],
      nonZeroPixels: nonZero,
      pctOpaque: ((nonZero / count) * 100).toFixed(1) + "%",
      meanA: (sumA / count).toFixed(1),
      meanR: (sumR / count).toFixed(1),
    };
  });
  console.log("sample:", sample);

  await page.screenshot({ path: "D:/newExport/probe-fullpage.png" });
  // also extract just the glCanvas region
  const box = await page.evaluate(() => {
    const c = document.getElementById("glCanvas");
    const r = c.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  });
  await page.screenshot({ path: "D:/newExport/probe-glcanvas.png", clip: { x: Math.max(0, box.x), y: Math.max(0, box.y), width: Math.min(1600, box.w), height: Math.min(1000, box.h) } });
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
