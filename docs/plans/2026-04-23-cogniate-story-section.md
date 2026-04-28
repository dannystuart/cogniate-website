# Cogniate Story Section — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the "Cogniate Story" section — three interactive story icons arranged around concentric circles with hover/tap tooltips, fully responsive.

**Architecture:** Client component (`"use client"`) managing `activeStory` state. Desktop: icons absolutely positioned over concentric-circles SVG, tooltip appears on hover. Mobile: icons stacked vertically, tooltip expands accordion-style on tap. Two sub-components: `StoryIcon` (icon circle + glow) and `StoryTooltip` (card content).

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Playwright for visual testing.

**Design doc:** `docs/plans/2026-04-23-cogniate-story-section-design.md`

---

### Task 1: Download Assets from Figma

**Files:**
- Create: `public/assets/story-warning-icon.png`
- Create: `public/assets/story-flag-icon.png`
- Create: `public/assets/story-lightbulb-icon.png`
- Create: `public/assets/story-cogniate-logo.png`
- Create: `public/assets/story-concentric-circles.svg`

**Step 1: Download icon assets from Figma URLs**

Download the Figma asset images to `public/assets/`. Use the URLs from the Figma MCP output:

- Warning icon: `https://www.figma.com/api/mcp/asset/4dfc11a9-2dba-4d66-9b31-be6d28f8325b` → `public/assets/story-warning-icon.png`
- Flag icon: `https://www.figma.com/api/mcp/asset/d1b9c27c-3195-4cd2-9061-825d8d56eb03` → `public/assets/story-flag-icon.png`
- Lightbulb ellipse bg: `https://www.figma.com/api/mcp/asset/0ceb94d8-cbf8-4fe2-8932-6afd62dd6df0` → `public/assets/story-lightbulb-bg.png`
- Lightbulb vector: `https://www.figma.com/api/mcp/asset/a63b2f0e-ca5f-4098-b636-2b0eaa7f8ab1` → `public/assets/story-lightbulb-vector.png`
- Cogniate logo: `https://www.figma.com/api/mcp/asset/1332bcd4-504f-4883-85d3-08df1fe5a01c` → `public/assets/story-cogniate-logo.png`
- Concentric circles bg: `https://www.figma.com/api/mcp/asset/a932d7b0-5937-477d-8f4a-0be426b41563` → `public/assets/story-concentric-circles.svg`

```bash
cd /Users/Danny/CodeProjects/cogniate-website/public/assets
curl -L -o story-warning-icon.png "https://www.figma.com/api/mcp/asset/4dfc11a9-2dba-4d66-9b31-be6d28f8325b"
curl -L -o story-flag-icon.png "https://www.figma.com/api/mcp/asset/d1b9c27c-3195-4cd2-9061-825d8d56eb03"
curl -L -o story-lightbulb-bg.png "https://www.figma.com/api/mcp/asset/0ceb94d8-cbf8-4fe2-8932-6afd62dd6df0"
curl -L -o story-lightbulb-vector.png "https://www.figma.com/api/mcp/asset/a63b2f0e-ca5f-4098-b636-2b0eaa7f8ab1"
curl -L -o story-cogniate-logo.png "https://www.figma.com/api/mcp/asset/1332bcd4-504f-4883-85d3-08df1fe5a01c"
curl -L -o story-concentric-circles.svg "https://www.figma.com/api/mcp/asset/a932d7b0-5937-477d-8f4a-0be426b41563"
```

**Step 2: Verify assets downloaded correctly**

```bash
ls -la public/assets/story-*
file public/assets/story-*
```

Expect: 6 files, each with a reasonable size (>1KB). Check they're actual images, not HTML error pages.

**Step 3: Commit**

```bash
git add public/assets/story-*
git commit -m "feat: add Cogniate Story section assets from Figma"
```

---

### Task 2: Add Design System Tokens

**Files:**
- Modify: `app/globals.css`

**Step 1: Add the story heading gradient class**

Add after the `.landscape-heading-gradient` block in `app/globals.css`:

