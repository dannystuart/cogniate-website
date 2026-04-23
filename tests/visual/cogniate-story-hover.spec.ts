import { test } from "@playwright/test";
import path from "path";

test("tooltip on warning icon hover", async ({ page }) => {
  await page.setViewportSize({ width: 1728, height: 1080 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.fonts.ready);
  await page.waitForTimeout(500);

  const section = page.locator('[data-testid="cogniate-story-section"]');
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  // Hover over the first button (warning icon)
  const warningIcon = section.locator("button").first();
  await warningIcon.hover();
  await page.waitForTimeout(400);

  await section.screenshot({
    path: path.join(__dirname, "cogniate-story-hover.png"),
  });
});
