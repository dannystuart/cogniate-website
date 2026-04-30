"use client";

import { useEffect, useState, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export interface IconTarget {
  /** Scene-space pixel position relative to inner-circle centre (origin). */
  x: number;
  y: number;
  /** Cluster tint as linear 0..1 vec3 (e.g. salmon, lavender, mint). */
  tint: [number, number, number];
}

export interface ParticleSwarmProps {
  /** 0..1 — number (e.g. test fixtures) or ref (production rAF, no re-renders). */
  scrollProgress: number | MutableRefObject<number>;
  logoSrc: string;
  iconTargets: readonly IconTarget[];
  blobCenter: { x: number; y: number };
  /** Pixel offset applied to every particle position in the shader, to move the
   *  whole scene from the canvas centre to (e.g.) the SVG container's centre when
   *  the Canvas is a viewport-filling wrapper rather than the SVG itself. */
  originOffsetRef?: MutableRefObject<{ x: number; y: number }>;
  className?: string;
}

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

export default function ParticleSwarm({
  scrollProgress,
  logoSrc,
  iconTargets,
  blobCenter,
  originOffsetRef,
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
        <Particles
          progress={scrollProgress}
          logoSrc={logoSrc}
          iconTargets={iconTargets}
          blobCenter={blobCenter}
          originOffsetRef={originOffsetRef}
        />
      </Canvas>
    </div>
  );
}

/** Resize the orthographic camera frustum to match the canvas pixel size,
 *  so 1 scene unit = 1 CSS pixel and origin (0,0) is the canvas centre. */
function CameraSizer() {
  const { camera, size } = useThree();
  useEffect(() => {
    // Object.assign side-steps react-hooks/immutability; mutating R3F-managed
    // three.js objects is the canonical pattern for orthographic frustum sizing.
    Object.assign(camera, {
      left: -size.width / 2,
      right: size.width / 2,
      top: size.height / 2,
      bottom: -size.height / 2,
    });
    (camera as THREE.OrthographicCamera).updateProjectionMatrix();
  }, [camera, size.width, size.height]);
  return null;
}

/** Box–Muller — two uniforms → one standard-normal sample.
 *  Used for the scattered start so there's no rectangular bounding edge
 *  and the density at any one place stays low enough that the logo
 *  silhouette is invisible at p=0. */
function randNormal(): number {
  const u = Math.max(Math.random(), 1e-7);
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/**
 * Build the THREE.BufferGeometry from a sampled silhouette.
 * Pulled out of the component so callers stay free of `Math.random()` during render
 * (React 19's react-hooks/purity rule). All randomised attributes are baked here.
 */
function buildParticleGeometry(
  silhouette: Float32Array,
  iconTargets: readonly IconTarget[],
  blobCenter: { x: number; y: number }
): THREE.BufferGeometry {
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
    aLogoTarget[i * 3 + 0] = (sx / 512 - 0.5) * LOGO_W;
    aLogoTarget[i * 3 + 1] = -(sy / 512 - 0.5) * LOGO_H;
    aLogoTarget[i * 3 + 2] = 0;
  }

  // Scattered start: 2D Gaussian centred at origin. Unbounded tail = no visible
  // rectangular edge; wide sigma puts the bulk of particles outside the viewport
  // so they truly fly in rather than just contracting. Density at the centre is
  // low enough that the logo silhouette isn't pre-readable at progress 0.
  const SCATTER_SIGMA_X = 1100;
  const SCATTER_SIGMA_Y = 700;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = randNormal() * SCATTER_SIGMA_X;
    positions[i * 3 + 1] = randNormal() * SCATTER_SIGMA_Y;
    positions[i * 3 + 2] = 0;
  }

  // Per-particle delay (0..1) so the formation isn't synchronous.
  const aDelay = new Float32Array(count);
  for (let i = 0; i < count; i++) aDelay[i] = Math.random();

  // Per-particle base tint — soft pastel variations on white so the swarm
  // reads as luminous dust with subtle depth, not flat white. Picked from a
  // small palette so the average doesn't muddy. Phase 2's cluster tint will
  // multiply on top of this.
  const aBaseTint = new Float32Array(count * 3);
  // Palette weighted 35/45/15/5 (white / lavender / salmon / mint). Lavender
  // bumped both in count and in saturation so the design-system mission tint
  // actually reads under additive blending — a saturation-ramped distribution
  // gives depth (some barely-tinted, some near-full lavender). Lavender values
  // are mixes of design-system mission glow rgb(172,124,241) with white.
  const variants: ReadonlyArray<readonly [number, number, number]> = [
    // White majority (7 of 20 = 35%)
    [1.0, 1.0, 1.0],
    [1.0, 1.0, 1.0],
    [1.0, 1.0, 1.0],
    [1.0, 1.0, 1.0],
    [0.97, 0.98, 1.0], // cool white
    [0.97, 0.98, 1.0],
    [1.0, 0.98, 0.95], // warm white
    // Lavender saturation ramp (9 of 20 = 45%) — biased toward bold
    [0.93, 0.88, 0.99], // 20% lavender mix — barely there
    [0.86, 0.79, 0.98], // 40% mix — soft
    [0.81, 0.70, 0.97], // 55% mix — clearly tinted
    [0.81, 0.70, 0.97],
    [0.75, 0.62, 0.96], // 75% mix — bold
    [0.75, 0.62, 0.96],
    [0.71, 0.56, 0.95], // 85% mix — strong
    [0.71, 0.56, 0.95],
    [0.68, 0.49, 0.94], // 95% mix — near full design-system lavender
    // Salmon ramp (3 of 20 = 15%)
    [0.97, 0.88, 0.89], // 25% mix
    [0.94, 0.80, 0.82], // 50% mix
    [0.91, 0.71, 0.74], // 75% mix
    // Mint (1 of 20 = 5%)
    [0.85, 0.94, 0.88], // mid mint
  ];
  for (let i = 0; i < count; i++) {
    const v = variants[Math.floor(Math.random() * variants.length)];
    aBaseTint[i * 3 + 0] = v[0];
    aBaseTint[i * 3 + 1] = v[1];
    aBaseTint[i * 3 + 2] = v[2];
  }

  // Pool assignment: 1200/1200/1200 cluster + 2400 ambient. Ambient share is
  // intentionally large because Phase 4 forms the final blob from the AMBIENT
  // pool only — cluster particles freeze at their icon halos in phase 4 instead
  // of streaming back to the centre. A skinny ambient pool would read as a
  // thin remnant cloud; 2400 gives the blob real mass.
  const POOL_SIZES = [1200, 1200, 1200, 2400] as const;
  const aPool = new Float32Array(count);
  {
    let cursor = 0;
    for (let p = 0; p < POOL_SIZES.length; p++) {
      for (let k = 0; k < POOL_SIZES[p] && cursor < count; k++) {
        aPool[cursor++] = p;
      }
    }
    // Fisher–Yates shuffle so pool index doesn't correlate with silhouette order.
    for (let i = count - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [aPool[i], aPool[j]] = [aPool[j], aPool[i]];
    }
  }

  // Per-particle cluster routing — icon arrival, arc control point, blob target, tint.
  const aIconTarget = new Float32Array(count * 3);
  const aArcControl = new Float32Array(count * 3);
  const aBlobTarget = new Float32Array(count * 3);
  const aTint = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const pool = aPool[i];
    const lx = aLogoTarget[i * 3 + 0];
    const ly = aLogoTarget[i * 3 + 1];

    // Icon target: cluster pools peel off; ambient pool stays at the logo.
    // Per-particle jitter so the cluster blooms into a halo, not a single point.
    if (pool < 3) {
      const tgt = iconTargets[pool];
      const jitter = 30;
      aIconTarget[i * 3 + 0] = tgt.x + (Math.random() - 0.5) * jitter;
      aIconTarget[i * 3 + 1] = tgt.y + (Math.random() - 0.5) * jitter;
      aTint[i * 3 + 0] = tgt.tint[0];
      aTint[i * 3 + 1] = tgt.tint[1];
      aTint[i * 3 + 2] = tgt.tint[2];
    } else {
      aIconTarget[i * 3 + 0] = lx;
      aIconTarget[i * 3 + 1] = ly;
      aTint[i * 3 + 0] = 1;
      aTint[i * 3 + 1] = 1;
      aTint[i * 3 + 2] = 1;
    }

    // Arc control: midpoint between logo and icon, pushed perpendicular to the
    // chord to enforce sweep direction. CCW for problem (0) and mission (1)
    // — both at left/top — and CW for insight (2) at right. Ambient: no curve
    // (control point coincides with logo target so the bezier is a no-op).
    if (pool < 3) {
      const ix = aIconTarget[i * 3 + 0];
      const iy = aIconTarget[i * 3 + 1];
      const ccw = pool < 2 ? 1 : -1;
      const mx = (lx + ix) / 2;
      const my = (ly + iy) / 2;
      const cx = ix - lx;
      const cy = iy - ly;
      const chordLen = Math.hypot(cx, cy);
      const ux = chordLen > 0 ? (-cy / chordLen) * ccw : 0;
      const uy = chordLen > 0 ? (cx / chordLen) * ccw : 0;
      const push = 80;
      aArcControl[i * 3 + 0] = mx + ux * push;
      aArcControl[i * 3 + 1] = my + uy * push;
    } else {
      aArcControl[i * 3 + 0] = lx;
      aArcControl[i * 3 + 1] = ly;
    }

    // Blob target: cluster around blob centre. Cluster pools tighter, ambient
    // pool slightly looser so the cloud reads as substantial rather than thin.
    const blobR = pool < 3 ? 60 : 80;
    const theta = Math.random() * Math.PI * 2;
    const rad = Math.sqrt(Math.random()) * blobR;
    aBlobTarget[i * 3 + 0] = blobCenter.x + Math.cos(theta) * rad;
    aBlobTarget[i * 3 + 1] = blobCenter.y + Math.sin(theta) * rad;
  }

  // Per-particle jitter for size and drift amplitude. Without these, every
  // particle moves and renders identically (modulo position+delay), which reads
  // as a uniform sheet of glow. The 0.55..1.55 range gives a ~3× ratio between
  // smallest and largest sprite, enough that overlapping particles read as
  // depth (some bright/big, some faint/small) rather than a flat additive wash.
  const aSizeJitter = new Float32Array(count);
  const aDriftJitter = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    aSizeJitter[i] = 0.55 + Math.random();
    aDriftJitter[i] = 0.55 + Math.random();
  }

  // Per-particle Z depth — gives the swarm volume rather than a flat sheet.
  // Normal distribution biased toward the focal plane (z=0) with a long tail
  // out to ~±500. The shader uses this to drive size, brightness, and colour
  // temperature for atmospheric perspective. XY targeting is unchanged so the
  // silhouette stays sharp — Z just adds depth read on top.
  const aZ = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    aZ[i] = randNormal() * 220;
  }

  // Per-particle twinkle phase so brightness flicker isn't synchronised.
  const aTwinkle = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    aTwinkle[i] = Math.random() * Math.PI * 2;
  }

  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("aLogoTarget", new THREE.BufferAttribute(aLogoTarget, 3));
  geo.setAttribute("aIconTarget", new THREE.BufferAttribute(aIconTarget, 3));
  geo.setAttribute("aArcControl", new THREE.BufferAttribute(aArcControl, 3));
  geo.setAttribute("aBlobTarget", new THREE.BufferAttribute(aBlobTarget, 3));
  geo.setAttribute("aDelay", new THREE.BufferAttribute(aDelay, 1));
  geo.setAttribute("aPool", new THREE.BufferAttribute(aPool, 1));
  geo.setAttribute("aBaseTint", new THREE.BufferAttribute(aBaseTint, 3));
  geo.setAttribute("aTint", new THREE.BufferAttribute(aTint, 3));
  geo.setAttribute("aSizeJitter", new THREE.BufferAttribute(aSizeJitter, 1));
  geo.setAttribute("aDriftJitter", new THREE.BufferAttribute(aDriftJitter, 1));
  geo.setAttribute("aZ", new THREE.BufferAttribute(aZ, 1));
  geo.setAttribute("aTwinkle", new THREE.BufferAttribute(aTwinkle, 1));
  return geo;
}

