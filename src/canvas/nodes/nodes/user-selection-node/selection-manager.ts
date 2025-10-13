const SAFE_EXTRACT_VALUE = (obj: any, fallback: string = ''): string => {
  if (!obj) return fallback;
  if (typeof obj === 'string') return obj;
  if (obj.value !== undefined) return String(obj.value);
  return String(obj);
};

export class SelectionManager {
  private selectedEntities: any[] = [];
  private previousHighlightedIds: number[] = [];

  getSelectedEntities(): any[] {
    return this.selectedEntities;
  }

  async selectEntities(expressIds: number[]): Promise<void> {
    const model = (window as any).__fragmentsModels?.[0];
    const fragments = (window as any).__fragmentsViewer;

    if (!model) {
      console.warn('⚠️ [SelectionManager] No model available for highlighting');
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
      console.log('✅ [SelectionManager] Highlighted:', expressIds);
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

  async clear(): Promise<void> {
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
}

