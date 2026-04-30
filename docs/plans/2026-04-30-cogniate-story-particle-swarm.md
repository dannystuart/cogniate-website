# Cogniate Story — Particle Swarm Reveal Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.
>
> **Execution mode (per user direction):**
> - Phase 1 → dispatched to a subagent via `superpowers:subagent-driven-development`. Stop at the visual gate; do not proceed to Phase 2 without user sign-off.
> - Phases 2 + 3 → executed in the main session, not via subagent.

**Goal:** Replace the per-icon fade+scale entry on the Cogniate Story section with a single pinned, scroll-driven particle reveal: scattered particles coalesce into the Cogniate logo, then peel off into three coloured icon clusters, then re-form into a soft glowing blob below the logo (the hand-off point for a future video reveal).

**Architecture:** One `<ParticleSwarm>` client component (`@react-three/fiber` Canvas with a single `THREE.Points` mesh, ~6,000 particles, additive-blended radial-gradient sprites, single draw call). Animation is driven entirely by a piecewise vertex shader keyed off `uProgress`, a uniform written each frame from a scroll-progress ref updated by a single pinned GSAP `ScrollTrigger` on the section's desktop layout. The DOM (logo PNG, icons, tooltips) crossfades against the same `progressRef` via a rAF loop writing CSS variables — no React re-renders during scroll. Mobile and `prefers-reduced-motion` users bypass the particle system entirely.

**Tech Stack:**
- Next.js 16.2.4 (App Router) — `app/` dir, this is **not** the Next.js you know; check `node_modules/next/dist/docs/` if any API feels uncertain.
- React 19, TypeScript strict, Tailwind v4
- GSAP 3.15 + ScrollTrigger (already a project pattern; see existing `useEffect` in `CogniateStory.tsx`)
- Three.js 0.184 + `@react-three/fiber` 9.6 + `@react-three/drei` 10.7 (all installed)
- Playwright for visual snapshots
- Package manager: **pnpm**

**Source design doc:** `docs/plans/2026-04-30-cogniate-story-particle-swarm-design.md` — read it once before starting; the choreography table, particle pool budget, and edge-cases section are the authoritative spec. This plan is the *how*; that doc is the *what*.

---

## Coordinate-system and naming conventions used throughout this plan

The desktop layout container is the SVG `concentric-circles` wrapper:

```
<div style={{ maxWidth: 1700, aspectRatio: "1718 / 635" }}>
```

Inside that container, percentage anchors (already in the file) place the four DOM elements. We will reuse these anchors as the particle target positions:

| Anchor | left % | top % | role |
|---|---|---|---|
| Logo centre | 50.4% | 50.0% | logo silhouette centre, ambient pool home |
| Warning (problem) | 32.0157% | 49.9562% | problem cluster destination |
| Flag (mission) | 50.4449% | 0.0957% | mission cluster destination |
| Lightbulb (insight) | 68.8741% | 49.9562% | insight cluster destination |
| Final blob centre | 50.4% | ~76% | hand-off blob (computed: just inside bottom of inner circle) |

The logo SVG renders at `130×122` CSS px inside that container. The silhouette must be sampled to that exact pixel rect.

Inside the `<Canvas>` we use a `THREE.OrthographicCamera` so 1 scene unit = 1 CSS pixel and the camera is sized to the wrapper's bounding box — this means JS-side targets translate directly to GPU positions with no projection maths.

Pool IDs (used in shader and JS):

```
0 = problem cluster (~1,800 particles, salmon tint)
1 = mission cluster (~1,800 particles, lavender tint)
2 = insight cluster (~1,800 particles, mint tint)
3 = ambient        (~600 particles, white, no peel-off)
```

Cluster colours (from existing `glowColor` props in `CogniateStory.tsx`):

```
problem  → rgba(250, 103, 124, 0.5)  → vec3(0.980, 0.404, 0.486)
mission  → rgba(172, 124, 241, 0.5)  → vec3(0.675, 0.486, 0.945)
insight  → rgba(104, 233, 162, 0.5)  → vec3(0.408, 0.914, 0.635)
ambient  → vec3(1.0, 1.0, 1.0)
```

---

## Phase boundaries and acceptance criteria

### Phase 1 — Standalone particle prototype (subagent)

**Done when:** opening `/particle-test` in a desktop browser, scrubbing the slider all the way right shows a particle formation that is **unmistakably** the Cogniate logo — i.e. a viewer recognises the stylised "C" with stem, the small registered-mark dot, and the inner detail at the top, from across the room. The particles look like luminous dust (bright cores, soft halos), not flat dots. Holding the slider at 1.0 keeps the formation stable.

### Phase 2 — Scroll integration

**Done when:** scrolling through the Cogniate Story section pins the section, runs the full choreography (scatter → logo → peel into icons → hold → drift to blob) keyed to scroll position, and on un-pin leaves the page in a normal scroll state with no jank. Logo PNG, all three story icons, and tooltip availability all crossfade in at the right moments. Resize and `prefers-reduced-motion` are handled per design doc.

### Phase 3 — Polish + final blob hand-off

**Done when:** four Playwright visual snapshots match (pre-trigger, logo locked ≈30%, icons placed ≈70%, blob settled ≈100%); the final blob is centred below the logo, just inside the bottom of the inner circle, with the "ready to dissolve" density called out in the design doc; cluster paths sweep the inner-circle arc (CCW to 9/12, CW to 3); the temporary `/particle-test` route is removed; the section runs at 60fps on a mid-Mac and a real iPhone (manual check); the build passes `pnpm lint` and `pnpm build`.

---

## A note on testing strategy (read once, applies throughout)

Per the source design doc: motion mid-flight is too noisy to snapshot reliably. Playwright visual tests cover **resting end states only**:

1. Section pre-trigger (before pin) — already partly covered by `tests/visual/cogniate-story.spec.ts`.
2. Logo locked (progress ≈ 0.30) — new test.
3. All icons placed (progress ≈ 0.70) — new test.
4. Final blob settled (progress ≈ 1.00) — new test.

The new tests need a way to deterministically force `progressRef.current` to a fixed value. We expose a non-production hook: when `?particleProgress=0.30` is in the URL, `CogniateStory.tsx` skips the ScrollTrigger setup and writes the parsed value to `progressRef.current` once. This is gated by `process.env.NODE_ENV !== "production"` so it can never ship to prod.

