"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useAudioPlayer } from "@/lib/AudioPlayerContext";
import { useVisualizerScene } from "@/lib/VisualizerSceneContext";
import { AudioAnalyzer, type AnalysisSnapshot } from "@/lib/audio-analysis";
import { type Track } from "@/lib/playlist";

// ── Geometry constants (must match LedMatrix.tsx for visual identity) ────
const SPACING = 5;
const DOT_BASE = 2;
const DOT_BLOOM = 3;
const DEFAULT_HEIGHT = 200;
const CORNER_RADIUS = 12;
const BOOT_FADE_MS = 400;

// ── Intro wipe ──────────────────────────────────────────────────────────
// Diagonal reveal from bottom-left → top-right. Dots pop in at a larger
// diameter along the wave front, then settle smoothly to base size.
const INTRO_WIPE_MS = 1700;
const INTRO_WAVE_WIDTH_PX = 130; // size-bump tail length in CSS pixels
const INTRO_REVEAL_FADE_PX = 32; // soft alpha fade at the leading edge (CSS px)
const INTRO_BUMP_PX = 4.5; // max extra dot diameter at the wave front (CSS px)

// ── Caps for uniform arrays — beyond these, oldest events are evicted ────
const MAX_SPARKLES = 96;
const MAX_RIPPLES = 16;
const MAX_IDLE_WAVES = 4;
const MAX_WAVEFORM = 256;
// Lissajous packs curve sample positions into a uniform vec2 array
const MAX_LISSAJOUS_SAMPLES = 220;

// ── Audio mix transition ─────────────────────────────────────────────────
const AUDIO_FADE_RATE = 0.025;

// ── Sparkles ─────────────────────────────────────────────────────────────
const SPARKLES_BASE_RATE = 1.2;
const SPARKLES_BASS_RATE = 14;
const SPARKLES_BURST_BASE = 18;
const SPARKLES_BURST_PER_BEAT = 28;
const SPARKLES_LIFE_MIN_MS = 180;
const SPARKLES_LIFE_MAX_MS = 600;
const SPARKLES_BIG_LIFE_MIN = 380;
const SPARKLES_BIG_LIFE_MAX = 820;

// ── Click ripples ────────────────────────────────────────────────────────
const RIPPLE_TOTAL_MS = 2800;
const RIPPLE_CROSS_MS = 2000;
const RIPPLE_RING_PX = 9;
const RIPPLE_RING_COUNT = 4;
const RIPPLE_RING_STAGGER_MS = 360;
const RIPPLE_RING_DECAY = 0.66;
const RIPPLE_GLOW_CAP = 0.45;

// ── Idle Perlin ──────────────────────────────────────────────────────────
const IDLE_INTERVAL_MIN_MS = 3500;
const IDLE_INTERVAL_MAX_MS = 9000;
const IDLE_DURATION_MIN_MS = 6000;
const IDLE_DURATION_MAX_MS = 12000;
const IDLE_INTENSITY_MIN = 0.26;
const IDLE_INTENSITY_MAX = 0.7;

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

// ── Per-theme palette tonemap ─────────────────────────────────────────
// The track palettes are luminance-stacked (bass dark → air light) which
// reads great on dark page backgrounds but vanishes on white / pastel
// themes — light "air" greens, yellows, blushes have only a few percent
// luminance delta against a near-white bg. We enforce a minimum L distance
// from bg with a soft cap that preserves intra-palette ordering, and
// nudge saturation up to compensate when colors get pulled toward mid-L.
const MIN_L_DIST = 0.35; // minimum HSL lightness distance from page bg
const SOFT_CAP_OVERSHOOT = 0.12; // how far the soft cap extends beyond the hard threshold
function softCapHi(l: number, cap: number): number {
  if (l <= cap) return l;
  // Compress (cap, 1] into (cap - overshoot, cap], preserving order.
  const range = Math.max(0.001, 1 - cap);
  const excess = (l - cap) / range; // 0..1
  return cap - SOFT_CAP_OVERSHOOT * (1 - Math.exp(-2.2 * excess));
}
function softCapLo(l: number, cap: number): number {
  if (l >= cap) return l;
  const range = Math.max(0.001, cap);
  const deficit = (cap - l) / range; // 0..1
  return cap + SOFT_CAP_OVERSHOOT * (1 - Math.exp(-2.2 * deficit));
}
function tonemapForBg(rgb: [number, number, number], bgLum: number): [number, number, number] {
  const [h, s, l] = rgbToHsl(rgb[0], rgb[1], rgb[2]);
  const isLightBg = bgLum > 0.55;
  const newL = isLightBg
    ? softCapHi(l, Math.max(0.15, bgLum - MIN_L_DIST))
    : softCapLo(l, Math.min(0.85, bgLum + MIN_L_DIST));
  // Saturation boost scales with how far we had to move the color.
  const moved = Math.abs(newL - l);
  const newS = Math.min(1, s * (1 + moved * 0.7));
  return hslToRgb(h, newS, Math.max(0, Math.min(1, newL)));
}

// Stricter tonemap for the waveform stroke specifically — thin one-pixel
// lines need much more contrast than the blob scenes to feel readable.
const WAVEFORM_MIN_L_DIST = 0.55;
function tonemapForWaveform(rgb: [number, number, number], bgLum: number): [number, number, number] {
  const [h, s, l] = rgbToHsl(rgb[0], rgb[1], rgb[2]);
  const isLightBg = bgLum > 0.55;
  const newL = isLightBg
    ? softCapHi(l, Math.max(0.08, bgLum - WAVEFORM_MIN_L_DIST))
    : softCapLo(l, Math.min(0.92, bgLum + WAVEFORM_MIN_L_DIST));
  const moved = Math.abs(newL - l);
  const newS = Math.min(1, s * (1 + moved * 0.9));
  return hslToRgb(h, newS, Math.max(0, Math.min(1, newL)));
}

