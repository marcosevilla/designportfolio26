/**
 * F&B cart specimen — menu catalog + cart model.
 *
 * Content mirrors the Unified Cart prototype (msevilla-canary-prototypes,
 * DSN-1828 `unified-cart/data.ts`) with the same Nobu-style lunch menu the
 * Figma mocks show. Two thumbnails were replaced with true-to-item photos
 * (oysters, sparkling water — the prototype reused unrelated stock), and
 * oysters gained a mignonette modifier group so radio modifiers appear
 * across every section. All images are committed local webp.
 */

export interface SpecimenItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  maxQty: number;
  /** Presence of options ⇒ first "+" opens the detail drawer */
  variantPrompt?: string;
  variantOptions?: string[];
}

export interface SpecimenSection {
  id: string;
  title: string;
  items: SpecimenItem[];
}

/** One cart line. Distinct variants of the same item are separate lines. */
export interface CartLine {
  item: SpecimenItem;
  variant?: string;
  qty: number;
  specialRequest?: string;
}

export type Cart = Record<string, CartLine>;

/** Cart key — item + variant identifies a line */
export const lineKey = (itemId: string, variant?: string) =>
  variant ? `${itemId}::${variant}` : itemId;

export const cartCount = (cart: Cart) =>
  Object.values(cart).reduce((sum, l) => sum + l.qty, 0);

export const cartSubtotal = (cart: Cart) =>
  Object.values(cart).reduce((sum, l) => sum + l.item.price * l.qty, 0);

export const formatMoney = (n: number): string =>
  Number.isInteger(n) ? `${n}` : n.toFixed(2);

export const SALES_TAX = 2.5;
export const DELIVERY_FEE = 4.5;
//   keeps "2:30 PM" from orphaning "PM" at specimen width
export const SCHEDULED_DELIVERY = "Tomorrow, Mar 12 at 2:30 PM";
export const NO_CHARGE_COPY =
  "You won't be charged until the hotel approves your requests.";

const IMG = "/images/fb-ordering/specimen";

export const MENU_SECTIONS: SpecimenSection[] = [
  {
    id: "appetizers",
    title: "Appetizers",
    items: [
      {
        id: "yellowtail-sashimi",
        name: "Yellowtail Sashimi Jalapeno",
        description:
          "Thinly sliced yellowtail with jalapeno, yuzu soy and cilantro.",
        price: 36,
        image: `${IMG}/yellowtail.webp`,
        maxQty: 8,
      },
      {
        id: "toro-tartare",
        name: "Bigeye and Bluefin Toro Tartare with Caviar",
        description:
          "Hand-cut bigeye and bluefin toro, osetra caviar, wasabi and dashi soy.",
        price: 44,
        image: `${IMG}/toro-tartare.webp`,
        maxQty: 8,
        variantPrompt: "Select side",
        variantOptions: ["Guacamole", "Crispy wonton", "Cucumber"],
      },
      {
        id: "fresh-oysters",
        name: "Fresh Oysters (3pc)",
        description: "Daily selection served with mignonette and lemon.",
        price: 19,
        image: `${IMG}/oysters.webp`,
        maxQty: 8,
        variantPrompt: "Select mignonette",
        variantOptions: ["Classic mignonette", "Yuzu ponzu", "Cocktail sauce"],
      },
      {
        id: "edamame",
        name: "Edamame with Yuzu Salt",
        description: "Steamed soybeans tossed with yuzu kosho salt.",
        price: 12,
        image: `${IMG}/edamame.webp`,
        maxQty: 8,
      },
      {
        id: "rock-shrimp-tempura",
        name: "Rock Shrimp Tempura",
        description: "Crispy rock shrimp with chives and your choice of sauce.",
        price: 28,
        image: `${IMG}/shrimp-tempura.webp`,
        maxQty: 8,
        variantPrompt: "Select sauce",
        variantOptions: ["Creamy spicy", "Ponzu butter"],
      },
    ],
  },
  {
    id: "mains",
    title: "Mains",
    items: [
      {
        id: "miso-black-cod",
        name: "Miso Marinated Black Cod",
        description: "Signature black cod marinated 72 hours in sweet miso.",
        price: 52,
        image: `${IMG}/black-cod.webp`,
        maxQty: 8,
      },
      {
        id: "wagyu-burger",
        name: "Wagyu Burger with Truffle Fries",
        description: "American wagyu, aged cheddar, tomato jam, brioche bun.",
        price: 39,
        image: `${IMG}/wagyu-burger.webp`,
        maxQty: 8,
        variantPrompt: "Select side",
        variantOptions: ["Truffle fries", "Green salad", "Miso soup"],
      },
      {
        id: "chicken-teriyaki",
        name: "Chicken Teriyaki Donburi",
        description:
          "Grilled chicken thigh, teriyaki glaze, steamed rice, toasted sesame.",
        price: 34,
        image: `${IMG}/chicken-teriyaki.webp`,
        maxQty: 8,
      },
      {
        id: "wagyu-skewers",
        name: "A5 Wagyu Skewers",
        description: "Charred Japanese A5 wagyu, scallion, wasabi salt.",
        price: 58,
        image: `${IMG}/wagyu-skewers.webp`,
        maxQty: 8,
        variantPrompt: "Select doneness",
        variantOptions: ["Medium rare", "Medium", "Well done"],
      },
    ],
  },
  {
    id: "beverages",
    title: "Beverages",
    items: [
      {
        id: "fresh-juice",
        name: "Fresh Pressed Juice",
        description: "Orange, grapefruit or green blend, pressed to order.",
        price: 12,
        image: `${IMG}/juice.webp`,
        maxQty: 8,
        variantPrompt: "Select juice",
        variantOptions: ["Orange", "Grapefruit", "Green blend"],
      },
      {
        id: "matcha-latte",
        name: "Matcha Latte",
        description: "Ceremonial-grade matcha with your choice of milk.",
        price: 11,
        image: `${IMG}/matcha-latte.webp`,
        maxQty: 8,
        variantPrompt: "Select milk",
        variantOptions: ["Whole milk", "Oat milk", "Almond milk"],
      },
      {
        id: "glass-champagne",
        name: "Glass of Champagne",
        description: "Brut NV, served chilled.",
        price: 26,
        image: `${IMG}/champagne.webp`,
        maxQty: 8,
      },
      {
        id: "sparkling-water",
        name: "Sparkling Water (750ml)",
        description: "Chilled bottle of sparkling mineral water.",
        price: 9,
        image: `${IMG}/sparkling-water.webp`,
        maxQty: 8,
      },
    ],
  },
];

