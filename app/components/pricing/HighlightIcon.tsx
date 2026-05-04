import type { HighlightIcon as IconKind } from "./data";

// Inline SVG glyphs — purposely simple line marks at 16x16, currentColor.
// Drawn at 1.4 stroke for crispness on dark.
export default function HighlightIcon({ kind }: { kind: IconKind }) {
  switch (kind) {
    case "users":
      return (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="5.5" r="2.4" />
          <path d="M2 13.5c.6-2.2 2.2-3.5 4-3.5s3.4 1.3 4 3.5" />
          <circle cx="11.5" cy="5" r="1.6" />
          <path d="M10.5 9.5c2 .2 3.2 1.5 3.5 3.4" />
        </svg>
      );
    case "library":
      return (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2.2" y="2.5" width="2.6" height="11" rx="0.6" />
          <rect x="5.6" y="2.5" width="2.6" height="11" rx="0.6" />
          <path d="M9.3 3.4l2.5-.7 2.1 10.4-2.5.7z" />
        </svg>
      );
    case "tokens":
      return (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="8" r="5.5" />
          <circle cx="8" cy="8" r="2.4" />
          <path d="M8 2.5v2M8 11.5v2M2.5 8h2M11.5 8h2" />
        </svg>
      );
    case "exports":
      return (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 10V2.5" />
          <path d="M5 5.5L8 2.5l3 3" />
          <path d="M2.5 10v2.5a1 1 0 001 1h9a1 1 0 001-1V10" />
        </svg>
      );
    case "shield":
      return (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 1.8L13.4 4v4.4c0 3.3-2.4 5.1-5.4 6-3-.9-5.4-2.7-5.4-6V4z" />
          <path d="M5.5 8.2l1.8 1.8L11 6.4" />
        </svg>
      );
    case "sparkle":
      return (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 1.5L9.4 6 14 7.4 9.4 8.8 8 13.4 6.6 8.8 2 7.4 6.6 6z" />
        </svg>
      );
    case "globe":
      return (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="8" r="5.5" />
          <path d="M2.5 8h11" />
          <path d="M8 2.5c1.7 1.6 2.6 3.6 2.6 5.5S9.7 12.4 8 13.5c-1.7-1.1-2.6-3.1-2.6-5.5S6.3 4.1 8 2.5z" />
        </svg>
      );
    case "infinity":
      return (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3.5 8c0-1.4 1.1-2.5 2.5-2.5S8 6.6 8 8s1.1 2.5 2.5 2.5S13 9.4 13 8s-1.1-2.5-2.5-2.5S8 6.6 8 8s-1.1 2.5-2.5 2.5S3.5 9.4 3.5 8z" />
        </svg>
      );
  }
}
