"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { FolderOpen } from "lucide-react";
import { NodeLoadingIndicator } from "../node-loading-indicator";
import { BaseNodeData } from "../node-types";
import { useFileHandler } from "./file-handler";
import { FileManagerNodeUI } from "./ui";
import type { LoadedFileInfo } from "./types";

interface FileManagerNodeData extends BaseNodeData {
  isLoading?: boolean;
  error?: string | null;
  fileName?: string;
  file?: File;
  fileInfo?: LoadedFileInfo;
}

export const FileManagerNode = memo(({ id, data, isConnectable }: NodeProps<FileManagerNodeData>) => {
  const { dropRef, isDraggingOver, onDragOver, onDragLeave, onDrop, onDoubleClick } = useFileHandler(id);

  return (
    <div
      ref={dropRef}
      className={`bg-white dark:bg-gray-800 border-2 ${
        isDraggingOver ? "border-purple-700 bg-purple-50 dark:bg-purple-900" : "border-purple-500 dark:border-purple-400"
      } rounded-md shadow-md w-64 transition-colors duration-200 ease-in-out`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDoubleClick={onDoubleClick}
    >
      {/* Header */}
      <div className="bg-purple-500 text-white px-3 py-1 flex items-center gap-2">
        <FolderOpen className="h-4 w-4 flex-shrink-0" />
        <div className="text-sm font-medium truncate" title={data.label}>
          {data.label}
        </div>
      </div>

      {/* Loading Indicator */}
      <NodeLoadingIndicator
        isLoading={data.isLoading || false}
        message="Loading file..."
      />

      {/* Error Display */}
      {!data.isLoading && data.error && (
        <div className="p-3 text-xs text-red-500 break-words">
          Error: {data.error}
        </div>
      )}

      {/* Content */}
      {!data.isLoading && !data.error && (
        <FileManagerNodeUI data={data} isDraggingOver={isDraggingOver} />
      )}

      {/* Output Handle */}
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

FileManagerNode.displayName = "FileManagerNode";

