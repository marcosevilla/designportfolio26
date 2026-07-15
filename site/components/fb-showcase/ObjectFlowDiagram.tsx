"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD — Object Flow Diagram
 *
 * Read top-to-bottom. Each `at` value is ms after scroll trigger.
 *
 *     0ms   waiting for scroll into view
 *   100ms   column headers fade in (staggered 120ms, L→R)
 *   450ms   cards rise in, 8px → 0 (staggered 50ms per card, 140ms per column)
 *  1150ms   connectors fade in (staggered 30ms)
 *  1900ms   ambient dash-flow starts on all gray connectors (1.3s loop)
 *  2300ms   CYCLE begins —
 *           run1: accent dot travels Club sandwich → Lunch (850ms)
 *           run2: Lunch lights up; two dots travel Lunch → Poolside / In-room (850ms)
 *           hold: full path lit (Club → Lunch → Poolside + In-room), 3200ms
 *           idle: accent fades back to neutral, 900ms gap, cycle repeats
 *
 *  reduced motion: skip straight to the fully-lit state, no loops
 *  click anywhere on the figure to replay from the top
 * ───────────────────────────────────────────────────────── */

const TIMING = {
  headers: 100, // column headers fade in
  cards: 450, // cards rise in
  connectors: 1150, // connectors fade in
  ambient: 1900, // dash-flow loop begins
  cycleStart: 2300, // first accent dot leaves
  dotTravel: 850, // ms for a dot to cross one segment
  holdLit: 3200, // ms the full accent path stays lit
  cycleGap: 900, // ms of neutral state between cycles
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
};

const ACCENT = "#EF5A3C";
const ACCENT_TINT = `color-mix(in srgb, ${ACCENT} 8%, var(--color-surface))`;
const NEUTRAL_LINE = "var(--color-fg-tertiary)";

/* ─── Diagram data (geometry mirrors the Figma spec 1:1) ─── */

