# Platform Section Design

## Overview

A scroll-driven card stack section at the bottom of the site. A fixed gradient background stays in place while cards transition via scroll — each card scales down and moves up, revealing the next card rising from behind (card stack effect).

## Architecture

- **Outer section:** Height = `cards.length * 150vh` to provide scroll distance
- **Sticky viewport:** `100vh`, pinned at `top: 0`, contains gradient BG, title, and card area
- **Card stack:** Cards absolutely positioned on top of each other. GSAP ScrollTrigger with `scrub` drives transitions based on scroll progress
- **Scroll math:** Timeline divided into equal segments per card transition. Card N scales (1 -> 0.85) and translates up (-25%), Card N+1 rises from below (110% -> 0%) and scales up (0.92 -> 1)

## Gradient Background

- Static PNG export from Figma (will swap to video later)
- Stays fixed inside the sticky container
- Rounded corners (50px) with dark `bg-secondary` showing behind
- On mobile: full-width, no inset, reduced opacity

## Card Component

### Layout (Auto Layout / Flex Row)

- Container: `max-w-[1301px]`, `rounded-20px`, bg `#141318`
- Padding: `80px horizontal`, `40px vertical`
- Gap between halves: `120px`
- Inner border glow via inset box-shadow
- Subtle decorative ellipse glow behind content

### Content Side (~455px)

- Title: gradient text, 40px semibold (reuses `landscape-heading-gradient`)
- Subtitle: "with Lyra(R)" style, 28px, muted purple-white
- Description: 18px, `rgba(244,238,255,0.8)`
- Two feature blocks side-by-side:
  - Glass icon button (36x36, rounded-8, gradient + inset shadow)
  - Label (20px white)
  - Short description (14px muted)

### Placeholder Side (fills remaining width)

- Rounded-20px, bg `#24202c`, thin border `0.5px rgba(223,223,223,0.2)`
- Gradient-only fill for now (Figma gradient PNG)
- Easy to swap for SVG/video later

### Flipping

Cards alternate layout via `layout` property: `"content-left"` or `"content-right"`. Flex order swaps which side content/placeholder appears on.

## Card Data

- 3 cards initially, data-driven array so adding more is trivial
- All placeholder text for now (real copy provided later)
- Cards alternate layout: left, right, left

## Responsive / Mobile (< 1024px)

- No sticky, no scroll-driven animation
- Section has `auto` height, normal document flow
- Cards stack vertically with `gap-8`
- Each card fades in on scroll via simple GSAP `fromTo` (opacity + y)
- Card layout switches to `flex-col` (content on top, placeholder below)
- Gradient BG full-width, no inset
- Text scales: title 32px (md: 48px), card titles 28px

### Breakpoint Strategy

Single DOM tree. CSS controls sticky/absolute on desktop vs normal flow on mobile. GSAP uses `gsap.matchMedia()` for per-viewport animations.

## Testing (Playwright)

1. **Desktop (1728x1080):** Section renders, title visible, first card visible with content-left layout, placeholder exists, gradient BG loads
2. **Mobile (390x844):** Cards visible in vertical flow, stacked layout, readable text
3. **Card structure:** Each card has title, subtitle, description, 2 feature blocks with icon buttons, flipped cards swap order
4. **Screenshot baselines:** Desktop + mobile visual regression snapshots

No scroll animation testing (GSAP scrub is brittle in Playwright).

## Assets

- `platform-gradient-bg.png` — Section gradient background (already downloaded from Figma)
- `platform-card-gradient.png` — Card placeholder gradient (already downloaded)
- `platform-icon-arrow.svg` — Feature block chevron icon (already downloaded)

## Files to Create/Modify

- **Create:** `app/sections/Platform.tsx`
- **Modify:** `app/page.tsx` (add Platform import)
- **Create:** `tests/visual/platform.spec.ts`
