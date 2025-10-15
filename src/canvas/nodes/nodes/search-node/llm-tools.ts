import type { LLMTool } from "../../node-metadata";

export const searchLLMTools: LLMTool[] = [
  {
    name: "bim_search",
    description: `Search building elements by type and text. Returns matching entities.

NODE INPUT:
- query (string, optional): Text to search in entity names and properties
- types (string[], optional): IFC types to filter (e.g., ['IFCWALL', 'IFCDOOR'])

NODE OUTPUT:
- searchResults (array): Array of {name: string, expressID: number, type: string}
- count (number): Number of found entities
- query (string): Used search query
- types (string[]): Used type filters

Use this when user asks to find, search, locate, or filter building elements by name or type.`.trim(),
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
  }
];


