// Types and interfaces for workflow execution

export interface PropertyInfo {
  name: string;
  exists: boolean;
  value: any;
  psetName: string;
}

export interface PropertyNodeElement {
  id: string;
  expressId?: number;
  type: string;
  properties?: {
    GlobalId?: string;
    Name?: string;
    [key: string]: any;
  };
  propertyInfo?: PropertyInfo;
  [key: string]: any;
}

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

