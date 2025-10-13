import { createNode } from "@/src/canvas/nodes/auto-registry";
import { useCanvasStore } from "@/src/canvas/state/store";
import { WorkflowExecutor } from "@/src/canvas/workflow/executor";
import { getNodeTypeForTool } from "./tool-registry";

const NODE_SPACING = 300;
const START_Y = 100;

interface LLMExecutionContext {
  iteration: number;
  nodeChain: string[];
  lastNodeId: string | null;
}

export class LLMCanvasActions {
  private context: LLMExecutionContext = {
    iteration: 0,
    nodeChain: [],
    lastNodeId: null,
  };

  createNodeFromTool(toolName: string, params: any): string {
    const nodeType = getNodeTypeForTool(toolName);
    if (!nodeType) throw new Error(`No node type for tool: ${toolName}`);

    const position = {
      x: this.context.iteration * NODE_SPACING,
      y: START_Y,
    };

    const node = createNode(nodeType, position, params);
    
    const { setNodes } = useCanvasStore.getState();
    setNodes((nodes) => [...nodes, node]);
    
    this.context.nodeChain.push(node.id);
    this.context.iteration++;
    
    return node.id;
  }

  connectToPreviousNode(currentNodeId: string): void {
    if (!this.context.lastNodeId) return;

    const lastNodeId = this.context.lastNodeId;
    const { setEdges } = useCanvasStore.getState();
    setEdges((edges) => [
      ...edges,
      {
        id: `llm-edge-${lastNodeId}-${currentNodeId}`,
        source: lastNodeId,
        target: currentNodeId,
        sourceHandle: "output",
        targetHandle: "input",
      },
    ]);
  }

  async executeNode(nodeId: string): Promise<any> {
    const { nodes, edges } = useCanvasStore.getState();
    const updateNodeData = (id: string, data: any) => {
      useCanvasStore.getState().setNodes((nodes) =>
        nodes.map((n) => (n.id === id ? { ...n, data } : n))
      );
    };

    const executor = new WorkflowExecutor(nodes, edges, updateNodeData);
    await executor.processNode(nodeId);
    return executor.getNodeResults().get(nodeId);
  }

  updateContext(nodeId: string): void {
    this.context.lastNodeId = nodeId;
  }

  reset(): void {
    this.context = {
      iteration: 0,
      nodeChain: [],
      lastNodeId: null,
    };
  }
}

