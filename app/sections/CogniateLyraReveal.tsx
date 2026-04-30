"use client";

import { useRef } from "react";

export default function CogniateLyraReveal() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinWrapperRef = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={sectionRef}
      data-testid="cogniate-lyra-reveal"
      className="relative w-full bg-bg-secondary overflow-hidden"
    >
      <div
        ref={pinWrapperRef}
        className="relative min-h-screen w-full flex items-center justify-center"
      >
        <div className="text-white/40 text-sm">[CogniateLyraReveal placeholder]</div>
      </div>
    </section>
  );
}
