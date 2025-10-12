import type { NodeProcessor, ProcessorContext } from '@/src/canvas/workflow/executor';

export class InfoNodeProcessor implements NodeProcessor {
  async process(node: any, inputValues: any, context: ProcessorContext): Promise<any> {
    const inputData = inputValues.input;

    // Update node data to display the input
    context.updateNodeData(node.id, {
      ...node.data,
      displayData: inputData,
    });

    // Info node has no output (terminal node)
    return null;
  }
}
