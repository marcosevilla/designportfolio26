import type { Metadata } from "next";
import CompendiumContent from "./CompendiumContent";
import LockGate from "@/components/LockGate";
import { isLocked } from "@/lib/locked-content";
import { getStudyMeta } from "@/lib/content";

export const metadata: Metadata = {
  title: "Canary Guest Hub — Marco Sevilla",
  description:
    "A digital guest hub that replaces printed hotel compendiums — a CMS vertical enough for hospitality but flexible enough to scale across thousands of properties.",
  openGraph: {
    title: "Canary Guest Hub — Marco Sevilla",
    description:
      "A digital guest hub that replaces printed hotel compendiums — a CMS vertical enough for hospitality but flexible enough to scale across thousands of properties.",
  },
};

export default function CompendiumPage() {
  const meta = getStudyMeta("canary-guest-hub");

  return (
    <LockGate
      mode="page"
      locked={isLocked("canary-guest-hub")}
      title="Canary Guest Hub"
      subtitle="A scalable hotel CMS platform built from scratch"
      backHref="/#projects"
    >
      <div className="pb-20">
        <CompendiumContent meta={meta} />
      </div>
    </LockGate>
  );
}
