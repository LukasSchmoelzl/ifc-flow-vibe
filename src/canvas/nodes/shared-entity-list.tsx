"use client";

import React from "react";

interface Entity {
  name: string;
  expressID: number;
  type: string;
}

interface EntityListProps {
  entities: Entity[];
  maxVisible?: number;
  className?: string;
}

export const EntityList: React.FC<EntityListProps> = ({
  entities,
  maxVisible = 10,
  className = "",
}) => {
  if (!entities || entities.length === 0) {
    return null;
  }

  const visibleEntities = entities.slice(0, maxVisible);
  const remainingCount = entities.length - maxVisible;

  return (
    <div className={`max-h-48 overflow-y-auto space-y-1 ${className}`}>
      {visibleEntities.map((entity, idx) => (
        <div key={idx} className="p-1 bg-muted/50 rounded text-xs">
          <div className="font-medium">{entity.name}</div>
          <div className="text-muted-foreground">
            {entity.type} (ID: {entity.expressID})
          </div>
        </div>
      ))}
      {remainingCount > 0 && (
        <div className="text-muted-foreground italic">
          ... and {remainingCount} more
        </div>
      )}
    </div>
  );
};
