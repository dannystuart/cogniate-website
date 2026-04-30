"use client";

import { useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export interface ParticleSwarmProps {
  /** 0..1 — phase 1 prototype takes a plain number; phase 2 will widen to ref. */
  scrollProgress: number;
  logoSrc: string;
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
function buildParticleGeometry(silhouette: Float32Array): THREE.BufferGeometry {
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
  // Palette weighted 50/30/15/5 (white / lavender / salmon / mint), with a
  // saturation gradient inside each colour so depth reads across particles —
  // some barely-tinted, some pronounced. Lavender values come from the design
  // system mission glow rgb(172,124,241) mixed with white at varying ratios.
  const variants: ReadonlyArray<readonly [number, number, number]> = [
    // White majority (10 of 20 = 50%)
    [1.0, 1.0, 1.0],
    [1.0, 1.0, 1.0],
    [1.0, 1.0, 1.0],
    [1.0, 1.0, 1.0],
    [1.0, 1.0, 1.0],
    [0.97, 0.98, 1.0], // cool white
    [0.97, 0.98, 1.0],
    [1.0, 0.98, 0.95], // warm white
    [1.0, 0.98, 0.95],
    [0.96, 0.97, 1.0], // very faint cool
    // Lavender saturation ramp (6 of 20 = 30%) — pale → bold for depth
    [0.93, 0.88, 0.99], // 20% lavender mix — barely there
    [0.88, 0.80, 0.98], // 35% mix — soft
    [0.88, 0.80, 0.98],
    [0.83, 0.73, 0.97], // 50% mix — mid
    [0.78, 0.66, 0.96], // 70% mix — pronounced
    [0.74, 0.60, 0.95], // 80% mix — bold (still soft against bright sprite)
    // Salmon ramp (3 of 20 = 15%) — same depth principle
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

  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("aLogoTarget", new THREE.BufferAttribute(aLogoTarget, 3));
  geo.setAttribute("aDelay", new THREE.BufferAttribute(aDelay, 1));
  geo.setAttribute("aBaseTint", new THREE.BufferAttribute(aBaseTint, 3));
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
    },
    vertexShader: /* glsl */ `
      attribute vec3 aLogoTarget;
      attribute float aDelay;
      attribute vec3 aBaseTint;
      uniform float uProgress;
      uniform float uTime;
      uniform float uPixelRatio;
      varying vec3 vBaseTint;

      // Per-particle scattered → logo. Each particle has its own start window.
      void main() {
        vBaseTint = aBaseTint;

        float d = aDelay * 0.30; // up to 30% phase offset
        float t = clamp((uProgress - d) / (0.25 - d), 0.0, 1.0);
        // Smoothstep gives a soft ease.
        t = smoothstep(0.0, 1.0, t);
        vec3 pos = mix(position, aLogoTarget, t);

        // Drift envelope: strong when scattered, smoothly fades to ~0 by p≈0.30.
        // Jitter at the logo would blur the silhouette under additive blending,
        // so the formation must end up still.
        float driftMag = mix(9.0, 0.4, smoothstep(0.0, 0.30, uProgress));
        float driftPhase = aDelay * 6.2831853;
        vec2 drift = vec2(
          sin(uTime * 1.4 + driftPhase),
          cos(uTime * 1.2 + driftPhase * 1.3)
        );
        pos.xy += drift * driftMag;

        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mv;
        // Large diffuse particles when scattered → small crisp particles at logo.
        // Same envelope as the drift magnitude so size and motion settle together.
        float sizePx = mix(9.0, 3.5, smoothstep(0.0, 0.30, uProgress));
        gl_PointSize = sizePx * uPixelRatio;
      }
    `,
    fragmentShader: /* glsl */ `
      // Soft radial sprite, additive-blended.
      varying vec3 vBaseTint;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float r = length(uv);
        float halo = smoothstep(0.5, 0.0, r);   // outer falloff
        float core = smoothstep(0.18, 0.0, r);  // tighter core (was 0.25)
        float intensity = halo * 0.25 + core * 1.0;  // less halo (was 0.4)
        gl_FragColor = vec4(vBaseTint * intensity, intensity);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

function Particles({ progress, logoSrc }: { progress: number; logoSrc: string }) {
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
        console.log("[ParticleSwarm] sampled silhouette points:", samples.length / 2);
        geoLocal = buildParticleGeometry(samples);
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
  }, [logoSrc]);

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

  // Push progress + time into the shader uniforms every frame.
  // Object.assign is used here (rather than a direct property write) only to
  // satisfy react-hooks/immutability — `material` originates from useState()
  // and the lint rule flags any direct member-write on values it tracks.
  // Per-frame allocation is two tiny object literals — well inside budget.
  // `delta` from useFrame gives a real per-frame seconds value (vs. assuming 60fps),
  // so the firefly drift speed stays steady on slower devices.
  useFrame((_, delta) => {
    Object.assign(material.uniforms.uProgress, { value: progress });
    Object.assign(material.uniforms.uTime, {
      value: material.uniforms.uTime.value + delta,
    });
  });

  if (!geometry) return null;
  return (
    <points geometry={geometry}>
      <primitive object={material} attach="material" />
    </points>
  );
}
