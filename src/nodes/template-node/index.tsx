"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { FileText } from "lucide-react";
import { NodeLoadingIndicator } from "../node-loading-indicator";
import { BaseNodeData } from "../node-types";
import { TemplateNodeUI } from "./ui";

interface TemplateNodeData extends BaseNodeData {
  isLoading?: boolean;
  error?: string | null;
  result?: any;
}

export const TemplateNode = memo(({ data, isConnectable }: NodeProps<TemplateNodeData>) => {
  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-400 rounded-md shadow-md min-w-[200px]">
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        style={{ background: "#555", width: 8, height: 8 }}
        isConnectable={isConnectable}
      />

      <div className="bg-blue-500 text-white px-3 py-2 flex items-center gap-2">
        <FileText className="w-4 h-4" />
        <div className="text-sm font-medium truncate">{data.label}</div>
      </div>

      <NodeLoadingIndicator
        isLoading={data.isLoading || false}
        message="Processing template..."
      />

      {!data.isLoading && data.error && (
        <div className="p-3 text-xs text-red-500 break-words">
          Error: {data.error}
        </div>
      )}

      {!data.isLoading && !data.error && <TemplateNodeUI data={data} />}

      <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={{ background: "#555", width: 8, height: 8 }}
        isConnectable={isConnectable}
      />
    </div>
  );
});

TemplateNode.displayName = "TemplateNode";

