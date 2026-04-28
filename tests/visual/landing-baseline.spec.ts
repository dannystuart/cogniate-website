import { test, expect } from "@playwright/test";

const breakpoints = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

for (const bp of breakpoints) {
  test(`landing page baseline — ${bp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: bp.width, height: bp.height });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Pause all videos and reset to first frame so the hero autoplay
    // doesn't cause snapshot drift between runs.
    await page.evaluate(() => {
      document.querySelectorAll("video").forEach((v) => {
        v.pause();
        v.currentTime = 0;
      });
    });

    // Settle: video pause + lazy images + GSAP intro animations all converge by ~1.5s.
    // Empirically determined — under 1s produces flake on the hero region.
    await page.waitForTimeout(1500);

    await expect(page).toHaveScreenshot(`landing-${bp.name}.png`, {
      fullPage: true,
      animations: "disabled",
      maxDiffPixelRatio: 0.02,
      timeout: 15000,
    });
  });
}
