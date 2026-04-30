---
date: 2026-04-30
section: CogniateStory
status: design
---

# Cogniate Story — particle-swarm reveal

Replaces the current per-icon fade+scale entry in `app/sections/CogniateStory.tsx` with a single pinned, scroll-driven particle reveal. The Cogniate logo materialises from a particle swarm that samples the logo silhouette; three coloured clusters then peel off the logo to seed each story icon; finally the swarm re-coalesces into a soft glowing blob below the logo, ready to be replaced by a scroll-scrubbed background video in a follow-up phase.

## Goals

- The logo reveal must be **unmistakably** the Cogniate logo, not a fuzzy approximation.
- The full sequence must be brisk (~3.5s of pinned scroll) so the user doesn't feel trapped.
- The end state must hand off cleanly to a future video reveal — the final blob's position and density are part of the spec.
- One particle system, one draw call, no per-icon canvases.

## Non-goals

- The video reveal phase (next ticket).
- New copy, new icons, new tooltip behaviour.
- Mobile particle effects — mobile keeps its existing vertical-stack fade-in.

## Choreography

One pinned `ScrollTrigger` (`pin: true`, `scrub: 1`) covers the section. Scroll position maps to a single 0–1 progress value; everything below is keyed off that.

| Progress | Phase | What happens |
|---|---|---|
| 0–25% | **Logo forms** | ~6,000 particles fly in from random scattered positions across the SVG area, decelerate into the sampled logo silhouette. Hold formation. |
| 25–35% | **Logo locks** | Crisp PNG (`/assets/story-cogniate-logo.png`) crossfades over the particle silhouette. Both visible for one beat — additive blending makes the PNG feel lit from within. |
| 35–65% | **Icons seed** | Three colour-tinted clusters peel off the logo and sweep along the inner-circle arc to their icon positions. Departures/arrivals overlap so motion is continuous: problem 35→50%, mission 40→55%, insight 45→60%. |
| (per arrival) | **Icon resolves** | Cluster tightens into a small bright flash; icon SVG fades up inside it (~0.2s); residual particles dissolve into the icon's existing CSS glow halo. No lingering orbit. |
| 65–75% | **Hold** | All four elements crisp and still. The user reads the composition. |
| 75–100% | **Swarm shifts down** | Remaining ambient particles (plus a fresh emission from the logo position) flow downward and re-coalesce into a soft, slowly-drifting spherical blob centred below the logo, just inside the bottom of the inner circle. Same density and additive glow as the logo formation, but dispersed enough to feel "ready to dissolve" rather than locked. |

**Cluster colours** match each story's existing `glowColor`:
- Problem cluster — `rgba(250, 103, 124, 0.5)` (salmon)
- Mission cluster — `rgba(172, 124, 241, 0.5)` (lavender)
- Insight cluster — `rgba(104, 233, 162, 0.5)` (mint)

Particles tint up as they depart the logo and tint back to white as they arrive in the icon's glow halo (or, for the residual cloud, never tint at all).

