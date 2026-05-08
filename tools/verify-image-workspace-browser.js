// Manual-grade browser verification for the Image Workspace.

const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 5201;
const TARGET_IMAGE = process.env.IMAGE_VERIFY_FILE || "D:/newExport/1f94a319-35a4-4056-942f-53e8ae32aeba.jpg";
const OUT_DIR = path.resolve(__dirname, "..", "review-screenshots");

function startStaticServer() {
  const root = path.resolve(__dirname, "..");
  const types = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
  };
  const server = http.createServer((req, res) => {
    if (req.url.split("?")[0] === "/favicon.ico") {
      res.statusCode = 204;
      res.end();
      return;
    }
    let p = path.join(root, req.url.split("?")[0] === "/" ? "/index.html" : req.url.split("?")[0]);
    if (!p.startsWith(root)) { res.statusCode = 403; res.end(); return; }
    fs.stat(p, (err, st) => {
      if (err) { res.statusCode = 404; res.end(); return; }
      if (st.isDirectory()) p = path.join(p, "index.html");
      res.setHeader("Content-Type", types[path.extname(p).toLowerCase()] || "application/octet-stream");
      fs.createReadStream(p).pipe(res);
    });
  });
  return new Promise((resolve) => server.listen(PORT, "127.0.0.1", () => resolve(server)));
}

async function save(page, name) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const file = path.join(OUT_DIR, name);
  await page.screenshot({ path: file, fullPage: false });
  return file;
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

