import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import url from 'node:url';

const root = 'd:/claude';
const host = '127.0.0.1';
const port = 4178;
const rootAbs = path.resolve(root).replace(/\\/g, '/').toLowerCase();
const gifPath = path.join(root, 'tmp_e2e_path_mode_big.gif');
const projectBase = path.join(root, 'tmp_e2e_path_mode_project.json');
const projectPatched = path.join(root, 'tmp_e2e_path_mode_project_patched.json');
const outJson = path.join(root, 'tmp_e2e_path_mode_export.json');
const gifB64 =
  'R0lGODlhEAAQAPcAAAAAAAAAMwAAZgAAmQAAzAAA/wArAAArMwArZgArmQArzAAr/wBVAABVMwBVZgBVmQBVzABV/wCAAACAMwCAZgCAmQCAzACA/wCqAACqMwCqZgCqmQCqzACq/wDVAADVMwDVZgDVmQDVzADV/wD/AAD/MwD/ZgD/mQD/zAD//zMAADMAMzMAZjMAmTMAzDMA/zMrADMrMzMrZjMrmTMrzDMr/zNVADNVMzNVZjNVmTNVzDNV/zOAADOAMzOAZjOAmTOAzDOA/zOqADOqMzOqZjOqmTOqzDOq/zPVADPVMzPVZjPVmTPVzDPV/zP/ADP/MzP/ZjP/mTP/zDP//2YAAGYAM2YAZmYAmWYAzGYA/2YrAGYrM2YrZmYrmWYrzGYr/2ZVAGZVM2ZVZmZVmWZVzGZV/2aAAGaAM2aAZmaAmWaAzGaA/2aqAGaqM2aqZmaqmWaqzGaq/2bVAGbVM2bVZmbVmWbVzGbV/2b/AGb/M2b/Zmb/mWb/zGb//5kAAJkAM5kAZpkAmZkAzJkA/5krAJkrM5krZpkrmZkrzJkr/5lVAJlVM5lVZplVmZlVzJlV/5mAAJmAM5mAZpmAmZmAzJmA/5mqAJmqM5mqZpmqmZmqzJmq/5nVAJnVM5nVZpnVmZnVzJnV/5n/AJn/M5n/Zpn/mZn/zJn//8wAAMwAM8wAZswAmcwAzMwA/8wrAMwrM8wrZswrmcwrzMwr/8xVAMxVM8xVZsxVmcxVzMxV/8yAAMyAM8yAZsyAmcyAzMyA/8yqAMyqM8yqZsyqmcyqzMyq/8zVAMzVM8zVZszVmczVzMzV/8z/AMz/M8z/Zsz/mcz/zMz///8AAP8AM/8AZv8Amf8AzP8A//8rAP8rM/8rZv8rmf8rzP8r//9VAP9VM/9VZv9Vmf9VzP9V//+AAP+AM/+AZv+Amf+AzP+A//+qAP+qM/+qZv+qmf+qzP+q///VAP/VM//VZv/Vmf/VzP/V////AP//M///Zv//mf//zP///wAAAAAAAAAAAAAAACH5BAEAAPwALAAAAAAQABAAAAgdAPcJHEiwoMGDCBMqXMiwocOHECNKnEixosWBAQEAOw==';
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

  page.on('dialog', async (dialog) => {
    const msg = dialog.message() || '';
    if (msg.includes('Export base name')) return dialog.accept('tmp_e2e_path_mode');
    if (msg.includes('Atlas texture scale')) return dialog.accept('1');
    return dialog.dismiss();
  });

  await page.goto(`http://${host}:${port}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.setInputFiles('#fileInput', gifPath);
  await page.waitForFunction(() => {
    const s = document.querySelector('#slotSelect');
    const b = document.querySelector('#boneSelect');
    return !!s && s.options.length > 0 && !!b && b.options.length > 0;
  });

  await page.evaluate(() => {
    const click = (sel) => {
      const el = document.querySelector(sel);
      if (!el) throw new Error(`missing ${sel}`);
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    };
    const setVal = (sel, value, evt = 'change') => {
      const el = document.querySelector(sel);
      if (!el) throw new Error(`missing ${sel}`);
      el.value = String(value);
      el.dispatchEvent(new Event(evt, { bubbles: true }));
    };

    click('#workspaceTabRig');
    setVal('#editMode', 'skeleton');
    setVal('#boneMode', 'pose');
    click('#pathAddBtn');

    setVal('#pathSourceType', 'slot');
    setVal('#pathTargetSlot', '0');
    setVal('#pathPositionMode', 'percent');
    setVal('#pathSpacingMode', 'proportional');
    setVal('#pathRotateMode', 'chainScale');
    setVal('#pathPosition', '35', 'input');
    setVal('#pathSpacing', '22', 'input');
    setVal('#pathRotateMix', '0.65', 'input');
    setVal('#pathTranslateMix', '0.4', 'input');
  });
  await page.waitForFunction(() => {
    const hint = document.querySelector('#pathHint');
    return !!hint && /slot/i.test(hint.textContent || '');
  });
  const savePromise = page.waitForEvent('download');
  await page.click('#fileSaveBtn');
  const saveDl = await savePromise;
  await saveDl.saveAs(projectBase);

  const projectObj = JSON.parse(fs.readFileSync(projectBase, 'utf8'));
  if (!Array.isArray(projectObj.pathConstraints) || projectObj.pathConstraints.length < 1) {
    throw new Error('project save missing path constraint');
  }
  const p0 = projectObj.pathConstraints[0];
  p0.sourceType = 'drawn';
  p0.points = [
    { x: 160, y: 160, hinx: 160, hiny: 160, houtx: 160, houty: 160, broken: false, handleMode: 'aligned' },
    { x: 260, y: 130, hinx: 260, hiny: 130, houtx: 260, houty: 130, broken: false, handleMode: 'aligned' },
    { x: 340, y: 190, hinx: 340, hiny: 190, houtx: 340, houty: 190, broken: false, handleMode: 'aligned' },
  ];
  fs.writeFileSync(projectPatched, JSON.stringify(projectObj, null, 2), 'utf8');
  await page.setInputFiles('#projectLoadInput', projectPatched);
  await page.waitForFunction(() => {
    const s = document.querySelector('#status');
    return !!s && /Project loaded/i.test(s.textContent || '');
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
  const p = Array.isArray(obj.path) ? obj.path[0] : null;
  if (!p) throw new Error('missing exported path constraint');
  if (p.positionMode !== 'percent') throw new Error(`expected positionMode=percent, got ${p.positionMode}`);
  if (p.spacingMode !== 'proportional') throw new Error(`expected spacingMode=proportional, got ${p.spacingMode}`);
  if (p.rotateMode !== 'chainScale') throw new Error(`expected rotateMode=chainScale, got ${p.rotateMode}`);

  console.log(
    'E2E_PATH_MODE_OK',
    JSON.stringify(
      {
        positionMode: p.positionMode,
        spacingMode: p.spacingMode,
        rotateMode: p.rotateMode,
        position: p.position,
        spacing: p.spacing,
      },
      null,
      2
    )
  );

  await browser.close();
} finally {
  await new Promise((resolve) => server.close(() => resolve()));
}
