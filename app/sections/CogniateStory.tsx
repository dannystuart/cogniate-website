"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import StoryIcon from "../components/StoryIcon";
import StoryTooltip from "../components/StoryTooltip";
import type { IconTarget } from "../components/ParticleSwarm";

gsap.registerPlugin(ScrollTrigger);

// Three.js / R3F is browser-only; defer SSR.
const ParticleSwarm = dynamic(
  () => import("../components/ParticleSwarm"),
  { ssr: false }
);

// Anchor positions inside the SVG container (% of container box). Mirrors the
// existing absolute-positioned children below — kept in one place so the
// particle target maths and the DOM layout can't diverge.
const PERCENT_ANCHORS = {
  logoCenter: { left: 50.4, top: 50.0 },
  problem: { left: 32.0157, top: 49.9562 },
  mission: { left: 50.4449, top: 0.0957 },
  insight: { left: 68.8741, top: 49.9562 },
  // Final blob sits at the very bottom of the concentric-circles SVG — past
  // the inner circle, near the outer circle's lower edge. The hand-off point
  // for a future video reveal that drops in from below.
  blob: { left: 50.4, top: 96.0 },
} as const;

const CLUSTER_TINTS: Record<"problem" | "mission" | "insight", [number, number, number]> = {
  problem: [0.98, 0.404, 0.486], // salmon — rgba(250,103,124)
  mission: [0.675, 0.486, 0.945], // lavender — rgba(172,124,241)
  insight: [0.408, 0.914, 0.635], // mint — rgba(104,233,162)
};

/** Convert the layout's percentage anchors into scene units (CSS pixels relative
 *  to the inner-circle centre, scene Y up). Recomputed on ScrollTrigger refresh. */
function computeSwarmTargets(
  rect: DOMRect
): { iconTargets: IconTarget[]; blobCenter: { x: number; y: number } } {
  const { width, height } = rect;
  const centerLeft = (PERCENT_ANCHORS.logoCenter.left / 100) * width;
  const centerTop = (PERCENT_ANCHORS.logoCenter.top / 100) * height;
  const px = (left: number, top: number) => ({
    x: (left / 100) * width - centerLeft,
    y: -((top / 100) * height - centerTop),
  });
  return {
    iconTargets: [
      { ...px(PERCENT_ANCHORS.problem.left, PERCENT_ANCHORS.problem.top), tint: CLUSTER_TINTS.problem },
      { ...px(PERCENT_ANCHORS.mission.left, PERCENT_ANCHORS.mission.top), tint: CLUSTER_TINTS.mission },
      { ...px(PERCENT_ANCHORS.insight.left, PERCENT_ANCHORS.insight.top), tint: CLUSTER_TINTS.insight },
    ],
    blobCenter: px(PERCENT_ANCHORS.blob.left, PERCENT_ANCHORS.blob.top),
  };
}

/** Linear ramp from `(fromIn → fromOut)` of progress to `(toIn → toOut)` of value,
 *  clamped at the ends. Used by the rAF loop to drive CSS variables. */
function ramp(p: number, fromIn: number, fromOut: number, toIn: number, toOut: number): number {
  if (p <= fromIn) return toIn;
  if (p >= fromOut) return toOut;
  const t = (p - fromIn) / (fromOut - fromIn);
  return toIn + (toOut - toIn) * t;
}

/*
  Figma reference (section 1728×1137, circles SVG viewBox 1718×635):

  Circle geometry (from SVG):
    Outer circle:  cx=866.6  cy=317.2  r=316.6
    2nd circle:    cx=869.3  cy=317.2  r=209.4
    3rd circle:    cx=869.3  cy=317.2  r=168.3
    Inner circle:  cx=869.3  cy=317.2  r=125.1
    Horiz line:    y=317.2, spans full width

  Icon CENTERS as % of circles container (viewBox 1718×635) — placed where
  the points sit on the line background in the reference screenshot:
    Warning:   32.0157%  49.9562%   — left intersection of horiz line × outer arc (9 o'clock)
    Flag:      50.4449%   0.0957%   — top of outer arc (12 o'clock)
    Lightbulb: 68.8741%  49.9562%   — right intersection of horiz line × outer arc (3 o'clock)
    Logo:      50.5980%  49.9567%   — centred on inner-circle group
*/

