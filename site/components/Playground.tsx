"use client";

import { useEffect, useRef } from "react";
import { typescale } from "@/lib/typography";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  PLAYGROUND_CARDS,
  type PlaygroundCard,
  isWide,
} from "@/lib/playground-cards";
import LockGate, { LockedFrameBadge } from "./LockGate";
import { isLocked } from "@/lib/locked-content";

export default function Playground({
  hideHeader = false,
}: { hideHeader?: boolean } = {}) {
  return (
    <section className="relative z-10">
      {!hideHeader && (
        <div className="mb-16">
          <h2
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "calc(var(--wordmark-fontsize, 48px) * 0.7)",
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: "-0.025em",
              color: "var(--color-fg)",
              whiteSpace: "nowrap",
            }}
          >
            Playground
          </h2>
          <p
            className="mt-4"
            style={{
              ...typescale.body,
              color: "var(--color-fg-secondary)",
              maxWidth: "560px",
            }}
          >
            Personal experiments and projects leveraging AI tooling.
          </p>
        </div>
      )}

      {/* Cards live in a 2-col grid at sm+. Landscape cards (aspect ≥ 1)
          span both columns and read full-width; portrait phone-shaped cards
          span one column each, so two phones sit side-by-side instead of
          taking over the page vertically. Mobile collapses to one column. */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-20">
        {PLAYGROUND_CARDS.map((card) => {
          const locked = isLocked(card.slug);
          return (
            <div
              key={card.slug}
              className={isWide(card) ? "sm:col-span-2" : "sm:col-span-1"}
            >
              <LockGate mode="card" locked={locked}>
                <PlaygroundCardItem card={card} locked={locked} />
              </LockGate>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PlaygroundCardItem({ card, locked = false }: { card: PlaygroundCard; locked?: boolean }) {
  // Cards used to <Link href={`/play/${slug}`}> to a dedicated
  // subpage; those subpages were removed for now, so the card is
  // rendered as a plain visual block. LockGate still wraps it for
  // any locked items so the "click for details" affordance keeps
  // working over the lock overlay.
  return (
    <div className="block w-full text-left">
      <div className="flex items-baseline justify-between gap-4 mb-3">
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "16px",
            fontWeight: 500,
            color: "var(--color-fg)",
            letterSpacing: "-0.01em",
          }}
        >
          {card.title}
        </span>
        <span
          style={{
            fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
            fontSize: "11px",
            color: "var(--color-fg-tertiary)",
            whiteSpace: "nowrap",
          }}
        >
          {card.year}
        </span>
      </div>

      <CardFrame card={card} locked={locked} />

      {card.description && (
        <p
          className="mt-4"
          style={{
            ...typescale.body,
            color: "var(--color-fg-secondary)",
            maxWidth: "640px",
          }}
        >
          {card.description}
        </p>
      )}
    </div>
  );
}

function CardFrame({ card, locked = false }: { card: PlaygroundCard; locked?: boolean }) {
  return (
    <div
      className="w-full rounded-2xl overflow-hidden relative"
      style={{
        backgroundColor: "var(--color-surface-raised)",
        border: "1px solid var(--color-border)",
        aspectRatio: card.aspect ?? "16 / 10",
      }}
    >
      {card.video ? (
        <CardVideo src={card.video} poster={card.poster} title={card.title} />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--color-fg-tertiary)",
          }}
        >
          Coming soon
        </div>
      )}
      <LockedFrameBadge locked={locked} />
    </div>
  );
}

// Auto-plays a muted, looping clip when the card scrolls into view; pauses
// when it leaves so four cards don't burn CPU at once. Respects
// prefers-reduced-motion by showing the poster only.
function CardVideo({
  src,
  poster,
  title,
}: {
  src: string;
  poster?: string;
  title: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (reducedMotion) {
      el.pause();
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          // play() returns a promise that can reject if the user hasn't
          // interacted with the page yet (rare, since the video is muted)
          // — swallow the error so it doesn't surface as an unhandled
          // rejection in the console.
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={title}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
      }}
    />
  );
}
