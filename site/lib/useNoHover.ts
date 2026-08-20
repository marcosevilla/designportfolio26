"use client";

import { useEffect, useState } from "react";

/**
 * True when the device has no hover-capable primary pointer (phones,
 * tablets). Components that reveal controls on hover use this to render
 * them persistently instead — the state-driven twin of the existing
 * `@media (hover: none)` CSS accommodations (.mq-info, .demo-try-pill).
 * SSR-safe: false on the server, resolves on mount.
 */
export function useNoHover(): boolean {
  const [noHover, setNoHover] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: none)");
    const update = () => setNoHover(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return noHover;
}
