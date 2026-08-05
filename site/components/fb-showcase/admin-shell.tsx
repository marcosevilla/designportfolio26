"use client";

/**
 * Shared admin shell for the fb-showcase staff-side specimens: the polished
 * window bar, sidebar, and MDI icon helper. Extracted verbatim from
 * OrderDashboardSpecimen (2026-08-04) when ItemLibrarySpecimen needed the
 * identical chrome — frame 56:6548's sidebar matches specimen #2's exactly.
 * Visual contract: NO style changes here without re-verifying BOTH specimens.
 */

import { neutral, RADIUS, TYPE, W } from "./canary-polished-tokens";
import { ICONS } from "./mdi-icons";

export const NAV_W = 216;

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

// ─── Primitives ────────────────────────────────────────────────────────────

export function Icon({
  path,
  size = 16,
  color = neutral[500],
}: {
  path: string;
  size?: number;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      aria-hidden
      style={{ flexShrink: 0, display: "block" }}
    >
      <path d={path} />
    </svg>
  );
}

// ─── Window chrome ─────────────────────────────────────────────────────────

/**
 * Minimal desktop window bar. Deliberately understated — three neutral dots
 * and a domain chip, no browser affordances — so it frames the artifact as a
 * desktop app without competing with it. The phone specimen's Safari bar plays
 * the same role on the guest side.
 */
export function WindowChrome() {
  return (
    <div
      style={{
        height: 36,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        paddingInline: 14,
        gap: 6,
        backgroundColor: neutral[50],
        borderBottom: `1px solid ${neutral[100]}`,
        position: "relative",
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 10,
            height: 10,
            borderRadius: RADIUS.full,
            backgroundColor: neutral[300],
          }}
        />
      ))}
      <span
        style={{
          ...TYPE.micro,
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          color: neutral[500],
          backgroundColor: neutral[0],
          border: `1px solid ${neutral[200]}`,
          borderRadius: RADIUS.full,
          padding: "2px 12px",
        }}
      >
        app.canaryhq.com
      </span>
    </div>
  );
}

// ─── Sidebar ───────────────────────────────────────────────────────────────

export function Sidebar({ active = "F&B Ordering" }: { active?: string }) {
  return (
    <nav
      style={{
        width: NAV_W,
        flexShrink: 0,
        height: "100%",
        backgroundColor: neutral[50],
        borderRight: `1px solid ${neutral[100]}`,
        paddingInline: 8,
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      {/* Property selector */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "16px 12px",
        }}
      >
        <span
          style={{
            ...TYPE.body,
            fontWeight: W.medium,
            color: neutral[800],
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {PROPERTY.short}
        </span>
        <span style={{ ...TYPE.caption, color: neutral[400] }}>
          {PROPERTY.id}
        </span>
        <span style={{ marginLeft: "auto" }}>
          <Icon path={ICONS.unfoldMore} size={16} color={neutral[500]} />
        </span>
      </div>

      {NAV_SECTIONS.map((section, si) => (
        <div key={si}>
          {si > 0 && (
            <div
              style={{
                height: 1,
                backgroundColor: neutral[200],
                margin: "12px 12px",
              }}
            />
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {section.map((item) => {
              const isActive = item.label === active;
              return (
                <div
                  key={item.label}
                  style={{
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    paddingInline: 12,
                    borderRadius: RADIUS.sm,
                    backgroundColor: isActive ? neutral[200] : "transparent",
                  }}
                >
                  <Icon
                    path={ICONS[item.icon as keyof typeof ICONS]}
                    size={16}
                    color={isActive ? neutral[800] : neutral[500]}
                  />
                  <span
                    style={{
                      ...TYPE.body,
                      fontWeight: isActive ? W.medium : W.regular,
                      color: isActive ? neutral[800] : neutral[600],
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div
        style={{
          height: 1,
          backgroundColor: neutral[200],
          margin: "12px 12px",
        }}
      />
      <div
        style={{
          height: 36,
          display: "flex",
          alignItems: "center",
          gap: 12,
          paddingInline: 12,
          borderRadius: RADIUS.sm,
        }}
      >
        <Icon path={ICONS.cog} size={16} color={neutral[500]} />
        <span style={{ ...TYPE.body, color: neutral[600] }}>Settings</span>
      </div>
    </nav>
  );
}
