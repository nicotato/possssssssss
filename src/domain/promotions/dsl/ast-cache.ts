/**
 * Cache LRU simple para AST de la DSL de promociones.
 * - key: string (hash de promo.id + dsl)
 * - value: AST resultante parsePromoDsl()
 */
export interface AstCacheEntry {
  key: string;
  ast: any;
  createdAt: number;
  hits: number;
}

export class DslAstCache {
  private map = new Map<string, AstCacheEntry>();
  constructor(private maxEntries = 200) {}

  get(key: string) {
    const entry = this.map.get(key);
    if (entry) {
      entry.hits++;
      return entry.ast;
    }
    return null;
  }

  set(key: string, ast: any) {
    if (this.map.size >= this.maxEntries) {
      // política simple: remover el de menos hits
      let lfuKey: string | null = null;
      let minHits = Number.MAX_SAFE_INTEGER;
      for (const [k, v] of this.map.entries()) {
        if (v.hits < minHits) {
          minHits = v.hits;
            lfuKey = k;
        }
      }
      if (lfuKey) this.map.delete(lfuKey);
    }
    this.map.set(key, {
      key,
      ast,
      createdAt: Date.now(),
      hits: 1
    });
  }

  stats() {
    let totalHits = 0;
    for (const e of this.map.values()) totalHits += e.hits;
    return {
      size: this.map.size,
      totalHits
    };
  }

  clear() {
    this.map.clear();
  }
}

// Helper de hash rápido (no criptográfico)
export function fastHash(str: string): string {
  let h = 0, i = 0; const len = str.length;
  while (i < len) {
    h = (h << 5) - h + str.charCodeAt(i++) | 0;
  }
  return (h >>> 0).toString(16);
}