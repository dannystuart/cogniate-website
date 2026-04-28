# Component Library Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a labelled component library to `/design-system` showing every landing-page component with variants laid out as visual reference. Phase B of two-phase work — showcase only, no landing-page touches.

**Architecture:** Two new presentational primitives (`LibraryCard`, `VariantTile`) plus `ComponentLibrary` that renders 11 catalogue entries inline. Mounted as a new `<PreviewSection title="Component Library">` inside the existing `<main>` cascade wrapper of `DesignSystemClient.tsx`. The previous "Components" section is renamed to "Cascade Preview". Three mock components (`BenefitCard`, `PlatformCard`, `InputField`) are markup-only copies from sections — Phase A will extract them into real components later.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4, TypeScript strict, Playwright visual tests, pnpm.

**Source spec:** `docs/plans/2026-04-28-component-library-design.md` — read once before starting.

**Hard constraint:** `tests/visual/landing-baseline.spec.ts` must stay 3/3 through every commit. If it goes red, you touched something you shouldn't have. Don't update its snapshot to "fix" it.

**Files NOT to touch:**
- `app/components/**`
- `app/sections/**`
- `app/lib/**`
- `app/globals.css` (token defs)
- Existing `app/design-system/preview/*` files (except where listed)
- `tests/visual/landing-baseline.spec.ts` and its snapshots

**Inventory note:** The design doc title says "Existing (7)" but the table lists 8 (EyebrowBadge, ButtonPrimary, ButtonSecondary, StoryIcon, VideoCard, ScrollIndicator, PlatformCardAccordion, NavMenu). Treat the inventory **table** as authoritative — 8 existing + 3 mocks = **11 `LibraryCard`s** total.

---

## Task 1: Scaffolding + section rename

Create the three primitive files (empty bodies), wire them into `DesignSystemClient.tsx`, and rename the existing "Components" preview section to "Cascade Preview". Library renders a placeholder until Task 2 fills it.

**Files:**
- Create: `app/design-system/library/LibraryCard.tsx`
- Create: `app/design-system/library/VariantTile.tsx`
- Create: `app/design-system/library/ComponentLibrary.tsx`
- Modify: `app/design-system/DesignSystemClient.tsx` (lines 100–102 region — add new `<PreviewSection>` and rename existing one)

**Step 1.1: Create `LibraryCard.tsx`**

```tsx
// app/design-system/library/LibraryCard.tsx
import type { ReactNode } from "react";

type Props = {
  title: string;
  importPath: string;
  children: ReactNode;
};

export default function LibraryCard({ title, importPath, children }: Props) {
  return (
    <div className="border border-white/10 rounded-lg p-6 bg-bg-secondary">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        <p className="text-xs font-mono text-text-secondary mt-1">{importPath}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
}
```

**Step 1.2: Create `VariantTile.tsx`**

```tsx
// app/design-system/library/VariantTile.tsx
import type { ReactNode } from "react";

type Props = {
  label: string;
  children: ReactNode;
  fullWidth?: boolean;
};

export default function VariantTile({ label, children, fullWidth }: Props) {
  return (
    <div
      className={`border border-white/10 rounded-md p-6 flex flex-col items-center justify-center gap-3 bg-bg-primary ${fullWidth ? "md:col-span-2" : ""}`}
    >
      <div>{children}</div>
      <code className="text-[10px] font-mono text-text-secondary mt-2">{label}</code>
    </div>
  );
}
```

**Step 1.3: Create `ComponentLibrary.tsx` (placeholder)**

```tsx
// app/design-system/library/ComponentLibrary.tsx
export default function ComponentLibrary() {
  return <p className="text-text-secondary">Coming next</p>;
}
```

**Step 1.4: Wire into `DesignSystemClient.tsx` and rename "Components"**

In `app/design-system/DesignSystemClient.tsx`:

- Add import at the top alongside the other preview imports:
  ```tsx
  import ComponentLibrary from "./library/ComponentLibrary";
  ```
- Replace the existing block (currently lines ~100–102):
  ```tsx
  <PreviewSection title="Components">
    <ComponentExcerpts />
  </PreviewSection>
  ```
  with:
  ```tsx
  <PreviewSection title="Cascade Preview">
    <ComponentExcerpts />
  </PreviewSection>
  <PreviewSection title="Component Library">
    <ComponentLibrary />
  </PreviewSection>
  ```

