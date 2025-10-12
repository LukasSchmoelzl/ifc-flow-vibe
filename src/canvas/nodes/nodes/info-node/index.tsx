"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Info } from "lucide-react";

interface InfoNodeData {
  label: string;
  displayData?: {
    name?: string;
    model?: any;
  };
}

const getDataType = (data: any): string => {
  if (data === null || data === undefined) {
    return "undefined";
  }

  if (Array.isArray(data)) {
    return `Array[${data.length}]`;
  }

  if (typeof data === "object") {
    if (data.constructor && data.constructor.name !== "Object") {
      return data.constructor.name;
    }
    return "Object";
  }

  return typeof data;
};

export const InfoNode = memo(({ data, isConnectable }: NodeProps<InfoNodeData>) => {
  const inputData = data.displayData;
  const hasData = inputData && (inputData.name || inputData.model);

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
        {!hasData ? (
          <div className="text-xs text-gray-500 dark:text-gray-400 italic">
            No data connected
          </div>
        ) : (
          <div className="space-y-2">
            {inputData.name && (
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-2">
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Name:
                </div>
                <div className="text-sm font-mono text-gray-800 dark:text-gray-200">
                  {inputData.name}
                </div>
              </div>
            )}
            {inputData.model && (
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-2">
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Type:
                </div>
                <div className="text-sm font-mono text-gray-800 dark:text-gray-200">
                  {getDataType(inputData.model)}
                </div>
              </div>
            )}
          </div>
        )}
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
