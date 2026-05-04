// Side-by-side: home page footer vs pricing page footer.
import { chromium } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const OUT = "tests/visual/pricing";

const browser = await chromium.launch();

async function snap(path, label) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.goto(`${BASE_URL}${path}`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.fonts.ready);
  await page.waitForTimeout(800);

  // Scroll to bottom
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);

  await page.screenshot({ path: `${OUT}/footer-${label}.png` });
  await context.close();
}

await snap("/", "home");
await snap("/pricing", "pricing");

await browser.close();
console.log("✓ Footer comparison snapshots saved");
