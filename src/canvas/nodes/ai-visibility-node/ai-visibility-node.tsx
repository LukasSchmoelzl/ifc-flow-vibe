"use client";

import React from "react";
import type { NodeProps } from "reactflow";
import { Position } from "reactflow";
import { BaseNodeLayout } from "../shared-node-layout";
import { Eye } from "lucide-react";
import { aiVisibilityNodeMetadata } from "./ai-visibility-metadata";

// AIVisibilityNode Component
export const AIVisibilityNode: React.FC<NodeProps> = ({ data, selected }) => {
  const { highlightedIds, invisibleIds, cleared } = data;

  return (
    <BaseNodeLayout
      selected={selected}
      title="AI Visibility"
      icon={<Eye className="h-4 w-4" />}
      isLoading={data.isLoading}
      error={data.error}
      inputHandles={[{ position: Position.Left }]}
      outputHandles={[
        { id: "get_ai_highlight", position: Position.Right, style: { top: "16%" } },
        { id: "set_ai_highlight", position: Position.Right, style: { top: "32%" } },
        { id: "clear_ai_highlight", position: Position.Right, style: { top: "48%" } },
        { id: "set_visible", position: Position.Right, style: { top: "64%" } },
        { id: "get_invisible", position: Position.Right, style: { top: "80%" } },
        { id: "set_invisible", position: Position.Right, style: { top: "96%" } }
      ]}
      inputInfo={aiVisibilityNodeMetadata.inputInfo}
      outputInfo={aiVisibilityNodeMetadata.outputInfo}
    >
      <div className="text-xs space-y-2 text-white/90">
        <div className="text-white/80">AI Visibility Node</div>
        {cleared ? (
          <div className="text-xs text-white/60">Highlights cleared</div>
        ) : (
          <>
            <div>
              <span className="font-medium">Highlighted: </span>
              <span>{highlightedIds?.length || 0} entities</span>
            </div>

          {invisibleIds && invisibleIds.length > 0 && (
            <div>
              <span className="font-medium">Invisible: </span>
              <span>{invisibleIds.length} entities</span>
            </div>
          )}

          {highlightedIds && highlightedIds.length > 0 && (
            <div className="text-muted-foreground text-xs">
              IDs: {highlightedIds.slice(0, 5).join(", ")}
              {highlightedIds.length > 5 && ` ... +${highlightedIds.length - 5}`}
            </div>
          )}
          </>
        )}
      </div>
    </BaseNodeLayout>
  );
};

export { aiVisibilityNodeMetadata } from "./ai-visibility-metadata";
