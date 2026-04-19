"use client";

import PixelCanvas from "@/components/pixel-canvas/PixelCanvas";
import { createJellyfishScene } from "@/components/pixel-canvas/scenes/jellyfish";
import { useMemo } from "react";

export default function PixelLabPage() {
  const scene = useMemo(() => createJellyfishScene(), []);

  return (
    <div style={{ padding: 40, display: "flex", flexDirection: "column", gap: 32 }}>
      <h1 style={{ fontSize: 18, fontWeight: 500 }}>Pixel Lab — Jellyfish</h1>

      <div style={{ display: "flex", gap: 48, alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 8 }}>Desktop — 200×280 CSS (100×140 logical @ 2×)</div>
          <div style={{ border: "1px dashed var(--color-border)" }}>
            <PixelCanvas scene={scene} widthCssPx={200} heightCssPx={280} pixelScale={2} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 8 }}>Mobile — 140×196 CSS (70×98 logical @ 2×)</div>
          <div style={{ border: "1px dashed var(--color-border)" }}>
            <PixelCanvas scene={scene} widthCssPx={140} heightCssPx={196} pixelScale={2} />
          </div>
        </div>
      </div>
    </div>
  );
}
