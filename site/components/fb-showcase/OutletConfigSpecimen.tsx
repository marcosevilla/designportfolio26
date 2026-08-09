"use client";

import { useRef, useState } from "react";
import DemoStage, { type DemoStep } from "@/components/DemoStage";
import { danger, ELEV, INTER, neutral, primary, RADIUS, TYPE, W } from "./canary-polished-tokens";
import { ICONS } from "./mdi-icons";
import { CHROME_H, Icon, PROPERTY, WindowChrome } from "./admin-shell";
import {
  DELIVERY_TYPES,
  FEES,
  FEE_COLUMNS,
  HERO_SRC,
  LANGUAGE,
  MENUS,
  POS_FIELDS,
  PREVIEW,
  TAXES,
  TAX_COLUMNS,
  money,
  priceBreakdown,
  type DeliveryTypeId,
  type Fee,
} from "./outlet-config-data";

/**
 * Canary's outlet-configuration screen — where a property turns a dining
 * outlet into an orderable one: connect its menus, choose the delivery type
 * that the whole product is organised around, and price out what a guest
 * actually pays. Recreated from Figma frame `64:8703` ("F&B / Setup + POS /
 * 01 F&B Ordering Setup (Compendium V2)", section `64:9088` "5 - outlet
 * configuration") in Canary Polished Visuals.
 *
 * This is the settings side of the product, so it wears a different shell
 * from specimens #2–#4: a dark left rail of property/product settings rather
 * than the light F&B nav in `admin-shell.tsx`. Only the window chrome, the
 * `Icon` helper, and `PROPERTY` are shared with the other staff specimens —
 * the rail lives here because nothing else uses it yet.
 *
 * Interactive: the Menus card connects a menu, the delivery-type radios are a
 * real radio group, and the Taxes-and-fees table goes editable — every fee and
 * tax feeds the price-breakdown card, which recomputes from the numbers rather
 * than hard-coding the frame's total. Translations, POS settings, the sidebar,
 * and Save are deliberately inert.
 *
 * Deliberate deviations from the frame (flagged for Marco, 2026-08-04):
 * 1. Typeface — the frame is set in Roboto because this section never went
 *    through the polish pipeline. Rendered in Inter via canary-polished-tokens
 *    so it matches specimens #1–#4. One-line revert if Marco wants Roboto.
 * 2. Left rail is `neutral[800]`, not the frame's literal `#333`. This is the
 *    exact "nav-rail ruling" still open in docs/CURRENT-STATE.md (cool
 *    neutral vs. plain gray) — swap the one constant below to change it.
 * 3. Fixture is specimen #4's, not the frame's: the frame is authored against
 *    a "Statler" property with a pizza photo and roomservice@statler.com;
 *    Marco's call was to reuse the Lodge/izakaya fixture so all five F&B demos
 *    describe one hotel. Structural copy is verbatim.
 * 4. Geometry adapted from the frame's 1440px canvas to the 1177px shell the
 *    other staff specimens use (form column 780→617, preview pane 480→380).
 *    The guest preview card stays at its native 340px — it's the artifact.
 * 5. The frame's Canary bird logo sits in the rail at 35% opacity; that asset
 *    wasn't exported, so the slot holds a plain wordmark at the same opacity.
 * 6. Avatar is an initials chip, not the frame's photograph (no new asset).
 * 7. Radii snapped to the polished scale (frame 10/20 → 12/16); the frame's
 *    hairline card shadow is kept literal, since ELEV.sm reads too heavy on
 *    five stacked cards.
 */

// ─── Geometry (adapted from frame 64:8703 to the 1177 shell) ───────────────

const APP_W = 1177; // matches specimens #2–#4
const NAV_W = 180; // the settings rail is narrower than admin-shell's 216
const TOPBAR_H = 51;
const HEADER_H = 73;
const BODY_H = 776; // frame: 900 − 51 − 73
const APP_H = TOPBAR_H + HEADER_H + BODY_H; // 900
const SHELL_W = APP_W;
const SHELL_H = APP_H + CHROME_H; // 936