**Cluster paths** sweep along the inner-circle arc rather than going straight — counter-clockwise to the warning (9 o'clock) and flag (12 o'clock) positions, clockwise to the lightbulb (3 o'clock). Cheap to implement (parametric arc interpolation); makes the concentric rings feel like circuits the swarm is riding.

## Particle aesthetic

- **Hybrid (bright cores + glowing halos)**. Each particle is a soft radial-gradient sprite (bright centre, transparent edge). Additive blending means overlapping particles brighten each other — sparse particles read as dust, dense clusters read as luminous clouds.
- ~6,000 particles, single `THREE.Points` mesh, single draw call.
- No comet trails (kept the moment tight; trails read as slow).
- No vortex orbits at icons (cuts visual noise during the static phase).

## Logo silhouette sampling

To guarantee the logo is recognisable as a particle formation:

1. On `ParticleSwarm` mount, render `/assets/story-cogniate-logo.png` to an offscreen 512×512 canvas.
2. Walk the alpha channel; collect indices of pixels with alpha above a threshold (e.g. ≥ 32).
3. Pick ~6,000 sample points uniformly from the opaque set; jitter slightly (±0.5px) to avoid aliasing.
4. Normalise to scene coordinates centred on the inner-circle centre, scaled to the rendered logo size (130×122 in the SVG layout, with retina compensation).
5. Memoise the result.

The PNG crossfade in phase 2 uses the *same* normalised coordinate system as the silhouette sampling, so the particle formation and the crisp PNG occupy exactly the same screen rect — no parallax or misalignment.

## Particle routing budget

Of ~6,000 particles:

| Pool | Count | Destination after logo phase |
|---|---|---|
| Problem cluster | ~1,800 | Warning icon position, then dispersed into its glow halo |
| Mission cluster | ~1,800 | Flag icon position, then dispersed into its glow halo |
| Insight cluster | ~1,800 | Lightbulb icon position, then dispersed into its glow halo |
| Residual ambient | ~600 | Drifts → seeds the final blob |

A fresh emission from the logo position during the shift-down phase tops up the final blob's mass so it reads as a substantial cloud, not a thin remnant.

## Component architecture

### New — `app/components/ParticleSwarm.tsx`

`@react-three/fiber` `Canvas` containing a single `THREE.Points` mesh.

Props:
```ts
interface ParticleSwarmProps {
  scrollProgress: React.MutableRefObject<number>;  // 0–1, updated by ScrollTrigger each frame
  logoSrc: string;                                  // "/assets/story-cogniate-logo.png"
  iconTargets: { x: number; y: number; tint: [number, number, number] }[];
  blobCenter: { x: number; y: number };
  className?: string;
}
```

The Canvas reads `scrollProgress.current` inside `useFrame` (no React state for animation — direct GPU updates only). Particle attributes:

- `position` (current XY)
- `targetA`, `targetB`, `targetC`, `targetD` (four interpolation targets per particle: scattered, logoSilhouette, iconArrival, finalBlob)
- `delay` (per-particle phase offset to break up sync)
- `tintColor` (rgb)
- `pool` (which cluster the particle belongs to: 0–3)

Vertex shader: piecewise interpolation between targets based on `progress` and `pool`. Fragment shader: radial gradient with additive blending, tint applied per-particle.

### Modified — `app/sections/CogniateStory.tsx`

- Replace per-element `ScrollTrigger`s with one pinned trigger over the desktop layout.
- `progressRef = useRef(0)`. ScrollTrigger's `onUpdate` writes `self.progress` to it.
- Pass `progressRef` to `ParticleSwarm`.
- Drive logo PNG opacity, each `StoryIcon`'s opacity, and tooltip availability via the same `progressRef` (read in a `useFrame`-equivalent rAF loop, written to refs/CSS vars to avoid React re-renders during scroll).
- `StoryIcon` and `StoryTooltip` unchanged — only their parent's opacity is keyed off scroll.

### Mounting boundary

The whole pinned + particle behaviour lives inside the existing `<div className="hidden lg:block">` desktop layout. The mobile layout is left exactly as is.

## Scroll trigger spec

```
ScrollTrigger.create({
  trigger: desktopLayoutRef.current,
  start: "top center",
  end: "+=150%",      // ≈ 1.5× viewport height of pinned scroll
  pin: true,
  scrub: 1,
  onUpdate: (self) => { progressRef.current = self.progress; },
});
```

Pin range tuned so a typical scroll wheel cadence resolves the full sequence in ~2–3 seconds of real time, and a deliberate scroll resolves it in 4–5.

## Edge cases

- **`< lg` breakpoint**: skip the particle system entirely. Mobile vertical-stack layout keeps its existing fade-in entry, no pin. `ParticleSwarm` is only mounted inside the desktop branch.
- **`prefers-reduced-motion`**: bail out of particles. Detect via `window.matchMedia("(prefers-reduced-motion: reduce)")`. Skip the pin (so the user isn't held). Fade logo + icons in via a simple `play none none none` trigger at `top 70%`.
- **Tab visibility**: pause `useFrame` when `document.hidden`; resume on visibility change.
- **Cleanup**: dispose geometry/materials/textures on unmount; wrap ScrollTrigger creation in `gsap.context()` so `ctx.revert()` tears it down (matches the existing pattern in the file).
- **Logo PNG load timing**: defer particle initialisation until `image.onload` fires. Render an empty Canvas in the meantime — the user can't reach the pinned phase before mount completes.
- **Resize**: ScrollTrigger refreshes automatically. The particle target coordinates are computed from the rendered SVG container's bounding rect, recomputed on `ScrollTrigger.refresh()` (which fires on resize). Sampling the logo silhouette is done once per mount; only the screen-space normalisation is recomputed on resize.

## Performance budget

- 6,000 particles × 60 fps, single draw call, single shader. Well within budget on mid-range hardware. Devtools sanity check on a mid Mac and a real iPhone before merging.
- No DOM reflows during scroll (everything is GPU + ref reads).
- Logo silhouette sampling is one-time on mount (~5–10ms for a 512×512 alpha walk).

## Phased build

Three discrete chunks. Phase 1 is a strong candidate for delegation to a subagent.

### Phase 1 — Standalone particle prototype (subagent-friendly)

Goal: prove the logo silhouette reads unmistakably as the Cogniate logo, in isolation, before any scroll plumbing.

- Temporary `app/particle-test/page.tsx` route (or an inline playground component) — to be removed before merge.
- Renders only the `ParticleSwarm` component, full viewport.
- A simple slider or auto-loop drives `scrollProgress` 0 → 1 manually so we can scrub the formation.
- Iterate on: particle count, particle size, glow softness, sampling density / threshold, scatter range.
- **Visual gate**: the formed logo must be obviously recognisable from across the room. If it isn't, increase particle count or refine sampling before moving on.

### Phase 2 — Scroll integration

- Wire pinned ScrollTrigger over the desktop layout.
- Implement all four interpolation targets and pool routing.
- Drive logo PNG opacity, icon opacities, tooltip availability via the same scroll progress.
- Validate that icons crossfade in *exactly* when their cluster arrives.

### Phase 3 — Polish & hand-off blob

- Implement the final blob settle (position, density, ambient drift).
- Verify it sits where the upcoming video reveal will need it (centred below the logo, just inside the bottom of the inner circle).
- Tune cluster path arcs, cluster tinting, hold beat duration.

## Testing

- **Playwright visual snapshots** for resting end states only:
  - Section pre-trigger (before pin starts)
  - Logo locked (progress ≈ 30%)
  - All icons placed (progress ≈ 70%)
  - Final blob settled (progress ≈ 100%)
- Motion in flight is too noisy to snapshot reliably — manual review for that.
- Manual cross-browser sanity check: latest Chrome, Safari, Firefox; mid-Mac and a real iPhone for performance.

## Files touched

- `app/sections/CogniateStory.tsx` — modified (pin trigger, progress ref, particle mount)
- `app/components/ParticleSwarm.tsx` — new
- `app/particle-test/page.tsx` — new (temporary, removed before merge)
- `tests/visual/cogniate-story-*.png` — new visual snapshots

## Out of scope (next ticket)

- Background video reveal that scrubs through on continued scroll past 100%.
- Particle blob dissolving into the video frame.
