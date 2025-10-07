import type { NodeProcessor, ProcessorContext } from '@/src/lib/workflow-executor';
import { exportData, downloadExportedFile } from '@/src/lib/ifc-utils';
import { checkIfInputHasGeometry } from '@/src/lib/workflow-executor';

export class ExportNodeProcessor implements NodeProcessor {
  async process(node: any, inputValues: any, context: ProcessorContext): Promise<any> {
    if (!inputValues.input) {
      console.warn(`No input provided to export node ${node.id}`);
      return "";
    }

    let exportInput = inputValues.input;
    const exportFormat = node.data.properties?.format || "csv";
    const exportFileName = node.data.properties?.fileName || "export";

    console.log(`Export node: format=${exportFormat}, fileName=${exportFileName}`);

    if (exportFormat === "glb") {
      console.log("GLB export detected - checking if geometry extraction is needed");

      const hasGeometry = checkIfInputHasGeometry(exportInput);

      if (!hasGeometry) {
        console.log("No geometry found in input - extracting geometry for GLB export");

        try {
          const { GeometryNodeProcessor } = await import('@/src/nodes/geometry-node/processor');
          const geometryProcessor = new GeometryNodeProcessor();
          exportInput = await geometryProcessor.extractForGLBExport(exportInput);
          console.log("Geometry extracted for GLB export:", exportInput?.length || 0, "elements");
        } catch (error) {
          console.error("Failed to extract geometry for GLB export:", error);
        }
      }
    }

    const result = await exportData(exportInput, exportFormat, exportFileName);

    console.log(`Export result for format ${exportFormat}:`, typeof result,
      typeof result === 'string' ? result.length :
        result instanceof ArrayBuffer ? result.byteLength :
          result);

    if (result !== undefined && exportFormat.toLowerCase() !== "ifc") {
      downloadExportedFile(result, exportFormat, exportFileName);
    }

    return result;
  }
}

