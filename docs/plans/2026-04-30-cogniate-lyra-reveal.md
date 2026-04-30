# Cogniate Lyra Reveal — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a new pinned section after `CogniateStory` that scrubs a 25-second video as the user scrolls, with text (Lyra wordmark, tagline, "Create. Design. Publish") fading in deliberately over the last 25% of the scroll.

**Architecture:** A new client component `app/sections/CogniateLyraReveal.tsx` mounts as a sibling to `CogniateStory`. One ScrollTrigger pin owns the section; `progressRef` (0..1) is the single source of truth, written by ScrollTrigger and read by a single rAF loop that updates `video.currentTime` (throttled to 30Hz) and CSS custom properties on the wrapper. Mobile and reduced-motion fall back to non-pinned, simpler reveals. A `?lyraProgress=` URL flag freezes the section at a chosen resting state for Playwright snapshots, mirroring the existing `?particleProgress=` pattern.

**Tech Stack:** Next.js 16 App Router, React 19, GSAP + ScrollTrigger, Tailwind v4, Geist font (already loaded), Playwright for visual snapshots.

**Reference:** `docs/plans/2026-04-30-cogniate-lyra-reveal-design.md` (validated design).

---

## Pre-flight

- Worktree: `.worktrees/cogniate-story-particle-swarm` (already current).
- Branch: `feat/cogniate-story-particle-swarm` (already current).
- Video source: `/Users/Danny/CodeProjects/cogniate-website/public/assets/cogniate-scrub-lyra-video.mp4` (in main worktree, NOT in this worktree yet).
- Pre-existing uncommitted modifications in `app/components/StoryTooltip.tsx` and `app/sections/CogniateStory.tsx` — leave them alone, do not touch in this plan.
- Each task ends with a commit. Use conventional-commit prefixes (`feat:`, `chore:`, `test:`).

---

## Task 1: Bring video into the worktree + bake poster frame

**Files:**
- Create: `public/assets/cogniate-scrub-lyra-video.mp4` (copy from main worktree)
- Create: `public/assets/cogniate-scrub-lyra-poster.jpg` (last frame, ~30 KB)

**Step 1: Copy video into worktree**

```bash
cp /Users/Danny/CodeProjects/cogniate-website/public/assets/cogniate-scrub-lyra-video.mp4 \
   public/assets/cogniate-scrub-lyra-video.mp4
ls -lh public/assets/cogniate-scrub-lyra-video.mp4
```

Expected: `-rw-r--r--  1 ...  32M ...  cogniate-scrub-lyra-video.mp4`

**Step 2: Extract last frame as poster (JPEG, quality 85)**

Source video is 25.233s, 757 frames at 30fps. We want frame 757 (the very last frame, 0-indexed = `nb_frames - 1`).

```bash
ffmpeg -y -sseof -0.04 -i public/assets/cogniate-scrub-lyra-video.mp4 \
  -vframes 1 -q:v 4 public/assets/cogniate-scrub-lyra-poster.jpg
ls -lh public/assets/cogniate-scrub-lyra-poster.jpg
```

`-sseof -0.04` seeks to 40ms before EOF; `-vframes 1` writes one frame; `-q:v 4` is JPEG quality (lower = better, range 1–31). Expected file ~30–80 KB.

**Step 3: Verify poster opens**

```bash
file public/assets/cogniate-scrub-lyra-poster.jpg
```

Expected: `JPEG image data, ... 1584x1308`

**Step 4: Commit**

```bash
git add public/assets/cogniate-scrub-lyra-video.mp4 public/assets/cogniate-scrub-lyra-poster.jpg
git commit -m "chore(cogniate-lyra-reveal): add scrub video + poster frame"
```

---

## Task 2: Component scaffold — empty section, mounted in page

Goal: `<CogniateLyraReveal />` exists, mounts, takes up viewport space, but does nothing visual yet. Verifies the integration point before any of the interesting logic is in place.

**Files:**
- Create: `app/sections/CogniateLyraReveal.tsx`
- Modify: `app/page.tsx`

**Step 1: Create the section skeleton**

