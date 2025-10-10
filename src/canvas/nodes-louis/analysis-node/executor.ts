import type { NodeProcessor, ProcessorContext } from '@/src/canvas/workflow-executor';
import { performAnalysis } from '@/src/canvas/nodes-louis/analysis-node/utils';
// DEPRECATED: These functions were removed from ifc-utils
// import { ... } from '@/src/lib/ifc-utils';

export class AnalysisNodeProcessor implements NodeProcessor {
  async process(node: any, inputValues: any, context: ProcessorContext): Promise<any> {
    console.log(`Processing analysis node ${node.id}`, { inputValues, node });

    if (!inputValues.input) {
      console.warn(`No input provided to analysis node ${node.id}. InputValues:`, inputValues);
      return {
        error: "No input",
        message: "Please connect an IFC node to analyze spaces"
      };
    }

    let sourceModel = null;

    if (inputValues.input && typeof inputValues.input === 'object') {
      if (inputValues.input.file && inputValues.input.elements) {
        sourceModel = inputValues.input;
      } else if (inputValues.input.model) {
        sourceModel = inputValues.input.model;
      } else if (Array.isArray(inputValues.input) && inputValues.input.length > 0 && inputValues.input[0]?.model) {
        sourceModel = inputValues.input[0].model;
      }
    }

    // NOTE: getLastLoadedModel() was removed - this node is deprecated
    // if (!sourceModel) {
    //   sourceModel = getLastLoadedModel();
    // }

    let elementsToAnalyze = inputValues.input;
    if (!Array.isArray(elementsToAnalyze)) {
      if (elementsToAnalyze.elements) {
        elementsToAnalyze = elementsToAnalyze.elements;
      } else {
        elementsToAnalyze = [];
      }
    }

    context.updateNodeData(node.id, {
      ...node.data,
      isLoading: true,
      error: null,
    });

    try {
      const onProgress = (message: string) => {
        const currentMessages = node.data.progressMessages || [];
        const updatedMessages = [...currentMessages, message].slice(-6);

        context.updateNodeData(node.id, {
          ...node.data,
          isLoading: true,
          progressMessages: updatedMessages,
          error: null,
        });
      };

      const result = await performAnalysis(
        elementsToAnalyze,
        [],
        "space",
        {
          metric: node.data.properties?.metric || "room_assignment",
          model: sourceModel,
        },
        onProgress
      );

      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: false,
        result: result,
        error: null,
        progressMessages: [],
      });

      return result;
    } catch (error) {
      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: false,
        result: null,
        error: error instanceof Error ? error.message : String(error),
        progressMessages: [],
      });
      return {
        error: error instanceof Error ? error.message : String(error),
        message: "Analysis failed"
      };
    }
  }
}

