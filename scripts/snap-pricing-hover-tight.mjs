// Tight crops of hover states for visual verification.
import { chromium } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const OUT = "tests/visual/pricing";

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();
await page.goto(`${BASE_URL}/pricing`, { waitUntil: "networkidle" });
await page.waitForFunction(() => document.fonts.ready);
await page.waitForTimeout(800);

await page.evaluate(() => {
  const el = document.getElementById("authoring");
  if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: "instant" });
});
await page.waitForTimeout(400);

const card = page.locator('[data-pricing-card]').nth(0); // Free
await page.mouse.move(0, 0);
await page.waitForTimeout(400);
const restBox = await card.boundingBox();
const clip = restBox && {
  x: Math.max(0, restBox.x - 40),
  y: Math.max(0, restBox.y - 30),
  width: Math.min(1440, restBox.width + 80),
  height: restBox.height + 60,
};

if (clip) {
  await page.screenshot({ path: `${OUT}/hover-tight-rest.png`, clip });
  await card.hover();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/hover-tight-hover.png`, clip });
}

await browser.close();
console.log("✓ Tight hover snapshots saved");
