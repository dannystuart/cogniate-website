# Platform Accordion Card Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the third Platform card ("Publish") with an accordion-based card that has expanding feature pills on the left and synced cross-fading visuals on the right, matching the Figma design at node 10:6827.

**Architecture:** Create a new `PlatformCardAccordion` component that reuses decorative elements from `PlatformCard` (dark bg, vertical lines, glow, inset border). The accordion logic is ported from the Osmo Expanding Feature Pills resource (`docs/plans/osmo-accordion.md`) — GSAP-powered expanding pills with `data-*` attribute-driven state and CSS opacity transitions. The third card in the `cards` array gets a `layout: "accordion"` discriminator so `Platform.tsx` renders the new component instead of the standard card.

**Tech Stack:** Next.js 16 App Router, React 19, GSAP 3.15, Tailwind 4

**Reference files:**
- Osmo resource: `docs/plans/osmo-accordion.md` (HTML, CSS, JS for expanding feature pills)
- Figma screenshot: node `10:6827` in file `tjO7aMqDQjf6lPFOqwmIdC`
- Current card: `app/sections/Platform.tsx` (lines 135-260, `PlatformCard` component)

---

### Task 1: Add accordion CSS to globals.css

**Files:**
- Modify: `app/globals.css` (append at end)

**Step 1: Add the feature-pills CSS**

