"use client";

export type BillingMode = "monthly" | "annual";

export default function BillingToggle({
  value,
  onChange,
}: {
  value: BillingMode;
  onChange: (mode: BillingMode) => void;
}) {
  const annual = value === "annual";

  return (
    <div className="inline-flex items-center gap-3.5">
      <button
        type="button"
        onClick={() => onChange("monthly")}
        aria-pressed={!annual}
        className={`text-[13.5px] md:text-sm tracking-[-0.005em] cursor-pointer transition-colors duration-200 ${
          annual ? "text-white/45 hover:text-white/70" : "text-white"
        }`}
      >
        Monthly
      </button>

      {/* Switch */}
      <button
        type="button"
        role="switch"
        aria-checked={annual}
        aria-label="Bill annually"
        onClick={() => onChange(annual ? "monthly" : "annual")}
        className="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full cursor-pointer transition-[background-color,box-shadow] duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary"
        style={{
          background: annual
            ? "linear-gradient(90deg, rgba(183,139,249,0.85), rgba(250,103,124,0.65))"
            : "rgba(255,255,255,0.10)",
          boxShadow: annual
            ? "inset 0 1px 0 0 rgba(255,255,255,0.18), 0 0 24px -4px rgba(183,139,249,0.40)"
            : "inset 0 1px 0 0 rgba(255,255,255,0.06), inset 0 -1px 0 0 rgba(0,0,0,0.20)",
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute top-1 left-1 inline-block h-5 w-5 rounded-full bg-white transition-transform duration-[260ms] ease-[cubic-bezier(0.65,0,0.35,1)]"
          style={{
            transform: annual ? "translateX(20px)" : "translateX(0)",
            boxShadow:
              "0 1px 2px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.06)",
          }}
        />
      </button>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onChange("annual")}
          aria-pressed={annual}
          className={`text-[13.5px] md:text-sm tracking-[-0.005em] cursor-pointer transition-colors duration-200 ${
            annual ? "text-white" : "text-white/45 hover:text-white/70"
          }`}
        >
          Annual
        </button>
        <span
          className={`inline-flex items-center h-5 px-2 rounded-full text-[10.5px] font-medium tracking-[0.04em] transition-[opacity,color,background-color] duration-300 ${
            annual ? "opacity-100" : "opacity-55"
          }`}
          style={{
            background: annual
              ? "rgba(183,139,249,0.18)"
              : "rgba(255,255,255,0.05)",
            color: annual ? "rgb(212,169,255)" : "rgba(255,255,255,0.55)",
            border: `1px solid ${
              annual ? "rgba(183,139,249,0.32)" : "rgba(255,255,255,0.08)"
            }`,
          }}
          aria-hidden
        >
          −17%
        </span>
      </div>
    </div>
  );
}
