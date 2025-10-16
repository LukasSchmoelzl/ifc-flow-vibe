import type { NodeMetadata } from "../types";
import { FolderOpen } from "lucide-react";
import { FileManagerNodeProcessor } from "./file-manager-processor";

export const fileManagerNodeMetadata: NodeMetadata = {
  label: "File Manager",
  icon: FolderOpen,
  processor: new FileManagerNodeProcessor(),
  inputInfo: [],
  outputInfo: [
    { id: "load_ifc_file", label: "fragments model", apiCall: "load_ifc_file" }
  ],
  llmTools: [{
    name: "load_ifc_file",
    description: "Load an IFC building model into the 3D viewer. Use this when user wants to load, open, or view an IFC file. This node creates the foundation for all other BIM operations by loading the 3D model.",
    input_schema: {
      type: "object",
      properties: {
        fileName: {
          type: "string",
          description: "Name of the IFC file (default: 'bridge.ifc')"
        }
      },
      required: []
    }
  }]
};

