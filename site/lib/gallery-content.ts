// Gallery mode image manifest. Each entry is one of:
// - bare string  → single image, "contain" fit (themed backdrop fills any
//   aspect mismatch)
// - { src, fit?, objectPosition? } → single image with crop control
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
        parallax?: "left" | "bottom";
        /** CSS border-radius applied to the UI mock (e.g. for rounding
         *  raw screenshots into iOS-style phone corners). */
        uiBorderRadius?: string;
        /** CSS box-shadow applied to the UI mock for added depth. */
        uiShadow?: string;
      };
    };

export const galleryContent: Record<string, GallerySlotConfig[]> = {
  "fb-ordering": [
    {
      layers: {
        bg: "/images/gallery/fb-ordering/food-prep-bg.png",
        ui: "/images/gallery/fb-ordering/order-management-mock.png",
        uiWidth: "82%",
        parallax: "left",
      },
    },
    {
      layers: {
        bg: "/images/gallery/fb-ordering/food-bg-2.png",
        ui: "/images/gallery/fb-ordering/mobile-guest-mock.png",
        uiHeight: "92%",
        parallax: "bottom",
        uiBorderRadius: "16px",
        uiShadow:
          "0 30px 60px rgba(0, 0, 0, 0.30), 0 12px 24px rgba(0, 0, 0, 0.18)",
      },
    },
  ],
  compendium: [
    {
      src: "/images/gallery/compendium/guest-experience-app.png",
      fit: "cover",
    },
  ],
  upsells: [],
  checkin: [
    {
      src: "/images/gallery/checkin/check-in.png",
      fit: "cover",
    },
  ],
  "general-task": [],
  "design-system": [],
  "ai-workflow": [],
};
