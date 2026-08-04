/**
 * Content + data model for the F&B order-management dashboard specimen.
 *
 * Screen source: Figma "Canary Polished Visuals" (`OclYC5ytIQc9HAuJMRXUaz`),
 * section `51:6068` — frame `51:5784` (table) and `45:5213` (table + side
 * sheet). Copy, column set, row data and nav labels are transcribed from
 * those frames.
 *
 * The lifecycle beyond "New orders" (in-progress states, the approve →
 * in-progress → delivered progression) comes from the `orders-v2` prototype
 * in msevilla-canary-prototypes, which explored the tab lifecycle; the
 * side-sheet Approve/Deny pair comes from the `order-management` prototype.
 * Neither prototype animated the transition — that motion is new here.
 */

const IMG = "/images/fb-ordering/specimen";

// ─── Model ─────────────────────────────────────────────────────────────────

/** Which tab an order sits under. */
export type Tab = "new" | "in-progress" | "past";

/** Sub-state within a tab, drives the status pill. */
export type Stage =
  | "preparing"
  | "out-for-delivery"
  | "delivered"
  | "denied";

export type Urgency = "danger" | "warning" | "success" | null;

export type OrderItem = {
  qty: number;
  name: string;
  price: number;
  image: string;
};

export type Order = {
  id: string;
  /** Left-most cell: either a clock time or a scheduled window. */
  deliveryTime: string;
  /** Minutes-remaining pill. `null` for orders scheduled for a later day. */
  countdown: string | null;
  urgency: Urgency;
  location: string;
  guest: string;
  source: string;
  tab: Tab;
  stage?: Stage;
  // Side-sheet detail
  dateLabel: string;
  dateNote: string;
  timeLabel: string;
  phone: string;
  email: string;
  items: OrderItem[];
};

// ─── Money ─────────────────────────────────────────────────────────────────

/**
 * The Figma frame's price breakdown only sums the first of two line items
 * ($124 subtotal against a $124 + $59 cart). Deliberately NOT reproduced —
 * these totals are computed. See the session notes if pixel-fidelity to the
 * source is ever wanted instead.
 */
export const SALES_TAX = 0.07;
export const DELIVERY_FEE = 4;

export const subtotalOf = (o: Order) =>
  o.items.reduce((sum, i) => sum + i.price * i.qty, 0);
export const taxOf = (o: Order) => subtotalOf(o) * SALES_TAX;
export const totalOf = (o: Order) => subtotalOf(o) + taxOf(o) + DELIVERY_FEE;

