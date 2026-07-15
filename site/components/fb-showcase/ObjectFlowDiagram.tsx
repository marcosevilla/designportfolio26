"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD — Object Flow Diagram
 *
 * Columns read as an order's lifecycle, left → right:
 *   Items → Modifier groups (incl. "No modifications" pass-through) → Menus → Outlets
 *
 *     0ms   waiting for scroll into view
 *   100ms   column headers fade in (staggered 120ms, L→R)
 *   450ms   cards rise in, 8px → 0 (staggered 50ms per card, 140ms per column)
 *  1150ms   connectors fade in (staggered 30ms)
 *  1900ms   ambient dash-flow starts on all gray connectors (1.3s loop)
 *  2150ms   ROUTE ENGINE begins —
 *           leg1: dot(s) travel item → modifier(s) (700ms) — a route may carry
 *                 1–2 modifiers at once, so up to two dots run in parallel
 *           leg2: dots travel modifier(s) → menu (700ms), converging
 *           leg3: single dot travels menu → outlet (700ms)
 *           hold: full route stays lit 1200ms, then the next route runs
 *
 * DEMO MODE (nothing hovered): the engine tours the menu on its own —
 *           each food item takes a turn as the highlighted item (2 routes
 *           each), with the same tiering as a hover: connected = ink,
 *           unreachable = 50% opacity. Then the next item takes over.
 *
 * INTERACTION — hover or click a food item (Items column):
 *           pauses the tour and pins the engine to that item, cycling
 *           through every route its order can take.
 *           taken      = solid accent + tinted cards (what the dot runs)
 *           possible   = ink dashed connectors, ink arrows, ink borders
 *           inapplicable = 50% opacity
 *           click pins (tap on touch); background click unpins / replays
 *
 *  reduced motion: no dots/loops — first route lit, tiers still apply
 * ───────────────────────────────────────────────────────── */

const TIMING = {
  headers: 100, // column headers fade in
  cards: 450, // cards rise in
  connectors: 1150, // connectors fade in
  ambient: 1900, // dash-flow loop begins
  itemBeat: 250, // pause before an item's first route (lets tiers read)
  dotTravel: 700, // ms for dots to cross one leg
  routeHold: 1200, // ms a completed route stays lit before the next runs
  dotBegin: 30, // ms after render before dots start (lets SMIL paths update)
};

const DEMO = {
  routesPerItem: 2, // routes each item runs before the tour moves on
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
  dimOpacity: 0.35, // inapplicable connector while an item is active
};

