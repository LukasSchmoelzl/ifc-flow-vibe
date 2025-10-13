"use client";

import React from "react";

interface UserSelectionNodeUIProps {
  data: {
    selectedEntities?: Array<{ expressID: number; type: string; name: string }>;
    count?: number;
    cleared?: boolean;
  };
}

export const UserSelectionNodeUI: React.FC<UserSelectionNodeUIProps> = ({ data }) => {
  const { selectedEntities, count, cleared } = data;

  if (cleared) {
    return (
      <div className="text-xs text-muted-foreground">
        Selection cleared
      </div>
    );
  }

  if (!count || count === 0) {
    return (
      <div className="text-xs text-muted-foreground">
        No entities selected
      </div>
    );
  }

  return (
    <div className="text-xs space-y-2">
      <div>
        <span className="font-medium">Selected: </span>
        <span>{count} entities</span>
      </div>

      {selectedEntities && selectedEntities.length > 0 && (
        <div className="max-h-48 overflow-y-auto space-y-1">
          {selectedEntities.slice(0, 10).map((entity, idx) => (
            <div key={idx} className="p-1 bg-muted/50 rounded text-xs">
              <div className="font-medium">{entity.name}</div>
              <div className="text-muted-foreground">
                {entity.type} (ID: {entity.expressID})
              </div>
            </div>
          ))}
          {selectedEntities.length > 10 && (
            <div className="text-muted-foreground italic">
              ... and {selectedEntities.length - 10} more
            </div>
          )}
        </div>
      )}
    </div>
  );
};

