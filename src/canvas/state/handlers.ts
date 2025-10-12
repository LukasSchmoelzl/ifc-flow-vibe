"use client";

import type { Node, Edge, Connection, ReactFlowInstance } from "reactflow";
import { useCanvasStore } from "./store";

// Flow event handlers
export const flowHandlers = {
  // Handle node changes (position, selection, etc.)
  onNodesChange: (changes: any) => {
    const { nodes, setNodes } = useCanvasStore.getState();
    
    // Apply changes using React Flow's applyNodeChanges
    const updatedNodes = changes.reduce((acc: Node[], change: any) => {
      switch (change.type) {
        case "position":
          return acc.map(n => 
            n.id === change.id ? { ...n, position: change.position } : n
          );
        case "dimensions":
          return acc.map(n =>
            n.id === change.id ? { ...n, ...change.dimensions } : n
          );
        case "select":
          return acc.map(n =>
            n.id === change.id ? { ...n, selected: change.selected } : n
          );
        case "remove":
          return acc.filter(n => n.id !== change.id);
        default:
          return acc;
      }
    }, nodes);

    setNodes(updatedNodes);
  },

  // Handle edge changes
  onEdgesChange: (changes: any) => {
    const { edges, setEdges } = useCanvasStore.getState();
    
    const updatedEdges = changes.reduce((acc: Edge[], change: any) => {
      switch (change.type) {
        case "select":
          return acc.map(e =>
            e.id === change.id ? { ...e, selected: change.selected } : e
          );
        case "remove":
          return acc.filter(e => e.id !== change.id);
        default:
          return acc;
      }
    }, edges);

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

  // Handle node double click
  onNodeDoubleClick: (event: React.MouseEvent, node: Node) => {
    const { setEditingNode } = useCanvasStore.getState();
    setEditingNode(node);
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
      setEditingNode,
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

    // Clear selections
    setEditingNode(null);
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

