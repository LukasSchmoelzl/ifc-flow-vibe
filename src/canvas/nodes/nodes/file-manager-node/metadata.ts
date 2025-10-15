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
    description: `Load an IFC building model into the 3D viewer. Use this when user wants to load, open, or view an IFC file.

NODE INPUT:
- None (loads default bridge.ifc if no file provided)

NODE OUTPUT:
- name (string): File name
- fileName (string): File name
- totalElements (number): Total number of elements in the model
- schema (string): IFC schema version (e.g., "IFC4")
- projectName (string): Project name from metadata
- elementCounts (object): Element count per IFC type (e.g., {"IFCWALL": 45, "IFCDOOR": 12})

This node creates the foundation for all other BIM operations by loading the 3D model.`.trim(),
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

