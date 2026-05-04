// Snapshot the nav on /pricing to verify route-active state.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const OUT = "tests/visual/nav";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();
await page.goto(`${BASE_URL}/pricing`, { waitUntil: "networkidle" });
await page.waitForFunction(() => document.fonts.ready);
await page.waitForTimeout(600);

await page.screenshot({
  path: `${OUT}/nav-pricing-active.png`,
  clip: { x: 0, y: 0, width: 1440, height: 180 },
});
await context.close();
await browser.close();
console.log("✓ saved");