Both new `PreviewSection`s remain inside the existing `<main style={overrides}>` so cascade flows in.

**Step 1.5: Build + lint + visual tests**

Run all in the worktree root:
```bash
pnpm build
pnpm lint
pnpm exec playwright test tests/visual/landing-baseline.spec.ts
pnpm exec playwright test tests/visual/design-system.spec.ts
```
Expected:
- `pnpm build` — clean (no TS / ESLint errors)
- `pnpm lint` — clean
- `landing-baseline` — **3/3 PASS** (mobile/tablet/desktop unchanged)
- `design-system` — **5/5 PASS** (controls, counter, reset, copy, persist all unaffected by section rename)

If `design-system.spec.ts` fails because a test asserts on the literal string "Components", read the failure carefully — none of the 5 existing tests reference that string, so a failure here means something actually broke.

**Step 1.6: Manual smoke**

```bash
pnpm dev
```
Open `http://localhost:3000/design-system`. Confirm:
- Right pane order: Colors → Typography → Gradients → **Cascade Preview** → **Component Library**
- "Component Library" section shows the heading and "Coming next" placeholder

Stop the dev server.

**Step 1.7: Commit**

```bash
git add app/design-system/library/ app/design-system/DesignSystemClient.tsx
git commit -m "feat(design-system): scaffold component library section

Add LibraryCard + VariantTile primitives and a placeholder
ComponentLibrary. Rename existing 'Components' preview to
'Cascade Preview' to reflect its actual job (token cascade demo)."
```

---

## Task 2: Simple components — EyebrowBadge, ButtonPrimary, ButtonSecondary

Fill `ComponentLibrary` with the first three `LibraryCard`s. ButtonPrimary has 4 variants (the only multi-variant component in this batch); the other two are canonical-only.

**Files:**
- Modify: `app/design-system/library/ComponentLibrary.tsx`

**Step 2.1: Replace `ComponentLibrary.tsx` body**

```tsx
// app/design-system/library/ComponentLibrary.tsx
import EyebrowBadge from "../../components/EyebrowBadge";
import ButtonPrimary from "../../components/ButtonPrimary";
import ButtonSecondary from "../../components/ButtonSecondary";
import LibraryCard from "./LibraryCard";
import VariantTile from "./VariantTile";

export default function ComponentLibrary() {
  return (
    <div className="flex flex-col gap-6">
      <LibraryCard title="EyebrowBadge" importPath="app/components/EyebrowBadge.tsx">
        <VariantTile label="Default" fullWidth>
          <EyebrowBadge>Sample</EyebrowBadge>
        </VariantTile>
      </LibraryCard>

      <LibraryCard title="ButtonPrimary" importPath="app/components/ButtonPrimary.tsx">
        <VariantTile label="variant=white, size=default">
          <ButtonPrimary variant="white" size="default">Click me</ButtonPrimary>
        </VariantTile>
        <VariantTile label="variant=white, size=small">
          <ButtonPrimary variant="white" size="small">Click me</ButtonPrimary>
        </VariantTile>
        <VariantTile label="variant=coral, size=default">
          <ButtonPrimary variant="coral" size="default">Click me</ButtonPrimary>
        </VariantTile>
        <VariantTile label="variant=coral, size=small">
          <ButtonPrimary variant="coral" size="small">Click me</ButtonPrimary>
        </VariantTile>
      </LibraryCard>

      <LibraryCard title="ButtonSecondary" importPath="app/components/ButtonSecondary.tsx">
        <VariantTile label="Default" fullWidth>
          <ButtonSecondary>Click me</ButtonSecondary>
        </VariantTile>
      </LibraryCard>
    </div>
  );
}
```

Notes:
- Single-variant entries use `fullWidth` so they don't sit lonely in a half-row.
- Children text is short and generic per the design doc — never reuse landing-page copy.

**Step 2.2: Build + lint + visual tests**

```bash
pnpm build
pnpm lint
pnpm exec playwright test tests/visual/landing-baseline.spec.ts
pnpm exec playwright test tests/visual/design-system.spec.ts
```
Expected: build clean, lint clean, landing-baseline 3/3, design-system 5/5.

**Step 2.3: Manual eyeball**

```bash
pnpm dev
```
Open `/design-system`, scroll to "Component Library":
- 3 cards visible in order
- EyebrowBadge: pill, gradient bg, "Sample" centered
- ButtonPrimary: 2×2 grid — top row white (default + small), bottom row coral (default + small). Sizes visibly different
- ButtonSecondary: outlined pill, full-width tile
- Each tile shows a mono label below the component

