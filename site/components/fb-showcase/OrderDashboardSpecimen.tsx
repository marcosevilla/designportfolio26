"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import DemoStage, { type DemoStep } from "@/components/DemoStage";
import { ELEV, RADIUS, T, TYPE, W, neutral, primary } from "./canary-polished-tokens";
import { ICONS } from "./mdi-icons";
import { CHROME_H, Icon, NAV_W, Sidebar, WindowChrome } from "./admin-shell";
import {
  DELIVERY_FEE,
  ORDERS,
  STAGE_LABEL,
  TABS,
  money,
  subtotalOf,
  taxOf,
  totalOf,
  type Order,
  type Stage,
  type Tab,
} from "./order-dashboard-data";

/**
 * Canary's staff-side F&B order queue, rebuilt as a live artifact.
 *
 * Companion to `FnbCartSpecimen` (the guest side of the same product): a guest
 * places the order there, staff resolve it here. Rebuilt 1:1 from the polished
 * Figma frames and styled entirely from `canary-polished-tokens` — the product
 * keeps its own colors in light and dark; only the panel around it follows the
 * site theme.
 *
 * Choreography: cursor opens an order → side sheet slides in → Approve → the
 * row collapses out of "New orders" → cursor switches to "In progress" where
 * it lands highlighted → an older order advances to Delivered and clears on
 * its own. Decision by cursor, consequence by system.
 */

// ─── Geometry (verbatim from Figma `45:5213`) ──────────────────────────────

const APP_W = 1177;
const APP_H = 759;
// CHROME_H (minimal desktop window bar, not in the Figma frame) is shared from admin-shell
const SHELL_W = APP_W;
const SHELL_H = APP_H + CHROME_H;

const CONTENT_W = APP_W - NAV_W; // 961
const HEADER_H = 52;
const SHEET_W = 348;
const ROW_H = 48;
const TABLE_PAD = 20;

/** time · location · guest · source|status · action */
const COLUMNS = "255px 223px 200px 1fr 32px";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

// ─── Primitives ────────────────────────────────────────────────────────────

/** Uppercase micro pill — urgency countdowns and lifecycle statuses. */
function Pill({
  label,
  bg,
  fg,
}: {
  label: string;
  bg: string;
  fg: string;
}) {
  return (
    <span
      style={{
        ...TYPE.micro,
        fontWeight: W.semibold,
        textTransform: "uppercase",
        color: fg,
        backgroundColor: bg,
        borderRadius: RADIUS.xs,
        padding: "2px 4px",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

const URGENCY_PAINT = {
  danger: { bg: "#fdeaee", fg: "#8a1329" },
  warning: { bg: "#fdf3e2", fg: "#613d00" },
  success: { bg: "#e8f6ef", fg: "#094f33" },
} as const;

const STAGE_PAINT: Record<Stage, { bg: string; fg: string }> = {
  preparing: { bg: "#fdf3e2", fg: "#613d00" },
  "out-for-delivery": { bg: "#eef2fc", fg: "#1b3c88" },
  delivered: { bg: "#e8f6ef", fg: "#094f33" },
  denied: { bg: "#fdeaee", fg: "#8a1329" },
};

// ─── Table ─────────────────────────────────────────────────────────────────

function ColumnHeaders({ tab }: { tab: Tab }) {
  const labels =
    tab === "new"
      ? ["Delivery time", "Delivery location", "Guest", "Source"]
      : ["Delivery time", "Delivery location", "Guest", "Status"];
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: COLUMNS,
        alignItems: "end",
        paddingInline: 12,
        paddingBottom: 4,
        minHeight: 24,
      }}
    >
      {labels.map((l) => (
        <span
          key={l}
          style={{
            ...TYPE.micro,
            textTransform: "uppercase",
            color: neutral[500],
          }}
        >
          {l}
        </span>
      ))}
      <span />
    </div>
  );
}

function OrderRow({
  order,
  tab,
  last,
  flash,
  onOpen,
}: {
  order: Order;
  tab: Tab;
  last: boolean;
  flash: boolean;
  onOpen: () => void;
}) {
  const urgency = order.urgency ? URGENCY_PAINT[order.urgency] : null;
  const stagePaint = order.stage ? STAGE_PAINT[order.stage] : null;

  return (
    <motion.div
      layout
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: ROW_H, opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.38, ease: EASE }}
      style={{ overflow: "hidden" }}
    >
      <motion.div
        role="button"
        tabIndex={-1}
        data-demo={`row-${order.id}`}
        onClick={onOpen}
        // A freshly-approved row lands under a brief accent wash so the
        // hand-off from "New orders" is legible without a toast.
        initial={flash ? { backgroundColor: primary[50] } : false}
        animate={{ backgroundColor: "rgba(255,255,255,0)" }}
        transition={{ duration: 1.5, ease: "easeOut", delay: flash ? 0.35 : 0 }}
        style={{
          display: "grid",
          gridTemplateColumns: COLUMNS,
          alignItems: "center",
          height: ROW_H,
          paddingInline: 12,
          borderBottom: last ? "none" : `1px solid ${neutral[200]}`,
          cursor: "pointer",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ ...TYPE.body, color: neutral[800] }}>
            {order.deliveryTime}
          </span>
          {/* The countdown is an alarm on the unaccepted queue only — once an
              order is approved the STATUS column carries its state, and a
              lingering red pill would read as still-overdue. */}
          {tab === "new" && order.countdown && urgency && (
            <Pill label={order.countdown} bg={urgency.bg} fg={urgency.fg} />
          )}
        </span>
        <span style={{ ...TYPE.body, color: neutral[800] }}>
          {order.location}
        </span>
        <span style={{ ...TYPE.body, color: neutral[800] }}>{order.guest}</span>
        <span>
          {tab === "new" ? (
            <span style={{ ...TYPE.body, color: neutral[800] }}>
              {order.source}
            </span>
          ) : (
            stagePaint &&
            order.stage && (
              <Pill
                label={STAGE_LABEL[order.stage]}
                bg={stagePaint.bg}
                fg={stagePaint.fg}
              />
            )
          )}
        </span>
        <span
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: 32,
            height: 32,
          }}
        >
          <Icon path={ICONS.dotsHorizontal} size={20} color={neutral[400]} />
        </span>
      </motion.div>
    </motion.div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div
      style={{
        height: ROW_H * 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...TYPE.body,
        color: neutral[400],
      }}
    >
      {label}
    </div>
  );
}

