"use client";

import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {/* Blur-in overlay — fades out to reveal content, no filter on ancestors */}
      <motion.div
        className="fixed inset-0 z-[100] pointer-events-none"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          backgroundColor: "var(--color-bg)",
        }}
      />
    </>
  );
}
