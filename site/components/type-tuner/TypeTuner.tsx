"use client";

import { useState, useCallback, useEffect } from "react";
import type { TypeLayer } from "./types";
import { createLayer, generateCode } from "./types";
import TunerCanvas from "./TunerCanvas";
import TunerPanel from "./TunerPanel";

const STORAGE_KEY = "type-lab-layers";

function loadLayers(): TypeLayer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

function saveLayers(layers: TypeLayer[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layers));
  } catch {
    // ignore
  }
}

export default function TypeTuner() {
  const [layers, setLayers] = useState<TypeLayer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [bg, setBg] = useState<"dark" | "light" | "checker">("dark");
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setLayers(loadLayers());
    setMounted(true);
  }, []);

  // Persist on every change (after mount)
  useEffect(() => {
    if (mounted) saveLayers(layers);
  }, [layers, mounted]);

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id || null);
  }, []);

  const handleUpdate = useCallback((id: string, patch: Partial<TypeLayer>) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...patch } : l))
    );
  }, []);

  const handleTextChange = useCallback((id: string, text: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, text } : l))
    );
  }, []);

  const handleAdd = useCallback((layer: TypeLayer) => {
    setLayers((prev) => {
      const stagger = prev.length * 30;
      return [...prev, { ...layer, translateX: 48 + stagger, translateY: 48 + stagger }];
    });
    setSelectedId(layer.id);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      setLayers((prev) => prev.filter((l) => l.id !== id));
      if (selectedId === id) setSelectedId(null);
    },
    [selectedId]
  );

  const handleMoveUp = useCallback((id: string) => {
    setLayers((prev) => {
      const idx = prev.findIndex((l) => l.id === id);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  }, []);

  const handleMoveDown = useCallback((id: string) => {
    setLayers((prev) => {
      const idx = prev.findIndex((l) => l.id === id);
      if (idx < 0 || idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  }, []);

  const copyCode = useCallback(async () => {
    const code = generateCode(layers);
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select a textarea
      const ta = document.createElement("textarea");
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [layers]);

  const addPreset = useCallback(() => {
    const presetLayers: TypeLayer[] = [
      createLayer({
        text: "The way to pay at",
        fontFamily: '"PP Formula SemiExtended", sans-serif',
        fontSize: 64,
        fontWeight: 700,
        color: "#FFFFFF",
        lineHeight: 1.1,
        letterSpacing: -0.02,
        translateX: 48,
        translateY: 48,
      }),
      createLayer({
        text: "Great",
        fontFamily: '"PP Editorial New", serif',
        fontSize: 80,
        fontWeight: 400,
        fontStyle: "italic",
        color: "#F5D547",
        lineHeight: 1.1,
        translateX: 48,
        translateY: 118,
      }),
      createLayer({
        text: "restaurants",
        fontFamily: '"PP Formula SemiExtended", sans-serif',
        fontSize: 64,
        fontWeight: 700,
        color: "#F5D547",
        lineHeight: 1.1,
        letterSpacing: -0.02,
        translateX: 48,
        translateY: 198,
      }),
      createLayer({
        text: "Always earn rewards, and pay for the check right from the app",
        fontFamily: '"Departure Mono", monospace',
        fontSize: 14,
        fontWeight: 400,
        color: "#FFFFFF",
        opacity: 0.7,
        lineHeight: 1.6,
        letterSpacing: 0.05,
        translateX: 48,
        translateY: 290,
      }),
    ];
    setLayers(presetLayers);
    setSelectedId(presetLayers[0].id);
  }, []);

  if (!mounted) {
    return (
      <div className="h-screen bg-[#14141f] flex items-center justify-center">
        <p className="text-gray-600 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#14141f] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-medium tracking-wide">Type Lab</h1>
          <div className="flex gap-1">
            {(["dark", "light", "checker"] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBg(b)}
                className={`px-2.5 py-1 text-[11px] rounded capitalize transition-colors ${
                  bg === b
                    ? "bg-white/15 text-white"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
          {layers.length === 0 && (
            <button
              onClick={addPreset}
              className="px-3 py-1 text-[11px] rounded bg-white/5 text-gray-400 hover:bg-white/10 transition-colors"
            >
              Load example
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setLayers([]);
              setSelectedId(null);
            }}
            className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Clear all
          </button>
          <button
            onClick={copyCode}
            disabled={layers.length === 0}
            className="px-4 py-1.5 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {copied ? "Copied!" : "Copy Code"}
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 min-h-0">
        <TunerCanvas
          layers={layers}
          selectedId={selectedId}
          onSelect={handleSelect}
          onTextChange={handleTextChange}
          onUpdate={handleUpdate}
          bg={bg}
        />
        <TunerPanel
          layers={layers}
          selectedId={selectedId}
          onSelect={handleSelect}
          onUpdate={handleUpdate}
          onAdd={handleAdd}
          onDelete={handleDelete}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
        />
      </div>
    </div>
  );
}
