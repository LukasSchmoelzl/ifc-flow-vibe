"use client";

import "reactflow/dist/style.css";
import { ReactFlowProvider } from "reactflow";

// Domains
import { AppHeader } from "@/src/header/menu/app-header";
import { NodesToolbar } from "@/src/header/toolbar/nodes-toolbar";
import { FlowCanvas } from "@/src/canvas/ui/flow-canvas";
import { ChatInput } from "@/src/llm/ui/chat";
import { PropertiesDialog } from "@/src/header/dialogs/properties-dialog";

// Canvas State
import { useCanvasStore } from "@/src/canvas/state/store";

function AppContent() {
  const editingNode = useCanvasStore((state) => state.editingNode);
  const setEditingNode = useCanvasStore((state) => state.setEditingNode);
  const setNodes = useCanvasStore((state) => state.setNodes);

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

      {/* ========== DIALOGS (HEADER DOMAIN) ========== */}
      <PropertiesDialog
        node={editingNode}
        open={!!editingNode}
        onOpenChange={(open) => {
          if (!open) setEditingNode(null);
        }}
        setNodes={setNodes as React.Dispatch<React.SetStateAction<any[]>>}
      />

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
