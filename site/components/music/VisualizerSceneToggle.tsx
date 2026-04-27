"use client";

import { useVisualizerScene } from "@/lib/VisualizerSceneContext";
import { SCENES, type VisualizerScene } from "@/lib/visualizer-scenes";
import {
  SpectrumSceneIcon,
  ChladniSceneIcon,
  DrumheadSceneIcon,
  FeedbackSceneIcon,
  SpectrogramSceneIcon,
  PolyrhythmSceneIcon,
  LissajousSceneIcon,
} from "@/components/Icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ICONS: Record<VisualizerScene, React.FC<{ size?: number }>> = {
  spectrum: SpectrumSceneIcon,
  chladni: ChladniSceneIcon,
  drumhead: DrumheadSceneIcon,
  feedback: FeedbackSceneIcon,
  spectrogram: SpectrogramSceneIcon,
  polyrhythm: PolyrhythmSceneIcon,
  lissajous: LissajousSceneIcon,
};

export default function VisualizerSceneToggle() {
  const { scene, setScene } = useVisualizerScene();

  return (
    <TooltipProvider delay={150}>
      <div
        className="flex items-center justify-center gap-1"
        role="radiogroup"
        aria-label="Visualizer effect"
      >
        {SCENES.map(({ id, label, hint }) => {
          const Icon = ICONS[id];
          const active = scene === id;
          return (
            <Tooltip key={id}>
              <TooltipTrigger
                render={(props) => (
                  <button
                    {...props}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    aria-label={`${label} — ${hint}`}
                    onClick={() => setScene(id)}
                    className="flex items-center justify-center w-7 h-7 rounded-sm transition-colors cursor-pointer"
                    style={{
                      color: active ? "var(--color-accent)" : "var(--color-fg-tertiary)",
                      backgroundColor: active
                        ? "color-mix(in srgb, var(--color-accent) 8%, transparent)"
                        : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!active)
                        e.currentTarget.style.color = "var(--color-fg-secondary)";
                    }}
                    onMouseLeave={(e) => {
                      if (!active)
                        e.currentTarget.style.color = "var(--color-fg-tertiary)";
                    }}
                  >
                    <Icon size={14} />
                  </button>
                )}
              />
              <TooltipContent side="bottom" sideOffset={6}>
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium leading-tight">{label}</span>
                  <span
                    className="text-[10px] leading-tight"
                    style={{ opacity: 0.7 }}
                  >
                    {hint}
                  </span>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
