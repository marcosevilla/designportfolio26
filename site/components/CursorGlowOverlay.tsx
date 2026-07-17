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

    const move = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      parent.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
      parent.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    };
    const enter = (e: MouseEvent) => {
      setIsHovered(true);
      move(e);
      parent.style.transition = "transform 350ms ease-out";
      parent.style.transform = `scale(${GLOW.hoverScale})`;
    };
    const leave = () => {
      setIsHovered(false);
      parent.style.transform = "scale(1)";
    };

    parent.addEventListener("mousemove", move);
    parent.addEventListener("mouseenter", enter);
    parent.addEventListener("mouseleave", leave);
    return () => {
      parent.removeEventListener("mousemove", move);
      parent.removeEventListener("mouseenter", enter);
      parent.removeEventListener("mouseleave", leave);
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
