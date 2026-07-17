"use client";

// The 3D scene for /dev/logo-lab — the ✦ ˖ sparkle mark extruded + beveled, wearing
// drei's MeshTransmissionMaterial ("hard candy" glass), free-tumble drag with
// inertia (angular velocity + per-frame exponential damping, no physics
// engine). Loaded ONLY via next/dynamic ssr:false from LogoLab.tsx so the
// ~1MB three/fiber/drei chunk never reaches other routes.

import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  MeshTransmissionMaterial,
} from "@react-three/drei";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { MARK_PATHS, MARK_VIEWBOX_HEIGHT } from "./glyph";
import type { LogoParams } from "./params";

// The original Geist * glyph box was 34.4 units; normalizing the current mark
// to that size keeps depth/bevel slider values (and any tuned settings JSON)
// meaning the same thing regardless of the source artwork's coordinate scale.
const NORM = 34.4 / MARK_VIEWBOX_HEIGHT;

// Parsed once per session — the mark outlines never change, only the
// extrusion params do. (Also keeps Suspense render retries from re-parsing.)
let cachedShapes: THREE.Shape[] | null = null;
function getMarkShapes(): THREE.Shape[] {
  if (!cachedShapes) {
    const svg = new SVGLoader().parse(
      `<svg xmlns="http://www.w3.org/2000/svg">${MARK_PATHS.map(
        (d) => `<path d="${d}"/>`
      ).join("")}</svg>`
    );
    cachedShapes = svg.paths.flatMap((p) => p.toShapes());
  }
  return cachedShapes;
}

function useMarkGeometry(shape: LogoParams["shape"]) {
  const geometry = useMemo(() => {
    // Extrusion params are given in normalized (34.4-box) units, so divide
    // back up into source-artwork units before extruding, then scale down.
    const geo = new THREE.ExtrudeGeometry(getMarkShapes(), {
      depth: shape.depth / NORM,
      steps: 1,
      bevelEnabled: true,
      bevelThickness: shape.bevelThickness / NORM,
      bevelSize: shape.bevelSize / NORM,
      bevelSegments: shape.bevelSegments,
      curveSegments: 24,
    });
    geo.scale(NORM, NORM, NORM);
    geo.center();
    // Mark coords are SVG space (y down); a proper rotation (not a mirror,
    // which would flip winding) turns it right-side up in three's y-up world.
    geo.rotateX(Math.PI);
    return geo;
  }, [
    shape.depth,
    shape.bevelThickness,
    shape.bevelSize,
    shape.bevelSegments,
  ]);

  useEffect(() => () => geometry.dispose(), [geometry]);
  return geometry;
}

const spinQuat = new THREE.Quaternion();
const spinEuler = new THREE.Euler();
function applySpin(obj: THREE.Object3D, rx: number, ry: number) {
  // Premultiplying rotates about the *world* axes, so drag direction always
  // matches screen direction no matter how tumbled the mark already is.
  spinQuat.setFromEuler(spinEuler.set(rx, ry, 0));
  obj.quaternion.premultiply(spinQuat);
}

function TumbleGroup({
  motion,
  children,
}: {
  motion: LogoParams["motion"];
  children: React.ReactNode;
}) {
  const group = useRef<THREE.Group>(null);
  const velocity = useRef(new THREE.Vector2(0.3, 0.8)); // (pitch, yaw) rad/s
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0, t: 0 });
  const gl = useThree((s) => s.gl);
  const motionRef = useRef(motion);
  motionRef.current = motion;

  useEffect(() => {
    const el = gl.domElement;
    const down = (e: PointerEvent) => {
      dragging.current = true;
      velocity.current.set(0, 0);
      last.current = { x: e.clientX, y: e.clientY, t: performance.now() };
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        // synthetic events / already-released pointers — capture is best-effort
      }
    };
    const move = (e: PointerEvent) => {
      if (!dragging.current || !group.current) return;
      const now = performance.now();
      const dt = Math.max((now - last.current.t) / 1000, 1e-4);
      const rx = (e.clientY - last.current.y) * motionRef.current.sensitivity;
      const ry = (e.clientX - last.current.x) * motionRef.current.sensitivity;
      applySpin(group.current, rx, ry);
      velocity.current.set(rx / dt, ry / dt);
      last.current = { x: e.clientX, y: e.clientY, t: now };
    };
    const up = (e: PointerEvent) => {
      dragging.current = false;
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [gl]);

  useFrame((_, rawDt) => {
    if (!group.current || dragging.current) return;
    const dt = Math.min(rawDt, 0.05); // clamp tab-switch jumps
    const { friction, idleSpin } = motionRef.current;
    applySpin(
      group.current,
      velocity.current.x * dt,
      (velocity.current.y + idleSpin) * dt
    );
    velocity.current.multiplyScalar(Math.exp(-friction * dt));
  });

  return <group ref={group}>{children}</group>;
}

function Mark({
  params,
  accentColor,
}: {
  params: LogoParams;
  accentColor: string;
}) {
  const geometry = useMarkGeometry(params.shape);
  const m = params.material;
  const color = m.colorMode === "accent" ? accentColor : m.customColor;

  return (
    <TumbleGroup motion={params.motion}>
      <mesh geometry={geometry} scale={params.shape.scale}>
        <MeshTransmissionMaterial
          transmission={m.transmission}
          thickness={m.thickness}
          roughness={m.roughness}
          clearcoat={m.clearcoat}
          clearcoatRoughness={m.clearcoatRoughness}
          chromaticAberration={m.chromaticAberration}
          ior={m.ior}
          envMapIntensity={m.envMapIntensity}
          backside={m.backside}
          color={color}
        />
      </mesh>
    </TumbleGroup>
  );
}

export default function LogoScene({
  params,
  accentColor,
}: {
  params: LogoParams;
  accentColor: string;
}) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 11], fov: 35 }}
      gl={{ alpha: true, antialias: true }}
      style={{ touchAction: "none", cursor: "grab" }}
    >
      <ambientLight intensity={params.env.ambient} />
      <spotLight
        position={[5, 8, 10]}
        intensity={params.env.spot}
        angle={0.4}
        penumbra={1}
      />
      <Suspense fallback={null}>
        <Mark params={params} accentColor={accentColor} />
        <ContactShadows
          position={[0, -3.4, 0]}
          opacity={params.shadow.opacity}
          blur={params.shadow.blur}
          scale={16}
          far={8}
        />
        <Environment preset={params.env.preset} />
      </Suspense>
    </Canvas>
  );
}
