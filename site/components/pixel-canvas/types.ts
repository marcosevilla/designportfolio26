// site/components/pixel-canvas/types.ts

export type Palette = {
  accent: string;      // rgb() string from --color-accent
  accentSoft: string;  // rgb() blend of accent toward bg at 55%
  fgTertiary: string;  // rgb() from --color-fg-tertiary
  bg: string;          // rgb() from --color-bg
};

export type FrameCtx = {
  t: number;              // seconds since mount, paused when off-screen / reduced-motion scaled
  dt: number;             // seconds since last frame, clamped to ≤ 1/30
  palette: Palette;
  reducedMotion: boolean;
  width: number;          // logical canvas width (not CSS px)
  height: number;         // logical canvas height
};

export type Scene<TState = unknown> = {
  id: string;
  init(config: { width: number; height: number; seed?: number }): TState;
  draw(ctx: CanvasRenderingContext2D, state: TState, frame: FrameCtx): void;
};
