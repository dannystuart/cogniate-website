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
  VIDEO_END: 0.8,
  LYRA: [0.75, 0.83] as const,
  TAGLINE: [0.78, 0.86] as const,
  WORD_CREATE: [0.86, 0.9] as const,
  WORD_DESIGN: [0.91, 0.95] as const,
  WORD_PUBLISH: [0.96, 1.0] as const,
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

  // rAF loop — reads progressRef each frame, drives video.currentTime
  // (throttled to ~30 Hz to spare iOS Safari's video decode pipeline). The
  // text-reveal CSS variable writes get added in the next commit.
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

        // iOS Safari restarts a decode pipeline on every currentTime write;
        // 60 Hz can stall it. 30 Hz is plenty since source is 30 fps.
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

  return (
    <section
      ref={sectionRef}
      data-testid="cogniate-lyra-reveal"
      className="relative w-full bg-bg-secondary overflow-hidden"
    >
      <div ref={pinWrapperRef} className="relative min-h-screen w-full">
        <video
          ref={videoRef}
          className="absolute inset-0 size-full object-cover"
          style={{ objectPosition: "center 30%" }}
          muted
          playsInline
          preload="auto"
          poster="/assets/cogniate-scrub-lyra-poster.jpg"
          disablePictureInPicture
          disableRemotePlayback
        >
          <source src="/assets/cogniate-scrub-lyra-video.mp4" type="video/mp4" />
        </video>

        {/* Ambient blur — bridges the video into the text below. Sized from
            Figma node 10:10271 (940×431); blurred to soften the boundary. */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[60%] -translate-x-1/2 -translate-y-1/2"
          style={{
            width: 940,
            height: 431,
            background:
              "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 70%)",
            filter: "blur(60px)",
          }}
        />

        {/* Text stack — anchored to the lower half so it sits below the
            video's "Lyra" dust focal point at the top. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center pt-[52vh]">
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
            <sup
              style={{ fontWeight: 300, fontSize: "0.557em", verticalAlign: "super" }}
            >
              ®
            </sup>
          </h2>

          <p
            className="lyra-tagline text-center"
            style={{
              marginTop: "1.25rem",
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
            <span data-word="create" style={{ display: "inline-block" }}>
              Create.&nbsp;
            </span>
            <span data-word="design" style={{ display: "inline-block" }}>
              Design.&nbsp;
            </span>
            <span data-word="publish" style={{ display: "inline-block" }}>
              Publish
            </span>
          </h3>
        </div>
      </div>
    </section>
  );
}
