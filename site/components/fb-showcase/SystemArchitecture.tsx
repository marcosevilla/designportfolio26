"use client";

import { useState } from "react";
import { typescale } from "@/lib/typography";

/* ─── Data Model ─── */

interface Entity {
  id: string;
  name: string;
  brief: string;
  color: string;
}

const ENTITIES: Entity[] = [
  { id: "outlets", name: "Ordering Outlets", brief: "Guest entry point, embedded in Compendium", color: "var(--color-accent)" },
  { id: "menus", name: "Menus", brief: "Time-based, per-outlet availability", color: "#3b82f6" },
  { id: "items", name: "Items", brief: "Shared item library across menus", color: "#8b5cf6" },
  { id: "modifiers", name: "Modifier Groups", brief: "Add-ons, substitutions, variations", color: "#ef4444" },
  { id: "orders", name: "Orders", brief: "Built on Upsells purchase order model", color: "#14b8a6" },
];

/** Edges: [from, to, label, type] */
const EDGES: [string, string, string, "one-to-many" | "many-to-many" | "generates"][] = [
  ["outlets", "menus", "contains", "one-to-many"],
  ["menus", "items", "items can belong to multiple menus", "many-to-many"],
  ["items", "modifiers", "items can have multiple modifier groups", "many-to-many"],
  ["items", "orders", "generates", "generates"],
];

function getConnected(entityId: string): Set<string> {
  const connected = new Set<string>();
  for (const [a, b] of EDGES) {
    if (a === entityId) connected.add(b);
    if (b === entityId) connected.add(a);
  }
  return connected;
}

function getEntity(id: string) {
  return ENTITIES.find((e) => e.id === id)!;
}

/* ─── Expandable Area ─── */

