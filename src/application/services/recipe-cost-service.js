import { nowIso } from '../../domain/utils/time.js';

export class RecipeCostService {
  constructor(recipeRepo, ingredientRepo, audit) {
    this.recipeRepo = recipeRepo;
    this.ingredientRepo = ingredientRepo;
    this.audit = audit;
  }

  async recalcProductCost(productId) {
    const recipeDoc = await this.recipeRepo.col.findOne(productId).exec();
    if(!recipeDoc) return null;
    const recipe = recipeDoc.toJSON();
    const cost = await this._computeCost(recipe);
    await recipeDoc.incrementalPatch({ lastCostCalc: cost, updatedAt: nowIso() });
    await this.audit.log('RECIPE_RECALC', { productId, cost });
    return cost;
  }

  async _computeCost(recipe) {
    let total = 0;
    for(const comp of recipe.components) {
      const ingDoc = await this.ingredientRepo.col.findOne(comp.ingredientId).exec();
      if(!ingDoc) continue;
      const ing = ingDoc.toJSON();
      total += comp.qty * (ing.avgCost || 0);
    }
    return recipe.yield ? +(total / recipe.yield).toFixed(4) : +total.toFixed(4);
  }
}