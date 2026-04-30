"use client";

interface ButtonPrimaryProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "white" | "coral";
  size?: "default" | "small";
}

export default function ButtonPrimary({
  children,
  onClick,
  className = "",
  variant = "white",
  size = "default",
}: ButtonPrimaryProps) {
  const baseStyles =
    "group relative inline-flex items-center justify-center rounded-full font-semibold whitespace-nowrap overflow-hidden cursor-pointer transition-[transform,box-shadow,background-color,filter] duration-300 ease-out will-change-transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]";

  const sizeStyles =
    size === "small"
      ? "h-10 px-6 text-sm gap-4"
      : "h-[52px] px-6 text-lg";

  const variantStyles =
    variant === "coral"
      ? "bg-accent-coral text-[#1d2026] hover:brightness-110 hover:shadow-[0_10px_30px_-6px_rgba(250,103,124,0.55),0_0_0_1px_rgba(255,255,255,0.06)_inset]"
      : "bg-white text-[#1d2026] hover:shadow-[0_10px_30px_-6px_rgba(255,255,255,0.45),0_0_0_1px_rgba(255,255,255,0.08)_inset]";

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
    >
      {/* Sliding shine — sweeps across on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-[40%] w-[40%] rotate-12 bg-gradient-to-r from-transparent via-white/45 to-transparent opacity-0 transition-[transform,opacity] duration-700 ease-out group-hover:translate-x-[420%] group-hover:opacity-100"
      />
      <span className="relative inline-flex items-center">{children}</span>
    </button>
  );
}
