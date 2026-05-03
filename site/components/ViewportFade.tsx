"use client";

// Bottom-of-viewport fade that softens the boundary where the page meets
// the desktop chat pill. Hidden below lg — on mobile the floating bottom
// pill carousel already lives in this zone, the fade reads as a hard
// white band cutting off content above the iOS browser chrome, and it
// has nothing to soften since there's no fixed corner CTA.
export default function ViewportFade() {
  return (
    <div
      className="hidden lg:block fixed bottom-0 left-0 w-full pointer-events-none z-32"
      style={{
        height: "120px",
        background:
          "linear-gradient(to bottom, transparent 0%, var(--color-bg) 100%)",
      }}
    />
  );
}
