import type { NodeProcessor, ProcessorContext } from '@/src/canvas/workflow-executor';
// DEPRECATED: These functions were removed from ifc-utils
// import { manageClassifications } from '@/src/lib/ifc-utils';

export class ClassificationNodeProcessor implements NodeProcessor {
  async process(node: any, inputValues: any, context: ProcessorContext): Promise<any> {
    if (!inputValues.input) {
      console.warn(`No input provided to classification node ${node.id}`);
      return [];
    }

    // DEPRECATED: manageClassifications was removed from ifc-utils
    console.warn('ClassificationNodeProcessor: manageClassifications function is no longer available');
    return inputValues.input;
  }
}

