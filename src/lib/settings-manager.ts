"use client"

import { useEffect, useState } from "react"

const SETTINGS_KEY = 'app-settings';

export interface AppSettings {
  general: {
    theme: "light" | "dark" | "system"
    autoSave: boolean
    autoSaveInterval: number // in minutes
  }
  viewer: {
    showGrid: boolean
    showMinimap: boolean
    snapToGrid: boolean
    gridSize: number
  }
  performance: {
    maxNodes: number
    renderQuality: "low" | "medium" | "high"
  }
}

// Load viewer settings from localStorage
export const loadViewerSetting = (
  key: 'showGrid' | 'showMinimap',
  defaultValue: boolean
): boolean => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.viewer?.[key] ?? defaultValue;
      }
    } catch (e) {
      console.error(`Error loading ${key} setting:`, e);
    }
  }
  return defaultValue;
};

// Default settings
export const defaultSettings: AppSettings = {
  general: {
    theme: "system",
    autoSave: true,
    autoSaveInterval: 5, // 5 minutes
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
}

// Load settings from localStorage
export function loadSettings(): AppSettings {
  if (typeof window === "undefined") return defaultSettings

  try {
    const savedSettings = localStorage.getItem(SETTINGS_KEY)
    if (savedSettings) {
      return { ...defaultSettings, ...JSON.parse(savedSettings) }
    }
  } catch (error) {
    console.error("Error loading settings:", error)
  }

  return defaultSettings
}

// Save settings to localStorage
export function saveSettings(settings: AppSettings): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error("Error saving settings:", error)
  }
}

// Hook to use app settings
export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)

  useEffect(() => {
    setSettings(loadSettings())
  }, [])

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)
    saveSettings(updated)
  }

  const updateGeneralSettings = (generalSettings: Partial<AppSettings["general"]>) => {
    const updated = {
      ...settings,
      general: { ...settings.general, ...generalSettings },
    }
    setSettings(updated)
    saveSettings(updated)
  }

  const updateViewerSettings = (viewerSettings: Partial<AppSettings["viewer"]>) => {
    const updated = {
      ...settings,
      viewer: { ...settings.viewer, ...viewerSettings },
    }
    setSettings(updated)
    saveSettings(updated)
  }

  const updatePerformanceSettings = (performanceSettings: Partial<AppSettings["performance"]>) => {
    const updated = {
      ...settings,
      performance: { ...settings.performance, ...performanceSettings },
    }
    setSettings(updated)
    saveSettings(updated)
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
    saveSettings(defaultSettings)
  }

  return {
    settings,
    updateSettings,
    updateGeneralSettings,
    updateViewerSettings,
    updatePerformanceSettings,
    resetSettings,
  }
}

