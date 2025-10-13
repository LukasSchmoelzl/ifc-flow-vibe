const MAX_CACHE_SIZE = 1000;

export class EntityCache {
  private cache = new Map<string, unknown>();
  private accessOrder = new Map<string, number>();
  private accessCounter = 0;

  set<T>(key: string, data: T): void {
    if (this.cache.size >= MAX_CACHE_SIZE && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, data);
    this.accessOrder.set(key, ++this.accessCounter);
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestAccess = Infinity;

    for (const [key, access] of this.accessOrder) {
      if (access < oldestAccess) {
        oldestAccess = access;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.accessOrder.delete(oldestKey);
    }
  }

  get<T>(key: string): T | null {
    const value = this.cache.get(key);
    if (value) {
      this.accessOrder.set(key, ++this.accessCounter);
      return value as T;
    }
    return null;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder.clear();
    this.accessCounter = 0;
  }

  size(): number {
    return this.cache.size;
  }
}

export const entityCache = new EntityCache();

