"use client";

import Link from "next/link";
import { useSidebar } from "@/lib/SidebarContext";
import { BackChevronIcon } from "./Icons";

export default function MobileNav() {
  const { tocItems, backHref } = useSidebar();

  if (tocItems === null) return null;

  return (
    <nav className="lg:hidden sticky top-0 z-50 backdrop-blur-md bg-[var(--color-bg)]/80 border-b border-[var(--color-border)]">
      <div className="px-5 h-14 flex items-center justify-between">
        <Link
          href={backHref ?? "/#work"}
          className="flex items-center gap-1 text-[14px] transition-colors"
          style={{ color: "var(--color-fg-secondary)" }}
        >
          <BackChevronIcon />
          Back
        </Link>
      </div>
    </nav>
  );
}
