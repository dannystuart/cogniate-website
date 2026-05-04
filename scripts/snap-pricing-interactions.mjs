// Verify interactive states: billing toggle + accordion expand + sticky nav
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const OUT = "tests/visual/pricing";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();
await page.goto(`${BASE_URL}/pricing`, { waitUntil: "networkidle" });
await page.waitForFunction(() => document.fonts.ready);
await page.waitForTimeout(800);

// 1. Scroll to authoring
await page.evaluate(() => {
  const el = document.getElementById("authoring");
  if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: "instant" });
});
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/interaction-1-monthly.png` });

// 2. Click switch to enable Annual
await page.getByRole("switch", { name: "Bill annually" }).click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/interaction-2-annual.png` });

// 3. Click "See full plan" on Creator card
await page.locator('button[aria-controls="creator-details"]').click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/interaction-3-expanded.png` });

// 4. Sticky nav — scroll to publishing, capture top of viewport
await page.evaluate(() => {
  const el = document.getElementById("publishing");
  if (el) window.scrollTo({ top: el.offsetTop - 200, behavior: "instant" });
});
await page.waitForTimeout(500);
await page.screenshot({
  path: `${OUT}/interaction-4-sticky-nav.png`,
  clip: { x: 0, y: 0, width: 1440, height: 200 },
});

await browser.close();
console.log("✓ Interaction snapshots saved");
