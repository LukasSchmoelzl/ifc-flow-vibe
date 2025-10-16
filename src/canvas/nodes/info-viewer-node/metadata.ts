import type { NodeMetadata } from "../types";
import { Eye } from "lucide-react";
import { InfoViewerNodeProcessor } from "./processor";

export const infoViewerNodeMetadata: NodeMetadata = {
  label: "Info Viewer",
  icon: Eye,
  processor: new InfoViewerNodeProcessor(),
  inputInfo: [
    { id: "project_data", label: "Project Data", dataType: "ProjectInfoData", apiCall: "any_project_output" }
  ],
  outputInfo: [],
  llmTools: [
    {
      name: "display_info",
      description: `Display project information from connected Project Info node outputs.
      
        INPUT/OUTPUT:
        - Input: Any of the 4 Project Info outputs (ModelInfo, ProjectInfo, ProjectStatistics, ProjectStructure)
        - Output: Formatted display of the received information

        Use this when user wants to view, display, or show project information in a readable format.`.trim(),
      input_schema: {
        type: "object",
        properties: {
          view_type: {
            type: "string",
            enum: ["model_info", "project_info", "statistics", "structure", "all"],
            description: "Type of information to display"
          }
        },
        required: ["view_type"]
      }
    }
  ]
};
