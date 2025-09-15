"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DslAstCache = void 0;
exports.fastHash = fastHash;
var DslAstCache = /** @class */ (function () {
    function DslAstCache(maxEntries) {
        if (maxEntries === void 0) { maxEntries = 200; }
        this.maxEntries = maxEntries;
        this.map = new Map();
    }
    DslAstCache.prototype.get = function (key) {
        var entry = this.map.get(key);
        if (entry) {
            entry.hits++;
            return entry.ast;
        }
        return null;
    };
    DslAstCache.prototype.set = function (key, ast) {
        if (this.map.size >= this.maxEntries) {
            // política simple: remover el de menos hits
            var lfuKey = null;
            var minHits = Number.MAX_SAFE_INTEGER;
            for (var _i = 0, _a = this.map.entries(); _i < _a.length; _i++) {
                var _b = _a[_i], k = _b[0], v = _b[1];
                if (v.hits < minHits) {
                    minHits = v.hits;
                    lfuKey = k;
                }
            }
            if (lfuKey)
                this.map.delete(lfuKey);
        }
        this.map.set(key, {
            key: key,
            ast: ast,
            createdAt: Date.now(),
            hits: 1
        });
    };
    DslAstCache.prototype.stats = function () {
        var totalHits = 0;
        for (var _i = 0, _a = this.map.values(); _i < _a.length; _i++) {
            var e = _a[_i];
            totalHits += e.hits;
        }
        return {
            size: this.map.size,
            totalHits: totalHits
        };
    };
    DslAstCache.prototype.clear = function () {
        this.map.clear();
    };
    return DslAstCache;
}());
exports.DslAstCache = DslAstCache;
// Helper de hash rápido (no criptográfico)
function fastHash(str) {
    var h = 0, i = 0, len = str.length;
    while (i < len) {
        h = (h << 5) - h + str.charCodeAt(i++) | 0;
    }
    return (h >>> 0).toString(16);
}