The Phase 1 prototype is **not** snapshot-tested (per design doc; it's a throwaway route). Phase 1 acceptance is human-eyeballed at the visual gate.

The vertex shader is not unit-testable in any practical sense (compiled GLSL, GPU output). The silhouette sampling utility, however, is pure JS over an `ImageData` buffer and *is* unit-testable; we'll add a lightweight Vitest-free test using a synthetic `ImageData`.

> **No new test runners.** This project already uses Playwright; we will add visual specs only. The silhouette unit test runs as a Playwright `test()` that creates the `ImageData` in a `page.evaluate` context — keeps tooling minimal.

---

## Phase 1 — Standalone particle prototype

Self-contained build of the particle component and a temporary `/particle-test` playground. Logo silhouette must read unmistakably. Subagent-friendly: no GSAP, no scroll, no integration with other components.

**Files:**
- Create: `app/particle-test/page.tsx` (temporary; removed in Phase 3)
- Create: `app/components/ParticleSwarm.tsx`

### Task 1.1 — Scaffold the temporary playground route

**Files:**
- Create: `app/particle-test/page.tsx`

**Step 1: Create the route file.** Next.js 16 App Router, client component, full-viewport playground.

```tsx
// app/particle-test/page.tsx
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Three/R3F is browser-only; defer SSR.
const ParticleSwarm = dynamic(
  () => import("../components/ParticleSwarm"),
  { ssr: false }
);

export default function ParticleTestPage() {
  const [progress, setProgress] = useState(0);

  return (
    <main className="relative h-screen w-screen bg-bg-secondary">
      <ParticleSwarm
        scrollProgress={progress}
        logoSrc="/assets/story-cogniate-logo.png"
        className="absolute inset-0"
      />

      <div className="pointer-events-auto fixed bottom-6 left-1/2 z-50 flex w-[min(640px,90vw)] -translate-x-1/2 flex-col gap-2 rounded-lg bg-black/60 p-4 text-white backdrop-blur">
        <label className="flex items-center justify-between text-xs uppercase tracking-widest">
          <span>progress</span>
          <span className="tabular-nums">{progress.toFixed(2)}</span>
        </label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={progress}
          onChange={(e) => setProgress(parseFloat(e.target.value))}
          className="w-full accent-white"
        />
        <div className="flex gap-2 text-xs">
          {[0, 0.25, 0.5, 0.75, 1].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setProgress(p)}
              className="rounded border border-white/30 px-2 py-1 hover:bg-white/10"
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
```

> **Why a number prop, not a ref, in the prototype?** State is fine here — there's no scroll loop and React re-renders are cheap at human-scrubbing rates. The shader still reads it via uniform. In Phase 2 we switch to a `MutableRefObject<number>` so the rAF loop can avoid React re-renders.

**Step 2: Verify it builds.**

```bash
pnpm dev
```

Expected: dev server starts without errors. (We'll fill `ParticleSwarm` next; for now expect a "Cannot find module" error pointing at the dynamic import — that's fine, it confirms the route is wired.)

**Step 3: Commit.**

```bash
git add app/particle-test/page.tsx
git commit -m "feat(particle-swarm): scaffold temporary /particle-test playground route"
```

---

### Task 1.2 — Stub `ParticleSwarm` component (component contract + Canvas)

**Files:**
- Create: `app/components/ParticleSwarm.tsx`

**Step 1: Write the bare component skeleton — Canvas + orthographic camera, no particles yet.**

The component accepts a *number* in this phase (state-driven scrubbing); Phase 2 will widen the prop to also accept a ref. Keep the contract narrow for now.

```tsx
// app/components/ParticleSwarm.tsx
"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export interface ParticleSwarmProps {
  /** 0..1 — phase 1 prototype takes a plain number; phase 2 will widen to ref. */
  scrollProgress: number;
  logoSrc: string;
  className?: string;
}

export default function ParticleSwarm({
  scrollProgress,
  logoSrc,
  className,
}: ParticleSwarmProps) {
  return (
    <div className={className}>
      <Canvas
        orthographic
        camera={{ position: [0, 0, 100], near: 0.1, far: 1000, zoom: 1 }}
        dpr={[1, 2]}
        gl={{ antialias: false, alpha: true }}
      >
        <CameraSizer />
        <Particles progress={scrollProgress} logoSrc={logoSrc} />
      </Canvas>
    </div>
  );
}

/** Resize the orthographic camera frustum to match the canvas pixel size,
 *  so 1 scene unit = 1 CSS pixel and origin (0,0) is the canvas centre. */
function CameraSizer() {
  const { camera, size } = useThree();
  useMemo(() => {
    const cam = camera as THREE.OrthographicCamera;
    cam.left = -size.width / 2;
    cam.right = size.width / 2;
    cam.top = size.height / 2;
    cam.bottom = -size.height / 2;
    cam.updateProjectionMatrix();
  }, [camera, size.width, size.height]);
  return null;
}

function Particles({ progress, logoSrc }: { progress: number; logoSrc: string }) {
  // Filled in over the next tasks.
  return null;
}
```

**Step 2: Run dev server, navigate to `/particle-test`.** Confirm page loads with the slider visible and no console errors. The viewport will be empty — that's expected.

```bash
pnpm dev
# open http://localhost:3000/particle-test
```

**Step 3: Commit.**

```bash
git add app/components/ParticleSwarm.tsx
git commit -m "feat(particle-swarm): stub ParticleSwarm with orthographic Canvas + camera sizer"
```

---

### Task 1.3 — Logo silhouette sampler (pure function + smoke test)

**Files:**
- Modify: `app/components/ParticleSwarm.tsx` (add internal `sampleSilhouette` helper)

**Step 1: Read the design-doc spec.** Sampler walks the alpha channel of a 512×512 ImageData rendering of the logo, collects pixel indices with α ≥ 32, picks N samples uniformly with a small jitter, and returns scene-space coordinates centred on (0,0) and scaled to a target rect. Add this as a top-of-file utility:

```ts
/**
 * Sample N positions from an image's opaque pixels.
 * Returns Float32Array of length N*2 in CANVAS pixel space (origin at top-left of the
 * source canvas). Caller is responsible for normalising to scene units.
 */
function sampleAlphaPixels(
  imageData: ImageData,
  count: number,
  alphaThreshold = 32,
  jitterPx = 0.5
): Float32Array {
  const { data, width, height } = imageData;
  const opaque: number[] = []; // packed indices into the image
  for (let i = 0; i < width * height; i++) {
    if (data[i * 4 + 3] >= alphaThreshold) opaque.push(i);
  }
  if (opaque.length === 0) {
    throw new Error("sampleAlphaPixels: source image has no opaque pixels");
  }

  const out = new Float32Array(count * 2);
  for (let n = 0; n < count; n++) {
    // Uniform sampling with replacement is fine for our particle counts.
    const idx = opaque[Math.floor(Math.random() * opaque.length)];
    const x = (idx % width) + (Math.random() - 0.5) * 2 * jitterPx;
    const y = Math.floor(idx / width) + (Math.random() - 0.5) * 2 * jitterPx;
    out[n * 2] = x;
    out[n * 2 + 1] = y;
  }
  return out;
}

/** Load an image and rasterise it to an ImageData buffer of `size`×`size`. */
async function loadImageToImageData(src: string, size = 512): Promise<ImageData> {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = src;
  await img.decode();
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  // Letterbox the source image into the square canvas, preserving aspect.
  const scale = Math.min(size / img.naturalWidth, size / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  ctx.drawImage(img, (size - dw) / 2, (size - dh) / 2, dw, dh);
  return ctx.getImageData(0, 0, size, size);
}
```

**Step 2: Wire it into `Particles` as a one-time useMemo.** We don't render anything yet; just confirm sampling works without throwing.

```tsx
import { useEffect, useState } from "react";

function Particles({ progress, logoSrc }: { progress: number; logoSrc: string }) {
  const [silhouette, setSilhouette] = useState<Float32Array | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadImageToImageData(logoSrc, 512).then((img) => {
      if (cancelled) return;
      const samples = sampleAlphaPixels(img, 6000);
      console.log("[ParticleSwarm] sampled silhouette points:", samples.length / 2);
      setSilhouette(samples);
    });
    return () => { cancelled = true; };
  }, [logoSrc]);

  if (!silhouette) return null;
  return null; // particles next task
}
```

**Step 3: Run dev, open `/particle-test`, check the console.** Expected log:

```
[ParticleSwarm] sampled silhouette points: 6000
```

If you see "source image has no opaque pixels", the asset path is wrong or the PNG is fully white-on-transparent (the file at `public/assets/story-cogniate-logo.png` is white with full alpha, so this should work).

**Step 4: Commit.**

```bash
git add app/components/ParticleSwarm.tsx
git commit -m "feat(particle-swarm): silhouette sampling from PNG alpha channel"
```

---

### Task 1.4 — Build the `THREE.Points` mesh with `position` + `aLogoTarget` attributes

This is the first visible step. We'll seed each particle with a random scattered start position and the silhouette target, plus a `delay` for desync. Wire a basic `ShaderMaterial` that interpolates `scattered → logo` keyed off `uProgress`.

**Files:**
- Modify: `app/components/ParticleSwarm.tsx`

**Step 1: Import what we need + define geometry building helper.**

```ts
import { useEffect, useMemo, useRef, useState } from "react";
```

Inside `Particles`, after `silhouette` is set, build a memoised geometry:

```tsx
function Particles({ progress, logoSrc }: { progress: number; logoSrc: string }) {
  const [silhouette, setSilhouette] = useState<Float32Array | null>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();

  useEffect(() => {
    // ...as before...
  }, [logoSrc]);

  const geometry = useMemo(() => {
    if (!silhouette) return null;
    const count = silhouette.length / 2;
    const geo = new THREE.BufferGeometry();

    // Logo-target attribute: silhouette pixels normalised to scene coordinates.
    // 512×512 source, we'll display at 130×122 px (matches CSS layout).
    const LOGO_W = 130;
    const LOGO_H = 122;
    const aLogoTarget = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // silhouette is in 0..512 px space, centre-aligned.
      const sx = silhouette[i * 2];
      const sy = silhouette[i * 2 + 1];
      // Map [0,512] → [-LOGO_W/2, +LOGO_W/2] (and Y flipped: canvas Y is down, scene Y is up).
      aLogoTarget[i * 3 + 0] = ((sx / 512) - 0.5) * LOGO_W;
      aLogoTarget[i * 3 + 1] = -((sy / 512) - 0.5) * LOGO_H;
      aLogoTarget[i * 3 + 2] = 0;
    }

    // Scattered start: random positions in a wide rect around the logo.
    const SCATTER_W = 1400;
    const SCATTER_H = 600;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * SCATTER_W;
      positions[i * 3 + 1] = (Math.random() - 0.5) * SCATTER_H;
      positions[i * 3 + 2] = 0;
    }

    // Per-particle delay (0..1) so the formation isn't synchronous.
    const aDelay = new Float32Array(count);
    for (let i = 0; i < count; i++) aDelay[i] = Math.random();

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aLogoTarget", new THREE.BufferAttribute(aLogoTarget, 3));
    geo.setAttribute("aDelay", new THREE.BufferAttribute(aDelay, 1));
    return geo;
  }, [silhouette]);
```

**Step 2: Add the shader material with phase-1-only logic (scattered → logo).**

```tsx
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uProgress: { value: 0 },
        uPixelRatio: { value: typeof window !== "undefined" ? window.devicePixelRatio : 1 },
        uSize: { value: 6.0 }, // base particle size in CSS px
      },
      vertexShader: /* glsl */ `
        attribute vec3 aLogoTarget;
        attribute float aDelay;
        uniform float uProgress;
        uniform float uPixelRatio;
        uniform float uSize;

        // Per-particle scattered → logo. Each particle has its own start window.
        void main() {
          float d = aDelay * 0.30; // up to 30% phase offset
          float t = clamp((uProgress - d) / (0.25 - d), 0.0, 1.0);
          // Smoothstep gives a soft ease.
          t = smoothstep(0.0, 1.0, t);
          vec3 pos = mix(position, aLogoTarget, t);

          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = uSize * uPixelRatio;
        }
      `,
      fragmentShader: /* glsl */ `
        // Soft radial sprite, additive-blended.
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float r = length(uv);
          float a = smoothstep(0.5, 0.0, r);   // soft outer falloff
          float core = smoothstep(0.25, 0.0, r); // bright inner core
          float intensity = a * 0.4 + core * 1.0;
          gl_FragColor = vec4(vec3(1.0) * intensity, intensity);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  // Push progress into uniform every frame.
  useFrame(() => {
    if (matRef.current) matRef.current.uniforms.uProgress.value = progress;
  });

  if (!geometry) return null;
  return (
    <points geometry={geometry}>
      <primitive ref={matRef} object={material} attach="material" />
    </points>
  );
}
```

**Step 3: Test.** Open `/particle-test`. Slider at 0 → wide scattered cloud. Slider at 1 → particles converge into the logo silhouette. The result should already look like a luminous "C".

**Visual check criteria (informal at this stage):**
- At progress 0, particles fill a large rectangle with no recognisable shape.
- At progress 1, you see a bright C-shape with a stem, a small ® dot top-right, and the inner detail near the top of the C.
- Particles look like soft luminous dots, not flat squares.

If the logo isn't recognisable: re-check the LOGO_W / LOGO_H values match the rendered size (130×122). If particles look chunky, lower `uSize` to 4.0; if too sparse, raise particle count to 8000 (only if 6000 reads as too thin — design budget says 6000).

**Step 4: Commit.**

```bash
git add app/components/ParticleSwarm.tsx
git commit -m "feat(particle-swarm): scattered→logo formation with additive radial sprites"
```

---

### Task 1.5 — Iterate on visual recognisability

This task has no specific code — it's a designer-eye iteration loop. Tweak in `ParticleSwarm.tsx` until the logo reads unmistakably.

**Knobs to tune:**
- `uSize` (particle base size in CSS px) — 4.0 to 8.0 range. Start at 6.0.
- `uSize` Retina multiplier (`uPixelRatio` is already factored in) — should look identical on 1× and 2× displays.
- Sampling threshold (`alphaThreshold`) — higher (e.g. 64, 96) gives a tighter silhouette; lower includes more soft edges. The asset is white-on-transparent so 32 should be fine.
- Particle count — design says ~6,000. If recognisability needs more, go to 8,000 (still single draw call, still fine). Don't go lower than 6,000.
- `LOGO_W` / `LOGO_H` — must match the CSS render size (130×122) so the formation matches the eventual PNG crossfade rect. Don't change these unless the silhouette looks distorted.
- Fragment shader gradient stops — current 0.5/0.25 split gives moderate halo. Tighten halo (e.g. 0.4/0.2) for sharper individual particles.

**Loop:**

1. Reload `/particle-test`, slide to 1.0.
2. Step back from the screen 2 metres. Is the logo unmistakable?
3. If yes → proceed.
4. If no → tweak one knob, save, reload, step back. Repeat.

Don't go past three iterations before showing the user — over-tuning at this stage is wasted; integration in Phase 2 will shift the visual context.

**Commit only if you actually changed something:**

```bash
git add app/components/ParticleSwarm.tsx
git commit -m "tune(particle-swarm): adjust <whichever knob> for logo recognisability"
```

---

### 🛑 PHASE 1 GATE — show the prototype to the user

Before moving on, leave `pnpm dev` running and tell the user:

> "Phase 1 prototype is ready. Open http://localhost:3000/particle-test and scrub the slider. The visual gate: is the formed logo unmistakably the Cogniate logo? If not, tell me what looks wrong and I'll iterate. If yes, I'll move on to Phase 2 (scroll integration)."

Do not proceed to Phase 2 without explicit user sign-off.

---

## Phase 1 — actual state at handoff (post-iteration)

The prototype went through four user-driven iterations at the visual gate. The component is now richer than the original Phase 1 spec describes. **Phase 2 must compose with this state, not replace it.** This section is the source of truth for what `app/components/ParticleSwarm.tsx` actually contains when Phase 2 begins.

### Geometry attributes

| Attribute | Type | Origin | Phase 2 should… |
|---|---|---|---|
| `position` | vec3 | Box–Muller Gaussian (σ 1100×700) centred at origin | preserve as-is |
| `aLogoTarget` | vec3 | silhouette pixel mapped to 130×122 rect | preserve as-is |
| `aDelay` | float | 0..1 uniform random | preserve as-is (used by both formation delay and drift phase) |
| `aBaseTint` | vec3 | per-particle resting tint from a 50/30/15/5 white/lavender/salmon/mint palette with saturation ramp | **preserve, multiply against cluster tint, do not replace** |

When Phase 2's task 2.2 adds `aIconTarget`, `aArcControl`, `aBlobTarget`, `aTint`, `aPool`, those are *additional* attributes alongside the four above — not substitutions.

### Uniforms

| Uniform | Purpose | Notes |
|---|---|---|
| `uProgress` | 0..1 scroll progress | written every frame from `useFrame` |
| `uTime` | seconds, advanced by `useFrame`'s `delta` | drives firefly drift; Phase 2/3 will reuse it for blob ambient drift |
| `uPixelRatio` | `window.devicePixelRatio` | applied to `gl_PointSize` for Retina |

The original plan had a `uSize` uniform; **it has been removed** because particle size is now phase-modulated in the vertex shader directly. Don't re-introduce it.

### Vertex shader behaviour Phase 2 must extend, not replace

1. **Phase-modulated drift envelope.** Drift amplitude goes 9.0 → 0.4 px on `smoothstep(0.0, 0.30, uProgress)`. Frequencies 1.2–1.4 rad/s. Per-particle phase from `aDelay`. **Phase 2 must extend the envelope through the peel-off, hold, and shift-down phases** — proposed shape: stays at 0.4 during hold (0.65–0.75), rises to ~5–6 during peel-off (0.35–0.65) so transit feels alive, drops back to 0.4 at icon arrival, rises again during shift-down (0.75–1.0), settles at ~3 in the blob (so the hand-off feels alive, not locked).

2. **Phase-modulated `gl_PointSize`.** Goes 9 → 3.5 px on the same envelope as drift. **Phase 2 should keep this at 3.5 (or tighten to 3.0) through phases 2–3 so the icon-arrival flashes stay crisp.** Phase 3's blob may want to ease back to 4–5 to give the cloud volume.

3. **Tighter fragment gradient.** Core radius `smoothstep(0.18, 0.0, r)` (was 0.25 in the original spec). Halo multiplier 0.25 (was 0.4). Don't relax these — Phase 1 needed them tight to avoid the "fuzzy mess" the user flagged.

### Tint composition for Phase 2

The original task 2.3 vertex shader had `vTint = aTint;` and the fragment did `mix(vec3(1.0), vTint, vTintMix)`. **Update that composition to use `aBaseTint` as the base instead of `vec3(1.0)`:**

```glsl
// Phase 2 tint composition — base tint always present, cluster tint blends in via envelope.
varying vec3 vBaseTint;
varying vec3 vClusterTint;
varying float vClusterMix;