const TIERS = {
  dimCardOpacity: 0.5, // inapplicable cards while an item is active
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
  { key: "items", x: 100, icon: "sandwich", title: "Items", desc: ["Shared library of food & beverage", "items, often shared across menus."] },
  { key: "mods", x: 460, icon: "settings", title: "Modifier groups", desc: ["Add-ons, substitutions, variations.", "Every order passes through, even", "with no modifications."] },
  { key: "menus", x: 820, icon: "book", title: "Menus", desc: ["Collections of items offered at a", "specific period of time, or a", "specific location."] },
  { key: "outlets", x: 1180, icon: "bell", title: "Ordering outlets", desc: ["Guest entry point, embedded", "in Compendium"] },
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

/* Derive the static edge set from the source data:
   item → each applicable modifier (+ No modifications for every item)
   modifier → every menu reachable through an item that carries it
   menu → its outlets */
function buildRelations(): [string, string][] {
  const rels: [string, string][] = [];
  const modMenus: Record<string, Set<string>> = {};
  for (const item of ITEMS) {
    for (const mod of [NO_MODS, ...ITEM_MODS[item]]) {
      rels.push([item, mod]);
      for (const menu of ITEM_MENUS[item]) (modMenus[mod] = modMenus[mod] || new Set()).add(menu);
    }
  }
  const seen = new Set(rels.map((r) => r.join("→")));
  const dedup = rels.filter((r) => { const k = r.join("→"); if (!seen.has(k)) return false; seen.delete(k); return true; });
  for (const [mod, menus] of Object.entries(modMenus)) for (const menu of menus) dedup.push([mod, menu]);
  for (const [menu, outlets] of Object.entries(MENU_OUTLETS)) for (const outlet of outlets) dedup.push([menu, outlet]);
  return dedup;
}
const RELATIONS = buildRelations();

/* Build connector curves: right edge of source → left edge of target,
   always attaching at the vertical center of both cards. */
const COL_X = Object.fromEntries(COLUMNS.map((c) => [c.key, c.x]));
const cardByName = Object.fromEntries(CARD_DATA.map((c) => [c.name, c]));
const centerY = (c: Card) => c.y + c.h / 2;

type Conn = { id: string; src: string; tgt: string; d: string };
function buildConnectors(): Conn[] {
  return RELATIONS.map(([src, tgt]) => {
    const x1 = COL_X[cardByName[src].col] + CARD_W;
    const x2 = COL_X[cardByName[tgt].col];
    const y1 = centerY(cardByName[src]), y2 = centerY(cardByName[tgt]);
    const dx = (x2 - x1) * 0.45;
    return { id: `${src}→${tgt}`, src, tgt, d: `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}` };
  });
}
const CONNS = buildConnectors();
const connById = Object.fromEntries(CONNS.map((c) => [c.id, c]));

/* ─── Routes: every order an item can become ─── */

type Route = { item: string; mods: string[]; menu: string; outlet: string };
function routesFor(item: string): Route[] {
  const combos = ITEM_MENUS[item].flatMap((menu) => MENU_OUTLETS[menu].map((outlet) => ({ menu, outlet })));
  const real = ITEM_MODS[item];
  const selections: string[][] = [[NO_MODS], ...real.map((m) => [m])];
  if (real.length >= 2) selections.push([real[0], real[1]]); // multi-modifier order
  const n = Math.max(combos.length, selections.length);
  return Array.from({ length: n }, (_, i) => ({
    item,
    mods: selections[i % selections.length],
    ...combos[i % combos.length],
  }));
}

/** The item's full connected subgraph (cards + edges) for tier styling */
function connectedTo(item: string) {
  const mods = [NO_MODS, ...ITEM_MODS[item]];
  const menus = ITEM_MENUS[item];
  const cards = new Set([item, ...mods, ...menus]);
  const edges = new Set<string>();
  for (const mod of mods) {
    edges.add(`${item}→${mod}`);
    for (const menu of menus) edges.add(`${mod}→${menu}`);
  }
  for (const menu of menus) {
    for (const outlet of MENU_OUTLETS[menu]) {
      cards.add(outlet);
      edges.add(`${menu}→${outlet}`);
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
  const [stage, setStage] = useState(0);
  const [replay, setReplay] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const [demoIdx, setDemoIdx] = useState(0);
  const [route, setRoute] = useState<Route | null>(null);
  const [routePhase, setRoutePhase] = useState<RoutePhase>("leg1");
  const [dotsBegun, setDotsBegun] = useState(false);
  const dotRefs = useRef<(MotionEl | null)[]>([]);

  const userItem = pinned ?? hovered; // the item the viewer is inspecting
  const engineItem = userItem ?? ITEMS[demoIdx % ITEMS.length]; // demo tour when idle
  const connected = useMemo(() => (stage >= 4 ? connectedTo(engineItem) : null), [engineItem, stage]);

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

  /* Route engine — cycles the engine item's routes; in demo mode the tour
     advances to the next item after DEMO.routesPerItem routes */
  useEffect(() => {
    if (stage < 4) return;
    const routes = routesFor(engineItem);
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
              if (!userItem && idx >= DEMO.routesPerItem) setDemoIdx((d) => d + 1); // tour: next item takes over
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
  }, [stage, reduced, replay, engineItem, userItem]);

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

  /* Paths the dots run during the current leg (1–2 in parallel on legs 1 & 2) */
  const dotPaths: string[] = !route || reduced
    ? []
    : routePhase === "leg1"
      ? route.mods.map((m) => connById[`${route.item}→${m}`]?.d).filter(Boolean)
      : routePhase === "leg2"
        ? route.mods.map((m) => connById[`${m}→${route.menu}`]?.d).filter(Boolean)
        : routePhase === "leg3"
          ? [connById[`${route.menu}→${route.outlet}`]?.d].filter(Boolean)
          : [];

  /* Per-route accent state: legs and cards light as the dots arrive */
  const phaseRank = { leg1: 0, leg2: 1, leg3: 2, lit: 3 }[routePhase];
  const takenEdges: Record<string, boolean> = {};
  const takenCards: Record<string, boolean> = { [engineItem]: stage >= 4 };
  if (route) {
    for (const m of route.mods) {
      takenEdges[`${route.item}→${m}`] = phaseRank >= 1;
      takenEdges[`${m}→${route.menu}`] = phaseRank >= 2;
      takenCards[m] = phaseRank >= 1;
    }
    takenEdges[`${route.menu}→${route.outlet}`] = phaseRank >= 3;
    takenCards[route.menu] = phaseRank >= 2;
    takenCards[route.outlet] = phaseRank >= 3;
  }

  const colIndex = Object.fromEntries(COLUMNS.map((c, i) => [c.key, i]));

  const renderIcon = (icon: string, x: number, y: number, size: number, color: string) => (
    <g transform={`translate(${x}, ${y}) scale(${size / 24})`} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke 0.4s" }}>
      {ICONS[icon].map((s, i) => {
        const Tag = s.tag;
        return <Tag key={i} {...(s.attrs as object)} />;
      })}
    </g>
  );

  return (
    <div
      ref={ref}
      className="w-full overflow-x-auto"
      onClick={() => (pinned ? setPinned(null) : setReplay((r) => r + 1))}
      role="img"
      aria-label="Interactive diagram of the five-object model, read as an order's lifecycle: a food item is customized by modifier groups (or passes through with no modifications), appears on menus, and is served at ordering outlets. Hover or tap a food item to trace every route its order can take; when idle, the diagram tours each item on its own."
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

          {/* ── Column headers ── */}
          {COLUMNS.map((col, i) => (
            <g
              key={col.key}
              style={{
                opacity: stage >= 1 ? 1 : 0,
                transform: stage >= 1 ? "translateY(0)" : `translateY(${HEADERS.offsetY}px)`,
                transition: `opacity 0.5s ease ${i * HEADERS.stagger}s, transform 0.5s ease ${i * HEADERS.stagger}s`,
              }}
            >
              {renderIcon(col.icon, col.x, 105, 20, "var(--color-fg)")}
              <text x={col.x} y={152} fontSize={14} fontWeight={600} fill="var(--color-fg)">{col.title}</text>
              {col.desc.map((line, j) => (
                <text key={j} x={col.x} y={173 + j * 16} fontSize={11.5} fill="var(--color-fg-secondary)">{line}</text>
              ))}
            </g>
          ))}

          {/* ── Connectors (under cards) ── */}
          {CONNS.map((conn, i) => {
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
                  opacity: stage >= 3 ? (taken ? 1 : dimmed ? CONNECTORS.dimOpacity : CONNECTORS.baseOpacity) : 0,
                  transition: `opacity 0.4s ease ${stage >= 4 ? 0 : i * CONNECTORS.stagger}s, stroke 0.3s`,
                  animation: stage >= 4 && !reduced && !taken ? `fb-dash-flow ${CONNECTORS.flowDuration}s linear ${-(i % 7) * 0.17}s infinite` : undefined,
                }}
              />
            );
          })}

          {/* ── Traveling accent dots (up to two run in parallel on modifier legs) ── */}
          {dotPaths.map((d, i) => (
            <circle key={`${route?.item}-${routePhase}-${i}`} r={3.5} fill={ACCENT} style={{ opacity: dotsBegun ? 1 : 0, transition: "opacity 0.15s" }}>
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

          {/* ── Cards ── */}
          {CARD_DATA.map((card, i) => {
            const x = COL_X[card.col];
            const isItem = card.col === "items";
            const taken = takenCards[card.name];
            const possible = !taken && connected?.cards.has(card.name);
            const dimmed = connected && !taken && !possible;
            const borderStroke = taken ? ACCENT : possible ? TIERS.possibleStroke : "var(--color-border)";
            const iconY = card.y + card.h / 2 - 6;
            const delay = colIndex[card.col] * CARDS.colStagger + (i % 6) * CARDS.cardStagger;
            return (
              <g
                key={card.name}
                onMouseEnter={isItem ? () => setHovered(card.name) : undefined}
                onMouseLeave={isItem ? () => setHovered(null) : undefined}
                onClick={
                  isItem
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
                  cursor: isItem ? "pointer" : undefined,
                }}
              >
                <rect
                  x={x} y={card.y} width={CARD_W} height={card.h} rx={6}
                  fill={taken ? ACCENT_TINT : "var(--color-surface)"}
                  stroke={borderStroke}
                  strokeWidth={taken || possible ? 1.5 : 1}
                  strokeDasharray={card.dashed && !taken ? "4 3" : undefined}
                  style={{ transition: "fill 0.4s, stroke 0.4s" }}
                />
                {renderIcon(card.icon, x + 14, iconY, 12, taken ? ACCENT : "var(--color-fg)")}
                {card.sub ? (
                  <>
                    <text x={x + 36} y={card.y + card.h / 2 - 3} fontSize={11.5} fontWeight={500} fill="var(--color-fg)">{card.name}</text>
                    <text x={x + 36} y={card.y + card.h / 2 + 13} fontSize={10} fill="var(--color-fg-secondary)">{card.sub}</text>
                  </>
                ) : (
                  <text x={x + 36} y={card.y + card.h / 2 + 4} fontSize={11.5} fontWeight={500} fill="var(--color-fg)">
                    {card.name}
                    {card.price && (
                      <tspan dx={8} fontSize={10} fontWeight={400} fill="var(--color-fg-secondary)">{card.price}</tspan>
                    )}
                  </text>
                )}
              </g>
            );
          })}

          <style>{`@keyframes fb-dash-flow { to { stroke-dashoffset: ${CONNECTORS.flowShift}px; } }`}</style>
        </svg>
      </div>
    </div>
  );
}
