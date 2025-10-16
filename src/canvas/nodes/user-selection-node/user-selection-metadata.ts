import type { NodeMetadata } from "../types";
import { MousePointerClick } from "lucide-react";
import { UserSelectionNodeProcessor } from "./user-selection-processor";

export const userSelectionNodeMetadata: NodeMetadata = {
  label: "User Selection",
  icon: MousePointerClick,
  processor: new UserSelectionNodeProcessor(),
  inputInfo: [],
  outputInfo: [
    { id: "get_user_selection", label: "Get Selection", apiCall: "get_user_selection" },
    { id: "set_user_selection", label: "Set Selection", apiCall: "set_user_selection" },
    { id: "clear_user_selection", label: "Clear Selection", apiCall: "clear_user_selection" }
  ],
  llmTools: [
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
      description: `Select specific entities in the 3D viewer by their express IDs.

                  NODE INPUT:
                  - expressIds (number[]): Array of express IDs to select

                  NODE OUTPUT:
                  - selectedEntities (array): Array of {expressID: number, type: string, name: string}
                  - count (number): Number of selected entities
                  - expressIds (number[]): Array of selected express IDs
                  - types (object): Count per type

                  Use this to programmatically select entities in the 3D viewer.`.trim(),
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
      description: `Clear all user selections in the 3D viewer.

                  NODE INPUT:
                  - None

                  NODE OUTPUT:
                  - selectedEntities (array): Empty array []
                  - count (number): 0
                  - types (object): Empty object {}
                  - cleared (boolean): true

                  Use this to deselect all currently selected entities.`.trim(),
      input_schema: {
        type: "object",
        properties: {},
        required: []
      }
    }
  ],
};