# Scroll-scrubbed video on canvas (frame-sequence pattern)

A portable recipe for "as the user scrolls, a video plays through" — the technique used by `app/sections/CogniateLyraReveal.tsx` to scrub the dust → Lyra transformation.

The headline trick: **don't scrub a video, scrub a canvas painted from a pre-decoded image array.**

---

## Why not a `<video>` with `currentTime`?

Writing `video.currentTime = X` on each scroll frame *seems* like the obvious approach. It is also the source of the original jerk this pattern was built to fix.

H.264 / VP9 / AV1 are inter-frame codecs. A frame is encoded as a delta from a nearby keyframe (I-frame). When you seek to time `t`, the decoder must:

1. Find the keyframe at or before `t`.
2. Decode every intermediate P/B-frame up to `t`.
3. Paint.

Our original H.264 export had **6 keyframes across 757 frames** — so a single scrub tick could mean decoding ~125 frames before painting. That is the jerk.

You can fix it at the encoder (force every frame to be a keyframe → file balloons) or you can sidestep the codec entirely.

## The sidestep: frame sequence + canvas

- Export the video as N WebP stills.
- Preload them as `Image` objects on mount.
- Map scroll progress → frame index.
- `ctx.drawImage(images[idx], …)` on every rAF tick.

Every paint is now O(1). 151 WebP frames at 1920×1586 came out to ~7 MB total — comparable to a short H.264 clip — and the result is glass-smooth.

---

## Asset pipeline

### 1. Choose frame count

Aim for ~0.5–1 px of visible movement per frame at the scroll rate the user will produce. For our pin (`+=220%` of viewport on a ~1080px tall viewport, scrub window = 60% of pin):

```
scrub distance = 1080 * 2.2 * 0.6 ≈ 1425 px
frames needed  = scrub distance / desired_px_per_frame
              ≈ 1425 / ~10  ≈ 140 frames
```

We shipped 151. More frames = smoother + bigger payload. Below ~80 you start seeing stepping on fast scrolls.

### 2. Export WebP stills with ffmpeg

```bash
mkdir -p public/assets/lyra-scrub
ffmpeg -i source.mp4 \
  -vf "fps=30,scale=1920:-2" \
  -c:v libwebp \
  -quality 80 \
  -compression_level 6 \
  -loop 0 \
  public/assets/lyra-scrub/frame-%03d.webp
```

- Pad to 3 digits (`%03d`) so lexical sort matches numeric — the loader relies on `i.toString().padStart(3, '0')`.
- `quality 80` is the sweet spot for photographic content. Drop to 75 if payload matters more than fidelity; raise to 90 for sharp graphics.
- Sequence-of-WebP beats sequence-of-JPEG by ~30–40% on typical content with no visible loss.
- Bake **dark/light edges into the source frames** if your destination background is solid — saves you a CSS mask layer.

### 3. Note the dimensions

You'll hardcode them into the canvas: `width={FRAME_W} height={FRAME_H}`. This sets the canvas's **internal bitmap size**; CSS still scales it via `size-full object-cover`.

---

## Component anatomy

Three concerns, each in its own `useEffect`:

1. **Preload** — fetch all frames as `Image` objects on mount.
2. **ScrollTrigger** — pin the wrapper, write progress into a ref.
3. **rAF loop** — read the ref, map to frame index, paint.

Plus a single `drawFrame(idx)` helper.

### Preload

```tsx
const FRAME_COUNT = 151;
const frameSrc = (i: number) =>
  `/assets/lyra-scrub/frame-${String(i + 1).padStart(3, "0")}.webp`;

const framesRef = useRef<HTMLImageElement[]>([]);

useEffect(() => {
  const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fullPreload = isDesktop && !reduced;

  // Mobile + reduced-motion paths only need the final frame as a static
  // destination image — skip the bulk download.
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
```

`decoding="async"` lets the browser decode off the main thread. By the time the user has scrolled to the scrub window, the frames are usually decoded; if not, `drawFrame` falls back gracefully (below).

### ScrollTrigger (pin + scrub)

```tsx
const progressRef = useRef(0);

useEffect(() => {
  const ctx = gsap.context(() => {
    ScrollTrigger.create({
      trigger: pinWrapperRef.current!,
      start: "top top",
      end: "+=220%",       // pin distance; bigger = slower scrub
      pin: true,
      scrub: 1,            // smoothing in seconds; 1 = ~1s catch-up
      onUpdate: (self) => {
        progressRef.current = self.progress;  // 0..1
      },
    });
  }, sectionRef);
  return () => ctx.revert();
}, []);
```

