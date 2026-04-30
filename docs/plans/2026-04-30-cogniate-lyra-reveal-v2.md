# Cogniate Lyra Reveal v2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Amend the v1 Lyra reveal to a centred edge-masked video with the typeset wordmark overlaid (not stacked below), plus a coordinated crossfade hand-off from `CogniateStory`'s particle blob into the Reveal's video.

**Architecture:** Two sibling pinned sections (`CogniateStory`, `CogniateLyraReveal`) keep their independent pins. `CogniateStory` adds a single `--story-fadeout` CSS variable to its existing rAF loop and applies it as `opacity` on the particle Canvas wrapper, the icon/logo layer, and the SVG concentric-circles. `CogniateLyraReveal` replaces its v1 vertical-split layout with a centred edge-masked video, a typeset wordmark + halo overlaid where the dust-Lyra resolves, tagline + CDP below in a gradient-bridge zone, and adds a `--video-opacity` ramp (fade in 0→0.05, dim 0.80→0.88) driven by the same rAF loop. No new dependencies; no test framework changes; the existing skipped Playwright visual spec just gets resting-state values updated.

**Tech Stack:** Next.js App Router, React, GSAP + ScrollTrigger, Tailwind, CSS variables driven by `requestAnimationFrame`. Same toolset as v1.

---

## Reference docs (read before starting)

- **Design v2 (deltas only):** `docs/plans/2026-04-30-cogniate-lyra-reveal-v2-design.md`
- **Design v1 (architecture):** `docs/plans/2026-04-30-cogniate-lyra-reveal-design.md`
- **v1 implementation review:** `docs/plans/2026-04-30-cogniate-lyra-reveal-review.md`

The v1 design doc carries the full architecture (one pinned ScrollTrigger, one progressRef, one rAF loop, ramped CSS variables, mobile/reduced-motion fallbacks, `?lyraProgress=` test mode). This v2 plan only changes what the v2 design doc names.

## Files this plan touches

- **MODIFY** `app/sections/CogniateStory.tsx` — add `--story-fadeout` variable + wrapper opacities
- **MODIFY** `app/sections/CogniateLyraReveal.tsx` — TIMING table, layout, video opacity ramp, halo, mask, gradient bridge
- **MODIFY** `tests/visual/cogniate-lyra-reveal.spec.ts` — update resting-state values from 0.83 → 0.80
- **NO CHANGE** `app/page.tsx`, video asset, poster, `app/sections/HowItWorks.tsx` (unless seam check during verification dictates a complementary fade strip)

## Pre-existing uncommitted changes (do NOT revert)

The branch already has uncommitted changes in `app/components/StoryTooltip.tsx` and `app/sections/CogniateStory.tsx` (tooltip restyling). These are unrelated to this plan and **must be preserved**. Do not run `git restore` or `git checkout --` on either file. When committing this plan's work, stage only the lines this plan adds, not the pre-existing diff.

`git status` at start of plan:
```
M app/components/StoryTooltip.tsx
M app/sections/CogniateStory.tsx
```

## Verification helpers

The dev server runs at `http://localhost:3099` (per `playwright.config.ts`); start it once and leave it running for the whole plan: `pnpm dev` (the default port 3000 is fine for ad-hoc work; only Playwright cares about 3099).

Resting states for inspection — both query params are required because Story's pin otherwise hijacks scroll before reaching the Reveal:

```
http://localhost:3000/?lyraProgress=0.00&particleProgress=1.0   # video fading in
http://localhost:3000/?lyraProgress=0.05&particleProgress=1.0   # video full opacity start
http://localhost:3000/?lyraProgress=0.40&particleProgress=1.0   # video mid-scrub
http://localhost:3000/?lyraProgress=0.78&particleProgress=1.0   # dust-Lyra resolved (alignment target)
http://localhost:3000/?lyraProgress=0.84&particleProgress=1.0   # video dimming, wordmark visible
http://localhost:3000/?lyraProgress=1.00&particleProgress=1.0   # all four reveals locked
```

A final live-scroll inspection (no query params) is the only way to verify the Story→Reveal hand-off is single-tick.

---

## Task 1: Story fadeout — add `--story-fadeout` to the rAF loop

**Goal:** Compute and write a `--story-fadeout` CSS variable on the `CogniateStory` desktop wrapper that ramps from 1 → 0 across progress 0.92 → 1.00. No DOM consumers yet; just the variable plumbing.

**Files:**
- Modify: `app/sections/CogniateStory.tsx` (the rAF loop in the second `useEffect`, currently lines 265–291)

**Step 1: Add the variable write inside the rAF tick**

After the existing `--tooltip-pointer` line, add the fadeout ramp. Locate the block:

```ts
desktop.style.setProperty("--tooltip-pointer", p > 0.65 ? "auto" : "none");
```

Add immediately after:

```ts
// Final ramp — fades the entire desktop tableau (particle Canvas + icons +
// logo + SVG circles) to 0 across the last 8% of the pin so CogniateLyraReveal
// can fade its video in without a visible pinch-cut at the section seam.
desktop.style.setProperty("--story-fadeout", String(ramp(p, 0.92, 1.0, 1, 0)));
```

**Step 2: Type-check**

Run: `pnpm tsc --noEmit`
Expected: clean exit, no errors.

**Step 3: Verify the variable is being written**

