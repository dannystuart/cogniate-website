---
date: 2026-04-29
section: Landscape
status: design
---

# Landscape stats — animations

Adds scroll-triggered motion to the three stat blocks in `app/sections/Landscape.tsx`. Each block lands on its own as the user scrolls. The bottom row pays off the section with a "154 hours → 60 minutes" punchline swap.

## Triggers

Four independent `ScrollTrigger`s, each `once: true`, `start: "top 70%"`. No replay on scroll-back.

| # | Element | Trigger element |
|---|---|---|
| 1 | Title `Imagine being 150x faster.` | the `<h2>` |
| 2 | Landscape stat block | left stat container |
| 3 | Opportunity stat block | right stat container |
| 4 | Bottom row (154→60 swap) | bottom row container |

A `useRef` "has fired" guard per trigger prevents duplicate timelines across re-renders. All triggers + in-flight timelines are killed on unmount.

## Initial state

Before each trigger fires, its targets are hidden:

- Vertical lines: `height: 0` (with `transform-origin: bottom` for the dim Opportunity segment so it grows upward from its own bottom edge)
- Number-block parents: `opacity: 0` (so the user never sees raw "$0" or "0%")
- Text elements (eyebrow, descriptor word, subtitle): `opacity: 0`, `translateY: 6px`
- Bottom row: both states ("Traditional / 154 hours" and "60 minutes / Cogniate") rendered in DOM, absolutely positioned in the same row container, stacked. Old state opacity 0 until count-up fade-in. New state opacity 0 throughout until the swap.

## Title timeline

Single tween. ~600ms.

```
opacity 0 → 1
translateY -8px → 0
ease: power2.out
```

## Landscape block timeline (~1.4s)

```
t=0.00  Solid line (#BC9FE0, 219px tall)
        height: 0 → 219px           (1.0s, power2.out)
t=0.00  "$361" counts 0 → 361        (1.0s, synced, power2.out)
        - GSAP tween on a number proxy, onUpdate writes Math.round(val) to the span
        - tabular-nums to lock digit width
t=1.00  Eyebrow + subtitle fade in
        opacity 0 → 1, translateY 6px → 0
        500ms each, stagger 80ms, power2.out
t=1.40  Done

Note: "billion" sits inside the number wrapper and is visible from t=0 — the user
sees "$0 billion → $361 billion" counting, not bare digits.
```

## Opportunity block timeline (~1.7s)

The split line gets staged reveal. The solid red segment (the "12%") grows synced with the number; the dim segment (the "88% that doesn't reach") follows on its own beat.

```
t=0.00  Solid red (#FA677C, 42px tall, bottom)
        height: 0 → 42px            (0.7s, power2.out)
t=0.00  "12%" counts 0 → 12          (0.7s, synced, power2.out)
t=0.70  Dim segment (rgba(250,103,124,0.3), 183px tall, top)
        height: 0 → 183px           (0.4s, power2.out)
        Grows upward from its own bottom edge (transform-origin: bottom)
t=1.10  Eyebrow + subtitle fade in
        opacity 0 → 1, translateY 6px → 0
        500ms each, stagger 80ms, power2.out
t=1.70  Done

Note: "only" sits inside the number wrapper and is visible from t=0 — the user
sees "only 0% → only 12%" counting.
```

## Bottom row — 154 → 60 swap (~3.3s)

Both states live in the DOM the whole time, stacked via absolute positioning inside the row container. The swap is pure opacity + transform.

```
t=0.00  Old state ("Traditional course creation" + "154 hours")
        opacity 0 → 1                (200ms, power2.out)
t=0.00  "154" counts 0 → 154         (1.2s, power2.out)
t=1.20  Hold "154 hours" steady     (1.0s)
t=2.20  Old state sinks out
        - "Traditional course creation" (left): opacity 1→0, translateY 0 → +24px
        - "154 hours" (right):              opacity 1→0, translateY 0 → +24px
        - 500ms, power2.in
t=2.55  Empty beat                   (150ms)
t=2.70  New state rises in
        - "60 minutes" (left):                opacity 0→1, translateY +24px → 0, scale 0.96 → 1
        - "Course creation with Cogniate" (right): opacity 0→1, translateY +24px → 0
        - 600ms, power2.out
t=3.30  Final state — stays here
```

Choreography rule: **everything departing sinks; everything arriving rises**. Coordinated up/down across the whole row.

## Markup changes

The current bottom row needs to become two stacked states inside a single positioning parent:

```tsx
<div className="relative ...">
  {/* Old state — Traditional / 154 hours */}
  <div className="bottom-row-old absolute inset-0 flex ...">
    <p>Traditional course creation</p>
    <span><span ref={count154Ref}>0</span> hours</span>
  </div>

  {/* New state — 60 minutes / Cogniate */}
  <div className="bottom-row-new absolute inset-0 flex ...">
    <span>60 minutes</span>
    <p>Course creation with Cogniate</p>
  </div>
</div>
```

The Landscape and Opportunity blocks need:

- A ref on the line element (or on each segment, for Opportunity)
- A ref on the count-up `<span>` (the digits only — descriptor words like "billion" / "only" stay separate)
- A ref on the eyebrow, descriptor word, and subtitle so they can be staggered together

## Reduced motion

`@media (prefers-reduced-motion: reduce)` (detected via `window.matchMedia` at trigger creation time):

- Skip all GSAP timelines
- Set lines to full height
- Set numbers to final values ("$361", "12%")
- Set bottom row directly to the "60 minutes / Cogniate" final state
- All text fully visible, no transforms

## Mobile

Vertical lines are already `hidden lg:block` in markup. On mobile:

- No line growth (nothing to grow)
- Count-ups still run
- Text fade-in still runs
- Bottom row swap still runs

## Cleanup

- All `ScrollTrigger`s tracked in refs, killed in the `useEffect` cleanup
- All timelines tracked in refs, killed in cleanup
- No resize handler needed (timelines aren't viewport-dependent)
