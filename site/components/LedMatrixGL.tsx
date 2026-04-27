"use client";

import { useEffect, useRef } from "react";
import { useDialKit } from "dialkit";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useAudioPlayer } from "@/lib/AudioPlayerContext";
import { useVisualizerScene } from "@/lib/VisualizerSceneContext";
import { AudioAnalyzer, type AnalysisSnapshot } from "@/lib/audio-analysis";
import { type Track } from "@/lib/playlist";

// ── Geometry constants (must match LedMatrix.tsx for visual identity) ────
const SPACING = 5;
const DOT_BASE = 2;
const DOT_BLOOM = 3;
const HEIGHT = 200;
const CORNER_RADIUS = 12;
const BOOT_FADE_MS = 400;

// ── Caps for uniform arrays — beyond these, oldest events are evicted ────
const MAX_SPARKLES = 96;
const MAX_RIPPLES = 16;
const MAX_IDLE_WAVES = 4;
const MAX_WAVEFORM = 256;

// ── Audio mix transition ─────────────────────────────────────────────────
const AUDIO_FADE_RATE = 0.025;

// ── Sparkles ─────────────────────────────────────────────────────────────
const SPARKLES_BASE_RATE = 1.2;
const SPARKLES_BASS_RATE = 14;
const SPARKLES_BURST_BASE = 18;
const SPARKLES_BURST_PER_BEAT = 28;
const SPARKLES_LIFE_MIN_MS = 140;
const SPARKLES_LIFE_MAX_MS = 520;
const SPARKLES_BIG_LIFE_MIN = 320;
const SPARKLES_BIG_LIFE_MAX = 700;

// ── Click ripples ────────────────────────────────────────────────────────
const RIPPLE_TOTAL_MS = 2800;
const RIPPLE_CROSS_MS = 2000;
const RIPPLE_RING_PX = 9;
const RIPPLE_RING_COUNT = 4;
const RIPPLE_RING_STAGGER_MS = 360;
const RIPPLE_RING_DECAY = 0.66;
const RIPPLE_GLOW_CAP = 0.45;

// ── Hover flashlight ─────────────────────────────────────────────────────
const HOVER_RADIUS = 56;
const HOVER_INTENSITY = 0.4;
const HOVER_FADE_RATE = 0.12;

// ── Idle Perlin ──────────────────────────────────────────────────────────
const IDLE_INTERVAL_MIN_MS = 3500;
const IDLE_INTERVAL_MAX_MS = 9000;
const IDLE_DURATION_MIN_MS = 6000;
const IDLE_DURATION_MAX_MS = 12000;
const IDLE_INTENSITY_MIN = 0.18;
const IDLE_INTENSITY_MAX = 0.55;

// ── Helper types ─────────────────────────────────────────────────────────
type Sparkle = {
  x: number;
  y: number;
  t0: number;
  life: number;
  size: number;
  intensity: number;
  /** 0=bass, 1=mids, 2=highs, 3=air */
  colorIdx: number;
};

type Ripple = { x: number; y: number; t0: number; strength: number };

type IdleWave = {
  t0: number;
  duration: number;
  intensity: number;
  ox: number;
  oy: number;
  drift: number;
};

// ── Color parsing (RGB triples 0..255 with HSL-based saturation boost) ───
function parseColor(c: string): [number, number, number] {
  const s = c.trim();
  if (s.startsWith("#")) {
    const hex = s.slice(1);
    const full =
      hex.length === 3 ? hex.split("").map((x) => x + x).join("") : hex;
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

function saturate(rgb: [number, number, number], factor: number): [number, number, number] {
  if (factor === 1) return rgb;
  const [h, s, l] = rgbToHsl(rgb[0], rgb[1], rgb[2]);
  return hslToRgb(h, Math.min(1, s * factor), l);
}

// ── WebGL helpers ────────────────────────────────────────────────────────
function compileShader(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

function linkProgram(gl: WebGL2RenderingContext, vsSrc: string, fsSrc: string): WebGLProgram | null {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vsSrc);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSrc);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  if (!prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(prog));
    gl.deleteProgram(prog);
    return null;
  }
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  return prog;
}

