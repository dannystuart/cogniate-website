# Design System Page

## Goal

A private `/design-system` route where Danny can tweak design tokens visually (sliders/inputs), see the effect on real components live, and copy a clean updated `@theme` block back into `globals.css`. Lightweight — no backend, no file-write integration, just clipboard.

## Context

`app/globals.css` already defines colors and font families as CSS variables in a Tailwind v4 `@theme` block. Typography sizes, weights, line-heights, and gradient color stops are scattered inline across components (e.g. `text-[80px]` in Hero.tsx). To make tokens tweakable from one place, we tokenize the values we care about and have components consume utility classes generated from those tokens.

## Scope

### In scope

- `/design-system` route, public but unlinked from nav
- New tokens in `@theme` for: heading sizes (h1, h1-italic, h2 — per breakpoint), body sizes, heading weights, heading line-height, heading letter-spacing, gradient color stops
- Refactor consumer components (Hero, Landscape, CogniateStory, Benefits, Platform, Signup, Footer) to use the new utilities
- Split-view UI: sticky controls left, scrolling preview right
- Preview shows a token grid (colors, type scale, gradients) and real component excerpts
- localStorage persistence of in-progress tweaks
- "Reset to baseline" button
- "Copy `@theme` block" button with change counter

### Out of scope

- Spacing, padding, border radii, component-specific dimensions
- File-write or git integration
- Auth gating / production hiding (revisit before launch)
- Saved presets, theme history, multi-theme support
- Frame toggle (mobile/tablet/desktop preview simulation) — defer

## Architecture

### Phase 1 — Tokenize

Extend the existing `@theme` block in `app/globals.css` with new tokens. Tailwind v4 auto-generates utilities from `--text-*`, `--font-weight-*`, `--leading-*`, `--tracking-*` prefixes, so consumers can use plain utility classes that reference the variables.

```css
@theme {
  /* existing colors stay */

  /* Heading sizes — three breakpoints each */
  --text-h1-mobile: 32px;
  --text-h1-tablet: 52px;
  --text-h1-desktop: 80px;
  --text-h1-italic-mobile: 40px;
  --text-h1-italic-tablet: 64px;
  --text-h1-italic-desktop: 100px;
  --text-h2-mobile: 28px;
  --text-h2-tablet: 40px;
  --text-h2-desktop: 56px;

  /* Body */
  --text-body: 18px;
  --text-body-lg: 24px;

  /* Heading meta */
  --font-weight-h1: 600;
  --font-weight-h2: 600;
  --leading-heading: 1.1;
  --tracking-heading: -0.04em;

  /* Gradient color stops — per gradient */
  --heading-gradient-stop-1: rgba(255,255,255,1);
  --heading-gradient-stop-2: rgba(212,209,218,0.875);
  --heading-gradient-stop-3: rgba(169,163,180,0.75);
  --heading-gradient-stop-4: rgba(125,117,143,0.625);
  --heading-gradient-stop-5: rgba(82,71,105,0.5);
  /* ...and same shape for landscape, benefits-italic, footer gradients */
}
```

Refactored consumer pattern (Hero h1 example):

```tsx
<span className="text-h1-mobile sm:text-h1-tablet lg:text-h1-desktop heading-gradient font-[var(--font-weight-h1)] leading-[var(--leading-heading)] tracking-[var(--tracking-heading)]">
```

The existing `.heading-gradient` class in `globals.css` is rewritten to reference the stop variables instead of hardcoded `rgba(...)` values.

Verification gate: landing page renders pixel-identically before/after refactor. Visual smoke test (manual, plus a screenshot diff if Playwright is set up).

### Phase 2 — Design system page

#### Route

`app/design-system/page.tsx` — full-screen client component.

#### Layout

- Two-column flex, full viewport height
- Left: ~360px sticky panel with `overflow-y: auto`. Contains collapsible groups: Colors, Typography, Gradients. Each group has labeled inputs (color pickers, number inputs with optional sliders). Bottom of panel: change counter, Reset button, Copy button
- Right: scrolling preview area, fills remaining width. Padded, dark bg (matches site)

