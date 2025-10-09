"use client";

import { FileText } from "lucide-react";
import { createNode } from "../base-node";
import { BaseNodeData } from "../node-types";

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
  (data) => (
    <div className="p-3 text-xs">
      <div className="text-muted-foreground">
        {data.result ? `Result: ${data.result}` : "Template Node - Ready"}
      </div>
    </div>
  )
);

TemplateNode.displayName = "TemplateNode";
