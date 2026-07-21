"use client";

/**
 * FnbDitherFrame — the F&B study cell's card treatment, ported from the
 * Paper design (file 01KPH4YAP32T7JNXTH0CZS7AA3, node 2DW-0): an
 * animated Bayer-dither wave behind a top-pinned phone mock that crops
 * at the card's bottom edge. Uses Paper's own shader library so the
 * wave is pixel-identical to the design.
 *
 * The design's fixed cyan-on-magenta palette is swapped for theme
 * tokens (Marco's call, 2026-07-20): the dither ink is a light wash of
 * the live `--color-accent` over the standard card fill (DITHER_OPACITY
 * keeps it a tint, not full-strength accent), so the card follows
 * mono/colored themes and light/dark like every other surface. The
 * screen is the static Lunch-menu mock exported from the Paper file.
 *
 * All dimensions are the Paper card's values × 0.57 — the design was
 * authored at 737×567, the marquee cell renders at 420×323 (same 1.3
 * aspect), so the composition scales uniformly.
 */

import { useEffect, useState } from "react";
import { Dithering } from "@paper-design/shaders-react";

// Paper node 2I9-0 emits: speed 0.15, shape "wave", type "4x4",
// size 4, scale 1.58 at 737px card width. size is an absolute pixel
// value, so it's scaled with the card (4 × 0.57 ≈ 2) to keep the dots
// proportional to the composition.
const DITHER_SPEED = 0.15;
const DITHER_SIZE = 2;
const DITHER_SCALE = 1.58;
// The dither ink is the accent mixed 30% toward the page bg — an
// opaque tint, so the wave reads as a subtle shade of the theme
// highlight. Mixing in CSS (not canvas opacity) keeps the WebGL
// canvas from washing the card with its own semi-transparent body.
const DITHER_TINT =
  "color-mix(in srgb, var(--color-accent) 30%, var(--color-bg))";

// Static Lunch-menu screen exported from the Paper mock (node 2F5-0).
const MOCK_SRC = "/images/gallery/fb-ordering/fb-dither-mock.webp";

/**
 * Resolve the theme's accent to a concrete color the shader can take
 * as a uniform. `--color-accent` aliases `var(--color-fg)` in mono and
 * gets rewritten by applyColoredTheme(), so a hidden probe element +
 * getComputedStyle is the only reliable resolver; a MutationObserver
 * on <html> re-resolves on theme/dark-mode flips.
 */
function useAccentColor(): string | null {
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
function useReducedMotion(): boolean {
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

export default function FnbDitherFrame() {
  const accent = useAccentColor();
  const reducedMotion = useReducedMotion();

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Dither wave — oversized and centered like the Paper node
          (764×588 on the 737×567 card) so the pattern bleeds past
          every edge. colorBack stays transparent; the cell's ink-mix
          fill is the backdrop, and the reduced opacity lets it show
          through the dots. */}
      {accent && (
        <Dithering
          speed={reducedMotion ? 0 : DITHER_SPEED}
          shape="wave"
          type="4x4"
          size={DITHER_SIZE}
          scale={DITHER_SCALE}
          colorBack="#00000000"
          colorFront={accent}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            translate: "-50% -50%",
            width: 436,
            height: 335,
            zIndex: 0,
          }}
        />
      )}

      {/* Phone mock — top-pinned, horizontally centered, cropped by the
          card's bottom edge. Paper: 430w, top 80, radius 44, 10px
          border-color outline (all × 0.57), with a soft downward
          two-stop shadow lifting it off the dither field. */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 46,
          transform: "translateX(-50%)",
          zIndex: 1,
          width: 245,
          height: 531,
          borderRadius: 25,
          outline: "6px solid var(--color-border)",
          backgroundColor: "var(--color-bg)",
          boxShadow:
            "0 4px 10px rgba(0, 0, 0, 0.06), 0 16px 32px rgba(0, 0, 0, 0.12)",
          overflow: "hidden",
        }}
      >
        <img
          src={MOCK_SRC}
          alt=""
          aria-hidden
          style={{
            position: "absolute",
            inset: -0.5,
            width: "calc(100% + 1px)",
            height: "calc(100% + 1px)",
            objectFit: "cover",
            objectPosition: "top",
            display: "block",
          }}
        />
      </div>
    </div>
  );
}