Critical: **write progress to a ref, not to React state.** State updates re-render at scroll rate and tank performance.

### rAF loop (paint + CSS variables)

```tsx
useEffect(() => {
  let rafId = 0;
  let stopped = false;

  const tick = () => {
    if (stopped) return;
    if (!document.hidden) {
      const p = progressRef.current;

      // Map progress [0, 0.6] → [0, FRAME_COUNT-1]. Outside that window we
      // park on frame 0 or final frame.
      const span = 0.6 - 0.0;
      const tNorm = Math.min(Math.max(p / span, 0), 1);
      const idx = Math.min(FRAME_COUNT - 1, Math.floor(tNorm * FRAME_COUNT));
      drawFrame(idx);

      // Drive any other CSS variables off the same `p` here — text reveals,
      // crossfades, etc. — so everything stays phase-locked to the scrub.
    }
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);

  return () => { stopped = true; cancelAnimationFrame(rafId); };
}, []);
```

`document.hidden` skips work when the tab is backgrounded.

### `drawFrame` — the fallback walk

```tsx
const lastDrawnIdxRef = useRef(-1);

const drawFrame = (idx: number) => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const target = Math.max(0, Math.min(FRAME_COUNT - 1, idx));

  // Find the closest already-loaded frame: target → walk backward → walk forward.
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
  if (chosen === lastDrawnIdxRef.current) return; // skip redundant draws

  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return;
  ctx.drawImage(framesRef.current[chosen], 0, 0, canvas.width, canvas.height);
  lastDrawnIdxRef.current = chosen;
};
```

Two performance moves baked in:

- **Backward-then-forward walk** — guarantees a paint as long as *any* frame has decoded; the user sees a slightly stale frame instead of a black canvas.
- **`lastDrawnIdxRef` skip** — the rAF loop runs at 60 Hz but the frame index only changes ~30 times per scrub; this skips ~half the redundant `drawImage` calls.
- **`alpha: false`** — opaque canvas, fewer compositor passes.

### Canvas markup

```tsx
<canvas
  ref={canvasRef}
  width={1920}
  height={1586}                                 /* internal bitmap */
  className="absolute inset-0 size-full"        /* CSS sizing */
  style={{ objectFit: "cover", opacity: "var(--video-opacity, 0)" }}
/>
```

`width`/`height` set the bitmap. The Tailwind classes scale it visually. `objectFit: "cover"` makes it behave like `<img>`/`<video>` for letterboxing.

---

## Tuning (the timing object)

Centralize every magic number so the doc-of-record is the code:

```tsx
const TIMING = {
  PIN_DISTANCE: "+=220%",
  VIDEO_SCRUB_START: 0.0,        // scrub window within the pin
  VIDEO_SCRUB_END:   0.6,
  VIDEO_FADE_OUT:    [0.5, 0.65] as const,  // canvas opacity 1→0
  LYRA:              [0.73, 0.81] as const, // first text reveal
  // …more reveals
};
```

Two levers worth knowing:

- **Bump `PIN_DISTANCE`** to slow the whole sequence (more scroll per progress unit).
- **Push the scrub window's upper bound below 1.0** to reserve the tail of the pin for follow-up beats (text reveals, crossfades). Our scrub finishes at 0.6 — the remaining 40% of pin distance plays the wordmark/tagline reveal *while the canvas is already parked on its final frame.*

Use a `ramp` helper for everything else:

```ts
function ramp(p: number, fromIn: number, fromOut: number, toIn: number, toOut: number) {
  if (p <= fromIn) return toIn;
  if (p >= fromOut) return toOut;
  const t = (p - fromIn) / (fromOut - fromIn);
  return toIn + (toOut - toIn) * t;
}
```

Then drive any DOM property off CSS variables written from the rAF loop:

```ts
wrapper.style.setProperty("--lyra-opacity", String(ramp(p, 0.73, 0.81, 0, 1)));
```

The DOM nodes consume those vars in inline styles. No re-renders, no GSAP timelines fighting the scrub.

---

## Mobile / reduced-motion fallback

Pinned scroll-scrubs are a desktop affordance. On mobile and `prefers-reduced-motion`, do the cheap thing:

