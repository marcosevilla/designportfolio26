"use client";

/**
 * FnbCartSpecimen — recreation of the F&B in-room dining ordering flow
 * (Unified Cart, DSN-1828). Replaces the fb-mobile.mp4 ambient video on
 * the F&B case study. Wrapped in DemoStage: a choreographed ghost-cursor
 * run plays on loop by default (FNB_DEMO_SCRIPT below); hovering offers
 * "Interact with flow", which hands visitors the fully interactive
 * prototype — browse the menu, build a cart with modifier choices, and
 * place the order end-to-end.
 *
 * Interaction grammar mirrors the production prototype
 * (msevilla-canary-prototypes → unified-cart), with two deliberate
 * portfolio deviations:
 *   - modifier selects are radio groups (Marco 2026-08-03), not dropdowns
 *   - type is Geist (site family) instead of Roboto
 *
 * The phone interior is a product artifact — literal Canary B&W values
 * (INK), unchanged across site themes. Only the surrounding panel follows
 * the theme. No canvas / rAF: pure DOM + CSS transitions, with framer
 * bottom sheets. MotionConfig + motion-reduce classes honor
 * prefers-reduced-motion.
 *
 * Layout rule inherited from the prototype: no position:fixed inside the
 * phone (ancestors carry transforms) — the phone is a flex column of
 * scroll body + flexShrink footer; overlays use absolute inset.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import DemoStage, { type DemoStep } from "@/components/DemoStage";
import {
  Cart,
  CartLine,
  DELIVERY_FEE,
  ICON_PATHS,
  INFO_HERO,
  INK,
  MENU_SECTIONS,
  NO_CHARGE_COPY,
  RAD,
  SALES_TAX,
  SCHEDULED_DELIVERY,
  SpecimenItem,
  cartCount,
  cartSubtotal,
  formatMoney,
  lineKey,
  type IconName,
} from "./fnb-specimen-data";

const EASE = [0.32, 0.72, 0, 1] as const;
const EASE_CSS = "cubic-bezier(0.32, 0.72, 0, 1)";
const FONT = "var(--font-geist-sans), system-ui, sans-serif";

// ─── Icon ──────────────────────────────────────────────────────────────────

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      style={{ display: "block", flexShrink: 0 }}
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

// ─── Square icon button (the product's RoundIconButton) ────────────────────

function SquareIconButton({
  icon,
  onClick,
  ariaLabel,
  disabled,
  secondary,
  size = 30,
  demoId,
}: {
  icon: IconName;
  onClick: () => void;
  ariaLabel: string;
  disabled?: boolean;
  secondary?: boolean;
  size?: number;
  /** data-demo target name for the DemoStage choreography */
  demoId?: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      data-demo={demoId}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{
        width: size,
        height: size,
        borderRadius: RAD.btn,
        border: "none",
        backgroundColor: disabled
          ? INK.line
          : secondary
            ? INK.hairline
            : INK.brand,
        color: disabled ? INK.disabledText : secondary ? INK.text2 : INK.white,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "default" : "pointer",
        flexShrink: 0,
        padding: 0,
        transition: "background-color 150ms ease",
      }}
    >
      <Icon name={icon} size={size >= 40 ? 20 : 16} />
    </button>
  );
}

// ─── Row stepper: [− | trash] n [+] (menu-stepper removal grammar) ─────────

function RowStepper({
  qty,
  atMax,
  itemName,
  onStepDown,
  onStepUp,
}: {
  qty: number;
  atMax: boolean;
  itemName: string;
  onStepDown: () => void;
  onStepUp: () => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <SquareIconButton
        icon={qty <= 1 ? "trash" : "minus"}
        onClick={onStepDown}
        secondary
        ariaLabel={
          qty <= 1 ? `Remove ${itemName}` : `Decrease ${itemName} quantity`
        }
      />
      <span
        style={{
          minWidth: 14,
          textAlign: "center",
          fontSize: 14,
          fontWeight: 600,
          color: INK.text1,
        }}
      >
        {qty}
      </span>
      <SquareIconButton
        icon="plus"
        onClick={onStepUp}
        disabled={atMax}
        ariaLabel={`Add another ${itemName}`}
      />
    </div>
  );
}

// ─── Browse item row ───────────────────────────────────────────────────────

function BrowseItemRow({
  item,
  qtyInCart,
  isLast,
  onAdd,
  onOpenDetails,
  onStepDown,
}: {
  item: SpecimenItem;
  qtyInCart: number;
  isLast: boolean;
  onAdd: () => void;
  onOpenDetails: () => void;
  onStepDown: () => void;
}) {
  const isAdded = qtyInCart > 0;
  const atMax = qtyInCart >= item.maxQty;
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpenDetails}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenDetails();
        }
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 10px",
        borderBottom: isLast ? "none" : `1px solid ${INK.hairline}`,
        backgroundColor: INK.white,
        cursor: "pointer",
      }}
    >
      <img
        src={item.image}
        alt=""
        width={44}
        height={44}
        loading="lazy"
        style={{
          width: 44,
          height: 44,
          borderRadius: RAD.img,
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: INK.text1,
            lineHeight: "18px",
          }}
        >
          {item.name}
        </div>
        <div style={{ marginTop: 3, fontSize: 13, color: INK.text3 }}>
          ${formatMoney(item.price)}
        </div>
      </div>
      <div
        style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {isAdded ? (
          <RowStepper
            qty={qtyInCart}
            atMax={atMax}
            itemName={item.name}
            onStepDown={onStepDown}
            onStepUp={onAdd}
          />
        ) : (
          <SquareIconButton
            icon="plus"
            onClick={onAdd}
            ariaLabel={`Add ${item.name}`}
            demoId={`add-${item.id}`}
          />
        )}
      </div>
    </div>
  );
}

