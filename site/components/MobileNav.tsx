"use client";

import Link from "next/link";
import { useSidebar } from "@/lib/SidebarContext";
import { BackChevronIcon } from "./Icons";
import HamburgerMenu from "./HamburgerMenu";

export default function MobileNav() {
  const { tocItems, backHref } = useSidebar();

  if (tocItems === null) return null;

  // `chat-cmp-show-as-mobilenav` makes this also surface at lg+ when the
  // chat panel is open and the viewport is below xl — the InlineTOC has
  // already been hidden by .chat-cmp-hide, so the case-study top bar
  // takes over the nav role with Back + the hamburger.
  return (
    <nav className="chat-cmp-show-as-mobilenav lg:hidden sticky top-0 z-50 backdrop-blur-md bg-(--color-bg)/80 border-b border-border">
      <div className="px-5 h-14 flex items-center justify-between">
        <Link
          href={backHref ?? "/#projects"}
          className="flex items-center gap-1 transition-colors"
          style={{
            fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
            fontSize: "12px",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--color-fg-secondary)",
          }}
        >
          <BackChevronIcon />
          Back
        </Link>
        <HamburgerMenu />
      </div>
    </nav>
  );
}
