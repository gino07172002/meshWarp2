import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import url from 'node:url';

const root = 'd:/claude';
const rootAbs = path.resolve(root).replace(/\\/g, '/').toLowerCase();
const host = '127.0.0.1';
const port = 4174;

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

function startServer() {
  const server = http.createServer((req, res) => {
    try {
      const u = new url.URL(req.url || '/', `http://${host}:${port}`);
      let p = decodeURIComponent(u.pathname);
      if (p === '/') p = '/index.html';
      const safeRel = p.replace(/^\/+/, '');
      const fp = path.join(root, safeRel);
      const fpAbs = path.resolve(fp).replace(/\\/g, '/').toLowerCase();
      if (!fpAbs.startsWith(rootAbs)) return res.writeHead(403).end('forbidden');
      if (!fs.existsSync(fp) || fs.statSync(fp).isDirectory()) return res.writeHead(404).end('not found');
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

async function click(page, sel) {
  await page.evaluate((selector) => {
    const el = document.querySelector(selector);
    if (!el) throw new Error(`selector not found: ${selector}`);
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  }, sel);
}

async function setInput(page, sel, value) {
  await page.evaluate(({ sel, value }) => {
    const el = document.querySelector(sel);
    if (!el) throw new Error(`selector not found: ${sel}`);
    el.value = String(value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, { sel, value });
}

async function setCheckbox(page, sel, checked) {
  await page.evaluate(({ sel, checked }) => {
    const el = document.querySelector(sel);
    if (!el) throw new Error(`selector not found: ${sel}`);
    el.checked = !!checked;
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, { sel, checked });
}

const server = await startServer();
try {
  const imgPath = path.join(root, 'tmp_e2e_slot.gif');
  if (!fs.existsSync(imgPath)) {
    const gifB64 = 'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
    fs.writeFileSync(imgPath, Buffer.from(gifB64, 'base64'));
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(String(err?.message || err)));

  await page.goto(`http://${host}:${port}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#onionEnabled', { state: 'attached', timeout: 10000 });
  await page.setInputFiles('#fileInput', imgPath);
  await page.waitForFunction(() => {
    const el = document.querySelector('#slotSelect');
    return !!el && el.options.length > 0;
  }, { timeout: 10000 });

  await setCheckbox(page, '#onionEnabled', true);
  await setInput(page, '#onionPrev', '3');
  await setInput(page, '#onionNext', '1');
  await setInput(page, '#onionAlpha', '0.37');

  await click(page, '#playBtn');
  await page.waitForTimeout(250);
  await click(page, '#stopBtn');

  const savePromise = page.waitForEvent('download');
  await click(page, '#fileSaveBtn');
  const dl = await savePromise;
  const out = path.join(root, 'tmp_e2e_onion_project.json');
  await dl.saveAs(out);
  const obj = JSON.parse(fs.readFileSync(out, 'utf8'));

  const onion = obj?.animationState?.onionSkin;
  if (!onion || onion.enabled !== true) throw new Error('onion enabled not persisted');
  if (Number(onion.prevFrames) !== 3) throw new Error(`onion prevFrames mismatch: ${onion.prevFrames}`);
  if (Number(onion.nextFrames) !== 1) throw new Error(`onion nextFrames mismatch: ${onion.nextFrames}`);
  if (Math.abs((Number(onion.alpha) || 0) - 0.37) > 1e-6) throw new Error(`onion alpha mismatch: ${onion.alpha}`);

  if (pageErrors.length > 0) throw new Error(`pageerror during onion flow: ${pageErrors.join(' | ')}`);

  await browser.close();
  console.log('E2E_ONION_OK', JSON.stringify(onion));
} finally {
  await new Promise((resolve) => server.close(() => resolve()));
}
