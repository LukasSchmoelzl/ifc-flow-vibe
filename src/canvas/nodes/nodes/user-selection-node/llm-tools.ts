import type { LLMTool } from "../../node-metadata";

export const userSelectionLLMTools: LLMTool[] = [
  {
    name: "get_user_selection",
    description: `Get limited info (ID, type, name) of user-selected entities.

NODE INPUT:
- None (uses current user selection from viewer)

NODE OUTPUT:
- selectedEntities (array): Array of {expressID: number, type: string, name: string}
- count (number): Number of selected entities
- types (object): Count per type (e.g., {"IFCWALL": 2, "IFCDOOR": 1})

Use this to retrieve what the user has currently selected in the 3D viewer.`.trim(),
    input_schema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "set_user_selection",
    description: `Select specific building elements by their express IDs. Highlights them in viewer (purple/indigo color) and updates selection info.

NODE INPUT:
- expressIds (number[]): Array of express IDs to select

NODE OUTPUT:
- selectedEntities (array): Array of {expressID: number, type: string, name: string}
- count (number): Number of selected entities
- expressIds (number[]): The selected express IDs

This creates a USER selection (purple highlight), different from AI highlights (magenta).
Use this when user says "select", "highlight", or "show me" specific elements.`.trim(),
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
    description: `Clear all currently selected elements. Removes user highlights and clears selection info.

NODE INPUT:
- None

NODE OUTPUT:
- selectedEntities (array): Empty array []
- count (number): 0
- cleared (boolean): true

Use this when user says "clear selection", "deselect all", or "remove highlights".`.trim(),
    input_schema: {
      type: "object",
      properties: {},
      required: []
    }
  }
];


