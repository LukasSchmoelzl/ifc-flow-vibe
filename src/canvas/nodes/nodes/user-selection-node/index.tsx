"use client";

import React from "react";
import type { NodeProps } from "reactflow";
import { Handle, Position } from "reactflow";
import { Card } from "@/src/shared/ui/card";
import { UserSelectionNodeUI } from "./ui";

export const UserSelectionNode: React.FC<NodeProps> = ({ data, selected }) => {
  return (
    <Card
      className={`min-w-[280px] max-w-[400px] ${
        selected ? "ring-2 ring-primary" : ""
      }`}
    >
      <Handle type="target" position={Position.Left} />
      
      <div className="p-4">
        <div className="font-semibold mb-2">{data.label || "User Selection"}</div>
        <UserSelectionNodeUI data={data} />
      </div>

      <Handle type="source" position={Position.Right} />
    </Card>
  );
};

export { userSelectionNodeMetadata } from "./metadata";

