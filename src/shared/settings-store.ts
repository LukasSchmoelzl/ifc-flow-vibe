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

interface SettingsState {
  settings: AppSettings;
}

interface SettingsActions {
  updateSettings: (settings: Partial<AppSettings>) => void;
  updateGeneralSettings: (settings: Partial<AppSettings["general"]>) => void;
  updateViewerSettings: (settings: Partial<AppSettings["viewer"]>) => void;
  updatePerformanceSettings: (settings: Partial<AppSettings["performance"]>) => void;
  resetSettings: () => void;
}

type SettingsStore = SettingsState & SettingsActions;

export const useSettingsStore = create<SettingsStore>()(
  devtools(
    persist(
      (set) => ({
        // State
        settings: DEFAULT_SETTINGS,

        // Actions
        updateSettings: (newSettings) =>
          set((state) => ({
            settings: { ...state.settings, ...newSettings },
          })),

        updateGeneralSettings: (generalSettings) =>
          set((state) => ({
            settings: {
              ...state.settings,
              general: { ...state.settings.general, ...generalSettings },
            },
          })),

        updateViewerSettings: (viewerSettings) =>
          set((state) => ({
            settings: {
              ...state.settings,
              viewer: { ...state.settings.viewer, ...viewerSettings },
            },
          })),

        updatePerformanceSettings: (performanceSettings) =>
          set((state) => ({
            settings: {
              ...state.settings,
              performance: { ...state.settings.performance, ...performanceSettings },
            },
          })),

        resetSettings: () =>
          set({
            settings: DEFAULT_SETTINGS,
          }),
      }),
      {
        name: SETTINGS_KEY,
      }
    ),
    { name: "SettingsStore" }
  )
);

// Helper to load viewer setting (compatibility with old code)
export const loadViewerSetting = (
  key: "showGrid" | "showMinimap",
  defaultValue: boolean
): boolean => {
  if (typeof window === "undefined") return defaultValue;

  try {
    const state = useSettingsStore.getState();
    return state.settings.viewer[key] ?? defaultValue;
  } catch (e) {
    console.error(`Error loading ${key} setting:`, e);
    return defaultValue;
  }
};

