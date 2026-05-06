// E2E demo for puppet-warp Phase 1: drives the entire pipeline through
// window.ai (no DOM clicks). Verifies:
//
//   1. Editor loads with puppet-warp tools registered
//   2. Import an image → mesh exists
//   3. Enable puppet warp on the active slot's attachment
//   4. Add 3 pins
//   5. Drag one pin → meshData.offsets become non-zero
//   6. Save native project JSON → reload → pins survive

const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const PORT = 5183;
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

function makeTestPngDataUrl() {
  const W = 64, H = 64;
  const raw = Buffer.alloc(H * (1 + W * 4));
  for (let y = 0; y < H; y += 1) {
    raw[y * (1 + W * 4)] = 0;
    for (let x = 0; x < W; x += 1) {
      const o = y * (1 + W * 4) + 1 + x * 4;
      raw[o] = 0x80; raw[o + 1] = 0xc0; raw[o + 2] = 0x40; raw[o + 3] = 0xff;
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

function divider(t) {
  console.log("\n" + "=".repeat(70) + "\n " + t + "\n" + "=".repeat(70));
}

let failed = 0;
function expect(cond, msg) {
  if (!cond) { console.error("  FAIL:", msg); failed += 1; }
  else console.log("  PASS:", msg);
}

async function main() {
  const server = await startStaticServer();
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  page.on("pageerror", (e) => { console.error("[pageerror]", e.message); failed += 1; });
  page.on("console", (m) => {
    if (m.type() === "error") console.error("[browser:error]", m.text());
  });

  await page.goto(ORIGIN + "/index.html");
  await page.waitForFunction(() => !!window.ai && typeof state !== "undefined" && !!window.PuppetWarpRuntime, { timeout: 8000 });

  divider("STEP 1 — Editor loaded, puppet-warp libs available");
  const probe = await page.evaluate(() => ({
    hasSC: !!window.SparseCholesky,
    hasPW: !!window.PuppetWarp,
    hasPWR: !!window.PuppetWarpRuntime,
    pwTools: window.ai.tools().filter((t) => t.id.startsWith("ai.puppetwarp_")).map((t) => t.id),
  }));
  expect(probe.hasSC, "window.SparseCholesky present");
  expect(probe.hasPW, "window.PuppetWarp present");
  expect(probe.hasPWR, "window.PuppetWarpRuntime present");
  expect(probe.pwTools.length === 6, `6 puppet-warp AI tools registered (got ${probe.pwTools.length})`);

  divider("STEP 2 — Import image");
  const imp = await page.evaluate((d) => window.ai.invoke("ai.import_image", { dataUrl: d, name: "test.png" }), makeTestPngDataUrl());
  expect(imp.ok, "import_image ok");
  const meshState = await page.evaluate(() => {
    const att = getActiveAttachment(state.slots[0]);
    return {
      hasMeshData: !!(att && att.meshData),
      vCount: att && att.meshData ? att.meshData.positions.length / 2 : 0,
    };
  });
  expect(meshState.hasMeshData, "active attachment has meshData");
  expect(meshState.vCount >= 4, `mesh has ≥ 4 vertices (got ${meshState.vCount})`);

  divider("STEP 3 — Enable puppet warp");
  const en = await page.evaluate(() => window.ai.invoke("ai.puppetwarp_enable", { slotIndex: 0, mode: "standalone" }));
  expect(en.ok, "enable ok");
  const pwState = await page.evaluate(() => window.ai.invoke("ai.puppetwarp_get_state", { slotIndex: 0 }));
  expect(pwState.result && pwState.result.enabled === true, "puppet warp persists in state.slots[0]");
  expect(pwState.result && pwState.result.mode === "standalone", "mode is standalone");

  divider("STEP 4 — Add 3 pins");
  const pickPins = await page.evaluate(() => {
    const att = getActiveAttachment(state.slots[0]);
    const n = att.meshData.positions.length / 2;
    return [0, Math.floor(n / 2), n - 1];
  });
  const pin0 = await page.evaluate((vi) => window.ai.invoke("ai.puppetwarp_add_pin", { slotIndex: 0, vertexIndex: vi }), pickPins[0]);
  const pin1 = await page.evaluate((vi) => window.ai.invoke("ai.puppetwarp_add_pin", { slotIndex: 0, vertexIndex: vi }), pickPins[1]);
  const pin2 = await page.evaluate((vi) => window.ai.invoke("ai.puppetwarp_add_pin", { slotIndex: 0, vertexIndex: vi }), pickPins[2]);
  expect(pin0.ok && pin1.ok && pin2.ok, "all 3 add_pin calls returned ok");
  const stateAfterPins = await page.evaluate(() => window.ai.invoke("ai.puppetwarp_get_state", { slotIndex: 0 }));
  expect(stateAfterPins.result && stateAfterPins.result.pinCount === 3, `state has 3 pins (got ${stateAfterPins.result && stateAfterPins.result.pinCount})`);

  divider("STEP 5 — Drag one pin → check offsets become non-zero");
  // Find middle pin id from current state
  const midPin = stateAfterPins.result.pins[1];
  const drag = await page.evaluate(([pid, x, y]) => window.ai.invoke("ai.puppetwarp_drag_pin", { slotIndex: 0, pinId: pid, x, y }), [midPin.id, midPin.restX + 30, midPin.restY + 15]);
  expect(drag.ok, "drag_pin ok");
  const offsetSummary = await page.evaluate(() => {
    const att = getActiveAttachment(state.slots[0]);
    const off = att.meshData.offsets;
    let max = 0; let nonZero = 0;
    for (let i = 0; i < off.length; i += 1) {
      if (off[i] !== 0) nonZero += 1;
      if (Math.abs(off[i]) > max) max = Math.abs(off[i]);
    }
    return { length: off.length, nonZero, maxAbs: max };
  });
  console.log("  offsets after drag:", offsetSummary);
  expect(offsetSummary.nonZero > 0, "offsets contain non-zero values");
  expect(offsetSummary.maxAbs > 5, `max offset magnitude > 5 (got ${offsetSummary.maxAbs.toFixed(2)})`);

  divider("STEP 6 — Native project round-trip preserves puppet warp");
  const exp = await page.evaluate(() => window.ai.invoke("ai.export_project_json"));
  expect(exp.ok, "export_project_json ok");
  const projData = exp.result.data;
  const slot0Att = projData.slots[0].attachments[0];
  expect(!!slot0Att.puppetWarp, "exported slots[0].attachments[0].puppetWarp exists");
  if (slot0Att.puppetWarp) {
    expect(slot0Att.puppetWarp.pins.length === 3, `exported has 3 pins (got ${slot0Att.puppetWarp.pins.length})`);
    expect(slot0Att.puppetWarp.mode === "standalone", `exported mode is standalone (got ${slot0Att.puppetWarp.mode})`);
  }
  const reload = await page.evaluate((j) => window.ai.invoke("ai.load_project", { json: j }), projData);
  expect(reload.ok, "load_project ok");
  const afterReload = await page.evaluate(() => window.ai.invoke("ai.puppetwarp_get_state", { slotIndex: 0 }));
  expect(afterReload.ok && afterReload.result.enabled, "puppet warp still enabled after reload");
  expect(afterReload.result && afterReload.result.pinCount === 3, `3 pins after reload (got ${afterReload.result && afterReload.result.pinCount})`);

  if (failed > 0) {
    console.error(`\n${failed} assertion(s) failed.`);
    await browser.close();
    server.close();
    process.exit(1);
  }
  console.log("\nAll puppet-warp Phase 1 demo steps passed.");
  await browser.close();
  server.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
