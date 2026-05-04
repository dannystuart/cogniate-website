import EyebrowBadge from "../EyebrowBadge";
import { addOns } from "./data";

export default function AddOnsSection() {
  return (
    <section
      id="add-ons"
      aria-label="Add-ons"
      className="relative scroll-mt-[140px] py-16 md:py-20 lg:py-24"
    >
      <div className="relative max-w-[1200px] mx-auto px-5 md:px-8">
        {/* Section heading */}
        <div className="flex flex-col items-center gap-5 md:gap-6 text-center mb-12 md:mb-14">
          <EyebrowBadge>ADD-ONS</EyebrowBadge>
          <h2 className="heading-gradient text-h2-mobile md:text-h2-tablet lg:text-h2-desktop font-[var(--font-weight-h2)] leading-[var(--leading-h2)] tracking-[var(--tracking-h2)] max-w-[820px]">
            Stackable boosts.
          </h2>
          <p className="text-body md:text-body-lg text-white/65 font-light max-w-[600px] leading-[1.4] tracking-[-0.2px]">
            Top up tokens and library capacity à la carte. Mix and match across any
            authoring plan.
          </p>
          <span className="mt-1 text-[11.5px] uppercase tracking-[0.18em] text-white/35 font-medium">
            Reference pricing — talk to us to enable
          </span>
        </div>

        {/* 3x2 tile grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {addOns.map((a) => (
            <div
              key={a.id}
              className="relative flex items-start gap-4 rounded-2xl p-5 md:p-6 transition-[transform,border-color,background-color] duration-300 ease-out hover:-translate-y-0.5"
              style={{
                background: "rgba(20,19,24,0.55)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {/* Spark glyph */}
              <div
                aria-hidden
                className="relative flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                  boxShadow:
                    "inset 0 0 0 1px rgba(255,255,255,0.10), inset 0 -1px 0 0 rgba(0,0,0,0.20)",
                }}
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="rgba(212,169,255,0.85)"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <path d="M8 1.5L9.4 6 14 7.4 9.4 8.8 8 13.4 6.6 8.8 2 7.4 6.6 6z" />
                </svg>
              </div>

              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <h3 className="text-white text-[16px] font-medium leading-tight tracking-[-0.01em]">
                    {a.name}
                  </h3>
                  <span className="text-white text-[15px] font-medium tracking-[-0.005em] shrink-0">
                    {a.price}
                  </span>
                </div>
                <p className="text-[13px] text-white/70 leading-snug">{a.provides}</p>
                <p className="text-[11.5px] text-white/40 leading-snug mt-1">
                  {a.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
