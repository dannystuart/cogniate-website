# Pricing Page — Design

**Date:** 2026-05-04
**Route:** `/pricing`
**Status:** Validated brainstorm, ready for implementation

## Goal

A pricing page that fits the cinematic, scroll-driven tone of the homepage while being practical for shoppers comparing tiers. Three product axes (Authoring, Publishing, Add-ons) presented in one long, navigable page.

## Structure (Option C — sequential scroll + sticky pill nav)

```
NavMenu (existing, global)
├── Hero / Intro
│   ├── Eyebrow: PRICING
│   ├── Heading (gradient): "Build a plan that fits."
│   └── Subhead: one-liner positioning
│
├── Sticky Pill Nav  (sticks below NavMenu after hero scrolls past)
│   └── Authoring · Publishing · Add-ons   (smooth-scroll jumps)
│
├── Section 1 — Authoring  #authoring
│   ├── Section heading + lead-in
│   ├── Subsection: Individuals
│   │   ├── Billing toggle (Monthly · Annual — save ~17%)
│   │   └── 3-up grid: Free · Creator ⭐ · Pro Creator
│   └── Subsection: Teams
│       └── 3-up grid: Team · Agency · Enterprise
│
├── Section 2 — Publishing  #publishing
│   ├── Section heading + lead-in
│   └── 4-up grid (muted cards, no CTAs): Starter · Growth ⭐ · Scale · Enterprise
│
├── Section 3 — Add-ons  #add-ons
│   ├── Section heading + lead-in (one line: "Stackable boosts")
│   └── 3x2 tile grid: Library Pack + 5 token boosts
│
└── Footer (existing)
```

## Section 1 — Authoring (full CTAs)

### Card surface (per tier)
- Eyebrow tag: `FREE` / `MOST POPULAR` / `PRO` / `TEAM` / `AGENCY` / `ENTERPRISE`
- Tier name (gradient typography, like existing headings)
- One-line positioning (e.g. "Try the platform" / "For working creators" / "For studios")
- Price block — large numerals; toggles between monthly / annual
- 3 headline differentiators (icon + label, like Platform card features)
- CTA: `Book a Demo` button → Slack form URL (placeholder for now)
- Expand affordance: `See full plan ↓` — opens accordion in-place

### Card surface (expanded — accordion)
- Full feature list (seats, courses, tokens, exports, branding, support, trial, etc.)
- Smooth height animation (CSS `grid-template-rows: 0fr → 1fr` trick)

### Highlighted card (Creator)
- `MOST POPULAR` eyebrow tag
- Always-on ambient halo: slow pulse, purple→pink, ~6s loop
- Slightly elevated (translateY(-8px)) at all viewports
- Border treatment slightly brighter

### Billing toggle (Individuals only)
- Segmented pill above the 3-up grid: `Monthly | Annual`
- Annual reads `Save ~17%` as a small caption
- Click flips price digits across all 3 cards in unison
- Animation: cross-fade + 4px y-translate (subtle, fast: 240ms)
- Free card just says `$0 forever` and ignores the toggle

### Cursor spotlight
- Soft radial gradient (~400px diameter, white at 6% alpha) tracks the cursor across the row
- Implemented at the row level with CSS variables driven by mouse position
- Reduces to nothing on touch devices

### Hover
- Card lifts (translateY(-4px))
- Halo intensifies on the popular card
- All cards: subtle border brighten

### Tier data — Individuals
| Tier        | Monthly | Annual /mo | Annual /yr | Seats               | Tokens          | Highlights                                        |
|-------------|---------|------------|------------|---------------------|-----------------|---------------------------------------------------|
| Free        | $0      | —          | —          | 1 user              | 100 (Lyra only) | 1 course, watermarked, community support          |
| Creator ⭐  | $39     | $29        | $348       | 1 user + 2 collab   | 1,500           | 10 courses, custom domain, full export stack      |
| Pro Creator | $75     | $63        | $756       | 1 user + 5 collab   | 6,000           | 30 courses, remove branding, advanced Lyra        |

### Tier data — Teams
| Tier       | Price            | Seats              | Tokens         | Highlights                                |
|------------|------------------|--------------------|----------------|-------------------------------------------|
| Team       | $59/seat/mo      | min 5 ($297 entry) | 30,000 pooled  | Real-time co-authoring, role permissions  |
| Agency     | From $199/seat   | Negotiated         | 100,000 pooled | Multi-tenant client workspaces, partner   |
| Enterprise | Custom           | By requirement     | Volume pool    | SSO/SAML, SOC 2 Type II, dedicated CSM    |

