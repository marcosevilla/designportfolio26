"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { TypeLayer } from "./types";

interface TunerCanvasProps {
  layers: TypeLayer[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onTextChange: (id: string, text: string) => void;
  onUpdate: (id: string, patch: Partial<TypeLayer>) => void;
  bg: "dark" | "light" | "checker";
}

const BG_STYLES: Record<TunerCanvasProps["bg"], string> = {
  dark: "bg-[#1a1a2e]",
  light: "bg-white",
  checker:
    "bg-[length:20px_20px] bg-[image:linear-gradient(45deg,#ccc_25%,transparent_25%),linear-gradient(-45deg,#ccc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ccc_75%),linear-gradient(-45deg,transparent_75%,#ccc_75%)] bg-[position:0_0,0_10px,10px_-10px,-10px_0]",
};

export default function TunerCanvas({
  layers,
  selectedId,
  onSelect,
  onTextChange,
  onUpdate,
  bg,
}: TunerCanvasProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const dragRef = useRef<{
    layerId: string;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    hasMoved: boolean;
  } | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      if (!dragRef.current.hasMoved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
        dragRef.current.hasMoved = true;
      }
      if (dragRef.current.hasMoved) {
        onUpdate(dragRef.current.layerId, {
          translateX: Math.round(dragRef.current.originX + dx),
          translateY: Math.round(dragRef.current.originY + dy),
        });
      }
    };

    const handleMouseUp = () => {
      dragRef.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [onUpdate]);

  const handleLayerMouseDown = useCallback(
    (e: React.MouseEvent, layer: TypeLayer) => {
      if (editingId === layer.id) return;
      e.preventDefault();
      onSelect(layer.id);
      dragRef.current = {
        layerId: layer.id,
        startX: e.clientX,
        startY: e.clientY,
        originX: layer.translateX,
        originY: layer.translateY,
        hasMoved: false,
      };
    },
    [editingId, onSelect]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent, layerId: string) => {
      e.stopPropagation();
      setEditingId(layerId);
    },
    []
  );

  return (
    <div
      className={`flex-1 min-h-[400px] overflow-hidden relative ${BG_STYLES[bg]}`}
      onClick={() => {
        onSelect("");
        setEditingId(null);
      }}
    >
      {layers.map((layer) => {
        const isSelected = layer.id === selectedId;
        const isEditing = layer.id === editingId;
        return (
          <div
            key={layer.id}
            className={`absolute select-none ${
              isEditing ? "cursor-text" : "cursor-grab active:cursor-grabbing"
            } ${
              isSelected
                ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent rounded"
                : ""
            }`}
            style={{
              left: layer.translateX,
              top: layer.translateY,
              fontFamily: layer.fontFamily,
              fontSize: `${layer.fontSize}px`,
              fontWeight: layer.fontWeight,
              fontStyle: layer.fontStyle,
              letterSpacing: `${layer.letterSpacing}em`,
              lineHeight: layer.lineHeight,
              color: layer.color,
              textAlign: layer.textAlign,
              opacity: layer.opacity,
            }}
            onMouseDown={(e) => handleLayerMouseDown(e, layer)}
            onDoubleClick={(e) => handleDoubleClick(e, layer.id)}
            onClick={(e) => e.stopPropagation()}
          >
            {isEditing ? (
              <span
                contentEditable
                suppressContentEditableWarning
                spellCheck={false}
                className="outline-none cursor-text"
                ref={(el) => {
                  if (el) {
                    el.focus();
                    const range = document.createRange();
                    range.selectNodeContents(el);
                    range.collapse(false);
                    const sel = window.getSelection();
                    sel?.removeAllRanges();
                    sel?.addRange(range);
                  }
                }}
                onBlur={(e) => {
                  const text = e.currentTarget.textContent || "";
                  if (text !== layer.text) onTextChange(layer.id, text);
                  setEditingId(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    (e.target as HTMLElement).blur();
                  }
                }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {layer.text}
              </span>
            ) : (
              <span className="pointer-events-none">{layer.text}</span>
            )}
          </div>
        );
      })}
      {layers.length === 0 && (
        <p className="text-gray-500 text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          Add a text layer to get started
        </p>
      )}
    </div>
  );
}
