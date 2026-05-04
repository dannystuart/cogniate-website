// Snapshot the Signup section after the form-removal redesign.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const OUT = "tests/visual/signup";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

async function snap(viewport, label) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.fonts.ready);
  await page.waitForTimeout(400);

  // Scroll the signup section into view
  await page.evaluate(() => {
    const sec = Array.from(document.querySelectorAll("section")).find((s) =>
      s.textContent?.includes("Be First.")
    );
    if (sec) sec.scrollIntoView({ behavior: "instant", block: "start" });
  });
  await page.waitForTimeout(1200); // let GSAP play

  await page.screenshot({
    path: `${OUT}/signup-${label}.png`,
    fullPage: false,
  });
  await context.close();
}

await snap({ width: 1440, height: 900 }, "desktop");
await snap({ width: 768, height: 1024 }, "tablet");
await snap({ width: 390, height: 844 }, "mobile");

await browser.close();
console.log("✓ Signup snapshots saved to", OUT);
