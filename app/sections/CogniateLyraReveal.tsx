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