Stop dev.

**Step 2.4: Commit**

```bash
git add app/design-system/library/ComponentLibrary.tsx
git commit -m "feat(design-system): add simple components to library

Catalogue EyebrowBadge, ButtonPrimary (4 variants),
and ButtonSecondary in the new Component Library section."
```

---

## Task 3: Icon + positioned components — StoryIcon, NavMenu, VideoCard, ScrollIndicator

Four cards, each with positioning quirks. `StoryIcon` is laid out in a row of three idle-state icons. The other three need bounded `relative` wrappers because their components use `absolute` positioning.

Read `app/sections/CogniateStory.tsx` (lines 28–59) to confirm the canonical `stories` array — copy the three entries' `size`, `glowColor`, `icon` paths verbatim into the StoryIcon variants. (Static values are fine; do not import the `stories` const because that section file is in the don't-touch list.)

**Files:**
- Modify: `app/design-system/library/ComponentLibrary.tsx` (add four `LibraryCard`s after ButtonSecondary)

**Step 3.1: Add imports at top of `ComponentLibrary.tsx`**

```tsx
import StoryIcon from "../../components/StoryIcon";
import NavMenu from "../../components/NavMenu";
import VideoCard from "../../components/VideoCard";
import ScrollIndicator from "../../components/ScrollIndicator";
```

**Step 3.2: Append four `LibraryCard`s**

Append inside the `<div className="flex flex-col gap-6">` wrapper, after the ButtonSecondary card:

```tsx
<LibraryCard title="StoryIcon" importPath="app/components/StoryIcon.tsx">
  <VariantTile label="Warning icon" fullWidth>
    <div className="flex items-center justify-center gap-8">
      <StoryIcon
        src="/assets/story-warning-icon.svg"
        alt="Warning"
        size={147}
        glowColor="rgba(250, 103, 124, 0.5)"
      />
      <StoryIcon
        src="/assets/story-flag-icon.svg"
        alt="Flag"
        size={120}
        glowColor="rgba(172, 124, 241, 0.5)"
      />
      <StoryIcon
        src="/assets/story-lightbulb-icon.svg"
        alt="Lightbulb"
        size={120}
        glowColor="rgba(104, 233, 162, 0.5)"
      />
    </div>
  </VariantTile>
</LibraryCard>

<LibraryCard title="NavMenu" importPath="app/components/NavMenu.tsx">
  <VariantTile label="Default" fullWidth>
    <div className="relative h-[80px] w-full overflow-hidden">
      <NavMenu />
    </div>
  </VariantTile>
</LibraryCard>

<LibraryCard title="VideoCard" importPath="app/components/VideoCard.tsx">
  <VariantTile label="Default (lg+ only)" fullWidth>
    <div className="relative h-[230px] w-full">
      <VideoCard />
    </div>
  </VariantTile>
</LibraryCard>

<LibraryCard title="ScrollIndicator" importPath="app/components/ScrollIndicator.tsx">
  <VariantTile label="Default" fullWidth>
    <div className="relative h-[380px] w-full flex items-start justify-center">
      <ScrollIndicator />
    </div>
  </VariantTile>
</LibraryCard>
```

Notes:
- Per the design doc, the design doc's StoryIcon table line says "3 — Warning icon, Flag icon, Lightbulb icon" but the labelling-convention example shows `Warning icon` as a single label string. Lay them out as three icons in one full-width tile labelled `Warning icon` if you want the design-doc example to map literally. **Better choice:** drop the literal label and use a single tile that visually shows all three. The design doc's `LibraryCard` type only allows one `<VariantTile>`-per-variant pattern, but the tile content can be anything — three icons in a row is fine. Pick the literal-doc reading and keep label as `Warning icon` — implementer's call.
- `VideoCard` ships with `hidden lg:block` so it's invisible below the lg breakpoint. Don't fork or modify the component. The design system is desktop-tooling; an empty tile on mobile is acceptable.
- `ScrollIndicator` rendering height: it uses a 300px vertical line + 40px scroll-text + margin (~360px). Wrapper height of 380px gives a small buffer. Adjust to ~400px if it clips.
- Resize the tile during the manual eyeball — if the inner component overflows or sits weirdly, bump the wrapper `h-[…]` rather than fighting the component.

