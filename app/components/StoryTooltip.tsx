interface StoryTooltipProps {
  label: string;
  title: string;
  description: string;
  icon: string;
  /** Gradient stops (CSS colors) for the eyebrow label — tinted per cluster. */
  gradientFrom: string;
  gradientTo: string;
  /** Ambient inner-glow tint, typically the cluster colour at low alpha. */
  accentColor: string;
  className?: string;
}

export default function StoryTooltip({
  label,
  title,
  description,
  icon,
  gradientFrom,
  gradientTo,
  accentColor,
  className = "",
}: StoryTooltipProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-[20px] bg-[#141318] p-7 shadow-[0_0_20px_3px_rgba(7,13,79,0.05),0_0_40px_20px_rgba(7,13,79,0.05),inset_0_1px_0_0_rgba(255,255,255,0.1),inset_0_0_0_1px_rgba(255,255,255,0.06)] ${className}`}
    >
      {/* Ambient cluster-tinted glow — sits behind the content, clipped by overflow-hidden. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[20%] top-[20%] h-[140%] w-[90%] -rotate-[7deg] rounded-[100%]"
        style={{
          background: `radial-gradient(closest-side, ${accentColor} 0%, transparent 72%)`,
        }}
      />

      <div className="relative flex flex-col gap-4">
        <p
          className="bg-clip-text text-[11px] font-medium uppercase tracking-[0.2em] text-transparent"
          style={{
            backgroundImage: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})`,
          }}
        >
          {label}
        </p>

        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={icon} alt="" className="size-10" />
          <h3 className="text-lg font-medium leading-6 text-[rgba(244,238,255,0.9)]">
            {title}
          </h3>
        </div>

        <p className="text-[14px] leading-[1.5] text-[rgba(244,238,255,0.72)]">
          {description}
        </p>
      </div>
    </div>
  );
}
