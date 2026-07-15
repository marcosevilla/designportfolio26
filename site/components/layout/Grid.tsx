import React, { CSSProperties, ReactNode } from "react";
import { parseColSpec, PRESETS, type PresetName, type ColSpec } from "@/lib/layout-presets";

/**
 * Editorial 12-column grid. Every section wraps itself in its own
 * <Grid> — identical tracks mean columns align down the whole page.
 * Placement is authored per band via <Col> props or a named preset;
 * everything defaults to a full-width stack on phone.
 *
 * Canvas width/padding is owned by the page shell (e.g. CaseStudyShell),
 * not by Grid — Grid always fills its container.
 *
 *   <Grid preset="media-right">
 *     <Col>…text…</Col>
 *     <Col>…image…</Col>
 *   </Grid>
 *
 *   <Grid><Col lg="3-10">one-off placement</Col></Grid>
 *
 * Vocabulary + diagrams: docs/LAYOUT-REFERENCE.html
 */

interface ColProps {
  children?: ReactNode;
  /** Column spec for phone (<768). Defaults to "full". */
  base?: string;
  /** Column spec for tablet (768–1199). Falls back to base. */
  md?: string;
  /** Column spec for desktop (≥1200). Falls back to md. */
  lg?: string;
  className?: string;
  style?: CSSProperties;
}

export function Col({ children, base, md, lg, className, style }: ColProps) {
  const vars: CSSProperties = { ...style };
  if (base) (vars as Record<string, string>)["--col-base"] = parseColSpec(base);
  if (md) (vars as Record<string, string>)["--col-md"] = parseColSpec(md);
  if (lg) (vars as Record<string, string>)["--col-lg"] = parseColSpec(lg);
  return (
    <div className={`col-ed ${className || ""}`} style={vars}>
      {children}
    </div>
  );
}

interface GridProps {
  children: ReactNode;
  /** Named composition from lib/layout-presets.ts. */
  preset?: PresetName;
  className?: string;
  style?: CSSProperties;
}

function applyPreset(children: ReactNode, preset?: PresetName): ReactNode {
  if (!preset) return children;
  const slots: ColSpec[] = PRESETS[preset] || [];
  let slotIndex = 0;
  return React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;
    // Only Col children participate in slot assignment; anything else
    // (Fragments, raw elements) passes through untouched.
    if (child.type !== Col) return child;
    const slot = slots[slotIndex++];
    if (!slot) return child;
    const props = child.props as ColProps;
    // Explicit props on the Col win over the preset slot.
    return React.cloneElement(child as React.ReactElement<ColProps>, {
      base: props.base ?? slot.base,
      md: props.md ?? slot.md,
      lg: props.lg ?? slot.lg,
    });
  });
}

export default function Grid({ children, preset, className, style }: GridProps) {
  return (
    <div className={`grid-ed ${className || ""}`} style={style}>
      {applyPreset(children, preset)}
    </div>
  );
}
