# How It Works Section — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a "How It Works" section below CogniateStory with 3 UI cards (Create, Design, Publish) on a dark grid background with animated purple gradient lines.

**Architecture:** Single section component `HowItWorks.tsx` using GSAP + ScrollTrigger for animated gradient lines (matching existing ScrollIndicator pattern). CSS-only background grid lines. Cards with hover image-scale interaction via CSS transitions. Mobile: vertically stacked cards, reduced grid lines.

**Tech Stack:** React, TypeScript, GSAP (already installed), Tailwind v4, Next.js App Router

---

### Task 1: Download Card Assets from Figma

**Files:**
- Create: `public/assets/how-card-create.png`
- Create: `public/assets/how-card-design.png`
- Create: `public/assets/how-card-publish.png`
- Create: `public/assets/how-chevron-icon.svg`

**Step 1: Download assets**

```bash
cd /Users/Danny/CodeProjects/cogniate-website
curl -L -o public/assets/how-card-create.png "https://www.figma.com/api/mcp/asset/32d436d7-2491-4c23-924d-e6a43cd27eba"
curl -L -o public/assets/how-card-design.png "https://www.figma.com/api/mcp/asset/194f8af1-72fe-4d5f-b6f8-d04a2fa4e5f3"
curl -L -o public/assets/how-card-publish.png "https://www.figma.com/api/mcp/asset/34d25ce6-5456-4110-95fe-ae489c7e652e"
curl -L -o public/assets/how-chevron-icon.svg "https://www.figma.com/api/mcp/asset/ec370aa8-194f-4626-9fe0-b90ddaefd087"
```

**Step 2: Verify files exist and have content**

```bash
ls -la public/assets/how-card-* public/assets/how-chevron-icon.svg
```

Expected: 3 PNG files and 1 SVG, each with non-zero size.

**Step 3: Commit**

```bash
git add public/assets/how-card-create.png public/assets/how-card-design.png public/assets/how-card-publish.png public/assets/how-chevron-icon.svg
git commit -m "feat: add How It Works card assets from Figma"
```

---

### Task 2: Create the HowItWorks Section — Static Layout

**Files:**
- Create: `app/sections/HowItWorks.tsx`
- Modify: `app/page.tsx:1-13`

**Step 1: Create `app/sections/HowItWorks.tsx` with static layout (no animations yet)**

