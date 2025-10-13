"use client";

import React from "react";

interface AIVisibilityNodeUIProps {
  data: {
    highlightedIds?: number[];
    invisibleIds?: number[];
    count?: number;
    cleared?: boolean;
  };
}

export const AIVisibilityNodeUI: React.FC<AIVisibilityNodeUIProps> = ({ data }) => {
  const { highlightedIds, invisibleIds, cleared } = data;

  if (cleared) {
    return (
      <div className="text-xs text-muted-foreground">
        Highlights cleared
      </div>
    );
  }

  const highlightCount = highlightedIds?.length || 0;
  const invisibleCount = invisibleIds?.length || 0;

  return (
    <div className="text-xs space-y-2">
      <div>
        <span className="font-medium">Highlighted: </span>
        <span>{highlightCount} entities</span>
      </div>

      {invisibleCount > 0 && (
        <div>
          <span className="font-medium">Invisible: </span>
          <span>{invisibleCount} entities</span>
        </div>
      )}

      {highlightedIds && highlightedIds.length > 0 && (
        <div className="text-muted-foreground text-xs">
          IDs: {highlightedIds.slice(0, 5).join(", ")}
          {highlightedIds.length > 5 && ` ... +${highlightedIds.length - 5}`}
        </div>
      )}
    </div>
  );
};

