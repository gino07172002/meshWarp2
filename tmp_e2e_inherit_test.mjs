import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import url from 'node:url';

const root = 'd:/claude';
const host = '127.0.0.1';
const port = 4175;
const rootAbs = path.resolve(root).replace(/\\/g, '/').toLowerCase();

const gifB64 = 'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
const imgA = path.join(root, 'tmp_e2e_inherit.gif');
if (!fs.existsSync(imgA)) fs.writeFileSync(imgA, Buffer.from(gifB64, 'base64'));

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

async function collectJsonDownload(page, triggerFn) {
  const out = [];
  const onDownload = (d) => out.push(d);
  page.on('download', onDownload);
  await triggerFn();
  const start = Date.now();
  while (Date.now() - start < 8000) {
    const hit = out.find((d) => String(d.suggestedFilename() || '').endsWith('.json'));
    if (hit) {
      page.off('download', onDownload);
      return hit;
    }
    await page.waitForTimeout(100);
  }
  page.off('download', onDownload);
  throw new Error(`json download not found, got: ${out.map((d) => d.suggestedFilename()).join(', ')}`);
}

const server = await startServer();
try {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  let promptCount = 0;
  page.on('dialog', async (dialog) => {
    const msg = dialog.message() || '';
    if (msg.includes('Export base name')) {
      await dialog.accept('tmp_e2e_inherit_export');
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
  await page.setInputFiles('#fileInput', imgA);
  await page.waitForFunction(() => {
    const boneSel = document.querySelector('#boneSelect');
    return !!boneSel && boneSel.options.length >= 1;
  });

  await setValue(page, '#boneSelect', '0');
  await setValue(page, '#boneInherit', 'noScale');

  const saveDl = await collectJsonDownload(page, async () => {
    await clickEl(page, '#fileSaveBtn');
  });
  const saveOut = path.join(root, 'tmp_e2e_inherit_project.json');
  await saveDl.saveAs(saveOut);
  const project = JSON.parse(fs.readFileSync(saveOut, 'utf8'));
  const inheritSaved = project && Array.isArray(project.rigBones) && project.rigBones[0] ? project.rigBones[0].inherit : null;
  if (inheritSaved !== 'noScale') throw new Error(`project inherit mismatch: ${inheritSaved}`);

  const exportDl = await collectJsonDownload(page, async () => {
    await clickEl(page, '#fileExportSpineBtn');
  });
  const exportOut = path.join(root, 'tmp_e2e_inherit_export.json');
  await exportDl.saveAs(exportOut);
  const spine = JSON.parse(fs.readFileSync(exportOut, 'utf8'));
  const bones = Array.isArray(spine && spine.bones) ? spine.bones : [];
  const b0 = bones.find((b) => b && b.name !== '__export_root_yup');
  if (!b0) throw new Error('export non-root bone missing');
  if (b0.inherit !== 'noScale') throw new Error(`export inherit mismatch: ${b0.inherit}`);
  if (promptCount < 2) throw new Error('export prompts were not handled');

  await browser.close();
  console.log('E2E_INHERIT_OK', JSON.stringify({ saved: inheritSaved, exported: b0.inherit }));
} finally {
  await new Promise((resolve) => server.close(() => resolve()));
}
