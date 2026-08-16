/**
 * Single source of truth for the Playground roster. Since 2026-08-15 these
 * render as cells at the TAIL of the homepage work marquee — the separate
 * "Just for fun" section below the strip is gone, so client work and
 * sidequests read as one continuous body of work. Add a card here, drop a
 * video into `public/videos/`, and it appears at the end of the strip.
 *
 * (The old docblock named `components/Playground.tsx` and `app/play/page.tsx`
 * as consumers. Both were deleted in May 2026 — `CaseStudyList.tsx` is the
 * only consumer.)
 */
export type PlaygroundCard = {
  slug: string;
  title: string;
  year: string;
  /** Shown in the marquee card's mono meta line as "ORG • YEAR". Defaults
   *  to "Personal" — with the section header gone, this line is the only
   *  thing distinguishing a sidequest from client work. */
  org?: string;
  /** Live URL. When set the card links out in a new tab; when absent the
   *  card renders as a non-interactive cell with no pointer affordance, so
   *  a card that goes nowhere doesn't read as broken next to the work
   *  cards, which all navigate. */
  href?: string;
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
    slug: "photography-portfolio",
    title: "Photography Portfolio",
    year: "Jul 2026",
    href: "https://photo-canvas-theta.vercel.app",
    description:
      "Design explorations for my concert photography portfolio.",
    video: "/videos/photography-portfolio.mp4",
    aspect: "1932 / 1080",
  },
  {
    slug: "six-degrees",
    title: "Six Degrees",
    year: "Feb 2026 →",
    href: "https://six-degrees-topaz.vercel.app",
    description:
      "I turned my favorite roadtrip game into a digital experience. The object is to connect two random actors through a chain of shared films and co-stars. Built with Claude.",
    video: "/videos/six-degrees.mp4",
    aspect: "1756 / 1080",
  },
  {
    // No `href` — not deployed anywhere yet. Renders non-clickable.
    slug: "pajamagrams",
    title: "Pajamagrams",
    year: "Jan 2026",
    description: "Mobile word game inspired by Bananagrams. Built with Claude.",
    video: "/videos/pajamagrams.mp4",
    aspect: "628 / 1080",
  },
  {
    // No `href` — not deployed, and it's the personal gift project, so
    // whether it should be public at all is Marco's call. Non-clickable.
    slug: "custom-wrapped",
    title: "Custom Wrapped",
    year: "Nov 2025",
    description:
      "A Spotify Wrapped-inspired personal year-in-review experience. Data aggregation, interaction, and animations created with the help of Claude Code.",
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
