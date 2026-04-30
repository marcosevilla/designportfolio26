"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { usePasswordGate } from "@/lib/PasswordGateContext";
import { LockIcon, BackChevronIcon } from "@/components/Icons";
import { typescale } from "@/lib/typography";

export default function WorkGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { unlocked, hydrated, requestUnlock } = usePasswordGate();

  // Gate /work index and all deeper case-study pages.
  const isCaseStudyPath = pathname === "/work" || pathname?.startsWith("/work/");
  const shouldGate = isCaseStudyPath && hydrated && !unlocked;

  useEffect(() => {
    if (shouldGate) requestUnlock();
  }, [shouldGate, requestUnlock]);

  if (!isCaseStudyPath) return <>{children}</>;

  // Before hydration, render nothing for case study paths to avoid flashing
  // gated content from SSR. After hydration, either show the locked screen
  // or the actual page.
  if (!hydrated) return null;
  if (!unlocked) {
    return (
      <motion.div
        className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-24"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div
          className="flex items-center justify-center mb-5"
          style={{
            width: 44,
            height: 44,
            background: "var(--color-muted)",
            color: "var(--color-fg-secondary)",
          }}
        >
          <LockIcon size={20} />
        </div>
        <h1 style={{ ...typescale.h3, color: "var(--color-fg)", marginBottom: 6 }}>
          This case study is locked
        </h1>
        <p
          style={{
            ...typescale.body,
            color: "var(--color-fg-secondary)",
            maxWidth: 420,
            marginBottom: 20,
          }}
        >
          Marco's still polishing things. Drop in the password to take a peek, or head back home.
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={requestUnlock}
            className="px-4 py-2 transition-opacity"
            style={{
              ...typescale.body,
              fontWeight: 500,
              color: "var(--color-bg)",
              background: "var(--color-fg)",
            }}
          >
            Enter password
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-2 transition-colors"
            style={{
              ...typescale.body,
              color: "var(--color-fg-secondary)",
            }}
          >
            <BackChevronIcon size={12} />
            Back home
          </Link>
        </div>
      </motion.div>
    );
  }

  return <>{children}</>;
}
