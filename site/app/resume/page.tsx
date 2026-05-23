import Resume from "@/components/Resume";

export const metadata = {
  title: "Marco Sevilla — Resume",
};

export default function ResumePage() {
  return (
    <main className="mx-auto max-w-[720px] px-8 py-16 print:py-0">
      <Resume />
    </main>
  );
}
