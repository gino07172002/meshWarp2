// Discover ai bridge tools and DOM hooks needed for end-to-end export.
"use strict";
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  const logs = [];
  page.on("console", (m) => logs.push(`[${m.type()}] ${m.text()}`));
  page.on("pageerror", (e) => logs.push(`[err] ${e.message}`));
  page.on("requestfailed", (r) => logs.push(`[reqfail] ${r.url()} -- ${r.failure() && r.failure().errorText}`));
  page.on("response", (r) => { if (!r.ok()) logs.push(`[resp ${r.status()}] ${r.url()}`); });

  await page.goto("http://localhost:5273/index.html", { waitUntil: "load" });
  console.log("URL:", page.url());
  const content = await page.content();
  console.log("CONTENT HEAD (300 chars):", content.slice(0, 300));
  console.log("CONTENT contains 'runtime-els':", content.includes("runtime-els"));
  await page.waitForTimeout(3000);
  try {
    await page.waitForFunction(() => window.ai && window.ai.__installed, { timeout: 10000 });
  } catch (e) {
    console.log("ai bridge did not install in time");
  }

  // dump first 80 of all console + script readiness
  const scriptCheck = await page.evaluate(() => ({
    scripts: Array.from(document.scripts).map(s => s.src.replace(location.origin, "")).filter(Boolean),
    hasEls: typeof window.els !== "undefined",
    hasState: typeof window.state !== "undefined",
    hasAi: typeof window.ai !== "undefined",
    glCanvas: !!document.getElementById("glCanvas"),
    bodyChildCount: document.body.children.length,
  }));
  console.log("SCRIPT CHECK", JSON.stringify(scriptCheck, null, 2));

  const info = await page.evaluate(() => {
    if (!window.ai) return { error: "window.ai is undefined", haveState: !!window.state };
    const list = window.ai.tools();
    const tools = list.map((t) => t.id).sort();
    const byDomain = {};
    for (const t of tools) {
      const dom = t.split(".")[0];
      (byDomain[dom] = byDomain[dom] || []).push(t);
    }
    return {
      version: window.ai.version,
      domains: Object.keys(byDomain).sort(),
      tools,
      meshIds: Object.keys(window.state || {}),
      hasExportModal: !!document.getElementById("exportAnimModalWrap"),
      hasExportBtn: !!document.getElementById("exportAnimModalBtn"),
      glCanvasSize: (() => {
        const c = document.getElementById("glCanvas");
        return c ? { w: c.width, h: c.height } : null;
      })(),
    };
  });

  console.log(JSON.stringify(info, null, 2));
  console.log("--- recent console ---");
  console.log(logs.slice(-20).join("\n"));
  await browser.close();
})().catch((e) => { console.error("FAIL", e); process.exit(1); });
