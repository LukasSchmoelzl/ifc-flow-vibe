"use client";

import React from "react";
import type { NodeProps } from "reactflow";
import { Handle, Position } from "reactflow";
import { Card } from "@/src/shared/ui/card";
import { useFileHandler } from "./file-handler";
import { FileManagerNodeUI } from "./ui";

export const FileManagerNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const { dropRef, isDraggingOver, onDragOver, onDragLeave, onDrop, onDoubleClick } = useFileHandler(id);

  return (
    <Card
      ref={dropRef}
      className={`min-w-[280px] max-w-[400px] ${
        selected ? "ring-2 ring-primary" : ""
      } ${isDraggingOver ? "ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950" : ""}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDoubleClick={onDoubleClick}
    >
      <Handle type="source" position={Position.Right} />
      
      <div className="p-4">
        <div className="font-semibold mb-2">{data.label || "File Manager"}</div>
        
        {/* Loading state */}
        {data.isLoading && (
          <div className="text-xs text-muted-foreground">
            Loading file...
          </div>
        )}

        {/* Error state */}
        {!data.isLoading && data.error && (
          <div className="text-xs text-red-500">
            Error: {data.error}
          </div>
        )}

        {/* Content */}
        {!data.isLoading && !data.error && (
          <FileManagerNodeUI data={data} isDraggingOver={isDraggingOver} />
        )}
      </div>
    </Card>
  );
};

export { fileManagerNodeMetadata } from "./metadata";

