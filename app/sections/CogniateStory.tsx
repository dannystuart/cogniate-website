"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import StoryIcon from "../components/StoryIcon";
import StoryTooltip from "../components/StoryTooltip";

gsap.registerPlugin(ScrollTrigger);

/*
  Figma reference (section 1728×1137, circles SVG viewBox 1718×635):

  Circle geometry (from SVG):
    Outer circle:  cx=866.6  cy=317.2  r=316.6
    2nd circle:    cx=869.3  cy=317.2  r=209.4
    3rd circle:    cx=869.3  cy=317.2  r=168.3
    Inner circle:  cx=869.3  cy=317.2  r=125.1
    Horiz line:    y=317.2, spans full width

  Icon CENTERS as % of circles container (viewBox 1718×635):
    Warning:   35.7%  68.0%   — sits on outer arc, ~8 o'clock
    Flag:      52.7%  14.2%   — between 2nd/outer arc, ~1 o'clock
    Lightbulb: 68.9%  58.7%   — right on outer arc, ~4 o'clock
    Logo:      50.9%  50.0%   — centered
*/

const stories = [
  {
    id: "problem",
    icon: "/assets/story-warning-icon.svg",
    label: "PROBLEM",
    title: "Story 1",
    description:
      "Acknowledge the problem is systemic, not individual. L&D leaders are talented people stuck in broken workflows.",
    size: 147,
    glowColor: "rgba(250, 103, 124, 0.5)",
  },
  {
    id: "mission",
    icon: "/assets/story-flag-icon.svg",
    label: "MISSION",
    title: "Story 2",
    description:
      "Placeholder: describe the mission and goals that drive the Cogniate platform forward.",
    size: 120,
    glowColor: "rgba(172, 124, 241, 0.5)",
  },
  {
    id: "insight",
    icon: "/assets/story-lightbulb-icon.svg",
    label: "INSIGHT",
    title: "Story 3",
    description:
      "Placeholder: explain the key insight that led to building Cogniate and how it transforms learning.",
    size: 120,
    glowColor: "rgba(104, 233, 162, 0.5)",
  },
] as const;

