"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import DemoStage, { type DemoStep } from "@/components/DemoStage";
import {
  ELEV, neutral, primary, danger, RADIUS, TYPE, W,
} from "./canary-polished-tokens";
import { ICONS } from "./mdi-icons";
import { Icon, NAV_W, Sidebar, WindowChrome } from "./admin-shell";
import {
  formatMenus, LIBRARY_ITEMS, LIBRARY_TABS, type LibraryItem,
} from "./item-library-data";

/**
 * Canary's Item Library — the menu-CMS half of F&B Ordering, staff-side.
 * Recreated from Figma frame `56:6548` (Canary Polished Visuals) at the same
 * 1177px shell as `OrderDashboardSpecimen`. Interactive: availability toggle,
 * row multi-select with bulk-delete pill, single-row delete with confirm
 * modal + toast. Tab switching and "Create new item" stay inert — out of
 * scope for the demo. Wrapped in the same DemoStage choreography as #2.
 *
 * Deliberate deviations from the frame (Marco's call, 2026-08-04):
 * 1. Row content is the guest cart specimen's izakaya menu, not the frame's
 *    seed data — see `item-library-data.ts`.
 * 2. Geometry is adapted to the shared 1177px shell rather than the frame's
 *    1440px canvas.
 * 3. The trash icon's rest color is neutral, not the frame's red — a red
 *    glyph at rest read as an error state, not an available action.
 */

// ─── Geometry (adapted from frame 56:6548 to the 1177 shell) ──────────────

const APP_W = 1177; // matches OrderDashboardSpecimen
const CHROME_H = 36; // shared WindowChrome
const CONTENT_W = APP_W - NAV_W; // 961
const TOPBAR_H = 56; // "Statler New York ▾" + avatar bar
const TITLE_H = 52; // "Food and Beverage Ordering" (mirrors #2's HEADER_H)
const TABS_H = 56; // tab row incl. underline
const TABLE_W = 900; // centered in the 961 content column
const ROW_H = 72; // 40px thumb + 16px padding each side
const THUMB = 40;
/** checkbox · item · pos code · menus · price · availability */
const COLUMNS = "36px 1fr 128px 208px 96px 128px";
const APP_H =
  TOPBAR_H + TITLE_H + TABS_H + 64 /* heading row */ + 36 /* col headers */ +
  8 * ROW_H + 20; /* bottom pad */ // 860
const SHELL_W = APP_W;
const SHELL_H = APP_H + CHROME_H; // 896

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

// ─── Primitives ────────────────────────────────────────────────────────────

function Checkbox({
  checked,
  onClick,
  itemId,
}: {
  checked: boolean;
  onClick: () => void;
  itemId: string;
}) {
  return (
    <button
      type="button"
      data-demo={`check-${itemId}`}
      onClick={onClick}
      aria-pressed={checked}
      style={{
        width: 16,
        height: 16,
        padding: 0,
        border: checked ? "none" : `1.5px solid ${neutral[300]}`,
        borderRadius: RADIUS.xs,
        backgroundColor: checked ? primary[500] : neutral[0],
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {checked && (
        <span
          style={{
            color: neutral[0],
            fontSize: 11,
            lineHeight: 1,
            fontWeight: W.semibold,
          }}
        >
          ✓
        </span>
      )}
    </button>
  );
}

function AvailabilitySwitch({
  on,
  onClick,
  itemId,
}: {
  on: boolean;
  onClick: () => void;
  itemId: string;
}) {
  return (
    <button
      type="button"
      data-demo={`toggle-${itemId}`}
      onClick={onClick}
      aria-pressed={on}
      style={{
        width: 36,
        height: 20,
        padding: 0,
        border: "none",
        borderRadius: RADIUS.full,
        backgroundColor: on ? primary[500] : neutral[300],
        position: "relative",
        flexShrink: 0,
        cursor: "pointer",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 2,
          left: 0,
          width: 16,
          height: 16,
          borderRadius: RADIUS.full,
          backgroundColor: neutral[0],
          transform: `translateX(${on ? 18 : 2}px)`,
          transition: "transform 160ms",
        }}
      />
    </button>
  );
}

function TrashButton({ itemId, onClick }: { itemId: string; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      data-demo={`trash-${itemId}`}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        border: "none",
        background: "transparent",
        cursor: "pointer",
      }}
    >
      <Icon path={ICONS.trashCan} size={18} color={hover ? danger[500] : neutral[500]} />
    </button>
  );
}

// ─── Table ─────────────────────────────────────────────────────────────────

function ColumnHeaders() {
  const labels = ["", "Item", "POS item code", "Menus", "Price", "Availability"];
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: COLUMNS,
        height: 36,
        alignItems: "center",
      }}
    >
      {labels.map((l, i) => (
        <span
          key={i}
          style={{
            ...TYPE.micro,
            fontWeight: W.medium,
            color: neutral[500],
            textTransform: "uppercase",
            textAlign: i === labels.length - 1 ? "right" : "left",
          }}
        >
          {l}
        </span>
      ))}
    </div>
  );
}

