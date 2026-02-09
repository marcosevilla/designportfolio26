"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSidebar } from "@/lib/SidebarContext";

export default function InlineTOC() {
  const { tocItems, activeTocId, backHref } = useSidebar();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!tocItems) return null;

  const activeIndex = tocItems.findIndex((item) => item.id === activeTocId);

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      className="hidden lg:block sticky top-24 shrink-0 self-start pt-8"
      style={{ width: "130px" }}
    >
      <Link
        href={backHref ?? "/#work"}
        className="flex items-center gap-1 text-[13px] transition-colors hover:text-[var(--color-accent)] mb-6"
        style={{ color: "var(--color-fg-secondary)" }}
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 12L6 8l4-4" />
        </svg>
        Back
      </Link>
      <ul
        className="flex flex-col gap-2 relative"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {activeIndex >= 0 && (
          <motion.span
            className="absolute left-0 pointer-events-none"
            style={{
              color: "var(--color-accent)",
              fontSize: "12px",
              lineHeight: "20px",
            }}
            animate={{
              y: activeIndex * 28,
              opacity: 1,
            }}
            initial={{ y: activeIndex * 28, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 34,
            }}
            aria-hidden
          >
            ✸
          </motion.span>
        )}
        {tocItems.map((item, index) => {
          const active = item.id === activeTocId;
          const isHovered = hoveredIndex === index;
          const textColor = isHovered || active
            ? "var(--color-accent)"
            : "var(--color-fg-secondary)";

          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => handleClick(e, item.id)}
                className="block transition-colors"
                style={{ fontSize: "13px", fontWeight: 400, lineHeight: "20px" }}
                onMouseEnter={() => setHoveredIndex(index)}
              >
                <motion.span
                  className="inline-block"
                  animate={{ x: active ? 18 : isHovered ? 8 : 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                  }}
                  style={{ color: textColor }}
                >
                  {item.label}
                </motion.span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
