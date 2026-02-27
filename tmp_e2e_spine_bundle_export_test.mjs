import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import url from 'node:url';

const root = 'd:/claude';
const host = '127.0.0.1';
const port = 4182;
const rootAbs = path.resolve(root).replace(/\\/g, '/').toLowerCase();
const gifPath = path.join(root, 'tmp_e2e_slot.gif');
const outDir = root;
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
    '.atlas': 'text/plain; charset=utf-8',
    '.skel': 'application/octet-stream',
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

function parseAtlas(atlasText) {
  const lines = String(atlasText || '').split(/\r?\n/);
  const pageName = (lines[0] || '').trim();
  const regions = [];
  let idx = 1;
  while (idx < lines.length) {
    const line = lines[idx].trim();
    idx += 1;
    if (!line) continue;
    if (line.includes(':')) continue;
    regions.push(line);
  }
  return { pageName, regions };
}

function getDefaultSkinAttachmentNames(spineJson) {
  const skins = Array.isArray(spineJson.skins) ? spineJson.skins : [];
  const def = skins.find((s) => s && s.name === 'default') || skins[0];
  if (!def || !def.attachments || typeof def.attachments !== 'object') return [];
  const out = [];
  for (const slotName of Object.keys(def.attachments)) {
    const map = def.attachments[slotName];
    if (!map || typeof map !== 'object') continue;
    for (const attName of Object.keys(map)) out.push(String(attName));
  }
  return Array.from(new Set(out));
}

const server = await startServer();
try {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('dialog', async (dialog) => {
    const msg = dialog.message() || '';
    if (msg.includes('Export base name')) return dialog.accept('tmp_e2e_bundle');
    if (msg.includes('Atlas texture scale')) return dialog.accept('1');
    return dialog.dismiss();
  });

  await page.goto(`http://${host}:${port}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.setInputFiles('#fileInput', gifPath);
  await page.waitForFunction(() => {
    const s = document.querySelector('#slotSelect');
    return !!s && s.options.length > 0;
  });

  const downloads = [];
  page.on('download', (d) => downloads.push(d));
  await page.click('#fileExportSpineBtn');
  await page.waitForTimeout(1200);

  if (downloads.length < 4) {
    throw new Error(`expected >=4 downloads, got ${downloads.length}`);
  }

  const picked = {};
  for (const d of downloads) {
    const name = d.suggestedFilename();
    if (name.endsWith('.json') && !picked.json) picked.json = d;
    else if (name.endsWith('.atlas') && !picked.atlas) picked.atlas = d;
    else if (name.endsWith('.png') && !picked.png) picked.png = d;
    else if (name.endsWith('.skel') && !picked.skel) picked.skel = d;
  }
  for (const ext of ['json', 'atlas', 'png', 'skel']) {
    if (!picked[ext]) throw new Error(`missing export file: .${ext}`);
  }

  const outJson = path.join(outDir, picked.json.suggestedFilename());
  const outAtlas = path.join(outDir, picked.atlas.suggestedFilename());
  const outPng = path.join(outDir, picked.png.suggestedFilename());
  const outSkel = path.join(outDir, picked.skel.suggestedFilename());
  await picked.json.saveAs(outJson);
  await picked.atlas.saveAs(outAtlas);
  await picked.png.saveAs(outPng);
  await picked.skel.saveAs(outSkel);

  const jsonObj = JSON.parse(fs.readFileSync(outJson, 'utf8'));
  const atlasText = fs.readFileSync(outAtlas, 'utf8');
  const pngBuf = fs.readFileSync(outPng);
  const skelBuf = fs.readFileSync(outSkel);

  if (pngBuf.length < 16) throw new Error('png too small');
  const pngSig = pngBuf.subarray(0, 8);
  const expectedPngSig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (!pngSig.equals(expectedPngSig)) throw new Error('png signature mismatch');

  if (skelBuf.length < 32) throw new Error('skel too small');
  const spineVersion = String(jsonObj?.skeleton?.spine || '').trim();
  if (!spineVersion) throw new Error('json skeleton.spine missing');
  if (!skelBuf.includes(Buffer.from(spineVersion, 'utf8'))) {
    throw new Error(`skel does not contain spine version string: ${spineVersion}`);
  }

  const atlas = parseAtlas(atlasText);
  if (!atlas.pageName) throw new Error('atlas page name missing');
  if (atlas.pageName !== path.basename(outPng)) {
    throw new Error(`atlas page mismatch: atlas=${atlas.pageName}, png=${path.basename(outPng)}`);
  }
  if (atlas.regions.length < 1) throw new Error('atlas has no regions');

  const attachmentNames = getDefaultSkinAttachmentNames(jsonObj);
  const atlasRegionSet = new Set(atlas.regions);
  const overlap = attachmentNames.filter((n) => atlasRegionSet.has(n));
  if (overlap.length < 1) {
    throw new Error('atlas regions do not match any default skin attachment name');
  }

  console.log(
    'E2E_SPINE_BUNDLE_OK',
    JSON.stringify(
      {
        files: {
          json: path.basename(outJson),
          atlas: path.basename(outAtlas),
          png: path.basename(outPng),
          skel: path.basename(outSkel),
        },
        spine: spineVersion,
        atlasRegions: atlas.regions.length,
        matchedAttachments: overlap.length,
      },
      null,
      2
    )
  );

  await browser.close();
} finally {
  await new Promise((resolve) => server.close(() => resolve()));
}
