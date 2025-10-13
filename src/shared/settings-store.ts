"use client";

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

const SETTINGS_KEY = "app-settings";

export interface AppSettings {
  general: {
    theme: "light" | "dark" | "system";
    autoSave: boolean;
    autoSaveInterval: number;
  };
  viewer: {
    showGrid: boolean;
    showMinimap: boolean;
    snapToGrid: boolean;
    gridSize: number;
  };
  performance: {
    maxNodes: number;
    renderQuality: "low" | "medium" | "high";
  };
}

const DEFAULT_SETTINGS: AppSettings = {
  general: {
    theme: "system",
    autoSave: true,
    autoSaveInterval: 5,
  },
  viewer: {
    showGrid: true,
    showMinimap: false,
    snapToGrid: true,
    gridSize: 15,
  },
  performance: {
    maxNodes: 1000,
    renderQuality: "medium",
  },
};

interface SettingsActions {
  updateSettings: (settings: Partial<AppSettings>) => void;
  updateGeneralSettings: (settings: Partial<AppSettings["general"]>) => void;
  updateViewerSettings: (settings: Partial<AppSettings["viewer"]>) => void;
  updatePerformanceSettings: (settings: Partial<AppSettings["performance"]>) => void;
  resetSettings: () => void;
}

type SettingsStore = AppSettings & SettingsActions;

export const useSettingsStore = create<SettingsStore>()(
  devtools(
    persist(
      (set) => ({
        ...DEFAULT_SETTINGS,

        updateSettings: (newSettings) =>
          set((state) => ({ ...state, ...newSettings })),

        updateGeneralSettings: (generalSettings) =>
          set((state) => ({
            general: { ...state.general, ...generalSettings },
          })),

        updateViewerSettings: (viewerSettings) =>
          set((state) => ({
            viewer: { ...state.viewer, ...viewerSettings },
          })),

        updatePerformanceSettings: (performanceSettings) =>
          set((state) => ({
            performance: { ...state.performance, ...performanceSettings },
          })),

        resetSettings: () => set(DEFAULT_SETTINGS),
      }),
      {
        name: SETTINGS_KEY,
      }
    ),
    { name: "SettingsStore" }
  )
);
