import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import url from 'node:url';

const root = 'd:/claude';
const host = '127.0.0.1';
const port = 4179;
const rootAbs = path.resolve(root).replace(/\\/g, '/').toLowerCase();
const gifPath = path.join(root, 'tmp_e2e_path_mode_big.gif');
const projectOut = path.join(root, 'tmp_e2e_constraint_skin_project.json');
const exportOut = path.join(root, 'tmp_e2e_constraint_skin_export.json');
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
    if (msg.includes('Export base name')) return dialog.accept('tmp_e2e_constraint_skin');
    if (msg.includes('Atlas texture scale')) return dialog.accept('1');
    return dialog.dismiss();
  });

  await page.goto(`http://${host}:${port}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.setInputFiles('#fileInput', gifPath);
  await page.waitForFunction(() => {
    const s = document.querySelector('#slotSelect');
    const b = document.querySelector('#boneSelect');
    return !!s && s.options.length >= 1 && !!b && b.options.length >= 1;
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
    const setChecked = (sel, checked) => {
      const el = document.querySelector(sel);
      if (!el) throw new Error(`missing ${sel}`);
      el.checked = !!checked;
      el.dispatchEvent(new Event('change', { bubbles: true }));
    };

    click('#workspaceTabRig');
    setVal('#editMode', 'skeleton');
    setVal('#boneMode', 'edit');
    click('#addBoneBtn');
  });
  const overlay = page.locator('#overlay');
  const box = await overlay.boundingBox();
  if (!box) throw new Error('missing overlay');
  await page.mouse.move(box.x + box.width * 0.45, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.62, box.y + box.height * 0.5);
  await page.mouse.up();

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
    const setChecked = (sel, checked) => {
      const el = document.querySelector(sel);
      if (!el) throw new Error(`missing ${sel}`);
      el.checked = !!checked;
      el.dispatchEvent(new Event('change', { bubbles: true }));
    };

    setVal('#boneMode', 'pose');

    click('#ikAdd1Btn');
    click('#tfcAddBtn');
    click('#pathAddBtn');

    setVal('#ikTargetBone', '0');
    setChecked('#ikSkinRequired', true);
    setChecked('#tfcSkinRequired', true);
    setChecked('#pathSkinRequired', true);

    setVal('#pathSourceType', 'bone_chain');
    setVal('#pathTargetBone', '0');
  });

  const savePromise = page.waitForEvent('download');
  await page.click('#fileSaveBtn');
  const saveDl = await savePromise;
  await saveDl.saveAs(projectOut);
  const projectObj = JSON.parse(fs.readFileSync(projectOut, 'utf8'));

  const ik0 = Array.isArray(projectObj.ikConstraints) ? projectObj.ikConstraints[0] : null;
  const tfc0 = Array.isArray(projectObj.transformConstraints) ? projectObj.transformConstraints[0] : null;
  const pth0 = Array.isArray(projectObj.pathConstraints) ? projectObj.pathConstraints[0] : null;
  if (!ik0 || !ik0.skinRequired) throw new Error('project: IK skinRequired not saved');
  if (!tfc0 || !tfc0.skinRequired) throw new Error('project: Transform skinRequired not saved');
  if (!pth0 || !pth0.skinRequired) throw new Error('project: Path skinRequired not saved');
  if (!pth0 || pth0.sourceType !== 'bone_chain') throw new Error(`project: expected path source bone_chain, got ${pth0 && pth0.sourceType}`);

  const exportPromise = page.waitForEvent('download');
  await page.click('#fileExportSpineBtn');
  const firstExportDl = await exportPromise;
  let jsonDl = firstExportDl;
  if (!firstExportDl.suggestedFilename().endsWith('.json')) {
    for (let i = 0; i < 3; i += 1) {
      const d = await page.waitForEvent('download');
      if (d.suggestedFilename().endsWith('.json')) {
        jsonDl = d;
        break;
      }
    }
  }
  await jsonDl.saveAs(exportOut);
  const spine = JSON.parse(fs.readFileSync(exportOut, 'utf8'));

  const exportIk0 = Array.isArray(spine.ik) ? spine.ik[0] : null;
  const exportTfc0 = Array.isArray(spine.transform) ? spine.transform[0] : null;
  const exportPath0 = Array.isArray(spine.path) ? spine.path[0] : null;
  if (!exportIk0 || exportIk0.skin !== true) throw new Error('export: IK skin flag missing');
  if (!exportTfc0 || exportTfc0.skin !== true) throw new Error('export: Transform skin flag missing');
  if (!exportPath0 || exportPath0.skin !== true) throw new Error('export: Path skin flag missing');

  console.log(
    'E2E_CONSTRAINT_SKIN_PATH_CHAIN_OK',
    JSON.stringify(
      {
        ikSkin: exportIk0.skin,
        transformSkin: exportTfc0.skin,
        pathSkin: exportPath0.skin,
        pathTarget: exportPath0.target,
      },
      null,
      2
    )
  );

  await browser.close();
} finally {
  await new Promise((resolve) => server.close(() => resolve()));
}
