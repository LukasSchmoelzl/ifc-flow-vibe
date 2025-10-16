import type { NodeProcessor, ProcessorContext } from "@/src/canvas/executor";

// Types
export interface SearchParams {
  query?: string;
  types?: string[];
  type?: string;
}

export interface SearchResult {
  name: string;
  expressID: number;
  type: string;
}

export interface SearchResponse {
  description: string;
  entities: SearchResult[];
}

export interface CountParams {
  types?: string[];
}

export interface CountResponse {
  description: string;
  counts: Record<string, number>;
}

// Processor
export class SearchNodeProcessor implements NodeProcessor {
  async process(node: any, inputValues: any, context: ProcessorContext): Promise<any> {
    console.log(`[SearchNode] Processing node ${node.id}`);
    console.log(`[SearchNode] Inputs:`, inputValues);

    const model = inputValues?.model;
    const parameter = inputValues?.parameter;

    const query = parameter?.query || inputValues?.query as string | undefined;
    const types = parameter?.types || inputValues?.types as string[] | undefined;

    try {
      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: true,
        error: null,
      });

      const results = await this.searchEntities({ query, types, model });

      console.log(`[SearchNode] Found ${results.length} entities`);

      const resultData = {
        searchResults: results,
        count: results.length,
        query: query || "",
        types: types || [],
        model: model
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

  private async searchEntities(params: {
    query?: string;
    types?: string[];
    model?: any;
  }) {
    let model = params.model;

    if (!model && (window as any).__fragmentsModels) {
      const models = Object.values((window as any).__fragmentsModels);
      model = models[0];
    }

    if (!model) {
      throw new Error('No model available for search');
    }

    const itemsData = await model.getItemsData();

    let filteredData = itemsData;

    if (params.types && params.types.length > 0) {
      filteredData = itemsData.filter((item: any) =>
        params.types!.includes(item.ObjectType)
      );
    }

    if (params.query) {
      const queryLower = params.query.toLowerCase();
      filteredData = filteredData.filter((item: any) =>
        item.Name?.toLowerCase().includes(queryLower) ||
        item.GlobalId?.toLowerCase().includes(queryLower)
      );
    }

    return filteredData.map((item: any) => ({
      name: item.Name || item.GlobalId || 'Unnamed',
      expressID: item.expressID,
      type: item.ObjectType
    }));
  }
}
