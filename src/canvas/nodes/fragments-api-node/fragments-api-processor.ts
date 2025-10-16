import type { NodeProcessor, ProcessorContext } from "@/src/canvas/executor";

export class fragmentsApiNodeProcessor implements NodeProcessor {
  async process(node: any, inputValues: any, context: ProcessorContext): Promise<any> {
    console.log(`[fragmentsApiNode] Processing node ${node.id}`);
    console.log(`[fragmentsApiNode] Inputs:`, inputValues);

    try {
      // Get model from input
      const model = inputValues?.model;
      
      if (!model) {
        throw new Error("No model provided to fragments API node");
      }

      // Create result data object
      const resultData: any = {
        timestamp: new Date().toISOString(),
        nodeId: node.id,
        nodeType: 'fragmentsApiNode',
        success: true
      };

      // Execute all API calls in parallel for comprehensive data
      const [metadata, structure, categories, totalElements] = await Promise.all([
        model.getMetadata(),
        model.getSpatialStructure(),
        model.getCategories(),
        model.getMaxLocalId()
      ]);

      resultData.metadata = metadata;
      resultData.structure = structure;
      resultData.statistics = {
        totalElements,
        categories
      };
      resultData.description = 'All fragments data retrieved';

      console.log(`[fragmentsApiNode] Processing complete for node ${node.id}`);
      return resultData;

    } catch (error) {
      console.error(`[fragmentsApiNode] Error processing node ${node.id}:`, error);
      throw new Error(`Failed to process fragments API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}