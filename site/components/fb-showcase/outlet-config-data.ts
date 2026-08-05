/**
 * Copy + fixture for the outlet-configuration specimen (specimen #5).
 *
 * Transcribed from Figma frame 64:8703 — "F&B / Setup + POS / 01 F&B Ordering
 * Setup (Compendium V2)", section 64:9088 ("5 - outlet configuration") in
 * Canary Polished Visuals.
 *
 * The frame is authored against a "Statler" property; per Marco's ruling
 * (2026-08-04) this specimen reuses specimen #4's fixture instead, so all five
 * F&B demos describe the same hotel and the same outlet. Structural copy —
 * field labels, helper text, fee/tax rows, breakdown math — is verbatim.
 */

import { OUTLET, PREVIEW as DETAILS_PREVIEW, HERO_SRC } from "./outlet-details-data";

export { HERO_SRC };

/** Guest-facing outlet page mirrored in the right-hand preview pane. */
export const PREVIEW = {
  title: OUTLET.title,
  /** Same blurb specimen #4's editor writes — this is the read-only end of it. */
  description:
    "Farm-to-table dining in the heart of the lodge. Serving breakfast, lunch, and dinner with locally sourced ingredients and seasonal menus.",
  phone: OUTLET.phone,
  email: DETAILS_PREVIEW.email,
  website: "Visit website",
  hours: "Open • Closes 05:00 PM",
  language: DETAILS_PREVIEW.language,
  legal: "Privacy Policy · Cookie Settings",
};

/** Translations card. */
export const LANGUAGE = "English · Default";

/**
 * Menus card. The frame ships the empty state ("No menus connected yet.");
 * the connected state is what the demo produces. Item count matches the eight
 * izakaya rows in the item-library specimen so the two demos agree.
 */
export const MENUS = {
  empty: "No menus connected yet.",
  connectLabel: "Connect menus",
  connectedLabel: "Manage menus",
  connected: { name: "Izakaya Dinner", items: 8 },
};

/** Delivery type — the variable the whole product is organised around. */
export type DeliveryTypeId = "in-room" | "alternative";

export const DELIVERY_TYPES: {
  id: DeliveryTypeId;
  label: string;
  hint: string;
}[] = [
  {
    id: "in-room",
    label: "In-room",
    hint: "Orders delivered to a guest room",
  },
  {
    id: "alternative",
    label: "Alternative location",
    hint: "Orders delivered outside of a guest room",
  },
];

/** POS settings — three required selects, all left unset in the frame. */
export const POS_FIELDS = [
  { label: "POS revenue center", placeholder: "Select a revenue center" },
  { label: "POS vendor order type", placeholder: "Select an order type" },
  { label: "POS vendor menu", placeholder: "Select a menu" },
] as const;

/**
 * Taxes and fees. Values are the frame's, and unlike specimen #2's source
 * frame the arithmetic actually closes: 2.5% + 8.88% = 11.38% of the $100
 * subtotal = $11.38, plus $4.00 delivery and $2.45 supplemental = $117.83.
 * The demo edits `amount` on the delivery fee and recomputes from these.
 */
export type Fee = {
  id: string;
  label: string;
  /** Flat dollars, or null when the fee is a percentage. */
  amount: number | null;
  /** Percent of subtotal, or null when the fee is a flat rate. */
  percent: number | null;
  posCharge: string;
  taxable: boolean;
};

export const FEES: Fee[] = [
  {
    id: "delivery",
    label: "Delivery",
    amount: 4,
    percent: null,
    posCharge: "DeliveryChrge",
    taxable: true,
  },
  {
    id: "supplemental",
    label: "Supplemental fee",
    amount: null,
    percent: 2.45,
    posCharge: "SupplementalChrge",
    taxable: true,
  },
];

export type Tax = {
  id: string;
  label: string;
  type: string;
  rate: number;
  applyTo: string;
};

export const TAXES: Tax[] = [
  {
    id: "city",
    label: "City tax",
    type: "Percentage",
    rate: 2.5,
    applyTo: "Subtotal only",
  },
  {
    id: "supplemental",
    label: "Supplemental fee",
    type: "Percentage",
    rate: 8.88,
    applyTo: "Subtotal only",
  },
];

/** The worked example the breakdown card prices out. */
export const EXAMPLE_SUBTOTAL = 100;

export const FEE_COLUMNS = [
  "Fee label",
  "Amount",
  "POS service charge",
  "Taxable?",
] as const;

export const TAX_COLUMNS = ["Tax label", "Type", "Rate", "Apply to"] as const;

export const money = (n: number) =>
  `$${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/** Line items for the price-breakdown card, derived from the tables above. */
export function priceBreakdown(fees: Fee[], taxes: Tax[]) {
  const subtotal = EXAMPLE_SUBTOTAL;
  const salesTax = taxes.reduce((sum, t) => sum + (subtotal * t.rate) / 100, 0);
  const feeLines = fees.map((f) => ({
    id: f.id,
    label: f.label,
    value: f.amount ?? (subtotal * (f.percent ?? 0)) / 100,
  }));
  const total =
    subtotal + salesTax + feeLines.reduce((sum, l) => sum + l.value, 0);
  return {
    rows: [
      { id: "subtotal", label: "Subtotal", value: subtotal },
      { id: "salesTax", label: "Sales tax", value: salesTax },
      ...feeLines,
    ],
    total,
  };
}
