"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import PlatformVideoBG from "../components/PlatformVideoBG";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PlatformCardAccordion, { type AccordionCardData } from "../components/PlatformCardAccordion";
import LoopingSvg from "../components/LoopingSvg";

gsap.registerPlugin(ScrollTrigger);

/* ============================================
   TYPES
   ============================================ */

type StandardCard = {
  id: string;
  title: string;
  subtitle: string;
  trademark: string;
  description: string;
  features: { label: string; description: string }[];
  layout: "content-left" | "content-right";
  glowColor: string;
  image?: string;
  imageAspectRatio?: string;
  imageLoopDurationMs?: number;
};

type CardData = StandardCard | AccordionCardData;

function isAccordionCard(card: CardData): card is AccordionCardData {
  return card.layout === "accordion";
}

/* ============================================
   DATA
   ============================================ */

const cards: CardData[] = [
  {
    id: "create",
    title: "Create",
    subtitle: "with Lyra",
    trademark: "\u00AE",
    description:
      "Lyra reads your source material the way an instructional designer would — and writes the course back. Branded. Structured. Multilingual. Audit-ready. In minutes, not months.",
    features: [
      {
        label: "Prompt to life",
        description:
          "Tell Lyra what you want to teach, who it's for, and where it'll run. Compliance training across four jurisdictions. Onboarding for a clinical sales team. Product education for installers. One prompt. Whole course.",
      },
      {
        label: "Source to course",
        description:
          "Drop in your SOPs, IFUs, release notes, or a 200-page manual. Lyra extracts the teachable moments, sequences them by what learners need first, and structures the course around the outcome — not the document.",
      },
    ],
    layout: "content-left" as const,
    glowColor: "rgba(250, 103, 124, 0.15)",
    image: "/assets/combined-animated.svg",
    imageAspectRatio: "2058 / 1465",
    imageLoopDurationMs: 8000,
  },
  {
    id: "design",
    title: "Rapid",
    subtitle: "outline",
    trademark: " ",
    description:
      "Lyra doesn't generate slides. She — it — generates an architecture. Modules, dependencies, prerequisites, assessments, and the regional variants you'll need before you've thought to ask.",
    features: [
      {
        label: "Branching",
        description:
          "Knowledge DNA™ links every module to its source, its prerequisites, and its regional variant. When the underlying SOP changes, the course updates with it.",
      },
      {
        label: "Governed by design",
        description:
          "Cogniate's Rules-Based Governance Engine enforces instructional quality before anything ships. No hallucinated facts. No off-brand language. No compliance gaps.",
      },
    ],
    layout: "content-right" as const,
    glowColor: "rgba(183, 139, 249, 0.15)",
    image: "/assets/style-course.svg",
    imageAspectRatio: "1280 / 935",
    imageLoopDurationMs: 12000,
  },
  {
    id: "publish",
    title: "Features, not friction.",
    layout: "accordion" as const,
    glowColor: "rgba(252, 232, 158, 0.12)",
    pills: [
      {
        label: "Course editor",
        description:
          "A powerful editing experience that brings a library of pre-built components to customise your course.",
      },
      {
        label: "Analytics",
        description:
          "Track learner progress and engagement with real-time dashboards. Understand what courses are working. Optimise and improve.",
      },
      {
        label: "Branded as yours",
        description:
          "Logo, palette, type, voice — all baked in. TTRO ships TTRO courses. Roche ships Roche. IKEA ships IKEA. Your campus. Your brand. Cogniate is invisible.",
      },
      {
        label: "Audit-ready output",
        description:
          "Every course ships with completion data, version history, and source traceability built in. SCORM, xAPI, or native Cogniate. The auditor's question is answered before it's asked.",
      },
    ],
    visuals: [
      "/assets/Accordion-Image-1.png",
      "/assets/Accordion-Image-2.png",
      "/assets/Accordion-Image-3.png",
      "/assets/Accordion-Image-4.png",
    ],
    coverImage: "/assets/Accordion-Image-1.png",
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
  card: StandardCard;
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

      {/* Decorative vertical lines — 7 evenly-spaced subtle lines */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none overflow-hidden rounded-[20px]"
      >
        {[44, 54, 64, 74, 84, 94, 104].map((pct) => (
          <div
            key={pct}
            className="absolute top-0 h-[140%] -translate-y-[15%]"
            style={{
              left: `${isLeft ? pct : 100 - pct}%`,
              width: "1px",
              background:
                "linear-gradient(to bottom, transparent, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.06) 80%, transparent)",
            }}
          />
        ))}
      </div>

      {/* Decorative ellipse glow */}
      <div
        aria-hidden
        className="absolute pointer-events-none overflow-hidden inset-0 rounded-[20px]"
      >
        <div
          className="absolute"
          style={{
            width: "94%",
            height: "118%",
            [isLeft ? "right" : "left"]: "-10%",
            bottom: "-60%",
            background: `radial-gradient(ellipse at center, ${card.glowColor} 0%, transparent 65%)`,
          }}
        />
      </div>

      {/* Content side */}
      <div
        className={`relative z-10 shrink-0 w-full lg:w-[400px] xl:w-[455px] ${!isLeft ? "lg:order-2" : ""
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-[27px]">
          {card.features.map((feature, i) => (
            <FeatureBlock
              key={i}
              label={feature.label}
              description={feature.description}
            />
          ))}
        </div>
      </div>

      {/* Placeholder side — extends to card edge, clipped by card border-radius */}
      <div
        className={`relative z-10 w-full lg:flex-1 overflow-hidden rounded-[20px] ${isLeft
          ? "lg:rounded-r-none lg:-mr-[60px] xl:-mr-[80px]"
          : "lg:rounded-l-none lg:-ml-[60px] xl:-ml-[80px] lg:order-1"
          }`}
        style={{
          ...(card.imageAspectRatio
            ? { aspectRatio: card.imageAspectRatio }
            : { height: "clamp(280px, 34vw, 520px)" }),
          background: "#24202c",
        }}
      >
        {card.image?.endsWith(".svg") ? (
          <LoopingSvg
            src={card.image}
            durationMs={card.imageLoopDurationMs ?? 8000}
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <Image
            src={card.image ?? "/assets/platform-card-gradient.png"}
            alt=""
            fill
            className={card.imageAspectRatio ? "object-contain" : "object-cover"}
          />
        )}
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
      /* --- Desktop: scrub-based card stack animation --- */
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        // Card 1: offset from viewport-center to sit below the title
        const titleBottom = title.getBoundingClientRect().bottom;
        const card1Rect = cardEls[0].getBoundingClientRect();
        const card1Offset = titleBottom + 30 - card1Rect.top;
        gsap.set(cardEls[0], { y: card1Offset });

        // Cards 2+: hidden below viewport, will animate to center (y: 0)
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

        // Scroll the title out of view. fromTo + immediateRender:false anchors
        // the start values to the timeline so a refresh deep in the section
        // can't leave the title stuck at its visible state.
        tl.fromTo(
          title,
          { y: 0, opacity: 1, immediateRender: false },
          {
            y: "-100%",
            opacity: 0,
            duration: 0.3,
            ease: "none",
          },
          0
        );

        // Build N-1 transition segments
        // Each segment is self-contained: enter completes before next exit starts
        const transitionCount = cardEls.length - 1;
        const segmentDuration = 1;

        for (let i = 0; i < transitionCount; i++) {
          const exitCard = cardEls[i];
          const enterCard = cardEls[i + 1];
          const segmentStart = i * segmentDuration;

          // Current card scales down and moves up (full segment)
          tl.to(
            exitCard,
            {
              y: "-25%",
              scale: 0.85,
              opacity: 0,
              duration: segmentDuration * 0.7,
              ease: "none",
            },
            segmentStart
          );

          // Next card rises in — starts early, finishes well before segment ends
          tl.to(
            enterCard,
            {
              y: "0%",
              scale: 1,
              opacity: 1,
              duration: segmentDuration * 0.5,
              ease: "none",
            },
            segmentStart + segmentDuration * 0.25
          );
        }
      });

      /* --- Mobile: title entrance + simple fade-in per card --- */
      mm.add("(max-width: 1023px)", () => {
        gsap.fromTo(
          title,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
              end: "top top",
              scrub: 0.6,
            },
          }
        );

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
      id="platform"
      ref={sectionRef}
      data-testid="platform-section"
      className="relative bg-bg-secondary"
    >
      {/* Dynamic height based on card count — only applied on desktop */}
      <style>{`@media (min-width: 1024px) { [data-testid="platform-section"] { height: ${cards.length * 150}vh; } }`}</style>
      <div className="lg:sticky lg:top-0 lg:h-screen flex flex-col items-center overflow-hidden py-16 lg:py-0">
        {/* ===== VIDEO BACKGROUND (with top/bottom blend gradients) ===== */}
        <PlatformVideoBG />

        {/* ===== SECTION TITLE ===== */}
        <h2
          ref={titleRef}
          className="landscape-heading-gradient relative z-10 text-center font-semibold tracking-[-0.04em] text-[32px] md:text-[48px] lg:text-[56px] xl:text-[64px] leading-[1.1] mt-12 lg:mt-[60px] xl:mt-[80px] max-w-[900px] xl:max-w-[1306px] px-6"
        >
          AI-native course authoring.
          <br />
          The first of its kind.
        </h2>

        {/* ===== CARDS CONTAINER ===== */}
        {/* Desktop: absolute inset-0 spans full viewport for centering. Mobile: normal flow. */}
        <div className="relative z-10 w-full max-w-[1301px] mx-auto px-5 mt-8 flex flex-col gap-8 lg:absolute lg:inset-0 lg:max-w-none lg:mx-0 lg:mt-0 lg:px-0 lg:gap-0">
          {cards.map((card, i) => (
            <div
              key={card.id}
              ref={setCardRef(i)}
              className="lg:absolute lg:inset-0 lg:my-auto lg:h-fit lg:max-w-[1301px] lg:mx-auto lg:px-6"
            >
              {isAccordionCard(card) ? (
                <PlatformCardAccordion card={card} />
              ) : (
                <PlatformCard card={card} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
