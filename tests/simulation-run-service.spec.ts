import { describe, it, expect } from 'vitest';
import { SimulationRunService as BaseSimService } from '../src/application/services/simulation-run-service.ts';
import { SimulationRunService as ExtSimService } from '../src/application/services/simulation-run-service-extend.ts';

function makeRepo() {
  const store:any[] = [];
  return {
    data: store,
    computeHash: (input:any) => JSON.stringify(input).length.toString(16),
    create: async (doc:any) => { store.push(doc); return doc; },
    col: { findOne: (id:string) => ({ exec: async () => ({ toJSON: () => store.find(d=>d.id===id) }) }) }
  };
}

const audit = { log: async ()=>{} };
const auth = { getUsername: ()=>'tester' };

// Fake promotionSimulationService
const promoSim = { simulate: async ({ persist }:any)=> ({ grandTotalBase:10, discountTotal:1, promotionDiscountTotal:1, taxTotal:0.5, tipAmount:0, costVarianceBase:0, persist }) };

describe('SimulationRunService basic persist', () => {
  it('persiste run básico con métricas derivadas', async () => {
    const repo = makeRepo();
    const svc = new BaseSimService(repo, audit, auth);
    const input = { items:[{ id:'A', qty:1 }] };
    const result = { grandTotalBase:10, discountTotal:1, promotionDiscountTotal:1, taxTotal:0.5, tipAmount:0, costVarianceBase:0 };
    const run = await svc.persistSimulation(input, result, ['test']);
    expect(run.id).toMatch(/^sim_/);
    expect(repo.data.length).toBe(1);
    expect(run.metrics.grandTotalBase).toBe(10);
  });
});

describe('SimulationRunService reSimulate flow', () => {
  it('reSimulate crea replay cuando persist true', async () => {
    const repo = makeRepo();
    const ext = new ExtSimService(repo, audit, auth, promoSim);
    // seed original run similar a persistSimulation (simplificado)
    const baseResult = await promoSim.simulate({ persist:false });
    const orig = await ext.persistSimulation({ items:[{id:'X',qty:2}] }, baseResult, ['orig']);
    const { replaySaved } = await ext.reSimulate(orig.id, { persist:true, tag:'replay' });
    expect(replaySaved).toBeTruthy();
    expect(repo.data.length).toBe(2);
  });
});
