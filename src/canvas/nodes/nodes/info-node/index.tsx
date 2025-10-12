"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Info } from "lucide-react";

interface InfoNodeData {
  label: string;
  displayData?: any;
}

const formatDisplayData = (data: any): string => {
  if (data === null || data === undefined) {
    return "No data";
  }

  if (typeof data === "string") {
    return data;
  }

  if (typeof data === "number" || typeof data === "boolean") {
    return String(data);
  }

  if (Array.isArray(data)) {
    return `Array[${data.length}]:\n${JSON.stringify(data, null, 2)}`;
  }

  if (typeof data === "object") {
    // Format object for display
    try {
      const formatted = JSON.stringify(data, null, 2);
      // Limit to first 1000 characters
      if (formatted.length > 1000) {
        return formatted.substring(0, 1000) + "\n... (truncated)";
      }
      return formatted;
    } catch (e) {
      return "[Object - cannot stringify]";
    }
  }

  return String(data);
};

export const InfoNode = memo(({ data, isConnectable }: NodeProps<InfoNodeData>) => {
  const displayText = formatDisplayData(data.displayData);

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-green-500 dark:border-green-400 rounded-md shadow-md w-80 max-w-md">
      {/* Header */}
      <div className="bg-green-500 text-white px-3 py-1 flex items-center gap-2">
        <Info className="h-4 w-4 flex-shrink-0" />
        <div className="text-sm font-medium truncate" title={data.label}>
          {data.label}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-2 max-h-96 overflow-auto">
          <pre className="text-xs font-mono whitespace-pre-wrap break-words text-gray-800 dark:text-gray-200">
            {displayText}
          </pre>
        </div>
      </div>

      {/* Input Handle (left side only) */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        style={{ background: "#555", width: 8, height: 8 }}
        isConnectable={isConnectable}
      />
    </div>
  );
});

InfoNode.displayName = "InfoNode";
