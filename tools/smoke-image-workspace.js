// Phase 1 smoke test: Image workspace foundations.
// Verifies:
//   1. Image tab present, clickable, becomes active
//   2. Switching to Image hides spine canvases, shows image-stage
//   3. Drop zone visible when no image loaded
//   4. Loading an image (via blob → loadFromBlob) populates workCanvas
//   5. Drop zone hides; canvas shows
//   6. History has 1 entry; undo/redo disabled when at edge
//   7. Download PNG works (toBlob produces a non-empty PNG)
//   8. Switch back to Rig: spine canvases visible, image-stage hidden

const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const PORT = 5196;

function startStaticServer() {
  const root = path.resolve(__dirname, "..");
  const types = { ".html": "text/html", ".js": "application/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png" };
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

function makePng() {
  const W = 96, H = 96;
  const raw = Buffer.alloc(H * (1 + W * 4));
  for (let y = 0; y < H; y += 1) {
    raw[y * (1 + W * 4)] = 0;
    for (let x = 0; x < W; x += 1) {
      const o = y * (1 + W * 4) + 1 + x * 4;
      raw[o] = (x * 255 / W) | 0;
      raw[o + 1] = (y * 255 / H) | 0;
      raw[o + 2] = 128;
      raw[o + 3] = 255;
    }
  }
  function chunk(t, d) { const len = Buffer.alloc(4); len.writeUInt32BE(d.length, 0); const tt = Buffer.from(t, "ascii"); const cb = Buffer.concat([tt, d]); let c = ~0; for (let i = 0; i < cb.length; i += 1) { c ^= cb[i]; for (let k = 0; k < 8; k += 1) c = (c >>> 1) ^ (0xedb88320 & -(c & 1)); } const cr = Buffer.alloc(4); cr.writeUInt32BE((~c) >>> 0, 0); return Buffer.concat([len, tt, d, cr]); }
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

let failed = 0;
function expect(cond, msg) { if (!cond) { console.error("  FAIL:", msg); failed += 1; } else console.log("  PASS:", msg); }
function divider(t) { console.log("\n" + "=".repeat(70) + "\n " + t + "\n" + "=".repeat(70)); }

async function main() {
  const server = await startStaticServer();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => { console.error("[pageerror]", e.message); failed += 1; });
  page.on("console", (m) => { if (m.type() === "error") console.error("[browser:error]", m.text()); });

  await page.goto(`http://127.0.0.1:${PORT}/index.html`);
  await page.waitForFunction(() => !!window.ai && !!window.ImageWorkspace && !!window.ImageIO, { timeout: 10000 });
  await page.waitForTimeout(300);

  divider("STEP 1 — Image tab visible and clickable");
  const tabExists = await page.evaluate(() => !!document.getElementById("workspaceTabImage"));
  expect(tabExists, "#workspaceTabImage exists in DOM");

  await page.click("#workspaceTabImage");
  await page.waitForTimeout(300);

  const afterClick = await page.evaluate(() => ({
    isActive: state.imageEditor && state.imageEditor.active,
    page: state.uiPage,
    btnActive: document.getElementById("workspaceTabImage").classList.contains("active"),
    appHasPageImage: document.getElementById("appRoot").classList.contains("page-image"),
  }));
  console.log("  after click:", afterClick);
  expect(afterClick.isActive, "state.imageEditor.active === true");
  expect(afterClick.page === "image", "state.uiPage === 'image'");
  expect(afterClick.btnActive, "tab button has 'active' class");
  expect(afterClick.appHasPageImage, "appRoot has page-image class");

  divider("STEP 2 — Spine canvases hidden, image-stage visible");
  const visibility = await page.evaluate(() => {
    const get = (id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const cs = window.getComputedStyle(el);
      return cs.display;
    };
    return {
      glCanvas: get("glCanvas"),
      imageStage: get("imageStage"),
      imageDropZone: get("imageDropZone"),
    };
  });
  console.log("  visibility:", visibility);
  expect(visibility.glCanvas === "none", "#glCanvas hidden in image workspace");
  expect(visibility.imageStage !== "none", "#imageStage visible");
  expect(visibility.imageDropZone !== "none", "#imageDropZone visible (no image loaded)");

  divider("STEP 3 — Load image via Blob, drop zone hides");
  const pngBytes = makePng();
  const pngBase64 = pngBytes.toString("base64");
  const loadResult = await page.evaluate(async (b64) => {
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) arr[i] = bin.charCodeAt(i);
    const blob = new Blob([arr], { type: "image/png" });
    return await window.ImageWorkspace.loadFromBlob(blob, "drop");
  }, pngBase64);
  await page.waitForTimeout(200);
  expect(loadResult, "loadFromBlob returns true");

  const afterLoad = await page.evaluate(() => {
    const ie = state.imageEditor;
    return {
      hasWork: !!ie.workCanvas,
      width: ie.workCanvas ? ie.workCanvas.width : 0,
      height: ie.workCanvas ? ie.workCanvas.height : 0,
      historyLen: ie.history.length,
      historyIndex: ie.historyIndex,
      origin: ie.source.origin,
      dropZoneDisplay: window.getComputedStyle(document.getElementById("imageDropZone")).display,
    };
  });
  console.log("  after load:", afterLoad);
  expect(afterLoad.hasWork, "workCanvas populated");
  expect(afterLoad.width === 96 && afterLoad.height === 96, "canvas dimensions match input");
  expect(afterLoad.historyLen === 1, "history has 1 source entry");
  expect(afterLoad.historyIndex === 0, "historyIndex at 0");
  expect(afterLoad.origin === "drop", "origin = 'drop'");
  expect(afterLoad.dropZoneDisplay === "none", "drop zone hidden after load");

  divider("STEP 4 — Undo/redo state");
  const undoState = await page.evaluate(() => ({
    canUndo: window.ImageWorkspace.canUndo(),
    canRedo: window.ImageWorkspace.canRedo(),
    undoBtnDisabled: document.getElementById("imageUndoBtn").disabled,
    redoBtnDisabled: document.getElementById("imageRedoBtn").disabled,
  }));
  console.log("  undo state:", undoState);
  expect(!undoState.canUndo, "canUndo === false (only source in history)");
  expect(!undoState.canRedo, "canRedo === false (no redo future)");
  expect(undoState.undoBtnDisabled, "undo button disabled");
  expect(undoState.redoBtnDisabled, "redo button disabled");

  divider("STEP 5 — Download produces a non-empty PNG");
  const download = await page.evaluate(async () => {
    return new Promise((resolve) => {
      const c = window.ImageWorkspace.getWorkCanvas();
      if (!c) return resolve({ ok: false });
      c.toBlob((blob) => {
        if (!blob) return resolve({ ok: false });
        resolve({ ok: true, size: blob.size, type: blob.type });
      }, "image/png");
    });
  });
  console.log("  download blob:", download);
  expect(download.ok, "toBlob succeeded");
  expect(download.size > 100, `PNG size > 100 bytes (got ${download.size})`);
  expect(download.type === "image/png", "MIME type is image/png");

  divider("STEP 6 — Switch back to Rig, spine canvases reappear");
  await page.click("#workspaceTabRig");
  await page.waitForTimeout(300);
  const afterSwitch = await page.evaluate(() => ({
    isActive: state.imageEditor.active,
    page: state.uiPage,
    glCanvasDisplay: window.getComputedStyle(document.getElementById("glCanvas")).display,
    imageStageDisplay: window.getComputedStyle(document.getElementById("imageStage")).display,
  }));
  console.log("  after switch back:", afterSwitch);
  expect(!afterSwitch.isActive, "state.imageEditor.active === false");
  expect(afterSwitch.page === "rig", "state.uiPage === 'rig'");
  expect(afterSwitch.glCanvasDisplay !== "none", "#glCanvas visible again");
  expect(afterSwitch.imageStageDisplay === "none", "#imageStage hidden again");

  if (failed > 0) {
    console.error(`\n${failed} assertion(s) failed.`);
    await browser.close(); server.close();
    process.exit(1);
  }
  console.log("\nAll Phase 1 smoke test steps passed.");
  await browser.close(); server.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
