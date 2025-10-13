import type { NodeProcessor, ProcessorContext } from "@/src/canvas/executor";
import { VisibilityManager } from "./visibility-manager";

export class AIVisibilityNodeProcessor implements NodeProcessor {
  private visibilityManager = new VisibilityManager();

  async process(node: any, inputValues: any, context: ProcessorContext): Promise<any> {
    console.log(`[AIVisibilityNode] Processing node ${node.id}`);
    console.log(`[AIVisibilityNode] Inputs:`, inputValues);

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
        const highlightedIds = this.visibilityManager.getHighlighted();
        resultData.highlightedIds = highlightedIds;
        resultData.count = highlightedIds.length;
      } else if (action === 'clear_highlight') {
        this.visibilityManager.clearHighlight();
        resultData.highlightedIds = [];
        resultData.count = 0;
        resultData.cleared = true;
      } else if (action === 'get_invisible') {
        const invisibleIds = this.visibilityManager.getInvisible();
        resultData.invisibleIds = invisibleIds;
        resultData.count = invisibleIds.length;
      } else if (action === 'set_visible' && expressIds) {
        await this.visibilityManager.setVisible(expressIds);
        resultData.visibleIds = expressIds;
        resultData.count = expressIds.length;
      } else if (action === 'set_invisible' && expressIds) {
        await this.visibilityManager.setInvisible(expressIds);
        resultData.invisibleIds = expressIds;
        resultData.count = expressIds.length;
      } else if (expressIds && expressIds.length > 0) {
        await this.visibilityManager.setHighlight(expressIds);
        resultData.highlightedIds = expressIds;
        resultData.count = expressIds.length;
      } else {
        resultData.highlightedIds = this.visibilityManager.getHighlighted();
        resultData.invisibleIds = this.visibilityManager.getInvisible();
      }

      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: false,
        ...resultData,
      });

      return resultData;
    } catch (error) {
      console.error(`[AIVisibilityNode] Error:`, error);
      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: false,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}

