export type Track = {
  src: string;
  title: string;
  artist: string;
  /** Hex color used as the matrix accent while this track plays. */
  accentColor: string;
};

// Drop MP3/M4A files into public/audio/ and reference them via /audio/<file>.
// `accentColor` overrides the matrix's --color-accent while this track plays.
export const PLAYLIST: Track[] = [
  // Placeholder entries — replace with real tracks. Files at these paths are
  // expected to exist in public/audio/ before they'll play.
  {
    src: "/audio/track-1.mp3",
    title: "Untitled One",
    artist: "Marco's Picks",
    accentColor: "#B5651D",
  },
  {
    src: "/audio/track-2.mp3",
    title: "Untitled Two",
    artist: "Marco's Picks",
    accentColor: "#6366F1",
  },
  {
    src: "/audio/track-3.mp3",
    title: "Untitled Three",
    artist: "Marco's Picks",
    accentColor: "#0D9488",
  },
];
