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
 * Behavior contract (Marco 2026-08-03):
 *   - Auto-plays on view, loops forever (children remount via key = reset).
 *   - Hover pauses + shows an "Interact with flow" overlay; clicking it hands
 *     over control (manual mode). Un-hovering without clicking resumes.
 *   - Reset button always restarts the choreographed run, from any mode.
 *   - Fullscreen renders a scaled-up copy in a body portal (fixed inside the
 *     case-study framer wrappers is a containing-block trap — see CLAUDE.md).
 *     Opening/closing starts a fresh run; inline copy freezes underneath.
 *   - prefers-reduced-motion ⇒ no auto-play at all, prototype starts live.
 *
 * Scale note: coordinates come from getBoundingClientRect, so targets inside
 * transform-scaled interiors (the phone renders at 390pt logical) need no
 * special handling.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export type DemoStep =
  | { type: "tap"; target: string; after?: number }
  | { type: "type"; target: string; text: string; after?: number }
  | { type: "wait"; ms: number };

const CURSOR_SIZE = 36;
const DEFAULT_SETTLE = 650;
const TARGET_TIMEOUT = 4000;
const CURSOR_EASE = "cubic-bezier(0.3, 0.1, 0.25, 1)";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── Icons (stroke, matches the site's utilitarian chrome) ─────────────────

function GlyphIcon({ d, size = 15 }: { d: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
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

function StageButton({
  glyph,
  label,
  onClick,
  onDark,
}: {
  glyph: keyof typeof GLYPHS;
  label: string;
  onClick: () => void;
  onDark?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={
        onDark
          ? "text-white/70 hover:text-white"
          : "text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]"
      }
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        border: onDark
          ? "1px solid rgba(255,255,255,0.22)"
          : "1px solid var(--color-border)",
        background: onDark
          ? "rgba(255,255,255,0.1)"
          : "color-mix(in srgb, var(--color-bg) 72%, transparent)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        padding: 0,
        transition: "color 150ms ease",
      }}
    >
      <GlyphIcon d={GLYPHS[glyph]} />
    </button>
  );
}

// ─── Stage core (one instance per surface: inline + fullscreen portal) ─────

type StageMode = "auto" | "manual";

function StageCore({
  variant,
  script,
  children,
  ariaLabel,
  stageWidth,
  stageHeight,
  childRadius = 0,
  frozen = false,
  onExpand,
  onClose,
}: {
  variant: "inline" | "fullscreen";
  script: DemoStep[];
  children: ReactNode;
  ariaLabel: string;
  stageWidth: number;
  stageHeight: number;
  /** Corner radius of the prototype itself — clips the hover scrim to it. */
  childRadius?: number;
  /** Inline copy freezes (stops running) while the fullscreen portal is up. */
  frozen?: boolean;
  onExpand?: () => void;
  onClose?: () => void;
}) {
  const [mode, setMode] = useState<StageMode>("auto");
  const [resetKey, setResetKey] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [cursorOn, setCursorOn] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [fsScale, setFsScale] = useState(1);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const cursorDotRef = useRef<HTMLDivElement | null>(null);
  const pausedRef = useRef(false);
  const inViewRef = useRef(variant === "fullscreen");
  // Script-driven focus() must not trip the keyboard-takeover handler.
  const scriptFocusRef = useRef(false);

  const scale = variant === "fullscreen" ? fsScale : 1;
  const cursorSize = Math.round(CURSOR_SIZE * scale);

  // Reduced motion ⇒ hand the prototype over immediately, never auto-play.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      setReduced(mq.matches);
      if (mq.matches) setMode("manual");
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Fullscreen: fit the stage to the viewport.
  useEffect(() => {
    if (variant !== "fullscreen") return;
    const compute = () =>
      setFsScale(
        Math.max(
          1,
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

  // Off-screen ⇒ pause (inline only; the portal is always on screen).
  const hoveredRef = useRef(false);
  useEffect(() => {
    hoveredRef.current = hovered;
    pausedRef.current = hovered || !inViewRef.current;
  }, [hovered]);
  useEffect(() => {
    if (variant === "fullscreen" || !stageRef.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        pausedRef.current = hoveredRef.current || !entry.isIntersecting;
      },
      { threshold: 0.3 },
    );
    io.observe(stageRef.current);
    return () => io.disconnect();
  }, [variant]);

  // Freezing (fullscreen opened over this copy): stop, and queue a fresh
  // auto run for when we unfreeze — the frozen copy's state is stale.
  useEffect(() => {
    if (!frozen) return;
    setMode("auto");
    setResetKey((k) => k + 1);
    setHovered(false);
  }, [frozen]);

  // ── Script executor ──────────────────────────────────────────────────────

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
    const x = r.left + r.width / 2 - stageRect.left - cursorSize / 2;
    const y = r.top + r.height / 2 - stageRect.top - cursorSize / 2;
    const prev = cursor.dataset.pos?.split(",").map(Number) ?? [x, y];
    const dist = Math.hypot(x - prev[0], y - prev[1]);
    const duration = instant ? 0 : Math.min(700, Math.max(280, dist * 0.9));
    cursor.style.transition = duration
      ? `transform ${duration}ms ${CURSOR_EASE}`
      : "none";
    cursor.style.transform = `translate(${x}px, ${y}px)`;
    cursor.dataset.pos = `${x},${y}`;
    return duration;
  };

  const pressCursor = async () => {
    const dot = cursorDotRef.current;
    if (!dot) return;
    dot.style.transform = "scale(0.72)";
    dot.style.background = "rgba(255,255,255,0.5)";
    await sleep(140);
    dot.style.transform = "scale(1)";
    dot.style.background = "rgba(255,255,255,0.28)";
    await sleep(70);
  };

  const typeInto = async (
    el: HTMLInputElement | HTMLTextAreaElement,
    text: string,
    cancelled: () => boolean,
  ) => {
    const proto =
      el instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
    const setValue = Object.getOwnPropertyDescriptor(proto, "value")!.set!;
    scriptFocusRef.current = true;
    el.focus({ preventScroll: true });
    scriptFocusRef.current = false;
    for (let i = 1; i <= text.length; i++) {
      if (cancelled()) return;
      setValue.call(el, text.slice(0, i));
      el.dispatchEvent(new Event("input", { bubbles: true }));
      await sleep(120);
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
          // their inputs), which would both trip the keyboard-takeover
          // handler and scroll the page — flag the window and pin scroll.
          const sx = window.scrollX;
          const sy = window.scrollY;
          scriptFocusRef.current = true;
          el.click();
          if (
            el instanceof HTMLInputElement ||
            el instanceof HTMLTextAreaElement
          ) {
            el.focus({ preventScroll: true });
          }
          scriptFocusRef.current = false;
          window.scrollTo(sx, sy);
        } else {
          await typeInto(
            el as HTMLInputElement | HTMLTextAreaElement,
            step.text,
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
    if (frozen || mode !== "auto" || reduced) {
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
  }, [mode, frozen, reduced, resetKey, playScript, cursorSize]);

  // ── Controls ─────────────────────────────────────────────────────────────

  const handleReset = () => {
    setMode(reduced ? "manual" : "auto");
    setResetKey((k) => k + 1);
  };

  const takeOver = () => {
    setMode("manual");
    setCursorOn(false);
  };

  // Keyboard users tabbing into the prototype take over too.
  const handleFocusCapture = () => {
    if (scriptFocusRef.current) return;
    if (mode === "auto" && !reduced) takeOver();
  };

  useEffect(() => {
    if (variant !== "fullscreen" || !onClose) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [variant, onClose]);

  const interactable = mode === "manual";
  const showHoverOverlay = mode === "auto" && !reduced && hovered && !frozen;

  // Hover-to-pause listens on the whole panel (inline) / the stage
  // (fullscreen — the scrim is a close target, not part of the demo).
  const hoverHandlers = {
    onPointerEnter: () => setHovered(true),
    onPointerLeave: () => setHovered(false),
  };

  // ── Stage (shared between variants) ──────────────────────────────────────

  const stage = (
    <div
      ref={stageRef}
      {...(variant === "fullscreen" ? hoverHandlers : {})}
      onFocusCapture={handleFocusCapture}
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
            z-50) so the cursor + overlay always sit above it. */}
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

      {/* Ghost cursor — frosted glass tap circle */}
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
        }}
      >
        <div
          ref={cursorDotRef}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 999,
            background: "rgba(255,255,255,0.28)",
            border: "1px solid rgba(255,255,255,0.6)",
            backdropFilter: "blur(3px)",
            WebkitBackdropFilter: "blur(3px)",
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.28), inset 0 1px 1px rgba(255,255,255,0.45)",
            transition:
              "transform 130ms ease, background 130ms ease, opacity 250ms ease",
          }}
        />
      </div>

      {/* Hover: pause + take-over affordance */}
      <button
        type="button"
        tabIndex={showHoverOverlay ? 0 : -1}
        aria-hidden={!showHoverOverlay}
        onClick={takeOver}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 3,
          border: "none",
          padding: 0,
          borderRadius: childRadius * scale,
          background: "rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          opacity: showHoverOverlay ? 1 : 0,
          pointerEvents: showHoverOverlay ? "auto" : "none",
          transition: "opacity 180ms ease",
        }}
      >
        <span
          style={{
            padding: "10px 18px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.92)",
            color: "#111111",
            fontSize: 13,
            fontWeight: 600,
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          }}
        >
          Interact with flow
        </span>
      </button>
    </div>
  );

  // ── Chrome per variant ───────────────────────────────────────────────────

  if (variant === "fullscreen") {
    return (
      <div
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
          background: "rgba(8,8,8,0.78)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            display: "flex",
            gap: 10,
            zIndex: 4,
          }}
        >
          <StageButton glyph="reset" label="Restart demo" onClick={handleReset} onDark />
          <StageButton glyph="close" label="Close fullscreen" onClick={() => onClose?.()} onDark />
        </div>
        {stage}
      </div>
    );
  }

  const panelStyle: CSSProperties = {
    background: "color-mix(in srgb, var(--color-fg) 7%, var(--color-bg))",
    visibility: frozen ? "hidden" : "visible",
  };

  return (
    <section
      aria-label={ariaLabel}
      className="relative rounded-[10px] border border-border"
      style={panelStyle}
      {...hoverHandlers}
    >
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          display: "flex",
          gap: 8,
          zIndex: 4,
        }}
      >
        <StageButton glyph="reset" label="Restart demo" onClick={handleReset} />
        {onExpand && (
          <StageButton glyph="expand" label="View fullscreen" onClick={onExpand} />
        )}
      </div>
      <div className="flex flex-col items-center gap-6 px-4 py-12 sm:py-16">
        {stage}
      </div>
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
  childRadius,
}: {
  script: DemoStep[];
  children: ReactNode;
  ariaLabel: string;
  stageWidth: number;
  stageHeight: number;
  childRadius?: number;
}) {
  const [fullscreen, setFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Lock page scroll behind the fullscreen overlay.
  useEffect(() => {
    if (!fullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [fullscreen]);

  const shared = { script, ariaLabel, stageWidth, stageHeight, childRadius };

  return (
    <>
      <StageCore
        variant="inline"
        frozen={fullscreen}
        onExpand={() => setFullscreen(true)}
        {...shared}
      >
        {children}
      </StageCore>
      {mounted &&
        fullscreen &&
        createPortal(
          <StageCore
            variant="fullscreen"
            onClose={() => setFullscreen(false)}
            {...shared}
          >
            {children}
          </StageCore>,
          document.body,
        )}
    </>
  );
}
