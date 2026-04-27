"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { DEFAULT_SCENE, type VisualizerScene } from "./visualizer-scenes";

// Bumped key — old single-scene values (visualizer-scene) are ignored.
const STORAGE_KEY = "visualizer-scenes-v2";

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
      const arr = JSON.parse(saved) as VisualizerScene[];
      if (Array.isArray(arr) && arr.length > 0) {
        setActiveScenesState(new Set(arr));
      }
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

  const toggleScene = useCallback((s: VisualizerScene) => {
    setActiveScenesState((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
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
