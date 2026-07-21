"use client";

/**
 * DitherBackdrop — the single home for the work-card dither treatment
 * (spec: docs/superpowers/specs/2026-07-20-dither-card-backdrops-design.md).
 * The animated Bayer-dither wave first built for the F&B card
 * (FnbDitherFrame) now renders behind every work-marquee study cell;
 * this component owns the shader constants, the accent-tint color
 * logic, and the seeded per-card variation so all six cards stay one
 * family by construction.
 *
 * Variation is deterministic: the study slug hashes to a PRNG stream
 * that picks speed, animation phase, pattern offset, and scale — each
 * card composes differently but identically on every visit. `overrides`
 * pins any param for art direction (the F&B card pins its original
 * Paper-design values so the anchor composition is unchanged).
 */

import { useEffect, useState } from "react";
import { Dithering } from "@paper-design/shaders-react";

// Shared shader identity — every card uses the same shape/type/dot size
// (the F&B card's Paper values). Only the seeded params vary.
const DITHER_SHAPE = "wave" as const;
const DITHER_TYPE = "4x4" as const;
const DITHER_SIZE = 2;

// The dither ink is the accent mixed 30% toward the page bg — an
// opaque tint, so the wave reads as a subtle shade of the theme
// highlight. Mixing in CSS (not canvas opacity) keeps the WebGL
// canvas from washing the card with its own semi-transparent body.
const DITHER_TINT =
  "color-mix(in srgb, var(--color-accent) 30%, var(--color-bg))";

// ── Seeded variation ──

export interface DitherParams {
  speed: number;
  frame: number;
  offsetX: number;
  offsetY: number;
  scale: number;
}

// FNV-1a string hash → 32-bit seed for the PRNG.
function hashString(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// mulberry32 — tiny deterministic PRNG, plenty for picking params.
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Ranges center on the F&B anchor values (speed 0.15, scale 1.58) so
// the family reads related, not uniform. Draw order is part of the
// contract — reordering reshuffles every card's look.
export function seededDitherParams(seed: string): DitherParams {
  const rand = mulberry32(hashString(seed));
  return {
    speed: 0.08 + rand() * 0.17, // 0.08 – 0.25
    frame: Math.floor(rand() * 10000), // phase: no two waves crest in sync
    offsetX: -0.6 + rand() * 1.2, // −0.6 – 0.6
    offsetY: -0.6 + rand() * 1.2,
    scale: 1.3 + rand() * 0.6, // 1.3 – 1.9
  };
}

// ── Shared hooks ──

/**
 * Resolve the theme's accent to a concrete color the shader can take
 * as a uniform. `--color-accent` aliases `var(--color-fg)` in mono and
 * gets rewritten by applyColoredTheme(), so a hidden probe element +
 * getComputedStyle is the only reliable resolver; a MutationObserver
 * on <html> re-resolves on theme/dark-mode flips.
 */
export function useAccentColor(): string | null {
  const [accent, setAccent] = useState<string | null>(null);

  useEffect(() => {
    const probe = document.createElement("div");
    probe.style.position = "absolute";
    probe.style.visibility = "hidden";
    probe.style.pointerEvents = "none";
    probe.style.color = DITHER_TINT;
    document.body.appendChild(probe);

    // getComputedStyle hands back `color(srgb …)` for color-mix
    // results, which the shader's color parser can't read (it falls
    // back to black). fillStyle round-trips preserve that syntax too,
    // so normalize by actually painting a pixel and reading it back —
    // getImageData always returns plain 0-255 RGB.
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const resolve = () => {
      const raw = getComputedStyle(probe).color;
      if (!ctx) return setAccent(raw);
      ctx.fillStyle = raw;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      setAccent(
        `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`
      );
    };
    resolve();

    const observer = new MutationObserver(resolve);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });
    return () => {
      observer.disconnect();
      probe.remove();
    };
  }, []);

  return accent;
}

/** Shader speed 0 for reduced-motion users — the wave holds a frame. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

// ── Component ──

export default function DitherBackdrop({
  seed,
  overrides,
}: {
  /** Stable identity for this card (the study slug) — same seed, same
   *  composition on every visit. */
  seed: string;
  /** Pin individual params for art direction; seeded values fill the
   *  rest. */
  overrides?: Partial<DitherParams>;
}) {
  const accent = useAccentColor();
  const reducedMotion = useReducedMotion();

  if (!accent) return null;

  const params = { ...seededDitherParams(seed), ...overrides };

  return (
    // Oversized bleed past every card edge (matches the F&B card's
    // 436×335-on-420×323 composition from the Paper design). colorBack
    // stays transparent; the cell's ink-mix fill is the backdrop, and
    // the tint lets it show through the dots.
    <Dithering
      speed={reducedMotion ? 0 : params.speed}
      frame={params.frame}
      shape={DITHER_SHAPE}
      type={DITHER_TYPE}
      size={DITHER_SIZE}
      scale={params.scale}
      offsetX={params.offsetX}
      offsetY={params.offsetY}
      colorBack="#00000000"
      colorFront={accent}
      style={{
        position: "absolute",
        inset: -8,
        zIndex: 0,
      }}
    />
  );
}
