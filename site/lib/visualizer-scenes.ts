/** All available visualizer scenes. Each is an entirely different "system"
 *  layered behavior preset rather than a tweak on the existing one. */
export type VisualizerScene =
  | "waveform"     // oscilloscope — direct audio waveform across the matrix
  | "sparkles"     // bass-reactive variable sparkle field, multi-color
  | "chladni"      // nodal sand plate — sound sculpts geometric patterns
  | "feedback"     // last frame is rotated/zoomed/decayed and re-drawn — trails
  | "lissajous";   // parametric curve trace, dots glow near the curve

export type SceneMeta = {
  id: VisualizerScene;
  label: string;
  hint: string;
};

export const SCENES: SceneMeta[] = [
  { id: "waveform",   label: "Waveform",  hint: "Oscilloscope of the audio signal" },
  { id: "sparkles",   label: "Sparkles",  hint: "Bass-reactive variable sparkle field" },
  { id: "chladni",    label: "Chladni",   hint: "Nodal sand plate" },
  { id: "feedback",   label: "Feedback",  hint: "Trails and warps" },
  { id: "lissajous",  label: "Lissajous", hint: "Parametric curve trace" },
];

export const DEFAULT_SCENE: VisualizerScene = "sparkles";
