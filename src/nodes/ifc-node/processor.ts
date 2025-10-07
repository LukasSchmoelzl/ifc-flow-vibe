import type { NodeProcessor, ProcessorContext } from '@/src/lib/workflow-executor/types';
import { loadIfcFile, getLastLoadedModel } from '@/src/lib/ifc-utils';

export class IfcNodeProcessor implements NodeProcessor {
  async process(node: any, inputValues: any, context: ProcessorContext): Promise<any> {
    console.log("Processing ifcNode", { node });

    let result;

    // Priority 1: Check if node has a model (from file upload in IFC node)
    if (node.data.model) {
      console.log("Using model from node data", node.data.model);
      result = node.data.model;

      if (!result.file && node.data.file) {
        result.file = node.data.file;
      }
    }
    // Priority 2: Check for cached model info
    else if (node.data.modelInfo) {
      console.log("Using cached modelInfo from node data", node.data.modelInfo);
      result = node.data.modelInfo;
    }
    // Priority 3: Check if there's a file to load
    else if (node.data.file) {
      try {
        const file = node.data.file;
        console.log("Loading IFC file from node data", file.name);
        result = await loadIfcFile(file);
        node.data.modelInfo = result;
      } catch (err) {
        console.error("Error loading IFC file:", err);
        throw new Error(
          `Failed to load IFC file: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }
    // Priority 4: Check if this is an empty node from saved workflow
    else if (node.data.isEmptyNode) {
      const fileName = node.data.fileName || node.data.properties?.filename || "Unknown File";
      console.warn(`IFC node requires file to be reloaded: ${fileName}`);
      result = {
        id: `empty-model-${Date.now()}`,
        name: `Reload Required: ${fileName}`,
        elements: [],
        errorMessage: `Please reload the IFC file: ${fileName}. Saved workflows do not include IFC file data.`,
      };
    }
    // Priority 5: Last resort - try to get the last loaded model
    else {
      const lastLoaded = getLastLoadedModel();
      if (lastLoaded) {
        console.log("Using last loaded model:", lastLoaded.id, "with", lastLoaded.elements.length, "elements");
        result = lastLoaded;
        node.data.modelInfo = lastLoaded;
      } else {
        console.warn("No IFC model data available. Please load an IFC file first.");
        result = {
          id: `empty-model-${Date.now()}`,
          name: "No IFC Data",
          elements: [],
          errorMessage: "No IFC file loaded. Please load an IFC file first.",
        };
      }
    }

    // Ensure result is properly formatted with an elements array
    const originalModelData = result && typeof result === 'object' && !Array.isArray(result)
      ? { id: result.id, name: result.name, schema: result.schema, project: result.project }
      : { id: `model-${Date.now()}`, name: "Unknown IFC Model", schema: undefined, project: undefined };

    if (result && !result.elements && Array.isArray(result)) {
      console.warn("IFC node result was an array, wrapping it in a model object.");
      result = {
        ...originalModelData,
        elements: result,
        elementCounts: { unknown: result.length },
        totalElements: result.length,
      };
    } else if (result && typeof result === 'object' && !Array.isArray(result.elements)) {
      result.elements = result.elements || [];
      result.name = result.name || originalModelData.name;
      result.id = result.id || originalModelData.id;
      result.schema = result.schema || originalModelData.schema;
      result.project = result.project || originalModelData.project;
    } else if (!result) {
      result = {
        ...originalModelData,
        name: "No IFC Data",
        elements: [],
        errorMessage: "No IFC data processed."
      };
    }

    console.log(`IFC node processed with ${result.elements?.length || 0} elements named '${result.name}'`);
    return result;
  }
}

