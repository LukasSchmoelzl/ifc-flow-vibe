import type { NodeProcessor, ProcessorContext } from '@/src/lib/workflow-executor/types';
import { manageClassifications } from '@/src/lib/ifc-utils';

export class ClassificationNodeProcessor implements NodeProcessor {
  async process(node: any, inputValues: any, context: ProcessorContext): Promise<any> {
    if (!inputValues.input) {
      console.warn(`No input provided to classification node ${node.id}`);
      return [];
    }

    return manageClassifications(
      inputValues.input,
      node.data.properties?.system || "uniclass",
      node.data.properties?.action || "get",
      node.data.properties?.code || ""
    );
  }
}

