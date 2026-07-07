# Scroll-scrubbed video on canvas (frame-sequence pattern)

A project-agnostic recipe for "as the user scrolls, a video plays through." Works with any React + GSAP project. The headline trick:

**Don't scrub a `<video>`. Scrub a `<canvas>` painted from a pre-decoded `Image[]`.**

---

## TL;DR — copy-paste AI prompt

Paste this into Claude / Cursor / Copilot Chat after dropping your source video into the project. It bundles the rationale, asset pipeline, and acceptance criteria.

````
I want a scroll-scrubbed video reveal on this page. As the user scrolls through
a pinned section, a short video should play through frame-by-frame, locked to
their scroll position.

Source video: <PATH-OR-FILENAME-OF-MP4>
Target component file: <PATH-WHERE-COMPONENT-SHOULD-LIVE>.tsx
Public asset folder: public/assets/<NAME>-scrub/
Total scroll length for the scrub: feels right at ~2–4 seconds of normal scroll
Mobile behaviour: paint the final frame statically, no scrub
Reduced-motion behaviour: same as mobile

Implement using the "frame-sequence on canvas" pattern, NOT a <video> element
with currentTime writes. The reasoning: H.264/VP9 inter-frame codecs require
decoding from the nearest keyframe, which causes stutter on scrub. Painting
pre-decoded WebP stills to a canvas makes every paint O(1).

Pipeline:
1. Convert the source video to a numbered WebP sequence (~120–160 frames,
   1920px wide, quality ~80) into the public asset folder. Use:
     ffmpeg -i <SOURCE> -vf "fps=30,scale=1920:-2" \
       -c:v libwebp -quality 80 -compression_level 6 -loop 0 \
       public/assets/<NAME>-scrub/frame-%03d.webp
   Tell me the frame count and dimensions afterward — I'll need them in code.

2. Create the component with three useEffects, each with one job:
   a) PRELOAD all frames as Image objects (decoding="async") on mount.
      Mobile/reduced-motion only loads the final frame.
   b) SCROLLTRIGGER: pin the wrapper, scrub: 1, write self.progress to a
      useRef (NOT useState — re-renders kill perf).
   c) rAF LOOP: read the ref, map progress -> frame index, call drawFrame(idx).

3. drawFrame(idx) must:
   - Skip if idx === lastDrawnIdxRef.current (avoid redundant draws).
   - If the target frame's Image.naturalWidth is 0 (still decoding), walk
     backward to find the nearest decoded frame, then forward as fallback.
   - Use ctx = canvas.getContext("2d", { alpha: false }).

4. Centralize all magic numbers in a TIMING object with named ranges:
     PIN_DISTANCE: "+=220%"   // pin length
     SCRUB:        [0.0, 0.6] // map progress window onto frames
     ...plus any text-reveal ranges layered on top.

5. Provide a dev-only test hook: ?<name>Progress=0.55 forces progressRef to
   the given value and skips the pin. Gate it behind
   process.env.NODE_ENV !== "production".

6. Mobile (<1024px) and prefers-reduced-motion: skip the pin and the bulk
   preload entirely. Paint the final frame as a static destination image.
   Run any text reveals via a normal GSAP timeline triggered at "top 70%".

Acceptance:
- Smooth scrub at 60fps on a mid-range laptop. No black frames mid-scroll.
- Mobile bundle does NOT download all frames (verify in DevTools Network).
- Pause the page (switch tabs); the rAF loop must not burn CPU in background.
- prefers-reduced-motion: reduce yields the static destination image, no pin.

Reference implementation: see docs/scroll-scrub-frame-sequence.md in this
repo if it exists, otherwise follow the spec above verbatim.
````

The rest of this doc explains *why* each instruction is in the prompt, plus drop-in code.

---

## Why not a `<video>` with `currentTime`?

Writing `video.currentTime = X` on each scroll frame *seems* like the obvious approach. It's actually the source of the jerk this pattern was built to fix.

H.264 / VP9 / AV1 are inter-frame codecs. A frame is encoded as a delta from a nearby keyframe (I-frame). When you seek to time `t`, the decoder must:

1. Find the keyframe at or before `t`.
2. Decode every intermediate P/B-frame up to `t`.
3. Paint.

A typical H.264 export has ~6 keyframes across 700+ frames — so a single scrub tick can mean decoding ~125 frames before painting. That's the jerk.

You can fix it at the encoder (force every frame to be a keyframe → file balloons) or you can sidestep the codec entirely.