```tsx
// app/sections/CogniateLyraReveal.tsx
"use client";

import { useRef } from "react";

export default function CogniateLyraReveal() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinWrapperRef = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={sectionRef}
      data-testid="cogniate-lyra-reveal"
      className="relative w-full bg-bg-secondary overflow-hidden"
    >
      <div
        ref={pinWrapperRef}
        className="relative min-h-screen w-full flex items-center justify-center"
      >
        <div className="text-white/40 text-sm">
          [CogniateLyraReveal placeholder]
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Mount in `app/page.tsx`**

Modify `app/page.tsx` — add import after `CogniateStory`, add `<CogniateLyraReveal />` immediately after `<CogniateStory />`.

```tsx
import CogniateStory from "./sections/CogniateStory";
import CogniateLyraReveal from "./sections/CogniateLyraReveal";
// ...
<CogniateStory />
<CogniateLyraReveal />
```

**Step 3: Run dev server and verify**

```bash
pnpm dev
```

Open `http://localhost:3000`, scroll past `CogniateStory`, confirm the placeholder text is visible in a viewport-tall section before `HowItWorks`.

**Step 4: Type-check + lint**

```bash
pnpm exec tsc --noEmit
pnpm lint
```

Expected: zero errors, zero warnings.

**Step 5: Commit**

```bash
git add app/sections/CogniateLyraReveal.tsx app/page.tsx
git commit -m "feat(cogniate-lyra-reveal): scaffold empty section + mount in page"
```

---

## Task 3: Video element + ScrollTrigger pin (no scrub yet)

Goal: video element renders covering the wrapper; ScrollTrigger pins the section. No `currentTime` driving yet — that's Task 4.

**Files:**
- Modify: `app/sections/CogniateLyraReveal.tsx`

**Step 1: Add the TIMING config + replace section body**

Replace the placeholder body with the video element and a useEffect that sets up the ScrollTrigger pin. The TIMING object goes at the top of the file.

```tsx
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Single source of truth for everything tunable.
// To slow the scrub: bump PIN_DISTANCE.
// To delay text reveals: push the WORD_*/LYRA/TAGLINE ranges higher.
const TIMING = {
  PIN_DISTANCE: "+=250%",
  VIDEO_END: 0.80,
  LYRA: [0.75, 0.83] as const,
  TAGLINE: [0.78, 0.86] as const,
  WORD_CREATE: [0.86, 0.90] as const,
  WORD_DESIGN: [0.91, 0.95] as const,
  WORD_PUBLISH: [0.96, 1.00] as const,
} as const;

export default function CogniateLyraReveal() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinWrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;
    const wrapper = pinWrapperRef.current;
    if (!section || !wrapper) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: wrapper,
        start: "top top",
        end: TIMING.PIN_DISTANCE,
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          progressRef.current = self.progress;
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-testid="cogniate-lyra-reveal"
      className="relative w-full bg-bg-secondary overflow-hidden"
    >
      <div
        ref={pinWrapperRef}
        className="relative min-h-screen w-full"
      >
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          playsInline
          preload="auto"
          poster="/assets/cogniate-scrub-lyra-poster.jpg"
          disablePictureInPicture
          disableRemotePlayback
        >
          <source src="/assets/cogniate-scrub-lyra-video.mp4" type="video/mp4" />
        </video>
      </div>
    </section>
  );
}
```

Note: `disableRemotePlayback` is React 19-supported as a boolean prop; if TypeScript complains, fall back to `// @ts-expect-error` with a one-line comment, but try plain prop first.

**Step 2: Verify in browser**

Restart dev server if needed. Scroll into the section: it should pin (page stops scrolling vertically while you scroll, ~2.5 viewport heights of "trapped" scroll). Video shows poster initially.

**Step 3: Type-check + lint**

```bash
pnpm exec tsc --noEmit && pnpm lint
```

**Step 4: Commit**

```bash
git add app/sections/CogniateLyraReveal.tsx
git commit -m "feat(cogniate-lyra-reveal): video element + pinned ScrollTrigger"
```

---

## Task 4: Drive video.currentTime from scroll progress

Goal: scrolling within the pin scrubs the video. Throttled to ~30Hz writes to spare iOS Safari's video pipeline.

**Files:**
- Modify: `app/sections/CogniateLyraReveal.tsx`

**Step 1: Add the rAF loop**

After the existing `useEffect` that sets up ScrollTrigger, add a second `useEffect` for the rAF loop.

