// Rewrites every id in an SVG string and all references to those ids
// (url(#id), href="#id", xlink:href="#id") with a per-instance prefix, so
// multiple inlined SVGs sharing Figma-export ids (filter0_d_0_4, paint0_…)
// don't collide in the same document.
export function scopeSvgIds(svg: string, prefix: string): string {
  const ids = new Set<string>();
  for (const match of svg.matchAll(/\sid="([^"]+)"/g)) {
    ids.add(match[1]);
  }
  if (ids.size === 0) return svg;

  let out = svg;
  for (const id of ids) {
    const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out
      .replace(new RegExp(`(\\sid=")${escaped}(")`, "g"), `$1${prefix}${id}$2`)
      .replace(new RegExp(`(url\\(#)${escaped}(\\))`, "g"), `$1${prefix}${id}$2`)
      .replace(
        new RegExp(`((?:xlink:)?href=")#${escaped}(")`, "g"),
        `$1#${prefix}${id}$2`
      );
  }
  return out;
}
