"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "portfolio-loaded";
const BLUR_EASE = [0.22, 1, 0.36, 1] as const;

// Temporary kill switch — skips the entire intro sequence (blink + type
// "Welcome" + morph) and loads straight into the page. Flip to `false` to
// restore the intro.
const SKIP_INTRO = false;

// Magic-wand kaomoji + sparkle trail. The trailing ✧ of the full string is
// NOT typed as text — it's the loader star itself (layoutId hero-star), so
// the trail appears to stream out of the star, and the star is what morphs
// into the wordmark after the wipe.
const TARGET = "(∩ᵔ ᵕ ᵔ )⊃━☆ﾟ.*+.✧⋅.˳˳.⋅ॱ˙ ˙ॱ⋅.˳˳.⋅ॱ˙ ˙ॱᐧ.˳˳.⋅ ˙";
// Code-point-safe segmentation — the trail mixes scripts/diacritics, so
// never slice the raw string by UTF-16 index.
const TARGET_CHARS = Array.from(TARGET);

// Plain typewriter — each letter locks in directly without scramble.
// No backspace phase (cut 2026-07-15): the sequence ends a beat after the
// full trail is on screen, then fades straight into the page.
const TYPE_DELAY_MS = 40;
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

    // Kill switch: skip the intro sequence entirely and behave like a
    // repeat visit. The `?loader=1` override still wins so we can preview
    // the sequence on demand.
    if (SKIP_INTRO && !forcePreview) {
      setPhase("done");
      onDoneRef.current?.();
      return;
    }

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
      for (let i = 1; i <= TARGET_CHARS.length; i++) {
        if (cancelled) return;
        setText(TARGET_CHARS.slice(0, i).join(""));
        await sleep(TYPE_DELAY_MS);
      }

      // Hold — the full trail sits on screen for a beat, then the
      // sequence ends (no backspace: cut 2026-07-15).
      setPhase("holding");
      await sleep(HOLD_MS);
      if (cancelled) return;

      await sleep(PRE_FADE_DELAY_MS);
      if (cancelled) return;

      // Release the star flag (HomeLayout uses it to let the wordmark
      // area take over) and fade the whole overlay out via CSS — the
      // overlay deliberately avoids framer-motion for its own lifecycle
      // (see note above the return).
      onStarReleasedRef.current?.();
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

  // NOTE (2026-07-15): the overlay's own fade/unmount is plain CSS, not
  // framer-motion. The previous AnimatePresence + animate-opacity version
  // silently stalled — the exit tween never ran and the overlay stayed
  // mounted at full opacity over the page. A CSS transition driven by the
  // `fading` phase is deterministic; the element unmounts once phase hits
  // `done` (opacity has already reached 0 by then, so removal is invisible).
  return (
    <>
      {visible && (
        <div
          key="loading-overlay"
          className="fixed inset-0 z-[200] flex items-center justify-center px-4 pointer-events-none"
          style={{
            backgroundColor: "var(--color-bg)",
            opacity: phase === "fading" ? 0 : 1,
            transition: `opacity ${FADE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
          }}
        >
          <div
            className="flex items-center whitespace-nowrap"
            aria-label="Welcome"
          >
            {/* Wand kaomoji + sparkle trail — sized so the full ~50-char
                string fits the viewport on one line; the loader star rides
                the end of the trail as it types. */}
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "clamp(16px, 2.4vw, 32px)",
                fontWeight: 500,
                lineHeight: 1,
                letterSpacing: "-0.01em",
                color: "var(--color-fg)",
                minHeight: "1em",
              }}
            >
              {text}
            </span>

            {starHere && (
              // The terminal ✧ of the sparkle trail — rides the end of the
              // typed text, blinks like a cursor before typing starts, and
              // fades out with the overlay. (No layoutId morph: the old
              // hero-star receiver lives in Hero, which doesn't mount on
              // the home view, so the handoff was a no-op.)
              <span
                aria-hidden
                className="inline-flex items-center justify-center shrink-0"
                style={{
                  color: "var(--color-accent)",
                  fontSize: "clamp(72px, 10vw, 112px)",
                  width: "0.66em",
                  height: "0.66em",
                  flex: "0 0 auto",
                  // Negative margin cancels the slot's left-side padding so
                  // the visible glyph sits flush against the typed text —
                  // the trail feels like it's streaming from the star.
                  marginLeft: "-0.18em",
                  // Cursor-blink: opacity toggles instantly on the wrapper
                  // (no CSS transition) so the star flickers cleanly.
                  opacity: starBlinkOn ? 1 : 0,
                }}
              >
                <span
                  style={{ position: "relative", display: "inline-block", fontSize: "0.42em", lineHeight: 1 }}
                >
                  <span style={{ display: "inline-block", fontWeight: 500 }}>✧</span>
                </span>
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
}
