"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";

/* ============================================
   TYPES
   ============================================ */

export interface PillData {
  label: string;
  description: string;
}

export interface AccordionCardData {
  id: string;
  title: string;
  layout: "accordion";
  pills: PillData[];
  glowColor: string;
  visuals: string[];
  coverImage: string;
}

/* ============================================
   ACCORDION INIT (ported from Osmo resource)
   ============================================ */

function initExpandingFeaturePills(wrap: HTMLElement) {
  const items = Array.from(
    wrap.querySelectorAll<HTMLElement>("[data-feature-pills-item]")
  );
  const visuals = Array.from(
    wrap.querySelectorAll<HTMLElement>("[data-feature-pills-visual]")
  );
  const cover = wrap.querySelector<HTMLElement>("[data-feature-pills-cover]");
  const closeBtn = wrap.querySelector<HTMLButtonElement>(
    "[data-feature-pills-close]"
  );
  if (!items.length) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const uidBase = "feature-pills-0";
  const ease = "back.out(2)";
  const animationDuration = 0.5;

  const getExpandedWidth = () =>
    getComputedStyle(wrap).getPropertyValue("--content-item-expanded").trim() ||
    "";

  const getActiveIndex = (): number | null => {
    const active = items.find(
      (it) => it.getAttribute("data-active") === "true"
    );
    return active
      ? Number(active.getAttribute("data-feature-pills-index"))
      : null;
  };

  const setWrapActive = (isActive: boolean) => {
    wrap.setAttribute(
      "data-feature-pills-active",
      isActive ? "true" : "false"
    );
    if (closeBtn)
      closeBtn.setAttribute("aria-hidden", isActive ? "false" : "true");
    if (cover) {
      cover.setAttribute("data-active", isActive ? "false" : "true");
      cover.setAttribute("aria-hidden", isActive ? "true" : "false");
    }
  };

  const setVisualActive = (indexOrNull: number | null) => {
    if (!visuals.length) return;
    visuals.forEach((v) => {
      const idx = Number(v.getAttribute("data-feature-pills-index"));
      const isActive = indexOrNull !== null && idx === indexOrNull;
      v.setAttribute("data-active", isActive ? "true" : "false");
      v.setAttribute("aria-hidden", isActive ? "false" : "true");
    });
  };

  const setItemA11y = (item: HTMLElement, isOpen: boolean) => {
    const btn = item.querySelector<HTMLElement>("[data-feature-pills-button]");
    const content = item.querySelector<HTMLElement>(
      "[data-feature-pills-content]"
    );
    if (!btn || !content) return;
    btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    content.setAttribute("aria-hidden", isOpen ? "false" : "true");
  };

  const measureButtonH = (item: HTMLElement) => {
    const btn = item.querySelector<HTMLElement>("[data-feature-pills-button]");
    return btn ? Math.ceil(btn.getBoundingClientRect().height) : 0;
  };

  const measureInnerH = (item: HTMLElement, expandedW: string) => {
    const inner = item.querySelector<HTMLElement>("[data-feature-pills-inner]");
    if (!inner) return 0;
    const mask = item.querySelector<HTMLElement>(".feature-pills__item-mask");
    const prevMaskOverflow = mask ? mask.style.overflow : null;
    if (mask) mask.style.overflow = "visible";
    const prevMaxW = inner.style.maxWidth;
    if (expandedW) inner.style.maxWidth = expandedW;
    const h = Math.ceil(inner.getBoundingClientRect().height);
    if (expandedW) inner.style.maxWidth = prevMaxW || "";
    if (mask) mask.style.overflow = prevMaskOverflow || "";
    return h;
  };

  const getHeights = (item: HTMLElement, expandedW: string) => {
    const buttonH = measureButtonH(item);
    const innerH = measureInnerH(item, expandedW);
    // Open pill is fluid to its content — innerH already includes padding,
    // so no artificial floor. buttonH is only used as a safety net in case
    // innerH measurement returns 0 (e.g. content not yet in the DOM).
    const openH = innerH || buttonH;
    return { buttonH, openH };
  };

  const collapsedWidthPx = new Map<HTMLElement, number>();

  const captureCollapsedWidths = () => {
    items.forEach((item) => {
      const prev = item.style.width;
      item.style.width = "";
      collapsedWidthPx.set(
        item,
        Math.ceil(item.getBoundingClientRect().width)
      );
      item.style.width = prev;
    });
  };

  const animateBox = (
    el: HTMLElement,
    vars: { height?: number; width?: number | string }
  ) => {
    gsap.killTweensOf(el);
    if (prefersReducedMotion) {
      if (vars.height != null) el.style.height = `${vars.height}px`;
      if (vars.width != null)
        el.style.width =
          typeof vars.width === "number" ? `${vars.width}px` : vars.width;
      return;
    }
    gsap.to(el, {
      ...vars,
      duration: animationDuration,
      ease,
      overwrite: true,
    });
  };

  const openItem = (item: HTMLElement) => {
    const expandedW = getExpandedWidth();
    const { openH } = getHeights(item, expandedW);
    item.setAttribute("data-active", "true");
    setItemA11y(item, true);
    setWrapActive(true);
    // Width is left alone — every pill keeps the same width regardless of state.
    animateBox(item, { height: openH });
  };

  const closeItem = (item: HTMLElement) => {
    const expandedW = getExpandedWidth();
    const { buttonH } = getHeights(item, expandedW);
    item.setAttribute("data-active", "false");
    setItemA11y(item, false);
    animateBox(item, { height: buttonH });
  };

  const switchTo = (nextIndex: number) => {
    const current = getActiveIndex();
    if (current === nextIndex) return;
    const nextItem = items[nextIndex];
    if (!nextItem) return;
    if (current !== null) closeItem(items[current]);
    openItem(nextItem);
    setVisualActive(nextIndex);
  };

  const closeAll = () => {
    const current = getActiveIndex();
    if (current === null) return;
    closeItem(items[current]);
    setVisualActive(null);
    setWrapActive(false);
  };

  // --- Initialize IDs and ARIA ---
  items.forEach((item, i) => {
    item.setAttribute("data-feature-pills-index", String(i));
    if (!item.hasAttribute("data-active"))
      item.setAttribute("data-active", "false");
    const btn = item.querySelector<HTMLElement>("[data-feature-pills-button]");
    const content = item.querySelector<HTMLElement>(
      "[data-feature-pills-content]"
    );
    if (btn) {
      btn.setAttribute("data-feature-pills-index", String(i));
      (btn as HTMLButtonElement).type = "button";
      if (!btn.id) btn.id = `${uidBase}-trigger-${i}`;
    }
    if (content && btn) {
      content.setAttribute("data-feature-pills-index", String(i));
      if (!content.id) content.id = `${uidBase}-panel-${i}`;
      btn.setAttribute("aria-controls", content.id);
      content.setAttribute("role", "region");
      content.setAttribute("aria-labelledby", btn.id);
      if (!content.hasAttribute("aria-hidden"))
        content.setAttribute("aria-hidden", "true");
      if (!btn.hasAttribute("aria-expanded"))
        btn.setAttribute("aria-expanded", "false");
    }
  });

  visuals.forEach((v, i) =>
    v.setAttribute("data-feature-pills-index", String(i))
  );

  if (closeBtn) {
    closeBtn.type = "button";
    if (!closeBtn.hasAttribute("aria-hidden"))
      closeBtn.setAttribute("aria-hidden", "true");
    closeBtn.addEventListener("click", closeAll);
  }

  // Set initial collapsed heights
  items.forEach((item) => {
    const h = measureButtonH(item);
    item.style.height = `${h}px`;
  });

  setWrapActive(false);
  setVisualActive(null);

  // Bind click handlers
  items.forEach((item, i) => {
    const btn = item.querySelector<HTMLElement>("[data-feature-pills-button]");
    if (!btn) return;
    btn.addEventListener("click", () => switchTo(i));
  });

  // Open the first pill by default. Defer until after layout so measureInnerH
  // gets accurate dimensions (fonts/images settled), then switch instantly.
  if (items[0]) {
    requestAnimationFrame(() => {
      const expandedW = getExpandedWidth();
      const { openH } = getHeights(items[0], expandedW);
      items[0].setAttribute("data-active", "true");
      setItemA11y(items[0], true);
      setWrapActive(true);
      setVisualActive(0);
      items[0].style.height = `${openH}px`;
    });
  }

  // Escape key
  wrap.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll();
  });

  // Resize handling
  const debounce = (fn: () => void, wait = 150) => {
    let t: ReturnType<typeof setTimeout>;
    return () => {
      clearTimeout(t);
      t = setTimeout(fn, wait);
    };
  };

  const handleResize = () => {
    const current = getActiveIndex();
    items.forEach((item) => {
      if (item.getAttribute("data-active") !== "true") item.style.width = "";
    });
    captureCollapsedWidths();
    if (current !== null) {
      const item = items[current];
      const expandedW = getExpandedWidth();
      const { openH } = getHeights(item, expandedW);
      if (prefersReducedMotion) {
        item.style.height = `${openH}px`;
      } else {
        gsap.set(item, { height: openH });
      }
    } else {
      items.forEach((item) => {
        const h = measureButtonH(item);
        item.style.height = `${h}px`;
      });
    }
  };

  captureCollapsedWidths();
  const debouncedResize = debounce(handleResize, 200);
  window.addEventListener("resize", debouncedResize, { passive: true });

  // Return cleanup
  return () => {
    window.removeEventListener("resize", debouncedResize);
    if (closeBtn) closeBtn.removeEventListener("click", closeAll);
  };
}

