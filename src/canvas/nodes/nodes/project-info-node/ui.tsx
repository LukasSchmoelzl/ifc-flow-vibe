"use client";

import React from "react";
import type { ProjectMetadata, ProjectStatistics, ProjectStructure } from "./types";

interface ProjectInfoNodeUIProps {
  data: {
    metadata?: ProjectMetadata;
    statistics?: ProjectStatistics;
    structure?: ProjectStructure;
    projectName?: string;
    totalElements?: number;
  };
}

export const ProjectInfoNodeUI: React.FC<ProjectInfoNodeUIProps> = ({ data }) => {
  const { metadata, statistics, structure } = data;

  return (
    <div className="text-xs space-y-3">
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
              {structure.sites.reduce((sum, site) => sum + site.buildings.length, 0)}
            </div>
            <div>
              Storeys:{" "}
              {structure.sites.reduce(
                (sum, site) =>
                  sum +
                  site.buildings.reduce((bSum, building) => bSum + building.storeys.length, 0),
                0
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

