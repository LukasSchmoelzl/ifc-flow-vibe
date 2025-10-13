"use client";

import "reactflow/dist/style.css";
import { ReactFlowProvider } from "reactflow";

// Domains
import { AppHeader } from "@/src/header/app-header";
import { NodesToolbar } from "@/src/header/nodes-toolbar";
import { FlowCanvas } from "@/src/canvas/flow-canvas";
import { ChatInput } from "@/src/llm/chat-input";
import { FileDropOverlay } from "@/src/overlays/file-drop";
import { MobilePlacementOverlay } from "@/src/overlays/mobile-placement";
// Canvas State
import { useCanvasStore } from "@/src/canvas/store";
import { useIsMobile } from "@/src/shared/hooks/use-mobile";
import { getNodeLabel } from "@/src/canvas/nodes/auto-registry";

function AppContent() {
  const isMobile = useIsMobile();
  const isFileDragging = useCanvasStore(state => state.isFileDragging);
  const placementMode = useCanvasStore(state => state.placementMode);
  const selectedNodeType = useCanvasStore(state => state.selectedNodeType);

    return (
    <div className="flex flex-col h-screen w-full bg-background">
      
      {/* ========== GLOBAL OVERLAYS ========== */}
      <FileDropOverlay isVisible={isFileDragging} />
      <MobilePlacementOverlay
        isVisible={isMobile && placementMode && selectedNodeType !== null}
        nodeLabel={selectedNodeType ? getNodeLabel(selectedNodeType) : ""}
      />
      
      {/* ========== HEADER DOMAIN ========== */}
      <AppHeader />
      <NodesToolbar />

      {/* ========== MAIN CONTENT ========== */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* CANVAS DOMAIN */}
        <FlowCanvas />

        {/* LLM DOMAIN - Chat Input Overlay */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 z-50 pointer-events-none">
          <div className="pointer-events-auto h-32">
            <ChatInput variant="desktop" />
                </div>
              </div>
            </div>

    </div>
  );
}

// Main App with ReactFlowProvider
export default function Home() {
  return (
    <ReactFlowProvider>
      <AppContent />
    </ReactFlowProvider>
  );
}
