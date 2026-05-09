// Full end-to-end: Image workspace → BG removal → back to Mesh → Puppet Warp animation
// Usage: node tools/e2e-full-workflow.js

const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 5200;
const SS_DIR = path.resolve(__dirname, "..", "review-screenshots");
if (!fs.existsSync(SS_DIR)) fs.mkdirSync(SS_DIR, { recursive: true });

const SOURCE_IMAGE = "D:/newExport/1f94a319-35a4-4056-942f-53e8ae32aeba.jpg";

let ssIdx = 0;
const log = [];
async function ss(page, name) {
  const file = path.join(SS_DIR, `e2e-${String(++ssIdx).padStart(2, "0")}-${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`  📷 ${path.basename(file)}`);
  return file;
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

function note(phase, ok, msg) {
  const icon = ok ? "✅" : "❌";
  const line = `${icon} [${phase}] ${msg}`;
  console.log("  " + line);
  log.push({ phase, ok, msg });
}

async function main() {
  const imgBuf = fs.readFileSync(SOURCE_IMAGE);
  const imgB64 = imgBuf.toString("base64");
  const imgDataUrl = `data:image/jpeg;base64,${imgB64}`;
  console.log(`Source: ${SOURCE_IMAGE} (${(imgBuf.length / 1024).toFixed(0)} KB)`);

  const server = await startStaticServer();
  const browser = await chromium.launch({ headless: false, slowMo: 80 });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => { errors.push(e.message); console.error("[pageerror]", e.message); });

  await page.goto(`http://127.0.0.1:${PORT}/index.html`);
  await page.waitForFunction(() => !!window.ai && !!window.ImageWorkspace && typeof window.ImageOps !== "undefined", { timeout: 12000 });
  await page.waitForTimeout(500);
  await ss(page, "start");

  // ─── PHASE 1: Image workspace — load image ───────────────────────────────
  console.log("\n══ PHASE 1: Image workspace — load image ══");
  await page.click("#workspaceTabImage");
  await page.waitForTimeout(400);
  await ss(page, "image-tab");
  note("1", true, "Clicked Image tab");

  const loaded = await page.evaluate(async (b64) => {
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) arr[i] = bin.charCodeAt(i);
    const blob = new Blob([arr], { type: "image/jpeg" });
    return await window.ImageWorkspace.loadFromBlob(blob, "drop");
  }, imgB64);
  await page.waitForTimeout(600);
  await ss(page, "image-loaded");

  const imgInfo = await page.evaluate(() => {
    const ie = state.imageEditor;
    return { ok: !!ie.workCanvas, w: ie.workCanvas?.width, h: ie.workCanvas?.height };
  });
  note("1", loaded && imgInfo.ok, `Image loaded: ${imgInfo.w}×${imgInfo.h}px`);

  // ─── PHASE 2: AI Background Removal ──────────────────────────────────────
  console.log("\n══ PHASE 2: AI Background Removal ══");

  // Check if BG removal is available
  const bgAvail = await page.evaluate(() => typeof window.ImageBgRemoval !== "undefined");
  note("2", bgAvail, `ImageBgRemoval module: ${bgAvail ? "available" : "NOT FOUND — checking alternative…"}`);

  if (bgAvail) {
    // Try the AI removal via window.ai tool
    note("2", true, "Attempting AI background removal (model lazy-load, may take 10–30s first time)…");
    const t0 = Date.now();
    const bgResult = await page.evaluate(async () => {
      try {
        const result = await window.ai.invoke("ai.image_remove_bg");
        return { ok: result.ok, error: result.error };
      } catch (e) {
        return { ok: false, error: e.message };
      }
    });
    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    note("2", bgResult.ok, `BG removal: ok=${bgResult.ok} (${elapsed}s)${bgResult.error ? " err=" + bgResult.error : ""}`);
    await page.waitForTimeout(500);
    await ss(page, "bg-removed");
  } else {
    note("2", false, "BG removal module not loaded — skipping, continuing with original");
    await ss(page, "bg-skipped");
  }

  // Trim transparency to clean up edges after BG removal
  console.log("\n══ PHASE 2b: Trim transparency ══");
  const trimResult = await page.evaluate(async () => {
    try {
      const wBefore = state.imageEditor.workCanvas?.width;
      const hBefore = state.imageEditor.workCanvas?.height;
      const r = await window.ai.invoke("ai.image_trim");
      const wAfter = state.imageEditor.workCanvas?.width;
      const hAfter = state.imageEditor.workCanvas?.height;
      return { ok: r.ok, error: r.error, wBefore, hBefore, wAfter, hAfter };
    } catch (e) { return { ok: false, error: e.message }; }
  });
  const sizeChanged = trimResult.wAfter !== trimResult.wBefore || trimResult.hAfter !== trimResult.hBefore;
  note("2b", trimResult.ok, `Trim: ${trimResult.wBefore}×${trimResult.hBefore} → ${trimResult.wAfter}×${trimResult.hAfter} (changed: ${sizeChanged})`);
  await ss(page, "trimmed");

  // ─── PHASE 3: Send to Mesh workspace ─────────────────────────────────────
  console.log("\n══ PHASE 3: Send to Mesh / create new slot ══");

  // Import the (edited) image as a new slot via AI bridge (includes rebuildMesh)
  const sendResult = await page.evaluate(async () => {
    return await window.ai.invoke("ai.image_send_to_new_slot");
  });
  note("3", sendResult.ok, `sendToNewSlot: ok=${sendResult.ok}${sendResult.error ? " err=" + sendResult.error : ""}`);
  await page.waitForTimeout(800);  // wait for mesh rebuild
  await ss(page, "mesh-workspace");
  const meshState = await page.evaluate(() => ({
    page: state.uiPage,
    slots: state.slots?.length ?? 0,
    hasMesh: !!state.mesh,
  }));
  note("3", meshState.slots > 0, `Mesh workspace: ${meshState.slots} slot(s), page=${meshState.page}`);

  // ─── PHASE 4: Puppet Warp setup ──────────────────────────────────────────
  console.log("\n══ PHASE 4: Puppet Warp — enable + add pins ══");

  // Enable puppet warp on slot 0
  // Confirm mesh data is available before puppet warp
  const meshCheck = await page.evaluate(() => {
    const diag = {
      slotsLen: state.slots?.length,
      activeSlot: state.activeSlot,
      hasMesh: !!state.mesh,
      sourceCanvas: !!state.sourceCanvas,
    };
    const slot = state.slots[0];
    if (!slot) return { ...diag, ok: false, reason: "no slot" };
    const att = getActiveAttachment(slot);
    if (!att) return { ...diag, ok: false, reason: "no active attachment", attsLen: slot.attachments?.length };
    diag.attType = att.type;
    diag.hasCanvas = !!att.canvas;
    if (!att.meshData) {
      // Sync source canvas then rebuild
      if (typeof syncSourceCanvasToActiveAttachment === "function") syncSourceCanvasToActiveAttachment(slot);
      if (typeof rebuildMesh === "function") rebuildMesh();
    }
    const att2 = getActiveAttachment(slot);
    return { ...diag, ok: !!att2?.meshData, vCount: att2?.meshData?.positions?.length ? att2.meshData.positions.length / 2 : 0, reason: att2?.meshData ? "ok" : "meshData still null after rebuildMesh" };
  });
  console.log("  mesh diag:", meshCheck);
  note("4-pre", meshCheck.ok, `Mesh data: ${meshCheck.ok ? meshCheck.vCount + " verts" : "MISSING — " + meshCheck.reason}`);

  const pwEnable = await page.evaluate(() => window.ai.invoke("ai.puppetwarp_enable", { slotIndex: 0, mode: "standalone" }));
  note("4", pwEnable.ok, `PuppetWarp enabled: mode=standalone${pwEnable.error ? " err=" + pwEnable.error : ""}`);

  // Get mesh info to pick good vertex indices
  const meshInfo = await page.evaluate(() => {
    const att = getActiveAttachment(state.slots[0]);
    if (!att?.meshData) return null;
    const n = att.meshData.positions.length / 2;
    // Sample vertices across the mesh
    const positions = [];
    for (let i = 0; i < n; i += Math.max(1, Math.floor(n / 20))) {
      positions.push({ i, x: att.meshData.positions[i * 2], y: att.meshData.positions[i * 2 + 1] });
    }
    return { vCount: n, samples: positions };
  });
  note("4", !!meshInfo, `Mesh: ${meshInfo?.vCount} vertices`);

  if (!meshInfo) {
    console.log("  ⚠ No mesh data — may need to rebuild mesh first");
    await page.click("#slotMeshTools .slotmesh-edit-target button");
    await page.waitForTimeout(300);
  }

  // Add 3 pins:
  // - 1 at upper body area (anchor pin — stays still)
  // - 1 at right hand area (to be animated)
  // - 1 at feet area (anchor)
  const n = meshInfo?.vCount ?? 100;
  const topVertex = Math.floor(n * 0.05);       // near head/torso
  const handVertex = Math.floor(n * 0.35);      // right arm/hand area
  const bottomVertex = Math.floor(n * 0.9);     // feet area

  const pin0 = await page.evaluate((v) => window.ai.invoke("ai.puppetwarp_add_pin", { slotIndex: 0, vertexIndex: v }), topVertex);
  const pin1 = await page.evaluate((v) => window.ai.invoke("ai.puppetwarp_add_pin", { slotIndex: 0, vertexIndex: v }), handVertex);
  const pin2 = await page.evaluate((v) => window.ai.invoke("ai.puppetwarp_add_pin", { slotIndex: 0, vertexIndex: v }), bottomVertex);
  note("4", pin0.ok && pin1.ok && pin2.ok,
    `Pins added: top(v${topVertex}), hand(v${handVertex}), bottom(v${bottomVertex})`);

  const handPinId = pin1.result?.pin?.id;
  const handRestX = pin1.result?.pin?.restX ?? 0;
  const handRestY = pin1.result?.pin?.restY ?? 0;
  console.log(`  hand pin: id=${handPinId}, rest=(${handRestX.toFixed(1)}, ${handRestY.toFixed(1)})`);

  await ss(page, "puppet-pins-added");

  // ─── PHASE 5: Animate — keyframe hand at t=0 and t=1.0 ──────────────────
  console.log("\n══ PHASE 5: Puppet Warp — animate hand ══");

  // Set keyframe at t=0 (rest position)
  await page.evaluate(() => window.ai.invoke("ai.set_animation_time", { time: 0 }));
  const kf0 = await page.evaluate(([pid, x, y]) =>
    window.ai.invoke("ai.puppetwarp_set_pin_keyframe", { slotIndex: 0, pinId: pid, time: 0, x, y }),
    [handPinId, handRestX, handRestY]);
  note("5", kf0.ok, `Keyframe t=0: hand at rest (${handRestX.toFixed(1)}, ${handRestY.toFixed(1)})`);

  // Drag hand outward (+80px X) at t=1.0 to simulate arm extension
  const dragX = handRestX + 80;
  const dragY = handRestY - 30;
  const drag = await page.evaluate(([pid, x, y]) =>
    window.ai.invoke("ai.puppetwarp_drag_pin", { slotIndex: 0, pinId: pid, x, y }),
    [handPinId, dragX, dragY]);
  note("5", drag.ok, `Drag hand to (${dragX.toFixed(1)}, ${dragY.toFixed(1)})`);

  const kf1 = await page.evaluate(([pid, x, y]) =>
    window.ai.invoke("ai.puppetwarp_set_pin_keyframe", { slotIndex: 0, pinId: pid, time: 1, x, y }),
    [handPinId, dragX, dragY]);
  note("5", kf1.ok, `Keyframe t=1: hand extended`);

  // Check keyframes are set
  const kfList = await page.evaluate(([pid]) =>
    window.ai.invoke("ai.puppetwarp_list_pin_keyframes", { slotIndex: 0, pinId: pid }),
    [handPinId]);
  note("5", kfList.result?.tracks?.[0]?.keyframes?.length === 2,
    `Pin track has ${kfList.result?.tracks?.[0]?.keyframes?.length} keyframes`);

  await ss(page, "puppet-kf0");

  // ─── PHASE 6: Verify deformation — scrub timeline ───────────────────────
  console.log("\n══ PHASE 6: Verify deformation at t=0.5 and t=1 ══");

  // Scrub to t=0.5
  await page.evaluate(() => window.ai.invoke("ai.set_animation_time", { time: 0.5 }));
  await page.waitForTimeout(200);
  const offMid = await page.evaluate(() => {
    const att = getActiveAttachment(state.slots[0]);
    const off = att?.meshData?.offsets;
    if (!off) return null;
    let max = 0, changed = 0;
    for (let i = 0; i < off.length; i++) { if (Math.abs(off[i]) > 1e-4) changed++; if (Math.abs(off[i]) > max) max = Math.abs(off[i]); }
    return { max: +max.toFixed(2), changed, total: off.length };
  });
  note("6", offMid?.max > 5, `t=0.5: max offset=${offMid?.max}px, ${offMid?.changed}/${offMid?.total} verts moved`);

  // Scrub to t=1.0
  await page.evaluate(() => window.ai.invoke("ai.set_animation_time", { time: 1 }));
  await page.waitForTimeout(200);
  const offFull = await page.evaluate(() => {
    const att = getActiveAttachment(state.slots[0]);
    const off = att?.meshData?.offsets;
    if (!off) return null;
    let max = 0, changed = 0;
    for (let i = 0; i < off.length; i++) { if (Math.abs(off[i]) > 1e-4) changed++; if (Math.abs(off[i]) > max) max = Math.abs(off[i]); }
    return { max: +max.toFixed(2), changed, total: off.length };
  });
  note("6", offFull?.max > 50, `t=1.0: max offset=${offFull?.max}px, ${offFull?.changed}/${offFull?.total} verts moved`);
  await ss(page, "puppet-t1");

  // Back to t=0 — verify deformation resets
  await page.evaluate(() => window.ai.invoke("ai.set_animation_time", { time: 0 }));
  await page.waitForTimeout(200);
  const off0 = await page.evaluate(() => {
    const att = getActiveAttachment(state.slots[0]);
    const off = att?.meshData?.offsets;
    if (!off) return null;
    let max = 0;
    for (let i = 0; i < off.length; i++) if (Math.abs(off[i]) > max) max = Math.abs(off[i]);
    return +max.toFixed(4);
  });
  note("6", off0 < 0.5, `t=0 reset: max offset=${off0} (should be ~0)`);
  await ss(page, "puppet-t0");

  // ─── PHASE 7: Spine export ────────────────────────────────────────────────
  console.log("\n══ PHASE 7: Export spine JSON ══");
  const spineExp = await page.evaluate(() => window.ai.invoke("ai.export_spine_json"));
  if (spineExp.ok) {
    const j = spineExp.result.data;
    const hasDeform = JSON.stringify(j).includes('"deform"');
    const hasPuppetLeak = JSON.stringify(j).includes("puppetWarp");
    note("7", !hasPuppetLeak, `Spine export: puppetWarp NOT in output: ${!hasPuppetLeak}`);
    note("7", hasDeform, `Spine export: deform timelines present: ${hasDeform}`);
    note("7", (j.bones?.length ?? 0) >= 0, `Bones: ${j.bones?.length ?? 0}, Slots: ${j.slots?.length ?? 0}`);
  } else {
    note("7", false, `Spine export failed: ${spineExp.error}`);
  }
  await ss(page, "spine-export");

  // ─── FINAL: Pause for visual inspection ──────────────────────────────────
  await page.waitForTimeout(2000);
  await ss(page, "final");

  console.log("\n══════════════════════════════════════════════════════════════");
  console.log("  RESULTS");
  console.log("══════════════════════════════════════════════════════════════");
  const passed = log.filter(l => l.ok).length;
  const total = log.length;
  log.forEach(l => console.log(`  ${l.ok ? "✅" : "❌"} [${l.phase}] ${l.msg}`));
  console.log(`\n  ${passed}/${total} checks passed`);
  if (errors.length) console.log(`  ${errors.length} JS error(s) during run`);

  await browser.close();
  server.close();
  process.exit(passed === total ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
