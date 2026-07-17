"use client";

// Dev-only playground for previewing the restored visual effects before
// applying them to the real site:
//   1. Paper grain (live in globals.css — overridden here for tuning)
//   2. Perlin-noise dot grid (restored BackgroundTexture, deleted in 3d3a14c)
//   3. Cursor-tracking card rim-glow (restored from CaseStudyCard, 7b962c1)
// Everything lives inside app/dev/effects-lab/ — nothing outside this folder
// changes until settings are promoted for real.

import { useEffect, useState } from "react";
import {
  BackgroundTexture,
  DEFAULT_TEXTURE_PARAMS,
  type TextureParams,
  type DotShape,
} from "./BackgroundTexture";
import GlowCard, { DEFAULT_GLOW_PARAMS, type GlowParams } from "./GlowCard";

interface GrainParams {
  enabled: boolean;
  frequency: number;
  strength: number;
  opacity: number;
}

// Matches the production values in globals.css (:root --grain-image)
const DEFAULT_GRAIN_PARAMS: GrainParams = {
  enabled: true,
  frequency: 0.8,
  strength: 0.18,
  opacity: 1,
};

function grainDataUri(frequency: number, strength: number): string {
  const slope = strength.toFixed(3);
  const intercept = (1 - strength).toFixed(3);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='${frequency}' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncR type='linear' slope='${slope}' intercept='${intercept}'/><feFuncG type='linear' slope='${slope}' intercept='${intercept}'/><feFuncB type='linear' slope='${slope}' intercept='${intercept}'/></feComponentTransfer></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const SAMPLE_CARDS = [
  { title: "F&B Ordering", subtitle: "Guest ordering from a hotel room, end to end.", year: "2025" },
  { title: "Digital Compendium", subtitle: "The hotel guidebook, reimagined as a platform.", year: "2024" },
  { title: "Upsells Forms", subtitle: "Workflow design for revenue teams.", year: "2025" },
  { title: "Hotel Check-in", subtitle: "Enterprise-scale arrival experience.", year: "2024" },
];

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[11px] text-gray-400 w-[80px] shrink-0 uppercase tracking-wider">
        {label}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 h-1 accent-blue-500"
      />
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
        }}
        className="w-[64px] bg-[#2a2a3e] text-white text-xs text-right px-2 py-1 rounded-sm border border-white/10 tabular-nums"
      />
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`px-3 py-1 text-xs rounded transition-colors ${
        value ? "bg-blue-500 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-medium text-gray-300 uppercase tracking-wider">
      {children}
    </h3>
  );
}

export default function EffectsLab() {
  const [grain, setGrain] = useState<GrainParams>(DEFAULT_GRAIN_PARAMS);
  const [texture, setTexture] = useState<TextureParams>(DEFAULT_TEXTURE_PARAMS);
  const [textureOn, setTextureOn] = useState(true);
  const [glow, setGlow] = useState<GlowParams>(DEFAULT_GLOW_PARAMS);
  const [copied, setCopied] = useState(false);

  // Override the production grain tile (globals.css) while this page is open
  const { frequency, strength } = grain;
  useEffect(() => {
    const isDefault =
      frequency === DEFAULT_GRAIN_PARAMS.frequency &&
      strength === DEFAULT_GRAIN_PARAMS.strength;
    if (!isDefault) {
      document.documentElement.style.setProperty("--grain-image", grainDataUri(frequency, strength));
    }
    return () => {
      document.documentElement.style.removeProperty("--grain-image");
    };
  }, [frequency, strength]);

  const patchWave = (p: Partial<TextureParams["wave"]>) =>
    setTexture((t) => ({ ...t, wave: { ...t.wave, ...p } }));
  const patchHover = (p: Partial<TextureParams["hover"]>) =>
    setTexture((t) => ({ ...t, hover: { ...t.hover, ...p } }));

  const copySettings = async () => {
    const settings = { grain, texture: textureOn ? texture : null, cardGlow: glow };
    await navigator.clipboard.writeText(JSON.stringify(settings, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen">
      {/* Grain opacity override — production body::before has no opacity knob */}
      <style>{`body::before { opacity: ${grain.enabled ? grain.opacity : 0}; }`}</style>

      {textureOn && <BackgroundTexture params={texture} />}

      {/* Preview canvas */}
      <main className="relative z-10 mr-[336px] px-10 py-24 max-w-[880px]">
        <p
          className="mb-1"
          style={{ fontSize: "11px", color: "var(--color-fg-tertiary)", letterSpacing: "0.08em", textTransform: "uppercase" }}
        >
          Dev · Effects Lab
        </p>
        <h1
          className="tracking-tight"
          style={{ fontWeight: 600, fontSize: "28px", color: "var(--color-fg)" }}
        >
          Restored effects preview
        </h1>
        <p className="mt-3 max-w-[560px]" style={{ fontSize: "14px", lineHeight: 1.6, color: "var(--color-fg-secondary)" }}>
          The Perlin dot grid runs behind this page, the paper grain sits over the
          background, and the sample cards below carry the cursor-tracking rim glow.
          Move the mouse around, tune the panel, then copy the settings when it feels right.
          Nothing here touches the live pages.
        </p>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {SAMPLE_CARDS.map((card) => (
            <GlowCard key={card.title} {...card} params={glow} />
          ))}
        </div>
      </main>

      {/* Control panel */}
      {/* z-[140] clears the fixed SiteHeader (z-[130]) */}
      <div className="fixed top-0 right-0 h-screen w-[320px] bg-[#1e1e2f] border-l border-white/10 overflow-y-auto z-[140]">
        <div className="p-4 border-b border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <SectionTitle>Paper grain</SectionTitle>
            <Toggle label={grain.enabled ? "On" : "Off"} value={grain.enabled} onChange={(v) => setGrain({ ...grain, enabled: v })} />
          </div>
          <Slider label="Opacity" value={grain.opacity} min={0} max={1} step={0.05} onChange={(v) => setGrain({ ...grain, opacity: v })} />
          <Slider label="Frequency" value={grain.frequency} min={0.1} max={2} step={0.05} onChange={(v) => setGrain({ ...grain, frequency: v })} />
          <Slider label="Strength" value={grain.strength} min={0} max={0.6} step={0.01} onChange={(v) => setGrain({ ...grain, strength: v })} />
        </div>

        <div className="p-4 border-b border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <SectionTitle>Dot grid — wave</SectionTitle>
            <Toggle label={textureOn ? "On" : "Off"} value={textureOn} onChange={setTextureOn} />
          </div>
          <Slider label="Spacing" value={texture.wave.gridSpacing} min={4} max={32} step={1} onChange={(v) => patchWave({ gridSpacing: v })} />
          <Slider label="Dot size" value={texture.wave.dotSize} min={0.25} max={3} step={0.25} onChange={(v) => patchWave({ dotSize: v })} />
          <Slider label="Base opac" value={texture.wave.dotOpacity} min={0} max={0.5} step={0.01} onChange={(v) => patchWave({ dotOpacity: v })} />
          <Slider label="Max opac" value={texture.wave.opacityMax} min={0} max={1} step={0.01} onChange={(v) => patchWave({ opacityMax: v })} />
          <Slider label="Speed" value={texture.wave.speed} min={0} max={0.05} step={0.001} onChange={(v) => patchWave({ speed: v })} />
          <Slider label="Threshold" value={texture.wave.threshold} min={0} max={0.9} step={0.01} onChange={(v) => patchWave({ threshold: v })} />
          <Slider label="Intensity" value={texture.wave.intensityMax} min={0} max={1} step={0.05} onChange={(v) => patchWave({ intensityMax: v })} />
          <Slider label="Noise scale" value={texture.wave.noiseScale} min={0.0005} max={0.01} step={0.0005} onChange={(v) => patchWave({ noiseScale: v })} />
          <Slider label="Growth" value={texture.wave.dotGrowth} min={0} max={5} step={0.1} onChange={(v) => patchWave({ dotGrowth: v })} />
          <div>
            <label className="text-[11px] text-gray-400 uppercase tracking-wider block mb-1">Shape</label>
            <div className="flex gap-1 flex-wrap">
              {(["circle", "square", "diamond", "cross", "line"] as DotShape[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setTexture((t) => ({ ...t, shape: { ...t.shape, type: s } }))}
                  className={`px-2.5 py-1 text-xs rounded capitalize transition-colors ${
                    texture.shape.type === s ? "bg-blue-500 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-white/10 space-y-3">
          <SectionTitle>Dot grid — cursor</SectionTitle>
          <Slider label="Radius" value={texture.hover.radius} min={0} max={500} step={10} onChange={(v) => patchHover({ radius: v })} />
          <Slider label="Growth" value={texture.hover.dotGrowth} min={0} max={5} step={0.1} onChange={(v) => patchHover({ dotGrowth: v })} />
          <Slider label="Color blend" value={texture.hover.colorBlend} min={0} max={1} step={0.05} onChange={(v) => patchHover({ colorBlend: v })} />
          <Slider label="Max opac" value={texture.hover.opacityMax} min={0} max={1} step={0.01} onChange={(v) => patchHover({ opacityMax: v })} />
          <Slider label="Falloff" value={texture.hover.falloffPower} min={0.5} max={4} step={0.1} onChange={(v) => patchHover({ falloffPower: v })} />
        </div>

        <div className="p-4 border-b border-white/10 space-y-3">
          <SectionTitle>Card rim glow</SectionTitle>
          <Slider label="Radius" value={glow.radius} min={50} max={500} step={10} onChange={(v) => setGlow({ ...glow, radius: v })} />
          <Slider label="Rim opac" value={glow.rimOpacity} min={0} max={1} step={0.05} onChange={(v) => setGlow({ ...glow, rimOpacity: v })} />
          <Slider label="Inner opac" value={glow.innerOpacity} min={0} max={0.3} step={0.01} onChange={(v) => setGlow({ ...glow, innerOpacity: v })} />
          <Slider label="Falloff %" value={glow.falloff} min={30} max={100} step={5} onChange={(v) => setGlow({ ...glow, falloff: v })} />
          <Slider label="Hover scale" value={glow.hoverScale} min={1} max={1.05} step={0.005} onChange={(v) => setGlow({ ...glow, hoverScale: v })} />
        </div>

        <div className="p-4">
          <button
            onClick={copySettings}
            className="w-full px-3 py-2 text-xs rounded bg-blue-500 text-white hover:bg-blue-400 transition-colors"
          >
            {copied ? "Copied ✓" : "Copy settings JSON"}
          </button>
          <p className="mt-2 text-[11px] text-gray-500 leading-relaxed">
            Paste the JSON back to Claude to apply these values to the live site.
          </p>
        </div>
      </div>
    </div>
  );
}
