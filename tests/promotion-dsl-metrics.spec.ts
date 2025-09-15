import { describe, it, expect, vi } from 'vitest';
vi.mock('../src/domain/promotions/dsl/parser-adapter.ts', () => {
  return {
    defaultDslParser: { parse: (dsl:string)=> { throw new Error('should not use default'); } }
  };
});
import { PromotionRuleEngine } from '../src/application/services/promotion-rule-engine-dsl.ts';
import { DslAstCache } from '../src/domain/promotions/dsl/ast-cache.js';
import { DslAstCacheMetricsService } from '../src/application/services/dsl-ast-cache-metrics-service.ts';
import type { DslParser } from '../src/domain/promotions/dsl/parser-adapter.ts';

// Minimal jsonLogic mock
const jsonLogic = { apply: (logic:any, context:any)=> {
  if(logic && logic.if){
    const [cond, thenVal] = logic.if;
    if(Array.isArray(cond['>'])){
      const left = cond['>'][0];
      if(typeof left === 'object' && left.var){
        const vName = left.var;
        const val = context[vName];
        if(val > cond['>'][1]) return thenVal;
      }
    }
  }
  return null;
}};

describe('PromotionRuleEngine + DSL cache metrics', () => {
  it('evalúa jsonLogic y cachea AST de DSL válido', () => {
  const cache = new DslAstCache(100);
  const parser: DslParser = { parse: (dsl:string)=> ({ rules:[{ condition:{ type:'cartMetric', metric:'total', op:'>', value:50 }, action:{ type:'discountPercentCart', percent:5 }, label:'mock' }] }) };
  const engine = new PromotionRuleEngine(jsonLogic, cache, parser);
    const promo = { id:'pr1', name:'Promo DSL', logic:{ if:[ { '>':[ { var:'cartTotal' }, 100 ] }, { discountPercentCart:5 }, null ] }, dsl: 'WHEN total > 50 THEN discountPercentCart=5' } as any;
    const events = engine.evaluate(promo, { cartTotal:120, lines:[] });
    expect(events.length).toBeGreaterThan(0);
    // segunda evaluación para incrementar hits
    engine.evaluate(promo, { cartTotal:80, lines:[] });
    const metrics = new DslAstCacheMetricsService(cache).getMetrics();
    expect(metrics.size).toBe(1);
    expect(metrics.entries[0].hits).toBeGreaterThanOrEqual(1);
  });

  it('tolera DSL inválido y no rompe ejecución', () => {
  const cache = new DslAstCache(50);
  const parser: DslParser = { parse: ()=> { throw new Error('fail'); } };
  const engine = new PromotionRuleEngine(jsonLogic, cache, parser);
  const badPromo = { id:'bad', name:'Bad', dsl:'whatever' } as any;
    const events = engine.evaluate(badPromo, { cartTotal:10, lines:[] });
    expect(events.length).toBe(0);
    const metrics = new DslAstCacheMetricsService(cache).getMetrics();
    expect(metrics.size).toBe(0); // no se insertó nada
  });
});