export default function CogniateStory() {
  const [activeStory, setActiveStory] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    if (!section || !heading) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        heading,
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

      iconRefs.current.forEach((icon, i) => {
        if (!icon) return;
        gsap.fromTo(
          icon,
          { opacity: 0, scale: 0.6, y: 20 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.6,
            ease: "back.out(1.4)",
            delay: i * 0.2,
            scrollTrigger: {
              trigger: section,
              start: "top 60%",
              toggleActions: "play none none none",
            },
          }
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-testid="cogniate-story-section"
      className="relative w-full bg-bg-secondary overflow-x-hidden py-20 lg:pt-32 lg:pb-52"
    >
      {/* Heading — in content container */}
      <div className="relative mx-auto max-w-[1330px] px-5 md:px-6">
        <h2
          ref={headingRef}
          className="landscape-heading-gradient text-center text-h2-mobile sm:text-h2-tablet lg:text-h2-desktop font-[var(--font-weight-h2)] leading-[var(--leading-h2)] tracking-[var(--tracking-h2)]"
        >
          Learning is a journey.
          <br />
          The Cogniate story.
        </h2>
      </div>

      {/* === DESKTOP LAYOUT — wider container to match Figma proportions === */}
      <div className="hidden lg:block relative mt-16 px-4">
        <div
          className="relative mx-auto"
          style={{ maxWidth: 1700, aspectRatio: "1718 / 635" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/story-concentric-circles.svg"
            alt=""
            className="absolute inset-0 size-full"
            draggable={false}
          />

          {/* Cogniate Logo — centered on circles */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: "50.4%", top: "50%", width: 130, height: 122 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/story-cogniate-logo.png"
              alt="Cogniate"
              className="size-full object-contain"
              draggable={false}
            />
          </div>

          {/* Warning Icon — outer arc, ~8 o'clock */}
          <div
            ref={(el) => { iconRefs.current[0] = el; }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: "35.7%", top: "68%" }}
          >
            <StoryIcon
              src="/assets/story-warning-icon.svg"
              alt="Problem"
              size={stories[0].size}
              glowColor={stories[0].glowColor}
              isActive={activeStory === "problem"}
              onMouseEnter={() => setActiveStory("problem")}
              onMouseLeave={() => setActiveStory(null)}
            />
            {/* Tooltip — to the left */}
            <div
              className={`absolute right-[100%] top-1/2 -translate-y-1/2 mr-4 w-[340px] z-20 transition-all duration-300 pointer-events-none ${
                activeStory === "problem"
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-2"
              }`}
            >
              <StoryTooltip
                label={stories[0].label}
                title={stories[0].title}
                description={stories[0].description}
                icon={stories[0].icon}
              />
            </div>
          </div>

          {/* Flag Icon — between 2nd/outer arc, ~1 o'clock */}
          <div
            ref={(el) => { iconRefs.current[1] = el; }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: "52.7%", top: "14.2%" }}
          >
            <StoryIcon
              src="/assets/story-flag-icon.svg"
              alt="Mission"
              size={stories[1].size}
              glowColor={stories[1].glowColor}
              isActive={activeStory === "mission"}
              onMouseEnter={() => setActiveStory("mission")}
              onMouseLeave={() => setActiveStory(null)}
            />
            {/* Tooltip — below */}
            <div
              className={`absolute left-1/2 -translate-x-1/2 top-[100%] mt-4 w-[340px] z-20 transition-all duration-300 pointer-events-none ${
                activeStory === "mission"
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-2"
              }`}
            >
              <StoryTooltip
                label={stories[1].label}
                title={stories[1].title}
                description={stories[1].description}
                icon={stories[1].icon}
              />
            </div>
          </div>

          {/* Lightbulb Icon — outer arc, ~4 o'clock */}
          <div
            ref={(el) => { iconRefs.current[2] = el; }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: "68.9%", top: "58.7%" }}
          >
            <StoryIcon
              src="/assets/story-lightbulb-icon.svg"
              alt="Insight"
              size={stories[2].size}
              glowColor={stories[2].glowColor}
              isActive={activeStory === "insight"}
              onMouseEnter={() => setActiveStory("insight")}
              onMouseLeave={() => setActiveStory(null)}
            />
            {/* Tooltip — to the right */}
            <div
              className={`absolute left-[100%] top-1/2 -translate-y-1/2 ml-4 w-[340px] z-20 transition-all duration-300 pointer-events-none ${
                activeStory === "insight"
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-2"
              }`}
            >
              <StoryTooltip
                label={stories[2].label}
                title={stories[2].title}
                description={stories[2].description}
                icon={stories[2].icon}
              />
            </div>
          </div>
        </div>
      </div>

      {/* === MOBILE LAYOUT === */}
      <div className="relative mx-auto max-w-[1330px] px-5 md:px-6">
        <div className="lg:hidden mt-12 flex flex-col items-center gap-6">
          {stories.map((story, i) => (
            <div
              key={story.id}
              ref={(el) => { if (i === 0) iconRefs.current[0] = el; }}
              className="flex flex-col items-center w-full"
            >
              <StoryIcon
                src={story.icon}
                alt={story.label}
                size={story.size}
                glowColor={story.glowColor}
                isActive={activeStory === story.id}
                onClick={() =>
                  setActiveStory((prev) =>
                    prev === story.id ? null : story.id
                  )
                }
              />

              {/* Accordion tooltip */}
              <div
                className={`w-full overflow-hidden transition-all duration-300 ease-in-out ${
                  activeStory === story.id
                    ? "max-h-[400px] opacity-100 mt-4"
                    : "max-h-0 opacity-0 mt-0"
                }`}
              >
                <StoryTooltip
                  label={story.label}
                  title={story.title}
                  description={story.description}
                  icon={story.icon}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
