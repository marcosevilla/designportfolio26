import { notFound } from "next/navigation";
import TypeTuner from "@/components/type-tuner/TypeTuner";

export const metadata = {
  title: "Type Lab — Dev",
};

export default function TypeLabPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <TypeTuner />;
}
