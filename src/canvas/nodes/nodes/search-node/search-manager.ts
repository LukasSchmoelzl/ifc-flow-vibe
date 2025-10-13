import { EntityAccessLayer } from '@/src/core/entity-access-layer';

export class SearchManager {
  async search(params: {
    query?: string;
    types?: string[];
    offset?: number;
    limit?: number;
  }) {
    const entities = await EntityAccessLayer.searchEntities({
      query: params.query,
      types: params.types,
      offset: params.offset || 0,
      limit: params.limit
    });

    return entities.map(entity => ({
      name: entity.name || entity.type || 'Unnamed',
      expressID: entity.expressID,
      type: entity.type
    }));
  }

  async count(types?: string[]) {
    const typesToCount = types || await EntityAccessLayer.getAvailableTypes();
    const counts: Record<string, number> = {};

    for (const type of typesToCount) {
      const entities = await EntityAccessLayer.searchEntities({ types: [type] });
      counts[type] = entities.length;
    }

    return counts;
  }

  async getAvailableTypes() {
    return await EntityAccessLayer.getAvailableTypes();
  }
}