const stories = [
  {
    id: "problem",
    icon: "/assets/story-warning-icon.svg",
    label: "PROBLEM",
    title: "Dated workflows",
    description:
      "Acknowledge the problem is systemic, not individual. L&D leaders are talented people stuck in broken workflows.",
    size: 147,
    glowColor: "rgba(250, 103, 124, 0.5)",
    // Tooltip: warm cream → soft salmon (Figma reference, matches the salmon
    // cluster); ambient glow uses the cluster tint at low alpha.
    gradientFrom: "#fce3b6",
    gradientTo: "#fcafb1",
    accentColor: "rgba(250, 103, 124, 0.18)",
  },
  {
    id: "mission",
    icon: "/assets/story-flag-icon.svg",
    label: "MISSION",
    title: "Collapse the gap",
    description:
      "To collapse the gap between an idea and a world-class learning experience.",
    size: 120,
    glowColor: "rgba(172, 124, 241, 0.5)",
    gradientFrom: "#e3d4fc",
    gradientTo: "#c4afff",
    accentColor: "rgba(172, 124, 241, 0.18)",
  },
  {
    id: "insight",
    icon: "/assets/story-lightbulb-icon.svg",
    label: "INSIGHT",
    title: "Omnichannel",
    description:
      "Cogniate is the first and only omnichannel, AI-native course authoring platform built for enterprise.",
    size: 120,
    glowColor: "rgba(104, 233, 162, 0.5)",
    gradientFrom: "#d4fce3",
    gradientTo: "#9be9b6",
    accentColor: "rgba(104, 233, 162, 0.18)",
  },
] as const;

