import type { NodeMetadata } from "../../node-metadata";
import { FolderTree } from "lucide-react";
import { ProjectInfoNodeProcessor } from "./project-processor";
import { projectInfoLLMTools } from "./llm-tools";

export const projectInfoNodeMetadata: NodeMetadata = {
  type: "projectInfoNode",
  label: "Project Info",
  icon: FolderTree,
  status: "working",
  processor: new ProjectInfoNodeProcessor(),
  defaultData: {
    label: "Project Info",
  },
  llmTools: projectInfoLLMTools,
};

