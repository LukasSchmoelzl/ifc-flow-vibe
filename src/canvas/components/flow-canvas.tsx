"use client";

import { useCallback } from "react";
import ReactFlow, {
  Controls,
  Background,
  Panel,
  MiniMap,
  type Edge,
  type Node,
  type SelectionMode,
} from "reactflow";
import { FragmentsViewer } from "@/src/viewer/fragments-viewer";
import { FooterPill } from "@/src/canvas/components/flow/FooterPill";
import { FileDropOverlay } from "@/src/canvas/components/flow/FileDropOverlay";
import { MobilePlacementOverlay } from "@/src/canvas/components/flow/MobilePlacementOverlay";
import { ViewerFocusProvider } from "@/src/viewer/viewer-focus-context";
import { nodeTypes } from "@/src/canvas/nodes/nodes";
import { getNodeLabel } from "@/src/canvas/node-factory";
import type { Workflow } from "@/src/canvas/workflow-storage";

const edgeTypes = {} as const;
const snapGrid: [number, number] = [15, 15];
const proOptions = { hideAttribution: true };
const defaultStyle = { cursor: "default" };
const placementStyle = { cursor: "crosshair" };

interface FlowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: any) => void;
  onDrop: (event: React.DragEvent) => void;
  onDragOver: (event: React.DragEvent) => void;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  onNodeDoubleClick: (event: React.MouseEvent, node: Node) => void;
  onPaneClick: (event: React.MouseEvent) => void;
  isFileDragging: boolean;
  isMobile: boolean;
  placementMode: boolean;
  selectedNodeType: string | null;
  showGrid: boolean;
  showMinimap: boolean;
  isSettingsLoaded: boolean;
  focusedViewerId: string | null;
  setFocusedViewerId: (id: string | null) => void;
  currentWorkflow: Workflow | null;
}

export function FlowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onDrop,
  onDragOver,
  onNodeClick,
  onNodeDoubleClick,
  onPaneClick,
  isFileDragging,
  isMobile,
  placementMode,
  selectedNodeType,
  showGrid,
  showMinimap,
  isSettingsLoaded,
  focusedViewerId,
  setFocusedViewerId,
  currentWorkflow,
}: FlowCanvasProps) {
  return (
    <>
      <FileDropOverlay isVisible={isFileDragging} />

      <MobilePlacementOverlay
        isVisible={isMobile && placementMode && selectedNodeType !== null}
        nodeLabel={selectedNodeType ? getNodeLabel(selectedNodeType) : ""}
      />

      <ViewerFocusProvider
        focusedViewerId={focusedViewerId}
        setFocusedViewerId={setFocusedViewerId}
      >
        {/* React Flow Canvas - Left Side (50%) */}
        <div className="w-full md:w-1/2 h-full relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onNodeDoubleClick={onNodeDoubleClick}
            autoPanOnConnect={false}
            autoPanOnNodeDrag={false}
            onPaneClick={onPaneClick}
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

        {/* Fragments 3D Viewer - Right Side (50%) */}
        <div className="hidden md:block md:w-1/2 h-full border-l border-slate-200 dark:border-slate-700">
          <FragmentsViewer className="w-full h-full" />
        </div>
      </ViewerFocusProvider>
    </>
  );
}