**Step 3.3: Build + lint + visual tests**

```bash
pnpm build
pnpm lint
pnpm exec playwright test tests/visual/landing-baseline.spec.ts
pnpm exec playwright test tests/visual/design-system.spec.ts
```
Expected: build clean, lint clean, landing-baseline 3/3, design-system 5/5.

**Step 3.4: Manual eyeball (`pnpm dev`)**

Open `/design-system` at desktop width (≥1024px) and scroll to the Component Library:
- StoryIcon: three icons in a row, idle (no glow active). Hovering one scales it
- NavMenu: anchored to the wrapper top, logo + 3 links visible
- VideoCard: visible at lg+ — gradient-bordered card with logo + coral button
- ScrollIndicator: vertical line with travelling glow, "SCROLL DOWN" text. Should not clip
- All four cards expand width-wise (`fullWidth`) inside their LibraryCards

Resize the browser narrower (~800px). VideoCard tile becomes empty (expected). Other three remain visible.

Stop dev.

**Step 3.5: Commit**

```bash
git add app/design-system/library/ComponentLibrary.tsx
git commit -m "feat(design-system): add icon and positioned components to library

Catalogue StoryIcon (3 sizes/glows), NavMenu, VideoCard,
and ScrollIndicator. Each positioned component uses a bounded
relative wrapper so its absolute children render in-tile."
```

---

## Task 4: PlatformCardAccordion

One card, one full-width tile, generous min-height for the accordion. The component takes an `AccordionCardData` prop — construct a representative one inline.

**Files:**
- Modify: `app/design-system/library/ComponentLibrary.tsx`

**Step 4.1: Inspect the prop shape**

Open `app/components/PlatformCardAccordion.tsx` and confirm the exported `AccordionCardData` type. Read just the type — don't change the file. (This step is needed because the showcase requires constructing a realistic card object.)

**Step 4.2: Add import**

```tsx
import PlatformCardAccordion, { type AccordionCardData } from "../../components/PlatformCardAccordion";
```

**Step 4.3: Build a sample card object**

Inside `ComponentLibrary` above the `return`, declare:

```tsx
const sampleAccordionCard: AccordionCardData = {
  // Fill from the AccordionCardData type. If `Platform.tsx` already exports
  // a const matching this shape, do NOT import it (sections/* is don't-touch).
  // Build a fresh sample inline that exercises every required field.
  // Use representative copy: "Sample feature", "Lorem ipsum…", etc.
  // Pills/feature list should have 3–4 entries to actually exercise the accordion.
};
```

Implementer fills the object literal from the actual type definition. If a field is required and unclear, copy the value structure (not the copy) from the first `card` in `Platform.tsx`'s data array — but use generic showcase copy in the strings.

**Step 4.4: Append the LibraryCard**

```tsx
<LibraryCard title="PlatformCardAccordion" importPath="app/components/PlatformCardAccordion.tsx">
  <VariantTile label="Default" fullWidth>
    <div className="w-full min-h-[480px]">
      <PlatformCardAccordion card={sampleAccordionCard} />
    </div>
  </VariantTile>
</LibraryCard>
```

**Step 4.5: Build + lint + visual tests**

```bash
pnpm build
pnpm lint
pnpm exec playwright test tests/visual/landing-baseline.spec.ts
pnpm exec playwright test tests/visual/design-system.spec.ts
```
Expected: build clean, lint clean, landing-baseline 3/3, design-system 5/5.

**Step 4.6: Manual eyeball + interaction check (`pnpm dev`)**

Open `/design-system` and scroll to the PlatformCardAccordion card:
- Renders inside the tile without overflow
- Visual half = pills column, half = visual panel (50/50 split, per recent fix `a8c24bc`)
- Click each pill — expanded content updates. No console errors

If the accordion clips vertically, bump `min-h-[480px]` to `min-h-[560px]` and verify again.

Stop dev.

**Step 4.7: Commit**

```bash
git add app/design-system/library/ComponentLibrary.tsx
git commit -m "feat(design-system): add PlatformCardAccordion to library

Showcase the accordion in a full-width tile with min-height
sized to fit the expanded content panel."
```

---

## Task 5: Mock components — BenefitCard, PlatformCard, InputField

Three new files under `library/mocks/`. Each is **markup-only** — copy the JSX verbatim from the source section (Benefits / Platform / Signup) into a new component. No data extraction, no prop API design — that's Phase A.

