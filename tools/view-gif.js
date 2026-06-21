const { chromium } = require("playwright");
const path = require("path");

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  const gifAbs = path.resolve(__dirname, "..", "runs", "hscene_seethrough.gif");
  const gifUrl = "file:///" + gifAbs.replace(/\\/g, "/");
  console.log("Opening:", gifUrl);
  await page.goto(gifUrl);
  await page.waitForTimeout(2000);
  for (let i = 0; i < 6; i++) {
    await page.screenshot({ path: path.resolve(__dirname, "..", "review-screenshots", `gif-view-${i}.png`) });
    await page.waitForTimeout(400);
  }
  await browser.close();
})();
