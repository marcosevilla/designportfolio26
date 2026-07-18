import { notFound } from "next/navigation";
import EffectsLab from "./EffectsLab";

export const metadata = {
  title: "Effects Lab — Dev",
};

export default function EffectsLabPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <EffectsLab />;
}