type IconShape = { tag: "path" | "rect" | "circle"; attrs: Record<string, string> };
const ICONS: Record<string, IconShape[]> = {
  settings: [
    { tag: "path", attrs: { d: "M14 17H5" } },
    { tag: "path", attrs: { d: "M19 7h-9" } },
    { tag: "circle", attrs: { cx: "17", cy: "17", r: "3" } },
    { tag: "circle", attrs: { cx: "7", cy: "7", r: "3" } },
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

const COLUMNS = [
  { key: "mods", x: 100, icon: "settings", title: "Modifier groups", desc: ["Add-ons, substitutions, variations"] },
  { key: "items", x: 460, icon: "sandwich", title: "Items", desc: ["Shared library of food & beverage", "items, often shared across menus."] },
  { key: "menus", x: 820, icon: "book", title: "Menus", desc: ["Collections of items offered at a", "specific period of time, or a", "specific location."] },
  { key: "outlets", x: 1180, icon: "bell", title: "Ordering outlets", desc: ["Guest entry point, embedded", "in Compendium"] },
];

type Card = { name: string; col: string; icon: string; y: number; h: number; sub?: string; price?: string };
const CARD_W = 210;
const CARD_DATA: Card[] = [
  { name: "No salt", col: "mods", icon: "settings", y: 275, h: 36 },
  { name: "Extra salt", col: "mods", icon: "settings", y: 335, h: 36 },
  { name: "Whole wheat bread", col: "mods", icon: "settings", y: 395, h: 36, price: "+$1.00" },
  { name: "Sourdough bread", col: "mods", icon: "settings", y: 455, h: 36 },
  { name: "BBQ sauce", col: "mods", icon: "settings", y: 515, h: 36, price: "+$2.00" },
  { name: "Club sandwich", col: "items", icon: "sandwich", y: 275, h: 36 },
  { name: "Lasagna", col: "items", icon: "sandwich", y: 335, h: 36 },
  { name: "Espresso Martini", col: "items", icon: "sandwich", y: 395, h: 36 },
  { name: "Filet mignon", col: "items", icon: "sandwich", y: 455, h: 36 },
  { name: "Ribeye steak", col: "items", icon: "sandwich", y: 515, h: 36 },
  { name: "Lunch", col: "menus", icon: "book", y: 267, h: 64, sub: "11:00 AM – 4:00 PM" },
  { name: "Happy hour", col: "menus", icon: "book", y: 381, h: 64, sub: "4:00 PM – 6:00 PM" },
  { name: "Dessert", col: "menus", icon: "book", y: 495, h: 64, sub: "6:00 PM – 11:00 PM" },
  { name: "Dinner", col: "menus", icon: "book", y: 609, h: 64, sub: "6:00 PM – 11:00 PM" },
  { name: "Hotel lobby", col: "outlets", icon: "bell", y: 277, h: 44, sub: "11:00 AM – 4:00 PM" },
  { name: "Poolside dining", col: "outlets", icon: "bell", y: 444, h: 44, sub: "11:00 AM – 4:00 PM" },
  { name: "In-room dining", col: "outlets", icon: "bell", y: 611, h: 44, sub: "11:00 AM – 4:00 PM" },
];

/** [source, target, accent?] — arrows always flow left → right */
const RELATIONS: [string, string, boolean?][] = [
  ["No salt", "Club sandwich"],
  ["No salt", "Lasagna"],
  ["No salt", "Filet mignon"],
  ["No salt", "Ribeye steak"],
  ["Extra salt", "Club sandwich"],
  ["Extra salt", "Lasagna"],
  ["Whole wheat bread", "Club sandwich"],
  ["Sourdough bread", "Club sandwich"],
  ["BBQ sauce", "Ribeye steak"],
  ["Club sandwich", "Lunch", true],
  ["Lasagna", "Lunch"],
  ["Lasagna", "Dinner"],
  ["Espresso Martini", "Happy hour"],
  ["Espresso Martini", "Dessert"],
  ["Filet mignon", "Dinner"],
  ["Ribeye steak", "Dinner"],
  ["Lunch", "Poolside dining", true],
  ["Lunch", "In-room dining", true],
  ["Happy hour", "Hotel lobby"],
  ["Happy hour", "Poolside dining"],
  ["Dessert", "In-room dining"],
  ["Dinner", "In-room dining"],
];

/* Build connector curves: right edge of source → left edge of target,
   attach points fanned 9px apart when a card has several connections. */
const COL_X = Object.fromEntries(COLUMNS.map((c) => [c.key, c.x]));
const cardByName = Object.fromEntries(CARD_DATA.map((c) => [c.name, c]));
const centerY = (c: Card) => c.y + c.h / 2;

function buildConnectors() {
  const outBy: Record<string, [string, string, boolean?][]> = {};
  const inBy: Record<string, [string, string, boolean?][]> = {};
  for (const r of RELATIONS) {
    (outBy[r[0]] = outBy[r[0]] || []).push(r);
    (inBy[r[1]] = inBy[r[1]] || []).push(r);
  }
  const srcY = new Map(), tgtY = new Map();
  for (const [name, list] of Object.entries(outBy)) {
    list.sort((a, b) => centerY(cardByName[a[1]]) - centerY(cardByName[b[1]]));
    list.forEach((r, i) => srcY.set(r, centerY(cardByName[name]) + (i - (list.length - 1) / 2) * 9));
  }
  for (const [name, list] of Object.entries(inBy)) {
    list.sort((a, b) => centerY(cardByName[a[0]]) - centerY(cardByName[b[0]]));
    list.forEach((r, i) => tgtY.set(r, centerY(cardByName[name]) + (i - (list.length - 1) / 2) * 9));
  }
  return RELATIONS.map((r) => {
    const [src, tgt, accent] = r;
    const x1 = COL_X[cardByName[src].col] + CARD_W;
    const x2 = COL_X[cardByName[tgt].col];
    const y1 = srcY.get(r), y2 = tgtY.get(r);
    const dx = (x2 - x1) * 0.45;
    return {
      id: `${src}→${tgt}`,
      accent: !!accent,
      d: `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`,
    };
  });
}
const CONNS = buildConnectors();
const ACCENT_SEGS = {
  toLunch: "Club sandwich→Lunch",
  toPool: "Lunch→Poolside dining",
  toRoom: "Lunch→In-room dining",
};

type Phase = "idle" | "run1" | "run2" | "hold";
type MotionEl = SVGElement & { beginElement: () => void };

export default function ObjectFlowDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();
  const [stage, setStage] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [replay, setReplay] = useState(0);
  const dotRefs = useRef<(MotionEl | null)[]>([]);

  /* Entrance sequence */
  useEffect(() => {
    if (!isInView) return;
    if (reduced) {
      setStage(4);
      setPhase("hold");
      return;
    }
    setStage(0);
    setPhase("idle");
    const timers = [
      setTimeout(() => setStage(1), TIMING.headers),
      setTimeout(() => setStage(2), TIMING.cards),
      setTimeout(() => setStage(3), TIMING.connectors),
      setTimeout(() => setStage(4), TIMING.ambient),
    ];
    return () => timers.forEach(clearTimeout);
  }, [isInView, reduced, replay]);

  /* Accent dot cycle */
  useEffect(() => {
    if (stage < 4 || reduced) return;
    let cancelled = false;
    let timers: ReturnType<typeof setTimeout>[] = [];
    const cycle = (first: boolean) => {
      if (cancelled) return;
      timers = [];
      const start = first ? TIMING.cycleStart - TIMING.ambient : 0;
      timers.push(
        setTimeout(() => {
          setPhase("run1");
          dotRefs.current[0]?.beginElement();
        }, start),
        setTimeout(() => {
          setPhase("run2");
          dotRefs.current[1]?.beginElement();
          dotRefs.current[2]?.beginElement();
        }, start + TIMING.dotTravel),
        setTimeout(() => setPhase("hold"), start + TIMING.dotTravel * 2),
        setTimeout(() => setPhase("idle"), start + TIMING.dotTravel * 2 + TIMING.holdLit),
        setTimeout(() => cycle(false), start + TIMING.dotTravel * 2 + TIMING.holdLit + TIMING.cycleGap),
      );
    };
    cycle(true);
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [stage, reduced, replay]);

  const litCards: Record<string, boolean> = {
    "Club sandwich": stage >= 4,
    Lunch: phase === "run2" || phase === "hold",
    "Poolside dining": phase === "hold",
    "In-room dining": phase === "hold",
  };
  const litSegs: Record<string, boolean> = {
    [ACCENT_SEGS.toLunch]: phase === "run2" || phase === "hold",
    [ACCENT_SEGS.toPool]: phase === "hold",
    [ACCENT_SEGS.toRoom]: phase === "hold",
  };
  const colIndex = Object.fromEntries(COLUMNS.map((c, i) => [c.key, i]));

  const renderIcon = (icon: string, x: number, y: number, size: number, color: string) => (
    <g transform={`translate(${x}, ${y}) scale(${size / 24})`} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke 0.5s" }}>
      {ICONS[icon].map((s, i) => {
        const Tag = s.tag;
        return <Tag key={i} {...(s.attrs as object)} />;
      })}
    </g>
  );

  return (
    <div ref={ref} className="w-full overflow-x-auto" onClick={() => setReplay((r) => r + 1)} role="img" aria-label="Diagram of the five-object model: modifier groups attach to items, items compose menus, and menus are served at ordering outlets. Example: the Club sandwich is authored once, appears on the Lunch menu, and is served at both Poolside and In-room dining.">
      <div className="min-w-[820px]">
        <svg viewBox="80 85 1330 610" className="block w-full" style={{ fontFamily: "inherit" }}>
          <defs>
            <marker id="fbArrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 1 1 L 7 4 L 1 7" fill="none" stroke={NEUTRAL_LINE} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
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
            const lit = conn.accent && litSegs[conn.id];
            return (
              <path
                key={conn.id}
                d={conn.d}
                fill="none"
                stroke={lit ? ACCENT : NEUTRAL_LINE}
                strokeWidth={lit ? 1.5 : 1}
                strokeDasharray={lit ? "none" : "3 3"}
                markerEnd={lit ? "url(#fbArrowAccent)" : "url(#fbArrow)"}
                style={{
                  opacity: stage >= 3 ? (lit ? 1 : 0.75) : 0,
                  transition: `opacity 0.5s ease ${i * CONNECTORS.stagger}s, stroke 0.4s`,
                  animation: stage >= 4 && !reduced && !lit ? `fb-dash-flow ${CONNECTORS.flowDuration}s linear ${-(i % 7) * 0.17}s infinite` : undefined,
                }}
              />
            );
          })}

          {/* ── Traveling accent dots ── */}
          {!reduced &&
            [ACCENT_SEGS.toLunch, ACCENT_SEGS.toPool, ACCENT_SEGS.toRoom].map((segId, i) => {
              const conn = CONNS.find((c) => c.id === segId)!;
              const visible = (i === 0 && phase === "run1") || (i > 0 && phase === "run2");
              return (
                <circle key={segId} r={3.5} fill={ACCENT} style={{ opacity: visible ? 1 : 0, transition: "opacity 0.15s" }}>
                  <animateMotion
                    ref={(el: SVGElement | null) => { dotRefs.current[i] = el as MotionEl | null; }}
                    dur={`${TIMING.dotTravel}ms`}
                    begin="indefinite"
                    fill="freeze"
                    path={conn.d}
                    calcMode="spline"
                    keySplines="0.4 0 0.4 1"
                    keyTimes="0;1"
                  />
                </circle>
              );
            })}

          {/* ── Cards ── */}
          {CARD_DATA.map((card, i) => {
            const x = COL_X[card.col];
            const lit = litCards[card.name];
            const iconY = card.y + card.h / 2 - 6;
            const delay = colIndex[card.col] * CARDS.colStagger + (i % 5) * CARDS.cardStagger;
            return (
              <g
                key={card.name}
                style={{
                  opacity: stage >= 2 ? 1 : 0,
                  transform: stage >= 2 ? "translateY(0)" : `translateY(${CARDS.offsetY}px)`,
                  transition: `opacity 0.45s ease ${delay}s, transform 0.45s ease ${delay}s`,
                }}
              >
                <rect
                  x={x} y={card.y} width={CARD_W} height={card.h} rx={6}
                  fill={lit ? ACCENT_TINT : "var(--color-surface)"}
                  stroke={lit ? ACCENT : "var(--color-border)"}
                  strokeWidth={lit ? 1.5 : 1}
                  style={{ transition: "fill 0.45s, stroke 0.45s" }}
                />
                {renderIcon(card.icon, x + 14, iconY, 12, lit ? ACCENT : "var(--color-fg)")}
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
