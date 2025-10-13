import type { NodeProcessor, ProcessorContext } from "@/src/canvas/executor";
import { SearchManager } from "./search-manager";

export class SearchNodeProcessor implements NodeProcessor {
  private searchManager = new SearchManager();

  async process(node: any, inputValues: any, context: ProcessorContext): Promise<any> {
    console.log(`[SearchNode] Processing node ${node.id}`);
    console.log(`[SearchNode] Inputs:`, inputValues);

    const query = inputValues?.query as string | undefined;
    const types = inputValues?.types as string[] | undefined;

    try {
      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: true,
        error: null,
      });

      const results = await this.searchManager.search({ query, types });
      
      console.log(`[SearchNode] Found ${results.length} entities`);

      const resultData = {
        searchResults: results,
        count: results.length,
        query: query || "",
        types: types || []
      };

      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: false,
        ...resultData,
      });

      return resultData;
    } catch (error) {
      console.error(`[SearchNode] Error:`, error);
      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: false,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}

