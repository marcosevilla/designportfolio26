"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSidebar } from "@/lib/SidebarContext";
import { BackChevronIcon } from "../Icons";

const STAR_SPRING = { type: "spring" as const, stiffness: 300, damping: 34 };
const LINK_SPRING = { type: "spring" as const, stiffness: 400, damping: 25 };
const INSTANT = { duration: 0 };

export default function InlineTOC() {
  const { tocItems, activeTocId, setActiveTocId, backHref } = useSidebar();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  // When the user clicks a TOC link, the star + link nudge should jump
  // immediately rather than spring along with the page scroll. snapNow flips
  // true for one render to override the spring with a zero-duration transition,
  // then resets so subsequent scroll-driven moves use the spring as normal.
  const [snapNow, setSnapNow] = useState(false);

  if (!tocItems) return null;

  const activeIndex = tocItems.findIndex((item) => item.id === activeTocId);

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    // Update the active id immediately so the star doesn't wait for the
    // IntersectionObserver (which only fires after the scroll lands).
    setActiveTocId(id);
    setSnapNow(true);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    // Reset snap on the next frame so the *next* render (scroll-driven changes)
    // gets the regular spring back.
    requestAnimationFrame(() => setSnapNow(false));
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
            transition={snapNow ? INSTANT : STAR_SPRING}
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
                  transition={snapNow ? INSTANT : LINK_SPRING}
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
