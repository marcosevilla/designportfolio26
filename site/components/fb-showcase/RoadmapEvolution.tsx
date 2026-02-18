"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion";
import { typescale } from "@/lib/typography";
import { SPRING_SNAP } from "@/lib/springs";

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD — Roadmap Evolution (Vertical Timeline)
 *
 * Read top-to-bottom. Each `at` value is ms after scroll trigger.
 *
 *    0ms    Waiting for scroll into view
 *  200ms    Arrow draws ↓ → Node 1 fades in (Competitive analysis)
 *  800ms    Arrow draws ↓ → Node 2 (POS integration)
 * 1400ms    Arrow draws ↓ → Node 3 (POS ordering flow)
 * 2200ms    Arrow forks → PIVOT: Node 4a [struck] + 4b [highlighted]
 * 2800ms    Arrow resumes → Node 5 (Customer interviews)
 * 3400ms    Arrow → Node 6 (Menu management)
 * 4000ms    Arrow → Node 7 (Compendium entry point)
 * 4600ms    Arrow → Node 8 (Basic ordering flow)
 * 5200ms    Arrow → Node 9 (Delivery type discovery)
 * 5800ms    Arrow → Node 10 (Delivery type model)
 * 6400ms    Arrow → Node 11 (Staff dashboard)
 * 7000ms    Arrow → Node 12 (AI menu parsing)
 * 7800ms    Arrow forks → PIVOT: Node 13a [struck] + 13b [highlighted]
 * 8400ms    Arrow → Node 14 (Modifier groups)
 * 9000ms    Arrow → Node 15 (Fees & taxes)
 * 9600ms    Arrow → Node 16 (Future items)
 *10200ms    DONE — hold for 3s
 *13200ms    Fade out (500ms)
 *14200ms    Loop restart
 * ───────────────────────────────────────────────────────── */

/* ─── Timing ─── */

const TIMING = {
  stageGap:       600,   // ms between normal stages
  pivotGap:       800,   // ms for pivot stages (extra visual weight)
  arrowDraw:      400,   // ms for each arrow to draw itself
  nodeAppear:     200,   // ms delay after arrow before node fades in
  holdFinal:     3000,   // ms to hold completed state
  fadeOut:         500,   // ms for everything to fade to 0
  loopGap:         500,   // ms blank gap before replay
};

/* ─── Node Config ─── */

const NODE = {
  offsetY:  8,       // px each node slides up from
  spring:   SPRING_SNAP,
  spineX:   16,      // px — x position of vertical spine
  nodeLeft: 36,      // px — left offset for node chips
  gap:      20,      // px — vertical gap between nodes
};

/* ─── Data ─── */

type Phase = "RESEARCH" | "DESIGN" | "DEVELOPMENT" | "PIVOT" | "FUTURE";

interface TimelineNode {
  id: string;
  phase: Phase;
  label: string;
  description: string;
  pivotFrom?: string;
  pivotFromDescription?: string;
}

const NODES: TimelineNode[] = [
  {
    id: "competitive-analysis",
    phase: "RESEARCH",
    label: "Competitive analysis",
    description: "Studied Toast, Aigens, Duve, DoorDash, and Lightspeed to internalize proven ordering patterns.",
  },
  {
    id: "pos-research",
    phase: "RESEARCH",
    label: "POS integration",
    description: "Investigated POS integration requirements — discovered most hotel targets lack cloud POS systems.",
  },
  {
    id: "pos-ordering",
    phase: "DESIGN",
    label: "POS ordering flow",
    description: "Initial designs assumed POS integration as the data backbone for menus and item sync.",
  },
  {
    id: "pivot-pos",
    phase: "PIVOT",
    label: "No-POS approach",
    pivotFrom: "POS ordering flow",
    description: "80%+ of target hotels lack cloud POS. Pivoted to standalone system with manual menu management.",
    pivotFromDescription: "Deprioritized — would block most hotel adoptions.",
  },
  {
    id: "customer-interviews",
    phase: "RESEARCH",
    label: "Customer interviews",
    description: "Spoke with Chateau Avalon, COMO Hotels, Embassy Suites to validate pain points around phone-based ordering.",
  },
  {
    id: "menu-mgmt",
    phase: "DESIGN",
    label: "Menu management",
    description: "CMS for hotels to create menus, categories, and items with time-based availability rules.",
  },
  {
    id: "compendium-entry",
    phase: "DEVELOPMENT",
    label: "Compendium entry point",
    description: "Embedded ordering outlet within existing Digital Compendium rather than building a standalone page.",
  },
  {
    id: "basic-ordering",
    phase: "DESIGN",
    label: "Basic ordering flow",
    description: "Core guest experience: menu browse, item detail, cart review, checkout, and confirmation with ETA.",
  },
  {
    id: "delivery-discovery",
    phase: "RESEARCH",
    label: "Delivery type discovery",
    description: "Identified that 'where the food goes' determines the entire checkout and fulfillment flow.",
  },
  {
    id: "delivery-model",
    phase: "DESIGN",
    label: "Delivery type model",
    description: "Abstracted in-room, poolside, and lounge delivery into a configurable model that adapts checkout automatically.",
  },
  {
    id: "staff-dashboard",
    phase: "DEVELOPMENT",
    label: "Staff dashboard",
    description: "Order queue with accept/deny workflow, time-elapsed sorting, and color-coded priority indicators.",
  },
  {
    id: "ai-parsing",
    phase: "RESEARCH",
    label: "AI menu parsing",
    description: "Prototyped Claude API integration to auto-parse PDF/photo menus into structured item data.",
  },
  {
    id: "pivot-ai",
    phase: "PIVOT",
    label: "Manual menu entry",
    pivotFrom: "AI menu parsing",
    description: "Shipped manual entry first — more reliable and covered launch needs. AI parsing stays as post-launch exploration.",
    pivotFromDescription: "Deferred to post-launch — promising but not reliable enough for GA.",
  },
  {
    id: "modifier-groups",
    phase: "DESIGN",
    label: "Modifier groups",
    description: "Add-ons, substitutions, and variations. Studied Square, Uber Eats, and DoorDash patterns for modifier UX.",
  },
  {
    id: "fees-taxes",
    phase: "DEVELOPMENT",
    label: "Fees & taxes",
    description: "Supplemental fee rules and tax configuration per ordering outlet — prioritized as a quick revenue win.",
  },
  {
    id: "future",
    phase: "FUTURE",
    label: "Order scheduling, Insights",
    description: "Next on the roadmap: scheduled orders for breakfast pre-ordering and an analytics dashboard for F&B revenue.",
  },
];

