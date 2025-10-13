import { FileText } from "lucide-react";
import { TemplateNodeProcessor } from "./text-processor";
import type { NodeMetadata } from "../../node-metadata";

export const templateNodeMetadata: NodeMetadata = {
  type: "templateNode",
  label: "Template",
  icon: FileText,
  status: "working",
  processor: new TemplateNodeProcessor(),
  defaultData: {
    label: "Template",
  },
  llmTools: [{
    name: "process_text",
    description: "Process text by appending ' world' to it. Use for text transformation demonstrations.",
    input_schema: {
      type: "object",
      properties: {
        input: { 
          type: "string", 
          description: "Input text to process" 
        }
      },
      required: ["input"]
    }
  }]
};