```css
/* ============================================
   COGNIATE STORY SECTION
   ============================================ */

.story-heading-gradient {
  background: radial-gradient(
    ellipse 100% 500% at 50% 50%,
    rgba(255, 255, 255, 1) 0%,
    rgba(212, 209, 218, 0.75) 25%,
    rgba(169, 163, 180, 0.5) 50%,
    rgba(82, 71, 105, 0) 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

This matches the Figma heading gradient (same pattern as landscape-heading-gradient — radial from white center fading to transparent purple edges).

**Step 2: Verify the gradient renders**

Start dev server and check by temporarily adding a test element. Or wait until Task 5 when the section is built.

**Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: add story section heading gradient to design system"
```

---

### Task 3: Build StoryTooltip Component

**Files:**
- Create: `app/components/StoryTooltip.tsx`

**Step 1: Create StoryTooltip component**

```tsx
interface StoryTooltipProps {
  label: string;
  title: string;
  description: string;
  icon: string;
  className?: string;
}

export default function StoryTooltip({
  label,
  title,
  description,
  icon,
  className = "",
}: StoryTooltipProps) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-[#1a1a1e] p-10 sm:p-12 ${className}`}
    >
      {/* Category label */}
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent-purple mb-5">
        {label}
      </p>

      {/* Icon + Title row */}
      <div className="flex items-center gap-3 mb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={icon}
          alt=""
          className="size-[30px]"
        />
        <h3 className="text-xl font-semibold text-white">{title}</h3>
      </div>

      {/* Description */}
      <p className="text-base leading-[1.6] text-text-muted">{description}</p>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add app/components/StoryTooltip.tsx
git commit -m "feat: add StoryTooltip component"
```

---

### Task 4: Build StoryIcon Component

**Files:**
- Create: `app/components/StoryIcon.tsx`

**Step 1: Create StoryIcon component**

```tsx
interface StoryIconProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
  isActive?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
}

