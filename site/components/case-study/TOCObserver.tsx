"use client";

import { useEffect } from "react";
import { useSidebar } from "@/lib/SidebarContext";

export default function TOCObserver({ sectionIds }: { sectionIds: string[] }) {
  const { setActiveTocId } = useSidebar();

  // `sectionIds` is usually a fresh array literal from the page, so depending
  // on the array identity would tear down and rebuild the observer on every
  // render. Depend on its contents instead.
  const idsKey = sectionIds.join("|");

  useEffect(() => {
    const ids = idsKey ? idsKey.split("|") : [];

    // Track every section currently in the active band. An
    // IntersectionObserver callback receives only the sections whose state
    // CHANGED, so the latest batch is not the full picture — the previous
    // implementation wrote `setActiveTocId` once per intersecting entry in
    // the batch, meaning the last entry in an unordered array won, and it
    // never removed a section that had left the band. Symptom: the TOC
    // marker landed on the wrong item whenever two section boundaries
    // crossed the band together. (Same fix as HomeNav's useActiveSection.)
    const intersecting = new Set<HTMLElement>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) intersecting.add(el);
          else intersecting.delete(el);
        }

        // Sort by document position, then take the bottom-most match: when
        // two sections straddle the band, the lower one is the heading the
        // reader is scrolling into, which is the one to highlight.
        const visible = Array.from(intersecting).sort(
          (a, b) =>
            a.getBoundingClientRect().top - b.getBoundingClientRect().top,
        );
        const chosen = visible[visible.length - 1];

        // No match means the reader is between bands (e.g. mid-way through a
        // long section). Hold the previous id rather than clearing, so the
        // marker never blanks out mid-scroll.
        if (chosen) setActiveTocId(chosen.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );

    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [idsKey, setActiveTocId]);

  return null;
}