## The sidestep: frame sequence + canvas

- Export the video as N WebP stills.
- Preload them as `Image` objects on mount.
- Map scroll progress → frame index.
- `ctx.drawImage(images[idx], …)` on every rAF tick.

Every paint is O(1). 150 WebP frames at 1920×1080 land around ~7 MB — comparable to a short H.264 clip — and the result is glass-smooth.

---

## Asset pipeline

### 1. Choose frame count

Aim for ~5–10 px of visible movement per frame at the scroll rate the user will produce. For a pin of `+=220%` of viewport on a ~1080px tall viewport with a scrub window of 60% of pin distance:

```
scrub distance = 1080 * 2.2 * 0.6 ≈ 1425 px
frames needed  = scrub distance / desired_px_per_frame
              ≈ 1425 / 10  ≈ 140 frames
```

~120–160 frames is the sweet spot for most reveals. More = smoother + bigger payload. Below ~80 you start seeing stepping on fast scrolls.

### 2. Export WebP stills with ffmpeg

```bash
mkdir -p public/assets/<name>-scrub
ffmpeg -i source.mp4 \
  -vf "fps=30,scale=1920:-2" \
  -c:v libwebp \
  -quality 80 \
  -compression_level 6 \
  -loop 0 \
  public/assets/<name>-scrub/frame-%03d.webp
```

- Pad to 3 digits (`%03d`) so lexical sort matches numeric — the loader relies on it.
- `quality 80` is the sweet spot for photographic content. Drop to 75 if payload matters more than fidelity; raise to 90 for sharp graphics.
- WebP beats JPEG-sequence by ~30–40% on typical content with no visible loss.
- If your destination background is solid, **bake dark/light edges into the source frames** — saves you a CSS mask layer.

### 3. Note the dimensions

You'll hardcode them into the canvas: `width={FRAME_W} height={FRAME_H}`. This sets the canvas's **internal bitmap size**; CSS still scales it via `width: 100%` / `object-fit: cover`.

---

## Component anatomy

Three concerns, each in its own `useEffect`:

1. **Preload** — fetch all frames as `Image` objects on mount.
2. **ScrollTrigger** — pin the wrapper, write progress into a ref.
3. **rAF loop** — read the ref, map to frame index, paint.

Plus a single `drawFrame(idx)` helper.

### Drop-in component skeleton

