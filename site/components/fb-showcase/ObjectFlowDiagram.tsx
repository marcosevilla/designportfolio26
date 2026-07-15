"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD — Object Flow Diagram (dual view)
 *
 * TWO READINGS of the same five-object model, toggled by a
 * segmented control above the SVG:
 *
 *   SYSTEM COMPOSITION (default) — how a hotel authors the catalog:
 *     Items → Modifier groups → Menus → Ordering outlets
 *     route legs: item → mod(s) → menu → outlet
 *     interactive column: Items
 *
 *   GUEST ORDERING FLOW — the order a guest meets the objects:
 *     Ordering outlets → Menus → Items → Modifier groups
 *     route legs: outlet → menu → item → mod(s)
 *     interactive column: Ordering outlets
 *     (menu → item edges are direct here; modifiers hang off the end)
 *
 * ENTRANCE (per view mount / replay):
 *     0ms   waiting for scroll into view
 *   100ms   column headers fade in (staggered 120ms, L→R)
 *   450ms   cards rise in, 8px → 0 (staggered 50ms per card, 140ms per column)
 *  1150ms   connectors fade in (staggered 30ms)
 *  1900ms   ambient dash-flow starts on all gray connectors (1.3s loop)
 *  2150ms   ROUTE ENGINE begins — three legs of 700ms each; the modifier
 *           leg may carry 1–2 dots in parallel (leg 1 in system view,
 *           leg 3 in guest view). Full route stays lit 1200ms, then the
 *           next route runs.
 *
 * VIEW SWITCH: connectors fade out (200ms) → cards GLIDE to their new
 *           columns (500ms, same objects, new reading) → connectors fade
 *           back in and the route engine restarts on the new view's
 *           interactive column.
 *
 * DEMO MODE (nothing hovered): the engine tours the interactive column
 *           on its own — each card takes a turn as the highlighted
 *           anchor (2 routes each), with the same tiering as a hover.
 *
 * INTERACTION — hover or click a card in the interactive column:
 *           pauses the tour and pins the engine to that card, cycling
 *           through every route its order can take.
 *           taken      = solid accent + tinted cards (what the dot runs)
 *           possible   = ink dashed connectors, ink arrows, ink borders
 *           inapplicable = 50% opacity
 *           click pins (tap on touch); background click unpins / replays
 *
 *  reduced motion: no dots/loops/glide — first route lit, tiers still
 *           apply, view switch is an instant swap
 * ───────────────────────────────────────────────────────── */

const TIMING = {
  headers: 100, // column headers fade in
  cards: 450, // cards rise in
  connectors: 1150, // connectors fade in
  ambient: 1900, // dash-flow loop begins
  itemBeat: 250, // pause before an anchor's first route (lets tiers read)
  dotTravel: 700, // ms for dots to cross one leg
  routeHold: 1200, // ms a completed route stays lit before the next runs
  dotBegin: 30, // ms after render before dots start (lets SMIL paths update)
};

const SWITCH = {
  connsOut: 200, // ms connectors fade out before columns move
  glide: 500, // ms cards travel to their new columns
  connsIn: 550, // ms after click that connectors fade back in
};

const DEMO = {
  routesPerItem: 2, // routes each anchor runs before the tour moves on
};

const HEADERS = {
  stagger: 0.12, // s between columns
  offsetY: 6, // px slide up
};

const CARDS = {
  colStagger: 0.14, // s between columns
  cardStagger: 0.05, // s between cards in a column
  offsetY: 8, // px slide up
};

const CONNECTORS = {
  stagger: 0.03, // s between connectors fading in
  flowDuration: 1.3, // s per ambient dash loop
  flowShift: -12, // px of dashoffset per loop (2 dash periods)
  baseOpacity: 0.75, // resting opacity of a neutral connector
  dimOpacity: 0.35, // inapplicable connector while an anchor is active
};

const TIERS = {
  dimCardOpacity: 0.5, // inapplicable cards while an anchor is active
  possibleStroke: "var(--color-fg)", // connected-but-not-taken ink
};

