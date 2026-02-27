import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import url from 'node:url';
import { execFileSync } from 'node:child_process';

const root = 'd:/claude';
const rootAbs = path.resolve(root).replace(/\\/g, '/').toLowerCase();
const host = '127.0.0.1';
const port = 4173;

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

function startServer() {
  const server = http.createServer((req, res) => {
    try {
      const u = new url.URL(req.url || '/', `http://${host}:${port}`);
      let p = decodeURIComponent(u.pathname);
      if (p === '/') p = '/index.html';
      const safeRel = p.replace(/^\/+/, '');
      const fp = path.join(root, safeRel);
      const fpAbs = path.resolve(fp).replace(/\\/g, '/').toLowerCase();
      if (!fpAbs.startsWith(rootAbs)) {
        res.writeHead(403).end('forbidden');
        return;
      }
      if (!fs.existsSync(fp) || fs.statSync(fp).isDirectory()) {
        res.writeHead(404).end('not found');
        return;
      }
      const ext = path.extname(fp).toLowerCase();
      res.setHeader('Content-Type', mime[ext] || 'application/octet-stream');
      fs.createReadStream(fp).pipe(res);
    } catch {
      res.writeHead(500).end('error');
    }
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => resolve(server));
  });
}

async function setSelectValue(page, selector, value) {
  await page.evaluate(({ selector, value }) => {
    const el = document.querySelector(selector);
    if (!el) throw new Error(`selector not found: ${selector}`);
    el.value = String(value);
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, { selector, value });
}

async function setSelectIndex(page, selector, index) {
  await page.evaluate(({ selector, index }) => {
    const el = document.querySelector(selector);
    if (!el) throw new Error(`selector not found: ${selector}`);
    const i = Math.max(0, Math.min((el.options?.length || 1) - 1, Number(index) || 0));
    el.value = el.options[i]?.value || '';
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, { selector, index });
}

async function clickEl(page, selector) {
  await page.evaluate((selector) => {
    const el = document.querySelector(selector);
    if (!el) throw new Error(`selector not found: ${selector}`);
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  }, selector);
}

async function setCheckbox(page, selector, checked) {
  await page.evaluate(({ selector, checked }) => {
    const el = document.querySelector(selector);
    if (!el) throw new Error(`selector not found: ${selector}`);
    el.checked = !!checked;
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, { selector, checked });
}

async function setInput(page, selector, value) {
  await page.evaluate(({ selector, value }) => {
    const el = document.querySelector(selector);
    if (!el) throw new Error(`selector not found: ${selector}`);
    el.value = String(value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, { selector, value });
}

async function runAttachmentRegression() {
  const imgPath = path.join(root, 'tmp_e2e_slot.gif');
  if (!fs.existsSync(imgPath)) {
    const gifB64 = 'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
    fs.writeFileSync(imgPath, Buffer.from(gifB64, 'base64'));
  }
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', (m) => console.log('PW_CONSOLE', m.type(), m.text()));
  page.on('pageerror', (e) => console.log('PW_PAGEERR', e.message));
  const resp = await page.goto(`http://${host}:${port}/index.html`, { waitUntil: 'domcontentloaded' });
  console.log('ATTACH_DEBUG', JSON.stringify({
    url: page.url(),
    status: resp ? resp.status() : null,
    ctype: resp ? resp.headers()['content-type'] : null,
    title: await page.title(),
    head: (await page.content()).slice(0, 120),
  }));
  await page.waitForSelector('#fileInput', { state: 'attached', timeout: 10000 });
  await page.setInputFiles('#fileInput', imgPath);
  await page.waitForTimeout(1200);
  console.log('ATTACH_STATUS', await page.locator('#status').textContent());
  await page.waitForFunction(() => {
    const el = document.querySelector('#slotSelect');
    return !!el && el.options.length > 0;
  }, { timeout: 10000 });
  await page.waitForFunction(() => {
    const el = document.querySelector('#trackSelect');
    return !!el && el.options.length > 0;
  }, { timeout: 10000 });

  const rotateTrackValue = await page.evaluate(() => {
    const sel = document.querySelector('#trackSelect');
    const opts = Array.from(sel?.options || []);
    const hit = opts.find((o) => /Rotate/.test(o.textContent || ''));
    return hit ? hit.value : null;
  });
  if (!rotateTrackValue) throw new Error('Rotate track option not found');
  await setSelectValue(page, '#trackSelect', rotateTrackValue);
  await clickEl(page, '#addKeyBtn');
  await setInput(page, '#animTime', '1');
  await setInput(page, '#boneRot', '30');
  await clickEl(page, '#addKeyBtn');
  const savePromise = page.waitForEvent('download');
  await clickEl(page, '#fileSaveBtn');
  const dl = await savePromise;
  const out = path.join(root, 'tmp_e2e_smoke_project.json');
  await dl.saveAs(out);
  const obj = JSON.parse(fs.readFileSync(out, 'utf8'));
  const anim0 = Array.isArray(obj.animations) ? obj.animations[0] : null;
  const rows = anim0 && anim0.tracks && anim0.tracks[rotateTrackValue] ? anim0.tracks[rotateTrackValue] : null;
  await browser.close();
  if (!Array.isArray(rows) || rows.length < 2) {
    throw new Error('smoke regression: rotate keys were not persisted');
  }
  return 'timeline_smoke_ok';
}

async function runLayerAlphaTest() {
  const imgPath = path.join(root, 'tmp_e2e_slot.gif');
  if (!fs.existsSync(imgPath)) {
    const gifB64 = 'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
    fs.writeFileSync(imgPath, Buffer.from(gifB64, 'base64'));
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const downloads = [];
  page.on('download', (d) => downloads.push(d));

  await page.goto(`http://${host}:${port}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.setInputFiles('#fileInput', imgPath);
  await page.waitForFunction(() => {
    const el = document.querySelector('#slotSelect');
    return !!el && el.options.length > 0;
  });

  await clickEl(page, '#addAnimBtn');
  await setInput(page, '#animName', 'Anim LayerSrc');

  const rotateTrack = await page.evaluate(() => {
    const sel = document.querySelector('#trackSelect');
    const opts = Array.from(sel?.options || []);
    const hit = opts.find((o) => /\.Rotate$/.test(o.textContent || ''));
    return hit ? hit.value : '';
  });
  if (!rotateTrack) throw new Error('rotate track not found');
  await setSelectValue(page, '#trackSelect', rotateTrack);
  await clickEl(page, '#addKeyBtn');
  await setInput(page, '#animTime', '1');
  await setInput(page, '#boneRot', '45');
  await clickEl(page, '#addKeyBtn');

  await setSelectIndex(page, '#animSelect', 0);

  await clickEl(page, '#layerTrackAddBtn');

  const layerTrackValue = await page.inputValue('#trackSelect');
  if (!layerTrackValue.startsWith('layer:')) {
    throw new Error(`expected layer track selected, got ${layerTrackValue}`);
  }

  await setInput(page, '#layerTrackAlpha', '0.2');
  await clickEl(page, '#addKeyBtn');

  await setInput(page, '#animTime', '1');
  await setInput(page, '#layerTrackAlpha', '1');
  await clickEl(page, '#addKeyBtn');

  await setSelectIndex(page, '#layerTrackSelect', 0);
  const layerTrackValue2 = await page.inputValue('#trackSelect');
  if (!layerTrackValue2.startsWith('layer:')) {
    throw new Error(`expected layer track re-focused, got ${layerTrackValue2}`);
  }

  const savePromise = page.waitForEvent('download');
  await clickEl(page, '#fileSaveBtn');
  const dl = await savePromise;
  const out = path.join(root, 'tmp_e2e_layer_project.json');
  await dl.saveAs(out);

  const obj = JSON.parse(fs.readFileSync(out, 'utf8'));
  const layers = obj?.animationState?.layerTracks;
  if (!Array.isArray(layers) || layers.length < 1) throw new Error('layerTracks missing in project save');
  const l0 = layers[0];
  for (const k of ['loop', 'speed', 'offset', 'alpha', 'mode', 'maskMode']) {
    if (!(k in l0)) throw new Error(`layer track field missing: ${k}`);
  }

  const anim0 = Array.isArray(obj.animations) ? obj.animations[0] : null;
  if (!anim0 || !anim0.tracks || typeof anim0.tracks !== 'object') {
    throw new Error('animation tracks missing in project save');
  }
  const layerTrackKey = Object.keys(anim0.tracks).find((k) => /^layer:[^:]+:alpha$/.test(k));
  if (!layerTrackKey) throw new Error('layer alpha track not found in saved animation tracks');
  const rows = anim0.tracks[layerTrackKey] || [];
  if (!Array.isArray(rows) || rows.length < 2) throw new Error('layer alpha keys not saved as expected');

  await browser.close();
  return { layerTrackKey, keyCount: rows.length };
}

async function runLayerEnabledTest() {
  const imgPath = path.join(root, 'tmp_e2e_slot.gif');
  if (!fs.existsSync(imgPath)) {
    const gifB64 = 'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
    fs.writeFileSync(imgPath, Buffer.from(gifB64, 'base64'));
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto(`http://${host}:${port}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.setInputFiles('#fileInput', imgPath);
  await page.waitForFunction(() => {
    const el = document.querySelector('#slotSelect');
    return !!el && el.options.length > 0;
  });

  await clickEl(page, '#layerTrackAddBtn');
  await setInput(page, '#animTime', '0');
  await setCheckbox(page, '#layerTrackEnabled', true);

  const enabledTrack = await page.evaluate(() => {
    const sel = document.querySelector('#trackSelect');
    const opts = Array.from(sel?.options || []);
    const hit = opts.find((o) => /\.On$/.test(o.textContent || ''));
    return hit ? hit.value : '';
  });
  if (!enabledTrack) throw new Error('layer enabled track not found');

  await setSelectValue(page, '#trackSelect', enabledTrack);
  await clickEl(page, '#addKeyBtn');

  await setInput(page, '#animTime', '1');
  await setCheckbox(page, '#layerTrackEnabled', false);
  await setSelectValue(page, '#trackSelect', enabledTrack);
  await clickEl(page, '#addKeyBtn');

  const savePromise = page.waitForEvent('download');
  await clickEl(page, '#fileSaveBtn');
  const dl = await savePromise;
  const out = path.join(root, 'tmp_e2e_layer_enabled_project.json');
  await dl.saveAs(out);

  const obj = JSON.parse(fs.readFileSync(out, 'utf8'));
  const anim0 = Array.isArray(obj.animations) ? obj.animations[0] : null;
  const tracks = anim0 && anim0.tracks ? anim0.tracks : {};
  const rows = Array.isArray(tracks[enabledTrack]) ? tracks[enabledTrack] : [];
  if (rows.length < 2) throw new Error('layer enabled keys not saved');
  const values = rows.map((r) => !!r.value);
  if (!(values.includes(true) && values.includes(false))) {
    throw new Error(`layer enabled values unexpected: ${JSON.stringify(values)}`);
  }
  if (!rows.every((r) => (r.interp || '') === 'stepped')) {
    throw new Error(`layer enabled interp must be stepped: ${JSON.stringify(rows.map((r) => r.interp))}`);
  }

  await browser.close();
  return { enabledTrack, keyCount: rows.length, values };
}

async function runLayerSpeedOffsetTest() {
  const imgPath = path.join(root, 'tmp_e2e_slot.gif');
  if (!fs.existsSync(imgPath)) {
    const gifB64 = 'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
    fs.writeFileSync(imgPath, Buffer.from(gifB64, 'base64'));
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`http://${host}:${port}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.setInputFiles('#fileInput', imgPath);
  await page.waitForFunction(() => {
    const el = document.querySelector('#slotSelect');
    return !!el && el.options.length > 0;
  });

  await clickEl(page, '#layerTrackAddBtn');

  const tracks = await page.evaluate(() => {
    const sel = document.querySelector('#trackSelect');
    const opts = Array.from(sel?.options || []);
    const speed = opts.find((o) => /\.Speed$/.test(o.textContent || ''))?.value || '';
    const offset = opts.find((o) => /\.Offset$/.test(o.textContent || ''))?.value || '';
    return { speed, offset };
  });
  if (!tracks.speed || !tracks.offset) throw new Error('layer speed/offset tracks not found');

  await setInput(page, '#animTime', '0');
  await setInput(page, '#layerTrackSpeed', '1');
  await setSelectValue(page, '#trackSelect', tracks.speed);
  await clickEl(page, '#addKeyBtn');
  await setInput(page, '#animTime', '1');
  await setInput(page, '#layerTrackSpeed', '1.75');
  await setSelectValue(page, '#trackSelect', tracks.speed);
  await clickEl(page, '#addKeyBtn');

  await setInput(page, '#animTime', '0');
  await setInput(page, '#layerTrackOffset', '0');
  await setSelectValue(page, '#trackSelect', tracks.offset);
  await clickEl(page, '#addKeyBtn');
  await setInput(page, '#animTime', '1');
  await setInput(page, '#layerTrackOffset', '0.5');
  await setSelectValue(page, '#trackSelect', tracks.offset);
  await clickEl(page, '#addKeyBtn');

  const savePromise = page.waitForEvent('download');
  await clickEl(page, '#fileSaveBtn');
  const dl = await savePromise;
  const out = path.join(root, 'tmp_e2e_layer_speed_offset_project.json');
  await dl.saveAs(out);

  const obj = JSON.parse(fs.readFileSync(out, 'utf8'));
  const anim0 = Array.isArray(obj.animations) ? obj.animations[0] : null;
  const speedRows = anim0?.tracks?.[tracks.speed] || [];
  const offsetRows = anim0?.tracks?.[tracks.offset] || [];
  if (!Array.isArray(speedRows) || speedRows.length < 2) throw new Error('layer speed keys not saved');
  if (!Array.isArray(offsetRows) || offsetRows.length < 2) throw new Error('layer offset keys not saved');
  const speedValues = speedRows.map((r) => Number(r.value));
  const offsetValues = offsetRows.map((r) => Number(r.value));
  if (!speedValues.some((v) => Math.abs(v - 1.75) < 1e-4)) throw new Error(`speed value missing: ${JSON.stringify(speedValues)}`);
  if (!offsetValues.some((v) => Math.abs(v - 0.5) < 1e-4)) throw new Error(`offset value missing: ${JSON.stringify(offsetValues)}`);

  await browser.close();
  return { speedTrack: tracks.speed, offsetTrack: tracks.offset, speedKeys: speedRows.length, offsetKeys: offsetRows.length };
}

async function runDrawOrderEditorTest() {
  const imgPathA = path.join(root, 'tmp_e2e_slot.gif');
  const imgPathB = path.join(root, 'tmp_e2e_slot_b.gif');
  const gifB64 = 'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
  if (!fs.existsSync(imgPathA)) fs.writeFileSync(imgPathA, Buffer.from(gifB64, 'base64'));
  if (!fs.existsSync(imgPathB)) fs.writeFileSync(imgPathB, Buffer.from(gifB64, 'base64'));

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`http://${host}:${port}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.setInputFiles('#fileInput', [imgPathA, imgPathB]);
  await page.waitForFunction(() => {
    const el = document.querySelector('#drawOrderList');
    return !!el && el.options.length >= 2;
  });

  await clickEl(page, '#drawOrderToggleBtn');

  const before = await page.evaluate(() => {
    const list = document.querySelector('#drawOrderList');
    return Array.from(list?.options || []).map((o) => o.value);
  });
  if (before.length < 2) throw new Error('draw order list has fewer than 2 entries');

  await setSelectIndex(page, '#drawOrderList', 1);
  await clickEl(page, '#drawOrderUpBtn');
  await clickEl(page, '#drawOrderApplyKeyBtn');

  const after = await page.evaluate(() => {
    const list = document.querySelector('#drawOrderList');
    return Array.from(list?.options || []).map((o) => o.value);
  });
  if (after[0] !== before[1]) {
    throw new Error(`draw order ui did not move item up: before=${JSON.stringify(before)} after=${JSON.stringify(after)}`);
  }

  const savePromise = page.waitForEvent('download');
  await clickEl(page, '#fileSaveBtn');
  const dl = await savePromise;
  const out = path.join(root, 'tmp_e2e_draworder_project.json');
  await dl.saveAs(out);

  const obj = JSON.parse(fs.readFileSync(out, 'utf8'));
  const anim0 = Array.isArray(obj.animations) ? obj.animations[0] : null;
  const rows = anim0?.tracks?.['draworder:timeline'] || [];
  if (!Array.isArray(rows) || rows.length < 1) throw new Error('draworder timeline keys missing');
  const v0 = Array.isArray(rows[0]?.value) ? rows[0].value.map((x) => String(x)) : [];
  if (v0.length < 2) throw new Error(`draworder key value invalid: ${JSON.stringify(rows[0])}`);
  if (v0[0] !== before[1]) {
    throw new Error(`draworder key does not match expected order: expected first=${before[1]} got=${v0[0]}`);
  }

  await browser.close();
  return { movedFrom: before[1], firstAfter: after[0], keyCount: rows.length };
}

async function runClipSourceTrackTest() {
  const imgPath = path.join(root, 'tmp_e2e_slot.gif');
  if (!fs.existsSync(imgPath)) {
    const gifB64 = 'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
    fs.writeFileSync(imgPath, Buffer.from(gifB64, 'base64'));
  }
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`http://${host}:${port}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.setInputFiles('#fileInput', imgPath);
  await page.waitForFunction(() => {
    const el = document.querySelector('#slotSelect');
    return !!el && el.options.length > 0;
  });

  await setInput(page, '#animTime', '0');
  await setSelectValue(page, '#slotClipSource', 'fill');
  await clickEl(page, '#addClipSourceKeyBtn');
  await setInput(page, '#animTime', '1');
  await setSelectValue(page, '#slotClipSource', 'contour');
  await clickEl(page, '#addClipSourceKeyBtn');

  const savePromise = page.waitForEvent('download');
  await clickEl(page, '#fileSaveBtn');
  const dl = await savePromise;
  const out = path.join(root, 'tmp_e2e_clip_source_project.json');
  await dl.saveAs(out);

  const obj = JSON.parse(fs.readFileSync(out, 'utf8'));
  const anim0 = Array.isArray(obj.animations) ? obj.animations[0] : null;
  const key = Object.keys(anim0?.tracks || {}).find((k) => /^slot:\d+:clipSource$/.test(k));
  if (!key) throw new Error('clipSource track not found');
  const rows = anim0.tracks[key] || [];
  if (!Array.isArray(rows) || rows.length < 2) throw new Error('clipSource keys missing');
  const values = rows.map((r) => String(r.value || ''));
  if (!(values.includes('fill') && values.includes('contour'))) {
    throw new Error(`clipSource values unexpected: ${JSON.stringify(values)}`);
  }
  if (!rows.every((r) => (r.interp || '') === 'stepped')) {
    throw new Error(`clipSource interp must be stepped: ${JSON.stringify(rows.map((r) => r.interp))}`);
  }

  await browser.close();
  return { track: key, keyCount: rows.length, values };
}

async function runSpineBundleExportTest() {
  const out = execFileSync('node', ['tmp_e2e_spine_bundle_export_test.mjs'], {
    cwd: root,
    encoding: 'utf8',
  });
  const m = String(out || '').match(/E2E_SPINE_BUNDLE_OK\s+(\{[\s\S]*\})/);
  if (!m) {
    throw new Error(`bundle export test output missing marker: ${String(out || '').trim()}`);
  }
  try {
    return JSON.parse(m[1]);
  } catch (err) {
    throw new Error(`bundle export test parse failed: ${err.message}`);
  }
}

async function runOnionVisualTest() {
  const out = execFileSync('node', ['tmp_e2e_onion_visual_test.mjs'], {
    cwd: root,
    encoding: 'utf8',
  });
  const m = String(out || '').match(/E2E_ONION_VISUAL_OK\s+(\{[\s\S]*\})/);
  if (!m) {
    throw new Error(`onion visual test output missing marker: ${String(out || '').trim()}`);
  }
  try {
    return JSON.parse(m[1]);
  } catch (err) {
    throw new Error(`onion visual test parse failed: ${err.message}`);
  }
}

const server = await startServer();
try {
  const r1 = await runAttachmentRegression();
  const r2 = await runLayerAlphaTest();
  const r3 = await runLayerEnabledTest();
  const r4 = await runLayerSpeedOffsetTest();
  const r5 = await runDrawOrderEditorTest();
  const r6 = await runClipSourceTrackTest();
  const r7 = await runSpineBundleExportTest();
  const r8 = await runOnionVisualTest();
  console.log('E2E_SUMMARY', JSON.stringify({ r1, r2, r3, r4, r5, r6, r7, r8 }, null, 2));
} finally {
  await new Promise((resolve) => server.close(() => resolve()));
}
