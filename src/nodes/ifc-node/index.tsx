"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { FileUp } from "lucide-react";
import { NodeLoadingIndicator } from "../node-loading-indicator";
import { IfcNodeData as BaseIfcNodeData } from "../node-types";
import { useIfcFileHandler } from "./file-handler";
import { IfcNodeUI } from "./ui";

interface ExtendedIfcNodeData extends BaseIfcNodeData {
  isLoading?: boolean;
  model?: {
    schema?: string;
    project?: { Name?: string };
    elementCounts?: Record<string, number>;
    totalElements?: number;
  };
  error?: string | null;
  isEmptyNode?: boolean;
  fileName?: string;
}

export const IfcNode = memo(({ id, data, isConnectable }: NodeProps<ExtendedIfcNodeData>) => {
  const { dropRef, isDraggingOver, onDragOver, onDragLeave, onDrop, onDoubleClick } = useIfcFileHandler(id);

  return (
    <div
      ref={dropRef}
      className={`bg-white dark:bg-gray-800 border-2 ${
        isDraggingOver ? "border-blue-700 bg-blue-50 dark:bg-blue-900" : "border-blue-500 dark:border-blue-400"
      } rounded-md shadow-md w-60 transition-colors duration-200 ease-in-out`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDoubleClick={onDoubleClick}
    >
      <div className="bg-blue-500 text-white px-3 py-1 flex items-center gap-2">
        <FileUp className="h-4 w-4 flex-shrink-0" />
        <div className="text-sm font-medium truncate" title={data.label}>
          {data.label}
        </div>
      </div>

      <NodeLoadingIndicator
        isLoading={data.isLoading || false}
        message="Processing IFC file..."
      />

      {!data.isLoading && data.error && (
        <div className="p-3 text-xs text-red-500 break-words">
          Error: {data.error}
        </div>
      )}

      {!data.isLoading && !data.error && <IfcNodeUI data={data} isDraggingOver={isDraggingOver} />}

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

IfcNode.displayName = "IfcNode";