// vertex:
vBaseTint = aBaseTint;
vClusterTint = aTint;
vClusterMix = tintEnvelope; // existing envelope from task 2.3

// fragment:
vec3 col = mix(vBaseTint, vClusterTint, vClusterMix);
gl_FragColor = vec4(col * intensity, intensity);
```

This way the resting variation persists across all phases, and the cluster tint dominates only during peel-off.

### Deferred Optional code-review issues (still applicable, tracked in TaskCreate #5)

Phase 2 will modify `ParticleSwarm.tsx` substantially — fold these in opportunistically as the file is touched:

1. **Vertex shader division-near-zero.** `t = clamp((uProgress - d) / (0.25 - d), 0.0, 1.0)` with `d = aDelay * 0.30` — when `aDelay > 0.833`, denominator goes negative. Reduce `aDelay` multiplier to 0.20 so `d_max < window_width`, or split window-width into a separate term.
2. **`getContext("2d")!`** — replace non-null assertion with explicit throw for clearer error.
3. **`console.log("[ParticleSwarm] sampled silhouette points:", …)`** — drop or guard with `NODE_ENV !== "production"` before this ships.
4. **Per-frame `Object.assign` on uniforms.** Try direct `.value = progress` write; if React 19 hook-purity rule actually trips it, revert.

### Final commits at end of Phase 1

```
95ab0a1 feat(particle-swarm): saturation-ramped tint palette with more lavender
1c7f402 feat(particle-swarm): phase-modulated drift+size, crisper sprite, design-system tints
ec79bec feat(particle-swarm): firefly drift, gaussian scatter, per-particle tint variety
6fe890c fix(particle-swarm): dispose old geometry on replacement and surface load errors
5c74988 refactor(particle-swarm): satisfy React 19 hook-purity lint rules
2b4d0e9 feat(particle-swarm): scattered→logo formation with additive radial sprites
212d661 feat(particle-swarm): silhouette sampling from PNG alpha channel
dd1afac feat(particle-swarm): stub ParticleSwarm with orthographic Canvas + camera sizer
a12667e feat(particle-swarm): scaffold temporary /particle-test playground route
```

---

## Phase 2 — Scroll integration

Wire the prototype into the live `CogniateStory` section: pinned ScrollTrigger, four-target piecewise interpolation, DOM crossfades, edge cases.

**Files:**
- Modify: `app/sections/CogniateStory.tsx`
- Modify: `app/components/ParticleSwarm.tsx` (extend props + shader + attributes)

### Task 2.1 — Widen `ParticleSwarm` prop to accept ref OR number

Phase 1 used a state number. Phase 2 needs ref-driven updates so we can update `uProgress` from a rAF loop without re-rendering React.

**Files:**
- Modify: `app/components/ParticleSwarm.tsx`
- Modify: `app/particle-test/page.tsx` (still works — number prop branch)

**Step 1: Update prop type.**

```ts
import type { MutableRefObject } from "react";

