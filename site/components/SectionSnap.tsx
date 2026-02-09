"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { setActivePanel as broadcastPanel } from "./SectionSnapContext";

// ── Rubber-band constants ────────────────────────────────────

const RUBBER_C = 0.8;
const RUBBER_D = 300;
const THRESHOLD = 18; // visual px before snap (higher to avoid accidental triggers)
const SCROLL_END_DEBOUNCE = 30;

// Going back up to bio is easier
const RUBBER_C_UP = 0.85;
const RUBBER_D_UP = 300;
const THRESHOLD_UP = 3;

// Cooldown: ignore snap zone briefly after internal scrolling stops
const SCROLL_COOLDOWN = 150;

function rubberBand(x: number, c: number, d: number): number {
  if (x <= 0) return 0;
  return (x * d * c) / (d + c * x);
}

type ActivePanel = "bio" | "work";

export default function SectionSnap({
  bioContent,
  workContent,
  peekVisible,
  frozen = false,
}: {
  bioContent: React.ReactNode;
  workContent: React.ReactNode;
  peekVisible: boolean;
  frozen?: boolean;
}) {
  const [activePanel, setActivePanel] = useState<ActivePanel>("bio");
  const rawOffset = useRef(0);
  const scrollEndTimer = useRef<ReturnType<typeof setTimeout>>();
  const transitioning = useRef(false);
  const workPanelRef = useRef<HTMLDivElement>(null);
  const bioPanelRef = useRef<HTMLDivElement>(null);
  const elasticIndicatorRef = useRef<HTMLDivElement>(null);
  const lastInternalScroll = useRef(0);

  // ── Transition to work panel ──
  const goToWork = useCallback(() => {
    if (transitioning.current) return;
    transitioning.current = true;
    rawOffset.current = 0;

    // Reset elastic indicator
    if (elasticIndicatorRef.current) {
      elasticIndicatorRef.current.style.transition = "none";
      elasticIndicatorRef.current.style.transform = "translateY(0px)";
    }

    setActivePanel("work");

    // Scroll work panel to top
    if (workPanelRef.current) {
      workPanelRef.current.scrollTop = 0;
    }

    setTimeout(() => {
      transitioning.current = false;
    }, 450);
  }, []);

  // ── Transition back to bio panel ──
  const goToBio = useCallback(() => {
    if (transitioning.current) return;
    transitioning.current = true;
    rawOffset.current = 0;

    // Reset elastic indicator
    if (elasticIndicatorRef.current) {
      elasticIndicatorRef.current.style.transition = "none";
      elasticIndicatorRef.current.style.transform = "translateY(0px)";
    }

    setActivePanel("bio");

    setTimeout(() => {
      transitioning.current = false;
    }, 450);
  }, []);

  // ── Elastic scroll at boundaries ──
  useEffect(() => {
    const indicator = elasticIndicatorRef.current;

    const springBack = () => {
      if (!indicator) return;
      indicator.style.transition = "transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)";
      indicator.style.transform = "translateY(0px)";
      rawOffset.current = 0;
      const onEnd = () => {
        indicator.style.transition = "none";
        indicator.removeEventListener("transitionend", onEnd);
      };
      indicator.addEventListener("transitionend", onEnd);
    };

    const handleScrollEnd = () => {
      if (transitioning.current) return;

      if (activePanel === "bio") {
        const visual = rubberBand(rawOffset.current, RUBBER_C, RUBBER_D);
        if (visual >= THRESHOLD) {
          goToWork();
        } else if (rawOffset.current > 0) {
          springBack();
        }
      } else {
        const visual = rubberBand(rawOffset.current, RUBBER_C_UP, RUBBER_D_UP);
        if (visual >= THRESHOLD_UP) {
          goToBio();
        } else if (rawOffset.current > 0) {
          springBack();
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (frozen || transitioning.current) return;

      if (activePanel === "bio") {
        const bioPanel = bioPanelRef.current;
        if (!bioPanel) return;

        const atBottom = bioPanel.scrollHeight - bioPanel.scrollTop - bioPanel.clientHeight < 1;

        // If not at bottom, track that we're internally scrolling
        if (!atBottom) {
          lastInternalScroll.current = Date.now();
          return;
        }

        // Cooldown: don't snap right after internal scrolling stopped
        if (Date.now() - lastInternalScroll.current < SCROLL_COOLDOWN && rawOffset.current === 0) {
          return;
        }

        if (atBottom && (e.deltaY > 0 || rawOffset.current > 0)) {
          e.preventDefault();
          rawOffset.current = Math.max(0, rawOffset.current + e.deltaY);
          const visual = rubberBand(rawOffset.current, RUBBER_C, RUBBER_D);

          // Snap immediately once threshold is hit
          if (visual >= THRESHOLD) {
            goToWork();
            return;
          }

          if (indicator) {
            indicator.style.transition = "none";
            indicator.style.transform = `translateY(${-visual}px)`;
          }

          if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
          scrollEndTimer.current = setTimeout(handleScrollEnd, SCROLL_END_DEBOUNCE);
        }
      } else if (activePanel === "work") {
        const workPanel = workPanelRef.current;
        if (!workPanel) return;

        const atTop = workPanel.scrollTop <= 0;

        if (!atTop) {
          lastInternalScroll.current = Date.now();
          return;
        }

        if (Date.now() - lastInternalScroll.current < SCROLL_COOLDOWN && rawOffset.current === 0) {
          return;
        }

        if (atTop && (e.deltaY < 0 || rawOffset.current > 0)) {
          const delta = -e.deltaY;
          if (delta > 0 || rawOffset.current > 0) {
            e.preventDefault();
            rawOffset.current = Math.max(0, rawOffset.current + delta);
            const visual = rubberBand(rawOffset.current, RUBBER_C_UP, RUBBER_D_UP);

            // Snap immediately once threshold is hit
            if (visual >= THRESHOLD_UP) {
              goToBio();
              return;
            }

            if (indicator) {
              indicator.style.transition = "none";
              indicator.style.transform = `translateY(${visual}px)`;
            }

            if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
            scrollEndTimer.current = setTimeout(handleScrollEnd, SCROLL_END_DEBOUNCE);
          }
        }
      }
    };

    // Touch handling
    let touchStartY = 0;
    let isTouching = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (frozen) return;
      touchStartY = e.touches[0].clientY;
      isTouching = true;
      if (indicator) indicator.style.transition = "none";
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (frozen || !isTouching || transitioning.current) return;
      const currentY = e.touches[0].clientY;

      if (activePanel === "bio") {
        const bioPanel = bioPanelRef.current;
        if (!bioPanel) return;
        const atBottom = bioPanel.scrollHeight - bioPanel.scrollTop - bioPanel.clientHeight < 1;

        const delta = touchStartY - currentY;
        if (atBottom && delta > 0) {
          e.preventDefault();
          rawOffset.current = delta;
          const visual = rubberBand(delta, RUBBER_C, RUBBER_D);
          if (visual >= THRESHOLD) {
            isTouching = false;
            goToWork();
            return;
          }
          if (indicator) {
            indicator.style.transform = `translateY(${-visual}px)`;
          }
        }
      } else if (activePanel === "work") {
        const workPanel = workPanelRef.current;
        if (!workPanel || workPanel.scrollTop > 0) return;
        const delta = currentY - touchStartY;
        if (delta > 0) {
          e.preventDefault();
          rawOffset.current = delta;
          const visual = rubberBand(delta, RUBBER_C_UP, RUBBER_D_UP);
          if (visual >= THRESHOLD_UP) {
            isTouching = false;
            goToBio();
            return;
          }
          if (indicator) {
            indicator.style.transform = `translateY(${visual}px)`;
          }
        }
      }
    };

    const handleTouchEnd = () => {
      if (frozen || !isTouching) return;
      isTouching = false;
      handleScrollEnd();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (frozen || transitioning.current) return;
      if (activePanel === "bio" && (e.key === "ArrowDown" || e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        goToWork();
      } else if (activePanel === "work") {
        const workPanel = workPanelRef.current;
        const atTop = workPanel && workPanel.scrollTop <= 0;
        if (atTop && e.key === "ArrowUp") {
          e.preventDefault();
          goToBio();
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
      if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
    };
  }, [activePanel, frozen, goToWork, goToBio]);

  // Broadcast activePanel to global store so Nav can read it
  useEffect(() => {
    broadcastPanel(activePanel);
  }, [activePanel]);

  // Listen for nav requests to switch panels
  useEffect(() => {
    const onGoToWork = () => goToWork();
    const onGoToBio = () => goToBio();
    window.addEventListener("section-snap:go-to-work", onGoToWork);
    window.addEventListener("section-snap:go-to-bio", onGoToBio);
    return () => {
      window.removeEventListener("section-snap:go-to-work", onGoToWork);
      window.removeEventListener("section-snap:go-to-bio", onGoToBio);
    };
  }, [goToWork, goToBio]);

  // Handle hash on mount (navigating from another page)
  // - #work → go to work panel
  // - #fb-ordering (or any case study slug) → go to work panel (dialog opens via HomeLayout)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#work") {
      const t = setTimeout(() => {
        goToWork();
        history.replaceState(null, "", "/");
      }, 100);
      return () => clearTimeout(t);
    }
    // Any other hash (case study slugs) — just switch to work panel, don't clear hash
    if (hash && hash !== "#") {
      const t = setTimeout(() => {
        goToWork();
      }, 100);
      return () => clearTimeout(t);
    }
  }, [goToWork]);

  return (
    <div className="fixed inset-0 overflow-hidden z-[31]">
      {/* Elastic indicator — wraps both panels, transforms on rubber-band */}
      <div
        ref={elasticIndicatorRef}
        style={{ height: "100%" }}
      >
        {/* Bio Panel */}
        <div
          ref={bioPanelRef}
          aria-hidden={activePanel !== "bio"}
          className="md:pl-[100px] absolute inset-0 flex justify-center will-change-transform"
          style={{
            transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease",
            transform: activePanel === "bio" ? "translateY(0)" : "translateY(-100%)",
            opacity: activePanel === "bio" ? 1 : 0,
            overflowY: activePanel === "bio" ? "auto" : "hidden",
          }}
        >
          <div className="w-full max-w-content-md px-4 sm:px-8 pt-24 md:pt-[22vh] flex flex-col min-h-full">
            <div className="flex-1 mb-16">
              {bioContent}
            </div>

            {/* "View my work" button at bottom of bio panel */}
            <div
              className="flex justify-center pb-24 transition-opacity duration-[400ms]"
              style={{
                opacity: peekVisible ? 1 : 0,
                pointerEvents: peekVisible ? "auto" : "none",
              }}
            >
              <button
                onClick={goToWork}
                className="flex items-center gap-1 py-1.5 px-[18px] rounded-[20px] border-none text-[13px] font-medium cursor-pointer transition-[background-color] duration-200 hover:bg-[color-mix(in_srgb,var(--color-accent)_18%,transparent)] animate-[gentle-float_3s_ease-in-out_infinite]"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--color-accent) 10%, transparent)",
                  color: "var(--color-accent)",
                }}
              >
                View my work <span>↓</span>
              </button>
            </div>
          </div>
        </div>

        {/* Work Panel */}
        <div
          ref={workPanelRef}
          aria-hidden={activePanel !== "work"}
          className="md:pl-[100px] absolute inset-0 flex justify-center will-change-transform"
          style={{
            transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease",
            transform: activePanel === "work" ? "translateY(0)" : "translateY(100%)",
            opacity: activePanel === "work" ? 1 : 0,
            overflowY: activePanel === "work" ? "auto" : "hidden",
          }}
        >
          <div className="w-full max-w-content-lg px-4 sm:px-8 pt-24 md:pt-[22vh] pb-20">
            {workContent}
          </div>
        </div>
      </div>
    </div>
  );
}
