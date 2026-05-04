"use client";

import { useEffect, useState } from "react";
import UnicornScene from "unicornstudio-react/next";
import EyebrowBadge from "../components/EyebrowBadge";
import ButtonPrimary from "../components/ButtonPrimary";
import ButtonSecondary from "../components/ButtonSecondary";
import NavMenu from "../components/NavMenu";
import ScrollIndicator from "../components/ScrollIndicator";
import VideoCard from "../components/VideoCard";
import MiniShowreelLightbox from "../components/MiniShowreelLightbox";
import { useFormModal } from "../lib/form-modal/FormModalProvider";

export default function Hero() {
  const { open: openFormModal } = useFormModal();
  // Mask the Unicorn Studio embed's hard pop-in by fading the whole hero
  // (background + content) up from 0 once mounted on the client.
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section id="hero" className="relative w-full overflow-hidden bg-bg-primary" style={{ minHeight: "max(100vh, 1000px)" }}>
      {/* ===== BACKGROUND LAYERS (absolute) ===== */}

      {/* Unicorn Studio Background */}
      <div
        className={`absolute inset-0 z-0 overflow-hidden transition-opacity duration-[1400ms] ease-out ${revealed ? "opacity-100" : "opacity-0"}`}
      >
        <div className="absolute inset-0 scale-[1.1] origin-center">
          <UnicornScene
            projectId="ndGLW9kfOIsYe2ysw9Zb"
            sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.1.11/dist/unicornStudio.umd.js"
            width="100%"
            height="100%"
            lazyLoad={false}
            production={false}
          />
        </div>
      </div>

      {/* Gradient BG Overlay */}
      <div className="absolute inset-0 z-[1] mix-blend-screen">
        <div className="w-full h-full backdrop-blur-[50px] bg-bg-primary/70 overflow-hidden">
          {/* Element 1 - purple glow top left */}
          <div className="absolute -top-[70%] left-[-60%] w-[110%] h-[120%]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/element-1.svg"
              alt=""
              className="w-full h-full"
            />
          </div>
          {/* Element 2 - light overlay */}
          <div className="absolute -top-[120%] left-[-50%] w-[90%] h-[160%] mix-blend-lighten">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/element-2.svg"
              alt=""
              className="w-full h-full"
            />
          </div>
          {/* Element 3 - bright overlay */}
          <div className="absolute -top-[140%] left-[-50%] w-[90%] h-[160%]" style={{ mixBlendMode: "plus-lighter" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/element-3.svg"
              alt=""
              className="w-full h-full"
            />
          </div>
        </div>
      </div>

      {/* Glow Ellipse - centered below heading */}
      <div className="absolute top-[42%] left-1/2 -translate-x-1/2 w-[55%] h-[35%] z-[2]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/glow-ellipse.svg"
          alt=""
          className="w-full h-full"
        />
      </div>

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[244px] z-[3]"
        style={{
          background:
            "linear-gradient(to top, #101011 10.376%, rgba(26, 27, 31, 0) 100%)",
        }}
      />

      {/* ===== NAVIGATION (absolute) ===== */}
      <NavMenu />

      {/* ===== CONTENT (auto layout) ===== */}
      <div
        className={`relative z-10 flex flex-col items-center pt-[220px] lg:pt-[280px] pb-[160px] lg:pb-[240px] px-5 md:px-6 mx-auto max-w-[1330px] transition-opacity duration-700 ease-out ${revealed ? "opacity-100" : "opacity-0"}`}
      >
        {/* Eyebrow */}
        <EyebrowBadge>AI POWERED COURSE CREATOR</EyebrowBadge>

        {/* Main Heading */}
        <h1 className="mt-8 md:mt-[42px] text-center px-2 sm:px-0">
          <span className="heading-gradient block text-h1-mobile sm:text-h1-tablet lg:text-h1-desktop font-[var(--font-weight-h1)] leading-[var(--leading-h1)] tracking-[var(--tracking-h1)]">
            The future of{" "}
            <span className="font-serif italic font-normal text-h1-italic-mobile sm:text-h1-italic-tablet lg:text-h1-italic-desktop tracking-[var(--tracking-h1)]">
              learning,
            </span>
          </span>
          <span className="heading-gradient block text-h1-mobile sm:text-h1-tablet lg:text-h1-desktop font-[var(--font-weight-h1)] leading-[var(--leading-h1)] tracking-[var(--tracking-h1)]">
            authored in minutes.
          </span>
        </h1>

        {/* Content Row: Description + CTAs */}
        <div className="mt-8 lg:mt-[42px] flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-[124px]">
          {/* Description */}
          <div className="text-center lg:text-right max-w-[420px] text-text-secondary text-body lg:text-body-lg tracking-[-0.01em]">
            <p className="leading-[1.4] font-light mb-4">
              Cogniate is an AI-native enterprise course{" "}
              <span className="whitespace-nowrap">co-authoring</span> platform.
            </p>
            <p className="leading-[1.4] font-medium">
              From concept to deployment in
              <br />
              under 60 minutes.
            </p>
          </div>

          {/* CTA Group */}
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-5 items-center sm:items-start w-full sm:w-auto">
            <ButtonPrimary
              className="w-full sm:w-auto"
              onClick={() => openFormModal("book-a-demo")}
            >
              Book a Demo
            </ButtonPrimary>
            <ButtonSecondary
              className="w-full sm:w-auto"
              onClick={() => openFormModal("community")}
            >
              Join the Community
            </ButtonSecondary>
          </div>
        </div>
      </div>

      {/* ===== SCROLL INDICATOR (absolute) ===== */}
      <ScrollIndicator />

      {/* ===== VIDEO CARD (absolute) ===== */}
      <VideoCard />

      {/* ===== MINI SHOWREEL LIGHTBOX (fixed, full-screen) ===== */}
      <MiniShowreelLightbox />
    </section>
  );
}