const ACCENT = "#EF5A3C";
const ACCENT_TINT = `color-mix(in srgb, ${ACCENT} 8%, var(--color-surface))`;
const NEUTRAL_LINE = "var(--color-fg-tertiary)";
const NO_MODS = "No modifications";

/* ─── Source data: the actual relationships ─── */

const ITEM_MODS: Record<string, string[]> = {
  "Club sandwich": ["No salt", "Extra salt", "Whole wheat bread", "Sourdough bread"],
  Lasagna: ["No salt", "Extra salt"],
  "Espresso Martini": [],
  "Filet mignon": ["No salt"],
  "Ribeye steak": ["No salt", "BBQ sauce"],
};
const ITEM_MENUS: Record<string, string[]> = {
  "Club sandwich": ["Lunch"],
  Lasagna: ["Lunch", "Dinner"],
  "Espresso Martini": ["Happy hour", "Dessert"],
  "Filet mignon": ["Dinner"],
  "Ribeye steak": ["Dinner"],
};
const MENU_OUTLETS: Record<string, string[]> = {
  Lunch: ["Poolside dining", "In-room dining"],
  "Happy hour": ["Hotel lobby", "Poolside dining"],
  Dessert: ["In-room dining"],
  Dinner: ["In-room dining"],
};
const ITEMS = Object.keys(ITEM_MODS);
const MENUS = Object.keys(MENU_OUTLETS);
const OUTLETS = [...new Set(Object.values(MENU_OUTLETS).flat())];
const menusAt = (outlet: string) => MENUS.filter((m) => MENU_OUTLETS[m].includes(outlet));
const itemsOn = (menu: string) => ITEMS.filter((i) => ITEM_MENUS[i].includes(menu));

/* ─── Views ─── */

type ViewKey = "system" | "guest";
const VIEWS: ViewKey[] = ["system", "guest"];

const VIEW_META: Record<ViewKey, { label: string; caption: string; aria: string }> = {
  system: {
    label: "System composition",
    caption: "How a hotel composes an order: author an item once, sell it everywhere.",
    aria:
      "Interactive diagram of the five-object model, read as the hotel composes it: a food item is customized by modifier groups (or passes through with no modifications), appears on menus, and is served at ordering outlets. Hover or tap a food item to trace every route its order can take; when idle, the diagram tours each item on its own.",
  },
  guest: {
    label: "Guest ordering flow",
    caption: "The same five objects in the order a guest meets them: outlet, menu, item, customization.",
    aria:
      "Interactive diagram of the five-object model, read as a guest experiences it: from an ordering outlet the guest opens a menu, picks an item, and customizes it with modifier groups. Hover or tap an ordering outlet to trace every order a guest could place there; when idle, the diagram tours each outlet on its own.",
  },
};

const VIEW_ORDER: Record<ViewKey, string[]> = {
  system: ["items", "mods", "menus", "outlets"],
  guest: ["outlets", "menus", "items", "mods"],
};
const COL_XS = [100, 460, 820, 1180];
const VIEW_COL_X: Record<ViewKey, Record<string, number>> = Object.fromEntries(
  VIEWS.map((v) => [v, Object.fromEntries(VIEW_ORDER[v].map((col, i) => [col, COL_XS[i]]))]),
) as Record<ViewKey, Record<string, number>>;

const VIEW_ANCHORS: Record<ViewKey, { col: string; names: string[] }> = {
  system: { col: "items", names: ITEMS },
  guest: { col: "outlets", names: OUTLETS },
};

/* ─── Icons (lucide path data) ─── */

