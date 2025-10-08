import type { NodeProcessor, ProcessorContext } from '@/src/lib/workflow-executor';
import * as FRAGS from "@thatopen/fragments";

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

      world.scene.three.add(model.object);
      await fragments.update(true);
      console.log(`[IFC Processor] Model added to scene and updated`);

      const metadata = await model.getMetadata();
      console.log(`[IFC Processor] Metadata:`, metadata);

      if (!(window as any).__fragmentsModels) {
        (window as any).__fragmentsModels = {};
      }
      (window as any).__fragmentsModels[node.id] = model;

      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: false,
        model: {
          schema: metadata?.schema || "IFC",
          project: { Name: metadata?.name || node.data.file.name },
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
