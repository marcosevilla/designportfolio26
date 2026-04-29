import WorkGate from "./WorkGate";

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  return <WorkGate>{children}</WorkGate>;
}
