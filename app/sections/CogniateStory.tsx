"use client";

import { useState } from "react";
import StoryIcon from "../components/StoryIcon";
import StoryTooltip from "../components/StoryTooltip";

const stories = [
  {
    id: "problem",
    icon: "/assets/story-warning-icon.svg",
    label: "PROBLEM",
    title: "Story 1",
    description:
      "Acknowledge the problem is systemic, not individual. L&D leaders are talented people stuck in broken workflows.",
    size: 139,
  },
  {
    id: "mission",
    icon: "/assets/story-flag-icon.svg",
    label: "MISSION",
    title: "Story 2",
    description:
      "Placeholder: describe the mission and goals that drive the Cogniate platform forward.",
    size: 120,
  },
  {
    id: "insight",
    icon: "/assets/story-lightbulb-icon.svg",
    label: "INSIGHT",
    title: "Story 3",
    description:
      "Placeholder: explain the key insight that led to building Cogniate and how it transforms learning.",
    size: 120,
  },
] as const;

export default function CogniateStory() {
  const [activeStory, setActiveStory] = useState<string | null>(null);

  return (
    <section
      data-testid="cogniate-story-section"
      className="relative w-full bg-bg-secondary overflow-x-hidden py-20 lg:pt-32 lg:pb-52"
    >
      <div className="relative mx-auto max-w-[1330px] px-5 md:px-6">
        {/* Heading */}
        <h2 className="story-heading-gradient text-center text-[32px] sm:text-[48px] lg:text-[64px] font-semibold leading-[1.3] tracking-[-0.04em]">
          <span className="font-serif italic">Learning</span> is a journey.
          <br />
          The <span className="font-serif italic">Cogniate</span> story.
        </h2>

        {/* === DESKTOP LAYOUT === */}
        <div className="hidden lg:block relative mt-16">
          {/* Concentric circles background - aspect ratio matches SVG viewBox 1718:635 */}
          <div
            className="relative mx-auto"
            style={{ width: "100%", maxWidth: 1200, aspectRatio: "1718 / 635" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/story-concentric-circles.svg"
              alt=""
              className="absolute inset-0 size-full"
              draggable={false}
            />

            {/* Cogniate Logo - centered on the circles */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ width: 130, height: 122 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/story-cogniate-logo.png"
                alt="Cogniate"
                className="size-full object-contain"
                draggable={false}
              />
            </div>

            {/* Warning Icon - bottom left of circles */}
            <div
              className="absolute"
              style={{ left: "18%", bottom: "-16%" }}
            >
              <StoryIcon
                src="/assets/story-warning-icon.svg"
                alt="Problem"
                size={139}
                isActive={activeStory === "problem"}
                onMouseEnter={() => setActiveStory("problem")}
                onMouseLeave={() => setActiveStory(null)}
              />
              {/* Tooltip - above-right of icon */}
              <div
                className={`absolute left-[80px] bottom-[120px] w-[450px] z-20 transition-all duration-300 pointer-events-none ${
                  activeStory === "problem"
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-2"
                }`}
              >
                <StoryTooltip
                  label={stories[0].label}
                  title={stories[0].title}
                  description={stories[0].description}
                  icon={stories[0].icon}
                />
                {/* Decorative glow */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[500px] h-[200px] rounded-full bg-accent-purple/10 blur-3xl pointer-events-none" />
              </div>
            </div>

            {/* Flag Icon - top center, just above the outer circle */}
            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={{ top: "-14%" }}
            >
              <StoryIcon
                src="/assets/story-flag-icon.svg"
                alt="Mission"
                size={120}
                isActive={activeStory === "mission"}
                onMouseEnter={() => setActiveStory("mission")}
                onMouseLeave={() => setActiveStory(null)}
              />
              {/* Tooltip - below icon */}
              <div
                className={`absolute left-1/2 -translate-x-1/2 top-[140px] w-[450px] z-20 transition-all duration-300 pointer-events-none ${
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
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[500px] h-[200px] rounded-full bg-accent-purple/10 blur-3xl pointer-events-none" />
              </div>
            </div>

            {/* Lightbulb Icon - bottom right of circles */}
            <div
              className="absolute"
              style={{ right: "18%", bottom: "-16%" }}
            >
              <StoryIcon
                src="/assets/story-lightbulb-icon.svg"
                alt="Insight"
                size={120}
                isActive={activeStory === "insight"}
                onMouseEnter={() => setActiveStory("insight")}
                onMouseLeave={() => setActiveStory(null)}
              />
              {/* Tooltip - left of icon */}
              <div
                className={`absolute right-[140px] top-1/2 -translate-y-1/2 w-[450px] z-20 transition-all duration-300 pointer-events-none ${
                  activeStory === "insight"
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-2"
                }`}
              >
                <StoryTooltip
                  label={stories[2].label}
                  title={stories[2].title}
                  description={stories[2].description}
                  icon={stories[2].icon}
                />
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[500px] h-[200px] rounded-full bg-accent-purple/10 blur-3xl pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* === MOBILE LAYOUT === */}
        <div className="lg:hidden mt-12 flex flex-col items-center gap-6">
          {stories.map((story) => (
            <div key={story.id} className="flex flex-col items-center w-full">
              <StoryIcon
                src={story.icon}
                alt={story.label}
                size={story.size}
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
