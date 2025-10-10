"use client";

import { useState, useCallback } from "react";
import type { Node, Edge } from "reactflow";
import { useToast } from "@/src/hooks/use-toast";
import { WorkflowExecutor } from "@/src/canvas/workflow-executor";
import { loadIfcFile, getIfcFile } from "@/src/lib/ifc-utils";
import { createIfcNodeFromFile } from "@/src/canvas/nodes/nodes/ifc-node/factory";
import type { Workflow } from "@/src/canvas/workflow-storage";

export function useWorkflowOperations(
  nodes: Node[],
  edges: Edge[],
  setNodes: (fn: ((nodes: Node[]) => Node[]) | Node[]) => void,
  setEdges: (edges: Edge[]) => void,
  saveToHistory: (nodes: Node[], edges: Edge[]) => void
) {
  const { toast } = useToast();
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [executionResults, setExecutionResults] = useState(new Map());

  // Handle file opening
  const handleOpenFile = useCallback(
    async (file: File) => {
      try {
        // Save current state to history before opening new file
        saveToHistory(nodes, edges);

        const result = await loadIfcFile(file);

        const position = { x: 100, y: 100 };
        const newNode = createIfcNodeFromFile(position, file, result);

        setNodes((nds) => [...nds, newNode]);

        toast({
          title: "IFC File Loaded",
          description: `Successfully loaded ${file.name}`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to load IFC file: ${error}`,
          variant: "destructive",
        });
      }
    },
    [nodes, edges, saveToHistory, setNodes, toast]
  );

  // Handle workflow saving
  const handleSaveWorkflow = useCallback(
    (name: string, flowData: any) => {
      setCurrentWorkflow({
        id: Date.now().toString(),
        name,
        flowData,
        description: "",
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      toast({
        title: "Workflow Saved",
        description: `${name} has been saved`,
      });
    },
    [toast]
  );

  // Handle workflow loading
  const handleLoadWorkflow = useCallback(
    (workflow: Workflow) => {
      // Save current state to history before loading new workflow
      saveToHistory(nodes, edges);

      setNodes(workflow.flowData.nodes || []);
      setEdges(workflow.flowData.edges || []);
      setCurrentWorkflow(workflow);

      toast({
        title: "Workflow Loaded",
        description: `${workflow.name} has been loaded`,
      });
    },
    [nodes, edges, saveToHistory, setNodes, setEdges, toast]
  );

  // Handle workflow execution
  const handleRunWorkflow = useCallback(async () => {
    if (isRunning) return;

    setIsRunning(true);
    try {
      // Create a real-time node update callback
      const onNodeUpdate = (nodeId: string, newData: any) => {
        setNodes((currentNodes: Node[]) =>
          currentNodes.map((node) => {
            if (node.id === nodeId) {
              return {
                ...node,
                data: {
                  ...node.data,
                  ...newData,
                },
              };
            }
            return node;
          })
        );
      };

      const executor = new WorkflowExecutor(nodes, edges, onNodeUpdate);
      const results = await executor.execute();
      setExecutionResults(results);

      // Get the updated nodes from the executor (includes inputData for watch nodes)
      const updatedNodes = executor.getUpdatedNodes();

      // Update the React Flow nodes with the execution results
      setNodes((currentNodes: Node[]) =>
        currentNodes.map((node) => {
          // Find the corresponding updated node from the executor
          const updatedNode = updatedNodes.find((n: any) => n.id === node.id);
          if (updatedNode && updatedNode.data) {
            // Merge the updated data while preserving React Flow properties
            return {
              ...node,
              data: {
                ...node.data,
                ...updatedNode.data,
              },
            };
          }
          return node;
        })
      );

      toast({
        title: "Workflow Complete",
        description: "Workflow executed successfully",
      });
    } catch (error) {
      toast({
        title: "Execution Error",
        description: `Failed to execute workflow: ${error}`,
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  }, [isRunning, nodes, edges, setNodes, toast]);

  return {
    currentWorkflow,
    setCurrentWorkflow,
    isRunning,
    setIsRunning,
    executionResults,
    handleOpenFile,
    handleSaveWorkflow,
    handleLoadWorkflow,
    handleRunWorkflow,
  };
}