```tsx
"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 150;          // <- update after ffmpeg export
const FRAME_W = 1920;             // <- match exported width
const FRAME_H = 1080;             // <- match exported height
const NAME = "myreveal";          // used for asset folder + query string

const frameSrc = (i: number) =>
  `/assets/${NAME}-scrub/frame-${String(i + 1).padStart(3, "0")}.webp`;

const TIMING = {
  PIN_DISTANCE: "+=220%",
  SCRUB: [0.0, 0.6] as const,     // progress window mapped onto frames
} as const;

function ramp(p: number, fromIn: number, fromOut: number, toIn: number, toOut: number) {
  if (p <= fromIn) return toIn;
  if (p >= fromOut) return toOut;
  const t = (p - fromIn) / (fromOut - fromIn);
  return toIn + (toOut - toIn) * t;
}

export default function ScrollScrubReveal() {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const lastDrawnIdxRef = useRef(-1);
  const progressRef = useRef(0);

  // 1. PRELOAD
  useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fullPreload = isDesktop && !reduced;

    const indices = fullPreload
      ? Array.from({ length: FRAME_COUNT }, (_, i) => i)
      : [FRAME_COUNT - 1];

    for (const i of indices) {
      if (framesRef.current[i]) continue;
      const img = new Image();
      img.decoding = "async";
      img.src = frameSrc(i);
      framesRef.current[i] = img;
    }
  }, []);

  // drawFrame helper — used by rAF loop and by the test hook.
  const drawFrame = (idx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const target = Math.max(0, Math.min(FRAME_COUNT - 1, idx));

    let chosen = -1;
    if (framesRef.current[target]?.naturalWidth) {
      chosen = target;
    } else {
      for (let i = target - 1; i >= 0; i--) {
        if (framesRef.current[i]?.naturalWidth) { chosen = i; break; }
      }
      if (chosen === -1) {
        for (let i = target + 1; i < FRAME_COUNT; i++) {
          if (framesRef.current[i]?.naturalWidth) { chosen = i; break; }
        }
      }
    }
    if (chosen === -1) return;
    if (chosen === lastDrawnIdxRef.current) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    ctx.drawImage(framesRef.current[chosen], 0, 0, canvas.width, canvas.height);
    lastDrawnIdxRef.current = chosen;
  };

  // 2. SCROLLTRIGGER (with dev test hook + mobile/reduced-motion fallback)
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const ctx = gsap.context(() => {
      // Dev-only test hook: ?<NAME>Progress=0.55 forces progress and skips pin.
      if (process.env.NODE_ENV !== "production") {
        const forced = new URL(window.location.href).searchParams.get(`${NAME}Progress`);
        if (forced !== null) {
          const v = Math.max(0, Math.min(1, parseFloat(forced)));
          progressRef.current = v;
          const idx = Math.min(FRAME_COUNT - 1, Math.floor(v * FRAME_COUNT));
          const paint = () => drawFrame(idx);
          const img = framesRef.current[idx];
          if (img?.naturalWidth) paint();
          else img?.addEventListener("load", paint, { once: true });
          return;
        }
      }

      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Mobile / reduced-motion: paint final frame, no pin, no scrub.
      if (!isDesktop || reduced) {
        const paintFinal = () => drawFrame(FRAME_COUNT - 1);
        const finalImg = framesRef.current[FRAME_COUNT - 1];
        if (finalImg?.naturalWidth) paintFinal();
        else finalImg?.addEventListener("load", paintFinal, { once: true });
        return;
      }

      ScrollTrigger.create({
        trigger: wrapper,
        start: "top top",
        end: TIMING.PIN_DISTANCE,
        pin: true,
        scrub: 1,
        onUpdate: (self) => { progressRef.current = self.progress; },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // 3. rAF LOOP
  useEffect(() => {
    // Skip on mobile / reduced-motion (the canvas is already parked).
    const isTestMode =
      process.env.NODE_ENV !== "production" &&
      new URL(window.location.href).searchParams.has(`${NAME}Progress`);
    if (!isTestMode) {
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!isDesktop || reduced) return;
    }

    let rafId = 0;
    let stopped = false;

    const tick = () => {
      if (stopped) return;
      if (!document.hidden) {
        const p = progressRef.current;
        const [s, e] = TIMING.SCRUB;
        const tNorm = Math.min(Math.max((p - s) / (e - s), 0), 1);
        const idx = Math.min(FRAME_COUNT - 1, Math.floor(tNorm * FRAME_COUNT));
        drawFrame(idx);

        // Drive any other CSS variables off `p` here — text reveals,
        // crossfades, etc. — so everything stays phase-locked to the scrub.
        // wrapper.style.setProperty("--title-opacity", String(ramp(p, 0.7, 0.8, 0, 1)));
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => { stopped = true; cancelAnimationFrame(rafId); };
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden">
      <div ref={wrapperRef} className="relative min-h-screen w-full">
        <canvas
          ref={canvasRef}
          width={FRAME_W}
          height={FRAME_H}
          className="absolute inset-0 size-full"
          style={{ objectFit: "cover" }}
        />
        {/* Layer your text / overlays here, driven by CSS variables */}
      </div>
    </section>
  );
}
```

---

## Why each piece is the way it is

### Preload — `decoding: "async"`

Lets the browser decode off the main thread. By the time the user has scrolled to the scrub window, the frames are usually decoded; if not, `drawFrame` falls back gracefully (below).

### ScrollTrigger — refs not state

Critical: **write progress to a ref, not to React state.** State updates re-render at scroll rate (often >60 Hz on trackpads) and tank performance. The rAF loop reads the ref instead.

### `scrub: 1`

GSAP smooths the scrub by 1 second of catch-up. Set lower (`0.5`) for snappier response, higher (`2`) for buttery lag.

### `drawFrame` — the fallback walk

The "find nearest decoded frame, target → walk backward → walk forward" guarantees a paint as long as *any* frame has decoded; the user sees a slightly stale frame instead of a black canvas during the first second on a slow connection.

### `lastDrawnIdxRef` skip

The rAF loop runs at 60 Hz but the frame index only changes ~30 times per scrub. Skipping redundant `drawImage` calls roughly halves canvas work.

### `getContext("2d", { alpha: false })`

Tells the browser the canvas is opaque. Fewer compositor passes, sometimes a measurable framerate win.

### `document.hidden` guard in rAF

Skips work when the tab is backgrounded. Without this, rAF can keep firing at reduced rate and burn CPU.

### Canvas markup

