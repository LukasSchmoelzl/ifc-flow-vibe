import type { NodeProcessor, ProcessorContext } from "@/src/canvas/executor";
import { ProjectManager } from "./project-manager";

export class ProjectInfoNodeProcessor implements NodeProcessor {
  private projectManager = new ProjectManager();

  async process(node: any, inputValues: any, context: ProcessorContext): Promise<any> {
    console.log(`[ProjectInfoNode] Processing node ${node.id}`);
    console.log(`[ProjectInfoNode] Inputs:`, inputValues);

    const model = (window as any).__fragmentsModels?.[0] || inputValues?.model;

    if (!model) {
      throw new Error("No model available for project info extraction");
    }

    try {
      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: true,
        error: null,
      });

      const metadata = await this.projectManager.getMetadata(model);
      const statistics = await this.projectManager.getStatistics(model);
      const structure = await this.projectManager.getStructure(model);

      console.log(`[ProjectInfoNode] Extracted project info`);

      const resultData = {
        metadata,
        statistics,
        structure,
        projectName: metadata.name,
        totalElements: statistics.totalElements,
      };

      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: false,
        ...resultData,
      });

      return resultData;
    } catch (error) {
      console.error(`[ProjectInfoNode] Error:`, error);
      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: false,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}

