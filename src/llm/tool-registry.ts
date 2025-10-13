import { NODE_METADATA_MAP } from "@/src/canvas/nodes/auto-registry";

let cachedTools: any[] | null = null;
let toolToNodeTypeMap: Record<string, string> | null = null;

function buildToolRegistry() {
  if (cachedTools && toolToNodeTypeMap) {
    return { tools: cachedTools, map: toolToNodeTypeMap };
  }

  const tools: any[] = [];
  const map: Record<string, string> = {};
  
  Object.entries(NODE_METADATA_MAP).forEach(([nodeType, metadata]) => {
    if (metadata.llmTools) {
      metadata.llmTools.forEach(tool => {
        map[tool.name] = nodeType;
        tools.push({
          name: tool.name,
          description: tool.description,
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