```tsx
"use client";

import { useRef } from "react";

const cards = [
  {
    id: "create",
    title: "Create",
    descLines: [
      "Describe what you need.",
      "Lyra thinks, researches, structures, and writes your course.",
    ],
    tagline: "In minutes, not months.",
    image: "/assets/how-card-create.png",
  },
  {
    id: "design",
    title: "Design",
    descLines: [
      "Customise your brand.",
      "Select interactive components, refine with AI suggestions, no design skills required.",
    ],
    tagline: "Every output is enterprise-grade.",
    image: "/assets/how-card-design.png",
  },
  {
    id: "publish",
    title: "Publish",
    descLines: [
      "Deploy to any LMS.",
      "Share internally or sell on the marketplace. Built-in automatic content updates keep your courses current.",
    ],
    tagline: "Omnichannel publishing.",
    image: "/assets/how-card-publish.png",
  },
] as const;

const GRID_LINE_COUNT_DESKTOP = 11;
const GRID_LINE_COUNT_MOBILE = 5;

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      data-testid="how-it-works-section"
      className="relative w-full bg-[#111112] overflow-hidden py-20 lg:py-32"
    >
      {/* ===== BACKGROUND GRID LINES ===== */}
      <div className="absolute inset-x-0 top-[100px] bottom-[60px] mx-auto max-w-[1554px] pointer-events-none">
        {/* Desktop grid */}
        <div className="hidden lg:flex justify-between h-full px-[40px]">
          {Array.from({ length: GRID_LINE_COUNT_DESKTOP }).map((_, i) => (
            <div
              key={i}
              className="w-px h-full"
              style={{
                background:
                  "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.06) 15%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.06) 85%, transparent 100%)",
              }}
            />
          ))}
        </div>
        {/* Mobile grid */}
        <div className="flex lg:hidden justify-between h-full px-[20px]">
          {Array.from({ length: GRID_LINE_COUNT_MOBILE }).map((_, i) => (
            <div
              key={i}
              className="w-px h-full"
              style={{
                background:
                  "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.06) 15%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.06) 85%, transparent 100%)",
              }}
            />
          ))}
        </div>
      </div>

      {/* ===== ANIMATED PURPLE GRADIENT LINES (placeholder — Task 3) ===== */}

      {/* ===== CONTENT ===== */}
      <div className="relative z-10 mx-auto max-w-[1554px] px-5 md:px-6">
        {/* HOW IT WORKS eyebrow */}
        <div
          className="inline-flex items-center h-[52px] px-12 mb-12 lg:mb-16"
          style={{ backgroundColor: "rgba(211,204,255,0.05)" }}
        >
          <span className="text-[16px] font-medium tracking-[4.8px] text-white/80">
            HOW IT WORKS
          </span>
        </div>

        {/* Cards row */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-[34px]">
          {cards.map((card) => (
            <div
              key={card.id}
              className="group relative flex-1 rounded-[20px] overflow-hidden"
              style={{
                minHeight: 608,
                boxShadow:
                  "0px 0px 20px 3px rgba(7,13,79,0.05), 0px 0px 40px 20px rgba(7,13,79,0.05)",
              }}
            >
              {/* Card gradient background */}
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none rounded-[20px]"
                style={{
                  backgroundImage:
                    "linear-gradient(138deg, rgba(51,42,65,0.7) 22%, rgba(7,9,33,0) 82%)",
                }}
              />

              {/* Card content */}
              <div className="relative z-10 flex flex-col pt-8 px-8">
                {/* Icon + Title */}
                <div className="flex items-center gap-5 mb-2">
                  {/* Icon button */}
                  <div
                    className="relative flex items-center justify-center shrink-0 rounded-[8px] size-[36px] overflow-hidden"
                    style={{
                      boxShadow: "0px 0px 0px 1px rgba(255,255,255,0.25)",
                    }}
                  >
                    <div
                      aria-hidden
                      className="absolute inset-0 pointer-events-none rounded-[8px]"
                      style={{
                        background:
                          "linear-gradient(to bottom, rgba(255,255,255,0.03), rgba(255,255,255,0.1))",
                      }}
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/assets/how-chevron-icon.svg"
                      alt=""
                      className="relative size-4"
                    />
                    <div
                      className="absolute inset-0 pointer-events-none rounded-[inherit]"
                      style={{
                        boxShadow:
                          "inset 0px 1px 0px 0px rgba(255,255,255,0.05), inset 0px -1px 0px 0px rgba(0,0,0,0.2)",
                      }}
                    />
                  </div>
                  <h3 className="text-[28px] font-medium text-white leading-tight">
                    {card.title}
                  </h3>
                </div>

                {/* Description */}
                <div className="mt-2">
                  {card.descLines.map((line, i) => (
                    <p
                      key={i}
                      className="text-[20px] leading-[28px] font-medium"
                      style={{ color: "rgba(244,238,255,0.9)" }}
                    >
                      {line}
                    </p>
                  ))}
                </div>

                {/* Italic tagline */}
                <p className="mt-4 font-serif italic text-[24px] leading-[25.6px] text-accent-coral">
                  {card.tagline}
                </p>
              </div>

              {/* Card image — bottom, scales on hover */}
              <div className="absolute bottom-0 left-0 right-0 h-[60%] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.image}
                  alt=""
                  className="w-full h-full object-cover opacity-70 transition-transform duration-400 ease-out group-hover:scale-105"
                  draggable={false}
                />
              </div>

              {/* Card border overlay */}
              <div
                className="absolute inset-0 pointer-events-none rounded-[inherit]"
                style={{
                  boxShadow:
                    "inset 0px 1px 0px 0px rgba(255,255,255,0.1), inset 0px 0px 0px 1px rgba(255,255,255,0.06)",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Add HowItWorks to `app/page.tsx`**

Add import and render after CogniateStory:

```tsx
import Hero from "./sections/Hero";
import Landscape from "./sections/Landscape";
import CogniateStory from "./sections/CogniateStory";
import HowItWorks from "./sections/HowItWorks";

