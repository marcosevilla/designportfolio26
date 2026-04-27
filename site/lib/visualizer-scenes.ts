/** All available visualizer scenes. Each is an entirely different "system"
 *  layered behavior preset rather than a tweak on the existing one. */
export type VisualizerScene =
  | "spectrum"     // bass disks + concentric frequency rings + sparkles (current)
  | "chladni"      // nodal sand plate — sound sculpts geometric patterns
  | "drumhead"     // 2D wave equation — onsets tap a drum
  | "feedback"     // last frame is rotated/zoomed/decayed and re-drawn — trails
  | "spectrogram"  // time scrolls horizontally; spectrum paints a piano roll
  | "polyrhythm"   // kick/snare/hat onsets each spawn rings from distinct origins
  | "lissajous";   // parametric curve trace, dots glow near the curve

export type SceneMeta = {
  id: VisualizerScene;
  label: string;
  hint: string;
};

export const SCENES: SceneMeta[] = [
  { id: "spectrum",    label: "Spectrum",    hint: "Disks + rings + sparkles" },
  { id: "chladni",     label: "Chladni",     hint: "Nodal sand plate" },
  { id: "drumhead",    label: "Drumhead",    hint: "Wave-equation drumhead" },
  { id: "feedback",    label: "Feedback",    hint: "Trails and warps" },
  { id: "spectrogram", label: "Spectrogram", hint: "Scrolling spectrum history" },
  { id: "polyrhythm",  label: "Polyrhythm",  hint: "Kick / snare / hat rings" },
  { id: "lissajous",   label: "Lissajous",   hint: "Parametric curve trace" },
];

export const DEFAULT_SCENE: VisualizerScene = "spectrum";