// Fullscreen-triangle vertex shader
const VERTEX_SRC = `#version 300 es
in vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

// Main fragment shader. For each pixel:
//   1. Determine which dot it belongs to (grid cell + center).
//   2. Skip pixels in masked corners or outside any dot.
//   3. Accumulate lit contributions from each active scene + interactivity.
//   4. Compose final color via intensity-weighted average + lerp from off.
const FRAGMENT_SRC = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_bootP;
uniform float u_audioMix;

uniform vec3 u_offColor;
uniform vec3 u_onColor;

// Per-track palette (saturated)
uniform vec3 u_palette[4]; // [bass, mids, highs, air]

uniform float u_spacing;
uniform float u_dotBase;
uniform float u_dotBloom;
uniform float u_cornerRadius;

// Color params
uniform float u_vibrancy;
uniform float u_audioMixCap;

// Scene flags
uniform bool u_sceneSparkles;
uniform bool u_sceneWaveform;
uniform bool u_sceneChladni;

// Hover
uniform vec2 u_hoverPos;
uniform float u_hoverAlpha;

// Click ripples — vec4(x, y, age, strength) per ring
#define MAX_RIPPLES 16
uniform int u_rippleCount;
uniform vec4 u_ripples[MAX_RIPPLES];

// Sparkles — packed into two vec4s per sparkle
#define MAX_SPARKLES 96
uniform int u_sparkleCount;
uniform vec4 u_sparklePos[MAX_SPARKLES];   // x, y, age, life
uniform vec4 u_sparkleAttr[MAX_SPARKLES];  // size, intensity, colorIdx, _

// Idle waves
#define MAX_IDLE 4
uniform int u_idleCount;
uniform vec4 u_idleA[MAX_IDLE]; // ox, oy, drift, intensity
uniform vec4 u_idleB[MAX_IDLE]; // age, duration, _, _

// Waveform
uniform int u_waveformLen;
uniform float u_waveformY[256];

// Chladni (smooth-tracked from JS)
uniform float u_chladniM;
uniform float u_chladniN;
uniform float u_chladniRotation;
uniform vec2 u_chladniPhase;
uniform float u_bassGroup;
uniform float u_midsGroup;
uniform float u_highsGroup;
uniform float u_moodIntensity;

out vec4 outColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

const float PI = 3.14159265359;

void addColor(inout float lit, inout vec3 wColor, inout float wTotal, float intensity, vec3 col) {
  if (intensity <= 0.0) return;
  lit += intensity;
  wColor += col * intensity;
  wTotal += intensity;
}

void main() {
  vec2 uv = vec2(gl_FragCoord.x, u_resolution.y - gl_FragCoord.y);

  // Grid cell + center + dot mask
  vec2 cellIdx = floor(uv / u_spacing);
  vec2 cellCenter = (cellIdx + 0.5) * u_spacing;
  float distToDot = distance(uv, cellCenter);

  // Rounded-rect corner mask in cell space
  float cssW = u_resolution.x;
  float cssH = u_resolution.y;
  float dxL = u_cornerRadius - cellCenter.x;
  float dxR = cellCenter.x - (cssW - u_cornerRadius);
  float dyT = u_cornerRadius - cellCenter.y;
  float dyB = cellCenter.y - (cssH - u_cornerRadius);
  float cx = max(0.0, max(dxL, dxR));
  float cy = max(0.0, max(dyT, dyB));
  if (cx > 0.0 && cy > 0.0 && cx * cx + cy * cy > u_cornerRadius * u_cornerRadius) discard;

  float audioMix = min(u_audioMix, u_audioMixCap);

  float lit = 0.0;
  vec3 wColor = vec3(0.0);
  float wTotal = 0.0;

  // ── Idle Perlin waves ────────────────────────────────────────────────
  float idleWeight = 1.0 - audioMix;
  if (idleWeight > 0.01) {
    float idleLit = 0.0;
    for (int i = 0; i < MAX_IDLE; i++) {
      if (i >= u_idleCount) break;
      vec4 a = u_idleA[i];
      vec4 b = u_idleB[i];
      float age = b.x;
      float duration = b.y;
      float t = age / duration;
      float env = sin(t * PI);
      if (env <= 0.0) continue;
      float n = valueNoise(vec2(
        cellCenter.x * 0.018 + a.x,
        cellCenter.y * 0.018 + a.y + age * 0.00018 * a.z
      ));
      float v = max(0.0, n - 0.5) * 2.0;
      idleLit += env * a.w * v;
    }
    addColor(lit, wColor, wTotal, idleLit * idleWeight, u_onColor);
  }

  // ── SPARKLES scene ───────────────────────────────────────────────────
  if (u_sceneSparkles && audioMix > 0.01) {
    for (int i = 0; i < MAX_SPARKLES; i++) {
      if (i >= u_sparkleCount) break;
      vec4 pos = u_sparklePos[i];
      vec4 attr = u_sparkleAttr[i];
      float age = pos.z;
      float life = pos.w;
      float t = age / life;
      if (t >= 1.0) continue;
      float dx = uv.x - pos.x;
      float dy = uv.y - pos.y;
      float r2 = attr.x * attr.x;
      float d2 = dx * dx + dy * dy;
      if (d2 < r2) {
        float u = d2 / r2;
        float fall = (1.0 - u) * (1.0 - u);
        float env = sin(t * PI);
        int idx = int(attr.z + 0.5);
        vec3 col = u_palette[idx];
        addColor(lit, wColor, wTotal, fall * env * attr.y * audioMix, col);
      }
    }
  }

  // ── WAVEFORM scene ───────────────────────────────────────────────────
  if (u_sceneWaveform && audioMix > 0.01 && u_waveformLen > 0) {
    int col = int(cellIdx.x);
    if (col >= 0 && col < u_waveformLen) {
      float lineY = u_waveformY[col];
      float dy = uv.y - lineY;
      float thickness = 6.0;
      if (abs(dy) < thickness) {
        float u = abs(dy) / thickness;
        float fall = 0.5 * (1.0 + cos(PI * u));
        addColor(lit, wColor, wTotal, fall * audioMix, u_palette[1]);
      }
    }
  }

  // ── CHLADNI scene ────────────────────────────────────────────────────
  if (u_sceneChladni && audioMix > 0.01) {
    float m = u_chladniM;
    float n = u_chladniN;
    vec2 c0 = uv - 0.5 * u_resolution;
    float cosR = cos(u_chladniRotation);
    float sinR = sin(u_chladniRotation);
    vec2 r2 = vec2(c0.x * cosR - c0.y * sinR, c0.x * sinR + c0.y * cosR) + 0.5 * u_resolution;
    float nx = (r2.x / cssW) * PI + u_chladniPhase.x;
    float ny = (r2.y / cssH) * PI + u_chladniPhase.y;
    float ch = cos(m * nx) * cos(n * ny) - cos(n * nx) * cos(m * ny);
    float energy = (u_bassGroup + u_midsGroup + u_highsGroup) / 3.0;
    float bandWidth = 0.04 + 0.18 * energy;
    float lineCloseness = max(0.0, 1.0 - abs(ch) / bandWidth);
    float chladniLit = lineCloseness * (0.4 + 0.6 * energy) * u_moodIntensity * audioMix;
    addColor(lit, wColor, wTotal, chladniLit, u_palette[0]);
    float offNode = max(0.0, 1.0 - abs(ch) / 0.6) - lineCloseness;
    if (offNode > 0.0) {
      addColor(lit, wColor, wTotal, offNode * 0.25 * u_midsGroup * audioMix, u_palette[1]);
    }
  }

  // ── Click ripples ────────────────────────────────────────────────────
  float maxAxis = max(cssW, cssH);
  float rippleLit = 0.0;
  for (int i = 0; i < MAX_RIPPLES; i++) {
    if (i >= u_rippleCount) break;
    vec4 r = u_ripples[i];
    if (r.z < 0.0) continue;
    float radius = (r.z / 2000.0) * maxAxis;
    float dx = uv.x - r.x;
    float dy = uv.y - r.y;
    float dist = sqrt(dx * dx + dy * dy);
    float offFront = abs(dist - radius);
    if (offFront < 9.0) {
      float u = offFront / 9.0;
      float ringInt = 0.5 * (1.0 + cos(PI * u));
      float tLife = r.z / 2800.0;
      float ageEnv = sin(tLife * PI);
      rippleLit += ringInt * ageEnv * r.w;
    }
  }
  addColor(lit, wColor, wTotal, min(rippleLit, 1.0) * 0.45, u_onColor);

  // ── Hover flashlight ─────────────────────────────────────────────────
  if (u_hoverAlpha > 0.001) {
    float distC = distance(uv, u_hoverPos);
    if (distC < 56.0) {
      float u = distC / 56.0;
      float fall = 0.5 * (1.0 + cos(PI * u));
      addColor(lit, wColor, wTotal, fall * 0.4 * u_hoverAlpha, u_onColor);
    }
  }

  // ── Compose ─────────────────────────────────────────────────────────
  if (lit > 1.0) lit = 1.0;
  vec3 litCol = u_offColor;
  if (wTotal > 0.0) litCol = wColor / wTotal;
  float litCurve = pow(lit, u_vibrancy);
  vec3 finalRGB = mix(u_offColor, litCol, litCurve) / 255.0;

  // Dot rendering — emit only pixels inside the dot (radius scales with lit)
  float dotDiameter = u_dotBase + (u_dotBloom - u_dotBase) * lit;
  float dotRadius = dotDiameter * 0.5;
  if (distToDot > dotRadius) discard;

  outColor = vec4(finalRGB, u_bootP);
}`;

