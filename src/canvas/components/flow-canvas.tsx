"use client";

import ReactFlow, {
  Controls,
  Background,
  Panel,
  type SelectionMode,
} from "reactflow";
import { FragmentsViewer } from "@/src/viewer/fragments-viewer";
import { FooterPill } from "@/src/canvas/components/flow/FooterPill";
import { FileDropOverlay } from "@/src/canvas/components/flow/FileDropOverlay";
import { MobilePlacementOverlay } from "@/src/canvas/components/flow/MobilePlacementOverlay";
import { ViewerFocusProvider } from "@/src/viewer/viewer-focus-context";
import { nodeTypes } from "@/src/canvas/nodes/nodes";
import { getNodeLabel } from "@/src/canvas/nodes/node-registry";
import { useCanvas } from "@/src/canvas/canvas-context";

const EDGE_TYPES = {} as const;
const SNAP_GRID: [number, number] = [15, 15];
const PRO_OPTIONS = { hideAttribution: true };
const DEFAULT_STYLE = { cursor: "default" };
const PLACEMENT_STYLE = { cursor: "crosshair" };

export function FlowCanvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDrop,
    onDragOver,
    onNodeClick,
    onNodeDoubleClick,
    onCanvasClick,
    isFileDragging,
    isMobile,
    placementMode,
    selectedNodeType,
    showGrid,
    isSettingsLoaded,
    focusedViewerId,
    setFocusedViewerId,
    currentWorkflow,
  } = useCanvas();

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
            onPaneClick={onCanvasClick}
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
