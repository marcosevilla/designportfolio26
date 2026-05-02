"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { DEFAULT_SCENE, SCENES, type VisualizerScene } from "./visualizer-scenes";

const VALID_SCENES = new Set<string>(SCENES.map((s) => s.id));

// Bumped key — radio-with-clear semantics; old multi-select state is ignored.
const STORAGE_KEY = "visualizer-scenes-v3";

interface SceneCtx {
  activeScenes: Set<VisualizerScene>;
  toggleScene: (s: VisualizerScene) => void;
  setOnlyScene: (s: VisualizerScene) => void;
  /** Legacy compat — returns first active scene (or default if empty). */
  scene: VisualizerScene;
  /** Legacy compat — replaces all active scenes with just this one. */
  setScene: (s: VisualizerScene) => void;
}

const Ctx = createContext<SceneCtx | null>(null);

export function VisualizerSceneProvider({ children }: { children: React.ReactNode }) {
  const [activeScenes, setActiveScenesState] = useState<Set<VisualizerScene>>(
    () => new Set([DEFAULT_SCENE])
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const arr = JSON.parse(saved) as string[];
      if (!Array.isArray(arr)) return;
      const filtered = arr.filter((s): s is VisualizerScene => VALID_SCENES.has(s));
      // Mutually exclusive — keep at most one. Empty array is a valid
      // persisted state (user cleared all scenes → falls back to idle).
      setActiveScenesState(new Set(filtered.slice(0, 1)));
    } catch {
      /* ignore */
    }
  }, []);

  const persist = (next: Set<VisualizerScene>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
    } catch {
      /* ignore */
    }
  };

  // Radio-with-clear: clicking a scene makes it the only active one;
  // clicking the currently-active scene clears the set, falling back to
  // the idle perlin field.
  const toggleScene = useCallback((s: VisualizerScene) => {
    setActiveScenesState((prev) => {
      const isOnlyActive = prev.size === 1 && prev.has(s);
      const next = isOnlyActive ? new Set<VisualizerScene>() : new Set<VisualizerScene>([s]);
      persist(next);
      return next;
    });
  }, []);

  const setOnlyScene = useCallback((s: VisualizerScene) => {
    setActiveScenesState(() => {
      const next = new Set<VisualizerScene>([s]);
      persist(next);
      return next;
    });
  }, []);

  const scene =
    activeScenes.size > 0 ? (Array.from(activeScenes)[0] as VisualizerScene) : DEFAULT_SCENE;

  return (
    <Ctx.Provider
      value={{ activeScenes, toggleScene, setOnlyScene, scene, setScene: setOnlyScene }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useVisualizerScene() {
  const v = useContext(Ctx);
  if (!v) {
    return {
      activeScenes: new Set<VisualizerScene>([DEFAULT_SCENE]),
      toggleScene: () => {},
      setOnlyScene: () => {},
      scene: DEFAULT_SCENE,
      setScene: () => {},
    } as SceneCtx;
  }
  return v;
}
