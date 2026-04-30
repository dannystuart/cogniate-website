"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Three/R3F is browser-only; defer SSR.
const ParticleSwarm = dynamic(
  () => import("../components/ParticleSwarm"),
  { ssr: false }
);

export default function ParticleTestPage() {
  const [progress, setProgress] = useState(0);

  return (
    <main className="relative h-screen w-screen bg-bg-secondary">
      <ParticleSwarm
        scrollProgress={progress}
        logoSrc="/assets/story-cogniate-logo.png"
        className="absolute inset-0"
      />

      <div className="pointer-events-auto fixed bottom-6 left-1/2 z-50 flex w-[min(640px,90vw)] -translate-x-1/2 flex-col gap-2 rounded-lg bg-black/60 p-4 text-white backdrop-blur">
        <label className="flex items-center justify-between text-xs uppercase tracking-widest">
          <span>progress</span>
          <span className="tabular-nums">{progress.toFixed(2)}</span>
        </label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={progress}
          onChange={(e) => setProgress(parseFloat(e.target.value))}
          className="w-full accent-white"
        />
        <div className="flex gap-2 text-xs">
          {[0, 0.25, 0.5, 0.75, 1].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setProgress(p)}
              className="rounded border border-white/30 px-2 py-1 hover:bg-white/10"
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
