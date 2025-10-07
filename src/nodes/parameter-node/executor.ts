import type { NodeProcessor, ProcessorContext } from '@/src/lib/workflow-executor';

export class ParameterNodeProcessor implements NodeProcessor {
  async process(node: any, inputValues: any, context: ProcessorContext): Promise<any> {
    return node.data.properties?.value || "";
  }
}

