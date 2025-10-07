import type { NodeProcessor, ProcessorContext } from '../types';
import { filterElements } from '@/src/lib/ifc-utils';

export class FilterNodeProcessor implements NodeProcessor {
  async process(node: any, inputValues: any, context: ProcessorContext): Promise<any> {
    if (!inputValues.input) {
      console.warn(`No input provided to filter node ${node.id}`);
      return [];
    }

    const elementsToFilter = Array.isArray(inputValues.input)
      ? inputValues.input
      : inputValues.input.elements;

    return filterElements(
      elementsToFilter || [],
      node.data.properties?.property || "",
      node.data.properties?.operator || "equals",
      node.data.properties?.value || ""
    );
  }
}