export interface ParticleSwarmProps {
  scrollProgress: number | MutableRefObject<number>;
  logoSrc: string;
  iconTargets?: { x: number; y: number; tint: [number, number, number] }[];
  blobCenter?: { x: number; y: number };
  className?: string;
}
```

**Step 2: Resolve in the `useFrame` loop.**

```tsx
useFrame(() => {
  const p = typeof progress === "number" ? progress : progress.current;
  if (matRef.current) matRef.current.uniforms.uProgress.value = p;
});
```

(Pass `progress` from props; rename variable inside `Particles` for clarity.)

**Step 3: Verify `/particle-test` still works.** Slider, scattered → logo, no regressions.

**Step 4: Commit.**

```bash
git add app/components/ParticleSwarm.tsx
git commit -m "feat(particle-swarm): widen scrollProgress prop to accept ref"
```

---

### Task 2.2 — Add per-particle pool/tint/icon-target/blob-target attributes + arc control

Each particle's full attribute set, computed once at geometry build:

| Attribute | Type | Meaning |
|---|---|---|
| `position` | vec3 | scattered start |
| `aLogoTarget` | vec3 | silhouette pixel |
| `aIconTarget` | vec3 | cluster destination (icon centre); for ambient pool, equals logo centre |
| `aArcControl` | vec3 | quadratic-bezier midpoint for the arc sweep from logo to icon |
| `aBlobTarget` | vec3 | final blob position (cluster pools and ambient share this) |
| `aTint` | vec3 | per-particle tint colour |
| `aPool` | float | 0/1/2/3 |
| `aDelay` | float | 0..1 phase offset |

**Files:**
- Modify: `app/components/ParticleSwarm.tsx`

**Step 1: Define icon targets, blob target, and arc-control geometry.**

These are inputs from the parent in production. For the prototype playground we hard-code them so `/particle-test` keeps working standalone:

```ts
// Defaults so /particle-test continues to work without the parent supplying targets.
const DEFAULT_ICON_TARGETS = [
  { x: -307, y: 0,   tint: [0.980, 0.404, 0.486] as [number, number, number] }, // problem (9 o'clock)
  { x: 0,   y: 317, tint: [0.675, 0.486, 0.945] as [number, number, number] }, // mission (12 o'clock)
  { x: 307, y: 0,   tint: [0.408, 0.914, 0.635] as [number, number, number] }, // insight (3 o'clock)
];
const DEFAULT_BLOB_CENTER = { x: 0, y: -130 };
```

These coordinates are relative to the inner-circle centre. They are **scene-units = CSS pixels** at the SVG container's natural aspect ratio. The Phase 2 wiring step (2.5) computes the production values from the actual rendered container's bounding rect.

**Step 2: Build per-particle attributes.** Replace the `useMemo` for geometry:

```ts
const geometry = useMemo(() => {
  if (!silhouette) return null;
  const count = silhouette.length / 2;
  const iconTargets = props.iconTargets ?? DEFAULT_ICON_TARGETS;
  const blob = props.blobCenter ?? DEFAULT_BLOB_CENTER;

  const positions = new Float32Array(count * 3);
  const aLogoTarget = new Float32Array(count * 3);
  const aIconTarget = new Float32Array(count * 3);
  const aArcControl = new Float32Array(count * 3);
  const aBlobTarget = new Float32Array(count * 3);
  const aTint = new Float32Array(count * 3);
  const aPool = new Float32Array(count);
  const aDelay = new Float32Array(count);

  // Pool budget: 1800/1800/1800/600 of 6000.
  const poolSizes = [1800, 1800, 1800, 600];
  let cursor = 0;
  const poolAssignments = new Uint8Array(count);
  for (let p = 0; p < poolSizes.length; p++) {
    for (let k = 0; k < poolSizes[p] && cursor < count; k++) {
      poolAssignments[cursor++] = p;
    }
  }
  // Shuffle so cluster particles aren't spatially correlated in the silhouette.
  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [poolAssignments[i], poolAssignments[j]] = [poolAssignments[j], poolAssignments[i]];
  }

  const LOGO_W = 130, LOGO_H = 122;
  const SCATTER_W = 1400, SCATTER_H = 600;

  for (let i = 0; i < count; i++) {
    // Scattered start
    positions[i * 3 + 0] = (Math.random() - 0.5) * SCATTER_W;
    positions[i * 3 + 1] = (Math.random() - 0.5) * SCATTER_H;

    // Logo target (silhouette pixel)
    const sx = silhouette[i * 2], sy = silhouette[i * 2 + 1];
    const lx = ((sx / 512) - 0.5) * LOGO_W;
    const ly = -((sy / 512) - 0.5) * LOGO_H;
    aLogoTarget[i * 3 + 0] = lx;
    aLogoTarget[i * 3 + 1] = ly;

    const pool = poolAssignments[i];
    aPool[i] = pool;
    aDelay[i] = Math.random();

    // Tint per pool
    if (pool < 3) {
      aTint[i * 3 + 0] = iconTargets[pool].tint[0];
      aTint[i * 3 + 1] = iconTargets[pool].tint[1];
      aTint[i * 3 + 2] = iconTargets[pool].tint[2];
    } else {
      aTint[i * 3 + 0] = 1;
      aTint[i * 3 + 1] = 1;
      aTint[i * 3 + 2] = 1;
    }

    // Icon target — cluster pools peel off; ambient stays at logo
    const icon = pool < 3 ? iconTargets[pool] : { x: lx, y: ly };
    // Per-particle jitter so the cluster blooms into a halo, not a single point.
    const jitter = pool < 3 ? 30 : 0;
    const ix = icon.x + (Math.random() - 0.5) * jitter;
    const iy = icon.y + (Math.random() - 0.5) * jitter;
    aIconTarget[i * 3 + 0] = ix;
    aIconTarget[i * 3 + 1] = iy;

    // Arc control: midpoint between logo and icon, pushed outward radially from
    // the inner-circle centre (origin). For ambient pool, keep equal to logoTarget
    // so the bezier reduces to no-op.
    if (pool < 3) {
      const mx = (lx + ix) / 2;
      const my = (ly + iy) / 2;
      const r = Math.hypot(mx, my);
      // Push outward by ~40% of inner-circle radius (~125 → 50 px push).
      const push = 50;
      const ux = r > 0 ? mx / r : 0;
      const uy = r > 0 ? my / r : 0;
      aArcControl[i * 3 + 0] = mx + ux * push;
      aArcControl[i * 3 + 1] = my + uy * push;
    } else {
      aArcControl[i * 3 + 0] = lx;
      aArcControl[i * 3 + 1] = ly;
    }

    // Blob target — cluster around blob centre with jitter.
    const blobR = pool < 3 ? 60 : 80; // ambient pool slightly looser
    const theta = Math.random() * Math.PI * 2;
    const rad = Math.sqrt(Math.random()) * blobR;
    aBlobTarget[i * 3 + 0] = blob.x + Math.cos(theta) * rad;
    aBlobTarget[i * 3 + 1] = blob.y + Math.sin(theta) * rad;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("aLogoTarget", new THREE.BufferAttribute(aLogoTarget, 3));
  geo.setAttribute("aIconTarget", new THREE.BufferAttribute(aIconTarget, 3));
  geo.setAttribute("aArcControl", new THREE.BufferAttribute(aArcControl, 3));
  geo.setAttribute("aBlobTarget", new THREE.BufferAttribute(aBlobTarget, 3));
  geo.setAttribute("aTint", new THREE.BufferAttribute(aTint, 3));
  geo.setAttribute("aPool", new THREE.BufferAttribute(aPool, 1));
  geo.setAttribute("aDelay", new THREE.BufferAttribute(aDelay, 1));
  return geo;
}, [silhouette, props.iconTargets, props.blobCenter]);
```

**Step 3: Don't change shader yet — geometry has new attributes but old vertex shader ignores them.** Verify `/particle-test` still shows scatter→logo correctly. If broken, you've got a TS or attribute mismatch error in the console.

**Step 4: Commit.**

```bash
git add app/components/ParticleSwarm.tsx
git commit -m "feat(particle-swarm): add pool/tint/icon-target/blob-target/arc-control attributes"
```

---

### Task 2.3 — Extend the vertex shader with the four-phase piecewise interp

This is the meat of the choreography. Implement all four phases in GLSL, keyed off `uProgress` and `aPool`.

**Files:**
- Modify: `app/components/ParticleSwarm.tsx`

**Step 1: Replace the vertex shader.** Drop in the full piecewise interpolation:

```glsl
attribute vec3 aLogoTarget;
attribute vec3 aIconTarget;
attribute vec3 aArcControl;
attribute vec3 aBlobTarget;
attribute vec3 aTint;
attribute float aPool;
attribute float aDelay;

