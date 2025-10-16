"use client";

import React from "react";
import type { NodeProps } from "reactflow";
import { Position } from "reactflow";
import { BaseNodeLayout } from "../shared-node-layout";
import { EntityList } from "../shared-entity-list";
import { Search } from "lucide-react";

// SearchNode Component
export const SearchNode: React.FC<NodeProps> = ({ data, selected }) => {
  const { searchResults, count, query, types } = data;

  return (
    <BaseNodeLayout
      selected={selected}
      title="Search"
      icon={<Search className="h-4 w-4" />}
      isLoading={data.isLoading}
      error={data.error}
      inputHandles={[
        { id: "model", position: Position.Left, style: { top: "30%" } },
        { id: "parameter", position: Position.Left, style: { top: "70%" } },
      ]}
      outputHandles={[
        { id: "bim_search", position: Position.Right }
      ]}
    >
      <div className="text-xs space-y-2 text-white/90">
        <div className="text-white/80">Search Node</div>
        
        {/* Immer sichtbare Basis-Info */}
        <div className="space-y-1">
          <div className="font-medium">Status</div>
          <div className="text-muted-foreground text-[10px]">
            {data.isLoading ? "Searching..." : 
             data.error ? `Error: ${data.error}` : 
             "Ready to search"}
          </div>
        </div>

        {query && (
          <div>
            <span className="font-medium">Query: </span>
            <span>{query}</span>
          </div>
        )}

        {types && types.length > 0 && (
          <div>
            <span className="font-medium">Types: </span>
            <span>{types.join(", ")}</span>
          </div>
        )}

        {count !== undefined && (
          <div>
            <span className="font-medium">Results: </span>
            <span>{count} entities</span>
          </div>
        )}

        {searchResults && <EntityList entities={searchResults} />}
      </div>
    </BaseNodeLayout>
  );
};

export { searchNodeMetadata } from "./search-metadata";
