"use client";

import EyebrowBadge from "../components/EyebrowBadge";
import ButtonPrimary from "../components/ButtonPrimary";
import ButtonSecondary from "../components/ButtonSecondary";
import NavMenu from "../components/NavMenu";
import ScrollIndicator from "../components/ScrollIndicator";
import VideoCard from "../components/VideoCard";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-bg-primary" style={{ minHeight: "max(100vh, 1000px)" }}>
      {/* ===== BACKGROUND LAYERS (absolute) ===== */}

      {/* Video Background */}
      <div className="absolute inset-0 z-0 mix-blend-color-dodge">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Gradient BG Overlay */}
      <div className="absolute inset-0 z-[1] mix-blend-screen">
        <div className="w-full h-full backdrop-blur-[50px] bg-bg-primary/70 overflow-hidden">
          {/* Element 1 - purple glow top right */}
          <div className="absolute -top-[70%] right-[-20%] w-[110%] h-[120%]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/element-1.svg"
              alt=""
              className="w-full h-full"
            />
          </div>
          {/* Element 2 - light overlay */}
          <div className="absolute -top-[120%] right-[-10%] w-[90%] h-[160%] mix-blend-lighten">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/element-2.svg"
              alt=""
              className="w-full h-full"
            />
          </div>
          {/* Element 3 - bright overlay */}
          <div className="absolute -top-[140%] right-[-10%] w-[90%] h-[160%]" style={{ mixBlendMode: "plus-lighter" }}>
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
      <div className="relative z-10 flex flex-col items-center pt-[240px] lg:pt-[420px] pb-[200px] lg:pb-[340px] px-5 md:px-6 mx-auto max-w-[1330px]">
        {/* Eyebrow */}
        <EyebrowBadge>AI POWERED COURSE CREATOR</EyebrowBadge>

        {/* Main Heading */}
        <h1 className="mt-8 md:mt-[42px] text-center px-2 sm:px-0">
          <span className="heading-gradient block text-[32px] sm:text-[52px] lg:text-[80px] font-semibold leading-[1.1] tracking-[-0.04em]">
            The future of{" "}
            <span className="font-serif italic font-normal text-[40px] sm:text-[64px] lg:text-[100px] tracking-[-0.04em]">
              learning,
            </span>
          </span>
          <span className="heading-gradient block text-[32px] sm:text-[52px] lg:text-[80px] font-semibold leading-[1.1] tracking-[-0.04em]">
            authored in minutes.
          </span>
        </h1>

        {/* Content Row: Description + CTAs */}
        <div className="mt-8 lg:mt-[42px] flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-[124px]">
          {/* Description */}
          <div className="text-center lg:text-right max-w-[420px] text-text-secondary text-lg lg:text-2xl tracking-[-0.01em]">
            <p className="leading-[1.4] font-light mb-4">
              Cogniate is the world&apos;s first AI-native enterprise course
              authoring platform.
            </p>
            <p className="leading-[1.4] font-medium">
              From concept to deployment in
              <br />
              under 60 minutes.
            </p>
          </div>

          {/* CTA Group */}
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-5 items-center sm:items-start w-full sm:w-auto">
            <ButtonPrimary className="w-full sm:w-auto">Book a Demo</ButtonPrimary>
            <ButtonSecondary className="w-full sm:w-auto">Join the Community</ButtonSecondary>
          </div>
        </div>
      </div>

      {/* ===== SCROLL INDICATOR (absolute) ===== */}
      <ScrollIndicator />

      {/* ===== VIDEO CARD (absolute) ===== */}
      <VideoCard />
    </section>
  );
}
