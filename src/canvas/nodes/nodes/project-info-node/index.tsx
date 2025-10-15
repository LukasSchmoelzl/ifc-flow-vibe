"use client";

import React from "react";
import type { NodeProps } from "reactflow";
import { Handle, Position } from "reactflow";
import { NodeCard } from "../../node-card";
import { ProjectInfoNodeUI } from "./ui";

export const ProjectInfoNode: React.FC<NodeProps> = ({ data, selected }) => {
  return (
    <NodeCard selected={selected}>
      <Handle type="target" position={Position.Left} />
      
      <div className="p-4">
        <div className="font-semibold mb-2 text-white">{data.label || "Project Info"}</div>
        <ProjectInfoNodeUI data={data} />
      </div>

      <Handle type="source" position={Position.Right} />
    </NodeCard>
  );
};

export { projectInfoNodeMetadata } from "./metadata";


