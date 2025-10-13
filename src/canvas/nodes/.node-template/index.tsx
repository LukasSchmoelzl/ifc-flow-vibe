"use client";

// TODO: Replace [NAME] with your node name in PascalCase (e.g., "Search", "ProjectInfo")
// TODO: Replace [name] with your node name in camelCase (e.g., "search", "projectInfo")

import React from "react";
import type { NodeProps } from "reactflow";
import { Handle, Position } from "reactflow";
import { Card } from "@/src/shared/ui/card";
import { [NAME]NodeUI } from "./ui";

export const [NAME]Node: React.FC<NodeProps> = ({ data, selected }) => {
  return (
    <Card
      className={`min-w-[280px] max-w-[400px] ${
        selected ? "ring-2 ring-primary" : ""
      }`}
    >
      {/* Input Handle - remove if node has no inputs */}
      <Handle type="target" position={Position.Left} />
      
      <div className="p-4">
        <div className="font-semibold mb-2">{data.label || "[DISPLAY_NAME]"}</div>
        <[NAME]NodeUI data={data} />
      </div>

      {/* Output Handle - remove if node has no outputs */}
      <Handle type="source" position={Position.Right} />
    </Card>
  );
};

// REQUIRED: Export metadata for auto-registry
export { [name]NodeMetadata } from "./metadata";

