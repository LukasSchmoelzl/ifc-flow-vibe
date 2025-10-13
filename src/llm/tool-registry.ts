import { NODE_METADATA_MAP } from "@/src/canvas/nodes/auto-registry";

const TOOL_TO_NODE_TYPE_MAP: Record<string, string> = {};

export function getAllLLMTools() {
  const tools: any[] = [];
  
  Object.entries(NODE_METADATA_MAP).forEach(([nodeType, metadata]) => {
    if (metadata.llmTools) {
      metadata.llmTools.forEach(tool => {
        TOOL_TO_NODE_TYPE_MAP[tool.name] = nodeType;
        tools.push({
          name: tool.name,
          description: tool.description,
          input_schema: tool.input_schema,
        });
      });
    }
  });
  
  return tools;
}

export function getNodeTypeForTool(toolName: string): string | null {
  return TOOL_TO_NODE_TYPE_MAP[toolName] || null;
}

