"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import EyebrowBadge from "../components/EyebrowBadge";

gsap.registerPlugin(ScrollTrigger);

export default function Landscape() {
  const sectionRef = useRef<HTMLElement>(null);

  // Title
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Landscape stat block
  const landscapeBlockRef = useRef<HTMLDivElement>(null);
  const landscapeLineRef = useRef<HTMLDivElement>(null);
  const landscapeNumberWrapRef = useRef<HTMLDivElement>(null);
  const landscapeNumberRef = useRef<HTMLSpanElement>(null);
  const landscapeEyebrowRef = useRef<HTMLDivElement>(null);
  const landscapeSubtitleRef = useRef<HTMLParagraphElement>(null);

  // Opportunity stat block
  const opportunityBlockRef = useRef<HTMLDivElement>(null);
  const opportunityDimRef = useRef<HTMLDivElement>(null);
  const opportunitySolidRef = useRef<HTMLDivElement>(null);
  const opportunityNumberWrapRef = useRef<HTMLDivElement>(null);
  const opportunityNumberRef = useRef<HTMLSpanElement>(null);
  const opportunityEyebrowRef = useRef<HTMLDivElement>(null);
  const opportunitySubtitleRef = useRef<HTMLParagraphElement>(null);

  // Bottom row
  const bottomRowRef = useRef<HTMLDivElement>(null);
  const oldStateRef = useRef<HTMLDivElement>(null);
  const oldLabelRef = useRef<HTMLParagraphElement>(null);
  const oldNumberRef = useRef<HTMLSpanElement>(null);
  const count154Ref = useRef<HTMLSpanElement>(null);
  const newStateRef = useRef<HTMLDivElement>(null);
  const newNumberRef = useRef<HTMLSpanElement>(null);
  const newLabelRef = useRef<HTMLParagraphElement>(null);

  // Stats animations — title fade, landscape block, opportunity block, 154→60 swap
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      // Set initial states (lines collapsed, numbers at 0, text hidden)
      gsap.set(landscapeLineRef.current, {
        scaleY: 0,
        transformOrigin: "bottom",
      });
      gsap.set([opportunityDimRef.current, opportunitySolidRef.current], {
        scaleY: 0,
        transformOrigin: "bottom",
      });
      gsap.set(
        [landscapeNumberWrapRef.current, opportunityNumberWrapRef.current],
        { opacity: 0 }
      );
      // "billion" and "only" stay visible while the numbers count — they sit
      // inside the number wrapper, which fades in as a whole at t=0
      gsap.set(
        [
          landscapeEyebrowRef.current,
          landscapeSubtitleRef.current,
          opportunityEyebrowRef.current,
          opportunitySubtitleRef.current,
        ],
        { opacity: 0, y: 6 }
      );
      gsap.set(headingRef.current, { opacity: 0, y: 8 });
      gsap.set(newStateRef.current, { opacity: 0 });
      gsap.set(oldStateRef.current, { opacity: 0 });

      if (prefersReducedMotion) {
        // Skip motion: snap to final states
        gsap.set(
          [landscapeLineRef.current, opportunityDimRef.current, opportunitySolidRef.current],
          { scaleY: 1 }
        );
        gsap.set(
          [
            headingRef.current,
            landscapeNumberWrapRef.current,
            opportunityNumberWrapRef.current,
            landscapeEyebrowRef.current,
            landscapeSubtitleRef.current,
            opportunityEyebrowRef.current,
            opportunitySubtitleRef.current,
            newStateRef.current,
          ],
          { opacity: 1, y: 0 }
        );
        gsap.set(oldStateRef.current, { opacity: 0 });
        if (landscapeNumberRef.current) landscapeNumberRef.current.textContent = "361";
        if (opportunityNumberRef.current) opportunityNumberRef.current.textContent = "12";
        if (count154Ref.current) count154Ref.current.textContent = "154";
        return;
      }

      // 1) Title fade
      gsap.to(headingRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: headingRef.current,
          start: "top 70%",
          once: true,
        },
      });

      // 2) Landscape block
      const landscapeCounter = { val: 0 };
      const landscapeTl = gsap.timeline({
        scrollTrigger: {
          trigger: landscapeBlockRef.current,
          start: "top 70%",
          once: true,
        },
      });
      landscapeTl
        .set(landscapeNumberWrapRef.current, { opacity: 1 }, 0)
        .to(
          landscapeLineRef.current,
          { scaleY: 1, duration: 1.0, ease: "power2.out" },
          0
        )
        .to(
          landscapeCounter,
          {
            val: 361,
            duration: 1.0,
            ease: "power2.out",
            onUpdate: () => {
              if (landscapeNumberRef.current) {
                landscapeNumberRef.current.textContent = String(
                  Math.round(landscapeCounter.val)
                );
              }
            },
          },
          0
        )
        .to(
          [landscapeEyebrowRef.current, landscapeSubtitleRef.current],
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            stagger: 0.08,
          },
          1.0
        );

      // 3) Opportunity block
      const opportunityCounter = { val: 0 };
      const opportunityTl = gsap.timeline({
        scrollTrigger: {
          trigger: opportunityBlockRef.current,
          start: "top 70%",
          once: true,
        },
      });
      opportunityTl
        .set(opportunityNumberWrapRef.current, { opacity: 1 }, 0)
        .to(
          opportunitySolidRef.current,
          { scaleY: 1, duration: 0.7, ease: "power2.out" },
          0
        )
        .to(
          opportunityCounter,
          {
            val: 12,
            duration: 0.7,
            ease: "power2.out",
            onUpdate: () => {
              if (opportunityNumberRef.current) {
                opportunityNumberRef.current.textContent = String(
                  Math.round(opportunityCounter.val)
                );
              }
            },
          },
          0
        )
        .to(
          opportunityDimRef.current,
          { scaleY: 1, duration: 0.4, ease: "power2.out" },
          0.7
        )
        .to(
          [opportunityEyebrowRef.current, opportunitySubtitleRef.current],
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            stagger: 0.08,
          },
          1.1
        );

      // 4) Bottom row — 154 count + swap to "60 minutes"
      const counter154 = { val: 0 };
      const bottomTl = gsap.timeline({
        scrollTrigger: {
          trigger: bottomRowRef.current,
          start: "top 70%",
          once: true,
        },
      });
      bottomTl
        .to(
          oldStateRef.current,
          { opacity: 1, duration: 0.2, ease: "power2.out" },
          0
        )
        .to(
          counter154,
          {
            val: 154,
            duration: 1.2,
            ease: "power2.out",
            onUpdate: () => {
              if (count154Ref.current) {
                count154Ref.current.textContent = String(
                  Math.round(counter154.val)
                );
              }
            },
          },
          0
        )
        // Hold for 1.0s
        .to(
          [oldLabelRef.current, oldNumberRef.current],
          {
            opacity: 0,
            y: 24,
            duration: 0.5,
            ease: "power2.in",
          },
          "+=1.0"
        )
        // 150ms beat, then rise new state
        .fromTo(
          [newNumberRef.current, newLabelRef.current],
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          },
          "+=0.15"
        )
        .to(
          newNumberRef.current,
          { scale: 1, duration: 0.6, ease: "power2.out" },
          "<"
        )
        .set(newStateRef.current, { opacity: 1 }, "<");

      // Pre-set new number scale
      gsap.set(newNumberRef.current, { scale: 0.96 });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-testid="landscape-section"
      className="relative w-full bg-bg-secondary overflow-hidden pb-40"
    >
      <div className="relative mx-auto max-w-[1330px] px-5 md:px-6 pt-[80px] lg:pt-[100px]">
        {/* Heading */}
        <h2
          ref={headingRef}
          className="landscape-heading-gradient text-center text-h2-mobile sm:text-h2-tablet lg:text-h2-desktop font-[var(--font-weight-h2)] leading-[var(--leading-h2)] tracking-[var(--tracking-h2)]"
        >
          Imagine being 150x faster.
        </h2>

        {/* Stats container - uses absolute positioning on desktop for diagonal stagger */}
        <div className="relative mt-[48px] sm:mt-[60px] lg:mt-[120px] flex flex-col gap-10 sm:gap-12 lg:block lg:min-h-[750px]">
          {/* Left stat - The Landscape */}
          <div
            ref={landscapeBlockRef}
            className="flex gap-4 sm:gap-[29px] items-start lg:absolute lg:left-[11%] lg:top-0"
          >
            {/* Vertical accent line — grows up from bottom */}
            <div
              ref={landscapeLineRef}
              className="w-[3px] shrink-0 hidden lg:block rounded-full"
              style={{
                height: "219px",
                backgroundColor: "#BC9FE0",
              }}
            />

            <div className="flex flex-col gap-4 sm:gap-[23px] items-start">
              <div ref={landscapeEyebrowRef} className="inline-flex">
                <EyebrowBadge>THE LANDSCAPE</EyebrowBadge>
              </div>

              <div className="flex flex-col gap-3 sm:gap-4">
                {/* Main stat */}
                <div
                  ref={landscapeNumberWrapRef}
                  className="flex items-end leading-[1.1]"
                >
                  <span
                    className="text-[48px] sm:text-[64px] lg:text-[96px] font-extralight tracking-[-0.04em] tabular-nums"
                    style={{
                      background:
                        "linear-gradient(161deg, rgb(255, 255, 255) 3%, rgb(146, 100, 205) 98%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    $<span ref={landscapeNumberRef}>0</span>{" "}
                  </span>
                  <span className="text-[20px] sm:text-[24px] lg:text-[32px] font-medium text-white tracking-[-0.04em] pb-1 sm:pb-2 lg:pb-3">
                    billion
                  </span>
                </div>

                {/* Subtitle */}
                <p
                  ref={landscapeSubtitleRef}
                  className="text-body sm:text-body-lg font-light leading-[1.3] text-text-muted tracking-[-0.01em]"
                >
                  global annual L&amp;D spend
                </p>
              </div>
            </div>
          </div>

          {/* Right stat - The Opportunity */}
          <div
            ref={opportunityBlockRef}
            className="flex gap-4 sm:gap-[29px] items-start justify-end lg:absolute lg:right-[10%] lg:top-[165px]"
          >
            <div className="flex flex-col gap-4 sm:gap-[23px] items-end max-w-[360px]">
              <div ref={opportunityEyebrowRef} className="inline-flex">
                <EyebrowBadge>THE OPPORTUNITY</EyebrowBadge>
              </div>

              <div className="flex flex-col gap-3 sm:gap-4 items-end text-right">
                {/* Main stat */}
                <div
                  ref={opportunityNumberWrapRef}
                  className="flex items-end leading-[1.1]"
                >
                  <span className="text-[20px] sm:text-[24px] lg:text-[32px] font-medium text-white tracking-[-0.04em] pb-1 sm:pb-2 lg:pb-3">
                    only
                  </span>
                  <span
                    className="text-[48px] sm:text-[64px] lg:text-[96px] font-extralight tracking-[-0.04em] tabular-nums"
                    style={{
                      background:
                        "linear-gradient(157deg, rgb(255, 255, 255) 3%, rgb(146, 100, 205) 98%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    <span ref={opportunityNumberRef}>0</span>%
                  </span>
                </div>

                {/* Subtitle */}
                <p
                  ref={opportunitySubtitleRef}
                  className="text-body sm:text-body-lg font-light leading-[1.3] text-text-muted tracking-[-0.01em]"
                >
                  reaches learners in a format that actually works
                </p>
              </div>
            </div>

            {/* Vertical accent line - split into two segments, each grows up from its own bottom */}
            <div className="shrink-0 hidden lg:flex flex-col gap-[12px]">
              {/* Top segment - 30% opacity */}
              <div
                ref={opportunityDimRef}
                className="w-[3px] rounded-full"
                style={{
                  height: "183px",
                  backgroundColor: "rgba(250, 103, 124, 0.3)",
                }}
              />
              {/* Bottom segment - full opacity */}
              <div
                ref={opportunitySolidRef}
                className="w-[3px] rounded-full"
                style={{
                  height: "42px",
                  backgroundColor: "#FA677C",
                }}
              />
            </div>
          </div>

          {/* Bottom stat - Time. Two stacked states for the 154 → 60 swap.
              Using CSS Grid stacking (both children in the same cell) so the
              container sizes to whichever state is wider. */}
          <div
            ref={bottomRowRef}
            className="relative grid lg:absolute lg:left-[24%] lg:top-[584px]"
          >
            {/* Old state — Traditional course creation / 154 hours */}
            <div
              ref={oldStateRef}
              className="col-start-1 row-start-1 flex flex-col sm:flex-row gap-3 sm:gap-[27px] items-center sm:items-center justify-center lg:justify-start"
            >
              <p
                ref={oldLabelRef}
                className="text-body sm:text-body-lg font-semibold leading-[1.3] text-text-muted tracking-[-0.01em] text-center sm:text-left sm:w-[130px] lg:w-[154px]"
              >
                Traditional course creation
              </p>
              <span
                ref={oldNumberRef}
                className="text-[56px] sm:text-[80px] lg:text-[128px] font-extralight leading-[1.1] tracking-[-0.06em] tabular-nums whitespace-nowrap"
                style={{
                  background:
                    "linear-gradient(170deg, rgb(255, 255, 255) 3%, rgb(146, 100, 205) 98%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                <span ref={count154Ref}>0</span> hours
              </span>
            </div>

            {/* New state — 60 minutes / Course creation with Cogniate (stacks in same grid cell as old) */}
            <div
              ref={newStateRef}
              className="col-start-1 row-start-1 flex flex-col sm:flex-row gap-3 sm:gap-[27px] items-center sm:items-center justify-center lg:justify-start"
            >
              <span
                ref={newNumberRef}
                className="text-[56px] sm:text-[80px] lg:text-[128px] font-extralight leading-[1.1] tracking-[-0.06em] whitespace-nowrap"
                style={{
                  background:
                    "linear-gradient(170deg, rgb(255, 255, 255) 3%, rgb(146, 100, 205) 98%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                60 minutes
              </span>
              <p
                ref={newLabelRef}
                className="text-body sm:text-body-lg font-semibold leading-[1.3] text-text-muted tracking-[-0.01em] text-center sm:text-left sm:w-[130px] lg:w-[154px]"
              >
                Course creation with Cogniate
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient glow - using Figma SVG asset for accuracy */}
      <div className="absolute bottom-[-14%] left-[-5%] right-[-5%] h-[85%] pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/landscape-gradient-blur.svg"
          alt=""
          className="w-full h-full"
        />
      </div>
    </section>
  );
}
