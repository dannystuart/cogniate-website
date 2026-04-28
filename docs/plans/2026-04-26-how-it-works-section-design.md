# How It Works Section — Design Document

## Overview

A new section added below CogniateStory on the Cogniate homepage. It showcases the 3-step workflow (Create, Design, Publish) with UI cards on a dark grid background, animated purple gradient lines, and hover interactions.

## Layout

- **Background**: `#111112`
- **Max content width**: ~1710px, centered
- **"HOW IT WORKS"** eyebrow label: top-left, uppercase, `tracking-[4.8px]`, 16px, subtle background pill (`rgba(211,204,255,0.05)`), white/80 text

### Desktop
- 3 cards in a horizontal row, ~412px wide each, ~608px tall, ~34px gap
- Background grid lines behind and extending above/below cards (~130px padding)
- Animated purple gradient lines overlaid on the grid

### Mobile
- Cards stack vertically, full-width
- Grid lines reduce from ~11 to ~5-6
- Animated lines scale proportionally

## Background Grid Lines

- ~11 vertical `<div>` elements, evenly spaced across content width
- Pure HTML/CSS — no SVGs
- Each line: 1px wide, vertical `linear-gradient`:
  - `transparent` → `rgba(255,255,255,0.06)` → `rgba(255,255,255,0.08)` → `rgba(255,255,255,0.06)` → `transparent`
- Extend ~130px above and below the card area
- Generated via `.map()` loop
- Mobile: ~5-6 lines

## Cards

Three cards with identical structure: **Create**, **Design**, **Publish**.

### Card Structure (top to bottom)
1. **Icon + Title row**: 36px square button (rounded-[8px], subtle border + inner gradient sheen) with `>` chevron, followed by title (Geist Sans medium, 28px, white)
2. **Description**: 20px, `rgba(244,238,255,0.9)`, 28px line-height, two paragraphs
3. **Italic tagline**: IBM Plex Serif italic, 24px, coral `#fa677c`
4. **Bottom image**: Card screenshot from Figma, positioned to bleed at bottom, clipped by `overflow-hidden`

### Card Styling
- Background: diagonal gradient `138deg` from `rgba(51,42,65,0.7)` at 22% to `rgba(7,9,33,0)` at 82%
- Border: inset box-shadow (`rgba(255,255,255,0.1)` top + `rgba(255,255,255,0.06)` border)
- Outer shadow: subtle blue-tinted glow `rgba(7,13,79,0.05)`
- Rounded: 20px

### Hover Interaction
- Bottom image scales to 1.05x with `transition: transform 0.4s ease-out`

### Card Content

**Create**
- Description: "Describe what you need. Lyra thinks, researches, structures, and writes your course."
- Tagline: "In minutes, not months."

**Design**
- Description: "Customise your brand. Select interactive components, refine with AI suggestions, no design skills required."
- Tagline: "Every output is enterprise-grade."

**Publish**
- Description: "Deploy to any LMS. Share internally or sell on the marketplace. Built-in automatic content updates keep your courses current."
- Tagline: "Omnichannel publishing."

## Animated Purple Gradient Lines

### Elements
- 1 vertical line: center-top of section, running down to card area
- 2 horizontal lines: at the height where vertical line ends, spreading left and right

### Base Lines (always visible, dim)
- Vertical: 3px wide, subtle gradient `rgba(174,180,255,0.06)` → `rgba(174,180,255,0.12)`
- Horizontal: two thin lines extending from center to left/right card edges

### Animation (GSAP)
**Trigger**: ScrollTrigger when section enters viewport, then loops (`repeat: -1`, ~1s repeatDelay)

**Sequence**:
1. Vertical glow fades in and travels down the vertical line (~1.8s, power2.inOut)
2. At bottom of vertical line, glow fades; 2 horizontal glows appear at center and spread outward (~1.2s, ease-out) — left goes left, right goes right
3. Brief pause (~1s), reset and loop

### Glow Styling (matching ScrollIndicator)
- Color: `rgba(174,180,255,...)`
- Box shadow: `0 0 12px 4px rgba(174,180,255,0.4), 0 0 30px 8px rgba(174,180,255,0.2)`
- Gradient: `transparent → 0.15 → 0.8 → 0.15 → transparent`

## Assets

- 3 card images downloaded from Figma → `public/assets/`
  - `how-card-create.png`
  - `how-card-design.png`
  - `how-card-publish.png`
- Chevron icon: CSS-generated or inline SVG `>`

## Files to Create/Modify

- **Create**: `app/sections/HowItWorks.tsx`
- **Modify**: `app/page.tsx` (add HowItWorks import and render)
- **Download**: 3 card images to `public/assets/`
- **Modify**: `app/globals.css` (any needed utility classes)
