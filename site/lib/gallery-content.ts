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
      /** Specimen-system prototype (2026-07-15): render the video inside
       *  a DeviceShell on the themed card canvas instead of full-bleed.
       *  "phone" masks to a portrait device, "browser" to a window with
       *  chrome. Fixes recordings whose baked-in backgrounds fight the
       *  color themes. */
      shell?: "phone" | "browser";
      /** Scale applied to the video inside the shell (object-fit: cover,
       *  centered). Use >1 to crop away baked-in margins around the UI
       *  in the source recording. Default 1. */
      zoom?: number;
    }
  | {
      layers: {
        /** Background image — fills the frame edge-to-edge. Optional
         *  since 2026-07-15: the card renderer skips it anyway (the
         *  themed canvas is the backdrop), so mock-only entries can
         *  omit it. */
        bg?: string;
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
      video: "/videos/fb-guest-ordering.mp4",
      aspect: "4 / 3",
      // Screen-only export at the phone's native 430:932 ratio — no baked
      // canvas margins, so the shell mask needs no zoom crop.
      shell: "phone",
    },
    {
      layers: {
        bg: "/images/gallery/fb-ordering/food-bg-2.png",
        ui: "/images/gallery/fb-ordering/mobile-guest-mock.png",
        uiHeight: "92%",
        parallax: "bottom",
        uiBorderRadius: "16px",
        uiShadow:
          "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.04)) drop-shadow(0 8px 20px rgba(0, 0, 0, 0.05)) drop-shadow(0 20px 40px rgba(0, 0, 0, 0.04))",
      },
    },
  ],
  compendium: [
    // Replaced the previous layered composite (lifestyle bg + mobile
    // mock) with a high-quality dashboard video. Source 1716x1080 @
    // 4.9 Mbps, stream-copied with +faststart for web streaming.
    {
      video: "/videos/guest-experience-dash.mp4",
      aspect: "16 / 10",
      // Specimen prototype: the recording composes its own navy scene;
      // the browser shell + zoom crop into the dashboard window so the
      // baked backdrop stops fighting the color themes.
      shell: "browser",
      zoom: 1.32,
    },
  ],
  upsells: [
    // Replaced the hotel-room photo cover (2026-07-15): the themed
    // canvas (teal CARD_TINT wash) is the backdrop, and the Figma mock
    // composite (form builder + guest phone + responses side sheet,
    // node 506-10090) floats on it like the other layered cards.
    {
      layers: {
        ui: "/images/gallery/upsells/upsells-mocks.png",
        uiWidth: "88%",
        parallax: "bottom",
        uiShadow:
          "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.04)) drop-shadow(0 8px 20px rgba(0, 0, 0, 0.05)) drop-shadow(0 20px 40px rgba(0, 0, 0, 0.04))",
      },
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
          "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.04)) drop-shadow(0 8px 20px rgba(0, 0, 0, 0.05)) drop-shadow(0 20px 40px rgba(0, 0, 0, 0.04))",
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
          "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.04)) drop-shadow(0 8px 20px rgba(0, 0, 0, 0.05)) drop-shadow(0 20px 40px rgba(0, 0, 0, 0.04))",
      },
    },
  ],
  "design-system": [],
  "ai-workflow": [],
};
