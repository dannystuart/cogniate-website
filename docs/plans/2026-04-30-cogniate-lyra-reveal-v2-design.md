---
date: 2026-04-30
section: CogniateLyraReveal
status: design
revision: v2
supersedes: 2026-04-30-cogniate-lyra-reveal-design.md
---

# Cogniate — Lyra reveal v2 (amend)

Revised design for the Lyra reveal section, replacing the v1 vertically-split layout with a smaller, edge-masked, expansive video that the typeset wordmark overlays. Adds a coordinated crossfade hand-off from `CogniateStory`'s particle blob.

The v1 doc (`2026-04-30-cogniate-lyra-reveal-design.md`) and the implementation review (`2026-04-30-cogniate-lyra-reveal-review.md`) name what went wrong. This doc only covers the deltas — read v1 first for the architecture (one pinned ScrollTrigger, one progressRef, one rAF loop, ramped CSS variables, mobile/reduced-motion fallbacks, `?lyraProgress=` test mode). All of that is preserved.

## Problems being addressed

From the v1 implementation:

1. **Video is too big.** Full-bleed `100vw × 62vh` stretches the 1584×1308 source well past native, dominating the viewport.
2. **Video and typeset Lyra are stacked, not overlaid.** v1 split the viewport into a 62vh video band on top and a 38vh text band below. The typeset Lyra wordmark sits *below* the video instead of *over* it.
3. **No readability halo.** The ambient blur exists but is positioned to bridge the band boundary, not to sit behind the typeset text.
4. **Particle swarm and video are visually disconnected.** `CogniateStory` ends pinned with a particle blob; `CogniateLyraReveal` then pins separately with a video. Hard pinch-cut at the section boundary, no morphological or visual continuity.

## Resolutions (decisions)

- **Crossfade between two pinned sections.** No structural refactor: `CogniateStory` and `CogniateLyraReveal` stay as siblings with their own pins. Story fades its full tableau out at the very end of its scroll; Reveal fades its video in at the very start of its scroll. The hand-off is invisible.
- **Centred near-square video, edge-masked.** `width: clamp(760px, 60vw, 1100px)`, height auto preserves the native 1.21:1 aspect. Radial-gradient mask on the video element fades all four edges into `bg-secondary` so no rectangular boundary is visible.
- **Typeset Lyra overlays the dust-Lyra at the same screen position.** As the dust resolves at the end of the video, the typeset wordmark fades in directly over it; the video then dims to ~0.3 opacity behind. The dust *becomes* the wordmark.
- **Tagline and "Create. Design. Publish" sit below the video** in the gradient-bridge zone. Their reveal stays scroll-driven; halo readability isn't needed for them because the lower viewport is already gradient-shaded into pure `bg-secondary`.
- **Vertical gradient bridge from video bottom into `<HowItWorks />`.** No hard seam between sections.

## Hand-off mechanic (the crossfade)

In `CogniateStory.tsx`, the existing rAF loop already drives `--logo-opacity`, `--icon-*-opacity`, and `--tooltip-pointer` off `progressRef`. Add one more variable on the desktop wrapper:

```ts
desktop.style.setProperty(
  "--story-fadeout",
  String(ramp(p, 0.92, 1.0, 1, 0))
);
```

Apply that variable as `opacity` on:

- The particle Canvas wrapper (`.pointer-events-none.absolute.inset-0` around `<ParticleSwarm />`).
- The icon/logo layer (a new wrapper div around the four absolutely-positioned children inside `.story-circles-container`, **excluding** the SVG concentric circles which can stay or fade with the rest — TBD during implementation).

By the time `CogniateStory`'s pin releases at progress 1.0, the particle layer + icons + logo are all at opacity 0. The dark `bg-secondary` is what's visible.

Reveal's pin then fires immediately on the next pixel of scroll (sibling sections, no gap). Reveal's `progressRef` rAF loop adds:

```ts
wrapper.style.setProperty(
  "--video-opacity",
  String(ramp(p, 0.0, 0.05, 0, 1))
);
```

Applied as `opacity` on the `<video>` element. The video fades up from 0 at the very start of the pin, then scrubs as before, then dims at the dust→typeset moment.

**Net effect:** particles dissolve to dark → ~0 frames of pure `bg-secondary` → video fades in. The eye reads it as a soft wipe, not a pinch-cut. No shared state between sections, no shape-matching, no risk of regression.

## Layout (Reveal section)

