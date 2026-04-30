---
date: 2026-04-30
section: CogniateLyraReveal
status: design
---

# Cogniate — Lyra reveal (scrubbed video + text)

A new pinned section, mounted immediately after `CogniateStory`, that scrubs through a 25-second video as the user scrolls. As the video resolves, three layers of text fade in on top: the **Lyra®** wordmark, a tagline, and a deliberately-staged **"Create. Design. Publish"** headline.

The new section is the explicit hand-off planned by the existing particle code (`app/sections/CogniateStory.tsx:30` — *"hand-off point for a future video reveal that drops in from below"*). It sits as a sibling, not a child, so each section's pin can start and end independently.

## Goals

- Make the video feel **scrubbed by scroll** — not played, not auto-advancing. The user controls the pace.
- Tunable scrub speed via a single named constant (no magic numbers).
- Text reveal that lands deliberately, not all at once: Lyra → tagline → "Create." → "Design." → "Publish" with breathing room between each beat.
- One pinned ScrollTrigger; one rAF loop; one source-of-truth progress value.
- No regressions to `CogniateStory` — its pin and its scroll length stay exactly as they are.

## Non-goals

- Replacing the particle swarm. The CogniateStory section keeps its 4-phase choreography unchanged.
- Audio. Video is muted (and autoplay-policy compliance via `muted` + `playsInline`).
- A custom Lyra wordmark asset. Wordmark is typeset using the existing Geist font; can be swapped to an SVG/PNG later by replacing one element.
- Server-side video transcoding pipeline. The supplied H.264 mp4 plays natively in every modern browser.

## Asset

`public/assets/cogniate-scrub-lyra-video.mp4`
- 1584×1308 (~1.21:1, near-square)
- H.264 / AVC, baseline level 4.0 (universal browser support)
- 25.23s, 30fps, 757 frames
- 32 MB, ~10.7 Mbps

A poster frame baked from frame 757 (last frame) will live at `public/assets/cogniate-scrub-lyra-poster.jpg` for the reduced-motion fallback and as the `<video poster>` attribute.

## Choreography

One pinned `ScrollTrigger` (`pin: true`, `scrub: 1`) covers the section. Scroll position maps to a single 0–1 progress value; everything below is keyed off that.

| Progress | What happens |
|---|---|
| 0.00 → 0.80 | **Video scrubs.** `video.currentTime = (progress / 0.80) * video.duration`. At 0.80 the video is on its last frame. |
| 0.75 → 0.83 | **Lyra wordmark** fades + rises 16px → 0px (overlaps the last 5% of the video so the wordmark is already settling as the cloud locks). |
| 0.78 → 0.86 | **Tagline** fades + rises (trails Lyra by 0.03). |
| 0.80 → 0.85 | **Held beat.** Video locked on last frame; nothing new happening. Cinematic pause. |
| 0.86 → 0.90 | **"Create."** fades + rises. |
| 0.91 → 0.95 | **"Design."** fades + rises. |
| 0.96 → 1.00 | **"Publish"** fades + rises. |

The 1% gap between word reveals is a quiet beat where the previous word has just locked in. No per-character stagger; the deliberation comes from the spacing between word arrivals, not effects within a word.

The video's static gradient (white centre, dark edges, baked into the source) gives the middle word "Design." natural emphasis without any per-word styling.

## Tunability — the scrub-speed knob

A single config object at the top of `CogniateLyraReveal.tsx`:

```ts
const TIMING = {
  // Pin length — the main scrub-speed knob.
  // Bigger = slower scrub. Smaller = faster.
  PIN_DISTANCE: "+=250%",

  // Where in scroll progress (0..1) the video reaches its last frame.
  VIDEO_END: 0.80,

  // Per-element reveal points (scroll progress 0..1).
  // Each tuple = [fadeStart, fadeEnd]. opacity = ramp(p, start, end, 0, 1).
  LYRA: [0.75, 0.83],
  TAGLINE: [0.78, 0.86],
  WORD_CREATE: [0.86, 0.90],
  WORD_DESIGN: [0.91, 0.95],
  WORD_PUBLISH: [0.96, 1.00],
} as const;
```

