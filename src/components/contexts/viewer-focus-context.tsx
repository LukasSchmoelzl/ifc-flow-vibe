"use client";

import { createContext, useContext, ReactNode } from "react";

interface ViewerFocusContextType {
    focusedViewerId: string | null;
    setFocusedViewerId: (id: string | null) => void;
}

const ViewerFocusContext = createContext<ViewerFocusContextType | undefined>(undefined);

export function useViewerFocus() {
    const context = useContext(ViewerFocusContext);
    if (context === undefined) {
        throw new Error("useViewerFocus must be used within a ViewerFocusProvider");
    }
    return context;
}

export function ViewerFocusProvider({
    children,
    focusedViewerId,
    setFocusedViewerId
}: {
    children: ReactNode;
    focusedViewerId: string | null;
    setFocusedViewerId: (id: string | null) => void;
}) {
    return (
        <ViewerFocusContext.Provider value={{ focusedViewerId, setFocusedViewerId }}>
            {children}
        </ViewerFocusContext.Provider>
    );
} 