# Design System Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a `/design-system` route where Danny can tweak typography, color, and gradient tokens visually and copy the updated `@theme` block back to `globals.css`.

**Architecture:** Two phases. (1) Tokenize the typography/gradient stops we want to tweak — extend the existing Tailwind v4 `@theme` block in `app/globals.css` and refactor consuming components to use the auto-generated utility classes. (2) Build a client-only React page with a sticky controls panel on the left and a scrolling preview on the right. Live updates work via CSS variable overrides on a wrapper element — Tailwind v4 utilities reference variables, so changing them on a parent cascades through to children. State persists in localStorage; output is a generated `@theme { ... }` string copied to clipboard.

**Tech Stack:** Next.js 16 App Router (with Turbopack), React 19, Tailwind CSS v4, TypeScript, Playwright (visual snapshots).

**Working directory:** All work happens in the worktree at `/Users/Danny/CodeProjects/cogniate-website/.worktrees/design-system-page` on branch `feat/design-system-page`. All paths below are relative to this worktree root.

**Reference design doc:** `docs/plans/2026-04-28-design-system-page-design.md`.

---

## Phase 1 — Tokenize

The refactor's correctness is verified by Playwright visual snapshots. Visual identity before/after the refactor is the test.

### Task 1: Capture baseline visual snapshots

**Files:**
- Create: `tests/visual/landing-baseline.spec.ts`

**Step 1: Write the snapshot test**

```ts
// tests/visual/landing-baseline.spec.ts
import { test, expect } from "@playwright/test";

const breakpoints = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

for (const bp of breakpoints) {
  test(`landing page baseline — ${bp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: bp.width, height: bp.height });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot(`landing-${bp.name}.png`, {
      fullPage: true,
      animations: "disabled",
    });
  });
}
```

**Step 2: Generate baselines**

Run: `pnpm exec playwright test tests/visual/landing-baseline.spec.ts --update-snapshots`
Expected: Three new `.png` files written under `tests/visual/landing-baseline.spec.ts-snapshots/`. All tests pass on this run (snapshots match what was just written).

**Step 3: Verify tests pass on a clean re-run**

Run: `pnpm exec playwright test tests/visual/landing-baseline.spec.ts`
Expected: 3 passed.

**Step 4: Commit**

```bash
git add tests/visual/landing-baseline.spec.ts tests/visual/landing-baseline.spec.ts-snapshots/
git commit -m "test: capture landing page visual baseline before tokenize refactor"
```

---

### Task 2: Add typography + gradient stop tokens to `@theme`

**Files:**
- Modify: `app/globals.css`

**Step 1: Add new tokens inside the `@theme` block**

Open `app/globals.css`. Find the existing `@theme { ... }` block and append these new tokens immediately before the closing `}`:

```css
  /* Typography sizes — three breakpoints */
  --text-h1-mobile: 32px;
  --text-h1-tablet: 52px;
  --text-h1-desktop: 80px;
  --text-h1-italic-mobile: 40px;
  --text-h1-italic-tablet: 64px;
  --text-h1-italic-desktop: 100px;
  --text-h2-mobile: 32px;
  --text-h2-tablet: 48px;
  --text-h2-desktop: 64px;

  /* Body */
  --text-body: 18px;
  --text-body-lg: 24px;

  /* Heading meta */
  --font-weight-h1: 600;
  --font-weight-h2: 600;
  --leading-h1: 1.1;
  --leading-h2: 1.1;
  --tracking-h1: -0.04em;
  --tracking-h2: -0.04em;

  /* Heading gradient stops — radial ellipse 100% 120% at 50% 50% */
  --heading-gradient-stop-1: rgba(255, 255, 255, 1);
  --heading-gradient-stop-2: rgba(212, 209, 218, 0.875);
  --heading-gradient-stop-3: rgba(169, 163, 180, 0.75);
  --heading-gradient-stop-4: rgba(125, 117, 143, 0.625);
  --heading-gradient-stop-5: rgba(82, 71, 105, 0.5);

  /* Landscape heading gradient stops — radial ellipse 100% 500% at 50% 50% */
  --landscape-gradient-stop-1: rgba(255, 255, 255, 1);
  --landscape-gradient-stop-2: rgba(212, 209, 218, 0.75);
  --landscape-gradient-stop-3: rgba(169, 163, 180, 0.5);
  --landscape-gradient-stop-4: rgba(82, 71, 105, 0);

  /* Benefits italic gradient stops — radial ellipse 100% 100% at 50% 50% */
  --benefits-italic-gradient-stop-1: rgba(255, 255, 255, 0.8);
  --benefits-italic-gradient-stop-2: rgba(220, 200, 245, 0.8);
  --benefits-italic-gradient-stop-3: rgba(184, 145, 234, 0.8);

  /* Footer heading gradient stops — radial ellipse 100% 120% at 50% 50% */
  --footer-gradient-stop-1: rgba(255, 255, 255, 1);
  --footer-gradient-stop-2: rgba(212, 209, 218, 0.75);
  --footer-gradient-stop-3: rgba(169, 163, 180, 0.5);
  --footer-gradient-stop-4: rgba(82, 71, 105, 0);
