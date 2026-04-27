"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "framer-motion";

/**
 * Manages the click → expand → navigate sequence for a carousel card.
 *
 * Phase 1 implementation: scale-up-then-cut.
 * - On trigger, sets expandingSlug → caller animates the card to fullscreen.
 * - 300ms later, calls router.push to the case study route.
 * - When user returns (browser back), expandingSlug naturally resets on remount.
 *
 * Reduced motion: skips the morph entirely, navigates immediately.
 */
export function useExpandAndNavigate() {
  const router = useRouter();
  const [expandingSlug, setExpandingSlug] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();

  const trigger = useCallback(
    (slug: string) => {
      if (expandingSlug) return; // ignore during in-flight expand
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