```
┌─────────────────────────────────────────────┐
│                                             │  ← top breathing room (~10vh)
│        ┌───────────────────────┐            │
│        │ ░░ video (clamp 760– │            │  ← centred horizontally,
│        │  1100px wide) ░░░░░░ │               upper-mid vertically
│        │ ░ dust→typeset Lyra ░│            │
│        └─░─░─░─░─░─░─░─░─░─░─┘            │  ← edges feathered via mask
│                                             │
│            ┌──── halo ────┐                 │  ← blurred dark ellipse
│            │   Lyra®      │                 │     behind typeset only
│            └──────────────┘                 │     (overlays video bottom)
│                                             │
│   Your AI assistant to help you...          │  ← tagline, in gradient zone
│                                             │
│   Create.   Design.   Publish               │  ← biggest breathing room
│                                             │
│            ↓ gradient fade ↓                │
└─────────────────────────────────────────────┘
                continues into <HowItWorks />
```

### Video

```css
.lyra-video {
  width: clamp(760px, 60vw, 1100px);
  height: auto;          /* preserves 1.21:1 native aspect */
  object-fit: contain;   /* no crop — show the full frame */
  /* edge mask: feather all four sides into bg-secondary */
  mask-image: radial-gradient(
    ellipse 70% 70% at 50% 50%,
    black 45%,
    transparent 100%
  );
  -webkit-mask-image: radial-gradient(
    ellipse 70% 70% at 50% 50%,
    black 45%,
    transparent 100%
  );
  opacity: var(--video-opacity, 0);
}
```

Position: absolutely centred horizontally, top anchored at ~10vh from the section top so there's breathing room above. The vertical centring of the typeset Lyra (described below) is matched to where the dust-Lyra resolves *within the video frame*, not to the viewport.

Mobile (`<lg`): `width: min(90vw, 600px)`. Same edge mask. No pin (existing fallback path).

### Typeset Lyra (overlay)

Sized and positioned to sit directly over where the dust-Lyra resolves in the final video frame. Specs unchanged from v1:

```css
.lyra-wordmark {
  font-family: var(--font-sans);     /* Geist */
  font-weight: 700;
  font-size: clamp(64px, 7vw, 96px);
  line-height: 1.1;
  letter-spacing: -0.04em;
  background: linear-gradient(164.7deg, #ffffff 3%, rgb(146, 100, 205) 98%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  /* reveal */
  opacity: var(--lyra-opacity, 0);
  transform: translateY(var(--lyra-y, 16px));
  filter: blur(var(--lyra-blur, 2px));
}
```

The `<sup>®</sup>` stays as-is (`font-weight: 300; font-size: 0.557em`).

**Position alignment with dust-Lyra:** during implementation, capture a still frame at progress=0.78 (the moment the dust is fully resolved) and overlay the typeset wordmark in dev tools to dial in `top` exactly. Document the resulting offset as a named constant (e.g. `LYRA_TOP_VH = 38`).

### Halo (behind typeset Lyra only)

```css
.lyra-halo {
  position: absolute;
  width: clamp(420px, 45vw, 600px);
  height: clamp(180px, 18vw, 280px);
  /* sized to envelop the wordmark + a margin */
  background: radial-gradient(
    ellipse 50% 50% at 50% 50%,
    rgba(0, 0, 0, 0.85) 0%,
    transparent 70%
  );
  filter: blur(40px);
  opacity: var(--lyra-opacity, 0);   /* same ramp as wordmark */
  pointer-events: none;
}
```

Centred behind the typeset Lyra. Shares `--lyra-opacity` so it never appears empty.

Tagline + CDP do **not** get individual halos — they live in the gradient-bridge zone where contrast is fine.

### Tagline + "Create. Design. Publish"

Specs unchanged from v1. Both sit below the video in normal flow within the absolutely-positioned text stack. Their reveal animation (opacity, y, blur ramps) is unchanged.

### Gradient bridge

The lower ~35% of the Reveal section gets a gradient overlay:

```css
.lyra-bridge {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  height: 35%;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    var(--color-bg-secondary) 70%
  );
  pointer-events: none;
}
```

This pulls the video's bottom edge into the dark background and creates a continuous fade through the text region into HowItWorks. Since `bg-secondary = #101011` and HowItWorks uses `#111112` (effectively identical), no complementary gradient on HowItWorks is needed; the section seam is invisible without one.

If during implementation the seam *does* read at all, add an 80px-tall complementary fade strip at HowItWorks's top: `background: linear-gradient(to bottom, var(--color-bg-secondary), transparent);`. This is an implementation-time call, not a design commitment.

