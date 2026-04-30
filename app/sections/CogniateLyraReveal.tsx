"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Linear ramp from `(fromIn → fromOut)` of progress to `(toIn → toOut)` of value,
// clamped at the ends. Drives every text reveal CSS variable.
function ramp(p: number, fromIn: number, fromOut: number, toIn: number, toOut: number): number {
  if (p <= fromIn) return toIn;
  if (p >= fromOut) return toOut;
  const t = (p - fromIn) / (fromOut - fromIn);
  return toIn + (toOut - toIn) * t;
}

// Mobile + reduced-motion path: no pin, no scrub. Video (if provided) plays
// once when the section enters the viewport; text staggers in via GSAP. Pass
// `null` for `video` to skip playback (reduced-motion stays on the poster).
function setupNonPinnedReveal(
  section: HTMLElement,
  wrapper: HTMLDivElement,
  video: HTMLVideoElement | null
) {
  // On mobile + reduced-motion the video doesn't need the desktop fade/dim
  // envelope — park the variable at 1 so the default of 0 doesn't hide it.
  wrapper.style.setProperty("--video-opacity", "1");

  if (video) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // Autoplay-policy compliant: muted + playsInline. Failures are
            // rare and non-fatal — the poster stays visible if denied.
            void video.play().catch(() => {});
            observer.disconnect();
          }
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(section);
  }

  // Park the CSS variables at their resolved-end values so the rAF loop
  // (which is still active in this branch) doesn't fight the GSAP timeline.
  // The simpler choice: don't run the rAF loop in non-pinned mode. We do
  // that by short-circuiting via the same isDesktop guard in its useEffect.
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

// Vertical position of the typeset wordmark, anchored to where the dust-Lyra
// resolves inside the final video frame. Verified at ?lyraProgress=0.78 on a
// 1728×1080 viewport — typeset centre lands on the dust cursive's visual centre.
const LYRA_TOP_VH = 50;

export default function CogniateLyraReveal() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinWrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef(0);

  // Extract once so Task 7's mask-radius tuning can't drift between the
  // standard and -webkit- prefixed forms.
  const VIDEO_MASK =
    "radial-gradient(ellipse 70% 70% at 50% 50%, black 45%, transparent 100%)";

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
          // rAF loop drives the CSS vars off progressRef, but the video is
          // a separate decode pipeline — prime its currentTime once metadata
          // arrives so the right frame paints without a flash.
          const video = videoRef.current;
          if (video) {
            const seekToForcedFrame = () => {
              // Match the rAF loop's scrub: progress 0.05 → 0.78 maps onto 0 → duration.
              // Below 0.05 the video is mid-fade-in (currentTime stays at 0); above 0.78
              // it parks on the last frame.
              const span = TIMING.VIDEO_SCRUB_END - TIMING.VIDEO_SCRUB_START;
              const tNorm = Math.min(Math.max((v - TIMING.VIDEO_SCRUB_START) / span, 0), 1);
              const t = tNorm * video.duration;
              if (Number.isFinite(t)) video.currentTime = t;
            };
            if (Number.isFinite(video.duration) && video.duration > 0) {
              seekToForcedFrame();
            } else {
              video.addEventListener("loadedmetadata", seekToForcedFrame, { once: true });
            }
          }
          return; // skip both the non-pinned path and the pinned ScrollTrigger
        }
      }

      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Mobile or reduced motion → no pin, no scrub. Reduced motion also
      // skips video playback entirely (poster stays visible).
      if (!isDesktop || reduced) {
        setupNonPinnedReveal(section, wrapper, reduced ? null : videoRef.current);
        return;
      }

      ScrollTrigger.create({
        trigger: wrapper,
        // "top bottom" so the trigger activates the moment the section's top
        // edge enters the bottom of the viewport — i.e., as Story finishes
        // unpinning. Closes the ~1 viewport gap that "top top" produced
        // between Story's --story-fadeout reaching 0 and Reveal's
        // --video-opacity beginning to ramp up. Verified at progress sweep
        // shows storyFadeout → 0 and videoOpacity → 1 in the same tick window.
        start: "top bottom-=1",
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

  // rAF loop — reads progressRef each frame, drives video.currentTime
  // (throttled to ~30 Hz to spare iOS Safari's video decode pipeline) and
  // text-reveal CSS variables. Skipped on mobile + reduced-motion: those
  // paths use a GSAP timeline that writes inline styles directly.
  useEffect(() => {
    const wrapper = pinWrapperRef.current;
    const video = videoRef.current;
    if (!wrapper || !video) return;

    // Skip the loop on mobile + reduced-motion paths (those use GSAP
    // timelines and don't read these CSS variables). Test mode runs the
    // loop regardless of viewport so `?lyraProgress=` works at any size.
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
    let lastVideoTimeWrite = 0;

    const tick = (now: number) => {
      if (stopped) return;
      if (!document.hidden) {
        const p = progressRef.current;

        // iOS Safari restarts a decode pipeline on every currentTime write;
        // 60 Hz can stall it. 30 Hz is plenty since source is 30 fps.
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

        // Video opacity envelope — combines the fade-in (0 → 1 over 0.0–0.05) with
        // the dim (1 → 0.3 over 0.80–0.88). `dim` ramps the *amount* to subtract,
        // so opacity = fadeIn − dim. Outside the windows the ramps clamp flat.
        const videoFade = ramp(p, TIMING.VIDEO_FADE_IN[0], TIMING.VIDEO_FADE_IN[1], 0, 1);
        const videoDim = ramp(p, TIMING.VIDEO_DIM[0], TIMING.VIDEO_DIM[1], 0, 0.7);
        wrapper.style.setProperty("--video-opacity", String(videoFade - videoDim));
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
        {/* Video — centred horizontally, anchored ~10vh from the top so there's
            breathing room above. Width clamps so the source isn't stretched past
            native (1584×1308). Edge-masked into bg-secondary on all four sides
            so no rectangular boundary is visible. */}
        <video
          ref={videoRef}
          className="lyra-video absolute left-1/2 top-[10vh] -translate-x-1/2"
          style={{
            width: "var(--lyra-video-width, clamp(760px, 60vw, 1100px))",
            height: "auto",
            objectFit: "contain",
            maskImage: VIDEO_MASK,
            WebkitMaskImage: VIDEO_MASK,
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
            a still at ?lyraProgress=0.78 and overlaying the wordmark. The outer
            div owns horizontal/vertical centring so the inner <h2> can drive its
            Y reveal with a clean translateY (matches the halo + tagline pattern). */}
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
    </section>
  );
}
