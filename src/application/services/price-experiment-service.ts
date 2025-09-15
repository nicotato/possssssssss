export class PriceExperimentService {
  constructor(
    private repo:any,
    private auth:any,
    private audit:any
  ) {}

  async recordExperiment({ productId, base, scenarios, modelVersion='v1', tags=[], notes='' }: { productId:string; base:any; scenarios:any[]; modelVersion?:string; tags?:string[]; notes?:string; }) {
    const data = {
      productId,
      base,
      scenarios,
      modelVersion,
      tags,
      notes,
      user: this.auth?.getUsername ? this.auth.getUsername() : 'system'
    };
    const created = await this.repo.create(data);
    await this.audit.log('PRICE_EXPERIMENT_CREATE', { productId, id: created.id });
    return created;
  }

  async listRecent(limit=50) {
    return this.repo.recent(limit);
  }
}