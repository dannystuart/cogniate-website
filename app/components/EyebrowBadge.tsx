interface EyebrowBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export default function EyebrowBadge({
  children,
  className = "",
}: EyebrowBadgeProps) {
  return (
    <div
      className={`inline-flex items-center justify-center h-9 px-6 rounded-full border border-white/40 overflow-hidden ${className}`}
      style={{
        background:
          "linear-gradient(to right, rgba(173, 145, 218, 0.8), rgba(92, 77, 116, 0.8))",
      }}
    >
      <span className="text-xs md:text-sm text-text-muted tracking-[0.15em] md:tracking-[0.2em] whitespace-nowrap font-medium">
        {children}
      </span>
    </div>
  );
}