const PREVIEW_W = 380; // frame: 480
const FORM_W = APP_W - NAV_W - PREVIEW_W; // 617 (frame: 780)
const CARD_W = FORM_W - 48; // 24px gutters
const CARD_INNER = CARD_W - 48; // 24px card padding

const PREVIEW_CARD_W = 340; // native, unscaled

/** The frame's hairline card shadow — ELEV.sm reads too heavy stacked five deep. */
const CARD_SHADOW = "0 1px 1px rgba(19, 24, 34, 0.05)";

/** Deviation #2 — the open nav-rail ruling. `#333333` is the frame's literal. */
const RAIL_BG = neutral[800];

// ─── Settings rail ─────────────────────────────────────────────────────────

const RAIL_SECTIONS: { label: string; items: { label: string; icon: keyof typeof ICONS }[] }[] = [
  {
    label: "General settings",
    items: [
      { label: "Property Info", icon: "home" },
      { label: "Branding", icon: "palette" },
      { label: "Staff Members", icon: "accountGroup" },
      { label: "Security", icon: "shieldOutline" },
      { label: "Integrations", icon: "cog" },
    ],
  },
  {
    label: "Product settings",
    items: [
      { label: "Compendium", icon: "bookOpenPage" },
      { label: "F&B Ordering", icon: "forkKnife" },
      { label: "Upsells", icon: "trendingUp" },
      { label: "Check-in", icon: "login" },
      { label: "Checkout", icon: "logout" },
      { label: "Messages", icon: "message" },
      { label: "Digital Tips", icon: "currencyUsd" },
      { label: "Authorizations", icon: "shieldCheck" },
      { label: "Contracts", icon: "fileDocument" },
      { label: "Payment Links", icon: "linkVariant" },
    ],
  },
];

