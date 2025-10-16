"use client";

import React from "react";
import type { NodeProps } from "reactflow";
import { Position } from "reactflow";
import { BaseNodeLayout } from "../shared-node-layout";
import { EntityList } from "../shared-entity-list";
import { MousePointerClick } from "lucide-react";

// UserSelectionNode Component
export const UserSelectionNode: React.FC<NodeProps> = ({ data, selected }) => {
  const { selectedEntities, count, cleared } = data;

  return (
    <BaseNodeLayout
      selected={selected}
      title="User Selection"
      icon={<MousePointerClick className="h-4 w-4" />}
      isLoading={data.isLoading}
      error={data.error}
      inputHandles={[{ position: Position.Left }]}
      outputHandles={[
        { id: "get_user_selection", position: Position.Right, style: { top: "25%" } },
        { id: "set_user_selection", position: Position.Right, style: { top: "50%" } },
        { id: "clear_user_selection", position: Position.Right, style: { top: "75%" } }
      ]}
    >
      <div className="text-xs space-y-2 text-white/90">
        <div className="text-white/80">User Selection Node</div>
        {cleared ? (
          <div className="text-xs text-white/60">Selection cleared</div>
        ) : !count || count === 0 ? (
          <div className="text-xs text-white/60">No entities selected</div>
        ) : (
          <>
            <div>
              <span className="font-medium">Selected: </span>
              <span>{count} entities</span>
            </div>
            {selectedEntities && <EntityList entities={selectedEntities} />}
          </>
        )}
      </div>
    </BaseNodeLayout>
  );
};

export { userSelectionNodeMetadata } from "./user-selection-metadata";
