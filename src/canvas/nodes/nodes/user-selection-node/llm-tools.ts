import type { LLMTool } from "../../node-metadata";

export const userSelectionLLMTools: LLMTool[] = [
  {
    name: "get_user_selection",
    description: "Get limited info (ID, type, name) of user-selected entities.",
    input_schema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "set_user_selection",
    description: "Select specific building elements by their express IDs. Highlights them in viewer and updates selection info.",
    input_schema: {
      type: "object",
      properties: {
        expressIds: {
          type: "array",
          items: { type: "number" },
          description: "Array of express IDs to select"
        }
      },
      required: ["expressIds"]
    }
  },
  {
    name: "clear_user_selection",
    description: "Clear all currently selected elements. Removes highlights and clears selection info.",
    input_schema: {
      type: "object",
      properties: {},
      required: []
    }
  }
];


