// Phase 2 demo: animated puppet-warp pins.
//
// Verifies:
//   1. Phase 2 AI tools registered (set_pin_keyframe / delete / list)
//   2. Set keyframes on a pin at t=0 and t=1.0 with different targets
//   3. List keyframes confirms 2 entries on that pin's track
//   4. Scrub animation time → offsets follow ARAP solution at sampled position
//   5. Native JSON round-trip preserves keyframes
//   6. Delete keyframe works

const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const PORT = 5184;
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

function divider(t) { console.log("\n" + "=".repeat(70) + "\n " + t + "\n" + "=".repeat(70)); }
let failed = 0;
function expect(cond, msg) { if (!cond) { console.error("  FAIL:", msg); failed += 1; } else console.log("  PASS:", msg); }

async function main() {
  const server = await startStaticServer();
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  page.on("pageerror", (e) => { console.error("[pageerror]", e.message); failed += 1; });
  page.on("console", (m) => { if (m.type() === "error") console.error("[browser:error]", m.text()); });

  await page.goto(ORIGIN + "/index.html");
  await page.waitForFunction(() => !!window.ai && typeof state !== "undefined" && !!window.PuppetWarpRuntime, { timeout: 8000 });

  divider("STEP 1 — Phase 2 AI tools registered");
  const tools = await page.evaluate(() => window.ai.tools().filter((t) => t.id.startsWith("ai.puppetwarp_")).map((t) => t.id));
  expect(tools.includes("ai.puppetwarp_set_pin_keyframe"), "ai.puppetwarp_set_pin_keyframe registered");
  expect(tools.includes("ai.puppetwarp_delete_pin_keyframe"), "ai.puppetwarp_delete_pin_keyframe registered");
  expect(tools.includes("ai.puppetwarp_list_pin_keyframes"), "ai.puppetwarp_list_pin_keyframes registered");
  expect(tools.length === 9, `9 puppetwarp tools total (got ${tools.length})`);

  divider("STEP 2 — Setup: import + enable puppet warp + add pins");
  await page.evaluate((d) => window.ai.invoke("ai.import_image", { dataUrl: d, name: "test.png" }), makeTestPngDataUrl());
  await page.evaluate(() => window.ai.invoke("ai.puppetwarp_enable", { slotIndex: 0, mode: "standalone" }));
  const pins = await page.evaluate(() => {
    const att = getActiveAttachment(state.slots[0]);
    const n = att.meshData.positions.length / 2;
    return [0, Math.floor(n / 2), n - 1];
  });
  const pin0 = await page.evaluate((vi) => window.ai.invoke("ai.puppetwarp_add_pin", { slotIndex: 0, vertexIndex: vi }), pins[0]);
  const pin1 = await page.evaluate((vi) => window.ai.invoke("ai.puppetwarp_add_pin", { slotIndex: 0, vertexIndex: vi }), pins[1]);
  expect(pin0.ok && pin1.ok, "pins added");
  const midPinId = pin1.result.pin.id;
  const restMid = { x: pin1.result.pin.restX, y: pin1.result.pin.restY };

  divider("STEP 3 — Set 2 keyframes on the middle pin (t=0 rest, t=1 displaced)");
  const k0 = await page.evaluate(([pid, x, y]) => window.ai.invoke("ai.puppetwarp_set_pin_keyframe", { slotIndex: 0, pinId: pid, time: 0, x, y }), [midPinId, restMid.x, restMid.y]);
  expect(k0.ok, "keyframe at t=0 set");
  const k1 = await page.evaluate(([pid, x, y]) => window.ai.invoke("ai.puppetwarp_set_pin_keyframe", { slotIndex: 0, pinId: pid, time: 1, x, y }), [midPinId, restMid.x + 30, restMid.y + 15]);
  expect(k1.ok, "keyframe at t=1 set");

  divider("STEP 4 — List keyframes confirms 2 entries on that pin's track");
  const listed = await page.evaluate(([pid]) => window.ai.invoke("ai.puppetwarp_list_pin_keyframes", { slotIndex: 0, pinId: pid }), [midPinId]);
  expect(listed.ok, "list ok");
  const trackInfo = listed.result.tracks[0];
  expect(trackInfo && trackInfo.keyframes.length === 2, `track has 2 keyframes (got ${trackInfo && trackInfo.keyframes.length})`);

  divider("STEP 5 — Scrub time → offsets follow ARAP solution");
  // Set time to 0.5 and let samplePoseAtTime drive the puppet warp runtime
  await page.evaluate(() => window.ai.invoke("ai.set_animation_time", { time: 0.5 }));
  await page.waitForTimeout(150);
  const offMid = await page.evaluate(() => {
    const att = getActiveAttachment(state.slots[0]);
    const off = att.meshData.offsets;
    let max = 0;
    for (let i = 0; i < off.length; i += 1) if (Math.abs(off[i]) > max) max = Math.abs(off[i]);
    return { maxAbs: max };
  });
  console.log("  offsets at t=0.5:", offMid);
  // At t=0.5, target is (rest + 15, rest + 7.5) — expect notable offset
  expect(offMid.maxAbs > 5, `mid-time max offset > 5 (got ${offMid.maxAbs.toFixed(2)})`);

  // At t=0 the pin is at rest → offsets should be near zero
  await page.evaluate(() => window.ai.invoke("ai.set_animation_time", { time: 0 }));
  await page.waitForTimeout(150);
  const off0 = await page.evaluate(() => {
    const att = getActiveAttachment(state.slots[0]);
    const off = att.meshData.offsets;
    let max = 0;
    for (let i = 0; i < off.length; i += 1) if (Math.abs(off[i]) > max) max = Math.abs(off[i]);
    return { maxAbs: max };
  });
  console.log("  offsets at t=0:", off0);
  expect(off0.maxAbs < 1, `at t=0 offsets near zero (got ${off0.maxAbs.toFixed(3)})`);

  divider("STEP 6 — Native JSON round-trip preserves pin keyframes");
  const exp = await page.evaluate(() => window.ai.invoke("ai.export_project_json"));
  expect(exp.ok, "export ok");
  const projData = exp.result.data;
  // Find the puppetpin tracks in the exported animation. Tracks live under
  // anim.tracks keyed by id; find any with 'puppetpin:' substring.
  const animTracks = projData.animations && projData.animations[0] && projData.animations[0].tracks ? projData.animations[0].tracks : null;
  const pinTrackIds = animTracks ? Object.keys(animTracks).filter((id) => id.includes("puppetpin:")) : [];
  console.log("  exported puppetpin track ids:", pinTrackIds);
  expect(pinTrackIds.length === 1, `1 puppetpin track exported (got ${pinTrackIds.length})`);
  if (pinTrackIds[0]) {
    expect(animTracks[pinTrackIds[0]].length === 2, `exported track has 2 keys (got ${animTracks[pinTrackIds[0]].length})`);
  }
  const reload = await page.evaluate((j) => window.ai.invoke("ai.load_project", { json: j }), projData);
  expect(reload.ok, "reload ok");
  const reloadedKeys = await page.evaluate(([pid]) => window.ai.invoke("ai.puppetwarp_list_pin_keyframes", { slotIndex: 0, pinId: pid }), [midPinId]);
  expect(reloadedKeys.ok && reloadedKeys.result.tracks[0] && reloadedKeys.result.tracks[0].keyframes.length === 2, `reloaded track has 2 keys (got ${reloadedKeys.result.tracks[0] && reloadedKeys.result.tracks[0].keyframes.length})`);

  divider("STEP 7 — Delete keyframe");
  const del = await page.evaluate(([pid]) => window.ai.invoke("ai.puppetwarp_delete_pin_keyframe", { slotIndex: 0, pinId: pid, time: 1 }), [midPinId]);
  expect(del.ok, "delete ok");
  const afterDel = await page.evaluate(([pid]) => window.ai.invoke("ai.puppetwarp_list_pin_keyframes", { slotIndex: 0, pinId: pid }), [midPinId]);
  expect(afterDel.result.tracks[0] && afterDel.result.tracks[0].keyframes.length === 1, "1 keyframe remains after delete");

  if (failed > 0) {
    console.error(`\n${failed} assertion(s) failed.`);
    await browser.close();
    server.close();
    process.exit(1);
  }
  console.log("\nAll Phase 2 demo steps passed.");
  await browser.close();
  server.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
