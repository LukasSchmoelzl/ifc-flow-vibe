"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";

const MOBILE_BREAKPOINT = 768;

interface UIState {
  isMobile: boolean;
}

interface UIActions {
  setIsMobile: (isMobile: boolean) => void;
  initMobile: () => void;
}

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>()(
  devtools(
    (set) => ({
      // State
      isMobile: false,

      // Actions
      setIsMobile: (isMobile) => set({ isMobile }),

      initMobile: () => {
        if (typeof window === "undefined") return;

        const updateMobile = () => {
          set({ isMobile: window.innerWidth < MOBILE_BREAKPOINT });
        };

        // Initial check
        updateMobile();

        // Listen for changes
        const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
        mql.addEventListener("change", updateMobile);

        return () => mql.removeEventListener("change", updateMobile);
      },
    }),
    { name: "UIStore" }
  )
);