export default function CogniateStory() {
  const [activeStory, setActiveStory] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Mobile: open the first story tooltip by default so the accordion lands in
  // its expanded state. Desktop tooltips are gated behind hover + scroll
  // progress, so this only affects the mobile column. Done in an effect (not a
  // useState initializer) to avoid a hydration mismatch on the mobile column.
  useEffect(() => {
    if (window.matchMedia("(max-width: 1023px)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveStory("problem");
    }
  }, []);
  const desktopLayoutRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  // Pixel offset from the desktop wrapper's centre (= Canvas centre) to the
  // SVG container's centre on screen. Updated on ScrollTrigger refresh so the
  // particle silhouette lands over the DOM logo PNG. Scene Y is up so this
  // flips the sign on the Y component relative to the DOMRect coords.
  const originOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [swarmTargets, setSwarmTargets] = useState<ReturnType<
    typeof computeSwarmTargets
  > | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const desktop = desktopLayoutRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Heading fade — applies to both desktop and mobile copies via class.
      gsap.fromTo(
        ".story-heading",
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

      // Below this point: desktop-only choreography. Mobile bypasses the entire
      // particle system because ParticleSwarm is mounted inside the lg:block
      // branch only — no mount, no GPU work.
      if (!desktop) return;

      // Dev-only test hook: ?particleProgress=0.30 forces progressRef to the
      // given value and skips the pin, so Playwright can snapshot resting
      // states deterministically. NODE_ENV gate keeps it out of production.
      if (process.env.NODE_ENV !== "production") {
        const forced = new URL(window.location.href).searchParams.get("particleProgress");
        if (forced !== null) {
          const v = Math.max(0, Math.min(1, parseFloat(forced)));
          progressRef.current = v;
          const circles = desktop.querySelector<HTMLDivElement>(".story-circles-container");
          if (circles) {
            const svgRect = circles.getBoundingClientRect();
            const wrapperRect = desktop.getBoundingClientRect();
            originOffsetRef.current = {
              x: svgRect.left + svgRect.width / 2 - (wrapperRect.left + wrapperRect.width / 2),
              y: wrapperRect.top + wrapperRect.height / 2 - (svgRect.top + svgRect.height / 2),
            };
            setSwarmTargets(computeSwarmTargets(svgRect));
          }
          return; // skip both the reduced-motion branch and the pinned trigger
        }
      }

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduced) {
        // Reduced motion: skip the pin and the particles. Fade logo + icons in
        // via a simple top:70% trigger and park progress at the end state so
        // any mounted ParticleSwarm renders the resting blob.
        gsap.fromTo(
          desktop.querySelectorAll<HTMLElement>("[data-particle-fade]"),
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: desktop,
              start: "top 70%",
              toggleActions: "play none none none",
            },
          }
        );
        progressRef.current = 1;
        return;
      }

      // Pinned scrub trigger — single source of truth for scroll progress.
      // The desktop wrapper is min-h-screen so "top top" pins it filling the
      // viewport; +=150% gives a comfortable scroll length to resolve the full
      // choreography (~2–4s of real-time scrolling).
      ScrollTrigger.create({
        trigger: desktop,
        start: "top top",
        end: "+=150%",
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          progressRef.current = self.progress;
        },
        onRefresh: () => {
          const circles = desktop.querySelector<HTMLDivElement>(
            ".story-circles-container"
          );
          if (!circles) return;
          const svgRect = circles.getBoundingClientRect();
          const wrapperRect = desktop.getBoundingClientRect();
          // Origin offset: pixel translation in scene-space (Y up) from the
          // wrapper's centre (Canvas centre) to the SVG container's centre.
          // Lets us mount the Canvas as a viewport-filling sibling of heading
          // and circles while the formed silhouette still lands over the DOM
          // logo PNG inside the SVG container.
          const svgCx = svgRect.left + svgRect.width / 2;
          const svgCy = svgRect.top + svgRect.height / 2;
          const wrapperCx = wrapperRect.left + wrapperRect.width / 2;
          const wrapperCy = wrapperRect.top + wrapperRect.height / 2;
          originOffsetRef.current = {
            x: svgCx - wrapperCx,
            y: wrapperCy - svgCy, // scene Y up; DOM Y down
          };
          setSwarmTargets(computeSwarmTargets(svgRect));
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  // rAF loop — drives DOM crossfades from the same progressRef the particle
  // shader reads. Writing CSS custom properties on the desktop root avoids React
  // re-renders during scroll. Pauses cleanly when the tab is hidden.
  useEffect(() => {
    const desktop = desktopLayoutRef.current;
    if (!desktop) return;
    let rafId = 0;
    let stopped = false;

    const tick = () => {
      if (stopped) return;
      if (!document.hidden) {
        const p = progressRef.current;
        // Logo PNG fades in as the particle silhouette locks (≈25→35%).
        desktop.style.setProperty("--logo-opacity", String(ramp(p, 0.25, 0.35, 0, 1)));
        // Each icon fades in at its cluster's arrival window.
        desktop.style.setProperty("--icon-problem-opacity", String(ramp(p, 0.45, 0.55, 0, 1)));
        desktop.style.setProperty("--icon-mission-opacity", String(ramp(p, 0.50, 0.60, 0, 1)));
        desktop.style.setProperty("--icon-insight-opacity", String(ramp(p, 0.55, 0.65, 0, 1)));
        // Tooltips become available only once the section reaches the hold beat.
        desktop.style.setProperty("--tooltip-pointer", p > 0.65 ? "auto" : "none");
        // Final ramp — fades the entire desktop tableau (particle Canvas + icons +
        // logo + SVG circles) to 0 across the last 8% of the pin so CogniateLyraReveal
        // can crossfade its video in without a visible pinch-cut at the section seam.
        // Set on documentElement (not just `desktop`) so CogniateLyraReveal's rAF loop
        // can read it without traversing the pin-spacer that ScrollTrigger inserts
        // around the desktop wrapper. Story's own elements still inherit it from the
        // root via the cascade.
        document.documentElement.style.setProperty(
          "--story-fadeout",
          String(ramp(p, 0.92, 1.0, 1, 0))
        );
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => {
      stopped = true;
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      data-testid="cogniate-story-section"
      className="relative w-full bg-bg-secondary overflow-x-hidden py-5 lg:py-0"
    >
      {/* === DESKTOP LAYOUT — viewport-filling wrapper that gets pinned ===
          Heading + circles live inside this wrapper so they both stay visible
          during the pinned scroll. The Canvas mounts as a sibling that covers
          the entire wrapper, giving particles the full viewport to scatter
          across rather than just the SVG container's narrow aspect-ratio box. */}
      <div
        ref={desktopLayoutRef}
        className="relative z-10 hidden min-h-screen flex-col items-center justify-center lg:flex"
      >
        {/* Particle swarm — covers the whole wrapper; pointer-events:none so
            icons remain clickable. Mounted only after swarmTargets resolves on
            the first ScrollTrigger.refresh, which guarantees the rect is sized.
            originOffsetRef translates the scene from wrapper-centre to the SVG
            container's centre on screen so the formed silhouette aligns with
            the DOM logo PNG. */}
        {swarmTargets && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              opacity: "var(--story-fadeout, 1)",
              // Soft radial vignette so scattered particles fade toward the
              // viewport edges rather than slamming into the section seam.
              // Inner stop at 35% keeps the silhouette and icon halos fully
              // opaque; outer stop at 100% lets corner particles dissolve.
              maskImage:
                "radial-gradient(ellipse 70% 80% at center, black 35%, transparent 100%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 70% 80% at center, black 35%, transparent 100%)",
            }}
          >
            <ParticleSwarm
              scrollProgress={progressRef}
              logoSrc="/assets/story-cogniate-logo.png"
              iconTargets={swarmTargets.iconTargets}
              blobCenter={swarmTargets.blobCenter}
              originOffsetRef={originOffsetRef}
              className="absolute inset-0"
            />
          </div>
        )}

        {/* Heading — relative so it stacks above the absolutely-positioned
            particles via DOM order (no z-index needed). Fades with the rest of
            the Story tableau via --story-fadeout so the title doesn't linger
            on top of CogniateLyraReveal's video during the crossfade hand-off. */}
        <div
          className="relative w-full max-w-[1330px] px-5 md:px-6"
          style={{ opacity: "var(--story-fadeout, 1)" }}
        >
          <h2 className="story-heading landscape-heading-gradient text-center text-h2-mobile sm:text-h2-tablet lg:text-h2-desktop font-[var(--font-weight-h2)] leading-[var(--leading-h2)] tracking-[var(--tracking-h2)]">
            Learning is a journey.
            <br />
            The Cogniate story.
          </h2>
        </div>

        {/* Circles container — same size and aspect ratio as before, just
            nested one level deeper inside the new flex wrapper. */}
        <div className="relative mt-16 w-full px-4 xl:mt-20">
          <div
            className="story-circles-container relative mx-auto"
            style={{ maxWidth: 1700, aspectRatio: "1718 / 635" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/story-concentric-circles.svg"
              alt=""
              className="absolute inset-0 size-full"
              draggable={false}
              style={{ opacity: "var(--story-fadeout, 1)" }}
            />

            {/* Icon/logo layer — fades with --story-fadeout so the Story tableau
              crossfades into the Reveal's video at the section seam. */}
            <div className="absolute inset-0" style={{ opacity: "var(--story-fadeout, 1)" }}>

              {/* Cogniate Logo — centered on circles */}
              <div
                data-particle-fade
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: "50.4%",
                  top: "50%",
                  width: 130,
                  height: 122,
                  opacity: "var(--logo-opacity, 0)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/story-cogniate-logo.png"
                  alt="Cogniate"
                  className="size-full object-contain"
                  draggable={false}
                />
              </div>

              {/* Warning Icon — left intersection of horiz line × outer arc (9 o'clock) */}
              <div
                data-particle-fade
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: "32.0157%",
                  top: "49.9562%",
                  opacity: "var(--icon-problem-opacity, 0)",
                  pointerEvents: "var(--tooltip-pointer, none)" as React.CSSProperties["pointerEvents"],
                }}
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
                  className={`absolute right-[100%] top-1/2 -translate-y-1/2 mr-4 w-[340px] z-20 transition-all duration-300 pointer-events-none ${activeStory === "problem"
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-2"
                    }`}
                >
                  <StoryTooltip
                    label={stories[0].label}
                    title={stories[0].title}
                    description={stories[0].description}
                    icon={stories[0].icon}
                    gradientFrom={stories[0].gradientFrom}
                    gradientTo={stories[0].gradientTo}
                    accentColor={stories[0].accentColor}
                  />
                </div>
              </div>

              {/* Flag Icon — top of outer arc (12 o'clock) */}
              <div
                data-particle-fade
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: "50.4449%",
                  top: "0.0957%",
                  opacity: "var(--icon-mission-opacity, 0)",
                  pointerEvents: "var(--tooltip-pointer, none)" as React.CSSProperties["pointerEvents"],
                }}
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
                  className={`absolute left-1/2 -translate-x-1/2 top-[100%] mt-4 w-[340px] z-20 transition-all duration-300 pointer-events-none ${activeStory === "mission"
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-2"
                    }`}
                >
                  <StoryTooltip
                    label={stories[1].label}
                    title={stories[1].title}
                    description={stories[1].description}
                    icon={stories[1].icon}
                    gradientFrom={stories[1].gradientFrom}
                    gradientTo={stories[1].gradientTo}
                    accentColor={stories[1].accentColor}
                  />
                </div>
              </div>

              {/* Lightbulb Icon — right intersection of horiz line × outer arc (3 o'clock) */}
              <div
                data-particle-fade
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: "68.8741%",
                  top: "49.9562%",
                  opacity: "var(--icon-insight-opacity, 0)",
                  pointerEvents: "var(--tooltip-pointer, none)" as React.CSSProperties["pointerEvents"],
                }}
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
                  className={`absolute left-[100%] top-1/2 -translate-y-1/2 ml-4 w-[340px] z-20 transition-all duration-300 pointer-events-none ${activeStory === "insight"
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-2"
                    }`}
                >
                  <StoryTooltip
                    label={stories[2].label}
                    title={stories[2].title}
                    description={stories[2].description}
                    icon={stories[2].icon}
                    gradientFrom={stories[2].gradientFrom}
                    gradientTo={stories[2].gradientTo}
                    accentColor={stories[2].accentColor}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* end story-circles-container */}
        </div>
        {/* end circles wrapper */}
      </div>
      {/* end desktop wrapper */}

      {/* === MOBILE LAYOUT — duplicate heading + accordion === */}
      <div className="relative mx-auto max-w-[1330px] p-14 md:px-6 md:py-0 lg:hidden">
        <h2 className="story-heading landscape-heading-gradient text-center text-h2-mobile sm:text-h2-tablet font-[var(--font-weight-h2)] leading-[var(--leading-h2)] tracking-[var(--tracking-h2)]">
          Learning is a journey.
          <br />
          The Cogniate story.
        </h2>
        <div className="mt-12 flex flex-col items-center gap-6">
          {stories.map((story) => (
            <div
              key={story.id}
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
                className={`w-full overflow-hidden transition-all duration-300 ease-in-out ${activeStory === story.id
                  ? "max-h-[400px] opacity-100 mt-4"
                  : "max-h-0 opacity-0 mt-0"
                  }`}
              >
                <StoryTooltip
                  label={story.label}
                  title={story.title}
                  description={story.description}
                  icon={story.icon}
                  gradientFrom={story.gradientFrom}
                  gradientTo={story.gradientTo}
                  accentColor={story.accentColor}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
