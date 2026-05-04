"use client";

import { useRef, useState } from "react";
import PricingTierCard from "./PricingTierCard";
import BillingToggle, { type BillingMode } from "./BillingToggle";
import { individualTiers, teamTiers } from "./data";

function CursorSpotlightRow({
  children,
  ariaLabel,
}: {
  children: React.ReactNode;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: -1000, y: -1000, on: false });

  return (
    <div
      ref={ref}
      role={ariaLabel ? "group" : undefined}
      aria-label={ariaLabel}
      onPointerMove={(e) => {
        if (e.pointerType === "touch") return;
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        setCoords({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          on: true,
        });
      }}
      onPointerLeave={() => setCoords((c) => ({ ...c, on: false }))}
      className="relative"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[24px] transition-opacity duration-300"
        style={{
          opacity: coords.on ? 1 : 0,
          background: `radial-gradient(220px circle at ${coords.x}px ${coords.y}px, rgba(255,255,255,0.035), transparent 60%)`,
        }}
      />
      {children}
    </div>
  );
}

export default function AuthoringSection() {
  const [billing, setBilling] = useState<BillingMode>("monthly");

  return (
    <section
      aria-label="Authoring plans"
      className="relative pt-8 md:pt-10 lg:pt-12 pb-20 md:pb-24 lg:pb-28"
    >
      {/* Decorative gradient blob */}
      <div
        aria-hidden
        className="absolute top-[8%] left-1/2 -translate-x-1/2 w-[1100px] h-[600px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(183,139,249,0.10) 0%, transparent 60%)",
        }}
      />

      <div className="relative max-w-[1200px] mx-auto px-5 md:px-8">
        {/* Individuals subsection */}
        <div id="individuals" className="scroll-mt-[140px] mb-20 md:mb-24">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 mb-8 md:mb-10">
            <div className="flex items-center gap-3">
              <span className="text-[11px] uppercase tracking-[0.18em] text-white/40 font-medium">
                For individuals
              </span>
              <span className="block w-12 h-px bg-white/15" />
            </div>
            <BillingToggle value={billing} onChange={setBilling} />
          </div>

          <CursorSpotlightRow ariaLabel="Individual authoring tiers">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 items-stretch">
              {individualTiers.map((t) => (
                <PricingTierCard key={t.id} tier={t} billing={billing} />
              ))}
            </div>
          </CursorSpotlightRow>
        </div>

        {/* Teams subsection */}
        <div id="teams" className="scroll-mt-[140px]">
          <div className="flex items-center gap-3 mb-8 md:mb-10">
            <span className="text-[11px] uppercase tracking-[0.18em] text-white/40 font-medium">
              For teams &amp; organisations
            </span>
            <span className="block flex-1 h-px bg-white/10" />
          </div>

          <CursorSpotlightRow ariaLabel="Team authoring tiers">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 items-stretch">
              {teamTiers.map((t) => (
                <PricingTierCard key={t.id} tier={t} billing="monthly" />
              ))}
            </div>
          </CursorSpotlightRow>
        </div>
      </div>
    </section>
  );
}
