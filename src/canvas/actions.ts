"use client";

import type { Node, Edge } from "reactflow";
import { useCanvasStore } from "./store";
import { WorkflowExecutor } from "./executor";
import { createIfcNodeFromFile, generateNodeId } from "./nodes/auto-registry";
import type { Workflow } from "./storage";
import { WorkflowStorage } from "./storage";

const workflowStorage = new WorkflowStorage();

// Workflow Operations
export const workflowActions = {
  openFile: async (file: File, toast: any) => {
    const { nodes, edges, setNodes, addToHistory } = useCanvasStore.getState();
    
    try {
      addToHistory(nodes, edges);
      const position = { x: 100, y: 100 };
      const newNode = createIfcNodeFromFile(position, file);
      setNodes([...nodes, newNode]);
      
      toast({
        title: "IFC Node Created",
        description: `Created IFC node for ${file.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to create IFC node: ${error}`,
        variant: "destructive",
      });
    }
  },

  saveWorkflow: async (name: string, flowData: any, toast: any) => {
    try {
      const { currentWorkflow } = useCanvasStore.getState();
      const workflow: Workflow = {
        id: currentWorkflow?.id || crypto.randomUUID(),
        name,
        description: currentWorkflow?.description || "",
        createdAt: currentWorkflow?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: currentWorkflow?.tags || [],
        thumbnail: currentWorkflow?.thumbnail,
        flowData,
      };
      
      const savedWorkflow = workflowStorage.saveWorkflow(workflow);
      useCanvasStore.getState().setCurrentWorkflow(savedWorkflow);
      
      toast({
        title: "Workflow Saved",
        description: `Workflow "${name}" has been saved successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to save workflow: ${error}`,
        variant: "destructive",
      });
    }
  },

  loadWorkflow: (workflow: Workflow, setNodes: any, setEdges: any, toast: any) => {
    const { addToHistory } = useCanvasStore.getState();
    
    try {
      const { nodes: currentNodes, edges: currentEdges } = useCanvasStore.getState();
      addToHistory(currentNodes, currentEdges);
      
      setNodes(workflow.flowData.nodes || []);
      setEdges(workflow.flowData.edges || []);
      useCanvasStore.getState().setCurrentWorkflow(workflow);
      
      toast({
        title: "Workflow Loaded",
        description: `Workflow "${workflow.name}" has been loaded`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to load workflow: ${error}`,
        variant: "destructive",
      });
    }
  },

  runWorkflow: async (toast: any, updateNodeData: (nodeId: string, data: any) => void) => {
    const { nodes, edges, setIsRunning } = useCanvasStore.getState();
    
    if (nodes.length === 0) {
      toast({
        title: "Empty Workflow",
        description: "Add some nodes to execute the workflow",
        variant: "destructive",
      });
      return;
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
      console.error("Workflow execution error:", error);
      toast({
        title: "Execution Error",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  },
};

// Node Operations
export const nodeActions = {
  selectAll: (setNodes: any) => {
    const { nodes } = useCanvasStore.getState();
    setNodes(nodes.map(node => ({ ...node, selected: true })));
  },

  copy: (toast: any) => {
    const { nodes, edges, setClipboard } = useCanvasStore.getState();
    const selectedNodes = nodes.filter(node => node.selected);
    
    if (selectedNodes.length === 0) {
      toast({
        title: "Nothing to copy",
        description: "Select nodes to copy first",
      });
      return;
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
  },

  cut: (setNodes: any, setEdges: any, toast: any) => {
    const { nodes, edges, setClipboard, addToHistory } = useCanvasStore.getState();
    const selectedNodes = nodes.filter(node => node.selected);
    
    if (selectedNodes.length === 0) {
      toast({
        title: "Nothing to cut",
        description: "Select nodes to cut first",
      });
      return;
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
  },

  paste: (setNodes: any, setEdges: any, toast: any) => {
    const { clipboard, nodes, edges, addToHistory } = useCanvasStore.getState();
    
    if (!clipboard || clipboard.nodes.length === 0) {
      toast({
        title: "Nothing to paste",
        description: "Copy or cut nodes first",
      });
      return;
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
  },

  delete: (setNodes: any, setEdges: any, toast: any) => {
    const { nodes, edges, addToHistory } = useCanvasStore.getState();
    const selectedNodes = nodes.filter(node => node.selected);
    
    if (selectedNodes.length === 0) {
      toast({
        title: "Nothing to delete",
        description: "Select nodes to delete first",
      });
      return;
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
  },
};

