"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";

/*
  Layout (lg+):
    Container spans from y=572 (between text/buttons row) to bottom of section.
    Inside (absolute children):
      - Vertical line (full height − h-line)
      - SCROLL DOWN text overlapping the line at ~y=720 (just above the fold)
      - Horizontal line at the bottom

  The SCROLL DOWN box is 170×40 with SCROLL on top-left and DOWN on bottom-right,
  so the central 3px line passes cleanly through the empty diagonal middle.
*/

const CONTAINER_TOP = 572; // top of the description+CTA row
const SCROLL_TEXT_OFFSET = 188; // → y=760, more clearance below the CTA row

export default function ScrollIndicator() {
  const containerRef = useRef<HTMLDivElement>(null);
  const vGlowRef = useRef<HTMLDivElement>(null);
  const hGlowLeftRef = useRef<HTMLDivElement>(null);
  const hGlowRightRef = useRef<HTMLDivElement>(null);
  const scrollTextRef = useRef<HTMLDivElement>(null);
  const verticalLineRef = useRef<HTMLDivElement>(null);
  const horizontalLineRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const buildTimeline = useCallback(() => {
    const vGlow = vGlowRef.current;
    const hGlowL = hGlowLeftRef.current;
    const hGlowR = hGlowRightRef.current;
    const scrollText = scrollTextRef.current;
    const vLine = verticalLineRef.current;
    const hLine = horizontalLineRef.current;

    if (!vGlow || !hGlowL || !hGlowR || !scrollText || !vLine || !hLine) return;

    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    const vLineHeight = vLine.offsetHeight;
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;

    // Reset state
    gsap.set(vGlow, { top: "-120px", opacity: 0 });
    gsap.set(hGlowL, { opacity: 0, width: 0 });
    gsap.set(hGlowR, { opacity: 0, width: 0 });
    gsap.set(scrollText, { opacity: 0.6, y: 0 });

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 });
    timelineRef.current = tl;

    // === PHASE 1: VERTICAL — glow travels the full line, top to bottom ===
    tl.to(vGlow, { opacity: 1, duration: 0.3 }, 0);
    tl.to(scrollText, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, 0);

    tl.to(vGlow, {
      top: vLineHeight - 40,
      duration: 1.8,
      ease: "power2.inOut",
    });

    // Scroll text pulses as the glow passes through
    tl.to(
      scrollText,
      { opacity: 0.3, y: 4, duration: 0.8, ease: "power2.inOut" },
      "-=1.0"
    );

    // Fade out vertical glow at the bottom — completes BEFORE horizontal starts
    tl.to(vGlow, { opacity: 0, duration: 0.25 });

    if (isDesktop) {
      // === PHASE 2: HORIZONTAL — starts only after vertical completes ===
      tl.set(hGlowL, { opacity: 1, width: 0 });
      tl.set(hGlowR, { opacity: 1, width: 0 });

      tl.to(hGlowL, { width: "50%", duration: 1.0, ease: "power2.out" });
      tl.to(
        hGlowR,
        { width: "50%", duration: 1.0, ease: "power2.out" },
        "<"
      );

      tl.to([hGlowL, hGlowR], { opacity: 0, duration: 0.5 }, "+=0.15");
    }

    // === PHASE 3: RESET ===
    tl.to(scrollText, { opacity: 0.6, y: 0, duration: 0.3 });
    tl.set(vGlow, { top: "-120px" });
    tl.set([hGlowL, hGlowR], { width: 0 });
  }, []);

  useEffect(() => {
    buildTimeline();

    const handleResize = () => buildTimeline();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (timelineRef.current) timelineRef.current.kill();
    };
  }, [buildTimeline]);

  return (
    <div
      ref={containerRef}
      data-scroll-indicator
      className="hidden lg:block absolute left-1/2 -translate-x-1/2 z-10"
      style={{ top: `${CONTAINER_TOP}px`, bottom: 0 }}
    >
      {/* Vertical Line — fills container above the horizontal line */}
      <div
        ref={verticalLineRef}
        className="absolute left-1/2 -translate-x-1/2 overflow-hidden"
        style={{ top: 0, bottom: 3, width: "3px" }}
      >
        {/* Base dim line */}
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(145,109,252,0.06)] to-[rgba(145,109,252,0.12)]" />
        {/* Animated glow gradient that travels down */}
        <div
          ref={vGlowRef}
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: "3px",
            height: "120px",
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(145,109,252,0.15) 20%, rgba(145,109,252,0.8) 50%, rgba(145,109,252,0.15) 80%, transparent 100%)",
            boxShadow:
              "0 0 12px 4px rgba(145,109,252,0.4), 0 0 30px 8px rgba(145,109,252,0.2)",
            opacity: 0,
          }}
        />
      </div>

      {/* Scroll Text — overlaps the line at the just-above-the-fold position.
          Staggered diagonal: SCROLL top-left, DOWN bottom-right — line passes
          cleanly through the empty middle. */}
      <div
        ref={scrollTextRef}
        className="scroll-text absolute opacity-60 pointer-events-none"
        style={{
          top: `${SCROLL_TEXT_OFFSET}px`,
          left: "50%",
          transform: "translateX(-50%)",
          width: "170px",
          height: "40px",
        }}
      >
        <span className="absolute top-0 left-0 text-sm text-text-muted tracking-[0.2em] font-medium">
          SCROLL
        </span>
        <span className="absolute bottom-0 right-0 text-sm text-text-muted tracking-[0.2em] font-medium">
          DOWN
        </span>
      </div>

      {/* Horizontal Line — anchored to the very bottom of the section */}
      <div
        ref={horizontalLineRef}
        className="absolute"
        style={{
          left: "50%",
          bottom: 0,
          width: "1552px",
          marginLeft: "-776px",
          height: "3px",
        }}
      >
        {/* Base dim line */}
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(145,109,252,0.04)] via-[rgba(145,109,252,0.1)] to-[rgba(145,109,252,0.04)]" />
        {/* Left-spreading glow */}
        <div
          ref={hGlowLeftRef}
          className="absolute right-1/2 top-0 h-full pointer-events-none"
          style={{
            background:
              "linear-gradient(to left, rgba(145,109,252,0.8), rgba(145,109,252,0.2) 40%, transparent 100%)",
            boxShadow:
              "0 0 12px 4px rgba(145,109,252,0.3), 0 0 30px 8px rgba(145,109,252,0.15)",
            width: 0,
            opacity: 0,
          }}
        />
        {/* Right-spreading glow */}
        <div
          ref={hGlowRightRef}
          className="absolute left-1/2 top-0 h-full pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, rgba(145,109,252,0.8), rgba(145,109,252,0.2) 40%, transparent 100%)",
            boxShadow:
              "0 0 12px 4px rgba(145,109,252,0.3), 0 0 30px 8px rgba(145,109,252,0.15)",
            width: 0,
            opacity: 0,
          }}
        />
      </div>
    </div>
  );
}
