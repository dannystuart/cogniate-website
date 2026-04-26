import { test, expect } from "@playwright/test";

/* ============================================
   HELPERS
   ============================================ */

/** Navigate to the page and wait for fonts. */
async function setup(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.waitForFunction(() => document.fonts.ready);
}

/** Scroll the platform section into view and give GSAP a tick to settle. */
async function revealPlatformSection(page: import("@playwright/test").Page) {
  const section = page.locator('[data-testid="platform-section"]');
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500); // allow GSAP toggleActions to fire
  return section;
}

/* ============================================
   DESKTOP (1728 x 1080)
   ============================================ */

test.describe("Platform Section - Desktop (1728x1080)", () => {
  test.use({ viewport: { width: 1728, height: 1080 } });

  test.beforeEach(async ({ page }) => {
    await setup(page);
  });

  test("section renders and is visible", async ({ page }) => {
    const section = await revealPlatformSection(page);
    await expect(section).toBeVisible();
  });

  test("section title is visible with correct text", async ({ page }) => {
    await revealPlatformSection(page);
    const title = page.locator(
      '[data-testid="platform-section"] h2'
    );
    await expect(title).toBeVisible();
    await expect(title).toContainText("AI-native course authoring");
    await expect(title).toContainText("The first of its kind");
  });

  test("first card is visible with content-left layout", async ({ page }) => {
    await revealPlatformSection(page);

    // The first card ("Create") should be visible by default on desktop
    const createCard = page.locator(
      '[data-testid="platform-section"]'
    ).getByText("Create", { exact: true });
    await expect(createCard).toBeVisible();

    // Subtitle with trademark
    const subtitle = page.locator(
      '[data-testid="platform-section"]'
    ).getByText("with Lyra");
    await expect(subtitle).toBeVisible();
  });

  test("gradient background image loads", async ({ page }) => {
    await revealPlatformSection(page);

    // The section contains an <img> for the gradient background
    const bgImage = page.locator(
      '[data-testid="platform-section"] img[src*="platform-gradient-bg"]'
    );
    await expect(bgImage).toBeAttached();
  });

  test("placeholder area exists on first card", async ({ page }) => {
    await revealPlatformSection(page);

    // Each card has a placeholder area with a card-gradient image
    const placeholder = page.locator(
      '[data-testid="platform-section"] img[src*="platform-card-gradient"]'
    ).first();
    await expect(placeholder).toBeAttached();
  });
});

/* ============================================
   MOBILE (390 x 844)
   ============================================ */

test.describe("Platform Section - Mobile (390x844)", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await setup(page);
  });

  test("section renders on mobile", async ({ page }) => {
    const section = await revealPlatformSection(page);
    await expect(section).toBeVisible();
  });

  test("all three cards are visible in vertical flow", async ({ page }) => {
    await revealPlatformSection(page);

    // On mobile (< 1024px), GSAP sets simple fade-in per card rather than
    // stacked absolutes, so all three cards should eventually be in the DOM
    // and visible after scrolling.
    const section = page.locator('[data-testid="platform-section"]');

    // Verify each card title text is present
    await expect(section.getByText("Create", { exact: true })).toBeAttached();
    await expect(section.getByText("Design", { exact: true })).toBeAttached();
    await expect(section.getByText("Publish", { exact: true })).toBeAttached();
  });

  test("card text is readable at mobile width", async ({ page }) => {
    await revealPlatformSection(page);

    const section = page.locator('[data-testid="platform-section"]');

    // Descriptions should be present in the DOM
    await expect(
      section.getByText("Lyra is a course creation intelligence")
    ).toBeAttached();
    await expect(
      section.getByText("A powerful design engine")
    ).toBeAttached();
    await expect(
      section.getByText("Deploy to any LMS")
    ).toBeAttached();
  });

  test("cards stack vertically on mobile", async ({ page }) => {
    await revealPlatformSection(page);

    const section = page.locator('[data-testid="platform-section"]');

    // All three cards' titles should be in the DOM
    const createTitle = section.getByText("Create", { exact: true });
    const designTitle = section.getByText("Design", { exact: true });
    const publishTitle = section.getByText("Publish", { exact: true });

    // On mobile the cards are in a flex-col, so each card's top
    // should be below the previous one's top.
    const createBox = await createTitle.boundingBox();
    const designBox = await designTitle.boundingBox();
    const publishBox = await publishTitle.boundingBox();

    expect(createBox).not.toBeNull();
    expect(designBox).not.toBeNull();
    expect(publishBox).not.toBeNull();

    // Vertical ordering: create above design above publish
    expect(createBox!.y).toBeLessThan(designBox!.y);
    expect(designBox!.y).toBeLessThan(publishBox!.y);
  });
});