```

**Step 2: Verify build still passes**

Run: `pnpm build`
Expected: `✓ Compiled successfully`. No type or CSS errors.

**Step 3: Commit (no consumer changes yet, just adding tokens)**

```bash
git add app/globals.css
git commit -m "feat: add typography and gradient-stop tokens to theme"
```

---

### Task 3: Rewrite gradient classes to reference stop tokens

**Files:**
- Modify: `app/globals.css`

**Step 1: Replace hardcoded `rgba(...)` stops with `var(...)` references**

In `app/globals.css`, update all four gradient classes:

```css
.heading-gradient {
  background: radial-gradient(
    ellipse 100% 120% at 50% 50%,
    var(--heading-gradient-stop-1) 0%,
    var(--heading-gradient-stop-2) 25%,
    var(--heading-gradient-stop-3) 50%,
    var(--heading-gradient-stop-4) 75%,
    var(--heading-gradient-stop-5) 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.landscape-heading-gradient {
  background: radial-gradient(
    ellipse 100% 500% at 50% 50%,
    var(--landscape-gradient-stop-1) 0%,
    var(--landscape-gradient-stop-2) 25%,
    var(--landscape-gradient-stop-3) 50%,
    var(--landscape-gradient-stop-4) 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.benefits-italic-gradient {
  background: radial-gradient(
    ellipse 100% 100% at 50% 50%,
    var(--benefits-italic-gradient-stop-1) 0%,
    var(--benefits-italic-gradient-stop-2) 50%,
    var(--benefits-italic-gradient-stop-3) 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.footer-heading-gradient {
  background: radial-gradient(
    ellipse 100% 120% at 50% 50%,
    var(--footer-gradient-stop-1) 0%,
    var(--footer-gradient-stop-2) 25%,
    var(--footer-gradient-stop-3) 50%,
    var(--footer-gradient-stop-4) 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

**Step 2: Run snapshot tests — they should still pass (visual identity preserved)**

Run: `pnpm exec playwright test tests/visual/landing-baseline.spec.ts`
Expected: 3 passed. (If any fails, the gradient values diverge from what was previously rendered.)

**Step 3: Commit**

```bash
git add app/globals.css
git commit -m "refactor: parameterize gradient classes via stop tokens"
```

---

### Task 4: Refactor Hero to use h1 utilities

**Files:**
- Modify: `app/sections/Hero.tsx`

**Step 1: Replace inline arbitrary heading sizes with new utilities**

Find the h1 block in `app/sections/Hero.tsx` (around lines 89–99). Replace:

```tsx
<h1 className="mt-8 md:mt-[42px] text-center px-2 sm:px-0">
  <span className="heading-gradient block text-[32px] sm:text-[52px] lg:text-[80px] font-semibold leading-[1.1] tracking-[-0.04em]">
    The future of{" "}
    <span className="font-serif italic font-normal text-[40px] sm:text-[64px] lg:text-[100px] tracking-[-0.04em]">
      learning,
    </span>
  </span>
  <span className="heading-gradient block text-[32px] sm:text-[52px] lg:text-[80px] font-semibold leading-[1.1] tracking-[-0.04em]">
    authored in minutes.
  </span>
</h1>
```

With:

```tsx
<h1 className="mt-8 md:mt-[42px] text-center px-2 sm:px-0">
  <span className="heading-gradient block text-h1-mobile sm:text-h1-tablet lg:text-h1-desktop font-[var(--font-weight-h1)] leading-[var(--leading-h1)] tracking-[var(--tracking-h1)]">
    The future of{" "}
    <span className="font-serif italic font-normal text-h1-italic-mobile sm:text-h1-italic-tablet lg:text-h1-italic-desktop tracking-[var(--tracking-h1)]">
      learning,
    </span>
  </span>
  <span className="heading-gradient block text-h1-mobile sm:text-h1-tablet lg:text-h1-desktop font-[var(--font-weight-h1)] leading-[var(--leading-h1)] tracking-[var(--tracking-h1)]">
    authored in minutes.
  </span>
</h1>
```

**Step 2: Run snapshot tests**

Run: `pnpm exec playwright test tests/visual/landing-baseline.spec.ts`
Expected: 3 passed.

**Step 3: Commit**

```bash
git add app/sections/Hero.tsx
git commit -m "refactor: Hero h1 uses tokenized heading utilities"
```

---

### Task 5: Refactor Landscape h2 to use h2 utilities

**Files:**
- Modify: `app/sections/Landscape.tsx`

**Step 1: Replace inline arbitrary heading sizes**

Find the h2 in `app/sections/Landscape.tsx` (around line 11). Replace:

```tsx
<h2 className="landscape-heading-gradient text-center text-[32px] sm:text-[48px] lg:text-[64px] font-semibold leading-[1.1] tracking-[-0.04em]">
  Imagine being 150x faster.
</h2>
```

With:

```tsx
<h2 className="landscape-heading-gradient text-center text-h2-mobile sm:text-h2-tablet lg:text-h2-desktop font-[var(--font-weight-h2)] leading-[var(--leading-h2)] tracking-[var(--tracking-h2)]">
  Imagine being 150x faster.
</h2>
```

Leave the stat numbers alone — they stay inline (one-off sizes).

**Step 2: Run snapshot tests**

Run: `pnpm exec playwright test tests/visual/landing-baseline.spec.ts`
Expected: 3 passed.

**Step 3: Commit**

```bash
git add app/sections/Landscape.tsx
git commit -m "refactor: Landscape h2 uses tokenized heading utilities"
```

---

### Task 6: Refactor CogniateStory h2 to use h2 utilities

**Files:**
- Modify: `app/sections/CogniateStory.tsx`

**Step 1: Replace inline arbitrary heading sizes**

Find the h2 in `app/sections/CogniateStory.tsx` (around line 122). Replace:

```tsx
<h2
  ref={headingRef}
  className="landscape-heading-gradient text-center text-[32px] sm:text-[48px] lg:text-[64px] font-semibold leading-[1.1] tracking-[-0.04em]"
>
```

With:

```tsx
<h2
  ref={headingRef}
  className="landscape-heading-gradient text-center text-h2-mobile sm:text-h2-tablet lg:text-h2-desktop font-[var(--font-weight-h2)] leading-[var(--leading-h2)] tracking-[var(--tracking-h2)]"
>
```

**Step 2: Run snapshot tests**

Run: `pnpm exec playwright test tests/visual/landing-baseline.spec.ts`
Expected: 3 passed.

**Step 3: Commit**

```bash
git add app/sections/CogniateStory.tsx
git commit -m "refactor: CogniateStory h2 uses tokenized heading utilities"
```

---

### Task 7: Refactor Benefits h2 to use h2 utilities

**Files:**
- Modify: `app/sections/Benefits.tsx`

**Step 1: Replace inline arbitrary heading sizes**

Find the h2 in `app/sections/Benefits.tsx` (around line 60). Replace:

```tsx
<h2 className="heading-gradient text-center text-[32px] md:text-[48px] lg:text-[64px] font-semibold leading-[1.3] tracking-[-0.04em] max-w-[1306px]">
```

With:

```tsx
<h2 className="heading-gradient text-center text-h2-mobile md:text-h2-tablet lg:text-h2-desktop font-[var(--font-weight-h2)] leading-[1.3] tracking-[var(--tracking-h2)] max-w-[1306px]">
```

**Note:** Benefits intentionally uses `leading-[1.3]` instead of `var(--leading-h2)` (which is 1.1). Preserve this — Benefits's h2 has different line-height by design. Don't try to unify.

**Step 2: Run snapshot tests**

Run: `pnpm exec playwright test tests/visual/landing-baseline.spec.ts`
Expected: 3 passed.

**Step 3: Commit**

```bash
git add app/sections/Benefits.tsx
git commit -m "refactor: Benefits h2 uses tokenized heading utilities"
```

---

### Task 8: Final visual + build verification of Phase 1

**Step 1: Run full snapshot suite**

Run: `pnpm exec playwright test tests/visual/landing-baseline.spec.ts`
Expected: 3 passed.

**Step 2: Run lint and build**

Run: `pnpm lint && pnpm build`
Expected: lint clean, `✓ Compiled successfully`.

**Step 3: Manual sanity check in dev**

Run: `pnpm dev` (background). Open `http://localhost:3000`. Spot-check Hero, Landscape, CogniateStory, Benefits in browser at 1440px width. Compare to memory of previous look — should be identical. Stop dev server.

**Step 4: No commit** — Phase 1 complete.

---

## Phase 2 — Design system page

### Task 9: Create token baseline + types library

**Files:**
- Create: `app/lib/design-system/baseline-tokens.ts`
- Create: `app/lib/design-system/types.ts`

**Step 1: Write the types module**

```ts
// app/lib/design-system/types.ts
export type TokenGroup = "colors" | "typography" | "gradients";

export type TokenDef = {
  name: string;
  cssVar: string;
  group: TokenGroup;
  baseline: string;
  kind: "color" | "size" | "weight" | "number" | "tracking";
};

export type TokenState = Record<string, string>;
```

**Step 2: Write the baseline constant**

```ts
// app/lib/design-system/baseline-tokens.ts
import type { TokenDef } from "./types";

export const BASELINE_TOKENS: TokenDef[] = [
  // Colors
  { name: "Background — primary", cssVar: "--color-bg-primary", group: "colors", baseline: "#070707", kind: "color" },
  { name: "Background — secondary", cssVar: "--color-bg-secondary", group: "colors", baseline: "#101011", kind: "color" },
  { name: "Background — card", cssVar: "--color-bg-card", group: "colors", baseline: "#131315", kind: "color" },
  { name: "Text — primary", cssVar: "--color-text-primary", group: "colors", baseline: "#ffffff", kind: "color" },
  { name: "Text — secondary", cssVar: "--color-text-secondary", group: "colors", baseline: "rgba(242, 234, 255, 0.8)", kind: "color" },
  { name: "Text — muted", cssVar: "--color-text-muted", group: "colors", baseline: "rgba(255, 255, 255, 0.8)", kind: "color" },
  { name: "Accent — purple", cssVar: "--color-accent-purple", group: "colors", baseline: "#B78BF9", kind: "color" },
  { name: "Accent — purple light", cssVar: "--color-accent-purple-light", group: "colors", baseline: "#d4a9ff", kind: "color" },
  { name: "Accent — coral", cssVar: "--color-accent-coral", group: "colors", baseline: "#fa677c", kind: "color" },
  { name: "Accent — border", cssVar: "--color-accent-border", group: "colors", baseline: "#aeb4ff", kind: "color" },
  { name: "Accent — gold", cssVar: "--color-accent-gold", group: "colors", baseline: "#FCE89E", kind: "color" },

  // Typography sizes
  { name: "h1 — mobile", cssVar: "--text-h1-mobile", group: "typography", baseline: "32px", kind: "size" },
  { name: "h1 — tablet", cssVar: "--text-h1-tablet", group: "typography", baseline: "52px", kind: "size" },
  { name: "h1 — desktop", cssVar: "--text-h1-desktop", group: "typography", baseline: "80px", kind: "size" },
  { name: "h1 italic — mobile", cssVar: "--text-h1-italic-mobile", group: "typography", baseline: "40px", kind: "size" },
  { name: "h1 italic — tablet", cssVar: "--text-h1-italic-tablet", group: "typography", baseline: "64px", kind: "size" },
  { name: "h1 italic — desktop", cssVar: "--text-h1-italic-desktop", group: "typography", baseline: "100px", kind: "size" },
  { name: "h2 — mobile", cssVar: "--text-h2-mobile", group: "typography", baseline: "32px", kind: "size" },
  { name: "h2 — tablet", cssVar: "--text-h2-tablet", group: "typography", baseline: "48px", kind: "size" },
  { name: "h2 — desktop", cssVar: "--text-h2-desktop", group: "typography", baseline: "64px", kind: "size" },
  { name: "Body", cssVar: "--text-body", group: "typography", baseline: "18px", kind: "size" },
  { name: "Body — large", cssVar: "--text-body-lg", group: "typography", baseline: "24px", kind: "size" },

  // Typography meta
  { name: "h1 weight", cssVar: "--font-weight-h1", group: "typography", baseline: "600", kind: "weight" },
  { name: "h2 weight", cssVar: "--font-weight-h2", group: "typography", baseline: "600", kind: "weight" },
  { name: "h1 line-height", cssVar: "--leading-h1", group: "typography", baseline: "1.1", kind: "number" },
  { name: "h2 line-height", cssVar: "--leading-h2", group: "typography", baseline: "1.1", kind: "number" },
  { name: "h1 tracking", cssVar: "--tracking-h1", group: "typography", baseline: "-0.04em", kind: "tracking" },
  { name: "h2 tracking", cssVar: "--tracking-h2", group: "typography", baseline: "-0.04em", kind: "tracking" },

  // Gradient stops — heading
  { name: "Heading gradient stop 1", cssVar: "--heading-gradient-stop-1", group: "gradients", baseline: "rgba(255, 255, 255, 1)", kind: "color" },
  { name: "Heading gradient stop 2", cssVar: "--heading-gradient-stop-2", group: "gradients", baseline: "rgba(212, 209, 218, 0.875)", kind: "color" },
  { name: "Heading gradient stop 3", cssVar: "--heading-gradient-stop-3", group: "gradients", baseline: "rgba(169, 163, 180, 0.75)", kind: "color" },
  { name: "Heading gradient stop 4", cssVar: "--heading-gradient-stop-4", group: "gradients", baseline: "rgba(125, 117, 143, 0.625)", kind: "color" },
  { name: "Heading gradient stop 5", cssVar: "--heading-gradient-stop-5", group: "gradients", baseline: "rgba(82, 71, 105, 0.5)", kind: "color" },
  // Gradient stops — landscape
  { name: "Landscape gradient stop 1", cssVar: "--landscape-gradient-stop-1", group: "gradients", baseline: "rgba(255, 255, 255, 1)", kind: "color" },
  { name: "Landscape gradient stop 2", cssVar: "--landscape-gradient-stop-2", group: "gradients", baseline: "rgba(212, 209, 218, 0.75)", kind: "color" },
  { name: "Landscape gradient stop 3", cssVar: "--landscape-gradient-stop-3", group: "gradients", baseline: "rgba(169, 163, 180, 0.5)", kind: "color" },
  { name: "Landscape gradient stop 4", cssVar: "--landscape-gradient-stop-4", group: "gradients", baseline: "rgba(82, 71, 105, 0)", kind: "color" },
  // Gradient stops — benefits italic
  { name: "Benefits italic stop 1", cssVar: "--benefits-italic-gradient-stop-1", group: "gradients", baseline: "rgba(255, 255, 255, 0.8)", kind: "color" },
  { name: "Benefits italic stop 2", cssVar: "--benefits-italic-gradient-stop-2", group: "gradients", baseline: "rgba(220, 200, 245, 0.8)", kind: "color" },
  { name: "Benefits italic stop 3", cssVar: "--benefits-italic-gradient-stop-3", group: "gradients", baseline: "rgba(184, 145, 234, 0.8)", kind: "color" },
  // Gradient stops — footer
  { name: "Footer gradient stop 1", cssVar: "--footer-gradient-stop-1", group: "gradients", baseline: "rgba(255, 255, 255, 1)", kind: "color" },
  { name: "Footer gradient stop 2", cssVar: "--footer-gradient-stop-2", group: "gradients", baseline: "rgba(212, 209, 218, 0.75)", kind: "color" },
  { name: "Footer gradient stop 3", cssVar: "--footer-gradient-stop-3", group: "gradients", baseline: "rgba(169, 163, 180, 0.5)", kind: "color" },
  { name: "Footer gradient stop 4", cssVar: "--footer-gradient-stop-4", group: "gradients", baseline: "rgba(82, 71, 105, 0)", kind: "color" },
];

export function baselineState() {
  return Object.fromEntries(BASELINE_TOKENS.map((t) => [t.cssVar, t.baseline]));
}
```

**Step 2: Verify build**

Run: `pnpm build`
Expected: `✓ Compiled successfully`.

**Step 3: Commit**

```bash
git add app/lib/design-system/
git commit -m "feat: add design system token baseline + types"
```

---

### Task 10: Add `assembleThemeBlock` + `countChanged` utilities

The project uses Playwright but not vitest. Rather than introduce a new test runner for two pure functions, write the helpers and verify them via the Playwright integration test in Task 20. Functions are small and pure — defects are easy to spot.

**Files:**
- Create: `app/lib/design-system/output.ts`

**Step 1: Implement**

```ts
// app/lib/design-system/output.ts
import { BASELINE_TOKENS } from "./baseline-tokens";
import type { TokenState } from "./types";

export function assembleThemeBlock(state: TokenState): string {
  const lines = BASELINE_TOKENS.map((t) => `  ${t.cssVar}: ${state[t.cssVar] ?? t.baseline};`);
  return `@theme {\n${lines.join("\n")}\n}\n`;
}

export function countChanged(state: TokenState): number {
  return BASELINE_TOKENS.reduce(
    (n, t) => (state[t.cssVar] !== undefined && state[t.cssVar] !== t.baseline ? n + 1 : n),
    0,
  );
}
```

**Step 2: Verify build**

Run: `pnpm build`
Expected: `✓ Compiled successfully`.

**Step 3: Commit**

```bash
git add app/lib/design-system/output.ts
git commit -m "feat: add theme block assembly and change count utilities"
```

---

### Task 11: Page route shell + split layout

**Files:**
- Create: `app/design-system/page.tsx`
- Create: `app/design-system/DesignSystemClient.tsx`

**Step 1: Add the route entry (server component, just renders the client)**

```tsx
// app/design-system/page.tsx
import DesignSystemClient from "./DesignSystemClient";

export default function DesignSystemPage() {
  return <DesignSystemClient />;
}
```

**Step 2: Add the client shell with split layout**

```tsx
// app/design-system/DesignSystemClient.tsx
"use client";

import { useState, useEffect, type CSSProperties } from "react";
import { baselineState } from "../lib/design-system/baseline-tokens";
import type { TokenState } from "../lib/design-system/types";

export default function DesignSystemClient() {
  const [state, setState] = useState<TokenState>(() => baselineState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);
  if (!hydrated) return null;

  const overrides = state as unknown as CSSProperties;

  return (
    <div className="flex min-h-screen bg-bg-primary text-text-primary">
      <aside className="w-[360px] shrink-0 border-r border-white/10 sticky top-0 h-screen overflow-y-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Design System</h1>
        <p className="text-sm text-text-secondary">Controls go here.</p>
      </aside>
      <main className="flex-1 overflow-y-auto p-10" style={overrides}>
        <p className="text-sm text-text-secondary">Preview goes here.</p>
      </main>
    </div>
  );
}
```

**Step 3: Verify route works**

Run: `pnpm dev` (background). Visit `http://localhost:3000/design-system`. Should see split layout with placeholder text. Stop dev server.

**Step 4: Commit**

```bash
git add app/design-system/
git commit -m "feat: scaffold design system page route and split layout"
```

---

### Task 12: Build collapsible group component

**Files:**
- Create: `app/design-system/ControlGroup.tsx`

**Step 1: Write a small reusable disclosure**

```tsx
// app/design-system/ControlGroup.tsx
"use client";

import { useState, type ReactNode } from "react";

export default function ControlGroup({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-b border-white/10 py-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left text-sm font-semibold uppercase tracking-wide text-text-secondary"
      >
        <span>{title}</span>
        <span className="text-xs">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="mt-3 flex flex-col gap-3">{children}</div>}
    </section>
  );
}
```

**Step 2: Use it in the controls panel**

In `DesignSystemClient.tsx`, replace the placeholder controls with three empty groups:

```tsx
import ControlGroup from "./ControlGroup";

// inside <aside>:
<ControlGroup title="Colors">
  <p className="text-xs text-text-secondary">Color inputs coming next</p>
</ControlGroup>
<ControlGroup title="Typography">
  <p className="text-xs text-text-secondary">Typography inputs coming next</p>
</ControlGroup>
<ControlGroup title="Gradients">
  <p className="text-xs text-text-secondary">Gradient inputs coming next</p>
</ControlGroup>
```

**Step 3: Verify dev server**

Run: `pnpm dev`. Visit `/design-system`. Click each group header to confirm collapse/expand works. Stop dev server.

**Step 4: Commit**

```bash
git add app/design-system/
git commit -m "feat: add collapsible control group and wire empty groups"
```

---

### Task 13: Wire token inputs (one input per token)

**Files:**
- Create: `app/design-system/TokenInput.tsx`
- Modify: `app/design-system/DesignSystemClient.tsx`

**Step 1: Build a small dispatcher input**

```tsx
// app/design-system/TokenInput.tsx
"use client";

import type { TokenDef } from "../lib/design-system/types";

export default function TokenInput({
  def,
  value,
  onChange,
}: {
  def: TokenDef;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="text-text-secondary">{def.name}</span>
      <div className="flex gap-2 items-center">
        {def.kind === "color" && def.baseline.startsWith("#") && (
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-8 h-8 rounded bg-transparent border border-white/10"
          />
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-bg-card border border-white/10 rounded px-2 py-1 text-text-primary"
        />
      </div>
    </label>
  );
}
```

For `rgba(...)` color values, the text input is the only edit surface (the native color picker only handles hex). That's a reasonable v1 — if Danny needs to tweak alpha visually we can add a richer picker later.

**Step 2: Group + render tokens by group in `DesignSystemClient.tsx`**

```tsx
import { BASELINE_TOKENS } from "../lib/design-system/baseline-tokens";
import TokenInput from "./TokenInput";
import type { TokenGroup } from "../lib/design-system/types";

const GROUPS: { id: TokenGroup; title: string }[] = [
  { id: "colors", title: "Colors" },
  { id: "typography", title: "Typography" },
  { id: "gradients", title: "Gradients" },
];

// inside the component, replace the empty ControlGroups:
{GROUPS.map((g) => (
  <ControlGroup key={g.id} title={g.title}>
    {BASELINE_TOKENS.filter((t) => t.group === g.id).map((t) => (
      <TokenInput
        key={t.cssVar}
        def={t}
        value={state[t.cssVar] ?? t.baseline}
        onChange={(v) => setState((s) => ({ ...s, [t.cssVar]: v }))}
      />
    ))}
  </ControlGroup>
))}
```

**Step 3: Manual verification**

Run: `pnpm dev`. Visit `/design-system`. Each group should render its inputs. Typing in `--color-bg-primary` text field should update component state (no visual effect on preview yet — wiring comes in Task 16). Stop dev server.

**Step 4: Commit**

```bash
git add app/design-system/
git commit -m "feat: render token inputs grouped by category"
```

---

### Task 14: Token grid in preview (colors)

**Files:**
- Create: `app/design-system/preview/ColorGrid.tsx`
- Modify: `app/design-system/DesignSystemClient.tsx`

**Step 1: Add ColorGrid**

```tsx
// app/design-system/preview/ColorGrid.tsx
import { BASELINE_TOKENS } from "../../lib/design-system/baseline-tokens";

export default function ColorGrid() {
  const colors = BASELINE_TOKENS.filter((t) => t.group === "colors");
  return (
    <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {colors.map((t) => (
        <div key={t.cssVar} className="rounded-lg border border-white/10 overflow-hidden">
          <div className="h-20" style={{ backgroundColor: `var(${t.cssVar})` }} />
          <div className="p-3 text-xs">
            <div className="text-text-primary">{t.name}</div>
            <div className="text-text-secondary font-mono mt-1">{t.cssVar}</div>
          </div>
        </div>
      ))}
    </section>
  );
}
```

**Step 2: Render it in the preview area**

```tsx
// inside <main> in DesignSystemClient.tsx:
import ColorGrid from "./preview/ColorGrid";

<section className="space-y-10">
  <div>
    <h2 className="text-h2-mobile lg:text-h2-desktop font-[var(--font-weight-h2)] mb-6">Colors</h2>
    <ColorGrid />
  </div>
</section>
```

**Step 3: Manual verification**

Run: `pnpm dev`. Visit `/design-system`. Should see all colors as swatches. Stop dev server.

**Step 4: Commit**

```bash
git add app/design-system/
git commit -m "feat: color swatch grid in preview"
```

---

### Task 15: Token grid in preview (typography + gradients)

**Files:**
- Create: `app/design-system/preview/TypeScale.tsx`
- Create: `app/design-system/preview/GradientSamples.tsx`
- Modify: `app/design-system/DesignSystemClient.tsx`

**Step 1: TypeScale**

```tsx
// app/design-system/preview/TypeScale.tsx
const ROWS: { label: string; classes: string }[] = [
  { label: "h1", classes: "text-h1-mobile sm:text-h1-tablet lg:text-h1-desktop font-[var(--font-weight-h1)] leading-[var(--leading-h1)] tracking-[var(--tracking-h1)]" },
  { label: "h1 italic", classes: "font-serif italic text-h1-italic-mobile sm:text-h1-italic-tablet lg:text-h1-italic-desktop tracking-[var(--tracking-h1)]" },
  { label: "h2", classes: "text-h2-mobile sm:text-h2-tablet lg:text-h2-desktop font-[var(--font-weight-h2)] leading-[var(--leading-h2)] tracking-[var(--tracking-h2)]" },
  { label: "Body", classes: "text-body" },
  { label: "Body — large", classes: "text-body-lg" },
];

export default function TypeScale() {
  return (
    <div className="space-y-6">
      {ROWS.map((row) => (
        <div key={row.label} className="border-l-2 border-white/10 pl-4">
          <div className="text-xs text-text-secondary mb-1">{row.label}</div>
          <div className={row.classes}>The future of learning, authored in minutes.</div>
        </div>
      ))}
    </div>
  );
}
```

**Step 2: GradientSamples**

```tsx
// app/design-system/preview/GradientSamples.tsx
const SAMPLES: { name: string; cls: string }[] = [
  { name: "heading-gradient", cls: "heading-gradient" },
  { name: "landscape-heading-gradient", cls: "landscape-heading-gradient" },
  { name: "benefits-italic-gradient", cls: "benefits-italic-gradient" },
  { name: "footer-heading-gradient", cls: "footer-heading-gradient" },
];

export default function GradientSamples() {
  return (
    <div className="space-y-4">
      {SAMPLES.map((s) => (
        <div key={s.name} className="border-l-2 border-white/10 pl-4">
          <div className="text-xs text-text-secondary mb-1">.{s.name}</div>
          <div className={`${s.cls} text-h2-tablet font-[var(--font-weight-h2)] leading-[var(--leading-h2)] tracking-[var(--tracking-h2)]`}>
            The future of learning.
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Step 3: Render them**

In `DesignSystemClient.tsx`, append to the preview section:

```tsx
<div>
  <h2 className="text-h2-mobile lg:text-h2-desktop font-[var(--font-weight-h2)] mb-6">Typography</h2>
  <TypeScale />
</div>
<div>
  <h2 className="text-h2-mobile lg:text-h2-desktop font-[var(--font-weight-h2)] mb-6">Gradients</h2>
  <GradientSamples />
</div>
```

**Step 4: Manual verification**

Run: `pnpm dev`. Visit `/design-system`. Should see type scale samples and gradient samples. Stop dev server.

**Step 5: Commit**

```bash
git add app/design-system/
git commit -m "feat: type scale and gradient samples in preview"
```

---

### Task 16: Wire CSS variable cascade so inputs change preview

**Files:**
- Modify: `app/design-system/DesignSystemClient.tsx`

**Step 1: The wiring is already in place (line 19: `style={overrides}` on `<main>`). Verify it works end-to-end.**

Run: `pnpm dev`. Visit `/design-system`.

- Change `--color-bg-primary` value (use the color picker for one of the hex tokens, or paste a new hex into the text input). The page background of `<main>` should update because the swatch reads `var(--color-bg-primary)`.
- Change `--text-h1-desktop` text input from `80px` to `60px`. The h1 row in TypeScale should shrink (note: at viewport ≥1024px since the class `lg:text-h1-desktop` only applies at lg).

Stop dev server.

**Step 2: No code change needed if it works. If not, audit the wrapper inline-style + the consumer classes.**

**Step 3: Commit (only if any tweaks were made — otherwise no commit)**

If you needed to tweak something, commit with a descriptive message. Otherwise skip.

---

### Task 17: Component excerpts in preview

**Files:**
- Create: `app/design-system/preview/ComponentExcerpts.tsx`
- Modify: `app/design-system/DesignSystemClient.tsx`

**Step 1: Build a static excerpt block reusing existing components where convenient**

```tsx
// app/design-system/preview/ComponentExcerpts.tsx
import EyebrowBadge from "../../components/EyebrowBadge";
import ButtonPrimary from "../../components/ButtonPrimary";
import ButtonSecondary from "../../components/ButtonSecondary";

export default function ComponentExcerpts() {
  return (
    <div className="space-y-12">
      {/* Hero excerpt */}
      <div className="border border-white/10 rounded-lg p-8 bg-bg-secondary">
        <EyebrowBadge>AI POWERED COURSE CREATOR</EyebrowBadge>
        <h1 className="mt-6 text-center">
          <span className="heading-gradient block text-h1-mobile sm:text-h1-tablet lg:text-h1-desktop font-[var(--font-weight-h1)] leading-[var(--leading-h1)] tracking-[var(--tracking-h1)]">
            The future of{" "}
            <span className="font-serif italic font-normal text-h1-italic-mobile sm:text-h1-italic-tablet lg:text-h1-italic-desktop tracking-[var(--tracking-h1)]">
              learning,
            </span>
          </span>
          <span className="heading-gradient block text-h1-mobile sm:text-h1-tablet lg:text-h1-desktop font-[var(--font-weight-h1)] leading-[var(--leading-h1)] tracking-[var(--tracking-h1)]">
            authored in minutes.
          </span>
        </h1>
        <div className="mt-8 flex gap-4 justify-center">
          <ButtonPrimary>Book a Demo</ButtonPrimary>
          <ButtonSecondary>Join the Community</ButtonSecondary>
        </div>
      </div>

      {/* Section h2 excerpt */}
      <div className="border border-white/10 rounded-lg p-8 bg-bg-secondary">
        <h2 className="landscape-heading-gradient text-center text-h2-mobile sm:text-h2-tablet lg:text-h2-desktop font-[var(--font-weight-h2)] leading-[var(--leading-h2)] tracking-[var(--tracking-h2)]">
          Imagine being 150x faster.
        </h2>
      </div>
    </div>
  );
}
```

(Skip Benefits card / Platform card / Signup form for v1 — too much markup. We can add later if Danny finds the existing excerpts insufficient.)

**Step 2: Render it**

```tsx
// in DesignSystemClient.tsx preview section:
<div>
  <h2 className="text-h2-mobile lg:text-h2-desktop font-[var(--font-weight-h2)] mb-6">Components</h2>
  <ComponentExcerpts />
</div>
```

**Step 3: Manual verification**

Run: `pnpm dev`. Visit `/design-system`. Tweak `--text-h1-desktop` and watch the Hero excerpt heading shrink. Stop dev server.

**Step 4: Commit**

```bash
git add app/design-system/
git commit -m "feat: component excerpts (hero, section h2) in preview"
```

---

### Task 18: localStorage persistence + Reset button

**Files:**
- Create: `app/lib/design-system/persistence.ts`
- Modify: `app/design-system/DesignSystemClient.tsx`

**Step 1: Implement**

```ts
// app/lib/design-system/persistence.ts
import { BASELINE_TOKENS, baselineState } from "./baseline-tokens";
import type { TokenState } from "./types";

const KEY = "design-system-tweaks";

export function saveTweaks(state: TokenState) {
  const baseline = Object.fromEntries(BASELINE_TOKENS.map((t) => [t.cssVar, t.baseline]));
  const diffs: TokenState = {};
  for (const [k, v] of Object.entries(state)) {
    if (baseline[k] !== v) diffs[k] = v;
  }
  localStorage.setItem(KEY, JSON.stringify(diffs));
}

export function loadTweaks(): TokenState {
  const raw = localStorage.getItem(KEY);
  if (!raw) return baselineState();
  try {
    const diffs = JSON.parse(raw) as TokenState;
    return { ...baselineState(), ...diffs };
  } catch {
    return baselineState();
  }
}

export function clearTweaks() {
  localStorage.removeItem(KEY);
}
```

**Step 2: Wire into the page**

In `DesignSystemClient.tsx`:

```tsx
import { loadTweaks, saveTweaks, clearTweaks } from "../lib/design-system/persistence";

// replace existing useState init + hydration effect with:
const [state, setState] = useState<TokenState>(() => baselineState());
const [hydrated, setHydrated] = useState(false);

useEffect(() => {
  setState(loadTweaks());
  setHydrated(true);
}, []);

useEffect(() => {
  if (!hydrated) return;
  const id = setTimeout(() => saveTweaks(state), 200);
  return () => clearTimeout(id);
}, [state, hydrated]);

const reset = () => {
  clearTweaks();
  setState(baselineState());
};
```

Add a Reset button at the bottom of the controls panel:

```tsx
<button
  type="button"
  onClick={reset}
  className="mt-6 w-full text-sm border border-white/10 rounded px-3 py-2 hover:border-white/30"
>
  Reset to baseline
</button>
```

**Step 3: Manual verification**

Run: `pnpm dev`. Tweak a couple tokens. Refresh the page — tweaks survive. Click Reset — values snap back. Stop dev server.

**Step 4: Commit**

```bash
git add app/lib/design-system/persistence.ts app/design-system/
git commit -m "feat: localStorage persistence and reset for design system tweaks"
```

---

### Task 19: Copy button + change counter

**Files:**
- Modify: `app/design-system/DesignSystemClient.tsx`

**Step 1: Wire counter and copy action**

In `DesignSystemClient.tsx`:

```tsx
import { assembleThemeBlock, countChanged } from "../lib/design-system/output";

// inside the component:
const [copied, setCopied] = useState(false);
const changed = countChanged(state);

const onCopy = async () => {
  await navigator.clipboard.writeText(assembleThemeBlock(state));
  setCopied(true);
  setTimeout(() => setCopied(false), 1500);
};
```

Add the controls just above the Reset button:

```tsx
<div className="mt-6 flex flex-col gap-2">
  <div className="text-xs text-text-secondary">{changed} of {Object.keys(state).length} tokens changed</div>
  <button
    type="button"
    onClick={onCopy}
    className="text-sm bg-accent-purple text-bg-primary rounded px-3 py-2 font-medium hover:bg-accent-purple-light"
  >
    {copied ? "Copied!" : "Copy @theme block"}
  </button>
</div>
```

**Step 2: Manual verification**

Run: `pnpm dev`. Visit `/design-system`. Tweak `--text-h1-desktop` to `72px`. Counter shows "1 of N tokens changed". Click Copy. Paste into a scratchpad — should see a complete `@theme { ... }` block with `--text-h1-desktop: 72px;`. Stop dev server.

**Step 3: Commit**

```bash
git add app/design-system/
git commit -m "feat: copy @theme block to clipboard with change counter"
```

---

### Task 20: Integration test + final verification

**Files:**
- Create: `tests/visual/design-system.spec.ts`

**Step 1: Write the integration test**

```ts
// tests/visual/design-system.spec.ts
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/design-system");
  // localStorage is per-origin; clear before each test
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("controls and preview render", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Design System" })).toBeVisible();
  await expect(page.getByText("Colors", { exact: true })).toBeVisible();
  await expect(page.getByText("Typography", { exact: true })).toBeVisible();
  await expect(page.getByText("Gradients", { exact: true })).toBeVisible();
});

test("change counter updates when token changes", async ({ page }) => {
  await expect(page.getByText(/0 of \d+ tokens changed/)).toBeVisible();
  const input = page.locator('input[type="text"]').filter({ hasText: "" }).first();
  // Find the h1 desktop input by its visible label
  const label = page.getByText("h1 — desktop").locator("..");
  const textInput = label.locator('input[type="text"]');
  await textInput.fill("72px");
  await expect(page.getByText(/1 of \d+ tokens changed/)).toBeVisible();
});

test("Reset clears tweaks", async ({ page }) => {
  const label = page.getByText("h1 — desktop").locator("..");
  await label.locator('input[type="text"]').fill("72px");
  await expect(page.getByText(/1 of \d+ tokens changed/)).toBeVisible();
  await page.getByRole("button", { name: "Reset to baseline" }).click();
  await expect(page.getByText(/0 of \d+ tokens changed/)).toBeVisible();
});

test("Copy button output contains override", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const label = page.getByText("h1 — desktop").locator("..");
  await label.locator('input[type="text"]').fill("72px");
  await page.getByRole("button", { name: /Copy @theme block/ }).click();
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toContain("@theme {");
  expect(text).toContain("--text-h1-desktop: 72px;");
  expect(text).not.toContain("--text-h1-desktop: 80px;");
});

test("tweaks persist across reload", async ({ page }) => {
  const label = page.getByText("h1 — desktop").locator("..");
  await label.locator('input[type="text"]').fill("72px");
  await page.waitForTimeout(300); // let the debounced save fire
  await page.reload();
  await expect(page.getByText(/1 of \d+ tokens changed/)).toBeVisible();
});
```

**Step 2: Run the integration test**

Run: `pnpm exec playwright test tests/visual/design-system.spec.ts`
Expected: 5 passed.

If any fail, fix the underlying issue (selectors may need tweaking based on actual rendered output).

**Step 3: Run lint**

Run: `pnpm lint`
Expected: clean.

**Step 4: Run build**

Run: `pnpm build`
Expected: `✓ Compiled successfully`. Two routes listed: `/` and `/design-system`.

**Step 5: Run landing snapshot suite**

Run: `pnpm exec playwright test tests/visual/landing-baseline.spec.ts`
Expected: 3 passed (landing page unchanged from Task 1 baseline).

**Step 6: Manual smoke**

Run: `pnpm dev`. Visit:
- `/` — landing page should be visually identical to baseline.
- `/design-system` — controls work, preview reflects changes, persistence works, copy works.

Stop dev server.

**Step 7: Commit the integration test**

```bash
git add tests/visual/design-system.spec.ts
git commit -m "test: add integration tests for design system page"
```

---

## Out of scope (for explicit clarity)

- Frame toggle (mobile/tablet/desktop preview simulator) — defer.
- Spacing, padding, border-radius, button-height tokens — defer.
- File-write integration — never; copy/paste is the contract.
- Auth gating / production hiding — decide before launch.
- Diff view beyond change count — overkill for v1.
- Component excerpts beyond Hero + section h2 — add as needed.
