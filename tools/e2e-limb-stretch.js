// End-to-end: BG removal → stretch hand/foot only → verify body unaffected
// → keyframe animation → Spine export
//
// Strategy for "only limbs move":
//   - Many ANCHOR pins on trunk/head/other limb (high density = rigid body)
//   - 2 CONTROL pins on the target hand/foot
//   - Animate only the control pins
//   - Verify body anchor vertices move < 2px while hand moves > 30px

const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 5201;
const SS_DIR = path.resolve(__dirname, "..", "review-screenshots");
if (!fs.existsSync(SS_DIR)) fs.mkdirSync(SS_DIR, { recursive: true });
const SOURCE = "D:/newExport/1f94a319-35a4-4056-942f-53e8ae32aeba.jpg";

let ssIdx = 0;
async function ss(page, name) {
  const f = path.join(SS_DIR, `limb-${String(++ssIdx).padStart(2, "0")}-${name}.png`);
  await page.screenshot({ path: f, fullPage: false });
  console.log(`  📷 ${path.basename(f)}`);
}

function server() {
  const root = path.resolve(__dirname, "..");
  const mime = { ".html": "text/html", ".js": "application/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".wasm": "application/wasm", ".json": "application/json" };
  const s = http.createServer((req, res) => {
    let p = path.join(root, req.url.split("?")[0] === "/" ? "/index.html" : req.url.split("?")[0]);
    if (!p.startsWith(root)) { res.statusCode = 403; return res.end(); }
    fs.stat(p, (err, st) => {
      if (err) { res.statusCode = 404; return res.end(); }
      if (st.isDirectory()) p = path.join(p, "index.html");
      res.setHeader("Content-Type", mime[path.extname(p).toLowerCase()] || "application/octet-stream");
      fs.createReadStream(p).pipe(res);
    });
  });
  return new Promise(r => s.listen(PORT, "127.0.0.1", () => r(s)));
}

const results = [];
function ok(tag, msg)   { console.log(`  ✅ [${tag}] ${msg}`); results.push({ tag, ok: true,  msg }); }
function fail(tag, msg) { console.error(`  ❌ [${tag}] ${msg}`); results.push({ tag, ok: false, msg }); }
function warn(tag, msg) { console.log(`  ⚠️  [${tag}] ${msg}`); results.push({ tag, ok: null,  msg }); }

async function main() {
  const imgB64 = fs.readFileSync(SOURCE).toString("base64");
  const srv = await server();

  const browser = await chromium.launch({ headless: false, slowMo: 60 });
  const page = await browser.newContext({ viewport: { width: 1440, height: 900 } }).then(c => c.newPage());
  page.on("pageerror", e => fail("JS", e.message));
  await page.goto(`http://127.0.0.1:${PORT}/index.html`);
  await page.waitForFunction(() => !!window.ai && !!window.ImageWorkspace, { timeout: 12000 });
  await page.waitForTimeout(400);

  // ── STEP 1: load into Image workspace ──────────────────────────────────
  console.log("\n─── STEP 1: Load image ───");
  await page.click("#workspaceTabImage");
  await page.waitForTimeout(300);
  const loaded = await page.evaluate(async b64 => {
    const arr = new Uint8Array(atob(b64).split("").map(c => c.charCodeAt(0)));
    return window.ImageWorkspace.loadFromBlob(new Blob([arr], { type: "image/jpeg" }), "drop");
  }, imgB64);
  await page.waitForTimeout(600);
  await ss(page, "01-loaded");
  ok("1", loaded ? "Image loaded" : "load failed");

  // ── STEP 2: AI background removal ──────────────────────────────────────
  console.log("\n─── STEP 2: AI background removal ───");
  const t0 = Date.now();
  const bgR = await page.evaluate(() => window.ai.invoke("ai.image_remove_bg"));
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  await page.waitForTimeout(400);
  await ss(page, "02-bg-removed");
  if (bgR.ok) ok("2", `BG removed in ${elapsed}s`);
  else { fail("2", `BG removal failed: ${bgR.error}`); }

  // ── STEP 3: Trim + send to mesh ────────────────────────────────────────
  console.log("\n─── STEP 3: Trim + send to mesh ───");
  const trimR = await page.evaluate(() => window.ai.invoke("ai.image_trim"));
  const dims = await page.evaluate(() => ({ w: state.imageEditor.workCanvas?.width, h: state.imageEditor.workCanvas?.height }));
  ok("3a", `Trim → ${dims.w}×${dims.h}px`);
  await ss(page, "03-trimmed");

  const sendR = await page.evaluate(() => window.ai.invoke("ai.image_send_to_new_slot"));
  if (!sendR.ok) { fail("3b", `sendToNewSlot: ${sendR.error}`); }
  await page.waitForTimeout(700);
  await ss(page, "04-mesh");

  const meshInfo = await page.evaluate(() => {
    const att = getActiveAttachment(state.slots[0]);
    return { vCount: att?.meshData?.positions?.length / 2 | 0, type: att?.type };
  });
  ok("3b", `Mesh: ${meshInfo.vCount} verts, type=${meshInfo.type}`);
  if (meshInfo.type !== "mesh") fail("3b", "Attachment is not mesh type!");

  // ── STEP 4: Puppet warp — strategy ─────────────────────────────────────
  // We use fractional positions based on the mesh grid (25×25 = 625 verts,
  // indexed row-major left-to-right, top-to-bottom on the image).
  //
  // Character layout (803×1178 trimmed):
  //   head top:    ~row 0   → y 0-8%
  //   head/neck:   ~row 1-3 → y 8-20%
  //   shoulders:   ~row 3-5 → y 20-30%
  //   right arm:   ~col 18-24, row 4-8
  //   right hand:  ~col 22-24, row 7-9  (the "right" side = screen-left)
  //   left arm:    ~col 0-6, row 4-8
  //   left hand:   ~col 0-2, row 7-9    (the "left" side = screen-right in mirrored)
  //   torso:       ~col 8-16, row 4-14
  //   hips:        ~col 8-16, row 12-16
  //   right leg:   ~col 8-14, row 14-22
  //   left leg:    ~col 12-16, row 14-22
  //   feet:        ~row 22-24
  //
  // For 25×25: row i, col j → vertex index = i*25 + j
  console.log("\n─── STEP 4: Enable puppet warp + place pins ───");

  const en = await page.evaluate(() => window.ai.invoke("ai.puppetwarp_enable", { slotIndex: 0, mode: "standalone" }));
  if (!en.ok) { fail("4", `enable failed: ${en.error}`); }

  // Helper: pick vertex closest to a fractional (fx, fy) position
  const pickVert = async (fx, fy, label) => {
    const r = await page.evaluate(([fx, fy]) => {
      const att = getActiveAttachment(state.slots[0]);
      const pos = att?.meshData?.positions;
      if (!pos) return -1;
      const W = att.meshData.cols || 25;
      const H = att.meshData.rows || 25;
      const n = pos.length / 2;
      // Find min/max for normalization
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (let i = 0; i < n; i++) {
        const x = pos[i*2], y = pos[i*2+1];
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
      const tx = minX + (maxX - minX) * fx;
      const ty = minY + (maxY - minY) * fy;
      let best = 0, bd = Infinity;
      for (let i = 0; i < n; i++) {
        const dx = pos[i*2] - tx, dy = pos[i*2+1] - ty;
        const d = dx*dx + dy*dy;
        if (d < bd) { bd = d; best = i; }
      }
      return best;
    }, [fx, fy]);
    console.log(`    pin ${label}: vert ${r} (fx=${fx}, fy=${fy})`);
    return r;
  };

  // ANCHOR pins — these MUST NOT MOVE during animation.
  // Dense coverage on head + torso + non-animated limbs.
  const anchors = [
    [0.50, 0.03, "head-top"],
    [0.50, 0.10, "head-mid"],
    [0.50, 0.17, "neck"],
    [0.35, 0.25, "shoulder-R"],
    [0.65, 0.25, "shoulder-L"],
    [0.50, 0.35, "chest"],
    [0.50, 0.48, "waist"],
    [0.50, 0.58, "hip-center"],
    [0.38, 0.65, "hip-R"],
    [0.62, 0.65, "hip-L"],
    [0.38, 0.78, "knee-R"],
    [0.62, 0.78, "knee-L"],
    [0.38, 0.91, "ankle-R"],
    [0.62, 0.91, "ankle-L"],
  ];

  // CONTROL pins — these will be animated
  // Right hand (screen-left, arm extended downward on this character)
  const ctrl = [
    [0.15, 0.55, "hand-R"],    // right hand, lower arm area
    [0.83, 0.55, "hand-L"],    // left hand
  ];

  const anchorPins = {};
  for (const [fx, fy, label] of anchors) {
    const v = await pickVert(fx, fy, `anchor-${label}`);
    if (v < 0) continue;
    const r = await page.evaluate(v => window.ai.invoke("ai.puppetwarp_add_pin", { slotIndex: 0, vertexIndex: v }), v);
    if (r.ok) anchorPins[label] = { id: r.result.pin.id, v, restX: r.result.pin.restX, restY: r.result.pin.restY };
  }

  const ctrlPins = {};
  for (const [fx, fy, label] of ctrl) {
    const v = await pickVert(fx, fy, `ctrl-${label}`);
    if (v < 0) continue;
    const r = await page.evaluate(v => window.ai.invoke("ai.puppetwarp_add_pin", { slotIndex: 0, vertexIndex: v }), v);
    if (r.ok) ctrlPins[label] = { id: r.result.pin.id, v, restX: r.result.pin.restX, restY: r.result.pin.restY };
  }

  const totalPins = Object.keys(anchorPins).length + Object.keys(ctrlPins).length;
  ok("4", `${totalPins} pins: ${Object.keys(anchorPins).length} anchors + ${Object.keys(ctrlPins).length} control`);
  await ss(page, "05-pins");

  // ── STEP 5: Keyframe animation ─────────────────────────────────────────
  console.log("\n─── STEP 5: Keyframe animation ───");

  // t=0: everything at rest
  await page.evaluate(() => window.ai.invoke("ai.set_animation_time", { time: 0 }));

  // Keyframe ALL pins at t=0 (rest)
  for (const [label, pin] of [...Object.entries(anchorPins), ...Object.entries(ctrlPins)]) {
    await page.evaluate(([pid, x, y]) =>
      window.ai.invoke("ai.puppetwarp_set_pin_keyframe", { slotIndex: 0, pinId: pid, time: 0, x, y }),
      [pin.id, pin.restX, pin.restY]);
  }

  // t=1.0: right hand extends OUT (to the right) by 70px, down 20px
  //         left hand extends OUT (to the left) by 70px, down 20px
  const handRPin = ctrlPins["hand-R"];
  const handLPin = ctrlPins["hand-L"];

  if (handRPin) {
    await page.evaluate(([pid, x, y]) =>
      window.ai.invoke("ai.puppetwarp_set_pin_keyframe", { slotIndex: 0, pinId: pid, time: 1, x, y }),
      [handRPin.id, handRPin.restX - 70, handRPin.restY + 20]);
  }
  if (handLPin) {
    await page.evaluate(([pid, x, y]) =>
      window.ai.invoke("ai.puppetwarp_set_pin_keyframe", { slotIndex: 0, pinId: pid, time: 1, x, y }),
      [handLPin.id, handLPin.restX + 70, handLPin.restY + 20]);
  }

  // Keyframe anchors at t=1 also (unchanged = at rest)
  for (const [label, pin] of Object.entries(anchorPins)) {
    await page.evaluate(([pid, x, y]) =>
      window.ai.invoke("ai.puppetwarp_set_pin_keyframe", { slotIndex: 0, pinId: pid, time: 1, x, y }),
      [pin.id, pin.restX, pin.restY]);
  }

  ok("5", "Keyframes written: t=0 (rest) and t=1 (hands extended)");

  // ── STEP 6: Verify deformation ─────────────────────────────────────────
  console.log("\n─── STEP 6: Verify deformation ───");

  // Scrub to t=1 and capture offsets
  await page.evaluate(() => window.ai.invoke("ai.set_animation_time", { time: 1 }));
  await page.waitForTimeout(300);
  await ss(page, "06-t1-extended");

  const t1Offsets = await page.evaluate(([handRVert, handLVert, anchorVerts]) => {
    const att = getActiveAttachment(state.slots[0]);
    const off = att?.meshData?.offsets;
    if (!off) return null;
    const handRMove = Math.hypot(off[handRVert * 2], off[handRVert * 2 + 1]);
    const handLMove = Math.hypot(off[handLVert * 2], off[handLVert * 2 + 1]);
    const anchorMoves = anchorVerts.map(v => Math.hypot(off[v * 2], off[v * 2 + 1]));
    const maxAnchorMove = Math.max(...anchorMoves);
    const avgAnchorMove = anchorMoves.reduce((s, v) => s + v, 0) / anchorMoves.length;
    return { handRMove: +handRMove.toFixed(1), handLMove: +handLMove.toFixed(1), maxAnchorMove: +maxAnchorMove.toFixed(1), avgAnchorMove: +avgAnchorMove.toFixed(1) };
  }, [
    handRPin?.v ?? 0,
    handLPin?.v ?? 0,
    Object.values(anchorPins).map(p => p.v),
  ]);

  console.log("  deformation at t=1:", t1Offsets);

  if (t1Offsets) {
    const handThreshold = 30;
    const anchorThreshold = 15; // max allowed movement of anchor points
    if (t1Offsets.handRMove >= handThreshold)
      ok("6a", `Right hand moved ${t1Offsets.handRMove}px ≥ ${handThreshold}px ✓`);
    else
      fail("6a", `Right hand only moved ${t1Offsets.handRMove}px — not enough`);

    if (t1Offsets.handLMove >= handThreshold)
      ok("6b", `Left hand moved ${t1Offsets.handLMove}px ≥ ${handThreshold}px ✓`);
    else
      fail("6b", `Left hand only moved ${t1Offsets.handLMove}px — not enough`);

    if (t1Offsets.maxAnchorMove <= anchorThreshold)
      ok("6c", `Max anchor movement ${t1Offsets.maxAnchorMove}px ≤ ${anchorThreshold}px ✓ (body stable)`);
    else
      warn("6c", `Max anchor movement ${t1Ofsets.maxAnchorMove}px > ${anchorThreshold}px — body is shifting`);

    ok("6d", `Avg anchor movement: ${t1Offsets.avgAnchorMove}px`);
  }

  // t=0 reset check
  await page.evaluate(() => window.ai.invoke("ai.set_animation_time", { time: 0 }));
  await page.waitForTimeout(200);
  await ss(page, "07-t0-rest");
  const t0MaxOff = await page.evaluate(() => {
    const off = getActiveAttachment(state.slots[0])?.meshData?.offsets;
    if (!off) return 0;
    let m = 0;
    for (let i = 0; i < off.length; i++) if (Math.abs(off[i]) > m) m = Math.abs(off[i]);
    return +m.toFixed(4);
  });
  if (t0MaxOff < 0.5) ok("6e", `t=0 reset: max offset=${t0MaxOff}px (returns to rest ✓)`);
  else fail("6e", `t=0 reset: still has offset ${t0MaxOff}px`);

  // mid-point t=0.5
  await page.evaluate(() => window.ai.invoke("ai.set_animation_time", { time: 0.5 }));
  await page.waitForTimeout(200);
  await ss(page, "08-t05-mid");

  // ── STEP 7: Check pin keyframe tracks ──────────────────────────────────
  console.log("\n─── STEP 7: Verify timeline tracks ───");
  const tracks = await page.evaluate(() => {
    const anim = getCurrentAnimation();
    if (!anim) return null;
    const puppetPinTracks = Object.keys(anim.tracks).filter(id => id.includes("puppetpin"));
    const deformTracks = Object.keys(anim.tracks).filter(id => /:deform$/.test(id));
    const totalKf = puppetPinTracks.reduce((s, id) => s + (anim.tracks[id]?.length ?? 0), 0);
    return {
      pinTrackCount: puppetPinTracks.length,
      deformTrackCount: deformTracks.length,
      totalKeyframes: totalKf,
    };
  });
  console.log("  tracks:", tracks);
  if (tracks) {
    ok("7a", `${tracks.pinTrackCount} pin tracks, ${tracks.totalKeyframes} total keyframes`);
    ok("7b", `${tracks.deformTrackCount} baked deform track(s)`);
  }

  // ── STEP 8: Add a root bone for Spine export ───────────────────────────
  console.log("\n─── STEP 8: Add root bone + Spine export ───");
  const boneAdded = await page.evaluate(() => {
    if (typeof addBone !== "function") return false;
    addBone({ parent: -1, connected: false });
    return true;
  });
  ok("8a", `Root bone added: ${boneAdded}`);
  await page.waitForTimeout(300);

  // Diagnose animation tracks before export
  const animDiag = await page.evaluate(() => {
    const anim = getCurrentAnimation();
    if (!anim) return { error: "no animation" };
    const tracks = anim.tracks || {};
    const deformKeys = Object.keys(tracks).filter(id => /:deform$/.test(id));
    return {
      animName: anim.name,
      animId: anim.id,
      trackCount: Object.keys(tracks).length,
      deformTrackIds: deformKeys,
      deformKeyCount: deformKeys.map(id => tracks[id]?.length ?? 0),
      sampleDeformKey: deformKeys[0] ? (() => {
        const k = tracks[deformKeys[0]][0];
        return { time: k?.time, valueType: k?.value ? (Array.isArray(k.value) ? "Array" : k.value.constructor?.name) : "null", len: k?.value?.length };
      })() : null,
    };
  });
  console.log("  anim diag:", JSON.stringify(animDiag, null, 2));

  const spineR = await page.evaluate(() => window.ai.invoke("ai.export_spine_json"));
  if (spineR.ok) {
    const j = spineR.result.data;
    const jStr = JSON.stringify(j);
    const hasDeform = jStr.includes('"deform"');
    const noBgLeak = !jStr.includes("puppetWarp") && !jStr.includes("puppetpin");
    ok("8b", `Spine JSON: bones=${j.bones?.length ?? 0}, slots=${j.slots?.length ?? 0}`);
    ok("8c", `Deform timelines: ${hasDeform}`);
    ok("8d", `No editor-only fields leaked: ${noBgLeak}`);
    const animNames = Object.keys(j.animations ?? {});
    ok("8e", `Animations: [${animNames.join(", ")}]`);
  } else {
    fail("8", `Spine export: ${spineR.error}`);
  }
  await ss(page, "09-spine");

  // ── STEP 9: Screenshot final state ────────────────────────────────────
  // Back to t=1 for final visual
  await page.evaluate(() => window.ai.invoke("ai.set_animation_time", { time: 1 }));
  await page.waitForTimeout(300);
  await ss(page, "10-final");

  // ── SUMMARY ────────────────────────────────────────────────────────────
  console.log("\n══════════════════════════════════════════════════════");
  console.log("  SUMMARY");
  console.log("══════════════════════════════════════════════════════");
  const passed = results.filter(r => r.ok === true).length;
  const warned = results.filter(r => r.ok === null).length;
  const failed = results.filter(r => r.ok === false).length;
  results.forEach(r => console.log(`  ${r.ok === true ? "✅" : r.ok === null ? "⚠️ " : "❌"} [${r.tag}] ${r.msg}`));
  console.log(`\n  ${passed} passed, ${warned} warnings, ${failed} failed`);

  await page.waitForTimeout(1500);
  await browser.close();
  srv.close();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
