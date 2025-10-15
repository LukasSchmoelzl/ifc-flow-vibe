import { NODE_METADATA_MAP } from "@/src/canvas/nodes/auto-registry";
import { nodesOnCanvas } from "@/src/canvas/nodes-on-canvas";
import { useCanvasStore } from "@/src/canvas/store";
import type { ProcessorContext } from "@/src/canvas/executor";
import { getNodeTypeForTool } from "./tool-registry";

interface LLMExecutionContext {
  iteration: number;
  parameterIndex: number;
  lastNodeId: string | null;
  nodeResults: Map<string, any>;
}

export class LLMCanvasActions {
  private context: LLMExecutionContext = {
    iteration: 0,
    parameterIndex: 0,
    lastNodeId: null,
    nodeResults: new Map(),
  };

  createNodeFromTool(toolName: string, params: any): string {
    const nodeType = getNodeTypeForTool(toolName);
    if (!nodeType) throw new Error(`No node type for tool: ${toolName}`);

    const nodeParams = { ...params, _toolName: toolName };
    const node = nodesOnCanvas.createNodeAtIteration(
      nodeType,
      this.context.iteration,
      this.context.parameterIndex,
      nodeParams
    );

    const { setNodes } = useCanvasStore.getState();
    setNodes((nodes) => [...nodes, node]);

    this.context.iteration++;
    this.context.parameterIndex = 0;

    return node.id;
  }

  createParameterNode(nodeType: string, params: any): string {
    const nodeParams = { ...params };
    const node = nodesOnCanvas.createNodeAtIteration(
      nodeType,
      this.context.iteration,
      this.context.parameterIndex,
      nodeParams
    );

    const { setNodes } = useCanvasStore.getState();
    setNodes((nodes) => [...nodes, node]);

    this.context.parameterIndex++;

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
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) throw new Error(`Node ${nodeId} not found`);

    const updateNodeData = (id: string, data: any) => {
      useCanvasStore.getState().setNodes((nodes) =>
        nodes.map((n) => (n.id === id ? { ...n, data } : n))
      );
    };

    const inputValues: Record<string, any> = {};
    if (this.context.lastNodeId && this.context.nodeResults.has(this.context.lastNodeId)) {
      inputValues.input = this.context.nodeResults.get(this.context.lastNodeId);
    }

    const context: ProcessorContext = {
      nodeResults: this.context.nodeResults,
      edges,
      nodes,
      updateNodeData,
    };

    const nodeType = node.type;
    if (!nodeType) throw new Error(`Node ${nodeId} has no type`);
    
    const metadata = NODE_METADATA_MAP[nodeType];
    if (!metadata) throw new Error(`No metadata for node type: ${nodeType}`);

    const processor = metadata.processor;
    const result = await processor.process(node, inputValues, context);
    
    this.context.nodeResults.set(nodeId, result);
    this.context.lastNodeId = nodeId;
    return result;
  }

  reset(): void {
    this.context = {
      iteration: 0,
      parameterIndex: 0,
      lastNodeId: null,
      nodeResults: new Map(),
    };
    nodesOnCanvas.reset();
  }
}

