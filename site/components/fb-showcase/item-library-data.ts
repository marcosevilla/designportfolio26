/**
 * Data for the Item Library specimen (specimen #3).
 *
 * DELIBERATE DEVIATION from Figma frame 56:6548 (Marco's call, 2026-08-04):
 * rows are the guest cart specimen's izakaya menu — same restaurant as the
 * FnbCartSpecimen, reusing its committed webp thumbnails — not the frame's
 * Burrito/Brownie seed list. POS codes follow the frame's MI-xxxxx pattern;
 * most rows show "—" like the source data (only a handful carry codes).
 */

const IMG = "/images/fb-ordering/specimen";

export type LibraryItem = {
  id: string;
  name: string;
  image: string;
  posCode: string | null;
  menus: string[];
  price: number;
};

export const LIBRARY_ITEMS: LibraryItem[] = [
  { id: "yellowtail", name: "Yellowtail Sashimi Jalapeno", image: `${IMG}/yellowtail.webp`, posCode: "MI-10201", menus: ["Dinner", "Happy hour"], price: 36 },
  { id: "toro", name: "Bigeye and Bluefin Toro Tartare with Caviar", image: `${IMG}/toro-tartare.webp`, posCode: "MI-10304", menus: ["Dinner"], price: 44 },
  { id: "oysters", name: "Fresh Oysters (3pc)", image: `${IMG}/oysters.webp`, posCode: null, menus: ["Dinner", "Happy hour"], price: 19 },
  { id: "edamame", name: "Edamame with Yuzu Salt", image: `${IMG}/edamame.webp`, posCode: null, menus: ["Lunch", "Dinner", "Happy hour", "Late night"], price: 12 },
  { id: "tempura", name: "Rock Shrimp Tempura", image: `${IMG}/shrimp-tempura.webp`, posCode: "MI-10407", menus: ["Lunch", "Dinner"], price: 28 },
  { id: "black-cod", name: "Miso Marinated Black Cod", image: `${IMG}/black-cod.webp`, posCode: "MI-10502", menus: ["Dinner"], price: 52 },
  { id: "wagyu-burger", name: "Wagyu Burger with Truffle Fries", image: `${IMG}/wagyu-burger.webp`, posCode: null, menus: ["Lunch", "Dinner", "Late night"], price: 39 },
  { id: "sparkling", name: "Sparkling Water (750ml)", image: `${IMG}/sparkling-water.webp`, posCode: null, menus: ["Breakfast", "Lunch", "Dinner"], price: 9 },
];

export const LIBRARY_TABS = ["Menus", "Item library", "Settings"];

/** "Lunch, Dinner" · "Lunch, Dinner, + 2 more" — the frame shows max two names. */
export function formatMenus(menus: string[]): string {
  if (menus.length <= 2) return menus.join(", ");
  return `${menus[0]}, ${menus[1]}, + ${menus.length - 2} more`;
}
