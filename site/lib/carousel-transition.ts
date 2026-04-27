"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "framer-motion";

/**
 * Drives the click → expand → navigate transition for the carousel.
 *
 * Call `trigger(slug)` on card click:
 *   1. `expandingSlug` is set immediately — the card starts its morph animation.
 *   2. 300ms later, `router.push('/work/${slug}')` fires, swapping in the route
 *      whose gradient hero matches the fully-expanded card — hiding the seam.
 *
 * Reduced-motion users skip the morph and navigate immediately.
 */
export function useExpandAndNavigate() {
  const router = useRouter();
  const [expandingSlug, setExpandingSlug] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();

  const trigger = useCallback(
    (slug: string) => {
      if (expandingSlug) return; // ignore double-clicks during in-flight expand
      if (reducedMotion) {
        router.push(`/work/${slug}`);
        return;
      }
      setExpandingSlug(slug);
      setTimeout(() => {
        router.push(`/work/${slug}`);
      }, 300);
    },
    [expandingSlug, reducedMotion, router]
  );

  return { expandingSlug, trigger };
}