type IconShape = { tag: "path" | "rect" | "circle"; attrs: Record<string, string> };
const ICONS: Record<string, IconShape[]> = {
  settings: [
    { tag: "path", attrs: { d: "M14 17H5" } },
    { tag: "path", attrs: { d: "M19 7h-9" } },
    { tag: "circle", attrs: { cx: "17", cy: "17", r: "3" } },
    { tag: "circle", attrs: { cx: "7", cy: "7", r: "3" } },
  ],
  ban: [
    { tag: "circle", attrs: { cx: "12", cy: "12", r: "10" } },
    { tag: "path", attrs: { d: "m4.9 4.9 14.2 14.2" } },
  ],
  sandwich: [
    { tag: "path", attrs: { d: "m2.37 11.223 8.372-6.777a2 2 0 0 1 2.516 0l8.371 6.777" } },
    { tag: "path", attrs: { d: "M21 15a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-5.25" } },
    { tag: "path", attrs: { d: "M3 15a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h9" } },
    { tag: "path", attrs: { d: "m6.67 15 6.13 4.6a2 2 0 0 0 2.8-.4l3.15-4.2" } },
    { tag: "rect", attrs: { width: "20", height: "4", x: "2", y: "11", rx: "1" } },
  ],
  book: [
    { tag: "path", attrs: { d: "M12 7v14" } },
    { tag: "path", attrs: { d: "M16 12h2" } },
    { tag: "path", attrs: { d: "M16 8h2" } },
    { tag: "path", attrs: { d: "M6 12h2" } },
    { tag: "path", attrs: { d: "M6 8h2" } },
    { tag: "path", attrs: { d: "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" } },
  ],
  bell: [
    { tag: "path", attrs: { d: "M3 20a1 1 0 0 1-1-1v-1a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1Z" } },
    { tag: "path", attrs: { d: "M20 16a8 8 0 1 0-16 0" } },
    { tag: "path", attrs: { d: "M12 4v4" } },
    { tag: "path", attrs: { d: "M10 4h4" } },
  ],
};

/* ─── Layout ─── */

const COLUMNS = [
  { key: "items", icon: "sandwich", title: "Items", desc: ["Shared library of food & beverage", "items, often shared across menus."] },
  { key: "mods", icon: "settings", title: "Modifier groups", desc: ["Add-ons, substitutions, variations.", "Every order passes through, even", "with no modifications."] },
  { key: "menus", icon: "book", title: "Menus", desc: ["Collections of items offered at a", "specific period of time, or a", "specific location."] },
  { key: "outlets", icon: "bell", title: "Ordering outlets", desc: ["Guest entry point, embedded", "in Compendium"] },
];

type Card = { name: string; col: string; icon: string; y: number; h: number; sub?: string; price?: string; dashed?: boolean };
const CARD_W = 210;
const CARD_DATA: Card[] = [
  { name: "Club sandwich", col: "items", icon: "sandwich", y: 275, h: 36 },
  { name: "Lasagna", col: "items", icon: "sandwich", y: 335, h: 36 },
  { name: "Espresso Martini", col: "items", icon: "sandwich", y: 395, h: 36 },
  { name: "Filet mignon", col: "items", icon: "sandwich", y: 455, h: 36 },
  { name: "Ribeye steak", col: "items", icon: "sandwich", y: 515, h: 36 },
  { name: NO_MODS, col: "mods", icon: "ban", y: 275, h: 36, dashed: true },
  { name: "No salt", col: "mods", icon: "settings", y: 335, h: 36 },
  { name: "Extra salt", col: "mods", icon: "settings", y: 395, h: 36 },
  { name: "Whole wheat bread", col: "mods", icon: "settings", y: 455, h: 36, price: "+$1.00" },
  { name: "Sourdough bread", col: "mods", icon: "settings", y: 515, h: 36 },
  { name: "BBQ sauce", col: "mods", icon: "settings", y: 575, h: 36, price: "+$2.00" },
  { name: "Lunch", col: "menus", icon: "book", y: 267, h: 64, sub: "11:00 AM – 4:00 PM" },
  { name: "Happy hour", col: "menus", icon: "book", y: 381, h: 64, sub: "4:00 PM – 6:00 PM" },
  { name: "Dessert", col: "menus", icon: "book", y: 495, h: 64, sub: "6:00 PM – 11:00 PM" },
  { name: "Dinner", col: "menus", icon: "book", y: 609, h: 64, sub: "6:00 PM – 11:00 PM" },
  { name: "Hotel lobby", col: "outlets", icon: "bell", y: 277, h: 44, sub: "11:00 AM – 4:00 PM" },
  { name: "Poolside dining", col: "outlets", icon: "bell", y: 444, h: 44, sub: "11:00 AM – 4:00 PM" },
  { name: "In-room dining", col: "outlets", icon: "bell", y: 611, h: 44, sub: "11:00 AM – 4:00 PM" },
];
const cardByName = Object.fromEntries(CARD_DATA.map((c) => [c.name, c]));
const centerY = (c: Card) => c.y + c.h / 2;

