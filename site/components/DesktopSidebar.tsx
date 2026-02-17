"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useActivePanel, requestGoToWork, requestGoToBio } from "./SectionSnapContext";
import { useSidebar } from "@/lib/SidebarContext";
import { typescale } from "@/lib/typography";
import { SPRING_SNAP } from "@/lib/springs";
import { BackChevronIcon } from "./Icons";

const navLinks = [
  { href: "/", label: "Home", disabled: false },
  { href: "/#work", label: "Work", disabled: false },
];

export default function DesktopSidebar() {
  const pathname = usePathname();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const snapPanel = useActivePanel();
  const { tocItems, backHref } = useSidebar();

  // ── Nav mode helpers ──
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/" && snapPanel === "bio";
    if (href === "/#work") return (pathname === "/" && snapPanel === "work") || pathname.startsWith("/work");
    return pathname.startsWith(href);
  };

  const handleLinkClick = useCallback(
    (e: React.MouseEvent, href: string) => {
      if (href === "/#work") {
        if (pathname === "/") {
          e.preventDefault();
          requestGoToWork();
        }
      } else if (href === "/" && pathname === "/") {
        e.preventDefault();
        requestGoToBio();
      }
    },
    [pathname]
  );

  // ── Determine mode ──
  const isTocMode = tocItems !== null;

  // Active index for star positioning (nav mode only)
  const activeIndex = navLinks.findIndex((link) => isActive(link.href));
  const navStarY = activeIndex * 36;

  return (
      <aside className="hidden lg:flex fixed top-[18vh] flex-col" style={{ left: "48px", width: "130px" }}>
        {/* Items list */}
        <div className="flex-1 min-h-0">
          {isTocMode ? (
            /* ── TOC Mode — only Back link, TOC is rendered inline in case study ── */
            <div>
              <Link
                href={backHref ?? "/#work"}
                className="flex items-center gap-1 text-[14px] transition-colors hover:text-[var(--color-accent)]"
                style={{ color: "var(--color-fg-secondary)" }}
              >
                <BackChevronIcon />
                Back
              </Link>
            </div>
          ) : (
            /* ── Nav Mode ── */
            <ul
              className="flex flex-col gap-3 relative"
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {activeIndex >= 0 && (
                <motion.span
                  className="absolute left-0 pointer-events-none"
                  style={{
                    color: "var(--color-accent)",
                    fontSize: "14px",
                    lineHeight: "24px",
                  }}
                  animate={{
                    y: navStarY,
                    opacity: 1,
                  }}
                  initial={{ y: navStarY, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 28,
                  }}
                  aria-hidden
                >
                  ✸
                </motion.span>
              )}
              {navLinks.map((link, index) => {
                const active = !link.disabled && isActive(link.href);
                const isHovered = !link.disabled && hoveredIndex === index;
                const textColor = link.disabled
                  ? "var(--color-fg-tertiary)"
                  : isHovered || active
                    ? "var(--color-accent)"
                    : "var(--color-fg-secondary)";

                return (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.06,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                  >
                    {link.disabled ? (
                      <span
                        className="block"
                        style={{ ...typescale.nav, color: textColor, cursor: "default" }}
                      >
                        {link.label}
                      </span>
                    ) : (
                      <Link
                        href={link.href}
                        className="block transition-colors"
                        style={typescale.nav}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onClick={(e) => handleLinkClick(e, link.href)}
                      >
                        <motion.span
                          className="inline-block"
                          animate={{ x: active ? 18 : isHovered ? 8 : 0 }}
                          transition={SPRING_SNAP}
                          style={{ color: textColor }}
                        >
                          {link.label}
                        </motion.span>
                      </Link>
                    )}
                  </motion.li>
                );
              })}
            </ul>
          )}
        </div>

      </aside>
  );
}
