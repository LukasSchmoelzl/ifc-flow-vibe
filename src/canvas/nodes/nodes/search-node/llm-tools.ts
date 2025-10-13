import type { LLMTool } from "../../node-metadata";

export const searchLLMTools: LLMTool[] = [
  {
    name: "bim_search",
    description: "Search building elements by type and text. Returns matching entities.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Text to search in entity names and properties (optional)"
        },
        types: {
          type: "array",
          items: { type: "string" },
          description: "IFC types to filter (e.g., ['IFCWALL', 'IFCDOOR']). Leave empty for all types."
        }
      },
      required: []
    }
  },
  {
    name: "bim_count",
    description: "Count building elements by type.",
    input_schema: {
      type: "object",
      properties: {
        types: {
          type: "array",
          items: { type: "string" },
          description: "IFC types to count. Leave empty to count all types."
        }
      },
      required: []
    }
  }
];

