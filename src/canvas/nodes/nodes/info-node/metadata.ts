import { Info } from "lucide-react";
import { InfoNodeProcessor } from "./info-processor";
import type { NodeMetadata } from "../../node-metadata";

export const infoNodeMetadata: NodeMetadata = {
  type: "infoNode",
  label: "Info Display",
  icon: Info,
  status: "working",
  processor: new InfoNodeProcessor(),
  defaultData: {
    label: "Info",
    displayData: null,
  },
  llmTools: [{
    name: "show_model_info",
    description: "Display information about a loaded IFC model. Use this after loading a model to show its metadata.",
    input_schema: {
      type: "object",
      properties: {},
      required: []
    }
  }]
};

