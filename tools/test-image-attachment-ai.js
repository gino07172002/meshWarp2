// Phase 4/5 smoke test: Image workspace attachment round-trip + ai.image_* tools.

const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const PORT = 5200;

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

function makePngDataUrl(w = 64, h = 48) {
  const raw = Buffer.alloc(h * (1 + w * 4));
  for (let y = 0; y < h; y += 1) {
    raw[y * (1 + w * 4)] = 0;
    for (let x = 0; x < w; x += 1) {
      const o = y * (1 + w * 4) + 1 + x * 4;
      raw[o] = (x * 255 / w) | 0;
      raw[o + 1] = (y * 255 / h) | 0;
      raw[o + 2] = 160;
      raw[o + 3] = 255;
    }
  }
  function chunk(t, d) {
    const len = Buffer.alloc(4); len.writeUInt32BE(d.length, 0);
    const tt = Buffer.from(t, "ascii");
    const cb = Buffer.concat([tt, d]);
    let c = ~0;
    for (let i = 0; i < cb.length; i += 1) {
      c ^= cb[i];
      for (let k = 0; k < 8; k += 1) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
    const cr = Buffer.alloc(4); cr.writeUInt32BE((~c) >>> 0, 0);
    return Buffer.concat([len, tt, d, cr]);
  }
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  const png = Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
  return `data:image/png;base64,${png.toString("base64")}`;
}

let failed = 0;
function expect(cond, msg) {
  if (!cond) { console.error("  FAIL:", msg); failed += 1; }
  else console.log("  PASS:", msg);
}

async function main() {
  const server = await startStaticServer();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => { console.error("[pageerror]", e.message); failed += 1; });
  page.on("console", (m) => { if (m.type() === "error") console.error("[browser:error]", m.text()); });

  await page.goto(`http://127.0.0.1:${PORT}/index.html`);
  await page.waitForFunction(() => !!window.ai && !!window.ImageWorkspace && !!window.ImageIO, { timeout: 10000 });

  const dataUrl = makePngDataUrl();
  const attachFlow = await page.evaluate(async (durl) => {
    const imp = await window.ai.invoke("ai.import_image", { dataUrl: durl, name: "roundtrip.png" });
    if (!imp.ok) return { imported: false, error: imp.error };
    if (typeof setRightPropsFocus === "function") setRightPropsFocus("attachment");
    if (typeof refreshSlotUI === "function") refreshSlotUI();
    document.getElementById("slotAttachmentEditImageBtn").click();
    document.getElementById("imageScaleWidth").value = "32";
    document.getElementById("imageScaleHeight").value = "24";
    document.getElementById("imageScaleApplyBtn").click();
    const imageState = {
      page: state.uiPage,
      sourceOrigin: state.imageEditor.source.origin,
      sourceSlotIndex: state.imageEditor.source.slotIndex,
      sourceAttachmentName: state.imageEditor.source.attachmentName,
      workSize: [state.imageEditor.workCanvas.width, state.imageEditor.workCanvas.height],
      hasApply: getComputedStyle(document.getElementById("imageApplyBtn")).display !== "none",
    };
    document.getElementById("imageApplyBtn").click();
    await new Promise((resolve) => setTimeout(resolve, 50));
    const slot = state.slots[imageState.sourceSlotIndex];
    const att = slot && getSlotAttachmentEntry(slot, imageState.sourceAttachmentName);
    return {
      imported: true,
      buttonExists: !!document.getElementById("slotAttachmentEditImageBtn"),
      imageState,
      returnedPage: state.uiPage,
      attachmentSize: att && att.canvas ? [att.canvas.width, att.canvas.height] : null,
    };
  }, dataUrl);
  console.log("  attachment flow:", attachFlow);
  expect(attachFlow.imported, "ai.import_image creates a slot for UI round-trip");
  expect(attachFlow.buttonExists, "attachment panel has Edit in Image button");
  expect(attachFlow.imageState && attachFlow.imageState.page === "image", "Edit in Image switches to image workspace");
  expect(attachFlow.imageState && attachFlow.imageState.sourceOrigin === "attachment", "Image workspace tracks attachment origin");
  expect(attachFlow.imageState && attachFlow.imageState.hasApply, "Apply to Attachment is visible for attachment origin");
  expect(attachFlow.attachmentSize && attachFlow.attachmentSize[0] === 32 && attachFlow.attachmentSize[1] === 24, "Apply to Attachment writes edited canvas back");

  const aiFlow = await page.evaluate(async (durl) => {
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
          ctx.fillRect(0, 0, mask.width / 2, mask.height);
          return mask;
        },
      }),
    });
    const tools = window.ai.tools().map((t) => t.id);
    const load = await window.ai.invoke("ai.image_load", { dataUrl: durl, name: "ai-image.png" });
    const crop = await window.ai.invoke("ai.image_crop", { x: 4, y: 4, w: 20, h: 16 });
    const rotate = await window.ai.invoke("ai.image_rotate", { degrees: 90 });
    const flip = await window.ai.invoke("ai.image_flip", { axis: "x" });
    const scale = await window.ai.invoke("ai.image_scale", { width: 40, height: 32 });
    const remove = await window.ai.invoke("ai.image_remove_bg", { threshold: 0.5, feather: 0 });
    const exp = await window.ai.invoke("ai.image_export_png");
    const c = window.ImageWorkspace.getWorkCanvas();
    const alphaLeft = c.getContext("2d").getImageData(0, 0, 1, 1).data[3];
    const alphaRight = c.getContext("2d").getImageData(c.width - 1, 0, 1, 1).data[3];
    return {
      toolIds: tools.filter((id) => id.startsWith("ai.image_")).sort(),
      oks: [load.ok, crop.ok, rotate.ok, flip.ok, scale.ok, remove.ok, exp.ok],
      size: [c.width, c.height],
      alphaLeft,
      alphaRight,
      exportPrefix: exp.result && String(exp.result.dataUrl || "").slice(0, 22),
      history: state.imageEditor.history.map((h) => h.op),
    };
  }, dataUrl);
  console.log("  ai flow:", aiFlow);
  const requiredTools = ["ai.image_apply_to_attachment", "ai.image_crop", "ai.image_export_png", "ai.image_flip", "ai.image_load", "ai.image_remove_bg", "ai.image_rotate", "ai.image_scale"];
  expect(requiredTools.every((id) => aiFlow.toolIds.includes(id)), "ai.image_* tools are registered");
  expect(aiFlow.oks.every(Boolean), "ai.image_* operation chain succeeds");
  expect(aiFlow.size[0] === 40 && aiFlow.size[1] === 32, "ai.image_scale changes current image size");
  expect(aiFlow.alphaLeft === 255 && aiFlow.alphaRight === 0, "ai.image_remove_bg applies mask alpha");
  expect(aiFlow.exportPrefix === "data:image/png;base64,", "ai.image_export_png returns PNG data URL");
  expect(aiFlow.history.includes("remove background"), "ai.image_remove_bg pushes history");

  await browser.close();
  server.close();
  if (failed > 0) {
    console.error(`\n${failed} assertion(s) failed.`);
    process.exit(1);
  }
  console.log("\nAll image attachment + AI bridge tests passed.");
}

main().catch((e) => { console.error(e); process.exit(1); });
