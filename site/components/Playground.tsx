"use client";

import { useEffect, useRef } from "react";
import { typescale } from "@/lib/typography";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type PlaygroundCard = {
  slug: string;
  title: string;
  year: string;
  description?: string;
  /** Path under /public — e.g. "/videos/playground/six-degrees.mp4". When
   *  set, the card renders an autoplay loop muted video. */
  video?: string;
  /** Static frame shown before the video plays and as the reduced-motion
   *  fallback. JPG at the same aspect ratio as the video. */
  poster?: string;
  /** CSS aspect-ratio for the card frame. Defaults to "16 / 10" (matches
   *  the Work section's GalleryCardList). Pass the video's native ratio
   *  (e.g. "9 / 16" for a phone capture) so the clip fills cleanly with
   *  no crop or letterbox. */
  aspect?: string;
};

// Roster — drop `video` + `poster` onto each card as captures land. Cards
// without a video fall back to the "Coming soon" frame.
const CARDS: PlaygroundCard[] = [
  {
    slug: "six-degrees",
    title: "Six Degrees",
    year: "Feb 2026 →",
    description:
      "A web game riffing on the Bacon-style actor-connection puzzle. First shipped as a horror-themed Valentine's Day gift, now growing into a generalized version with a deeper movie graph.",
    video: "/videos/playground/six-degrees.mp4",
    aspect: "1756 / 1080",
  },
  {
    slug: "pajamagrams",
    title: "Pajamagrams",
    year: "Jan 2026",
    description:
      "A mobile-first Bananagrams-inspired puzzle game — drag-and-drop letter tiles, clue-based rounds, and a tactile feel that holds up on a phone. Designed in Figma, built with React, given as a personal gift.",
    video: "/videos/playground/pajamagrams.mp4",
    aspect: "628 / 1080",
  },
  {
    slug: "custom-wrapped",
    title: "Custom Wrapped",
    year: "Nov 2025",
    description:
      "A web-based take on Spotify Wrapped — animated reveals, scrolling stat cards, and a year of inside jokes rendered as a personalized gift.",
    video: "/videos/playground/custom-wrapped.mp4",
    aspect: "648 / 1080",
  },
];

// Parse a CSS aspect-ratio string ("1756 / 1080", "16/10") into a number.
// Defaults to 16:10 = 1.6 when missing or malformed.
function parseAspect(aspect: string | undefined): number {
  if (!aspect) return 1.6;
  const [w, h] = aspect.split("/").map((s) => parseFloat(s.trim()));
  if (!w || !h) return 1.6;
  return w / h;
}

// "Wide" cards (landscape) span the full grid; "narrow" cards (portrait)
// span a single column so two phones sit side-by-side.
function isWide(card: PlaygroundCard): boolean {
  return parseAspect(card.aspect) >= 1;
}

export default function Playground() {
  return (
    <section className="relative z-10">
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
      </div>

      {/* Cards live in a 2-col grid at sm+. Landscape cards (aspect ≥ 1)
          span both columns and read full-width; portrait phone-shaped cards
          span one column each, so two phones sit side-by-side instead of
          taking over the page vertically. Mobile collapses to one column. */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-20">
        {CARDS.map((card) => (
          <div
            key={card.slug}
            className={isWide(card) ? "sm:col-span-2" : "sm:col-span-1"}
          >
            <PlaygroundCardItem card={card} />
          </div>
        ))}
      </div>
    </section>
  );
}

function PlaygroundCardItem({ card }: { card: PlaygroundCard }) {
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

      <CardFrame card={card} />

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

function CardFrame({ card }: { card: PlaygroundCard }) {
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
