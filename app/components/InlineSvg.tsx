import fs from "node:fs";
import path from "node:path";
import { scopeSvgIds } from "../lib/scopeSvgIds";

type Props = {
  src: string;
  className?: string;
  style?: React.CSSProperties;
  ariaHidden?: boolean;
};

const cache = new Map<string, string>();

function loadSvg(src: string): string {
  const cached = cache.get(src);
  if (cached) return cached;
  const filePath = path.join(process.cwd(), "public", src.replace(/^\//, ""));
  const raw = fs.readFileSync(filePath, "utf-8");
  cache.set(src, raw);
  return raw;
}

let counter = 0;

// Inlines an SVG file at SSR so the browser rasterises filter regions at the
// real display resolution. Fixes iOS Safari blurring filtered SVGs that are
// loaded via <img src>.
//
// IDs are rewritten per-instance so multiple inlined SVGs on the same page
// don't collide on shared Figma-export IDs (filter0_d_0_4 etc.).
export default function InlineSvg({
  src,
  className,
  style,
  ariaHidden = true,
}: Props) {
  const raw = loadSvg(src);
  const prefix = `is${++counter}_`;
  const html = scopeSvgIds(raw, prefix);
  return (
    <span
      aria-hidden={ariaHidden}
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
