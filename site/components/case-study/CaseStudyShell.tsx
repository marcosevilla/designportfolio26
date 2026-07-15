import { ReactNode } from "react";
import ProgressBar from "./ProgressBar";
import SidebarTOCBridge from "./SidebarTOCBridge";
import TOCObserver from "./TOCObserver";
import InlineTOC from "./InlineTOC";
import { typescale } from "@/lib/typography";
import type { TOCItem } from "@/lib/SidebarContext";

export default function CaseStudyShell({
  tocItems,
  backHref,
  children,
}: {
  tocItems: TOCItem[];
  backHref?: string;
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
        {/* Editorial grid canvas (12 cols, --grid-max wide). At lg+ the
            canvas shifts right of the fixed InlineTOC (48px + 130px +
            breathing room = 200px); from 1560px up there's enough side
            margin to center it again and still clear the TOC. Sections
            inside wrap themselves in <Grid> — see docs/LAYOUT-REFERENCE.html */}
        <div className="max-w-(--grid-max) mx-auto px-4 sm:px-8 lg:px-0 lg:ml-[200px] lg:mr-8 min-[1560px]:mx-auto pt-24 lg:pt-[18vh]">
          {children}
        </div>
      </article>
    </>
  );
}
