/**
 * Real-time audio analyzer — converts AnalyserNode FFT output into 8 frequency
 * band energies + spectral-flux onset detection + BPM estimation.
 *
 * Stateful: keep one instance per audio source and call `process(...)` once per
 * frame. Returns a snapshot of the current analysis state.
 */

// Frequency band edges in Hz. Roughly aligned with how producers think about
// the spectrum (kick / bass / vocal body / vocal presence / sibilance / air).
export const BAND_EDGES_HZ: [number, number][] = [
  [20, 60],      // 0 subBass — kick fundamental
  [60, 250],     // 1 bass    — bass guitar / kick punch
  [250, 500],    // 2 lowMid  — vocal body, snare body
  [500, 2000],   // 3 mid     — most instruments
  [2000, 4000],  // 4 highMid — vocal presence, snare crack
  [4000, 6000],  // 5 presence
  [6000, 10000], // 6 treble  — hi-hat body, sibilance
  [10000, 16000],// 7 air     — cymbal shimmer
];

export type Bands = {
  subBass: number; bass: number;
  lowMid: number; mid: number;
  highMid: number; presence: number;
  treble: number; air: number;
};

export type AnalysisSnapshot = {
  bands: Bands;
  /** Same data as `bands` ordered low→high for ring/spectrum rendering. */
  bandArray: number[];
  /** Grouped palette-band energies (0..1). */
  bassGroup: number;   // subBass + bass
  midsGroup: number;   // lowMid + mid
  highsGroup: number;  // highMid + presence + treble
  airGroup: number;    // air
  /** True the frame an onset is detected (edge-triggered). */
  onsetThisFrame: boolean;
  /** Smoothed onset strength 0..1, decays between onsets. */
  beatStrength: number;
  /** Estimated BPM, smoothed. Falls back to 120 until enough onsets seen. */
  bpm: number;
};

const ONSET_FLUX_HISTORY = 43;          // ~700ms at 60fps — local mean window
const ONSET_THRESHOLD_FACTOR = 1.55;    // flux must exceed this × local mean
const ONSET_MIN_GAP_MS = 90;            // ignore onsets faster than ~660 BPM
const BEAT_DECAY = 0.06;                // decay of beat strength per frame
const BPM_HISTORY = 24;                 // intervals tracked
const BPM_MIN = 60;
const BPM_MAX = 200;

// Per-band attack/release envelope. Attack ≈ instant; release decays slowly.
// Tuned so a kick drum's bass band snaps up in 1 frame and decays over ~250ms.
const ENV_ATTACK = 0.85;       // fraction of distance to peak per frame
const ENV_RELEASE = 0.06;      // fraction of distance to floor per frame
// Power curve — expands dynamic range. Quiet bands get squashed, loud bands
// stay loud. > 1 = more dynamic; 1 = linear.
const BAND_POWER = 1.6;

export class AudioAnalyzer {
  private prevSpec: Float32Array | null = null;
  private fluxHistory: Float32Array = new Float32Array(ONSET_FLUX_HISTORY);
  private fluxCursor = 0;
  private fluxFilled = 0;
  private lastOnsetTs = 0;
  private onsetIntervals: number[] = [];
  private bpm = 120;
  private beatStrength = 0;
  private cachedBins: number[][] | null = null;
  private cachedFor: { sampleRate: number; binCount: number } | null = null;

  // Per-band envelopes — one slot per BAND_EDGES_HZ entry (8)
  private envs: Float32Array = new Float32Array(BAND_EDGES_HZ.length);

  /** Maps each band group's bin index range using the current sampleRate + binCount. */
  private buildBinRanges(sampleRate: number, binCount: number) {
    if (
      this.cachedFor &&
      this.cachedFor.sampleRate === sampleRate &&
      this.cachedFor.binCount === binCount &&
      this.cachedBins
    ) {
      return this.cachedBins;
    }
    const nyquist = sampleRate / 2;
    const ranges: number[][] = BAND_EDGES_HZ.map(([lo, hi]) => {
      const loIdx = Math.max(0, Math.floor((lo / nyquist) * binCount));
      const hiIdx = Math.min(binCount, Math.ceil((hi / nyquist) * binCount));
      return [loIdx, Math.max(loIdx + 1, hiIdx)];
    });
    this.cachedBins = ranges;
    this.cachedFor = { sampleRate, binCount };
    return ranges;
  }

