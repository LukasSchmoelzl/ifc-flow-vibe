// Modern Entity Access Layer - Direct FragmentsModel API wrapper with caching

import { IfcEntity, IfcEntityIndex } from './entity-types';
import { entityCache } from './entity-cache';
import { EntityExtractor, EntityFilter } from './entity-extractor';
import { ModelError } from './model-error';

const CACHE_SIZE_THRESHOLD = 1000;
const CACHE_BATCH_SIZE_SMALL = 10;
const CACHE_BATCH_SIZE_MEDIUM = 50;

export interface EntityExtractionResult {
  entities: IfcEntity[];
  entityIndex: IfcEntityIndex;
  entityTypes: string[];
  totalCount: number;
  processingTime: number;
}

export interface SearchParams {
  query?: string;
  types?: string[];
  limit?: number;
  offset?: number;
}

export class EntityAccessLayer {
  private static model: any = null;

  static setModel(model: any): void {
    this.model = model;
    entityCache.clear();
  }

  static clearModel(): void {
    this.model = null;
    entityCache.clear();
    console.log('🗑️ [EntityAccessLayer] FragmentsModel cleared');
  }

  private static ensureModelAvailable(): void {
    if (!this.model) {
      throw ModelError.modelNotAvailable();
    }
  }

  static async getAllEntities(): Promise<IfcEntity[]> {
    this.ensureModelAvailable();
    
    const cacheKey = 'all_entities';
    const cached = entityCache.get<IfcEntity[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const startTime = Date.now();

    try {
      const itemsWithGeometry = await this.model.getItemsIdsWithGeometry();
      const itemsData = await this.model.getItemsData(itemsWithGeometry);
      const entities = EntityExtractor.extractEntities(itemsData, itemsWithGeometry);

      entityCache.set(cacheKey, entities);
      
      console.log(`✅ [EntityAccessLayer] Loaded ${entities.length} entities in ${Date.now() - startTime}ms`);
      return entities;
      
    } catch (error) {
      throw ModelError.queryFailed('getAllEntities', error);
    }
  }

  static async searchEntities(params: SearchParams = {}): Promise<IfcEntity[]> {
    this.ensureModelAvailable();

    const cacheKey = `search_${JSON.stringify(params)}`;
    const cached = entityCache.get<IfcEntity[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const queryParams: any = {};
      
      if (params.types?.length) {
        queryParams.categories = params.types.map(type => new RegExp(type, 'i'));
      }
      
      const itemIds = await this.model.getItemsByQuery(queryParams);
      const itemsData = await this.model.getItemsData(itemIds);
      let results = EntityExtractor.extractEntities(itemsData, itemIds);

      results = EntityFilter.byTypes(results, params.types || []);
      results = EntityFilter.byTextQuery(results, params.query || '');
      results = EntityFilter.paginate(results, params.offset, params.limit);

      if (results.length < CACHE_SIZE_THRESHOLD) {
        entityCache.set(cacheKey, results);
      }

      return results;
      
    } catch (error) {
      throw ModelError.queryFailed('searchEntities', error);
    }
  }

  static async getEntity(expressId: number | number[]): Promise<IfcEntity | IfcEntity[] | null> {
    this.ensureModelAvailable();

    if (typeof expressId === 'number') {
      const cacheKey = `entity_${expressId}`;
      const cached = entityCache.get<IfcEntity>(cacheKey);
      if (cached) {
        return cached;
      }

      try {
        const itemsData = await this.model.getItemsData([expressId]);
        
        if (itemsData.length === 0) {
          return null;
        }

        const entity = EntityExtractor.extractEntity(itemsData[0], expressId);
        
        entityCache.set(cacheKey, entity);
        
        return entity;
        
      } catch (error) {
        throw ModelError.queryFailed(`getEntity(${expressId})`, error);
      }
    }

    return this.getEntitiesByIds(expressId);
  }

  static async getAvailableTypes(): Promise<string[]> {
    this.ensureModelAvailable();

    const cacheKey = 'available_types';
    const cached = entityCache.get<string[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const categories = await this.model.getCategories();
      const types = categories.filter((cat: any) => cat && cat.length > 0);

      entityCache.set(cacheKey, types);
      return types;
      
    } catch (error) {
      throw ModelError.queryFailed('getAvailableTypes', error);
    }
  }

  private static async getEntitiesByIds(expressIds: number[]): Promise<IfcEntity[]> {
    this.ensureModelAvailable();

    if (expressIds.length === 0) {
      return [];
    }

    if (expressIds.length <= CACHE_BATCH_SIZE_SMALL) {
      const cachedEntities: IfcEntity[] = [];
      const missingIds: number[] = [];
      
      for (const id of expressIds) {
        const cached = entityCache.get<IfcEntity>(`entity_${id}`);
        if (cached) {
          cachedEntities.push(cached);
        } else {
          missingIds.push(id);
        }
      }
      
      if (missingIds.length === 0) {
        return cachedEntities;
      }
      
      if (missingIds.length < expressIds.length) {
        const itemsData = await this.model.getItemsData(missingIds);
        const missingEntities = EntityExtractor.extractEntities(itemsData, missingIds);
        
        missingEntities.forEach(entity => {
          entityCache.set(`entity_${entity.expressID}`, entity);
        });
        
        return [...cachedEntities, ...missingEntities];
      }
    }

    try {
      const itemsData = await this.model.getItemsData(expressIds);
      const entities = EntityExtractor.extractEntities(itemsData, expressIds);
      
      if (entities.length <= CACHE_BATCH_SIZE_MEDIUM) {
        entities.forEach(entity => {
          entityCache.set(`entity_${entity.expressID}`, entity);
        });
      }
      
      return entities;
      
    } catch (error) {
      throw ModelError.queryFailed(`getEntitiesByIds([${expressIds.length} ids])`, error);
    }
  }

  static async getEntitiesWithAttributes(expressIds: number[], options: {
    includePropertySets?: boolean;
    includeRelations?: boolean;
  } = {}): Promise<Array<{
    expressId: number;
    entity: any;
    attributes: Array<{
      key: string;
      value: any;
      type?: string;
      raw?: any;
    }>;
    basicInfo: {
      name: string;
      type: string;
      globalId: string;
      description: string;
      tag: string;
      predefinedType: string;
      totalAttributes: number;
    };
  }>> {
    this.ensureModelAvailable();

    if (expressIds.length === 0) {
      return [];
    }

    const cacheKey = `entities_with_attrs_${JSON.stringify({ expressIds, options })}`;
    const cached = entityCache.get<Array<any>>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const entities = await this.getEntity(expressIds) as IfcEntity[];

      const itemsData = await this.model.getItemsData(expressIds, {
        attributesDefault: true,
        relations: {
          IsDefinedBy: options.includePropertySets ? { attributes: true, relations: true } : { attributes: false, relations: false },
          DefinesOcurrence: options.includeRelations ? { attributes: true, relations: true } : { attributes: false, relations: false }
        }
      });

      const result = [];
      
      for (let i = 0; i < expressIds.length; i++) {
        const expressId = expressIds[i];
        const itemData = itemsData[i];
        const entity = entities.find(e => e.expressID === expressId);
        
        if (itemData && entity) {
          const attributes = this.extractAttributes(itemData, options.includePropertySets);
          result.push({
            expressId: expressId,
            entity: itemData,
            attributes: attributes,
            basicInfo: {
              name: entity.name || 'Unknown',
              type: entity.type,
              globalId: entity.globalId || '',
              description: this.safeExtractValue(itemData?.Description),
              tag: this.safeExtractValue(itemData?.Tag),
              predefinedType: this.safeExtractValue(itemData?.PredefinedType),
              totalAttributes: attributes.length
            }
          });
        }
      }

      entityCache.set(cacheKey, result);
      return result;
      
    } catch (error) {
      throw ModelError.queryFailed(`getEntitiesWithAttributes([${expressIds.length} ids])`, error);
    }
  }

