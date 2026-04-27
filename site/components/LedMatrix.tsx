"use client";

import { useEffect, useRef } from "react";
import { useDialKit } from "dialkit";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useAudioPlayer } from "@/lib/AudioPlayerContext";
import { useVisualizerScene } from "@/lib/VisualizerSceneContext";
import { AudioAnalyzer, type AnalysisSnapshot } from "@/lib/audio-analysis";
import { MOODS, type Track } from "@/lib/playlist";

// Geometry
const SPACING = 5;          // px between dot centers
const DOT_BASE = 2;         // px diameter at rest
const DOT_BLOOM = 3;        // px diameter when fully lit
const HEIGHT = 200;         // px
const CORNER_RADIUS = 12;   // px — rounded-rect mask, dots outside are skipped

// Boot
const BOOT_FADE_MS = 400;

// Ripples — pebble-in-water: each click emits a stagger of concentric rings
const RIPPLE_TOTAL_MS = 2800;       // per-ring lifetime
const RIPPLE_CROSS_MS = 2000;       // time for one ring to traverse the longer axis
const RIPPLE_RING_PX = 9;           // wavefront thickness (soft bell falloff)
const RIPPLE_RING_COUNT = 4;        // rings emitted per click
const RIPPLE_RING_STAGGER_MS = 360; // delay between successive rings being born
const RIPPLE_RING_DECAY = 0.66;     // each subsequent ring's intensity multiplier
const RIPPLE_GLOW_CAP = 0.45;       // overall max-glow ceiling — keeps it subtle

// Hover — soft cursor flashlight
const HOVER_RADIUS = 56;            // px — flashlight reach
const HOVER_INTENSITY = 0.4;        // max contribution at the cursor center
const HOVER_FADE_RATE = 0.12;       // exponential approach per frame (60fps ≈ ~86ms half-life)

// Idle Perlin waves — randomly triggered, varying strength
const IDLE_INTERVAL_MIN_MS = 3500;
const IDLE_INTERVAL_MAX_MS = 9000;
const IDLE_DURATION_MIN_MS = 6000;
const IDLE_DURATION_MAX_MS = 12000;
const IDLE_INTENSITY_MIN = 0.18;
const IDLE_INTENSITY_MAX = 0.55;
const IDLE_NOISE_SCALE = 0.018;     // spatial frequency
const IDLE_NOISE_TIME_RATE = 0.00018; // temporal drift

// Audio visualizer — combination: bass blobs + mids Perlin + treble sparkles
const AUDIO_FADE_RATE = 0.025;       // exponential approach for visualizer mix transition (~600ms half-life)
const BASS_SPAWN_THRESHOLD = 0.42;   // bass energy required to spawn a blob
const BASS_SPAWN_DELTA = 0.12;       // also requires this much rise from previous frame
const BASS_BLOB_LIFE_MS = 1400;
const BASS_BLOB_RADIUS_PX = 90;      // max radius of a single blob
const BASS_BLOB_INTENSITY = 0.7;
const MIDS_NOISE_SCALE = 0.022;
const MIDS_NOISE_TIME_RATE = 0.0009;
const MIDS_BASE_INTENSITY = 0.18;    // background brightness while playing
const MIDS_PEAK_INTENSITY = 0.55;    // additional intensity scaled by mids energy
const TREBLE_SPARKLE_RATE = 6;       // base spawns per frame, scaled by treble energy
const SPARKLE_LIFE_MS = 220;
const SPARKLE_INTENSITY = 0.85;

type BassBlob = { x: number; y: number; t0: number; intensity: number };
type BassRing = {
  x: number;
  y: number;
  t0: number;
  intensity: number;
  /** Polyrhythm only — colors the ring by source band. */
  band?: "bass" | "mids" | "highs";
  /** Polyrhythm only — multiplier on cross speed (varies expansion rate). */
  speedFactor?: number;
};
type Sparkle = { x: number; y: number; t0: number };

// Bass-ring effect (alternative to blob)
const BASS_RING_LIFE_MS = 1600;
const BASS_RING_CROSS_MS = 1200;
const BASS_RING_THICKNESS = 8;
const BASS_DISK_MAX_RADIUS = 110;
const BASS_DISK_RIM_FRAC = 0.08; // fraction of radius used for soft rim antialiasing

type Ripple = { x: number; y: number; t0: number; strength: number };
type IdleWave = {
  t0: number;
  duration: number;
  intensity: number;
  ox: number; // noise offset
  oy: number;
  drift: number;
};

// ── Tiny 2D value-noise (smooth, deterministic) ─────────────────────────
// Not true Perlin, but gives the same visual character — smooth, organic,
// no axis-aligned artefacts at our scale — and is small + fast.
const PERM_SIZE = 256;
const PERM = (() => {
  const p = new Uint8Array(PERM_SIZE * 2);
  const base = new Uint8Array(PERM_SIZE);
  for (let i = 0; i < PERM_SIZE; i++) base[i] = i;
  // Deterministic shuffle (xorshift)
  let s = 0x9e3779b9;
  for (let i = PERM_SIZE - 1; i > 0; i--) {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    const j = (s >>> 0) % (i + 1);
    const tmp = base[i]; base[i] = base[j]; base[j] = tmp;
  }
  for (let i = 0; i < PERM_SIZE * 2; i++) p[i] = base[i & (PERM_SIZE - 1)];
  return p;
})();

function smooth(t: number) {
  return t * t * (3 - 2 * t);
}

function valueNoise2D(x: number, y: number): number {
  const xi = Math.floor(x) & (PERM_SIZE - 1);
  const yi = Math.floor(y) & (PERM_SIZE - 1);
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);
  const v00 = PERM[PERM[xi] + yi] / 255;
  const v10 = PERM[PERM[xi + 1] + yi] / 255;
  const v01 = PERM[PERM[xi] + yi + 1] / 255;
  const v11 = PERM[PERM[xi + 1] + yi + 1] / 255;
  const u = smooth(xf);
  const v = smooth(yf);
  const a = v00 + (v10 - v00) * u;
  const b = v01 + (v11 - v01) * u;
  return a + (b - a) * v; // 0..1
}

