import type { Metadata } from "next";
import CompendiumContent from "./CompendiumContent";

export const metadata: Metadata = {
  title: "Digital Compendium — Marco Sevilla",
  description:
    "A digital guest hub that replaces printed hotel compendiums — a CMS vertical enough for hospitality but flexible enough to scale across thousands of properties.",
};

export default function CompendiumPage() {
  return (
    <div className="-mt-24 lg:-mt-[18vh] pb-20">
      <CompendiumContent />
    </div>
  );
}