**Files:**
- Create: `app/design-system/library/mocks/BenefitCard.tsx`
- Create: `app/design-system/library/mocks/PlatformCard.tsx`
- Create: `app/design-system/library/mocks/InputField.tsx`
- Modify: `app/design-system/library/ComponentLibrary.tsx`

**Step 5.1: Create `mocks/BenefitCard.tsx`**

Source: `app/sections/Benefits.tsx` lines 105–158 (the inner `<div>` for one benefit, including icon block + title + description).

Hardcode one representative benefit (e.g. "Speed" — `benefits[0]`). The component takes no props; it's a fixed mock for visual reference.

```tsx
// app/design-system/library/mocks/BenefitCard.tsx
import Image from "next/image";

// Markup-only mock copied from app/sections/Benefits.tsx.
// Phase A will extract a real component with props.
export default function BenefitCard() {
  return (
    <div className="flex flex-col items-center gap-6 lg:gap-8 text-center px-6 md:px-10 lg:px-16 py-10 md:py-12 lg:py-16">
      <div className="relative w-[60px] h-[60px] shrink-0">
        <Image
          src="/assets/benefits-icon-circle.svg"
          alt=""
          width={60}
          height={60}
          className="absolute inset-0"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/assets/benefits-icon-speed.svg"
            alt=""
            width={64}
            height={64}
            className="drop-shadow-[0_0_5px_rgba(0,0,0,0.25)]"
          />
        </div>
      </div>
      <h3 className="text-white text-[24px] md:text-[28px] font-normal leading-tight">
        Speed
      </h3>
      <p className="text-white/80 text-[16px] md:text-[18px] lg:text-[20px] font-light leading-[1.3] tracking-[-0.2px] max-w-[430px]">
        From 154 hours to under 60 minutes. Course creation at the speed of thought.
      </p>
    </div>
  );
}
```

Strip the conditional `hasCircleBg` branch — pick one shape (with circle) for the mock.

**Step 5.2: Create `mocks/PlatformCard.tsx`**

Source: `app/sections/Platform.tsx` — the inner `PlatformCard` function defined around line 171, **not** the exported section. Copy its JSX into the mock. The card has a feature-pill grid; include 4 pills with sample text.

This component is the largest mock. Open `Platform.tsx`, find the `function PlatformCard({ card }: …)` block, and copy its JSX body. Replace any data references (`card.title`, `card.features.map(…)`) with hardcoded strings: `"Sample title"`, four `{ label: "Pill N", description: "Sample description text." }`-style entries inlined as JSX.

Skeleton:
```tsx
// app/design-system/library/mocks/PlatformCard.tsx
// Markup-only mock copied from app/sections/Platform.tsx.
// Phase A will extract a real component with props.
export default function PlatformCard() {
  return (
    <div className="relative flex flex-col lg:flex-row gap-8 lg:gap-[80px] xl:gap-[120px] items-center overflow-hidden rounded-[20px] px-6 py-8 lg:px-[60px] xl:px-[80px] lg:py-[40px]">
      {/* paste the inner JSX of Platform.tsx's PlatformCard function here,
          replacing every `card.X` reference with a hardcoded sample value */}
    </div>
  );
}
```

Reasonable scope: keep the gradient backgrounds, the title, the description, and the 4-pill grid. If a sub-component (`FeaturePill`) is defined in `Platform.tsx`, inline its JSX too — don't import it. The whole mock should be self-contained.

**Step 5.3: Create `mocks/InputField.tsx`**

Source: `app/sections/Signup.tsx` lines 211–222 (two `<input>` elements). The mock exports two variants — `<InputField variant="empty" />` and `<InputField variant="filled" />` — or, simpler, a single component that renders both inputs side-by-side.

Pick the simpler shape:

```tsx
// app/design-system/library/mocks/InputField.tsx
// Markup-only mock copied from app/sections/Signup.tsx.
// Phase A will extract a real <InputField /> with props.

const inputClass =
  "h-14 px-6 rounded-full bg-[#0c0c0c] border border-white/[0.1] text-white placeholder:text-white/40 text-[16px] outline-none w-full focus:border-white/25 transition-colors";

export function InputFieldEmpty() {
  return <input type="email" placeholder="Work email" className={inputClass} readOnly />;
}

export function InputFieldFilled() {
  return <input type="email" defaultValue="sample@cogniate.com" className={inputClass} readOnly />;
}
```

