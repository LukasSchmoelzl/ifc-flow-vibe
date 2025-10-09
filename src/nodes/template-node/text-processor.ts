import type { NodeProcessor, ProcessorContext } from '@/src/lib/workflow-executor';

export class TemplateNodeProcessor implements NodeProcessor {
  async process(node: any, inputValues: any, context: ProcessorContext): Promise<any> {
    if (!inputValues.input) {
      console.warn(`No input provided to template node ${node.id}`);
      return null;
    }

    try {
      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: true,
        error: null,
      });

      console.log(`[Template Processor] Processing node ${node.id}`);
      console.log(`[Template Processor] Input:`, inputValues.input);

      const result = inputValues.input + " world";

      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: false,
        result,
      });

      console.log(`[Template Processor] Processing complete for node ${node.id}`);

      return result;
    } catch (error) {
      console.error(`Error processing template node ${node.id}:`, error);
      
      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: false,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }
}
