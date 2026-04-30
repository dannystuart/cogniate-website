"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

type LoopingSvgProps = {
  src: string;
  durationMs: number;
  className?: string;
};

// Run synchronously after DOM mutations on the client; fall back to useEffect
// on the server so SSR doesn't warn.
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Fetches an SVG and inlines it so the markup is paused at its initial state
 * until the host element crosses the vertical middle of the viewport. While in
 * view, the SVG re-mounts every `durationMs` to loop CSS/SMIL animations.
 */
export default function LoopingSvg({
  src,
  durationMs,
  className,
}: LoopingSvgProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const [markup, setMarkup] = useState<string | null>(null);
  const [iteration, setIteration] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(src)
      .then((r) => r.text())
      .then((t) => {
        if (active) setMarkup(t);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [src]);

  // Reset SMIL animations to t=0 and pause/unpause to match `playing`.
  // CSS animations are handled by the [data-playing="false"] rule below.
  useIsoLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const svg = host.querySelector("svg") as SVGSVGElement | null;
    if (!svg) return;
    try {
      svg.setCurrentTime(0);
      if (playing) svg.unpauseAnimations();
      else svg.pauseAnimations();
    } catch {
      // pauseAnimations / setCurrentTime may throw on SVGs without SMIL — safe to ignore.
    }
  }, [iteration, playing, markup]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let intervalId: number | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPlaying(true);
          setIteration((i) => i + 1);
          intervalId = window.setInterval(
            () => setIteration((i) => i + 1),
            durationMs
          );
        } else {
          setPlaying(false);
          if (intervalId !== undefined) {
            clearInterval(intervalId);
            intervalId = undefined;
          }
        }
      },
      // 0-height observation root at the vertical centre of the viewport.
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (intervalId !== undefined) clearInterval(intervalId);
    };
  }, [durationMs]);

  return (
    <div ref={wrapRef} className={className}>
      <style>{`
        .looping-svg-host[data-playing="false"] svg,
        .looping-svg-host[data-playing="false"] svg * {
          animation-play-state: paused !important;
        }
        .looping-svg-host > svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }
      `}</style>
      {markup && (
        <div
          ref={hostRef}
          key={iteration}
          data-playing={playing ? "true" : "false"}
          className="looping-svg-host"
          dangerouslySetInnerHTML={{ __html: markup }}
        />
      )}
    </div>
  );
}
