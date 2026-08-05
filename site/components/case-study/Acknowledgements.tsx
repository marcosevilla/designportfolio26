"use client";

import { typescale } from "@/lib/typography";

/**
 * Team credits at the foot of a case study, above NextProject. These used
 * to hide inside MetaRail's Role hover tooltip; Marco moved them here
 * 2026-08-05 so collaborators are actually visible.
 *
 * Returns null when a study has no credits — only fb-ordering has names
 * today, and a bare heading over nothing looks broken.
 *
 * The eyebrow deliberately matches NextProject's "Next project" label
 * (13px uppercase tracking-widest tertiary) since they render adjacently.
 */
export default function Acknowledgements({ names }: { names: string }) {
  if (!names.trim()) return null;

  return (
    <div className="pt-24">
      <span className="mb-3 block text-[13px] uppercase tracking-widest text-(--color-fg-tertiary)">
        Acknowledgements
      </span>
      <p className="text-(--color-fg-secondary)" style={typescale.body}>
        {names}
      </p>
    </div>
  );
}
