import type { NodeProcessor, ProcessorContext } from "@/src/canvas/executor";

export class ProjectInfoNodeProcessor implements NodeProcessor {
  async process(node: any, inputValues: any, context: ProcessorContext): Promise<any> {
    console.log(`[ProjectInfoNode] Processing node ${node.id}`);
    console.log(`[ProjectInfoNode] Inputs:`, inputValues);

    // Get model from input or global registry
    let model = inputValues?.model;
    
    // If no model in input, try to get from global registry
    if (!model && (window as any).__fragmentsModels) {
      const models = Object.values((window as any).__fragmentsModels);
      model = models[0]; // Get first available model
      console.log(`[ProjectInfoNode] Using model from global registry`);
    }

    if (!model) {
      throw new Error("No model available for project info extraction. Please connect a File Manager node or load a model first.");
    }

    try {
      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: true,
        error: null,
      });

      // Determine which operation to perform based on tool_name
      const toolName = inputValues?._toolName;
      let resultData: any = {};

      if (toolName === 'bim_get_model_info') {
        // Get basic model info
        resultData = await this.getModelInfo(model);
      } else if (toolName === 'project_get_statistics') {
        // Get only statistics
        const statistics = await this.getStatistics(model, inputValues);
        resultData = {
          statistics,
          summary: this.formatStatisticsSummary(statistics),
          description: 'Project statistics retrieved successfully'
        };
      } else if (toolName === 'project_get_structure') {
        // Get only structure
        const structure = await this.getStructure(model, inputValues);
        resultData = {
          structure,
          summary: this.formatStructureSummary(structure),
          description: 'Project structure retrieved successfully'
        };
      } else {
        // Default: project_get_info - Get comprehensive info
        const includeMetadata = inputValues?.includeMetadata !== false;
        const includeStatistics = inputValues?.includeStatistics !== false;
        const includeStructure = inputValues?.includeStructure !== false;

        if (includeMetadata) {
          resultData.metadata = await this.getMetadata(model);
        }
        if (includeStatistics) {
          resultData.statistics = await this.getStatistics(model, {});
        }
        if (includeStructure) {
          resultData.structure = await this.getStructure(model, {});
        }

        resultData.projectName = resultData.metadata?.name || 'Unknown Project';
        resultData.totalElements = resultData.statistics?.totalElements || 0;
      }

