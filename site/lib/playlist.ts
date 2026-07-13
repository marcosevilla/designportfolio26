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
  {
    src: "/audio/track-8.mp3",
    title: "I'll Take It",
    artist: "Sophia Stel",
    // Dusk haze — navy kicks, blue mids, blush highs, stone air
    palette: {
      bass: "#1E3A8A",   // blue-900
      mids: "#3B82F6",   // blue-500
      highs: "#FDA4AF",  // rose-300
      air: "#F5F5F4",    // stone-100
    },
    mood: "dreamy",
  },
  {
    src: "/audio/track-9.mp3",
    title: "eat, sleep, slay",
    artist: "horsegiirL",
    // Hyper-pop pasture — magenta kicks, pink mids, lime highs, blush air
    palette: {
      bass: "#BE185D",   // pink-700
      mids: "#EC4899",   // pink-500
      highs: "#A3E635",  // lime-400
      air: "#FCE7F3",    // pink-100
    },
    mood: "energetic",
  },
  {
    src: "/audio/track-10.mp3",
    title: "Tell Me (U Want It)",
    artist: "underscores",
    // Glitch contrast — slate kicks, red mids, green highs, near-white air
    palette: {
      bass: "#1E293B",   // slate-800
      mids: "#DC2626",   // red-600
      highs: "#4ADE80",  // green-400
      air: "#F8FAFC",    // slate-50
    },
    mood: "energetic",
  },
  {
    src: "/audio/track-11.mp3",
    title: "Fuck My Computer",
    artist: "Ninajirachi",
    // Deep-sea circuit — teal kicks, aqua mids, ice highs, stone air
    palette: {
      bass: "#134E4A",   // teal-900
      mids: "#2DD4BF",   // teal-400
      highs: "#A5F3FC",  // cyan-200
      air: "#E7E5E4",    // stone-200
    },
    mood: "energetic",
  },
  {
    src: "/audio/track-12.mp3",
    title: "We Are Making Out (feat. yeule)",
    artist: "Mura Masa",
    // Crimson wash — oxblood kicks, red mids, salmon highs, blush air
    palette: {
      bass: "#991B1B",   // red-800
      mids: "#EF4444",   // red-500
      highs: "#FCA5A5",  // red-300
      air: "#FEF2F2",    // red-50
    },
    mood: "dreamy",
  },
  {
    src: "/audio/track-13.mp3",
    title: "Winny",
    artist: "Fred again.., Sammy Virji & Winny",
    // B&W single cover — grayscale ramp
    palette: {
      bass: "#171717",   // neutral-900
      mids: "#525252",   // neutral-600
      highs: "#A3A3A3",  // neutral-400
      air: "#F5F5F5",    // neutral-100
    },
    mood: "energetic",
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