Open `http://localhost:3000/?particleProgress=1.0` in the browser. In DevTools console:

```js
const desktop = document.querySelector('[data-testid="cogniate-story-section"] > div');
getComputedStyle(desktop).getPropertyValue('--story-fadeout');
// Expected: "0" (because particleProgress=1.0 is the end of the ramp)
```

Then with `?particleProgress=0.5`:

```js
// Expected: "1" (before the ramp starts)
```

Then with `?particleProgress=0.96`:

```js
// Expected: "0.5" (mid-ramp)
```

If all three values match, the plumbing is correct. No DOM consumers yet means no visual difference.

**Step 4: Do NOT commit yet**

This is plumbing without a consumer. Commit after Task 2 wires the consumers.

---

## Task 2: Story fadeout — wire wrappers to consume `--story-fadeout`

**Goal:** Apply `--story-fadeout` as `opacity` on the three things that visually need to vanish: the particle Canvas wrapper, the icon/logo layer (already a wrapper around the four absolutely-positioned children inside `.story-circles-container`), and the SVG concentric-circles `<img>`. The design doc flags the SVG as TBD; per the verification list ("probably fade, for consistency"), include it.

**Files:**
- Modify: `app/sections/CogniateStory.tsx`

**Step 1: Apply `--story-fadeout` on the particle Canvas wrapper**

Locate the `<ParticleSwarm>` element (currently around lines 314–323). The `className` is `pointer-events-none absolute inset-0`. The `ParticleSwarm` component itself accepts `className` — not a `style` prop — so wrap it in a parent div instead. Replace:

```tsx
{swarmTargets && (
  <ParticleSwarm
    scrollProgress={progressRef}
    logoSrc="/assets/story-cogniate-logo.png"
    iconTargets={swarmTargets.iconTargets}
    blobCenter={swarmTargets.blobCenter}
    originOffsetRef={originOffsetRef}
    className="pointer-events-none absolute inset-0"
  />
)}
```

with:

```tsx
{swarmTargets && (
  <div
    className="pointer-events-none absolute inset-0"
    style={{ opacity: "var(--story-fadeout, 1)" }}
  >
    <ParticleSwarm
      scrollProgress={progressRef}
      logoSrc="/assets/story-cogniate-logo.png"
      iconTargets={swarmTargets.iconTargets}
      blobCenter={swarmTargets.blobCenter}
      originOffsetRef={originOffsetRef}
      className="absolute inset-0"
    />
  </div>
)}
```

(The wrapper now owns `pointer-events-none`; the inner Canvas is `absolute inset-0` to fill the wrapper.)

**Step 2: Apply `--story-fadeout` on the SVG concentric-circles `<img>`**

Locate the `<img src="/assets/story-concentric-circles.svg" ... />` (around lines 343–348). Add an inline style:

```tsx
<img
  src="/assets/story-concentric-circles.svg"
  alt=""
  className="absolute inset-0 size-full"
  draggable={false}
  style={{ opacity: "var(--story-fadeout, 1)" }}
/>
```

**Step 3: Wrap the four children inside `.story-circles-container` and apply `--story-fadeout`**

The four children to wrap are: the Cogniate logo div (`data-particle-fade`, around lines 351–369), the Warning Icon block (around 371–409), the Flag Icon block (around 411–449), and the Lightbulb Icon block (around 451–489). They all live inside `.story-circles-container` after the SVG `<img>`.

Insert a new wrapper div opening tag immediately after the closing `/>` of the SVG `<img>`:

```tsx
{/* Icon/logo layer — fades with --story-fadeout so the Story tableau
    crossfades into the Reveal's video at the section seam. */}
<div className="absolute inset-0" style={{ opacity: "var(--story-fadeout, 1)" }}>
```

Insert the closing `</div>` immediately before the closing `</div>` of `.story-circles-container` — i.e. before this existing line:

```tsx
          </div>
          {/* end story-circles-container */}
```

So the structure becomes:

```tsx
<div
  className="story-circles-container relative mx-auto"
  style={{ maxWidth: 1700, aspectRatio: "1718 / 635" }}
>
  <img src="/assets/story-concentric-circles.svg" ... style={{ opacity: "var(--story-fadeout, 1)" }} />

  <div className="absolute inset-0" style={{ opacity: "var(--story-fadeout, 1)" }}>
    {/* logo + 3 icon blocks ... */}
  </div>
</div>
{/* end story-circles-container */}
```

**Step 4: Type-check + lint**

Run in parallel:
- `pnpm tsc --noEmit`
- `pnpm lint`

Expected: both clean.

**Step 5: Verify visually**

Open `http://localhost:3000/?particleProgress=1.0`. Confirm: nothing visible in the Story section's pinned tableau (particles, icons, logo, circles all at opacity 0). The dark `bg-secondary` is what's seen, with only the heading still showing.

Open `http://localhost:3000/?particleProgress=0.95`. Confirm: tableau is partially faded (~37%).

Open `http://localhost:3000/?particleProgress=0.85`. Confirm: tableau is fully visible (before the ramp starts at 0.92).

Live-scroll the page (no query params): scroll through Story to its pin end. The whole tableau should fade out in the last ~8% of the pin. If anything stays visible past the end, identify the missing wrapper and add `--story-fadeout` to it.

**Step 6: Commit**

```bash
git add app/sections/CogniateStory.tsx
git commit -m "feat(cogniate-lyra-reveal): story fadeout var for crossfade hand-off"
```

