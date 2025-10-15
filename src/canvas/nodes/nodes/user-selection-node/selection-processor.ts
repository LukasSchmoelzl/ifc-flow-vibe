import type { NodeProcessor, ProcessorContext } from "@/src/canvas/executor";

const SAFE_EXTRACT_VALUE = (obj: any, fallback: string = ''): string => {
  if (!obj) return fallback;
  if (typeof obj === 'string') return obj;
  if (obj.value !== undefined) return String(obj.value);
  return String(obj);
};

export class UserSelectionNodeProcessor implements NodeProcessor {
  private selectedEntities: any[] = [];
  private previousHighlightedIds: number[] = [];

  async process(node: any, inputValues: any, context: ProcessorContext): Promise<any> {
    console.log(`[UserSelectionNode] Processing node ${node.id}`);
    console.log(`[UserSelectionNode] Inputs:`, inputValues);

    const expressIds = inputValues?.expressIds as number[] | undefined;
    const action = inputValues?.action as string | undefined;

    try {
      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: true,
        error: null,
      });

      let resultData: any;

      if (action === 'get') {
        const types = this.calculateTypesCount(this.selectedEntities);
        resultData = {
          selectedEntities: this.selectedEntities,
          count: this.selectedEntities.length,
          types,
        };
      } else if (action === 'clear') {
        await this.clearSelection();
        resultData = {
          selectedEntities: [],
          count: 0,
          types: {},
          cleared: true,
        };
      } else if (expressIds && expressIds.length > 0) {
        await this.selectEntities(expressIds);
        const types = this.calculateTypesCount(this.selectedEntities);
        
        resultData = {
          selectedEntities: this.selectedEntities,
          count: expressIds.length,
          expressIds,
          types,
        };
      } else {
        const types = this.calculateTypesCount(this.selectedEntities);
        resultData = {
          selectedEntities: this.selectedEntities,
          count: this.selectedEntities.length,
          types,
        };
      }

      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: false,
        ...resultData,
      });

      return resultData;
    } catch (error) {
      console.error(`[UserSelectionNode] Error:`, error);
      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: false,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private async selectEntities(expressIds: number[]): Promise<void> {
    const model = (window as any).__fragmentsModels?.[0];
    const fragments = (window as any).__fragmentsViewer;

    if (!model) {
      console.warn('⚠️ [UserSelectionNode] No model available for highlighting');
      return;
    }

    if (this.previousHighlightedIds.length > 0) {
      await model.resetHighlight(this.previousHighlightedIds);
    }

    if (expressIds.length > 0) {
      const THREE = await import('three');
      const highlightMaterial = {
        color: new THREE.Color('#6366f1'),
        opacity: 0.6,
        transparent: true
      };
      await model.highlight(expressIds, highlightMaterial);
      console.log('✅ [UserSelectionNode] Highlighted:', expressIds);
    }

    this.previousHighlightedIds = [...expressIds];

    if (fragments) {
      await fragments.update(true);
    }

    if (model && expressIds.length > 0) {
      try {
        const itemsData = await model.getItemsData(expressIds, {
          attributesDefault: true
        });

        this.selectedEntities = expressIds.map((id, index) => {
          const itemData = itemsData[index];
          return {
            expressID: id,
            type: SAFE_EXTRACT_VALUE(itemData?.ObjectType) || SAFE_EXTRACT_VALUE(itemData?.type),
            name: SAFE_EXTRACT_VALUE(itemData?.Name) || SAFE_EXTRACT_VALUE(itemData?.GlobalId) || `Entity ${id}`
          };
        });
      } catch (error) {
        this.selectedEntities = expressIds.map(id => ({
          expressID: id,
          type: null,
          name: `Entity ${id}`
        }));
      }
    } else {
      this.selectedEntities = expressIds.map(id => ({
        expressID: id,
        type: null,
        name: `Entity ${id}`
      }));
    }
  }

  private async clearSelection(): Promise<void> {
    const model = (window as any).__fragmentsModels?.[0];
    const fragments = (window as any).__fragmentsViewer;

    if (this.previousHighlightedIds.length > 0 && model) {
      await model.resetHighlight(this.previousHighlightedIds);
    }

    this.previousHighlightedIds = [];
    this.selectedEntities = [];

    if (fragments) {
      await fragments.update(true);
    }
  }

  private calculateTypesCount(selectedEntities: any[]): Record<string, number> {
    const types: Record<string, number> = {};
    for (const entity of selectedEntities) {
      const type = entity.type || 'UNKNOWN';
      types[type] = (types[type] || 0) + 1;
    }
    return types;
  }
}