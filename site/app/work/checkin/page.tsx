import type { Metadata } from "next";
import CheckinContent from "./CheckinContent";

export const metadata: Metadata = {
  title: "Hotel Check-in — Marco Sevilla",
  description:
    "Modernizing software for the world's largest global hotel chains. Designing seamless digital check-in, compendium, and omni-channel communication solutions.",
};

export default function CheckinPage() {
  return (
    <div className="-mt-24 lg:-mt-[18vh] pb-20">
      <CheckinContent />
    </div>
  );
}
