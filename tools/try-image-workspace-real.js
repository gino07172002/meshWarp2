// Try the Image workspace with a real user-supplied image.
// Loads the file, sends it through ImageWorkspace.loadFromBlob, captures
// screenshots at each step, and reports.

const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 5197;
const SS_DIR = path.resolve(__dirname, "..", "review-screenshots");
const TARGET_IMAGE = "D:/newExport/新增資料夾 (4)/dc987401-b087-4f60-b2e6-c2753305eb72.jpg";

if (!fs.existsSync(SS_DIR)) fs.mkdirSync(SS_DIR, { recursive: true });
let ssIdx = 0;
async function ss(page, name) {
  const file = path.join(SS_DIR, `img-${String(++ssIdx).padStart(2, "0")}-${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`  📷 ${path.basename(file)}`);
  return file;
}

function startStaticServer() {
  const root = path.resolve(__dirname, "..");
  const types = { ".html": "text/html", ".js": "application/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg" };
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

async function main() {
  if (!fs.existsSync(TARGET_IMAGE)) {
    console.error(`Image not found: ${TARGET_IMAGE}`);
    process.exit(1);
  }
  const imgBuf = fs.readFileSync(TARGET_IMAGE);
  const imgB64 = imgBuf.toString("base64");
  console.log(`Loaded source image: ${imgBuf.length} bytes`);

  const server = await startStaticServer();
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.error("[pageerror]", e.message));
  page.on("console", (m) => {
    if (m.type() === "error") console.error("[browser:error]", m.text());
  });

  console.log("\n=== Step 1: Open editor ===");
  await page.goto(`http://127.0.0.1:${PORT}/index.html`);
  await page.waitForFunction(() => !!window.ImageWorkspace && !!window.ImageIO, { timeout: 10000 });
  await page.waitForTimeout(400);
  await ss(page, "fresh");

  console.log("\n=== Step 2: Click Image tab ===");
  await page.click("#workspaceTabImage");
  await page.waitForTimeout(500);
  await ss(page, "image-tab-empty");

  console.log("\n=== Step 3: Load real image via ImageWorkspace.loadFromBlob ===");
  const loadResult = await page.evaluate(async (b64) => {
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) arr[i] = bin.charCodeAt(i);
    const blob = new Blob([arr], { type: "image/jpeg" });
    const ok = await window.ImageWorkspace.loadFromBlob(blob, "drop");
    const ie = state.imageEditor;
    return {
      ok,
      width: ie.workCanvas ? ie.workCanvas.width : 0,
      height: ie.workCanvas ? ie.workCanvas.height : 0,
      origin: ie.source.origin,
      historyLen: ie.history.length,
      viewScale: ie.view.scale,
    };
  }, imgB64);
  console.log("  load result:", loadResult);
  await page.waitForTimeout(400);
  await ss(page, "image-loaded");

  console.log("\n=== Step 4: Inspect rendered canvas pixels (sanity check) ===");
  const canvasInspect = await page.evaluate(() => {
    const cv = document.getElementById("imageCanvas");
    const ctx = cv.getContext("2d");
    const data = ctx.getImageData(cv.width / 2, cv.height / 2, 1, 1).data;
    return { centerPixel: [data[0], data[1], data[2], data[3]], canvasSize: [cv.width, cv.height] };
  });
  console.log("  canvas inspect:", canvasInspect);

  console.log("\n=== Step 5: Test undo/redo state ===");
  const undoState = await page.evaluate(() => ({
    canUndo: window.ImageWorkspace.canUndo(),
    canRedo: window.ImageWorkspace.canRedo(),
    historyEntries: state.imageEditor.history.length,
    historyOps: state.imageEditor.history.map((h) => h.op),
  }));
  console.log("  undo state:", undoState);

  console.log("\n=== Step 6: Test Download PNG ===");
  const downloadResult = await page.evaluate(async () => {
    return new Promise((resolve) => {
      const c = window.ImageWorkspace.getWorkCanvas();
      if (!c) return resolve({ ok: false });
      c.toBlob((blob) => {
        if (!blob) return resolve({ ok: false });
        // Read first few bytes to confirm PNG header
        const reader = new FileReader();
        reader.onload = () => {
          const arr = new Uint8Array(reader.result);
          const header = Array.from(arr.slice(0, 8)).map((b) => b.toString(16).padStart(2, "0")).join("");
          resolve({ ok: true, size: blob.size, header });
        };
        reader.readAsArrayBuffer(blob);
      }, "image/png");
    });
  });
  console.log("  download:", downloadResult);
  console.log("  PNG header expected: 89504e470d0a1a0a — got:", downloadResult.header);

  console.log("\n=== Step 7: Switch to Rig (verify clean exit) ===");
  await page.click("#workspaceTabRig");
  await page.waitForTimeout(400);
  await ss(page, "switched-to-rig");
  const afterSwitch = await page.evaluate(() => ({
    page: state.uiPage,
    isActive: state.imageEditor.active,
  }));
  console.log("  after switch:", afterSwitch);

  console.log("\n=== Step 8: Switch back to Image (verify session resumes) ===");
  await page.click("#workspaceTabImage");
  await page.waitForTimeout(400);
  await ss(page, "back-to-image");
  const onReturn = await page.evaluate(() => ({
    page: state.uiPage,
    isActive: state.imageEditor.active,
    hasWork: !!state.imageEditor.workCanvas,
    width: state.imageEditor.workCanvas ? state.imageEditor.workCanvas.width : 0,
  }));
  console.log("  on return:", onReturn);

  console.log("\n=== Done ===");
  await page.waitForTimeout(2000);
  await browser.close();
  server.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
