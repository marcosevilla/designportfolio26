/**
 * Single source of truth for the Playground roster. Consumed by
 * `components/Playground.tsx` (homepage section) and `app/play/page.tsx`
 * (the standalone Play index). Add a new card here, drop a video into
 * `public/videos/playground/`, and it shows up in both places.
 */
export type PlaygroundCard = {
  slug: string;
  title: string;
  year: string;
  description?: string;
  /** Path under /public — e.g. "/videos/six-degrees.mp4". When set, the
   *  card renders an autoplay loop muted video. */
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

export const PLAYGROUND_CARDS: PlaygroundCard[] = [
  {
    slug: "six-degrees",
    title: "Six Degrees",
    year: "Feb 2026 →",
    description:
      "I designed and developed one of my favorite roadtrip games into a digital experience with the help of Claude Code: Connect randomly paired actors through a chain co-stars and their shared films.",
    video: "/videos/six-degrees.mp4",
    aspect: "1756 / 1080",
  },
  {
    slug: "pajamagrams",
    title: "Pajamagrams",
    year: "Jan 2026",
    description:
      "A mobile-first word puzzle inspired by Bananagrams — drag tiles into place across clue-based rounds.",
    video: "/videos/pajamagrams.mp4",
    aspect: "628 / 1080",
  },
  {
    slug: "custom-wrapped",
    title: "Custom Wrapped",
    year: "Nov 2025",
    description:
      "A personal year-in-review styled like Spotify Wrapped — vertical swipes through milestones pulled from my calendar, Letterboxd, and other vaults.",
    video: "/videos/custom-wrapped.mp4",
    aspect: "648 / 1080",
  },
];

/** Parse a CSS aspect-ratio string ("1756 / 1080", "16/10") into a number.
 *  Defaults to 16:10 = 1.6 when missing or malformed. */
export function parseAspect(aspect: string | undefined): number {
  if (!aspect) return 1.6;
  const [w, h] = aspect.split("/").map((s) => parseFloat(s.trim()));
  if (!w || !h) return 1.6;
  return w / h;
}

/** Wide cards (landscape, aspect ≥ 1) span the full grid; narrow cards
 *  (portrait) span a single column so two phones sit side-by-side. */
export function isWide(card: PlaygroundCard): boolean {
  return parseAspect(card.aspect) >= 1;
}
