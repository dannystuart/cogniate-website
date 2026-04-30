"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const [silhouette, setSilhouette] = useState<Float32Array | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadImageToImageData(logoSrc, 512).then((img) => {
      if (cancelled) return;
      const samples = sampleAlphaPixels(img, 6000);
      console.log("[ParticleSwarm] sampled silhouette points:", samples.length / 2);
      setSilhouette(samples);
    });
    return () => {
      cancelled = true;
    };
  }, [logoSrc]);

  if (!silhouette) return null;
  return null; // particles next task
}
