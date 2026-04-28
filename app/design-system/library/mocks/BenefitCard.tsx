import Image from "next/image";

// Markup-only mock copied from app/sections/Benefits.tsx.
// Phase A will extract a real component with props.
export default function BenefitCard() {
  return (
    <div className="flex flex-col items-center gap-6 lg:gap-8 text-center px-6 md:px-10 lg:px-16 py-10 md:py-12 lg:py-16">
      <div className="relative w-[60px] h-[60px] shrink-0">
        <Image
          src="/assets/benefits-icon-circle.svg"
          alt=""
          width={60}
          height={60}
          className="absolute inset-0"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/assets/benefits-icon-speed.svg"
            alt=""
            width={64}
            height={64}
            className="drop-shadow-[0_0_5px_rgba(0,0,0,0.25)]"
          />
        </div>
      </div>
      <h3 className="text-white text-[24px] md:text-[28px] font-normal leading-tight">
        Speed
      </h3>
      <p className="text-white/80 text-[16px] md:text-[18px] lg:text-[20px] font-light leading-[1.3] tracking-[-0.2px] max-w-[430px]">
        From 154 hours to under 60 minutes. Course creation at the speed of thought.
      </p>
    </div>
  );
}
