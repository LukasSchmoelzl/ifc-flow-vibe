"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Panel,
  MiniMap,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type NodeChange,
  type OnInit,
  type SelectionMode,
} from "reactflow";
import "reactflow/dist/style.css";
import { Sidebar } from "@/src/components/sidebar";
import { PropertiesDialog } from "@/src/components/dialogs/properties-dialog";
import { AppMenubar } from "@/src/components/menubar";
import { useIsMobile } from "@/src/hooks/use-mobile";
import { Toaster } from "@/src/components/toaster";
import { useToast } from "@/src/hooks/use-toast";
import type { Workflow } from "@/src/lib/workflow-storage";
import { useHotkeys } from "react-hotkeys-hook";
import {
  parseKeyCombination,
  useKeyboardShortcuts,
} from "@/src/lib/keyboard-shortcuts";
import { useAppSettings } from "@/src/lib/settings-manager";
import { useTheme } from "next-themes";
import { ViewerFocusProvider } from "@/src/components/contexts/viewer-focus-context";
import { nodeCategories } from "@/src/components/sidebar";

// Import the centralized nodeTypes to prevent React Flow warning
import { nodeTypes } from "@/src/nodes";

// Import custom hooks
import { useWorkflowHistory } from "@/src/hooks/use-workflow-history";
import { useClipboard } from "@/src/hooks/use-clipboard";
import { useFileDrag } from "@/src/hooks/use-file-drag";
import { useNodeDragging } from "@/src/hooks/use-node-dragging";
import { useMobilePlacement } from "@/src/hooks/use-mobile-placement";
import { useWorkflowOperations } from "@/src/hooks/use-workflow-operations";

// Import components
import { FooterPill } from "@/src/components/flow/FooterPill";
import { FileDropOverlay } from "@/src/components/flow/FileDropOverlay";
import { MobilePlacementOverlay } from "@/src/components/flow/MobilePlacementOverlay";

// Import utilities
import { createNode, getNodeLabel, loadViewerSetting } from "@/src/lib/node-factory";

// Define all ReactFlow props outside the component to prevent warnings
const SHORTCUTS_ENABLED = false;
const edgeTypes = {} as const;
const snapGrid: [number, number] = [15, 15];
const proOptions = { hideAttribution: true };
const defaultStyle = { cursor: 'default' };
const placementStyle = { cursor: 'crosshair' };

