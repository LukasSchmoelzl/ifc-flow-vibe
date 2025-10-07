import type { NodeProcessor, ProcessorContext } from '@/src/lib/workflow-executor/types';

export class DataTransformNodeProcessor implements NodeProcessor {
  async process(node: any, inputValues: any, context: ProcessorContext): Promise<any> {
    if (!inputValues.input) {
      console.log("No input provided to data transform node");
      return null;
    }

    try {
      const { executeTransformPipeline } = await import('@/src/nodes/data-transform-node/utils');

      const steps = node.data.properties?.steps || [];
      const restrictToIncomingElements = node.data.properties?.restrictToIncomingElements || false;

      const transformResult = executeTransformPipeline(steps, {
        input: inputValues.input,
        inputB: inputValues.inputB,
        restrictToIncomingElements,
      });

      const result = transformResult.data;

      node.data.preview = {
        inputCount: transformResult.metadata.inputCount,
        outputCount: transformResult.metadata.outputCount,
        sampleOutput: Array.isArray(result) ? result.slice(0, 3) :
          (result && typeof result === 'object' && result.mappings) ?
            Object.entries(result.mappings).slice(0, 3) : [],
        warnings: transformResult.metadata.warnings,
      };

      node.data.results = result;

      return result;
    } catch (error) {
      console.error("Data transform error:", error);
      node.data.preview = {
        inputCount: 0,
        outputCount: 0,
        sampleOutput: [],
        warnings: [`Transform failed: ${error instanceof Error ? error.message : String(error)}`],
      };
      return null;
    }
  }
}