> **Stage warning:** `app/sections/CogniateStory.tsx` already has unrelated tooltip-color changes (the `gradientFrom/To/accentColor` props). Stage the whole file — the v2 work is additive on top of those uncommitted edits, and they belong in this branch's history together.

---

## Task 3: Reveal — update the TIMING table and add `VIDEO_FADE_IN` / `VIDEO_DIM` / `VIDEO_SCRUB_*`

**Goal:** Replace the v1 `TIMING` constants with the v2 table. No layout or rendering changes yet; just rename/add constants and update the consumers that already exist.

**Files:**
- Modify: `app/sections/CogniateLyraReveal.tsx` (TIMING currently at lines 80–88)

**Step 1: Replace the TIMING object**

Replace the existing block:

```ts
const TIMING = {
  PIN_DISTANCE: "+=250%",
  VIDEO_END: 0.8,
  LYRA: [0.75, 0.83] as const,
  TAGLINE: [0.78, 0.86] as const,
  WORD_CREATE: [0.86, 0.9] as const,
  WORD_DESIGN: [0.91, 0.95] as const,
  WORD_PUBLISH: [0.96, 1.0] as const,
} as const;
```

with the v2 table:

```ts
// Single source of truth for everything tunable.
// To slow the scrub: bump PIN_DISTANCE.
// To delay text reveals: push the WORD_*/LYRA/TAGLINE ranges higher.
const TIMING = {
  PIN_DISTANCE: "+=250%",
  // Video opacity envelope — fades up at the start (crossfade from Story's
  // tableau), holds at 1 through the scrub, then dims to 0.3 so the typeset
  // wordmark reads cleanly over it.
  VIDEO_FADE_IN: [0.0, 0.05] as const,
  VIDEO_DIM: [0.8, 0.88] as const, // 1 → 0.3
  // Scrub window — currentTime maps from progress 0.05 → 0.78 onto 0 → duration.
  VIDEO_SCRUB_START: 0.05,
  VIDEO_SCRUB_END: 0.78,
  // Text reveals.
  LYRA: [0.72, 0.8] as const,
  TAGLINE: [0.82, 0.88] as const,
  WORD_CREATE: [0.88, 0.92] as const,
  WORD_DESIGN: [0.92, 0.96] as const,
  WORD_PUBLISH: [0.96, 1.0] as const,
} as const;
```

**Step 2: Update the test-mode forced-frame seek (around lines 116–119)**

Locate this block inside the `?lyraProgress=` branch:

```ts
const seekToForcedFrame = () => {
  const t = Math.min(v / TIMING.VIDEO_END, 1) * video.duration;
  if (Number.isFinite(t)) video.currentTime = t;
};
```

Replace with the v2 scrub equation that maps `[VIDEO_SCRUB_START, VIDEO_SCRUB_END] → [0, duration]`:

```ts
const seekToForcedFrame = () => {
  // Match the rAF loop's scrub: progress 0.05 → 0.78 maps onto 0 → duration.
  // Below 0.05 the video is mid-fade-in (currentTime stays at 0); above 0.78
  // it parks on the last frame.
  const span = TIMING.VIDEO_SCRUB_END - TIMING.VIDEO_SCRUB_START;
  const tNorm = Math.min(Math.max((v - TIMING.VIDEO_SCRUB_START) / span, 0), 1);
  const t = tNorm * video.duration;
  if (Number.isFinite(t)) video.currentTime = t;
};
```

**Step 3: Update the rAF loop's `currentTime` write (around lines 187–193)**

Locate:

```ts
if (video.duration && now - lastVideoTimeWrite > 33) {
  const videoT = Math.min(p / TIMING.VIDEO_END, 1) * video.duration;
  if (Number.isFinite(videoT)) {
    video.currentTime = videoT;
    lastVideoTimeWrite = now;
  }
}
```

Replace with:

```ts
if (video.duration && now - lastVideoTimeWrite > 33) {
  // Map progress [VIDEO_SCRUB_START, VIDEO_SCRUB_END] → [0, duration].
  // Outside that window currentTime parks at 0 or duration respectively.
  const span = TIMING.VIDEO_SCRUB_END - TIMING.VIDEO_SCRUB_START;
  const tNorm = Math.min(Math.max((p - TIMING.VIDEO_SCRUB_START) / span, 0), 1);
  const videoT = tNorm * video.duration;
  if (Number.isFinite(videoT)) {
    video.currentTime = videoT;
    lastVideoTimeWrite = now;
  }
}
```

**Step 4: Type-check**

Run: `pnpm tsc --noEmit`
Expected: clean (no `VIDEO_END` references should remain — grep to confirm).

```bash
grep -n "VIDEO_END" app/sections/CogniateLyraReveal.tsx
```

Expected: no output.

**Step 5: Verify scrub still works**

