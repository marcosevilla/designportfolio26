// Shared param types + defaults for the logo lab. Kept free of three.js
// imports so the panel (LogoLab) can use them without pulling the 3D chunk —
// LogoScene loads via next/dynamic ssr:false only.

export const ENV_PRESETS = [
  "studio",
  "city",
  "sunset",
  "dawn",
  "warehouse",
  "apartment",
] as const;
export type EnvPreset = (typeof ENV_PRESETS)[number];

// The three outlines of the ✦ ˖ mark, each independently shapeable.
export const PIECE_KEYS = ["sparkle", "plus", "dot"] as const;
export type PieceKey = (typeof PIECE_KEYS)[number];

export interface PieceParams {
  enabled: boolean;
  // Extrusion values are in normalized units (the composition is scaled to a
  // 34.4-unit box, matching the original Geist glyph, so numbers stay
  // comparable across mark artwork).
  depth: number;
  bevelThickness: number;
  bevelSize: number;
  bevelSegments: number;
  size: number; // in-plane scale of the piece, 1 = source proportion
  rotation: number; // degrees, spins the piece in place
  offsetX: number; // normalized units; +X right, +Y up, +Z toward viewer
  offsetY: number;
  offsetZ: number;
}

export interface LogoParams {
  shape: {
    scale: number; // whole-composition world scale (0.12 ≈ 4-unit-wide mark)
  };
  pieces: Record<PieceKey, PieceParams>;
  material: {
    transmission: number;
    thickness: number;
    roughness: number;
    clearcoat: number;
    clearcoatRoughness: number;
    chromaticAberration: number;
    ior: number;
    envMapIntensity: number;
    backside: boolean;
    colorMode: "accent" | "custom";
    customColor: string;
  };
  env: {
    preset: EnvPreset;
    ambient: number;
    spot: number;
  };
  shadow: {
    opacity: number;
    blur: number;
  };
  motion: {
    sensitivity: number; // radians per pixel of drag
    friction: number; // per-second exponential damping of angular velocity
    idleSpin: number; // constant ambient yaw, rad/s (0 = off)
  };
}

// Material numbers follow the opensoftware.co reference from
// docs/LOGO-LAB-HANDOFF.md; the small pieces get thinner depth + gentler
// bevels than the sparkle so their narrow strokes don't self-intersect.
export const DEFAULT_LOGO_PARAMS: LogoParams = {
  shape: {
    scale: 0.12,
  },
  pieces: {
    sparkle: {
      enabled: true,
      depth: 8,
      bevelThickness: 1,
      bevelSize: 1,
      bevelSegments: 8,
      size: 1,
      rotation: 0,
      offsetX: 0,
      offsetY: 0,
      offsetZ: 0,
    },
    plus: {
      enabled: true,
      depth: 5,
      bevelThickness: 0.4,
      bevelSize: 0.4,
      bevelSegments: 6,
      size: 1,
      rotation: 0,
      offsetX: 0,
      offsetY: 0,
      offsetZ: 0,
    },
    dot: {
      enabled: true,
      depth: 4,
      bevelThickness: 0.4,
      bevelSize: 0.4,
      bevelSegments: 6,
      size: 1,
      rotation: 0,
      offsetX: 0,
      offsetY: 0,
      offsetZ: 0,
    },
  },
  material: {
    transmission: 1,
    thickness: 1.5,
    roughness: 0.15,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    chromaticAberration: 0.03,
    ior: 1.5,
    envMapIntensity: 1,
    backside: true,
    colorMode: "accent",
    customColor: "#8a7cff",
  },
  env: {
    preset: "studio",
    ambient: 0.4,
    spot: 2,
  },
  shadow: {
    opacity: 0.4,
    blur: 2.5,
  },
  motion: {
    sensitivity: 0.008,
    friction: 1.5,
    idleSpin: 0.15,
  },
};