function SettingsRail({ active = "F&B Ordering" }: { active?: string }) {
  return (
    <nav
      style={{
        width: NAV_W,
        flexShrink: 0,
        backgroundColor: RAIL_BG,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Logo slot — see deviation #5 */}
      <div
        style={{
          height: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            ...TYPE.bodyL,
            fontWeight: W.semibold,
            color: neutral[0],
            opacity: 0.35,
            letterSpacing: "0.5px",
          }}
        >
          canary
        </span>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        {RAIL_SECTIONS.map((section, si) => (
          <div key={section.label}>
            {si > 0 && (
              <div
                style={{
                  height: 1,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  marginBottom: 16,
                }}
              />
            )}
            <div
              style={{
                ...TYPE.caption,
                color: neutral[0],
                opacity: 0.3,
                textTransform: "uppercase",
                letterSpacing: "0.4px",
                padding: "0 16px 16px",
              }}
            >
              {section.label}
            </div>
            <div>
              {section.items.map((item) => {
                const isActive = item.label === active;
                return (
                  <div
                    key={item.label}
                    style={{
                      height: 40,
                      display: "flex",
                      alignItems: "center",
                      position: "relative",
                    }}
                  >
                    {isActive && (
                      <span
                        style={{
                          position: "absolute",
                          left: 8,
                          right: 8,
                          top: 4,
                          bottom: 4,
                          backgroundColor: neutral[0],
                          borderRadius: RADIUS.sm,
                        }}
                      />
                    )}
                    <span
                      style={{
                        position: "relative",
                        marginLeft: 16,
                        display: "flex",
                        opacity: isActive ? 1 : 0.5,
                      }}
                    >
                      <Icon
                        path={ICONS[item.icon]}
                        size={24}
                        color={isActive ? RAIL_BG : neutral[0]}
                      />
                    </span>
                    <span
                      style={{
                        ...TYPE.body,
                        position: "relative",
                        marginLeft: 8,
                        color: isActive ? RAIL_BG : neutral[0],
                        fontWeight: isActive ? W.medium : W.regular,
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
      </div>

      <div
        style={{
          height: 64,
          flexShrink: 0,
          backgroundColor: neutral[900],
          display: "flex",
          alignItems: "center",
        }}
      >
        <span style={{ marginLeft: 16, display: "flex", opacity: 0.5 }}>
          <Icon path={ICONS.arrowLeft} size={24} color={neutral[0]} />
        </span>
        <span
          style={{
            ...TYPE.body,
            marginLeft: 8,
            color: neutral[0],
            fontWeight: W.medium,
          }}
        >
          Back
        </span>
      </div>
    </nav>
  );
}

// ─── Top bar + page header ─────────────────────────────────────────────────

function TopBar() {
  return (
    <div
      style={{
        height: TOPBAR_H,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        borderBottom: `1px solid ${neutral[200]}`,
        backgroundColor: neutral[0],
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{ ...TYPE.body, fontWeight: W.medium, color: neutral[900] }}
        >
          {PROPERTY.short}
        </span>
        <Icon path={ICONS.chevronDown} size={20} color={neutral[500]} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: RADIUS.full,
            backgroundColor: neutral[300],
            color: neutral[700],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            ...TYPE.caption,
            fontWeight: W.semibold,
          }}
          aria-hidden
        >
          MS
        </span>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{ ...TYPE.caption, fontWeight: W.medium, color: neutral[900] }}
          >
            Marco Sevilla
          </span>
          <span style={{ ...TYPE.micro, color: neutral[400] }}>
            CC Permissions, Can view credit card + 4 more
          </span>
        </div>
        <Icon path={ICONS.chevronDown} size={20} color={neutral[500]} />
      </div>
    </div>
  );
}

function PageHeader({ onSave, saving }: { onSave: () => void; saving: boolean }) {
  return (
    <div
      style={{
        height: HEADER_H,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        borderBottom: `1px solid ${neutral[200]}`,
        backgroundColor: neutral[0],
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ display: "flex" }}>
          <Icon path={ICONS.arrowLeft} size={24} color={neutral[700]} />
        </span>
        <span
          style={{ ...TYPE.titleS, fontWeight: W.medium, color: neutral[900] }}
        >
          F&amp;B ordering
        </span>
      </div>
      <button
        type="button"
        data-demo="save"
        onClick={onSave}
        style={{
          height: 40,
          paddingInline: 16,
          borderRadius: RADIUS.sm,
          border: "none",
          backgroundColor: primary[500],
          color: neutral[0],
          ...TYPE.body,
          fontWeight: W.medium,
          cursor: "pointer",
        }}
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}

// ─── Form primitives ───────────────────────────────────────────────────────

function SectionCard({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section
      style={{
        width: CARD_W,
        backgroundColor: neutral[0],
        border: `1px solid ${neutral[200]}`,
        borderRadius: RADIUS.lg,
        boxShadow: CARD_SHADOW,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          padding: "20px 24px 8px",
        }}
      >
        <div>
          <h3
            style={{
              ...TYPE.bodyL,
              fontWeight: W.medium,
              color: neutral[900],
              margin: 0,
            }}
          >
            {title}
          </h3>
          {subtitle && (
            <p style={{ ...TYPE.caption, color: neutral[600], margin: "4px 0 0" }}>
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
      {children && <div style={{ padding: "0 24px 20px" }}>{children}</div>}
    </section>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <div style={{ ...TYPE.caption, color: neutral[600], display: "flex", gap: 2 }}>
      {children}
      {required && <span style={{ color: danger[500] }}>*</span>}
    </div>
  );
}

function Select({ value, width }: { value: string; width?: number }) {
  return (
    <div
      style={{
        width: width ?? "100%",
        height: 40,
        marginTop: 6,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingInline: 12,
        border: `1px solid ${neutral[300]}`,
        borderRadius: RADIUS.sm,
        backgroundColor: neutral[0],
      }}
    >
      <span style={{ ...TYPE.body, color: neutral[900] }}>{value}</span>
      <Icon path={ICONS.unfoldMore} size={16} color={neutral[500]} />
    </div>
  );
}

// ─── Taxes and fees ────────────────────────────────────────────────────────

const FEE_GRID = "1.7fr 1fr 1.5fr 0.8fr";
const TAX_GRID = "1.7fr 1.2fr 1fr 1.3fr";

function TableHead({ columns, grid }: { columns: readonly string[]; grid: string }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: grid,
        gap: 8,
        padding: "0 16px 6px",
      }}
    >
      {columns.map((c) => (
        <span key={c} style={{ ...TYPE.micro, color: neutral[500] }}>
          {c}
        </span>
      ))}
    </div>
  );
}

function AddRowButton({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "12px 4px 0",
        ...TYPE.body,
        fontWeight: W.medium,
        color: primary[500],
      }}
    >
      <Icon path={ICONS.plus} size={16} color={primary[500]} />
      {label}
    </div>
  );
}

// ─── Guest preview ─────────────────────────────────────────────────────────

function PreviewRow({
  icon,
  label,
  last,
}: {
  icon: keyof typeof ICONS;
  label: string;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 0",
        borderBottom: last ? "none" : `1px solid ${neutral[100]}`,
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Icon path={ICONS[icon]} size={20} color={neutral[700]} />
        <span style={{ ...TYPE.body, color: neutral[900] }}>{label}</span>
      </span>
      <Icon path={ICONS.chevronRight} size={16} color={neutral[400]} />
    </div>
  );
}

function GuestPreview() {
  return (
    <aside
      style={{
        width: PREVIEW_W,
        flexShrink: 0,
        backgroundColor: neutral[50],
        padding: 20,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: PREVIEW_CARD_W,
          backgroundColor: neutral[0],
          border: `1px solid ${neutral[200]}`,
          borderRadius: RADIUS.xl,
          boxShadow: ELEV.md,
          overflow: "hidden",
        }}
      >
        { }
        <img
          src={HERO_SRC}
          alt=""
          style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }}
        />
        <div style={{ padding: "16px 20px 20px" }}>
          <h4
            style={{
              ...TYPE.titleS,
              fontWeight: W.medium,
              color: neutral[900],
              margin: 0,
            }}
          >
            {PREVIEW.title}
          </h4>
          <p
            style={{
              ...TYPE.bodyS,
              lineHeight: "20px",
              color: neutral[700],
              margin: "16px 0 0",
            }}
          >
            {PREVIEW.description}
          </p>
        </div>
        <div style={{ padding: "0 20px 20px" }}>
          <PreviewRow icon="phone" label={PREVIEW.phone} />
          <PreviewRow icon="email" label={PREVIEW.email} />
          <PreviewRow icon="web" label={PREVIEW.website} />
          <PreviewRow icon="clock" label={PREVIEW.hours} last />
        </div>
        <div
          style={{
            borderTop: `1px solid ${neutral[100]}`,
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              ...TYPE.caption,
              color: neutral[600],
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {PREVIEW.language}
            <Icon path={ICONS.chevronDown} size={14} color={neutral[500]} />
          </span>
          <span style={{ ...TYPE.micro, color: neutral[400] }}>{PREVIEW.legal}</span>
        </div>
      </div>
    </aside>
  );
}

// ─── Screen ────────────────────────────────────────────────────────────────

function OutletConfigScreen() {
  const [menusConnected, setMenusConnected] = useState(false);
  const [deliveryType, setDeliveryType] = useState<DeliveryTypeId>("in-room");
  const [editingFees, setEditingFees] = useState(false);
  const [fees, setFees] = useState<Fee[]>(FEES);
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const breakdown = priceBreakdown(fees, TAXES);

  const setFeeAmount = (id: string, raw: string) => {
    const cleaned = raw.replace(/[^0-9.]/g, "");
    setFees((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, amount: cleaned === "" ? 0 : Number(cleaned) } : f,
      ),
    );
  };

  return (
    <div
      style={{
        width: SHELL_W,
        height: SHELL_H,
        display: "flex",
        flexDirection: "column",
        backgroundColor: neutral[0],
        fontFamily: INTER,
        overflow: "hidden",
      }}
    >
      <WindowChrome />
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <SettingsRail />
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <TopBar />
          <PageHeader
            saving={saving}
            onSave={() => {
              setSaving(true);
              window.setTimeout(() => setSaving(false), 900);
            }}
          />
          <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
            {/* Form column — 1605px of settings in a 776px viewport, so it
                scrolls. `position: relative` because a scaled ancestor plus an
                unpositioned scroll container breaks offsetTop math. */}
            <div
              ref={formRef}
              data-demo="form-column"
              style={{
                width: FORM_W,
                flexShrink: 0,
                position: "relative",
                overflowY: "auto",
                borderRight: `1px solid ${neutral[200]}`,
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 16,
                scrollbarWidth: "none",
              }}
            >
              <SectionCard title="Translations">
                <FieldLabel>Language</FieldLabel>
                <Select value={LANGUAGE} width={176} />
              </SectionCard>

              <SectionCard
                title="Menus"
                subtitle={
                  menusConnected
                    ? `${MENUS.connected.name} · ${MENUS.connected.items} items`
                    : MENUS.empty
                }
                action={
                  <button
                    type="button"
                    data-demo="connect-menus"
                    onClick={() => setMenusConnected(true)}
                    style={{
                      ...TYPE.body,
                      fontWeight: W.medium,
                      color: primary[500],
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                    }}
                  >
                    {menusConnected ? MENUS.connectedLabel : MENUS.connectLabel}
                  </button>
                }
              />

              <SectionCard title="Delivery type">
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {DELIVERY_TYPES.map((option) => {
                    const selected = option.id === deliveryType;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        data-demo={`delivery-${option.id}`}
                        onClick={() => setDeliveryType(option.id)}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 12,
                          width: "100%",
                          padding: 16,
                          textAlign: "left",
                          border: `1px solid ${selected ? primary[500] : neutral[200]}`,
                          borderRadius: RADIUS.md,
                          backgroundColor: selected ? primary[50] : neutral[0],
                          cursor: "pointer",
                          transition: "background-color 160ms ease, border-color 160ms ease",
                        }}
                      >
                        <span
                          style={{
                            width: 20,
                            height: 20,
                            marginTop: 2,
                            flexShrink: 0,
                            borderRadius: RADIUS.full,
                            border: `2px solid ${selected ? primary[500] : neutral[400]}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {selected && (
                            <span
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: RADIUS.full,
                                backgroundColor: primary[500],
                              }}
                            />
                          )}
                        </span>
                        <span>
                          <span
                            style={{
                              ...TYPE.body,
                              fontWeight: W.medium,
                              color: neutral[900],
                              display: "block",
                            }}
                          >
                            {option.label}
                          </span>
                          <span
                            style={{
                              ...TYPE.caption,
                              color: neutral[600],
                              display: "block",
                              marginTop: 2,
                            }}
                          >
                            {option.hint}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </SectionCard>

              <SectionCard title="POS settings">
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {POS_FIELDS.map((field) => (
                    <div key={field.label}>
                      <FieldLabel required>{field.label}</FieldLabel>
                      <Select value={field.placeholder} />
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard
                title="Taxes and fees"
                subtitle="Apply flat rate or percentage fees or taxes to guest orders."
                action={
                  <button
                    type="button"
                    data-demo="edit-fees"
                    onClick={() => setEditingFees((v) => !v)}
                    style={{
                      height: 36,
                      paddingInline: 16,
                      borderRadius: RADIUS.sm,
                      border: `1px solid ${editingFees ? primary[500] : neutral[300]}`,
                      backgroundColor: neutral[0],
                      color: editingFees ? primary[500] : neutral[700],
                      ...TYPE.body,
                      fontWeight: W.medium,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    {editingFees ? "Done" : "Edit"}
                  </button>
                }
              >
                {/* Fees */}
                <TableHead columns={FEE_COLUMNS} grid={FEE_GRID} />
                <div
                  style={{
                    border: `1px solid ${neutral[200]}`,
                    borderRadius: RADIUS.lg,
                    overflow: "hidden",
                  }}
                >
                  {fees.map((fee, i) => (
                    <div
                      key={fee.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: FEE_GRID,
                        gap: 8,
                        alignItems: "center",
                        padding: "12px 16px",
                        borderTop: i === 0 ? "none" : `1px solid ${neutral[100]}`,
                      }}
                    >
                      <span style={{ ...TYPE.body, color: neutral[900] }}>
                        {fee.label}
                      </span>
                      {editingFees && fee.amount !== null ? (
                        <input
                          data-demo={`fee-amount-${fee.id}`}
                          value={money(fee.amount).replace("$", "")}
                          onChange={(e) => setFeeAmount(fee.id, e.target.value)}
                          aria-label={`${fee.label} amount`}
                          style={{
                            ...TYPE.body,
                            width: "100%",
                            minWidth: 0,
                            height: 32,
                            paddingInline: 8,
                            color: neutral[900],
                            border: `1px solid ${primary[500]}`,
                            borderRadius: RADIUS.sm,
                            backgroundColor: neutral[0],
                          }}
                        />
                      ) : (
                        <span style={{ ...TYPE.body, color: neutral[900] }}>
                          {fee.amount !== null ? money(fee.amount) : `${fee.percent}%`}
                        </span>
                      )}
                      <span style={{ ...TYPE.body, color: neutral[600] }}>
                        {fee.posCharge}
                      </span>
                      <span style={{ ...TYPE.body, color: neutral[600] }}>
                        {fee.taxable ? "Yes" : "No"}
                      </span>
                    </div>
                  ))}
                </div>
                <AddRowButton label="Add fee" />

                {/* Taxes */}
                <div style={{ height: 20 }} />
                <TableHead columns={TAX_COLUMNS} grid={TAX_GRID} />
                <div
                  style={{
                    border: `1px solid ${neutral[200]}`,
                    borderRadius: RADIUS.lg,
                    overflow: "hidden",
                  }}
                >
                  {TAXES.map((tax, i) => (
                    <div
                      key={tax.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: TAX_GRID,
                        gap: 8,
                        alignItems: "center",
                        padding: "12px 16px",
                        borderTop: i === 0 ? "none" : `1px solid ${neutral[100]}`,
                      }}
                    >
                      <span style={{ ...TYPE.body, color: neutral[900] }}>
                        {tax.label}
                      </span>
                      <span style={{ ...TYPE.body, color: neutral[600] }}>
                        {tax.type}
                      </span>
                      <span style={{ ...TYPE.body, color: neutral[900] }}>
                        {tax.rate}%
                      </span>
                      <span style={{ ...TYPE.body, color: neutral[600] }}>
                        {tax.applyTo}
                      </span>
                    </div>
                  ))}
                </div>
                <AddRowButton label="Add tax" />

                {/* Price breakdown */}
                <div style={{ height: 24 }} />
                <FieldLabel>Price breakdown example</FieldLabel>
                <div
                  style={{
                    marginTop: 6,
                    border: `1px solid ${neutral[200]}`,
                    borderRadius: RADIUS.lg,
                    padding: "4px 16px",
                  }}
                  data-demo="price-breakdown"
                >
                  {breakdown.rows.map((row) => (
                    <div
                      key={row.id}
                      style={{
                        height: 33,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ ...TYPE.body, color: neutral[600] }}>
                        {row.label}
                      </span>
                      <span style={{ ...TYPE.body, color: neutral[900] }}>
                        {money(row.value)}
                      </span>
                    </div>
                  ))}
                  <div
                    style={{
                      height: 42,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderTop: `1px solid ${neutral[200]}`,
                    }}
                  >
                    <span
                      style={{ ...TYPE.body, fontWeight: W.medium, color: neutral[900] }}
                    >
                      Total
                    </span>
                    <span
                      data-demo="price-total"
                      style={{ ...TYPE.body, fontWeight: W.medium, color: neutral[900] }}
                    >
                      {money(breakdown.total)}
                    </span>
                  </div>
                </div>
              </SectionCard>
            </div>

            <GuestPreview />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Choreography ──────────────────────────────────────────────────────────

/**
 * Phase A placeholder — the static screen holds still for review. The real
 * ~15s loop (connect menus → delivery type → edit the delivery fee → total
 * recomputes) lands after Marco clears the fidelity gate.
 */
const OUTLET_CONFIG_SCRIPT: DemoStep[] = [{ type: "wait", ms: 6000 }];

export default function OutletConfigSpecimen() {
  return (
    <DemoStage
      script={OUTLET_CONFIG_SCRIPT}
      ariaLabel="Canary outlet configuration — menus, delivery type, taxes and fees"
      stageWidth={SHELL_W}
      stageHeight={SHELL_H}
    >
      <OutletConfigScreen />
    </DemoStage>
  );
}