// ─── Side sheet ────────────────────────────────────────────────────────────

function MetaRow({
  icon,
  children,
  trailing,
}: {
  icon: string;
  children: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Icon path={icon} size={14} color={neutral[500]} />
      <span style={{ ...TYPE.caption, color: neutral[800] }}>{children}</span>
      {trailing && <span style={{ marginLeft: "auto" }}>{trailing}</span>}
    </div>
  );
}

function SideSheet({
  order,
  onClose,
  onApprove,
  onDeny,
}: {
  order: Order;
  onClose: () => void;
  onApprove: () => void;
  onDeny: () => void;
}) {
  const decided = order.tab !== "new";
  return (
    <motion.aside
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.4, ease: EASE }}
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: SHEET_W,
        height: "100%",
        backgroundColor: neutral[0],
        boxShadow: ELEV.lg,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 24,
        zIndex: 5,
      }}
    >
      {/* Guest + close */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              ...TYPE.bodyL,
              fontWeight: W.medium,
              color: neutral[900],
            }}
          >
            {order.guest}
          </span>
          <button
            type="button"
            data-demo="sheet-close"
            onClick={onClose}
            aria-label="Close order details"
            style={{
              marginLeft: "auto",
              width: 28,
              height: 28,
              display: "grid",
              placeItems: "center",
              border: "none",
              background: "transparent",
              borderRadius: RADIUS.sm,
              cursor: "pointer",
            }}
          >
            <Icon path={ICONS.close} size={16} color={neutral[600]} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <MetaRow icon={ICONS.calendar}>
            {order.dateLabel} {order.dateNote}
          </MetaRow>
          <MetaRow icon={ICONS.clock}>{order.timeLabel}</MetaRow>
          <MetaRow icon={ICONS.mapMarker}>
            {order.location} &nbsp;•&nbsp; {order.source}
          </MetaRow>
          <MetaRow
            icon={ICONS.phone}
            trailing={
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: RADIUS.full,
                  display: "grid",
                  placeItems: "center",
                  backgroundColor: neutral[50],
                }}
              >
                <Icon path={ICONS.message} size={13} color={neutral[600]} />
              </span>
            }
          >
            {order.phone}
          </MetaRow>
          <MetaRow icon={ICONS.email}>{order.email}</MetaRow>
        </div>
      </div>

      {/* Items */}
      <div
        style={{
          border: `1px solid ${neutral[200]}`,
          borderRadius: RADIUS.md,
          overflow: "hidden",
        }}
      >
        {order.items.map((item, i) => (
          <div
            key={item.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: 8,
              borderBottom:
                i === order.items.length - 1
                  ? "none"
                  : `1px solid ${neutral[200]}`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image}
              alt=""
              width={40}
              height={40}
              style={{
                width: 40,
                height: 40,
                objectFit: "cover",
                borderRadius: RADIUS.sm,
                border: `1px solid ${neutral[200]}`,
                flexShrink: 0,
              }}
            />
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  ...TYPE.caption,
                  fontWeight: W.medium,
                  color: neutral[900],
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {item.qty}x {item.name}
              </div>
              <div style={{ ...TYPE.caption, color: neutral[500] }}>
                {money(item.price * item.qty)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {[
          ["Subtotal", subtotalOf(order)],
          ["Sales tax", taxOf(order)],
          ["Delivery fee", DELIVERY_FEE],
        ].map(([label, value]) => (
          <div
            key={label as string}
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <span style={{ ...TYPE.caption, color: neutral[600] }}>
              {label as string}
            </span>
            <span style={{ ...TYPE.caption, color: neutral[800] }}>
              {money(value as number)}
            </span>
          </div>
        ))}
        <div
          style={{
            height: 1,
            backgroundColor: neutral[200],
            margin: "8px 0",
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span
            style={{ ...TYPE.body, fontWeight: W.medium, color: neutral[900] }}
          >
            Total
          </span>
          <span
            style={{ ...TYPE.body, fontWeight: W.medium, color: neutral[900] }}
          >
            {money(totalOf(order))}
          </span>
        </div>
      </div>

      {/* Decision */}
      <div style={{ marginTop: "auto" }}>
        {decided ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: 12,
              borderRadius: RADIUS.md,
              backgroundColor: T.bg.successSubtle,
            }}
          >
            <Icon path={ICONS.checkCircle} size={16} color={T.text.success} />
            <span style={{ ...TYPE.caption, color: "#094f33" }}>
              Approved — sent to the kitchen
            </span>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              data-demo="approve"
              onClick={onApprove}
              style={{
                flex: 1,
                height: 40,
                border: "none",
                borderRadius: RADIUS.sm,
                backgroundColor: primary[500],
                color: neutral[0],
                cursor: "pointer",
                ...TYPE.body,
                fontWeight: W.medium,
              }}
            >
              Approve
            </button>
            <button
              type="button"
              data-demo="deny"
              onClick={onDeny}
              style={{
                flex: 1,
                height: 40,
                borderRadius: RADIUS.sm,
                border: `1px solid ${neutral[200]}`,
                backgroundColor: neutral[0],
                color: "#8a1329",
                cursor: "pointer",
                ...TYPE.body,
                fontWeight: W.medium,
              }}
            >
              Deny
            </button>
          </div>
        )}
      </div>
    </motion.aside>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────

function Dashboard() {
  const [orders, setOrders] = useState<Order[]>(ORDERS);
  const [tab, setTab] = useState<Tab>("new");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const advanced = useRef(false);

  const later = (fn: () => void, ms: number) => {
    timeouts.current.push(setTimeout(fn, ms));
  };

  useEffect(
    () => () => {
      timeouts.current.forEach(clearTimeout);
    },
    [],
  );

  const selected = orders.find((o) => o.id === selectedId) ?? null;
  const visible = orders.filter((o) => o.tab === tab);
  const countOf = (t: Tab) => orders.filter((o) => o.tab === t).length;

  const decide = (id: string, approve: boolean) => {
    // Close the sheet first so the row's collapse is the thing you watch.
    setSelectedId(null);
    later(() => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === id
            ? approve
              ? { ...o, tab: "in-progress" as Tab, stage: "preparing" as Stage }
              : { ...o, tab: "past" as Tab, stage: "denied" as Stage }
            : o,
        ),
      );
      if (approve) setFlashId(id);
    }, 280);
  };

  /**
   * The quiet tail of the story: once the queue is on screen, an older order
   * finishes on its own — status flips to DELIVERED, then it clears to Past.
   * No cursor involvement; this is the system working, not the operator.
   */
  useEffect(() => {
    if (tab !== "in-progress" || advanced.current) return;
    advanced.current = true;
    later(() => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === "sofia" ? { ...o, stage: "delivered" as Stage } : o,
        ),
      );
      later(() => {
        setOrders((prev) =>
          prev.map((o) => (o.id === "sofia" ? { ...o, tab: "past" as Tab } : o)),
        );
      }, 1500);
    }, 2400);
  }, [tab]);

  return (
    <div
      style={{
        width: SHELL_W,
        height: SHELL_H,
        borderRadius: RADIUS.lg,
        overflow: "hidden",
        backgroundColor: neutral[0],
        border: `1px solid ${neutral[200]}`,
        boxShadow: ELEV.lg,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <WindowChrome />

      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Sidebar />

        <div style={{ width: CONTENT_W, display: "flex", flexDirection: "column" }}>
          <div
            style={{
              height: HEADER_H,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              paddingInline: TABLE_PAD,
              borderBottom: `1px solid ${neutral[100]}`,
            }}
          >
            <h2
              style={{
                ...TYPE.bodyL,
                fontWeight: W.medium,
                color: neutral[900],
                margin: 0,
              }}
            >
              Food &amp; Beverage Ordering
            </h2>
          </div>

          <div
            style={{
              paddingInline: TABLE_PAD,
              paddingTop: 16,
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            {/* Chip tabs. Counts are an addition to the Figma frame — they
                make the hand-off between queues readable at a glance. */}
            <div style={{ display: "flex", gap: 6 }}>
              {TABS.map((t) => {
                const active = t.id === tab;
                return (
                  <button
                    key={t.id}
                    type="button"
                    data-demo={`tab-${t.id}`}
                    onClick={() => setTab(t.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "4px 8px",
                      border: "none",
                      borderRadius: RADIUS.sm,
                      backgroundColor: active ? neutral[100] : "transparent",
                      cursor: "pointer",
                      ...TYPE.body,
                      fontWeight: active ? W.medium : W.regular,
                      color: active ? neutral[800] : neutral[500],
                    }}
                  >
                    {t.label}
                    <motion.span
                      key={countOf(t.id)}
                      initial={{ opacity: 0, y: -3 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{
                        ...TYPE.micro,
                        fontWeight: W.medium,
                        color: active ? neutral[600] : neutral[400],
                      }}
                    >
                      {countOf(t.id)}
                    </motion.span>
                  </button>
                );
              })}
            </div>

            <div>
              <ColumnHeaders tab={tab} />
              <div
                style={{
                  border: `1px solid ${neutral[200]}`,
                  borderRadius: RADIUS.md,
                  overflow: "hidden",
                }}
              >
                {/* Keyed by tab: a tab switch swaps the list outright (new
                    rows grow in) instead of cross-animating the outgoing
                    queue against the incoming one in the same box. Within a
                    tab, add/remove still animates — that's the approve
                    collapse and the delivered-order clear. */}
                <AnimatePresence key={tab} mode="popLayout">
                  {visible.length === 0 ? (
                    <EmptyState
                      key="empty"
                      label="Nothing in this queue right now"
                    />
                  ) : (
                    visible.map((o, i) => (
                      <OrderRow
                        key={o.id}
                        order={o}
                        tab={tab}
                        last={i === visible.length - 1}
                        flash={o.id === flashId && tab === "in-progress"}
                        onOpen={() => setSelectedId(o.id)}
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {selected && (
            <SideSheet
              key={selected.id}
              order={selected}
              onClose={() => setSelectedId(null)}
              onApprove={() => decide(selected.id, true)}
              onDeny={() => decide(selected.id, false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Choreography ──────────────────────────────────────────────────────────

/**
 * `after` pads for the prototype's own transitions: side sheet 400ms, row
 * collapse 380ms, tab swap ~400ms. The closing wait covers the unattended
 * tail — accent wash (1.5s) → DELIVERED at 2.4s → row clears at 3.9s.
 */
const ORDER_DEMO_SCRIPT: DemoStep[] = [
  { type: "wait", ms: 600 },
  { type: "tap", target: "row-lucas", after: 1900 }, // sheet slides in
  { type: "tap", target: "approve", after: 1700 }, // sheet out, row collapses
  { type: "tap", target: "tab-in-progress", after: 800 },
  { type: "wait", ms: 5200 }, // flash → delivered → clears
];

export default function OrderDashboardSpecimen() {
  return (
    <MotionConfig reducedMotion="user">
      <DemoStage
        ariaLabel="Demonstration of the staff order-management dashboard"
        script={ORDER_DEMO_SCRIPT}
        stageWidth={SHELL_W}
        stageHeight={SHELL_H}
      >
        <Dashboard />
      </DemoStage>
    </MotionConfig>
  );
}
