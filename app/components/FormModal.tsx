"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import HubSpotForm from "./HubSpotForm";
import type { FormConfig, FormId } from "../lib/form-modal/types";

interface FormModalProps {
  config: FormConfig | null;
  formId: FormId | null;
  onClose: () => void;
}

export default function FormModal({ config, formId, onClose }: FormModalProps) {
  if (!config || !formId) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <ModalShell key={formId} config={config} onClose={onClose} />,
    document.body
  );
}

function ModalShell({
  config,
  onClose,
}: {
  config: FormConfig;
  onClose: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const backdrop = backdropRef.current;
    const panel = panelRef.current;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (backdrop) {
      if (reduce) {
        gsap.set(backdrop, { opacity: 1 });
      } else {
        gsap.fromTo(
          backdrop,
          { opacity: 0 },
          { opacity: 1, duration: 0.4, ease: "power2.out" }
        );
      }
    }
    if (panel) {
      if (reduce) {
        gsap.set(panel, { opacity: 1, scale: 1, y: 0 });
      } else {
        gsap.fromTo(
          panel,
          { opacity: 0, scale: 0.97, y: 16 },
          { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "expo.out" }
        );
      }
    }
    const id = requestAnimationFrame(() => closeBtnRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <>
      {/* Backdrop — visual only, no events. Stays viewport-fixed regardless of scroll. */}
      <div
        ref={backdropRef}
        aria-hidden
        className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm pointer-events-none"
      />

      {/* Scroll + interaction layer — receives wheel scroll anywhere in viewport,
          and clicks on empty (backdrop-showing) area to close. */}
      <div
        className="fixed inset-0 z-[1001] overflow-y-auto cursor-pointer"
        onClick={onClose}
      >
        <div className="min-h-full flex items-start justify-center p-4 sm:p-6 pt-[6vh] sm:pt-[8vh] pb-[6vh]">
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="form-modal-heading"
            onClick={(e) => e.stopPropagation()}
            className="cursor-default relative w-full max-w-[560px] rounded-3xl bg-bg-secondary border border-white/10 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.6)] px-6 py-10 sm:px-10 sm:py-12"
          >
            <div
              aria-hidden
              className="absolute inset-0 -z-10 rounded-3xl pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 0%, rgba(250,103,124,0.10) 0%, transparent 60%)",
              }}
            />
            <button
              ref={closeBtnRef}
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="absolute right-4 top-4 inline-flex items-center justify-center w-9 h-9 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden
              >
                <path
                  d="M1 1l12 12M13 1L1 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {submitted ? (
              <SuccessCard config={config} onClose={onClose} />
            ) : (
              <FormContent
                config={config}
                onSubmitted={() => setSubmitted(true)}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function FormContent({
  config,
  onSubmitted,
}: {
  config: FormConfig;
  onSubmitted: () => void;
}) {
  return (
    <>
      <header className="text-center mb-8">
        <h2
          id="form-modal-heading"
          className="italic text-accent-coral text-[40px] sm:text-[56px] leading-[1.05] tracking-[-0.04em]"
          style={{ fontFamily: '"Times New Roman", Times, serif' }}
        >
          {config.heading}
        </h2>
        <p className="mt-2 text-[22px] sm:text-[28px] font-semibold leading-[1.15] tracking-[-0.03em] heading-gradient">
          {config.sub}
        </p>
        <p className="mt-3 text-body font-light leading-[1.4] text-text-secondary">
          {config.body}
        </p>
      </header>
      <HubSpotForm config={config} onSubmitted={onSubmitted} />
    </>
  );
}

function SuccessCard({
  config,
  onClose,
}: {
  config: FormConfig;
  onClose: () => void;
}) {
  return (
    <div className="text-center py-6">
      <h2
        id="form-modal-heading"
        className="italic text-accent-coral text-[40px] sm:text-[56px] leading-[1.05] tracking-[-0.04em]"
        style={{ fontFamily: '"Times New Roman", Times, serif' }}
      >
        {config.success.heading}
      </h2>
      <p className="mt-2 text-[22px] sm:text-[28px] font-semibold leading-[1.15] tracking-[-0.03em] heading-gradient">
        {config.success.sub}
      </p>
      <p className="mt-3 text-body font-light leading-[1.4] text-text-secondary">
        {config.success.body}
      </p>
      <button
        type="button"
        onClick={onClose}
        className="mt-8 inline-flex items-center justify-center h-12 px-8 rounded-full border border-white/30 text-white text-base font-semibold cursor-pointer transition-colors hover:bg-white/10 hover:border-white/50"
      >
        Close
      </button>
    </div>
  );
}
