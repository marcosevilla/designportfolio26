import { ReactNode } from "react";
import ProgressBar from "./ProgressBar";
import SidebarTOCBridge from "./SidebarTOCBridge";
import TOCObserver from "./TOCObserver";
import InlineTOC from "./InlineTOC";
import { typescale } from "@/lib/typography";
import Grid, { Col } from "@/components/layout/Grid";
import { CONTENT_BAND } from "@/lib/layout-presets";
import type { TOCItem } from "@/lib/SidebarContext";

export default function CaseStudyShell({
  tocItems,
  backHref,
  band = false,
  children,
}: {
  tocItems: TOCItem[];
  backHref?: string;
  /** Wrap all children on the centered middle-6 CONTENT_BAND. For the
   *  TwoCol-era pages, whose linear content otherwise spans the full
   *  canvas — the editorial-grid pages place themselves per-section
   *  and must NOT set this (nested grids would double-narrow). */
  band?: boolean;
  children: ReactNode;
}) {
  return (
    <>
      <ProgressBar />
      <SidebarTOCBridge items={tocItems} backHref={backHref} />
      <TOCObserver sectionIds={tocItems.map((i) => i.id)} />
      <article
        className="text-(--color-fg-secondary)"
        style={typescale.body}
      >
        <InlineTOC />
        {/* Editorial grid canvas (12 cols, --grid-max wide). Placement
            lives in .case-canvas (globals.css): centered, except at lg+
            it keeps a min 200px left margin to clear the fixed InlineTOC.
            Sections inside wrap themselves in <Grid> — see
            docs/LAYOUT-REFERENCE.html */}
        <div className="case-canvas px-4 sm:px-8 pt-24 lg:pt-[18vh]">
          {band ? (
            <Grid>
              <Col lg={CONTENT_BAND}>{children}</Col>
            </Grid>
          ) : (
            children
          )}
        </div>
      </article>
    </>
  );
}
