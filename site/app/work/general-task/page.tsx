import type { Metadata } from "next";
import GeneralTaskContent from "./GeneralTaskContent";
import LockGate from "@/components/LockGate";
import { isLocked } from "@/lib/locked-content";

export const metadata: Metadata = {
  title: "General Task — Marco Sevilla",
  description:
    "Building productivity software for Software Engineers. Designing a web-based task management tool that streamlines workflows for developers.",
  openGraph: {
    title: "General Task — Marco Sevilla",
    description:
      "Building productivity software for Software Engineers. Designing a web-based task management tool that streamlines workflows for developers.",
  },
};

export default function GeneralTaskPage() {
  return (
    <LockGate
      mode="page"
      locked={isLocked("general-task")}
      title="Unified hub for knowledge work"
      subtitle="Building productivity software for software engineers"
      backHref="/work"
    >
      <div className="pb-20">
        <GeneralTaskContent />
      </div>
    </LockGate>
  );
}