Open `http://localhost:3000/?lyraProgress=0.40&particleProgress=1.0`. The video should be mid-scrub (a frame somewhere in the middle of the source). At `?lyraProgress=0.78` it should be on the last frame (dust-Lyra). At `?lyraProgress=0.05` it should be on the first frame. At `?lyraProgress=0.0` it should be on the first frame (currentTime=0; opacity is still default since we haven't added the var yet).

The text reveals will visibly arrive later than v1 (LYRA now starts at 0.72 instead of 0.75; words shifted from 0.86/0.91/0.96 to 0.88/0.92/0.96 — only `WORD_DESIGN` actually moves). At `?lyraProgress=1.0`, all reveals should still resolve to fully visible.

**Step 6: Commit**

```bash
git add app/sections/CogniateLyraReveal.tsx
git commit -m "refactor(cogniate-lyra-reveal): v2 TIMING table + bounded scrub window"
```

---

## Task 4: Reveal — add `--video-opacity` ramp

**Goal:** Compute and write a `--video-opacity` variable on the pin wrapper that handles both the fade-in (0.00 → 0.05) and the dim (0.80 → 0.88), then apply it as `opacity` on the `<video>` element.

**Files:**
- Modify: `app/sections/CogniateLyraReveal.tsx`

**Step 1: Write the variable in the rAF loop**

Inside the `tick` function, after the `setReveal(...)` calls (around lines 198–207, just before the closing `}` of `if (!document.hidden)`), add:

```ts
// Video opacity envelope — combines the fade-in (0 → 1 over 0.0–0.05) with
// the dim (1 → 0.3 over 0.80–0.88). `dim` ramps the *amount* to subtract,
// so opacity = fadeIn − dim. Outside the windows the ramps clamp flat.
const videoFade = ramp(p, TIMING.VIDEO_FADE_IN[0], TIMING.VIDEO_FADE_IN[1], 0, 1);
const videoDim = ramp(p, TIMING.VIDEO_DIM[0], TIMING.VIDEO_DIM[1], 0, 0.7);
wrapper.style.setProperty("--video-opacity", String(videoFade - videoDim));
```

Verify by hand:
- p=0.00 → fadeIn=0, dim=0 → 0
- p=0.05 → fadeIn=1, dim=0 → 1
- p=0.50 → fadeIn=1, dim=0 → 1
- p=0.80 → fadeIn=1, dim=0 → 1
- p=0.84 → fadeIn=1, dim=0.35 → 0.65
- p=0.88 → fadeIn=1, dim=0.7 → 0.3
- p=1.00 → fadeIn=1, dim=0.7 → 0.3

**Step 2: Apply the variable on the `<video>` element**

Locate the `<video>` element (currently lines 230–242). It has `className="absolute left-0 right-0 top-0 h-[62vh] w-full object-cover"` and `style={{ objectPosition: "center 25%" }}`. We will replace these in Task 5; for now, just add `opacity: "var(--video-opacity, 0)"` to the inline style. Update the `style` prop:

```tsx
style={{ objectPosition: "center 25%", opacity: "var(--video-opacity, 0)" }}
```

(The default of `0` means the video is invisible until the rAF loop or non-pinned fallback writes a value. Task 6 sets this to `1` for the non-pinned path; Task 5 will refactor the className/style so leaving the wrong className for now is fine.)

**Step 3: Set `--video-opacity: 1` in the non-pinned fallback**

In `setupNonPinnedReveal` (currently lines 21–75), the function takes `wrapper: HTMLDivElement`. Inside the function body, before the `if (video) { ... }` block, add:

```ts
// On mobile + reduced-motion the video doesn't need the desktop fade/dim
// envelope — park the variable at 1 so the default of 0 doesn't hide it.
wrapper.style.setProperty("--video-opacity", "1");
```

**Step 4: Type-check + verify visually**

Run: `pnpm tsc --noEmit` — clean.

Open `http://localhost:3000/?lyraProgress=0.0&particleProgress=1.0`. Video should be invisible (opacity 0).

`?lyraProgress=0.03` — video at ~60% opacity, fading in.

`?lyraProgress=0.05` through `?lyraProgress=0.79` — video at full opacity.

`?lyraProgress=0.84` — video at ~65% opacity (dimming).

`?lyraProgress=0.88` and `?lyraProgress=1.0` — video at 30% opacity.

Resize the browser narrower than 1024px (mobile fallback). Reload — the video should be visible at full opacity (the fallback parks it at 1).

**Step 5: Commit**

```bash
git add app/sections/CogniateLyraReveal.tsx
git commit -m "feat(cogniate-lyra-reveal): video opacity ramp (fade in + dim)"
```

---

## Task 5: Reveal — restructure layout (centred edge-masked video, overlay typeset Lyra, halo, gradient bridge)

**Goal:** Replace the v1 vertical-split layout (62vh video band on top, 38vh text band on bottom) with the v2 layout: centred edge-masked video at upper-mid, typeset Lyra overlaid where the dust resolves, tagline + CDP below the video in a gradient-bridge zone. This is the largest single change.

**Files:**
- Modify: `app/sections/CogniateLyraReveal.tsx` (the entire JSX returned from the component, currently lines 219–361)

**Step 1: Add a layout constant for the typeset Lyra overlay position**

At the top of the file, near the `TIMING` block, add a separate constant. Per the design doc's verification step, this is dialled in by capturing a still at `?lyraProgress=0.78` and overlaying the typeset wordmark — start at 38vh and adjust in the verification round.

```ts
// Vertical position of the typeset wordmark, anchored to where the dust-Lyra
// resolves inside the final video frame. Verified at ?lyraProgress=0.78.
const LYRA_TOP_VH = 38;
```

**Step 2: Replace the JSX inside `pinWrapperRef`**

Replace the current `<video>`, ambient-blur div, and text-stack block (everything from `<video ref={videoRef} ...>` through the closing `</div>` of the `bottom-0 ... h-[38vh]` text stack) with the v2 layout. The new structure:

```tsx
<div ref={pinWrapperRef} className="relative min-h-screen w-full">
  {/* Video — centred horizontally, anchored ~10vh from the top so there's
      breathing room above. Width clamps so the source isn't stretched past
      native (1584×1308). Edge-masked into bg-secondary on all four sides
      so no rectangular boundary is visible. */}
  <video
    ref={videoRef}
    className="lyra-video absolute left-1/2 top-[10vh] -translate-x-1/2"
    style={{
      width: "clamp(760px, 60vw, 1100px)",
      height: "auto",
      objectFit: "contain",
      maskImage:
        "radial-gradient(ellipse 70% 70% at 50% 50%, black 45%, transparent 100%)",
      WebkitMaskImage:
        "radial-gradient(ellipse 70% 70% at 50% 50%, black 45%, transparent 100%)",
      opacity: "var(--video-opacity, 0)",
    }}
    muted
    playsInline
    preload="auto"
    poster="/assets/cogniate-scrub-lyra-poster.jpg"
    disablePictureInPicture
    disableRemotePlayback
  >
    <source src="/assets/cogniate-scrub-lyra-video.mp4" type="video/mp4" />
  </video>

  {/* Halo — soft dark blurred ellipse sized to envelop the typeset wordmark
      with margin. Shares --lyra-opacity so it never appears empty. Sits
      directly behind the wordmark; no individual halos for tagline/CDP. */}
  <div
    aria-hidden
    className="lyra-halo pointer-events-none absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
    style={{
      top: `${LYRA_TOP_VH}vh`,
      width: "clamp(420px, 45vw, 600px)",
      height: "clamp(180px, 18vw, 280px)",
      background:
        "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0,0,0,0.85) 0%, transparent 70%)",
      filter: "blur(40px)",
      opacity: "var(--lyra-opacity, 0)",
    }}
  />

  {/* Typeset wordmark — overlays the dust-Lyra at the same screen position.
      Sized so its baseline matches where the resolved dust lands in the
      final video frame. Position anchor is LYRA_TOP_VH; verify by capturing
      a still at ?lyraProgress=0.78 and overlaying the wordmark. */}
  <h2
    className="lyra-wordmark absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
    style={{
      top: `${LYRA_TOP_VH}vh`,
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
      opacity: "var(--lyra-opacity, 0)",
      transform:
        "translate(-50%, calc(-50% + var(--lyra-y, 16px)))",
      filter: "blur(var(--lyra-blur, 2px))",
    }}
  >
    Lyra
    <sup style={{ fontWeight: 300, fontSize: "0.557em", verticalAlign: "super" }}>
      ®
    </sup>
  </h2>

  {/* Tagline + CDP — sit in the lower viewport, inside the gradient bridge
      zone where contrast is fine without per-element halos. Stacked
      absolutely so they don't push other elements; centred horizontally. */}
  <div className="pointer-events-none absolute inset-x-0 bottom-[18vh] flex flex-col items-center">
    <p
      className="lyra-tagline text-center"
      style={{
        fontFamily: "var(--font-sans)",
        fontWeight: 300,
        fontSize: "clamp(18px, 1.7vw, 24px)",
        lineHeight: 1.3,
        letterSpacing: "-0.01em",
        color: "rgba(242,234,255,0.8)",
        maxWidth: "min(420px, 90vw)",
        opacity: "var(--tagline-opacity, 0)",
        transform: "translateY(var(--tagline-y, 16px))",
        filter: "blur(var(--tagline-blur, 2px))",
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
        color: "rgba(255,255,255,0.95)",
      }}
    >
      <span
        data-word="create"
        style={{
          display: "inline-block",
          opacity: "var(--w-create-opacity, 0)",
          transform: "translateY(var(--w-create-y, 16px))",
          filter: "blur(var(--w-create-blur, 2px))",
        }}
      >
        Create.&nbsp;
      </span>
      <span
        data-word="design"
        style={{
          display: "inline-block",
          opacity: "var(--w-design-opacity, 0)",
          transform: "translateY(var(--w-design-y, 16px))",
          filter: "blur(var(--w-design-blur, 2px))",
        }}
      >
        Design.&nbsp;
      </span>
      <span
        data-word="publish"
        style={{
          display: "inline-block",
          opacity: "var(--w-publish-opacity, 0)",
          transform: "translateY(var(--w-publish-y, 16px))",
          filter: "blur(var(--w-publish-blur, 2px))",
        }}
      >
        Publish
      </span>
    </h3>
  </div>

  {/* Gradient bridge — pulls the video's bottom edge into bg-secondary and
      creates a continuous fade through the text region into HowItWorks.
      bg-secondary (#101011) and HowItWorks's #111112 are visually identical,
      so no complementary fade is needed at the section seam by default. */}
  <div
    aria-hidden
    className="lyra-bridge pointer-events-none absolute inset-x-0 bottom-0"
    style={{
      height: "35%",
      background:
        "linear-gradient(to bottom, transparent 0%, var(--color-bg-secondary) 70%)",
    }}
  />
</div>
```

Notes on the changes vs v1:
- Wordmark uses `transform: translate(-50%, calc(-50% + var(--lyra-y)))` because it needs both the horizontal centring and the vertical-Y reveal. The original v1 wordmark only used `translateY` because it lived in a flex column.
- The ambient-blur div from v1 (940×431 dark radial) is removed — replaced by the smaller, sharper `.lyra-halo` that's tied to the wordmark's `--lyra-opacity`.
- The `.lyra-bridge` is new.

**Step 3: Mobile sizing — clamp the video on `<lg`**

The v2 design specifies a different width on mobile: `width: min(90vw, 600px)`. Tailwind doesn't easily express that on inline `style`, so use a media query. Add a `<style jsx global>` is not used in this project; instead, switch to writing the mobile rule into the existing `app/globals.css`.

Open `app/globals.css` and append at the end:

```css
/* CogniateLyraReveal — mobile/tablet override of the desktop clamp width.
   Below the lg breakpoint (1024px) the video shrinks but keeps the same
   edge mask and aspect ratio. */
@media (max-width: 1023.98px) {
  .lyra-video {
    width: min(90vw, 600px) !important;
  }
}
```

(`!important` is needed because the inline `style` prop wins specificity otherwise.)

**Step 4: Type-check + lint**

Run in parallel:
- `pnpm tsc --noEmit`
- `pnpm lint`

Expected: both clean. If lint flags an `<img>` rule for the video, ignore — it's a `<video>`, not an `<img>`.

**Step 5: Verify visually at every resting state**

Walk these in order. The video should be centred, noticeably smaller than v1 (clamp 760–1100px), with feathered edges into the dark background — no rectangular boundary visible.

- `?lyraProgress=0.00&particleProgress=1.0` — video invisible, no text, halo invisible.
- `?lyraProgress=0.04&particleProgress=1.0` — video fading in mid-way.
- `?lyraProgress=0.40&particleProgress=1.0` — video full opacity, mid-frame, no text.
- `?lyraProgress=0.76&particleProgress=1.0` — video full opacity near end of scrub, halo fading in (~50% opacity), wordmark fading in (~50% opacity) overlaid on the dust.
- `?lyraProgress=0.80&particleProgress=1.0` — video full opacity, dust-Lyra resolved, typeset wordmark + halo at 100% opacity overlaid on the dust.
- `?lyraProgress=0.84&particleProgress=1.0` — video at ~65% opacity (dimming), wordmark + halo full, tagline halfway in.
- `?lyraProgress=0.90&particleProgress=1.0` — video at 30%, wordmark + halo full, tagline full, "Create." full, "Design." fading in.
- `?lyraProgress=1.00&particleProgress=1.0` — video at 30%, all four reveals locked.

Resize narrower than 1024px and confirm the video shrinks to `min(90vw, 600px)` and still has the edge mask.

**Step 6: Do not commit yet — verification round next**

The wordmark alignment, mask radius, and seam are calls that can only be made with the actual layout rendered. Move to Tasks 6–9 to dial those in, then commit the whole batch together.

---

## Task 6: Verify and tune — typeset Lyra alignment over dust-Lyra

**Goal:** Capture a still at `?lyraProgress=0.78` (dust fully resolved) and dial `LYRA_TOP_VH` so the typeset wordmark sits exactly over the dust wordmark.

**Files:**
- Modify (probably): `app/sections/CogniateLyraReveal.tsx` — `LYRA_TOP_VH` constant.

**Step 1: Capture the dust-Lyra position**

Open `http://localhost:3000/?lyraProgress=0.78&particleProgress=1.0`. In DevTools, hide the typeset wordmark temporarily:

```js
document.querySelector('.lyra-wordmark').style.opacity = '0';
document.querySelector('.lyra-halo').style.opacity = '0';
```

Take a screenshot of just the dust-Lyra in place. Restore visibility:

```js
document.querySelector('.lyra-wordmark').style.opacity = '1';
document.querySelector('.lyra-halo').style.opacity = '1';
```

Toggle back and forth. The typeset wordmark should sit centred on the dust wordmark — same baseline, same horizontal centre, similar size.

**Step 2: Adjust `LYRA_TOP_VH` if needed**

In DevTools, inspect the `.lyra-wordmark` element and live-edit `top: <X>vh` until the alignment is right. Then update the constant in `app/sections/CogniateLyraReveal.tsx`:

```ts
const LYRA_TOP_VH = 38; // → adjust to whatever DevTools showed
```

If the typeset wordmark is too large/small relative to the dust, that's a font-size issue separately — the wordmark's `clamp(64px, 7vw, 96px)` should be close. If it's noticeably off, flag it but don't change without product-design input.

**Step 3: Re-verify**

Reload `?lyraProgress=0.78&particleProgress=1.0`. Toggle wordmark opacity in DevTools to confirm alignment.

Then check `?lyraProgress=1.00&particleProgress=1.0` — at this point the video has dimmed to 0.3, so the dust-Lyra is faint and the typeset wordmark should be the dominant element in that zone.

**Step 4: Document the result inline**

If the constant changed, update its comment to record the verified value, e.g.:

```ts
// Vertical position of the typeset wordmark, anchored to where the dust-Lyra
// resolves inside the final video frame. Verified at ?lyraProgress=0.78.
const LYRA_TOP_VH = 36; // (or whichever value)
```

---

## Task 7: Verify and tune — video edge-mask radius

**Goal:** Confirm the radial-gradient mask doesn't clip any visible content in the final dust-resolved frame. The design doc's default is 70%; widen to 80% if dust gets clipped.

**Files:**
- Modify (only if clipping is observed): `app/sections/CogniateLyraReveal.tsx` — both `maskImage` and `WebkitMaskImage` strings on the `<video>`.

**Step 1: Inspect the last frame**

Open `http://localhost:3000/?lyraProgress=0.78&particleProgress=1.0`. Hide the typeset wordmark + halo as in Task 6 to get a clean view of just the dust.

Look closely at the four edges of the masked region. The dust wordmark sits roughly centred — confirm none of its dust particles disappear into the feathered edge. Also check the outer extent of the cloud/dust drift in earlier frames (`?lyraProgress=0.40`) — wider drift could fall in the clipped zone.

**Step 2: If clipping is visible, widen to 80%**

Edit both `maskImage` and `WebkitMaskImage` strings:

```ts
maskImage:
  "radial-gradient(ellipse 80% 80% at 50% 50%, black 45%, transparent 100%)",
WebkitMaskImage:
  "radial-gradient(ellipse 80% 80% at 50% 50%, black 45%, transparent 100%)",
```

Re-inspect frames 0.40, 0.78, 1.00 to confirm no rectangular boundary is visible *and* no dust is lost.

**Step 3: If 80% still clips or shows the rectangle**

Either widen further (85%) or shift the inner-black stop (`black 45%` → `black 55%`) to keep more centre-opaque area. This is an aesthetics call — pick the value that hides the rectangle without cutting into the dust.

---

## Task 8: Verify and tune — HowItWorks seam

**Goal:** Walk the boundary between `CogniateLyraReveal` and `HowItWorks` after the gradient bridge is in. If the seam is visible, add a complementary fade strip at the top of `HowItWorks`.

**Files:**
- Possibly modify: `app/sections/HowItWorks.tsx` — add a top fade strip above the existing background grid.

**Step 1: Inspect the seam**

Open `http://localhost:3000/` (no query params) and scroll to the end of the Lyra reveal section. Watch the transition into HowItWorks.

The two background colours are `bg-secondary` (`#101011`) and HowItWorks's `bg-[#111112]` — visually nearly identical (delta ≈ 1). The gradient bridge already softens the Reveal side. In a normal-contrast setup the seam should be invisible.

**Step 2: If a seam is visible**

Add an 80px-tall complementary fade at the top of HowItWorks. Inside `app/sections/HowItWorks.tsx`, locate the opening `<section>` (around lines 148–151). Just inside, before the existing `<div className="absolute inset-x-0 ...">` background grid, add:

```tsx
{/* Top fade — bridges from CogniateLyraReveal's bg-secondary into
    HowItWorks's #111112. Only here if the seam reads on real scroll;
    the colours are nearly identical so it's typically not needed. */}
<div
  aria-hidden
  className="pointer-events-none absolute inset-x-0 top-0 h-[80px]"
  style={{
    background:
      "linear-gradient(to bottom, var(--color-bg-secondary), transparent)",
  }}
/>
```

Reload and confirm the seam disappears.

**Step 3: If no seam visible, do nothing**

This is an implementation-time call, not a design commitment.

---

## Task 9: Verify and tune — Story → Reveal pin hand-off

**Goal:** Confirm the Story unpin → Reveal pin transition is a single scroll tick with no visible gap. Tighten Reveal's `start` if needed.

**Files:**
- Possibly modify: `app/sections/CogniateLyraReveal.tsx` — the `ScrollTrigger.create` call's `start` value.

**Step 1: Scroll the live page from end of Story into Reveal**

Open `http://localhost:3000/` (no query params). Scroll slowly through Story until its pin releases — by progress 0.92–1.00 the tableau should be fading out, ending in pure `bg-secondary`. The next pixel of scroll should engage Reveal's pin and the video should start fading in (0.00 → 0.05).

Watch for any of:
- A gap of empty `bg-secondary` longer than ~one frame.
- Story's tableau still visible when Reveal's pin starts (overlap suggests Reveal pinned too early).
- Story's tableau gone but Reveal's video hasn't started fading yet (gap suggests Reveal's pin starts too late).

