import type { NodeMetadata } from "../types";
import { Eye } from "lucide-react";
import { AIVisibilityNodeProcessor } from "./ai-visibility-processor";

export const aiVisibilityNodeMetadata: NodeMetadata = {
  label: "AI Visibility",
  icon: Eye,
  processor: new AIVisibilityNodeProcessor(),
  inputInfo: [],
  outputInfo: [
    { id: "get_ai_highlight", label: "Get Highlight", apiCall: "get_ai_highlight" },
    { id: "set_ai_highlight", label: "Set Highlight", apiCall: "set_ai_highlight" },
    { id: "clear_ai_highlight", label: "Clear Highlight", apiCall: "clear_ai_highlight" },
    { id: "set_visible", label: "Set Visible", apiCall: "set_visible" },
    { id: "get_invisible", label: "Get Invisible", apiCall: "get_invisible" },
    { id: "set_invisible", label: "Set Invisible", apiCall: "set_invisible" }
  ],
  llmTools: [
    {
      name: "get_ai_highlight",
      description: `Get the currently AI-highlighted entities in the 3D viewer.

NODE INPUT:
- None

NODE OUTPUT:
- highlightedIds (number[]): Array of highlighted express IDs
- count (number): Number of highlighted entities

Use this to check what elements the AI has currently highlighted (magenta color).`.trim(),
      input_schema: {
        type: "object",
        properties: {},
        required: []
      }
    },
    {
      name: "set_ai_highlight",
      description: `Highlight/Color specific entities in the 3D viewer by their express IDs (magenta color).

NODE INPUT:
- expressIds (number[]): Array of express IDs to highlight

NODE OUTPUT:
- highlightedIds (number[]): Array of highlighted express IDs
- count (number): Number of highlighted entities

This creates an AI highlight (magenta), different from user selection (purple).
Use this to visually emphasize found/analyzed elements to the user.`.trim(),
      input_schema: {
        type: "object",
        properties: {
          expressIds: {
            type: "array",
            items: { type: "number" },
            description: "Array of express IDs to highlight"
          }
        },
        required: ["expressIds"]
      }
    },
    {
      name: "clear_ai_highlight",
      description: `Clear all AI highlights in the 3D viewer.

NODE INPUT:
- None

NODE OUTPUT:
- highlightedIds (number[]): Empty array []
- count (number): 0
- cleared (boolean): true

Use this to remove all AI highlights and restore normal view.`.trim(),
      input_schema: {
        type: "object",
        properties: {},
        required: []
      }
    },
    {
      name: "set_visible",
      description: `Make ONLY specific entities visible in the 3D viewer. All other entities will be hidden.

NODE INPUT:
- expressIds (number[]): Array of express IDs to keep visible

NODE OUTPUT:
- visibleIds (number[]): Array of visible express IDs
- count (number): Number of visible entities

Use this to isolate/focus on specific elements by hiding everything else.
Example: "show only walls" → search walls, then set_visible with those IDs.`.trim(),
      input_schema: {
        type: "object",
        properties: {
          expressIds: {
            type: "array",
            items: { type: "number" },
            description: "Array of express IDs to make visible"
          }
        },
        required: ["expressIds"]
      }
    },
    {
      name: "get_invisible",
      description: `Get the currently invisible entities in the 3D viewer.

NODE INPUT:
- None

NODE OUTPUT:
- invisibleIds (number[]): Array of invisible express IDs
- count (number): Number of invisible entities

Use this to check which elements are currently hidden.`.trim(),
      input_schema: {
        type: "object",
        properties: {},
        required: []
      }
    },
    {
      name: "set_invisible",
      description: `Make specific entities invisible in the 3D viewer. Other entities remain visible.

NODE INPUT:
- expressIds (number[]): Array of express IDs to hide

NODE OUTPUT:
- invisibleIds (number[]): Array of invisible express IDs (cumulative)
- count (number): Number of invisible entities

Use this to hide/remove specific elements from view.
Example: "hide all doors" → search doors, then set_invisible with those IDs.`.trim(),
      input_schema: {
        type: "object",
        properties: {
          expressIds: {
            type: "array",
            items: { type: "number" },
            description: "Array of express IDs to make invisible"
          }
        },
        required: ["expressIds"]
      }
    }
  ],
};