/* Derive each view's edge set from the source data.
   system: item → each applicable modifier (+ No modifications for every item),
           modifier → every menu reachable through an item that carries it,
           menu → its outlets
   guest:  outlet → each menu served there, menu → each item on it,
           item → its modifiers (direct menu→item edges; mods hang off the end) */
function buildRelations(view: ViewKey): [string, string][] {
  const rels: [string, string][] = [];
  if (view === "system") {
    const modMenus: Record<string, Set<string>> = {};
    for (const item of ITEMS) {
      for (const mod of [NO_MODS, ...ITEM_MODS[item]]) {
        rels.push([item, mod]);
        for (const menu of ITEM_MENUS[item]) (modMenus[mod] = modMenus[mod] || new Set()).add(menu);
      }
    }
    for (const [mod, menus] of Object.entries(modMenus)) for (const menu of menus) rels.push([mod, menu]);
    for (const [menu, outlets] of Object.entries(MENU_OUTLETS)) for (const outlet of outlets) rels.push([menu, outlet]);
  } else {
    for (const outlet of OUTLETS) for (const menu of menusAt(outlet)) rels.push([outlet, menu]);
    for (const menu of MENUS) for (const item of itemsOn(menu)) rels.push([menu, item]);
    for (const item of ITEMS) for (const mod of [NO_MODS, ...ITEM_MODS[item]]) rels.push([item, mod]);
  }
  return rels;
}

/* Build connector curves: right edge of source → left edge of target,
   always attaching at the vertical center of both cards. */
type Conn = { id: string; src: string; tgt: string; d: string };
function buildConnectors(view: ViewKey): Conn[] {
  const colX = VIEW_COL_X[view];
  return buildRelations(view).map(([src, tgt]) => {
    const x1 = colX[cardByName[src].col] + CARD_W;
    const x2 = colX[cardByName[tgt].col];
    const y1 = centerY(cardByName[src]), y2 = centerY(cardByName[tgt]);
    const dx = (x2 - x1) * 0.45;
    return { id: `${src}→${tgt}`, src, tgt, d: `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}` };
  });
}
const VIEW_CONNS = Object.fromEntries(VIEWS.map((v) => [v, buildConnectors(v)])) as Record<ViewKey, Conn[]>;
const VIEW_CONN_BY_ID = Object.fromEntries(
  VIEWS.map((v) => [v, Object.fromEntries(VIEW_CONNS[v].map((c) => [c.id, c]))]),
) as Record<ViewKey, Record<string, Conn>>;

/* ─── Routes: every order the anchor can become ─── */

type Route = { item: string; mods: string[]; menu: string; outlet: string };

function modSelections(item: string): string[][] {
  const real = ITEM_MODS[item];
  const selections: string[][] = [[NO_MODS], ...real.map((m) => [m])];
  if (real.length >= 2) selections.push([real[0], real[1]]); // multi-modifier order
  return selections;
}

function routesFor(view: ViewKey, anchor: string): Route[] {
  if (view === "system") {
    const combos = ITEM_MENUS[anchor].flatMap((menu) => MENU_OUTLETS[menu].map((outlet) => ({ menu, outlet })));
    const selections = modSelections(anchor);
    const n = Math.max(combos.length, selections.length);
    return Array.from({ length: n }, (_, i) => ({
      item: anchor,
      mods: selections[i % selections.length],
      ...combos[i % combos.length],
    }));
  }
  const combos = menusAt(anchor).flatMap((menu) => itemsOn(menu).map((item) => ({ menu, item })));
  return combos.map((c, i) => ({
    outlet: anchor,
    menu: c.menu,
    item: c.item,
    mods: modSelections(c.item)[i % modSelections(c.item).length],
  }));
}

