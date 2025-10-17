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
  
  // Log when data changes
  React.useEffect(() => {
    console.log('🖼️ InfoViewer UI: Data updated:', { projectData, hasData, timestamp });
  }, [projectData, hasData, timestamp]);

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
      <div className="text-xs text-white/90 space-y-2">
        {/* Display Area - Shows Data Summary */}
        {projectData ? (
          <>
            {/* Metadata Section */}
            {projectData.metadata && (
              <div className="space-y-1">
                <div className="font-semibold text-white">📋 Metadata</div>
                <div className="text-white/70 text-[10px] pl-2">
                  Schema: {projectData.metadata.schema || 'N/A'}
                </div>
              </div>
            )}

            {/* Statistics Section */}
            {projectData.statistics && (
              <div className="space-y-1">
                <div className="font-semibold text-white">📊 Statistics</div>
                <div className="text-white/70 text-[10px] pl-2">
                  Total Elements: {projectData.statistics.totalElements?.toLocaleString() || 'N/A'}
                </div>
                {projectData.statistics.categories && (
                  <div className="text-white/70 text-[10px] pl-2">
                    Categories ({projectData.statistics.categories.length}): {projectData.statistics.categories.slice(0, 5).join(', ')}
                    {projectData.statistics.categories.length > 5 && ` +${projectData.statistics.categories.length - 5} more`}
                  </div>
                )}
              </div>
            )}

            {/* Structure Section */}
            {projectData.structure && (
              <div className="space-y-1">
                <div className="font-semibold text-white">🏗️ Structure</div>
                <div className="text-white/70 text-[10px] pl-2">
                  Root: {projectData.structure.category || 'N/A'}
                </div>
                {projectData.structure.children && (
                  <div className="text-white/70 text-[10px] pl-2">
                    Children: {projectData.structure.children.length} items
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            {projectData.description && (
              <div className="space-y-1">
                <div className="font-semibold text-white">📝 Description</div>
                <div className="text-white/70 text-[10px] pl-2">
                  {projectData.description}
                </div>
              </div>
            )}

            {/* Timestamp */}
            {projectData.timestamp && (
              <div className="text-white/50 text-[9px] pt-1 border-t border-white/10">
                Updated: {new Date(projectData.timestamp).toLocaleString()}
              </div>
            )}
          </>
        ) : data.isLoading ? (
          <div className="text-white/60 text-[10px]">
            Loading...
          </div>
        ) : data.error ? (
          <div className="text-red-400 text-[10px]">
            Error: {data.error}
          </div>
        ) : (
          <div className="text-white/60 text-[10px]">
            Connect to Fragments API node to display data
          </div>
        )}
      </div>
    </BaseNodeLayout>
  );
};
