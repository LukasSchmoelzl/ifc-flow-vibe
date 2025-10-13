import type { NodeMetadata } from "../../node-metadata";
import { MousePointerClick } from "lucide-react";
import { UserSelectionNodeProcessor } from "./selection-processor";
import { userSelectionLLMTools } from "./llm-tools";

export const userSelectionNodeMetadata: NodeMetadata = {
  type: "userSelectionNode",
  label: "User Selection",
  icon: MousePointerClick,
  status: "working",
  processor: new UserSelectionNodeProcessor(),
  defaultData: {
    label: "User Selection",
  },
  llmTools: userSelectionLLMTools,
};

