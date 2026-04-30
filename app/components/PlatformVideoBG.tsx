"use client";

const VIDEO_SRC =
  "/assets/ElevenLabs_video_topaz-video-upscale_2026-04-29T19_26_09.mp4";

const SECTION_BG = "#101011";

export default function PlatformVideoBG() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <source src={VIDEO_SRC} type="video/mp4" />
      </video>

      {/* Top blend — fades the video edge into the section above */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[22%]"
        style={{
          background: `linear-gradient(to bottom, ${SECTION_BG} 0%, rgba(16,16,17,0.85) 35%, rgba(16,16,17,0.4) 70%, rgba(16,16,17,0) 100%)`,
        }}
      />

      {/* Bottom blend — fades the video edge into the section below */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[22%]"
        style={{
          background: `linear-gradient(to top, ${SECTION_BG} 0%, rgba(16,16,17,0.85) 35%, rgba(16,16,17,0.4) 70%, rgba(16,16,17,0) 100%)`,
        }}
      />
    </div>
  );
}
