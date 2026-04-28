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
    "inline-flex items-center justify-center rounded-full font-semibold whitespace-nowrap overflow-hidden transition-all duration-300 cursor-pointer";

  const sizeStyles =
    size === "small"
      ? "h-10 px-6 text-sm gap-4"
      : "h-[52px] px-6 text-lg";

  const variantStyles =
    variant === "coral"
      ? "bg-accent-coral text-[#1d2026] hover:brightness-110"
      : "bg-white text-[#1d2026] hover:bg-white/90";

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
    >
      {children}
    </button>
  );
}
