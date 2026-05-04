// Side-by-side: full row, rest vs hover-Free vs hover-Creator (popular).
import { chromium } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const OUT = "tests/visual/pricing";

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 1100 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();
await page.goto(`${BASE_URL}/pricing`, { waitUntil: "networkidle" });
await page.waitForFunction(() => document.fonts.ready);
await page.waitForTimeout(800);

// Scroll so cards are centred (not pinned to viewport edge)
await page.evaluate(() => {
  const cards = document.querySelectorAll("[data-pricing-card]");
  if (cards[1]) {
    const r = cards[1].getBoundingClientRect();
    window.scrollBy({ top: r.top - 220, behavior: "instant" });
  }
});
await page.waitForTimeout(400);

const clip = { x: 100, y: 0, width: 1240, height: 1000 };

await page.mouse.move(0, 0);
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/row-rest.png`, clip });

await page.locator('[data-pricing-card]').nth(0).hover();
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/row-hover-free.png`, clip });

await page.locator('[data-pricing-card]').nth(1).hover();
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/row-hover-creator.png`, clip });

await browser.close();
console.log("✓ Row hover snapshots saved");
