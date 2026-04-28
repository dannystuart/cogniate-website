"use client";

interface ButtonSecondaryProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function ButtonSecondary({
  children,
  onClick,
  className = "",
}: ButtonSecondaryProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center h-[52px] px-6 rounded-full border border-white text-white text-lg font-semibold whitespace-nowrap overflow-hidden transition-all duration-300 cursor-pointer hover:bg-white/10 ${className}`}
    >
      {children}
    </button>
  );
}
