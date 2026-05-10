// Generate a side-by-side comparison: t=0 vs t=1 deformation
// with just the character (no mesh overlay) using the image canvas.

const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 5207;
const SS_DIR = path.resolve(__dirname, "..", "review-screenshots");
const SOURCE = "D:/newExport/1f94a319-35a4-4056-942f-53e8ae32aeba.jpg";

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

async function main() {
  const imgB64 = fs.readFileSync(SOURCE).toString("base64");
  const srv = await server();
  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const page = await browser.newContext({ viewport: { width: 1440, height: 900 } }).then(c => c.newPage());
  page.on("pageerror", e => console.error("[err]", e.message.slice(0, 80)));

  await page.goto(`http://127.0.0.1:${PORT}/index.html`);
  await page.waitForFunction(() => !!window.ai && !!window.ImageBgRemoval, { timeout: 12000 });

  // -- Reproduce the full setup (same as e2e-limb-stretch) --
  await page.click("#workspaceTabImage");
  await page.waitForTimeout(300);
  await page.evaluate(async b64 => {
    const arr = new Uint8Array(atob(b64).split("").map(c => c.charCodeAt(0)));
    return window.ImageWorkspace.loadFromBlob(new Blob([arr], { type: "image/jpeg" }), "drop");
  }, imgB64);
  await page.waitForTimeout(400);

  await page.evaluate(() => window.ai.invoke("ai.image_remove_bg"));
  await page.waitForTimeout(600);
  await page.evaluate(() => window.ai.invoke("ai.image_trim"));
  await page.evaluate(() => window.ai.invoke("ai.image_send_to_new_slot"));
  await page.waitForTimeout(700);
  await page.evaluate(() => window.ai.invoke("mode.mesh"));
  await page.waitForTimeout(300);
  await page.evaluate(() => window.ai.invoke("ai.mesh_auto_foreground", { cols: 24, rows: 24, alphaThreshold: 8, padding: 2, detail: 1.5 }));
  await page.evaluate(() => window.ai.invoke("ai.mesh_apply"));
  await page.waitForTimeout(400);
  await page.evaluate(() => window.ai.invoke("ai.puppetwarp_enable", { slotIndex: 0, mode: "standalone" }));

  // Add 14 anchor + 2 control pins (same fx/fy as e2e script)
  const pickV = (fx, fy) => page.evaluate(([fx, fy]) => {
    const att = getActiveAttachment(state.slots[0]);
    const pos = att?.meshData?.positions;
    if (!pos) return -1;
    const n = pos.length / 2;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < n; i++) { const x = pos[i*2], y = pos[i*2+1]; if(x<minX)minX=x; if(x>maxX)maxX=x; if(y<minY)minY=y; if(y>maxY)maxY=y; }
    const tx = minX + (maxX - minX) * fx, ty = minY + (maxY - minY) * fy;
    let best = 0, bd = Infinity;
    for (let i = 0; i < n; i++) { const dx = pos[i*2]-tx, dy = pos[i*2+1]-ty; const d = dx*dx+dy*dy; if(d<bd){bd=d;best=i;} }
    return best;
  }, [fx, fy]);

  const anchors = [[0.5,0.03],[0.5,0.10],[0.5,0.17],[0.35,0.25],[0.65,0.25],[0.5,0.35],[0.5,0.48],[0.5,0.58],[0.38,0.65],[0.62,0.65],[0.38,0.78],[0.62,0.78],[0.38,0.91],[0.62,0.91]];
  const ctrl = [[0.15,0.55],[0.83,0.55]];
  const allFx = [...anchors, ...ctrl];
  const pins = {};
  for (const [fx, fy] of allFx) {
    const v = await pickV(fx, fy);
    const r = await page.evaluate(v => window.ai.invoke("ai.puppetwarp_add_pin", { slotIndex: 0, vertexIndex: v }), v);
    if (r.ok) pins[`${fx},${fy}`] = r.result.pin;
  }

  // Sync rest positions
  await page.evaluate(() => {
    const att = getActiveAttachment(state.slots[0]);
    const pos = att?.meshData?.positions;
    if (!att?.puppetWarp || !pos) return;
    for (const p of att.puppetWarp.pins) { p.restX = pos[p.vertexIndex*2]; p.restY = pos[p.vertexIndex*2+1]; }
  });
  for (const [key, pin] of Object.entries(pins)) {
    const fresh = await page.evaluate(pid => { const att = getActiveAttachment(state.slots[0]); const p = att?.puppetWarp?.pins?.find(p=>p.id===pid); return p ? {restX:p.restX,restY:p.restY} : null; }, pin.id);
    if (fresh) { pin.restX = fresh.restX; pin.restY = fresh.restY; }
  }

  const handR = pins["0.15,0.55"], handL = pins["0.83,0.55"];

  // Write keyframes at t=0 (rest)
  await page.evaluate(() => window.ai.invoke("ai.set_animation_time", { time: 0 }));
  for (const pin of Object.values(pins)) {
    await page.evaluate(([pid,x,y]) => window.ai.invoke("ai.puppetwarp_set_pin_keyframe",{slotIndex:0,pinId:pid,time:0,x,y}), [pin.id,pin.restX,pin.restY]);
  }

  // Write keyframes at t=1 (hands extended)
  if (handR) await page.evaluate(([pid,x,y]) => window.ai.invoke("ai.puppetwarp_set_pin_keyframe",{slotIndex:0,pinId:pid,time:1,x,y}), [handR.id,handR.restX-80,handR.restY+30]);
  if (handL) await page.evaluate(([pid,x,y]) => window.ai.invoke("ai.puppetwarp_set_pin_keyframe",{slotIndex:0,pinId:pid,time:1,x,y}), [handL.id,handL.restX+80,handL.restY+30]);
  for (const [key, pin] of Object.entries(pins)) {
    if (pin !== handR && pin !== handL) {
      await page.evaluate(([pid,x,y]) => window.ai.invoke("ai.puppetwarp_set_pin_keyframe",{slotIndex:0,pinId:pid,time:1,x,y}), [pin.id,pin.restX,pin.restY]);
    }
  }

  // -- Render comparison screenshots --
  // t=0: rest
  await page.evaluate(() => window.ai.invoke("ai.set_animation_time", { time: 0 }));
  await page.waitForTimeout(300);
  // Switch to Animate mode to see timeline playback
  await page.evaluate(() => window.ai.invoke("mode.pose"));
  await page.waitForTimeout(400);

  // Screenshot t=0
  const f0 = path.join(SS_DIR, "compare-t0-rest.png");
  await page.screenshot({ path: f0 });
  console.log("📷 t=0 rest:", path.basename(f0));

  // t=1: extended
  await page.evaluate(() => window.ai.invoke("ai.set_animation_time", { time: 1 }));
  await page.waitForTimeout(300);
  const f1 = path.join(SS_DIR, "compare-t1-extended.png");
  await page.screenshot({ path: f1 });
  console.log("📷 t=1 extended:", path.basename(f1));

  // t=0.5: mid
  await page.evaluate(() => window.ai.invoke("ai.set_animation_time", { time: 0.5 }));
  await page.waitForTimeout(300);
  const fh = path.join(SS_DIR, "compare-t0.5-mid.png");
  await page.screenshot({ path: fh });
  console.log("📷 t=0.5 mid:", path.basename(fh));

  const offStats = await page.evaluate(() => {
    const att = getActiveAttachment(state.slots[0]);
    const off = att?.meshData?.offsets;
    if (!off) return null;
    let maxAbs = 0, nonZero = 0;
    for (let i = 0; i < off.length; i++) { if (Math.abs(off[i]) > 0.1) nonZero++; if (Math.abs(off[i]) > maxAbs) maxAbs = Math.abs(off[i]); }
    return { maxAbs: +maxAbs.toFixed(1), nonZero, total: off.length / 2 };
  });
  console.log("offset at t=0.5:", offStats);

  await page.waitForTimeout(2000);
  await browser.close();
  srv.close();
}

main().catch(e => { console.error(e); process.exit(1); });
