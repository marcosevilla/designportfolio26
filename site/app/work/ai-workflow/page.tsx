import type { Metadata } from "next";
import AIWorkflowContent from "./AIWorkflowContent";

export const metadata: Metadata = {
  title: "How I Work with AI — Marco Sevilla",
  description:
    "A designer's daily practice with Claude Code, MCP integrations, and self-improving workflows",
};

export default function AIWorkflowPage() {
  return (
    <div className="pb-20">
      <AIWorkflowContent />
    </div>
  );
}
