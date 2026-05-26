"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import HeaderToolbar from "./HeaderToolbar";
import { HERO_NAME } from "@/lib/bio-content";

/** Global site header. Full-width fixed bar at the top with an opaque
 *  page-bg fill so content scrolls cleanly behind it. The wordmark sits
 *  flush-left, the HeaderToolbar contents sit flush-right. A 1px bottom
 *  stroke appears once the user has scrolled past the header so the
 *  boundary against content is legible. Mounted in app/layout.tsx so it
 *  appears on every route. */
export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[80]"
      style={{
        backgroundColor: "var(--color-bg)",
        // Transparent until scrolled — visually identical to the page
        // surface, no boundary line. Once the user scrolls past the bar
        // a 1px stroke fades in to separate it from content beneath.
        borderBottom: "1px solid",
        borderBottomColor: scrolled
          ? "color-mix(in srgb, var(--color-border) 80%, transparent)"
          : "transparent",
        transition: "border-color 200ms ease-out",
      }}
    >
      <div className="flex items-center justify-between px-4 sm:px-6 h-14">
        <Link
          href="/"
          aria-label="Marco Sevilla — home"
          className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-(--color-accent)"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 16,
            fontWeight: 500,
            letterSpacing: "-0.01em",
            lineHeight: 1,
            color: "var(--color-fg)",
            textDecoration: "none",
          }}
        >
          {HERO_NAME}
        </Link>
        <HeaderToolbar />
      </div>
    </header>
  );
}
