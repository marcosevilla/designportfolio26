/**
 * Copy for the outlet-details specimen, transcribed verbatim from Figma
 * frame 57:8145 (Canary Polished Visuals) — except the preview email,
 * which the frame left as another property's address (Marco's ruling,
 * 2026-08-04: fix to match the Lodge).
 */

/** The sentence the demo types. Field starts without it; typing it lands the
 *  description at exactly the frame's 186/500. */
export const TYPED_SENTENCE =
  " Complimentary breakfast included with your stay.";

export const BASE_DESCRIPTION =
  "Farm-to-table dining in the heart of the lodge. Serving breakfast, lunch, and dinner with locally sourced ingredients and seasonal menus.";

export const FULL_DESCRIPTION = BASE_DESCRIPTION + TYPED_SENTENCE;

export const OUTLET = {
  title: "The Lodge Restaurant",
  type: "Restaurant",
  address: "Main Lodge, Ground Floor",
  website: "http://example.com",
  phone: "+1 (555) 234-5678",
};

export const PREVIEW = {
  cta: "Order Food",
  email: "dining@thelodgeresort.com",
  language: "English",
  legal: "Privacy Policy • Terms & Conditions",
  poweredBy: "Powered by Canary Technologies",
  noImage: "No image available",
};

export const DESCRIPTION_MAX = 500;

/** Reused cart-specimen asset (900×460) — the "uploaded" photo. */
export const HERO_SRC = "/images/fb-ordering/specimen/info-hero.webp";
