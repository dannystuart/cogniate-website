---
date: 2026-04-30
section: CogniateLyraReveal
status: review
branch: feat/cogniate-story-particle-swarm
---

# Cogniate Lyra Reveal — Implementation Review

Short review of the work done in this session, written so a fresh session can pick up the amend without re-reading the design doc + plan.

## What was built

A new section `app/sections/CogniateLyraReveal.tsx` mounted between `<CogniateStory />` and `<HowItWorks />` in `app/page.tsx`. One pinned ScrollTrigger drives a 25-second scrubbed video plus staged text reveals.

## Architecture

- **Single source of truth**: `progressRef` (0..1), written by ScrollTrigger's `onUpdate`, read by one rAF loop.
- **rAF loop** sets two things per frame: `video.currentTime` (throttled to ~30Hz for iOS Safari) and CSS custom properties on the wrapper for text opacity / translateY / blur.
- **Tuning knob**: a `TIMING` object at the top of the file holds `PIN_DISTANCE` (`+=250%`), `VIDEO_END` (0.80), and per-element reveal ranges. Tweak in one place.
- **Fallbacks**: mobile (<lg) and `prefers-reduced-motion: reduce` bypass the pin and use a GSAP timeline with intersection-observed `video.play()` (or skip video entirely for reduced-motion). The rAF loop short-circuits on those branches.
- **Test mode**: `?lyraProgress=N` URL flag (NODE_ENV-gated) forces progress and skips the pin, mirroring the existing `?particleProgress=` pattern in `CogniateStory`.

## Layout decision

After the first pass, the video's last frame turned out to be a stylised "Lyra" dust wordmark — not the abstract cloud the Figma comp implied. To prevent the dust-Lyra and typeset Lyra wordmark from overlapping, the section was split vertically:

- Video occupies the upper 62vh (`object-cover`, `objectPosition: center 25%`).
- Text stack occupies the lower 38vh (`flex flex-col items-center justify-center`).

This is the implementation choice most likely to want revisiting.

## Trade-off worth flagging

The Figma's **radial-gradient mask** on "Create. Design. Publish" was **dropped** and replaced with solid white. Reason: each word span needs `display: inline-block` to carry its own `transform: translateY` for the staggered reveal, and inline-block defeats the parent `<h3>`'s `background-clip: text` — the line-spanning gradient stops painting through child blocks. The Lyra wordmark gradient still works because it's a single element with no per-letter animation.

A correct implementation of the gradient mask would need one of:

1. Per-word individual gradients (each word brightest in its own middle — different visual from Figma).
2. A wrapper element with the gradient + clip-text, and per-word transforms applied to inner spans.
3. An entirely different reveal mechanism (e.g. clip-path animation on the parent that doesn't require per-word transforms).

## Files touched

- **New**: `app/sections/CogniateLyraReveal.tsx` — the whole section.
- **New**: `public/assets/cogniate-scrub-lyra-video.mp4`, `cogniate-scrub-lyra-poster.jpg`.
- **New**: `tests/visual/cogniate-lyra-reveal.spec.ts` — four skipped Playwright cases at resting states (`?lyraProgress=` 0.0 / 0.40 / 0.83 / 1.0).
- **New**: `docs/plans/2026-04-30-cogniate-lyra-reveal-design.md`, `docs/plans/2026-04-30-cogniate-lyra-reveal.md`.
- **Modified**: `app/page.tsx` — one import + one element.

Pre-existing uncommitted changes in `app/components/StoryTooltip.tsx` and `app/sections/CogniateStory.tsx` were **not** touched.

## Branch state

12 commits ahead of where the session started. Conventional-commit prefixes throughout. Build clean, lint clean, type-check clean.

## Likely areas of dissatisfaction

Best guess at what may want amending — listed roughly in order of likelihood:

1. **Vertical-split layout** — feels less cinematic than full-bleed. A different aesthetic (e.g. video full-bleed with text overlaid lower-third in a treated card) might read better.
2. **Dropped CDP gradient** — solid white is a fallback, not the Figma intent.
3. **Text proximity to dust-Lyra** — even with the split, the typeset Lyra sits close to where the dust-Lyra is in the video.
4. **Reveal animation feel** — opacity + translateY + blur is generic; "deliberate" might want something more distinctive (line-by-line reveal mask, character split, etc.).
5. **Scrub speed / pacing** — `+=250%` might feel too fast or too slow against the actual content.

If the next session can name which of those (or something else) is the issue, it will have a clearer target than this one did.

## How to inspect resting states

With the dev server running on `:3001` (or wherever):

```
http://localhost:3001/?lyraProgress=0.0&particleProgress=1.0   # video at start
http://localhost:3001/?lyraProgress=0.40&particleProgress=1.0  # mid-video
http://localhost:3001/?lyraProgress=0.85&particleProgress=1.0  # Lyra+tagline arriving
http://localhost:3001/?lyraProgress=1.0&particleProgress=1.0   # all four elements visible
```

The `&particleProgress=1.0` is required because `CogniateStory`'s pin would otherwise hijack the scroll before the user reaches the Lyra section.
