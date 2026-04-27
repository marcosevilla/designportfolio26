"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSidebar } from "@/lib/SidebarContext";
import { BackChevronIcon } from "../Icons";

const STAR_SPRING = { type: "spring" as const, stiffness: 300, damping: 34 };
const LINK_SPRING = { type: "spring" as const, stiffness: 400, damping: 25 };

// Smooth-scroll typically lands within ~600-800ms. Lock the IntersectionObserver
// for 900ms so it can't clobber the click target with intermediate sections it
// passes through during the scroll.
const SCROLL_LOCK_MS = 900;

export default function InlineTOC() {
  const { tocItems, activeTocId, setActiveTocIdAndLock, backHref } = useSidebar();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!tocItems) return null;

  const activeIndex = tocItems.findIndex((item) => item.id === activeTocId);

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    // Lock the observer for the duration of the smooth-scroll, so it can't
    // override the click target as intermediate sections cross the active band.
    setActiveTocIdAndLock(id, SCROLL_LOCK_MS);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      className="hidden lg:block fixed top-[18vh]"
      style={{ width: "130px", left: "48px" }}
    >
      <Link
        href={backHref ?? "/#work"}
        className="flex items-center gap-1 text-[13px] transition-colors hover:text-[var(--color-accent)] mb-6"
        style={{ color: "var(--color-fg-secondary)" }}
      >
        <BackChevronIcon size={12} />
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
            transition={STAR_SPRING}
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
                  transition={LINK_SPRING}
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
