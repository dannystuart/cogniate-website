# Component Library on /design-system — Design Doc

## Goal

Add a labelled component library to `/design-system` that catalogues every component used on the landing page, with each variant/state laid out so visual drift is easy to spot. Labels mirror the prop API verbatim so they can be pasted into AI prompts (e.g. `Button variant=coral size=small`) and reliably understood.

This is Phase B of a two-phase plan:
- **Phase B (this doc):** build the showcase. Don't touch landing page.
- **Phase A (later, separate doc):** extract real component primitives from the showcase mocks, then refactor landing page sections to consume them.

Building B first lets the API stabilise before any consumer is rewritten.

## Hard constraint

The landing page renders pixel-identical to its current state. `tests/visual/landing-baseline.spec.ts` 3/3 must keep passing through every commit.

## Out of scope

- Real component extraction for `BenefitCard`, `PlatformCard`, `InputField` — these are markup-only mocks here. Phase A will extract.
- Prop tables, code snippets, copy-to-clipboard — variants visible only.
- Interactive playground / props editing.
- Theme variants beyond what the landing page actually uses today.
- Storybook or any external docs framework.

## Page structure

The right pane currently has: **Colors → Typography → Gradients → Components**.

After this work: **Colors → Typography → Gradients → Cascade Preview → Component Library**.

- "Components" renamed to "Cascade Preview" (more accurate — its job is showing token cascade through real heading shapes via `<main style={overrides}>`).
- New "Component Library" section sits below, also inside `<main>` so cascade flows in for free where applicable.

## Component inventory

### Existing (7) — showcase as-is

