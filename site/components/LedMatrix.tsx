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

// Audio visualizer — global mix transition rate
const AUDIO_FADE_RATE = 0.025;       // exponential approach for visualizer mix transition (~600ms half-life)

// Sparkles scene — bass-reactive variable-size dots scattered across the matrix
const SPARKLES_BASE_RATE = 1.2;       // sparkles per frame at zero bass (some baseline twinkle)
const SPARKLES_BASS_RATE = 14;        // sparkles per frame scaled by bass^2 (lots of spawns on heavy bass)
const SPARKLES_BURST_BASE = 18;       // burst count on a strong bass onset
const SPARKLES_BURST_PER_BEAT = 28;   // additional burst per beatStrength
const SPARKLES_LIFE_MIN_MS = 140;
const SPARKLES_LIFE_MAX_MS = 520;
const SPARKLES_BIG_CHANCE = 0.18;     // fraction of spawns that are "big"
const SPARKLES_BIG_LIFE_MIN = 320;
const SPARKLES_BIG_LIFE_MAX = 700;
const SPARKLES_INTENSITY_MIN = 0.6;
const SPARKLES_INTENSITY_MAX = 1.3;

type Sparkle = {
  x: number;
  y: number;
  t0: number;
  life: number;
  /** radius in px — small for pinpoints, larger for bursts */
  size: number;
  intensity: number;
  /** pre-tinted color so it doesn't shift mid-life */
  col: [number, number, number];
};

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

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) return [l * 255, l * 255, l * 255];
  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    hue2rgb(p, q, h + 1 / 3) * 255,
    hue2rgb(p, q, h) * 255,
    hue2rgb(p, q, h - 1 / 3) * 255,
  ];
}

