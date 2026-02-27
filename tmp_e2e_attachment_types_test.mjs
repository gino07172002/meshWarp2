import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import url from 'node:url';

const root = 'd:/claude';
const host = '127.0.0.1';
const port = 4180;
const rootAbs = path.resolve(root).replace(/\\/g, '/').toLowerCase();
const gifPath = path.join(root, 'tmp_e2e_path_mode_big.gif');
const exportOut = path.join(root, 'tmp_e2e_attachment_types_export.json');
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
    if (msg.includes('Export base name')) return dialog.accept('tmp_e2e_attachment_types');
    if (msg.includes('Atlas texture scale')) return dialog.accept('1');
    return dialog.dismiss();
  });

  await page.goto(`http://${host}:${port}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.setInputFiles('#fileInput', gifPath);
  await page.waitForFunction(() => {
    const s = document.querySelector('#slotSelect');
    return !!s && s.options.length > 0;
  });

  const run = async (fn, arg) => page.evaluate(fn, arg);
  await run(() => {
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
    setVal('#slotAttachment', 'main');
    setChecked('#slotAttachmentSequenceEnabled', true);
    setVal('#slotAttachmentSequenceCount', '6', 'input');
    setVal('#slotAttachmentSequenceStart', '2', 'input');
    setVal('#slotAttachmentSequenceDigits', '3', 'input');
    click('#slotAttachmentAddBtn');
    click('#slotAttachmentAddBtn');
    click('#slotAttachmentAddBtn');
  });

  const names = await run(() => {
    const sel = document.querySelector('#slotAttachment');
    const opts = Array.from(sel?.options || []).map((o) => String(o.value));
    return opts.filter((v) => v !== '__none__');
  });
  if (names.length < 4) throw new Error(`need >=4 attachments, got ${names.length}`);
  const baseName = names[0];
  const renameFrom1 = names[1];
  const renameFrom2 = names[2];
  const renameFrom3 = names[3];

  await run(({ baseName, renameFrom1, renameFrom2, renameFrom3 }) => {
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
    const renameAtt = (from, to) => {
      setVal('#slotAttachment', from);
      const input = document.querySelector('#slotAttachmentName');
      if (!input) throw new Error('missing #slotAttachmentName');
      input.value = String(to);
      input.dispatchEvent(new Event('change', { bubbles: true }));
    };
    renameAtt(renameFrom1, 'att_point');
    renameAtt(renameFrom2, 'att_bbox');
    renameAtt(renameFrom3, 'att_linked');

    setVal('#slotAttachment', baseName);
    setVal('#slotAttachmentType', 'region');
    setChecked('#slotAttachmentSequenceEnabled', true);
    setVal('#slotAttachmentSequenceCount', '6', 'input');
    setVal('#slotAttachmentSequenceStart', '2', 'input');
    setVal('#slotAttachmentSequenceDigits', '3', 'input');

    setVal('#slotAttachment', 'att_point');
    setVal('#slotAttachmentType', 'point');
    setVal('#slotAttachmentPointX', '12', 'input');
    setVal('#slotAttachmentPointY', '-7', 'input');
    setVal('#slotAttachmentPointRot', '33', 'input');

    setVal('#slotAttachment', 'att_bbox');
    setVal('#slotAttachmentType', 'boundingbox');
    setVal('#slotAttachmentBBoxSource', 'contour');

    setVal('#slotAttachment', 'att_linked');
    setVal('#slotAttachmentType', 'linkedmesh');
    setVal('#slotAttachmentLinkedParent', baseName);
  }, { baseName, renameFrom1, renameFrom2, renameFrom3 });

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
  await jsonDl.saveAs(exportOut);

  const obj = JSON.parse(fs.readFileSync(exportOut, 'utf8'));
  const skins = Array.isArray(obj.skins) ? obj.skins : [];
  const def = skins.find((s) => s && s.name === 'default') || skins[0];
  if (!def || !def.attachments) throw new Error('missing default skin');
  const slotName = Object.keys(def.attachments)[0];
  const attMap = def.attachments[slotName] || {};
  const main = attMap[baseName];
  const point = attMap.att_point;
  const bbox = attMap.att_bbox;
  const linked = attMap.att_linked;
  if (!main || !main.sequence || Number(main.sequence.count) !== 6 || Number(main.sequence.start) !== 2 || Number(main.sequence.digits) !== 3) {
    throw new Error('sequence export mismatch');
  }
  if (!point || point.type !== 'point' || Number(point.x) !== 12 || Number(point.y) !== -7 || Number(point.rotation) !== 33) {
    throw new Error('point attachment export mismatch');
  }
  if (!bbox || bbox.type !== 'boundingbox' || !Array.isArray(bbox.vertices) || bbox.vertices.length < 6) {
    throw new Error('bounding box attachment export mismatch');
  }
  if (!linked || linked.type !== 'linkedmesh' || linked.parent !== baseName) {
    throw new Error('linked mesh export mismatch');
  }

  console.log(
    'E2E_ATTACHMENT_TYPES_OK',
    JSON.stringify({ slotName, mainName: baseName, pointName: 'att_point', bboxName: 'att_bbox', linkedName: 'att_linked' }, null, 2)
  );
  await browser.close();
} finally {
  await new Promise((resolve) => server.close(() => resolve()));
}