**Step 2: If a visible gap exists, tighten Reveal's pin start**

Locate `ScrollTrigger.create({ trigger: wrapper, start: "top top", ... })` (currently around lines 140–149).

Change to:

```ts
ScrollTrigger.create({
  trigger: wrapper,
  start: "top bottom-=1", // fire one pixel earlier than top-of-viewport
  end: TIMING.PIN_DISTANCE,
  pin: true,
  scrub: 1,
  onUpdate: (self) => {
    progressRef.current = self.progress;
  },
});
```

Reload and re-scroll. The pin should engage one pixel before the top-of-viewport landmark.

**Step 3: If overlap exists**

Less likely, but if Reveal's pin engages while Story's pin is still active, slacken Reveal's start (e.g. `start: "top top+=1"`) or push Story's fadeout earlier (in `CogniateStory.tsx`, change the `--story-fadeout` ramp to e.g. `ramp(p, 0.88, 1.0, 1, 0)` to start fading sooner).

**Step 4: Confirm fadeout coverage**

While scrolling through Story's last beat, watch carefully: the particles, icons, logo, tooltips, and concentric-circles SVG should all fade together. If anything stays visible past the fadeout, it's an unwrapped element — track it down and add `--story-fadeout` to its style.

---

## Task 10: Commit the layout + verifications

