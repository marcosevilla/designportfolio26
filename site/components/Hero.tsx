"use client";

import { useLayoutEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PARAGRAPHS, HERO_NAME } from "@/lib/bio-content";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { typescale } from "@/lib/typography";
import { HighlightableBio } from "./HighlightableBio";
import { HighlighterProvider } from "./HighlighterContext";
import HeroToolbar from "./HeroToolbar";
import Resume from "./Resume";

const CV_ENTRIES = [
  { company: "Canary Technologies", title: "Product Designer", city: "San Francisco" },
  { company: "General Task", title: "Founding Product Designer", city: "Redwood City" },
  { company: "Vivino", title: "Visual Designer", city: "San Francisco" },
  { company: "Vyond", title: "Visual Designer", city: "San Mateo" },
];

function LearnMoreCVButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group mt-6 inline-flex items-center gap-1.5 transition-colors cursor-pointer focus:outline-none hover:text-(--color-accent) focus-visible:text-(--color-accent)"
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: "14px",
        fontWeight: 500,
        lineHeight: 1.4,
        color: "var(--color-fg)",
        background: "none",
        border: 0,
        padding: 0,
      }}
    >
      <span className="underline underline-offset-4 decoration-1">Learn more &amp; CV</span>
      <span
        aria-hidden
        className="inline-block transition-transform duration-200 ease-out group-hover:translate-x-1"
      >
        →
      </span>
    </button>
  );
}

function ExperienceList() {
  return (
    <div id="experience" className="mt-8">
      <p
        style={{
          fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
          fontSize: "11px",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--color-fg-tertiary)",
          marginBottom: "12px",
        }}
      >
        Experience
      </p>
      <ul className="flex flex-col gap-3.5">
        {CV_ENTRIES.map((entry) => (
          <li
            key={`${entry.company}-${entry.title}`}
            className="flex items-baseline justify-between gap-4"
          >
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "14px",
                lineHeight: 1.4,
                color: "var(--color-fg-secondary)",
              }}
            >
              <span style={{ color: "var(--color-fg)", fontWeight: 500 }}>{entry.company}</span>
              <span aria-hidden style={{ color: "var(--color-fg-tertiary)" }}> — </span>
              {entry.title}
            </p>
            <p
              style={{
                fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
                fontSize: "11px",
                lineHeight: 1.4,
                color: "var(--color-fg-tertiary)",
                whiteSpace: "nowrap",
              }}
            >
              {entry.city}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

const BLUR_EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Sets `--wordmark-fontsize` on the wrapper so the wordmark + star group
 * scales to fill `widthFraction` of the column's content width. h1 font-size
 * and the star's em-based dimensions both consume this variable so they
 * scale as a single visual unit.
 */
function useFitWordmark(
  wrapperRef: React.RefObject<HTMLDivElement | null>,
  widthFraction = 1,
  maxContainerPx?: number,
) {
  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const fit = () => {
      // Set on documentElement so other sections (e.g. the projects h2)
      // can match the wordmark size. Also mirror on the wrapper for the
      // PlaygroundStar's em-based sizing.
      const root = document.documentElement;
      root.style.setProperty("--wordmark-fontsize", "100px");
      el.style.setProperty("--wordmark-fontsize", "100px");
      const rawW = el.clientWidth;
      const containerW = maxContainerPx ? Math.min(rawW, maxContainerPx) : rawW;
      const naturalW = el.scrollWidth;
      if (containerW === 0 || naturalW === 0) return;
      const scale = (containerW / naturalW) * widthFraction;
      const next = `${100 * scale}px`;
      root.style.setProperty("--wordmark-fontsize", next);
      el.style.setProperty("--wordmark-fontsize", next);
    };

    fit();

    // Re-fit once webfonts have loaded (Geist Sans metrics differ from the
    // fallback, so the initial measurement using the fallback would be
    // slightly off).
    if (typeof document !== "undefined" && (document as Document & { fonts?: FontFaceSet }).fonts) {
      (document as Document & { fonts: FontFaceSet }).fonts.ready.then(fit).catch(() => {});
    }

    const obs = new ResizeObserver(fit);
    obs.observe(el);
    return () => obs.disconnect();
  }, [wrapperRef, widthFraction]);
}

function PlaygroundStar() {
  const reducedMotion = usePrefersReducedMotion();

  // Decorative themed star — always rendered, always pinned to the accent
  // color. Subtle shine streak sweeps across the glyph on a slow cycle.
  const streakKeyframes = {
    opacity: [0, 0, 1, 1, 0],
    backgroundPositionX: ["150%", "150%", "150%", "-150%", "-150%"],
  };
  const streakTransition = {
    duration: 6.5,
    times: [0, 0.78, 0.8, 0.92, 0.94],
    repeat: Infinity,
    ease: "linear" as const,
  };

  return (
    <span
      aria-hidden
      className="flex items-center justify-center shrink-0"
      style={{
        color: "var(--color-accent)",
        // Sized in em so the star scales with the wordmark group. Translate
        // also in em — top of star sits near the cap height, tucked tight
        // against the final "a" of "Sevilla".
        width: "0.66em",
        height: "0.66em",
        fontSize: "var(--wordmark-fontsize, 48px)",
        transform: "translate(-0.12em, -0.05em)",
      }}
    >
      <span
        style={{ position: "relative", display: "inline-block", fontSize: "0.42em", lineHeight: 1 }}
      >
        <span style={{ display: "inline-block" }}>✸</span>
        {!reducedMotion && (
          <motion.span
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              backgroundImage:
                "linear-gradient(110deg, transparent 38%, rgba(255,255,255,0.95) 50%, transparent 62%)",
              backgroundSize: "300% 100%",
              backgroundRepeat: "no-repeat",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
              willChange: "background-position, opacity",
            }}
            animate={streakKeyframes}
            transition={streakTransition}
          >
            ✸
          </motion.span>
        )}
      </span>
    </span>
  );
}

