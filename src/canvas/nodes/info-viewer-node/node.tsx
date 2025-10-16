"use client";

import React from "react";
import type { NodeProps } from "reactflow";
import { Position } from "reactflow";
import { BaseNodeLayout } from "../shared-node-layout";
import { Eye } from "lucide-react";
import { infoViewerNodeMetadata } from "./metadata";

export const InfoViewerNode: React.FC<NodeProps> = ({ data, selected }) => {
  const { 
    projectData,
    activeView,
    hasData,
    timestamp
  } = data as any;

  return (
    <BaseNodeLayout
      selected={selected}
      title="Info Viewer"
      icon={<Eye className="h-4 w-4" />}
      isLoading={data.isLoading}
      error={data.error}
      inputHandles={[
        { id: "project_data", position: Position.Left }
      ]}
      inputInfo={infoViewerNodeMetadata.inputInfo}
      outputInfo={infoViewerNodeMetadata.outputInfo}
    >
      <div className="text-xs space-y-3 text-white/90">
        <div className="text-white/80">Info Viewer Node</div>
        
        {/* Status */}
        <div className="space-y-1">
          <div className="font-medium">Status</div>
          <div className="text-muted-foreground text-[10px]">
            {data.isLoading ? "Loading..." :
             data.error ? `Error: ${data.error}` :
             hasData ? "Data received" :
             "Waiting for data"}
          </div>
        </div>

        {/* Active View */}
        {activeView && (
          <div className="space-y-1">
            <div className="font-medium">Active View</div>
            <div className="text-white/60 text-[10px]">{activeView}</div>
          </div>
        )}

        {/* Project Data Display */}
        {projectData && (
          <div className="space-y-1">
            <div className="font-medium">Project Data</div>
            <div className="text-white/60 text-[10px]">
              {typeof projectData === 'object' && projectData !== null ? 
                JSON.stringify(projectData, null, 2).substring(0, 200) + '...' :
                String(projectData).substring(0, 200) + '...'
              }
            </div>
          </div>
        )}

        {/* Timestamp */}
        {timestamp && (
          <div className="space-y-1">
            <div className="font-medium">Last Updated</div>
            <div className="text-white/60 text-[10px]">
              {new Date(timestamp).toLocaleTimeString()}
            </div>
          </div>
        )}

        {/* No Data Message */}
        {!hasData && !data.isLoading && !data.error && (
          <div className="text-white/60 text-[10px]">
            Connect to Project Info node to display data
          </div>
        )}
      </div>
    </BaseNodeLayout>
  );
};