```tsx
// rAF loop — reads progressRef every frame, drives video.currentTime
// (throttled to ~30Hz) and CSS variables (added in next task).
useEffect(() => {
  const wrapper = pinWrapperRef.current;
  const video = videoRef.current;
  if (!wrapper || !video) return;

  let rafId = 0;
  let stopped = false;
  let lastVideoTimeWrite = 0;

  const tick = (now: number) => {
    if (stopped) return;
    if (!document.hidden) {
      const p = progressRef.current;

      // Video scrub — throttled. iOS Safari restarts a decode pipeline on
      // every currentTime write; 60Hz can stall it. 30Hz is fine since
      // source is 30fps anyway.
      if (video.duration && now - lastVideoTimeWrite > 33) {
        const videoT = Math.min(p / TIMING.VIDEO_END, 1) * video.duration;
        if (Number.isFinite(videoT)) {
          video.currentTime = videoT;
          lastVideoTimeWrite = now;
        }
      }
    }
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);

  return () => {
    stopped = true;
    cancelAnimationFrame(rafId);
  };
}, []);
```

**Step 2: Verify in browser**

Scroll into the section — the video should now scrub: scrolling down advances the video, scrolling up rewinds it. The video reaches its last frame at 80% of the pinned scroll; the remaining 20% is the held last frame.

Quick sanity: open DevTools Performance, capture a few seconds of scroll. The rAF loop should be quiet (no layout thrashing, no continuous React renders).

**Step 3: Type-check + lint**

```bash
pnpm exec tsc --noEmit && pnpm lint
```

**Step 4: Commit**

```bash
git add app/sections/CogniateLyraReveal.tsx
git commit -m "feat(cogniate-lyra-reveal): scroll-scrubbed video currentTime"
```

---

## Task 5: Add the `ramp` helper + text DOM (no animation yet)

Goal: render the Lyra wordmark, tagline, and "Create. Design. Publish" with the Figma styling, statically visible (no opacity gating yet) so we can verify visual treatment in isolation.

**Files:**
- Modify: `app/sections/CogniateLyraReveal.tsx`

**Step 1: Add the `ramp` helper near the top of the file**

```tsx
// Linear ramp from `(fromIn → fromOut)` of progress to `(toIn → toOut)` of value,
// clamped at the ends. Same shape as CogniateStory's helper.
function ramp(p: number, fromIn: number, fromOut: number, toIn: number, toOut: number): number {
  if (p <= fromIn) return toIn;
  if (p >= fromOut) return toOut;
  const t = (p - fromIn) / (fromOut - fromIn);
  return toIn + (toOut - toIn) * t;
}
```

**Step 2: Replace the wrapper body with the full DOM (still no opacity binding)**

Inside the pinned `<div ref={pinWrapperRef}>`, add the shadow blob and text stack as siblings of the video:

```tsx
<div
  ref={pinWrapperRef}
  className="relative min-h-screen w-full"
>
  <video … />

  {/* Ambient blur — bridges video → text */}
  <div
    aria-hidden
    className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
    style={{
      width: 940,
      height: 431,
      background:
        "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 70%)",
      filter: "blur(60px)",
    }}
  />

  {/* Text stack */}
  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
    <h2
      className="lyra-wordmark text-center"
      style={{
        fontFamily: "var(--font-sans)",
        fontWeight: 700,
        fontSize: "clamp(64px, 7vw, 96px)",
        lineHeight: 1.1,
        letterSpacing: "-0.04em",
        backgroundImage:
          "linear-gradient(164.7deg, #ffffff 3%, rgb(146,100,205) 98%)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }}
    >
      Lyra
      <sup style={{ fontWeight: 300, fontSize: "0.557em", verticalAlign: "super" }}>®</sup>
    </h2>

    <p
      className="lyra-tagline text-center"
      style={{
        marginTop: "1.5rem",
        fontFamily: "var(--font-sans)",
        fontWeight: 300,
        fontSize: "clamp(18px, 1.7vw, 24px)",
        lineHeight: 1.3,
        letterSpacing: "-0.01em",
        color: "rgba(242,234,255,0.8)",
        maxWidth: "min(420px, 90vw)",
      }}
    >
      Your AI assistant to help you from idea to fully created course.
    </p>

    <h3
      className="lyra-cdp text-center"
      style={{
        marginTop: "3rem",
        fontFamily: "var(--font-sans)",
        fontWeight: 600,
        fontSize: "clamp(36px, 5vw, 64px)",
        lineHeight: 1.1,
        letterSpacing: "-0.04em",
        backgroundImage:
          "radial-gradient(ellipse 65% 50% at 50% 50%, #ffffff 0%, rgba(212,209,218,0.75) 25%, rgba(169,163,180,0.5) 50%, rgba(82,71,105,0) 100%)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }}
    >
      <span data-word="create">Create. </span>
      <span data-word="design">Design. </span>
      <span data-word="publish">Publish</span>
    </h3>
  </div>
</div>
```