  private static safeExtractValue(obj: any): string {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    if (obj.value !== undefined) return String(obj.value);
    return String(obj);
  }

  private static extractAttributes(itemData: any, includePropertySets: boolean = true): Array<{
    key: string;
    value: any;
    type?: string;
    raw?: any;
  }> {
    const formattedAttributes: Array<{
      key: string;
      value: any;
      type?: string;
      raw?: any;
    }> = [];
    
    for (const [key, value] of Object.entries(itemData)) {
      if (key === 'IsDefinedBy' || key === 'DefinesOcurrence') continue;
      if (key === 'model') continue;
      
      if (value && typeof value === 'object' && 'value' in value) {
        const extractedValue = (value as any).value;
        const safeValue = this.safeExtractValue(extractedValue);
        
        formattedAttributes.push({
          key: String(key),
          value: safeValue,
          type: String((value as any).type || 'IFC_OBJECT'),
          raw: value
        });
      } else if (value !== null && value !== undefined) {
        const safeValue = this.safeExtractValue(value);
        
        formattedAttributes.push({
          key: String(key),
          value: safeValue,
          type: String(typeof value),
          raw: value
        });
      }
    }
    
    if (includePropertySets && itemData.IsDefinedBy && Array.isArray(itemData.IsDefinedBy)) {
      for (const [psetIndex, pset] of itemData.IsDefinedBy.entries()) {
        const psetName = this.safeExtractValue((pset.Name as any)?.value) || `PropertySet_${psetIndex}`;
        const hasProperties = pset.HasProperties;
        
        if (Array.isArray(hasProperties)) {
          for (const [propIndex, property] of hasProperties.entries()) {
            const propName = this.safeExtractValue((property.Name as any)?.value) || `Property_${propIndex}`;
            const propValue = (property.NominalValue as any)?.value;
            const safeValue = this.safeExtractValue(propValue);
            
            formattedAttributes.push({
              key: String(`PropertySets.${psetName}.${propName}`),
              value: safeValue,
              type: String(typeof propValue),
              raw: property
            });
          }
        }
      }
    }

    formattedAttributes.sort((a, b) => {
      const aIsPropertySet = a.key.startsWith('PropertySets.');
      const bIsPropertySet = b.key.startsWith('PropertySets.');
      
      if (aIsPropertySet && !bIsPropertySet) return -1;
      if (!aIsPropertySet && bIsPropertySet) return 1;
      
      if (aIsPropertySet && bIsPropertySet) {
        const aPsetName = a.key.split('.')[1] || '';
        const bPsetName = b.key.split('.')[1] || '';
        const psetComparison = aPsetName.localeCompare(bPsetName);
        
        if (psetComparison !== 0) return psetComparison;
        
        const aPropName = a.key.split('.').slice(2).join('.');
        const bPropName = b.key.split('.').slice(2).join('.');
        return aPropName.localeCompare(bPropName);
      }
      
      return a.key.localeCompare(b.key);
    });

    return formattedAttributes;
  }

  static getModel(): any {
    return this.model;
  }
}

