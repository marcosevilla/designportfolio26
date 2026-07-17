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

export interface LogoParams {
  shape: {
    // Glyph-space units (the asterisk is 34.4 units wide); world scale below.
    depth: number;
    bevelThickness: number;
    bevelSize: number;
    bevelSegments: number;
    scale: number; // glyph units → world units (0.12 ≈ 4-unit-wide mark)
  };
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

// Starting values follow the opensoftware.co reference numbers from
// docs/LOGO-LAB-HANDOFF.md (transmission 1, thickness ~1.5, roughness 0.15,
// clearcoat 1); shape depth/bevel are in glyph units, chosen so proportions
// match the reference's depth:width ratio.
export const DEFAULT_LOGO_PARAMS: LogoParams = {
  shape: {
    depth: 8,
    bevelThickness: 1,
    bevelSize: 1,
    bevelSegments: 8,
    scale: 0.12,
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