  process(
    freq: Uint8Array,
    sampleRate: number,
    nowMs: number
  ): AnalysisSnapshot {
    const binCount = freq.length;
    const ranges = this.buildBinRanges(sampleRate, binCount);

    // 1. Bands — mean amplitude per range, normalized 0..1, then through
    //    per-band attack/release envelope, then a power curve.
    const bandValues: number[] = [];
    for (let b = 0; b < ranges.length; b++) {
      const [lo, hi] = ranges[b];
      let sum = 0;
      for (let i = lo; i < hi; i++) sum += freq[i];
      const raw = (sum / Math.max(1, hi - lo)) / 255;

      // Envelope: snap up on attack, decay on release
      const env = this.envs[b];
      const next = raw > env
        ? env + (raw - env) * ENV_ATTACK
        : env + (raw - env) * ENV_RELEASE;
      this.envs[b] = next;

      // Power curve expands dynamic range
      bandValues.push(Math.pow(next, BAND_POWER));
    }
    const bands: Bands = {
      subBass: bandValues[0], bass: bandValues[1],
      lowMid: bandValues[2], mid: bandValues[3],
      highMid: bandValues[4], presence: bandValues[5],
      treble: bandValues[6], air: bandValues[7],
    };

    // 2. Spectral flux — sum of positive bin-to-bin differences
    let flux = 0;
    if (this.prevSpec && this.prevSpec.length === binCount) {
      for (let i = 0; i < binCount; i++) {
        const d = freq[i] / 255 - this.prevSpec[i];
        if (d > 0) flux += d;
      }
    }
    if (!this.prevSpec || this.prevSpec.length !== binCount) {
      this.prevSpec = new Float32Array(binCount);
    }
    for (let i = 0; i < binCount; i++) this.prevSpec[i] = freq[i] / 255;

    // 3. Onset detection — local-mean threshold over a short window
    this.fluxHistory[this.fluxCursor] = flux;
    this.fluxCursor = (this.fluxCursor + 1) % ONSET_FLUX_HISTORY;
    if (this.fluxFilled < ONSET_FLUX_HISTORY) this.fluxFilled++;

    let mean = 0;
    for (let i = 0; i < this.fluxFilled; i++) mean += this.fluxHistory[i];
    mean /= Math.max(1, this.fluxFilled);

    let onsetThisFrame = false;
    if (
      flux > mean * ONSET_THRESHOLD_FACTOR &&
      flux > 0.04 &&                               // hard floor — ignore silence
      nowMs - this.lastOnsetTs > ONSET_MIN_GAP_MS
    ) {
      onsetThisFrame = true;
      this.lastOnsetTs = nowMs;
      this.beatStrength = Math.min(1, flux);
      // Track inter-onset intervals for BPM estimation
      if (this.onsetIntervals.length === 0) {
        // First onset — nothing to compare yet
      } else {
        // already added below
      }
    }

    if (onsetThisFrame) {
      // Append interval since the previous onset (if any)
      // We need to track previous onset timestamp separately.
      // Simpler: track onset timestamps in a small ring and derive intervals.
    }

    // (Re)compute BPM using a minimal ring of the last N onset timestamps.
    // We maintain a separate ring of timestamps below.
    this.appendOnsetForBpm(onsetThisFrame ? nowMs : null);

    // Decay beat strength
    this.beatStrength = Math.max(0, this.beatStrength - BEAT_DECAY);

    // Per-band array for frequency-ring rendering (8 values, ordered low→high).
    const bandArray: number[] = [
      bands.subBass, bands.bass,
      bands.lowMid, bands.mid,
      bands.highMid, bands.presence,
      bands.treble, bands.air,
    ];

    return {
      bands,
      bandArray,
      bassGroup: clamp01((bands.subBass + bands.bass) / 2),
      midsGroup: clamp01((bands.lowMid + bands.mid) / 2),
      highsGroup: clamp01((bands.highMid + bands.presence + bands.treble) / 3),
      airGroup: clamp01(bands.air),
      onsetThisFrame,
      beatStrength: this.beatStrength,
      bpm: this.bpm,
    };
  }

  // ── BPM estimation ─────────────────────────────────────────────────────
  private onsetTsRing: number[] = new Array(BPM_HISTORY).fill(0);
  private onsetTsCount = 0;
  private onsetTsCursor = 0;

  private appendOnsetForBpm(ts: number | null) {
    if (ts === null) return;
    this.onsetTsRing[this.onsetTsCursor] = ts;
    this.onsetTsCursor = (this.onsetTsCursor + 1) % BPM_HISTORY;
    if (this.onsetTsCount < BPM_HISTORY) this.onsetTsCount++;

    if (this.onsetTsCount < 4) return; // need a few onsets first

    // Collect intervals between consecutive onsets (in chronological order)
    const ordered: number[] = [];
    const start =
      this.onsetTsCount < BPM_HISTORY ? 0 : this.onsetTsCursor;
    for (let i = 0; i < this.onsetTsCount; i++) {
      const idx = (start + i) % BPM_HISTORY;
      ordered.push(this.onsetTsRing[idx]);
    }
    const intervals: number[] = [];
    for (let i = 1; i < ordered.length; i++) {
      const d = ordered[i] - ordered[i - 1];
      if (d > 0) intervals.push(d);
    }
    if (intervals.length === 0) return;

    intervals.sort((a, b) => a - b);
    const median = intervals[Math.floor(intervals.length / 2)];
    if (!isFinite(median) || median <= 0) return;

    let bpm = 60000 / median;
    while (bpm < BPM_MIN) bpm *= 2;   // octave-fold up
    while (bpm > BPM_MAX) bpm /= 2;   // octave-fold down
    // Smooth toward target
    this.bpm += (bpm - this.bpm) * 0.18;
  }

  reset() {
    this.prevSpec = null;
    this.fluxHistory.fill(0);
    this.fluxCursor = 0;
    this.fluxFilled = 0;
    this.lastOnsetTs = 0;
    this.onsetTsRing.fill(0);
    this.onsetTsCount = 0;
    this.onsetTsCursor = 0;
    this.bpm = 120;
    this.beatStrength = 0;
    this.envs.fill(0);
  }
}

function clamp01(x: number) {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}
