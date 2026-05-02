/** User-selectable visualizer scenes. Each is a self-contained behavior
 *  preset; only one can be active at a time. The "wavelength" preset
 *  bundles the oscilloscope waveform with the bass-reactive sparkle field
 *  as a single combined effect. */
export type VisualizerScene =
  | "waveform"     // wavelength — oscilloscope + bass-reactive sparkles
  | "chladni"      // nodal sand plate — sound sculpts geometric patterns
  | "feedback"     // last frame is rotated/zoomed/decayed and re-drawn — trails
  | "lissajous";   // parametric curve trace, dots glow near the curve

export type SceneMeta = {
  id: VisualizerScene;
  label: string;
  hint: string;
};

export const SCENES: SceneMeta[] = [
  { id: "waveform",   label: "Wavelength", hint: "Oscilloscope + bass-reactive sparkles" },
  { id: "chladni",    label: "Chladni",    hint: "Nodal sand plate" },
  { id: "feedback",   label: "Feedback",   hint: "Trails and warps" },
  { id: "lissajous",  label: "Lissajous",  hint: "Parametric curve trace" },
];

export const DEFAULT_SCENE: VisualizerScene = "waveform";
