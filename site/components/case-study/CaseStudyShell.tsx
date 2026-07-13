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
        {/* Single 600px column matching the home page (TOC sidebar is
            rendered separately via SidebarTOCBridge and excluded). */}
        <div className="max-w-[600px] mx-auto px-4 sm:px-8 pt-24 lg:pt-[18vh]">
          {children}
        </div>
      </article>
    </>
  );
}
