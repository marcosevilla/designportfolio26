"use client";

// Dev-only playground for the interactive 3D brand mark (docs/LOGO-LAB-HANDOFF.md):
// Geist * extruded with bevels + MeshTransmissionMaterial, drag-to-tumble with
// inertia. Same panel idiom as /dev/effects-lab. Nothing outside this folder
// changes until settings are promoted for real.

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import {
  DEFAULT_LOGO_PARAMS,
  ENV_PRESETS,
  PIECE_KEYS,
  type EnvPreset,
  type LogoParams,
  type PieceKey,
  type PieceParams,
} from "./params";

const PIECE_LABELS: Record<PieceKey, string> = {
  sparkle: "Sparkle ✦",
  plus: "Plus ˖",
  dot: "Dot",
};

// Client-only: R3F needs the DOM, and this keeps the ~1MB three.js chunk out
// of every other route's JS.
const LogoScene = dynamic(() => import("./LogoScene"), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-full items-center justify-center"
      style={{ color: "var(--color-fg-tertiary)", fontSize: "13px" }}
    >
      Loading three.js…
    </div>
  ),
});

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

export default function LogoLab() {
  const [params, setParams] = useState<LogoParams>(DEFAULT_LOGO_PARAMS);
  const [accentColor, setAccentColor] = useState("#1a1a1a");
  const [copied, setCopied] = useState(false);

  // Resolve the live theme accent to a concrete color three.js can use.
  // (mono theme aliases --color-accent to --color-fg, so this tracks
  // light/dark and any colored theme the palette applies.)
  useEffect(() => {
    const resolve = () => {
      const probe = document.createElement("div");
      probe.style.color = "var(--color-accent)";
      probe.style.display = "none";
      document.body.appendChild(probe);
      setAccentColor(getComputedStyle(probe).color);
      probe.remove();
    };
    resolve();
    const observer = new MutationObserver(resolve);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  const patch = <K extends keyof LogoParams>(
    key: K,
    p: Partial<LogoParams[K]>
  ) => setParams((prev) => ({ ...prev, [key]: { ...prev[key], ...p } }));

  const patchPiece = (key: PieceKey, p: Partial<PieceParams>) =>
    setParams((prev) => ({
      ...prev,
      pieces: { ...prev.pieces, [key]: { ...prev.pieces[key], ...p } },
    }));

  const copySettings = async () => {
    await navigator.clipboard.writeText(JSON.stringify(params, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const m = params.material;

  return (
    <div className="min-h-screen">
      {/* Preview canvas */}
      <main className="relative z-10 mr-[336px] px-10 pt-24 pb-10">
        <p
          className="mb-1"
          style={{ fontSize: "11px", color: "var(--color-fg-tertiary)", letterSpacing: "0.08em", textTransform: "uppercase" }}
        >
          Dev · Logo Lab
        </p>
        <h1
          className="tracking-tight"
          style={{ fontWeight: 600, fontSize: "28px", color: "var(--color-fg)" }}
        >
          Interactive 3D mark
        </h1>
        <p className="mt-3 max-w-[560px]" style={{ fontSize: "14px", lineHeight: 1.6, color: "var(--color-fg-secondary)" }}>
          The ✦ ˖ sparkle mark extruded and beveled, wearing a transmission material.
          Drag it to tumble — flick and it keeps spinning, then settles. Tune
          the panel, then copy the settings when it feels right. Nothing here
          touches the live pages.
        </p>

        <div
          className="mt-10 h-[62vh] min-h-[420px]"
          style={{ border: "1px solid var(--color-border)" }}
        >
          <LogoScene params={params} accentColor={accentColor} />
        </div>
      </main>

      {/* Control panel */}
      {/* z-[140] clears the fixed SiteHeader (z-[130]) */}
      <div className="fixed top-0 right-0 h-screen w-[320px] bg-[#1e1e2f] border-l border-white/10 overflow-y-auto z-[140]">
        <div className="p-4 border-b border-white/10 space-y-3">
          <SectionTitle>Composition</SectionTitle>
          <Slider label="Scale" value={params.shape.scale} min={0.04} max={0.24} step={0.005} onChange={(v) => patch("shape", { scale: v })} />
        </div>

        {PIECE_KEYS.map((key) => {
          const p = params.pieces[key];
          return (
            <div key={key} className="p-4 border-b border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <SectionTitle>{PIECE_LABELS[key]}</SectionTitle>
                <Toggle label={p.enabled ? "On" : "Off"} value={p.enabled} onChange={(v) => patchPiece(key, { enabled: v })} />
              </div>
              {p.enabled && (
                <>
                  <Slider label="Depth" value={p.depth} min={0.5} max={24} step={0.5} onChange={(v) => patchPiece(key, { depth: v })} />
                  <Slider label="Bevel thick" value={p.bevelThickness} min={0} max={3} step={0.05} onChange={(v) => patchPiece(key, { bevelThickness: v })} />
                  <Slider label="Bevel size" value={p.bevelSize} min={0} max={3} step={0.05} onChange={(v) => patchPiece(key, { bevelSize: v })} />
                  <Slider label="Bevel segs" value={p.bevelSegments} min={1} max={16} step={1} onChange={(v) => patchPiece(key, { bevelSegments: v })} />
                  <Slider label="Size" value={p.size} min={0.2} max={3} step={0.05} onChange={(v) => patchPiece(key, { size: v })} />
                  <Slider label="Rotate °" value={p.rotation} min={-180} max={180} step={5} onChange={(v) => patchPiece(key, { rotation: v })} />
                  <Slider label="Offset X" value={p.offsetX} min={-12} max={12} step={0.25} onChange={(v) => patchPiece(key, { offsetX: v })} />
                  <Slider label="Offset Y" value={p.offsetY} min={-12} max={12} step={0.25} onChange={(v) => patchPiece(key, { offsetY: v })} />
                  <Slider label="Offset Z" value={p.offsetZ} min={-12} max={12} step={0.25} onChange={(v) => patchPiece(key, { offsetZ: v })} />
                </>
              )}
            </div>
          );
        })}

        <div className="p-4 border-b border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <SectionTitle>Material</SectionTitle>
            <Toggle label="Backside" value={m.backside} onChange={(v) => patch("material", { backside: v })} />
          </div>
          <Slider label="Transmission" value={m.transmission} min={0} max={1} step={0.01} onChange={(v) => patch("material", { transmission: v })} />
          <Slider label="Thickness" value={m.thickness} min={0} max={5} step={0.1} onChange={(v) => patch("material", { thickness: v })} />
          <Slider label="Roughness" value={m.roughness} min={0} max={1} step={0.01} onChange={(v) => patch("material", { roughness: v })} />
          <Slider label="Clearcoat" value={m.clearcoat} min={0} max={1} step={0.05} onChange={(v) => patch("material", { clearcoat: v })} />
          <Slider label="CC rough" value={m.clearcoatRoughness} min={0} max={1} step={0.05} onChange={(v) => patch("material", { clearcoatRoughness: v })} />
          <Slider label="Chroma AB" value={m.chromaticAberration} min={0} max={0.5} step={0.01} onChange={(v) => patch("material", { chromaticAberration: v })} />
          <Slider label="IOR" value={m.ior} min={1} max={2.4} step={0.05} onChange={(v) => patch("material", { ior: v })} />
          <Slider label="Env intens" value={m.envMapIntensity} min={0} max={3} step={0.1} onChange={(v) => patch("material", { envMapIntensity: v })} />
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-gray-400 w-[80px] shrink-0 uppercase tracking-wider">Color</label>
            <Toggle label="Theme accent" value={m.colorMode === "accent"} onChange={(v) => patch("material", { colorMode: v ? "accent" : "custom" })} />
            <input
              type="color"
              value={m.customColor}
              onChange={(e) => patch("material", { colorMode: "custom", customColor: e.target.value })}
              className="h-6 w-10 shrink-0 cursor-pointer rounded-sm border border-white/10 bg-transparent"
            />
          </div>
        </div>

        <div className="p-4 border-b border-white/10 space-y-3">
          <SectionTitle>Environment</SectionTitle>
          <div className="flex gap-1 flex-wrap">
            {ENV_PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => patch("env", { preset: p as EnvPreset })}
                className={`px-2.5 py-1 text-xs rounded capitalize transition-colors ${
                  params.env.preset === p ? "bg-blue-500 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <Slider label="Ambient" value={params.env.ambient} min={0} max={2} step={0.05} onChange={(v) => patch("env", { ambient: v })} />
          <Slider label="Spot" value={params.env.spot} min={0} max={8} step={0.1} onChange={(v) => patch("env", { spot: v })} />
        </div>

        <div className="p-4 border-b border-white/10 space-y-3">
          <SectionTitle>Shadow</SectionTitle>
          <Slider label="Opacity" value={params.shadow.opacity} min={0} max={1} step={0.05} onChange={(v) => patch("shadow", { opacity: v })} />
          <Slider label="Blur" value={params.shadow.blur} min={0} max={6} step={0.1} onChange={(v) => patch("shadow", { blur: v })} />
        </div>

        <div className="p-4 border-b border-white/10 space-y-3">
          <SectionTitle>Motion</SectionTitle>
          <Slider label="Sensitivity" value={params.motion.sensitivity} min={0.001} max={0.02} step={0.001} onChange={(v) => patch("motion", { sensitivity: v })} />
          <Slider label="Friction" value={params.motion.friction} min={0.2} max={6} step={0.1} onChange={(v) => patch("motion", { friction: v })} />
          <Slider label="Idle spin" value={params.motion.idleSpin} min={0} max={1} step={0.05} onChange={(v) => patch("motion", { idleSpin: v })} />
        </div>

        <div className="p-4">
          <button
            onClick={copySettings}
            className="w-full px-3 py-2 text-xs rounded bg-blue-500 text-white hover:bg-blue-400 transition-colors"
          >
            {copied ? "Copied ✓" : "Copy settings JSON"}
          </button>
          <p className="mt-2 text-[11px] text-gray-500 leading-relaxed">
            Paste the JSON back to Claude to bake these values in.
          </p>
        </div>
      </div>
    </div>
  );
}
