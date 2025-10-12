"use client";

import { useState, useCallback, useRef } from "react";
import {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Edge,
  type Node,
} from "reactflow";
import "reactflow/dist/style.css";

// Components
import { PropertiesDialog } from "@/src/ui/dialogs/properties-dialog";
import { AppHeader } from "@/src/ui/header/app-header";
import { NodesToolbar } from "@/src/ui/toolbar/nodes-toolbar";
import { FlowCanvas } from "@/src/canvas/components/flow-canvas";
import { Toaster } from "@/src/ui/components/toaster";
import { ChatInput } from "@/src/ui/components/chat";

// Hooks
import { useIsMobile } from "@/src/hooks/use-mobile";
import { useToast } from "@/src/hooks/use-toast";
import { useKeyboardShortcuts } from "@/src/lib/keyboard-shortcuts";
import { useAppSettings } from "@/src/lib/settings-manager";
import { useTheme } from "next-themes";
import { useWorkflowHistory } from "@/src/canvas/hooks/use-workflow-history";
import { useClipboard } from "@/src/canvas/hooks/use-clipboard";
import { useFileDrag } from "@/src/canvas/hooks/use-file-drag";
import { useNodeDragging } from "@/src/canvas/hooks/use-node-dragging";
import { useMobilePlacement } from "@/src/canvas/hooks/use-mobile-placement";
import { useWorkflowOperations } from "@/src/canvas/hooks/use-workflow-operations";
import { useAppHotkeys } from "@/src/hooks/use-app-hotkeys";
import { useViewSettings } from "@/src/canvas/hooks/use-view-settings";
import { useNodeOperations } from "@/src/canvas/hooks/use-node-operations";
import { useFlowHandlers } from "@/src/canvas/hooks/use-flow-handlers";
import { useFileDropHandler } from "@/src/canvas/hooks/use-file-drop-handler";

// Types
import type { Workflow } from "@/src/canvas/workflow-storage";

function CanvasAppContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [focusedViewerId, setFocusedViewerId] = useState<string | null>(null);
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useReactFlow();
  
  const { toast } = useToast();
  const { shortcuts } = useKeyboardShortcuts();
  const { settings, updateViewerSettings } = useAppSettings();
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();

  // View settings
  const { showGrid, showMinimap, isSettingsLoaded, setShowGrid, setShowMinimap } = useViewSettings();

  // History management
  const {
    history,
    historyIndex,
    canUndo,
    canRedo,
    setHistory,
    setHistoryIndex,
  } = useWorkflowHistory();

  const saveToHistory = useCallback(
    (nodes: Node[], edges: Edge[]) => {
      const newHistoryItem = { nodes, edges };
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newHistoryItem);

      if (newHistory.length > 50) {
        newHistory.shift();
      } else {
        setHistoryIndex(historyIndex + 1);
      }

      setHistory(newHistory);
    },
    [history, historyIndex, setHistory, setHistoryIndex]
  );

  // Clipboard
  const { clipboard, setClipboard } = useClipboard();

  // File drag and drop
  const { isFileDragging, setIsFileDragging } = useFileDrag();

  // Node dragging
  const { isNodeDragging, setIsNodeDragging } = useNodeDragging();

  // Workflow operations
  const {
    currentWorkflow,
    isRunning,
    setIsRunning,
    handleOpenFile,
    handleSaveWorkflow,
    handleLoadWorkflow,
    handleRunWorkflow,
  } = useWorkflowOperations(nodes, edges, setNodes, setEdges, saveToHistory);

  // Mobile placement
  const {
    selectedNodeType,
    placementMode,
    handleMobileNodeSelect,
    placeNode,
  } = useMobilePlacement(isMobile, setNodes, saveToHistory);

  // Undo/Redo handlers
  const handleUndo = useCallback(() => {
    if (!canUndo || historyIndex <= 0) return;
    const previousState = history[historyIndex - 1];
    setNodes(previousState.nodes);
    setEdges(previousState.edges);
    setHistoryIndex(historyIndex - 1);
  }, [canUndo, historyIndex, history, setNodes, setEdges, setHistoryIndex]);

  const handleRedo = useCallback(() => {
    if (!canRedo || historyIndex >= history.length - 1) return;
    const nextState = history[historyIndex + 1];
    setNodes(nextState.nodes);
    setEdges(nextState.edges);
    setHistoryIndex(historyIndex + 1);
  }, [canRedo, historyIndex, history, setNodes, setEdges, setHistoryIndex]);

  // Node operations
  const { handleSelectAll, handleCopy, handleCut, handlePaste, handleDelete } = useNodeOperations(
    nodes,
    edges,
    setNodes,
    setEdges,
    clipboard,
    setClipboard,
    saveToHistory
  );

  // Flow handlers
  const {
    handleNodesChange,
    onConnect,
    onDragOver,
    onDrop,
    onNodeClick,
    onNodeDoubleClick,
    getFlowObject,
  } = useFlowHandlers(
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    reactFlowInstance,
    reactFlowWrapper,
    isNodeDragging,
    setIsNodeDragging,
    saveToHistory,
    setSelectedNode,
    setEditingNode
  );

  // File drop handler
  useFileDropHandler({
    onFileOpen: handleOpenFile,
    isFileDragging,
    setIsFileDragging,
    reactFlowWrapper,
  });

  // Keyboard shortcuts
  useAppHotkeys({
    nodes,
    edges,
    clipboard,
    currentWorkflow,
    canUndo,
    canRedo,
    reactFlowInstance,
    shortcuts,
    onSaveWorkflow: handleSaveWorkflow,
    onOpenFile: handleOpenFile,
    onUndo: handleUndo,
    onRedo: handleRedo,
    onSelectAll: handleSelectAll,
    onCopy: handleCopy,
    onCut: handleCut,
    onPaste: handlePaste,
    onDelete: handleDelete,
    onRunWorkflow: handleRunWorkflow,
  });

  // Handle canvas click for mobile node placement
  const handleCanvasClick = useCallback(
    (event: React.MouseEvent) => {
      if (isMobile && placementMode && selectedNodeType) {
        const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
        if (!reactFlowBounds) return;

        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        placeNode(position, nodes, edges);
        return;
      }

      setEditingNode(null);
      if (focusedViewerId) {
        setFocusedViewerId(null);
      }
    },
    [isMobile, placementMode, selectedNodeType, reactFlowInstance, nodes, edges, placeNode, focusedViewerId, setFocusedViewerId, setEditingNode]
  );

  return (
    <div className="flex flex-col h-screen w-full bg-background">
      {/* Header Row 1: Menu & Actions */}
      <AppHeader
        onOpenFile={handleOpenFile}
        onSaveWorkflow={(wf: Workflow) => handleSaveWorkflow(wf.name, wf.flowData)}
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

      {/* Header Row 2: Nodes Toolbar */}
      <NodesToolbar
        onNodeSelect={handleMobileNodeSelect}
        selectedNodeType={selectedNodeType}
        placementMode={placementMode}
      />

      {/* Main Content: Canvas & Viewer */}
      <div className="flex-1 flex overflow-hidden relative" ref={reactFlowWrapper}>
        <FlowCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          onPaneClick={handleCanvasClick}
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

        {/* AI Chat Input - Bottom Center */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 z-50 pointer-events-none">
          <div className="pointer-events-auto h-32">
            <ChatInput variant="desktop" />
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <PropertiesDialog
        node={editingNode}
        open={!!editingNode}
        onOpenChange={(open) => {
          if (!open) {
            setEditingNode(null);
          }
        }}
        setNodes={setNodes as React.Dispatch<React.SetStateAction<any[]>>}
      />
      
      <Toaster />
    </div>
  );
}

// Main export with ReactFlowProvider wrapper
export function CanvasApp() {
  return (
    <ReactFlowProvider>
      <CanvasAppContent />
    </ReactFlowProvider>
  );
}

