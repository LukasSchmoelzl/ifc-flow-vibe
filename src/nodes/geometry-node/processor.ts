import type { NodeProcessor, ProcessorContext } from '@/src/lib/workflow-executor';
import { extractGeometry, extractGeometryWithGeom, getLastLoadedModel } from '@/src/lib/ifc-utils';
import { hasDownstreamGLBExport, hasDownstreamViewer } from '@/src/lib/workflow-executor';
import * as THREE from 'three';

export class GeometryNodeProcessor implements NodeProcessor {
  async process(node: any, inputValues: any, context: ProcessorContext): Promise<any> {
    const nodeId = node.id;
    const hasDownstreamGLB = hasDownstreamGLBExport(nodeId, context.edges, context.nodes);
    const needsActualGeometry = node.data.properties?.useActualGeometry || hasDownstreamGLB;

    context.updateNodeData(nodeId, {
      ...node.data,
      hasRealGeometry: false,
      viewerElementCount: 0
    });

    if (needsActualGeometry) {
      console.log(`Geometry extraction enabled for node ${nodeId}`);
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

