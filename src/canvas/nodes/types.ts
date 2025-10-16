import type { LucideIcon } from "lucide-react";
import type { NodeProcessor } from "@/src/canvas/executor";

export interface LLMTool {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface HandleInfo {
  id: string;
  label: string;
  dataType?: string;
  apiCall?: string;
}

export interface NodeMetadata {
  label: string;
  icon: LucideIcon;
  processor: NodeProcessor;
  llmTools?: LLMTool[];
  inputInfo?: HandleInfo[];
  outputInfo?: HandleInfo[];
}
