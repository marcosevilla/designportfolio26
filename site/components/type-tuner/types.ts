export interface TypeLayer {
  id: string;
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: "normal" | "italic";
  letterSpacing: number;
  lineHeight: number;
  color: string;
  translateY: number;
  translateX: number;
  textAlign: "left" | "center" | "right";
  opacity: number;
}

export interface FontOption {
  label: string;
  value: string;
  weights: number[];
  hasItalic?: boolean;
}

export const FONT_OPTIONS: FontOption[] = [
  { label: "PP Formula SemiExtended", value: '"PP Formula SemiExtended", sans-serif', weights: [700] },
  { label: "PP Formula", value: '"PP Formula", sans-serif', weights: [800] },
  { label: "PP Editorial New", value: '"PP Editorial New", serif', weights: [200, 400], hasItalic: true },
  { label: "GT Cinetype", value: '"GT Cinetype", sans-serif', weights: [300, 400, 700] },
  { label: "Departure Mono", value: '"Departure Mono", monospace', weights: [400] },
  { label: "Instrument Serif", value: "var(--font-instrument-serif), serif", weights: [400] },
  { label: "Instrument Sans", value: "var(--font-instrument-sans), sans-serif", weights: [400, 500, 600, 700] },
  { label: "Geist Sans", value: "var(--font-geist-sans), sans-serif", weights: [400, 500, 600, 700] },
];

export const COLOR_PRESETS = [
  "#FFFFFF",
  "#000000",
  "#F5D547",
  "#EF5A3C",
  "#2563EB",
  "#0D9488",
  "#6366F1",
  "#8B5CF6",
  "#334155",
  "#94A3B8",
];

let layerCounter = 0;

export function createLayer(overrides?: Partial<TypeLayer>): TypeLayer {
  layerCounter++;
  return {
    id: `layer-${Date.now()}-${layerCounter}`,
    text: "New text layer",
    fontFamily: FONT_OPTIONS[0].value,
    fontSize: 48,
    fontWeight: 700,
    fontStyle: "normal",
    letterSpacing: 0,
    lineHeight: 1.15,
    color: "#FFFFFF",
    translateY: 0,
    translateX: 0,
    textAlign: "left",
    opacity: 1,
    ...overrides,
  };
}

export function getWeightsForFont(fontValue: string): number[] {
  const font = FONT_OPTIONS.find((f) => f.value === fontValue);
  return font?.weights ?? [400];
}

export function fontHasItalic(fontValue: string): boolean {
  const font = FONT_OPTIONS.find((f) => f.value === fontValue);
  return font?.hasItalic ?? false;
}

export function generateCode(layers: TypeLayer[]): string {
  const lines = layers.map((layer) => {
    const style: Record<string, string | number> = {
      position: "absolute",
      left: `${layer.translateX}px`,
      top: `${layer.translateY}px`,
      fontFamily: layer.fontFamily,
      fontSize: `${layer.fontSize}px`,
      fontWeight: layer.fontWeight,
      lineHeight: layer.lineHeight,
      color: layer.color,
    };
    if (layer.fontStyle !== "normal") style.fontStyle = layer.fontStyle;
    if (layer.letterSpacing !== 0) style.letterSpacing = `${layer.letterSpacing}em`;
    if (layer.opacity < 1) style.opacity = layer.opacity;
    if (layer.textAlign !== "left") style.textAlign = layer.textAlign;

    const styleStr = Object.entries(style)
      .map(([k, v]) => `    ${k}: ${typeof v === "string" ? `"${v}"` : v},`)
      .join("\n");

    return `  <div style={{\n${styleStr}\n  }}>\n    ${layer.text}\n  </div>`;
  });

  return `<div className="relative">\n${lines.join("\n")}\n</div>`;
}
