import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import url from 'node:url';

const root = 'd:/claude';
const host = '127.0.0.1';
const port = 4174;
const rootAbs = path.resolve(root).replace(/\\/g, '/').toLowerCase();

function startServer() {
  const mime = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.gif': 'image/gif',
  };
  const server = http.createServer((req, res) => {
    try {
      const u = new url.URL(req.url || '/', `http://${host}:${port}`);
      let p = decodeURIComponent(u.pathname);
      if (p === '/') p = '/index.html';
      const fp = path.join(root, p.replace(/^\/+/, ''));
      const fpAbs = path.resolve(fp).replace(/\\/g, '/').toLowerCase();
      if (!fpAbs.startsWith(rootAbs)) return res.writeHead(403).end('forbidden');
      if (!fs.existsSync(fp) || fs.statSync(fp).isDirectory()) return res.writeHead(404).end('not found');
      res.setHeader('Content-Type', mime[path.extname(fp).toLowerCase()] || 'application/octet-stream');
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

async function setValue(page, sel, value, evt = 'change') {
  await page.evaluate(({ sel, value, evt }) => {
    const el = document.querySelector(sel);
    if (!el) throw new Error(`missing ${sel}`);
    el.value = String(value);
    el.dispatchEvent(new Event(evt, { bubbles: true }));
  }, { sel, value, evt });
}

async function clickEl(page, sel) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) throw new Error(`missing ${sel}`);
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  }, sel);
}

const gifB64 = 'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
const imgA = path.join(root, 'tmp_e2e_slot.gif');
const imgB = path.join(root, 'tmp_e2e_slot_b.gif');
if (!fs.existsSync(imgA)) fs.writeFileSync(imgA, Buffer.from(gifB64, 'base64'));
if (!fs.existsSync(imgB)) fs.writeFileSync(imgB, Buffer.from(gifB64, 'base64'));

const server = await startServer();
try {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`http://${host}:${port}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.setInputFiles('#fileInput', [imgA, imgB]);
  await page.waitForFunction(() => {
    const s = document.querySelector('#slotSelect');
    return !!s && s.options.length >= 2;
  });

  await setValue(page, '#editMode', 'vertex');

  for (const i of [0, 1]) {
    await setValue(page, '#slotSelect', String(i));
    await setValue(page, '#animTime', '0', 'input');
    const deformTrack = await page.evaluate((i) => {
      const sel = document.querySelector('#trackSelect');
      const opts = Array.from(sel?.options || []);
      const hit = opts.find((o) => o.value === `deform:${i}`);
      return hit ? hit.value : '';
    }, i);
    if (!deformTrack) throw new Error(`deform track missing for slot ${i}`);
    await setValue(page, '#trackSelect', deformTrack);
    await clickEl(page, '#addKeyBtn');
  }

  const savePromise = page.waitForEvent('download');
  await clickEl(page, '#fileSaveBtn');
  const dl = await savePromise;
  const out = path.join(root, 'tmp_e2e_deform_slot_project.json');
  await dl.saveAs(out);
  const obj = JSON.parse(fs.readFileSync(out, 'utf8'));
  const anim0 = Array.isArray(obj.animations) ? obj.animations[0] : null;
  const tracks = anim0?.tracks || {};
  const d0 = Array.isArray(tracks['deform:0']) ? tracks['deform:0'] : [];
  const d1 = Array.isArray(tracks['deform:1']) ? tracks['deform:1'] : [];
  const legacy = Array.isArray(tracks['vertex:deform']) ? tracks['vertex:deform'] : [];
  if (d0.length < 1 || d1.length < 1) throw new Error(`deform slot tracks missing keys: d0=${d0.length}, d1=${d1.length}`);
  if (legacy.length > 0) throw new Error('legacy vertex:deform unexpectedly present after keying');

  await browser.close();
  console.log('E2E_DEFORM_SLOT_OK', JSON.stringify({ d0: d0.length, d1: d1.length }));
} finally {
  await new Promise((resolve) => server.close(() => resolve()));
}
