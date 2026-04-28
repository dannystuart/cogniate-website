import { test, expect } from "@playwright/test";

test("landscape section matches design", async ({ page }) => {
  await page.goto("/");

  const landscape = page.locator('[data-testid="landscape-section"]');
  await landscape.scrollIntoViewIfNeeded();

  // Wait for fonts to load
  await page.waitForFunction(() => document.fonts.ready);

  await expect(landscape).toHaveScreenshot("landscape-section.png", {
    maxDiffPixelRatio: 0.05,
  });
});
