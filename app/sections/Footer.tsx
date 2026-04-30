"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ButtonPrimary from "../components/ButtonPrimary";

gsap.registerPlugin(ScrollTrigger);

const navLinks = [
  { label: "Home", href: "#hero" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Platform", href: "#platform" },
];

const legalLinks = [
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
];

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const footer = footerRef.current;
    const watermark = watermarkRef.current;
    if (!footer || !watermark) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        watermark,
        { y: 150 },
        {
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: footer,
            start: "top 80%",
            end: "bottom bottom",
            scrub: true,
          },
        }
      );
    }, footer);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="relative w-full pt-[67px]">
      {/* Inner card — no overflow-hidden so watermark can extend below */}
      <div className="relative mx-6 md:mx-12 lg:mx-auto max-w-[1440px] rounded-[20px]">
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

        {/* Large watermark logo — absolutely positioned, overlaps card bottom and extends below */}
        <div
          ref={watermarkRef}
          className="absolute left-1/2 -translate-x-1/2 w-[1728px] h-[513px] pointer-events-none hidden md:block"
          style={{ top: "calc(100% - 350px)" }}
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
  );
}