To slow the whole experience down, change `PIN_DISTANCE`. To delay the words, push the `WORD_*` ranges higher. One file, named numbers, no spelunking.

## DOM structure

```
<section data-testid="cogniate-lyra-reveal">
  <div ref=pinWrapper class="min-h-screen relative">          ← pinned by ScrollTrigger
    <video
      class="absolute inset-0 w-full h-full object-cover"
      muted playsInline preload="auto"
      poster="/assets/cogniate-scrub-lyra-poster.jpg"
      disablePictureInPicture disableRemotePlayback
    >
      <source src="/assets/cogniate-scrub-lyra-video.mp4" type="video/mp4" />
    </video>

    <div class="lyra-shadow absolute" />                        ← 940×431 blurred ambient blob
                                                                  (Figma node 10:10271)

    <div class="lyra-text-stack absolute inset-0 flex flex-col items-center justify-center">
      <h2 class="lyra-wordmark"
          style="opacity: var(--lyra-opacity, 0); transform: translateY(var(--lyra-y, 16px))">
        Lyra<sup>®</sup>
      </h2>
      <p class="lyra-tagline" style="opacity: var(--tagline-opacity, 0); transform: ...">
        Your AI assistant to help you from idea to fully created course.
      </p>
      <h3 class="lyra-cdp">
        <span data-word="create"
              style="opacity: var(--w-create-opacity, 0); transform: ...">Create. </span>
        <span data-word="design"
              style="opacity: var(--w-design-opacity, 0); transform: ...">Design. </span>
        <span data-word="publish"
              style="opacity: var(--w-publish-opacity, 0); transform: ...">Publish</span>
      </h3>
    </div>
  </div>
</section>
```

Z-order is by DOM order: video (z-0) → shadow (z-10) → text (z-20). No `z-index` declarations needed.

## Visual treatment

Specs sourced from Figma node `10:10270`.

### Lyra wordmark

```css
font-family: var(--font-sans); /* Geist */
font-weight: 700; /* Bold */
font-size: clamp(64px, 7vw, 96px);
line-height: 1.1;
letter-spacing: -0.04em; /* -3.84px at 96px */
background: linear-gradient(164.7deg, #ffffff 3%, rgb(146, 100, 205) 98%);
-webkit-background-clip: text;
background-clip: text;
color: transparent;
```

The `<sup>®</sup>` inside is `font-weight: 300` (Geist Light) and `font-size: 0.557em` (= 53.5/96 from Figma).

### Tagline

```css
font-family: var(--font-sans);
font-weight: 300; /* Light */
font-size: clamp(18px, 1.7vw, 24px);
line-height: 1.3;
letter-spacing: -0.01em;
color: rgba(242, 234, 255, 0.8);
max-width: min(420px, 90vw);
text-align: center;
```

### "Create. Design. Publish"

```css
font-family: var(--font-sans);
font-weight: 600; /* SemiBold */
font-size: clamp(36px, 5vw, 64px);
line-height: 1.1;
letter-spacing: -0.04em; /* -2.56px at 64px */
background: radial-gradient(
  ellipse 65% 50% at 50% 50%,
  #ffffff 0%,
  rgba(212, 209, 218, 0.75) 25%,
  rgba(169, 163, 180, 0.5) 50%,
  rgba(82, 71, 105, 0) 100%
);
-webkit-background-clip: text;
background-clip: text;
color: transparent;
text-align: center;
```

The radial gradient is applied to the parent `<h3>`, so each fading-in span clips the same gradient — words inherit a consistent treatment as they arrive.

### Shadow blob

