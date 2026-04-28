# Landscape Section (Section 2) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the "Landscape" section — the first section below the hero — with pixel-perfect fidelity to the Figma design, without animations (but structured for easy animation later).

**Architecture:** A single `<Landscape />` section component placed after `<Hero />` in `page.tsx`. Uses the existing design system (Tailwind v4 theme tokens, Geist font family, EyebrowBadge component). The section contains a centered heading, two offset stat blocks with vertical accent lines, a bottom time stat, and a purple gradient glow. Playwright visual regression tests compare against the Figma screenshot.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4, Playwright (new), existing design system tokens.

---

## Reference: Figma Design

The Figma design (node `2:39529`) shows a dark section (~1080px height at 1728px viewport) with:

1. **Heading** — "Imagine being 150x faster." centered at top with radial gradient text (white center → fading to transparent edges)
2. **Left stat ("The Landscape")** — Vertical accent line on left, eyebrow badge, "$361 billion" in gradient text (white→purple), subtitle "global annual L&D spend."
3. **Right stat ("The Opportunity")** — Eyebrow badge, "only 12%" in gradient text (white→purple), subtitle "reaches learners in a format that actually works.", vertical accent line on right. Right-aligned text.
4. **Bottom time stat** — "Traditional course creation" label + "154 hours" in large gradient text
5. **Bottom gradient glow** — Large blurred purple ellipse at bottom

### Key Visual Details

