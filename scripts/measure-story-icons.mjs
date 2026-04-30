// Measures the actual centers of the three story icons against the
// target points on the line-background SVG, prints per-axis pixel deltas,
// saves a screenshot, and exits non-zero if any delta exceeds 2px.
//
// Geometry from /public/assets/story-concentric-circles.svg (viewBox 1718x635):
//   Outer circle: cx=866.643 cy=317.222 r=316.614
//   Horizontal line: y=317.223 (full width)
//
// Targets (per the screenshot):
//   - Warning: left intersection of horizontal line with outer circle
//     x = (866.643 - 316.614) / 1718 = 32.0157%
//     y = 317.222 / 635           = 49.9562%
//   - Lightbulb: right intersection of horizontal line with outer circle
//     x = (866.643 + 316.614) / 1718 = 68.8742%
//     y = 49.9562%
//   - Flag: top of outer circle (cx, cy - r)
//     x = 866.643 / 1718 = 50.4448%
//     y = (317.222 - 316.614) / 635 = 0.0957%

import { chromium } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const TOLERANCE_PX = 2;

const VIEWBOX_W = 1718;
const VIEWBOX_H = 635;
const OUTER_CX = 866.643;
const OUTER_CY = 317.222;
const OUTER_R = 316.614;

const targets = {
  problem: {
    label: "Warning (problem)",
    selector: 'img[alt="Problem"]',
    xPct: (OUTER_CX - OUTER_R) / VIEWBOX_W,
    yPct: OUTER_CY / VIEWBOX_H,
  },
  mission: {
    label: "Flag (mission)",
    selector: 'img[alt="Mission"]',
    xPct: OUTER_CX / VIEWBOX_W,
    yPct: (OUTER_CY - OUTER_R) / VIEWBOX_H,
  },
  insight: {
    label: "Lightbulb (insight)",
    selector: 'img[alt="Insight"]',
    xPct: (OUTER_CX + OUTER_R) / VIEWBOX_W,
    yPct: OUTER_CY / VIEWBOX_H,
  },
};

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1728, height: 1080 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();
await page.goto(BASE_URL, { waitUntil: "networkidle" });

const section = page.locator('[data-testid="cogniate-story-section"]');
await section.scrollIntoViewIfNeeded();
await page.waitForFunction(() => document.fonts.ready);
// allow GSAP entrance animation to settle
await page.waitForTimeout(1500);

// SVG container bounding box (the immediate parent of the bg img holds the icons too).
// We use the bg img bounding box because it is exactly the SVG drawing area.
const bgBox = await page.locator('img[src="/assets/story-concentric-circles.svg"]').first().boundingBox();
if (!bgBox) {
  console.error("Could not find background SVG bounding box");
  process.exit(2);
}

console.log("Background SVG box:", bgBox);

let maxDelta = 0;
const report = [];

for (const key of Object.keys(targets)) {
  const t = targets[key];
  const targetX = bgBox.x + t.xPct * bgBox.width;
  const targetY = bgBox.y + t.yPct * bgBox.height;
  const iconImg = page.locator(t.selector).first();
  const iconImgBox = await iconImg.boundingBox();
  if (!iconImgBox) {
    console.error(`Could not find ${t.label}`);
    process.exit(2);
  }
  // The icon centre as rendered. The img is inside a wrapper containing a halo;
  // we want the **icon's** visual centre. The img element of the icon
  // is the inner art and is centred within the wrapper, but the wrapper
  // includes the halo. The halo is symmetric so the wrapper's centre = icon centre.
  // Use the wrapper (parent of the StoryIcon img) for stability.
  const wrapper = iconImg.locator('xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " absolute ")][1]');
  const wBox = await wrapper.boundingBox();
  if (!wBox) {
    console.error(`Could not find wrapper for ${t.label}`);
    process.exit(2);
  }
  const actualX = wBox.x + wBox.width / 2;
  const actualY = wBox.y + wBox.height / 2;

  const dx = actualX - targetX;
  const dy = actualY - targetY;
  const delta = Math.max(Math.abs(dx), Math.abs(dy));
  if (delta > maxDelta) maxDelta = delta;

  report.push({
    icon: t.label,
    targetXPct: (t.xPct * 100).toFixed(4) + "%",
    targetYPct: (t.yPct * 100).toFixed(4) + "%",
    targetX: targetX.toFixed(2),
    targetY: targetY.toFixed(2),
    actualX: actualX.toFixed(2),
    actualY: actualY.toFixed(2),
    dx: dx.toFixed(2),
    dy: dy.toFixed(2),
    pass: delta <= TOLERANCE_PX,
  });
}

console.table(report);
console.log(`Max delta: ${maxDelta.toFixed(2)} px (tolerance ${TOLERANCE_PX} px)`);

await section.screenshot({ path: "tests/visual/cogniate-story-current.png" });

await browser.close();

if (maxDelta > TOLERANCE_PX) {
  process.exit(1);
}
process.exit(0);
