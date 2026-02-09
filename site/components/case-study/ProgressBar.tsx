"use client";

import { useEffect, useState } from "react";

export default function ProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight <= 0 ? 0 : Math.min(100, (window.scrollY / docHeight) * 100));
    };

    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 h-[2px] z-50 pointer-events-none"
      style={{
        width: `${progress}%`,
        backgroundColor: "var(--color-accent)",
        transition: "width 50ms linear",
      }}
    />
  );
}
