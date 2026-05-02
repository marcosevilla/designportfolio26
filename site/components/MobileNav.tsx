"use client";

import Link from "next/link";
import { useSidebar } from "@/lib/SidebarContext";
import { BackChevronIcon } from "./Icons";

export default function MobileNav() {
  const { tocItems, backHref } = useSidebar();

  if (tocItems === null) return null;

  return (
    <nav className="lg:hidden sticky top-0 z-50 backdrop-blur-md bg-(--color-bg)/80 border-b border-border">
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
      </div>
    </nav>
  );
}
