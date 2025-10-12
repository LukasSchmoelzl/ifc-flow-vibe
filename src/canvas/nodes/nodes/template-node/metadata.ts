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
};

