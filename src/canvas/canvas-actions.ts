import { NODE_REGISTRY, createNode } from "@/src/canvas/nodes/auto-registry";
import { useCanvasStore } from "./store";
import type { ProcessorContext } from "./executor";
import { getNodeTypeForTool } from "@/src/llm/tool-registry";

const NODE_SPACING_X = 300;
const NODE_SPACING_Y = 150;
const START_X = 100;
const START_Y = 100;

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
    const position = {
      x: START_X + this.context.iteration * NODE_SPACING_X,
      y: START_Y + this.context.parameterIndex * NODE_SPACING_Y,
    };
    const node = createNode(nodeType, position, nodeParams);

    const { setNodes } = useCanvasStore.getState();
    setNodes((nodes) => [...nodes, node]);

    this.context.iteration++;
    this.context.parameterIndex = 0;

    return node.id;
  }

  createParameterNode(nodeType: string, params: any): string {
    const nodeParams = { ...params };
    const position = {
      x: START_X + this.context.iteration * NODE_SPACING_X,
      y: START_Y + this.context.parameterIndex * NODE_SPACING_Y,
    };
    const node = createNode(nodeType, position, nodeParams);

    const { setNodes } = useCanvasStore.getState();
    setNodes((nodes) => [...nodes, node]);

    this.context.parameterIndex++;

    return node.id;
  }

  connectToPreviousNode(currentNodeId: string): void {
    if (!this.context.lastNodeId) return;

    const lastNodeId = this.context.lastNodeId;
    const { setEdges, nodes } = useCanvasStore.getState();
    
    // Get node types to determine correct handles
    const sourceNode = nodes.find(n => n.id === lastNodeId);
    const targetNode = nodes.find(n => n.id === currentNodeId);
    
    if (!sourceNode || !targetNode) return;
    
    // Determine source handle based on node type
    let sourceHandle: string | undefined;
    let targetHandle: string | undefined;
    
    // Source node output handles
    switch (sourceNode.type) {
      case 'fileManagerNode':
        sourceHandle = 'load_ifc_file';
        break;
      case 'fragmentsApiNode':
        // Default to first output for fragments API
        sourceHandle = 'bim_get_model_info';
        break;
      default:
        // Try to find any output handle
        sourceHandle = undefined;
    }
    
    // Target node input handles
    switch (targetNode.type) {
      case 'fragmentsApiNode':
        targetHandle = 'model';
        break;
      case 'infoViewerNode':
        targetHandle = 'project_data';
        break;
      default:
        // Try to find any input handle
        targetHandle = undefined;
    }
    
    setEdges((edges) => [
      ...edges,
      {
        id: `llm-edge-${lastNodeId}-${currentNodeId}`,
        source: lastNodeId,
        target: currentNodeId,
        sourceHandle,
        targetHandle,
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
    
    const { metadata } = NODE_REGISTRY[nodeType as keyof typeof NODE_REGISTRY];
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
  }
}
