import type { NodeProcessor, ProcessorContext } from '@/src/lib/workflow-executor';
import { runPythonScript, getLastLoadedModel, type IfcModel } from '@/src/lib/ifc-utils';

export class PythonNodeProcessor implements NodeProcessor {
  async process(node: any, inputValues: any, context: ProcessorContext): Promise<any> {
    console.log("Processing pythonNode", { node, inputValues });

    let model: IfcModel | null = null;

    if (inputValues.input && inputValues.input.name && inputValues.input.elements) {
      model = inputValues.input as IfcModel;
    } else {
      model = getLastLoadedModel();
      console.log(`Python node using last loaded model: ${model?.name}`);
    }

    context.updateNodeData(node.id, {
      ...node.data,
      isLoading: true,
      progress: { percentage: 5, message: "Running Python..." },
      error: null,
    });

    try {
      const result = await runPythonScript(
        model || null,
        node.data.properties?.code || "# No code provided\nresult = None",
        (p, m) => {
          context.updateNodeData(node.id, {
            ...node.data,
            isLoading: true,
            progress: { percentage: p, message: m || "Processing" },
          });
        },
        inputValues.input,
        node.data.properties
      );

      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: false,
        progress: null,
        result,
      });

      return result;
    } catch (err) {
      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: false,
        progress: null,
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  }
}

