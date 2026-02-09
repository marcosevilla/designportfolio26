"use client";

import { useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActivePanel, requestGoToWork, requestGoToBio } from "./SectionSnapContext";
import { useSidebar } from "@/lib/SidebarContext";

const navLinks = [
  { href: "/", label: "Home", disabled: false },
  { href: "/#work", label: "Work", disabled: false },
  { href: "/writing", label: "Writing", disabled: true },
  { href: "/play", label: "Play", disabled: true },
];

export default function MobileNav() {
  const pathname = usePathname();
  const snapPanel = useActivePanel();
  const { tocItems, backHref } = useSidebar();

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

  const isTocMode = tocItems !== null;

  return (
    <>
      <nav className="lg:hidden sticky top-0 z-50 backdrop-blur-md bg-[var(--color-bg)]/80 border-b border-[var(--color-border)]">
        <div className="px-5 h-14 flex items-center justify-between">
          {isTocMode ? (
            /* ── TOC mode: Back link ── */
            <Link
              href={backHref ?? "/#work"}
              className="flex items-center gap-1 text-[14px] transition-colors"
              style={{ color: "var(--color-fg-secondary)" }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 12L6 8l4-4" />
              </svg>
              Back
            </Link>
          ) : (
            /* ── Nav mode: Page links ── */
            <div className="flex items-center gap-x-4">
              {navLinks.map((link) => {
                const active = !link.disabled && isActive(link.href);

                if (link.disabled) {
                  return (
                    <span
                      key={link.href}
                      className="flex items-center gap-1"
                      style={{ fontSize: "14px", color: "var(--color-fg-tertiary)", cursor: "default" }}
                    >
                      {link.label}
                    </span>
                  );
                }

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-1 transition-colors"
                    style={{ fontSize: "14px" }}
                    onClick={(e) => handleLinkClick(e, link.href)}
                  >
                    {active && (
                      <span style={{ color: "var(--color-accent)", fontSize: "12px" }}>
                        ✸
                      </span>
                    )}
                    <span
                      style={{
                        color: active
                          ? "var(--color-accent)"
                          : "var(--color-fg-secondary)",
                      }}
                    >
                      {link.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
