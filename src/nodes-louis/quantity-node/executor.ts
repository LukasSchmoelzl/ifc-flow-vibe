import type { NodeProcessor, ProcessorContext } from '@/src/lib/workflow-executor';
import { extractQuantities, type IfcModel } from '@/src/lib/ifc-utils';

export class QuantityNodeProcessor implements NodeProcessor {
  async process(node: any, inputValues: any, context: ProcessorContext): Promise<any> {
    const nodeId = node.id;

    if (!inputValues.input) {
      console.warn(`No input provided to quantity node ${nodeId}`);
      return {
        groups: { "Error": 0 },
        unit: "",
        total: 0,
        error: "No input data available"
      };
    }

    const modelInput = inputValues.input as IfcModel;

    if (!modelInput || !modelInput.elements || !modelInput.name) {
      console.error("Invalid input to quantityNode: Missing model, elements, or name.", modelInput);
      return {
        groups: { "Invalid Model": 0 },
        unit: "",
        total: 0,
        error: "Invalid input model"
      };
    }

    try {
      const quantityType = node.data.properties?.quantityType || "area";
      const groupBy = node.data.properties?.groupBy || "none";
      const ignoreUnknownRefs = node.data.properties?.ignoreUnknownRefs || false;

      context.updateNodeData(nodeId, {
        ...node.data,
        properties: {
          ...node.data.properties,
          quantityType,
          groupBy,
          ignoreUnknownRefs
        }
      });

      const result = await extractQuantities(
        modelInput,
        quantityType,
        groupBy,
        undefined,
        (messageId: string) => {
          context.updateNodeData(nodeId, {
            ...node.data,
            messageId: messageId,
            properties: {
              ...node.data.properties,
              quantityType,
              groupBy,
              ignoreUnknownRefs
            }
          });
          console.log(`Stored messageId ${messageId} for quantity node ${nodeId}`);
        },
        ignoreUnknownRefs
      );

      if (result && typeof result === 'object') {
        (result as any).groupBy = groupBy;
      }

      return result;
    } catch (error) {
      console.error(`Error during quantity extraction for node ${nodeId}:`, error);
      return {
        groups: { "Error": 0 },
        unit: "",
        total: 0,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}

