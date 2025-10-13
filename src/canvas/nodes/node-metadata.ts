import type { LucideIcon } from "lucide-react";
import type { NodeProcessor } from "../executor";

export type NodeStatus = "working" | "wip" | "new";

export interface LLMTool {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface NodeMetadata {
  type: string;
  label: string;
  icon: LucideIcon;
  status: NodeStatus;
  processor: NodeProcessor;
  defaultData: Record<string, any>;
  llmTools?: LLMTool[];
}

