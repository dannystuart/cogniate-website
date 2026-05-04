"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ButtonPrimary from "./ButtonPrimary";
import { useFormModal } from "../lib/form-modal/FormModalProvider";

type AnchorNav = { kind: "anchor"; label: string; id: string };
type RouteNav = { kind: "route"; label: string; href: string };
type SectionNav = AnchorNav | RouteNav;

const sectionNav: SectionNav[] = [
  { kind: "anchor", label: "How it works", id: "how-it-works" },
  { kind: "anchor", label: "Platform", id: "platform" },
  { kind: "route", label: "Pricing", href: "/pricing" },
];

export default function NavMenu() {
  const { open } = useFormModal();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!isHome) return;
    const ids = sectionNav
      .filter((i): i is AnchorNav => i.kind === "anchor")
      .map((i) => i.id);
    const targets = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 }
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isHome]);

  const renderSectionLink = (item: SectionNav) => {
    const href = item.kind === "anchor" ? `/#${item.id}` : item.href;
    const isActive =
      (item.kind === "anchor" && activeId === item.id) ||
      (item.kind === "route" && pathname === item.href);

    return (
      <Link
        key={item.label}
        href={href}
        aria-current={isActive ? "page" : undefined}
        className={`group relative whitespace-nowrap text-[13px] md:text-sm tracking-[-0.005em] transition-colors duration-200 ${
          isActive ? "text-white" : "text-white/65 hover:text-white"
        }`}
      >
        {item.label}
        <span
          aria-hidden
          className={`pointer-events-none absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-[2px] w-5 origin-center rounded-full bg-gradient-to-r from-accent-purple via-white to-accent-coral transition-transform duration-300 ease-out ${
            isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
          }`}
        />
        <span
          aria-hidden
          className={`pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-accent-purple/45 blur-[4px] transition-opacity duration-300 ${
            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-70"
          }`}
        />
      </Link>
    );
  };

  return (
    <nav className="absolute top-0 left-1/2 -translate-x-1/2 z-30">
      <div className="relative flex items-center h-[60px] md:h-[72px] gap-3 md:gap-5 lg:gap-6 pl-3 pr-2 md:pl-5 md:pr-3 bg-bg-nav backdrop-blur-lg rounded-b-2xl shadow-[0_10px_30px_-14px_rgba(0,0,0,0.6)]">
        {/* Top hairline highlight — gives the dock a clipped-from-light feel */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
        />

        {/* Logo */}
        <Link
          href="/"
          aria-label="Cogniate — home"
          className="group relative w-[44px] h-[46px] shrink-0"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full bg-accent-purple/0 blur-md transition-colors duration-300 group-hover:bg-accent-purple/25"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/story-cogniate-logo.png"
            alt="Cogniate"
            className="relative w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-[1.06]"
          />
        </Link>

        {/* Divider */}
        <span
          aria-hidden
          className="hidden md:block h-5 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"
        />

        {/* Section nav (md+) */}
        <ul className="hidden md:flex items-center gap-5 lg:gap-7">
          {sectionNav.map((item) => (
            <li key={item.label}>{renderSectionLink(item)}</li>
          ))}
        </ul>

        {/* Divider */}
        <span
          aria-hidden
          className="hidden md:block h-5 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"
        />

        {/* Community + CTA */}
        <div className="flex items-center gap-3 md:gap-4">
          <button
            type="button"
            onClick={() => open("community")}
            className="hidden lg:inline-flex text-sm text-white/65 hover:text-white whitespace-nowrap transition-colors duration-200 cursor-pointer"
          >
            Community
          </button>
          <ButtonPrimary
            variant="coral"
            size="small"
            onClick={() => open("book-a-demo")}
          >
            Book a Demo
          </ButtonPrimary>
        </div>
      </div>
    </nav>
  );
}
