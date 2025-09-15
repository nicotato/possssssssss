"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DslAstCacheMetricsService = void 0;
var DslAstCacheMetricsService = /** @class */ (function () {
    function DslAstCacheMetricsService(cache) {
        this.cache = cache;
    }
    DslAstCacheMetricsService.prototype.getMetrics = function () {
        var stats = this.cache.stats();
        var entries = this.cacheInternalEntries();
        return {
            size: stats.size,
            totalHits: stats.totalHits,
            entries: entries.map(function (e) { return ({
                key: e.key,
                hits: e.hits,
                ageMs: Date.now() - e.createdAt
            }); })
        };
    };
    DslAstCacheMetricsService.prototype.clear = function () {
        this.cache.clear();
    };
    // Acceso controlado (reflection interna)
    DslAstCacheMetricsService.prototype.cacheInternalEntries = function () {
        // @ts-ignore acceder a propiedad privada (si se desea se expone formalmente en el cache)
        return Array.from(this.cache.map.values());
    };
    return DslAstCacheMetricsService;
}());
exports.DslAstCacheMetricsService = DslAstCacheMetricsService;
