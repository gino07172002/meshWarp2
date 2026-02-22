import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const root = 'd:/claude';
const pngPath = path.join(root, 'tmp_e2e_slot.png');
const outJson = path.join(root, 'tmp_e2e_export.json');

// 2x2 opaque white png
const pngB64 = 'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR42mP8////fwYsgAmjAAMAAP//AwAF/wJ/lYI8wQAAAABJRU5ErkJggg==';
fs.writeFileSync(pngPath, Buffer.from(pngB64, 'base64'));

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

await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded' });

await page.setInputFiles('#fileInput', pngPath);
await page.waitForFunction(() => {
  const el = document.querySelector('#slotSelect');
  return !!el && el.options.length > 0;
});

const attachmentTrackValue = await page.evaluate(() => {
  const sel = document.querySelector('#trackSelect');
  if (!sel) return null;
  const opts = Array.from(sel.options || []);
  const hit = opts.find((o) => /\.Attachment$/.test(o.textContent || ''));
  return hit ? hit.value : null;
});
if (!attachmentTrackValue) throw new Error('Attachment track option not found');
await page.selectOption('#trackSelect', attachmentTrackValue);

await page.uncheck('#slotVisible');
await page.click('#addKeyBtn');

await page.fill('#animTime', '1');
await page.dispatchEvent('#animTime', 'input');
await page.check('#slotVisible');
await page.click('#addKeyBtn');

await page.fill('#animTime', '0.5');
await page.dispatchEvent('#animTime', 'input');
const visibleAtHalf = await page.isChecked('#slotVisible');
if (visibleAtHalf !== false) throw new Error(`Expected hidden at t=0.5, got ${visibleAtHalf}`);

await page.fill('#animTime', '1');
await page.dispatchEvent('#animTime', 'input');
const visibleAtOne = await page.isChecked('#slotVisible');
if (visibleAtOne !== true) throw new Error(`Expected visible at t=1, got ${visibleAtOne}`);

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
