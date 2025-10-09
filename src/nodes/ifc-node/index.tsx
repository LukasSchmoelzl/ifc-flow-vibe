"use client";

import { memo } from "react";
import { Position, type NodeProps } from "reactflow";
import { FileUp } from "lucide-react";
import { BaseNodeComponent } from "../base-node";
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
      className={`${isDraggingOver ? "ring-2 ring-blue-700 bg-blue-50 dark:bg-blue-900" : ""} transition-colors duration-200 ease-in-out`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDoubleClick={onDoubleClick}
    >
      <BaseNodeComponent
        data={data}
        isConnectable={isConnectable}
        config={{
          icon: FileUp,
          color: "blue",
          width: "w-60",
          loadingMessage: "Processing IFC file...",
          handles: [{ type: "source", position: Position.Right, id: "output" }],
        }}
      >
        <IfcNodeUI data={data} isDraggingOver={isDraggingOver} />
      </BaseNodeComponent>
    </div>
  );
});

IfcNode.displayName = "IfcNode";