**Goal:** Commit the v2 Reveal layout, the verified `LYRA_TOP_VH`, any tuned mask radius, and any seam strip in one logical batch.

**Step 1: Confirm no unintended diffs**

Run:

```bash
git status
git diff app/sections/CogniateLyraReveal.tsx app/globals.css
git diff app/sections/HowItWorks.tsx  # only if touched in Task 8
```

Confirm: only the v2 layout changes are staged. The unrelated tooltip diff in `app/components/StoryTooltip.tsx` should still be present in `git status` but unstaged — that's fine, it belongs to a separate concern and is preserved.

**Step 2: Stage and commit**

```bash
git add app/sections/CogniateLyraReveal.tsx app/globals.css
# Only if Task 8 added the seam strip:
# git add app/sections/HowItWorks.tsx
git commit -m "feat(cogniate-lyra-reveal): centred edge-masked video + overlay typeset Lyra"
```

---

## Task 11: Update the visual test spec resting states

**Goal:** Update the four `?lyraProgress=` cases in the skipped Playwright spec to match the v2 timings: 0.0, 0.40, 0.80, 1.0 (was 0.0, 0.40, 0.83, 1.0).

**Files:**
- Modify: `tests/visual/cogniate-lyra-reveal.spec.ts`

**Step 1: Update the cases array**