## Choreography (updated TIMING table)

Replaces the v1 `TIMING` constants in `CogniateLyraReveal.tsx:80-88`.

| Beat | Range (progress 0..1) | Output |
|---|---|---|
| Video fade-in | 0.00 → 0.05 | `--video-opacity` 0 → 1 |
| Video scrub | 0.05 → 0.78 | `currentTime = ((p − 0.05) / 0.73) × duration` |
| Lyra wordmark + halo | 0.72 → 0.80 | `--lyra-opacity` 0 → 1, `--lyra-y` 16 → 0, `--lyra-blur` 2 → 0 |
| Video dim | 0.80 → 0.88 | `--video-opacity` 1 → 0.3 (recedes behind typeset) |
| Tagline | 0.82 → 0.88 | same shape as wordmark |
| "Create." | 0.88 → 0.92 | same shape, per word |
| "Design." | 0.92 → 0.96 | same |
| "Publish" | 0.96 → 1.00 | same |

`PIN_DISTANCE` stays at `+=250%`. Real text-reveal range (Lyra → Publish) is ~0.50 of pin = ~1.25 viewports of scroll. Comfortable scrubbing pace.

```ts
const TIMING = {
  PIN_DISTANCE: "+=250%",
  VIDEO_FADE_IN: [0.00, 0.05] as const,
  VIDEO_SCRUB_START: 0.05,
  VIDEO_SCRUB_END: 0.78,
  VIDEO_DIM: [0.80, 0.88] as const,         // 1 → 0.3
  LYRA: [0.72, 0.80] as const,
  TAGLINE: [0.82, 0.88] as const,
  WORD_CREATE: [0.88, 0.92] as const,
  WORD_DESIGN: [0.92, 0.96] as const,
  WORD_PUBLISH: [0.96, 1.00] as const,
} as const;
```

## File-level changes

- **MODIFY**: `app/sections/CogniateStory.tsx`
  - Add `--story-fadeout` variable to the rAF loop.
  - Wrap particle Canvas + icon layer so they share the variable as `opacity`.
- **MODIFY**: `app/sections/CogniateLyraReveal.tsx`
  - Replace v1 layout (62vh video band + 38vh text band) with centred video + overlay typeset Lyra + below-text-stack + gradient bridge.
  - Update `TIMING` to the new table.
  - Add `--video-opacity` ramp + apply on video.
  - Add `.lyra-halo` element behind typeset Lyra.
  - Add edge mask + new sizing on video.
  - Add gradient-bridge overlay div.
- **MODIFY**: `tests/visual/cogniate-lyra-reveal.spec.ts`
  - Update the four `?lyraProgress=` resting states to match the new timings: 0.0, 0.40, 0.80, 1.0 (was 0.0, 0.40, 0.83, 1.0).
- **NO CHANGE**: video asset, poster, HowItWorks, page mounting order.

## Things to verify during implementation

These are checks, not unresolved design questions:

1. **Lyra position alignment.** Capture a still at progress=0.78 in `?lyraProgress=` mode, overlay the typeset wordmark, dial in the exact vertical offset.
2. **Mask radius.** `ellipse 70% 70%` may be too aggressive if the dust-Lyra extends close to the video frame edge. Check the last frame; widen to 80% if dust gets clipped.
3. **HowItWorks seam.** Walk the boundary in dev tools after the gradient bridge is in. If the seam reads, add the complementary 80px strip on HowItWorks's top.
4. **Story fadeout coverage.** Confirm the wrapper(s) chosen for `--story-fadeout` cover everything visually: particles, icons, logo, tooltips. Concentric-circles SVG can fade or stay — pick whichever reads better in motion (probably fade, for consistency).
5. **Pin sequencing on real scroll.** Story unpin → Reveal pin should be a single scroll tick. If there's any visible gap, tighten Reveal's `start` (e.g. `start: "top bottom-=1"` to fire one pixel earlier).

## Out of scope (deferred from v1)

- The radial-gradient mask on "Create. Design. Publish" stays dropped (solid white). Same trade-off as v1 — per-word transforms defeat the parent's `background-clip: text`. Revisit only if visual review flags it.
- No change to `CogniateStory`'s 4-phase choreography. Only the new fadeout variable is additive.
- No change to mobile fallbacks beyond resizing the video.

## Implementation gate

This is a design doc. **No code changes until an implementation plan exists** — the next step is `superpowers:writing-plans` to produce a step-by-step plan with verification points, then `superpowers:executing-plans` to apply it.
