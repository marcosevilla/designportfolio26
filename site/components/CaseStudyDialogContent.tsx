"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

const CONTENT_MAP: Record<string, ComponentType> = {
  "fb-ordering": dynamic(() => import("@/app/work/fb-ordering/FBOrderingContent")),
  "compendium": dynamic(() => import("@/app/work/compendium/CompendiumContent")),
  "upsells": dynamic(() => import("@/app/work/upsells/UpsellsContent")),
  "checkin": dynamic(() => import("@/app/work/checkin/CheckinContent")),
  "general-task": dynamic(() => import("@/app/work/general-task/GeneralTaskContent")),
  "design-system": dynamic(() => import("@/app/work/design-system/DesignSystemContent")),
};

export const VALID_SLUGS = new Set(Object.keys(CONTENT_MAP));

export default function CaseStudyDialogContent({ slug }: { slug: string }) {
  const Content = CONTENT_MAP[slug];
  if (!Content) return null;
  return <Content />;
}