// ── Color helpers ────────────────────────────────────────────────────────
function parseColor(c: string): [number, number, number] {
  const s = c.trim();
  if (s.startsWith("#")) {
    const hex = s.slice(1);
    const full = hex.length === 3 ? hex.split("").map((x) => x + x).join("") : hex;
    return [
      parseInt(full.slice(0, 2), 16),
      parseInt(full.slice(2, 4), 16),
      parseInt(full.slice(4, 6), 16),
    ];
  }
  const m = s.match(/rgba?\(\s*(\d+)\s*[,\s]\s*(\d+)\s*[,\s]\s*(\d+)/);
  if (m) return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
  return [180, 180, 180];
}

export default function LedMatrix() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  // Bridge React audio state into the imperative animation loop via a ref.
  const audio = useAudioPlayer();
  const { activeScenes } = useVisualizerScene();
  const audioStateRef = useRef({
    isPlaying: audio.isPlaying,
    track: audio.currentTrack as Track,
    getFrequencyData: audio.getFrequencyData,
    getSampleRate: audio.getSampleRate,
    scenes: activeScenes,
  });
  audioStateRef.current = {
    isPlaying: audio.isPlaying,
    track: audio.currentTrack as Track,
    getFrequencyData: audio.getFrequencyData,
    getSampleRate: audio.getSampleRate,
    scenes: activeScenes,
  };

  // DialKit panel — live tuning of effect types, colors, and per-band intensity.
  // Panel UI only renders in dev (DialRoot is dev-mounted); in prod these
  // values stay at defaults and behave like static config.
  const dial = useDialKit("Visualizer", {
    master: {
      enabled: true,
      audioMixCap: [1.0, 0, 1],
      beatFlash: [0.18, 0, 1],
    },
    bass: {
      type: {
        type: "select" as const,
        options: ["disk", "blob", "ring", "off"],
        default: "disk",
      },
      override: false,
      color: { type: "color" as const, default: "#B5651D" },
      intensity: [1.4, 0, 2],
      threshold: [0.30, 0, 1],
      radius: [120, 20, 200],
      softness: [0.3, 0, 1],
    },
    mids: {
      type: {
        type: "select" as const,
        options: ["rings", "perlin", "off"],
        default: "rings",
      },
      override: false,
      color: { type: "color" as const, default: "#E89B5A" },
      intensity: [0.7, 0, 2],
      speed: [1.0, 0, 3],
    },
    highs: {
      type: {
        type: "select" as const,
        options: ["perlin-fast", "off"],
        default: "off",
      },
      override: false,
      color: { type: "color" as const, default: "#F2D29B" },
      intensity: [0.5, 0, 2],
      speed: [1.0, 0, 3],
    },
    air: {
      type: {
        type: "select" as const,
        options: ["sparkle", "off"],
        default: "sparkle",
      },
      override: false,
      color: { type: "color" as const, default: "#FFF1D6" },
      intensity: [1.0, 0, 2],
      rate: [1.0, 0, 3],
    },
  });
  const dialRef = useRef(dial);
  dialRef.current = dial;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;
    let cssW = 0;
    let cssH = HEIGHT;
    let cols = 0;
    let rows = 0;

    let offColor: [number, number, number] = [230, 230, 230];
    let onColor: [number, number, number] = [181, 101, 29];

    const refreshColors = () => {
      const styles = getComputedStyle(document.documentElement);
      const offRaw = styles.getPropertyValue("--color-border").trim();
      const onRaw = styles.getPropertyValue("--color-accent").trim();
      if (offRaw) offColor = parseColor(offRaw);
      if (onRaw) onColor = parseColor(onRaw);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      cssW = rect.width;
      cssH = HEIGHT;
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      cols = Math.floor(cssW / SPACING);
      rows = Math.floor(cssH / SPACING);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    refreshColors();
    resize();

    // ── Scene-specific persistent buffers (re-allocated on resize) ────────
    // drumhead: ping-pong wave state + per-cell display envelope (smooth attack/release)
    let waveA: Float32Array = new Float32Array(0);
    let waveB: Float32Array = new Float32Array(0);
    let waveEnv: Float32Array = new Float32Array(0);
    // spectrogram: cols×rows ring buffer (column = time, row = freq)
    let specBuf: Float32Array = new Float32Array(0);
    let specCursor = 0;
    // feedback / lissajous: shared persistent brightness buffer
    let persistA: Float32Array = new Float32Array(0);
    let persistB: Float32Array = new Float32Array(0);
    // polyrhythm: separate per-band onset history
    let prevBassPoly = 0, prevMidPoly = 0, prevHighPoly = 0;
    // chladni: smoothly drifting modes + rotation + phase shifts so the
    // pattern is always moving even when audio is steady; onsets snap to a
    // new random (m, n) for shape variety
    let chladniM = 3, chladniN = 4;
    let chladniMTarget = 3, chladniNTarget = 4;
    let chladniRotation = 0;
    let chladniPhaseX = 0, chladniPhaseY = 0;

    const reallocSceneBuffers = () => {
      const total = cols * rows;
      waveA = new Float32Array(total);
      waveB = new Float32Array(total);
      waveEnv = new Float32Array(total);
      specBuf = new Float32Array(total);
      specCursor = 0;
      persistA = new Float32Array(total);
      persistB = new Float32Array(total);
    };
    reallocSceneBuffers();

    const ripples: Ripple[] = [];
    const idleWaves: IdleWave[] = [];
    let nextIdleAt = 0;

    // Cursor flashlight state
    let cursorX = 0;
    let cursorY = 0;
    let cursorTargetAlpha = 0; // 1 when over canvas, 0 when not
    let cursorAlpha = 0;       // smoothed value, drives the actual glow

    // Audio visualizer state
    let audioMix = 0;            // 0 = idle, 1 = audio-reactive (smoothly interpolated)
    let prevBass = 0;            // for spike detection
    const bassBlobs: BassBlob[] = [];
    const bassRings: BassRing[] = [];
    const sparkles: Sparkle[] = [];
    const analyzer = new AudioAnalyzer();
    let analysis: AnalysisSnapshot | null = null;
    // Per-track palette colors (parsed lazily, refreshed when track changes)
    let bassCol: [number, number, number] = [180, 100, 30];
    let midsCol: [number, number, number] = [232, 155, 90];
    let highsCol: [number, number, number] = [242, 210, 155];
    let airCol: [number, number, number] = [255, 241, 214];
    let lastPaletteSrc = "";
    // Beat-flash for onset events
    let onsetFlashStrength = 0;

    const t0 = performance.now();
    let raf = 0;

    const scheduleNextIdle = (now: number) => {
      nextIdleAt = now + IDLE_INTERVAL_MIN_MS + Math.random() * (IDLE_INTERVAL_MAX_MS - IDLE_INTERVAL_MIN_MS);
    };
    scheduleNextIdle(t0);

    const draw = (now: number) => {
      const bootP = Math.min(1, (now - t0) / BOOT_FADE_MS);

      // Smooth cursor fade in/out
      cursorAlpha += (cursorTargetAlpha - cursorAlpha) * HOVER_FADE_RATE;

      // Audio mix transition + sample frequency data + 8-band analysis
      const aState = audioStateRef.current;
      const targetMix = aState.isPlaying ? 1 : 0;
      audioMix += (targetMix - audioMix) * AUDIO_FADE_RATE;
      if (Math.abs(targetMix - audioMix) < 0.001) audioMix = targetMix;

      const track = aState.track;
      const mood = MOODS[track.mood ?? "warm"];

      // Refresh palette colors when the track changes
      if (track.src !== lastPaletteSrc) {
        bassCol = parseColor(track.palette.bass);
        midsCol = parseColor(track.palette.mids);
        highsCol = parseColor(track.palette.highs);
        airCol = parseColor(track.palette.air);
        lastPaletteSrc = track.src;
        analyzer.reset();
      }

      analysis = null;
      if (audioMix > 0.01 && aState.getFrequencyData) {
        const data = aState.getFrequencyData();
        const sr = aState.getSampleRate();
        if (data && sr) {
          analysis = analyzer.process(data, sr, now);
        }
      }

      const bassGroup = analysis?.bassGroup ?? 0;
      const midsGroup = analysis?.midsGroup ?? 0;
      const highsGroup = analysis?.highsGroup ?? 0;
      const airGroup = analysis?.airGroup ?? 0;
      const onsetThisFrame = analysis?.onsetThisFrame ?? false;

      // BPM-driven speed multiplier — 120 BPM = 1.0×, 60 BPM = 0.5×, 180 BPM = 1.5×
      const bpm = analysis?.bpm ?? 120;
      const bpmSpeed = bpm / 120;
      const speed = mood.speed * bpmSpeed;

      // Pull live dial values
      const d = dialRef.current;
      const masterEnabled = d.master.enabled;
      audioMix = Math.min(audioMix, d.master.audioMixCap);

      // Bass spike → spawn appropriate effect based on dial-selected type
      const bassThreshold = d.bass.threshold;
      const bassEffect: string = d.bass.type;
      if (
        masterEnabled &&
        audioMix > 0.5 &&
        bassEffect !== "off" && bassEffect !== "disk" &&
        bassGroup > bassThreshold &&
        bassGroup - prevBass > BASS_SPAWN_DELTA
      ) {
        const x =
          BASS_BLOB_RADIUS_PX * 0.3 + Math.random() * (cssW - BASS_BLOB_RADIUS_PX * 0.6);
        const y =
          BASS_BLOB_RADIUS_PX * 0.3 + Math.random() * (cssH - BASS_BLOB_RADIUS_PX * 0.6);
        const intensity =
          BASS_BLOB_INTENSITY * Math.min(1, bassGroup + 0.2) * mood.intensity * d.bass.intensity;
        if (bassEffect === "blob") {
          bassBlobs.push({ x, y, t0: now, intensity });
        } else if (bassEffect === "ring") {
          bassRings.push({ x, y, t0: now, intensity });
        }
      }
      prevBass = bassGroup;

      // Air → sparkle spawn rate, scaled by mood + dial rate
      if (masterEnabled && audioMix > 0.5 && d.air.type === "sparkle" && airGroup > 0.05) {
        const spawnCount = Math.floor(
          TREBLE_SPARKLE_RATE * airGroup * mood.density * mood.sparkleRate * audioMix * d.air.rate
        );
        for (let i = 0; i < spawnCount; i++) {
          sparkles.push({
            x: Math.random() * cssW,
            y: Math.random() * cssH,
            t0: now,
          });
        }
      }

      // Onset → brief beat flash (full-grid pulse)
      if (onsetThisFrame && audioMix > 0.5) {
        onsetFlashStrength = Math.min(1, onsetFlashStrength + 0.6);
      }
      onsetFlashStrength = Math.max(0, onsetFlashStrength - 0.08); // decay

      // ── Per-frame scene state updates (before the per-dot loop) ──────────
      const scenes = aState.scenes;

      // CHLADNI — modes drift smoothly + rotation + phase. Strong onsets
      // snap to a new random (m, n) for occasional dramatic shape changes.
      if (scenes.has("chladni") && audioMix > 0.01) {
        // Continuous slow drift via sine waves on time, plus audio offsets
        const tDrift = now * 0.00038;
        const mSinusoid = Math.sin(tDrift * 0.7) * 1.6;
        const nSinusoid = Math.cos(tDrift * 0.5) * 1.6;
        const mAudio = (analysis?.bands.bass ?? 0) * 2.2 + (analysis?.bands.lowMid ?? 0) * 1.6;
        const nAudio = (analysis?.bands.highMid ?? 0) * 2.2 + (analysis?.bands.air ?? 0) * 1.8;

        // Discrete jump on strong beats — picks a new random (m, n) pair.
        // Coprime-ish low integers give the most distinct visual patterns.
        if (
          onsetThisFrame &&
          analysis &&
          analysis.beatStrength > 0.45 &&
          Math.random() < 0.55
        ) {
          const choices: [number, number][] = [
            [1, 2], [1, 3], [2, 3], [2, 5], [3, 4], [3, 5],
            [3, 7], [4, 5], [4, 7], [5, 6], [5, 7], [5, 8],
          ];
          const pick = choices[Math.floor(Math.random() * choices.length)];
          // Randomly swap order so we sample both orientations
          chladniMTarget = Math.random() < 0.5 ? pick[0] : pick[1];
          chladniNTarget = chladniMTarget === pick[0] ? pick[1] : pick[0];
        } else {
          chladniMTarget = 2.5 + mSinusoid + mAudio;
          chladniNTarget = 3.5 + nSinusoid + nAudio;
        }
        // Smooth tracking — same envelope idea Lissajous uses on its decay
        chladniM += (chladniMTarget - chladniM) * 0.045;
        chladniN += (chladniNTarget - chladniN) * 0.045;
        // Slow rotation, accelerated by bass for "energy"
        chladniRotation += 0.0025 + 0.005 * (analysis?.bassGroup ?? 0);
        // Phases drift so the lattice flows
        chladniPhaseX += 0.0035 + 0.006 * (analysis?.midsGroup ?? 0);
        chladniPhaseY += 0.0028 + 0.005 * (analysis?.highsGroup ?? 0);
      }

      // DRUMHEAD — 2D wave equation, ping-pong buffers + per-cell display
      // envelope so the rendered brightness is smooth (Lissajous-like
      // attack/release) instead of the raw, twitchy |u|. Impulses are
      // gated on beat strength so quiet passages stay calm.
      if (scenes.has("drumhead") && audioMix > 0.01) {
        // Inject impulse only on stronger onsets — gives the field room to breathe
        if (
          onsetThisFrame &&
          analysis &&
          analysis.beatStrength > 0.2 &&
          analysis.bassGroup > 0.15
        ) {
          const cx = Math.floor(Math.random() * (cols - 4)) + 2;
          const cy = Math.floor(Math.random() * (rows - 4)) + 2;
          const amp = 0.55 + analysis.beatStrength * 0.85;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const i = (cy + dy) * cols + (cx + dx);
              if (i >= 0 && i < waveA.length)
                waveA[i] += amp * (dx === 0 && dy === 0 ? 1 : 0.35);
            }
          }
        }
        // One sub-step per frame, faster damping → cleaner decay
        const c2 = 0.16;
        const damp = 0.985;
        for (let r = 1; r < rows - 1; r++) {
          for (let c = 1; c < cols - 1; c++) {
            const i = r * cols + c;
            const lap =
              waveA[i - 1] + waveA[i + 1] + waveA[i - cols] + waveA[i + cols] - 4 * waveA[i];
            waveB[i] = (2 * waveA[i] - waveB[i] + c2 * lap) * damp;
          }
        }
        // Swap waveA <-> waveB
        const tmp = waveA;
        waveA = waveB;
        waveB = tmp;

        // Update display envelope per cell. Attack snaps up; release fades
        // slowly. Smooths the rendered output the same way Lissajous's
        // persistent-buffer decay smooths its curve.
        const ENV_RISE = 0.55;
        const ENV_FALL = 0.93;
        for (let i = 0; i < waveEnv.length; i++) {
          const target = Math.abs(waveA[i]);
          if (target > waveEnv[i]) {
            waveEnv[i] = waveEnv[i] + (target - waveEnv[i]) * ENV_RISE;
          } else {
            waveEnv[i] = waveEnv[i] * ENV_FALL;
          }
        }
      }

      // SPECTROGRAM — write current FFT column to ring buffer at cursor
      if (scenes.has("spectrogram") && analysis && audioMix > 0.01) {
        const data = aState.getFrequencyData?.();
        if (data) {
          const n = data.length;
          for (let r = 0; r < rows; r++) {
            // Map row → FFT bin (low freqs at bottom, high at top).
            // Use log mapping so bass takes more visual real estate.
            const t = (rows - 1 - r) / Math.max(1, rows - 1); // 0 at bottom, 1 at top
            const bin = Math.floor(Math.pow(t, 2.2) * (n - 1));
            specBuf[r * cols + specCursor] = data[bin] / 255;
          }
        }
        specCursor = (specCursor + 1) % cols;
      }

      // POLYRHYTHM — per-band onsets each spawn rings with randomized
      // origins, varied speeds, and possible multi-ring bursts on strong
      // hits. Distinct band lineages stay readable via color, not position.
      if (scenes.has("polyrhythm") && analysis && audioMix > 0.5) {
        const bg = analysis.bassGroup;
        const mg = analysis.midsGroup;
        const hg = (analysis.bands.highMid + analysis.bands.presence) / 2;

        // Bass kick → 1–2 rings, lower band of the matrix, varied
        if (bg - prevBassPoly > 0.13 && bg > 0.32) {
          const count = bg > 0.6 ? 2 : 1;
          for (let i = 0; i < count; i++) {
            bassRings.push({
              x: Math.random() * cssW,
              y: cssH * 0.55 + Math.random() * cssH * 0.4,
              t0: now + i * 80,
              intensity: 0.85 + Math.random() * 0.25,
              band: "bass",
              speedFactor: 0.8 + Math.random() * 0.4,
            });
          }
        }
        // Mid hit → ring middle band, occasional pair on strong hits
        if (mg - prevMidPoly > 0.11 && mg > 0.28) {
          const count = mg > 0.5 ? 2 : 1;
          for (let i = 0; i < count; i++) {
            bassRings.push({
              x: Math.random() * cssW,
              y: cssH * 0.25 + Math.random() * cssH * 0.5,
              t0: now + i * 60,
              intensity: 0.65 + Math.random() * 0.3,
              band: "mids",
              speedFactor: 1.0 + Math.random() * 0.4,
            });
          }
        }
        // Hi-mid (hat) → smaller, faster, often clustered; upper band biased
        if (hg - prevHighPoly > 0.10 && hg > 0.22) {
          const count = hg > 0.4 ? 3 : 1;
          for (let i = 0; i < count; i++) {
            bassRings.push({
              x: Math.random() * cssW,
              y: Math.random() * cssH * 0.55,
              t0: now + i * 45,
              intensity: 0.45 + Math.random() * 0.3,
              band: "highs",
              speedFactor: 1.25 + Math.random() * 0.5,
            });
          }
        }
        prevBassPoly = bg;
        prevMidPoly = mg;
        prevHighPoly = hg;
      }

      // FEEDBACK — warp + decay persistent buffer, add big audio-driven shapes.
      // Decay 0.94 (matches Lissajous) so trails are visible. Per-band onset
      // events paint distinct shapes so the buffer stays varied.
      if (scenes.has("feedback") && audioMix > 0.01) {
        const decay = 0.94;
        const bg = analysis?.bassGroup ?? 0;
        const hg = analysis?.highsGroup ?? 0;
        const angle = 0.018 + 0.030 * bg;
        const zoom = 1.014 + 0.010 * hg;
        const ccx = cols / 2;
        const ccy = rows / 2;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const dx = (c - ccx) / zoom;
            const dy = (r - ccy) / zoom;
            const sx = ccx + dx * cosA - dy * sinA;
            const sy = ccy + dx * sinA + dy * cosA;
            const sxi = Math.floor(sx);
            const syi = Math.floor(sy);
            persistB[r * cols + c] =
              sxi >= 0 && sxi < cols && syi >= 0 && syi < rows
                ? persistA[syi * cols + sxi] * decay
                : 0;
          }
        }

        // Bass disk at center — bigger so the trail is visible
        const radius = bg * 14;
        if (radius > 1) {
          const r2 = radius * radius;
          const r0 = Math.max(0, Math.floor(ccy - radius));
          const r1 = Math.min(rows, Math.ceil(ccy + radius));
          const c0 = Math.max(0, Math.floor(ccx - radius));
          const c1 = Math.min(cols, Math.ceil(ccx + radius));
          for (let r = r0; r < r1; r++) {
            for (let c = c0; c < c1; c++) {
              const dx = c - ccx;
              const dy = r - ccy;
              const d2 = dx * dx + dy * dy;
              if (d2 < r2) {
                const u = d2 / r2;
                const fall = (1 - u) * (1 - u);
                const idx = r * cols + c;
                if (fall > persistB[idx]) persistB[idx] = fall;
              }
            }
          }
        }

        // Per-band onsets paint distinct, larger shapes (more variability)
        if (onsetThisFrame && analysis) {
          const beat = analysis.beatStrength;

          // Bass onset → bright stroke at random row, full width
          if (analysis.bands.bass > 0.45) {
            const sr = Math.floor(Math.random() * rows);
            for (let c = 0; c < cols; c++) {
              const idx = sr * cols + c;
              if (persistB[idx] < 0.85) persistB[idx] = 0.85;
            }
          }

          // Mid onset → vertical stroke
          if (analysis.midsGroup > 0.4) {
            const sc = Math.floor(Math.random() * cols);
            for (let r = 0; r < rows; r++) {
              const idx = r * cols + sc;
              if (persistB[idx] < 0.7) persistB[idx] = 0.7;
            }
          }

          // Treble/air onset → ring burst at random origin
          if (analysis.airGroup > 0.25 || hg > 0.35) {
            const ox = Math.floor(2 + Math.random() * (cols - 4));
            const oy = Math.floor(2 + Math.random() * (rows - 4));
            const ringR = 6 + beat * 10;
            const r2 = ringR * ringR;
            const rThick = 1.5;
            for (let r = Math.max(0, oy - ringR); r < Math.min(rows, oy + ringR); r++) {
              for (let c = Math.max(0, ox - ringR); c < Math.min(cols, ox + ringR); c++) {
                const dx = c - ox;
                const dy = r - oy;
                const d2 = dx * dx + dy * dy;
                const d = Math.sqrt(d2);
                if (Math.abs(d - ringR) < rThick) {
                  const idx = r * cols + c;
                  if (persistB[idx] < 0.95) persistB[idx] = 0.95;
                }
              }
            }
          }

          // Always splatter a few sparkles too
          const sparkCount = 4 + Math.floor(beat * 12);
          for (let s = 0; s < sparkCount; s++) {
            const sc = Math.floor(Math.random() * cols);
            const sr = Math.floor(Math.random() * rows);
            const idx = sr * cols + sc;
            if (persistB[idx] < 1) persistB[idx] = 1;
          }
        }

        // Swap
        const tmp = persistA;
        persistA = persistB;
        persistB = tmp;
      }

      // LISSAJOUS — decay buffer, paint curve points
      if (scenes.has("lissajous") && audioMix > 0.01) {
        const decay = 0.94;
        // Decay in place
        for (let i = 0; i < persistA.length; i++) persistA[i] *= decay;

        // Curve params from audio. a, b are coprime-ish low integers shifted
        // by spectrum to morph the shape. Phase moves with time.
        const a = 2 + Math.floor((analysis?.bassGroup ?? 0) * 3);
        const b = 3 + Math.floor((analysis?.highsGroup ?? 0) * 3);
        const phase = (now * 0.0008) % (Math.PI * 2);
        const ax = (cssW / 2) * 0.85;
        const ay = (cssH / 2) * 0.85;
        const ccx = cssW / 2;
        const ccy = cssH / 2;
        const SAMPLES = 220;
        for (let s = 0; s < SAMPLES; s++) {
          const t = (s / SAMPLES) * Math.PI * 2;
          const x = ccx + ax * Math.sin(a * t + phase);
          const y = ccy + ay * Math.sin(b * t);
          const c = Math.floor(x / SPACING);
          const r = Math.floor(y / SPACING);
          if (c >= 0 && c < cols && r >= 0 && r < rows) {
            persistA[r * cols + c] = 1;
          }
        }
      }

      // Spawn idle waves
      if (!reducedMotion && now >= nextIdleAt) {
        idleWaves.push({
          t0: now,
          duration: IDLE_DURATION_MIN_MS + Math.random() * (IDLE_DURATION_MAX_MS - IDLE_DURATION_MIN_MS),
          intensity: IDLE_INTENSITY_MIN + Math.random() * (IDLE_INTENSITY_MAX - IDLE_INTENSITY_MIN),
          ox: Math.random() * 1000,
          oy: Math.random() * 1000,
          drift: 0.6 + Math.random() * 0.8,
        });
        scheduleNextIdle(now);
      }

      // Cull expired
      for (let i = idleWaves.length - 1; i >= 0; i--) {
        if (now - idleWaves[i].t0 > idleWaves[i].duration) idleWaves.splice(i, 1);
      }
      for (let i = ripples.length - 1; i >= 0; i--) {
        if (now - ripples[i].t0 > RIPPLE_TOTAL_MS) ripples.splice(i, 1);
      }
      for (let i = bassBlobs.length - 1; i >= 0; i--) {
        if (now - bassBlobs[i].t0 > BASS_BLOB_LIFE_MS) bassBlobs.splice(i, 1);
      }
      for (let i = bassRings.length - 1; i >= 0; i--) {
        if (now - bassRings[i].t0 > BASS_RING_LIFE_MS) bassRings.splice(i, 1);
      }
      for (let i = sparkles.length - 1; i >= 0; i--) {
        if (now - sparkles[i].t0 > SPARKLE_LIFE_MS) sparkles.splice(i, 1);
      }

      ctx.clearRect(0, 0, cssW, cssH);

      const maxAxis = Math.max(cssW, cssH);

      for (let r = 0; r < rows; r++) {
        const py = (r + 0.5) * SPACING;
        for (let c = 0; c < cols; c++) {
          const px = (c + 0.5) * SPACING;

          // Rounded-rect mask: skip dots in the corner regions whose centers
          // fall outside a circle of CORNER_RADIUS around the corner center.
          const dxL = CORNER_RADIUS - px;
          const dxR = px - (cssW - CORNER_RADIUS);
          const dyT = CORNER_RADIUS - py;
          const dyB = py - (cssH - CORNER_RADIUS);
          const cx = dxL > 0 ? dxL : dxR > 0 ? dxR : 0;
          const cy = dyT > 0 ? dyT : dyB > 0 ? dyB : 0;
          if (cx > 0 && cy > 0 && cx * cx + cy * cy > CORNER_RADIUS * CORNER_RADIUS) continue;

          // Multi-layer compositing via intensity-weighted color average.
          // Each layer contributes (color, intensity); final color is the
          // weighted average of all contributing colors, lerped from the off
          // baseline by total intensity. This avoids the "everything washes
          // toward white" failure mode of additive RGB blending.
          let lit = 0;            // for dot-size bloom + final lerp
          let wR = 0, wG = 0, wB = 0;
          let wTotal = 0;

          const addColor = (intensity: number, col: [number, number, number]) => {
            if (intensity <= 0) return;
            lit += intensity;
            wR += col[0] * intensity;
            wG += col[1] * intensity;
            wB += col[2] * intensity;
            wTotal += intensity;
          };

          if (!reducedMotion) {
            const idleWeight = 1 - audioMix;
            const moodIntensity = mood.intensity;

            // Idle Perlin waves — fades out while music plays (theme accent)
            if (idleWeight > 0.01) {
              let idleLit = 0;
              for (let i = 0; i < idleWaves.length; i++) {
                const w = idleWaves[i];
                const age = now - w.t0;
                const t = age / w.duration;
                const env = Math.sin(t * Math.PI);
                if (env <= 0) continue;
                const n = valueNoise2D(
                  px * IDLE_NOISE_SCALE + w.ox,
                  py * IDLE_NOISE_SCALE + w.oy + age * IDLE_NOISE_TIME_RATE * w.drift
                );
                const v = Math.max(0, n - 0.5) * 2;
                idleLit += env * w.intensity * v;
              }
              addColor(idleLit * idleWeight, onColor);
            }

            // Audio visualizer layers — scene-driven. Spectrum scene uses the
            // DialKit per-band config; other scenes implement their own
            // self-contained behavior. Multiple scenes can be active
            // simultaneously; each contributes to the same per-dot color
            // accumulator and they composite via the weighted-average blend.

            // Compute grid cell for buffer-backed scenes
            const cellC = Math.min(cols - 1, Math.max(0, Math.floor(px / SPACING)));
            const cellR = Math.min(rows - 1, Math.max(0, Math.floor(py / SPACING)));
            const cellIdx = cellR * cols + cellC;

            // ── DRUMHEAD scene ────────────────────────────────────────────
            if (masterEnabled && audioMix > 0.01 && scenes.has("drumhead")) {
              const env = waveEnv[cellIdx];
              if (env > 0.012) {
                const m = Math.tanh(env * 1.6);
                // Sign of the underlying wave tints positive vs. negative
                // displacement (compression vs. rarefaction) — bass color
                // for crests, highs for troughs.
                const v = waveA[cellIdx];
                addColor(m * audioMix, v >= 0 ? bassCol : highsCol);
              }
            }

            // ── SPECTROGRAM scene ─────────────────────────────────────────
            if (masterEnabled && audioMix > 0.01 && scenes.has("spectrogram")) {
              // Read the column at horizontal position cellC, time-shifted
              // so the cursor sits at the right edge (recent audio at right).
              const col = (specCursor + cellC) % cols;
              const v = specBuf[cellR * cols + col];
              if (v > 0.02) {
                // Color by frequency band — bass at bottom, air at top
                const tFreq = (rows - 1 - cellR) / Math.max(1, rows - 1); // 0 bottom, 1 top
                let col1: [number, number, number];
                let col2: [number, number, number];
                let mix: number;
                if (tFreq < 0.33) {
                  col1 = bassCol; col2 = midsCol; mix = tFreq / 0.33;
                } else if (tFreq < 0.66) {
                  col1 = midsCol; col2 = highsCol; mix = (tFreq - 0.33) / 0.33;
                } else {
                  col1 = highsCol; col2 = airCol; mix = (tFreq - 0.66) / 0.34;
                }
                const tinted: [number, number, number] = [
                  col1[0] + (col2[0] - col1[0]) * mix,
                  col1[1] + (col2[1] - col1[1]) * mix,
                  col1[2] + (col2[2] - col1[2]) * mix,
                ];
                addColor(Math.pow(v, 1.4) * audioMix, tinted);
              }
            }

            // ── POLYRHYTHM scene ──────────────────────────────────────────
            // Renders rings collected in `bassRings` (filled by the per-frame
            // band-onset detector earlier this frame). Color follows the
            // ring's source band; speed and lifetime vary per ring.
            if (masterEnabled && audioMix > 0.01 && scenes.has("polyrhythm")) {
              for (let i = 0; i < bassRings.length; i++) {
                const ring = bassRings[i];
                const age = now - ring.t0;
                if (age < 0) continue;
                const speedFactor = ring.speedFactor ?? 1;
                const radius = (age * speedFactor / BASS_RING_CROSS_MS) * Math.max(cssW, cssH);
                const dx = px - ring.x;
                const dy = py - ring.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const off = Math.abs(dist - radius);
                if (off < BASS_RING_THICKNESS) {
                  const u = off / BASS_RING_THICKNESS;
                  const ringInt = 0.5 * (1 + Math.cos(Math.PI * u));
                  const tLife = age / BASS_RING_LIFE_MS;
                  const ageEnv = Math.sin(tLife * Math.PI);
                  let col: [number, number, number];
                  if (ring.band === "mids") col = midsCol;
                  else if (ring.band === "highs") col = highsCol;
                  else col = bassCol;
                  addColor(ringInt * ageEnv * ring.intensity * audioMix, col);
                }
              }
            }

            // ── FEEDBACK scene ────────────────────────────────────────────
            if (masterEnabled && audioMix > 0.01 && scenes.has("feedback")) {
              const v = persistA[cellIdx];
              if (v > 0.01) {
                // Tint by audio energy: bass-heavy → bass color, treble → highs
                const e = bassGroup;
                const tintMix = Math.min(1, e * 1.2);
                const tinted: [number, number, number] = [
                  highsCol[0] + (bassCol[0] - highsCol[0]) * tintMix,
                  highsCol[1] + (bassCol[1] - highsCol[1]) * tintMix,
                  highsCol[2] + (bassCol[2] - highsCol[2]) * tintMix,
                ];
                addColor(v * audioMix, tinted);
              }
            }

            // ── LISSAJOUS scene ───────────────────────────────────────────
            if (masterEnabled && audioMix > 0.01 && scenes.has("lissajous")) {
              const v = persistA[cellIdx];
              if (v > 0.01) {
                addColor(v * audioMix, midsCol);
              }
            }

            // ── CHLADNI scene ─────────────────────────────────────────────
            if (masterEnabled && audioMix > 0.01 && scenes.has("chladni")) {
              // Rotate the sample point around the matrix center, then sample
              // the dual-cosine field with drifting phases. The (m, n) modes
              // are smoothly tracked from per-frame state, with onset jumps
              // already applied above.
              const m = chladniM;
              const n = chladniN;
              const cx0 = px - cssW / 2;
              const cy0 = py - cssH / 2;
              const cosR = Math.cos(chladniRotation);
              const sinR = Math.sin(chladniRotation);
              const rx = (cx0 * cosR - cy0 * sinR) + cssW / 2;
              const ry = (cx0 * sinR + cy0 * cosR) + cssH / 2;
              const nx = (rx / cssW) * Math.PI + chladniPhaseX;
              const ny = (ry / cssH) * Math.PI + chladniPhaseY;
              const ch =
                Math.cos(m * nx) * Math.cos(n * ny) -
                Math.cos(n * nx) * Math.cos(m * ny);
              // Brightness peaks at nodal lines (|ch| ≈ 0). Width of the lit
              // band scales with audio energy: louder = thicker nodal lines.
              const energy = (bassGroup + midsGroup + highsGroup) / 3;
              const bandWidth = 0.04 + 0.18 * energy;
              const lineCloseness = Math.max(0, 1 - Math.abs(ch) / bandWidth);
              const chladniLit = lineCloseness * (0.4 + 0.6 * energy) * moodIntensity * audioMix;
              addColor(chladniLit, bassCol);
              // Subtle mids tint between nodal lines (where ch is moderate)
              const offNode = Math.max(0, 1 - Math.abs(ch) / 0.6) - lineCloseness;
              if (offNode > 0) {
                addColor(offNode * 0.25 * midsGroup * audioMix, midsCol);
              }
            }

            if (masterEnabled && audioMix > 0.01 && scenes.has("spectrum")) {
              // Effective per-band colors: track palette unless dial override on
              const effBass = d.bass.override ? parseColor(d.bass.color) : bassCol;
              const effMids = d.mids.override ? parseColor(d.mids.color) : midsCol;
              const effHighs = d.highs.override ? parseColor(d.highs.color) : highsCol;
              const effAir = d.air.override ? parseColor(d.air.color) : airCol;

              // Mids — selectable: structured frequency rings (default) or Perlin
              if (d.mids.type === "rings") {
                // Concentric rings centered on the matrix. Each of the 8 bands
                // owns one ring at a fixed radius; brightness = that band's
                // enveloped energy. Reads as a sonar / "music spectrum" visual.
                const cx = cssW / 2;
                const cy = cssH / 2;
                const dx = px - cx;
                const dy = py - cy;
                const dist = Math.sqrt(dx * dx + dy * dy);
                // Bands: 8 rings spaced from RING_INNER..RING_OUTER
                const bands = analysis?.bandArray;
                if (bands) {
                  const RING_INNER = 12;
                  const RING_OUTER = Math.min(cssW, cssH) * 0.45;
                  const RING_THICKNESS = 4.5;
                  const ringStep = (RING_OUTER - RING_INNER) / Math.max(1, bands.length - 1);
                  for (let bi = 0; bi < bands.length; bi++) {
                    const radius = RING_INNER + bi * ringStep;
                    const off = Math.abs(dist - radius);
                    if (off < RING_THICKNESS) {
                      const u = off / RING_THICKNESS;
                      const ringFall = 0.5 * (1 + Math.cos(Math.PI * u));
                      addColor(
                        ringFall * bands[bi] * d.mids.intensity * moodIntensity * audioMix,
                        effMids
                      );
                    }
                  }
                }
              } else if (d.mids.type === "perlin") {
                const midsLevel =
                  (MIDS_BASE_INTENSITY + MIDS_PEAK_INTENSITY * midsGroup) *
                  moodIntensity * d.mids.intensity;
                const mn = valueNoise2D(
                  px * MIDS_NOISE_SCALE,
                  py * MIDS_NOISE_SCALE + now * MIDS_NOISE_TIME_RATE * speed * d.mids.speed
                );
                const mv = Math.max(0, mn - 0.5) * 2;
                addColor(mv * midsLevel * audioMix, effMids);
              }

              // Highs — fast Perlin overlay (or off)
              if (d.highs.type === "perlin-fast") {
                const highsLevel = highsGroup * 0.5 * moodIntensity * d.highs.intensity;
                if (highsLevel > 0.005) {
                  const hn = valueNoise2D(
                    px * MIDS_NOISE_SCALE * 2.4 + 137,
                    py * MIDS_NOISE_SCALE * 2.4 + now * MIDS_NOISE_TIME_RATE * 3.0 * speed * d.highs.speed
                  );
                  const hv = Math.max(0, hn - 0.55) * 2.2;
                  addColor(hv * highsLevel * audioMix, effHighs);
                }
              }

              // Bass — selected effect type
              const bassIntensityMult = d.bass.intensity;
              const bassRadius = d.bass.radius;
              const bassSoftness = d.bass.softness; // 0=hard, 1=soft

              if (d.bass.type === "blob") {
                // Soft (or hardened) radial bloom from each spawn
                for (let i = 0; i < bassBlobs.length; i++) {
                  const b = bassBlobs[i];
                  const age = now - b.t0;
                  const tBlob = age / BASS_BLOB_LIFE_MS;
                  const env = Math.sin(tBlob * Math.PI);
                  if (env <= 0) continue;
                  const dx = px - b.x;
                  const dy = py - b.y;
                  const dist2 = dx * dx + dy * dy;
                  const r2 = bassRadius * bassRadius;
                  if (dist2 < r2) {
                    const u = dist2 / r2;
                    // Lerp between hard step (softness=0) and quadratic falloff (softness=1)
                    const softFall = (1 - u) * (1 - u);
                    const hardFall = u < 0.85 ? 1 : Math.max(0, 1 - (u - 0.85) / 0.15);
                    const fall = hardFall + (softFall - hardFall) * bassSoftness;
                    addColor(fall * env * b.intensity * bassIntensityMult * audioMix, effBass);
                  }
                }
              } else if (d.bass.type === "disk") {
                // Hard-edged disks — anchored at three centers, continuously
                // sized by current bass amplitude. Maximum reactivity.
                const liveR = bassGroup * BASS_DISK_MAX_RADIUS * bassIntensityMult * moodIntensity;
                if (liveR > 1) {
                  const r2 = liveR * liveR;
                  const centers: [number, number][] = [
                    [cssW * 0.5, cssH * 0.5],
                    [cssW * 0.18, cssH * 0.5],
                    [cssW * 0.82, cssH * 0.5],
                  ];
                  for (const [cx, cy] of centers) {
                    const dx = px - cx;
                    const dy = py - cy;
                    const dist2 = dx * dx + dy * dy;
                    if (dist2 < r2) {
                      const u = Math.sqrt(dist2) / liveR;
                      const rim = 1 - BASS_DISK_RIM_FRAC;
                      const fall = u < rim ? 1 : Math.max(0, 1 - (u - rim) / BASS_DISK_RIM_FRAC);
                      addColor(fall * audioMix, effBass);
                    }
                  }
                }
              } else if (d.bass.type === "ring") {
                // Concentric expanding hollow rings, hard edges
                for (let i = 0; i < bassRings.length; i++) {
                  const r = bassRings[i];
                  const age = now - r.t0;
                  if (age < 0) continue;
                  const radius = (age / BASS_RING_CROSS_MS) * Math.max(cssW, cssH);
                  const dx = px - r.x;
                  const dy = py - r.y;
                  const dist = Math.sqrt(dx * dx + dy * dy);
                  const off = Math.abs(dist - radius);
                  if (off < BASS_RING_THICKNESS) {
                    const u = off / BASS_RING_THICKNESS;
                    const ringIntensity = 0.5 * (1 + Math.cos(Math.PI * u));
                    const tLife = age / BASS_RING_LIFE_MS;
                    const ageEnv = Math.sin(tLife * Math.PI);
                    addColor(
                      ringIntensity * ageEnv * r.intensity * bassIntensityMult * audioMix,
                      effBass
                    );
                  }
                }
              }
              // d.bass.type === "off" → skip

              // Air — sparkles (or off)
              if (d.air.type === "sparkle") {
                for (let i = 0; i < sparkles.length; i++) {
                  const sp = sparkles[i];
                  const age = now - sp.t0;
                  const tSp = age / SPARKLE_LIFE_MS;
                  if (tSp >= 1) continue;
                  const dx = px - sp.x;
                  const dy = py - sp.y;
                  if (dx * dx + dy * dy < SPACING * SPACING * 0.6) {
                    const env = Math.sin(tSp * Math.PI);
                    addColor(env * SPARKLE_INTENSITY * d.air.intensity * audioMix, effAir);
                  }
                }
              }

              // Onset flash — subtle full-grid pulse on each beat
              if (onsetFlashStrength > 0.01) {
                addColor(onsetFlashStrength * d.master.beatFlash * audioMix, effBass);
              }
            }

            // Click ripples — concentric rings, theme accent
            let rippleLit = 0;
            for (let i = 0; i < ripples.length; i++) {
              const rp = ripples[i];
              const age = now - rp.t0;
              if (age < 0) continue;
              const radius = (age / RIPPLE_CROSS_MS) * maxAxis;
              const dx = px - rp.x;
              const dy = py - rp.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const offFront = Math.abs(dist - radius);
              if (offFront < RIPPLE_RING_PX) {
                const u = offFront / RIPPLE_RING_PX;
                const ringIntensity = 0.5 * (1 + Math.cos(Math.PI * u));
                const tLife = age / RIPPLE_TOTAL_MS;
                const ageEnv = Math.sin(tLife * Math.PI);
                rippleLit += ringIntensity * ageEnv * rp.strength;
              }
            }
            addColor(Math.min(rippleLit, 1) * RIPPLE_GLOW_CAP, onColor);

            // Cursor flashlight — theme accent
            if (cursorAlpha > 0.001) {
              const dxC = px - cursorX;
              const dyC = py - cursorY;
              const distC = Math.sqrt(dxC * dxC + dyC * dyC);
              if (distC < HOVER_RADIUS) {
                const u = distC / HOVER_RADIUS;
                const fall = 0.5 * (1 + Math.cos(Math.PI * u));
                addColor(fall * HOVER_INTENSITY * cursorAlpha, onColor);
              }
            }
          }

          // Weighted average of contributing colors, then lerp from off
          // by total intensity. Cleaner than additive: same-color layers
          // reinforce, different-color layers blend proportionally.
          if (lit > 1) lit = 1;
          let litR = offColor[0], litG = offColor[1], litB = offColor[2];
          if (wTotal > 0) {
            litR = wR / wTotal;
            litG = wG / wTotal;
            litB = wB / wTotal;
          }
          const rC = offColor[0] + (litR - offColor[0]) * lit;
          const gC = offColor[1] + (litG - offColor[1]) * lit;
          const bC = offColor[2] + (litB - offColor[2]) * lit;
          // Boot fade applies to alpha
          const alpha = bootP;

          const size = DOT_BASE + (DOT_BLOOM - DOT_BASE) * lit;

          ctx.fillStyle = `rgba(${rC | 0},${gC | 0},${bC | 0},${alpha})`;
          ctx.beginPath();
          ctx.arc(px, py, size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    };

    if (reducedMotion) {
      // Render once, no animation
      draw(t0 + BOOT_FADE_MS);
      return () => {};
    }

    raf = requestAnimationFrame(draw);

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const t = performance.now();
      // Pebble in water: emit a stagger of concentric rings, each weaker than
      // the last, born at evenly spaced offsets from the click time.
      for (let i = 0; i < RIPPLE_RING_COUNT; i++) {
        ripples.push({
          x,
          y,
          t0: t + i * RIPPLE_RING_STAGGER_MS,
          strength: Math.pow(RIPPLE_RING_DECAY, i),
        });
      }
    };
    canvas.addEventListener("click", handleClick);

    const handleMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      cursorX = e.clientX - rect.left;
      cursorY = e.clientY - rect.top;
      cursorTargetAlpha = 1;
    };
    const handleLeave = () => {
      cursorTargetAlpha = 0;
    };
    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("mouseenter", handleMove);
    canvas.addEventListener("mouseleave", handleLeave);

    const handleResize = () => {
      resize();
      reallocSceneBuffers();
    };
    window.addEventListener("resize", handleResize);

    // Track theme/palette changes so colors stay in sync
    const themeObserver = new MutationObserver(() => refreshColors());
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-colored-theme", "style"],
    });

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("click", handleClick);
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("mouseenter", handleMove);
      canvas.removeEventListener("mouseleave", handleLeave);
      window.removeEventListener("resize", handleResize);
      themeObserver.disconnect();
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", width: "100%", height: HEIGHT }}
      aria-hidden="true"
    />
  );
}
