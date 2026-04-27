export type Mood = "chill" | "energetic" | "dark" | "dreamy" | "warm";

export type Palette = {
  /** Sub-bass + bass — drives blobs (kick, bass guitar). */
  bass: string;
  /** Low-mid + mid — drives the slow Perlin underlayer (vocals, snare body). */
  mids: string;
  /** High-mid + presence + treble — drives the fast Perlin overlay (snare crack, sibilance). */
  highs: string;
  /** Air band — drives sparkles (hi-hats, cymbals). */
  air: string;
};

export type Track = {
  src: string;
  title: string;
  artist: string;
  /** 4-color palette mapped to frequency-band groups. */
  palette: Palette;
  /** Optional. Globally tunes density/speed/intensity. Defaults to "warm". */
  mood?: Mood;
};

// Drop MP3/M4A files into public/audio/ and reference them via /audio/<file>.
export const PLAYLIST: Track[] = [
  {
    src: "/audio/track-1.mp3",
    title: "Untitled One",
    artist: "Marco's Picks",
    palette: {
      bass: "#B5651D",   // copper
      mids: "#E89B5A",   // amber
      highs: "#F2D29B",  // warm sand
      air: "#FFF1D6",    // cream
    },
    mood: "warm",
  },
  {
    src: "/audio/track-2.mp3",
    title: "Untitled Two",
    artist: "Marco's Picks",
    palette: {
      bass: "#3B3F8F",   // deep indigo
      mids: "#6366F1",   // electric indigo
      highs: "#A5B4FC",  // periwinkle
      air: "#E0E7FF",    // ice
    },
    mood: "energetic",
  },
  {
    src: "/audio/track-3.mp3",
    title: "Untitled Three",
    artist: "Marco's Picks",
    palette: {
      bass: "#0F4C42",   // deep teal
      mids: "#0D9488",   // teal
      highs: "#5EEAD4",  // mint
      air: "#CCFBF1",    // pale aqua
    },
    mood: "dreamy",
  },
];

// Mood modulators — global scalars applied to the visualizer per track.
export const MOODS: Record<Mood, {
  speed: number;       // time-rate multiplier (Perlin drift, blob expansion)
  density: number;     // sparkle / blob spawn rate multiplier
  intensity: number;   // overall lit-level multiplier
  sparkleRate: number; // multiplier on top of treble-driven sparkle spawn
}> = {
  chill:     { speed: 0.65, density: 0.7, intensity: 0.85, sparkleRate: 0.6 },
  energetic: { speed: 1.4,  density: 1.3, intensity: 1.0,  sparkleRate: 1.5 },
  dark:      { speed: 0.85, density: 0.8, intensity: 0.85, sparkleRate: 0.4 },
  dreamy:    { speed: 0.6,  density: 1.0, intensity: 0.95, sparkleRate: 1.2 },
  warm:      { speed: 1.0,  density: 1.0, intensity: 1.0,  sparkleRate: 1.0 },
};
