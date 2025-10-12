"use client";

import { ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";

import { AppHeader } from "@/src/ui/header/app-header";
import { NodesToolbar } from "@/src/ui/toolbar/nodes-toolbar";
import { FlowCanvas } from "@/src/canvas/components/flow-canvas";
import { ChatInput } from "@/src/ui/components/chat";
import { PropertiesDialog } from "@/src/ui/dialogs/properties-dialog";
import { Toaster } from "@/src/ui/components/toaster";

import { useCanvasState } from "@/src/canvas/use-canvas-state";

function App() {
  const {
    // Canvas state
    nodes,
    edges,
    editingNode,
    currentWorkflow,
    focusedViewerId,
    
    // Canvas handlers
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDrop,
    onDragOver,
    onNodeClick,
    onNodeDoubleClick,
    onCanvasClick,
    setEditingNode,
    setNodes,
    setFocusedViewerId,
    
    // Workflow operations
    handleOpenFile,
    handleSaveWorkflow,
    handleLoadWorkflow,
    handleRunWorkflow,
    isRunning,
    setIsRunning,
    
    // History
    canUndo,
    canRedo,
    handleUndo,
    handleRedo,
    
    // Clipboard
    handleSelectAll,
    handleCopy,
    handleCut,
    handlePaste,
    handleDelete,
    
    // Mobile placement
    selectedNodeType,
    placementMode,
    handleMobileNodeSelect,
    
    // View settings
    showGrid,
    showMinimap,
    isSettingsLoaded,
    setShowGrid,
    setShowMinimap,
    
    // File drag
    isFileDragging,
    
    // Utils
    isMobile,
    reactFlowWrapper,
    reactFlowInstance,
    getFlowObject,
  } = useCanvasState();

    return (
    <div className="flex flex-col h-screen w-full bg-background">
      
      {/* ========== HEADER ========== */}
      <AppHeader
          onOpenFile={handleOpenFile}
        onSaveWorkflow={(wf) => handleSaveWorkflow(wf.name, wf.flowData)}
          onRunWorkflow={handleRunWorkflow}
          onLoadWorkflow={handleLoadWorkflow}
          isRunning={isRunning}
          setIsRunning={setIsRunning}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
          getFlowObject={getFlowObject}
          currentWorkflow={currentWorkflow}
          reactFlowInstance={reactFlowInstance}
          showGrid={showGrid}
          setShowGrid={setShowGrid}
          showMinimap={showMinimap}
          setShowMinimap={setShowMinimap}
          onSelectAll={handleSelectAll}
          onCopy={handleCopy}
          onCut={handleCut}
          onPaste={handlePaste}
          onDelete={handleDelete}
      />

      {/* ========== TOOLBAR ========== */}
      <NodesToolbar
        onNodeSelect={handleMobileNodeSelect}
        selectedNodeType={selectedNodeType}
        placementMode={placementMode}
      />

      {/* ========== MAIN CONTENT ========== */}
      <div className="flex-1 flex overflow-hidden relative" ref={reactFlowWrapper}>
        
        {/* Canvas + Viewer */}
        <FlowCanvas
                nodes={nodes}
                edges={edges}
          onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeClick={onNodeClick}
                onNodeDoubleClick={onNodeDoubleClick}
          onPaneClick={onCanvasClick}
          isFileDragging={isFileDragging}
          isMobile={isMobile}
          placementMode={placementMode}
          selectedNodeType={selectedNodeType}
          showGrid={showGrid}
          showMinimap={showMinimap}
          isSettingsLoaded={isSettingsLoaded}
          focusedViewerId={focusedViewerId}
          setFocusedViewerId={setFocusedViewerId}
          currentWorkflow={currentWorkflow}
        />

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

export default function Home() {
  return (
    <ReactFlowProvider>
      <App />
    </ReactFlowProvider>
  );
}
