"use client";

import { createContext, useContext, type ReactNode } from "react";
import { ReactFlowProvider } from "reactflow";
import { useCanvasState } from "./use-canvas-state";

// Type für den Canvas Context
type CanvasContextType = ReturnType<typeof useCanvasState>;

const CanvasContext = createContext<CanvasContextType | null>(null);

// Hook um Canvas State zu nutzen
export function useCanvas() {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error("useCanvas must be used within CanvasProvider");
  }
  return context;
}

// Internal component that provides canvas state (needs ReactFlow context)
function CanvasStateProvider({ children }: { children: ReactNode }) {
  const canvasState = useCanvasState(); // Uses useReactFlow() internally
  
  return (
    <CanvasContext.Provider value={canvasState}>
      {children}
    </CanvasContext.Provider>
  );
}

// Main Provider - combines ReactFlow + Canvas State in one
export function CanvasProvider({ children }: { children: ReactNode }) {
  return (
    <ReactFlowProvider>
      <CanvasStateProvider>{children}</CanvasStateProvider>
    </ReactFlowProvider>
  );
}