/** Total stages = NODES.length (1-indexed: stage N means node N is visible) + done/fade/gap */
const TOTAL_NODES = NODES.length;
const STAGE_DONE = TOTAL_NODES + 1;     // 17 — hold
const STAGE_FADE = TOTAL_NODES + 2;     // 18 — fade out
/** Compute cumulative delay for each node stage */
function computeStageTimes(): number[] {
  const times: number[] = [];
  let t = 200; // initial delay
  for (let i = 0; i < NODES.length; i++) {
    times.push(t);
    const gap = NODES[i].phase === "PIVOT" ? TIMING.pivotGap : TIMING.stageGap;
    t += gap;
  }
  return times;
}

const STAGE_TIMES = computeStageTimes();

/** Phase color for the subtle label */
const PHASE_COLORS: Record<Phase, string> = {
  RESEARCH: "var(--color-fg-tertiary)",
  DESIGN: "var(--color-fg-tertiary)",
  DEVELOPMENT: "var(--color-fg-tertiary)",
  PIVOT: "var(--color-accent)",
  FUTURE: "var(--color-fg-tertiary)",
};

/* ─── Timer Engine ─── */

interface AnimState {
  stage: number;
  paused: boolean;
  stageStartedAt: number;
  elapsedWhenPaused: number;
  timerId: ReturnType<typeof setTimeout> | null;
}

/* ─── Component ─── */