/** The anchor's full connected subgraph (cards + edges) for tier styling */
function connectedTo(view: ViewKey, anchor: string) {
  const cards = new Set<string>([anchor]);
  const edges = new Set<string>();
  if (view === "system") {
    const mods = [NO_MODS, ...ITEM_MODS[anchor]];
    const menus = ITEM_MENUS[anchor];
    for (const mod of mods) {
      cards.add(mod);
      edges.add(`${anchor}→${mod}`);
      for (const menu of menus) edges.add(`${mod}→${menu}`);
    }
    for (const menu of menus) {
      cards.add(menu);
      for (const outlet of MENU_OUTLETS[menu]) {
        cards.add(outlet);
        edges.add(`${menu}→${outlet}`);
      }
    }
  } else {
    for (const menu of menusAt(anchor)) {
      cards.add(menu);
      edges.add(`${anchor}→${menu}`);
      for (const item of itemsOn(menu)) {
        cards.add(item);
        edges.add(`${menu}→${item}`);
        for (const mod of [NO_MODS, ...ITEM_MODS[item]]) {
          cards.add(mod);
          edges.add(`${item}→${mod}`);
        }
      }
    }
  }
  return { cards, edges };
}

type RoutePhase = "leg1" | "leg2" | "leg3" | "lit";
type MotionEl = SVGElement & { beginElement: () => void };

