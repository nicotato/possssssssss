import { describe, it, expect } from 'vitest';
import { PromotionService } from '../src/application/services/promotion-service-advanced.js';
import { PromotionRuleEngine } from '../src/application/services/promotion-rule-engine.js';

function mockPromoRepo(list:any[]) {
  return {
    active: async () => list
  };
}

describe('Promotion Engine', () => {
  it('aplica discountPercentCart de JSONLogic', async () => {
    const promos = [{
      id:'pr1',
      name:'10% si total > 1000',
      type:'CUSTOM',
      active:true,
      stackable:true,
      logic: {
        if: [
          { '>':[ { 'var':'cartTotal' }, 1000 ] },
          { discountPercentCart: 10 },
          null
        ]
      }
    }];
    const service = new PromotionService(mockPromoRepo(promos), new PromotionRuleEngine());
    const lines = [
      { productId:'p1', name:'A', qty:2, unitPrice:600, lineTotal:1200 }
    ];
    const result = await service.applyPromotions(lines, 'b_centro');
    expect(result.promotionDiscountTotal).toBeGreaterThan(0);
    // 10% sobre 1200 = 120
    expect(result.promotionDiscountTotal).toBe(120);
    expect(result.lines[0].lineTotal).toBe(1080);
  });

  it('respeta exclusiones', async () => {
    const promos = [
      {
        id:'pA',
        name:'Base 5%',
        type:'CUSTOM',
        active:true,
        stackable:true,
        logic:{ discountPercentCart:5 }
      },
      {
        id:'pB',
        name:'Promo Excluye pA',
        type:'CUSTOM',
        active:true,
        excludes:['pA'],
        logic:{ discountPercentCart:10 }
      }
    ];
    const service = new PromotionService(mockPromoRepo(promos), new PromotionRuleEngine());
    const lines = [{ productId:'p1', name:'Prod', qty:1, unitPrice:1000, lineTotal:1000 }];
    const result = await service.applyPromotions(lines, 'b_centro');
    // pA se aplica primero => 5% (50). pB excluye pA → no se aplica.
    expect(result.promotionDiscountTotal).toBe(50);
  });
});