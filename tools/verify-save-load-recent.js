// Verify: save/load + recent projects feature (post-codex-review fixes)
// Covers:
//   - Happy path: load/save/recent/MRU/remove
//   - Fix 1: failed load (no embedded images) must NOT appear in Recent
//   - Fix 2: Recent payloads stored in IndexedDB, localStorage has metadata only
//   - Fix 3: Loading from Recent promotes entry to top (MRU)
// Usage: node tools/verify-save-load-recent.js

const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 5300;
const SS_DIR = path.resolve(__dirname, "..", "review-screenshots");
if (!fs.existsSync(SS_DIR)) fs.mkdirSync(SS_DIR, { recursive: true });

let ssIdx = 0;
const log = [];

async function ss(page, name) {
  const file = path.join(SS_DIR, `saveload-${String(++ssIdx).padStart(2, "0")}-${name}.png`);
  await page.screenshot({ path: file });
  console.log(`  📷 ${path.basename(file)}`);
  return file;
}

function note(phase, ok, msg) {
  const icon = ok ? "✅" : "❌";
  console.log(`  ${icon} [${phase}] ${msg}`);
  log.push({ phase, ok, msg });
}

function startStaticServer() {
  const root = path.resolve(__dirname, "..");
  const types = { ".html": "text/html", ".js": "application/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".wasm": "application/wasm" };
  const server = http.createServer((req, res) => {
    let p = path.join(root, req.url.split("?")[0] === "/" ? "/index.html" : req.url.split("?")[0]);
    if (!p.startsWith(root)) { res.statusCode = 403; return res.end(); }
    fs.stat(p, (err, st) => {
      if (err) { res.statusCode = 404; return res.end(); }
      if (st.isDirectory()) p = path.join(p, "index.html");
      const ext = path.extname(p).toLowerCase();
      res.setHeader("Content-Type", types[ext] || "application/octet-stream");
      fs.createReadStream(p).pipe(res);
    });
  });
  return new Promise((r) => server.listen(PORT, "127.0.0.1", () => r(server)));
}

async function openFileMenu(page) {
  await page.keyboard.press("Escape");
  await page.waitForTimeout(150);
  await page.click('button[data-menu-trigger="file"]');
  await page.waitForSelector('.menu-panel[data-menu-panel="file"].open', { timeout: 5000 });
}

async function hoverRecent(page) {
  await page.hover("#recentProjectsItem");
  await page.waitForSelector("#recentProjectsSubmenu", { state: "visible", timeout: 5000 });
  await page.waitForTimeout(250);
}

async function closeMenu(page) {
  await page.keyboard.press("Escape");
  await page.waitForTimeout(150);
}

async function main() {
  console.log("🚀 verify-save-load-recent.js (post-review)\n");
  const server = await startStaticServer();
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const pageErrors = [];

  try {
    const page = await ctx.newPage();
    page.on("pageerror", (err) => pageErrors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") pageErrors.push(`[console.error] ${msg.text()}`);
    });

    // ── 1. App startup ────────────────────────────────────────────────
    console.log("1. App startup...");
    await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await ss(page, "app-loaded");
    note("startup", (await page.title()).length > 0, `Title: "${await page.title()}"`);
    const startupErrors = pageErrors.filter(e => !e.includes("WebGL") && !e.includes("webgl"));
    note("startup", startupErrors.length === 0, startupErrors.length === 0 ? "No JS errors" : startupErrors[0]);

    // Generate valid test PNG in browser
    const pngDataUrl = await page.evaluate(() => {
      const c = document.createElement("canvas");
      c.width = 64; c.height = 64;
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#3388ff"; ctx.fillRect(0, 0, 64, 64);
      ctx.fillStyle = "#ffffff"; ctx.fillRect(16, 16, 32, 32);
      return c.toDataURL("image/png");
    });
    note("setup", pngDataUrl.startsWith("data:image/png;base64,"), `Test PNG generated (${pngDataUrl.length} chars)`);

    // ── 2. UI structure ───────────────────────────────────────────────
    console.log("\n2. File menu + Recent Projects UI...");
    await openFileMenu(page);
    await ss(page, "file-menu");
    note("ui", await page.isVisible('#recentProjectsItem'), "Recent Projects item in File menu");
    await hoverRecent(page);
    await ss(page, "recent-empty");
    note("ui", await page.isVisible("#recentProjectsSubmenu"), "Submenu visible on hover");
    note("ui", await page.isVisible("#recentProjectsEmpty"), "Empty state shown initially");
    await closeMenu(page);

    // ── 3. Load valid project ─────────────────────────────────────────
    console.log("\n3. Loading valid project (with embedded image)...");
    const validProject = {
      projectVersion: 2, imageWidth: 64, imageHeight: 64,
      slotImages: [pngDataUrl],
      slots: [{ name: "slot-a", id: "s1", attachmentName: "main", placeholderName: "main",
        activeAttachment: "main", attachments: [{ name: "main", placeholder: "main", type: "region", imageIndex: 0 }],
        imageIndex: 0, visible: true, editorVisible: true, alpha: 1, r: 1, g: 1, b: 1, blend: "normal",
        tx: 0, ty: 0, rot: 0, rect: { x: 0, y: 0, w: 64, h: 64 }, docWidth: 64, docHeight: 64 }],
      activeSlot: 0, gridX: 8, gridY: 8, animations: [],
    };
    const validFile = path.join(SS_DIR, "_valid_project.json");
    fs.writeFileSync(validFile, JSON.stringify(validProject));
    await page.locator("#projectLoadInput").setInputFiles(validFile);
    await page.waitForTimeout(2500);
    await ss(page, "after-valid-load");

    const statusEl = page.locator("#statusBar, .status-bar, [id*='status'], .status").first();
    const st1 = await statusEl.textContent().catch(() => "");
    const loadOk = st1.includes("loaded") && !st1.includes("failed");
    note("load", loadOk, `Status: "${st1.trim().slice(0, 80)}"`);
    const slots1 = await page.evaluate(() => typeof state !== "undefined" && Array.isArray(state.slots) ? state.slots.length : -1);
    note("load", slots1 >= 1, `Slots in state: ${slots1}`);

    // Fix 2: localStorage must contain metadata only (no project key)
    const localMeta = await page.evaluate(() => {
      const raw = localStorage.getItem("mesh_deformer_recent_v1");
      if (!raw) return null;
      const list = JSON.parse(raw);
      return list;
    });
    note("fix2-idb", localMeta !== null && localMeta.length >= 1, `localStorage has ${localMeta?.length ?? 0} metadata entries`);
    if (localMeta && localMeta.length >= 1) {
      const hasNoPayload = !Object.prototype.hasOwnProperty.call(localMeta[0], "project");
      note("fix2-idb", hasNoPayload, hasNoPayload
        ? "localStorage entry has NO 'project' field (metadata only ✓)"
        : "localStorage entry STILL has 'project' field (quota risk ✗)");
      const hasId = typeof localMeta[0].id === "string" && localMeta[0].id.length > 0;
      note("fix2-idb", hasId, `Entry has id: "${localMeta[0]?.id}"`);
    }

    // Verify IDB has the payload
    const idbHasPayload = await page.evaluate(async () => {
      return new Promise((resolve) => {
        const req = indexedDB.open("mesh_deformer_db", 1);
        req.onsuccess = (ev) => {
          const db = ev.target.result;
          if (!db.objectStoreNames.contains("recent_payloads")) { resolve(false); return; }
          const tx = db.transaction("recent_payloads", "readonly");
          const countReq = tx.objectStore("recent_payloads").count();
          countReq.onsuccess = () => resolve(countReq.result > 0);
          countReq.onerror = () => resolve(false);
        };
        req.onerror = () => resolve(false);
      });
    });
    note("fix2-idb", idbHasPayload, idbHasPayload ? "IndexedDB recent_payloads has entries" : "IndexedDB has NO entries");

    // ── 4. Recent menu shows entry ────────────────────────────────────
    console.log("\n4. Recent Projects menu after valid load...");
    await openFileMenu(page);
    await hoverRecent(page);
    await ss(page, "recent-entry");
    note("ui", !(await page.isVisible("#recentProjectsEmpty")), "Empty state hidden");
    const rows = await page.locator(".menu-recent-row").count();
    note("ui", rows >= 1, `Recent rows: ${rows}`);
    if (rows >= 1) {
      note("ui", (await page.locator(".menu-recent-name").first().textContent()).length > 0, `Name: "${await page.locator(".menu-recent-name").first().textContent()}"`);
      note("ui", (await page.locator(".menu-recent-meta").first().textContent()).includes("slot"), `Meta has 'slot'`);
    }
    await closeMenu(page);

    // ── 5. FIX 1: Failed load must NOT add to Recent ──────────────────
    console.log("\n5. [Fix 1] Failed load must NOT add to Recent...");
    const beforeFailCount = (await page.evaluate(() => {
      const raw = localStorage.getItem("mesh_deformer_recent_v1");
      return raw ? JSON.parse(raw).length : 0;
    }));

    // Load a project with no slotImages and no existing canvas
    // Force fresh state first
    page.once("dialog", d => d.accept());
    await openFileMenu(page);
    page.once("dialog", d => d.accept());
    await page.click('[data-menu-action="file.new"]');
    await page.waitForTimeout(600);

    const noImagesProject = { projectVersion: 2, imageWidth: 64, imageHeight: 64, slotImages: [], slots: [], activeSlot: 0, animations: [] };
    const noImgFile = path.join(SS_DIR, "_no_images_project.json");
    fs.writeFileSync(noImgFile, JSON.stringify(noImagesProject));
    await page.locator("#projectLoadInput").setInputFiles(noImgFile);
    await page.waitForTimeout(1500);
    await ss(page, "after-failed-load");

    const stFail = await statusEl.textContent().catch(() => "");
    note("fix1-guard", stFail.toLowerCase().includes("no embedded") || stFail.toLowerCase().includes("import"), `Status shows failure: "${stFail.trim().slice(0, 80)}"`);

    const afterFailCount = await page.evaluate(() => {
      const raw = localStorage.getItem("mesh_deformer_recent_v1");
      return raw ? JSON.parse(raw).length : 0;
    });
    note("fix1-guard", afterFailCount <= beforeFailCount,
      afterFailCount <= beforeFailCount
        ? `Recent count unchanged after failed load: ${afterFailCount}`
        : `Recent count GREW from ${beforeFailCount} to ${afterFailCount} (failed load was saved!)`);

    // ── 6. Save project ───────────────────────────────────────────────
    console.log("\n6. Save Project...");
    // Reload valid project first
    await page.locator("#projectLoadInput").setInputFiles(validFile);
    await page.waitForTimeout(2500);

    const [dl] = await Promise.all([
      page.waitForEvent("download", { timeout: 10000 }),
      (async () => {
        await openFileMenu(page);
        await page.click('[data-menu-action="file.save"]');
      })(),
    ]);
    const dlName = dl.suggestedFilename();
    note("save", dlName.endsWith(".json") && dlName.includes("mesh_deformer_project"), `Downloaded: "${dlName}"`);
    const savedPath = path.join(SS_DIR, "_saved.json");
    await dl.saveAs(savedPath);
    const saved = JSON.parse(fs.readFileSync(savedPath, "utf8"));
    note("save", saved.projectVersion === 2 && Array.isArray(saved.slots) && saved.slots.length >= 1, `Saved: v${saved.projectVersion}, ${saved.slots?.length} slots`);
    note("save", Array.isArray(saved.slotImages) && saved.slotImages[0]?.startsWith("data:image/png"), `Saved slotImages valid`);
    await page.waitForTimeout(500);
    await ss(page, "after-save");

    // ── 7. MRU: load older entry → it should become #1 ───────────────
    console.log("\n7. [Fix 3] MRU promotion: loading older entry moves it to top...");
    // We now have 2 entries: validFile (older) and saved file (newer)
    const metaBefore = await page.evaluate(() => {
      const raw = localStorage.getItem("mesh_deformer_recent_v1");
      return raw ? JSON.parse(raw) : [];
    });
    note("mru", metaBefore.length >= 2, `Have ${metaBefore.length} entries for MRU test (need ≥ 2)`);

    if (metaBefore.length >= 2) {
      const olderName = metaBefore[1].name; // second entry = older
      // New project to clear state
      page.once("dialog", d => d.accept());
      await openFileMenu(page);
      page.once("dialog", d => d.accept());
      await page.click('[data-menu-action="file.new"]');
      await page.waitForTimeout(600);

      // Open recent menu and click the second (older) entry
      await openFileMenu(page);
      await hoverRecent(page);
      await ss(page, "mru-before");
      const secondBtn = page.locator(".menu-recent-item").nth(1);
      const secondVisible = await secondBtn.isVisible();
      note("mru", secondVisible, `Second recent entry visible: "${olderName}"`);

      if (secondVisible) {
        await secondBtn.click();
        await page.waitForTimeout(2500);
        await ss(page, "mru-after-load");

        const metaAfter = await page.evaluate(() => {
          const raw = localStorage.getItem("mesh_deformer_recent_v1");
          return raw ? JSON.parse(raw) : [];
        });
        note("mru", metaAfter.length >= 2, `Still have ${metaAfter.length} entries after MRU load`);
        note("mru", metaAfter[0]?.name === olderName,
          metaAfter[0]?.name === olderName
            ? `Older entry "${olderName}" promoted to #1 ✓`
            : `Top entry is "${metaAfter[0]?.name}" (expected "${olderName}") ✗`);
      }
    }

    // ── 8. Load from Recent (happy path) ─────────────────────────────
    console.log("\n8. Load from Recent Projects (happy path)...");
    page.once("dialog", d => d.accept());
    await openFileMenu(page);
    page.once("dialog", d => d.accept());
    await page.click('[data-menu-action="file.new"]');
    await page.waitForTimeout(600);
    note("recent-load", (await page.evaluate(() => typeof state !== "undefined" && Array.isArray(state.slots) ? state.slots.length : -1)) === 0, "State cleared after New Project");

    await openFileMenu(page);
    await hoverRecent(page);
    await ss(page, "before-recent-click");
    const firstBtn = page.locator(".menu-recent-item").first();
    if (await firstBtn.isVisible()) {
      await firstBtn.click();
      await page.waitForTimeout(2500);
      await ss(page, "after-recent-click");
      const stRecent = await statusEl.textContent().catch(() => "");
      note("recent-load", stRecent.includes("loaded") && !stRecent.includes("failed"), `Status: "${stRecent.trim().slice(0, 80)}"`);
      const slotsRecent = await page.evaluate(() => typeof state !== "undefined" && Array.isArray(state.slots) ? state.slots.length : -1);
      note("recent-load", slotsRecent >= 1, `Slots restored: ${slotsRecent}`);
    } else {
      note("recent-load", false, "No recent entry to click");
    }

    // ── 9. Remove entry ───────────────────────────────────────────────
    console.log("\n9. Remove from Recent...");
    await openFileMenu(page);
    await hoverRecent(page);
    const countBefore = await page.locator(".menu-recent-row").count();
    note("remove", countBefore >= 1, `Entries before remove: ${countBefore}`);

    if (countBefore >= 1) {
      const lsBefore = await page.evaluate(() => JSON.parse(localStorage.getItem("mesh_deformer_recent_v1") || "[]").length);
      await page.locator(".menu-recent-remove").first().click();
      await page.waitForTimeout(300);
      await ss(page, "after-remove");
      const lsAfter = await page.evaluate(() => JSON.parse(localStorage.getItem("mesh_deformer_recent_v1") || "[]").length);
      note("remove", lsAfter < lsBefore, `localStorage: ${lsBefore} → ${lsAfter}`);

      // Reopen to verify UI
      await openFileMenu(page);
      await hoverRecent(page);
      await ss(page, "after-remove-ui");
      const countAfter = await page.locator(".menu-recent-row").count();
      note("remove", countAfter < countBefore, `UI rows: ${countBefore} → ${countAfter}`);
      await closeMenu(page);
    }

    // ── 10. No JS errors ──────────────────────────────────────────────
    const lateErrors = pageErrors.filter(e => !e.includes("WebGL") && !e.includes("webgl") && !e.includes("quota"));
    note("final", lateErrors.length === 0,
      lateErrors.length === 0 ? "No JS errors throughout" : `JS errors: ${lateErrors.slice(0, 3).join(" | ")}`);

  } finally {
    await browser.close();
    server.close();
    for (const f of ["_valid_project.json", "_no_images_project.json", "_saved.json"]) {
      try { fs.unlinkSync(path.join(SS_DIR, f)); } catch {}
    }
  }

  // Summary
  console.log("\n─────────────────────────────────────");
  const passed = log.filter(l => l.ok).length;
  const failed = log.filter(l => !l.ok).length;
  console.log(`Results: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) {
    console.log("Failed checks:");
    log.filter(l => !l.ok).forEach(l => console.log(`  ❌ [${l.phase}] ${l.msg}`));
  }
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => { console.error("Fatal:", err); process.exit(1); });
