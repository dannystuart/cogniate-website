"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Frame sequence — the dust→Lyra transformation is shipped as 151 WebP stills
// (~7MB total) instead of an H.264 video. The H.264 export had only 6 keyframes
// across 757 frames, so every scroll-driven `currentTime` write meant decoding
// up to ~125 frames before painting — the source of the original jerk. Canvas
// + a pre-decoded image array makes every paint O(1).
const FRAME_COUNT = 151;
const FRAME_W = 1280;
const FRAME_H = 1056;
const frameSrc = (i: number) =>
  `/assets/lyra-scrub/frame-${String(i + 1).padStart(3, "0")}.webp`;

// Linear ramp from `(fromIn → fromOut)` of progress to `(toIn → toOut)` of value,
// clamped at the ends. Drives every text reveal CSS variable.
function ramp(p: number, fromIn: number, fromOut: number, toIn: number, toOut: number): number {
  if (p <= fromIn) return toIn;
  if (p >= fromOut) return toOut;
  const t = (p - fromIn) / (fromOut - fromIn);
  return toIn + (toOut - toIn) * t;
}

// Mobile + reduced-motion path: no pin, no scrub. Paints the final frame as a
// static destination image and runs the GSAP text-stagger timeline. The full
// dust transformation is reserved for the desktop scroll experience.
function setupNonPinnedReveal(
  section: HTMLElement,
  wrapper: HTMLDivElement,
  paintFinalFrame: () => void
) {
  wrapper.style.setProperty("--video-opacity", "1");
  paintFinalFrame();

  gsap
    .timeline({
      scrollTrigger: { trigger: section, start: "top 70%", toggleActions: "play none none none" },
    })
    .fromTo(
      wrapper.querySelector(".lyra-wordmark"),
      { opacity: 0, y: 16, filter: "blur(2px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "power2.out" }
    )
    .fromTo(
      wrapper.querySelector(".lyra-tagline"),
      { opacity: 0, y: 16, filter: "blur(2px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "power2.out" },
      "-=0.4"
    )
    .fromTo(
      wrapper.querySelectorAll(".lyra-cdp [data-word]"),
      { opacity: 0, y: 16, filter: "blur(2px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.5,
        ease: "power2.out",
        stagger: 0.15,
      },
      "-=0.3"
    );
}

// Single source of truth for everything tunable.
// To slow the scrub: bump PIN_DISTANCE.
// To delay text reveals: push the WORD_*/LYRA/TAGLINE ranges higher.
const TIMING = {
  PIN_DISTANCE: "+=220%",
  // Canvas fade-out range. Starts BEFORE the scrub ends (0.50 vs 0.60) so the
  // dust keeps advancing during the first ~0.10 of the fade — avoids the
  // "freeze, then fade" feel. By the time the scrub parks on the final frame,
  // the canvas is already two-thirds of the way to invisible.
  // The fade-IN is not a Reveal-driven ramp — the canvas crossfades in as
  // CogniateStory's --story-fadeout drops from 1 to 0.
  VIDEO_FADE_OUT: [0.5, 0.65] as const, // 1 → 0
  // Scrub window — frame index maps from progress 0.0 → 0.60 onto frame 0 →
  // FRAME_COUNT-1. 60% of a 220% pin = 132vh of scroll for ~151 frames =
  // ~0.87px per frame change at 1080p — visually continuous.
  VIDEO_SCRUB_START: 0.0,
  VIDEO_SCRUB_END: 0.6,
  // Text reveals — LYRA only starts after VIDEO_FADE_OUT completes (0.65)
  // with a small dark beat between, so the typeset wordmark never overlaps
  // with a still-visible dust-Lyra.
  LYRA: [0.73, 0.81] as const,
  TAGLINE: [0.79, 0.86] as const,
  WORD_CREATE: [0.87, 0.91] as const,
  WORD_DESIGN: [0.91, 0.95] as const,
  WORD_PUBLISH: [0.95, 1.0] as const,
} as const;

// Vertical position of the typeset wordmark. The full stack (wordmark →
// tagline → CDP) is composed so its centroid sits near viewport centre —
// wordmark above centre, tagline + CDP just below.
const LYRA_TOP_VH = 35;

// Top edge of the tagline + CDP block, sitting just below the wordmark.
const LOWER_TEXT_TOP_VH = 45;

export default function CogniateLyraReveal() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinWrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const lastDrawnIdxRef = useRef(-1);
  const progressRef = useRef(0);

  // Preload the frame sequence on mount. On mobile / reduced-motion we only
  // need the final frame (static destination image), so we skip the bulk
  // download. On desktop we eagerly fetch all 151 frames so the scrub never
  // catches an undecoded frame mid-scroll.
  useEffect(() => {
    const isDesktop =
      typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;
    const reduced =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fullPreload = isDesktop && !reduced;

    const indices = fullPreload
      ? Array.from({ length: FRAME_COUNT }, (_, i) => i)
      : [FRAME_COUNT - 1];

    const frames = framesRef.current;
    for (const i of indices) {
      if (frames[i]) continue;
      const img = new Image();
      img.decoding = "async";
      img.src = frameSrc(i);
      frames[i] = img;
    }

    return () => {
      framesRef.current = [];
      lastDrawnIdxRef.current = -1;
    };
  }, []);

  // Paint the frame at `idx` to the canvas. If that frame hasn't decoded yet,
  // walk backward to the nearest loaded frame, then forward — guarantees a
  // paint as long as ANY frame has loaded. Skips redundant draws when the
  // index hasn't changed since the last paint.
  const drawFrame = (idx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const target = Math.max(0, Math.min(FRAME_COUNT - 1, idx));

    let chosen = -1;
    if (framesRef.current[target]?.naturalWidth) {
      chosen = target;
    } else {
      for (let i = target - 1; i >= 0; i--) {
        if (framesRef.current[i]?.naturalWidth) {
          chosen = i;
          break;
        }
      }
      if (chosen === -1) {
        for (let i = target + 1; i < FRAME_COUNT; i++) {
          if (framesRef.current[i]?.naturalWidth) {
            chosen = i;
            break;
          }
        }
      }
    }
    if (chosen === -1) return;
    if (chosen === lastDrawnIdxRef.current) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    const img = framesRef.current[chosen];
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    lastDrawnIdxRef.current = chosen;
  };

  useEffect(() => {
    const section = sectionRef.current;
    const wrapper = pinWrapperRef.current;
    if (!section || !wrapper) return;

    const ctx = gsap.context(() => {
      // Dev-only test hook: ?lyraProgress=0.85 forces progressRef and skips
      // the pin so Playwright can snapshot resting states deterministically.
      // Mirrors CogniateStory's ?particleProgress= flag. Gated on NODE_ENV
      // so it's stripped from production bundles.
      if (process.env.NODE_ENV !== "production") {
        const forced = new URL(window.location.href).searchParams.get("lyraProgress");
        if (forced !== null) {
          const v = Math.max(0, Math.min(1, parseFloat(forced)));
          progressRef.current = v;
          // Paint the canvas at the frame this progress maps to, as soon as
          // its image is ready. Mirrors the rAF loop's frame mapping below.
          const span = TIMING.VIDEO_SCRUB_END - TIMING.VIDEO_SCRUB_START;
          const tNorm = Math.min(Math.max((v - TIMING.VIDEO_SCRUB_START) / span, 0), 1);
          const idx = Math.min(FRAME_COUNT - 1, Math.floor(tNorm * FRAME_COUNT));
          const paint = () => drawFrame(idx);
          const img = framesRef.current[idx];
          if (img && img.naturalWidth) {
            paint();
          } else if (img) {
            img.addEventListener("load", paint, { once: true });
          }
          return; // skip both the non-pinned path and the pinned ScrollTrigger
        }
      }

      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Mobile or reduced motion → no pin, no scrub. Paints the final frame
      // statically and runs the text-stagger GSAP timeline.
      if (!isDesktop || reduced) {
        const paintFinalFrame = () => {
          const finalImg = framesRef.current[FRAME_COUNT - 1];
          if (finalImg && finalImg.naturalWidth) {
            drawFrame(FRAME_COUNT - 1);
          } else if (finalImg) {
            finalImg.addEventListener("load", () => drawFrame(FRAME_COUNT - 1), { once: true });
          }
        };
        setupNonPinnedReveal(section, wrapper, paintFinalFrame);
        return;
      }

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

  // rAF loop — reads progressRef each frame, redraws the canvas (only when the
  // frame index changes) and updates text-reveal CSS variables. Skipped on
  // mobile + reduced-motion: those paths use a GSAP timeline that writes inline
  // styles directly, and the canvas is already parked on the final frame.
  useEffect(() => {
    const wrapper = pinWrapperRef.current;
    if (!wrapper) return;

    const isTestMode =
      process.env.NODE_ENV !== "production" &&
      new URL(window.location.href).searchParams.has("lyraProgress");
    if (!isTestMode) {
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!isDesktop || reduced) return;
    }

    let rafId = 0;
    let stopped = false;

    // CogniateStory's rAF loop sets --story-fadeout on document.documentElement
    // so Reveal's canvas can read it without traversing ScrollTrigger's
    // pin-spacer wrapping around Story's wrapper. Reveal's section is pulled
    // up by 100vh (globals.css) so it overlaps Story's pinSpacer tail, and
    // the canvas sits behind Story's pinned wrapper (z-10) — visible only as
    // Story's tableau fades out (--story-fadeout 1 → 0).
    const root = document.documentElement;

    const tick = () => {
      if (stopped) return;
      if (!document.hidden) {
        const p = progressRef.current;

        // Map progress [VIDEO_SCRUB_START, VIDEO_SCRUB_END] → [0, FRAME_COUNT-1].
        // Outside that window we park on frame 0 or the final frame respectively.
        const span = TIMING.VIDEO_SCRUB_END - TIMING.VIDEO_SCRUB_START;
        const tNorm = Math.min(Math.max((p - TIMING.VIDEO_SCRUB_START) / span, 0), 1);
        const idx = Math.min(FRAME_COUNT - 1, Math.floor(tNorm * FRAME_COUNT));
        drawFrame(idx);

        // Text reveals — opacity, vertical translation, and a subtle blur
        // that sharpens as the word arrives. Each element shares the same
        // shape so a single helper drives all five.
        const setReveal = (name: string, range: readonly [number, number]) => {
          wrapper.style.setProperty(`--${name}-opacity`, String(ramp(p, range[0], range[1], 0, 1)));
          wrapper.style.setProperty(`--${name}-y`, `${ramp(p, range[0], range[1], 16, 0)}px`);
          wrapper.style.setProperty(`--${name}-blur`, `${ramp(p, range[0], range[1], 2, 0)}px`);
        };
        setReveal("lyra", TIMING.LYRA);
        setReveal("tagline", TIMING.TAGLINE);
        setReveal("w-create", TIMING.WORD_CREATE);
        setReveal("w-design", TIMING.WORD_DESIGN);
        setReveal("w-publish", TIMING.WORD_PUBLISH);

        // Canvas opacity — driven by Story's --story-fadeout for the crossfade-in
        // (canvas appears as Story's tableau fades out, 1 → 0), and by Reveal's
        // own VIDEO_FADE_OUT for the dim-out (1 → 0 over the late progress
        // window). Outside both ramps: 0 before Story starts fading, 1 between,
        // 0 after Reveal's fade-out completes. Math.max guards against negative
        // values when both contribute (e.g. test-mode edge cases).
        const storyFadeoutStr = root.style.getPropertyValue("--story-fadeout");
        const storyFadeout = storyFadeoutStr ? parseFloat(storyFadeoutStr) : 1;
        const crossfadeIn = 1 - (Number.isFinite(storyFadeout) ? storyFadeout : 1);
        const videoFadeOut = ramp(p, TIMING.VIDEO_FADE_OUT[0], TIMING.VIDEO_FADE_OUT[1], 0, 1);
        wrapper.style.setProperty(
          "--video-opacity",
          String(Math.max(0, crossfadeIn - videoFadeOut))
        );
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      stopped = true;
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      data-testid="cogniate-lyra-reveal"
      className="relative w-full bg-bg-secondary overflow-hidden"
    >
      <div ref={pinWrapperRef} className="relative min-h-screen w-full">
        {/* Canvas — full viewport, object-cover via intrinsic dimensions. The
            source frames already have dark edges baked into their gradient, so
            they blend into bg-secondary without an explicit mask. Fades fully
            out before the typeset wordmark arrives, so no edge-readability
            concerns at the wordmark beat. */}
        <canvas
          ref={canvasRef}
          width={FRAME_W}
          height={FRAME_H}
          className="lyra-canvas absolute inset-0 size-full"
          style={{ objectFit: "cover", opacity: "var(--video-opacity, 0)" }}
        />

        {/* Halo — soft dark blurred ellipse behind the wordmark. Subtle on
            bg-secondary (dark on dark) but adds depth + visual weight when the
            wordmark fades in. Shares --lyra-opacity so it tracks the wordmark
            and never appears empty. */}
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

        {/* Typeset wordmark — fades in at viewport centre after the canvas has
            fully faded out, so it lands in clean dark space where the dust-Lyra
            used to resolve. Outer div owns horizontal/vertical centring so the
            inner <h2> can drive its Y reveal with a clean translateY (matches
            the halo + tagline pattern). */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ top: `${LYRA_TOP_VH}vh` }}
        >
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
              opacity: "var(--lyra-opacity, 0)",
              transform: "translateY(var(--lyra-y, 16px))",
              filter: "blur(var(--lyra-blur, 2px))",
            }}
          >
            Lyra
            <sup style={{ fontWeight: 300, fontSize: "0.557em", verticalAlign: "super" }}>
              ®
            </sup>
          </h2>
        </div>

        {/* Tagline + CDP — sit just below the wordmark in the upper third, so
            the whole stack reads as one block. Stacked absolutely so they don't
            push other elements; centred horizontally. */}
        <div
          className="pointer-events-none absolute inset-x-0 flex flex-col items-center"
          style={{ top: `${LOWER_TEXT_TOP_VH}vh` }}
        >
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

        {/* Gradient bridge — softens the lower viewport into bg-secondary so
            the tagline + CDP text sits in a dark gradient zone. With the canvas
            fading fully to 0 before the wordmark beat, this is mostly cosmetic
            (no rectangular edge to feather away from), but it deepens the
            section's lower band and makes the seam into HowItWorks invisible. */}
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
    </section>
  );
}
