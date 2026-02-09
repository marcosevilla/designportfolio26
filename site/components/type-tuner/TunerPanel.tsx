"use client";

import { useCallback } from "react";
import type { TypeLayer } from "./types";
import {
  FONT_OPTIONS,
  COLOR_PRESETS,
  createLayer,
  getWeightsForFont,
  fontHasItalic,
} from "./types";

interface TunerPanelProps {
  layers: TypeLayer[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onUpdate: (id: string, patch: Partial<TypeLayer>) => void;
  onAdd: (layer: TypeLayer) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[11px] text-gray-400 w-[70px] flex-shrink-0 uppercase tracking-wider">
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
        className="w-[60px] bg-[#2a2a3e] text-white text-xs text-right px-2 py-1 rounded border border-white/10 tabular-nums"
      />
      {unit && <span className="text-[10px] text-gray-500 w-[20px]">{unit}</span>}
    </div>
  );
}

export default function TunerPanel({
  layers,
  selectedId,
  onSelect,
  onUpdate,
  onAdd,
  onDelete,
  onMoveUp,
  onMoveDown,
}: TunerPanelProps) {
  const selected = layers.find((l) => l.id === selectedId);
  const weights = selected ? getWeightsForFont(selected.fontFamily) : [];
  const hasItalic = selected ? fontHasItalic(selected.fontFamily) : false;
  const selectedIdx = layers.findIndex((l) => l.id === selectedId);

  const patch = useCallback(
    (p: Partial<TypeLayer>) => {
      if (selectedId) onUpdate(selectedId, p);
    },
    [selectedId, onUpdate]
  );

  return (
    <div className="w-[320px] bg-[#1e1e2f] border-l border-white/10 overflow-y-auto flex flex-col">
      {/* Layer list */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-medium text-gray-300 uppercase tracking-wider">
            Layers
          </h3>
          <button
            onClick={() => onAdd(createLayer())}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            + Add
          </button>
        </div>
        <div className="space-y-1">
          {layers.map((layer, i) => (
            <button
              key={layer.id}
              onClick={() => onSelect(layer.id)}
              className={`w-full text-left px-3 py-2 rounded text-sm truncate transition-colors ${
                layer.id === selectedId
                  ? "bg-blue-500/20 text-blue-300"
                  : "text-gray-400 hover:bg-white/5"
              }`}
            >
              <span className="text-[10px] text-gray-600 mr-2">{i + 1}</span>
              {layer.text}
            </button>
          ))}
        </div>
      </div>

      {/* Properties */}
      {selected ? (
        <div className="p-4 space-y-4 flex-1">
          <h3 className="text-xs font-medium text-gray-300 uppercase tracking-wider">
            Properties
          </h3>

          {/* Font family */}
          <div>
            <label className="text-[11px] text-gray-400 uppercase tracking-wider block mb-1">
              Font
            </label>
            <select
              value={selected.fontFamily}
              onChange={(e) => {
                const newWeights = getWeightsForFont(e.target.value);
                const closestWeight = newWeights.reduce((prev, curr) =>
                  Math.abs(curr - selected.fontWeight) <
                  Math.abs(prev - selected.fontWeight)
                    ? curr
                    : prev
                );
                patch({
                  fontFamily: e.target.value,
                  fontWeight: closestWeight,
                  fontStyle: fontHasItalic(e.target.value)
                    ? selected.fontStyle
                    : "normal",
                });
              }}
              className="w-full bg-[#2a2a3e] text-white text-sm px-3 py-2 rounded border border-white/10"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {/* Font size */}
          <Slider
            label="Size"
            value={selected.fontSize}
            min={8}
            max={200}
            step={1}
            unit="px"
            onChange={(v) => patch({ fontSize: v })}
          />

          {/* Font weight */}
          <div>
            <label className="text-[11px] text-gray-400 uppercase tracking-wider block mb-1">
              Weight
            </label>
            <div className="flex gap-1 flex-wrap">
              {weights.map((w) => (
                <button
                  key={w}
                  onClick={() => patch({ fontWeight: w })}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    selected.fontWeight === w
                      ? "bg-blue-500 text-white"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Font style */}
          <div className="flex gap-2">
            <button
              onClick={() => patch({ fontStyle: "normal" })}
              className={`flex-1 px-3 py-1.5 text-xs rounded transition-colors ${
                selected.fontStyle === "normal"
                  ? "bg-blue-500 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => patch({ fontStyle: "italic" })}
              disabled={!hasItalic}
              className={`flex-1 px-3 py-1.5 text-xs rounded transition-colors ${
                selected.fontStyle === "italic"
                  ? "bg-blue-500 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              } ${!hasItalic ? "opacity-30 cursor-not-allowed" : ""}`}
            >
              Italic
            </button>
          </div>

          {/* Letter spacing */}
          <Slider
            label="Tracking"
            value={selected.letterSpacing}
            min={-0.1}
            max={0.3}
            step={0.005}
            unit="em"
            onChange={(v) => patch({ letterSpacing: Math.round(v * 1000) / 1000 })}
          />

          {/* Line height */}
          <Slider
            label="Leading"
            value={selected.lineHeight}
            min={0.8}
            max={2.5}
            step={0.05}
            onChange={(v) => patch({ lineHeight: Math.round(v * 100) / 100 })}
          />

          {/* Color */}
          <div>
            <label className="text-[11px] text-gray-400 uppercase tracking-wider block mb-1">
              Color
            </label>
            <div className="flex gap-1.5 flex-wrap mb-2">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  onClick={() => patch({ color: c })}
                  className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                    selected.color === c ? "border-blue-500 scale-110" : "border-white/20"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <input
              type="text"
              value={selected.color}
              onChange={(e) => patch({ color: e.target.value })}
              className="w-full bg-[#2a2a3e] text-white text-xs px-3 py-1.5 rounded border border-white/10 font-mono"
            />
          </div>

          {/* Position X */}
          <Slider
            label="X"
            value={selected.translateX}
            min={-200}
            max={2000}
            step={1}
            unit="px"
            onChange={(v) => patch({ translateX: v })}
          />

          {/* Position Y */}
          <Slider
            label="Y"
            value={selected.translateY}
            min={-200}
            max={2000}
            step={1}
            unit="px"
            onChange={(v) => patch({ translateY: v })}
          />

          {/* Text align */}
          <div>
            <label className="text-[11px] text-gray-400 uppercase tracking-wider block mb-1">
              Align
            </label>
            <div className="flex gap-1">
              {(["left", "center", "right"] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => patch({ textAlign: a })}
                  className={`flex-1 px-3 py-1.5 text-xs rounded capitalize transition-colors ${
                    selected.textAlign === a
                      ? "bg-blue-500 text-white"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Opacity */}
          <Slider
            label="Opacity"
            value={selected.opacity}
            min={0}
            max={1}
            step={0.05}
            onChange={(v) => patch({ opacity: Math.round(v * 100) / 100 })}
          />

          {/* Layer actions */}
          <div className="pt-4 border-t border-white/10 flex gap-2">
            <button
              onClick={() => onMoveUp(selected.id)}
              disabled={selectedIdx <= 0}
              className="px-3 py-1.5 text-xs bg-white/5 text-gray-400 rounded hover:bg-white/10 disabled:opacity-30"
            >
              Move Up
            </button>
            <button
              onClick={() => onMoveDown(selected.id)}
              disabled={selectedIdx >= layers.length - 1}
              className="px-3 py-1.5 text-xs bg-white/5 text-gray-400 rounded hover:bg-white/10 disabled:opacity-30"
            >
              Move Down
            </button>
            <button
              onClick={() => onDelete(selected.id)}
              className="px-3 py-1.5 text-xs bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 ml-auto"
            >
              Delete
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 flex-1 flex items-center justify-center">
          <p className="text-gray-600 text-sm text-center">
            Select a layer to edit its properties
          </p>
        </div>
      )}
    </div>
  );
}