Append this block to the end of `app/globals.css`. This is ported directly from the Osmo resource CSS, scoped under `.feature-pills__*` classes. Key adaptations: colors changed to match Cogniate design system (#212027 pill bg, rgba(244,238,255,0.8) text), border-radius matched to Figma (16px pills), and mobile breakpoints adjusted to use `1023px` to align with existing Tailwind `lg:` breakpoint.

```css
/* ============================================
   FEATURE PILLS (Accordion) — Osmo Supply
   ============================================ */

/* --- Pill item backgrounds --- */
.feature-pills__item-bg {
  z-index: 0;
  background-color: #212027;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;
}

/* --- Trigger button --- */
.feature-pills__item-button {
  z-index: 1;
  gap: 0.625em;
  background-color: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  flex-flow: row;
  justify-content: flex-start;
  align-items: center;
  padding: 1em 1.25em;
  position: relative;
  color: inherit;
  font-family: inherit;
}

.feature-pills__item-label {
  letter-spacing: -0.015em;
  white-space: nowrap;
  flex: none;
  font-size: 20px;
  font-weight: 500;
  color: #ffffff;
}

/* --- +/x icon --- */
.feature-pills__item-icon {
  aspect-ratio: 1;
  background-color: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  flex: none;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  display: flex;
  position: relative;
  box-shadow: 0px 0px 0px 1px rgba(255, 255, 255, 0.25);
}

.feature-pills__item-icon::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.1));
  pointer-events: none;
}

.feature-pills__item-icon::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: inset 0px 1px 0px 0px rgba(255, 255, 255, 0.05),
    inset 0px -1px 0px 0px rgba(0, 0, 0, 0.2);
  pointer-events: none;
}

.feature-pills__item-icon-bar {
  background-color: #fff;
  flex: none;
  width: 1px;
  height: 50%;
  position: absolute;
}

.feature-pills__item-icon-bar.is--horizontal {
  width: 50%;
  height: 1px;
}

/* --- Expandable content area --- */
.feature-pills__item-content {
  z-index: 2;
  pointer-events: none;
  position: absolute;
  inset: 0;
}

.feature-pills__item-mask {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.feature-pills__item-inner {
  max-width: var(--content-item-expanded);
  flex-flow: column;
  justify-content: flex-start;
  align-items: flex-start;
  width: max-content;
  padding: 1.25em 1.5em 1.5em;
  display: flex;
}

.feature-pills__item-body {
  margin-bottom: 0;
  font-size: 20px;
  font-weight: 500;
  color: #ffffff;
}

.feature-pills__item-body-span {
  font-size: 14px;
  font-weight: 400;
  color: rgba(244, 238, 255, 0.8);
  line-height: 20px;
}

/* --- Visual panel --- */
.feature-pills__visual-item {
  opacity: 0;
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;
}

.feature-pills__visual-img {
  object-fit: cover;
  width: 100%;
  height: 100%;
}

/* --- Close button --- */
.feature-pills__close-button {
  aspect-ratio: 1;
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.08);
  border: none;
  border-radius: 10em;
  justify-content: center;
  align-items: center;
  width: 2em;
  padding: 8px;
  display: flex;
  position: relative;
  cursor: pointer;
  color: inherit;
}

/* --- Expanded width variable --- */
[data-feature-pills-init] {
  --content-item-expanded: 28em;
}

@media screen and (max-width: 1023px) {
  [data-feature-pills-init] {
    --content-item-expanded: 100%;
  }
}

/* --- State transitions (CSS-driven opacity) --- */
[data-feature-pills-button] {
  opacity: 1;
  transition: opacity 400ms ease-in-out 300ms;
}

[data-feature-pills-inner] {
  opacity: 0;
  transition: opacity 300ms ease-in-out 0ms;
}

[data-feature-pills-visual] {
  opacity: 0;
  transition: opacity 350ms ease-in-out;
}

[data-feature-pills-cover] {
  opacity: 1;
  transition: opacity 350ms ease-in-out;
}

/* Active pill */
[data-feature-pills-item][data-active="true"] [data-feature-pills-button] {
  opacity: 0;
  transition: opacity 50ms ease-in-out 0ms;
}

[data-feature-pills-item][data-active="true"] [data-feature-pills-inner] {
  opacity: 1;
}

/* Active visual */
[data-feature-pills-visual][data-active="true"] {
  opacity: 1;
}

[data-feature-pills-cover][data-active="false"] {
  opacity: 0;
}

/* Close button animation */
[data-feature-pills-close] {
  transform: scale(0) rotate(135deg);
  opacity: 0;
  pointer-events: none;
  transition: all 500ms cubic-bezier(0.7, 0, 0.3, 1);
}

[data-feature-pills-active="true"] [data-feature-pills-close] {
  transform: scale(1) rotate(45deg);
  opacity: 1;
  pointer-events: auto;
}
```

**Step 2: Verify the app still builds**

Run: `pnpm build`
Expected: Build succeeds (CSS is just appended, no component uses it yet)

**Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: add feature-pills accordion CSS from Osmo resource"
```

---

### Task 2: Create PlatformCardAccordion component

**Files:**
- Create: `app/components/PlatformCardAccordion.tsx`

**Step 1: Create the component file**

This component renders the accordion card layout. It reuses the decorative wrapper pattern from `PlatformCard` (dark bg, vertical lines, glow, inset border) and adds the Osmo feature-pills structure inside. The GSAP accordion logic is initialized in a `useEffect`.

```tsx
"use client";

import { useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import gsap from "gsap";

/* ============================================
   TYPES
   ============================================ */

interface PillData {
  label: string;
  description: string;
}

interface AccordionCardData {
  id: string;
  title: string;
  pills: PillData[];
  glowColor: string;
  /** placeholder images for the right-side visual panel, matched by index to pills */
  visuals: string[];
  /** cover image shown when no pill is active */
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
    const openH = Math.max(buttonH, innerH);
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
    const targetW =
      expandedW ||
      `${collapsedWidthPx.get(item) || Math.ceil(item.getBoundingClientRect().width)}px`;
    animateBox(item, { height: openH, width: targetW });
  };

  const closeItem = (item: HTMLElement) => {
    const expandedW = getExpandedWidth();
    const { buttonH } = getHeights(item, expandedW);
    item.setAttribute("data-active", "false");
    setItemA11y(item, false);
    const targetW =
      collapsedWidthPx.get(item) ||
      Math.ceil(item.getBoundingClientRect().width);
    animateBox(item, { height: buttonH, width: targetW });
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
      const targetW = expandedW || "";
      if (prefersReducedMotion) {
        item.style.height = `${openH}px`;
        if (targetW) item.style.width = targetW;
      } else {
        const fallbackW = `${Math.ceil(item.getBoundingClientRect().width)}px`;
        gsap.set(item, { height: openH, width: targetW || fallbackW });
        if (targetW) item.style.width = targetW;
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

      {/* Decorative vertical lines */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none overflow-hidden rounded-[20px]"
      >
        {[44, 54, 64, 74, 84, 94, 104].map((pct) => (
          <div
            key={pct}
            className="absolute top-0 h-[140%] -translate-y-[15%]"
            style={{
              left: `${pct}%`,
              width: "1px",
              background:
                "linear-gradient(to bottom, transparent, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.06) 80%, transparent)",
            }}
          />
        ))}
      </div>

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
        <div className="relative shrink-0 w-full lg:w-[499px] px-6 py-8 lg:px-[60px] xl:px-[80px] lg:py-[40px]">
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
                          <br />
                          <br />
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
        <div className="relative z-10 w-full lg:flex-1 overflow-hidden rounded-[20px] lg:rounded-l-none min-h-[300px] lg:min-h-0">
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
          <div className="relative w-full h-full overflow-hidden">
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
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No type errors

**Step 3: Commit**

```bash
git add app/components/PlatformCardAccordion.tsx
git commit -m "feat: add PlatformCardAccordion component with Osmo accordion logic"
```

---

### Task 3: Integrate into Platform section

**Files:**
- Modify: `app/sections/Platform.tsx`

**Step 1: Update the cards data and imports**

At the top of `Platform.tsx`, add the import:

```tsx
import PlatformCardAccordion from "../components/PlatformCardAccordion";
```

**Step 2: Change the third card data**

Replace the third card object in the `cards` array (the "publish" card, lines 59-80) with:

```tsx
{
  id: "publish",
  title: "Features, not friction.",
  layout: "accordion" as const,
  glowColor: "rgba(252, 232, 158, 0.12)",
  pills: [
    {
      label: "Course Editor",
      description:
        "A powerful editing experience that brings your course to life. Customize every detail with professional tools.",
    },
    {
      label: "Analytics",
      description:
        "Track learner progress and engagement with real-time dashboards. Understand what works and optimize.",
    },
    {
      label: "Integrations",
      description:
        "Connect seamlessly with your existing LMS, HR systems, and collaboration tools out of the box.",
    },
    {
      label: "Collaboration",
      description:
        "Work together in real-time with your team. Review, comment, and iterate on course content together.",
    },
  ],
  visuals: [
    "/assets/platform-card-gradient.png",
    "/assets/platform-card-gradient.png",
    "/assets/platform-card-gradient.png",
    "/assets/platform-card-gradient.png",
  ],
  coverImage: "/assets/platform-card-gradient.png",
},
```

**Step 3: Update the cards array type**

The `cards` array type needs to be a discriminated union since items now have different shapes. Update the type at the top to:

```tsx
type StandardCard = {
  id: string;
  title: string;
  subtitle: string;
  trademark: string;
  description: string;
  features: { label: string; description: string }[];
  layout: "content-left" | "content-right";
  glowColor: string;
};

type AccordionCard = {
  id: string;
  title: string;
  layout: "accordion";
  glowColor: string;
  pills: { label: string; description: string }[];
  visuals: string[];
  coverImage: string;
};

type CardData = StandardCard | AccordionCard;
```

Type the `cards` array as `const cards: CardData[] = [...]`.

**Step 4: Update the card rendering**

In the JSX where `<PlatformCard card={card} />` is rendered (around line 437), add a conditional:

```tsx
{card.layout === "accordion" ? (
  <PlatformCardAccordion card={card} />
) : (
  <PlatformCard card={card} />
)}
```

Update `PlatformCard` to accept `{ card: StandardCard }` instead of `{ card: (typeof cards)[number] }`.

**Step 5: Verify the build**

Run: `pnpm build`
Expected: Build succeeds

**Step 6: Verify visually**

Run: `pnpm dev`
Check: Third Platform card renders with accordion pills on left, image on right. Clicking a pill expands it, collapses the previous one, and cross-fades the visual.

**Step 7: Commit**

```bash
git add app/sections/Platform.tsx
git commit -m "feat: integrate accordion card as third Platform card"
```

---

### Task 4: Visual polish and responsive check

**Files:**
- Possibly modify: `app/components/PlatformCardAccordion.tsx`
- Possibly modify: `app/globals.css`

**Step 1: Check desktop layout**

Run `pnpm dev` and verify at 1440px+ viewport:
- Title "Features, not friction." has gradient text
- 4 pills stacked vertically with proper spacing
- First pill collapsed by default (all collapsed initially)
- Clicking a pill expands it to show title + description
- Right panel shows cover image, swaps when pill is active
- Close button (X) appears top-right when a pill is active
- Escape key closes active pill

**Step 2: Check tablet (768px-1023px)**

- Card stacks vertically (image on top, pills below)
- Pills expand to full width
- Visual panel maintains aspect ratio

**Step 3: Check mobile (375px)**

- Everything single-column, readable
- Pills are full-width, expand properly
- No horizontal overflow

**Step 4: Fix any issues found**

Address spacing, sizing, or layout issues discovered.

**Step 5: Commit any fixes**

```bash
git add -A
git commit -m "fix: polish accordion card responsive layout"
```
