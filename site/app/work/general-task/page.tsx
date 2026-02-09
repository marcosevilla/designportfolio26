import type { Metadata } from "next";
import GeneralTaskContent from "./GeneralTaskContent";

export const metadata: Metadata = {
  title: "General Task — Marco Sevilla",
  description:
    "Building productivity software for Software Engineers. Designing a web-based task management tool that streamlines workflows for developers.",
};

export default function GeneralTaskPage() {
  return (
    <div className="-mt-24 lg:-mt-[18vh] pb-20">
      <GeneralTaskContent />
    </div>
  );
}