```tsx
<canvas
  ref={canvasRef}
  width={1920}
  height={1080}                                /* internal bitmap */
  className="absolute inset-0 size-full"        /* CSS sizing */
  style={{ objectFit: "cover" }}
/>
```

`width`/`height` set the bitmap. CSS scales it visually. `objectFit: "cover"` makes it behave like `<img>`/`<video>` for letterboxing.

---

## Tuning (the TIMING object)

Centralize every magic number so the doc-of-record is the code:

```ts
const TIMING = {
  PIN_DISTANCE: "+=220%",       // bigger = slower scrub
  SCRUB: [0.0, 0.6] as const,   // progress window mapped onto frames
  // Layer text reveals on top:
  TITLE: [0.65, 0.75] as const,
  SUBTITLE: [0.75, 0.85] as const,
};
```

Two levers worth knowing:

- **Bump `PIN_DISTANCE`** to slow the whole sequence (more scroll per progress unit).
- **End `SCRUB` below 1.0** to reserve the tail of the pin for follow-up beats. If `SCRUB[1] = 0.6`, the canvas finishes scrubbing at 60% progress — the remaining 40% of pin distance plays whatever you want layered on top while the canvas is parked on its final frame.

Drive everything else with the `ramp()` helper writing CSS variables from inside the rAF loop:

```ts
wrapper.style.setProperty("--title-opacity", String(ramp(p, 0.65, 0.75, 0, 1)));
wrapper.style.setProperty("--title-y", `${ramp(p, 0.65, 0.75, 16, 0)}px`);
```

The DOM nodes consume those vars in inline styles. No re-renders, no GSAP timelines fighting the scrub.

---

## Mobile / reduced-motion fallback

Pinned scroll-scrubs are a desktop affordance. On mobile and `prefers-reduced-motion`, do the cheap thing:

- Don't preload all frames. Just the last one.
- Don't pin. Don't scrub.
- Paint the final frame as a static destination image.
- Run any text reveals via a normal GSAP timeline triggered at `start: "top 70%"`.

This keeps mobile bundles ~7 MB lighter and respects accessibility.

---

## Test hook (Playwright / visual regression)

The pin + scrub combo is hostile to deterministic visual tests. The skeleton above includes a dev-only query-string hook (`?<NAME>Progress=0.55`) that forces a progress value and skips the pin. `process.env.NODE_ENV !== "production"` strips it from production bundles. Playwright then visits `/?myrevealProgress=0.55` and snapshots a deterministic resting state.

---

## Crossfading from a previous pinned section (optional)

If the previous section is *also* pinned (and ScrollTrigger has wrapped it in a pin-spacer), local CSS variables won't reach across the seam. Two options:

1. **Set the shared variable on `document.documentElement`** so the next section's rAF loop can read it from the root.
2. **Pull the next section up by `-100vh` in CSS** so it sits behind the previous section's pin-spacer tail; the canvas is then visible as the previous section's tableau fades out.

Skip this entirely if your reveal is a standalone section.

---

## Pitfalls

- **Don't pad to 4 digits when your loader expects 3.** Or vice versa. The first symptom is a black canvas with no console error — the `Image`s are 404ing silently.
- **Don't use React state for scroll progress.** Re-render storms eat your frame budget. Refs only.
- **Don't put `drawImage` outside an rAF loop.** Calling it directly from `onUpdate` paints at scroll rate (often >60 Hz on trackpads), serializing frame decodes.
- **Don't skip `decoding: "async"`.** Synchronous decode on `Image.src =` blocks the main thread for the first few frames.
- **Watch the bundle.** 150 × ~50 KB ≈ 7 MB. Anything more than 200 frames at 1920px wide and you should be considering 1440px or fewer frames.
- **Don't preload on mobile.** A 7 MB blocking download on cellular is unacceptable. The skeleton above loads exactly one frame on mobile.
- **Don't forget to register the ScrollTrigger plugin.** `gsap.registerPlugin(ScrollTrigger)` once at module scope.

---

## Adapting to a new project

1. Copy the component skeleton above into `<your-section>.tsx`.
2. Update `FRAME_COUNT`, `FRAME_W`, `FRAME_H`, and `NAME`.
3. Run the ffmpeg export into `public/assets/<NAME>-scrub/`.
4. Tune `TIMING.PIN_DISTANCE` and `TIMING.SCRUB` to taste.
5. Layer text/overlays driven by CSS variables in the rAF loop if you want choreography on top.

For a worked example with text reveals, halos, and cross-section crossfades, see `app/sections/CogniateLyraReveal.tsx` in this repo.
