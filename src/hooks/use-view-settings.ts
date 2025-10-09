"use client";

import { useState, useCallback, useEffect } from "react";
import { useAppSettings, loadViewerSetting } from "@/src/lib/settings-manager";

export function useViewSettings() {
  const { updateViewerSettings } = useAppSettings();
  const [showGrid, setShowGridState] = useState(true);
  const [showMinimap, setShowMinimapState] = useState(false);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

  const setShowGrid = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    const newValue = typeof value === 'function' ? value(showGrid) : value;
    setShowGridState(newValue);
    updateViewerSettings({ showGrid: newValue });
  }, [showGrid, updateViewerSettings]);

  const setShowMinimap = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    const newValue = typeof value === 'function' ? value(showMinimap) : value;
    setShowMinimapState(newValue);
    updateViewerSettings({ showMinimap: newValue });
  }, [showMinimap, updateViewerSettings]);

  useEffect(() => {
    const gridSetting = loadViewerSetting('showGrid', true);
    const minimapSetting = loadViewerSetting('showMinimap', false);

    setShowGridState(gridSetting);
    setShowMinimapState(minimapSetting);
    setIsSettingsLoaded(true);
  }, []);

  return {
    showGrid,
    showMinimap,
    isSettingsLoaded,
    setShowGrid,
    setShowMinimap,
  };
}

