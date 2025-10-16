import { NODE_REGISTRY } from "@/src/canvas/nodes/auto-registry";

let cachedTools: any[] | null = null;
let toolToNodeTypeMap: Record<string, string> | null = null;

function buildToolRegistry() {
  if (cachedTools && toolToNodeTypeMap) {
    return { tools: cachedTools, map: toolToNodeTypeMap };
  }

  const tools: any[] = [];
  const map: Record<string, string> = {};

  Object.entries(NODE_REGISTRY).forEach(([nodeType, { metadata }]) => {
    if (metadata.llmTools) {
      metadata.llmTools.forEach(tool => {
        map[tool.name] = nodeType;

        // Use description as-is
        const enhancedDescription = tool.description;

        tools.push({
          name: tool.name,
          description: enhancedDescription,
          input_schema: tool.input_schema,
        });
      });
    }
  });

  cachedTools = tools;
  toolToNodeTypeMap = map;

  return { tools, map };
}

export function getAllLLMTools() {
  return buildToolRegistry().tools;
}

export function getNodeTypeForTool(toolName: string): string | null {
  return buildToolRegistry().map[toolName] || null;
}

