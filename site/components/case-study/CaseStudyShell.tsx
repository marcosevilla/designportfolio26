import { ReactNode } from "react";
import ProgressBar from "./ProgressBar";
import SidebarTOCBridge from "./SidebarTOCBridge";
import TOCObserver from "./TOCObserver";
import InlineTOC from "./InlineTOC";
import { typescale } from "@/lib/typography";
import type { TOCItem } from "@/lib/SidebarContext";

export default function CaseStudyShell({
  tocItems,
  children,
}: {
  tocItems: TOCItem[];
  children: ReactNode;
}) {
  return (
    <>
      <ProgressBar />
      <SidebarTOCBridge items={tocItems} />
      <TOCObserver sectionIds={tocItems.map((i) => i.id)} />
      <article
        className="text-[var(--color-fg-secondary)]"
        style={typescale.body}
      >
        <InlineTOC />
        <div className="max-w-content mx-auto px-4 sm:px-8 lg:max-w-none lg:px-0 pt-24 lg:pt-[18vh]">
          {children}
        </div>
      </article>
    </>
  );
}
