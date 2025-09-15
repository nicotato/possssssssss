import { generateId } from '../../domain/utils/id.js';
import { nowIso } from '../../domain/utils/time.js';

export class SimulationRunService {
  constructor(
    private repo: any,
    private audit: any,
    private auth: any
  ) {}

  async persistSimulation(input:any, result:any, extraTags:string[] = []) {
    const scenarioHash = this.repo.computeHash(input);
    const metrics = {
      grandTotalBase: result.grandTotalBase,
      discountTotal: result.discountTotal,
      promotionDiscountTotal: result.promotionDiscountTotal,
      taxTotal: result.taxTotal,
      tipAmount: result.tipAmount,
      costVarianceBase: result.costVarianceBase
    };
    const run = {
      id: generateId('sim_'),
      createdAt: nowIso(),
      scenarioHash,
      scenarioInput: input,
      result,
      metrics,
      tags: extraTags,
      user: this.auth?.getUsername ? this.auth.getUsername() : 'system'
    };
    await this.repo.create(run);
    await this.audit.log('SIMULATION_RUN_CREATE', { scenarioHash, id: run.id });
    return run;
  }
}