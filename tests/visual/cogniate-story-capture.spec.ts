import { test } from "@playwright/test";
import path from "path";

test("capture cogniate story section - desktop 1728px", async ({ page }) => {
  await page.setViewportSize({ width: 1728, height: 1080 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.fonts.ready);
  await page.waitForTimeout(1000);

  const section = page.locator('[data-testid="cogniate-story-section"]');
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  await section.screenshot({
    path: path.join(__dirname, "cogniate-story-desktop.png"),
  });
});

test("capture cogniate story section - mobile 375px", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.fonts.ready);
  await page.waitForTimeout(1000);

  const section = page.locator('[data-testid="cogniate-story-section"]');
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  await section.screenshot({
    path: path.join(__dirname, "cogniate-story-mobile.png"),
  });
});

test("capture cogniate story section - tablet 768px", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.fonts.ready);
  await page.waitForTimeout(1000);

  const section = page.locator('[data-testid="cogniate-story-section"]');
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  await section.screenshot({
    path: path.join(__dirname, "cogniate-story-tablet.png"),
  });
});