uniform float uProgress;
uniform float uPixelRatio;
uniform float uSize;

varying vec3 vTint;
varying float vTintMix;

// Phase windows (constants):
//   Phase 1 — scatter→logo:        0.00 → 0.25
//   Phase 2a — peel-off begins:    0.35 (problem), 0.40 (mission), 0.45 (insight)
//   Phase 2b — arrival:            0.50 (problem), 0.55 (mission), 0.60 (insight)
//   Phase 3 — hold:                0.65 → 0.75
//   Phase 4 — drift to blob:       0.75 → 1.00

void main() {
  float p = uProgress;

  // PHASE 1: scattered → logo silhouette, with per-particle delay window
  float d = aDelay * 0.05; // up to 5% of progress as offset
  float t1 = smoothstep(0.0 + d, 0.20 + d, p);
  vec3 pos1 = mix(position, aLogoTarget, t1);

  // PHASE 2: per-pool peel-off via quadratic bezier (logo → arcControl → icon)
  // Ambient pool (3) stays at logoTarget through this phase.
  float poolStart = 0.35 + aPool * 0.05;       // 0.35/0.40/0.45 (3 → 0.50, but ambient skipped)
  float poolEnd   = poolStart + 0.15;          // 0.50/0.55/0.60
  float t2 = smoothstep(poolStart, poolEnd, p);
  // Disable phase 2 for ambient pool
  t2 = mix(t2, 0.0, step(2.5, aPool));
  // Bezier: B(t) = (1-t)² P0 + 2(1-t)t P1 + t² P2
  vec3 bez =
      (1.0 - t2) * (1.0 - t2) * aLogoTarget
    + 2.0 * (1.0 - t2) * t2 * aArcControl
    + t2 * t2 * aIconTarget;

  // Combine 1 and 2: after phase 1 ends, we're at logoTarget; phase 2 then sweeps to icon.
  vec3 pos2 = mix(pos1, bez, step(0.25, p));

  // PHASE 3 (hold) — implicit: 0.65 < p < 0.75 sees t2 saturated at 1, so pos = aIconTarget.

  // PHASE 4: drift to blob.
  // Cluster pools start from icon; ambient pool starts from logo (pos1 already).
  // Use stored t2 to pick start point.
  vec3 phase4Start = mix(aLogoTarget, aIconTarget, step(0.5, t2));
  float t4 = smoothstep(0.75, 1.00, p);
  vec3 pos4 = mix(phase4Start, aBlobTarget, t4);

  // Pick the right phase output based on progress.
  vec3 pos = pos2;
  if (p > 0.75) pos = pos4;

  // Tint mixing:
  //   - White from 0 to phase 2 start
  //   - Fade to tint as the cluster peels off
  //   - Fade back to white as it nears the icon (icon halo is white)
  //   - Ambient pool: always white
  float tintEnvelope = smoothstep(poolStart, poolStart + 0.05, p)
                     - smoothstep(poolEnd - 0.05, poolEnd, p);
  tintEnvelope = mix(tintEnvelope, 0.0, step(2.5, aPool)); // ambient stays white
  vTint = aTint;
  vTintMix = tintEnvelope;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uPixelRatio;
}
```

**Step 2: Replace the fragment shader to use the tint.**

```glsl
varying vec3 vTint;
varying float vTintMix;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float r = length(uv);
  float a = smoothstep(0.5, 0.0, r);
  float core = smoothstep(0.25, 0.0, r);
  float intensity = a * 0.4 + core * 1.0;
  vec3 baseCol = mix(vec3(1.0), vTint, vTintMix);
  gl_FragColor = vec4(baseCol * intensity, intensity);
}
```

**Step 3: Test in `/particle-test`.** Scrub the slider:
- 0.00 → wide scattered cloud, white.
- 0.25 → logo formed, white.
- 0.30 → still logo, white (hold).
- 0.40 → problem cluster peeling off toward the warning icon position (left), tinted salmon.
- 0.50 → problem cluster has arrived; mission cluster (purple) mid-flight up.
- 0.65 → all three clusters at their icon positions, ambient pool still on logo.
- 0.85 → everything drifting toward blob below logo.
- 1.00 → tight glowing blob below the logo.

If clusters arrive at the wrong place, double-check `DEFAULT_ICON_TARGETS` (sign convention: scene Y is up, so flag at 12 o'clock is `+317`, not `-317`).

**Step 4: Commit.**

```bash
git add app/components/ParticleSwarm.tsx
git commit -m "feat(particle-swarm): four-phase piecewise vertex shader (scatter/logo/clusters/blob)"
```

---

### Task 2.4 — Compute production icon/blob targets from parent layout

In Phase 2 production, `iconTargets` and `blobCenter` are derived from the actual rendered SVG container's bounding rect at runtime. This task moves the computation into `CogniateStory.tsx`.

**Files:**
- Modify: `app/sections/CogniateStory.tsx`

**Step 1: Add a helper that converts the layout's percentage anchors into scene units (CSS pixels relative to inner-circle centre).**

```tsx
// Top of file, outside component.
const PERCENT_ANCHORS = {
  logoCenter:  { left: 50.4,    top: 50.0    },
  problem:     { left: 32.0157, top: 49.9562 },
  mission:     { left: 50.4449, top: 0.0957  },
  insight:     { left: 68.8741, top: 49.9562 },
  blob:        { left: 50.4,    top: 76.0    },
} as const;

