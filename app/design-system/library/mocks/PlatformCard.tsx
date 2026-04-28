import Image from "next/image";

// Markup-only mock copied from app/sections/Platform.tsx.
// Phase A will extract a real component with props.
export default function PlatformCard() {
  const glowColor = "rgba(183, 139, 249, 0.15)";

  return (
    <div
      className="relative flex flex-col lg:flex-row gap-8 lg:gap-[80px] xl:gap-[120px] items-center overflow-hidden rounded-[20px] px-6 py-8 lg:px-[60px] xl:px-[80px] lg:py-[40px]"
      style={{
        boxShadow:
          "0px 0px 100px 0px rgba(0,0,0,0.3), 0px 0px 20px 3px rgba(7,13,79,0.05), 0px 0px 40px 20px rgba(7,13,79,0.05)",
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[#141318] pointer-events-none rounded-[20px]"
      />

      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none overflow-hidden rounded-[20px]"
      >
        {[44, 54, 64, 74, 84, 94, 104].map((pct) => (
          <div
            key={pct}
            className="absolute top-0 h-[140%] -translate-y-[15%]"
            style={{
              left: `${pct}%`,
              width: "1px",
              background:
                "linear-gradient(to bottom, transparent, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.06) 80%, transparent)",
            }}
          />
        ))}
      </div>

      <div
        aria-hidden
        className="absolute pointer-events-none overflow-hidden inset-0 rounded-[20px]"
      >
        <div
          className="absolute"
          style={{
            width: "94%",
            height: "118%",
            right: "-10%",
            bottom: "-60%",
            background: `radial-gradient(ellipse at center, ${glowColor} 0%, transparent 65%)`,
          }}
        />
      </div>

      <div className="relative z-10 shrink-0 w-full lg:w-[400px] xl:w-[455px]">
        <div className="mb-4 lg:mb-5">
          <p className="landscape-heading-gradient font-semibold text-[28px] lg:text-[36px] xl:text-[40px] leading-[1.1] tracking-[-0.04em]">
            Sample title
          </p>
          <div className="flex items-baseline mt-1 ml-10 lg:ml-[50px] xl:ml-[70px]">
            <span className="text-[20px] lg:text-[24px] xl:text-[28px] text-[rgba(244,238,255,0.7)] leading-[28px]">
              with Sample
            </span>
            <span className="text-[13px] lg:text-[16px] xl:text-[18px] text-[rgba(244,238,255,0.7)] leading-[28px]">
              ®
            </span>
          </div>
        </div>

        <p className="text-[15px] lg:text-[17px] xl:text-[18px] leading-[24px] text-[rgba(244,238,255,0.8)] max-w-[414px] mb-8 lg:mb-10">
          Brief description text for the showcase mock that exercises the layout and typography.
        </p>

        <div className="grid grid-cols-2 gap-5 lg:gap-[27px]">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <div
                  className="relative flex items-center justify-center shrink-0 rounded-lg size-9 overflow-hidden"
                  style={{ boxShadow: "0px 0px 0px 1px rgba(255,255,255,0.25)" }}
                >
                  <div
                    aria-hidden
                    className="absolute inset-0 pointer-events-none rounded-lg"
                    style={{
                      background:
                        "linear-gradient(to bottom, rgba(255,255,255,0.03), rgba(255,255,255,0.1))",
                    }}
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/assets/platform-icon-arrow.svg"
                    alt=""
                    className="relative size-4"
                  />
                  <div
                    className="absolute inset-0 pointer-events-none rounded-[inherit]"
                    style={{
                      boxShadow:
                        "inset 0px 1px 0px 0px rgba(255,255,255,0.05), inset 0px -1px 0px 0px rgba(0,0,0,0.2)",
                    }}
                  />
                </div>
                <span className="text-[18px] lg:text-[20px] text-white">Sample feature</span>
              </div>
              <p className="text-[13px] lg:text-[14px] leading-[20px] text-[rgba(244,238,255,0.8)]">
                Short feature description for the showcase mock.
              </p>
            </div>
          ))}
        </div>
      </div>

      <div
        className="relative z-10 w-full lg:flex-1 overflow-hidden rounded-[20px] lg:rounded-r-none lg:-mr-[60px] xl:-mr-[80px]"
        style={{
          height: "clamp(240px, 30vw, 477px)",
          background: "#24202c",
        }}
      >
        <Image
          src="/assets/platform-card-gradient.png"
          alt=""
          fill
          className="object-cover"
        />
      </div>

      <div
        className="absolute inset-0 pointer-events-none rounded-[inherit] z-20"
        style={{
          boxShadow:
            "inset 0px 1px 0px 0px rgba(255,255,255,0.1), inset 0px 0px 0px 1px rgba(255,255,255,0.06)",
        }}
      />
    </div>
  );
}
