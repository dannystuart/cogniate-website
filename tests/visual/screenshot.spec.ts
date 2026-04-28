import { test } from "@playwright/test";
import path from "path";

test("capture landscape section - desktop 1728px", async ({ page }) => {
  await page.setViewportSize({ width: 1728, height: 1080 });
  await page.goto("http://localhost:3099", { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.fonts.ready);
  await page.waitForTimeout(1000);

  const landscape = page.locator('[data-testid="landscape-section"]');
  await landscape.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  await landscape.screenshot({
    path: path.join(__dirname, "landscape-current.png"),
  });
});

test("capture landscape section - mobile 375px", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("http://localhost:3099", { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.fonts.ready);
  await page.waitForTimeout(1000);

  const landscape = page.locator('[data-testid="landscape-section"]');
  await landscape.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  await landscape.screenshot({
    path: path.join(__dirname, "landscape-mobile.png"),
  });
});

test("capture landscape section - tablet 768px", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto("http://localhost:3099", { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.fonts.ready);
  await page.waitForTimeout(1000);

  const landscape = page.locator('[data-testid="landscape-section"]');
  await landscape.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  await landscape.screenshot({
    path: path.join(__dirname, "landscape-tablet.png"),
  });
});