Locate (line 15–20):

```ts
const cases = [
  { name: "pre-trigger", query: "0.0" },
  { name: "video-mid", query: "0.40" },
  { name: "lyra-arriving", query: "0.83" },
  { name: "all-revealed", query: "1.0" },
] as const;
```

Replace with:

```ts
const cases = [
  { name: "pre-trigger", query: "0.0" },
  { name: "video-mid", query: "0.40" },
  { name: "lyra-arriving", query: "0.80" },
  { name: "all-revealed", query: "1.0" },
] as const;
```

(Only `0.83 → 0.80` changes — the dust-Lyra now resolves at the LYRA window's end, 0.80, not 0.83.)

**Step 2: Confirm the spec is still skipped**

The four `test.skip(...)` calls should remain `skip` — the comment at the top of the file explains why (H.264 decode varies between machines). No change to that gating.

**Step 3: Type-check**

Run: `pnpm tsc --noEmit`
Expected: clean.

**Step 4: Commit**

```bash
git add tests/visual/cogniate-lyra-reveal.spec.ts
git commit -m "test(cogniate-lyra-reveal): align resting-state values with v2 timings"
```

---

## Task 12: Final integration check + build

**Goal:** Confirm the whole branch builds cleanly, lints cleanly, type-checks cleanly; do one full live-scroll pass to sign off the v2 amend.

**Step 1: Run the full build pipeline**

Run in parallel:
- `pnpm tsc --noEmit`
- `pnpm lint`
- `pnpm build`

Expected: all three exit cleanly. If `pnpm build` fails on something v2-related, fix and amend the relevant task's commit (don't squash unless the user asks).

