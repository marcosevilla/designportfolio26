// Gallery mode image manifest. Each entry is one of:
// - bare string  → single image, "contain" fit (themed backdrop fills any
//   aspect mismatch)
// - { src, fit?, objectPosition? } → single image with crop control
// - { video, poster?, aspect? } → autoplay loop muted video. `aspect`
//   overrides the card frame's default 16/10 (e.g. "4 / 3" for a 1440×1080
//   recording so the clip fills cleanly with no crop or letterbox)
// - { layers: { bg, ui, uiWidth?, uiHeight?, parallax? } } → two-layer
//   composition: a background that fills the frame, plus a UI mock
//   centered in the frame that parallax-slides in from `parallax` (default
//   "bottom") as the slide approaches center
//
// Drop new PNGs into site/public/images/gallery/[slug]/ and append the
// path to the matching array — order in the array is the order they
// appear in the gallery.
export type GallerySlotConfig =
  | string
  | {
      src: string;
      fit?: "contain" | "cover";
      /** Any valid CSS `object-position` value. */
      objectPosition?: string;
    }
  | {
      /** Path under /public — e.g. "/videos/fb-mobile.mp4". Renders an
       *  autoplay loop muted video in the card frame. */
      video: string;
      /** Static frame for the reduced-motion fallback. Optional. */
      poster?: string;
      /** CSS aspect-ratio override for the card frame (defaults to 16/10).
       *  Pass the video's native ratio (e.g. "4 / 3") so the clip fills
       *  cleanly with no crop or letterbox. */
      aspect?: string;
    }
  | {
      layers: {
        /** Background image — fills the frame edge-to-edge. */
        bg: string;
        /** Foreground UI mock — centered at rest, parallax-slides in. */
        ui: string;
        /** UI width as CSS value (e.g. "70%"). Use this for landscape
         *  mocks; let height auto. */
        uiWidth?: string;
        /** UI height as CSS value (e.g. "80%"). Use this for portrait
         *  mocks; let width auto. */
        uiHeight?: string;
        /** Direction the UI slides in from. Default "bottom". */
        parallax?: "left" | "right" | "bottom";
        /** CSS border-radius applied to the UI mock (e.g. for rounding
         *  raw screenshots into iOS-style phone corners). */
        uiBorderRadius?: string;
        /** CSS `filter` value (chain of `drop-shadow(...)` calls)
         *  applied to the UI mock for added depth. drop-shadow is used
         *  instead of box-shadow so the shadow traces the PNG's actual
         *  alpha shape, not its rectangular bounding box (which can
         *  include transparent padding). */
        uiShadow?: string;
      };
    };

export const galleryContent: Record<string, GallerySlotConfig[]> = {
  "fb-ordering": [
    {
      video: "/videos/fb-mobile.mp4",
      aspect: "4 / 3",
    },
    {
      layers: {
        bg: "/images/gallery/fb-ordering/food-bg-2.png",
        ui: "/images/gallery/fb-ordering/mobile-guest-mock.png",
        uiHeight: "92%",
        parallax: "bottom",
        uiBorderRadius: "16px",
        uiShadow:
          "drop-shadow(0 30px 60px rgba(0, 0, 0, 0.30)) drop-shadow(0 12px 24px rgba(0, 0, 0, 0.18))",
      },
    },
  ],
  compendium: [
    {
      layers: {
        bg: "/images/gallery/compendium/guest-experience-app.png",
        ui: "/images/gallery/compendium/guest-experience-mobile.png",
        uiHeight: "92%",
        parallax: "bottom",
        uiBorderRadius: "16px",
        // Soft 3-stop drop-shadow (contact + mid + deep ambient) that
        // lifts the composite off the card fill. Shared verbatim with
        // the check-in card so the two layered cards share one shadow
        // language. Uses filter: drop-shadow so the shadow traces the
        // PNG's alpha shape, not its rectangular bounding box.
        uiShadow:
          "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.05)) drop-shadow(0 12px 28px rgba(0, 0, 0, 0.08)) drop-shadow(0 32px 56px rgba(0, 0, 0, 0.06))",
      },
    },
  ],
  upsells: [
    {
      src: "/images/gallery/upsells/upsells.png",
      fit: "cover",
    },
  ],
  checkin: [
    {
      layers: {
        bg: "/images/gallery/checkin/check-in.png",
        ui: "/images/gallery/checkin/check-in-dash.png",
        uiWidth: "95%",
        parallax: "right",
        uiBorderRadius: "8px",
        // Soft 3-stop drop-shadow (contact + mid + deep ambient) that
        // lifts the composite off the card fill. Shared verbatim with
        // the compendium card so the two layered cards share one shadow
        // language.
        uiShadow:
          "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.05)) drop-shadow(0 12px 28px rgba(0, 0, 0, 0.08)) drop-shadow(0 32px 56px rgba(0, 0, 0, 0.06))",
      },
    },
  ],
  "general-task": [
    {
      layers: {
        // The general-task composite is a single all-in-one PNG (no
        // separate lifestyle photo). bg is intentionally empty —
        // CaseStudyList no longer renders layers.bg, so this slot is
        // unused but kept here to satisfy the layers type.
        bg: "",
        ui: "/images/gallery/general-task/general-task.png",
        uiWidth: "98%",
        parallax: "bottom",
        // Same 3-stop ambient lift used on check-in + compendium so the
        // three layered cards share one shadow language.
        uiShadow:
          "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.05)) drop-shadow(0 12px 28px rgba(0, 0, 0, 0.08)) drop-shadow(0 32px 56px rgba(0, 0, 0, 0.06))",
      },
    },
  ],
  "design-system": [],
  "ai-workflow": [],
};
