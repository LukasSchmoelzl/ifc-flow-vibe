"use client";

import { useCallback } from "react";
import type { Node, Edge } from "reactflow";
import { useToast } from "@/src/hooks/use-toast";

export function useNodeOperations(
  nodes: Node[],
  edges: Edge[],
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void,
  setEdges: (edges: Edge[]) => void,
  clipboard: { nodes: Node[]; edges: Edge[] } | null,
  setClipboard: (data: { nodes: Node[]; edges: Edge[] }) => void,
  saveToHistory: (nodes: Node[], edges: Edge[]) => void
) {
  const { toast } = useToast();

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

  return {
    handleSelectAll,
    handleCopy,
    handleCut,
    handlePaste,
    handleDelete,
  };
}

