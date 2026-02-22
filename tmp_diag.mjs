import { chromium } from 'playwright';
import fs from 'fs';
const png='d:/claude/tmp_e2e_slot.jpg';
if(!fs.existsSync(png)){fs.writeFileSync(png, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR42mP8////fwYsgAmjAAMAAP//AwAF/wJ/lYI8wQAAAABJRU5ErkJggg==','base64'));}
const browser=await chromium.launch({headless:true});
const page=await browser.newPage();
page.on('console',m=>console.log('CONSOLE',m.type(),m.text()));
page.on('pageerror',e=>console.log('PAGEERR',e.message));
await page.goto('http://127.0.0.1:4173/index.html',{waitUntil:'domcontentloaded'});
await page.waitForTimeout(2000);
console.log('status0', await page.locator('#status').textContent());
console.log('slotOptions0', await page.locator('#slotSelect option').count());
await page.setInputFiles('#fileInput', png);
await page.waitForTimeout(4000);
console.log('status1', await page.locator('#status').textContent());
console.log('slotOptions1', await page.locator('#slotSelect option').count());
await browser.close();
