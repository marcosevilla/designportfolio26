"use client";

/**
 * FnbDitherFrame — the F&B study cell's card treatment, ported from the
 * Paper design (file 01KPH4YAP32T7JNXTH0CZS7AA3, node 2DW-0): an
 * animated Bayer-dither wave behind a top-pinned phone mock that crops
 * at the card's bottom edge.
 *
 * The dither layer itself lives in the shared DitherBackdrop (every
 * work card wears one as of 2026-07-20); this component pins the
 * original Paper-design params via overrides so the anchor card's
 * composition is unchanged, then adds the phone mock. The screen is
 * the static Lunch-menu mock exported from the Paper file.
 *
 * All dimensions are the Paper card's values × 0.57 — the design was
 * authored at 737×567, the marquee cell renders at 420×323 (same 1.3
 * aspect), so the composition scales uniformly.
 */

import DitherBackdrop from "./DitherBackdrop";

// Paper node 2I9-0's values, pinned so the seeded variation the other
// cards get never drifts this one: speed 0.15, centered pattern,
// scale 1.58, phase 0.
const PAPER_PARAMS = {
  speed: 0.15,
  frame: 0,
  offsetX: 0,
  offsetY: 0,
  scale: 1.58,
};

// Static Lunch-menu screen exported from the Paper mock (node 2F5-0).
const MOCK_SRC = "/images/gallery/fb-ordering/fb-dither-mock.webp";

export default function FnbDitherFrame() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <DitherBackdrop seed="fb-ordering" overrides={PAPER_PARAMS} />

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
