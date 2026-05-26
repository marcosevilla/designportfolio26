"use client";

import Link from "next/link";
import HeaderToolbar from "./HeaderToolbar";
import { HERO_NAME } from "@/lib/bio-content";

/** Global site header. Two corner-anchored elements (no visible bar):
 *  the wordmark fixed top-left, the HeaderToolbar fixed top-right.
 *  Mounted in app/layout.tsx so it appears on every route. */
export default function SiteHeader() {
  return (
    <>
      {/* Wordmark — fixed top-left, identity label across every page. */}
      <Link
        href="/"
        className="hidden lg:inline-flex fixed top-4 left-4 sm:left-6 z-[80] items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-(--color-accent)"
        aria-label="Marco Sevilla — home"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 16,
          fontWeight: 500,
          letterSpacing: "-0.01em",
          lineHeight: 1,
          // Match the toolbar pill's 38px height by using a fixed line-box
          // so name + toolbar share a baseline at top:16px.
          height: 38,
          alignItems: "center",
          color: "var(--color-fg)",
          textDecoration: "none",
        }}
      >
        {HERO_NAME}
      </Link>

      <HeaderToolbar />
    </>
  );
}
