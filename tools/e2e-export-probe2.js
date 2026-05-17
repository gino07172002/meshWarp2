"use strict";
const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  page.on("pageerror", (e) => console.error("[pageerror]", e.message));
  await page.goto("http://localhost:5273/index.html", { waitUntil: "load" });
  await page.waitForTimeout(2000);
  await page.waitForFunction(() => window.ai && window.ai.__installed, { timeout: 10000 });

  const probe = await page.evaluate(() => {
    const reachable = {
      stateVar: typeof state !== "undefined",
      meshVar: typeof state !== "undefined" ? !!state.mesh : null,
      addBoneFn: typeof addBone,
      createAnimFn: typeof createAnimation,
      setAnimTimeFn: typeof setAnimTime,
      addOrUpdateKeyframeAtCurrentTimeFn: typeof addOrUpdateKeyframeAtCurrentTime,
      pushUndoCheckpointFn: typeof pushUndoCheckpoint,
      requestRenderFn: typeof requestRender,
      getCurrentAnimationFn: typeof getCurrentAnimation,
      slotCount: typeof state !== "undefined" ? (state.slots || []).length : null,
      boneCount: typeof state !== "undefined" && state.mesh ? (state.mesh.bones || []).length : null,
      boneMode: typeof state !== "undefined" ? state.boneMode : null,
    };
    return reachable;
  });
  console.log(JSON.stringify(probe, null, 2));
  await browser.close();
})().catch((e) => { console.error("FAIL", e); process.exit(1); });
