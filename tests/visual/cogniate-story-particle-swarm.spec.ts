import { test, expect } from "@playwright/test";

/**
 * Visual snapshots for the four resting states of the particle-swarm
 * choreography. Motion mid-flight is too noisy to snapshot reliably; this
 * suite covers only the deterministic frozen-progress states.
 *
 * The page exposes a dev-only `?particleProgress=N` URL flag (gated on
 * NODE_ENV !== "production") that forces progressRef to N and skips the
 * pinned ScrollTrigger. ParticleSwarm also freezes its uTime uniform when
 * that flag is present, so the drifting blob stays still between runs.
 */
const cases = [
  { name: "pre-trigger", query: "0.0" },
  { name: "logo-locked", query: "0.30" },
  { name: "icons-placed", query: "0.70" },
  { name: "blob-settled", query: "1.0" },
] as const;

for (const { name, query } of cases) {
  test(`cogniate story particle swarm — ${name}`, async ({ page }) => {
    await page.goto(`/?particleProgress=${query}`);
    const section = page.locator('[data-testid="cogniate-story-section"]');
    await section.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.fonts.ready);
    // Silhouette load + first geometry build is async; allow time for the
    // canvas to render the formed state before snapshotting.
    await page.waitForTimeout(800);
    await expect(section).toHaveScreenshot(`cogniate-story-particle-${name}.png`, {
      maxDiffPixelRatio: 0.05,
    });
  });
}
