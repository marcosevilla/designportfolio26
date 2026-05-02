import type { Metadata } from "next";
import CompendiumContent from "./CompendiumContent";
import LockGate from "@/components/LockGate";
import { isLocked } from "@/lib/locked-content";

export const metadata: Metadata = {
  title: "Digital Compendium — Marco Sevilla",
  description:
    "A digital guest hub that replaces printed hotel compendiums — a CMS vertical enough for hospitality but flexible enough to scale across thousands of properties.",
  openGraph: {
    title: "Digital Compendium — Marco Sevilla",
    description:
      "A digital guest hub that replaces printed hotel compendiums — a CMS vertical enough for hospitality but flexible enough to scale across thousands of properties.",
  },
};

export default function CompendiumPage() {
  return (
    <LockGate
      mode="page"
      locked={isLocked("compendium")}
      title="Hotel guest experience app"
      subtitle="A scalable hotel CMS platform built from scratch"
      backHref="/work"
    >
      <div className="pb-20">
        <CompendiumContent />
      </div>
    </LockGate>
  );
}