export default function Hero({
  matrix,
  children,
  aboutMeOpen,
  onAboutMeChange,
  wordmarkRef: externalWordmarkRef,
  aboutMeHeaderRef,
}: {
  /** Optional render slot for the LED matrix area, placed between the
   *  sticky header and the bio so it sits *under* the pinned header. */
  matrix?: React.ReactNode;
  children?: React.ReactNode;
  aboutMeOpen: boolean;
  onAboutMeChange: (open: boolean) => void;
  wordmarkRef?: React.Ref<HTMLDivElement>;
  aboutMeHeaderRef?: React.Ref<HTMLHeadingElement>;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const initial = reducedMotion ? false : { opacity: 0, filter: "blur(12px)" };
  const animate = { opacity: 1, filter: "blur(0px)" };
  const transition = { duration: 0.9, ease: BLUR_EASE };
  const wordmarkWrapperRef = useRef<HTMLDivElement | null>(null);
  // Cap the fit container at the original 500px-column inner width (500 - 32
  // for sm:px-8) so the wordmark — and the projects "Work" h2, which reads
  // the same CSS var — stay at their original size after the body column
  // widens to 650px.
  useFitWordmark(wordmarkWrapperRef, 2 / 3, 468);

  // Combined ref: keeps the local ref (for fit-to-width) and forwards to any
  // external ref (used by HomeLayout to align the side nav's top).
  const setWordmarkRef = (el: HTMLDivElement | null) => {
    wordmarkWrapperRef.current = el;
    if (typeof externalWordmarkRef === "function") {
      externalWordmarkRef(el);
    } else if (externalWordmarkRef && "current" in externalWordmarkRef) {
      (externalWordmarkRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    }
  };

  // The "Growing up..." paragraph (index 2) lives on the About me page; the
  // main bio shows the rest in their original order.
  const mainParagraphs = PARAGRAPHS.filter((_, i) => i !== 2);
  const aboutMeParagraphs = PARAGRAPHS[2] ? [PARAGRAPHS[2]] : [];

  return (
    <>
      <HighlighterProvider>
        {/* Page swap — AnimatePresence handles the slide+blur cross-fade
            between the home page (wordmark + bio) and the About-me page
            (intro paragraph + Resume). Body has overflow-x: hidden so the
            outgoing slide can leave the viewport without horizontal scroll. */}
        <AnimatePresence mode="wait" initial={false}>
          {!aboutMeOpen ? (
            <motion.div
              key="hero-home"
              initial={false}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -120, filter: "blur(12px)" }}
              transition={{ duration: 0.35, ease: BLUR_EASE }}
            >
              {/* Toolbar — always visible, sits above the wordmark. The
                  toolbar manages its own scroll-past sticky portal. */}
              <motion.div
                className="mb-8"
                initial={initial}
                animate={animate}
                transition={transition}
              >
                <HeroToolbar />
              </motion.div>

              {/* Wordmark + decorative themed star */}
              <motion.div
                ref={setWordmarkRef}
                className="flex items-start justify-start"
                style={{ width: "100%" }}
                initial={initial}
                animate={animate}
                transition={transition}
              >
                <h1
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "var(--wordmark-fontsize, 48px)",
                    fontWeight: 600,
                    lineHeight: 1.05,
                    letterSpacing: "-0.025em",
                    color: "var(--color-fg)",
                    whiteSpace: "nowrap",
                    flex: "0 0 auto",
                  }}
                >
                  {HERO_NAME}
                </h1>
                <PlaygroundStar />
              </motion.div>

              {/* LED matrix — pulled close to the wordmark. */}
              {matrix && (
                <motion.div
                  className="mt-6"
                  initial={initial}
                  animate={animate}
                  transition={transition}
                >
                  {matrix}
                </motion.div>
              )}

              {/* Bio — paragraphs 1, 2, 4 (childhood lives on About me) */}
              <motion.div
                className="mt-16 text-(--color-fg-secondary) leading-[28px]"
                style={{ fontSize: "calc(14px + var(--font-size-offset))" }}
                initial={initial}
                animate={animate}
                transition={transition}
              >
                <HighlightableBio paragraphs={mainParagraphs} />
                <LearnMoreCVButton onClick={() => onAboutMeChange(true)} />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="hero-about"
              initial={{ opacity: 0, x: 120, filter: "blur(12px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: 120, filter: "blur(12px)" }}
              transition={{ duration: 0.35, ease: BLUR_EASE }}
              className="pb-24"
            >
              <h1
                style={{
                  fontFamily: "var(--font-sans)",
                  // Match Return-button text height so cap-tops align in
                  // the side nav. Bigger than nav text for hierarchy, but
                  // line-height 1 puts the cap at the box top.
                  fontSize: "clamp(calc(28px + var(--font-size-offset)), 4vw, calc(36px + var(--font-size-offset)))",
                  fontWeight: 600,
                  lineHeight: 1,
                  letterSpacing: "-0.025em",
                  color: "var(--color-fg)",
                }}
              >
                About me
              </h1>

              <div
                className="mt-16 text-(--color-fg-secondary) leading-[28px]"
                style={{ fontSize: "calc(14px + var(--font-size-offset))" }}
              >
                <HighlightableBio paragraphs={aboutMeParagraphs} />
                <Resume />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </HighlighterProvider>

      {children}
    </>
  );
}
