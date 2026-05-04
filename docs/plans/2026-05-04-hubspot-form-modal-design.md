# HubSpot Form Modal — Design

Date: 2026-05-04
Branch: `feat/cogniate-update`

## Goal

Open a modal containing a styled HubSpot form when site CTAs are clicked. The Community CTAs (Hero `Join the Community` button, NavMenu `Community` link) are wired in this round; a Book a Demo form is registered but not yet wired (one-line follow-up).

## Decisions

| # | Decision | Choice |
|---|---|---|
| 1 | Styling fidelity | **Pixel-match the Signup section form** — embed HubSpot, suppress its CSS (`cssRequired: ""`, `cssClass: ""`), apply our own classes inside `onFormReady` |
| 2 | Modal anatomy | **Heading + sub + form**, matching Signup section typography (italic coral H1 + gradient sub + light body paragraph) |
| 3 | Copy | **Per-form configurable** — not coupled to Signup section copy. Slots: `heading`, `sub`, `body`, `success` |
| 4 | Trigger mechanism | **Imperative API + URL hash sync** — `useFormModal().open("community")` plus a `hashchange` listener so `/#community` deep-linking and browser back-button close work |
| 5 | Scope | **Community wired now; Demo registered, not wired** — registry holds both forms; only Hero `Join the Community` and NavMenu `Community` get wired this round |
| 6 | Submit behaviour | **Custom success state** — `onFormSubmitted` swaps the form for a branded "You're in" card; modal stays open until user dismisses |

## Architecture

```
app/
├─ layout.tsx                       (mounts <FormModalProvider> wrapping children)
├─ lib/form-modal/
│  ├─ registry.ts                   (FORMS map: id → { portal, formId, region, heading, sub, body, success })
│  ├─ FormModalProvider.tsx         (context: open/close/active id; ESC; scroll-lock; hash sync)
│  └─ types.ts                      (FormConfig, FormId)
└─ components/
   ├─ FormModal.tsx                 (visual shell — backdrop, panel, heading slots, GSAP fade-scale)
   └─ HubSpotForm.tsx               (loads embed script once; calls hbspt.forms.create with no-CSS;
                                     restyles in onFormReady; swaps to success card via onFormSubmitted)
```

### Trigger contract

- `useFormModal().open(id: FormId)` — imperative open from any client component.
- `hashchange` listener: when `location.hash` matches a registered id (`#community`, `#book-a-demo`), open it; clearing the hash closes it. Closing the modal pops the hash.
- NavMenu `<a href="#community">` continues to work as a real link — the hash listener picks it up.
- Hero `Join the Community` button gets `onClick={() => open("community")}`.

### HubSpot embed strategy

1. Inject `https://js-na2.hsforms.net/forms/embed/v2.js` once (idempotent via `data-hbspt-loaded` flag on `document`).
2. Call `hbspt.forms.create({ portalId, formId, region, target, cssRequired: "", cssClass: "" })`.
3. In `onFormReady(form)`:
   - Walk inputs, textareas, selects → apply pill-input Tailwind classes (`h-14 px-6 rounded-full bg-[#0c0c0c] border border-white/10 text-white placeholder:text-white/40 ...`).
   - Walk labels → make them visually-hidden (we rely on placeholders to match Signup form aesthetic) but keep them for a11y via `sr-only`.
   - Style the submit `<input type="submit">` to match the white pill button (or wrap; class application is enough).
   - Style any error messages with `text-accent-coral text-sm`.
4. In `onFormSubmitted`: set local React state → render the success card instead.

### Success card

Italic coral `You're in.` + gradient sub `We'll be in touch shortly.` + body `Thanks for joining the Cogniate community. Watch your inbox for early-access details.` + dismiss button.

## Behavioural details

- **Scroll lock** — set `document.body.style.overflow = "hidden"` on open, restore on close (matching MiniShowreelLightbox's spirit but simpler).
- **ESC** — closes modal.
- **Backdrop click** — closes modal.
- **Focus** — on open, move focus to close button; on close, restore previous focus.
- **Reduced motion** — skip GSAP fade-scale, just toggle opacity.
- **Portal** — render to `document.body` so the modal isn't trapped by parent `overflow:hidden` on the Hero section.

## Out of scope (this round)

- Wiring Book a Demo CTAs (Hero + Footer) to the modal — registry is ready; one-line `onClick` later.
- Replacing the Signup section's inline form with a HubSpot-backed embed.
- Marketing-controllable success copy via HubSpot.
