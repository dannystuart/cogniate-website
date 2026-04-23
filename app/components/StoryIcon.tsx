"use client";

interface StoryIconProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
  isActive?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
}

export default function StoryIcon({
  src,
  alt,
  size = 120,
  className = "",
  isActive = false,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: StoryIconProps) {
  return (
    <button
      type="button"
      className={`relative flex items-center justify-center rounded-full transition-transform duration-300 cursor-pointer ${isActive ? "scale-110" : "hover:scale-105"} ${className}`}
      style={{ width: size, height: size }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      aria-expanded={isActive}
      aria-label={`${alt} story`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 size-full"
        draggable={false}
      />
    </button>
  );
}
