interface StoryTooltipProps {
  label: string;
  title: string;
  description: string;
  icon: string;
  className?: string;
}

export default function StoryTooltip({
  label,
  title,
  description,
  icon,
  className = "",
}: StoryTooltipProps) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-[#1a1a1e] p-10 sm:p-12 ${className}`}
    >
      {/* Category label */}
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent-purple mb-5">
        {label}
      </p>

      {/* Icon + Title row */}
      <div className="flex items-center gap-3 mb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={icon}
          alt=""
          className="size-[30px]"
        />
        <h3 className="text-xl font-semibold text-white">{title}</h3>
      </div>

      {/* Description */}
      <p className="text-base leading-[1.6] text-text-muted">{description}</p>
    </div>
  );
}
