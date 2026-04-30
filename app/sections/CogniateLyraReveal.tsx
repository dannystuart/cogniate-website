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
