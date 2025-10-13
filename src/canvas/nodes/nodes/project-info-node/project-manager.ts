import { ProjectMetadata, ProjectStatistics, ProjectStructure } from './types';

export class ProjectManager {
  private projectCache: Map<string, any> = new Map();

  clear() {
    this.projectCache.clear();
  }

  private safeExtractValue(obj: any): string {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    if (obj.value !== undefined) return String(obj.value);
    return String(obj);
  }

  async getMetadata(model: any): Promise<ProjectMetadata> {
    const cacheKey = 'metadata';
    if (this.projectCache.has(cacheKey)) {
      return this.projectCache.get(cacheKey);
    }

    const metadata = await model.getMetadata();

    const projectMetadata: ProjectMetadata = {
      name: metadata?.name || 'Unknown Project',
      description: metadata?.description || 'No description available',
      version: '0.11.0',
      ifcVersion: metadata?.ifcVersion || 'IFC4',
      createdBy: metadata?.author || 'Unknown',
      createdDate: metadata?.created || new Date().toISOString(),
      modifiedDate: metadata?.modified || new Date().toISOString(),
      projectId: metadata?.projectId,
      siteId: metadata?.siteId,
      buildingId: metadata?.buildingId
    };

    this.projectCache.set(cacheKey, projectMetadata);
    return projectMetadata;
  }

  async getStatistics(model: any): Promise<ProjectStatistics> {
    const cacheKey = 'statistics';
    if (this.projectCache.has(cacheKey)) {
      return this.projectCache.get(cacheKey);
    }

    const categories = await model.getCategories();
    const elementsByType: Record<string, number> = {};
    let totalElements = 0;

    for (const category of categories) {
      const itemsResult = await model.getItemsByQuery({ categories: [new RegExp(category, 'i')] });
      const count = itemsResult.length;
      elementsByType[category] = count;
      totalElements += count;
    }

    const levelsCount = elementsByType['IFCBUILDINGSTOREY'] || 0;
    const spacesCount = elementsByType['IFCSPACE'] || 0;
    const zonesCount = elementsByType['IFCZONE'] || 0;
    const systemsCount = (elementsByType['IFCSYSTEM'] || 0) + (elementsByType['IFCDISTRIBUTIONSYSTEM'] || 0);

    let totalVolume = 0;
    try {
      const geometryIds = await model.getItemsIdsWithGeometry();
      if (geometryIds.length > 0) {
        totalVolume = await model.getItemsVolume(geometryIds);
      }
    } catch (error) {
      console.warn('⚠️ [ProjectManager] Could not calculate volume:', error);
    }

    const statistics: ProjectStatistics = {
      totalElements,
      elementsByType,
      totalSpace: spacesCount,
      totalVolume,
      levelsCount,
      spacesCount,
      zonesCount,
      systemsCount
    };

    this.projectCache.set(cacheKey, statistics);
    return statistics;
  }

  async getStructure(model: any): Promise<ProjectStructure> {
    const cacheKey = 'structure';
    if (this.projectCache.has(cacheKey)) {
      return this.projectCache.get(cacheKey);
    }

    const spatialStructure = await model.getSpatialStructure();

    const structure: ProjectStructure = {
      sites: []
    };

    if (spatialStructure && Array.isArray(spatialStructure)) {
      for (const site of spatialStructure) {
        const siteData: any = {
          id: String(site.expressID || site.id || 'unknown'),
          name: this.safeExtractValue(site.Name) || 'Unknown Site',
          type: this.safeExtractValue(site.ObjectType) || 'IFCSITE',
          globalId: this.safeExtractValue(site.GlobalId) || 'No-GUID',
          buildings: []
        };

        if (site.children && Array.isArray(site.children)) {
          for (const building of site.children) {
            const buildingData: any = {
              id: String(building.expressID || building.id || 'unknown'),
              name: this.safeExtractValue(building.Name) || 'Unknown Building',
              type: this.safeExtractValue(building.ObjectType) || 'IFCBUILDING',
              globalId: this.safeExtractValue(building.GlobalId) || 'No-GUID',
              storeys: []
            };

            if (building.children && Array.isArray(building.children)) {
              for (const storey of building.children) {
                buildingData.storeys.push({
                  id: String(storey.expressID || storey.id || 'unknown'),
                  name: this.safeExtractValue(storey.Name) || 'Unknown Storey',
                  type: this.safeExtractValue(storey.ObjectType) || 'IFCBUILDINGSTOREY',
                  globalId: this.safeExtractValue(storey.GlobalId) || 'No-GUID',
                  elevation: storey.Elevation || undefined
                });
              }
            }

            siteData.buildings.push(buildingData);
          }
        }

        structure.sites.push(siteData);
      }
    }

    this.projectCache.set(cacheKey, structure);
    return structure;
  }
}

