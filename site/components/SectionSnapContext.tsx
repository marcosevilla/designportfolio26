"use client";

import { useSyncExternalStore } from "react";

// ── Scroll-based bridge for cross-tree communication ──
// Nav (in layout) reads active section; HomeLayout writes it via IntersectionObserver.

type ActivePanel = "bio" | "work";

let activePanel: ActivePanel = "bio";
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

/** Called by IntersectionObserver in HomeLayout when sections enter/leave viewport */
export function setActivePanel(panel: ActivePanel) {
  if (activePanel === panel) return;
  activePanel = panel;
  emit();
}

/** Subscribe to activePanel from anywhere (Nav, etc.) */
export function useActivePanel(): ActivePanel {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => activePanel,
    () => "bio" as ActivePanel
  );
}

/** Smooth-scroll the #work section into view */
export function requestGoToWork() {
  const el = document.getElementById("work");
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

/** Smooth-scroll to top of page (bio section) */
export function requestGoToBio() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
