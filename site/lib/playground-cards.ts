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

export const PLAYGROUND_CARDS: PlaygroundCard[] = [
  {
    slug: "six-degrees",
    title: "Six Degrees",
    year: "Feb 2026 →",
    description:
      "A movie-graph puzzle game that started as a roadtrip car game with friends. The architecture is the easy part — a TMDb actor pool filtered for real blockbuster careers, with the graph itself acting as the difficulty oracle: share a film (easy), one degree apart (medium), no obvious connection (hard). The craft was in the snap, the sound (synthesized in Web Audio so I could shape every chime by hand), and tuning difficulty so even cinephiles wouldn't rage-quit. Plays well in the wild now, with the same friends.",
    video: "/videos/playground/six-degrees.mp4",
    aspect: "1756 / 1080",
  },
  {
    slug: "pajamagrams",
    title: "Pajamagrams",
    year: "Jan 2026",
    description:
      "A mobile-first puzzle gift inspired by Bananagrams — drag tiles, clue-based rounds, given to someone I love. A stress test for the Figma-MCP workflow at the time: every letter, every state designed in Figma first, then handed to Claude with the mechanics and the desired feel. Most of the work went into tile snap — the few pixels of forgiveness between “this tile knows where I want it” and “this is frustrating” — and breaking down that taste into terms granular enough for Claude to translate.",
    video: "/videos/playground/pajamagrams.mp4",
    aspect: "628 / 1080",
  },
  {
    slug: "custom-wrapped",
    title: "Custom Wrapped",
    year: "Nov 2025",
    description:
      "A year-in-review experience built like Spotify Wrapped — vertical swipe carousel, GSAP-driven timelines, stop-motion animation that feels more vintage video game than smooth web. Three font voices play three roles: 8-bit pixel as the throughline, Geist for loud beats, Caveat for the intimate slides (a wedding thank-you card needs handwriting). Built as a gift, but the real unlock was the data — flights from my calendar to count vacations, Letterboxd cross-referenced with theater visits to surface a year in movies. AI is the tool that finally lets a vault of half-formed ideas become real things you can hand to someone.",
    video: "/videos/playground/custom-wrapped.mp4",
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