async function main() {
  if (!fs.existsSync(TARGET_IMAGE)) throw new Error(`Image not found: ${TARGET_IMAGE}`);
  const server = await startStaticServer();
  const headed = process.env.HEADLESS === "0";
  const browser = await chromium.launch({ headless: !headed, slowMo: headed ? 60 : 0 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const pageErrors = [];
  const consoleErrors = [];
  page.on("pageerror", (e) => pageErrors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });

  try {
    await page.goto(`http://127.0.0.1:${PORT}/index.html`);
    await page.waitForFunction(() => !!window.ai && !!window.ImageWorkspace && !!window.ImageIO, { timeout: 10000 });
    await page.click("#workspaceTabImage");

    const imgBase64 = fs.readFileSync(TARGET_IMAGE).toString("base64");
    const loaded = await page.evaluate(async (b64) => {
      const bin = atob(b64);
      const arr = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i += 1) arr[i] = bin.charCodeAt(i);
      const ok = await window.ImageWorkspace.loadFromBlob(new Blob([arr], { type: "image/jpeg" }), "file");
      window.ImageWorkspace.fitView();
      window.ImageWorkspace.refreshUI();
      return {
        ok,
        width: window.ImageWorkspace.getWorkCanvas().width,
        height: window.ImageWorkspace.getWorkCanvas().height,
        captureDomains: typeof listAICaptureDomains === "function" ? listAICaptureDomains() : [],
        imageTools: window.ai.tools({ domain: "image" }).map((t) => t.id).sort(),
      };
    }, imgBase64);

    const layout = await page.evaluate(() => {
      const box = (id) => {
        const r = document.getElementById(id).getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      };
      return {
        left: box("imageLeftPanel"),
        stage: box("imageStage"),
        right: box("imageRightPanel"),
        canvas: box("imageCanvas"),
      };
    });
    const loadedShot = await save(page, "phase4-image-loaded.png");

    const bg = await page.evaluate(async () => {
      window.ImageBgRemoval.configure({
        createSegmenter: async () => ({
          segment: async (canvas) => {
            const mask = document.createElement("canvas");
            mask.width = canvas.width;
            mask.height = canvas.height;
            const ctx = mask.getContext("2d");
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, mask.width, mask.height);
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.ellipse(mask.width / 2, mask.height / 2, mask.width * 0.30, mask.height * 0.42, 0, 0, Math.PI * 2);
            ctx.fill();
            return mask;
          },
        }),
      });
      document.getElementById("imageBgThreshold").value = "0.5";
      document.getElementById("imageBgFeather").value = "0";
      const ok = await window.ImageIO.removeBackgroundFromCurrent();
      const c = window.ImageWorkspace.getWorkCanvas();
      const data = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
      return {
        ok,
        cornerAlpha: data[3],
        centerAlpha: c.getContext("2d").getImageData(Math.floor(c.width / 2), Math.floor(c.height / 2), 1, 1).data[3],
        historyOps: state.imageEditor.history.map((h) => h.op),
      };
    });
    const removedShot = await save(page, "phase4-image-bg-removed.png");

    const roundTrip = await page.evaluate(async () => {
      const exp = window.ImageWorkspace.getWorkCanvas().toDataURL("image/png");
      const imported = await window.ai.invoke("ai.import_image", { dataUrl: exp, name: "image-workspace-roundtrip.png" });
      if (!imported.ok) return { ok: false, error: imported.error };
      if (typeof setRightPropsFocus === "function") setRightPropsFocus("attachment");
      if (typeof refreshSlotUI === "function") refreshSlotUI();
      const editOk = window.ImageIO.editActiveAttachment();
      document.getElementById("imageScaleWidth").value = "64";
      document.getElementById("imageScaleHeight").value = "96";
      document.getElementById("imageScaleApplyBtn").click();
      const applyOk = window.ImageIO.applyToAttachment();
      const slot = state.slots[state.activeSlot];
      const att = getActiveAttachment(slot);
      return {
        ok: editOk && applyOk,
        page: state.uiPage,
        size: att && att.canvas ? [att.canvas.width, att.canvas.height] : null,
        sourceOrigin: state.imageEditor.source.origin,
        appPageImage: document.getElementById("appRoot").classList.contains("page-image"),
        tabClasses: {
          rig: document.getElementById("workspaceTabRig").className,
          mesh: document.getElementById("workspaceTabSlot").className,
          object: document.getElementById("workspaceTabObject").className,
          image: document.getElementById("workspaceTabImage").className,
        },
        activeElementId: document.activeElement && document.activeElement.id || "",
      };
    });
    const appliedShot = await save(page, "phase4-attachment-applied.png");

    const checks = {
      loadedOk: !!loaded.ok && loaded.width > 0 && loaded.height > 0,
      imageDomainRegistered: loaded.captureDomains.includes("image"),
      imageToolsPresent: [
        "ai.image_load",
        "ai.image_crop",
        "ai.image_rotate",
        "ai.image_flip",
        "ai.image_scale",
        "ai.image_remove_bg",
        "ai.image_apply_to_attachment",
        "ai.image_export_png",
      ].every((id) => loaded.imageTools.includes(id)),
      panelsAligned: Math.abs(layout.left.y - layout.stage.y) <= 1 && Math.abs(layout.right.y - layout.stage.y) <= 1,
      panelsFillHeight: Math.abs(layout.left.height - layout.stage.height) <= 2 && Math.abs(layout.right.height - layout.stage.height) <= 2,
      noPanelStageOverlap: !rectsOverlap(layout.left, layout.stage) && !rectsOverlap(layout.right, layout.stage),
      canvasFillsStage: Math.abs(layout.canvas.width - layout.stage.width) <= 2 && Math.abs(layout.canvas.height - layout.stage.height) <= 2,
      bgOk: !!bg.ok && bg.cornerAlpha === 0 && bg.centerAlpha === 255 && bg.historyOps.includes("remove background"),
      roundTripOk: !!roundTrip.ok && roundTrip.page === "slot" && !roundTrip.appPageImage && roundTrip.size && roundTrip.size[0] === 64 && roundTrip.size[1] === 96,
      noPageErrors: pageErrors.length === 0,
      noConsoleErrors: consoleErrors.length === 0,
    };

    console.log(JSON.stringify({
      url: `http://127.0.0.1:${PORT}/index.html`,
      targetImage: TARGET_IMAGE,
      loaded,
      layout,
      bg,
      roundTrip,
      checks,
      screenshots: { loadedShot, removedShot, appliedShot },
      pageErrors,
      consoleErrors,
    }, null, 2));

    if (Object.values(checks).some((ok) => !ok)) process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error(err && err.stack || err);
  process.exit(1);
});
