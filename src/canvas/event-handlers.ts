"use client";

import type { Node, Connection, ReactFlowInstance, NodeChange, EdgeChange } from "reactflow";
import { applyNodeChanges, applyEdgeChanges } from "reactflow";
import { useCanvasStore } from "./store";
import { useUIStore } from "@/src/shared/ui-store";
import { createNode } from "@/src/canvas/nodes/auto-registry";

export function onNodesChange(changes: NodeChange[]): void {
  const { nodes, setNodes } = useCanvasStore.getState();
  const updatedNodes = applyNodeChanges(changes, nodes);
  setNodes(updatedNodes);
}

export function onEdgesChange(changes: EdgeChange[]): void {
  const { edges, setEdges } = useCanvasStore.getState();
  const updatedEdges = applyEdgeChanges(changes, edges);
  setEdges(updatedEdges);
}

export function onConnect(connection: Connection): void {
  const { edges, setEdges, addToHistory, nodes } = useCanvasStore.getState();
  
  if (!connection.source || !connection.target) {
    throw new Error("Invalid connection: source or target missing");
  }
  
  const newEdge = {
    id: `e-${connection.source}-${connection.target}`,
    source: connection.source,
    target: connection.target,
    sourceHandle: connection.sourceHandle || undefined,
    targetHandle: connection.targetHandle || undefined,
  };

  const updatedEdges = [...edges, newEdge];
  setEdges(updatedEdges);
  addToHistory(nodes, updatedEdges);
}

export function onDrop(event: React.DragEvent, reactFlowInstance: ReactFlowInstance, reactFlowWrapper: HTMLDivElement): void {
  event.preventDefault();

  const nodeType = event.dataTransfer.getData("application/reactflow");
  if (!nodeType) return;

  const { nodes, setNodes, addToHistory, edges } = useCanvasStore.getState();
  const reactFlowBounds = reactFlowWrapper.getBoundingClientRect();
  const position = reactFlowInstance.screenToFlowPosition({
    x: event.clientX - reactFlowBounds.left,
    y: event.clientY - reactFlowBounds.top,
  });

  const newNode = createNode(nodeType, position);
  const updatedNodes = [...nodes, newNode];
  setNodes(updatedNodes);
  addToHistory(updatedNodes, edges);
}

export function onDragOver(event: React.DragEvent): void {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
}

export function onNodeClick(event: React.MouseEvent, node: Node): void {
  const { setSelectedNode } = useCanvasStore.getState();
  setSelectedNode(node);
}

export function onNodeDoubleClick(event: React.MouseEvent, node: Node): void {
  // Node double-click functionality removed - no properties to edit
}

export function onPaneClick(event: React.MouseEvent, reactFlowInstance: ReactFlowInstance, reactFlowWrapper: HTMLDivElement): void {
  const isMobile = useUIStore.getState().isMobile;
  const { 
    placementMode, 
    selectedNodeType, 
    nodes, 
    edges,
    setNodes,
    setFocusedViewerId,
    focusedViewerId,
    addToHistory,
  } = useCanvasStore.getState();

  // Mobile node placement
  if (isMobile && placementMode && selectedNodeType) {
    const reactFlowBounds = reactFlowWrapper.getBoundingClientRect();
    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });

    const newNode = createNode(selectedNodeType, position);
    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    addToHistory(updatedNodes, edges);
    return;
  }

  // Clear viewer focus
  if (focusedViewerId) {
    setFocusedViewerId(null);
  }
}