function computeSwarmTargets(containerRect: DOMRect) {
  const { width, height } = containerRect;
  const px = (left: number, top: number) => ({
    x: (left / 100) * width  - (PERCENT_ANCHORS.logoCenter.left / 100) * width,
    y: -((top  / 100) * height - (PERCENT_ANCHORS.logoCenter.top  / 100) * height),
  });
  return {
    iconTargets: [
      { ...px(PERCENT_ANCHORS.problem.left, PERCENT_ANCHORS.problem.top), tint: [0.980, 0.404, 0.486] as [number, number, number] },
      { ...px(PERCENT_ANCHORS.mission.left, PERCENT_ANCHORS.mission.top), tint: [0.675, 0.486, 0.945] as [number, number, number] },
      { ...px(PERCENT_ANCHORS.insight.left, PERCENT_ANCHORS.insight.top), tint: [0.408, 0.914, 0.635] as [number, number, number] },
    ],
    blobCenter: px(PERCENT_ANCHORS.blob.left, PERCENT_ANCHORS.blob.top),
  };
}
```

**Step 2: Wire it into a state ref + recompute on resize.** We'll do this together with the ScrollTrigger setup in the next task — for now just commit the helper.

**Step 3: Commit.**

```bash
git add app/sections/CogniateStory.tsx
git commit -m "feat(cogniate-story): helper to compute particle swarm targets from container rect"
```

---

### Task 2.5 — Replace per-icon ScrollTriggers with one pinned trigger + progress ref

This is the central integration step. Tear out the existing fade+scale animations, install a single pinned ScrollTrigger over the desktop layout, and write `self.progress` into a ref each frame.

**Files:**
- Modify: `app/sections/CogniateStory.tsx`

**Step 1: Add refs and the desktop layout container ref.**

```tsx
const desktopLayoutRef = useRef<HTMLDivElement>(null);
const progressRef = useRef(0);
const [swarmTargets, setSwarmTargets] = useState<{
  iconTargets: { x: number; y: number; tint: [number, number, number] }[];
  blobCenter: { x: number; y: number };
} | null>(null);
```

Attach `desktopLayoutRef` to the existing `<div className="hidden lg:block ...">` wrapper around the SVG container.

**Step 2: Replace the existing `useEffect` that runs ScrollTriggers.**

```tsx
useEffect(() => {
  const desktop = desktopLayoutRef.current;
  const heading = headingRef.current;
  if (!desktop || !heading) return;

  // Heading fade — keep the existing simple trigger.
  const ctx = gsap.context(() => {
    gsap.fromTo(
      heading,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 0.8, ease: "power2.out",
        scrollTrigger: { trigger: desktop, start: "top 80%", toggleActions: "play none none none" },
      }
    );

    // Reduced motion → bail out of pin + particles, fade icons in via simple trigger.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      gsap.fromTo(
        desktop.querySelectorAll<HTMLElement>("[data-particle-fade]"),
        { opacity: 0 },
        {
          opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out",
          scrollTrigger: { trigger: desktop, start: "top 70%", toggleActions: "play none none none" },
        }
      );
      progressRef.current = 1; // park at end state
      return;
    }

    // Desktop pinned scrub trigger.
    ScrollTrigger.create({
      trigger: desktop,
      start: "top center",
      end: "+=150%",
      pin: true,
      scrub: 1,
      onUpdate: (self) => { progressRef.current = self.progress; },
      onRefresh: () => {
        const rect = desktop.querySelector(".story-circles-container")?.getBoundingClientRect();
        if (rect) setSwarmTargets(computeSwarmTargets(rect));
      },
    });

    // Initial compute
    const rect = desktop.querySelector(".story-circles-container")?.getBoundingClientRect();
    if (rect) setSwarmTargets(computeSwarmTargets(rect));
  }, desktop);

  return () => ctx.revert();
}, []);
```

**Step 3: Add the `story-circles-container` class** to the inner `<div>` that holds the SVG (the `style={{ maxWidth: 1700, aspectRatio: "1718 / 635" }}` div), plus `data-particle-fade` attributes on the logo and icon elements (used only by the reduced-motion branch).

**Step 4: Tear out the per-icon `iconRefs` fade+scale block** that already exists in the file. Keep the array assignments (we'll reuse them in the next task to set CSS opacity by ref).

**Step 5: Verify `pnpm dev` builds and the page loads.** No particles will be visible yet because we haven't mounted `ParticleSwarm` in the section. Confirm:
- The desktop layout pins on scroll (you'll see the section freeze).
- The page un-pins at the end (you can scroll past).
- Console: no errors.

**Step 6: Commit.**

```bash
git add app/sections/CogniateStory.tsx
git commit -m "feat(cogniate-story): replace per-icon triggers with single pinned scrub"
```

---

### Task 2.6 — Mount `ParticleSwarm` inside the desktop layout

**Files:**
- Modify: `app/sections/CogniateStory.tsx`

**Step 1: Dynamically import ParticleSwarm with SSR off** (Three.js is browser-only).

```tsx
import dynamic from "next/dynamic";

const ParticleSwarm = dynamic(
  () => import("../components/ParticleSwarm"),
  { ssr: false }
);
```

**Step 2: Render it inside the SVG container.**

Inside `<div className="story-circles-container">`, add (above the existing absolute children):

```tsx
{swarmTargets && (
  <ParticleSwarm
    scrollProgress={progressRef}
    logoSrc="/assets/story-cogniate-logo.png"
    iconTargets={swarmTargets.iconTargets}
    blobCenter={swarmTargets.blobCenter}
    className="absolute inset-0 pointer-events-none"
  />
)}
```

> The `pointer-events-none` matters: the Canvas element overlays the SVG and would otherwise eat clicks meant for the icons.

**Step 3: Test scroll integration.** Scroll into the section. The pin engages, particles scatter→logo→clusters→blob as you scroll. The DOM logo PNG and icons are still visible the whole time (we haven't crossfaded them yet — that's the next task).

**Step 4: Commit.**

```bash
git add app/sections/CogniateStory.tsx
git commit -m "feat(cogniate-story): mount ParticleSwarm inside desktop layout"
```

---

### Task 2.7 — Crossfade the logo PNG and icons against the same `progressRef`

DOM elements need their opacity driven by the same scroll progress, but without React re-renders. We use a rAF loop that writes CSS variables on the desktop layout root, and CSS rules read those.

**Files:**
- Modify: `app/sections/CogniateStory.tsx`

**Step 1: Add the rAF loop.**

```tsx
useEffect(() => {
  const desktop = desktopLayoutRef.current;
  if (!desktop) return;
  let rafId = 0;
  let stopped = false;

  const tick = () => {
    if (stopped) return;
    if (!document.hidden) {
      const p = progressRef.current;
      desktop.style.setProperty("--logo-opacity",     String(clamp(p, 0.25, 0.35, 0, 1)));
      desktop.style.setProperty("--icon-problem-opacity", String(clamp(p, 0.45, 0.55, 0, 1)));
      desktop.style.setProperty("--icon-mission-opacity", String(clamp(p, 0.50, 0.60, 0, 1)));
      desktop.style.setProperty("--icon-insight-opacity", String(clamp(p, 0.55, 0.65, 0, 1)));
      // Tooltips: only available once the icon is fully placed AND the section is in hold or after
      desktop.style.setProperty("--tooltip-pointer", p > 0.65 ? "auto" : "none");
    }
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);
  return () => { stopped = true; cancelAnimationFrame(rafId); };
}, []);

// helper
function clamp(p: number, fromIn: number, fromOut: number, toIn: number, toOut: number) {
  if (p <= fromIn) return toIn;
  if (p >= fromOut) return toOut;
  const t = (p - fromIn) / (fromOut - fromIn);
  return toIn + (toOut - toIn) * t;
}
```

**Step 2: Wire CSS variables to the relevant elements.** Add inline style overrides to the logo and each icon's wrapper:

```tsx
// Logo wrapper
<div
  className="absolute -translate-x-1/2 -translate-y-1/2"
  style={{
    left: "50.4%", top: "50%", width: 130, height: 122,
    opacity: "var(--logo-opacity, 0)",
    transition: "opacity 0.05s linear",
  }}
>
  ...
</div>
```

For each icon, replace the existing wrapper opacity with a CSS variable:

```tsx
// Problem icon wrapper
<div
  ref={(el) => { iconRefs.current[0] = el; }}
  className="absolute -translate-x-1/2 -translate-y-1/2"
  style={{
    left: "32.0157%", top: "49.9562%",
    opacity: "var(--icon-problem-opacity, 0)",
    pointerEvents: "var(--tooltip-pointer, none)" as React.CSSProperties["pointerEvents"],
  }}
