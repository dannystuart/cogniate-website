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
      className={`group relative inline-flex items-center justify-center h-[52px] px-6 rounded-full border border-white/80 text-white text-lg font-semibold whitespace-nowrap overflow-hidden cursor-pointer transition-[transform,background-color,border-color,box-shadow] duration-300 ease-out will-change-transform hover:-translate-y-0.5 hover:bg-white/[0.12] hover:border-white hover:shadow-[0_10px_30px_-6px_rgba(255,255,255,0.18),0_0_0_1px_rgba(255,255,255,0.12)_inset] active:translate-y-0 active:scale-[0.98] ${className}`}
    >
      {/* Sliding shine — sweeps across on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-[40%] w-[40%] rotate-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-[transform,opacity] duration-700 ease-out group-hover:translate-x-[420%] group-hover:opacity-100"
      />
      <span className="relative">{children}</span>
    </button>
  );
}