- Don't preload all 151 frames. Just the last one.
- Don't pin. Don't scrub.
- Paint the final frame as a static destination image.
- Run a normal GSAP timeline for any text reveals, triggered by `start: "top 70%"`.

```tsx
if (!isDesktop || reduced) {
  const finalImg = framesRef.current[FRAME_COUNT - 1];
  if (finalImg?.naturalWidth) drawFrame(FRAME_COUNT - 1);
  else finalImg?.addEventListener("load", () => drawFrame(FRAME_COUNT - 1), { once: true });

  gsap.timeline({ scrollTrigger: { trigger: section, start: "top 70%" } })
    .fromTo(".wordmark",  { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 })
    .fromTo(".tagline",   { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.2");
  return;
}
```

This keeps mobile bundles ~7 MB lighter and respects accessibility.

---

## Test hook (Playwright snapshots)

The whole pin/scrub thing is hostile to deterministic visual tests. Add a dev-only query-string hook that forces a progress value and skips the pin:

```tsx
if (process.env.NODE_ENV !== "production") {
  const forced = new URL(window.location.href).searchParams.get("lyraProgress");
  if (forced !== null) {
    const v = Math.max(0, Math.min(1, parseFloat(forced)));
    progressRef.current = v;

    // Paint the canvas at the right frame as soon as the image is ready.
    const idx = Math.min(FRAME_COUNT - 1, Math.floor(v * FRAME_COUNT));
    const paint = () => drawFrame(idx);
    const img = framesRef.current[idx];
    if (img?.naturalWidth) paint();
    else img?.addEventListener("load", paint, { once: true });
    return; // skip the ScrollTrigger
  }
}
```

`process.env.NODE_ENV !== "production"` gates it out of production bundles. Playwright then visits `/?lyraProgress=0.55` and snapshots a deterministic resting state.

---

## Crossfading from a previous pinned section

If the previous section is *also* pinned (and ScrollTrigger has wrapped it in a pin-spacer), local CSS variables won't reach across the seam. Two options:

1. **Set the shared variable on `document.documentElement`** so the next section's rAF loop can read it from the root.
2. **Pull the next section up by `-100vh`** in CSS so it sits behind the previous section's pin-spacer tail; the canvas is then visible as the previous section's tableau fades to 0.

We use both — see `app/globals.css` (`[data-testid="cogniate-lyra-reveal"] { margin-top: -100vh }`) and `--story-fadeout` set on `documentElement` from the upstream section.

If your reveal is a standalone section with no upstream pin, ignore this entirely.

---

## Pitfalls

- **Don't pad to 4 digits when your loader expects 3.** Or vice versa. The first symptom is a black canvas with no console error — the `Image`s are 404ing silently.
- **Don't use React state for scroll progress.** Re-render storms will eat your frame budget. Refs only.
- **Don't put `drawImage` outside an rAF loop.** Calling it directly from `onUpdate` paints at scroll rate (often >60 Hz on trackpads), wasting work and serializing frame decodes.
- **Don't skip `decoding: "async"`.** Synchronous decode on `Image.src =` blocks the main thread for the first few frames.
- **Watch the bundle.** 151 × ~50 KB = ~7 MB. Anything more than 200 frames at 1920px wide and you should be considering 1440px or fewer frames.
- **Don't preload on mobile.** A 7 MB blocking download on cellular is unacceptable. The mobile path here loads exactly one frame.

---

## Adapting to a different video

1. Export the source as a numbered WebP sequence. Match dimensions and frame count to your scroll budget.
2. Drop the sequence into `public/assets/<your-name>/frame-001.webp …`.
3. Copy `CogniateLyraReveal.tsx` and replace:
   - `FRAME_COUNT`, `FRAME_W`, `FRAME_H`, `frameSrc(i)`.
   - `TIMING` ranges to match your scroll budget and the reveals you want layered on top.
   - The DOM children (wordmark, tagline, halos) — or strip them and ship just the canvas.
4. Decide whether you need the `--story-fadeout` crossfade-in or a simple opacity ramp from `progressRef`.
5. Add a test hook for whatever query-string name you like.

That's it.

---

## File reference (this repo)

- `app/sections/CogniateLyraReveal.tsx` — the canvas-scrub component.
- `app/sections/CogniateStory.tsx` — upstream pinned section that hands off via `--story-fadeout`.
- `app/globals.css` (line ~952) — the `-100vh` overlap that makes the crossfade visible.
- `public/assets/lyra-scrub/frame-001.webp` … `frame-151.webp` — the frame sequence.
