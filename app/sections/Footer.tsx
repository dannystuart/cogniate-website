"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ButtonPrimary from "../components/ButtonPrimary";
import { useFormModal } from "../lib/form-modal/FormModalProvider";

gsap.registerPlugin(ScrollTrigger);

const navLinks = [
  { label: "Home", href: "#hero" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Platform", href: "#platform" },
];

const legalLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

const socialLinks = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/cogniate",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45C23.2 24 24 23.23 24 22.28V1.72C24 .77 23.2 0 22.22 0z" />
      </svg>
    ),
  },
  {
    label: "X",
    href: "https://x.com/cogniate_ai",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/cogniate_ai/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.88 5.88 0 0 0-2.13 1.38A5.88 5.88 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91a5.88 5.88 0 0 0 1.38 2.13 5.88 5.88 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.88 5.88 0 0 0 2.13-1.38 5.88 5.88 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.88 5.88 0 0 0-1.38-2.13A5.88 5.88 0 0 0 19.86.63C19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/channel/UCBBzTmMKQv00j1HfIuHVQSQ",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M23.5 6.2a3.02 3.02 0 0 0-2.13-2.13C19.48 3.56 12 3.56 12 3.56s-7.48 0-9.37.51A3.02 3.02 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3.02 3.02 0 0 0 2.13 2.13c1.89.51 9.37.51 9.37.51s7.48 0 9.37-.51a3.02 3.02 0 0 0 2.13-2.13C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.6 15.6V8.4l6.24 3.6z" />
      </svg>
    ),
  },
];

export default function Footer() {
  const { open: openFormModal } = useFormModal();
  const watermarkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const watermark = watermarkRef.current;
    if (!watermark) return;

    const ctx = gsap.context(() => {
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
    }, watermark);

    return () => ctx.revert();
  }, []);

  return (
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
            <ButtonPrimary
              variant="coral"
              onClick={() => openFormModal("book-a-demo")}
            >
              Book a Demo
            </ButtonPrimary>
          </div>

          {/* Footer columns */}
          <div className="flex flex-col lg:flex-row flex-wrap items-center lg:items-start justify-center gap-10 md:gap-12 lg:gap-[96px] w-full">
            {/* Brand column */}
            <div className="flex flex-col items-center lg:items-start gap-0 w-[278px] order-last lg:order-first">
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
            <div className="flex flex-col items-center lg:items-start gap-[6px]">
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
            <div className="flex flex-col items-center lg:items-start gap-[6px]">
              <span className="text-body text-white leading-[30px] font-normal">
                Community
              </span>
              {legalLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-body text-white leading-[30px] font-normal hover:text-white/80 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Social column */}
            <div className="flex flex-row lg:flex-col items-center lg:items-start lg:self-center gap-4 lg:gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="block text-white/45 transition-colors duration-300 ease-out hover:text-accent-coral [&>svg]:h-[18px] [&>svg]:w-[18px] [&>svg]:transition-transform [&>svg]:duration-300 [&>svg]:ease-out hover:[&>svg]:-translate-y-px"
                >
                  {social.icon}
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
  );
}
