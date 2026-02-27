import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import url from 'node:url';

const root = 'd:/claude';
const host = '127.0.0.1';
const port = 4176;
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
const imgA = path.join(root, 'tmp_e2e_ik_loop.gif');
if (!fs.existsSync(imgA)) fs.writeFileSync(imgA, Buffer.from(gifB64, 'base64'));

const server = await startServer();
try {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`http://${host}:${port}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.setInputFiles('#fileInput', imgA);
  await page.waitForFunction(() => {
    const s = document.querySelector('#slotSelect');
    const b = document.querySelector('#boneSelect');
    return !!s && s.options.length >= 1 && !!b && b.options.length >= 1;
  });

  await setValue(page, '#editMode', 'skeleton');
  await setValue(page, '#boneMode', 'edit');
  await setValue(page, '#boneMode', 'pose');
  await clickEl(page, '#ikAdd1Btn');
  await page.waitForTimeout(100);

  await setValue(page, '#ikSoftness', '12', 'input');
  await page.evaluate(() => {
    const setChecked = (sel) => {
      const el = document.querySelector(sel);
      if (!el) throw new Error(`missing ${sel}`);
      el.checked = true;
      el.dispatchEvent(new Event('change', { bubbles: true }));
    };
    setChecked('#ikCompress');
    setChecked('#ikStretch');
    setChecked('#ikUniform');
  });

  const hasSoftTrack = await page.evaluate(() => {
    const sel = document.querySelector('#trackSelect');
    return Array.from(sel?.options || []).some((o) => o.value === 'ik:0:softness');
  });
  if (!hasSoftTrack) throw new Error('missing ik:0:softness track');

  await setValue(page, '#trackSelect', 'ik:0:softness');
  await setValue(page, '#animDuration', '2', 'input');
  await setValue(page, '#animTime', '0', 'input');
  await clickEl(page, '#addKeyBtn');
  await setValue(page, '#animTime', '1', 'input');
  await setValue(page, '#ikSoftness', '24', 'input');
  await clickEl(page, '#addKeyBtn');

  await clickEl(page, '#loopMakeSeamBtn');
  await clickEl(page, '#loopPingPongBtn');

  const savePromise = page.waitForEvent('download');
  await clickEl(page, '#fileSaveBtn');
  const dl = await savePromise;
  const out = path.join(root, 'tmp_e2e_ik_loop_project.json');
  await dl.saveAs(out);
  const obj = JSON.parse(fs.readFileSync(out, 'utf8'));

  const ik0 = obj && Array.isArray(obj.ikConstraints) ? obj.ikConstraints[0] : null;
  if (!ik0) throw new Error('missing ik constraint in project save');
  if (Number(ik0.softness) !== 24) throw new Error(`ik softness not applied: ${ik0.softness}`);
  if (!ik0.compress || !ik0.stretch || !ik0.uniform) throw new Error('ik compress/stretch/uniform not applied');

  const anim0 = Array.isArray(obj.animations) ? obj.animations[0] : null;
  const softKeys = anim0 && anim0.tracks && Array.isArray(anim0.tracks['ik:0:softness']) ? anim0.tracks['ik:0:softness'] : [];
  if (softKeys.length < 3) throw new Error(`expected loop-generated softness keys >=3, got ${softKeys.length}`);

  await browser.close();
  console.log('E2E_IK_LOOP_OK', JSON.stringify({ softnessKeys: softKeys.length, duration: anim0 ? anim0.duration : null }));
} finally {
  await new Promise((resolve) => server.close(() => resolve()));
}