export const money = (n: number) =>
  `$${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// ─── Orders ────────────────────────────────────────────────────────────────

export const ORDERS: Order[] = [
  {
    id: "lucas",
    deliveryTime: "4:10 PM",
    countdown: "10 MIN",
    urgency: "danger",
    location: "KING 101",
    guest: "Lucas Martin",
    source: "In-room dining",
    tab: "new",
    dateLabel: "Today",
    dateNote: "(Mar 10)",
    timeLabel: "4:10 PM",
    phone: "+1 (650) 555-7712",
    email: "lmartin@gmail.com",
    items: [
      {
        qty: 1,
        name: "Yellowtail Sashimi Jalapeno",
        price: 124,
        image: `${IMG}/yellowtail.webp`,
      },
      {
        qty: 1,
        name: "Bigeye and Bluefin Toro Tartare",
        price: 59,
        image: `${IMG}/toro-tartare.webp`,
      },
    ],
  },
  {
    id: "ethan",
    deliveryTime: "4:25 PM",
    countdown: "25 MIN",
    urgency: "warning",
    location: "DBL 203",
    guest: "Ethan Clarke",
    source: "In-room dining",
    tab: "new",
    dateLabel: "Today",
    dateNote: "(Mar 10)",
    timeLabel: "4:25 PM",
    phone: "+1 (415) 555-2048",
    email: "eclarke@gmail.com",
    items: [
      {
        qty: 2,
        name: "Wagyu Burger",
        price: 32,
        image: `${IMG}/wagyu-burger.webp`,
      },
      {
        qty: 1,
        name: "Sparkling Water",
        price: 7,
        image: `${IMG}/sparkling-water.webp`,
      },
    ],
  },
  {
    id: "mason",
    deliveryTime: "4:45 PM",
    countdown: "45 MIN",
    urgency: "success",
    location: "SUITE 315",
    guest: "Mason Reed",
    source: "In-room dining",
    tab: "new",
    dateLabel: "Today",
    dateNote: "(Mar 10)",
    timeLabel: "4:45 PM",
    phone: "+1 (312) 555-8890",
    email: "mreed@gmail.com",
    items: [
      {
        qty: 1,
        name: "Miso Black Cod",
        price: 46,
        image: `${IMG}/black-cod.webp`,
      },
      {
        qty: 1,
        name: "Champagne",
        price: 88,
        image: `${IMG}/champagne.webp`,
      },
    ],
  },
  {
    id: "oliver",
    deliveryTime: "Tomorrow, 7:00 – 7:30 AM",
    countdown: null,
    urgency: null,
    location: "KING 428",
    guest: "Oliver Hayes",
    source: "In-room dining",
    tab: "new",
    dateLabel: "Tomorrow",
    dateNote: "(Mar 11)",
    timeLabel: "7:00 – 7:30 AM",
    phone: "+1 (206) 555-3317",
    email: "ohayes@gmail.com",
    items: [
      {
        qty: 1,
        name: "Matcha Latte",
        price: 9,
        image: `${IMG}/matcha-latte.webp`,
      },
      {
        qty: 1,
        name: "Fresh Juice",
        price: 8,
        image: `${IMG}/juice.webp`,
      },
    ],
  },
  {
    id: "liam",
    deliveryTime: "Tomorrow, 8:00 – 8:30 AM",
    countdown: null,
    urgency: null,
    location: "DBL 512",
    guest: "Liam Foster",
    source: "In-room dining",
    tab: "new",
    dateLabel: "Tomorrow",
    dateNote: "(Mar 11)",
    timeLabel: "8:00 – 8:30 AM",
    phone: "+1 (503) 555-6624",
    email: "lfoster@gmail.com",
    items: [
      {
        qty: 2,
        name: "Chicken Teriyaki",
        price: 28,
        image: `${IMG}/chicken-teriyaki.webp`,
      },
    ],
  },

  // ── Already in progress ──
  {
    id: "sofia",
    deliveryTime: "3:55 PM",
    countdown: null,
    urgency: null,
    location: "KING 220",
    guest: "Sofia Reyes",
    source: "In-room dining",
    tab: "in-progress",
    stage: "out-for-delivery",
    dateLabel: "Today",
    dateNote: "(Mar 10)",
    timeLabel: "3:55 PM",
    phone: "+1 (646) 555-1180",
    email: "sreyes@gmail.com",
    items: [
      {
        qty: 1,
        name: "Shrimp Tempura",
        price: 24,
        image: `${IMG}/shrimp-tempura.webp`,
      },
    ],
  },
  {
    id: "noah",
    deliveryTime: "4:05 PM",
    countdown: null,
    urgency: null,
    location: "SUITE 410",
    guest: "Noah Bennett",
    source: "In-room dining",
    tab: "in-progress",
    stage: "preparing",
    dateLabel: "Today",
    dateNote: "(Mar 10)",
    timeLabel: "4:05 PM",
    phone: "+1 (718) 555-9042",
    email: "nbennett@gmail.com",
    items: [
      {
        qty: 3,
        name: "Wagyu Skewers",
        price: 21,
        image: `${IMG}/wagyu-skewers.webp`,
      },
      {
        qty: 1,
        name: "Edamame",
        price: 11,
        image: `${IMG}/edamame.webp`,
      },
    ],
  },

  // ── Past ──
  {
    id: "emily",
    deliveryTime: "3:30 PM",
    countdown: null,
    urgency: null,
    location: "ROOM 365",
    guest: "Emily Smith",
    source: "In-room dining",
    tab: "past",
    stage: "delivered",
    dateLabel: "Today",
    dateNote: "(Mar 10)",
    timeLabel: "3:30 PM",
    phone: "+1 (650) 555-7777",
    email: "esmith@gmail.com",
    items: [
      {
        qty: 1,
        name: "Fresh Oysters (3pc)",
        price: 32,
        image: `${IMG}/oysters.webp`,
      },
    ],
  },
  {
    id: "ava",
    deliveryTime: "2:15 PM",
    countdown: null,
    urgency: null,
    location: "DBL 118",
    guest: "Ava Morgan",
    source: "In-room dining",
    tab: "past",
    stage: "delivered",
    dateLabel: "Today",
    dateNote: "(Mar 10)",
    timeLabel: "2:15 PM",
    phone: "+1 (917) 555-4406",
    email: "amorgan@gmail.com",
    items: [
      {
        qty: 1,
        name: "Wagyu Burger",
        price: 32,
        image: `${IMG}/wagyu-burger.webp`,
      },
    ],
  },
];

// ─── Status pill copy ──────────────────────────────────────────────────────

export const STAGE_LABEL: Record<Stage, string> = {
  preparing: "PREPARING",
  "out-for-delivery": "OUT FOR DELIVERY",
  delivered: "DELIVERED",
  denied: "DENIED",
};

// ─── Sidebar ───────────────────────────────────────────────────────────────

export const PROPERTY = {
  name: "Days Inn & Suites by Wyndham Wausau",
  short: "Days Inn & Suite…",
  id: "38653",
};

export type NavItem = { label: string; icon: string };

export const NAV_SECTIONS: NavItem[][] = [
  [
    { label: "Upsells", icon: "tag" },
    { label: "F&B Ordering", icon: "forkKnife" },
    { label: "Check-in", icon: "login" },
    { label: "Checkout", icon: "logout" },
    { label: "Messages", icon: "message" },
    { label: "Calls", icon: "phone" },
    { label: "Digital Tips", icon: "cash" },
  ],
  [
    { label: "Authorizations", icon: "shieldCheck" },
    { label: "Contracts", icon: "fileDocument" },
    { label: "Guest Verification", icon: "accountCheck" },
    { label: "Clients on File", icon: "cardAccount" },
    { label: "Amenities", icon: "storefront" },
    { label: "Payment Links", icon: "creditCard" },
  ],
];

export const ACTIVE_NAV = "F&B Ordering";

export const TABS: { id: Tab; label: string }[] = [
  { id: "new", label: "New orders" },
  { id: "in-progress", label: "In progress" },
  { id: "past", label: "Past orders" },
];
