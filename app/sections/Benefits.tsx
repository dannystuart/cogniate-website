import Image from "next/image";
import EyebrowBadge from "../components/EyebrowBadge";

const benefits = [
  {
    icon: "/assets/benefits-icon-speed.svg",
    iconSize: 64,
    hasCircleBg: true,
    title: "Speed",
    description: (
      <>
        From 154 hours to under 60 minutes.
        <br />
        Course creation at the{" "}
        <span className="font-serif italic text-[24px] md:text-[28px] tracking-[-0.28px] bg-clip-text text-transparent benefits-italic-gradient">
          speed of thought.
        </span>
      </>
    ),
  },
  {
    icon: "/assets/benefits-icon-cost.svg",
    iconSize: 60,
    hasCircleBg: false,
    title: "Cost",
    description: (
      <>
        ~86% reduction in course production cost.
        <br className="hidden lg:block" />
        <span className="lg:block">
          {" "}The economics of enterprise L&D, permanently rewritten.
        </span>
      </>
    ),
  },
  {
    icon: "/assets/benefits-icon-quality.svg",
    iconSize: 60,
    hasCircleBg: false,
    title: "Quality",
    description:
      "AI-structured, instructional-design-compliant, brand-consistent. Every time.",
  },
  {
    icon: "/assets/benefits-icon-scale.svg",
    iconSize: 60,
    hasCircleBg: false,
    title: "Scale",
    description:
      "One platform. Any team. Any LMS. Any language. Any format.",
  },
];

export default function Benefits() {
  return (
    <section className="relative bg-bg-secondary overflow-hidden pt-16 pb-20 md:pt-20 md:pb-24 lg:pt-[65px] lg:pb-[100px]">
      {/* Heading */}
      <div className="flex flex-col items-center gap-5 md:gap-[22px] px-5 md:px-8 mb-12 md:mb-16 lg:mb-[56px]">
        <EyebrowBadge>BENEFITS</EyebrowBadge>
        {/* leading-[1.3] (not --leading-h2) and md: (not sm:) breakpoint are intentional — do not unify */}
        <h2 className="heading-gradient text-center text-h2-mobile md:text-h2-tablet lg:text-h2-desktop font-[var(--font-weight-h2)] leading-[1.3] tracking-[var(--tracking-h2)] max-w-[1306px]">
          AI-native course authoring.
          <br />
          The first of it&apos;s kind.
        </h2>
      </div>

      {/* Benefits Grid */}
      <div className="relative max-w-[1200px] mx-auto px-5 md:px-8">
        {/* Decorative blurs — anchored to grid crossing point */}
        <div
          className="absolute top-0 left-0 w-1/2 h-1/2 pointer-events-none hidden lg:block"
          style={{
            background:
              "radial-gradient(ellipse at 100% 100%, rgba(186, 149, 231, 0.08) 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-1/2 h-1/2 pointer-events-none hidden lg:block"
          style={{
            background:
              "radial-gradient(ellipse at 0% 0%, rgba(186, 149, 231, 0.08) 0%, transparent 65%)",
          }}
        />

        {/* Grid with separator lines */}
        <div className="relative grid grid-cols-1 md:grid-cols-2">
          {/* Vertical separator line (desktop only) */}
          <div
            className="hidden md:block absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2 z-10"
            style={{
              background:
                "linear-gradient(to bottom, transparent 5%, rgba(255, 255, 255, 0.12) 25%, rgba(255, 255, 255, 0.12) 75%, transparent 95%)",
            }}
          />
          {/* Horizontal separator line (desktop only) */}
          <div
            className="hidden md:block absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 z-10"
            style={{
              background:
                "linear-gradient(to right, transparent 2%, rgba(255, 255, 255, 0.12) 20%, rgba(255, 255, 255, 0.12) 80%, transparent 98%)",
            }}
          />

          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className={`
                flex flex-col items-center gap-6 lg:gap-8 text-center
                px-6 md:px-10 lg:px-16
                py-10 md:py-12 lg:py-16
                ${index < benefits.length - 1 ? "border-b border-white/[0.06] md:border-b-0" : ""}
              `}
            >
              {/* Icon */}
              <div className="relative w-[60px] h-[60px] shrink-0">
                {benefit.hasCircleBg ? (
                  <>
                    <Image
                      src="/assets/benefits-icon-circle.svg"
                      alt=""
                      width={60}
                      height={60}
                      className="absolute inset-0"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Image
                        src={benefit.icon}
                        alt=""
                        width={benefit.iconSize}
                        height={benefit.iconSize}
                        className="drop-shadow-[0_0_5px_rgba(0,0,0,0.25)]"
                      />
                    </div>
                  </>
                ) : (
                  <div className="relative w-[90px] h-[90px] -m-[15px]">
                    <Image
                      src={benefit.icon}
                      alt=""
                      width={90}
                      height={90}
                    />
                  </div>
                )}
              </div>

              {/* Title */}
              <h3 className="text-white text-[24px] md:text-[28px] font-normal leading-tight">
                {benefit.title}
              </h3>

              {/* Description */}
              <p className="text-white/80 text-body md:text-body-lg font-light leading-[1.3] tracking-[-0.2px] max-w-[430px]">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