function ExpandableArea({
  title,
  children,
  open,
  onToggle,
}: {
  title: string;
  children: React.ReactNode;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-2 cursor-pointer text-left"
      >
        <span
          className="uppercase text-[var(--color-fg)]"
          style={typescale.label}
        >
          {title}
        </span>
        <span
          className="text-[var(--color-fg-secondary)] transition-transform duration-200"
          style={{
            ...typescale.label,
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
          }}
        >
          +
        </span>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="pb-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Entity Node ─── */

function EntityNode({
  entity,
  isHovered,
  isDimmed,
  onHover,
  onLeave,
}: {
  entity: Entity;
  isHovered: boolean;
  isDimmed: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  return (
    <div
      className="rounded-lg px-4 py-3 border transition-all duration-200 cursor-default select-none"
      style={{
        backgroundColor: isHovered
          ? `color-mix(in oklch, ${entity.color} 12%, var(--color-surface-raised))`
          : `color-mix(in oklch, ${entity.color} 5%, var(--color-surface-raised))`,
        borderColor: isHovered
          ? `color-mix(in oklch, ${entity.color} 40%, transparent)`
          : `color-mix(in oklch, ${entity.color} 15%, var(--color-border))`,
        opacity: isDimmed ? 0.25 : 1,
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div
        className="uppercase tracking-wide"
        style={{
          ...typescale.label,
          color: isHovered ? entity.color : "var(--color-fg)",
        }}
      >
        {entity.name}
      </div>
      <div
        className="mt-1 text-[var(--color-fg-secondary)]"
        style={{ fontSize: "11px", lineHeight: 1.4 }}
      >
        {entity.brief}
      </div>
    </div>
  );
}

/* ─── Horizontal Connector ─── */

function HConnector({
  label,
  dimmed,
}: {
  label?: string;
  dimmed: boolean;
}) {
  return (
    <div
      className="flex flex-col items-center shrink-0 transition-opacity duration-200"
      style={{ opacity: dimmed ? 0.2 : 0.6 }}
    >
      <div className="flex items-center gap-0">
        <div
          className="h-[1px] w-6"
          style={{ backgroundColor: "var(--color-fg-tertiary)" }}
        />
        <div
          style={{
            width: 0,
            height: 0,
            borderTop: "3px solid transparent",
            borderBottom: "3px solid transparent",
            borderLeft: "5px solid var(--color-fg-tertiary)",
          }}
        />
      </div>
      {label && (
        <span
          className="text-[var(--color-fg-secondary)] whitespace-nowrap mt-1"
          style={{ fontSize: "8px", fontFamily: "var(--font-mono)", letterSpacing: "0.02em" }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

/* ─── Vertical Connector ─── */

function VConnector({ dimmed }: { dimmed: boolean }) {
  return (
    <div
      className="flex flex-col items-center transition-opacity duration-200"
      style={{ opacity: dimmed ? 0.2 : 0.6 }}
    >
      <div
        className="w-[1px] h-4"
        style={{ backgroundColor: "var(--color-fg-tertiary)" }}
      />
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: "3px solid transparent",
          borderRight: "3px solid transparent",
          borderTop: "5px solid var(--color-fg-tertiary)",
        }}
      />
    </div>
  );
}

/* ─── Main Component ─── */

export default function SystemArchitecture() {
  const [hoveredEntity, setHoveredEntity] = useState<string | null>(null);
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set());

  const connected = hoveredEntity ? getConnected(hoveredEntity) : new Set<string>();

  function isNodeDimmed(id: string) {
    if (!hoveredEntity) return false;
    return id !== hoveredEntity && !connected.has(id);
  }

  function isEdgeDimmed(fromId: string, toId: string) {
    if (!hoveredEntity) return false;
    return !(
      (fromId === hoveredEntity && connected.has(toId)) ||
      (toId === hoveredEntity && connected.has(fromId))
    );
  }

  function toggleArea(area: string) {
    setExpandedAreas((prev) => {
      const next = new Set(prev);
      if (next.has(area)) next.delete(area);
      else next.add(area);
      return next;
    });
  }

  // Entity lookup for the horizontal chain (top row)
  const topRow = ["outlets", "menus", "items", "modifiers"];

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        backgroundColor: "var(--color-surface-raised)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* ── System Overview ── */}
      <div className="p-6 pb-0">
        <div
          className="uppercase tracking-widest mb-5 text-[var(--color-fg-secondary)]"
          style={{ fontSize: "9px", fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}
        >
          Information architecture
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Staff column */}
          <div
            className="rounded-lg border p-4"
            style={{
              backgroundColor: "var(--color-bg)",
              borderColor: "var(--color-border)",
            }}
          >
            <div
              className="uppercase tracking-widest mb-3 text-[var(--color-fg)]"
              style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", fontWeight: 500 }}
            >
              Staff dashboard
            </div>

            <ExpandableArea
              title="Order management"
              open={expandedAreas.has("orders-mgmt")}
              onToggle={() => toggleArea("orders-mgmt")}
            >
              <div className="flex gap-2 flex-wrap">
                {["New orders", "Scheduled orders", "Past orders"].map((label) => (
                  <span
                    key={label}
                    className="rounded-md px-3 py-1.5 text-[var(--color-fg-secondary)]"
                    style={{
                      ...typescale.label,
                      backgroundColor: "var(--color-muted)",
                    }}
                  >
                    {label}
                  </span>
                ))}
              </div>
              <p
                className="mt-3 text-[var(--color-fg-secondary)]"
                style={{ fontSize: "12px", lineHeight: 1.5 }}
              >
                Real-time order queue with accept/deny workflow, time-elapsed sorting, and dedicated notification settings.
              </p>
            </ExpandableArea>

            <div
              className="h-[1px] my-1"
              style={{ backgroundColor: "var(--color-border)" }}
            />

            <ExpandableArea
              title="F&B settings"
              open={expandedAreas.has("settings")}
              onToggle={() => toggleArea("settings")}
            >
              <p
                className="text-[var(--color-fg-secondary)] mb-3"
                style={{ fontSize: "12px", lineHeight: 1.5 }}
              >
                Hotels manage five interconnected objects. Items are authored once and composed into menus flexibly — pricing can be overridden per menu without duplicating items.
              </p>
              <div className="flex gap-2 flex-wrap">
                {ENTITIES.map((e) => (
                  <span
                    key={e.id}
                    className="rounded-md px-2.5 py-1 border transition-all duration-200 cursor-default"
                    style={{
                      ...typescale.label,
                      backgroundColor: `color-mix(in oklch, ${e.color} 8%, var(--color-muted))`,
                      borderColor: `color-mix(in oklch, ${e.color} 20%, transparent)`,
                      color: "var(--color-fg-secondary)",
                    }}
                    onMouseEnter={() => setHoveredEntity(e.id)}
                    onMouseLeave={() => setHoveredEntity(null)}
                  >
                    {e.name}
                  </span>
                ))}
              </div>
            </ExpandableArea>
          </div>

          {/* Guest column */}
          <div
            className="rounded-lg border p-4"
            style={{
              backgroundColor: "var(--color-bg)",
              borderColor: "var(--color-border)",
            }}
          >
            <div
              className="uppercase tracking-widest mb-3 text-[var(--color-fg)]"
              style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", fontWeight: 500 }}
            >
              Guest experience
            </div>

            <ExpandableArea
              title="Entry points"
              open={expandedAreas.has("entry")}
              onToggle={() => toggleArea("entry")}
            >
              <div className="flex gap-2 flex-wrap">
                {["Compendium carousel", "SMS link", "QR code"].map((label) => (
                  <span
                    key={label}
                    className="rounded-md px-3 py-1.5 text-[var(--color-fg-secondary)]"
                    style={{
                      ...typescale.label,
                      backgroundColor: "var(--color-muted)",
                    }}
                  >
                    {label}
                  </span>
                ))}
              </div>
              <p
                className="mt-3 text-[var(--color-fg-secondary)]"
                style={{ fontSize: "12px", lineHeight: 1.5 }}
              >
                Guests access ordering through their hotel&apos;s digital compendium, a direct SMS link, or by scanning a QR code at their table or room. No app download required.
              </p>
            </ExpandableArea>

            <div
              className="h-[1px] my-1"
              style={{ backgroundColor: "var(--color-border)" }}
            />

            <ExpandableArea
              title="Ordering flow"
              open={expandedAreas.has("flow")}
              onToggle={() => toggleArea("flow")}
            >
              <div className="flex items-center gap-1.5 flex-wrap">
                {["Menu browse", "Item detail", "Cart", "Checkout", "Confirmation"].map((step, i) => (
                  <span key={step} className="flex items-center gap-1.5">
                    <span
                      className="rounded-md px-2.5 py-1 text-[var(--color-fg-secondary)]"
                      style={{
                        ...typescale.label,
                        backgroundColor: "var(--color-muted)",
                      }}
                    >
                      {step}
                    </span>
                    {i < 4 && (
                      <span className="text-[var(--color-fg-secondary)]" style={{ fontSize: "10px" }}>→</span>
                    )}
                  </span>
                ))}
              </div>
            </ExpandableArea>
          </div>
        </div>
      </div>

      {/* ── Entity Relationship Diagram ── */}
      <div className="p-6">
        <div
          className="uppercase tracking-widest mb-4 text-[var(--color-fg-secondary)]"
          style={{ fontSize: "9px", fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}
        >
          System objects
        </div>

        {/* Desktop: horizontal chain */}
        <div className="hidden lg:block">
          {/* Top row: Outlets → Menus ↔ Items ↔ Modifier Groups */}
          <div className="flex items-center">
            {topRow.map((id, i) => (
              <div key={id} className="flex items-center" style={{ flex: id === "outlets" ? "none" : 1 }}>
                {i > 0 && (
                  <HConnector
                    label={i === 0 ? undefined : EDGES[i - 1]?.[3] === "many-to-many" ? "n:n" : "1:n"}
                    dimmed={isEdgeDimmed(topRow[i - 1], id)}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <EntityNode
                    entity={getEntity(id)}
                    isHovered={hoveredEntity === id}
                    isDimmed={isNodeDimmed(id)}
                    onHover={() => setHoveredEntity(id)}
                    onLeave={() => setHoveredEntity(null)}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Orders branch — positioned under Items */}
          <div className="flex">
            {/* Spacer for outlets + menus width */}
            <div style={{ flex: 1 }} />
            <div style={{ flex: 1 }} />
            <div className="flex flex-col items-center" style={{ flex: 1 }}>
              <VConnector dimmed={isEdgeDimmed("items", "orders")} />
              <div className="w-full">
                <EntityNode
                  entity={getEntity("orders")}
                  isHovered={hoveredEntity === "orders"}
                  isDimmed={isNodeDimmed("orders")}
                  onHover={() => setHoveredEntity("orders")}
                  onLeave={() => setHoveredEntity(null)}
                />
              </div>
            </div>
            {/* Spacer for modifiers */}
            <div style={{ flex: 1 }} />
          </div>
        </div>

        {/* Mobile: 2-column grid */}
        <div className="lg:hidden grid grid-cols-2 gap-3">
          {ENTITIES.map((entity) => (
            <EntityNode
              key={entity.id}
              entity={entity}
              isHovered={hoveredEntity === entity.id}
              isDimmed={isNodeDimmed(entity.id)}
              onHover={() => setHoveredEntity(entity.id)}
              onLeave={() => setHoveredEntity(null)}
            />
          ))}
        </div>
      </div>

      {/* ── Foundation Strip ── */}
      <div
        className="px-6 py-3 flex items-center gap-2"
        style={{
          borderTop: "1px dashed var(--color-border)",
        }}
      >
        <span
          className="text-[var(--color-fg-tertiary)]"
          style={{ fontSize: "9px", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}
        >
          BUILT ON
        </span>
        <span
          className="rounded px-2 py-0.5 text-[var(--color-fg-secondary)]"
          style={{
            ...typescale.label,
            backgroundColor: "var(--color-muted)",
          }}
        >
          Upsells
        </span>
        <span className="text-[var(--color-fg-secondary)]" style={{ fontSize: "10px" }}>
          purchase orders
        </span>
        <span className="text-[var(--color-fg-secondary)]" style={{ fontSize: "10px" }}>+</span>
        <span
          className="rounded px-2 py-0.5 text-[var(--color-fg-secondary)]"
          style={{
            ...typescale.label,
            backgroundColor: "var(--color-muted)",
          }}
        >
          Compendium
        </span>
        <span className="text-[var(--color-fg-secondary)]" style={{ fontSize: "10px" }}>
          guest hub
        </span>
      </div>
    </div>
  );
}
