"use client";

import { useCallback, useRef } from "react";
import { addEdge, type Connection, type NodeChange } from "reactflow";
import type { Node, Edge } from "reactflow";
import { createNode } from "@/src/nodes/node-factory-registry";

export function useFlowHandlers(
  nodes: Node[],
  edges: Edge[],
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void,
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void,
  onNodesChange: (changes: NodeChange[]) => void,
  reactFlowInstance: any,
  reactFlowWrapper: React.RefObject<HTMLDivElement>,
  isNodeDragging: boolean,
  setIsNodeDragging: (value: boolean) => void,
  saveToHistory: (nodes: Node[], edges: Edge[]) => void,
  setSelectedNode: (node: Node | null) => void,
  setEditingNode: (node: Node | null) => void
) {
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

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
        // Note: Consider removing setTimeout per ls_rules.md
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
        // Note: Consider removing setTimeout per ls_rules.md
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
    [reactFlowInstance, nodes, edges, saveToHistory, setNodes, reactFlowWrapper]
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
    [setSelectedNode]
  );

  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    setEditingNode(node);
  }, [setEditingNode]);

  const getFlowObject = useCallback(() => {
    return reactFlowInstance.toObject();
  }, [reactFlowInstance]);

  return {
    handleNodesChange,
    onConnect,
    onDragOver,
    onDrop,
    onNodeClick,
    onNodeDoubleClick,
    getFlowObject,
  };
}

