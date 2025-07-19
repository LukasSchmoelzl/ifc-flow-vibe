"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Terminal } from "lucide-react";
import { PythonNodeData } from "./node-types";

export const PythonNode = memo(({ data, isConnectable }: NodeProps<PythonNodeData>) => {
  const snippet = (data.properties?.code || "").split("\n")[0] || "No code";
  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-amber-500 dark:border-amber-400 rounded-md w-48 shadow-md">
      <div className="bg-amber-500 text-white px-3 py-1 flex items-center gap-2">
        <Terminal className="h-4 w-4" />
        <div className="text-sm font-medium truncate">{data.label}</div>
      </div>
      <div className="p-3 text-xs">
        <pre className="whitespace-pre-wrap break-words">{snippet}</pre>
      </div>
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        style={{ background: "#555", width: 8, height: 8 }}
        isConnectable={isConnectable}
      />
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

PythonNode.displayName = "PythonNode";
