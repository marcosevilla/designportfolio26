"use client";

// Cursor-tracking rim glow — restored 2026-07-17 from the deleted
// CaseStudyCard (git 7b962c1, removed in 30a84b3), values tuned in
// /dev/effects-lab. Drop inside any `relative overflow-hidden` frame as
// the last child: it listens on its parent element, so the frame needs
// no handler wiring of its own. Desktop-only (pointer: fine).

import { useEffect, useRef, useState } from "react";

// Tuned 2026-07-17 in /dev/effects-lab
const GLOW = {
  radius: 170,
  rimOpacity: 0.55,
  innerOpacity: 0.04,
  falloff: 55,
  hoverScale: 1.005,
};

export default function CursorGlowOverlay() {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    // ── Rect caching (fixes audit F-34) ───────────────────────────────
    // `move` used to call getBoundingClientRect() on every mousemove and
    // then write two CSS custom properties on the same element. The write
    // invalidates layout, so the *next* event's read forced a synchronous
    // recalc — read → write → read, per mousemove, on the hovered card.
    // Now the rect is measured once on enter and refreshed only when it
    // can actually change (scroll while hovered, resize), and the writes
    // are rAF-coalesced so a burst of mousemoves paints once per frame.
    let rect: DOMRect | null = null;
    let raf = 0;
    let lastX = 0;
    let lastY = 0;

    const measure = () => {
      rect = parent.getBoundingClientRect();
    };
    const flush = () => {
      raf = 0;
      if (!rect) return;
      parent.style.setProperty("--mouse-x", `${lastX - rect.left}px`);
      parent.style.setProperty("--mouse-y", `${lastY - rect.top}px`);
    };
    const move = (e: MouseEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      if (!raf) raf = requestAnimationFrame(flush);
    };
    // Only listen for scroll while hovered — one card is hovered at a
    // time, so this never becomes a per-card global scroll listener.
    const scrollOpts = { passive: true, capture: true } as const;
    const enter = (e: MouseEvent) => {
      setIsHovered(true);
      measure();
      lastX = e.clientX;
      lastY = e.clientY;
      flush();
      window.addEventListener("scroll", measure, scrollOpts);
      parent.style.transition = "transform 350ms ease-out";
      parent.style.transform = `scale(${GLOW.hoverScale})`;
    };
    const leave = () => {
      setIsHovered(false);
      window.removeEventListener("scroll", measure, scrollOpts);
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      parent.style.transform = "scale(1)";
    };

    parent.addEventListener("mousemove", move, { passive: true });
    parent.addEventListener("mouseenter", enter);
    parent.addEventListener("mouseleave", leave);
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      parent.removeEventListener("mousemove", move);
      parent.removeEventListener("mouseenter", enter);
      parent.removeEventListener("mouseleave", leave);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, scrollOpts);
    };
  }, []);

  const glowGradient = `radial-gradient(${GLOW.radius}px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), var(--color-accent), transparent ${GLOW.falloff}%)`;

  return (
    <div ref={ref} className="absolute inset-0 pointer-events-none hidden sm:block" aria-hidden="true">
      {/* Rim: gradient masked down to a 1px inset ring */}
      <div
        className="absolute inset-0 transition-opacity duration-200"
        style={{
          background: glowGradient,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1px",
          opacity: isHovered ? GLOW.rimOpacity : 0,
        }}
      />
      {/* Inner wash */}
      <div
        className="absolute inset-0 transition-opacity duration-200"
        style={{
          background: glowGradient,
          opacity: isHovered ? GLOW.innerOpacity : 0,
        }}
      />
    </div>
  );
}
