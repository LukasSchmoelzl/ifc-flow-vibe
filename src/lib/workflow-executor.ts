import {
  extractGeometry,
  filterElements,
  transformElements,
  extractQuantities,
  manageProperties,
  manageClassifications,
  spatialQuery,
  queryRelationships,
  exportData,
  downloadExportedFile,
  loadIfcFile,
  IfcModel,
  getLastLoadedModel,
  extractGeometryWithGeom,
  runPythonScript,
} from "@/src/lib/ifc-utils";
import { performAnalysis } from "@/src/nodes/analysis-node/utils";
import * as THREE from "three";
// import { buildClusters, buildClustersFromElements, applyClusterColors, ClusterConfig, getClusterStats } from "@/src/nodes-louis/cluster-node/utils";
import { IfcNodeProcessor } from "@/src/nodes/ifc-node/executor";
// import { FilterNodeProcessor } from "@/src/nodes-louis/filter-node/executor";
// import { ParameterNodeProcessor } from "@/src/nodes-louis/parameter-node/executor";
// import { GeometryNodeProcessor } from "@/src/nodes-louis/geometry-node/executor";
// import { TransformNodeProcessor } from "@/src/nodes-louis/transform-node/executor";
// import { QuantityNodeProcessor } from "@/src/nodes-louis/quantity-node/executor";
// import { PropertyNodeProcessor } from "@/src/nodes-louis/property-node/executor";
// import { WatchNodeProcessor } from "@/src/nodes-louis/watch-node/executor";
// import { ClassificationNodeProcessor } from "@/src/nodes-louis/classification-node/executor";
// import { SpatialNodeProcessor } from "@/src/nodes-louis/spatial-node/executor";
// import { RelationshipNodeProcessor } from "@/src/nodes-louis/relationship-node/executor";
// import { AnalysisNodeProcessor } from "@/src/nodes-louis/analysis-node/executor";
// import { PythonNodeProcessor } from "@/src/nodes-louis/python-node/executor";
// import { ExportNodeProcessor } from "@/src/nodes-louis/export-node/executor";
// import { ClusterNodeProcessor } from "@/src/nodes-louis/cluster-node/executor";
// import { DataTransformNodeProcessor } from "@/src/nodes-louis/data-transform-node/executor";

// Types and interfaces
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

// Helper functions
export function safeStringify(value: any): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value !== "object") return String(value);

  const seen = new WeakSet();

  const replacer = (key: string, value: any) => {
    if (typeof value !== "object" || value === null) return value;

    if (seen.has(value)) {
      return "[Circular Reference]";
    }

    seen.add(value);
    return value;
  };

  try {
    return JSON.stringify(value, replacer);
  } catch (error) {
    console.warn("Error stringifying object:", error);
    return "[Complex Object]";
  }
}

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

export function findUpstreamIfcNode(nodeId: string, edges: any[], nodes: any[]): string | null {
  const visited = new Set<string>();

  const checkUpstream = (currentNodeId: string): string | null => {
    if (visited.has(currentNodeId)) return null;
    visited.add(currentNodeId);

    const incomingEdges = edges.filter(edge => edge.target === currentNodeId);

    for (const edge of incomingEdges) {
      const sourceNode = nodes.find(n => n.id === edge.source);
      if (!sourceNode) continue;

      if (sourceNode.type === "ifcNode") {
        return sourceNode.id;
      }

      const upstreamIfc = checkUpstream(edge.source);
      if (upstreamIfc) {
        return upstreamIfc;
      }
    }

    return null;
  };

  return checkUpstream(nodeId);
}

export function hasDownstreamGLBExport(nodeId: string, edges: any[], nodes: any[]): boolean {
  const visited = new Set<string>();

  const checkDownstream = (currentNodeId: string): boolean => {
    if (visited.has(currentNodeId)) return false;
    visited.add(currentNodeId);

    const outgoingEdges = edges.filter(edge => edge.source === currentNodeId);

    for (const edge of outgoingEdges) {
      const targetNode = nodes.find(n => n.id === edge.target);
      if (!targetNode) continue;

      if (targetNode.type === "exportNode" &&
        targetNode.data.properties?.format === "glb") {
        console.log(`Found downstream GLB export from geometry node ${nodeId}`);
        return true;
      }

      if (checkDownstream(edge.target)) {
        return true;
      }
    }

    return false;
  };

  return checkDownstream(nodeId);
}

export function hasDownstreamViewer(nodeId: string, edges: any[], nodes: any[]): boolean {
  const visited = new Set<string>();

  const checkDownstream = (currentNodeId: string): boolean => {
    if (visited.has(currentNodeId)) return false;
    visited.add(currentNodeId);

    const outgoingEdges = edges.filter(edge => edge.source === currentNodeId);

    for (const edge of outgoingEdges) {
      const targetNode = nodes.find(n => n.id === edge.target);
      if (!targetNode) continue;

      if (checkDownstream(edge.target)) {
        return true;
      }
    }

    return false;
  };

  return checkDownstream(nodeId);
}

export function checkIfInputHasGeometry(input: any): boolean {
  if (!input) return false;

  if (Array.isArray(input)) {
    return input.some((element: any) => element.geometry && element.geometry.vertices);
  }

  if (input.elements && Array.isArray(input.elements)) {
    return input.elements.some((element: any) => element.geometry && element.geometry.vertices);
  }

  return false;
}

// Node processor registry - all nodes migrated!
const NODE_PROCESSORS = {
  ifcNode: new IfcNodeProcessor(),
  // filterNode: new FilterNodeProcessor(),
  // parameterNode: new ParameterNodeProcessor(),
  // geometryNode: new GeometryNodeProcessor(),
  // transformNode: new TransformNodeProcessor(),
  // quantityNode: new QuantityNodeProcessor(),
  // propertyNode: new PropertyNodeProcessor(),
  // watchNode: new WatchNodeProcessor(),
  // classificationNode: new ClassificationNodeProcessor(),
  // spatialNode: new SpatialNodeProcessor(),
  // relationshipNode: new RelationshipNodeProcessor(),
  // analysisNode: new AnalysisNodeProcessor(),
  // pythonNode: new PythonNodeProcessor(),
  // exportNode: new ExportNodeProcessor(),
  // clusterNode: new ClusterNodeProcessor(),
  // dataTransformNode: new DataTransformNodeProcessor(),
} as const;

// TODO: error handling and progress tracking
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

