"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useNavOverlay } from "@/lib/NavOverlayContext";
import { NAV_ITEMS, useActiveSection, type NavItem } from "./HomeNav";
import ConnectLinks from "./ConnectLinks";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Hamburger-triggered nav surface. Renders a left-anchored sidebar
 *  with the section nav (Home / Work / Playground / About) and the
 *  ConnectLinks cluster. The sidebar slides in from the left; main
 *  content blurs via MainBlurLayer's response to navOpen. */
export default function NavOverlay() {
  const { navOpen, setNavOpen } = useNavOverlay();
  const { activeId, setAndLock } = useActiveSection();
  const router = useRouter();

  const close = () => setNavOpen(false);

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    item: NavItem,
  ) => {
    e.preventDefault();

    if (item.kind === "page" && item.id === "about") {
      // HomeLayout listens for `?about=1` to flip into About mode.
      router.push("/?about=1");
      close();
      return;
    }

    const id = item.id;
    setAndLock(id);
    close();

    // Wait one frame so the overlay starts collapsing before scrolling;
    // makes the transition feel intentional rather than racing.
    requestAnimationFrame(() => {
      const section = document.getElementById(id);
      if (!section) {
        // Section is on the home page — if we're on a different route,
        // navigate home first and let the hash handle the scroll.
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
    <AnimatePresence>
      {navOpen && (
        <>
          {/* Backdrop — click to close. Sits below the sidebar. */}
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

          {/* Sidebar — slides in from the left. */}
          <motion.aside
            key="nav-sidebar"
            initial={{ x: -16, opacity: 0, filter: "blur(8px)" }}
            animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ x: -16, opacity: 0, filter: "blur(8px)" }}
            transition={{ duration: 0.28, ease: EASE }}
            className="fixed top-14 left-4 sm:left-6 z-[120] w-[260px] flex flex-col px-5 py-5"
            style={{
              backgroundColor: "var(--color-bg)",
              border: "0.5px solid var(--color-border)",
              borderRadius: 4,
              boxShadow: "0 6px 18px -8px rgba(0,0,0,0.10)",
            }}
            aria-label="Primary"
          >
            <ul className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
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

            <div className="mt-6 pt-5" style={{ borderTop: "0.5px solid var(--color-border)" }}>
              <ConnectLinks />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
