import { FolderOpen } from "lucide-react";
import { FileManagerNodeProcessor } from "./file-manager-processor";
import type { NodeMetadata } from "../../node-metadata";

export const fileManagerNodeMetadata: NodeMetadata = {
  type: "fileManagerNode",
  label: "File Manager",
  icon: FolderOpen,
  status: "working",
  processor: new FileManagerNodeProcessor(),
  defaultData: {
    label: "IFC Loader",
  },
  llmTools: [{
    name: "load_ifc_file",
    description: "Load an IFC building model into the 3D viewer. Use this when user wants to load, open, or view an IFC file.",
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

