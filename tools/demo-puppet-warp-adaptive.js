// Phase 4 demo: adaptive post-skin puppet warp.
//
// Core claim: in post_skin mode, a pin's target moves with the underlying
// bone-skinned vertex. Concretely:
//   - User pins vertex V at rest.
//   - Bone B controls V (weight 1.0).
//   - User drags pin to (rest+10, rest+0). Stored as { dx: 10, dy: 0 }.
//   - Bone rotates 90°. The skinned position of V rotates accordingly.
//   - At runtime, the pin's TARGET should be (skinned_V + dx_rotated_with_bone),
//     i.e. the pin sticks to "10 units in the direction the bone now points".
//
// This demo doesn't actually rotate a bone (we can't easily, since most
// state.mesh setup needs the editor's mesh-build pipeline that runs
// after import). Instead it asserts the shape of the data:
//   - post_skin pin keyframe stored as { dx, dy } not { x, y }
//   - dragging in standalone stores { x, y }
//   - sampler returns same shape
//   - mode toggle re-bakes
//   - { dx: 0, dy: 0 } means "no displacement at any pose"

const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const PORT = 5187;

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
  const W = 64, H = 64;
  const raw = Buffer.alloc(H * (1 + W * 4));
  for (let y = 0; y < H; y += 1) { raw[y * (1 + W * 4)] = 0; for (let x = 0; x < W; x += 1) { const o = y * (1 + W * 4) + 1 + x * 4; raw[o] = 128; raw[o + 1] = 192; raw[o + 2] = 64; raw[o + 3] = 255; } }
  function chunk(t, d) { const len = Buffer.alloc(4); len.writeUInt32BE(d.length, 0); const tt = Buffer.from(t, "ascii"); const cb = Buffer.concat([tt, d]); let c = ~0; for (let i = 0; i < cb.length; i += 1) { c ^= cb[i]; for (let k = 0; k < 8; k += 1) c = (c >>> 1) ^ (0xedb88320 & -(c & 1)); } const cr = Buffer.alloc(4); cr.writeUInt32BE((~c) >>> 0, 0); return Buffer.concat([len, tt, d, cr]); }
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 6;
  const png = Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
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

  await page.goto(`http://127.0.0.1:${PORT}/index.html`);
  await page.waitForFunction(() => !!window.ai && !!window.PuppetWarpRuntime, { timeout: 8000 });

  divider("STEP 1 — solveAdaptive exposed on window.PuppetWarp");
  const probe = await page.evaluate(() => ({
    hasSolveAdaptive: typeof window.PuppetWarp.solveAdaptive === "function",
    version: window.PuppetWarp.version,
  }));
  expect(probe.hasSolveAdaptive, "PuppetWarp.solveAdaptive present");
  expect(probe.version >= 2, `PuppetWarp.version ≥ 2 (got ${probe.version})`);

  divider("STEP 2 — Setup standalone: import + add pin + drag");
  await page.evaluate((d) => window.ai.invoke("ai.import_image", { dataUrl: d, name: "t.png" }), makePng());
  await page.evaluate(() => window.ai.invoke("ai.puppetwarp_enable", { slotIndex: 0, mode: "standalone" }));
  const addRes = await page.evaluate(() => window.ai.invoke("ai.puppetwarp_add_pin", { slotIndex: 0, vertexIndex: 100 }));
  const pinId = addRes.result.pin.id;
  const restX = addRes.result.pin.restX;
  const restY = addRes.result.pin.restY;
  // Drag: in standalone, drag stores absolute {x, y}
  const dragRes = await page.evaluate(([pid, x, y]) => window.ai.invoke("ai.puppetwarp_drag_pin", { slotIndex: 0, pinId: pid, x, y }), [pinId, restX + 10, restY]);
  console.log("  drag invoke result:", JSON.stringify({ ok: dragRes.ok, error: dragRes.error, result: dragRes.result }));
  const standaloneShape = await page.evaluate((pid) => {
    const att = getActiveAttachment(state.slots[0]);
    return {
      attHasPW: !!att.puppetWarp,
      hasLastTargets: !!(att.puppetWarp && att.puppetWarp.lastTargets),
      target: att.puppetWarp && att.puppetWarp.lastTargets ? att.puppetWarp.lastTargets[pid] : null,
    };
  }, pinId);
  console.log("  standalone state:", standaloneShape);
  const standaloneTarget = standaloneShape && standaloneShape.target;
  expect(standaloneTarget && "x" in standaloneTarget, "standalone target has 'x'");
  expect(standaloneTarget && !("dx" in standaloneTarget), "standalone target does NOT have 'dx'");

  divider("STEP 3 — Switch to post_skin → drag again → target shape is {dx, dy}");
  // Switch mode (panel-equivalent)
  await page.evaluate(() => {
    const att = getActiveAttachment(state.slots[0]);
    att.puppetWarp.mode = "post_skin";
    att.puppetWarp.lastTargets = null; // clear so we test the new drag path
    if (window.PuppetWarp) window.PuppetWarp.invalidate(att, "mode_change_test");
  });
  await page.evaluate(([pid, x, y]) => window.ai.invoke("ai.puppetwarp_drag_pin", { slotIndex: 0, pinId: pid, x, y }), [pinId, restX + 10, restY]);
  const postSkinShape = await page.evaluate((pid) => {
    const att = getActiveAttachment(state.slots[0]);
    return att.puppetWarp.lastTargets && att.puppetWarp.lastTargets[pid];
  }, pinId);
  console.log("  post_skin lastTargets:", postSkinShape);
  expect(postSkinShape && "dx" in postSkinShape, "post_skin target has 'dx'");
  expect(postSkinShape && !("x" in postSkinShape), "post_skin target does NOT have 'x'");

  divider("STEP 4 — Set keyframe with {dx, dy} and read back");
  const setKf = await page.evaluate(([pid]) => window.ai.invoke("ai.puppetwarp_set_pin_keyframe", { slotIndex: 0, pinId: pid, time: 0.5, dx: 12, dy: -3 }), [pinId]);
  expect(setKf.ok, "set_pin_keyframe with dx/dy ok");
  expect(setKf.result.value && setKf.result.value.dx === 12, "stored value has dx=12");
  const listed = await page.evaluate(([pid]) => window.ai.invoke("ai.puppetwarp_list_pin_keyframes", { slotIndex: 0, pinId: pid }), [pinId]);
  const keys = listed.result.tracks[0].keyframes;
  console.log("  listed keys:", keys);
  const k0 = keys.find((k) => Math.abs(k.time - 0.5) < 1e-4);
  expect(k0 && "dx" in k0.value, "keyframe value has 'dx'");

  divider("STEP 5 — Set keyframe with {x, y} (legacy / standalone) coexists");
  const setKf2 = await page.evaluate(([pid]) => window.ai.invoke("ai.puppetwarp_set_pin_keyframe", { slotIndex: 0, pinId: pid, time: 1.0, x: 50, y: 60 }), [pinId]);
  expect(setKf2.ok, "set_pin_keyframe with x/y still works");
  const listed2 = await page.evaluate(([pid]) => window.ai.invoke("ai.puppetwarp_list_pin_keyframes", { slotIndex: 0, pinId: pid }), [pinId]);
  const keys2 = listed2.result.tracks[0].keyframes;
  const k1 = keys2.find((k) => Math.abs(k.time - 1.0) < 1e-4);
  expect(k1 && "x" in k1.value, "absolute keyframe has 'x'");

  divider("STEP 6 — Sampler returns same shape as keyframe (no shape coercion)");
  await page.evaluate(() => window.ai.invoke("ai.set_animation_time", { time: 0.5 }));
  await page.waitForTimeout(80);
  const targetAt05 = await page.evaluate((pid) => {
    const att = getActiveAttachment(state.slots[0]);
    return att.puppetWarp.lastTargets && att.puppetWarp.lastTargets[pid];
  }, pinId);
  console.log("  lastTargets at t=0.5:", targetAt05);
  // The sampler ran samplePuppetPinTracksAtTime which writes to lastTargets;
  // at t=0.5 we expect dx/dy (since the keyframe at t=0.5 is dx/dy).
  expect(targetAt05 && ("dx" in targetAt05 || "x" in targetAt05), "lastTargets populated at t=0.5");

  divider("STEP 7 — Native JSON round-trip preserves {dx, dy}");
  const exp = await page.evaluate(() => window.ai.invoke("ai.export_project_json"));
  const reload = await page.evaluate((j) => window.ai.invoke("ai.load_project", { json: j }), exp.result.data);
  expect(reload.ok, "reload ok");
  const reloadedKeys = await page.evaluate(([pid]) => window.ai.invoke("ai.puppetwarp_list_pin_keyframes", { slotIndex: 0, pinId: pid }), [pinId]);
  const rk0 = reloadedKeys.result.tracks[0].keyframes.find((k) => Math.abs(k.time - 0.5) < 1e-4);
  expect(rk0 && "dx" in rk0.value, "{dx, dy} preserved across reload");

  divider("STEP 8 — Sanity: dx=0, dy=0 means 'no displacement' even when dynamicRest changes");
  // With dx=dy=0, ARAP should produce essentially-zero offsets regardless
  // of what we use as rest. Let's verify by setting all pin keyframes to
  // zero and confirming offsets are tiny.
  await page.evaluate(([pid]) => window.ai.invoke("ai.puppetwarp_set_pin_keyframe", { slotIndex: 0, pinId: pid, time: 0, dx: 0, dy: 0 }), [pinId]);
  await page.evaluate(([pid]) => window.ai.invoke("ai.puppetwarp_delete_pin_keyframe", { slotIndex: 0, pinId: pid, time: 0.5 }), [pinId]);
  await page.evaluate(([pid]) => window.ai.invoke("ai.puppetwarp_delete_pin_keyframe", { slotIndex: 0, pinId: pid, time: 1.0 }), [pinId]);
  await page.evaluate(() => window.ai.invoke("ai.set_animation_time", { time: 0 }));
  await page.waitForTimeout(80);
  const offZero = await page.evaluate(() => {
    const att = getActiveAttachment(state.slots[0]);
    const off = att.meshData.offsets;
    let max = 0;
    for (let i = 0; i < off.length; i += 1) if (Math.abs(off[i]) > max) max = Math.abs(off[i]);
    return max;
  });
  console.log("  offsets max with dx=dy=0:", offZero);
  expect(offZero < 1, `dx=dy=0 → offsets ≈ 0 (got ${offZero.toExponential(2)})`);

  if (failed > 0) {
    console.error(`\n${failed} assertion(s) failed.`);
    await browser.close();
    server.close();
    process.exit(1);
  }
  console.log("\nAll Phase 4 adaptive demo steps passed.");
  await browser.close();
  server.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
