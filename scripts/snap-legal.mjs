// Capture screenshots of /privacy and /terms so we can visually verify branding.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const OUT = "tests/visual/legal";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

async function snap(route, viewport, label) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.fonts.ready);
  await page.waitForTimeout(600);

  // Hero viewport
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/${label}-1-hero.png` });

  // Mid-content
  await page.evaluate(() =>
    window.scrollTo({ top: window.innerHeight * 1.2, behavior: "instant" })
  );
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/${label}-2-body.png` });

  // Full page
  await page.screenshot({ path: `${OUT}/${label}-full.png`, fullPage: true });

  await context.close();
}

await snap("/privacy", { width: 1440, height: 900 }, "privacy-desktop");
await snap("/privacy", { width: 390, height: 844 }, "privacy-mobile");
await snap("/terms", { width: 1440, height: 900 }, "terms-desktop");
await snap("/terms", { width: 390, height: 844 }, "terms-mobile");

await browser.close();
console.log(`✓ Snapshots saved to ${OUT}/`);
