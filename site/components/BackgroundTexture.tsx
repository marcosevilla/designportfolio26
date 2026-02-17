"use client";

import { useRef, useEffect, useCallback, useState } from "react";

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

  // ─────────────────────────────────────────────────────────
  // Background texture configuration
  // ─────────────────────────────────────────────────────────
  const params = {
    wave: {
      gridSpacing: 10,
      dotSize: 0.5,
      dotOpacity: 0.14,
      speed: 0.01,
      threshold: 0.45,
      intensityMax: 0.7,
      noiseScale: 0.0015,
      dotGrowth: 2.0,
      opacityMax: 0.35,
      grainOpacity: 0.12,
    },
    colors: {
      useCustomColors: false,
      dotColor: "#888888",
      glowColor: "#B5651D",
    },
    shape: {
      type: "circle" as const,
      rotation: 0,
      lineWidth: 1,
    },
    hover: {
      radius: 150,
      dotGrowth: 1.4,
      colorBlend: 0.7,
      opacityMax: 0.18,
      falloffPower: 1.2,
    },
  };

  const paramsRef = useRef(params);
  paramsRef.current = params;

  const isVisibleRef = useRef(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const initDots = useCallback((width: number, height: number, spacing: number) => {
    const dots: Dot[] = [];
    const cols = Math.ceil(width / spacing) + 1;
    const rows = Math.ceil(height / spacing) + 1;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        dots.push({
          x: col * spacing,
          y: row * spacing,
        });
      }
    }
    dotsRef.current = dots;
  }, []);

  // Re-init dots when grid spacing changes
  const gridSpacing = params.wave.gridSpacing;
  useEffect(() => {
    if (!mounted) return;
    initDots(window.innerWidth, window.innerHeight, gridSpacing);
  }, [mounted, gridSpacing, initDots]);

  // Cache resolved colors — update on theme change, not every frame
  const cachedColorsRef = useRef<{ dot: { r: number; g: number; b: number }; glow: { r: number; g: number; b: number } } | null>(null);

  const refreshColors = useCallback(() => {
    const p = paramsRef.current;
    cachedColorsRef.current = {
      dot: p.colors.useCustomColors
        ? parseColor(p.colors.dotColor)
        : parseColor(getComputedColor("--color-fg-tertiary")),
      glow: p.colors.useCustomColors
        ? parseColor(p.colors.glowColor)
        : parseColor(getComputedColor("--color-glow")),
    };
  }, []);

  // Refresh colors on mount and when theme/class changes
  useEffect(() => {
    if (!mounted) return;
    refreshColors();

    const observer = new MutationObserver(() => refreshColors());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });
    return () => observer.disconnect();
  }, [mounted, refreshColors]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Skip drawing when tab is hidden
    if (document.hidden) {
      animationRef.current = requestAnimationFrame(draw);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const p = paramsRef.current;
    const mouse = mouseRef.current;

    // Increment time
    timeRef.current += p.wave.speed;
    const time = timeRef.current;

    // Use cached colors
    if (!cachedColorsRef.current) refreshColors();
    const dotColor = cachedColorsRef.current!.dot;
    const glowColor = cachedColorsRef.current!.glow;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const dot of dotsRef.current) {
      const dx = mouse.x - dot.x;
      const dy = mouse.y - dot.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Wave effect using Perlin noise (diagonal movement)
      const diagonalOffset = (dot.x + dot.y) * 0.0003;
      const noiseVal = noise2D(
        dot.x * p.wave.noiseScale + time + diagonalOffset,
        dot.y * p.wave.noiseScale + time * 0.6
      );
      // Normalize noise from [-1,1] to [0,1], apply threshold for more contrast
      const rawIntensity = (noiseVal + 1) * 0.5;
      const waveIntensity = rawIntensity > p.wave.threshold
        ? Math.pow((rawIntensity - p.wave.threshold) / (1 - p.wave.threshold), 0.7) * p.wave.intensityMax
        : 0;

      let color = dotColor;
      let opacity = p.wave.dotOpacity;
      let size = p.wave.dotSize;

      // Apply wave effect
      color = {
        r: Math.round(dotColor.r + (glowColor.r - dotColor.r) * waveIntensity),
        g: Math.round(dotColor.g + (glowColor.g - dotColor.g) * waveIntensity),
        b: Math.round(dotColor.b + (glowColor.b - dotColor.b) * waveIntensity),
      };
      opacity = p.wave.dotOpacity + (p.wave.opacityMax - p.wave.dotOpacity) * waveIntensity;
      size = p.wave.dotSize * (1 + waveIntensity * p.wave.dotGrowth);

      // Cursor hover effect (combines with wave)
      if (dist < p.hover.radius) {
        const proximity = 1 - dist / p.hover.radius;
        const blend = Math.pow(proximity, p.hover.falloffPower);

        // Add to size
        size += p.wave.dotSize * proximity * p.hover.dotGrowth;

        // Blend more color toward glow
        color = {
          r: Math.round(color.r + (glowColor.r - color.r) * blend * p.hover.colorBlend),
          g: Math.round(color.g + (glowColor.g - color.g) * blend * p.hover.colorBlend),
          b: Math.round(color.b + (glowColor.b - color.b) * blend * p.hover.colorBlend),
        };

        // Add to opacity
        opacity += (p.hover.opacityMax - opacity) * blend;
      }

      const fillColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
      const shapeType = p.shape.type;
      const rotRad = (p.shape.rotation * Math.PI) / 180;

      ctx.save();
      ctx.translate(dot.x, dot.y);
      if (rotRad !== 0) ctx.rotate(rotRad);

      if (shapeType === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fillStyle = fillColor;
        ctx.fill();
      } else if (shapeType === "square") {
        ctx.fillStyle = fillColor;
        ctx.fillRect(-size, -size, size * 2, size * 2);
      } else if (shapeType === "diamond") {
        ctx.beginPath();
        ctx.moveTo(0, -size * 1.4);
        ctx.lineTo(size * 1.4, 0);
        ctx.lineTo(0, size * 1.4);
        ctx.lineTo(-size * 1.4, 0);
        ctx.closePath();
        ctx.fillStyle = fillColor;
        ctx.fill();
      } else if (shapeType === "cross") {
        const w = size * 0.4;
        ctx.fillStyle = fillColor;
        ctx.fillRect(-size, -w, size * 2, w * 2);
        ctx.fillRect(-w, -size, w * 2, size * 2);
      } else if (shapeType === "line") {
        ctx.beginPath();
        ctx.moveTo(0, -size * 1.5);
        ctx.lineTo(0, size * 1.5);
        ctx.strokeStyle = fillColor;
        ctx.lineWidth = p.shape.lineWidth;
        ctx.stroke();
      }

      ctx.restore();
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
      initDots(window.innerWidth, window.innerHeight, paramsRef.current.wave.gridSpacing);
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
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}

export default BackgroundTexture;
