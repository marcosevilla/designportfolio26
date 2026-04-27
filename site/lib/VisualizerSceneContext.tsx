"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { DEFAULT_SCENE, type VisualizerScene } from "./visualizer-scenes";

const STORAGE_KEY = "visualizer-scene";

interface SceneCtx {
  scene: VisualizerScene;
  setScene: (s: VisualizerScene) => void;
}

const Ctx = createContext<SceneCtx | null>(null);

export function VisualizerSceneProvider({ children }: { children: React.ReactNode }) {
  const [scene, setSceneState] = useState<VisualizerScene>(DEFAULT_SCENE);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as VisualizerScene | null;
    if (saved) setSceneState(saved);
  }, []);

  const setScene = useCallback((s: VisualizerScene) => {
    setSceneState(s);
    try {
      localStorage.setItem(STORAGE_KEY, s);
    } catch {
      /* ignore */
    }
  }, []);

  return <Ctx.Provider value={{ scene, setScene }}>{children}</Ctx.Provider>;
}

export function useVisualizerScene() {
  const v = useContext(Ctx);
  if (!v) {
    // Allow no-provider usage to keep the matrix functional even before the
    // provider is wired (e.g., during transitional renders).
    return { scene: DEFAULT_SCENE, setScene: () => {} } as SceneCtx;
  }
  return v;
}