| # | Component | File | Variants |
|---|---|---|---|
| 1 | `EyebrowBadge` | `app/components/EyebrowBadge.tsx` | One canonical (children only) |
| 2 | `ButtonPrimary` | `app/components/ButtonPrimary.tsx` | 4 — `variant=white size=default`, `variant=white size=small`, `variant=coral size=default`, `variant=coral size=small` |
| 3 | `ButtonSecondary` | `app/components/ButtonSecondary.tsx` | One canonical |
| 4 | `StoryIcon` | `app/components/StoryIcon.tsx` | 3 — `Warning icon`, `Flag icon`, `Lightbulb icon` (each at its real `size` + `glowColor` from `CogniateStory.tsx`'s `stories` array). Idle state only — active is hover-driven. |
| 5 | `VideoCard` | `app/components/VideoCard.tsx` | One canonical |
| 6 | `ScrollIndicator` | `app/components/ScrollIndicator.tsx` | One canonical |
| 7 | `PlatformCardAccordion` | `app/components/PlatformCardAccordion.tsx` | One canonical (renders the existing `AccordionCardData` shape) |
| 8 | `NavMenu` | `app/components/NavMenu.tsx` | One canonical |

### New mocks (3) — markup-only

| # | Component | Source | Variants |
|---|---|---|---|
| 9 | `BenefitCard` | copied from `app/sections/Benefits.tsx` h3 cards | 1 canonical (the cards in Benefits all share one shape) |
| 10 | `PlatformCard` | copied from `app/sections/Platform.tsx` non-accordion cards | 2 — the two non-accordion cards in Platform |
| 11 | `InputField` | copied from `app/sections/Signup.tsx` form inputs | 2 — `Empty`, `Filled` (rendered side-by-side) |

Implementer note: variants 9–11 are markup-only mocks. Don't extract real components yet — that's Phase A. Just render the source markup verbatim inside the showcase tile so it serves as a visual spec.

## Labelling convention

Each component card renders:
- **Title** (h3, prominent): the component name verbatim. e.g. `ButtonPrimary`
- **Subtitle** (mono, dim): the import path. e.g. `app/components/ButtonPrimary.tsx`

Each variant tile renders:
- The component instance, sized naturally
- A small mono label below, mirroring the prop API verbatim:
  - Real props: `variant=white, size=default`
  - Canonical-only: `Default`
  - Mocks: descriptive — `Empty`, `Filled`, `Warning icon`, etc.

Example label-to-code mapping:

| Label                          | Code                                                          |
| ------------------------------ | ------------------------------------------------------------- |
| `variant=coral, size=small`    | `<ButtonPrimary variant="coral" size="small">…</ButtonPrimary>` |
| `Default`                      | `<EyebrowBadge>…</EyebrowBadge>`                              |
| `Warning icon`                 | `<StoryIcon src="/assets/story-warning-icon.svg" size={147} glowColor="rgba(250,103,124,0.5)" />` |

Showcase children: short representative text (`Click me`, `Sample`). Don't recreate landing-page-specific copy.

## Architecture

```
app/design-system/library/
├── ComponentLibrary.tsx       — top-level, renders 10 LibraryCards inline
├── LibraryCard.tsx            — { title, importPath, children } wrapper
├── VariantTile.tsx            — { label, children } labelled tile
└── mocks/
    ├── BenefitCard.tsx        — markup mock (copied from Benefits)
    ├── PlatformCard.tsx       — markup mock (copied from Platform)
    └── InputField.tsx         — markup mock (copied from Signup)
```

`LibraryCard.tsx`:

```tsx
type Props = { title: string; importPath: string; children: ReactNode };

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

`VariantTile.tsx`:

```tsx
type Props = { label: string; children: ReactNode; fullWidth?: boolean };

export default function VariantTile({ label, children, fullWidth }: Props) {
  return (
    <div className={`border border-white/10 rounded-md p-6 flex flex-col items-center justify-center gap-3 bg-bg-primary ${fullWidth ? "md:col-span-2" : ""}`}>
      <div>{children}</div>
      <code className="text-[10px] font-mono text-text-secondary mt-2">{label}</code>
    </div>
  );
}
```

`fullWidth` is for components that need the full row (e.g. `PlatformCardAccordion`).

`ComponentLibrary.tsx` renders ten `<LibraryCard>` blocks inline (no need for separate per-component files — each is short).

In `DesignSystemClient.tsx`:

```tsx
<PreviewSection title="Cascade Preview">       {/* renamed from "Components" */}
  <ComponentExcerpts />
</PreviewSection>
<PreviewSection title="Component Library">     {/* new */}
  <ComponentLibrary />
</PreviewSection>
```

## Edge cases (positioned components)

Five components don't fit a generic VariantTile cleanly. Each gets a tailored `relative`-positioned wrapper inside its tile:

1. **`NavMenu`** — `absolute top-0 left-1/2 -translate-x-1/2 z-30`. Wrap in `<div className="relative h-[80px] w-full overflow-hidden">`. Nav anchors to the wrapper top.

2. **`VideoCard`** — `hidden lg:block absolute bottom-[80px] right-[100px]`. Wrap in `<div className="relative h-[230px] w-full">`. Below `lg` breakpoint the tile is empty (acceptable — design system is desktop-first internal tooling). Don't fork the component to remove `hidden lg:block`.

3. **`ScrollIndicator`** — same treatment. Tall relative wrapper sized to its natural rendering height (~`h-[160px]`; implementer reads source and matches).

4. **`PlatformCardAccordion`** — wide and complex. Use a single `<VariantTile fullWidth>` per `LibraryCard`. May need `min-h-[480px]` on the tile to give the accordion room.

5. **`StoryIcon`** — render the 3 icons in a row, idle state. Active scale fires on hover/click. Don't fake the active state.

## Cascade caveat

Most Library components react to token cascade (e.g. `EyebrowBadge` reads `text-text-muted`, so changing that token in the controls panel updates the eyebrow in the library). Some don't — `ButtonPrimary` uses hardcoded `bg-white text-[#1d2026]`, so color tokens won't move it. This is fine. The Library section is a visual reference; cascade demonstration is the Cascade Preview section's job.

## Phasing

5 commits, each with its own verification:

1. **Scaffolding + rename** — create empty `ComponentLibrary.tsx`, `LibraryCard.tsx`, `VariantTile.tsx`. Wire `<PreviewSection title="Component Library"><ComponentLibrary /></PreviewSection>` into `DesignSystemClient.tsx`. Rename existing "Components" → "Cascade Preview". Library renders `<p>Coming next</p>` placeholder. Gate: build + landing baseline 3/3.

2. **Simple components (3)** — `EyebrowBadge`, `ButtonPrimary` (4 variants), `ButtonSecondary`. Gate: build + landing baseline 3/3 + manual eyeball.

3. **Icon + positioned components (4)** — `StoryIcon` (3 icon variants), `NavMenu`, `VideoCard`, `ScrollIndicator`. Each in a bounded `relative` wrapper. Gate: build + landing baseline 3/3 + manual check that each renders cleanly inside its tile.

4. **`PlatformCardAccordion`** — own `LibraryCard` with single `fullWidth` `VariantTile`, `min-h-[480px]`. Gate: build + landing baseline 3/3 + manual check that pills click and content expands.

5. **Mocks (3)** — `BenefitCard`, `PlatformCard`, `InputField`. Pure markup copies from `Benefits.tsx`, `Platform.tsx`, `Signup.tsx`. `InputField` renders empty + filled. Gate: build + landing baseline 3/3.

## Final verification gate

After commit 5:

- `pnpm exec playwright test tests/visual/landing-baseline.spec.ts` — 3/3
- `pnpm exec playwright test tests/visual/design-system.spec.ts` — 5/5
- `pnpm lint` — clean
- `pnpm build` — clean

If `landing-baseline` regresses at any point, something we shouldn't have touched got touched.

## Files NOT touched

- Anything in `app/components/`
- Anything in `app/sections/`
- Anything in `app/lib/`
- Existing token / cascade preview / persistence / copy code
- Existing test specs

## Future work (Phase A — not in this plan)

Once this showcase exists and the API for the 3 mocks (`BenefitCard`, `PlatformCard`, `InputField`) is stable, write a follow-up plan that:

1. Extracts each mock into a real component under `app/components/`.
2. Refactors the corresponding landing-page section to import the new component.
3. Verifies the landing-baseline snapshot stays green (or rebaselines explicitly if a tiny rendering difference is acceptable).
4. Optionally consolidates `ButtonPrimary` + `ButtonSecondary` into a single `<Button variant>` component.

Phase A is deliberately deferred so the API stabilises against a real visual reference before any consumer rewrite.