```css
.lyra-shadow {
  width: 940px;
  height: 431px;
  /* Soft dark radial — bridges video → text */
  background: radial-gradient(
    ellipse 50% 50% at 50% 50%,
    rgba(0, 0, 0, 0.6) 0%,
    rgba(0, 0, 0, 0) 70%
  );
  filter: blur(60px);
  /* Centred behind the text stack, anchored vertically to the wordmark zone */
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
```

## Scrub mechanics

`progressRef` (a `useRef<number>`) holds 0..1. ScrollTrigger writes it via `onUpdate`. A single `requestAnimationFrame` loop reads it and writes outputs.

```ts
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

      // Video currentTime — throttled to ~30 Hz to spare iOS Safari's decoder.
      if (video.duration && now - lastVideoTimeWrite > 33) {
        const videoT = Math.min(p / TIMING.VIDEO_END, 1) * video.duration;
        // Guard against pre-metadata writes that throw on some browsers.
        if (Number.isFinite(videoT)) {
          video.currentTime = videoT;
          lastVideoTimeWrite = now;
        }
      }

      // Text reveals — opacity + Y translation (CSS variables).
      wrapper.style.setProperty("--lyra-opacity", String(ramp(p, ...TIMING.LYRA, 0, 1)));
      wrapper.style.setProperty("--lyra-y", `${ramp(p, ...TIMING.LYRA, 16, 0)}px`);
      // ... same pattern for tagline + each word
    }
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);
  return () => { stopped = true; cancelAnimationFrame(rafId); };
}, []);
```

**Why throttle `currentTime`:** iOS Safari restarts a decode pipeline whenever you set `currentTime`. Hammering it at 60Hz can cause stalls or strobing. 30Hz is plenty since the source is 30fps anyway.

**Why CSS variables, not React state:** scroll-driven values change every frame. State would re-render the whole component tree continuously. CSS variables on the wrapper element bypass React entirely — same pattern `CogniateStory` already uses for its particle phases.

## Mobile (`<lg`) fallback

No pinning. The section is a normal-flow block of natural height. Inside:

- Video element loads, `muted playsInline`. An IntersectionObserver triggers `video.play()` once when the section enters the viewport (autoplay-policy compliant because `muted`). Plays through once at native speed; pauses on the last frame.
- Text fades + rises on standard GSAP `top 70%` triggers, slightly staggered (0.15s between Lyra → tagline → CDP).
- Total height: video aspect-ratio box + ~200px of text.

Same content, simpler choreography. No scroll hijacking on mobile.

## Reduced-motion fallback

`window.matchMedia("(prefers-reduced-motion: reduce)").matches`:

- No pin, no scrub, no rAF loop.
- Video element is replaced by an `<img>` of the poster (last frame). No motion.
- Text fades in on a single `top 70%` trigger, 0.6s duration.

## Test mode

Reuses the existing `?particleProgress=` URL flag pattern from `CogniateStory`:

```ts
if (process.env.NODE_ENV !== "production") {
  const forced = new URL(window.location.href).searchParams.get("lyraProgress");
  if (forced !== null) {
    const v = clamp(parseFloat(forced), 0, 1);
    progressRef.current = v;
    // Skip pin — pin would otherwise hijack scroll for tests.
    return;
  }
}
```

Lets Playwright snapshot the section at deterministic resting states (e.g. `?lyraProgress=0.85`) without needing to script scroll.

## Open questions

None — all design decisions resolved during brainstorming on 2026-04-30.

## File-level changes

- **NEW**: `app/sections/CogniateLyraReveal.tsx`
- **NEW**: `public/assets/cogniate-scrub-lyra-poster.jpg` (poster frame, baked from video)
- **MODIFIED**: `app/page.tsx` — mount `<CogniateLyraReveal />` immediately after `<CogniateStory />`
- *(optional)* `e2e/cogniate-lyra-reveal.spec.ts` — visual snapshots at `?lyraProgress=` resting states, mirroring the existing particle-swarm spec
