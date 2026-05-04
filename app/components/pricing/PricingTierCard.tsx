"use client";

import { useState } from "react";
import HighlightIcon from "./HighlightIcon";
import type { AuthoringTier } from "./data";
import type { BillingMode } from "./BillingToggle";
import { BOOK_DEMO_HREF } from "./data";
import { useFormModal } from "../../lib/form-modal/FormModalProvider";

function formatPrice(n: number) {
  return n === 0 ? "$0" : `$${n}`;
}

export default function PricingTierCard({
  tier,
  billing,
}: {
  tier: AuthoringTier;
  billing: BillingMode;
}) {
  const [open, setOpen] = useState(false);
  const { open: openFormModal } = useFormModal();

  const isCustom = tier.priceLabel !== undefined;

  // Determine which numeric price to show
  let priceNode: React.ReactNode;
  if (isCustom) {
    priceNode = (
      <span className="block text-[44px] md:text-[52px] leading-none font-medium tracking-[-0.04em] text-white">
        {tier.priceLabel}
      </span>
    );
  } else {
    const monthly = tier.monthly ?? 0;
    const annual = tier.annualPerMonth ?? monthly;
    // Show both but cross-fade the active one
    priceNode = (
      <span className="relative block h-[52px] md:h-[60px]">
        <span
          className={`absolute inset-0 text-[44px] md:text-[52px] leading-none font-medium tracking-[-0.04em] text-white transition-opacity duration-[240ms] ${
            billing === "monthly" ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={billing !== "monthly"}
        >
          {formatPrice(monthly)}
          <span className="text-[18px] md:text-[20px] text-white/55 align-baseline">
            {monthly === 0 ? "" : "/mo"}
          </span>
        </span>
        <span
          className={`absolute inset-0 text-[44px] md:text-[52px] leading-none font-medium tracking-[-0.04em] text-white transition-opacity duration-[240ms] ${
            billing === "annual" ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={billing !== "annual"}
        >
          {formatPrice(annual)}
          <span className="text-[18px] md:text-[20px] text-white/55 align-baseline">
            {annual === 0 ? "" : "/mo"}
          </span>
        </span>
      </span>
    );
  }

  // Caption underneath price
  let captionNode: React.ReactNode = null;
  if (tier.priceCaption) {
    if (
      !isCustom &&
      billing === "annual" &&
      tier.annualPerYear !== null &&
      tier.annualPerYear !== 0
    ) {
      captionNode = (
        <span className="text-[13px] md:text-sm text-white/55 leading-tight tracking-[-0.005em]">
          billed ${tier.annualPerYear}/yr
        </span>
      );
    } else {
      captionNode = (
        <span className="text-[13px] md:text-sm text-white/55 leading-tight tracking-[-0.005em]">
          {tier.priceCaption}
        </span>
      );
    }
  }

  const popular = !!tier.popular;

  return (
    <div
      data-pricing-card
      data-popular={popular}
      className={`pricing-card group relative flex flex-col rounded-[20px] p-7 md:p-8 transition-[transform,box-shadow,border-color] duration-[320ms] ease-out h-full ${
        popular ? "is-popular" : ""
      }`}
      style={{
        background:
          "linear-gradient(180deg, rgba(24,22,32,0.92) 0%, rgba(16,16,17,0.92) 100%)",
      }}
    >
      {/* Hover glow — local to the card, fades in on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100 overflow-hidden"
      >
        <span
          className="absolute -inset-px rounded-[inherit]"
          style={{
            background: popular
              ? "radial-gradient(ellipse 90% 60% at 50% 0%, rgba(212,169,255,0.20), transparent 65%)"
              : "radial-gradient(ellipse 90% 60% at 50% 0%, rgba(255,255,255,0.10), transparent 65%)",
          }}
        />
      </span>
      {/* Popular ambient halo (slow pulse) */}
      {popular && (
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-[20px] overflow-hidden"
        >
          <span
            className="absolute -inset-[40%] opacity-70"
            style={{
              background:
                "radial-gradient(circle at 50% 0%, rgba(183,139,249,0.30) 0%, transparent 55%), radial-gradient(circle at 50% 100%, rgba(250,103,124,0.18) 0%, transparent 55%)",
              animation: "pricing-halo-pulse 6s ease-in-out infinite",
            }}
          />
        </span>
      )}

      {/* Eyebrow tag */}
      <div className="relative flex items-center gap-2 mb-5">
        <span
          className={`inline-flex items-center h-6 px-3 rounded-full text-[10.5px] tracking-[0.16em] font-medium uppercase ${
            popular
              ? "text-white"
              : "text-white/55"
          }`}
          style={{
            background: popular
              ? "linear-gradient(90deg, rgba(183,139,249,0.85), rgba(250,103,124,0.65))"
              : "rgba(255,255,255,0.05)",
            border: popular
              ? "1px solid rgba(255,255,255,0.18)"
              : "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {tier.eyebrow}
        </span>
      </div>

      {/* Tier name */}
      <h3 className="relative landscape-heading-gradient text-[28px] md:text-[32px] font-semibold leading-[1.05] tracking-[-0.02em] mb-2">
        {tier.name}
      </h3>

      {/* Positioning */}
      <p className="relative text-[14px] md:text-[15px] text-white/65 leading-[1.4] tracking-[-0.005em] mb-7 min-h-[42px]">
        {tier.positioning}
      </p>

      {/* Price */}
      <div className="relative mb-2">{priceNode}</div>
      <div className="relative mb-7 min-h-[20px]">{captionNode}</div>

      {/* Highlights */}
      <ul className="relative flex flex-col gap-3.5 mb-8">
        {tier.highlights.map((h, i) => (
          <li key={i} className="flex items-center gap-3">
            <span
              className="relative flex items-center justify-center w-8 h-8 rounded-lg shrink-0 text-white/85"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                boxShadow:
                  "inset 0 0 0 1px rgba(255,255,255,0.10), inset 0 -1px 0 0 rgba(0,0,0,0.20)",
              }}
            >
              <span className="block w-4 h-4">
                <HighlightIcon kind={h.icon} />
              </span>
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-[14.5px] md:text-[15px] text-white tracking-[-0.005em]">
                {h.label}
              </span>
              {h.sub && (
                <span className="text-[12px] text-white/45 mt-0.5">{h.sub}</span>
              )}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <a
        href={BOOK_DEMO_HREF}
        onClick={(e) => {
          e.preventDefault();
          openFormModal("book-a-demo");
        }}
        className={`relative group/cta inline-flex items-center justify-center h-12 rounded-full font-semibold text-[15px] tracking-[-0.005em] transition-[transform,background-color,box-shadow,filter] duration-300 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] overflow-hidden cursor-pointer ${
          popular
            ? "bg-white text-[#1d2026] hover:shadow-[0_10px_30px_-6px_rgba(255,255,255,0.45)]"
            : "bg-white/[0.06] text-white border border-white/15 hover:bg-white/[0.10] hover:border-white/30"
        }`}
      >
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 -left-[40%] w-[40%] rotate-12 opacity-0 transition-[transform,opacity] duration-700 ease-out group-hover/cta:translate-x-[420%] group-hover/cta:opacity-100 ${
            popular
              ? "bg-gradient-to-r from-transparent via-white/45 to-transparent"
              : "bg-gradient-to-r from-transparent via-white/20 to-transparent"
          }`}
        />
        <span className="relative">{tier.ctaLabel}</span>
      </a>

      {/* Expand affordance */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={`${tier.id}-details`}
        className="relative mt-4 inline-flex items-center justify-center gap-2 text-[13px] text-white/50 hover:text-white/85 transition-colors duration-200 cursor-pointer"
      >
        <span>{open ? "Hide details" : "See full plan"}</span>
        <svg
          className={`w-3 h-3 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M3 4.5l3 3 3-3" />
        </svg>
      </button>

      {/* Accordion body — grid 0fr → 1fr trick */}
      <div
        id={`${tier.id}-details`}
        className="relative grid transition-[grid-template-rows] duration-[320ms] ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="pt-5 mt-5 border-t border-white/[0.07]">
            <dl className="flex flex-col gap-2.5">
              {tier.details.map((d) => (
                <div
                  key={d.label}
                  className="flex items-start justify-between gap-4"
                >
                  <dt className="text-[12.5px] uppercase tracking-[0.08em] text-white/40 shrink-0 pt-0.5">
                    {d.label}
                  </dt>
                  <dd className="text-[13.5px] text-white/80 text-right leading-snug max-w-[60%]">
                    {d.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
