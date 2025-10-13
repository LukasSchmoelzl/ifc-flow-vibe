import type { NodeProcessor, ProcessorContext } from '@/src/canvas/workflow/executor';

export class InfoNodeProcessor implements NodeProcessor {
  async process(node: any, inputValues: any, context: ProcessorContext): Promise<any> {
    const inputData = inputValues.input;

    context.updateNodeData(node.id, {
      ...node.data,
      displayData: inputData,
    });

    return {
      displayed: true,
      modelName: inputData?.name || 'unknown',
    };
  }
}
