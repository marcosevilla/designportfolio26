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

export type DrumHit = {
  /** True the frame this drum's onset is detected. */
  onset: boolean;
  /** Smoothed onset strength for this drum (0..1, decays between hits). */
  strength: number;
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
  /** True the frame an onset is detected (edge-triggered, full-spectrum). */
  onsetThisFrame: boolean;
  /** Smoothed onset strength 0..1, decays between onsets. */
  beatStrength: number;
  /** Estimated BPM, smoothed. Falls back to 120 until enough onsets seen. */
  bpm: number;
  /** Per-instrument hits via band-limited spectral flux. Approximate but
   *  effective: kick lives in subBass+bass, snare in lowMid+mid, hat in
   *  treble+air. Not stem-separation accurate but distinguishes drums. */
  drums: {
    kick: DrumHit;
    snare: DrumHit;
    hat: DrumHit;
  };
  /** Phase within a single beat (0..1), advanced by detected BPM. Wraps each beat. */
  beatPhase: number;
  /** Phase within a 4/4 bar (0..1). Wraps every 4 beats. */
  barPhase: number;
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

  // Per-drum onset state — band-limited spectral flux + adaptive threshold
  private kickFluxHistory = new Float32Array(ONSET_FLUX_HISTORY);
  private snareFluxHistory = new Float32Array(ONSET_FLUX_HISTORY);
  private hatFluxHistory = new Float32Array(ONSET_FLUX_HISTORY);
  private kickFluxCursor = 0;
  private snareFluxCursor = 0;
  private hatFluxCursor = 0;
  private kickFluxFilled = 0;
  private snareFluxFilled = 0;
  private hatFluxFilled = 0;
  private kickLastTs = 0;
  private snareLastTs = 0;
  private hatLastTs = 0;
  private kickStrength = 0;
  private snareStrength = 0;
  private hatStrength = 0;

  // Beat phase tracking — accumulates beats based on detected BPM
  private beatAccum = 0;
  private lastFrameTs = -1;

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

    // 2. Spectral flux — sum of positive bin-to-bin differences. Compute
    //    full-spectrum flux + per-drum band-limited fluxes in the same pass
    //    so prevSpec only gets read once before the update.
    let flux = 0;
    let drumKickFlux = 0;
    let drumSnareFlux = 0;
    let drumHatFlux = 0;
    if (this.prevSpec && this.prevSpec.length === binCount) {
      // Kick = ranges[0]..ranges[1] (subBass + bass)
      // Snare = ranges[2]..ranges[3] (lowMid + mid)
      // Hat   = ranges[6]..ranges[7] (treble + air)
      const kickLo = ranges[0][0], kickHi = ranges[1][1];
      const snareLo = ranges[2][0], snareHi = ranges[3][1];
      const hatLo = ranges[6][0], hatHi = ranges[7][1];
      for (let i = 0; i < binCount; i++) {
        const d = freq[i] / 255 - this.prevSpec[i];
        if (d > 0) {
          flux += d;
          if (i >= kickLo && i < kickHi) drumKickFlux += d;
          if (i >= snareLo && i < snareHi) drumSnareFlux += d;
          if (i >= hatLo && i < hatHi) drumHatFlux += d;
        }
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

    // ── Per-drum onset detection (band-limited fluxes already computed) ─
    const detectDrum = (
      flux: number,
      history: Float32Array,
      cursorRef: { val: number; filled: number; lastTs: number; strength: number },
      hardFloor: number,
      thresholdFactor: number
    ): { onset: boolean; strength: number } => {
      history[cursorRef.val] = flux;
      cursorRef.val = (cursorRef.val + 1) % ONSET_FLUX_HISTORY;
      if (cursorRef.filled < ONSET_FLUX_HISTORY) cursorRef.filled++;
      let m = 0;
      for (let i = 0; i < cursorRef.filled; i++) m += history[i];
      m /= Math.max(1, cursorRef.filled);
      let onset = false;
      if (
        flux > m * thresholdFactor &&
        flux > hardFloor &&
        nowMs - cursorRef.lastTs > ONSET_MIN_GAP_MS
      ) {
        onset = true;
        cursorRef.lastTs = nowMs;
        cursorRef.strength = Math.min(1, flux * 4); // band flux is small, scale up
      }
      cursorRef.strength = Math.max(0, cursorRef.strength - BEAT_DECAY);
      return { onset, strength: cursorRef.strength };
    };

    const kickRef = {
      val: this.kickFluxCursor,
      filled: this.kickFluxFilled,
      lastTs: this.kickLastTs,
      strength: this.kickStrength,
    };
    const snareRef = {
      val: this.snareFluxCursor,
      filled: this.snareFluxFilled,
      lastTs: this.snareLastTs,
      strength: this.snareStrength,
    };
    const hatRef = {
      val: this.hatFluxCursor,
      filled: this.hatFluxFilled,
      lastTs: this.hatLastTs,
      strength: this.hatStrength,
    };
    // Different hard floors per drum — band-limited fluxes have different scales
    const kickHit = detectDrum(drumKickFlux, this.kickFluxHistory, kickRef, 0.012, 1.6);
    const snareHit = detectDrum(drumSnareFlux, this.snareFluxHistory, snareRef, 0.015, 1.55);
    const hatHit = detectDrum(drumHatFlux, this.hatFluxHistory, hatRef, 0.014, 1.5);
    // Persist mutations
    this.kickFluxCursor = kickRef.val;
    this.kickFluxFilled = kickRef.filled;
    this.kickLastTs = kickRef.lastTs;
    this.kickStrength = kickRef.strength;
    this.snareFluxCursor = snareRef.val;
    this.snareFluxFilled = snareRef.filled;
    this.snareLastTs = snareRef.lastTs;
    this.snareStrength = snareRef.strength;
    this.hatFluxCursor = hatRef.val;
    this.hatFluxFilled = hatRef.filled;
    this.hatLastTs = hatRef.lastTs;
    this.hatStrength = hatRef.strength;

    // ── Beat phase ──────────────────────────────────────────────────────
    if (this.lastFrameTs < 0) this.lastFrameTs = nowMs;
    const dt = nowMs - this.lastFrameTs;
    this.lastFrameTs = nowMs;
    this.beatAccum += (dt * this.bpm) / 60000;
    // Soft-resync to a kick onset: nudge phase toward nearest integer
    if (kickHit.onset) {
      const fractional = this.beatAccum - Math.floor(this.beatAccum);
      if (fractional > 0.5) this.beatAccum += (1 - fractional) * 0.4;
      else this.beatAccum -= fractional * 0.4;
    }
    const beatPhase = ((this.beatAccum % 1) + 1) % 1;
    const barPhase = (((this.beatAccum / 4) % 1) + 1) % 1;

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
      drums: { kick: kickHit, snare: snareHit, hat: hatHit },
      beatPhase,
      barPhase,
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
    this.kickFluxHistory.fill(0); this.kickFluxCursor = 0; this.kickFluxFilled = 0;
    this.snareFluxHistory.fill(0); this.snareFluxCursor = 0; this.snareFluxFilled = 0;
    this.hatFluxHistory.fill(0); this.hatFluxCursor = 0; this.hatFluxFilled = 0;
    this.kickLastTs = 0; this.snareLastTs = 0; this.hatLastTs = 0;
    this.kickStrength = 0; this.snareStrength = 0; this.hatStrength = 0;
    this.beatAccum = 0;
    this.lastFrameTs = -1;
  }
}

function clamp01(x: number) {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}
