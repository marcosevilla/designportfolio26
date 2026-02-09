"use client";

import { motion } from "framer-motion";
import CaseStudyList from "@/components/CaseStudyList";
import type { CaseStudyMeta } from "@/lib/types";
import { typescale } from "@/lib/typography";

export default function WorkContent({ studies }: { studies: CaseStudyMeta[] }) {
  return (
    <>
      <motion.h1
        className="tracking-tight"
        style={typescale.pageTitle}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        Work
      </motion.h1>
      <motion.div
        className="mt-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <CaseStudyList studies={studies} />
      </motion.div>
    </>
  );
}
