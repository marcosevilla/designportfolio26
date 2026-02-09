"use client";

import { useEffect } from "react";
import { useSidebar } from "@/lib/SidebarContext";

export default function TOCObserver({ sectionIds }: { sectionIds: string[] }) {
  const { setActiveTocId } = useSidebar();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveTocId(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [sectionIds, setActiveTocId]);

  return null;
}
