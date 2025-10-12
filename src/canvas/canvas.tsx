"use client";

import "reactflow/dist/style.css";
import { ReactFlowProvider } from "reactflow";

import { AppHeader } from "@/src/ui/header/app-header";
import { NodesToolbar } from "@/src/ui/toolbar/nodes-toolbar";
import { FlowCanvas } from "@/src/canvas/components/flow-canvas";
import { ChatInput } from "@/src/ui/components/chat";
import { PropertiesDialog } from "@/src/ui/dialogs/properties-dialog";
import { Toaster } from "@/src/ui/components/toaster";

import { useCanvasStore } from "@/src/canvas/store";

function CanvasContent() {
  const editingNode = useCanvasStore((state) => state.editingNode);
  const setEditingNode = useCanvasStore((state) => state.setEditingNode);
  const setNodes = useCanvasStore((state) => state.setNodes);
  const reactFlowWrapper = useCanvasStore((state) => state.reactFlowWrapper);

  return (
    <div className="flex flex-col h-screen w-full bg-background">
      
      {/* ========== HEADER ========== */}
      <AppHeader />

      {/* ========== TOOLBAR ========== */}
      <NodesToolbar />

      {/* ========== MAIN CONTENT ========== */}
      <div className="flex-1 flex overflow-hidden relative" ref={reactFlowWrapper as any}>
        
        {/* Canvas + Viewer */}
        <FlowCanvas />

        {/* Chat Input - Bottom Center Overlay */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 z-50 pointer-events-none">
          <div className="pointer-events-auto h-32">
            <ChatInput variant="desktop" />
          </div>
        </div>
      </div>

      {/* ========== DIALOGS ========== */}
      <PropertiesDialog
        node={editingNode}
        open={!!editingNode}
        onOpenChange={(open) => {
          if (!open) setEditingNode(null);
        }}
        setNodes={setNodes as React.Dispatch<React.SetStateAction<any[]>>}
      />

      {/* ========== TOASTER ========== */}
      <Toaster />
    </div>
  );
}

// Main Canvas Component with ReactFlowProvider
export function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasContent />
    </ReactFlowProvider>
  );
}