function ItemRow({
  item,
  available,
  first,
  checked,
  onToggleAvailability,
  onToggleSelect,
  onDelete,
}: {
  item: LibraryItem;
  available: boolean;
  first: boolean;
  checked: boolean;
  onToggleAvailability: () => void;
  onToggleSelect: () => void;
  onDelete: () => void;
}) {
  const dimStyle = {
    opacity: available ? 1 : 0.45,
    transition: "opacity 200ms",
  } as const;

  return (
    <motion.div
      layout
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.38, ease: EASE }}
      style={{ overflow: "hidden" }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: COLUMNS,
          alignItems: "center",
          height: ROW_H,
          borderTop: first ? "none" : `1px solid ${neutral[100]}`,
        }}
      >
        <Checkbox checked={checked} onClick={onToggleSelect} itemId={item.id} />

        <span style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.image}
            alt=""
            width={THUMB}
            height={THUMB}
            loading="lazy"
            style={{
              width: THUMB,
              height: THUMB,
              borderRadius: RADIUS.md,
              objectFit: "cover",
              flexShrink: 0,
              filter: available ? "none" : "grayscale(1)",
              transition: "filter 200ms",
            }}
          />
          <span
            style={{
              ...TYPE.body,
              fontWeight: W.medium,
              color: neutral[900],
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              ...dimStyle,
            }}
          >
            {item.name}
          </span>
        </span>

        <span
          style={{
            ...TYPE.body,
            color: item.posCode ? neutral[600] : neutral[400],
          }}
        >
          {item.posCode ?? "—"}
        </span>

        <span style={{ ...TYPE.body, color: neutral[600], ...dimStyle }}>
          {formatMenus(item.menus)}
        </span>

        <span style={{ ...TYPE.body, color: neutral[900], ...dimStyle }}>
          ${item.price.toFixed(2)}
        </span>

        <span style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12 }}>
          <AvailabilitySwitch on={available} onClick={onToggleAvailability} itemId={item.id} />
          <Icon path={ICONS.pencil} size={18} color={neutral[500]} />
          <TrashButton itemId={item.id} onClick={onDelete} />
        </span>
      </div>
    </motion.div>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────

