"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";

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

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.0 });
    timelineRef.current = tl;

    // Fade in the glow gradient at the top of vertical line
    tl.to(vGlow, { opacity: 1, duration: 0.3 });

    // Animate scroll text as glow appears
    tl.to(
      scrollText,
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
      "<"
    );

    // Move glow gradient down the vertical line
    tl.to(vGlow, {
      top: vLineHeight - 40,
      duration: 1.8,
      ease: "power2.inOut",
    });

    // Pulse the scroll text as glow passes
    tl.to(
      scrollText,
      { opacity: 0.3, y: 4, duration: 1.0, ease: "power2.inOut" },
      "-=1.2"
    );

    if (isDesktop) {
      // Fade out vertical glow at bottom
      tl.to(vGlow, { opacity: 0, duration: 0.3 }, "-=0.3");

      // Show horizontal spread glows from center outward
      tl.set(hGlowL, { opacity: 1, width: 0 });
      tl.set(hGlowR, { opacity: 1, width: 0 });

      tl.to(hGlowL, {
        width: "50%",
        duration: 1.2,
        ease: "power2.out",
      });
      tl.to(
        hGlowR,
        { width: "50%", duration: 1.2, ease: "power2.out" },
        "<"
      );

      // Fade out horizontal glows
      tl.to([hGlowL, hGlowR], { opacity: 0, duration: 0.6 }, "-=0.3");
    } else {
      tl.to(vGlow, { opacity: 0, duration: 0.5 });
    }

    // Reset scroll text
    tl.to(scrollText, { opacity: 0.6, y: 0, duration: 0.3 });

    // Reset vertical glow position
    tl.set(vGlow, { top: "-120px" });
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
      className="hidden lg:flex flex-col items-center absolute left-1/2 -translate-x-1/2 z-10"
      style={{ top: "calc(100% - 230px)" }}
    >
      {/* Scroll Text — staggered diagonal layout matching Figma */}
      <div
        ref={scrollTextRef}
        className="scroll-text relative mb-4 opacity-60"
        style={{ width: "170px", height: "40px" }}
      >
        <span className="absolute top-0 left-0 text-sm text-text-muted tracking-[0.2em] font-medium">
          SCROLL
        </span>
        <span className="absolute bottom-0 right-0 text-sm text-text-muted tracking-[0.2em] font-medium">
          DOWN
        </span>
      </div>

      {/* Vertical Line Container */}
      <div
        ref={verticalLineRef}
        className="relative flex justify-center overflow-hidden"
        style={{ height: "300px", width: "3px" }}
      >
        {/* Base dim line */}
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(174,180,255,0.06)] to-[rgba(174,180,255,0.12)]" />
        {/* Animated glow gradient that travels down */}
        <div
          ref={vGlowRef}
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: "3px",
            height: "120px",
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(174,180,255,0.15) 20%, rgba(174,180,255,0.8) 50%, rgba(174,180,255,0.15) 80%, transparent 100%)",
            boxShadow:
              "0 0 12px 4px rgba(174,180,255,0.4), 0 0 30px 8px rgba(174,180,255,0.2)",
            opacity: 0,
          }}
        />
      </div>

      {/* Horizontal Line Container */}
      <div
        ref={horizontalLineRef}
        className="hidden lg:block relative"
        style={{ width: "1552px", marginLeft: "-776px", height: "3px" }}
      >
        {/* Base dim line */}
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(174,180,255,0.04)] via-[rgba(174,180,255,0.1)] to-[rgba(174,180,255,0.04)]" />
        {/* Left-spreading glow */}
        <div
          ref={hGlowLeftRef}
          className="absolute right-1/2 top-0 h-full pointer-events-none"
          style={{
            background:
              "linear-gradient(to left, rgba(174,180,255,0.8), rgba(174,180,255,0.2) 40%, transparent 100%)",
            boxShadow:
              "0 0 12px 4px rgba(174,180,255,0.3), 0 0 30px 8px rgba(174,180,255,0.15)",
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
              "linear-gradient(to right, rgba(174,180,255,0.8), rgba(174,180,255,0.2) 40%, transparent 100%)",
            boxShadow:
              "0 0 12px 4px rgba(174,180,255,0.3), 0 0 30px 8px rgba(174,180,255,0.15)",
            width: 0,
            opacity: 0,
          }}
        />
      </div>
    </div>
  );
}
