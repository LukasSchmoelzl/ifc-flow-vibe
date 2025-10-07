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

      console.log(`[IFC Processor] Loading file: ${node.data.file.name}, size: ${node.data.file.size} bytes`);
      
      const ifcBuffer = await node.data.file.arrayBuffer();
      const typedArray = new Uint8Array(ifcBuffer);
      console.log(`[IFC Processor] Converting IFC to Fragments...`);
      
      const bytes = await serializer.process({ bytes: typedArray, raw: true });
      console.log(`[IFC Processor] Fragments bytes generated: ${bytes.byteLength} bytes`);

      console.log(`[IFC Processor] Loading model into Fragments viewer...`);
      const model = await fragments.load(bytes, {
        modelId: node.id,
        camera: world.camera.three,
        raw: true,
      });

      console.log(`[IFC Processor] Model loaded:`, model);
      console.log(`[IFC Processor] Model properties:`, Object.keys(model));
      console.log(`[IFC Processor] Model metadata:`, model.getMetadata ? model.getMetadata() : 'No metadata method');

      world.scene.three.add(model.object);
      await fragments.update(true);
      console.log(`[IFC Processor] Model added to scene and updated`);

      // Extract metadata using available Fragments API
      const metadata = model.getMetadata();
      console.log(`[IFC Processor] Metadata:`, metadata);

      // Get all fragments IDs
      const fragmentIDs = Object.keys(model.items);
      console.log(`[IFC Processor] Fragment IDs count:`, fragmentIDs.length);

      // Count total items
      let totalItems = 0;
      const itemsByCategory: Record<string, number> = {};
      
      for (const fragmentID of fragmentIDs) {
        const fragment = model.items[fragmentID];
        console.log(`[IFC Processor] Fragment ${fragmentID}:`, fragment);
        
        if (fragment && fragment.ids) {
          const itemCount = fragment.ids.length;
          totalItems += itemCount;
          console.log(`[IFC Processor] Fragment ${fragmentID} has ${itemCount} items`);
        }
      }

      console.log(`[IFC Processor] Total items: ${totalItems}`);
      console.log(`[IFC Processor] Items by category:`, itemsByCategory);

      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: false,
        model: {
          fragmentsModel: model,
          schema: metadata?.schema || "Unknown",
          project: { Name: metadata?.name || node.data.file.name },
          elementCounts: itemsByCategory,
          totalElements: totalItems,
        },
      });

      console.log(`[IFC Processor] Processing complete for node ${node.id}`);

      return {
        file: node.data.file,
        name: node.data.file.name,
        model,
        elements: [], // TODO: Extract actual elements from fragments
        elementCounts: itemsByCategory,
        totalElements: totalItems,
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
