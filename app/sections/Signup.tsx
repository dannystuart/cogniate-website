"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ButtonPrimary from "../components/ButtonPrimary";

gsap.registerPlugin(ScrollTrigger);

const offers = [
  {
    bold: "20% lifetime discount",
    regular: "for early joiners",
  },
  {
    bold: "Free",
    regular: "tier upgrade on launch",
  },
  {
    bold: "Free workspace",
    regular: "for the first 100 enterprise partners",
  },
];

const navLinks = [
  { label: "Home", href: "#hero" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Platform", href: "#platform" },
];

const legalLinks = [
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
];

export default function Signup() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const offersRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const text = textRef.current;
    const offersEl = offersRef.current;
    const formEl = formRef.current;
    const watermark = watermarkRef.current;
    if (!section || !text || !offersEl || !formEl) return;

    const ctx = gsap.context(() => {
      // Text block fade-in
      gsap.fromTo(
        text,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 75%",
            toggleActions: "play none none none",
          },
        }
      );

      // Offers slide in from left
      gsap.fromTo(
        offersEl,
        { opacity: 0, x: -80 },
        {
          opacity: 1,
          x: 0,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            toggleActions: "play none none none",
          },
        }
      );

      // Form slide in from right
      gsap.fromTo(
        formEl,
        { opacity: 0, x: 80 },
        {
          opacity: 1,
          x: 0,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            toggleActions: "play none none none",
          },
        }
      );

      // Watermark rises on scroll
      if (watermark) {
        gsap.fromTo(
          watermark,
          { y: 150 },
          {
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: watermark,
              start: "top bottom",
              end: "bottom bottom",
              scrub: true,
            },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-bg-secondary overflow-hidden pt-24 md:pt-32 lg:pt-40 pb-[200px]"
    >
      {/* ===== BACKGROUND LAYERS ===== */}

      {/* Inverted gradient blur at top (flipped landscape-gradient-blur) */}
      <div className="absolute top-[-14%] left-[-5%] right-[-5%] h-[85%] pointer-events-none rotate-180">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/landscape-gradient-blur.svg"
          alt=""
          className="w-full h-full"
        />
      </div>

      {/* ===== SIGNUP CONTENT ===== */}
      <div className="relative z-10 mx-auto max-w-[1200px] px-5 md:px-8 pb-24 md:pb-32 lg:pb-40">
        {/* Lines2 decoration - centered to signup area */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[5%] w-[70%] h-[65%] pointer-events-none opacity-30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/Lines2.svg"
            alt=""
            className="w-full h-full object-contain"
          />
        </div>

        {/* Ellipse blur - centered to signup area */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-[70%] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(250, 103, 124, 0.10) 0%, transparent 70%)",
          }}
        />
        {/* Text Block */}
        <div ref={textRef} className="text-center mb-16 md:mb-20 lg:mb-24">
          <h2 className="italic text-accent-coral text-[48px] md:text-[80px] lg:text-[112px] leading-[1.1] tracking-[-0.04em]" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
            Be First.
          </h2>
          <p className="mt-4 md:mt-6 text-[24px] md:text-[48px] lg:text-[64px] font-semibold leading-[1.15] tracking-[-0.04em] heading-gradient">
            Shape the future into learning.
          </p>
          <p className="mt-4 md:mt-6 text-body md:text-body-lg font-light leading-[1.4] text-text-secondary max-w-[640px] mx-auto">
            Join the Cogniate community. Get early access. Influence the
            roadmap. Learn with the people building it.
          </p>
        </div>

        {/* Two-column: Offers + Form */}
        <div className="flex flex-col lg:flex-row gap-10 md:gap-12 lg:gap-[140px] items-center lg:items-start">
          {/* Left: Offers */}
          <div
            ref={offersRef}
            className="flex flex-col gap-4 w-full lg:w-auto lg:flex-1 items-end"
          >
            {offers.map((offer, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-[#0c0c0c] rounded-2xl px-4 py-3"
              >
                <Image
                  src="/assets/signup-checkmark.svg"
                  alt=""
                  width={24}
                  height={24}
                  className="shrink-0"
                />
                <span className="text-sm md:text-body text-white">
                  <span className="font-semibold">{offer.bold}</span>{" "}
                  <span className="font-light text-white">
                    {offer.regular}
                  </span>
                </span>
              </div>
            ))}
          </div>

          {/* Right: Form */}
          <div
            ref={formRef}
            className="flex flex-col gap-4 w-full lg:w-auto lg:flex-1 max-w-[480px]"
          >
            <input
              type="text"
              placeholder="John Smith"
              className="h-14 px-6 rounded-full bg-[#0c0c0c] border border-white/[0.1] text-white placeholder:text-white/40 text-[16px] outline-none w-full focus:border-white/25 transition-colors"
            />
            <input
              type="email"
              placeholder="you@company.com"
              className="h-14 px-6 rounded-full bg-[#0c0c0c] border border-white/[0.1] text-white placeholder:text-white/40 text-[16px] outline-none w-full focus:border-white/25 transition-colors"
            />
            <button
              type="button"
              className="h-16 rounded-full bg-white text-black text-xl font-semibold w-full mt-2 transition-opacity hover:opacity-90 active:opacity-80"
            >
              Get early access
            </button>
            <p className="text-center text-[14px] text-white/40 font-light mt-1">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="relative z-10 pt-[67px] px-6 md:px-12">
        {/* Inner card */}
        <div className="relative mx-auto max-w-[1440px] rounded-[20px]">
          {/* Purple gradient overlay */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none rounded-[20px]"
            style={{
              background:
                "linear-gradient(to top, rgba(20,19,24,0) 6.3%, #65537c 104.9%)",
            }}
          />

          {/* Content container */}
          <div className="relative z-10 flex flex-col items-center gap-12 md:gap-16 lg:gap-[86px] px-8 md:px-16 lg:px-[225px] pt-10 md:pt-12 lg:pt-[54px] pb-36 md:pb-44 lg:pb-[144px]">
            {/* CTA block */}
            <div className="flex flex-col items-center gap-8 lg:gap-10 w-full max-w-[1232px]">
              <h2 className="footer-heading-gradient text-[28px] md:text-[32px] lg:text-[40px] font-semibold leading-[1.1] tracking-[-1.6px] text-center max-w-[503px]">
                Ready to transform how your organisation learns?
              </h2>
              <ButtonPrimary variant="coral">Book a Demo</ButtonPrimary>
            </div>

            {/* Footer columns */}
            <div className="flex flex-col md:flex-row flex-wrap items-center md:items-start justify-center gap-10 md:gap-12 lg:gap-[96px] w-full">
              {/* Brand column */}
              <div className="flex flex-col items-center md:items-start gap-0 w-[278px]">
                <Image
                  src="/assets/cogniate-icon-footer.png"
                  alt="Cogniate"
                  width={50}
                  height={63}
                  className="mb-0"
                />
                <p className="text-[24px] tracking-[-0.24px] text-white leading-[36px]">
                  Learning Brilliance.
                </p>
                <p className="text-[12px] text-white/60 leading-[14px] mt-1">
                  Copyright, Cogniate US, Inc. + S&oslash;l&uacute;na Ventures
                </p>
              </div>

              {/* Nav column */}
              <div className="flex flex-col items-center md:items-start gap-[6px]">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-body text-white leading-[30px] font-normal hover:text-white/80 transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              {/* Legal column */}
              <div className="flex flex-col items-center md:items-start gap-[6px]">
                <span className="text-body text-white leading-[30px] font-normal">
                  Community
                </span>
                {legalLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-body text-white leading-[30px] font-normal hover:text-white/80 transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Large watermark logo */}
          <div
            ref={watermarkRef}
            className="absolute left-1/2 -translate-x-1/2 w-[1200px] h-[360px] pointer-events-none hidden md:block"
            style={{ top: "calc(100% - 180px)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/cogniate-logo-large.svg"
              alt=""
              className="w-full h-full"
            />
          </div>
        </div>
      </footer>
    </section>
  );
}