**Step 2: Live-scroll smoke test**

Open `http://localhost:3000/` (no query params). Scroll slowly from the top of the page through Hero, Landscape, Story, Reveal, HowItWorks. Confirm:

1. Story's pin engages and runs through its 4-phase choreography (unchanged).
2. In the last 8% of Story's pin, the entire tableau (particles, icons, logo, circles) fades to 0.
3. Reveal's pin engages at the next scroll tick — no visible gap or overlap.
4. The video fades in (0 → 0.05) over the first sliver of Reveal's scroll.
5. The video scrubs through to the dust-Lyra by ~70% of Reveal's scroll.
6. The typeset wordmark + halo fade in over the dust at ~72–80%.
7. The video dims to ~30% from 80–88%.
8. Tagline arrives 82–88%, then "Create." 88–92%, "Design." 92–96%, "Publish" 96–100%.
9. The transition into HowItWorks is seamless — no visible band boundary.

**Step 3: Mobile + reduced-motion smoke test**

Resize the browser narrower than 1024px. Reload. Confirm:

- No pin, no scrub.
- Video plays once when the section enters the viewport.
- Text reveals on a simple `top 70%` GSAP timeline.
- Edge mask still visible.
- Width clamped to `min(90vw, 600px)`.

In DevTools, toggle `prefers-reduced-motion: reduce` (Rendering panel → Emulate CSS media feature). Reload. Confirm:

- No pin, no scrub.
- Video does not autoplay; poster stays visible.
- Text reveals on a simple `top 70%` GSAP timeline.

**Step 4: Final report**

Summarise the result for the user: branch state (commits ahead of `main`), any tuning values that landed (`LYRA_TOP_VH`, mask radius), whether the seam strip was needed, whether the pin start was tightened. No commit needed if nothing changed in this task.

---

## Out of scope for this plan

These are explicitly deferred per the v2 design doc and should not be touched:

- The radial-gradient mask on "Create. Design. Publish" (per-word transforms still defeat `background-clip: text`; solid white stays).
- Any change to `CogniateStory`'s 4-phase choreography (only the additive `--story-fadeout` variable).
- Anything in `app/page.tsx`, the video asset, or the poster.

If during verification anything else feels off (pacing, scrub speed, halo size), flag it back to the user — the design doc decisions stay until the user OKs amendments.
