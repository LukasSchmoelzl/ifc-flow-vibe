"use client";

import "reactflow/dist/style.css";
import { ReactFlowProvider } from "reactflow";

// Domains
import { AppHeader } from "@/src/header/app-header";
import { NodesToolbar } from "@/src/header/nodes-toolbar";
import { FlowCanvas } from "@/src/canvas/ui/flow-canvas";
import { ChatInput } from "@/src/llm/chat-input";
// Canvas State
import { useCanvasStore } from "@/src/canvas/state/store";

function AppContent() {

    return (
    <div className="flex flex-col h-screen w-full bg-background">
      
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
