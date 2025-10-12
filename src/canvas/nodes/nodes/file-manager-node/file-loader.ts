import type { NodeProcessor, ProcessorContext } from '@/src/canvas/workflow/executor';
import * as FRAGS from "@thatopen/fragments";

const WASM_PATH = "https://unpkg.com/web-ifc@0.0.72/";

export class FileManagerNodeProcessor implements NodeProcessor {
  async process(node: any, inputValues: any, context: ProcessorContext): Promise<any> {
    if (!node.data.file) {
      console.warn(`No file provided to file-manager node ${node.id}`);
      return null;
    }

    const file = node.data.file;

    // Only IFC files are supported
    if (!file.name.toLowerCase().endsWith('.ifc')) {
      throw new Error(`Only .ifc files are supported. Got: ${file.name}`);
    }

    try {
      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: true,
        error: null,
      });

      // Get fragments viewer
      const fragmentsViewer = window.__fragmentsViewer;
      if (!fragmentsViewer) {
        throw new Error("Fragments viewer not initialized");
      }

      const { fragments, world } = fragmentsViewer;

      // Clear existing model if any (only one model at a time)
      await this.clearExistingModels(fragments, world);

      // Convert IFC to Fragments
      const serializer = new FRAGS.IfcImporter();
      serializer.wasm = {
        absolute: true,
        path: WASM_PATH,
      };

      console.log(`[FileManager] Loading file: ${file.name}, size: ${file.size} bytes`);
      
      const ifcBuffer = await file.arrayBuffer();
      const typedArray = new Uint8Array(ifcBuffer);
      console.log(`[FileManager] Converting IFC to Fragments...`);

      const fragmentsBytes = await serializer.process({ bytes: typedArray });
      console.log(`[FileManager] Fragments bytes generated: ${fragmentsBytes.byteLength} bytes`);

      console.log(`[FileManager] Loading model into Fragments viewer...`);
      const model = await fragments.load(fragmentsBytes.buffer as ArrayBuffer, {
        modelId: node.id,
        camera: world.camera.three as any,
      });

      world.scene.three.add(model.object);
      await fragments.update(true);
      console.log(`[FileManager] Model added to scene`);

      // Extract metadata
      const metadata = await model.getMetadata();
      const categories = await model.getCategories();
      const itemsWithGeometry = await model.getItemsIdsWithGeometry();
      const totalElements = itemsWithGeometry.length;

      const elementCounts: Record<string, number> = {};
      for (const category of categories) {
        const itemsOfCategory = await model.getItemsOfCategories([new RegExp(`^${category}$`)]);
        const count = Object.values(itemsOfCategory).flat().length;
        if (count > 0) {
          elementCounts[category] = count;
        }
      }

      // Store model globally (single model only)
      if (!window.__fragmentsModels) {
        window.__fragmentsModels = {};
      }
      window.__fragmentsModels[node.id] = model;

      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: false,
        fileName: file.name,
        fileInfo: {
          fileName: file.name,
          fileType: 'ifc' as const,
          category: 'model' as const,
          size: file.size,
          loadedAt: new Date(),
          metadata: {
            schema: metadata?.schema || "IFC",
            project: { Name: metadata?.name || file.name },
            totalElements,
            elementCounts,
          },
        },
      });

      console.log(`[FileManager] Processing complete for node ${node.id}`);

      return {
        name: file.name,
        model,
      };
    } catch (error) {
      console.error(`Error processing file-manager node ${node.id}:`, error);
      
      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: false,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  private async clearExistingModels(fragments: any, world: any): Promise<void> {
    if (!window.__fragmentsModels) {
      return;
    }

    // Remove all existing models
    for (const [modelId, model] of Object.entries(window.__fragmentsModels)) {
      try {
        if (model && (model as any).object?.parent) {
          world.scene.three.remove((model as any).object);
        }
        (model as any).dispose?.();
      } catch (error) {
        console.warn(`Error removing model ${modelId}:`, error);
      }
    }

    // Clear the models registry
    window.__fragmentsModels = {};
    console.log('[FileManager] Cleared all existing models');
  }
}
