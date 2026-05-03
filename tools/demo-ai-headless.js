// Demo: drive the editor headlessly via window.ai (no UI, no clicks).
// Proves the AI bridge can do a full I/O loop:
//   1. Import a synthetic image
//   2. Read state
//   3. Mutate (set animation time)
//   4. Screenshot
//   5. Export Spine JSON
//   6. Round-trip: export native project, reload from object, verify
//
// Run with: node tools/demo-ai-headless.js

const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 5176;
const ORIGIN = `http://127.0.0.1:${PORT}`;

function startStaticServer() {
  const root = path.resolve(__dirname, "..");
  const types = {
    ".html": "text/html", ".js": "application/javascript",
    ".css": "text/css", ".json": "application/json",
    ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml",
    ".wasm": "application/wasm", ".map": "application/json",
  };
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split("?")[0]);
    let p = path.join(root, url === "/" ? "/index.html" : url);
    if (!p.startsWith(root)) { res.statusCode = 403; return res.end("forbidden"); }
    fs.stat(p, (err, st) => {
      if (err) { res.statusCode = 404; return res.end("not found"); }
      if (st.isDirectory()) p = path.join(p, "index.html");
      const ext = path.extname(p).toLowerCase();
      res.setHeader("Content-Type", types[ext] || "application/octet-stream");
      fs.createReadStream(p).pipe(res);
    });
  });
  return new Promise((r) => server.listen(PORT, "127.0.0.1", () => r(server)));
}

// 64x64 red square PNG generated via zlib at runtime — guaranteed
// non-degenerate so headless Chromium's createImageBitmap accepts it.
function makeTestPngDataUrl() {
  const zlib = require("zlib");
  const W = 64, H = 64;
  const raw = Buffer.alloc(H * (1 + W * 4));
  for (let y = 0; y < H; y += 1) {
    raw[y * (1 + W * 4)] = 0;
    for (let x = 0; x < W; x += 1) {
      const o = y * (1 + W * 4) + 1 + x * 4;
      raw[o] = 0xff; raw[o + 1] = 0x40; raw[o + 2] = 0x40; raw[o + 3] = 0xff;
    }
  }
  function chunk(type, data) {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
    const t = Buffer.from(type, "ascii");
    const crcBuf = Buffer.concat([t, data]);
    let c = ~0;
    for (let i = 0; i < crcBuf.length; i += 1) {
      c ^= crcBuf[i];
      for (let k = 0; k < 8; k += 1) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
    const crc = Buffer.alloc(4); crc.writeUInt32BE((~c) >>> 0, 0);
    return Buffer.concat([len, t, data, crc]);
  }
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const idat = zlib.deflateSync(raw);
  const png = Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
  return "data:image/png;base64," + png.toString("base64");
}
const TEST_PNG_DATA_URL = makeTestPngDataUrl();

function divider(t) {
  console.log("\n" + "=".repeat(70) + "\n " + t + "\n" + "=".repeat(70));
}

async function main() {
  const server = await startStaticServer();
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.error("[pageerror]", e.message));
  page.on("console", (m) => {
    if (m.type() === "error") console.error("[browser:error]", m.text());
  });

  await page.goto(ORIGIN + "/index.html");
  await page.waitForFunction(() => !!window.ai && typeof state !== "undefined", { timeout: 8000 });

  divider("STEP 1 — Import image headlessly via ai.import_image");
  const importR = await page.evaluate(async (durl) => {
    return await window.ai.invoke("ai.import_image", { dataUrl: durl, name: "red.png" });
  }, TEST_PNG_DATA_URL);
  console.log("  ->", JSON.stringify({ ok: importR.ok, result: importR.result, error: importR.error }));

  divider("STEP 2 — Read state");
  const snap = await page.evaluate(() => window.ai.query("snapshot"));
  console.log("  ->", JSON.stringify(snap.debug || snap));

  divider("STEP 3 — Inspect bridge-owned ai.* tools");
  const aiTools = await page.evaluate(() => window.ai.tools().filter((t) => t.id.startsWith("ai.")));
  console.log(`  found ${aiTools.length} bridge tools:`);
  for (const t of aiTools) console.log(`    ${t.id.padEnd(28)} domain=${t.domain.padEnd(10)} args=${t.args.length}`);

  divider("STEP 4 — Mutate: set animation time, screenshot");
  await page.evaluate(() => window.ai.invoke("ai.set_animation_time", { time: 0.5 }));
  await page.evaluate(() => window.ai.waitFor("render"));
  const shotR = await page.evaluate(() => window.ai.invoke("ai.screenshot"));
  const shotPath = path.resolve(__dirname, "ai-screenshot.png");
  if (shotR.ok) {
    const b64 = shotR.result.dataUrl.split(",")[1];
    fs.writeFileSync(shotPath, Buffer.from(b64, "base64"));
    console.log(`  -> screenshot ${shotR.result.width}x${shotR.result.height} written to ${shotPath}`);
  } else {
    console.log("  -> screenshot failed:", shotR.error);
  }

  divider("STEP 5 — Export Spine JSON");
  const spineR = await page.evaluate(() => window.ai.invoke("ai.export_spine_json"));
  if (spineR.ok) {
    const j = spineR.result.data;
    console.log("  -> spine json keys:", Object.keys(j || {}));
    console.log(`  -> bones: ${(j.bones || []).length}, slots: ${(j.slots || []).length}, animations: ${Object.keys(j.animations || {}).length}`);
  } else {
    console.log("  -> export failed:", spineR.error);
  }

  divider("STEP 6 — Round-trip: export project, reload from object");
  const proj = await page.evaluate(() => window.ai.invoke("ai.export_project_json"));
  if (!proj.ok) {
    console.log("  -> export project failed:", proj.error);
  } else {
    const slotsBefore = await page.evaluate(() => state.slots.length);
    // wipe via ai.invoke('file.new')
    await page.evaluate(() => window.ai.invoke("file.new"));
    // accept the confirm dialog if any (the editor's "new" may prompt). Skip; in headless tests the action just runs.
    const slotsMid = await page.evaluate(() => state.slots.length);
    const reload = await page.evaluate((j) => window.ai.invoke("ai.load_project", { json: j }), proj.result.data);
    const slotsAfter = await page.evaluate(() => state.slots.length);
    console.log(`  -> slots before/mid/after: ${slotsBefore}/${slotsMid}/${slotsAfter}`);
    console.log("  -> reload result:", JSON.stringify({ ok: reload.ok, error: reload.error, result: reload.result }));
  }

  divider("DONE");
  await browser.close();
  server.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
