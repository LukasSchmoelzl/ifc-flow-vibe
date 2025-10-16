"use client";

import type { Node, Edge } from "reactflow";
import { useCanvasStore } from "./store";
import { generateNodeId } from "@/src/canvas/nodes/auto-registry";

type Toast = {
  title: string;
  description: string;
  variant?: "default" | "destructive";
};

type ToastFn = (toast: Toast) => void;

export function selectAll(): void {
  const { nodes, setNodes } = useCanvasStore.getState();
  setNodes(nodes.map(node => ({ ...node, selected: true })));
}

export function copy(toast: ToastFn): void {
  const { nodes, edges, setClipboard } = useCanvasStore.getState();
  const selectedNodes = nodes.filter(node => node.selected);
  
  if (selectedNodes.length === 0) {
    throw new Error("Select nodes to copy first");
  }

  const nodeIds = selectedNodes.map(node => node.id);
  const relevantEdges = edges.filter(edge => 
    nodeIds.includes(edge.source) && nodeIds.includes(edge.target)
  );

  setClipboard({ nodes: selectedNodes, edges: relevantEdges });
  
  toast({
    title: "Copied",
    description: `Copied ${selectedNodes.length} nodes to clipboard`,
  });
}

export function cut(toast: ToastFn): void {
  const { nodes, edges, setNodes, setEdges, setClipboard, addToHistory } = useCanvasStore.getState();
  const selectedNodes = nodes.filter(node => node.selected);
  
  if (selectedNodes.length === 0) {
    throw new Error("Select nodes to cut first");
  }

  const nodeIds = selectedNodes.map(node => node.id);
  const relevantEdges = edges.filter(edge => 
    nodeIds.includes(edge.source) && nodeIds.includes(edge.target)
  );

  setClipboard({ nodes: selectedNodes, edges: relevantEdges });

  const newNodes = nodes.filter(node => !node.selected);
  const newEdges = edges.filter(edge => 
    !nodeIds.includes(edge.source) && !nodeIds.includes(edge.target)
  );

  setNodes(newNodes);
  setEdges(newEdges);
  addToHistory(newNodes, newEdges);
  
  toast({
    title: "Cut",
    description: `Cut ${selectedNodes.length} nodes to clipboard`,
  });
}

export function paste(toast: ToastFn): void {
  const { clipboard, nodes, edges, setNodes, setEdges, addToHistory } = useCanvasStore.getState();
  
  if (!clipboard || clipboard.nodes.length === 0) {
    throw new Error("Copy or cut nodes first");
  }

  const idMap: Record<string, string> = {};
  const newNodes = clipboard.nodes.map(node => {
    const newId = generateNodeId();
    idMap[node.id] = newId;

    return {
      ...node,
      id: newId,
      position: {
        x: node.position.x + 50,
        y: node.position.y + 50,
      },
      selected: true,
    };
  });

  const newEdges = clipboard.edges.map(edge => ({
    ...edge,
    id: `e-${generateNodeId()}`,
    source: idMap[edge.source],
    target: idMap[edge.target],
  }));

  const deselectedNodes = nodes.map(n => ({ ...n, selected: false }));
  const updatedNodes = [...deselectedNodes, ...newNodes];
  const updatedEdges = [...edges, ...newEdges];

  setNodes(updatedNodes);
  setEdges(updatedEdges);
  addToHistory(updatedNodes, updatedEdges);
  
  toast({
    title: "Pasted",
    description: `Pasted ${newNodes.length} nodes from clipboard`,
  });
}

export function deleteNodes(toast: ToastFn): void {
  const { nodes, edges, setNodes, setEdges, addToHistory } = useCanvasStore.getState();
  const selectedNodes = nodes.filter(node => node.selected);
  
  if (selectedNodes.length === 0) {
    throw new Error("Select nodes to delete first");
  }

  const nodeIds = selectedNodes.map(node => node.id);
  const newNodes = nodes.filter(node => !node.selected);
  const newEdges = edges.filter(edge => 
    !nodeIds.includes(edge.source) && !nodeIds.includes(edge.target)
  );

  setNodes(newNodes);
  setEdges(newEdges);
  addToHistory(newNodes, newEdges);
  
  toast({
    title: "Deleted",
    description: `Deleted ${selectedNodes.length} nodes`,
  });
}

