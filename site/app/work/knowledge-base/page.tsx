import type { Metadata } from "next";
import KnowledgeBaseContent from "./KnowledgeBaseContent";
import LockGate from "@/components/LockGate";
import { isLocked } from "@/lib/locked-content";

export const metadata: Metadata = {
  title: "AI Knowledge Base — Marco Sevilla",
  description:
    "Redesigning the information architecture for the system that powers Canary's AI products — turning flat freeform statements into a structured knowledge base hotels actually fill out.",
  openGraph: {
    title: "AI Knowledge Base — Marco Sevilla",
    description:
      "Redesigning the information architecture for the system that powers Canary's AI products — turning flat freeform statements into a structured knowledge base hotels actually fill out.",
  },
};

export default function KnowledgeBasePage() {
  return (
    <LockGate
      mode="page"
      locked={isLocked("knowledge-base")}
      title="AI Knowledge Base"
      subtitle="Restructuring the data foundation that powers hotel AI"
      backHref="/#projects"
    >
      <div className="pb-20">
        <KnowledgeBaseContent />
      </div>
    </LockGate>
  );
}
