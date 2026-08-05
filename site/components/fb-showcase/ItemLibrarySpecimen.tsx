"use client";

import { useState } from "react";
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
 * 1177px shell as `OrderDashboardSpecimen`. Static pass only: shell, chrome,
 * tabs, and the 8-row table render, but nothing is wired up yet — no toggle,
 * no edit/delete, no tab switching, no "Create new item". Interactions land
 * in a later specimen pass; this one just has to look right next to #2.
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

// ─── Primitives ────────────────────────────────────────────────────────────

function Checkbox() {
  return (
    <div
      style={{
        width: 16,
        height: 16,
        border: `1.5px solid ${neutral[300]}`,
        borderRadius: RADIUS.xs,
        backgroundColor: neutral[0],
      }}
    />
  );
}

function AvailabilitySwitch({ on }: { on: boolean }) {
  return (
    <div
      style={{
        width: 36,
        height: 20,
        borderRadius: RADIUS.full,
        backgroundColor: on ? primary[500] : neutral[300],
        position: "relative",
        flexShrink: 0,
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
    </div>
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
}: {
  item: LibraryItem;
  available: boolean;
  first: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: COLUMNS,
        alignItems: "center",
        height: ROW_H,
        borderTop: first ? "none" : `1px solid ${neutral[100]}`,
      }}
    >
      <Checkbox />

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

      <span style={{ ...TYPE.body, color: neutral[600] }}>
        {formatMenus(item.menus)}
      </span>

      <span style={{ ...TYPE.body, color: neutral[900] }}>
        ${item.price.toFixed(2)}
      </span>

      <span style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12 }}>
        <AvailabilitySwitch on={available} />
        <Icon path={ICONS.pencil} size={18} color={neutral[500]} />
        <Icon path={ICONS.trashCan} size={18} color={neutral[500]} />
      </span>
    </div>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────

function Library() {
  const [available] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(LIBRARY_ITEMS.map((item) => [item.id, true])),
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
                      cursor: active ? "default" : "default",
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
                {LIBRARY_ITEMS.map((item, i) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    available={available[item.id]}
                    first={i === 0}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ItemLibrarySpecimen() {
  return <Library />;
}