/** Construct the additive-blended radial-sprite ShaderMaterial.
 *  Pulled out for the same reason as buildParticleGeometry — keeps render pure. */
function buildParticleMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uPixelRatio: { value: typeof window !== "undefined" ? window.devicePixelRatio : 1 },
      uOriginOffset: { value: new THREE.Vector2(0, 0) },
    },
    vertexShader: /* glsl */ `
      attribute vec3 aLogoTarget;
      attribute vec3 aIconTarget;
      attribute vec3 aArcControl;
      attribute vec3 aBlobTarget;
      attribute vec3 aBaseTint;
      attribute vec3 aTint;
      attribute float aPool;
      attribute float aDelay;
      attribute float aSizeJitter;
      attribute float aDriftJitter;
      attribute float aZ;
      attribute float aTwinkle;
      uniform float uProgress;
      uniform float uTime;
      uniform float uPixelRatio;
      uniform vec2 uOriginOffset;
      varying vec3 vBaseTint;
      varying vec3 vClusterTint;
      varying float vClusterMix;
      varying float vDepth;
      varying float vTwinkle;

      // Cheap divergence-low 3D flow field. Sampling at the particle's current
      // position gives a fluid, position-dependent drift — the "alive" feel —
      // rather than every particle oscillating in lockstep. Output is bounded
      // to roughly [-1, 1] per axis after the 0.5 scale. Time coefficients
      // tuned so the field evolves fast enough to read as continuous motion
      // (was ~0.4, kept too still at the resting holds).
      vec3 flow(vec3 p, float t) {
        float k = 0.006;
        return vec3(
          sin(p.y * k + t * 0.70) - cos(p.z * k + t * 0.55),
          sin(p.z * k + t * 0.85) - cos(p.x * k + t * 0.65),
          sin(p.x * k + t * 0.60) - cos(p.y * k + t * 0.75)
        ) * 0.5;
      }

      // Choreography phase windows (constants kept here for readability):
      //   Phase 1 (scatter→logo):   0.00 → 0.25 (per-particle delay shifts start)
      //   Phase 2 (per-pool peel):  problem 0.35→0.50, mission 0.40→0.55, insight 0.45→0.60
      //   Phase 3 (hold):           0.65 → 0.75
      //   Phase 4 (drift to blob):  0.75 → 1.00
      // Ambient pool (3) skips phase 2, stays at logo, then drifts to blob.

      void main() {
        float p = uProgress;
        vBaseTint = aBaseTint;
        vClusterTint = aTint;

        // PHASE 1: scattered → logo silhouette, with per-particle delay.
        float d1 = aDelay * 0.30;
        float t1 = clamp((p - d1) / (0.25 - d1), 0.0, 1.0);
        t1 = smoothstep(0.0, 1.0, t1);
        vec3 pos1 = mix(position, aLogoTarget, t1);

        // PHASE 2: per-pool peel-off via quadratic bezier (logo → arc → icon).
        // Pool windows: 0.35–0.50, 0.40–0.55, 0.45–0.60. Ambient (3) skipped.
        float poolStart = 0.35 + aPool * 0.05;
        float poolEnd = poolStart + 0.15;
        float t2 = smoothstep(poolStart, poolEnd, p);
        t2 *= (1.0 - step(2.5, aPool));
        vec3 bez =
            (1.0 - t2) * (1.0 - t2) * aLogoTarget
          + 2.0 * (1.0 - t2) * t2 * aArcControl
          + t2 * t2 * aIconTarget;
        // Phase 1 dominates until logo locks at p=0.25, then bezier takes over.
        vec3 pos12 = mix(pos1, bez, step(0.25, p));

        // PHASE 4: ambient pool drifts from logo to blob; cluster pools freeze
        // at their icon halos so the blob reads as forming from the central
        // logo swarm rather than collapsing inward from three icons.
        float ambientMask = step(2.5, aPool);
        float t4 = smoothstep(0.75, 1.00, p);
        vec3 phase4Cluster = aIconTarget;
        vec3 phase4Ambient = mix(aLogoTarget, aBlobTarget, t4);
        vec3 pos4 = mix(phase4Cluster, phase4Ambient, ambientMask);

        // Final position: pos12 through phase 1–3, pos4 from 0.75 onwards.
        vec3 pos = mix(pos12, pos4, step(0.75, p));

        // Drift envelope — base curve goes 9 → 3.0 by p≈0.30 (Phase 1 fireflies
        // settling). The resting floor (was 0.4) is kept high enough that the
        // silhouette and icon-halo holds still read as moving rather than
        // pinned, while the humps lift it further during peel-off and the blob.
        // Each particle's amplitude is multiplied by aDriftJitter so some hover
        // gently and others wander more — organic, not synchronised.
        float driftBase = mix(9.0, 3.0, smoothstep(0.0, 0.30, p));
        float hump2 = smoothstep(0.30, 0.45, p) * (1.0 - smoothstep(0.50, 0.65, p));
        float hump4 = smoothstep(0.75, 0.90, p);
        float driftMag = (driftBase + 5.5 * hump2 + 5.0 * hump4) * aDriftJitter;

        // 3D flow field — replaces the old XY sine drift. Sampling the field
        // at the particle's current position means neighbours move coherently
        // (currents, eddies) rather than in-place wobble, which is the single
        // biggest contributor to the "living entity" read. Z gets a smaller
        // share so the depth read (which is keyed off aZ, not pos.z) stays
        // stable while still letting particles breathe in/out.
        vec3 d = flow(pos + vec3(0.0, 0.0, aZ), uTime);
        pos.xy += d.xy * driftMag;
        pos.z = aZ + d.z * driftMag * 0.35;

        // Translate the entire scene from canvas centre to (e.g.) the SVG
        // container's centre on screen. Production passes a non-zero offset so
        // the formed silhouette sits over the DOM logo PNG rather than at the
        // wrapper's geometric centre.
        pos.xy += uOriginOffset;

        // Cluster tint envelope: ramps in as the cluster peels off, ramps back
        // out as it arrives at the icon halo. Ambient pool always 0 (white).
        float tintIn  = smoothstep(poolStart, poolStart + 0.05, p);
        float tintOut = smoothstep(poolEnd - 0.05, poolEnd, p);
        vClusterMix = (tintIn - tintOut) * (1.0 - step(2.5, aPool));

        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mv;

        // Depth read — drives size in the vertex shader and colour/intensity
        // in the fragment shader. Normalised 0 (far) → 1 (near) for the ±400
        // sigma range; clamped because randNormal can sample outside that.
        vDepth = clamp((aZ + 400.0) / 800.0, 0.0, 1.0);
        vTwinkle = aTwinkle;

        // Size envelope: 9 → 3.5 by p≈0.30 (Phase 1), flat through phases 2–3,
        // boost in the blob so the final cloud has volume. Per-particle
        // aSizeJitter (0.55..1.55) gives ~3× ratio between smallest and largest
        // sprites — the depth the user asked for ("variety in particle size").
        // Depth multiplier (0.55..1.45) layers on top so near particles
        // genuinely look bigger than far ones — atmospheric perspective.
        float sizeBase = mix(9.0, 3.5, smoothstep(0.0, 0.30, p));
        float sizeBlobBoost = smoothstep(0.85, 1.00, p) * 1.5;
        float depthSize = mix(0.55, 1.45, vDepth);
        float sizePx = (sizeBase + sizeBlobBoost) * aSizeJitter * depthSize;
        gl_PointSize = sizePx * uPixelRatio;
      }
    `,
    fragmentShader: /* glsl */ `
      // Soft radial sprite, additive-blended. Base tint always present;
      // cluster tint blends in via the vClusterMix envelope during peel-off.
      // Depth (vDepth, 0=far → 1=near) drives atmospheric perspective:
      // far particles read cool/dim, near particles warm/bright. A subtle
      // per-particle twinkle keeps the swarm from feeling locked.
      varying vec3 vBaseTint;
      varying vec3 vClusterTint;
      varying float vClusterMix;
      varying float vDepth;
      varying float vTwinkle;
      uniform float uTime;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float r = length(uv);
        // Far particles get a softer, more diffuse halo (out-of-focus read);
        // near particles get a tighter core. Both come from the same r, just
        // remapping the smoothstep edges with depth.
        float haloEdge = mix(0.55, 0.45, vDepth);
        float coreEdge = mix(0.22, 0.14, vDepth);
        float halo = smoothstep(haloEdge, 0.0, r);
        float core = smoothstep(coreEdge, 0.0, r);
        float intensity = halo * 0.25 + core * 1.0;

        vec3 col = mix(vBaseTint, vClusterTint, vClusterMix);
        // Atmospheric tint: cool blue at depth, neutral-warm in front.
        vec3 farTint  = vec3(0.62, 0.74, 1.00);
        vec3 nearTint = vec3(1.00, 0.96, 0.90);
        col *= mix(farTint, nearTint, vDepth);

        // Depth intensity: far = dim (atmospheric extinction), near = punchy.
        // Range chosen so the median (vDepth≈0.5) lands ~1.0 — silhouette
        // brightness matches the pre-depth baseline; the spread does the
        // perspective work.
        float depthIntensity = mix(0.70, 1.30, vDepth);
        // Slow per-particle twinkle so individual stars breathe.
        float twinkle = 1.0 + sin(uTime * 1.3 + vTwinkle) * 0.18;
        intensity *= depthIntensity * twinkle;

        gl_FragColor = vec4(col * intensity, intensity);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

function Particles({
  progress,
  logoSrc,
  iconTargets,
  blobCenter,
  originOffsetRef,
}: {
  progress: number | MutableRefObject<number>;
  logoSrc: string;
  iconTargets: readonly IconTarget[];
  blobCenter: { x: number; y: number };
  originOffsetRef?: MutableRefObject<{ x: number; y: number }>;
}) {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  // Lazy initialiser so the material is constructed exactly once at mount.
  // Pure (no Math.random); readable in render; survives re-renders.
  const [material] = useState<THREE.ShaderMaterial>(() => buildParticleMaterial());

  // Load the logo PNG → sample its silhouette → build the geometry.
  // All randomness happens inside this effect so render stays pure.
  useEffect(() => {
    let cancelled = false;
    let geoLocal: THREE.BufferGeometry | null = null;

    loadImageToImageData(logoSrc, 512)
      .then((img) => {
        if (cancelled) return;
        const samples = sampleAlphaPixels(img, 6000);
        geoLocal = buildParticleGeometry(samples, iconTargets, blobCenter);
        // Functional setState: dispose the previous geometry (if any) when
        // we replace it, so a logoSrc change or StrictMode double-mount
        // doesn't leak GPU buffers.
        setGeometry((prev) => {
          prev?.dispose();
          return geoLocal!;
        });
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("[ParticleSwarm] failed to load logo:", err);
        }
      });

    return () => {
      cancelled = true;
      geoLocal?.dispose();
    };
  }, [logoSrc, iconTargets, blobCenter]);

  // Dispose whatever geometry is currently in state on change/unmount.
  // Pairs with the functional setState above to cover the unmount path,
  // where the in-flight `geoLocal` cleanup wouldn't reach committed state.
  useEffect(() => {
    return () => {
      geometry?.dispose();
    };
  }, [geometry]);

  // Dispose the material when the component unmounts.
  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  // Push progress + time into the shader uniforms every frame. `delta` from
  // useFrame gives real seconds so drift speed stays consistent regardless of
  // frame rate. Object.assign (vs direct .value=) keeps react-hooks/immutability
  // happy — `material` is from useState. Presence-checks tolerate a stale state
  // material surviving HMR with a different uniforms shape (a real dev hazard).
  useFrame((_, delta) => {
    if (typeof document !== "undefined" && document.hidden) return;
    const u = material.uniforms;
    if (!u.uProgress || !u.uTime) return;
    const p = typeof progress === "number" ? progress : progress.current;
    Object.assign(u.uProgress, { value: p });
    // Freeze uTime in test mode (?particleProgress URL flag) so visual
    // snapshots of the drifting blob stay deterministic.
    const isTestMode =
      typeof window !== "undefined" &&
      new URL(window.location.href).searchParams.has("particleProgress");
    if (!isTestMode) {
      Object.assign(u.uTime, { value: u.uTime.value + delta });
    }
    // Origin offset: viewport-pixel translation applied in the vertex shader.
    // Updated from a ref so resize callbacks don't trigger React re-renders.
    if (originOffsetRef && u.uOriginOffset?.value) {
      const off = originOffsetRef.current;
      const v = u.uOriginOffset.value as THREE.Vector2;
      v.set(off.x, off.y);
    }
  });

  if (!geometry) return null;
  return (
    <points geometry={geometry}>
      <primitive object={material} attach="material" />
    </points>
  );
}
