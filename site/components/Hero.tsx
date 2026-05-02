"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PARAGRAPHS, HERO_NAME } from "@/lib/bio-content";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { typescale } from "@/lib/typography";
import { HighlightableBio } from "./HighlightableBio";
import { HighlighterProvider } from "./HighlighterContext";
import Resume from "./Resume";
import { ArrowRightIcon } from "./Icons";

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
      className="group mt-6 inline-flex items-center gap-1.5 cursor-pointer focus:outline-none"
      style={{
        fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
        fontSize: "12px",
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        lineHeight: 1.4,
        color: "var(--color-accent)",
        background: "none",
        border: 0,
        padding: 0,
      }}
    >
      <span>Learn more</span>
      <span
        aria-hidden
        className="inline-flex items-center transition-transform duration-200 ease-out group-hover:translate-x-1"
      >
        <ArrowRightIcon size={14} />
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
  el: HTMLDivElement | null,
  widthFraction = 1,
  maxContainerPx?: number,
) {
  useLayoutEffect(() => {
    if (!el) return;

    const fit = () => {
      // Bail before mutating any vars if the element is detached or
      // zero-sized — otherwise we'd leave --wordmark-fontsize stuck at
      // the 100px reference size and the wordmark would render huge on
      // remount.
      if (!el.isConnected) return;
      // Set the reference size on the wrapper only — doc-level var stays
      // at its last good value if measurement fails.
      el.style.setProperty("--wordmark-fontsize", "100px");
      const rawW = el.clientWidth;
      const naturalW = el.scrollWidth;
      if (rawW === 0 || naturalW === 0) {
        el.style.removeProperty("--wordmark-fontsize");
        return;
      }
      const containerW = maxContainerPx ? Math.min(rawW, maxContainerPx) : rawW;
      const scale = (containerW / naturalW) * widthFraction;
      const next = `${100 * scale}px`;
      // Set on documentElement so other sections (e.g. the projects h2)
      // can match the wordmark size. Also mirror on the wrapper for the
      // PlaygroundStar's em-based sizing.
      const root = document.documentElement;
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
  }, [el, widthFraction, maxContainerPx]);
}

function PlaygroundStar({
  hideForLoader = false,
  onMorphComplete,
}: {
  /** When true, the wordmark slot reserves its space (no layout shift)
   *  but the star glyph + layoutId aren't rendered. While the loader
   *  owns `layoutId="hero-star"` only one element in the tree carries
   *  it, which is what makes the morph seamless. */
  hideForLoader?: boolean;
  /** Fired the first time the layoutId-driven morph completes — i.e.
   *  when the star "lands" in its final wordmark slot. Used to gate the
   *  cascading blur-in of the rest of the home page on first-time load. */
  onMorphComplete?: () => void;
}) {
  const morphFiredRef = useRef(false);
  const handleLayoutAnimationComplete = () => {
    if (morphFiredRef.current) return;
    morphFiredRef.current = true;
    onMorphComplete?.();
  };
  const reducedMotion = usePrefersReducedMotion();

  // Decorative themed star — always pinned to the accent color. Subtle
  // shine streak sweeps across the glyph on a slow cycle.
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
      {!hideForLoader && (
        <span
          style={{ position: "relative", display: "inline-block", fontSize: "0.42em", lineHeight: 1 }}
        >
          {/* layoutId pairs with the loading-overlay's star, so when the
              loader unmounts its star this element morphs from the large
              centered position into the wordmark slot. */}
          <motion.span
            layoutId="hero-star"
            style={{ display: "inline-block" }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            onLayoutAnimationComplete={handleLayoutAnimationComplete}
          >
            ✸
          </motion.span>
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
      )}
    </span>
  );
}

export default function Hero({
  matrix,
  children,
  aboutMeOpen,
  onAboutMeChange,
  wordmarkRef: externalWordmarkRef,
  aboutMeHeaderRef: externalAboutMeHeaderRef,
  ready = true,
  hideStarForLoader = false,
  onStarMorphComplete,
}: {
  /** Optional render slot for the LED matrix area, placed between the
   *  sticky header and the bio so it sits *under* the pinned header. */
  matrix?: React.ReactNode;
  children?: React.ReactNode;
  aboutMeOpen: boolean;
  onAboutMeChange: (open: boolean) => void;
  wordmarkRef?: React.Ref<HTMLDivElement>;
  aboutMeHeaderRef?: React.Ref<HTMLHeadingElement>;
  /** Gates the blur-in animation. While false, every motion.div sits at
   *  the initial (blurred) state. When it flips true, all panels animate
   *  in together — used to lock-step the home blur-in with the loading
   *  overlay's fade-out on first-time visits. */
  ready?: boolean;
  /** While true, the wordmark's PlaygroundStar reserves its slot but
   *  doesn't render the glyph, so the LoadingOverlay can own
   *  `layoutId="hero-star"` and morph cleanly into this slot when the
   *  loader's star unmounts. */
  hideStarForLoader?: boolean;
  /** Fired the first time the layoutId-driven star morph completes. */
  onStarMorphComplete?: () => void;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const initial = reducedMotion ? false : { opacity: 0, filter: "blur(12px)" };
  const animate = ready
    ? { opacity: 1, filter: "blur(0px)" }
    : { opacity: 0, filter: "blur(12px)" };
  const transition = { duration: 0.9, ease: BLUR_EASE };

  // Cascade delays so the home content blurs in like a top-to-bottom
  // domino once `ready` flips — triggered when the loader's star lands
  // in the wordmark slot. Each step is ~70ms so the whole cascade kicks
  // off inside ~250ms after the morph completes.
  const tx = (delay: number) => ({ ...transition, delay });

  // Track the wordmark element via state so useFitWordmark re-runs when
  // the wordmark unmounts during AnimatePresence transitions and a fresh
  // element mounts on return — without it, --wordmark-fontsize would
  // stay stuck at the last-fit value (or worse, at 100px).
  const [wordmarkEl, setWordmarkEl] = useState<HTMLDivElement | null>(null);

  // Cap the fit container at the original 500px-column inner width (500 - 32
  // for sm:px-8) so the wordmark — and the projects "Work" h2, which reads
  // the same CSS var — stay at their original size after the body column
  // widens to 650px.
  useFitWordmark(wordmarkEl, 2 / 3, 468);

  const setWordmarkRef = useCallback((el: HTMLDivElement | null) => {
    setWordmarkEl(el);
    if (typeof externalWordmarkRef === "function") {
      externalWordmarkRef(el);
    } else if (externalWordmarkRef && "current" in externalWordmarkRef) {
      (externalWordmarkRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    }
  }, [externalWordmarkRef]);

  const setAboutMeHeaderRef = useCallback((el: HTMLHeadingElement | null) => {
    if (typeof externalAboutMeHeaderRef === "function") {
      externalAboutMeHeaderRef(el);
    } else if (externalAboutMeHeaderRef && "current" in externalAboutMeHeaderRef) {
      (externalAboutMeHeaderRef as React.MutableRefObject<HTMLHeadingElement | null>).current = el;
    }
  }, [externalAboutMeHeaderRef]);

  // The "Growing up..." paragraph (index 2) lives on the About me page; the
  // main bio shows the rest in their original order.
  const mainParagraphs = PARAGRAPHS.filter((_, i) => i !== 2);
  const aboutMeParagraphs = PARAGRAPHS[2] ? [PARAGRAPHS[2]] : [];

  return (
    <>
      <HighlighterProvider>
        {/* Page swap — AnimatePresence handles a slide+blur cross-fade
            between the home page and the About-me / Resume page. Body has
            overflow-x: hidden so outgoing slides leave the viewport
            without horizontal scroll. */}
        <AnimatePresence mode="popLayout" initial={false}>
          {!aboutMeOpen ? (
            <motion.div
              key="hero-home"
              initial={false}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -160, filter: "blur(12px)" }}
              transition={{ duration: 0.4, ease: BLUR_EASE }}
            >
              {/* Toolbar lives in HomeLayout above this column so it can
                  span the full window width responsive to the left rail
                  and right chat panel; cascade animation moves with it. */}

              {/* Wordmark wrapper — flex row holding the name and the
                  star. The wrapper itself is NOT animated so the star
                  (a child of it) isn't hidden behind the parent's
                  opacity gate while the layoutId morph is running.
                  Only the <h1> name participates in the cascade. */}
              <div
                ref={setWordmarkRef}
                className="flex items-start justify-start"
                style={{ width: "100%" }}
              >
                <motion.h1
                  initial={initial}
                  animate={animate}
                  transition={tx(0)}
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
                </motion.h1>
                <PlaygroundStar
                  hideForLoader={hideStarForLoader}
                  onMorphComplete={onStarMorphComplete}
                />
              </div>

              {/* LED matrix — equidistant 40px (mt-10) from wordmark above
                  and bio below. */}
              {matrix && (
                <motion.div
                  className="mt-10"
                  initial={initial}
                  animate={animate}
                  transition={tx(0.16)}
                >
                  {matrix}
                </motion.div>
              )}

              {/* Bio — paragraphs 1, 2, 4 (childhood lives on About me) */}
              <motion.div
                className="mt-10 text-(--color-fg-secondary) leading-[28px]"
                style={{ fontSize: "calc(14px + var(--font-size-offset))" }}
                initial={initial}
                animate={animate}
                transition={tx(0.24)}
              >
                <HighlightableBio paragraphs={mainParagraphs} />
                <LearnMoreCVButton onClick={() => onAboutMeChange(true)} />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="hero-about"
              initial={{ opacity: 0, x: 160, filter: "blur(12px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: 160, filter: "blur(12px)" }}
              transition={{ duration: 0.4, ease: BLUR_EASE }}
              className="pb-24"
            >
              <h1
                ref={setAboutMeHeaderRef}
                className="mt-16"
                style={{
                  fontFamily: "var(--font-sans)",
                  // Sized smaller than the wordmark so the home/about
                  // hierarchy stays distinct. Line-height 1 puts the cap
                  // top flush with the box top so it visually top-aligns
                  // with the side-nav Return button.
                  //
                  // mt-16 (64px) matches the home page's toolbar (≈32px)
                  // + mb-8 (32px) stack so this header lands at roughly
                  // the same y as "Marco Sevilla". The side nav's
                  // setAboutMeHeaderRef callback re-measures off this
                  // h1's bounding rect, so the Return button follows.
                  fontSize: "calc(var(--wordmark-fontsize, 48px) * 0.85)",
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
