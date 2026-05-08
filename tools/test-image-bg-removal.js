// Phase 3 smoke test: Image workspace background removal UI + alpha output.

const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 5199;
const TARGET_IMAGE = "D:/newExport/1f94a319-35a4-4056-942f-53e8ae32aeba.jpg";

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
  if (!fs.existsSync(TARGET_IMAGE)) {
    console.error(`Validation image not found: ${TARGET_IMAGE}`);
    process.exit(1);
  }
  const imgBase64 = fs.readFileSync(TARGET_IMAGE).toString("base64");
  const server = await startStaticServer();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => { console.error("[pageerror]", e.message); failed += 1; });
  page.on("console", (m) => { if (m.type() === "error") console.error("[browser:error]", m.text()); });

  await page.goto(`http://127.0.0.1:${PORT}/index.html`);
  await page.waitForFunction(() => !!window.ImageWorkspace && !!window.ImageIO, { timeout: 10000 });
  await page.click("#workspaceTabImage");

  const result = await page.evaluate(async (b64) => {
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
          ctx.ellipse(mask.width / 2, mask.height / 2, mask.width * 0.28, mask.height * 0.38, 0, 0, Math.PI * 2);
          ctx.fill();
          return mask;
        },
      }),
    });
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) arr[i] = bin.charCodeAt(i);
    const ok = await window.ImageWorkspace.loadFromBlob(new Blob([arr], { type: "image/jpeg" }), "file");
    document.getElementById("imageBgThreshold").value = "0.5";
    document.getElementById("imageBgFeather").value = "0";
    document.getElementById("imageRemoveBgBtn").click();
    await new Promise((resolve) => setTimeout(resolve, 150));
    const c = window.ImageWorkspace.getWorkCanvas();
    const data = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
    const alphaAt = (x, y) => data[(y * c.width + x) * 4 + 3];
    return {
      ok,
      hasModule: !!window.ImageBgRemoval,
      controls: {
        button: !!document.getElementById("imageRemoveBgBtn"),
        threshold: !!document.getElementById("imageBgThreshold"),
        feather: !!document.getElementById("imageBgFeather"),
      },
      size: [c.width, c.height],
      centerAlpha: alphaAt(Math.floor(c.width / 2), Math.floor(c.height / 2)),
      cornerAlpha: alphaAt(0, 0),
      historyOps: state.imageEditor.history.map((h) => h.op),
      busy: document.getElementById("imageRemoveBgBtn").disabled,
      status: document.getElementById("imageBgStatus").textContent,
    };
  }, imgBase64);

  console.log("  bg removal:", result);
  expect(result.hasModule, "window.ImageBgRemoval is installed");
  expect(result.controls.button && result.controls.threshold && result.controls.feather, "background-removal controls exist");
  expect(result.ok, "provided JPG loads into Image workspace");
  expect(result.size[0] > 100 && result.size[1] > 100, "provided JPG dimensions are preserved");
  expect(result.centerAlpha > 240, "foreground mask keeps center opaque");
  expect(result.cornerAlpha === 0, "background mask makes corner transparent");
  expect(result.historyOps.includes("remove background"), "Remove Background pushes history");
  expect(!result.busy, "Remove Background button re-enables after completion");
  expect(/removed/i.test(result.status), "status label reports completion");

  await browser.close();
  server.close();
  if (failed > 0) {
    console.error(`\n${failed} assertion(s) failed.`);
    process.exit(1);
  }
  console.log("\nAll Phase 3 background-removal tests passed.");
}

main().catch((e) => { console.error(e); process.exit(1); });
