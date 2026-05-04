// Snapshot the top nav at multiple viewports + hover state.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const OUT = "tests/visual/nav";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

async function snap(viewport, label, { hover = false } = {}) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.fonts.ready);
  await page.waitForTimeout(800); // let hero reveal complete

  if (hover) {
    const link = page.locator("nav").getByRole("link", { name: "How it works" });
    await link.hover();
    await page.waitForTimeout(450);
  }

  // Crop to top 220px so we just see the nav
  await page.screenshot({
    path: `${OUT}/nav-${label}.png`,
    clip: { x: 0, y: 0, width: viewport.width, height: 220 },
  });
  await context.close();
}

await snap({ width: 1440, height: 900 }, "desktop-default");
await snap({ width: 1440, height: 900 }, "desktop-hover", { hover: true });
await snap({ width: 1024, height: 800 }, "lg-default");
await snap({ width: 768, height: 900 }, "md-default");
await snap({ width: 390, height: 844 }, "mobile-default");

await browser.close();
console.log("✓ Nav snapshots saved to", OUT);
