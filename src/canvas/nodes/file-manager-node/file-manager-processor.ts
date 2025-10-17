import type { NodeProcessor, ProcessorContext } from '@/src/canvas/executor';
import * as FRAGS from "@thatopen/fragments";

const WASM_PATH = "https://unpkg.com/web-ifc@0.0.72/";
const DEFAULT_IFC_FILE = "/bridge.ifc";

export class FileManagerNodeProcessor implements NodeProcessor {
  async process(node: any, inputValues: any, context: ProcessorContext): Promise<any> {
    // Use provided file or load default bridge.ifc
    let file = node.data.file;
    let isDefaultFile = false;

    if (!file) {
      file = await this.loadDefaultFile();
      isDefaultFile = true;
    }

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
        throw new Error("fragments viewer not initialized");
      }

      const { fragments, world } = fragmentsViewer;

      await this.clearExistingModels(fragments, world);

      const serializer = new FRAGS.IfcImporter();
      serializer.wasm = {
        absolute: true,
        path: WASM_PATH,
      };
      
      const ifcBuffer = await file.arrayBuffer();
      const typedArray = new Uint8Array(ifcBuffer);
      const fragmentsBytes = await serializer.process({ bytes: typedArray });

      const model = await fragments.load(fragmentsBytes.buffer as ArrayBuffer, {
        modelId: node.id,
        camera: world.camera.three as any,
      });

      world.scene.three.add(model.object);
      await fragments.update(true);


      // Store model globally (single model only)
      if (!window.__fragmentsModels) {
        window.__fragmentsModels = {};
      }
      window.__fragmentsModels[node.id] = model;

      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: false,
        fileName: file.name,
        isDefaultFile,
      });

      return model;
    } catch (error) {
      console.error(`❌ FileManager:`, error);
      
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
        // Ignore cleanup errors
      }
    }

    window.__fragmentsModels = {};
  }

  private async loadDefaultFile(): Promise<File> {
    try {
      const response = await fetch(DEFAULT_IFC_FILE);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${DEFAULT_IFC_FILE}: ${response.status}`);
      }
      
      const blob = await response.blob();
      const file = new File([blob], "bridge.ifc", { type: "application/octet-stream" });
      
      return file;
    } catch (error) {
      throw new Error(`Failed to load default IFC file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