export default function RoadmapEvolution() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(scrollRef, { once: false, amount: 0.1 });
  const shouldReduce = useReducedMotion();
  const [stage, setStage] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const animState = useRef<AnimState>({
    stage: 0,
    paused: false,
    stageStartedAt: 0,
    elapsedWhenPaused: 0,
    timerId: null,
  });
  const hasStarted = useRef(false);

  /** Get delay until the NEXT stage from the current one */
  function getDelayForStage(currentStage: number): number {
    if (currentStage === 0) return 200;
    if (currentStage >= 1 && currentStage <= TOTAL_NODES) {
      if (currentStage < TOTAL_NODES) {
        return STAGE_TIMES[currentStage] - STAGE_TIMES[currentStage - 1];
      }
      return TIMING.stageGap;
    }
    if (currentStage === STAGE_DONE) return TIMING.holdFinal;
    if (currentStage === STAGE_FADE) return TIMING.fadeOut + TIMING.loopGap;
    return 200;
  }

  /** Schedule the next stage transition via ref-based timer */
  function scheduleNext(delay: number) {
    if (animState.current.timerId) clearTimeout(animState.current.timerId);
    animState.current.stageStartedAt = Date.now();
    animState.current.elapsedWhenPaused = 0;
    animState.current.timerId = setTimeout(() => {
      const next = animState.current.stage + 1;

      if (next <= TOTAL_NODES) {
        animState.current.stage = next;
        setStage(next);
        scheduleNext(getDelayForStage(next));
      } else if (next === STAGE_DONE) {
        animState.current.stage = STAGE_DONE;
        setStage(STAGE_DONE);
        scheduleNext(TIMING.holdFinal);
      } else if (next === STAGE_FADE) {
        animState.current.stage = STAGE_FADE;
        setStage(STAGE_FADE);
        scheduleNext(TIMING.fadeOut + TIMING.loopGap);
      } else {
        // Loop restart
        animState.current.stage = 0;
        setStage(0);
        scheduleNext(200);
      }
    }, delay);
  }

  function pause() {
    if (animState.current.paused) return;
    animState.current.paused = true;
    animState.current.elapsedWhenPaused = Date.now() - animState.current.stageStartedAt;
    if (animState.current.timerId) {
      clearTimeout(animState.current.timerId);
      animState.current.timerId = null;
    }
  }

  function resumeAnim() {
    if (!animState.current.paused) return;
    animState.current.paused = false;
    const delay = getDelayForStage(animState.current.stage);
    const remaining = Math.max(0, delay - animState.current.elapsedWhenPaused);
    scheduleNext(remaining);
  }

  // Start animation when scrolled into view
  useEffect(() => {
    if (shouldReduce) return;
    if (!isInView || hasStarted.current) return;

    hasStarted.current = true;
    animState.current.stage = 0;
    setStage(0);
    scheduleNext(200);

    return () => {
      if (animState.current.timerId) clearTimeout(animState.current.timerId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView, shouldReduce]);

  // Reset when scrolling away (for loop on re-enter)
  useEffect(() => {
    if (!isInView) {
      hasStarted.current = false;
      if (animState.current.timerId) {
        clearTimeout(animState.current.timerId);
        animState.current.timerId = null;
      }
      animState.current.stage = 0;
      animState.current.paused = false;
      setStage(0);
    }
  }, [isInView]);

  const handleMouseEnter = useCallback((id: string) => {
    setHoveredId(id);
    pause();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredId(null);
    resumeAnim();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Find hovered node data
  const hoveredNode = hoveredId ? NODES.find((n) => n.id === hoveredId) : null;
  // Get the node description for hover popover (for pivots, show replacement description)
  const hoveredDescription = hoveredNode?.description ?? "";

  const isFading = stage === STAGE_FADE;

  // ─── Reduced Motion ───
  if (shouldReduce) {
    return (
      <div ref={scrollRef}>
        <div className="flex flex-col" style={{ gap: NODE.gap, paddingLeft: NODE.nodeLeft }}>
          {NODES.map((node) => {
            if (node.phase === "PIVOT") {
              return (
                <div key={node.id} className="flex flex-col gap-1">
                  <span className="uppercase" style={{ ...typescale.label, color: PHASE_COLORS[node.phase] }}>
                    {node.phase}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        ...typescale.label,
                        padding: "6px 12px",
                        borderRadius: 6,
                        background: "var(--color-surface-raised)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-fg-tertiary)",
                        textDecoration: "line-through",
                        opacity: 0.4,
                      }}
                    >
                      {node.pivotFrom}
                    </span>
                    <span style={{ ...typescale.label, color: "var(--color-fg-tertiary)" }}>→</span>
                    <span
                      style={{
                        ...typescale.label,
                        padding: "6px 12px",
                        borderRadius: 6,
                        background: "var(--color-surface-raised)",
                        border: "1px solid var(--color-accent)",
                        color: "var(--color-fg-secondary)",
                      }}
                    >
                      {node.label}
                    </span>
                  </div>
                </div>
              );
            }
            return (
              <div key={node.id} className="flex flex-col gap-1">
                <span className="uppercase" style={{ ...typescale.label, color: PHASE_COLORS[node.phase] }}>
                  {node.phase}
                </span>
                <span
                  style={{
                    ...typescale.label,
                    padding: "6px 12px",
                    borderRadius: 6,
                    background: "var(--color-surface-raised)",
                    border: node.phase === "FUTURE" ? "1px dashed var(--color-border)" : "1px solid var(--color-border)",
                    color: node.phase === "FUTURE" ? "var(--color-fg-tertiary)" : "var(--color-fg-secondary)",
                    width: "fit-content",
                  }}
                >
                  {node.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── Animated ───
  return (
    <div ref={scrollRef}>
      <motion.div
        ref={containerRef}
        className="relative"
        animate={{ opacity: isFading ? 0 : 1 }}
        transition={{ duration: TIMING.fadeOut / 1000 }}
        style={{ minHeight: 100 }}
      >
        {/* SVG spine + arrows */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width="100%"
          height="100%"
          style={{ overflow: "visible" }}
        >
          {/* Vertical spine — draws progressively with stage */}
          {stage >= 1 && (
            <line
              x1={NODE.spineX}
              y1={0}
              x2={NODE.spineX}
              y2="100%"
              stroke="var(--color-border)"
              strokeWidth={1}
              strokeDasharray="4 4"
              opacity={0.5}
            />
          )}
          {/* Small dot markers for each visible node */}
          {NODES.map((node, i) => {
            const nodeStage = i + 1;
            if (stage < nodeStage) return null;
            // Dot at spine x, approximately aligned with each node
            // Vertical position: each node takes ~(chipHeight + gap) space
            // We use a rough estimate — 52px per node (32px chip + 20px gap)
            const y = i * 52 + 26;
            return (
              <circle
                key={node.id}
                cx={NODE.spineX}
                cy={y}
                r={3}
                fill={node.phase === "PIVOT" ? "var(--color-accent)" : "var(--color-border)"}
                opacity={0.8}
              />
            );
          })}
        </svg>

        {/* Node list */}
        <div className="flex flex-col relative" style={{ gap: NODE.gap, paddingLeft: NODE.nodeLeft }}>
          {NODES.map((node, i) => {
            const nodeStage = i + 1;
            const visible = stage >= nodeStage;
            const isHovered = hoveredId === node.id;

            if (node.phase === "PIVOT") {
              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, y: NODE.offsetY }}
                  animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : NODE.offsetY }}
                  transition={NODE.spring}
                  className="flex flex-col gap-1"
                  onMouseEnter={() => handleMouseEnter(node.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <span
                    className="uppercase"
                    style={{ ...typescale.label, color: PHASE_COLORS.PIVOT }}
                  >
                    PIVOT
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Struck-through old chip */}
                    <span
                      style={{
                        ...typescale.label,
                        padding: "6px 12px",
                        borderRadius: 6,
                        background: "var(--color-surface-raised)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-fg-tertiary)",
                        textDecoration: "line-through",
                        opacity: 0.4,
                      }}
                    >
                      {node.pivotFrom}
                    </span>
                    <span style={{ ...typescale.label, color: "var(--color-fg-tertiary)" }}>→</span>
                    {/* Replacement chip */}
                    <span
                      style={{
                        ...typescale.label,
                        padding: "6px 12px",
                        borderRadius: 6,
                        background: isHovered
                          ? "color-mix(in oklch, var(--color-accent) 10%, var(--color-surface-raised))"
                          : "color-mix(in oklch, var(--color-accent) 6%, var(--color-surface-raised))",
                        border: "1px solid color-mix(in oklch, var(--color-accent) 25%, var(--color-border))",
                        color: "var(--color-fg-secondary)",
                        transition: "background 150ms",
                      }}
                    >
                      {node.label}
                    </span>
                  </div>
                </motion.div>
              );
            }

            // Normal + Future nodes
            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, y: NODE.offsetY }}
                animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : NODE.offsetY }}
                transition={NODE.spring}
                className="flex flex-col gap-1"
                onMouseEnter={() => handleMouseEnter(node.id)}
                onMouseLeave={handleMouseLeave}
              >
                <span
                  className="uppercase"
                  style={{ ...typescale.label, color: PHASE_COLORS[node.phase] }}
                >
                  {node.phase}
                </span>
                <span
                  style={{
                    ...typescale.label,
                    padding: "6px 12px",
                    borderRadius: 6,
                    background: isHovered
                      ? "color-mix(in oklch, var(--color-accent) 8%, var(--color-surface-raised))"
                      : "var(--color-surface-raised)",
                    border: node.phase === "FUTURE"
                      ? "1px dashed var(--color-border)"
                      : isHovered
                        ? "1px solid color-mix(in oklch, var(--color-accent) 30%, var(--color-border))"
                        : "1px solid var(--color-border)",
                    color: node.phase === "FUTURE" ? "var(--color-fg-tertiary)" : "var(--color-fg-secondary)",
                    width: "fit-content",
                    cursor: "default",
                    transition: "background 150ms, border-color 150ms",
                  }}
                >
                  {node.label}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Hover Popover */}
        <AnimatePresence>
          {hoveredNode && (
            <motion.div
              key={hoveredNode.id}
              initial={{ opacity: 0, x: 4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 4 }}
              transition={{ duration: 0.15 }}
              className="absolute pointer-events-none hidden lg:block"
              style={{
                right: "calc(100% + 16px)",
                top: NODES.indexOf(hoveredNode) * 52 + 14,
                maxWidth: 200,
                ...typescale.body,
                padding: "10px 14px",
                background: "var(--color-surface-raised)",
                border: "1px solid var(--color-border)",
                borderRadius: 6,
                color: "var(--color-fg-secondary)",
                lineHeight: 1.5,
                zIndex: 10,
              }}
            >
              {hoveredDescription}
              {/* Connecting line */}
              <div
                className="absolute"
                style={{
                  left: "100%",
                  top: "50%",
                  width: 16,
                  height: 1,
                  background: "var(--color-border)",
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
