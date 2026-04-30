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
