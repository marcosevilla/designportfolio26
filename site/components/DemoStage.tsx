"use client";

/**
 * DemoStage — reusable choreographed-demo wrapper for interactive prototype
 * specimens (first use: the F&B Unified Cart phone on /work/fb-ordering).
 *
 * Wrap any self-contained prototype and pass a `script` of steps that
 * reference `data-demo="…"` attributes inside it. The stage auto-plays the
 * script with a frosted-glass ghost cursor that travels to each target and
 * dispatches a real click — the prototype's own state logic stays the single
 * source of truth; nothing is simulated twice.
 *
 * Behavior contract (Marco 2026-08-03, REVISED 2026-08-05):
 *   - Inline (in the page) is DISPLAY ONLY: auto-plays on view, loops forever,
 *     no panel background, not interactive. It reads as a moving figure in the
 *     article, not a widget.
 *   - Fullscreen is MANUAL ONLY: no ghost cursor, no auto-play — the visitor
 *     drives the real prototype. Chrome is two text+icon buttons: Restart
 *     (remounts the prototype clean) and Close.
 *   - Fullscreen opens from a "Try demo" pill that fades in over the inline
 *     stage's top-right corner on hover (Marco 2026-08-05, third pass — it
 *     used to sit in the caption block below).
 *   - prefers-reduced-motion ⇒ the inline copy never auto-plays (static).
 *
 * Scale note: coordinates come from getBoundingClientRect, so targets inside
 * transform-scaled interiors (the phone renders at 390pt logical) need no
 * special handling.
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export type DemoStep =
  | { type: "tap"; target: string; after?: number }
  | { type: "type"; target: string; text: string; charMs?: number; after?: number }
  | { type: "wait"; ms: number };

const CURSOR_SIZE = 36;
/**
 * Scale floor. In the desktop band an inline stage fits its column exactly, so
 * a demo shares the body measure (Marco 2026-08-05 — a 1177px staff UI lands
 * near 0.57 there: small, but it's a figure, not something you read). Below
 * PAN_BELOW the column is too narrow for that to mean anything — 1177px into a
 * 358px phone band is 0.30, i.e. 11px type at 3px — so the stage floors here
 * and the well pans horizontally instead.
 * Fullscreen hard-floors here too (no pan container, so it can clip).
 */
const MIN_INLINE_SCALE = 0.7;
/**
 * VIEWPORT width under which the inline stage stops fitting and starts panning.
 * Matches the editorial grid's desktop breakpoint (`--grid-max` compositions
 * apply at ≥1200) — the band below it is narrow enough that fitting a desktop
 * UI into it produces an unreadable thumbnail.
 */
const PAN_BELOW = 1200;
const DEFAULT_SETTLE = 650;
const TARGET_TIMEOUT = 4000;
const SCRIM_BLUR = 16;
const SCRIM_TINT = "rgba(8,8,8,0.78)";
const ENTER_MS = 460;
const EXIT_MS = 300;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── Icons (stroke, matches the site's utilitarian chrome) ─────────────────

function GlyphIcon({
  d,
  size = 15,
  strokeWidth = 1.5,
}: {
  d: string;
  size?: number;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={{ display: "block" }}
    >
      <path d={d} />
    </svg>
  );
}

const GLYPHS = {
  // rotate-ccw
  reset: "M3 12a9 9 0 1 0 2.64-6.36M3 4v4h4",
  // maximize
  expand: "M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3",
  close: "M18 6 6 18M6 6l12 12",
} as const;

/** Fullscreen chrome: icon + label, no chip — reads as a control, not a widget. */
function StageTextButton({
  glyph,
  label,
  onClick,
}: {
  glyph: keyof typeof GLYPHS;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-white/70 transition-colors hover:text-white"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        height: 32,
        padding: "0 10px",
        borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.18)",
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        fontSize: 13,
        fontWeight: 500,
        lineHeight: 1,
        cursor: "pointer",
      }}
    >
      <GlyphIcon d={GLYPHS[glyph]} size={14} />
      {label}
    </button>
  );
}

/**
 * "Try demo" — the CTA that opens the fullscreen, hands-on copy. Sits over the
 * inline stage's top-right corner and fades in on hover (or focus). It floats
 * on top of live product UI, so it carries its own drop shadow + backdrop blur
 * for contrast rather than relying on whatever is underneath it.
 *
 * Touch devices have no hover: `(hover: none)` pins it visible, otherwise the
 * demo would have no way to open on a phone.
 */
