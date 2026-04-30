"use client";

import Image from "next/image";
import ButtonPrimary from "./ButtonPrimary";

const SHOWREEL_NAME = "showreel";

export default function VideoCard() {
  return (
    <div
      data-mini-showreel-player={SHOWREEL_NAME}
      data-mini-showreel-status="not-active"
      className="mini-showreel-player hidden lg:block absolute bottom-[80px] right-[100px] z-20 w-[278px] h-[173px] rounded-lg p-[2px]"
      style={{
        background:
          "linear-gradient(160deg, var(--color-accent-purple-light), var(--color-accent-border), var(--color-accent-coral))",
      }}
    >
      <div className="relative flex flex-col items-center justify-center gap-3 w-full h-full rounded-[calc(0.5rem-2px)] bg-bg-card overflow-hidden">
        {/* Poster (closed-state design) */}
        <div className="mini-showreel-poster flex flex-col items-center justify-center gap-3 w-full h-full">
          <div className="relative w-[77px] h-[80px]">
            <Image
              src="/assets/cogniate-logo.png"
              alt="Cogniate"
              width={77}
              height={80}
              className="object-contain"
            />
          </div>
          <ButtonPrimary variant="coral" size="small">
            Watch it work
            <svg
              width="12"
              height="12"
              viewBox="0 0 10.419 11.558"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="ml-1.5"
            >
              <path
                d="M3.014 11.279C1.681 12.063 0 11.102 0 9.555V2.003C0 .456 1.681-.505 3.014.279l6.419 3.776c1.315.773 1.315 2.674 0 3.448L3.014 11.279Z"
                fill="#1d2026"
              />
            </svg>
          </ButtonPrimary>
        </div>

        {/* Video (active-state). Replace src with the real showreel asset later. */}
        <video
          className="mini-showreel-video absolute inset-0 w-full h-full object-cover"
          playsInline
          preload="metadata"
          muted
          loop
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>

        {/* Click overlay opens the lightbox */}
        <div
          data-mini-showreel-open={SHOWREEL_NAME}
          className="mini-showreel-click absolute inset-0 z-[2] cursor-pointer"
          aria-label="Watch it work"
          role="button"
        />
      </div>
    </div>
  );
}
