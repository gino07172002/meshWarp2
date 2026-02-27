import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import url from 'node:url';

const root = 'd:/claude';
const host = '127.0.0.1';
const port = 4181;
const rootAbs = path.resolve(root).replace(/\\/g, '/').toLowerCase();
const gifPath = path.join(root, 'tmp_e2e_slot.gif');
const outJson = path.join(root, 'tmp_e2e_smparam_export.json');
const gifB64 = 'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
if (!fs.existsSync(gifPath)) fs.writeFileSync(gifPath, Buffer.from(gifB64, 'base64'));

function startServer() {
  const mime = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
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

  page.on('dialog', async (dialog) => {
    const msg = dialog.message() || '';
    if (msg.includes('Export base name')) return dialog.accept('tmp_e2e_smparam');
    if (msg.includes('Atlas texture scale')) return dialog.accept('1');
    return dialog.dismiss();
  });

  await page.goto(`http://${host}:${port}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.setInputFiles('#fileInput', gifPath);
  await page.waitForFunction(() => {
    const s = document.querySelector('#slotSelect');
    return !!s && s.options.length > 0;
  });

  await page.evaluate(() => {
    const click = (sel) => {
      const el = document.querySelector(sel);
      if (!el) throw new Error(`missing ${sel}`);
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    };
    const setVal = (sel, value, evt = 'input') => {
      const el = document.querySelector(sel);
      if (!el) throw new Error(`missing ${sel}`);
      el.value = String(value);
      el.dispatchEvent(new Event(evt, { bubbles: true }));
    };

    click('#workspaceTabAnimate');
    click('#smParamAddBtn');
    setVal('#smParamName', 'speed');
    setVal('#smParamType', 'float', 'change');
    setVal('#smParamValue', '0.5');
    click('#smParamSetBtn');

    setVal('#animTime', '0');
    click('#smParamKeyBtn');
    setVal('#animTime', '1');
    setVal('#smParamValue', '1.25');
    click('#smParamSetBtn');
    click('#smParamKeyBtn');
  });

  const dlPromise = page.waitForEvent('download');
  await page.click('#fileExportSpineBtn');
  const firstDl = await dlPromise;
  let jsonDl = firstDl;
  if (!firstDl.suggestedFilename().endsWith('.json')) {
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

  if (!obj || typeof obj !== 'object') throw new Error('export json missing');
  if (!obj.skeleton || !obj.bones || !obj.slots || !obj.skins || !obj.animations) {
    throw new Error('spine core fields missing');
  }

  const raw = JSON.stringify(obj);
  if (raw.includes('stateMachine') || raw.includes('smparam:') || raw.includes('"parameters"')) {
    throw new Error('state machine custom data leaked into spine export');
  }

  console.log(
    'E2E_SMPARAM_EXPORT_OK',
    JSON.stringify(
      {
        spine: obj.skeleton && obj.skeleton.spine,
        bones: Array.isArray(obj.bones) ? obj.bones.length : 0,
        slots: Array.isArray(obj.slots) ? obj.slots.length : 0,
      },
      null,
      2
    )
  );
  await browser.close();
} finally {
  await new Promise((resolve) => server.close(() => resolve()));
}