**Step 3: Verify in browser**

Scroll into the section: all text is visible immediately (no opacity gating yet). Verify:
- "Lyra®" gradient: white top-left → purple bottom-right
- Tagline wraps to 2 lines, soft off-white
- "Create. Design. Publish" has bright "Design." centre fading darker at edges
- Soft shadow visible behind text, blending video → text

**Step 4: Type-check + lint**

```bash
pnpm exec tsc --noEmit && pnpm lint
```

**Step 5: Commit**

```bash
git add app/sections/CogniateLyraReveal.tsx
git commit -m "feat(cogniate-lyra-reveal): text DOM + Figma typography"
```

---

## Task 6: Wire CSS-variable opacity + Y for scroll-driven text reveal

Goal: text starts hidden, fades in on schedule per the TIMING config. Each element gets two CSS variables (`--<name>-opacity`, `--<name>-y`) driven from the rAF loop.

**Files:**
- Modify: `app/sections/CogniateLyraReveal.tsx`

**Step 1: Bind CSS vars to each text element's `style`**

Update each text element's `style` object:

- `<h2>`: add `opacity: "var(--lyra-opacity, 0)"`, `transform: "translateY(var(--lyra-y, 16px))"`, `transition: "filter 200ms"`, `filter: "var(--lyra-filter, blur(2px))"`.
- `<p>` (tagline): same pattern with `--tagline-opacity`, `--tagline-y`, `--tagline-filter`.
- Each `<span data-word>`: same pattern with `--w-create-*`, `--w-design-*`, `--w-publish-*`.

Use `display: inline-block` on the spans so `transform` works on inline elements.

**Step 2: Extend the rAF loop**

In the existing rAF loop's `if (!document.hidden) { ... }` block, after the video scrub, add CSS var writes:

```tsx
const setReveal = (name: string, range: readonly [number, number]) => {
  const opacity = ramp(p, range[0], range[1], 0, 1);
  const y = ramp(p, range[0], range[1], 16, 0);
  const blur = ramp(p, range[0], range[1], 2, 0);
  wrapper.style.setProperty(`--${name}-opacity`, String(opacity));
  wrapper.style.setProperty(`--${name}-y`, `${y}px`);
  wrapper.style.setProperty(`--${name}-filter`, `blur(${blur}px)`);
};

setReveal("lyra", TIMING.LYRA);
setReveal("tagline", TIMING.TAGLINE);
setReveal("w-create", TIMING.WORD_CREATE);
setReveal("w-design", TIMING.WORD_DESIGN);
setReveal("w-publish", TIMING.WORD_PUBLISH);
```

**Step 3: Verify in browser**

