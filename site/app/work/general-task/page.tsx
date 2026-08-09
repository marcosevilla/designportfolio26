import type { Metadata } from "next";
import GeneralTaskContent from "./GeneralTaskContent";
import LockGate from "@/components/LockGate";
import { isLocked } from "@/lib/locked-content";
import { getStudyMeta } from "@/lib/content";

export const metadata: Metadata = {
  title: "General Task — Marco Sevilla",
  description:
    "Building productivity software for Software Engineers. Designing a web-based task management tool that streamlines workflows for developers.",
  openGraph: {
    title: "General Task — Marco Sevilla",
    description:
      "Building productivity software for Software Engineers. Designing a web-based task management tool that streamlines workflows for developers.",
    images: [
      {
        url: "/images/general-task/hero.png",
        width: 4163,
        height: 2930,
        alt: "General Task web app interface",
      },
    ],
  },
};

export default function GeneralTaskPage() {
  const meta = getStudyMeta("general-task");

  return (
    <LockGate
      mode="page"
      locked={isLocked("general-task")}
      title="Unified hub for knowledge work"
      subtitle="Building productivity software for software engineers"
      backHref="/#projects"
    >
      <div className="pb-20">
        <GeneralTaskContent meta={meta} />
      </div>
    </LockGate>
  );
}
