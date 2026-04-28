# Cogniate Story Section — Design Document

**Date:** 2026-04-23
**Figma:** https://www.figma.com/design/tjO7aMqDQjf6lPFOqwmIdC/Cogniate-Website?node-id=10-10275

## Overview

The "Cogniate Story" section tells the brand narrative through three interactive story icons arranged around concentric circles. Users hover (desktop) or tap (mobile) each icon to reveal a tooltip card with the story content.

## Visual Design

### Heading
- Text: "Learning is a journey. / The Cogniate story."
- "Learning" and "Cogniate" in `font-serif italic`
- Rest in `font-sans font-semibold`
- Size: `text-[32px] sm:text-[48px] lg:text-[64px]`
- Tracking: `tracking-[-0.04em]`, leading: `leading-[1.3]`
- Radial gradient text (white center → dark purple edges) — same pattern as Landscape heading

### Concentric Circles Background (desktop only)
- 4 nested circle outlines, centered below heading
- Very subtle stroke: `rgba(255,255,255,0.08)` approx
- Thin horizontal line through center of circles
- Outer diameter: ~635px
- Hidden on mobile (`hidden lg:block`)

### Story Icons
Three icons positioned around the circles:

| Icon | Position (desktop) | Size | Color/Glow |
|------|-------------------|------|------------|
| Warning ⚠️ | Bottom-left | ~139px | Coral/yellow glow |
| Flag 🚩 | Top-center | 120px | Purple |
| Lightbulb 💡 | Bottom-right | 120px | Green |

Each icon: dark circle fill (`bg-bg-card`-ish), subtle outer glow ring, SVG icon centered.

### Cogniate Logo
- Centered at the intersection point of the circles
- White logo mark, ~154×145px
- Sits atop the horizontal line

### Tooltip Card
- Width: ~450px (desktop), full-width (mobile)
- Background: dark (`~#1a1a1e`), `rounded-2xl`
- Border: `border-white/10`
- Padding: ~40-52px
- Content:
  - Purple uppercase category label (e.g., "PROBLEM")
  - Icon + title row (e.g., warning icon + "Story 1")
  - Description paragraph
- Decorative purple/pink glow ellipse below the card

## Content Data

```ts
const stories = [
  {
    id: 'problem',
    icon: '/assets/story-warning-icon.svg',
    label: 'PROBLEM',
    title: 'Story 1',
    description: 'Acknowledge the problem is systemic, not individual. L&D leaders are talented people stuck in broken workflows.',
    tooltipPosition: 'right', // desktop tooltip anchor
  },
  {
    id: 'mission',
    icon: '/assets/story-flag-icon.svg',
    label: 'MISSION',
    title: 'Story 2',
    description: 'Placeholder: describe the mission and goals that drive the Cogniate platform forward.',
    tooltipPosition: 'below-left',
  },
  {
    id: 'insight',
    icon: '/assets/story-lightbulb-icon.svg',
    label: 'INSIGHT',
    title: 'Story 3',
    description: 'Placeholder: explain the key insight that led to building Cogniate and how it transforms learning.',
    tooltipPosition: 'left',
  },
]
```

## Layout

### Desktop (lg+)
- Section: `bg-bg-secondary`, `py-32`
- Container: `mx-auto max-w-[1330px] px-6`
- Heading centered at top
- Below heading: relative container holding concentric circles SVG
- Icons: absolutely positioned within the circles container
- Tooltip: absolutely positioned near the hovered icon, fade-in transition
- Only one tooltip visible at a time

### Mobile (< lg)
- Concentric circles hidden
- Heading scales down responsively
- Icons stack vertically, centered, with `gap-6`
- Accordion behavior: tap icon → tooltip card slides down below it
- Only one accordion open at a time (tap another → close current, open new)
- Icon size: 120px (touch-friendly)
- Tooltip card: full-width, flows in document (no absolute positioning)
- Section padding: `py-20`

## Component Architecture

```
app/sections/CogniateStory.tsx    — "use client", manages activeStory state
app/components/StoryIcon.tsx      — Reusable icon circle with glow effect
app/components/StoryTooltip.tsx   — Tooltip card content
public/assets/                    — Icon SVGs + logo downloaded from Figma
```

### State Management
- `useState<string | null>` for `activeStory`
- Desktop: `onMouseEnter` → set, `onMouseLeave` → clear
- Mobile: `onClick` → toggle (same = close, different = switch)

### Responsive Strategy
- Render both layouts, toggle with `hidden lg:block` / `lg:hidden`
- No JS media query detection needed

## Design System Additions
- New CSS gradient class for heading (or reuse `landscape-heading-gradient`)
- Tooltip glow color token if needed

## Animations (deferred)
- Scroll-triggered sequential icon appearance (warning → flag → lightbulb)
- Will be added in a future iteration using GSAP (already installed)
- For now: icons are always visible, tooltip fades with `opacity` transition

## Testing
- Playwright visual regression at 375px, 768px, 1728px
- Test hover tooltip on desktop viewport
- Test accordion tap behavior on mobile viewport
- Compare against Figma screenshot reference
