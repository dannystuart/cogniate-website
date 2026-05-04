import EyebrowBadge from "../EyebrowBadge";
import { publishingTiers } from "./data";

export default function PublishingSection() {
  return (
    <section
      id="publishing"
      aria-label="Publishing plans"
      className="relative scroll-mt-[140px] py-16 md:py-20 lg:py-24 bg-bg-secondary/40"
    >
      {/* Subtle top divider */}
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-[80%] max-w-[1200px]"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(255,255,255,0.10), transparent)",
        }}
      />

      <div className="relative max-w-[1200px] mx-auto px-5 md:px-8">
        {/* Section heading */}
        <div className="flex flex-col items-center gap-5 md:gap-6 text-center mb-12 md:mb-14">
          <EyebrowBadge>PUBLISHING</EyebrowBadge>
          <h2 className="heading-gradient text-h2-mobile md:text-h2-tablet lg:text-h2-desktop font-[var(--font-weight-h2)] leading-[var(--leading-h2)] tracking-[var(--tracking-h2)] max-w-[820px]">
            Deliver to learners, your way.
          </h2>
          <p className="text-body md:text-body-lg text-white/65 font-light max-w-[600px] leading-[1.4] tracking-[-0.2px]">
            Per-course hosting, billed monthly. Pair any authoring plan with the
            publishing tier that fits your audience.
          </p>
          <span className="mt-1 text-[11.5px] uppercase tracking-[0.18em] text-white/35 font-medium">
            Reference pricing — talk to us to enable
          </span>
        </div>

        {/* 4-up grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 items-stretch">
          {publishingTiers.map((t) => (
            <div
              key={t.id}
              className="relative flex flex-col rounded-2xl p-6 transition-[transform,border-color] duration-300 ease-out hover:-translate-y-0.5"
              style={{
                background: "rgba(20,19,24,0.6)",
                border: t.popular
                  ? "1px solid rgba(183,139,249,0.22)"
                  : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span
                className="inline-flex items-center self-start h-5 px-2.5 rounded-full text-[10px] tracking-[0.16em] font-medium uppercase mb-4"
                style={{
                  background: t.popular
                    ? "linear-gradient(90deg, rgba(183,139,249,0.55), rgba(250,103,124,0.40))"
                    : "rgba(255,255,255,0.04)",
                  color: t.popular ? "white" : "rgba(255,255,255,0.50)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {t.eyebrow}
              </span>

              <h3 className="text-white text-[22px] font-medium leading-tight mb-1 tracking-[-0.02em]">
                {t.name}
              </h3>

              <div className="flex items-baseline gap-1.5 mt-3 mb-1">
                <span className="text-[34px] font-medium text-white leading-none tracking-[-0.03em]">
                  {t.priceLabel}
                </span>
              </div>
              <p className="text-[12.5px] text-white/50 mb-5 leading-tight">
                {t.priceCaption}
              </p>

              <p className="text-[13.5px] text-white/75 mb-4 leading-snug">
                {t.learnersLabel}
              </p>

              <ul className="flex flex-col gap-2 mt-auto pt-4 border-t border-white/[0.05]">
                {t.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-[13px] text-white/70 leading-snug"
                  >
                    <span
                      aria-hidden
                      className="mt-[7px] block w-1 h-1 rounded-full bg-white/35 shrink-0"
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
