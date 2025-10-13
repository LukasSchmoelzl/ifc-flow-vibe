// Project Info Node Types

export interface ProjectMetadata {
  name: string;
  description: string;
  version: string;
  ifcVersion: string;
  createdBy: string;
  createdDate: string;
  modifiedDate: string;
  projectId?: string;
  siteId?: string;
  buildingId?: string;
}

export interface ProjectStatistics {
  totalElements: number;
  elementsByType: Record<string, number>;
  totalSpace: number;
  totalVolume: number;
  levelsCount: number;
  spacesCount: number;
  zonesCount: number;
  systemsCount: number;
}

export interface ProjectStructure {
  sites: Array<{
    id: string;
    name: string;
    type: string;
    globalId: string;
    buildings: Array<{
      id: string;
      name: string;
      type: string;
      globalId: string;
      storeys: Array<{
        id: string;
        name: string;
        type: string;
        globalId: string;
        elevation?: number;
      }>;
    }>;
  }>;
}

