// Capture full-page + viewport screenshots of the new /pricing route
// so we can visually verify the design.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const OUT = "tests/visual/pricing";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

async function snap(viewport, label) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.goto(`${BASE_URL}/pricing`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.fonts.ready);
  await page.waitForTimeout(800);

  // Full-page (long scroll)
  await page.screenshot({
    path: `${OUT}/${label}-full.png`,
    fullPage: true,
  });

  // Hero viewport
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/${label}-1-hero.png` });

  // Individuals subsection
  await page.evaluate(() => {
    const el = document.getElementById("individuals");
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: "instant" });
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${label}-2-individuals.png` });

  // Teams subsection
  await page.evaluate(() => {
    const el = document.getElementById("teams");
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: "instant" });
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${label}-3-teams.png` });

  await context.close();
}

await snap({ width: 1440, height: 900 }, "desktop");
await snap({ width: 768, height: 1024 }, "tablet");
await snap({ width: 390, height: 844 }, "mobile");

await browser.close();
console.log(`✓ Snapshots saved to ${OUT}/`);
