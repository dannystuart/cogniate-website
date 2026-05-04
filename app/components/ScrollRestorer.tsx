"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STORAGE_KEY = "cogniate:scrollY";

export default function ScrollRestorer() {
  useEffect(() => {
    if (typeof history.scrollRestoration === "string") {
      history.scrollRestoration = "manual";
    }

    const root = document.documentElement;
    const isRestoring = root.dataset.restoring === "true";
    const savedRaw = sessionStorage.getItem(STORAGE_KEY);
    const savedY = savedRaw ? parseInt(savedRaw, 10) : NaN;
    sessionStorage.removeItem(STORAGE_KEY);

    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      delete root.dataset.restoring;
    };

    let restored = false;
    const restore = () => {
      if (restored) return;
      restored = true;
      if (Number.isFinite(savedY) && savedY > 0) {
        window.scrollTo(0, savedY);
        // ScrollTrigger.update() ensures any active scrubs/pins re-evaluate
        // against the new scroll position before we reveal the page.
        ScrollTrigger.update();
      }
      requestAnimationFrame(reveal);
    };

    if (isRestoring) {
      ScrollTrigger.addEventListener("refresh", restore);
      // Fallback in case no ScrollTrigger ever refreshes (unlikely on this
      // page, but we never want to leave the body invisible).
      const fallback = window.setTimeout(restore, 1500);

      const save = () => {
        sessionStorage.setItem(STORAGE_KEY, String(window.scrollY));
      };
      window.addEventListener("pagehide", save);

      return () => {
        window.clearTimeout(fallback);
        ScrollTrigger.removeEventListener("refresh", restore);
        window.removeEventListener("pagehide", save);
        reveal();
      };
    }

    const save = () => {
      sessionStorage.setItem(STORAGE_KEY, String(window.scrollY));
    };
    window.addEventListener("pagehide", save);
    return () => window.removeEventListener("pagehide", save);
  }, []);

  return null;
}
