"use client";

import React from "react";
import type { NodeProps } from "reactflow";
import { Handle, Position } from "reactflow";
import { Card } from "@/src/shared/ui/card";
import { AIVisibilityNodeUI } from "./ui";

export const AIVisibilityNode: React.FC<NodeProps> = ({ data, selected }) => {
  return (
    <Card
      className={`min-w-[280px] max-w-[400px] ${
        selected ? "ring-2 ring-primary" : ""
      }`}
    >
      <Handle type="target" position={Position.Left} />
      
      <div className="p-4">
        <div className="font-semibold mb-2">{data.label || "AI Visibility"}</div>
        <AIVisibilityNodeUI data={data} />
      </div>

      <Handle type="source" position={Position.Right} />
    </Card>
  );
};

export { aiVisibilityNodeMetadata } from "./metadata";