export default function ObjectFlowDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();
  const [view, setView] = useState<ViewKey>("system");
  const [connsVisible, setConnsVisible] = useState(true);
  const [stage, setStage] = useState(0);
  const [replay, setReplay] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const [demoIdx, setDemoIdx] = useState(0);
  const [route, setRoute] = useState<Route | null>(null);
  const [routePhase, setRoutePhase] = useState<RoutePhase>("leg1");
  const [dotsBegun, setDotsBegun] = useState(false);
  const dotRefs = useRef<(MotionEl | null)[]>([]);
  const switchTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const anchors = VIEW_ANCHORS[view];
  const colX = VIEW_COL_X[view];
  const conns = VIEW_CONNS[view];
  const connById = VIEW_CONN_BY_ID[view];
  const userAnchor = pinned ?? hovered; // the card the viewer is inspecting
  const engineAnchor = userAnchor ?? anchors.names[demoIdx % anchors.names.length]; // demo tour when idle
  const connected = useMemo(
    () => (stage >= 4 ? connectedTo(view, engineAnchor) : null),
    [view, engineAnchor, stage],
  );

  /* View switch: connectors out → columns glide → connectors in, engine restarts */
  const switchView = (next: ViewKey) => {
    if (next === view) return;
    switchTimers.current.forEach(clearTimeout);
    switchTimers.current = [];
    setPinned(null);
    setHovered(null);
    setDemoIdx(0);
    setRoute(null);
    if (reduced) {
      setView(next);
      return;
    }
    setConnsVisible(false);
    switchTimers.current.push(setTimeout(() => setView(next), SWITCH.connsOut));
    switchTimers.current.push(setTimeout(() => setConnsVisible(true), SWITCH.connsIn));
  };
  useEffect(() => () => switchTimers.current.forEach(clearTimeout), []);

  /* Entrance sequence */
  useEffect(() => {
    if (!isInView) return;
    if (reduced) {
      setStage(4);
      return;
    }
    setStage(0);
    const timers = [
      setTimeout(() => setStage(1), TIMING.headers),
      setTimeout(() => setStage(2), TIMING.cards),
      setTimeout(() => setStage(3), TIMING.connectors),
      setTimeout(() => setStage(4), TIMING.ambient),
    ];
    return () => timers.forEach(clearTimeout);
  }, [isInView, reduced, replay]);

  /* Route engine — cycles the engine anchor's routes; in demo mode the tour
     advances to the next anchor after DEMO.routesPerItem routes */
  useEffect(() => {
    if (stage < 4 || !connsVisible) return;
    const routes = routesFor(view, engineAnchor);
    if (reduced) {
      setRoute(routes[0]);
      setRoutePhase("lit");
      return;
    }
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let idx = 0;
    const runRoute = () => {
      if (cancelled) return;
      timers.push(
        setTimeout(() => {
          setRoute(routes[idx % routes.length]);
          setRoutePhase("leg1");
          timers.push(setTimeout(() => setRoutePhase("leg2"), TIMING.dotTravel));
          timers.push(setTimeout(() => setRoutePhase("leg3"), TIMING.dotTravel * 2));
          timers.push(setTimeout(() => setRoutePhase("lit"), TIMING.dotTravel * 3));
          timers.push(
            setTimeout(() => {
              idx++;
              if (!userAnchor && idx >= DEMO.routesPerItem) setDemoIdx((d) => d + 1); // tour: next anchor takes over
              else runRoute();
            }, TIMING.dotTravel * 3 + TIMING.routeHold),
          );
        }, idx === 0 ? TIMING.itemBeat : 0),
      );
    };
    runRoute();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [stage, reduced, replay, view, connsVisible, engineAnchor, userAnchor]);

  /* Kick the SMIL dots each time a traveling leg starts */
  useEffect(() => {
    setDotsBegun(false);
    if (reduced || !route || routePhase === "lit") return;
    const id = setTimeout(() => {
      dotRefs.current.forEach((el) => el?.beginElement());
      setDotsBegun(true);
    }, TIMING.dotBegin);
    return () => clearTimeout(id);
  }, [route, routePhase, reduced]);

  /* Paths the dots run during the current leg — the modifier leg
     (leg 1 system / leg 3 guest) may carry 1–2 dots in parallel */
  const connD = (src: string, tgt: string) => connById[`${src}→${tgt}`]?.d;
  const legPaths: Record<Exclude<RoutePhase, "lit">, string[]> = !route
    ? { leg1: [], leg2: [], leg3: [] }
    : view === "system"
      ? {
          leg1: route.mods.map((m) => connD(route.item, m)).filter(Boolean) as string[],
          leg2: route.mods.map((m) => connD(m, route.menu)).filter(Boolean) as string[],
          leg3: [connD(route.menu, route.outlet)].filter(Boolean) as string[],
        }
      : {
          leg1: [connD(route.outlet, route.menu)].filter(Boolean) as string[],
          leg2: [connD(route.menu, route.item)].filter(Boolean) as string[],
          leg3: route.mods.map((m) => connD(route.item, m)).filter(Boolean) as string[],
        };
  const dotPaths: string[] = reduced || routePhase === "lit" ? [] : legPaths[routePhase];

  /* Per-route accent state: legs and cards light as the dots arrive */
  const phaseRank = { leg1: 0, leg2: 1, leg3: 2, lit: 3 }[routePhase];
  const takenEdges: Record<string, boolean> = {};
  const takenCards: Record<string, boolean> = { [engineAnchor]: stage >= 4 };
  if (route) {
    if (view === "system") {
      for (const m of route.mods) {
        takenEdges[`${route.item}→${m}`] = phaseRank >= 1;
        takenEdges[`${m}→${route.menu}`] = phaseRank >= 2;
        takenCards[m] = phaseRank >= 1;
      }
      takenEdges[`${route.menu}→${route.outlet}`] = phaseRank >= 3;
      takenCards[route.menu] = phaseRank >= 2;
      takenCards[route.outlet] = phaseRank >= 3;
    } else {
      takenEdges[`${route.outlet}→${route.menu}`] = phaseRank >= 1;
      takenCards[route.menu] = phaseRank >= 1;
      takenEdges[`${route.menu}→${route.item}`] = phaseRank >= 2;
      takenCards[route.item] = phaseRank >= 2;
      for (const m of route.mods) {
        takenEdges[`${route.item}→${m}`] = phaseRank >= 3;
        takenCards[m] = phaseRank >= 3;
      }
    }
  }

  const colIndex = Object.fromEntries(VIEW_ORDER[view].map((c, i) => [c, i]));
  const glide = reduced ? "none" : `transform ${SWITCH.glide}ms cubic-bezier(0.4, 0, 0.2, 1)`;

  const renderIcon = (icon: string, x: number, y: number, size: number, color: string) => (
    <g transform={`translate(${x}, ${y}) scale(${size / 24})`} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke 0.4s" }}>
      {ICONS[icon].map((s, i) => {
        const Tag = s.tag;
        return <Tag key={i} {...(s.attrs as object)} />;
      })}
    </g>
  );

  return (
    <div ref={ref} className="w-full">
      {/* ── View switch + caption ── */}
      <div className="mb-6 flex flex-col items-center gap-2.5">
        <div
          role="group"
          aria-label="Diagram view"
          className="inline-flex overflow-hidden rounded-md border"
          style={{ borderColor: "var(--color-border)" }}
        >
          {VIEWS.map((v, i) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => switchView(v)}
              className="px-3 py-1.5"
              style={{
                fontFamily: "var(--font-mono-system)",
                fontSize: "11px",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: view === v ? ACCENT : "var(--color-fg-secondary)",
                background: view === v ? ACCENT_TINT : "transparent",
                borderLeft: i > 0 ? "1px solid var(--color-border)" : "none",
                cursor: "pointer",
                transition: "color 0.2s, background 0.2s",
              }}
            >
              {VIEW_META[v].label}
            </button>
          ))}
        </div>
        <p style={{ fontSize: "12px", color: "var(--color-fg-secondary)", textAlign: "center" }}>
          {VIEW_META[view].caption}
        </p>
      </div>

      <div
        className="w-full overflow-x-auto"
        onClick={() => (pinned ? setPinned(null) : setReplay((r) => r + 1))}
        role="img"
        aria-label={VIEW_META[view].aria}
      >
        <div className="min-w-[820px]">
          <svg viewBox="80 85 1330 610" className="block w-full" style={{ fontFamily: "inherit" }}>
            <defs>
              <marker id="fbArrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 1 1 L 7 4 L 1 7" fill="none" stroke={NEUTRAL_LINE} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </marker>
              <marker id="fbArrowInk" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 1 1 L 7 4 L 1 7" fill="none" stroke={TIERS.possibleStroke} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </marker>
              <marker id="fbArrowAccent" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 1 1 L 7 4 L 1 7" fill="none" stroke={ACCENT} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </marker>
            </defs>

            {/* ── Column headers (outer g glides between views) ── */}
            {COLUMNS.map((col) => (
              <g key={col.key} style={{ transform: `translateX(${colX[col.key]}px)`, transition: glide }}>
                <g
                  style={{
                    opacity: stage >= 1 ? 1 : 0,
                    transform: stage >= 1 ? "translateY(0)" : `translateY(${HEADERS.offsetY}px)`,
                    transition: `opacity 0.5s ease ${colIndex[col.key] * HEADERS.stagger}s, transform 0.5s ease ${colIndex[col.key] * HEADERS.stagger}s`,
                  }}
                >
                  {renderIcon(col.icon, 0, 105, 20, "var(--color-fg)")}
                  <text x={0} y={152} fontSize={14} fontWeight={600} fill="var(--color-fg)">{col.title}</text>
                  {col.desc.map((line, j) => (
                    <text key={j} x={0} y={173 + j * 16} fontSize={11.5} fill="var(--color-fg-secondary)">{line}</text>
                  ))}
                </g>
              </g>
            ))}

            {/* ── Connectors (under cards; crossfade on view switch) ── */}
            {conns.map((conn, i) => {
              const taken = takenEdges[conn.id];
              const possible = !taken && connected?.edges.has(conn.id);
              const dimmed = connected && !taken && !possible;
              const stroke = taken ? ACCENT : possible ? TIERS.possibleStroke : NEUTRAL_LINE;
              const marker = taken ? "fbArrowAccent" : possible ? "fbArrowInk" : "fbArrow";
              return (
                <path
                  key={conn.id}
                  d={conn.d}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={taken ? 1.5 : 1}
                  strokeDasharray={taken ? "none" : "3 3"}
                  markerEnd={`url(#${marker})`}
                  style={{
                    opacity: stage >= 3 && connsVisible ? (taken ? 1 : dimmed ? CONNECTORS.dimOpacity : CONNECTORS.baseOpacity) : 0,
                    transition: `opacity ${connsVisible ? 0.4 : 0.2}s ease ${stage >= 4 ? 0 : i * CONNECTORS.stagger}s, stroke 0.3s`,
                    animation: stage >= 4 && !reduced && !taken ? `fb-dash-flow ${CONNECTORS.flowDuration}s linear ${-(i % 7) * 0.17}s infinite` : undefined,
                  }}
                />
              );
            })}

            {/* ── Traveling accent dots (up to two run in parallel on the modifier leg) ── */}
            {dotPaths.map((d, i) => (
              <circle key={`${view}-${route?.item}-${routePhase}-${i}`} r={3.5} fill={ACCENT} style={{ opacity: dotsBegun ? 1 : 0, transition: "opacity 0.15s" }}>
                <animateMotion
                  ref={(el: SVGElement | null) => { dotRefs.current[i] = el as MotionEl | null; }}
                  dur={`${TIMING.dotTravel}ms`}
                  begin="indefinite"
                  fill="freeze"
                  path={d}
                  calcMode="spline"
                  keySplines="0.4 0 0.4 1"
                  keyTimes="0;1"
                />
              </circle>
            ))}

            {/* ── Cards (outer g glides between views) ── */}
            {CARD_DATA.map((card, i) => {
              const isAnchor = card.col === anchors.col;
              const taken = takenCards[card.name];
              const possible = !taken && connected?.cards.has(card.name);
              const dimmed = connected && !taken && !possible;
              const borderStroke = taken ? ACCENT : possible ? TIERS.possibleStroke : "var(--color-border)";
              const delay = colIndex[card.col] * CARDS.colStagger + (i % 6) * CARDS.cardStagger;
              return (
                <g key={card.name} style={{ transform: `translate(${colX[card.col]}px, ${card.y}px)`, transition: glide }}>
                  <g
                    onMouseEnter={isAnchor ? () => setHovered(card.name) : undefined}
                    onMouseLeave={isAnchor ? () => setHovered(null) : undefined}
                    onClick={
                      isAnchor
                        ? (e) => {
                            e.stopPropagation();
                            setPinned((p) => (p === card.name ? null : card.name));
                          }
                        : undefined
                    }
                    style={{
                      opacity: stage >= 2 ? (dimmed ? TIERS.dimCardOpacity : 1) : 0,
                      transform: stage >= 2 ? "translateY(0)" : `translateY(${CARDS.offsetY}px)`,
                      transition: `opacity 0.4s ease ${stage >= 4 ? 0 : delay}s, transform 0.45s ease ${delay}s`,
                      cursor: isAnchor ? "pointer" : undefined,
                    }}
                  >
                    <rect
                      x={0} y={0} width={CARD_W} height={card.h} rx={6}
                      fill={taken ? ACCENT_TINT : "var(--color-surface)"}
                      stroke={borderStroke}
                      strokeWidth={taken || possible ? 1.5 : 1}
                      strokeDasharray={card.dashed && !taken ? "4 3" : undefined}
                      style={{ transition: "fill 0.4s, stroke 0.4s" }}
                    />
                    {renderIcon(card.icon, 14, card.h / 2 - 6, 12, taken ? ACCENT : "var(--color-fg)")}
                    {card.sub ? (
                      <>
                        <text x={36} y={card.h / 2 - 3} fontSize={11.5} fontWeight={500} fill="var(--color-fg)">{card.name}</text>
                        <text x={36} y={card.h / 2 + 13} fontSize={10} fill="var(--color-fg-secondary)">{card.sub}</text>
                      </>
                    ) : (
                      <text x={36} y={card.h / 2 + 4} fontSize={11.5} fontWeight={500} fill="var(--color-fg)">
                        {card.name}
                        {card.price && (
                          <tspan dx={8} fontSize={10} fontWeight={400} fill="var(--color-fg-secondary)">{card.price}</tspan>
                        )}
                      </text>
                    )}
                  </g>
                </g>
              );
            })}

            <style>{`@keyframes fb-dash-flow { to { stroke-dashoffset: ${CONNECTORS.flowShift}px; } }`}</style>
          </svg>
        </div>
      </div>
    </div>
  );
}
