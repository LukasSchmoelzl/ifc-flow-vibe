import type { LLMTool } from "../../node-metadata";

export const aiVisibilityLLMTools: LLMTool[] = [
  {
    name: "get_ai_highlight",
    description: "Get the currently AI-highlighted entities in the 3D viewer.",
    input_schema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "set_ai_highlight",
    description: "Highlight/Color specific entities in the 3D viewer by their express IDs.",
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
    description: "Clear all AI highlights in the 3D viewer.",
    input_schema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "set_visible",
    description: "Make specific entities visible in the 3D viewer.",
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
    description: "Get the currently invisible entities in the 3D viewer.",
    input_schema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "set_invisible",
    description: "Make specific entities invisible in the 3D viewer.",
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
];