// Pick the palette color with the largest luminance distance from bg —
// that's the natural high-contrast pick (typically `bass` on light themes,
// `air` on dark themes).
function pickHighestContrast(
  colors: [number, number, number][],
  bgLum: number
): [number, number, number] {
  let bestIdx = 0;
  let bestDelta = -1;
  for (let i = 0; i < colors.length; i++) {
    const cl = rgbToHsl(colors[i][0], colors[i][1], colors[i][2])[2];
    const delta = Math.abs(cl - bgLum);
    if (delta > bestDelta) {
      bestDelta = delta;
      bestIdx = i;
    }
  }
  return colors[bestIdx];
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

// ── Feedback simulation shader ────────────────────────────────────────────
// Persistent brightness in R channel. Warps the previous frame (rotation +
// zoom + decay) and adds bass-disk + sparkle injection. Per-band onset
// strokes are encoded in the JS-packed uniform arrays.
const FEEDBACK_FRAG_SRC = `#version 300 es
precision highp float;
uniform sampler2D u_input;
uniform vec2 u_gridSize;
uniform float u_decay;
uniform float u_angle;
uniform float u_zoom;
uniform float u_bassRadius;   // in cells
uniform vec4 u_strokeBass;    // amp, _, _, _ (full row at random y? encoded in u_strokeBassY)
uniform float u_strokeBassY;  // -1 if no stroke this frame
uniform float u_strokeMidsX;  // -1 if no stroke
uniform float u_strokeRingX;  // -1 if no ring
uniform float u_strokeRingY;
uniform float u_strokeRingR;
out vec4 outColor;
void main() {
  vec2 pix = gl_FragCoord.xy;
  vec2 cell = floor(pix);
  vec2 cc = u_gridSize * 0.5;
  vec2 d = (cell - cc) / u_zoom;
  float cosA = cos(u_angle);
  float sinA = sin(u_angle);
  vec2 src = cc + vec2(d.x * cosA - d.y * sinA, d.x * sinA + d.y * cosA);
  vec2 srcUV = (src + 0.5) / u_gridSize;

  float v = 0.0;
  if (srcUV.x >= 0.0 && srcUV.x <= 1.0 && srcUV.y >= 0.0 && srcUV.y <= 1.0) {
    v = texture(u_input, srcUV).r * u_decay;
  }

  // Bass-driven center disk
  if (u_bassRadius > 0.5) {
    float dist = distance(cell, cc);
    if (dist < u_bassRadius) {
      float u = dist / u_bassRadius;
      float fall = (1.0 - u) * (1.0 - u);
      v = max(v, fall);
    }
  }

  // Per-band onset strokes (full-row / full-column / ring at origin)
  if (u_strokeBassY >= 0.0 && abs(cell.y - u_strokeBassY) < 0.6) {
    if (v < 0.85) v = 0.85;
  }
  if (u_strokeMidsX >= 0.0 && abs(cell.x - u_strokeMidsX) < 0.6) {
    if (v < 0.7) v = 0.7;
  }
  if (u_strokeRingX >= 0.0 && u_strokeRingR > 0.0) {
    float dx = cell.x - u_strokeRingX;
    float dy = cell.y - u_strokeRingY;
    float d2 = dx * dx + dy * dy;
    float dist = sqrt(d2);
    if (abs(dist - u_strokeRingR) < 1.5) {
      if (v < 0.95) v = 0.95;
    }
  }

  outColor = vec4(v, 0.0, 0.0, 1.0);
}`;

// ── Lissajous simulation shader ───────────────────────────────────────────
// Single texture decays each frame; curve sample points (passed as a uniform
// vec2 array of grid-cell positions) inject brightness 1.
const LISSAJOUS_FRAG_SRC = `#version 300 es
precision highp float;
uniform sampler2D u_input;
uniform vec2 u_gridSize;
uniform float u_decay;
uniform int u_sampleCount;
uniform vec2 u_samples[${MAX_LISSAJOUS_SAMPLES}];
out vec4 outColor;
void main() {
  vec2 pix = gl_FragCoord.xy;
  vec2 cell = floor(pix);
  vec2 puv = (cell + 0.5) / u_gridSize;
  float v = texture(u_input, puv).r * u_decay;

  for (int i = 0; i < ${MAX_LISSAJOUS_SAMPLES}; i++) {
    if (i >= u_sampleCount) break;
    vec2 s = u_samples[i];
    if (abs(cell.x - s.x) < 0.5 && abs(cell.y - s.y) < 0.5) {
      v = 1.0;
      break;
    }
  }
  outColor = vec4(v, 0.0, 0.0, 1.0);
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

// Intro wipe (diagonal bottom-left → top-right). All values in device pixels.
uniform float u_introFrontPx;     // current wave-front position along the BL→TR axis
uniform float u_introWaveWidth;   // length of the trailing size-bump tail
uniform float u_introRevealFade;  // soft alpha fade-in distance at the leading edge
uniform float u_introBumpPx;      // max extra dot diameter at the wave front (device px)

uniform vec3 u_offColor;
uniform vec3 u_onColor;

// Per-track palette (saturated)
uniform vec3 u_palette[4]; // [bass, mids, highs, air]
// Dedicated waveform stroke color — chosen for max contrast vs page bg.
// Thin lines need more luminance delta than blob scenes get from the
// general palette tonemap, so this gets a stricter contrast pass in JS.
uniform vec3 u_waveformColor;

uniform float u_spacing;
uniform float u_dotBase;
uniform float u_dotBloom;
uniform float u_cornerRadius;

// Color params
uniform float u_vibrancy;
uniform float u_audioMixCap;

// Beat grid (passed every frame for scenes that want bar-aware effects)
uniform float u_beatPhase;
uniform float u_barPhase;

// Scene flags
uniform bool u_sceneSparkles;
uniform bool u_sceneWaveform;
uniform bool u_sceneChladni;
uniform bool u_sceneFeedback;
uniform bool u_sceneLissajous;
uniform int u_lissajousColorIdx;  // 0..3, indexes u_palette — cycles per bar

// Buffer-backed scene samplers (cols x rows simulation textures)
uniform sampler2D u_feedbackTex;
uniform sampler2D u_lissajousTex;
uniform vec2 u_gridSize; // (cols, rows)

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

  // ── Intro wipe ─────────────────────────────────────────────────────────
  // Project this fragment onto the bottom-left → top-right diagonal axis,
  // with proj = 0 at bottom-left and proj = diagLen at top-right.
  vec2 introDir = normalize(vec2(cssW, -cssH));
  float introProj = uv.x * introDir.x + (uv.y - cssH) * introDir.y;
  float introDist = u_introFrontPx - introProj;
  if (introDist < -u_introRevealFade) discard;

  // Soft alpha fade-in at the leading edge (smoothstep for natural roll-on).
  float revealA = clamp(1.0 + introDist / u_introRevealFade, 0.0, 1.0);
  revealA = revealA * revealA * (3.0 - 2.0 * revealA);

  // Trailing size bump: peaks at the wave front, smoothly returns to 0.
  // Cosine S-curve avoids the abrupt onset of polynomial decays.
  float introBump = 0.0;
  if (introDist >= 0.0 && introDist < u_introWaveWidth) {
    float k = introDist / u_introWaveWidth;
    introBump = 0.5 + 0.5 * cos(PI * k);
  }

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
  // Starburst: a small radial core + thin cross-rays along ±x and ±y so
  // each sparkle reads as a ✦ rather than a fuzzy dot.
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
      float core = attr.x;             // core radius (px)
      float rayLen = core * 4.5;       // streak length along the axis
      float rayWid = core * 0.55;      // streak width across the axis
      float ax = abs(dx);
      float ay = abs(dy);
      // Quick reject: outside both core and ray bounds → skip
      if (ax > rayLen && ay > rayLen) continue;

      // Core radial falloff
      float d = sqrt(dx * dx + dy * dy);
      float coreFall = max(0.0, 1.0 - d / core);
      coreFall *= coreFall;

      // Two perpendicular rays (× → cross). Each is a stripe: bright along
      // its axis, narrow across it.
      float hRay = max(0.0, 1.0 - ax / rayLen) * max(0.0, 1.0 - ay / rayWid);
      float vRay = max(0.0, 1.0 - ay / rayLen) * max(0.0, 1.0 - ax / rayWid);
      // Sharpen the rays so they read as streaks, not blobs
      hRay *= hRay;
      vRay *= vRay;

      float starShape = max(coreFall, max(hRay, vRay));
      if (starShape <= 0.0) continue;
      float env = sin(t * PI);
      int idx = int(attr.z + 0.5);
      vec3 col = u_palette[idx];
      addColor(lit, wColor, wTotal, starShape * env * attr.y * audioMix, col);
    }
  }

  // ── WAVEFORM scene ───────────────────────────────────────────────────
  // Plateau-with-falloff shape: solid bright core + soft edge so the line
  // reads as a clean stroke against busy backgrounds. Uses palette[3]
  // (air, the lightest slot) for max contrast vs darker effects, with a
  // strong intensity multiplier so it dominates the per-dot blend.
  if (u_sceneWaveform && audioMix > 0.01 && u_waveformLen > 0) {
    int col = int(cellIdx.x);
    if (col >= 0 && col < u_waveformLen) {
      float lineY = u_waveformY[col];
      float dy = abs(uv.y - lineY);
      float thickness = 10.0;
      if (dy < thickness) {
        float u = dy / thickness;
        // Plateau in inner 45% (full brightness), then steep linear falloff
        float fall = u < 0.45 ? 1.0 : max(0.0, 1.0 - (u - 0.45) / 0.55);
        addColor(lit, wColor, wTotal, fall * 1.6 * audioMix, u_waveformColor);
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

  // ── FEEDBACK scene ───────────────────────────────────────────────────
  if (u_sceneFeedback && audioMix > 0.01) {
    vec2 cuv = (cellIdx + 0.5) / u_gridSize;
    float v = texture(u_feedbackTex, cuv).r;
    if (v > 0.01) {
      // Tint highs→bass with bass energy
      float tint = clamp(u_bassGroup * 1.2, 0.0, 1.0);
      vec3 col = mix(u_palette[2], u_palette[0], tint);
      addColor(lit, wColor, wTotal, v * audioMix, col);
    }
  }

  // ── LISSAJOUS scene ──────────────────────────────────────────────────
  if (u_sceneLissajous && audioMix > 0.01) {
    vec2 cuv = (cellIdx + 0.5) / u_gridSize;
    float v = texture(u_lissajousTex, cuv).r;
    if (v > 0.01) {
      // Curve color cycles through the four palette slots, one per bar
      int idx = u_lissajousColorIdx;
      if (idx < 0) idx = 0;
      if (idx > 3) idx = 3;
      vec3 col = idx == 0 ? u_palette[0]
              : idx == 1 ? u_palette[1]
              : idx == 2 ? u_palette[2]
              :            u_palette[3];
      addColor(lit, wColor, wTotal, v * audioMix, col);
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

  // ── Compose ─────────────────────────────────────────────────────────
  if (lit > 1.0) lit = 1.0;
  vec3 litCol = u_offColor;
  if (wTotal > 0.0) litCol = wColor / wTotal;
  float litCurve = pow(lit, u_vibrancy);
  vec3 finalRGB = mix(u_offColor, litCol, litCurve) / 255.0;

  // Dot rendering — emit only pixels inside the dot (radius scales with lit)
  float dotDiameter = u_dotBase + (u_dotBloom - u_dotBase) * lit;
  // Intro size bump rides on top — dots pop in larger, then settle.
  dotDiameter += introBump * u_introBumpPx;
  float dotRadius = dotDiameter * 0.5;
  if (distToDot > dotRadius) discard;

  outColor = vec4(finalRGB, u_bootP * revealA);
}`;

// ── Component ────────────────────────────────────────────────────────────
export default function LedMatrix({ height = DEFAULT_HEIGHT }: { height?: number } = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const heightRef = useRef(height);
  heightRef.current = height;

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

  // Visualizer parameters — DialKit panel removed; these are the values that
  // previously rendered as the panel's defaults.
  const dial = {
    master: {
      enabled: true,
      audioMixCap: 1.0,
      saturation: 1.5,
      vibrancy: 0.65,
    },
    sparkles: {
      density: 1.0,
      intensity: 1.0,
      onsetBurst: 1.0,
      bigChance: 0.18,
    },
  };
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

    // Float-texture support (universal in WebGL2 but the extension call is
    // still required for color-attachable float textures in some browsers).
    gl.getExtension("EXT_color_buffer_float");

    const program = linkProgram(gl, VERTEX_SRC, FRAGMENT_SRC);
    if (!program) return;
    const feedbackProgram = linkProgram(gl, VERTEX_SRC, FEEDBACK_FRAG_SRC);
    const lissajousProgram = linkProgram(gl, VERTEX_SRC, LISSAJOUS_FRAG_SRC);

    // Fullscreen triangle (covers the viewport)
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "a_pos");
    const aPosFB = feedbackProgram ? gl.getAttribLocation(feedbackProgram, "a_pos") : -1;
    const aPosLJ = lissajousProgram ? gl.getAttribLocation(lissajousProgram, "a_pos") : -1;

    // ── Ping-pong sim textures ───────────────────────────────────────────
    type SimPair = { texA: WebGLTexture; texB: WebGLTexture; fboA: WebGLFramebuffer; fboB: WebGLFramebuffer };
    const makeSimPair = (w: number, h: number): SimPair | null => {
      const make = (): { tex: WebGLTexture; fbo: WebGLFramebuffer } | null => {
        const tex = gl.createTexture();
        if (!tex) return null;
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        const fbo = gl.createFramebuffer();
        if (!fbo) return null;
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        if (status !== gl.FRAMEBUFFER_COMPLETE) return null;
        return { tex, fbo };
      };
      const a = make();
      const b = make();
      if (!a || !b) return null;
      return { texA: a.tex, texB: b.tex, fboA: a.fbo, fboB: b.fbo };
    };

    let feedbackPair: SimPair | null = null;
    let lissajousPair: SimPair | null = null;
    let feedbackCurrent: "A" | "B" = "A";
    let lissajousCurrent: "A" | "B" = "A";

    const cleanupSimPair = (p: SimPair | null) => {
      if (!p) return;
      gl.deleteTexture(p.texA);
      gl.deleteTexture(p.texB);
      gl.deleteFramebuffer(p.fboA);
      gl.deleteFramebuffer(p.fboB);
    };
    const reallocSimPairs = (cols: number, rows: number) => {
      cleanupSimPair(feedbackPair);
      cleanupSimPair(lissajousPair);
      feedbackPair = makeSimPair(cols, rows);
      lissajousPair = makeSimPair(cols, rows);
      feedbackCurrent = "A";
      lissajousCurrent = "A";
    };

    // Uniform locations
    const u = (name: string) => gl.getUniformLocation(program, name);
    const uResolution = u("u_resolution");
    const uTime = u("u_time");
    const uBootP = u("u_bootP");
    const uAudioMix = u("u_audioMix");
    const uOffColor = u("u_offColor");
    const uOnColor = u("u_onColor");
    const uPalette = u("u_palette");
    const uWaveformColor = u("u_waveformColor");
    const uSpacing = u("u_spacing");
    const uDotBase = u("u_dotBase");
    const uDotBloom = u("u_dotBloom");
    const uCornerRadius = u("u_cornerRadius");
    const uVibrancy = u("u_vibrancy");
    const uAudioMixCap = u("u_audioMixCap");
    const uBeatPhase = u("u_beatPhase");
    const uBarPhase = u("u_barPhase");
    const uSceneSparkles = u("u_sceneSparkles");
    const uSceneWaveform = u("u_sceneWaveform");
    const uSceneChladni = u("u_sceneChladni");
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
    const uSceneFeedback = u("u_sceneFeedback");
    const uSceneLissajous = u("u_sceneLissajous");
    const uLissajousColorIdx = u("u_lissajousColorIdx");
    const uFeedbackTex = u("u_feedbackTex");
    const uLissajousTex = u("u_lissajousTex");
    const uGridSizeMain = u("u_gridSize");
    const uIntroFrontPx = u("u_introFrontPx");
    const uIntroWaveWidth = u("u_introWaveWidth");
    const uIntroRevealFade = u("u_introRevealFade");
    const uIntroBumpPx = u("u_introBumpPx");

    // Simulation program uniforms
    const fbU = feedbackProgram
      ? {
          input: gl.getUniformLocation(feedbackProgram, "u_input"),
          gridSize: gl.getUniformLocation(feedbackProgram, "u_gridSize"),
          decay: gl.getUniformLocation(feedbackProgram, "u_decay"),
          angle: gl.getUniformLocation(feedbackProgram, "u_angle"),
          zoom: gl.getUniformLocation(feedbackProgram, "u_zoom"),
          bassRadius: gl.getUniformLocation(feedbackProgram, "u_bassRadius"),
          strokeBassY: gl.getUniformLocation(feedbackProgram, "u_strokeBassY"),
          strokeMidsX: gl.getUniformLocation(feedbackProgram, "u_strokeMidsX"),
          strokeRingX: gl.getUniformLocation(feedbackProgram, "u_strokeRingX"),
          strokeRingY: gl.getUniformLocation(feedbackProgram, "u_strokeRingY"),
          strokeRingR: gl.getUniformLocation(feedbackProgram, "u_strokeRingR"),
        }
      : null;
    const ljU = lissajousProgram
      ? {
          input: gl.getUniformLocation(lissajousProgram, "u_input"),
          gridSize: gl.getUniformLocation(lissajousProgram, "u_gridSize"),
          decay: gl.getUniformLocation(lissajousProgram, "u_decay"),
          sampleCount: gl.getUniformLocation(lissajousProgram, "u_sampleCount"),
          samples: gl.getUniformLocation(lissajousProgram, "u_samples"),
        }
      : null;

    // Sizing
    let dpr = window.devicePixelRatio || 1;
    let cssW = 0;
    let cssH = heightRef.current;
    let cols = 0;
    let rows = 0;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      cssW = rect.width;
      cssH = heightRef.current;
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      cols = Math.max(1, Math.floor(cssW / SPACING));
      rows = Math.max(1, Math.floor(cssH / SPACING));
      reallocSimPairs(cols, rows);
    };
    resize();

    // Per-frame state
    let offColor: [number, number, number] = [230, 230, 230];
    let onColor: [number, number, number] = [181, 101, 29];
    let bassCol: [number, number, number] = [180, 100, 30];
    let midsCol: [number, number, number] = [232, 155, 90];
    let highsCol: [number, number, number] = [242, 210, 155];
    let airCol: [number, number, number] = [255, 241, 214];
    let waveformCol: [number, number, number] = [180, 100, 30];
    let lastPaletteSrc = "";
    let lastSaturation = -1;
    let bgLum = 1; // page bg luminance, refreshed from CSS each frame
    let lastBgLum = NaN;

    const refreshThemeColors = () => {
      const styles = getComputedStyle(document.documentElement);
      const offRaw = styles.getPropertyValue("--color-border").trim();
      const onRaw = styles.getPropertyValue("--color-accent").trim();
      const bgRaw = styles.getPropertyValue("--color-bg").trim();
      if (offRaw) offColor = parseColor(offRaw);
      if (onRaw) onColor = parseColor(onRaw);
      if (bgRaw) {
        const bgRgb = parseColor(bgRaw);
        bgLum = rgbToHsl(bgRgb[0], bgRgb[1], bgRgb[2])[2];
      }
    };
    refreshThemeColors();

    // Audio + interaction state
    let audioMix = 0;
    let prevSparklesBass = 0;
    const sparkles: Sparkle[] = [];
    const ripples: Ripple[] = [];
    const idleWaves: IdleWave[] = [];
    let nextIdleAt = 0;
    const analyzer = new AudioAnalyzer();
    let analysis: AnalysisSnapshot | null = null;

    // Chladni state
    let chladniM = 3, chladniN = 4;
    let chladniMTarget = 3, chladniNTarget = 4;
    let chladniRotation = 0;
    let chladniPhaseX = 0, chladniPhaseY = 0;

    // Lissajous sample positions (grid-cell coords) — packed each frame
    const lissajousSamplesArr = new Float32Array(MAX_LISSAJOUS_SAMPLES * 2);

    // Beat-grid tracking (incremented in JS by detecting barPhase wrap)
    let prevBarPhase = 0;
    let barIndex = 0;

    const t0 = performance.now();
    const scheduleNextIdle = (now: number) => {
      nextIdleAt = now + IDLE_INTERVAL_MIN_MS + Math.random() * (IDLE_INTERVAL_MAX_MS - IDLE_INTERVAL_MIN_MS);
    };
    scheduleNextIdle(t0);

    // Seed an initial idle wave at mount so the matrix feels alive right
    // as the intro wipe completes — without it, the first ambient pulse
    // doesn't fire until IDLE_INTERVAL_MIN_MS later, leaving a dead beat.
    if (!reducedMotion) {
      idleWaves.push({
        t0,
        duration: IDLE_DURATION_MIN_MS + Math.random() * (IDLE_DURATION_MAX_MS - IDLE_DURATION_MIN_MS),
        intensity: IDLE_INTENSITY_MIN + Math.random() * (IDLE_INTENSITY_MAX - IDLE_INTENSITY_MIN),
        ox: Math.random() * 1000,
        oy: Math.random() * 1000,
        drift: 0.6 + Math.random() * 0.8,
      });
    }

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

      // Track palette refresh + saturation + per-theme tonemap.
      // Re-runs when track, saturation dial, or page bg luminance changes
      // (the last covers light/dark/colored-theme switches at runtime).
      const track = aState.track;
      const sat = d.master.saturation;
      const trackChanged = track.src !== lastPaletteSrc;
      const bgChanged = Math.abs(bgLum - lastBgLum) > 0.001 || Number.isNaN(lastBgLum);
      if (trackChanged || sat !== lastSaturation || bgChanged) {
        bassCol = tonemapForBg(saturate(parseColor(track.palette.bass), sat), bgLum);
        midsCol = tonemapForBg(saturate(parseColor(track.palette.mids), sat), bgLum);
        highsCol = tonemapForBg(saturate(parseColor(track.palette.highs), sat), bgLum);
        airCol = tonemapForBg(saturate(parseColor(track.palette.air), sat), bgLum);
        // Waveform color: pick the original palette slot with the largest
        // luminance gap from bg, then run a stricter tonemap so the thin
        // line clears the contrast bar even on pastel light themes.
        const rawPalette: [number, number, number][] = [
          saturate(parseColor(track.palette.bass), sat),
          saturate(parseColor(track.palette.mids), sat),
          saturate(parseColor(track.palette.highs), sat),
          saturate(parseColor(track.palette.air), sat),
        ];
        waveformCol = tonemapForWaveform(pickHighestContrast(rawPalette, bgLum), bgLum);
        lastPaletteSrc = track.src;
        lastSaturation = sat;
        lastBgLum = bgLum;
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

      // Bar-index tracker — increments once each time barPhase wraps back
      // toward zero. Drives lissajous color-cycling per bar.
      const curBarPhase = analysis?.barPhase ?? 0;
      if (curBarPhase < 0.1 && prevBarPhase > 0.9) barIndex++;
      prevBarPhase = curBarPhase;

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
        // Per-drum bursts: kick = main bass-color burst, snare = mid burst,
        // hat = many tiny high-color sparkles. Plus a downbeat boost — when
        // a kick lands on beat 1 of a bar, the burst is meaningfully bigger.
        let burstCount = 0;
        let snareBurst = 0;
        let hatBurst = 0;
        if (analysis) {
          const k = analysis.drums.kick;
          const s = analysis.drums.snare;
          const h = analysis.drums.hat;
          const bp = analysis.barPhase;
          // Downbeat = beat 1 of a 4/4 bar (barPhase near 0)
          const onDownbeat = bp < 0.12 || bp > 0.88;
          const downbeatBoost = onDownbeat ? 1.7 : 1.0;
          if (k.onset) {
            burstCount = Math.floor(
              (SPARKLES_BURST_BASE + SPARKLES_BURST_PER_BEAT * k.strength) *
                sCfg.onsetBurst *
                downbeatBoost
            );
          }
          if (s.onset) snareBurst = Math.floor(8 + s.strength * 16 * sCfg.onsetBurst);
          if (h.onset) hatBurst = Math.floor(6 + h.strength * 14 * sCfg.onsetBurst);
        }
        prevSparklesBass = bassGroup;

        // Helper: spawn a sparkle with optional forced color index (for drum bursts).
        // forcedColor=null → weighted random by current band content (continuous spawns).
        const pushSparkle = (forcedColor: number | null) => {
          const isBig = Math.random() < sCfg.bigChance;
          const life = isBig
            ? SPARKLES_BIG_LIFE_MIN + Math.random() * (SPARKLES_BIG_LIFE_MAX - SPARKLES_BIG_LIFE_MIN)
            : SPARKLES_LIFE_MIN_MS + Math.random() * (SPARKLES_LIFE_MAX_MS - SPARKLES_LIFE_MIN_MS);
          // Bigger sizes overall — starbursts need real estate to read as
          // streaks, not just dots. Big sparkles get up to ~5px core radius
          // (=> ~22px ray reach) so they punch.
          const size = isBig ? 3.0 + Math.random() * 2.5 : 1.0 + Math.random() * 1.2;
          const intensity = (0.95 + Math.random() * 0.7) * sCfg.intensity * (isBig ? 1.35 : 1);
          let colorIdx = forcedColor ?? 0;
          if (forcedColor === null) {
            const wB = (bandsArr ? (bandsArr[0] + bandsArr[1]) : 0.5) * 2.2 + 0.4;
            const wM = bandsArr ? (bandsArr[2] + bandsArr[3]) : 0.3;
            const wH = bandsArr ? (bandsArr[4] + bandsArr[5] + bandsArr[6]) : 0.2;
            const wA = bandsArr ? bandsArr[7] : 0.1;
            const total = wB + wM + wH + wA;
            let r = Math.random() * total;
            if ((r -= wB) < 0) colorIdx = 0;
            else if ((r -= wM) < 0) colorIdx = 1;
            else if ((r -= wH) < 0) colorIdx = 2;
            else colorIdx = 3;
          }
          sparkles.push({
            x: Math.random() * cssW,
            y: Math.random() * cssH,
            t0: now,
            life,
            size,
            intensity,
            colorIdx,
          });
        };

        // Continuous spawns — weighted random color (always)
        for (let i = 0; i < continuous; i++) pushSparkle(null);
        // Kick burst — bass color
        for (let i = 0; i < burstCount; i++) pushSparkle(0);
        // Snare burst — mids color (smaller, more dynamic)
        for (let i = 0; i < snareBurst; i++) pushSparkle(1);
        // Hat burst — air color (lots of small fast)
        for (let i = 0; i < hatBurst; i++) pushSparkle(3);

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
        // Mode jumps gate on a strong KICK landing on the downbeat (beatPhase
        // near 0 or near 1 — the beat boundary). This makes dramatic shape
        // changes feel musical instead of arbitrary.
        const beatPhase = analysis?.beatPhase ?? 0;
        const onDownbeat = beatPhase < 0.18 || beatPhase > 0.82;
        const kick = analysis?.drums.kick;
        if (
          kick?.onset &&
          kick.strength > 0.35 &&
          onDownbeat &&
          Math.random() < 0.6
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
        // Rotation gets a brief acceleration burst at the start of each bar
        // (barPhase wrap zone) — the lattice spins faster every 4 beats.
        const bp = analysis?.barPhase ?? 0;
        const barBoost = bp < 0.08 || bp > 0.92 ? 0.025 : 0;
        chladniRotation += 0.0025 + 0.005 * bassGroup + barBoost;
        chladniPhaseX += 0.0035 + 0.006 * midsGroup;
        chladniPhaseY += 0.0028 + 0.005 * highsGroup;
      }

      // ── Waveform — pre-compute y per column. Values are stored in
      //   physical (dpr-scaled) pixels since the shader works in those.
      //   Amplitude is set to (cssH - SPACING) / 2 so the trace's max
      //   reach lands on the top/bottom dot centers — snug fit to grid.
      const waveformLen = Math.min(MAX_WAVEFORM, Math.floor(cssW / SPACING));
      if (scenes.has("waveform") && audioMix > 0.01) {
        const td = aState.getTimeDomainData?.();
        if (td) {
          const half = cssH / 2;
          const amp = (cssH - SPACING) / 2;
          for (let c = 0; c < waveformLen; c++) {
            const sampleIdx = Math.floor((c / waveformLen) * td.length);
            const sample = td[Math.min(sampleIdx, td.length - 1)];
            const a = (sample - 128) / 128;
            waveformArr[c] = (half + a * amp) * dpr;
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

      // ── Run buffer-backed scene sim steps ─────────────────────────
      const runSim = (
        prog: WebGLProgram | null,
        aPosLoc: number,
        pair: SimPair | null,
        current: "A" | "B",
        bind: () => void
      ): "A" | "B" => {
        if (!prog || !pair) return current;
        const srcTex = current === "A" ? pair.texA : pair.texB;
        const dstFbo = current === "A" ? pair.fboB : pair.fboA;
        gl.useProgram(prog);
        gl.bindFramebuffer(gl.FRAMEBUFFER, dstFbo);
        gl.viewport(0, 0, cols, rows);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, srcTex);
        bind();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.enableVertexAttribArray(aPosLoc);
        gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 0, 0);
        gl.disable(gl.BLEND);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        return current === "A" ? "B" : "A";
      };

      // FEEDBACK — rotation pulses at BPM. A spike at the start of each
      // detected beat (decays over the first quarter-beat) makes the warp
      // "tick" with the music instead of cruising at constant rate.
      if (scenes.has("feedback") && feedbackProgram && fbU && audioMix > 0.01) {
        const bg = bassGroup;
        const hg = highsGroup;
        const beatPhase = analysis?.beatPhase ?? 0;
        const beatPulse = beatPhase < 0.25 ? 1 - beatPhase / 0.25 : 0;
        const angle = 0.018 + 0.030 * bg + 0.05 * beatPulse;
        const zoom = 1.014 + 0.010 * hg;
        const bassRadius = bg * 14;
        let strokeBassY = -1, strokeMidsX = -1;
        let strokeRingX = -1, strokeRingY = -1, strokeRingR = -1;
        if (onsetThisFrame && analysis) {
          const beat = analysis.beatStrength;
          if (analysis.bands.bass > 0.45) strokeBassY = Math.floor(Math.random() * rows);
          if (analysis.midsGroup > 0.4) strokeMidsX = Math.floor(Math.random() * cols);
          if (analysis.airGroup > 0.25 || hg > 0.35) {
            strokeRingX = Math.floor(2 + Math.random() * (cols - 4));
            strokeRingY = Math.floor(2 + Math.random() * (rows - 4));
            strokeRingR = 6 + beat * 10;
          }
        }
        feedbackCurrent = runSim(feedbackProgram, aPosFB, feedbackPair, feedbackCurrent, () => {
          gl.uniform1i(fbU.input, 0);
          gl.uniform2f(fbU.gridSize, cols, rows);
          gl.uniform1f(fbU.decay, 0.94);
          gl.uniform1f(fbU.angle, angle);
          gl.uniform1f(fbU.zoom, zoom);
          gl.uniform1f(fbU.bassRadius, bassRadius);
          gl.uniform1f(fbU.strokeBassY, strokeBassY);
          gl.uniform1f(fbU.strokeMidsX, strokeMidsX);
          gl.uniform1f(fbU.strokeRingX, strokeRingX);
          gl.uniform1f(fbU.strokeRingY, strokeRingY);
          gl.uniform1f(fbU.strokeRingR, strokeRingR);
        });
      }

      // LISSAJOUS — pre-compute curve sample positions in grid cells.
      // Amplitude is set so the curve's max reach lands exactly on the
      // first/last dot centers (SPACING/2 inset from each canvas edge),
      // giving a snug fit to the visible dot grid.
      if (scenes.has("lissajous") && lissajousProgram && ljU && audioMix > 0.01) {
        const a = 2 + Math.floor(bassGroup * 3);
        const b = 3 + Math.floor(highsGroup * 3);
        const phase = (now * 0.0008) % (Math.PI * 2);
        const ax = (cssW - SPACING) / 2;
        const ay = (cssH - SPACING) / 2;
        const ccx = cssW / 2;
        const ccy = cssH / 2;
        let validSamples = 0;
        for (let s = 0; s < MAX_LISSAJOUS_SAMPLES; s++) {
          const t = (s / MAX_LISSAJOUS_SAMPLES) * Math.PI * 2;
          const x = ccx + ax * Math.sin(a * t + phase);
          const y = ccy + ay * Math.sin(b * t);
          const cellC = Math.floor(x / SPACING);
          const cellR = Math.floor(y / SPACING);
          if (cellC >= 0 && cellC < cols && cellR >= 0 && cellR < rows) {
            lissajousSamplesArr[validSamples * 2] = cellC;
            lissajousSamplesArr[validSamples * 2 + 1] = cellR;
            validSamples++;
          }
        }
        const captured = validSamples;
        lissajousCurrent = runSim(lissajousProgram, aPosLJ, lissajousPair, lissajousCurrent, () => {
          gl.uniform1i(ljU.input, 0);
          gl.uniform2f(ljU.gridSize, cols, rows);
          gl.uniform1f(ljU.decay, 0.94);
          gl.uniform1i(ljU.sampleCount, captured);
          gl.uniform2fv(ljU.samples, lissajousSamplesArr);
        });
      }

      // ── Main render ────────────────────────────────────────────────
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);

      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      // Bind simulation textures to dedicated texture units
      const feedbackTex = feedbackPair
        ? feedbackCurrent === "A" ? feedbackPair.texA : feedbackPair.texB
        : null;
      const lissajousTex = lissajousPair
        ? lissajousCurrent === "A" ? lissajousPair.texA : lissajousPair.texB
        : null;
      if (feedbackTex) {
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, feedbackTex);
        gl.uniform1i(uFeedbackTex, 2);
      }
      if (lissajousTex) {
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, lissajousTex);
        gl.uniform1i(uLissajousTex, 3);
      }
      gl.uniform2f(uGridSizeMain, cols, rows);
      gl.uniform1i(uSceneFeedback, scenes.has("feedback") && d.master.enabled ? 1 : 0);
      gl.uniform1i(uSceneLissajous, scenes.has("lissajous") && d.master.enabled ? 1 : 0);
      gl.uniform1i(uLissajousColorIdx, ((barIndex % 4) + 4) % 4);

      // Set uniforms
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, now);
      gl.uniform1f(uBootP, bootP);
      gl.uniform1f(uAudioMix, audioMix);
      gl.uniform3f(uOffColor, offColor[0], offColor[1], offColor[2]);
      gl.uniform3f(uOnColor, onColor[0], onColor[1], onColor[2]);
      gl.uniform3fv(uPalette, paletteArr);
      gl.uniform3f(uWaveformColor, waveformCol[0], waveformCol[1], waveformCol[2]);
      gl.uniform1f(uSpacing, SPACING * dpr);
      gl.uniform1f(uDotBase, DOT_BASE * dpr);
      gl.uniform1f(uDotBloom, DOT_BLOOM * dpr);
      gl.uniform1f(uCornerRadius, CORNER_RADIUS * dpr);
      // Vibrancy lift on downbeats — temporarily lower vibrancy gamma so
      // moderate intensities push closer to full palette color, making the
      // grid pop on beat 1 of each bar. Falls off over the first 18% of
      // the bar.
      const dbpRaw = analysis?.barPhase ?? 0;
      const dbProx = dbpRaw < 0.18 ? 1 - dbpRaw / 0.18 : (dbpRaw > 0.82 ? (dbpRaw - 0.82) / 0.18 : 0);
      const effectiveVibrancy = Math.max(0.3, d.master.vibrancy - 0.18 * dbProx);
      gl.uniform1f(uVibrancy, effectiveVibrancy);
      gl.uniform1f(uAudioMixCap, d.master.audioMixCap);
      gl.uniform1f(uBeatPhase, analysis?.beatPhase ?? 0);
      gl.uniform1f(uBarPhase, analysis?.barPhase ?? 0);

      gl.uniform1i(uSceneSparkles, scenes.has("sparkles") && d.master.enabled ? 1 : 0);
      gl.uniform1i(uSceneWaveform, scenes.has("waveform") && d.master.enabled ? 1 : 0);
      gl.uniform1i(uSceneChladni, scenes.has("chladni") && d.master.enabled ? 1 : 0);

      gl.uniform1i(uRippleCount, visibleRipples);
      gl.uniform4fv(uRipples, rippleArr);

      gl.uniform1i(uSparkleCount, sparkles.length);
      gl.uniform4fv(uSparklePos, sparklePosArr);
      gl.uniform4fv(uSparkleAttr, sparkleAttrArr);

      // ── Intro wipe uniforms ──────────────────────────────────────────
      const diagLenPx = Math.hypot(canvas.width, canvas.height);
      const waveWidthPx = INTRO_WAVE_WIDTH_PX * dpr;
      const revealFadePx = INTRO_REVEAL_FADE_PX * dpr;
      let introFrontPx: number;
      if (reducedMotion) {
        introFrontPx = diagLenPx + waveWidthPx + revealFadePx; // fully revealed, wave exited
      } else {
        const introT = Math.min(1, Math.max(0, (now - t0) / INTRO_WIPE_MS));
        const eased = 1 - Math.pow(1 - introT, 3);
        introFrontPx = -revealFadePx + eased * (diagLenPx + waveWidthPx + revealFadePx);
      }
      gl.uniform1f(uIntroFrontPx, introFrontPx);
      gl.uniform1f(uIntroWaveWidth, waveWidthPx);
      gl.uniform1f(uIntroRevealFade, revealFadePx);
      gl.uniform1f(uIntroBumpPx, INTRO_BUMP_PX * dpr);

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
      window.removeEventListener("resize", handleResize);
      themeObserver.disconnect();
      gl.deleteProgram(program);
      if (feedbackProgram) gl.deleteProgram(feedbackProgram);
      if (lissajousProgram) gl.deleteProgram(lissajousProgram);
      cleanupSimPair(feedbackPair);
      cleanupSimPair(lissajousPair);
      gl.deleteBuffer(vbo);
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", width: "100%", height }}
      aria-hidden="true"
    />
  );
}
