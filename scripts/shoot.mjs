/**
 * Visual QA harness — screenshots the opening, every section and the colour
 * picker in a palette, on desktop and mobile, and collects console/page errors.
 *
 *   npm run build && npm run preview &        # serves http://localhost:4173
 *   node scripts/shoot.mjs blush /tmp/shots
 *   node scripts/shoot.mjs sky /tmp/shots --reduced     # prefers-reduced-motion
 *   node scripts/shoot.mjs all /tmp/shots               # every palette
 */
import puppeteer from "puppeteer-core";
import fs from "fs";

const [, , paletteArg = "blush", outRoot = "/tmp/shots", ...flags] = process.argv;
const REDUCED = flags.includes("--reduced");
const MOBILE_ONLY = flags.includes("--mobile");
const DESKTOP_ONLY = flags.includes("--desktop");
const BASE = process.env.SHOOT_URL || "http://localhost:4173/";
const ALL = ["blush", "rose", "ivory", "linen", "sky", "sage"];
const PALETTES = paletteArg === "all" ? ALL : [paletteArg];
const SECTIONS = ["hero", "details", "action", "rsvp", "footer"];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME || "/usr/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu-sandbox", "--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--hide-scrollbars"],
});

const allErrors = {};

async function openPage(palette, width, height, mobile) {
  const page = await browser.newPage();
  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`[console ${width}w] ${m.text().slice(0, 300)}`);
  });
  page.on("pageerror", (e) => errors.push(`[pageerror ${width}w] ${String(e).slice(0, 300)}`));
  if (REDUCED) await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await page.setViewport({ width, height, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
  await page.goto(`${BASE}?palette=${palette}`, { waitUntil: "load", timeout: 90000 });
  await sleep(1500);
  return { page, errors };
}

async function openInvitation(page) {
  const clicked = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find((b) => /open invitation/i.test(b.textContent || ""));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  await sleep(clicked ? 5000 : 800);
  return clicked;
}

async function shootSection(page, id, path, settle = 3000) {
  await page.evaluate((sel) => {
    const el = document.getElementById(sel);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: Math.max(0, y - 64), behavior: "instant" });
    }
  }, id);
  await sleep(settle);
  await page.screenshot({ path });
}

async function safe(label, fn) {
  try {
    return await fn();
  } catch (e) {
    console.log(`  ! ${label}: ${String(e).split("\n")[0].slice(0, 160)}`);
    return null;
  }
}

async function run(palette) {
  const out = `${outRoot}/${palette}${REDUCED ? "-reduced" : ""}`;
  fs.mkdirSync(out, { recursive: true });
  const errs = [];

  const runs = [];
  if (!MOBILE_ONLY) runs.push({ tag: "d", w: 1440, h: 900, mobile: false });
  if (!DESKTOP_ONLY) runs.push({ tag: "m", w: 390, h: 844, mobile: true });

  for (const r of runs) {
    const { page, errors } = await openPage(palette, r.w, r.h, r.mobile);
    await safe(`${palette} ${r.tag}`, async () => {
      await page.screenshot({ path: `${out}/${r.tag}00-opening.png` });
      const opened = await openInvitation(page);
      console.log(`[${palette} ${r.tag}] opening gate ${opened ? "clicked" : "not found (reduced motion)"}`);
      await page.screenshot({ path: `${out}/${r.tag}01-hero.png` });

      let i = 2;
      for (const id of SECTIONS.slice(1)) {
        await shootSection(page, id, `${out}/${r.tag}${String(i).padStart(2, "0")}-${id}.png`);
        i++;
      }

      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await sleep(800);

      // colour picker
      const selOpened = await page.evaluate(() => {
        const btn = document.querySelector('button[aria-haspopup="dialog"]');
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      });
      await sleep(1400);
      if (selOpened) await page.screenshot({ path: `${out}/${r.tag}91-picker.png` });
      await page.keyboard.press("Escape");
      await sleep(500);
    });
    errs.push(...errors);
    await page.close().catch(() => {});
  }

  // Palette SWITCH test (desktop): open the picker, pick the next palette, screenshot mid-morph + after.
  if (!MOBILE_ONLY && !REDUCED) {
    const next = ALL[(ALL.indexOf(palette) + 1) % ALL.length];
    const { page, errors } = await openPage(palette, 1440, 900, false);
    await safe(`${palette} switch`, async () => {
      await openInvitation(page);
      await shootSection(page, "details", `${out}/s00-before-switch.png`, 1200);
      const switched = await page.evaluate(async (nextId) => {
        const trigger = document.querySelector('button[aria-haspopup="dialog"]');
        if (!trigger) return "no-trigger";
        trigger.click();
        await new Promise((r) => setTimeout(r, 900));
        const chip = Array.from(document.querySelectorAll('[role="dialog"] [data-chip]')).find((b) =>
          new RegExp(nextId, "i").test(b.getAttribute("aria-label") || "")
        );
        if (!chip) return "no-chip";
        chip.click();
        return "clicked";
      }, next);
      await sleep(350);
      await page.screenshot({ path: `${out}/s01-switching.png` });
      await sleep(1500);
      await page.keyboard.press("Escape");
      await sleep(700);
      await page.screenshot({ path: `${out}/s02-after-switch-${next}.png` });
      const info = await page.evaluate(() => ({
        palette: new URL(location.href).searchParams.get("palette"),
        y: window.scrollY,
      }));
      console.log(`[${palette}] switch → ${next}: ${switched}; now ${JSON.stringify(info)}`);
    });
    errs.push(...errors);
    await page.close().catch(() => {});
  }

  allErrors[palette] = [...new Set(errs)];
  console.log(`[${palette}] done → ${out}`);
}

for (const p of PALETTES) await run(p);
await browser.close();

console.log("\n=== PAGE ERRORS (deduped) ===");
for (const [t, e] of Object.entries(allErrors)) console.log(t + ":", e.length ? "\n  " + e.slice(0, 15).join("\n  ") : "none");
