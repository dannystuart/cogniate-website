export default function PricingHero() {
  return (
    <section className="relative pt-[140px] md:pt-[180px] lg:pt-[200px] pb-12 md:pb-16 lg:pb-20 overflow-hidden">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[600px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(183,139,249,0.18) 0%, rgba(183,139,249,0.06) 35%, transparent 70%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-5 md:gap-7 px-5 md:px-8 max-w-[1280px] mx-auto text-center">
        <h1 className="heading-gradient whitespace-nowrap text-[28px] sm:text-[40px] md:text-[56px] lg:text-[68px] font-[var(--font-weight-h1)] leading-[var(--leading-h1)] tracking-[var(--tracking-h1)]">
          A plan for every stage of making.
        </h1>
        <p className="text-body md:text-body-lg text-white/70 font-light max-w-[620px] leading-[1.4] tracking-[-0.2px]">
          Three product axes, one platform. Start free, scale to enterprise — and stack
          publishing &amp; boosts as you grow.
        </p>
      </div>
    </section>
  );
}
