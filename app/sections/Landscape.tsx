import EyebrowBadge from "../components/EyebrowBadge";

export default function Landscape() {
  return (
    <section
      data-testid="landscape-section"
      className="relative w-full bg-bg-secondary overflow-hidden pb-40"
    >
      <div className="relative mx-auto max-w-[1330px] px-5 md:px-6 pt-[80px] lg:pt-[100px]">
        {/* Heading */}
        <h2 className="landscape-heading-gradient text-center text-[32px] sm:text-[48px] lg:text-[64px] font-semibold leading-[1.1] tracking-[-0.04em]">
          Imagine being 150x faster.
        </h2>

        {/* Stats container - uses absolute positioning on desktop for diagonal stagger */}
        <div className="relative mt-[48px] sm:mt-[60px] lg:mt-[120px] flex flex-col gap-10 sm:gap-12 lg:block lg:min-h-[750px]">
          {/* Left stat - The Landscape */}
          <div className="flex gap-4 sm:gap-[29px] items-start lg:absolute lg:left-[11%] lg:top-0">
            {/* Vertical accent line - will be animated later */}
            <div
              className="w-[3px] shrink-0 hidden lg:block rounded-full"
              style={{
                height: "219px",
                backgroundColor: "#BC9FE0",
              }}
            />

            <div className="flex flex-col gap-4 sm:gap-[23px] items-start">
              <EyebrowBadge>THE LANDSCAPE</EyebrowBadge>

              <div className="flex flex-col gap-3 sm:gap-4">
                {/* Main stat */}
                <div className="flex items-end leading-[1.1]">
                  <span
                    className="text-[48px] sm:text-[64px] lg:text-[96px] font-extralight tracking-[-0.04em]"
                    style={{
                      background: "linear-gradient(161deg, rgb(255, 255, 255) 3%, rgb(146, 100, 205) 98%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    $361{" "}
                  </span>
                  <span className="text-[20px] sm:text-[24px] lg:text-[32px] font-medium text-white tracking-[-0.04em] pb-1 sm:pb-2 lg:pb-3">
                    billion
                  </span>
                </div>

                {/* Subtitle */}
                <p className="text-[16px] sm:text-[18px] lg:text-[24px] font-light leading-[1.3] text-text-muted tracking-[-0.01em]">
                  global annual L&amp;D spend
                </p>
              </div>
            </div>
          </div>

          {/* Right stat - The Opportunity */}
          <div className="flex gap-4 sm:gap-[29px] items-start justify-end lg:absolute lg:right-[10%] lg:top-[165px]">
            <div className="flex flex-col gap-4 sm:gap-[23px] items-end max-w-[360px]">
              <EyebrowBadge>THE OPPORTUNITY</EyebrowBadge>

              <div className="flex flex-col gap-3 sm:gap-4 items-end text-right">
                {/* Main stat */}
                <div className="flex items-end leading-[1.1]">
                  <span className="text-[20px] sm:text-[24px] lg:text-[32px] font-medium text-white tracking-[-0.04em] pb-1 sm:pb-2 lg:pb-3">
                    only
                  </span>
                  <span
                    className="text-[48px] sm:text-[64px] lg:text-[96px] font-extralight tracking-[-0.04em]"
                    style={{
                      background: "linear-gradient(157deg, rgb(255, 255, 255) 3%, rgb(146, 100, 205) 98%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    12%
                  </span>
                </div>

                {/* Subtitle */}
                <p className="text-[16px] sm:text-[18px] lg:text-[24px] font-light leading-[1.3] text-text-muted tracking-[-0.01em]">
                  reaches learners in a format that actually works
                </p>
              </div>
            </div>

            {/* Vertical accent line - will be animated later */}
            <div className="shrink-0 hidden lg:flex flex-col gap-[12px]">
              {/* Top segment - 30% opacity */}
              <div
                className="w-[3px] rounded-full"
                style={{
                  height: "183px",
                  backgroundColor: "rgba(250, 103, 124, 0.3)",
                }}
              />
              {/* Bottom segment - full opacity */}
              <div
                className="w-[3px] rounded-full"
                style={{
                  height: "42px",
                  backgroundColor: "#FA677C",
                }}
              />
            </div>
          </div>

          {/* Bottom stat - Time */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-[27px] items-center sm:items-center justify-center lg:justify-start lg:absolute lg:left-[24%] lg:top-[584px]">
            <p className="text-[16px] sm:text-[18px] lg:text-[24px] font-semibold leading-[1.3] text-text-muted tracking-[-0.01em] text-center sm:text-left sm:w-[130px] lg:w-[154px]">
              Traditional course creation
            </p>
            <span
              className="text-[56px] sm:text-[80px] lg:text-[128px] font-extralight leading-[1.1] tracking-[-0.06em]"
              style={{
                background: "linear-gradient(170deg, rgb(255, 255, 255) 3%, rgb(146, 100, 205) 98%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              154 hours{" "}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom gradient glow - using Figma SVG asset for accuracy */}
      <div className="absolute bottom-[-14%] left-[-5%] right-[-5%] h-[85%] pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/landscape-gradient-blur.svg"
          alt=""
          className="w-full h-full"
        />
      </div>
    </section>
  );
}
