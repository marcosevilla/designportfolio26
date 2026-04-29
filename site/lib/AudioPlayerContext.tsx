"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PLAYLIST, type Track } from "./playlist";

type PlayerSession = "idle" | "active";

interface AudioPlayerState {
  // Track + transport
  currentIndex: number;
  currentTrack: Track;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  // UI
  session: PlayerSession;
  miniPlayerOpen: boolean;
  // Actions
  play: () => Promise<void>;
  pause: () => void;
  togglePlay: () => Promise<void>;
  next: () => void;
  prev: () => void;
  seek: (sec: number) => void;
  selectTrack: (idx: number) => void;
  closeSession: () => void;
  toggleMiniPlayer: () => void;
  // Visualizer
  getFrequencyData: (() => Uint8Array | null) | null;
  /** Time-domain (waveform) samples — one byte per sample, 128 = silence. */
  getTimeDomainData: (() => Uint8Array | null) | null;
  /** AudioContext sample rate (e.g., 44100, 48000). Null until first play. */
  getSampleRate: () => number | null;
}

const Ctx = createContext<AudioPlayerState | null>(null);

const PREV_THRESHOLD_MS = 3000; // Spotify-style: restart, then prev within 3s

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [session, setSession] = useState<PlayerSession>("idle");
  const [miniPlayerOpen, setMiniPlayerOpen] = useState(false);
  const toggleMiniPlayer = useCallback(() => setMiniPlayerOpen((o) => !o), []);

  // Web Audio bits (lazily initialized on first play, then reused)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const freqDataRef = useRef<Uint8Array | null>(null);
  const timeDataRef = useRef<Uint8Array | null>(null);

  // Spotify-style rewind tracking
  const prevPressedAtRef = useRef<number>(0);

  const currentTrack = PLAYLIST[currentIndex];

  // Create the <audio> element once on the client. We attach it to body so
  // it survives the React tree and ref-based control works regardless of
  // where it's mounted in the layout.
  useEffect(() => {
    const el = document.createElement("audio");
    el.preload = "metadata";
    el.crossOrigin = "anonymous";
    audioRef.current = el;

    const onTime = () => setCurrentTime(el.currentTime);
    const onLoadedMeta = () => setDuration(isFinite(el.duration) ? el.duration : 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      // Auto-advance + loop
      setCurrentIndex((i) => (i + 1) % PLAYLIST.length);
    };

    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onLoadedMeta);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);

    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onLoadedMeta);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
      el.pause();
      el.src = "";
    };
  }, []);

  // When the current track changes, swap the source. Lazy: only the current
  // track's audio loads.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const wasPlaying = !el.paused;
    el.src = currentTrack.src;
    el.currentTime = 0;
    setCurrentTime(0);
    if (wasPlaying) {
      el.play().catch(() => {
        /* probably autoplay block — silently keep paused */
      });
    }
  }, [currentTrack.src]);

  // Auto-advance kicks in via the "ended" handler updating currentIndex; the
  // src effect above will then re-attach the new track. If we were playing
  // before the previous track ended, keep playing the next one.
  useEffect(() => {
    if (session === "active" && audioRef.current && audioRef.current.paused) {
      // After auto-advance, attempt to continue playing
      audioRef.current.play().catch(() => {
        /* ignore */
      });
    }
  }, [currentIndex, session]);

  // Lazily create AudioContext + analyser on first play.
  const ensureAudioGraph = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (audioCtxRef.current) return;
    try {
      const Ctor: typeof AudioContext =
        (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
      const ctx = new Ctor();
      const src = ctx.createMediaElementSource(el);
      const an = ctx.createAnalyser();
      an.fftSize = 1024;
      // Lower smoothing = more responsive frame-to-frame (peaks survive
      // instead of being averaged away). Custom per-band envelopes in the
      // analyzer further shape attack/release.
      an.smoothingTimeConstant = 0.35;
      src.connect(an);
      an.connect(ctx.destination);
      audioCtxRef.current = ctx;
      sourceRef.current = src;
      analyserRef.current = an;
      freqDataRef.current = new Uint8Array(new ArrayBuffer(an.frequencyBinCount));
      timeDataRef.current = new Uint8Array(new ArrayBuffer(an.fftSize));
    } catch (err) {
      // Some browsers (Safari iOS) block MediaElementSource when the audio
      // is cross-origin; fall through silently — playback still works without
      // visualizer data.
      console.warn("[AudioPlayer] Could not create audio graph:", err);
    }
  }, []);

  const play = useCallback(async () => {
    const el = audioRef.current;
    if (!el) return;
    ensureAudioGraph();
    if (audioCtxRef.current?.state === "suspended") {
      try {
        await audioCtxRef.current.resume();
      } catch {
        /* ignore */
      }
    }
    try {
      await el.play();
      setSession("active");
    } catch (err) {
      // Autoplay block or missing audio file — keep silent
      console.warn("[AudioPlayer] play() rejected:", err);
    }
  }, [ensureAudioGraph]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const togglePlay = useCallback(async () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) await play();
    else pause();
  }, [pause, play]);

  const next = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % PLAYLIST.length);
  }, []);

  const prev = useCallback(() => {
    const el = audioRef.current;
    const now = performance.now();
    const recentlyPressed = now - prevPressedAtRef.current < PREV_THRESHOLD_MS;
    prevPressedAtRef.current = now;
    if (el && el.currentTime > 3 && !recentlyPressed) {
      el.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    setCurrentIndex((i) => (i - 1 + PLAYLIST.length) % PLAYLIST.length);
  }, []);

  const seek = useCallback((sec: number) => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = Math.max(0, Math.min(sec, el.duration || sec));
    setCurrentTime(el.currentTime);
  }, []);

  const selectTrack = useCallback((idx: number) => {
    if (idx < 0 || idx >= PLAYLIST.length) return;
    setCurrentIndex(idx);
  }, []);

  const closeSession = useCallback(() => {
    audioRef.current?.pause();
    setSession("idle");
  }, []);

  const getFrequencyData = useCallback(() => {
    const an = analyserRef.current;
    const buf = freqDataRef.current;
    if (!an || !buf) return null;
    an.getByteFrequencyData(buf as Uint8Array<ArrayBuffer>);
    return buf;
  }, []);

  const getTimeDomainData = useCallback(() => {
    const an = analyserRef.current;
    const buf = timeDataRef.current;
    if (!an || !buf) return null;
    an.getByteTimeDomainData(buf as Uint8Array<ArrayBuffer>);
    return buf;
  }, []);

  const getSampleRate = useCallback(() => {
    return audioCtxRef.current?.sampleRate ?? null;
  }, []);

  const value = useMemo<AudioPlayerState>(
    () => ({
      currentIndex,
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      session,
      miniPlayerOpen,
      play,
      pause,
      togglePlay,
      next,
      prev,
      seek,
      selectTrack,
      closeSession,
      toggleMiniPlayer,
      getFrequencyData,
      getTimeDomainData,
      getSampleRate,
    }),
    [
      currentIndex,
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      session,
      miniPlayerOpen,
      play,
      pause,
      togglePlay,
      next,
      prev,
      seek,
      selectTrack,
      closeSession,
      toggleMiniPlayer,
      getFrequencyData,
      getTimeDomainData,
      getSampleRate,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAudioPlayer() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAudioPlayer must be used inside <AudioPlayerProvider>");
  return ctx;
}
