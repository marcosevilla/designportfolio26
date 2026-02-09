"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRef } from "react";

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section";
}

export default function FadeIn({
  children,
  className,
  delay = 0,
  as = "div",
}: FadeInProps) {
  const shouldReduce = useReducedMotion();
  const Component = motion[as];

  if (shouldReduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <Component
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </Component>
  );
}