export default function StoryIcon({
  src,
  alt,
  size = 120,
  className = "",
  isActive = false,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: StoryIconProps) {
  return (
    <button
      type="button"
      className={`relative flex items-center justify-center rounded-full transition-transform duration-300 cursor-pointer ${isActive ? "scale-110" : "hover:scale-105"} ${className}`}
      style={{ width: size, height: size }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      aria-expanded={isActive}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 size-full"
        draggable={false}
      />
    </button>
  );
}
```

Note: Using `<button>` for accessibility — these are interactive elements. The warning icon is larger (~139px) than the other two (120px), matched via the `size` prop per the Figma dimensions.

**Step 2: Commit**

```bash
git add app/components/StoryIcon.tsx
git commit -m "feat: add StoryIcon component"
```

---

### Task 5: Build CogniateStory Section

**Files:**
- Create: `app/sections/CogniateStory.tsx`
- Modify: `app/page.tsx`

**Step 1: Create CogniateStory section component**

This is the main section. Key points:
- `"use client"` for hover/tap state
- Desktop: absolute-positioned icons over concentric circles SVG
- Mobile: stacked icons with accordion tooltips
- `data-testid="cogniate-story-section"` for Playwright

```tsx
"use client";

import { useState } from "react";
import StoryIcon from "../components/StoryIcon";
import StoryTooltip from "../components/StoryTooltip";

const stories = [
  {
    id: "problem",
    icon: "/assets/story-warning-icon.png",
    label: "PROBLEM",
    title: "Story 1",
    description:
      "Acknowledge the problem is systemic, not individual. L&D leaders are talented people stuck in broken workflows.",
    size: 139,
  },
  {
    id: "mission",
    icon: "/assets/story-flag-icon.png",
    label: "MISSION",
    title: "Story 2",
    description:
      "Placeholder: describe the mission and goals that drive the Cogniate platform forward.",
    size: 120,
  },
  {
    id: "insight",
    icon: "/assets/story-lightbulb-icon.png",
    label: "INSIGHT",
    title: "Story 3",
    description:
      "Placeholder: explain the key insight that led to building Cogniate and how it transforms learning.",
    size: 120,
  },
] as const;

export default function CogniateStory() {
  const [activeStory, setActiveStory] = useState<string | null>(null);

  return (
    <section
      data-testid="cogniate-story-section"
      className="relative w-full bg-bg-secondary overflow-hidden py-20 lg:py-32"
    >
      <div className="relative mx-auto max-w-[1330px] px-5 md:px-6">
        {/* Heading */}
        <h2 className="story-heading-gradient text-center text-[32px] sm:text-[48px] lg:text-[64px] font-semibold leading-[1.3] tracking-[-0.04em]">
          <span className="font-serif italic">Learning</span> is a journey.
          <br />
          The <span className="font-serif italic">Cogniate</span> story.
        </h2>

        {/* === DESKTOP LAYOUT === */}
        <div className="hidden lg:block relative mt-16">
          {/* Concentric circles background */}
          <div className="relative mx-auto" style={{ width: 718, height: 635 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/story-concentric-circles.svg"
              alt=""
              className="absolute inset-0 size-full"
              draggable={false}
            />

            {/* Cogniate Logo - centered */}
            <div className="absolute left-1/2 top-[54%] -translate-x-1/2 -translate-y-1/2" style={{ width: 154, height: 145 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/story-cogniate-logo.png"
                alt="Cogniate"
                className="size-full"
                draggable={false}
              />
            </div>

            {/* Warning Icon - bottom left */}
            <div className="absolute" style={{ left: -120, bottom: -70 }}>
              <StoryIcon
                src="/assets/story-warning-icon.png"
                alt="Problem"
                size={139}
                isActive={activeStory === "problem"}
                onMouseEnter={() => setActiveStory("problem")}
                onMouseLeave={() => setActiveStory(null)}
              />
              {/* Tooltip - right of icon */}
              <div
                className={`absolute left-[160px] top-1/2 -translate-y-1/2 w-[450px] z-20 transition-all duration-300 pointer-events-none ${
                  activeStory === "problem"
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-2"
                }`}
              >
                <StoryTooltip
                  label={stories[0].label}
                  title={stories[0].title}
                  description={stories[0].description}
                  icon={stories[0].icon}
                />
                {/* Decorative glow */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[500px] h-[200px] rounded-full bg-accent-purple/10 blur-3xl pointer-events-none" />
              </div>
            </div>

            {/* Flag Icon - top center */}
            <div className="absolute" style={{ left: "50%", top: -20, transform: "translateX(-50%)" }}>
              <StoryIcon
                src="/assets/story-flag-icon.png"
                alt="Mission"
                size={120}
                isActive={activeStory === "mission"}
                onMouseEnter={() => setActiveStory("mission")}
                onMouseLeave={() => setActiveStory(null)}
              />
              {/* Tooltip - below-left of icon */}
              <div
                className={`absolute left-1/2 -translate-x-1/2 top-[140px] w-[450px] z-20 transition-all duration-300 pointer-events-none ${
                  activeStory === "mission"
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-2"
                }`}
              >
                <StoryTooltip
                  label={stories[1].label}
                  title={stories[1].title}
                  description={stories[1].description}
                  icon={stories[1].icon}
                />
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[500px] h-[200px] rounded-full bg-accent-purple/10 blur-3xl pointer-events-none" />
              </div>
            </div>

            {/* Lightbulb Icon - bottom right */}
            <div className="absolute" style={{ right: -120, bottom: -70 }}>
              <StoryIcon
                src="/assets/story-lightbulb-icon.png"
                alt="Insight"
                size={120}
                isActive={activeStory === "insight"}
                onMouseEnter={() => setActiveStory("insight")}
                onMouseLeave={() => setActiveStory(null)}
              />
              {/* Tooltip - left of icon */}
              <div
                className={`absolute right-[140px] top-1/2 -translate-y-1/2 w-[450px] z-20 transition-all duration-300 pointer-events-none ${
                  activeStory === "insight"
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-2"
                }`}
              >
                <StoryTooltip
                  label={stories[2].label}
                  title={stories[2].title}
                  description={stories[2].description}
                  icon={stories[2].icon}
                />
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[500px] h-[200px] rounded-full bg-accent-purple/10 blur-3xl pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* === MOBILE LAYOUT === */}
        <div className="lg:hidden mt-12 flex flex-col items-center gap-6">
          {stories.map((story) => (
            <div key={story.id} className="flex flex-col items-center w-full">
              <StoryIcon
                src={story.icon}
                alt={story.label}
                size={story.size}
                isActive={activeStory === story.id}
                onClick={() =>
                  setActiveStory((prev) =>
                    prev === story.id ? null : story.id
                  )
                }
              />

              {/* Accordion tooltip */}
              <div
                className={`w-full overflow-hidden transition-all duration-300 ease-in-out ${
                  activeStory === story.id
                    ? "max-h-[400px] opacity-100 mt-4"
                    : "max-h-0 opacity-0 mt-0"
                }`}
              >
                <StoryTooltip
                  label={story.label}
                  title={story.title}
                  description={story.description}
                  icon={story.icon}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Add CogniateStory to page.tsx**

Modify `app/page.tsx` to import and render the new section after Landscape:

```tsx
import Hero from "./sections/Hero";
import Landscape from "./sections/Landscape";
import CogniateStory from "./sections/CogniateStory";

export default function Home() {
  return (
    <main>
      <Hero />
      <Landscape />
      <CogniateStory />
    </main>
  );
}
```

**Step 3: Verify it renders**

```bash
pnpm dev
```

Open `http://localhost:3000`, scroll down past Landscape. Verify:
- Heading renders with serif italic on "Learning" and "Cogniate"
- Concentric circles SVG visible on desktop
- Three icons positioned correctly
- Hover shows tooltip on desktop
- On mobile viewport: icons stacked, tap expands accordion

**Step 4: Commit**

```bash
git add app/sections/CogniateStory.tsx app/page.tsx
git commit -m "feat: add CogniateStory section with hover/tap tooltips"
```

---

### Task 6: Visual Comparison with Figma

**Files:** None (manual review)

**Step 1: Compare desktop layout against Figma screenshot**

Open `http://localhost:3000` at 1728px viewport width. Scroll to the Cogniate Story section. Compare against the Figma screenshot (saved reference from `mcp__claude_ai_Figma__get_screenshot` of node `10:10275`).

Check:
- [ ] Heading gradient text matches Figma
- [ ] "Learning" and "Cogniate" are serif italic
- [ ] Concentric circles positioned correctly, centered
- [ ] Warning icon bottom-left, correct size (~139px)
- [ ] Flag icon top-center, correct size (120px)
- [ ] Lightbulb icon bottom-right, correct size (120px)
- [ ] Cogniate logo centered on circles
- [ ] Tooltip card style matches: dark bg, rounded corners, border, correct typography
- [ ] Section background matches bg-secondary

**Step 2: Adjust positioning/sizing as needed**

The icon positions (offsets) and the circles container dimensions may need fine-tuning based on visual comparison. The Figma coordinates for reference:
- Section: 1728 × 1137
- Circles container: starts at y=399, width=1718, height=695
- Warning icon: x=490, y=703 (relative to section)
- Flag icon: x=820, y=399 (relative to section)
- Lightbulb icon: x=1128, y=712 (relative to section)
- Cogniate logo: x=802, y=704 (relative to section)
- Heading: x=214, y=120 (relative to section), width=1330, height=166

Adjust `style` offsets in `CogniateStory.tsx` until positions match.

**Step 3: Commit any adjustments**

```bash
git add app/sections/CogniateStory.tsx
git commit -m "fix: adjust icon positions to match Figma layout"
```

---

### Task 7: Playwright Visual Regression Tests

**Files:**
- Create: `tests/visual/cogniate-story.spec.ts`

**Step 1: Create Playwright test file**

```ts
import { test, expect } from "@playwright/test";
import path from "path";

// Visual regression test
test("cogniate story section matches design", async ({ page }) => {
  await page.goto("/");

  const section = page.locator('[data-testid="cogniate-story-section"]');
  await section.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.fonts.ready);

  await expect(section).toHaveScreenshot("cogniate-story-section.png", {
    maxDiffPixelRatio: 0.05,
  });
});

// Desktop screenshot capture at 1728px
test("capture cogniate story section - desktop 1728px", async ({ page }) => {
  await page.setViewportSize({ width: 1728, height: 1080 });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.fonts.ready);
  await page.waitForTimeout(1000);

  const section = page.locator('[data-testid="cogniate-story-section"]');
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  await section.screenshot({
    path: path.join(__dirname, "cogniate-story-desktop.png"),
  });
});

// Mobile screenshot capture at 375px
test("capture cogniate story section - mobile 375px", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.fonts.ready);
  await page.waitForTimeout(1000);

  const section = page.locator('[data-testid="cogniate-story-section"]');
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  await section.screenshot({
    path: path.join(__dirname, "cogniate-story-mobile.png"),
  });
});

// Tablet screenshot capture at 768px
test("capture cogniate story section - tablet 768px", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.fonts.ready);
  await page.waitForTimeout(1000);

  const section = page.locator('[data-testid="cogniate-story-section"]');
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  await section.screenshot({
    path: path.join(__dirname, "cogniate-story-tablet.png"),
  });
});

// Test hover tooltip on desktop
test("tooltip appears on icon hover - desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1728, height: 1080 });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.fonts.ready);

  const section = page.locator('[data-testid="cogniate-story-section"]');
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  // Hover over the warning icon
  const warningIcon = section.locator('button[aria-expanded]').first();
  await warningIcon.hover();
  await page.waitForTimeout(400); // Wait for transition

  // Screenshot with tooltip visible
  await section.screenshot({
    path: path.join(__dirname, "cogniate-story-tooltip-hover.png"),
  });
});

// Test accordion on mobile
test("accordion expands on tap - mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.fonts.ready);

  const section = page.locator('[data-testid="cogniate-story-section"]');
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  // Tap the first icon
  const firstIcon = section.locator('button[aria-expanded]').first();
  await firstIcon.click();
  await page.waitForTimeout(400); // Wait for accordion animation

  // Screenshot with accordion expanded
  await section.screenshot({
    path: path.join(__dirname, "cogniate-story-accordion-open.png"),
  });
});
```

**Step 2: Run the capture tests**

```bash
pnpm exec playwright test tests/visual/cogniate-story.spec.ts --reporter=list
```

Expected: All tests pass. Screenshots saved to `tests/visual/`.

**Step 3: Review captured screenshots**

Open the screenshot files and verify they look correct at each viewport.

**Step 4: Update visual regression baseline**

```bash
pnpm exec playwright test tests/visual/cogniate-story.spec.ts --update-snapshots
```

**Step 5: Commit**

```bash
git add tests/visual/cogniate-story.spec.ts tests/visual/cogniate-story-*.png
git commit -m "test: add Playwright visual regression tests for Cogniate Story section"
```

---

### Task 8: Mobile Optimization Review

**Files:**
- Modify: `app/sections/CogniateStory.tsx` (if adjustments needed)

**Step 1: Test at mobile breakpoints**

Open dev tools and test at these widths:
- 375px (iPhone SE)
- 390px (iPhone 14)
- 428px (iPhone 14 Pro Max)
- 768px (iPad)

Check for each:
- [ ] Icons centered and not overflowing
- [ ] Accordion expands smoothly
- [ ] Only one accordion open at a time
- [ ] Tooltip card has adequate padding, text readable
- [ ] Heading text wraps cleanly
- [ ] Section padding is balanced

**Step 2: Fix any issues found**

Common issues to watch for:
- Tooltip text might need smaller font on very small screens
- Icon size might need adjustment at 375px
- Heading might need tighter line-height on mobile

**Step 3: Commit fixes**

```bash
git add app/sections/CogniateStory.tsx
git commit -m "fix: mobile layout refinements for Cogniate Story section"
```

---

### Task 9: Build Check & Final Verification

**Files:** None (verification only)

**Step 1: Run build**

```bash
pnpm build
```

Expected: Build succeeds with no errors.

**Step 2: Run lint**

```bash
pnpm lint
```

Expected: No lint errors.

**Step 3: Run all Playwright tests**

```bash
pnpm exec playwright test --reporter=list
```

Expected: All tests pass (both existing landscape tests and new cogniate-story tests).

**Step 4: Final visual review**

Start the production build and review:

```bash
pnpm start
```

Open at 1728px, 768px, and 375px. Verify everything looks correct and matches Figma.

**Step 5: Commit if any final fixes needed, then tag as complete**

```bash
git add .
git commit -m "feat: complete Cogniate Story section implementation"
```
