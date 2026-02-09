"use client";

export default function ViewportFade() {
  return (
    <div
      className="fixed bottom-0 left-0 w-full pointer-events-none z-[32]"
      style={{
        height: "120px",
        background:
          "linear-gradient(to bottom, transparent 0%, var(--color-bg) 100%)",
      }}
    />
  );
}
