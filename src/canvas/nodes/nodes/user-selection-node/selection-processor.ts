import type { NodeProcessor, ProcessorContext } from "@/src/canvas/executor";
import { SelectionManager } from "./selection-manager";

export class UserSelectionNodeProcessor implements NodeProcessor {
  private selectionManager = new SelectionManager();

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
        const selectedEntities = this.selectionManager.getSelectedEntities();
        resultData = {
          selectedEntities,
          count: selectedEntities.length,
        };
      } else if (action === 'clear') {
        await this.selectionManager.clear();
        resultData = {
          selectedEntities: [],
          count: 0,
          cleared: true,
        };
      } else if (expressIds && expressIds.length > 0) {
        await this.selectionManager.selectEntities(expressIds);
        const selectedEntities = this.selectionManager.getSelectedEntities();
        
        resultData = {
          selectedEntities,
          count: expressIds.length,
          expressIds,
        };
      } else {
        resultData = {
          selectedEntities: this.selectionManager.getSelectedEntities(),
          count: this.selectionManager.getSelectedEntities().length,
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
}

