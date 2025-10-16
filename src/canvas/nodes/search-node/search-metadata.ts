import type { NodeMetadata } from "../types";
import { Search } from "lucide-react";
import { SearchNodeProcessor } from "./search-processor";

export const searchNodeMetadata: NodeMetadata = {
  label: "Search",
  icon: Search,
  processor: new SearchNodeProcessor(),
  inputInfo: [
    { id: "model", label: "Model" },
    { id: "parameter", label: "Search Parameters" }
  ],
  outputInfo: [
    { id: "bim_search", label: "Search Results", apiCall: "bim_search" }
  ],
  llmTools: [
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
            description: "Text to search in entity names and properties"
          },
          types: {
            type: "array",
            items: { type: "string" },
            description: "IFC types to filter (e.g., ['IFCWALL', 'IFCDOOR'])"
          }
        },
        required: []
      }
    }
  ],
};