function Library() {
  const [items, setItems] = useState<LibraryItem[]>(LIBRARY_ITEMS);
  const [available, setAvailable] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(LIBRARY_ITEMS.map((item) => [item.id, true])),
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<LibraryItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggle = (id: string) =>
    setAvailable((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const doomed = pendingDelete;
    setPendingDelete(null);
    setItems((prev) => prev.filter((i) => i.id !== doomed.id));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(doomed.id);
      return next;
    });
    showToast("Item deleted");
  };

  const bulkDelete = () => {
    const n = selected.size;
    setItems((prev) => prev.filter((i) => !selected.has(i.id)));
    setSelected(new Set());
    showToast(`${n} item${n === 1 ? "" : "s"} deleted`);
  };

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

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
          {/* Top bar */}
          <div
            style={{
              height: TOPBAR_H,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              paddingInline: 20,
              borderBottom: `1px solid ${neutral[100]}`,
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ ...TYPE.body, fontWeight: W.medium, color: neutral[900] }}>
                Statler New York
              </span>
              <Icon path={ICONS.chevronDown} size={16} color={neutral[500]} />
            </span>
            <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: RADIUS.full,
                  backgroundColor: neutral[200],
                }}
              />
              <Icon path={ICONS.chevronDown} size={16} color={neutral[500]} />
            </span>
          </div>

          {/* Title bar */}
          <div
            style={{
              height: TITLE_H,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              paddingInline: 20,
              borderBottom: `1px solid ${neutral[100]}`,
            }}
          >
            <h2 style={{ ...TYPE.bodyL, fontWeight: W.medium, color: neutral[900], margin: 0 }}>
              Food and Beverage Ordering
            </h2>
          </div>

          <div style={{ paddingInline: 20, display: "flex", flexDirection: "column" }}>
            {/* Tab row */}
            <div
              style={{
                width: TABLE_W,
                height: TABS_H,
                display: "flex",
                alignItems: "center",
                gap: 24,
                borderBottom: `1px solid ${neutral[100]}`,
              }}
            >
              {LIBRARY_TABS.map((tab) => {
                const active = tab === "Item library";
                return (
                  <button
                    key={tab}
                    type="button"
                    style={{
                      ...TYPE.body,
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      border: "none",
                      borderBottom: active
                        ? `2px solid ${primary[500]}`
                        : "2px solid transparent",
                      background: "transparent",
                      color: active ? primary[500] : neutral[600],
                      fontWeight: active ? W.medium : W.regular,
                      cursor: "default",
                    }}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Heading row */}
            <div
              style={{
                width: TABLE_W,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: 20,
              }}
            >
              <h3 style={{ ...TYPE.titleS, fontWeight: W.semibold, color: neutral[900], margin: 0 }}>
                Item library
              </h3>
              <button
                type="button"
                style={{
                  height: 36,
                  paddingInline: 16,
                  backgroundColor: primary[500],
                  color: neutral[0],
                  border: "none",
                  borderRadius: RADIUS.md,
                  ...TYPE.body,
                  fontWeight: W.medium,
                  cursor: "default",
                }}
              >
                Create new item
              </button>
            </div>

            <div style={{ width: TABLE_W }}>
              <ColumnHeaders />
              <div
                style={{
                  border: `1px solid ${neutral[200]}`,
                  borderRadius: RADIUS.md,
                  overflow: "hidden",
                }}
              >
                <AnimatePresence initial={false}>
                  {items.map((item, i) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      available={available[item.id]}
                      first={i === 0}
                      checked={selected.has(item.id)}
                      onToggleAvailability={() => toggle(item.id)}
                      onToggleSelect={() => toggleSelect(item.id)}
                      onDelete={() => setPendingDelete(item)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {selected.size > 0 && (
            <motion.button
              type="button"
              data-demo="bulk-delete"
              onClick={bulkDelete}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{ duration: 0.28, ease: EASE }}
              style={{
                position: "absolute",
                right: 24,
                bottom: 20,
                height: 40,
                paddingInline: 20,
                borderRadius: RADIUS.full,
                backgroundColor: danger[500],
                color: neutral[0],
                ...TYPE.body,
                fontWeight: W.medium,
                border: "none",
                boxShadow: ELEV.lg,
                cursor: "pointer",
              }}
            >
              Delete {selected.size} item{selected.size === 1 ? "" : "s"}
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {pendingDelete && (
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(19,24,34,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2, ease: EASE }}
                style={{
                  width: 400,
                  backgroundColor: neutral[0],
                  borderRadius: RADIUS.lg,
                  boxShadow: ELEV.overlay,
                  padding: 24,
                }}
              >
                <h4 style={{ ...TYPE.bodyL, fontWeight: W.semibold, color: neutral[900], margin: 0 }}>
                  Delete item?
                </h4>
                <p style={{ ...TYPE.body, color: neutral[600], marginTop: 8, marginBottom: 0 }}>
                  Remove &ldquo;{pendingDelete.name}&rdquo; from your item library? It will also be
                  removed from any menus that use it.
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 8,
                    marginTop: 20,
                  }}
                >
                  <button
                    type="button"
                    data-demo="modal-cancel"
                    onClick={() => setPendingDelete(null)}
                    style={{
                      height: 36,
                      paddingInline: 16,
                      borderRadius: RADIUS.md,
                      border: `1px solid ${neutral[200]}`,
                      backgroundColor: neutral[0],
                      color: neutral[700],
                      ...TYPE.body,
                      fontWeight: W.medium,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    data-demo="modal-confirm"
                    onClick={confirmDelete}
                    style={{
                      height: 36,
                      paddingInline: 16,
                      borderRadius: RADIUS.md,
                      border: "none",
                      backgroundColor: danger[500],
                      color: neutral[0],
                      ...TYPE.body,
                      fontWeight: W.medium,
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              transition={{ duration: 0.2, ease: EASE }}
              style={{
                position: "absolute",
                bottom: 20,
                left: "50%",
                x: "-50%",
                backgroundColor: neutral[800],
                color: neutral[0],
                ...TYPE.body,
                paddingInline: 16,
                height: 36,
                display: "flex",
                alignItems: "center",
                borderRadius: RADIUS.md,
                boxShadow: ELEV.lg,
              }}
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Choreography ──────────────────────────────────────────────────────────

/**
 * ~16s loop (Marco's beats, 2026-08-04): availability off/on → bulk-select
 * reveal (no destruction) → single delete with confirm + toast. `after` pads
 * cover the switch transition (160ms), pill slide (280ms), modal enter
 * (200ms), row collapse (380ms) + toast (2.4s).
 */
const LIBRARY_DEMO_SCRIPT: DemoStep[] = [
  { type: "wait", ms: 600 },
  { type: "tap", target: "toggle-oysters", after: 1500 },  // off — row dims
  { type: "tap", target: "toggle-oysters", after: 1100 },  // back on
  { type: "tap", target: "check-edamame", after: 900 },    // pill slides in
  { type: "tap", target: "check-wagyu-burger", after: 1400 }, // "Delete 2 items"
  { type: "tap", target: "check-edamame", after: 700 },    // count drops to 1
  { type: "tap", target: "check-wagyu-burger", after: 1100 }, // pill slides out
  { type: "tap", target: "trash-sparkling", after: 1300 }, // modal in
  { type: "tap", target: "modal-confirm", after: 900 },    // collapse + toast
  { type: "wait", ms: 2600 },                              // toast reads, loop
];

export default function ItemLibrarySpecimen() {
  return (
    <MotionConfig reducedMotion="user">
      <DemoStage
        ariaLabel="Demonstration of the staff item-library management screen"
        script={LIBRARY_DEMO_SCRIPT}
        stageWidth={SHELL_W}
        stageHeight={SHELL_H}
        childRadius={RADIUS.lg}
      >
        <Library />
      </DemoStage>
    </MotionConfig>
  );
}
