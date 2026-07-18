import { notFound } from "next/navigation";
import LogoLab from "./LogoLab";

export const metadata = {
  title: "Logo Lab — Dev",
};

export default function LogoLabPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <LogoLab />;
}
