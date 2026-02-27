import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import url from 'node:url';

const root = 'd:/claude';
const host = '127.0.0.1';
const port = 4177;
const rootAbs = path.resolve(root).replace(/\\/g, '/').toLowerCase();
const gifPath = path.join(root, 'tmp_e2e_slot.gif');
const outJson = path.join(root, 'tmp_e2e_export.json');

const gifB64 = 'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
fs.writeFileSync(gifPath, Buffer.from(gifB64, 'base64'));

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

const server = await startServer();
try {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  let promptCount = 0;
  page.on('dialog', async (dialog) => {
    const msg = dialog.message() || '';
    if (msg.includes('Export base name')) {
      await dialog.accept('tmp_e2e_export');
      promptCount += 1;
      return;
    }
    if (msg.includes('Atlas texture scale')) {
      await dialog.accept('1');
      promptCount += 1;
      return;
    }
    await dialog.dismiss();
  });

  await page.goto(`http://${host}:${port}/index.html`, { waitUntil: 'domcontentloaded' });

  await page.setInputFiles('#fileInput', gifPath);
  await page.waitForFunction(() => {
    const el = document.querySelector('#slotSelect');
    return !!el && el.options.length > 0;
  });
  await page.evaluate(() => {
    const btn = document.querySelector('#workspaceTabAnimate');
    if (!btn) throw new Error('missing #workspaceTabAnimate');
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
  await page.waitForFunction(() => {
    const dock = document.querySelector('#timelineDock');
    return !!dock && getComputedStyle(dock).display !== 'none';
  });

  const attachmentTrackValue = await page.evaluate(() => {
    const sel = document.querySelector('#trackSelect');
    if (!sel) return null;
    const opts = Array.from(sel.options || []);
    const hit = opts.find((o) => /\.Attachment$/.test(o.textContent || ''));
    return hit ? hit.value : null;
  });
  if (!attachmentTrackValue) throw new Error('Attachment track option not found');
  await page.evaluate((value) => {
    const sel = document.querySelector('#trackSelect');
    if (!sel) throw new Error('missing #trackSelect');
    sel.value = value;
    sel.dispatchEvent(new Event('change', { bubbles: true }));
  }, attachmentTrackValue);

  const showAttachmentName = await page.evaluate(() => {
    const sel = document.querySelector('#slotAttachment');
    if (!sel) return null;
    const opts = Array.from(sel.options || []);
    const hit = opts.find((o) => String(o.value || '') !== '__none__');
    return hit ? String(hit.value) : null;
  });
  if (!showAttachmentName) throw new Error('No selectable attachment name found');

  await page.evaluate(() => {
    const sel = document.querySelector('#slotAttachment');
    if (!sel) throw new Error('missing #slotAttachment');
    sel.value = '__none__';
    sel.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.click('#addKeyBtn');

  await page.fill('#animTime', '1');
  await page.dispatchEvent('#animTime', 'input');
  await page.evaluate((name) => {
    const sel = document.querySelector('#slotAttachment');
    if (!sel) throw new Error('missing #slotAttachment');
    sel.value = String(name);
    sel.dispatchEvent(new Event('change', { bubbles: true }));
  }, showAttachmentName);
  await page.click('#addKeyBtn');

  const dlPromise = page.waitForEvent('download');
  await page.click('#fileExportSpineBtn');
  const firstDl = await dlPromise;
  const firstName = firstDl.suggestedFilename();
  let jsonDl = firstDl;
  if (!firstName.endsWith('.json')) {
    for (let i = 0; i < 3; i += 1) {
      const d = await page.waitForEvent('download');
      if (d.suggestedFilename().endsWith('.json')) {
        jsonDl = d;
        break;
      }
    }
  }
  await jsonDl.saveAs(outJson);

  const obj = JSON.parse(fs.readFileSync(outJson, 'utf8'));
  const anims = obj && obj.animations ? obj.animations : {};
  const animName = Object.keys(anims)[0];
  if (!animName) throw new Error('No animation exported');
  const slots = anims[animName] && anims[animName].slots ? anims[animName].slots : null;
  if (!slots) throw new Error('No slots timelines in export animation');
  const firstSlotName = Object.keys(slots)[0];
  if (!firstSlotName) throw new Error('No slot timeline entries found');
  const attRows = slots[firstSlotName].attachment;
  if (!Array.isArray(attRows) || attRows.length < 2) throw new Error('Attachment timeline rows missing');

  const hasHide = attRows.some((r) => Number(r.time) === 0 && (r.name == null || r.name === ''));
  const hasShow = attRows.some((r) => Number(r.time) === 1 && typeof r.name === 'string' && r.name.length > 0);
  if (!hasHide || !hasShow) {
    throw new Error(`Attachment timeline rows invalid: ${JSON.stringify(attRows)}`);
  }
  if (promptCount < 2) throw new Error('Export prompts were not handled as expected');

  console.log('E2E_OK', JSON.stringify({ animName, firstSlotName, attRows }, null, 2));
  await browser.close();
} finally {
  await new Promise((resolve) => server.close(() => resolve()));
}
