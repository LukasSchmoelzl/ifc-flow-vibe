import { NODE_PROCESSORS } from "@/src/canvas/nodes/auto-registry";

// Types and interfaces

export interface NodeProcessor {
  process(node: any, inputValues: any, context: ProcessorContext): Promise<any>;
}

export interface ProcessorContext {
  nodeResults: Map<string, any>;
  edges: any[];
  nodes: any[];
  updateNodeData: (nodeId: string, data: any) => void;
  saveToHistory?: (nodes: any[], edges: any[]) => void;
}

// Helper functions
export function topologicalSort(nodes: any[], edges: any[]): string[] {
  const graph: Record<string, string[]> = {};
  nodes.forEach((node) => {
    graph[node.id] = [];
  });

  edges.forEach((edge) => {
    if (graph[edge.source]) {
      graph[edge.source].push(edge.target);
    }
  });

  const visited = new Set<string>();
  const tempVisited = new Set<string>();
  const result: string[] = [];

  const visit = (nodeId: string) => {
    if (tempVisited.has(nodeId)) {
      throw new Error("Workflow contains a cycle, cannot execute");
    }

    if (!visited.has(nodeId)) {
      tempVisited.add(nodeId);

      if (graph[nodeId]) {
        for (const neighbor of graph[nodeId]) {
          visit(neighbor);
        }
      }

      tempVisited.delete(nodeId);
      visited.add(nodeId);
      result.unshift(nodeId);
    }
  };

  nodes.forEach((node) => {
    if (!visited.has(node.id)) {
      visit(node.id);
    }
  });

  return result;
}

export class WorkflowExecutor {
  private nodes: any[] = [];
  private edges: any[] = [];
  private nodeResults: Map<string, any> = new Map();
  private isRunning = false;
  private abortController: AbortController | null = null;
  private onNodeUpdate?: (nodeId: string, data: any) => void;

  constructor(nodes: any[], edges: any[], onNodeUpdate?: (nodeId: string, data: any) => void) {
    this.nodes = nodes;
    this.edges = edges;
    this.onNodeUpdate = onNodeUpdate;
  }

  public getUpdatedNodes(): any[] {
    return this.nodes;
  }

  public getNodeResults(): Map<string, any> {
    return this.nodeResults;
  }

  public async execute(): Promise<Map<string, any>> {
    if (this.isRunning) {
      throw new Error("Workflow is already running");
    }

    this.isRunning = true;
    this.nodeResults.clear();
    this.abortController = new AbortController();

    try {
      const sortedNodes = topologicalSort(this.nodes, this.edges);
      console.log(`🚀 Workflow: ${sortedNodes.length} nodes`);

      for (const nodeId of sortedNodes) {
        await this.processNode(nodeId);
      }

      console.log("✅ Workflow completed");
      return this.nodeResults;
    } catch (error) {
      console.error("❌ Workflow failed:", error);
      throw error;
    } finally {
      this.isRunning = false;
      this.abortController = null;
    }
  }

  public stop(): void {
    if (this.isRunning && this.abortController) {
      this.abortController.abort();
      this.isRunning = false;
    }
  }

  private findInputNodes(): string[] {
    const nodesWithIncomingEdges = new Set(
      this.edges.map((edge) => edge.target)
    );

    return this.nodes
      .filter((node) => !nodesWithIncomingEdges.has(node.id))
      .map((node) => node.id);
  }

  public async processNode(nodeId: string): Promise<any> {
    if (this.nodeResults.has(nodeId)) {
      return this.nodeResults.get(nodeId);
    }

    const node = this.nodes.find((n) => n.id === nodeId);
    if (!node) {
      throw new Error(`Node with id ${nodeId} not found`);
    }

    const inputValues = await this.getInputValues(nodeId);
    const context: ProcessorContext = {
      nodeResults: this.nodeResults,
      edges: this.edges,
      nodes: this.nodes,
      updateNodeData: (nodeId: string, data: any) => this.updateNodeDataInList(nodeId, data),
    };

    const processor = NODE_PROCESSORS[node.type as keyof typeof NODE_PROCESSORS];
    if (!processor) {
      throw new Error(`No processor found for node type: ${node.type}`);
    }
    
    // Log with input info
    const inputKeys = Object.keys(inputValues);
    const inputLog = inputKeys.length > 0 ? `input: ${inputKeys.join(', ')}` : 'no input';
    console.log(`▶️  ${node.type} (${inputLog})`);
    
    const result = await processor.process(node, inputValues, context);

    // Log with output info
    let outputType = 'none';
    if (result) {
      if (typeof result === 'object') {
        // Check if it's a FragmentsModel (has specific methods)
        if (typeof result.getMetadata === 'function') {
          outputType = 'FragmentsModel';
        } else {
          // Show first 3 keys for regular objects
          const keys = Object.keys(result).slice(0, 3);
          outputType = keys.length > 0 ? keys.join(', ') : 'object';
        }
      } else {
        outputType = typeof result;
      }
    }
    console.log(`   ✓ output: ${outputType}`);

    this.nodeResults.set(nodeId, result);
    return result;
  }

  private async getInputValues(nodeId: string): Promise<Record<string, any>> {
    const inputEdges = this.edges.filter((edge) => edge.target === nodeId);
    const inputValues: Record<string, any> = {};

    for (const edge of inputEdges) {
      const sourceResult = await this.processNode(edge.source);

      // If sourceHandle is specified, extract that specific data
      let dataToPass = sourceResult;
      if (edge.sourceHandle && sourceResult) {
        // Check if the specific handle data exists
        if (edge.sourceHandle === "full") {
          dataToPass = sourceResult;
        } else if (sourceResult[edge.sourceHandle]) {
          dataToPass = sourceResult[edge.sourceHandle];
        }
      }

      const handleId = edge.targetHandle || "input";
      inputValues[handleId] = dataToPass;
    }

    return inputValues;
  }

  private updateNodeDataInList(nodeId: string, newData: any) {
    const node = this.nodes.find(n => n.id === nodeId);
    console.log(`🔄 Executor: Updating node ${node?.type || nodeId} with data:`, newData);
    
    this.nodes = this.nodes.map((n) =>
      n.id === nodeId ? { ...n, data: newData } : n
    );

    if (this.onNodeUpdate) {
      console.log(`📢 Executor: Calling onNodeUpdate for ${node?.type || nodeId}`);
      this.onNodeUpdate(nodeId, newData);
    }
  }
}

