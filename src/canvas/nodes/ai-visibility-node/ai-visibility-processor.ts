import type { NodeProcessor, ProcessorContext } from "@/src/canvas/executor";

export class AIVisibilityNodeProcessor implements NodeProcessor {
  private highlightedIds: number[] = [];
  private invisibleIds: number[] = [];

  async process(node: any, inputValues: any, context: ProcessorContext): Promise<any> {

    const expressIds = inputValues?.expressIds as number[] | undefined;
    const action = inputValues?.action as string | undefined;

    try {
      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: true,
        error: null,
      });

      const resultData: Record<string, any> = {};

      if (action === 'get_highlight') {
        resultData.highlightedIds = this.highlightedIds;
        resultData.count = this.highlightedIds.length;
      } else if (action === 'clear_highlight') {
        await this.clearHighlight();
        resultData.highlightedIds = [];
        resultData.count = 0;
        resultData.cleared = true;
      } else if (action === 'get_invisible') {
        resultData.invisibleIds = this.invisibleIds;
        resultData.count = this.invisibleIds.length;
      } else if (action === 'set_visible' && expressIds) {
        await this.setVisible(expressIds);
        resultData.visibleIds = expressIds;
        resultData.count = expressIds.length;
      } else if (action === 'set_invisible' && expressIds) {
        await this.setInvisible(expressIds);
        resultData.invisibleIds = expressIds;
        resultData.count = expressIds.length;
      } else if (expressIds && expressIds.length > 0) {
        await this.setHighlight(expressIds);
        resultData.highlightedIds = expressIds;
        resultData.count = expressIds.length;
      } else {
        resultData.highlightedIds = this.highlightedIds;
        resultData.invisibleIds = this.invisibleIds;
      }

      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: false,
        ...resultData,
      });

      return resultData;
    } catch (error) {
      console.error(`❌ AIVisibility:`, error);
      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: false,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private async setHighlight(expressIds: number[]): Promise<void> {
    const model = (window as any).__fragmentsModels?.[0];
    const fragments = (window as any).__fragmentsViewer;

    if (!model) {
      return;
    }

    if (this.highlightedIds.length > 0) {
      await model.resetHighlight(this.highlightedIds);
    }

    if (expressIds.length > 0) {
      const THREE = await import('three');
      const highlightMaterial = {
        color: new THREE.Color('#22c55e'),
        opacity: 0.6,
        transparent: true
      };
      await model.highlight(expressIds, highlightMaterial);
    }

    this.highlightedIds = [...expressIds];

    if (fragments) {
      await fragments.update(true);
    }
  }

  private async clearHighlight(): Promise<void> {
    const model = (window as any).__fragmentsModels?.[0];
    const fragments = (window as any).__fragmentsViewer;

    if (this.highlightedIds.length > 0 && model) {
      await model.resetHighlight(this.highlightedIds);
    }

    this.highlightedIds = [];

    if (fragments) {
      await fragments.update(true);
    }
  }

  private async setVisible(expressIds: number[]): Promise<void> {
    const model = (window as any).__fragmentsModels?.[0];

    if (!model) {
      return;
    }

    await model.setVisibility(expressIds, true);
    this.invisibleIds = this.invisibleIds.filter(id => !expressIds.includes(id));
  }

  private async setInvisible(expressIds: number[]): Promise<void> {
    const model = (window as any).__fragmentsModels?.[0];

    if (!model) {
      return;
    }

    await model.setVisibility(expressIds, false);
    this.invisibleIds = [...new Set([...this.invisibleIds, ...expressIds])];
  }
}