`readOnly` prevents Playwright/lint warnings about `defaultValue` without `onChange`.

**Step 5.4: Wire the three mocks into `ComponentLibrary.tsx`**

Imports:
```tsx
import BenefitCard from "./mocks/BenefitCard";
import PlatformCard from "./mocks/PlatformCard";
import { InputFieldEmpty, InputFieldFilled } from "./mocks/InputField";
```

Append three more `LibraryCard`s after the PlatformCardAccordion card:

```tsx
<LibraryCard title="BenefitCard (mock)" importPath="app/design-system/library/mocks/BenefitCard.tsx">
  <VariantTile label="Default" fullWidth>
    <BenefitCard />
  </VariantTile>
</LibraryCard>

<LibraryCard title="PlatformCard (mock)" importPath="app/design-system/library/mocks/PlatformCard.tsx">
  <VariantTile label="Default" fullWidth>
    <PlatformCard />
  </VariantTile>
</LibraryCard>

<LibraryCard title="InputField (mock)" importPath="app/design-system/library/mocks/InputField.tsx">
  <VariantTile label="Empty">
    <InputFieldEmpty />
  </VariantTile>
  <VariantTile label="Filled">
    <InputFieldFilled />
  </VariantTile>
</LibraryCard>
```

Note the design doc lists 2 `PlatformCard` variants ("the two non-accordion cards"). Both are markup-only mocks of the same shape, just with different copy. **Decision for this plan:** ship one variant in this commit. If a second variant adds visual signal during eyeball, add it as a second `<VariantTile label="Variant B">`.

**Step 5.5: Build + lint + visual tests**

```bash
pnpm build
pnpm lint
pnpm exec playwright test tests/visual/landing-baseline.spec.ts
pnpm exec playwright test tests/visual/design-system.spec.ts
```
Expected: build clean, lint clean, landing-baseline 3/3, design-system 5/5.

**Step 5.6: Manual eyeball (`pnpm dev`)**

`/design-system` Component Library now shows 11 cards in this order:
1. EyebrowBadge
2. ButtonPrimary
3. ButtonSecondary
4. StoryIcon
5. NavMenu
6. VideoCard
7. ScrollIndicator
8. PlatformCardAccordion
9. BenefitCard (mock)
10. PlatformCard (mock)
11. InputField (mock)

Each card has the title (h3) + import path (mono). Each tile has the component + label below.

InputField: Empty input has placeholder visible; Filled input shows the sample email.

Stop dev.

**Step 5.7: Commit**

```bash
git add app/design-system/library/mocks/ app/design-system/library/ComponentLibrary.tsx
git commit -m "feat(design-system): add markup-only mocks to library

Add BenefitCard, PlatformCard, and InputField as markup-only
mocks copied from their source sections. Phase A will extract
these into real components and refactor the consumers."
```

---

## Final verification gate

After all 5 commits, run the full check from the worktree root:

```bash
pnpm lint
pnpm build
pnpm exec playwright test tests/visual/landing-baseline.spec.ts
pnpm exec playwright test tests/visual/design-system.spec.ts
```

Expected:
- `pnpm lint` — clean
- `pnpm build` — clean
- `landing-baseline.spec.ts` — **3/3 PASS**
- `design-system.spec.ts` — **5/5 PASS**

If `landing-baseline` regressed at any point during the 5 commits, something off-limits got touched. Use `git diff main -- app/components/ app/sections/ app/lib/ app/globals.css` to find it; revert that file specifically rather than the whole commit.

## Out-of-scope reminders

If a thought arises, write it down for Phase A — don't do it here:
- Do not extract the 3 mocks into real components.
- Do not refactor `ButtonPrimary` / `ButtonSecondary` into one `<Button variant>`.
- Do not add prop tables, code snippets, or copy-to-clipboard.
- Do not add a playground / props editor.
- Do not add new Playwright tests for the library (the spec calls for cataloguing only; existing 5/5 + landing-baseline 3/3 is the gate).

## Future work — Phase A (separate plan)

Once this showcase exists and the mock APIs feel right:
1. Extract each mock into `app/components/`.
2. Refactor consumers (`Benefits.tsx`, `Platform.tsx`, `Signup.tsx`).
3. Verify `landing-baseline` stays green or rebaseline explicitly.
4. Optionally consolidate `ButtonPrimary` + `ButtonSecondary`.
