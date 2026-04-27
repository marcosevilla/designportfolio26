"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

/**
 * Drives the click → expand → navigate transition for the carousel.
 *
 * Call `trigger(slug)` on card click:
 *   1. `expandingSlug` is set immediately — the card starts its morph animation.
 *   2. 300ms later, `router.push('/work/${slug}')` fires, swapping in the route
 *      whose gradient hero matches the fully-expanded card — hiding the seam.
 */
export function useExpandAndNavigate() {
  const router = useRouter();
  const [expandingSlug, setExpandingSlug] = useState<string | null>(null);

  const trigger = useCallback(
    (slug: string) => {
      setExpandingSlug(slug);
      setTimeout(() => {
        router.push(`/work/${slug}`);
      }, 300);
    },
    [router]
  );

  return { expandingSlug, trigger };
}