export const INFO_HERO = `${IMG}/info-hero.webp`;

/**
 * Product grayscale (Canary B&W treatment, `$color-black-*` tokens). The
 * specimen interior is a product artifact — it keeps these literal values
 * in both site themes; only the container panel follows the site theme.
 */
export const INK = {
  header: "#000000",
  brand: "#111111",
  text1: "#111111",
  text2: "#333333",
  text3: "#666666",
  disabledText: "#999999",
  inputBorder: "#cccccc",
  line: "#e5e5e5",
  hairline: "#f0f0f0",
  fill: "#f0f0f0",
  loading: "#8c8c8c",
  white: "#ffffff",
} as const;

/** Corner radii per the B&W Figma treatment — squarer than Canary defaults. */
export const RAD = {
  btn: 6,
  tag: 4,
  img: 6,
  card: 8,
  sheet: 12,
} as const;

/** MDI path data — the exact glyphs the production prototype uses. */
export const ICON_PATHS = {
  arrowLeft:
    "M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z",
  unfoldMore:
    "M12,18.17L8.83,15L7.42,16.41L12,21L16.59,16.41L15.17,15M12,5.83L15.17,9L16.58,7.59L12,3L7.41,7.59L8.83,9L12,5.83Z",
  plus: "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z",
  minus: "M19,13H5V11H19V13Z",
  check: "M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z",
  close:
    "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z",
  trash:
    "M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z",
  cart: "M17,18A2,2 0 0,1 19,20A2,2 0 0,1 17,22C15.89,22 15,21.1 15,20C15,18.89 15.89,18 17,18M1,2H4.27L5.21,4H20A1,1 0 0,1 21,5C21,5.17 20.95,5.34 20.88,5.5L17.3,11.97C16.96,12.58 16.3,13 15.55,13H8.1L7.2,14.63L7.17,14.75A0.25,0.25 0 0,0 7.42,15H19V17H7C5.89,17 5,16.1 5,15C5,14.65 5.09,14.32 5.24,14.04L6.6,11.59L3,4H1V2M7,18A2,2 0 0,1 9,20A2,2 0 0,1 7,22C5.89,22 5,21.1 5,20C5,18.89 5.89,18 7,18M16,11L18.78,6H6.14L8.5,11H16Z",
} as const;

export type IconName = keyof typeof ICON_PATHS;