// Create a wrapper component that uses the ReactFlow hooks
function FlowWithProvider() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { shortcuts } = useKeyboardShortcuts();
  const { settings, updateViewerSettings } = useAppSettings();
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // View settings - start with defaults to match server rendering
  const [showGrid, setShowGridState] = useState(true);
  const [showMinimap, setShowMinimapState] = useState(false);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

  // Wrapper functions to update both state and localStorage
  const setShowGrid = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    const newValue = typeof value === 'function' ? value(showGrid) : value;
    setShowGridState(newValue);
    updateViewerSettings({ showGrid: newValue });
  }, [showGrid, updateViewerSettings]);

  const setShowMinimap = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    const newValue = typeof value === 'function' ? value(showMinimap) : value;
    setShowMinimapState(newValue);
    updateViewerSettings({ showMinimap: newValue });
  }, [showMinimap, updateViewerSettings]);

  // Load persisted settings after mount to avoid hydration issues
  useEffect(() => {
    const gridSetting = loadViewerSetting('showGrid', true);
    const minimapSetting = loadViewerSetting('showMinimap', false);

    setShowGridState(gridSetting);
    setShowMinimapState(minimapSetting);
    setIsSettingsLoaded(true);
  }, []);

  // Focused viewer state
  const [focusedViewerId, setFocusedViewerId] = useState<string | null>(null);

  // Auto-save timer
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Get the ReactFlow utility functions
  const reactFlowInstance = useReactFlow();

  // Use custom hooks
  const {
    history,
    historyIndex,
    canUndo,
    canRedo,
    addToHistory,
    undo,
    redo,
    setHistory,
    setHistoryIndex,
  } = useWorkflowHistory();

  const {
    clipboard,
    setClipboard,
    copyNodes,
    cutNodes,
    pasteNodes,
  } = useClipboard();

  const { isFileDragging, setIsFileDragging } = useFileDrag();

  const {
    nodeMovementStart,
    isNodeDragging,
    setIsNodeDragging,
    trackNodeDragStart,
    resetNodeDragTracking,
  } = useNodeDragging();

  // Simplified save to history function
  const saveToHistory = useCallback(
    (nodes: Node[], edges: Edge[]) => {
      const newHistoryItem = { nodes, edges };

      // Remove any future history if we're not at the end
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newHistoryItem);

      // Keep history limited to 50 items
      if (newHistory.length > 50) {
        newHistory.shift();
      } else {
        setHistoryIndex(historyIndex + 1);
      }

      setHistory(newHistory);
    },
    [history, historyIndex, setHistory, setHistoryIndex]
  );

  // Workflow operations hook
  const {
    currentWorkflow,
    setCurrentWorkflow,
    isRunning,
    setIsRunning,
    executionResults,
    handleOpenFile,
    handleSaveWorkflow,
    handleLoadWorkflow,
    handleRunWorkflow,
  } = useWorkflowOperations(nodes, edges, setNodes, setEdges, saveToHistory);

  // Mobile placement hook
  const {
    selectedNodeType,
    placementMode,
    handleMobileNodeSelect,
    placeNode,
    setSelectedNodeType,
    setPlacementMode,
  } = useMobilePlacement(isMobile, setNodes, saveToHistory);

  // Helper function to find shortcut by ID
  const findShortcut = (id: string) => {
    return shortcuts.find(s => s.id === id)?.keys || "";
  };

  // Handle keyboard shortcuts
  useHotkeys(
    findShortcut("save-workflow") || "ctrl+s,cmd+s",
    (e) => {
      e.preventDefault();
      if (currentWorkflow) {
        const flowData = reactFlowInstance.toObject();
        handleSaveWorkflow(currentWorkflow.name, flowData);
      }
    },
    { enableOnFormTags: ["INPUT", "TEXTAREA"], enabled: SHORTCUTS_ENABLED }
  );

  useHotkeys(
    findShortcut("open-file") || "ctrl+o,cmd+o",
    (e) => {
      e.preventDefault();
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".ifc";
      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
          handleOpenFile(file);
        }
      };
      input.click();
    },
    { enableOnFormTags: ["INPUT", "TEXTAREA"], enabled: SHORTCUTS_ENABLED }
  );

  // Undo/Redo shortcuts
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

  useHotkeys(
    findShortcut("undo") || "ctrl+z,cmd+z",
    (e) => {
      if (!e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
    },
    { enableOnFormTags: false, enabled: SHORTCUTS_ENABLED }
  );

  useHotkeys(
    findShortcut("redo") || "ctrl+shift+z,cmd+shift+z,ctrl+y,cmd+y",
    (e) => {
      e.preventDefault();
      handleRedo();
    },
    { enableOnFormTags: false, enabled: SHORTCUTS_ENABLED }
  );

  // Select All
  const handleSelectAll = useCallback(() => {
    const updatedNodes = nodes.map((node) => ({
      ...node,
      selected: true,
    }));
    setNodes(updatedNodes);

    toast({
      title: "Select All",
      description: `Selected ${nodes.length} nodes`,
    });
  }, [nodes, setNodes, toast]);

  useHotkeys(
    findShortcut("select-all") || "ctrl+a,cmd+a",
    (e) => {
      e.preventDefault();
      handleSelectAll();
    },
    { enableOnFormTags: false, enabled: SHORTCUTS_ENABLED }
  );

  // Copy/Cut/Paste/Delete handlers
  const handleCopy = useCallback(() => {
    const selectedNodes = nodes.filter((node) => node.selected);
    const selectedNodeIds = selectedNodes.map((node) => node.id);
    const selectedEdges = edges.filter(
      (edge) =>
        selectedNodeIds.includes(edge.source) &&
        selectedNodeIds.includes(edge.target)
    );

    setClipboard({ nodes: selectedNodes, edges: selectedEdges });
    toast({
      title: "Copied",
      description: `${selectedNodes.length} node(s) and ${selectedEdges.length} connection(s) copied`,
    });
  }, [nodes, edges, setClipboard, toast]);

  const handleDelete = useCallback(() => {
    const selectedNodes = nodes.filter((node) => node.selected);
    if (selectedNodes.length === 0) return;

    saveToHistory(nodes, edges);

    const selectedNodeIds = selectedNodes.map((node) => node.id);
    const remainingNodes = nodes.filter((node) => !node.selected);
    const remainingEdges = edges.filter(
      (edge) =>
        !selectedNodeIds.includes(edge.source) &&
        !selectedNodeIds.includes(edge.target)
    );

    setNodes(remainingNodes);
    setEdges(remainingEdges);

    toast({
      title: "Deleted",
      description: `${selectedNodes.length} node(s) deleted`,
    });
  }, [nodes, edges, saveToHistory, setNodes, setEdges, toast]);

  const handleCut = useCallback(() => {
    handleCopy();
    handleDelete();
  }, [handleCopy, handleDelete]);

  const handlePaste = useCallback(() => {
    if (!clipboard || clipboard.nodes.length === 0) return;

    saveToHistory(nodes, edges);

    const idMapping = new Map<string, string>();
    const offset = { x: 50, y: 50 };

    const newNodes = clipboard.nodes.map((node) => {
      const newId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      idMapping.set(node.id, newId);

      return {
        ...node,
        id: newId,
        position: {
          x: node.position.x + offset.x,
          y: node.position.y + offset.y,
        },
        selected: true,
      };
    });

    const newEdges = clipboard.edges.map((edge) => ({
      ...edge,
      id: `${idMapping.get(edge.source)}-${idMapping.get(edge.target)}`,
      source: idMapping.get(edge.source) || edge.source,
      target: idMapping.get(edge.target) || edge.target,
    }));

    const updatedExistingNodes = nodes.map((node) => ({
      ...node,
      selected: false,
    }));

    setNodes([...updatedExistingNodes, ...newNodes]);
    setEdges([...edges, ...newEdges]);

    toast({
      title: "Pasted",
      description: `${newNodes.length} node(s) and ${newEdges.length} connection(s) pasted`,
    });
  }, [clipboard, nodes, edges, saveToHistory, setNodes, setEdges, toast]);

  // Copy/Cut/Paste/Delete shortcuts
  useHotkeys(
    findShortcut("copy") || "ctrl+c,cmd+c",
    (e) => {
      const activeElement = document.activeElement;
      const isInFormField = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        (activeElement as HTMLElement).isContentEditable
      );

      const selectedNodes = nodes.filter((node) => node.selected);

      if (!isInFormField && selectedNodes.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        handleCopy();
      }
    },
    { enableOnFormTags: false, enabled: SHORTCUTS_ENABLED }
  );

  useHotkeys(
    findShortcut("cut") || "ctrl+x,cmd+x",
    (e) => {
      const activeElement = document.activeElement;
      const isInFormField = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        (activeElement as HTMLElement).isContentEditable
      );

      const selectedNodes = nodes.filter((node) => node.selected);

      if (!isInFormField && selectedNodes.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        handleCut();
      }
    },
    { enableOnFormTags: false, enabled: SHORTCUTS_ENABLED }
  );

  useHotkeys(
    findShortcut("paste") || "ctrl+v,cmd+v",
    (e) => {
      const activeElement = document.activeElement;
      const isInFormField = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        (activeElement as HTMLElement).isContentEditable
      );

      if (!isInFormField && clipboard && clipboard.nodes.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        handlePaste();
      }
    },
    { enableOnFormTags: false, enabled: SHORTCUTS_ENABLED }
  );

  useHotkeys(
    "delete,backspace",
    (e) => {
      e.preventDefault();
      handleDelete();
    },
    { enableOnFormTags: false, enabled: SHORTCUTS_ENABLED }
  );

  useHotkeys(
    findShortcut("run-workflow") || "F5",
    (e) => {
      e.preventDefault();
      handleRunWorkflow();
    },
    { enableOnFormTags: false, enabled: SHORTCUTS_ENABLED }
  );

  // Updated node changes handler with history
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);

      const isPositionChange = changes.some(
        (change) => change.type === "position"
      );

      const isDragEnd = changes.some(
        (change) =>
          change.type === "position" &&
          change.dragging === false &&
          isNodeDragging
      );

      if (isPositionChange && !isNodeDragging) {
        const isDragStart = changes.some(
          (change) => change.type === "position" && change.dragging === true
        );
        if (isDragStart) {
          setIsNodeDragging(true);
        }
      }

      if (isDragEnd) {
        setIsNodeDragging(false);
        setTimeout(() => {
          saveToHistory(nodes, edges);
        }, 50);
      }

      const isSelectionChange = changes.every(
        (change) => change.type === "select"
      );

      if (!isSelectionChange && !isPositionChange) {
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
        }
        autoSaveTimerRef.current = setTimeout(() => {
          saveToHistory(nodes, edges);
        }, 1000);
      }
    },
    [nodes, edges, onNodesChange, saveToHistory, isNodeDragging, setIsNodeDragging]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      saveToHistory(nodes, edges);

      const newEdge = {
        ...params,
        id: `${params.source}-${params.target}`,
        type: "default",
        style: { stroke: "#888", strokeWidth: 2 },
        animated: false,
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [nodes, edges, saveToHistory, setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");

      if (typeof type === "undefined" || !type) {
        return;
      }

      if (!reactFlowBounds) {
        return;
      }

      const cursorPosition = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const position = {
        x: cursorPosition.x,
        y: cursorPosition.y,
      };

      saveToHistory(nodes, edges);

      const newNode = createNode(type, position);

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, nodes, edges, saveToHistory, setNodes]
  );

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const cmdOrCtrl = isMac ? (event as any).metaKey : (event as any).ctrlKey;
      if (cmdOrCtrl) {
        return;
      }
      setSelectedNode(node);
    },
    []
  );

  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    setEditingNode(node);
  }, []);

  // Helper function to get current flow object
  const getFlowObject = useCallback(() => {
    return reactFlowInstance.toObject();
  }, [reactFlowInstance]);

  // File drag and drop handlers
  const handleFileDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer?.types.includes("Files")) {
      setIsFileDragging(true);
    }
  }, [setIsFileDragging]);

  const handleFileDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    if (e.target === reactFlowWrapper.current) {
      setIsFileDragging(false);
    }
  }, [setIsFileDragging]);

  const handleFileDrop = useCallback(
    async (e: DragEvent) => {
      e.preventDefault();
      setIsFileDragging(false);

      const files = Array.from(e.dataTransfer?.files || []);
      const ifcFiles = files.filter((file) =>
        file.name.toLowerCase().endsWith(".ifc")
      );

      if (ifcFiles.length > 0) {
        for (const file of ifcFiles) {
          await handleOpenFile(file);
        }
      }
    },
    [handleOpenFile, setIsFileDragging]
  );

  // Set up drag and drop listeners
  useEffect(() => {
    const wrapper = reactFlowWrapper.current;
    if (!wrapper) return;

    wrapper.addEventListener("dragenter", handleFileDragEnter);
    wrapper.addEventListener("dragleave", handleFileDragLeave);
    wrapper.addEventListener("drop", handleFileDrop);

    return () => {
      wrapper.removeEventListener("dragenter", handleFileDragEnter);
      wrapper.removeEventListener("dragleave", handleFileDragLeave);
      wrapper.removeEventListener("drop", handleFileDrop);
    };
  }, [handleFileDragEnter, handleFileDragLeave, handleFileDrop]);

  // Listen for export completion events
  useEffect(() => {
    const handleExportComplete = async (event: CustomEvent) => {
      const { model, exportFileName, originalFileName } = event.detail;

      try {
        const originalFile = await (await fetch(originalFileName)).blob();
        if (!originalFile) {
          toast({
            title: "Export Error",
            description: "Original IFC file not found. Please reload the file and try again.",
            variant: "destructive",
          });
          return;
        }

        const arrayBuffer = await originalFile.arrayBuffer();
        const worker = new Worker('/ifcWorker.js');

        worker.onmessage = (e) => {
          if (e.data.type === 'ifcExported') {
            const blob = new Blob([e.data.data], { type: 'application/x-step' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = e.data.fileName || exportFileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast({
              title: "Export Successful",
              description: `IFC file exported as ${e.data.fileName || exportFileName}`,
            });

            worker.terminate();
          } else if (e.data.type === 'error') {
            toast({
              title: "Export Error",
              description: e.data.message || "Failed to export IFC file",
              variant: "destructive",
            });
            worker.terminate();
          }
        };

        worker.postMessage({
          action: 'exportIfc',
          model: model,
          fileName: exportFileName,
          arrayBuffer: arrayBuffer,
          messageId: Date.now().toString()
        }, [arrayBuffer]);

      } catch (error) {
        console.error("Error exporting IFC:", error);
        toast({
          title: "Export Error",
          description: error instanceof Error ? error.message : "Failed to export IFC file",
          variant: "destructive",
        });
      }
    };

    const eventListenerWrapper = (event: Event) => {
      handleExportComplete(event as CustomEvent);
    };

    window.addEventListener("ifc:export", eventListenerWrapper);

    return () => {
      window.removeEventListener("ifc:export", eventListenerWrapper);
    };
  }, [toast]);

  // Handle sidebar toggle
  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen(!sidebarOpen);

    if ('vibrate' in navigator && isMobile) {
      navigator.vibrate(50);
    }
  }, [sidebarOpen, isMobile]);

  const handleBackdropClick = useCallback(() => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [isMobile, sidebarOpen]);

  // Handle escape key to close sidebar on mobile
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isMobile, sidebarOpen]);

  // Handle canvas click/tap for node placement
  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    if (!isMobile || !placementMode || !selectedNodeType) return;

    const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
    if (!reactFlowBounds) return;

    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });

    placeNode(position, nodes, edges, () => {
      if (isMobile) {
        setSidebarOpen(false);
      }
    });
  }, [isMobile, placementMode, selectedNodeType, reactFlowInstance, nodes, edges, placeNode]);

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Unified Sidebar - Mobile & Desktop */}
      <div className={`
        ${isMobile
          ? `fixed inset-0 z-50 ${sidebarOpen ? 'pointer-events-auto' : 'pointer-events-none'}`
          : 'relative'
        }
      `}>
        {/* Mobile backdrop */}
        {isMobile && (
          <div
            className={`
              absolute inset-0 bg-black/50 transition-opacity duration-300 ease-in-out
              ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
            `}
            onClick={handleBackdropClick}
            aria-label="Close sidebar"
          />
        )}

        {/* Sidebar container */}
        <div className={`
          ${isMobile
            ? `absolute left-0 top-0 h-full w-80 transform transition-transform duration-300 ease-in-out
               ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
               shadow-xl`
            : 'relative h-full'
          }
          bg-background border-r z-60
        `}>
          <Sidebar
            onLoadWorkflow={handleLoadWorkflow}
            getFlowObject={getFlowObject}
            isMobile={isMobile}
            sidebarOpen={sidebarOpen}
            onCloseSidebar={() => setSidebarOpen(false)}
            onNodeSelect={handleMobileNodeSelect}
            selectedNodeType={selectedNodeType}
            placementMode={placementMode}
          />
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0">
        <AppMenubar
          onOpenFile={handleOpenFile}
          onSaveWorkflow={(wf: Workflow) =>
            handleSaveWorkflow(wf.name, wf.flowData)
          }
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
          onToggleSidebar={handleSidebarToggle}
          sidebarOpen={sidebarOpen}
        />
        <div className={`flex-1 h-full relative`} ref={reactFlowWrapper}>
          <FileDropOverlay isVisible={isFileDragging} />

          {/* Mobile placement mode overlay */}
          <MobilePlacementOverlay
            isVisible={isMobile && placementMode && selectedNodeType !== null}
            nodeLabel={selectedNodeType ? getNodeLabel(selectedNodeType) : ""}
          />

          <ViewerFocusProvider
            focusedViewerId={focusedViewerId}
            setFocusedViewerId={setFocusedViewerId}
          >
            <div className="flex-1 h-full w-full">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={handleNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeClick={onNodeClick}
                onNodeDoubleClick={onNodeDoubleClick}
                autoPanOnConnect={false}
                autoPanOnNodeDrag={false}
                onPaneClick={(event) => {
                  if (isMobile && placementMode && selectedNodeType) {
                    handleCanvasClick(event);
                    return;
                  }

                  setEditingNode(null);
                  if (focusedViewerId) {
                    setFocusedViewerId(null);
                  }

                  if (isMobile && sidebarOpen && !placementMode) {
                    setSidebarOpen(false);
                  }
                }}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                snapToGrid={isSettingsLoaded ? showGrid : false}
                snapGrid={snapGrid}
                minZoom={0.1}
                maxZoom={2}
                proOptions={proOptions}
                style={isMobile && placementMode ? placementStyle : defaultStyle}
                multiSelectionKeyCode="Meta"
                selectionOnDrag={true}
                selectNodesOnDrag={false}
                selectionMode={"partial" as SelectionMode}
                nodesFocusable={true}
                edgesFocusable={true}
                panOnDrag={!focusedViewerId && !(isMobile && placementMode)}
                zoomOnScroll={!focusedViewerId && !(isMobile && placementMode)}
                zoomOnPinch={!focusedViewerId && !(isMobile && placementMode)}
                zoomOnDoubleClick={!focusedViewerId && !(isMobile && placementMode)}
                elementsSelectable={!(isMobile && placementMode)}
                nodesConnectable={!focusedViewerId && !(isMobile && placementMode)}
                nodesDraggable={!focusedViewerId && !(isMobile && placementMode)}
              >
                <Controls />
                {isSettingsLoaded && showGrid && <Background color="#aaa" gap={16} />}
                {isSettingsLoaded && showMinimap && <MiniMap />}
                <Panel position="bottom-right">
                  <FooterPill currentWorkflow={currentWorkflow} />
                </Panel>
              </ReactFlow>
            </div>
          </ViewerFocusProvider>
        </div>
      </div>
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

// Export default component
export default function Home() {
  return (
    <ReactFlowProvider>
      <FlowWithProvider />
    </ReactFlowProvider>
  );
}
