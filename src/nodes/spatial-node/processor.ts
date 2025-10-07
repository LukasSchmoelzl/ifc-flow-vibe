import type { NodeProcessor, ProcessorContext } from '@/src/lib/workflow-executor/types';
import { spatialQuery } from '@/src/lib/ifc-utils';

export class SpatialNodeProcessor implements NodeProcessor {
  async process(node: any, inputValues: any, context: ProcessorContext): Promise<any> {
    if (!inputValues.input) {
      console.warn(`No input provided to spatial node ${node.id}`);
      return [];
    }

    return spatialQuery(
      inputValues.input,
      inputValues.reference || [],
      node.data.properties?.queryType || "contained",
      Number.parseFloat(node.data.properties?.distance || 1.0)
    );
  }
}

