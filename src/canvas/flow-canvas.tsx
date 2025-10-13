"use client";

import React, { useRef } from "react";
import ReactFlow, {
  Controls,
  Background,
  Panel,
  useReactFlow,
  type SelectionMode,
} from "reactflow";
import { FragmentsViewer } from "@/src/viewer/fragments-viewer";
import { FooterPill } from "@/src/overlays/footer-pill";
import { getNodeLabel } from "./nodes/auto-registry";
import { useCanvasStore } from "./store";
import { useUIStore } from "@/src/shared/ui-store";
import { flowHandlers } from "./handlers";

// React Flow constants - defined outside component to prevent recreating on every render
import { nodeTypes } from "./nodes/auto-registry";
const EDGE_TYPES = {} as const;
const SNAP_GRID: [number, number] = [15, 15];
const PRO_OPTIONS = { hideAttribution: true };
const DEFAULT_STYLE = { cursor: "default" };
const PLACEMENT_STYLE = { cursor: "crosshair" };

export function FlowCanvas() {
  const isMobile = useUIStore(state => state.isMobile);
  const reactFlowInstance = useReactFlow();
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  // Zustand store - atomic selections
  const nodes = useCanvasStore(state => state.nodes);
  const edges = useCanvasStore(state => state.edges);
  const placementMode = useCanvasStore(state => state.placementMode);
  const showGrid = useCanvasStore(state => state.showGrid);
  const isSettingsLoaded = useCanvasStore(state => state.isSettingsLoaded);
  const focusedViewerId = useCanvasStore(state => state.focusedViewerId);
  const setReactFlowInstance = useCanvasStore(state => state.setReactFlowInstance);
  const setReactFlowWrapper = useCanvasStore(state => state.setReactFlowWrapper);
  
  // Set ReactFlow instance and wrapper in store (useEffect to avoid setState during render)
  React.useEffect(() => {
    if (reactFlowInstance && !useCanvasStore.getState().reactFlowInstance) {
      setReactFlowInstance(reactFlowInstance);
    }
  }, [reactFlowInstance, setReactFlowInstance]);
  
  React.useEffect(() => {
    if (wrapperRef.current && !useCanvasStore.getState().reactFlowWrapper) {
      setReactFlowWrapper(wrapperRef);
    }
  }, [setReactFlowWrapper]);
  
  // Flow handlers
  const handleNodesChange = (changes: any) => flowHandlers.onNodesChange(changes);
  const handleEdgesChange = (changes: any) => flowHandlers.onEdgesChange(changes);
  const handleConnect = (connection: any) => flowHandlers.onConnect(connection);
  const handleDrop = (event: React.DragEvent) => {
    if (wrapperRef.current) {
      flowHandlers.onDrop(event, reactFlowInstance, wrapperRef.current);
    }
  };
  const handleDragOver = (event: React.DragEvent) => flowHandlers.onDragOver(event);
  const handleNodeClick = (event: React.MouseEvent, node: any) => flowHandlers.onNodeClick(event, node);
  const handleNodeDoubleClick = (event: React.MouseEvent, node: any) => flowHandlers.onNodeDoubleClick(event, node);
  const handlePaneClick = (event: React.MouseEvent) => {
    if (wrapperRef.current) {
      flowHandlers.onPaneClick(event, reactFlowInstance, wrapperRef.current);
    }
  };

  return (
    <>
      {/* React Flow Canvas - Left Side (50%) */}
      <div ref={wrapperRef} className="w-full md:w-1/2 h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={handleConnect}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onNodeClick={handleNodeClick}
          onNodeDoubleClick={handleNodeDoubleClick}
          autoPanOnConnect={false}
          autoPanOnNodeDrag={false}
          onPaneClick={handlePaneClick}
          nodeTypes={nodeTypes}
          edgeTypes={EDGE_TYPES}
          snapToGrid={isSettingsLoaded ? showGrid : false}
          snapGrid={SNAP_GRID}
          minZoom={0.1}
          maxZoom={2}
          proOptions={PRO_OPTIONS}
          style={isMobile && placementMode ? PLACEMENT_STYLE : DEFAULT_STYLE}
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
          <Panel position="bottom-left">
            <FooterPill />
          </Panel>
        </ReactFlow>
      </div>

      {/* Fragments 3D Viewer - Right Side (50%) */}
      <div className="hidden md:block md:w-1/2 h-full border-l border-slate-200 dark:border-slate-700">
        <FragmentsViewer className="w-full h-full" />
      </div>
    </>
  );
}
