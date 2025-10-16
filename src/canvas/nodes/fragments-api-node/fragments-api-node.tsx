"use client";

import React from "react";
import type { NodeProps } from "reactflow";
import { Position } from "reactflow";
import { BaseNodeLayout } from "../shared-node-layout";
import { Database } from "lucide-react";
import { fragmentsApiNodeMetadata } from "./fragments-api-metadata";

// fragmentsApiNode Component
export const fragmentsApiNode: React.FC<NodeProps> = ({ data, selected }) => {

  return (
    <BaseNodeLayout
      selected={selected}
      title="fragments API"
      icon={<Database className="h-4 w-4" />}
      isLoading={data.isLoading}
      error={data.error}
      inputHandles={[
        { id: "model", position: Position.Left }
      ]}
      outputHandles={[
        { id: "get_metadata", position: Position.Right, style: { top: "50%" } },
        { id: "get_structure", position: Position.Right, style: { top: "65%" } },
        { id: "get_statistics", position: Position.Right, style: { top: "80%" } }
      ]}
      inputInfo={fragmentsApiNodeMetadata.inputInfo}
      outputInfo={fragmentsApiNodeMetadata.outputInfo}
    >
      <div className="text-xs space-y-3 text-white/90">
        <div className="text-white/80">fragments API Node</div>
        
        {/* Status */}
        <div className="space-y-1">
          <div className="font-medium">Status</div>
          <div className="text-muted-foreground text-[10px]">
            {data.isLoading ? "Loading..." : 
             data.error ? `Error: ${data.error}` : 
             "Ready to provide API access"}
          </div>
        </div>

        {/* Model Status */}
        {data.model && (
          <div className="space-y-1">
            <div className="font-medium">Model Connected</div>
            <div className="text-muted-foreground text-[10px]">
              fragments model ready for API access
            </div>
          </div>
        )}

        {/* API Info */}
        <div className="space-y-1">
          <div className="font-medium">API Endpoints</div>
          <div className="text-muted-foreground text-[10px]">
            Model Info • Project Info • Statistics • Structure
          </div>
        </div>
      </div>
    </BaseNodeLayout>
  );
};

export { fragmentsApiNodeMetadata } from "./fragments-api-metadata";
