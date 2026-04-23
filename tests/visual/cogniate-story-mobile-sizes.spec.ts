import { test } from "@playwright/test";
import path from "path";

const viewports = [
  { name: "iphone-se", width: 375, height: 667 },
  { name: "iphone-14", width: 390, height: 844 },
  { name: "iphone-14-pro-max", width: 428, height: 926 },
  { name: "ipad", width: 768, height: 1024 },
];

for (const vp of viewports) {
  test(`cogniate story - ${vp.name} (${vp.width}px)`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForFunction(() => document.fonts.ready);
    await page.waitForTimeout(500);

    const section = page.locator('[data-testid="cogniate-story-section"]');
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    await section.screenshot({
      path: path.join(__dirname, `cogniate-story-${vp.name}.png`),
    });
  });

  test(`cogniate story accordion - ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForFunction(() => document.fonts.ready);
    await page.waitForTimeout(500);

    const section = page.locator('[data-testid="cogniate-story-section"]');
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    // Tap the first visible icon to expand accordion
    const firstIcon = section.locator("button:visible").first();
    await firstIcon.click();
    await page.waitForTimeout(400);

    await section.screenshot({
      path: path.join(__dirname, `cogniate-story-${vp.name}-accordion.png`),
    });
  });
}
