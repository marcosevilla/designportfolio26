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
// Palettes use saturated, contrasting hues per band so each frequency lights
// up in a distinct color (rather than monochrome ramps where everything ends
// up the same shade).
export const PLAYLIST: Track[] = [
  {
    src: "/audio/track-6.mp3",
    title: "If (Kaytranada Remix)",
    artist: "Janet Jackson",
    // Sultry late-night — wine kicks, rose mids, coral highs, blush air
    palette: {
      bass: "#9F1239",   // rose-800
      mids: "#E11D48",   // rose-600
      highs: "#FB7185",  // rose-400
      air: "#FFE4E6",    // rose-100
    },
    mood: "warm",
  },
  {
    src: "/audio/track-0.mp3",
    title: "Blue Spring",
    artist: "Nathan Micay",
    // Spring sunset — deep blue kicks, sky mids, magenta highs, pale gold air
    palette: {
      bass: "#1D4ED8",   // blue-700
      mids: "#0EA5E9",   // sky-500
      highs: "#F472B6",  // pink-400
      air: "#FDE68A",    // amber-200
    },
    mood: "energetic",
  },
  {
    src: "/audio/track-1.mp3",
    title: "DANCE..",
    artist: "Slayyyter",
    // Heat ramp — red kicks, amber mids, gold highs, cream air
    palette: {
      bass: "#DC2626",   // red-600
      mids: "#F59E0B",   // amber-500
      highs: "#FACC15",  // yellow-400
      air: "#FEF08A",    // yellow-200
    },
    mood: "energetic",
  },
  {
    src: "/audio/track-2.mp3",
    title: "iPod Touch",
    artist: "Ninajirachi",
    // Cool jewel — violet kicks, blue mids, cyan highs, sky air
    palette: {
      bass: "#7C3AED",   // violet-600
      mids: "#3B82F6",   // blue-500
      highs: "#06B6D4",  // cyan-500
      air: "#A5F3FC",    // cyan-200
    },
    mood: "energetic",
  },
  {
    src: "/audio/track-5.mp3",
    title: "Lite Spots",
    artist: "KAYTRANADA",
    // Midnight neon — navy kicks, royal purple mids, neon-pink highs, gold air
    palette: {
      bass: "#1E40AF",   // blue-800
      mids: "#7C3AED",   // violet-600
      highs: "#F472B6",  // pink-400
      air: "#FBBF24",    // amber-400
    },
    mood: "chill",
  },
  {
    src: "/audio/track-7.mp3",
    title: "dance 2",
    artist: "Oklou",
    // Dreamy iridescent — indigo kicks, lavender mids, cyan highs, pearl air
    palette: {
      bass: "#4338CA",   // indigo-700
      mids: "#A78BFA",   // violet-400
      highs: "#67E8F9",  // cyan-300
      air: "#E0E7FF",    // indigo-100
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