#### Preview content (top to bottom)

1. **Token grid**
   - Color swatches: 4×3 grid with name + hex below each
   - Type scale: each heading rendered at all three breakpoint sizes side-by-side, labeled
   - Gradient samples: heading-gradient, landscape-heading-gradient, benefits-italic-gradient, footer-heading-gradient, each shown as sample text
2. **Real component excerpts**
   - Hero block: heading + serif italic accent + description + Primary button + Secondary button
   - Eyebrow badge
   - Benefits card (one representative)
   - Platform card with feature pills accordion (one card)
   - Signup heading + button
   - Footer heading

#### Tweak mechanism

A single React state object keyed by token name holds all current tweaks (only diverging-from-baseline tokens are kept). The right-side preview is wrapped in:

```tsx
<div style={{ ...overrides } as CSSProperties}>
  {/* token grid + components */}
</div>
```

Where each entry is `'--text-h1-desktop': '72px'` etc. Tailwind utilities like `.text-h1-desktop` resolve to `font-size: var(--text-h1-desktop)`, so overriding the variable on a parent cascades through and changes every consumer inside the wrapper. The actual landing page is unaffected.

#### Baseline + persistence

- `BASELINE_TOKENS` constant in `app/lib/design-system-tokens.ts` mirrors current values in `globals.css`. Used as the starting state and for diff detection
- `localStorage` key `design-system-tweaks` stores the current in-progress diffs (only changed values, JSON object)
- On mount: hydrate state from localStorage if present, else baseline
- On change: debounced (200ms) write to localStorage
- Reset button: clear localStorage, reset state to baseline

#### Output

A "Copy `@theme` block" button at the bottom of the controls panel:

1. Builds a string: `@theme {\n  --token: value;\n  ...\n}` from current state values (all tokens, not just diffs — so the copied block is a drop-in replacement)
2. Calls `navigator.clipboard.writeText(block)`
3. Toast confirmation
4. Adjacent counter shows `N tokens changed` (count of state entries that differ from baseline)

## Data flow

1. Mount: state hydrates from localStorage or `BASELINE_TOKENS`
2. User adjusts an input → state updates → `<div>` overrides update → preview rerenders with new var values via cascade. Debounced write to localStorage
3. User clicks Copy → assembles full `@theme` block string → clipboard
4. User pastes into `globals.css` → hot reload → site reflects new values
5. Next time the page loads, baseline is still the old constant, but localStorage diffs make tweaks survive. After committing the new globals.css, update `BASELINE_TOKENS` to match (manual step, or the page can re-derive baseline from a build-time snapshot — defer)

## Key decisions / why

- **CSS variable cascade over file-write**: zero infrastructure, no API routes, can't corrupt source. The wrapper-override pattern works because Tailwind v4 utilities reference variables directly
- **Three vars per breakpoint**: `@theme` doesn't support media-query-aware variables. Three vars + standard responsive prefixes (`sm:`, `lg:`) is the simplest pattern
- **localStorage for persistence**: single-user tool, no auth, no backend
- **Diff-only state, full block output**: state stays small; output is a complete `@theme` block so paste-replace is one operation
- **Tokenize only what we want to tweak**: spacing/padding/component sizes stay inline. Add tokens later if a value becomes worth tweaking centrally

## Implementation phases

1. **Refactor**: extend `@theme`, rewrite gradient classes to reference variables, update Hero/Landscape/CogniateStory/Benefits/Platform/Signup/Footer to use new utilities. Verify landing page unchanged
2. **Page skeleton**: `/design-system` route, two-column layout, baseline tokens constant
3. **Controls panel**: collapsible groups, inputs wired to state
4. **Preview area**: token grid, then real component excerpts
5. **Wrapper override**: state → CSS variables → cascade to preview
6. **Persistence**: localStorage hydrate/write/reset
7. **Copy + counter**: assemble `@theme` block, clipboard write, change count

## Open questions

- After committing tweaked values to `globals.css`, baseline diverges from `BASELINE_TOKENS`. Manual update vs. build-time codegen — defer until friction is real
- Production gating (env var, auth, robots) — decide closer to launch
