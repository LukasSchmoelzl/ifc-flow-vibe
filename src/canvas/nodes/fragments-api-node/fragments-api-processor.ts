import type { NodeProcessor, ProcessorContext } from "@/src/canvas/executor";

export class fragmentsApiNodeProcessor implements NodeProcessor {
  async process(node: any, inputValues: any, context: ProcessorContext): Promise<any> {
    try {
      const model = inputValues?.model;
      
      if (!model) {
        throw new Error("No model provided to fragments API node");
      }

      const baseData = {
        timestamp: new Date().toISOString(),
        nodeId: node.id,
        nodeType: 'fragmentsApiNode',
        success: true
      };

      // Execute all API calls in parallel
      const [metadata, structure, categories, totalElements] = await Promise.all([
        model.getMetadata(),
        model.getSpatialStructure(),
        model.getCategories(),
        model.getMaxLocalId()
      ]);

      // Return data for each output handle separately
      return {
        // Output 1: get_metadata - Only metadata
        get_metadata: {
          ...baseData,
          metadata,
          description: 'Model metadata'
        },
        
        // Output 2: get_structure - Only structure
        get_structure: {
          ...baseData,
          structure,
          description: 'Spatial structure'
        },
        
        // Output 3: get_statistics - Only statistics
        get_statistics: {
          ...baseData,
          statistics: {
            totalElements,
            categories
          },
          description: 'Project statistics'
        }
      };

    } catch (error) {
      console.error(`❌ FragmentsAPI:`, error);
      throw new Error(`Failed to process fragments API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}