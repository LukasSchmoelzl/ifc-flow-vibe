import { IfcEntity } from './entity-types';

export class EntityExtractor {
  static extractEntity(item: any, expressId: number): IfcEntity {
    const name = item.Name?.value || `Element_${expressId}`;
    const globalId = item._guid?.value || item.GlobalId?.value || `GUID_${expressId}`;
    const type = item._category?.value || 'IFCELEMENT';

    return {
      expressID: expressId,
      type: type,
      name: name,
      globalId: globalId,
      properties: item
    };
  }
  
  static extractEntities(itemsData: any[], itemIds: number[]): IfcEntity[] {
    return itemsData.map((item, index) => {
      const expressId = itemIds[index];
      return this.extractEntity(item, expressId);
    });
  }
}

export class EntityFilter {
  static byTextQuery(entities: IfcEntity[], query: string): IfcEntity[] {
    if (!query) return entities;
    
    const normalizedQuery = query.toLowerCase();
    return entities.filter(entity =>
      entity.name?.toLowerCase().includes(normalizedQuery) ||
      entity.type.toLowerCase().includes(normalizedQuery)
    );
  }

  static byTypes(entities: IfcEntity[], types: string[]): IfcEntity[] {
    if (!types?.length) return entities;
    
    return entities.filter(entity => 
      types.some(type => entity.type.toLowerCase().includes(type.toLowerCase()))
    );
  }

  static paginate(entities: IfcEntity[], offset?: number, limit?: number): IfcEntity[] {
    if (!offset && !limit) return entities;
    
    const start = offset || 0;
    const end = limit ? start + limit : undefined;
    return entities.slice(start, end);
  }
}

