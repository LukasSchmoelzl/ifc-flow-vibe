// Processor registry for all node types
import type { NodeProcessor, ProcessorContext } from '../types';
import { IfcNodeProcessor } from '@/src/nodes/ifc-node/processor';
import { FilterNodeProcessor } from '@/src/nodes/filter-node/processor';
import { ParameterNodeProcessor } from '@/src/nodes/parameter-node/processor';
import { GeometryNodeProcessor } from '@/src/nodes/geometry-node/processor';

export const NODE_PROCESSORS: Record<string, NodeProcessor> = {
  ifcNode: new IfcNodeProcessor(),
  filterNode: new FilterNodeProcessor(),
  parameterNode: new ParameterNodeProcessor(),
  geometryNode: new GeometryNodeProcessor(),
};

export async function processNodeByType(
  nodeType: string,
  node: any,
  inputValues: any,
  context: ProcessorContext
): Promise<any> {
  const processor = NODE_PROCESSORS[nodeType];
  
  if (processor) {
    return await processor.process(node, inputValues, context);
  }
  
  // Fallback for nodes not yet migrated - will be removed gradually
  console.warn(`No processor found for node type: ${nodeType}`);
  return null;
}

