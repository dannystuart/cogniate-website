import type { TokenDef } from "./types";

export const BASELINE_TOKENS: TokenDef[] = [
  // Colors
  { name: "Background — primary", cssVar: "--color-bg-primary", group: "colors", baseline: "#070707", kind: "color" },
  { name: "Background — secondary", cssVar: "--color-bg-secondary", group: "colors", baseline: "#101011", kind: "color" },
  { name: "Background — card", cssVar: "--color-bg-card", group: "colors", baseline: "#131315", kind: "color" },
  { name: "Text — primary", cssVar: "--color-text-primary", group: "colors", baseline: "#ffffff", kind: "color" },
  { name: "Text — secondary", cssVar: "--color-text-secondary", group: "colors", baseline: "rgba(242, 234, 255, 0.8)", kind: "color" },
  { name: "Text — muted", cssVar: "--color-text-muted", group: "colors", baseline: "rgba(255, 255, 255, 0.8)", kind: "color" },
  { name: "Accent — purple", cssVar: "--color-accent-purple", group: "colors", baseline: "#B78BF9", kind: "color" },
  { name: "Accent — purple light", cssVar: "--color-accent-purple-light", group: "colors", baseline: "#d4a9ff", kind: "color" },
  { name: "Accent — coral", cssVar: "--color-accent-coral", group: "colors", baseline: "#fa677c", kind: "color" },
  { name: "Accent — border", cssVar: "--color-accent-border", group: "colors", baseline: "#aeb4ff", kind: "color" },
  { name: "Accent — gold", cssVar: "--color-accent-gold", group: "colors", baseline: "#FCE89E", kind: "color" },

  // Typography sizes
  { name: "h1 — mobile", cssVar: "--text-h1-mobile", group: "typography", baseline: "32px", kind: "size" },
  { name: "h1 — tablet", cssVar: "--text-h1-tablet", group: "typography", baseline: "52px", kind: "size" },
  { name: "h1 — desktop", cssVar: "--text-h1-desktop", group: "typography", baseline: "80px", kind: "size" },
  { name: "h1 italic — mobile", cssVar: "--text-h1-italic-mobile", group: "typography", baseline: "40px", kind: "size" },
  { name: "h1 italic — tablet", cssVar: "--text-h1-italic-tablet", group: "typography", baseline: "64px", kind: "size" },
  { name: "h1 italic — desktop", cssVar: "--text-h1-italic-desktop", group: "typography", baseline: "100px", kind: "size" },
  { name: "h2 — mobile", cssVar: "--text-h2-mobile", group: "typography", baseline: "32px", kind: "size" },
  { name: "h2 — tablet", cssVar: "--text-h2-tablet", group: "typography", baseline: "48px", kind: "size" },
  { name: "h2 — desktop", cssVar: "--text-h2-desktop", group: "typography", baseline: "64px", kind: "size" },
  { name: "Body", cssVar: "--text-body", group: "typography", baseline: "18px", kind: "size" },
  { name: "Body — large", cssVar: "--text-body-lg", group: "typography", baseline: "24px", kind: "size" },

  // Typography meta
  { name: "h1 weight", cssVar: "--font-weight-h1", group: "typography", baseline: "600", kind: "weight" },
  { name: "h2 weight", cssVar: "--font-weight-h2", group: "typography", baseline: "600", kind: "weight" },
  { name: "h1 line-height", cssVar: "--leading-h1", group: "typography", baseline: "1.1", kind: "number" },
  { name: "h2 line-height", cssVar: "--leading-h2", group: "typography", baseline: "1.1", kind: "number" },
  { name: "h1 tracking", cssVar: "--tracking-h1", group: "typography", baseline: "-0.04em", kind: "tracking" },
  { name: "h2 tracking", cssVar: "--tracking-h2", group: "typography", baseline: "-0.04em", kind: "tracking" },

  // Gradient stops — heading
  { name: "Heading gradient stop 1", cssVar: "--heading-gradient-stop-1", group: "gradients", baseline: "rgba(255, 255, 255, 1)", kind: "color" },
  { name: "Heading gradient stop 2", cssVar: "--heading-gradient-stop-2", group: "gradients", baseline: "rgba(212, 209, 218, 0.875)", kind: "color" },
  { name: "Heading gradient stop 3", cssVar: "--heading-gradient-stop-3", group: "gradients", baseline: "rgba(169, 163, 180, 0.75)", kind: "color" },
  { name: "Heading gradient stop 4", cssVar: "--heading-gradient-stop-4", group: "gradients", baseline: "rgba(125, 117, 143, 0.625)", kind: "color" },
  { name: "Heading gradient stop 5", cssVar: "--heading-gradient-stop-5", group: "gradients", baseline: "rgba(82, 71, 105, 0.5)", kind: "color" },
  // Gradient stops — landscape
  { name: "Landscape gradient stop 1", cssVar: "--landscape-gradient-stop-1", group: "gradients", baseline: "rgba(255, 255, 255, 1)", kind: "color" },
  { name: "Landscape gradient stop 2", cssVar: "--landscape-gradient-stop-2", group: "gradients", baseline: "rgba(212, 209, 218, 0.75)", kind: "color" },
  { name: "Landscape gradient stop 3", cssVar: "--landscape-gradient-stop-3", group: "gradients", baseline: "rgba(169, 163, 180, 0.5)", kind: "color" },
  { name: "Landscape gradient stop 4", cssVar: "--landscape-gradient-stop-4", group: "gradients", baseline: "rgba(82, 71, 105, 0)", kind: "color" },
  // Gradient stops — benefits italic
  { name: "Benefits italic stop 1", cssVar: "--benefits-italic-gradient-stop-1", group: "gradients", baseline: "rgba(255, 255, 255, 0.8)", kind: "color" },
  { name: "Benefits italic stop 2", cssVar: "--benefits-italic-gradient-stop-2", group: "gradients", baseline: "rgba(220, 200, 245, 0.8)", kind: "color" },
  { name: "Benefits italic stop 3", cssVar: "--benefits-italic-gradient-stop-3", group: "gradients", baseline: "rgba(184, 145, 234, 0.8)", kind: "color" },
  // Gradient stops — footer
  { name: "Footer gradient stop 1", cssVar: "--footer-gradient-stop-1", group: "gradients", baseline: "rgba(255, 255, 255, 1)", kind: "color" },
  { name: "Footer gradient stop 2", cssVar: "--footer-gradient-stop-2", group: "gradients", baseline: "rgba(212, 209, 218, 0.75)", kind: "color" },
  { name: "Footer gradient stop 3", cssVar: "--footer-gradient-stop-3", group: "gradients", baseline: "rgba(169, 163, 180, 0.5)", kind: "color" },
  { name: "Footer gradient stop 4", cssVar: "--footer-gradient-stop-4", group: "gradients", baseline: "rgba(82, 71, 105, 0)", kind: "color" },
];

export function baselineState() {
  return Object.fromEntries(BASELINE_TOKENS.map((t) => [t.cssVar, t.baseline]));
}
