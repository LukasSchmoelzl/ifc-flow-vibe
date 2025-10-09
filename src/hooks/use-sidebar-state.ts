"use client";

import { useState, useCallback, useEffect } from "react";

export function useSidebarState(isMobile: boolean) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen(!sidebarOpen);

    if ('vibrate' in navigator && isMobile) {
      navigator.vibrate(50);
    }
  }, [sidebarOpen, isMobile]);

  const handleBackdropClick = useCallback(() => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [isMobile, sidebarOpen]);

  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isMobile, sidebarOpen]);

  return {
    sidebarOpen,
    setSidebarOpen,
    handleSidebarToggle,
    handleBackdropClick,
  };
}

