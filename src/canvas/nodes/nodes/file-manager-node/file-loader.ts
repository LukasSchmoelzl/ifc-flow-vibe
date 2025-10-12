import type { NodeProcessor, ProcessorContext } from '@/src/canvas/workflow/executor';
import * as FRAGS from "@thatopen/fragments";
import { validateFile, getFileType, getFileCategory, generateModelId, ensureArrayBuffer, convertIfcToFragment } from './file-utils';
import type { LoadedFileInfo } from './types';

const WASM_PATH = "https://unpkg.com/web-ifc@0.0.72/";

export class FileManagerNodeProcessor implements NodeProcessor {
  async process(node: any, inputValues: any, context: ProcessorContext): Promise<any> {
    if (!node.data.file) {
      console.warn(`No file provided to file-manager node ${node.id}`);
      return null;
    }

    const file = node.data.file;

    // Validate file
    if (!validateFile(file)) {
      throw new Error(`Unsupported file type: ${file.name}. Only .ifc, .frag, and .ids are supported.`);
    }

    try {
      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: true,
        error: null,
      });

      console.log(`[FileManager Processor] Loading file: ${file.name}`);

      const fileType = getFileType(file.name);
      const category = getFileCategory(fileType);
      const bytes = await file.arrayBuffer();

      let result: LoadedFileInfo | null = null;

      if (category === 'model') {
        result = await this.loadModel(node, bytes, file.name, fileType, context);
      } else if (category === 'specification') {
        result = await this.loadSpecification(bytes, file.name, fileType);
      }

      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: false,
        fileInfo: result,
      });

      console.log(`[FileManager Processor] Processing complete for node ${node.id}`);
      
      return result;
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

  private async loadModel(
    node: any,
    bytes: ArrayBuffer,
    filename: string,
    fileType: string,
    context: ProcessorContext
  ): Promise<LoadedFileInfo> {
    const modelId = generateModelId(filename);
    let finalBytes = bytes;
    let finalFilename = filename;

    // Convert IFC to Fragment if needed
    if (fileType === 'ifc') {
      finalBytes = await convertIfcToFragment(bytes);
      finalFilename = filename.replace('.ifc', '.frag');
    }

    // Load into Fragments viewer
    const viewer = window.__fragmentsViewer;
    if (!viewer) {
      throw new Error('Fragments viewer not initialized');
    }

    const arrayBuffer = ensureArrayBuffer(finalBytes);
    const camera = viewer.world.camera.three as any;
    const model = await viewer.fragments.load(arrayBuffer, {
      modelId: modelId,
      camera,
      raw: true,
    });

    viewer.world.scene.three.add(model.object);
    await viewer.fragments.update(true);

    // Store model globally
    if (!window.__fragmentsModels) {
      window.__fragmentsModels = {};
    }
    window.__fragmentsModels[modelId] = model;

    const fileInfo: LoadedFileInfo = {
      fileName: filename,
      fileType: fileType as 'ifc' | 'frag' | 'ids',
      category: 'model',
      size: finalBytes.byteLength,
      metadata: {
        originalName: filename,
        mimeType: 'application/octet-stream',
        description: `BIM model loaded from ${filename}`,
        tags: ['bim', 'model', '3d'],
        modelId,
      },
      loadedAt: new Date(),
    };

    console.log(`✅ Model loaded: ${filename}`);
    return fileInfo;
  }

  private async loadSpecification(
    bytes: ArrayBuffer,
    filename: string,
    fileType: string
  ): Promise<LoadedFileInfo> {
    const content = new TextDecoder('utf-8').decode(bytes);

    const fileInfo: LoadedFileInfo = {
      fileName: filename,
      fileType: fileType as 'ifc' | 'frag' | 'ids',
      category: 'specification',
      size: bytes.byteLength,
      metadata: {
        originalName: filename,
        mimeType: 'application/xml',
        description: `IDS specification loaded from ${filename}`,
        tags: ['ids', 'specification'],
      },
      loadedAt: new Date(),
    };

    console.log(`✅ Specification loaded: ${filename}`);
    return fileInfo;
  }
}

