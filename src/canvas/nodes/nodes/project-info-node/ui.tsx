"use client";

import React from "react";

interface ProjectInfoNodeUIProps {
  data: {
    metadata?: any;
    statistics?: any;
    structure?: any;
    projectName?: string;
    totalElements?: number;
    description?: string;
    format?: string;
    status?: string;
    features?: string[];
    version?: string;
    modelId?: string;
    entityCount?: number;
    attributeNames?: string[];
    categories?: string[];
    loadedAt?: string;
    summary?: string;
  };
}

export const ProjectInfoNodeUI: React.FC<ProjectInfoNodeUIProps> = ({ data }) => {
  const { metadata, statistics, structure, description, summary } = data;

  return (
    <div className="text-xs space-y-3 text-white/90">
      {/* Description/Summary */}
      {(description || summary) && (
        <div className="space-y-1">
          <div className="font-medium">Info</div>
          <div className="text-muted-foreground text-[10px]">
            {description || summary}
          </div>
        </div>
      )}

      {metadata && (
        <div className="space-y-1">
          <div className="font-semibold text-sm">{metadata.name}</div>
          <div className="text-muted-foreground">
            {metadata.ifcVersion} • {metadata.version}
          </div>
        </div>
      )}

      {statistics && (
        <div className="space-y-1">
          <div className="font-medium">Statistics</div>
          <div className="space-y-0.5 text-muted-foreground">
            <div>Total Elements: {statistics.totalElements}</div>
            <div>Levels: {statistics.levelsCount}</div>
            <div>Spaces: {statistics.spacesCount}</div>
            {statistics.totalVolume > 0 && (
              <div>Volume: {statistics.totalVolume.toFixed(2)} m³</div>
            )}
          </div>
        </div>
      )}

      {structure && structure.sites.length > 0 && (
        <div className="space-y-1">
          <div className="font-medium">Structure</div>
          <div className="space-y-0.5 text-muted-foreground">
            <div>Sites: {structure.sites.length}</div>
            <div>
              Buildings:{" "}
              {structure.sites.reduce((sum: number, site: any) => sum + site.buildings.length, 0)}
            </div>
            <div>
              Storeys:{" "}
              {structure.sites.reduce(
                (sum: number, site: any) =>
                  sum +
                  site.buildings.reduce((bSum: number, building: any) => bSum + building.storeys.length, 0),
                0
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


