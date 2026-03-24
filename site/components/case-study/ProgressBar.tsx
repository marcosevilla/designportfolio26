"use client";

import { useEffect, useRef } from "react";

export default function ProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight <= 0 ? 0 : Math.min(100, (window.scrollY / docHeight) * 100);
      if (barRef.current) {
        barRef.current.style.width = `${progress}%`;
        barRef.current.setAttribute("aria-valuenow", String(Math.round(progress)));
      }
    };

    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div
      ref={barRef}
      role="progressbar"
      aria-label="Reading progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      className="fixed top-0 left-0 h-[2px] z-50 pointer-events-none"
      style={{
        width: "0%",
        backgroundColor: "var(--color-accent)",
      }}
    />
  );
}
