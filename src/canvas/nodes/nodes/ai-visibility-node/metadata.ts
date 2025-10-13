import type { NodeMetadata } from "../../node-metadata";
import { Eye } from "lucide-react";
import { AIVisibilityNodeProcessor } from "./visibility-processor";
import { aiVisibilityLLMTools } from "./llm-tools";

export const aiVisibilityNodeMetadata: NodeMetadata = {
  type: "aiVisibilityNode",
  label: "AI Visibility",
  icon: Eye,
  status: "working",
  processor: new AIVisibilityNodeProcessor(),
  defaultData: {
    label: "AI Visibility",
  },
  llmTools: aiVisibilityLLMTools,
};

