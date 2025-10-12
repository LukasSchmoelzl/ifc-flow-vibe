"use client";

import type { Node, Edge, Connection, ReactFlowInstance, NodeChange, EdgeChange } from "reactflow";
import { applyNodeChanges, applyEdgeChanges } from "reactflow";
import { useCanvasStore } from "./store";

// Flow event handlers
export const flowHandlers = {
  // Handle node changes (position, selection, etc.) - Use React Flow's applyNodeChanges
  onNodesChange: (changes: NodeChange[]) => {
    const { nodes, setNodes } = useCanvasStore.getState();
    const updatedNodes = applyNodeChanges(changes, nodes);
    setNodes(updatedNodes);
  },

  // Handle edge changes - Use React Flow's applyEdgeChanges
  onEdgesChange: (changes: EdgeChange[]) => {
    const { edges, setEdges } = useCanvasStore.getState();
    const updatedEdges = applyEdgeChanges(changes, edges);
    setEdges(updatedEdges);
  },

  // Handle new connections
  onConnect: (connection: Connection) => {
    const { edges, setEdges, addToHistory, nodes } = useCanvasStore.getState();
    
    const newEdge: Edge = {
      id: `e-${connection.source}-${connection.target}`,
      source: connection.source!,
      target: connection.target!,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
    };

    const updatedEdges = [...edges, newEdge];
    setEdges(updatedEdges);
    addToHistory(nodes, updatedEdges);
  },

  // Handle node drop from sidebar
  onDrop: (event: React.DragEvent, reactFlowInstance: ReactFlowInstance, reactFlowWrapper: HTMLDivElement) => {
    event.preventDefault();

    const nodeType = event.dataTransfer.getData("application/reactflow");
    if (!nodeType) return;

    const { nodes, setNodes, addToHistory, edges } = useCanvasStore.getState();
    const reactFlowBounds = reactFlowWrapper.getBoundingClientRect();
    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });

    const newNode: Node = {
      id: `${nodeType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: nodeType,
      position,
      data: { label: `New ${nodeType}` },
    };

    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    addToHistory(updatedNodes, edges);
  },

  // Handle drag over
  onDragOver: (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  },

  // Handle node click
  onNodeClick: (event: React.MouseEvent, node: Node) => {
    const { setSelectedNode } = useCanvasStore.getState();
    setSelectedNode(node);
  },

  // Handle node double click (disabled - no properties dialog)
  onNodeDoubleClick: (event: React.MouseEvent, node: Node) => {
    // Node double-click functionality removed - no properties to edit
  },

  // Handle pane/canvas click
  onPaneClick: (event: React.MouseEvent, reactFlowInstance: ReactFlowInstance, reactFlowWrapper: HTMLDivElement) => {
    const { 
      isMobile, 
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

      const newNode: Node = {
        id: `${selectedNodeType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: selectedNodeType,
        position,
        data: { label: `New ${selectedNodeType}` },
      };

      const updatedNodes = [...nodes, newNode];
      setNodes(updatedNodes);
      addToHistory(updatedNodes, edges);
      return;
    }

    // Clear viewer focus
    if (focusedViewerId) {
      setFocusedViewerId(null);
    }
  },

  // Get flow object for saving
  getFlowObject: (reactFlowInstance: ReactFlowInstance | null) => {
    if (!reactFlowInstance) {
      const { nodes, edges } = useCanvasStore.getState();
      return { nodes, edges };
    }
    return reactFlowInstance.toObject();
  },
};