export default function Home() {
  return (
    <main>
      <Hero />
      <Landscape />
      <CogniateStory />
      <HowItWorks />
    </main>
  );
}
```

**Step 3: Run dev server and verify layout renders**

```bash
pnpm dev
```

Open `http://localhost:3000`, scroll to bottom. Expected: section visible with dark bg, grid lines, 3 cards with content/images, hover scales images.

**Step 4: Commit**

```bash
git add app/sections/HowItWorks.tsx app/page.tsx
git commit -m "feat: add HowItWorks section with static layout and cards"
```

---

### Task 3: Add Animated Purple Gradient Lines

**Files:**
- Modify: `app/sections/HowItWorks.tsx`

**Step 1: Add GSAP imports, refs, and animation logic**

Add these imports to the top of `HowItWorks.tsx`:

```tsx
import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
```

Add refs inside the component (alongside existing `sectionRef`):

```tsx
const vLineRef = useRef<HTMLDivElement>(null);
const vGlowRef = useRef<HTMLDivElement>(null);
const hLineLeftRef = useRef<HTMLDivElement>(null);
const hLineRightRef = useRef<HTMLDivElement>(null);
const hGlowLeftRef = useRef<HTMLDivElement>(null);
const hGlowRightRef = useRef<HTMLDivElement>(null);
const timelineRef = useRef<gsap.core.Timeline | null>(null);
const hasTriggeredRef = useRef(false);
```

**Step 2: Add the buildTimeline callback and useEffect**

```tsx
const buildTimeline = useCallback(() => {
  const vGlow = vGlowRef.current;
  const hGlowL = hGlowLeftRef.current;
  const hGlowR = hGlowRightRef.current;
  const vLine = vLineRef.current;

  if (!vGlow || !hGlowL || !hGlowR || !vLine) return;

  if (timelineRef.current) {
    timelineRef.current.kill();
  }

  const vLineHeight = vLine.offsetHeight;

  // Reset state
  gsap.set(vGlow, { top: "-120px", opacity: 0 });
  gsap.set(hGlowL, { opacity: 0, width: 0 });
  gsap.set(hGlowR, { opacity: 0, width: 0 });

  const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.0 });
  timelineRef.current = tl;

  // Fade in the vertical glow
  tl.to(vGlow, { opacity: 1, duration: 0.3 });

  // Move glow down the vertical line
  tl.to(vGlow, {
    top: vLineHeight - 40,
    duration: 1.8,
    ease: "power2.inOut",
  });

  // Fade out vertical glow at bottom
  tl.to(vGlow, { opacity: 0, duration: 0.3 }, "-=0.3");

  // Horizontal glows spread from center outward
  tl.set(hGlowL, { opacity: 1, width: 0 });
  tl.set(hGlowR, { opacity: 1, width: 0 });

  tl.to(hGlowL, {
    width: "50%",
    duration: 1.2,
    ease: "power2.out",
  });
  tl.to(
    hGlowR,
    { width: "50%", duration: 1.2, ease: "power2.out" },
    "<"
  );

  // Fade out horizontal glows
  tl.to([hGlowL, hGlowR], { opacity: 0, duration: 0.6 }, "-=0.3");

  // Reset vertical glow position
  tl.set(vGlow, { top: "-120px" });
}, []);

useEffect(() => {
  const section = sectionRef.current;
  if (!section) return;

  const trigger = ScrollTrigger.create({
    trigger: section,
    start: "top 80%",
    onEnter: () => {
      if (!hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        buildTimeline();
      }
    },
  });

  const handleResize = () => {
    if (hasTriggeredRef.current) buildTimeline();
  };
  window.addEventListener("resize", handleResize);

  return () => {
    trigger.kill();
    window.removeEventListener("resize", handleResize);
    if (timelineRef.current) timelineRef.current.kill();
  };
}, [buildTimeline]);
```

**Step 3: Add the animated line JSX**

Insert this block after the grid lines `<div>` and before the content `<div>`, inside the section:

