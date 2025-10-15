"use client";

import React from "react";
import type { NodeProps } from "reactflow";
import { Handle, Position } from "reactflow";
import { NodeCard } from "../../node-card";
import { useFileHandler } from "./file-handler";
import { FileManagerNodeUI } from "./ui";

export const FileManagerNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const { dropRef, isDraggingOver, onDragOver, onDragLeave, onDrop, onDoubleClick } = useFileHandler(id);

  return (
    <NodeCard
      ref={dropRef}
      selected={selected}
      isDragging={isDraggingOver}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDoubleClick={onDoubleClick}
    >
      <Handle type="source" position={Position.Right} />
      
      <div className="p-4">
        <div className="font-semibold mb-2 text-white">{data.label || "File Manager"}</div>
        
        {/* Loading state */}
        {data.isLoading && (
          <div className="text-xs text-white/70">
            Loading file...
          </div>
        )}

        {/* Error state */}
        {!data.isLoading && data.error && (
          <div className="text-xs text-red-300">
            Error: {data.error}
          </div>
        )}

        {/* Content */}
        {!data.isLoading && !data.error && (
          <FileManagerNodeUI data={data} />
        )}
      </div>
    </NodeCard>
  );
};

export { fileManagerNodeMetadata } from "./metadata";

