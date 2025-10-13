// TODO: Replace [NAME] with your node name in PascalCase
// TODO: Replace [name] with your node name in camelCase
// TODO: Implement your business logic

import type { NodeProcessor, ProcessorContext } from "@/src/canvas/executor";
// import { [NAME]Manager } from "./[name]-manager"; // Uncomment if using manager

export class [NAME]NodeProcessor implements NodeProcessor {
  // private manager = new [NAME]Manager(); // Uncomment if using manager

  async process(node: any, inputValues: any, context: ProcessorContext): Promise<any> {
    console.log(`[[NAME]Node] Processing node ${node.id}`);
    console.log(`[[NAME]Node] Inputs:`, inputValues);

    // TODO: Extract input values
    const input1 = inputValues?.input1 as string | undefined;
    const input2 = inputValues?.input2 as number | undefined;

    try {
      // 1. Set loading state
      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: true,
        error: null,
      });

      // 2. Validate inputs
      if (!input1) {
        throw new Error("Input1 is required");
      }

      // 3. Execute business logic
      // TODO: Implement your logic here
      const result = {
        output1: `Processed: ${input1}`,
        output2: (input2 || 0) * 2,
      };

      console.log(`[[NAME]Node] Processing complete`);

      // 4. Update node with results
      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: false,
        ...result,
      });

      // 5. Return result for next nodes
      return result;
      
    } catch (error) {
      console.error(`[[NAME]Node] Error:`, error);
      
      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: false,
        error: error instanceof Error ? error.message : String(error),
      });
      
      throw error;
    }
  }
}