function TryDemoOverlayButton({
  onClick,
  inset,
}: {
  onClick: () => void;
  /** Distance from the WELL's right edge in to the stage's — 0 when panning. */
  inset: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="demo-try-pill absolute top-3 z-3 inline-flex items-center gap-2 rounded-full"
      style={{
        right: inset + 12,
        height: 32,
        padding: "0 13px",
        fontSize: 13,
        fontWeight: 500,
        lineHeight: 1,
        cursor: "pointer",
        color: "#fff",
        background: "rgba(20,20,22,0.82)",
        border: "1px solid rgba(255,255,255,0.16)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        boxShadow:
          "0 1px 2px rgba(0,0,0,0.18), 0 6px 16px rgba(0,0,0,0.24), 0 14px 32px rgba(0,0,0,0.18)",
      }}
    >
      <GlyphIcon d={GLYPHS.expand} size={13} />
      Try demo
    </button>
  );
}

// ─── Stage core (one instance per surface: inline + fullscreen portal) ─────

function StageCore({
  variant,
  script,
  children,
  ariaLabel,
  stageWidth,
  stageHeight,
  frozen = false,
  onClose,
  onClosed,
  closing = false,
  onLaunch,
}: {
  variant: "inline" | "fullscreen";
  script: DemoStep[];
  children: ReactNode;
  ariaLabel: string;
  stageWidth: number;
  stageHeight: number;
  /** Inline copy freezes (stops running) while the fullscreen portal is up. */
  frozen?: boolean;
  /** Fullscreen: start the exit animation. */
  onClose?: () => void;
  /** Fullscreen: set once the exit animation is done — parent unmounts. */
  onClosed?: () => void;
  closing?: boolean;
  /** Inline only: opens the fullscreen copy (drives the hover "Try demo" pill). */
  onLaunch?: () => void;
}) {
  const [resetKey, setResetKey] = useState(0);
  const [cursorOn, setCursorOn] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [fsScale, setFsScale] = useState(1);
  const [fitScale, setFitScale] = useState(1);
  const [panning, setPanning] = useState(false);
  /** Gap between the well's right edge and the (centered) stage's — see the pill. */
  const [stageInset, setStageInset] = useState(0);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const wellRef = useRef<HTMLDivElement | null>(null);
  const growRef = useRef<HTMLDivElement | null>(null);
  const chromeRef = useRef<HTMLDivElement | null>(null);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const cursorDotRef = useRef<HTMLDivElement | null>(null);
  const pausedRef = useRef(false);
  const inViewRef = useRef(variant === "fullscreen");

  const scale = variant === "fullscreen" ? fsScale : fitScale;
  const cursorSize = Math.round(CURSOR_SIZE * scale);

  /** Fullscreen = the visitor's copy; inline = the demo reel. Never both. */
  const interactable = variant === "fullscreen";
  const autoPlay = variant === "inline" && !reduced;

  // Reduced motion ⇒ the inline copy never auto-plays (it renders its
  // prototype's initial state and holds).
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Inline is display-only: pointer-events off isn't enough — keyboard users
  // would still tab into dead controls. `inert` via the DOM (React 18 types
  // don't know the attribute, and a boolean would render `inert="true"`).
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    if (interactable) el.removeAttribute("inert");
    else el.setAttribute("inert", "");
  }, [interactable, resetKey]);

  // Fullscreen: fit the stage to the viewport. Layout effect so the first
  // paint is already at the fitted scale (the enter animation runs over it).
  useLayoutEffect(() => {
    if (variant !== "fullscreen") return;
    const compute = () =>
      setFsScale(
        Math.max(
          MIN_INLINE_SCALE,
          Math.min(
            (window.innerHeight - 112) / stageHeight,
            (window.innerWidth - 128) / stageWidth,
            2,
          ),
        ),
      );
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [variant, stageWidth, stageHeight]);

  // Inline: shrink a stage wider than its column down to fit it exactly, so a
  // 1177px desktop UI sits on the same measure as the body text. Phone-sized
  // specimens always land at 1 — never scales UP, the artifact keeps its
  // authored size wherever there's room.
  //
  // Floored only below PAN_BELOW, where "fits" and "legible" diverge: a 1177px
  // dashboard on a 390px phone would fit at 0.30, rendering 11px type at 3px.
  // There the stage keeps a legible size and the well pans horizontally.
  //
  // `panning` drives the well's overflow. When the stage fits, the well is
  // `overflow: visible` — an `overflow-x: auto` well computes overflow-y to
  // `auto` as well, which clipped the phone shell's ambient drop shadow flat
  // against the stage box.
  useLayoutEffect(() => {
    if (variant !== "inline") return;
    const el = wellRef.current;
    if (!el) return;
    const compute = () => {
      const cs = getComputedStyle(el);
      const inner =
        el.clientWidth -
        parseFloat(cs.paddingLeft) -
        parseFloat(cs.paddingRight);
      if (inner <= 0) return;
      const fit = Math.min(1, inner / stageWidth);
      // Floor on the VIEWPORT, not the column — the column is the text band at
      // every width, so keying off it would floor the stage on desktop too.
      const floored =
        window.innerWidth < PAN_BELOW ? Math.max(MIN_INLINE_SCALE, fit) : fit;
      setFitScale(floored);
      setPanning(stageWidth * floored > inner + 0.5);
      setStageInset(Math.max(0, (inner - stageWidth * floored) / 2));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    window.addEventListener("resize", compute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [variant, stageWidth]);

  // Fullscreen enter: the page behind blurs out (backdrop-filter radius ramps
  // up under a darkening tint) while the enlarged prototype blurs in and grows
  // into place. WAAPI on mount — a CSS transition on a state flip races the
  // scale-fit layout effect and silently never runs.
  useLayoutEffect(() => {
    if (variant !== "fullscreen" || closing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    dialogRef.current?.animate(
      [
        {
          backdropFilter: "blur(0px)",
          WebkitBackdropFilter: "blur(0px)",
          backgroundColor: "rgba(8,8,8,0)",
        },
        {
          backdropFilter: `blur(${SCRIM_BLUR}px)`,
          WebkitBackdropFilter: `blur(${SCRIM_BLUR}px)`,
          backgroundColor: SCRIM_TINT,
        },
      ],
      { duration: ENTER_MS, easing: "cubic-bezier(0.32, 0.72, 0.3, 1)" },
    );
    growRef.current?.animate(
      [
        { transform: "scale(0.86)", filter: "blur(14px)", opacity: 0 },
        { transform: "scale(1)", filter: "blur(0px)", opacity: 1 },
      ],
      { duration: ENTER_MS, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
    chromeRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: ENTER_MS,
      easing: "ease",
    });
  }, [variant, closing]);

  // Fullscreen exit: run the enter in reverse, then tell the parent to unmount
  // (fill:forwards holds the end state so nothing snaps back mid-flight).
  useEffect(() => {
    if (variant !== "fullscreen" || !closing) return;
    if (reduced) {
      onClosed?.();
      return;
    }
    dialogRef.current?.animate(
      [
        {
          backdropFilter: `blur(${SCRIM_BLUR}px)`,
          WebkitBackdropFilter: `blur(${SCRIM_BLUR}px)`,
          backgroundColor: SCRIM_TINT,
        },
        {
          backdropFilter: "blur(0px)",
          WebkitBackdropFilter: "blur(0px)",
          backgroundColor: "rgba(8,8,8,0)",
        },
      ],
      { duration: EXIT_MS, easing: "cubic-bezier(0.4, 0, 0.6, 1)", fill: "forwards" },
    );
    growRef.current?.animate(
      [
        { transform: "scale(1)", filter: "blur(0px)", opacity: 1 },
        { transform: "scale(0.88)", filter: "blur(12px)", opacity: 0 },
      ],
      { duration: EXIT_MS, easing: "cubic-bezier(0.4, 0, 0.6, 1)", fill: "forwards" },
    );
    chromeRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: EXIT_MS * 0.6,
      easing: "ease",
      fill: "forwards",
    });
    const t = setTimeout(() => onClosed?.(), EXIT_MS);
    return () => clearTimeout(t);
  }, [variant, closing, reduced, onClosed]);

  // Off-screen ⇒ pause (inline only; the portal is always on screen).
  useEffect(() => {
    if (variant === "fullscreen" || !stageRef.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        pausedRef.current = !entry.isIntersecting;
      },
      { threshold: 0.3 },
    );
    io.observe(stageRef.current);
    return () => io.disconnect();
  }, [variant]);

  // Fullscreen opened over this copy: it stops (the run effect bails on
  // `frozen`) but stays on screen, so the page the scrim blurs out still looks
  // whole. The stale state resets on the way back, not on the way in — a
  // remount at open would pop behind a scrim that's still clear.
  const wasFrozen = useRef(false);
  useEffect(() => {
    if (frozen) {
      wasFrozen.current = true;
      return;
    }
    if (!wasFrozen.current) return;
    wasFrozen.current = false;
    setResetKey((k) => k + 1);
  }, [frozen]);

  // ── Script executor (inline only) ────────────────────────────────────────

  const findTarget = (name: string) =>
    contentRef.current?.querySelector<HTMLElement>(
      `[data-demo="${name}"]`,
    ) ?? null;

  const cursorTo = (el: HTMLElement, instant = false) => {
    const stage = stageRef.current;
    const cursor = cursorRef.current;
    if (!stage || !cursor) return 0;
    const stageRect = stage.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    // Tiny landing scatter — machine-perfect center hits read robotic.
    const x =
      r.left + r.width / 2 - stageRect.left - cursorSize / 2 +
      (Math.random() - 0.5) * 5;
    const y =
      r.top + r.height / 2 - stageRect.top - cursorSize / 2 +
      (Math.random() - 0.5) * 5;
    const prev = cursor.dataset.pos?.split(",").map(Number) ?? [x, y];
    const dist = Math.hypot(x - prev[0], y - prev[1]);
    cursor.style.transition = "none";
    cursor.style.transform = `translate(${x}px, ${y}px)`;
    cursor.dataset.pos = `${x},${y}`;
    if (instant || dist < 1) return 0;
    const duration = Math.min(1100, Math.max(450, dist * 1.25));
    // Bow the path into a gentle arc (perpendicular midpoint offset) and
    // split easing into accelerate-then-settle — a straight line with one
    // uniform ease is what made the old motion feel jagged.
    const bow =
      Math.min(26, dist * 0.14) * (Math.random() < 0.5 ? -1 : 1);
    const mx = (prev[0] + x) / 2 - ((y - prev[1]) / dist) * bow;
    const my = (prev[1] + y) / 2 + ((x - prev[0]) / dist) * bow;
    cursor.animate(
      [
        {
          transform: `translate(${prev[0]}px, ${prev[1]}px)`,
          easing: "cubic-bezier(0.5, 0, 0.75, 0.6)",
        },
        {
          transform: `translate(${mx}px, ${my}px)`,
          offset: 0.5,
          easing: "cubic-bezier(0.25, 0.4, 0.25, 1)",
        },
        { transform: `translate(${x}px, ${y}px)` },
      ],
      { duration },
    );
    return duration;
  };

  const pressCursor = async () => {
    const dot = cursorDotRef.current;
    if (!dot) return;
    dot.style.transform = "scale(0.72)";
    dot.style.background = "rgba(255,255,255,0.34)";
    await sleep(140);
    dot.style.transform = "scale(1)";
    dot.style.background = "rgba(255,255,255,0.16)";
    await sleep(70);
  };

  const typeInto = async (
    el: HTMLInputElement | HTMLTextAreaElement,
    text: string,
    charMs: number,
    cancelled: () => boolean,
  ) => {
    const proto =
      el instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
    const setValue = Object.getOwnPropertyDescriptor(proto, "value")!.set!;
    el.focus({ preventScroll: true });
    // Append mode: when the field already holds a prefix of the target text
    // (e.g. a pre-filled description the script extends), start after it
    // instead of retyping the whole value.
    const start = text.startsWith(el.value) ? el.value.length + 1 : 1;
    for (let i = start; i <= text.length; i++) {
      if (cancelled()) return;
      setValue.call(el, text.slice(0, i));
      el.dispatchEvent(new Event("input", { bubbles: true }));
      await sleep(charMs);
    }
  };

  const playScript = useCallback(
    async (cancelled: () => boolean): Promise<boolean> => {
      const waitWhilePaused = async () => {
        while (!cancelled() && pausedRef.current) await sleep(140);
      };
      const waitForTarget = async (name: string) => {
        const deadline = performance.now() + TARGET_TIMEOUT;
        while (!cancelled() && performance.now() < deadline) {
          const el = findTarget(name);
          if (el) return el;
          await sleep(80);
        }
        return null;
      };

      for (const step of script) {
        await waitWhilePaused();
        if (cancelled()) return false;
        if (step.type === "wait") {
          await sleep(step.ms);
          continue;
        }
        const el = await waitForTarget(step.target);
        if (!el || cancelled()) return false;
        await sleep(cursorTo(el) + 60);
        await waitWhilePaused();
        if (cancelled()) return false;
        if (step.type === "tap") {
          await pressCursor();
          if (cancelled()) return false;
          // Dispatched clicks can natively focus controls (labels forward to
          // their inputs), which would scroll the page — pin scroll around it.
          const sx = window.scrollX;
          const sy = window.scrollY;
          // Scripted taps carry off-screen coordinates instead of the 0,0 that
          // el.click() implies. Dev overlays that anchor UI to the click point
          // (Agentation's annotation layer) read clientX/clientY and would
          // otherwise open an annotation on every demo tap.
          el.dispatchEvent(
            new MouseEvent("click", {
              bubbles: true,
              cancelable: true,
              view: window,
              clientX: -1,
              clientY: -1,
            }),
          );
          if (
            el instanceof HTMLInputElement ||
            el instanceof HTMLTextAreaElement
          ) {
            el.focus({ preventScroll: true });
          }
          window.scrollTo(sx, sy);
        } else {
          await typeInto(
            el as HTMLInputElement | HTMLTextAreaElement,
            step.text,
            step.charMs ?? 120,
            cancelled,
          );
        }
        await sleep(step.after ?? DEFAULT_SETTLE);
      }
      return true;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [script, cursorSize],
  );

  useEffect(() => {
    if (frozen || !autoPlay) {
      setCursorOn(false);
      return;
    }
    let disposed = false;
    const cancelled = () => disposed;
    (async () => {
      await sleep(900);
      if (disposed) return;
      // Fade the cursor in at the stage center before the first move.
      const stage = stageRef.current;
      const cursor = cursorRef.current;
      if (stage && cursor) {
        const w = stage.clientWidth;
        const h = stage.clientHeight;
        cursor.style.transition = "none";
        cursor.style.transform = `translate(${w / 2 - cursorSize / 2}px, ${h / 2 - cursorSize / 2}px)`;
        cursor.dataset.pos = `${w / 2 - cursorSize / 2},${h / 2 - cursorSize / 2}`;
      }
      setCursorOn(true);
      await sleep(350);
      if (disposed) return;
      const completed = await playScript(cancelled);
      if (disposed) return;
      // Loop on success; on a failed run (target vanished — e.g. the user
      // resized mid-flow) retry from a clean remount rather than freezing.
      await sleep(completed ? 1200 : 300);
      if (!disposed) setResetKey((k) => k + 1);
    })();
    return () => {
      disposed = true;
    };
  }, [autoPlay, frozen, resetKey, playScript, cursorSize]);

  // ── Controls ─────────────────────────────────────────────────────────────

  /** Fullscreen only: hand the visitor a clean copy of the prototype. */
  const handleReset = () => setResetKey((k) => k + 1);

  useEffect(() => {
    if (variant !== "fullscreen" || !onClose) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [variant, onClose]);

  // ── Stage (shared between variants) ──────────────────────────────────────

  const stage = (
    <div
      ref={stageRef}
      style={{
        position: "relative",
        width: stageWidth * scale,
        height: stageHeight * scale,
        flexShrink: 0,
        // The demo remounts/animates its subtree constantly — opt it out of
        // browser scroll anchoring or the page jumps at loop boundaries.
        overflowAnchor: "none",
      }}
    >
      <div
        style={{
          width: stageWidth,
          height: stageHeight,
          transform: scale === 1 ? undefined : `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {/* zIndex isolates the prototype's internal stacking (sheets run
            z-50) so the cursor always sits above it. */}
        <div
          key={resetKey}
          ref={contentRef}
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            height: "100%",
            pointerEvents: interactable ? "auto" : "none",
          }}
        >
          {children}
        </div>
      </div>

      {/* Ghost cursor — frosted glass tap circle (inline demo reel only) */}
      {autoPlay && (
        <div
          ref={cursorRef}
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: cursorSize,
            height: cursorSize,
            zIndex: 2,
            pointerEvents: "none",
            willChange: "transform",
            opacity: cursorOn ? 1 : 0,
            transition: "opacity 200ms ease",
          }}
        >
          <div
            ref={cursorDotRef}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 999,
              background: "rgba(255,255,255,0.16)",
              border: "1px solid rgba(255,255,255,0.5)",
              backdropFilter: "blur(1.5px)",
              WebkitBackdropFilter: "blur(1.5px)",
              boxShadow:
                "0 2px 10px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.35)",
              transition:
                "transform 130ms ease, background 130ms ease, opacity 250ms ease",
            }}
          />
        </div>
      )}
    </div>
  );

  // ── Chrome per variant ───────────────────────────────────────────────────

  if (variant === "fullscreen") {
    return (
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose?.();
        }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 150,
          backgroundColor: SCRIM_TINT,
          backdropFilter: `blur(${SCRIM_BLUR}px)`,
          WebkitBackdropFilter: `blur(${SCRIM_BLUR}px)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: closing ? "none" : "auto",
        }}
      >
        <div
          ref={chromeRef}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            display: "flex",
            gap: 10,
            zIndex: 4,
          }}
        >
          <StageTextButton glyph="reset" label="Restart" onClick={handleReset} />
          <StageTextButton glyph="close" label="Close" onClick={() => onClose?.()} />
        </div>
        <div ref={growRef}>{stage}</div>
      </div>
    );
  }

  // Inline: no panel, no border — the specimen's own shell is the only
  // container, so the demo sits on the page like any other figure. The one
  // piece of chrome is the "Try demo" pill, which only appears on hover.
  return (
    <section aria-label={ariaLabel} className="demo-stage-root relative">
      {/* Block + `margin-inline: auto` rather than flex centering: when the
          stage is wider than the well, flex `items-center` pushes overflow off
          BOTH edges and the left side becomes unreachable, while auto margins
          collapse to 0 and overflow stays scrollable. */}
      <div
        ref={wellRef}
        className="scrollbar-hide"
        style={{ overflowX: panning ? "auto" : "visible" }}
      >
        <div style={{ width: "fit-content", marginInline: "auto" }}>
          {stage}
        </div>
      </div>
      {/* The pill hangs off the SECTION, not the well — a well that pans would
          carry it out of view. `stageInset` walks it back in to the stage's own
          right edge whenever the stage is narrower than its column. */}
      {onLaunch && (
        <TryDemoOverlayButton onClick={onLaunch} inset={stageInset} />
      )}
    </section>
  );
}

