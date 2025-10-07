import type { NodeProcessor, ProcessorContext } from '@/src/lib/workflow-executor';
import * as FRAGS from "@thatopen/fragments";

const WASM_PATH = "https://unpkg.com/web-ifc@0.0.69/";

export class IfcNodeProcessor implements NodeProcessor {
  async process(node: any, inputValues: any, context: ProcessorContext): Promise<any> {
    if (!node.data.file) {
      console.warn(`No file provided to IFC node ${node.id}`);
      return null;
    }

    try {
      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: true,
        error: null,
      });

      // Get fragments viewer from global scope
      const fragmentsViewer = (window as any).__fragmentsViewer;
      
      if (!fragmentsViewer) {
        throw new Error("Fragments viewer not initialized");
      }

      const { fragments, world } = fragmentsViewer;

      // Convert IFC to Fragments
      const serializer = new FRAGS.IfcImporter();
      serializer.wasm = {
        absolute: true,
        path: WASM_PATH,
      };

      const ifcBuffer = await node.data.file.arrayBuffer();
      const typedArray = new Uint8Array(ifcBuffer);
      const bytes = await serializer.process({ bytes: typedArray, raw: true });

      // Load model
      const model = await fragments.load(bytes, {
        modelId: node.id,
        camera: world.camera.three,
        raw: true,
      });

      world.scene.three.add(model.object);
      await fragments.update(true);

      // Extract metadata
      const spatialStructure = await model.getSpatialStructure();
      const categories = await model.getCategories();
      const itemsWithGeometry = await model.getItemsWithGeometry();

      // Count elements by type
      const elementCounts: Record<string, number> = {};
      for (const item of itemsWithGeometry) {
        const category = item.category || "Unknown";
        elementCounts[category] = (elementCounts[category] || 0) + 1;
      }

      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: false,
        model: {
          fragmentsModel: model,
          schema: "IFC4",
          project: { Name: node.data.file.name },
          elementCounts,
          totalElements: itemsWithGeometry.length,
          spatialStructure,
          categories,
        },
      });

      return {
        file: node.data.file,
        name: node.data.file.name,
        model,
        elements: itemsWithGeometry,
        elementCounts,
        totalElements: itemsWithGeometry.length,
      };
    } catch (error) {
      console.error(`Error processing IFC in node ${node.id}:`, error);
      
      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: false,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }
}
