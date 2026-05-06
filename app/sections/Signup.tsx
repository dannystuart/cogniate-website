"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Footer from "./Footer";
import { useFormModal } from "../lib/form-modal/FormModalProvider";

gsap.registerPlugin(ScrollTrigger);

const offers = [
  {
    bold: "25% discount",
    regular: "for early joiners",
  },
  {
    bold: "Free",
    regular: "tier upgrade on launch",
  },
  {
    bold: "Free library",
    regular: "for the first 100 enterprise partners",
  },
];


export default function Signup() {
  const { open: openFormModal } = useFormModal();
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const offersRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const text = textRef.current;
    const offersEl = offersRef.current;
    const formEl = formRef.current;
    if (!section || !text || !offersEl || !formEl) return;

    const ctx = gsap.context(() => {
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
          <h2 className="italic text-accent-coral text-[64px] md:text-[80px] lg:text-[112px] leading-[1.1] tracking-[-0.04em]" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
            Be First.
          </h2>
          <p className="mt-4 md:mt-6 text-[32px] md:text-[48px] lg:text-[64px] font-semibold leading-[1.15] tracking-[-0.04em] heading-gradient">
            Shape the future into learning.
          </p>
          <p className="mt-4 md:mt-6 text-body md:text-body-lg font-light leading-[1.4] text-text-secondary max-w-[640px] mx-auto">
            Join the Cogniate community. Get early access. Influence the
            roadmap. Learn with the people building it.
          </p>
        </div>

        {/* Two-column: Offers + CTA */}
        <div className="flex flex-col lg:flex-row gap-10 md:gap-12 lg:gap-[140px] items-center lg:items-center">
          {/* Left: Offers */}
          <div
            ref={offersRef}
            className="flex flex-col gap-4 w-full lg:w-auto lg:flex-1 items-center lg:items-end"
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

          {/* Right: CTA */}
          <div
            ref={formRef}
            className="flex flex-col items-center gap-3 w-full lg:w-auto lg:flex-1 max-w-[480px]"
          >
            <button
              type="button"
              onClick={() => openFormModal("community")}
              className="group relative inline-flex items-center justify-center h-16 px-10 rounded-full bg-white text-[#1d2026] text-xl font-semibold w-full overflow-hidden cursor-pointer transition-[transform,box-shadow,filter] duration-300 ease-out will-change-transform hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-8px_rgba(255,255,255,0.45),0_0_0_1px_rgba(255,255,255,0.08)_inset] active:translate-y-0 active:scale-[0.98]"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-[40%] w-[40%] rotate-12 bg-gradient-to-r from-transparent via-black/10 to-transparent opacity-0 transition-[transform,opacity] duration-700 ease-out group-hover:translate-x-[420%] group-hover:opacity-100"
              />
              <span className="relative inline-flex items-center">
                Join the community
              </span>
            </button>
            <p className="text-center text-[14px] text-white/40 font-light mt-1">
              Takes a minute. No spam, ever.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </section>
  );
}
