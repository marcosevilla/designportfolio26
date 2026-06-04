"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useNavOverlay } from "@/lib/NavOverlayContext";
import { NAV_ITEMS, useActiveSection, type NavItem } from "./HomeNav";
import ConnectLinks from "./ConnectLinks";

const EASE = [0.22, 1, 0.36, 1] as const;

// ── Geometry ──
const NAV_WIDTH = 260; // nav panel width
const RAIL_WIDTH = 18; // resting checker rail width
const RAIL_WIDTH_HOVER = 28; // thickens on hover as a click affordance
const HEADER_H = 44; // SiteHeader height — rail + drawer start below it

// Monochrome checkerboard for the clickable rail — theme-aware via
// --color-fg on the surface token. Contrast bumped to 10% so the
// pattern reads clearly (mirrors the grid header bar in CaseStudyList).
const CHECKER = "color-mix(in srgb, var(--color-fg) 10%, transparent)";
const checkerBg: React.CSSProperties = {
  backgroundColor: "var(--color-bg)",
  backgroundImage: `linear-gradient(45deg, ${CHECKER} 25%, transparent 25%, transparent 75%, ${CHECKER} 75%), linear-gradient(45deg, ${CHECKER} 25%, transparent 25%, transparent 75%, ${CHECKER} 75%)`,
  backgroundSize: "6px 6px",
  backgroundPosition: "0 0, 3px 3px",
};

function ChevronRight({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M6 3.5L10.5 8L6 12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Click-to-open navigation. At rest on desktop a thin checkered rail
 * peeks at the left of the viewport. Hovering it thickens the checker
 * band and reveals a chevron (a click affordance) — it does NOT open on
 * hover. Clicking the rail slides the nav panel in. The drawer closes by
 * clicking the backdrop (anywhere outside the panel) or the icon button
 * in SiteHeader, which toggles the same `navOpen` state. On touch/mobile
 * the rail is hidden entirely; the hamburger is the only entry point.
 */
export default function NavOverlay() {
  const { navOpen, setNavOpen } = useNavOverlay();
  const { activeId, setAndLock } = useActiveSection();
  const router = useRouter();

  const [isDesktop, setIsDesktop] = useState(false);
  const [railHover, setRailHover] = useState(false);

  const close = () => setNavOpen(false);

  // Track desktop vs touch/mobile — the rail affordance is desktop-only.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    item: NavItem,
  ) => {
    e.preventDefault();

    if (item.kind === "page" && item.id === "about") {
      router.push("/?about=1");
      close();
      return;
    }

    const id = item.id;
    setAndLock(id);
    close();

    requestAnimationFrame(() => {
      const section = document.getElementById(id);
      if (!section) {
        if (window.location.pathname !== "/") {
          router.push(`/#${id}`);
        }
        return;
      }
      if (id === "projects") {
        const firstCard = section.querySelector(
          "button[aria-label^='Open project gallery']",
        ) as HTMLElement | null;
        if (firstCard) {
          firstCard.scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }
      }
      if (id === "home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <>
      {/* Clickable checker rail — desktop only, hidden while the drawer
          is open. Invisible at rest; hovering the left edge paints the
          checker, thickens the band, and reveals a chevron. Click opens. */}
      {isDesktop && !navOpen && (
        <button
          type="button"
          aria-label="Open navigation"
          onClick={() => setNavOpen(true)}
          onMouseEnter={() => setRailHover(true)}
          onMouseLeave={() => setRailHover(false)}
          style={{
            position: "fixed",
            top: HEADER_H,
            bottom: 0,
            left: 0,
            width: railHover ? RAIL_WIDTH_HOVER : RAIL_WIDTH,
            zIndex: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            border: 0,
            borderRight: railHover
              ? "0.5px solid color-mix(in srgb, var(--color-fg) 16%, transparent)"
              : "0.5px solid transparent",
            cursor: "pointer",
            transition: "width 200ms cubic-bezier(0.22, 1, 0.36, 1)",
            // Resting state is an invisible hover strip at the left edge;
            // the checker pattern only paints once the cursor enters it.
            ...(railHover ? checkerBg : { backgroundColor: "transparent" }),
          }}
        >
          <motion.span
            aria-hidden
            initial={false}
            animate={{ opacity: railHover ? 1 : 0, x: railHover ? 0 : -3 }}
            transition={{ duration: 0.18, ease: EASE }}
            style={{ display: "flex", color: "var(--color-fg-secondary)" }}
          >
            <ChevronRight />
          </motion.span>
        </button>
      )}

      {/* Backdrop — click anywhere outside the panel to close. */}
      <AnimatePresence>
        {navOpen && (
          <motion.div
            key="nav-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
            onClick={close}
            className="fixed inset-0 z-[110]"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--color-bg) 50%, transparent)",
            }}
            aria-hidden
          />
        )}
      </AnimatePresence>

      {/* Drawer — nav panel + checker edge as one element. Always
          mounted; transform drives the slide. The checker edge rides the
          panel's right side so the texture is preserved while open. */}
      <aside
        aria-label="Primary"
        style={{
          position: "fixed",
          top: HEADER_H,
          bottom: 0,
          left: 0,
          width: NAV_WIDTH + RAIL_WIDTH,
          display: "flex",
          flexDirection: "row",
          zIndex: 120,
          transform: `translateX(${navOpen ? 0 : -(NAV_WIDTH + RAIL_WIDTH)}px)`,
          transition: "transform 340ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* Nav panel — opaque page bg so content behind doesn't bleed
            through. `inert` while closed so off-screen links aren't
            tab-reachable. */}
        <div
          inert={!navOpen ? true : undefined}
          className="flex flex-col px-5 py-5 h-full"
          style={{
            width: NAV_WIDTH,
            flexShrink: 0,
            backgroundColor: "var(--color-bg)",
            backgroundImage: "var(--grain-image)",
            backgroundSize: "200px 200px",
            backgroundBlendMode: "multiply",
            boxShadow: navOpen
              ? "6px 0 18px -10px rgba(0,0,0,0.10)"
              : undefined,
          }}
        >
          <ul className="flex flex-col gap-2">
            {NAV_ITEMS.map((item) => {
              const active =
                item.kind === "page" ? false : item.id === activeId;
              return (
                <li key={item.id}>
                  <a
                    href={item.kind === "page" ? "#" : `#${item.id}`}
                    onClick={(e) => handleClick(e, item)}
                    className="block transition-colors hover:text-(--color-accent)"
                    style={{
                      fontFamily:
                        "var(--font-geist-mono), ui-monospace, Menlo, monospace",
                      fontSize: 12,
                      fontWeight: 500,
                      lineHeight: "22px",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: active
                        ? "var(--color-accent)"
                        : "var(--color-fg-secondary)",
                    }}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>

          <div
            className="mt-auto pt-5"
            style={{ borderTop: "0.5px solid var(--color-border)" }}
          >
            <ConnectLinks />
          </div>
        </div>

        {/* Checker edge — same texture as the resting rail, kept on the
            panel's right side so the checkered pattern persists while the
            drawer is open. Part of the same element, so it travels with
            the panel as the drawer slides. */}
        <div
          aria-hidden
          style={{
            width: RAIL_WIDTH,
            flexShrink: 0,
            borderLeft:
              "0.5px solid color-mix(in srgb, var(--color-fg) 16%, transparent)",
            ...checkerBg,
          }}
        />
      </aside>
    </>
  );
}