/** Boost saturation of an RGB triple by `factor` (1 = unchanged, >1 = more saturated). */
function saturate(rgb: [number, number, number], factor: number): [number, number, number] {
  if (factor === 1) return rgb;
  const [h, s, l] = rgbToHsl(rgb[0], rgb[1], rgb[2]);
  return hslToRgb(h, Math.min(1, s * factor), l);
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
    getTimeDomainData: audio.getTimeDomainData,
    getSampleRate: audio.getSampleRate,
    scenes: activeScenes,
  });
  audioStateRef.current = {
    isPlaying: audio.isPlaying,
    track: audio.currentTrack as Track,
    getFrequencyData: audio.getFrequencyData,
    getTimeDomainData: audio.getTimeDomainData,
    getSampleRate: audio.getSampleRate,
    scenes: activeScenes,
  };

  // DialKit panel — live tuning of master + sparkles parameters.
  // Panel UI only renders in dev (DialRoot is dev-mounted); in prod these
  // values stay at defaults and behave like static config.
  const dial = useDialKit("Visualizer", {
    master: {
      enabled: true,
      audioMixCap: [1.0, 0, 1],
      // Saturation multiplier applied to per-track palette colors. >1 boosts.
      saturation: [1.5, 1, 3],
      // Gamma curve on the final lit value before color blending. Lower
      // values push moderate intensities closer to full palette color
      // (more vibrant); 1.0 = linear.
      vibrancy: [0.65, 0.3, 1.0],
    },
    sparkles: {
      // Continuous spawn rate baseline + bass-driven multiplier
      density: [1.0, 0, 3],
      // Per-spawn brightness multiplier
      intensity: [1.0, 0, 2],
      // Onset burst multiplier — bigger = bigger explosion on each kick
      onsetBurst: [1.0, 0, 3],
      // Fraction of sparkles that spawn as "big" (longer life, larger size)
      bigChance: [0.18, 0, 0.6],
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
    // feedback / lissajous: shared persistent brightness buffer
    let persistA: Float32Array = new Float32Array(0);
    let persistB: Float32Array = new Float32Array(0);
    // chladni: smoothly drifting modes + rotation + phase shifts so the
    // pattern is always moving even when audio is steady; onsets snap to a
    // new random (m, n) for shape variety
    let chladniM = 3, chladniN = 4;
    let chladniMTarget = 3, chladniNTarget = 4;
    let chladniRotation = 0;
    let chladniPhaseX = 0, chladniPhaseY = 0;
    // sparkles: previous bass amplitude for onset detection
    let prevSparklesBass = 0;

    const reallocSceneBuffers = () => {
      const total = cols * rows;
      waveA = new Float32Array(total);
      waveB = new Float32Array(total);
      waveEnv = new Float32Array(total);
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
    const sparkles: Sparkle[] = [];
    const analyzer = new AudioAnalyzer();
    let analysis: AnalysisSnapshot | null = null;
    // Per-track palette colors (parsed lazily, refreshed when track or
    // saturation dial changes — saturation is applied at parse time so the
    // per-pixel render path stays cheap).
    let bassCol: [number, number, number] = [180, 100, 30];
    let midsCol: [number, number, number] = [232, 155, 90];
    let highsCol: [number, number, number] = [242, 210, 155];
    let airCol: [number, number, number] = [255, 241, 214];
    let lastPaletteSrc = "";
    let lastSaturation = -1;

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

      // Refresh palette colors when the track or saturation dial changes
      const satFactor = dialRef.current.master.saturation;
      const trackChanged = track.src !== lastPaletteSrc;
      if (trackChanged || satFactor !== lastSaturation) {
        bassCol = saturate(parseColor(track.palette.bass), satFactor);
        midsCol = saturate(parseColor(track.palette.mids), satFactor);
        highsCol = saturate(parseColor(track.palette.highs), satFactor);
        airCol = saturate(parseColor(track.palette.air), satFactor);
        lastPaletteSrc = track.src;
        lastSaturation = satFactor;
        if (trackChanged) analyzer.reset();
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

      // ── Per-frame scene state updates (before the per-dot loop) ──────────
      const scenes = aState.scenes;

      // SPARKLES — bass-reactive variable sparkle field. Continuous spawn
      // rate scales quadratically with bass; on a strong bass onset, fire
      // a burst. A fraction of spawns are "big" (longer life, larger
      // radius) so the field reads as varied jewel-dust rather than
      // uniform pinpoints. Each sparkle is pre-tinted at spawn time so
      // it doesn't shift mid-life.
      if (
        scenes.has("sparkles") &&
        masterEnabled &&
        audioMix > 0.01 &&
        !reducedMotion
      ) {
        const sCfg = d.sparkles;
        const beat = analysis?.beatStrength ?? 0;
        const bandsArr = analysis?.bandArray;
        // Continuous spawns: baseline + bass^2 contribution
        const continuous = Math.floor(
          (SPARKLES_BASE_RATE + SPARKLES_BASS_RATE * bassGroup * bassGroup) *
            sCfg.density *
            audioMix
        );
        // Onset burst when bass spikes
        let burstCount = 0;
        if (
          onsetThisFrame &&
          analysis &&
          bassGroup > 0.32 &&
          bassGroup - prevSparklesBass > 0.1
        ) {
          burstCount = Math.floor(
            (SPARKLES_BURST_BASE + SPARKLES_BURST_PER_BEAT * beat) * sCfg.onsetBurst
          );
        }
        prevSparklesBass = bassGroup;

        const spawn = continuous + burstCount;
        for (let i = 0; i < spawn; i++) {
          const isBig = Math.random() < sCfg.bigChance;
          const life = isBig
            ? SPARKLES_BIG_LIFE_MIN +
              Math.random() * (SPARKLES_BIG_LIFE_MAX - SPARKLES_BIG_LIFE_MIN)
            : SPARKLES_LIFE_MIN_MS +
              Math.random() * (SPARKLES_LIFE_MAX_MS - SPARKLES_LIFE_MIN_MS);
          const size = isBig ? 2.0 + Math.random() * 2.5 : 0.5 + Math.random() * 1.0;
          const intensity =
            (SPARKLES_INTENSITY_MIN +
              Math.random() * (SPARKLES_INTENSITY_MAX - SPARKLES_INTENSITY_MIN)) *
            sCfg.intensity *
            (isBig ? 1.2 : 1);
          // Pick a palette color — weighted by current band content with
          // a strong bass bias so the field is mostly bass-colored.
          const wB = (bandsArr ? (bandsArr[0] + bandsArr[1]) : 0.5) * 2.2 + 0.4;
          const wM = bandsArr ? (bandsArr[2] + bandsArr[3]) : 0.3;
          const wH = bandsArr ? (bandsArr[4] + bandsArr[5] + bandsArr[6]) : 0.2;
          const wA = bandsArr ? bandsArr[7] : 0.1;
          const total = wB + wM + wH + wA;
          let r = Math.random() * total;
          let col: [number, number, number];
          if ((r -= wB) < 0) col = bassCol;
          else if ((r -= wM) < 0) col = midsCol;
          else if ((r -= wH) < 0) col = highsCol;
          else col = airCol;
          sparkles.push({
            x: Math.random() * cssW,
            y: Math.random() * cssH,
            t0: now,
            life,
            size,
            intensity,
            col,
          });
        }
      }

      // WAVEFORM — sample audio's time-domain data once per frame and cache
      // the y-position for each column. The per-dot loop just reads from it.
      let waveformY: Float32Array | null = null;
      if (scenes.has("waveform") && audioMix > 0.01) {
        const td = aState.getTimeDomainData?.();
        if (td) {
          waveformY = new Float32Array(cols);
          const half = cssH / 2;
          const amp = half * 0.85; // a bit of margin so peaks don't clip
          for (let c = 0; c < cols; c++) {
            const sampleIdx = Math.floor((c / cols) * td.length);
            const sample = td[Math.min(sampleIdx, td.length - 1)];
            const a = (sample - 128) / 128; // -1..1
            waveformY[c] = half + a * amp;
          }
        }
      }

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
      for (let i = sparkles.length - 1; i >= 0; i--) {
        if (now - sparkles[i].t0 > sparkles[i].life) sparkles.splice(i, 1);
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

            // ── SPARKLES scene ────────────────────────────────────────────
            // Renders the variable-size, pre-tinted sparkles spawned in the
            // per-frame block above. Each has its own life, size, intensity,
            // and color so the field reads as varied jewel-dust.
            if (masterEnabled && audioMix > 0.01 && scenes.has("sparkles")) {
              for (let i = 0; i < sparkles.length; i++) {
                const sp = sparkles[i];
                const age = now - sp.t0;
                const t = age / sp.life;
                if (t >= 1) continue;
                const dx = px - sp.x;
                const dy = py - sp.y;
                const r2 = sp.size * sp.size;
                const d2 = dx * dx + dy * dy;
                if (d2 < r2) {
                  const u = d2 / r2;
                  const fall = (1 - u) * (1 - u); // soft quadratic falloff
                  const env = Math.sin(t * Math.PI); // bloom + fade bell
                  addColor(fall * env * sp.intensity * audioMix, sp.col);
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

            // ── WAVEFORM scene ────────────────────────────────────────────
            // Oscilloscope: each column samples the audio signal; dots near
            // the resulting line glow. The simplest possible visualizer —
            // it's literally the shape of the sound.
            if (masterEnabled && audioMix > 0.01 && scenes.has("waveform") && waveformY) {
              const lineY = waveformY[cellC];
              const dy = py - lineY;
              const thickness = 6;
              if (Math.abs(dy) < thickness) {
                const u = Math.abs(dy) / thickness;
                const fall = 0.5 * (1 + Math.cos(Math.PI * u));
                addColor(fall * audioMix, midsCol);
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
          // by total intensity. Vibrancy gamma curve pushes moderate lit
          // values closer to full palette color so colors don't get diluted
          // by the grey baseline at low/medium intensity.
          if (lit > 1) lit = 1;
          let litR = offColor[0], litG = offColor[1], litB = offColor[2];
          if (wTotal > 0) {
            litR = wR / wTotal;
            litG = wG / wTotal;
            litB = wB / wTotal;
          }
          const litCurve = Math.pow(lit, dialRef.current.master.vibrancy);
          const rC = offColor[0] + (litR - offColor[0]) * litCurve;
          const gC = offColor[1] + (litG - offColor[1]) * litCurve;
          const bC = offColor[2] + (litB - offColor[2]) * litCurve;
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