>
```

(Same pattern for mission/insight, adjusting CSS var names.)

**Step 3: Test.** Scroll into section. As progress crosses each window, the corresponding DOM element fades up. The logo PNG appears around 25–35% (right when the particle silhouette is locked). Icons crossfade in matching their cluster's arrival window.

**Step 4: Commit.**

```bash
git add app/sections/CogniateStory.tsx
git commit -m "feat(cogniate-story): crossfade logo PNG and icons via progress-driven CSS vars"
```

---

### Task 2.8 — Tab visibility pause for the GPU loop

`useFrame` from R3F automatically pauses when the canvas is offscreen, but we want explicit pause when the tab is hidden too, to avoid burning the GPU on a paused scroll position.

**Files:**
- Modify: `app/components/ParticleSwarm.tsx`

**Step 1: Pause `useFrame` work when `document.hidden`.** Cheapest option: skip the uniform write.

```tsx
useFrame(() => {
  if (typeof document !== "undefined" && document.hidden) return;
  const p = typeof progress === "number" ? progress : progress.current;
  if (matRef.current) matRef.current.uniforms.uProgress.value = p;
});
```

**Step 2: Confirm by switching tabs and back.** The animation should resume cleanly on focus.

**Step 3: Commit.**

```bash
git add app/components/ParticleSwarm.tsx
git commit -m "fix(particle-swarm): skip uniform write when document.hidden"
```

---

### Task 2.9 — Mobile bypass + reduced-motion bypass verification

The reduced-motion branch was set up in Task 2.5. Mobile already bypasses the particle system because the entire `ParticleSwarm` mount lives inside the `lg:block` desktop branch. This task is **verification**, not new code.

**Files:**
- (no changes if all verifications pass)

**Step 1: Resize the browser to <1024px.** Confirm:
- No pinning of the section.
- Mobile vertical stack with existing accordion behaviour intact.
- No `Canvas` element in the DOM.

**Step 2: Toggle `prefers-reduced-motion: reduce` in DevTools rendering panel.** Reload. Confirm:
- No pinning.
- Logo + icons fade in via `top 70%` simple trigger.
- No `Canvas` element in the DOM (or it's mounted but receives `progress=1` immediately — either is acceptable, the design doc says "skip the pin"; we skipped both).
- Tooltips still hover-interactive.

If something doesn't match, fix it before moving on. Most likely cause of failure: forgot to set `progressRef.current = 1` in the reduced-motion branch, leaving icons at opacity 0.

**Step 3: Commit only if changes were needed.**

```bash
git add app/sections/CogniateStory.tsx
git commit -m "fix(cogniate-story): <whatever you fixed>"
```

---

### 🛑 PHASE 2 GATE — show the integrated section

Run `pnpm dev`, scroll into the Cogniate Story section, and tell the user:

> "Phase 2 (scroll integration) is done. The section pins, particles scatter→logo→clusters→blob, the logo PNG and icons crossfade in at the right moments. Mobile and reduced-motion bypass the particles. Phase 3 is polish + visual snapshots — should I proceed?"

Wait for sign-off before Phase 3.

---

## Phase 3 — Polish + final blob hand-off

Tighten the choreography, add Playwright visual coverage, remove the prototype route, do a perf pass.

### Task 3.1 — Tune cluster path arcs (CCW vs CW) per design doc

The design doc specifies CCW for problem (9 o'clock) and mission (12 o'clock), CW for insight (3 o'clock). Our current arc-control code pushes the bezier midpoint outward radially, which gives a smooth arc but doesn't enforce direction. To match the spec we bias the arc-control's tangent.

**Files:**
- Modify: `app/components/ParticleSwarm.tsx`

**Step 1: Update arc-control computation in the geometry build.**

Replace the `pool < 3` branch:

```ts
if (pool < 3) {
  // CCW for problem (pool 0) and mission (pool 1); CW for insight (pool 2).
  const ccw = pool < 2 ? 1 : -1;
  const mx = (lx + ix) / 2;
  const my = (ly + iy) / 2;
  // Perpendicular to the chord, biased to enforce sweep direction.
  const cx = ix - lx;
  const cy = iy - ly;
  const len = Math.hypot(cx, cy);
  const px = len > 0 ? (-cy / len) * ccw : 0;
  const py = len > 0 ? ( cx / len) * ccw : 0;
  // Push perpendicular by a fraction of the inner-circle radius.
  const push = 80;
  aArcControl[i * 3 + 0] = mx + px * push;
  aArcControl[i * 3 + 1] = my + py * push;
}
```

**Step 2: Test.** Scrub progress 0.35→0.65 and watch the clusters. Problem and mission should sweep counter-clockwise; insight clockwise. Not rigorous parametric arcs but visually they trace a curve along the inner-circle's vibe.

**Step 3: Commit.**

```bash
git add app/components/ParticleSwarm.tsx
git commit -m "feat(particle-swarm): direction-biased arc paths (CCW for problem/mission, CW for insight)"
```

---

### Task 3.2 — Tune the final blob: ambient drift, density, position

The blob is a hand-off for a future video reveal. It must look "ready to dissolve" — soft, drifting, not locked.

**Files:**
- Modify: `app/components/ParticleSwarm.tsx`

**Step 1: Add `uTime` uniform and a small time-based drift offset in the vertex shader, only active in phase 4.**

```ts
// In the material uniforms:
uniforms: {
  uProgress: { value: 0 },
  uTime: { value: 0 },
  uPixelRatio: { ... },
  uSize: { ... },
},
```

In `useFrame`:

```tsx
useFrame((_state, delta) => {
  if (typeof document !== "undefined" && document.hidden) return;
  if (!matRef.current) return;
  const p = typeof progress === "number" ? progress : progress.current;
  matRef.current.uniforms.uProgress.value = p;
  matRef.current.uniforms.uTime.value += delta;
});
```

Vertex shader (after `pos4` is assigned):

```glsl
// Soft drift inside the blob (only when fully settled).
float driftAmount = smoothstep(0.85, 1.00, p);
float seed = aDelay * 6.2831853;
vec2 drift = vec2(
  sin(uTime * 0.4 + seed) * 4.0,
  cos(uTime * 0.5 + seed) * 4.0
);
pos4.xy += drift * driftAmount;
```

**Step 2: Verify blob position.** Open the section, scroll to progress 1.0. Eyeball: the blob centre should sit just inside the bottom edge of the inner circle (the circle of radius 168.3 in the SVG, which corresponds to roughly y = -130 in scene units relative to inner-circle centre). If the blob is too high/low/wide, tune `PERCENT_ANCHORS.blob.top` in `CogniateStory.tsx`.

**Step 3: Commit.**

```bash
git add app/components/ParticleSwarm.tsx
git commit -m "feat(particle-swarm): ambient drift on settled blob via uTime"
```

---

### Task 3.3 — Top-up emission during shift-down phase

Design doc: "A fresh emission from the logo position during the shift-down phase tops up the final blob's mass so it reads as a substantial cloud, not a thin remnant."

This is a nuance — implementable in two ways: (a) add a fifth pool of "late emission" particles that don't appear until phase 4 starts, or (b) have ambient pool start fading in at phase 4. The cheap route is (a): during geometry build, mark a slice of ambient pool as "late emission" — they render at logo-target during phases 1–3 but stay at zero opacity, then fade in at phase 4 start.

**Files:**
- Modify: `app/components/ParticleSwarm.tsx`

**Step 1: Re-check whether the blob already reads dense enough.**

Open `/` in dev, scroll to 1.0, look at the blob. With the current 600 ambient particles plus 5,400 cluster particles converging into the blob, the cloud should already be dense. If it looks fine, skip this task.

If it looks thin: implement late-emission via opacity fade-in in the fragment shader, gated on a per-particle "late" flag. Quick path:

```ts
// In geometry build, add aLate attribute. Mark last 1000 ambient particles as late.
const aLate = new Float32Array(count);
for (let i = 0; i < count; i++) {
  aLate[i] = aPool[i] === 3 && i % 2 === 0 ? 1.0 : 0.0; // half of ambient
}
geo.setAttribute("aLate", new THREE.BufferAttribute(aLate, 1));
```

```glsl
attribute float aLate;
varying float vOpacity;

