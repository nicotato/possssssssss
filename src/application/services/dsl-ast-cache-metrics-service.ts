import { DslAstCache, AstCacheEntry } from '../../domain/promotions/dsl/ast-cache.js';

export class DslAstCacheMetricsService {
  constructor(private cache: DslAstCache) {}

  getMetrics() {
    const stats = this.cache.stats();
    const entries = this.cacheInternalEntries();
    return {
      size: stats.size,
      totalHits: stats.totalHits,
      entries: entries.map((e:AstCacheEntry) => ({
        key: e.key,
        hits: e.hits,
        ageMs: Date.now() - e.createdAt
      }))
    };
  }

  clear() {
    this.cache.clear();
  }

  // Acceso controlado (reflection interna)
  private cacheInternalEntries(): AstCacheEntry[] {
    // @ts-ignore acceder a propiedad privada (si se desea se expone formalmente en el cache)
    return Array.from(this.cache.map.values());
  }
}