      console.log(`[ProjectInfoNode] Extracted project info for tool: ${toolName || 'project_get_info'}`);

      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: false,
        ...resultData,
      });

      return resultData;
    } catch (error) {
      console.error(`[ProjectInfoNode] Error:`, error);
      context.updateNodeData(node.id, {
        ...node.data,
        isLoading: false,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private async getModelInfo(model: any): Promise<any> {
    const metadata = await model.getMetadata();
    const categories = await model.getCategories();
    const attributeNames = await model.getAttributeNames();
    const itemsWithGeometry = await model.getItemsIdsWithGeometry();

    return {
      description: 'Model loaded and ready for analysis',
      format: 'IFC/Fragment',
      status: 'Ready for analysis',
      features: [
        'Geometry extraction',
        'Property queries',
        'Spatial structure',
        'Category filtering',
        'Measurement tools'
      ],
      version: '0.11.0',
      modelId: model.modelId,
      entityCount: itemsWithGeometry.length,
      attributeNames: attributeNames || [],
      categories: categories || [],
      loadedAt: new Date().toISOString()
    };
  }

  private async getMetadata(model: any): Promise<any> {
    const metadata = await model.getMetadata();
    
    return {
      name: metadata?.name || 'Unknown Project',
      description: metadata?.description || 'No description available',
      version: '0.11.0',
      ifcVersion: metadata?.ifcVersion || metadata?.schema || 'IFC4',
      createdBy: metadata?.author || metadata?.createdBy || 'Unknown',
      createdDate: metadata?.created || metadata?.createdDate || new Date().toISOString(),
      modifiedDate: metadata?.modified || metadata?.modifiedDate || new Date().toISOString(),
      projectId: metadata?.projectId,
      siteId: metadata?.siteId,
      buildingId: metadata?.buildingId
    };
  }

  private async getStatistics(model: any, params: any): Promise<any> {
    const groupByType = params?.groupByType !== false;
    const includeVolumes = params?.includeVolumes !== false;
    const includeSpaces = params?.includeSpaces !== false;

    const categories = await model.getCategories();
    const elementsByType: Record<string, number> = {};
    let totalElements = 0;

    // Count elements by category
    if (groupByType) {
      for (const category of categories) {
        const itemsResult = await model.getItemsByQuery({ 
          categories: [new RegExp(`^${category}$`, 'i')] 
        });
        const count = itemsResult.length;
        if (count > 0) {
          elementsByType[category] = count;
          totalElements += count;
        }
      }
    } else {
      const allItems = await model.getItemsIdsWithGeometry();
      totalElements = allItems.length;
    }

    // Calculate volumes if requested
    let totalVolume = 0;
    if (includeVolumes) {
      try {
        const geometryIds = await model.getItemsIdsWithGeometry();
        if (geometryIds.length > 0) {
          totalVolume = await model.getItemsVolume(geometryIds);
        }
      } catch (error) {
        console.warn('⚠️ [ProjectInfoNode] Could not calculate volume:', error);
      }
    }

    // Space-related statistics
    const levelsCount = elementsByType['IFCBUILDINGSTOREY'] || 0;
    const spacesCount = elementsByType['IFCSPACE'] || 0;
    const zonesCount = elementsByType['IFCZONE'] || 0;
    const systemsCount = (elementsByType['IFCSYSTEM'] || 0) + 
                        (elementsByType['IFCDISTRIBUTIONSYSTEM'] || 0);

    return {
      totalElements,
      elementsByType: groupByType ? elementsByType : undefined,
      totalSpace: includeSpaces ? spacesCount : undefined,
      totalVolume: includeVolumes ? totalVolume : undefined,
      levelsCount: includeSpaces ? levelsCount : undefined,
      spacesCount: includeSpaces ? spacesCount : undefined,
      zonesCount: includeSpaces ? zonesCount : undefined,
      systemsCount: includeSpaces ? systemsCount : undefined
    };
  }

  private async getStructure(model: any, params: any): Promise<any> {
    const maxDepth = params?.maxDepth;
    const includeElements = params?.includeElements || false;

    const spatialStructure = await model.getSpatialStructure();

    const structure: any = {
      sites: []
    };

    if (spatialStructure && Array.isArray(spatialStructure)) {
      for (const site of spatialStructure) {
        const siteData: any = {
          id: String(site.expressID || site.id || 'unknown'),
          name: this.extractValue(site.Name) || 'Unknown Site',
          type: this.extractValue(site.ObjectType) || 'IFCSITE',
          globalId: this.extractValue(site.GlobalId) || 'No-GUID',
          buildings: []
        };

        if (site.children && Array.isArray(site.children) && (!maxDepth || maxDepth > 1)) {
          for (const building of site.children) {
            const buildingData: any = {
              id: String(building.expressID || building.id || 'unknown'),
              name: this.extractValue(building.Name) || 'Unknown Building',
              type: this.extractValue(building.ObjectType) || 'IFCBUILDING',
              globalId: this.extractValue(building.GlobalId) || 'No-GUID',
              storeys: []
            };

            if (building.children && Array.isArray(building.children) && (!maxDepth || maxDepth > 2)) {
              for (const storey of building.children) {
                const storeyData: any = {
                  id: String(storey.expressID || storey.id || 'unknown'),
                  name: this.extractValue(storey.Name) || 'Unknown Storey',
                  type: this.extractValue(storey.ObjectType) || 'IFCBUILDINGSTOREY',
                  globalId: this.extractValue(storey.GlobalId) || 'No-GUID',
                  elevation: storey.Elevation || undefined
                };

                if (includeElements && storey.children && Array.isArray(storey.children)) {
                  storeyData.elements = storey.children.map((el: any) => ({
                    id: String(el.expressID || el.id || 'unknown'),
                    name: this.extractValue(el.Name) || 'Unknown Element',
                    type: this.extractValue(el.ObjectType) || 'UNKNOWN'
                  }));
                }

                buildingData.storeys.push(storeyData);
              }
            }

            siteData.buildings.push(buildingData);
          }
        }

        structure.sites.push(siteData);
      }
    }

    return structure;
  }

  private extractValue(obj: any): string {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    if (obj.value !== undefined) return String(obj.value);
    return String(obj);
  }

  private formatStatisticsSummary(statistics: any): string {
    const parts = [];
    if (statistics.totalElements) {
      parts.push(`${statistics.totalElements} total elements`);
    }
    if (statistics.levelsCount) {
      parts.push(`${statistics.levelsCount} levels`);
    }
    if (statistics.spacesCount) {
      parts.push(`${statistics.spacesCount} spaces`);
    }
    return `Project statistics: ${parts.join(', ')}`;
  }

  private formatStructureSummary(structure: any): string {
    const siteCount = structure.sites?.length || 0;
    const buildingCount = structure.sites?.reduce((sum: number, site: any) => 
      sum + (site.buildings?.length || 0), 0) || 0;
    const storeyCount = structure.sites?.reduce((sum: number, site: any) => 
      site.buildings?.reduce((bSum: number, building: any) => 
        bSum + (building.storeys?.length || 0), 0) || 0, 0) || 0;
    
    return `Project structure: ${siteCount} sites, ${buildingCount} buildings, ${storeyCount} storeys`;
  }
}

