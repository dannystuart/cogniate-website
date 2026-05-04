"use client";

import { useEffect, useRef, useState } from "react";

const segments = [
  { id: "individuals", label: "Individuals" },
  { id: "teams", label: "Teams" },
] as const;

type SegmentId = (typeof segments)[number]["id"];

export default function PricingNav() {
  const [active, setActive] = useState<SegmentId>("individuals");
  const [stuck, setStuck] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<SegmentId, HTMLButtonElement | null>>({
    individuals: null,
    teams: null,
  });
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  // Track which section is in view
  useEffect(() => {
    const sections = segments
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry whose top is closest to (but below) the sticky nav
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id as SegmentId);
      },
      {
        // Trigger when section header crosses about 35% from top
        rootMargin: "-35% 0px -55% 0px",
        threshold: 0,
      }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Detect stuck state via sentinel
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { rootMargin: "0px 0px 0px 0px", threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Position the sliding indicator
  useEffect(() => {
    const btn = buttonRefs.current[active];
    if (!btn) return;
    const parent = btn.parentElement;
    if (!parent) return;
    setIndicator({ left: btn.offsetLeft, width: btn.offsetWidth });
  }, [active, stuck]);

  const handleClick = (id: SegmentId) => {
    const target = document.getElementById(id);
    if (!target) return;
    // Account for global nav (~75px) + sticky pill (~64px)
    const offset = 140;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <>
      <div ref={sentinelRef} aria-hidden className="h-px w-full" />
      <div
        className={`sticky top-[16px] md:top-[24px] z-40 flex justify-center px-5 transition-[padding] duration-300`}
      >
        <div
          role="tablist"
          aria-label="Pricing sections"
          className={`relative flex items-center gap-1 rounded-full p-1 backdrop-blur-md transition-all duration-300 ${
            stuck
              ? "bg-bg-nav border border-white/10 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]"
              : "bg-white/[0.04] border border-white/[0.06]"
          }`}
        >
          {/* Sliding indicator */}
          <span
            aria-hidden
            className="absolute top-1 bottom-1 rounded-full bg-white/[0.10] transition-[left,width] duration-[280ms] ease-out"
            style={{
              left: indicator.left,
              width: indicator.width,
              boxShadow:
                "inset 0 1px 0 0 rgba(255,255,255,0.10), inset 0 -1px 0 0 rgba(0,0,0,0.20)",
            }}
          />
          {segments.map((s) => {
            const isActive = active === s.id;
            return (
              <button
                key={s.id}
                ref={(el) => {
                  buttonRefs.current[s.id] = el;
                }}
                role="tab"
                aria-selected={isActive}
                aria-controls={s.id}
                onClick={() => handleClick(s.id)}
                className={`relative z-10 px-4 md:px-5 h-9 md:h-10 rounded-full text-sm md:text-[15px] font-medium tracking-[-0.005em] cursor-pointer transition-colors duration-200 ${
                  isActive ? "text-white" : "text-white/55 hover:text-white/85"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
