import { test, expect } from "@playwright/test";

test("cogniate story section matches design", async ({ page }) => {
  await page.goto("/");

  const section = page.locator('[data-testid="cogniate-story-section"]');
  await section.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.fonts.ready);

  await expect(section).toHaveScreenshot("cogniate-story-section.png", {
    maxDiffPixelRatio: 0.05,
  });
});
