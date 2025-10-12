import type { NodeProcessor, ProcessorContext } from '@/src/canvas/workflow-executor';
import * as FRAGS from "@thatopen/fragments";

// Use web-ifc version 0.0.72 (worked before restructuring)
const WASM_PATH = "https://unpkg.com/web-ifc@0.0.72/";

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
      const fragmentsViewer = window.__fragmentsViewer;
      
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

      console.log(`[IFC Processor] Loading file: ${node.data.file.name}, size: ${node.data.file.size} bytes`);
      
      const ifcBuffer = await node.data.file.arrayBuffer();
      const typedArray = new Uint8Array(ifcBuffer);
      console.log(`[IFC Processor] Converting IFC to Fragments...`);

      // Process IFC to Fragments (without raw flag to get compressed data)
      const fragmentsBytes = await serializer.process({ bytes: typedArray });
      console.log(`[IFC Processor] Fragments bytes generated: ${fragmentsBytes.byteLength} bytes`);

      console.log(`[IFC Processor] Loading model into Fragments viewer...`);
      const model = await fragments.load(fragmentsBytes.buffer as ArrayBuffer, {
        modelId: node.id,
        camera: world.camera.three as any,
      });

      console.log(`[IFC Processor] Model loaded:`, model);
      console.log(`[IFC Processor] Model properties:`, Object.keys(model));

      world.scene.three.add(model.object);
      await fragments.update(true);
      console.log(`[IFC Processor] Model added to scene and updated`);

      const metadata = await model.getMetadata();
      console.log(`[IFC Processor] Metadata:`, metadata);

      const categories = await model.getCategories();
      console.log(`[IFC Processor] Categories:`, categories);

      const itemsWithGeometry = await model.getItemsIdsWithGeometry();
      const totalElements = itemsWithGeometry.length;
      console.log(`[IFC Processor] Total elements with geometry:`, totalElements);

      const elementCounts: Record<string, number> = {};
      for (const category of categories) {
        const itemsOfCategory = await model.getItemsOfCategories([new RegExp(`^${category}$`)]);
        const count = Object.values(itemsOfCategory).flat().length;
        if (count > 0) {
          elementCounts[category] = count;
        }
      }
      console.log(`[IFC Processor] Element counts by category:`, elementCounts);

      if (!window.__fragmentsModels) {
        window.__fragmentsModels = {};
      }
      window.__fragmentsModels[node.id] = model;

      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: false,
        model: {
          schema: metadata?.schema || "IFC",
          project: { Name: metadata?.name || node.data.file.name },
          totalElements,
          elementCounts,
        },
      });

      console.log(`[IFC Processor] Processing complete for node ${node.id}`);

      return {
        file: node.data.file,
        name: node.data.file.name,
        model,
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
