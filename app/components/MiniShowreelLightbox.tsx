"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";

const SHOWREEL_NAME = "showreel";

export default function MiniShowreelLightbox() {
  useEffect(() => {
    gsap.registerPlugin(Flip);

    const duration = 1;
    const ease = "expo.inOut";
    const lbZIndex = 999;
    const pwZIndex = 1000;

    let n = "";
    let isOpen = false;
    let lb: HTMLElement | null = null;
    let pw: HTMLElement | null = null;
    let tg: HTMLElement | null = null;
    let pwCss = "";
    let lbZ = "";
    let pwZ = "";

    const q = <T extends Element = HTMLElement>(
      sel: string,
      root: ParentNode = document
    ) => root.querySelector(sel) as T | null;

    const getLB = (name: string) =>
      q<HTMLElement>(`[data-mini-showreel-lightbox="${name}"]`);
    const getPW = (name: string) =>
      q<HTMLElement>(`[data-mini-showreel-player="${name}"]`);

    const safe = (t: HTMLElement): HTMLElement =>
      t.closest<HTMLElement>("[data-mini-showreel-safearea]") ||
      q<HTMLElement>("[data-mini-showreel-safearea]", t) ||
      t;

    const fit = (b: DOMRect, a: number) => {
      let w = b.width;
      let h = w / a;
      if (h > b.height) {
        h = b.height;
        w = h * a;
      }
      return {
        left: b.left + (b.width - w) / 2,
        top: b.top + (b.height - h) / 2,
        width: w,
        height: h,
      };
    };

    const rectFor = (t: HTMLElement) => {
      const b = safe(t).getBoundingClientRect();
      const r = t.getBoundingClientRect();
      const a = r.width > 0 && r.height > 0 ? r.width / r.height : 16 / 9;
      return fit(b, a);
    };

    const place = (
      el: HTMLElement,
      r: { left: number; top: number; width: number; height: number }
    ) =>
      gsap.set(el, {
        position: "fixed",
        left: r.left,
        top: r.top,
        width: r.width,
        height: r.height,
        margin: 0,
        x: 0,
        y: 0,
      });

    const setStatus = (status: "active" | "not-active") => {
      if (!n) return;
      document
        .querySelectorAll(
          `[data-mini-showreel-lightbox="${n}"], [data-mini-showreel-player="${n}"]`
        )
        .forEach((el) => el.setAttribute("data-mini-showreel-status", status));
    };

    const setBodyActive = (active: boolean) => {
      document.body.setAttribute(
        "data-mini-showreel-active",
        active ? "true" : "false"
      );
    };

    const zOn = () => {
      lbZ = lb?.style.zIndex || "";
      pwZ = pw?.style.zIndex || "";
      if (lb) lb.style.zIndex = String(lbZIndex);
      if (pw) pw.style.zIndex = String(pwZIndex);
    };

    const zOff = () => {
      if (lb) lb.style.zIndex = lbZ;
      if (pw) pw.style.zIndex = pwZ;
    };

    const playFor = (name: string) => {
      const wrap = getPW(name);
      if (!wrap) return;
      const video = wrap.querySelector("video");
      if (!video) return;
      try {
        void video.play();
      } catch {
        /* no-op */
      }
    };

    const stopFor = (name: string) => {
      const wrap = getPW(name);
      if (!wrap) return;
      const video = wrap.querySelector("video");
      if (!video) return;
      try {
        video.pause();
      } catch {
        /* no-op */
      }
      try {
        video.currentTime = 0;
      } catch {
        /* no-op */
      }
    };

    const openBy = (name: string) => {
      if (!name || isOpen) return;

      lb = getLB(name);
      pw = getPW(name);
      if (!lb || !pw) return;

      tg = q<HTMLElement>("[data-mini-showreel-target]", lb);
      if (!tg) return;

      n = name;
      isOpen = true;

      pw.dataset.flipId = n;
      pwCss = pw.style.cssText || "";

      zOn();
      setStatus("active");
      setBodyActive(true);
      playFor(n);

      const state = Flip.getState(pw);
      place(pw, rectFor(tg));

      Flip.from(state, {
        duration,
        ease,
        scale: false,
      });
    };

    const closeBy = (nameOrEmpty: string) => {
      if (!isOpen || !pw) return;
      if (nameOrEmpty && nameOrEmpty !== n) return;

      stopFor(n);
      setStatus("not-active");

      const state = Flip.getState(pw);

      pw.style.cssText = pwCss;
      if (lb) lb.style.zIndex = String(lbZIndex);
      if (pw) pw.style.zIndex = String(pwZIndex);

      Flip.from(state, {
        duration,
        ease,
        absolute: true,
        scale: false,
        onComplete: () => {
          zOff();
          setBodyActive(false);
          n = "";
          isOpen = false;
          lb = pw = tg = null;
          pwCss = "";
          lbZ = "";
          pwZ = "";
        },
      });
    };

    const onResize = () => {
      if (!isOpen || !pw || !tg) return;
      place(pw, rectFor(tg));
    };

    const onOpenClick = (e: Event) => {
      const target = e.target as Element | null;
      const btn = target?.closest("[data-mini-showreel-open]");
      if (!btn) return;
      e.preventDefault();
      openBy(btn.getAttribute("data-mini-showreel-open") || "");
    };

    const onCloseClick = (e: Event) => {
      const target = e.target as Element | null;
      const closeBtn = target?.closest("[data-mini-showreel-close]");
      if (!closeBtn) return;
      e.preventDefault();
      closeBy(closeBtn.getAttribute("data-mini-showreel-close") || "");
    };

    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeBy("");
    };

    document.addEventListener("click", onOpenClick);
    document.addEventListener("click", onCloseClick);
    window.addEventListener("keydown", onKeydown);
    window.addEventListener("resize", onResize);

    return () => {
      document.removeEventListener("click", onOpenClick);
      document.removeEventListener("click", onCloseClick);
      window.removeEventListener("keydown", onKeydown);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div
      data-mini-showreel-lightbox={SHOWREEL_NAME}
      data-mini-showreel-status="not-active"
      className="mini-showreel-lightbox pointer-events-none fixed inset-0 z-[999] flex items-center justify-center p-12 overflow-hidden"
    >
      <div
        data-mini-showreel-close=""
        className="mini-showreel-lightbox__dark absolute inset-0 w-full h-full bg-black/60 cursor-pointer"
      />
      <div
        data-mini-showreel-safearea=""
        className="mini-showreel-lightbox__safearea flex items-center justify-center w-full h-full"
      >
        <div
          data-mini-showreel-target=""
          className="mini-showreel-lightbox__target flex items-center justify-center w-full"
        >
          <div className="w-full pt-[56.25%]" />
        </div>
      </div>
    </div>
  );
}