## Section 2 — Publishing (reference, no CTAs)

Same card silhouette as Authoring but:
- Smaller padding, slightly smaller typography
- No glow halo even on `Growth` (just `MOST POPULAR` tag)
- No CTA button
- No accordion / no expand
- 4-up grid (collapses to 2-up on tablet, 1-up mobile)

| Tier       | Price | Learners       | Key features                                  |
|------------|-------|----------------|-----------------------------------------------|
| Starter    | $9    | up to 100      | SCORM hosting, basic analytics, subdomain     |
| Growth ⭐  | $29   | up to 1,000    | Custom domain, certificates, advanced analytics |
| Scale      | $99   | up to 10,000   | API, SSO, compliance logs, priority support   |
| Enterprise | Custom| Unlimited      | Dedicated infra, SLA, data residency          |

## Section 3 — Add-ons (reference, no CTAs)

3-column × 2-row tile grid (collapses to 2 / 1 col).

Each tile:
- Tile header: name + price
- Body: "what it provides" line
- Quantity model (e.g. "one per account") as a small footnote-style line

| Add-on           | Price   | Quantity model      | Provides                       |
|------------------|---------|---------------------|--------------------------------|
| Library Pack     | $19/mo  | Unlimited stackable | +10 authoring courses per pack |
| Spark Boost      | $9/mo   | One per account     | +1,000 tokens                  |
| Ignite Boost     | $19/mo  | One per account     | +5,000 tokens                  |
| Blaze Boost      | $49/mo  | One per account     | +15,000 tokens                 |
| Unlimited Boost  | $99/mo  | One per account     | Unlimited tokens (1 library)   |
| Org-Wide Boost   | $199/mo | One per workspace   | +50,000 pooled tokens          |

## Sticky Pill Nav

- Sits inline at the top of the pricing area (after the hero), then becomes `position: sticky; top: <NavMenu height + 16px>;` after scroll-past
- Pill shape: rounded-full, `bg-bg-nav` (existing rgba(16,16,17,0.8)), backdrop-blur-md
- 3 segments: Authoring · Publishing · Add-ons
- Active segment: pill-shaped indicator slides between segments (Framer Motion `layoutId` if available, else CSS transition on a positioned absolute pill)
- Click smooth-scrolls to `#authoring` / `#publishing` / `#add-ons`
- Active state derived from scroll position via IntersectionObserver

## Components

New, in `app/components/pricing/`:
- `PricingHero.tsx` — server component
- `PricingNav.tsx` — client (scroll listener, smooth scroll)
- `AuthoringSection.tsx` — client (billing toggle state, cursor spotlight)
- `PricingTierCard.tsx` — client (accordion expand state, popular halo)
- `PublishingSection.tsx` — server (data static)
- `PublishingCard.tsx` — server (no interaction)
- `AddOnsSection.tsx` — server
- `AddOnTile.tsx` — server
- `BillingToggle.tsx` — client

Page composition: `app/pricing/page.tsx` — server component wiring NavMenu + sections + Footer.

## Motion summary (Direction A — quiet cinematic)

| Moment                      | Treatment                                                       |
|-----------------------------|------------------------------------------------------------------|
| Page load                   | Hero fade-up; cards stagger-fade in (200ms each, 50ms gap)      |
| Popular card                | Slow pulsing halo (6s loop, opacity 0.6→1.0)                    |
| Cursor across Authoring row | Soft spotlight follows                                           |
| Billing toggle              | Price digits cross-fade + 4px lift, 240ms ease-out              |
| Card hover                  | translateY(-4px), border brighten                                |
| Card expand (accordion)     | grid-template-rows 0fr → 1fr, 320ms ease-out                    |
| Sticky nav segment change   | Indicator slides under active segment, 280ms                     |
| Scroll-into-view            | Section eyebrow + heading: small fade-up via IntersectionObserver |

## Accessibility

- All toggles & nav segments are real `<button>` elements with `aria-pressed` / `aria-current`
- Smooth scroll respects `prefers-reduced-motion`
- Halo pulse honours `prefers-reduced-motion`
- Cursor spotlight is decorative (`aria-hidden`)
- Accordion uses `aria-expanded` + visible focus ring on the trigger

## NavMenu

Already includes "Pricing" → `#pricing`. We change the href to `/pricing` (cross-page navigation). The Pricing page also renders NavMenu at the top so users always have global nav.

## Out of scope (this pass)

- Real Stripe SKU wiring
- FAQ section (can be added later if needed)
- Currency localisation
- Slack CTA URL — use `#book-demo` placeholder until real URL provided
