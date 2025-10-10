import type { NodeProcessor, ProcessorContext } from '@/src/canvas/workflow-executor';
// DEPRECATED: These functions were removed from ifc-utils
// import { ... } from '@/src/lib/ifc-utils';
import { hasDownstreamGLBExport, hasDownstreamViewer } from '@/src/canvas/workflow-executor';
import * as THREE from 'three';

export class GeometryNodeProcessor implements NodeProcessor {
  async process(node: any, inputValues: any, context: ProcessorContext): Promise<any> {
    const nodeId = node.id;
    const hasDownstreamGLB = hasDownstreamGLBExport(nodeId, context.edges, context.nodes);
    const hasDownstreamViewerNode = hasDownstreamViewer(nodeId, context.edges, context.nodes);
    const needsActualGeometry = node.data.properties?.useActualGeometry || hasDownstreamGLB || hasDownstreamViewerNode;
    const hasViewerModel = hasActiveModel();

    let viewerElementCount = 0;
    if (hasViewerModel) {
      viewerElementCount = withActiveViewer(viewer => viewer.getElementCount()) || 0;
    }

    context.updateNodeData(nodeId, {
      ...node.data,
      hasRealGeometry: needsActualGeometry && hasViewerModel,
      viewerElementCount
    });

    if (needsActualGeometry && hasViewerModel) {
      if (hasDownstreamGLB && !node.data.properties?.useActualGeometry) {
        console.log(`Automatically enabling geometry extraction for GLB export downstream from node ${nodeId}`);
      }
      if (hasDownstreamViewerNode && !node.data.properties?.useActualGeometry && !hasDownstreamGLB) {
        console.log(`Automatically enabling geometry extraction for viewer downstream from node ${nodeId}`);
      }

      return await this.executeWithViewer(node, inputValues, context);
    } else if (needsActualGeometry && !hasViewerModel) {
      console.log(`No active viewer model, falling back to worker-based geometry extraction for node ${nodeId}`);
      return await this.executeWithWorker(node, context);
    } else {
      const result = extractGeometry(
        inputValues.input,
        node.data.properties?.elementType || "all",
        node.data.properties?.includeOpenings !== "false"
      );

      if (Array.isArray(result)) {
        return result.map(element => ({
          ...element,
          hasRealGeometry: false
        }));
      }
      return result;
    }
  }

  private async executeWithViewer(node: any, inputValues: any, context: ProcessorContext): Promise<any> {
    const nodeId = node.id;
    console.log(`Executing geometry node with viewer-backed geometry for ${nodeId}`);

    if (!inputValues.input) {
      throw new Error(`No input provided to geometry node ${nodeId}`);
    }

    const model = inputValues.input;
    if (!model || !model.elements) {
      throw new Error(`Input to geometry node ${nodeId} is not a valid IFC model`);
    }

    const elementType = node.data.properties?.elementType || "all";
    const includeOpenings = node.data.properties?.includeOpenings !== "false";

    const filteredElements = extractGeometry(model, elementType, includeOpenings);
    const viewerElementCount = withActiveViewer(viewer => viewer.getElementCount()) || 0;
    const indexedElementIds = withActiveViewer(viewer => viewer.getIndexedElementIds()) || [];

    console.log(`Geometry node: ${filteredElements.length} filtered elements, ${viewerElementCount} viewer elements`);

    const result = filteredElements.map(element => {
      const hasViewerMesh = indexedElementIds.includes(element.expressId);
      return {
        ...element,
        hasRealGeometry: hasViewerMesh,
        boundingBox: hasViewerMesh ?
          withActiveViewer(viewer => {
            const bbox = viewer.getBoundingBoxForElement(element.expressId);
            return bbox ? {
              min: bbox.min.toArray(),
              max: bbox.max.toArray(),
              size: bbox.getSize(new THREE.Vector3()).toArray()
            } : null;
          }) : null
      };
    });

    context.updateNodeData(nodeId, {
      ...node.data,
      elements: result,
      hasRealGeometry: true,
      viewerElementCount
    });

    console.log(`Geometry node completed: ${result.length} elements with real geometry flags`);
    return result;
  }

  private async executeWithWorker(node: any, context: ProcessorContext): Promise<any> {
    const nodeId = node.id;
    console.log(`Executing geometry node with actual geometry for ${nodeId}`);

    const inputValues = await this.getInputValues(nodeId, context);
    if (!inputValues.input) {
      throw new Error(`No input provided to geometry node ${nodeId}`);
    }

    const model = inputValues.input;
    if (!model || !model.file) {
      throw new Error(`Input to geometry node ${nodeId} is not a valid IFC model with file reference`);
    }

    const elementType = node.data.properties?.elementType || "all";
    const includeOpenings = node.data.properties?.includeOpenings !== "false";

    let updatedNodeData = {
      ...node.data,
      isLoading: true,
      progress: { percentage: 5, message: "Starting geometry extraction..." },
      error: null,
    };
    context.updateNodeData(nodeId, updatedNodeData);

    try {
      const progressCallback = (percentage: number, message?: string) => {
        context.updateNodeData(nodeId, {
          ...updatedNodeData,
          isLoading: true,
          progress: { percentage, message: message || "Processing..." },
        });
      };

      const elements = await extractGeometryWithGeom(model, elementType, includeOpenings, progressCallback);

      updatedNodeData = {
        ...updatedNodeData,
        elements,
        model,
        isLoading: false,
        progress: null,
      };
      context.updateNodeData(nodeId, updatedNodeData);

      return elements.map((el) => {
        if (el.geometry && el.geometry.type === "simplified") {
          return {
            ...el,
            properties: {
              ...el.properties,
              hasSimplifiedGeometry: true,
              dimensions: el.geometry.dimensions,
            },
          };
        }
        return el;
      });
    } catch (error) {
      console.error(`Error during geometry extraction for node ${nodeId}:`, error);

      updatedNodeData = {
        ...updatedNodeData,
        isLoading: false,
        progress: null,
        error: error instanceof Error ? error.message : String(error),
      };
      context.updateNodeData(nodeId, updatedNodeData);

      throw error;
    }
  }

  private async getInputValues(nodeId: string, context: ProcessorContext): Promise<Record<string, any>> {
    const inputEdges = context.edges.filter((edge) => edge.target === nodeId);
    const inputValues: Record<string, any> = {};

    for (const edge of inputEdges) {
      const sourceResult = context.nodeResults.get(edge.source);
      if (edge.targetHandle === "input") {
        inputValues.input = sourceResult;
      } else {
        inputValues[edge.targetHandle || "input"] = sourceResult;
      }
    }

    return inputValues;
  }

  async extractForGLBExport(input: any): Promise<any> {
    let model;
    if (Array.isArray(input)) {
      const lastLoaded = getLastLoadedModel();
      if (!lastLoaded) {
        throw new Error("No IFC model available for geometry extraction");
      }
      model = lastLoaded;
    } else if (input.elements && Array.isArray(input.elements)) {
      model = input;
    } else {
      throw new Error("Invalid input format for geometry extraction");
    }

    console.log("Extracting geometry for GLB export from model:", model.name);

    const elements = await extractGeometryWithGeom(
      model,
      "all",
      true,
      (progress, message) => {
        console.log(`GLB Geometry extraction: ${progress}% - ${message}`);
      }
    );

    return elements;
  }
}

