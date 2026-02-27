import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import url from 'node:url';

const root = 'd:/claude';
const host = '127.0.0.1';
const port = 4176;
const rootAbs = path.resolve(root).replace(/\\/g, '/').toLowerCase();

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.gif': 'image/gif',
  '.png': 'image/png',
};

function startServer() {
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

async function click(page, selector) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) throw new Error(`selector not found: ${sel}`);
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  }, selector);
}

async function setInput(page, selector, value) {
  await page.evaluate(({ selector, value }) => {
    const el = document.querySelector(selector);
    if (!el) throw new Error(`selector not found: ${selector}`);
    el.value = String(value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, { selector, value });
}

async function setCheckbox(page, selector, checked) {
  await page.evaluate(({ selector, checked }) => {
    const el = document.querySelector(selector);
    if (!el) throw new Error(`selector not found: ${selector}`);
    el.checked = !!checked;
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, { selector, checked });
}

function ensureTinyGif() {
  const imgPath = path.join(root, 'tmp_e2e_slot.gif');
  if (!fs.existsSync(imgPath)) {
    const gifB64 = 'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
    fs.writeFileSync(imgPath, Buffer.from(gifB64, 'base64'));
  }
  return imgPath;
}

const server = await startServer();
try {
  const imgPath = ensureTinyGif();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(String(err?.message || err)));

  await page.goto(`http://${host}:${port}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.setInputFiles('#fileInput', imgPath);
  await page.waitForFunction(() => {
    const el = document.querySelector('#slotSelect');
    return !!el && el.options.length > 0;
  }, { timeout: 10000 });

  // Build a visible pose delta across timeline so previous/next onion frames differ.
  await setInput(page, '#animTime', '0');
  await setInput(page, '#boneRot', '0');
  await click(page, '#addKeyBtn');
  await setInput(page, '#animTime', '1');
  await setInput(page, '#boneRot', '45');
  await click(page, '#addKeyBtn');
  await setInput(page, '#animTime', '0.5');
  await page.waitForTimeout(120);

  await setInput(page, '#onionPrev', '2');
  await setInput(page, '#onionNext', '2');
  await setInput(page, '#onionAlpha', '0.45');

  const capture = async () => page.evaluate(() => {
    const src = document.querySelector('#overlay');
    if (!src) throw new Error('overlay not found');
    const w = Math.max(1, src.width | 0);
    const h = Math.max(1, src.height | 0);
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    if (!ctx) throw new Error('2d ctx unavailable');
    ctx.drawImage(src, 0, 0, w, h);
    return Array.from(ctx.getImageData(0, 0, w, h).data);
  });

  await setCheckbox(page, '#onionEnabled', false);
  await page.waitForTimeout(120);
  const offData = await capture();

  await setCheckbox(page, '#onionEnabled', true);
  await page.waitForTimeout(120);
  const onData = await capture();

  if (offData.length !== onData.length) throw new Error('pixel buffer length mismatch');

  let changed = 0;
  let totalDelta = 0;
  for (let i = 0; i < offData.length; i += 4) {
    const dr = Math.abs(onData[i] - offData[i]);
    const dg = Math.abs(onData[i + 1] - offData[i + 1]);
    const db = Math.abs(onData[i + 2] - offData[i + 2]);
    const da = Math.abs(onData[i + 3] - offData[i + 3]);
    const d = dr + dg + db + da;
    totalDelta += d;
    if (d >= 8) changed += 1;
  }

  const totalPixels = offData.length / 4;
  const changedRatio = changed / Math.max(1, totalPixels);
  const avgDelta = totalDelta / Math.max(1, totalPixels);

  if (changedRatio < 0.0005 || avgDelta < 0.5) {
    throw new Error(`onion visual delta too small: changedRatio=${changedRatio}, avgDelta=${avgDelta}`);
  }
  if (pageErrors.length > 0) {
    throw new Error(`pageerror during onion visual test: ${pageErrors.join(' | ')}`);
  }

  fs.writeFileSync(path.join(root, 'tmp_e2e_onion_visual_metrics.json'), JSON.stringify({
    changedPixels: changed,
    totalPixels,
    changedRatio,
    avgDelta,
  }, null, 2));

  await browser.close();
  console.log('E2E_ONION_VISUAL_OK', JSON.stringify({ changed, totalPixels, changedRatio, avgDelta }));
} finally {
  await new Promise((resolve) => server.close(() => resolve()));
}
