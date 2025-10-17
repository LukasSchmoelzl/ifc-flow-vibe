"use client";

import type { Node, Edge } from "reactflow";
import { useCanvasStore } from "./store";
import { WorkflowExecutor } from "./executor";
import { createFileManagerNodeFromFile } from "@/src/canvas/nodes/auto-registry";
import type { Workflow } from "./storage";
import { workflowStorage } from "./storage";

type Toast = {
  title: string;
  description: string;
  variant?: "default" | "destructive";
};

type ToastFn = (toast: Toast) => void;

export async function openFile(file: File, toast: ToastFn): Promise<void> {
  const { nodes, edges, setNodes, addToHistory } = useCanvasStore.getState();
  
  addToHistory(nodes, edges);
  const position = { x: 100, y: 100 };
  const newNode = createFileManagerNodeFromFile(position, file);
  setNodes([...nodes, newNode]);
  
  toast({
    title: "IFC Node Created",
    description: `Created IFC node for ${file.name}`,
  });
}

export async function saveWorkflow(name: string, flowData: { nodes: Node[]; edges: Edge[] }, toast: ToastFn): Promise<void> {
  const { currentWorkflow } = useCanvasStore.getState();
  
  if (!currentWorkflow) {
    throw new Error("No workflow to save");
  }
  
  const workflow: Workflow = {
    id: currentWorkflow.id,
    name,
    description: currentWorkflow.description,
    createdAt: currentWorkflow.createdAt,
    updatedAt: new Date().toISOString(),
    tags: currentWorkflow.tags,
    thumbnail: currentWorkflow.thumbnail,
    flowData,
  };
  
  const savedWorkflow = workflowStorage.saveWorkflow(workflow);
  useCanvasStore.getState().setCurrentWorkflow(savedWorkflow);
  
  toast({
    title: "Workflow Saved",
    description: `Workflow "${name}" has been saved successfully`,
  });
}

export function loadWorkflow(workflow: Workflow, toast: ToastFn): void {
  const { nodes: currentNodes, edges: currentEdges, setNodes, setEdges, addToHistory, setCurrentWorkflow } = useCanvasStore.getState();
  
  addToHistory(currentNodes, currentEdges);
  
  setNodes(workflow.flowData.nodes);
  setEdges(workflow.flowData.edges);
  setCurrentWorkflow(workflow);
  
  toast({
    title: "Workflow Loaded",
    description: `Workflow "${workflow.name}" has been loaded`,
  });
}

export async function runWorkflow(toast: ToastFn, updateNodeData: (nodeId: string, data: Record<string, unknown>) => void): Promise<void> {
  const { nodes, edges, setIsRunning } = useCanvasStore.getState();
  
  if (nodes.length === 0) {
    throw new Error("Add some nodes to execute the workflow");
  }

  setIsRunning(true);

  try {
    const executor = new WorkflowExecutor(nodes, edges, updateNodeData);
    await executor.execute();
    
    toast({
      title: "Workflow Executed",
      description: "Workflow has been executed successfully",
    });
  } catch (error) {
    throw error;
  } finally {
    setIsRunning(false);
  }
}

