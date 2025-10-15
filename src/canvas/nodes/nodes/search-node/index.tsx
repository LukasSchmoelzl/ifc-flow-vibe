"use client";

import React from "react";
import type { NodeProps } from "reactflow";
import { Handle, Position } from "reactflow";
import { NodeCard } from "../../node-card";
import { SearchNodeUI } from "./ui";

export const SearchNode: React.FC<NodeProps> = ({ data, selected }) => {
  return (
    <NodeCard selected={selected}>
      <Handle
        type="target"
        position={Position.Left}
        id="model"
        style={{ top: "30%" }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="parameter"
        style={{ top: "70%" }}
      />

      <div className="p-4">
        <div className="font-semibold mb-2 text-white">{data.label || "Search"}</div>
        <SearchNodeUI data={data} />
      </div>

      <Handle type="source" position={Position.Right} />
    </NodeCard>
  );
};

export { searchNodeMetadata } from "./metadata";


