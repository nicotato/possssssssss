export class CostComputationService {
  constructor(recipeRepo, variantService, ingredientRepo, audit) {
    this.recipeRepo = recipeRepo;
    this.variantService = variantService;
    this.ingredientRepo = ingredientRepo;
    this.audit = audit;
  }

  async computeCostsForLine(productId, qty) {
    // std
    const recipeDoc = await this.recipeRepo.col.findOne(productId).exec();
    if(!recipeDoc) return { stdUnit:0, realUnit:0 };
    const recipe = recipeDoc.toJSON();

    const variant = await this.variantService.findActiveVariant(productId);
    const baseComponents = variant ? variant.components : recipe.components;
    const yieldVal = variant ? variant.yield : recipe.yield;

    const stdUnit = await this._computeComponentCost(recipe.components, recipe.yield);
    const realUnit = await this._computeComponentCost(baseComponents, yieldVal);

    if(Math.abs(realUnit - stdUnit) > 0.0001) {
      await this.audit.log('COST_VARIANCE_DETECTED', { productId, stdUnit, realUnit });
    }
    return { stdUnit, realUnit, varianceUnit: +(realUnit - stdUnit).toFixed(4) };
  }

  async _computeComponentCost(components, yieldVal) {
    let total = 0;
    for(const c of components) {
      const ingDoc = await this.ingredientRepo.col.findOne(c.ingredientId).exec();
      if(!ingDoc) continue;
      const ing = ingDoc.toJSON();
      total += c.qty * (ing.avgCost || 0);
    }
    return yieldVal ? +(total / yieldVal).toFixed(4) : +total.toFixed(4);
  }
}