/* ============================================
   COMPONENT
   ============================================ */

export default function PlatformCardAccordion({
  card,
}: {
  card: AccordionCardData;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const cleanup = initExpandingFeaturePills(wrap);
    return cleanup;
  }, []);

  return (
    <div
      className="relative flex flex-col lg:flex-row items-stretch overflow-hidden rounded-[20px]"
      style={{
        boxShadow:
          "0px 0px 100px 0px rgba(0,0,0,0.3), 0px 0px 20px 3px rgba(7,13,79,0.05), 0px 0px 40px 20px rgba(7,13,79,0.05)",
      }}
    >
      {/* Dark card background */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[#141318] pointer-events-none rounded-[20px]"
      />

      {/* Decorative ellipse glow */}
      <div
        aria-hidden
        className="absolute pointer-events-none overflow-hidden inset-0 rounded-[20px]"
      >
        <div
          className="absolute"
          style={{
            width: "94%",
            height: "118%",
            right: "-10%",
            bottom: "-60%",
            background: `radial-gradient(ellipse at center, ${card.glowColor} 0%, transparent 65%)`,
          }}
        />
      </div>

      {/* ===== ACCORDION CONTENT ===== */}
      <div
        ref={wrapRef}
        data-feature-pills-init=""
        data-feature-pills-active="false"
        aria-label="product features"
        className="relative z-10 flex flex-col lg:flex-row w-full"
      >
        {/* Left column: title + pills */}
        <div className="relative w-full lg:w-1/2 px-6 py-8 lg:px-[60px] xl:px-[80px] lg:py-[40px]">
          {/* Section title */}
          <p className="landscape-heading-gradient font-semibold text-[28px] lg:text-[36px] xl:text-[40px] leading-[1.1] tracking-[-0.04em] mb-8 lg:mb-10">
            {card.title}
          </p>

          {/* Pills list */}
          <div data-feature-pills-collection="">
            <ul
              role="list"
              data-feature-pills-list=""
              className="flex flex-col gap-[16px] lg:gap-[20px] list-none p-0 m-0"
            >
              {card.pills.map((pill, i) => (
                <li
                  key={i}
                  data-feature-pills-item=""
                  data-active="false"
                  className="relative"
                >
                  <div className="feature-pills__item-bg" />
                  <button
                    data-feature-pills-button=""
                    aria-expanded="false"
                    className="feature-pills__item-button w-full justify-between"
                  >
                    <span className="feature-pills__item-label">
                      {pill.label}
                    </span>
                    <span className="feature-pills__item-icon">
                      <span className="feature-pills__item-icon-bar" />
                      <span className="feature-pills__item-icon-bar is--horizontal" />
                    </span>
                  </button>
                  <div
                    aria-hidden="true"
                    data-feature-pills-content=""
                    className="feature-pills__item-content"
                  >
                    <div className="feature-pills__item-mask">
                      <div
                        data-feature-pills-inner=""
                        className="feature-pills__item-inner"
                      >
                        <p className="feature-pills__item-body">
                          {pill.label}
                          <span className="feature-pills__item-body-span">
                            {pill.description}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right column: visual panel */}
        <div className="relative z-10 w-full lg:w-1/2 overflow-hidden rounded-[20px] lg:rounded-l-none min-h-[300px] md:min-h-[480px] lg:min-h-[600px]">
          {/* Visual background */}
          <div className="absolute inset-0 bg-[#17161b]" />

          {/* Decorative ellipse inside visual panel */}
          <div
            aria-hidden
            className="absolute pointer-events-none"
            style={{
              width: "100%",
              height: "120%",
              left: "-20%",
              bottom: "-40%",
              background:
                "radial-gradient(ellipse at center, rgba(183,139,249,0.08) 0%, transparent 60%)",
            }}
          />

          {/* Visual items (one per pill, cross-fade) */}
          <div className="absolute inset-0 overflow-hidden">
            {card.visuals.map((src, i) => (
              <div
                key={i}
                aria-hidden="true"
                data-feature-pills-visual=""
                className="feature-pills__visual-item"
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className="feature-pills__visual-img object-cover"
                />
              </div>
            ))}
          </div>

          {/* Cover image (shown when no pill active) */}
          <div
            data-feature-pills-cover=""
            className="absolute inset-0 z-[1]"
          >
            <Image
              src={card.coverImage}
              alt=""
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Close button */}
        <div
          className="absolute z-20 top-4 right-4"
          data-feature-pills-close=""
        >
          <button
            aria-hidden="true"
            className="feature-pills__close-button"
          >
            <span className="feature-pills__item-icon-bar" />
            <span className="feature-pills__item-icon-bar is--horizontal" />
          </button>
        </div>
      </div>

      {/* Card inset border */}
      <div
        className="absolute inset-0 pointer-events-none rounded-[inherit] z-20"
        style={{
          boxShadow:
            "inset 0px 1px 0px 0px rgba(255,255,255,0.1), inset 0px 0px 0px 1px rgba(255,255,255,0.06)",
        }}
      />
    </div>
  );
}
