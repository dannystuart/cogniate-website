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
  const [mobileOpen, setMobileOpen] = useState(false);

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

  // Lock body scroll + close on Escape while drawer open
  useEffect(() => {
    if (!mobileOpen) return;
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  const isItemActive = (item: SectionNav) =>
    (item.kind === "anchor" && activeId === item.id) ||
    (item.kind === "route" && pathname === item.href);

  const itemHref = (item: SectionNav) =>
    item.kind === "anchor" ? `/#${item.id}` : item.href;

  const renderSectionLink = (item: SectionNav) => {
    const isActive = isItemActive(item);
    return (
      <Link
        key={item.label}
        href={itemHref(item)}
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
    <>
      <nav className="absolute top-0 left-1/2 -translate-x-1/2 z-50">
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

          {/* Community + CTA (md+) */}
          <div className="hidden md:flex items-center gap-3 md:gap-4">
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

          {/* Hamburger (mobile only) */}
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-drawer"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden relative flex items-center justify-center w-11 h-11 rounded-full text-white/85 hover:text-white transition-colors duration-200 cursor-pointer"
          >
            {/* Subtle ambient glow that intensifies when active */}
            <span
              aria-hidden
              className={`pointer-events-none absolute inset-1 rounded-full blur-md transition-opacity duration-300 ${
                mobileOpen
                  ? "opacity-100 bg-accent-purple/35"
                  : "opacity-0 bg-accent-purple/0"
              }`}
            />
            {/* Icon — three bars morph into X */}
            <span
              aria-hidden
              className="relative block w-[18px] h-[14px]"
            >
              <span
                className={`absolute left-0 right-0 h-[2px] rounded-full bg-current transition-[transform,top,opacity] duration-300 ease-out ${
                  mobileOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] rounded-full bg-current transition-[opacity,transform] duration-200 ease-out ${
                  mobileOpen ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100"
                }`}
              />
              <span
                className={`absolute left-0 right-0 h-[2px] rounded-full bg-current transition-[transform,bottom,opacity] duration-300 ease-out ${
                  mobileOpen
                    ? "top-1/2 -translate-y-1/2 -rotate-45"
                    : "top-auto bottom-0"
                }`}
              />
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile drawer + backdrop */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!mobileOpen}
      >
        {/* Backdrop */}
        <button
          type="button"
          aria-label="Close menu"
          tabIndex={mobileOpen ? 0 : -1}
          onClick={() => setMobileOpen(false)}
          className="absolute inset-0 w-full h-full bg-black/55 backdrop-blur-sm cursor-default"
        />

        {/* Drawer */}
        <div
          id="mobile-nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className={`absolute top-0 left-0 right-0 origin-top transition-[transform,opacity] duration-[360ms] ease-out ${
            mobileOpen
              ? "translate-y-0 opacity-100"
              : "-translate-y-3 opacity-0"
          }`}
        >
          <div className="relative mx-3 mt-[68px] overflow-hidden rounded-2xl bg-bg-nav backdrop-blur-xl border border-white/10 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)]">
            {/* Top hairline highlight */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
            {/* Soft gradient ambient corner glows */}
            <span
              aria-hidden
              className="pointer-events-none absolute -top-16 -left-10 w-48 h-48 rounded-full bg-accent-purple/20 blur-3xl"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-20 -right-10 w-56 h-56 rounded-full bg-accent-coral/15 blur-3xl"
            />

            <ul className="relative flex flex-col p-2">
              {sectionNav.map((item, i) => {
                const active = isItemActive(item);
                return (
                  <li key={item.label}>
                    <Link
                      href={itemHref(item)}
                      onClick={() => setMobileOpen(false)}
                      aria-current={active ? "page" : undefined}
                      style={{
                        transitionDelay: mobileOpen
                          ? `${60 + i * 40}ms`
                          : "0ms",
                      }}
                      className={`group relative flex items-center justify-between rounded-xl px-4 py-4 text-base tracking-[-0.005em] transition-[color,transform,opacity,background-color] duration-300 ease-out ${
                        active
                          ? "text-white bg-white/[0.04]"
                          : "text-white/75 hover:text-white"
                      } ${
                        mobileOpen
                          ? "translate-y-0 opacity-100"
                          : "translate-y-2 opacity-0"
                      }`}
                    >
                      <span className="relative">
                        {item.label}
                        <span
                          aria-hidden
                          className={`pointer-events-none absolute -bottom-1 left-0 h-[2px] w-6 origin-left rounded-full bg-gradient-to-r from-accent-purple via-white to-accent-coral transition-transform duration-300 ease-out ${
                            active
                              ? "scale-x-100"
                              : "scale-x-0 group-hover:scale-x-100"
                          }`}
                        />
                      </span>
                      <span
                        aria-hidden
                        className={`text-white/30 transition-transform duration-300 ease-out ${
                          active
                            ? "translate-x-0 text-white/70"
                            : "-translate-x-1 group-hover:translate-x-0 group-hover:text-white/60"
                        }`}
                      >
                        →
                      </span>
                    </Link>
                  </li>
                );
              })}

              {/* Community */}
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    open("community");
                  }}
                  style={{
                    transitionDelay: mobileOpen
                      ? `${60 + sectionNav.length * 40}ms`
                      : "0ms",
                  }}
                  className={`group relative flex w-full items-center justify-between rounded-xl px-4 py-4 text-base tracking-[-0.005em] text-white/75 hover:text-white transition-[color,transform,opacity] duration-300 ease-out cursor-pointer ${
                    mobileOpen
                      ? "translate-y-0 opacity-100"
                      : "translate-y-2 opacity-0"
                  }`}
                >
                  <span className="relative">
                    Community
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -bottom-1 left-0 h-[2px] w-6 origin-left rounded-full bg-gradient-to-r from-accent-purple via-white to-accent-coral scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100"
                    />
                  </span>
                  <span
                    aria-hidden
                    className="text-white/30 -translate-x-1 transition-transform duration-300 ease-out group-hover:translate-x-0 group-hover:text-white/60"
                  >
                    →
                  </span>
                </button>
              </li>
            </ul>

            {/* Divider */}
            <div className="relative px-4">
              <span
                aria-hidden
                className="block h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
              />
            </div>

            {/* CTA */}
            <div
              style={{
                transitionDelay: mobileOpen
                  ? `${60 + (sectionNav.length + 1) * 40}ms`
                  : "0ms",
              }}
              className={`relative p-4 transition-[transform,opacity] duration-300 ease-out ${
                mobileOpen
                  ? "translate-y-0 opacity-100"
                  : "translate-y-2 opacity-0"
              }`}
            >
              <ButtonPrimary
                variant="coral"
                size="small"
                className="w-full"
                onClick={() => {
                  setMobileOpen(false);
                  open("book-a-demo");
                }}
              >
                Book a Demo
              </ButtonPrimary>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
