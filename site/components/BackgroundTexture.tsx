"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { TEXTURE_CONFIG } from "@/lib/texture-constants";

interface Dot {
  x: number;
  y: number;
}

// Simple 2D noise implementation
const noise2D = (() => {
  const permutation = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
  const p = new Array(512);
  for (let i = 0; i < 256; i++) p[256 + i] = p[i] = permutation[i];

  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (t: number, a: number, b: number) => a + t * (b - a);
  const grad = (hash: number, x: number, y: number) => {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  };

  return (x: number, y: number) => {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const u = fade(x);
    const v = fade(y);
    const A = p[X] + Y, B = p[X + 1] + Y;
    return lerp(v, lerp(u, grad(p[A], x, y), grad(p[B], x - 1, y)),
                   lerp(u, grad(p[A + 1], x, y - 1), grad(p[B + 1], x - 1, y - 1)));
  };
})();

function getComputedColor(varName: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || "#888";
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null;
}

function rgbaToRgb(rgba: string): { r: number; g: number; b: number } | null {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  return match ? { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) } : null;
}

function parseColor(color: string): { r: number; g: number; b: number } {
  if (color.startsWith("#")) {
    return hexToRgb(color) || { r: 136, g: 136, b: 136 };
  }
  if (color.startsWith("rgb")) {
    return rgbaToRgb(color) || { r: 136, g: 136, b: 136 };
  }
  return { r: 136, g: 136, b: 136 };
}

export function BackgroundTexture() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const initDots = useCallback((width: number, height: number) => {
    const dots: Dot[] = [];
    const { GRID_SPACING } = TEXTURE_CONFIG;

    const cols = Math.ceil(width / GRID_SPACING) + 1;
    const rows = Math.ceil(height / GRID_SPACING) + 1;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        dots.push({
          x: col * GRID_SPACING,
          y: row * GRID_SPACING,
        });
      }
    }
    dotsRef.current = dots;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { DOT_SIZE, DOT_OPACITY, HOVER_RADIUS } = TEXTURE_CONFIG;
    const mouse = mouseRef.current;

    // Increment time (~10 second cycle)
    timeRef.current += 0.002;
    const time = timeRef.current;

    // Get colors from CSS variables
    const dotColor = parseColor(getComputedColor("--color-fg-tertiary"));
    const glowColor = parseColor(getComputedColor("--color-glow"));

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const dot of dotsRef.current) {
      const dx = mouse.x - dot.x;
      const dy = mouse.y - dot.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Wave effect using Perlin noise (diagonal movement)
      const noiseScale = 0.0015;
      const diagonalOffset = (dot.x + dot.y) * 0.0003;
      const noiseVal = noise2D(
        dot.x * noiseScale + time + diagonalOffset,
        dot.y * noiseScale + time * 0.6
      );
      // Normalize noise from [-1,1] to [0,1], apply threshold for more contrast
      const rawIntensity = (noiseVal + 1) * 0.5;
      // Cut off lower values to create "empty" areas, then remap remaining range
      const threshold = 0.45;
      const waveIntensity = rawIntensity > threshold
        ? Math.pow((rawIntensity - threshold) / (1 - threshold), 0.7) * 0.9
        : 0;

      let color = dotColor;
      let opacity = DOT_OPACITY;
      let size = DOT_SIZE;

      // Apply wave effect
      color = {
        r: Math.round(dotColor.r + (glowColor.r - dotColor.r) * waveIntensity),
        g: Math.round(dotColor.g + (glowColor.g - dotColor.g) * waveIntensity),
        b: Math.round(dotColor.b + (glowColor.b - dotColor.b) * waveIntensity),
      };
      opacity = DOT_OPACITY + (0.35 - DOT_OPACITY) * waveIntensity;
      size = DOT_SIZE * (1 + waveIntensity * 2.0);

      // Cursor hover effect (combines with wave)
      if (dist < HOVER_RADIUS) {
        const proximity = 1 - dist / HOVER_RADIUS;
        const blend = Math.pow(proximity, 1.2);

        // Add to size
        size += DOT_SIZE * proximity * 0.6;

        // Blend more color toward glow
        color = {
          r: Math.round(color.r + (glowColor.r - color.r) * blend * 0.7),
          g: Math.round(color.g + (glowColor.g - color.g) * blend * 0.7),
          b: Math.round(color.b + (glowColor.b - color.b) * blend * 0.7),
        };

        // Add to opacity
        opacity += (0.18 - opacity) * blend;
      }

      ctx.beginPath();
      ctx.arc(dot.x, dot.y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
      ctx.fill();
    }

    animationRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
      initDots(window.innerWidth, window.innerHeight);
    };

    resize();
    window.addEventListener("resize", resize);
    animationRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [mounted, initDots, draw]);

  useEffect(() => {
    if (!mounted) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      {/* Paper grain layer */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.12]" aria-hidden="true">
        <filter id="paper-grain">
          <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="5" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#paper-grain)" />
      </svg>

      {/* Dots canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}

export default BackgroundTexture;
