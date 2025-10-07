import type { NodeProcessor, ProcessorContext } from '@/src/lib/workflow-executor';
import { queryRelationships } from '@/src/lib/ifc-utils';

export class RelationshipNodeProcessor implements NodeProcessor {
  async process(node: any, inputValues: any, context: ProcessorContext): Promise<any> {
    if (!inputValues.input) {
      console.warn(`No input provided to relationship node ${node.id}`);
      return [];
    }

    return queryRelationships(
      inputValues.input,
      node.data.properties?.relationType || "containment",
      node.data.properties?.direction || "outgoing"
    );
  }
}

