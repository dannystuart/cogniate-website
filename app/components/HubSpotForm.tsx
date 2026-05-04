"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import type { FormConfig } from "../lib/form-modal/types";

let formInstanceCounter = 0;

interface HbsptForms {
  create: (options: {
    portalId: string;
    formId: string;
    region: string;
    target: string;
    css?: string;
    cssRequired?: string;
    cssClass?: string;
    onFormReady?: (formEl: HTMLFormElement) => void;
    onFormSubmitted?: () => void;
  }) => void;
}

declare global {
  interface Window {
    hbspt?: { forms: HbsptForms };
  }
}

const SCRIPT_SRC = "https://js-na2.hsforms.net/forms/embed/v2.js";

export function loadHubSpotScript(): Promise<{ forms: HbsptForms }> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("hbspt unavailable on server"));
      return;
    }
    if (window.hbspt) {
      resolve(window.hbspt);
      return;
    }
    let script = document.querySelector<HTMLScriptElement>(
      'script[data-hbspt-loader="true"]'
    );
    if (!script) {
      script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.charset = "utf-8";
      script.dataset.hbsptLoader = "true";
      document.head.appendChild(script);
    }
    const start = Date.now();
    const tick = () => {
      if (window.hbspt) {
        resolve(window.hbspt);
        return;
      }
      if (Date.now() - start > 10000) {
        reject(new Error("hbspt load timeout"));
        return;
      }
      setTimeout(tick, 40);
    };
    script.addEventListener("error", () =>
      reject(new Error("hbspt script error"))
    );
    tick();
  });
}

function styleForm(form: HTMLFormElement) {
  const fields = form.querySelectorAll<HTMLElement>(".hs-form-field");
  fields.forEach((field) => {
    const label = Array.from(field.children).find(
      (c): c is HTMLLabelElement => c.tagName === "LABEL"
    );
    if (!label) return;

    const hasChoice = !!field.querySelector(
      'input[type="radio"], input[type="checkbox"]'
    );
    const hasSelect = !!field.querySelector("select");

    if (hasChoice || hasSelect) {
      label.classList.add("hs-field-label-visible");
      return;
    }

    const textControl = field.querySelector<
      HTMLInputElement | HTMLTextAreaElement
    >(
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea'
    );
    if (textControl && "placeholder" in textControl && !textControl.placeholder) {
      const requiredMark = label.querySelector(".hs-form-required");
      const labelText = (label.textContent || "")
        .replace(requiredMark?.textContent || "", "")
        .trim();
      if (labelText) textControl.placeholder = labelText;
    }
    label.classList.add("hs-hidden-label");
  });
}

interface HubSpotFormProps {
  config: FormConfig;
  onSubmitted: () => void;
}

export default function HubSpotForm({ config, onSubmitted }: HubSpotFormProps) {
  const [targetId] = useState(() => `hs-form-${++formInstanceCounter}`);
  const onSubmittedRef = useRef(onSubmitted);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    onSubmittedRef.current = onSubmitted;
  }, [onSubmitted]);

  // Lock initial collapsed state imperatively — owned by GSAP, not React.
  // Runs synchronously before paint so the user never sees the form at full
  // size before the reveal animation starts.
  useLayoutEffect(() => {
    if (wrapperRef.current) {
      gsap.set(wrapperRef.current, { height: 0, overflow: "hidden" });
    }
    if (targetRef.current) {
      gsap.set(targetRef.current, { opacity: 0 });
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadHubSpotScript()
      .then((hbspt) => {
        if (cancelled) return;
        hbspt.forms.create({
          portalId: config.portalId,
          formId: config.formId,
          region: config.region,
          target: `#${targetId}`,
          css: "",
          cssRequired: "",
          cssClass: "cogniate-hubspot-form",
          onFormReady: (formEl) => {
            if (cancelled) return;
            styleForm(formEl);
            const wrapper = wrapperRef.current;
            const target = targetRef.current;
            if (!wrapper || !target) return;

            // Force layout pass so styled heights are settled before measuring.
            void formEl.offsetHeight;
            const formHeight = formEl.offsetHeight;
            if (!formHeight) return;

            const tl = gsap.timeline();
            tl.to(
              wrapper,
              { height: formHeight, duration: 0.7, ease: "power3.out" },
              0
            );
            tl.to(
              target,
              { opacity: 1, duration: 0.6, ease: "power2.out" },
              0.1
            );
            tl.set(wrapper, { clearProps: "height,overflow" });
          },
          onFormSubmitted: () => {
            onSubmittedRef.current();
          },
        });
      })
      .catch(() => {
        if (!cancelled) setErrored(true);
      });
    return () => {
      cancelled = true;
    };
  }, [config.portalId, config.formId, config.region, targetId]);

  // If loading errors, expand the wrapper so the message becomes visible.
  useEffect(() => {
    if (!errored || !wrapperRef.current) return;
    gsap.to(wrapperRef.current, {
      height: "auto",
      duration: 0.35,
      ease: "power2.out",
      onComplete: () => {
        if (wrapperRef.current) {
          gsap.set(wrapperRef.current, { clearProps: "height,overflow" });
        }
      },
    });
  }, [errored]);

  return (
    <div ref={wrapperRef} className="relative">
      {errored ? (
        <p className="text-accent-coral text-sm py-4">
          Couldn&apos;t load the form. Please try again or refresh the page.
        </p>
      ) : null}
      <div id={targetId} ref={targetRef} />
    </div>
  );
}