/* ============================================
   CARD STRUCTURE
   ============================================ */

test.describe("Platform Section - Card Structure", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await setup(page);
  });

  test("each card has title, subtitle with trademark, and description", async ({
    page,
  }) => {
    await revealPlatformSection(page);
    const section = page.locator('[data-testid="platform-section"]');

    // Card 1: Create
    await expect(section.getByText("Create", { exact: true })).toBeAttached();
    await expect(section.getByText("with Lyra")).toBeAttached();
    await expect(
      section.getByText("Lyra is a course creation intelligence")
    ).toBeAttached();

    // Card 2: Design
    await expect(section.getByText("Design", { exact: true })).toBeAttached();
    await expect(section.getByText("with Studio")).toBeAttached();
    await expect(
      section.getByText("A powerful design engine")
    ).toBeAttached();

    // Card 3: Publish
    await expect(section.getByText("Publish", { exact: true })).toBeAttached();
    await expect(section.getByText("with Nexus")).toBeAttached();
    await expect(
      section.getByText("Deploy to any LMS")
    ).toBeAttached();
  });

  test("trademark symbol is present on each card subtitle", async ({
    page,
  }) => {
    await revealPlatformSection(page);
    const section = page.locator('[data-testid="platform-section"]');

    // The trademark is rendered as a separate <span> with "\u00AE"
    // Check that the section contains three instances of the registered symbol
    const trademarks = section.getByText("\u00AE");
    await expect(trademarks).toHaveCount(3);
  });

  test("each card has exactly 2 feature blocks with icon buttons", async ({
    page,
  }) => {
    await revealPlatformSection(page);
    const section = page.locator('[data-testid="platform-section"]');

    // Card 1 features: "Prompt to life" appears twice
    const promptToLife = section.getByText("Prompt to life");
    await expect(promptToLife).toHaveCount(2);

    // Card 2 features
    await expect(section.getByText("Drag & drop")).toBeAttached();
    await expect(section.getByText("Brand ready")).toBeAttached();

    // Card 3 features
    await expect(section.getByText("One-click deploy")).toBeAttached();
    await expect(section.getByText("Always current")).toBeAttached();

    // Each feature block has an arrow icon button (6 total across 3 cards)
    const featureIcons = section.locator(
      'img[src*="platform-icon-arrow"]'
    );
    await expect(featureIcons).toHaveCount(6);
  });

  test("flipped card (Design) has content-right layout", async ({ page }) => {
    // On desktop, the Design card has lg:order-2 on content and lg:order-1
    // on the placeholder, swapping their visual positions.
    // We test this by checking the CSS order property at desktop width.
    await page.setViewportSize({ width: 1728, height: 1080 });
    await page.goto("/");
    await page.waitForFunction(() => document.fonts.ready);
    await revealPlatformSection(page);

    // Find the Design card's content side (contains "Design" text)
    // The content-right layout applies lg:order-2 to the content div
    const designContentOrder = await page.evaluate(() => {
      // Find the element containing "with Studio" subtitle
      const subtitles = document.querySelectorAll(
        '[data-testid="platform-section"] span'
      );
      for (const span of subtitles) {
        if (span.textContent?.includes("with Studio")) {
          // Walk up to the content wrapper (the div with lg:order-2)
          const contentDiv = span.closest(
            ".lg\\:order-2, [class*='order-2']"
          ) ?? span.closest("div.relative.z-10.shrink-0");
          if (contentDiv) {
            return window.getComputedStyle(contentDiv).order;
          }
        }
      }
      return null;
    });

    // On desktop, the Design card's content should have order: 2
    expect(designContentOrder).toBe("2");
  });
});

/* ============================================
   SCREENSHOT BASELINES
   ============================================ */

test.describe("Platform Section - Screenshot Baselines", () => {
  test("desktop screenshot baseline (1728x1080)", async ({ page }) => {
    await page.setViewportSize({ width: 1728, height: 1080 });
    await setup(page);
    const section = await revealPlatformSection(page);

    await expect(section).toHaveScreenshot("platform-section-desktop.png", {
      maxDiffPixelRatio: 0.05,
    });
  });

  test("mobile screenshot baseline (390x844)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await setup(page);
    const section = await revealPlatformSection(page);

    await expect(section).toHaveScreenshot("platform-section-mobile.png", {
      maxDiffPixelRatio: 0.05,
    });
  });
});
