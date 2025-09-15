import { describe, it, expect, vi } from 'vitest';
vi.mock('../src/domain/promotions/dsl/parser-adapter.ts', () => ({
  defaultDslParser: { parse: () => { throw new Error('unused default'); } }
}));
import { PromotionRuleEngine } from '../src/application/services/promotion-rule-engine-dsl.ts';
import { DslAstCache } from '../src/domain/promotions/dsl/ast-cache.js';
import type { DslParser } from '../src/domain/promotions/dsl/parser-adapter.ts';

const jsonLogic = { apply: () => null };

describe('PromotionRuleEngine DSL buyXGetY', () => {
  it('emite evento buyXGetY cuando condición pasa', () => {
    const cache = new DslAstCache(20);
    const parser: DslParser = { parse: () => ({ rules:[{ condition:{ type:'cartMetric', metric:'total', op:'>', value:10 }, action:{ type:'buyXGetY', productId:'SKU1', buyQty:2, getQty:1 } }] }) };
    const engine = new PromotionRuleEngine(jsonLogic, cache, parser);
    const promo = { id:'bgy', name:'Buy 2 Get 1', dsl:'irrelevant' } as any;
    const events = engine.evaluate(promo, { lines:[{ lineTotal:15 }] });
    expect(events.length).toBe(1);
    expect(events[0].type).toBe('buyXGetY');
    // verificar cache
    const second = engine.evaluate(promo, { lines:[{ lineTotal:5 }] });
    expect(second.length).toBe(0); // condición no pasa
  });
});
