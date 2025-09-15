import { describe, it, expect } from 'vitest';

function mockRecipeRepo(cost:number) {
  return {
    col: {
  findOne: (productId:string) => ({
        exec: async () => ({
          toJSON: () => ({
            components:[{ ingredientId:'i1', qty:1 }],
            yield:1
          })
        })
      })
    }
  };
}
function mockVariantService() {
  return {
    findActiveVariant: async () => null
  };
}
function mockIngredientRepo(avgCost:number) {
  return {
    col: {
  findOne: (ingredientId:string) => ({
        exec: async () => ({
          toJSON: () => ({ avgCost })
        })
      })
    }
  };
}
function mockAudit() { return { log: async ()=>{} }; }

import { CostComputationService } from '../src/application/services/cost-computation-service.js';

describe('CostComputationService', () => {
  it('calcula costo std y real iguales si no hay variante', async () => {
    const svc = new CostComputationService(
      mockRecipeRepo(12),
      mockVariantService(),
      mockIngredientRepo(10),
      mockAudit()
    );
    const { stdUnit, realUnit, varianceUnit } = await svc.computeCostsForLine('p1', 1);
    expect(stdUnit).toBe(10);
    expect(realUnit).toBe(10);
    expect(varianceUnit).toBe(0);
  });
});