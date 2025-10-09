import { IfcNodeProcessor } from "@/src/nodes/ifc-node/ifc-loader";
import { TemplateNodeProcessor } from "@/src/nodes/template-node/text-processor";

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

// Node processor registry
const NODE_PROCESSORS = {
  ifcNode: new IfcNodeProcessor(),
  templateNode: new TemplateNodeProcessor(),
} as const;

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

  public async execute(): Promise<Map<string, any>> {
    if (this.isRunning) {
      throw new Error("Workflow is already running");
    }

    this.isRunning = true;
    this.nodeResults.clear();
    this.abortController = new AbortController();

    try {
      console.log("🚀 WORKFLOW EXECUTION STARTED");

      const sortedNodes = topologicalSort(this.nodes, this.edges);
      console.log(`📋 Processing ${sortedNodes.length} nodes in order:`, sortedNodes);

      for (const nodeId of sortedNodes) {
        const node = this.nodes.find(n => n.id === nodeId);
        console.log(`\n▶️  Processing node: ${nodeId} (${node?.type || 'unknown'})`);
        await this.processNode(nodeId);
      }

      console.log("\n✅ WORKFLOW EXECUTION COMPLETED");
      return this.nodeResults;
    } catch (error) {
      console.error("Error executing workflow:", error);
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

  private async processNode(nodeId: string): Promise<any> {
    if (this.nodeResults.has(nodeId)) {
      console.log(`   ⏭️  Node ${nodeId} already processed, using cached result`);
      return this.nodeResults.get(nodeId);
    }

    const node = this.nodes.find((n) => n.id === nodeId);
    if (!node) {
      throw new Error(`Node with id ${nodeId} not found`);
    }

    const inputValues = await this.getInputValues(nodeId);
    console.log(`   📥 Input values:`, Object.keys(inputValues).length > 0 ? inputValues : 'none');

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
    
    console.log(`   🔄 Calling processor for ${node.type}...`);
    const result = await processor.process(node, inputValues, context);
    console.log(`   ✅ Node ${nodeId} processed successfully`);

    this.nodeResults.set(nodeId, result);
    return result;
  }

  private async getInputValues(nodeId: string): Promise<Record<string, any>> {
    const inputEdges = this.edges.filter((edge) => edge.target === nodeId);
    const inputValues: Record<string, any> = {};

    for (const edge of inputEdges) {
      const sourceResult = await this.processNode(edge.source);

      if (edge.targetHandle === "input") {
        inputValues.input = sourceResult;
      } else if (edge.targetHandle === "reference") {
        inputValues.reference = sourceResult;
      } else if (edge.targetHandle === "valueInput") {
        inputValues.valueInput = sourceResult;
      } else {
        inputValues[edge.targetHandle || "input"] = sourceResult;
      }
    }

    return inputValues;
  }

  private updateNodeDataInList(nodeId: string, newData: any) {
    this.nodes = this.nodes.map((n) =>
      n.id === nodeId ? { ...n, data: newData } : n
    );

    if (this.onNodeUpdate) {
      this.onNodeUpdate(nodeId, newData);
    }
  }
}

