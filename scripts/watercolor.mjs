/**
 * Bakes the watercolour washes to static WebP images.
 *
 * The washes used to be live SVG filters (feTurbulence + displacement +
 * blur) rasterised by the browser at full viewport size — the single
 * biggest paint cost on mobile, and re-rasterised while the gate doors
 * animate. The palette is fixed to wisteria, so the exact same filter can
 * be rendered ONCE here and shipped as three small images instead.
 *
 *   node scripts/watercolor.mjs      # writes src/assets/watercolor/wash-{a,b,c}.webp
 *
 * Keep the BLOBS table in sync with the old src/components/stationery/
 * Watercolor.tsx composition if the washes ever need re-tuning.
 */
import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const SIZE = 896;
const OUT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src/assets/watercolor");

/* wisteria — the site's one palette (src/themes/palettes.ts) */
const COLORS = {
  primary: "#75689f",
  secondary: "#8fa184",
  accent: "#c3d64b",
};

/* Same compositions as the old runtime component. */
const BLOBS = {
  a: [
    { cx: 10, cy: 16, rx: 30, ry: 22, fill: "secondary", o: 0.3, rot: -12 },
    { cx: 22, cy: 30, rx: 18, ry: 14, fill: "secondary", o: 0.18, rot: 30 },
    { cx: 90, cy: 12, rx: 26, ry: 18, fill: "primary", o: 0.2, rot: 10 },
    { cx: 78, cy: 26, rx: 16, ry: 12, fill: "accent", o: 0.16, rot: -20 },
    { cx: 84, cy: 86, rx: 32, ry: 20, fill: "secondary", o: 0.26, rot: 18 },
    { cx: 12, cy: 90, rx: 26, ry: 16, fill: "accent", o: 0.22, rot: -8 },
    { cx: 30, cy: 78, rx: 14, ry: 10, fill: "primary", o: 0.14, rot: 12 },
  ],
  b: [
    { cx: 92, cy: 20, rx: 30, ry: 24, fill: "secondary", o: 0.26, rot: 14 },
    { cx: 76, cy: 10, rx: 16, ry: 12, fill: "accent", o: 0.18, rot: -10 },
    { cx: 6, cy: 42, rx: 24, ry: 30, fill: "primary", o: 0.16, rot: -20 },
    { cx: 20, cy: 60, rx: 14, ry: 10, fill: "secondary", o: 0.16, rot: 25 },
    { cx: 42, cy: 98, rx: 34, ry: 18, fill: "accent", o: 0.22, rot: 6 },
    { cx: 72, cy: 72, rx: 28, ry: 20, fill: "secondary", o: 0.2, rot: -30 },
  ],
  c: [
    { cx: 18, cy: 8, rx: 32, ry: 20, fill: "primary", o: 0.16, rot: 8 },
    { cx: 36, cy: 20, rx: 14, ry: 10, fill: "accent", o: 0.16, rot: -18 },
    { cx: 86, cy: 40, rx: 26, ry: 30, fill: "secondary", o: 0.18, rot: -14 },
    { cx: 24, cy: 82, rx: 30, ry: 22, fill: "accent", o: 0.2, rot: 22 },
    { cx: 78, cy: 94, rx: 26, ry: 14, fill: "primary", o: 0.18, rot: -6 },
    { cx: 60, cy: 80, rx: 14, ry: 10, fill: "secondary", o: 0.16, rot: 40 },
  ],
};

function svgFor(variant) {
  const blobs = BLOBS[variant]
    .map((b) => {
      const rot = b.rot ? ` transform="rotate(${b.rot} ${b.cx} ${b.cy})"` : "";
      return `<ellipse cx="${b.cx}" cy="${b.cy}" rx="${b.rx}" ry="${b.ry}"${rot} fill="${COLORS[b.fill]}" fill-opacity="${b.o}"/>`;
    })
    .join("\n        ");
  return `
    <svg viewBox="0 0 100 100" width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="wc" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.035 0.045" numOctaves="4" seed="7" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="26" xChannelSelector="R" yChannelSelector="G" result="disp"/>
          <feGaussianBlur in="disp" stdDeviation="2.6"/>
        </filter>
      </defs>
      <g filter="url(#wc)">
        ${blobs}
      </g>
    </svg>`;
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME || "/usr/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox", "--hide-scrollbars", `--window-size=${SIZE},${SIZE}`],
});

const page = await browser.newPage();
await page.setViewport({ width: SIZE, height: SIZE, deviceScaleFactor: 1 });

for (const variant of Object.keys(BLOBS)) {
  await page.setContent(
    `<!doctype html><html><body style="margin:0;background:transparent">${svgFor(variant)}</body></html>`,
    { waitUntil: "domcontentloaded" }
  );
  // give the filter a beat to rasterise before the shot
  await new Promise((r) => setTimeout(r, 400));
  const file = path.join(OUT_DIR, `wash-${variant}.webp`);
  await page.screenshot({ path: file, type: "webp", quality: 72, omitBackground: true });
  console.log(`wrote ${file} (${(fs.statSync(file).size / 1024).toFixed(1)} KB)`);
}

await browser.close();
