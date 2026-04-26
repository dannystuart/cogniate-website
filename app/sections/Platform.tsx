"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ============================================
   DATA
   ============================================ */

const cards = [
  {
    id: "create",
    title: "Create",
    subtitle: "with Lyra",
    trademark: "\u00AE",
    description:
      "Lyra is a course creation intelligence, trained on the Cogniate platform. She thinks, researches, structures, and writes your course.",
    features: [
      {
        label: "Prompt to life",
        description:
          "Lyra is a course creation intelligence, trained on the Cogniate platform. She thinks, researches, structures, and writes your course.",
      },
      {
        label: "Prompt to life",
        description:
          "Lyra is a course creation intelligence, trained on the Cogniate platform. She thinks, researches, structures, and writes your course.",
      },
    ],
    layout: "content-left" as const,
  },
  {
    id: "design",
    title: "Design",
    subtitle: "with Studio",
    trademark: "\u00AE",
    description:
      "A powerful design engine that brings your course to life. Customize every detail with professional templates and interactive components.",
    features: [
      {
        label: "Drag & drop",
        description:
          "Build beautiful courses with our intuitive editor. Choose from professional templates, no design skills needed.",
      },
      {
        label: "Brand ready",
        description:
          "Apply your brand guidelines automatically. Colors, fonts, and layouts that match your organization\u2019s identity.",
      },
    ],
    layout: "content-right" as const,
  },
  {
    id: "publish",
    title: "Publish",
    subtitle: "with Nexus",
    trademark: "\u00AE",
    description:
      "Deploy to any LMS or share via link. Built-in analytics and automatic content updates keep your courses current and effective.",
    features: [
      {
        label: "One-click deploy",
        description:
          "Publish directly to any LMS with SCORM, xAPI, or cmi5 support. Or share a simple link for instant access.",
      },
      {
        label: "Always current",
        description:
          "Automatic content updates keep your courses fresh. Built-in analytics show what\u2019s working and what needs attention.",
      },
    ],
    layout: "content-left" as const,
  },
];

/* ============================================
   SUB-COMPONENTS
   ============================================ */

function FeatureBlock({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Icon + label row */}
      <div className="flex items-center gap-4">
        <div
          className="relative flex items-center justify-center shrink-0 rounded-lg size-9 overflow-hidden"
          style={{ boxShadow: "0px 0px 0px 1px rgba(255,255,255,0.25)" }}
        >
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none rounded-lg"
            style={{
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0.03), rgba(255,255,255,0.1))",
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/platform-icon-arrow.svg"
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
        <span className="text-[18px] lg:text-[20px] text-white">{label}</span>
      </div>

      {/* Feature description */}
      <p className="text-[13px] lg:text-[14px] leading-[20px] text-[rgba(244,238,255,0.8)]">
        {description}
      </p>
    </div>
  );
}