// ─── Public wrapper ────────────────────────────────────────────────────────

export default function DemoStage({
  script,
  children,
  ariaLabel,
  stageWidth,
  stageHeight,
}: {
  script: DemoStep[];
  children: ReactNode;
  ariaLabel: string;
  stageWidth: number;
  stageHeight: number;
}) {
  const [fullscreen, setFullscreen] = useState(false);
  // Closing is a separate beat: the portal stays mounted through its exit
  // animation, then unmounts (and the inline copy unfreezes) on `onClosed`.
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const open = useCallback(() => {
    setClosing(false);
    setFullscreen(true);
  }, []);
  const requestClose = useCallback(() => setClosing(true), []);
  const finishClose = useCallback(() => {
    setFullscreen(false);
    setClosing(false);
  }, []);

  // Lock page scroll behind the fullscreen overlay.
  useEffect(() => {
    if (!fullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [fullscreen]);

  const shared = { script, ariaLabel, stageWidth, stageHeight };

  return (
    <>
      <StageCore
        variant="inline"
        frozen={fullscreen}
        onLaunch={open}
        {...shared}
      >
        {children}
      </StageCore>
      {mounted &&
        fullscreen &&
        createPortal(
          <StageCore
            variant="fullscreen"
            closing={closing}
            onClose={requestClose}
            onClosed={finishClose}
            {...shared}
          >
            {children}
          </StageCore>,
          document.body,
        )}
    </>
  );
}
