"use client";

interface StoryIconProps {
  src: string;
  alt: string;
  size?: number;
  glowColor?: string;
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
  glowColor,
  className = "",
  isActive = false,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: StoryIconProps) {
  const glowFilter = glowColor
    ? `drop-shadow(0 0 24px ${glowColor})`
    : "none";

  return (
    <button
      type="button"
      className={`story-icon relative flex items-center justify-center rounded-full cursor-pointer transition-all duration-300 ease-out ${isActive ? "scale-110" : "scale-100 hover:scale-110"} ${className}`}
      style={{
        width: size,
        height: size,
        filter: isActive ? glowFilter : "none",
      }}
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