Scroll into section and slowly scrub through:
- 0–75%: no text visible
- 75–83%: Lyra wordmark fades + rises
- 78–86%: tagline fades + rises (overlapping Lyra's tail)
- 80–86%: held beat (video frozen on last frame, before any CDP word appears)
- 86–90%: "Create." appears
- 91–95%: "Design." appears
- 96–100%: "Publish" appears

Scrolling back up should reverse all reveals smoothly.

**Step 4: Type-check + lint**

```bash
pnpm exec tsc --noEmit && pnpm lint
```

**Step 5: Commit**

```bash
git add app/sections/CogniateLyraReveal.tsx
git commit -m "feat(cogniate-lyra-reveal): scroll-driven text reveal via CSS vars"
```

---

## Task 7: Mobile fallback (no pin, intersection-driven autoplay)

Goal: on viewports below `lg` (1024px), the section is normal-flow, video plays once on intersection, text fades in on standard GSAP triggers.

**Files:**
- Modify: `app/sections/CogniateLyraReveal.tsx`

**Step 1: Gate the pin/scrub effect on desktop**

Wrap the existing ScrollTrigger setup in an `lg`-only guard. The simplest and most reliable check is `window.matchMedia("(min-width: 1024px)").matches` (matches Tailwind's `lg` breakpoint).

In the existing `useEffect` that sets up ScrollTrigger, after `if (!section || !wrapper) return;`, add:

```tsx
const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
if (!isDesktop) {
  // Mobile path: play video once when in view, fade text in via GSAP.
  setupMobileReveal(section, videoRef.current, wrapper);
  return;
}
```

**Step 2: Implement `setupMobileReveal`**

Add this helper function above the component:

```tsx
function setupMobileReveal(
  section: HTMLElement,
  video: HTMLVideoElement | null,
  wrapper: HTMLDivElement
) {
  if (video) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            video.play().catch(() => {
              // Autoplay denied (very rare with muted+playsInline). Leave
              // the poster visible — the section still reads.
            });
            observer.disconnect();
          }
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(section);
  }

  // Stagger text reveal — Lyra → tagline → words on a single trigger.
  const tl = gsap.timeline({
    scrollTrigger: { trigger: section, start: "top 70%", toggleActions: "play none none none" },
  });
  tl.fromTo(
    wrapper.querySelector(".lyra-wordmark"),
    { opacity: 0, y: 16 },
    { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
  )
    .fromTo(
      wrapper.querySelector(".lyra-tagline"),
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
      "-=0.4"
    )
    .fromTo(
      wrapper.querySelectorAll(".lyra-cdp [data-word]"),
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.15 },
      "-=0.3"
    );
}
```

**Step 3: Make pinned wrapper height adaptive on mobile**

The current `min-h-screen` is fine on desktop where it pins, but on mobile we want the section to be its natural content height. Add a Tailwind class swap:

```tsx
<div
  ref={pinWrapperRef}
  className="relative w-full lg:min-h-screen"
>
```

And on the parent section, allow some vertical breathing room for mobile:

```tsx
<section … className="relative w-full bg-bg-secondary overflow-hidden py-20 lg:py-0">
```

**Step 4: Verify in browser**

Resize browser to <1024px (or use DevTools device emulation). Reload. Scroll into the section: video plays once when ~25% in view, text fades in below it on a single beat.

Resize back to >1024px: pinned scrub behaviour returns.

**Step 5: Type-check + lint**

```bash
pnpm exec tsc --noEmit && pnpm lint
```

**Step 6: Commit**

```bash
git add app/sections/CogniateLyraReveal.tsx
git commit -m "feat(cogniate-lyra-reveal): mobile fallback (no pin, intersection autoplay)"
```

---

## Task 8: Reduced-motion fallback

Goal: users with `prefers-reduced-motion: reduce` get a still poster image and a single text fade — no scrub, no video motion.

**Files:**
- Modify: `app/sections/CogniateLyraReveal.tsx`

**Step 1: Add reduced-motion check before the desktop path**

In the desktop branch of the ScrollTrigger setup useEffect, add:

```tsx
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduced) {
  // Fade text in on a single trigger; don't play the video at all.
  setupMobileReveal(section, null, wrapper);  // null video → no play call
  return;
}
```

This reuses the mobile reveal helper but passes `null` for the video so it's never played. The poster image stays visible as the still background.

**Step 2: Verify**

In Chrome DevTools: Rendering tab → "Emulate CSS media feature prefers-reduced-motion" → set to `reduce`. Reload. Scroll into the section: poster shown, text fades in once when in view, no scroll-pinning.

**Step 3: Type-check + lint**

```bash
pnpm exec tsc --noEmit && pnpm lint
```

**Step 4: Commit**

```bash
git add app/sections/CogniateLyraReveal.tsx
git commit -m "feat(cogniate-lyra-reveal): reduced-motion fallback (poster + simple fade)"
```

---

## Task 9: `?lyraProgress=` test-mode flag

Goal: dev-only URL flag forces `progressRef` to a chosen value and skips the pin, so Playwright can snapshot resting states deterministically. Mirrors the existing `?particleProgress=` pattern.

**Files:**
- Modify: `app/sections/CogniateLyraReveal.tsx`

**Step 1: Add the flag check at the top of the desktop branch**

In the ScrollTrigger setup useEffect, immediately after the desktop `isDesktop` guard, before the `reduced` check:

```tsx
if (process.env.NODE_ENV !== "production") {
  const forced = new URL(window.location.href).searchParams.get("lyraProgress");
  if (forced !== null) {
    const v = Math.max(0, Math.min(1, parseFloat(forced)));
    progressRef.current = v;
    // Manually drive the video to the right frame — rAF loop also writes,
    // but on test mode there's no scroll, so prime it now to avoid a flash.
    const video = videoRef.current;
    if (video) {
      video.addEventListener("loadedmetadata", () => {
        video.currentTime = Math.min(v / TIMING.VIDEO_END, 1) * video.duration;
      }, { once: true });
    }
    return; // skip the pinned ScrollTrigger
  }
}
```

The rAF loop is still active (still writes opacity/Y CSS vars from `progressRef`), so all text reveals lock at the right state for the forced progress value.

**Step 2: Verify manually**

```
http://localhost:3000/?lyraProgress=0.85
```

Should pin nothing, scroll naturally, but show the section with the held-frame video, Lyra wordmark visible, tagline visible, no CDP words yet (or "Create." just appearing).

Try a few values: `0.0`, `0.4`, `0.85`, `0.95`, `1.0`.

**Step 3: Commit**

```bash
git add app/sections/CogniateLyraReveal.tsx
git commit -m "feat(cogniate-lyra-reveal): ?lyraProgress= test-mode flag"
```

---

## Task 10: Playwright visual spec (skipped until visuals lock)

Goal: a `.skip()`'d Playwright spec ready to enable once the visual is signed off. Mirrors `tests/visual/cogniate-story-particle-swarm.spec.ts`.

**Files:**
- Create: `tests/visual/cogniate-lyra-reveal.spec.ts`

**Step 1: Create the spec**

```ts
// tests/visual/cogniate-lyra-reveal.spec.ts
import { test, expect } from "@playwright/test";

/**
 * Visual snapshots for the four resting states of the Lyra reveal scroll.
 * Skipped by default — H.264 video decoding can vary between machines, so
 * `toHaveScreenshot` may flake until we either:
 *   1. Capture single-shot screenshots and compare to a baseline manually,
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
```

**Step 2: Verify spec is discovered (skipped)**

```bash
pnpm exec playwright test tests/visual/cogniate-lyra-reveal.spec.ts --list
```

Expected: 4 skipped tests listed.

**Step 3: Commit**

```bash
git add tests/visual/cogniate-lyra-reveal.spec.ts
git commit -m "test(cogniate-lyra-reveal): skipped Playwright visual spec scaffold"
```

---

## Task 11: Final visual QA + branch finishing

Goal: end-to-end manual verification across viewport sizes and motion preferences, then prepare for review.

**Step 1: Build to catch any build-time issues**

```bash
pnpm build
```

Expected: clean build, no errors. ScrollTrigger / video / Geist all compile.

**Step 2: Run dev server and walk through scenarios**

For each of the following, scroll into the Lyra section and verify the documented behaviour:

| Scenario | How to set up | Expect |
|---|---|---|
| Desktop, full motion | Default | Pinned scrub: video scrubs 0→80%, text reveals deliberately, scrolling reverses |
| Desktop, reduced motion | DevTools → Rendering → Emulate prefers-reduced-motion: reduce | No pin, poster shown, text fades in once on scroll-into-view |
| Mobile, full motion | DevTools device emulation (iPhone 14 Pro) | No pin, video autoplays once on intersection, text staggers in below |
| Test-mode resting | `/?lyraProgress=0.85` | Section visible without scrolling, locked at 85% state |

**Step 3: Type-check + lint + (skipped) tests**

```bash
pnpm exec tsc --noEmit && pnpm lint && pnpm exec playwright test --list
```

Expected: all clean.

**Step 4: Final commit if any cleanup was needed**

If any minor adjustments were made during QA:

```bash
git add -p
git commit -m "chore(cogniate-lyra-reveal): visual QA polish"
```

If no changes: skip.

**Step 5: Push branch**

(Only if user explicitly asks — do not push proactively.)

```bash
git push -u origin feat/cogniate-story-particle-swarm
```

---

## Verification checklist

- [ ] `public/assets/cogniate-scrub-lyra-video.mp4` and `cogniate-scrub-lyra-poster.jpg` present
- [ ] `app/sections/CogniateLyraReveal.tsx` exists and exports default component
- [ ] `app/page.tsx` mounts `<CogniateLyraReveal />` after `<CogniateStory />`
- [ ] Desktop: pinned scrub works, video advances with scroll, all text reveals on schedule
- [ ] Mobile: section is normal-flow, video plays once, text fades in
- [ ] Reduced motion: poster shown, text fades in once
- [ ] `?lyraProgress=N` (dev only) forces a resting state
- [ ] `pnpm build` succeeds
- [ ] `pnpm lint` clean
- [ ] `pnpm exec tsc --noEmit` clean
- [ ] No regressions to `CogniateStory` (its existing pin and choreography unchanged)
- [ ] Playwright spec exists, lists 4 skipped tests
