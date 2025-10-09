"use client";

import { useState, useCallback } from "react";
import type { Node, Edge } from "reactflow";
import { useToast } from "@/src/hooks/use-toast";
import { createNode } from "@/src/nodes/node-factory-registry";
import { getNodeLabel } from "@/src/lib/node-factory";

export function useMobilePlacement(
  isMobile: boolean,
  setNodes: (fn: (nodes: Node[]) => Node[]) => void,
  saveToHistory: (nodes: Node[], edges: Edge[]) => void
) {
  const [selectedNodeType, setSelectedNodeType] = useState<string | null>(null);
  const [placementMode, setPlacementMode] = useState(false);
  const { toast } = useToast();

  const handleMobileNodeSelect = useCallback((nodeType: string) => {
    if (selectedNodeType === nodeType) {
      // Clicking the same node cancels placement mode
      setSelectedNodeType(null);
      setPlacementMode(false);
    } else {
      // Select new node type and enter placement mode
      setSelectedNodeType(nodeType);
      setPlacementMode(true);
    }
  }, [selectedNodeType]);

  const placeNode = useCallback((
    position: { x: number; y: number },
    nodes: Node[],
    edges: Edge[],
    onComplete?: () => void
  ) => {
    if (!placementMode || !selectedNodeType) return;

    // Save current state to history before adding new node
    saveToHistory(nodes, edges);

    const newNode = createNode(selectedNodeType, position);

    setNodes((nds) => nds.concat(newNode));

    // Exit placement mode after placing node
    setSelectedNodeType(null);
    setPlacementMode(false);

    // Call completion callback (e.g., close sidebar on mobile)
    if (onComplete) {
      onComplete();
    }

    toast({
      title: "Node added",
      description: `${getNodeLabel(selectedNodeType)} placed successfully`,
    });
  }, [placementMode, selectedNodeType, saveToHistory, setNodes, toast]);

  return {
    selectedNodeType,
    placementMode,
    handleMobileNodeSelect,
    placeNode,
    setSelectedNodeType,
    setPlacementMode,
  };
}

