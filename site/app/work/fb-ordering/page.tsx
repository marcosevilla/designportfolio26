import type { Metadata } from "next";
import FBOrderingContent from "./FBOrderingContent";

export const metadata: Metadata = {
  title: "F&B Mobile Ordering — Marco Sevilla",
  description:
    "A mobile, app-less food and beverage ordering system that lets hotel guests browse menus and place room service orders from their phone.",
};

export default function FBOrderingPage() {
  return (
    <div className="pb-20">
      <FBOrderingContent />
    </div>
  );
}