- Large stat numbers: `font-extralight`, linear-gradient from `rgb(255,255,255)` → `rgb(146,100,205)` at ~160-170° angle
- Heading: `font-semibold`, 64px, radial gradient fading from center (NOT the same `.heading-gradient` as hero — wider ellipse fading to transparent at edges)
- Eyebrow badges: Reuse existing `<EyebrowBadge />` component
- Vertical lines: Thin (1-2px) gradient lines, ~218px and ~236px tall — will be animated later, keep as simple styled divs
- Stat block labels: 24px `font-light`, `rgba(255,255,255,0.8)`
- "billion" / "only" text: 32px `font-medium`, white, tracking `-0.04em`
- Section background: `bg-bg-secondary` (#101011), seamless with hero's bottom fade

### Layout Positioning (at 1728px viewport)

The stats are NOT centered. They use an asymmetric staggered layout:
- Left stat: positioned ~left-1/4, starts ~30% down the section
- Right stat: positioned ~right-1/4, starts ~45% down the section (offset lower)
- Bottom stat: positioned ~center-left, starts ~80% down the section
- The two stat blocks create a diagonal visual flow from top-left to bottom-right

---

## Task 1: Install Playwright and set up visual comparison infrastructure

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/visual/landscape.spec.ts`
- Create: `tests/visual/landscape-reference.png` (Figma screenshot)
- Modify: `package.json` (add Playwright scripts)

**Step 1: Install Playwright**

```bash
pnpm add -D @playwright/test
pnpm exec playwright install chromium
```

**Step 2: Create Playwright config**

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1728, height: 1080 } },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

**Step 3: Save the Figma screenshot as reference**

Download the Figma screenshot of node `2:39529` and save as `tests/visual/landscape-reference.png`. This serves as visual reference — we'll compare by eye during development.

**Step 4: Create initial visual test**

```typescript
// tests/visual/landscape.spec.ts
import { test, expect } from "@playwright/test";

test("landscape section matches design", async ({ page }) => {
  await page.goto("/");

  const landscape = page.locator('[data-testid="landscape-section"]');
  await landscape.scrollIntoViewIfNeeded();

  // Wait for fonts to load
  await page.waitForFunction(() => document.fonts.ready);

  await expect(landscape).toHaveScreenshot("landscape-section.png", {
    maxDiffPixelRatio: 0.05,
  });
});
```

**Step 5: Add scripts to package.json**

Add to scripts:
```json
"test:visual": "playwright test",
"test:visual:update": "playwright test --update-snapshots"
```

**Step 6: Commit**

```bash
git add playwright.config.ts tests/ package.json pnpm-lock.yaml
git commit -m "feat: add Playwright visual testing infrastructure"
```

---

## Task 2: Create the Landscape section skeleton and add to page

**Files:**
- Create: `app/sections/Landscape.tsx`
- Modify: `app/page.tsx`

**Step 1: Create the section component with data-testid and overall structure**

```tsx
// app/sections/Landscape.tsx
import EyebrowBadge from "../components/EyebrowBadge";

export default function Landscape() {
  return (
    <section
      data-testid="landscape-section"
      className="relative w-full bg-bg-secondary overflow-hidden"
    >
      <div className="relative mx-auto max-w-[1330px] px-5 md:px-6 py-[100px] lg:py-[140px]">
        {/* Heading */}
        {/* Left stat - The Landscape */}
        {/* Right stat - The Opportunity */}
        {/* Bottom stat - Time */}
      </div>

      {/* Bottom gradient glow */}
    </section>
  );
}
```

**Step 2: Add Landscape to page.tsx**

```tsx
// app/page.tsx
import Hero from "./sections/Hero";
import Landscape from "./sections/Landscape";

export default function Home() {
  return (
    <main>
      <Hero />
      <Landscape />
    </main>
  );
}
```

**Step 3: Commit**

```bash
git add app/sections/Landscape.tsx app/page.tsx
git commit -m "feat: add Landscape section skeleton"
```

---

## Task 3: Add the heading gradient text style and implement the heading

**Files:**
- Modify: `app/globals.css` (add new gradient class)
- Modify: `app/sections/Landscape.tsx`

**Step 1: Add the stat-gradient and landscape-heading-gradient classes to globals.css**

The heading uses a different gradient than `.heading-gradient` — it's a radial gradient that fades to transparent at the edges (not just to dark purple). The stat numbers use a linear gradient from white to purple.

```css
/* In globals.css, after .heading-gradient */

.landscape-heading-gradient {
  background: radial-gradient(
    ellipse 100% 50% at 50% 50%,
    rgba(255, 255, 255, 1) 0%,
    rgba(212, 209, 218, 0.75) 25%,
    rgba(169, 163, 180, 0.5) 50%,
    rgba(82, 71, 105, 0) 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-gradient {
  background: linear-gradient(
    165deg,
    rgb(255, 255, 255) 3%,
    rgb(146, 100, 205) 98%
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

**Step 2: Implement the heading in Landscape.tsx**

```tsx
{/* Heading */}
<h2 className="landscape-heading-gradient text-center text-[36px] sm:text-[48px] lg:text-[64px] font-semibold leading-[1.1] tracking-[-0.04em]">
  Imagine being 150x faster.
</h2>
```

**Step 3: Commit**

```bash
git add app/globals.css app/sections/Landscape.tsx
git commit -m "feat: add landscape heading with gradient text"
```

---

## Task 4: Implement the two stat blocks (The Landscape + The Opportunity)

**Files:**
- Modify: `app/sections/Landscape.tsx`

**Step 1: Build the left stat block (The Landscape)**

This block has: vertical accent line on left → column with eyebrow badge, "$361 billion" stat, subtitle.

```tsx
{/* Left stat - The Landscape */}
<div className="flex gap-[29px] items-start mt-[120px] lg:mt-[180px] ml-0 lg:ml-[4%]">
  {/* Vertical accent line - will be animated later */}
  <div
    className="w-[1px] h-[218px] shrink-0 hidden lg:block"
    style={{
      background: "linear-gradient(to bottom, rgba(255,255,255,0.4), rgba(146,100,205,0.6))",
    }}
  />

  <div className="flex flex-col gap-[23px] items-start max-w-[583px]">
    <EyebrowBadge>THE LANDSCAPE</EyebrowBadge>

    <div className="flex flex-col gap-4">
      {/* Main stat */}
      <div className="flex items-end leading-[1.1]">
        <span className="stat-gradient text-[64px] lg:text-[96px] font-extralight tracking-[-0.04em]">
          $361{" "}
        </span>
        <span className="text-[24px] lg:text-[32px] font-medium text-white tracking-[-0.04em] pb-[8px] lg:pb-[12px]">
          billion
        </span>
      </div>

      {/* Subtitle */}
      <p className="text-[18px] lg:text-[24px] font-light leading-[1.3] text-text-muted tracking-[-0.01em]">
        global annual L&D spend.
      </p>
    </div>
  </div>
</div>
```

**Step 2: Build the right stat block (The Opportunity)**

This block is right-aligned with: column with eyebrow badge, "only 12%" stat, subtitle → vertical accent line on right.

```tsx
{/* Right stat - The Opportunity */}
<div className="flex gap-[29px] items-start justify-end mt-[40px] lg:mt-[-20px] mr-0 lg:mr-[4%]">
  <div className="flex flex-col gap-[23px] items-end max-w-[360px]">
    <EyebrowBadge>THE OPPORTUNITY</EyebrowBadge>

    <div className="flex flex-col gap-4 items-end text-right">
      {/* Main stat */}
      <div className="flex items-end leading-[1.1]">
        <span className="text-[24px] lg:text-[32px] font-medium text-white tracking-[-0.04em] pb-[8px] lg:pb-[12px]">
          only
        </span>
        <span className="stat-gradient text-[64px] lg:text-[96px] font-extralight tracking-[-0.04em]">
          12%
        </span>
      </div>

      {/* Subtitle */}
      <p className="text-[18px] lg:text-[24px] font-light leading-[1.3] text-text-muted tracking-[-0.01em]">
        reaches learners in a format that actually works.
      </p>
    </div>
  </div>

  {/* Vertical accent line - will be animated later */}
  <div
    className="w-[1px] h-[236px] shrink-0 hidden lg:block"
    style={{
      background: "linear-gradient(to bottom, rgba(146,100,205,0.6), rgba(255,255,255,0.4))",
    }}
  />
</div>
```

**Step 3: Commit**

```bash
git add app/sections/Landscape.tsx
git commit -m "feat: add Landscape and Opportunity stat blocks"
```

---

## Task 5: Implement the bottom time stat (154 hours)

**Files:**
- Modify: `app/sections/Landscape.tsx`

**Step 1: Add the time stat block**

Positioned center-left, with "Traditional course creation" label next to large "154 hours" gradient text.

```tsx
{/* Bottom stat - Time */}
<div className="flex gap-[27px] items-center mt-[80px] lg:mt-[120px] justify-center lg:justify-start lg:ml-[10%]">
  <p className="text-[18px] lg:text-[24px] font-semibold leading-[1.3] text-text-muted tracking-[-0.01em] w-[120px] lg:w-[154px]">
    Traditional course creation
  </p>
  <p className="stat-gradient text-[72px] sm:text-[96px] lg:text-[128px] font-extralight leading-[1.1] tracking-[-0.06em]">
    154 hours{" "}
  </p>
</div>
```

**Step 2: Commit**

```bash
git add app/sections/Landscape.tsx
git commit -m "feat: add 154 hours time stat to Landscape section"
```

---

## Task 6: Add the bottom purple gradient glow

**Files:**
- Modify: `app/sections/Landscape.tsx`

**Step 1: Attempt CSS gradient glow first**

Place outside the content container, at the bottom of the section. This is a large blurred purple radial gradient.

```tsx
{/* Bottom gradient glow */}
<div
  className="absolute bottom-0 left-0 right-0 h-[52%] pointer-events-none"
  style={{
    background: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(146, 100, 205, 0.5) 0%, rgba(92, 77, 116, 0.2) 40%, transparent 70%)",
  }}
/>
```

**Step 2: Compare with Figma reference**

Run the dev server and visually compare the CSS gradient with the Figma design. If the CSS gradient does not match closely enough, fall back to downloading the gradient blur asset from Figma and using it as an image:

```tsx
{/* Fallback: use Figma asset */}
<div className="absolute bottom-[-14%] left-[-5%] right-[-5%] h-[52%] pointer-events-none">
  <img src="/assets/landscape-gradient-blur.png" alt="" className="w-full h-full object-cover" />
</div>
```

**Step 3: Commit**

```bash
git add app/sections/Landscape.tsx public/assets/
git commit -m "feat: add bottom gradient glow to Landscape section"
```

---

## Task 7: Pixel-perfect comparison and refinement

**Step 1: Run the dev server and take a screenshot**

```bash
pnpm dev
```

Navigate to localhost:3000 and scroll to the Landscape section.

**Step 2: Run Playwright to generate initial snapshot**

```bash
pnpm test:visual:update
```

**Step 3: Compare the Playwright snapshot side-by-side with the Figma reference**

Key areas to check and refine:
- [ ] Heading gradient text — does the fade match? Adjust radial-gradient ellipse dimensions
- [ ] Stat number sizes and weights — exact font-size, font-weight, letter-spacing
- [ ] Stat block horizontal positioning — left/right offsets
- [ ] Stat block vertical stagger — the diagonal flow from upper-left to lower-right
- [ ] Vertical accent line color and gradient direction
- [ ] Eyebrow badge sizing and colors match existing component
- [ ] Bottom glow color, size, blur, and position
- [ ] Overall section height and vertical spacing between elements
- [ ] Text colors and opacity values

**Step 4: Iterate on spacing and positioning**

Adjust Tailwind classes and inline styles based on visual comparison. Re-run Playwright after each change.

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat: pixel-perfect refinement of Landscape section"
```

---

## Task 8: Responsive design pass

**Step 1: Test at mobile (375px), tablet (768px), and desktop (1728px)**

The Figma design is desktop-only, so for mobile/tablet:
- Stack elements vertically
- Center-align text
- Hide vertical accent lines on mobile (already `hidden lg:block`)
- Scale down font sizes proportionally
- Adjust spacing

**Step 2: Update Playwright config for mobile viewport test**

Add a mobile project to `playwright.config.ts` if desired.

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: responsive design for Landscape section"
```
