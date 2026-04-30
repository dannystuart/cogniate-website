// Snaps a tight crop around one of the story icons so we can visually
// confirm the inner-shadow ring is gone.
import { chromium } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1728, height: 1080 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();
await page.goto(BASE_URL, { waitUntil: "networkidle" });
const section = page.locator('[data-testid="cogniate-story-section"]');
await section.scrollIntoViewIfNeeded();
await page.waitForFunction(() => document.fonts.ready);
await page.waitForTimeout(1500);

for (const alt of ["Mission", "Problem", "Insight"]) {
  const wrapper = page.locator(`img[alt="${alt}"]`).first().locator(
    'xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " absolute ")][1]'
  );
  const box = await wrapper.boundingBox();
  if (!box) continue;
  // Pad around so the halo is visible.
  const pad = 30;
  await page.screenshot({
    path: `tests/visual/story-icon-${alt.toLowerCase()}.png`,
    clip: {
      x: Math.max(0, box.x - pad),
      y: Math.max(0, box.y - pad),
      width: box.width + pad * 2,
      height: box.height + pad * 2,
    },
  });
}

await browser.close();
