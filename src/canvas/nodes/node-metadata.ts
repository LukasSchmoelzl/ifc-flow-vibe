import type { LucideIcon } from "lucide-react";
import type { NodeProcessor } from "../workflow/executor";

export type NodeStatus = "working" | "wip" | "new";

export interface NodeMetadata {
  type: string;
  label: string;
  icon: LucideIcon;
  status: NodeStatus;
  processor: NodeProcessor;
  defaultData: Record<string, any>;
}