```tsx
{/* ===== ANIMATED PURPLE GRADIENT LINES ===== */}
<div className="absolute inset-x-0 top-0 bottom-0 mx-auto max-w-[1554px] pointer-events-none z-[5]">
  {/* Vertical base line — center top */}
  <div
    ref={vLineRef}
    className="absolute left-1/2 -translate-x-1/2 top-0 overflow-hidden"
    style={{ width: "3px", height: "260px" }}
  >
    {/* Base dim line */}
    <div className="absolute inset-0 bg-gradient-to-b from-[rgba(174,180,255,0.06)] to-[rgba(174,180,255,0.12)]" />
    {/* Animated glow */}
    <div
      ref={vGlowRef}
      className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
      style={{
        width: "3px",
        height: "120px",
        background:
          "linear-gradient(to bottom, transparent 0%, rgba(174,180,255,0.15) 20%, rgba(174,180,255,0.8) 50%, rgba(174,180,255,0.15) 80%, transparent 100%)",
        boxShadow:
          "0 0 12px 4px rgba(174,180,255,0.4), 0 0 30px 8px rgba(174,180,255,0.2)",
        opacity: 0,
      }}
    />
  </div>

  {/* Horizontal base lines — at bottom of vertical line */}
  <div
    className="hidden lg:block absolute left-0 right-0"
    style={{ top: "260px", height: "3px" }}
  >
    {/* Base dim line — full width */}
    <div className="absolute inset-0 bg-gradient-to-r from-[rgba(174,180,255,0.04)] via-[rgba(174,180,255,0.1)] to-[rgba(174,180,255,0.04)]" />
    {/* Left-spreading glow */}
    <div
      ref={hGlowLeftRef}
      className="absolute right-1/2 top-0 h-full pointer-events-none"
      style={{
        background:
          "linear-gradient(to left, rgba(174,180,255,0.8), rgba(174,180,255,0.2) 40%, transparent 100%)",
        boxShadow:
          "0 0 12px 4px rgba(174,180,255,0.3), 0 0 30px 8px rgba(174,180,255,0.15)",
        width: 0,
        opacity: 0,
      }}
    />
    {/* Right-spreading glow */}
    <div
      ref={hGlowRightRef}
      className="absolute left-1/2 top-0 h-full pointer-events-none"
      style={{
        background:
          "linear-gradient(to right, rgba(174,180,255,0.8), rgba(174,180,255,0.2) 40%, transparent 100%)",
        boxShadow:
          "0 0 12px 4px rgba(174,180,255,0.3), 0 0 30px 8px rgba(174,180,255,0.15)",
        width: 0,
        opacity: 0,
      }}
    />
  </div>
</div>
```

**Step 4: Verify animation in browser**

Reload page, scroll down to How It Works section. Expected:
- Purple glow travels down center vertical line
- At bottom, two horizontal glows spread left and right
- Animation loops after 1s pause
- Only triggers once you scroll to the section

**Step 5: Commit**

```bash
git add app/sections/HowItWorks.tsx
git commit -m "feat: add animated purple gradient lines to HowItWorks"
```

---

### Task 4: Visual Comparison with Figma & Iteration

**Files:**
- Modify: `app/sections/HowItWorks.tsx` (tweaks as needed)

**Step 1: Take a screenshot of the Figma design for comparison**

Use the Figma MCP `get_screenshot` tool with fileKey `tjO7aMqDQjf6lPFOqwmIdC` and nodeId `163:1548`.

**Step 2: Take a screenshot of the implemented section**

Use Playwright or the dev server to capture the How It Works section at 1920px viewport width.

**Step 3: Compare and iterate**

Check for:
- Card spacing and proportions match
- Grid line count, spacing, and gradient match
- "HOW IT WORKS" badge position and style match
- Font sizes, line heights, colors match
- Image positioning within cards matches
- Animated line positions match
- Overall padding/margins match

Iterate up to 3 times adjusting values until matching.

**Step 4: Test mobile layout**

Resize to 375px viewport. Verify:
- Cards stack vertically, full-width
- Grid lines reduce to ~5
- Animated lines still work (vertical only on mobile)
- No horizontal overflow
- Card images scale correctly

**Step 5: Commit**

```bash
git add app/sections/HowItWorks.tsx
git commit -m "fix: visual refinements to match Figma design"
```

---

### Task 5: Build Verification & Final Commit

**Files:**
- None new

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

**Step 3: Final commit if any remaining changes**

```bash
git add -A
git commit -m "chore: final cleanup for HowItWorks section"
```
