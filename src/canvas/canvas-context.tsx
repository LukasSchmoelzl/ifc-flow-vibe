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

// Provider Component
function CanvasStateProvider({ children }: { children: ReactNode }) {
  const canvasState = useCanvasState();
  
  return (
    <CanvasContext.Provider value={canvasState}>
      {children}
    </CanvasContext.Provider>
  );
}

// Export kombinierter Provider (ReactFlow + Canvas State)
export function CanvasProvider({ children }: { children: ReactNode }) {
  return (
    <ReactFlowProvider>
      <CanvasStateProvider>
        {children}
      </CanvasStateProvider>
    </ReactFlowProvider>
  );
}