// ─── Radio modifier group (portfolio deviation: radios, not a dropdown) ────

function RadioGroup({
  prompt,
  options,
  value,
  onChange,
}: {
  prompt: string;
  options: string[];
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset style={{ border: "none", margin: 0, padding: 0, marginTop: 18 }}>
      <legend
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: INK.text1,
          padding: 0,
          marginBottom: 8,
        }}
      >
        {prompt}{" "}
        <span style={{ fontWeight: 400, color: INK.text3 }}>(Required)</span>
      </legend>
      <div
        style={{
          border: `1px solid ${INK.line}`,
          borderRadius: RAD.card,
          overflow: "hidden",
        }}
      >
        {options.map((opt, idx) => {
          const checked = value === opt;
          return (
            <label
              key={opt}
              data-demo={`option-${opt}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "11px 12px",
                borderTop: idx === 0 ? "none" : `1px solid ${INK.hairline}`,
                cursor: "pointer",
                backgroundColor: INK.white,
              }}
            >
              <input
                type="radio"
                name={prompt}
                value={opt}
                checked={checked}
                onChange={() => onChange(opt)}
                className="sr-only"
              />
              <span
                aria-hidden
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 999,
                  flexShrink: 0,
                  border: checked
                    ? `5.5px solid ${INK.brand}`
                    : `1.5px solid ${INK.inputBorder}`,
                  backgroundColor: INK.white,
                  boxSizing: "border-box",
                  transition: "border 120ms ease",
                }}
              />
              <span style={{ fontSize: 14, color: INK.text1 }}>{opt}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

// ─── Bottom-sheet shell (drawer + stepper sheet) ───────────────────────────

function SheetShell({
  onClose,
  children,
  maxHeight = "92%",
  labelledBy,
}: {
  onClose: () => void;
  children: ReactNode;
  maxHeight?: string;
  labelledBy?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "flex-end",
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.32, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxHeight,
          backgroundColor: INK.white,
          borderTopLeftRadius: RAD.sheet,
          borderTopRightRadius: RAD.sheet,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// ─── Item detail drawer ────────────────────────────────────────────────────

function ItemDetailDrawer({
  item,
  onClose,
  onAdd,
}: {
  item: SpecimenItem;
  onClose: () => void;
  onAdd: (qty: number, variant?: string, specialRequest?: string) => void;
}) {
  const [qty, setQty] = useState(1);
  const [variant, setVariant] = useState<string | undefined>(undefined);
  const [specialRequest, setSpecialRequest] = useState("");
  const needsVariant = !!item.variantOptions?.length;
  const canAdd = !needsVariant || !!variant;

  return (
    <SheetShell onClose={onClose} labelledBy="specimen-drawer-title">
      <div style={{ overflowY: "auto" }}>
        <div style={{ position: "relative" }}>
          <img
            src={item.image}
            alt={item.name}
            style={{
              width: "100%",
              height: 181,
              objectFit: "cover",
              display: "block",
            }}
          />
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              width: 30,
              height: 30,
              borderRadius: RAD.btn,
              border: "none",
              backgroundColor: INK.white,
              color: INK.text1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
              padding: 0,
            }}
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        <div style={{ padding: "14px 16px 18px" }}>
          <h4
            id="specimen-drawer-title"
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 600,
              color: INK.text1,
              lineHeight: 1.25,
            }}
          >
            {item.name}
          </h4>
          <div style={{ marginTop: 4, fontSize: 14, color: INK.text3 }}>
            ${formatMoney(item.price)}
          </div>
          <p
            style={{
              margin: "10px 0 0",
              fontSize: 13,
              lineHeight: 1.5,
              color: INK.text2,
            }}
          >
            {item.description}
          </p>

          {needsVariant && (
            <RadioGroup
              prompt={item.variantPrompt!}
              options={item.variantOptions!}
              value={variant}
              onChange={setVariant}
            />
          )}

          <div style={{ marginTop: 18 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: INK.text1,
                marginBottom: 8,
              }}
            >
              Special request{" "}
              <span style={{ fontWeight: 400, color: INK.text3 }}>
                (Optional)
              </span>
            </label>
            <textarea
              value={specialRequest}
              onChange={(e) => setSpecialRequest(e.target.value)}
              placeholder="Allergies, preparation notes…"
              rows={2}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "9px 11px",
                border: `1px solid ${INK.inputBorder}`,
                borderRadius: RAD.btn,
                fontSize: 13,
                fontFamily: FONT,
                color: INK.text1,
                backgroundColor: INK.white,
                outline: "none",
                resize: "none",
              }}
            />
          </div>
        </div>
      </div>

      {/* Sticky drawer footer: stepper + Add to cart · $unit×n */}
      <div
        style={{
          padding: 12,
          borderTop: `1px solid ${INK.line}`,
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <SquareIconButton
            icon="minus"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            ariaLabel="Decrease quantity"
            size={44}
          />
          <span
            style={{
              minWidth: 18,
              textAlign: "center",
              fontSize: 16,
              fontWeight: 600,
              color: INK.text1,
            }}
          >
            {qty}
          </span>
          <SquareIconButton
            icon="plus"
            onClick={() => setQty((q) => Math.min(item.maxQty, q + 1))}
            disabled={qty >= item.maxQty}
            ariaLabel="Increase quantity"
            size={44}
          />
        </div>
        <button
          type="button"
          disabled={!canAdd}
          data-demo="drawer-add"
          onClick={() => {
            onAdd(qty, variant, specialRequest.trim() || undefined);
            onClose();
          }}
          style={{
            flex: 1,
            height: 44,
            borderRadius: RAD.btn,
            border: "none",
            backgroundColor: canAdd ? INK.brand : INK.line,
            color: canAdd ? INK.white : INK.disabledText,
            fontSize: 14,
            fontWeight: 600,
            fontFamily: FONT,
            cursor: canAdd ? "pointer" : "default",
          }}
        >
          Add to cart · ${formatMoney(item.price * qty)}
        </button>
      </div>
    </SheetShell>
  );
}

// ─── Review line (shared: review screen + stepper sheet) ───────────────────

function ReviewLine({
  image,
  name,
  priceLine,
  detailLine,
  qty,
  isFirst,
  onIncrement,
  onDecrement,
  onRemove,
  removeDemoId,
}: {
  image: string;
  name: string;
  priceLine: string;
  detailLine?: string;
  qty: number;
  isFirst: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
  removeDemoId?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        padding: 10,
        borderTop: isFirst ? "none" : `1px solid ${INK.hairline}`,
        alignItems: "center",
        backgroundColor: INK.white,
      }}
    >
      <img
        src={image}
        alt=""
        width={48}
        height={48}
        style={{
          width: 48,
          height: 48,
          borderRadius: RAD.img,
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: INK.text1,
            lineHeight: 1.3,
          }}
        >
          {name}
        </div>
        <div style={{ marginTop: 2, fontSize: 13, color: INK.text3 }}>
          {priceLine}
        </div>
        {detailLine && (
          <div
            style={{
              marginTop: 2,
              fontSize: 12,
              color: INK.text3,
              lineHeight: 1.35,
            }}
          >
            {detailLine}
          </div>
        )}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
        }}
      >
        <SquareIconButton
          icon={qty <= 1 ? "trash" : "minus"}
          onClick={qty <= 1 ? onRemove : onDecrement}
          secondary
          ariaLabel={qty <= 1 ? `Remove ${name}` : "Decrease quantity"}
          size={32}
          demoId={removeDemoId}
        />
        <span
          style={{
            minWidth: 16,
            textAlign: "center",
            fontSize: 14,
            fontWeight: 600,
            color: INK.text1,
          }}
        >
          {qty}
        </span>
        <SquareIconButton
          icon="plus"
          onClick={onIncrement}
          ariaLabel="Increase quantity"
          size={32}
        />
      </div>
    </div>
  );
}

// ─── Menu stepper sheet (variant disambiguation on minus) ──────────────────

function MenuStepperSheet({
  item,
  lines,
  onIncrement,
  onDecrement,
  onRemove,
  onClose,
}: {
  item: SpecimenItem;
  lines: [string, CartLine][];
  onIncrement: (key: string) => void;
  onDecrement: (key: string) => void;
  onRemove: (key: string) => void;
  onClose: () => void;
}) {
  // Removing the last line resolves the ambiguity — nothing left to edit.
  useEffect(() => {
    if (lines.length === 0) onClose();
  }, [lines.length, onClose]);

  return (
    <SheetShell onClose={onClose} maxHeight="72%" labelledBy="specimen-sheet-title">
      <div style={{ padding: "16px 16px 4px", flexShrink: 0 }}>
        <h4
          id="specimen-sheet-title"
          style={{ margin: 0, fontSize: 17, fontWeight: 600, color: INK.text1 }}
        >
          {item.name}
        </h4>
        <p
          style={{
            margin: "4px 0 0",
            fontSize: 13,
            color: INK.text3,
            lineHeight: 1.45,
          }}
        >
          You have a few of these — choose which one to update.
        </p>
      </div>

      <div style={{ overflowY: "auto", padding: "12px 14px 4px" }}>
        <div
          style={{
            border: `1px solid ${INK.line}`,
            borderRadius: RAD.card,
            overflow: "hidden",
          }}
        >
          {lines.map(([key, line], idx) => (
            <ReviewLine
              key={key}
              image={line.item.image}
              name={line.variant ?? line.item.name}
              priceLine={`$${formatMoney(line.item.price * line.qty)}`}
              qty={line.qty}
              isFirst={idx === 0}
              onIncrement={() => onIncrement(key)}
              onDecrement={() => onDecrement(key)}
              onRemove={() => onRemove(key)}
            />
          ))}
        </div>
      </div>

      <div style={{ padding: 14, flexShrink: 0 }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            width: "100%",
            height: 44,
            borderRadius: RAD.btn,
            border: "none",
            backgroundColor: INK.brand,
            color: INK.white,
            fontSize: 14,
            fontWeight: 600,
            fontFamily: FONT,
            cursor: "pointer",
          }}
        >
          Done
        </button>
      </div>
    </SheetShell>
  );
}

// ─── Button spinner (in-button loading, no loading screen) ─────────────────

function ButtonSpinner() {
  return (
    <motion.span
      animate={{ rotate: 360 }}
      transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
      style={{
        width: 18,
        height: 18,
        borderRadius: 999,
        border: "2.5px solid rgba(255,255,255,0.35)",
        borderTopColor: INK.white,
        display: "inline-block",
      }}
    />
  );
}

// ─── Underline form field (round-2 form treatment) ─────────────────────────

function UnderlineField({
  label,
  value,
  onChange,
  prefix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: ReactNode;
}) {
  return (
    <div>
      <div style={{ fontSize: 13, color: INK.text2, marginBottom: 4 }}>
        {label}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          borderBottom: `1px solid ${INK.text2}`,
          paddingBottom: 7,
        }}
      >
        {prefix}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          style={{
            flex: 1,
            minWidth: 0,
            border: "none",
            outline: "none",
            fontSize: 15,
            fontFamily: FONT,
            color: INK.text1,
            backgroundColor: "transparent",
            padding: 0,
          }}
        />
      </div>
    </div>
  );
}

// ─── iPhone chrome: status bar (dynamic island) + Safari bottom bar ────────

/**
 * Status bar follows the page color the way Safari does — black over the
 * browse screen's black header, white on the review/info screens.
 */
function StatusBar({ dark }: { dark: boolean }) {
  return (
    <div
      style={{
        height: 54,
        flexShrink: 0,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        backgroundColor: dark ? INK.header : INK.white,
        color: dark ? INK.white : INK.text1,
        transition: "background-color 300ms ease, color 300ms ease",
        zIndex: 3,
      }}
    >
      <span
        style={{
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: 0.2,
          minWidth: 48,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        9:41
      </span>
      {/* Dynamic island — hairline ring keeps it legible over the black header */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "50%",
          top: 10,
          transform: "translateX(-50%)",
          width: 122,
          height: 36,
          borderRadius: 999,
          backgroundColor: "#000",
          boxShadow: dark ? "inset 0 0 0 1px rgba(255,255,255,0.16)" : "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingRight: 11,
        }}
      >
        {/* camera lens */}
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: 999,
            background:
              "radial-gradient(circle at 35% 35%, #3a4050 0 25%, #14161c 60%, #000 100%)",
          }}
        />
      </div>
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {/* cellular */}
        <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor" aria-hidden>
          <rect x="0" y="7" width="3" height="4" rx="0.8" />
          <rect x="4.5" y="5" width="3" height="6" rx="0.8" />
          <rect x="9" y="2.5" width="3" height="8.5" rx="0.8" />
          <rect x="13.5" y="0" width="3" height="11" rx="0.8" />
        </svg>
        {/* wifi */}
        <svg width="17" height="13" viewBox="0 0 16 12" fill="currentColor" aria-hidden>
          <path d="M8 11.6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
          <path d="M3.9 7.3a5.9 5.9 0 0 1 8.2 0L10.7 8.9a3.9 3.9 0 0 0-5.4 0L3.9 7.3Z" />
          <path d="M1 4.4a10 10 0 0 1 14 0l-1.4 1.6a8 8 0 0 0-11.2 0L1 4.4Z" />
        </svg>
        {/* battery */}
        <svg width="25" height="12" viewBox="0 0 25 12" aria-hidden>
          <rect x="0.5" y="0.5" width="21" height="11" rx="3" fill="none" stroke="currentColor" strokeOpacity="0.4" />
          <rect x="2" y="2" width="15" height="8" rx="1.6" fill="currentColor" />
          <path d="M23 4v4c1-.3 1.6-1 1.6-2S24 4.3 23 4Z" fill="currentColor" fillOpacity="0.4" />
        </svg>
      </span>
    </div>
  );
}

function SafariBar() {
  return (
    <div
      style={{
        flexShrink: 0,
        backgroundColor: "#f7f7f8",
        borderTop: "1px solid #e2e2e4",
        zIndex: 3,
      }}
    >
      {/* URL field */}
      <div style={{ padding: "10px 14px 4px" }}>
        <div
          style={{
            height: 42,
            borderRadius: 12,
            backgroundColor: "#e9e9eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            position: "relative",
            color: INK.text1,
          }}
        >
          <span
            style={{
              position: "absolute",
              left: 14,
              fontSize: 15,
              fontWeight: 500,
              color: INK.text1,
            }}
          >
            AA
          </span>
          {/* lock */}
          <svg width="12" height="15" viewBox="0 0 12 15" fill="currentColor" aria-hidden>
            <path d="M3 5V4a3 3 0 0 1 6 0v1h.5A1.5 1.5 0 0 1 11 6.5v6A1.5 1.5 0 0 1 9.5 14h-7A1.5 1.5 0 0 1 1 12.5v-6A1.5 1.5 0 0 1 2.5 5H3Zm1.5 0h3V4a1.5 1.5 0 0 0-3 0v1Z" />
          </svg>
          <span style={{ fontSize: 15, fontWeight: 400 }}>dining.canaryhq.com</span>
          {/* refresh */}
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke={INK.text1}
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
            style={{ position: "absolute", right: 13 }}
          >
            <path d="M19 12a7 7 0 1 1-2.05-4.95" />
            <path d="M19.6 3.9v4h-4" />
          </svg>
        </div>
      </div>
      {/* Home indicator */}
      <div
        style={{
          height: 22,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 134,
            height: 5,
            borderRadius: 999,
            backgroundColor: INK.text1,
          }}
        />
      </div>
    </div>
  );
}

// ─── Cart state ────────────────────────────────────────────────────────────

function useSpecimenCart() {
  const [cart, setCart] = useState<Cart>({});

  const add = (
    item: SpecimenItem,
    qty = 1,
    variant?: string,
    specialRequest?: string,
  ) => {
    const key = lineKey(item.id, variant);
    setCart((prev) => {
      const existing = prev[key];
      const nextQty = Math.min((existing?.qty ?? 0) + qty, item.maxQty);
      return {
        ...prev,
        [key]: {
          item,
          variant,
          qty: nextQty,
          specialRequest: specialRequest ?? existing?.specialRequest,
        },
      };
    });
  };

  const increment = (key: string) =>
    setCart((prev) => {
      const line = prev[key];
      if (!line) return prev;
      return {
        ...prev,
        [key]: { ...line, qty: Math.min(line.qty + 1, line.item.maxQty) },
      };
    });

  const decrement = (key: string) =>
    setCart((prev) => {
      const line = prev[key];
      if (!line) return prev;
      if (line.qty <= 1) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: { ...line, qty: line.qty - 1 } };
    });

  const remove = (key: string) =>
    setCart((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

  const qtyOf = (itemId: string) =>
    Object.values(cart).reduce(
      (sum, l) => (l.item.id === itemId ? sum + l.qty : sum),
      0,
    );

  /** All cart lines for one item — >1 entry when variants split the qty. */
  const linesOf = (itemId: string): [string, CartLine][] =>
    Object.entries(cart).filter(([, l]) => l.item.id === itemId);

  const clear = () => setCart({});

  return { cart, add, increment, decrement, remove, qtyOf, linesOf, clear };
}

// ─── Phone app ─────────────────────────────────────────────────────────────

type Screen = 0 | 1 | 2; // browse | review | info

function PhoneApp() {
  const { cart, add, increment, decrement, remove, qtyOf, linesOf, clear } =
    useSpecimenCart();

  const [screen, setScreen] = useState<Screen>(0);
  const [drawerItem, setDrawerItem] = useState<SpecimenItem | null>(null);
  // Minus on a variant-split row disambiguates in a bottom sheet
  const [stepperItem, setStepperItem] = useState<SpecimenItem | null>(null);
  const [activeSectionId, setActiveSectionId] = useState(MENU_SECTIONS[0].id);
  const [submitting, setSubmitting] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [guest, setGuest] = useState({
    firstName: "Emily",
    lastName: "Smith",
    phone: "+1 650-766-5474",
    room: "",
  });

  const count = cartCount(cart);
  const subtotal = cartSubtotal(cart);
  const total = subtotal + SALES_TAX + DELIVERY_FEE;

  // Anchor tabs: sections stack in one scroll; tabs jump + track position
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleScroll = useCallback(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;
    // Scrolled to the bottom ⇒ the last section is active even though it
    // can't physically reach the top (it's shorter than the viewport).
    if (scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 2) {
      setActiveSectionId(MENU_SECTIONS[MENU_SECTIONS.length - 1].id);
      return;
    }
    const scrolled = scrollEl.scrollTop + 70;
    let current = MENU_SECTIONS[0].id;
    for (const section of MENU_SECTIONS) {
      const el = sectionRefs.current[section.id];
      if (el && scrolled >= el.offsetTop) current = section.id;
    }
    setActiveSectionId(current);
  }, []);

  const scrollToSection = (id: string) => {
    const target = sectionRefs.current[id];
    if (!scrollRef.current || !target) return;
    scrollRef.current.scrollTo({ top: target.offsetTop - 8, behavior: "smooth" });
    setActiveSectionId(id);
  };

  const handleRowAdd = (item: SpecimenItem) => {
    if (item.variantOptions?.length) setDrawerItem(item);
    else add(item);
  };

  // Minus: unambiguous (one cart line) decrements in place; variant-split
  // quantities open the disambiguation sheet instead.
  const handleStepDown = (item: SpecimenItem) => {
    const lines = linesOf(item.id);
    if (lines.length > 1) setStepperItem(item);
    else if (lines.length === 1) decrement(lines[0][0]);
  };

  // Emptying the cart from the review screen returns to browse.
  useEffect(() => {
    if (screen === 1 && count === 0 && !submitting) setScreen(0);
  }, [screen, count, submitting]);

  // In-button spinner, then reset the whole specimen for the next visitor.
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timeouts.current.forEach(clearTimeout), []);
  const handleSubmit = () => {
    setSubmitting(true);
    timeouts.current.push(
      setTimeout(() => {
        clear();
        setSubmitting(false);
        setScreen(0);
        setGuest((g) => ({ ...g, room: "" }));
        setToastVisible(true);
        timeouts.current.push(setTimeout(() => setToastVisible(false), 3500));
      }, 1600),
    );
  };

  const canSubmit = guest.room.trim().length > 0;

  const screenStyle: CSSProperties = {
    width: "calc(100% / 3)",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    backgroundColor: INK.white,
    overflow: "hidden",
  };

  // Off-screen panes hide AFTER the slide finishes (visibility transition
  // delay) so they don't vanish mid-transition.
  const paneVisibility = (idx: Screen): CSSProperties =>
    screen === idx
      ? { visibility: "visible", transition: "visibility 0s" }
      : {
          pointerEvents: "none",
          visibility: "hidden",
          transition: "visibility 0s 450ms",
        };

  return (
    <div
      className="flex min-h-0 w-full flex-1 flex-col"
      style={{ backgroundColor: INK.white, fontFamily: FONT, color: INK.text1 }}
    >
      {/* iOS status bar — follows the visible screen's page color */}
      <StatusBar dark={screen === 0} />

      {/* -1px tuck under the opaque status bar: the scale transform lands
          edges on fractional device pixels, which otherwise antialiases a
          hairline seam between the bar and the browse header's black. */}
      <div
        className="relative min-h-0 flex-1 overflow-hidden"
        style={{ marginTop: -1 }}
      >
      {/* Sliding 3-screen track: browse | review | info */}
      <div
        className="flex h-full motion-reduce:transition-none"
        style={{
          width: "300%",
          transform: `translateX(-${(screen * 100) / 3}%)`,
          transition: `transform 460ms ${EASE_CSS}`,
        }}
      >
        {/* ── Screen 0: Menu browse ── */}
        <div
          style={{ ...screenStyle, ...paneVisibility(0) }}
          aria-hidden={screen !== 0}
        >
          {/* Black nav header */}
          <div
            style={{
              backgroundColor: INK.header,
              color: INK.white,
              padding: "14px 14px",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              position: "relative",
            }}
          >
            <span style={{ position: "absolute", left: 14, display: "flex" }}>
              <Icon name="arrowLeft" size={19} />
            </span>
            <span
              style={{
                margin: "0 auto",
                fontSize: 18,
                fontWeight: 600,
                lineHeight: "24px",
              }}
            >
              Lunch menu
            </span>
          </div>

          {/* Anchor tabs directly under the nav header. (The menu-period
              select row and the in-body "Lunch menu" heading were removed —
              Marco 2026-08-03: the header now carries the title.) */}
          <div
            style={{
              display: "flex",
              gap: 4,
              padding: "2px 6px 0",
              borderBottom: `1px solid ${INK.line}`,
              flexShrink: 0,
            }}
          >
            {MENU_SECTIONS.map((section) => {
              const isActive = section.id === activeSectionId;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "8px 6px 0",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 3,
                    fontFamily: FONT,
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? INK.text1 : INK.text3,
                    }}
                  >
                    {section.title}
                  </span>
                  <span
                    style={{
                      height: 3,
                      width: "100%",
                      backgroundColor: isActive ? INK.text1 : "transparent",
                    }}
                  />
                </button>
              );
            })}
          </div>

          {/* Stacked sections. position:relative makes this the sections'
              offsetParent, so their offsetTop is measured in this scroll
              container's content coordinates — without it, tab clicks and
              the scroll-spy were baselined to the screen root and
              overshot (Marco 2026-08-03). */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            style={{
              flex: 1,
              overflowY: "auto",
              overscrollBehavior: "contain",
              position: "relative",
            }}
          >
            {MENU_SECTIONS.map((section, sectionIdx) => (
              <div
                key={section.id}
                ref={(el) => {
                  sectionRefs.current[section.id] = el;
                }}
                style={{
                  padding: sectionIdx === 0 ? "18px 12px 4px" : "14px 12px 4px",
                }}
              >
                <div
                  style={{
                    margin: "0 0 10px",
                    fontSize: 16,
                    fontWeight: 600,
                    color: INK.text1,
                  }}
                >
                  {section.title}
                </div>
                <div
                  style={{
                    border: `1px solid ${INK.line}`,
                    borderRadius: RAD.card,
                    overflow: "hidden",
                    backgroundColor: INK.white,
                  }}
                >
                  {section.items.map((item, idx) => (
                    <BrowseItemRow
                      key={item.id}
                      item={item}
                      qtyInCart={qtyOf(item.id)}
                      isLast={idx === section.items.length - 1}
                      onAdd={() => handleRowAdd(item)}
                      onOpenDetails={() => setDrawerItem(item)}
                      onStepDown={() => handleStepDown(item)}
                    />
                  ))}
                </div>
              </div>
            ))}
            <div style={{ height: 14 }} />
          </div>

          {/* View cart CTA — appears after the first add */}
          {count > 0 && (
            <div
              style={{
                padding: "10px 14px 16px",
                backgroundColor: INK.white,
                borderTop: `1px solid ${INK.line}`,
                boxShadow:
                  "0 -2px 6px rgba(0,0,0,0.04), 0 -4px 12px rgba(0,0,0,0.03)",
                flexShrink: 0,
                position: "relative",
                zIndex: 2,
              }}
            >
              <button
                type="button"
                data-demo="view-cart"
                onClick={() => setScreen(1)}
                style={{
                  width: "100%",
                  height: 46,
                  borderRadius: RAD.btn,
                  border: "none",
                  backgroundColor: INK.brand,
                  color: INK.white,
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: FONT,
                  cursor: "pointer",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{ position: "absolute", left: 14, display: "flex" }}
                >
                  <Icon name="cart" size={19} />
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span>View cart</span>
                  <span style={{ opacity: 0.7 }}>·</span>
                  <span>${formatMoney(subtotal)}</span>
                </span>
                <span
                  style={{
                    position: "absolute",
                    right: 12,
                    minWidth: 22,
                    height: 22,
                    padding: "0 6px",
                    borderRadius: RAD.tag,
                    backgroundColor: "#E8E8E8",
                    color: INK.brand,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {count}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* ── Screen 1: Review your cart ── */}
        <div
          style={{ ...screenStyle, ...paneVisibility(1) }}
          aria-hidden={screen !== 1}
        >
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px 20px" }}>
            {/* Nav row: back flush left, title centered on the row */}
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 44,
                marginBottom: 16,
              }}
            >
              <button
                type="button"
                aria-label="Back to menu"
                onClick={() => setScreen(0)}
                style={{
                  position: "absolute",
                  left: 0,
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  border: "none",
                  backgroundColor: INK.white,
                  color: INK.text1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow:
                    "0 1px 4px rgba(0,0,0,0.14), 0 2px 10px rgba(0,0,0,0.08)",
                  padding: 0,
                }}
              >
                <Icon name="arrowLeft" size={19} />
              </button>
              <h4
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 700,
                  color: INK.text1,
                  lineHeight: 1.25,
                  letterSpacing: -0.3,
                }}
              >
                Review your cart
              </h4>
            </div>

            {/* Scheduled delivery context row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                padding: "12px 12px",
                borderRadius: RAD.card,
                border: `1px solid ${INK.line}`,
                fontSize: 13,
                marginBottom: 14,
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  color: INK.text1,
                  whiteSpace: "nowrap",
                }}
              >
                Scheduled delivery
              </span>
              <span style={{ color: INK.text3, textAlign: "right" }}>
                {SCHEDULED_DELIVERY}
              </span>
            </div>

            {/* Line items */}
            {count > 0 && (
              <div
                style={{
                  border: `1px solid ${INK.line}`,
                  borderRadius: RAD.card,
                  overflow: "hidden",
                }}
              >
                {Object.entries(cart).map(([key, line], idx) => (
                  <ReviewLine
                    key={key}
                    removeDemoId={`cart-remove-${key}`}
                    image={line.item.image}
                    name={line.item.name}
                    priceLine={`$${formatMoney(line.item.price * line.qty)}`}
                    detailLine={
                      line.specialRequest
                        ? `Special request: ${line.specialRequest}`
                        : line.variant
                    }
                    qty={line.qty}
                    isFirst={idx === 0}
                    onIncrement={() => increment(key)}
                    onDecrement={() => decrement(key)}
                    onRemove={() => remove(key)}
                  />
                ))}
              </div>
            )}

            {/* Add more items */}
            <button
              type="button"
              onClick={() => setScreen(0)}
              style={{
                marginTop: 14,
                width: "100%",
                height: 44,
                borderRadius: RAD.card,
                border: "none",
                backgroundColor: INK.hairline,
                color: INK.text1,
                fontSize: 13,
                fontWeight: 600,
                fontFamily: FONT,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <Icon name="plus" size={15} />
              Add more items
            </button>

            {/* Totals */}
            <div
              style={{
                marginTop: 18,
                display: "flex",
                flexDirection: "column",
                gap: 9,
              }}
            >
              {[
                { label: "Subtotal", amount: subtotal },
                { label: "Sales tax", amount: SALES_TAX },
                { label: "Delivery fee", amount: DELIVERY_FEE },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                    color: INK.text2,
                  }}
                >
                  <span>{row.label}</span>
                  <span>${formatMoney(row.amount)}</span>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: 10,
                  borderTop: `1px solid ${INK.line}`,
                  fontSize: 15,
                  fontWeight: 700,
                  color: INK.text1,
                }}
              >
                <span>Total</span>
                <span>${formatMoney(total)}</span>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: "10px 14px 16px",
              borderTop: `1px solid ${INK.line}`,
              boxShadow:
                "0 -2px 6px rgba(0,0,0,0.04), 0 -4px 12px rgba(0,0,0,0.03)",
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              data-demo="continue"
              onClick={() => setScreen(2)}
              style={{
                width: "100%",
                height: 46,
                borderRadius: RAD.btn,
                border: "none",
                backgroundColor: INK.brand,
                color: INK.white,
                fontSize: 15,
                fontWeight: 600,
                fontFamily: FONT,
                cursor: "pointer",
              }}
            >
              Continue
            </button>
          </div>
        </div>

        {/* ── Screen 2: Your information ── */}
        <div
          style={{ ...screenStyle, ...paneVisibility(2) }}
          aria-hidden={screen !== 2}
        >
          <div style={{ flex: 1, overflowY: "auto" }}>
            <div style={{ position: "relative" }}>
              <img
                src={INFO_HERO}
                alt=""
                style={{
                  width: "100%",
                  height: 181,
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <button
                type="button"
                aria-label="Back to cart"
                onClick={() => setScreen(1)}
                style={{
                  position: "absolute",
                  top: 12,
                  left: 12,
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  border: "none",
                  backgroundColor: INK.white,
                  color: INK.text1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                  padding: 0,
                }}
              >
                <Icon name="arrowLeft" size={19} />
              </button>
            </div>
            <div style={{ padding: "16px 14px 20px" }}>
              <h4
                style={{
                  margin: 0,
                  fontSize: 24,
                  fontWeight: 700,
                  color: INK.text1,
                  letterSpacing: -0.3,
                }}
              >
                Your information
              </h4>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: 13,
                  color: INK.text2,
                  lineHeight: 1.5,
                }}
              >
                Please provide either your phone number or email address so we
                can reach out to you regarding your order.
              </p>

              <div
                style={{
                  marginTop: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                }}
              >
                <UnderlineField
                  label="First name (required)"
                  value={guest.firstName}
                  onChange={(v) => setGuest((g) => ({ ...g, firstName: v }))}
                />
                <UnderlineField
                  label="Last name (required)"
                  value={guest.lastName}
                  onChange={(v) => setGuest((g) => ({ ...g, lastName: v }))}
                />
                <UnderlineField
                  label="Mobile phone (required)"
                  value={guest.phone}
                  onChange={(v) => setGuest((g) => ({ ...g, phone: v }))}
                  prefix={
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        marginRight: 9,
                      }}
                    >
                      <span style={{ fontSize: 14 }}>🇺🇸</span>
                      <span style={{ color: INK.text3, display: "flex" }}>
                        <Icon name="unfoldMore" size={13} />
                      </span>
                    </span>
                  }
                />
                {/* Guest room # — filled field per Figma */}
                <div>
                  <div
                    style={{ fontSize: 13, color: INK.text2, marginBottom: 7 }}
                  >
                    Guest room #{" "}
                    <span style={{ color: INK.text3 }}>(required)</span>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={guest.room}
                    placeholder="123"
                    data-demo="room-input"
                    aria-label="Guest room number (required)"
                    onChange={(e) =>
                      setGuest((g) => ({ ...g, room: e.target.value }))
                    }
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      height: 42,
                      padding: "0 12px",
                      border: "none",
                      borderRadius: 4,
                      backgroundColor: INK.hairline,
                      fontSize: 15,
                      fontFamily: FONT,
                      color: INK.text1,
                      outline: "none",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: "10px 14px 14px",
              borderTop: `1px solid ${INK.line}`,
              boxShadow:
                "0 -2px 6px rgba(0,0,0,0.04), 0 -4px 12px rgba(0,0,0,0.03)",
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              disabled={!canSubmit || submitting}
              data-demo="submit-order"
              onClick={handleSubmit}
              style={{
                width: "100%",
                height: 46,
                borderRadius: RAD.btn,
                border: "none",
                backgroundColor: submitting
                  ? INK.loading
                  : canSubmit
                    ? INK.brand
                    : INK.line,
                color: canSubmit || submitting ? INK.white : INK.disabledText,
                fontSize: 15,
                fontWeight: 600,
                fontFamily: FONT,
                cursor: canSubmit && !submitting ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {submitting ? <ButtonSpinner /> : "Submit order"}
            </button>
            <div
              style={{
                fontSize: 12,
                color: INK.text3,
                lineHeight: 1.45,
                textAlign: "center",
                margin: "9px 0 0",
              }}
            >
              {NO_CHARGE_COPY}
            </div>
          </div>
        </div>
      </div>

      {/* Item detail drawer */}
      <AnimatePresence>
        {drawerItem && (
          <ItemDetailDrawer
            key={drawerItem.id}
            item={drawerItem}
            onClose={() => setDrawerItem(null)}
            onAdd={(qty, variant, specialRequest) =>
              add(drawerItem, qty, variant, specialRequest)
            }
          />
        )}
      </AnimatePresence>

      {/* Menu-stepper disambiguation sheet */}
      <AnimatePresence>
        {stepperItem && (
          <MenuStepperSheet
            key={stepperItem.id}
            item={stepperItem}
            lines={linesOf(stepperItem.id)}
            onIncrement={increment}
            onDecrement={decrement}
            onRemove={remove}
            onClose={() => setStepperItem(null)}
          />
        )}
      </AnimatePresence>

      {/* Bottom toast */}
      <AnimatePresence>
        {toastVisible && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.26, ease: EASE }}
            style={{
              position: "absolute",
              bottom: 24,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              zIndex: 70,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                backgroundColor: INK.brand,
                color: INK.white,
                borderRadius: RAD.btn,
                padding: "9px 14px",
                fontSize: 12,
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(0,0,0,0.24)",
              }}
            >
              Your order has been submitted
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Specimen container ────────────────────────────────────────────────────

/** Same 3-stop ambient lift as DeviceShell so the artifact family matches. */
const SHELL_SHADOW =
  "0 1px 2px rgba(0, 0, 0, 0.05), 0 12px 28px rgba(0, 0, 0, 0.08), 0 32px 56px rgba(0, 0, 0, 0.06)";

/**
 * The interior renders at iPhone-logical width (390pt — real device
 * coordinates, which the chrome dimensions above are written in) and is
 * transform-scaled down into the shell. Everything inside gets
 * proportionally smaller ("device resolution") without retuning each size.
 */
// Scaled up 300→360 (Marco 2026-08-05: the phone read too small inline).
// SHELL_H is picked so the derived LOGICAL_H lands back on ~831 — the
// interior layout is unchanged, it just renders at a higher device
// resolution. Corner radii below scale with it (32→38, 26→31).
const SHELL_W = 360;
const SHELL_H = 758;
const BEZEL = 4;
const LOGICAL_W = 390;
const SCREEN_SCALE = (SHELL_W - BEZEL * 2) / LOGICAL_W; // ≈ 0.903
const LOGICAL_H = Math.round((SHELL_H - BEZEL * 2) / SCREEN_SCALE); // ≈ 831

/**
 * Choreographed demo run (DemoStage grammar): add a plain item, add a
 * modifier item through the drawer, review the cart, remove a line, then
 * fill the room number and submit. All targets stay inside the appetizers
 * section so no scroll steps are needed. `after` pads for the prototype's
 * own transitions (drawer 320ms, screen slide 460ms, submit spinner 1600ms
 * + toast 3500ms).
 */
const FNB_DEMO_SCRIPT: DemoStep[] = [
  { type: "wait", ms: 300 },
  { type: "tap", target: "add-yellowtail-sashimi", after: 900 },
  { type: "tap", target: "add-toro-tartare", after: 800 }, // opens drawer
  { type: "tap", target: "option-Guacamole", after: 650 },
  { type: "tap", target: "drawer-add", after: 900 },
  { type: "tap", target: "add-edamame", after: 900 },
  { type: "tap", target: "view-cart", after: 1100 },
  { type: "tap", target: "cart-remove-edamame", after: 1000 },
  { type: "tap", target: "continue", after: 1100 },
  { type: "tap", target: "room-input", after: 250 },
  { type: "type", target: "room-input", text: "412", after: 800 },
  { type: "tap", target: "submit-order", after: 0 },
  { type: "wait", ms: 4200 }, // spinner + reset-to-menu + toast dwell
];

/**
 * The phone shell alone — DemoStage supplies the themeable panel around it.
 * Bespoke (not DeviceShell): shorter 9/17 ratio, tighter corners, and
 * mobile-web chrome — iOS status bar with dynamic island up top (inside
 * PhoneApp so it can follow the active screen's page color), Safari
 * URL/toolbar + home indicator below.
 */
function PhoneShell() {
  return (
    <div
      style={{
        // ~2.1 ratio (near-iPhone proportions), stated explicitly — as
        // a flex item the shell's content-derived min-height would
        // override aspect-ratio.
        width: SHELL_W,
        height: SHELL_H,
        minHeight: 0,
        flexShrink: 0,
        borderRadius: 38,
        padding: BEZEL,
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        boxShadow: SHELL_SHADOW,
      }}
    >
      <div
        style={{
          height: "100%",
          width: "100%",
          borderRadius: 31,
          overflow: "hidden",
          position: "relative",
          backgroundColor: INK.white,
        }}
      >
        {/* iPhone-logical canvas, scaled down into the shell */}
        <div
          style={{
            width: LOGICAL_W,
            height: LOGICAL_H,
            transform: `scale(${SCREEN_SCALE})`,
            transformOrigin: "top left",
            display: "flex",
            flexDirection: "column",
            backgroundColor: INK.white,
          }}
        >
          <PhoneApp />
          <SafariBar />
        </div>
      </div>
    </div>
  );
}

/**
 * DemoStage supplies the choreography: the in-page copy is a display-only
 * auto-playing ghost-cursor run; the hands-on copy opens fullscreen from a
 * <TryDemoButton /> in the caption block (2026-08-05).
 */
export default function FnbCartSpecimen() {
  return (
    <MotionConfig reducedMotion="user">
      <DemoStage
        ariaLabel="Demonstration of the guest in-room dining ordering flow"
        script={FNB_DEMO_SCRIPT}
        stageWidth={SHELL_W}
        stageHeight={SHELL_H}
      >
        <PhoneShell />
      </DemoStage>
    </MotionConfig>
  );
}
