"use client";

/**
 * Vector-based gradient background for the Platform section.
 * Recreates the Figma "Gradient BG" layer structure (node 189:11803):
 *   1. Shapes > Left — converging light cone from left edge (lavender/white)
 *   2. Shapes > Right — converging light cone from right edge (purple/violet)
 *   3. Ellipses — horizontal glow band connecting the cones
 *   4. Mask Noise — grain texture overlay (visible in lighter areas)
 *
 * All positions derived from 1728×1208 Figma canvas.
 * Colors: #C09AFA (Accent 2/300), #B78BF9 (400), #9F64F7 (500).
 */
export default function PlatformGradientBG() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* ============================================
          LAYERS 1–3 — SHAPES + ELLIPSES
          1728×1208 coordinate space, scales to cover
          ============================================ */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1728 1208"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          {/* ---- Blur filters ---- */}
          <filter id="pb-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="30" />
          </filter>

          {/* ---- Left cone gradient (warmer lavender) ---- */}
          <radialGradient id="pb-sl" cx="0.5" cy="0.5" r="0.5" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor="#f0e8ff" />
            <stop offset="20%" stopColor="#c09afa" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#9f64f7" stopOpacity="0.2" />
            <stop offset="80%" stopColor="#9f64f7" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#9f64f7" stopOpacity="0" />
          </radialGradient>

          {/* ---- Right cone gradient (cooler purple) ---- */}
          <radialGradient id="pb-sr" cx="0.5" cy="0.5" r="0.5" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor="#c09afa" />
            <stop offset="20%" stopColor="#9f64f7" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#7b3de0" stopOpacity="0.2" />
            <stop offset="80%" stopColor="#7b3de0" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#7b3de0" stopOpacity="0" />
          </radialGradient>

          {/* ---- Left screen glow ---- */}
          <radialGradient id="pb-gl" cx="0.5" cy="0.5" r="0.5" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor="#d4b8ff" stopOpacity="0.8" />
            <stop offset="30%" stopColor="#c09afa" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#9f64f7" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#9f64f7" stopOpacity="0" />
          </radialGradient>

          {/* ---- Right screen glow ---- */}
          <radialGradient id="pb-gr" cx="0.5" cy="0.5" r="0.5" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor="#b78bf9" stopOpacity="0.85" />
            <stop offset="30%" stopColor="#9f64f7" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#7b3de0" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#7b3de0" stopOpacity="0" />
          </radialGradient>

          {/* ---- Ellipse edge glow ---- */}
          <radialGradient id="pb-el" cx="0.5" cy="0.5" r="0.5" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor="#d4b8ff" stopOpacity="0.7" />
            <stop offset="30%" stopColor="#c09afa" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#9f64f7" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#9f64f7" stopOpacity="0" />
          </radialGradient>

          {/* ---- Wide center band glow ---- */}
          <radialGradient id="pb-ew" cx="0.5" cy="0.5" r="0.5" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor="#b78bf9" stopOpacity="0.4" />
            <stop offset="35%" stopColor="#9f64f7" stopOpacity="0.18" />
            <stop offset="70%" stopColor="#9f64f7" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#9f64f7" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ================================================
            SHAPES > LEFT  (node 189:11814)
            ================================================ */}
        <g data-name="Shapes-Left">
          {/* Large upper (189:11815) */}
          <ellipse cx={-67} cy={306} rx={960} ry={380}
            fill="url(#pb-sl)" opacity={0.4}
            style={{ mixBlendMode: "plus-lighter" }} />
          {/* Large lower (189:11816) */}
          <ellipse cx={-67} cy={1048} rx={960} ry={380}
            fill="url(#pb-sl)" opacity={0.4}
            style={{ mixBlendMode: "plus-lighter" }} />
          {/* Medium upper (189:11819) */}
          <ellipse cx={-68} cy={332} rx={510} ry={290}
            fill="url(#pb-sl)" opacity={0.35} />
          {/* Medium lower (189:11820) */}
          <ellipse cx={-68} cy={1024} rx={510} ry={290}
            fill="url(#pb-sl)" opacity={0.35} />
          {/* Thin upper (189:11817) */}
          <ellipse cx={137} cy={574} rx={580} ry={65}
            fill="url(#pb-sl)" opacity={0.25}
            filter="url(#pb-soft)" />
          {/* Thin lower (189:11818) */}
          <ellipse cx={137} cy={782} rx={580} ry={65}
            fill="url(#pb-sl)" opacity={0.25}
            filter="url(#pb-soft)" />
          {/* Center glow (189:11821) */}
          <ellipse cx={218} cy={678} rx={620} ry={320}
            fill="url(#pb-gl)" opacity={0.55}
            style={{ mixBlendMode: "screen" }} />
        </g>

        {/* ================================================
            SHAPES > RIGHT  (node 189:11822)
            ================================================ */}
        <g data-name="Shapes-Right">
          {/* Large upper (189:11823) */}
          <ellipse cx={1717} cy={306} rx={960} ry={380}
            fill="url(#pb-sr)" opacity={0.45}
            style={{ mixBlendMode: "plus-lighter" }} />
          {/* Large lower (189:11824) */}
          <ellipse cx={1717} cy={1048} rx={960} ry={380}
            fill="url(#pb-sr)" opacity={0.45}
            style={{ mixBlendMode: "plus-lighter" }} />
          {/* Medium upper (189:11827) */}
          <ellipse cx={1718} cy={332} rx={510} ry={290}
            fill="url(#pb-sr)" opacity={0.38} />
          {/* Medium lower (189:11828) */}
          <ellipse cx={1718} cy={1024} rx={510} ry={290}
            fill="url(#pb-sr)" opacity={0.38} />
          {/* Thin upper (189:11825) */}
          <ellipse cx={1512} cy={574} rx={580} ry={65}
            fill="url(#pb-sr)" opacity={0.28}
            filter="url(#pb-soft)" />
          {/* Thin lower (189:11826) */}
          <ellipse cx={1512} cy={782} rx={580} ry={65}
            fill="url(#pb-sr)" opacity={0.28}
            filter="url(#pb-soft)" />
          {/* Center glow (189:11829) */}
          <ellipse cx={1616} cy={678} rx={620} ry={320}
            fill="url(#pb-gr)" opacity={0.6}
            style={{ mixBlendMode: "screen" }} />
        </g>

        {/* ================================================
            ELLIPSES  (node 189:11830)
            ================================================ */}
        <g data-name="Ellipses">
          {/* Right edge (189:11831) */}
          <ellipse cx={1934} cy={648} rx={170} ry={220}
            fill="url(#pb-el)"
            style={{ mixBlendMode: "plus-lighter" }} />
          {/* Left edge (189:11832) */}
          <ellipse cx={-114} cy={648} rx={170} ry={220}
            fill="url(#pb-el)"
            style={{ mixBlendMode: "plus-lighter" }} />
          {/* Wide center band (189:11833) */}
          <ellipse cx={946} cy={677} rx={960} ry={96}
            fill="url(#pb-ew)"
            style={{ mixBlendMode: "plus-lighter" }} />
          {/* Right medium (189:11836) */}
          <ellipse cx={2068} cy={713} rx={420} ry={340}
            fill="url(#pb-el)" opacity={0.7}
            style={{ mixBlendMode: "plus-lighter" }} />
        </g>
      </svg>

      {/* ============================================
          LAYER 4 — MASK NOISE
          Grain texture overlay — visible in lighter areas
          ============================================ */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <filter id="pb-noise" x="0" y="0" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.55"
              numOctaves="4"
              stitchTiles="stitch"
            />
            <feComponentTransfer>
              <feFuncR type="linear" slope="0.5" />
              <feFuncG type="linear" slope="0.4" />
              <feFuncB type="linear" slope="0.6" />
              <feFuncA type="linear" slope="0.07" />
            </feComponentTransfer>
          </filter>
        </defs>
        <rect width="100%" height="100%" filter="url(#pb-noise)" />
      </svg>
    </div>
  );
}
