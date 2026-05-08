// Phase 2 smoke test: Image workspace canvas operations + UI wiring.

const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 5198;

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
  return new Promise((resolve) => server.listen(PORT, "127.0.0.1", () => resolve(server)));
}

let failed = 0;
function expect(cond, msg) {
  if (!cond) {
    console.error("  FAIL:", msg);
    failed += 1;
  } else {
    console.log("  PASS:", msg);
  }
}

async function main() {
  const server = await startStaticServer();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => { console.error("[pageerror]", e.message); failed += 1; });
  page.on("console", (m) => { if (m.type() === "error") console.error("[browser:error]", m.text()); });

  await page.goto(`http://127.0.0.1:${PORT}/index.html`);
  await page.waitForFunction(() => !!window.ImageWorkspace && !!window.ImageIO, { timeout: 10000 });
  await page.click("#workspaceTabImage");

  const layout = await page.evaluate(() => {
    const box = (id) => {
      const r = document.getElementById(id).getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    };
    return {
      stage: box("stage"),
      imageStage: box("imageStage"),
      left: box("imageLeftPanel"),
      right: box("imageRightPanel"),
      canvas: box("imageCanvas"),
    };
  });
  console.log("  layout:", layout);
  expect(Math.abs(layout.imageStage.y - layout.stage.y) <= 2, "image canvas column starts at top of stage");
  expect(Math.abs(layout.left.y - layout.stage.y) <= 2 && Math.abs(layout.right.y - layout.stage.y) <= 2, "image side panels start at top of stage");
  expect(Math.abs(layout.imageStage.height - layout.stage.height) <= 3, "image canvas column fills stage height");
  expect(Math.abs(layout.left.height - layout.stage.height) <= 3 && Math.abs(layout.right.height - layout.stage.height) <= 3, "image side panels fill stage height");
  expect(Math.abs(layout.canvas.height - layout.imageStage.height) < 1, "image canvas fills its column height");

  const opsResult = await page.evaluate(() => {
    const makeSource = () => {
      const c = document.createElement("canvas");
      c.width = 4;
      c.height = 3;
      const ctx = c.getContext("2d");
      ctx.clearRect(0, 0, 4, 3);
      ctx.fillStyle = "rgba(255,0,0,1)";
      ctx.fillRect(1, 1, 1, 1);
      ctx.fillStyle = "rgba(0,255,0,1)";
      ctx.fillRect(2, 1, 1, 1);
      return c;
    };
    const px = (canvas, x, y) => Array.from(canvas.getContext("2d").getImageData(x, y, 1, 1).data);
    const source = makeSource();
    const crop = window.ImageOps.crop(source, { x: 1, y: 1, w: 2, h: 1 });
    const flip = window.ImageOps.flip(source, "x");
    const rot = window.ImageOps.rotate(source, 90);
    const scaled = window.ImageOps.scale(source, { width: 8, height: 6 });
    const trimmed = window.ImageOps.trimTransparency(source);
    return {
      hasOps: !!window.ImageOps,
      sourceSize: [source.width, source.height],
      cropSize: [crop.width, crop.height],
      cropLeft: px(crop, 0, 0),
      cropRight: px(crop, 1, 0),
      flipRed: px(flip, 2, 1),
      flipGreen: px(flip, 1, 1),
      rotSize: [rot.width, rot.height],
      rotRed: px(rot, 1, 1),
      rotGreen: px(rot, 1, 2),
      scaledSize: [scaled.width, scaled.height],
      trimmedSize: [trimmed.width, trimmed.height],
      trimmedRed: px(trimmed, 0, 0),
    };
  });

  console.log("  ops:", opsResult);
  expect(opsResult.hasOps, "window.ImageOps is installed");
  expect(opsResult.sourceSize[0] === 4 && opsResult.sourceSize[1] === 3, "ops do not mutate source dimensions");
  expect(opsResult.cropSize[0] === 2 && opsResult.cropSize[1] === 1, "crop returns requested dimensions");
  expect(opsResult.cropLeft[0] === 255 && opsResult.cropRight[1] === 255, "crop preserves source pixels");
  expect(opsResult.flipRed[0] === 255 && opsResult.flipGreen[1] === 255, "horizontal flip mirrors pixels");
  expect(opsResult.rotSize[0] === 3 && opsResult.rotSize[1] === 4, "90-degree rotate swaps dimensions");
  expect(opsResult.rotRed[0] === 255 && opsResult.rotGreen[1] === 255, "90-degree rotate maps pixels correctly");
  expect(opsResult.scaledSize[0] === 8 && opsResult.scaledSize[1] === 6, "scale uses target dimensions");
  expect(opsResult.trimmedSize[0] === 2 && opsResult.trimmedSize[1] === 1, "trimTransparency crops alpha bounds");
  expect(opsResult.trimmedRed[0] === 255, "trimTransparency keeps visible pixels");

  const uiResult = await page.evaluate(() => {
    const src = document.createElement("canvas");
    src.width = 10;
    src.height = 8;
    const ctx = src.getContext("2d");
    ctx.fillStyle = "rgba(10,20,30,1)";
    ctx.fillRect(0, 0, 10, 8);
    window.ImageWorkspace.loadFromCanvas(src, "drop");
    document.getElementById("imageRotate90Btn").click();
    document.getElementById("imageFlipXBtn").click();
    document.getElementById("imageTrimBtn").click();
    document.getElementById("imageScaleWidth").value = "5";
    document.getElementById("imageScaleHeight").value = "4";
    document.getElementById("imageScaleApplyBtn").click();
    document.getElementById("imageZoom100Btn").click();
    const ie = state.imageEditor;
    return {
      workSize: [ie.workCanvas.width, ie.workCanvas.height],
      historyOps: ie.history.map((h) => h.op),
      zoom: ie.view.scale,
      canUndo: window.ImageWorkspace.canUndo(),
      cropBtn: !!document.getElementById("imageCropToolBtn"),
      fitBtn: !!document.getElementById("imageFitBtn"),
    };
  });

  console.log("  ui:", uiResult);
  expect(uiResult.cropBtn, "crop tool button exists");
  expect(uiResult.fitBtn, "fit button exists");
  expect(uiResult.historyOps.includes("rotate 90"), "rotate button pushes history");
  expect(uiResult.historyOps.includes("flip horizontal"), "flip button pushes history");
  expect(uiResult.historyOps.includes("trim transparency"), "trim button pushes history");
  expect(uiResult.historyOps.includes("scale"), "scale button pushes history");
  expect(uiResult.workSize[0] === 5 && uiResult.workSize[1] === 4, "scale UI changes work canvas dimensions");
  expect(uiResult.zoom === 1, "100% zoom button sets scale to 1");
  expect(uiResult.canUndo, "image edits are undoable");

  const cropPoints = await page.evaluate(() => {
    const src = document.createElement("canvas");
    src.width = 20;
    src.height = 10;
    const ctx = src.getContext("2d");
    ctx.fillStyle = "rgba(20,40,80,1)";
    ctx.fillRect(0, 0, 20, 10);
    window.ImageWorkspace.loadFromCanvas(src, "drop");
    window.ImageWorkspace.setZoom100();
    document.getElementById("imageCropToolBtn").click();
    const cv = document.getElementById("imageCanvas");
    const rect = cv.getBoundingClientRect();
    const a = window.ImageWorkspace.imageToCanvas(2, 2);
    const b = window.ImageWorkspace.imageToCanvas(8, 6);
    return {
      start: { x: rect.left + a.x, y: rect.top + a.y },
      end: { x: rect.left + b.x, y: rect.top + b.y },
    };
  });
  await page.mouse.move(cropPoints.start.x, cropPoints.start.y);
  await page.mouse.down();
  await page.mouse.move(cropPoints.end.x, cropPoints.end.y);
  await page.mouse.up();
  const cropDragState = await page.evaluate(() => ({
    rect: state.imageEditor.cropRect,
    applyDisabled: document.getElementById("imageCropApplyBtn").disabled,
  }));
  console.log("  crop drag:", cropDragState);
  expect(Math.round(cropDragState.rect.w) === 6 && Math.round(cropDragState.rect.h) === 4, "dragging crop tool creates image-space crop rect");
  expect(!cropDragState.applyDisabled, "crop apply button enables after drag");
  await page.click("#imageCropApplyBtn");
  const afterCrop = await page.evaluate(() => ({
    workSize: [state.imageEditor.workCanvas.width, state.imageEditor.workCanvas.height],
    lastOp: state.imageEditor.history[state.imageEditor.history.length - 1].op,
  }));
  console.log("  after crop:", afterCrop);
  expect(afterCrop.workSize[0] === 6 && afterCrop.workSize[1] === 4, "Apply Crop changes work canvas dimensions");
  expect(afterCrop.lastOp === "crop", "Apply Crop pushes crop history entry");

  const viewBefore = await page.evaluate(() => ({
    scale: state.imageEditor.view.scale,
    cx: state.imageEditor.view.cx,
    cy: state.imageEditor.view.cy,
    rect: (() => {
      const r = document.getElementById("imageCanvas").getBoundingClientRect();
      return { left: r.left, top: r.top, width: r.width, height: r.height };
    })(),
  }));
  await page.mouse.move(viewBefore.rect.left + viewBefore.rect.width / 2, viewBefore.rect.top + viewBefore.rect.height / 2);
  await page.mouse.wheel(0, -300);
  const zoomed = await page.evaluate(() => state.imageEditor.view.scale);
  expect(zoomed > viewBefore.scale, "wheel zoom increases image view scale");
  await page.mouse.down({ button: "middle" });
  await page.mouse.move(viewBefore.rect.left + viewBefore.rect.width / 2 + 40, viewBefore.rect.top + viewBefore.rect.height / 2 + 20);
  await page.mouse.up({ button: "middle" });
  const panned = await page.evaluate(() => ({ cx: state.imageEditor.view.cx, cy: state.imageEditor.view.cy }));
  expect(panned.cx !== viewBefore.cx || panned.cy !== viewBefore.cy, "middle-drag pan changes view center");

  await browser.close();
  server.close();
  if (failed > 0) {
    console.error(`\n${failed} assertion(s) failed.`);
    process.exit(1);
  }
  console.log("\nAll Phase 2 image ops tests passed.");
}

main().catch((e) => { console.error(e); process.exit(1); });
