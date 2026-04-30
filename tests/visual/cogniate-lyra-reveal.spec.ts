import { test, expect } from "@playwright/test";

/**
 * Visual snapshots for the four resting states of the Lyra reveal scroll.
 * Skipped by default — H.264 video decoding can vary between machines, so
 * `toHaveScreenshot` may flake until either:
 *   1. We capture single-shot screenshots and compare to a baseline manually,
 *   2. Tighten maxDiffPixelRatio once the visual locks,
 *   3. Replace the video with a poster-only fallback in test mode.
 *
 * The page exposes a dev-only `?lyraProgress=N` URL flag (gated on
 * NODE_ENV !== "production") that forces progressRef to N and skips the
 * pinned ScrollTrigger, so the section is statically renderable for snapshots.
 */
const cases = [
  { name: "pre-trigger", query: "0.0" },
  { name: "video-mid", query: "0.40" },
  { name: "lyra-arriving", query: "0.83" },
  { name: "all-revealed", query: "1.0" },
] as const;

for (const { name, query } of cases) {
  test.skip(`cogniate lyra reveal — ${name}`, async ({ page }) => {
    await page.goto(`/?lyraProgress=${query}`);
    await page.waitForFunction(() => document.fonts.ready);
    await page.evaluate(() => {
      const sec = document.querySelector('[data-testid="cogniate-lyra-reveal"]');
      if (sec instanceof HTMLElement) sec.scrollIntoView({ block: "start" });
    });
    // Allow the video to seek + draw the target frame.
    await page.waitForTimeout(800);
    await expect(page).toHaveScreenshot(`cogniate-lyra-reveal-${name}.png`, {
      maxDiffPixelRatio: 0.05,
    });
  });
}
