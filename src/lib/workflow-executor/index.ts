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
import { withActiveViewer, hasActiveModel } from "@/src/nodes/viewer-node/manager";
import * as THREE from "three";
import { buildClusters, buildClustersFromElements, applyClusterColors, ClusterConfig, getClusterStats } from "@/src/nodes/cluster-node/utils";
import type { PropertyInfo, PropertyNodeElement, ProcessorContext } from "./types";
import { safeStringify, topologicalSort, findUpstreamIfcNode, hasDownstreamGLBExport, hasDownstreamViewer, checkIfInputHasGeometry } from "./helpers";
import { IfcNodeProcessor } from "@/src/nodes/ifc-node/processor";
import { FilterNodeProcessor } from "@/src/nodes/filter-node/processor";
import { ParameterNodeProcessor } from "@/src/nodes/parameter-node/processor";
import { GeometryNodeProcessor } from "@/src/nodes/geometry-node/processor";
import { TransformNodeProcessor } from "@/src/nodes/transform-node/processor";
import { QuantityNodeProcessor } from "@/src/nodes/quantity-node/processor";
import { PropertyNodeProcessor } from "@/src/nodes/property-node/processor";
import { WatchNodeProcessor } from "@/src/nodes/watch-node/processor";
import { ClassificationNodeProcessor } from "@/src/nodes/classification-node/processor";
import { SpatialNodeProcessor } from "@/src/nodes/spatial-node/processor";
import { RelationshipNodeProcessor } from "@/src/nodes/relationship-node/processor";
import { AnalysisNodeProcessor } from "@/src/nodes/analysis-node/processor";
import { PythonNodeProcessor } from "@/src/nodes/python-node/processor";
import { ExportNodeProcessor } from "@/src/nodes/export-node/processor";
import { ClusterNodeProcessor } from "@/src/nodes/cluster-node/processor";
import { DataTransformNodeProcessor } from "@/src/nodes/data-transform-node/processor";

// Node processor registry - all nodes migrated!
const NODE_PROCESSORS = {
  ifcNode: new IfcNodeProcessor(),
  filterNode: new FilterNodeProcessor(),
  parameterNode: new ParameterNodeProcessor(),
  geometryNode: new GeometryNodeProcessor(),
  transformNode: new TransformNodeProcessor(),
  quantityNode: new QuantityNodeProcessor(),
  propertyNode: new PropertyNodeProcessor(),
  watchNode: new WatchNodeProcessor(),
  classificationNode: new ClassificationNodeProcessor(),
  spatialNode: new SpatialNodeProcessor(),
  relationshipNode: new RelationshipNodeProcessor(),
  analysisNode: new AnalysisNodeProcessor(),
  pythonNode: new PythonNodeProcessor(),
  exportNode: new ExportNodeProcessor(),
  clusterNode: new ClusterNodeProcessor(),
  dataTransformNode: new DataTransformNodeProcessor(),
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

  // Add getter for the final nodes list
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
      console.log("Starting workflow execution...");

      const sortedNodes = topologicalSort(this.nodes, this.edges);

      for (const nodeId of sortedNodes) {
        console.log(`Processing node ${nodeId}`);
        await this.processNode(nodeId);
      }

      console.log("Workflow execution completed");
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
      return this.nodeResults.get(nodeId);
    }

    const node = this.nodes.find((n) => n.id === nodeId);
    if (!node) {
      throw new Error(`Node with id ${nodeId} not found`);
    }

    const inputValues = await this.getInputValues(nodeId);

    // Create processor context
    const context: ProcessorContext = {
      nodeResults: this.nodeResults,
      edges: this.edges,
      nodes: this.nodes,
      updateNodeData: (nodeId: string, data: any) => this.updateNodeDataInList(nodeId, data),
    };

    // All nodes now use the processor system
    const processor = NODE_PROCESSORS[node.type as keyof typeof NODE_PROCESSORS];
    
    if (!processor) {
      throw new Error(`No processor found for node type: ${node.type}`);
    }
    
    const result = await processor.process(node, inputValues, context);

    this.nodeResults.set(nodeId, result);
    return result;
  }

  // All legacy code removed - processors handle all node types now
  private async getInputValues(nodeId: string): Promise<Record<string, any>> {
    const inputEdges = this.edges.filter((edge) => edge.target === nodeId);
    const inputValues: Record<string, any> = {};

    for (const edge of inputEdges) {
      // Process the source node to get its output
      const sourceResult = await this.processNode(edge.source);

      // Map the output to the correct input based on the target handle
      if (edge.targetHandle === "input") {
        inputValues.input = sourceResult;
      } else if (edge.targetHandle === "reference") {
        inputValues.reference = sourceResult;
      } else if (edge.targetHandle === "valueInput") {
        inputValues.valueInput = sourceResult;
      } else {
        // Default case
        inputValues[edge.targetHandle || "input"] = sourceResult;
      }
    }

    return inputValues;
  }

  // Helper to update node data in the internal list
  private updateNodeDataInList(nodeId: string, newData: any) {
    this.nodes = this.nodes.map((n) =>
      n.id === nodeId ? { ...n, data: newData } : n
    );

    // Call the real-time update callback if provided
    if (this.onNodeUpdate) {
      this.onNodeUpdate(nodeId, newData);
    }
  }

}
