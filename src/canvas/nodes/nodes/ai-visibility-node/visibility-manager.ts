export class VisibilityManager {
  private highlightedIds: number[] = [];
  private invisibleIds: number[] = [];

  getHighlighted(): number[] {
    return this.highlightedIds;
  }

  getInvisible(): number[] {
    return this.invisibleIds;
  }

  async setHighlight(expressIds: number[]): Promise<void> {
    const model = (window as any).__fragmentsModels?.[0];
    const fragments = (window as any).__fragmentsViewer;

    if (!model) {
      console.warn('⚠️ [VisibilityManager] No model available');
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
      console.log('✅ [VisibilityManager] Highlighted:', expressIds);
    }

    this.highlightedIds = [...expressIds];

    if (fragments) {
      await fragments.update(true);
    }
  }

  clearHighlight(): void {
    const model = (window as any).__fragmentsModels?.[0];
    const fragments = (window as any).__fragmentsViewer;

    if (this.highlightedIds.length > 0 && model) {
      model.resetHighlight(this.highlightedIds);
    }

    this.highlightedIds = [];

    if (fragments) {
      fragments.update(true);
    }
  }

  async setVisible(expressIds: number[]): Promise<void> {
    const model = (window as any).__fragmentsModels?.[0];

    if (!model) {
      console.warn('⚠️ [VisibilityManager] No model available');
      return;
    }

    await model.setVisibility(expressIds, true);
    this.invisibleIds = this.invisibleIds.filter(id => !expressIds.includes(id));
  }

  async setInvisible(expressIds: number[]): Promise<void> {
    const model = (window as any).__fragmentsModels?.[0];

    if (!model) {
      console.warn('⚠️ [VisibilityManager] No model available');
      return;
    }

    await model.setVisibility(expressIds, false);
    this.invisibleIds = [...new Set([...this.invisibleIds, ...expressIds])];
  }
}


