"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  // Unmount the overlay once the fade finishes — a full-viewport
  // backdrop-filter layer left at opacity 0 stays live in the compositor
  // for the whole visit otherwise. Template remounts per navigation, so
  // the state resets on each route change.
  const [done, setDone] = useState(false);

  return (
    <>
      {children}
      {/* Blur-in overlay — fades out to reveal content, no filter on ancestors */}
      {!done && (
        <motion.div
          className="fixed inset-0 z-100 pointer-events-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          onAnimationComplete={() => setDone(true)}
          style={{
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            backgroundColor: "var(--color-bg)",
          }}
        />
      )}
    </>
  );
}
