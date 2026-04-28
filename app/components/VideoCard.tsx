"use client";

import Image from "next/image";
import ButtonPrimary from "./ButtonPrimary";

export default function VideoCard() {
  return (
    <div
      className="hidden lg:block absolute bottom-[80px] right-[100px] z-20 w-[278px] h-[173px] rounded-lg p-[2px]"
      style={{
        background: "linear-gradient(160deg, var(--color-accent-purple-light), var(--color-accent-border), var(--color-accent-coral))",
      }}
    >
      <div className="flex flex-col items-center justify-center gap-3 w-full h-full rounded-[calc(0.5rem-2px)] bg-bg-card overflow-hidden">
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
    </div>
  );
}
