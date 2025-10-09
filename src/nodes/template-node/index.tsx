"use client";

import { FileText } from "lucide-react";
import { createNode } from "../base-node";
import { BaseNodeData } from "../node-types";
import { TemplateNodeUI } from "./ui";

interface TemplateNodeData extends BaseNodeData {
  isLoading?: boolean;
  error?: string | null;
  result?: any;
}

export const TemplateNode = createNode<TemplateNodeData>(
  {
    icon: FileText,
    color: "blue",
    loadingMessage: "Processing template...",
  },
  (data, nodeProps) => <TemplateNodeUI data={data} nodeProps={nodeProps} />
);

TemplateNode.displayName = "TemplateNode";

