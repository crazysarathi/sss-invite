/**
 * Generates public/og-image.png (1200×630) — the social-share card.
 * Renders an HTML card in headless Chrome using the site's real fonts
 * (@fontsource, from node_modules), the fixed wisteria palette and the
 * transparent host crest, then screenshots it.
 *
 *   node scripts/og.mjs
 *
 * Keep the copy in sync with src/data/siteData.ts when content changes.
 */
import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const f = (p) => `file://${path.join(root, p)}`;

const html = `<!doctype html>
<html><head><meta charset="utf-8">
<link rel="stylesheet" href="${f("node_modules/@fontsource-variable/cormorant/index.css")}">
<link rel="stylesheet" href="${f("node_modules/@fontsource-variable/cormorant/wght-italic.css")}">
<link rel="stylesheet" href="${f("node_modules/@fontsource/cormorant-sc/600.css")}">
<link rel="stylesheet" href="${f("node_modules/@fontsource/great-vibes/index.css")}">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px; overflow: hidden; position: relative;
    background: #f2f0f6;
    font-family: "Cormorant Variable", Georgia, serif;
    color: #282334;
  }
  .wash { position: absolute; inset: 0; background:
    radial-gradient(46rem 30rem at 8% -10%, rgba(179,171,200,.42), transparent 65%),
    radial-gradient(40rem 28rem at 96% 108%, rgba(143,161,132,.34), transparent 65%),
    radial-gradient(24rem 20rem at 82% 30%, rgba(195,214,75,.16), transparent 70%);
  }
  .frame  { position: absolute; inset: 24px; border: 1px solid rgba(195,214,75,.65); }
  .frame2 { position: absolute; inset: 34px; border: 1px solid rgba(195,214,75,.28); }
  .card { position: absolute; inset: 0; display: flex; align-items: center; padding: 0 84px; gap: 48px; }
  .left { flex: 1 1 auto; }
  .kicker {
    font-family: "Cormorant SC", "Cormorant Variable", serif;
    font-size: 26px; letter-spacing: .38em; color: #75689f; font-weight: 600;
  }
  h1 { font-size: 104px; font-weight: 500; line-height: 1.02; margin-top: 18px; }
  h1 em { font-style: italic; font-weight: 400; color: #75689f; }
  .script { font-family: "Great Vibes", cursive; font-size: 58px; color: #75689f; margin-top: 4px; }
  .rule { width: 220px; height: 1px; background: rgba(195,214,75,.9); margin: 30px 0 22px; }
  .facts {
    font-family: "Cormorant SC", "Cormorant Variable", serif;
    font-size: 25px; letter-spacing: .2em; color: #544d63; line-height: 1.75; font-weight: 600;
  }
  .facts .date { color: #282334; }
  .crest { flex: 0 0 auto; width: 300px; display: flex; justify-content: center; }
  .crest img { width: 300px; height: auto; filter: drop-shadow(0 16px 22px rgba(40,35,52,.22)); }
</style></head>
<body>
  <div class="wash"></div>
  <span class="frame"></span><span class="frame2"></span>
  <div class="card">
    <div class="left">
      <p class="kicker">YOU'RE INVITED</p>
      <h1>Pickle <em>&amp;</em> Pilates</h1>
      <p class="script">with Matcha &amp; Ube Bar</p>
      <div class="rule"></div>
      <p class="facts">A WELLNESS EXPERIENCE<br>
        <span class="date">29TH AUGUST, SATURDAY</span><br>
        FOREST HILLS COUNTRY CLUB, SALEM</p>
    </div>
    <div class="crest"><img src="${f("src/assets/logos/sss-crest.svg")}"></div>
  </div>
</body></html>`;

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME || "/usr/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu-sandbox", "--allow-file-access-from-files", "--hide-scrollbars"],
});
// A real file:// page (not setContent) so the file:// fonts + crest may load.
const tmpDir = path.join(root, "node_modules", ".cache");
fs.mkdirSync(tmpDir, { recursive: true });
const tmpHtml = path.join(tmpDir, "og.html");
fs.writeFileSync(tmpHtml, html);

const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
await page.goto(`file://${tmpHtml}`, { waitUntil: "networkidle0" });
await page.evaluate(() => document.fonts.ready);
await new Promise((r) => setTimeout(r, 400));
await page.screenshot({ path: path.join(root, "public/og-image.png") });
await browser.close();
fs.rmSync(tmpHtml, { force: true });
console.log("public/og-image.png written");
