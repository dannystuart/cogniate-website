import { test, expect } from "@playwright/test";

/**
 * Visual snapshots for the four resting states of the particle-swarm
 * choreography. Skipped by default — even with `?particleProgress` freezing
 * uTime, the WebGL canvas re-renders every frame, so Playwright's
 * `toHaveScreenshot` stability comparison never settles. To enable later
 * (e.g. for regression tests after the visual is fully signed off), one of:
 *   1. Remove `.skip` and tighten `maxDiffPixelRatio` once the visual locks;
 *   2. Capture a single-shot via `page.screenshot()` and compare to a saved
 *      baseline manually;
 *   3. Halt useFrame in test mode so the canvas truly stops repainting.
 *
 * The page exposes a dev-only `?particleProgress=N` URL flag (gated on
 * NODE_ENV !== "production") that forces progressRef to N and skips the
 * pinned ScrollTrigger. ParticleSwarm also freezes its uTime uniform when
 * that flag is present so the drifting blob is positionally stable.
 */
const cases = [
  { name: "pre-trigger", query: "0.0" },
  { name: "logo-locked", query: "0.30" },
  { name: "icons-placed", query: "0.70" },
  { name: "blob-settled", query: "1.0" },
] as const;

for (const { name, query } of cases) {
  test.skip(`cogniate story particle swarm — ${name}`, async ({ page }) => {
    await page.goto(`/?particleProgress=${query}`);
    await page.waitForFunction(() => document.fonts.ready);
    // The section is min-h-screen on desktop and the locator-based scroll APIs
    // hang on its size; bypass via direct page.evaluate.
    await page.evaluate(() => {
      const sec = document.querySelector('[data-testid="cogniate-story-section"]');
      if (sec instanceof HTMLElement) sec.scrollIntoView({ block: "start" });
    });
    // Silhouette load + first geometry build is async; allow time for the
    // canvas to render the formed state before snapshotting.
    await page.waitForTimeout(1200);
    await expect(page).toHaveScreenshot(`cogniate-story-particle-${name}.png`, {
      maxDiffPixelRatio: 0.05,
    });
  });
}
