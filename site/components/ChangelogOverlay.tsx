"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useChangelogOverlay } from "@/lib/ChangelogOverlayContext";
import type { ChangelogGroup } from "@/lib/changelog";
import { CloseIcon } from "./Icons";

const BLUR_EASE = [0.22, 1, 0.36, 1] as const;

const MONO = "var(--font-geist-mono), ui-monospace, Menlo, monospace";

/** Compact "What's new" overlay. Opens from the changelog button in
 *  HeaderToolbar. Renders the month-grouped milestone log (parsed from
 *  docs/CHANGELOG.md at build time) as a scrollable timeline. Follows the
 *  same chrome as MusicOverlay — portal to body, solid page-bg backdrop,
 *  Esc to close, scroll-locked, blur-in entrance. */
export default function ChangelogOverlay({ groups }: { groups: ChangelogGroup[] }) {
  const { changelogOpen, setChangelogOpen } = useChangelogOverlay();
  const [mounted, setMounted] = useState(false);

  const close = () => setChangelogOpen(false);

  useEffect(() => setMounted(true), []);

  // Lock body scroll while the overlay is open.
  useEffect(() => {
    if (!changelogOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [changelogOpen]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {changelogOpen && (
        <motion.div
          key="changelog-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: BLUR_EASE }}
          onClick={close}
          className="fixed inset-0 z-[120] flex items-start justify-center px-4 py-16 sm:py-20 overflow-y-auto"
          style={{ backgroundColor: "var(--color-bg)" }}
          aria-modal="true"
          role="dialog"
          aria-label="What's new — changelog"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 16, filter: "blur(12px)" }}
            transition={{ duration: 0.42, ease: BLUR_EASE }}
            className="w-full max-w-[560px] my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header row — title + close. */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col gap-1">
                <h2
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 16,
                    fontWeight: 500,
                    color: "var(--color-fg)",
                    letterSpacing: "-0.01em",
                    lineHeight: 1,
                  }}
                >
                  What&rsquo;s new
                </h2>
                <p
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    fontWeight: 500,
                    color: "var(--color-fg-tertiary)",
                    letterSpacing: "0.04em",
                    lineHeight: 1,
                  }}
                >
                  How this site got built
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="bio-toolbar-btn focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)"
              >
                <CloseIcon size={15} />
              </button>
            </div>

            {/* Month-grouped timeline. A hairline rail runs down the left
                of each group's entries; each entry hangs a dot off it. */}
            <div className="flex flex-col gap-9">
              {groups.map((group) => (
                <section key={group.month}>
                  <h3
                    className="mb-4"
                    style={{
                      fontFamily: MONO,
                      fontSize: 11,
                      fontWeight: 500,
                      color: "var(--color-fg-tertiary)",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      lineHeight: 1,
                    }}
                  >
                    {group.month}
                  </h3>
                  <ul
                    className="flex flex-col gap-5 pl-5"
                    style={{
                      borderLeft: "0.5px solid var(--color-border)",
                    }}
                  >
                    {group.entries.map((entry, i) => (
                      <li key={i} className="relative">
                        {/* Dot on the rail. */}
                        <span
                          aria-hidden
                          className="absolute"
                          style={{
                            left: -20,
                            top: 6,
                            width: 5,
                            height: 5,
                            transform: "translateX(-50%)",
                            borderRadius: "50%",
                            backgroundColor: "var(--color-fg-tertiary)",
                          }}
                        />
                        <p
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: 14,
                            fontWeight: 500,
                            color: "var(--color-fg)",
                            letterSpacing: "-0.01em",
                            lineHeight: 1.4,
                          }}
                        >
                          {entry.title}
                        </p>
                        {entry.body && (
                          <p
                            className="mt-1"
                            style={{
                              fontFamily: "var(--font-sans)",
                              fontSize: 13,
                              fontWeight: 400,
                              color: "var(--color-fg-secondary)",
                              letterSpacing: "-0.005em",
                              lineHeight: 1.55,
                            }}
                          >
                            {entry.body}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
