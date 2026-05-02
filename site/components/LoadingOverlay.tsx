"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "portfolio-loaded";
const BLUR_EASE = [0.22, 1, 0.36, 1] as const;

const TARGET = "Welcome";

// Plain typewriter — each letter locks in directly without scramble.
const TYPE_DELAY_MS = 95;
const BACKSPACE_DELAY_MS = 28;
const HOLD_MS = 1100;
const PRE_TYPE_DELAY_MS = 350;
const PRE_FADE_DELAY_MS = 250;
const FADE_MS = 600;

// Cursor-style blink before any typing happens.
const BLINK_COUNT = 3;
const BLINK_HALF_MS = 420; // on time and off time per half-cycle

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

type LoadingOverlayProps = {
  /** Called when the morph + bg fade starts so Hero can begin its blur-in
   *  animation in lockstep. */
  onFade?: () => void;
  /** Called when the overlay has fully unmounted. */
  onDone?: () => void;
  /** Fired one tick before the loader's star unmounts so the wordmark's
   *  PlaygroundStar can reclaim layoutId="hero-star" in the same React
   *  commit, letting framer-motion run a single layout transition. */
  onStarReleased?: () => void;
};

export default function LoadingOverlay({
  onFade,
  onDone,
  onStarReleased,
}: LoadingOverlayProps) {
  // Phases — `pending` is the SSR/initial render before the client decides
  // whether this is a first-time visit. Repeat visitors skip straight to
  // `done` before painting.
  const [phase, setPhase] = useState<
    "pending" | "typing" | "holding" | "backspacing" | "fading" | "done"
  >("pending");
  const [text, setText] = useState("");
  const [starHere, setStarHere] = useState(true);
  // Toggled during the cursor-blink phase. Outside of the blink loop it
  // stays true, so the morph and the rest of the sequence aren't affected.
  const [starBlinkOn, setStarBlinkOn] = useState(true);

  const onFadeRef = useRef(onFade);
  const onDoneRef = useRef(onDone);
  const onStarReleasedRef = useRef(onStarReleased);
  useEffect(() => {
    onFadeRef.current = onFade;
    onDoneRef.current = onDone;
    onStarReleasedRef.current = onStarReleased;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Dev-only override: visiting with `?loader=1` forces the overlay to
    // play regardless of session state. Production builds ignore the flag.
    const forcePreview =
      process.env.NODE_ENV === "development" &&
      new URLSearchParams(window.location.search).get("loader") === "1";

    let seen: string | null = null;
    try {
      seen = sessionStorage.getItem(STORAGE_KEY);
    } catch {
      seen = "1";
    }
    if (seen && !forcePreview) {
      setPhase("done");
      onDoneRef.current?.();
      return;
    }
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* noop */
    }

    let cancelled = false;

    const run = async () => {
      setPhase("typing");

      // Cursor-style blink: star toggles off/on a few times before the
      // typing starts. Pure visibility flick — layoutId tracking is
      // unaffected since the motion.span stays mounted throughout.
      for (let i = 0; i < BLINK_COUNT; i++) {
        if (cancelled) return;
        setStarBlinkOn(false);
        await sleep(BLINK_HALF_MS);
        if (cancelled) return;
        setStarBlinkOn(true);
        await sleep(BLINK_HALF_MS);
      }

      await sleep(PRE_TYPE_DELAY_MS);
      if (cancelled) return;

      // Type out
      for (let i = 1; i <= TARGET.length; i++) {
        if (cancelled) return;
        setText(TARGET.slice(0, i));
        await sleep(TYPE_DELAY_MS);
      }

      // Hold
      setPhase("holding");
      await sleep(HOLD_MS);
      if (cancelled) return;

      // Backspace
      setPhase("backspacing");
      for (let i = TARGET.length - 1; i >= 0; i--) {
        if (cancelled) return;
        setText(TARGET.slice(0, i));
        await sleep(BACKSPACE_DELAY_MS);
      }

      await sleep(PRE_FADE_DELAY_MS);
      if (cancelled) return;

      // Hand layoutId off to the wordmark's PlaygroundStar in the same
      // commit, then unmount the loader's star — framer-motion picks up
      // the shared layoutId and morphs from here to the wordmark slot.
      onStarReleasedRef.current?.();
      setStarHere(false);
      setPhase("fading");
      onFadeRef.current?.();

      await sleep(FADE_MS);
      if (cancelled) return;

      setPhase("done");
      onDoneRef.current?.();
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = phase !== "done" && phase !== "pending";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loading-overlay"
          className="fixed inset-0 z-[200] flex items-center justify-center px-4"
          style={{ backgroundColor: "var(--color-bg)" }}
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === "fading" ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: FADE_MS / 1000, ease: BLUR_EASE }}
        >
          <div
            className="flex items-center whitespace-nowrap"
            aria-label="Welcome"
          >
            {/* Welcome — Marco-Sevilla typographic family but smaller so
                it sits at roughly the same visual height as the giant
                star. */}
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "clamp(32px, 5vw, 56px)",
                fontWeight: 500,
                lineHeight: 1,
                letterSpacing: "-0.025em",
                color: "var(--color-fg)",
                minHeight: "1em",
              }}
            >
              {text}
            </span>

            {starHere && (
              // Wrapping mirrors PlaygroundStar's structure (outer 0.66em
              // slot, inner 0.42em glyph span) so the layoutId morph only
              // interpolates size + position. The wrapper's font-size is
              // ~3× the text's so the glyph reads larger than the text.
              <span
                aria-hidden
                className="inline-flex items-center justify-center shrink-0"
                style={{
                  color: "var(--color-accent)",
                  fontSize: "clamp(108px, 16vw, 168px)",
                  width: "0.66em",
                  height: "0.66em",
                  flex: "0 0 auto",
                  // Negative margin cancels the slot's left-side padding so
                  // the visible glyph sits flush against the typed text —
                  // makes "Welcome" feel like it's emanating from the star.
                  marginLeft: "-0.18em",
                  // Cursor-blink: opacity toggles instantly on the wrapper
                  // (no CSS transition) so the star flickers cleanly. The
                  // motion.span layoutId child keeps tracking position
                  // through the toggle.
                  opacity: starBlinkOn ? 1 : 0,
                }}
              >
                <span
                  style={{ position: "relative", display: "inline-block", fontSize: "0.42em", lineHeight: 1 }}
                >
                  <motion.span
                    layoutId="hero-star"
                    style={{ display: "inline-block" }}
                    // Instant layout updates so the star snaps along with
                    // each typed/backspaced character, anchored to the
                    // text rather than gliding behind it. The morph into
                    // the wordmark slot uses the wordmark's own spring
                    // transition (PlaygroundStar) since framer-motion
                    // drives shared-layoutId animations from the new
                    // element's transition.
                    transition={{ layout: { duration: 0 } }}
                  >
                    ✸
                  </motion.span>
                </span>
              </span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
