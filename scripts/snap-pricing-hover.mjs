// Verify card hover state — popular vs non-popular, and that adjacent cards do NOT shift.
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

await page.evaluate(() => {
  const el = document.getElementById("authoring");
  if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: "instant" });
});
await page.waitForTimeout(400);

// Resting state
await page.mouse.move(0, 0);
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/hover-0-rest.png` });

// Hover the Free card (left)
const free = page.locator('[data-pricing-card]').nth(0);
await free.hover();
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/hover-1-free.png` });

// Hover the Creator card (popular, middle)
const creator = page.locator('[data-pricing-card]').nth(1);
await creator.hover();
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/hover-2-creator-popular.png` });

// Hover the Pro Creator card (right)
const pro = page.locator('[data-pricing-card]').nth(2);
await pro.hover();
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/hover-3-pro.png` });

// Measure: hover Free, capture Creator's bounding box — should NOT change vs resting
await page.mouse.move(0, 0);
await page.waitForTimeout(400);
const restCreatorBox = await creator.boundingBox();

await free.hover();
await page.waitForTimeout(400);
const hoveredCreatorBox = await creator.boundingBox();

console.log("Creator at rest:", restCreatorBox);
console.log("Creator while Free is hovered:", hoveredCreatorBox);
const dy = (hoveredCreatorBox?.y ?? 0) - (restCreatorBox?.y ?? 0);
console.log(`Δy = ${dy.toFixed(2)}px (should be 0)`);

await browser.close();
console.log("✓ Hover snapshots saved");
