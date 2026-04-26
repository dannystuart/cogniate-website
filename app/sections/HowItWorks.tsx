"use client";

import { useRef } from "react";

const cards = [
  {
    id: "create",
    title: "Create",
    descLines: [
      "Describe what you need.",
      "Lyra thinks, researches, structures, and writes your course.",
    ],
    tagline: "In minutes, not months.",
    image: "/assets/how-card-create.png",
  },
  {
    id: "design",
    title: "Design",
    descLines: [
      "Customise your brand.",
      "Select interactive components, refine with AI suggestions, no design skills required.",
    ],
    tagline: "Every output is enterprise-grade.",
    image: "/assets/how-card-design.png",
  },
  {
    id: "publish",
    title: "Publish",
    descLines: [
      "Deploy to any LMS.",
      "Share internally or sell on the marketplace. Built-in automatic content updates keep your courses current.",
    ],
    tagline: "Omnichannel publishing.",
    image: "/assets/how-card-publish.png",
  },
] as const;

const GRID_LINE_COUNT_DESKTOP = 11;
const GRID_LINE_COUNT_MOBILE = 5;

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      data-testid="how-it-works-section"
      className="relative w-full bg-[#111112] overflow-hidden py-20 lg:py-32"
    >
      {/* ===== BACKGROUND GRID LINES ===== */}
      <div className="absolute inset-x-0 top-[100px] bottom-[60px] mx-auto max-w-[1554px] pointer-events-none">
        {/* Desktop grid */}
        <div className="hidden lg:flex justify-between h-full px-[40px]">
          {Array.from({ length: GRID_LINE_COUNT_DESKTOP }).map((_, i) => (
            <div
              key={i}
              className="w-px h-full"
              style={{
                background:
                  "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.06) 15%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.06) 85%, transparent 100%)",
              }}
            />
          ))}
        </div>
        {/* Mobile grid */}
        <div className="flex lg:hidden justify-between h-full px-[20px]">
          {Array.from({ length: GRID_LINE_COUNT_MOBILE }).map((_, i) => (
            <div
              key={i}
              className="w-px h-full"
              style={{
                background:
                  "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.06) 15%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.06) 85%, transparent 100%)",
              }}
            />
          ))}
        </div>
      </div>

      {/* ===== ANIMATED PURPLE GRADIENT LINES (placeholder — Task 3) ===== */}

      {/* ===== CONTENT ===== */}
      <div className="relative z-10 mx-auto max-w-[1554px] px-5 md:px-6">
        {/* HOW IT WORKS eyebrow */}
        <div
          className="inline-flex items-center h-[52px] px-12 mb-12 lg:mb-16"
          style={{ backgroundColor: "rgba(211,204,255,0.05)" }}
        >
          <span className="text-[16px] font-medium tracking-[4.8px] text-white/80">
            HOW IT WORKS
          </span>
        </div>

        {/* Cards row */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-[34px]">
          {cards.map((card) => (
            <div
              key={card.id}
              className="group relative flex-1 rounded-[20px] overflow-hidden"
              style={{
                minHeight: 608,
                boxShadow:
                  "0px 0px 20px 3px rgba(7,13,79,0.05), 0px 0px 40px 20px rgba(7,13,79,0.05)",
              }}
            >
              {/* Card gradient background */}
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none rounded-[20px]"
                style={{
                  backgroundImage:
                    "linear-gradient(138deg, rgba(51,42,65,0.7) 22%, rgba(7,9,33,0) 82%)",
                }}
              />

              {/* Card content */}
              <div className="relative z-10 flex flex-col pt-8 px-8">
                {/* Icon + Title */}
                <div className="flex items-center gap-5 mb-2">
                  {/* Icon button */}
                  <div
                    className="relative flex items-center justify-center shrink-0 rounded-[8px] size-[36px] overflow-hidden"
                    style={{
                      boxShadow: "0px 0px 0px 1px rgba(255,255,255,0.25)",
                    }}
                  >
                    <div
                      aria-hidden
                      className="absolute inset-0 pointer-events-none rounded-[8px]"
                      style={{
                        background:
                          "linear-gradient(to bottom, rgba(255,255,255,0.03), rgba(255,255,255,0.1))",
                      }}
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/assets/how-chevron-icon.svg"
                      alt=""
                      className="relative size-4"
                    />
                    <div
                      className="absolute inset-0 pointer-events-none rounded-[inherit]"
                      style={{
                        boxShadow:
                          "inset 0px 1px 0px 0px rgba(255,255,255,0.05), inset 0px -1px 0px 0px rgba(0,0,0,0.2)",
                      }}
                    />
                  </div>
                  <h3 className="text-[28px] font-medium text-white leading-tight">
                    {card.title}
                  </h3>
                </div>

                {/* Description */}
                <div className="mt-2">
                  {card.descLines.map((line, i) => (
                    <p
                      key={i}
                      className="text-[20px] leading-[28px] font-medium"
                      style={{ color: "rgba(244,238,255,0.9)" }}
                    >
                      {line}
                    </p>
                  ))}
                </div>

                {/* Italic tagline */}
                <p className="mt-4 font-serif italic text-[24px] leading-[25.6px] text-accent-coral">
                  {card.tagline}
                </p>
              </div>

              {/* Card image — bottom, scales on hover */}
              <div className="absolute bottom-0 left-0 right-0 h-[60%] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.image}
                  alt=""
                  className="w-full h-full object-cover opacity-70 transition-transform duration-400 ease-out group-hover:scale-105"
                  draggable={false}
                />
              </div>

              {/* Card border overlay */}
              <div
                className="absolute inset-0 pointer-events-none rounded-[inherit]"
                style={{
                  boxShadow:
                    "inset 0px 1px 0px 0px rgba(255,255,255,0.1), inset 0px 0px 0px 1px rgba(255,255,255,0.06)",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
