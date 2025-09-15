export class RecipeVariantService {
  constructor(variantRepo) {
    this.variantRepo = variantRepo;
  }

  async findActiveVariant(productId, whenIso = new Date().toISOString()) {
    const docs = await this.variantRepo.col.find({ selector:{ productId, active:true } }).exec();
    const variants = docs.map(d=>d.toJSON())
      .filter(v => (!v.activeFrom || v.activeFrom <= whenIso) &&
                   (!v.activeTo || v.activeTo >= whenIso))
      .sort((a,b)=> (b.priority||0) - (a.priority||0));
    return variants[0] || null;
  }
}