// ── Component ────────────────────────────────────────────────────────────
export default function LedMatrixGL() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();

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

  const dial = useDialKit("Visualizer", {
    master: {
      enabled: true,
      audioMixCap: [1.0, 0, 1],
      saturation: [1.5, 1, 3],
      vibrancy: [0.65, 0.3, 1.0],
    },
    sparkles: {
      density: [1.0, 0, 3],
      intensity: [1.0, 0, 2],
      onsetBurst: [1.0, 0, 3],
      bigChance: [0.18, 0, 0.6],
    },
  });
  const dialRef = useRef(dial);
  dialRef.current = dial;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { alpha: true, antialias: false });
    if (!gl) {
      console.warn("[LedMatrixGL] WebGL2 not available");
      return;
    }

    const program = linkProgram(gl, VERTEX_SRC, FRAGMENT_SRC);
    if (!program) return;

    // Fullscreen triangle (covers the viewport)
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "a_pos");

    // Uniform locations
    const u = (name: string) => gl.getUniformLocation(program, name);
    const uResolution = u("u_resolution");
    const uTime = u("u_time");
    const uBootP = u("u_bootP");
    const uAudioMix = u("u_audioMix");
    const uOffColor = u("u_offColor");
    const uOnColor = u("u_onColor");
    const uPalette = u("u_palette");
    const uSpacing = u("u_spacing");
    const uDotBase = u("u_dotBase");
    const uDotBloom = u("u_dotBloom");
    const uCornerRadius = u("u_cornerRadius");
    const uVibrancy = u("u_vibrancy");
    const uAudioMixCap = u("u_audioMixCap");
    const uSceneSparkles = u("u_sceneSparkles");
    const uSceneWaveform = u("u_sceneWaveform");
    const uSceneChladni = u("u_sceneChladni");
    const uHoverPos = u("u_hoverPos");
    const uHoverAlpha = u("u_hoverAlpha");
    const uRippleCount = u("u_rippleCount");
    const uRipples = u("u_ripples");
    const uSparkleCount = u("u_sparkleCount");
    const uSparklePos = u("u_sparklePos");
    const uSparkleAttr = u("u_sparkleAttr");
    const uIdleCount = u("u_idleCount");
    const uIdleA = u("u_idleA");
    const uIdleB = u("u_idleB");
    const uWaveformLen = u("u_waveformLen");
    const uWaveformY = u("u_waveformY");
    const uChladniM = u("u_chladniM");
    const uChladniN = u("u_chladniN");
    const uChladniRotation = u("u_chladniRotation");
    const uChladniPhase = u("u_chladniPhase");
    const uBassGroup = u("u_bassGroup");
    const uMidsGroup = u("u_midsGroup");
    const uHighsGroup = u("u_highsGroup");
    const uMoodIntensity = u("u_moodIntensity");

    // Sizing
    let dpr = window.devicePixelRatio || 1;
    let cssW = 0;
    let cssH = HEIGHT;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      cssW = rect.width;
      cssH = HEIGHT;
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();

    // Per-frame state
    let offColor: [number, number, number] = [230, 230, 230];
    let onColor: [number, number, number] = [181, 101, 29];
    let bassCol: [number, number, number] = [180, 100, 30];
    let midsCol: [number, number, number] = [232, 155, 90];
    let highsCol: [number, number, number] = [242, 210, 155];
    let airCol: [number, number, number] = [255, 241, 214];
    let lastPaletteSrc = "";
    let lastSaturation = -1;

    const refreshThemeColors = () => {
      const styles = getComputedStyle(document.documentElement);
      const offRaw = styles.getPropertyValue("--color-border").trim();
      const onRaw = styles.getPropertyValue("--color-accent").trim();
      if (offRaw) offColor = parseColor(offRaw);
      if (onRaw) onColor = parseColor(onRaw);
    };
    refreshThemeColors();

    // Audio + interaction state
    let audioMix = 0;
    let prevSparklesBass = 0;
    const sparkles: Sparkle[] = [];
    const ripples: Ripple[] = [];
    const idleWaves: IdleWave[] = [];
    let nextIdleAt = 0;
    let cursorX = 0;
    let cursorY = 0;
    let cursorTargetAlpha = 0;
    let cursorAlpha = 0;
    const analyzer = new AudioAnalyzer();
    let analysis: AnalysisSnapshot | null = null;

    // Chladni state
    let chladniM = 3, chladniN = 4;
    let chladniMTarget = 3, chladniNTarget = 4;
    let chladniRotation = 0;
    let chladniPhaseX = 0, chladniPhaseY = 0;

    const t0 = performance.now();
    const scheduleNextIdle = (now: number) => {
      nextIdleAt = now + IDLE_INTERVAL_MIN_MS + Math.random() * (IDLE_INTERVAL_MAX_MS - IDLE_INTERVAL_MIN_MS);
    };
    scheduleNextIdle(t0);

    // Pre-allocated typed arrays for uniforms (avoid per-frame allocation)
    const sparklePosArr = new Float32Array(MAX_SPARKLES * 4);
    const sparkleAttrArr = new Float32Array(MAX_SPARKLES * 4);
    const rippleArr = new Float32Array(MAX_RIPPLES * 4);
    const idleAArr = new Float32Array(MAX_IDLE_WAVES * 4);
    const idleBArr = new Float32Array(MAX_IDLE_WAVES * 4);
    const waveformArr = new Float32Array(MAX_WAVEFORM);
    const paletteArr = new Float32Array(4 * 3);

    let raf = 0;

    const draw = (now: number) => {
      const aState = audioStateRef.current;
      const d = dialRef.current;

      // Theme colors might shift live (palette changes)
      refreshThemeColors();

      // Track palette refresh + saturation
      const track = aState.track;
      const sat = d.master.saturation;
      const trackChanged = track.src !== lastPaletteSrc;
      if (trackChanged || sat !== lastSaturation) {
        bassCol = saturate(parseColor(track.palette.bass), sat);
        midsCol = saturate(parseColor(track.palette.mids), sat);
        highsCol = saturate(parseColor(track.palette.highs), sat);
        airCol = saturate(parseColor(track.palette.air), sat);
        lastPaletteSrc = track.src;
        lastSaturation = sat;
        if (trackChanged) analyzer.reset();
      }

      // Audio mix
      const targetMix = aState.isPlaying ? 1 : 0;
      audioMix += (targetMix - audioMix) * AUDIO_FADE_RATE;
      if (Math.abs(targetMix - audioMix) < 0.001) audioMix = targetMix;

      // Audio analysis snapshot
      analysis = null;
      if (audioMix > 0.01 && aState.getFrequencyData) {
        const data = aState.getFrequencyData();
        const sr = aState.getSampleRate();
        if (data && sr) analysis = analyzer.process(data, sr, now);
      }

      const bassGroup = analysis?.bassGroup ?? 0;
      const midsGroup = analysis?.midsGroup ?? 0;
      const highsGroup = analysis?.highsGroup ?? 0;
      const onsetThisFrame = analysis?.onsetThisFrame ?? false;

      // Cursor smoothing
      cursorAlpha += (cursorTargetAlpha - cursorAlpha) * HOVER_FADE_RATE;

      // Boot fade
      const bootP = Math.min(1, (now - t0) / BOOT_FADE_MS);

      const scenes = aState.scenes;

      // ── Idle waves spawn + cull ────────────────────────────────────
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
      for (let i = idleWaves.length - 1; i >= 0; i--) {
        if (now - idleWaves[i].t0 > idleWaves[i].duration) idleWaves.splice(i, 1);
      }
      // Cap at MAX_IDLE_WAVES (keep newest)
      while (idleWaves.length > MAX_IDLE_WAVES) idleWaves.shift();

      // ── Ripples cull ───────────────────────────────────────────────
      for (let i = ripples.length - 1; i >= 0; i--) {
        if (now - ripples[i].t0 > RIPPLE_TOTAL_MS) ripples.splice(i, 1);
      }

      // ── SPARKLES — bass-reactive spawn + cull ──────────────────────
      if (
        scenes.has("sparkles") &&
        d.master.enabled &&
        audioMix > 0.01 &&
        !reducedMotion
      ) {
        const sCfg = d.sparkles;
        const beat = analysis?.beatStrength ?? 0;
        const bandsArr = analysis?.bandArray;
        const continuous = Math.floor(
          (SPARKLES_BASE_RATE + SPARKLES_BASS_RATE * bassGroup * bassGroup) *
            sCfg.density *
            audioMix
        );
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
            ? SPARKLES_BIG_LIFE_MIN + Math.random() * (SPARKLES_BIG_LIFE_MAX - SPARKLES_BIG_LIFE_MIN)
            : SPARKLES_LIFE_MIN_MS + Math.random() * (SPARKLES_LIFE_MAX_MS - SPARKLES_LIFE_MIN_MS);
          const size = isBig ? 2.0 + Math.random() * 2.5 : 0.5 + Math.random() * 1.0;
          const intensity = (0.6 + Math.random() * 0.7) * sCfg.intensity * (isBig ? 1.2 : 1);
          const wB = (bandsArr ? (bandsArr[0] + bandsArr[1]) : 0.5) * 2.2 + 0.4;
          const wM = bandsArr ? (bandsArr[2] + bandsArr[3]) : 0.3;
          const wH = bandsArr ? (bandsArr[4] + bandsArr[5] + bandsArr[6]) : 0.2;
          const wA = bandsArr ? bandsArr[7] : 0.1;
          const total = wB + wM + wH + wA;
          let r = Math.random() * total;
          let colorIdx = 0;
          if ((r -= wB) < 0) colorIdx = 0;
          else if ((r -= wM) < 0) colorIdx = 1;
          else if ((r -= wH) < 0) colorIdx = 2;
          else colorIdx = 3;
          sparkles.push({
            x: Math.random() * cssW,
            y: Math.random() * cssH,
            t0: now,
            life,
            size,
            intensity,
            colorIdx,
          });
        }
      }
      // Cull and cap
      for (let i = sparkles.length - 1; i >= 0; i--) {
        if (now - sparkles[i].t0 > sparkles[i].life) sparkles.splice(i, 1);
      }
      while (sparkles.length > MAX_SPARKLES) sparkles.shift();

      // ── Chladni state update ───────────────────────────────────────
      if (scenes.has("chladni") && audioMix > 0.01) {
        const tDrift = now * 0.00038;
        const mSinusoid = Math.sin(tDrift * 0.7) * 1.6;
        const nSinusoid = Math.cos(tDrift * 0.5) * 1.6;
        const mAudio = (analysis?.bands.bass ?? 0) * 2.2 + (analysis?.bands.lowMid ?? 0) * 1.6;
        const nAudio = (analysis?.bands.highMid ?? 0) * 2.2 + (analysis?.bands.air ?? 0) * 1.8;
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
          chladniMTarget = Math.random() < 0.5 ? pick[0] : pick[1];
          chladniNTarget = chladniMTarget === pick[0] ? pick[1] : pick[0];
        } else {
          chladniMTarget = 2.5 + mSinusoid + mAudio;
          chladniNTarget = 3.5 + nSinusoid + nAudio;
        }
        chladniM += (chladniMTarget - chladniM) * 0.045;
        chladniN += (chladniNTarget - chladniN) * 0.045;
        chladniRotation += 0.0025 + 0.005 * bassGroup;
        chladniPhaseX += 0.0035 + 0.006 * midsGroup;
        chladniPhaseY += 0.0028 + 0.005 * highsGroup;
      }

      // ── Waveform — pre-compute y per column ────────────────────────
      const waveformLen = Math.min(MAX_WAVEFORM, Math.floor(cssW / SPACING));
      if (scenes.has("waveform") && audioMix > 0.01) {
        const td = aState.getTimeDomainData?.();
        if (td) {
          const half = cssH / 2;
          const amp = half * 0.85;
          for (let c = 0; c < waveformLen; c++) {
            const sampleIdx = Math.floor((c / waveformLen) * td.length);
            const sample = td[Math.min(sampleIdx, td.length - 1)];
            const a = (sample - 128) / 128;
            waveformArr[c] = half + a * amp;
          }
        }
      }

      // ── Pack uniform arrays (positions baked with dpr in pixel space) ──
      // Sparkles
      for (let i = 0; i < sparkles.length; i++) {
        const sp = sparkles[i];
        const age = now - sp.t0;
        sparklePosArr[i * 4 + 0] = sp.x * dpr;
        sparklePosArr[i * 4 + 1] = sp.y * dpr;
        sparklePosArr[i * 4 + 2] = age;
        sparklePosArr[i * 4 + 3] = sp.life;
        sparkleAttrArr[i * 4 + 0] = sp.size * dpr;
        sparkleAttrArr[i * 4 + 1] = sp.intensity;
        sparkleAttrArr[i * 4 + 2] = sp.colorIdx;
        sparkleAttrArr[i * 4 + 3] = 0;
      }

      // Ripples
      for (let i = 0; i < ripples.length && i < MAX_RIPPLES; i++) {
        const rp = ripples[i];
        const age = now - rp.t0;
        rippleArr[i * 4 + 0] = rp.x * dpr;
        rippleArr[i * 4 + 1] = rp.y * dpr;
        rippleArr[i * 4 + 2] = age;
        rippleArr[i * 4 + 3] = rp.strength;
      }
      const visibleRipples = Math.min(ripples.length, MAX_RIPPLES);

      // Idle waves
      for (let i = 0; i < idleWaves.length && i < MAX_IDLE_WAVES; i++) {
        const w = idleWaves[i];
        idleAArr[i * 4 + 0] = w.ox;
        idleAArr[i * 4 + 1] = w.oy;
        idleAArr[i * 4 + 2] = w.drift;
        idleAArr[i * 4 + 3] = w.intensity;
        idleBArr[i * 4 + 0] = now - w.t0;
        idleBArr[i * 4 + 1] = w.duration;
        idleBArr[i * 4 + 2] = 0;
        idleBArr[i * 4 + 3] = 0;
      }

      // Palette (saturated track colors)
      paletteArr[0] = bassCol[0]; paletteArr[1] = bassCol[1]; paletteArr[2] = bassCol[2];
      paletteArr[3] = midsCol[0]; paletteArr[4] = midsCol[1]; paletteArr[5] = midsCol[2];
      paletteArr[6] = highsCol[0]; paletteArr[7] = highsCol[1]; paletteArr[8] = highsCol[2];
      paletteArr[9] = airCol[0]; paletteArr[10] = airCol[1]; paletteArr[11] = airCol[2];

      // ── Render ─────────────────────────────────────────────────────
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);

      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      // Set uniforms
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, now);
      gl.uniform1f(uBootP, bootP);
      gl.uniform1f(uAudioMix, audioMix);
      gl.uniform3f(uOffColor, offColor[0], offColor[1], offColor[2]);
      gl.uniform3f(uOnColor, onColor[0], onColor[1], onColor[2]);
      gl.uniform3fv(uPalette, paletteArr);
      gl.uniform1f(uSpacing, SPACING * dpr);
      gl.uniform1f(uDotBase, DOT_BASE * dpr);
      gl.uniform1f(uDotBloom, DOT_BLOOM * dpr);
      gl.uniform1f(uCornerRadius, CORNER_RADIUS * dpr);
      gl.uniform1f(uVibrancy, d.master.vibrancy);
      gl.uniform1f(uAudioMixCap, d.master.audioMixCap);

      gl.uniform1i(uSceneSparkles, scenes.has("sparkles") && d.master.enabled ? 1 : 0);
      gl.uniform1i(uSceneWaveform, scenes.has("waveform") && d.master.enabled ? 1 : 0);
      gl.uniform1i(uSceneChladni, scenes.has("chladni") && d.master.enabled ? 1 : 0);

      gl.uniform2f(uHoverPos, cursorX * dpr, cursorY * dpr);
      gl.uniform1f(uHoverAlpha, cursorAlpha);

      gl.uniform1i(uRippleCount, visibleRipples);
      gl.uniform4fv(uRipples, rippleArr);

      gl.uniform1i(uSparkleCount, sparkles.length);
      gl.uniform4fv(uSparklePos, sparklePosArr);
      gl.uniform4fv(uSparkleAttr, sparkleAttrArr);

      gl.uniform1i(uIdleCount, idleWaves.length);
      gl.uniform4fv(uIdleA, idleAArr);
      gl.uniform4fv(uIdleB, idleBArr);

      gl.uniform1i(uWaveformLen, scenes.has("waveform") && audioMix > 0.01 ? waveformLen : 0);
      gl.uniform1fv(uWaveformY, waveformArr);

      gl.uniform1f(uChladniM, chladniM);
      gl.uniform1f(uChladniN, chladniN);
      gl.uniform1f(uChladniRotation, chladniRotation);
      gl.uniform2f(uChladniPhase, chladniPhaseX, chladniPhaseY);
      gl.uniform1f(uBassGroup, bassGroup);
      gl.uniform1f(uMidsGroup, midsGroup);
      gl.uniform1f(uHighsGroup, highsGroup);
      gl.uniform1f(uMoodIntensity, 1.0); // TODO mood lookup

      // Enable alpha blending so transparent dots show page bg through
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      gl.drawArrays(gl.TRIANGLES, 0, 3);

      raf = requestAnimationFrame(draw);
    };

    if (reducedMotion) {
      draw(t0 + BOOT_FADE_MS);
      return () => {};
    }

    raf = requestAnimationFrame(draw);

    // Click → spawn pebble ripple stack
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const t = performance.now();
      for (let i = 0; i < RIPPLE_RING_COUNT; i++) {
        ripples.push({
          x,
          y,
          t0: t + i * RIPPLE_RING_STAGGER_MS,
          strength: Math.pow(RIPPLE_RING_DECAY, i),
        });
      }
      while (ripples.length > MAX_RIPPLES) ripples.shift();
    };
    canvas.addEventListener("click", handleClick);

    const handleMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      cursorX = e.clientX - rect.left;
      cursorY = e.clientY - rect.top;
      cursorTargetAlpha = 1;
    };
    const handleLeave = () => { cursorTargetAlpha = 0; };
    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("mouseenter", handleMove);
    canvas.addEventListener("mouseleave", handleLeave);

    const handleResize = () => resize();
    window.addEventListener("resize", handleResize);

    const themeObserver = new MutationObserver(() => refreshThemeColors());
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
      gl.deleteProgram(program);
      gl.deleteBuffer(vbo);
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
