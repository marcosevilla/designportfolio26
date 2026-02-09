"use client";

import { useEffect, useState } from "react";
import { useScrollContainer } from "@/lib/ScrollContainerContext";

interface TOCItem {
  id: string;
  label: string;
}

export default function StickyTOC({ items }: { items: TOCItem[] }) {
  const [activeId, setActiveId] = useState<string>("");
  const { scrollRef } = useScrollContainer();

  useEffect(() => {
    const root = scrollRef?.current ?? undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { root, rootMargin: "-20% 0px -70% 0px" }
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [items, scrollRef]);

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;

    const container = scrollRef?.current;
    if (container) {
      // Dialog mode: scroll the container element
      container.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
    } else {
      // Standalone page mode: scroll the document
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav className="hidden lg:block" aria-label="Table of contents">
      <ul className="flex flex-col gap-3">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => handleClick(e, item.id)}
                className="block text-[13px] leading-snug pl-3 border-l-2 transition-colors duration-200"
                style={{
                  color: isActive ? "var(--color-accent)" : "var(--color-fg-tertiary)",
                  borderColor: isActive ? "var(--color-accent)" : "transparent",
                }}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