function PlatformCard({
  card,
}: {
  card: (typeof cards)[number];
}) {
  const isLeft = card.layout === "content-left";

  return (
    <div
      className="relative flex flex-col lg:flex-row gap-8 lg:gap-[80px] xl:gap-[120px] items-center overflow-hidden rounded-[20px] px-6 py-8 lg:px-[60px] xl:px-[80px] lg:py-[40px]"
      style={{
        boxShadow:
          "0px 0px 100px 0px rgba(0,0,0,0.3), 0px 0px 20px 3px rgba(7,13,79,0.05), 0px 0px 40px 20px rgba(7,13,79,0.05)",
      }}
    >
      {/* Dark card background */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[#141318] pointer-events-none rounded-[20px]"
      />

      {/* Decorative ellipse glow */}
      <div
        aria-hidden
        className="absolute pointer-events-none hidden lg:block"
        style={{
          width: "1200px",
          height: "700px",
          right: isLeft ? "-200px" : "auto",
          left: isLeft ? "auto" : "-200px",
          top: "100px",
          background:
            "radial-gradient(ellipse at center, rgba(100,50,150,0.12) 0%, transparent 70%)",
          transform: "rotate(-7deg)",
        }}
      />

      {/* Content side */}
      <div
        className={`relative z-10 shrink-0 w-full lg:w-[400px] xl:w-[455px] ${
          !isLeft ? "lg:order-2" : ""
        }`}
      >
        {/* Title block */}
        <div className="mb-4 lg:mb-5">
          <p className="landscape-heading-gradient font-semibold text-[28px] lg:text-[36px] xl:text-[40px] leading-[1.1] tracking-[-0.04em]">
            {card.title}
          </p>
          <div className="flex items-baseline mt-1 ml-10 lg:ml-[50px] xl:ml-[70px]">
            <span className="text-[20px] lg:text-[24px] xl:text-[28px] text-[rgba(244,238,255,0.7)] leading-[28px]">
              {card.subtitle}
            </span>
            <span className="text-[13px] lg:text-[16px] xl:text-[18px] text-[rgba(244,238,255,0.7)] leading-[28px]">
              {card.trademark}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-[15px] lg:text-[17px] xl:text-[18px] leading-[24px] text-[rgba(244,238,255,0.8)] max-w-[414px] mb-8 lg:mb-10">
          {card.description}
        </p>

        {/* Feature blocks */}
        <div className="grid grid-cols-2 gap-5 lg:gap-[27px]">
          {card.features.map((feature, i) => (
            <FeatureBlock
              key={i}
              label={feature.label}
              description={feature.description}
            />
          ))}
        </div>
      </div>

      {/* Placeholder side (will be SVG / video later) */}
      <div
        className={`relative z-10 w-full lg:flex-1 rounded-[20px] overflow-hidden ${
          !isLeft ? "lg:order-1" : ""
        }`}
        style={{
          height: "clamp(240px, 30vw, 477px)",
          background: "#24202c",
          border: "0.5px solid rgba(223,223,223,0.2)",
        }}
      >
        <Image
          src="/assets/platform-card-gradient.png"
          alt=""
          fill
          className="object-cover"
        />
      </div>

      {/* Card inset border */}
      <div
        className="absolute inset-0 pointer-events-none rounded-[inherit] z-20"
        style={{
          boxShadow:
            "inset 0px 1px 0px 0px rgba(255,255,255,0.1), inset 0px 0px 0px 1px rgba(255,255,255,0.06)",
        }}
      />
    </div>
  );
}

/* ============================================
   MAIN SECTION
   ============================================ */

export default function Platform() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const setCardRef =
    (index: number) => (el: HTMLDivElement | null) => {
      cardRefs.current[index] = el;
    };

  useEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    const cardEls = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!section || !title || cardEls.length !== cards.length) return;

    const ctx = gsap.context(() => {
      /* --- Title entrance --- */
      gsap.fromTo(
        title,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );

      /* --- Desktop: scrub-based card stack animation --- */
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        // Set initial state for all cards after the first
        cardEls.forEach((card, i) => {
          if (i > 0) {
            gsap.set(card, { y: "110%", scale: 0.92, opacity: 0 });
          }
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
          },
        });

        // Build N-1 transition segments
        const transitionCount = cardEls.length - 1;
        const segmentDuration = 1;

        for (let i = 0; i < transitionCount; i++) {
          const exitCard = cardEls[i];
          const enterCard = cardEls[i + 1];
          const segmentStart = i * segmentDuration;

          // Current card scales down and moves up
          tl.to(
            exitCard,
            {
              y: "-25%",
              scale: 0.85,
              opacity: 0,
              duration: segmentDuration,
              ease: "none",
            },
            segmentStart
          );

          // Next card rises into position (overlapping with exit)
          tl.to(
            enterCard,
            {
              y: "0%",
              scale: 1,
              opacity: 1,
              duration: segmentDuration,
              ease: "none",
            },
            segmentStart + segmentDuration * 0.4
          );
        }
      });

      /* --- Mobile: simple fade-in per card --- */
      mm.add("(max-width: 1023px)", () => {
        cardEls.forEach((card, i) => {
          gsap.fromTo(
            card,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power2.out",
              delay: i * 0.15,
              scrollTrigger: {
                trigger: card,
                start: "top 85%",
                toggleActions: "play none none none",
              },
            }
          );
        });
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-testid="platform-section"
      className="relative bg-bg-secondary"
    >
      {/* Dynamic height based on card count — only applied on desktop */}
      <style>{`@media (min-width: 1024px) { [data-testid="platform-section"] { height: ${cards.length * 150}vh; } }`}</style>
      <div className="lg:sticky lg:top-0 lg:h-screen flex flex-col items-center overflow-hidden py-16 lg:py-0">
        {/* ===== GRADIENT BACKGROUND ===== */}
        <div className="absolute inset-0 lg:inset-5 z-0 lg:rounded-[50px] overflow-hidden opacity-60 lg:opacity-100">
          <Image
            src="/assets/platform-gradient-bg.png"
            alt=""
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* ===== SECTION TITLE ===== */}
        <h2
          ref={titleRef}
          className="landscape-heading-gradient relative z-10 text-center font-semibold tracking-[-0.04em] text-[32px] md:text-[48px] lg:text-[56px] xl:text-[64px] leading-[1.1] mt-12 lg:mt-[100px] xl:mt-[120px] max-w-[900px] xl:max-w-[1306px] px-6"
        >
          AI-native course authoring.
          <br />
          The first of its kind.
        </h2>

        {/* ===== CARDS CONTAINER ===== */}
        <div className="relative z-10 w-full max-w-[1301px] mx-auto px-5 lg:px-6 mt-8 lg:mt-[50px] xl:mt-[60px] flex flex-col gap-8 lg:gap-0 lg:flex-1">
          {cards.map((card, i) => (
            <div
              key={card.id}
              ref={setCardRef(i)}
              className="lg:absolute lg:inset-x-6 lg:top-0"
            >
              <PlatformCard card={card} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