// In main():
float lateFade = mix(1.0, smoothstep(0.75, 0.95, p), aLate);
vOpacity = lateFade;
```

```glsl
// fragment:
varying float vOpacity;
gl_FragColor = vec4(baseCol * intensity * vOpacity, intensity * vOpacity);
```

**Step 2: Test, commit only if a change was made.**

```bash
git add app/components/ParticleSwarm.tsx
git commit -m "feat(particle-swarm): late-emission fade-in to thicken final blob"
```

---

### Task 3.4 — Add visual snapshot tests (resting end states)

**Files:**
- Modify: `app/sections/CogniateStory.tsx` (test-mode hook)
- Create: `tests/visual/cogniate-story-particle-swarm.spec.ts`

**Step 1: Add the test-mode progress hook to `CogniateStory.tsx`.**

In the `useEffect` that sets up ScrollTrigger, before the trigger is created:

```tsx
// Test-mode hook: ?particleProgress=0.30 forces progressRef and skips the pin.
// Dev-only — gated on NODE_ENV.
if (process.env.NODE_ENV !== "production") {
  const url = new URL(window.location.href);
  const forced = url.searchParams.get("particleProgress");
  if (forced != null) {
    const v = Math.max(0, Math.min(1, parseFloat(forced)));
    progressRef.current = v;
    const rect = desktop.querySelector(".story-circles-container")?.getBoundingClientRect();
    if (rect) setSwarmTargets(computeSwarmTargets(rect));
    return; // do not set up the pinned trigger in test mode
  }
}
```

**Step 2: Write the spec file.**

```ts
// tests/visual/cogniate-story-particle-swarm.spec.ts
import { test, expect } from "@playwright/test";

const cases = [
  { name: "pre-trigger",   query: "0.0",  threshold: 0.05 },
  { name: "logo-locked",   query: "0.30", threshold: 0.05 },
  { name: "icons-placed",  query: "0.70", threshold: 0.05 },
  { name: "blob-settled",  query: "1.0",  threshold: 0.05 },
];

for (const { name, query, threshold } of cases) {
  test(`cogniate story particle swarm — ${name}`, async ({ page }) => {
    await page.goto(`/?particleProgress=${query}`);
    const section = page.locator('[data-testid="cogniate-story-section"]');
    await section.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.fonts.ready);
    // Allow one rAF tick to flush CSS variable writes.
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(r)));
    // For settled state, allow time for blob's drift cycle to be at a stable phase.
    if (name === "blob-settled") await page.waitForTimeout(300);
    await expect(section).toHaveScreenshot(`cogniate-story-particle-${name}.png`, {
      maxDiffPixelRatio: threshold,
    });
  });
}
```

> **Note on the drifting blob snapshot:** The ambient drift uses `uTime`, which advances per frame. Snapshots will fluctuate slightly. Three options: (a) freeze `uTime` in test mode, (b) raise `maxDiffPixelRatio`, (c) snapshot at a deterministic time. Easiest: freeze `uTime` when `?particleProgress` is set.

In `ParticleSwarm.tsx`, expose a way to freeze time:

```tsx
useFrame((_state, delta) => {
  if (typeof document !== "undefined" && document.hidden) return;
  if (!matRef.current) return;
  const p = typeof progress === "number" ? progress : progress.current;
  matRef.current.uniforms.uProgress.value = p;
  // Skip uTime advance in test mode (URL flag).
  const isTestMode = typeof window !== "undefined"
    && new URL(window.location.href).searchParams.has("particleProgress");
  if (!isTestMode) matRef.current.uniforms.uTime.value += delta;
});
```

**Step 3: Generate snapshots.**

```bash
pnpm test:visual:update -- cogniate-story-particle-swarm
```

Inspect the generated PNGs in `tests/visual/cogniate-story-particle-swarm.spec.ts-snapshots/`. They should match the four resting states. If they don't, fix the section, regenerate.

**Step 4: Run the suite to verify it passes deterministically.**

```bash
pnpm test:visual -- cogniate-story-particle-swarm
```

Expected: 4 passes.

**Step 5: Commit.**

```bash
git add tests/visual/cogniate-story-particle-swarm.spec.ts tests/visual/cogniate-story-particle-swarm.spec.ts-snapshots/ app/sections/CogniateStory.tsx app/components/ParticleSwarm.tsx
git commit -m "test(cogniate-story): visual snapshots for particle swarm resting states"
```

---

### Task 3.5 — Manual cross-browser + perf check

This is hands-on; no code change unless something fails.

**Step 1: Open `/` in latest Chrome, scroll the section.** Confirm 60fps via DevTools Performance tab. Look for: long-frame warnings, GPU memory growth, layout thrashing.

**Step 2: Open in Safari, repeat.** Pay attention to: shader compilation hiccups, blending differences (Safari sometimes renders additive transparency differently).

**Step 3: Open in Firefox, repeat.**

**Step 4: Open on a real iPhone via local network.** Run the dev server with `pnpm dev --hostname 0.0.0.0` and load on the phone. The mobile path should bypass the particle system; confirm by inspecting the page (no `<canvas>` in `lg:block`).

**Step 5: Note any issues.** Common fixes:
- Safari additive blending too dim → increase fragment shader `intensity` multiplier.
- Chrome jank on scroll → check that `useFrame` isn't allocating per frame (look for `new` calls).

If everything passes, no commit. If you fixed something, commit with a descriptive message.

---

### Task 3.6 — Remove the temporary `/particle-test` route

**Files:**
- Delete: `app/particle-test/page.tsx`

**Step 1: Delete the file.**

```bash
rm app/particle-test/page.tsx
rmdir app/particle-test
```

**Step 2: Confirm nothing else references the route.** It's a temp playground, so nothing should:

```bash
grep -r "particle-test" app/ tests/ docs/ 2>/dev/null
```

Should return only this plan document. If anything else references it, remove the references.

**Step 3: Confirm `ParticleSwarm` still has its DEFAULT_ICON_TARGETS / DEFAULT_BLOB_CENTER fallbacks.** They're still useful for development — keep them.

> Actually, reconsider: the DEFAULTs were for the prototype to work standalone. Without `/particle-test`, the only consumer is `CogniateStory.tsx`, which always passes targets. Remove the defaults to simplify.

```ts
// Drop DEFAULT_ICON_TARGETS and DEFAULT_BLOB_CENTER.
// Tighten props: targets and blobCenter are now required.
export interface ParticleSwarmProps {
  scrollProgress: MutableRefObject<number>;
  logoSrc: string;
  iconTargets: { x: number; y: number; tint: [number, number, number] }[];
  blobCenter: { x: number; y: number };
  className?: string;
}
```

**Step 4: Verify build passes.**

```bash
pnpm lint
pnpm build
```

Expected: no errors. (We dropped the `number` branch of the prop too — it's fine, only `CogniateStory.tsx` consumes it now and it always passes a ref.)

**Step 5: Commit.**

```bash
git add -A
git commit -m "chore(particle-swarm): remove temporary /particle-test route and prototype fallbacks"
```

---

### Task 3.7 — Final verification pass

**Step 1: Full local check.**

```bash
pnpm lint
pnpm build
pnpm test:visual
```

All three must pass. The build especially — Three.js + R3F can hit SSR errors if the dynamic import was missed somewhere.

**Step 2: Re-read the design doc** (`docs/plans/2026-04-30-cogniate-story-particle-swarm-design.md`) and compare each section against the implementation. Tick off:

- [x] Choreography table mapped to phase windows
- [x] Cluster colours match design glow colours
- [x] Cluster paths swept along inner-circle arc with correct CCW/CW
- [x] One THREE.Points mesh, single draw call (verify in DevTools Spector or console: `gl.drawArrays` called once per frame)
- [x] Mobile bypass
- [x] `prefers-reduced-motion` bypass
- [x] Tab-visibility pause
- [x] Cleanup on unmount (gsap.context revert)
- [x] Resize handled via ScrollTrigger.refresh
- [x] Logo silhouette sampled from PNG alpha
- [x] Final blob position centred below logo, just inside bottom of inner circle
- [x] Visual snapshots for 4 resting states

**Step 3: Final commit if any tweaks were made.**

The branch is now ready for the user to merge / open a PR. Per the user's direction at session start: do not merge or open a PR; the user handles that.

> **Summary message to the user at end of Phase 3:**
> "All three phases complete. Plan-vs-impl checklist passes. `pnpm lint`, `pnpm build`, and `pnpm test:visual` all green. The temporary `/particle-test` route is removed. Branch is ready for review and merge — I'll leave that to you."

---

## Done-when summary (one-glance)

| Phase | Done when |
|---|---|
| 1 | Slider on `/particle-test` reaches a recognisable Cogniate logo silhouette. User signs off. |
| 2 | Section pins, particles run scatter→logo→clusters→blob, DOM crossfades match. Mobile + reduced-motion bypass. User signs off. |
| 3 | Four Playwright snapshots green. Cross-browser perf check passes. Prototype route removed. Lint + build clean. |

## Files changed at end of feature

- Modified: `app/sections/CogniateStory.tsx`
- New: `app/components/ParticleSwarm.tsx`
- New: `tests/visual/cogniate-story-particle-swarm.spec.ts` + snapshots dir
- (Removed before merge: `app/particle-test/page.tsx`)

## Out of scope (next ticket)

- Background video reveal that scrubs through on continued scroll past 100%.
- Particle blob dissolving into the video frame.
